var e={id:`overview`,h:{en:`Why firewalls come in pairs: what you will learn and the big picture`,hi:`Firewalls jodi mein kyun aate hain: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how two Palo Alto Networks firewalls work as one active/passive high availability (HA) pair: which links join them, how they choose who is active, what is copied from one to the other, what makes them fail over, and how to prove it all with the CLI. This is the HA part of the PAN-OS Configuration and Deployment skills for the NGFW Engineer track, and it is one of the most common interview topics for firewall roles.</p>
<p><b>Prerequisites.</b> Finish the basics first: interfaces, zones and virtual routers (module pan-setup) and security policy (module pan-policy). You should know what a session is. You do not need any HA experience. A note on practice: this module has no hands-on lab in the simulator, so every configuration you see is labelled <b>Reference configuration (not run in the simulator)</b>. For related practice, use pan-setup, pan-policy and pan-diag, and compare ideas with the vendor-neutral modules nse4-ha (FortiGate clusters) and sec-asa-ha (Cisco).</p>

<h3>Analogy: two pilots, one aircraft</h3>
<p>A long-haul flight has a captain and a first officer. Only the captain flies, but the first officer sits in the same cockpit, hears every radio call and sees every instrument. If the captain becomes unwell, the first officer takes the controls and the passengers feel almost nothing. In an <b>active/passive HA pair</b> the <b>active</b> firewall forwards all traffic. The <b>passive</b> firewall listens, copies the configuration and the session table, and watches the active one. If the active one fails, the passive one becomes active within seconds and existing connections usually continue.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Active passive HA pair">
<rect x="20" y="70" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="14">FW-A (active)</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">forwards all traffic</text>
<rect x="450" y="70" width="170" height="90" rx="10" fill="#e2e8f0"/><text x="535" y="105" text-anchor="middle" class="svg-ink" font-size="14">FW-B (passive)</text><text x="535" y="128" text-anchor="middle" class="svg-muted" font-size="12">synced, ready, watching</text>
<line x1="190" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">HA1: control, config, heartbeat</text>
<line x1="190" y1="125" x2="450" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="143" text-anchor="middle" class="svg-accent" font-size="12">HA2: session state sync</text>
<rect x="250" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Users / Internet side</text>
<line x1="105" y1="70" x2="270" y2="44" stroke="#64748b" stroke-width="2"/><line x1="535" y1="70" x2="370" y2="44" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Solid line = carries traffic now. Dashed = ready, but passive.</text>
</svg><p class="cap">An active/passive pair: one firewall forwards, the other waits with the same configuration and sessions.</p></div>

<h3>The problem HA solves</h3>
<p>A single firewall is a single point of failure. Power supplies fail, software crashes, a cable is cut. If that firewall is the only door between the office and the Internet, the whole company stops. HA removes the single point of failure for the firewall itself. It does <b>not</b> protect against a failure elsewhere, such as the upstream ISP, which is why path monitoring (chapter 6) exists.</p>

<h3>The moving parts you will meet</h3>
<dl class="terms">
<dt>HA pair and group ID</dt><dd>Two firewalls that share the same group ID and see each other over the HA links.</dd>
<dt>HA1 (control link)</dt><dd>Carries hellos, heartbeats, state information and configuration synchronisation.</dd>
<dt>HA2 (data link)</dt><dd>Carries session information so the passive firewall knows the live connections.</dd>
<dt>Device priority and preemption</dt><dd>Decide which firewall should be active, and whether it takes the role back after recovery.</dd>
<dt>Link and path monitoring</dt><dd>Make the pair fail over when an interface or a remote destination is lost, not only when a whole box dies.</dd>
</dl>

<h3>Course map</h3>
<ol>
<li>Big picture (this chapter).</li>
<li>HA links and HA1/HA2 details.</li>
<li>Requirements and design choices.</li>
<li>Configuring the pair.</li>
<li>What is synchronised.</li>
<li>Link and path monitoring.</li>
<li>Priority, preemption, states and failover.</li>
<li>Troubleshooting workflow.</li>
<li>Summary and exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A company has FW-A and FW-B at its head office. Users in 10.10.0.0/16 reach the Internet through FW-A. A user has a long file download running. FW-A loses power. FW-B notices the missing heartbeats, becomes active, sends gratuitous ARP so switches learn the new path, and picks up the download from the session copy it already held. The user may see a short pause and the download carries on.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking HA is a backup of the configuration. HA keeps the pair running, but a bad change committed on one firewall is copied to the other. HA is not a replacement for configuration backups.</p></div>
<div class="exam"><p><b>Exam trap.</b> In PAN-OS the passive firewall is not forwarding traffic, but it is not off. It runs, syncs and monitors. Also remember there are active/passive and active/active modes. This module covers active/passive only.</p></div>

<div class="scn"><h4>The firewall that was alone for two years</h4><p>A retail company ran a single firewall at its warehouse. One night a failed power supply took it down and the warehouse could not scan stock for six hours. After the incident they bought a second identical unit and built an HA pair. Six months later the same power supply fault happened to the primary; the scanners kept working and the on-call engineer only learned about it from an alert in the morning.</p><p><b>Lesson:</b> HA converts an outage into a maintenance ticket, provided the pair is built and tested properly.</p></div>

<div class="iv"><p class="q">"What is active/passive HA on a Palo Alto firewall?"</p><p>Two identical firewalls, one actively forwarding and one passive but fully synchronised. They exchange heartbeats and hellos on HA1, session state on HA2, and the passive unit takes over if the active one fails or a monitored link or path is lost. Mention the configuration and session sync and that failover is usually seconds.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Active/passive HA means one forwarding firewall and one synchronised standby.</li>
<li>HA1 is the control link; HA2 carries session state.</li>
<li>HA removes the firewall as a single point of failure, not the ISP or the LAN.</li>
<li>Priority and preemption choose the active unit; monitoring triggers failover.</li>
<li>This module is reference only. Practise the surrounding skills in pan-setup, pan-policy and pan-diag.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki do Palo Alto Networks firewalls ek active/passive high availability (HA) pair ki tarah kaise kaam karte hain: unhe kaun se links jodte hain, active kaun hoga yeh kaise chunte hain, ek se doosre mein kya copy hota hai, failover kis wajah se hota hai, aur CLI se yeh sab kaise prove karte hain. Yeh NGFW Engineer track ke PAN-OS Configuration and Deployment skills ka HA hissa hai, aur firewall roles ke interviews mein sabse common topics mein se ek hai.</p>
<p><b>Prerequisites.</b> Pehle basics khatam karo: interfaces, zones aur virtual routers (module pan-setup) aur security policy (module pan-policy). Aapko pata hona chahiye ki session kya hota hai. HA ka koi experience zaroori nahi. Practice ke baare mein ek baat: is module ka simulator mein koi hands-on lab nahi hai, isliye jo bhi configuration yahan dikhti hai uspar <b>Reference configuration (not run in the simulator)</b> likha hai. Related practice ke liye pan-setup, pan-policy aur pan-diag use karo, aur vendor ke saath ideas compare karne ke liye nse4-ha (FortiGate clusters) aur sec-asa-ha (Cisco) dekho.</p>

<h3>Analogy: do pilots, ek aircraft</h3>
<p>Lambi flight mein ek captain aur ek first officer hota hai. Udaata sirf captain hai, lekin first officer usi cockpit mein baitha hai, har radio call sunta hai aur har instrument dekhta hai. Captain ki tabiyat bigad jaaye to first officer control sambhal leta hai aur passengers ko lagbhag kuch mehsoos nahi hota. <b>Active/passive HA pair</b> mein <b>active</b> firewall saara traffic forward karta hai. <b>Passive</b> firewall sunta hai, configuration aur session table copy karta hai, aur active par nazar rakhta hai. Active fail ho jaaye to passive kuch seconds mein active ban jaata hai aur maujooda connections aksar chalte rehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Active passive HA pair">
<rect x="20" y="70" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="105" y="105" text-anchor="middle" class="svg-ink" font-size="14">FW-A (active)</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">saara traffic forward</text>
<rect x="450" y="70" width="170" height="90" rx="10" fill="#e2e8f0"/><text x="535" y="105" text-anchor="middle" class="svg-ink" font-size="14">FW-B (passive)</text><text x="535" y="128" text-anchor="middle" class="svg-muted" font-size="12">synced, ready, watching</text>
<line x1="190" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">HA1: control, config, heartbeat</text>
<line x1="190" y1="125" x2="450" y2="125" stroke="#64748b" stroke-width="2"/><text x="320" y="143" text-anchor="middle" class="svg-accent" font-size="12">HA2: session state sync</text>
<rect x="250" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Users / Internet side</text>
<line x1="105" y1="70" x2="270" y2="44" stroke="#64748b" stroke-width="2"/><line x1="535" y1="70" x2="370" y2="44" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Solid line = abhi traffic le jaati hai. Dashed = ready, lekin passive.</text>
</svg><p class="cap">Active/passive pair: ek firewall forward karta hai, doosra wahi configuration aur sessions leke intezaar karta hai.</p></div>

<h3>HA kaun si problem solve karta hai</h3>
<p>Ek akela firewall single point of failure hai. Power supply kharab hoti hai, software crash hota hai, cable kat jaati hai. Agar woh firewall office aur Internet ke beech ka akela darwaza hai to poori company ruk jaati hai. HA firewall ke single point of failure ko hata deta hai. Yeh kisi aur jagah ki failure, jaise upstream ISP, se <b>nahi</b> bachata, isliye path monitoring (chapter 6) hoti hai.</p>

<h3>Jin moving parts se miloge</h3>
<dl class="terms">
<dt>HA pair aur group ID</dt><dd>Do firewalls jinka group ID same hai aur jo HA links par ek doosre ko dekhte hain.</dd>
<dt>HA1 (control link)</dt><dd>Hellos, heartbeats, state information aur configuration synchronisation le jaata hai.</dd>
<dt>HA2 (data link)</dt><dd>Session information le jaata hai taaki passive firewall ko live connections pata rahein.</dd>
<dt>Device priority aur preemption</dt><dd>Tay karte hain ki active kaun hoga, aur recovery ke baad role wapas milega ya nahi.</dd>
<dt>Link aur path monitoring</dt><dd>Pair ko tab bhi failover karate hain jab sirf ek interface ya remote destination jaaye, poora box nahi.</dd>
</dl>

<h3>Course map</h3>
<ol>
<li>Big picture (yeh chapter).</li>
<li>HA links aur HA1/HA2 ki details.</li>
<li>Requirements aur design choices.</li>
<li>Pair configure karna.</li>
<li>Kya synchronise hota hai.</li>
<li>Link aur path monitoring.</li>
<li>Priority, preemption, states aur failover.</li>
<li>Troubleshooting workflow.</li>
<li>Summary aur exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek company ke head office mein FW-A aur FW-B hain. 10.10.0.0/16 ke users FW-A se Internet jaate hain. Ek user ka lamba file download chal raha hai. FW-A ki power chali jaati hai. FW-B ko heartbeats aana band hone ka pata chalta hai, woh active banta hai, gratuitous ARP bhejta hai taaki switches naya path seekh lein, aur jo session copy uske paas pehle se thi usse download aage badha deta hai. User ko chhota sa pause dikh sakta hai aur download chalta rehta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> HA ko configuration ka backup samajhna. HA pair ko chalta rakhta hai, lekin ek firewall par commit hua galat change doosre par bhi copy ho jaata hai. HA configuration backups ka replacement nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> PAN-OS mein passive firewall traffic forward nahi karta, lekin woh band nahi hai. Woh chalta hai, sync karta hai aur monitor karta hai. Yeh bhi yaad rakho ki active/passive aur active/active dono modes hote hain. Yeh module sirf active/passive cover karta hai.</p></div>

<div class="scn"><h4>Woh firewall jo do saal akela raha</h4><p>Ek retail company ke warehouse mein ek hi firewall chalta tha. Ek raat kharab power supply ne use gira diya aur warehouse mein stock scan chhe ghante nahi ho paaya. Incident ke baad unhone ek identical doosra unit kharida aur HA pair banaya. Chhe mahine baad primary par wahi power supply fault aaya; scanners chalte rahe aur on-call engineer ko subah ek alert se hi pata chala.</p><p><b>Lesson:</b> HA outage ko maintenance ticket mein badal deta hai, shart yeh hai ki pair sahi se bana aur test kiya gaya ho.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall par active/passive HA kya hai?"</p><p>Do identical firewalls, ek actively forward karta hai aur ek passive lekin poori tarah synchronised. Woh HA1 par heartbeats aur hellos, HA2 par session state exchange karte hain, aur active fail ho ya koi monitored link ya path jaaye to passive take over karta hai. Configuration aur session sync ka zikr karo aur yeh ki failover aam taur par seconds mein hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Active/passive HA ka matlab ek forwarding firewall aur ek synchronised standby.</li>
<li>HA1 control link hai; HA2 session state le jaata hai.</li>
<li>HA firewall ka single point of failure hatata hai, ISP ya LAN ka nahi.</li>
<li>Priority aur preemption active unit chunte hain; monitoring failover trigger karti hai.</li>
<li>Yeh module sirf reference hai. Aas-paas ki skills pan-setup, pan-policy aur pan-diag mein practise karo.</li>
</ul></div>
`}};export{e as default};