var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: when the defences block the good guys`,hi:`Troubleshooting workflow: jab defences sahi logon ko hi block kar dein`},body:{en:`
<p>A new security guard who has just been handed a strict rulebook will stop intruders, but on day one he may also stop the CEO who forgot her badge and the delivery van that brings the lunch. The fix is not to fire the guard; it is to give him the right guest list. Layer 2 controls behave exactly like that guard. After a hardening rollout the most common ticket is not "we were attacked" but "a legitimate user or server stopped working". This chapter gives you a repeatable workflow and walks through Lab 5, where DHCP snooping, DAI and IP Source Guard lock out a PC and a server.</p>

<h3>Two kinds of blocking</h3>
<p>Every control in this module blocks in one of two ways, and knowing which saves hours:</p>
<ul>
<li><b>Loud blocking:</b> the port goes <b>err-disabled</b>. Port security (shutdown mode), BPDU guard, storm-control with action shutdown, DHCP snooping rate limits and DAI rate limits all do this. The link LED goes off and <code>show interfaces status err-disabled</code> names the reason.</li>
<li><b>Silent blocking:</b> the port stays up but specific packets are dropped. DHCP snooping on an untrusted port, DAI, IP Source Guard, port security in protect or restrict mode, root guard (root-inconsistent) and storm-control in its default drop action all do this. The link looks healthy; only counters and logs tell the truth.</li>
</ul>

<table class="cmp"><tr><th>Err-disable reason</th><th>Feature</th><th>Typical legitimate trigger</th></tr>
<tr><td>psecure-violation</td><td>Port security</td><td>Docking station, IP phone plus PC, replaced NIC</td></tr>
<tr><td>bpduguard</td><td>BPDU guard</td><td>Someone plugged a small switch into a desk port</td></tr>
<tr><td>storm-control</td><td>Storm-control</td><td>Loop through a desk hub, broken NIC</td></tr>
<tr><td>dhcp-rate-limit</td><td>DHCP snooping rate limit</td><td>Rate set too low on a port with many clients</td></tr>
<tr><td>arp-inspection</td><td>DAI rate limit (15 pps default)</td><td>Busy server or uplink left untrusted</td></tr></table>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Layer 2 security troubleshooting flow">
<rect x="20" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="110" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. Scope the problem</text>
<rect x="230" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. Port up or err-disabled?</text>
<rect x="440" y="20" width="180" height="44" rx="8" fill="#fed7aa"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">3a. err-disabled:</text><text x="530" y="56" text-anchor="middle" class="svg-muted" font-size="12">read the reason</text>
<rect x="440" y="110" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="530" y="130" text-anchor="middle" class="svg-ink" font-size="13">3b. up: silent drops</text><text x="530" y="146" text-anchor="middle" class="svg-muted" font-size="12">trust, bindings, counters</text>
<rect x="230" y="110" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">4. Fix the trust or binding</text>
<rect x="20" y="110" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="110" y="137" text-anchor="middle" class="svg-ink" font-size="13">5. Verify and document</text>
<line x1="200" y1="42" x2="230" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="42" x2="440" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="64" x2="530" y2="110" stroke="#64748b" stroke-width="2"/><line x1="440" y1="132" x2="410" y2="132" stroke="#64748b" stroke-width="2"/><line x1="230" y1="132" x2="200" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="13">Never "fix" by disabling the control</text>
</svg><p class="cap">Separate loud (err-disabled) from silent (dropped) blocking, then repair the trust boundary or the binding.</p></div>
<ol>
<li><b>Scope.</b> One host, one port, one VLAN or everyone? Everyone in a VLAN usually means a trust problem on the uplink. One host usually means a binding or a port-level violation.</li>
<li><b>Port state.</b> <code>show interfaces status</code> and <code>show interfaces status err-disabled</code>.</li>
<li><b>Loud:</b> map the reason to the feature (table above), find the cause before recovering. <b>Silent:</b> check <code>show ip dhcp snooping</code> (trusted ports), <code>show ip dhcp snooping binding</code>, <code>show ip arp inspection</code> (drop counters), <code>show ip verify source</code> (deny-all) and <code>show logging</code>.</li>
<li><b>Fix the design, not the symptom:</b> trust the real uplink, add a static binding, raise a rate limit, correct the port-security maximum.</li>
<li><b>Verify and document:</b> prove the legitimate host works and that the simulated attack is still blocked.</li>
</ol>

<h3>Lab 5 walkthrough: hardening locked out the good guys</h3>
<p>On ACC4, DHCP snooping, DAI (VLAN 10) and IP Source Guard (Gi0/1–2) are on. PC1 on Gi0/1 uses DHCP; SRV on Gi0/2 is static 10.0.10.50; GW on Gi0/24 is the DHCP server and gateway 10.0.10.1. Both hosts are broken. Scope: every host in the VLAN fails, so suspect the uplink trust first.</p>
<pre class="out">ACC4# show ip dhcp snooping
Switch DHCP snooping is enabled
DHCP snooping is configured on following VLANs:
10
DHCP snooping is operational on following VLANs:
10
...
DHCP snooping trust/rate is configured on the following Interfaces:

Interface                  Trusted    Allow option    Rate limit (pps)
-----------------------    -------    ------------    ----------------
<span class="hl">(no interfaces listed: nothing is trusted)</span>

ACC4# show logging | include DHCP_SNOOPING
<span class="hl">%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 5254.0010.0a01</span></pre>
<p>Task 1 asks which interface is trusted: the answer is <b>none</b>. The real server's OFFER arrives on untrusted Gi0/24 and is dropped exactly as if it were a rogue. And because DAI is on, GW's own ARP replies (GW has a static IP, so no binding) would also be dropped on Gi0/24. Task 2 fixes both trusts:</p>
<pre class="code"><span class="c">! task 2: the uplink toward GW is infrastructure</span>
interface g0/24
 ip dhcp snooping trust
 ip arp inspection trust
 exit
<span class="c">! then on PC1: ip dhcp</span></pre>
<pre class="out">ACC4# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:00:0E:11   10.0.10.10       86391       dhcp-snooping   10    GigabitEthernet0/1</span>
Total number of bindings: 1</pre>
<p>PC1 now has a lease and a binding, so DAI and IPSG accept it and it reaches 10.0.10.1. SRV is still dead, because it never used DHCP and so has no binding:</p>
<pre class="out">ACC4# show ip verify source
Interface  Filter-type  Filter-mode  IP-address       Mac-address        Vlan
---------  -----------  -----------  ---------------  -----------------  ----
Gi0/1      ip           active       10.0.10.10       -                  10
<span class="hl">Gi0/2      ip           active       deny-all         deny-all</span>
<span class="hl">%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Req) on Gi0/2, vlan 10.([0050.5555.5050/10.0.10.50/0000.0000.0000/10.0.10.1/...])</span></pre>
<pre class="code"><span class="c">! task 3: tell the switch what SRV legitimately owns</span>
ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2</pre>
<pre class="out">ACC4# show ip source binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
00:50:79:00:0E:11   10.0.10.10       86277       dhcp-snooping   10    GigabitEthernet0/1
<span class="hl">00:50:55:55:50:50   10.0.10.50       infinite    static          10    GigabitEthernet0/2</span>
Total number of bindings: 2</pre>
<p>One static binding satisfies both DAI and IP Source Guard. SRV reaches the gateway, and every defence is still on.</p>

<div class="eg"><p><b>Worked example: sizing the blast radius.</b> A 48-port switch with 44 DHCP users and 4 static printers gets snooping, DAI and IPSG with no uplink trust. All 48 hosts fail. Trusting the uplink fixes the 44 users (they renew and get bindings); the 4 printers need 4 static bindings. If only the 4 printers fail after a rollout, go straight to bindings.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running <code>no ip arp inspection vlan 10</code> or <code>no ip verify source</code> to "fix" the ticket, which silently reopens the attack surface. Recovering an err-disabled port before finding the cause, so it fails again. Trusting every port to make DHCP work, which lets any port become a rogue server.</p></div>

<div class="exam"><p><b>Exam trap.</b> After enabling DHCP snooping, if clients get no address, check that the server-facing port is trusted. If DHCP works but hosts cannot ARP, check the DAI trust on the uplink and static bindings for static hosts. <code>show ip verify source</code> showing <b>deny-all</b> means no binding exists for that port.</p></div>

<div class="scn"><h4>The Monday morning rollout</h4><p>A retailer pushed a hardening template to 60 store switches overnight. At 9 a.m., stores reported that tills worked but card terminals and the back-office printer were offline. The engineer noticed that tills used DHCP while terminals and printers were static. <code>show ip verify source</code> showed deny-all on every static device's port, and DAI logged DHCP_SNOOPING_DENY for their ARP requests. Rolling back would have removed protection from all 60 stores. Instead the team generated <code>ip source binding</code> lines from the inventory database and pushed them within an hour.</p><p><b>Lesson:</b> collect static-host inventories before a DAI/IPSG rollout, and fix with bindings, not by disabling the control.</p></div>

<div class="iv"><p class="q">"After you enabled DAI, a server lost connectivity. Walk me through it."</p><p>Strong answer: check whether the port is up or err-disabled; if err-disabled with reason arp-inspection, the rate limit was exceeded. If the port is up, check <code>show ip arp inspection</code> drop counters and the log for DHCP_SNOOPING_DENY naming the server's MAC and IP. A static server has no snooping binding, so add <code>ip source binding</code> (or an ARP ACL), confirm the uplink is DAI-trusted, then verify the server works and the defence is still on. Never disable DAI as the fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Separate loud blocking (err-disabled, a reason is shown) from silent blocking (drops, counters and logs only).</li>
<li>Everyone in a VLAN fails: suspect uplink trust. One static host fails: suspect a missing binding.</li>
<li>The DHCP server uplink needs snooping trust; the uplink toward the gateway needs DAI trust.</li>
<li>One <code>ip source binding</code> satisfies both DAI and IP Source Guard.</li>
<li>Fix the trust boundary or the binding; never disable the control to close the ticket.</li>
</ul></div>
`,hi:`
<p>Ek naya security guard jise abhi ek strict rulebook di gayi hai, woh intruders ko to rokega, lekin pehle hi din woh us CEO ko bhi rok sakta hai jo apna badge bhool gayi, aur us delivery van ko bhi jo lunch laati hai. Fix guard ko nikaalna nahi hai; use sahi guest list dena hai. Layer 2 controls bilkul usi guard ki tarah behave karte hain. Hardening rollout ke baad sabse common ticket "humpar attack hua" nahi hota balki "ek legitimate user ya server ne kaam karna band kar diya" hota hai. Yeh chapter aapko ek repeatable workflow deta hai aur Lab 5 walk karta hai, jahan DHCP snooping, DAI aur IP Source Guard ek PC aur ek server ko lock out kar dete hain.</p>

<h3>Blocking ke do prakaar</h3>
<p>Is module ka har control do mein se ek tareeke se block karta hai, aur kaunsa hai yeh jaanna ghanton bachata hai:</p>
<ul>
<li><b>Loud blocking:</b> port <b>err-disabled</b> ho jaata hai. Port security (shutdown mode), BPDU guard, action shutdown ke saath storm-control, DHCP snooping rate limits aur DAI rate limits sab yahi karte hain. Link LED band ho jaati hai aur <code>show interfaces status err-disabled</code> reason bata deta hai.</li>
<li><b>Silent blocking:</b> port up rehta hai lekin specific packets drop hote hain. Untrusted port par DHCP snooping, DAI, IP Source Guard, protect ya restrict mode mein port security, root guard (root-inconsistent) aur default drop action wala storm-control sab yahi karte hain. Link healthy dikhta hai; sirf counters aur logs sach batate hain.</li>
</ul>

<table class="cmp"><tr><th>Err-disable reason</th><th>Feature</th><th>Aam legitimate trigger</th></tr>
<tr><td>psecure-violation</td><td>Port security</td><td>Docking station, IP phone plus PC, badla hua NIC</td></tr>
<tr><td>bpduguard</td><td>BPDU guard</td><td>Kisi ne desk port mein chhota switch laga diya</td></tr>
<tr><td>storm-control</td><td>Storm-control</td><td>Desk hub se loop, kharaab NIC</td></tr>
<tr><td>dhcp-rate-limit</td><td>DHCP snooping rate limit</td><td>Kai clients wale port par rate bahut kam set</td></tr>
<tr><td>arp-inspection</td><td>DAI rate limit (default 15 pps)</td><td>Busy server ya uplink untrusted chhoda gaya</td></tr></table>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Layer 2 security troubleshooting flow">
<rect x="20" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="110" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. Problem scope karo</text>
<rect x="230" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. Port up ya err-disabled?</text>
<rect x="440" y="20" width="180" height="44" rx="8" fill="#fed7aa"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">3a. err-disabled:</text><text x="530" y="56" text-anchor="middle" class="svg-muted" font-size="12">reason padho</text>
<rect x="440" y="110" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="530" y="130" text-anchor="middle" class="svg-ink" font-size="13">3b. up: silent drops</text><text x="530" y="146" text-anchor="middle" class="svg-muted" font-size="12">trust, bindings, counters</text>
<rect x="230" y="110" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">4. Trust ya binding fix karo</text>
<rect x="20" y="110" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="110" y="137" text-anchor="middle" class="svg-ink" font-size="13">5. Verify aur document</text>
<line x1="200" y1="42" x2="230" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="42" x2="440" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="64" x2="530" y2="110" stroke="#64748b" stroke-width="2"/><line x1="440" y1="132" x2="410" y2="132" stroke="#64748b" stroke-width="2"/><line x1="230" y1="132" x2="200" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="13">Control band karke kabhi "fix" mat karo</text>
</svg><p class="cap">Loud (err-disabled) ko silent (dropped) blocking se alag karo, phir trust boundary ya binding repair karo.</p></div>
<ol>
<li><b>Scope.</b> Ek host, ek port, ek VLAN ya sab log? VLAN mein sab fail hon to aam taur par uplink par trust problem hoti hai. Ek host fail ho to aam taur par binding ya port-level violation.</li>
<li><b>Port state.</b> <code>show interfaces status</code> aur <code>show interfaces status err-disabled</code>.</li>
<li><b>Loud:</b> reason ko feature se map karo (upar ki table), recover karne se pehle cause dhoondo. <b>Silent:</b> <code>show ip dhcp snooping</code> (trusted ports), <code>show ip dhcp snooping binding</code>, <code>show ip arp inspection</code> (drop counters), <code>show ip verify source</code> (deny-all) aur <code>show logging</code> check karo.</li>
<li><b>Symptom nahi, design fix karo:</b> asli uplink trust karo, static binding jodo, rate limit badhao, port-security maximum sahi karo.</li>
<li><b>Verify aur document:</b> prove karo ki legitimate host kaam kar raha hai aur simulated attack ab bhi block hai.</li>
</ol>

<h3>Lab 5 walkthrough: hardening ne sahi hosts ko block kar diya</h3>
<p>ACC4 par DHCP snooping, DAI (VLAN 10) aur IP Source Guard (Gi0/1–2) on hain. Gi0/1 par PC1 DHCP use karta hai; Gi0/2 par SRV static 10.0.10.50 hai; Gi0/24 par GW DHCP server aur gateway 10.0.10.1 hai. Dono hosts toote hue hain. Scope: VLAN ka har host fail ho raha hai, isliye pehle uplink trust par shak karo.</p>
<pre class="out">ACC4# show ip dhcp snooping
Switch DHCP snooping is enabled
DHCP snooping is configured on following VLANs:
10
DHCP snooping is operational on following VLANs:
10
...
DHCP snooping trust/rate is configured on the following Interfaces:

Interface                  Trusted    Allow option    Rate limit (pps)
-----------------------    -------    ------------    ----------------
<span class="hl">(koi interface listed nahi: kuch bhi trusted nahi)</span>

ACC4# show logging | include DHCP_SNOOPING
<span class="hl">%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 5254.0010.0a01</span></pre>
<p>Task 1 poochhta hai kaunsa interface trusted hai: jawab hai <b>none</b>. Asli server ka OFFER untrusted Gi0/24 par aata hai aur bilkul waise hi drop hota hai jaise woh rogue ho. Aur kyunki DAI on hai, GW ke apne ARP replies (GW ka static IP hai, isliye binding nahi) bhi Gi0/24 par drop honge. Task 2 dono trusts theek karta hai:</p>
<pre class="code"><span class="c">! task 2: GW ki taraf ka uplink infrastructure hai</span>
interface g0/24
 ip dhcp snooping trust
 ip arp inspection trust
 exit
<span class="c">! phir PC1 par: ip dhcp</span></pre>
<pre class="out">ACC4# show ip dhcp snooping binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
<span class="hl">00:50:79:00:0E:11   10.0.10.10       86391       dhcp-snooping   10    GigabitEthernet0/1</span>
Total number of bindings: 1</pre>
<p>PC1 ke paas ab lease aur binding hai, isliye DAI aur IPSG use accept karte hain aur woh 10.0.10.1 tak pahunchta hai. SRV ab bhi dead hai, kyunki usne kabhi DHCP use nahi kiya aur isliye uski koi binding nahi hai:</p>
<pre class="out">ACC4# show ip verify source
Interface  Filter-type  Filter-mode  IP-address       Mac-address        Vlan
---------  -----------  -----------  ---------------  -----------------  ----
Gi0/1      ip           active       10.0.10.10       -                  10
<span class="hl">Gi0/2      ip           active       deny-all         deny-all</span>
<span class="hl">%SW_DAI-4-DHCP_SNOOPING_DENY: 1 Invalid ARPs (Req) on Gi0/2, vlan 10.([0050.5555.5050/10.0.10.50/0000.0000.0000/10.0.10.1/...])</span></pre>
<pre class="code"><span class="c">! task 3: switch ko batao ki SRV legitimately kya own karta hai</span>
ip source binding 0050.5555.5050 vlan 10 10.0.10.50 interface g0/2</pre>
<pre class="out">ACC4# show ip source binding
MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  --------------------
00:50:79:00:0E:11   10.0.10.10       86277       dhcp-snooping   10    GigabitEthernet0/1
<span class="hl">00:50:55:55:50:50   10.0.10.50       infinite    static          10    GigabitEthernet0/2</span>
Total number of bindings: 2</pre>
<p>Ek static binding DAI aur IP Source Guard dono ko satisfy karti hai. SRV gateway tak pahunchta hai, aur har defence ab bhi on hai.</p>

<div class="eg"><p><b>Worked example: blast radius ka size.</b> 44 DHCP users aur 4 static printers wale ek 48-port switch par bina uplink trust ke snooping, DAI aur IPSG lagaye gaye. Saare 48 hosts fail. Uplink trust karne se 44 users theek ho jaate hain (woh renew karke bindings lete hain); 4 printers ko 4 static bindings chahiye. Agar rollout ke baad sirf 4 printers fail hon, to seedha bindings par jaao.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ticket "fix" karne ke liye <code>no ip arp inspection vlan 10</code> ya <code>no ip verify source</code> chala dena, jo chupchaap attack surface dobara khol deta hai. Cause dhoondhne se pehle err-disabled port recover kar dena, jisse woh phir fail hota hai. DHCP chalane ke liye har port ko trust kar dena, jisse koi bhi port rogue server ban sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> DHCP snooping enable karne ke baad agar clients ko address nahi milta, to check karo ki server-facing port trusted hai. Agar DHCP chalta hai lekin hosts ARP nahi kar paate, to uplink par DAI trust aur static hosts ke liye static bindings check karo. <code>show ip verify source</code> mein <b>deny-all</b> ka matlab hai us port ke liye koi binding nahi hai.</p></div>

<div class="scn"><h4>Monday subah ka rollout</h4><p>Ek retailer ne raat mein 60 store switches par hardening template push kiya. Subah 9 baje stores ne report kiya ki tills chal rahe hain lekin card terminals aur back-office printer offline hain. Engineer ne notice kiya ki tills DHCP use karte the jabki terminals aur printers static the. <code>show ip verify source</code> har static device ke port par deny-all dikha raha tha, aur DAI unki ARP requests ke liye DHCP_SNOOPING_DENY log kar raha tha. Rollback karne se saare 60 stores ka protection hat jaata. Uske bajaye team ne inventory database se <code>ip source binding</code> lines generate karke ek ghante ke andar push kar di.</p><p><b>Seekh:</b> DAI/IPSG rollout se pehle static-host inventory ikattha karo, aur bindings se fix karo, control band karke nahi.</p></div>

<div class="iv"><p class="q">"DAI enable karne ke baad ek server ki connectivity chali gayi. Mujhe step by step batao."</p><p>Strong answer: check karo port up hai ya err-disabled; agar reason arp-inspection ke saath err-disabled hai, to rate limit exceed hua. Agar port up hai, to <code>show ip arp inspection</code> ke drop counters aur log mein server ke MAC aur IP wala DHCP_SNOOPING_DENY dekho. Static server ki koi snooping binding nahi hoti, isliye <code>ip source binding</code> (ya ARP ACL) jodo, confirm karo ki uplink DAI-trusted hai, phir verify karo ki server kaam kar raha hai aur defence ab bhi on hai. Fix ke roop mein DAI kabhi band mat karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loud blocking (err-disabled, reason dikhta hai) ko silent blocking (sirf drops, counters aur logs) se alag karo.</li>
<li>VLAN mein sab fail: uplink trust par shak karo. Ek static host fail: missing binding par shak karo.</li>
<li>DHCP server uplink ko snooping trust chahiye; gateway ki taraf uplink ko DAI trust chahiye.</li>
<li>Ek <code>ip source binding</code> DAI aur IP Source Guard dono ko satisfy karti hai.</li>
<li>Trust boundary ya binding fix karo; ticket band karne ke liye control kabhi disable mat karo.</li>
</ul></div>
`}};export{e as default};