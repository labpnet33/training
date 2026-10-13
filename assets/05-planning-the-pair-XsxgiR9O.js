var e={id:`planning-the-pair`,h:{en:`Planning the pair: network, addresses, versions and the change window`,hi:`Pair ki planning: network, addresses, versions aur change window`},body:{en:`
<p>Building a second Panorama is like adding a second engine to a boat: the work is easy, but doing it badly while at sea is dangerous. A little planning on paper removes most HA problems before you type a single command.</p>

<h3>Planning checklist</h3>
<table class="tbl">
<tr><th>Item</th><th>Question to answer</th><th>Lab value</th></tr>
<tr><td>Management reachability</td><td>Can each Panorama reach the other's management IP?</td><td>192.0.2.50 and 192.0.2.51 on 192.0.2.0/24, gateway 192.0.2.1</td></tr>
<tr><td>Peer addresses</td><td>Which address does each side point at?</td><td>Each points at the other</td></tr>
<tr><td>Roles</td><td>Which is primary, which secondary?</td><td>NK-PANORAMA primary, NK-PANORAMA-2 secondary</td></tr>
<tr><td>Preemption</td><td>Do you want the active role to return automatically?</td><td>Yes, on the primary</td></tr>
<tr><td>Software versions</td><td>Do both run a compatible, matching version?</td><td>Not simulated</td></tr>
<tr><td>Firewall side</td><td>Will firewalls know both servers?</td><td>Yes: panorama-server and panorama-server-2</td></tr>
<tr><td>Device-local settings</td><td>What must be set by hand on each?</td><td>Management settings</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Management network plan">
<rect x="20" y="60" width="600" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Management network 192.0.2.0/24 (out of band) gateway 192.0.2.1</text>
<rect x="60" y="8" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="155" y="31" text-anchor="middle" class="svg-ink" font-size="12">NK-PANORAMA .50</text>
<rect x="390" y="8" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="485" y="31" text-anchor="middle" class="svg-ink" font-size="12">NK-PANORAMA-2 .51</text>
<line x1="155" y1="44" x2="155" y2="60" stroke="#64748b" stroke-width="2"/><line x1="485" y1="44" x2="485" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="126" width="140" height="34" rx="6" fill="#bae6fd"/><text x="130" y="148" text-anchor="middle" class="svg-ink" font-size="12">PA1 .11</text>
<rect x="250" y="126" width="140" height="34" rx="6" fill="#bae6fd"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="12">PA2 .12</text>
<rect x="440" y="126" width="140" height="34" rx="6" fill="#bae6fd"/><text x="510" y="148" text-anchor="middle" class="svg-ink" font-size="12">PA3 .13</text>
<line x1="130" y1="110" x2="130" y2="126" stroke="#64748b" stroke-width="2"/><line x1="320" y1="110" x2="320" y2="126" stroke="#64748b" stroke-width="2"/><line x1="510" y1="110" x2="510" y2="126" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Everything meets on the management network. If the two Panoramas cannot reach each other here, no HA setting will help.</p></div>

<h3>Versions and honesty about limits</h3>
<p>In real life the two peers should run matching software versions, and the order and procedure for upgrading a pair are specific. The simulator does not model versions, the HA link between peers, encryption or heartbeat timers. Which interface carries HA traffic, which timers apply and which ports are used: check the documentation for your PAN-OS version. Never assume a detail from this course is the real default.</p>

<h3>The change window</h3>
<ol>
<li><b>Take a backup first</b> of the existing Panorama configuration (chapter 10).</li>
<li>Announce a window. Adding HA does not stop firewall traffic, but a mistake can confuse management.</li>
<li>Configure and commit the primary, then the secondary.</li>
<li><b>Verify</b> with the state output on both, plus the synchronization line.</li>
<li>Only then teach the firewalls about the second server (chapter 6).</li>
</ol>

<pre class="code"><span class="c">! plan as comments, then the commands (lab, secondary side)</span>
configure
set deviceconfig high-availability enabled yes
set deviceconfig high-availability peer-ip-address 192.0.2.50
set deviceconfig high-availability election-option priority secondary
commit</pre>

<div class="warn"><p>Do not configure the secondary first on a network where its address is already used by something else. Confirm the new Panorama's management address is unique before you enable HA.</p></div>

<div class="scn"><h4>Wrong peer address by one digit</h4><p>During a window an engineer typed 192.0.2.15 instead of 192.0.2.51 as the peer. The primary reported that no Panorama answered on that address. A single peek at the planning table would have caught it. This is exactly the lab <code>pn-ha-ts</code>.</p><p><b>Lesson:</b> write the plan first, copy addresses from it, and read the state output after every commit.</p></div>

<div class="iv"><p class="q">"What do you check before building a Panorama HA pair?"</p><p>Management reachability both ways, unique addresses, matching software versions, which side is primary, preemption choice, a fresh backup, a change window, and that firewalls will be taught the second server. I verify with the state output afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan addresses, roles and preemption on paper first.</li>
<li>Peers must reach each other on the management network.</li>
<li>Matching versions and upgrade order: check the documentation for your PAN-OS version.</li>
<li>Backup, window, configure, verify, then firewalls.</li>
</ul></div>
`,hi:`
<p>Doosra Panorama banana boat mein doosra engine lagane jaisa hai: kaam aasaan hai, par samundar mein bura kiya to khatarnaak. Kaagaz par thodi planning se zyada tar HA problems ek bhi command type karne se pehle hi hat jaati hain.</p>

<h3>Planning checklist</h3>
<table class="tbl">
<tr><th>Item</th><th>Kaun sa sawaal answer karna hai</th><th>Lab value</th></tr>
<tr><td>Management reachability</td><td>Kya har Panorama doosre ka management IP reach kar sakta hai?</td><td>192.0.2.50 aur 192.0.2.51, 192.0.2.0/24 par, gateway 192.0.2.1</td></tr>
<tr><td>Peer addresses</td><td>Har side kis address ko point karti hai?</td><td>Har ek doosre ko</td></tr>
<tr><td>Roles</td><td>Kaun primary, kaun secondary?</td><td>NK-PANORAMA primary, NK-PANORAMA-2 secondary</td></tr>
<tr><td>Preemption</td><td>Kya active role automatically wapas chahiye?</td><td>Haan, primary par</td></tr>
<tr><td>Software versions</td><td>Kya dono compatible, matching version par hain?</td><td>Simulate nahi hota</td></tr>
<tr><td>Firewall side</td><td>Kya firewalls dono servers ko jaanenge?</td><td>Haan: panorama-server aur panorama-server-2</td></tr>
<tr><td>Device-local settings</td><td>Har par haath se kya set karna hai?</td><td>Management settings</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Management network plan">
<rect x="20" y="60" width="600" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Management network 192.0.2.0/24 (out of band) gateway 192.0.2.1</text>
<rect x="60" y="8" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="155" y="31" text-anchor="middle" class="svg-ink" font-size="12">NK-PANORAMA .50</text>
<rect x="390" y="8" width="190" height="36" rx="6" fill="#ddd6fe"/><text x="485" y="31" text-anchor="middle" class="svg-ink" font-size="12">NK-PANORAMA-2 .51</text>
<line x1="155" y1="44" x2="155" y2="60" stroke="#64748b" stroke-width="2"/><line x1="485" y1="44" x2="485" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="126" width="140" height="34" rx="6" fill="#bae6fd"/><text x="130" y="148" text-anchor="middle" class="svg-ink" font-size="12">PA1 .11</text>
<rect x="250" y="126" width="140" height="34" rx="6" fill="#bae6fd"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="12">PA2 .12</text>
<rect x="440" y="126" width="140" height="34" rx="6" fill="#bae6fd"/><text x="510" y="148" text-anchor="middle" class="svg-ink" font-size="12">PA3 .13</text>
<line x1="130" y1="110" x2="130" y2="126" stroke="#64748b" stroke-width="2"/><line x1="320" y1="110" x2="320" y2="126" stroke="#64748b" stroke-width="2"/><line x1="510" y1="110" x2="510" y2="126" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Sab management network par milte hain. Yahan dono Panorama ek doosre ko reach nahi kar sakte to koi HA setting madad nahi karegi.</p></div>

<h3>Versions aur limits ke baare mein imaandaari</h3>
<p>Real life mein dono peers ko matching software versions par hona chahiye, aur pair ko upgrade karne ka order aur procedure specific hota hai. Simulator versions, peers ke beech HA link, encryption ya heartbeat timers model nahi karta. HA traffic kaun si interface par jaata hai, kaun se timers lagte hain aur kaun se ports use hote hain: apne PAN-OS version ki documentation check karo. Kabhi mat maano ki is course ki koi detail real default hai.</p>

<h3>Change window</h3>
<ol>
<li><b>Pehle backup lo</b> existing Panorama configuration ka (chapter 10).</li>
<li>Window announce karo. HA add karne se firewall traffic nahi rukta, par galti se management confuse ho sakta hai.</li>
<li>Pehle primary configure aur commit karo, phir secondary.</li>
<li>Dono par state output aur synchronization line se <b>verify</b> karo.</li>
<li>Uske baad hi firewalls ko doosra server sikhao (chapter 6).</li>
</ol>

<pre class="code"><span class="c">! plan comments mein, phir commands (lab, secondary side)</span>
configure
set deviceconfig high-availability enabled yes
set deviceconfig high-availability peer-ip-address 192.0.2.50
set deviceconfig high-availability election-option priority secondary
commit</pre>

<div class="warn"><p>Jis network par secondary ka address pehle se kisi aur ke paas ho wahan secondary ko pehle configure mat karo. HA enable karne se pehle confirm karo ki naye Panorama ka management address unique hai.</p></div>

<div class="scn"><h4>Peer address mein ek digit ki galti</h4><p>Window mein ek engineer ne peer ke roop mein 192.0.2.51 ki jagah 192.0.2.15 type kar diya. Primary ne report kiya ki us address par koi Panorama answer nahi karta. Planning table par ek nazar se pakad mein aa jaata. Yahi lab <code>pn-ha-ts</code> hai.</p><p><b>Lesson:</b> plan pehle likho, addresses uss se copy karo, aur har commit ke baad state output padho.</p></div>

<div class="iv"><p class="q">"Panorama HA pair banane se pehle aap kya check karte ho?"</p><p>Management reachability dono taraf, unique addresses, matching software versions, kaun primary, preemption ka choice, fresh backup, change window, aur ki firewalls ko doosra server sikhaya jaayega. Baad mein state output se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Addresses, roles aur preemption pehle kaagaz par plan karo.</li>
<li>Peers ko management network par ek doosre tak pahunchna chahiye.</li>
<li>Matching versions aur upgrade order: apne PAN-OS version ki documentation check karo.</li>
<li>Backup, window, configure, verify, phir firewalls.</li>
</ul></div>
`}};export{e as default};