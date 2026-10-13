var e={id:`lab-vlan-missing`,h:{en:`Lab: cp-vlan-missing, the role points at a VLAN that does not exist`,hi:`Lab: cp-vlan-missing, role aise VLAN par point karta hai jo exist nahi karta`},body:{en:`
<p>Imagine a courier delivering to "Flat 20, Block C" after the whole Block C was demolished during a clean-up. The courier is correct, the address on the parcel is correct, and the parcel still cannot be delivered. This lab is exactly that. ClearPass does everything right and still contractors cannot connect, because the switch role CONTRACTOR points at VLAN 20 and VLAN 20 was deleted over the weekend.</p>

<h3>The ticket</h3>
<p>"Contractors cannot connect since the weekend." LAPTOP2 (user bob, port 1/1/4) is the test device. The lab has three tasks: read the role status on the switch, recreate VLAN 20, and then fix the second problem hidden behind the first, the uplink trunk.</p>

<h3>Step 1: decide which side owns the fault</h3>
<p>Use the triage method. First ask ClearPass: does it have an ACCEPT for bob?</p>
<pre class="out">CPPM# monitoring access-tracker detail bob summary
  Login Status              : <span class="hl">ACCEPT</span>
  Username                  : bob
  Service                   : Wired 802.1X
  Roles                     : CONTRACTOR
  Enforcement Profiles      : EP-CONTRACTOR</pre>
<p>Stages 1 to 6 are healthy: bob is accepted with the right role and profile. So the fault is on the switch, stage 7. Do <b>not</b> touch the ClearPass policy. Look at the client on the switch.</p>
<pre class="out">ACCESS# show port-access clients detail
Client 00:50:2f:e9:9a:02, bob
   Port           : 1/1/4
   Authorization Details
   ----------------------
   Role           : CONTRACTOR
   Status         : <span class="hl">Not applied (VLAN 20 does not exist on the switch (role CONTRACTOR))</span>
   VLAN           : -</pre>
<p>The switch received the role name and found the role, but it cannot apply it. This is the evidence.</p>

<h3>Step 2: read the role</h3>
<pre class="out">ACCESS# show port-access role CONTRACTOR
Role Name : CONTRACTOR
Type      : Local
Status    : <span class="hl">Incomplete (VLAN 20 does not exist)</span>
------------------------------------------------------------
Access VLAN     : 20</pre>
<p>A role is a bundle of settings on the switch; if it refers to a VLAN the switch does not have, the role is <b>incomplete</b> and cannot be applied. This is a very common result of VLAN clean-ups: the VLAN looks unused in <code>show vlan</code> because no access port is configured in it, but roles use it dynamically.</p>

<h3>Step 3: recreate the VLAN</h3>
<pre class="code"><span class="c">! Lab shell on ACCESS (AOS-CX style)</span>
ACCESS# configure terminal
ACCESS(config)# vlan 20
ACCESS(config-vlan-20)# name CONTRACTOR
ACCESS(config-vlan-20)# exit</pre>
<p>Now the role is completed and the client is authorized. Re-check:</p>
<pre class="out">ACCESS# show port-access clients
Port   MAC-Address         User   Method   Status     Role         VLAN
1/1/4  00:50:2f:e9:9a:02   bob    dot1x    Authorized CONTRACTOR   <span class="hl">20</span></pre>
<p>Is the user happy? No: the client is authorized but, on LAPTOP2, <code>ip dhcp</code> returns no address. This is the second problem, one layer deeper. Never stop at the first green light.</p>

<h3>Step 4: the trunk</h3>
<p>The client lives in VLAN 20 on ACCESS. The DHCP server is behind R1, reached over the trunk 1/1/1 to R1 GigabitEthernet0/0. A VLAN must be <b>allowed on the trunk</b> or its frames never reach R1, so DHCP never answers. During the clean-up, VLAN 20 was removed from the allowed list too.</p>
<pre class="code">ACCESS(config)# interface 1/1/1
ACCESS(config-if)# vlan trunk allowed 10,20,30,40,50,99
ACCESS(config-if)# exit</pre>
<p>Now renew the address and prove reachability.</p>
<pre class="out">LAPTOP2&gt; ip dhcp
DHCP: address 10.20.20.x/24 from 10.20.20.1
LAPTOP2&gt; ping 10.20.70.20
<span class="hl">Reply from 10.20.70.20</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Layers of the fault">
<rect x="10" y="20" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="75" y="68" text-anchor="middle" class="svg-muted" font-size="11">ACCEPT, CONTRACTOR</text>
<rect x="170" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="240" y="44" text-anchor="middle" class="svg-ink" font-size="13">Switch role</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20 deleted</text>
<rect x="340" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="410" y="44" text-anchor="middle" class="svg-ink" font-size="13">Trunk 1/1/1</text><text x="410" y="64" text-anchor="middle" class="svg-muted" font-size="11">20 not allowed</text>
<rect x="510" y="20" width="120" height="70" rx="8" fill="#e2e8f0"/><text x="570" y="44" text-anchor="middle" class="svg-ink" font-size="13">R1 / DHCP</text><text x="570" y="64" text-anchor="middle" class="svg-muted" font-size="11">APP1 reachable</text>
<line x1="140" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="340" y2="55" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Two faults in a row: fix one, retest, find the next.</text>
</svg><p class="cap">The fault sat in two layers behind a healthy ClearPass.</p></div>

<h3>Why layered faults matter</h3>
<p>Many real incidents are not one fault but a <b>chain</b>. The first fix reveals the second. The skill is to define "done" as the end-to-end result (address in VLAN 20, ping to APP1), not as the disappearance of the first error message.</p>

<div class="eg"><p><b>Worked example.</b> Done criteria for this ticket: (1) <code>show port-access clients</code> shows bob Authorized, role CONTRACTOR, VLAN 20; (2) LAPTOP2 has an address in 10.20.20.0/24; (3) ping 10.20.70.20 answers; (4) LAPTOP1, in VLAN 10, is unaffected. Four checks, written down before you start fixing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Editing the ClearPass profile to return a different VLAN ("use 10 for contractors") to bypass the missing VLAN. It breaks segmentation and hides the real fault. Also: do not rename the VLAN or change its number; roles reference the number.</p></div>

<div class="exam"><p><b>Exam trap.</b> A role is only a name until the switch can fully apply it: the name must match exactly, and the VLAN must exist. A dynamic VLAN must also be allowed on the uplink trunk for DHCP and routing to work.</p></div>

<div class="scn"><h4>The "unused VLAN" clean-up</h4><p>A network team removed VLANs with no ports configured in them. Five minutes later contractors, printers and a camera team opened tickets. Roles, not ports, used those VLANs. The team recreated the VLANs from the change record and added them to the uplink trunks.</p><p><b>Lesson:</b> before removing a VLAN, search the roles (<code>show port-access role</code>), the trunk allowed lists and the ClearPass profiles that return it.</p></div>

<div class="iv"><p class="q">"ClearPass shows Accept, but the user has no address. What now?"</p><p>I treat it as a switch-side problem. I check the client status for the role result, the role status for a missing VLAN, the VLAN on the switch, the trunk allowed list towards the DHCP relay, and then DHCP itself. I prove it with an address and a ping to the application.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>ACCEPT in ClearPass plus no access means troubleshoot the switch.</li>
<li><code>show port-access role NAME</code> shows Incomplete when its VLAN is missing.</li>
<li>Recreate the VLAN with the same number and name, then check the uplink trunk.</li>
<li>Faults can be chained; define done as an address and a working ping.</li>
<li>Do not change ClearPass policy to work around a switch fault.</li>
</ul></div>
`,hi:`
<p>Socho ek courier "Flat 20, Block C" par delivery kar raha hai, jabki clean-up mein poora Block C tod diya gaya. Courier sahi hai, parcel par address sahi hai, aur phir bhi parcel deliver nahi ho sakta. Yeh lab bilkul aisa hi hai. ClearPass sab kuch sahi karta hai aur phir bhi contractors connect nahi ho paate, kyunki switch role CONTRACTOR VLAN 20 par point karta hai aur VLAN 20 weekend mein delete ho gaya.</p>

<h3>Ticket</h3>
<p>"Contractors weekend se connect nahi ho paa rahe." LAPTOP2 (user bob, port 1/1/4) test device hai. Lab mein teen tasks hain: switch par role status padho, VLAN 20 dobara banao, aur phir pehli problem ke peeche chhupi doosri problem fix karo, uplink trunk.</p>

<h3>Step 1: tay karo fault kis side ka hai</h3>
<p>Triage method use karo. Pehle ClearPass se poochho: kya bob ke liye ACCEPT hai?</p>
<pre class="out">CPPM# monitoring access-tracker detail bob summary
  Login Status              : <span class="hl">ACCEPT</span>
  Username                  : bob
  Service                   : Wired 802.1X
  Roles                     : CONTRACTOR
  Enforcement Profiles      : EP-CONTRACTOR</pre>
<p>Stages 1 se 6 healthy hain: bob sahi role aur profile ke saath accept hua hai. To fault switch par hai, stage 7. ClearPass policy ko <b>mat</b> chhedo. Switch par client dekho.</p>
<pre class="out">ACCESS# show port-access clients detail
Client 00:50:2f:e9:9a:02, bob
   Port           : 1/1/4
   Authorization Details
   ----------------------
   Role           : CONTRACTOR
   Status         : <span class="hl">Not applied (VLAN 20 does not exist on the switch (role CONTRACTOR))</span>
   VLAN           : -</pre>
<p>Switch ko role name mila aur role mil gaya, par woh use apply nahi kar sakta. Yahi evidence hai.</p>

<h3>Step 2: role padho</h3>
<pre class="out">ACCESS# show port-access role CONTRACTOR
Role Name : CONTRACTOR
Type      : Local
Status    : <span class="hl">Incomplete (VLAN 20 does not exist)</span>
------------------------------------------------------------
Access VLAN     : 20</pre>
<p>Role switch par settings ka ek bundle hai; agar woh aise VLAN ko refer kare jo switch ke paas nahi, to role <b>incomplete</b> hai aur apply nahi ho sakta. VLAN clean-ups ka yeh bahut common result hai: VLAN <code>show vlan</code> mein unused lagta hai kyunki koi access port usme configured nahi, par roles use dynamically use karte hain.</p>

<h3>Step 3: VLAN dobara banao</h3>
<pre class="code"><span class="c">! Lab shell on ACCESS (AOS-CX style)</span>
ACCESS# configure terminal
ACCESS(config)# vlan 20
ACCESS(config-vlan-20)# name CONTRACTOR
ACCESS(config-vlan-20)# exit</pre>
<p>Ab role completed hai aur client authorized. Dobara check karo:</p>
<pre class="out">ACCESS# show port-access clients
Port   MAC-Address         User   Method   Status     Role         VLAN
1/1/4  00:50:2f:e9:9a:02   bob    dot1x    Authorized CONTRACTOR   <span class="hl">20</span></pre>
<p>Kya user khush hai? Nahi: client authorized hai par LAPTOP2 par <code>ip dhcp</code> koi address nahi deta. Yeh doosri problem hai, ek layer aur neeche. Pehli green light par kabhi mat ruko.</p>

<h3>Step 4: trunk</h3>
<p>Client ACCESS par VLAN 20 mein rehta hai. DHCP server R1 ke peeche hai, jo trunk 1/1/1 se R1 GigabitEthernet0/0 tak pahunchta hai. VLAN ko <b>trunk par allowed</b> hona chahiye warna uske frames R1 tak nahi pahunchte, aur DHCP kabhi jawab nahi deta. Clean-up mein VLAN 20 allowed list se bhi hata diya gaya tha.</p>
<pre class="code">ACCESS(config)# interface 1/1/1
ACCESS(config-if)# vlan trunk allowed 10,20,30,40,50,99
ACCESS(config-if)# exit</pre>
<p>Ab address renew karo aur reachability prove karo.</p>
<pre class="out">LAPTOP2&gt; ip dhcp
DHCP: address 10.20.20.x/24 from 10.20.20.1
LAPTOP2&gt; ping 10.20.70.20
<span class="hl">Reply from 10.20.70.20</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Layers of the fault">
<rect x="10" y="20" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="75" y="48" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="75" y="68" text-anchor="middle" class="svg-muted" font-size="11">ACCEPT, CONTRACTOR</text>
<rect x="170" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="240" y="44" text-anchor="middle" class="svg-ink" font-size="13">Switch role</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20 deleted</text>
<rect x="340" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="410" y="44" text-anchor="middle" class="svg-ink" font-size="13">Trunk 1/1/1</text><text x="410" y="64" text-anchor="middle" class="svg-muted" font-size="11">20 allowed nahi</text>
<rect x="510" y="20" width="120" height="70" rx="8" fill="#e2e8f0"/><text x="570" y="44" text-anchor="middle" class="svg-ink" font-size="13">R1 / DHCP</text><text x="570" y="64" text-anchor="middle" class="svg-muted" font-size="11">APP1 reachable</text>
<line x1="140" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="340" y2="55" stroke="#64748b" stroke-width="2"/><line x1="480" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Do faults line se: ek fix karo, retest karo, agla dhoondho.</text>
</svg><p class="cap">Healthy ClearPass ke peeche fault do layers mein tha.</p></div>

<h3>Layered faults kyon matter karte hain</h3>
<p>Bahut se real incidents ek fault nahi balki ek <b>chain</b> hote hain. Pehla fix doosra reveal karta hai. Skill yeh hai ki "done" ko end-to-end result maano (VLAN 20 mein address, APP1 tak ping), pehle error message ke gayab hone ko nahi.</p>

<div class="eg"><p><b>Worked example.</b> Is ticket ke done criteria: (1) <code>show port-access clients</code> mein bob Authorized, role CONTRACTOR, VLAN 20; (2) LAPTOP2 ko 10.20.20.0/24 mein address mila; (3) ping 10.20.70.20 jawab deta hai; (4) VLAN 10 mein LAPTOP1 unaffected hai. Chaar checks, fix shuru karne se pehle likhe hue.</p></div>

<div class="warn"><p><b>Common mistake.</b> Missing VLAN ko bypass karne ke liye ClearPass profile edit karke koi aur VLAN return karwana ("contractors ke liye 10 use karo"). Isse segmentation toot-ta hai aur asli fault chhup jaata hai. Aur: VLAN ka naam ya number mat badlo; roles number ko refer karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Role tab tak sirf ek naam hai jab tak switch use poori tarah apply na kar sake: naam exactly match hona chahiye, aur VLAN exist karna chahiye. Dynamic VLAN ko DHCP aur routing ke liye uplink trunk par bhi allowed hona chahiye.</p></div>

<div class="scn"><h4>"Unused VLAN" clean-up</h4><p>Ek network team ne woh VLANs hata diye jinme koi port configured nahi tha. Paanch minute baad contractors, printers aur camera team ne tickets khole. Un VLANs ko ports nahi, roles use karte the. Team ne VLANs change record se dobara banaye aur uplink trunks par add kiye.</p><p><b>Lesson:</b> VLAN hatane se pehle roles (<code>show port-access role</code>), trunk allowed lists aur woh ClearPass profiles search karo jo use return karte hain.</p></div>

<div class="iv"><p class="q">"ClearPass Accept dikhata hai, par user ko address nahi mila. Ab kya?"</p><p>Main ise switch-side problem maanta hoon. Role result ke liye client status, missing VLAN ke liye role status, switch par VLAN, DHCP relay ki taraf trunk allowed list, aur phir DHCP check karta hoon. Main address aur application tak ping se prove karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>ClearPass mein ACCEPT aur access nahi: switch troubleshoot karo.</li>
<li><code>show port-access role NAME</code> VLAN missing hone par Incomplete dikhata hai.</li>
<li>Wahi number aur naam ke saath VLAN dobara banao, phir uplink trunk check karo.</li>
<li>Faults chained ho sakte hain; done ka matlab address aur working ping.</li>
<li>Switch fault ko bypass karne ke liye ClearPass policy mat badlo.</li>
</ul></div>
`}};export{e as default};