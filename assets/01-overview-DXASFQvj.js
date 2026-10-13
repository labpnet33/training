var e={id:`overview`,h:{en:`EVPN-VXLAN: what you will learn and the big picture`,hi:`EVPN-VXLAN: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will build a modern data centre fabric the way Juniper engineers do. You will learn why VLANs alone stop working in a big data centre, how VXLAN tunnels carry Layer 2 frames across a routed IP network, how BGP EVPN tells every switch which MAC addresses live where, and how a server can connect to two switches at once without loops. At the end you will configure a two-leaf fabric, add a second VNI, read EVPN routes, and troubleshoot a fabric where nothing works. These are the EVPN-VXLAN objectives of the JNCIP-ENT exam (JN0-650).</p>
<p><b>Prerequisites.</b> You should know VLANs and trunk ports, basic OSPF, and the idea of an IBGP session between loopbacks. These come from JNCIA, JNCIS-ENT and the earlier JNCIP modules (OSPF, BGP, switching). If you have never typed a Junos <code>set</code> command, finish the Junos CLI module first. You do not need any data centre experience. We start from zero.</p>

<h3>Analogy: a company with offices in many buildings</h3>
<p>Imagine a company whose Finance team sits on the 3rd floor of three different buildings across Kochi. Everyone in Finance wants to feel they are in <i>one open-plan office</i>, so they can walk to a colleague and talk. Building the real thing is impossible, so the company runs a private shuttle service. Each building has a <b>reception desk</b> that packs a colleague's message into a sealed courier envelope and sends it by road to the other building's reception, which unpacks it and hands it to the right person. The road network is just roads: it does not know or care what is inside the envelopes.</p>
<p>That is exactly EVPN-VXLAN. The roads are the <b>underlay</b>, an ordinary routed IP network. The envelope is <b>VXLAN</b>. The reception desk is the <b>VTEP</b> (VXLAN tunnel end point), which on Junos is your leaf switch. And the directory that tells each reception desk "Priya sits in building 2" is <b>EVPN</b>, carried by BGP. No directory means every desk must shout into every building to find Priya. That is flood-and-learn, and EVPN removes it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Leaf spine fabric with a VXLAN tunnel">
<rect x="250" y="20" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">SPINE1 (RR)</text>
<rect x="60" y="130" width="140" height="44" rx="10" fill="#bae6fd"/><text x="130" y="152" text-anchor="middle" class="svg-ink" font-size="14">LEAF1</text><text x="130" y="168" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.30.255.11</text>
<rect x="440" y="130" width="140" height="44" rx="10" fill="#bae6fd"/><text x="510" y="152" text-anchor="middle" class="svg-ink" font-size="14">LEAF2</text><text x="510" y="168" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.30.255.12</text>
<line x1="290" y1="64" x2="150" y2="130" stroke="#64748b" stroke-width="2"/><line x1="350" y1="64" x2="490" y2="130" stroke="#64748b" stroke-width="2"/>
<path d="M200 190 Q320 225 440 190" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="214" text-anchor="middle" class="svg-accent" font-size="12">VXLAN tunnel, VNI 1010 (UDP 4789)</text>
<rect x="10" y="190" width="70" height="28" rx="6" fill="#bbf7d0"/><text x="45" y="209" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="560" y="190" width="70" height="28" rx="6" fill="#bbf7d0"/><text x="595" y="209" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<line x1="100" y1="174" x2="60" y2="190" stroke="#64748b" stroke-width="2"/><line x1="540" y1="174" x2="580" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">PC1 and PC2 share one subnet although they sit behind different leaves; the tunnel runs between the leaf loopbacks.</p></div>

<h3>The lab you will keep seeing</h3>
<p>Every chapter reuses the same small pods, so the numbers become familiar. Each pod has one spine (<code>SPINE1</code>) and two QFX-style leaves (<code>LEAF1</code>, <code>LEAF2</code>). Fabric links are /31 point-to-point addresses, and each device has a <code>lo0</code> loopback of the form <code>10.P.255.x/32</code> where P is the pod number.</p>
<table class="cmp"><tr><th>Lab</th><th>Pod / AS</th><th>Goal</th></tr>
<tr><td>Build a two-leaf fabric</td><td>30 / 65030</td><td>Overlay, VNI 1010, PC1 to PC2</td></tr>
<tr><td>Second VNI</td><td>40 / 65040</td><td>Add VNI 1020, read type-2 and type-3 routes, own route target</td></tr>
<tr><td>Troubleshoot</td><td>50 / 65050</td><td>Two faults, SALES and OPS stretched VLANs</td></tr></table>

<h3>The path through this module</h3>
<ol>
<li>Why VXLAN exists, and the words overlay, underlay, VNI, VTEP.</li>
<li>The underlay and the BGP overlay with a route-reflector spine.</li>
<li>The five EVPN route types and what each one is for.</li>
<li>Configuring a leaf: instance, RD, route target, VNI list.</li>
<li>A second VNI and reading real EVPN output.</li>
<li>Multihoming with ESI, designated forwarder and aliasing.</li>
<li>A repeatable troubleshooting method, with the lab tickets worked through.</li>
<li>Summary and exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Priya in Finance has host PC1 (10.30.10.21) behind LEAF1. Her colleague has PC2 (10.30.10.22) behind LEAF2. Both are in VLAN V10 and subnet 10.30.10.0/24. PC1 sends a frame to PC2's MAC. LEAF1 knows from EVPN that this MAC lives behind VTEP 10.30.255.12, wraps the frame in VXLAN with VNI 1010, and sends it as an ordinary IP packet from 10.30.255.11 to 10.30.255.12. The spine just routes that packet. LEAF2 unwraps it and delivers the original frame. PC1 and PC2 never learn a tunnel exists.</p></div>

<div class="note"><p>This module uses a <b>bridged overlay</b>: Layer 2 only, with no IRB gateway interfaces. Routing between VNIs (centrally routed and edge routed designs) is explained as a concept in the multihoming chapter, so you can answer exam questions on it.</p></div>

<div class="scn"><h4>The stretched VLAN request</h4><p>A bank in Hyderabad needed its payment servers in the same subnet in two server rooms, because a legacy application used broadcast discovery. The old answer was a trunk between rooms and spanning tree across them. One loop in room B took both rooms offline for 40 minutes. The new design used EVPN-VXLAN: each room got a leaf, the rooms were joined by routed links, and the same subnet was stretched with VNI 1010. A cabling mistake in room B now only affected room B, because there was no Layer 2 path between rooms for the loop to follow.</p><p><b>Lesson:</b> EVPN-VXLAN gives you the same-subnet convenience without a shared Layer 2 failure domain.</p></div>

<div class="iv"><p class="q">"Explain EVPN-VXLAN in two sentences."</p><p>VXLAN is the data plane: it tunnels Ethernet frames inside UDP across a routed IP underlay, using a 24-bit VNI to identify the segment. EVPN is the control plane: BGP address family evpn distributes MAC/IP reachability and VTEP membership, replacing flood-and-learn. Mention underlay versus overlay and you sound like you have built one.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN-VXLAN stretches Layer 2 segments across a routed Layer 3 fabric.</li>
<li>VXLAN is the data plane (encapsulation); EVPN over BGP is the control plane (who is where).</li>
<li>The leaf is the VTEP; its loopback is the tunnel address.</li>
<li>The underlay only has to carry IP between loopbacks; it never sees tenant MACs.</li>
<li>Three labs (pods 30, 40, 50) use one spine and two leaves each.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap ek modern data centre fabric banaoge, jaise Juniper engineers banate hain. Aap seekhoge ki bade data centre mein akele VLANs kyun kaam karna band kar dete hain, VXLAN tunnels Layer 2 frames ko routed IP network ke paar kaise le jaate hain, BGP EVPN har switch ko kaise batata hai ki kaunsa MAC address kahan hai, aur ek server bina loop ke ek saath do switches se kaise juda ho sakta hai. Akhir mein aap do-leaf fabric configure karoge, doosra VNI jodoge, EVPN routes padhoge, aur aise fabric ko troubleshoot karoge jahan kuch kaam nahi kar raha. Yeh JNCIP-ENT exam (JN0-650) ke EVPN-VXLAN objectives hain.</p>
<p><b>Prerequisites.</b> Aapko VLANs aur trunk ports, basic OSPF, aur loopbacks ke beech IBGP session ka idea pata hona chahiye. Yeh JNCIA, JNCIS-ENT aur pehle ke JNCIP modules (OSPF, BGP, switching) se aata hai. Agar aapne kabhi Junos <code>set</code> command nahi likha, to pehle Junos CLI module khatam karo. Data centre ka experience zaroori nahi. Hum zero se shuru karte hain.</p>

<h3>Analogy: kai buildings mein offices wali company</h3>
<p>Ek company socho jiski Finance team Kochi ki teen alag buildings ki 3rd floor par baithti hai. Sab chahte hain ki lage ki sab <i>ek hi open-plan office</i> mein hain, taaki kisi colleague ke paas jaakar baat kar sakein. Asli cheez banana mumkin nahi, to company private shuttle service chalati hai. Har building ka ek <b>reception desk</b> hota hai jo colleague ka message sealed courier envelope mein pack karke road se doosri building ke reception tak bhejta hai, jo use kholkar sahi insaan ko de deta hai. Road network sirf roads hain: use pata nahi aur parwah nahi ki envelopes ke andar kya hai.</p>
<p>Yahi EVPN-VXLAN hai. Roads <b>underlay</b> hain, ek aam routed IP network. Envelope <b>VXLAN</b> hai. Reception desk <b>VTEP</b> (VXLAN tunnel end point) hai, jo Junos par aapka leaf switch hota hai. Aur directory jo har reception desk ko batati hai "Priya building 2 mein baithti hai" woh <b>EVPN</b> hai, jo BGP par chalti hai. Directory na ho to har desk ko Priya ko dhoondhne ke liye har building mein chillana padega. Yeh flood-and-learn hai, aur EVPN ise hata deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Leaf spine fabric with a VXLAN tunnel">
<rect x="250" y="20" width="140" height="44" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">SPINE1 (RR)</text>
<rect x="60" y="130" width="140" height="44" rx="10" fill="#bae6fd"/><text x="130" y="152" text-anchor="middle" class="svg-ink" font-size="14">LEAF1</text><text x="130" y="168" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.30.255.11</text>
<rect x="440" y="130" width="140" height="44" rx="10" fill="#bae6fd"/><text x="510" y="152" text-anchor="middle" class="svg-ink" font-size="14">LEAF2</text><text x="510" y="168" text-anchor="middle" class="svg-muted" font-size="12">VTEP 10.30.255.12</text>
<line x1="290" y1="64" x2="150" y2="130" stroke="#64748b" stroke-width="2"/><line x1="350" y1="64" x2="490" y2="130" stroke="#64748b" stroke-width="2"/>
<path d="M200 190 Q320 225 440 190" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/><text x="320" y="214" text-anchor="middle" class="svg-accent" font-size="12">VXLAN tunnel, VNI 1010 (UDP 4789)</text>
<rect x="10" y="190" width="70" height="28" rx="6" fill="#bbf7d0"/><text x="45" y="209" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="560" y="190" width="70" height="28" rx="6" fill="#bbf7d0"/><text x="595" y="209" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<line x1="100" y1="174" x2="60" y2="190" stroke="#64748b" stroke-width="2"/><line x1="540" y1="174" x2="580" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">PC1 aur PC2 alag leaves ke peeche hain phir bhi ek subnet share karte hain; tunnel leaf loopbacks ke beech chalta hai.</p></div>

<h3>Lab jo aap baar-baar dekhoge</h3>
<p>Har chapter wahi chhote pods use karta hai, taaki numbers jaane-pehchane lagein. Har pod mein ek spine (<code>SPINE1</code>) aur do QFX-style leaves (<code>LEAF1</code>, <code>LEAF2</code>) hain. Fabric links /31 point-to-point addresses hain, aur har device ka <code>lo0</code> loopback <code>10.P.255.x/32</code> form mein hai jahan P pod number hai.</p>
<table class="cmp"><tr><th>Lab</th><th>Pod / AS</th><th>Goal</th></tr>
<tr><td>Do-leaf fabric banao</td><td>30 / 65030</td><td>Overlay, VNI 1010, PC1 se PC2</td></tr>
<tr><td>Doosra VNI</td><td>40 / 65040</td><td>VNI 1020 jodo, type-2 aur type-3 routes padho, apna route target</td></tr>
<tr><td>Troubleshoot</td><td>50 / 65050</td><td>Do faults, SALES aur OPS stretched VLANs</td></tr></table>

<h3>Is module ka raasta</h3>
<ol>
<li>VXLAN kyun hai, aur overlay, underlay, VNI, VTEP shabd.</li>
<li>Underlay aur route-reflector spine ke saath BGP overlay.</li>
<li>Paanch EVPN route types aur har ka kaam.</li>
<li>Leaf configure karna: instance, RD, route target, VNI list.</li>
<li>Doosra VNI aur asli EVPN output padhna.</li>
<li>ESI, designated forwarder aur aliasing ke saath multihoming.</li>
<li>Repeatable troubleshooting method, lab tickets ke saath.</li>
<li>Summary aur exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Finance ki Priya ka host PC1 (10.30.10.21) LEAF1 ke peeche hai. Uske colleague ka PC2 (10.30.10.22) LEAF2 ke peeche hai. Dono VLAN V10 aur subnet 10.30.10.0/24 mein hain. PC1 PC2 ke MAC ko frame bhejta hai. LEAF1 ko EVPN se pata hai ki yeh MAC VTEP 10.30.255.12 ke peeche hai, woh frame ko VNI 1010 ke saath VXLAN mein lapet kar use aam IP packet ki tarah 10.30.255.11 se 10.30.255.12 ko bhejta hai. Spine bas us packet ko route karta hai. LEAF2 use kholkar original frame deliver karta hai. PC1 aur PC2 ko kabhi pata nahi chalta ki tunnel hai.</p></div>

<div class="note"><p>Yeh module <b>bridged overlay</b> use karta hai: sirf Layer 2, IRB gateway interfaces ke bina. VNIs ke beech routing (centrally routed aur edge routed designs) multihoming chapter mein concept ke roop mein samjhayi gayi hai, taaki aap exam ke sawaal ka jawab de sakein.</p></div>

<div class="scn"><h4>Stretched VLAN ki request</h4><p>Hyderabad ke ek bank ko do server rooms mein payment servers ek hi subnet mein chahiye the, kyunki ek legacy application broadcast discovery use karti thi. Purana jawab tha rooms ke beech trunk aur unke paar spanning tree. Room B mein ek loop se dono rooms 40 minute ke liye down ho gaye. Naye design mein EVPN-VXLAN use hua: har room ko ek leaf mila, rooms routed links se jude, aur wahi subnet VNI 1010 se stretch hua. Room B mein cabling ki galti ab sirf room B ko affect karti, kyunki rooms ke beech koi Layer 2 path nahi tha jise loop follow kar sake.</p><p><b>Lesson:</b> EVPN-VXLAN same-subnet ki suvidha deta hai, bina shared Layer 2 failure domain ke.</p></div>

<div class="iv"><p class="q">"EVPN-VXLAN ko do sentences mein samjhao."</p><p>VXLAN data plane hai: yeh Ethernet frames ko UDP ke andar routed IP underlay ke paar tunnel karta hai, segment pehchanne ke liye 24-bit VNI ke saath. EVPN control plane hai: BGP address family evpn MAC/IP reachability aur VTEP membership baantta hai, flood-and-learn ki jagah. Underlay versus overlay ka zikr karoge to lagega ki aapne asli mein fabric banaya hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN-VXLAN Layer 2 segments ko routed Layer 3 fabric ke paar stretch karta hai.</li>
<li>VXLAN data plane (encapsulation) hai; BGP par EVPN control plane (kaun kahan hai) hai.</li>
<li>Leaf hi VTEP hai; uska loopback tunnel address hai.</li>
<li>Underlay ko sirf loopbacks ke beech IP le jaana hai; use tenant MACs kabhi nahi dikhte.</li>
<li>Teen labs (pods 30, 40, 50) mein har ek mein ek spine aur do leaves hain.</li>
</ul></div>
`}};export{e as default};