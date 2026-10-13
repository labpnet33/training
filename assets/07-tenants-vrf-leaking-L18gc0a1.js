var e={id:`tenants-vrf-leaking`,h:{en:`Tenants, organizations and VRF segmentation`,hi:`Tenants, organizations aur VRF segmentation`},body:{en:`
<p>A large apartment building has many families. Everyone shares the lift, the water supply and the security guard, but each family has a locked flat. Versa was designed as a <b>multi-tenant</b> platform in the same way: one set of appliances and one Controller can serve many customers or many departments, and each tenant has a private flat.</p>

<h3>Organization = tenant</h3>
<p>In Versa the word for a tenant is <b>organization</b> (the CLI says <code>orgs org Acme</code>). An organization owns its LAN VRs, its sites, its policies and its security rules. In the course there is one real tenant, <b>Acme</b>, and a second name, <b>Guest</b>, which shows up in vs-tenant-mismatch. A parent organization can contain child organizations in service-provider style deployments, which is how an MSP runs hundreds of customers on shared infrastructure (the Controller itself holds each customer organization).</p>
<ul>
<li>On the <b>Controller</b>, the organization must exist and have its WAN interfaces and transport domains.</li>
<li>On a <b>branch</b>, the organization must have the same name, and the branch must carry a unique <b>site-id</b> (101, 102, 103) inside it.</li>
<li>Routes belong to a tenant: Acme prefixes are only distributed to Acme sites.</li>
</ul>

<h3>Segmentation inside one organization</h3>
<p>Even inside Acme you may need separation: Corporate, Guest Wi-Fi, IoT cameras, Payment systems. In Versa you create several LAN VRs (segments) inside the organization. Each segment has its own routing table and, with a tunnel carrying the segment identity, is kept apart across the whole WAN. This is <b>segmentation</b> (also called VRF-based segmentation). A guest laptop cannot reach a payment server because the guest VR simply has no route to it.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Tenants and segments">
<rect x="20" y="20" width="290" height="210" rx="10" fill="#bbf7d0"/><text x="165" y="42" text-anchor="middle" class="svg-ink" font-size="14">Organization Acme</text>
<rect x="40" y="55" width="120" height="50" rx="6" fill="#ffffff"/><text x="100" y="78" text-anchor="middle" class="svg-ink" font-size="12">Corp VR</text><text x="100" y="95" text-anchor="middle" class="svg-muted" font-size="11">10.1.x.0/24</text>
<rect x="170" y="55" width="120" height="50" rx="6" fill="#ffffff"/><text x="230" y="78" text-anchor="middle" class="svg-ink" font-size="12">Guest-Wifi VR</text><text x="230" y="95" text-anchor="middle" class="svg-muted" font-size="11">172.20.x.0/24</text>
<rect x="40" y="120" width="120" height="50" rx="6" fill="#ffffff"/><text x="100" y="143" text-anchor="middle" class="svg-ink" font-size="12">Payments VR</text><text x="100" y="160" text-anchor="middle" class="svg-muted" font-size="11">isolated</text>
<text x="165" y="205" text-anchor="middle" class="svg-muted" font-size="12">sites 101, 102, 103</text>
<rect x="340" y="20" width="280" height="210" rx="10" fill="#ddd6fe"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="14">Organization Guest</text>
<rect x="370" y="55" width="220" height="50" rx="6" fill="#ffffff"/><text x="480" y="85" text-anchor="middle" class="svg-ink" font-size="12">its own VRs and sites</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="12">no routes shared with Acme</text>
<line x1="310" y1="125" x2="340" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Organizations are hard walls; segments (VRs) inside an organization are internal walls.</p></div>

<h3>Route leaking and shared services</h3>
<p>Complete isolation is sometimes too strict. Every segment may need to reach a shared <b>DNS and patch server</b>, or Guest users need only the Internet. <b>Route leaking</b> means deliberately copying selected routes from one VR into another so that exactly those prefixes become reachable. It is done with route policy: select the prefixes, import them into the other VR, and add the reverse for return traffic. Leaking must be paired with security rules because reachability is not permission.</p>
<div class="eg"><p><b>Worked example.</b> Acme Corp VR has 10.1.1.0/24 at Delhi. A shared-services VR at the DC holds 198.51.100.0/24. To let Corp reach the DC servers you leak 198.51.100.0/24 into Corp and leak 10.1.0.0/16 (summary) into shared services for return traffic. Guest-Wifi gets only a default route to the Internet breakout; it receives none of these. If you leaked everything both ways you would have rebuilt one big flat network and defeated the segmentation.</p></div>

<h3>What happens at the Controller</h3>
<p>The Controller keeps tenants apart when it reflects routes. A site in Guest never receives Acme prefixes, and a site that names an organization the Controller does not know cannot attach. The model and real life agree here. That is the mechanism behind vs-tenant-mismatch (chapter 11): Kolkata asked for Guest, the Controller replied that it does not use that organization, and nothing was exchanged.</p>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan sites
Site         Site-ID  Tunnels up         MP-BGP       LAN prefix
Branch1      101      Internet,MPLS,LTE  Established  10.1.1.0/24
Branch2      102      Internet,MPLS,LTE  Established  10.1.2.0/24</pre>
<p>Kolkata is absent because it is not attached to Acme. The line to read is the site list per organization.</p>

<h3>Consistency checklist</h3>
<ol>
<li>Organization name identical (spelling and capitalisation) on Controller and branch.</li>
<li>Site-id unique per site within the organization.</li>
<li>Controller address correct under the organization.</li>
<li>WAN interface to transport mapping present for each circuit.</li>
</ol>
<p>Templates from the Director are the cure for typos at scale: the organization name comes from one template, not from many hands.</p>

<div class="warn"><p><b>Common mistakes.</b> Creating the organization with a different case or spelling at the branch; leaking routes in one direction only; assuming isolation without testing it; reusing the same site-id at two sites.</p></div>
<div class="exam"><p><b>Exam trap.</b> Organizations are the strongest boundary (different tenants). Segments are VRs inside one organization. Leaking opens reachability between segments but is not the same as permitting traffic: policy still applies.</p></div>

<div class="scn"><h4>Guests on the finance subnet</h4><p>An audit found that Guest Wi-Fi users in a store could ping the payment terminals. The store had been built with a single LAN VR for everything. Engineers created separate Guest and Payments VRs, moved the interfaces, and leaked only a default route to the Internet breakout into Guest. A retest showed no route from Guest to Payments.</p><p><b>Lesson:</b> segmentation is a routing decision first and a firewall decision second.</p></div>
<div class="iv"><p class="q">"What is the difference between a tenant and a VRF in Versa?"</p><p>A tenant (organization) is the administrative and security boundary containing sites, policies and VRs. A VRF or LAN VR is a routing table inside the tenant used for segmentation. Between tenants nothing is shared by default; between VRs of one tenant you can leak chosen routes for shared services, and policy still decides permission.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organization = tenant, the hard boundary; the CLI shows <code>orgs org Acme</code>.</li>
<li>Controller and branch must agree on the organization name; each site has a unique site-id.</li>
<li>Segments are VRs inside an organization and keep traffic classes apart.</li>
<li>Route leaking selectively copies routes between VRs, in both directions for return traffic.</li>
<li>Reachability and permission are separate: leak routes and also write policy.</li>
</ul></div>
`,hi:`
<p>Ek bade apartment building mein kai families rehti hain. Sab lift, paani aur security guard share karte hain, par har family ka apna locked flat hota hai. Versa isi tarah <b>multi-tenant</b> platform ke roop mein design hua hai: appliances ka ek set aur ek Controller kai customers ya kai departments ko serve kar sakta hai, aur har tenant ka private flat hota hai.</p>

<h3>Organization = tenant</h3>
<p>Versa mein tenant ke liye word <b>organization</b> hai (CLI mein <code>orgs org Acme</code>). Organization ke paas apne LAN VRs, apni sites, apni policies aur apne security rules hote hain. Course mein ek real tenant <b>Acme</b> hai aur ek doosra naam <b>Guest</b>, jo vs-tenant-mismatch mein aata hai. Service-provider style deployments mein parent organization ke andar child organizations ho sakti hain, jisse ek MSP shared infrastructure par sainkdon customers chalata hai (Controller khud har customer organization ko hold karta hai).</p>
<ul>
<li><b>Controller</b> par organization exist karna chahiye aur uske WAN interfaces aur transport domains hone chahiye.</li>
<li><b>Branch</b> par organization ka naam same hona chahiye, aur branch ke paas uske andar unique <b>site-id</b> (101, 102, 103) hona chahiye.</li>
<li>Routes tenant ke hote hain: Acme prefixes sirf Acme sites ko distribute hote hain.</li>
</ul>

<h3>Ek organization ke andar segmentation</h3>
<p>Acme ke andar bhi separation chahiye ho sakta hai: Corporate, Guest Wi-Fi, IoT cameras, Payment systems. Versa mein organization ke andar kai LAN VRs (segments) banate ho. Har segment ki apni routing table hoti hai aur, segment identity wale tunnel ke saath, poore WAN mein alag rehta hai. Yeh <b>segmentation</b> hai (VRF-based segmentation bhi kehte hain). Guest laptop payment server tak nahi pahunch sakta kyunki guest VR ke paas uska route hi nahi hai.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Tenants and segments">
<rect x="20" y="20" width="290" height="210" rx="10" fill="#bbf7d0"/><text x="165" y="42" text-anchor="middle" class="svg-ink" font-size="14">Organization Acme</text>
<rect x="40" y="55" width="120" height="50" rx="6" fill="#ffffff"/><text x="100" y="78" text-anchor="middle" class="svg-ink" font-size="12">Corp VR</text><text x="100" y="95" text-anchor="middle" class="svg-muted" font-size="11">10.1.x.0/24</text>
<rect x="170" y="55" width="120" height="50" rx="6" fill="#ffffff"/><text x="230" y="78" text-anchor="middle" class="svg-ink" font-size="12">Guest-Wifi VR</text><text x="230" y="95" text-anchor="middle" class="svg-muted" font-size="11">172.20.x.0/24</text>
<rect x="40" y="120" width="120" height="50" rx="6" fill="#ffffff"/><text x="100" y="143" text-anchor="middle" class="svg-ink" font-size="12">Payments VR</text><text x="100" y="160" text-anchor="middle" class="svg-muted" font-size="11">isolated</text>
<text x="165" y="205" text-anchor="middle" class="svg-muted" font-size="12">sites 101, 102, 103</text>
<rect x="340" y="20" width="280" height="210" rx="10" fill="#ddd6fe"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="14">Organization Guest</text>
<rect x="370" y="55" width="220" height="50" rx="6" fill="#ffffff"/><text x="480" y="85" text-anchor="middle" class="svg-ink" font-size="12">apne VRs aur sites</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="12">Acme ke saath koi routes shared nahi</text>
<line x1="310" y1="125" x2="340" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Organizations hard walls hain; organization ke andar ke segments (VRs) internal walls.</p></div>

<h3>Route leaking aur shared services</h3>
<p>Poora isolation kabhi kabhi bahut strict hota hai. Har segment ko ek shared <b>DNS aur patch server</b> tak pahunchna pad sakta hai, ya Guest users ko sirf Internet chahiye. <b>Route leaking</b> ka matlab hai chune hue routes ko ek VR se doosre VR mein jaan-boojh kar copy karna taaki exactly wahi prefixes reachable ho jaayein. Yeh route policy se hota hai: prefixes select karo, unhe doosre VR mein import karo, aur return traffic ke liye ulta bhi jodo. Leaking ke saath security rules bhi chahiye kyunki reachability permission nahi hai.</p>
<div class="eg"><p><b>Worked example.</b> Acme Corp VR mein Delhi ka 10.1.1.0/24 hai. DC ke shared-services VR mein 198.51.100.0/24 hai. Corp ko DC servers tak pahunchane ke liye 198.51.100.0/24 ko Corp mein leak karo aur return traffic ke liye 10.1.0.0/16 (summary) ko shared services mein leak karo. Guest-Wifi ko sirf Internet breakout ki default route milti hai; ise yeh kuch nahi milta. Agar aap sab kuch dono taraf leak kar do to ek bada flat network wapas bana diya aur segmentation haar gayi.</p></div>

<h3>Controller par kya hota hai</h3>
<p>Controller routes reflect karte waqt tenants ko alag rakhta hai. Guest ki site ko Acme prefixes kabhi nahi milte, aur jo site aisa organization naam batati hai jo Controller ko pata nahi, woh attach nahi ho sakti. Model aur real life yahan agree karte hain. Yahi vs-tenant-mismatch (chapter 11) ka mechanism hai: Kolkata ne Guest manga, Controller ne jawab diya ki woh yeh organization use nahi karta, aur kuch exchange nahi hua.</p>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan sites
Site         Site-ID  Tunnels up         MP-BGP       LAN prefix
Branch1      101      Internet,MPLS,LTE  Established  10.1.1.0/24
Branch2      102      Internet,MPLS,LTE  Established  10.1.2.0/24</pre>
<p>Kolkata gayab hai kyunki woh Acme se attached nahi hai. Padhne wali line organization ke hisaab se site list hai.</p>

<h3>Consistency checklist</h3>
<ol>
<li>Organization naam Controller aur branch par identical (spelling aur capitalisation).</li>
<li>Organization ke andar har site ka site-id unique.</li>
<li>Organization ke under Controller address sahi.</li>
<li>Har circuit ke liye WAN interface to transport mapping maujood.</li>
</ol>
<p>Director ke templates scale par typos ka ilaaj hain: organization ka naam ek template se aata hai, kai haathon se nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> Branch par organization alag case ya spelling se banana; leaking sirf ek direction mein karna; bina test kiye isolation maan lena; do sites par same site-id use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Organizations sabse strong boundary hain (alag tenants). Segments ek organization ke andar ke VRs hain. Leaking segments ke beech reachability kholti hai par traffic permit karne jaisi nahi: policy phir bhi lagti hai.</p></div>

<div class="scn"><h4>Finance subnet par guests</h4><p>Ek audit mein mila ki store mein Guest Wi-Fi users payment terminals ko ping kar sakte the. Store ek hi LAN VR ke saath bana tha. Engineers ne alag Guest aur Payments VRs banaye, interfaces move kiye, aur Guest mein sirf Internet breakout ki default route leak ki. Retest mein Guest se Payments ka koi route nahi mila.</p><p><b>Seekh:</b> segmentation pehle routing ka faisla hai aur doosre number par firewall ka.</p></div>
<div class="iv"><p class="q">"Versa mein tenant aur VRF mein kya fark hai?"</p><p>Tenant (organization) administrative aur security boundary hai jisme sites, policies aur VRs hote hain. VRF ya LAN VR tenant ke andar segmentation ke liye routing table hai. Tenants ke beech default mein kuch shared nahi; ek tenant ke VRs ke beech shared services ke liye chune routes leak kar sakte ho, aur permission policy tay karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Organization = tenant, hard boundary; CLI mein <code>orgs org Acme</code> dikhta hai.</li>
<li>Controller aur branch ko organization naam par agree karna hota hai; har site ka unique site-id.</li>
<li>Segments organization ke andar ke VRs hain jo traffic classes ko alag rakhte hain.</li>
<li>Route leaking chune routes ko VRs ke beech copy karta hai, return traffic ke liye dono directions mein.</li>
<li>Reachability aur permission alag hain: routes leak karo aur policy bhi likho.</li>
</ul></div>
`}};export{e as default};