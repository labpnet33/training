var e={id:`big-picture`,h:{en:`The physical layer: interfaces, cables, speed and duplex in one picture`,hi:`Physical layer: interfaces, cables, speed aur duplex ek picture mein`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to pick the right cable and transceiver for any link, explain every Ethernet speed from 10 Mbps to 100 Gbps, configure and verify speed and duplex on Cisco switches and routers, read <code>show interfaces</code> and <code>show interfaces status</code> like a senior engineer, explain what every important error counter means, recognise a duplex mismatch from its counters before users call, and describe how a switch learns MAC addresses and forwards frames. You will also fix a real duplex mismatch in the lab between <b>R1</b> and <b>SW1</b>.</p>
<p><b>Prerequisites.</b> From the <b>Cisco IOS from zero</b> module you need the CLI modes (user, privileged, global configuration, interface configuration) and basic <code>show</code> commands. From <b>Network models &amp; how data moves</b> you need the OSI layers, the idea of a MAC address and the Ethernet frame header. We will refer back to those modules instead of repeating them. After this module comes <b>IPv4 addressing &amp; subnetting</b>, which assumes your interfaces are up and clean.</p>

<h3>An analogy: a highway between two cities</h3>
<p>Imagine two cities joined by a road. Before any lorry can deliver goods, four things must be right. First, there must be a <b>road</b> of the right type: a narrow village road (a copper cable) is fine for short distances, but for 40 km you need an expressway (a fibre). Second, both toll gates must agree on the <b>speed limit</b>; if one city's signboard says 100 and the other says 10, the lorries never even start. Third, both sides must agree whether the road is a <b>single lane with traffic lights</b> (half duplex: only one direction at a time) or a <b>dual carriageway</b> (full duplex: both directions at once). If one city thinks it is a dual carriageway and the other thinks it is a single lane, lorries crash head-on in the middle. Fourth, somebody must watch the <b>CCTV and incident log</b> (the interface counters) to notice crashes before customers complain.</p>
<p>That is this entire module. Cables and connectors are the road. Speed and duplex are the traffic rules both ends must agree on. <code>show interfaces</code> is the incident log. And the switch at each city is the smart traffic police that learns where every house (MAC address) is.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology and the four things that must be right">
<rect x="40" y="70" width="140" height="60" rx="8" fill="#bae6fd"/><text x="110" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="110" y="116" text-anchor="middle" class="svg-muted" font-size="12">Fa0/0 10.0.12.1</text>
<rect x="460" y="70" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="97" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="530" y="116" text-anchor="middle" class="svg-muted" font-size="12">Fa0/1, VLAN1 10.0.12.2</text>
<line x1="180" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="320" y="90" text-anchor="middle" class="svg-accent" font-size="13">1. cable and connector</text>
<text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="13">2. speed  3. duplex</text>
<rect x="40" y="165" width="560" height="44" rx="8" fill="#fde68a"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">4. counters: show interfaces, show interfaces status</text>
<text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">Layer 1 and Layer 2 must be clean before IP can work</text>
</svg><p class="cap">The lab topology used throughout this module: R1 Fa0/0 connects to SW1 Fa0/1 on subnet 10.0.12.0/24.</p></div>

<h3>Where this sits in the OSI model</h3>
<p>Everything in this module lives at <b>Layer 1</b> (physical: cables, connectors, light and voltage, speed, duplex) and <b>Layer 2</b> (data link: Ethernet frames, MAC addresses, switching). Routing, IP addresses and TCP all sit on top. A useful habit from day one: when something is broken, <b>start at the bottom</b>. An OSPF neighbour that keeps flapping or a file transfer that is painfully slow is very often a bad cable, a dirty fibre or a duplex mismatch, not a routing bug.</p>

<h3>The words you will meet</h3>
<dl class="terms">
<dt>Interface (port)</dt><dd>The physical socket on a switch or router, plus the software object that represents it, for example <code>FastEthernet0/1</code> (100 Mbps) or <code>GigabitEthernet1/0/1</code> (1 Gbps).</dd>
<dt>Medium</dt><dd>What the signal travels through: copper twisted pair, multimode fibre, single-mode fibre or radio.</dd>
<dt>Transceiver</dt><dd>A small plug-in module, such as an <b>SFP</b>, that converts the switch's electrical signal into light or copper signalling.</dd>
<dt>Speed</dt><dd>The bit rate of the link: 10, 100, 1000 Mbps and beyond.</dd>
<dt>Duplex</dt><dd>Whether a device can send and receive at the same time (<b>full</b>) or must take turns (<b>half</b>).</dd>
<dt>Auto-negotiation</dt><dd>The IEEE mechanism by which two ends advertise what they support and agree on the best common speed and duplex.</dd>
<dt>Counters</dt><dd>Numbers the interface keeps: packets in and out, CRC errors, collisions, drops. They are your evidence.</dd>
</dl>

<h3>Why this matters in real networks</h3>
<p>Physical problems are the most common cause of tickets that sound like something else. "The application freezes", "voice calls are choppy", "backups take all night": each of these can be a single cable or a single wrong <code>duplex</code> command. They are also the easiest problems to prove, because the counters tell the story. Engineers who can read counters close tickets in minutes that others escalate for days.</p>

<div class="eg"><p><b>Worked example.</b> A 1 Gbps link between two buildings is 180 m long. Copper UTP is limited to 100 m per segment, so copper is out. Multimode fibre with 1000BASE-SX optics reaches about 550 m on OM2 and further on better grades, so an SX SFP at each end plus a multimode patch is a sensible design. If the buildings were 5 km apart, you would need single-mode fibre and 1000BASE-LX optics instead.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Jumping straight to IP and routing when a user says "the network is slow". Always check Layer 1 and Layer 2 first: is the interface up/up, at the expected speed and duplex, and are the error counters growing?</p></div>

<div class="exam"><p><b>Exam trap.</b> A <b>speed</b> mismatch takes the link down. A <b>duplex</b> mismatch leaves the link up but causes errors and slowness. Exam questions love to show an interface that is up/up and ask why throughput is poor.</p></div>

<div class="scn"><h4>The "slow software" that was a cable test</h4><p>A small clinic complained that its practice software froze every few seconds. The application team checked the server, the database and the licence. Ping from the router R1 to the switch SW1 mostly worked, so everyone assumed the network was fine. A network engineer finally ran <code>show interfaces fa0/0</code> on R1 and saw <code>Half-duplex</code> with thousands of late collisions. A month earlier, during a cable test, someone had hard-coded SW1 Fa0/1 to <code>speed 100</code> and <code>duplex full</code>, and never put it back. Setting the port back to auto fixed the problem in two minutes.</p><p><b>Lesson:</b> a link can be up and still broken. You will reproduce and fix exactly this case in the lab.</p></div>

<div class="iv"><p class="q">"A user says the network is slow. Where do you start?"</p><p>Strong answer: scope first (one user, one site, everyone), then work bottom-up. Check the access port and uplinks with <code>show interfaces status</code> for speed and duplex, then <code>show interfaces</code> for CRC, collisions, late collisions and output drops, and whether they are still increasing after <code>clear counters</code>. Only when Layer 1 and 2 are clean move to IP, routing and the application. Mention that a duplex mismatch keeps the link up, which is why it is often missed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers Layer 1 and Layer 2: cables, transceivers, Ethernet speeds, speed and duplex, counters and basic switching.</li>
<li>Both ends of a link must agree on speed and duplex; a speed mismatch drops the link, a duplex mismatch degrades it.</li>
<li>Interface counters are evidence: learn to read them and you can prove physical problems.</li>
<li>Troubleshoot bottom-up: physical and data link first, then IP.</li>
<li>The lab link is R1 Fa0/0 (10.0.12.1) to SW1 Fa0/1 (SW1 VLAN 1 is 10.0.12.2).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap kisi bhi link ke liye sahi cable aur transceiver chun paoge, 10 Mbps se 100 Gbps tak har Ethernet speed samjha paoge, Cisco switches aur routers par speed aur duplex configure aur verify kar paoge, <code>show interfaces</code> aur <code>show interfaces status</code> ek senior engineer ki tarah padh paoge, har important error counter ka matlab bata paoge, users ke call karne se pehle counters se duplex mismatch pehchan paoge, aur samjha paoge ki switch MAC addresses kaise seekhta hai aur frames kaise forward karta hai. Aap lab mein <b>R1</b> aur <b>SW1</b> ke beech ek real duplex mismatch bhi fix karoge.</p>
<p><b>Prerequisites.</b> <b>Cisco IOS from zero</b> module se aapko CLI modes (user, privileged, global configuration, interface configuration) aur basic <code>show</code> commands chahiye. <b>Network models &amp; how data moves</b> se aapko OSI layers, MAC address ka idea aur Ethernet frame header chahiye. Hum unhe dobara padhane ke bajaye un modules ka reference denge. Is module ke baad <b>IPv4 addressing &amp; subnetting</b> aata hai, jo maan ke chalta hai ki aapke interfaces up aur clean hain.</p>

<h3>Ek analogy: do shehron ke beech highway</h3>
<p>Socho do shehar ek sadak se jude hain. Koi bhi truck maal deliver kare, usse pehle chaar cheezein sahi honi chahiye. Pehli, sahi type ki <b>sadak</b> honi chahiye: chhoti gaon ki sadak (copper cable) kam doori ke liye theek hai, lekin 40 km ke liye expressway (fibre) chahiye. Doosri, dono toll gates ko <b>speed limit</b> par agree karna hoga; agar ek shehar ka board 100 kehta hai aur doosre ka 10, to trucks shuru hi nahi hote. Teesri, dono sides ko agree karna hoga ki sadak <b>traffic lights wali single lane</b> hai (half duplex: ek waqt mein ek hi direction) ya <b>dual carriageway</b> (full duplex: dono directions ek saath). Agar ek shehar sochta hai dual carriageway hai aur doosra sochta hai single lane, to trucks beech mein aamne-saamne takraate hain. Chauthi, kisi ko <b>CCTV aur incident log</b> (interface counters) dekhna hoga taaki customers ke complain karne se pehle accidents pakde ja sakein.</p>
<p>Yahi poora module hai. Cables aur connectors sadak hain. Speed aur duplex traffic rules hain jin par dono ends ko agree karna hai. <code>show interfaces</code> incident log hai. Aur har shehar ka switch smart traffic police hai jo seekhta hai ki har ghar (MAC address) kahan hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology aur chaar cheezein jo sahi honi chahiye">
<rect x="40" y="70" width="140" height="60" rx="8" fill="#bae6fd"/><text x="110" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="110" y="116" text-anchor="middle" class="svg-muted" font-size="12">Fa0/0 10.0.12.1</text>
<rect x="460" y="70" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="97" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="530" y="116" text-anchor="middle" class="svg-muted" font-size="12">Fa0/1, VLAN1 10.0.12.2</text>
<line x1="180" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="320" y="90" text-anchor="middle" class="svg-accent" font-size="13">1. cable aur connector</text>
<text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="13">2. speed  3. duplex</text>
<rect x="40" y="165" width="560" height="44" rx="8" fill="#fde68a"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">4. counters: show interfaces, show interfaces status</text>
<text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">IP chalne se pehle Layer 1 aur Layer 2 clean hone chahiye</text>
</svg><p class="cap">Is poore module mein use hone wali lab topology: R1 Fa0/0 subnet 10.0.12.0/24 par SW1 Fa0/1 se juda hai.</p></div>

<h3>OSI model mein yeh kahan baithta hai</h3>
<p>Is module ki har cheez <b>Layer 1</b> (physical: cables, connectors, light aur voltage, speed, duplex) aur <b>Layer 2</b> (data link: Ethernet frames, MAC addresses, switching) par hai. Routing, IP addresses aur TCP sab iske upar baithte hain. Pehle din se ek useful aadat: jab kuch toota ho, <b>neeche se shuru karo</b>. Baar baar flap hone wala OSPF neighbour ya bahut slow file transfer aksar kharab cable, gandi fibre ya duplex mismatch hota hai, routing bug nahi.</p>

<h3>Woh shabd jo aapko milenge</h3>
<dl class="terms">
<dt>Interface (port)</dt><dd>Switch ya router par physical socket, aur use represent karne wala software object, jaise <code>FastEthernet0/1</code> (100 Mbps) ya <code>GigabitEthernet1/0/1</code> (1 Gbps).</dd>
<dt>Medium</dt><dd>Jisme se signal travel karta hai: copper twisted pair, multimode fibre, single-mode fibre ya radio.</dd>
<dt>Transceiver</dt><dd>Ek chhota plug-in module, jaise <b>SFP</b>, jo switch ke electrical signal ko light ya copper signalling mein badalta hai.</dd>
<dt>Speed</dt><dd>Link ka bit rate: 10, 100, 1000 Mbps aur usse aage.</dd>
<dt>Duplex</dt><dd>Kya device ek saath bhej aur receive kar sakta hai (<b>full</b>) ya use baari baari karna padta hai (<b>half</b>).</dd>
<dt>Auto-negotiation</dt><dd>IEEE mechanism jisse dono ends batate hain ki woh kya support karte hain aur best common speed aur duplex par agree karte hain.</dd>
<dt>Counters</dt><dd>Numbers jo interface rakhta hai: packets in aur out, CRC errors, collisions, drops. Yeh aapka saboot hain.</dd>
</dl>

<h3>Real networks mein yeh kyun matter karta hai</h3>
<p>Physical problems un tickets ka sabse common cause hain jo sunne mein kuch aur lagte hain. "Application atak jaati hai", "voice calls toot toot kar aate hain", "backups poori raat lete hain": inmein se har ek ek cable ya ek galat <code>duplex</code> command ho sakta hai. Yeh prove karne mein bhi sabse aasaan problems hain, kyunki counters poori kahani batate hain. Jo engineers counters padh lete hain woh minutes mein tickets band karte hain jinhe doosre dino tak escalate karte rehte hain.</p>

<div class="eg"><p><b>Worked example.</b> Do buildings ke beech 1 Gbps link 180 m lamba hai. Copper UTP har segment mein 100 m tak limited hai, isliye copper nahi chalega. 1000BASE-SX optics ke saath multimode fibre OM2 par lagbhag 550 m aur behtar grades par aur door tak jaata hai, isliye har end par SX SFP aur multimode patch ek samajhdar design hai. Agar buildings 5 km door hoti, to aapko single-mode fibre aur 1000BASE-LX optics chahiye hote.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Jab user kahe "network slow hai" to seedha IP aur routing par kood jaana. Hamesha pehle Layer 1 aur Layer 2 check karo: kya interface up/up hai, expected speed aur duplex par hai, aur kya error counters badh rahe hain?</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Speed</b> mismatch link ko down kar deta hai. <b>Duplex</b> mismatch link ko up rakhta hai lekin errors aur slowness laata hai. Exam questions ko up/up interface dikha kar poochna pasand hai ki throughput kharab kyun hai.</p></div>

<div class="scn"><h4>"Slow software" jo asal mein cable test tha</h4><p>Ek chhote clinic ne complain kiya ki unka practice software har kuch second mein atak jaata hai. Application team ne server, database aur licence check kiya. Router R1 se switch SW1 tak ping zyada tar chal raha tha, isliye sabne maan liya network theek hai. Aakhir mein ek network engineer ne R1 par <code>show interfaces fa0/0</code> chalaya aur hazaaron late collisions ke saath <code>Half-duplex</code> dekha. Ek mahine pehle cable test ke dauraan kisi ne SW1 Fa0/1 ko <code>speed 100</code> aur <code>duplex full</code> par hard-code kiya tha, aur wapas kabhi nahi badla. Port ko wapas auto par set karne se do minute mein problem fix ho gayi.</p><p><b>Seekh:</b> link up hote hue bhi toota ho sakta hai. Aap lab mein bilkul yahi case reproduce aur fix karoge.</p></div>

<div class="iv"><p class="q">"User kehta hai network slow hai. Aap kahan se shuru karoge?"</p><p>Strong answer: pehle scope (ek user, ek site, sab log), phir bottom-up kaam karo. Access port aur uplinks ko <code>show interfaces status</code> se speed aur duplex ke liye check karo, phir <code>show interfaces</code> se CRC, collisions, late collisions aur output drops, aur kya woh <code>clear counters</code> ke baad bhi badh rahe hain. Jab Layer 1 aur 2 clean hon tabhi IP, routing aur application par jao. Batao ki duplex mismatch link ko up rakhta hai, isiliye woh aksar miss ho jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module Layer 1 aur Layer 2 cover karta hai: cables, transceivers, Ethernet speeds, speed aur duplex, counters aur basic switching.</li>
<li>Link ke dono ends ko speed aur duplex par agree karna chahiye; speed mismatch link girata hai, duplex mismatch use kharab karta hai.</li>
<li>Interface counters saboot hain: unhe padhna seekho aur aap physical problems prove kar sakte ho.</li>
<li>Bottom-up troubleshoot karo: pehle physical aur data link, phir IP.</li>
<li>Lab link R1 Fa0/0 (10.0.12.1) se SW1 Fa0/1 hai (SW1 VLAN 1 10.0.12.2 hai).</li>
</ul></div>
`}};export{e as default};