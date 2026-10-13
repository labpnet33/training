var e={id:`packet-tracer`,h:{en:`packet-tracer in depth: phases, results and drop reasons`,hi:`packet-tracer gehraai se: phases, results aur drop reasons`},body:{en:`
<p>Airline pilots practise engine failures in a <b>flight simulator</b>. Nothing real is at risk, yet the simulator runs the same physics as the aircraft and tells the pilot exactly what would happen at each moment. <code>packet-tracer</code> is the ASA's flight simulator. You describe one packet, and the ASA pushes a virtual copy through its real configuration (NAT, routes, ACLs, inspection) and prints the decision of every phase. No traffic leaves the box, and nobody needs to reproduce the problem for you.</p>

<h3>Syntax</h3>
<pre class="code"><span class="c">! TCP and UDP: interface, protocol, source, source port, destination, destination port</span>
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443
packet-tracer input inside udp 10.0.1.10 51000 8.8.8.8 53
<span class="c">! ICMP: source, type, code, destination (8 0 = echo request)</span>
packet-tracer input inside icmp 10.0.1.10 8 0 8.8.8.8
<span class="c">! more internal detail, or machine-readable output</span>
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443 detailed
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443 xml</pre>
<p>Three rules decide whether the answer is trustworthy:</p>
<ul>
<li><b>input</b> is the interface where the packet <b>arrives</b>, not where it leaves.</li>
<li>Write the addresses <b>as they appear on that wire</b>. A partner on the internet connects to the public address 203.0.113.3, so that is the destination, not 10.0.2.10.</li>
<li>Pick a realistic source: a high source port, and an address that could really arrive on that interface. For TCP, packet-tracer simulates the first packet, a SYN.</li>
</ul>

<h3>Reading the output</h3>
<p>The output is a list of <b>phases</b>, then a <b>Result</b> block. Each phase has a Type (what was checked), a Subtype, a Result (ALLOW or DROP), the <b>Config</b> lines that matched, and Additional Information. Read it in this order: the <b>Action</b> line at the bottom, then the phase that says DROP, then the Config under that phase. The Config is the exact rule responsible.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="packet-tracer phases">
<rect x="10" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT</text><text x="65" y="68" text-anchor="middle" class="svg-muted" font-size="12">public to real</text>
<rect x="135" y="30" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="13">ROUTE-LOOKUP</text><text x="190" y="68" text-anchor="middle" class="svg-muted" font-size="12">egress ifc</text>
<rect x="260" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="315" y="52" text-anchor="middle" class="svg-ink" font-size="13">ACCESS-LIST</text><text x="315" y="68" text-anchor="middle" class="svg-muted" font-size="12">permit or deny</text>
<rect x="385" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="440" y="52" text-anchor="middle" class="svg-ink" font-size="13">NAT / INSPECT</text><text x="440" y="68" text-anchor="middle" class="svg-muted" font-size="12">translate, inspect</text>
<rect x="510" y="30" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="570" y="52" text-anchor="middle" class="svg-ink" font-size="13">FLOW-CREATION</text><text x="570" y="68" text-anchor="middle" class="svg-muted" font-size="12">conn built</text>
<line x1="120" y1="53" x2="135" y2="53" stroke="#64748b" stroke-width="2"/><line x1="245" y1="53" x2="260" y2="53" stroke="#64748b" stroke-width="2"/><line x1="370" y1="53" x2="385" y2="53" stroke="#64748b" stroke-width="2"/><line x1="495" y1="53" x2="510" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">The first DROP stops the trace: Action: drop, Drop-reason: (code) text</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Statically published destination: UN-NAT picks the egress, so no separate ROUTE-LOOKUP line may appear</text>
<text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">Exact phase names and count vary by software version and enabled features</text>
</svg><p class="cap">The main phases you will read in almost every trace.</p></div>

<p>A trimmed trace of the working portal flow on a 9.x ASA looks like this:</p>
<pre class="out">NK-ASA# packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443

Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
<span class="hl">NAT divert to egress interface dmz
Untranslate 203.0.113.3/443 to 10.0.2.10/443</span>

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
<span class="hl">access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps</span>
Additional Information:

Phase: 3
Type: NAT
Subtype: rpf-check
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:

Phase: 4
Type: FLOW-CREATION
Subtype:
Result: ALLOW
Config:
Additional Information:
New flow created with id 4211, packet dispatched to next module

Result:
input-interface: outside
input-status: up
input-line-status: up
output-interface: dmz
output-status: up
output-line-status: up
<span class="hl">Action: allow</span></pre>
<p>On real hardware you will also see phases such as IP-OPTIONS, NAT per-session, INSPECT and, on newer releases, timing lines. The lab simulator prints a shorter list with the same key phases. Learn to find the four that matter: UN-NAT, ROUTE-LOOKUP, ACCESS-LIST and NAT.</p>

<h3>Phase by phase</h3>
<table class="cmp"><tr><th>Phase</th><th>What it proves</th><th>If it drops or is missing</th></tr>
<tr><td>UN-NAT static</td><td>A static rule owns the destination and maps it to a real address.</td><td>Missing for a published server: no rule owns that public address. Check <code>show nat</code>.</td></tr>
<tr><td>ROUTE-LOOKUP</td><td>Which interface the packet would leave.</td><td>DROP with <code>(no-route)</code>: add or fix a route.</td></tr>
<tr><td>ACCESS-LIST</td><td>The exact ACE (or Implicit Rule) that decided.</td><td>DROP with <code>(acl-drop)</code>: the Config names the ACL; Implicit Rule means no line matched.</td></tr>
<tr><td>NAT</td><td>The source translation that will be applied.</td><td>Missing when you expected PAT: the object or interface pair is wrong.</td></tr>
<tr><td>NAT rpf-check</td><td>The return path matches the same NAT rule.</td><td>DROP with <code>(nat-rpf-failed)</code>: overlapping or asymmetric NAT rules.</td></tr>
<tr><td>INSPECT</td><td>Which inspection engine will handle the flow.</td><td>Rare drop; points to an inspection policy.</td></tr>
<tr><td>FLOW-CREATION</td><td>A connection would be built.</td><td>If you see "Found flow with id ... using existing flow" instead, a connection already exists.</td></tr></table>

<h3>Common drop reasons</h3>
<table class="cmp"><tr><th>Drop-reason</th><th>Meaning</th></tr>
<tr><td><code>(acl-drop) Flow is denied by configured rule</code></td><td>An ACE denied it or the implicit deny at the end of the ACL.</td></tr>
<tr><td><code>(no-route) No route to host</code></td><td>No route to the destination.</td></tr>
<tr><td><code>(nat-rpf-failed)</code></td><td>NAT reverse-path check failed, usually conflicting NAT rules.</td></tr>
<tr><td><code>(rpf-violated) Reverse-path verify failed</code></td><td><code>ip verify reverse-path</code> is on and the source is not reachable via the ingress interface.</td></tr>
<tr><td><code>(no-adjacency) No valid adjacency</code></td><td>The next hop cannot be resolved (ARP).</td></tr>
<tr><td><code>(ifc-classify)</code></td><td>The ASA could not classify the packet to an interface or context.</td></tr></table>
<p>Newer releases also print a <b>Drop-location</b> line with internal frame and flow references. It is mostly useful to Cisco TAC; the reason code is what you act on.</p>

<h3>The detailed keyword</h3>
<p><code>detailed</code> adds the internal rule behind each phase, including its <b>hits</b> counter and whether it matches on real addresses. Use it when two rules look alike and you need to know which one the ASA actually selected.</p>
<pre class="out">Forward Flow based lookup yields rule:
 in  id=0x7f3a1c2d4e10, priority=13, domain=permit, deny=false
        <span class="hl">hits=12</span>, user_data=0x7f3a19b00c40, cs_id=0x0, use_real_addr, flags=0x0, protocol=6
        src ip/id=0.0.0.0, mask=0.0.0.0, port=0, tag=any
        dst ip/id=10.0.2.10, mask=255.255.255.255, port=443, tag=any, dscp=0x0
        input_ifc=outside, output_ifc=any</pre>

<div class="eg"><p><b>Worked example: the lab ticket.</b> In the portal lab, <code>packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443</code> prints no UN-NAT phase at all. Phase 1 is ROUTE-LOOKUP with "egress ifc outside" (203.0.113.3 is in the outside /29), and phase 2 is ACCESS-LIST, Implicit Rule, DROP, <code>(acl-drop)</code>. The missing UN-NAT is the real clue: no static rule owns 203.0.113.3. <code>show nat</code> shows <code>source static WEB 203.0.113.5</code>. DNS and NAT disagree.</p></div>

<div class="warn"><p><b>Common mistake.</b> Tracing an inbound flow with the server's real address, for example <code>packet-tracer input outside tcp 198.51.100.10 40000 10.0.2.10 443</code>. The route lookup sends it to dmz, the ACL (written with real addresses) permits it, and you get "allow" for a packet that can never exist on the internet. Always use the address the client actually targets.</p></div>

<div class="exam"><p><b>Exam trap.</b> packet-tracer checks only the forward direction of the <b>first</b> packet through the configuration. "Action: allow" does not prove the server answers, that the return route exists beyond the ASA, or that the client used the right address. Pair it with a capture.</p></div>

<div class="scn"><h4>Allowed, yet still broken</h4><p>A new SFTP partner could not connect to 203.0.113.3 port 22. packet-tracer from outside showed UN-NAT, ACCESS-LIST permit and FLOW-CREATION, Action: allow. The engineer then captured on dmz and saw the SYN reach 10.0.2.10 with no SYN-ACK. The server's own host firewall only allowed port 22 from the admin subnet. The ASA was innocent, and the capture on the egress side proved it.</p><p><b>Lesson:</b> packet-tracer tells you what the ASA would do. A capture on the far side tells you what the world did afterwards.</p></div>

<div class="iv"><p class="q">"packet-tracer says allow, but the user still cannot connect. What next?"</p><p>Explain that packet-tracer simulates only the first forward packet. Next, capture on the ingress interface to prove the real packet arrives with the same addresses, then on the egress interface to see whether it leaves and whether a reply comes back. Check <code>show conn</code> for embryonic flags, and syslog for 302014 teardown reasons. Typical causes: server not listening or host firewall, missing return route on the server side, the client using a different address or port than the one you traced.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syntax: <code>packet-tracer input IFC PROTO SRC SPORT DST DPORT</code>; ICMP uses type and code.</li>
<li>input = arrival interface; addresses as seen on that wire.</li>
<li>Read Action, then the DROP phase, then its Config.</li>
<li>A missing UN-NAT for a published server means no static owns that address.</li>
<li>allow is not proof of end-to-end success; confirm with captures.</li>
</ul></div>
`,hi:`
<p>Airline pilots engine failure ki practice ek <b>flight simulator</b> mein karte hain. Kuch bhi real khatre mein nahi hota, phir bhi simulator aircraft jaisi hi physics chalata hai aur pilot ko har pal batata hai ki exactly kya hoga. <code>packet-tracer</code> ASA ka flight simulator hai. Aap ek packet describe karte ho, aur ASA uski ek virtual copy apni real configuration (NAT, routes, ACLs, inspection) se guzaarta hai aur har phase ka decision print karta hai. Box se koi traffic bahar nahi jaata, aur kisi ko aapke liye problem reproduce nahi karni padti.</p>

<h3>Syntax</h3>
<pre class="code"><span class="c">! TCP aur UDP: interface, protocol, source, source port, destination, destination port</span>
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443
packet-tracer input inside udp 10.0.1.10 51000 8.8.8.8 53
<span class="c">! ICMP: source, type, code, destination (8 0 = echo request)</span>
packet-tracer input inside icmp 10.0.1.10 8 0 8.8.8.8
<span class="c">! zyada internal detail, ya machine-readable output</span>
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443 detailed
packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443 xml</pre>
<p>Teen rules decide karte hain ki jawab par bharosa kiya jaa sakta hai ya nahi:</p>
<ul>
<li><b>input</b> woh interface hai jahan packet <b>aata</b> hai, woh nahi jahan se nikalta hai.</li>
<li>Addresses <b>waise likho jaise woh us wire par dikhte hain</b>. Internet par partner public address 203.0.113.3 se connect karta hai, isliye wahi destination hai, 10.0.2.10 nahi.</li>
<li>Realistic source chuno: ek high source port, aur ek address jo sach mein us interface par aa sakta ho. TCP ke liye packet-tracer pehla packet, yaani SYN, simulate karta hai.</li>
</ul>

<h3>Output padhna</h3>
<p>Output <b>phases</b> ki list hai, phir ek <b>Result</b> block. Har phase mein Type (kya check hua), Subtype, Result (ALLOW ya DROP), match hui <b>Config</b> lines, aur Additional Information hoti hai. Ise is order mein padho: neeche ki <b>Action</b> line, phir woh phase jo DROP kehta hai, phir us phase ke neeche ki Config. Config hi exact zimmedaar rule hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="packet-tracer phases">
<rect x="10" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="65" y="52" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT</text><text x="65" y="68" text-anchor="middle" class="svg-muted" font-size="12">public se real</text>
<rect x="135" y="30" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="13">ROUTE-LOOKUP</text><text x="190" y="68" text-anchor="middle" class="svg-muted" font-size="12">egress ifc</text>
<rect x="260" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="315" y="52" text-anchor="middle" class="svg-ink" font-size="13">ACCESS-LIST</text><text x="315" y="68" text-anchor="middle" class="svg-muted" font-size="12">permit ya deny</text>
<rect x="385" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="440" y="52" text-anchor="middle" class="svg-ink" font-size="13">NAT / INSPECT</text><text x="440" y="68" text-anchor="middle" class="svg-muted" font-size="12">translate, inspect</text>
<rect x="510" y="30" width="120" height="46" rx="8" fill="#bbf7d0"/><text x="570" y="52" text-anchor="middle" class="svg-ink" font-size="13">FLOW-CREATION</text><text x="570" y="68" text-anchor="middle" class="svg-muted" font-size="12">conn bana</text>
<line x1="120" y1="53" x2="135" y2="53" stroke="#64748b" stroke-width="2"/><line x1="245" y1="53" x2="260" y2="53" stroke="#64748b" stroke-width="2"/><line x1="370" y1="53" x2="385" y2="53" stroke="#64748b" stroke-width="2"/><line x1="495" y1="53" x2="510" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Pehla DROP trace rok deta hai: Action: drop, Drop-reason: (code) text</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Static published destination: UN-NAT egress chunta hai, alag ROUTE-LOOKUP line shayad na dikhe</text>
<text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">Exact phase names aur ginti software version aur enabled features par nirbhar hai</text>
</svg><p class="cap">Main phases jo aap lagbhag har trace mein padhoge.</p></div>

<p>9.x ASA par working portal flow ka trimmed trace aisa dikhta hai:</p>
<pre class="out">NK-ASA# packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443

Phase: 1
Type: UN-NAT
Subtype: static
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:
<span class="hl">NAT divert to egress interface dmz
Untranslate 203.0.113.3/443 to 10.0.2.10/443</span>

Phase: 2
Type: ACCESS-LIST
Subtype: log
Result: ALLOW
Config:
access-group OUTSIDE_IN in interface outside
<span class="hl">access-list OUTSIDE_IN extended permit tcp any object WEB eq h&#116;tps</span>
Additional Information:

Phase: 3
Type: NAT
Subtype: rpf-check
Result: ALLOW
Config:
object network WEB
 nat (dmz,outside) static 203.0.113.3
Additional Information:

Phase: 4
Type: FLOW-CREATION
Subtype:
Result: ALLOW
Config:
Additional Information:
New flow created with id 4211, packet dispatched to next module

Result:
input-interface: outside
input-status: up
input-line-status: up
output-interface: dmz
output-status: up
output-line-status: up
<span class="hl">Action: allow</span></pre>
<p>Real hardware par aapko IP-OPTIONS, NAT per-session, INSPECT jaise phases aur naye releases par timing lines bhi dikhengi. Lab simulator same key phases ke saath chhoti list print karta hai. Un chaar ko dhoondhna seekho jo matter karte hain: UN-NAT, ROUTE-LOOKUP, ACCESS-LIST aur NAT.</p>

<h3>Phase dar phase</h3>
<table class="cmp"><tr><th>Phase</th><th>Kya saabit karta hai</th><th>Drop ho ya missing ho to</th></tr>
<tr><td>UN-NAT static</td><td>Ek static rule destination ka maalik hai aur use real address par map karta hai.</td><td>Published server ke liye missing: koi rule us public address ka maalik nahi. <code>show nat</code> check karo.</td></tr>
<tr><td>ROUTE-LOOKUP</td><td>Packet kis interface se nikalega.</td><td><code>(no-route)</code> ke saath DROP: route jodo ya theek karo.</td></tr>
<tr><td>ACCESS-LIST</td><td>Exact ACE (ya Implicit Rule) jisne decide kiya.</td><td><code>(acl-drop)</code> ke saath DROP: Config ACL ka naam batati hai; Implicit Rule matlab koi line match nahi hui.</td></tr>
<tr><td>NAT</td><td>Source translation jo lagega.</td><td>PAT expect kiya tha aur missing hai: object ya interface pair galat hai.</td></tr>
<tr><td>NAT rpf-check</td><td>Return path usi NAT rule se match karta hai.</td><td><code>(nat-rpf-failed)</code> ke saath DROP: overlapping ya asymmetric NAT rules.</td></tr>
<tr><td>INSPECT</td><td>Kaunsa inspection engine flow handle karega.</td><td>Drop kam hota hai; inspection policy ki taraf ishaara.</td></tr>
<tr><td>FLOW-CREATION</td><td>Connection banega.</td><td>Agar iski jagah "Found flow with id ... using existing flow" dikhe, to connection pehle se hai.</td></tr></table>

<h3>Common drop reasons</h3>
<table class="cmp"><tr><th>Drop-reason</th><th>Matlab</th></tr>
<tr><td><code>(acl-drop) Flow is denied by configured rule</code></td><td>Kisi ACE ne ya ACL ke end ke implicit deny ne deny kiya.</td></tr>
<tr><td><code>(no-route) No route to host</code></td><td>Destination tak koi route nahi.</td></tr>
<tr><td><code>(nat-rpf-failed)</code></td><td>NAT reverse-path check fail hua, aam taur par conflicting NAT rules.</td></tr>
<tr><td><code>(rpf-violated) Reverse-path verify failed</code></td><td><code>ip verify reverse-path</code> on hai aur source ingress interface ke through reachable nahi.</td></tr>
<tr><td><code>(no-adjacency) No valid adjacency</code></td><td>Next hop resolve nahi ho sakta (ARP).</td></tr>
<tr><td><code>(ifc-classify)</code></td><td>ASA packet ko kisi interface ya context mein classify nahi kar paya.</td></tr></table>
<p>Naye releases internal frame aur flow references ke saath ek <b>Drop-location</b> line bhi print karte hain. Yeh zyada tar Cisco TAC ke kaam ki hai; action aap reason code par lete ho.</p>

<h3>detailed keyword</h3>
<p><code>detailed</code> har phase ke peeche ka internal rule jodta hai, uske <b>hits</b> counter ke saath aur yeh bhi ki woh real addresses par match karta hai ya nahi. Ise tab use karo jab do rules ek jaise dikhte hon aur aapko jaanna ho ki ASA ne asal mein kaunsa chuna.</p>
<pre class="out">Forward Flow based lookup yields rule:
 in  id=0x7f3a1c2d4e10, priority=13, domain=permit, deny=false
        <span class="hl">hits=12</span>, user_data=0x7f3a19b00c40, cs_id=0x0, use_real_addr, flags=0x0, protocol=6
        src ip/id=0.0.0.0, mask=0.0.0.0, port=0, tag=any
        dst ip/id=10.0.2.10, mask=255.255.255.255, port=443, tag=any, dscp=0x0
        input_ifc=outside, output_ifc=any</pre>

<div class="eg"><p><b>Worked example: lab ticket.</b> Portal lab mein <code>packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443</code> koi UN-NAT phase print hi nahi karta. Phase 1 ROUTE-LOOKUP hai "egress ifc outside" ke saath (203.0.113.3 outside /29 mein hai), aur phase 2 ACCESS-LIST, Implicit Rule, DROP, <code>(acl-drop)</code> hai. Missing UN-NAT hi asli clue hai: koi static rule 203.0.113.3 ka maalik nahi. <code>show nat</code> <code>source static WEB 203.0.113.5</code> dikhata hai. DNS aur NAT mein asahmati hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Inbound flow ko server ke real address se trace karna, jaise <code>packet-tracer input outside tcp 198.51.100.10 40000 10.0.2.10 443</code>. Route lookup use dmz bhejta hai, ACL (real addresses se likhi) permit karti hai, aur aapko ek aise packet ke liye "allow" milta hai jo internet par kabhi exist hi nahi kar sakta. Hamesha woh address use karo jise client asal mein target karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> packet-tracer configuration ke through sirf <b>pehle</b> packet ki forward direction check karta hai. "Action: allow" yeh saabit nahi karta ki server jawab deta hai, ASA ke aage return route hai, ya client ne sahi address use kiya. Ise capture ke saath jodo.</p></div>

<div class="scn"><h4>Allowed, phir bhi toota hua</h4><p>Ek naya SFTP partner 203.0.113.3 port 22 se connect nahi kar pa raha tha. Outside se packet-tracer ne UN-NAT, ACCESS-LIST permit aur FLOW-CREATION dikhaya, Action: allow. Phir engineer ne dmz par capture kiya aur dekha ki SYN 10.0.2.10 tak pahunchta hai par koi SYN-ACK nahi aata. Server ka apna host firewall port 22 sirf admin subnet se allow karta tha. ASA begunaah tha, aur egress side ke capture ne yeh saabit kiya.</p><p><b>Seekh:</b> packet-tracer batata hai ki ASA kya karega. Doosri taraf ka capture batata hai ki uske baad duniya ne kya kiya.</p></div>

<div class="iv"><p class="q">"packet-tracer allow kehta hai, par user ab bhi connect nahi kar pa raha. Aage kya?"</p><p>Samjhao ki packet-tracer sirf pehla forward packet simulate karta hai. Aage, ingress interface par capture karo yeh saabit karne ke liye ki real packet same addresses ke saath aata hai, phir egress interface par yeh dekhne ke liye ki woh nikalta hai aur reply aata hai ya nahi. Embryonic flags ke liye <code>show conn</code> aur 302014 teardown reasons ke liye syslog check karo. Typical causes: server listen nahi kar raha ya host firewall, server side par return route missing, client ne trace kiye address ya port se alag use kiya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syntax: <code>packet-tracer input IFC PROTO SRC SPORT DST DPORT</code>; ICMP type aur code use karta hai.</li>
<li>input = arrival interface; addresses waise jaise us wire par dikhte hain.</li>
<li>Action padho, phir DROP phase, phir uski Config.</li>
<li>Published server ke liye missing UN-NAT matlab koi static us address ka maalik nahi.</li>
<li>allow end-to-end success ka saboot nahi; captures se confirm karo.</li>
</ul></div>
`}};export{e as default};