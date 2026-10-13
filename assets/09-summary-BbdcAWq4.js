var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with an FM radio and you now have a complete picture of the last hop of multicast: the address that names a stream, the protocol that asks who is listening, the router commands that control it, and the switch feature that keeps the stream where it belongs. This chapter pulls everything into one page for revision.</p>

<h3>The whole module on one picture</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module summary">
<rect x="10" y="10" width="190" height="105" rx="10" fill="#fde68a"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="14">Address</text>
<text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="12">224/4 class D, destination only</text><text x="105" y="74" text-anchor="middle" class="svg-ink" font-size="12">232/8 SSM, 239/8 private</text><text x="105" y="92" text-anchor="middle" class="svg-ink" font-size="12">MAC 01:00:5e + 23 bits (32:1)</text>
<rect x="225" y="10" width="190" height="105" rx="10" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">IGMP</text>
<text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="12">v2: report, leave, lowest-IP querier</text><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="12">v3: source lists, 224.0.0.22</text><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">TTL 1, one LAN only</text>
<rect x="440" y="10" width="190" height="105" rx="10" fill="#ddd6fe"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="14">Router</text>
<text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="12">ip pim sparse-mode starts IGMP</text><text x="535" y="74" text-anchor="middle" class="svg-ink" font-size="12">ip igmp version, join/static-group</text><text x="535" y="92" text-anchor="middle" class="svg-ink" font-size="12">show ip igmp groups, interface</text>
<rect x="10" y="135" width="300" height="105" rx="10" fill="#bbf7d0"/><text x="160" y="159" text-anchor="middle" class="svg-ink" font-size="14">Switch: IGMP snooping</text>
<text x="160" y="181" text-anchor="middle" class="svg-ink" font-size="12">members from reports, mrouter from queries</text><text x="160" y="199" text-anchor="middle" class="svg-ink" font-size="12">needs a querier in the VLAN</text><text x="160" y="217" text-anchor="middle" class="svg-ink" font-size="12">link-local groups always flooded</text>
<rect x="330" y="135" width="300" height="105" rx="10" fill="#fed7aa"/><text x="480" y="159" text-anchor="middle" class="svg-ink" font-size="14">Troubleshooting</text>
<text x="480" y="181" text-anchor="middle" class="svg-ink" font-size="12">receiver first, one question per layer</text><text x="480" y="199" text-anchor="middle" class="svg-ink" font-size="12">retest every channel after every fix</text><text x="480" y="217" text-anchor="middle" class="svg-ink" font-size="12">several faults can coexist</text>
</svg><p class="cap">Five blocks. If you can explain each one in two sentences, you are ready for the exam and the interview.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Pick a group address from the right range and explain why not 224.0.0.x.</li>
<li>Compute the multicast MAC of a group and explain the 32-to-1 overlap.</li>
<li>Describe query, report, leave and group-specific query in IGMPv2, and say who sends each and to which address.</li>
<li>Explain report suppression and why the router sees one reporter.</li>
<li>Predict the IGMP querier and the PIM DR on a two-router LAN, and say why they can differ.</li>
<li>Explain INCLUDE and EXCLUDE, and why SSM needs IGMPv3.</li>
<li>Enable IGMP with PIM, set the version, and tell join-group from static-group.</li>
<li>Read <code>show ip igmp interface</code>, <code>show ip igmp groups</code> and <code>show ip mroute</code>.</li>
<li>Explain why a switch floods multicast and what snooping builds.</li>
<li>Design a snooping VLAN: querier, versions, immediate leave, static entries.</li>
<li>Troubleshoot "no stream" from the receiver upward, with evidence.</li>
</ul>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ranges</td><td>224.0.0.0/24 link-local (never routed); 232/8 SSM; 239/8 administratively scoped</td></tr>
<tr><td>MAC mapping</td><td>01:00:5e plus low 23 bits; 5 bits lost; 32 groups per MAC</td></tr>
<tr><td>Addresses used</td><td>Query 224.0.0.1; v2 leave 224.0.0.2; v3 report 224.0.0.22; v2 report to the group</td></tr>
<tr><td>Querier</td><td>Lowest IP wins; timeout 2 x query interval (120 s with the 60 s default)</td></tr>
<tr><td>DR (PIM)</td><td>Highest priority, then highest IP; not the same as the querier</td></tr>
<tr><td>Versions</td><td>v1 no leave; v2 leave and group-specific query; v3 source lists, no suppression; IOS XE default is 2</td></tr>
<tr><td>SSM</td><td>Needs IGMPv3 on the LAN and the SSM range; no RP; flags s and I in the mroute</td></tr>
<tr><td>join vs static</td><td>join-group: router is a member and answers ping; static-group: forward only, never expires</td></tr>
<tr><td>Snooping</td><td>Per VLAN, needs a querier; mrouter port from queries and PIM hellos; link-local always flooded</td></tr>
</table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASM / SSM</dt><dd>Any-source multicast, (*,G); source-specific multicast, (S,G).</dd>
<dt>Querier</dt><dd>The one router (or switch) per LAN that sends IGMP general queries; lowest IP wins.</dd>
<dt>DR</dt><dd>PIM designated router on a LAN: forwards the stream and sends upstream joins.</dd>
<dt>OIL</dt><dd>Outgoing interface list of an mroute entry.</dd>
<dt>mrouter port</dt><dd>A switch port toward a multicast router; receives all groups.</dd>
<dt>Report suppression</dt><dd>Hosts (and switches) hold back duplicate reports so the router hears one per group.</dd>
<dt>Immediate leave</dt><dd>Snooping option that removes a port at once on a leave; for single-host ports only.</dd>
<dt>Group record</dt><dd>An IGMPv3 entry: group, filter mode, source list.</dd>
</dl>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! router</span>
ip multicast-routing
interface GigabitEthernet0/0
 ip pim sparse-mode
 ip igmp version 3
 ip igmp join-group 239.20.1.9
 ip igmp static-group 239.20.1.50
ip pim ssm default
<span class="c">! verification</span>
show ip igmp interface GigabitEthernet0/0
show ip igmp groups
show ip mroute 239.20.1.1
<span class="c">! switch (not simulated in the labs)</span>
show ip igmp snooping groups vlan 20
show ip igmp snooping mrouter
show ip igmp snooping querier vlan 20</pre>

<div class="exam"><p><b>Exam traps in one list.</b> 224.0.0.x is never routed. 23 bits, not 24. Querier is lowest IP, DR is highest. v3 reports go to 224.0.0.22. SSM needs v3 and no RP. join-group answers ping, static-group does not. Snooping needs a querier and never filters 224.0.0.0/24.</p></div>

<div class="warn"><p><b>Revision mistakes.</b> Mixing the querier rule with the DR rule. Quoting 224/4 as "all multicast is routable". Believing snooping is a routing feature. Forgetting that the default IGMP version is 2.</p></div>

<div class="scn"><h4>The interview that started with an IGMP table</h4><p>A candidate was asked at a final interview, "a customer's IPTV box shows a black screen, where do you start?" She did not say "check the core". She asked which LAN the box was on, then said she would read the group table and interface version on the last-hop router, then the mroute entry, then the switch's snooping list, and only then PIM. The panel noted that her answer followed the data flow from the receiver and that she named a command at every step. She got the offer.</p><p><b>Lesson:</b> a structured method with commands sounds like experience.</p></div>

<div class="iv"><p class="q">"Summarise how a host gets a multicast stream, from the application to the screen."</p><p>Strong answer: the application picks or is given a group address, the host sends an IGMP report (v2 to the group, v3 to 224.0.0.22), the router on the LAN lists the group, builds a tree toward the source (PIM, next module), and forwards the stream out of that interface. The switch with IGMP snooping forwards the frames only to the member ports and the router port; the querier keeps membership alive. Mention the version, SSM, and what you would check first if it failed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast is addressed (224/4, 232/8, 239/8), joined (IGMP), forwarded (PIM) and contained (snooping).</li>
<li>IGMPv2 is the default; IGMPv3 adds source lists and enables SSM.</li>
<li>Querier = lowest IP; DR = highest priority then highest IP.</li>
<li>join-group makes the router a receiver; static-group only forwards.</li>
<li>Troubleshoot from the receiver up and retest every channel.</li>
</ul></div>
`,hi:`
<p>Aapne is module ki shuruaat FM radio se ki thi aur ab aapke paas multicast ke last hop ki poori picture hai: woh address jo stream ka naam hai, woh protocol jo poochta hai kaun sun raha hai, woh router commands jo ise control karte hain, aur woh switch feature jo stream ko wahin rakhta hai jahan use hona chahiye. Yeh chapter revision ke liye sab kuch ek page par laata hai.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module summary">
<rect x="10" y="10" width="190" height="105" rx="10" fill="#fde68a"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="14">Address</text>
<text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="12">224/4 class D, sirf destination</text><text x="105" y="74" text-anchor="middle" class="svg-ink" font-size="12">232/8 SSM, 239/8 private</text><text x="105" y="92" text-anchor="middle" class="svg-ink" font-size="12">MAC 01:00:5e + 23 bits (32:1)</text>
<rect x="225" y="10" width="190" height="105" rx="10" fill="#bae6fd"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">IGMP</text>
<text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="12">v2: report, leave, lowest-IP querier</text><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="12">v3: source lists, 224.0.0.22</text><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">TTL 1, sirf ek LAN</text>
<rect x="440" y="10" width="190" height="105" rx="10" fill="#ddd6fe"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="14">Router</text>
<text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="12">ip pim sparse-mode se IGMP shuru</text><text x="535" y="74" text-anchor="middle" class="svg-ink" font-size="12">ip igmp version, join/static-group</text><text x="535" y="92" text-anchor="middle" class="svg-ink" font-size="12">show ip igmp groups, interface</text>
<rect x="10" y="135" width="300" height="105" rx="10" fill="#bbf7d0"/><text x="160" y="159" text-anchor="middle" class="svg-ink" font-size="14">Switch: IGMP snooping</text>
<text x="160" y="181" text-anchor="middle" class="svg-ink" font-size="12">members reports se, mrouter queries se</text><text x="160" y="199" text-anchor="middle" class="svg-ink" font-size="12">VLAN mein querier chahiye</text><text x="160" y="217" text-anchor="middle" class="svg-ink" font-size="12">link-local groups hamesha flood</text>
<rect x="330" y="135" width="300" height="105" rx="10" fill="#fed7aa"/><text x="480" y="159" text-anchor="middle" class="svg-ink" font-size="14">Troubleshooting</text>
<text x="480" y="181" text-anchor="middle" class="svg-ink" font-size="12">pehle receiver, har layer par ek sawaal</text><text x="480" y="199" text-anchor="middle" class="svg-ink" font-size="12">har fix ke baad har channel retest</text><text x="480" y="217" text-anchor="middle" class="svg-ink" font-size="12">kai faults saath ho sakte hain</text>
</svg><p class="cap">Paanch blocks. Agar har ek ko do sentences mein explain kar sako, to aap exam aur interview ke liye ready ho.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Sahi range se group address chuno aur batao ki 224.0.0.x kyun nahi.</li>
<li>Group ka multicast MAC nikaalo aur 32-to-1 overlap samjhao.</li>
<li>IGMPv2 mein query, report, leave aur group-specific query describe karo, aur batao kaun kisko kis address par bhejta hai.</li>
<li>Report suppression samjhao aur batao router ko ek reporter kyun dikhta hai.</li>
<li>Do-router LAN par IGMP querier aur PIM DR predict karo, aur batao woh alag kyun ho sakte hain.</li>
<li>INCLUDE aur EXCLUDE samjhao, aur batao SSM ko IGMPv3 kyun chahiye.</li>
<li>PIM ke saath IGMP enable karo, version set karo, aur join-group aur static-group mein farak batao.</li>
<li><code>show ip igmp interface</code>, <code>show ip igmp groups</code> aur <code>show ip mroute</code> padho.</li>
<li>Samjhao ki switch multicast flood kyun karta hai aur snooping kya banata hai.</li>
<li>Snooping VLAN design karo: querier, versions, immediate leave, static entries.</li>
<li>"Stream nahi" ko receiver se upar ki taraf, evidence ke saath troubleshoot karo.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Ranges</td><td>224.0.0.0/24 link-local (kabhi routed nahi); 232/8 SSM; 239/8 administratively scoped</td></tr>
<tr><td>MAC mapping</td><td>01:00:5e plus low 23 bits; 5 bits kho jaate hain; ek MAC par 32 groups</td></tr>
<tr><td>Use hone wale addresses</td><td>Query 224.0.0.1; v2 leave 224.0.0.2; v3 report 224.0.0.22; v2 report group par</td></tr>
<tr><td>Querier</td><td>Lowest IP jeetta hai; timeout 2 x query interval (60 s default par 120 s)</td></tr>
<tr><td>DR (PIM)</td><td>Highest priority, phir highest IP; querier jaisa nahi</td></tr>
<tr><td>Versions</td><td>v1 mein leave nahi; v2 leave aur group-specific query; v3 source lists, suppression nahi; IOS XE default 2</td></tr>
<tr><td>SSM</td><td>LAN par IGMPv3 aur SSM range chahiye; RP nahi; mroute mein flags s aur I</td></tr>
<tr><td>join vs static</td><td>join-group: router member hai aur ping ka jawab deta hai; static-group: sirf forward, kabhi expire nahi</td></tr>
<tr><td>Snooping</td><td>Per VLAN, querier chahiye; mrouter port queries aur PIM hellos se; link-local hamesha flood</td></tr>
</table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASM / SSM</dt><dd>Any-source multicast, (*,G); source-specific multicast, (S,G).</dd>
<dt>Querier</dt><dd>Har LAN par woh ek router (ya switch) jo IGMP general queries bhejta hai; lowest IP jeetta hai.</dd>
<dt>DR</dt><dd>LAN par PIM designated router: stream forward karta hai aur upstream joins bhejta hai.</dd>
<dt>OIL</dt><dd>Mroute entry ki outgoing interface list.</dd>
<dt>mrouter port</dt><dd>Multicast router ki taraf ka switch port; saare groups receive karta hai.</dd>
<dt>Report suppression</dt><dd>Hosts (aur switches) duplicate reports rok lete hain taaki router ko har group ka ek sunai de.</dd>
<dt>Immediate leave</dt><dd>Snooping option jo leave par port turant hata deta hai; sirf single-host ports ke liye.</dd>
<dt>Group record</dt><dd>IGMPv3 entry: group, filter mode, source list.</dd>
</dl>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! router</span>
ip multicast-routing
interface GigabitEthernet0/0
 ip pim sparse-mode
 ip igmp version 3
 ip igmp join-group 239.20.1.9
 ip igmp static-group 239.20.1.50
ip pim ssm default
<span class="c">! verification</span>
show ip igmp interface GigabitEthernet0/0
show ip igmp groups
show ip mroute 239.20.1.1
<span class="c">! switch (labs mein simulate nahi hota)</span>
show ip igmp snooping groups vlan 20
show ip igmp snooping mrouter
show ip igmp snooping querier vlan 20</pre>

<div class="exam"><p><b>Exam traps ek list mein.</b> 224.0.0.x kabhi routed nahi. 23 bits, 24 nahi. Querier lowest IP, DR highest. v3 reports 224.0.0.22 par jaati hain. SSM ko v3 chahiye aur RP nahi. join-group ping ka jawab deta hai, static-group nahi. Snooping ko querier chahiye aur woh 224.0.0.0/24 ko kabhi filter nahi karta.</p></div>

<div class="warn"><p><b>Revision mistakes.</b> Querier rule ko DR rule se mila dena. 224/4 ko "saara multicast routable hai" kehna. Snooping ko routing feature samajhna. Yeh bhoolna ki default IGMP version 2 hai.</p></div>

<div class="scn"><h4>Woh interview jo IGMP table se shuru hua</h4><p>Ek candidate se final interview mein poocha gaya, "customer ke IPTV box par black screen hai, kahan se shuru karoge?" Usne "core check karo" nahi kaha. Usne poocha box kaunsi LAN par hai, phir kaha ki woh last-hop router par group table aur interface version padhegi, phir mroute entry, phir switch ki snooping list, aur tab jaakar PIM. Panel ne note kiya ki uska jawab receiver se data flow ko follow karta tha aur har step par usne command ka naam liya. Use offer mila.</p><p><b>Lesson:</b> commands ke saath structured method experience jaisa sunai deta hai.</p></div>

<div class="iv"><p class="q">"Application se screen tak, host ko multicast stream kaise milti hai, summarise karo."</p><p>Strong answer: application group address chunti hai ya use milta hai, host IGMP report bhejta hai (v2 group par, v3 224.0.0.22 par), LAN ka router group ko list karta hai, source ki taraf tree banata hai (PIM, agla module), aur stream us interface se forward karta hai. IGMP snooping wala switch frames sirf member ports aur router port par forward karta hai; querier membership ko zinda rakhta hai. Version, SSM, aur fail hone par sabse pehle kya check karoge yeh batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast addressed hota hai (224/4, 232/8, 239/8), joined (IGMP), forwarded (PIM) aur contained (snooping).</li>
<li>IGMPv2 default hai; IGMPv3 source lists jodta hai aur SSM enable karta hai.</li>
<li>Querier = lowest IP; DR = highest priority phir highest IP.</li>
<li>join-group router ko receiver banata hai; static-group sirf forward karta hai.</li>
<li>Receiver se upar troubleshoot karo aur har channel retest karo.</li>
</ul></div>
`}};export{e as default};