var e={id:`troubleshooting`,h:{en:`Troubleshooting: authentication, pool and location failures`,hi:`Troubleshooting: authentication, pool aur location failures`},body:{en:`
<p>"I cannot connect" is the most common ticket for mobile users. Three causes make up most of the cases: wrong <b>authentication</b>, an exhausted or misconfigured <b>pool</b>, and a <b>location</b> that is not enabled. The lab ticket <b>pa-mobile-3</b> injects exactly one of them in each run. A good engineer uses a fixed order and the right screen for each cause.</p>

<h3>Analogy: why can't the guest check in?</h3>
<p>A guest arrives at the hotel and cannot get a room. Maybe the desk cannot find the booking (authentication). Maybe all room keys are issued (pool). Maybe the hotel has no branch in that city (location). You ask three questions in that order, and each has its own record book.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Decision tree for cannot connect">
<rect x="230" y="10" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">User cannot connect</text>
<rect x="20" y="100" width="170" height="60" rx="8" fill="#fde68a"/><text x="105" y="124" text-anchor="middle" class="svg-ink" font-size="12">Login rejected?</text><text x="105" y="142" text-anchor="middle" class="svg-muted" font-size="11">auth failures view</text>
<rect x="235" y="100" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Login ok, no address?</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="11">pool usage</text>
<rect x="450" y="100" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="535" y="124" text-anchor="middle" class="svg-ink" font-size="12">Cannot find gateway?</text><text x="535" y="142" text-anchor="middle" class="svg-muted" font-size="11">enabled locations</text>
<line x1="290" y1="54" x2="140" y2="100" stroke="#64748b"/><line x1="320" y1="54" x2="320" y2="100" stroke="#64748b"/><line x1="350" y1="54" x2="500" y2="100" stroke="#64748b"/>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">Also check portal name, DNS CNAME, certificate and push status</text>
</svg><p class="cap">Three branches that cover most "cannot connect" tickets.</p></div>

<h3>Where to look</h3>
<table class="cmp"><tr><th>Question</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Authentication success or failure</td><td>Insights: Network Services (GlobalProtect authentication)</td><td>Monitor &gt; Mobile Users, and the logs</td></tr>
<tr><td>Who is connected</td><td>Activity Insights: Users</td><td>Cloud Services &gt; Status &gt; Status (Current Users)</td></tr>
<tr><td>Logs</td><td>Log Viewer: HIP Match, System, Endpoint logs</td><td>Logs in Strata Logging Service</td></tr>
<tr><td>Config in sync?</td><td>Sync Status</td><td>Status and Config Status</td></tr>
</table>

<h3>Cause 1: authentication</h3>
<p>Symptom: the app asks again for credentials or says login failed. The authentication view shows failures at the time of the user's attempt.</p>
<pre class="out">Network Services &gt; GlobalProtect authentication (lab console view)
Time    User         Result
10:14   lab-user1    <span class="hl">Failure: authentication profile not found</span>
10:15   lab-user1    Failure: authentication profile not found
</pre>
<p>Fix: correct the authentication profile or source, push, retest. On Panorama remember that the General tab profile becomes read-only after the first commit and push.</p>

<h3>Cause 2: pool</h3>
<p>Symptom: login succeeds, then the app stays at "connecting" or reports no address.</p>
<pre class="out">Mobile Users &gt; IP Pools (lab console view)
Pool             Addresses in use
10.200.0.0/23    <span class="hl">510 of 510</span>
</pre>
<p>Fix: add a new block that does not overlap, push. Do not resize the existing pool while users are connected.</p>

<h3>Cause 3: location</h3>
<p>Symptom: the app cannot find a gateway; it never leaves the portal stage.</p>
<pre class="out">Prisma Access Locations (lab console view)
Location     Enabled
India West   <span class="hl">No</span>
</pre>
<p>Fix: enable a suitable location (preferably in more than one compute location), push, retest.</p>

<h3>Other checks</h3>
<ul>
<li><b>Portal reachability:</b> does the portal name resolve from outside? For a company domain, is the CNAME present?</li>
<li><b>Certificate:</b> is the company-domain certificate valid and matching?</li>
<li><b>Push:</b> is Config Status In sync?</li>
<li><b>After connection:</b> if the app is connected but no internal site opens, test an IP, then a name (DNS), then check HQ's return route to 10.200.0.0/23.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "lab-user1 cannot connect". Step 1: the authentication view shows no failure for this user, so authentication is not the cause. Step 2: IP Pools show 510 of 510 in use, so the pool is exhausted. Fix: add 10.200.2.0/23, push. Retest: the laptop receives 10.200.2.5. The engineer checks Users: the laptop is listed. The next day the engineer sets a reminder to review pool usage weekly.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reinstalling the app before reading the authentication view. (2) Changing three things at once, so the cause is unknown. (3) Forgetting to push. (4) Treating the simulator as the real console: real client log paths and portal log names are not covered in this course.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Login succeeds but no IP" is a pool symptom, not an authentication one. "App cannot find a gateway" points to locations. "Login rejected" points to authentication.</p></div>

<div class="scn"><h4>Friday afternoon, three symptoms</h4><p>Three users reported "cannot connect". One saw a login error, one saw "connecting" forever, one could not find a gateway while travelling. The engineer opened the authentication view (user one had a typo in a group name), the pool view (user two was blocked by a full pool), and the location list (user three was in a country with no enabled location). Three tickets, three different causes, one workflow.</p><p><b>Lesson:</b> use the symptom to choose the screen.</p></div>

<div class="iv"><p class="q">"A mobile user cannot connect. What is your process?"</p><p>Strong answer: classify the symptom. Login rejected leads to the authentication success and failure view. Login ok but no address leads to pool usage. No gateway found leads to enabled locations. Also check portal name and certificate, and Config Status In sync. Change one thing at a time and retest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three classic causes: authentication, pool, location.</li>
<li>Use the symptom to pick the screen: auth view, IP pools, locations.</li>
<li>Check portal DNS, certificate and push status as well.</li>
<li>Add pool blocks; do not resize live pools.</li>
<li>Change one thing at a time.</li>
</ul></div>
`,hi:`
<p>"Main connect nahi kar pa raha" mobile users ka sabse common ticket hai. Teen wajahein zyadatar cases banati hain: galat <b>authentication</b>, khatam ya galat configured <b>pool</b>, aur aisa <b>location</b> jo enabled nahi hai. Lab ticket <b>pa-mobile-3</b> har run mein theek inme se ek inject karta hai. Achha engineer fixed order aur har wajah ke liye sahi screen use karta hai.</p>

<h3>Analogy: guest check in kyun nahi kar pa raha?</h3>
<p>Ek guest hotel pahunchta hai aur use room nahi mil raha. Ho sakta hai desk ko booking nahi mil rahi (authentication). Ho sakta hai saari room keys issue ho chuki hain (pool). Ho sakta hai hotel ki us shehar mein branch hi nahi (location). Aap teen sawaal usi order mein poochte ho, aur har ka apna record book hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Cannot connect ka decision tree">
<rect x="230" y="10" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="12">User connect nahi kar pa raha</text>
<rect x="20" y="100" width="170" height="60" rx="8" fill="#fde68a"/><text x="105" y="124" text-anchor="middle" class="svg-ink" font-size="12">Login reject?</text><text x="105" y="142" text-anchor="middle" class="svg-muted" font-size="11">auth failures view</text>
<rect x="235" y="100" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Login ok, address nahi?</text><text x="320" y="142" text-anchor="middle" class="svg-muted" font-size="11">pool usage</text>
<rect x="450" y="100" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="535" y="124" text-anchor="middle" class="svg-ink" font-size="12">Gateway nahi mil raha?</text><text x="535" y="142" text-anchor="middle" class="svg-muted" font-size="11">enabled locations</text>
<line x1="290" y1="54" x2="140" y2="100" stroke="#64748b"/><line x1="320" y1="54" x2="320" y2="100" stroke="#64748b"/><line x1="350" y1="54" x2="500" y2="100" stroke="#64748b"/>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">Portal name, DNS CNAME, certificate aur push status bhi check karo</text>
</svg><p class="cap">Teen branches jo zyadatar "cannot connect" tickets cover karti hain.</p></div>

<h3>Kahan dekhein</h3>
<table class="cmp"><tr><th>Sawaal</th><th>SCM</th><th>Panorama</th></tr>
<tr><td>Authentication success ya failure</td><td>Insights: Network Services (GlobalProtect authentication)</td><td>Monitor &gt; Mobile Users, and the logs</td></tr>
<tr><td>Kaun connected hai</td><td>Activity Insights: Users</td><td>Cloud Services &gt; Status &gt; Status (Current Users)</td></tr>
<tr><td>Logs</td><td>Log Viewer: HIP Match, System, Endpoint logs</td><td>Strata Logging Service mein logs</td></tr>
<tr><td>Config in sync?</td><td>Sync Status</td><td>Status aur Config Status</td></tr>
</table>

<h3>Wajah 1: authentication</h3>
<p>Symptom: app dobara credentials maangta hai ya login failed kehta hai. Authentication view user ki koshish ke time par failures dikhata hai.</p>
<pre class="out">Network Services &gt; GlobalProtect authentication (lab console view)
Time    User         Result
10:14   lab-user1    <span class="hl">Failure: authentication profile not found</span>
10:15   lab-user1    Failure: authentication profile not found
</pre>
<p>Fix: authentication profile ya source theek karo, push karo, dobara test karo. Panorama par yaad rakho ki General tab profile pehle commit aur push ke baad read-only ho jaata hai.</p>

<h3>Wajah 2: pool</h3>
<p>Symptom: login succeed hota hai, phir app "connecting" par rukta hai ya address nahi milne ki report karta hai.</p>
<pre class="out">Mobile Users &gt; IP Pools (lab console view)
Pool             Addresses in use
10.200.0.0/23    <span class="hl">510 of 510</span>
</pre>
<p>Fix: naya non-overlapping block jodo, push karo. Users connected hon tab existing pool resize mat karo.</p>

<h3>Wajah 3: location</h3>
<p>Symptom: app ko gateway nahi milta; woh portal stage se aage nahi badhta.</p>
<pre class="out">Prisma Access Locations (lab console view)
Location     Enabled
India West   <span class="hl">No</span>
</pre>
<p>Fix: suitable location enable karo (behtar hai ek se zyada compute location mein), push karo, dobara test karo.</p>

<h3>Doosre checks</h3>
<ul>
<li><b>Portal reachability:</b> kya portal name bahar se resolve hota hai? Company domain ke liye kya CNAME maujood hai?</li>
<li><b>Certificate:</b> kya company-domain certificate valid aur matching hai?</li>
<li><b>Push:</b> kya Config Status In sync hai?</li>
<li><b>Connection ke baad:</b> app connected hai lekin koi internal site nahi khulti, to pehle IP test karo, phir naam (DNS), phir HQ ka 10.200.0.0/23 ka return route check karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "lab-user1 connect nahi kar pa raha". Step 1: authentication view is user ke liye koi failure nahi dikhata, to authentication wajah nahi hai. Step 2: IP Pools 510 mein se 510 in use dikhata hai, to pool khatam hai. Fix: 10.200.2.0/23 add karo, push karo. Retest: laptop ko 10.200.2.5 milta hai. Engineer Users check karta hai: laptop listed hai. Agle din engineer pool usage ko weekly review karne ka reminder set karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Authentication view padhe bina app reinstall karna. (2) Ek saath teen cheezein badalna, jisse wajah pata nahi chalti. (3) Push bhool jaana. (4) Simulator ko asli console samajhna: real client log paths aur portal log names is course mein cover nahi hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Login succeed hota hai lekin IP nahi milta" pool ka symptom hai, authentication ka nahi. "App ko gateway nahi milta" locations ki taraf ishara karta hai. "Login reject" authentication ki taraf.</p></div>

<div class="scn"><h4>Friday dopahar, teen symptoms</h4><p>Teen users ne "cannot connect" report kiya. Ek ne login error dekha, ek ne "connecting" hamesha dekha, ek travel karte hue gateway nahi dhoondh paaya. Engineer ne authentication view khola (user ek ke group naam mein typo tha), pool view (user do full pool se blocked tha), aur location list (user teen aise country mein tha jahan koi enabled location nahi tha). Teen tickets, teen alag wajahein, ek workflow.</p><p><b>Seekh:</b> symptom se screen chuno.</p></div>

<div class="iv"><p class="q">"Mobile user connect nahi kar pa raha. Aapka process kya hai?"</p><p>Strong answer: symptom classify karo. Login reject to authentication success aur failure view. Login ok lekin address nahi to pool usage. Gateway nahi mila to enabled locations. Portal name aur certificate, aur Config Status In sync bhi check karo. Ek baar mein ek cheez badlo aur dobara test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen classic wajahein: authentication, pool, location.</li>
<li>Symptom se screen chuno: auth view, IP pools, locations.</li>
<li>Portal DNS, certificate aur push status bhi check karo.</li>
<li>Pool blocks add karo; live pools resize mat karo.</li>
<li>Ek baar mein ek cheez badlo.</li>
</ul></div>
`}};export{e as default};