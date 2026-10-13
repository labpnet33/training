var e={id:`planes`,h:{en:`The four planes and the control connections between components`,hi:`Chaar planes aur components ke beech control connections`},body:{en:`
<p>The previous chapter introduced the fabric. This chapter looks at how the control components relate to each other and to the edges: who connects to whom, over what protocol, and what you see when you ask the CLI. This is the first thing you check on any SD-WAN network, so it is worth learning well.</p>

<h3>The four planes in one table</h3>
<table class="cmp"><tr><th>Plane</th><th>Component</th><th>Main jobs</th></tr>
<tr><td>Orchestration</td><td>SD-WAN Validator (vBond)</td><td>First point of contact for every device. Authenticates it (certificate, organization name, authorised serial list), tells it which Controllers and Managers exist, and discovers the public address of devices behind NAT. Needs a public or statically NATed address. Its connection to an edge is <b>transient</b>.</td></tr>
<tr><td>Management</td><td>SD-WAN Manager (vManage)</td><td>Single pane of glass: GUI and REST API, templates and configuration groups, the authorised WAN edge list, certificates, software upgrades, monitoring and alarms. Keeps a permanent control connection to every device; NETCONF travels over it.</td></tr>
<tr><td>Control</td><td>SD-WAN Controller (vSmart)</td><td>OMP route reflector: receives routes, TLOCs and service routes from edges, applies control policy and reflects them to other edges; distributes data policy and IPsec keys. Does <b>not</b> forward user traffic.</td></tr>
<tr><td>Data</td><td>WAN edges</td><td>Build the IPsec tunnels, run BFD in each tunnel, forward user traffic, enforce data and application-aware routing policy, QoS, NAT and security.</td></tr></table>

<h3>Who connects to whom</h3>
<p>All control connections are secured with <b>DTLS</b> (UDP, base port 12346) by default; <b>TLS</b> (TCP) can be configured instead; if two peers are configured differently, TLS is used. The rules are easy to remember if you picture them as a star:</p>
<ul>
<li>Every <b>Manager</b> and <b>Controller</b> keeps a permanent connection to the <b>Validator</b>. This is how the Validator knows which Controllers and Managers to advertise to the edges.</li>
<li>Every <b>edge</b> briefly connects to the Validator, learns the addresses, then drops that connection.</li>
<li>Every edge keeps one connection to a <b>Controller per TLOC</b> (up to the configured <code>max-control-connections</code>, default 2) and exactly <b>one</b> connection to the <b>Manager</b>.</li>
<li>Controllers also connect to the Manager. Controllers connect to each other in a full mesh so that they share the same view.</li>
<li>Edges never form control connections with each other. Their relationship is the data-plane tunnels (chapter 6).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Control connections">
<rect x="250" y="20" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">VBOND (Validator)</text>
<rect x="60" y="110" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="135" text-anchor="middle" class="svg-ink" font-size="13">VMANAGE</text>
<rect x="440" y="110" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="510" y="135" text-anchor="middle" class="svg-ink" font-size="13">VSMART</text>
<line x1="290" y1="60" x2="150" y2="110" stroke="#16a34a" stroke-width="2.5"/><line x1="350" y1="60" x2="490" y2="110" stroke="#16a34a" stroke-width="2.5"/>
<line x1="200" y1="130" x2="440" y2="130" stroke="#16a34a" stroke-width="2.5"/>
<rect x="60" y="215" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="125" y="240" text-anchor="middle" class="svg-ink" font-size="13">WAN edge A</text>
<rect x="450" y="215" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="515" y="240" text-anchor="middle" class="svg-ink" font-size="13">WAN edge B</text>
<line x1="125" y1="215" x2="125" y2="150" stroke="#16a34a" stroke-width="2.5"/><line x1="170" y1="215" x2="470" y2="150" stroke="#16a34a" stroke-width="2.5"/>
<line x1="515" y1="215" x2="515" y2="150" stroke="#16a34a" stroke-width="2.5"/><line x1="470" y1="215" x2="170" y2="150" stroke="#16a34a" stroke-width="2.5"/>
<line x1="190" y1="235" x2="450" y2="235" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<line x1="300" y1="75" x2="165" y2="215" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3 3"/><line x1="340" y1="75" x2="475" y2="215" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3 3"/>
<text x="320" y="273" text-anchor="middle" class="svg-muted" font-size="11">Green: permanent control connections. Orange: temporary edge-to-Validator. Grey dashed: data tunnel.</text>
</svg><p class="cap">Control connections form a star around the controllers. The edges never connect to each other except with data-plane tunnels.</p></div>

<h3>Reading the Validator</h3>
<p>On the Validator the command is <code>show orchestrator connections</code>. Only Controllers and Managers stay registered there, because edge connections are transient.</p>
<pre class="code">VBOND# show orchestrator connections
         PEER    PEER PEER         SITE DOMAIN PEER          ORGANIZATION  REMOTE COLOR PROXY STATE
INSTANCE TYPE    PROT SYSTEM IP    ID   ID     PRIVATE IP    ...
------------------------------------------------------------------------------------------------
0        vmanage dtls 10.255.255.1 1    0      198.51.100.10 BHARAT-RETAIL default      No    up
0        vsmart  dtls 10.255.255.2 1    1      198.51.100.20 BHARAT-RETAIL default      No    up</pre>
<p>Check the type, the system IP, the organization name and that the <code>STATE</code> is <code>up</code>. The system IP of the Controller, 10.255.255.2, is the answer to the first lab question.</p>

<h3>Reading an edge</h3>
<p>On a WAN edge running IOS XE the command carries the <code>sdwan</code> keyword. E-DEL-1 has two TLOCs, so it holds two Controller connections and one Manager connection.</p>
<pre class="code">E-DEL-1# show sdwan control connections
PEER    PEER PEER         SITE DOMAIN PEER          PEER PUBLIC   PUB   ORGANIZATION   LOCAL        PROXY STATE UPTIME
TYPE    PROT SYSTEM IP    ID   ID     PRIVATE IP    IP            PORT                COLOR
--------------------------------------------------------------------------------------------------------------------
vsmart  dtls 10.255.255.2 1    1      198.51.100.20 198.51.100.20 12346 BHARAT-RETAIL  biz-internet No    <span class="hl">up</span>    0:00:02:31
vsmart  dtls 10.255.255.2 1    1      198.51.100.20 198.51.100.20 12346 BHARAT-RETAIL  mpls         No    <span class="hl">up</span>    0:00:02:30
vmanage dtls 10.255.255.1 1    0      198.51.100.10 198.51.100.10 12346 BHARAT-RETAIL  biz-internet No    <span class="hl">up</span>    0:00:02:33</pre>
<p>There is no <code>vbond</code> row, and that is normal. Once the edge has a Controller connection it closes the Validator connection. A missing vbond row on a healthy edge is not a fault.</p>

<h3>Reading the Controller</h3>
<p>On the Controller the commands use the Viptela style, without the <code>sdwan</code> keyword. <code>show control connections</code> lists the same peers from the other side, and <code>show omp peers</code> lists one OMP session per edge:</p>
<pre class="code">VSMART# show omp peers
R -&gt; routes received
I -&gt; routes installed
S -&gt; routes sent

                         DOMAIN OVERLAY SITE
PEER          TYPE       ID     ID      ID    STATE UPTIME     R/I/S
---------------------------------------------------------------------
10.255.0.11   vedge      1      1       100   up    0:02:11:30 3/0/4
10.255.0.12   vedge      1      1       200   up    0:02:11:28 3/0/4
10.255.0.13   vedge      1      1       300   up    0:02:11:25 2/0/5</pre>
<p>"Type vedge" here is just the OMP peer type name for any WAN edge, including IOS XE edges. The <code>R/I/S</code> column shows routes received, installed and sent; a Controller installs nothing for itself, so the middle number is 0.</p>

<div class="eg"><p><b>Worked example.</b> Count the sessions expected for Bharat Retail. Edges: 3. Each edge has one Manager connection (3 total). Controller connections: E-DEL-1 two TLOCs gives 2, E-MUM-1 gives 2, E-BLR-1 gives 1, a total of 5 edge-to-Controller connections. Plus VSMART and VMANAGE each keep one connection to VBOND. If a row is missing in your output, you now know exactly which connection it should be.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting a vbond row on an edge; expecting one Controller row regardless of the number of TLOCs; typing the Viptela form <code>show control connections</code> on an IOS XE edge (it needs <code>show sdwan control connections</code>) or the IOS XE form on a Controller.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which component maintains a permanent connection with every other control component and a temporary connection with edges?" is the Validator. "Which has one connection per edge regardless of TLOC count?" is the Manager.</p></div>

<div class="scn"><h4>Missing row after a link change</h4><p>After a carrier change at the Mumbai store, E-MUM-1 showed only one vsmart row where it used to show two. The NOC compared the output with what they expected from the TLOC count and saw that the MPLS-colour connection was gone. The cause was a carrier-side address change on the MPLS circuit. Because the NOC knew the expected rows by heart, the missing row was found in under a minute, before the store noticed anything.</p><p><b>Lesson:</b> knowing the expected number of control connections turns the output into a checklist.</p></div>

<div class="iv"><p class="q">"How many control connections should a WAN edge with two transports have?"</p><p>Strong answer: one to the Manager over one transport, and one to a Controller per TLOC (limited by max-control-connections, default 2). The Validator connection is only temporary. So two TLOCs normally give two Controller connections and one Manager connection, all DTLS over UDP 12346 by default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validator = orchestration, Manager = management, Controller = control, WAN edges = data.</li>
<li>Manager and Controller keep permanent connections to the Validator; edges use it only briefly.</li>
<li>An edge has one Manager connection and one Controller connection per TLOC.</li>
<li>Use <code>show orchestrator connections</code> on the Validator, <code>show control connections</code> and <code>show omp peers</code> on the Controller, and <code>show sdwan control connections</code> on an edge.</li>
<li>Edges never form control connections with each other.</li>
</ul></div>
`,hi:`
<p>Pichhle chapter mein fabric introduce hua. Yeh chapter dekhta hai ki control components aapas mein aur edges se kaise jude hain: kaun kis se connect hota hai, kis protocol par, aur CLI se poochne par aapko kya dikhta hai. Kisi bhi SD-WAN network par yeh sabse pehli cheez hai jo aap check karte ho, isliye ise achhe se seekhna chahiye.</p>

<h3>Chaar planes ek table mein</h3>
<table class="cmp"><tr><th>Plane</th><th>Component</th><th>Main kaam</th></tr>
<tr><td>Orchestration</td><td>SD-WAN Validator (vBond)</td><td>Har device ka pehla contact. Use authenticate karta hai (certificate, organization name, authorised serial list), batata hai kaunse Controllers aur Managers hain, aur NAT ke peeche wale devices ka public address discover karta hai. Isko public ya statically NATed address chahiye. Edge ke saath iska connection <b>transient</b> hota hai.</td></tr>
<tr><td>Management</td><td>SD-WAN Manager (vManage)</td><td>Single pane of glass: GUI aur REST API, templates aur configuration groups, authorised WAN edge list, certificates, software upgrades, monitoring aur alarms. Har device se permanent control connection rakhta hai; NETCONF usi par chalta hai.</td></tr>
<tr><td>Control</td><td>SD-WAN Controller (vSmart)</td><td>OMP route reflector: edges se routes, TLOCs aur service routes leta hai, control policy lagata hai aur doosre edges ko reflect karta hai; data policy aur IPsec keys baant-ta hai. User traffic forward <b>nahi</b> karta.</td></tr>
<tr><td>Data</td><td>WAN edges</td><td>IPsec tunnels banate hain, har tunnel mein BFD chalate hain, user traffic forward karte hain, data aur application-aware routing policy, QoS, NAT aur security enforce karte hain.</td></tr></table>

<h3>Kaun kis se connect hota hai</h3>
<p>Saare control connections default mein <b>DTLS</b> (UDP, base port 12346) se secure hote hain; <b>TLS</b> (TCP) iski jagah configure kiya ja sakta hai; agar do peers alag configured hon to TLS use hota hai. Agar aap ise star ki tarah imagine karo to rules yaad rakhna aasan hai:</p>
<ul>
<li>Har <b>Manager</b> aur <b>Controller</b> <b>Validator</b> se permanent connection rakhta hai. Isi se Validator ko pata hota hai ki edges ko kaunse Controllers aur Managers advertise karne hain.</li>
<li>Har <b>edge</b> thodi der Validator se connect hota hai, addresses seekhta hai, phir woh connection gira deta hai.</li>
<li>Har edge ek <b>Controller se har TLOC par</b> ek connection (configured <code>max-control-connections</code> tak, default 2) aur <b>Manager</b> se exactly <b>ek</b> connection rakhta hai.</li>
<li>Controllers Manager se bhi connect hote hain. Controllers aapas mein full mesh mein jude hote hain taaki unka view same rahe.</li>
<li>Edges aapas mein kabhi control connections nahi banate. Unka rishta data-plane tunnels ka hai (chapter 6).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Control connections">
<rect x="250" y="20" width="140" height="40" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">VBOND (Validator)</text>
<rect x="60" y="110" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="135" text-anchor="middle" class="svg-ink" font-size="13">VMANAGE</text>
<rect x="440" y="110" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="510" y="135" text-anchor="middle" class="svg-ink" font-size="13">VSMART</text>
<line x1="290" y1="60" x2="150" y2="110" stroke="#16a34a" stroke-width="2.5"/><line x1="350" y1="60" x2="490" y2="110" stroke="#16a34a" stroke-width="2.5"/>
<line x1="200" y1="130" x2="440" y2="130" stroke="#16a34a" stroke-width="2.5"/>
<rect x="60" y="215" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="125" y="240" text-anchor="middle" class="svg-ink" font-size="13">WAN edge A</text>
<rect x="450" y="215" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="515" y="240" text-anchor="middle" class="svg-ink" font-size="13">WAN edge B</text>
<line x1="125" y1="215" x2="125" y2="150" stroke="#16a34a" stroke-width="2.5"/><line x1="170" y1="215" x2="470" y2="150" stroke="#16a34a" stroke-width="2.5"/>
<line x1="515" y1="215" x2="515" y2="150" stroke="#16a34a" stroke-width="2.5"/><line x1="470" y1="215" x2="170" y2="150" stroke="#16a34a" stroke-width="2.5"/>
<line x1="190" y1="235" x2="450" y2="235" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<line x1="300" y1="75" x2="165" y2="215" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3 3"/><line x1="340" y1="75" x2="475" y2="215" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3 3"/>
<text x="320" y="273" text-anchor="middle" class="svg-muted" font-size="11">Green: permanent control connections. Orange: temporary edge-to-Validator. Grey dashed: data tunnel.</text>
</svg><p class="cap">Control connections controllers ke around star banate hain. Edges aapas mein sirf data-plane tunnels se jude hote hain.</p></div>

<h3>Validator ko padhna</h3>
<p>Validator par command <code>show orchestrator connections</code> hai. Wahan sirf Controllers aur Managers registered rehte hain, kyunki edge connections transient hote hain.</p>
<pre class="code">VBOND# show orchestrator connections
         PEER    PEER PEER         SITE DOMAIN PEER          ORGANIZATION  REMOTE COLOR PROXY STATE
INSTANCE TYPE    PROT SYSTEM IP    ID   ID     PRIVATE IP    ...
------------------------------------------------------------------------------------------------
0        vmanage dtls 10.255.255.1 1    0      198.51.100.10 BHARAT-RETAIL default      No    up
0        vsmart  dtls 10.255.255.2 1    1      198.51.100.20 BHARAT-RETAIL default      No    up</pre>
<p>Type, system IP, organization name check karo aur dekho ki <code>STATE</code> <code>up</code> hai. Controller ka system IP, 10.255.255.2, lab ke pehle sawaal ka jawab hai.</p>

<h3>Edge ko padhna</h3>
<p>IOS XE chalane wale WAN edge par command mein <code>sdwan</code> keyword aata hai. E-DEL-1 ke do TLOCs hain, isliye uske paas do Controller connections aur ek Manager connection hai.</p>
<pre class="code">E-DEL-1# show sdwan control connections
PEER    PEER PEER         SITE DOMAIN PEER          PEER PUBLIC   PUB   ORGANIZATION   LOCAL        PROXY STATE UPTIME
TYPE    PROT SYSTEM IP    ID   ID     PRIVATE IP    IP            PORT                COLOR
--------------------------------------------------------------------------------------------------------------------
vsmart  dtls 10.255.255.2 1    1      198.51.100.20 198.51.100.20 12346 BHARAT-RETAIL  biz-internet No    <span class="hl">up</span>    0:00:02:31
vsmart  dtls 10.255.255.2 1    1      198.51.100.20 198.51.100.20 12346 BHARAT-RETAIL  mpls         No    <span class="hl">up</span>    0:00:02:30
vmanage dtls 10.255.255.1 1    0      198.51.100.10 198.51.100.10 12346 BHARAT-RETAIL  biz-internet No    <span class="hl">up</span>    0:00:02:33</pre>
<p>Koi <code>vbond</code> row nahi hai, aur yeh normal hai. Controller connection aane ke baad edge Validator connection band kar deta hai. Healthy edge par vbond row na dikhna fault nahi hai.</p>

<h3>Controller ko padhna</h3>
<p>Controller par commands Viptela style mein hote hain, <code>sdwan</code> keyword ke bina. <code>show control connections</code> wahi peers doosri taraf se list karta hai, aur <code>show omp peers</code> har edge ke liye ek OMP session list karta hai:</p>
<pre class="code">VSMART# show omp peers
R -&gt; routes received
I -&gt; routes installed
S -&gt; routes sent

                         DOMAIN OVERLAY SITE
PEER          TYPE       ID     ID      ID    STATE UPTIME     R/I/S
---------------------------------------------------------------------
10.255.0.11   vedge      1      1       100   up    0:02:11:30 3/0/4
10.255.0.12   vedge      1      1       200   up    0:02:11:28 3/0/4
10.255.0.13   vedge      1      1       300   up    0:02:11:25 2/0/5</pre>
<p>"Type vedge" yahan kisi bhi WAN edge ke liye OMP peer type ka naam hai, IOS XE edges samet. <code>R/I/S</code> column routes received, installed aur sent dikhata hai; Controller apne liye kuch install nahi karta, isliye beech ka number 0 hai.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ke liye expected sessions gino. Edges: 3. Har edge ka ek Manager connection (kul 3). Controller connections: E-DEL-1 ke do TLOCs se 2, E-MUM-1 se 2, E-BLR-1 se 1, kul 5 edge-to-Controller connections. Plus VSMART aur VMANAGE dono VBOND se ek ek connection rakhte hain. Agar aapke output mein koi row missing hai, to ab aap exactly jaante ho ki woh kaunsa connection hona chahiye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Edge par vbond row expect karna; TLOCs ki sankhya se alag hamesha ek Controller row expect karna; IOS XE edge par Viptela form <code>show control connections</code> type karna (wahan <code>show sdwan control connections</code> chahiye) ya Controller par IOS XE form.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa component har doosre control component se permanent connection aur edges se temporary connection rakhta hai?" Validator hai. "Kiska har edge ke saath TLOC count se alag ek hi connection hota hai?" Manager ka.</p></div>

<div class="scn"><h4>Link change ke baad missing row</h4><p>Mumbai store par carrier change ke baad E-MUM-1 par ek hi vsmart row dikha jahan pehle do dikhti thi. NOC ne output ko TLOC count se expected ke saath compare kiya aur dekha ki MPLS-colour connection gayab hai. Wajah MPLS circuit par carrier-side address change thi. Kyunki NOC ko expected rows yaad thi, missing row ek minute se kam mein mil gayi, store ko kuch pata chalne se pehle.</p><p><b>Seekh:</b> control connections ki expected sankhya jaanna output ko checklist bana deta hai.</p></div>

<div class="iv"><p class="q">"Do transports wale WAN edge ke kitne control connections hone chahiye?"</p><p>Strong answer: ek Manager se ek transport par, aur har TLOC par ek Controller se (max-control-connections se limited, default 2). Validator connection sirf temporary hai. Isliye do TLOCs aam taur par do Controller connections aur ek Manager connection dete hain, sab DTLS over UDP 12346 default mein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validator = orchestration, Manager = management, Controller = control, WAN edges = data.</li>
<li>Manager aur Controller Validator se permanent connection rakhte hain; edges use sirf kuch der use karte hain.</li>
<li>Edge ka ek Manager connection aur har TLOC par ek Controller connection hota hai.</li>
<li>Validator par <code>show orchestrator connections</code>, Controller par <code>show control connections</code> aur <code>show omp peers</code>, aur edge par <code>show sdwan control connections</code> use karo.</li>
<li>Edges aapas mein kabhi control connections nahi banate.</li>
</ul></div>
`}};export{e as default};