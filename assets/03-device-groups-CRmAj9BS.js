var e={id:`device-groups`,h:{en:`Device groups: who gets which template`,hi:`Device groups: kisko kaunsa template milta hai`},body:{en:`
<p>In a school, students are placed in <b>classes</b>. The timetable is written once per class, not once per student. A new student joins Class 7B and automatically follows the Class 7B timetable. A <b>device group</b> is the class, the template is the timetable, and each branch is a student.</p>

<h3>What a device group is</h3>
<p>In the Director, a device group is a collection of devices that share a role and therefore share a configuration approach. In the real product, a group is used for organising devices and for binding the templates, and sometimes policy and other common settings, that every member receives. In the course model the relationship is simple and strict:</p>
<pre class="code">set director groups BRANCHES template BR-DUAL</pre>
<p>The group <code>BRANCHES</code> points to exactly one template, <code>BR-DUAL</code>. A device then declares which group it belongs to, and the template follows from the group. The device never points at the template directly.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Group to template to devices">
<rect x="240" y="15" width="160" height="46" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="14">Template BR-DUAL</text>
<rect x="240" y="95" width="160" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="14">Group BRANCHES</text>
<line x1="320" y1="61" x2="320" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="175" width="150" height="38" rx="8" fill="#bbf7d0"/><text x="115" y="199" text-anchor="middle" class="svg-ink" font-size="13">Branch1 (101)</text>
<rect x="245" y="175" width="150" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="199" text-anchor="middle" class="svg-ink" font-size="13">Branch2 (102)</text>
<rect x="450" y="175" width="150" height="38" rx="8" fill="#bbf7d0"/><text x="525" y="199" text-anchor="middle" class="svg-ink" font-size="13">Branch3 (103)</text>
<line x1="320" y1="141" x2="115" y2="175" stroke="#64748b" stroke-width="2"/><line x1="320" y1="141" x2="320" y2="175" stroke="#64748b" stroke-width="2"/><line x1="320" y1="141" x2="525" y2="175" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The device joins a group; the group supplies the template. Per-device values come from bind data.</p></div>

<h3>Why groups exist</h3>
<ul>
<li><b>Roles.</b> Dual-circuit branches, single-circuit branches and hubs need different templates. Group names express the role.</li>
<li><b>Scale.</b> A new device is added to a group and inherits everything. No per-device design work.</li>
<li><b>Safe change.</b> You can change which template a group uses, or test a new template on a small pilot group first.</li>
<li><b>Reporting.</b> You can list and review devices by role.</li>
</ul>

<h3>Group design examples</h3>
<table class="cmp"><tr><th>Group</th><th>Template</th><th>Typical members</th></tr>
<tr><td>BRANCHES</td><td>BR-DUAL</td><td>Delhi, Bengaluru, Kolkata (Internet + MPLS)</td></tr>
<tr><td>BRANCHES-LTE</td><td>BR-TRIPLE</td><td>Remote sites with an extra LTE backup</td></tr>
<tr><td>PILOT</td><td>BR-DUAL-V2</td><td>2 test sites running a candidate template</td></tr></table>
<p>The names are only examples; in the lab you use <code>BRANCHES</code> and <code>BR-DUAL</code>.</p>

<h3>Creating the group and verifying it</h3>
<pre class="code">admin@Director-1-cli% set director groups BRANCHES template BR-DUAL
admin@Director-1-cli% commit</pre>
<pre class="out">admin@Director-1-cli&gt; show device-groups
Device group      Template
<span class="hl">BRANCHES          BR-DUAL</span></pre>

<div class="eg"><p><b>Worked example.</b> You have 30 dual-circuit branches in BRANCHES. A 31st site arrives. You add one device row with group BRANCHES and its bind data: 8 values. You did not touch the template, the group or any other branch. If the group had instead pointed at a template name that does not exist, every new device in that group would stop at post-staging.</p></div>

<div class="warn"><p><b>Common mistakes:</b> assigning a device to a group name that does not exist or was misspelt (BRANCH instead of BRANCHES); creating the group but forgetting the template line; changing a group's template while many devices are live and then redeploying everyone at once.</p></div>
<div class="exam"><p><b>Exam trap:</b> the group does not hold per-device values. IP addresses and site-ids belong to the device (bind data), not to the group or template.</p></div>

<div class="scn"><h4>The device that joined the wrong class</h4><p>A new Pune branch was entered with group BRANCH (singular). Staging worked, the Director accepted the serial, but the device stalled before configuration arrived. The Director showed a device with no resolved template. The engineer corrected the group name to BRANCHES and redeployed; the device came online.</p><p><b>Lesson:</b> a device in a group that does not exist gets no template. Read the device detail and check group and template together.</p></div>

<div class="iv"><p class="q">"Why not attach the template directly to each device?"</p><p>Groups give role-based inheritance. You manage a handful of groups instead of hundreds of devices, you can pilot a template on one group, and the onboarding wizard only needs the group to know what to push.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A device group collects devices of the same role; it points to a template.</li>
<li>Course model: group BRANCHES uses template BR-DUAL; the device names its group.</li>
<li>Adding a device to a group gives it the template without extra design work.</li>
<li>A missing or misspelt group or template stops post-staging.</li>
<li>Per-device values are never stored in the group.</li>
</ul></div>
`,hi:`
<p>School mein students ko <b>classes</b> mein rakha jata hai. Timetable ek class ke liye ek baar likha jata hai, har student ke liye nahi. Naya student Class 7B mein aata hai aur automatically Class 7B ka timetable follow karta hai. <b>Device group</b> class hai, template timetable hai, aur har branch ek student.</p>

<h3>Device group kya hai</h3>
<p>Director mein device group un devices ka collection hai jinka role same hai aur isliye configuration approach bhi same hai. Real product mein group devices ko organise karne aur un templates (aur kabhi policy aur dusri common settings) ko bind karne ke liye use hota hai jo har member ko milte hain. Course model mein relation simple aur strict hai:</p>
<pre class="code">set director groups BRANCHES template BR-DUAL</pre>
<p>Group <code>BRANCHES</code> exactly ek template <code>BR-DUAL</code> ko point karta hai. Phir device declare karta hai ki wo kis group ka member hai, aur template group se aa jata hai. Device kabhi directly template ko point nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Group to template to devices">
<rect x="240" y="15" width="160" height="46" rx="8" fill="#bae6fd"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="14">Template BR-DUAL</text>
<rect x="240" y="95" width="160" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="14">Group BRANCHES</text>
<line x1="320" y1="61" x2="320" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="175" width="150" height="38" rx="8" fill="#bbf7d0"/><text x="115" y="199" text-anchor="middle" class="svg-ink" font-size="13">Branch1 (101)</text>
<rect x="245" y="175" width="150" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="199" text-anchor="middle" class="svg-ink" font-size="13">Branch2 (102)</text>
<rect x="450" y="175" width="150" height="38" rx="8" fill="#bbf7d0"/><text x="525" y="199" text-anchor="middle" class="svg-ink" font-size="13">Branch3 (103)</text>
<line x1="320" y1="141" x2="115" y2="175" stroke="#64748b" stroke-width="2"/><line x1="320" y1="141" x2="320" y2="175" stroke="#64748b" stroke-width="2"/><line x1="320" y1="141" x2="525" y2="175" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Device group join karta hai; group template deta hai. Per-device values bind data se aati hain.</p></div>

<h3>Groups kyun hote hain</h3>
<ul>
<li><b>Roles.</b> Dual-circuit branches, single-circuit branches aur hubs ko alag templates chahiye. Group names role batate hain.</li>
<li><b>Scale.</b> Naya device group mein add hota hai aur sab kuch inherit karta hai. Per-device design work nahi.</li>
<li><b>Safe change.</b> Aap group ka template badal sakte ho, ya naya template pehle chhote pilot group par test kar sakte ho.</li>
<li><b>Reporting.</b> Role ke hisaab se devices list aur review kar sakte ho.</li>
</ul>

<h3>Group design examples</h3>
<table class="cmp"><tr><th>Group</th><th>Template</th><th>Typical members</th></tr>
<tr><td>BRANCHES</td><td>BR-DUAL</td><td>Delhi, Bengaluru, Kolkata (Internet + MPLS)</td></tr>
<tr><td>BRANCHES-LTE</td><td>BR-TRIPLE</td><td>Remote sites jahan extra LTE backup hai</td></tr>
<tr><td>PILOT</td><td>BR-DUAL-V2</td><td>2 test sites jo candidate template chalate hain</td></tr></table>
<p>Names sirf examples hain; lab mein aap <code>BRANCHES</code> aur <code>BR-DUAL</code> use karoge.</p>

<h3>Group banana aur verify karna</h3>
<pre class="code">admin@Director-1-cli% set director groups BRANCHES template BR-DUAL
admin@Director-1-cli% commit</pre>
<pre class="out">admin@Director-1-cli&gt; show device-groups
Device group      Template
<span class="hl">BRANCHES          BR-DUAL</span></pre>

<div class="eg"><p><b>Worked example.</b> BRANCHES mein 30 dual-circuit branches hain. 31st site aata hai. Aap group BRANCHES ke saath ek device row aur uska bind data add karte ho: 8 values. Template, group ya kisi aur branch ko haath nahi lagaya. Agar group aisa template name point karta jo exist nahi karta, to us group ka har naya device post-staging par ruk jata.</p></div>

<div class="warn"><p><b>Common mistakes:</b> device ko aise group name mein daalna jo exist nahi karta ya spelling galat hai (BRANCH instead of BRANCHES); group banana lekin template line bhool jana; bahut saare live devices hote hue group ka template badalna aur sabko ek saath redeploy karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> group per-device values nahi rakhta. IP addresses aur site-ids device (bind data) ke hain, group ya template ke nahi.</p></div>

<div class="scn"><h4>Galat class mein gaya device</h4><p>Naya Pune branch group BRANCH (singular) ke saath enter hua. Staging chala, Director ne serial accept kiya, lekin configuration aane se pehle device ruk gaya. Director ne resolved template ke bina device dikhaya. Engineer ne group name BRANCHES kiya aur redeploy kiya; device online aa gaya.</p><p><b>Lesson:</b> jo device aise group mein hai jo exist nahi karta use template nahi milta. Device detail padho aur group aur template dono saath check karo.</p></div>

<div class="iv"><p class="q">"Template ko har device se directly attach kyun nahi karte?"</p><p>Groups role-based inheritance dete hain. Aap hundreds of devices ki jagah gine-chune groups manage karte ho, ek group par template pilot kar sakte ho, aur onboarding wizard ko push karne ke liye sirf group chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device group same role ke devices ko collect karta hai; wo ek template ko point karta hai.</li>
<li>Course model: group BRANCHES template BR-DUAL use karta hai; device apna group batata hai.</li>
<li>Device ko group mein add karne se bina extra design ke template mil jata hai.</li>
<li>Missing ya galat spelling wala group ya template post-staging rok deta hai.</li>
<li>Per-device values group mein kabhi store nahi hoti.</li>
</ul></div>
`}};export{e as default};