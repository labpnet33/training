var e={id:`scm-push-config`,h:{en:`SCM Push Config: the dialog and the jobs`,hi:`SCM Push Config: dialog aur jobs`},body:{en:`
<p>Imagine sending parcels from a warehouse. Writing the address label is not delivery. You must hand the parcel to the courier, choose which parcels go on which truck, and later check the tracking page. In Strata Cloud Manager (SCM), editing a rule is writing the label. <b>Push Config</b> is handing it to the courier. The <b>Jobs</b> page is the tracking page.</p>

<h3>Where it is</h3>
<p>In SCM the path is <b>Configuration, Operations, Push Config</b>. The menu is called Configuration (older notes may say Manage, but the pages used for this course show Configuration). When you have pending changes, the Push Config button opens a dialog.</p>

<h3>The Push Config dialog, field by field</h3>
<table class="cmp">
<tr><th>Field</th><th>What it controls</th><th>Typical choice</th></tr>
<tr><td>Admin Scope</td><td>Whose changes are included</td><td>Your own changes, or all admins if you are authorised</td></tr>
<tr><td>Push Target</td><td>Where the change goes: <b>NGFW and Prisma Access</b> (default) or <b>Other Services</b></td><td>Keep the default for Prisma Access work</td></tr>
<tr><td>Push Scope</td><td>Which deployment types or folders; a parent folder includes its children</td><td>The smallest scope that contains the change</td></tr>
<tr><td>Ignore Security Check Failures</td><td>Lets a push continue past best-practice check failures</td><td>Leave off unless you have approval</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Push dialog">
<rect x="20" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">Pending changes</text>
<rect x="220" y="20" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Push Config dialog</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="13">Job runs</text>
<line x1="170" y1="45" x2="220" y2="45" stroke="#64748b" stroke-width="2"/><line x1="420" y1="45" x2="470" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="110" width="110" height="40" rx="8" fill="#fde68a"/><text x="115" y="135" text-anchor="middle" class="svg-ink" font-size="12">Admin Scope</text>
<rect x="185" y="110" width="110" height="40" rx="8" fill="#fde68a"/><text x="240" y="135" text-anchor="middle" class="svg-ink" font-size="12">Push Target</text>
<rect x="310" y="110" width="110" height="40" rx="8" fill="#fde68a"/><text x="365" y="135" text-anchor="middle" class="svg-ink" font-size="12">Push Scope</text>
<rect x="435" y="110" width="160" height="40" rx="8" fill="#fed7aa"/><text x="515" y="135" text-anchor="middle" class="svg-ink" font-size="12">Ignore Security Checks</text>
<line x1="320" y1="70" x2="320" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Four choices in the dialog, then a job you can follow in the Jobs history</text>
</svg><p class="cap">Dialog choices on the left side of the arrow decide what the job will do.</p></div>

<h3>Full pushes versus scoped pushes</h3>
<p>Most day-to-day changes (a rule, an object) can be pushed with a scope that covers the folder you edited. But some operations require a <b>full push</b>: a new tenant, setting up Prisma Access mobile users or remote networks for the first time, and folder operations such as moving or renaming folders. When in doubt on first setup, choose the full scope and let the platform sort out what changed.</p>

<h3>Jobs history</h3>
<p>Every commit, push and revert becomes a job. The history lists each job with a <b>Summary</b>, a <b>Description</b> and a <b>status</b> (for example success or failed), so you can answer "who pushed what and did it work?". A failed job should be opened and read; the description or details explain the cause.</p>
<pre class="out">Jobs (teaching view)
Time      Summary                   Description                        Status
10:05:12  Push                      Push to Prisma Access (Corp-Policy) <span class="hl">Success</span>
09:40:03  Commit                    Rule allow-private-hq-app added     Success
09:12:47  Push                      Push to Prisma Access (all)         <span class="hl">Failed</span></pre>

<h3>Best-practice checks and overrides</h3>
<p>The platform can run best-practice checks on a push. If a check fails, the push can be blocked unless you hold an override permission, which also controls whether you may use Ignore Security Check Failures. Treat the override as an exception: record who approved it and why. Overriding to "get it out" is exactly how weak rules reach production.</p>

<h3>Verify after the job</h3>
<ol>
<li>Open Jobs and confirm the job status is success.</li>
<li>Open <b>Configuration, Prisma Access, Sync Status</b> (for example the Remote Networks view) and confirm the configuration is in sync.</li>
<li>Check Activity Insights or the Log Viewer for the user or branch affected.</li>
<li>Write the change, time and result in your ticket.</li>
</ol>

<div class="eg"><p><b>Worked example (lab pa-ops-1).</b> Pending change: new rule <code>allow-private-hq-app</code> in the Corp-Policy folder. Push Config: Admin Scope = my changes, Push Target = NGFW and Prisma Access, Push Scope = Corp-Policy (children included), Ignore Security Check Failures = off. The job runs and the Jobs page shows Success. Sync Status shows the networks as in sync. LAPTOP-HOME opens 10.10.0.50 and the Log Viewer shows the new rule name with allow. All four verification steps are done.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Closing the dialog without pushing; pushing a too-narrow scope so a related folder is left behind; using Ignore Security Check Failures to bypass a real warning; assuming a successful job means the traffic works (check the logs); doing a new-tenant setup with a scoped push.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the four dialog fields by name, that Push Target defaults to NGFW and Prisma Access, and that new tenants, mobile and remote user setup, and folder operations need full pushes. A best-practice check can block a push unless you have override permission.</p></div>

<div class="scn"><h4>The scoped push that left a branch behind</h4><p>An engineer pushed only the mobile users folder after editing a shared snippet used by the remote networks too. Mobile users saw the new profile; branches still ran the old one. Sync Status for Remote Networks flagged the difference. A second push with the parent folder as scope fixed it.</p><p><b>Lesson:</b> pick the push scope from where the change lives, not from where you were looking.</p></div>

<div class="iv"><p class="q">"What is in the SCM Push Config dialog and when do you need a full push?"</p><p>Admin Scope, Push Target (NGFW and Prisma Access by default, or Other Services), Push Scope and Ignore Security Check Failures. Full pushes for new tenants, Prisma Access mobile and remote user setup, and folder operations. Then verify the job and Sync Status.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path: Configuration, Operations, Push Config.</li>
<li>Four dialog fields: Admin Scope, Push Target, Push Scope, Ignore Security Check Failures.</li>
<li>Full pushes are required for new tenants, first-time mobile and remote setup, and folder operations.</li>
<li>Jobs history shows commits, pushes and reverts with Summary, Description and status.</li>
<li>Best-practice checks can block a push unless you have override permission.</li>
</ul></div>
`,hi:`
<p>Warehouse se parcels bhejne ka socho. Address label likhna delivery nahi hai. Aapko parcel courier ko dena hota hai, chunna hota hai kaunse parcel kaunsi truck mein jaayein, aur baad mein tracking page dekhna hota hai. Strata Cloud Manager (SCM) mein rule edit karna label likhna hai. <b>Push Config</b> courier ko dena hai. <b>Jobs</b> page tracking page hai.</p>

<h3>Ye kahan hai</h3>
<p>SCM mein path hai <b>Configuration, Operations, Push Config</b>. Menu ka naam Configuration hai (purane notes Manage keh sakte hain, lekin is course ke pages Configuration dikhate hain). Pending changes hon to Push Config button ek dialog kholta hai.</p>

<h3>Push Config dialog, field by field</h3>
<table class="cmp">
<tr><th>Field</th><th>Kya control karta hai</th><th>Typical choice</th></tr>
<tr><td>Admin Scope</td><td>Kiske changes shamil honge</td><td>Aapke apne changes, ya authorised ho to saare admins ke</td></tr>
<tr><td>Push Target</td><td>Change kahan jaayega: <b>NGFW and Prisma Access</b> (default) ya <b>Other Services</b></td><td>Prisma Access kaam ke liye default rakho</td></tr>
<tr><td>Push Scope</td><td>Kaunse deployment types ya folders; parent folder apne children ko shamil karta hai</td><td>Sabse chhota scope jisme change aata ho</td></tr>
<tr><td>Ignore Security Check Failures</td><td>Best-practice check failures ke baad bhi push chalne deta hai</td><td>Approval ke bina off rakho</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Push dialog">
<rect x="20" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">Pending changes</text>
<rect x="220" y="20" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Push Config dialog</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="13">Job chalta hai</text>
<line x1="170" y1="45" x2="220" y2="45" stroke="#64748b" stroke-width="2"/><line x1="420" y1="45" x2="470" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="110" width="110" height="40" rx="8" fill="#fde68a"/><text x="115" y="135" text-anchor="middle" class="svg-ink" font-size="12">Admin Scope</text>
<rect x="185" y="110" width="110" height="40" rx="8" fill="#fde68a"/><text x="240" y="135" text-anchor="middle" class="svg-ink" font-size="12">Push Target</text>
<rect x="310" y="110" width="110" height="40" rx="8" fill="#fde68a"/><text x="365" y="135" text-anchor="middle" class="svg-ink" font-size="12">Push Scope</text>
<rect x="435" y="110" width="160" height="40" rx="8" fill="#fed7aa"/><text x="515" y="135" text-anchor="middle" class="svg-ink" font-size="12">Ignore Security Checks</text>
<line x1="320" y1="70" x2="320" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Dialog mein chaar choices, phir ek job jise Jobs history mein follow karte hain</text>
</svg><p class="cap">Dialog ki choices decide karti hain ki job kya karega.</p></div>

<h3>Full push versus scoped push</h3>
<p>Zyada tar roz ke changes (ek rule, ek object) us folder ko cover karne wale scope se push ho sakte hain. Lekin kuch operations ko <b>full push</b> chahiye: naya tenant, Prisma Access mobile users ya remote networks ka pehli baar setup, aur folder operations jaise folders move ya rename karna. Pehle setup mein shak ho to full scope chuno aur platform ko decide karne do ki kya badla.</p>

<h3>Jobs history</h3>
<p>Har commit, push aur revert ek job banta hai. History har job ko <b>Summary</b>, <b>Description</b> aur <b>status</b> (jaise success ya failed) ke saath dikhati hai, taaki "kisne kya push kiya aur chala ya nahi?" ka jawab mile. Failed job kholkar padho; description ya details cause batate hain.</p>
<pre class="out">Jobs (teaching view)
Time      Summary                   Description                        Status
10:05:12  Push                      Push to Prisma Access (Corp-Policy) <span class="hl">Success</span>
09:40:03  Commit                    Rule allow-private-hq-app added     Success
09:12:47  Push                      Push to Prisma Access (all)         <span class="hl">Failed</span></pre>

<h3>Best-practice checks aur overrides</h3>
<p>Platform push par best-practice checks chala sakta hai. Check fail ho to push block ho sakta hai jab tak aapke paas override permission na ho, jo ye bhi control karti hai ki aap Ignore Security Check Failures use kar sakte ho ya nahi. Override ko exception maano: record karo kisne approve kiya aur kyun. "Bhej do" ke liye override karna hi weak rules ko production tak pahunchata hai.</p>

<h3>Job ke baad verify</h3>
<ol>
<li>Jobs kholo aur confirm karo job status success hai.</li>
<li><b>Configuration, Prisma Access, Sync Status</b> kholo (jaise Remote Networks view) aur confirm karo configuration in sync hai.</li>
<li>Affected user ya branch ke liye Activity Insights ya Log Viewer check karo.</li>
<li>Apne ticket mein change, time aur result likho.</li>
</ol>

<div class="eg"><p><b>Worked example (lab pa-ops-1).</b> Pending change: Corp-Policy folder mein naya rule <code>allow-private-hq-app</code>. Push Config: Admin Scope = my changes, Push Target = NGFW and Prisma Access, Push Scope = Corp-Policy (children included), Ignore Security Check Failures = off. Job chalta hai aur Jobs page Success dikhata hai. Sync Status networks ko in sync dikhata hai. LAPTOP-HOME 10.10.0.50 kholta hai aur Log Viewer naya rule name allow ke saath dikhata hai. Chaaron verification steps ho gaye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Dialog bina push kiye band kar dena; bahut narrow scope push karna jisse related folder peeche reh jaaye; asli warning ko bypass karne ke liye Ignore Security Check Failures use karna; successful job ko traffic chalne ka proof maan lena (logs check karo); naye tenant ka setup scoped push se karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dialog ke chaar fields naam se jaano, ye bhi ki Push Target ka default NGFW and Prisma Access hai, aur naye tenants, mobile aur remote user setup, tatha folder operations ko full push chahiye. Best-practice check push ko block kar sakta hai jab tak override permission na ho.</p></div>

<div class="scn"><h4>Scoped push jisne branch ko peeche chhod diya</h4><p>Engineer ne ek shared snippet edit karne ke baad sirf mobile users folder push kiya, jabki snippet remote networks mein bhi use hota tha. Mobile users ko naya profile mila; branches purane par chalte rahe. Remote Networks ka Sync Status ne fark pakda. Parent folder ko scope bana kar dobara push karne se fix hua.</p><p><b>Lesson:</b> push scope wahan se chuno jahan change rehta hai, jahan aap dekh rahe the wahan se nahi.</p></div>

<div class="iv"><p class="q">"SCM Push Config dialog mein kya hota hai aur full push kab chahiye?"</p><p>Admin Scope, Push Target (default NGFW and Prisma Access, ya Other Services), Push Scope aur Ignore Security Check Failures. Full pushes naye tenants, Prisma Access mobile aur remote user setup, aur folder operations ke liye. Phir job aur Sync Status verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path: Configuration, Operations, Push Config.</li>
<li>Dialog ke chaar fields: Admin Scope, Push Target, Push Scope, Ignore Security Check Failures.</li>
<li>Naye tenants, pehli baar mobile aur remote setup, aur folder operations ko full push chahiye.</li>
<li>Jobs history commits, pushes aur reverts ko Summary, Description aur status ke saath dikhati hai.</li>
<li>Best-practice checks push block kar sakte hain jab tak override permission na ho.</li>
</ul></div>
`}};export{e as default};