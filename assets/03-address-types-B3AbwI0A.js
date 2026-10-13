var e={id:`address-types`,h:{en:`Address types: GUA, ULA, link-local, multicast, anycast`,hi:`Address types: GUA, ULA, link-local, multicast, anycast`},body:{en:`
<p>Think of a person with several phone numbers: a public mobile number anyone in the world can call, an office extension that only works inside the building, and an intercom button that only reaches the next room. An IPv6 interface is the same. It normally has <b>several addresses at once</b>, each with a different <b>scope</b> (how far it is valid). Recognising the type from the first few hex digits is one of the most tested skills in this topic.</p>

<h3>The three kinds of delivery</h3>
<ul>
<li><b>Unicast</b>: one sender to one interface.</li>
<li><b>Multicast</b>: one sender to every member of a group.</li>
<li><b>Anycast</b>: one sender to the <b>nearest</b> of several interfaces that share the same address.</li>
</ul>
<p>There is <b>no broadcast</b> in IPv6. Every job that needed a broadcast in IPv4 (ARP, DHCP discover) uses a specific multicast group instead, so only interested devices are interrupted.</p>

<h3>Unicast address types</h3>
<table class="cmp"><tr><th>Type</th><th>Prefix</th><th>Starts with</th><th>Scope and use</th></tr>
<tr><td><b>Global unicast (GUA)</b></td><td>2000::/3</td><td>2 or 3</td><td>Public, routable on the Internet, like public IPv4. <code>2001:db8::/32</code> is reserved for documentation and labs.</td></tr>
<tr><td><b>Unique local (ULA)</b></td><td>fc00::/7 (used as fd00::/8)</td><td>fd</td><td>Private, routed inside an organisation, never on the Internet. Similar in purpose to 10.0.0.0/8.</td></tr>
<tr><td><b>Link-local (LLA)</b></td><td>fe80::/10</td><td>fe80</td><td>Valid only on one link; routers never forward it. Every IPv6 interface has one, created automatically.</td></tr>
<tr><td><b>Loopback</b></td><td>::1/128</td><td>::1</td><td>The device itself, like 127.0.0.1.</td></tr>
<tr><td><b>Unspecified</b></td><td>::/128</td><td>::</td><td>"No address yet"; used as a source during address setup. <code>::/0</code> is the default route.</td></tr>
</table>
<p>A <b>ULA</b> is built as <code>fd</code> + a 40-bit random Global ID + a 16-bit subnet ID, for example <code>fd3c:91a2:7e10:10::/64</code>. The random part makes it very unlikely that two merged companies clash, which was a constant pain with 10.x in IPv4. Older material mentions <b>site-local</b> <code>fec0::/10</code>; it is deprecated and replaced by ULA.</p>

<h3>Link-local: the address that is always there</h3>
<p>As soon as IPv6 is enabled on an interface, it creates a <code>fe80::</code> address by itself, with no DHCP and no configuration. Neighbor Discovery, router advertisements and routing protocols all run over link-local addresses, and a host's <b>default gateway is the router's link-local address</b>. Because <code>fe80::1</code> could exist on every link of a router, any command that uses a link-local address must also say which interface it means.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="One interface, several addresses">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#e2e8f0"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="14">PC1 eth0</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">one interface</text>
<line x1="160" y1="105" x2="220" y2="30" stroke="#64748b"/><line x1="160" y1="105" x2="220" y2="80" stroke="#64748b"/><line x1="160" y1="105" x2="220" y2="130" stroke="#64748b"/><line x1="160" y1="105" x2="220" y2="180" stroke="#64748b"/>
<rect x="220" y="12" width="400" height="36" rx="6" fill="#bbf7d0"/><text x="230" y="35" class="svg-ink" font-size="13">GUA 2001:db8:acad:10::10 (Internet scope)</text>
<rect x="220" y="62" width="400" height="36" rx="6" fill="#bae6fd"/><text x="230" y="85" class="svg-ink" font-size="13">ULA fd3c:91a2:7e10:10::10 (organisation)</text>
<rect x="220" y="112" width="400" height="36" rx="6" fill="#fde68a"/><text x="230" y="135" class="svg-ink" font-size="13">LLA fe80::250:7fff:fe06:6d01 (this link only)</text>
<rect x="220" y="162" width="400" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="185" class="svg-ink" font-size="13">Joined groups ff02::1, ff02::1:ff06:6d01</text>
</svg><p class="cap">An IPv6 interface normally holds several addresses and joins several multicast groups at the same time.</p></div>

<h3>Multicast addresses you must recognise</h3>
<p>Multicast addresses start with <code>ff</code> (<code>ff00::/8</code>). The fourth hex digit is the scope: <code>ff02::</code> is link-local scope (never routed), <code>ff05::</code> site scope.</p>
<table class="cmp"><tr><th>Address</th><th>Group</th></tr>
<tr><td>ff02::1</td><td>All nodes on the link (the closest thing to a broadcast)</td></tr>
<tr><td>ff02::2</td><td>All routers on the link</td></tr>
<tr><td>ff02::5 / ff02::6</td><td>OSPFv3 routers / designated routers</td></tr>
<tr><td>ff02::1:2</td><td>All DHCPv6 servers and relay agents</td></tr>
<tr><td>ff02::1:ffXX:XXXX</td><td><b>Solicited-node</b>: ff02::1:ff + the last 24 bits of a unicast address</td></tr>
</table>
<p>Every unicast address automatically joins its <b>solicited-node</b> group. Neighbor Discovery sends "who has this address?" to that group instead of broadcasting to everyone (chapter 5).</p>

<div class="eg"><p><b>Worked example.</b> PC1 has <code>2001:db8:acad:10:250:7fff:fe06:6d01</code>. The last 24 bits are <code>06:6d01</code>, so its solicited-node group is <code>ff02::1:ff06:6d01</code>. Router R1 with <code>2001:db8:acad:10::1</code> joins <code>ff02::1:ff00:1</code>. You can see exactly these groups on a router:</p></div>
<pre class="out">R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is <span class="hl">FE80::5054:CFF:FE04:4B01</span>
  Global unicast address(es):
    2001:DB8:ACAD:10::1, subnet is 2001:DB8:ACAD:10::/64
  Joined group address(es):
    FF02::1
    <span class="hl">FF02::2</span>
    FF02::1:FF04:4B01
    FF02::1:FF00:1</pre>
<p>R1 joined <code>FF02::2</code> because IPv6 routing is enabled: it is acting as a router. Two solicited-node groups appear, one for the link-local and one for the global address.</p>

<h3>Anycast</h3>
<p>An <b>anycast</b> address is an ordinary unicast address configured on <b>several</b> devices in different places. Routing delivers each packet to the nearest one. Public DNS resolvers and content networks use this to send each user to the closest server. There is no special anycast prefix; you cannot tell anycast from unicast by looking at the address.</p>

<h3>Special ranges used in coexistence</h3>
<ul>
<li><code>::ffff:0:0/96</code>, <b>IPv4-mapped</b>, used inside hosts to represent an IPv4 address, for example <code>::ffff:192.0.2.10</code>.</li>
<li><code>64:ff9b::/96</code>, the well-known <b>NAT64</b> prefix (chapter 9).</li>
<li><code>2002::/16</code>, the old 6to4 tunnelling prefix, now deprecated.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Trying to ping a <code>fe80::</code> address on another subnet: link-local never crosses a router. Using ULA and expecting it to reach the Internet without translation. Filtering all of <code>ff00::/8</code> on a host firewall and breaking Neighbor Discovery.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Which address type is equivalent to an IPv4 private address?" is <b>unique local</b>, not link-local. "Which address is automatically configured on every IPv6 interface?" is <b>link-local</b>. "Which IPv6 address type does not exist?" is <b>broadcast</b>. Know <code>::1</code> is loopback and <code>::</code> is unspecified.</p></div>

<div class="scn"><h4>The printer that only worked on one floor</h4><p>A company set its printers to fixed link-local addresses, <code>fe80::50</code> and so on, because they were short and easy to type. It worked perfectly on the floor where the helpdesk tested it. Users on other floors, in other VLANs, could not print at all. The engineer explained that link-local addresses are valid on one link only and routers never forward them. The printers were given ULA addresses from <code>fd3c:91a2:7e10:30::/64</code> with DNS names, and printing worked from every floor.</p><p><b>Lesson:</b> link-local is for the local link and for routers talking to neighbours; anything reached across a router needs a GUA or ULA.</p></div>

<div class="iv"><p class="q">"What addresses does a typical IPv6 host have, and why more than one?"</p><p>Strong answer: at least a link-local fe80:: address, created automatically and used for Neighbor Discovery and as the next hop; usually one or more global unicast addresses (a stable one and temporary privacy ones), and sometimes a ULA for internal services. It also joins ff02::1 and a solicited-node group for each unicast address. Mention there is no broadcast, and that the default gateway is the router's link-local address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GUA 2000::/3 is public; 2001:db8::/32 is for documentation.</li>
<li>ULA fc00::/7 (fd00::/8 in practice) is private; link-local fe80::/10 never leaves the link.</li>
<li>Multicast starts with ff; learn ff02::1, ff02::2 and the solicited-node ff02::1:ffXX:XXXX.</li>
<li>Anycast is a unicast address shared by several devices; routing picks the nearest.</li>
<li>No broadcast in IPv6; ::1 is loopback, :: is unspecified, ::/0 is the default route.</li>
</ul></div>
`,hi:`
<p>Ek aise insaan ke baare mein socho jiske kai phone numbers hain: ek public mobile number jise duniya mein koi bhi call kar sakta hai, ek office extension jo sirf building ke andar chalta hai, aur ek intercom button jo sirf agle kamre tak pahunchta hai. IPv6 interface bhi aisa hi hai. Uske paas aam taur par <b>ek saath kai addresses</b> hote hain, har ek ka alag <b>scope</b> (woh kitni door tak valid hai). Pehle kuch hex digits se type pehchanna is topic ki sabse zyada test hone wali skill hai.</p>

<h3>Delivery ke teen tareeke</h3>
<ul>
<li><b>Unicast</b>: ek sender se ek interface ko.</li>
<li><b>Multicast</b>: ek sender se group ke har member ko.</li>
<li><b>Anycast</b>: ek sender se un kai interfaces mein se <b>sabse paas wale</b> ko jo same address share karte hain.</li>
</ul>
<p>IPv6 mein <b>broadcast nahi hai</b>. IPv4 mein jis kaam ke liye broadcast lagta tha (ARP, DHCP discover), uske liye ab ek specific multicast group use hota hai, taaki sirf interested devices disturb hon.</p>

<h3>Unicast address types</h3>
<table class="cmp"><tr><th>Type</th><th>Prefix</th><th>Shuru hota hai</th><th>Scope aur use</th></tr>
<tr><td><b>Global unicast (GUA)</b></td><td>2000::/3</td><td>2 ya 3</td><td>Public, Internet par routable, public IPv4 jaisa. <code>2001:db8::/32</code> documentation aur labs ke liye reserved hai.</td></tr>
<tr><td><b>Unique local (ULA)</b></td><td>fc00::/7 (use hota hai fd00::/8)</td><td>fd</td><td>Private, organisation ke andar route hota hai, Internet par kabhi nahi. Maksad mein 10.0.0.0/8 jaisa.</td></tr>
<tr><td><b>Link-local (LLA)</b></td><td>fe80::/10</td><td>fe80</td><td>Sirf ek link par valid; routers ise kabhi forward nahi karte. Har IPv6 interface par ek hota hai, apne aap banta hai.</td></tr>
<tr><td><b>Loopback</b></td><td>::1/128</td><td>::1</td><td>Device khud, 127.0.0.1 jaisa.</td></tr>
<tr><td><b>Unspecified</b></td><td>::/128</td><td>::</td><td>"Abhi koi address nahi"; address setup ke dauraan source ke roop mein use hota hai. <code>::/0</code> default route hai.</td></tr>
</table>
<p><b>ULA</b> aise banta hai: <code>fd</code> + 40-bit random Global ID + 16-bit subnet ID, jaise <code>fd3c:91a2:7e10:10::/64</code>. Random hisse ki wajah se do merge hone wali companies ke addresses takraane ki sambhavna bahut kam hoti hai, jo IPv4 mein 10.x ke saath hamesha ka dard tha. Purane material mein <b>site-local</b> <code>fec0::/10</code> ka zikr hai; woh deprecated hai aur uski jagah ULA aa gaya.</p>

<h3>Link-local: woh address jo hamesha hota hai</h3>
<p>Interface par IPv6 enable hote hi woh khud se ek <code>fe80::</code> address bana leta hai, bina DHCP aur bina configuration ke. Neighbor Discovery, router advertisements aur routing protocols sab link-local addresses par chalte hain, aur host ka <b>default gateway router ka link-local address hota hai</b>. Kyunki <code>fe80::1</code> router ke har link par ho sakta hai, link-local address use karne wali har command ko yeh bhi batana padta hai ki kaunsa interface matlab hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ek interface, kai addresses">
<rect x="20" y="70" width="140" height="70" rx="10" fill="#e2e8f0"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="14">PC1 eth0</text><text x="90" y="120" text-anchor="middle" class="svg-muted" font-size="12">ek interface</text>
<line x1="160" y1="105" x2="220" y2="30" stroke="#64748b"/><line x1="160" y1="105" x2="220" y2="80" stroke="#64748b"/><line x1="160" y1="105" x2="220" y2="130" stroke="#64748b"/><line x1="160" y1="105" x2="220" y2="180" stroke="#64748b"/>
<rect x="220" y="12" width="400" height="36" rx="6" fill="#bbf7d0"/><text x="230" y="35" class="svg-ink" font-size="13">GUA 2001:db8:acad:10::10 (Internet scope)</text>
<rect x="220" y="62" width="400" height="36" rx="6" fill="#bae6fd"/><text x="230" y="85" class="svg-ink" font-size="13">ULA fd3c:91a2:7e10:10::10 (organisation)</text>
<rect x="220" y="112" width="400" height="36" rx="6" fill="#fde68a"/><text x="230" y="135" class="svg-ink" font-size="13">LLA fe80::250:7fff:fe06:6d01 (sirf yeh link)</text>
<rect x="220" y="162" width="400" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="185" class="svg-ink" font-size="13">Joined groups ff02::1, ff02::1:ff06:6d01</text>
</svg><p class="cap">IPv6 interface aam taur par ek saath kai addresses rakhta hai aur kai multicast groups join karta hai.</p></div>

<h3>Multicast addresses jo pehchanne hain</h3>
<p>Multicast addresses <code>ff</code> se shuru hote hain (<code>ff00::/8</code>). Chautha hex digit scope hai: <code>ff02::</code> link-local scope hai (kabhi route nahi hota), <code>ff05::</code> site scope.</p>
<table class="cmp"><tr><th>Address</th><th>Group</th></tr>
<tr><td>ff02::1</td><td>Link ke saare nodes (broadcast ke sabse kareeb)</td></tr>
<tr><td>ff02::2</td><td>Link ke saare routers</td></tr>
<tr><td>ff02::5 / ff02::6</td><td>OSPFv3 routers / designated routers</td></tr>
<tr><td>ff02::1:2</td><td>Saare DHCPv6 servers aur relay agents</td></tr>
<tr><td>ff02::1:ffXX:XXXX</td><td><b>Solicited-node</b>: ff02::1:ff + unicast address ke aakhri 24 bits</td></tr>
</table>
<p>Har unicast address apne aap apna <b>solicited-node</b> group join karta hai. Neighbor Discovery "yeh address kiska hai?" sabko broadcast karne ki jagah usi group ko bhejta hai (chapter 5).</p>

<div class="eg"><p><b>Worked example.</b> PC1 ka address <code>2001:db8:acad:10:250:7fff:fe06:6d01</code> hai. Aakhri 24 bits <code>06:6d01</code> hain, to uska solicited-node group <code>ff02::1:ff06:6d01</code> hai. Router R1 jiska address <code>2001:db8:acad:10::1</code> hai, <code>ff02::1:ff00:1</code> join karta hai. Router par bilkul yahi groups dikhte hain:</p></div>
<pre class="out">R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is <span class="hl">FE80::5054:CFF:FE04:4B01</span>
  Global unicast address(es):
    2001:DB8:ACAD:10::1, subnet is 2001:DB8:ACAD:10::/64
  Joined group address(es):
    FF02::1
    <span class="hl">FF02::2</span>
    FF02::1:FF04:4B01
    FF02::1:FF00:1</pre>
<p>R1 ne <code>FF02::2</code> join kiya kyunki IPv6 routing enabled hai: woh router ki tarah kaam kar raha hai. Do solicited-node groups dikhte hain, ek link-local ke liye aur ek global address ke liye.</p>

<h3>Anycast</h3>
<p><b>Anycast</b> address ek normal unicast address hai jo alag jagahon par <b>kai</b> devices par configure hota hai. Routing har packet ko sabse paas wale tak pahunchati hai. Public DNS resolvers aur content networks isse har user ko sabse kareeb server par bhejte hain. Anycast ka koi special prefix nahi hai; address dekh kar aap anycast aur unicast mein farak nahi bata sakte.</p>

<h3>Coexistence mein use hone wali special ranges</h3>
<ul>
<li><code>::ffff:0:0/96</code>, <b>IPv4-mapped</b>, hosts ke andar IPv4 address dikhane ke liye, jaise <code>::ffff:192.0.2.10</code>.</li>
<li><code>64:ff9b::/96</code>, well-known <b>NAT64</b> prefix (chapter 9).</li>
<li><code>2002::/16</code>, purana 6to4 tunnelling prefix, ab deprecated.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Doosre subnet par <code>fe80::</code> address ping karne ki koshish: link-local kabhi router cross nahi karta. ULA use karke bina translation ke Internet tak pahunchne ki ummeed. Host firewall par poora <code>ff00::/8</code> filter kar dena aur Neighbor Discovery tod dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Kaunsa address type IPv4 private address ke barabar hai?" jawab <b>unique local</b> hai, link-local nahi. "Kaunsa address har IPv6 interface par apne aap configure hota hai?" jawab <b>link-local</b>. "Kaunsa IPv6 address type exist nahi karta?" jawab <b>broadcast</b>. Yaad rakho <code>::1</code> loopback hai aur <code>::</code> unspecified.</p></div>

<div class="scn"><h4>Woh printer jo sirf ek floor par chalta tha</h4><p>Ek company ne apne printers ko fixed link-local addresses de diye, <code>fe80::50</code> waghera, kyunki woh chhote aur type karne mein aasaan the. Jis floor par helpdesk ne test kiya wahan sab perfect chala. Doosre floors ke users, doosre VLANs mein, bilkul print nahi kar pa rahe the. Engineer ne samjhaya ki link-local addresses sirf ek link par valid hote hain aur routers unhe kabhi forward nahi karte. Printers ko DNS names ke saath <code>fd3c:91a2:7e10:30::/64</code> se ULA addresses diye gaye, aur har floor se printing chalne lagi.</p><p><b>Seekh:</b> link-local local link ke liye aur neighbours se baat karte routers ke liye hai; router ke paar jo bhi pahunchna ho use GUA ya ULA chahiye.</p></div>

<div class="iv"><p class="q">"Typical IPv6 host ke paas kaunse addresses hote hain, aur ek se zyada kyun?"</p><p>Strong answer: kam se kam ek link-local fe80:: address, jo apne aap banta hai aur Neighbor Discovery aur next hop ke liye use hota hai; aam taur par ek ya zyada global unicast addresses (ek stable aur temporary privacy wale), aur kabhi kabhi internal services ke liye ULA. Woh ff02::1 aur har unicast address ke liye ek solicited-node group bhi join karta hai. Batao ki broadcast nahi hota, aur default gateway router ka link-local address hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GUA 2000::/3 public hai; 2001:db8::/32 documentation ke liye hai.</li>
<li>ULA fc00::/7 (practically fd00::/8) private hai; link-local fe80::/10 link se bahar nahi jata.</li>
<li>Multicast ff se shuru hota hai; ff02::1, ff02::2 aur solicited-node ff02::1:ffXX:XXXX yaad karo.</li>
<li>Anycast ek unicast address hai jo kai devices share karte hain; routing sabse paas wala chunti hai.</li>
<li>IPv6 mein broadcast nahi; ::1 loopback, :: unspecified, ::/0 default route.</li>
</ul></div>
`}};export{e as default};