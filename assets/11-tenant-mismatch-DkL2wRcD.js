var e={id:`tenant-mismatch`,h:{en:`Tenant mismatch: Kolkata joined the wrong organization (vs-tenant-mismatch)`,hi:`Tenant mismatch: Kolkata galat organization mein join hua (vs-tenant-mismatch)`},body:{en:`
<p>Imagine a visitor who walks into the right building but gives the reception the name of a company that does not rent there. The guard is polite and the lift works, but nobody lets the visitor in. Everything physical is fine; the identity is wrong. That is a tenant mismatch.</p>

<h3>Why this fault is sneaky</h3>
<p>Tenant (organization) mismatch is invisible at the circuit level. Interfaces are up, addresses are right, underlay routes work, the Controller is reachable. All the tunnel conditions that depend on the transport pass. What fails is the <b>logical</b> join: the branch says "I belong to organization Guest" and the Controller answers "my organization is Acme". The MP-BGP session cannot establish and no routes are exchanged. A technician who only checks cables and carriers can lose hours.</p>

<h3>The ticket</h3>
<p>"Kolkata was configured manually under organization Guest instead of Acme. Read the reason the Controller side gives, move the identity to Acme without touching the circuits, and prove Kolkata reaches Delhi." Kolkata is Branch3, site-id 103, LAN 10.1.3.0/24, PC3 10.1.3.10.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Tenant mismatch">
<rect x="20" y="60" width="150" height="80" rx="8" fill="#ddd6fe"/><text x="95" y="88" text-anchor="middle" class="svg-ink" font-size="14">Branch3 Kolkata</text><text x="95" y="108" text-anchor="middle" class="svg-accent" font-size="12">orgs org Guest</text><text x="95" y="126" text-anchor="middle" class="svg-muted" font-size="11">site-id 103</text>
<rect x="470" y="60" width="150" height="80" rx="8" fill="#bae6fd"/><text x="545" y="88" text-anchor="middle" class="svg-ink" font-size="14">Controller-1</text><text x="545" y="108" text-anchor="middle" class="svg-accent" font-size="12">orgs org Acme</text><text x="545" y="126" text-anchor="middle" class="svg-muted" font-size="11">knows only Acme</text>
<line x1="170" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">underlay fine, join refused</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Controller organization is Acme, branch uses Guest</text>
</svg><p class="cap">Wires and routes are healthy; the identity does not match.</p></div>

<h3>Step 1: read the reason</h3>
<p>On Branch3 the organization is Guest, so the show command names Guest:</p>
<pre class="out">admin@Branch3-cli&gt; show orgs org Guest sd-wan brief
Org: Guest   Site-ID: 103   Hostname: Branch3
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): <span class="hl">Idle  [Controller organization is Acme, branch uses Guest]</span>
Transport  Interface  Tunnel  Reason

admin@Controller-1-cli&gt; show orgs org Acme sd-wan sites
Site         Site-ID  Tunnels up  MP-BGP  LAN prefix
Branch1      101      Internet,MPLS,LTE  Established  10.1.1.0/24
Branch2      102      Internet,MPLS,LTE  Established  10.1.2.0/24</pre>
<p>The overlay line says Idle with an explicit reason. The Controller list shows Kolkata is simply absent from Acme. The tunnel table is empty because, in the course model, tunnels are not evaluated until the organization matches. On real VOS, you would read the same story in the sd-wan session state and the logs.</p>

<h3>Step 2: fix without touching circuits</h3>
<p>The instruction "without touching the circuits" means: do not change IP addresses, interface enable state or transport VR routes. Only the overlay identity moves. Remove the Guest statements and recreate them under Acme:</p>
<pre class="code">admin@Branch3-cli&gt; configure
admin@Branch3-cli% delete orgs org Guest
admin@Branch3-cli% set orgs org Acme sd-wan site-id 103
admin@Branch3-cli% set orgs org Acme sd-wan controllers 198.51.100.20
admin@Branch3-cli% set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
admin@Branch3-cli% set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
admin@Branch3-cli% set orgs org Acme sd-wan wan-interfaces vni-0/2 transport LTE
admin@Branch3-cli% commit
Commit complete.
admin@Branch3-cli% exit</pre>
<p>Why recreate all of them? Everything that sat under <code>orgs org Guest</code> (site-id, Controller, WAN mappings) disappears with the delete, so each item must be set again under Acme. Forgetting the three WAN mappings would leave a site with an organization but no tunnels, which is a different fault. Check <code>show | compare</code> before you commit to see exactly which lines go and come.</p>

<h3>Step 3: verify</h3>
<pre class="out">admin@Branch3-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 103   Hostname: Branch3
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    up      -
LTE        vni-0/2    up      -

PC3&gt; ping 10.1.1.10
64 bytes from 10.1.1.10: icmp_seq=1 ttl=63 time=24 ms
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Notice the show command now uses <code>org Acme</code>. The ping from PC3 to PC1 proves two overlays are Established, the organizations match, and both LAN prefixes are known.</p>
<div class="eg"><p><b>Why LAN reachability needs both ends.</b> Delhi learns 10.1.3.0/24 only after Kolkata is Established in Acme, and Kolkata learns 10.1.1.0/24 for the same reason. If Delhi were in Acme and Kolkata in Guest, neither prefix would travel.</p></div>

<h3>How to prevent it</h3>
<ul>
<li>Use Director templates so the organization name comes from one place.</li>
<li>Use the staging and bind-data workflow from the onboarding module instead of typing by hand.</li>
<li>Review <code>show | compare</code> output before commit.</li>
<li>Add a post-change check: the Controller sites list must show the new site under the right organization.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Changing the Controller to Guest instead of fixing the branch (this would disconnect Delhi and Bengaluru); retyping only the site-id and forgetting the WAN mappings; assuming a case-insensitive match (acme and Acme are different names).</p></div>
<div class="exam"><p><b>Exam trap.</b> When every tunnel looks fine but the session stays down, check organization, site-id and Controller address before opening a carrier ticket.</p></div>

<div class="scn"><h4>Guest in the corporate WAN</h4><p>A pilot site was built by a contractor from a trial template that used the organization Guest. The site sat Idle for two days while three teams checked the carrier. A senior engineer read the one-line reason on the branch and compared it with the Controller organization. Re-creating the identity under Acme took five minutes.</p><p><b>Lesson:</b> read the reason text first, then escalate.</p></div>
<div class="iv"><p class="q">"A branch has working circuits but will not come online in the overlay. How do you troubleshoot?"</p><p>I confirm underlay reachability to the Controller, then check the SD-WAN identity: organization name, site-id, Controller address and WAN-to-transport mappings. The branch overview shows the reason, for example "Controller organization is Acme, branch uses Guest". I correct the identity, commit, and verify the Controller site list and a user-side ping.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organization, site-id and Controller address must match the Controller view; otherwise the MP-BGP session stays Idle.</li>
<li>Underlay can be perfect while the identity is wrong.</li>
<li>The reason line shows the mismatch: Controller organization versus branch organization.</li>
<li>Fix by deleting the wrong organization and recreating site-id, Controller and WAN mappings under Acme.</li>
<li>Prove with the Controller sites list and a PC3 to PC1 ping.</li>
</ul></div>
`,hi:`
<p>Ek visitor socho jo sahi building mein aata hai par reception ko aisi company ka naam batata hai jo wahan rent par nahi hai. Guard politely behave karta hai aur lift chalti hai, par koi visitor ko andar nahi jaane deta. Physical sab theek hai; identity galat hai. Yahi tenant mismatch hai.</p>

<h3>Yeh fault sneaky kyun hai</h3>
<p>Tenant (organization) mismatch circuit level par invisible hai. Interfaces up hain, addresses sahi hain, underlay routes chalte hain, Controller reachable hai. Transport par depend karne wali saari tunnel conditions pass hoti hain. Jo fail hota hai woh <b>logical</b> join hai: branch kehti hai "main organization Guest ki hoon" aur Controller jawab deta hai "meri organization Acme hai". MP-BGP session establish nahi ho sakta aur koi routes exchange nahi hote. Jo technician sirf cables aur carriers check karta hai woh ghante kho sakta hai.</p>

<h3>Ticket</h3>
<p>"Kolkata manually organization Guest mein configure hua, Acme mein nahi. Controller side ka reason padho, circuits ko chhue bina identity Acme mein move karo aur prove karo ki Kolkata Delhi tak pahunchta hai." Kolkata Branch3 hai, site-id 103, LAN 10.1.3.0/24, PC3 10.1.3.10.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Tenant mismatch">
<rect x="20" y="60" width="150" height="80" rx="8" fill="#ddd6fe"/><text x="95" y="88" text-anchor="middle" class="svg-ink" font-size="14">Branch3 Kolkata</text><text x="95" y="108" text-anchor="middle" class="svg-accent" font-size="12">orgs org Guest</text><text x="95" y="126" text-anchor="middle" class="svg-muted" font-size="11">site-id 103</text>
<rect x="470" y="60" width="150" height="80" rx="8" fill="#bae6fd"/><text x="545" y="88" text-anchor="middle" class="svg-ink" font-size="14">Controller-1</text><text x="545" y="108" text-anchor="middle" class="svg-accent" font-size="12">orgs org Acme</text><text x="545" y="126" text-anchor="middle" class="svg-muted" font-size="11">sirf Acme jaanta hai</text>
<line x1="170" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="12">underlay theek, join refused</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Controller organization is Acme, branch uses Guest</text>
</svg><p class="cap">Wires aur routes healthy hain; identity match nahi karti.</p></div>

<h3>Step 1: reason padho</h3>
<p>Branch3 par organization Guest hai, isliye show command Guest ka naam leta hai:</p>
<pre class="out">admin@Branch3-cli&gt; show orgs org Guest sd-wan brief
Org: Guest   Site-ID: 103   Hostname: Branch3
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): <span class="hl">Idle  [Controller organization is Acme, branch uses Guest]</span>
Transport  Interface  Tunnel  Reason

admin@Controller-1-cli&gt; show orgs org Acme sd-wan sites
Site         Site-ID  Tunnels up  MP-BGP  LAN prefix
Branch1      101      Internet,MPLS,LTE  Established  10.1.1.0/24
Branch2      102      Internet,MPLS,LTE  Established  10.1.2.0/24</pre>
<p>Overlay line Idle kehti hai explicit reason ke saath. Controller list dikhati hai ki Kolkata Acme se simply gayab hai. Tunnel table khali hai kyunki course model mein organization match hone tak tunnels evaluate nahi hote. Real VOS par wahi kahani sd-wan session state aur logs mein padhoge.</p>

<h3>Step 2: circuits ko chhue bina fix karo</h3>
<p>"Circuits ko chhue bina" ka matlab: IP addresses, interface enable state ya transport VR routes mat badlo. Sirf overlay identity move hoti hai. Guest ke statements hatao aur Acme ke under dobara banao:</p>
<pre class="code">admin@Branch3-cli&gt; configure
admin@Branch3-cli% delete orgs org Guest
admin@Branch3-cli% set orgs org Acme sd-wan site-id 103
admin@Branch3-cli% set orgs org Acme sd-wan controllers 198.51.100.20
admin@Branch3-cli% set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
admin@Branch3-cli% set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
admin@Branch3-cli% set orgs org Acme sd-wan wan-interfaces vni-0/2 transport LTE
admin@Branch3-cli% commit
Commit complete.
admin@Branch3-cli% exit</pre>
<p>Sab dobara kyun banaye? <code>orgs org Guest</code> ke neeche jo kuch tha (site-id, Controller, WAN mappings) woh delete ke saath chala jaata hai, isliye har item Acme ke under dobara set karna padta hai. Teen WAN mappings bhool gaye to site ke paas organization hogi par tunnels nahi, jo ek alag fault hai. Commit se pehle <code>show | compare</code> dekho taaki pata chale exactly kaunsi lines jaati aur aati hain.</p>

<h3>Step 3: verify</h3>
<pre class="out">admin@Branch3-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 103   Hostname: Branch3
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    up      -
LTE        vni-0/2    up      -

PC3&gt; ping 10.1.1.10
64 bytes from 10.1.1.10: icmp_seq=1 ttl=63 time=24 ms
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Dhyaan do ki show command ab <code>org Acme</code> use karta hai. PC3 se PC1 ka ping prove karta hai ki dono overlays Established hain, organizations match karti hain aur dono LAN prefixes known hain.</p>
<div class="eg"><p><b>LAN reachability ko dono ends kyun chahiye.</b> Delhi 10.1.3.0/24 tabhi seekhta hai jab Kolkata Acme mein Established ho, aur Kolkata 10.1.1.0/24 usi wajah se. Agar Delhi Acme mein ho aur Kolkata Guest mein, to koi prefix travel nahi karega.</p></div>

<h3>Kaise roke</h3>
<ul>
<li>Director templates use karo taaki organization ka naam ek hi jagah se aaye.</li>
<li>Haath se type karne ki jagah onboarding module ka staging aur bind-data workflow use karo.</li>
<li>Commit se pehle <code>show | compare</code> output review karo.</li>
<li>Post-change check jodo: Controller sites list mein nayi site sahi organization ke under dikhni chahiye.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Branch fix karne ki jagah Controller ko Guest karna (isse Delhi aur Bengaluru disconnect ho jaayenge); sirf site-id dobara type karke WAN mappings bhool jaana; case-insensitive match maan lena (acme aur Acme alag naam hain).</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab har tunnel theek dikhe par session down rahe, to carrier ticket kholne se pehle organization, site-id aur Controller address check karo.</p></div>

<div class="scn"><h4>Corporate WAN mein Guest</h4><p>Ek pilot site contractor ne trial template se banayi jisme organization Guest thi. Site do din Idle rahi jabki teen teams carrier check karti rahi. Ek senior engineer ne branch par ek line ka reason padha aur Controller organization se compare kiya. Identity Acme ke under dobara banane mein paanch minute lage.</p><p><b>Seekh:</b> pehle reason text padho, phir escalate karo.</p></div>
<div class="iv"><p class="q">"Branch ke circuits chal rahe hain par woh overlay mein online nahi aa rahi. Troubleshoot kaise karoge?"</p><p>Pehle Controller tak underlay reachability confirm karta hoon, phir SD-WAN identity check karta hoon: organization naam, site-id, Controller address aur WAN-to-transport mappings. Branch overview reason dikhata hai, jaise "Controller organization is Acme, branch uses Guest". Identity sahi karta hoon, commit karta hoon, aur Controller site list aur user-side ping se verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organization, site-id aur Controller address Controller ke view se match karne chahiye; warna MP-BGP session Idle rehta hai.</li>
<li>Underlay perfect ho sakta hai jabki identity galat ho.</li>
<li>Reason line mismatch dikhati hai: Controller organization versus branch organization.</li>
<li>Fix: galat organization delete karo aur site-id, Controller aur WAN mappings Acme ke under dobara banao.</li>
<li>Controller sites list aur PC3 se PC1 ping se prove karo.</li>
</ul></div>
`}};export{e as default};