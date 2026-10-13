var e={id:`exam-blueprint`,h:{en:`The JNCIS-ENT exam: topics, format and how they fit together`,hi:`JNCIS-ENT exam: topics, format aur woh kaise jude hain`},body:{en:`
<p>Before a long journey you look at the map. This chapter is the map of the JNCIS-ENT exam: what it proves, how it is delivered, which topics it contains and how the topics connect. We describe the blueprint in terms of skills. Juniper updates blueprints and exam codes from time to time (the catalogue has used codes such as JN0-351 and JN0-352 for this certification, and this course tags its switching modules JN0-352), so treat this chapter as a guide and confirm the current objectives on the official exam page before you book.</p>

<h3>What JNCIS-ENT proves</h3>
<p>The Juniper Networks Certified Specialist, Enterprise Routing and Switching, shows that you can <b>implement and troubleshoot</b> the common enterprise LAN and routing features on Junos. It sits above JNCIA-Junos (which you have) and below JNCIP-ENT (design and advanced troubleshooting). It is a computer-based, multiple-choice exam, typically around 65 questions in about 90 minutes at a testing centre or online. Many questions give an <b>exhibit</b>: a configuration or <code>show</code> output that you read and diagnose. That is why this course is full of real output.</p>

<h3>The topic areas</h3>
<table class="cmp"><tr><th>Area</th><th>What it asks</th><th>Course module</th></tr>
<tr><td>Layer 2 switching and VLANs</td><td>Bridging, access and trunk ports, native VLAN, voice VLAN, IRB, Q-in-Q, MAC learning</td><td>jncis-switching</td></tr>
<tr><td>Spanning tree</td><td>STP, RSTP, MSTP, VSTP, root election, edge ports, protection features</td><td>jncis-stp</td></tr>
<tr><td>Layer 2 security</td><td>MAC limiting, DHCP snooping, DAI, port security, storm control, BPDU, loop and root protection</td><td>jncis-l2sec</td></tr>
<tr><td>Protocol-independent routing</td><td>Static, aggregate and generated routes, route preference, routing instances, RIB groups, load balancing, filter-based forwarding</td><td>jncis-pir, jncis-instances</td></tr>
<tr><td>OSPF</td><td>Link-state operation, areas, DR/BDR, stub and NSSA areas, troubleshooting</td><td>jncis-ospf</td></tr>
<tr><td>IS-IS</td><td>Levels, adjacencies, PDUs, TLVs, troubleshooting</td><td>jncis-isis</td></tr>
<tr><td>BGP</td><td>IBGP, EBGP, attributes, route selection, troubleshooting</td><td>jncis-bgp</td></tr>
<tr><td>Tunnels</td><td>GRE and IP-IP</td><td>jncis-tunnels</td></tr>
<tr><td>High availability</td><td>LAG and LACP, VRRP, graceful restart, Virtual Chassis</td><td>jncis-ha</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Topic stack">
<rect x="40" y="190" width="560" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">JNCIA-Junos skills: CLI, commit, rollback, show</text>
<rect x="40" y="145" width="560" height="38" rx="8" fill="#bae6fd"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">Layer 2: switching, VLANs, trunks, IRB, spanning tree, security</text>
<rect x="40" y="100" width="560" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="13">Routing base: static, aggregate, generated, instances, policy basics</text>
<rect x="40" y="55" width="560" height="38" rx="8" fill="#fde68a"/><text x="320" y="79" text-anchor="middle" class="svg-ink" font-size="13">Dynamic routing: OSPF, IS-IS, BGP</text>
<rect x="40" y="10" width="560" height="38" rx="8" fill="#fed7aa"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Resilience: tunnels, LAG, VRRP, graceful restart, Virtual Chassis</text>
</svg><p class="cap">Each layer depends on the one beneath it. Study from the bottom up.</p></div>

<h3>How the topics fit together</h3>
<ul>
<li><b>VLANs and trunks</b> create the Layer 2 networks; <b>IRB</b> is the bridge between Layer 2 and routing.</li>
<li><b>Spanning tree</b> keeps the redundant Layer 2 topology loop-free; <b>Layer 2 security</b> protects it from the edge.</li>
<li><b>Static and aggregate routes</b> teach how the routing table is built and which route wins (route preference); <b>routing instances</b> split one device into several routing tables.</li>
<li><b>OSPF, IS-IS and BGP</b> learn routes automatically: IGPs inside the enterprise, BGP between organisations and for large designs.</li>
<li><b>Tunnels, LAG, VRRP and Virtual Chassis</b> add connectivity options and resilience on top.</li>
</ul>

<div class="eg"><p><b>Worked example: one exhibit, three topics.</b> An exhibit shows <code>show ethernet-switching interface</code> with a trunk missing VLAN 40, a <code>show spanning-tree interface</code> where one port is alternate, and a <code>show route</code> without the 10.40.0.0/24 subnet. The question asks why the printer cannot reach its gateway. Reading from the bottom up, the VLAN is missing from the trunk (Layer 2), so the IRB has no member port and the Direct route never appears. A candidate who studied the topics separately sees three puzzles; one who studied the dependencies sees one cause.</p></div>

<h3>Question styles to expect</h3>
<ul>
<li><b>Recall:</b> default values, command names, protocol numbers (for example the default RSTP priority, OSPF area 0 rules, BGP route selection order).</li>
<li><b>Configuration choice:</b> which of four snippets achieves a stated goal.</li>
<li><b>Output interpretation:</b> what does this exhibit tell you, which neighbour is down, which VLAN is missing.</li>
<li><b>Troubleshooting:</b> given symptoms and output, what is the most likely cause or the next command.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Memorising commands without understanding the layer they belong to. Ignoring the exhibits and guessing from the wording. Studying only the topics you like. Leaving high availability to the last night: it is small but frequently tested.</p></div>
<div class="exam"><p><b>Exam trap.</b> Distractor answers often use valid commands from the wrong hierarchy or the wrong platform. Check the context: ELS or legacy syntax, switch or router, interface level or protocol level.</p></div>

<div class="scn"><h4>The candidate who knew the commands</h4><p>A candidate could type every OSPF command from memory but failed an exhibit question about a trunk. The exhibit showed an untagged frame being dropped because no native VLAN was set. The candidate had never studied what Junos does by default. After going back to Layer 2 and practising the native VLAN lab, the retake score improved.</p><p><b>Lesson:</b> defaults are exam material.</p></div>

<div class="iv"><p class="q">"How do the JNCIS-ENT topics depend on each other?"</p><p>Layer 2 first: VLANs, trunks and spanning tree. IRB joins Layer 2 to Layer 3, where static routes and route preference come first, then the dynamic protocols OSPF, IS-IS and BGP. Tunnels and high availability add options on top. So troubleshooting always starts at the bottom and moves up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JNCIS-ENT tests implementing and troubleshooting enterprise switching and routing on Junos.</li>
<li>Expect multiple choice with many exhibits of configuration and show output.</li>
<li>Topics: Layer 2, spanning tree, Layer 2 security, routing basics, OSPF, IS-IS, BGP, tunnels, high availability.</li>
<li>Study bottom up; each layer depends on the one below.</li>
<li>Confirm the current exam code and objectives on the official page.</li>
</ul></div>
`,hi:`
<p>Lambi yatra se pehle aap naksha dekhte ho. Yeh chapter JNCIS-ENT exam ka naksha hai: woh kya saabit karta hai, kaise deliver hota hai, kaunse topics hain aur woh kaise jude hain. Hum blueprint ko skills ke roop mein batate hain. Juniper blueprints aur exam codes samay samay par update karta hai (catalogue mein is certification ke liye JN0-351 aur JN0-352 jaise codes aaye hain, aur yeh course apne switching modules ko JN0-352 tag karta hai), isliye is chapter ko guide maano aur book karne se pehle official exam page par current objectives confirm karo.</p>

<h3>JNCIS-ENT kya saabit karta hai</h3>
<p>Juniper Networks Certified Specialist, Enterprise Routing and Switching, dikhata hai ki aap Junos par common enterprise LAN aur routing features <b>implement aur troubleshoot</b> kar sakte ho. Yeh JNCIA-Junos (jo aapke paas hai) ke upar aur JNCIP-ENT (design aur advanced troubleshooting) ke neeche hai. Yeh computer-based, multiple-choice exam hai, aam taur par lagbhag 65 questions, lagbhag 90 minute mein, testing centre ya online. Kai questions mein <b>exhibit</b> milta hai: configuration ya <code>show</code> output jo aap padhkar diagnose karte ho. Isi liye is course mein real output bhara hai.</p>

<h3>Topic areas</h3>
<table class="cmp"><tr><th>Area</th><th>Kya poochta hai</th><th>Course module</th></tr>
<tr><td>Layer 2 switching aur VLANs</td><td>Bridging, access aur trunk ports, native VLAN, voice VLAN, IRB, Q-in-Q, MAC learning</td><td>jncis-switching</td></tr>
<tr><td>Spanning tree</td><td>STP, RSTP, MSTP, VSTP, root election, edge ports, protection features</td><td>jncis-stp</td></tr>
<tr><td>Layer 2 security</td><td>MAC limiting, DHCP snooping, DAI, port security, storm control, BPDU, loop aur root protection</td><td>jncis-l2sec</td></tr>
<tr><td>Protocol-independent routing</td><td>Static, aggregate aur generated routes, route preference, routing instances, RIB groups, load balancing, filter-based forwarding</td><td>jncis-pir, jncis-instances</td></tr>
<tr><td>OSPF</td><td>Link-state operation, areas, DR/BDR, stub aur NSSA areas, troubleshooting</td><td>jncis-ospf</td></tr>
<tr><td>IS-IS</td><td>Levels, adjacencies, PDUs, TLVs, troubleshooting</td><td>jncis-isis</td></tr>
<tr><td>BGP</td><td>IBGP, EBGP, attributes, route selection, troubleshooting</td><td>jncis-bgp</td></tr>
<tr><td>Tunnels</td><td>GRE aur IP-IP</td><td>jncis-tunnels</td></tr>
<tr><td>High availability</td><td>LAG aur LACP, VRRP, graceful restart, Virtual Chassis</td><td>jncis-ha</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Topic stack">
<rect x="40" y="190" width="560" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">JNCIA-Junos skills: CLI, commit, rollback, show</text>
<rect x="40" y="145" width="560" height="38" rx="8" fill="#bae6fd"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">Layer 2: switching, VLANs, trunks, IRB, spanning tree, security</text>
<rect x="40" y="100" width="560" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="13">Routing base: static, aggregate, generated, instances, policy basics</text>
<rect x="40" y="55" width="560" height="38" rx="8" fill="#fde68a"/><text x="320" y="79" text-anchor="middle" class="svg-ink" font-size="13">Dynamic routing: OSPF, IS-IS, BGP</text>
<rect x="40" y="10" width="560" height="38" rx="8" fill="#fed7aa"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">Resilience: tunnels, LAG, VRRP, graceful restart, Virtual Chassis</text>
</svg><p class="cap">Har layer apne neeche wali layer par depend karti hai. Neeche se upar padho.</p></div>

<h3>Topics kaise jude hain</h3>
<ul>
<li><b>VLANs aur trunks</b> Layer 2 networks banate hain; <b>IRB</b> Layer 2 aur routing ke beech ka pul hai.</li>
<li><b>Spanning tree</b> redundant Layer 2 topology ko loop-free rakhta hai; <b>Layer 2 security</b> use edge se protect karti hai.</li>
<li><b>Static aur aggregate routes</b> sikhate hain ki routing table kaise banta hai aur kaunsa route jeetta hai (route preference); <b>routing instances</b> ek device ko kai routing tables mein baantte hain.</li>
<li><b>OSPF, IS-IS aur BGP</b> routes apne aap seekhte hain: IGPs enterprise ke andar, BGP organisations ke beech aur bade designs ke liye.</li>
<li><b>Tunnels, LAG, VRRP aur Virtual Chassis</b> upar se connectivity options aur resilience jodte hain.</li>
</ul>

<div class="eg"><p><b>Worked example: ek exhibit, teen topics.</b> Exhibit mein <code>show ethernet-switching interface</code> dikhata hai ki trunk mein VLAN 40 missing hai, <code>show spanning-tree interface</code> mein ek port alternate hai, aur <code>show route</code> mein 10.40.0.0/24 subnet nahi hai. Question poochta hai ki printer apne gateway tak kyun nahi pahunch raha. Neeche se upar padho: VLAN trunk se missing hai (Layer 2), isliye IRB ka koi member port nahi aur Direct route kabhi nahi aata. Jo candidate topics alag alag padhta hai use teen paheliyan dikhti hain; jisne dependencies padhi, use ek hi cause dikhta hai.</p></div>

<h3>Kaise questions aate hain</h3>
<ul>
<li><b>Recall:</b> default values, command names, protocol numbers (jaise default RSTP priority, OSPF area 0 rules, BGP route selection order).</li>
<li><b>Configuration choice:</b> chaar snippets mein se kaunsa diya hua goal poora karta hai.</li>
<li><b>Output interpretation:</b> yeh exhibit kya batata hai, kaunsa neighbour down hai, kaunsa VLAN missing hai.</li>
<li><b>Troubleshooting:</b> symptoms aur output dekar sabse likely cause ya agla command kya hai.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Commands ratna bina yeh samjhe ki woh kis layer ke hain. Exhibits ignore karke wording se andaaza lagana. Sirf pasandeeda topics padhna. High availability ko aakhri raat ke liye chhodna: woh chhota hai lekin aksar pooch jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Distractor answers aksar galat hierarchy ya galat platform ke valid commands use karte hain. Context check karo: ELS ya legacy syntax, switch ya router, interface level ya protocol level.</p></div>

<div class="scn"><h4>Candidate jo commands jaanta tha</h4><p>Ek candidate saare OSPF commands yaad se type kar sakta tha lekin trunk ke ek exhibit question mein fail hua. Exhibit mein untagged frame drop ho raha tha kyunki native VLAN set nahi tha. Candidate ne kabhi padha hi nahi tha ki Junos default mein kya karta hai. Layer 2 par wapas jaakar native VLAN lab practise karne ke baad retake ka score behtar hua.</p><p><b>Lesson:</b> defaults bhi exam material hain.</p></div>

<div class="iv"><p class="q">"JNCIS-ENT ke topics ek doosre par kaise depend karte hain?"</p><p>Pehle Layer 2: VLANs, trunks aur spanning tree. IRB Layer 2 ko Layer 3 se jodta hai, jahan pehle static routes aur route preference aate hain, phir dynamic protocols OSPF, IS-IS aur BGP. Tunnels aur high availability upar se options jodte hain. Isliye troubleshooting hamesha neeche se shuru hoti hai aur upar jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JNCIS-ENT Junos par enterprise switching aur routing implement aur troubleshoot karne ko test karta hai.</li>
<li>Multiple choice aur configuration tatha show output ke bahut saare exhibits ki ummeed rakho.</li>
<li>Topics: Layer 2, spanning tree, Layer 2 security, routing basics, OSPF, IS-IS, BGP, tunnels, high availability.</li>
<li>Neeche se upar padho; har layer neeche wali par depend karti hai.</li>
<li>Current exam code aur objectives official page par confirm karo.</li>
</ul></div>
`}};export{e as default};