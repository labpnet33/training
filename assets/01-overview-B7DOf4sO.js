var e={id:`overview`,h:{en:`From JNCIS to JNCIP: what changes at professional level`,hi:`JNCIS se JNCIP tak: professional level par kya badalta hai`},body:{en:`
<p><b>What you will learn in this module.</b> This is the free "Start here" module for the JNCIP-ENT track (exam JN0-650). You will learn how the professional-level topics fit together into one enterprise network, how a JNCIP engineer thinks about design and troubleshooting, how to change a live Junos network safely, and how to practise in the labs so that the exam feels familiar. No new protocol is taught in depth here. The later modules (OSPF, IS-IS, BGP, switching, STP, multicast, CoS, 802.1X, VoIP and EVPN) do that. This module gives you the map.</p>
<p><b>Prerequisites.</b> You should have finished JNCIA-Junos and JNCIS-ENT, or know the same material: the Junos CLI and commit model, interfaces and VLANs, basic OSPF and IS-IS, static routes, routing policy basics and BGP basics. If any of those feel shaky, the JNCIS modules are the quick refresher.</p>

<h3>Analogy: the mechanic and the city planner</h3>
<p>A JNCIS engineer is like a skilled mechanic. Give them one broken machine, a router or one protocol, and they can fix it. A JNCIP engineer is closer to a city planner. They must decide how the roads (links), the traffic rules (routing policy), the bus lanes (class of service), the gates (access control) and the maps (routing protocols) work <i>together</i>, and what happens on the day a road closes. The questions change from "how do I configure this?" to "why does this design behave like that, and what breaks if I change it?"</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="JNCIP topic families">
<rect x="20" y="20" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">One enterprise network: users, voice, servers, WAN, data centre</text>
<rect x="20" y="75" width="140" height="56" rx="8" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="13">OSPF / IS-IS</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="11">underlay reachability</text>
<rect x="180" y="75" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="250" y="100" text-anchor="middle" class="svg-ink" font-size="13">BGP + policy</text><text x="250" y="118" text-anchor="middle" class="svg-muted" font-size="11">scale and control</text>
<rect x="340" y="75" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="410" y="100" text-anchor="middle" class="svg-ink" font-size="13">Switching + STP</text><text x="410" y="118" text-anchor="middle" class="svg-muted" font-size="11">Layer 2 services</text>
<rect x="500" y="75" width="120" height="56" rx="8" fill="#fde68a"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">Multicast</text><text x="560" y="118" text-anchor="middle" class="svg-muted" font-size="11">one-to-many</text>
<rect x="20" y="145" width="140" height="56" rx="8" fill="#fed7aa"/><text x="90" y="170" text-anchor="middle" class="svg-ink" font-size="13">CoS</text><text x="90" y="188" text-anchor="middle" class="svg-muted" font-size="11">who goes first</text>
<rect x="180" y="145" width="140" height="56" rx="8" fill="#bae6fd"/><text x="250" y="170" text-anchor="middle" class="svg-ink" font-size="13">802.1X</text><text x="250" y="188" text-anchor="middle" class="svg-muted" font-size="11">who may connect</text>
<rect x="340" y="145" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="410" y="170" text-anchor="middle" class="svg-ink" font-size="13">VoIP</text><text x="410" y="188" text-anchor="middle" class="svg-muted" font-size="11">voice VLAN, LLDP-MED</text>
<rect x="500" y="145" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="170" text-anchor="middle" class="svg-ink" font-size="13">EVPN-VXLAN</text><text x="560" y="188" text-anchor="middle" class="svg-muted" font-size="11">modern L2 and L3</text>
<text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="12">Each topic is a tool. JNCIP tests whether you can combine them and find the broken one.</text>
</svg><p class="cap">The JNCIP-ENT topic families around one enterprise network.</p></div>

<h3>Three things that change at professional level</h3>
<ul>
<li><b>Depth.</b> You are expected to know <i>why</i>: why an OSPF import policy does not remove an LSA from the database, why an IS-IS leaked route carries the down bit, why a BGP route is hidden.</li>
<li><b>Interaction.</b> Protocols affect each other. An IGP metric changes a BGP path choice. A policy that leaks too much can create a loop. A CoS scheduler can starve the very control traffic that keeps an adjacency alive.</li>
<li><b>Troubleshooting under pressure.</b> You get a topology and a symptom, not a recipe. The skill tested is a calm, ordered method, which is the subject of chapter 6.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A JNCIS question: "Which command shows OSPF neighbours?" A JNCIP-style question: "R1 has two OSPF paths to 172.16.4.0/24 through R2 and R3. After a change on R2 only the R3 path remains, yet R2 is still reachable at its loopback. What was configured?" The answer, <code>set protocols ospf overload</code> on R2, needs you to connect a protocol feature to its effect on routing. You will do exactly this in the OSPF module.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating JNCIP as "more commands to memorise". The commands are the same ones you know. What grows is your ability to predict the result of a change before you commit it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam objectives and the number of questions can change between exam versions. Always read the current JN0-650 objective list on the Juniper certification page before you finalise your study plan, and use this course as the practice ground for those objectives.</p></div>

<div class="scn"><h4>The upgrade that was "just one policy"</h4><p>An engineer added an export policy so a new customer block could reach the branch. It matched every static route, not only the customer block. A test network that was meant to stay private was suddenly advertised network-wide. The engineer who had read the OSPF database, not only the routing table, spotted the extra external LSA within minutes and removed the term.</p><p><b>Lesson:</b> at professional level you verify the effect of a change in several places: the policy, the protocol database and the routing table.</p></div>

<div class="iv"><p class="q">"What is the difference between a JNCIS and a JNCIP engineer?"</p><p>A strong answer: a JNCIS engineer configures and verifies one feature correctly. A JNCIP engineer designs how several features interact, predicts the effect of a change, and troubleshoots across protocol boundaries with a method. Give one example, such as using overload before maintenance or leaking IS-IS routes to fix a bad exit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JNCIP-ENT builds on JNCIS-ENT; the commands are familiar, the reasoning is deeper.</li>
<li>The topic families are IGPs, BGP and policy, Layer 2 and STP, multicast, CoS, access control, voice and EVPN.</li>
<li>Expect interaction questions: how one feature changes the behaviour of another.</li>
<li>A repeatable troubleshooting method matters more than speed.</li>
<li>Check the current exam objectives on the official page; use the labs to practise each one.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh JNCIP-ENT track (exam JN0-650) ka free "Start here" module hai. Aap seekhoge ki professional-level topics ek enterprise network mein kaise fit hote hain, JNCIP engineer design aur troubleshooting ke baare mein kaise sochta hai, live Junos network mein change safely kaise karte hain, aur labs mein practice kaise karein taaki exam jaana-pehchana lage. Yahan koi naya protocol gehrai se nahi padhaya jaata. Woh baad ke modules (OSPF, IS-IS, BGP, switching, STP, multicast, CoS, 802.1X, VoIP aur EVPN) karte hain. Yeh module aapko map deta hai.</p>
<p><b>Prerequisites.</b> Aapne JNCIA-Junos aur JNCIS-ENT khatam kiya ho, ya wahi material aata ho: Junos CLI aur commit model, interfaces aur VLANs, basic OSPF aur IS-IS, static routes, routing policy basics aur BGP basics. In mein se kuch kamzor lage to JNCIS modules quick refresher hain.</p>

<h3>Analogy: mechanic aur city planner</h3>
<p>JNCIS engineer ek skilled mechanic jaisa hai. Ek kharab machine, ek router ya ek protocol de do, woh theek kar dega. JNCIP engineer city planner ke zyada nazdeek hai. Use decide karna padta hai ki roads (links), traffic rules (routing policy), bus lanes (class of service), gates (access control) aur maps (routing protocols) <i>saath mein</i> kaise kaam karein, aur jis din koi road band ho jaaye tab kya hoga. Sawal "yeh kaise configure karun?" se badalkar "yeh design aisa behave kyun karta hai, aur change karne par kya tootega?" ban jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="JNCIP topic families">
<rect x="20" y="20" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">Ek enterprise network: users, voice, servers, WAN, data centre</text>
<rect x="20" y="75" width="140" height="56" rx="8" fill="#bae6fd"/><text x="90" y="100" text-anchor="middle" class="svg-ink" font-size="13">OSPF / IS-IS</text><text x="90" y="118" text-anchor="middle" class="svg-muted" font-size="11">underlay reachability</text>
<rect x="180" y="75" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="250" y="100" text-anchor="middle" class="svg-ink" font-size="13">BGP + policy</text><text x="250" y="118" text-anchor="middle" class="svg-muted" font-size="11">scale aur control</text>
<rect x="340" y="75" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="410" y="100" text-anchor="middle" class="svg-ink" font-size="13">Switching + STP</text><text x="410" y="118" text-anchor="middle" class="svg-muted" font-size="11">Layer 2 services</text>
<rect x="500" y="75" width="120" height="56" rx="8" fill="#fde68a"/><text x="560" y="100" text-anchor="middle" class="svg-ink" font-size="13">Multicast</text><text x="560" y="118" text-anchor="middle" class="svg-muted" font-size="11">one-to-many</text>
<rect x="20" y="145" width="140" height="56" rx="8" fill="#fed7aa"/><text x="90" y="170" text-anchor="middle" class="svg-ink" font-size="13">CoS</text><text x="90" y="188" text-anchor="middle" class="svg-muted" font-size="11">pehle kaun jaaye</text>
<rect x="180" y="145" width="140" height="56" rx="8" fill="#bae6fd"/><text x="250" y="170" text-anchor="middle" class="svg-ink" font-size="13">802.1X</text><text x="250" y="188" text-anchor="middle" class="svg-muted" font-size="11">kaun connect kare</text>
<rect x="340" y="145" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="410" y="170" text-anchor="middle" class="svg-ink" font-size="13">VoIP</text><text x="410" y="188" text-anchor="middle" class="svg-muted" font-size="11">voice VLAN, LLDP-MED</text>
<rect x="500" y="145" width="120" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="170" text-anchor="middle" class="svg-ink" font-size="13">EVPN-VXLAN</text><text x="560" y="188" text-anchor="middle" class="svg-muted" font-size="11">modern L2 aur L3</text>
<text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="12">Har topic ek tool hai. JNCIP check karta hai ki aap unhe jod sakte ho aur toota hua dhoondh sakte ho.</text>
</svg><p class="cap">Ek enterprise network ke ird-gird JNCIP-ENT topic families.</p></div>

<h3>Professional level par teen cheezein badalti hain</h3>
<ul>
<li><b>Depth.</b> Aapse <i>kyun</i> poocha jaata hai: OSPF import policy LSA ko database se kyun nahi hatati, IS-IS leaked route par down bit kyun hota hai, BGP route hidden kyun hai.</li>
<li><b>Interaction.</b> Protocols ek doosre ko asar karte hain. IGP metric BGP path choice badal deta hai. Zyada leak karne wali policy loop bana sakti hai. CoS scheduler wahi control traffic bhookha rakh sakta hai jo adjacency zinda rakhta hai.</li>
<li><b>Dabav mein troubleshooting.</b> Aapko recipe nahi, topology aur symptom milta hai. Test hone wali skill ek shaant, kramwar method hai, jo chapter 6 ka vishay hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> JNCIS ka sawal: "OSPF neighbours kaunsa command dikhata hai?" JNCIP-style sawal: "R1 ke paas 172.16.4.0/24 ke liye R2 aur R3 se do OSPF paths hain. R2 par change ke baad sirf R3 wala path bacha, phir bhi R2 apne loopback par reachable hai. Kya configure hua?" Jawab, R2 par <code>set protocols ospf overload</code>, ke liye protocol feature ko routing par uske asar se jodna padta hai. Yahi aap OSPF module mein karoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> JNCIP ko "zyada commands ratna" samajhna. Commands wahi hain jo aap jaante ho. Jo badhta hai woh hai commit karne se pehle result predict karne ki kshamta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam objectives aur sawalon ki sankhya exam versions ke beech badal sakti hai. Study plan final karne se pehle Juniper certification page par current JN0-650 objective list zaroor padho, aur is course ko un objectives ki practice ground ki tarah use karo.</p></div>

<div class="scn"><h4>Upgrade jo "bas ek policy" thi</h4><p>Ek engineer ne export policy lagayi taaki naya customer block branch tak pahunche. Woh policy har static route se match ho gayi, sirf customer block se nahi. Ek test network jo private rehna tha achanak poore network mein advertise hone laga. Jis engineer ne sirf routing table nahi balki OSPF database padha, usne kuch minutes mein extra external LSA pakad li aur term hata diya.</p><p><b>Lesson:</b> professional level par change ka asar kai jagah verify karte hain: policy, protocol database aur routing table.</p></div>

<div class="iv"><p class="q">"JNCIS aur JNCIP engineer mein kya difference hai?"</p><p>Strong jawab: JNCIS engineer ek feature ko sahi configure aur verify karta hai. JNCIP engineer design karta hai ki kai features ek doosre ko kaise asar karte hain, change ka effect predict karta hai, aur method ke saath protocol boundaries ke paar troubleshoot karta hai. Ek example do, jaise maintenance se pehle overload ya bad exit theek karne ke liye IS-IS route leaking.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JNCIP-ENT, JNCIS-ENT par bana hai; commands jaane-pehchane hain, reasoning gehri hai.</li>
<li>Topic families: IGPs, BGP aur policy, Layer 2 aur STP, multicast, CoS, access control, voice aur EVPN.</li>
<li>Interaction ke sawal aayenge: ek feature doosre ka behaviour kaise badalta hai.</li>
<li>Repeatable troubleshooting method speed se zyada zaroori hai.</li>
<li>Official page par current exam objectives dekho; har objective ki practice labs mein karo.</li>
</ul></div>
`}};export{e as default};