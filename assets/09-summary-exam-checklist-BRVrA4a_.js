var e={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a courier and customer sites and ended with a working, troubleshot MPLS L3VPN. This chapter is the night-before sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the roles of CE, PE and P, and why P routers need no customer routes.</li>
<li>Create a VRF with RD and RTs, and put an interface in it (then re-enter the address).</li>
<li>Configure MP-BGP VPNv4 with activate and send-community extended.</li>
<li>Explain the two-label stack: transport (LDP) plus VPN (BGP).</li>
<li>Configure PE-CE eBGP under the VRF address family; know as-override and allowas-in.</li>
<li>Design full mesh, hub-and-spoke and extranet with RTs.</li>
<li>Name the three inter-AS options, CSC, 6VPE, mVPN and EVPN at overview level.</li>
<li>Troubleshoot in the order: PE-CE, VPNv4, RTs, LSP, verify.</li>
</ul>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>VRF</td><td>Virtual routing and forwarding table per customer on a PE</td></tr>
<tr><td>RD</td><td>8-byte value that makes prefixes unique; VPNv4 = RD + IPv4 (12 bytes)</td></tr>
<tr><td>RT</td><td>Extended community that controls import and export</td></tr>
<tr><td>VPNv4</td><td>MP-BGP address family for VPN routes</td></tr>
<tr><td>VPN label</td><td>Inner label assigned by the egress PE</td></tr>
<tr><td>Transport label</td><td>Outer label (LDP) to the remote PE loopback</td></tr>
<tr><td>PHP</td><td>Penultimate-hop pop of the outer label</td></tr>
<tr><td>as-override</td><td>PE replaces customer ASN with its own in the path</td></tr></table>

<h3>Most-tested facts</h3>
<ul>
<li>RD makes unique; RT controls distribution.</li>
<li>Next hop of VPNv4 is the PE loopback; it needs an LSP.</li>
<li>P routers run no BGP: <code>show ip bgp</code> on P says BGP not active.</li>
<li>Same ASN at all sites: as-override or allowas-in.</li>
<li>Hub-and-spoke uses separate import and export RTs.</li>
<li>Inter-AS: A VRFs on ASBR, B VPNv4 between ASBRs, C between RRs.</li>
</ul>

<h3>Command sheet</h3>
<table class="cmp"><tr><th>Purpose</th><th>Command</th></tr>
<tr><td>VRF list</td><td><code>show vrf</code>, <code>show vrf detail NAME</code></td></tr>
<tr><td>VRF routes</td><td><code>show ip route vrf NAME</code></td></tr>
<tr><td>VPNv4 table</td><td><code>show bgp vpnv4 unicast all</code></td></tr>
<tr><td>VPN labels</td><td><code>show bgp vpnv4 unicast all labels</code></td></tr>
<tr><td>VPNv4 sessions</td><td><code>show bgp vpnv4 unicast all summary</code></td></tr>
<tr><td>Transport LSP</td><td><code>show mpls forwarding-table</code>, <code>traceroute</code></td></tr>
<tr><td>Test in VRF</td><td><code>ping vrf NAME x.x.x.x</code></td></tr></table>

<div class="eg"><p><b>Worked example.</b> Explain the path of 172.16.2.10: CE1 to PE1 (VRF), VPNv4 route via 10.0.255.3 with label 19, outer LDP label 17, P pops, PE2 reads 19, CE2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to re-enter the interface address, using global ping, forgetting send-community extended, and assuming the VPN layer is at fault when LDP is.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the question for what is wrong: a missing RT, a missing label or a missing neighbour activation each point at a different layer.</p></div>

<div class="scn"><h4>Final drill</h4><p>Take any broken-VPN story and say aloud which layer fails: customer edge, VPNv4 control plane, RT policy or transport LSP. Then name the command that proves it.</p><p><b>Lesson:</b> a clear layer model solves most tickets.</p></div>

<div class="iv"><p class="q">"Summarise how an MPLS L3VPN works in one minute."</p><p>Each customer has a VRF on the PE. PEs exchange customer routes with MP-BGP VPNv4 using RDs and RTs. Traffic crosses the core with two labels, an LDP transport label and a BGP VPN label, so P routers need no customer routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRF + RD + RT on the PE.</li>
<li>VPNv4 carries routes; two labels carry packets.</li>
<li>P routers stay BGP-free.</li>
<li>RTs design the topology.</li>
<li>Troubleshoot from the edge to the core.</li>
</ul></div>
`,hi:`
<p>Aapne courier aur customer sites se shuru kiya aur ek chalte hue, troubleshoot kiye gaye MPLS L3VPN par khatam kiya. Yeh chapter exam se pehli raat ki sheet hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>CE, PE aur P ke roles samjhao, aur kyun P routers ko customer routes nahi chahiye.</li>
<li>RD aur RTs ke saath VRF banao, aur interface ko usme daalo (phir address dobara daalo).</li>
<li>activate aur send-community extended ke saath MP-BGP VPNv4 configure karo.</li>
<li>Do-label stack samjhao: transport (LDP) plus VPN (BGP).</li>
<li>VRF address family ke neeche PE-CE eBGP configure karo; as-override aur allowas-in jaano.</li>
<li>RTs se full mesh, hub-and-spoke aur extranet design karo.</li>
<li>Teen inter-AS options, CSC, 6VPE, mVPN aur EVPN overview level par batao.</li>
<li>Order mein troubleshoot karo: PE-CE, VPNv4, RTs, LSP, verify.</li>
</ul>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td>VRF</td><td>PE par har customer ki virtual routing and forwarding table</td></tr>
<tr><td>RD</td><td>8-byte value jo prefixes ko unique banati hai; VPNv4 = RD + IPv4 (12 bytes)</td></tr>
<tr><td>RT</td><td>Extended community jo import aur export control karti hai</td></tr>
<tr><td>VPNv4</td><td>VPN routes ke liye MP-BGP address family</td></tr>
<tr><td>VPN label</td><td>Egress PE ka diya inner label</td></tr>
<tr><td>Transport label</td><td>Remote PE loopback tak outer label (LDP)</td></tr>
<tr><td>PHP</td><td>Outer label ka penultimate-hop pop</td></tr>
<tr><td>as-override</td><td>PE path mein customer ASN ko apne se badalta hai</td></tr></table>

<h3>Sabse zyada tested facts</h3>
<ul>
<li>RD unique banata hai; RT distribution control karta hai.</li>
<li>VPNv4 ka next hop PE loopback hai; usko LSP chahiye.</li>
<li>P routers BGP nahi chalate: P par <code>show ip bgp</code> BGP not active kehta hai.</li>
<li>Har site same ASN: as-override ya allowas-in.</li>
<li>Hub-and-spoke alag import aur export RTs use karta hai.</li>
<li>Inter-AS: A ASBR par VRFs, B ASBRs ke beech VPNv4, C RRs ke beech.</li>
</ul>

<h3>Command sheet</h3>
<table class="cmp"><tr><th>Purpose</th><th>Command</th></tr>
<tr><td>VRF list</td><td><code>show vrf</code>, <code>show vrf detail NAME</code></td></tr>
<tr><td>VRF routes</td><td><code>show ip route vrf NAME</code></td></tr>
<tr><td>VPNv4 table</td><td><code>show bgp vpnv4 unicast all</code></td></tr>
<tr><td>VPN labels</td><td><code>show bgp vpnv4 unicast all labels</code></td></tr>
<tr><td>VPNv4 sessions</td><td><code>show bgp vpnv4 unicast all summary</code></td></tr>
<tr><td>Transport LSP</td><td><code>show mpls forwarding-table</code>, <code>traceroute</code></td></tr>
<tr><td>VRF mein test</td><td><code>ping vrf NAME x.x.x.x</code></td></tr></table>

<div class="eg"><p><b>Worked example.</b> 172.16.2.10 ka path samjhao: CE1 se PE1 (VRF), VPNv4 route 10.0.255.3 ke through label 19 ke saath, outer LDP label 17, P pop karta hai, PE2 19 padhta hai, CE2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Interface address dobara daalna bhoolna, global ping use karna, send-community extended bhoolna, aur LDP fault hone par VPN layer ko doshi maanna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal padho ki kya galat hai: missing RT, missing label ya missing neighbour activation har ek alag layer ki taraf ishara karta hai.</p></div>

<div class="scn"><h4>Final drill</h4><p>Koi bhi broken-VPN kahani lo aur zor se bolo ki kaunsi layer fail hui: customer edge, VPNv4 control plane, RT policy ya transport LSP. Phir woh command batao jo isse prove kare.</p><p><b>Lesson:</b> saaf layer model zyadatar tickets solve kar deta hai.</p></div>

<div class="iv"><p class="q">"MPLS L3VPN ek minute mein kaise kaam karta hai?"</p><p>Har customer ka PE par VRF hota hai. PEs RDs aur RTs ke saath MP-BGP VPNv4 se customer routes exchange karte hain. Traffic core ko do labels se paar karta hai, ek LDP transport label aur ek BGP VPN label, isliye P routers ko customer routes nahi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PE par VRF + RD + RT.</li>
<li>VPNv4 routes carry karta hai; do labels packets.</li>
<li>P routers BGP-free rehte hain.</li>
<li>RTs topology design karte hain.</li>
<li>Edge se core ki taraf troubleshoot karo.</li>
</ul></div>
`}};export{e as default};