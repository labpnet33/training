var e={id:`big-picture`,h:{en:`The big picture: why switches need a tree`,hi:`Big picture: switches ko tree kyun chahiye`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why a redundant Layer 2 network melts down without Spanning Tree Protocol (STP), predict on paper which switch becomes the root bridge and which port blocks in any small topology, configure Rapid PVST+ so that the root and the blocked links are where <i>you</i> want them, protect edge ports with PortFast, BPDU Guard, BPDU Filter, Root Guard and Loop Guard, and troubleshoot the classic tickets: wrong root, slow or blocked uplinks, topology-change storms and err-disabled desk ports. This maps to CCNA 200-301 exam topic 2.5, "Interpret basic operations of Rapid PVST+ Spanning Tree Protocol".</p>

<p><b>Prerequisites.</b> You should already know how a switch learns MAC addresses and floods unknown frames, what a VLAN and an 802.1Q trunk are (module <i>VLANs, 802.1Q trunking, native VLAN and DTP</i>), and how to use CDP or LLDP to discover neighbours (module <i>CDP and LLDP</i>). We refer back to those ideas instead of re-teaching them.</p>

<h3>An analogy: a city that closes some roads on purpose</h3>
<p>Imagine a city where every delivery van must reach every house, and there are no traffic lights and no maps. Drivers follow one rule: "if you do not know where the house is, drive down <b>every</b> road except the one you came from." If the city's roads form a ring, vans sent out in both directions meet, pass each other and keep driving around the ring forever, and every lap they create more vans at each junction. By lunchtime the roads are jammed.</p>
<p>The city council fixes this without digging up a single road. It elects one central junction as the <b>headquarters</b>, finds the cheapest route from every junction to headquarters, and puts a <b>barricade</b> on just enough roads that no ring remains. The barricaded roads are still there, still maintained, and if a working road collapses, the council removes a barricade within seconds. That council is STP: the junctions are switches, the headquarters is the <b>root bridge</b>, and the barricades are <b>blocked</b> (discarding) ports.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology: three switches in a triangle">
<rect x="70" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="140" y="70" text-anchor="middle" class="svg-muted" font-size="12">distribution</text>
<rect x="430" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="500" y="70" text-anchor="middle" class="svg-muted" font-size="12">distribution</text>
<rect x="250" y="150" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">access</text>
<line x1="210" y1="55" x2="430" y2="55" stroke="#64748b" stroke-width="3"/><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 - Gi0/1</text>
<line x1="160" y1="80" x2="270" y2="150" stroke="#64748b" stroke-width="3"/><text x="170" y="125" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 - Gi0/1</text>
<line x1="480" y1="80" x2="370" y2="150" stroke="#64748b" stroke-width="3"/><text x="475" y="125" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 - Gi0/2</text>
<rect x="110" y="240" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="165" y="265" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text>
<rect x="265" y="240" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="265" text-anchor="middle" class="svg-ink" font-size="13">PC2 VLAN 20</text>
<rect x="420" y="240" width="110" height="40" rx="8" fill="#fed7aa"/><text x="475" y="265" text-anchor="middle" class="svg-ink" font-size="13">ROGUE</text>
<line x1="280" y1="200" x2="180" y2="240" stroke="#64748b" stroke-width="2"/><text x="215" y="215" class="svg-muted" font-size="12">Gi0/5</text>
<line x1="320" y1="200" x2="320" y2="240" stroke="#64748b" stroke-width="2"/><text x="326" y="225" class="svg-muted" font-size="12">Gi0/6</text>
<line x1="360" y1="200" x2="460" y2="240" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="415" y="215" class="svg-accent" font-size="12">Gi0/7</text>
</svg><p class="cap">The Nilgiri Logistics lab used throughout this module: a triangle of trunks (one physical loop) plus access ports on SW3.</p></div>

<h3>Why redundancy and loops come together</h3>
<p>A single cable between two switches is a single point of failure. Any serious design therefore connects each access switch to <b>two</b> distribution switches, and the two distribution switches to each other. The moment you do that, you have built a physical <b>loop</b>. Routers survive loops because every IP packet carries a TTL. Ethernet frames have no TTL, so a switched loop without STP turns into a <b>broadcast storm</b> within seconds. Chapter 2 shows exactly how.</p>
<p>STP lets you keep the redundant cables and still have a loop-free forwarding path. Each switch exchanges small messages called <b>BPDUs</b> (Bridge Protocol Data Units), the switches elect a root bridge, every other switch finds its best path to that root, and the leftover ports that would close a loop are put into a <b>discarding</b> state. Frames never cross a discarding port, but BPDUs are still received there, so the switch notices instantly when it needs to open the barricade.</p>

<h3>The lab you will build</h3>
<p>Throughout the module we use the same topology as the hands-on lab. <b>SW1</b> and <b>SW2</b> are distribution switches, <b>SW3</b> is an access switch, and all three are joined by 802.1Q trunks in a triangle. SW3 has <b>PC1</b> in VLAN 10 (DATA) on Gi0/5, <b>PC2</b> in VLAN 20 (VOICE) on Gi0/6, and a spare desk port Gi0/7 into which facilities will one day patch an unauthorised switch called <b>ROGUE</b> that is configured with priority 0. Your goals in the lab are the same goals a real network engineer has:</p>
<ol>
<li>Find out which switch is the root today, and why (chapters 4 to 6).</li>
<li>Make SW1 the root for VLAN 10 and SW2 the root for VLAN 20, each backing up the other, so both SW3 uplinks carry traffic (chapter 9).</li>
<li>Protect the access ports with PortFast and BPDU Guard, and prove that ROGUE cannot steal the root role (chapter 10).</li>
</ol>

<div class="eg"><p><b>Worked example: a first look.</b> Before any tuning, run one command on SW3 to see who is in charge of each VLAN:</p>
<pre class="out">SW3# show spanning-tree root

                                        Root    Hello Max Fwd
Vlan                   Root ID          Cost    Time  Age Dly  Root Port
---------------- -------------------- --------- ----- --- ---  ------------
<span class="hl">VLAN0010         32778 5254.0023.a200         4    2   20  15  Gi0/1</span>
VLAN0020         32788 5254.0023.a200         4    2   20  15  Gi0/1</pre>
<p>Both VLANs have the same root, MAC 5254.0023.a200, which is SW1. Nobody chose SW1; every switch still has the default priority 32768, so the lowest MAC address won the election. By the end of chapter 9 you will change that deliberately.</p></div>

<h3>How the module is organised</h3>
<ul>
<li>Chapters 2 and 3: the problem (loops) and the family of STP versions.</li>
<li>Chapters 4 to 6: BPDUs, bridge IDs, path costs and the three-step election, with worked multi-switch examples.</li>
<li>Chapters 7 and 8: classic 802.1D states and timers, then RSTP roles, states and the proposal/agreement handshake.</li>
<li>Chapters 9 and 10: configuration, tuning and the protection features.</li>
<li>Chapter 11: verification and a troubleshooting workflow; chapter 12: summary and exam checklist.</li>
</ul>
<p>The next module, <i>EtherChannel</i>, bundles parallel links into one logical port so STP has nothing to block between them; we preview that idea but leave the details there.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking STP is "only for big networks". A single desk switch with two cables to the wall, or a VoIP phone and a PC bridged back into the same switch, is enough to create a loop in a ten-person office.</p></div>

<div class="exam"><p><b>Exam trap.</b> STP prevents <b>Layer 2</b> loops. It does nothing for routing loops between routers; those are limited by the IP TTL and by routing protocol rules.</p></div>

<div class="scn"><h4>"We added a second cable for redundancy"</h4><p>A small travel agency had two cheap unmanaged switches under two desks. An office assistant, trying to be helpful, ran a second patch cable between them "in case the first one breaks". Within a minute every PC lost network access and the switch lights blinked in unison. The unmanaged switches did not run STP, so the two cables formed a loop and a single ARP broadcast circulated forever. The engineer unplugged one cable and the network recovered immediately.</p><p><b>Lesson:</b> redundancy at Layer 2 is only safe when every switch in the loop runs spanning tree.</p></div>

<div class="iv"><p class="q">"What is Spanning Tree Protocol and why do we need it?"</p><p>Strong answer: STP is a Layer 2 protocol that lets switches keep redundant links without forwarding loops. Ethernet has no TTL, so a loop causes broadcast storms, MAC table instability and duplicate frames. STP elects a root bridge, picks the best path from every switch to the root, and puts the remaining loop-forming ports into a discarding state, while still listening for BPDUs so a blocked link can take over when an active one fails. Mention that Cisco switches run Rapid PVST+, one RSTP instance per VLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Redundant switch links always create physical loops; Ethernet has no TTL to stop a looping frame.</li>
<li>STP keeps the cables but blocks just enough ports to leave a loop-free tree rooted at the root bridge.</li>
<li>Blocked ports still receive BPDUs, so a backup link can take over after a failure.</li>
<li>With default settings the lowest MAC address becomes root, which is rarely what you want.</li>
<li>The lab triangle SW1, SW2, SW3 with PC1, PC2 and ROGUE is used in every chapter.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki Spanning Tree Protocol (STP) ke bina ek redundant Layer 2 network kyun pighal jaata hai, kisi bhi chhoti topology mein paper par predict kar paoge ki kaunsa switch root bridge banega aur kaunsa port block hoga, Rapid PVST+ ko aise configure kar paoge ki root aur blocked links wahi hon jahan <i>aap</i> chahte ho, edge ports ko PortFast, BPDU Guard, BPDU Filter, Root Guard aur Loop Guard se protect kar paoge, aur classic tickets troubleshoot kar paoge: galat root, slow ya blocked uplinks, topology-change storms aur err-disabled desk ports. Yeh CCNA 200-301 exam topic 2.5 se map hota hai, "Interpret basic operations of Rapid PVST+ Spanning Tree Protocol".</p>

<p><b>Prerequisites.</b> Aapko pehle se pata hona chahiye ki switch MAC addresses kaise seekhta hai aur unknown frames ko kaise flood karta hai, VLAN aur 802.1Q trunk kya hote hain (module <i>VLANs, 802.1Q trunking, native VLAN aur DTP</i>), aur neighbours dhoondhne ke liye CDP ya LLDP kaise use karte hain (module <i>CDP aur LLDP</i>). Hum in ideas ko dobara nahi padhayenge, bas unka reference denge.</p>

<h3>Ek analogy: ek shehar jo jaan-boojh kar kuch sadkein band karta hai</h3>
<p>Ek aisa shehar socho jahan har delivery van ko har ghar tak pahunchna hai, aur na koi traffic light hai na koi map. Drivers ek hi rule follow karte hain: "agar ghar ka pata nahi, to jis road se aaye ho usko chhod kar <b>har</b> road par chalo." Agar shehar ki sadkein ek ring banati hain, to dono directions mein bheji gayi vans milti hain, ek doosre ke paas se guzarti hain aur ring ke chakkar hamesha lagati rehti hain, aur har chakkar mein har junction par aur vans ban jaati hain. Lunch tak saari sadkein jam ho jaati hain.</p>
<p>City council ek bhi sadak khode bina yeh fix karta hai. Woh ek central junction ko <b>headquarters</b> chunta hai, har junction se headquarters tak sabse sasta route dhoondhta hai, aur bas utni sadkon par <b>barricade</b> lagata hai ki koi ring na bache. Barricade wali sadkein wahi rehti hain, maintain hoti rehti hain, aur agar koi chalti sadak toot jaaye to council kuch second mein barricade hata deta hai. Yahi council STP hai: junctions switches hain, headquarters <b>root bridge</b> hai, aur barricades <b>blocked</b> (discarding) ports hain.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology: teen switches triangle mein">
<rect x="70" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="140" y="70" text-anchor="middle" class="svg-muted" font-size="12">distribution</text>
<rect x="430" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="500" y="70" text-anchor="middle" class="svg-muted" font-size="12">distribution</text>
<rect x="250" y="150" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">access</text>
<line x1="210" y1="55" x2="430" y2="55" stroke="#64748b" stroke-width="3"/><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 - Gi0/1</text>
<line x1="160" y1="80" x2="270" y2="150" stroke="#64748b" stroke-width="3"/><text x="170" y="125" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 - Gi0/1</text>
<line x1="480" y1="80" x2="370" y2="150" stroke="#64748b" stroke-width="3"/><text x="475" y="125" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 - Gi0/2</text>
<rect x="110" y="240" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="165" y="265" text-anchor="middle" class="svg-ink" font-size="13">PC1 VLAN 10</text>
<rect x="265" y="240" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="265" text-anchor="middle" class="svg-ink" font-size="13">PC2 VLAN 20</text>
<rect x="420" y="240" width="110" height="40" rx="8" fill="#fed7aa"/><text x="475" y="265" text-anchor="middle" class="svg-ink" font-size="13">ROGUE</text>
<line x1="280" y1="200" x2="180" y2="240" stroke="#64748b" stroke-width="2"/><text x="215" y="215" class="svg-muted" font-size="12">Gi0/5</text>
<line x1="320" y1="200" x2="320" y2="240" stroke="#64748b" stroke-width="2"/><text x="326" y="225" class="svg-muted" font-size="12">Gi0/6</text>
<line x1="360" y1="200" x2="460" y2="240" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="415" y="215" class="svg-accent" font-size="12">Gi0/7</text>
</svg><p class="cap">Nilgiri Logistics lab jo poore module mein use hoga: trunks ka ek triangle (ek physical loop) plus SW3 par access ports.</p></div>

<h3>Redundancy aur loops saath saath kyun aate hain</h3>
<p>Do switches ke beech ek hi cable single point of failure hai. Isliye koi bhi serious design har access switch ko <b>do</b> distribution switches se jodta hai, aur dono distribution switches ko aapas mein. Jaise hi aap yeh karte ho, aapne ek physical <b>loop</b> bana diya. Routers loops jhel lete hain kyunki har IP packet mein TTL hota hai. Ethernet frames mein TTL nahi hota, isliye STP ke bina switched loop kuch hi second mein <b>broadcast storm</b> ban jaata hai. Chapter 2 exactly dikhata hai kaise.</p>
<p>STP aapko redundant cables rakhne deta hai aur phir bhi loop-free forwarding path deta hai. Har switch chhote messages exchange karta hai jinhe <b>BPDUs</b> (Bridge Protocol Data Units) kehte hain, switches ek root bridge elect karte hain, baaki har switch root tak apna best path dhoondhta hai, aur jo ports bache hain jo loop band karte, unhe <b>discarding</b> state mein daal diya jaata hai. Frames kabhi discarding port cross nahi karte, lekin BPDUs wahan phir bhi receive hote hain, isliye switch ko turant pata chal jaata hai jab barricade kholna ho.</p>

<h3>Lab jo aap banaoge</h3>
<p>Poore module mein hum wahi topology use karenge jo hands-on lab mein hai. <b>SW1</b> aur <b>SW2</b> distribution switches hain, <b>SW3</b> access switch hai, aur teeno triangle mein 802.1Q trunks se jude hain. SW3 par Gi0/5 par VLAN 10 (DATA) mein <b>PC1</b> hai, Gi0/6 par VLAN 20 (VOICE) mein <b>PC2</b> hai, aur ek spare desk port Gi0/7 hai jismein facilities team ek din <b>ROGUE</b> naam ka unauthorised switch laga degi jo priority 0 ke saath configured hai. Lab mein aapke goals wahi hain jo ek real network engineer ke hote hain:</p>
<ol>
<li>Pata karo ki aaj root kaunsa switch hai, aur kyun (chapters 4 se 6).</li>
<li>SW1 ko VLAN 10 ka root aur SW2 ko VLAN 20 ka root banao, dono ek doosre ke backup, taaki SW3 ke dono uplinks traffic le jaayein (chapter 9).</li>
<li>Access ports ko PortFast aur BPDU Guard se protect karo, aur prove karo ki ROGUE root role nahi chura sakta (chapter 10).</li>
</ol>

<div class="eg"><p><b>Worked example: pehli nazar.</b> Kuch bhi tune karne se pehle, SW3 par ek command chalao aur dekho ki har VLAN ka incharge kaun hai:</p>
<pre class="out">SW3# show spanning-tree root

                                        Root    Hello Max Fwd
Vlan                   Root ID          Cost    Time  Age Dly  Root Port
---------------- -------------------- --------- ----- --- ---  ------------
<span class="hl">VLAN0010         32778 5254.0023.a200         4    2   20  15  Gi0/1</span>
VLAN0020         32788 5254.0023.a200         4    2   20  15  Gi0/1</pre>
<p>Dono VLANs ka root same hai, MAC 5254.0023.a200, jo SW1 hai. Kisi ne SW1 ko choose nahi kiya; har switch ki priority abhi bhi default 32768 hai, isliye sabse chhote MAC address ne election jeet liya. Chapter 9 ke end tak aap ise jaan-boojh kar badloge.</p></div>

<h3>Module kaise organised hai</h3>
<ul>
<li>Chapters 2 aur 3: problem (loops) aur STP versions ki family.</li>
<li>Chapters 4 se 6: BPDUs, bridge IDs, path costs aur teen-step election, multi-switch worked examples ke saath.</li>
<li>Chapters 7 aur 8: classic 802.1D states aur timers, phir RSTP roles, states aur proposal/agreement handshake.</li>
<li>Chapters 9 aur 10: configuration, tuning aur protection features.</li>
<li>Chapter 11: verification aur troubleshooting workflow; chapter 12: summary aur exam checklist.</li>
</ul>
<p>Agla module, <i>EtherChannel</i>, parallel links ko ek logical port mein bundle karta hai taaki STP ke paas unke beech block karne ko kuch na ho; hum us idea ka preview denge par details wahin chhodenge.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki STP "sirf bade networks ke liye" hai. Deewar tak do cables wala ek desk switch, ya ek VoIP phone aur PC jo wapas same switch mein bridge ho gaye, das logon ke office mein bhi loop banane ke liye kaafi hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> STP <b>Layer 2</b> loops rokta hai. Routers ke beech routing loops ke liye yeh kuch nahi karta; unhe IP TTL aur routing protocol rules limit karte hain.</p></div>

<div class="scn"><h4>"Humne redundancy ke liye doosri cable lagayi"</h4><p>Ek chhoti travel agency mein do desks ke neeche do saste unmanaged switches the. Ek office assistant ne madad karne ke chakkar mein dono ke beech doosri patch cable laga di "agar pehli toot jaaye to". Ek minute ke andar har PC ka network chala gaya aur switch ki lights ek saath blink karne lagin. Unmanaged switches STP nahi chalate the, isliye do cables ne loop bana diya aur ek ARP broadcast hamesha ke liye ghoomta raha. Engineer ne ek cable nikali aur network turant theek ho gaya.</p><p><b>Seekh:</b> Layer 2 par redundancy tabhi safe hai jab loop ka har switch spanning tree chala raha ho.</p></div>

<div class="iv"><p class="q">"Spanning Tree Protocol kya hai aur hume iski zaroorat kyun hai?"</p><p>Strong answer: STP ek Layer 2 protocol hai jo switches ko bina forwarding loops ke redundant links rakhne deta hai. Ethernet mein TTL nahi hota, isliye loop se broadcast storms, MAC table instability aur duplicate frames hote hain. STP ek root bridge elect karta hai, har switch se root tak best path chunta hai, aur baaki loop banane wale ports ko discarding state mein daal deta hai, lekin BPDUs sunta rehta hai taaki active link fail hone par blocked link le sake. Batao ki Cisco switches Rapid PVST+ chalate hain, yaani har VLAN ke liye ek RSTP instance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Redundant switch links hamesha physical loops banate hain; Ethernet mein looping frame rokne ke liye TTL nahi hai.</li>
<li>STP cables rakhta hai lekin bas utne ports block karta hai ki root bridge par rooted ek loop-free tree bache.</li>
<li>Blocked ports phir bhi BPDUs receive karte hain, isliye failure ke baad backup link le sakta hai.</li>
<li>Default settings mein sabse chhota MAC address root banta hai, jo aam taur par aap nahi chahte.</li>
<li>Lab triangle SW1, SW2, SW3 PC1, PC2 aur ROGUE ke saath har chapter mein use hota hai.</li>
</ul></div>
`}};export{e as default};