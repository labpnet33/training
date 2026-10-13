var e={id:`rollout-planning`,h:{en:`What you will learn: planning a branch rollout`,hi:`Aap kya seekhoge: branch rollout ki planning`},body:{en:`
<p>Think of opening a new shop in a franchise chain. Head office does not send a manager to design every shop from scratch. It has a <b>standard shop layout</b> (the same shelves, the same billing counter, the same brand rules), and for each new shop it only needs a short form: address, phone number, shop number. Then a truck arrives with the stock and the shop opens. <b>Zero-touch onboarding</b> in Versa SD-WAN works the same way: one standard design, a small per-site form, and a branch device that configures itself when it comes online.</p>

<h3>What you will learn in this module</h3>
<ul>
<li>How to plan a rollout: site survey, addressing, circuits, serial numbers, naming and the bind-data sheet.</li>
<li>What a <b>template</b>, a <b>device group</b> and <b>bind data</b> are, and how they fit together.</li>
<li>The Director workflow for adding a device, and the two phases of onboarding: <b>staging</b> and <b>post-staging</b>.</li>
<li>The onboarding states in the course model, the verification commands, and a catalogue of failure modes.</li>
<li>A troubleshooting workflow, worked through on the lab ticket "Kolkata will not onboard", and basic change control.</li>
</ul>
<p><b>Prerequisites:</b> the earlier Versa modules: the architecture (Director, Controller, Analytics, VOS branches), underlay versus overlay, organizations (tenants), site-ids and transport domains. We do not re-teach them; we use them.</p>

<div class="note"><p><b>Real Versa versus the course model.</b> The real Director has a large GUI and REST API, and the real VOS CLI is much bigger than ours. This course uses a simplified CLI so you can practise the logic: what must exist, in which order, and what breaks when it does not. Wherever we show a command it is the course-model command; the concepts are the real ones.</p></div>

<h3>The big picture</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Onboarding big picture">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="14">Director</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="12">template + bind data</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">staging tunnel ends here</text>
<rect x="450" y="120" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="146" text-anchor="middle" class="svg-ink" font-size="14">Branch3 (Kolkata)</text><text x="535" y="165" text-anchor="middle" class="svg-muted" font-size="12">serial VOS-BR3-0001</text>
<line x1="190" y1="50" x2="235" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="405" y1="50" x2="535" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="500" y="80" class="svg-accent" font-size="12">1 staging</text>
<line x1="105" y1="80" x2="105" y2="150" stroke="#64748b" stroke-width="2"/><line x1="105" y1="150" x2="450" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="200" y="142" class="svg-accent" font-size="12">2 post-staging push</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Branch connects first to the Controller; the Director then pushes the full configuration</text>
</svg><p class="cap">The branch phones the Controller first (staging); the Director then pushes template plus bind data (post-staging).</p></div>

<h3>Why planning is the real work</h3>
<p>Onboarding commands are short. What fails in real rollouts is almost never the command; it is a wrong serial number copied from a delivery note, a gateway typed for the wrong circuit, or a site-id used twice. Good rollouts are decided in the spreadsheet before anyone touches the Director.</p>

<h3>Step 1: site survey</h3>
<p>For each site collect: city and site name, which circuits exist (Internet, MPLS, LTE), the carrier handoff (static address or DHCP), the LAN subnets, and whether the site needs a local breakout. Our course site Kolkata has two circuits, Internet and MPLS, and a LAN.</p>

<h3>Step 2: addressing plan</h3>
<p>The lab topology follows a pattern so that you can predict values. For site number k: LAN <code>10.1.k.0/24</code> with the gateway <code>.1</code>; Internet <code>203.0.113.(4k)/30</code> with the carrier at <code>.(4k+1)</code> and the branch at <code>.(4k+2)</code>; MPLS <code>172.31.k.0/30</code> with the PE at <code>.1</code> and the CE (your branch) at <code>.2</code>. For Kolkata, k = 3, giving LAN 10.1.3.1/24, Internet 203.0.113.14/30 via 203.0.113.13, and MPLS 172.31.3.2/30 via 172.31.3.1.</p>

<h3>Step 3: identity and naming</h3>
<p>Every site needs a unique <b>site-id</b> (101 Delhi, 102 Bengaluru, 103 Kolkata), a device name (Branch3), the hardware <b>serial number</b> and a tenant (organization Acme). Pick a naming convention once and keep it; names appear in templates, device groups, logs and tickets.</p>

<h3>Step 4: the bind-data spreadsheet</h3>
<table class="cmp"><tr><th>Device</th><th>Serial</th><th>Group</th><th>site-id</th><th>LAN</th><th>WAN1 / gateway</th><th>WAN2 / gateway</th></tr>
<tr><td>Branch3</td><td>VOS-BR3-0001</td><td>BRANCHES</td><td>103</td><td>10.1.3.1/24</td><td>203.0.113.14/30 / 203.0.113.13</td><td>172.31.3.2/30 / 172.31.3.1</td></tr></table>
<p>One row per site. Every column that the template needs is a column here. If a cell is empty, that value will be missing at push time. The sheet becomes the single source of truth, and the Director bind data is a copy of it.</p>

<div class="eg"><p><b>Worked example.</b> Rolling out 12 branches. The sheet has 12 rows and 8 columns, so 96 cells. A reviewer checks three things: site-ids unique, serials match the delivery notes, and each gateway lies inside its own /30. That 15-minute review prevents most failed onboardings.</p></div>

<div class="warn"><p><b>Common mistakes:</b> copying the serial from an email with a letter O instead of a zero; reusing the Delhi subnet for a new site; forgetting that WAN1 and WAN2 are the template interfaces in order, not "Internet" and "MPLS" by name.</p></div>
<div class="exam"><p><b>Exam trap:</b> zero-touch does not mean zero planning. The device is touched by nobody, but the data must be prepared in advance.</p></div>

<div class="scn"><h4>The 40-site rollout that slipped</h4><p>A retail customer scheduled 40 stores over four weekends. Week one, nine stores stayed offline. The cause: the spreadsheet had serial numbers typed by hand from photos of boxes; nine had a transposed digit. The Director showed those devices as not found. The team re-keyed serials from the supplier file and finished the next weekend.</p><p><b>Lesson:</b> import serials from the supplier's file, never retype them.</p></div>

<div class="iv"><p class="q">"What do you prepare before onboarding a new SD-WAN branch?"</p><p>I collect site data in a bind-data sheet: unique site-id, serial, group, LAN prefix and each WAN address with its gateway. I check circuits and carrier handoff, confirm that the Controller and Director are reachable from the Internet transport, and only then create the device in the Director.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Onboarding = one standard template + one small per-site data row + a self-configuring device.</li>
<li>Plan in a sheet first: site-id, serial, group, LAN, WAN addresses and gateways.</li>
<li>Use a predictable addressing pattern; Kolkata is site 3 with site-id 103.</li>
<li>Most failures are data errors, not command errors.</li>
<li>The course CLI is a simplified model of the real Director and VOS.</li>
</ul></div>
`,hi:`
<p>Socho ek franchise chain mein naya shop khul raha hai. Head office har shop ka design scratch se nahi banata. Ek <b>standard shop layout</b> hota hai (same shelves, same billing counter, same brand rules), aur har naye shop ke liye sirf ek chhota form chahiye: address, phone number, shop number. Phir truck stock leke aata hai aur shop khul jata hai. Versa SD-WAN ka <b>zero-touch onboarding</b> bilkul aisa hi hai: ek standard design, ek chhota per-site form, aur branch device jo online aate hi khud ko configure kar leta hai.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>Rollout ki planning kaise karte hain: site survey, addressing, circuits, serial numbers, naming aur bind-data sheet.</li>
<li><b>Template</b>, <b>device group</b> aur <b>bind data</b> kya hain aur ye ek dusre se kaise jude hain.</li>
<li>Device add karne ka Director workflow, aur onboarding ke do phases: <b>staging</b> aur <b>post-staging</b>.</li>
<li>Course model ke onboarding states, verification commands aur failure modes ki catalogue.</li>
<li>Troubleshooting workflow, lab ticket "Kolkata will not onboard" par worked example ke saath, aur basic change control.</li>
</ul>
<p><b>Prerequisites:</b> pichhle Versa modules: architecture (Director, Controller, Analytics, VOS branches), underlay vs overlay, organizations (tenants), site-ids aur transport domains. Inhe dobara nahi padhate, bas use karte hain.</p>

<div class="note"><p><b>Real Versa aur course model.</b> Real Director mein bada GUI aur REST API hota hai, aur real VOS CLI hamare CLI se kaafi bada hai. Is course mein simplified CLI hai taaki aap logic practise karo: kya hona zaroori hai, kis order mein, aur na ho to kya tootta hai. Jo commands yahan dikhte hain wo course-model ke hain; concepts real hain.</p></div>

<h3>Big picture</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Onboarding big picture">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="14">Director</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="12">template + bind data</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">staging tunnel yahan end</text>
<rect x="450" y="120" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="146" text-anchor="middle" class="svg-ink" font-size="14">Branch3 (Kolkata)</text><text x="535" y="165" text-anchor="middle" class="svg-muted" font-size="12">serial VOS-BR3-0001</text>
<line x1="190" y1="50" x2="235" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="405" y1="50" x2="535" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="500" y="80" class="svg-accent" font-size="12">1 staging</text>
<line x1="105" y1="80" x2="105" y2="150" stroke="#64748b" stroke-width="2"/><line x1="105" y1="150" x2="450" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="200" y="142" class="svg-accent" font-size="12">2 post-staging push</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Branch pehle Controller se judta hai; phir Director poori configuration push karta hai</text>
</svg><p class="cap">Branch pehle Controller ko call karta hai (staging); phir Director template aur bind data push karta hai (post-staging).</p></div>

<h3>Planning hi asli kaam kyun hai</h3>
<p>Onboarding ke commands chhote hote hain. Real rollouts mein fail hone wali cheez command nahi hoti; wo hoti hai delivery note se galat copy kiya hua serial, galat circuit ka gateway, ya do baar use hua site-id. Achhe rollout spreadsheet mein decide hote hain, Director ko chhoone se pehle.</p>

<h3>Step 1: site survey</h3>
<p>Har site ke liye collect karo: city aur site name, kaun se circuits hain (Internet, MPLS, LTE), carrier handoff (static address ya DHCP), LAN subnets, aur local breakout chahiye ya nahi. Hamare course site Kolkata mein do circuits hain, Internet aur MPLS, aur ek LAN.</p>

<h3>Step 2: addressing plan</h3>
<p>Lab topology ek pattern follow karti hai taaki aap values predict kar sako. Site number k ke liye: LAN <code>10.1.k.0/24</code> gateway <code>.1</code> ke saath; Internet <code>203.0.113.(4k)/30</code> jisme carrier <code>.(4k+1)</code> aur branch <code>.(4k+2)</code>; MPLS <code>172.31.k.0/30</code> jisme PE <code>.1</code> aur CE (aapka branch) <code>.2</code>. Kolkata ke liye k = 3, to LAN 10.1.3.1/24, Internet 203.0.113.14/30 via 203.0.113.13, aur MPLS 172.31.3.2/30 via 172.31.3.1.</p>

<h3>Step 3: identity aur naming</h3>
<p>Har site ko unique <b>site-id</b> chahiye (101 Delhi, 102 Bengaluru, 103 Kolkata), device name (Branch3), hardware <b>serial number</b> aur tenant (organization Acme). Naming convention ek baar choose karo aur follow karo; names templates, device groups, logs aur tickets mein dikhte hain.</p>

<h3>Step 4: bind-data spreadsheet</h3>
<table class="cmp"><tr><th>Device</th><th>Serial</th><th>Group</th><th>site-id</th><th>LAN</th><th>WAN1 / gateway</th><th>WAN2 / gateway</th></tr>
<tr><td>Branch3</td><td>VOS-BR3-0001</td><td>BRANCHES</td><td>103</td><td>10.1.3.1/24</td><td>203.0.113.14/30 / 203.0.113.13</td><td>172.31.3.2/30 / 172.31.3.1</td></tr></table>
<p>Ek site, ek row. Template ko jo bhi column chahiye wo is sheet mein hona chahiye. Agar koi cell khali hai to push ke time wo value missing hogi. Sheet single source of truth hai aur Director bind data uski copy hai.</p>

<div class="eg"><p><b>Worked example.</b> 12 branches ka rollout. Sheet mein 12 rows aur 8 columns hain, yaani 96 cells. Reviewer teen cheezein check karta hai: site-ids unique, serials delivery notes se match, aur har gateway apne /30 ke andar. Ye 15 minute ka review zyadatar failed onboardings rok deta hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> email se serial copy karte time zero ki jagah letter O aa jana; naye site ke liye Delhi ka subnet reuse karna; ye bhool jana ki WAN1 aur WAN2 template interfaces ka order hain, naam se "Internet" aur "MPLS" nahi.</p></div>
<div class="exam"><p><b>Exam trap:</b> zero-touch ka matlab zero planning nahi hai. Device ko koi haath nahi lagata, lekin data pehle se ready hona chahiye.</p></div>

<div class="scn"><h4>40-site rollout jo slip ho gaya</h4><p>Ek retail customer ne 40 stores chaar weekends mein schedule kiye. Pehle hafte 9 stores offline rahe. Wajah: spreadsheet mein serial numbers boxes ki photos se haath se type kiye gaye the; 9 mein digits ulte the. Director ne un devices ko not found dikhaya. Team ne supplier file se serials dobara liye aur agle weekend finish kiya.</p><p><b>Lesson:</b> serials supplier ki file se import karo, kabhi dobara type mat karo.</p></div>

<div class="iv"><p class="q">"Naye SD-WAN branch ko onboard karne se pehle aap kya prepare karte ho?"</p><p>Main bind-data sheet banata hoon: unique site-id, serial, group, LAN prefix aur har WAN address gateway ke saath. Circuits aur carrier handoff check karta hoon, confirm karta hoon ki Controller aur Director Internet transport se reachable hain, aur tab Director mein device banata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Onboarding = ek standard template + ek chhoti per-site data row + self-configuring device.</li>
<li>Pehle sheet mein plan karo: site-id, serial, group, LAN, WAN addresses aur gateways.</li>
<li>Predictable addressing pattern use karo; Kolkata site 3 hai, site-id 103.</li>
<li>Zyadatar failures data errors hote hain, command errors nahi.</li>
<li>Course CLI real Director aur VOS ka simplified model hai.</li>
</ul></div>
`}};export{e as default};