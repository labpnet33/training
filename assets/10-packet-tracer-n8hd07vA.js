var e={id:`packet-tracer`,h:{en:`Proving rule matches with packet-tracer`,hi:`packet-tracer se rule matches saabit karna`},body:{en:`
<p>"I think the rule is fine" is not evidence. <code>packet-tracer</code> is the ASA's built-in simulator: you describe one packet, and the ASA walks it through every processing phase and tells you exactly which NAT rule and which ACE it hit, and whether it would be allowed or dropped. No real traffic is needed and nothing is sent to the network.</p>

<h3>The analogy: a mock drill</h3>
<p>Before a real fire, a building runs a mock drill: a pretend alarm, and every warden reports what they would do. packet-tracer is a mock drill for one packet. It shows each checkpoint and each decision, so you find the blocked door before a real customer does.</p>

<h3>The syntax</h3>
<pre class="code"><span class="c">! TCP: input interface, protocol, source IP, source port, destination IP, destination port</span>
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 22
<span class="c">! UDP works the same way</span>
packet-tracer input outside udp 8.8.8.8 53000 203.0.113.4 53
<span class="c">! ICMP: type 8 (echo), code 0</span>
packet-tracer input outside icmp 8.8.8.8 8 0 203.0.113.3
<span class="c">! add detailed for internal rule IDs and more information</span>
packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 80 detailed</pre>
<p>Three rules for good traces: use the <b>ingress</b> interface (where the packet would really arrive), use the <b>address the client really sends to</b> (the public 203.0.113.3 from outside, so the UN-NAT phase is tested too), and pick any high source port such as 40000.</p>

<h3>Reading an ALLOW trace</h3>
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
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
<span class="hl">access-list OUTSIDE_IN extended permit tcp any object WEB eq www</span>
Additional Information:

Phase: 3
Type: FLOW-CREATION
Subtype:
Result: ALLOW
Config:
Additional Information:
New flow created with id 57, packet dispatched to next module

Result:
input-interface: outside
input-status: up
input-line-status: up
output-interface: dmz
output-status: up
output-line-status: up
<span class="hl">Action: allow</span></pre>

<h3>Reading a DROP trace</h3>
<p>Two kinds of ACL drop look different. If an explicit deny matched, the Config section shows <b>that deny ACE</b>. If nothing matched, it shows <b>Implicit Rule</b>.</p>
<pre class="out">NK-ASA# packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 22
Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
NAT divert to egress interface dmz
Untranslate 203.0.113.3/22 to 10.0.2.10/22

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: DROP
Config:
access-group OUTSIDE_IN in interface outside
<span class="hl">access-list OUTSIDE_IN extended deny tcp any any eq ssh</span>
Additional Information:

Result:
input-interface: outside
input-status: up
input-line-status: up
output-interface: dmz
output-status: up
output-line-status: up
Action: drop
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span></pre>
<p>This trace is the heart of the second lab. The partner's packet never reaches its own permit, because the broad deny sits higher. To get the <b>line number</b>, find that exact ACE text in <code>show access-list OUTSIDE_IN</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="packet-tracer decision flow">
<rect x="10" y="30" width="140" height="55" rx="8" fill="#e2e8f0"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Describe packet</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="12">ingress, 5-tuple</text>
<rect x="175" y="30" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT?</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="12">real dst shown</text>
<rect x="330" y="30" width="130" height="55" rx="8" fill="#fde68a"/><text x="395" y="55" text-anchor="middle" class="svg-ink" font-size="13">ACCESS-LIST</text><text x="395" y="73" text-anchor="middle" class="svg-muted" font-size="12">which ACE</text>
<rect x="485" y="30" width="145" height="55" rx="8" fill="#bbf7d0"/><text x="557" y="55" text-anchor="middle" class="svg-ink" font-size="13">Action</text><text x="557" y="73" text-anchor="middle" class="svg-muted" font-size="12">allow or drop</text>
<line x1="150" y1="57" x2="175" y2="57" stroke="#64748b" stroke-width="2"/><line x1="305" y1="57" x2="330" y2="57" stroke="#64748b" stroke-width="2"/><line x1="460" y1="57" x2="485" y2="57" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="120" width="455" height="50" rx="8" fill="#fed7aa"/><text x="402" y="150" text-anchor="middle" class="svg-ink" font-size="13">Match the Config ACE to show access-list to get its line number and hitcnt</text>
</svg><p class="cap">packet-tracer tells you which rule decided; show access-list tells you where that rule sits and whether real traffic hits it.</p></div>

<h3>A proof routine for every change</h3>
<ol>
<li><b>Before</b> the change: run packet-tracer for the new flow and for one flow that must stay blocked. Save both outputs.</li>
<li>Make the change.</li>
<li><b>After</b>: run the same two traces. The new flow must show ALLOW with your new ACE; the blocked flow must still show DROP.</li>
<li>Test with real traffic and watch <code>show access-list</code> hit counts rise on the new ACE.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> From the first lab: after building OUTSIDE_IN, run <code>packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 22</code>. It must show <b>Implicit Rule</b> and Action: drop, proving INET cannot SSH to WEB. Then run the same from 198.51.100.10: ALLOW via the PUBLIC-SERVERS line. Two traces, and you have proven both the opening and the boundary.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Tracing with the wrong input interface (for internet traffic always <code>input outside</code>); tracing to the real address 10.0.2.10 from outside, which skips the UN-NAT phase and hides a NAT problem; and treating "Action: allow" as proof that users can connect, when the server itself, its default gateway or a host firewall might still block them.</p></div>

<div class="exam"><p><b>Exam trap.</b> packet-tracer is a simulation: it does not send a packet on the wire. The Drop-reason <code>(acl-drop) Flow is denied by configured rule</code> appears both for an explicit deny and for the implicit deny; the Config lines tell you which one it was.</p></div>

<div class="scn"><h4>The ticket closed in five minutes</h4><p>A payment gateway provider reported they could not reach a merchant's API on 203.0.113.3 port 443. The on-call engineer ran packet-tracer with the provider's IP. The trace showed UN-NAT to 10.0.2.10, then ACCESS-LIST DROP on the <b>Implicit Rule</b>. <code>show access-list</code> revealed the permit had been written for port 8443 by mistake. The engineer corrected the ACE, re-ran the trace (ALLOW), and attached both traces to the ticket.</p><p><b>Lesson:</b> packet-tracer turns "the firewall is blocking us" into an exact, provable cause in minutes, and makes the fix auditable.</p></div>

<div class="iv"><p class="q">"How do you prove that a specific ACL rule is or is not matching?"</p><p>Strong answer: run <code>packet-tracer input &lt;ingress&gt; &lt;proto&gt; &lt;src&gt; &lt;sport&gt; &lt;dst&gt; &lt;dport&gt;</code> using the address the client really targets; read the UN-NAT and ACCESS-LIST phases and the final Action; match the Config ACE to <code>show access-list</code> to get its line and hit count; confirm with real traffic hit counts and syslog. Mention that packet-tracer does not send real packets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>packet-tracer simulates one packet through UN-NAT, route, ACL, NAT, inspection and flow creation.</li>
<li>Use the real ingress interface and the address the client really targets.</li>
<li>Config shows the exact ACE, or "Implicit Rule" when nothing matched.</li>
<li>Match that ACE to show access-list for its line number and hitcnt.</li>
<li>Trace before and after every change: one flow that must pass, one that must stay blocked.</li>
</ul></div>
`,hi:`
<p>"Mujhe lagta hai rule theek hai" saboot nahi hai. <code>packet-tracer</code> ASA ka built-in simulator hai: aap ek packet describe karte ho, aur ASA use har processing phase se guzaarta hai aur batata hai ki exactly kaunsa NAT rule aur kaunsi ACE hit hui, aur woh allow hota ya drop. Asli traffic ki zaroorat nahi aur network par kuch nahi bheja jaata.</p>

<h3>Analogy: mock drill</h3>
<p>Asli aag se pehle building mock drill karti hai: ek nakli alarm, aur har warden batata hai ki woh kya karta. packet-tracer ek packet ke liye mock drill hai. Yeh har checkpoint aur har decision dikhata hai, taaki aap band darwaza asli customer se pehle dhoondh lo.</p>

<h3>Syntax</h3>
<pre class="code"><span class="c">! TCP: input interface, protocol, source IP, source port, destination IP, destination port</span>
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 22
<span class="c">! UDP bhi aise hi chalta hai</span>
packet-tracer input outside udp 8.8.8.8 53000 203.0.113.4 53
<span class="c">! ICMP: type 8 (echo), code 0</span>
packet-tracer input outside icmp 8.8.8.8 8 0 203.0.113.3
<span class="c">! internal rule IDs aur zyada information ke liye detailed jodo</span>
packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 80 detailed</pre>
<p>Achhe traces ke teen rules: <b>ingress</b> interface use karo (jahan packet sach mein aata), <b>woh address use karo jis par client sach mein bhejta hai</b> (outside se public 203.0.113.3, taaki UN-NAT phase bhi test ho), aur 40000 jaisa koi bhi high source port lo.</p>

<h3>ALLOW trace padhna</h3>
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
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
<span class="hl">access-list OUTSIDE_IN extended permit tcp any object WEB eq www</span>
Additional Information:

Phase: 3
Type: FLOW-CREATION
Subtype:
Result: ALLOW
Config:
Additional Information:
New flow created with id 57, packet dispatched to next module

Result:
input-interface: outside
input-status: up
input-line-status: up
output-interface: dmz
output-status: up
output-line-status: up
<span class="hl">Action: allow</span></pre>

<h3>DROP trace padhna</h3>
<p>ACL drop ke do types alag dikhte hain. Agar explicit deny match hui, to Config section <b>woh deny ACE</b> dikhata hai. Agar kuch match nahi hua, to <b>Implicit Rule</b> dikhata hai.</p>
<pre class="out">NK-ASA# packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 22
Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
NAT divert to egress interface dmz
Untranslate 203.0.113.3/22 to 10.0.2.10/22

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: DROP
Config:
access-group OUTSIDE_IN in interface outside
<span class="hl">access-list OUTSIDE_IN extended deny tcp any any eq ssh</span>
Additional Information:

Result:
input-interface: outside
input-status: up
input-line-status: up
output-interface: dmz
output-status: up
output-line-status: up
Action: drop
<span class="hl">Drop-reason: (acl-drop) Flow is denied by configured rule</span></pre>
<p>Yeh trace doosri lab ka dil hai. Partner ka packet kabhi apne permit tak pahunchta hi nahi, kyunki broad deny upar baithi hai. <b>Line number</b> paane ke liye, wahi exact ACE text <code>show access-list OUTSIDE_IN</code> mein dhoondho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="packet-tracer decision flow">
<rect x="10" y="30" width="140" height="55" rx="8" fill="#e2e8f0"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">Packet describe</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="12">ingress, 5-tuple</text>
<rect x="175" y="30" width="130" height="55" rx="8" fill="#ddd6fe"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT?</text><text x="240" y="73" text-anchor="middle" class="svg-muted" font-size="12">real dst dikhta</text>
<rect x="330" y="30" width="130" height="55" rx="8" fill="#fde68a"/><text x="395" y="55" text-anchor="middle" class="svg-ink" font-size="13">ACCESS-LIST</text><text x="395" y="73" text-anchor="middle" class="svg-muted" font-size="12">kaunsi ACE</text>
<rect x="485" y="30" width="145" height="55" rx="8" fill="#bbf7d0"/><text x="557" y="55" text-anchor="middle" class="svg-ink" font-size="13">Action</text><text x="557" y="73" text-anchor="middle" class="svg-muted" font-size="12">allow ya drop</text>
<line x1="150" y1="57" x2="175" y2="57" stroke="#64748b" stroke-width="2"/><line x1="305" y1="57" x2="330" y2="57" stroke="#64748b" stroke-width="2"/><line x1="460" y1="57" x2="485" y2="57" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="120" width="455" height="50" rx="8" fill="#fed7aa"/><text x="402" y="150" text-anchor="middle" class="svg-ink" font-size="13">Config ACE ko show access-list se milao: line number aur hitcnt milega</text>
</svg><p class="cap">packet-tracer batata hai kis rule ne decide kiya; show access-list batata hai woh rule kahan hai aur kya asli traffic use hit karta hai.</p></div>

<h3>Har change ke liye proof routine</h3>
<ol>
<li>Change se <b>pehle</b>: nayi flow ke liye aur ek aisi flow ke liye jo blocked rehni chahiye, packet-tracer chalao. Dono outputs save karo.</li>
<li>Change karo.</li>
<li><b>Baad mein</b>: wahi do traces chalao. Nayi flow aapki nayi ACE ke saath ALLOW dikhaye; blocked flow abhi bhi DROP dikhaye.</li>
<li>Asli traffic se test karo aur nayi ACE par <code>show access-list</code> hit counts badhte dekho.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Pehli lab se: OUTSIDE_IN banane ke baad <code>packet-tracer input outside tcp 8.8.8.8 40000 203.0.113.3 22</code> chalao. Isme <b>Implicit Rule</b> aur Action: drop dikhna chahiye, jo saabit karta hai ki INET WEB par SSH nahi kar sakta. Phir wahi 198.51.100.10 se chalao: PUBLIC-SERVERS line se ALLOW. Do traces, aur aapne opening aur boundary dono saabit kar di.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Galat input interface se trace karna (internet traffic ke liye hamesha <code>input outside</code>); outside se real address 10.0.2.10 par trace karna, jo UN-NAT phase skip kar deta hai aur NAT problem chhupa deta hai; aur "Action: allow" ko saboot maan lena ki users connect kar sakte hain, jabki server khud, uska default gateway ya host firewall abhi bhi unhe block kar sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> packet-tracer ek simulation hai: yeh wire par packet nahi bhejta. Drop-reason <code>(acl-drop) Flow is denied by configured rule</code> explicit deny aur implicit deny dono ke liye aata hai; Config lines batati hain ki kaunsa tha.</p></div>

<div class="scn"><h4>Paanch minute mein close hua ticket</h4><p>Ek payment gateway provider ne report kiya ki woh merchant ki API tak 203.0.113.3 port 443 par nahi pahunch pa rahe. On-call engineer ne provider ke IP se packet-tracer chalaya. Trace mein 10.0.2.10 tak UN-NAT dikha, phir <b>Implicit Rule</b> par ACCESS-LIST DROP. <code>show access-list</code> se pata chala ki permit galti se port 8443 ke liye likha gaya tha. Engineer ne ACE theek ki, trace dobara chalaya (ALLOW), aur dono traces ticket mein attach kar diye.</p><p><b>Seekh:</b> packet-tracer "firewall humein block kar raha hai" ko minutes mein exact, provable cause mein badal deta hai, aur fix ko auditable banata hai.</p></div>

<div class="iv"><p class="q">"Aap kaise saabit karoge ki koi specific ACL rule match kar rahi hai ya nahi?"</p><p>Strong answer: <code>packet-tracer input &lt;ingress&gt; &lt;proto&gt; &lt;src&gt; &lt;sport&gt; &lt;dst&gt; &lt;dport&gt;</code> chalao, woh address use karke jise client sach mein target karta hai; UN-NAT aur ACCESS-LIST phases aur final Action padho; Config ACE ko <code>show access-list</code> se milakar uski line aur hit count lo; asli traffic ke hit counts aur syslog se confirm karo. Mention karo ki packet-tracer asli packets nahi bhejta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>packet-tracer ek packet ko UN-NAT, route, ACL, NAT, inspection aur flow creation se simulate karta hai.</li>
<li>Asli ingress interface aur woh address use karo jise client sach mein target karta hai.</li>
<li>Config exact ACE dikhata hai, ya kuch match na ho to "Implicit Rule".</li>
<li>Line number aur hitcnt ke liye us ACE ko show access-list se milao.</li>
<li>Har change se pehle aur baad trace karo: ek flow jo pass honi chahiye, ek jo blocked rehni chahiye.</li>
</ul></div>
`}};export{e as default};