var e={id:`exam-map`,h:{en:`How the JNCIP exam topics fit together`,hi:`JNCIP exam topics ek doosre se kaise jude hain`},body:{en:`
<p>Studying ten topics one after another feels like ten unrelated subjects. In a real enterprise they are <b>layers of one system</b>. If you understand which layer a topic lives in, you also understand what it depends on and what depends on it. That is the key to both design questions and troubleshooting questions.</p>

<h3>The enterprise stack, bottom to top</h3>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Layers of an enterprise network">
<rect x="60" y="230" width="520" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="255" text-anchor="middle" class="svg-ink" font-size="13">1. Layer 2 foundation: VLANs, trunks, STP, 802.1X, voice VLAN</text>
<rect x="60" y="180" width="520" height="40" rx="8" fill="#bae6fd"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">2. Underlay routing: OSPF or IS-IS between loopbacks and links</text>
<rect x="60" y="130" width="520" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">3. Policy and BGP: who is allowed to know and use which route</text>
<rect x="60" y="80" width="520" height="40" rx="8" fill="#fde68a"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">4. Services on top: multicast, class of service, voice</text>
<rect x="60" y="30" width="520" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">5. Overlay: EVPN-VXLAN stretches L2 and L3 over the underlay</text>
<text x="30" y="150" class="svg-muted" font-size="11" transform="rotate(-90 30 150)">depends on the layer below</text>
</svg><p class="cap">Each layer relies on the layer below it. A fault low in the stack shows up as a symptom high in the stack.</p></div>

<h3>Topic by topic: the problem each one solves</h3>
<table class="cmp"><tr><th>Topic</th><th>Problem it solves</th><th>Course module</th></tr>
<tr><td>Switching and VLANs</td><td>Separate and extend Layer 2 domains</td><td>jncip-switching</td></tr>
<tr><td>STP family</td><td>Keep Layer 2 loop-free but resilient</td><td>jncip-stp</td></tr>
<tr><td>802.1X</td><td>Only authenticated devices get network access</td><td>jncip-dot1x</td></tr>
<tr><td>VoIP support</td><td>Phones find the voice VLAN and get priority</td><td>jncip-voip</td></tr>
<tr><td>OSPF</td><td>Fast, area-based IGP for campus and WAN</td><td>jncip-ospf</td></tr>
<tr><td>IS-IS</td><td>Level-based IGP, popular in large cores</td><td>jncip-isis</td></tr>
<tr><td>BGP</td><td>Scale, policy and multi-site/ISP connectivity</td><td>jncip-bgp</td></tr>
<tr><td>Multicast</td><td>One stream to many receivers without copies per host</td><td>jncip-mcast</td></tr>
<tr><td>CoS</td><td>Protect important traffic when links are busy</td><td>jncip-cos</td></tr>
<tr><td>EVPN-VXLAN</td><td>Multi-tenant L2/L3 service over an IP fabric</td><td>jncip-evpn</td></tr></table>
<p>Treat this table as a map, not a syllabus. The authoritative list of objectives, and their weighting, is the one Juniper publishes for JN0-650. Compare it with this table early and note any objective that feels weak.</p>

<h3>Dependencies are where the exam hides</h3>
<p>Questions often live on the seam between two layers:</p>
<ul>
<li><b>IGP and BGP.</b> BGP needs a next hop it can resolve. If the IGP does not carry the next-hop address, the BGP route is <b>hidden</b>, even though the session is up.</li>
<li><b>IGP and CoS.</b> Hello and keepalive packets are control-plane traffic. If a scheduler drops them, an adjacency flaps and the IGP, and everything above it, reconverges.</li>
<li><b>STP and everything.</b> A Layer 2 loop or a topology change flushes MAC tables and can look like a routing problem.</li>
<li><b>EVPN and the underlay.</b> The overlay is only as stable as the loopback reachability beneath it.</li>
<li><b>802.1X and voice.</b> A phone and a PC share one port. The port must authenticate each device and still place the phone in the voice VLAN.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Users in the head office cannot reach a branch server. The BGP session to the branch is Established. A beginner restarts BGP. A JNCIP engineer walks down the stack: is the BGP next hop reachable (layer 2 of the stack, the IGP)? Does <code>show route hidden</code> show the prefix? If yes, the fix is to carry the next-hop loopback in the IGP or set <code>next-hop self</code>, not to touch BGP timers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Studying a topic only in isolation. If you can configure OSPF but cannot say what happens to BGP when you shut an OSPF interface, you have not finished the topic.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question may describe a symptom at one layer (users cannot reach a server) while the cause sits two layers lower (a VLAN missing on a trunk, an IGP area mismatch). Read the whole topology before you pick an answer.</p></div>

<div class="scn"><h4>Phones reboot every ten minutes</h4><p>IP phones on a new floor rebooted at regular intervals. The cable and the PoE budget were fine. The engineer saw that the voice VLAN was allowed on the access port but the uplink trunk to the distribution switch had a different allowed list, so after the lease timed out the phones lost the call server. The Layer 2 gap looked like an application fault.</p><p><b>Lesson:</b> check the lowest layer first. A missing VLAN on a trunk shows up as a service problem.</p></div>

<div class="iv"><p class="q">"How would you explain the relationship between an IGP and BGP in an enterprise?"</p><p>The IGP provides reachability between loopbacks and links inside the domain. BGP carries many prefixes and applies policy, and it relies on the IGP to resolve its next hops. If the IGP breaks, BGP routes become unusable even with sessions up. Mention <code>next-hop self</code> for edge routes and loopback peering for resilience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The ten topics are layers: Layer 2 base, IGP underlay, BGP and policy, services, EVPN overlay.</li>
<li>Faults low in the stack appear as symptoms high in the stack.</li>
<li>BGP depends on the IGP for next-hop resolution; EVPN depends on the underlay.</li>
<li>Control-plane traffic needs protection in CoS designs.</li>
<li>Use the official JN0-650 objective list as the syllabus; this map is your study aid.</li>
</ul></div>
`,hi:`
<p>Das topics ek ke baad ek padhna das alag subjects jaisa lagta hai. Asli enterprise mein woh <b>ek system ki layers</b> hain. Agar aap samajh lo ki topic kis layer mein rehta hai, to yeh bhi samajh aata hai ki woh kis par depend karta hai aur kaun usper depend karta hai. Design aur troubleshooting dono sawalon ki yahi chaabi hai.</p>

<h3>Enterprise stack, neeche se upar</h3>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Enterprise network ki layers">
<rect x="60" y="230" width="520" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="255" text-anchor="middle" class="svg-ink" font-size="13">1. Layer 2 foundation: VLANs, trunks, STP, 802.1X, voice VLAN</text>
<rect x="60" y="180" width="520" height="40" rx="8" fill="#bae6fd"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">2. Underlay routing: loopbacks aur links ke beech OSPF ya IS-IS</text>
<rect x="60" y="130" width="520" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">3. Policy aur BGP: kaun kaunsa route jaane aur use kare</text>
<rect x="60" y="80" width="520" height="40" rx="8" fill="#fde68a"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13">4. Upar ki services: multicast, class of service, voice</text>
<rect x="60" y="30" width="520" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">5. Overlay: EVPN-VXLAN underlay par L2 aur L3 failata hai</text>
<text x="30" y="150" class="svg-muted" font-size="11" transform="rotate(-90 30 150)">neeche wali layer par depend</text>
</svg><p class="cap">Har layer neeche wali layer par tiki hai. Stack mein neeche ka fault upar symptom ban kar dikhta hai.</p></div>

<h3>Topic by topic: har ek kaunsa problem solve karta hai</h3>
<table class="cmp"><tr><th>Topic</th><th>Kaunsa problem solve karta hai</th><th>Course module</th></tr>
<tr><td>Switching aur VLANs</td><td>Layer 2 domains ko alag aur extend karna</td><td>jncip-switching</td></tr>
<tr><td>STP family</td><td>Layer 2 ko loop-free par resilient rakhna</td><td>jncip-stp</td></tr>
<tr><td>802.1X</td><td>Sirf authenticated devices ko network access</td><td>jncip-dot1x</td></tr>
<tr><td>VoIP support</td><td>Phones voice VLAN dhoondhein aur priority paayein</td><td>jncip-voip</td></tr>
<tr><td>OSPF</td><td>Campus aur WAN ke liye fast, area-based IGP</td><td>jncip-ospf</td></tr>
<tr><td>IS-IS</td><td>Level-based IGP, bade cores mein popular</td><td>jncip-isis</td></tr>
<tr><td>BGP</td><td>Scale, policy aur multi-site/ISP connectivity</td><td>jncip-bgp</td></tr>
<tr><td>Multicast</td><td>Ek stream bahut receivers ko, har host ke liye alag copy ke bina</td><td>jncip-mcast</td></tr>
<tr><td>CoS</td><td>Links busy hon to important traffic ko bachana</td><td>jncip-cos</td></tr>
<tr><td>EVPN-VXLAN</td><td>IP fabric par multi-tenant L2/L3 service</td><td>jncip-evpn</td></tr></table>
<p>Is table ko syllabus nahi, map samjho. Objectives ki authoritative list aur unki weightage wahi hai jo Juniper JN0-650 ke liye publish karta hai. Use jaldi is table se compare karo aur jo objective kamzor lage use note karo.</p>

<h3>Dependencies mein hi exam chhupa hota hai</h3>
<p>Sawal aksar do layers ke jod par hote hain:</p>
<ul>
<li><b>IGP aur BGP.</b> BGP ko aisa next hop chahiye jo resolve ho sake. IGP next-hop address carry na kare to BGP route session up hone par bhi <b>hidden</b> hota hai.</li>
<li><b>IGP aur CoS.</b> Hello aur keepalive packets control-plane traffic hain. Scheduler unhe drop kare to adjacency flap hoti hai aur IGP, saath mein uske upar sab kuch, reconverge karta hai.</li>
<li><b>STP aur baaki sab.</b> Layer 2 loop ya topology change MAC tables flush karta hai aur routing problem jaisa dikh sakta hai.</li>
<li><b>EVPN aur underlay.</b> Overlay utna hi stable hai jitni neeche wali loopback reachability.</li>
<li><b>802.1X aur voice.</b> Phone aur PC ek port share karte hain. Port ko har device authenticate karna hai aur phone ko voice VLAN mein bhi rakhna hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Head office ke users branch server tak nahi pahunch rahe. Branch ka BGP session Established hai. Beginner BGP restart kar deta hai. JNCIP engineer stack mein neeche jaata hai: kya BGP next hop reachable hai (stack ki layer 2, yaani IGP)? Kya <code>show route hidden</code> mein prefix dikhta hai? Haan, to fix hai next-hop loopback ko IGP mein carry karna ya <code>next-hop self</code> set karna, BGP timers chhune ki zaroorat nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Topic ko sirf akele padhna. Aap OSPF configure kar sakte ho par OSPF interface shut karne par BGP ka kya hoga yeh nahi bata sakte, to topic poora nahi hua.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal ek layer ka symptom bata sakta hai (users server tak nahi pahunch rahe) jabki cause do layer neeche hai (trunk par VLAN missing, IGP area mismatch). Jawab chunne se pehle poori topology padho.</p></div>

<div class="scn"><h4>Phones har das minute mein reboot</h4><p>Naye floor ke IP phones regular intervals par reboot ho rahe the. Cable aur PoE budget theek the. Engineer ne dekha ki access port par voice VLAN allowed tha par distribution switch ki uplink trunk par allowed list alag thi, isliye lease timeout ke baad phones call server kho dete the. Layer 2 ki kami application fault jaisi dikhi.</p><p><b>Lesson:</b> sabse neeche wali layer pehle check karo. Trunk par VLAN missing hona service problem banke dikhta hai.</p></div>

<div class="iv"><p class="q">"Enterprise mein IGP aur BGP ka relation kaise samjhaoge?"</p><p>IGP domain ke andar loopbacks aur links ke beech reachability deta hai. BGP bahut prefixes carry karta hai aur policy lagata hai, aur apne next hops resolve karne ke liye IGP par depend karta hai. IGP toote to sessions up hone par bhi BGP routes unusable ho jaate hain. Edge routes ke liye <code>next-hop self</code> aur resilience ke liye loopback peering ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Das topics layers hain: Layer 2 base, IGP underlay, BGP aur policy, services, EVPN overlay.</li>
<li>Stack mein neeche ke faults upar ke symptoms ban kar dikhte hain.</li>
<li>BGP next-hop resolution ke liye IGP par depend karta hai; EVPN underlay par.</li>
<li>CoS designs mein control-plane traffic ko protect karna padta hai.</li>
<li>Official JN0-650 objective list ko syllabus maano; yeh map aapka study aid hai.</li>
</ul></div>
`}};export{e as default};