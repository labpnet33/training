var e={id:`clos`,h:{en:`Spine-leaf (Clos) fabrics from first principles`,hi:`Spine-leaf (Clos) fabrics bilkul shuru se`},body:{en:`
<p>Think of a big airport with many gates (leaves) and a set of identical shuttle trains (spines). Every gate has a platform for every train, and no train connects to another train. From any gate to any other gate, you ride exactly one train. If one train breaks down, the others keep running and you simply wait a little longer. That is a spine-leaf fabric, and in this chapter you will build it from first principles.</p>

<h3>Where the name "Clos" comes from</h3>
<p>In 1953 Charles Clos, an engineer at Bell Labs, described how to build a large telephone switch out of many small ones arranged in three stages: ingress, middle and egress. With enough middle-stage switches, any input could reach any free output without blocking. A data center fabric is a <b>folded</b> Clos: the ingress and egress stages are the same physical switches (the <b>leaves</b>), and the middle stage is the <b>spines</b>. The packet goes up from a leaf, through a spine and down to a leaf.</p>

<h3>The wiring rules</h3>
<ol>
<li><b>Every leaf connects to every spine.</b> Usually one link per spine, sometimes two for more bandwidth.</li>
<li><b>Leaves do not connect to each other</b> for transport. The only common exception is a vPC peer-link between two leaves that dual-home servers, and it is not part of the spine-leaf transport.</li>
<li><b>Spines do not connect to each other.</b></li>
<li><b>Everything attaches to leaves</b>: servers, storage, firewalls, load balancers, routers to the WAN. Spines are pure transit.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Four spines and four leaves with a packet path">
<rect x="40" y="15" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="95" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="190" y="15" width="110" height="36" rx="6" fill="#fde68a"/><text x="245" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="340" y="15" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="395" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE3</text>
<rect x="490" y="15" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="545" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE4</text>
<rect x="40" y="160" width="110" height="36" rx="6" fill="#bae6fd"/><text x="95" y="183" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="190" y="160" width="110" height="36" rx="6" fill="#bae6fd"/><text x="245" y="183" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<rect x="340" y="160" width="110" height="36" rx="6" fill="#bae6fd"/><text x="395" y="183" text-anchor="middle" class="svg-ink" font-size="13">LEAF3</text>
<rect x="490" y="160" width="110" height="36" rx="6" fill="#bae6fd"/><text x="545" y="183" text-anchor="middle" class="svg-ink" font-size="13">LEAF4</text>
<g stroke="#64748b" stroke-width="1.5">
<line x1="95" y1="51" x2="95" y2="160"/><line x1="95" y1="51" x2="245" y2="160"/><line x1="95" y1="51" x2="395" y2="160"/><line x1="95" y1="51" x2="545" y2="160"/>
<line x1="245" y1="51" x2="245" y2="160"/><line x1="245" y1="51" x2="545" y2="160"/>
<line x1="395" y1="51" x2="95" y2="160"/><line x1="395" y1="51" x2="245" y2="160"/><line x1="395" y1="51" x2="395" y2="160"/><line x1="395" y1="51" x2="545" y2="160"/>
<line x1="545" y1="51" x2="95" y2="160"/><line x1="545" y1="51" x2="245" y2="160"/><line x1="545" y1="51" x2="395" y2="160"/><line x1="545" y1="51" x2="545" y2="160"/>
</g>
<line x1="95" y1="160" x2="245" y2="51" stroke="#f59e0b" stroke-width="4"/><line x1="245" y1="51" x2="395" y2="160" stroke="#f59e0b" stroke-width="4"/>
<text x="95" y="222" text-anchor="middle" class="svg-muted" font-size="12">Server A</text><text x="395" y="222" text-anchor="middle" class="svg-muted" font-size="12">Server B</text>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="12">A to B: LEAF1, SPINE2, LEAF3 (one of four equal paths)</text>
</svg><p class="cap">Every leaf links to every spine. The highlighted flow was hashed to SPINE2; another flow may use a different spine.</p></div>

<h3>Equal hop count, predictable latency</h3>
<p>Because of the rules, any server on one leaf reaches any server on another leaf in exactly <b>leaf, spine, leaf</b>: three switches, two links. It does not matter which racks the servers are in. The scheduler can place a VM anywhere and the network distance stays the same. Compare that with the 1, 3 or 5 switches of the three-tier design.</p>

<h3>Routed links and ECMP</h3>
<p>In a modern fabric each leaf-to-spine link is a <b>routed point-to-point link</b>, normally a /31 subnet (two addresses, no broadcast address needed, defined in RFC 3021). Every switch has a <b>loopback</b> used as its router ID and, later, as its tunnel endpoint. An IGP such as <b>OSPF</b> or <b>IS-IS</b>, or <b>eBGP</b> in very large fabrics, advertises the loopbacks and server subnets.</p>
<p>Because a leaf has one link to each spine and every spine reaches the destination leaf at the same cost, the routing protocol installs several equal-cost routes. This is <b>ECMP</b> (equal-cost multipath). There is no spanning tree on these links, so nothing is blocked: every link forwards.</p>
<pre class="out">LEAF1# show ip route 10.10.3.0/24
IP Route Table for VRF "default"
10.10.3.0/24, ubest/mbest: 4/0
<span class="hl">    *via 10.1.1.0, Eth1/49, [110/81], 3d02h, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/50, [110/81], 3d02h, ospf-UNDERLAY, intra
    *via 10.1.3.0, Eth1/51, [110/81], 3d02h, ospf-UNDERLAY, intra
    *via 10.1.4.0, Eth1/52, [110/81], 3d02h, ospf-UNDERLAY, intra</span></pre>
<p><code>ubest 4</code> means four best unicast paths. The hardware picks one per <b>flow</b> by hashing header fields (typically source and destination IP, protocol and Layer-4 ports). All packets of one flow take the same path, so they never arrive out of order. Many flows spread statistically across all spines. The trade-off: one very large flow (an "elephant", such as a big backup) stays on a single link and cannot use more than that link's speed.</p>

<h3>A packet walk</h3>
<p>Server A (10.10.1.10) on LEAF1 sends to server B (10.10.3.20) on LEAF3. In this simple routed design each leaf is the default gateway for its own rack subnet.</p>
<ol>
<li>A sees B is on another subnet and sends the frame to its gateway, the LEAF1 SVI for 10.10.1.0/24.</li>
<li>LEAF1 looks up 10.10.3.0/24 and finds four equal next hops. It hashes the flow and picks Eth1/50 towards SPINE2.</li>
<li>SPINE2 has exactly one best route to 10.10.3.0/24: its link to LEAF3. It routes the packet down.</li>
<li>LEAF3 owns 10.10.3.0/24, resolves B with ARP and delivers the frame.</li>
</ol>
<p>The reply from B may hash to a different spine. That asymmetry is normal and harmless, because spines keep no per-flow state. (Stateful firewalls, by contrast, hang off leaves and need symmetric paths through them, which is a design topic for later modules.)</p>

<h3>What happens when a spine fails</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Spine failure removes one quarter of bandwidth">
<rect x="40" y="15" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="95" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="190" y="15" width="110" height="34" rx="6" fill="#fed7aa"/><text x="245" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE2 down</text>
<rect x="340" y="15" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="395" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE3</text>
<rect x="490" y="15" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="545" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE4</text>
<rect x="265" y="115" width="110" height="34" rx="6" fill="#bae6fd"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<line x1="95" y1="49" x2="300" y2="115" stroke="#64748b" stroke-width="2"/><line x1="245" y1="49" x2="310" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="5 5"/><line x1="395" y1="49" x2="330" y2="115" stroke="#64748b" stroke-width="2"/><line x1="545" y1="49" x2="340" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="480" y="140" class="svg-accent" font-size="12">400G to 300G uplink</text>
</svg><p class="cap">With N spines, losing one spine removes 1/N of every leaf's uplink bandwidth. Nothing is isolated.</p></div>
<p>When SPINE2 dies, every leaf loses one of its four uplinks. The routing protocol withdraws those paths (fast with BFD, usually well under a second), and ECMP rehashes flows over the three remaining spines. Every leaf keeps 3/4 of its uplink bandwidth. With only two spines, one failure costs half, which is why many production fabrics start with four spines. If one leaf fails, only the servers attached to it are affected, which is why important servers are dual-homed to a pair of leaves.</p>

<h3>Scaling out</h3>
<ul>
<li><b>Need more server ports?</b> Add a leaf and cable it to every spine. Nothing else changes.</li>
<li><b>Need more bandwidth between racks?</b> Add a spine and cable every leaf to it (each leaf needs a free uplink port).</li>
</ul>
<p>This is <b>scale-out</b>: growth by adding identical boxes instead of replacing a few big ones. The next chapter turns these rules into port counts and numbers.</p>

<div class="warn"><p><b>Common mistakes.</b> Cabling leaf to leaf or spine to spine "for extra redundancy": it creates unequal paths and breaks the model. Mixing link speeds towards different spines: OSPF may treat them as equal cost and send the same share to the slower link. Forgetting that a new spine must be cabled to every leaf, not just some.</p></div>
<div class="exam"><p><b>Exam tip.</b> Rules: every leaf to every spine, no leaf-leaf transport links, no spine-spine links, endpoints only on leaves. Any-to-any = leaf, spine, leaf. ECMP is per flow, not per packet. Add leaves for ports, spines for bandwidth. Losing one of N spines costs 1/N of bandwidth.</p></div>

<div class="scn"><h4>The spine that got too much traffic</h4><p>A fintech fabric had four spines with 100G uplinks. After a hardware swap, application teams saw random packet drops on one quarter of flows. The engineer checked <code>show interface ethernet1/51</code> on LEAF5 and found it running at 40G: a technician had used a 40G QSFP+ optic. NX-OS uses a default OSPF reference bandwidth of 40 Gbit/s, so both 40G and 100G links had cost 1. ECMP still sent a quarter of the traffic to the 40G link, which overflowed. The fix was to install the correct 100G optic, and to set <code>auto-cost reference-bandwidth 400 Gbps</code> consistently on every switch so a slow link gets a higher cost and is avoided automatically.</p><p><b>Lesson:</b> ECMP assumes the parallel paths really are equal; keep every leaf-to-spine link the same speed and set a reference bandwidth that can tell modern speeds apart.</p></div>

<div class="iv"><p class="q">"Walk me through what happens in a spine-leaf fabric when one spine fails."</p><p>Strong answer: each leaf detects its link to that spine going down (link loss or BFD), the IGP or BGP withdraws those next hops, and ECMP rehashes flows over the remaining spines. No server is isolated; each leaf loses 1/N of its uplink bandwidth, so with four spines you drop from 100% to 75%. Mention that flows on the failed spine see a brief interruption, that oversubscription gets temporarily worse, and that this is why you size for N-1 and prefer four spines over two.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A spine-leaf fabric is a folded three-stage Clos network: leaf, spine, leaf.</li>
<li>Every leaf to every spine; no leaf-leaf or spine-spine transport links; all endpoints on leaves.</li>
<li>Routed /31 links plus loopbacks and an IGP give multiple equal-cost paths; ECMP hashes per flow.</li>
<li>Losing one of N spines costs 1/N of bandwidth; losing a leaf affects only its rack.</li>
<li>Scale out: more leaves for ports, more spines for bandwidth.</li>
</ul></div>
`,hi:`
<p>Ek bada airport socho jismein bahut saare gates (leaves) hain aur ek jaisi shuttle trains ka ek set (spines). Har gate par har train ka platform hai, aur koi train dusri train se nahi judti. Kisi bhi gate se kisi bhi dusre gate tak aap bilkul ek train mein baithte ho. Agar ek train kharab ho jaaye, to baaki chalti rehti hain aur aapko bas thoda zyada intezaar karna padta hai. Yahi spine-leaf fabric hai, aur is chapter mein aap ise bilkul shuru se banaoge.</p>

<h3>"Clos" naam kahan se aaya</h3>
<p>1953 mein Bell Labs ke engineer Charles Clos ne bataya ki bahut saare chhote switches ko teen stages mein (ingress, middle aur egress) laga kar ek bada telephone switch kaise banaya jaaye. Kaafi middle-stage switches ho to koi bhi input kisi bhi free output tak bina blocking ke pahunch sakta hai. Data center fabric ek <b>folded</b> Clos hai: ingress aur egress stages wahi physical switches hain (<b>leaves</b>), aur middle stage <b>spines</b> hain. Packet leaf se upar jaata hai, spine se guzarta hai aur neeche ek leaf par aata hai.</p>

<h3>Wiring rules</h3>
<ol>
<li><b>Har leaf har spine se judta hai.</b> Aam taur par har spine ke liye ek link, kabhi zyada bandwidth ke liye do.</li>
<li><b>Leaves transport ke liye aapas mein nahi judte.</b> Ek common exception do leaves ke beech vPC peer-link hai jo servers ko dual-home karte hain, aur woh spine-leaf transport ka hissa nahi hai.</li>
<li><b>Spines aapas mein nahi judte.</b></li>
<li><b>Sab kuch leaves se judta hai</b>: servers, storage, firewalls, load balancers, WAN ke routers. Spines sirf transit hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Chaar spines aur chaar leaves ek packet path ke saath">
<rect x="40" y="15" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="95" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="190" y="15" width="110" height="36" rx="6" fill="#fde68a"/><text x="245" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="340" y="15" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="395" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE3</text>
<rect x="490" y="15" width="110" height="36" rx="6" fill="#ddd6fe"/><text x="545" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE4</text>
<rect x="40" y="160" width="110" height="36" rx="6" fill="#bae6fd"/><text x="95" y="183" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="190" y="160" width="110" height="36" rx="6" fill="#bae6fd"/><text x="245" y="183" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<rect x="340" y="160" width="110" height="36" rx="6" fill="#bae6fd"/><text x="395" y="183" text-anchor="middle" class="svg-ink" font-size="13">LEAF3</text>
<rect x="490" y="160" width="110" height="36" rx="6" fill="#bae6fd"/><text x="545" y="183" text-anchor="middle" class="svg-ink" font-size="13">LEAF4</text>
<g stroke="#64748b" stroke-width="1.5">
<line x1="95" y1="51" x2="95" y2="160"/><line x1="95" y1="51" x2="245" y2="160"/><line x1="95" y1="51" x2="395" y2="160"/><line x1="95" y1="51" x2="545" y2="160"/>
<line x1="245" y1="51" x2="245" y2="160"/><line x1="245" y1="51" x2="545" y2="160"/>
<line x1="395" y1="51" x2="95" y2="160"/><line x1="395" y1="51" x2="245" y2="160"/><line x1="395" y1="51" x2="395" y2="160"/><line x1="395" y1="51" x2="545" y2="160"/>
<line x1="545" y1="51" x2="95" y2="160"/><line x1="545" y1="51" x2="245" y2="160"/><line x1="545" y1="51" x2="395" y2="160"/><line x1="545" y1="51" x2="545" y2="160"/>
</g>
<line x1="95" y1="160" x2="245" y2="51" stroke="#f59e0b" stroke-width="4"/><line x1="245" y1="51" x2="395" y2="160" stroke="#f59e0b" stroke-width="4"/>
<text x="95" y="222" text-anchor="middle" class="svg-muted" font-size="12">Server A</text><text x="395" y="222" text-anchor="middle" class="svg-muted" font-size="12">Server B</text>
<text x="320" y="245" text-anchor="middle" class="svg-accent" font-size="12">A se B: LEAF1, SPINE2, LEAF3 (chaar barabar paths mein se ek)</text>
</svg><p class="cap">Har leaf har spine se juda hai. Highlight kiya flow SPINE2 par hash hua; dusra flow alag spine use kar sakta hai.</p></div>

<h3>Barabar hop count, predictable latency</h3>
<p>In rules ki wajah se ek leaf ka koi bhi server dusre leaf ke kisi bhi server tak bilkul <b>leaf, spine, leaf</b> mein pahunchta hai: teen switches, do links. Farak nahi padta ki servers kaunse racks mein hain. Scheduler VM ko kahin bhi rakh sakta hai aur network doori same rehti hai. Ise three-tier design ke 1, 3 ya 5 switches se compare karo.</p>

<h3>Routed links aur ECMP</h3>
<p>Modern fabric mein har leaf-to-spine link ek <b>routed point-to-point link</b> hota hai, normally ek /31 subnet (do addresses, broadcast address ki zaroorat nahi, RFC 3021 mein defined). Har switch ka ek <b>loopback</b> hota hai jo uska router ID aur baad mein uska tunnel endpoint banta hai. <b>OSPF</b> ya <b>IS-IS</b> jaisa IGP, ya bahut bade fabrics mein <b>eBGP</b>, loopbacks aur server subnets advertise karta hai.</p>
<p>Kyunki leaf ka har spine ke liye ek link hai aur har spine destination leaf tak same cost par pahunchta hai, routing protocol kai equal-cost routes install karta hai. Yahi <b>ECMP</b> (equal-cost multipath) hai. In links par spanning tree nahi hota, isliye kuch block nahi hota: har link forward karta hai.</p>
<pre class="out">LEAF1# show ip route 10.10.3.0/24
IP Route Table for VRF "default"
10.10.3.0/24, ubest/mbest: 4/0
<span class="hl">    *via 10.1.1.0, Eth1/49, [110/81], 3d02h, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/50, [110/81], 3d02h, ospf-UNDERLAY, intra
    *via 10.1.3.0, Eth1/51, [110/81], 3d02h, ospf-UNDERLAY, intra
    *via 10.1.4.0, Eth1/52, [110/81], 3d02h, ospf-UNDERLAY, intra</span></pre>
<p><code>ubest 4</code> ka matlab hai chaar best unicast paths. Hardware header fields (aam taur par source aur destination IP, protocol aur Layer-4 ports) ko hash karke har <b>flow</b> ke liye ek path chunta hai. Ek flow ke saare packets same path lete hain, isliye woh kabhi out of order nahi pahunchte. Bahut saare flows statistically saare spines par fail jaate hain. Trade-off: ek bahut bada flow ("elephant", jaise bada backup) ek hi link par rehta hai aur us link ki speed se zyada use nahi kar sakta.</p>

<h3>Ek packet walk</h3>
<p>LEAF1 par server A (10.10.1.10) LEAF3 par server B (10.10.3.20) ko bhejta hai. Is simple routed design mein har leaf apne rack subnet ka default gateway hai.</p>
<ol>
<li>A dekhta hai ki B dusre subnet par hai aur frame apne gateway, yaani 10.10.1.0/24 ke LEAF1 SVI ko bhejta hai.</li>
<li>LEAF1 10.10.3.0/24 lookup karta hai aur chaar barabar next hops paata hai. Woh flow ko hash karke SPINE2 ki taraf Eth1/50 chunta hai.</li>
<li>SPINE2 ke paas 10.10.3.0/24 ka bilkul ek best route hai: LEAF3 ki taraf uska link. Woh packet neeche route karta hai.</li>
<li>LEAF3 10.10.3.0/24 ka maalik hai, ARP se B ko resolve karta hai aur frame deliver karta hai.</li>
</ol>
<p>B ka reply alag spine par hash ho sakta hai. Yeh asymmetry normal aur harmless hai, kyunki spines koi per-flow state nahi rakhte. (Iske ulat stateful firewalls leaves se jude hote hain aur unhe apne through symmetric paths chahiye, jo baad ke modules ka design topic hai.)</p>

<h3>Jab ek spine fail hota hai tab kya hota hai</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Spine failure ek chauthai bandwidth hata deta hai">
<rect x="40" y="15" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="95" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="190" y="15" width="110" height="34" rx="6" fill="#fed7aa"/><text x="245" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE2 down</text>
<rect x="340" y="15" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="395" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE3</text>
<rect x="490" y="15" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="545" y="37" text-anchor="middle" class="svg-ink" font-size="13">SPINE4</text>
<rect x="265" y="115" width="110" height="34" rx="6" fill="#bae6fd"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<line x1="95" y1="49" x2="300" y2="115" stroke="#64748b" stroke-width="2"/><line x1="245" y1="49" x2="310" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="5 5"/><line x1="395" y1="49" x2="330" y2="115" stroke="#64748b" stroke-width="2"/><line x1="545" y1="49" x2="340" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="480" y="140" class="svg-accent" font-size="12">400G se 300G uplink</text>
</svg><p class="cap">N spines ke saath ek spine khone se har leaf ki uplink bandwidth ka 1/N chala jaata hai. Kuch bhi isolate nahi hota.</p></div>
<p>Jab SPINE2 mar jaata hai, har leaf apne chaar uplinks mein se ek kho deta hai. Routing protocol woh paths withdraw karta hai (BFD ke saath fast, aam taur par ek second se kaafi kam), aur ECMP flows ko bache hue teen spines par rehash karta hai. Har leaf ke paas apni uplink bandwidth ka 3/4 bacha rehta hai. Sirf do spines ho to ek failure aadhi bandwidth le jaata hai, isiliye bahut saare production fabrics chaar spines se shuru hote hain. Agar ek leaf fail ho, to sirf us se jude servers affect hote hain, isiliye zaroori servers leaves ke pair par dual-home kiye jaate hain.</p>

<h3>Scale out karna</h3>
<ul>
<li><b>Zyada server ports chahiye?</b> Ek leaf jodo aur use har spine se cable karo. Baaki kuch nahi badalta.</li>
<li><b>Racks ke beech zyada bandwidth chahiye?</b> Ek spine jodo aur har leaf ko usse cable karo (har leaf par ek free uplink port chahiye).</li>
</ul>
<p>Yahi <b>scale-out</b> hai: kuch bade boxes replace karne ki jagah ek jaise boxes jod kar growth. Agla chapter in rules ko port counts aur numbers mein badalta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> "Extra redundancy ke liye" leaf ko leaf se ya spine ko spine se cable karna: isse unequal paths bante hain aur model toot jaata hai. Alag spines ki taraf alag link speeds mix karna: OSPF unhe equal cost maan sakta hai aur slow link ko bhi barabar share bhejega. Yeh bhoolna ki naye spine ko har leaf se cable karna padta hai, sirf kuch se nahi.</p></div>
<div class="exam"><p><b>Exam tip.</b> Rules: har leaf har spine se, koi leaf-leaf transport links nahi, koi spine-spine links nahi, endpoints sirf leaves par. Any-to-any = leaf, spine, leaf. ECMP per flow hai, per packet nahi. Ports ke liye leaves jodo, bandwidth ke liye spines. N mein se ek spine khone par 1/N bandwidth jaati hai.</p></div>

<div class="scn"><h4>Woh spine jise zyada traffic mila</h4><p>Ek fintech fabric mein 100G uplinks ke saath chaar spines the. Hardware swap ke baad application teams ne ek chauthai flows par random packet drops dekhe. Engineer ne LEAF5 par <code>show interface ethernet1/51</code> check kiya aur use 40G par chalta paaya: technician ne 40G QSFP+ optic laga diya tha. NX-OS ka default OSPF reference bandwidth 40 Gbit/s hai, isliye 40G aur 100G dono links ki cost 1 thi. ECMP ab bhi ek chauthai traffic 40G link par bhej raha tha, jo overflow ho gaya. Fix tha sahi 100G optic lagana, aur har switch par consistently <code>auto-cost reference-bandwidth 400 Gbps</code> set karna taaki slow link ko zyada cost mile aur woh automatically avoid ho.</p><p><b>Seekh:</b> ECMP maan kar chalta hai ki parallel paths sach mein barabar hain; har leaf-to-spine link same speed ka rakho aur aisa reference bandwidth set karo jo modern speeds mein farak kar sake.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki spine-leaf fabric mein ek spine fail hone par kya hota hai."</p><p>Strong answer: har leaf us spine ki taraf apna link down hota detect karta hai (link loss ya BFD), IGP ya BGP un next hops ko withdraw karta hai, aur ECMP flows ko bache hue spines par rehash karta hai. Koi server isolate nahi hota; har leaf apni uplink bandwidth ka 1/N kho deta hai, to chaar spines ke saath aap 100% se 75% par aate ho. Yeh bhi batao ki failed spine wale flows ko chhota interruption dikhta hai, oversubscription temporarily bura ho jaata hai, aur isiliye aap N-1 ke liye size karte ho aur do ki jagah chaar spines prefer karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Spine-leaf fabric ek folded three-stage Clos network hai: leaf, spine, leaf.</li>
<li>Har leaf har spine se; koi leaf-leaf ya spine-spine transport links nahi; saare endpoints leaves par.</li>
<li>Routed /31 links plus loopbacks aur ek IGP kai equal-cost paths dete hain; ECMP per flow hash karta hai.</li>
<li>N mein se ek spine khone par 1/N bandwidth jaati hai; ek leaf khone par sirf uska rack affect hota hai.</li>
<li>Scale out: ports ke liye zyada leaves, bandwidth ke liye zyada spines.</li>
</ul></div>
`}};export{e as default};