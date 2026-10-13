var e={id:`ospfv3`,h:{en:`OSPFv3 on Junos: adjacency, link-local and the database`,hi:`Junos par OSPFv3: adjacency, link-local aur database`},body:{en:`
<p>OSPFv3 is OSPF reworked for IPv6. If OSPFv2 is a tram system with fixed stops, OSPFv3 is the same tram line with the signage changed so that it can serve a new city. The ideas you know from jncis-ospf stay: areas, DR and BDR election, SPF, Hello and Dead timers, cost. What changes are details that matter in the exam.</p>
<h3>What is different from OSPFv2</h3>
<ul><li><b>Runs per link, not per subnet</b>: adjacencies form using link-local addresses, so two routers can become neighbours even without a shared global prefix.</li><li><b>No addresses in the packet header</b>: the router ID, area ID and LSA IDs are still 32-bit numbers written like IPv4 addresses. A router with no IPv4 address must be given a router ID by hand.</li><li><b>New LSA types and scopes</b>: Link LSAs (link scope) and Intra-Area-Prefix LSAs carry the prefixes; Router and Network LSAs no longer carry addresses.</li><li><b>Authentication moved</b>: OSPFv3 has no authentication field and relies on IPsec headers.</li><li><b>Multicast groups</b>: ff02::5 (all OSPF routers) and ff02::6 (DR and BDR).</li></ul>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="OSPFv3 neighbours talk over link-local addresses on the multicast group ff02::5."><rect x="20" y="40" width="130" height="64" rx="10" fill="#bbf7d0"/><text x="85" y="68" text-anchor="middle" class="svg-ink" font-size="13">Router 1</text><text x="85" y="88" text-anchor="middle" class="svg-muted" font-size="11">fe80::...</text><line x1="150" y1="72" x2="255" y2="72" stroke="#64748b" stroke-width="2"/><text x="202.5" y="62" text-anchor="middle" class="svg-accent" font-size="11">Hello</text><rect x="255" y="40" width="130" height="64" rx="10" fill="#fde68a"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">ge-0/0/0.0</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">ff02::5</text><line x1="385" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="2"/><text x="437.5" y="62" text-anchor="middle" class="svg-accent" font-size="11">Hello</text><rect x="490" y="40" width="130" height="64" rx="10" fill="#ddd6fe"/><text x="555" y="68" text-anchor="middle" class="svg-ink" font-size="13">Router 2</text><text x="555" y="88" text-anchor="middle" class="svg-muted" font-size="11">fe80::...</text></svg><p class="cap">OSPFv3 neighbours talk over link-local addresses on the multicast group ff02::5.</p></div>
<h3>Configuration</h3>
<p>In Junos, OSPFv3 is its own protocol, <code>protocols ospf3</code>. Interfaces need <code>family inet6</code>. The loopback is added as <b>passive</b> so it is advertised without forming adjacencies. This matches the real simulator lab behind the following outputs.</p>
<pre class="code">configure
set routing-options router-id 10.255.3.1
set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:3:12::1/64
set interfaces lo0 unit 0 family inet6 address 2001:db8:3::1/128
set protocols ospf3 area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf3 area 0.0.0.0 interface lo0.0 passive
commit and-quit</pre>
<pre class="out">R1&gt; show ospf3 neighbor
ID               Interface              State     Pri   Dead
10.255.3.2       ge-0/0/0.0             <span class="hl">Full</span>      128     35
  Neighbor-address fe80::5054:fff:fe04:5001

R1&gt; show ospf3 interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          BDR     0.0.0.0         10.255.3.2      10.255.3.1         1
lo0.0               DR      0.0.0.0         0.0.0.0         0.0.0.0            0</pre>
<p>Read the neighbour line. The ID is the neighbour's 32-bit router ID. The <b>Neighbor-address</b> is a link-local address, which proves that the adjacency runs over link-local, not the global prefix. The interface line shows R1 as BDR on a broadcast link, with the DR ID of the neighbour.</p>
<h3>The link-state database</h3>
<p>This is a real database from a two-router dual-stack lab (area 0.0.0.0). The <b>Router</b> and <b>Network</b> LSAs describe the topology; the <b>IntraArPfx</b> LSAs carry the IPv6 prefixes; the <b>Link</b> LSAs are link-local and carry the link-local address and prefixes on that link only.</p>
<pre class="out">R1&gt; show ospf3 database
    OSPF3 database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Router     *0.0.0.0          10.0.0.1         0x80000001    90  0xae11  40
Router      0.0.0.0          10.0.0.2         0x80000001    90  0xd59f  40
Network     0.0.0.1          10.0.0.2         0x80000001    90  0x7a07  32
<span class="hl">IntraArPfx *0.0.0.1          10.0.0.1         0x80000001    90  0x4a96  52
IntraArPfx  0.0.0.1          10.0.0.2         0x80000001    90  0xb3da  52
IntraArPfx  0.0.0.2          10.0.0.2         0x80000001    90  0xe45c  52</span>
    OSPF3 Link-Local database, interface ge-0/0/0.0 Area 0.0.0.0
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Link       *0.0.0.1          10.0.0.1         0x80000001    90  0x9d2a  64
Link        0.0.0.1          10.0.0.2         0x80000001    90  0x0962  64</pre>
<table class="cmp"><tr><th>LSA</th><th>Scope</th><th>Carries</th></tr><tr><td>Router</td><td>Area</td><td>Router and its links, no prefixes</td></tr><tr><td>Network</td><td>Area</td><td>DR-generated list of routers on the link</td></tr><tr><td>Link</td><td>Link</td><td>Link-local address and prefixes on the link</td></tr><tr><td>Intra-Area-Prefix</td><td>Area</td><td>IPv6 prefixes in the area</td></tr></table>
<div class="eg"><p><b>Worked example.</b> A two-router lab with loopbacks 2001:db8:ffff::1/128 and 2001:db8:ffff::2/128 gives R1 an OSPF3 route to the remote loopback with preference 10 and metric 1, via the neighbour's link-local address. The IPv4 OSPF process on the same routers is independent and has its own database.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting that OSPFv3 needs a 32-bit router ID. On a router with only IPv6 addresses, set <code>routing-options router-id</code> by hand or the process cannot start cleanly.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPFv3 uses link-local addresses for neighbours and ff02::5 and ff02::6. Prefixes live in Intra-Area-Prefix LSAs, not Router LSAs. OSPFv3 and OSPFv2 are independent instances.</p></div>
<div class="scn"><h4>Adjacency up, no routes</h4><p>Two routers formed an OSPFv3 adjacency but exchanged no prefixes. The interface had no inet6 family on one side after a rollback. Restoring family inet6 and the passive loopback brought the IntraArPfx LSAs and the routes.</p><p><b>Lesson:</b> Check the prefixes in the database, not just the neighbour state.</p></div>
<div class="iv"><p class="q">"How does OSPFv3 differ from OSPFv2?"</p><p>It runs per link using link-local addresses, has new LSA types (Link and Intra-Area-Prefix) so prefixes are separate from topology, uses ff02::5 and ff02::6, and relies on IPsec instead of built-in authentication. It is a separate protocol instance from OSPFv2.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>OSPFv3 is protocols ospf3 and needs family inet6 on interfaces.</li><li>Neighbours use link-local addresses.</li><li>Prefixes are in Intra-Area-Prefix LSAs; Link LSAs are link-scoped.</li><li>Set a router ID by hand on IPv6-only routers.</li></ul></div>
`,hi:`
<p>OSPFv3 IPv6 ke liye dobara banaya gaya OSPF hai. Agar OSPFv2 fixed stops wali tram system hai to OSPFv3 wahi tram line hai jiska signage naye shehar ke liye badla gaya. jncis-ospf ke concepts wahi rehte hain: areas, DR aur BDR election, SPF, Hello aur Dead timers, cost. Jo badalta hai woh details exam mein important hain.</p>
<h3>OSPFv2 se kya alag hai</h3>
<ul><li><b>Per link chalta hai, per subnet nahi</b>: adjacencies link-local addresses se bante hain, isliye do routers shared global prefix ke bina bhi neighbours ban sakte hain.</li><li><b>Packet header mein addresses nahi</b>: router ID, area ID aur LSA IDs ab bhi 32-bit numbers hain jo IPv4 address jaise likhe jaate hain. Jis router ka IPv4 address nahi, use router ID haath se dena padta hai.</li><li><b>Naye LSA types aur scopes</b>: Link LSAs (link scope) aur Intra-Area-Prefix LSAs prefixes carry karte hain; Router aur Network LSAs ab addresses carry nahi karte.</li><li><b>Authentication shift hua</b>: OSPFv3 mein authentication field nahi hai aur woh IPsec headers par nirbhar hai.</li><li><b>Multicast groups</b>: ff02::5 (saare OSPF routers) aur ff02::6 (DR aur BDR).</li></ul>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="OSPFv3 neighbours link-local addresses par multicast group ff02::5 se baat karte hain."><rect x="20" y="40" width="130" height="64" rx="10" fill="#bbf7d0"/><text x="85" y="68" text-anchor="middle" class="svg-ink" font-size="13">Router 1</text><text x="85" y="88" text-anchor="middle" class="svg-muted" font-size="11">fe80::...</text><line x1="150" y1="72" x2="255" y2="72" stroke="#64748b" stroke-width="2"/><text x="202.5" y="62" text-anchor="middle" class="svg-accent" font-size="11">Hello</text><rect x="255" y="40" width="130" height="64" rx="10" fill="#fde68a"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">ge-0/0/0.0</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">ff02::5</text><line x1="385" y1="72" x2="490" y2="72" stroke="#64748b" stroke-width="2"/><text x="437.5" y="62" text-anchor="middle" class="svg-accent" font-size="11">Hello</text><rect x="490" y="40" width="130" height="64" rx="10" fill="#ddd6fe"/><text x="555" y="68" text-anchor="middle" class="svg-ink" font-size="13">Router 2</text><text x="555" y="88" text-anchor="middle" class="svg-muted" font-size="11">fe80::...</text></svg><p class="cap">OSPFv3 neighbours link-local addresses par multicast group ff02::5 se baat karte hain.</p></div>
<h3>Configuration</h3>
<p>Junos mein OSPFv3 apna alag protocol hai, <code>protocols ospf3</code>. Interfaces ko <code>family inet6</code> chahiye. Loopback ko <b>passive</b> jodte hain taaki woh adjacency banaye bina advertise ho. Neeche ke outputs isi real simulator lab ke hain.</p>
<pre class="code">configure
set routing-options router-id 10.255.3.1
set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:3:12::1/64
set interfaces lo0 unit 0 family inet6 address 2001:db8:3::1/128
set protocols ospf3 area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf3 area 0.0.0.0 interface lo0.0 passive
commit and-quit</pre>
<pre class="out">R1&gt; show ospf3 neighbor
ID               Interface              State     Pri   Dead
10.255.3.2       ge-0/0/0.0             <span class="hl">Full</span>      128     35
  Neighbor-address fe80::5054:fff:fe04:5001

R1&gt; show ospf3 interface
Interface           State   Area            DR ID           BDR ID          Nbrs
ge-0/0/0.0          BDR     0.0.0.0         10.255.3.2      10.255.3.1         1
lo0.0               DR      0.0.0.0         0.0.0.0         0.0.0.0            0</pre>
<p>Neighbour line padho. ID neighbour ka 32-bit router ID hai. <b>Neighbor-address</b> link-local address hai, jo saabit karta hai ki adjacency global prefix par nahi balki link-local par chalti hai. Interface line R1 ko broadcast link par BDR dikhati hai aur DR ID neighbour ki hai.</p>
<h3>Link-state database</h3>
<p>Yeh do-router dual-stack lab (area 0.0.0.0) ka real database hai. <b>Router</b> aur <b>Network</b> LSAs topology batate hain; <b>IntraArPfx</b> LSAs IPv6 prefixes carry karte hain; <b>Link</b> LSAs link-local hain aur sirf us link par link-local address aur prefixes carry karte hain.</p>
<pre class="out">R1&gt; show ospf3 database
    OSPF3 database, Area 0.0.0.0
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Router     *0.0.0.0          10.0.0.1         0x80000001    90  0xae11  40
Router      0.0.0.0          10.0.0.2         0x80000001    90  0xd59f  40
Network     0.0.0.1          10.0.0.2         0x80000001    90  0x7a07  32
<span class="hl">IntraArPfx *0.0.0.1          10.0.0.1         0x80000001    90  0x4a96  52
IntraArPfx  0.0.0.1          10.0.0.2         0x80000001    90  0xb3da  52
IntraArPfx  0.0.0.2          10.0.0.2         0x80000001    90  0xe45c  52</span>
    OSPF3 Link-Local database, interface ge-0/0/0.0 Area 0.0.0.0
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Link       *0.0.0.1          10.0.0.1         0x80000001    90  0x9d2a  64
Link        0.0.0.1          10.0.0.2         0x80000001    90  0x0962  64</pre>
<table class="cmp"><tr><th>LSA</th><th>Scope</th><th>Carries</th></tr><tr><td>Router</td><td>Area</td><td>Router aur uske links, prefixes nahi</td></tr><tr><td>Network</td><td>Area</td><td>DR ka banaya link ke routers ka list</td></tr><tr><td>Link</td><td>Link</td><td>Link par link-local address aur prefixes</td></tr><tr><td>Intra-Area-Prefix</td><td>Area</td><td>Area ke IPv6 prefixes</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Do-router lab jisme loopbacks 2001:db8:ffff::1/128 aur 2001:db8:ffff::2/128 hain, R1 ko remote loopback ka OSPF3 route preference 10 aur metric 1 ke saath neighbour ke link-local address se deta hai. Usi routers par IPv4 OSPF process independent hai aur uska apna database hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Yeh bhool jaana ki OSPFv3 ko 32-bit router ID chahiye. Sirf IPv6 addresses wale router par <code>routing-options router-id</code> haath se set karo warna process theek se start nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> OSPFv3 neighbours ke liye link-local addresses aur ff02::5 aur ff02::6 use karta hai. Prefixes Intra-Area-Prefix LSAs mein hote hain, Router LSAs mein nahi. OSPFv3 aur OSPFv2 independent instances hain.</p></div>
<div class="scn"><h4>Adjacency up, routes nahi</h4><p>Do routers ne OSPFv3 adjacency banayi par koi prefix exchange nahi hua. Rollback ke baad ek taraf interface par inet6 family nahi thi. Family inet6 aur passive loopback wapas lagane se IntraArPfx LSAs aur routes aaye.</p><p><b>Lesson:</b> Sirf neighbour state nahi, database mein prefixes bhi check karo.</p></div>
<div class="iv"><p class="q">"OSPFv3 OSPFv2 se kaise alag hai?"</p><p>Yeh link-local addresses se per link chalta hai, naye LSA types (Link aur Intra-Area-Prefix) hain jisse prefixes topology se alag hain, ff02::5 aur ff02::6 use karta hai, aur built-in authentication ki jagah IPsec par nirbhar hai. Yeh OSPFv2 se alag protocol instance hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>OSPFv3 protocols ospf3 hai aur interfaces par family inet6 chahiye.</li><li>Neighbours link-local addresses use karte hain.</li><li>Prefixes Intra-Area-Prefix LSAs mein hote hain; Link LSAs link-scoped hain.</li><li>IPv6-only routers par router ID haath se set karo.</li></ul></div>
`}};export{e as default};