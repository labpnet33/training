var e={id:`prefixes`,h:{en:`Prefix lengths, the /64 rule and subnetting`,hi:`Prefix lengths, /64 rule aur subnetting`},body:{en:`
<p>A postal address in India has a PIN code, then a street, then a house number. The PIN code is decided by the postal department, the street by the town planners, and the house number by the owner. An IPv6 global address is built the same way: the <b>global routing prefix</b> comes from your ISP, the <b>subnet ID</b> is your choice, and the <b>interface ID</b> identifies one device on the link.</p>

<h3>Prefix length replaces the subnet mask</h3>
<p>IPv6 has no dotted-decimal masks. It uses only the <b>prefix length</b>, written after a slash, exactly like CIDR in IPv4. <code>2001:db8:acad:12::1/64</code> means the first 64 bits are the network (the <b>prefix</b>) and the remaining 64 bits identify the interface. The prefix itself is written with the host bits set to zero: <code>2001:db8:acad:12::/64</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Global unicast address structure">
<rect x="20" y="40" width="240" height="44" rx="6" fill="#fde68a"/><text x="140" y="60" text-anchor="middle" class="svg-ink" font-size="13">Global routing prefix</text><text x="140" y="77" text-anchor="middle" class="svg-muted" font-size="12">48 bits, from the ISP</text>
<rect x="260" y="40" width="100" height="44" rx="6" fill="#bae6fd"/><text x="310" y="60" text-anchor="middle" class="svg-ink" font-size="13">Subnet ID</text><text x="310" y="77" text-anchor="middle" class="svg-muted" font-size="12">16 bits, yours</text>
<rect x="360" y="40" width="260" height="44" rx="6" fill="#bbf7d0"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="13">Interface ID</text><text x="490" y="77" text-anchor="middle" class="svg-muted" font-size="12">64 bits, the device</text>
<text x="140" y="28" text-anchor="middle" class="svg-accent" font-size="13">2001:db8:acad</text>
<text x="310" y="28" text-anchor="middle" class="svg-accent" font-size="13">:12</text>
<text x="490" y="28" text-anchor="middle" class="svg-accent" font-size="13">::1</text>
<line x1="20" y1="110" x2="360" y2="110" stroke="#64748b" stroke-width="2"/><text x="190" y="130" text-anchor="middle" class="svg-ink" font-size="12">prefix /64 = the subnet</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Lab 1: R1 G0/0 2001:db8:acad:12::1/64 on the R1 to R2 WAN link</text>
</svg><p class="cap">The common 48 / 16 / 64 split of a global unicast address.</p></div>

<h3>Why every LAN is a /64</h3>
<p>You could technically use any prefix length, but on a LAN the convention is <b>/64</b>, and you should follow it:</p>
<ul>
<li><b>SLAAC needs it.</b> A host that builds its own address adds a 64-bit interface ID to the prefix from the router. If the prefix is not /64, SLAAC does not work (chapter 8).</li>
<li><b>EUI-64 and random interface IDs are 64 bits</b> by design (chapter 5).</li>
<li><b>There is no shortage.</b> Saving host addresses is an IPv4 habit. A /48 site still has 65,536 subnets of /64.</li>
</ul>
<p>Other lengths you will see: ISPs usually receive a /32 or larger from the regional registry, and hand a /48 or /56 to each business or home. A <b>/128</b> identifies a single address: loopbacks, host routes and the local routes a router installs for its own addresses. Router-to-router links often still use /64 for simplicity, but <b>/127</b> is allowed on point-to-point links.</p>

<h3>Finding the prefix of an address</h3>
<p>With a /64 it is easy: keep the first <b>four hextets</b> and set everything after them to zero. Each hex digit is 4 bits, so any prefix length that is a multiple of 4 (a <b>nibble boundary</b>) is also easy: keep prefix/4 hex digits.</p>
<div class="eg"><p><b>Worked example.</b> PC1 in lab 2 gets <code>2001:db8:cafe:1:250:7fff:fe06:6d01/64</code>. Keep four hextets: the prefix is <code>2001:db8:cafe:1::/64</code>. Now a /56: <code>2001:db8:acad:1234::/56</code>. 56 bits is 14 hex digits: <code>2001 0db8 acad 12</code> are kept, and <code>34</code> becomes <code>00</code>, so the prefix is <code>2001:db8:acad:1200::/56</code>. A /56 contains 2<sup>8</sup> = 256 subnets of /64, from <code>2001:db8:acad:1200::/64</code> to <code>2001:db8:acad:12ff::/64</code>.</p></div>

<h3>Planning subnets: use the subnet ID wisely</h3>
<p>With 16 bits of subnet ID you can make the addresses tell a story. The labs use this trick: the WAN link between R1 and R2 is <code>2001:db8:acad:12::/64</code> ("1 to 2"), and in lab 3 the links are <code>2001:db8:12::/64</code>, <code>2001:db8:13::/64</code> and <code>2001:db8:23::/64</code>, while the loopback networks are <code>2001:db8:1::/64</code> on R1 and <code>2001:db8:3::/64</code> on R3. An engineer reading a route instantly knows where it points. Many companies also encode site, building or VLAN into the subnet ID, for example subnet <code>:10</code> for VLAN 10.</p>

<h3>What the router installs for each prefix</h3>
<p>For every IPv6 address you configure, IOS installs two routes: a <b>C</b> (connected) route for the /64 prefix and an <b>L</b> (local) /128 route for the router's own address. IOS also installs <code>FF00::/8</code> to Null0 for multicast.</p>
<pre class="out">R1# show ipv6 route
IPv6 Routing Table - default - 5 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
<span class="hl">C   2001:DB8:ACAD:10::/64 [0/0]</span>
     via GigabitEthernet0/1, directly connected
<span class="hl">L   2001:DB8:ACAD:10::1/128 [0/0]</span>
     via GigabitEthernet0/1, receive
C   2001:DB8:ACAD:12::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L   2001:DB8:ACAD:12::1/128 [0/0]
     via GigabitEthernet0/0, receive
L   FF00::/8 [0/0]
     via Null0, receive</pre>

<div class="warn"><p><b>Common mistake.</b> Using IPv4 thinking and giving a user LAN a /112 or /120 "to save addresses". Static addresses still work, but SLAAC breaks and many clients end up with no address. Keep LANs at /64.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which two addresses are in the same subnet?" With /64, compare only the first four hextets after expanding them. <code>2001:db8:a:1::5/64</code> and <code>2001:db8:a:1:ffff::9/64</code> are in the same subnet; <code>2001:db8:a:10::5/64</code> is not.</p></div>

<div class="scn"><h4>Phones with no IPv6 on the guest Wi-Fi</h4><p>A hotel's network team assigned <code>2001:db8:77:5::/96</code> to the guest VLAN, copying their habit of small IPv4 subnets. Laptops with a static test address worked, but guest phones and laptops received no global IPv6 address at all. <code>show ipv6 interface</code> on the gateway showed the /96 prefix, and a packet capture showed the Router Advertisement carried a /96 prefix that the clients ignored for autoconfiguration. The team changed the gateway to <code>2001:db8:77:5::1/64</code>, and within seconds every client built its own address.</p><p><b>Lesson:</b> /64 is not wasteful in IPv6; it is what SLAAC requires.</p></div>

<div class="iv"><p class="q">"Why is /64 the standard IPv6 subnet size, and when would you use something else?"</p><p>Strong answer: the 64-bit interface ID is built into SLAAC, EUI-64 and privacy addresses, so a LAN must be /64 for hosts to autoconfigure. Address space is not scarce: a /48 gives 65,536 /64s. Exceptions: /128 for loopbacks and host routes, /127 allowed on router point-to-point links, and shorter prefixes such as /48 or /56 for allocation and summarisation, never as a LAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 uses prefix length only; there are no dotted masks.</li>
<li>Typical global unicast split: 48-bit global routing prefix, 16-bit subnet ID, 64-bit interface ID.</li>
<li>LANs use /64 because SLAAC needs a 64-bit interface ID; /128 for loopbacks, /127 allowed on point-to-point.</li>
<li>On a nibble boundary, the prefix is the first prefix-length/4 hex digits followed by zeros.</li>
<li>Each configured address creates a C /64 route and an L /128 route in the IPv6 routing table.</li>
</ul></div>
`,hi:`
<p>India mein postal address mein PIN code, phir street, phir house number hota hai. PIN code postal department tay karta hai, street town planners, aur house number maalik. IPv6 global address bhi aise hi banta hai: <b>global routing prefix</b> aapke ISP se aata hai, <b>subnet ID</b> aapki choice hai, aur <b>interface ID</b> link par ek device ko pehchanta hai.</p>

<h3>Prefix length subnet mask ki jagah leta hai</h3>
<p>IPv6 mein dotted-decimal masks nahi hote. Yeh sirf <b>prefix length</b> use karta hai, slash ke baad likha hua, bilkul IPv4 ke CIDR jaisa. <code>2001:db8:acad:12::1/64</code> ka matlab hai pehle 64 bits network (<b>prefix</b>) hain aur baaki 64 bits interface ko pehchante hain. Prefix khud host bits zero karke likha jaata hai: <code>2001:db8:acad:12::/64</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Global unicast address structure">
<rect x="20" y="40" width="240" height="44" rx="6" fill="#fde68a"/><text x="140" y="60" text-anchor="middle" class="svg-ink" font-size="13">Global routing prefix</text><text x="140" y="77" text-anchor="middle" class="svg-muted" font-size="12">48 bits, ISP se</text>
<rect x="260" y="40" width="100" height="44" rx="6" fill="#bae6fd"/><text x="310" y="60" text-anchor="middle" class="svg-ink" font-size="13">Subnet ID</text><text x="310" y="77" text-anchor="middle" class="svg-muted" font-size="12">16 bits, aapka</text>
<rect x="360" y="40" width="260" height="44" rx="6" fill="#bbf7d0"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="13">Interface ID</text><text x="490" y="77" text-anchor="middle" class="svg-muted" font-size="12">64 bits, device ka</text>
<text x="140" y="28" text-anchor="middle" class="svg-accent" font-size="13">2001:db8:acad</text>
<text x="310" y="28" text-anchor="middle" class="svg-accent" font-size="13">:12</text>
<text x="490" y="28" text-anchor="middle" class="svg-accent" font-size="13">::1</text>
<line x1="20" y1="110" x2="360" y2="110" stroke="#64748b" stroke-width="2"/><text x="190" y="130" text-anchor="middle" class="svg-ink" font-size="12">prefix /64 = subnet</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Lab 1: R1 se R2 WAN link par R1 G0/0 2001:db8:acad:12::1/64</text>
</svg><p class="cap">Global unicast address ka common 48 / 16 / 64 split.</p></div>

<h3>Har LAN /64 kyun hota hai</h3>
<p>Technically aap koi bhi prefix length use kar sakte ho, par LAN par convention <b>/64</b> hai, aur aapko ise follow karna chahiye:</p>
<ul>
<li><b>SLAAC ko iski zaroorat hai.</b> Jo host khud apna address banata hai, woh router se mile prefix mein 64-bit interface ID jodta hai. Agar prefix /64 nahi hai, to SLAAC kaam nahi karta (chapter 8).</li>
<li><b>EUI-64 aur random interface IDs design se 64 bits ke hain</b> (chapter 5).</li>
<li><b>Koi kami nahi hai.</b> Host addresses bachana IPv4 ki aadat hai. Ek /48 site ke paas phir bhi 65,536 /64 subnets hain.</li>
</ul>
<p>Doosri lengths jo aapko dikhengi: ISPs aam taur par regional registry se /32 ya bada lete hain, aur har business ya ghar ko /48 ya /56 dete hain. <b>/128</b> ek single address ko pehchanta hai: loopbacks, host routes aur woh local routes jo router apne addresses ke liye install karta hai. Router-to-router links aksar simplicity ke liye /64 hi use karte hain, par point-to-point links par <b>/127</b> allowed hai.</p>

<h3>Address ka prefix nikalna</h3>
<p>/64 ke saath yeh aasaan hai: pehle <b>chaar hextets</b> rakho aur unke baad sab zero kar do. Har hex digit 4 bits ka hai, isliye 4 ke multiple wali koi bhi prefix length (<b>nibble boundary</b>) bhi aasaan hai: prefix/4 hex digits rakho.</p>
<div class="eg"><p><b>Worked example.</b> Lab 2 mein PC1 ko <code>2001:db8:cafe:1:250:7fff:fe06:6d01/64</code> milta hai. Chaar hextets rakho: prefix <code>2001:db8:cafe:1::/64</code> hai. Ab ek /56: <code>2001:db8:acad:1234::/56</code>. 56 bits 14 hex digits hain: <code>2001 0db8 acad 12</code> rakhe jaate hain, aur <code>34</code> ban jaata hai <code>00</code>, to prefix <code>2001:db8:acad:1200::/56</code> hai. Ek /56 mein 2<sup>8</sup> = 256 /64 subnets hote hain, <code>2001:db8:acad:1200::/64</code> se <code>2001:db8:acad:12ff::/64</code> tak.</p></div>

<h3>Subnets plan karna: subnet ID ko samajhdari se use karo</h3>
<p>Subnet ID ke 16 bits se aap addresses se kahani sunwa sakte ho. Labs yeh trick use karte hain: R1 aur R2 ke beech WAN link <code>2001:db8:acad:12::/64</code> hai ("1 se 2"), aur lab 3 mein links <code>2001:db8:12::/64</code>, <code>2001:db8:13::/64</code> aur <code>2001:db8:23::/64</code> hain, jabki loopback networks R1 par <code>2001:db8:1::/64</code> aur R3 par <code>2001:db8:3::/64</code> hain. Route padhne wala engineer turant jaan leta hai ki woh kahan point karta hai. Kai companies subnet ID mein site, building ya VLAN bhi encode karti hain, jaise VLAN 10 ke liye subnet <code>:10</code>.</p>

<h3>Har prefix ke liye router kya install karta hai</h3>
<p>Har configured IPv6 address ke liye IOS do routes install karta hai: /64 prefix ke liye <b>C</b> (connected) route aur router ke apne address ke liye <b>L</b> (local) /128 route. IOS multicast ke liye <code>FF00::/8</code> ko Null0 par bhi install karta hai.</p>
<pre class="out">R1# show ipv6 route
IPv6 Routing Table - default - 5 entries
Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
<span class="hl">C   2001:DB8:ACAD:10::/64 [0/0]</span>
     via GigabitEthernet0/1, directly connected
<span class="hl">L   2001:DB8:ACAD:10::1/128 [0/0]</span>
     via GigabitEthernet0/1, receive
C   2001:DB8:ACAD:12::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L   2001:DB8:ACAD:12::1/128 [0/0]
     via GigabitEthernet0/0, receive
L   FF00::/8 [0/0]
     via Null0, receive</pre>

<div class="warn"><p><b>Common galti.</b> IPv4 wali soch se user LAN ko "addresses bachane ke liye" /112 ya /120 dena. Static addresses to kaam karte hain, par SLAAC toot jaata hai aur kai clients ke paas koi address nahi hota. LANs ko /64 par rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunse do addresses same subnet mein hain?" /64 ke saath, expand karne ke baad sirf pehle chaar hextets compare karo. <code>2001:db8:a:1::5/64</code> aur <code>2001:db8:a:1:ffff::9/64</code> same subnet mein hain; <code>2001:db8:a:10::5/64</code> nahi hai.</p></div>

<div class="scn"><h4>Guest Wi-Fi par phones bina IPv6 ke</h4><p>Ek hotel ki network team ne chhote IPv4 subnets ki aadat copy karke guest VLAN ko <code>2001:db8:77:5::/96</code> de diya. Static test address wale laptops chal gaye, par guest phones aur laptops ko koi global IPv6 address nahi mila. Gateway par <code>show ipv6 interface</code> ne /96 prefix dikhaya, aur packet capture mein dikha ki Router Advertisement /96 prefix le ja raha tha jise clients ne autoconfiguration ke liye ignore kar diya. Team ne gateway ko <code>2001:db8:77:5::1/64</code> par badla, aur kuch hi second mein har client ne apna address bana liya.</p><p><b>Seekh:</b> IPv6 mein /64 wasteful nahi hai; SLAAC ko yahi chahiye.</p></div>

<div class="iv"><p class="q">"Standard IPv6 subnet size /64 kyun hai, aur aap kab kuch aur use karoge?"</p><p>Strong answer: 64-bit interface ID SLAAC, EUI-64 aur privacy addresses mein built-in hai, isliye hosts ke autoconfigure karne ke liye LAN /64 hona chahiye. Address space ki kami nahi hai: ek /48 se 65,536 /64s milte hain. Exceptions: loopbacks aur host routes ke liye /128, router point-to-point links par /127 allowed, aur allocation aur summarisation ke liye /48 ya /56 jaise chhote prefixes, LAN ke roop mein kabhi nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 sirf prefix length use karta hai; dotted masks nahi hote.</li>
<li>Typical global unicast split: 48-bit global routing prefix, 16-bit subnet ID, 64-bit interface ID.</li>
<li>LANs /64 use karte hain kyunki SLAAC ko 64-bit interface ID chahiye; loopbacks ke liye /128, point-to-point par /127 allowed.</li>
<li>Nibble boundary par prefix pehle prefix-length/4 hex digits aur uske baad zeros hota hai.</li>
<li>Har configured address IPv6 routing table mein ek C /64 route aur ek L /128 route banata hai.</li>
</ul></div>
`}};export{e as default};