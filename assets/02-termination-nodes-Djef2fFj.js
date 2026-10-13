var e={id:`termination-nodes`,h:{en:`Locations, termination nodes and service endpoint addresses`,hi:`Locations, termination nodes aur service endpoint addresses`},body:{en:`
<p>Think of a courier network again. Before the branch driver can leave, he needs the exact address of the sorting centre dock he must deliver to. In Prisma Access that dock is the <b>IPSec termination node</b>, and its address is the <b>Service Endpoint Address</b>. This chapter explains where those come from and how you choose them.</p>

<h3>Location, compute location and node</h3>
<ul>
<li>A <b>Prisma Access location</b> is where a site attaches, for example India West or India South.</li>
<li>A <b>compute location</b> groups at least two nearby locations. In the docs example, compute location Asia South (Mumbai) holds India West and India South, while India North is New Delhi.</li>
<li>A <b>termination node</b> is the cloud gateway that ends your IPsec tunnel inside that location. One node carries up to 1,000 Mbps. When a compute location needs more bandwidth, it uses several nodes, and each remote network is bound to one node.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Location hierarchy">
<rect x="20" y="20" width="600" height="190" rx="12" fill="#e2e8f0"/><text x="40" y="44" class="svg-ink" font-size="14">Compute location: Asia South (Mumbai)</text>
<rect x="40" y="62" width="260" height="128" rx="10" fill="#bae6fd"/><text x="170" y="86" text-anchor="middle" class="svg-ink" font-size="13">Location: India West</text>
<rect x="60" y="100" width="100" height="70" rx="8" fill="#bbf7d0"/><text x="110" y="128" text-anchor="middle" class="svg-ink" font-size="12">Node A</text><text x="110" y="148" text-anchor="middle" class="svg-muted" font-size="11">branch 1</text>
<rect x="180" y="100" width="100" height="70" rx="8" fill="#bbf7d0"/><text x="230" y="128" text-anchor="middle" class="svg-ink" font-size="12">Node B</text><text x="230" y="148" text-anchor="middle" class="svg-muted" font-size="11">branch 2</text>
<rect x="340" y="62" width="260" height="128" rx="10" fill="#ddd6fe"/><text x="470" y="86" text-anchor="middle" class="svg-ink" font-size="13">Location: India South</text>
<rect x="400" y="100" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="470" y="128" text-anchor="middle" class="svg-ink" font-size="12">Node C</text><text x="470" y="148" text-anchor="middle" class="svg-muted" font-size="11">branch 3</text>
</svg><p class="cap">Bandwidth is allocated to the compute location; each branch is bound to one node.</p></div>

<h3>Service Endpoint Address</h3>
<p>Each node has a Service Endpoint Address, an FQDN or an IP. It is the <b>peer IP</b> that the branch IKE gateway must point to. You do not choose it freely. You read it from the status pages after the remote network is created and pushed.</p>
<ul>
<li><b>Panorama:</b> Panorama &gt; Cloud Services &gt; Status &gt; Network Details &gt; Remote Networks shows the Service Endpoint Address and the Local IP.</li>
<li><b>SCM:</b> the remote network entry and the Sync Status / Branch Sites pages show the tunnel and endpoint details.</li>
</ul>
<p>In our lab the tenant remote-network endpoint is <code>203.0.113.101</code>. This is a documentation address standing in for the real endpoint.</p>

<h3>Onboarding fields</h3>
<table class="cmp"><tr><th>Field</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Where</td><td>Configuration &gt; NGFW and Prisma Access &gt; Configuration Scope &gt; Prisma Access &gt; Remote Networks &gt; Add Remote Network</td><td>Panorama &gt; Cloud Services &gt; Configuration &gt; Remote Networks &gt; Add Remote Network</td></tr>
<tr><td>Name</td><td>Site Name</td><td>Name (cannot be changed later)</td></tr>
<tr><td>Placement</td><td>Prisma Access Location, IPSec Termination Node</td><td>Location, IPSec Termination Node</td></tr>
<tr><td>Tunnel</td><td>Primary IPsec tunnel</td><td>IPSec tunnel in Remote_Network_Template (Auto Key, IPv4 only, name up to 31 chars)</td></tr>
<tr><td>Routing</td><td>Static Routes or Enable BGP</td><td>Static Routes and BGP tabs</td></tr>
<tr><td>Extras</td><td>ECMP Load Balancing, Secondary WAN, QoS</td><td>ECMP, Secondary WAN</td></tr>
<tr><td>Finish</td><td>Push Config</td><td>Commit to Panorama, then Commit and Push</td></tr>
</table>
<p>Scale note from release 5.2: a tenant can hold up to 25,000 remote networks and 50,000 IKE gateways.</p>

<h3>Choosing a location</h3>
<p>Pick the location nearest to the branch. Latency is lowest, and the docs advise spreading across more than one compute location for resilience. Remember that the bandwidth you license is split among the sites in a compute location, so a very busy branch may deserve its own plan (see the bandwidth chapter).</p>

<h3>Predefined templates</h3>
<p>Panorama offers predefined IPsec templates for popular CPE devices: Cisco ISR and ASA, Citrix, Prisma SD-WAN, Riverbed, Silver Peak and a generic device. You can use the IPsec and IKE crypto profiles unchanged, but you must edit the IKE gateway so that it matches your branch (peer, ID and key).</p>

<div class="eg"><p><b>Worked example.</b> BR-FW (198.51.100.10) must reach the Mumbai-area node. The admin adds a remote network named BR-Mumbai with location India West and an automatic termination node. After the push, Network Details shows Service Endpoint Address 203.0.113.101. The admin puts this address as the peer on the BR-FW IKE gateway. If he had typed an old or guessed address, IKE would never answer.</p></div>

<div class="warn"><p><b>Common mistake.</b> Copying the peer IP from an old ticket, an email or a different tenant. Always read the Service Endpoint Address from the status page of the tenant you are configuring.</p></div>
<div class="exam"><p><b>Exam trap.</b> A compute location groups at least two locations; one node gives up to 1,000 Mbps; the endpoint address is the branch device peer IP. The Panorama remote network name cannot be changed after it is created.</p></div>

<div class="scn"><h4>Tunnel never answers after a copy-paste</h4><p>An engineer cloned the config of a branch from another tenant. The IKE gateway pointed at that tenant's endpoint. IKE packets went out but nothing answered correctly. Reading Network Details for the right tenant gave the proper Service Endpoint Address, and the tunnel came up within a minute.</p><p><b>Lesson:</b> the endpoint address belongs to your tenant and your remote network. Read it, do not assume it.</p></div>

<div class="iv"><p class="q">"What is the IPSec termination node and why does it matter?"</p><p>It is the Prisma Access gateway that ends the branch tunnel in a location. Each has a Service Endpoint Address that is the peer IP for the branch IKE gateway. One node supports up to 1,000 Mbps, so more bandwidth in a compute location means more nodes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Location is where a site attaches; compute location groups at least two locations.</li>
<li>A termination node ends your tunnel and carries up to 1,000 Mbps.</li>
<li>The Service Endpoint Address is the branch peer IP, read from Network Details.</li>
<li>SCM uses Add Remote Network; Panorama uses Cloud Services &gt; Configuration &gt; Remote Networks.</li>
<li>Predefined templates help, but you edit the IKE gateway yourself.</li>
</ul></div>
`,hi:`
<p>Phir courier network socho. Branch driver nikalne se pehle use us sorting centre dock ka exact address chahiye jahan deliver karna hai. Prisma Access mein woh dock <b>IPSec termination node</b> hai, aur uska address <b>Service Endpoint Address</b> hai. Yeh chapter samjhata hai ki yeh kahan se aate hain aur aap kaise choose karte ho.</p>

<h3>Location, compute location aur node</h3>
<ul>
<li><b>Prisma Access location</b> woh jagah hai jahan site attach hota hai, jaise India West ya India South.</li>
<li><b>Compute location</b> kam se kam do nearby locations ko group karta hai. Docs example mein compute location Asia South (Mumbai) mein India West aur India South hain, jabki India North New Delhi hai.</li>
<li><b>Termination node</b> us location ke andar cloud gateway hai jo aapka IPsec tunnel end karta hai. Ek node up to 1,000 Mbps carry karta hai. Compute location ko zyada bandwidth chahiye to kai nodes use hote hain, aur har remote network ek node se bound hota hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Location hierarchy">
<rect x="20" y="20" width="600" height="190" rx="12" fill="#e2e8f0"/><text x="40" y="44" class="svg-ink" font-size="14">Compute location: Asia South (Mumbai)</text>
<rect x="40" y="62" width="260" height="128" rx="10" fill="#bae6fd"/><text x="170" y="86" text-anchor="middle" class="svg-ink" font-size="13">Location: India West</text>
<rect x="60" y="100" width="100" height="70" rx="8" fill="#bbf7d0"/><text x="110" y="128" text-anchor="middle" class="svg-ink" font-size="12">Node A</text><text x="110" y="148" text-anchor="middle" class="svg-muted" font-size="11">branch 1</text>
<rect x="180" y="100" width="100" height="70" rx="8" fill="#bbf7d0"/><text x="230" y="128" text-anchor="middle" class="svg-ink" font-size="12">Node B</text><text x="230" y="148" text-anchor="middle" class="svg-muted" font-size="11">branch 2</text>
<rect x="340" y="62" width="260" height="128" rx="10" fill="#ddd6fe"/><text x="470" y="86" text-anchor="middle" class="svg-ink" font-size="13">Location: India South</text>
<rect x="400" y="100" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="470" y="128" text-anchor="middle" class="svg-ink" font-size="12">Node C</text><text x="470" y="148" text-anchor="middle" class="svg-muted" font-size="11">branch 3</text>
</svg><p class="cap">Bandwidth compute location ko allocate hoti hai; har branch ek node se bound hai.</p></div>

<h3>Service Endpoint Address</h3>
<p>Har node ka ek Service Endpoint Address hota hai, FQDN ya IP. Yahi woh <b>peer IP</b> hai jise branch IKE gateway point karta hai. Ise aap freely choose nahi karte. Remote network create aur push hone ke baad status pages se padhte ho.</p>
<ul>
<li><b>Panorama:</b> Panorama &gt; Cloud Services &gt; Status &gt; Network Details &gt; Remote Networks mein Service Endpoint Address aur Local IP dikhta hai.</li>
<li><b>SCM:</b> remote network entry aur Sync Status / Branch Sites pages tunnel aur endpoint details dikhate hain.</li>
</ul>
<p>Hamari lab mein tenant remote-network endpoint <code>203.0.113.101</code> hai. Yeh documentation address hai jo asli endpoint ki jagah khada hai.</p>

<h3>Onboarding fields</h3>
<table class="cmp"><tr><th>Field</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Kahan</td><td>Configuration &gt; NGFW and Prisma Access &gt; Configuration Scope &gt; Prisma Access &gt; Remote Networks &gt; Add Remote Network</td><td>Panorama &gt; Cloud Services &gt; Configuration &gt; Remote Networks &gt; Add Remote Network</td></tr>
<tr><td>Name</td><td>Site Name</td><td>Name (baad mein change nahi hota)</td></tr>
<tr><td>Placement</td><td>Prisma Access Location, IPSec Termination Node</td><td>Location, IPSec Termination Node</td></tr>
<tr><td>Tunnel</td><td>Primary IPsec tunnel</td><td>Remote_Network_Template mein IPSec tunnel (Auto Key, IPv4 only, name 31 chars tak)</td></tr>
<tr><td>Routing</td><td>Static Routes ya Enable BGP</td><td>Static Routes aur BGP tabs</td></tr>
<tr><td>Extras</td><td>ECMP Load Balancing, Secondary WAN, QoS</td><td>ECMP, Secondary WAN</td></tr>
<tr><td>Finish</td><td>Push Config</td><td>Commit to Panorama, phir Commit and Push</td></tr>
</table>
<p>Release 5.2 se scale note: ek tenant mein 25,000 remote networks aur 50,000 IKE gateways tak ho sakte hain.</p>

<h3>Location kaise choose karein</h3>
<p>Branch ke sabse nazdeek wali location chuno. Latency sabse kam hoti hai, aur docs resilience ke liye ek se zyada compute location use karne ki salah dete hain. Yaad rakho ki jo bandwidth license ki hai woh compute location ke sites mein split hoti hai, isliye bahut busy branch ko alag plan chahiye ho sakta hai (bandwidth chapter dekho).</p>

<h3>Predefined templates</h3>
<p>Panorama popular CPE devices ke liye predefined IPsec templates deta hai: Cisco ISR aur ASA, Citrix, Prisma SD-WAN, Riverbed, Silver Peak aur ek generic device. IPsec aur IKE crypto profiles unchanged use kar sakte ho, lekin IKE gateway ko apne branch ke hisaab se edit karna padta hai (peer, ID aur key).</p>

<div class="eg"><p><b>Worked example.</b> BR-FW (198.51.100.10) ko Mumbai-area node tak pahunchna hai. Admin BR-Mumbai naam se remote network add karta hai, location India West aur automatic termination node. Push ke baad Network Details mein Service Endpoint Address 203.0.113.101 dikhta hai. Admin yeh address BR-FW IKE gateway par peer ki tarah daalta hai. Agar woh purana ya guess kiya hua address type karta, to IKE ko kabhi jawab nahi milta.</p></div>

<div class="warn"><p><b>Common mistake.</b> Peer IP purane ticket, email ya dusre tenant se copy karna. Hamesha usi tenant ke status page se Service Endpoint Address padho jise configure kar rahe ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Compute location kam se kam do locations group karta hai; ek node up to 1,000 Mbps; endpoint address branch device ka peer IP hai. Panorama remote network name create hone ke baad change nahi hota.</p></div>

<div class="scn"><h4>Copy-paste ke baad tunnel jawab nahi deta</h4><p>Ek engineer ne dusre tenant ke branch ka config clone kiya. IKE gateway us tenant ke endpoint ko point karta tha. IKE packets gaye lekin sahi jawab nahi aaya. Sahi tenant ka Network Details padhne se proper Service Endpoint Address mila, aur tunnel ek minute mein up ho gaya.</p><p><b>Lesson:</b> endpoint address aapke tenant aur remote network ka hota hai. Padho, assume mat karo.</p></div>

<div class="iv"><p class="q">"IPSec termination node kya hai aur kyun important hai?"</p><p>Yeh Prisma Access gateway hai jo location mein branch tunnel end karta hai. Har ka Service Endpoint Address hota hai jo branch IKE gateway ka peer IP hai. Ek node up to 1,000 Mbps support karta hai, to compute location mein zyada bandwidth ka matlab zyada nodes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Location woh jagah hai jahan site attach hota hai; compute location kam se kam do locations group karta hai.</li>
<li>Termination node aapka tunnel end karta hai aur up to 1,000 Mbps carry karta hai.</li>
<li>Service Endpoint Address branch ka peer IP hai, Network Details se padho.</li>
<li>SCM mein Add Remote Network; Panorama mein Cloud Services &gt; Configuration &gt; Remote Networks.</li>
<li>Predefined templates madad karte hain, lekin IKE gateway aap khud edit karte ho.</li>
</ul></div>
`}};export{e as default};