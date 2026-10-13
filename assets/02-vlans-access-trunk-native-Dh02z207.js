var e={id:`vlans-access-trunk-native`,h:{en:`VLANs on switches: access, trunk, native VLAN and management VLAN 99`,hi:`Switches par VLANs: access, trunk, native VLAN aur management VLAN 99`},body:{en:`
<h3>A VLAN is a private lane on shared cabling</h3>
<p>A <b>VLAN</b> (virtual LAN) splits one physical switch into several separate logical networks. Staff devices (VLAN 10), servers (VLAN 20), guests (VLAN 30) and management (VLAN 99) can share the same switch without seeing each other's broadcasts. Between VLANs, traffic must pass through a router or firewall, which is where policy lives (the MX and, in Mumbai, the core switch). You met VLAN addressing on the MX in <b>mk-mx</b>; now we look at how the switch carries them.</p>

<h3>Access port: one VLAN, no tag</h3>
<p>An <b>access port</b> belongs to exactly one VLAN. The device plugged in (a PC, a server) knows nothing about VLANs. The switch adds the VLAN identity inside the switch and removes it on the way out. PC-BLR on port 3 is an access port in VLAN 10: that is why it gets 10.2.10.x from the MX.</p>

<h3>Trunk port: many VLANs, with tags</h3>
<p>A <b>trunk port</b> carries several VLANs between two network devices, such as a switch and the MX or two switches. Each frame carries a small <b>VLAN tag</b> (the 802.1Q tag) with the VLAN number so the other end knows where it belongs. Two settings matter:</p>
<ul>
<li><b>Allowed VLAN list</b>: which VLANs may cross this trunk. A VLAN not in the list is simply dropped. If VLAN 20 is missing, servers cannot reach the MX.</li>
<li><b>Native VLAN</b>: the one VLAN that travels <b>without a tag</b>. Frames with no tag are assumed to belong to the native VLAN. Both ends of the trunk must agree on it.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Access ports and a trunk with a native VLAN">
<rect x="20" y="40" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">PC-BLR</text><text x="75" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<rect x="20" y="110" width="110" height="46" rx="8" fill="#fed7aa"/><text x="75" y="132" text-anchor="middle" class="svg-ink" font-size="13">SRV-BLR</text><text x="75" y="148" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<rect x="200" y="50" width="130" height="110" rx="8" fill="#e2e8f0"/><text x="265" y="100" text-anchor="middle" class="svg-ink" font-size="13">SW-BLR</text><text x="265" y="120" text-anchor="middle" class="svg-muted" font-size="12">management 99</text>
<rect x="500" y="50" width="120" height="110" rx="8" fill="#bae6fd"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR</text>
<line x1="130" y1="63" x2="200" y2="80" stroke="#64748b" stroke-width="2"/><line x1="130" y1="133" x2="200" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="105" x2="500" y2="105" stroke="#7c3aed" stroke-width="4"/>
<text x="415" y="92" text-anchor="middle" class="svg-accent" font-size="12">trunk: allowed 10,20,30,99</text><text x="415" y="125" text-anchor="middle" class="svg-accent" font-size="12">native 99 (untagged)</text>
<rect x="20" y="180" width="600" height="36" rx="6" fill="#fde68a"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="13">Access = one VLAN untagged. Trunk = many VLANs tagged, one native untagged.</text>
</svg><p class="cap">Native VLAN 99 must be the same on the MX LAN port and the switch uplink.</p></div>

<h3>Management VLAN 99: how a switch reaches the cloud</h3>
<p>A cloud-managed switch must itself talk to the dashboard. It does this over its <b>management VLAN</b>, 99 in our design, using an address in 10.x.99.2-20 (static, reserved for MS and MR). The switch sends its management traffic <b>untagged</b>, because it has no way to tag before it is configured. So for the switch to come online, the trunk to the MX must make VLAN 99 arrive untagged, which means <b>native VLAN = 99 on both ends</b>, and 99 must be in the allowed list, and the MX must have an addressing plan for VLAN 99.</p>
<p>If one end says native 99 and the other native 1 (the common default), the switch's untagged management frames land in the wrong VLAN on the MX. The switch cannot reach the dashboard, goes <b>offline</b>, and everything behind it (the AP, and anything you want to manage) disappears from the dashboard even though users in access VLANs may still work for a while. This is the most important rule of this module.</p>
<pre class="out">Switch ports  (SW-DEL, uplink port 1)         Addressing and VLANs  (MX-DEL, LAN port 3)
Type   trunk                                  Type   trunk
Native <span class="hl">99</span>                                     Native <span class="hl">1</span>
Allowed 10,20,30,99                           Allowed 10,20,30

Alerts and events
09:13  alert  SW-DEL offline</pre>

<h3>VLAN mismatch on an uplink trunk</h3>
<p>A second common fault: the allowed list on the uplink does not include a VLAN that downstream ports use. For example VLAN 30 is missing from SW-BLR's uplink, so guests on the AP in VLAN 30 get no DHCP even though the AP and switch are online. Always compare the allowed list with the VLANs actually used below the switch. The AP port needs the SSID VLANs (10 and 30) in its allowed list plus native 99.</p>

<div class="eg"><p><b>Worked example.</b> A new SW-BLR is plugged in. Port 1 (uplink) is set trunk, native 99, allowed 10,20,30,99. The MX LAN port is the same. The switch comes online with address 10.2.99.2. Port 2 (AP) is trunk, native 99, allowed 10,30,99, PoE on. AP-BLR comes online at 10.2.99.3 (illustrative). Port 3 is access VLAN 10 and PC-BLR gets 10.2.10.x.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Changing a port between access and trunk changes whether frames are tagged. Native VLAN changes which VLAN untagged frames join. The allowed list decides which VLANs may cross. Edit the uplink on <b>both</b> ends, or you will cut off the switch you are editing: change the downstream device, then the upstream, and verify.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Native VLAN left at the default on one side; forgetting 99 in the allowed list; putting a PC on a trunk port; AP port as access VLAN 10 so it cannot reach 99; editing the uplink and losing the switch you are managing.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Native VLAN mismatch." Symptom: the switch is offline in the dashboard while ports look fine locally. Remember management VLAN = native on the uplink.</p></div>

<div class="scn"><h4>Friday trunk tidy-up</h4><p>An engineer standardised the MX-DEL LAN port to native 1 and removed 99 from the allowed list. SW-DEL and AP-DEL went offline and Delhi staff lost DHCP for new connections. The event log named the edit. Restoring native 99 and allowed 10,20,30,99 on the MX port brought the switch back within minutes.</p><p><b>Lesson:</b> the management VLAN must cross the trunk untagged on both ends. Check the log first.</p></div>

<div class="iv"><p class="q">"What is a native VLAN and why does a mismatch take a managed switch offline?"</p><p>Strong answer: the native VLAN is the one carried untagged on a trunk. The switch sends its management traffic untagged on VLAN 99; if the far end has a different native VLAN, those frames land in the wrong VLAN, the switch cannot reach the cloud, and it shows offline. Fix both ends to native 99 and keep 99 in the allowed list.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access = one untagged VLAN; trunk = many tagged VLANs with an allowed list and a native VLAN.</li>
<li>Management VLAN 99 must be native on the uplink at both ends and in the allowed list.</li>
<li>A native mismatch takes the switch (and the AP behind it) offline in the dashboard.</li>
<li>Missing VLANs in the allowed list break DHCP and reachability for that VLAN.</li>
<li>Change the downstream end first when editing an uplink.</li>
</ul></div>
`,hi:`
<h3>VLAN shared cabling par private lane hai</h3>
<p><b>VLAN</b> (virtual LAN) ek physical switch ko kai alag logical networks mein baant deta hai. Staff devices (VLAN 10), servers (VLAN 20), guests (VLAN 30) aur management (VLAN 99) ek hi switch share kar sakte hain bina ek dusre ke broadcasts dekhe. VLANs ke beech traffic ko router ya firewall se guzarna padta hai, jahan policy rehti hai (MX aur Mumbai mein core switch). <b>mk-mx</b> mein aapne MX par VLAN addressing dekha; ab dekhte hain switch unhe kaise carry karta hai.</p>

<h3>Access port: ek VLAN, koi tag nahi</h3>
<p><b>Access port</b> bilkul ek VLAN ka hota hai. Plugged device (PC, server) VLANs ke baare mein kuch nahi jaanta. Switch VLAN identity switch ke andar add karta hai aur bahar jaate waqt hata deta hai. Port 3 par PC-BLR VLAN 10 ka access port hai: isiliye use MX se 10.2.10.x milta hai.</p>

<h3>Trunk port: kai VLANs, tags ke saath</h3>
<p><b>Trunk port</b> do network devices ke beech kai VLANs carry karta hai, jaise switch aur MX ya do switches. Har frame mein VLAN number ka chhota <b>VLAN tag</b> (802.1Q tag) hota hai taaki doosra end jaane ki woh kahan ka hai. Do settings matter karti hain:</p>
<ul>
<li><b>Allowed VLAN list</b>: kaunsi VLANs is trunk se guzar sakti hain. List mein na ho to VLAN seedhi drop ho jaati hai. Agar VLAN 20 missing hai, to servers MX tak nahi pahunch sakte.</li>
<li><b>Native VLAN</b>: woh ek VLAN jo <b>bina tag</b> ke chalti hai. Jis frame par tag nahi hota use native VLAN ka maana jaata hai. Trunk ke dono ends ko isspar agree hona chahiye.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Access ports aur native VLAN wala trunk">
<rect x="20" y="40" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">PC-BLR</text><text x="75" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<rect x="20" y="110" width="110" height="46" rx="8" fill="#fed7aa"/><text x="75" y="132" text-anchor="middle" class="svg-ink" font-size="13">SRV-BLR</text><text x="75" y="148" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<rect x="200" y="50" width="130" height="110" rx="8" fill="#e2e8f0"/><text x="265" y="100" text-anchor="middle" class="svg-ink" font-size="13">SW-BLR</text><text x="265" y="120" text-anchor="middle" class="svg-muted" font-size="12">management 99</text>
<rect x="500" y="50" width="120" height="110" rx="8" fill="#bae6fd"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">MX-BLR</text>
<line x1="130" y1="63" x2="200" y2="80" stroke="#64748b" stroke-width="2"/><line x1="130" y1="133" x2="200" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="105" x2="500" y2="105" stroke="#7c3aed" stroke-width="4"/>
<text x="415" y="92" text-anchor="middle" class="svg-accent" font-size="12">trunk: allowed 10,20,30,99</text><text x="415" y="125" text-anchor="middle" class="svg-accent" font-size="12">native 99 (untagged)</text>
<rect x="20" y="180" width="600" height="36" rx="6" fill="#fde68a"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="13">Access = ek VLAN untagged. Trunk = kai VLANs tagged, ek native untagged.</text>
</svg><p class="cap">Native VLAN 99 MX LAN port aur switch uplink dono par same honi chahiye.</p></div>

<h3>Management VLAN 99: switch cloud tak kaise pahunchta hai</h3>
<p>Cloud-managed switch ko khud dashboard se baat karni hoti hai. Woh yeh apni <b>management VLAN</b> par karta hai, humare design mein 99, 10.x.99.2-20 ke address ke saath (static, MS aur MR ke liye reserved). Switch apna management traffic <b>untagged</b> bhejta hai, kyunki configure hone se pehle tag karne ka tareeka nahi hota. Isliye switch online aane ke liye MX tak trunk par VLAN 99 untagged pahunchni chahiye, yaani <b>dono ends par native VLAN = 99</b>, 99 allowed list mein ho, aur MX par VLAN 99 ka addressing plan ho.</p>
<p>Agar ek end native 99 kehta hai aur doosra native 1 (common default), to switch ke untagged management frames MX par galat VLAN mein pahunchte hain. Switch dashboard tak nahi pahunch paata, <b>offline</b> ho jaata hai, aur uske peeche sab kuch (AP, aur jo bhi manage karna chaho) dashboard se gayab ho jaata hai, chahe access VLANs ke users kuch der chalte rahein. Yeh is module ka sabse important rule hai.</p>
<pre class="out">Switch ports  (SW-DEL, uplink port 1)         Addressing and VLANs  (MX-DEL, LAN port 3)
Type   trunk                                  Type   trunk
Native <span class="hl">99</span>                                     Native <span class="hl">1</span>
Allowed 10,20,30,99                           Allowed 10,20,30

Alerts and events
09:13  alert  SW-DEL offline</pre>

<h3>Uplink trunk par VLAN mismatch</h3>
<p>Doosri common fault: uplink ki allowed list mein woh VLAN nahi hai jo downstream ports use karte hain. Jaise SW-BLR ke uplink se VLAN 30 missing hai, to VLAN 30 mein AP par guests ko DHCP nahi milta bhale AP aur switch online hon. Allowed list ko hamesha switch ke neeche actually use hone wali VLANs se compare karo. AP port ko allowed list mein SSID VLANs (10 aur 30) aur native 99 chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Naya SW-BLR plug hua. Port 1 (uplink) trunk, native 99, allowed 10,20,30,99. MX LAN port bhi waisa hi. Switch 10.2.99.2 address ke saath online aata hai. Port 2 (AP) trunk, native 99, allowed 10,30,99, PoE on. AP-BLR 10.2.99.3 (illustrative) par online aata hai. Port 3 access VLAN 10 hai aur PC-BLR ko 10.2.10.x milta hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Port ko access aur trunk ke beech badalne se frames tagged hote hain ya nahi, yeh badalta hai. Native VLAN badalti hai ki untagged frames kis VLAN mein jaayein. Allowed list decide karti hai kaunsi VLANs guzar sakti hain. Uplink <b>dono</b> ends par edit karo, warna jis switch ko edit kar rahe ho use hi kaat doge: pehle downstream device badlo, phir upstream, aur verify karo.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Ek side par native VLAN default chhodna; allowed list mein 99 bhool jaana; PC ko trunk port par lagana; AP port ko access VLAN 10 karna jisse woh 99 tak nahi pahunch paata; uplink edit karke jis switch ko manage kar rahe ho use kho dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Native VLAN mismatch." Symptom: dashboard mein switch offline jabki ports locally theek dikhte hain. Yaad rakho management VLAN = uplink par native.</p></div>

<div class="scn"><h4>Friday trunk tidy-up</h4><p>Ek engineer ne MX-DEL LAN port ko native 1 standardise kar diya aur allowed list se 99 hata di. SW-DEL aur AP-DEL offline ho gaye aur Delhi staff ko nayi connections ke liye DHCP nahi mila. Event log ne edit ka naam bataya. MX port par native 99 aur allowed 10,20,30,99 restore karne se switch kuch minutes mein wapas aa gaya.</p><p><b>Seekh:</b> management VLAN ko dono ends par untagged trunk se guzarna chahiye. Pehle log dekho.</p></div>

<div class="iv"><p class="q">"Native VLAN kya hai aur mismatch managed switch ko offline kyun kar deta hai?"</p><p>Strong answer: native VLAN woh hai jo trunk par untagged chalti hai. Switch apna management traffic VLAN 99 par untagged bhejta hai; agar doosre end ki native VLAN alag hai, to woh frames galat VLAN mein pahunchte hain, switch cloud tak nahi pahunch paata aur offline dikhta hai. Dono ends native 99 karo aur 99 ko allowed list mein rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Access = ek untagged VLAN; trunk = allowed list aur native VLAN ke saath kai tagged VLANs.</li>
<li>Management VLAN 99 uplink par dono ends native ho aur allowed list mein ho.</li>
<li>Native mismatch dashboard mein switch (aur uske peeche AP) ko offline kar deta hai.</li>
<li>Allowed list mein missing VLAN us VLAN ka DHCP aur reachability todta hai.</li>
<li>Uplink edit karte waqt pehle downstream end badlo.</li>
</ul></div>
`}};export{e as default};