var e={id:`mcast-big-picture`,h:{en:`Why multicast: one sender, many receivers`,hi:`Multicast kyun: ek sender, kai receivers`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>The difference between unicast, broadcast and multicast, and the real applications that need multicast: IPTV, live classes, market data feeds and mass software updates.</li>
<li>Multicast group addresses (224.0.0.0/4, the link-local block, SSM 232/8, admin-scoped 239/8) and how a group maps to an Ethernet MAC (01:00:5e plus 23 bits, 32 groups per MAC).</li>
<li>How hosts ask for a group with IGMPv1, v2 and v3, how the querier is elected, and how IGMP snooping stops switches flooding multicast.</li>
<li>Distribution trees: source trees (S,G) and shared trees (*,G), and the Reverse Path Forwarding (RPF) check that keeps them loop-free.</li>
<li>PIM dense mode (briefly), PIM sparse mode in depth (RP, register, join/prune, SPT switchover), RP discovery (static, Auto-RP, BSR), Anycast RP with MSDP, PIM SSM and bidirectional PIM.</li>
<li>How to configure and verify it all on IOS, read every field of <code>show ip mroute</code>, and troubleshoot an RPF failure and a missing <code>ip pim</code> step by step.</li>
</ul>
<p><b>Prerequisites:</b> CCNA-level IPv4 addressing and subnetting, how a router builds its routing table, and basic OSPF (the ENCOR OSPF module is ideal). Every multicast term is defined from zero here. This module covers ENCOR 350-401 v1.2 objective 3.3.d: <i>describe multicast protocols, such as RPF check, PIM SM, IGMP v2/v3, SSM, bidir and MSDP</i>.</p>

<h3>The big picture: a TV channel, not a phone call</h3>
<p>Think about how you watch a cricket match. The broadcaster does not phone every viewer and play the match to each one separately. That would need one phone line per viewer. Instead it transmits <b>one channel</b>, and any TV that tunes in gets the picture. Viewers who are not interested simply do not tune in, and the channel costs the broadcaster the same whether ten people or ten million people are watching.</p>
<p>IP networks have three ways to deliver a packet, and they map neatly onto this story:</p>
<dl class="terms">
<dt>Unicast (one to one)</dt><dd>A packet goes from one source to one destination address. To reach 300 receivers the source must send 300 copies. This is the phone call.</dd>
<dt>Broadcast (one to all)</dt><dd>A packet goes to every host on the local subnet (255.255.255.255 or the directed broadcast). Every host must process it, even hosts that do not care, and routers do not forward it. This is shouting in a room.</dd>
<dt>Multicast (one to many who asked)</dt><dd>The source sends <b>one</b> packet to a <b>group address</b>. The network copies it only where the path splits toward interested receivers, and only on links that lead to at least one receiver. This is the TV channel.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Unicast versus multicast">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Unicast: 3 receivers = 3 copies</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Multicast: 1 copy per link</text>
<rect x="20" y="105" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="55" y="128" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<rect x="130" y="105" width="60" height="36" rx="6" fill="#bae6fd"/><text x="160" y="128" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="90" y1="115" x2="130" y2="115" stroke="#64748b" stroke-width="2"/><line x1="90" y1="123" x2="130" y2="123" stroke="#64748b" stroke-width="2"/><line x1="90" y1="131" x2="130" y2="131" stroke="#64748b" stroke-width="2"/>
<rect x="240" y="50" width="60" height="30" rx="6" fill="#fde68a"/><text x="270" y="70" text-anchor="middle" class="svg-ink" font-size="12">PC-A</text>
<rect x="240" y="108" width="60" height="30" rx="6" fill="#fde68a"/><text x="270" y="128" text-anchor="middle" class="svg-ink" font-size="12">PC-B</text>
<rect x="240" y="166" width="60" height="30" rx="6" fill="#fde68a"/><text x="270" y="186" text-anchor="middle" class="svg-ink" font-size="12">PC-C</text>
<line x1="190" y1="118" x2="240" y2="65" stroke="#64748b" stroke-width="2"/><line x1="190" y1="123" x2="240" y2="123" stroke="#64748b" stroke-width="2"/><line x1="190" y1="128" x2="240" y2="181" stroke="#64748b" stroke-width="2"/>
<text x="110" y="165" text-anchor="middle" class="svg-accent" font-size="12">3 copies</text>
<rect x="340" y="105" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="375" y="128" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<rect x="450" y="105" width="60" height="36" rx="6" fill="#bae6fd"/><text x="480" y="128" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="410" y1="123" x2="450" y2="123" stroke="#64748b" stroke-width="3"/>
<rect x="560" y="50" width="60" height="30" rx="6" fill="#fde68a"/><text x="590" y="70" text-anchor="middle" class="svg-ink" font-size="12">PC-A</text>
<rect x="560" y="108" width="60" height="30" rx="6" fill="#fde68a"/><text x="590" y="128" text-anchor="middle" class="svg-ink" font-size="12">PC-B</text>
<rect x="560" y="166" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="590" y="186" text-anchor="middle" class="svg-muted" font-size="12">PC-C (no)</text>
<line x1="510" y1="118" x2="560" y2="65" stroke="#64748b" stroke-width="2"/><line x1="510" y1="123" x2="560" y2="123" stroke="#64748b" stroke-width="2"/>
<text x="430" y="165" text-anchor="middle" class="svg-accent" font-size="12">1 copy</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">The router copies the packet only toward receivers that joined the group</text>
</svg><p class="cap">Unicast multiplies load at the source; multicast sends one stream and lets routers replicate it only where the tree branches.</p></div>

<h3>Where multicast is used in real networks</h3>
<ul>
<li><b>IPTV and digital signage</b>: hundreds of TV channels in a hotel or a campus. Each set-top box joins one group per channel it is showing.</li>
<li><b>Live classes and town halls</b>: a studio streams one video to every classroom or branch office. Our labs use exactly this story.</li>
<li><b>Financial market data</b>: stock exchanges publish price feeds to many trading servers at once. Every receiver must get the same tick at the same moment, so one copy per link is also the fairest and fastest design.</li>
<li><b>Software and image distribution</b>: operating system imaging tools push one image to hundreds of PCs in a lab at the same time.</li>
<li><b>Control protocols</b>: you already use multicast daily. OSPF hellos go to 224.0.0.5, EIGRP to 224.0.0.10, HSRPv2 to 224.0.0.102. Those stay on one link; this module is about multicast that crosses routers.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A 4 Mbps HD stream must reach 250 students across three branches. With unicast the studio uplink carries 250 x 4 = 1000 Mbps, which needs a 1 Gbps link just for one class, and every WAN link carries one copy per student at that branch. With multicast the studio sends 4 Mbps once; each WAN link carries 4 Mbps no matter how many students sit behind it. Adding the 251st student costs the network nothing extra.</p></div>

<h3>The pieces you will meet</h3>
<ol>
<li><b>Source</b>: the sender. It just sends UDP packets to a group address; it does not need to know who is listening.</li>
<li><b>Receivers</b>: hosts that want the stream. They tell their local router with <b>IGMP</b> (Internet Group Management Protocol). IGMP lives only on the last LAN.</li>
<li><b>Multicast routers</b>: they talk <b>PIM</b> (Protocol Independent Multicast) to each other and build a <b>distribution tree</b> from the source to every LAN that has receivers.</li>
<li><b>Rendezvous Point (RP)</b>: in sparse mode, a meeting router where sources and receivers first find each other.</li>
<li><b>Switches</b>: with <b>IGMP snooping</b> they send the stream only to the ports whose hosts asked for it.</li>
</ol>
<p>Multicast is almost always <b>UDP</b>: there is no TCP handshake with a group, so reliability, if needed, is handled by the application.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking multicast "just works" once the server sends to 239.x.x.x. By default routers do not forward multicast at all. Every router on the path needs <code>ip multicast-routing</code> and PIM on its interfaces, and receivers must actually join with IGMP.</p></div>

<div class="exam"><p><b>Exam trap.</b> A multicast group address is <b>only ever a destination</b>. The source address of a multicast packet is always the sender's normal unicast address. Any answer that shows a 224-239 address as a source is wrong.</p></div>

<div class="scn"><h4>The town hall that killed the WAN</h4><p>A company streamed the CEO town hall from HQ as a unicast web stream. At 10:00, 180 people in the Pune branch clicked play. The 200 Mbps WAN link hit 100% within a minute, VoIP calls broke up and the ERP timed out. The network team moved the stream to multicast group 239.1.50.1 with PIM sparse mode on the WAN routers. At the next town hall the branch link carried a single 3 Mbps copy regardless of how many people watched.</p><p><b>Lesson:</b> when many receivers want the same data at the same time, multicast turns load that grows with the audience into a constant.</p></div>

<div class="iv"><p class="q">"Why would you use multicast instead of unicast or broadcast?"</p><p>Strong answer: unicast sends one copy per receiver, so source and link load grow with the audience; broadcast reaches every host on the subnet, wastes CPU on uninterested hosts and never crosses routers. Multicast sends one stream to a group address, receivers opt in with IGMP, and routers replicate only where the PIM tree branches. Give a concrete use case such as IPTV or market data, and mention that it is UDP-based.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unicast = one copy per receiver; broadcast = every host on the subnet; multicast = one copy per link toward receivers that asked.</li>
<li>Typical uses: IPTV, live video, market data, OS imaging, and routing protocol control traffic.</li>
<li>Hosts join with IGMP; routers build trees with PIM; switches limit flooding with IGMP snooping.</li>
<li>A group address is only ever a destination; multicast data is almost always UDP.</li>
<li>Routers forward nothing until <code>ip multicast-routing</code> and PIM are enabled.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>Unicast, broadcast aur multicast mein fark, aur woh real applications jinhe multicast chahiye: IPTV, live classes, market data feeds aur mass software updates.</li>
<li>Multicast group addresses (224.0.0.0/4, link-local block, SSM 232/8, admin-scoped 239/8) aur ek group Ethernet MAC par kaise map hota hai (01:00:5e plus 23 bits, ek MAC par 32 groups).</li>
<li>Hosts IGMPv1, v2 aur v3 se group kaise maangte hain, querier kaise elect hota hai, aur IGMP snooping switches ko multicast flood karne se kaise rokta hai.</li>
<li>Distribution trees: source trees (S,G) aur shared trees (*,G), aur Reverse Path Forwarding (RPF) check jo inhe loop-free rakhta hai.</li>
<li>PIM dense mode (thoda sa), PIM sparse mode gehraai se (RP, register, join/prune, SPT switchover), RP discovery (static, Auto-RP, BSR), MSDP ke saath Anycast RP, PIM SSM aur bidirectional PIM.</li>
<li>IOS par yeh sab configure aur verify kaise karte hain, <code>show ip mroute</code> ka har field kaise padhte hain, aur RPF failure aur missing <code>ip pim</code> ko step by step kaise troubleshoot karte hain.</li>
</ul>
<p><b>Prerequisites:</b> CCNA-level IPv4 addressing aur subnetting, router apni routing table kaise banata hai, aur basic OSPF (ENCOR OSPF module ideal hai). Multicast ka har term yahan zero se define kiya gaya hai. Yeh module ENCOR 350-401 v1.2 ka objective 3.3.d cover karta hai: <i>multicast protocols describe karo, jaise RPF check, PIM SM, IGMP v2/v3, SSM, bidir aur MSDP</i>.</p>

<h3>Big picture: TV channel, phone call nahi</h3>
<p>Socho aap cricket match kaise dekhte ho. Broadcaster har viewer ko phone karke alag se match nahi sunata. Uske liye har viewer ki ek phone line chahiye hogi. Iski jagah woh <b>ek channel</b> transmit karta hai, aur jo bhi TV tune karta hai use picture mil jaati hai. Jo viewers interested nahi hain woh tune hi nahi karte, aur broadcaster ka kharcha same rehta hai chahe das log dekhein ya das crore.</p>
<p>IP networks mein packet deliver karne ke teen tarike hain, aur yeh is kahani par bilkul fit baithte hain:</p>
<dl class="terms">
<dt>Unicast (one to one)</dt><dd>Packet ek source se ek destination address tak jaata hai. 300 receivers tak pahunchne ke liye source ko 300 copies bhejni padti hain. Yeh phone call hai.</dd>
<dt>Broadcast (one to all)</dt><dd>Packet local subnet ke har host tak jaata hai (255.255.255.255 ya directed broadcast). Har host ko ise process karna padta hai, unko bhi jinhe parwah nahi, aur routers ise forward nahi karte. Yeh kamre mein chillana hai.</dd>
<dt>Multicast (one to many who asked)</dt><dd>Source ek <b>group address</b> par <b>ek</b> packet bhejta hai. Network use sirf wahan copy karta hai jahan path interested receivers ki taraf batt-ta hai, aur sirf un links par jo kam se kam ek receiver tak jaate hain. Yeh TV channel hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Unicast versus multicast">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Unicast: 3 receivers = 3 copies</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Multicast: har link par 1 copy</text>
<rect x="20" y="105" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="55" y="128" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<rect x="130" y="105" width="60" height="36" rx="6" fill="#bae6fd"/><text x="160" y="128" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="90" y1="115" x2="130" y2="115" stroke="#64748b" stroke-width="2"/><line x1="90" y1="123" x2="130" y2="123" stroke="#64748b" stroke-width="2"/><line x1="90" y1="131" x2="130" y2="131" stroke="#64748b" stroke-width="2"/>
<rect x="240" y="50" width="60" height="30" rx="6" fill="#fde68a"/><text x="270" y="70" text-anchor="middle" class="svg-ink" font-size="12">PC-A</text>
<rect x="240" y="108" width="60" height="30" rx="6" fill="#fde68a"/><text x="270" y="128" text-anchor="middle" class="svg-ink" font-size="12">PC-B</text>
<rect x="240" y="166" width="60" height="30" rx="6" fill="#fde68a"/><text x="270" y="186" text-anchor="middle" class="svg-ink" font-size="12">PC-C</text>
<line x1="190" y1="118" x2="240" y2="65" stroke="#64748b" stroke-width="2"/><line x1="190" y1="123" x2="240" y2="123" stroke="#64748b" stroke-width="2"/><line x1="190" y1="128" x2="240" y2="181" stroke="#64748b" stroke-width="2"/>
<text x="110" y="165" text-anchor="middle" class="svg-accent" font-size="12">3 copies</text>
<rect x="340" y="105" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="375" y="128" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<rect x="450" y="105" width="60" height="36" rx="6" fill="#bae6fd"/><text x="480" y="128" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="410" y1="123" x2="450" y2="123" stroke="#64748b" stroke-width="3"/>
<rect x="560" y="50" width="60" height="30" rx="6" fill="#fde68a"/><text x="590" y="70" text-anchor="middle" class="svg-ink" font-size="12">PC-A</text>
<rect x="560" y="108" width="60" height="30" rx="6" fill="#fde68a"/><text x="590" y="128" text-anchor="middle" class="svg-ink" font-size="12">PC-B</text>
<rect x="560" y="166" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="590" y="186" text-anchor="middle" class="svg-muted" font-size="12">PC-C (nahi)</text>
<line x1="510" y1="118" x2="560" y2="65" stroke="#64748b" stroke-width="2"/><line x1="510" y1="123" x2="560" y2="123" stroke="#64748b" stroke-width="2"/>
<text x="430" y="165" text-anchor="middle" class="svg-accent" font-size="12">1 copy</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Router packet sirf un receivers ki taraf copy karta hai jinhone group join kiya</text>
</svg><p class="cap">Unicast source par load badhata hai; multicast ek stream bhejta hai aur routers use sirf wahan replicate karte hain jahan tree ki shaakh nikalti hai.</p></div>

<h3>Real networks mein multicast kahan use hota hai</h3>
<ul>
<li><b>IPTV aur digital signage</b>: hotel ya campus mein saikdon TV channels. Har set-top box jo channel dikha raha hai uske liye ek group join karta hai.</li>
<li><b>Live classes aur town halls</b>: ek studio har classroom ya branch office ko ek video stream karta hai. Hamari labs bilkul yahi kahani use karti hain.</li>
<li><b>Financial market data</b>: stock exchanges price feeds ek saath kai trading servers ko publish karte hain. Har receiver ko same tick same pal mein milna chahiye, isliye har link par ek copy sabse fair aur sabse tez design bhi hai.</li>
<li><b>Software aur image distribution</b>: operating system imaging tools ek lab ke saikdon PCs ko ek hi samay par ek image push karte hain.</li>
<li><b>Control protocols</b>: aap multicast roz use karte ho. OSPF hellos 224.0.0.5 par jaate hain, EIGRP 224.0.0.10 par, HSRPv2 224.0.0.102 par. Yeh ek link par hi rehte hain; yeh module us multicast ke baare mein hai jo routers cross karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek 4 Mbps HD stream teen branches ke 250 students tak pahunchna hai. Unicast mein studio uplink 250 x 4 = 1000 Mbps carry karta hai, yaani sirf ek class ke liye 1 Gbps link chahiye, aur har WAN link us branch ke har student ke liye ek copy le jaata hai. Multicast mein studio 4 Mbps ek baar bhejta hai; har WAN link 4 Mbps hi le jaata hai chahe uske peeche kitne bhi students hon. 251va student jodne se network par koi extra kharcha nahi.</p></div>

<h3>Woh pieces jinse aap milenge</h3>
<ol>
<li><b>Source</b>: sender. Yeh bas group address par UDP packets bhejta hai; ise pata hone ki zaroorat nahi ki kaun sun raha hai.</li>
<li><b>Receivers</b>: woh hosts jinhe stream chahiye. Woh apne local router ko <b>IGMP</b> (Internet Group Management Protocol) se batate hain. IGMP sirf aakhri LAN par rehta hai.</li>
<li><b>Multicast routers</b>: yeh aapas mein <b>PIM</b> (Protocol Independent Multicast) bolte hain aur source se har us LAN tak <b>distribution tree</b> banate hain jahan receivers hain.</li>
<li><b>Rendezvous Point (RP)</b>: sparse mode mein ek meeting router jahan sources aur receivers pehli baar ek doosre ko dhoondhte hain.</li>
<li><b>Switches</b>: <b>IGMP snooping</b> ke saath yeh stream sirf un ports par bhejte hain jinke hosts ne maanga.</li>
</ol>
<p>Multicast lagbhag hamesha <b>UDP</b> hota hai: group ke saath TCP handshake nahi ho sakta, isliye reliability, agar chahiye, application sambhalti hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki server 239.x.x.x par bhejte hi multicast "chal jaata hai". Default mein routers multicast bilkul forward nahi karte. Path ke har router ko <code>ip multicast-routing</code> aur interfaces par PIM chahiye, aur receivers ko sach mein IGMP se join karna padta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Multicast group address <b>sirf destination</b> hota hai. Multicast packet ka source address hamesha sender ka normal unicast address hota hai. Koi bhi answer jo 224-239 address ko source dikhaye, galat hai.</p></div>

<div class="scn"><h4>Town hall jisne WAN ko maar diya</h4><p>Ek company ne CEO town hall HQ se unicast web stream ki tarah chalaya. 10:00 baje Pune branch ke 180 logon ne play dabaya. 200 Mbps WAN link ek minute mein 100% par pahunch gaya, VoIP calls toot-ne lagi aur ERP time out hone laga. Network team ne stream ko WAN routers par PIM sparse mode ke saath multicast group 239.1.50.1 par shift kiya. Agle town hall mein branch link ne sirf ek 3 Mbps copy carry ki, chahe kitne bhi log dekh rahe the.</p><p><b>Seekh:</b> jab kai receivers ko same data same samay par chahiye, multicast audience ke saath badhne wale load ko constant bana deta hai.</p></div>

<div class="iv"><p class="q">"Aap unicast ya broadcast ki jagah multicast kyun use karoge?"</p><p>Strong answer: unicast har receiver ke liye ek copy bhejta hai, isliye source aur link load audience ke saath badhta hai; broadcast subnet ke har host tak pahunchta hai, uninterested hosts ka CPU waste karta hai aur kabhi routers cross nahi karta. Multicast group address par ek stream bhejta hai, receivers IGMP se opt in karte hain, aur routers sirf wahan replicate karte hain jahan PIM tree batt-ta hai. IPTV ya market data jaisa concrete use case do, aur batao ki yeh UDP-based hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unicast = har receiver ke liye ek copy; broadcast = subnet ka har host; multicast = maangne wale receivers ki taraf har link par ek copy.</li>
<li>Typical uses: IPTV, live video, market data, OS imaging, aur routing protocol control traffic.</li>
<li>Hosts IGMP se join karte hain; routers PIM se trees banate hain; switches IGMP snooping se flooding rokte hain.</li>
<li>Group address sirf destination hota hai; multicast data lagbhag hamesha UDP hota hai.</li>
<li>Jab tak <code>ip multicast-routing</code> aur PIM on na ho, routers kuch forward nahi karte.</li>
</ul></div>
`}};export{e as default};