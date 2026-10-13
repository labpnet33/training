var e={id:`domains-big-picture`,h:{en:`The big picture: collision and broadcast domains`,hi:`Big picture: collision aur broadcast domains`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a Junos network is addressed and how a router decides where to send a packet: Ethernet, MAC addresses and ARP, IPv4 and binary, subnetting with VLSM, supernetting, IPv6, longest-prefix match, TCP versus UDP and the basics of class of service. Two labs follow: you address a small office (the Nashik office) and you fix a routing mistake caused by a stale route.</p>
<p><b>Prerequisites.</b> The module "Networking and Junos from zero" (packets, switch versus router, the candidate configuration and commit). You should be able to enter <code>configure</code>, type <code>set</code> commands and <code>commit</code>.</p>

<h3>An analogy: apartments and shouting</h3>
<p>Imagine a building. If everyone lives in one giant hall and talks at once, nobody can be heard: that is a <b>collision domain</b> on an old hub. If each family has its own flat with a private door, nobody interrupts anybody: that is one collision domain per switch port. Now think of a loudspeaker announcement: "Who owns the red car?" Everyone on the same floor hears it, but not people in other buildings. That announcement is a <b>broadcast</b>, and the floor is the <b>broadcast domain</b>.</p>

<h3>The two definitions</h3>
<p>A <b>collision domain</b> is the set of devices whose frames can collide because they share one half-duplex medium. A <b>broadcast domain</b> is the set of devices that receive each other's broadcast frames, for example ARP requests. Exam questions ask you to <i>count</i> them.</p>

<table class="cmp"><tr><th>Device</th><th>Layer</th><th>Collision domains</th><th>Broadcast domains</th></tr>
<tr><td>Hub</td><td>1</td><td>one for all ports</td><td>one for all ports</td></tr>
<tr><td>Switch (EX)</td><td>2</td><td>one per port</td><td>one per VLAN</td></tr>
<tr><td>Router (MX, SRX, vMX)</td><td>3</td><td>one per port</td><td>one per interface</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Domains on a switch and router">
<rect x="20" y="20" width="270" height="190" rx="10" fill="#bae6fd" fill-opacity="0.5"/><text x="155" y="40" text-anchor="middle" class="svg-ink" font-size="13">Broadcast domain A (VLAN 10)</text>
<rect x="350" y="20" width="270" height="190" rx="10" fill="#bbf7d0" fill-opacity="0.5"/><text x="485" y="40" text-anchor="middle" class="svg-ink" font-size="13">Broadcast domain B (VLAN 20)</text>
<rect x="215" y="85" width="210" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">Router / IRB (separates them)</text>
<rect x="40" y="70" width="80" height="30" rx="6" fill="#fde68a"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="40" y="130" width="80" height="30" rx="6" fill="#fde68a"/><text x="80" y="150" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="520" y="70" width="80" height="30" rx="6" fill="#fde68a"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="12">PC3</text>
<rect x="520" y="130" width="80" height="30" rx="6" fill="#fde68a"/><text x="560" y="150" text-anchor="middle" class="svg-ink" font-size="12">PC4</text>
<line x1="120" y1="85" x2="215" y2="105" stroke="#64748b" stroke-width="2"/><line x1="120" y1="145" x2="215" y2="120" stroke="#64748b" stroke-width="2"/><line x1="425" y1="105" x2="520" y2="85" stroke="#64748b" stroke-width="2"/><line x1="425" y1="120" x2="520" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Two VLANs mean two broadcast domains. Only the router (or IRB) connects them, and it does not forward broadcasts.</p></div>

<h3>What each device does on Junos</h3>
<ul><li>A <b>switch</b> forwards frames by destination <b>MAC address</b> using its MAC table (<code>show ethernet-switching table</code> on EX). Unknown unicast and broadcast frames are flooded inside the VLAN.</li>
<li>A <b>router</b> forwards packets by destination <b>IP address</b> using its routing table (<code>show route</code>). Every router interface is its own subnet and broadcast domain.</li>
<li>An EX switch with an <b>IRB</b> interface (for example <code>irb.10</code>) is both: it switches inside VLAN 10 and routes between VLANs.</li></ul>

<div class="eg"><p><b>Worked example.</b> An EX switch has 24 access ports: 12 in VLAN SALES and 12 in VLAN ENG, with no IRB. Collision domains: 24 (one per full-duplex port). Broadcast domains: 2. Connect the switch to a router with one link per VLAN: still 2 VLAN broadcast domains on the switch, and the router keeps them apart.</p></div>

<div class="warn"><p><b>Common mistake.</b> Answering "24 broadcast domains" for a switch with 24 ports. Ports make collision domains; VLANs make broadcast domains. Also remember that on a full-duplex switched link there are no collisions at all. Collisions or late collisions on a modern link usually point to a <b>duplex mismatch</b>.</p></div>

<div class="scn"><h4>The slow flat network</h4><p>A small factory had 300 devices in one VLAN. Users complained that Wi-Fi scanners and printers were slow every morning. A capture showed thousands of ARP and other broadcasts per second reaching every device. The engineer split the network into four VLANs of about 75 devices, each with its own IRB gateway. Broadcast noise fell by about three quarters and the morning slowness disappeared.</p><p><b>Lesson:</b> smaller broadcast domains mean less noise; routers or IRBs connect them.</p></div>

<div class="iv"><p class="q">"How many collision and broadcast domains does a 24-port switch with two VLANs have?"</p><p>Answer: 24 collision domains (one per port) and 2 broadcast domains (one per VLAN). Add that a router separates broadcast domains, a hub has one of each, and that collisions on a switched link suggest a duplex mismatch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Collision domain = shared half-duplex medium; a switch gives one per port.</li>
<li>Broadcast domain = devices that hear each other's broadcasts; one per VLAN, one per router interface.</li>
<li>Switches use MAC addresses (layer 2); routers use IP addresses (layer 3).</li>
<li>An IRB interface lets an EX switch route between VLANs.</li>
<li>Collisions on a modern link usually mean a duplex mismatch.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Junos network mein addressing kaise hoti hai aur router kaise tay karta hai ki packet kahan bhejna hai: Ethernet, MAC addresses aur ARP, IPv4 aur binary, VLSM ke saath subnetting, supernetting, IPv6, longest-prefix match, TCP versus UDP aur class of service ki basics. Do labs aate hain: aap ek chhote office (Nashik office) ko address karte ho aur stale route se hui routing ki galti theek karte ho.</p>
<p><b>Prerequisites.</b> "Networking and Junos from zero" module (packets, switch versus router, candidate configuration aur commit). Aapko <code>configure</code> mein jaana, <code>set</code> commands type karna aur <code>commit</code> karna aana chahiye.</p>

<h3>Analogy: flats aur shor</h3>
<p>Ek building socho. Agar sab log ek bade hall mein rehte hain aur saath mein bolte hain, to kisi ki baat sunai nahi deti: yeh purane hub par <b>collision domain</b> hai. Agar har family ka apna flat hai private darwaze ke saath, to koi kisi ko disturb nahi karta: yeh har switch port ka alag collision domain hai. Ab loudspeaker announcement socho: "Laal car kiski hai?" Same floor ke sab log sunte hain, doosri building ke nahi. Woh announcement ek <b>broadcast</b> hai, aur floor <b>broadcast domain</b> hai.</p>

<h3>Do definitions</h3>
<p><b>Collision domain</b> un devices ka set hai jinke frames takra sakte hain kyunki woh ek half-duplex medium share karte hain. <b>Broadcast domain</b> un devices ka set hai jo ek-dusre ke broadcast frames receive karte hain, jaise ARP requests. Exam sawal inhe <i>ginne</i> ko kehte hain.</p>

<table class="cmp"><tr><th>Device</th><th>Layer</th><th>Collision domains</th><th>Broadcast domains</th></tr>
<tr><td>Hub</td><td>1</td><td>saare ports ka ek</td><td>saare ports ka ek</td></tr>
<tr><td>Switch (EX)</td><td>2</td><td>har port ka ek</td><td>har VLAN ka ek</td></tr>
<tr><td>Router (MX, SRX, vMX)</td><td>3</td><td>har port ka ek</td><td>har interface ka ek</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch aur router par domains">
<rect x="20" y="20" width="270" height="190" rx="10" fill="#bae6fd" fill-opacity="0.5"/><text x="155" y="40" text-anchor="middle" class="svg-ink" font-size="13">Broadcast domain A (VLAN 10)</text>
<rect x="350" y="20" width="270" height="190" rx="10" fill="#bbf7d0" fill-opacity="0.5"/><text x="485" y="40" text-anchor="middle" class="svg-ink" font-size="13">Broadcast domain B (VLAN 20)</text>
<rect x="215" y="85" width="210" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">Router / IRB (alag karta hai)</text>
<rect x="40" y="70" width="80" height="30" rx="6" fill="#fde68a"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="40" y="130" width="80" height="30" rx="6" fill="#fde68a"/><text x="80" y="150" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="520" y="70" width="80" height="30" rx="6" fill="#fde68a"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="12">PC3</text>
<rect x="520" y="130" width="80" height="30" rx="6" fill="#fde68a"/><text x="560" y="150" text-anchor="middle" class="svg-ink" font-size="12">PC4</text>
<line x1="120" y1="85" x2="215" y2="105" stroke="#64748b" stroke-width="2"/><line x1="120" y1="145" x2="215" y2="120" stroke="#64748b" stroke-width="2"/><line x1="425" y1="105" x2="520" y2="85" stroke="#64748b" stroke-width="2"/><line x1="425" y1="120" x2="520" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Do VLANs ka matlab do broadcast domains. Sirf router (ya IRB) unhe jodta hai, aur woh broadcasts forward nahi karta.</p></div>

<h3>Junos par har device kya karta hai</h3>
<ul><li><b>Switch</b> frames ko destination <b>MAC address</b> se forward karta hai, MAC table use karke (EX par <code>show ethernet-switching table</code>). Unknown unicast aur broadcast frames VLAN ke andar flood hote hain.</li>
<li><b>Router</b> packets ko destination <b>IP address</b> se forward karta hai, routing table use karke (<code>show route</code>). Router ka har interface apna subnet aur broadcast domain hai.</li>
<li><b>IRB</b> interface (jaise <code>irb.10</code>) wala EX switch dono hai: VLAN 10 ke andar switching aur VLANs ke beech routing.</li></ul>

<div class="eg"><p><b>Worked example.</b> EX switch ke 24 access ports hain: 12 VLAN SALES mein aur 12 VLAN ENG mein, IRB nahi. Collision domains: 24 (har full-duplex port ka ek). Broadcast domains: 2. Switch ko router se jodo, har VLAN ke liye ek link: switch par phir bhi 2 VLAN broadcast domains hain, aur router unhe alag rakhta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> 24-port switch ke liye "24 broadcast domains" jawab dena. Ports collision domains banate hain; VLANs broadcast domains. Yeh bhi yaad rakho ki full-duplex switched link par collisions hote hi nahi. Modern link par collisions ya late collisions aksar <b>duplex mismatch</b> dikhate hain.</p></div>

<div class="scn"><h4>Dheema flat network</h4><p>Ek chhoti factory mein ek hi VLAN mein 300 devices the. Users ne shikayat ki ki subah Wi-Fi scanners aur printers dheeme chalte hain. Capture mein dikha ki har second hazaaron ARP aur doosre broadcasts har device tak pahunch rahe hain. Engineer ne network ko chaar VLANs mein baant diya, har ek mein lagbhag 75 devices, apne IRB gateway ke saath. Broadcast shor lagbhag teen chauthai kam ho gaya aur subah ki slowness chali gayi.</p><p><b>Lesson:</b> chhote broadcast domains ka matlab kam shor; routers ya IRBs unhe jodte hain.</p></div>

<div class="iv"><p class="q">"Do VLANs wale 24-port switch mein kitne collision aur broadcast domains hote hain?"</p><p>Jawab: 24 collision domains (har port ka ek) aur 2 broadcast domains (har VLAN ka ek). Jodo ki router broadcast domains ko alag karta hai, hub mein dono ka ek-ek hota hai, aur switched link par collisions duplex mismatch ka sanket hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Collision domain = shared half-duplex medium; switch har port ka ek deta hai.</li>
<li>Broadcast domain = devices jo ek-dusre ke broadcasts sunte hain; har VLAN ka ek, har router interface ka ek.</li>
<li>Switches MAC addresses (layer 2) use karte hain; routers IP addresses (layer 3).</li>
<li>IRB interface EX switch ko VLANs ke beech route karne deta hai.</li>
<li>Modern link par collisions aksar duplex mismatch hota hai.</li>
</ul></div>
`}};export{e as default};