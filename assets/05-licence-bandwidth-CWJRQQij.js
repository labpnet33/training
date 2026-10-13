var e={id:`licence-bandwidth`,h:{en:`Licences and the bandwidth model`,hi:`Licences aur bandwidth model`},body:{en:`
<p>Prisma Access is sold as a subscription, and what you can build depends on what you bought. Engineers who ignore the licence meet strange limits: a missing location, a rejected push, or a branch with no bandwidth. This chapter covers what is licensed and how bandwidth is shared.</p>

<h3>Analogy: a mobile phone plan</h3>
<p>A plan has separate buckets: the number of SIM cards (users), the data allowance (bandwidth), and the countries you may roam in (locations). Prisma Access licensing works the same way. You buy capacity for mobile users, bandwidth for remote networks, and optionally add-ons for service connections.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Licence buckets">
<rect x="20" y="30" width="190" height="90" rx="8" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="13">Mobile users</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="11">by user count</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="11">Local or Worldwide</text>
<rect x="225" y="30" width="190" height="90" rx="8" fill="#bbf7d0"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">Remote network bandwidth</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">Mbps per compute location</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">minimum 50 Mbps each</text>
<rect x="430" y="30" width="190" height="90" rx="8" fill="#fde68a"/><text x="525" y="58" text-anchor="middle" class="svg-ink" font-size="13">Service connections</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="11">up to 5 in base licence</text><text x="525" y="100" text-anchor="middle" class="svg-muted" font-size="11">up to 200 with add-on</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Three buckets to check before design</text>
</svg><p class="cap">The three licence buckets and their documented limits.</p></div>

<h3>Mobile user licences</h3>
<p>Mobile users are licensed by <b>user count</b>. There are two location scopes in the planning checklist: the <b>Local</b> licence allows at most five combined locations, and the <b>Worldwide</b> licence has no such restriction. If a design needs users in many regions, the Local licence will block it.</p>

<h3>The aggregate bandwidth model</h3>
<p>From release 4.0 the documentation describes the <b>aggregate bandwidth model</b>. You allocate bandwidth per <b>compute location</b>, and Prisma Access divides that amount among the remote network sites there. The minimum is <b>50 Mbps per compute location</b>; the maximum is whatever licensed bandwidth remains. From release 6.0 you can allocate either per site or by compute location, and new 6.0 deployments allocate per site. On Panorama, moving from per-location allocation to the aggregate model is <b>permanent</b>, so confirm before you change it.</p>
<table class="cmp"><tr><th>Model</th><th>Unit you allocate</th><th>Notes</th></tr>
<tr><td>Per location (older)</td><td>Each location</td><td>Moving to aggregate is permanent in Panorama</td></tr>
<tr><td>Aggregate</td><td>Compute location</td><td>Minimum 50 Mbps; shared by sites there</td></tr>
<tr><td>Per site (6.0 and later)</td><td>Each site</td><td>Default for new 6.0 deployments</td></tr>
</table>
<pre class="out">Bandwidth Management (lab console view)
Compute location    Allocated    Licensed pool left
Asia South          <span class="hl">150 Mbps</span>     250 Mbps
India North          50 Mbps     200 Mbps
</pre>

<h3>Service connection limits</h3>
<p>Base licences allow up to <b>5 service connections</b>. The Private Application add-on allows up to <b>200 per tenant</b>. Each IPSec termination node gives up to 1,000 Mbps, so large links use more than one node.</p>

<h3>Activation</h3>
<p>For the Panorama-managed path, licence activation is a multi-step flow in the common services hub, which ends with a one-time password (OTP) that you enter on Panorama so it trusts the cloud service. This is concept only in the simulator. If a licence changes or expires, the plugin can fail validation; the knowledge base documents this error text: <code>Error getting list of services: Prisma access edition license capabilities not present Failed plugin validation</code>.</p>

<div class="eg"><p><b>Worked example.</b> A company buys 500 Mbps of remote network bandwidth. It uses three compute locations. It allocates 200, 150 and 100 Mbps, which is 450 Mbps, and keeps 50 Mbps unallocated for a new branch. Trying to allocate 40 Mbps to a fourth compute location is rejected, because the minimum is 50. Trying to use all 500 and then adding a fourth compute location also fails because the pool is exhausted.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Planning a global rollout on a Local licence. (2) Creating a sixth service connection on a base licence. (3) Allocating below 50 Mbps. (4) Switching a Panorama tenant to aggregate without realising it cannot be reversed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mobile users are licensed by user count; remote networks by bandwidth. Do not mix them. And remember the numbers: 50 Mbps minimum, 5 combined locations (Local), 5 and 200 service connections, 1,000 Mbps per node.</p></div>

<div class="scn"><h4>The plugin that would not validate</h4><p>After a renewal, an administrator saw the plugin error about licence capabilities and Prisma Access pushes failed. The administrator checked the licence status in the common services hub, found that the renewal had changed the edition entry, re-fetched the licence on Panorama, and the next push succeeded.</p><p><b>Lesson:</b> when a push fails with a licence message, check the licence before touching the configuration.</p></div>

<div class="iv"><p class="q">"How is bandwidth allocated for remote networks?"</p><p>Strong answer: in the aggregate model it is allocated per compute location, minimum 50 Mbps, and Prisma Access divides it among the sites there. From 6.0 you can allocate per site, and new 6.0 deployments do. On Panorama, switching to aggregate is permanent. Mobile users are licensed separately by user count.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three buckets: mobile user count, remote network bandwidth, service connections.</li>
<li>Aggregate model: per compute location, minimum 50 Mbps.</li>
<li>Local licence: at most five combined locations; Worldwide has no restriction.</li>
<li>Service connections: 5 in base licences, up to 200 with the Private Application add-on.</li>
<li>Licence problems surface as plugin validation errors, so check the licence first.</li>
</ul></div>
`,hi:`
<p>Prisma Access subscription ke roop mein bikta hai, aur aap kya bana sakte ho woh aapne kya khareeda us par depend karta hai. Jo engineers licence ignore karte hain unhe ajeeb limits milti hain: koi location missing, push reject, ya branch ke paas bandwidth nahi. Yeh chapter batata hai ki kya licensed hota hai aur bandwidth kaise share hoti hai.</p>

<h3>Analogy: mobile phone plan</h3>
<p>Plan mein alag buckets hote hain: SIM cards ki sankhya (users), data allowance (bandwidth), aur kin deshon mein roam kar sakte ho (locations). Prisma Access licensing bhi aisi hi hai. Aap mobile users ki capacity, remote networks ki bandwidth, aur optionally service connections ke add-ons khareedte ho.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Licence buckets">
<rect x="20" y="30" width="190" height="90" rx="8" fill="#bae6fd"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="13">Mobile users</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="11">user count se</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="11">Local ya Worldwide</text>
<rect x="225" y="30" width="190" height="90" rx="8" fill="#bbf7d0"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">Remote network bandwidth</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">Mbps per compute location</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">minimum 50 Mbps each</text>
<rect x="430" y="30" width="190" height="90" rx="8" fill="#fde68a"/><text x="525" y="58" text-anchor="middle" class="svg-ink" font-size="13">Service connections</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="11">base licence mein 5 tak</text><text x="525" y="100" text-anchor="middle" class="svg-muted" font-size="11">add-on ke saath 200 tak</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Design se pehle teen buckets check karo</text>
</svg><p class="cap">Teen licence buckets aur unki documented limits.</p></div>

<h3>Mobile user licences</h3>
<p>Mobile users <b>user count</b> se licensed hote hain. Planning checklist mein location scope ke do options hain: <b>Local</b> licence maximum paanch combined locations allow karta hai, aur <b>Worldwide</b> licence par aisi koi restriction nahi. Agar design mein kai regions ke users chahiye to Local licence rok dega.</p>

<h3>Aggregate bandwidth model</h3>
<p>Release 4.0 se documentation <b>aggregate bandwidth model</b> describe karti hai. Aap bandwidth <b>compute location</b> ke hisaab se allocate karte ho, aur Prisma Access us amount ko wahan ki remote network sites mein baant deta hai. Minimum <b>50 Mbps per compute location</b> hai; maximum jitni licensed bandwidth bachi ho. Release 6.0 se aap per site ya compute location ke hisaab se allocate kar sakte ho, aur naye 6.0 deployments per site allocate karte hain. Panorama par per-location allocation se aggregate model mein jaana <b>permanent</b> hai, isliye badalne se pehle confirm karo.</p>
<table class="cmp"><tr><th>Model</th><th>Jis unit par allocate karte ho</th><th>Notes</th></tr>
<tr><td>Per location (purana)</td><td>Har location</td><td>Panorama mein aggregate par jaana permanent hai</td></tr>
<tr><td>Aggregate</td><td>Compute location</td><td>Minimum 50 Mbps; wahan ki sites share karti hain</td></tr>
<tr><td>Per site (6.0 aur baad)</td><td>Har site</td><td>Naye 6.0 deployments ka default</td></tr>
</table>
<pre class="out">Bandwidth Management (lab console view)
Compute location    Allocated    Licensed pool left
Asia South          <span class="hl">150 Mbps</span>     250 Mbps
India North          50 Mbps     200 Mbps
</pre>

<h3>Service connection limits</h3>
<p>Base licences <b>5 service connections</b> tak allow karte hain. Private Application add-on <b>per tenant 200</b> tak allow karta hai. Har IPSec termination node 1,000 Mbps tak deta hai, isliye bade links ek se zyada nodes use karte hain.</p>

<h3>Activation</h3>
<p>Panorama-managed path ke liye licence activation common services hub mein multi-step flow hai, jo ek one-time password (OTP) par khatam hota hai jo aap Panorama par enter karte ho taaki woh cloud service par trust kare. Simulator mein yeh sirf concept hai. Agar licence badle ya expire ho, plugin validation fail ho sakta hai; knowledge base yeh error text document karta hai: <code>Error getting list of services: Prisma access edition license capabilities not present Failed plugin validation</code>.</p>

<div class="eg"><p><b>Worked example.</b> Ek company 500 Mbps remote network bandwidth khareedti hai. Woh teen compute locations use karti hai. 200, 150 aur 100 Mbps allocate karti hai, yaani 450 Mbps, aur nayi branch ke liye 50 Mbps unallocated rakhti hai. Chauthe compute location ko 40 Mbps allocate karna reject hota hai, kyunki minimum 50 hai. Saari 500 use karke chautha compute location jodna bhi fail hota hai kyunki pool khatam hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Local licence par global rollout plan karna. (2) Base licence par chhatha service connection banana. (3) 50 Mbps se kam allocate karna. (4) Panorama tenant ko aggregate par switch karna bina jaane ki yeh reverse nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mobile users user count se licensed hote hain; remote networks bandwidth se. Inhe mix mat karo. Numbers yaad rakho: 50 Mbps minimum, 5 combined locations (Local), service connections 5 aur 200, per node 1,000 Mbps.</p></div>

<div class="scn"><h4>Plugin jo validate nahi ho raha tha</h4><p>Renewal ke baad administrator ko licence capabilities wala plugin error dikha aur Prisma Access pushes fail hone lage. Administrator ne common services hub mein licence status dekha, paaya ki renewal ne edition entry badal di thi, Panorama par licence dobara fetch kiya, aur agla push succeed ho gaya.</p><p><b>Seekh:</b> push licence message ke saath fail ho to configuration chhedne se pehle licence check karo.</p></div>

<div class="iv"><p class="q">"Remote networks ke liye bandwidth kaise allocate hoti hai?"</p><p>Strong answer: aggregate model mein compute location ke hisaab se, minimum 50 Mbps, aur Prisma Access use wahan ki sites mein baant deta hai. 6.0 se per site allocate kar sakte ho, aur naye 6.0 deployments karte hain. Panorama par aggregate par switch permanent hai. Mobile users alag se user count par licensed hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen buckets: mobile user count, remote network bandwidth, service connections.</li>
<li>Aggregate model: per compute location, minimum 50 Mbps.</li>
<li>Local licence: maximum paanch combined locations; Worldwide par koi restriction nahi.</li>
<li>Service connections: base licence mein 5, Private Application add-on ke saath 200 tak.</li>
<li>Licence problems plugin validation errors ke roop mein dikhti hain, isliye pehle licence check karo.</li>
</ul></div>
`}};export{e as default};