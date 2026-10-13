var e={id:`architecture`,h:{en:`OSPFv3 architecture: per link, link-local, instance ID`,hi:`OSPFv3 architecture: per link, link-local, instance ID`},body:{en:`
<p>Picture two neighbours whose houses share a garden wall. They chat over the wall every day. They do not care what the postal code on each house says; they know each other by name, and they talk across the wall they share. OSPFv2 behaves more like two neighbours who only talk if their postal codes match. OSPFv3 talks <b>over the wall</b>: it runs per link, and the postal code (the global IPv6 prefix) is not part of the conversation at all.</p>

<h3>Per link, not per subnet</h3>
<p>In OSPFv2 a Hello carries the network mask, and on broadcast links the two routers must be in the same IPv4 subnet or they never become neighbours. OSPFv3 removed that check. A <b>link</b> is simply the medium two or more routers share, and a link can carry several IPv6 prefixes, or none. OSPFv3 runs on the link itself:</p>
<ul>
<li>Packets are sourced from the interface's <b>link-local address</b> (FE80::/10), not from a global address.</li>
<li>They are sent to <b>FF02::5</b> (AllSPFRouters) or <b>FF02::6</b> (AllDRouters), or unicast to a neighbour's link-local address.</li>
<li>They use IPv6 next header <b>89</b> and a hop limit of 1, so they never leave the link.</li>
<li>Two routers whose global prefixes do not match on a link still become neighbours. Only <code>ipv6 enable</code> (a link-local address) is required to run OSPFv3 on an interface.</li>
</ul>

<h3>Link-local next hops</h3>
<p>Because the neighbour is known by its link-local address, every OSPFv3 route in the IPv6 routing table points to a <b>FE80:: next hop plus an exit interface</b>. A link-local address is only unique on one link, so the interface is mandatory. This is normal and correct; it is not a sign of a problem.</p>
<pre class="out">R1# show ipv6 route ospf
IPv6 Routing Table - default - 7 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1, OE2 - OSPF ext 2
       ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2
OI  2001:DB8:ACAD:F23::/64 [110/2]
     <span class="hl">via FE80::5200:FF:FE02:0, GigabitEthernet0/0</span></pre>

<h3>Router ID, interface ID and instance ID</h3>
<dl class="terms">
<dt>Router ID</dt><dd>Still a <b>32-bit</b> number written like an IPv4 address. It identifies the router in every LSA and in the neighbour table. Chapter 4 covers why an IPv6-only router cannot pick one by itself.</dd>
<dt>Neighbour identity</dt><dd>In OSPFv3 neighbours are always identified by <b>router ID</b>, on every network type. In OSPFv2 broadcast and NBMA neighbours were identified by their interface IP address.</dd>
<dt>Interface ID</dt><dd>A 32-bit number each router gives each of its OSPFv3 interfaces (on Cisco IOS usually the interface's internal index). It is carried in Hellos and router LSAs, and the <b>link state ID of a network LSA is the DR's interface ID</b>. You see it in <code>show ipv6 ospf neighbor</code> under "Interface ID".</dd>
<dt>Instance ID</dt><dd>An 8-bit field in the OSPFv3 packet header. It lets several OSPFv3 instances share one link, each ignoring the others' packets. The default is 0. <b>Both ends must use the same instance ID</b> or they silently ignore each other. With address families (RFC 5838), IPv6 unicast uses instance IDs 0 to 31 and IPv4 unicast uses 64 to 95.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="OSPFv3 on one link">
<rect x="30" y="60" width="150" height="60" rx="8" fill="#bae6fd"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="14">R1 Gi0/0</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="12">FE80::5200:FF:FE01:0</text>
<rect x="460" y="60" width="150" height="60" rx="8" fill="#bae6fd"/><text x="535" y="84" text-anchor="middle" class="svg-ink" font-size="14">R2 Gi0/0</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="12">FE80::5200:FF:FE02:0</text>
<line x1="180" y1="90" x2="460" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="20" width="200" height="50" rx="8" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">Hello to FF02::5</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">next header 89, hop limit 1</text>
<rect x="200" y="140" width="240" height="80" rx="8" fill="#e2e8f0"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">Must match: area, hello/dead,</text><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="12">instance ID, stub flags, auth</text><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Not checked: global prefix</text>
</svg><p class="cap">OSPFv3 talks link-local to link-local on the shared link; the global prefix is not part of the Hello.</p></div>

<h3>What changed in the packets</h3>
<table class="cmp"><tr><th>Item</th><th>OSPFv2</th><th>OSPFv3</th></tr>
<tr><td>Runs over</td><td>IPv4 subnet</td><td>Link (link-local source)</td></tr>
<tr><td>Hello carries mask</td><td>Yes, must match</td><td>No</td></tr>
<tr><td>Neighbour identified by</td><td>IP address (broadcast/NBMA)</td><td>Router ID always</td></tr>
<tr><td>Authentication</td><td>In the OSPF header</td><td>IPsec or authentication trailer</td></tr>
<tr><td>Instance ID</td><td>No</td><td>Yes, 8 bits</td></tr>
<tr><td>Prefixes in router LSA</td><td>Yes</td><td>No, in type 8 and type 9</td></tr>
<tr><td>Multicast</td><td>224.0.0.5 / .6</td><td>FF02::5 / FF02::6</td></tr>
</table>
<p>What did <b>not</b> change: the five packet types (Hello, DBD, LSR, LSU, LSAck), the neighbour states from Down to Full, the DR/BDR election, areas, cost, SPF and the administrative distance of 110.</p>

<h3>Reading the interface</h3>
<pre class="out">R1# show ipv6 ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  <span class="hl">Link Local Address FE80::5200:FF:FE01:0, Interface ID 3</span>
  <span class="hl">Area 0, Process ID 1, Instance ID 0, Router ID 1.1.1.1</span>
  Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State BDR, Priority 1
  Designated Router (ID) 2.2.2.2, local address FE80::5200:FF:FE02:0
  Backup Designated router (ID) 1.1.1.1, local address FE80::5200:FF:FE01:0
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
  Neighbor Count is 1, Adjacent neighbor count is 1
    Adjacent with neighbor 2.2.2.2  (Designated Router)</pre>
<p>Five facts in one command: the link-local source, the interface ID, the instance ID, the network type and the DR. When two routers refuse to talk, run this on both ends and compare line by line.</p>

<div class="eg"><p><b>Worked example.</b> R1 Gi0/0 is <code>2001:DB8:ACAD:F12::1/64</code>. By mistake R2 Gi0/0 is configured as <code>2001:DB8:ACAD:F21::2/64</code>. In OSPFv2 the equivalent mistake would stop the adjacency. In OSPFv3 R1 and R2 still reach FULL, because Hellos use FE80:: addresses. Routing across R2 still works, since next hops are link-local. But <code>ping 2001:DB8:ACAD:F12::2</code> from R1 fails, and both /64s appear in the database as separate prefixes.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing a static IPv6 route with a link-local next hop and no interface, such as <code>ipv6 route ::/0 FE80::1</code>. IOS rejects it, because a link-local address alone is ambiguous. OSPFv3 always installs the interface for the same reason.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The routers are in different IPv6 subnets, so OSPFv3 cannot form an adjacency" is false. Mismatched global prefixes do not block OSPFv3. Mismatched <b>instance IDs</b> do, and they produce no error message at all, only a missing neighbour.</p></div>

<div class="scn"><h4>The neighbour that could not be pinged</h4><p>After a renumbering job a monitoring system alarmed that the global address of a core router's neighbour did not answer. Yet <code>show ipv6 ospf neighbor</code> showed FULL and user traffic flowed. The engineer checked <code>show ipv6 interface brief</code> on both ends and found one side on the old /64 and the other on the new one. OSPFv3 did not care, because it was using link-local addresses. The fix was to correct the global address; routing was never affected.</p><p><b>Lesson:</b> an OSPFv3 adjacency proves link-local reachability only. Check global addressing separately.</p></div>

<div class="iv"><p class="q">"Why does OSPFv3 use link-local addresses for its packets and next hops?"</p><p>Strong answer: every IPv6 interface always has a link-local address, even with no global prefix, so OSPFv3 can run on any IPv6-enabled link and survive global renumbering. Link-local addresses never leave the link, which suits a protocol that only talks to directly connected neighbours. The trade-off is that next hops need an exit interface, and that global prefix mismatches are no longer caught by the Hello.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 runs per link, sourced from FE80:: addresses to FF02::5 and FF02::6, protocol 89.</li>
<li>Global prefix mismatches do not block adjacencies; instance ID mismatches do, silently.</li>
<li>OSPFv3 routes use a link-local next hop plus an exit interface.</li>
<li>Neighbours are always identified by 32-bit router ID; network LSAs use the DR's interface ID.</li>
<li>IPv6 AF uses instance IDs 0 to 31, IPv4 AF uses 64 to 95.</li>
</ul></div>
`,hi:`
<p>Do padosi socho jinke gharon ke beech ek garden wall hai. Woh roz deewar ke upar se baat karte hain. Unhe fark nahi padta ki har ghar par kaunsa postal code likha hai; woh ek doosre ko naam se jaante hain, aur jo deewar share karte hain uske upar se baat karte hain. OSPFv2 un padosiyon jaisa hai jo tabhi baat karte hain jab postal codes match hon. OSPFv3 <b>deewar ke upar se</b> baat karta hai: yeh per link chalta hai, aur postal code (global IPv6 prefix) baatcheet ka hissa hi nahi hai.</p>

<h3>Per link, per subnet nahi</h3>
<p>OSPFv2 mein Hello network mask le jaata hai, aur broadcast links par dono routers ek hi IPv4 subnet mein hone chahiye warna woh kabhi neighbours nahi bante. OSPFv3 ne yeh check hata diya. <b>Link</b> bas woh medium hai jo do ya zyada routers share karte hain, aur ek link par kai IPv6 prefixes ho sakte hain, ya ek bhi nahi. OSPFv3 link par hi chalta hai:</p>
<ul>
<li>Packets interface ke <b>link-local address</b> (FE80::/10) se source hote hain, global address se nahi.</li>
<li>Woh <b>FF02::5</b> (AllSPFRouters) ya <b>FF02::6</b> (AllDRouters) par bheje jaate hain, ya neighbour ke link-local address par unicast.</li>
<li>Woh IPv6 next header <b>89</b> aur hop limit 1 use karte hain, isliye link se kabhi bahar nahi jaate.</li>
<li>Jin do routers ke global prefixes link par match nahi karte, woh bhi neighbours ban jaate hain. Interface par OSPFv3 chalane ke liye sirf <code>ipv6 enable</code> (ek link-local address) chahiye.</li>
</ul>

<h3>Link-local next hops</h3>
<p>Kyunki neighbour apne link-local address se pehchana jaata hai, IPv6 routing table ka har OSPFv3 route <b>FE80:: next hop plus exit interface</b> ki taraf point karta hai. Link-local address sirf ek link par unique hota hai, isliye interface zaroori hai. Yeh normal aur sahi hai; kisi problem ka sign nahi.</p>
<pre class="out">R1# show ipv6 route ospf
IPv6 Routing Table - default - 7 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1, OE2 - OSPF ext 2
       ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2
OI  2001:DB8:ACAD:F23::/64 [110/2]
     <span class="hl">via FE80::5200:FF:FE02:0, GigabitEthernet0/0</span></pre>

<h3>Router ID, interface ID aur instance ID</h3>
<dl class="terms">
<dt>Router ID</dt><dd>Abhi bhi <b>32-bit</b> number jo IPv4 address jaisa likha jaata hai. Yeh har LSA aur neighbour table mein router ko identify karta hai. Chapter 4 batata hai ki IPv6-only router khud ek kyun nahi chun sakta.</dd>
<dt>Neighbour identity</dt><dd>OSPFv3 mein neighbours hamesha <b>router ID</b> se pehchane jaate hain, har network type par. OSPFv2 mein broadcast aur NBMA neighbours apne interface IP address se pehchane jaate the.</dd>
<dt>Interface ID</dt><dd>32-bit number jo har router apne har OSPFv3 interface ko deta hai (Cisco IOS par aam taur par interface ka internal index). Yeh Hellos aur router LSAs mein jaata hai, aur <b>network LSA ka link state ID DR ka interface ID hota hai</b>. Aap ise <code>show ipv6 ospf neighbor</code> mein "Interface ID" ke neeche dekhte ho.</dd>
<dt>Instance ID</dt><dd>OSPFv3 packet header mein 8-bit field. Yeh kai OSPFv3 instances ko ek link share karne deta hai, har ek doosron ke packets ignore karta hai. Default 0 hai. <b>Dono ends par same instance ID hona chahiye</b> warna woh chupchaap ek doosre ko ignore karte hain. Address families (RFC 5838) ke saath, IPv6 unicast instance IDs 0 se 31 aur IPv4 unicast 64 se 95 use karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="OSPFv3 on one link">
<rect x="30" y="60" width="150" height="60" rx="8" fill="#bae6fd"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="14">R1 Gi0/0</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="12">FE80::5200:FF:FE01:0</text>
<rect x="460" y="60" width="150" height="60" rx="8" fill="#bae6fd"/><text x="535" y="84" text-anchor="middle" class="svg-ink" font-size="14">R2 Gi0/0</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="12">FE80::5200:FF:FE02:0</text>
<line x1="180" y1="90" x2="460" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="20" width="200" height="50" rx="8" fill="#fde68a"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">Hello FF02::5 par</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">next header 89, hop limit 1</text>
<rect x="200" y="140" width="240" height="80" rx="8" fill="#e2e8f0"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">Match zaroori: area, hello/dead,</text><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="12">instance ID, stub flags, auth</text><text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">Check nahi: global prefix</text>
</svg><p class="cap">OSPFv3 shared link par link-local se link-local baat karta hai; global prefix Hello ka hissa nahi hai.</p></div>

<h3>Packets mein kya badla</h3>
<table class="cmp"><tr><th>Item</th><th>OSPFv2</th><th>OSPFv3</th></tr>
<tr><td>Kis par chalta hai</td><td>IPv4 subnet</td><td>Link (link-local source)</td></tr>
<tr><td>Hello mein mask</td><td>Haan, match zaroori</td><td>Nahi</td></tr>
<tr><td>Neighbour ki pehchaan</td><td>IP address (broadcast/NBMA)</td><td>Hamesha router ID</td></tr>
<tr><td>Authentication</td><td>OSPF header mein</td><td>IPsec ya authentication trailer</td></tr>
<tr><td>Instance ID</td><td>Nahi</td><td>Haan, 8 bits</td></tr>
<tr><td>Router LSA mein prefixes</td><td>Haan</td><td>Nahi, type 8 aur type 9 mein</td></tr>
<tr><td>Multicast</td><td>224.0.0.5 / .6</td><td>FF02::5 / FF02::6</td></tr>
</table>
<p>Kya <b>nahi</b> badla: paanch packet types (Hello, DBD, LSR, LSU, LSAck), Down se Full tak neighbour states, DR/BDR election, areas, cost, SPF aur 110 ka administrative distance.</p>

<h3>Interface padhna</h3>
<pre class="out">R1# show ipv6 ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  <span class="hl">Link Local Address FE80::5200:FF:FE01:0, Interface ID 3</span>
  <span class="hl">Area 0, Process ID 1, Instance ID 0, Router ID 1.1.1.1</span>
  Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State BDR, Priority 1
  Designated Router (ID) 2.2.2.2, local address FE80::5200:FF:FE02:0
  Backup Designated router (ID) 1.1.1.1, local address FE80::5200:FF:FE01:0
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
  Neighbor Count is 1, Adjacent neighbor count is 1
    Adjacent with neighbor 2.2.2.2  (Designated Router)</pre>
<p>Ek command mein paanch facts: link-local source, interface ID, instance ID, network type aur DR. Jab do routers baat karne se mana karein, to dono ends par yeh chalao aur line by line compare karo.</p>

<div class="eg"><p><b>Worked example.</b> R1 Gi0/0 hai <code>2001:DB8:ACAD:F12::1/64</code>. Galti se R2 Gi0/0 <code>2001:DB8:ACAD:F21::2/64</code> configure ho gaya. OSPFv2 mein aisi galti adjacency rok deti. OSPFv3 mein R1 aur R2 phir bhi FULL tak pahunchte hain, kyunki Hellos FE80:: addresses use karte hain. R2 ke through routing phir bhi chalti hai, kyunki next hops link-local hain. Lekin R1 se <code>ping 2001:DB8:ACAD:F12::2</code> fail hota hai, aur dono /64 database mein alag prefixes ki tarah dikhte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Link-local next hop ke saath aur bina interface ke static IPv6 route likhna, jaise <code>ipv6 route ::/0 FE80::1</code>. IOS ise reject karta hai, kyunki akela link-local address ambiguous hai. Isi wajah se OSPFv3 hamesha interface install karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Routers alag IPv6 subnets mein hain, isliye OSPFv3 adjacency nahi bana sakta" galat hai. Mismatched global prefixes OSPFv3 ko nahi rokte. Mismatched <b>instance IDs</b> rokte hain, aur woh koi error message nahi dete, bas neighbour gayab rehta hai.</p></div>

<div class="scn"><h4>Woh neighbour jise ping nahi kar sakte the</h4><p>Ek renumbering job ke baad monitoring system ne alarm diya ki ek core router ke neighbour ka global address jawab nahi de raha. Phir bhi <code>show ipv6 ospf neighbor</code> FULL dikha raha tha aur user traffic chal raha tha. Engineer ne dono ends par <code>show ipv6 interface brief</code> check kiya aur paaya ki ek side purane /64 par thi aur doosri naye par. OSPFv3 ko fark nahi pada, kyunki woh link-local addresses use kar raha tha. Fix tha global address theek karna; routing par kabhi asar nahi pada.</p><p><b>Seekh:</b> OSPFv3 adjacency sirf link-local reachability prove karti hai. Global addressing alag se check karo.</p></div>

<div class="iv"><p class="q">"OSPFv3 apne packets aur next hops ke liye link-local addresses kyun use karta hai?"</p><p>Strong answer: har IPv6 interface ke paas hamesha link-local address hota hai, global prefix na ho tab bhi, isliye OSPFv3 kisi bhi IPv6-enabled link par chal sakta hai aur global renumbering jhel sakta hai. Link-local addresses link se kabhi bahar nahi jaate, jo aise protocol ke liye theek hai jo sirf directly connected neighbours se baat karta hai. Trade-off yeh hai ki next hops ko exit interface chahiye, aur global prefix mismatches ab Hello mein pakde nahi jaate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 per link chalta hai, FE80:: addresses se FF02::5 aur FF02::6 par, protocol 89.</li>
<li>Global prefix mismatches adjacency nahi rokte; instance ID mismatches rokte hain, chupchaap.</li>
<li>OSPFv3 routes link-local next hop plus exit interface use karte hain.</li>
<li>Neighbours hamesha 32-bit router ID se pehchane jaate hain; network LSAs DR ka interface ID use karte hain.</li>
<li>IPv6 AF instance IDs 0 se 31 use karta hai, IPv4 AF 64 se 95.</li>
</ul></div>
`}};export{e as default};