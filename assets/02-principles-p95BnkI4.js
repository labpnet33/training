var e={id:`principles`,h:{en:`Design principles: hierarchy, modularity, resiliency, flexibility`,hi:`Design principles: hierarchy, modularity, resiliency, flexibility`},body:{en:`
<p>Before you pick a single switch model, you need a way to judge whether a design is good. Architects of buildings use principles such as "load-bearing walls line up floor to floor" and "every floor has two exits". Network designers use four: <b>hierarchy, modularity, resiliency and flexibility</b>. Two measurements keep those principles honest: the size of each <b>failure domain</b> and the <b>oversubscription</b> ratio of each layer.</p>

<h3>Hierarchy: every layer has one job</h3>
<p><b>Hierarchy</b> means splitting the network into layers with clearly separated roles: access, distribution and core (the next chapter looks at each). Because every device in a layer does the same job, the network behaves predictably. You know where to look for a policy (distribution), where users attach (access) and which devices must never be slowed down (core). Hierarchy also makes <b>route summarisation</b> possible: a distribution pair can advertise one summary such as 10.1.0.0/16 for a whole building, so a flapping user subnet does not ripple through the core.</p>

<h3>Modularity: build with repeatable blocks</h3>
<p><b>Modularity</b> means building the enterprise from self-contained blocks: an access-distribution block per building, a data-centre block, a WAN edge block, an internet edge block. Each block has the same internal design and connects to the core in the same way. The benefits are practical. A new building is a copy of a tested template. A change in one block (say a new VLAN in building B) does not touch the others. Troubleshooting starts by finding the block, then working inside it. Modularity also lets different teams own different blocks.</p>

<h3>Resiliency: survive failures, normal and abnormal</h3>
<p><b>Resiliency</b> is the ability to keep working when something goes wrong. That includes the obvious failures (a link, a line card, a whole switch, a power feed) and the abnormal ones: a broadcast storm, a loop created by a user's home switch, a traffic flood, a bad software upgrade. Redundancy is the raw material: two uplinks, two distribution switches, dual supervisors and power supplies. But redundancy only becomes resiliency when failover is <b>fast and automatic</b>, which is the job of EtherChannel, FHRP, routing protocols, SSO and NSF, all covered in later chapters.</p>
<p>Availability is measured in "nines". 99.9 % allows about 8.8 hours of downtime a year, 99.99 % about 53 minutes, 99.999 % about 5 minutes. Each extra nine means removing another single point of failure and shortening another convergence time.</p>

<h3>Flexibility: ready for what comes next</h3>
<p><b>Flexibility</b> is the ability to adapt without a redesign: adding wireless, IoT, a new cloud region, a merger, a new security policy. Hierarchical and modular designs are naturally flexible because you change one block or add one block. Designs with fixed, hand-crafted exceptions are not. Scalability is closely related: can the design grow from 5 to 50 access switches without changing its shape?</p>

<h3>Failure domains: how far does one fault spread?</h3>
<p>A <b>failure domain</b> is the part of the network that is affected when one component fails or misbehaves. A Layer 2 VLAN is a failure domain for broadcasts and loops: a storm reaches every port in that VLAN. A spanning-tree instance is a failure domain for topology changes. The good design habit is to keep Layer 2 domains <b>small</b>, ideally inside one access-distribution block, and to use <b>routed links</b> between blocks, because a routing protocol does not forward broadcasts and contains a failure to one subnet.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Large versus small failure domains">
<rect x="10" y="20" width="300" height="190" rx="12" fill="#fed7aa"/><text x="160" y="45" text-anchor="middle" class="svg-ink" font-size="14">Stretched VLAN 50</text>
<rect x="30" y="80" width="75" height="40" rx="6" fill="#e2e8f0"/><text x="67" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg A</text>
<rect x="122" y="80" width="75" height="40" rx="6" fill="#e2e8f0"/><text x="160" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg B</text>
<rect x="214" y="80" width="75" height="40" rx="6" fill="#e2e8f0"/><text x="252" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg C</text>
<text x="160" y="170" text-anchor="middle" class="svg-accent" font-size="13">One loop hits all three</text>
<rect x="330" y="20" width="300" height="190" rx="12" fill="#bbf7d0"/><text x="480" y="45" text-anchor="middle" class="svg-ink" font-size="14">Routed between blocks</text>
<rect x="345" y="70" width="80" height="60" rx="6" fill="#bae6fd"/><text x="385" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg A</text>
<rect x="440" y="70" width="80" height="60" rx="6" fill="#bae6fd"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg B</text>
<rect x="535" y="70" width="80" height="60" rx="6" fill="#bae6fd"/><text x="575" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg C</text>
<text x="480" y="170" text-anchor="middle" class="svg-accent" font-size="13">A loop stays in one block</text>
</svg><p class="cap">Left: one VLAN across buildings is one failure domain. Right: VLANs end at each building's distribution pair.</p></div>

<h3>Oversubscription: honest about bandwidth</h3>
<p><b>Oversubscription</b> is the ratio between the bandwidth that could arrive from below and the bandwidth available upward. Not every user transmits at line rate at the same time, so some oversubscription is normal and saves money. Common starting guidance for a campus is up to about <b>20:1 from access to distribution</b> and about <b>4:1 from distribution to core</b>. Data-centre fabrics aim much lower, often 3:1 or better, because servers really do send at high rates.</p>

<div class="eg"><p><b>Worked example.</b> An access switch has 48 user ports at 1 Gbps (48 Gbps down) and two 10 Gbps uplinks (20 Gbps up). If both uplinks forward, the ratio is 48 : 20 = <b>2.4:1</b>. If spanning tree blocks one uplink, only 10 Gbps is usable and the ratio becomes <b>4.8:1</b>. Now stack four such switches behind the same two uplinks: 192 Gbps down, 20 Gbps up, <b>9.6:1</b>, still inside the 20:1 guideline. Count only links that actually forward.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Counting an STP-blocked uplink as capacity. Stretching a VLAN between buildings "just for one application", which silently merges failure domains. Buying redundant boxes but feeding both from one power strip or one cable tray.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Redundancy" and "resiliency" are not the same word. A question that says a network has redundant links but takes 50 seconds to recover is describing redundancy without resiliency; the fix is a faster mechanism (RSTP, EtherChannel, routed links, tuned FHRP), not more links.</p></div>

<div class="scn"><h4>Cameras everywhere, outage everywhere</h4><p>A factory stretched VLAN 50 across three buildings so every security camera could sit in one subnet with the recording server. A contractor plugged a small unmanaged switch into two wall ports in building C, creating a loop. The broadcast storm ran through VLAN 50 into buildings A and B, CPU on the distribution switches hit 100 percent and users in all three buildings lost the network. The engineer found the storm with interface counters and <code>show spanning-tree</code> topology change counts, shut the looped ports, and later redesigned: a camera VLAN per building, routed links between buildings, BPDU guard on access ports and storm control.</p><p><b>Lesson:</b> a VLAN stretched for convenience is a failure domain stretched for disaster.</p></div>

<div class="iv"><p class="q">"What is a failure domain, and how do you keep it small in a campus?"</p><p>Define it as the set of devices and users affected by one failure. Then list the tools: keep VLANs local to one access-distribution block, make links between blocks and to the core routed, use routed access where the design allows, summarise routes at distribution, and protect the edge with BPDU guard and storm control. A senior touch is mentioning that control-plane failures such as a flapping route are also contained by summarisation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hierarchy gives each layer one role; modularity builds the network from repeatable blocks.</li>
<li>Resiliency is redundancy plus fast, automatic failover, against both failures and abnormal traffic.</li>
<li>Flexibility and scalability come from changing or adding blocks, not redesigning.</li>
<li>Keep Layer 2 failure domains small; route between blocks.</li>
<li>Oversubscription guideline: about 20:1 access to distribution, 4:1 distribution to core; count only forwarding links.</li>
</ul></div>
`,hi:`
<p>Koi bhi switch model chunne se pehle aapko yeh judge karne ka tareeka chahiye ki design achha hai ya nahi. Buildings ke architects "load-bearing walls har floor par line up hon" aur "har floor par do exits hon" jaise principles use karte hain. Network designers chaar principles use karte hain: <b>hierarchy, modularity, resiliency aur flexibility</b>. Do measurements in principles ko imaandar rakhte hain: har <b>failure domain</b> ka size aur har layer ka <b>oversubscription</b> ratio.</p>

<h3>Hierarchy: har layer ka ek kaam</h3>
<p><b>Hierarchy</b> ka matlab hai network ko saaf alag roles wali layers mein baantna: access, distribution aur core (agla chapter har ek ko dekhta hai). Kyunki ek layer ka har device same kaam karta hai, network predictable behave karta hai. Aapko pata hota hai ki policy kahan dhoondhni hai (distribution), users kahan judte hain (access) aur kaunse devices kabhi slow nahi hone chahiye (core). Hierarchy <b>route summarisation</b> bhi possible banati hai: distribution pair poori building ke liye 10.1.0.0/16 jaisa ek summary advertise kar sakta hai, taaki flap karta hua user subnet core tak lehren na bheje.</p>

<h3>Modularity: repeat hone wale blocks se banao</h3>
<p><b>Modularity</b> ka matlab hai enterprise ko self-contained blocks se banana: har building ka access-distribution block, data-centre block, WAN edge block, internet edge block. Har block ka andar ka design same hota hai aur woh core se same tarike se judta hai. Fayde practical hain. Nayi building ek tested template ki copy hai. Ek block mein change (jaise building B mein naya VLAN) doosron ko chhoota nahi. Troubleshooting block dhoondhne se shuru hoti hai, phir uske andar kaam hota hai. Modularity alag teams ko alag blocks own karne deti hai.</p>

<h3>Resiliency: failures jhelna, normal aur abnormal dono</h3>
<p><b>Resiliency</b> kuch galat hone par bhi kaam karte rehne ki kshamta hai. Ismein obvious failures (link, line card, poora switch, power feed) aur abnormal cheezein dono shamil hain: broadcast storm, user ke ghar wale switch se bana loop, traffic flood, kharab software upgrade. Redundancy kachcha maal hai: do uplinks, do distribution switches, dual supervisors aur power supplies. Lekin redundancy tabhi resiliency banti hai jab failover <b>tez aur automatic</b> ho, jo EtherChannel, FHRP, routing protocols, SSO aur NSF ka kaam hai, sab baad ke chapters mein.</p>
<p>Availability "nines" mein naapi jaati hai. 99.9 % saal mein lagbhag 8.8 ghante downtime deta hai, 99.99 % lagbhag 53 minute, 99.999 % lagbhag 5 minute. Har extra nine ka matlab hai ek aur single point of failure hatana aur ek aur convergence time chhota karna.</p>

<h3>Flexibility: aage jo aaye uske liye ready</h3>
<p><b>Flexibility</b> bina redesign ke adapt karne ki kshamta hai: wireless, IoT, naya cloud region, merger, nayi security policy jodna. Hierarchical aur modular designs naturally flexible hote hain kyunki aap ek block badalte ya ek block jodte ho. Fixed, haath se bane exceptions wale designs flexible nahi hote. Scalability isse judi hai: kya design 5 se 50 access switches tak apni shape badle bina badh sakta hai?</p>

<h3>Failure domains: ek fault kitna failta hai?</h3>
<p><b>Failure domain</b> network ka woh hissa hai jo ek component ke fail ya galat behave karne par affect hota hai. Layer 2 VLAN broadcasts aur loops ka failure domain hai: storm us VLAN ke har port tak pahunchta hai. Spanning-tree instance topology changes ka failure domain hai. Achhi design habit hai Layer 2 domains ko <b>chhota</b> rakhna, ideally ek access-distribution block ke andar, aur blocks ke beech <b>routed links</b> use karna, kyunki routing protocol broadcasts forward nahi karta aur failure ko ek subnet tak rok deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Bade aur chhote failure domains">
<rect x="10" y="20" width="300" height="190" rx="12" fill="#fed7aa"/><text x="160" y="45" text-anchor="middle" class="svg-ink" font-size="14">Stretched VLAN 50</text>
<rect x="30" y="80" width="75" height="40" rx="6" fill="#e2e8f0"/><text x="67" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg A</text>
<rect x="122" y="80" width="75" height="40" rx="6" fill="#e2e8f0"/><text x="160" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg B</text>
<rect x="214" y="80" width="75" height="40" rx="6" fill="#e2e8f0"/><text x="252" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg C</text>
<text x="160" y="170" text-anchor="middle" class="svg-accent" font-size="13">Ek loop teeno ko maarta hai</text>
<rect x="330" y="20" width="300" height="190" rx="12" fill="#bbf7d0"/><text x="480" y="45" text-anchor="middle" class="svg-ink" font-size="14">Blocks ke beech routed</text>
<rect x="345" y="70" width="80" height="60" rx="6" fill="#bae6fd"/><text x="385" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg A</text>
<rect x="440" y="70" width="80" height="60" rx="6" fill="#bae6fd"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg B</text>
<rect x="535" y="70" width="80" height="60" rx="6" fill="#bae6fd"/><text x="575" y="105" text-anchor="middle" class="svg-ink" font-size="12">Bldg C</text>
<text x="480" y="170" text-anchor="middle" class="svg-accent" font-size="13">Loop ek block mein rehta hai</text>
</svg><p class="cap">Left: buildings ke paar ek VLAN ek failure domain hai. Right: VLANs har building ke distribution pair par khatam hote hain.</p></div>

<h3>Oversubscription: bandwidth ke baare mein imaandari</h3>
<p><b>Oversubscription</b> neeche se aa sakne wali bandwidth aur upar available bandwidth ka ratio hai. Har user ek saath line rate par transmit nahi karta, isliye thoda oversubscription normal hai aur paisa bachata hai. Campus ke liye common starting guidance hai <b>access se distribution tak lagbhag 20:1</b> aur <b>distribution se core tak lagbhag 4:1</b>. Data-centre fabrics bahut kam target karte hain, aksar 3:1 ya behtar, kyunki servers sach mein high rates par bhejte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek access switch mein 1 Gbps ke 48 user ports (48 Gbps neeche) aur do 10 Gbps uplinks (20 Gbps upar) hain. Agar dono uplinks forward karein, ratio 48 : 20 = <b>2.4:1</b> hai. Agar spanning tree ek uplink block kare, sirf 10 Gbps usable hai aur ratio <b>4.8:1</b> ho jaata hai. Ab aise chaar switches ko same do uplinks ke peeche stack karo: 192 Gbps neeche, 20 Gbps upar, <b>9.6:1</b>, abhi bhi 20:1 guideline ke andar. Sirf woh links gino jo actually forward karte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> STP-blocked uplink ko capacity mein ginna. "Sirf ek application ke liye" buildings ke beech VLAN stretch karna, jo chupchaap failure domains ko merge kar deta hai. Redundant boxes khareedna lekin dono ko ek hi power strip ya ek hi cable tray se feed karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Redundancy" aur "resiliency" ek hi shabd nahi hain. Jo question kehta hai ki network mein redundant links hain lekin recover hone mein 50 seconds lagte hain, woh bina resiliency ki redundancy describe kar raha hai; fix tez mechanism hai (RSTP, EtherChannel, routed links, tuned FHRP), aur links nahi.</p></div>

<div class="scn"><h4>Har jagah cameras, har jagah outage</h4><p>Ek factory ne VLAN 50 ko teen buildings ke paar stretch kiya taaki har security camera recording server ke saath ek subnet mein rahe. Ek contractor ne building C mein ek chhota unmanaged switch do wall ports mein laga diya, jisse loop ban gaya. Broadcast storm VLAN 50 se buildings A aur B tak pahuncha, distribution switches ka CPU 100 percent ho gaya aur teeno buildings ke users ka network chala gaya. Engineer ne interface counters aur <code>show spanning-tree</code> ke topology change counts se storm dhoondha, looped ports shut kiye, aur baad mein redesign kiya: har building ka alag camera VLAN, buildings ke beech routed links, access ports par BPDU guard aur storm control.</p><p><b>Seekh:</b> suvidha ke liye stretch kiya VLAN, disaster ke liye stretch kiya failure domain hai.</p></div>

<div class="iv"><p class="q">"Failure domain kya hai, aur campus mein use chhota kaise rakhte ho?"</p><p>Ise ek failure se affect hone wale devices aur users ke set ki tarah define karo. Phir tools batao: VLANs ko ek access-distribution block tak local rakho, blocks ke beech aur core tak links routed banao, design allow kare to routed access use karo, distribution par routes summarise karo, aur edge ko BPDU guard aur storm control se protect karo. Senior touch: batao ki flap karta route jaise control-plane failures bhi summarisation se contain hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hierarchy har layer ko ek role deti hai; modularity network ko repeat hone wale blocks se banati hai.</li>
<li>Resiliency = redundancy plus tez, automatic failover, failures aur abnormal traffic dono ke khilaaf.</li>
<li>Flexibility aur scalability blocks badalne ya jodne se aati hai, redesign se nahi.</li>
<li>Layer 2 failure domains chhote rakho; blocks ke beech route karo.</li>
<li>Oversubscription guideline: access se distribution lagbhag 20:1, distribution se core 4:1; sirf forwarding links gino.</li>
</ul></div>
`}};export{e as default};