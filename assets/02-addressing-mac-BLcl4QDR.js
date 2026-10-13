var e={id:`mcast-addressing`,h:{en:`Group addresses and the IP-to-MAC mapping`,hi:`Group addresses aur IP-to-MAC mapping`},body:{en:`
<p>A city has house numbers for people and separate numbers for radio frequencies. Nobody lives at 93.5 FM; it is just a channel you tune to. Multicast group addresses work the same way: they do not belong to any machine. They are channel numbers, and any host can tune in.</p>

<h3>The multicast block: 224.0.0.0/4</h3>
<p>IPv4 multicast uses the old <b>class D</b> space, every address whose first four bits are <code>1110</code>: <b>224.0.0.0 to 239.255.255.255</b>, written <b>224.0.0.0/4</b>. Inside that block the IANA has carved out ranges with very different behaviour, and the exam expects you to know them.</p>
<table class="cmp">
<tr><th>Range</th><th>Name</th><th>Behaviour and examples</th></tr>
<tr><td>224.0.0.0/24</td><td>Local Network Control Block</td><td>Link-local, sent with TTL 1, <b>never forwarded</b> by routers. 224.0.0.1 all hosts, 224.0.0.2 all routers, 224.0.0.5/6 OSPF, 224.0.0.9 RIPv2, 224.0.0.10 EIGRP, 224.0.0.13 all PIM routers, 224.0.0.18 VRRP, 224.0.0.22 IGMPv3, 224.0.0.102 HSRPv2</td></tr>
<tr><td>224.0.1.0/24</td><td>Internetwork Control Block</td><td>Control groups that <b>are</b> routed: 224.0.1.1 NTP, 224.0.1.39 Cisco RP-Announce, 224.0.1.40 Cisco RP-Discovery (both used by Auto-RP)</td></tr>
<tr><td>232.0.0.0/8</td><td>Source-Specific Multicast</td><td>Reserved for SSM: receivers join (S,G), no RP is ever used</td></tr>
<tr><td>233.0.0.0/8</td><td>GLOP</td><td>Static groups derived from a 16-bit AS number, for organisations that need globally unique groups</td></tr>
<tr><td>239.0.0.0/8</td><td>Administratively scoped</td><td>The "private range" of multicast, like RFC 1918 for unicast. Use it inside your organisation and block it at the edge</td></tr>
<tr><td>Rest of 224.0.1.0 - 238.255.255.255</td><td>Globally scoped</td><td>Internet-wide groups, assigned by IANA</td></tr>
</table>

<h3>Administrative scoping</h3>
<p>Because 239/8 is private, the same group number can mean different things in two companies. You stop it leaking with a <b>multicast boundary</b>: an ACL applied with <code>ip multicast boundary</code> on the edge interface filters both the data and the control (joins, Auto-RP announcements) for the denied groups. Inside 239/8, <b>239.255.0.0/16</b> is the local scope (one site) and <b>239.192.0.0/14</b> the organisation-local scope. Many enterprises use a plan such as 239.&lt;site&gt;.&lt;app&gt;.&lt;stream&gt;.</p>
<pre class="code"><span class="c">! Keep private groups inside the company at the internet edge</span>
ip access-list standard NO-PRIVATE-MCAST
 deny   239.0.0.0 0.255.255.255
 permit 224.0.0.0 15.255.255.255
interface GigabitEthernet0/3
 ip multicast boundary NO-PRIVATE-MCAST</pre>

<h3>From group address to Ethernet MAC</h3>
<p>An IP packet on Ethernet needs a destination MAC. For unicast, ARP finds it. For multicast there is no single owner to ask, so the MAC is <b>calculated</b> from the group. The IEEE block reserved for IPv4 multicast is <b>01:00:5e:00:00:00 to 01:00:5e:7f:ff:ff</b>. The rule:</p>
<ol>
<li>Take the fixed 25-bit prefix <b>01:00:5e</b> plus a <b>0</b> bit.</li>
<li>Copy the <b>low 23 bits</b> of the group address into the rest of the MAC.</li>
</ol>
<p>A group address has 28 variable bits (32 minus the fixed 1110). Only 23 are copied, so <b>5 bits are lost</b>. 2 to the power 5 = <b>32 different groups map to the same MAC</b>. That is the famous <b>32:1 overlap</b>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="IP to MAC mapping">
<text x="20" y="30" class="svg-ink" font-size="13">Group 239.10.10.10</text>
<rect x="20" y="42" width="60" height="30" fill="#e2e8f0"/><text x="50" y="62" text-anchor="middle" class="svg-muted" font-size="12">1110</text>
<rect x="80" y="42" width="100" height="30" fill="#fed7aa"/><text x="130" y="62" text-anchor="middle" class="svg-ink" font-size="12">5 bits lost</text>
<rect x="180" y="42" width="420" height="30" fill="#bbf7d0"/><text x="390" y="62" text-anchor="middle" class="svg-ink" font-size="12">low 23 bits = 0a:0a:0a</text>
<line x1="390" y1="72" x2="390" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="20" y="120" class="svg-ink" font-size="13">MAC</text>
<rect x="20" y="130" width="200" height="30" fill="#bae6fd"/><text x="120" y="150" text-anchor="middle" class="svg-ink" font-size="12">01:00:5e (fixed)</text>
<rect x="220" y="130" width="40" height="30" fill="#ddd6fe"/><text x="240" y="150" text-anchor="middle" class="svg-ink" font-size="12">0</text>
<rect x="260" y="130" width="340" height="30" fill="#bbf7d0"/><text x="430" y="150" text-anchor="middle" class="svg-ink" font-size="12">0a:0a:0a</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="13">Result: 01:00:5e:0a:0a:0a (shared by 32 groups)</text>
</svg><p class="cap">The top 4 bits are always 1110 and the next 5 bits are thrown away; only the low 23 bits reach the MAC.</p></div>

<div class="eg"><p><b>Worked example 1.</b> Group 239.10.10.10. The last three octets are 10.10.10 = 0x0a.0x0a.0x0a. The second octet (10) is below 128, so its top bit is already 0. MAC = <b>01:00:5e:0a:0a:0a</b>.</p>
<p><b>Worked example 2.</b> Group 239.200.1.5. The second octet 200 is 11001000 in binary. Its top bit is one of the lost bits, so drop it: 01001000 = 72 = 0x48. MAC = <b>01:00:5e:48:01:05</b>. Shortcut: if the second octet is 128 or more, subtract 128, then convert to hex.</p>
<p><b>Worked example 3: the overlap.</b> 224.10.10.10, 225.10.10.10, 239.138.10.10 and 232.10.10.10 all become 01:00:5e:0a:0a:0a. The first octet never matters, and 138 minus 128 = 10.</p></div>

<h3>Why the overlap matters</h3>
<p>A host NIC programmed to accept 01:00:5e:0a:0a:0a receives every group that maps there, and the IP stack must discard the unwanted ones in software. Worse, a switch that forwards by MAC cannot tell the groups apart. The classic trap is a group that maps onto the MACs of the link-local block <b>01:00:5e:00:00:xx</b>: for example 239.0.0.5 or 225.128.0.10. Switches always flood those MACs (they carry OSPF, PIM and friends), so such a group is flooded to every port even with IGMP snooping. <b>Avoid x.0.0.x and x.128.0.x groups</b> when you design an address plan.</p>

<div class="note"><p><b>IPv6 in one line.</b> IPv6 multicast (ff00::/8) maps to MAC <b>33:33</b> plus the low 32 bits of the group, and hosts use <b>MLD</b> instead of IGMP: MLDv1 behaves like IGMPv2 and MLDv2 like IGMPv3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Picking "nice" group numbers such as 239.0.0.1 for an application. It maps to 01:00:5e:00:00:01, the same MAC as 224.0.0.1 (all hosts), so every switch floods it to every port and every host NIC accepts it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect a question that asks which MAC a group uses, or which two groups share a MAC. Remember: 01:00:5e, then a 0 bit, then the low 23 bits. The first octet and the top bit of the second octet never appear in the MAC. Also: 224.0.0.0/24 is never forwarded, but 224.0.1.39 and 224.0.1.40 are.</p></div>

<div class="scn"><h4>The IPTV channel that flooded every port</h4><p>A hotel used group 239.128.0.20 for one TV channel. Every access switch had IGMP snooping enabled, yet that one channel appeared on every port, and guest laptops on the same VLAN saw 8 Mbps of unwanted traffic. The engineer calculated the MAC: 128 minus 128 = 0, so the group mapped to 01:00:5e:00:00:14, inside the link-local MAC range that switches always flood. Renumbering the channel to 239.1.0.20 fixed it instantly.</p><p><b>Lesson:</b> check the MAC of every group in your plan; groups that land on 01:00:5e:00:00:xx are flooded regardless of snooping.</p></div>

<div class="iv"><p class="q">"How is a multicast IP address mapped to a MAC address, and what problem does that cause?"</p><p>Strong answer: the MAC is 01:00:5e, a zero bit, then the low 23 bits of the group. Class D has 28 variable bits, so 5 are lost and 32 groups share each MAC. The result is that NICs and MAC-based switches cannot distinguish overlapping groups, so hosts filter in software and some groups get flooded. Mention that you avoid groups that map to 01:00:5e:00:00:xx.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 multicast = 224.0.0.0/4 (224.0.0.0 to 239.255.255.255).</li>
<li>224.0.0.0/24 is link-local (TTL 1, never routed); 224.0.1.39/40 are routed Auto-RP groups; 232/8 is SSM; 239/8 is private (admin-scoped).</li>
<li>MAC = 01:00:5e + 0 + low 23 bits of the group; 5 bits lost, 32 groups per MAC.</li>
<li>Groups that map to 01:00:5e:00:00:xx are flooded by switches; avoid x.0.0.x and x.128.0.x.</li>
<li>Use <code>ip multicast boundary</code> to keep 239/8 inside your network.</li>
</ul></div>
`,hi:`
<p>Ek shehar mein logon ke liye house numbers hote hain aur radio frequencies ke liye alag numbers. 93.5 FM par koi nahi rehta; woh bas ek channel hai jise aap tune karte ho. Multicast group addresses bhi aise hi kaam karte hain: yeh kisi machine ke nahi hote. Yeh channel numbers hain, aur koi bhi host tune in kar sakta hai.</p>

<h3>Multicast block: 224.0.0.0/4</h3>
<p>IPv4 multicast purana <b>class D</b> space use karta hai, har woh address jiske pehle chaar bits <code>1110</code> hain: <b>224.0.0.0 se 239.255.255.255</b>, likha jaata hai <b>224.0.0.0/4</b>. Is block ke andar IANA ne bilkul alag behaviour wali ranges banayi hain, aur exam expect karta hai ki aap inhe jaano.</p>
<table class="cmp">
<tr><th>Range</th><th>Naam</th><th>Behaviour aur examples</th></tr>
<tr><td>224.0.0.0/24</td><td>Local Network Control Block</td><td>Link-local, TTL 1 ke saath bheje jaate hain, routers <b>kabhi forward nahi karte</b>. 224.0.0.1 all hosts, 224.0.0.2 all routers, 224.0.0.5/6 OSPF, 224.0.0.9 RIPv2, 224.0.0.10 EIGRP, 224.0.0.13 all PIM routers, 224.0.0.18 VRRP, 224.0.0.22 IGMPv3, 224.0.0.102 HSRPv2</td></tr>
<tr><td>224.0.1.0/24</td><td>Internetwork Control Block</td><td>Control groups jo route <b>hote hain</b>: 224.0.1.1 NTP, 224.0.1.39 Cisco RP-Announce, 224.0.1.40 Cisco RP-Discovery (dono Auto-RP use karta hai)</td></tr>
<tr><td>232.0.0.0/8</td><td>Source-Specific Multicast</td><td>SSM ke liye reserved: receivers (S,G) join karte hain, RP kabhi use nahi hota</td></tr>
<tr><td>233.0.0.0/8</td><td>GLOP</td><td>16-bit AS number se bane static groups, un organisations ke liye jinhe globally unique groups chahiye</td></tr>
<tr><td>239.0.0.0/8</td><td>Administratively scoped</td><td>Multicast ki "private range", unicast ke RFC 1918 jaisi. Apni organisation ke andar use karo aur edge par block karo</td></tr>
<tr><td>Baaki 224.0.1.0 - 238.255.255.255</td><td>Globally scoped</td><td>Internet-wide groups, IANA assign karta hai</td></tr>
</table>

<h3>Administrative scoping</h3>
<p>Kyunki 239/8 private hai, same group number do companies mein alag cheez ka matlab ho sakta hai. Ise leak hone se aap <b>multicast boundary</b> se rokte ho: edge interface par <code>ip multicast boundary</code> ke saath lagaya ACL denied groups ka data aur control (joins, Auto-RP announcements) dono filter karta hai. 239/8 ke andar <b>239.255.0.0/16</b> local scope (ek site) hai aur <b>239.192.0.0/14</b> organisation-local scope. Kai enterprises 239.&lt;site&gt;.&lt;app&gt;.&lt;stream&gt; jaisa plan use karte hain.</p>
<pre class="code"><span class="c">! Internet edge par private groups ko company ke andar rakho</span>
ip access-list standard NO-PRIVATE-MCAST
 deny   239.0.0.0 0.255.255.255
 permit 224.0.0.0 15.255.255.255
interface GigabitEthernet0/3
 ip multicast boundary NO-PRIVATE-MCAST</pre>

<h3>Group address se Ethernet MAC tak</h3>
<p>Ethernet par IP packet ko destination MAC chahiye. Unicast ke liye ARP use dhoondhta hai. Multicast mein poochne ke liye koi ek owner nahi hota, isliye MAC group se <b>calculate</b> kiya jaata hai. IPv4 multicast ke liye reserved IEEE block <b>01:00:5e:00:00:00 se 01:00:5e:7f:ff:ff</b> hai. Rule:</p>
<ol>
<li>Fixed 25-bit prefix lo: <b>01:00:5e</b> plus ek <b>0</b> bit.</li>
<li>Group address ke <b>neeche wale 23 bits</b> MAC ke baaki hisse mein copy karo.</li>
</ol>
<p>Group address mein 28 variable bits hote hain (32 minus fixed 1110). Sirf 23 copy hote hain, isliye <b>5 bits kho jaate hain</b>. 2 ki power 5 = <b>32 alag groups same MAC par map hote hain</b>. Yahi mashhoor <b>32:1 overlap</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="IP to MAC mapping">
<text x="20" y="30" class="svg-ink" font-size="13">Group 239.10.10.10</text>
<rect x="20" y="42" width="60" height="30" fill="#e2e8f0"/><text x="50" y="62" text-anchor="middle" class="svg-muted" font-size="12">1110</text>
<rect x="80" y="42" width="100" height="30" fill="#fed7aa"/><text x="130" y="62" text-anchor="middle" class="svg-ink" font-size="12">5 bits kho gaye</text>
<rect x="180" y="42" width="420" height="30" fill="#bbf7d0"/><text x="390" y="62" text-anchor="middle" class="svg-ink" font-size="12">neeche ke 23 bits = 0a:0a:0a</text>
<line x1="390" y1="72" x2="390" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="20" y="120" class="svg-ink" font-size="13">MAC</text>
<rect x="20" y="130" width="200" height="30" fill="#bae6fd"/><text x="120" y="150" text-anchor="middle" class="svg-ink" font-size="12">01:00:5e (fixed)</text>
<rect x="220" y="130" width="40" height="30" fill="#ddd6fe"/><text x="240" y="150" text-anchor="middle" class="svg-ink" font-size="12">0</text>
<rect x="260" y="130" width="340" height="30" fill="#bbf7d0"/><text x="430" y="150" text-anchor="middle" class="svg-ink" font-size="12">0a:0a:0a</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="13">Result: 01:00:5e:0a:0a:0a (32 groups share karte hain)</text>
</svg><p class="cap">Upar ke 4 bits hamesha 1110 hote hain aur agle 5 bits phenk diye jaate hain; sirf neeche ke 23 bits MAC tak pahunchte hain.</p></div>

<div class="eg"><p><b>Worked example 1.</b> Group 239.10.10.10. Aakhri teen octets 10.10.10 = 0x0a.0x0a.0x0a hain. Doosra octet (10) 128 se chhota hai, isliye uska top bit pehle se 0 hai. MAC = <b>01:00:5e:0a:0a:0a</b>.</p>
<p><b>Worked example 2.</b> Group 239.200.1.5. Doosra octet 200 binary mein 11001000 hai. Uska top bit un khoye hue bits mein se ek hai, isliye use hata do: 01001000 = 72 = 0x48. MAC = <b>01:00:5e:48:01:05</b>. Shortcut: agar doosra octet 128 ya zyada hai, 128 ghatao, phir hex mein badlo.</p>
<p><b>Worked example 3: overlap.</b> 224.10.10.10, 225.10.10.10, 239.138.10.10 aur 232.10.10.10 sab 01:00:5e:0a:0a:0a bante hain. Pehla octet kabhi matter nahi karta, aur 138 minus 128 = 10.</p></div>

<h3>Overlap kyun matter karta hai</h3>
<p>Jo host NIC 01:00:5e:0a:0a:0a accept karne ke liye programmed hai, woh wahan map hone wala har group receive karta hai, aur IP stack ko unwanted groups software mein discard karne padte hain. Isse bhi bura, jo switch MAC se forward karta hai woh groups mein fark nahi kar sakta. Classic trap woh group hai jo link-local block ke MACs <b>01:00:5e:00:00:xx</b> par map hota hai: jaise 239.0.0.5 ya 225.128.0.10. Switches in MACs ko hamesha flood karte hain (inme OSPF, PIM wagairah jaate hain), isliye aisa group IGMP snooping ke saath bhi har port par flood hota hai. Address plan design karte waqt <b>x.0.0.x aur x.128.0.x groups se bacho</b>.</p>

<div class="note"><p><b>IPv6 ek line mein.</b> IPv6 multicast (ff00::/8) MAC <b>33:33</b> plus group ke neeche ke 32 bits par map hota hai, aur hosts IGMP ki jagah <b>MLD</b> use karte hain: MLDv1 IGMPv2 jaisa aur MLDv2 IGMPv3 jaisa behave karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Application ke liye 239.0.0.1 jaise "sundar" group numbers chunna. Yeh 01:00:5e:00:00:01 par map hota hai, wahi MAC jo 224.0.0.1 (all hosts) ka hai, isliye har switch ise har port par flood karta hai aur har host NIC ise accept karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aisa question expect karo jo pooche group kaunsa MAC use karta hai, ya kaunse do groups ek MAC share karte hain. Yaad rakho: 01:00:5e, phir ek 0 bit, phir neeche ke 23 bits. Pehla octet aur doosre octet ka top bit kabhi MAC mein nahi aata. Aur: 224.0.0.0/24 kabhi forward nahi hota, par 224.0.1.39 aur 224.0.1.40 hote hain.</p></div>

<div class="scn"><h4>IPTV channel jo har port par flood hua</h4><p>Ek hotel ne ek TV channel ke liye group 239.128.0.20 use kiya. Har access switch par IGMP snooping enabled thi, phir bhi woh ek channel har port par dikh raha tha, aur same VLAN ke guest laptops ko 8 Mbps unwanted traffic mil raha tha. Engineer ne MAC calculate kiya: 128 minus 128 = 0, isliye group 01:00:5e:00:00:14 par map hua, link-local MAC range ke andar jise switches hamesha flood karte hain. Channel ko 239.1.0.20 par renumber karte hi problem khatam.</p><p><b>Seekh:</b> apne plan ke har group ka MAC check karo; jo groups 01:00:5e:00:00:xx par girte hain woh snooping ke bawajood flood hote hain.</p></div>

<div class="iv"><p class="q">"Multicast IP address MAC address par kaise map hota hai, aur isse kya problem hoti hai?"</p><p>Strong answer: MAC hai 01:00:5e, ek zero bit, phir group ke neeche ke 23 bits. Class D mein 28 variable bits hain, isliye 5 kho jaate hain aur har MAC 32 groups share karte hain. Nateeja yeh ki NICs aur MAC-based switches overlapping groups mein fark nahi kar paate, isliye hosts software mein filter karte hain aur kuch groups flood hote hain. Batao ki aap 01:00:5e:00:00:xx par map hone wale groups se bachte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 multicast = 224.0.0.0/4 (224.0.0.0 se 239.255.255.255).</li>
<li>224.0.0.0/24 link-local hai (TTL 1, kabhi route nahi); 224.0.1.39/40 routed Auto-RP groups hain; 232/8 SSM hai; 239/8 private (admin-scoped) hai.</li>
<li>MAC = 01:00:5e + 0 + group ke neeche ke 23 bits; 5 bits kho jaate hain, har MAC par 32 groups.</li>
<li>Jo groups 01:00:5e:00:00:xx par map hote hain unhe switches flood karte hain; x.0.0.x aur x.128.0.x se bacho.</li>
<li>239/8 ko apne network ke andar rakhne ke liye <code>ip multicast boundary</code> use karo.</li>
</ul></div>
`}};export{e as default};