var e={id:`three-ways`,h:{en:`Unicast, broadcast, multicast: three ways to send to many`,hi:`Unicast, broadcast, multicast: kai logon ko bhejne ke teen tareeke`},body:{en:`
<p>Before we talk about multicast, we need the two older ways of sending packets, because multicast is the sensible middle path between them. Think of a school principal who wants to share news.</p>

<h3>Unicast: a personal phone call to each person</h3>
<p><b>Unicast</b> means one sender to one receiver. The destination IP address belongs to exactly one host. Almost everything you do online is unicast: opening a website, sending a message, a video call between two people. If the principal phones every parent one by one, that is unicast. It works, but for 500 parents the principal makes 500 calls.</p>

<h3>Broadcast: shouting through the loudspeaker</h3>
<p><b>Broadcast</b> means one sender to every host on the local network. The destination address is the all-ones address of the subnet (for example 192.0.2.255 in 192.0.2.0/24), or 255.255.255.255. Every device on that LAN must receive the packet and look at it, even if it does not care. This is the loudspeaker in the school ground: everybody hears it, including people who did not want to. Routers stop broadcasts at the LAN edge, so a broadcast can never reach another network. ARP and DHCP discovery are classic broadcast users.</p>

<h3>Multicast: a WhatsApp group</h3>
<p><b>Multicast</b> means one sender to a group of interested receivers. Only people who joined the group receive the message, and the sender sends it just once. The network copies the message only where the road splits towards different members. The group is identified by a special destination address called a <b>group address</b>, which is not the address of any single computer.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Unicast, broadcast and multicast compared">
<rect x="10" y="10" width="200" height="240" rx="10" fill="#e2e8f0"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="14">Unicast</text>
<rect x="20" y="105" width="44" height="34" rx="6" fill="#fde68a"/><text x="42" y="127" text-anchor="middle" class="svg-ink" font-size="12">Src</text>
<rect x="150" y="50" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="174" y="68" text-anchor="middle" class="svg-ink" font-size="12">H1</text>
<rect x="150" y="100" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="174" y="118" text-anchor="middle" class="svg-ink" font-size="12">H2</text>
<rect x="150" y="150" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="174" y="168" text-anchor="middle" class="svg-ink" font-size="12">H3</text>
<line x1="64" y1="115" x2="150" y2="63" stroke="#64748b" stroke-width="2"/><line x1="64" y1="122" x2="150" y2="113" stroke="#64748b" stroke-width="2"/><line x1="64" y1="130" x2="150" y2="163" stroke="#64748b" stroke-width="2"/>
<text x="110" y="215" text-anchor="middle" class="svg-muted" font-size="12">3 copies leave the source</text>
<rect x="220" y="10" width="200" height="240" rx="10" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Broadcast</text>
<rect x="230" y="105" width="44" height="34" rx="6" fill="#fde68a"/><text x="252" y="127" text-anchor="middle" class="svg-ink" font-size="12">Src</text>
<rect x="360" y="50" width="48" height="26" rx="6" fill="#fed7aa"/><text x="384" y="68" text-anchor="middle" class="svg-ink" font-size="12">H1</text>
<rect x="360" y="100" width="48" height="26" rx="6" fill="#fed7aa"/><text x="384" y="118" text-anchor="middle" class="svg-ink" font-size="12">H2</text>
<rect x="360" y="150" width="48" height="26" rx="6" fill="#fed7aa"/><text x="384" y="168" text-anchor="middle" class="svg-ink" font-size="12">H3</text>
<line x1="274" y1="115" x2="360" y2="63" stroke="#64748b" stroke-width="2"/><line x1="274" y1="122" x2="360" y2="113" stroke="#64748b" stroke-width="2"/><line x1="274" y1="130" x2="360" y2="163" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">everyone gets it, wanted or not</text>
<rect x="430" y="10" width="200" height="240" rx="10" fill="#e2e8f0"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="14">Multicast</text>
<rect x="440" y="105" width="44" height="34" rx="6" fill="#fde68a"/><text x="462" y="127" text-anchor="middle" class="svg-ink" font-size="12">Src</text>
<rect x="570" y="50" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="594" y="68" text-anchor="middle" class="svg-ink" font-size="12">H1</text>
<rect x="570" y="100" width="48" height="26" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="594" y="118" text-anchor="middle" class="svg-muted" font-size="12">H2</text>
<rect x="570" y="150" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="594" y="168" text-anchor="middle" class="svg-ink" font-size="12">H3</text>
<line x1="484" y1="122" x2="520" y2="122" stroke="#64748b" stroke-width="3"/><line x1="520" y1="122" x2="570" y2="63" stroke="#64748b" stroke-width="2"/><line x1="520" y1="122" x2="570" y2="163" stroke="#64748b" stroke-width="2"/>
<text x="530" y="215" text-anchor="middle" class="svg-muted" font-size="12">1 copy, only members (H1, H3)</text>
</svg><p class="cap">Multicast sits between unicast (wasteful for many) and broadcast (disturbs everybody).</p></div>

<h3>The group address</h3>
<p>IPv4 reserves the range <b>224.0.0.0 to 239.255.255.255</b> (written 224.0.0.0/4) for multicast. A group address is never assigned to an interface as a host address and never appears as a <i>source</i>. It only appears as the <i>destination</i>. In this track we use 239.x.x.x addresses, called <b>administratively scoped</b> addresses, which are the multicast equivalent of private RFC 1918 ranges: safe to use inside your own company. The next module (mq-igmp) explains the ranges in detail.</p>

<table class="cmp"><tr><th></th><th>Unicast</th><th>Broadcast</th><th>Multicast</th></tr>
<tr><td><b>Receivers</b></td><td>One</td><td>Everyone on the LAN</td><td>Only members of the group</td></tr>
<tr><td><b>Copies from source</b></td><td>One per receiver</td><td>One</td><td>One</td></tr>
<tr><td><b>Crosses routers?</b></td><td>Yes</td><td>No</td><td>Yes, if multicast routing is on</td></tr>
<tr><td><b>Example</b></td><td>Web page</td><td>ARP request</td><td>IPTV channel</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A source sends a 2 Mbps stream to 100 receivers spread over 5 branch networks. Unicast: the source link carries 100 x 2 = 200 Mbps. Multicast: the source link carries 2 Mbps, and each branch link also carries just 2 Mbps, no matter how many receivers sit behind it.</p></div>

<h3>Two things multicast needs that unicast does not</h3>
<ol>
<li><b>A way for hosts to say "I want this group".</b> This is a small protocol between a host and its router called IGMP (Internet Group Management Protocol). We use it in chapter 3 and study it in mq-igmp.</li>
<li><b>A way for routers to build the delivery path.</b> This is a routing protocol, most commonly PIM (Protocol Independent Multicast). We use it in the first lab and study it fully in mq-pim.</li>
</ol>
<p>Multicast also runs over UDP in most cases. UDP does not retransmit lost packets, which suits live video and audio: a late packet is useless anyway.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Believing that a multicast packet reaches every host in the network; only joined members get it. (2) Using a multicast address as a source address; it is only ever a destination. (3) Expecting multicast to cross routers without configuration; <code>ip multicast-routing</code> and PIM must be enabled.</p></div>

<div class="exam"><p><b>Exam trap.</b> Multicast is not the same as broadcast. Broadcast stops at the router; multicast can cross it, but only towards interested receivers.</p></div>

<div class="scn"><h4>The software update storm</h4><p>A company pushed a 600 MB software update to 300 laptops in a Bengaluru office by unicast from one server. The server link carried 300 simultaneous copies and the whole floor slowed down for two hours. The next month the team used a tool that distributes the update by multicast to a group address. The server sent one copy. The update finished in minutes and nobody noticed anything.</p><p><b>Lesson:</b> when many receivers want the same data at the same moment, multicast turns a load problem into a non-event.</p></div>

<div class="iv"><p class="q">"What is the difference between unicast, broadcast and multicast?"</p><p>Strong answer: unicast is one to one, broadcast is one to all on the LAN and is not routed, multicast is one to a group that has joined, and it is routed using PIM with IGMP at the edge. Mention that multicast saves source and link bandwidth, and that the group address is only a destination.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unicast is one to one, broadcast is one to all on a LAN, multicast is one to a joined group.</li>
<li>Multicast addresses are 224.0.0.0/4, and 239.x.x.x is the private-style, admin-scoped part.</li>
<li>A group address is only ever a destination, never a source.</li>
<li>Hosts join groups with IGMP; routers build paths with PIM.</li>
<li>Multicast cuts source and link load from "per receiver" to "per link".</li>
</ul></div>
`,hi:`
<p>Multicast ki baat karne se pehle humein packets bhejne ke do purane tareeke samajhne padenge, kyunki multicast unke beech ka samajhdaar raasta hai. Socho ek school principal ko koi khabar sabko batani hai.</p>

<h3>Unicast: har insaan ko alag personal phone call</h3>
<p><b>Unicast</b> ka matlab ek sender se ek receiver. Destination IP address bilkul ek host ka hota hai. Online lagbhag sab kuch unicast hai: website kholna, message bhejna, do logon ki video call. Agar principal har parent ko ek ek karke phone kare, to wo unicast hai. Kaam karta hai, lekin 500 parents ke liye principal 500 calls karta hai.</p>

<h3>Broadcast: loudspeaker se chillana</h3>
<p><b>Broadcast</b> ka matlab ek sender se local network ke har host tak. Destination address subnet ka all-ones address hota hai (jaise 192.0.2.0/24 mein 192.0.2.255), ya 255.255.255.255. Us LAN ke har device ko packet receive karke dekhna padta hai, chahe use parwah na ho. Yeh school ground ka loudspeaker hai: sab sunte hain, unhe bhi jo sunna nahi chahte. Routers broadcast ko LAN ke edge par rok dete hain, isliye broadcast kabhi dusre network tak nahi pahunchta. ARP aur DHCP discovery classic broadcast users hain.</p>

<h3>Multicast: WhatsApp group</h3>
<p><b>Multicast</b> ka matlab ek sender se interested receivers ke group tak. Sirf jo log group join karte hain unhi ko message milta hai, aur sender use sirf ek baar bhejta hai. Network message ki copy sirf wahan banata hai jahan raasta alag members ki taraf split hota hai. Group ek special destination address se pehchana jaata hai jise <b>group address</b> kehte hain, jo kisi ek computer ka address nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Unicast, broadcast aur multicast ki tulna">
<rect x="10" y="10" width="200" height="240" rx="10" fill="#e2e8f0"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="14">Unicast</text>
<rect x="20" y="105" width="44" height="34" rx="6" fill="#fde68a"/><text x="42" y="127" text-anchor="middle" class="svg-ink" font-size="12">Src</text>
<rect x="150" y="50" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="174" y="68" text-anchor="middle" class="svg-ink" font-size="12">H1</text>
<rect x="150" y="100" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="174" y="118" text-anchor="middle" class="svg-ink" font-size="12">H2</text>
<rect x="150" y="150" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="174" y="168" text-anchor="middle" class="svg-ink" font-size="12">H3</text>
<line x1="64" y1="115" x2="150" y2="63" stroke="#64748b" stroke-width="2"/><line x1="64" y1="122" x2="150" y2="113" stroke="#64748b" stroke-width="2"/><line x1="64" y1="130" x2="150" y2="163" stroke="#64748b" stroke-width="2"/>
<text x="110" y="215" text-anchor="middle" class="svg-muted" font-size="12">source se 3 copies nikalti hain</text>
<rect x="220" y="10" width="200" height="240" rx="10" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Broadcast</text>
<rect x="230" y="105" width="44" height="34" rx="6" fill="#fde68a"/><text x="252" y="127" text-anchor="middle" class="svg-ink" font-size="12">Src</text>
<rect x="360" y="50" width="48" height="26" rx="6" fill="#fed7aa"/><text x="384" y="68" text-anchor="middle" class="svg-ink" font-size="12">H1</text>
<rect x="360" y="100" width="48" height="26" rx="6" fill="#fed7aa"/><text x="384" y="118" text-anchor="middle" class="svg-ink" font-size="12">H2</text>
<rect x="360" y="150" width="48" height="26" rx="6" fill="#fed7aa"/><text x="384" y="168" text-anchor="middle" class="svg-ink" font-size="12">H3</text>
<line x1="274" y1="115" x2="360" y2="63" stroke="#64748b" stroke-width="2"/><line x1="274" y1="122" x2="360" y2="113" stroke="#64748b" stroke-width="2"/><line x1="274" y1="130" x2="360" y2="163" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">sabko milta hai, chahiye ya nahi</text>
<rect x="430" y="10" width="200" height="240" rx="10" fill="#e2e8f0"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="14">Multicast</text>
<rect x="440" y="105" width="44" height="34" rx="6" fill="#fde68a"/><text x="462" y="127" text-anchor="middle" class="svg-ink" font-size="12">Src</text>
<rect x="570" y="50" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="594" y="68" text-anchor="middle" class="svg-ink" font-size="12">H1</text>
<rect x="570" y="100" width="48" height="26" rx="6" fill="#e2e8f0" stroke="#64748b"/><text x="594" y="118" text-anchor="middle" class="svg-muted" font-size="12">H2</text>
<rect x="570" y="150" width="48" height="26" rx="6" fill="#bbf7d0"/><text x="594" y="168" text-anchor="middle" class="svg-ink" font-size="12">H3</text>
<line x1="484" y1="122" x2="520" y2="122" stroke="#64748b" stroke-width="3"/><line x1="520" y1="122" x2="570" y2="63" stroke="#64748b" stroke-width="2"/><line x1="520" y1="122" x2="570" y2="163" stroke="#64748b" stroke-width="2"/>
<text x="530" y="215" text-anchor="middle" class="svg-muted" font-size="12">1 copy, sirf members (H1, H3)</text>
</svg><p class="cap">Multicast unicast (bahut logon ke liye wasteful) aur broadcast (sabko disturb karta hai) ke beech hai.</p></div>

<h3>Group address</h3>
<p>IPv4 ne range <b>224.0.0.0 se 239.255.255.255</b> (224.0.0.0/4 likhte hain) multicast ke liye reserve ki hai. Group address kabhi interface par host address ki tarah assign nahi hota aur kabhi <i>source</i> ki tarah nahi dikhta. Yeh sirf <i>destination</i> ki tarah dikhta hai. Is track mein hum 239.x.x.x addresses use karte hain, jinhe <b>administratively scoped</b> addresses kehte hain, jo RFC 1918 private ranges ka multicast version hain: apni company ke andar use karne ke liye safe. Agla module (mq-igmp) ranges detail mein samjhata hai.</p>

<table class="cmp"><tr><th></th><th>Unicast</th><th>Broadcast</th><th>Multicast</th></tr>
<tr><td><b>Receivers</b></td><td>Ek</td><td>LAN ke sab</td><td>Sirf group ke members</td></tr>
<tr><td><b>Source se copies</b></td><td>Har receiver ke liye ek</td><td>Ek</td><td>Ek</td></tr>
<tr><td><b>Routers paar karta hai?</b></td><td>Haan</td><td>Nahi</td><td>Haan, agar multicast routing on ho</td></tr>
<tr><td><b>Example</b></td><td>Web page</td><td>ARP request</td><td>IPTV channel</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek source 5 branch networks mein faile 100 receivers ko 2 Mbps stream bhejta hai. Unicast: source link 100 x 2 = 200 Mbps carry karti hai. Multicast: source link 2 Mbps carry karti hai, aur har branch link bhi sirf 2 Mbps, chahe uske peeche kitne bhi receivers hon.</p></div>

<h3>Do cheezein jo multicast ko chahiye aur unicast ko nahi</h3>
<ol>
<li><b>Hosts ke liye "mujhe yeh group chahiye" kehne ka tareeka.</b> Yeh host aur uske router ke beech ek chhota protocol hai jise IGMP (Internet Group Management Protocol) kehte hain. Hum ise chapter 3 mein use karte hain aur mq-igmp mein padhte hain.</li>
<li><b>Routers ke liye delivery path banane ka tareeka.</b> Yeh ek routing protocol hai, sabse common PIM (Protocol Independent Multicast). Hum ise pehle lab mein use karte hain aur mq-pim mein poori tarah padhte hain.</li>
</ol>
<p>Multicast aksar UDP par chalta hai. UDP lost packets ko retransmit nahi karta, jo live video aur audio ke liye theek hai: der se aaya packet waise bhi bekaar hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Yeh maanna ki multicast packet network ke har host tak pahunchta hai; sirf joined members ko milta hai. (2) Multicast address ko source address ki tarah use karna; yeh sirf destination hota hai. (3) Yeh ummeed karna ki multicast bina configuration routers paar kar jaayega; <code>ip multicast-routing</code> aur PIM on karne padte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Multicast aur broadcast ek nahi hain. Broadcast router par rukta hai; multicast paar ja sakta hai, lekin sirf interested receivers ki taraf.</p></div>

<div class="scn"><h4>Software update ka toofan</h4><p>Ek company ne Bengaluru office ke 300 laptops par 600 MB ka software update ek server se unicast se bheja. Server link par 300 simultaneous copies chali aur poori floor do ghante slow rahi. Agle mahine team ne ek tool use kiya jo update ko group address par multicast se distribute karta hai. Server ne ek copy bheji. Update minutes mein ho gaya aur kisi ko pata bhi nahi chala.</p><p><b>Seekh:</b> jab bahut saare receivers ek hi waqt ek hi data chahte hain, multicast load problem ko non-event bana deta hai.</p></div>

<div class="iv"><p class="q">"Unicast, broadcast aur multicast mein kya farak hai?"</p><p>Strong answer: unicast one to one hai, broadcast LAN par one to all hai aur routed nahi hota, multicast one to joined group hai, aur edge par IGMP ke saath PIM se routed hota hai. Batao ki multicast source aur link bandwidth bachata hai, aur group address sirf destination hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unicast one to one, broadcast LAN par one to all, multicast one to joined group.</li>
<li>Multicast addresses 224.0.0.0/4 hain, aur 239.x.x.x private-style, admin-scoped hissa hai.</li>
<li>Group address sirf destination hota hai, kabhi source nahi.</li>
<li>Hosts IGMP se groups join karte hain; routers PIM se paths banate hain.</li>
<li>Multicast source aur link load ko "per receiver" se "per link" kar deta hai.</li>
</ul></div>
`}};export{e as default};