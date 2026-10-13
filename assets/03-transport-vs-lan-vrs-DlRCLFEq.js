var e={id:`transport-vs-lan-vrs`,h:{en:`Transport VRs and LAN VRs: two tables, two jobs`,hi:`Transport VRs aur LAN VRs: do tables, do kaam`},body:{en:`
<p>A large office building has a <b>front gate</b> where couriers and visitors arrive, and many <b>departments</b> inside, each with its own rooms. The security desk at the gate only cares about delivery vehicles and street addresses. The departments only care about room numbers. Mixing the two would be chaos. Versa applies the same idea inside one box: separate routing tables called <b>virtual routers</b>.</p>

<h3>What is a VR (VRF)?</h3>
<p>A <b>virtual router (VR)</b>, also called a <b>VRF</b> (virtual routing and forwarding instance) or routing instance, is an independent routing table with its own interfaces. The same prefix can exist in two VRs without any conflict, because lookups never cross VRs unless you deliberately allow it. On VOS you see them under <code>routing-instances</code> in the configuration.</p>

<h3>Two families of VRs on a Versa branch</h3>
<dl class="terms">
<dt>Transport VR (underlay)</dt><dd>Faces the provider. Holds the WAN interface routes and the routes that make the Controller and other tunnel endpoints reachable. In the course topology each circuit has its own: <code>Internet-Transport-VR</code> (default route to the carrier), <code>MPLS-Transport-VR</code> (172.31.0.0/16 via the PE) and <code>LTE-Transport-VR</code> (default route, kept as backup). Real deployments often use names such as WAN-VR or Internet-Transport; the idea is identical.</dd>
<dt>LAN VR / tenant VR (overlay)</dt><dd>Faces your users. Holds LAN interfaces such as vni-0/3 (10.1.2.0/24 at Bengaluru), the local connected routes and the routes learned from other sites through MP-BGP. Each organization (tenant) has its own LAN VRs, so users of different tenants never see each other's routes.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Transport and LAN VRs">
<rect x="150" y="15" width="340" height="240" rx="12" fill="#e2e8f0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Branch2 (Bengaluru) VOS</text>
<rect x="175" y="55" width="140" height="48" rx="8" fill="#bbf7d0"/><text x="245" y="76" text-anchor="middle" class="svg-ink" font-size="12">Acme LAN VR</text><text x="245" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.1.2.0/24 + learned</text>
<rect x="325" y="55" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="395" y="76" text-anchor="middle" class="svg-ink" font-size="12">Guest LAN VR</text><text x="395" y="93" text-anchor="middle" class="svg-muted" font-size="12">other tenant</text>
<rect x="175" y="140" width="95" height="50" rx="8" fill="#fde68a"/><text x="222" y="162" text-anchor="middle" class="svg-ink" font-size="12">Internet VR</text><text x="222" y="179" text-anchor="middle" class="svg-muted" font-size="11">vni-0/0</text>
<rect x="272" y="140" width="95" height="50" rx="8" fill="#fed7aa"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">MPLS VR</text><text x="320" y="179" text-anchor="middle" class="svg-muted" font-size="11">vni-0/1</text>
<rect x="369" y="140" width="95" height="50" rx="8" fill="#bae6fd"/><text x="416" y="162" text-anchor="middle" class="svg-ink" font-size="12">LTE VR</text><text x="416" y="179" text-anchor="middle" class="svg-muted" font-size="11">vni-0/2</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">tunnels (SD-WAN)</text>
<line x1="245" y1="103" x2="245" y2="140" stroke="#64748b" stroke-dasharray="4 4"/><line x1="395" y1="103" x2="395" y2="140" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Overlay VRs on top, transport VRs below</text>
</svg><p class="cap">Transport VRs face the carriers; LAN VRs face users and are tied to tenants.</p></div>

<h3>Why separate them?</h3>
<ul>
<li><b>Safety.</b> A user prefix must never be able to disturb the route to the Controller. If user routes lived in the same table as the underlay, a bad advertisement could pull tunnel traffic into the tunnel itself and the tunnel would collapse (a recursive loop).</li>
<li><b>Overlapping address space.</b> Two tenants can both use 10.1.1.0/24.</li>
<li><b>Different owners.</b> The carrier decides underlay rules; the tenant decides LAN rules.</li>
<li><b>Different failure modes.</b> A dead MPLS circuit changes underlay routing, not tenant routing.</li>
</ul>

<h3>How the pieces connect</h3>
<p>The tunnel is built in the transport VR (source address on the WAN interface, destination the remote tunnel endpoint) and the traffic inside it is delivered into the tenant LAN VR. Follow one packet from PC2 to PC1:</p>
<ol>
<li>PC2 (10.1.2.10) sends to its gateway 10.1.2.1 on vni-0/3 in the Acme LAN VR.</li>
<li>Lookup of 10.1.1.10 in the Acme LAN VR: prefix 10.1.1.0/24 learned from site 101 through MP-BGP, reachable through the tunnel to Delhi.</li>
<li>The packet is encrypted and given an outer header: source 203.0.113.10 (Bengaluru Internet address), destination the Delhi tunnel endpoint.</li>
<li>The <b>outer</b> packet is looked up in the Internet transport VR: default route, next hop the carrier gateway.</li>
<li>At Delhi the reverse happens: decrypt, deliver to the Acme LAN VR, forward to PC1.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Bengaluru uses 203.0.113.8/30: carrier 203.0.113.9, branch 203.0.113.10. Outer destination is a public-side address; the transport VR needs only a default route to 203.0.113.9. The <b>inner</b> destination 10.1.1.10 is never looked up in the transport VR at all.</p></div>

<h3>Where the commands live</h3>
<pre class="code"><span class="c">! Underlay: transport VR</span>
set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.2.1
<span class="c">! Overlay: tenant identity and LAN</span>
set orgs org Acme sd-wan site-id 102
set interfaces vni-0/3 unit 0 family inet address 10.1.2.1/24</pre>
<p>In the course CLI, the LAN interface address becomes the LAN prefix that is advertised for the tenant. Real VOS puts the LAN interface into a tenant LAN VR through the organization and routing-instance configuration; the Director templates normally do this for you. The model hides that step.</p>

<div class="warn"><p><b>Common mistake.</b> Adding a user prefix route to a transport VR, or an underlay route to a LAN VR, because "it is in the router anyway". Each lookup is per VR.</p></div>
<div class="exam"><p><b>Exam trap.</b> The Controller address is an <b>underlay</b> destination, so the branch needs a route to it in a <b>transport</b> VR, not in the tenant LAN VR.</p></div>

<div class="scn"><h4>Overlapping 10.0.0.0/8</h4><p>An MSP onboarded two customers who both used 10.10.0.0/16. Because each customer had its own organization with its own LAN VR, nothing clashed. The only shared things were the transport VRs, which used carrier addresses. The engineer proved it by running show route in each tenant VR and seeing different next hops.</p><p><b>Lesson:</b> VR separation is what makes multi-tenancy and overlapping addresses safe.</p></div>
<div class="iv"><p class="q">"Why does SD-WAN use separate transport and LAN VRs?"</p><p>Isolation and safety: underlay routes reach tunnel endpoints, overlay routes carry tenant traffic. Separation prevents recursive routing, allows overlapping tenant addressing and lets different owners manage each side. Mention that the outer header is resolved in the transport VR and the inner header in the LAN VR.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VR is an independent routing table; the same prefix can live in several VRs.</li>
<li>Transport VRs (Internet, MPLS, LTE) hold underlay routes to tunnel endpoints.</li>
<li>LAN VRs hold tenant LAN routes, local and learned via MP-BGP.</li>
<li>Outer packet lookups use the transport VR; inner lookups use the LAN VR.</li>
<li>Separation prevents loops, allows overlapping addresses and isolates tenants.</li>
</ul></div>
`,hi:`
<p>Ek bade office building mein ek <b>front gate</b> hota hai jahan couriers aur visitors aate hain, aur andar kai <b>departments</b>, har ek ke apne rooms. Gate ka security desk sirf delivery vehicles aur street addresses ki parwah karta hai. Departments sirf room numbers ki. Dono ko mila do to chaos ho jaaye. Versa yahi idea ek box ke andar apply karta hai: alag routing tables jinhe <b>virtual routers</b> kehte hain.</p>

<h3>VR (VRF) kya hai?</h3>
<p><b>Virtual router (VR)</b>, jise <b>VRF</b> (virtual routing and forwarding instance) ya routing instance bhi kehte hain, ek independent routing table hai jiske apne interfaces hote hain. Same prefix do VRs mein bina conflict ke ho sakta hai, kyunki lookups VRs ke beech tab tak cross nahi karte jab tak aap jaan-boojh kar allow na karo. VOS par inhe configuration mein <code>routing-instances</code> ke under dekhte ho.</p>

<h3>Versa branch par VRs ke do families</h3>
<dl class="terms">
<dt>Transport VR (underlay)</dt><dd>Provider ki taraf face karta hai. WAN interface routes aur woh routes rakhta hai jo Controller aur doosre tunnel endpoints ko reachable banate hain. Course topology mein har circuit ka apna hai: <code>Internet-Transport-VR</code> (carrier ki default route), <code>MPLS-Transport-VR</code> (172.31.0.0/16 via PE) aur <code>LTE-Transport-VR</code> (default route, backup ke roop mein). Real deployments mein WAN-VR ya Internet-Transport jaise naam aam hain; idea same hai.</dd>
<dt>LAN VR / tenant VR (overlay)</dt><dd>Users ki taraf face karta hai. LAN interfaces jaise vni-0/3 (Bengaluru mein 10.1.2.0/24), local connected routes aur doosri sites se MP-BGP ke through seekhe routes rakhta hai. Har organization (tenant) ke apne LAN VRs hote hain, isliye alag tenants ke users ek doosre ke routes nahi dekhte.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Transport and LAN VRs">
<rect x="150" y="15" width="340" height="240" rx="12" fill="#e2e8f0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Branch2 (Bengaluru) VOS</text>
<rect x="175" y="55" width="140" height="48" rx="8" fill="#bbf7d0"/><text x="245" y="76" text-anchor="middle" class="svg-ink" font-size="12">Acme LAN VR</text><text x="245" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.1.2.0/24 + learned</text>
<rect x="325" y="55" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="395" y="76" text-anchor="middle" class="svg-ink" font-size="12">Guest LAN VR</text><text x="395" y="93" text-anchor="middle" class="svg-muted" font-size="12">doosra tenant</text>
<rect x="175" y="140" width="95" height="50" rx="8" fill="#fde68a"/><text x="222" y="162" text-anchor="middle" class="svg-ink" font-size="12">Internet VR</text><text x="222" y="179" text-anchor="middle" class="svg-muted" font-size="11">vni-0/0</text>
<rect x="272" y="140" width="95" height="50" rx="8" fill="#fed7aa"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">MPLS VR</text><text x="320" y="179" text-anchor="middle" class="svg-muted" font-size="11">vni-0/1</text>
<rect x="369" y="140" width="95" height="50" rx="8" fill="#bae6fd"/><text x="416" y="162" text-anchor="middle" class="svg-ink" font-size="12">LTE VR</text><text x="416" y="179" text-anchor="middle" class="svg-muted" font-size="11">vni-0/2</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">tunnels (SD-WAN)</text>
<line x1="245" y1="103" x2="245" y2="140" stroke="#64748b" stroke-dasharray="4 4"/><line x1="395" y1="103" x2="395" y2="140" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Upar overlay VRs, neeche transport VRs</text>
</svg><p class="cap">Transport VRs carriers ko face karte hain; LAN VRs users ko face karte hain aur tenants se bandhe hain.</p></div>

<h3>Alag kyun rakhte hain?</h3>
<ul>
<li><b>Safety.</b> User prefix kabhi Controller ke route ko disturb na kar sake. Agar user routes underlay ki same table mein hote, to ek bad advertisement tunnel traffic ko tunnel ke andar hi kheench sakta tha aur tunnel collapse ho jaata (recursive loop).</li>
<li><b>Overlapping address space.</b> Do tenants dono 10.1.1.0/24 use kar sakte hain.</li>
<li><b>Alag owners.</b> Underlay ke rules carrier ke, LAN ke rules tenant ke.</li>
<li><b>Alag failure modes.</b> MPLS circuit mar jaaye to underlay routing badalti hai, tenant routing nahi.</li>
</ul>

<h3>Pieces kaise jud-te hain</h3>
<p>Tunnel transport VR mein banta hai (source address WAN interface par, destination remote tunnel endpoint) aur uske andar ka traffic tenant LAN VR mein deliver hota hai. PC2 se PC1 tak ek packet follow karo:</p>
<ol>
<li>PC2 (10.1.2.10) apne gateway 10.1.2.1 ko bhejta hai, vni-0/3 par, Acme LAN VR mein.</li>
<li>Acme LAN VR mein 10.1.1.10 ka lookup: prefix 10.1.1.0/24 site 101 se MP-BGP se seekha gaya, Delhi ke tunnel ke through reachable.</li>
<li>Packet encrypt hota hai aur outer header milta hai: source 203.0.113.10 (Bengaluru Internet address), destination Delhi tunnel endpoint.</li>
<li><b>Outer</b> packet ka lookup Internet transport VR mein: default route, next hop carrier gateway.</li>
<li>Delhi par ulta hota hai: decrypt, Acme LAN VR mein deliver, PC1 ko forward.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Bengaluru 203.0.113.8/30 use karta hai: carrier 203.0.113.9, branch 203.0.113.10. Outer destination public-side address hai; transport VR ko sirf 203.0.113.9 ki taraf default route chahiye. <b>Inner</b> destination 10.1.1.10 ka transport VR mein kabhi lookup hi nahi hota.</p></div>

<h3>Commands kahan rehte hain</h3>
<pre class="code"><span class="c">! Underlay: transport VR</span>
set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.2.1
<span class="c">! Overlay: tenant identity aur LAN</span>
set orgs org Acme sd-wan site-id 102
set interfaces vni-0/3 unit 0 family inet address 10.1.2.1/24</pre>
<p>Course CLI mein LAN interface address hi woh LAN prefix ban jaata hai jo tenant ke liye advertise hota hai. Real VOS mein LAN interface ko organization aur routing-instance configuration se tenant LAN VR mein daala jaata hai; Director templates normally yeh aapke liye karte hain. Model yeh step chhupa deta hai.</p>

<div class="warn"><p><b>Common galti.</b> User prefix ka route transport VR mein, ya underlay route LAN VR mein daal dena kyunki "router ke andar hi to hai". Har lookup per VR hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Controller address ek <b>underlay</b> destination hai, isliye branch ko uska route <b>transport</b> VR mein chahiye, tenant LAN VR mein nahi.</p></div>

<div class="scn"><h4>Overlapping 10.0.0.0/8</h4><p>Ek MSP ne do customers onboard kiye jo dono 10.10.0.0/16 use karte the. Har customer ka apna organization aur apna LAN VR tha, isliye kuch clash nahi hua. Sirf transport VRs shared the, jo carrier addresses use karte the. Engineer ne har tenant VR mein show route chala kar prove kiya, jahan next hops alag dikhe.</p><p><b>Seekh:</b> VR separation hi multi-tenancy aur overlapping addresses ko safe banata hai.</p></div>
<div class="iv"><p class="q">"SD-WAN alag transport aur LAN VRs kyun use karta hai?"</p><p>Isolation aur safety: underlay routes tunnel endpoints tak pahunchate hain, overlay routes tenant traffic carry karte hain. Separation recursive routing rokta hai, tenant ke overlapping addressing ko allow karta hai aur alag owners ko apni side manage karne deta hai. Batao ki outer header transport VR mein aur inner header LAN VR mein resolve hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VR ek independent routing table hai; same prefix kai VRs mein ho sakta hai.</li>
<li>Transport VRs (Internet, MPLS, LTE) tunnel endpoints ke underlay routes rakhte hain.</li>
<li>LAN VRs tenant LAN routes rakhte hain, local aur MP-BGP se seekhe hue.</li>
<li>Outer packet lookups transport VR use karte hain; inner lookups LAN VR.</li>
<li>Separation loops rokta hai, overlapping addresses allow karta hai aur tenants ko isolate karta hai.</li>
</ul></div>
`}};export{e as default};