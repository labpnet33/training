var e={id:`goals`,h:{en:`Module goals, prerequisites and the east-west recap`,hi:`Module goals, prerequisites aur east-west ka recap`},body:{en:`
<p><b>What you will learn in this module.</b> This is the first real network module of the CCNP Data Center track. The beginner modules showed you what a data center is and refreshed the networking basics. Now you will learn how a modern data center network is actually designed and built. By the end of these ten chapters you will be able to:</p>
<ul>
<li>Explain why the classic three-tier design struggles with modern traffic, and what vPC patched.</li>
<li>Draw a spine-leaf (Clos) fabric from memory, state its wiring rules and walk a packet through it.</li>
<li>Size a fabric: count ports, calculate oversubscription and decide how many spines you need.</li>
<li>Explain Layer-2 versus Layer-3 fabrics, and the underlay/overlay split behind VXLAN EVPN and ACI.</li>
<li>Recognise the Cisco Nexus families and choose sensible leaf and spine models.</li>
<li>Describe how NX-OS is built (features, processes, high availability, VRFs, licensing).</li>
<li>Configure your first Nexus: a routed /31 uplink, a loopback and an OSPF adjacency to a spine, then verify and save it.</li>
</ul>

<h3>Prerequisites</h3>
<p>You do not need Nexus experience. You do need four things, all covered in the earlier modules:</p>
<ul>
<li><b>IPv4 addressing</b>, including what a /32 host route and a /31 point-to-point subnet are.</li>
<li><b>Switching basics</b>: MAC learning, VLANs, trunks and why Layer-2 loops are dangerous.</li>
<li><b>Routing basics</b>: what a routing table is, and the idea of an OSPF neighbor and area 0.</li>
<li><b>CLI comfort</b>: moving between exec and configuration mode on a Cisco device.</li>
</ul>
<p>If any of these feel shaky, revisit the <b>dc-net-basics</b> module first. Everything here builds on it.</p>

<h3>Where this module sits in the track</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Learning path">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">dc-intro</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">dc-net-basics</text>
<rect x="330" y="20" width="150" height="44" rx="8" fill="#fde68a"/><text x="405" y="47" text-anchor="middle" class="svg-ink" font-size="13">dc-foundations</text>
<text x="405" y="84" text-anchor="middle" class="svg-accent" font-size="12">you are here</text>
<rect x="500" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="565" y="47" text-anchor="middle" class="svg-ink" font-size="13">Underlay, vPC</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="480" y1="42" x2="500" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="110" y="147" text-anchor="middle" class="svg-ink" font-size="13">VXLAN EVPN</text>
<rect x="240" y="120" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">ACI</text>
<rect x="450" y="120" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="147" text-anchor="middle" class="svg-ink" font-size="13">Storage, UCS, automation</text>
<line x1="565" y1="64" x2="110" y2="120" stroke="#64748b" stroke-width="2"/><line x1="190" y1="142" x2="240" y2="142" stroke="#64748b" stroke-width="2"/><line x1="400" y1="142" x2="450" y2="142" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">This module gives you the vocabulary and the first configuration that every later network module assumes.</p></div>
<p>Every later module depends on this one. VXLAN EVPN is simply an overlay on the routed underlay you configure here. ACI builds the same spine-leaf shape and hides it behind a controller. Storage and compute modules plug into the leaves you learn to size. If the design ideas in this module are clear, the rest of the track feels logical instead of magical.</p>

<h3>Quick recap: north-south and east-west</h3>
<p>Draw the data center with the internet at the top. Traffic that enters or leaves the building travels up and down the drawing, so we call it <b>north-south</b>. Traffic that stays inside, from one server to another, moves sideways and is called <b>east-west</b>.</p>
<p>Twenty years ago most applications were a single big program on one server, and most traffic was north-south: a user asked, the server answered. Today an application is split into many small services (microservices), runs on virtual machines and containers that move between hosts, and reads from distributed storage and databases. One user click can cause dozens of internal calls. East-west is now the dominant direction in almost every data center.</p>

<div class="eg"><p><b>Worked example: how big is east-west?</b> An online shop handles 2,000 checkouts per second at peak. Each checkout sends one request in (north-south) and returns about 20 KB. Behind the scenes each checkout makes about 30 internal calls (cart, price, stock, payment, fraud, loyalty, logging), each moving about 50 KB.</p>
<p>North-south: 2,000 × 20 KB = 40 MB/s, about <b>0.3 Gbit/s</b>.<br>East-west: 2,000 × 30 × 50 KB = 3,000 MB/s, about <b>24 Gbit/s</b>.</p>
<p>East-west is roughly 75 times larger. Add backups, database replication and VM migrations, and the gap grows further. The network must be designed for the sideways traffic first.</p></div>

<p>Three design consequences follow directly from this recap, and you will meet each one again in the chapters ahead:</p>
<ul>
<li><b>Equal distance.</b> Any server should reach any other server in the same number of hops, so latency is predictable wherever the scheduler places a workload.</li>
<li><b>All links forwarding.</b> Bandwidth you paid for must carry traffic; no link should sit idle waiting for a failure.</li>
<li><b>Small failure domains.</b> A problem in one rack must not spread across the whole data center.</li>
</ul>

<h3>The lab you will build</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module lab topology">
<rect x="230" y="15" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.11</text>
<rect x="230" y="145" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.1</text>
<line x1="320" y1="65" x2="320" y2="145" stroke="#64748b" stroke-width="3"/>
<text x="330" y="90" class="svg-muted" font-size="12">Eth1/1 10.1.1.0/31</text>
<text x="330" y="130" class="svg-muted" font-size="12">Eth1/1 10.1.1.1/31</text>
<text x="80" y="110" class="svg-accent" font-size="12">OSPF UNDERLAY, area 0</text>
</svg><p class="cap">The hands-on lab: one new leaf joins an existing spine with a routed /31 link and OSPF.</p></div>
<p>SPINE1 already runs an OSPF process called <code>UNDERLAY</code>. LEAF1 is a brand-new Nexus. You will enable the OSPF feature, turn Ethernet1/1 into a routed port with 10.1.1.1/31, create loopback0 with 10.255.0.1/32, join area 0.0.0.0 as a point-to-point link, verify the adjacency and save. Chapter 9 walks through every command. Chapters 2 to 8 explain why the fabric is built this way, so the commands make sense.</p>

<h3>How to study this module</h3>
<ul>
<li>Read chapters 2 to 6 with a pen. Redraw every diagram yourself; the exam and interviews reward people who can sketch a fabric.</li>
<li>Do the sizing calculations in chapter 4 by hand before reading the answers.</li>
<li>Type the NX-OS commands in the lab rather than pasting them. Your fingers will remember <code>no switchport</code> and <code>/31</code>.</li>
<li>Finish with the scenarios and quiz. If you miss a question, go back to the chapter named in the explanation.</li>
</ul>

<div class="warn"><p><b>Common beginner mistake.</b> Jumping straight to configuration and skipping the design chapters. You can copy an OSPF template in five minutes, but when a spine fails or a leaf runs out of uplinks you need to understand why the fabric is shaped the way it is.</p></div>
<div class="exam"><p><b>Exam tip.</b> The DCCOR 350-601 blueprint puts network design and NX-OS operation in its largest domain. Expect questions on spine-leaf rules, oversubscription maths, underlay versus overlay, VXLAN basics and NX-OS feature behaviour.</p></div>

<div class="scn"><h4>The nightly backup that slowed the whole row</h4><p>A mid-size company ran a three-tier network. Every night at 01:00 the backup servers in row C pulled data from application servers in row A. Users on the night shift complained that the ERP system became painfully slow. The engineer checked the aggregation switch uplinks and found them at 98% utilisation, while the second uplink of each access switch sat idle because spanning tree had blocked it. The backup, a purely east-west flow, had to climb to aggregation and back down, competing with everything else. Short term, the team moved the backup window and enabled vPC so both uplinks could forward. Long term, the next refresh was designed as a spine-leaf fabric sized for east-west traffic.</p><p><b>Lesson:</b> measure and design for east-west traffic first; it is usually the biggest load in the building.</p></div>

<div class="iv"><p class="q">"What do you understand by east-west traffic, and how would it change your network design?"</p><p>Strong answer: east-west is server-to-server traffic that stays inside the data center, such as microservice calls, database replication, storage and VM migration. It now far exceeds north-south traffic. That drives three design goals: every server at equal distance (predictable latency), every link forwarding (no STP blocking), and small failure domains. Those goals lead to a routed spine-leaf fabric with ECMP. Quote a quick number, such as one user request fanning out into 20 to 30 internal calls.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module teaches fabric design (three-tier, spine-leaf, sizing, underlay/overlay), Nexus hardware, NX-OS and your first routed uplink with OSPF.</li>
<li>You need IPv4 (/31, /32), switching, basic OSPF and CLI comfort before starting.</li>
<li>East-west (server to server) traffic is far larger than north-south in modern data centers.</li>
<li>Design goals that follow: equal distance, all links forwarding, small failure domains.</li>
<li>The lab joins LEAF1 to SPINE1 with a routed /31, loopback0 and OSPF UNDERLAY area 0.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh CCNP Data Center track ka pehla asli network module hai. Beginner modules ne aapko dikhaya ki data center kya hota hai aur networking basics refresh kiye. Ab aap seekhoge ki ek modern data center network actually kaise design aur build hota hai. In das chapters ke end tak aap yeh kar paoge:</p>
<ul>
<li>Samjha paoge ki classic three-tier design modern traffic ke saath kyun struggle karta hai, aur vPC ne kya patch kiya.</li>
<li>Spine-leaf (Clos) fabric ko yaad se draw kar paoge, uske wiring rules bata paoge aur usmein ek packet ko walk kar paoge.</li>
<li>Fabric ko size kar paoge: ports ginna, oversubscription calculate karna aur decide karna ki kitne spines chahiye.</li>
<li>Layer-2 vs Layer-3 fabrics, aur VXLAN EVPN aur ACI ke peeche ka underlay/overlay split samjha paoge.</li>
<li>Cisco Nexus families pehchan paoge aur sahi leaf aur spine models chun paoge.</li>
<li>Bata paoge ki NX-OS kaise bana hai (features, processes, high availability, VRFs, licensing).</li>
<li>Apna pehla Nexus configure kar paoge: ek routed /31 uplink, ek loopback aur spine ke saath OSPF adjacency, phir use verify aur save karna.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko Nexus ka experience nahi chahiye. Lekin chaar cheezein chahiye, jo sab pehle ke modules mein cover ho chuki hain:</p>
<ul>
<li><b>IPv4 addressing</b>, jismein yeh bhi shamil hai ki /32 host route aur /31 point-to-point subnet kya hota hai.</li>
<li><b>Switching basics</b>: MAC learning, VLANs, trunks aur Layer-2 loops khatarnaak kyun hote hain.</li>
<li><b>Routing basics</b>: routing table kya hai, aur OSPF neighbor aur area 0 ka idea.</li>
<li><b>CLI comfort</b>: Cisco device par exec aur configuration mode ke beech aana-jaana.</li>
</ul>
<p>Agar inmein se kuch bhi kamzor lage, to pehle <b>dc-net-basics</b> module dobara dekho. Yahan sab kuch usi par bana hai.</p>

<h3>Yeh module track mein kahan baitha hai</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Learning path">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">dc-intro</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="13">dc-net-basics</text>
<rect x="330" y="20" width="150" height="44" rx="8" fill="#fde68a"/><text x="405" y="47" text-anchor="middle" class="svg-ink" font-size="13">dc-foundations</text>
<text x="405" y="84" text-anchor="middle" class="svg-accent" font-size="12">aap yahan ho</text>
<rect x="500" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="565" y="47" text-anchor="middle" class="svg-ink" font-size="13">Underlay, vPC</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="480" y1="42" x2="500" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="110" y="147" text-anchor="middle" class="svg-ink" font-size="13">VXLAN EVPN</text>
<rect x="240" y="120" width="160" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">ACI</text>
<rect x="450" y="120" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="147" text-anchor="middle" class="svg-ink" font-size="13">Storage, UCS, automation</text>
<line x1="565" y1="64" x2="110" y2="120" stroke="#64748b" stroke-width="2"/><line x1="190" y1="142" x2="240" y2="142" stroke="#64748b" stroke-width="2"/><line x1="400" y1="142" x2="450" y2="142" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Yeh module aapko woh vocabulary aur pehli configuration deta hai jise baad ka har network module maan kar chalta hai.</p></div>
<p>Baad ka har module is par depend karta hai. VXLAN EVPN bas us routed underlay ke upar ek overlay hai jo aap yahan configure karoge. ACI wahi spine-leaf shape banata hai aur use ek controller ke peeche chhupa deta hai. Storage aur compute modules un leaves mein plug hote hain jinhe size karna aap yahan seekhoge. Agar is module ke design ideas clear hain, to baaki track jaadu ki jagah logical lagega.</p>

<h3>Quick recap: north-south aur east-west</h3>
<p>Data center ko draw karo aur internet ko upar rakho. Jo traffic building mein aata ya bahar jaata hai woh drawing mein upar-neeche chalta hai, isliye hum use <b>north-south</b> kehte hain. Jo traffic andar hi rehta hai, ek server se dusre server tak, woh side mein chalta hai aur use <b>east-west</b> kehte hain.</p>
<p>Bees saal pehle zyada tar applications ek server par ek bada program hoti thi, aur zyada tar traffic north-south tha: user ne poocha, server ne jawab diya. Aaj ek application kai chhoti services (microservices) mein bati hoti hai, virtual machines aur containers par chalti hai jo hosts ke beech move karte hain, aur distributed storage aur databases se padhti hai. User ka ek click darjanon internal calls paida kar sakta hai. Lagbhag har data center mein ab east-west hi dominant direction hai.</p>

<div class="eg"><p><b>Worked example: east-west kitna bada hai?</b> Ek online shop peak par 2,000 checkouts per second handle karti hai. Har checkout ek request andar bhejta hai (north-south) aur lagbhag 20 KB wapas deta hai. Peeche har checkout lagbhag 30 internal calls karta hai (cart, price, stock, payment, fraud, loyalty, logging), har ek lagbhag 50 KB move karta hai.</p>
<p>North-south: 2,000 × 20 KB = 40 MB/s, lagbhag <b>0.3 Gbit/s</b>.<br>East-west: 2,000 × 30 × 50 KB = 3,000 MB/s, lagbhag <b>24 Gbit/s</b>.</p>
<p>East-west lagbhag 75 guna bada hai. Backups, database replication aur VM migrations jodo, to yeh gap aur badh jaata hai. Network ko pehle side wale traffic ke liye design karna padta hai.</p></div>

<p>Is recap se seedhe teen design consequences nikalte hain, aur aage ke chapters mein aap har ek se dobara miloge:</p>
<ul>
<li><b>Barabar doori.</b> Koi bhi server kisi bhi dusre server tak same number of hops mein pahunche, taaki scheduler workload ko kahin bhi rakhe, latency predictable rahe.</li>
<li><b>Saare links forwarding.</b> Jis bandwidth ke paise diye hain woh traffic le jaaye; koi link failure ke intezaar mein khaali na baitha rahe.</li>
<li><b>Chhote failure domains.</b> Ek rack ki problem poore data center mein na faile.</li>
</ul>

<h3>Lab jo aap banaoge</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module lab topology">
<rect x="230" y="15" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.11</text>
<rect x="230" y="145" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.1</text>
<line x1="320" y1="65" x2="320" y2="145" stroke="#64748b" stroke-width="3"/>
<text x="330" y="90" class="svg-muted" font-size="12">Eth1/1 10.1.1.0/31</text>
<text x="330" y="130" class="svg-muted" font-size="12">Eth1/1 10.1.1.1/31</text>
<text x="80" y="110" class="svg-accent" font-size="12">OSPF UNDERLAY, area 0</text>
</svg><p class="cap">Hands-on lab: ek naya leaf routed /31 link aur OSPF ke saath ek existing spine se judta hai.</p></div>
<p>SPINE1 pehle se <code>UNDERLAY</code> naam ka OSPF process chala raha hai. LEAF1 ek bilkul naya Nexus hai. Aap OSPF feature enable karoge, Ethernet1/1 ko 10.1.1.1/31 ke saath routed port banaoge, 10.255.0.1/32 ke saath loopback0 banaoge, point-to-point link ki tarah area 0.0.0.0 join karoge, adjacency verify karoge aur save karoge. Chapter 9 har command ko step by step dikhata hai. Chapters 2 se 8 samjhate hain ki fabric aise kyun banta hai, taaki commands ka matlab samajh aaye.</p>

<h3>Is module ko kaise padhein</h3>
<ul>
<li>Chapters 2 se 6 pen ke saath padho. Har diagram khud dobara draw karo; exam aur interviews un logon ko reward karte hain jo fabric sketch kar sakte hain.</li>
<li>Chapter 4 ki sizing calculations answers padhne se pehle haath se karo.</li>
<li>Lab mein NX-OS commands paste karne ki jagah type karo. Aapki ungliyan <code>no switchport</code> aur <code>/31</code> yaad rakhengi.</li>
<li>End mein scenarios aur quiz karo. Agar koi question galat ho, to explanation mein bataye gaye chapter par wapas jao.</li>
</ul>

<div class="warn"><p><b>Beginners ki common galti.</b> Design chapters skip karke seedhe configuration par kood jaana. OSPF template aap paanch minute mein copy kar sakte ho, lekin jab spine fail hota hai ya leaf ke uplinks khatam ho jaate hain, tab aapko samajhna padta hai ki fabric ka shape aisa kyun hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> DCCOR 350-601 blueprint network design aur NX-OS operation ko apne sabse bade domain mein rakhta hai. Spine-leaf rules, oversubscription maths, underlay vs overlay, VXLAN basics aur NX-OS feature behaviour par questions expect karo.</p></div>

<div class="scn"><h4>Raat ka backup jisne poori row slow kar di</h4><p>Ek mid-size company three-tier network chalati thi. Har raat 01:00 baje row C ke backup servers row A ke application servers se data kheenchte the. Night shift ke users ne complain kiya ki ERP system bahut slow ho jaata hai. Engineer ne aggregation switch ke uplinks check kiye aur unhe 98% utilisation par paaya, jabki har access switch ka dusra uplink khaali baitha tha kyunki spanning tree ne use block kar diya tha. Backup, jo poora east-west flow tha, ko aggregation tak chadh kar wapas neeche aana padta tha, baaki sab traffic se competition karte hue. Short term mein team ne backup window shift ki aur vPC enable kiya taaki dono uplinks forward kar sakein. Long term mein agla refresh east-west traffic ke hisaab se size kiye gaye spine-leaf fabric ki tarah design hua.</p><p><b>Seekh:</b> pehle east-west traffic ko measure aur design karo; building mein aam taur par wahi sabse bada load hota hai.</p></div>

<div class="iv"><p class="q">"East-west traffic se aap kya samajhte ho, aur yeh aapke network design ko kaise badlega?"</p><p>Strong answer: east-west server-to-server traffic hai jo data center ke andar rehta hai, jaise microservice calls, database replication, storage aur VM migration. Yeh ab north-south traffic se kahin zyada hai. Isse teen design goals nikalte hain: har server barabar doori par (predictable latency), har link forwarding (STP blocking nahi), aur chhote failure domains. Yeh goals routed spine-leaf fabric aur ECMP tak le jaate hain. Ek quick number bolo, jaise ek user request ka 20 se 30 internal calls mein fail jaana.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module fabric design (three-tier, spine-leaf, sizing, underlay/overlay), Nexus hardware, NX-OS aur OSPF ke saath aapka pehla routed uplink sikhata hai.</li>
<li>Shuru karne se pehle IPv4 (/31, /32), switching, basic OSPF aur CLI comfort chahiye.</li>
<li>Modern data centers mein east-west (server se server) traffic north-south se kahin bada hai.</li>
<li>Isse nikalne wale design goals: barabar doori, saare links forwarding, chhote failure domains.</li>
<li>Lab LEAF1 ko routed /31, loopback0 aur OSPF UNDERLAY area 0 ke saath SPINE1 se jodta hai.</li>
</ul></div>
`}};export{e as default};