var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Unified MPLS domains"><rect x="20" y="40" width="170" height="90" rx="10" fill="#bae6fd"/><text x="105" y="62" text-anchor="middle" class="svg-ink" font-size="13">Access domain</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="12">IGP + LDP</text><rect x="235" y="40" width="170" height="90" rx="10" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">Core domain</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">IGP + LDP</text><rect x="450" y="40" width="170" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="62" text-anchor="middle" class="svg-ink" font-size="13">Access domain</text><text x="535" y="84" text-anchor="middle" class="svg-muted" font-size="12">IGP + LDP</text><text x="212" y="108" text-anchor="middle" class="svg-accent" font-size="11">`+t+`</text><text x="428" y="108" text-anchor="middle" class="svg-accent" font-size="11">`+t+`</text><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">`+n+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`oam-unified-mpls`,h:{en:`MPLS OAM, unified MPLS and the other label protocols`,hi:`MPLS OAM, unified MPLS aur doosre label protocols`},body:{en:`
<p>Once labels work, three questions follow. How do I test the label path itself, not only IP? How do I stretch LSPs across several IGP domains? And what other protocols distribute labels? SPCOR expects you to describe the answers. The simulator supports the label tables and a traceroute that shows labels, but not the dedicated OAM commands, so the OAM part is <b>reference configuration and concept</b>, not captured output.</p>

<h3>MPLS OAM: testing the LSP</h3>
<p>A normal <code>ping</code> follows the IP routing table. If the IP path works while the LSP is broken (for example an LFIB entry is missing), ping tells you nothing. <b>MPLS OAM</b> (RFC 8029) sends an echo request <i>inside the LSP</i> and checks that it arrives at the right egress FEC.</p>
<pre class="code"><span class="c">! Reference commands (not available in the simulator)</span>
PE1# ping mpls ipv4 10.0.255.4/32
PE1# traceroute mpls ipv4 10.0.255.4/32</pre>
<ul>
<li><b>ping mpls</b> verifies the control plane and data plane of an LSP for a given FEC.</li>
<li><b>traceroute mpls</b> reports each hop, the label it used and the return code, so you find where the LSP breaks.</li>
</ul>
<p>In the simulator, use the normal traceroute: it prints <code>[MPLS: Label N Exp 0]</code> for every labelled hop, as in the lab:</p>
<pre class="out">PE1# traceroute 10.0.255.4
  1 10.0.12.2 [MPLS: Label 17 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.255.4 2 msec 3 msec 2 msec</pre>
<p>If a hop shows no label where you expect one, the LSP is broken at that point. The <code>show mpls forwarding-table</code> output with <b>No Label</b> tells you the same thing from the control side.</p>
@@D@@

<h3>Unified MPLS (seamless MPLS)</h3>
<p>Very large providers have thousands of routers in access, aggregation and core. One IGP and one LDP domain would be huge and unstable. <b>Unified MPLS</b> keeps each domain small (its own IGP + LDP) and stitches them end to end with <b>BGP labelled unicast (BGP-LU)</b>:</p>
<ul>
<li>Each domain's border router (ABR/ASBR) acts as a BGP route reflector for labelled loopbacks.</li>
<li>BGP carries a /32 loopback together with a label (RFC 8277), so an LSP can be formed across IGP boundaries without redistributing loopbacks into the IGP.</li>
<li>Result: an LSP from an access PE to a remote access PE, with the label stack swapped at the borders, and the IGP of each domain staying small.</li>
</ul>
<pre class="code"><span class="c">! Reference configuration on a border router (IOS XE style)</span>
router bgp 65000
 address-family ipv4
  neighbor 10.0.255.9 send-label
  network 10.0.255.4 mask 255.255.255.255</pre>

<h3>Other label distribution protocols</h3>
<table class="cmp"><tr><th>Protocol</th><th>What it labels</th><th>Typical use</th></tr>
<tr><td>LDP</td><td>IGP prefixes (/32s)</td><td>basic transport LSPs, follows IGP shortest path</td></tr>
<tr><td>RSVP-TE</td><td>explicit or constrained paths (tunnels)</td><td>traffic engineering, fast reroute with bandwidth reservation</td></tr>
<tr><td>BGP-LU</td><td>BGP prefixes with labels</td><td>unified MPLS, inter-AS option C</td></tr>
<tr><td>BGP VPN (VPNv4/v6)</td><td>VPN routes, VPN label</td><td>L3VPN service labels (next module)</td></tr>
<tr><td>Segment Routing (SR-MPLS)</td><td>segment IDs carried by IS-IS/OSPF/BGP</td><td>replaces LDP and RSVP-TE with a source-routed label stack, no per-LSP state</td></tr></table>
<p>The point for the exam: LDP is simple and follows the IGP, but it cannot steer traffic away from the shortest path and cannot reserve bandwidth. RSVP-TE and SR add those. Many networks run LDP today and migrate to SR gradually; <b>SR and LDP can coexist</b>.</p>

<div class="eg"><p><b>Worked example: where does the packet go wrong?</b> A PE traceroute to a remote loopback returns: hop 1 labelled, hop 2 labelled, hop 3 no label and then timeouts. Hop 2 swapped correctly but hop 3 received an unlabelled or wrong packet. Check <code>show mpls forwarding-table</code> on hop 2: an entry with No Label toward hop 3 means hop 3 never gave it a label (no LDP session). Fix the session, not the route.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using plain ping to "prove" an MPLS service works. Redistributing loopbacks between IGP domains when BGP-LU should be used. Assuming SR needs LDP: it does not.</p></div>
<div class="exam"><p><b>Exam trap.</b> LDP follows the IGP shortest path and has no traffic engineering. RSVP-TE builds explicit tunnels with bandwidth. BGP-LU carries labels with IPv4 routes in BGP. MPLS OAM tests the LSP, not IP.</p></div>

<div class="scn"><h4>IP fine, VPN dead, ping happy</h4><p>A VPN was down while ping between PE loopbacks worked. Plain ping used IP. The MPLS traceroute showed the label disappear on hop 3 because the P router had no LDP session on the downstream link. The engineer enabled LDP there and the VPN recovered.</p><p><b>Lesson:</b> test the label path, not just IP reachability.</p></div>

<div class="iv"><p class="q">"What is unified MPLS and why is it used?"</p><p>It stitches LSPs across multiple IGP/LDP domains using BGP labelled unicast, so each domain stays small while loopbacks of PEs are reachable end to end by label. It avoids redistributing loopbacks between IGPs and scales to networks with tens of thousands of nodes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS OAM (ping and traceroute mpls) tests the LSP, not just IP.</li>
<li>Traceroute with labels in the simulator shows where a hop loses its label.</li>
<li>Unified MPLS uses BGP-LU to join IGP domains.</li>
<li>RSVP-TE and Segment Routing add traffic engineering that LDP lacks.</li>
<li>SR can coexist with LDP during migration.</li>
</ul></div>
`.replace(`@@D@@`,e(`Unified MPLS: small IGP+LDP domains stitched by BGP labelled unicast.`,`BGP-LU`,`End-to-end LSP across three domains without merging the IGPs`)),hi:`
<p>Labels kaam karne lagein to teen sawal aate hain. Label path ko khud kaise test karoon, sirf IP nahi? LSPs ko kai IGP domains ke paar kaise failaoon? Aur aur kaunse protocols labels distribute karte hain? SPCOR aapse jawab describe karne ki ummeed rakhta hai. Simulator label tables aur labels dikhane wala traceroute support karta hai, par dedicated OAM commands nahi, isliye OAM wala hissa <b>reference configuration aur concept</b> hai, captured output nahi.</p>

<h3>MPLS OAM: LSP ko test karna</h3>
<p>Normal <code>ping</code> IP routing table follow karta hai. IP path chal raha ho aur LSP toota ho (jaise LFIB entry missing) to ping kuch nahi batata. <b>MPLS OAM</b> (RFC 8029) echo request <i>LSP ke andar</i> bhejta hai aur check karta hai ki woh sahi egress FEC par pahunchta hai.</p>
<pre class="code"><span class="c">! Reference commands (simulator mein available nahi)</span>
PE1# ping mpls ipv4 10.0.255.4/32
PE1# traceroute mpls ipv4 10.0.255.4/32</pre>
<ul>
<li><b>ping mpls</b> diye gaye FEC ke LSP ka control plane aur data plane verify karta hai.</li>
<li><b>traceroute mpls</b> har hop, usne kaunsa label use kiya aur return code report karta hai, taaki pata chale LSP kahan toot-ta hai.</li>
</ul>
<p>Simulator mein normal traceroute use karo: woh har labelled hop ke liye <code>[MPLS: Label N Exp 0]</code> print karta hai, jaise lab mein:</p>
<pre class="out">PE1# traceroute 10.0.255.4
  1 10.0.12.2 [MPLS: Label 17 Exp 0] 1 msec 2 msec 1 msec
  2 10.0.255.4 2 msec 3 msec 2 msec</pre>
<p>Agar kisi hop par jahan label ki ummeed ho wahan nahi dikhe, to LSP us point par toota hai. <b>No Label</b> wala <code>show mpls forwarding-table</code> output control side se wahi batata hai.</p>
@@D@@

<h3>Unified MPLS (seamless MPLS)</h3>
<p>Bahut bade providers ke access, aggregation aur core mein hazaron routers hote hain. Ek IGP aur ek LDP domain bahut bada aur unstable hoga. <b>Unified MPLS</b> har domain ko chhota rakhta hai (apna IGP + LDP) aur unhe end to end <b>BGP labelled unicast (BGP-LU)</b> se jodta hai:</p>
<ul>
<li>Har domain ka border router (ABR/ASBR) labelled loopbacks ke liye BGP route reflector ki tarah kaam karta hai.</li>
<li>BGP /32 loopback ko label ke saath carry karta hai (RFC 8277), isliye IGP boundaries ke paar LSP ban sakta hai bina loopbacks ko IGP mein redistribute kiye.</li>
<li>Natija: access PE se remote access PE tak LSP, borders par label stack swap hota hai, aur har domain ka IGP chhota rehta hai.</li>
</ul>
<pre class="code"><span class="c">! Border router par reference configuration (IOS XE style)</span>
router bgp 65000
 address-family ipv4
  neighbor 10.0.255.9 send-label
  network 10.0.255.4 mask 255.255.255.255</pre>

<h3>Doosre label distribution protocols</h3>
<table class="cmp"><tr><th>Protocol</th><th>Kya label karta hai</th><th>Typical use</th></tr>
<tr><td>LDP</td><td>IGP prefixes (/32s)</td><td>basic transport LSPs, IGP shortest path follow karta hai</td></tr>
<tr><td>RSVP-TE</td><td>explicit ya constrained paths (tunnels)</td><td>traffic engineering, bandwidth reservation ke saath fast reroute</td></tr>
<tr><td>BGP-LU</td><td>labels ke saath BGP prefixes</td><td>unified MPLS, inter-AS option C</td></tr>
<tr><td>BGP VPN (VPNv4/v6)</td><td>VPN routes, VPN label</td><td>L3VPN service labels (agla module)</td></tr>
<tr><td>Segment Routing (SR-MPLS)</td><td>IS-IS/OSPF/BGP se carry hone wale segment IDs</td><td>LDP aur RSVP-TE ki jagah source-routed label stack, per-LSP state nahi</td></tr></table>
<p>Exam ke liye point: LDP simple hai aur IGP follow karta hai, lekin traffic ko shortest path se hata nahi sakta aur bandwidth reserve nahi kar sakta. RSVP-TE aur SR yeh jodte hain. Bahut networks aaj LDP chalate hain aur dheere-dheere SR par jaate hain; <b>SR aur LDP saath reh sakte hain</b>.</p>

<div class="eg"><p><b>Worked example: packet kahan galat hua?</b> PE se remote loopback tak traceroute: hop 1 labelled, hop 2 labelled, hop 3 no label aur phir timeouts. Hop 2 ne sahi swap kiya par hop 3 ko unlabelled ya galat packet mila. Hop 2 par <code>show mpls forwarding-table</code> check karo: hop 3 ki taraf No Label wali entry matlab hop 3 ne use kabhi label nahi diya (LDP session nahi). Session fix karo, route nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> MPLS service chalta hai yeh "prove" karne ke liye plain ping use karna. Jahan BGP-LU use hona chahiye wahan IGP domains ke beech loopbacks redistribute karna. Maanna ki SR ko LDP chahiye: nahi chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> LDP IGP shortest path follow karta hai aur traffic engineering nahi hai. RSVP-TE bandwidth ke saath explicit tunnels banata hai. BGP-LU BGP mein IPv4 routes ke saath labels carry karta hai. MPLS OAM LSP test karta hai, IP nahi.</p></div>

<div class="scn"><h4>IP theek, VPN band, ping khush</h4><p>VPN down tha jabki PE loopbacks ke beech ping chalta tha. Plain ping IP use karta hai. MPLS traceroute ne hop 3 par label gayab dikhaya kyunki P router ke downstream link par LDP session nahi tha. Engineer ne wahan LDP enable kiya aur VPN recover ho gaya.</p><p><b>Lesson:</b> label path test karo, sirf IP reachability nahi.</p></div>

<div class="iv"><p class="q">"Unified MPLS kya hai aur kyun use hota hai?"</p><p>Yeh kai IGP/LDP domains ke aar-paar LSPs ko BGP labelled unicast se jodta hai, isliye har domain chhota rehta hai jabki PEs ke loopbacks label se end to end reachable hote hain. Yeh IGPs ke beech loopbacks redistribute karne se bachata hai aur hazaron nodes wale networks tak scale karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MPLS OAM (ping aur traceroute mpls) LSP test karta hai, sirf IP nahi.</li>
<li>Simulator mein labels wala traceroute dikhata hai kis hop par label kho jaata hai.</li>
<li>Unified MPLS IGP domains jodne ke liye BGP-LU use karta hai.</li>
<li>RSVP-TE aur Segment Routing woh traffic engineering dete hain jo LDP mein nahi.</li>
<li>Migration mein SR LDP ke saath reh sakta hai.</li>
</ul></div>
`.replace(`@@D@@`,e(`Unified MPLS: chhote IGP+LDP domains BGP labelled unicast se jude.`,`BGP-LU`,`Teen domains ke paar end-to-end LSP, IGPs merge kiye bina`))}};export{t as default};