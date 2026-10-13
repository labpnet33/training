var e={id:`addressing`,h:{en:`Multicast addressing: ranges, scopes and the group-to-MAC map`,hi:`Multicast addressing: ranges, scopes aur group-to-MAC mapping`},body:{en:`
<p>A unicast address names one interface. A <b>multicast group address</b> names a conversation: "everyone who has asked for this stream". Before you configure anything, you must know which group addresses are allowed, which are reserved, and which you should pick for your own applications.</p>

<h3>The class D block: 224.0.0.0/4</h3>
<p>Every IPv4 multicast address starts with the bits 1110, so the first octet is between 224 and 239. This block is 224.0.0.0 to 239.255.255.255, written <code>224.0.0.0/4</code>. It is only ever a <b>destination</b>. A packet never has a multicast source address.</p>
<table class="cmp"><tr><th>Range</th><th>Name and use</th><th>Routed?</th></tr>
<tr><td>224.0.0.0/24</td><td>Link-local control: 224.0.0.1 all hosts, 224.0.0.2 all routers, 224.0.0.5 and .6 OSPF, 224.0.0.10 EIGRP, 224.0.0.13 PIM, 224.0.0.18 VRRP, 224.0.0.22 IGMPv3 reports, 224.0.0.251 mDNS</td><td>Never. TTL is 1</td></tr>
<tr><td>224.0.1.0/24</td><td>Internetwork control: 224.0.1.1 NTP, 224.0.1.39 and 224.0.1.40 Auto-RP</td><td>Yes</td></tr>
<tr><td>224.0.2.0 to 231.255.255.255</td><td>Globally scoped, assigned for public use, mostly historic</td><td>Yes</td></tr>
<tr><td>232.0.0.0/8</td><td>Source-specific multicast (SSM)</td><td>Yes</td></tr>
<tr><td>233.0.0.0/8</td><td>GLOP: a block derived from a public AS number. 233.252.0.0/24 is for documentation</td><td>Yes</td></tr>
<tr><td>239.0.0.0/8</td><td>Administratively scoped: private, like RFC 1918 for multicast</td><td>Inside your domain</td></tr>
</table>
<p>For your own applications inside a company, use <b>239.0.0.0/8</b>. For source-specific channels use <b>232.0.0.0/8</b>. Never invent groups in 224.0.0.0/24: routers will not forward them, and any application that tries will work only on one LAN segment.</p>

<h3>ASM and SSM in one paragraph</h3>
<p>In <b>any-source multicast (ASM)</b> a receiver asks for a group only and may get that group from any source. The router stores this as <b>(*,G)</b>, pronounced "star comma G". In <b>source-specific multicast (SSM)</b> the receiver names both source and group, stored as <b>(S,G)</b>, and gets only that source. SSM needs IGMPv3 on the receiver LAN (chapter 4) and is the reason 232.0.0.0/8 exists. PIM details come in the next module.</p>

<h3>Planning the 239 block</h3>
<p>The 239.0.0.0/8 block is large (16 million groups). A plan keeps it manageable and lets you write filters later. A common pattern uses the second octet for the site or scope, the third for the application and the fourth for the stream:</p>
<table class="cmp"><tr><th>Pattern</th><th>Meaning</th><th>Example</th></tr>
<tr><td>239.1.x.y</td><td>Campus-wide, all sites</td><td>239.1.10.1 = lecture channel 1</td></tr>
<tr><td>239.20.x.y</td><td>Sahyadri main campus only</td><td>239.20.1.1 = hostel video</td></tr>
<tr><td>239.40.x.y</td><td>Bharat Retail stores</td><td>239.40.1.1 = training video</td></tr>
<tr><td>239.255.x.y</td><td>Local scope, never leaves one site</td><td>239.255.0.5 = building announcements</td></tr>
</table>
<p>Real organisations also reserve parts of 239 for scope boundaries (239.192.0.0/14 organisation-local and 239.255.0.0/16 site-local are the usual conventions). The point is to decide once, write it down and filter on it.</p>

<h3>From group address to Ethernet address</h3>
<p>An Ethernet switch forwards frames by MAC address, so a group address needs a MAC address too. There is no ARP for multicast. The rule is fixed: take the prefix <code>01:00:5e</code>, then a 0 bit, then the <b>low 23 bits</b> of the IP address.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Group to MAC mapping">
<text x="10" y="22" class="svg-ink" font-size="13">IP group 239.148.1.1 in binary (32 bits)</text>
<rect x="10" y="32" width="150" height="34" rx="4" fill="#e2e8f0"/><text x="85" y="54" text-anchor="middle" class="svg-ink" font-size="12">1110 1111</text>
<rect x="160" y="32" width="150" height="34" rx="4" fill="#fde68a"/><text x="235" y="54" text-anchor="middle" class="svg-ink" font-size="12">1 0010100</text>
<rect x="310" y="32" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="385" y="54" text-anchor="middle" class="svg-ink" font-size="12">0000 0001</text>
<rect x="460" y="32" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="535" y="54" text-anchor="middle" class="svg-ink" font-size="12">0000 0001</text>
<text x="160" y="90" class="svg-muted" font-size="12">5 high bits are dropped: 4 from octet 1, 1 from octet 2</text>
<line x1="235" y1="66" x2="235" y2="100" stroke="#64748b" stroke-width="1.5"/>
<text x="10" y="128" class="svg-ink" font-size="13">Ethernet MAC</text>
<rect x="10" y="138" width="150" height="34" rx="4" fill="#bae6fd"/><text x="85" y="160" text-anchor="middle" class="svg-ink" font-size="12">01:00:5e</text>
<rect x="160" y="138" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="235" y="160" text-anchor="middle" class="svg-ink" font-size="12">0 + 0010100 = 14</text>
<rect x="310" y="138" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="385" y="160" text-anchor="middle" class="svg-ink" font-size="12">01</text>
<rect x="460" y="138" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="12">01</text>
</svg><p class="cap">239.148.1.1 becomes 01:00:5e:14:01:01. So does 239.20.1.1.</p></div>

<h3>The 32-to-1 overlap</h3>
<p>An IP group has 28 variable bits but the MAC keeps only 23. Five bits are lost, so <b>32 different group addresses share every multicast MAC</b>.</p>
<div class="eg"><p><b>Worked example.</b> 239.20.1.1: 20 is 0x14, so the MAC is 01:00:5e:14:01:01. Now 239.148.1.1: 148 is 0x94, but the top bit of the second octet is dropped, so 0x94 becomes 0x14 and the MAC is again 01:00:5e:14:01:01. The same MAC is also used by 224.20.1.1, 225.20.1.1 and so on up to 239.20.1.1, and by the same list with 148. A host that joined 239.20.1.1 receives frames for 239.148.1.1 at Layer 2; the IP layer discards them, but the NIC and CPU still did the work.</p></div>
<p>Two practical rules follow. First, <b>avoid group addresses whose last 23 bits match link-local</b>: groups ending in .0.0.x or .128.0.x (for example 239.0.0.5 or 239.128.0.5) map to MACs that switches flood like control traffic, even with snooping on. Second, in a busy network, <b>do not put different applications on groups that differ only in the top five bits</b>.</p>

<div class="warn"><p><b>Common mistakes.</b> Using 224.0.0.x for a company application (never routed). Picking groups like 239.0.0.1 and 239.128.0.1 (they overlap link-local MACs and are flooded). Assuming the MAC overlap breaks routing: it does not, routers work on IP; it only wastes switch and host effort.</p></div>
<div class="exam"><p><b>Exam trap.</b> The MAC prefix is 01:00:5e and only 23 bits come from the IP address, not 24 or 28. The overlap factor is 32:1. 232/8 is SSM, 239/8 is administratively scoped, 224.0.0.0/24 is never forwarded.</p></div>

<div class="scn"><h4>Printers rebooting at 11 am</h4><p>Zenith Logistics chose 239.128.0.10 for a new warehouse screen feed. Every morning the old label printers on the same VLAN rebooted when the feed started. The cause was the MAC: 239.128.0.10 maps to 01:00:5e:00:00:0a, the same MAC as 224.0.0.10, which is EIGRP. Switches flood that MAC to every port, so the small printer NICs received a 3 Mbps video. The fix was to renumber the feed to 239.20.4.10.</p><p><b>Lesson:</b> check the MAC your group maps to, not only the IP.</p></div>

<div class="iv"><p class="q">"How is a multicast IP address mapped to a MAC address, and what is the catch?"</p><p>Strong answer: 01:00:5e plus the low 23 bits of the group, so the 5 high bits of the 28-bit group ID are lost and 32 groups share a MAC. The catch is overlap on a shared LAN (hosts see frames for groups they did not join) and that groups mapping onto 01:00:5e:00:00:xx are flooded as link-local. Mention that you plan the 239 block to avoid .0.0.x and .128.0.x.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast is 224.0.0.0/4. It is only a destination address.</li>
<li>224.0.0.0/24 is link-local and never routed; 232/8 is SSM; 239/8 is private (administratively scoped).</li>
<li>MAC = 01:00:5e + 0 + low 23 bits of the group; 32 groups share one MAC.</li>
<li>Plan the 239 block by site and application, and avoid .0.0.x and .128.0.x endings.</li>
<li>ASM stores (*,G); SSM stores (S,G) and needs IGMPv3.</li>
</ul></div>
`,hi:`
<p>Unicast address ek interface ka naam hota hai. <b>Multicast group address</b> ek conversation ka naam hota hai: "jis jis ne yeh stream maangi hai". Kuch bhi configure karne se pehle aapko pata hona chahiye ki kaunse group addresses allowed hain, kaunse reserved hain, aur apni applications ke liye kaunse chunne chahiye.</p>

<h3>Class D block: 224.0.0.0/4</h3>
<p>Har IPv4 multicast address bits 1110 se shuru hota hai, isliye pehla octet 224 se 239 ke beech hota hai. Yeh block 224.0.0.0 se 239.255.255.255 tak hai, jise <code>224.0.0.0/4</code> likhte hain. Yeh sirf <b>destination</b> ke roop mein aata hai. Kisi packet ka source address multicast nahi hota.</p>
<table class="cmp"><tr><th>Range</th><th>Naam aur use</th><th>Routed?</th></tr>
<tr><td>224.0.0.0/24</td><td>Link-local control: 224.0.0.1 all hosts, 224.0.0.2 all routers, 224.0.0.5 aur .6 OSPF, 224.0.0.10 EIGRP, 224.0.0.13 PIM, 224.0.0.18 VRRP, 224.0.0.22 IGMPv3 reports, 224.0.0.251 mDNS</td><td>Kabhi nahi. TTL 1 hota hai</td></tr>
<tr><td>224.0.1.0/24</td><td>Internetwork control: 224.0.1.1 NTP, 224.0.1.39 aur 224.0.1.40 Auto-RP</td><td>Haan</td></tr>
<tr><td>224.0.2.0 se 231.255.255.255</td><td>Globally scoped, public use ke liye assigned, zyadatar purana</td><td>Haan</td></tr>
<tr><td>232.0.0.0/8</td><td>Source-specific multicast (SSM)</td><td>Haan</td></tr>
<tr><td>233.0.0.0/8</td><td>GLOP: public AS number se bana block. 233.252.0.0/24 documentation ke liye hai</td><td>Haan</td></tr>
<tr><td>239.0.0.0/8</td><td>Administratively scoped: private, multicast ke liye RFC 1918 jaisa</td><td>Apne domain ke andar</td></tr>
</table>
<p>Company ke andar apni applications ke liye <b>239.0.0.0/8</b> use karo. Source-specific channels ke liye <b>232.0.0.0/8</b>. 224.0.0.0/24 mein kabhi apne groups mat banao: routers unhe forward nahi karenge, aur jo application aisa karegi woh sirf ek LAN segment par chalegi.</p>

<h3>ASM aur SSM ek paragraph mein</h3>
<p><b>Any-source multicast (ASM)</b> mein receiver sirf group maangta hai aur woh group kisi bhi source se aa sakta hai. Router ise <b>(*,G)</b> ke roop mein store karta hai, "star comma G". <b>Source-specific multicast (SSM)</b> mein receiver source aur group dono ka naam leta hai, jo <b>(S,G)</b> ke roop mein store hota hai, aur sirf wahi source milta hai. SSM ke liye receiver LAN par IGMPv3 chahiye (chapter 4) aur 232.0.0.0/8 isiliye bana hai. PIM ki details agle module mein hain.</p>

<h3>239 block ka plan</h3>
<p>239.0.0.0/8 block bada hai (1.6 crore groups). Plan se yeh sambhalna aasaan hota hai aur baad mein filters likh sakte ho. Ek common pattern: dusra octet site ya scope ke liye, teesra application ke liye, chautha stream ke liye:</p>
<table class="cmp"><tr><th>Pattern</th><th>Matlab</th><th>Example</th></tr>
<tr><td>239.1.x.y</td><td>Campus-wide, saari sites</td><td>239.1.10.1 = lecture channel 1</td></tr>
<tr><td>239.20.x.y</td><td>Sirf Sahyadri main campus</td><td>239.20.1.1 = hostel video</td></tr>
<tr><td>239.40.x.y</td><td>Bharat Retail stores</td><td>239.40.1.1 = training video</td></tr>
<tr><td>239.255.x.y</td><td>Local scope, ek site se bahar nahi jaata</td><td>239.255.0.5 = building announcements</td></tr>
</table>
<p>Real organisations 239 ke kuch hisse scope boundaries ke liye bhi reserve karte hain (239.192.0.0/14 organisation-local aur 239.255.0.0/16 site-local aam conventions hain). Baat yeh hai ki ek baar decide karo, likh lo aur uske basis par filter lagao.</p>

<h3>Group address se Ethernet address tak</h3>
<p>Ethernet switch frames MAC address se forward karta hai, isliye group address ko MAC address bhi chahiye. Multicast ke liye ARP nahi hota. Rule fixed hai: prefix <code>01:00:5e</code> lo, phir ek 0 bit, phir IP address ke <b>low 23 bits</b>.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Group se MAC mapping">
<text x="10" y="22" class="svg-ink" font-size="13">IP group 239.148.1.1 binary mein (32 bits)</text>
<rect x="10" y="32" width="150" height="34" rx="4" fill="#e2e8f0"/><text x="85" y="54" text-anchor="middle" class="svg-ink" font-size="12">1110 1111</text>
<rect x="160" y="32" width="150" height="34" rx="4" fill="#fde68a"/><text x="235" y="54" text-anchor="middle" class="svg-ink" font-size="12">1 0010100</text>
<rect x="310" y="32" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="385" y="54" text-anchor="middle" class="svg-ink" font-size="12">0000 0001</text>
<rect x="460" y="32" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="535" y="54" text-anchor="middle" class="svg-ink" font-size="12">0000 0001</text>
<text x="160" y="90" class="svg-muted" font-size="12">5 high bits drop: octet 1 ke 4, octet 2 ka 1</text>
<line x1="235" y1="66" x2="235" y2="100" stroke="#64748b" stroke-width="1.5"/>
<text x="10" y="128" class="svg-ink" font-size="13">Ethernet MAC</text>
<rect x="10" y="138" width="150" height="34" rx="4" fill="#bae6fd"/><text x="85" y="160" text-anchor="middle" class="svg-ink" font-size="12">01:00:5e</text>
<rect x="160" y="138" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="235" y="160" text-anchor="middle" class="svg-ink" font-size="12">0 + 0010100 = 14</text>
<rect x="310" y="138" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="385" y="160" text-anchor="middle" class="svg-ink" font-size="12">01</text>
<rect x="460" y="138" width="150" height="34" rx="4" fill="#bbf7d0"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="12">01</text>
</svg><p class="cap">239.148.1.1 ka MAC 01:00:5e:14:01:01 banta hai. 239.20.1.1 ka bhi wahi.</p></div>

<h3>32-to-1 overlap</h3>
<p>IP group mein 28 variable bits hote hain par MAC sirf 23 rakhta hai. Paanch bits kho jaate hain, isliye <b>32 alag group addresses ek hi multicast MAC share karte hain</b>.</p>
<div class="eg"><p><b>Worked example.</b> 239.20.1.1: 20 ka hex 0x14 hai, to MAC 01:00:5e:14:01:01 hai. Ab 239.148.1.1: 148 ka hex 0x94 hai, par dusre octet ka top bit drop ho jaata hai, isliye 0x94 se 0x14 ban jaata hai aur MAC phir 01:00:5e:14:01:01 hai. Wahi MAC 224.20.1.1, 225.20.1.1 aur isi tarah 239.20.1.1 tak, aur 148 wali same list ke liye bhi use hota hai. Jis host ne 239.20.1.1 join kiya use Layer 2 par 239.148.1.1 ke frames bhi milte hain; IP layer unhe discard kar deti hai, par NIC aur CPU ka kaam ho chuka hota hai.</p></div>
<p>Do practical rules nikalte hain. Pehla, <b>aise group addresses se bacho jinke last 23 bits link-local se match karte hain</b>: .0.0.x ya .128.0.x par khatam hone wale groups (jaise 239.0.0.5 ya 239.128.0.5) un MACs par map hote hain jinhe switches control traffic ki tarah flood karte hain, snooping on hone par bhi. Dusra, busy network mein <b>alag applications ko aise groups par mat rakho jo sirf top paanch bits mein alag hain</b>.</p>

<div class="warn"><p><b>Common mistakes.</b> Company application ke liye 224.0.0.x use karna (kabhi routed nahi hota). 239.0.0.1 aur 239.128.0.1 jaise groups chunna (link-local MACs se overlap karte hain aur flood hote hain). Yeh maan lena ki MAC overlap routing tod deta hai: nahi todta, routers IP par kaam karte hain; yeh sirf switch aur host ka effort waste karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> MAC prefix 01:00:5e hai aur IP address se sirf 23 bits aate hain, 24 ya 28 nahi. Overlap factor 32:1 hai. 232/8 SSM hai, 239/8 administratively scoped hai, 224.0.0.0/24 kabhi forward nahi hota.</p></div>

<div class="scn"><h4>Subah 11 baje printers reboot</h4><p>Zenith Logistics ne naye warehouse screen feed ke liye 239.128.0.10 chuna. Har subah feed shuru hote hi usi VLAN ke purane label printers reboot ho jaate the. Wajah MAC thi: 239.128.0.10 ka MAC 01:00:5e:00:00:0a banta hai, jo 224.0.0.10 yaani EIGRP ka MAC hai. Switches us MAC ko har port par flood karte hain, isliye chhote printer NICs ko 3 Mbps video mil gayi. Fix: feed ko 239.20.4.10 par renumber kiya.</p><p><b>Lesson:</b> sirf IP nahi, woh MAC bhi dekho jis par aapka group map hota hai.</p></div>

<div class="iv"><p class="q">"Multicast IP address MAC address par kaise map hota hai, aur catch kya hai?"</p><p>Strong answer: 01:00:5e plus group ke low 23 bits, isliye 28-bit group ID ke 5 high bits kho jaate hain aur 32 groups ek MAC share karte hain. Catch yeh hai ki shared LAN par overlap hota hai (hosts ko un groups ke frames dikhte hain jo unhone join nahi kiye) aur 01:00:5e:00:00:xx par map hone wale groups link-local ki tarah flood hote hain. Batao ki aap 239 block ka plan aise banate ho ki .0.0.x aur .128.0.x se bacha jaaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast 224.0.0.0/4 hai. Yeh sirf destination address hai.</li>
<li>224.0.0.0/24 link-local hai aur kabhi routed nahi; 232/8 SSM hai; 239/8 private (administratively scoped) hai.</li>
<li>MAC = 01:00:5e + 0 + group ke low 23 bits; 32 groups ek MAC share karte hain.</li>
<li>239 block ko site aur application ke hisaab se plan karo, aur .0.0.x tatha .128.0.x endings se bacho.</li>
<li>ASM (*,G) store karta hai; SSM (S,G) store karta hai aur IGMPv3 maangta hai.</li>
</ul></div>
`}};export{e as default};