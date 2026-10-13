var e={id:`rpf-overview`,h:{en:`Overview: RPF explained from nothing`,hi:`Overview: RPF bilkul shuru se`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn why a multicast packet can be dropped even when every PIM neighbour is up and every receiver has joined. You will learn how a router decides which interface a multicast packet is allowed to arrive on (the <b>RPF check</b>), how to change that decision safely with a static multicast route, how to read <code>show ip mroute</code> line by line, and a layered method that finds a fault from the receiver back to the source, across several cities. You will practise on four troubleshooting labs, ending with a four-city capstone.</p>
<p><b>Prerequisites.</b> The modules <b>Multicast and QoS from zero</b>, <b>Multicast addressing, IGMP and IGMP snooping</b>, <b>PIM sparse mode and SSM</b> and <b>Rendezvous points</b>. You should know what a group address is, what IGMP does on a receiver LAN, what a PIM neighbour is and what an RP is. We do not re-teach them here.</p>

<h3>Start with a story: the one-way post office</h3>
<p>Imagine a city sorting office that receives parcels addressed to a thousand shops. Every parcel is copied and sent on to every shop that asked for it. One day a parcel comes in through the <b>staff side door</b> instead of the loading bay. Is it really a new parcel, or is it a copy that another sorting office sent out and that has been travelling around the city in a circle? The sorting office cannot tell by looking at the label. So it uses a simple rule: <i>"A parcel from sender S is accepted only if it arrives through the door that I would use to send a parcel back to S."</i> Anything arriving through any other door is a copy that took a wrong road, and it is thrown away.</p>
<p>That rule is the <b>Reverse Path Forwarding (RPF) check</b>. "Reverse path" means: look at the path <i>back</i> to the source, and compare it with the interface the packet arrived on.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="RPF check accepts the packet on the interface toward the source and drops it on the other interface">
<rect x="250" y="80" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">Router R3</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">route to S: via Gi0/2</text>
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">Source S</text>
<rect x="20" y="160" width="130" height="44" rx="8" fill="#fed7aa"/><text x="85" y="187" text-anchor="middle" class="svg-ink" font-size="13">Other path</text>
<line x1="150" y1="42" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="150" y1="182" x2="250" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="175" y="60" class="svg-accent" font-size="12">Gi0/2: ACCEPT</text><text x="175" y="176" class="svg-accent" font-size="12">Gi0/1: DROP</text>
<rect x="470" y="95" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="545" y="120" text-anchor="middle" class="svg-ink" font-size="13">Receivers (OIL)</text>
<line x1="390" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The router compares the arrival interface with the interface its own routing table uses to reach the source.</p></div>

<h3>Why multicast needs it and unicast does not</h3>
<p>A unicast packet has a destination, and a router just looks up that destination. If the network has a loop, the TTL eventually kills the packet. A multicast packet has no single destination: a router must <b>copy</b> it to several outgoing interfaces. In a network with redundant links, copies can come back around a loop, and each pass multiplies the copies. Without a defence, one stream could grow into a storm. The RPF check is that defence, and it needs no extra protocol: PIM simply <b>borrows the unicast routing table</b>. That is why PIM is called protocol independent.</p>

<h3>The important consequence</h3>
<p>The RPF check ties multicast to unicast routing. If someone changes an OSPF cost, shuts a link or adds a static route, the interface that unicast uses toward the source can change, and multicast breaks without a single multicast command being touched. This is the single most common multicast outage in real networks, and it is why this module exists.</p>
<table class="cmp"><tr><th>For this tree</th><th>RPF looks toward</th><th>Used by</th></tr>
<tr><td>Shared tree (*,G)</td><td>the <b>RP</b> address</td><td>joins sent hop by hop to the RP</td></tr>
<tr><td>Source tree (S,G)</td><td>the <b>source</b> address</td><td>joins sent toward the source after SPT switchover</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Sahyadri University streams a lecture from a studio PC. R3 in the Pune hall has two paths toward the RP: the R2 link (cost 1) and a backup link through R1. A maintenance plan changes the cost of the R2 link to 100. OSPF now prefers the backup, which has no PIM. R3 is still PIM-neighbour with R2, the hall PC still joined, but R3 sends its join out of the backup link where nobody speaks PIM, and the (*,G) entry shows <code>Incoming interface: Null</code>. The video never arrives. Nothing in the multicast configuration was wrong.</p></div>

<div class="warn"><p><b>Common mistake.</b> Staring at PIM neighbours and IGMP when the real cause is a unicast routing change. Always ask: "did unicast routing toward the source or RP change recently?"</p></div>

<div class="scn"><h4>The black screen after the maintenance window</h4><p>A university lecture hall lost its live feed on Monday morning. IGMP was fine, PIM neighbours were up, the RP answered. The engineer ran <code>show ip rpf</code> toward the RP and saw an interface with a note that PIM was not enabled on it. Sunday's maintenance had raised an OSPF cost, which moved the unicast best path onto a backup cable.</p><p><b>Lesson:</b> multicast follows unicast. Check the RPF interface before touching anything else.</p></div>

<div class="iv"><p class="q">"Why is PIM called protocol independent?"</p><p>A strong answer: PIM builds no routing table of its own. It uses whatever unicast protocol (or static route) fills the routing table to perform the RPF check and to find the way toward the RP and the source. The same PIM works with OSPF, EIGRP, IS-IS or BGP. Mention that this is also why a unicast change can break multicast.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The RPF check accepts a multicast packet only on the interface the router would use to reach the source (or the RP on the shared tree).</li>
<li>It exists to stop loops when packets are copied to many interfaces.</li>
<li>PIM borrows the unicast routing table, so unicast changes can silently break multicast.</li>
<li>Shared tree RPF looks toward the RP, source tree RPF looks toward the source.</li>
<li>Four labs in this module: a cost change, an IPTV branch, two faults in one tree, and a four-city capstone.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki multicast packet tab bhi kyun drop ho sakta hai jab har PIM neighbour up hai aur har receiver ne join kar liya hai. Aap seekhoge ki router kaise decide karta hai ki multicast packet kis interface par aa sakta hai (<b>RPF check</b>), us decision ko static multicast route se safely kaise badlein, <code>show ip mroute</code> ko line by line kaise padhein, aur ek layered method jo receiver se source tak, kai shehron ke paar, fault dhoondhta hai. Aap chaar troubleshooting labs par practice karoge, aur aakhir mein chaar-city capstone.</p>
<p><b>Prerequisites.</b> Modules <b>Multicast and QoS from zero</b>, <b>Multicast addressing, IGMP and IGMP snooping</b>, <b>PIM sparse mode and SSM</b> aur <b>Rendezvous points</b>. Aapko pata hona chahiye group address kya hai, receiver LAN par IGMP kya karta hai, PIM neighbour kya hai aur RP kya hai. Inhe hum yahan dobara nahi sikhate.</p>

<h3>Ek kahani se shuru karo: one-way post office</h3>
<p>Socho ek shehar ka sorting office hai jise hazaar dukaano ke naam ke parcels milte hain. Har parcel ki copy banti hai aur har us dukaan ko jaati hai jisne maanga tha. Ek din ek parcel loading bay ki jagah <b>staff side door</b> se aata hai. Kya yeh sach mein naya parcel hai, ya kisi doosre sorting office ki bheji hui copy hai jo shehar mein chakkar kaat rahi hai? Label dekhkar sorting office nahi bata sakta. Isliye woh ek simple rule use karta hai: <i>"Sender S ka parcel tabhi accept hoga jab woh usi darwaze se aaye jisse main S ko parcel wapas bhejta."</i> Kisi aur darwaze se aaya parcel galat raste se aayi copy hai, aur phenk diya jaata hai.</p>
<p>Yahi rule <b>Reverse Path Forwarding (RPF) check</b> hai. "Reverse path" ka matlab: source tak <i>wapas</i> jaane wala raasta dekho, aur use packet ke aane wale interface se compare karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="RPF check source ki taraf wale interface par packet accept karta hai aur doosre par drop">
<rect x="250" y="80" width="140" height="70" rx="10" fill="#bae6fd"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">Router R3</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">S tak route: Gi0/2 se</text>
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">Source S</text>
<rect x="20" y="160" width="130" height="44" rx="8" fill="#fed7aa"/><text x="85" y="187" text-anchor="middle" class="svg-ink" font-size="13">Doosra raasta</text>
<line x1="150" y1="42" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="150" y1="182" x2="250" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="175" y="60" class="svg-accent" font-size="12">Gi0/2: ACCEPT</text><text x="175" y="176" class="svg-accent" font-size="12">Gi0/1: DROP</text>
<rect x="470" y="95" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="545" y="120" text-anchor="middle" class="svg-ink" font-size="13">Receivers (OIL)</text>
<line x1="390" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Router arrival interface ko us interface se compare karta hai jo uski routing table source tak pahunchne ke liye use karti hai.</p></div>

<h3>Multicast ko iski zaroorat kyun hai aur unicast ko kyun nahi</h3>
<p>Unicast packet ka ek destination hota hai, router bas use lookup karta hai. Network mein loop ho to TTL aakhir packet ko maar deta hai. Multicast packet ka ek destination nahi hota: router ko use kai outgoing interfaces par <b>copy</b> karna padta hai. Redundant links wale network mein copies loop se ghoom kar wapas aa sakti hain, aur har chakkar copies badhata hai. Bachaav ke bina ek stream storm ban sakti hai. RPF check wahi bachaav hai, aur ise koi extra protocol nahi chahiye: PIM bas <b>unicast routing table udhaar leta hai</b>. Isiliye PIM ko protocol independent kehte hain.</p>

<h3>Sabse zaroori nateeja</h3>
<p>RPF check multicast ko unicast routing se baandh deta hai. Agar koi OSPF cost badle, link shut kare ya static route jode, to source ki taraf unicast jo interface use karta hai woh badal sakta hai, aur ek bhi multicast command chhue bina multicast toot jaata hai. Asli networks mein yeh sabse aam multicast outage hai, aur isiliye yeh module hai.</p>
<table class="cmp"><tr><th>Is tree ke liye</th><th>RPF dekhta hai</th><th>Kaun use karta hai</th></tr>
<tr><td>Shared tree (*,G)</td><td><b>RP</b> address ki taraf</td><td>joins hop by hop RP tak jaate hain</td></tr>
<tr><td>Source tree (S,G)</td><td><b>source</b> address ki taraf</td><td>SPT switchover ke baad joins source ki taraf jaate hain</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Sahyadri University studio PC se lecture stream karta hai. Pune hall ke R3 ke paas RP tak do raaste hain: R2 link (cost 1) aur R1 ke through backup link. Maintenance plan R2 link ki cost 100 kar deti hai. OSPF ab backup ko pasand karta hai, jis par PIM nahi hai. R3 ab bhi R2 ka PIM neighbour hai, hall ka PC ab bhi joined hai, par R3 apna join backup link se bhejta hai jahan koi PIM nahi bolta, aur (*,G) entry <code>Incoming interface: Null</code> dikhati hai. Video kabhi nahi aata. Multicast configuration mein kuch galat nahi tha.</p></div>

<div class="warn"><p><b>Aam galti.</b> PIM neighbours aur IGMP ko ghoorna jabki asli karan unicast routing change hai. Hamesha poochho: "Kya source ya RP ki taraf unicast routing haal mein badli?"</p></div>

<div class="scn"><h4>Maintenance window ke baad black screen</h4><p>Ek university lecture hall ka live feed Monday subah band ho gaya. IGMP theek tha, PIM neighbours up the, RP jawab de raha tha. Engineer ne RP ki taraf <code>show ip rpf</code> chalaya aur ek aisa interface dekha jis par note tha ki PIM enabled nahi hai. Sunday ki maintenance ne ek OSPF cost badhai thi, jisse unicast best path backup cable par chala gaya.</p><p><b>Lesson:</b> multicast unicast ko follow karta hai. Kuch aur chhune se pehle RPF interface check karo.</p></div>

<div class="iv"><p class="q">"PIM ko protocol independent kyun kehte hain?"</p><p>Strong jawab: PIM apni koi routing table nahi banata. Woh jo bhi unicast protocol (ya static route) routing table bharta hai use RPF check ke liye aur RP aur source ki taraf ka raasta dhoondhne ke liye use karta hai. Wahi PIM OSPF, EIGRP, IS-IS ya BGP ke saath chalta hai. Yeh bhi batao ki isiliye unicast change multicast tod sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPF check multicast packet tabhi accept karta hai jab woh us interface par aaye jisse router source (ya shared tree par RP) tak jaata.</li>
<li>Yeh loops rokne ke liye hai jab packet kai interfaces par copy hota hai.</li>
<li>PIM unicast routing table udhaar leta hai, isliye unicast changes chupke se multicast tod sakte hain.</li>
<li>Shared tree RPF RP ki taraf dekhta hai, source tree RPF source ki taraf.</li>
<li>Is module mein chaar labs: cost change, IPTV branch, ek tree mein do faults, aur chaar-city capstone.</li>
</ul></div>
`}};export{e as default};