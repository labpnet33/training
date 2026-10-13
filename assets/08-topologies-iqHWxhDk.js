var e={id:`topologies`,h:{en:`SD-WAN topologies: full mesh, hub-and-spoke, regional hub, breakout`,hi:`SD-WAN topologies: full mesh, hub-and-spoke, regional hub, breakout`},body:{en:`
<p>Think about how a courier company connects its depots. Option one: every depot has a road to every other depot. Option two: every depot sends everything to the central warehouse, which redistributes. Option three: regional warehouses serve groups of depots. None is "best". Each trades cost, speed and control. The same choices exist in SD-WAN, and the routing you configure is what <b>creates</b> the shape.</p>

<h3>Full mesh</h3>
<p>Every branch can build a direct tunnel to every other branch. Bengaluru to Kolkata goes straight, without detouring through Delhi. In Versa this is natural: the Controller tells every site about every other site, and tunnels form on demand or permanently depending on configuration. With N sites a full mesh has N x (N-1) / 2 tunnels: 3 sites give 3, 10 sites give 45, 100 sites give 4,950.</p>
<ul><li><b>Pros:</b> lowest latency between branches, no hub bottleneck, no single point of failure for branch traffic.</li>
<li><b>Cons:</b> many tunnels to monitor and rekey; each branch device needs capacity for them; harder to apply central inspection.</li></ul>

<h3>Hub-and-spoke</h3>
<p>Branches (spokes) talk only to a hub (the Mumbai DC), and all branch-to-branch traffic passes through it. It is done with route policy: spokes learn only the hub's prefixes, or they learn a default route toward the hub, and spoke-to-spoke tunnels are not allowed. Benefits: central firewalling and logging, simple routing, strong control. Cost: extra latency (Bengaluru to Kolkata crosses Mumbai) and a hub that must be sized and made redundant.</p>

<h3>Regional hub (hierarchical)</h3>
<p>Spokes connect to a regional hub (for example South and East), and hubs connect to each other and to the data centre. This keeps latency low inside a region and keeps the number of tunnels manageable for hundreds or thousands of sites. It is the common design for large enterprises and service-provider managed services.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Topologies">
<text x="105" y="20" text-anchor="middle" class="svg-ink" font-size="13">Full mesh</text>
<circle cx="60" cy="110" r="16" fill="#bbf7d0"/><circle cx="150" cy="110" r="16" fill="#bbf7d0"/><circle cx="105" cy="55" r="16" fill="#bbf7d0"/><circle cx="105" cy="190" r="16" fill="#bbf7d0"/>
<line x1="60" y1="110" x2="150" y2="110" stroke="#64748b"/><line x1="60" y1="110" x2="105" y2="55" stroke="#64748b"/><line x1="150" y1="110" x2="105" y2="55" stroke="#64748b"/><line x1="60" y1="110" x2="105" y2="190" stroke="#64748b"/><line x1="150" y1="110" x2="105" y2="190" stroke="#64748b"/><line x1="105" y1="55" x2="105" y2="190" stroke="#64748b"/>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Hub-and-spoke</text>
<circle cx="320" cy="110" r="22" fill="#bae6fd"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="11">Hub</text>
<circle cx="260" cy="55" r="14" fill="#bbf7d0"/><circle cx="380" cy="55" r="14" fill="#bbf7d0"/><circle cx="260" cy="175" r="14" fill="#bbf7d0"/><circle cx="380" cy="175" r="14" fill="#bbf7d0"/>
<line x1="320" y1="110" x2="260" y2="55" stroke="#64748b"/><line x1="320" y1="110" x2="380" y2="55" stroke="#64748b"/><line x1="320" y1="110" x2="260" y2="175" stroke="#64748b"/><line x1="320" y1="110" x2="380" y2="175" stroke="#64748b"/>
<text x="535" y="20" text-anchor="middle" class="svg-ink" font-size="13">Regional hubs</text>
<circle cx="535" cy="40" r="16" fill="#bae6fd"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="10">DC</text>
<circle cx="480" cy="110" r="16" fill="#fde68a"/><circle cx="590" cy="110" r="16" fill="#fde68a"/>
<line x1="535" y1="40" x2="480" y2="110" stroke="#64748b"/><line x1="535" y1="40" x2="590" y2="110" stroke="#64748b"/><line x1="480" y1="110" x2="590" y2="110" stroke="#64748b" stroke-dasharray="4 4"/>
<circle cx="450" cy="190" r="12" fill="#bbf7d0"/><circle cx="510" cy="190" r="12" fill="#bbf7d0"/><circle cx="560" cy="190" r="12" fill="#bbf7d0"/><circle cx="620" cy="190" r="12" fill="#bbf7d0"/>
<line x1="480" y1="110" x2="450" y2="190" stroke="#64748b"/><line x1="480" y1="110" x2="510" y2="190" stroke="#64748b"/><line x1="590" y1="110" x2="560" y2="190" stroke="#64748b"/><line x1="590" y1="110" x2="620" y2="190" stroke="#64748b"/>
</svg><p class="cap">Mesh gives short paths, hub gives control, regional hubs balance both.</p></div>

<h3>Internet breakout</h3>
<p>Where should a user's Internet traffic leave the network? With <b>central breakout</b> everything goes over the tunnels to the data centre and leaves there, which makes security simple but adds latency and eats WAN bandwidth. With <b>local breakout</b> (also called direct Internet access) a branch sends Internet-bound traffic out of its own Internet circuit, often with the Versa security functions (NGFW, URL filtering) at the branch. Most modern designs use local breakout for trusted SaaS and central or cloud security for the rest. Routing implements it with a default route in the LAN VR toward the Internet transport, and more specific overlay routes for corporate prefixes.</p>

<div class="eg"><p><b>Worked example.</b> Acme has three branches (Delhi 101, Bengaluru 102, Kolkata 103) and a DC. Full mesh: 3 branch-to-branch tunnels per transport, plus 3 to the DC. Hub-and-spoke through Mumbai: 3 tunnels per transport only, but a Bengaluru to Kolkata ping goes through Mumbai. With local breakout, Delhi sends web traffic out of 203.0.113.6 directly while 10.1.0.0/16 still goes over the overlay.</p></div>

<h3>How the topology shows up in routes</h3>
<pre class="out">admin@Branch2-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch1      101      10.1.1.0/24
Branch3      103      10.1.3.0/24</pre>
<p>In the lab (full mesh) Bengaluru learns both other LANs. In a hub-and-spoke design you would instead see only the hub prefixes or a summary, and the traffic to Kolkata would be forced via the hub. The topology is a <b>policy outcome</b>, not a separate feature.</p>

<div class="warn"><p><b>Common mistakes.</b> Choosing full mesh for 500 small branches; hub without redundancy; local breakout without branch security; forgetting that hub-and-spoke doubles the WAN crossing for spoke-to-spoke traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> Number of tunnels in a full mesh is N(N-1)/2, not N. Hub-and-spoke has N tunnels per transport to one hub.</p></div>

<div class="scn"><h4>The hub that became the bottleneck</h4><p>A retailer moved from full mesh to hub-and-spoke for control. Within a month video calls between neighbouring stores sounded poor because their media travelled to a hub in another city and back. The team created two regional hubs, allowed spoke-to-spoke inside a region, and kept data-centre traffic via the main hub.</p><p><b>Lesson:</b> choose topology from traffic patterns, not from diagrams.</p></div>
<div class="iv"><p class="q">"When would you choose hub-and-spoke over full mesh?"</p><p>When central inspection, compliance or simplicity matters and most traffic goes to the data centre, or when site count makes a mesh unmanageable. Choose full mesh for latency-sensitive branch-to-branch traffic. Mention regional hubs as the middle path and that Versa implements all of them with route policy and Controller control.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Full mesh: shortest paths, N(N-1)/2 tunnels; hub-and-spoke: control, extra latency; regional hubs: balance.</li>
<li>Topology is created by route and policy control, mainly through the Controller.</li>
<li>Internet breakout can be central or local; local saves WAN bandwidth but needs branch security.</li>
<li>The lab runs a three-site full mesh over three transports.</li>
<li>Pick the design from traffic patterns, scale and security needs.</li>
</ul></div>
`,hi:`
<p>Socho ek courier company apne depots ko kaise jodti hai. Option ek: har depot ka har doosre depot tak road hai. Option do: har depot sab kuch central warehouse ko bhejta hai, jo aage redistribute karta hai. Option teen: regional warehouses depots ke groups ko serve karte hain. Koi bhi "best" nahi hai. Har ek cost, speed aur control ke beech trade-off hai. Yahi choices SD-WAN mein bhi hain, aur jo routing aap configure karte ho wahi shape <b>banati</b> hai.</p>

<h3>Full mesh</h3>
<p>Har branch har doosri branch tak direct tunnel bana sakti hai. Bengaluru se Kolkata seedha jaata hai, Delhi se ghoom kar nahi. Versa mein yeh natural hai: Controller har site ko har doosri site ke baare mein batata hai, aur tunnels configuration ke hisaab se on demand ya permanently ban jaate hain. N sites ke full mesh mein N x (N-1) / 2 tunnels hote hain: 3 sites par 3, 10 sites par 45, 100 sites par 4,950.</p>
<ul><li><b>Pros:</b> branches ke beech sabse kam latency, hub bottleneck nahi, branch traffic ke liye single point of failure nahi.</li>
<li><b>Cons:</b> monitor aur rekey karne ke liye bahut tunnels; har branch device ko unki capacity chahiye; central inspection lagana mushkil.</li></ul>

<h3>Hub-and-spoke</h3>
<p>Branches (spokes) sirf hub (Mumbai DC) se baat karti hain, aur saara branch-to-branch traffic usse guzarta hai. Yeh route policy se hota hai: spokes sirf hub ke prefixes seekhte hain, ya hub ki taraf default route seekhte hain, aur spoke-to-spoke tunnels allow nahi hote. Fayde: central firewalling aur logging, simple routing, strong control. Keemat: extra latency (Bengaluru se Kolkata Mumbai se guzarta hai) aur ek hub jise size aur redundant banana padta hai.</p>

<h3>Regional hub (hierarchical)</h3>
<p>Spokes regional hub (jaise South aur East) se connect hote hain, aur hubs ek doosre se aur data centre se connect hote hain. Isse region ke andar latency kam rehti hai aur sainkdon ya hazaron sites ke liye tunnels ki sankhya manageable rehti hai. Bade enterprises aur service-provider managed services ka common design yahi hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Topologies">
<text x="105" y="20" text-anchor="middle" class="svg-ink" font-size="13">Full mesh</text>
<circle cx="60" cy="110" r="16" fill="#bbf7d0"/><circle cx="150" cy="110" r="16" fill="#bbf7d0"/><circle cx="105" cy="55" r="16" fill="#bbf7d0"/><circle cx="105" cy="190" r="16" fill="#bbf7d0"/>
<line x1="60" y1="110" x2="150" y2="110" stroke="#64748b"/><line x1="60" y1="110" x2="105" y2="55" stroke="#64748b"/><line x1="150" y1="110" x2="105" y2="55" stroke="#64748b"/><line x1="60" y1="110" x2="105" y2="190" stroke="#64748b"/><line x1="150" y1="110" x2="105" y2="190" stroke="#64748b"/><line x1="105" y1="55" x2="105" y2="190" stroke="#64748b"/>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Hub-and-spoke</text>
<circle cx="320" cy="110" r="22" fill="#bae6fd"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="11">Hub</text>
<circle cx="260" cy="55" r="14" fill="#bbf7d0"/><circle cx="380" cy="55" r="14" fill="#bbf7d0"/><circle cx="260" cy="175" r="14" fill="#bbf7d0"/><circle cx="380" cy="175" r="14" fill="#bbf7d0"/>
<line x1="320" y1="110" x2="260" y2="55" stroke="#64748b"/><line x1="320" y1="110" x2="380" y2="55" stroke="#64748b"/><line x1="320" y1="110" x2="260" y2="175" stroke="#64748b"/><line x1="320" y1="110" x2="380" y2="175" stroke="#64748b"/>
<text x="535" y="20" text-anchor="middle" class="svg-ink" font-size="13">Regional hubs</text>
<circle cx="535" cy="40" r="16" fill="#bae6fd"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="10">DC</text>
<circle cx="480" cy="110" r="16" fill="#fde68a"/><circle cx="590" cy="110" r="16" fill="#fde68a"/>
<line x1="535" y1="40" x2="480" y2="110" stroke="#64748b"/><line x1="535" y1="40" x2="590" y2="110" stroke="#64748b"/><line x1="480" y1="110" x2="590" y2="110" stroke="#64748b" stroke-dasharray="4 4"/>
<circle cx="450" cy="190" r="12" fill="#bbf7d0"/><circle cx="510" cy="190" r="12" fill="#bbf7d0"/><circle cx="560" cy="190" r="12" fill="#bbf7d0"/><circle cx="620" cy="190" r="12" fill="#bbf7d0"/>
<line x1="480" y1="110" x2="450" y2="190" stroke="#64748b"/><line x1="480" y1="110" x2="510" y2="190" stroke="#64748b"/><line x1="590" y1="110" x2="560" y2="190" stroke="#64748b"/><line x1="590" y1="110" x2="620" y2="190" stroke="#64748b"/>
</svg><p class="cap">Mesh chhote paths deta hai, hub control deta hai, regional hubs dono ka balance.</p></div>

<h3>Internet breakout</h3>
<p>User ka Internet traffic network se kahan nikle? <b>Central breakout</b> mein sab kuch tunnels se data centre jaata hai aur wahin se nikalta hai, jisse security simple hoti hai par latency badhti hai aur WAN bandwidth khapti hai. <b>Local breakout</b> (direct Internet access) mein branch Internet-bound traffic apne Internet circuit se nikalti hai, aksar Versa security functions (NGFW, URL filtering) branch par hi chalate hain. Zyada tar modern designs trusted SaaS ke liye local breakout aur baaki ke liye central ya cloud security use karte hain. Routing ise implement karti hai LAN VR mein Internet transport ki taraf default route se, aur corporate prefixes ke liye zyada specific overlay routes se.</p>

<div class="eg"><p><b>Worked example.</b> Acme ki teen branches (Delhi 101, Bengaluru 102, Kolkata 103) aur ek DC hai. Full mesh: har transport par 3 branch-to-branch tunnels, plus DC ke 3. Mumbai ke through hub-and-spoke: har transport par sirf 3 tunnels, par Bengaluru se Kolkata ka ping Mumbai se guzarta hai. Local breakout mein Delhi web traffic 203.0.113.6 se seedha nikalta hai jabki 10.1.0.0/16 abhi bhi overlay par jaata hai.</p></div>

<h3>Topology routes mein kaise dikhti hai</h3>
<pre class="out">admin@Branch2-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch1      101      10.1.1.0/24
Branch3      103      10.1.3.0/24</pre>
<p>Lab mein (full mesh) Bengaluru dono doosre LANs seekhta hai. Hub-and-spoke design mein aap sirf hub prefixes ya ek summary dekhte, aur Kolkata ka traffic hub se hokar jaata. Topology ek <b>policy outcome</b> hai, alag feature nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> 500 chhoti branches ke liye full mesh chunna; bina redundancy ka hub; branch security ke bina local breakout; yeh bhoolna ki hub-and-spoke spoke-to-spoke traffic ka WAN crossing double kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Full mesh mein tunnels ki sankhya N(N-1)/2 hai, N nahi. Hub-and-spoke mein ek hub tak har transport par N tunnels.</p></div>

<div class="scn"><h4>Hub jo bottleneck ban gaya</h4><p>Ek retailer control ke liye full mesh se hub-and-spoke par gaya. Ek mahine ke andar padosi stores ke beech video calls kharab lagne lage kyunki unka media doosre sheher ke hub tak jaakar wapas aata tha. Team ne do regional hubs banaye, region ke andar spoke-to-spoke allow kiya, aur data-centre traffic main hub se rakha.</p><p><b>Seekh:</b> topology traffic patterns se chuno, diagrams se nahi.</p></div>
<div class="iv"><p class="q">"Full mesh ki jagah hub-and-spoke kab chunoge?"</p><p>Jab central inspection, compliance ya simplicity zaroori ho aur zyada traffic data centre ki taraf jaata ho, ya jab sites ki sankhya mesh ko unmanageable bana de. Latency-sensitive branch-to-branch traffic ke liye full mesh chuno. Regional hubs ko beech ka raasta batao aur yeh ki Versa sab route policy aur Controller control se implement karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Full mesh: sabse chhote paths, N(N-1)/2 tunnels; hub-and-spoke: control, extra latency; regional hubs: balance.</li>
<li>Topology route aur policy control se banti hai, mainly Controller ke through.</li>
<li>Internet breakout central ya local ho sakta hai; local WAN bandwidth bachata hai par branch security chahiye.</li>
<li>Lab teen transports par three-site full mesh chalata hai.</li>
<li>Design traffic patterns, scale aur security needs se chuno.</li>
</ul></div>
`}};export{e as default};