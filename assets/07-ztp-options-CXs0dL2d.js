var e={id:`ztp-options`,h:{en:`ZTP and staging options`,hi:`ZTP aur staging options`},body:{en:`
<p>To start a car you need a key, but cars use different kinds: a metal key, a key fob, a phone app. The goal is the same: prove you may start this car. Staging a Versa branch also has several "keys". They differ in how the first bit of configuration (underlay address, serial, Controller address) reaches the box. After that first contact, post-staging is identical.</p>

<h3>The staging inputs, whichever method you use</h3>
<p>Every method must give the branch three things: <b>a way onto the underlay</b>, <b>its identity</b> (serial number) and <b>where the Controller is</b>. Real Versa staging also involves a <b>local authentication</b> credential so that the device can be accessed or authenticated during staging; plan how that secret is stored and rotated, and never keep it in a spreadsheet that is widely shared.</p>

<h3>Option 1: manual staging</h3>
<p>An engineer (on site or on a console, or a partner's staging bench) logs in to the new device and enters the minimum: WAN address and route, serial, Controller. In the course model the WAN part is already done and you run the staging command that carries the serial and the Controller:</p>
<pre class="code">admin@Branch3-cli&gt; request staging start serial VOS-BR3-0001 controller 198.51.100.20</pre>
<pre class="out">Staging started for serial VOS-BR3-0001 toward controller 198.51.100.20. Check: show system staging status</pre>
<p>This <code>request staging</code> form is a <b>course-model helper</b>. In the real product the equivalent is performed by the staging procedure and scripts provided by Versa, or by the Director wizard-generated bootstrap data. The idea is the same. Manual staging is flexible and works with any underlay, but it needs a skilled person for each box.</p>

<h3>Option 2: pre-staged hardware from a partner or factory</h3>
<p>The device is staged <b>before shipping</b>: serial and Controller are loaded at a staging centre or by the vendor or reseller. At the site, a non-technical person plugs in power and a WAN cable. This is the usual choice when the site has no engineer.</p>

<h3>Option 3: cloud-assisted ZTP</h3>
<p>Versa offers zero-touch provisioning approaches in which a device with factory software finds a cloud-hosted redirect or provisioning service after it gets an address, then learns its Controller. The exact services and device models supported vary by release and hardware, so check the product documentation for your version. For the exam you need the principle: a trusted discovery step replaces typing the Controller address.</p>

<h3>Option 4: DHCP-based underlay</h3>
<p>Many branches do not have static Internet addresses. The device gets its WAN address, gateway and DNS from the provider using <b>DHCP</b>. This removes the per-site static WAN values from your bind data (no wan1-address, no wan1-gateway) but the template must then expect a DHCP interface. In the course lab the Internet circuit is static, so the bind data carries the address and gateway.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Staging options compared">
<rect x="15" y="20" width="145" height="95" rx="8" fill="#bae6fd"/><text x="87" y="44" text-anchor="middle" class="svg-ink" font-size="13">Manual</text><text x="87" y="64" text-anchor="middle" class="svg-muted" font-size="12">engineer types</text><text x="87" y="80" text-anchor="middle" class="svg-muted" font-size="12">serial + controller</text>
<rect x="175" y="20" width="145" height="95" rx="8" fill="#ddd6fe"/><text x="247" y="44" text-anchor="middle" class="svg-ink" font-size="13">Pre-staged</text><text x="247" y="64" text-anchor="middle" class="svg-muted" font-size="12">loaded before</text><text x="247" y="80" text-anchor="middle" class="svg-muted" font-size="12">shipping</text>
<rect x="335" y="20" width="145" height="95" rx="8" fill="#bbf7d0"/><text x="407" y="44" text-anchor="middle" class="svg-ink" font-size="13">Cloud ZTP</text><text x="407" y="64" text-anchor="middle" class="svg-muted" font-size="12">device discovers</text><text x="407" y="80" text-anchor="middle" class="svg-muted" font-size="12">its controller</text>
<rect x="495" y="20" width="135" height="95" rx="8" fill="#fde68a"/><text x="562" y="44" text-anchor="middle" class="svg-ink" font-size="13">DHCP underlay</text><text x="562" y="64" text-anchor="middle" class="svg-muted" font-size="12">address and</text><text x="562" y="80" text-anchor="middle" class="svg-muted" font-size="12">gateway learned</text>
<rect x="15" y="150" width="615" height="50" rx="8" fill="#e2e8f0"/><text x="322" y="172" text-anchor="middle" class="svg-ink" font-size="13">All lead to the same thing: tunnel to the Controller, then Director push</text><text x="322" y="190" text-anchor="middle" class="svg-muted" font-size="12">Staging methods differ only in how the first contact data arrives</text>
<line x1="87" y1="115" x2="87" y2="150" stroke="#64748b"/><line x1="247" y1="115" x2="247" y2="150" stroke="#64748b"/><line x1="407" y1="115" x2="407" y2="150" stroke="#64748b"/><line x1="562" y1="115" x2="562" y2="150" stroke="#64748b"/>
</svg><p class="cap">Four ways to deliver the first-contact data; the second half of onboarding is identical.</p></div>

<h3>Choosing a method</h3>
<table class="cmp"><tr><th>Method</th><th>Skill at site</th><th>Best for</th><th>Watch out</th></tr>
<tr><td>Manual</td><td>engineer</td><td>pilots, labs, odd underlays</td><td>typos, slow</td></tr>
<tr><td>Pre-staged</td><td>none</td><td>large retail rollouts</td><td>serial and controller must be right at the factory step</td></tr>
<tr><td>Cloud ZTP</td><td>none</td><td>fast, scalable</td><td>needs Internet and a supported device and release</td></tr>
<tr><td>DHCP underlay</td><td>none</td><td>broadband sites</td><td>no static address to verify; template must match</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A bank opens 6 branches in a week. Four are in cities with an engineer and use manual staging at 20 minutes each. Two are in remote towns; the devices are pre-staged at the partner and shipped. Same template, same group, same Director workflow for all six.</p></div>

<div class="warn"><p><b>Common mistakes:</b> staging with a Controller address that is correct for the lab but not the production Controller; assuming any hardware supports every ZTP method; testing from a network where the Internet underlay is blocked, so the staging tunnel can never form.</p></div>
<div class="exam"><p><b>Exam trap:</b> staging variety is only about first contact. It is not a different onboarding model. The Director push is always the second phase.</p></div>

<div class="scn"><h4>Pre-staged boxes, wrong Controller</h4><p>A partner pre-staged 15 devices with the Controller address of the test environment. At sites, all 15 built tunnels into the test Controller, which did not know them. The fix was to re-stage the boxes remotely where supported and correct the template used by the partner.</p><p><b>Lesson:</b> validate staging data against production before shipping, with a pilot box.</p></div>

<div class="iv"><p class="q">"What options exist for zero-touch deployment of a Versa branch?"</p><p>Manual staging by an engineer, pre-staging at a partner or vendor before shipping, cloud-assisted ZTP where the device discovers its Controller, and a DHCP underlay so addresses are learned. All end in the same Controller tunnel and Director push. I would check release and hardware support before promising a method.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every method must supply underlay access, serial identity and the Controller location.</li>
<li>Course model: <code>request staging start serial &lt;SN&gt; controller &lt;ip&gt;</code>, a helper for this step.</li>
<li>Pre-staging and ZTP remove the need for an engineer at site.</li>
<li>DHCP underlay changes what bind data contains.</li>
<li>Protect local authentication secrets; check hardware and release support.</li>
</ul></div>
`,hi:`
<p>Car start karne ke liye key chahiye, lekin cars mein alag kism ki keys hoti hain: metal key, key fob, phone app. Goal same hai: prove karo ki aap ye car start kar sakte ho. Versa branch ki staging ke bhi kai "keys" hain. Wo is baat mein alag hain ki pehli configuration (underlay address, serial, Controller address) box tak kaise pahunchti hai. Pehle contact ke baad post-staging bilkul same hai.</p>

<h3>Staging inputs, jo bhi method ho</h3>
<p>Har method ko branch ko teen cheezein deni hoti hain: <b>underlay par aane ka raasta</b>, <b>uski identity</b> (serial number) aur <b>Controller kahan hai</b>. Real Versa staging mein <b>local authentication</b> credential bhi hota hai taaki staging ke dauran device access ya authenticate ho sake; plan karo ki ye secret kahan store hoga aur kaise rotate hoga, aur ise kabhi bahut logon mein shared spreadsheet mein mat rakho.</p>

<h3>Option 1: manual staging</h3>
<p>Engineer (site par, console par, ya partner ke staging bench par) naye device mein login karke minimum enter karta hai: WAN address aur route, serial, Controller. Course model mein WAN part pehle se ho chuka hai aur aap wo staging command chalate ho jo serial aur Controller leti hai:</p>
<pre class="code">admin@Branch3-cli&gt; request staging start serial VOS-BR3-0001 controller 198.51.100.20</pre>
<pre class="out">Staging started for serial VOS-BR3-0001 toward controller 198.51.100.20. Check: show system staging status</pre>
<p>Ye <code>request staging</code> form ek <b>course-model helper</b> hai. Real product mein iska equivalent Versa ki staging procedure aur scripts, ya Director wizard se bane bootstrap data se hota hai. Idea same hai. Manual staging flexible hai aur kisi bhi underlay ke saath chalti hai, lekin har box ke liye skilled insaan chahiye.</p>

<h3>Option 2: partner ya factory se pre-staged hardware</h3>
<p>Device <b>shipping se pehle</b> stage hota hai: serial aur Controller staging centre par ya vendor ya reseller dwara load hote hain. Site par non-technical insaan sirf power aur WAN cable lagata hai. Jab site par engineer nahi hota to ye aam choice hai.</p>

<h3>Option 3: cloud-assisted ZTP</h3>
<p>Versa aise zero-touch provisioning approaches deta hai jisme factory software wala device address milne ke baad cloud-hosted redirect ya provisioning service dhundta hai aur phir apna Controller seekhta hai. Exact services aur supported device models release aur hardware ke hisaab se alag hote hain, isliye apne version ki product documentation dekho. Exam ke liye principle chahiye: ek trusted discovery step Controller address type karne ki jagah leta hai.</p>

<h3>Option 4: DHCP-based underlay</h3>
<p>Kai branches ke paas static Internet address nahi hota. Device provider se <b>DHCP</b> ke through WAN address, gateway aur DNS leta hai. Isse bind data se per-site static WAN values hat jaati hain (wan1-address nahi, wan1-gateway nahi), lekin template ko DHCP interface expect karna padega. Course lab mein Internet circuit static hai, isliye bind data mein address aur gateway hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Staging options compared">
<rect x="15" y="20" width="145" height="95" rx="8" fill="#bae6fd"/><text x="87" y="44" text-anchor="middle" class="svg-ink" font-size="13">Manual</text><text x="87" y="64" text-anchor="middle" class="svg-muted" font-size="12">engineer serial +</text><text x="87" y="80" text-anchor="middle" class="svg-muted" font-size="12">controller type kare</text>
<rect x="175" y="20" width="145" height="95" rx="8" fill="#ddd6fe"/><text x="247" y="44" text-anchor="middle" class="svg-ink" font-size="13">Pre-staged</text><text x="247" y="64" text-anchor="middle" class="svg-muted" font-size="12">shipping se pehle</text><text x="247" y="80" text-anchor="middle" class="svg-muted" font-size="12">load</text>
<rect x="335" y="20" width="145" height="95" rx="8" fill="#bbf7d0"/><text x="407" y="44" text-anchor="middle" class="svg-ink" font-size="13">Cloud ZTP</text><text x="407" y="64" text-anchor="middle" class="svg-muted" font-size="12">device apna</text><text x="407" y="80" text-anchor="middle" class="svg-muted" font-size="12">controller dhundta hai</text>
<rect x="495" y="20" width="135" height="95" rx="8" fill="#fde68a"/><text x="562" y="44" text-anchor="middle" class="svg-ink" font-size="13">DHCP underlay</text><text x="562" y="64" text-anchor="middle" class="svg-muted" font-size="12">address aur gateway</text><text x="562" y="80" text-anchor="middle" class="svg-muted" font-size="12">learn hote hain</text>
<rect x="15" y="150" width="615" height="50" rx="8" fill="#e2e8f0"/><text x="322" y="172" text-anchor="middle" class="svg-ink" font-size="13">Sab ek hi jagah pahunchte hain: Controller tunnel, phir Director push</text><text x="322" y="190" text-anchor="middle" class="svg-muted" font-size="12">Staging methods sirf first-contact data ke aane mein alag hain</text>
<line x1="87" y1="115" x2="87" y2="150" stroke="#64748b"/><line x1="247" y1="115" x2="247" y2="150" stroke="#64748b"/><line x1="407" y1="115" x2="407" y2="150" stroke="#64748b"/><line x1="562" y1="115" x2="562" y2="150" stroke="#64748b"/>
</svg><p class="cap">First-contact data deliver karne ke chaar tareeke; onboarding ka doosra half same hai.</p></div>

<h3>Method kaise choose karein</h3>
<table class="cmp"><tr><th>Method</th><th>Site par skill</th><th>Kiske liye best</th><th>Dhyan rakho</th></tr>
<tr><td>Manual</td><td>engineer</td><td>pilots, labs, odd underlays</td><td>typos, slow</td></tr>
<tr><td>Pre-staged</td><td>koi nahi</td><td>bade retail rollouts</td><td>factory step par serial aur controller sahi hone chahiye</td></tr>
<tr><td>Cloud ZTP</td><td>koi nahi</td><td>fast, scalable</td><td>Internet aur supported device aur release chahiye</td></tr>
<tr><td>DHCP underlay</td><td>koi nahi</td><td>broadband sites</td><td>verify karne ke liye static address nahi; template match karna chahiye</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek bank ek hafte mein 6 branches kholti hai. Chaar un shehron mein hain jahan engineer hai aur manual staging use karte hain, 20 minute har ek. Do remote towns mein hain; devices partner ke yahan pre-staged hoke ship hue. Chhe ke liye same template, same group, same Director workflow.</p></div>

<div class="warn"><p><b>Common mistakes:</b> staging mein aisa Controller address jo lab ke liye sahi hai lekin production Controller ka nahi; ye maan lena ki har hardware har ZTP method support karta hai; aise network se test karna jahan Internet underlay blocked hai, isliye staging tunnel kabhi ban hi nahi sakta.</p></div>
<div class="exam"><p><b>Exam trap:</b> staging variety sirf first contact ke baare mein hai. Ye alag onboarding model nahi hai. Director push hamesha doosra phase hai.</p></div>

<div class="scn"><h4>Pre-staged boxes, galat Controller</h4><p>Ek partner ne 15 devices test environment ke Controller address ke saath pre-stage kiye. Sites par saare 15 ne test Controller mein tunnels banaye, jo unhe jaanta nahi tha. Fix: jahan supported ho wahan boxes ko remotely re-stage karna aur partner ke use kiye template ko sudharna.</p><p><b>Lesson:</b> shipping se pehle ek pilot box ke saath staging data ko production ke against validate karo.</p></div>

<div class="iv"><p class="q">"Versa branch ke zero-touch deployment ke liye kaunse options hain?"</p><p>Engineer dwara manual staging, shipping se pehle partner ya vendor ke yahan pre-staging, cloud-assisted ZTP jisme device apna Controller discover karta hai, aur DHCP underlay jisme addresses learn hote hain. Sab same Controller tunnel aur Director push par khatam hote hain. Koi method promise karne se pehle main release aur hardware support check karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har method ko underlay access, serial identity aur Controller location deni hoti hai.</li>
<li>Course model: <code>request staging start serial &lt;SN&gt; controller &lt;ip&gt;</code>, is step ka helper.</li>
<li>Pre-staging aur ZTP site par engineer ki zaroorat hata dete hain.</li>
<li>DHCP underlay bind data ka content badal deta hai.</li>
<li>Local authentication secrets ko protect karo; hardware aur release support check karo.</li>
</ul></div>
`}};export{e as default};