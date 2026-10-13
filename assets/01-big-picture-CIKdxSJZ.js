var e={id:`big-picture`,h:{en:`Why DMVPN: the big picture`,hi:`DMVPN kyun: big picture`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>Why point-to-point tunnels stop scaling and how <b>Dynamic Multipoint VPN (DMVPN)</b> fixes it with one tunnel interface per router.</li>
<li>The building blocks: <b>mGRE</b>, <b>NHRP</b> (registration and resolution) and <b>IPsec</b> tunnel protection.</li>
<li>DMVPN <b>phase 1, 2 and 3</b>, and exactly what the routing protocol (EIGRP, OSPF or BGP) must do in each phase.</li>
<li>MTU and MSS tuning, the front-door VRF idea, and the verification commands <code>show dmvpn</code>, <code>show ip nhrp</code> and <code>show crypto session</code>.</li>
<li>A troubleshooting workflow that walks all four labs of this module.</li>
</ul>
<p><b>Prerequisites.</b> You should already know point-to-point GRE, the IPsec basics (IKE, ESP, transport versus tunnel mode) and why tunnels need <code>ip mtu 1400</code>; the CCNP ENCOR module on VRFs and tunnels covers all of that. You should also be comfortable with OSPF DR elections and network types (ENARSI OSPF), EIGRP split horizon (ENARSI EIGRP) and basic iBGP (ENARSI BGP). This chapter refers back to them instead of re-teaching them.</p>

<h3>An analogy: the courier company</h3>
<p>Imagine a courier company with a head office in Delhi and branches in Pune and Kochi. Branches move often, so their street addresses change. Every morning each branch phones head office and says "Pune branch is now at this address". Head office keeps that <b>address book</b>. When Pune wants to send a parcel to Kochi, it first asks head office "where is Kochi today?", gets the answer once, and from then on sends its vans <b>directly</b> to Kochi. Head office never has to redraw a map when a branch opens; the branch simply calls in.</p>
<p>DMVPN works the same way. The hub router is head office. Each spoke <b>registers</b> its public address with the hub. When one spoke needs to reach another, it <b>resolves</b> the other spoke's public address through the hub and then builds a direct tunnel, only for as long as traffic needs it.</p>

<h3>The problem DMVPN solves</h3>
<p>With classic point-to-point GRE (with or without IPsec) every tunnel is its own interface with a fixed <code>tunnel destination</code>. That creates three scaling problems:</p>
<ul>
<li><b>Hub configuration grows with every branch.</b> 200 branches means 200 tunnel interfaces, 200 subnets and 200 crypto peers on the hub. Adding branch 201 means touching the hub.</li>
<li><b>A full mesh explodes.</b> Direct branch-to-branch tunnels need n(n-1)/2 tunnels: 10 sites need 45, 100 sites need 4,950. Nobody configures that by hand.</li>
<li><b>Hub-and-spoke only is slow.</b> If branches talk only through the hub, a voice call from Pune to Kochi crosses the internet twice, doubles the delay and burns hub bandwidth and CPU for encryption.</li>
</ul>
<p>DMVPN keeps a <b>hub-and-spoke</b> configuration (each spoke only knows the hub) but can create a <b>dynamic partial mesh</b> at runtime: spoke-to-spoke tunnels appear when traffic needs them and time out when it stops. Spokes can even have dynamic public addresses (DHCP from the ISP), because they register themselves.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology for the DMVPN module">
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">HUB (Delhi DC)</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">Tu0 172.16.100.1</text>
<text x="420" y="38" class="svg-muted" font-size="12">NBMA 100.64.10.2</text><text x="420" y="56" class="svg-muted" font-size="12">LAN 10.1.1.0/24</text>
<ellipse cx="320" cy="150" rx="90" ry="32" fill="#e2e8f0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">ISP (internet)</text>
<line x1="320" y1="70" x2="320" y2="118" stroke="#64748b" stroke-width="2"/>
<line x1="160" y1="220" x2="260" y2="172" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="220" x2="380" y2="172" stroke="#64748b" stroke-width="2"/>
<path d="M230 50 Q90 60 90 220" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<path d="M410 50 Q550 60 550 220" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="60" y="120" class="svg-accent" font-size="12">mGRE + NHRP</text>
<text x="520" y="120" class="svg-accent" font-size="12">mGRE + NHRP</text>
<rect x="40" y="220" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="120" y="242" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1 (Pune)</text><text x="120" y="260" text-anchor="middle" class="svg-muted" font-size="12">Tu0 .2 / 100.64.20.2</text>
<rect x="440" y="220" width="160" height="50" rx="8" fill="#fde68a"/><text x="520" y="242" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2 (Kochi)</text><text x="520" y="260" text-anchor="middle" class="svg-muted" font-size="12">Tu0 .3 / 100.64.30.2</text>
<line x1="200" y1="262" x2="440" y2="262" stroke="#64748b" stroke-width="2" stroke-dasharray="2 4"/>
<text x="320" y="252" text-anchor="middle" class="svg-accent" font-size="12">dynamic tunnel (on demand)</text>
<text x="120" y="290" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.2.2.0/24</text><text x="520" y="290" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.3.3.0/24</text>
</svg><p class="cap">The lab topology used in every chapter: one hub, two spokes, one shared provider. Dashed = permanent hub tunnels, dotted = on-demand spoke-to-spoke tunnel.</p></div>

<h3>The lab network you will build</h3>
<table class="cmp"><tr><th>Router</th><th>Role</th><th>Gi0/0 (NBMA / public)</th><th>Tunnel0</th><th>LAN Gi0/1</th><th>Loopback0 / RID</th></tr>
<tr><td>HUB</td><td>Delhi DC, NHS</td><td>100.64.10.2/30</td><td>172.16.100.1/24</td><td>10.1.1.0/24 (SRV .100)</td><td>1.1.1.1</td></tr>
<tr><td>SPOKE1</td><td>Pune branch, NHC</td><td>100.64.20.2/30</td><td>172.16.100.2/24</td><td>10.2.2.0/24 (PC1 .10)</td><td>2.2.2.2</td></tr>
<tr><td>SPOKE2</td><td>Kochi branch, NHC</td><td>100.64.30.2/30</td><td>172.16.100.3/24</td><td>10.3.3.0/24 (PC2 .10)</td><td>3.3.3.3</td></tr></table>
<p>Each router has only a default route to the ISP. The ISP knows nothing about the 10.x LANs or the 172.16.100.0/24 tunnel subnet; those live only inside the overlay. The four labs are: build phase 2 with OSPF, troubleshoot "Kochi cannot reach Pune", move the cloud to phase 3, and encrypt it with one shared IPsec profile.</p>

<div class="eg"><p><b>Worked example.</b> A retailer has 1 hub and 150 stores. Point-to-point GRE/IPsec to the hub: 150 tunnel interfaces and 150 /30 subnets on the hub. A full mesh: 150 x 149 / 2 = 11,175 tunnels. With DMVPN: <b>one</b> Tunnel0 on each of the 151 routers, one /24 (or larger) tunnel subnet, one IPsec profile, and the hub configuration does not change when store 151 opens. If on a busy day 40 store pairs talk directly, only 40 dynamic tunnels exist at that moment.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking DMVPN is a new encryption protocol. It is not. DMVPN is a <b>design</b> built from existing pieces: multipoint GRE for encapsulation, NHRP for address discovery, IPsec for encryption and a normal routing protocol for reachability. If you know each piece, DMVPN is easy to troubleshoot.</p></div>

<div class="exam"><p><b>Exam trap.</b> The ENARSI blueprint says "DMVPN (single hub)". Expect questions on one hub with many spokes, phases 1 to 3, NHRP roles and commands, and IPsec profiles. Dual-hub and multi-cloud designs are mentioned only as context. Also remember that DMVPN is Cisco's name; the standards underneath are GRE (RFC 2784) and NHRP (RFC 2332).</p></div>

<div class="scn"><h4>The 90th tunnel that broke the hub</h4><p>A logistics company added a new warehouse every month with a point-to-point GRE/IPsec tunnel. At about 90 tunnels, a change on the hub copied the wrong tunnel destination into a new interface and a large site lost connectivity for two hours. The engineer migrated to DMVPN: the hub got one mGRE Tunnel0, every warehouse used the same template with only its own tunnel IP changing, and new warehouses were connected without a hub change window.</p><p><b>Lesson:</b> when adding a site means editing the hub, you have a scaling and risk problem. DMVPN moves that work to the new spoke.</p></div>

<div class="iv"><p class="q">"Why would you choose DMVPN over point-to-point IPsec tunnels?"</p><p>Strong answer: one multipoint tunnel interface on the hub regardless of the number of spokes, zero-touch hub configuration because spokes register with NHRP, support for spokes with dynamic public IPs, and on-demand spoke-to-spoke tunnels that give a partial mesh without configuring n(n-1)/2 tunnels. Mention that it runs any IGP over the tunnel and uses one IPsec profile for all peers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Point-to-point tunnels scale badly: hub config per branch, and a full mesh needs n(n-1)/2 tunnels.</li>
<li>DMVPN = mGRE + NHRP + IPsec + a routing protocol; it is a design, not a new protocol.</li>
<li>Spokes register their public (NBMA) address with the hub; the hub config never changes when a spoke is added.</li>
<li>Spoke-to-spoke tunnels are built on demand and expire when idle.</li>
<li>Lab addressing: tunnel 172.16.100.0/24, NBMA 100.64.x.2, LANs 10.1.1/10.2.2/10.3.3.0/24.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>Point-to-point tunnels scale kyun nahi karte aur <b>Dynamic Multipoint VPN (DMVPN)</b> har router par sirf ek tunnel interface se yeh kaise solve karta hai.</li>
<li>Building blocks: <b>mGRE</b>, <b>NHRP</b> (registration aur resolution) aur <b>IPsec</b> tunnel protection.</li>
<li>DMVPN <b>phase 1, 2 aur 3</b>, aur har phase mein routing protocol (EIGRP, OSPF ya BGP) ko exactly kya karna hai.</li>
<li>MTU aur MSS tuning, front-door VRF ka idea, aur verification commands <code>show dmvpn</code>, <code>show ip nhrp</code> aur <code>show crypto session</code>.</li>
<li>Ek troubleshooting workflow jo is module ki chaaron labs ko step by step chalata hai.</li>
</ul>
<p><b>Prerequisites.</b> Aapko point-to-point GRE, IPsec basics (IKE, ESP, transport vs tunnel mode) aur tunnels ko <code>ip mtu 1400</code> kyun chahiye, yeh pehle se aana chahiye; CCNP ENCOR ka VRFs aur tunnels wala module yeh sab cover karta hai. OSPF DR election aur network types (ENARSI OSPF), EIGRP split horizon (ENARSI EIGRP) aur basic iBGP (ENARSI BGP) bhi comfortable hone chahiye. Yeh chapter unhe dobara padhane ki jagah unka reference deta hai.</p>

<h3>Ek analogy: courier company</h3>
<p>Ek courier company socho jiska head office Delhi mein hai aur branches Pune aur Kochi mein. Branches aksar shift hoti hain, isliye unke street address badalte rehte hain. Har subah har branch head office ko phone karke kehti hai "Pune branch ab is address par hai". Head office woh <b>address book</b> rakhta hai. Jab Pune ko Kochi parcel bhejna hota hai, woh pehle head office se poochta hai "Kochi aaj kahan hai?", ek baar jawab leta hai, aur uske baad apni vans <b>seedhe</b> Kochi bhejta hai. Nayi branch khulne par head office ko map dobara nahi banana padta; branch khud call kar deti hai.</p>
<p>DMVPN bilkul aise hi kaam karta hai. Hub router head office hai. Har spoke apna public address hub ke saath <b>register</b> karta hai. Jab ek spoke ko doosre spoke tak pahunchna hota hai, woh hub ke through doosre spoke ka public address <b>resolve</b> karta hai aur phir seedha tunnel banata hai, sirf utni der ke liye jitni der traffic ko zaroorat hai.</p>

<h3>DMVPN kaunsi problem solve karta hai</h3>
<p>Classic point-to-point GRE (IPsec ke saath ya bina) mein har tunnel apna alag interface hai jiska <code>tunnel destination</code> fixed hota hai. Isse teen scaling problems aati hain:</p>
<ul>
<li><b>Har branch ke saath hub configuration badhti hai.</b> 200 branches matlab hub par 200 tunnel interfaces, 200 subnets aur 200 crypto peers. Branch 201 add karni ho to hub ko chhoona padega.</li>
<li><b>Full mesh explode ho jaata hai.</b> Seedhe branch-to-branch tunnels ke liye n(n-1)/2 tunnels chahiye: 10 sites ke liye 45, 100 sites ke liye 4,950. Koi bhi yeh haath se configure nahi karta.</li>
<li><b>Sirf hub-and-spoke slow hai.</b> Agar branches sirf hub ke through baat karein, to Pune se Kochi ki voice call internet do baar cross karti hai, delay double hota hai aur encryption ke liye hub ki bandwidth aur CPU jalte hain.</li>
</ul>
<p>DMVPN configuration ko <b>hub-and-spoke</b> rakhta hai (har spoke sirf hub ko jaanta hai) lekin runtime par <b>dynamic partial mesh</b> bana sakta hai: spoke-to-spoke tunnels tab bante hain jab traffic ko zaroorat ho aur traffic rukne par time out ho jaate hain. Spokes ke public addresses dynamic bhi ho sakte hain (ISP se DHCP), kyunki woh khud register karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="DMVPN module ki lab topology">
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">HUB (Delhi DC)</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">Tu0 172.16.100.1</text>
<text x="420" y="38" class="svg-muted" font-size="12">NBMA 100.64.10.2</text><text x="420" y="56" class="svg-muted" font-size="12">LAN 10.1.1.0/24</text>
<ellipse cx="320" cy="150" rx="90" ry="32" fill="#e2e8f0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">ISP (internet)</text>
<line x1="320" y1="70" x2="320" y2="118" stroke="#64748b" stroke-width="2"/>
<line x1="160" y1="220" x2="260" y2="172" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="220" x2="380" y2="172" stroke="#64748b" stroke-width="2"/>
<path d="M230 50 Q90 60 90 220" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<path d="M410 50 Q550 60 550 220" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="60" y="120" class="svg-accent" font-size="12">mGRE + NHRP</text>
<text x="520" y="120" class="svg-accent" font-size="12">mGRE + NHRP</text>
<rect x="40" y="220" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="120" y="242" text-anchor="middle" class="svg-ink" font-size="13">SPOKE1 (Pune)</text><text x="120" y="260" text-anchor="middle" class="svg-muted" font-size="12">Tu0 .2 / 100.64.20.2</text>
<rect x="440" y="220" width="160" height="50" rx="8" fill="#fde68a"/><text x="520" y="242" text-anchor="middle" class="svg-ink" font-size="13">SPOKE2 (Kochi)</text><text x="520" y="260" text-anchor="middle" class="svg-muted" font-size="12">Tu0 .3 / 100.64.30.2</text>
<line x1="200" y1="262" x2="440" y2="262" stroke="#64748b" stroke-width="2" stroke-dasharray="2 4"/>
<text x="320" y="252" text-anchor="middle" class="svg-accent" font-size="12">dynamic tunnel (zaroorat par)</text>
<text x="120" y="290" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.2.2.0/24</text><text x="520" y="290" text-anchor="middle" class="svg-muted" font-size="12">LAN 10.3.3.0/24</text>
</svg><p class="cap">Har chapter mein use hone wali lab topology: ek hub, do spokes, ek shared provider. Dashed = permanent hub tunnels, dotted = zaroorat par banne wala spoke-to-spoke tunnel.</p></div>

<h3>Jo lab network aap banaoge</h3>
<table class="cmp"><tr><th>Router</th><th>Role</th><th>Gi0/0 (NBMA / public)</th><th>Tunnel0</th><th>LAN Gi0/1</th><th>Loopback0 / RID</th></tr>
<tr><td>HUB</td><td>Delhi DC, NHS</td><td>100.64.10.2/30</td><td>172.16.100.1/24</td><td>10.1.1.0/24 (SRV .100)</td><td>1.1.1.1</td></tr>
<tr><td>SPOKE1</td><td>Pune branch, NHC</td><td>100.64.20.2/30</td><td>172.16.100.2/24</td><td>10.2.2.0/24 (PC1 .10)</td><td>2.2.2.2</td></tr>
<tr><td>SPOKE2</td><td>Kochi branch, NHC</td><td>100.64.30.2/30</td><td>172.16.100.3/24</td><td>10.3.3.0/24 (PC2 .10)</td><td>3.3.3.3</td></tr></table>
<p>Har router ke paas ISP ki taraf sirf ek default route hai. ISP ko 10.x LANs ya 172.16.100.0/24 tunnel subnet ke baare mein kuch nahi pata; yeh sirf overlay ke andar rehte hain. Chaar labs hain: OSPF ke saath phase 2 banao, "Kochi Pune tak nahi pahunch pa raha" troubleshoot karo, cloud ko phase 3 par le jao, aur ek shared IPsec profile se use encrypt karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek retailer ke paas 1 hub aur 150 stores hain. Hub tak point-to-point GRE/IPsec: hub par 150 tunnel interfaces aur 150 /30 subnets. Full mesh: 150 x 149 / 2 = 11,175 tunnels. DMVPN ke saath: 151 routers mein se har ek par <b>sirf ek</b> Tunnel0, ek /24 (ya bada) tunnel subnet, ek IPsec profile, aur store 151 khulne par hub ki configuration nahi badalti. Agar kisi busy din 40 store pairs seedhe baat karte hain, to us waqt sirf 40 dynamic tunnels exist karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> DMVPN ko naya encryption protocol samajhna. Yeh nahi hai. DMVPN existing pieces se bana ek <b>design</b> hai: encapsulation ke liye multipoint GRE, address discovery ke liye NHRP, encryption ke liye IPsec aur reachability ke liye normal routing protocol. Har piece samajh aata hai to DMVPN troubleshoot karna aasaan hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENARSI blueprint kehta hai "DMVPN (single hub)". Ek hub aur kai spokes, phases 1 se 3, NHRP roles aur commands, aur IPsec profiles par questions expect karo. Dual-hub aur multi-cloud designs sirf context ke roop mein aate hain. Yaad rakho ki DMVPN Cisco ka naam hai; neeche ke standards GRE (RFC 2784) aur NHRP (RFC 2332) hain.</p></div>

<div class="scn"><h4>90th tunnel jisne hub tod diya</h4><p>Ek logistics company har mahine point-to-point GRE/IPsec tunnel ke saath naya warehouse jodti thi. Lagbhag 90 tunnels par, hub par ek change ne galat tunnel destination naye interface mein copy kar diya aur ek badi site do ghante tak disconnected rahi. Engineer ne DMVPN par migrate kiya: hub ko ek mGRE Tunnel0 mila, har warehouse ne same template use kiya jisme sirf apna tunnel IP badalta tha, aur naye warehouses bina hub change window ke connect hone lage.</p><p><b>Seekh:</b> jab site add karne ka matlab hub edit karna ho, to aapke paas scaling aur risk problem hai. DMVPN woh kaam naye spoke par shift kar deta hai.</p></div>

<div class="iv"><p class="q">"Point-to-point IPsec tunnels ki jagah aap DMVPN kyun choose karoge?"</p><p>Strong answer: spokes kitne bhi hon, hub par ek hi multipoint tunnel interface; zero-touch hub configuration kyunki spokes NHRP se register karte hain; dynamic public IPs wale spokes ka support; aur on-demand spoke-to-spoke tunnels jo n(n-1)/2 tunnels configure kiye bina partial mesh dete hain. Batao ki yeh tunnel par koi bhi IGP chalata hai aur saare peers ke liye ek IPsec profile use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Point-to-point tunnels bura scale karte hain: har branch ke liye hub config, aur full mesh ko n(n-1)/2 tunnels chahiye.</li>
<li>DMVPN = mGRE + NHRP + IPsec + ek routing protocol; yeh design hai, naya protocol nahi.</li>
<li>Spokes apna public (NBMA) address hub ke saath register karte hain; spoke add karne par hub config kabhi nahi badalta.</li>
<li>Spoke-to-spoke tunnels zaroorat par bante hain aur idle hone par expire ho jaate hain.</li>
<li>Lab addressing: tunnel 172.16.100.0/24, NBMA 100.64.x.2, LANs 10.1.1/10.2.2/10.3.3.0/24.</li>
</ul></div>
`}};export{e as default};