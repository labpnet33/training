var e={id:`tenants-sites`,h:{en:`Organizations (tenants), sites and the site-id`,hi:`Organizations (tenants), sites aur site-id`},body:{en:`
<p>Before a branch can join an SD-WAN, the system must answer three questions: <b>whose network is this</b>, <b>which site is this</b>, and <b>who is the controller I report to</b>. Versa answers them with an <b>organization</b>, a <b>site-id</b> and a <b>Controller address</b>. Mixing these up causes the most common first-day failures, including the one in the ticket lab.</p>

<h3>Analogy: a shopping mall with many companies</h3>
<p>A mall building is shared by many companies. Each company rents its own shop (its organization). Inside one company, each outlet has a branch number on its door (the site-id). The mall's security office keeps a register: company, branch number, address. If a new outlet arrives with the wrong company name, a duplicate branch number or the wrong security-office phone number, it will not be admitted, even though the building works perfectly.</p>

<h3>Organization (tenant)</h3>
<p>An <b>organization</b>, also called a <b>tenant</b>, is a logical customer inside the platform. Versa's multi-tenancy lets one set of Director, Controller and branch devices serve many separate customers (for example, a managed service provider serving different enterprises) while keeping their routes, policies and data isolated. Inside the VOS command syntax you see the organization name as in <code>orgs org Acme</code>: Acme is our lab company. For an enterprise running its own SD-WAN, there is usually one top-level organization.</p>
<ul>
<li>The Controller and the branch must use the <b>same organization name</b>. If the branch says Acme and the Controller knows only Beta, the Controller will not accept it.</li>
<li>Within an organization you configure <code>orgs org Acme sd-wan ...</code> for the transport and overlay side, and <code>orgs org-services Acme sd-wan ...</code> for services such as SLA profiles, forwarding profiles and policies (the policy module covers those).</li>
<li>Inside an organization you can create separate LAN virtual routers for departments (for example Corp, Guest). Those provide segmentation of LAN traffic, covered in later modules.</li>
</ul>

<h3>Site and site-id</h3>
<p>A <b>site</b> is one physical location with one VOS device (or an HA pair): a branch, a data center, a headend. Each site has a numeric <b>site-id</b>, unique inside the organization. It is used in the overlay as the identity of the site, for example when the Controller advertises "prefix 10.1.1.0/24 belongs to site 101".</p>
<table class="cmp"><tr><th>Site</th><th>Name</th><th>Site-id</th><th>LAN</th></tr>
<tr><td>Branch1</td><td>Delhi</td><td>101</td><td>10.1.1.0/24</td></tr>
<tr><td>Branch2</td><td>Bengaluru</td><td>102</td><td>10.1.2.0/24</td></tr>
<tr><td>Branch3</td><td>Kolkata</td><td>103</td><td>10.1.3.0/24</td></tr>
</table>
<p>The pattern is easy to remember: <b>site-id 10k for branch k, LAN 10.1.k.0/24</b>. The Mumbai headend devices (Director, Controller, Analytics) live on 198.51.100.0/24 and are managed as part of the headend; they are not branch sites.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Organization with three sites">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="30" y="32" class="svg-ink" font-size="14">Organization: Acme</text>
<rect x="30" y="50" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="115" y="76" text-anchor="middle" class="svg-ink" font-size="13">Branch1 Delhi</text><text x="115" y="96" text-anchor="middle" class="svg-muted" font-size="12">site-id 101 | 10.1.1.0/24</text>
<rect x="235" y="50" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">Branch2 Bengaluru</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">site-id 102 | 10.1.2.0/24</text>
<rect x="440" y="50" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="525" y="76" text-anchor="middle" class="svg-ink" font-size="13">Branch3 Kolkata</text><text x="525" y="96" text-anchor="middle" class="svg-muted" font-size="12">site-id 103 | 10.1.3.0/24</text>
<rect x="190" y="150" width="260" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">Controller 198.51.100.20</text><text x="320" y="191" text-anchor="middle" class="svg-muted" font-size="12">registers sites, reflects routes</text>
<line x1="115" y1="120" x2="260" y2="150" stroke="#64748b"/><line x1="320" y1="120" x2="320" y2="150" stroke="#64748b"/><line x1="525" y1="120" x2="380" y2="150" stroke="#64748b"/>
</svg><p class="cap">One organization, three sites with unique site-ids, one Controller that knows them all.</p></div>

<h3>The Controller address</h3>
<p>Each branch is told the address of its Controller: <code>orgs org Acme sd-wan controllers 198.51.100.20</code>. This is a <b>WAN-side address</b> that the branch must reach through the underlay. A branch could list more than one Controller for redundancy in real deployments. The Controller needs to be reachable on a transport that the branch uses. In the lab the Controller has 198.51.100.20 for Internet and 172.31.100.2 for MPLS.</p>

<h3>What else defines the identity</h3>
<dl class="terms">
<dt>WAN interface to transport mapping</dt><dd>Tells the SD-WAN which physical port belongs to which transport domain, e.g. <code>wan-interfaces vni-0/0 transport Internet</code>.</dd>
<dt>Transport domain</dt><dd>A named group of WAN circuits that can reach each other, such as Internet or MPLS. The Controller lists the domains it supports.</dd>
<dt>Serial number</dt><dd>The unique device identifier, such as VOS-BR1-0001, used by the Director to recognise a device during zero-touch onboarding (later chapter and module).</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> A new Delhi branch is shipped with serial VOS-BR1-0001. It will be organization Acme, site-id 101, LAN 10.1.1.0/24, Internet on vni-0/0 (203.0.113.6/30), Controller 198.51.100.20. The planning table, written before anyone logs in, contains exactly these five facts. Everything you configure in the labs comes from such a table.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reusing a site-id on two branches, which makes the Controller treat them as the same site. (2) Typing the organization name with a different case or spelling (Acme versus ACME). (3) Using a LAN address as the Controller address. (4) Changing a site-id on a live branch without planning, because routes and policies key off it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Site-id is unique per site inside an organization, not globally across tenants. Two different organizations may reuse numbers, but within one organization duplicates are errors.</p></div>

<div class="scn"><h4>The copy-paste branch</h4><p>An engineer cloned the Delhi configuration to bring up Jaipur and forgot to change the site-id. Jaipur came up and Delhi's overlay dropped within a minute. The Controller saw two devices claiming site 101 and kept switching to whichever connected last. The engineer compared the two configurations side by side, assigned site-id 104 to Jaipur and committed. Delhi recovered without being touched.</p><p><b>Lesson:</b> identity values are the most dangerous thing to copy. Keep a planning table and check it before every commit.</p></div>

<div class="iv"><p class="q">"What is the difference between an organization and a site in Versa?"</p><p>Strong answer: the organization (tenant) is the logical customer or administrative domain whose policies and routes are isolated; a site is one physical location with a unique numeric site-id within that organization. Branches must match the Controller's organization, and each needs a unique site-id and a reachable Controller address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three identity facts: organization, site-id and Controller address; plus the WAN-to-transport mapping.</li>
<li>The branch and Controller must agree on the organization name.</li>
<li>Site-ids must be unique within an organization; the lab uses 101, 102, 103.</li>
<li>Plan identity in a table before configuring; never blindly copy a config.</li>
<li>org holds transport and overlay settings; org-services holds services and policy.</li>
</ul></div>
`,hi:`
<p>Branch SD-WAN join kar sake, usse pehle system ko teen sawaalon ke jawab chahiye: <b>yeh kiska network hai</b>, <b>yeh kaunsi site hai</b>, aur <b>main kis controller ko report karta hoon</b>. Versa inka jawab ek <b>organization</b>, ek <b>site-id</b> aur ek <b>Controller address</b> se deta hai. Inhe mix karne se pehle din ki sabse common failures hoti hain, ticket lab wali bhi.</p>

<h3>Analogy: kai companies wala shopping mall</h3>
<p>Ek mall building kai companies share karti hain. Har company apni shop kiraye par leti hai (uski organization). Ek company ke andar har outlet ke darwaze par branch number hota hai (site-id). Mall ka security office ek register rakhta hai: company, branch number, address. Agar naya outlet galat company name, duplicate branch number ya galat security-office phone number ke saath aaye, to use entry nahi milti, bhale hi building bilkul theek ho.</p>

<h3>Organization (tenant)</h3>
<p><b>Organization</b>, jise <b>tenant</b> bhi kehte hain, platform ke andar ek logical customer hai. Versa ki multi-tenancy ek hi Director, Controller aur branch devices ke set ko kai alag customers ke liye serve karne deti hai (jaise managed service provider alag enterprises ko serve kare) jabki unke routes, policies aur data isolated rehte hain. VOS command syntax mein organization ka naam aise dikhta hai: <code>orgs org Acme</code>: Acme hamari lab company hai. Apna SD-WAN chalane wale enterprise ke liye aam taur par ek top-level organization hoti hai.</p>
<ul>
<li>Controller aur branch ko <b>same organization name</b> use karna hoga. Agar branch Acme kehti hai aur Controller sirf Beta jaanta hai, to Controller use accept nahi karega.</li>
<li>Organization ke andar aap transport aur overlay side ke liye <code>orgs org Acme sd-wan ...</code> configure karte ho, aur SLA profiles, forwarding profiles aur policies jaise services ke liye <code>orgs org-services Acme sd-wan ...</code> (policy module inhe cover karta hai).</li>
<li>Organization ke andar aap departments ke liye alag LAN virtual routers bana sakte ho (jaise Corp, Guest). Yeh LAN traffic ka segmentation dete hain, aage ke modules mein.</li>
</ul>

<h3>Site aur site-id</h3>
<p><b>Site</b> ek physical location hai jismein ek VOS device (ya HA pair) hota hai: branch, data center, headend. Har site ka ek numeric <b>site-id</b> hota hai, organization ke andar unique. Overlay mein ise site ki identity ke roop mein use karte hain, jaise jab Controller advertise karta hai "prefix 10.1.1.0/24 site 101 ka hai".</p>
<table class="cmp"><tr><th>Site</th><th>Name</th><th>Site-id</th><th>LAN</th></tr>
<tr><td>Branch1</td><td>Delhi</td><td>101</td><td>10.1.1.0/24</td></tr>
<tr><td>Branch2</td><td>Bengaluru</td><td>102</td><td>10.1.2.0/24</td></tr>
<tr><td>Branch3</td><td>Kolkata</td><td>103</td><td>10.1.3.0/24</td></tr>
</table>
<p>Pattern yaad rakhna aasan hai: <b>branch k ke liye site-id 10k, LAN 10.1.k.0/24</b>. Mumbai headend devices (Director, Controller, Analytics) 198.51.100.0/24 par hain aur headend ke part ke roop mein manage hote hain; woh branch sites nahi hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Teen sites wali organization">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="30" y="32" class="svg-ink" font-size="14">Organization: Acme</text>
<rect x="30" y="50" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="115" y="76" text-anchor="middle" class="svg-ink" font-size="13">Branch1 Delhi</text><text x="115" y="96" text-anchor="middle" class="svg-muted" font-size="12">site-id 101 | 10.1.1.0/24</text>
<rect x="235" y="50" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">Branch2 Bengaluru</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">site-id 102 | 10.1.2.0/24</text>
<rect x="440" y="50" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="525" y="76" text-anchor="middle" class="svg-ink" font-size="13">Branch3 Kolkata</text><text x="525" y="96" text-anchor="middle" class="svg-muted" font-size="12">site-id 103 | 10.1.3.0/24</text>
<rect x="190" y="150" width="260" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">Controller 198.51.100.20</text><text x="320" y="191" text-anchor="middle" class="svg-muted" font-size="12">sites register karta hai, routes reflect karta hai</text>
<line x1="115" y1="120" x2="260" y2="150" stroke="#64748b"/><line x1="320" y1="120" x2="320" y2="150" stroke="#64748b"/><line x1="525" y1="120" x2="380" y2="150" stroke="#64748b"/>
</svg><p class="cap">Ek organization, unique site-ids wali teen sites, ek Controller jo sabko jaanta hai.</p></div>

<h3>Controller address</h3>
<p>Har branch ko uske Controller ka address bataya jaata hai: <code>orgs org Acme sd-wan controllers 198.51.100.20</code>. Yeh ek <b>WAN-side address</b> hai jise branch ko underlay ke through reach karna hota hai. Real deployments mein redundancy ke liye branch ek se zyada Controller list kar sakti hai. Controller us transport par reachable hona chahiye jo branch use karti hai. Lab mein Controller ke paas Internet ke liye 198.51.100.20 aur MPLS ke liye 172.31.100.2 hai.</p>

<h3>Identity ko aur kya define karta hai</h3>
<dl class="terms">
<dt>WAN interface to transport mapping</dt><dd>SD-WAN ko batata hai ki kaunsa physical port kis transport domain ka hai, jaise <code>wan-interfaces vni-0/0 transport Internet</code>.</dd>
<dt>Transport domain</dt><dd>WAN circuits ka named group jo ek dusre tak pahunch sakte hain, jaise Internet ya MPLS. Controller un domains ki list rakhta hai jo woh support karta hai.</dd>
<dt>Serial number</dt><dd>Unique device identifier, jaise VOS-BR1-0001, jo Director zero-touch onboarding ke dauraan device pehchanne ke liye use karta hai (aage ke chapter aur module mein).</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Nayi Delhi branch serial VOS-BR1-0001 ke saath ship hui. Woh organization Acme, site-id 101, LAN 10.1.1.0/24, vni-0/0 par Internet (203.0.113.6/30), Controller 198.51.100.20 hogi. Kisi ke login karne se pehle likhi planning table mein bilkul yahi paanch facts hote hain. Labs mein aap jo bhi configure karoge woh aisi hi table se aata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Do branches par same site-id use karna, jisse Controller unhe ek hi site maan leta hai. (2) Organization name alag case ya spelling mein type karna (Acme versus ACME). (3) Controller address ki jagah LAN address use karna. (4) Live branch ka site-id bina planning ke badalna, kyunki routes aur policies usi par depend hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Site-id organization ke andar har site ke liye unique hota hai, tenants ke across globally nahi. Do alag organizations numbers reuse kar sakti hain, lekin ek organization ke andar duplicates errors hain.</p></div>

<div class="scn"><h4>Copy-paste wali branch</h4><p>Ek engineer ne Jaipur up karne ke liye Delhi ki configuration clone ki aur site-id badalna bhool gaya. Jaipur up aayi aur ek minute ke andar Delhi ka overlay gir gaya. Controller ne dekha ki do devices site 101 claim kar rahe hain aur jo last connect hua uspar switch karta raha. Engineer ne dono configurations side by side compare ki, Jaipur ko site-id 104 diya aur commit kiya. Delhi bina chhue recover ho gayi.</p><p><b>Seekh:</b> identity values copy karna sabse khatarnak cheez hai. Planning table rakho aur har commit se pehle check karo.</p></div>

<div class="iv"><p class="q">"Versa mein organization aur site mein kya farak hai?"</p><p>Strong answer: organization (tenant) logical customer ya administrative domain hai jiski policies aur routes isolated hain; site ek physical location hai jiska us organization ke andar unique numeric site-id hota hai. Branches ko Controller ki organization match karni hoti hai, aur har ek ko unique site-id aur reachable Controller address chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen identity facts: organization, site-id aur Controller address; plus WAN-to-transport mapping.</li>
<li>Branch aur Controller ko organization name par agree hona chahiye.</li>
<li>Site-ids organization ke andar unique hone chahiye; lab 101, 102, 103 use karta hai.</li>
<li>Configure karne se pehle identity ki table plan karo; kabhi config blindly copy mat karo.</li>
<li>org transport aur overlay settings rakhta hai; org-services services aur policy rakhta hai.</li>
</ul></div>
`}};export{e as default};