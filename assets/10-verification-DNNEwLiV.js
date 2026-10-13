var e={id:`verification`,h:{en:`Verifying NAT: show nat detail, show xlate, show conn and packet-tracer`,hi:`NAT verify karna: show nat detail, show xlate, show conn aur packet-tracer`},body:{en:`
<p>A doctor never diagnoses from one test. Blood pressure says one thing, an X-ray another, and a scan confirms. NAT verification works the same way. <code>show nat</code> tells you what the rules <b>are</b> and whether they are used; <code>show xlate</code> tells you which translations <b>exist</b> right now; <code>show conn</code> tells you which connections are <b>flowing</b>; and <code>packet-tracer</code> tells you what <b>would happen</b> to one packet, phase by phase. Four views, one truth.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four NAT views">
<rect x="10" y="40" width="145" height="90" rx="8" fill="#bae6fd"/><text x="82" y="68" text-anchor="middle" class="svg-ink" font-size="13">show nat</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">rules, order,</text><text x="82" y="108" text-anchor="middle" class="svg-muted" font-size="12">hit counters</text>
<rect x="170" y="40" width="145" height="90" rx="8" fill="#bbf7d0"/><text x="242" y="68" text-anchor="middle" class="svg-ink" font-size="13">show xlate</text><text x="242" y="90" text-anchor="middle" class="svg-muted" font-size="12">translations</text><text x="242" y="108" text-anchor="middle" class="svg-muted" font-size="12">in use now</text>
<rect x="330" y="40" width="145" height="90" rx="8" fill="#ddd6fe"/><text x="402" y="68" text-anchor="middle" class="svg-ink" font-size="13">show conn</text><text x="402" y="90" text-anchor="middle" class="svg-muted" font-size="12">live flows,</text><text x="402" y="108" text-anchor="middle" class="svg-muted" font-size="12">real addresses</text>
<rect x="490" y="40" width="145" height="90" rx="8" fill="#fed7aa"/><text x="562" y="68" text-anchor="middle" class="svg-ink" font-size="13">packet-tracer</text><text x="562" y="90" text-anchor="middle" class="svg-muted" font-size="12">one packet,</text><text x="562" y="108" text-anchor="middle" class="svg-muted" font-size="12">every phase</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">config, state, traffic, simulation</text>
</svg><p class="cap">Each command answers a different question; use them together.</p></div>

<h3>show nat and show nat detail</h3>
<pre class="out">NK-ASA# show nat detail
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
    translate_hits = 3, untranslate_hits = 57
    <span class="hl">Source - Origin: 10.0.2.10/32, Translated: 203.0.113.3/32</span>
2 (dmz) to (outside) source static JUMP interface  service tcp ssh 2222
    translate_hits = 0, untranslate_hits = 6
    Source - Origin: 10.0.2.20/32, Translated: 203.0.113.2/29
    <span class="hl">Service - Protocol: tcp Real: ssh Mapped: 2222</span>
3 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 1450, untranslate_hits = 3
    Source - Origin: 10.0.1.0/24, Translated: 203.0.113.2/29</pre>
<p><code>detail</code> expands every object into real addresses, which catches typos such as a wrong host in the object. For interface-based rules the translated value shows the interface address with its mask. Read the counters like this:</p>
<ul>
<li><b>translate_hits</b>: connections started from the real side (outbound for these rules).</li>
<li><b>untranslate_hits</b>: connections started toward the mapped address (inbound publishing).</li>
<li>Both zero on a publishing rule: traffic is not arriving at all. Look at DNS, the ISP route or ARP before blaming the ACL.</li>
<li>Untranslate climbing but users still failing: NAT is fine, look at the ACL or the server.</li>
</ul>
<p><code>clear nat counters</code> resets them before a test so the numbers you see are yours.</p>

<h3>show xlate</h3>
<pre class="out">NK-ASA# show xlate
4 in use, 41 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
NAT from dmz:10.0.2.10 to outside:203.0.113.3
    flags s idle 0:00:09 timeout 0:00:00
TCP PAT from dmz:10.0.2.20 22-22 to outside:203.0.113.2 2222-2222
    flags sr idle 0:00:31 timeout 0:00:00
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:02 timeout 0:00:30</span>
NAT from inside:10.0.1.0/24 to outside:10.0.1.0/24
    flags sIT idle 0:02:11 timeout 0:00:00</pre>
<p>Static rules show permanent entries (timeout 0). Dynamic PAT entries carry a port and flags <code>ri</code>. The last line, flags <code>sIT</code>, is a static identity twice NAT, like the VPN exemption of chapter 8. Filter with <code>show xlate local 10.0.1.10</code> on a busy box.</p>

<h3>show conn</h3>
<pre class="out">NK-ASA# show conn
3 in use, 12 most used
<span class="hl">TCP outside  8.8.8.8:40000 dmz  10.0.2.10:80, idle 0:00:03, bytes 1520, flags UIO</span>
TCP outside  198.51.100.10:40000 dmz  10.0.2.20:22, idle 0:00:05, bytes 4380, flags UIOB
TCP outside  8.8.8.8:443 inside  10.0.1.10:51544, idle 0:00:01, bytes 9812, flags UIO</pre>
<p><code>show conn</code> prints the <b>real</b> address of the host behind the ASA, so the published web server appears as 10.0.2.10:80, not 203.0.113.3. The flags <code>UIO</code> mean up, with inbound and outbound data: a healthy flow. A connection stuck with only SYN-related flags points to the server or its return path.</p>

<h3>packet-tracer: the NAT phases</h3>
<pre class="out">NK-ASA# packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 80

Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
NAT divert to egress interface dmz
<span class="hl">Untranslate 203.0.113.3/80 to 10.0.2.10/80</span>

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
access-list OUTSIDE_IN extended permit tcp any object WEB eq www

Phase: 3
Type: NAT
Subtype: rpf-check
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
...
Result:
input-interface: outside
output-interface: dmz
<span class="hl">Action: allow</span></pre>
<p><b>UN-NAT</b> rewrites the destination and selects the egress interface; <b>ACCESS-LIST</b> checks the real address; <b>NAT rpf-check</b> confirms the return traffic will match the same rule. For an outbound test, such as <code>packet-tracer input inside tcp 10.0.1.10 51000 8.8.8.8 443</code>, the NAT phase shows <code>Dynamic translate 10.0.1.10/51000 to 203.0.113.2/51000</code>.</p>

<h3>Syslog messages worth knowing</h3>
<ul>
<li><b>305011</b>: built a dynamic translation (PAT or dynamic NAT).</li>
<li><b>305012</b>: teardown of a dynamic translation.</li>
<li><b>305013</b>: asymmetric NAT rules for forward and reverse flows, connection denied due to NAT reverse path failure.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> You change WEB's static from .3 to .4, but the server's outbound backups still leave as 203.0.113.3. The existing connection and its translation were built before the change. <code>clear xlate local 10.0.2.10</code> (or <code>clear conn address 10.0.2.10</code>) removes the old state, the next connection uses .4, and <code>show xlate</code> confirms.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading <code>show nat</code> without resetting counters, then trusting a large untranslate number that was accumulated last month. Clear the counters, run one test, then read.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which command shows the translation slots in use, and which shows the connections?" <code>show xlate</code> for translations, <code>show conn</code> for connections. And <code>show conn</code> shows the real address of the inside or DMZ host.</p></div>

<div class="scn"><h4>Zero hits told the real story</h4><p>A partner said the new portal on 203.0.113.5 was unreachable. <code>clear nat counters</code>, one test from the partner, and <code>show nat</code> still showed zero untranslate hits. packet-tracer from the ASA said allow. So packets were never reaching the ASA: the ISP router's ARP table showed .5 as incomplete because an old <code>sysopt noproxyarp outside</code> line disabled proxy ARP. Removing it made the ASA answer ARP and the portal opened.</p><p><b>Lesson:</b> packet-tracer simulates inside the ASA; hit counters prove real packets arrived.</p></div>

<div class="iv"><p class="q">"A server is published but unreachable. Which ASA commands do you run and why?"</p><p><code>show nat detail</code> to check the rule and its untranslate counter; <code>packet-tracer</code> from outside to the mapped address to see UN-NAT, ACCESS-LIST and NAT phases; <code>show xlate</code> for the static entry; <code>show conn address</code> for live flows; then captures on both interfaces if needed. Explain what zero hits versus rising hits tells you.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show nat detail</code>: rules in order, real and translated values, translate and untranslate hits.</li>
<li><code>show xlate</code>: translations now; flags s, r, i, I, T tell you the type.</li>
<li><code>show conn</code>: live flows with real addresses.</li>
<li>packet-tracer phases: UN-NAT, ACCESS-LIST, NAT (rpf-check), result.</li>
<li>Clear counters before testing; clear xlate or conn after changing NAT.</li>
</ul></div>
`,hi:`
<p>Doctor kabhi ek test se diagnose nahi karta. Blood pressure ek baat kehta hai, X-ray doosri, aur scan confirm karta hai. NAT verification bhi aise hi kaam karta hai. <code>show nat</code> batata hai ki rules <b>kya hain</b> aur use ho rahi hain ya nahi; <code>show xlate</code> batata hai ki abhi kaunse translations <b>exist</b> karte hain; <code>show conn</code> batata hai ki kaunse connections <b>chal rahe hain</b>; aur <code>packet-tracer</code> batata hai ki ek packet ke saath phase by phase <b>kya hoga</b>. Chaar views, ek sach.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four NAT views">
<rect x="10" y="40" width="145" height="90" rx="8" fill="#bae6fd"/><text x="82" y="68" text-anchor="middle" class="svg-ink" font-size="13">show nat</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">rules, order,</text><text x="82" y="108" text-anchor="middle" class="svg-muted" font-size="12">hit counters</text>
<rect x="170" y="40" width="145" height="90" rx="8" fill="#bbf7d0"/><text x="242" y="68" text-anchor="middle" class="svg-ink" font-size="13">show xlate</text><text x="242" y="90" text-anchor="middle" class="svg-muted" font-size="12">abhi use ho rahe</text><text x="242" y="108" text-anchor="middle" class="svg-muted" font-size="12">translations</text>
<rect x="330" y="40" width="145" height="90" rx="8" fill="#ddd6fe"/><text x="402" y="68" text-anchor="middle" class="svg-ink" font-size="13">show conn</text><text x="402" y="90" text-anchor="middle" class="svg-muted" font-size="12">live flows,</text><text x="402" y="108" text-anchor="middle" class="svg-muted" font-size="12">real addresses</text>
<rect x="490" y="40" width="145" height="90" rx="8" fill="#fed7aa"/><text x="562" y="68" text-anchor="middle" class="svg-ink" font-size="13">packet-tracer</text><text x="562" y="90" text-anchor="middle" class="svg-muted" font-size="12">ek packet,</text><text x="562" y="108" text-anchor="middle" class="svg-muted" font-size="12">har phase</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">config, state, traffic, simulation</text>
</svg><p class="cap">Har command alag sawaal ka jawab deti hai; inhe saath use karo.</p></div>

<h3>show nat aur show nat detail</h3>
<pre class="out">NK-ASA# show nat detail
Auto NAT Policies (Section 2)
1 (dmz) to (outside) source static WEB 203.0.113.3
    translate_hits = 3, untranslate_hits = 57
    <span class="hl">Source - Origin: 10.0.2.10/32, Translated: 203.0.113.3/32</span>
2 (dmz) to (outside) source static JUMP interface  service tcp ssh 2222
    translate_hits = 0, untranslate_hits = 6
    Source - Origin: 10.0.2.20/32, Translated: 203.0.113.2/29
    <span class="hl">Service - Protocol: tcp Real: ssh Mapped: 2222</span>
3 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 1450, untranslate_hits = 3
    Source - Origin: 10.0.1.0/24, Translated: 203.0.113.2/29</pre>
<p><code>detail</code> har object ko real addresses mein expand karta hai, jisse object mein galat host jaise typos pakde jaate hain. Interface-based rules ke liye translated value interface address ko uske mask ke saath dikhati hai. Counters aise padho:</p>
<ul>
<li><b>translate_hits</b>: real side se shuru hue connections (in rules ke liye outbound).</li>
<li><b>untranslate_hits</b>: mapped address ki taraf shuru hue connections (inbound publishing).</li>
<li>Publishing rule par dono zero: traffic aa hi nahi raha. ACL ko blame karne se pehle DNS, ISP route ya ARP dekho.</li>
<li>Untranslate badh raha hai lekin users ab bhi fail: NAT theek hai, ACL ya server dekho.</li>
</ul>
<p><code>clear nat counters</code> test se pehle unhe reset karta hai taaki jo numbers aap dekho woh aapke hon.</p>

<h3>show xlate</h3>
<pre class="out">NK-ASA# show xlate
4 in use, 41 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
NAT from dmz:10.0.2.10 to outside:203.0.113.3
    flags s idle 0:00:09 timeout 0:00:00
TCP PAT from dmz:10.0.2.20 22-22 to outside:203.0.113.2 2222-2222
    flags sr idle 0:00:31 timeout 0:00:00
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:02 timeout 0:00:30</span>
NAT from inside:10.0.1.0/24 to outside:10.0.1.0/24
    flags sIT idle 0:02:11 timeout 0:00:00</pre>
<p>Static rules permanent entries dikhati hain (timeout 0). Dynamic PAT entries mein port aur flags <code>ri</code> hote hain. Aakhri line, flags <code>sIT</code>, static identity twice NAT hai, jaise chapter 8 ka VPN exemption. Busy box par <code>show xlate local 10.0.1.10</code> se filter karo.</p>

<h3>show conn</h3>
<pre class="out">NK-ASA# show conn
3 in use, 12 most used
<span class="hl">TCP outside  8.8.8.8:40000 dmz  10.0.2.10:80, idle 0:00:03, bytes 1520, flags UIO</span>
TCP outside  198.51.100.10:40000 dmz  10.0.2.20:22, idle 0:00:05, bytes 4380, flags UIOB
TCP outside  8.8.8.8:443 inside  10.0.1.10:51544, idle 0:00:01, bytes 9812, flags UIO</pre>
<p><code>show conn</code> ASA ke peeche wale host ka <b>real</b> address print karta hai, isliye published web server 10.0.2.10:80 ki tarah dikhta hai, 203.0.113.3 nahi. Flags <code>UIO</code> ka matlab up, inbound aur outbound data ke saath: healthy flow. Sirf SYN-related flags par atka connection server ya uske return path ki taraf ishaara karta hai.</p>

<h3>packet-tracer: NAT phases</h3>
<pre class="out">NK-ASA# packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 80

Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
NAT divert to egress interface dmz
<span class="hl">Untranslate 203.0.113.3/80 to 10.0.2.10/80</span>

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
access-list OUTSIDE_IN extended permit tcp any object WEB eq www

Phase: 3
Type: NAT
Subtype: rpf-check
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
...
Result:
input-interface: outside
output-interface: dmz
<span class="hl">Action: allow</span></pre>
<p><b>UN-NAT</b> destination rewrite karta hai aur egress interface chunta hai; <b>ACCESS-LIST</b> real address check karti hai; <b>NAT rpf-check</b> confirm karta hai ki return traffic same rule match karega. Outbound test ke liye, jaise <code>packet-tracer input inside tcp 10.0.1.10 51000 8.8.8.8 443</code>, NAT phase <code>Dynamic translate 10.0.1.10/51000 to 203.0.113.2/51000</code> dikhata hai.</p>

<h3>Jaanne layak syslog messages</h3>
<ul>
<li><b>305011</b>: dynamic translation bana (PAT ya dynamic NAT).</li>
<li><b>305012</b>: dynamic translation ka teardown.</li>
<li><b>305013</b>: forward aur reverse flows ke liye asymmetric NAT rules, NAT reverse path failure ki wajah se connection denied.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aap WEB ka static .3 se .4 par badalte ho, lekin server ke outbound backups ab bhi 203.0.113.3 ban kar nikalte hain. Existing connection aur uska translation change se pehle bane the. <code>clear xlate local 10.0.2.10</code> (ya <code>clear conn address 10.0.2.10</code>) purana state hatata hai, agla connection .4 use karta hai, aur <code>show xlate</code> confirm karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Counters reset kiye bina <code>show nat</code> padhna, phir pichhle mahine jama hue bade untranslate number par bharosa karna. Counters clear karo, ek test chalao, phir padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsi command use ho rahe translation slots dikhati hai, aur kaunsi connections?" Translations ke liye <code>show xlate</code>, connections ke liye <code>show conn</code>. Aur <code>show conn</code> inside ya DMZ host ka real address dikhata hai.</p></div>

<div class="scn"><h4>Zero hits ne asli kahani batayi</h4><p>Ek partner ne kaha ki 203.0.113.5 par naya portal unreachable hai. <code>clear nat counters</code>, partner se ek test, aur <code>show nat</code> ab bhi zero untranslate hits dikha raha tha. ASA se packet-tracer allow keh raha tha. Matlab packets kabhi ASA tak pahunch hi nahi rahe the: ISP router ki ARP table .5 ko incomplete dikha rahi thi kyunki ek purani <code>sysopt noproxyarp outside</code> line ne proxy ARP band kar rakha tha. Use hatane se ASA ARP ka jawab dene laga aur portal khul gaya.</p><p><b>Seekh:</b> packet-tracer ASA ke andar simulate karta hai; hit counters saabit karte hain ki asli packets aaye.</p></div>

<div class="iv"><p class="q">"Ek server published hai lekin unreachable hai. Aap kaunsi ASA commands chalaoge aur kyun?"</p><p>Rule aur uska untranslate counter check karne ke liye <code>show nat detail</code>; UN-NAT, ACCESS-LIST aur NAT phases dekhne ke liye outside se mapped address tak <code>packet-tracer</code>; static entry ke liye <code>show xlate</code>; live flows ke liye <code>show conn address</code>; phir zaroorat ho to dono interfaces par captures. Samjhao ki zero hits vs badhte hits kya batate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show nat detail</code>: order mein rules, real aur translated values, translate aur untranslate hits.</li>
<li><code>show xlate</code>: abhi ke translations; flags s, r, i, I, T type batate hain.</li>
<li><code>show conn</code>: real addresses ke saath live flows.</li>
<li>packet-tracer phases: UN-NAT, ACCESS-LIST, NAT (rpf-check), result.</li>
<li>Test se pehle counters clear karo; NAT badalne ke baad xlate ya conn clear karo.</li>
</ul></div>
`}};export{e as default};