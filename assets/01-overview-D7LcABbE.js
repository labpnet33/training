var e={id:`overview`,h:{en:`The big picture: one fabric, three labs and a map of the components`,hi:`Big picture: ek fabric, teen labs aur components ka map`},body:{en:`
<p><b>What you will learn in this module.</b> By the end you will be able to read a live Cisco Catalyst SD-WAN network from the command line and explain what you see. You will name each component and say what it does, describe how TLOCs, colours, OMP and BFD fit together, follow one packet from a PC in Delhi to a server in Hyderabad, and build a second segment (a guest VPN) on a working fabric. These are the skills the architecture domain of exam 300-415 ENSDWI v1.2 tests, and they are also the skills a NOC engineer uses on day one.</p>
<p><b>Prerequisites.</b> The starter module <i>SD-WAN from zero</i>, or the same knowledge: the four planes, the four components, the idea of an overlay and an underlay, and basic IP routing. You do not need to have configured SD-WAN before. Each command is explained when it first appears.</p>

<h3>Start with an analogy: a metro rail network</h3>
<p>A metro system has stations (the WAN edges) where passengers get on and off, and trains that carry them between stations (the encrypted tunnels). There is a central <b>control room</b> that knows every station and publishes the timetable: which station can be reached from which platform (this is the Controller and its routing information). There is a <b>head office</b> where the rule book, staff rosters and monitoring screens live (the Manager). And there is a <b>ticket and ID desk</b> at the entrance of the network where every new employee is checked before being sent on to the right office (the Validator). The control room never carries a passenger; the trains do.</p>

<h3>The fabric you will work on</h3>
<p>The labs in this module use a small but realistic network for a retailer called Bharat Retail. The control components sit in a data centre behind a router, and the data centre reaches two transports: a simulated internet cloud and a simulated MPLS cloud. Branch routers called WAN edges (names start with E-) attach to these clouds.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Bharat Retail SD-WAN fabric">
<rect x="10" y="30" width="190" height="270" rx="12" fill="#e2e8f0"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">Data centre 198.51.100.0/24</text>
<rect x="30" y="66" width="150" height="34" rx="8" fill="#bae6fd"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="12">VMANAGE .10 (Manager)</text>
<rect x="30" y="112" width="150" height="34" rx="8" fill="#ddd6fe"/><text x="105" y="134" text-anchor="middle" class="svg-ink" font-size="12">VSMART .20 (Controller)</text>
<rect x="30" y="158" width="150" height="34" rx="8" fill="#fde68a"/><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="12">VBOND .30 (Validator)</text>
<rect x="60" y="214" width="90" height="30" rx="8" fill="#fff"/><text x="105" y="234" text-anchor="middle" class="svg-ink" font-size="12">DCSW</text>
<rect x="60" y="256" width="90" height="30" rx="8" fill="#fff"/><text x="105" y="276" text-anchor="middle" class="svg-ink" font-size="12">DCR</text>
<line x1="180" y1="271" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="180" y1="271" x2="260" y2="235" stroke="#64748b" stroke-width="2"/>
<ellipse cx="300" cy="100" rx="55" ry="30" fill="#bae6fd"/><text x="300" y="104" text-anchor="middle" class="svg-ink" font-size="12">INET</text>
<ellipse cx="300" cy="240" rx="55" ry="30" fill="#ddd6fe"/><text x="300" y="244" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text>
<rect x="450" y="40" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="505" y="62" text-anchor="middle" class="svg-ink" font-size="12">E-DEL-1 (site 100)</text>
<rect x="450" y="130" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="505" y="152" text-anchor="middle" class="svg-ink" font-size="12">E-MUM-1 (site 200)</text>
<rect x="450" y="220" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="505" y="242" text-anchor="middle" class="svg-ink" font-size="12">E-BLR-1 (site 300)</text>
<line x1="355" y1="90" x2="450" y2="57" stroke="#64748b" stroke-width="2"/><line x1="355" y1="100" x2="450" y2="145" stroke="#64748b" stroke-width="2"/><line x1="350" y1="110" x2="450" y2="235" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="230" x2="450" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/><line x1="355" y1="240" x2="450" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/>
<text x="600" y="62" text-anchor="end" class="svg-muted" font-size="11">VPN 10: 10.1.10.0/24</text><text x="600" y="152" text-anchor="end" class="svg-muted" font-size="11">10.2.10.0/24</text><text x="600" y="242" text-anchor="end" class="svg-muted" font-size="11">10.3.10.0/24</text>
<text x="320" y="318" text-anchor="middle" class="svg-muted" font-size="11">Solid lines: internet. Dashed lines: MPLS (Delhi and Mumbai only). Bengaluru has internet only.</text>
</svg><p class="cap">The Bharat Retail lab fabric. Manager, Controller and Validator sit in the data centre; each store edge reaches them over the internet or MPLS.</p></div>

<table class="cmp"><tr><th>Device</th><th>Role</th><th>Identity</th></tr>
<tr><td>VMANAGE</td><td>SD-WAN Manager</td><td>system IP 10.255.255.1, address 198.51.100.10</td></tr>
<tr><td>VSMART</td><td>SD-WAN Controller</td><td>system IP 10.255.255.2, address 198.51.100.20</td></tr>
<tr><td>VBOND</td><td>SD-WAN Validator</td><td>system IP 10.255.255.3, address 198.51.100.30</td></tr>
<tr><td>E-DEL-1, E-MUM-1</td><td>WAN edges with internet and MPLS</td><td>system IPs 10.255.0.11, 10.255.0.12; sites 100, 200</td></tr>
<tr><td>E-BLR-1</td><td>WAN edge with internet only</td><td>system IP 10.255.0.13; site 300</td></tr>
<tr><td>INET, MPLS</td><td>Simulated carrier clouds</td><td>underlay only</td></tr></table>

<h3>Naming: new product names and the older ones</h3>
<p>Cisco renamed the components. The current names are <b>SD-WAN Manager</b>, <b>SD-WAN Controller</b> and <b>SD-WAN Validator</b>. The lab devices are still labelled VMANAGE, VSMART and VBOND, and many commands, APIs and job interviews still use vManage, vSmart and vBond. <b>WAN edge</b> is the router; <b>cEdge</b> means an IOS XE router in controller mode and <b>vEdge</b> means a legacy Viptela router. Learn both names for every item once and you will never be confused.</p>

<h3>How the three labs map to the chapters</h3>
<ol>
<li><b>Read a live fabric</b> (chapters 2 to 5): control connections, OMP peers, BFD sessions and an end-to-end test in VPN 10.</li>
<li><b>Follow a packet</b> (chapters 4, 5 and 6): routing table, OMP route, TLOC, BFD session and traceroute; then add a second transport.</li>
<li><b>Guest segmentation</b> (chapter 7): create VPN 20 on two sites and prove it is isolated from VPN 10.</li>
</ol>
<p>Chapter 8 gives a troubleshooting routine that works on all three, and chapter 9 is the summary and checklist.</p>

<div class="eg"><p><b>Worked example.</b> In one glance at the table above you can already predict facts the labs will confirm. E-DEL-1 has two transports (internet and MPLS), so it has two TLOCs. E-BLR-1 has one transport, so one TLOC. The three store LANs are 10.1.10.0/24, 10.2.10.0/24 and 10.3.10.0/24, all in VPN 10, each behind a different site ID. If a PC in Delhi reaches a PC in Bengaluru, the packet will travel in an IPsec tunnel over the internet because E-BLR-1 has no MPLS.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the simulator devices as ordinary routers. VMANAGE, VSMART and VBOND use the Viptela-style CLI (<code>system</code>, <code>vpn 0</code>, <code>commit</code>), while the edges use IOS XE in controller mode. The commands differ by device type, and the next chapters show which one to use where.</p></div>

<div class="scn"><h4>The new NOC joiner's first hour</h4><p>On her first day a NOC engineer was told "the fabric is healthy, just have a look". She did not know where to start, so she opened the Manager and clicked every menu. Her lead showed her a better routine: check the control connections on the Validator and an edge; then OMP peers; then BFD sessions; finally a test between two LANs. In ten minutes she could tell the lead what was normal and what a failure would look like.</p><p><b>Lesson:</b> a fixed reading order (control, OMP, BFD, data) gives you a map to hold the whole architecture in your head. This module teaches that order.</p></div>

<div class="iv"><p class="q">"Describe the architecture of a Catalyst SD-WAN deployment you have worked on or studied."</p><p>Strong answer: name the three control components and where they sit (for example the data centre or a cloud), say that each WAN edge keeps control connections to the Controller and the Manager and builds IPsec tunnels with BFD to other edges, and give numbers: how many sites, how many transports, which VPNs. Show that you know which parts carry user traffic (only the edges).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module teaches you to read, trace and extend a working Catalyst SD-WAN fabric.</li>
<li>The lab fabric has VMANAGE, VSMART and VBOND in a data centre and three edges: Delhi, Mumbai, Bengaluru.</li>
<li>New names (Manager, Controller, Validator) and old names (vManage, vSmart, vBond) are both used in practice.</li>
<li>Controllers use the Viptela-style CLI; WAN edges use IOS XE in controller mode.</li>
<li>Read in this order: control connections, OMP, BFD, then the data path.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Ant tak aap live Cisco Catalyst SD-WAN network ko command line se padh paoge aur samjha paoge ki aap kya dekh rahe ho. Aap har component ka naam aur kaam bata paoge, TLOCs, colours, OMP aur BFD kaise fit hote hain yeh describe kar paoge, Delhi ke PC se Hyderabad ke server tak ek packet follow kar paoge, aur ek working fabric par doosra segment (guest VPN) bana paoge. Yeh woh skills hain jo exam 300-415 ENSDWI v1.2 ka architecture domain test karta hai, aur yahi skills NOC engineer pehle din use karta hai.</p>
<p><b>Prerequisites.</b> Starter module <i>SD-WAN from zero</i>, ya wahi knowledge: chaar planes, chaar components, overlay aur underlay ka idea, aur basic IP routing. Aapne pehle SD-WAN configure kiya ho yeh zaroori nahi. Har command pehli baar aane par samjhai gayi hai.</p>

<h3>Ek analogy se shuru karo: metro rail network</h3>
<p>Metro system mein stations (WAN edges) hote hain jahan passengers chadhte-utarte hain, aur trains jo unhe stations ke beech le jaati hain (encrypted tunnels). Ek central <b>control room</b> hai jo har station ko jaanta hai aur timetable publish karta hai: kaunse station tak kis platform se pahunchna hai (yeh Controller aur uski routing information hai). Ek <b>head office</b> hai jahan rule book, staff rosters aur monitoring screens rehte hain (Manager). Aur network ke entrance par ek <b>ticket aur ID desk</b> hai jahan har naye employee ko check karke sahi office bheja jaata hai (Validator). Control room kabhi ek bhi passenger nahi le jaata; trains le jaati hain.</p>

<h3>Woh fabric jis par aap kaam karoge</h3>
<p>Is module ke labs Bharat Retail naam ke ek retailer ka chhota par realistic network use karte hain. Control components ek router ke peeche data centre mein baithe hain, aur data centre do transports tak pahunchta hai: ek simulated internet cloud aur ek simulated MPLS cloud. Branch routers jinhe WAN edges kehte hain (naam E- se shuru hote hain) in clouds se jude hain.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Bharat Retail SD-WAN fabric">
<rect x="10" y="30" width="190" height="270" rx="12" fill="#e2e8f0"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">Data centre 198.51.100.0/24</text>
<rect x="30" y="66" width="150" height="34" rx="8" fill="#bae6fd"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="12">VMANAGE .10 (Manager)</text>
<rect x="30" y="112" width="150" height="34" rx="8" fill="#ddd6fe"/><text x="105" y="134" text-anchor="middle" class="svg-ink" font-size="12">VSMART .20 (Controller)</text>
<rect x="30" y="158" width="150" height="34" rx="8" fill="#fde68a"/><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="12">VBOND .30 (Validator)</text>
<rect x="60" y="214" width="90" height="30" rx="8" fill="#fff"/><text x="105" y="234" text-anchor="middle" class="svg-ink" font-size="12">DCSW</text>
<rect x="60" y="256" width="90" height="30" rx="8" fill="#fff"/><text x="105" y="276" text-anchor="middle" class="svg-ink" font-size="12">DCR</text>
<line x1="180" y1="271" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="180" y1="271" x2="260" y2="235" stroke="#64748b" stroke-width="2"/>
<ellipse cx="300" cy="100" rx="55" ry="30" fill="#bae6fd"/><text x="300" y="104" text-anchor="middle" class="svg-ink" font-size="12">INET</text>
<ellipse cx="300" cy="240" rx="55" ry="30" fill="#ddd6fe"/><text x="300" y="244" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text>
<rect x="450" y="40" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="505" y="62" text-anchor="middle" class="svg-ink" font-size="12">E-DEL-1 (site 100)</text>
<rect x="450" y="130" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="505" y="152" text-anchor="middle" class="svg-ink" font-size="12">E-MUM-1 (site 200)</text>
<rect x="450" y="220" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="505" y="242" text-anchor="middle" class="svg-ink" font-size="12">E-BLR-1 (site 300)</text>
<line x1="355" y1="90" x2="450" y2="57" stroke="#64748b" stroke-width="2"/><line x1="355" y1="100" x2="450" y2="145" stroke="#64748b" stroke-width="2"/><line x1="350" y1="110" x2="450" y2="235" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="230" x2="450" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/><line x1="355" y1="240" x2="450" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/>
<text x="600" y="62" text-anchor="end" class="svg-muted" font-size="11">VPN 10: 10.1.10.0/24</text><text x="600" y="152" text-anchor="end" class="svg-muted" font-size="11">10.2.10.0/24</text><text x="600" y="242" text-anchor="end" class="svg-muted" font-size="11">10.3.10.0/24</text>
<text x="320" y="318" text-anchor="middle" class="svg-muted" font-size="11">Solid lines: internet. Dashed lines: MPLS (sirf Delhi aur Mumbai). Bengaluru par sirf internet.</text>
</svg><p class="cap">Bharat Retail lab fabric. Manager, Controller aur Validator data centre mein baithe hain; har store edge internet ya MPLS se unhe reach karta hai.</p></div>

<table class="cmp"><tr><th>Device</th><th>Role</th><th>Identity</th></tr>
<tr><td>VMANAGE</td><td>SD-WAN Manager</td><td>system IP 10.255.255.1, address 198.51.100.10</td></tr>
<tr><td>VSMART</td><td>SD-WAN Controller</td><td>system IP 10.255.255.2, address 198.51.100.20</td></tr>
<tr><td>VBOND</td><td>SD-WAN Validator</td><td>system IP 10.255.255.3, address 198.51.100.30</td></tr>
<tr><td>E-DEL-1, E-MUM-1</td><td>Internet aur MPLS wale WAN edges</td><td>system IPs 10.255.0.11, 10.255.0.12; sites 100, 200</td></tr>
<tr><td>E-BLR-1</td><td>Sirf internet wala WAN edge</td><td>system IP 10.255.0.13; site 300</td></tr>
<tr><td>INET, MPLS</td><td>Simulated carrier clouds</td><td>sirf underlay</td></tr></table>

<h3>Naming: naye product names aur purane</h3>
<p>Cisco ne components ke naam badal diye. Current names hain <b>SD-WAN Manager</b>, <b>SD-WAN Controller</b> aur <b>SD-WAN Validator</b>. Lab devices abhi bhi VMANAGE, VSMART aur VBOND ke label ke saath hain, aur bahut se commands, APIs aur interviews abhi bhi vManage, vSmart aur vBond use karte hain. <b>WAN edge</b> router hai; <b>cEdge</b> ka matlab controller mode mein IOS XE router aur <b>vEdge</b> ka matlab legacy Viptela router. Har cheez ke dono naam ek baar seekh lo aur aap kabhi confuse nahi hoge.</p>

<h3>Teen labs chapters se kaise map hote hain</h3>
<ol>
<li><b>Live fabric padho</b> (chapters 2 se 5): control connections, OMP peers, BFD sessions aur VPN 10 mein end-to-end test.</li>
<li><b>Packet follow karo</b> (chapters 4, 5 aur 6): routing table, OMP route, TLOC, BFD session aur traceroute; phir doosra transport jodo.</li>
<li><b>Guest segmentation</b> (chapter 7): do sites par VPN 20 banao aur saabit karo ki woh VPN 10 se isolated hai.</li>
</ol>
<p>Chapter 8 ek troubleshooting routine deta hai jo teeno par kaam karta hai, aur chapter 9 summary aur checklist hai.</p>

<div class="eg"><p><b>Worked example.</b> Upar ki table ko ek nazar mein dekh kar aap woh facts predict kar sakte ho jo labs confirm karenge. E-DEL-1 ke do transports hain (internet aur MPLS), isliye uske do TLOCs hain. E-BLR-1 ka ek transport hai, isliye ek TLOC. Teeno store LANs 10.1.10.0/24, 10.2.10.0/24 aur 10.3.10.0/24 hain, sab VPN 10 mein, har ek alag site ID ke peeche. Agar Delhi ka PC Bengaluru ke PC tak pahunchta hai, to packet internet par IPsec tunnel mein jaayega kyunki E-BLR-1 ke paas MPLS nahi hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Simulator devices ko ordinary routers samajhna. VMANAGE, VSMART aur VBOND Viptela-style CLI (<code>system</code>, <code>vpn 0</code>, <code>commit</code>) use karte hain, jabki edges controller mode mein IOS XE use karte hain. Commands device type se alag hote hain, aur agle chapters dikhate hain ki kahan kaunsa use karna hai.</p></div>

<div class="scn"><h4>Naye NOC joiner ka pehla ghanta</h4><p>Pehle din ek NOC engineer se kaha gaya "fabric healthy hai, bas ek nazar daal lo". Use pata nahi tha kahan se shuru kare, isliye usne Manager kholkar har menu click kar diya. Uske lead ne use behtar routine dikhai: Validator aur ek edge par control connections check karo; phir OMP peers; phir BFD sessions; ant mein do LANs ke beech ek test. Das minute mein woh lead ko bata sakti thi ki normal kya hai aur failure kaisa dikhega.</p><p><b>Seekh:</b> fixed reading order (control, OMP, BFD, data) poore architecture ko dimaag mein rakhne ka map deta hai. Yeh module yahi order sikhata hai.</p></div>

<div class="iv"><p class="q">"Ek Catalyst SD-WAN deployment ka architecture describe kijiye jis par aapne kaam kiya ya padha."</p><p>Strong answer: teen control components ke naam aur woh kahan baithe hain (jaise data centre ya cloud) batao, kaho ki har WAN edge Controller aur Manager se control connections rakhta hai aur doosre edges tak BFD ke saath IPsec tunnels banata hai, aur numbers do: kitni sites, kitne transports, kaunse VPNs. Dikhao ki aap jaante ho kaunse parts user traffic carry karte hain (sirf edges).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module aapko working Catalyst SD-WAN fabric padhna, trace karna aur extend karna sikhata hai.</li>
<li>Lab fabric mein data centre mein VMANAGE, VSMART aur VBOND hain aur teen edges: Delhi, Mumbai, Bengaluru.</li>
<li>Naye naam (Manager, Controller, Validator) aur purane (vManage, vSmart, vBond) dono practice mein use hote hain.</li>
<li>Controllers Viptela-style CLI use karte hain; WAN edges controller mode mein IOS XE.</li>
<li>Is order mein padho: control connections, OMP, BFD, phir data path.</li>
</ul></div>
`}};export{e as default};