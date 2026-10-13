var e={id:`hip-explicit-proxy`,h:{en:`HIP and Explicit Proxy: two concepts to know`,hi:`HIP aur Explicit Proxy: jaanne wale do concepts`},body:{en:`
<p>This chapter covers two ideas that appear in the exam objectives but are <b>concept only</b> in the simulator: <b>HIP</b> (host information profile) and <b>Explicit Proxy</b>. You will not configure them in the labs. You must be able to explain what they are, why you would use them, and where they appear.</p>

<h3>Part 1: HIP, a health check for the device</h3>
<h4>Analogy: a medical check at an airline gate</h4>
<p>Before boarding, a gate agent may check that your passport is valid and your vaccination papers are in order. You may be the right person but your papers can still be missing. HIP is the same for laptops: the user is authenticated, but is the device healthy?</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="HIP flow">
<rect x="20" y="60" width="140" height="60" rx="8" fill="#bae6fd"/><text x="90" y="86" text-anchor="middle" class="svg-ink" font-size="12">GlobalProtect app</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="11">collects host info</text>
<rect x="250" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="12">HIP report</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">sent to gateway</text>
<rect x="480" y="20" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="12">Rule matches: allow</text>
<rect x="480" y="110" width="140" height="56" rx="8" fill="#fed7aa"/><text x="550" y="142" text-anchor="middle" class="svg-ink" font-size="12">No match: restrict</text>
<line x1="160" y1="90" x2="250" y2="90" stroke="#64748b"/><line x1="390" y1="80" x2="480" y2="50" stroke="#64748b"/><line x1="390" y1="100" x2="480" y2="135" stroke="#64748b"/>
</svg><p class="cap">The app reports device state; rules can use the result.</p></div>

<p>The app sends a <b>host information profile</b> to Prisma Access. Administrators define <b>HIP objects</b> and <b>HIP profiles</b> in the device group, and then use the profiles as match criteria in security rules. For example, "allow access to payroll only from devices with disk encryption on and a supported operating system". A <b>HIP Match</b> log type records the matches, and HIP data can be redistributed to other firewalls (page: Redistribute HIP Information with Prisma Access). The simulator marks HIP as <i>not simulated</i>.</p>
<table class="cmp"><tr><th>Item</th><th>Meaning</th></tr>
<tr><td>HIP report</td><td>Device facts sent by the app</td></tr>
<tr><td>HIP object</td><td>One condition, such as a setting is on</td></tr>
<tr><td>HIP profile</td><td>Combination of objects used in a rule</td></tr>
<tr><td>HIP Match log</td><td>Record that a device matched a profile</td></tr>
</table>

<h3>Part 2: Explicit Proxy, browser traffic without a tunnel</h3>
<h4>Analogy: telling the post office to send all parcels through a depot</h4>
<p>Instead of building a private road (tunnel), you put a note on every parcel: "send via the depot". Only parcels with the note go there. Explicit Proxy works through browser settings, usually delivered by a PAC file, that point the browser at Prisma Access.</p>
<ul>
<li>It is the <b>second mobile user type</b>, next to GlobalProtect.</li>
<li>It redirects <b>browser traffic</b> using a <b>PAC file</b>; there is no tunnel.</li>
<li>It supports <b>SAML</b> and <b>Kerberos</b> for PAC deployments.</li>
<li>GlobalProtect can run in <b>tunnel and proxy mode</b>.</li>
<li>Paths: SCM uses the same Mobile Users entry. Panorama: <code>Cloud Services &gt; Configuration &gt; Mobile Users - Explicit Proxy</code>.</li>
</ul>
<table class="cmp"><tr><th>Question</th><th>GlobalProtect tunnel</th><th>Explicit Proxy</th></tr>
<tr><td>Covers</td><td>All or selected traffic from the device</td><td>Browser traffic that follows the PAC file</td></tr>
<tr><td>Needs an app?</td><td>Yes</td><td>No, browser settings</td></tr>
<tr><td>Gets a pool address?</td><td>Yes</td><td>No tunnel</td></tr>
<tr><td>Typical use</td><td>Full corporate access</td><td>Unmanaged or lightweight devices</td></tr>
</table>
<pre class="out">Mobile Users - Explicit Proxy (lab console view)
Status      <span class="hl">not simulated (concept only)</span>
PAC file    delivered to browsers by your device management
</pre>

<div class="eg"><p><b>Worked example.</b> A company has contractors on personal laptops who only need web applications, and employees on managed laptops who need full access. The employees get GlobalProtect with a HIP profile that requires disk encryption for the payroll application. The contractors get Explicit Proxy through a PAC file, so their web traffic is inspected without installing an app. One service, two user types.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Assuming Explicit Proxy gives the device a pool address. (2) Using HIP as an authentication method: it checks the device, not the person. (3) Forgetting that non-browser applications do not follow a PAC file.</p></div>
<div class="exam"><p><b>Exam trap.</b> HIP is about <i>device state</i> and is used in rules; Explicit Proxy is a <i>second mobile user type</i> using a PAC file and no tunnel.</p></div>

<div class="scn"><h4>Compliant users only</h4><p>A hospital wanted the clinical records application only from laptops with encryption turned on. The administrator created a HIP object for encryption, a HIP profile, and a security rule that allowed the application only when the profile matched. Staff on laptops without encryption could browse the internet but not open the records. The HIP Match log showed which devices failed the check.</p><p><b>Lesson:</b> combine who the user is with what the device is.</p></div>

<div class="iv"><p class="q">"What is HIP and how would you use it?"</p><p>Strong answer: the app reports host information; HIP objects and profiles describe required device state; rules use the profile as a condition. It is device posture, not authentication. The HIP Match log shows results. Mention Explicit Proxy briefly as the PAC-file, no-tunnel option.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HIP = device posture reported by the app; objects and profiles live in the device group.</li>
<li>Profiles act as rule conditions; HIP Match logs record results.</li>
<li>Explicit Proxy = PAC file, browser traffic, no tunnel; second mobile user type.</li>
<li>Explicit Proxy supports SAML and Kerberos for PAC deployments.</li>
<li>Both are concept only in the simulator.</li>
</ul></div>
`,hi:`
<p>Yeh chapter do ideas cover karta hai jo exam objectives mein aate hain lekin simulator mein <b>sirf concept</b> hain: <b>HIP</b> (host information profile) aur <b>Explicit Proxy</b>. Labs mein aap inhe configure nahi karoge. Aapko explain karna aana chahiye ki yeh kya hain, kyun use karte hain, aur kahan dikhte hain.</p>

<h3>Part 1: HIP, device ka health check</h3>
<h4>Analogy: airline gate par medical check</h4>
<p>Boarding se pehle gate agent check kar sakta hai ki aapka passport valid hai aur vaccination papers theek hain. Aap sahi insaan ho sakte ho lekin papers phir bhi missing ho sakte hain. HIP laptops ke liye wahi hai: user authenticated hai, lekin kya device healthy hai?</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="HIP flow">
<rect x="20" y="60" width="140" height="60" rx="8" fill="#bae6fd"/><text x="90" y="86" text-anchor="middle" class="svg-ink" font-size="12">GlobalProtect app</text><text x="90" y="104" text-anchor="middle" class="svg-muted" font-size="11">host info collect karta hai</text>
<rect x="250" y="60" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="12">HIP report</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">gateway ko bheji</text>
<rect x="480" y="20" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="52" text-anchor="middle" class="svg-ink" font-size="12">Rule match: allow</text>
<rect x="480" y="110" width="140" height="56" rx="8" fill="#fed7aa"/><text x="550" y="142" text-anchor="middle" class="svg-ink" font-size="12">Match nahi: restrict</text>
<line x1="160" y1="90" x2="250" y2="90" stroke="#64748b"/><line x1="390" y1="80" x2="480" y2="50" stroke="#64748b"/><line x1="390" y1="100" x2="480" y2="135" stroke="#64748b"/>
</svg><p class="cap">App device ki state report karta hai; rules us result ko use kar sakte hain.</p></div>

<p>App Prisma Access ko ek <b>host information profile</b> bhejta hai. Administrators device group mein <b>HIP objects</b> aur <b>HIP profiles</b> define karte hain, aur phir profiles ko security rules mein match criteria ke roop mein use karte hain. Jaise, "payroll ka access sirf un devices se allow karo jinme disk encryption on ho aur supported operating system ho". <b>HIP Match</b> log type matches record karta hai, aur HIP data doosre firewalls ko redistribute ho sakta hai (page: Redistribute HIP Information with Prisma Access). Simulator HIP ko <i>not simulated</i> mark karta hai.</p>
<table class="cmp"><tr><th>Item</th><th>Matlab</th></tr>
<tr><td>HIP report</td><td>App dwara bheje gaye device facts</td></tr>
<tr><td>HIP object</td><td>Ek condition, jaise koi setting on hai</td></tr>
<tr><td>HIP profile</td><td>Rule mein use hone wale objects ka combination</td></tr>
<tr><td>HIP Match log</td><td>Record ki device profile se match hua</td></tr>
</table>

<h3>Part 2: Explicit Proxy, tunnel ke bina browser traffic</h3>
<h4>Analogy: post office ko sab parcels depot se bhejne ko kehna</h4>
<p>Private road (tunnel) banane ke bajaye aap har parcel par note lagate ho: "depot se bhejo". Sirf note wale parcels wahan jaate hain. Explicit Proxy browser settings se kaam karta hai, aam taur par PAC file se, jo browser ko Prisma Access ki taraf point karti hai.</p>
<ul>
<li>Yeh GlobalProtect ke saath <b>doosra mobile user type</b> hai.</li>
<li>Yeh <b>PAC file</b> se <b>browser traffic</b> redirect karta hai; tunnel nahi hota.</li>
<li>PAC deployments ke liye <b>SAML</b> aur <b>Kerberos</b> support karta hai.</li>
<li>GlobalProtect <b>tunnel and proxy mode</b> mein bhi chal sakta hai.</li>
<li>Paths: SCM wahi Mobile Users entry use karta hai. Panorama: <code>Cloud Services &gt; Configuration &gt; Mobile Users - Explicit Proxy</code>.</li>
</ul>
<table class="cmp"><tr><th>Sawaal</th><th>GlobalProtect tunnel</th><th>Explicit Proxy</th></tr>
<tr><td>Kya cover karta hai</td><td>Device ka saara ya selected traffic</td><td>PAC file follow karne wala browser traffic</td></tr>
<tr><td>App chahiye?</td><td>Haan</td><td>Nahi, browser settings</td></tr>
<tr><td>Pool address milta hai?</td><td>Haan</td><td>Tunnel nahi</td></tr>
<tr><td>Typical use</td><td>Poora corporate access</td><td>Unmanaged ya lightweight devices</td></tr>
</table>
<pre class="out">Mobile Users - Explicit Proxy (lab console view)
Status      <span class="hl">not simulated (concept only)</span>
PAC file    aapke device management se browsers ko deliver hoti hai
</pre>

<div class="eg"><p><b>Worked example.</b> Company ke contractors personal laptops par hain aur unhe sirf web applications chahiye, aur employees managed laptops par hain jinhe full access chahiye. Employees ko GlobalProtect milta hai aur payroll application ke liye disk encryption maangne wala HIP profile. Contractors ko PAC file se Explicit Proxy milta hai, taaki unka web traffic app install kiye bina inspect ho. Ek service, do user types.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Maan lena ki Explicit Proxy device ko pool address deta hai. (2) HIP ko authentication method ki tarah use karna: yeh device ko check karta hai, insaan ko nahi. (3) Bhool jaana ki non-browser applications PAC file follow nahi karti.</p></div>
<div class="exam"><p><b>Exam trap.</b> HIP <i>device state</i> ke baare mein hai aur rules mein use hota hai; Explicit Proxy <i>doosra mobile user type</i> hai jo PAC file use karta hai aur tunnel nahi.</p></div>

<div class="scn"><h4>Sirf compliant users</h4><p>Ek hospital chahta tha ki clinical records application sirf encryption on wale laptops se khule. Administrator ne encryption ke liye HIP object, HIP profile, aur aisa security rule banaya jo profile match hone par hi application allow karta tha. Bina encryption wale laptops ka staff internet browse kar sakta tha lekin records nahi khol sakta tha. HIP Match log ne dikhaya ki kaun se devices check mein fail hue.</p><p><b>Seekh:</b> user kaun hai aur device kya hai, dono ko combine karo.</p></div>

<div class="iv"><p class="q">"HIP kya hai aur kaise use karoge?"</p><p>Strong answer: app host information report karta hai; HIP objects aur profiles required device state describe karte hain; rules profile ko condition ki tarah use karte hain. Yeh device posture hai, authentication nahi. HIP Match log results dikhata hai. Explicit Proxy ko briefly PAC-file, no-tunnel option ke roop mein mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HIP = app dwara reported device posture; objects aur profiles device group mein rehte hain.</li>
<li>Profiles rule conditions ki tarah kaam karte hain; HIP Match logs results record karte hain.</li>
<li>Explicit Proxy = PAC file, browser traffic, tunnel nahi; doosra mobile user type.</li>
<li>Explicit Proxy PAC deployments ke liye SAML aur Kerberos support karta hai.</li>
<li>Dono simulator mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};