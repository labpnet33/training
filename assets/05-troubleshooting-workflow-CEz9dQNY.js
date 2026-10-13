var e={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: SSID not showing on clients`,hi:`Troubleshooting workflow: SSID clients par nahi dikh raha`},body:{en:`
<h3>The symptom</h3>
<p>The ticket says: "Staff cannot see BharatRetail-Staff on their devices." This is the story of lab <b>mk-mr-2 (troubleshoot): SSID not showing on clients</b>. Do not click around. Follow a fixed order, from the cheapest check to the deepest, and change one thing at a time.</p>

<h3>How the dashboard decides an SSID is visible</h3>
<p>From the design of this track, a client sees an SSID only when <b>all</b> of these are true:</p>
<ol>
<li>The SSID is <b>enabled</b>.</li>
<li>The SSID is <b>broadcast</b> (not hidden).</li>
<li>The SSID is <b>available</b> on that AP (availability by AP tag).</li>
<li>The AP is <b>online</b>.</li>
<li>The RF profile <b>band</b> suits the client radio.</li>
</ol>
<p>Five yes-or-no checks. One "no" is enough to hide the SSID.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Five-step SSID visibility checklist">
<rect x="20" y="10" width="170" height="40" rx="8" fill="#bae6fd"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="13">1 Enabled?</text>
<rect x="235" y="10" width="170" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">2 Broadcast on?</text>
<rect x="450" y="10" width="170" height="40" rx="8" fill="#bae6fd"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13">3 Tag available?</text>
<rect x="20" y="90" width="260" height="40" rx="8" fill="#bbf7d0"/><text x="150" y="115" text-anchor="middle" class="svg-ink" font-size="13">4 AP online? port, PoE, VLAN 99</text>
<rect x="340" y="90" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="13">5 RF band suits the client?</text>
<line x1="190" y1="30" x2="235" y2="30" stroke="#64748b" stroke-width="2"/><line x1="405" y1="30" x2="450" y2="30" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="50" x2="480" y2="90" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="280" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="160" width="600" height="55" rx="8" fill="#fde68a"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="13">Any "no" hides the SSID. Fix the first "no", Save changes, test again.</text><text x="320" y="203" text-anchor="middle" class="svg-muted" font-size="12">One change at a time, so you know what fixed it.</text>
<rect x="20" y="235" width="600" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="265" text-anchor="middle" class="svg-ink" font-size="13">Order: cheapest check first (SSID page), deepest last (switch port)</text>
</svg><p class="cap">The five checks, in the order an engineer runs them.</p></div>

<h3>Step by step</h3>
<p><b>1. Reproduce and scope.</b> Which client? Which AP or floor? Are all SSIDs missing or one? If all SSIDs vanish on one AP, jump to check 4 (AP down). If only one SSID is missing everywhere, stay in checks 1 to 3. If only some client types are affected, jump to check 5.</p>
<p><b>2. Open the SSIDs page.</b> Look at the row for BharatRetail-Staff.</p>
<pre class="out">SSIDs  (network: Mumbai HQ)
#  Name                 Enabled  Broadcast  Available on
1  BharatRetail-Staff   yes      <span class="hl">no</span>         all APs
2  BharatRetail-Guest   yes      yes        tag: floor1
Client check:  phone-s1 near AP-MUM sees: BharatRetail-Guest</pre>
<p>Broadcast is off, so the name is hidden. Fix: set Broadcast on and Save changes. If Enabled is off, enable it. If availability lists only some tags, add the AP's tag (floor1, floor2 or store).</p>
<p><b>3. Check the AP.</b> Open the Devices list. If AP-MUM is offline, nothing is broadcast.</p>
<pre class="out">Devices  (network: Mumbai HQ)
Name     Type  Tag     Status
AP-MUM   MR    floor1  <span class="hl">offline</span>
Switch ports: SW-MUM port 7  AP-MUM  enabled  PoE <span class="hl">off</span>  access VLAN 10</pre>
<p>Walk the AP checklist: port enabled? PoE on? port VLAN (access, or trunk native) equals 99? management VLAN reaching the MX? Fix in that order. Here PoE is off and the VLAN is wrong: fix both, one at a time, and watch the status change.</p>
<p><b>4. Check the RF profile.</b> If the AP is online and the SSID is enabled, broadcast and available, look at the profile bands. A 5 GHz-only profile hides the SSID from 2.4 GHz-only clients. Assign a dual-band profile if such clients must connect.</p>
<p><b>5. Verify.</b> Ask the client to rescan (turn Wi-Fi off and on). Check the Clients list. Record what you changed and why.</p>

<table class="cmp"><tr><th>What you see</th><th>Most likely check</th><th>Fix</th></tr>
<tr><td>All SSIDs gone on one AP</td><td>AP offline</td><td>Port, PoE, VLAN 99</td></tr>
<tr><td>One SSID gone everywhere</td><td>Enabled or broadcast</td><td>Turn on and Save</td></tr>
<tr><td>SSID on floor1 only</td><td>Tag availability</td><td>Add the tag</td></tr>
<tr><td>Old devices cannot see it</td><td>RF band</td><td>Dual-band profile</td></tr>
<tr><td>Joins but no IP</td><td>Not visibility: VLAN trunk or DHCP</td><td>Allow VLAN on AP port</td></tr></table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Each fix changes one thing: whether beacons are sent (enabled, broadcast, tag), whether the AP is powered and reachable (port, PoE, VLAN 99), or which band sends them (RF profile). Make a note in your change record, and use the change log (see the next module) to see who changed what before the fault.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Changing several settings at once; rebooting before reading the dashboard; blaming the client; forgetting Save changes; not rescanning the client after the fix.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Joins but no IP" is not "SSID not visible." Keep symptoms separate: visibility checks are different from VLAN and DHCP checks.</p></div>

<div class="scn"><h4>Friday-evening ticket</h4><p>Mumbai staff lost Wi-Fi after a late change. Guest still worked. The engineer opened the SSIDs page and saw Staff Broadcast set to no, changed the day before while testing a hidden-network idea. He turned Broadcast on, saved, and asked users to rescan. The SSID returned in seconds. The whole fix took four minutes because he followed the order.</p><p><b>Lesson:</b> check the cheap, common causes first, and read the page before touching anything.</p></div>

<div class="iv"><p class="q">"Users cannot see our SSID. What do you check?"</p><p>Strong answer: scope first (one AP or all, one client type or all), then SSID enabled, broadcast, availability by tag, AP online (port, PoE, VLAN 99), RF band. One change at a time, verify with a client rescan, and document the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Visible SSID needs: enabled, broadcast, tag available, AP online, suitable band.</li>
<li>Scope the symptom first: all SSIDs, one SSID or some clients.</li>
<li>AP checklist: port enabled, PoE on, VLAN 99, path to MX.</li>
<li>Change one thing, Save changes, rescan and verify.</li>
<li>Separate visibility problems from "joins but no IP" problems.</li>
</ul></div>
`,hi:`
<h3>Symptom</h3>
<p>Ticket kehta hai: "Staff ko apne devices par BharatRetail-Staff nahi dikh raha." Yeh lab <b>mk-mr-2 (troubleshoot): SSID clients par nahi dikh raha</b> ki kahani hai. Idhar udhar click mat karo. Fixed order follow karo, sabse sasti check se sabse gehri tak, aur ek baar mein ek hi cheez badlo.</p>

<h3>Dashboard kaise decide karta hai ki SSID visible hai</h3>
<p>Is track ke design ke hisaab se client SSID tabhi dekhta hai jab <b>sab</b> yeh sach hon:</p>
<ol>
<li>SSID <b>enabled</b> hai.</li>
<li>SSID <b>broadcast</b> ho raha hai (hidden nahi).</li>
<li>SSID us AP par <b>available</b> hai (AP tag se availability).</li>
<li>AP <b>online</b> hai.</li>
<li>RF profile ka <b>band</b> client radio ke liye suit karta hai.</li>
</ol>
<p>Paanch yes-ya-no checks. Ek "no" kaafi hai SSID chhupane ke liye.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Paanch step SSID visibility checklist">
<rect x="20" y="10" width="170" height="40" rx="8" fill="#bae6fd"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="13">1 Enabled?</text>
<rect x="235" y="10" width="170" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">2 Broadcast on?</text>
<rect x="450" y="10" width="170" height="40" rx="8" fill="#bae6fd"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13">3 Tag available?</text>
<rect x="20" y="90" width="260" height="40" rx="8" fill="#bbf7d0"/><text x="150" y="115" text-anchor="middle" class="svg-ink" font-size="13">4 AP online? port, PoE, VLAN 99</text>
<rect x="340" y="90" width="280" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="13">5 RF band client ko suit karta hai?</text>
<line x1="190" y1="30" x2="235" y2="30" stroke="#64748b" stroke-width="2"/><line x1="405" y1="30" x2="450" y2="30" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="50" x2="480" y2="90" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="280" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="160" width="600" height="55" rx="8" fill="#fde68a"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="13">Koi bhi "no" SSID chhupa deta hai. Pehla "no" fix karo, Save changes, phir test.</text><text x="320" y="203" text-anchor="middle" class="svg-muted" font-size="12">Ek baar mein ek change, taaki pata chale kisne fix kiya.</text>
<rect x="20" y="235" width="600" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="265" text-anchor="middle" class="svg-ink" font-size="13">Order: sasti check pehle (SSID page), sabse gehri aakhir mein (switch port)</text>
</svg><p class="cap">Paanch checks, us order mein jis mein engineer unhe chalata hai.</p></div>

<h3>Step by step</h3>
<p><b>1. Reproduce karo aur scope dekho.</b> Kaun sa client? Kaun sa AP ya floor? Saare SSIDs missing hain ya ek? Agar ek AP par saare SSIDs gayab hain, to seedha check 4 (AP down) par jao. Agar sirf ek SSID har jagah missing hai, to checks 1 se 3 mein raho. Agar sirf kuch client types affected hain, to check 5 par jao.</p>
<p><b>2. SSIDs page kholo.</b> BharatRetail-Staff ki row dekho.</p>
<pre class="out">SSIDs  (network: Mumbai HQ)
#  Name                 Enabled  Broadcast  Available on
1  BharatRetail-Staff   yes      <span class="hl">no</span>         all APs
2  BharatRetail-Guest   yes      yes        tag: floor1
Client check:  phone-s1 near AP-MUM sees: BharatRetail-Guest</pre>
<p>Broadcast off hai, isliye naam hidden hai. Fix: Broadcast on karo aur Save changes. Agar Enabled off hai to enable karo. Agar availability sirf kuch tags dikhati hai, to AP ka tag (floor1, floor2 ya store) add karo.</p>
<p><b>3. AP check karo.</b> Devices list kholo. Agar AP-MUM offline hai, to kuch broadcast nahi hota.</p>
<pre class="out">Devices  (network: Mumbai HQ)
Name     Type  Tag     Status
AP-MUM   MR    floor1  <span class="hl">offline</span>
Switch ports: SW-MUM port 7  AP-MUM  enabled  PoE <span class="hl">off</span>  access VLAN 10</pre>
<p>AP checklist chalao: port enabled? PoE on? port VLAN (access, ya trunk native) 99 ke barabar? management VLAN MX tak pahunch raha hai? Isi order mein fix karo. Yahan PoE off hai aur VLAN galat hai: dono fix karo, ek ek karke, aur status badalte dekho.</p>
<p><b>4. RF profile check karo.</b> Agar AP online hai aur SSID enabled, broadcast aur available hai, to profile bands dekho. 5 GHz-only profile SSID ko 2.4 GHz-only clients se chhupata hai. Agar aise clients ko connect karna hai to dual-band profile assign karo.</p>
<p><b>5. Verify karo.</b> Client se rescan karwao (Wi-Fi off aur on). Clients list dekho. Likho ki aapne kya badla aur kyun.</p>

<table class="cmp"><tr><th>Kya dikhta hai</th><th>Sabse likely check</th><th>Fix</th></tr>
<tr><td>Ek AP par saare SSIDs gayab</td><td>AP offline</td><td>Port, PoE, VLAN 99</td></tr>
<tr><td>Ek SSID har jagah gayab</td><td>Enabled ya broadcast</td><td>On karo aur Save</td></tr>
<tr><td>SSID sirf floor1 par</td><td>Tag availability</td><td>Tag add karo</td></tr>
<tr><td>Purane devices nahi dekh paate</td><td>RF band</td><td>Dual-band profile</td></tr>
<tr><td>Join hota hai lekin IP nahi</td><td>Visibility nahi: VLAN trunk ya DHCP</td><td>AP port par VLAN allow karo</td></tr></table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Har fix ek cheez badalta hai: beacons jaate hain ya nahi (enabled, broadcast, tag), AP powered aur reachable hai ya nahi (port, PoE, VLAN 99), ya kaun sa band unhe bhejta hai (RF profile). Change record mein note likho, aur change log (agle module mein) se dekho ki fault se pehle kisne kya badla.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Ek saath kai settings badalna; dashboard padhe bina reboot karna; client ko blame karna; Save changes bhool jaana; fix ke baad client ko rescan na karwana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Join hota hai lekin IP nahi" aur "SSID visible nahi" ek cheez nahi hain. Symptoms alag rakho: visibility checks VLAN aur DHCP checks se alag hain.</p></div>

<div class="scn"><h4>Friday-evening ticket</h4><p>Ek late change ke baad Mumbai staff ka Wi-Fi chala gaya. Guest chal raha tha. Engineer ne SSIDs page kholi aur dekha Staff ka Broadcast no tha, jo ek din pehle hidden-network idea test karte waqt badla gaya tha. Usne Broadcast on kiya, save kiya aur users se rescan karwaya. SSID seconds mein wapas aa gaya. Poora fix chaar minute mein hua kyunki usne order follow kiya.</p><p><b>Seekh:</b> sasti, aam wajahein pehle check karo, aur kuch chhoone se pehle page padho.</p></div>

<div class="iv"><p class="q">"Users hamara SSID nahi dekh paa rahe. Aap kya check karoge?"</p><p>Strong answer: pehle scope (ek AP ya sab, ek client type ya sab), phir SSID enabled, broadcast, tag se availability, AP online (port, PoE, VLAN 99), RF band. Ek baar mein ek change, client rescan se verify, aur change document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Visible SSID ke liye: enabled, broadcast, tag available, AP online, suitable band.</li>
<li>Symptom ka scope pehle dekho: saare SSIDs, ek SSID ya kuch clients.</li>
<li>AP checklist: port enabled, PoE on, VLAN 99, MX tak path.</li>
<li>Ek cheez badlo, Save changes, rescan karo aur verify karo.</li>
<li>Visibility problems ko "join hota hai lekin IP nahi" problems se alag rakho.</li>
</ul></div>
`}};export{e as default};