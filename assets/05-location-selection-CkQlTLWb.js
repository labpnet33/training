var e={id:`location-selection`,h:{en:`Locations: how the GlobalProtect app picks where to connect`,hi:`Locations: GlobalProtect app kahan connect karna hai yeh kaise chunta hai`},body:{en:`
<p>Prisma Access has many locations around the world. A traveller in Pune should connect near Pune, not across an ocean. Two things decide this: which locations <b>you enable</b>, and the rules the app follows to <b>select</b> one. A user can authenticate perfectly and still fail if there is no suitable enabled location.</p>

<h3>Analogy: choosing the nearest petrol station</h3>
<p>Your navigation app suggests the nearest open petrol station. If the nearest one is closed, it suggests the next nearest in the same city, then a bigger station in the region. If you tell it your company only has fuel cards for certain stations, it will only suggest those. Enabled locations are the stations your company has cards for.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Location selection order">
<rect x="20" y="80" width="120" height="56" rx="8" fill="#bae6fd"/><text x="80" y="104" text-anchor="middle" class="svg-ink" font-size="12">User in a</text><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="12">country</text>
<rect x="180" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="245" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Enabled location</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="11">in that country</text>
<rect x="180" y="95" width="130" height="50" rx="8" fill="#fde68a"/><text x="245" y="117" text-anchor="middle" class="svg-ink" font-size="12">2 Same-country</text><text x="245" y="133" text-anchor="middle" class="svg-muted" font-size="11">alternatives</text>
<rect x="340" y="95" width="130" height="50" rx="8" fill="#fed7aa"/><text x="405" y="117" text-anchor="middle" class="svg-ink" font-size="12">3 Regional</text><text x="405" y="133" text-anchor="middle" class="svg-muted" font-size="11">fallback</text>
<rect x="500" y="95" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="117" text-anchor="middle" class="svg-ink" font-size="12">4 Global</text><text x="560" y="133" text-anchor="middle" class="svg-muted" font-size="11">fallback</text>
<line x1="140" y1="108" x2="180" y2="55" stroke="#64748b"/><line x1="310" y1="120" x2="340" y2="120" stroke="#64748b"/><line x1="470" y1="120" x2="500" y2="120" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Order from the documented selection logic</text>
</svg><p class="cap">The sequence the app follows. The page does not explain ranking details beyond this.</p></div>

<h3>The documented selection logic</h3>
<ol>
<li>If the user is in a country that has an <b>enabled</b> Prisma Access location, the app connects there.</li>
<li>Otherwise it tries alternatives in the same country.</li>
<li>Then it uses <b>regional fallbacks</b>: Hong Kong, and Japan Central or South for Asia; Netherlands Central for Europe, Africa and the Middle East; US Northwest for the Americas.</li>
<li>Finally it uses global ones.</li>
</ol>
<p>If the administrator allows it, users can <b>pick a location manually</b>. The documentation also advises enabling locations in <b>more than one compute location</b> for resilience.</p>
<div class="note"><p><b>What this course does not claim.</b> How the app ranks "best available" gateways, whether internal or external gateways have priority, and SSL versus IPsec preference are not covered by the selection page, so this course does not teach them as facts.</p></div>

<h3>Where to configure</h3>
<table class="cmp"><tr><th>Tool</th><th>Path</th></tr>
<tr><td>SCM</td><td>Mobile Users &gt; GlobalProtect &gt; Infrastructure &gt; Prisma Access Locations</td></tr>
<tr><td>Panorama</td><td>Mobile Users - GlobalProtect &gt; Locations tab</td></tr>
</table>
<pre class="out">Prisma Access Locations (lab console view)
Location       Compute location   Enabled
India West     Asia South         <span class="hl">Yes</span>
India South    Asia South         No
India North    India North        No
</pre>
<p>Only India West is enabled here. A user in Delhi would not connect to India North, because it is not enabled; the app falls back as above. That is allowed but may add delay. A better design enables India North too, and in a second compute location.</p>

<div class="eg"><p><b>Worked example.</b> A company has staff in Pune, Delhi and Singapore. The administrator enables India West and India South (compute location Asia South), India North (its own compute location) and a Singapore location. A Delhi user now connects to India North. If India North has an issue, the app can use another enabled option rather than failing. In the lab only one location is enabled, so the failure case is easy to reproduce: disable it and watch the laptop fail.</p></div>

<h3>How to test a location change</h3>
<p>After enabling or disabling a location and pushing, confirm in the status view that the location shows as deployed. Then connect from a test device and check which location the Users view reports. If the lab laptop lands on a different location than you expected, compare its country with the enabled list and apply the fallback order you just learned.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling only one location, so a single issue breaks everyone. (2) Enabling locations all in one compute location. (3) Assuming licence limits do not matter: a Local licence allows at most five combined locations. (4) Forgetting to push after enabling a location.</p></div>
<div class="exam"><p><b>Exam trap.</b> Selection prefers an enabled location in the user's country. The regional fallbacks are named: Hong Kong and Japan for Asia, Netherlands Central for Europe, Africa and Middle East, US Northwest for the Americas.</p></div>

<div class="scn"><h4>Only one city enabled</h4><p>A company enabled one location at install time and never revisited it. When staff began travelling to Europe, they connected to a far location and complained of slow screens. The administrator enabled a European location in a second compute location, pushed, and travelling staff connected nearby.</p><p><b>Lesson:</b> review enabled locations whenever the workforce moves.</p></div>

<div class="iv"><p class="q">"How does GlobalProtect choose a Prisma Access location?"</p><p>Strong answer: it prefers an enabled location in the user's country, then same-country alternatives, then regional fallbacks, then global; admins can allow manual choice. Enable locations in more than one compute location and mind the licence scope.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>You enable locations; the app selects among them.</li>
<li>Order: same-country, same-country alternatives, regional fallback, global.</li>
<li>Enable more than one compute location.</li>
<li>Local licence limits combined locations to five.</li>
<li>Push after changing locations.</li>
</ul></div>
`,hi:`
<p>Prisma Access ke duniya bhar mein kai locations hain. Pune mein travel kar raha insaan Pune ke paas connect hona chahiye, samundar paar nahi. Do cheezein yeh decide karti hain: aap kaun se locations <b>enable</b> karte ho, aur app ek ko <b>select</b> karne ke liye kaun se rules follow karta hai. User bilkul sahi authenticate ho sakta hai aur phir bhi fail ho sakta hai agar koi suitable enabled location na ho.</p>

<h3>Analogy: sabse paas ka petrol station chunna</h3>
<p>Aapka navigation app sabse paas ka khula petrol station suggest karta hai. Sabse paas wala band ho to usi shehar mein agla suggest karta hai, phir region ka bada station. Agar aap bata do ki company ke paas sirf kuch stations ke fuel cards hain, to woh sirf wahi suggest karega. Enabled locations woh stations hain jinke cards company ke paas hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Location selection order">
<rect x="20" y="80" width="120" height="56" rx="8" fill="#bae6fd"/><text x="80" y="104" text-anchor="middle" class="svg-ink" font-size="12">Kisi country</text><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="12">mein user</text>
<rect x="180" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="245" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Enabled location</text><text x="245" y="68" text-anchor="middle" class="svg-muted" font-size="11">us country mein</text>
<rect x="180" y="95" width="130" height="50" rx="8" fill="#fde68a"/><text x="245" y="117" text-anchor="middle" class="svg-ink" font-size="12">2 Same-country</text><text x="245" y="133" text-anchor="middle" class="svg-muted" font-size="11">alternatives</text>
<rect x="340" y="95" width="130" height="50" rx="8" fill="#fed7aa"/><text x="405" y="117" text-anchor="middle" class="svg-ink" font-size="12">3 Regional</text><text x="405" y="133" text-anchor="middle" class="svg-muted" font-size="11">fallback</text>
<rect x="500" y="95" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="117" text-anchor="middle" class="svg-ink" font-size="12">4 Global</text><text x="560" y="133" text-anchor="middle" class="svg-muted" font-size="11">fallback</text>
<line x1="140" y1="108" x2="180" y2="55" stroke="#64748b"/><line x1="310" y1="120" x2="340" y2="120" stroke="#64748b"/><line x1="470" y1="120" x2="500" y2="120" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Documented selection logic ka order</text>
</svg><p class="cap">App jo sequence follow karta hai. Page is se aage ranking details explain nahi karta.</p></div>

<h3>Documented selection logic</h3>
<ol>
<li>Agar user aise country mein hai jahan <b>enabled</b> Prisma Access location hai, to app wahin connect hota hai.</li>
<li>Warna woh usi country ke alternatives try karta hai.</li>
<li>Phir <b>regional fallbacks</b> use karta hai: Asia ke liye Hong Kong, aur Japan Central ya South; Europe, Africa aur Middle East ke liye Netherlands Central; Americas ke liye US Northwest.</li>
<li>Aakhir mein global wale use karta hai.</li>
</ol>
<p>Administrator allow kare to users <b>manually location chun</b> sakte hain. Documentation resilience ke liye <b>ek se zyada compute location</b> mein locations enable karne ki salah bhi deti hai.</p>
<div class="note"><p><b>Yeh course kya claim nahi karta.</b> App "best available" gateways ko kaise rank karta hai, internal ya external gateways ko priority milti hai ya nahi, aur SSL versus IPsec preference, selection page cover nahi karta, isliye course inhe facts ke roop mein nahi sikhata.</p></div>

<h3>Kahan configure karein</h3>
<table class="cmp"><tr><th>Tool</th><th>Path</th></tr>
<tr><td>SCM</td><td>Mobile Users &gt; GlobalProtect &gt; Infrastructure &gt; Prisma Access Locations</td></tr>
<tr><td>Panorama</td><td>Mobile Users - GlobalProtect &gt; Locations tab</td></tr>
</table>
<pre class="out">Prisma Access Locations (lab console view)
Location       Compute location   Enabled
India West     Asia South         <span class="hl">Yes</span>
India South    Asia South         No
India North    India North        No
</pre>
<p>Yahan sirf India West enabled hai. Delhi ka user India North se connect nahi hoga, kyunki woh enabled nahi hai; app upar bataye tareeke se fallback karta hai. Yeh allowed hai lekin delay badha sakta hai. Behtar design India North ko bhi enable karta hai, aur doosre compute location mein.</p>

<div class="eg"><p><b>Worked example.</b> Company ka staff Pune, Delhi aur Singapore mein hai. Administrator India West aur India South (compute location Asia South), India North (apna compute location) aur ek Singapore location enable karta hai. Delhi ka user ab India North se connect hota hai. India North mein issue aaye to app fail hone ke bajaye koi doosra enabled option use kar sakta hai. Lab mein sirf ek location enabled hai, isliye failure case aasaani se reproduce hota hai: use disable karo aur laptop ko fail hote dekho.</p></div>

<h3>Location change ko kaise test karein</h3>
<p>Location enable ya disable karke push karne ke baad status view mein confirm karo ki location deployed dikh raha hai. Phir test device se connect karo aur dekho Users view kaunsa location report karta hai. Lab laptop expected se alag location par aaye to uske country ko enabled list se compare karo aur abhi seekha fallback order apply karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Sirf ek location enable karna, jisse ek issue sabko tod deta hai. (2) Saare locations ek hi compute location mein enable karna. (3) Maan lena ki licence limits matter nahi karti: Local licence maximum paanch combined locations allow karta hai. (4) Location enable karne ke baad push bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Selection user ke country ke enabled location ko prefer karta hai. Regional fallbacks named hain: Asia ke liye Hong Kong aur Japan, Europe, Africa aur Middle East ke liye Netherlands Central, Americas ke liye US Northwest.</p></div>

<div class="scn"><h4>Sirf ek shehar enabled</h4><p>Ek company ne install ke waqt ek location enable kiya aur kabhi dobara review nahi kiya. Jab staff Europe travel karne laga, woh door ke location se connect hua aur slow screens ki shikayat ki. Administrator ne doosre compute location mein European location enable kiya, push kiya, aur travelling staff paas se connect hone laga.</p><p><b>Seekh:</b> workforce jab move kare, enabled locations review karo.</p></div>

<div class="iv"><p class="q">"GlobalProtect Prisma Access location kaise chunta hai?"</p><p>Strong answer: woh user ke country ke enabled location ko prefer karta hai, phir same-country alternatives, phir regional fallbacks, phir global; admins manual choice allow kar sakte hain. Ek se zyada compute location mein locations enable karo aur licence scope ka dhyan rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Locations aap enable karte ho; app unme se select karta hai.</li>
<li>Order: same-country, same-country alternatives, regional fallback, global.</li>
<li>Ek se zyada compute location enable karo.</li>
<li>Local licence combined locations ko paanch tak limit karta hai.</li>
<li>Locations badalne ke baad push karo.</li>
</ul></div>
`}};export{e as default};