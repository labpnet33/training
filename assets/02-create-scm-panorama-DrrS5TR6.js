var e={id:`create-scm-panorama`,h:{en:`Creating a service connection in SCM and in Panorama`,hi:`SCM aur Panorama mein service connection banana`},body:{en:`
<p>Opening a corporate corridor needs two forms: one at the courier's counter (the cloud side) and one at your warehouse door (the HQ firewall). In this chapter we fill the cloud-side form in both management tools and learn what the commit must contain. The HQ firewall comes in the next chapter.</p>

<h3>Before you start</h3>
<ol>
<li>The service infrastructure exists (infrastructure subnet 10.255.0.0/24, infrastructure BGP AS 65534).</li>
<li>You know the HQ WAN IP (192.0.2.10), the HQ LAN (10.10.0.0/24) and a host to monitor (10.10.0.50).</li>
<li>You have a pre-shared key. The lab value is <code>NkPrisma2026</code>; in production use a long random secret.</li>
<li>You know which location is nearest to HQ.</li>
</ol>

<h3>Strata Cloud Manager path</h3>
<p>Configuration &gt; NGFW and Prisma Access &gt; Configuration Scope &gt; Prisma Access &gt; Service Connections &gt; Add Service Connection. Fill:</p>
<dl class="terms">
<dt>Name</dt><dd>A clear name such as SC-HQ.</dd>
<dt>Location</dt><dd>The Prisma Access location nearest to HQ.</dd>
<dt>Source NAT (Mobile Users)</dt><dd>Data Traffic and/or Infrastructure Traffic, with a pool of /25 to /32 (chapter 4).</dd>
<dt>Primary IPsec tunnel</dt><dd>Peer address (HQ 192.0.2.10), pre-shared key, IKE and IPsec crypto. A secondary tunnel is optional.</dd>
<dt>Tunnel Monitoring</dt><dd>A destination IP on the corporate network, here 10.10.0.50.</dd>
<dt>Routing</dt><dd>Static Routes or BGP.</dd>
</dl>
<p>Then use Configuration &gt; Operations &gt; Push Config.</p>

<h3>Panorama path</h3>
<p>Panorama &gt; Cloud Services &gt; Configuration &gt; Service Connection &gt; Add. Fill:</p>
<dl class="terms">
<dt>Name and Location</dt><dd>As above.</dd>
<dt>IPSec Tunnel</dt><dd>Choose an existing tunnel or create a new one in Service_Conn_Template. The tunnel must be Auto Key, IPv4 only, and its name is at most 31 characters.</dd>
<dt>Backup SC</dt><dd>Available for BGP with hot potato routing.</dd>
<dt>Secondary WAN</dt><dd>An optional second tunnel.</dd>
<dt>Tabs</dt><dd>Static Routes, BGP and Miscellaneous. Miscellaneous holds Enable Data Traffic source NAT, Infrastructure Traffic source NAT, User-ID and the IP Pool (RFC 1918, /25 to /32).</dd>
</dl>
<p>Panorama creates the Service_Conn_Template for you, along with Mobile_User_Template and Remote_Network_Template.</p>

<table class="cmp"><tr><th>Item</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Open the form</td><td>Prisma Access &gt; Service Connections &gt; Add Service Connection</td><td>Cloud Services &gt; Configuration &gt; Service Connection &gt; Add</td></tr>
<tr><td>Where tunnels live</td><td>Inside the service connection form</td><td>IPSec tunnel in Service_Conn_Template</td></tr>
<tr><td>Deliver</td><td>Push Config</td><td>Commit to Panorama, then Commit and Push</td></tr>
<tr><td>Read the endpoint</td><td>Service connection details and Sync Status</td><td>Status &gt; Network Details &gt; Service Connection</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two management paths">
<rect x="20" y="20" width="280" height="130" rx="10" fill="#bae6fd"/><text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="14">SCM</text><text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">Add Service Connection</text><text x="160" y="94" text-anchor="middle" class="svg-muted" font-size="12">tunnel + routing in one form</text><text x="160" y="116" text-anchor="middle" class="svg-muted" font-size="12">Push Config</text>
<rect x="340" y="20" width="280" height="130" rx="10" fill="#ddd6fe"/><text x="480" y="46" text-anchor="middle" class="svg-ink" font-size="14">Panorama</text><text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="12">Service Connection &gt; Add</text><text x="480" y="94" text-anchor="middle" class="svg-muted" font-size="12">Service_Conn_Template tunnel</text><text x="480" y="116" text-anchor="middle" class="svg-muted" font-size="12">Commit and Push + Service Setup</text>
</svg><p class="cap">Same service connection, two management paths.</p></div>

<h3>Commit: the step people miss</h3>
<p>In Panorama, a plain Commit to Panorama does <b>not</b> reach Prisma Access. Use Commit &gt; Commit and Push, then Edit Selections &gt; Prisma Access tab and include <b>Service Setup</b>. In SCM use Push Config with the right push scope. Full pushes are required for new tenants and folder operations. Verify afterwards that Config Status is In sync.</p>

<h3>Reading the Service Endpoint Address</h3>
<p>After the push, read the cloud-side endpoint for the HQ device: Panorama &gt; Cloud Services &gt; Status &gt; Network Details &gt; Service Connection. In the lab it is 203.0.113.102. You put it on the HQ IKE gateway as the peer.</p>

<div class="eg"><p><b>Worked example.</b> Name SC-HQ, location nearest to Mumbai, peer 192.0.2.10, key NkPrisma2026 (lab value), IKEv2 with AES-256-CBC, SHA256, DH14, IPsec AES-256-GCM, monitor 10.10.0.50, BGP on. After the push, Network Details shows endpoint 203.0.113.102.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Panorama: committing to Panorama only; forgetting Service Setup in the push; naming the tunnel longer than 31 characters. All: choosing a location far from HQ; picking a tunnel monitor IP that HQ cannot answer.</p></div>
<div class="exam"><p><b>Exam trap.</b> Panorama Service Connection tabs are Static Routes, BGP, Miscellaneous. Source NAT pool is /25 to /32, RFC 1918. The tunnel is Auto Key, IPv4 only, 31 characters.</p></div>

<div class="scn"><h4>Change that never arrived</h4><p>An admin edited the service connection in Panorama, saw a green commit and went home. The next morning nothing had changed. He had used Commit to Panorama only. Commit and Push with Service Setup selected brought Config Status to In sync.</p><p><b>Lesson:</b> commit and push are different. Always read Config Status.</p></div>

<div class="iv"><p class="q">"How do you create a service connection?"</p><p>In SCM, Prisma Access &gt; Service Connections &gt; Add, with name, location, tunnel, tunnel monitoring and routing, then Push Config. In Panorama, Cloud Services &gt; Configuration &gt; Service Connection &gt; Add, then Commit and Push with Service Setup selected. I read the endpoint address and give it to the HQ team.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SCM and Panorama build the same service connection with different menus.</li>
<li>Location should be the nearest to HQ.</li>
<li>Panorama needs Commit and Push with Service Setup.</li>
<li>Tunnel: Auto Key, IPv4, name up to 31 characters in Panorama.</li>
<li>Read the endpoint address from Network Details after the push.</li>
</ul></div>
`,hi:`
<p>Corporate corridor kholne ke liye do forms chahiye: ek courier ke counter par (cloud side) aur ek aapke warehouse ke darwaze par (HQ firewall). Is chapter mein hum dono management tools mein cloud-side form bharte hain aur seekhte hain ki commit mein kya hona chahiye. HQ firewall agle chapter mein aata hai.</p>

<h3>Shuru karne se pehle</h3>
<ol>
<li>Service infrastructure maujood hai (infrastructure subnet 10.255.0.0/24, infrastructure BGP AS 65534).</li>
<li>Aapko HQ WAN IP (192.0.2.10), HQ LAN (10.10.0.0/24) aur monitor karne ke liye ek host (10.10.0.50) pata hai.</li>
<li>Aapke paas pre-shared key hai. Lab value <code>NkPrisma2026</code> hai; production mein lambi random secret use karo.</li>
<li>Aapko pata hai ki HQ ke sabse nazdeek kaun si location hai.</li>
</ol>

<h3>Strata Cloud Manager path</h3>
<p>Configuration &gt; NGFW and Prisma Access &gt; Configuration Scope &gt; Prisma Access &gt; Service Connections &gt; Add Service Connection. Bharo:</p>
<dl class="terms">
<dt>Name</dt><dd>Saaf naam jaise SC-HQ.</dd>
<dt>Location</dt><dd>HQ ke sabse nazdeek Prisma Access location.</dd>
<dt>Source NAT (Mobile Users)</dt><dd>Data Traffic aur/ya Infrastructure Traffic, /25 se /32 ke pool ke saath (chapter 4).</dd>
<dt>Primary IPsec tunnel</dt><dd>Peer address (HQ 192.0.2.10), pre-shared key, IKE aur IPsec crypto. Secondary tunnel optional.</dd>
<dt>Tunnel Monitoring</dt><dd>Corporate network par destination IP, yahan 10.10.0.50.</dd>
<dt>Routing</dt><dd>Static Routes ya BGP.</dd>
</dl>
<p>Phir Configuration &gt; Operations &gt; Push Config use karo.</p>

<h3>Panorama path</h3>
<p>Panorama &gt; Cloud Services &gt; Configuration &gt; Service Connection &gt; Add. Bharo:</p>
<dl class="terms">
<dt>Name aur Location</dt><dd>Upar jaisa.</dd>
<dt>IPSec Tunnel</dt><dd>Existing tunnel chuno ya Service_Conn_Template mein naya banao. Tunnel Auto Key, IPv4 only hona chahiye, aur naam 31 characters tak.</dd>
<dt>Backup SC</dt><dd>Hot potato routing ke saath BGP ke liye available.</dd>
<dt>Secondary WAN</dt><dd>Optional doosra tunnel.</dd>
<dt>Tabs</dt><dd>Static Routes, BGP aur Miscellaneous. Miscellaneous mein Enable Data Traffic source NAT, Infrastructure Traffic source NAT, User-ID aur IP Pool (RFC 1918, /25 se /32) hain.</dd>
</dl>
<p>Panorama Service_Conn_Template aapke liye banata hai, Mobile_User_Template aur Remote_Network_Template ke saath.</p>

<table class="cmp"><tr><th>Item</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Form kholna</td><td>Prisma Access &gt; Service Connections &gt; Add Service Connection</td><td>Cloud Services &gt; Configuration &gt; Service Connection &gt; Add</td></tr>
<tr><td>Tunnels kahan rehte hain</td><td>Service connection form ke andar</td><td>Service_Conn_Template mein IPSec tunnel</td></tr>
<tr><td>Deliver</td><td>Push Config</td><td>Commit to Panorama, phir Commit and Push</td></tr>
<tr><td>Endpoint padhna</td><td>Service connection details aur Sync Status</td><td>Status &gt; Network Details &gt; Service Connection</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two management paths">
<rect x="20" y="20" width="280" height="130" rx="10" fill="#bae6fd"/><text x="160" y="46" text-anchor="middle" class="svg-ink" font-size="14">SCM</text><text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">Add Service Connection</text><text x="160" y="94" text-anchor="middle" class="svg-muted" font-size="12">tunnel + routing ek form mein</text><text x="160" y="116" text-anchor="middle" class="svg-muted" font-size="12">Push Config</text>
<rect x="340" y="20" width="280" height="130" rx="10" fill="#ddd6fe"/><text x="480" y="46" text-anchor="middle" class="svg-ink" font-size="14">Panorama</text><text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="12">Service Connection &gt; Add</text><text x="480" y="94" text-anchor="middle" class="svg-muted" font-size="12">Service_Conn_Template tunnel</text><text x="480" y="116" text-anchor="middle" class="svg-muted" font-size="12">Commit and Push + Service Setup</text>
</svg><p class="cap">Wahi service connection, do management paths.</p></div>

<h3>Commit: jo step log miss karte hain</h3>
<p>Panorama mein sirf Commit to Panorama Prisma Access tak <b>nahi</b> pahunchta. Commit &gt; Commit and Push use karo, phir Edit Selections &gt; Prisma Access tab aur <b>Service Setup</b> include karo. SCM mein sahi push scope ke saath Push Config use karo. Naye tenants aur folder operations ke liye full push zaroori hai. Baad mein verify karo ki Config Status In sync hai.</p>

<h3>Service Endpoint Address padhna</h3>
<p>Push ke baad HQ device ke liye cloud-side endpoint padho: Panorama &gt; Cloud Services &gt; Status &gt; Network Details &gt; Service Connection. Lab mein yeh 203.0.113.102 hai. Ise HQ IKE gateway par peer ki tarah daalte ho.</p>

<div class="eg"><p><b>Worked example.</b> Name SC-HQ, Mumbai ke nazdeek location, peer 192.0.2.10, key NkPrisma2026 (lab value), IKEv2 AES-256-CBC, SHA256, DH14 ke saath, IPsec AES-256-GCM, monitor 10.10.0.50, BGP on. Push ke baad Network Details endpoint 203.0.113.102 dikhata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Panorama: sirf Panorama par commit karna; push mein Service Setup bhoolna; tunnel naam 31 characters se lamba. Sab: HQ se door location chunna; aisa tunnel monitor IP jiska HQ jawab nahi de sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Panorama Service Connection tabs Static Routes, BGP, Miscellaneous hain. Source NAT pool /25 se /32, RFC 1918. Tunnel Auto Key, IPv4 only, 31 characters.</p></div>

<div class="scn"><h4>Change jo kabhi pahuncha hi nahi</h4><p>Admin ne Panorama mein service connection edit kiya, green commit dekha aur ghar chala gaya. Agle din kuch nahi badla tha. Usne sirf Commit to Panorama kiya tha. Service Setup select karke Commit and Push se Config Status In sync aaya.</p><p><b>Lesson:</b> commit aur push alag hain. Config Status hamesha padho.</p></div>

<div class="iv"><p class="q">"Service connection kaise banate ho?"</p><p>SCM mein Prisma Access &gt; Service Connections &gt; Add, name, location, tunnel, tunnel monitoring aur routing ke saath, phir Push Config. Panorama mein Cloud Services &gt; Configuration &gt; Service Connection &gt; Add, phir Service Setup select karke Commit and Push. Endpoint address padhkar HQ team ko deta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SCM aur Panorama alag menus se wahi service connection banate hain.</li>
<li>Location HQ ke sabse nazdeek honi chahiye.</li>
<li>Panorama ko Service Setup ke saath Commit and Push chahiye.</li>
<li>Tunnel: Auto Key, IPv4, Panorama mein naam 31 characters tak.</li>
<li>Push ke baad Network Details se endpoint address padho.</li>
</ul></div>
`}};export{e as default};