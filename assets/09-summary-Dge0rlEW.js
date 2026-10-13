var e={id:`summary`,h:{en:`Summary: checklist, glossary and the most-tested facts`,hi:`Summary: checklist, glossary aur sabse zyada puche jaane wale facts`},body:{en:`
<p>This chapter is your revision sheet for the architecture module. Read it the evening before an exam or an interview, then go back to any chapter where a line does not feel automatic. Everything here was built up in chapters 1 to 8 and used in the three labs.</p>

<h3>The whole architecture on one page</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Architecture summary">
<rect x="20" y="15" width="600" height="60" rx="10" fill="#fef3c7"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Management plane: SD-WAN Manager (templates, monitoring, certificates, API)</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="11">Orchestration: Validator (first contact, authenticates, tells where the Controller and Manager are)</text>
<rect x="20" y="85" width="600" height="55" rx="10" fill="#ede9fe"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">Control plane: Controller runs OMP (routes, TLOC routes, service routes, keys, policy)</text><text x="320" y="127" text-anchor="middle" class="svg-muted" font-size="11">DTLS (or TLS) control connections, edges do not peer with each other for OMP</text>
<rect x="20" y="150" width="600" height="55" rx="10" fill="#dcfce7"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">Data plane: WAN edges, IPsec tunnels between TLOCs, BFD measures each tunnel</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">VPN 0 transport, VPN 512 management, service VPNs carry user traffic</text>
<rect x="20" y="215" width="600" height="35" rx="10" fill="#f1f5f9"/><text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="12">Troubleshoot in order: control connections, OMP, TLOC, BFD, VRF route, data path</text>
</svg><p class="cap">Four planes, four jobs. If you can redraw this from memory, you own the module.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can name the four planes and say which component belongs to each, using both new and old names.</li>
<li>I can say who connects to whom: every device reaches the Validator first, then the Controller and the Manager.</li>
<li>I can explain controller mode on a cEdge and why the authorised WAN edge list matters.</li>
<li>I can read a TLOC (system IP, colour, encapsulation) and explain private and public colours and <code>restrict</code>.</li>
<li>I can read <code>show sdwan omp routes</code>, including the status codes C, I, R, Inv and U.</li>
<li>I can explain why IPsec runs without IKE and what BFD adds.</li>
<li>I can explain VPN 0, VPN 512 and service VPNs, and build a guest segment.</li>
<li>I can walk through the five-step troubleshooting routine.</li>
</ul>

<h3>Mini glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Manager, Controller, Validator</td><td>Formerly vManage, vSmart, vBond</td></tr>
<tr><td>WAN edge</td><td>Router in the data plane: cEdge (IOS XE) or vEdge</td></tr>
<tr><td>TLOC</td><td>Transport locator: system IP + colour + encapsulation</td></tr>
<tr><td>Colour</td><td>Label of a transport; public colours are assumed to be behind NAT, private ones are not</td></tr>
<tr><td>OMP</td><td>Overlay Management Protocol, runs between each device and the Controller</td></tr>
<tr><td>BFD</td><td>Liveness and quality probe inside each tunnel</td></tr>
<tr><td>VPN / VRF</td><td>Segment; the number is carried as a label in the data plane</td></tr>
<tr><td>Site ID</td><td>Identifies a location; edges of one site share it</td></tr>
<tr><td>System IP</td><td>Permanent device identity, like a router ID</td></tr></table>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>OMP administrative distance</td><td>251</td></tr>
<tr><td>Control connection default</td><td>DTLS over UDP, base port 12346</td></tr>
<tr><td>BFD default hello and multiplier</td><td>1000 ms and 7</td></tr>
<tr><td>Default OMP path limits</td><td>send-path-limit 4, ecmp-limit 4</td></tr>
<tr><td>Management VPN</td><td>512</td></tr>
<tr><td>Transport VPN</td><td>0</td></tr>
<tr><td>Route not usable because its TLOC is unresolved</td><td>Inv,U</td></tr>
<tr><td>Normal healthy installed route</td><td>C,I,R</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"># Validator
show orchestrator connections
# Controller
show control connections
show omp peers
show omp routes vpn 10
# WAN edge
show sdwan control connections
show sdwan control connection-history
show sdwan omp summary
show sdwan omp routes vpn 10
show sdwan omp tlocs
show sdwan bfd sessions
show ip route vrf 10
traceroute vrf 10 10.3.10.1</pre>

<div class="warn"><p><b>Common mistakes.</b> Mixing up the planes (the Manager is not in the control plane); believing the Validator carries user traffic; reading a service VPN as an encrypted tunnel; forgetting that OMP routes need a resolved TLOC; testing before <code>commit</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> The Validator is the first contact and orchestrates; the Controller runs OMP; the Manager configures and monitors. OMP has three route types: routes, TLOC routes and service routes. A TLOC is not an interface address. A colour is a label with a public or private meaning. BFD runs inside IPsec tunnels, not between edge and Controller.</p></div>

<div class="scn"><h4>Redraw test</h4><p>A new colleague asks you to explain why Mumbai can reach Delhi even though the two edges never exchange any routing protocol packets. Your answer: both edges have OMP sessions to the Controller. Each advertises its prefixes with a TLOC; the Controller reflects them. The edges reach each other's TLOC address directly, build an IPsec tunnel, and BFD proves it works. The route becomes usable. Control goes through the centre; data does not.</p></div>

<div class="iv"><p class="q">"Describe the Catalyst SD-WAN architecture in one minute."</p><p>Strong answer: four planes. The Validator orchestrates the first contact and authenticates. The Manager is the management plane: templates, monitoring, certificates. The Controller is the control plane and runs OMP, distributing routes, TLOCs, keys and policy. WAN edges form the data plane with IPsec tunnels over any transport, measured by BFD. Segmentation uses VPNs, with VPN 0 for transport and VPN 512 for management.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four planes: orchestration, management, control, data.</li>
<li>TLOC = system IP + colour + encapsulation; OMP carries three route types.</li>
<li>IPsec without IKE; BFD gives liveness and quality.</li>
<li>VPN 0 transport, VPN 512 management, service VPNs for users.</li>
<li>Troubleshoot layer by layer and compare to the design.</li>
</ul></div>
`,hi:`
<p>Yeh chapter architecture module ki revision sheet hai. Exam ya interview se pehle shaam ko ise padho, phir jis chapter ki koi line automatic na lage wahan wapas jao. Yahan sab kuch chapters 1 se 8 mein bana aur teeno labs mein use hua.</p>

<h3>Poora architecture ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Architecture summary">
<rect x="20" y="15" width="600" height="60" rx="10" fill="#fef3c7"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">Management plane: SD-WAN Manager (templates, monitoring, certificates, API)</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="11">Orchestration: Validator (pehla contact, authenticate, batata hai Controller aur Manager kahan hain)</text>
<rect x="20" y="85" width="600" height="55" rx="10" fill="#ede9fe"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">Control plane: Controller OMP chalata hai (routes, TLOC routes, service routes, keys, policy)</text><text x="320" y="127" text-anchor="middle" class="svg-muted" font-size="11">DTLS (ya TLS) control connections, edges OMP ke liye aapas mein peer nahi karte</text>
<rect x="20" y="150" width="600" height="55" rx="10" fill="#dcfce7"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">Data plane: WAN edges, TLOCs ke beech IPsec tunnels, BFD har tunnel measure karta hai</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">VPN 0 transport, VPN 512 management, service VPNs user traffic</text>
<rect x="20" y="215" width="600" height="35" rx="10" fill="#f1f5f9"/><text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="12">Troubleshoot order mein: control connections, OMP, TLOC, BFD, VRF route, data path</text>
</svg><p class="cap">Chaar planes, chaar kaam. Agar aap yeh yaad se redraw kar sako, to module aapka hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main chaar planes aur har ka component naye aur purane dono naamon se bata sakta hoon.</li>
<li>Main bata sakta hoon ki kaun kisse connect hota hai: har device pehle Validator tak pahunchta hai, phir Controller aur Manager.</li>
<li>Main cEdge ka controller mode aur authorised WAN edge list ki ahmiyat samjha sakta hoon.</li>
<li>Main TLOC (system IP, colour, encapsulation) padh sakta hoon aur private, public colours aur <code>restrict</code> samjha sakta hoon.</li>
<li>Main <code>show sdwan omp routes</code> padh sakta hoon, status codes C, I, R, Inv aur U samet.</li>
<li>Main samjha sakta hoon ki IPsec bina IKE ke kyun chalta hai aur BFD kya jodta hai.</li>
<li>Main VPN 0, VPN 512 aur service VPNs samjha sakta hoon aur guest segment bana sakta hoon.</li>
<li>Main paanch step ki troubleshooting routine chala sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td>Manager, Controller, Validator</td><td>Pehle vManage, vSmart, vBond</td></tr>
<tr><td>WAN edge</td><td>Data plane ka router: cEdge (IOS XE) ya vEdge</td></tr>
<tr><td>TLOC</td><td>Transport locator: system IP + colour + encapsulation</td></tr>
<tr><td>Colour</td><td>Transport ka label; public colours NAT ke peeche maane jaate hain, private nahi</td></tr>
<tr><td>OMP</td><td>Overlay Management Protocol, har device aur Controller ke beech chalta hai</td></tr>
<tr><td>BFD</td><td>Har tunnel ke andar liveness aur quality probe</td></tr>
<tr><td>VPN / VRF</td><td>Segment; number data plane mein label ke roop mein jaata hai</td></tr>
<tr><td>Site ID</td><td>Location ki pehchaan; ek site ke edges same ID share karte hain</td></tr>
<tr><td>System IP</td><td>Device ki permanent identity, router ID jaisi</td></tr></table>

<h3>Sabse zyada puche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>OMP administrative distance</td><td>251</td></tr>
<tr><td>Control connection default</td><td>UDP par DTLS, base port 12346</td></tr>
<tr><td>BFD default hello aur multiplier</td><td>1000 ms aur 7</td></tr>
<tr><td>Default OMP path limits</td><td>send-path-limit 4, ecmp-limit 4</td></tr>
<tr><td>Management VPN</td><td>512</td></tr>
<tr><td>Transport VPN</td><td>0</td></tr>
<tr><td>Route jo TLOC unresolved hone se usable nahi</td><td>Inv,U</td></tr>
<tr><td>Normal healthy installed route</td><td>C,I,R</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"># Validator
show orchestrator connections
# Controller
show control connections
show omp peers
show omp routes vpn 10
# WAN edge
show sdwan control connections
show sdwan control connection-history
show sdwan omp summary
show sdwan omp routes vpn 10
show sdwan omp tlocs
show sdwan bfd sessions
show ip route vrf 10
traceroute vrf 10 10.3.10.1</pre>

<div class="warn"><p><b>Common mistakes.</b> Planes mix karna (Manager control plane mein nahi hai); maan lena ki Validator user traffic carry karta hai; service VPN ko encrypted tunnel samajhna; yeh bhoolna ki OMP routes ko resolved TLOC chahiye; <code>commit</code> se pehle test karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Validator pehla contact hai aur orchestrate karta hai; Controller OMP chalata hai; Manager configure aur monitor karta hai. OMP ke teen route types hain: routes, TLOC routes aur service routes. TLOC interface address nahi hai. Colour ek label hai jiska public ya private matlab hota hai. BFD IPsec tunnels ke andar chalta hai, edge aur Controller ke beech nahi.</p></div>

<div class="scn"><h4>Redraw test</h4><p>Ek naya colleague poochta hai ki Mumbai Delhi tak kaise pahunch jaata hai jabki dono edges aapas mein koi routing protocol packet exchange nahi karte. Aapka jawab: dono edges ke Controller se OMP sessions hain. Har ek apne prefixes TLOC ke saath advertise karta hai; Controller unhe reflect karta hai. Edges ek doosre ke TLOC address tak seedha pahunchte hain, IPsec tunnel banate hain, aur BFD saabit karta hai ki woh kaam kar raha hai. Route usable ho jaata hai. Control centre se jaata hai; data nahi.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN architecture ek minute mein batao."</p><p>Strong answer: chaar planes. Validator pehla contact orchestrate aur authenticate karta hai. Manager management plane hai: templates, monitoring, certificates. Controller control plane hai aur OMP chalata hai, routes, TLOCs, keys aur policy baantta hai. WAN edges data plane banate hain, kisi bhi transport par IPsec tunnels ke saath, BFD se measured. Segmentation VPNs se hoti hai, transport ke liye VPN 0 aur management ke liye VPN 512.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar planes: orchestration, management, control, data.</li>
<li>TLOC = system IP + colour + encapsulation; OMP teen route types carry karta hai.</li>
<li>IPsec bina IKE; BFD liveness aur quality deta hai.</li>
<li>VPN 0 transport, VPN 512 management, service VPNs users ke liye.</li>
<li>Layer by layer troubleshoot karo aur design se compare karo.</li>
</ul></div>
`}};export{e as default};