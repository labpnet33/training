var e={id:`overview`,h:{en:`Overview: group membership and the radio-channel idea`,hi:`Overview: group membership aur radio-channel ka idea`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a multicast stream is named (the group address), how a receiver tells the network it wants that stream (IGMP), how routers decide who is listening on a LAN (the querier and the membership table), and how an Ethernet switch avoids flooding the stream to every port (IGMP snooping). You will configure and verify all of it on a router, read the output, and walk a method that finds out why a receiver does not get its stream. <b>Prerequisites:</b> IPv4 addressing and subnets, VLANs and basic switching, and the first module of this track (Multicast and QoS from zero). You do not need to know PIM yet; the next module teaches it, and this module only previews where it fits.</p>

<h3>Start with an analogy: an FM radio channel</h3>
<p>A radio station transmits once. It does not know who is listening and it does not keep a list of listeners. Anybody who tunes the dial to 98.3 hears it, and the station spends the same effort whether ten or ten thousand people listen. Now compare that with a phone call to each listener: the station would need one call per person, and its cost would grow with every new listener.</p>
<p>Multicast works like the radio. The <b>group address</b> (for example 239.20.1.1) is the frequency. The <b>source</b> is the transmitter. A <b>receiver</b> is a radio. Tuning the dial is the <b>IGMP join</b>: a small message that says "I want group 239.20.1.1". The router on the receiver's LAN is the local relay tower: it only needs to know whether at least one radio on its LAN is tuned in, so it can keep relaying the channel onto that LAN or stop.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where IGMP, snooping and PIM sit">
<rect x="10" y="85" width="100" height="50" rx="8" fill="#fde68a"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">Source</text><text x="60" y="125" text-anchor="middle" class="svg-muted" font-size="11">sends to 239.20.1.1</text>
<rect x="160" y="85" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="210" y="115" text-anchor="middle" class="svg-ink" font-size="13">Router A</text>
<rect x="310" y="85" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="360" y="115" text-anchor="middle" class="svg-ink" font-size="13">Router B</text>
<rect x="450" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="490" y="115" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="560" y="20" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="595" y="45" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="560" y="95" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="595" y="120" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="560" y="170" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="595" y="195" text-anchor="middle" class="svg-ink" font-size="12">PC3</text>
<line x1="110" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="2"/><line x1="260" y1="110" x2="310" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="110" x2="450" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="100" x2="560" y2="40" stroke="#64748b" stroke-width="2"/><line x1="530" y1="115" x2="560" y2="115" stroke="#64748b" stroke-width="2"/><line x1="530" y1="130" x2="560" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="285" y="72" text-anchor="middle" class="svg-accent" font-size="12">PIM (next module)</text>
<text x="500" y="180" text-anchor="middle" class="svg-accent" font-size="12">IGMP: hosts to router</text>
<text x="500" y="200" text-anchor="middle" class="svg-accent" font-size="12">Snooping: switch listens</text>
</svg><p class="cap">IGMP is the last-hop language between receivers and their router. PIM carries the tree between routers. Snooping lets the switch copy the IGMP conversation.</p></div>

<h3>The three pieces of this module</h3>
<dl class="terms">
<dt>Group address</dt><dd>The IPv4 destination that names a stream, taken from 224.0.0.0/4. Chapter 2.</dd>
<dt>IGMP</dt><dd>Internet Group Management Protocol. Hosts report which groups they want and routers ask who is still listening. Chapters 3, 4 and 5.</dd>
<dt>IGMP snooping</dt><dd>A switch feature that reads IGMP messages so multicast frames go only to member ports. Chapters 6 and 7.</dd>
</dl>
<p>Everything in the next modules (PIM, rendezvous points, RPF) starts from the membership that IGMP creates. If a receiver never becomes a member on its router, the best PIM design in the world carries nothing to it. That is why the troubleshooting chapter of this module starts at the receiver and works upward.</p>

<h3>Why multicast exists: the arithmetic</h3>
<div class="eg"><p><b>Worked example.</b> Sahyadri University streams a live lecture at 2 Mbps to 400 hostel students. With unicast the studio would send 400 separate copies: 400 x 2 Mbps = 800 Mbps leaving the studio and crossing the campus core. With multicast the source sends one 2 Mbps stream. The network copies it only where paths split, so each link carries at most 2 Mbps whether 4 or 400 students watch. The source load is the same for one receiver or a million.</p></div>

<h3>What a multicast packet looks like</h3>
<p>A multicast packet is an ordinary UDP-over-IP packet whose destination address is a group address. There is no connection and no acknowledgement: the source cannot know who receives. Because the transport is UDP, a lost packet is simply gone, so applications use buffers, forward error correction or tolerate small losses. This also means a faulty network does not warn the source; the symptom is always at the receiver, which is why troubleshooting begins there.</p>

<div class="warn"><p><b>Common beginner mistakes.</b> Thinking the source needs to know its receivers (it does not). Thinking IGMP carries the stream (it only carries membership; the stream is carried by the data plane and the routing protocol, PIM). Thinking a switch understands multicast groups by default (it does not; without snooping it floods).</p></div>

<div class="scn"><h4>The lecture that nobody could see</h4><p>Sahyadri University enabled multicast for its live lectures. Students in Hostel B saw a black screen while Hostel A was fine. The network team did not start with the core. They went to the Hostel B router and asked one question: does this router list the lecture group in its IGMP table? It did not. The interface toward Hostel B had never been given PIM, so IGMP was switched off on it and the students' joins were ignored. Ten minutes later the group appeared and the video started.</p><p><b>Lesson:</b> start at the receiver. If the group is not in the IGMP table of the last-hop router, nothing upstream matters yet.</p></div>

<div class="iv"><p class="q">"What problem does multicast solve, and what is IGMP's role in it?"</p><p>Strong answer: multicast delivers one stream to many receivers without one copy per receiver, so source and link load stay constant as the audience grows. IGMP is the protocol between hosts and their local router: hosts report the groups they want, the router periodically asks who is still interested, and the membership it learns is what makes the router build a tree toward the source. IGMP does not carry data and does not build the tree between routers; PIM does that.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast = one stream, many receivers; the group address is the "channel".</li>
<li>IGMP runs between hosts and the last-hop router; PIM runs between routers; snooping runs on switches.</li>
<li>The source never knows its receivers; the network builds the tree from membership.</li>
<li>Multicast uses UDP, so the symptom of any fault is at the receiver, and troubleshooting starts there.</li>
<li>If a group is missing from the last-hop router's IGMP table, fix that before looking upstream.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki multicast stream ka naam kaise rakha jaata hai (group address), receiver network ko kaise batata hai ki use woh stream chahiye (IGMP), routers LAN par kaise decide karte hain ki kaun sun raha hai (querier aur membership table), aur Ethernet switch stream ko har port par flood karne se kaise bachta hai (IGMP snooping). Aap router par yeh sab configure aur verify karoge, output padhoge, aur ek aisa method seekhoge jisse pata chale ki receiver ko stream kyun nahi mil rahi. <b>Prerequisites:</b> IPv4 addressing aur subnets, VLANs aur basic switching, aur is track ka pehla module (Multicast and QoS from zero). PIM abhi aana zaroori nahi; agla module use sikhata hai, yahan sirf dikhaya jaata hai ki woh kahan fit hota hai.</p>

<h3>Analogy se shuru karo: FM radio channel</h3>
<p>Radio station ek baar transmit karta hai. Use nahi pata kaun sun raha hai aur woh listeners ki list nahi rakhta. Jo bhi dial ko 98.3 par laga de, sun leta hai, aur station ka kaam utna hi rehta hai chahe das log sune ya das hazaar. Ab isse compare karo: har listener ko alag phone call. Station ko har insaan ke liye ek call lagani padegi aur har naye listener ke saath cost badhegi.</p>
<p>Multicast radio ki tarah kaam karta hai. <b>Group address</b> (jaise 239.20.1.1) frequency hai. <b>Source</b> transmitter hai. <b>Receiver</b> ek radio hai. Dial tune karna <b>IGMP join</b> hai: ek chhota message jo kehta hai "mujhe group 239.20.1.1 chahiye". Receiver ki LAN ka router local relay tower hai: use bas yeh jaanna hai ki us LAN par kam se kam ek radio tune hai ya nahi, taaki woh channel LAN par relay karta rahe ya band kar de.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IGMP, snooping aur PIM kahan baithte hain">
<rect x="10" y="85" width="100" height="50" rx="8" fill="#fde68a"/><text x="60" y="108" text-anchor="middle" class="svg-ink" font-size="13">Source</text><text x="60" y="125" text-anchor="middle" class="svg-muted" font-size="11">239.20.1.1 par bhejta</text>
<rect x="160" y="85" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="210" y="115" text-anchor="middle" class="svg-ink" font-size="13">Router A</text>
<rect x="310" y="85" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="360" y="115" text-anchor="middle" class="svg-ink" font-size="13">Router B</text>
<rect x="450" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="490" y="115" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="560" y="20" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="595" y="45" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="560" y="95" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="595" y="120" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="560" y="170" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="595" y="195" text-anchor="middle" class="svg-ink" font-size="12">PC3</text>
<line x1="110" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="2"/><line x1="260" y1="110" x2="310" y2="110" stroke="#64748b" stroke-width="2"/><line x1="410" y1="110" x2="450" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="100" x2="560" y2="40" stroke="#64748b" stroke-width="2"/><line x1="530" y1="115" x2="560" y2="115" stroke="#64748b" stroke-width="2"/><line x1="530" y1="130" x2="560" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="285" y="72" text-anchor="middle" class="svg-accent" font-size="12">PIM (agla module)</text>
<text x="500" y="180" text-anchor="middle" class="svg-accent" font-size="12">IGMP: hosts se router</text>
<text x="500" y="200" text-anchor="middle" class="svg-accent" font-size="12">Snooping: switch sunta hai</text>
</svg><p class="cap">IGMP receivers aur unke router ke beech last-hop ki bhasha hai. PIM routers ke beech tree le jaata hai. Snooping switch ko IGMP baatcheet copy karne deta hai.</p></div>

<h3>Is module ke teen hisse</h3>
<dl class="terms">
<dt>Group address</dt><dd>Woh IPv4 destination jo stream ka naam batata hai, 224.0.0.0/4 se liya hua. Chapter 2.</dd>
<dt>IGMP</dt><dd>Internet Group Management Protocol. Hosts report karte hain ki kaunse groups chahiye aur routers poochte hain ki ab bhi kaun sun raha hai. Chapters 3, 4 aur 5.</dd>
<dt>IGMP snooping</dt><dd>Switch ka feature jo IGMP messages padhta hai taaki multicast frames sirf member ports par jaayein. Chapters 6 aur 7.</dd>
</dl>
<p>Aage ke modules (PIM, rendezvous points, RPF) sab us membership se shuru hote hain jo IGMP banata hai. Agar receiver apne router par kabhi member nahi bana, to duniya ka best PIM design bhi uske paas kuch nahi le jaayega. Isiliye is module ka troubleshooting chapter receiver se shuru karke upar ki taraf jaata hai.</p>

<h3>Multicast kyun hai: calculation</h3>
<div class="eg"><p><b>Worked example.</b> Sahyadri University 400 hostel students ko 2 Mbps par live lecture stream karti hai. Unicast mein studio 400 alag copies bhejta: 400 x 2 Mbps = 800 Mbps studio se nikalta aur campus core se guzarta. Multicast mein source ek 2 Mbps stream bhejta hai. Network use sirf wahan copy karta hai jahan raaste alag hote hain, isliye har link par zyada se zyada 2 Mbps jaata hai chahe 4 students dekhein ya 400. Source ka load ek receiver ke liye bhi wahi hai aur ek million ke liye bhi.</p></div>

<h3>Multicast packet kaisa dikhta hai</h3>
<p>Multicast packet ek normal UDP-over-IP packet hai jiska destination address group address hota hai. Na connection hai na acknowledgement: source ko pata nahi chal sakta ki kaun receive kar raha hai. Kyunki transport UDP hai, khoya hua packet bas gaya, isliye applications buffer, forward error correction ya thodi loss tolerate karte hain. Iska matlab yeh bhi hai ki kharab network source ko warn nahi karta; symptom hamesha receiver par dikhta hai, isiliye troubleshooting wahin se shuru hoti hai.</p>

<div class="warn"><p><b>Common beginner mistakes.</b> Yeh sochna ki source ko apne receivers pata hone chahiye (nahi hote). Yeh sochna ki IGMP stream carry karta hai (woh sirf membership carry karta hai; stream data plane aur routing protocol PIM carry karte hain). Yeh sochna ki switch default mein multicast groups samajhta hai (nahi samajhta; snooping ke bina woh flood karta hai).</p></div>

<div class="scn"><h4>Woh lecture jo kisi ko dikhi nahi</h4><p>Sahyadri University ne live lectures ke liye multicast on kiya. Hostel B ke students ko black screen dikhi jabki Hostel A theek tha. Network team ne core se shuru nahi kiya. Woh Hostel B ke router par gaye aur ek sawaal poocha: kya yeh router lecture group ko apne IGMP table mein dikhata hai? Nahi dikhata tha. Hostel B ki taraf wale interface par PIM kabhi lagaya hi nahi gaya tha, isliye uspar IGMP off tha aur students ke joins ignore ho rahe the. Das minute baad group dikha aur video chalne laga.</p><p><b>Lesson:</b> receiver se shuru karo. Agar last-hop router ke IGMP table mein group nahi hai, to upar kuch bhi matter nahi karta.</p></div>

<div class="iv"><p class="q">"Multicast kaunsi problem solve karta hai, aur isme IGMP ka role kya hai?"</p><p>Strong answer: multicast ek stream ko bahut saare receivers tak bina har receiver ke liye ek copy ke deliver karta hai, isliye audience badhne par bhi source aur link ka load constant rehta hai. IGMP hosts aur unke local router ke beech ka protocol hai: hosts report karte hain ki kaunse groups chahiye, router time-time par poochta hai ki ab bhi kaun interested hai, aur jo membership router seekhta hai usi se woh source ki taraf tree banata hai. IGMP data carry nahi karta aur routers ke beech tree nahi banata; woh kaam PIM karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast = ek stream, bahut receivers; group address "channel" hai.</li>
<li>IGMP hosts aur last-hop router ke beech chalta hai; PIM routers ke beech; snooping switches par.</li>
<li>Source apne receivers kabhi nahi jaanta; network membership se tree banata hai.</li>
<li>Multicast UDP use karta hai, isliye har fault ka symptom receiver par dikhta hai, aur troubleshooting wahin se shuru hoti hai.</li>
<li>Agar last-hop router ke IGMP table mein group nahi hai, to upar dekhne se pehle use theek karo.</li>
</ul></div>
`}};export{e as default};