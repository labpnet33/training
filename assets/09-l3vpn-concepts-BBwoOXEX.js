var e={id:`l3vpn-concepts`,h:{en:`MPLS Layer 3 VPN: PE, CE, VRF, RD and RT`,hi:`MPLS Layer 3 VPN: PE, CE, VRF, RD aur RT`},body:{en:`
<p>Picture a large shared office building run by a facilities company. Many companies rent space, and two of them may both have a "Room 10" and a "Finance department". The building has one set of lifts and corridors (the provider core), but every company has its own locked reception desk (a VRF) where visitors are checked against that company's own directory. Mail between two branches of the same company is put in a sealed envelope marked with a <b>company code</b> so it can never land on another tenant's desk. That is <b>MPLS Layer 3 VPN</b>.</p>

<h3>The problem</h3>
<p>A provider wants to sell private WAN connectivity to hundreds of enterprises. Each customer uses private addresses, and many use the same ones: customer A and customer B both run 10.10.1.0/24. The provider needs to keep their routes and traffic completely separate, scale to thousands of sites, and not build a separate network per customer. Overlay tunnels between every pair of sites do not scale. MPLS L3VPN (RFC 4364, earlier RFC 2547bis) solves it with three building blocks: <b>VRFs</b> on the PE routers, <b>MP-BGP</b> between the PEs, and the <b>MPLS label stack</b> across the core.</p>

<h3>The three router types, again</h3>
<ul>
<li><b>CE (customer edge)</b>: the customer's router. It runs ordinary routing (static, OSPF, EIGRP or eBGP) with its PE. It knows nothing about MPLS, VRFs or other customers.</li>
<li><b>PE (provider edge)</b>: the provider's edge router. It holds one <b>VRF</b> per customer, learns customer routes from the CE, exchanges them with other PEs through MP-BGP, and pushes the label stack. All the VPN intelligence lives here.</li>
<li><b>P (provider)</b>: core router. It only runs the IGP and LDP, and swaps transport labels. It has <b>no VRFs and no customer routes</b>, which is why the design scales.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="L3VPN roles">
<rect x="10" y="40" width="100" height="40" rx="8" fill="#fde68a"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="12">CE-A1</text>
<rect x="10" y="170" width="100" height="40" rx="8" fill="#fed7aa"/><text x="60" y="195" text-anchor="middle" class="svg-ink" font-size="12">CE-B1</text>
<rect x="150" y="90" width="110" height="70" rx="8" fill="#bae6fd"/><text x="205" y="112" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="205" y="132" text-anchor="middle" class="svg-muted" font-size="12">VRF CUST-A</text><text x="205" y="148" text-anchor="middle" class="svg-muted" font-size="12">VRF CUST-B</text>
<rect x="290" y="105" width="60" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">P</text>
<rect x="380" y="90" width="110" height="70" rx="8" fill="#bae6fd"/><text x="435" y="112" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="435" y="132" text-anchor="middle" class="svg-muted" font-size="12">VRF CUST-A</text><text x="435" y="148" text-anchor="middle" class="svg-muted" font-size="12">VRF CUST-B</text>
<rect x="530" y="40" width="100" height="40" rx="8" fill="#fde68a"/><text x="580" y="65" text-anchor="middle" class="svg-ink" font-size="12">CE-A2</text>
<rect x="530" y="170" width="100" height="40" rx="8" fill="#fed7aa"/><text x="580" y="195" text-anchor="middle" class="svg-ink" font-size="12">CE-B2</text>
<line x1="110" y1="60" x2="150" y2="105" stroke="#64748b"/><line x1="110" y1="190" x2="150" y2="145" stroke="#64748b"/>
<line x1="260" y1="125" x2="290" y2="125" stroke="#64748b" stroke-width="2"/><line x1="350" y1="125" x2="380" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="105" x2="530" y2="60" stroke="#64748b"/><line x1="490" y1="145" x2="530" y2="190" stroke="#64748b"/>
<path d="M205 90 Q320 20 435 90" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP VPNv4 (PE loopbacks)</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">Both customers use 10.10.1.0/24 and 10.10.2.0/24</text>
</svg><p class="cap">VRFs live only on the PEs; the P router carries labels but never customer routes.</p></div>

<h3>VRF on the PE</h3>
<p>You met <b>VRF-lite</b> in the earlier ENARSI module: a VRF is a separate routing table and CEF table on one router, and an interface belongs to exactly one VRF. In MPLS L3VPN the VRF is the same object with two extra attributes, RD and RT, that let it be exported into BGP.</p>

<h3>RD: Route Distinguisher, making routes unique</h3>
<p>If PE1 sent both customers' 10.10.1.0/24 to PE2 in plain BGP, BGP would see one prefix and keep only the best path; one customer would lose its route. The <b>RD</b> is an <b>8-byte value</b> prepended to the IPv4 prefix to create a <b>12-byte VPNv4 prefix</b>: 65000:1:10.10.1.0/24 and 65000:2:10.10.1.0/24 are now different routes. The RD is written as <code>ASN:number</code> or <code>IP-address:number</code>.</p>
<p>The RD's only job is <b>uniqueness</b>. It does <b>not</b> decide which VRF imports a route. Many providers use one RD per VRF; others use a unique RD per VRF per PE so that multihomed sites show both paths.</p>

<h3>RT: Route Target, deciding who gets the route</h3>
<p>The <b>RT</b> is a BGP <b>extended community</b> (also 8 bytes) attached to each VPNv4 route. Each VRF has:</p>
<ul>
<li><b>Export RT(s)</b>: communities attached to routes leaving this VRF into MP-BGP.</li>
<li><b>Import RT(s)</b>: a route from MP-BGP is copied into this VRF if it carries <b>any</b> of these RTs.</li>
</ul>
<p>For a simple any-to-any customer, every site of customer A exports and imports 65000:100. Because RTs are just matching rules, you can build more complex topologies: hub-and-spoke (spokes import only the hub RT), extranets (a shared-services VRF exported to several customers), and management VPNs.</p>

<div class="eg"><p><b>Worked example.</b> PE1 has VRF CUST-A (RD 65000:1, export and import RT 65000:100) and VRF CUST-B (RD 65000:2, RT 65000:200). CE-A1 and CE-B1 both advertise 10.10.1.0/24. PE1 exports 65000:1:10.10.1.0/24 with RT 65000:100 and 65000:2:10.10.1.0/24 with RT 65000:200. PE2 receives both. Its VRF CUST-A imports only routes with RT 65000:100, so it installs the first; VRF CUST-B imports 65000:200 and installs the second. Same prefix, no conflict.</p></div>

<pre class="code"><span class="c">! PE1: define the VRFs (IOS multi-address-family syntax)</span>
vrf definition CUST-A
 rd 65000:1
 address-family ipv4
  route-target export 65000:100
  route-target import 65000:100
 exit-address-family
!
vrf definition CUST-B
 rd 65000:2
 address-family ipv4
  route-target both 65000:200
 exit-address-family
!
interface GigabitEthernet0/2
 vrf forwarding CUST-A          <span class="c">! removes the IP address; re-enter it</span>
 ip address 172.31.11.1 255.255.255.252</pre>

<table class="cmp"><tr><th></th><th>RD</th><th>RT</th></tr>
<tr><td>Purpose</td><td>Make overlapping prefixes unique in BGP</td><td>Control import and export between VRFs</td></tr>
<tr><td>Carried as</td><td>Part of the VPNv4 prefix</td><td>Extended community</td></tr>
<tr><td>How many per VRF</td><td>Exactly one</td><td>Any number of import and export</td></tr>
<tr><td>Needs</td><td>Nothing else</td><td><code>send-community extended</code> on the VPNv4 session</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Assuming matching RDs make sites talk. They do not. Two VRFs with the same RD but non-matching RTs exchange nothing; two VRFs with different RDs but matching RTs communicate fine. Also, applying <code>vrf forwarding</code> removes the interface IP address; you must configure it again.</p></div>

<div class="exam"><p><b>Exam trap.</b> RD = uniqueness (8 bytes, 64 bits, prepended, VPNv4 = 96-bit prefix). RT = policy (extended community, import/export). A question saying "which value determines which VRF a route is imported into" wants RT.</p></div>

<div class="scn"><h4>The new site that saw nothing</h4><p>A provider added a third site for a retail customer. The new PE's VRF had the correct RD format and the customer's CE-PE BGP session was up, but the site could not reach the other two. <code>show bgp vpnv4 unicast all</code> on the new PE showed the remote prefixes arriving, but <code>show ip route vrf RETAIL</code> was empty. The import RT was typed as 65000:1100 instead of 65000:110. Fixing the import RT installed the routes immediately.</p><p><b>Lesson:</b> routes that arrive in VPNv4 but never reach the VRF point to an RT import mismatch.</p></div>

<div class="iv"><p class="q">"What is the difference between a route distinguisher and a route target?"</p><p>The RD is an 8-byte value added to each customer prefix to make it a unique VPNv4 route, so overlapping addresses from different customers can coexist in BGP. It carries no policy. The RT is an extended community attached to the route; export RTs are added when a route leaves a VRF, and a VRF imports any route carrying one of its import RTs. RTs build full-mesh, hub-and-spoke and extranet topologies.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VPN = VRFs on PEs + MP-BGP between PEs + MPLS labels across the core.</li>
<li>CE runs ordinary routing; PE holds the VRFs; P has no VRFs or customer routes.</li>
<li>RD (8 bytes) + IPv4 prefix = 12-byte VPNv4 prefix; the RD only makes routes unique.</li>
<li>RT is an extended community; export attaches it, import selects routes into a VRF.</li>
<li>Routes in VPNv4 but not in the VRF usually mean an RT import mismatch.</li>
</ul></div>
`,hi:`
<p>Ek facilities company ki chalayi hui ek badi shared office building socho. Kai companies wahan jagah kiraye par leti hain, aur unmein se do ke paas ek "Room 10" aur ek "Finance department" dono ho sakte hain. Building mein lifts aur corridors ka ek hi set hai (provider core), par har company ka apna locked reception desk hai (VRF) jahan visitors ko us company ki apni directory se check kiya jaata hai. Ek hi company ki do branches ke beech ka mail ek sealed envelope mein daala jaata hai jis par <b>company code</b> likha hota hai, taaki woh kabhi kisi doosre tenant ke desk par na pahunche. Yahi <b>MPLS Layer 3 VPN</b> hai.</p>

<h3>Problem</h3>
<p>Ek provider sainkdon enterprises ko private WAN connectivity bechna chahta hai. Har customer private addresses use karta hai, aur kai same addresses use karte hain: customer A aur customer B dono 10.10.1.0/24 chalate hain. Provider ko unke routes aur traffic ko poori tarah alag rakhna hai, hazaaron sites tak scale karna hai, aur har customer ke liye alag network nahi banana. Har pair of sites ke beech overlay tunnels scale nahi karte. MPLS L3VPN (RFC 4364, pehle RFC 2547bis) ise teen building blocks se solve karta hai: PE routers par <b>VRFs</b>, PEs ke beech <b>MP-BGP</b>, aur core ke paar <b>MPLS label stack</b>.</p>

<h3>Teen router types, phir se</h3>
<ul>
<li><b>CE (customer edge)</b>: customer ka router. Yeh apne PE ke saath normal routing (static, OSPF, EIGRP ya eBGP) chalata hai. Ise MPLS, VRFs ya doosre customers ke baare mein kuch nahi pata.</li>
<li><b>PE (provider edge)</b>: provider ka edge router. Isme har customer ke liye ek <b>VRF</b> hota hai, yeh CE se customer routes seekhta hai, MP-BGP se doosre PEs ke saath exchange karta hai, aur label stack push karta hai. Saari VPN intelligence yahin rehti hai.</li>
<li><b>P (provider)</b>: core router. Yeh sirf IGP aur LDP chalata hai, aur transport labels swap karta hai. Iske paas <b>na VRFs hain na customer routes</b>, isi wajah se design scale karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="L3VPN roles">
<rect x="10" y="40" width="100" height="40" rx="8" fill="#fde68a"/><text x="60" y="65" text-anchor="middle" class="svg-ink" font-size="12">CE-A1</text>
<rect x="10" y="170" width="100" height="40" rx="8" fill="#fed7aa"/><text x="60" y="195" text-anchor="middle" class="svg-ink" font-size="12">CE-B1</text>
<rect x="150" y="90" width="110" height="70" rx="8" fill="#bae6fd"/><text x="205" y="112" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="205" y="132" text-anchor="middle" class="svg-muted" font-size="12">VRF CUST-A</text><text x="205" y="148" text-anchor="middle" class="svg-muted" font-size="12">VRF CUST-B</text>
<rect x="290" y="105" width="60" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">P</text>
<rect x="380" y="90" width="110" height="70" rx="8" fill="#bae6fd"/><text x="435" y="112" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="435" y="132" text-anchor="middle" class="svg-muted" font-size="12">VRF CUST-A</text><text x="435" y="148" text-anchor="middle" class="svg-muted" font-size="12">VRF CUST-B</text>
<rect x="530" y="40" width="100" height="40" rx="8" fill="#fde68a"/><text x="580" y="65" text-anchor="middle" class="svg-ink" font-size="12">CE-A2</text>
<rect x="530" y="170" width="100" height="40" rx="8" fill="#fed7aa"/><text x="580" y="195" text-anchor="middle" class="svg-ink" font-size="12">CE-B2</text>
<line x1="110" y1="60" x2="150" y2="105" stroke="#64748b"/><line x1="110" y1="190" x2="150" y2="145" stroke="#64748b"/>
<line x1="260" y1="125" x2="290" y2="125" stroke="#64748b" stroke-width="2"/><line x1="350" y1="125" x2="380" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="105" x2="530" y2="60" stroke="#64748b"/><line x1="490" y1="145" x2="530" y2="190" stroke="#64748b"/>
<path d="M205 90 Q320 20 435 90" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP VPNv4 (PE loopbacks)</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">Dono customers 10.10.1.0/24 aur 10.10.2.0/24 use karte hain</text>
</svg><p class="cap">VRFs sirf PEs par rehte hain; P router labels le jaata hai par customer routes kabhi nahi.</p></div>

<h3>PE par VRF</h3>
<p>Aap pehle ke ENARSI module mein <b>VRF-lite</b> se mil chuke ho: VRF ek router par alag routing table aur CEF table hai, aur ek interface bilkul ek VRF ka hota hai. MPLS L3VPN mein VRF wahi object hai, do extra attributes ke saath, RD aur RT, jo use BGP mein export hone dete hain.</p>

<h3>RD: Route Distinguisher, routes ko unique banana</h3>
<p>Agar PE1 dono customers ka 10.10.1.0/24 plain BGP mein PE2 ko bhejta, to BGP ko ek hi prefix dikhta aur woh sirf best path rakhta; ek customer ka route kho jaata. <b>RD</b> ek <b>8-byte value</b> hai jo IPv4 prefix ke aage lagakar <b>12-byte VPNv4 prefix</b> banati hai: 65000:1:10.10.1.0/24 aur 65000:2:10.10.1.0/24 ab alag routes hain. RD <code>ASN:number</code> ya <code>IP-address:number</code> ki tarah likha jaata hai.</p>
<p>RD ka ek hi kaam hai <b>uniqueness</b>. Yeh decide <b>nahi</b> karta ki kaunsa VRF route import karega. Kai providers har VRF ke liye ek RD use karte hain; kuch har PE par har VRF ke liye unique RD use karte hain taaki multihomed sites dono paths dikhayein.</p>

<h3>RT: Route Target, decide karna ki route kise milega</h3>
<p><b>RT</b> ek BGP <b>extended community</b> hai (yeh bhi 8 bytes) jo har VPNv4 route par lagti hai. Har VRF ke paas hote hain:</p>
<ul>
<li><b>Export RT(s)</b>: is VRF se MP-BGP mein jaane wale routes par lagne wali communities.</li>
<li><b>Import RT(s)</b>: MP-BGP se aaya route is VRF mein copy hota hai agar us par inmein se <b>koi bhi</b> RT ho.</li>
</ul>
<p>Ek simple any-to-any customer ke liye customer A ki har site 65000:100 export aur import karti hai. Kyunki RTs sirf matching rules hain, aap zyada complex topologies bana sakte ho: hub-and-spoke (spokes sirf hub RT import karte hain), extranets (ek shared-services VRF kai customers ko export), aur management VPNs.</p>

<div class="eg"><p><b>Worked example.</b> PE1 par VRF CUST-A (RD 65000:1, export aur import RT 65000:100) aur VRF CUST-B (RD 65000:2, RT 65000:200) hain. CE-A1 aur CE-B1 dono 10.10.1.0/24 advertise karte hain. PE1 65000:1:10.10.1.0/24 ko RT 65000:100 ke saath aur 65000:2:10.10.1.0/24 ko RT 65000:200 ke saath export karta hai. PE2 ko dono milte hain. Uska VRF CUST-A sirf RT 65000:100 wale routes import karta hai, to pehla install karta hai; VRF CUST-B 65000:200 import karta hai aur doosra install karta hai. Same prefix, koi conflict nahi.</p></div>

<pre class="code"><span class="c">! PE1: VRFs define karo (IOS multi-address-family syntax)</span>
vrf definition CUST-A
 rd 65000:1
 address-family ipv4
  route-target export 65000:100
  route-target import 65000:100
 exit-address-family
!
vrf definition CUST-B
 rd 65000:2
 address-family ipv4
  route-target both 65000:200
 exit-address-family
!
interface GigabitEthernet0/2
 vrf forwarding CUST-A          <span class="c">! IP address hata deta hai; dobara daalo</span>
 ip address 172.31.11.1 255.255.255.252</pre>

<table class="cmp"><tr><th></th><th>RD</th><th>RT</th></tr>
<tr><td>Purpose</td><td>BGP mein overlapping prefixes ko unique banana</td><td>VRFs ke beech import aur export control karna</td></tr>
<tr><td>Kaise carry hota hai</td><td>VPNv4 prefix ka hissa</td><td>Extended community</td></tr>
<tr><td>Har VRF mein kitne</td><td>Bilkul ek</td><td>Kitne bhi import aur export</td></tr>
<tr><td>Kya chahiye</td><td>Kuch aur nahi</td><td>VPNv4 session par <code>send-community extended</code></td></tr></table>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki matching RDs se sites baat karne lagti hain. Aisa nahi hai. Same RD par non-matching RTs wale do VRFs kuch exchange nahi karte; alag RDs par matching RTs wale do VRFs aaram se communicate karte hain. Aur, <code>vrf forwarding</code> lagane se interface ka IP address hat jaata hai; use dobara configure karna padta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> RD = uniqueness (8 bytes, 64 bits, aage laga, VPNv4 = 96-bit prefix). RT = policy (extended community, import/export). "Kaunsi value decide karti hai ki route kis VRF mein import hoga" wala sawaal RT maangta hai.</p></div>

<div class="scn"><h4>Nayi site jise kuch nahi dikha</h4><p>Ek provider ne ek retail customer ke liye teesri site jodi. Naye PE ke VRF ka RD format sahi tha aur customer ka CE-PE BGP session up tha, par site baaki do tak nahi pahunch pa rahi thi. Naye PE par <code>show bgp vpnv4 unicast all</code> mein remote prefixes aate dikhe, par <code>show ip route vrf RETAIL</code> khaali tha. Import RT 65000:110 ki jagah 65000:1100 type ho gaya tha. Import RT theek karte hi routes turant install ho gaye.</p><p><b>Seekh:</b> jo routes VPNv4 mein aate hain par VRF tak kabhi nahi pahunchte, woh RT import mismatch ki taraf ishaara karte hain.</p></div>

<div class="iv"><p class="q">"Route distinguisher aur route target mein kya farak hai?"</p><p>RD ek 8-byte value hai jo har customer prefix mein jodkar use unique VPNv4 route banati hai, taaki alag customers ke overlapping addresses BGP mein saath reh sakein. Isme koi policy nahi hoti. RT route par lagi extended community hai; route VRF se nikalte waqt export RTs judte hain, aur VRF woh har route import karta hai jis par uska koi import RT ho. RTs se full-mesh, hub-and-spoke aur extranet topologies banti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VPN = PEs par VRFs + PEs ke beech MP-BGP + core ke paar MPLS labels.</li>
<li>CE normal routing chalata hai; PE VRFs rakhta hai; P ke paas na VRFs na customer routes.</li>
<li>RD (8 bytes) + IPv4 prefix = 12-byte VPNv4 prefix; RD sirf routes ko unique banata hai.</li>
<li>RT extended community hai; export use lagata hai, import routes ko VRF mein chunta hai.</li>
<li>Routes VPNv4 mein hain par VRF mein nahi, to aam taur par RT import mismatch hai.</li>
</ul></div>
`}};export{e as default};