var e={id:`mpls-basics-tables`,h:{en:`Enabling MPLS on Junos: families, interfaces and the routing tables`,hi:`Junos par MPLS enable karna: families, interfaces aur routing tables`},body:{en:`
<p>Before any label protocol can work, Junos needs three things: an interface that is allowed to forward MPLS packets, MPLS switched on globally for that interface, and a working IGP so that loopbacks can reach each other. Think of it as three switches in a row. Miss one and nothing flows, and no error message tells you which.</p>
<h3>The three switches</h3>
<ol><li><b>Interface family mpls</b>: <code>set interfaces ge-0/0/0 unit 0 family mpls</code>. Without it the interface drops labelled packets.</li><li><b>Protocol mpls on the interface</b>: <code>set protocols mpls interface ge-0/0/0.0</code>. This is needed for RSVP LSPs and for the router to accept label operations on that interface.</li><li><b>The label distribution protocol</b>: LDP or RSVP, covered in the next chapters.</li></ol>
<p>Here is the real simulator output after configuring family mpls next to family inet and inet6 on a core-facing interface. The simulator accepts and commits the configuration and lists the family, which proves the first switch. It does not show LDP or RSVP state, because those commands are not implemented.</p>
<pre class="out">R1&gt; show interfaces terse ge-0/0/0
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.0.12.1/30
                                   inet6    2001:db8:12::1/64
                                            fe80::5054:cff:fe04:4b01/64
                                   iso
<span class="hl">                                   mpls</span></pre>
<h3>The routing tables MPLS adds</h3>
<p>Junos keeps separate tables for different jobs. Learn these four names; the exam asks about them directly.</p>
<table class="cmp"><tr><th>Table</th><th>Holds</th><th>Used for</th></tr><tr><td>inet.0</td><td>IPv4 unicast routes</td><td>Normal IP forwarding</td></tr><tr><td>inet6.0</td><td>IPv6 unicast routes</td><td>Normal IPv6 forwarding</td></tr><tr><td>inet.3</td><td>Routes to the egress routers of LSPs (LDP and RSVP install here)</td><td>Resolving BGP next hops over an LSP</td></tr><tr><td>mpls.0</td><td>Incoming label with its operation and next hop</td><td>Label switching (the LFIB equivalent)</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="LDP and RSVP fill inet.3 and mpls.0; inet.0 stays for IP."><rect x="20" y="40" width="130" height="64" rx="10" fill="#bbf7d0"/><text x="85" y="68" text-anchor="middle" class="svg-ink" font-size="13">inet.0</text><text x="85" y="88" text-anchor="middle" class="svg-muted" font-size="11">IP routes</text><line x1="150" y1="72" x2="255" y2="72" stroke="#64748b" stroke-width="2"/><text x="202.5" y="62" text-anchor="middle" class="svg-accent" font-size="11">LDP/RSVP</text><rect x="255" y="40" width="130" height="64" rx="10" fill="#fde68a"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">inet.3</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">LSP egress routes</text><line x1="385" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="2"/><text x="437.5" y="62" text-anchor="middle" class="svg-accent" font-size="11">labels</text><rect x="490" y="40" width="130" height="64" rx="10" fill="#bae6fd"/><text x="555" y="68" text-anchor="middle" class="svg-ink" font-size="13">mpls.0</text><text x="555" y="88" text-anchor="middle" class="svg-muted" font-size="11">label table</text></svg><p class="cap">LDP and RSVP fill inet.3 and mpls.0; inet.0 stays for IP.</p></div>
<p>Why a separate inet.3? Because routes to LSP egress routers must not be used by ordinary IP traffic by accident. They are kept apart and consulted when BGP resolves its next hop (chapter 6).</p>
<h3>Reference configuration</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! R1 core interface: IP, IPv6, IS-IS and MPLS together</span>
set interfaces ge-0/0/0 unit 0 family inet address 10.0.12.1/30
set interfaces ge-0/0/0 unit 0 family mpls
set interfaces lo0 unit 0 family inet address 10.0.0.1/32
set protocols mpls interface ge-0/0/0.0
set protocols ospf area 0 interface ge-0/0/0.0
set protocols ospf area 0 interface lo0.0 passive</pre>
<div class="eg"><p><b>Worked example.</b> A new link between two routers is added with an address and OSPF, but the engineer forgets <code>family mpls</code> on one end. OSPF is up, pings work, but every LSP crossing the link stays down. The IP layer hides the missing MPLS family.</p></div>
<div class="warn"><p><b>Common mistake.</b> Putting an interface under <code>protocols ldp</code> but leaving out <code>family mpls</code>, or the reverse. Both are needed. Also remember that MTU grows by 4 bytes per label on the wire, so check core MTU.</p></div>
<div class="exam"><p><b>Exam trap.</b> inet.3 holds LSP egress routes and is used for BGP next-hop resolution; mpls.0 holds the label operations. Do not mix them up.</p></div>
<div class="scn"><h4>Link up, LSP down</h4><p>After a maintenance window an LDP session never formed on one new core link. Both routers pinged each other and OSPF was Full. The engineer compared interface configuration and found that family mpls was missing on one side. Adding it brought the session and the LSPs up.</p><p><b>Lesson:</b> Check family mpls and protocols mpls on both ends before blaming the protocol.</p></div>
<div class="iv"><p class="q">"Which routing tables are involved in MPLS forwarding on Junos?"</p><p>inet.0 for IP routes, inet.3 for LSP egress routes used for BGP next-hop resolution, and mpls.0 for the label operations. Mention that you need family mpls on the interface as well.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Three switches: family mpls, protocols mpls, and LDP or RSVP.</li><li>inet.3 holds LSP egress routes; mpls.0 holds label operations.</li><li>The simulator commits MPLS configuration but has no MPLS show commands.</li><li>Each label adds 4 bytes, so check MTU.</li></ul></div>
`,hi:`
<p>Koi bhi label protocol chalne se pehle Junos ko teen cheezein chahiye: aisi interface jo MPLS packets forward kar sake, us interface ke liye MPLS globally on ho, aur ek chalta hua IGP taaki loopbacks ek doosre tak pahunchein. Ise ek line mein teen switches samjho. Ek miss hua to kuch nahi chalta aur koi error nahi batata ki kaun sa miss hua.</p>
<h3>Teen switches</h3>
<ol><li><b>Interface family mpls</b>: <code>set interfaces ge-0/0/0 unit 0 family mpls</code>. Iske bina interface labelled packets drop kar deta hai.</li><li><b>Interface par protocol mpls</b>: <code>set protocols mpls interface ge-0/0/0.0</code>. RSVP LSPs aur us interface par label operations accept karne ke liye yeh chahiye.</li><li><b>Label distribution protocol</b>: LDP ya RSVP, jo agle chapters mein hain.</li></ol>
<p>Yeh simulator ka asli output hai jab core-facing interface par family inet aur inet6 ke saath family mpls configure kiya. Simulator configuration accept karke commit karta hai aur family dikhata hai, jisse pehla switch saabit hota hai. LDP ya RSVP state nahi dikhata kyunki woh commands implement nahi hain.</p>
<pre class="out">R1&gt; show interfaces terse ge-0/0/0
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.0.12.1/30
                                   inet6    2001:db8:12::1/64
                                            fe80::5054:cff:fe04:4b01/64
                                   iso
<span class="hl">                                   mpls</span></pre>
<h3>MPLS ke jodne wale routing tables</h3>
<p>Junos alag-alag kaam ke liye alag tables rakhta hai. Yeh chaar naam yaad rakho; exam seedha poochta hai.</p>
<table class="cmp"><tr><th>Table</th><th>Holds</th><th>Used for</th></tr><tr><td>inet.0</td><td>IPv4 unicast routes</td><td>Normal IP forwarding</td></tr><tr><td>inet6.0</td><td>IPv6 unicast routes</td><td>Normal IPv6 forwarding</td></tr><tr><td>inet.3</td><td>LSPs ke egress routers ke routes (LDP aur RSVP yahin install karte hain)</td><td>LSP ke upar BGP next hops resolve karna</td></tr><tr><td>mpls.0</td><td>Incoming label aur uska operation aur next hop</td><td>Label switching (LFIB jaisa)</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="LDP aur RSVP inet.3 aur mpls.0 bharte hain; inet.0 IP ke liye rehta hai."><rect x="20" y="40" width="130" height="64" rx="10" fill="#bbf7d0"/><text x="85" y="68" text-anchor="middle" class="svg-ink" font-size="13">inet.0</text><text x="85" y="88" text-anchor="middle" class="svg-muted" font-size="11">IP routes</text><line x1="150" y1="72" x2="255" y2="72" stroke="#64748b" stroke-width="2"/><text x="202.5" y="62" text-anchor="middle" class="svg-accent" font-size="11">LDP/RSVP</text><rect x="255" y="40" width="130" height="64" rx="10" fill="#fde68a"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">inet.3</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">LSP egress routes</text><line x1="385" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="2"/><text x="437.5" y="62" text-anchor="middle" class="svg-accent" font-size="11">labels</text><rect x="490" y="40" width="130" height="64" rx="10" fill="#bae6fd"/><text x="555" y="68" text-anchor="middle" class="svg-ink" font-size="13">mpls.0</text><text x="555" y="88" text-anchor="middle" class="svg-muted" font-size="11">label table</text></svg><p class="cap">LDP aur RSVP inet.3 aur mpls.0 bharte hain; inet.0 IP ke liye rehta hai.</p></div>
<p>Alag inet.3 kyun? Kyunki LSP egress routers ke routes ko ordinary IP traffic galti se use na kare. Unhe alag rakha jaata hai aur BGP next hop resolve karte waqt consult kiya jaata hai (chapter 6).</p>
<h3>Reference configuration</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! R1 core interface: IP, IPv6, IS-IS and MPLS together</span>
set interfaces ge-0/0/0 unit 0 family inet address 10.0.12.1/30
set interfaces ge-0/0/0 unit 0 family mpls
set interfaces lo0 unit 0 family inet address 10.0.0.1/32
set protocols mpls interface ge-0/0/0.0
set protocols ospf area 0 interface ge-0/0/0.0
set protocols ospf area 0 interface lo0.0 passive</pre>
<div class="eg"><p><b>Worked example.</b> Do routers ke beech naya link address aur OSPF ke saath jodha jaata hai, par engineer ek taraf <code>family mpls</code> bhool jaata hai. OSPF up hai, ping chalte hain, par is link se guzarne wala har LSP down rehta hai. IP layer missing MPLS family ko chhupa leta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Interface ko <code>protocols ldp</code> ke neeche daalna par <code>family mpls</code> chhod dena, ya ulta. Dono chahiye. Yeh bhi yaad rakho ki wire par har label ke saath MTU 4 bytes badhta hai, isliye core MTU check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> inet.3 LSP egress routes rakhta hai aur BGP next-hop resolution ke liye use hota hai; mpls.0 label operations rakhta hai. Dono mat milao.</p></div>
<div class="scn"><h4>Link up, LSP down</h4><p>Maintenance window ke baad ek naye core link par LDP session nahi bana. Dono routers ne ek doosre ko ping kiya aur OSPF Full tha. Engineer ne interface configuration compare ki to ek taraf family mpls missing mila. Add karte hi session aur LSPs up ho gaye.</p><p><b>Lesson:</b> Protocol ko doshi thehrane se pehle dono ends par family mpls aur protocols mpls check karo.</p></div>
<div class="iv"><p class="q">"Junos par MPLS forwarding mein kaun se routing tables shamil hain?"</p><p>inet.0 IP routes ke liye, inet.3 LSP egress routes ke liye jo BGP next-hop resolution mein use hote hain, aur mpls.0 label operations ke liye. Yeh bhi batao ki interface par family mpls chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Teen switches: family mpls, protocols mpls, aur LDP ya RSVP.</li><li>inet.3 LSP egress routes rakhta hai; mpls.0 label operations.</li><li>Simulator MPLS configuration commit karta hai par MPLS show commands nahi hain.</li><li>Har label 4 bytes badhata hai, isliye MTU check karo.</li></ul></div>
`}};export{e as default};