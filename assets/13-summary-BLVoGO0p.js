var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you do a quick walk around the car: tyres, lights, fuel, mirrors. This chapter is that walk around for MPLS. Use it the night before the exam, before an interview, and before you touch a production core. If any line below makes you hesitate, go back to the chapter named next to it.</p>

<h3>The whole module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MPLS summary map">
<rect x="20" y="20" width="180" height="56" rx="8" fill="#bbf7d0"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">IGP (OSPF)</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="12">/32 PE loopbacks</text>
<rect x="230" y="20" width="180" height="56" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">LDP</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">UDP/TCP 646, LIB</text>
<rect x="440" y="20" width="180" height="56" rx="8" fill="#ddd6fe"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">LFIB</text><text x="530" y="62" text-anchor="middle" class="svg-muted" font-size="12">push, swap, pop</text>
<rect x="20" y="130" width="180" height="56" rx="8" fill="#fde68a"/><text x="110" y="154" text-anchor="middle" class="svg-ink" font-size="13">VRF on PE</text><text x="110" y="172" text-anchor="middle" class="svg-muted" font-size="12">RD + RT</text>
<rect x="230" y="130" width="180" height="56" rx="8" fill="#fed7aa"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">MP-BGP VPNv4</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">VPN label</text>
<rect x="440" y="130" width="180" height="56" rx="8" fill="#e2e8f0"/><text x="530" y="154" text-anchor="middle" class="svg-ink" font-size="13">Two-label stack</text><text x="530" y="172" text-anchor="middle" class="svg-muted" font-size="12">transport / VPN</text>
<line x1="200" y1="48" x2="230" y2="48" stroke="#64748b" stroke-width="2"/><line x1="410" y1="48" x2="440" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="158" x2="230" y2="158" stroke="#64748b" stroke-width="2"/><line x1="410" y1="158" x2="440" y2="158" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="76" x2="530" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-accent" font-size="12">2.1 MPLS operations (top row) + 2.2 MPLS L3VPN (bottom row)</text>
</svg><p class="cap">The core builds labelled paths between PE loopbacks; the VPN layer rides on top of them.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why MPLS exists today (VPN, BGP-free core, TE) and why "faster lookups" is a myth. (Ch 1)</li>
<li>Draw the 32-bit label entry: 20-bit label, 3-bit TC/EXP, S bit, 8-bit TTL; EtherType 0x8847. (Ch 2)</li>
<li>Name ingress LER, transit LSR, egress LER; PE, P, CE; define FEC and LSP. (Ch 3)</li>
<li>Explain how RIB + LIB build the FIB and LFIB, and why liberal retention helps. (Ch 4)</li>
<li>Walk a packet through push, swap and pop using real LFIB output and a labelled traceroute. (Ch 5)</li>
<li>Explain PHP, implicit-null (3) and explicit-null (0) and read imp-null / Pop Label. (Ch 6)</li>
<li>Describe LDP discovery, session setup, LDP ID and transport address, LDP-IGP sync. (Ch 7)</li>
<li>Configure LDP with <code>mpls ldp router-id Loopback0 force</code> and <code>mpls ip</code>, and verify it. (Ch 8)</li>
<li>Explain VRF, RD and RT and why RD is not RT. (Ch 9)</li>
<li>Describe MP-BGP VPNv4, the VPN label and the CE-PE options. (Ch 10)</li>
<li>Walk an L3VPN packet end to end with a two-label stack. (Ch 11)</li>
<li>Troubleshoot "no route", "xmit only", "No Label", MTU and RT import problems. (Ch 12)</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FEC</dt><dd>Group of packets forwarded the same way; with LDP, one IGP prefix.</dd>
<dt>LSR / LER</dt><dd>Label switching router / label edge router (edge LSR).</dd>
<dt>LSP</dt><dd>Unidirectional label switched path for one FEC.</dd>
<dt>LIB / LFIB</dt><dd>All label bindings (control plane) / labels used for forwarding (data plane).</dd>
<dt>PHP</dt><dd>Penultimate hop popping, triggered by implicit-null.</dd>
<dt>LDP ID</dt><dd>router-id:label-space, for example 1.1.1.1:0.</dd>
<dt>Transport address</dt><dd>IP used for the LDP TCP session; default is the LDP router ID.</dd>
<dt>VRF</dt><dd>Per-customer routing and forwarding table on a PE.</dd>
<dt>RD</dt><dd>8-byte value that makes a customer prefix a unique VPNv4 route.</dd>
<dt>RT</dt><dd>Extended community that controls import and export between VRFs.</dd>
<dt>VPNv4</dt><dd>MP-BGP address family carrying RD + IPv4 prefix, RTs and VPN labels.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Label size</td><td>Entry 32 bits; label 20, TC 3, S 1, TTL 8</td></tr>
<tr><td>Reserved labels</td><td>0 explicit-null IPv4, 2 explicit-null IPv6, 3 implicit-null; 0 to 15 reserved</td></tr>
<tr><td>LDP discovery</td><td>UDP 646 to 224.0.0.2, Hello 5 s, hold 15 s</td></tr>
<tr><td>LDP session</td><td>TCP 646, higher transport address is active; keepalive 60 s, hold 180 s</td></tr>
<tr><td>LDP router ID</td><td>Configured interface, else highest loopback, else highest interface IP; force applies now</td></tr>
<tr><td>IOS defaults</td><td>Downstream unsolicited, liberal retention, independent control</td></tr>
<tr><td>Pop Label vs No Label</td><td>Pop = PHP (normal); No Label = no binding from next hop (fault, except toward a CE)</td></tr>
<tr><td>L3VPN labels</td><td>Outer transport (LDP), inner VPN (MP-BGP, from egress PE)</td></tr>
<tr><td>RD vs RT</td><td>RD = uniqueness; RT = import/export policy</td></tr>
<tr><td>P routers</td><td>IGP + LDP only; no BGP, no VRFs</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! LDP core</span>
mpls label protocol ldp
mpls ldp router-id Loopback0 force
interface GigabitEthernet0/1
 mpls ip
router ospf 1
 mpls ldp autoconfig          <span class="c">! optional alternative</span>
 mpls ldp sync                <span class="c">! LDP-IGP synchronization</span>
mpls ldp explicit-null        <span class="c">! on the egress, keep TC to the last hop</span>
<span class="c">! L3VPN on a PE</span>
vrf definition CUST-A
 rd 65000:1
 address-family ipv4
  route-target both 65000:100
interface GigabitEthernet0/2
 vrf forwarding CUST-A
router bgp 65000
 neighbor 4.4.4.4 remote-as 65000
 neighbor 4.4.4.4 update-source Loopback0
 address-family vpnv4
  neighbor 4.4.4.4 activate
  neighbor 4.4.4.4 send-community extended</pre>
<pre class="out">show mpls interfaces
show mpls ldp discovery
<span class="hl">show mpls ldp neighbor</span>
show mpls ldp bindings [prefix mask]
<span class="hl">show mpls forwarding-table [prefix | vrf NAME]</span>
show ip cef [prefix]
traceroute 4.4.4.4
show bgp vpnv4 unicast all [summary | labels]
show ip route vrf CUST-A
ping vrf CUST-A 10.10.2.10</pre>

<div class="eg"><p><b>Worked example: a five-line exam answer.</b> "A P router shows 'LDP Id: 7.7.7.7:0; no route' toward its neighbour. What is wrong and what do you do?" Answer: discovery works, but the TCP session to the neighbour's transport address 7.7.7.7 cannot form because there is no route to it. Either advertise 7.7.7.7 in the IGP or set the neighbour's LDP router ID to an advertised loopback with <code>mpls ldp router-id Loopback0 force</code>. Verify with <code>show mpls ldp neighbor</code> showing State: Oper.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Confusing UDP (discovery) with TCP (session); saying the egress pops with PHP; mixing up RD and RT; forgetting that LSPs are one-way; testing a VPN without the <code>vrf</code> keyword.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> ENARSI asks you to <b>describe</b> MPLS and L3VPN, so expect concept and output-reading questions: which router pops, what imp-null means, which port LDP uses, what RD and RT do, which label is on top. Read every output line; the answer is usually highlighted by one word such as "no route", "xmit", "Pop Label" or "No Label".</p></div>

<div class="scn"><h4>The interview that turned on one output</h4><p>A candidate for a provider NOC role was shown a <code>show mpls forwarding-table</code> with one "No Label" entry toward a P router and one "Pop Label" entry toward a PE, and asked which was the problem. He explained that Pop Label is normal PHP because the PE advertised implicit-null, while No Label toward a core neighbour means no LDP binding from it, and listed the next three commands he would run. He got the job over candidates with more years of experience.</p><p><b>Lesson:</b> reading outputs precisely beats memorising definitions.</p></div>

<div class="iv"><p class="q">"Explain MPLS L3VPN end to end in two minutes."</p><p>Start with the problem (overlapping customers on one core), then the three pieces: VRFs on PEs with RD for uniqueness and RT for import/export; MP-BGP VPNv4 between PE loopbacks carrying routes, RTs and a VPN label; and an LDP-signalled LSP between PE loopbacks. Walk one packet: push VPN and transport labels at the ingress, swap in the core, PHP at the penultimate P, VPN label lookup at the egress PE, plain IP to the CE. Close with the P routers having no customer state.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The IGP builds paths, LDP labels them, the LFIB forwards on them.</li>
<li>Push at the ingress, swap in the core, pop at the penultimate hop (implicit-null 3).</li>
<li>LDP: UDP 646 discovery, TCP 646 session to a reachable transport address.</li>
<li>L3VPN: VRF + RD + RT on PEs, MP-BGP VPNv4 between PEs, two-label stack across P routers.</li>
<li>Troubleshoot in order: IGP, interfaces, discovery, session, labels, LSP, VPN.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap gaadi ke chaaron taraf ek chakkar lagate ho: tyres, lights, fuel, mirrors. Yeh chapter MPLS ke liye wahi chakkar hai. Ise exam se pehle wali raat, interview se pehle, aur production core chhoone se pehle use karo. Agar neeche ki koi line aapko hichkichati hai, to uske saath likhe chapter par wapas jao.</p>

<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MPLS summary map">
<rect x="20" y="20" width="180" height="56" rx="8" fill="#bbf7d0"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">IGP (OSPF)</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="12">/32 PE loopbacks</text>
<rect x="230" y="20" width="180" height="56" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">LDP</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">UDP/TCP 646, LIB</text>
<rect x="440" y="20" width="180" height="56" rx="8" fill="#ddd6fe"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">LFIB</text><text x="530" y="62" text-anchor="middle" class="svg-muted" font-size="12">push, swap, pop</text>
<rect x="20" y="130" width="180" height="56" rx="8" fill="#fde68a"/><text x="110" y="154" text-anchor="middle" class="svg-ink" font-size="13">PE par VRF</text><text x="110" y="172" text-anchor="middle" class="svg-muted" font-size="12">RD + RT</text>
<rect x="230" y="130" width="180" height="56" rx="8" fill="#fed7aa"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">MP-BGP VPNv4</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">VPN label</text>
<rect x="440" y="130" width="180" height="56" rx="8" fill="#e2e8f0"/><text x="530" y="154" text-anchor="middle" class="svg-ink" font-size="13">Do-label stack</text><text x="530" y="172" text-anchor="middle" class="svg-muted" font-size="12">transport / VPN</text>
<line x1="200" y1="48" x2="230" y2="48" stroke="#64748b" stroke-width="2"/><line x1="410" y1="48" x2="440" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="158" x2="230" y2="158" stroke="#64748b" stroke-width="2"/><line x1="410" y1="158" x2="440" y2="158" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="76" x2="530" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-accent" font-size="12">2.1 MPLS operations (upar ki row) + 2.2 MPLS L3VPN (neeche ki row)</text>
</svg><p class="cap">Core PE loopbacks ke beech labelled paths banata hai; VPN layer unke upar chalti hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki MPLS aaj kyun hai (VPN, BGP-free core, TE) aur "tez lookups" ek myth kyun hai. (Ch 1)</li>
<li>32-bit label entry draw karo: 20-bit label, 3-bit TC/EXP, S bit, 8-bit TTL; EtherType 0x8847. (Ch 2)</li>
<li>Ingress LER, transit LSR, egress LER; PE, P, CE ke naam lo; FEC aur LSP define karo. (Ch 3)</li>
<li>Samjhao ki RIB + LIB kaise FIB aur LFIB banate hain, aur liberal retention kyun madad karta hai. (Ch 4)</li>
<li>Real LFIB output aur labelled traceroute se packet ko push, swap aur pop ke through le jao. (Ch 5)</li>
<li>PHP, implicit-null (3) aur explicit-null (0) samjhao aur imp-null / Pop Label padho. (Ch 6)</li>
<li>LDP discovery, session setup, LDP ID aur transport address, LDP-IGP sync describe karo. (Ch 7)</li>
<li><code>mpls ldp router-id Loopback0 force</code> aur <code>mpls ip</code> se LDP configure karo, aur verify karo. (Ch 8)</li>
<li>VRF, RD aur RT samjhao aur RD, RT kyun nahi hai. (Ch 9)</li>
<li>MP-BGP VPNv4, VPN label aur CE-PE options describe karo. (Ch 10)</li>
<li>Do-label stack ke saath L3VPN packet ko end to end le jao. (Ch 11)</li>
<li>"no route", "sirf xmit", "No Label", MTU aur RT import problems troubleshoot karo. (Ch 12)</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FEC</dt><dd>Ek jaise forward hone wale packets ka group; LDP ke saath ek IGP prefix.</dd>
<dt>LSR / LER</dt><dd>Label switching router / label edge router (edge LSR).</dd>
<dt>LSP</dt><dd>Ek FEC ka unidirectional label switched path.</dd>
<dt>LIB / LFIB</dt><dd>Saari label bindings (control plane) / forwarding mein use hone wale labels (data plane).</dd>
<dt>PHP</dt><dd>Penultimate hop popping, implicit-null se trigger hota hai.</dd>
<dt>LDP ID</dt><dd>router-id:label-space, jaise 1.1.1.1:0.</dd>
<dt>Transport address</dt><dd>LDP TCP session ke liye IP; default LDP router ID hai.</dd>
<dt>VRF</dt><dd>PE par har customer ki routing aur forwarding table.</dd>
<dt>RD</dt><dd>8-byte value jo customer prefix ko unique VPNv4 route banati hai.</dd>
<dt>RT</dt><dd>Extended community jo VRFs ke beech import aur export control karti hai.</dd>
<dt>VPNv4</dt><dd>MP-BGP address family jo RD + IPv4 prefix, RTs aur VPN labels le jaati hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Label size</td><td>Entry 32 bits; label 20, TC 3, S 1, TTL 8</td></tr>
<tr><td>Reserved labels</td><td>0 explicit-null IPv4, 2 explicit-null IPv6, 3 implicit-null; 0 se 15 reserved</td></tr>
<tr><td>LDP discovery</td><td>UDP 646 se 224.0.0.2, Hello 5 s, hold 15 s</td></tr>
<tr><td>LDP session</td><td>TCP 646, bada transport address active; keepalive 60 s, hold 180 s</td></tr>
<tr><td>LDP router ID</td><td>Configured interface, warna sabse bada loopback, warna sabse bada interface IP; force abhi lagata hai</td></tr>
<tr><td>IOS defaults</td><td>Downstream unsolicited, liberal retention, independent control</td></tr>
<tr><td>Pop Label vs No Label</td><td>Pop = PHP (normal); No Label = next hop se binding nahi (fault, CE ki taraf chhodkar)</td></tr>
<tr><td>L3VPN labels</td><td>Outer transport (LDP), inner VPN (MP-BGP, egress PE se)</td></tr>
<tr><td>RD vs RT</td><td>RD = uniqueness; RT = import/export policy</td></tr>
<tr><td>P routers</td><td>Sirf IGP + LDP; na BGP, na VRFs</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! LDP core</span>
mpls label protocol ldp
mpls ldp router-id Loopback0 force
interface GigabitEthernet0/1
 mpls ip
router ospf 1
 mpls ldp autoconfig          <span class="c">! optional alternative</span>
 mpls ldp sync                <span class="c">! LDP-IGP synchronization</span>
mpls ldp explicit-null        <span class="c">! egress par, TC aakhri hop tak rakho</span>
<span class="c">! PE par L3VPN</span>
vrf definition CUST-A
 rd 65000:1
 address-family ipv4
  route-target both 65000:100
interface GigabitEthernet0/2
 vrf forwarding CUST-A
router bgp 65000
 neighbor 4.4.4.4 remote-as 65000
 neighbor 4.4.4.4 update-source Loopback0
 address-family vpnv4
  neighbor 4.4.4.4 activate
  neighbor 4.4.4.4 send-community extended</pre>
<pre class="out">show mpls interfaces
show mpls ldp discovery
<span class="hl">show mpls ldp neighbor</span>
show mpls ldp bindings [prefix mask]
<span class="hl">show mpls forwarding-table [prefix | vrf NAME]</span>
show ip cef [prefix]
traceroute 4.4.4.4
show bgp vpnv4 unicast all [summary | labels]
show ip route vrf CUST-A
ping vrf CUST-A 10.10.2.10</pre>

<div class="eg"><p><b>Worked example: paanch line ka exam answer.</b> "Ek P router apne neighbour ki taraf 'LDP Id: 7.7.7.7:0; no route' dikhata hai. Kya galat hai aur kya karoge?" Jawab: discovery kaam karta hai, par neighbour ke transport address 7.7.7.7 tak TCP session nahi ban sakta kyunki uska route nahi hai. Ya to 7.7.7.7 ko IGP mein advertise karo ya <code>mpls ldp router-id Loopback0 force</code> se neighbour ka LDP router ID ek advertised loopback par set karo. <code>show mpls ldp neighbor</code> mein State: Oper se verify karo.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> UDP (discovery) aur TCP (session) mein confusion; kehna ki PHP mein egress pop karta hai; RD aur RT mix karna; bhoolna ki LSPs one-way hain; <code>vrf</code> keyword ke bina VPN test karna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> ENARSI aapse MPLS aur L3VPN <b>describe</b> karne ko kehta hai, isliye concept aur output-reading questions ki ummeed rakho: kaunsa router pop karta hai, imp-null ka matlab kya hai, LDP kaunsa port use karta hai, RD aur RT kya karte hain, top par kaunsa label hai. Har output line padho; jawab aksar ek shabd se highlight hota hai jaise "no route", "xmit", "Pop Label" ya "No Label".</p></div>

<div class="scn"><h4>Woh interview jo ek output par palat gaya</h4><p>Provider NOC role ke ek candidate ko ek <code>show mpls forwarding-table</code> dikhaya gaya jismein ek "No Label" entry P router ki taraf aur ek "Pop Label" entry PE ki taraf thi, aur poocha gaya ki problem kaunsi hai. Usne samjhaya ki Pop Label normal PHP hai kyunki PE ne implicit-null advertise kiya, jabki core neighbour ki taraf No Label ka matlab us neighbour se koi LDP binding nahi, aur agle teen commands bataye jo woh chalata. Zyada saalon ke experience wale candidates ke muqable use job mili.</p><p><b>Seekh:</b> outputs ko sateek padhna definitions ratne se behtar hai.</p></div>

<div class="iv"><p class="q">"MPLS L3VPN ko end to end do minute mein samjhao."</p><p>Problem se shuru karo (ek core par overlapping customers), phir teen pieces: PEs par VRFs, uniqueness ke liye RD aur import/export ke liye RT; PE loopbacks ke beech MP-BGP VPNv4 jo routes, RTs aur VPN label le jaata hai; aur PE loopbacks ke beech LDP-signalled LSP. Ek packet chalao: ingress par VPN aur transport labels push, core mein swap, penultimate P par PHP, egress PE par VPN label lookup, CE ko plain IP. Is baat se khatam karo ki P routers ke paas koi customer state nahi hoti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP paths banata hai, LDP un par labels lagata hai, LFIB un par forward karti hai.</li>
<li>Ingress par push, core mein swap, penultimate hop par pop (implicit-null 3).</li>
<li>LDP: UDP 646 discovery, reachable transport address tak TCP 646 session.</li>
<li>L3VPN: PEs par VRF + RD + RT, PEs ke beech MP-BGP VPNv4, P routers ke paar do-label stack.</li>
<li>Is order mein troubleshoot karo: IGP, interfaces, discovery, session, labels, LSP, VPN.</li>
</ul></div>
`}};export{e as default};