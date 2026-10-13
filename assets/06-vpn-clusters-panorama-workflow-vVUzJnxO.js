var e={id:`vpn-clusters-panorama-workflow`,h:{en:`VPN clusters, Auto VPN and the Panorama workflow`,hi:`VPN clusters, Auto VPN aur Panorama workflow`},body:{en:`
<p>With 40 stores and two data centers you do not want to configure 80 IPsec tunnels by hand. Auto VPN in the SD-WAN plugin does it for you: you place firewalls in a <b>VPN cluster</b>, and Panorama creates the IKE and IPsec connections between the sites according to the cluster topology. This chapter explains clusters, their limits and the order of work in Panorama, from registering devices to a working fabric.</p>
<h3>Analogy: a seating plan for a wedding</h3>
<p>The planner does not tell each guest where to sit one by one. She decides the tables (clusters), who is the host of each table (hubs) and who are guests (branches), and the hotel staff (Panorama) lays everything out. If a host table is full, guests go to the second-priority table.</p>
<h3>VPN cluster facts</h3>
<table class="cmp"><tr><th>Item</th><th>What the documentation says</th></tr>
<tr><td><b>Purpose</b></td><td>Creates the required IKE and IPsec VPN connections between the sites, based on the topology type you choose</td></tr>
<tr><td><b>Hub-Spoke</b></td><td>A central firewall acts as the gateway; traffic between branches passes through the hub before reaching the target branch</td></tr>
<tr><td><b>Mesh</b></td><td>Available from plugin 2.0.1; branches communicate directly with each other, and hubs can still be included</td></tr>
<tr><td><b>VPN address pool</b></td><td>For branches, up to 20 IP address ranges; Panorama uses them for tunnel addresses and branches draw from the largest range first</td></tr>
<tr><td><b>Hubs per cluster</b></td><td>Maximum of four</td></tr>
<tr><td><b>Hub priority</b></td><td>With several hubs, give each a priority from 1 to 4; the lower the value, the higher the priority and local preference. HA hub pairs share the same priority</td></tr>
<tr><td><b>DIA AnyPath</b></td><td>Maximum of four hubs can take part in failover (eight if they are HA pairs)</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="VPN cluster">
<rect x="20" y="20" width="600" height="230" rx="14" fill="#f1f5f9"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">VPN cluster HARBOR-FABRIC (hub-spoke)</text>
<rect x="60" y="60" width="150" height="45" rx="8" fill="#bae6fd"/><text x="135" y="80" text-anchor="middle" class="svg-ink" font-size="12">Hub DC-EAST</text><text x="135" y="96" text-anchor="middle" class="svg-muted" font-size="10">priority 1</text>
<rect x="430" y="60" width="150" height="45" rx="8" fill="#bae6fd"/><text x="505" y="80" text-anchor="middle" class="svg-ink" font-size="12">Hub DC-WEST</text><text x="505" y="96" text-anchor="middle" class="svg-muted" font-size="10">priority 2</text>
<rect x="40" y="180" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="100" y="205" text-anchor="middle" class="svg-ink" font-size="12">STORE-001</text>
<rect x="260" y="180" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">STORE-007</text>
<rect x="480" y="180" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="205" text-anchor="middle" class="svg-ink" font-size="12">STORE-020</text>
<line x1="100" y1="180" x2="135" y2="105" stroke="#2563eb" stroke-width="2"/><line x1="100" y1="180" x2="505" y2="105" stroke="#93c5fd" stroke-dasharray="4"/>
<line x1="320" y1="180" x2="135" y2="105" stroke="#2563eb" stroke-width="2"/><line x1="320" y1="180" x2="505" y2="105" stroke="#93c5fd" stroke-dasharray="4"/>
<line x1="540" y1="180" x2="135" y2="105" stroke="#93c5fd" stroke-dasharray="4"/><line x1="540" y1="180" x2="505" y2="105" stroke="#2563eb" stroke-width="2"/>
</svg><p class="cap">Every branch builds tunnels to the hubs in the cluster. Solid lines are the preferred hub, dashed lines the alternative.</p></div>
<h3>The Panorama workflow, in order</h3>
<p>The documentation's pages follow this order. I describe it without invented field names.</p>
<ol>
<li><b>Prepare Panorama.</b> Install the SD-WAN plugin and check that the plugin version supports the features you need (mesh, SaaS monitoring, Prisma Access hubs).</li>
<li><b>Add the firewalls as managed devices.</b> The documentation has a page titled Add Your SD-WAN Firewalls as Managed Devices.</li>
<li><b>Plan the topology.</b> Choose hub-spoke or mesh, the number of hubs and their priorities, and the VPN address pool ranges. The documentation page is titled Plan Your Topology for SD-WAN with Auto VPN.</li>
<li><b>Define the SD-WAN building blocks.</b> Link tags, interface profiles, path quality profiles, traffic distribution profiles, SaaS quality and error correction profiles (chapters 3 to 5).</li>
<li><b>Add the hub and branch firewalls.</b> The documentation has a page called Add SD-WAN Branch or Hub Firewall: each firewall is registered into the SD-WAN plugin with its role, and Panorama uses it to generate the SD-WAN configuration.</li>
<li><b>Create the VPN cluster</b> and place the hubs and branches in it. Panorama creates the tunnels.</li>
<li><b>Create SD-WAN policy rules</b> (chapter 5), commit and push.</li>
<li><b>Verify</b> in the Panorama SD-WAN monitoring dashboards and with the firewall CLI (chapter 7).</li>
</ol>
<h3>Prisma Access as a hub</h3>
<p>From SD-WAN plugin 2.2.0 the documentation lists support for mixed topologies in which on-premises SD-WAN firewalls connect to Prisma Access cloud hubs. This is how a branch on PAN-OS SD-WAN reaches cloud-delivered security, and it is a bridge to the Unified SASE domain.</p>
<div class="eg"><p><b>Worked example: pool sizing.</b> Harbor Foods has 40 branches and wants a tunnel address for each branch tunnel. A pool of up to 20 ranges is available, and branches draw from the largest range first, so one generous range (for instance a documentation-style 192.0.2.0/24 in the story) plus smaller overflow ranges is simpler than many equal small ones. Hubs DC-EAST and DC-WEST get priorities 1 and 2; STORE-007 prefers DC-EAST and fails over to DC-WEST.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Planning more than four hubs in a cluster. Giving the HA pair of a hub different priorities. Skipping the version check for mesh. Defining profiles after creating the cluster and wondering why rules cannot reference them.</p></div>
<div class="exam"><p><b>Exam trap.</b> "What does Auto VPN do?" It creates IKE and IPsec VPN connections between SD-WAN firewalls from the cluster topology. "Lower priority value means?" Higher priority. "Maximum hubs per cluster?" Four.</p></div>
<div class="scn"><h4>The fifth hub</h4><p>A design for a global retailer lists five hubs in one cluster. The documented limit is four. The designer splits the estate into two clusters by region, each with at most four hubs, and uses mesh only where branch-to-branch traffic is common.</p></div>
<div class="iv"><p class="q">"How do you bring a new branch into a PAN-OS SD-WAN fabric?"</p><p>I register the firewall as a managed device in Panorama, add it as a branch in the SD-WAN plugin with its links tagged through interface profiles, put it in the VPN cluster, push the configuration and verify the tunnels and path monitoring. The policy rules already exist and reference tags, so nothing else changes.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN cluster plus Auto VPN builds the IKE and IPsec tunnels for you.</li>
<li>Hub-spoke or mesh (2.0.1 or later); up to four hubs and 20 pool ranges; lower priority value wins.</li>
<li>Workflow: plugin, managed devices, topology plan, profiles, hub and branch registration, cluster, rules, verify.</li>
<li>Prisma Access hubs are supported from plugin 2.2.0.</li>
</ul></div>
`,hi:`
<p>40 stores aur do data centers ke saath aap haath se 80 IPsec tunnels configure nahi karna chahte. SD-WAN plugin mein Auto VPN yeh kaam karta hai: aap firewalls ko <b>VPN cluster</b> mein rakhte ho, aur Panorama cluster topology ke hisaab se sites ke beech IKE aur IPsec connections banata hai. Yeh chapter clusters, unki limits aur Panorama mein kaam ka order samjhata hai, devices register karne se lekar chalte fabric tak.</p>
<h3>Analogy: shaadi ka seating plan</h3>
<p>Planner har mehmaan ko ek-ek karke nahi batati ki kahan baithna hai. Woh tables (clusters) decide karti hai, har table ka host (hubs) aur mehmaan (branches), aur hotel staff (Panorama) sab laga deta hai. Agar host table bhar jaye to mehmaan doosri priority wale table par jaate hain.</p>
<h3>VPN cluster facts</h3>
<table class="cmp"><tr><th>Item</th><th>Documentation kya kehti hai</th></tr>
<tr><td><b>Purpose</b></td><td>Aapke chune topology type ke hisaab se sites ke beech zaroori IKE aur IPsec VPN connections banata hai</td></tr>
<tr><td><b>Hub-Spoke</b></td><td>Central firewall gateway ki tarah kaam karta hai; branches ke beech traffic target branch tak pahunchne se pehle hub se guzarta hai</td></tr>
<tr><td><b>Mesh</b></td><td>Plugin 2.0.1 se available; branches ek doosre se seedha baat karte hain, aur hubs bhi shamil ho sakte hain</td></tr>
<tr><td><b>VPN address pool</b></td><td>Branches ke liye 20 tak IP address ranges; Panorama unhe tunnel addresses ke liye use karta hai aur branches sabse bade range se pehle lete hain</td></tr>
<tr><td><b>Hubs per cluster</b></td><td>Maximum chaar</td></tr>
<tr><td><b>Hub priority</b></td><td>Kai hubs hon to har ek ko 1 se 4 priority do; value jitni kam, priority aur local preference utni zyada. HA hub pairs ki priority same hoti hai</td></tr>
<tr><td><b>DIA AnyPath</b></td><td>Maximum chaar hubs failover mein hissa le sakte hain (HA pairs hon to aath)</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="VPN cluster">
<rect x="20" y="20" width="600" height="230" rx="14" fill="#f1f5f9"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">VPN cluster HARBOR-FABRIC (hub-spoke)</text>
<rect x="60" y="60" width="150" height="45" rx="8" fill="#bae6fd"/><text x="135" y="80" text-anchor="middle" class="svg-ink" font-size="12">Hub DC-EAST</text><text x="135" y="96" text-anchor="middle" class="svg-muted" font-size="10">priority 1</text>
<rect x="430" y="60" width="150" height="45" rx="8" fill="#bae6fd"/><text x="505" y="80" text-anchor="middle" class="svg-ink" font-size="12">Hub DC-WEST</text><text x="505" y="96" text-anchor="middle" class="svg-muted" font-size="10">priority 2</text>
<rect x="40" y="180" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="100" y="205" text-anchor="middle" class="svg-ink" font-size="12">STORE-001</text>
<rect x="260" y="180" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">STORE-007</text>
<rect x="480" y="180" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="540" y="205" text-anchor="middle" class="svg-ink" font-size="12">STORE-020</text>
<line x1="100" y1="180" x2="135" y2="105" stroke="#2563eb" stroke-width="2"/><line x1="100" y1="180" x2="505" y2="105" stroke="#93c5fd" stroke-dasharray="4"/>
<line x1="320" y1="180" x2="135" y2="105" stroke="#2563eb" stroke-width="2"/><line x1="320" y1="180" x2="505" y2="105" stroke="#93c5fd" stroke-dasharray="4"/>
<line x1="540" y1="180" x2="135" y2="105" stroke="#93c5fd" stroke-dasharray="4"/><line x1="540" y1="180" x2="505" y2="105" stroke="#2563eb" stroke-width="2"/>
</svg><p class="cap">Har branch cluster ke hubs tak tunnels banata hai. Solid lines preferred hub, dashed lines alternative.</p></div>
<h3>Panorama workflow, order mein</h3>
<p>Documentation ke pages isi order ko follow karte hain. Main ise bina invented field names ke describe karta hoon.</p>
<ol>
<li><b>Panorama taiyar karo.</b> SD-WAN plugin install karo aur check karo ki plugin version aapke chahiye features (mesh, SaaS monitoring, Prisma Access hubs) support karta hai.</li>
<li><b>Firewalls ko managed devices ke roop mein jodo.</b> Documentation mein Add Your SD-WAN Firewalls as Managed Devices naam ka page hai.</li>
<li><b>Topology plan karo.</b> Hub-spoke ya mesh, hubs ki sankhya aur unki priorities, aur VPN address pool ranges chuno. Documentation page ka naam Plan Your Topology for SD-WAN with Auto VPN hai.</li>
<li><b>SD-WAN building blocks define karo.</b> Link tags, interface profiles, path quality profiles, traffic distribution profiles, SaaS quality aur error correction profiles (chapters 3 se 5).</li>
<li><b>Hub aur branch firewalls jodo.</b> Documentation mein Add SD-WAN Branch or Hub Firewall naam ka page hai: har firewall apne role ke saath SD-WAN plugin mein register hota hai, aur Panorama use SD-WAN configuration generate karne ke liye use karta hai.</li>
<li><b>VPN cluster banao</b> aur hubs tatha branches ko usme rakho. Panorama tunnels banata hai.</li>
<li><b>SD-WAN policy rules banao</b> (chapter 5), commit aur push karo.</li>
<li><b>Verify karo</b> Panorama SD-WAN monitoring dashboards mein aur firewall CLI se (chapter 7).</li>
</ol>
<h3>Prisma Access hub ke roop mein</h3>
<p>SD-WAN plugin 2.2.0 se documentation un mixed topologies ke support ki list deti hai jisme on-premises SD-WAN firewalls Prisma Access cloud hubs se connect hote hain. Is tarah PAN-OS SD-WAN par branch cloud-delivered security tak pahunchta hai, aur yeh Unified SASE domain ka pul hai.</p>
<div class="eg"><p><b>Worked example: pool sizing.</b> Harbor Foods ke 40 branches hain aur har branch tunnel ke liye tunnel address chahiye. 20 tak ranges ka pool available hai, aur branches sabse bade range se pehle lete hain, isliye ek udaar range (jaise kahani mein documentation-style 192.0.2.0/24) plus chhote overflow ranges, kai barabar chhote ranges se saral hai. Hubs DC-EAST aur DC-WEST ko priorities 1 aur 2 milti hain; STORE-007 DC-EAST prefer karta hai aur DC-WEST par failover karta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Ek cluster mein chaar se zyada hubs plan karna. Hub ke HA pair ko alag priorities dena. Mesh ke liye version check chhodna. Cluster banane ke baad profiles define karna aur sochna ki rules unhe refer kyun nahi kar pate.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Auto VPN kya karta hai?" Cluster topology se SD-WAN firewalls ke beech IKE aur IPsec VPN connections banata hai. "Kam priority value ka matlab?" Zyada priority. "Cluster mein maximum hubs?" Chaar.</p></div>
<div class="scn"><h4>Paanchva hub</h4><p>Ek global retailer ka design ek cluster mein paanch hubs list karta hai. Documented limit chaar hai. Designer estate ko region ke hisaab se do clusters mein baantta hai, har ek mein adhiktam chaar hubs, aur mesh sirf wahan use karta hai jahan branch-to-branch traffic aam hai.</p></div>
<div class="iv"><p class="q">"PAN-OS SD-WAN fabric mein naya branch kaise laate ho?"</p><p>Main firewall ko Panorama mein managed device ke roop mein register karta hoon, SD-WAN plugin mein branch ke roop mein jodta hoon jisme uske links interface profiles se tagged hain, VPN cluster mein rakhta hoon, configuration push karta hoon aur tunnels tatha path monitoring verify karta hoon. Policy rules pehle se hain aur tags ko refer karte hain, isliye aur kuch nahi badalta.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN cluster plus Auto VPN IKE aur IPsec tunnels khud banata hai.</li>
<li>Hub-spoke ya mesh (2.0.1 ya baad); chaar hubs tak aur 20 pool ranges; kam priority value jeetti hai.</li>
<li>Workflow: plugin, managed devices, topology plan, profiles, hub aur branch registration, cluster, rules, verify.</li>
<li>Prisma Access hubs plugin 2.2.0 se supported hain.</li>
</ul></div>
`}};export{e as default};