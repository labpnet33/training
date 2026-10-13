var e={id:`big-picture`,h:{en:`Why firewalls come in pairs: the big picture of high availability`,hi:`Firewalls jodi mein kyun aate hain: high availability ki badi tasveer`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why a production firewall is almost never deployed alone, build a Cisco ASA <b>active/standby failover pair</b> with a <b>stateful link</b>, prove that the configuration and the connection table are replicated, pull the plug on the active unit while an SSH session survives, read every line of <code>show failover</code>, tune health monitoring, fail back in a controlled way, upgrade a pair with zero downtime, and troubleshoot a pair that refuses to form. You will also understand, at concept level, <b>active/active failover</b>, <b>Threat Defense HA in the Management Center</b> and <b>ASA / Threat Defense clustering</b>. This covers the high availability items of the CCNP Security core exam (SCOR 350-701) and the firewall concentration exam (SNCF 300-710).</p>
<p><b>Prerequisites.</b> You should already be comfortable with the ASA basics from the earlier modules in this track: interfaces with <code>nameif</code> and security levels, static routes, dynamic PAT, access rules and the troubleshooting tools <code>packet-tracer</code>, <code>show conn</code> and syslog. If <code>nat (inside,outside) dynamic interface</code> and <code>show conn</code> feel familiar, you are ready.</p>

<h3>An analogy: the pilot and the co-pilot</h3>
<p>A passenger aircraft has two pilots. Only one flies the plane at a time (the <b>pilot flying</b>); the other (the <b>pilot monitoring</b>) sits next to them, watches the same instruments, hears the same radio calls and knows the exact state of the flight. If the pilot flying becomes unwell, the co-pilot takes the controls in seconds. The passengers notice nothing because the co-pilot did not need to be briefed: they already knew the altitude, the heading and the clearance.</p>
<p>An ASA failover pair works the same way. One unit is <b>Active</b> and forwards every packet. The other is <b>Standby</b>: it receives a copy of the configuration and, with stateful failover, a copy of every connection and translation. The two units exchange <b>hello</b> messages constantly. If the active unit stops answering, or loses an important interface, the standby takes over the same IP addresses and MAC addresses. Hosts and routers keep sending to the same addresses and existing sessions continue.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="10" y="60" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="50" y="83" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="10" y="190" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="50" y="213" text-anchor="middle" class="svg-ink" font-size="13">PC2 .11</text>
<rect x="120" y="125" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="148" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="90" y1="78" x2="120" y2="140" stroke="#64748b" stroke-width="2"/><line x1="90" y1="208" x2="120" y2="148" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="315" y="61" text-anchor="middle" class="svg-ink" font-size="13">ASA1 primary</text><text x="315" y="79" text-anchor="middle" class="svg-accent" font-size="12">Active</text>
<rect x="250" y="200" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="315" y="221" text-anchor="middle" class="svg-ink" font-size="13">ASA2 secondary</text><text x="315" y="239" text-anchor="middle" class="svg-muted" font-size="12">Standby Ready</text>
<line x1="200" y1="140" x2="250" y2="65" stroke="#64748b" stroke-width="2"/><line x1="200" y1="148" x2="250" y2="225" stroke="#64748b" stroke-width="2"/>
<text x="178" y="100" class="svg-muted" font-size="12">inside 10.0.1.1</text>
<line x1="300" y1="90" x2="300" y2="200" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="296" y="140" text-anchor="end" class="svg-accent" font-size="12">FOLINK Gi0/5</text>
<line x1="335" y1="90" x2="335" y2="200" stroke="#64748b" stroke-width="3"/><text x="341" y="160" class="svg-accent" font-size="12">STATELINK Gi0/4</text>
<rect x="440" y="125" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="480" y="148" text-anchor="middle" class="svg-ink" font-size="13">SW-OUT</text>
<line x1="380" y1="65" x2="440" y2="140" stroke="#64748b" stroke-width="2"/><line x1="380" y1="225" x2="440" y2="148" stroke="#64748b" stroke-width="2"/>
<text x="392" y="100" class="svg-muted" font-size="12">outside 203.0.113.2</text>
<rect x="545" y="125" width="85" height="36" rx="8" fill="#fed7aa"/><text x="587" y="148" text-anchor="middle" class="svg-ink" font-size="13">ISP .1</text>
<line x1="520" y1="143" x2="545" y2="143" stroke="#64748b" stroke-width="2"/>
<text x="587" y="190" text-anchor="middle" class="svg-muted" font-size="12">INET 8.8.8.8</text>
<text x="320" y="285" text-anchor="middle" class="svg-ink" font-size="12">Standby addresses: outside 203.0.113.3, inside 10.0.1.2</text>
</svg><p class="cap">The lab topology used in every chapter: two ASAs between SW-IN and SW-OUT, a failover LAN link (Gi0/5) and a dedicated stateful link (Gi0/4).</p></div>

<h3>The problem: single points of failure</h3>
<p>Every packet between your users and the internet crosses the firewall. If that one box fails (a power supply, a software crash, a bad upgrade, a cable pulled by mistake), the whole site is offline. A component whose failure stops the service on its own is called a <b>single point of failure</b> (SPOF). High availability (HA) removes those points one layer at a time:</p>
<table class="cmp"><tr><th>What can fail</th><th>HA answer on Cisco Secure Firewall</th><th>Covered in</th></tr>
<tr><td>The firewall itself</td><td><b>Active/standby failover</b> (ASA and Threat Defense)</td><td>this module, in depth</td></tr>
<tr><td>You want both boxes busy</td><td><b>Active/active failover</b> (ASA in multiple context mode)</td><td>this module, concept</td></tr>
<tr><td>One box is not fast enough</td><td><b>Clustering</b> (up to 16 units on some platforms)</td><td>this module, concept</td></tr>
<tr><td>A cable or switch port</td><td>EtherChannel, redundant interfaces</td><td>earlier modules</td></tr>
<tr><td>The ISP link</td><td>Static route tracking with IP SLA, ECMP</td><td>next module (Firewall deployment)</td></tr></table>

<h3>What "high availability" really promises</h3>
<p>Availability is measured as a percentage of time the service works. "Five nines" (99.999 %) allows about 5 minutes of downtime per year. A single firewall that needs one 30-minute upgrade window per quarter already fails that target. A failover pair lets you reboot, upgrade or replace one unit while the other carries the traffic, so planned work stops being downtime. Two terms appear in every design review:</p>
<dl class="terms">
<dt>Failover time</dt><dd>How long traffic stops while the standby takes over. It is governed by how fast the failure is <b>detected</b> (hello timers, covered in chapter 7) plus a short switchover.</dd>
<dt>Stateful vs stateless</dt><dd>In a <b>stateless</b> pair the new active unit starts with an empty connection table, so every existing session breaks. In a <b>stateful</b> pair the connection table was copied beforehand, so sessions survive. Chapter 6 is dedicated to this.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> A retail company runs one ASA. It is patched four times a year with 20 minutes of outage each time, and last year it crashed once and took 2 hours to replace. Downtime = 4 × 20 + 120 = 200 minutes, availability = 1 − 200 / 525 600 ≈ 99.96 %. With a stateful failover pair, patches become hitless and a crash costs about 15 seconds with default timers (sub-second with tuned timers). Downtime drops to well under a minute per year.</p></div>

<h3>The four labs in this module</h3>
<ol>
<li><b>Build an active/standby pair with stateful failover</b>: ASA1 becomes primary and active, ASA2 secondary; chapter 5.</li>
<li><b>Failover drill</b>: keep an SSH session open from PC1 to the ISP router, reload ASA1, and the session survives; chapters 6 and 8.</li>
<li><b>Ticket: the new secondary never joins the pair</b>: a wrong failover interface and a wrong key; chapter 12.</li>
<li><b>A dead inside link triggers failover (and failing back)</b>: interface monitoring and manual failback; chapters 7, 8 and 10.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Believing that "two firewalls" automatically means HA. Two ASAs without failover are two independent boxes with different addresses: hosts have one gateway, so when that box dies they are still cut off. HA needs the pair to share addresses and state.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active/standby failover protects against a unit failure; it does <b>not</b> add throughput. Only active/active (per context) and clustering let more than one unit forward traffic, and only clustering scales a single policy beyond one box.</p></div>

<div class="scn"><h4>The upgrade that took the shop offline</h4><p>A store chain had a single ASA at each branch. A security advisory forced an urgent upgrade. The engineer scheduled the reload at 22:00, but the new image took 12 minutes to boot and the card terminals lost their payment sessions, so the evening's last sales failed. The next quarter the company added a second ASA at the ten largest stores and configured stateful failover. The following upgrade was done at lunchtime: upgrade the standby, swap roles, upgrade the other unit. No terminal noticed.</p><p><b>Lesson:</b> the first benefit of a failover pair is not surviving crashes, it is making planned maintenance invisible.</p></div>

<div class="iv"><p class="q">"Why do we deploy firewalls in pairs, and what is the difference between stateful and stateless failover?"</p><p>Strong answer: the firewall is in the path of every flow, so a single unit is a single point of failure for both crashes and maintenance. In a failover pair the standby takes over the active IP and MAC addresses, so neighbours do not need to change anything. Stateless failover moves only addresses, so sessions reset; stateful failover also replicates connections and translations over a state link, so TCP sessions and VPNs survive. Mention detection time (hello and hold timers) as the other half of failover time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A single firewall is a single point of failure for crashes and for planned maintenance.</li>
<li>Active/standby failover: one unit forwards, the other watches and takes over the same IP and MAC addresses.</li>
<li>Stateful failover copies connections and translations so sessions survive a switchover.</li>
<li>Active/active needs multiple contexts; clustering is the only option that scales throughput.</li>
<li>The lab pair: ASA1 primary, ASA2 secondary, FOLINK on Gi0/5, STATELINK on Gi0/4.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki production firewall lagbhag kabhi akela deploy kyun nahi hota, ek Cisco ASA <b>active/standby failover pair</b> <b>stateful link</b> ke saath bana paoge, saabit kar paoge ki configuration aur connection table replicate hote hain, active unit ka plug kheench paoge jabki SSH session bacha rahe, <code>show failover</code> ki har line padh paoge, health monitoring tune kar paoge, controlled tareeke se fail back kar paoge, zero downtime ke saath pair upgrade kar paoge, aur us pair ko troubleshoot kar paoge jo banne se mana karta hai. Aap concept level par <b>active/active failover</b>, <b>Management Center mein Threat Defense HA</b> aur <b>ASA / Threat Defense clustering</b> bhi samjhoge. Yeh CCNP Security core exam (SCOR 350-701) aur firewall concentration exam (SNCF 300-710) ke high availability items cover karta hai.</p>
<p><b>Prerequisites.</b> Aapko is track ke pehle modules ke ASA basics mein comfortable hona chahiye: <code>nameif</code> aur security levels wale interfaces, static routes, dynamic PAT, access rules aur troubleshooting tools <code>packet-tracer</code>, <code>show conn</code> aur syslog. Agar <code>nat (inside,outside) dynamic interface</code> aur <code>show conn</code> jaane pehchane lagte hain, to aap ready ho.</p>

<h3>Ek analogy: pilot aur co-pilot</h3>
<p>Passenger aircraft mein do pilots hote hain. Ek samay mein sirf ek plane udaata hai (<b>pilot flying</b>); doosra (<b>pilot monitoring</b>) bagal mein baithta hai, wahi instruments dekhta hai, wahi radio calls sunta hai aur flight ki exact state jaanta hai. Agar pilot flying ki tabiyat bigad jaaye, co-pilot seconds mein controls le leta hai. Passengers ko kuch pata nahi chalta kyunki co-pilot ko brief karne ki zaroorat nahi thi: use altitude, heading aur clearance pehle se pata the.</p>
<p>ASA failover pair bilkul aise hi kaam karta hai. Ek unit <b>Active</b> hota hai aur har packet forward karta hai. Doosra <b>Standby</b> hota hai: use configuration ki copy milti hai aur, stateful failover ke saath, har connection aur translation ki copy bhi. Dono units lagatar <b>hello</b> messages exchange karte hain. Agar active unit jawab dena band kar de, ya koi important interface kho de, to standby wahi IP addresses aur MAC addresses le leta hai. Hosts aur routers usi address par bhejte rehte hain aur existing sessions chalte rehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="10" y="60" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="50" y="83" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="10" y="190" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="50" y="213" text-anchor="middle" class="svg-ink" font-size="13">PC2 .11</text>
<rect x="120" y="125" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="148" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="90" y1="78" x2="120" y2="140" stroke="#64748b" stroke-width="2"/><line x1="90" y1="208" x2="120" y2="148" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="315" y="61" text-anchor="middle" class="svg-ink" font-size="13">ASA1 primary</text><text x="315" y="79" text-anchor="middle" class="svg-accent" font-size="12">Active</text>
<rect x="250" y="200" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="315" y="221" text-anchor="middle" class="svg-ink" font-size="13">ASA2 secondary</text><text x="315" y="239" text-anchor="middle" class="svg-muted" font-size="12">Standby Ready</text>
<line x1="200" y1="140" x2="250" y2="65" stroke="#64748b" stroke-width="2"/><line x1="200" y1="148" x2="250" y2="225" stroke="#64748b" stroke-width="2"/>
<text x="178" y="100" class="svg-muted" font-size="12">inside 10.0.1.1</text>
<line x1="300" y1="90" x2="300" y2="200" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="296" y="140" text-anchor="end" class="svg-accent" font-size="12">FOLINK Gi0/5</text>
<line x1="335" y1="90" x2="335" y2="200" stroke="#64748b" stroke-width="3"/><text x="341" y="160" class="svg-accent" font-size="12">STATELINK Gi0/4</text>
<rect x="440" y="125" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="480" y="148" text-anchor="middle" class="svg-ink" font-size="13">SW-OUT</text>
<line x1="380" y1="65" x2="440" y2="140" stroke="#64748b" stroke-width="2"/><line x1="380" y1="225" x2="440" y2="148" stroke="#64748b" stroke-width="2"/>
<text x="392" y="100" class="svg-muted" font-size="12">outside 203.0.113.2</text>
<rect x="545" y="125" width="85" height="36" rx="8" fill="#fed7aa"/><text x="587" y="148" text-anchor="middle" class="svg-ink" font-size="13">ISP .1</text>
<line x1="520" y1="143" x2="545" y2="143" stroke="#64748b" stroke-width="2"/>
<text x="587" y="190" text-anchor="middle" class="svg-muted" font-size="12">INET 8.8.8.8</text>
<text x="320" y="285" text-anchor="middle" class="svg-ink" font-size="12">Standby addresses: outside 203.0.113.3, inside 10.0.1.2</text>
</svg><p class="cap">Har chapter mein use hone wali lab topology: SW-IN aur SW-OUT ke beech do ASAs, ek failover LAN link (Gi0/5) aur ek dedicated stateful link (Gi0/4).</p></div>

<h3>Problem: single points of failure</h3>
<p>Users aur internet ke beech har packet firewall se guzarta hai. Agar woh ek box fail ho jaaye (power supply, software crash, kharab upgrade, galti se kheenchi gayi cable), to poori site offline ho jaati hai. Jis component ka akele fail hona service rok de, use <b>single point of failure</b> (SPOF) kehte hain. High availability (HA) in points ko ek-ek layer karke hatata hai:</p>
<table class="cmp"><tr><th>Kya fail ho sakta hai</th><th>Cisco Secure Firewall par HA jawab</th><th>Kahan cover hai</th></tr>
<tr><td>Firewall khud</td><td><b>Active/standby failover</b> (ASA aur Threat Defense)</td><td>yeh module, detail mein</td></tr>
<tr><td>Aap chahte ho dono box kaam karein</td><td><b>Active/active failover</b> (multiple context mode wala ASA)</td><td>yeh module, concept</td></tr>
<tr><td>Ek box kaafi tez nahi</td><td><b>Clustering</b> (kuch platforms par 16 units tak)</td><td>yeh module, concept</td></tr>
<tr><td>Cable ya switch port</td><td>EtherChannel, redundant interfaces</td><td>pehle ke modules</td></tr>
<tr><td>ISP link</td><td>IP SLA ke saath static route tracking, ECMP</td><td>agla module (Firewall deployment)</td></tr></table>

<h3>"High availability" asal mein kya vaada karta hai</h3>
<p>Availability ko us samay ke percentage mein naapte hain jab service chalti hai. "Five nines" (99.999 %) saal mein lagbhag 5 minute ka downtime allow karta hai. Ek single firewall jise har quarter ek 30-minute upgrade window chahiye, pehle hi yeh target fail kar deta hai. Failover pair aapko ek unit reboot, upgrade ya replace karne deta hai jabki doosra traffic sambhalta hai, isliye planned kaam downtime nahi rehta. Har design review mein do terms aate hain:</p>
<dl class="terms">
<dt>Failover time</dt><dd>Standby ke take over karte samay traffic kitni der rukta hai. Yeh is par depend karta hai ki failure kitni jaldi <b>detect</b> hota hai (hello timers, chapter 7 mein) plus ek chhota switchover.</dd>
<dt>Stateful vs stateless</dt><dd><b>Stateless</b> pair mein naya active unit khaali connection table ke saath shuru hota hai, isliye har existing session toot jaata hai. <b>Stateful</b> pair mein connection table pehle se copy thi, isliye sessions bach jaate hain. Chapter 6 poora isi par hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Ek retail company ek ASA chalati hai. Saal mein chaar baar patch hota hai, har baar 20 minute ka outage, aur pichhle saal ek baar crash hua jise replace karne mein 2 ghante lage. Downtime = 4 × 20 + 120 = 200 minutes, availability = 1 − 200 / 525 600 ≈ 99.96 %. Stateful failover pair ke saath patches hitless ho jaate hain aur crash ki keemat default timers par lagbhag 15 second hoti hai (tuned timers par second se kam). Downtime saal mein ek minute se bhi kaafi kam ho jaata hai.</p></div>

<h3>Is module ke chaar labs</h3>
<ol>
<li><b>Stateful failover ke saath active/standby pair banao</b>: ASA1 primary aur active banta hai, ASA2 secondary; chapter 5.</li>
<li><b>Failover drill</b>: PC1 se ISP router tak SSH session khula rakho, ASA1 reload karo, aur session bach jaata hai; chapters 6 aur 8.</li>
<li><b>Ticket: naya secondary kabhi pair mein nahi judta</b>: galat failover interface aur galat key; chapter 12.</li>
<li><b>Dead inside link failover trigger karta hai (aur wapas lana)</b>: interface monitoring aur manual failback; chapters 7, 8 aur 10.</li>
</ol>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki "do firewalls" ka matlab apne aap HA hai. Bina failover ke do ASAs do independent boxes hain jinke alag addresses hain: hosts ka ek gateway hota hai, isliye woh box mare to woh phir bhi kat jaate hain. HA ke liye pair ko addresses aur state share karni padti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active/standby failover unit failure se bachata hai; yeh throughput <b>nahi</b> badhata. Sirf active/active (per context) aur clustering ek se zyada unit ko traffic forward karne dete hain, aur sirf clustering ek single policy ko ek box se aage scale karti hai.</p></div>

<div class="scn"><h4>Woh upgrade jisne shop ko offline kar diya</h4><p>Ek store chain ki har branch par ek single ASA tha. Ek security advisory ki wajah se urgent upgrade karna pada. Engineer ne reload 22:00 par schedule kiya, lekin naye image ko boot hone mein 12 minute lage aur card terminals ke payment sessions toot gaye, isliye shaam ki aakhri sales fail ho gayi. Agle quarter company ne das sabse bade stores par doosra ASA lagaya aur stateful failover configure kiya. Agla upgrade lunch time par hua: standby upgrade karo, roles swap karo, doosra unit upgrade karo. Kisi terminal ko pata nahi chala.</p><p><b>Seekh:</b> failover pair ka pehla faayda crashes jhelna nahi, balki planned maintenance ko invisible banana hai.</p></div>

<div class="iv"><p class="q">"Hum firewalls ko pairs mein kyun deploy karte hain, aur stateful aur stateless failover mein kya fark hai?"</p><p>Strong answer: firewall har flow ke raaste mein hota hai, isliye single unit crashes aur maintenance dono ke liye single point of failure hai. Failover pair mein standby active IP aur MAC addresses le leta hai, isliye neighbours ko kuch badalna nahi padta. Stateless failover sirf addresses move karta hai, isliye sessions reset hote hain; stateful failover state link par connections aur translations bhi replicate karta hai, isliye TCP sessions aur VPNs bach jaate hain. Failover time ke doosre hisse ke roop mein detection time (hello aur hold timers) ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Single firewall crashes aur planned maintenance dono ke liye single point of failure hai.</li>
<li>Active/standby failover: ek unit forward karta hai, doosra dekhta hai aur wahi IP aur MAC addresses le leta hai.</li>
<li>Stateful failover connections aur translations copy karta hai taaki switchover mein sessions bachein.</li>
<li>Active/active ko multiple contexts chahiye; clustering hi akela option hai jo throughput scale karta hai.</li>
<li>Lab pair: ASA1 primary, ASA2 secondary, Gi0/5 par FOLINK, Gi0/4 par STATELINK.</li>
</ul></div>
`}};export{e as default};