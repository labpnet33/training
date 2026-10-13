var e={id:`controller`,h:{en:`Versa Controller: the control plane`,hi:`Versa Controller: control plane`},body:{en:`
<p>The Controller is the <b>air traffic control tower</b> and the <b>passport office</b> of the SD-WAN. A branch arrives, proves who it is, gets told who the other branches are and how to reach them, and then flies on its own.</p>

<h3>What the Controller does</h3>
<ol>
<li><b>Authenticates branches (trust).</b> A branch builds an <b>IKE/IPsec</b> tunnel to the Controller. In production the identity is proven with certificates from a PKI (a certificate authority the headend trusts), or with pre-shared secrets in simple deployments. Only authenticated sites join the overlay.</li>
<li><b>Runs MP-BGP towards every branch.</b> Over that secure channel the Controller and the branch exchange routes using <b>multiprotocol BGP</b> with an SD-WAN address family. Each branch advertises its LAN prefixes, its site-id and its transport locators (the WAN addresses). The Controller reflects this to the other branches of the same organization.</li>
<li><b>Distributes policy and tunnel information.</b> Branches learn the remote sites' WAN addresses and build <b>data tunnels</b> to each other (hub-spoke or full/partial mesh, depending on design).</li>
<li><b>Maps transports with transport domains.</b> A <b>transport domain</b> (in real Versa, also called a WAN network or transport network) is a label such as Internet, MPLS or LTE for a set of WAN circuits that can reach each other. Tunnels are only formed between interfaces of the same domain.</li>
<li><b>Tracks sites and tenants.</b> The Controller carries each organization separately, so Acme routes never leak to another tenant.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Controller control relationships">
<rect x="250" y="95" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">Controller-1</text><text x="320" y="141" text-anchor="middle" class="svg-muted" font-size="12">IKE + MP-BGP</text>
<rect x="20" y="20" width="130" height="46" rx="8" fill="#bae6fd"/><text x="85" y="48" text-anchor="middle" class="svg-ink" font-size="13">Branch1 (101)</text>
<rect x="20" y="180" width="130" height="46" rx="8" fill="#bae6fd"/><text x="85" y="208" text-anchor="middle" class="svg-ink" font-size="13">Branch2 (102)</text>
<rect x="490" y="20" width="130" height="46" rx="8" fill="#bae6fd"/><text x="555" y="48" text-anchor="middle" class="svg-ink" font-size="13">Branch3 (103)</text>
<rect x="490" y="180" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="555" y="208" text-anchor="middle" class="svg-ink" font-size="13">Director-1</text>
<line x1="150" y1="50" x2="255" y2="105" stroke="#64748b" stroke-width="2.5"/><line x1="150" y1="200" x2="255" y2="145" stroke="#64748b" stroke-width="2.5"/><line x1="490" y1="50" x2="385" y2="105" stroke="#64748b" stroke-width="2.5"/>
<line x1="490" y1="200" x2="385" y2="145" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="150" y="104" class="svg-accent" font-size="12">tunnels (control)</text><text x="400" y="190" class="svg-muted" font-size="12">management link</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">Branch-to-branch data tunnels are separate and are learned through the Controller</text>
</svg><p class="cap">Every branch has a control relationship with the Controller; the Director only manages it.</p></div>

<h3>Multiple Controllers and redundancy</h3>
<p>One Controller is a single point of failure for the control plane, so real deployments use <b>two or more Controllers</b>, usually in different data centres. Branches are given a list of Controllers and keep sessions with several. If one fails, the others carry routes and policy. A Controller can also be sized by number of sites. The course lab uses one Controller (<code>Controller-1</code>); the branch <code>controllers</code> statement takes an address, and the lab accepts a list.</p>

<h3>Why two addresses?</h3>
<p>In the lab the Controller has <code>198.51.100.20</code> on <code>vni-0/0</code> (reachable from the Internet side) and <code>172.31.100.2/30</code> on <code>vni-0/1</code> (attached to the MPLS cloud). A branch with an MPLS circuit cannot reach a public-side address through MPLS, so it needs an address on the MPLS side. Each transport domain needs a matching WAN interface on the Controller. You will configure this in chapter 10.</p>

<h3>Lab CLI view</h3>
<pre class="code"><span class="c">! on Controller-1</span>
configure
set system director 198.51.100.10
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
set orgs org Acme sd-wan transport-domains Internet
set orgs org Acme sd-wan transport-domains MPLS
set orgs org Acme sd-wan transport-domains LTE
commit</pre>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan transport-domains
Transport domain
Internet
MPLS
LTE

admin@Controller-1-cli&gt; show orgs org Acme sd-wan sites
Site          Site-ID Tunnels up        MP-BGP       LAN prefix
Branch1       101     Internet,MPLS,LTE <span class="hl">Established</span> 10.1.1.0/24
Branch2       102     Internet,MPLS,LTE Established  10.1.2.0/24

admin@Controller-1-cli&gt; show bgp neighbor brief
Neighbor (site)    Site-ID  State
Branch1            101      Established
Branch2            102      Established</pre>
<div class="note"><p><b>Course model.</b> The real Controller is itself a VOS instance with Control-VR and several VRs; real MP-BGP and IKE details (certificates, route targets) are much richer. The lab lets you set the Director link, WAN interfaces and transport domains, which are the parts that decide whether tunnels come up.</p></div>

<div class="eg"><p><b>Worked example.</b> Branch1 (Delhi) has LTE only as backup. LTE tunnels reach the Controller's <b>Internet</b> address, because an LTE carrier gives Internet access (course rule). The Controller still needs the transport domain <code>LTE</code>, otherwise the LTE tunnel stays down with the reason "transport domain LTE is missing on the Controller".</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing a missing transport domain on the branch. The branch interface is fine; the Controller does not know that transport. The fix belongs on the Controller.</p></div>

<div class="exam"><p><b>Exam trap.</b> A branch MP-BGP session is Established as soon as at least one tunnel is up. So Established does not prove all circuits work; always read the per-transport tunnel table.</p></div>

<div class="scn"><h4>Only Internet tunnels, MPLS silent</h4><p>A retail customer added MPLS to 40 branches, but every MPLS tunnel was down while the provider reported healthy circuits. The branches' overlay was Established through Internet, so nobody noticed for days until MPLS-preferred voice traffic quality fell. The Controller had no MPLS WAN interface and no MPLS transport domain. Adding both fixed all 40 branches at once.</p><p><b>Lesson:</b> a fault that affects every branch on one transport is probably in the central component, not 40 simultaneous circuit failures.</p></div>

<div class="iv"><p class="q">"What does the Versa Controller do, and what happens if it fails?"</p><p>It authenticates branches (IKE and PKI), runs MP-BGP to distribute routes, site and transport information and policy, and maps transport domains. Existing data tunnels and learned routes usually keep forwarding for a while, but new sites and changes cannot be learned, which is why you deploy two or more Controllers in different locations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller = trust (IKE, certificates), MP-BGP routes, tunnel and policy distribution.</li>
<li>Transport domains label circuits that can build tunnels with each other.</li>
<li>The Controller needs a WAN interface and a transport domain for every transport branches use.</li>
<li>Use two or more Controllers for redundancy.</li>
<li>Overlay Established means at least one tunnel is up, not all.</li>
</ul></div>
`,hi:`
<p>Controller SD-WAN ka <b>air traffic control tower</b> aur <b>passport office</b> hai. Branch aata hai, apni identity prove karta hai, use bataya jaata hai ki baaki branches kaun hain aur wahan kaise pahunchna hai, aur phir woh khud udta hai.</p>

<h3>Controller kya karta hai</h3>
<ol>
<li><b>Branches ko authenticate karta hai (trust).</b> Branch Controller tak <b>IKE/IPsec</b> tunnel banata hai. Production mein identity PKI ke certificates se prove hoti hai (certificate authority jis par headend trust karta hai), ya simple deployments mein pre-shared secrets se. Sirf authenticated sites overlay join karti hain.</li>
<li><b>Har branch ke saath MP-BGP chalata hai.</b> Us secure channel par Controller aur branch SD-WAN address family ke saath <b>multiprotocol BGP</b> se routes exchange karte hain. Har branch apne LAN prefixes, site-id aur transport locators (WAN addresses) advertise karta hai. Controller yeh same organization ke baaki branches ko reflect karta hai.</li>
<li><b>Policy aur tunnel information distribute karta hai.</b> Branches remote sites ke WAN addresses seekhte hain aur ek doosre ke saath <b>data tunnels</b> banate hain (design ke hisaab se hub-spoke ya full/partial mesh).</li>
<li><b>Transport domains se transports map karta hai.</b> <b>Transport domain</b> (real Versa mein WAN network ya transport network bhi kehte hain) un WAN circuits ke set ka label hai jaise Internet, MPLS ya LTE, jo ek doosre tak pahunch sakte hain. Tunnels sirf same domain ke interfaces ke beech bante hain.</li>
<li><b>Sites aur tenants track karta hai.</b> Controller har organization ko alag carry karta hai, isliye Acme ke routes kisi doosre tenant mein leak nahi hote.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Controller control relationships">
<rect x="250" y="95" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">Controller-1</text><text x="320" y="141" text-anchor="middle" class="svg-muted" font-size="12">IKE + MP-BGP</text>
<rect x="20" y="20" width="130" height="46" rx="8" fill="#bae6fd"/><text x="85" y="48" text-anchor="middle" class="svg-ink" font-size="13">Branch1 (101)</text>
<rect x="20" y="180" width="130" height="46" rx="8" fill="#bae6fd"/><text x="85" y="208" text-anchor="middle" class="svg-ink" font-size="13">Branch2 (102)</text>
<rect x="490" y="20" width="130" height="46" rx="8" fill="#bae6fd"/><text x="555" y="48" text-anchor="middle" class="svg-ink" font-size="13">Branch3 (103)</text>
<rect x="490" y="180" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="555" y="208" text-anchor="middle" class="svg-ink" font-size="13">Director-1</text>
<line x1="150" y1="50" x2="255" y2="105" stroke="#64748b" stroke-width="2.5"/><line x1="150" y1="200" x2="255" y2="145" stroke="#64748b" stroke-width="2.5"/><line x1="490" y1="50" x2="385" y2="105" stroke="#64748b" stroke-width="2.5"/>
<line x1="490" y1="200" x2="385" y2="145" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="150" y="104" class="svg-accent" font-size="12">tunnels (control)</text><text x="400" y="190" class="svg-muted" font-size="12">management link</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">Branch-to-branch data tunnels alag hain aur Controller ke through seekhe jaate hain</text>
</svg><p class="cap">Har branch ka Controller ke saath control relationship hai; Director sirf use manage karta hai.</p></div>

<h3>Multiple Controllers aur redundancy</h3>
<p>Ek Controller control plane ka single point of failure hai, isliye real deployments mein <b>do ya zyada Controllers</b> hote hain, aam taur par alag data centres mein. Branches ko Controllers ki list di jaati hai aur woh kai ke saath sessions rakhte hain. Ek fail ho to baaki routes aur policy carry karte hain. Controller ko sites ki sankhya ke hisaab se size bhi kiya jaata hai. Course lab mein ek Controller hai (<code>Controller-1</code>); branch ka <code>controllers</code> statement ek address leta hai, aur lab list accept karta hai.</p>

<h3>Do addresses kyun?</h3>
<p>Lab mein Controller ke paas <code>vni-0/0</code> par <code>198.51.100.20</code> hai (Internet side se reachable) aur <code>vni-0/1</code> par <code>172.31.100.2/30</code> (MPLS cloud se attached). MPLS circuit wala branch MPLS ke through public-side address tak nahi pahunch sakta, isliye use MPLS side par address chahiye. Controller par har transport domain ke liye matching WAN interface chahiye. Yeh aap chapter 10 mein configure karoge.</p>

<h3>Lab CLI view</h3>
<pre class="code"><span class="c">! on Controller-1</span>
configure
set system director 198.51.100.10
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
set orgs org Acme sd-wan transport-domains Internet
set orgs org Acme sd-wan transport-domains MPLS
set orgs org Acme sd-wan transport-domains LTE
commit</pre>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan transport-domains
Transport domain
Internet
MPLS
LTE

admin@Controller-1-cli&gt; show orgs org Acme sd-wan sites
Site          Site-ID Tunnels up        MP-BGP       LAN prefix
Branch1       101     Internet,MPLS,LTE <span class="hl">Established</span> 10.1.1.0/24
Branch2       102     Internet,MPLS,LTE Established  10.1.2.0/24

admin@Controller-1-cli&gt; show bgp neighbor brief
Neighbor (site)    Site-ID  State
Branch1            101      Established
Branch2            102      Established</pre>
<div class="note"><p><b>Course model.</b> Real Controller khud ek VOS instance hai jisme Control-VR aur kai VRs hote hain; real MP-BGP aur IKE ki details (certificates, route targets) kaafi rich hain. Lab mein aap Director link, WAN interfaces aur transport domains set karte ho, yahi parts tay karte hain ki tunnels up aayenge ya nahi.</p></div>

<div class="eg"><p><b>Worked example.</b> Branch1 (Delhi) ke paas LTE sirf backup hai. LTE tunnels Controller ke <b>Internet</b> address tak jaate hain, kyunki LTE carrier Internet access deta hai (course rule). Phir bhi Controller par transport domain <code>LTE</code> chahiye, warna LTE tunnel down rehta hai aur reason aata hai "transport domain LTE is missing on the Controller".</p></div>

<div class="warn"><p><b>Common mistake.</b> Missing transport domain ko branch par fix karna. Branch interface theek hai; Controller ko woh transport pata hi nahi. Fix Controller par hoti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Branch MP-BGP session tab Established ho jaata hai jab kam se kam ek tunnel up ho. Isliye Established ka matlab yeh nahi ki saare circuits chal rahe hain; hamesha per-transport tunnel table padho.</p></div>

<div class="scn"><h4>Sirf Internet tunnels, MPLS khamosh</h4><p>Ek retail customer ne 40 branches mein MPLS joda, lekin har MPLS tunnel down tha jabki provider ne circuits healthy bataye. Branches ka overlay Internet ke through Established tha, isliye kisi ko dino tak pata nahi chala jab tak MPLS-preferred voice traffic ki quality nahi giri. Controller par na MPLS WAN interface tha na MPLS transport domain. Dono add karte hi saari 40 branches theek ho gayi.</p><p><b>Lesson:</b> jo fault ek transport par har branch ko affect kare woh shayad central component mein hai, 40 circuits ek saath fail nahi hue.</p></div>

<div class="iv"><p class="q">"Versa Controller kya karta hai, aur fail ho jaye to kya hota hai?"</p><p>Yeh branches ko authenticate karta hai (IKE aur PKI), MP-BGP se routes, site aur transport information aur policy distribute karta hai, aur transport domains map karta hai. Existing data tunnels aur seekhe hue routes aam taur par kuch der forward karte rehte hain, lekin naye sites aur changes learn nahi ho sakte, isliye do ya zyada Controllers alag locations par lagte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller = trust (IKE, certificates), MP-BGP routes, tunnel aur policy distribution.</li>
<li>Transport domains un circuits ko label karte hain jo ek doosre ke saath tunnels bana sakte hain.</li>
<li>Branches jo bhi transport use karein, uske liye Controller par WAN interface aur transport domain chahiye.</li>
<li>Redundancy ke liye do ya zyada Controllers lagao.</li>
<li>Overlay Established ka matlab kam se kam ek tunnel up, sab nahi.</li>
</ul></div>
`}};export{e as default};