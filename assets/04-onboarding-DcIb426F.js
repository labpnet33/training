var e={id:`onboarding`,h:{en:`Onboarding branches to Prisma Access: SASE connectivity, tunnels and routing`,hi:`Branches ko Prisma Access par onboard karna: SASE connectivity, tunnels aur routing`},body:{en:`
<p>Connecting a branch to Prisma Access is like adding a new phone line to a switchboard. You do the one-time setup of the switchboard first (numbering plan, rules), and then each new line takes a few clicks. Palo Alto Networks calls the native method <b>SASE Easy Onboarding</b>: Prisma SD-WAN creates the IPsec tunnels from the ION circuits to Prisma Access, and sets up BGP, without a CloudBlade.</p>
<h3>Prerequisites (check them first)</h3>
<ul>
<li>Prisma SD-WAN managed by Strata Cloud Manager, with ION devices (physical or virtual) on software 5.6 or later.</li>
<li>A branch site that already exists, with an assigned ION and a circuit attached to a WAN interface (psd-deploy).</li>
<li>Prisma Access, cloud managed or Panorama managed. Cloud managed needs the aggregate bandwidth model enabled per compute location; the onboarding wizard page I reviewed also allows site-based licensing.</li>
<li>Both products in the same tenant service group.</li>
<li>Panorama managed only: Cloud Services plugin 5.2.0-h24 or later, a service account with the superuser role for all apps and services, and the client details stored on Panorama. The documentation gives a command of the form shown below.</li>
<li>No existing CloudBlade integration for the same purpose. The documentation says to deactivate the CloudBlade and contact Palo Alto Networks support first.</li>
</ul>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Panorama-managed Prisma Access only: store the service-account details once</span>
request plugins cloud_services prisma-access store-client-details client-id &lt;client-id&gt; client-secret &lt;client-secret&gt; tsg-id &lt;tsg-id&gt;</pre>
<h3>Step 1: one-time SASE connectivity</h3>
<p>This step defines the shared settings that every onboarded site will use. It is done once per tenant.</p>
<h4>Portal walk-through (not run in the simulator)</h4>
<ol>
<li>In Strata Cloud Manager open Configuration, Resources, SASE Connectivity.</li>
<li>Enter the <b>ION peering default local AS number</b>. A private AS number is recommended. This is the BGP local AS used for quick onboarding of ECMP sites.</li>
<li>Choose the <b>deployment mode</b>: Private-App-Access (the default, private applications and internet), Internet-Only (internet only, routes advertised with BGP no-advertise), or Internet-Only-With-Mobile-User-Access (internet and mobile user access, routes with no-export).</li>
<li>Enter the <b>tunnel inner IP pool</b> in IP/mask form. It must be unused and unique across the whole network and must not overlap the Palo Alto service infrastructure subnet. Each tunnel uses a /31 from this pool.</li>
<li>Optionally bind the tunnels to a <b>security zone</b>, and select a Panorama tenant if you use a Panorama-managed Prisma Access.</li>
<li>Save. The documentation notes that a change of deployment mode affects only new or modified tunnels.</li>
</ol>
<h3>Step 2: connect a site</h3>
<h4>Portal walk-through (not run in the simulator)</h4>
<ol>
<li>Open Configuration, Prisma SD-WAN, Branch Sites and choose the site. In the Prisma Access Connection area click <b>Connect to Prisma Access</b>.</li>
<li>Pick the <b>primary Prisma Access location</b> (the screen recommends the nearest from the site's coordinates) and the <b>primary IPsec termination node</b>. Optionally add a secondary location and node. With site-based licensing you choose a site type (25 Mbps to 2.5 Gbps) and may allow a secondary location as backup.</li>
<li>Click <b>Connect Sites</b> to configure tunnels. The documentation says one tunnel is created per circuit, to a maximum of four circuits per site.</li>
<li>Open Dynamic Routing Options. You can summarise mobile user routes before advertising, advertise a default route to LAN peers, or mark routes do-not-export. The documentation explains that because the ION uses path policy to steer traffic to Prisma Access, it does not need to learn these routes to forward; the options matter when you must pass Prisma Access routes to a LAN routing peer.</li>
<li>With site-based licensing, review the QoS profile. Save and exit.</li>
</ol>
<p>You can also create a brand-new branch and connect it in one wizard (Configuration, Onboarding, Onboard Branch Sites, Configure, Add Prisma SD-WAN Branch Site). The wizard collects site name, address, domain and policy stacks (path, performance, QoS, security and NAT), circuits and devices, and then the Prisma Access locations. The result is the same objects.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="diagram">
<rect x="10" y="60" width="150" height="130" rx="10" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="13">br-pune-01</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="11">circuit ISP-A</text><text x="85" y="130" text-anchor="middle" class="svg-muted" font-size="11">circuit ISP-B</text><text x="85" y="152" text-anchor="middle" class="svg-muted" font-size="11">BGP local AS</text>
<rect x="260" y="30" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="345" y="56" text-anchor="middle" class="svg-ink" font-size="12">Primary location</text><text x="345" y="74" text-anchor="middle" class="svg-muted" font-size="11">IPsec termination node</text>
<rect x="260" y="160" width="170" height="60" rx="10" fill="#e2e8f0"/><text x="345" y="186" text-anchor="middle" class="svg-ink" font-size="12">Secondary location</text><text x="345" y="204" text-anchor="middle" class="svg-muted" font-size="11">backup node</text>
<rect x="500" y="90" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="565" y="120" text-anchor="middle" class="svg-ink" font-size="12">Internet, SaaS,</text><text x="565" y="138" text-anchor="middle" class="svg-ink" font-size="12">mobile users</text>
<line x1="160" y1="90" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><text x="170" y="68" class="svg-accent" font-size="11">tunnel 1 (/31)</text>
<line x1="160" y1="160" x2="260" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/><text x="170" y="186" class="svg-accent" font-size="11">tunnel 2 (/31)</text>
<line x1="430" y1="60" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><line x1="430" y1="190" x2="500" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One tunnel per circuit, each using a /31 from the inner pool. The primary location carries the traffic; a secondary location, if chosen, is the backup.</p></div>
<h3>Verify, change and disconnect</h3>
<ul>
<li><b>Status:</b> in Branch Sites the SASE Connection column shows the state of the connection.</li>
<li><b>Tunnels:</b> open the site, Overlay Connections, Branch-Standard VPN to see the tunnels and the Prisma Access peer details.</li>
<li><b>Change:</b> in the Prisma Access Connectivity section use Edit Connectivity to change locations, nodes, site type, circuits, routing options or QoS profile.</li>
<li><b>Disconnect:</b> Disconnect from Prisma Access removes the tunnel configuration but keeps the SASE configuration objects (locations, circuits) so you can reconnect easily.</li>
</ul>
<h3>Other ways to connect</h3>
<p>The ION can also build a manual <b>standard VPN</b> to any IPsec or GRE endpoint, including Prisma Access (IKEv2 with pre-shared key or certificates). Use the native method when the prerequisites are met, because it creates both sides for you and keeps them consistent. Use a manual or older CloudBlade-based connection only when you already have it or when the native method does not fit.</p>
<div class="eg"><p><b>Worked example.</b> Harbor Retail sets the ION peering AS to a private number, the deployment mode to Private-App-Access and the inner pool to a /24 that no site uses (3 branches with 2 circuits each means about 6 tunnels, each taking a /31, so a /24 leaves plenty of room). For br-pune-01 they choose the nearest primary location, a different secondary, and connect both circuits (ISP-A and ISP-B). Branch Sites shows the connection, and Branch-Standard VPN lists two tunnels.</p></div>
<div class="warn"><p><b>Common mistakes.</b> A tunnel inner pool that overlaps a real network or the Palo Alto infrastructure subnet. Different tenant service groups. Forgetting that the WAN circuit must already be attached to the site. Leaving an old CloudBlade integration active. Assuming a deployment-mode change updates existing tunnels (it does not).</p></div>
<div class="exam"><p><b>Exam trap.</b> Minimum ION software is 5.6. One tunnel per circuit, up to four circuits per site. The inner IP pool uses a /31 per tunnel. Disconnect removes tunnels but keeps SASE objects. Both products must be in the same TSG.</p></div>
<div class="scn"><h4>Tunnels up, nothing routed</h4><p>An engineer connected br-delhi-02 and both tunnels came up, but users still could not reach the internet. The path policy had no rule that sent internet applications to the Prisma Access tunnels, so traffic kept using the local circuit with no security. They added the application path rule (chapter 5) and the traffic moved.</p><p><b>Lesson:</b> a tunnel is only the road; policy decides who drives on it.</p></div>
<div class="iv"><p class="q">"Walk me through onboarding a branch to Prisma Access."</p><p>First check the prerequisites: ION 5.6 or later, existing branch with a circuit, Prisma Access licensing, same tenant service group. Do the one-time SASE connectivity setup (local AS, deployment mode, inner IP pool). Then connect the site, choose primary and secondary locations and nodes, let the system create one tunnel per circuit with BGP, and verify the connection status and the Branch-Standard VPN tunnels. Finally add path policy to steer traffic.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SASE Easy Onboarding is native: it creates IPsec tunnels and BGP from ION circuits to Prisma Access.</li><li>Prerequisites: ION 5.6 or later, existing site and circuit, licensing, same TSG, no old CloudBlade.</li><li>One-time setup: local AS, deployment mode, inner IP pool (/31 per tunnel), optional zone.</li><li>One tunnel per circuit, maximum four per site; primary and optional secondary location.</li><li>Verify in the SASE Connection column and Branch-Standard VPN; policy still has to steer traffic.</li></ul></div>
`,hi:`
<p>Branch ko Prisma Access se jodna switchboard mein nayi phone line jodne jaisa hai. Pehle switchboard ka one-time setup karte ho (numbering plan, rules), phir har nayi line ke liye kuch clicks. Palo Alto Networks native method ko <b>SASE Easy Onboarding</b> kehta hai: Prisma SD-WAN ION circuits se Prisma Access tak IPsec tunnels banata hai aur BGP set up karta hai, CloudBlade ke bina.</p>
<h3>Prerequisites (pehle check karo)</h3>
<ul>
<li>Strata Cloud Manager se managed Prisma SD-WAN, ION devices (physical ya virtual) software 5.6 ya baad par.</li>
<li>Pehle se maujood branch site, jis par ION assign ho aur WAN interface par circuit attach ho (psd-deploy).</li>
<li>Prisma Access, cloud managed ya Panorama managed. Cloud managed ke liye har compute location par aggregate bandwidth model enable chahiye; jo onboarding wizard page maine review kiya woh site-based licensing bhi allow karta hai.</li>
<li>Dono products ek hi tenant service group mein.</li>
<li>Sirf Panorama managed: Cloud Services plugin 5.2.0-h24 ya baad, saare apps aur services ke liye superuser role wala service account, aur Panorama par stored client details. Documentation neeche dikhaye form ka command deti hai.</li>
<li>Usi purpose ke liye koi maujooda CloudBlade integration nahi. Documentation kehti hai pehle CloudBlade deactivate karo aur Palo Alto Networks support se contact karo.</li>
</ul>
<h4>Reference configuration (not run in the simulator)</h4>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
<span class="c">! Panorama-managed Prisma Access only: store the service-account details once</span>
request plugins cloud_services prisma-access store-client-details client-id &lt;client-id&gt; client-secret &lt;client-secret&gt; tsg-id &lt;tsg-id&gt;</pre>
<h3>Step 1: one-time SASE connectivity</h3>
<p>Yeh step woh shared settings tay karta hai jo har onboard hone wali site use karegi. Yeh har tenant ke liye ek baar hota hai.</p>
<h4>Portal walk-through (not run in the simulator)</h4>
<ol>
<li>Strata Cloud Manager mein Configuration, Resources, SASE Connectivity kholo.</li>
<li><b>ION peering default local AS number</b> daalo. Private AS number recommend kiya jaata hai. Yeh ECMP sites ke quick onboarding ke liye BGP local AS hai.</li>
<li><b>Deployment mode</b> chuno: Private-App-Access (default, private applications aur internet), Internet-Only (sirf internet, routes BGP no-advertise ke saath), ya Internet-Only-With-Mobile-User-Access (internet aur mobile user access, routes no-export ke saath).</li>
<li><b>Tunnel inner IP pool</b> IP/mask form mein daalo. Yeh unused aur poore network mein unique hona chahiye aur Palo Alto service infrastructure subnet se overlap nahi karna chahiye. Har tunnel is pool se ek /31 leta hai.</li>
<li>Optionally tunnels ko <b>security zone</b> se bind karo, aur Panorama-managed Prisma Access ho to Panorama tenant chuno.</li>
<li>Save karo. Documentation note karti hai ki deployment mode badalne ka asar sirf naye ya modified tunnels par hota hai.</li>
</ol>
<h3>Step 2: site connect karo</h3>
<h4>Portal walk-through (not run in the simulator)</h4>
<ol>
<li>Configuration, Prisma SD-WAN, Branch Sites kholo aur site chuno. Prisma Access Connection area mein <b>Connect to Prisma Access</b> par click karo.</li>
<li><b>Primary Prisma Access location</b> (screen site ke coordinates se sabse paas wala recommend karti hai) aur <b>primary IPsec termination node</b> chuno. Optionally secondary location aur node jodo. Site-based licensing mein site type (25 Mbps se 2.5 Gbps) chunte ho aur backup ke roop mein secondary location allow kar sakte ho.</li>
<li>Tunnels configure karne ke liye <b>Connect Sites</b> par click karo. Documentation kehti hai har circuit ke liye ek tunnel banta hai, per site maximum chaar circuits tak.</li>
<li>Dynamic Routing Options kholo. Aap mobile user routes ko advertise karne se pehle summarise kar sakte ho, LAN peers ko default route advertise kar sakte ho, ya routes ko do-not-export mark kar sakte ho. Documentation samjhati hai ki ION path policy se traffic Prisma Access ko steer karta hai, isliye forward karne ke liye use yeh routes seekhne ki zaroorat nahi; yeh options tab matter karte hain jab Prisma Access routes ko LAN routing peer tak pahunchana ho.</li>
<li>Site-based licensing mein QoS profile review karo. Save and exit karo.</li>
</ol>
<p>Aap ek hi wizard mein bilkul naya branch banakar connect bhi kar sakte ho (Configuration, Onboarding, Onboard Branch Sites, Configure, Add Prisma SD-WAN Branch Site). Wizard site name, address, domain aur policy stacks (path, performance, QoS, security aur NAT), circuits aur devices, aur phir Prisma Access locations collect karta hai. Result wahi objects hain.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="diagram">
<rect x="10" y="60" width="150" height="130" rx="10" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="13">br-pune-01</text><text x="85" y="112" text-anchor="middle" class="svg-muted" font-size="11">circuit ISP-A</text><text x="85" y="130" text-anchor="middle" class="svg-muted" font-size="11">circuit ISP-B</text><text x="85" y="152" text-anchor="middle" class="svg-muted" font-size="11">BGP local AS</text>
<rect x="260" y="30" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="345" y="56" text-anchor="middle" class="svg-ink" font-size="12">Primary location</text><text x="345" y="74" text-anchor="middle" class="svg-muted" font-size="11">IPsec termination node</text>
<rect x="260" y="160" width="170" height="60" rx="10" fill="#e2e8f0"/><text x="345" y="186" text-anchor="middle" class="svg-ink" font-size="12">Secondary location</text><text x="345" y="204" text-anchor="middle" class="svg-muted" font-size="11">backup node</text>
<rect x="500" y="90" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="565" y="120" text-anchor="middle" class="svg-ink" font-size="12">Internet, SaaS,</text><text x="565" y="138" text-anchor="middle" class="svg-ink" font-size="12">mobile users</text>
<line x1="160" y1="90" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><text x="170" y="68" class="svg-accent" font-size="11">tunnel 1 (/31)</text>
<line x1="160" y1="160" x2="260" y2="190" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3"/><text x="170" y="186" class="svg-accent" font-size="11">tunnel 2 (/31)</text>
<line x1="430" y1="60" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><line x1="430" y1="190" x2="500" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har circuit ke liye ek tunnel, har ek inner pool se /31 use karta hai. Primary location traffic uthata hai; secondary location, agar chuni ho, backup hai.</p></div>
<h3>Verify, change aur disconnect</h3>
<ul>
<li><b>Status:</b> Branch Sites mein SASE Connection column connection ki state dikhata hai.</li>
<li><b>Tunnels:</b> site kholo, Overlay Connections, Branch-Standard VPN mein tunnels aur Prisma Access peer details dikhte hain.</li>
<li><b>Change:</b> Prisma Access Connectivity section mein Edit Connectivity se locations, nodes, site type, circuits, routing options ya QoS profile badlo.</li>
<li><b>Disconnect:</b> Disconnect from Prisma Access tunnel configuration hata deta hai par SASE configuration objects (locations, circuits) rakhta hai taaki reconnect aasaan ho.</li>
</ul>
<h3>Judne ke aur tareeke</h3>
<p>ION kisi bhi IPsec ya GRE endpoint se, Prisma Access sahit, manual <b>standard VPN</b> bhi bana sakta hai (IKEv2 pre-shared key ya certificates ke saath). Prerequisites poore hon to native method use karo, kyunki woh dono sides aapke liye banata hai aur consistent rakhta hai. Manual ya purana CloudBlade-based connection tab use karo jab woh pehle se ho ya native method fit na baithe.</p>
<div class="eg"><p><b>Worked example.</b> Harbor Retail ION peering AS ko private number par, deployment mode ko Private-App-Access par aur inner pool ko aise /24 par set karta hai jo koi site use nahi karti (2 circuits wale 3 branches matlab lagbhag 6 tunnels, har ek /31 leta hai, to /24 mein bahut jagah bachti hai). br-pune-01 ke liye woh sabse paas ka primary location, alag secondary chunte hain, aur dono circuits (ISP-A aur ISP-B) connect karte hain. Branch Sites connection dikhata hai, aur Branch-Standard VPN do tunnels list karta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Tunnel inner pool jo kisi real network ya Palo Alto infrastructure subnet se overlap kare. Alag tenant service groups. Bhoolna ki WAN circuit pehle se site par attach hona chahiye. Purana CloudBlade integration active chhod dena. Maan lena ki deployment-mode change maujooda tunnels ko update karta hai (nahi karta).</p></div>
<div class="exam"><p><b>Exam trap.</b> Minimum ION software 5.6 hai. Har circuit ke liye ek tunnel, per site chaar circuits tak. Inner IP pool har tunnel ke liye /31 use karta hai. Disconnect tunnels hata deta hai par SASE objects rakhta hai. Dono products ek hi TSG mein hone chahiye.</p></div>
<div class="scn"><h4>Tunnels up, kuch route nahi hua</h4><p>Ek engineer ne br-delhi-02 ko connect kiya aur dono tunnels up aa gaye, lekin users ko internet phir bhi nahi mila. Path policy mein koi rule nahi tha jo internet applications ko Prisma Access tunnels par bheje, isliye traffic bina security ke local circuit use karta raha. Unhone application path rule jodi (chapter 5) aur traffic move ho gaya.</p><p><b>Seekh:</b> tunnel sirf raasta hai; kaun us par chalega, yeh policy tay karti hai.</p></div>
<div class="iv"><p class="q">"Mujhe branch ko Prisma Access par onboard karne ka process samjhao."</p><p>Pehle prerequisites check karta hoon: ION 5.6 ya baad, circuit wala maujooda branch, Prisma Access licensing, same tenant service group. Phir one-time SASE connectivity setup (local AS, deployment mode, inner IP pool). Phir site connect karta hoon, primary aur secondary locations aur nodes chunta hoon, system har circuit ke liye ek tunnel aur BGP banata hai, aur connection status tatha Branch-Standard VPN tunnels verify karta hoon. Aakhir mein traffic steer karne ke liye path policy jodta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>SASE Easy Onboarding native hai: ION circuits se Prisma Access tak IPsec tunnels aur BGP banata hai.</li><li>Prerequisites: ION 5.6 ya baad, maujooda site aur circuit, licensing, same TSG, koi purana CloudBlade nahi.</li><li>One-time setup: local AS, deployment mode, inner IP pool (har tunnel /31), optional zone.</li><li>Har circuit ke liye ek tunnel, per site maximum chaar; primary aur optional secondary location.</li><li>SASE Connection column aur Branch-Standard VPN mein verify karo; policy ko phir bhi traffic steer karna hai.</li></ul></div>
`}};export{e as default};