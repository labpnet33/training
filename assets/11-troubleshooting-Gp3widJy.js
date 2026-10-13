var e={id:`troubleshooting`,h:{en:`Troubleshooting NAT: workflow, common faults and the ticket lab`,hi:`NAT troubleshooting: workflow, common faults aur ticket lab`},body:{en:`
<p>A good mechanic does not replace parts at random. He follows the fuel from the tank to the engine and checks each stage until he finds the one where it stops. NAT troubleshooting is the same: follow <b>one flow</b> from the client to the server and back, and prove each stage. Most tickets end in five minutes when you do this in order, and last all night when you jump straight to the configuration.</p>

<h3>The seven-step workflow</h3>
<ol>
<li><b>Write down the flow.</b> Source IP, destination as the client uses it (the mapped address), protocol and port, ingress interface. Example: 8.8.8.8 to 203.0.113.3 TCP 80, in on outside.</li>
<li><b>Does it reach the ASA?</b> <code>clear nat counters</code>, test once, then <code>show nat</code>. Zero untranslate hits means the problem is before the ASA: DNS returns another address, the ISP has no route, or ARP for the mapped address fails.</li>
<li><b>Simulate with packet-tracer.</b> Use the exact flow. Note which phase fails: UN-NAT, ACCESS-LIST, NAT, or a later one.</li>
<li><b>Check the NAT rule.</b> <code>show nat detail</code>: right object, right real address, interfaces in the right order, and the rule you expect is the one that wins (section and line).</li>
<li><b>Check the ACL.</b> Real address and real port, applied to the right interface in the right direction, with hit counters moving.</li>
<li><b>Check the server side.</b> Is the service listening? Is the server's default gateway the ASA (10.0.2.1)? Asymmetric return paths break stateful flows.</li>
<li><b>Clear stale state and retest.</b> <code>clear xlate</code> or <code>clear conn address</code> for the host after any NAT change, then test again and read the counters.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting flow">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">untranslate hits?</text>
<rect x="250" y="20" width="140" height="44" rx="8" fill="#fed7aa"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="12">packet-tracer</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">server, return path</text>
<line x1="150" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2"/><text x="200" y="36" text-anchor="middle" class="svg-muted" font-size="12">yes</text>
<line x1="390" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/><text x="440" y="36" text-anchor="middle" class="svg-muted" font-size="12">allow</text>
<rect x="10" y="130" width="140" height="70" rx="8" fill="#fde68a"/><text x="80" y="155" text-anchor="middle" class="svg-ink" font-size="12">zero: DNS, ISP</text><text x="80" y="175" text-anchor="middle" class="svg-ink" font-size="12">route, proxy ARP</text>
<rect x="250" y="130" width="140" height="70" rx="8" fill="#fde68a"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">UN-NAT drop: rule</text><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">ACL drop: real IP</text>
<line x1="80" y1="64" x2="80" y2="130" stroke="#64748b" stroke-width="2"/><text x="96" y="100" class="svg-muted" font-size="12">no</text>
<line x1="320" y1="64" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><text x="336" y="100" class="svg-muted" font-size="12">drop</text>
<text x="560" y="165" text-anchor="middle" class="svg-accent" font-size="12">then clear xlate</text><text x="560" y="183" text-anchor="middle" class="svg-accent" font-size="12">and retest</text>
</svg><p class="cap">Counters decide whether to look outside or inside the ASA; packet-tracer tells you which phase.</p></div>

<h3>Common faults at a glance</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>ACL drop on Implicit Rule, UN-NAT allowed</td><td>ACL permits the mapped IP or mapped port</td><td>Permit the real object and real port</td></tr>
<tr><td>Zero untranslate hits</td><td>DNS, ISP route, proxy ARP disabled, wrong mapped IP</td><td>Fix upstream; check <code>show ip arp</code> on the ISP</td></tr>
<tr><td>Intermittent reachability</td><td>Mapped IP also used by another device</td><td>Choose a free mapped address</td></tr>
<tr><td>Server leaves with the wrong public IP</td><td>Broad section 1 rule wins, or stale xlate</td><td>Fix order; <code>clear xlate</code></td></tr>
<tr><td>VPN up, no traffic</td><td>No identity NAT, or it is below the PAT</td><td>Twice NAT identity in section 1</td></tr>
<tr><td>Rule shown but never hit</td><td>Interfaces swapped or destination objects reversed</td><td>Re-enter as (real,mapped) and mapped-then-real</td></tr>
<tr><td>Port forward breaks ASDM or VPN</td><td>Mapped port used by an ASA service</td><td>Move the service or the mapped port</td></tr>
<tr><td>Some users fail under load</td><td>Dynamic NAT pool exhausted</td><td>PAT pool or <code>interface</code> fallback</td></tr></table>

<h3>Ticket lab walkthrough: INC-7740, the migrated rule uses the public IP</h3>
<p>The starting configuration already has the correct static NAT for WEB and an ACL migrated from a PIX-era firewall:</p>
<pre class="code"><span class="c">! Pre-loaded in the ticket</span>
object network WEB
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3
access-list OUTSIDE_IN extended permit tcp any host 203.0.113.3 eq www
access-group OUTSIDE_IN in interface outside</pre>
<p><b>Task 1: prove the drop.</b> Simulate the customer's flow:</p>
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
Untranslate 203.0.113.3/80 to 10.0.2.10/80

Phase: 2
Type: ACCESS-LIST
Subtype:
<span class="hl">Result: DROP</span>
Config:
<span class="hl">Implicit Rule</span>
Additional Information:

Result:
input-interface: outside
output-interface: dmz
Action: drop
Drop-reason: (acl-drop) Flow is denied by configured rule</pre>
<p>NAT works (phase 1), and by phase 2 the destination is already 10.0.2.10. The line "host 203.0.113.3" can never match, so the <b>Implicit Rule</b> drops it. That is the answer the lab asks for.</p>
<p><b>Task 2: fix with the object.</b> Add the correct line first, then remove the dead one, so there is no gap:</p>
<pre class="code">NK-ASA# configure terminal
NK-ASA(config)# access-list OUTSIDE_IN extended permit tcp any object WEB eq www
NK-ASA(config)# no access-list OUTSIDE_IN extended permit tcp any host 203.0.113.3 eq www
NK-ASA(config)# end</pre>
<p>Removing the last line of an ACL deletes the whole ACL and its <code>access-group</code> binding. Adding the new line first keeps OUTSIDE_IN applied on outside, which the lab checks.</p>
<p><b>Task 3: verify.</b> From INET run <code>curl 203.0.113.3</code>, then:</p>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 1 elements; name hash: 0x7a2d1c3b
<span class="hl">access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=1)</span> 0x3f1e22a0
  access-list OUTSIDE_IN line 1 extended permit tcp any host 10.0.2.10 eq www (hitcnt=1) 0x3f1e22a0</pre>

<h3>Checkpoints for the two build labs</h3>
<ul>
<li><b>Lab 1 (static NAT):</b> INET reaches 203.0.113.3 on 80 and 443 but not 22; <code>untranslate_hits</code> at least 1; WEB's ping to 8.8.8.8 leaves as 203.0.113.3 in <code>show xlate</code>.</li>
<li><b>Lab 2 (port forward):</b> PARTNER reaches 203.0.113.2:2222, INET does not; packet-tracer shows Untranslate to 10.0.2.20/22; the answer is 22.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "SSH to the jump host via 2222 fails for the partner". Counters: untranslate hits rising. packet-tracer: UN-NAT allow to 10.0.2.20/22, ACCESS-LIST drop. ACL: <code>permit tcp host 198.51.100.10 object JUMP eq 2222</code>. Diagnosis: mapped port in the ACL. Fix: <code>eq ssh</code>. Three commands, one minute.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deleting the only line of an ACL before adding its replacement. The ACL disappears, the access-group goes with it, and the outside interface falls back to security-level behaviour. Always add, then remove.</p></div>

<div class="exam"><p><b>Exam trap.</b> A packet-tracer output with UN-NAT ALLOW followed by ACCESS-LIST DROP on the Implicit Rule is almost always the real-IP mistake, not a NAT fault. Do not pick "change the NAT rule" as the answer.</p></div>

<div class="scn"><h4>The published server that answered from the wrong IP</h4><p>Customers could open a portal but its outgoing email was rejected by recipients for "sender not authorised". <code>show xlate local 10.0.2.40</code> showed the server leaving via the DMZ-NET interface PAT, 203.0.113.2, instead of its static 203.0.113.5. A colleague had added <code>nat (dmz,outside) source dynamic DMZ-NET interface</code> as a manual rule, which sat in section 1 above every auto NAT static. Re-entering it with <code>after-auto</code> fixed the sender address.</p><p><b>Lesson:</b> when a host leaves with the wrong address, look for a rule that matches earlier.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting an unreachable published server on an ASA."</p><p>Define the flow, clear counters and test, read untranslate hits to decide inside or outside the ASA, run packet-tracer and name the failing phase, check the NAT rule and its order, check the ACL for real address and real port, check the server's gateway and service, clear stale xlates and retest. Mention the migrated public-IP ACL as the most common cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow one flow; prove each stage in order.</li>
<li>Zero untranslate hits = look upstream; rising hits = look at the ACL and server.</li>
<li>UN-NAT ALLOW then ACL DROP on the Implicit Rule = ACL written with the mapped IP or port.</li>
<li>Add the new ACL line before removing the old one.</li>
<li>Wrong source address on the way out = an earlier-matching rule or a stale xlate.</li>
</ul></div>
`,hi:`
<p>Achha mechanic parts random tarike se nahi badalta. Woh tank se engine tak fuel ko follow karta hai aur har stage check karta hai jab tak woh stage na mil jaaye jahan woh ruk jaata hai. NAT troubleshooting bhi aisa hi hai: client se server tak aur wapas <b>ek flow</b> follow karo, aur har stage saabit karo. Order mein karo to zyada tar tickets paanch minute mein khatam hote hain, aur seedha configuration par koodo to poori raat chalte hain.</p>

<h3>Saat-step workflow</h3>
<ol>
<li><b>Flow likho.</b> Source IP, destination jaise client use karta hai (mapped address), protocol aur port, ingress interface. Example: 8.8.8.8 se 203.0.113.3 TCP 80, outside par andar.</li>
<li><b>Kya yeh ASA tak pahunchta hai?</b> <code>clear nat counters</code>, ek baar test, phir <code>show nat</code>. Zero untranslate hits ka matlab problem ASA se pehle hai: DNS doosra address deta hai, ISP ke paas route nahi, ya mapped address ka ARP fail hota hai.</li>
<li><b>packet-tracer se simulate karo.</b> Bilkul wahi flow use karo. Note karo kaunsa phase fail hota hai: UN-NAT, ACCESS-LIST, NAT, ya koi baad wala.</li>
<li><b>NAT rule check karo.</b> <code>show nat detail</code>: sahi object, sahi real address, sahi order mein interfaces, aur jis rule ki aap ummeed karte ho wahi jeet rahi hai (section aur line).</li>
<li><b>ACL check karo.</b> Real address aur real port, sahi interface par sahi direction mein applied, hit counters badhte hue.</li>
<li><b>Server side check karo.</b> Kya service sun rahi hai? Kya server ka default gateway ASA (10.0.2.1) hai? Asymmetric return paths stateful flows tod dete hain.</li>
<li><b>Stale state clear karo aur dobara test karo.</b> Kisi bhi NAT change ke baad host ke liye <code>clear xlate</code> ya <code>clear conn address</code>, phir dobara test karo aur counters padho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting flow">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">untranslate hits?</text>
<rect x="250" y="20" width="140" height="44" rx="8" fill="#fed7aa"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="12">packet-tracer</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">server, return path</text>
<line x1="150" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2"/><text x="200" y="36" text-anchor="middle" class="svg-muted" font-size="12">haan</text>
<line x1="390" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/><text x="440" y="36" text-anchor="middle" class="svg-muted" font-size="12">allow</text>
<rect x="10" y="130" width="140" height="70" rx="8" fill="#fde68a"/><text x="80" y="155" text-anchor="middle" class="svg-ink" font-size="12">zero: DNS, ISP</text><text x="80" y="175" text-anchor="middle" class="svg-ink" font-size="12">route, proxy ARP</text>
<rect x="250" y="130" width="140" height="70" rx="8" fill="#fde68a"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">UN-NAT drop: rule</text><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">ACL drop: real IP</text>
<line x1="80" y1="64" x2="80" y2="130" stroke="#64748b" stroke-width="2"/><text x="96" y="100" class="svg-muted" font-size="12">nahi</text>
<line x1="320" y1="64" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><text x="336" y="100" class="svg-muted" font-size="12">drop</text>
<text x="560" y="165" text-anchor="middle" class="svg-accent" font-size="12">phir clear xlate</text><text x="560" y="183" text-anchor="middle" class="svg-accent" font-size="12">aur retest</text>
</svg><p class="cap">Counters decide karte hain ki ASA ke bahar dekhna hai ya andar; packet-tracer batata hai kaunsa phase.</p></div>

<h3>Common faults ek nazar mein</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit cause</th><th>Fix</th></tr>
<tr><td>Implicit Rule par ACL drop, UN-NAT allowed</td><td>ACL mapped IP ya mapped port permit karti hai</td><td>Real object aur real port permit karo</td></tr>
<tr><td>Zero untranslate hits</td><td>DNS, ISP route, proxy ARP band, galat mapped IP</td><td>Upstream theek karo; ISP par <code>show ip arp</code> check karo</td></tr>
<tr><td>Beech beech mein reachability</td><td>Mapped IP koi aur device bhi use kar raha hai</td><td>Free mapped address chuno</td></tr>
<tr><td>Server galat public IP se nikalta hai</td><td>Section 1 ki broad rule jeet rahi hai, ya stale xlate</td><td>Order theek karo; <code>clear xlate</code></td></tr>
<tr><td>VPN up, traffic nahi</td><td>Identity NAT nahi, ya woh PAT ke neeche hai</td><td>Section 1 mein twice NAT identity</td></tr>
<tr><td>Rule dikhti hai lekin kabhi hit nahi</td><td>Interfaces ulte ya destination objects reversed</td><td>(real,mapped) aur mapped-phir-real ke saath dobara enter karo</td></tr>
<tr><td>Port forward se ASDM ya VPN toota</td><td>Mapped port koi ASA service use karti hai</td><td>Service ya mapped port shift karo</td></tr>
<tr><td>Load mein kuch users fail</td><td>Dynamic NAT pool khatam</td><td>PAT pool ya <code>interface</code> fallback</td></tr></table>

<h3>Ticket lab walkthrough: INC-7740, migrate hui rule public IP use karti hai</h3>
<p>Starting configuration mein WEB ke liye sahi static NAT pehle se hai aur ek PIX-era firewall se migrate hui ACL hai:</p>
<pre class="code"><span class="c">! Ticket mein pehle se loaded</span>
object network WEB
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3
access-list OUTSIDE_IN extended permit tcp any host 203.0.113.3 eq www
access-group OUTSIDE_IN in interface outside</pre>
<p><b>Task 1: drop saabit karo.</b> Customer ka flow simulate karo:</p>
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
Untranslate 203.0.113.3/80 to 10.0.2.10/80

Phase: 2
Type: ACCESS-LIST
Subtype:
<span class="hl">Result: DROP</span>
Config:
<span class="hl">Implicit Rule</span>
Additional Information:

Result:
input-interface: outside
output-interface: dmz
Action: drop
Drop-reason: (acl-drop) Flow is denied by configured rule</pre>
<p>NAT kaam karta hai (phase 1), aur phase 2 tak destination pehle se 10.0.2.10 hai. "host 203.0.113.3" wali line kabhi match nahi kar sakti, isliye <b>Implicit Rule</b> use drop karti hai. Yahi jawab lab maangta hai.</p>
<p><b>Task 2: object se theek karo.</b> Pehle sahi line add karo, phir mari hui line hatao, taaki koi gap na rahe:</p>
<pre class="code">NK-ASA# configure terminal
NK-ASA(config)# access-list OUTSIDE_IN extended permit tcp any object WEB eq www
NK-ASA(config)# no access-list OUTSIDE_IN extended permit tcp any host 203.0.113.3 eq www
NK-ASA(config)# end</pre>
<p>ACL ki aakhri line hatane se poori ACL aur uska <code>access-group</code> binding delete ho jaata hai. Nayi line pehle add karne se OUTSIDE_IN outside par applied rehti hai, jo lab check karta hai.</p>
<p><b>Task 3: verify karo.</b> INET se <code>curl 203.0.113.3</code> chalao, phir:</p>
<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; 1 elements; name hash: 0x7a2d1c3b
<span class="hl">access-list OUTSIDE_IN line 1 extended permit tcp any object WEB eq www (hitcnt=1)</span> 0x3f1e22a0
  access-list OUTSIDE_IN line 1 extended permit tcp any host 10.0.2.10 eq www (hitcnt=1) 0x3f1e22a0</pre>

<h3>Do build labs ke checkpoints</h3>
<ul>
<li><b>Lab 1 (static NAT):</b> INET 203.0.113.3 tak 80 aur 443 par pahunchta hai lekin 22 par nahi; <code>untranslate_hits</code> kam se kam 1; WEB ka 8.8.8.8 ka ping <code>show xlate</code> mein 203.0.113.3 ban kar nikalta hai.</li>
<li><b>Lab 2 (port forward):</b> PARTNER 203.0.113.2:2222 tak pahunchta hai, INET nahi; packet-tracer 10.0.2.20/22 par Untranslate dikhata hai; jawab 22 hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Partner ke liye 2222 se jump host par SSH fail hota hai". Counters: untranslate hits badh rahe hain. packet-tracer: 10.0.2.20/22 par UN-NAT allow, ACCESS-LIST drop. ACL: <code>permit tcp host 198.51.100.10 object JUMP eq 2222</code>. Diagnosis: ACL mein mapped port. Fix: <code>eq ssh</code>. Teen commands, ek minute.</p></div>

<div class="warn"><p><b>Common galti.</b> ACL ki ekmatra line ko uska replacement add karne se pehle delete karna. ACL gayab ho jaati hai, access-group bhi saath jaata hai, aur outside interface security-level behaviour par wapas aa jaata hai. Hamesha pehle add, phir remove.</p></div>

<div class="exam"><p><b>Exam trap.</b> Packet-tracer output jismein UN-NAT ALLOW ke baad Implicit Rule par ACCESS-LIST DROP ho, lagbhag hamesha real-IP galti hai, NAT fault nahi. Jawab mein "NAT rule badlo" mat chuno.</p></div>

<div class="scn"><h4>Published server jo galat IP se jawab deta tha</h4><p>Customers portal khol paate the lekin uska outgoing email recipients "sender not authorised" keh kar reject kar rahe the. <code>show xlate local 10.0.2.40</code> ne server ko uske static 203.0.113.5 ki jagah DMZ-NET interface PAT, 203.0.113.2, se nikalte dikhaya. Ek colleague ne <code>nat (dmz,outside) source dynamic DMZ-NET interface</code> manual rule ki tarah add kiya tha, jo har auto NAT static ke upar section 1 mein baithi thi. Use <code>after-auto</code> ke saath dobara enter karne se sender address theek hua.</p><p><b>Seekh:</b> jab host galat address se nikle, to aisi rule dhoondho jo pehle match karti ho.</p></div>

<div class="iv"><p class="q">"ASA par unreachable published server ka troubleshooting step by step batao."</p><p>Flow define karo, counters clear karke test karo, ASA ke andar ya bahar decide karne ke liye untranslate hits padho, packet-tracer chalao aur failing phase ka naam batao, NAT rule aur uska order check karo, ACL mein real address aur real port check karo, server ka gateway aur service check karo, stale xlates clear karke retest karo. Sabse common cause ke roop mein migrate hui public-IP ACL batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek flow follow karo; har stage order mein saabit karo.</li>
<li>Zero untranslate hits = upstream dekho; badhte hits = ACL aur server dekho.</li>
<li>UN-NAT ALLOW phir Implicit Rule par ACL DROP = ACL mapped IP ya port ke saath likhi gayi.</li>
<li>Purani ACL line hatane se pehle nayi add karo.</li>
<li>Bahar jaate waqt galat source address = pehle match hone wali rule ya stale xlate.</li>
</ul></div>
`}};export{e as default};