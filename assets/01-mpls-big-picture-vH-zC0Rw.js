var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Deccan Net MPLS core"><rect x="10" y="70" width="70" height="40" rx="8" fill="#fde68a"/><text x="45" y="95" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><rect x="110" y="60" width="80" height="60" rx="8" fill="#bae6fd"/><text x="150" y="95" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><rect x="240" y="60" width="80" height="60" rx="8" fill="#ddd6fe"/><text x="280" y="95" text-anchor="middle" class="svg-ink" font-size="14">P1</text><rect x="370" y="60" width="80" height="60" rx="8" fill="#ddd6fe"/><text x="410" y="95" text-anchor="middle" class="svg-ink" font-size="14">P2</text><rect x="500" y="60" width="80" height="60" rx="8" fill="#bae6fd"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="14">PE2</text><rect x="595" y="70" width="40" height="40" rx="8" fill="#fde68a"/><text x="615" y="95" text-anchor="middle" class="svg-ink" font-size="12">PC2</text><line x1="80" y1="90" x2="110" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="90" x2="240" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="90" x2="370" y2="90" stroke="#64748b" stroke-width="2"/><line x1="450" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="580" y1="90" x2="595" y2="90" stroke="#64748b" stroke-width="2"/><text x="215" y="82" text-anchor="middle" class="svg-muted" font-size="11">10.0.12.0/24</text><text x="345" y="82" text-anchor="middle" class="svg-muted" font-size="11">10.0.23.0/24</text><text x="475" y="82" text-anchor="middle" class="svg-muted" font-size="11">10.0.34.0/24</text><text x="150" y="150" text-anchor="middle" class="svg-accent" font-size="12">`+t+`</text><text x="540" y="150" text-anchor="middle" class="svg-accent" font-size="12">`+n+`</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Loopbacks 10.0.255.1 to .4, IS-IS level 2, wide metrics</text></svg><p class="cap">`+e+`</p></div>`,t={id:`mpls-big-picture`,h:{en:`MPLS in the SP core: what you will learn and the big picture`,hi:`SP core mein MPLS: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will turn an IS-IS core into an MPLS core with LDP, read the label tables, understand push, swap and pop and penultimate hop popping, and learn why LDP-IGP synchronization exists. You will also meet LDP session protection, MPLS OAM and unified MPLS at describe level, and troubleshoot a core where IP works but labelled traffic dies. This is the MPLS-LDP part of the SPCOR 350-501 core-architecture objectives.</p>
<p><b>Prerequisites.</b> IS-IS with loopbacks (wide metrics, level 2) and basic BGP. If you finished the BGP-in-the-SP-core module you already know why customer routes do not belong in the IGP.</p>

<h3>Analogy: express lanes with coloured tags</h3>
<p>Imagine a courier company with several sorting depots. At the first depot a clerk reads the full destination address on the parcel, looks it up, and sticks a small <b>coloured tag</b> on it. Every depot after that only reads the tag: tag 21 goes out the north door, and gets retagged 19. Nobody in the middle needs the address book. At the last depot the tag is removed and the parcel is delivered. The tag is an <b>MPLS label</b>; the first clerk is the <b>ingress PE</b>; the middle depots are <b>P routers</b>; the tag change is a <b>swap</b>.</p>

@@D@@

<h3>Why MPLS exists in an SP network</h3>
<ul>
<li><b>BGP-free core.</b> P routers forward on labels to PE loopbacks. They do not need the Internet or customer routes, so they stay small and fast.</li>
<li><b>Services.</b> VPNs (next module), pseudowires and traffic engineering ride on label stacks.</li>
<li><b>Simple, uniform forwarding.</b> A label lookup is exact-match and the label tells the egress.</li>
</ul>
<p>The two protocols you meet first: the <b>IGP (IS-IS)</b> finds the shortest path to each loopback, and <b>LDP (Label Distribution Protocol)</b> hands out labels for those paths. LDP does not choose paths. It follows the IGP.</p>

<h3>The lab topology</h3>
<p>Deccan Net's core is PE1, P1, P2 and PE2, in a line, with PC1 behind PE1 (192.168.1.0/24) and PC2 behind PE2 (192.168.2.0/24). Links: PE1-P1 10.0.12.0/24, P1-P2 10.0.23.0/24, P2-PE2 10.0.34.0/24. Loopbacks are 10.0.255.1 (PE1), .2 (P1), .3 (P2), .4 (PE2). IS-IS is level 2 with wide metrics on all core links. In the second lab the core is a diamond with two paths of different cost.</p>

<div class="eg"><p><b>Worked example: the starting point.</b> Before you configure anything, the network routes with plain IP and the label tables are empty. Real output from PE1 before MPLS:</p>
<pre class="out">PE1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational

PE1# show mpls ldp neighbor

PE1# traceroute 192.168.2.10
  1 10.0.12.2 1 msec 2 msec 1 msec
  2 10.0.23.3 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec</pre>
<p>No MPLS interfaces, no neighbours, and the traceroute shows no [MPLS: Label ...] lines: every hop does an IP lookup. After the lab, the same traceroute will show labels.</p></div>

<h3>The label header</h3>
<p>An MPLS label is 32 bits placed between the Layer 2 and Layer 3 headers (sometimes called a shim header): <b>20 bits label</b> value, <b>3 bits</b> traffic class (formerly EXP, used for QoS), <b>1 bit</b> bottom-of-stack, and <b>8 bits</b> TTL. Several labels can be stacked; the bottom-of-stack bit marks the last one. A real network needs a slightly bigger MTU (4 bytes per label) so that labelled packets do not fragment.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking MPLS replaces the IGP. It does not: if IS-IS has no route to a loopback, LDP has nothing to label. The IGP chooses the path; LDP only attaches labels to it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Labels have only <i>local</i> meaning on a link: the label that PE1 uses toward P1 is not the same as the label P1 uses toward P2. Know that a label is 20 bits and the header is 32 bits.</p></div>

<div class="scn"><h4>The core with 400,000 routes in every router</h4><p>A regional carrier ran IP only: every core router carried the full customer table and needed expensive memory upgrades every year. After moving to MPLS with a BGP-free core, only the PEs carried customer routes and the P routers held only a few hundred IGP prefixes.</p><p><b>Lesson:</b> MPLS lets the middle of the network forget the customers.</p></div>

<div class="iv"><p class="q">"Why use MPLS in a service provider network?"</p><p>It lets the core forward on labels to PE loopbacks without holding customer or Internet routes, and it carries services such as L3VPN, L2VPN and traffic engineering on label stacks. LDP follows the IGP: the IGP picks the best path and LDP binds labels to it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS forwards on short labels; P routers do not need customer routes.</li>
<li>The IGP selects paths; LDP assigns labels to the IGP prefixes.</li>
<li>Label header: 20-bit label, 3-bit TC, 1-bit S, 8-bit TTL.</li>
<li>Roles: ingress PE pushes, P routers swap, penultimate router pops.</li>
<li>Lab devices: PE1, P1, P2, PE2 with loopbacks 10.0.255.1 to .4.</li>
</ul></div>
`.replace(`@@D@@`,e(`Deccan Net core: PE1 - P1 - P2 - PE2, with a customer PC at each end.`,`ingress: push label`,`egress: label removed`)),hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap IS-IS core ko LDP se MPLS core banaoge, label tables padhoge, push, swap aur pop aur penultimate hop popping samjhoge, aur seekhoge ki LDP-IGP synchronization kyun hai. Saath mein LDP session protection, MPLS OAM aur unified MPLS describe level par milenge, aur aise core ko troubleshoot karoge jahan IP chalta hai par labelled traffic mar jaata hai. Yeh SPCOR 350-501 core-architecture objectives ka MPLS-LDP hissa hai.</p>
<p><b>Prerequisites.</b> Loopbacks ke saath IS-IS (wide metrics, level 2) aur basic BGP. Agar aapne BGP-in-the-SP-core module khatam kiya hai to aap jaante ho ki customer routes IGP mein kyun nahi hote.</p>

<h3>Analogy: rangeen tags wali express lanes</h3>
<p>Ek courier company socho jiske kai sorting depots hain. Pehle depot par clerk parcel ka poora destination address padhta hai, lookup karta hai, aur ek chhota <b>rangeen tag</b> chipka deta hai. Uske baad har depot sirf tag padhta hai: tag 21 north door se jaata hai, aur use 19 se retag kiya jaata hai. Beech mein kisi ko address book nahi chahiye. Aakhri depot par tag hata diya jaata hai aur parcel deliver hota hai. Tag ek <b>MPLS label</b> hai; pehla clerk <b>ingress PE</b>; beech ke depots <b>P routers</b>; tag badalna <b>swap</b> hai.</p>

@@D@@

<h3>SP network mein MPLS kyun hai</h3>
<ul>
<li><b>BGP-free core.</b> P routers PE loopbacks tak labels par forward karte hain. Unhe Internet ya customer routes nahi chahiye, isliye woh chhote aur fast rehte hain.</li>
<li><b>Services.</b> VPNs (agla module), pseudowires aur traffic engineering label stacks par chalte hain.</li>
<li><b>Simple, uniform forwarding.</b> Label lookup exact-match hai aur label egress batata hai.</li>
</ul>
<p>Do protocols jo aap pehle milte ho: <b>IGP (IS-IS)</b> har loopback ka shortest path dhoondhta hai, aur <b>LDP (Label Distribution Protocol)</b> un paths ke liye labels deta hai. LDP paths nahi chunta. Woh IGP ko follow karta hai.</p>

<h3>Lab topology</h3>
<p>Deccan Net ka core PE1, P1, P2 aur PE2 hai, ek line mein, PC1 PE1 ke peeche (192.168.1.0/24) aur PC2 PE2 ke peeche (192.168.2.0/24). Links: PE1-P1 10.0.12.0/24, P1-P2 10.0.23.0/24, P2-PE2 10.0.34.0/24. Loopbacks 10.0.255.1 (PE1), .2 (P1), .3 (P2), .4 (PE2) hain. Saare core links par IS-IS level 2 wide metrics ke saath hai. Doosre lab mein core diamond hai jisme alag cost ke do paths hain.</p>

<div class="eg"><p><b>Worked example: shuruaati halat.</b> Kuch configure karne se pehle network plain IP se route karta hai aur label tables khaali hain. MPLS se pehle PE1 ka real output:</p>
<pre class="out">PE1# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational

PE1# show mpls ldp neighbor

PE1# traceroute 192.168.2.10
  1 10.0.12.2 1 msec 2 msec 1 msec
  2 10.0.23.3 2 msec 3 msec 2 msec
  3 10.0.34.4 3 msec 4 msec 3 msec
  4 192.168.2.10 4 msec 5 msec 4 msec</pre>
<p>Koi MPLS interface nahi, koi neighbour nahi, aur traceroute mein [MPLS: Label ...] lines nahi: har hop IP lookup karta hai. Lab ke baad wahi traceroute labels dikhayega.</p></div>

<h3>Label header</h3>
<p>MPLS label 32 bits ka hota hai jo Layer 2 aur Layer 3 headers ke beech rakha jaata hai (kabhi shim header kehte hain): <b>20 bits label</b> value, <b>3 bits</b> traffic class (pehle EXP, QoS ke liye), <b>1 bit</b> bottom-of-stack, aur <b>8 bits</b> TTL. Kai labels stack ho sakte hain; bottom-of-stack bit aakhri label ko mark karta hai. Real network mein thoda bada MTU chahiye (har label ke 4 bytes) taaki labelled packets fragment na hon.</p>

<div class="warn"><p><b>Common mistake.</b> Sochna ki MPLS IGP ko replace karta hai. Aisa nahi hai: IS-IS ke paas loopback ka route na ho to LDP ke paas label lagane ko kuch nahi. IGP path chunta hai; LDP sirf us par labels lagata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Labels ka meaning sirf <i>local</i> link par hota hai: PE1 jo label P1 ki taraf use karta hai woh wahi nahi jo P1 P2 ki taraf use karta hai. Yaad rakho label 20 bits ka aur header 32 bits ka hai.</p></div>

<div class="scn"><h4>Har router mein 400,000 routes wala core</h4><p>Ek regional carrier sirf IP chalata tha: har core router poori customer table rakhta tha aur har saal mehngi memory upgrade chahiye thi. BGP-free core ke saath MPLS par jaane ke baad sirf PEs customer routes rakhte the aur P routers ke paas sirf kuch sau IGP prefixes the.</p><p><b>Lesson:</b> MPLS network ke beech ko customers bhulne deta hai.</p></div>

<div class="iv"><p class="q">"Service provider network mein MPLS kyun use karte hain?"</p><p>Yeh core ko customer ya Internet routes rakhe bina PE loopbacks tak labels par forward karne deta hai, aur L3VPN, L2VPN aur traffic engineering jaisi services ko label stacks par le jaata hai. LDP IGP ko follow karta hai: IGP best path chunta hai aur LDP us par labels bind karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS chhote labels par forward karta hai; P routers ko customer routes nahi chahiye.</li>
<li>IGP paths chunta hai; LDP IGP prefixes ko labels assign karta hai.</li>
<li>Label header: 20-bit label, 3-bit TC, 1-bit S, 8-bit TTL.</li>
<li>Roles: ingress PE push, P routers swap, penultimate router pop.</li>
<li>Lab devices: PE1, P1, P2, PE2, loopbacks 10.0.255.1 se .4.</li>
</ul></div>
`.replace(`@@D@@`,e(`Deccan Net core: PE1 - P1 - P2 - PE2, dono ends par customer PC.`,`ingress: label push`,`egress: label hata`))}};export{t as default};