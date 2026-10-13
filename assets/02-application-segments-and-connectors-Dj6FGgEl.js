var e={id:`application-segments-and-connectors`,h:{en:`Application segments, server groups and connectors`,hi:`Application segments, server groups aur connectors`},body:{en:`
<h3>A delivery address needs four parts</h3>
<p>Imagine ordering a parcel to a flat inside a gated society. The courier needs the society name, the building, the flat number, and a gatekeeper who lets them in. Publishing a private app needs the same four layers: <b>what</b> the app is, <b>where it is grouped</b>, <b>which servers host it</b>, and <b>which connector can reach those servers</b>. If any layer is missing or disabled, the parcel is not delivered.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="The publishing chain">
<rect x="8" y="60" width="110" height="80" rx="8" fill="#bae6fd"/><text x="63" y="92" text-anchor="middle" class="svg-ink" font-size="12">Application</text><text x="63" y="108" text-anchor="middle" class="svg-ink" font-size="12">segment</text><text x="63" y="126" text-anchor="middle" class="svg-muted" font-size="10">domain + port</text>
<rect x="138" y="60" width="110" height="80" rx="8" fill="#bbf7d0"/><text x="193" y="92" text-anchor="middle" class="svg-ink" font-size="12">Segment</text><text x="193" y="108" text-anchor="middle" class="svg-ink" font-size="12">group</text><text x="193" y="126" text-anchor="middle" class="svg-muted" font-size="10">used by policy</text>
<rect x="268" y="60" width="110" height="80" rx="8" fill="#ddd6fe"/><text x="323" y="92" text-anchor="middle" class="svg-ink" font-size="12">Server</text><text x="323" y="108" text-anchor="middle" class="svg-ink" font-size="12">group</text><text x="323" y="126" text-anchor="middle" class="svg-muted" font-size="10">enabled?</text>
<rect x="398" y="60" width="110" height="80" rx="8" fill="#fde68a"/><text x="453" y="92" text-anchor="middle" class="svg-ink" font-size="12">Connector</text><text x="453" y="108" text-anchor="middle" class="svg-ink" font-size="12">group</text><text x="453" y="126" text-anchor="middle" class="svg-muted" font-size="10">site</text>
<rect x="528" y="60" width="104" height="80" rx="8" fill="#fed7aa"/><text x="580" y="100" text-anchor="middle" class="svg-ink" font-size="12">Connector</text><text x="580" y="118" text-anchor="middle" class="svg-muted" font-size="10">up, enrolled</text>
<line x1="118" y1="100" x2="138" y2="100" stroke="#64748b" stroke-width="2"/><line x1="248" y1="100" x2="268" y2="100" stroke="#64748b" stroke-width="2"/><line x1="378" y1="100" x2="398" y2="100" stroke="#64748b" stroke-width="2"/><line x1="508" y1="100" x2="528" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Every box must exist, be enabled and agree on the site.</p></div>

<h3>The objects, one by one</h3>
<dl class="terms">
<dt>Application segment</dt><dd>The definition of one private app: one or more <b>domains</b>, the <b>port and protocol</b>, an enabled switch, a segment group and a server group. Example: git.corp.example, tcp 22.</dd>
<dt>Segment group</dt><dd>A bundle of segments that the access policy refers to. Policies name segment groups, not individual segments, so you can allow "Pune apps" in one line.</dd>
<dt>Server group</dt><dd>Says which connector groups are allowed to carry this app's traffic. It has its own enabled switch.</dd>
<dt>Connector group</dt><dd>A set of connectors in one <b>site</b>. Example: a group for Chennai holding APPCONN-CHN.</dd>
<dt>Connector</dt><dd>The program inside the site. It has a status (up or down) and must be <b>enrolled</b>.</dd>
</dl>

<h3>Matching a request to a segment</h3>
<p>When a user opens a name, the service looks for an <b>enabled</b> segment whose domain and port both match. An exact domain beats a wildcard: if there is a segment for *.corp.example and another for git.corp.example, the git request uses the exact one. A one-character typo in a domain, for example gti.corp.example, means no segment matches and the app looks "unpublished" even though everything else is right. That is ticket 320110, which we solve in chapter 4.</p>

<h3>Enrollment: introducing the connector to the cloud</h3>
<p>A connector is a program, so the cloud must be able to trust it before it carries company data. <b>Enrollment</b> is that introduction: an admin creates the connector in the portal and the program proves its identity once, typically with a one-time provisioning key from the portal. After that the connector shows as enrolled and, when it reaches the cloud, <b>up</b>. An unenrolled connector can be running yet useless, and a down connector is reachable by nobody. The service needs at least one connector that is both <b>up and enrolled</b> in the connector group.</p>

<h3>The site must match</h3>
<p>Each connector group has a <code>site</code> value, and the application belongs to a site. Git lives in Chennai, so a connector group whose site is Pune cannot serve it, even if its connector is perfectly healthy. A "wrong-site connector" is a classic mistake when someone reuses a working group for a new application.</p>

<h3>Lab zs-zpa-1: publish the git server</h3>
<p>The goal is that vikram (remote, Engineering) reaches git.corp.example on tcp 22. Build bottom up: check that APPCONN-CHN is up and enrolled in a Chennai connector group; check the server group is enabled and lists that connector group; create the segment with domain git.corp.example, tcp, port 22, enabled, pointing to the server group; add it to a segment group. Then use the Policy tester's private-access check, which explains each layer.</p>
<pre class="out">Policy tester  (private access)   user: vikram   app: git.corp.example:22
 client connector     signed in, private access on
 segment              <span class="hl">git  (domain git.corp.example, tcp 22)  MATCH</span>
 access policy        rule Eng-dev-apps  allow
 server group         sg-chn  enabled
 connector group      cg-chn  site chn  matches app site
 connector            APPCONN-CHN  up, enrolled
Result: ALLOWED</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> The segment tells the broker which domain and port to treat as private. The server and connector groups tell it which outbound connector connection to use for the session. Nothing changes on the app server; the connector simply opens a local connection to it when a permitted session arrives.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Typo in the domain. (2) Right app, wrong port. (3) Server group left disabled. (4) Connector running but not enrolled. (5) Connector group in the wrong site.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy names segment groups. Adding a segment but forgetting its segment group means the policy never covers it.</p></div>

<div class="scn"><h4>A healthy connector in the wrong city</h4><p>The team copied a working Pune connector group for the new git server in Chennai. Users got "cannot reach" for hours. The tester showed all layers green except the line "connector group site pun does not match app site chn". Pointing the server group to the Chennai group fixed it.</p><p><b>Lesson:</b> read each layer; green on the connector does not mean green on the path.</p></div>

<div class="iv"><p class="q">"Explain app segments, segment groups and connector groups."</p><p>Segment defines a private app by domain and port. Segment group bundles segments for policy. Server group maps the app to connector groups. Connector group is a set of site-local connectors that must be up and enrolled. Mention site matching.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A segment is domain plus port plus protocol; exact domain beats wildcard.</li>
<li>Policies reference segment groups.</li>
<li>Server groups link apps to connector groups; both have enabled switches.</li>
<li>Connectors must be enrolled and up.</li>
<li>The connector group site must equal the app's site.</li>
</ul></div>
`,hi:`
<h3>Delivery address ke chaar hisse</h3>
<p>Socho gated society ke andar ek flat par parcel mangwana. Courier ko society ka naam, building, flat number aur ek gatekeeper chahiye jo andar jaane de. Private app publish karne mein bhi wahi chaar layers hain: app <b>kya</b> hai, woh <b>kahan group hai</b>, <b>kaun se servers host karte hain</b>, aur <b>kaun sa connector un servers tak pahunch sakta hai</b>. Koi layer missing ya disabled ho to parcel deliver nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Publishing chain">
<rect x="8" y="60" width="110" height="80" rx="8" fill="#bae6fd"/><text x="63" y="92" text-anchor="middle" class="svg-ink" font-size="12">Application</text><text x="63" y="108" text-anchor="middle" class="svg-ink" font-size="12">segment</text><text x="63" y="126" text-anchor="middle" class="svg-muted" font-size="10">domain + port</text>
<rect x="138" y="60" width="110" height="80" rx="8" fill="#bbf7d0"/><text x="193" y="92" text-anchor="middle" class="svg-ink" font-size="12">Segment</text><text x="193" y="108" text-anchor="middle" class="svg-ink" font-size="12">group</text><text x="193" y="126" text-anchor="middle" class="svg-muted" font-size="10">policy use karti hai</text>
<rect x="268" y="60" width="110" height="80" rx="8" fill="#ddd6fe"/><text x="323" y="92" text-anchor="middle" class="svg-ink" font-size="12">Server</text><text x="323" y="108" text-anchor="middle" class="svg-ink" font-size="12">group</text><text x="323" y="126" text-anchor="middle" class="svg-muted" font-size="10">enabled?</text>
<rect x="398" y="60" width="110" height="80" rx="8" fill="#fde68a"/><text x="453" y="92" text-anchor="middle" class="svg-ink" font-size="12">Connector</text><text x="453" y="108" text-anchor="middle" class="svg-ink" font-size="12">group</text><text x="453" y="126" text-anchor="middle" class="svg-muted" font-size="10">site</text>
<rect x="528" y="60" width="104" height="80" rx="8" fill="#fed7aa"/><text x="580" y="100" text-anchor="middle" class="svg-ink" font-size="12">Connector</text><text x="580" y="118" text-anchor="middle" class="svg-muted" font-size="10">up, enrolled</text>
<line x1="118" y1="100" x2="138" y2="100" stroke="#64748b" stroke-width="2"/><line x1="248" y1="100" x2="268" y2="100" stroke="#64748b" stroke-width="2"/><line x1="378" y1="100" x2="398" y2="100" stroke="#64748b" stroke-width="2"/><line x1="508" y1="100" x2="528" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har box exist karna chahiye, enabled hona chahiye aur site par agree karna chahiye.</p></div>

<h3>Objects, ek ek karke</h3>
<dl class="terms">
<dt>Application segment</dt><dd>Ek private app ki definition: ek ya zyada <b>domains</b>, <b>port aur protocol</b>, enabled switch, segment group aur server group. Example: git.corp.example, tcp 22.</dd>
<dt>Segment group</dt><dd>Segments ka bundle jise access policy refer karti hai. Policies segment groups ka naam leti hain, individual segments ka nahi, isliye "Pune apps" ek line mein allow ho jaati hain.</dd>
<dt>Server group</dt><dd>Batata hai kaun se connector groups is app ka traffic le ja sakte hain. Iska apna enabled switch hota hai.</dd>
<dt>Connector group</dt><dd>Ek <b>site</b> ke connectors ka set. Example: Chennai ka group jisme APPCONN-CHN hai.</dd>
<dt>Connector</dt><dd>Site ke andar ka program. Iska status (up ya down) hota hai aur woh <b>enrolled</b> hona chahiye.</dd>
</dl>

<h3>Request ko segment se match karna</h3>
<p>User koi name kholta hai to service ek <b>enabled</b> segment dhoondhti hai jiska domain aur port dono match karein. Exact domain wildcard ko harata hai: agar *.corp.example ka segment hai aur git.corp.example ka alag, to git request exact wale ko use karti hai. Domain mein ek character ka typo, jaise gti.corp.example, ka matlab hai koi segment match nahi karta aur app "unpublished" dikhti hai chahe baaki sab sahi ho. Yahi ticket 320110 hai, jo hum chapter 4 mein solve karenge.</p>

<h3>Enrollment: connector ko cloud se milwana</h3>
<p>Connector ek program hai, isliye company data le jaane se pehle cloud ko us par trust karna hoga. <b>Enrollment</b> yahi introduction hai: admin portal mein connector banata hai aur program ek baar apni identity prove karta hai, aam taur par portal ki one-time provisioning key se. Uske baad connector enrolled dikhta hai aur cloud tak pahunchne par <b>up</b>. Unenrolled connector chal raha ho tab bhi bekaar hai, aur down connector tak koi nahi pahunch sakta. Service ko connector group mein kam se kam ek aisa connector chahiye jo <b>up aur enrolled</b> dono ho.</p>

<h3>Site match honi chahiye</h3>
<p>Har connector group ki ek <code>site</code> value hoti hai, aur application ek site ki hoti hai. Git Chennai mein hai, to Pune site wala connector group use serve nahi kar sakta, chahe uska connector bilkul healthy ho. "Wrong-site connector" classic galti hai jab koi chalte hue group ko nayi application ke liye reuse kar leta hai.</p>

<h3>Lab zs-zpa-1: git server publish karo</h3>
<p>Goal yeh hai ki vikram (remote, Engineering) git.corp.example tcp 22 par reach kare. Neeche se upar banao: check karo APPCONN-CHN Chennai connector group mein up aur enrolled hai; check karo server group enabled hai aur us connector group ko list karta hai; domain git.corp.example, tcp, port 22, enabled ke saath segment banao jo server group ko point kare; use segment group mein daalo. Phir Policy tester ka private-access check use karo, jo har layer explain karta hai.</p>
<pre class="out">Policy tester  (private access)   user: vikram   app: git.corp.example:22
 client connector     signed in, private access on
 segment              <span class="hl">git  (domain git.corp.example, tcp 22)  MATCH</span>
 access policy        rule Eng-dev-apps  allow
 server group         sg-chn  enabled
 connector group      cg-chn  site chn  matches app site
 connector            APPCONN-CHN  up, enrolled
Result: ALLOWED</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Segment broker ko batata hai ki kaun sa domain aur port private maanna hai. Server aur connector groups batate hain ki session ke liye kaun sa outbound connector connection use karna hai. App server par kuch nahi badalta; permitted session aane par connector uske saath ek local connection kholta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Domain mein typo. (2) Sahi app, galat port. (3) Server group disabled chhod dena. (4) Connector chal raha hai lekin enrolled nahi. (5) Connector group galat site mein.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy segment groups ka naam leti hai. Segment add karke uska segment group bhool gaye to policy use kabhi cover nahi karti.</p></div>

<div class="scn"><h4>Healthy connector, galat sheher</h4><p>Team ne Chennai ke naye git server ke liye chalta hua Pune connector group copy kar liya. Users ko ghanton "cannot reach" mila. Tester mein sab layers green thi sirf ek line ke alawa: "connector group site pun does not match app site chn". Server group ko Chennai group par point karne se fix ho gaya.</p><p><b>Seekh:</b> har layer padho; connector green hai ka matlab path green nahi.</p></div>

<div class="iv"><p class="q">"App segments, segment groups aur connector groups explain karo."</p><p>Segment private app ko domain aur port se define karta hai. Segment group policy ke liye segments bundle karta hai. Server group app ko connector groups se map karta hai. Connector group site-local connectors ka set hai jo up aur enrolled hone chahiye. Site matching mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Segment matlab domain plus port plus protocol; exact domain wildcard ko harata hai.</li>
<li>Policies segment groups ko reference karti hain.</li>
<li>Server groups apps ko connector groups se jodte hain; dono ke enabled switches hain.</li>
<li>Connectors enrolled aur up hone chahiye.</li>
<li>Connector group ki site app ki site ke barabar honi chahiye.</li>
</ul></div>
`}};export{e as default};