var e={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: switch offline, uplink trunk mismatch and AP offline`,hi:`Troubleshooting workflow: switch offline, uplink trunk mismatch aur AP offline`},body:{en:`
<h3>Start with what the dashboard can see</h3>
<p>In a cloud-managed network the first fact is whether a device is <b>online</b>: can it reach the dashboard? That tells you which layer to inspect. A fixed order saves time. Use this workflow for every switch ticket.</p>
<ol>
<li><b>Which devices are offline?</b> Open Overview and Alerts. Switch only, or switch and AP behind it, or the MX too? If the MX is offline the problem is the internet circuit (see mk-vpn uplinks), not the switch.</li>
<li><b>Read the change log.</b> Alerts and events shows who changed what. A fault that began at 09:12 with an edit at 09:12 is almost always that edit.</li>
<li><b>Compare both ends of the uplink trunk.</b> Type, native VLAN and allowed list on the MX LAN port and on the switch port must agree. Native must equal management VLAN 99; 99 must be allowed.</li>
<li><b>Check the port of the missing device.</b> Enabled? PoE on? Err-disabled? Right access VLAN, or right native and allowed list for an AP?</li>
<li><b>Check VLAN reach for clients.</b> Is the VLAN in the allowed list of every trunk in the path? Does the MX have an addressing plan and DHCP for it?</li>
<li><b>Check policy last.</b> STP root change, ACL order and hit counts, firewall order.</li>
</ol>
<p>Change <b>one thing</b>, save, and read the dashboard again. Never assume the save worked; look for the device to turn online.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Switch troubleshooting order">
<rect x="20" y="10" width="290" height="38" rx="6" fill="#bae6fd"/><text x="165" y="34" text-anchor="middle" class="svg-ink" font-size="13">1 Who is offline? MX, switch, AP</text>
<rect x="330" y="10" width="290" height="38" rx="6" fill="#bae6fd"/><text x="475" y="34" text-anchor="middle" class="svg-ink" font-size="13">2 Change log: what changed?</text>
<rect x="20" y="62" width="290" height="38" rx="6" fill="#ddd6fe"/><text x="165" y="86" text-anchor="middle" class="svg-ink" font-size="13">3 Uplink trunk: both ends</text>
<rect x="330" y="62" width="290" height="38" rx="6" fill="#ddd6fe"/><text x="475" y="86" text-anchor="middle" class="svg-ink" font-size="13">4 Device port: enabled, PoE, VLAN</text>
<rect x="20" y="114" width="290" height="38" rx="6" fill="#bbf7d0"/><text x="165" y="138" text-anchor="middle" class="svg-ink" font-size="13">5 VLAN reach: allowed lists, DHCP</text>
<rect x="330" y="114" width="290" height="38" rx="6" fill="#bbf7d0"/><text x="475" y="138" text-anchor="middle" class="svg-ink" font-size="13">6 Policy: STP, ACL, firewall</text>
<rect x="20" y="170" width="600" height="60" rx="6" fill="#fde68a"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="13">One change, Save changes, wait for the device to show online</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Native VLAN = management VLAN 99 on both ends</text>
</svg><p class="cap">Use the same six steps every time, bottom to top.</p></div>

<h3>Walking through the lab: VLAN mismatch on the uplink trunk (mk-ms-2)</h3>
<p>The ticket: SW-BLR and AP-BLR are offline in the dashboard after a change on the uplink. Follow the workflow.</p>
<p><b>Step 1.</b> Alerts shows SW-BLR offline and AP-BLR offline; MX-BLR is online. So the break is on the path between MX-BLR and SW-BLR, and the AP is a victim, not the cause.</p>
<pre class="out">Alerts and events
10:07  alert  AP-BLR offline
10:06  alert  SW-BLR offline
10:05  event  Meera changed SW-BLR port 1 native VLAN 99 to 1</pre>
<p><b>Step 2.</b> The log names the edit. <b>Step 3.</b> Compare both ends of the uplink.</p>
<pre class="out">MX-BLR LAN port 3                SW-BLR port 1 (uplink)
Type    trunk                    Type    trunk
Native  <span class="hl">99</span>                       Native  <span class="hl">1</span>
Allowed 10,20,30,99              Allowed 10,20,30,99</pre>
<p>The native VLANs differ. The switch sends its untagged management frames on VLAN 1; the MX expects VLAN 99. The switch cannot reach the dashboard, so both it and the AP behind it are offline. <b>Fix:</b> set the switch uplink native VLAN back to 99 (or both ends to 99), keep 99 in the allowed list, <b>Save changes</b> and wait for SW-BLR and then AP-BLR to show online. In a real network, an offline device may not receive a configuration push; if so you correct the end that is still online or use another recovery method, and the vendor documentation lists the options.</p>
<p>The mismatch variant: if native is right but VLAN 30 is missing from the allowed list, the switch stays online but guests on the AP get no DHCP. The difference is visible: online device, broken VLAN, versus offline device, broken management path.</p>

<h3>Other tickets: switch offline and AP offline behind an online switch</h3>
<p><b>Switch offline only.</b> The MX is online. Check the uplink trunk (native 99 and allowed), then the physical link of port 1 (is it enabled and connected, at a sane speed), then the management VLAN has an addressing plan on the MX.</p>
<p><b>AP offline, switch online.</b> Open the AP port. Enabled, PoE on, status connected. Then VLAN: it must be a trunk with native 99, or access VLAN 99. The allowed list must include the SSID VLANs 10 and 30. An AP on access VLAN 10 cannot reach the dashboard on VLAN 99.</p>
<pre class="out">Switch ports  (SW-BLR)
Port  Name    Enabled  Type    VLAN / native  Allowed    PoE   Status
2     AP-BLR  yes      trunk   native <span class="hl">10</span>      10,30      on    connected   (AP offline: needs native 99)</pre>

<div class="eg"><p><b>Worked example.</b> At 15:20 Delhi staff report no Wi-Fi. SW-DEL is online, AP-DEL is offline. Log: "Imran changed SW-DEL port 2 PoE on to off." Turning PoE on fixes it. The sequence was: only the AP offline (not the switch), so power or port; the log confirmed. The whole ticket took under ten minutes because the workflow ruled out the trunk first.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing the AP first when the switch is the real fault; editing the wrong end of the trunk and making things worse; changing several settings at once; not reading the log; stopping when the port looks right locally while the dashboard still shows offline.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Switch and AP offline, MX online, edit on the uplink at the same minute." Native VLAN mismatch or missing 99 on the uplink trunk.</p></div>

<div class="scn"><h4>Standardising the trunks</h4><p>A project to standardise trunks across all sites changed SW-BLR port 1 to native 1. Bengaluru went dark in the dashboard, though staff could still browse for a few minutes. The team followed the six steps, found the log entry in the first minutes, compared both ends and restored native 99. They wrote a rule into the change checklist: management VLAN stays native on uplinks.</p><p><b>Lesson:</b> a good workflow plus the change log turns a scary outage into a ten-minute fix.</p></div>

<div class="iv"><p class="q">"A switch and its AP went offline right after an uplink change. How do you find and fix it?"</p><p>Strong answer: the MX is online, so the problem is between MX and switch. I read the change log, compare both ends of the uplink trunk for native VLAN and allowed list, confirm native equals management VLAN 99 with 99 allowed, correct it, save and verify the switch then the AP return online.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start with which devices are offline and what changed.</li>
<li>Compare both ends of the uplink trunk: native 99 and allowed list.</li>
<li>Switch offline with MX online points to the uplink trunk or the management path.</li>
<li>AP offline behind an online switch points to its port: enabled, PoE, VLAN.</li>
<li>One change at a time; confirm the device returns online.</li>
</ul></div>
`,hi:`
<h3>Pehle woh dekho jo dashboard dekh sakta hai</h3>
<p>Cloud-managed network mein pehla fact yeh hai ki device <b>online</b> hai ya nahi: kya woh dashboard tak pahunch sakta hai? Yeh batata hai ki kaunsi layer inspect karni hai. Fixed order time bachata hai. Har switch ticket par yeh workflow use karo.</p>
<ol>
<li><b>Kaunse devices offline hain?</b> Overview aur Alerts kholo. Sirf switch, ya switch aur uske peeche AP, ya MX bhi? Agar MX offline hai to problem internet circuit ki hai (mk-vpn uplinks dekho), switch ki nahi.</li>
<li><b>Change log padho.</b> Alerts and events dikhata hai kisne kya badla. Jo fault 09:12 par shuru hua aur edit bhi 09:12 par tha, woh lagbhag hamesha wahi edit hai.</li>
<li><b>Uplink trunk ke dono ends compare karo.</b> MX LAN port aur switch port par type, native VLAN aur allowed list agree karni chahiye. Native management VLAN 99 ke barabar ho; 99 allowed ho.</li>
<li><b>Missing device ka port check karo.</b> Enabled? PoE on? Err-disabled? Sahi access VLAN, ya AP ke liye sahi native aur allowed list?</li>
<li><b>Clients ke liye VLAN reach check karo.</b> Kya VLAN path ke har trunk ki allowed list mein hai? MX par uska addressing plan aur DHCP hai?</li>
<li><b>Policy sabse last mein.</b> STP root change, ACL order aur hit counts, firewall order.</li>
</ol>
<p><b>Ek cheez</b> badlo, save karo, aur dashboard dobara padho. Maan mat lo ki save kaam kar gaya; device ke online hone ka intezaar karo.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Switch troubleshooting order">
<rect x="20" y="10" width="290" height="38" rx="6" fill="#bae6fd"/><text x="165" y="34" text-anchor="middle" class="svg-ink" font-size="13">1 Kaun offline? MX, switch, AP</text>
<rect x="330" y="10" width="290" height="38" rx="6" fill="#bae6fd"/><text x="475" y="34" text-anchor="middle" class="svg-ink" font-size="13">2 Change log: kya badla?</text>
<rect x="20" y="62" width="290" height="38" rx="6" fill="#ddd6fe"/><text x="165" y="86" text-anchor="middle" class="svg-ink" font-size="13">3 Uplink trunk: dono ends</text>
<rect x="330" y="62" width="290" height="38" rx="6" fill="#ddd6fe"/><text x="475" y="86" text-anchor="middle" class="svg-ink" font-size="13">4 Device port: enabled, PoE, VLAN</text>
<rect x="20" y="114" width="290" height="38" rx="6" fill="#bbf7d0"/><text x="165" y="138" text-anchor="middle" class="svg-ink" font-size="13">5 VLAN reach: allowed lists, DHCP</text>
<rect x="330" y="114" width="290" height="38" rx="6" fill="#bbf7d0"/><text x="475" y="138" text-anchor="middle" class="svg-ink" font-size="13">6 Policy: STP, ACL, firewall</text>
<rect x="20" y="170" width="600" height="60" rx="6" fill="#fde68a"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="13">Ek change, Save changes, device ke online dikhne ka intezaar</text><text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Dono ends par native VLAN = management VLAN 99</text>
</svg><p class="cap">Har baar wahi chhe steps, neeche se upar.</p></div>

<h3>Lab walk-through: uplink trunk par VLAN mismatch (mk-ms-2)</h3>
<p>Ticket: uplink par change ke baad dashboard mein SW-BLR aur AP-BLR offline hain. Workflow follow karo.</p>
<p><b>Step 1.</b> Alerts mein SW-BLR offline aur AP-BLR offline dikhte hain; MX-BLR online hai. To break MX-BLR aur SW-BLR ke beech ke path par hai, aur AP victim hai, cause nahi.</p>
<pre class="out">Alerts and events
10:07  alert  AP-BLR offline
10:06  alert  SW-BLR offline
10:05  event  Meera changed SW-BLR port 1 native VLAN 99 to 1</pre>
<p><b>Step 2.</b> Log edit ka naam batata hai. <b>Step 3.</b> Uplink ke dono ends compare karo.</p>
<pre class="out">MX-BLR LAN port 3                SW-BLR port 1 (uplink)
Type    trunk                    Type    trunk
Native  <span class="hl">99</span>                       Native  <span class="hl">1</span>
Allowed 10,20,30,99              Allowed 10,20,30,99</pre>
<p>Native VLANs alag hain. Switch apne untagged management frames VLAN 1 par bhejta hai; MX VLAN 99 expect karta hai. Switch dashboard tak nahi pahunch paata, isliye woh aur uske peeche AP dono offline hain. <b>Fix:</b> switch uplink native VLAN wapas 99 karo (ya dono ends 99), allowed list mein 99 rakho, <b>Save changes</b> karo aur SW-BLR phir AP-BLR ke online dikhne ka intezaar karo. Real network mein offline device ko configuration push na mile to aap us end ko theek karte ho jo abhi online hai ya doosra recovery method use karte ho; options vendor documentation mein hain.</p>
<p>Mismatch ka variant: agar native sahi hai lekin allowed list se VLAN 30 missing hai, to switch online rehta hai lekin AP par guests ko DHCP nahi milta. Farak dikhta hai: online device, toota VLAN, versus offline device, toota management path.</p>

<h3>Doosre tickets: switch offline aur online switch ke peeche AP offline</h3>
<p><b>Sirf switch offline.</b> MX online hai. Uplink trunk check karo (native 99 aur allowed), phir port 1 ka physical link (enabled aur connected hai, speed theek hai), phir MX par management VLAN ka addressing plan hai.</p>
<p><b>Switch online, AP offline.</b> AP port kholo. Enabled, PoE on, status connected. Phir VLAN: woh native 99 wala trunk ho, ya access VLAN 99. Allowed list mein SSID VLANs 10 aur 30 hone chahiye. Access VLAN 10 par AP VLAN 99 par dashboard tak nahi pahunch sakta.</p>
<pre class="out">Switch ports  (SW-BLR)
Port  Name    Enabled  Type    VLAN / native  Allowed    PoE   Status
2     AP-BLR  yes      trunk   native <span class="hl">10</span>      10,30      on    connected   (AP offline: needs native 99)</pre>

<div class="eg"><p><b>Worked example.</b> 15:20 par Delhi staff ko Wi-Fi nahi mil raha. SW-DEL online hai, AP-DEL offline. Log: "Imran changed SW-DEL port 2 PoE on to off." PoE on karne se fix. Sequence: sirf AP offline (switch nahi), to power ya port; log ne confirm kiya. Poora ticket das minute se kam mein hua kyunki workflow ne pehle trunk ko rule out kar diya.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Jab switch asli fault hai tab AP pehle theek karna; trunk ka galat end edit karke halat bigadna; kai settings ek saath badalna; log na padhna; port locally theek dikhne par ruk jaana jabki dashboard abhi bhi offline dikha raha hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Switch aur AP offline, MX online, usi minute uplink par edit." Uplink trunk par native VLAN mismatch ya 99 missing.</p></div>

<div class="scn"><h4>Trunks standardise karna</h4><p>Saari sites par trunks standardise karne ke project mein SW-BLR port 1 native 1 kar diya gaya. Dashboard mein Bengaluru andhera ho gaya, bhale staff kuch minute browse karta raha. Team ne chhe steps follow kiye, pehle minutes mein log entry mili, dono ends compare kiye aur native 99 restore kiya. Unhone change checklist mein rule likha: uplinks par management VLAN native rahegi.</p><p><b>Seekh:</b> achha workflow aur change log darawne outage ko das minute ke fix mein badal dete hain.</p></div>

<div class="iv"><p class="q">"Uplink change ke turant baad switch aur AP offline ho gaye. Kaise dhoondhoge aur fix karoge?"</p><p>Strong answer: MX online hai, to problem MX aur switch ke beech hai. Main change log padhta hoon, uplink trunk ke dono ends par native VLAN aur allowed list compare karta hoon, confirm karta hoon ki native management VLAN 99 ke barabar hai aur 99 allowed hai, theek karta hoon, save karta hoon aur verify karta hoon ki switch phir AP online aate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle dekho kaun offline hai aur kya badla.</li>
<li>Uplink trunk ke dono ends compare karo: native 99 aur allowed list.</li>
<li>MX online ke saath switch offline matlab uplink trunk ya management path.</li>
<li>Online switch ke peeche AP offline matlab uska port: enabled, PoE, VLAN.</li>
<li>Ek time par ek change; confirm karo ki device online wapas aaya.</li>
</ul></div>
`}};export{e as default};