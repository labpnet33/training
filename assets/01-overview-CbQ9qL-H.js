var e={id:`overview`,h:{en:`Multicast on Junos: what you will learn and the big picture`,hi:`Junos par Multicast: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how an enterprise delivers one stream, such as a live class video, a stock ticker or a software image, to many receivers without sending a copy per receiver. You will configure and verify IGMP, IGMP snooping on switches, PIM sparse mode, rendezvous points (static, bootstrap and anycast with MSDP), source-specific multicast (SSM), and the RPF check that decides whether any of it works. These are the multicast objectives of JNCIP-ENT (JN0-650).</p>
<p><b>Prerequisites.</b> You need a working unicast network: OSPF or IS-IS reachability between all routers, and basic VLANs on a switch. Multicast is built on top of unicast routing, so if unicast is broken multicast will be broken too.</p>

<h3>Analogy: a TV channel instead of a phone call</h3>
<p>Imagine a training centre that wants to show a live class to 200 trainees. With <b>unicast</b> the server phones each trainee separately: 200 calls, 200 times the bandwidth. With <b>multicast</b> the server broadcasts <i>one</i> channel, and only trainees who tuned in receive it. Routers are the cable network: they copy the stream only where somebody is watching. The <b>group address</b> is the channel number. <b>IGMP</b> is the trainee pressing "tune in". <b>PIM</b> is how cable routers agree on which wires carry the channel. The <b>rendezvous point (RP)</b> is the meeting place where sources and receivers first find each other.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Multicast overview">
<rect x="20" y="70" width="110" height="60" rx="10" fill="#fde68a"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="14">Source</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="12">sends once</text>
<rect x="180" y="70" width="90" height="60" rx="10" fill="#bae6fd"/><text x="225" y="105" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="320" y="70" width="90" height="60" rx="10" fill="#bae6fd"/><text x="365" y="105" text-anchor="middle" class="svg-ink" font-size="14">R2 (RP)</text>
<rect x="460" y="20" width="90" height="50" rx="10" fill="#bbf7d0"/><text x="505" y="50" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="460" y="130" width="90" height="50" rx="10" fill="#ddd6fe"/><text x="505" y="160" text-anchor="middle" class="svg-ink" font-size="14">R4</text>
<rect x="580" y="20" width="50" height="50" rx="10" fill="#bbf7d0"/><text x="605" y="50" text-anchor="middle" class="svg-ink" font-size="12">PC</text>
<line x1="130" y1="100" x2="180" y2="100" stroke="#64748b" stroke-width="2"/><line x1="270" y1="100" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="410" y1="85" x2="460" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="460" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="550" y1="45" x2="580" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="480" y="105" class="svg-accent" font-size="12">copy only where members exist</text>
</svg><p class="cap">One stream in, copies made only toward interested receivers.</p></div>

<h3>The pieces of the puzzle</h3>
<table class="cmp"><tr><th>Piece</th><th>Where it works</th><th>Job</th></tr>
<tr><td>Group address</td><td>everywhere</td><td>Names the channel (239.61.1.1)</td></tr>
<tr><td>IGMP</td><td>host to first router</td><td>Hosts join and leave groups</td></tr>
<tr><td>IGMP snooping</td><td>Layer 2 switch</td><td>Stops flooding to ports without members</td></tr>
<tr><td>PIM sparse mode</td><td>router to router</td><td>Builds the delivery tree</td></tr>
<tr><td>RP, BSR, anycast RP, MSDP</td><td>core</td><td>Lets sources and receivers meet</td></tr>
<tr><td>SSM</td><td>last hop</td><td>Joins a named source directly, no RP</td></tr>
<tr><td>RPF check</td><td>every router</td><td>Loop prevention: accept data only from the direction of the source</td></tr></table>

<h3>Your three labs</h3>
<ul>
<li><b>jmc-pimsm-snoop:</b> a training video from SRC (10.61.10.50) to group 239.61.1.1 through R1, R2-CORE (the RP) and R3 to switch SW1; two trainees watch, the third must stay quiet.</li>
<li><b>jmc-anycast-msdp:</b> two RPs share the address 10.62.255.100 with an MSDP mesh group; a source and a receiver are served by different RPs.</li>
<li><b>jmc-ssm-rpf-fix:</b> a market-data ticker 10.63.10.50 sends to 232.63.1.1 with no RP, but an RPF failure and IGMPv2 keep it silent.</li>
</ul>
<p>Every output in this module is from those labs, captured from the simulator.</p>

<div class="eg"><p><b>Worked example.</b> A source sends a 4 Mbit/s video. With 200 trainees on unicast the source link carries 800 Mbit/s. With multicast it carries 4 Mbit/s, and each router link carries 4 Mbit/s no matter how many receivers sit behind it. The saving grows with the audience.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating multicast as a Layer 3 feature only. Receivers are usually on a switch, and a switch without IGMP snooping floods multicast to every port in the VLAN, which can saturate access links.</p></div>
<div class="exam"><p><b>Exam trap.</b> PIM does not build its own routing table. It uses the unicast routing table (or a dedicated multicast RPF table) to decide the RPF interface. A multicast problem is very often a unicast or RPF problem.</p></div>

<div class="scn"><h4>The all-hands video that froze Wi-Fi</h4><p>A company streamed a 6 Mbit/s executive broadcast to a campus. Each laptop pulled its own unicast stream, and the access layer collapsed. After the team enabled PIM on the routers and IGMP snooping on the switches, the same broadcast used one stream per link and the problem vanished.</p><p><b>Lesson:</b> multicast turns a per-receiver cost into a per-link cost.</p></div>

<div class="iv"><p class="q">"What problem does multicast solve and how do receivers join?"</p><p>It sends one copy of a stream to many receivers by replicating packets inside the network only where members exist. Receivers join a group with IGMP; the last-hop router then uses PIM to build a tree toward the source or RP. A strong answer adds IGMP snooping on switches and the RPF check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast replicates inside the network, so source cost does not grow with receivers.</li>
<li>IGMP is host to router; PIM is router to router; the RP is the meeting point in sparse mode.</li>
<li>Switches need IGMP snooping or they flood the group.</li>
<li>SSM removes the RP by naming the source.</li>
<li>The RPF check ties multicast to unicast routing.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki enterprise ek stream, jaise live class video, stock ticker ya software image, bahut saare receivers tak kaise pahunchata hai bina har receiver ke liye alag copy bheje. Aap IGMP, switches par IGMP snooping, PIM sparse mode, rendezvous points (static, bootstrap aur MSDP ke saath anycast), source-specific multicast (SSM), aur RPF check configure aur verify karoge jo tay karta hai ki yeh sab chalega ya nahi. Yeh JNCIP-ENT (JN0-650) ke multicast objectives hain.</p>
<p><b>Prerequisites.</b> Aapko kaam karta hua unicast network chahiye: sabhi routers ke beech OSPF ya IS-IS reachability, aur switch par basic VLANs. Multicast unicast routing ke upar banta hai, isliye unicast toota ho to multicast bhi toota hoga.</p>

<h3>Analogy: phone call ki jagah TV channel</h3>
<p>Socho ek training centre 200 trainees ko live class dikhana chahta hai. <b>Unicast</b> mein server har trainee ko alag phone karta hai: 200 calls, 200 guna bandwidth. <b>Multicast</b> mein server <i>ek</i> channel broadcast karta hai, aur sirf woh trainees receive karte hain jinhone tune kiya. Routers cable network hain: woh stream ko sirf wahin copy karte hain jahan koi dekh raha ho. <b>Group address</b> channel number hai. <b>IGMP</b> trainee ka "tune in" dabana hai. <b>PIM</b> woh tareeka hai jisse cable routers tay karte hain ki channel kaun si wires par jayega. <b>Rendezvous point (RP)</b> milne ki jagah hai jahan sources aur receivers pehli baar ek doosre ko dhoondhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Multicast overview">
<rect x="20" y="70" width="110" height="60" rx="10" fill="#fde68a"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="14">Source</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="12">ek baar bhejta hai</text>
<rect x="180" y="70" width="90" height="60" rx="10" fill="#bae6fd"/><text x="225" y="105" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="320" y="70" width="90" height="60" rx="10" fill="#bae6fd"/><text x="365" y="105" text-anchor="middle" class="svg-ink" font-size="14">R2 (RP)</text>
<rect x="460" y="20" width="90" height="50" rx="10" fill="#bbf7d0"/><text x="505" y="50" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<rect x="460" y="130" width="90" height="50" rx="10" fill="#ddd6fe"/><text x="505" y="160" text-anchor="middle" class="svg-ink" font-size="14">R4</text>
<rect x="580" y="20" width="50" height="50" rx="10" fill="#bbf7d0"/><text x="605" y="50" text-anchor="middle" class="svg-ink" font-size="12">PC</text>
<line x1="130" y1="100" x2="180" y2="100" stroke="#64748b" stroke-width="2"/><line x1="270" y1="100" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><line x1="410" y1="85" x2="460" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="115" x2="460" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="550" y1="45" x2="580" y2="45" stroke="#64748b" stroke-width="2"/>
<text x="480" y="105" class="svg-accent" font-size="12">copy sirf jahan members hain</text>
</svg><p class="cap">Ek stream andar, copies sirf interested receivers ki taraf.</p></div>

<h3>Puzzle ke hisse</h3>
<table class="cmp"><tr><th>Hissa</th><th>Kahan kaam karta hai</th><th>Kaam</th></tr>
<tr><td>Group address</td><td>har jagah</td><td>Channel ka naam (239.61.1.1)</td></tr>
<tr><td>IGMP</td><td>host se pehle router tak</td><td>Hosts group join aur leave karte hain</td></tr>
<tr><td>IGMP snooping</td><td>Layer 2 switch</td><td>Members ke bina ports par flooding rokta hai</td></tr>
<tr><td>PIM sparse mode</td><td>router se router</td><td>Delivery tree banata hai</td></tr>
<tr><td>RP, BSR, anycast RP, MSDP</td><td>core</td><td>Sources aur receivers ko milne deta hai</td></tr>
<tr><td>SSM</td><td>last hop</td><td>Named source ko seedha join karta hai, RP nahi</td></tr>
<tr><td>RPF check</td><td>har router</td><td>Loop prevention: data sirf source ki direction se accept karo</td></tr></table>

<h3>Aapke teen labs</h3>
<ul>
<li><b>jmc-pimsm-snoop:</b> SRC (10.61.10.50) se group 239.61.1.1 par training video, R1, R2-CORE (RP) aur R3 ke through switch SW1 tak; do trainees dekhte hain, teesre ko chup rehna hai.</li>
<li><b>jmc-anycast-msdp:</b> do RPs address 10.62.255.100 share karte hain, MSDP mesh group ke saath; source aur receiver alag RPs se jude hain.</li>
<li><b>jmc-ssm-rpf-fix:</b> market-data ticker 10.63.10.50, 232.63.1.1 par bina RP ke bhejta hai, lekin RPF failure aur IGMPv2 use chup rakhte hain.</li>
</ul>
<p>Is module ka har output unhi labs ka hai, simulator se capture kiya hua.</p>

<div class="eg"><p><b>Worked example.</b> Source 4 Mbit/s video bhejta hai. 200 trainees ke liye unicast par source link 800 Mbit/s carry karta hai. Multicast mein woh 4 Mbit/s carry karta hai, aur har router link 4 Mbit/s carry karta hai chahe peeche kitne bhi receivers hon. Audience badhne ke saath bachat badhti hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Multicast ko sirf Layer 3 feature samajhna. Receivers aam taur par switch par hote hain, aur IGMP snooping ke bina switch multicast ko VLAN ke har port par flood karta hai, jisse access links saturate ho sakte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> PIM apni routing table nahi banata. Woh RPF interface tay karne ke liye unicast routing table (ya dedicated multicast RPF table) use karta hai. Multicast problem aksar unicast ya RPF problem hoti hai.</p></div>

<div class="scn"><h4>All-hands video jisne Wi-Fi jam kar diya</h4><p>Ek company ne campus ko 6 Mbit/s ka executive broadcast stream kiya. Har laptop ne apni unicast stream kheenchi aur access layer baith gayi. Team ne routers par PIM aur switches par IGMP snooping on kiya, to wahi broadcast har link par ek stream use karne laga aur problem khatam ho gayi.</p><p><b>Lesson:</b> multicast per-receiver cost ko per-link cost bana deta hai.</p></div>

<div class="iv"><p class="q">"Multicast kaunsi problem solve karta hai aur receivers join kaise karte hain?"</p><p>Yeh ek stream ki ek hi copy bahut receivers tak bhejta hai, network ke andar packets sirf wahan replicate karke jahan members hain. Receivers IGMP se group join karte hain; last-hop router phir PIM se source ya RP ki taraf tree banata hai. Achha jawab switches par IGMP snooping aur RPF check bhi jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast network ke andar replicate karta hai, isliye source ka cost receivers ke saath nahi badhta.</li>
<li>IGMP host se router, PIM router se router; sparse mode mein RP milne ki jagah hai.</li>
<li>Switches ko IGMP snooping chahiye warna woh group flood karte hain.</li>
<li>SSM source ka naam lekar RP hata deta hai.</li>
<li>RPF check multicast ko unicast routing se jodta hai.</li>
</ul></div>
`}};export{e as default};