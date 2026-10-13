var e={id:`topologies`,h:{en:`Topologies: hub-and-spoke, partial mesh and regions`,hi:`Topologies: hub-and-spoke, partial mesh aur regions`},body:{en:`
<p>A <b>topology</b> in SD-WAN is not cabling. It is the set of tunnels and routes that exist because of what the Controller tells each edge. Because the default is a full mesh, every other topology is made by <b>removing</b> information with a control policy.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Full mesh, hub and spoke, partial mesh">
<text x="107" y="18" text-anchor="middle" class="svg-ink" font-size="13">Full mesh (default)</text>
<circle cx="50" cy="60" r="16" fill="#bbf7d0"/><circle cx="165" cy="60" r="16" fill="#bbf7d0"/><circle cx="50" cy="170" r="16" fill="#bbf7d0"/><circle cx="165" cy="170" r="16" fill="#bbf7d0"/>
<path d="M50 60 L165 60 M50 60 L50 170 M165 60 L165 170 M50 170 L165 170 M50 60 L165 170 M165 60 L50 170" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="18" text-anchor="middle" class="svg-ink" font-size="13">Hub and spoke</text>
<circle cx="320" cy="110" r="20" fill="#fde68a"/><circle cx="260" cy="50" r="14" fill="#bbf7d0"/><circle cx="380" cy="50" r="14" fill="#bbf7d0"/><circle cx="260" cy="180" r="14" fill="#bbf7d0"/><circle cx="380" cy="180" r="14" fill="#bbf7d0"/>
<path d="M320 110 L260 50 M320 110 L380 50 M320 110 L260 180 M320 110 L380 180" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="533" y="18" text-anchor="middle" class="svg-ink" font-size="13">Partial mesh</text>
<circle cx="480" cy="60" r="16" fill="#bbf7d0"/><circle cx="590" cy="60" r="16" fill="#bbf7d0"/><circle cx="480" cy="170" r="16" fill="#bbf7d0"/><circle cx="590" cy="170" r="16" fill="#bbf7d0"/>
<path d="M480 60 L590 60 M480 60 L480 170 M590 60 L590 170" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Same underlay, different tunnels, decided by control policy</text>
</svg><p class="cap">Topology is what the Controller lets each edge learn.</p></div>

<h3>Hub-and-spoke</h3>
<p>All branches (spokes) talk only to the hub. Spokes learn the hub TLOCs, so they build BFD tunnels only to the hub. Spoke-to-spoke traffic is carried via the hub, which works when the hub advertises a summary or default route or when a policy points spoke routes at the hub TLOC. Typical reasons: central inspection, central internet breakout, or a small branch router that should hold few tunnels.</p>

<h3>Click path: the Hub-and-Spoke wizard</h3>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Policies</b> &gt; <b>Centralized Policy</b> &gt; <b>Add Policy</b> and finish the lists step with a hub site list and a spoke site list.</li>
<li>At <b>Configure Topology and VPN Membership</b>, click <b>Add Topology</b> and choose <b>Hub-and-Spoke</b>.</li>
<li>Enter a policy name and select the <b>VPN List</b> (for example CORP).</li>
<li>Click <b>Add Hub-and-Spoke</b>, give it a name, choose the <b>spoke site list</b> and click <b>Add Hub Sites</b>, then choose the <b>hub site list</b>.</li>
<li>Save the topology, then click <b>Next</b> and continue to apply it to sites.</li>
</ol>
<p>The wizard builds control-policy sequences for you. In CLI the same idea looks like this:</p>
<pre class="code">policy
 control-policy HUB-SPOKE
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   !
   action accept
   !
  !
  sequence 20
   match route
    site-list HUB
    vpn-list CORP
   !
   action accept
   !
  !
  default-action reject
 !
!
apply-policy
 site-list SPOKES
  control-policy HUB-SPOKE out
 !
!</pre>
<p>The policy is applied <b>out</b> toward the spokes: when the Controller is about to send a TLOC or route to a spoke, it accepts only the hub's. The hub site is not in the SPOKES list, so the hub still learns the spokes' TLOCs and routes.</p>

<h3>Partial mesh and regional ideas</h3>
<p>A <b>partial mesh</b> allows direct tunnels between some sites only: for example Mumbai and Hyderabad may talk directly while Bengaluru goes via Delhi. Build it by accepting the TLOCs of selected site lists for each group of sites, and rejecting the rest. In the Manager, the <b>Mesh</b> topology type lets you choose a site list that should form a full mesh among its members and leaves other sites out of it.</p>
<p>Large networks add <b>regions</b>. In multi-region fabric, sites are placed in regions, and traffic between regions flows through border routers instead of direct tunnels between every pair of sites. Control policy can match on region as well as on site. The aim is the same: shrink the number of tunnels and routes each edge must hold. Multi-region fabric is a design topic with its own configuration steps; here you only need the idea that a region groups sites and a policy can use it.</p>

<h3>Choosing a topology</h3>
<table>
<tr><th>Need</th><th>Topology</th><th>Cost</th></tr>
<tr><td>Fast any-to-any voice between branches</td><td>Full mesh (default)</td><td>Many tunnels per edge</td></tr>
<tr><td>Inspect all inter-branch traffic at the hub</td><td>Hub-and-spoke</td><td>Hub bandwidth, extra latency</td></tr>
<tr><td>Some branches talk directly, others do not</td><td>Partial mesh</td><td>More policy to maintain</td></tr>
<tr><td>Hundreds of sites in several countries</td><td>Regions</td><td>Design and migration effort</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Accepting hub routes but not hub TLOCs, so spokes learn routes with no tunnel; applying the policy <b>in</b> (filtering what the Controller receives from spokes) when the intent was to filter what spokes learn; and forgetting that the hub must advertise a summary or default route for spoke-to-spoke reachability.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hub-and-spoke is built by control policy, not by cabling. The Hub-and-Spoke wizard is under the Centralized Policy Add Topology step. For spokes to receive only the hub, the policy is applied to the spoke site list, outbound from the Controller.</p></div>

<div class="scn"><h4>Bengaluru as a spoke</h4><p>BHARAT-RETAIL wanted E-BLR-1, an internet-only site, to send everything through Delhi. The team made BLR a spoke and Delhi the hub. After activation, <code>show sdwan bfd sessions</code> on E-BLR-1 showed a single remote system IP, 10.255.0.11, with one session on the shared internet color. The branch router now held one tunnel instead of three.</p></div>

<div class="iv"><p class="q">"How do you turn the default full mesh into hub-and-spoke?"</p><p>Strong answer: with a centralized control policy on the Controller. Create a hub site list and a spoke site list, write sequences that accept the hub TLOCs and the hub routes, set the default action to reject, and apply the policy to the spoke site list in the out direction. Verify with show omp tlocs on a spoke and BFD sessions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Full mesh is the default; every other topology is a policy that removes information.</li>
<li>Hub-and-spoke needs both hub TLOCs and hub routes accepted for the spokes.</li>
<li>Apply to spoke sites outbound from the Controller.</li>
<li>Regions group sites to reduce tunnels; a policy can match on region.</li>
</ul></div>
`,hi:`
<p>SD-WAN mein <b>topology</b> cabling nahi hai. Yeh un tunnels aur routes ka set hai jo isliye bante hain kyunki Controller har edge ko kya batata hai. Default full mesh hai, isliye baaki har topology control policy se jaankari <b>hata kar</b> banti hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Full mesh, hub and spoke, partial mesh">
<text x="107" y="18" text-anchor="middle" class="svg-ink" font-size="13">Full mesh (default)</text>
<circle cx="50" cy="60" r="16" fill="#bbf7d0"/><circle cx="165" cy="60" r="16" fill="#bbf7d0"/><circle cx="50" cy="170" r="16" fill="#bbf7d0"/><circle cx="165" cy="170" r="16" fill="#bbf7d0"/>
<path d="M50 60 L165 60 M50 60 L50 170 M165 60 L165 170 M50 170 L165 170 M50 60 L165 170 M165 60 L50 170" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="18" text-anchor="middle" class="svg-ink" font-size="13">Hub and spoke</text>
<circle cx="320" cy="110" r="20" fill="#fde68a"/><circle cx="260" cy="50" r="14" fill="#bbf7d0"/><circle cx="380" cy="50" r="14" fill="#bbf7d0"/><circle cx="260" cy="180" r="14" fill="#bbf7d0"/><circle cx="380" cy="180" r="14" fill="#bbf7d0"/>
<path d="M320 110 L260 50 M320 110 L380 50 M320 110 L260 180 M320 110 L380 180" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="533" y="18" text-anchor="middle" class="svg-ink" font-size="13">Partial mesh</text>
<circle cx="480" cy="60" r="16" fill="#bbf7d0"/><circle cx="590" cy="60" r="16" fill="#bbf7d0"/><circle cx="480" cy="170" r="16" fill="#bbf7d0"/><circle cx="590" cy="170" r="16" fill="#bbf7d0"/>
<path d="M480 60 L590 60 M480 60 L480 170 M590 60 L590 170" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Underlay wahi, tunnels alag, control policy tay karti hai</text>
</svg><p class="cap">Topology wahi hai jo Controller har edge ko seekhne deta hai.</p></div>

<h3>Hub-and-spoke</h3>
<p>Saari branches (spokes) sirf hub se baat karti hain. Spokes hub TLOCs seekhte hain, isliye BFD tunnels sirf hub tak banate hain. Spoke-to-spoke traffic hub ke zariye jaati hai, jo tab kaam karta hai jab hub summary ya default route advertise kare ya policy spoke routes ko hub TLOC ki taraf point kare. Aam wajah: central inspection, central internet breakout, ya chhota branch router jo kam tunnels rakhe.</p>

<h3>Click path: Hub-and-Spoke wizard</h3>
<ol>
<li><b>Configuration</b> &gt; <b>Policies</b> &gt; <b>Centralized Policy</b> &gt; <b>Add Policy</b> kholo aur lists step hub site list aur spoke site list ke saath poora karo.</li>
<li><b>Configure Topology and VPN Membership</b> par <b>Add Topology</b> click karo aur <b>Hub-and-Spoke</b> chuno.</li>
<li>Policy ka naam likho aur <b>VPN List</b> chuno (jaise CORP).</li>
<li><b>Add Hub-and-Spoke</b> click karo, naam do, <b>spoke site list</b> chuno aur <b>Add Hub Sites</b> click karo, phir <b>hub site list</b> chuno.</li>
<li>Topology save karo, phir <b>Next</b> click karo aur sites par apply karne ki taraf badho.</li>
</ol>
<p>Wizard aapke liye control-policy sequences banata hai. CLI mein wahi idea aisa dikhta hai:</p>
<pre class="code">policy
 control-policy HUB-SPOKE
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   !
   action accept
   !
  !
  sequence 20
   match route
    site-list HUB
    vpn-list CORP
   !
   action accept
   !
  !
  default-action reject
 !
!
apply-policy
 site-list SPOKES
  control-policy HUB-SPOKE out
 !
!</pre>
<p>Policy spokes ki taraf <b>out</b> apply hoti hai: jab Controller kisi spoke ko TLOC ya route bhejne wala hota hai, woh sirf hub ka accept karta hai. Hub site SPOKES list mein nahi hai, isliye hub ab bhi spokes ke TLOCs aur routes seekhta hai.</p>

<h3>Partial mesh aur regional ideas</h3>
<p><b>Partial mesh</b> sirf kuch sites ke beech direct tunnels deta hai: jaise Mumbai aur Hyderabad direct baat karein jabki Bengaluru Delhi ke zariye jaye. Ise sites ke har group ke liye chuni hui site lists ke TLOCs accept karke aur baaki reject karke banate ho. Manager mein <b>Mesh</b> topology type aapko woh site list chunne deta hai jo apne members ke beech full mesh banaye aur baaki sites ko usse bahar rakhe.</p>
<p>Bade networks <b>regions</b> jodte hain. Multi-region fabric mein sites regions mein rakhi jaati hain, aur regions ke beech traffic border routers se guzarta hai, har pair ke beech direct tunnels se nahi. Control policy site ke saath region par bhi match kar sakti hai. Maksad wahi: har edge ko kitne tunnels aur routes rakhne padte hain woh kam karna. Multi-region fabric ek design topic hai jiske apne configuration steps hain; yahan bas idea chahiye ki region sites ko group karta hai aur policy use kar sakti hai.</p>

<h3>Topology chunna</h3>
<table>
<tr><th>Zaroorat</th><th>Topology</th><th>Keemat</th></tr>
<tr><td>Branches ke beech tez any-to-any voice</td><td>Full mesh (default)</td><td>Har edge par bahut tunnels</td></tr>
<tr><td>Saari inter-branch traffic hub par inspect</td><td>Hub-and-spoke</td><td>Hub bandwidth, extra latency</td></tr>
<tr><td>Kuch branches direct baat karein, kuch nahi</td><td>Partial mesh</td><td>Zyada policy maintain karni</td></tr>
<tr><td>Kai deshon mein sainkdon sites</td><td>Regions</td><td>Design aur migration effort</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Hub routes accept karna lekin hub TLOCs nahi, jisse spokes ko routes mil jaate hain lekin tunnel nahi; policy <b>in</b> apply karna (Controller spokes se jo receive karta hai use filter karna) jab irada tha ki spokes jo seekhte hain use filter ho; aur bhoolna ki spoke-to-spoke reachability ke liye hub ko summary ya default route advertise karna padta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hub-and-spoke control policy se banta hai, cabling se nahi. Hub-and-Spoke wizard Centralized Policy ke Add Topology step mein hai. Spokes sirf hub receive karein, iske liye policy spoke site list par, Controller se outbound apply hoti hai.</p></div>

<div class="scn"><h4>Bengaluru as a spoke</h4><p>BHARAT-RETAIL chahta tha ki E-BLR-1, ek internet-only site, sab kuch Delhi ke zariye bheje. Team ne BLR ko spoke aur Delhi ko hub banaya. Activation ke baad E-BLR-1 par <code>show sdwan bfd sessions</code> ne ek hi remote system IP, 10.255.0.11, dikhaya, jisme shared internet color par ek session tha. Branch router ab teen ki jagah ek tunnel rakhta tha.</p></div>

<div class="iv"><p class="q">"Default full mesh ko hub-and-spoke kaise banate ho?"</p><p>Strong answer: Controller par centralized control policy se. Hub site list aur spoke site list banao, aisi sequences likho jo hub TLOCs aur hub routes accept karein, default action reject rakho, aur policy ko spoke site list par out direction mein apply karo. Spoke par show omp tlocs aur BFD sessions se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Full mesh default hai; baaki har topology woh policy hai jo jaankari hatati hai.</li>
<li>Hub-and-spoke mein spokes ke liye hub TLOCs aur hub routes dono accept karne padte hain.</li>
<li>Spoke sites par Controller se outbound apply karo.</li>
<li>Regions tunnels kam karne ke liye sites group karte hain; policy region par match kar sakti hai.</li>
</ul></div>
`}};export{e as default};