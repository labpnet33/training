var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with one working user and finished with a complete decision chain that you can build, read and repair. This chapter collects everything you should be able to do, the words you must know and the facts that appear again and again in exams and interviews. Read it the evening before a lab test or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap chain with the objects of the lab">
<rect x="8" y="30" width="118" height="60" rx="8" fill="#bae6fd"/><text x="67" y="55" text-anchor="middle" class="svg-ink" font-size="12">Service</text><text x="67" y="73" text-anchor="middle" class="svg-muted" font-size="11">Wired 802.1X</text>
<rect x="138" y="30" width="118" height="60" rx="8" fill="#bbf7d0"/><text x="197" y="55" text-anchor="middle" class="svg-ink" font-size="12">Authentication</text><text x="197" y="73" text-anchor="middle" class="svg-muted" font-size="11">PEAP, local users</text>
<rect x="268" y="30" width="118" height="60" rx="8" fill="#ddd6fe"/><text x="327" y="55" text-anchor="middle" class="svg-ink" font-size="12">Role mapping</text><text x="327" y="73" text-anchor="middle" class="svg-muted" font-size="11">RM-WIRED</text>
<rect x="398" y="30" width="118" height="60" rx="8" fill="#fde68a"/><text x="457" y="55" text-anchor="middle" class="svg-ink" font-size="12">Policy</text><text x="457" y="73" text-anchor="middle" class="svg-muted" font-size="11">EPOL-WIRED</text>
<rect x="528" y="30" width="104" height="60" rx="8" fill="#fed7aa"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="12">Profile</text><text x="580" y="73" text-anchor="middle" class="svg-muted" font-size="11">EP-*</text>
<g stroke="#64748b" stroke-width="2"><line x1="126" y1="60" x2="138" y2="60"/><line x1="256" y1="60" x2="268" y2="60"/><line x1="386" y1="60" x2="398" y2="60"/><line x1="516" y1="60" x2="528" y2="60"/></g>
<text x="320" y="124" text-anchor="middle" class="svg-accent" font-size="13">First match in three places: service list, mapping rules, policy rules</text>
</svg><p class="cap">The whole module on one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the five stages in order and say which alert code belongs to which stage.</li>
<li>Create a service from the wired 802.1X or wired MAC auth template and read its classification rules.</li>
<li>State why NAS-Port-Type 15 and Service-Type 1, 2 or 8 identify wired 802.1X, and Service-Type 10 identifies MAC auth.</li>
<li>Describe authentication methods and sources, and say what is concept-only (AD, LDAP, EAP-TLS).</li>
<li>Add a ClearPass role and a role mapping rule on an attribute; choose first match or all matches.</li>
<li>Write enforcement policy rules on Tips:Role with a safe default profile.</li>
<li>Build a RADIUS profile with Aruba-User-Role, or with the three VLAN attributes.</li>
<li>Diagnose the three order faults: test service first, catch-all rule first, missing mapping.</li>
<li>Verify on both sides: Access Tracker tabs and show port-access clients.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Service</dt><dd>A bundle of classification rules, methods, sources, role mapping and enforcement policy; the first matching service in the list handles the request.</dd>
<dt>Classification rule</dt><dd>Attribute, operator and value used to decide whether a service applies; combined with match ALL or ANY.</dd>
<dt>Authentication method</dt><dd>How the proof is checked, for example [EAP PEAP] or [MAC AUTH].</dd>
<dt>Authentication source</dt><dd>Where the identity is stored: [Local User Repository], [Endpoints Repository], or AD/LDAP (concept-only here).</dd>
<dt>Role (ClearPass)</dt><dd>A label derived from attributes by role mapping, for example ENGINEER. Not the same thing as a switch role.</dd>
<dt>Role mapping policy</dt><dd>Rules that turn attributes into roles, with an algorithm and an optional default role.</dd>
<dt>Enforcement policy</dt><dd>Ordered rules on roles and other context that select enforcement profiles, with a default profile.</dd>
<dt>Enforcement profile</dt><dd>The RADIUS attributes (or accept, reject, drop action) sent back to the NAD.</dd>
<dt>Aruba-User-Role</dt><dd>The attribute that names a role that already exists on the switch; compared exactly.</dd>
<dt>Tips:Role</dt><dd>The condition attribute that holds the ClearPass roles of the current request.</dd>
<dt>Access Tracker</dt><dd>The record of each request with Summary, Input, Output and Alerts tabs.</dd>
<dt>Default profile</dt><dd>What applies when no policy rule matches; [Deny Access Profile] is the safe choice.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>Services are evaluated top to bottom; first match wins; no match gives 9002.</li>
<li>Authentication success does not grant access; enforcement selects the outcome.</li>
<li>215 password mismatch, 216 user or endpoint not found, 217 disabled.</li>
<li>[User Authenticated] is true for every authenticated user. Never use it as a lone Accept condition.</li>
<li>With first match, a user gets one mapped role; with all matches, every matching role.</li>
<li>The default profile applies only when no rule matched. Deny is the safe default; the Access Tracker explains it with 9010.</li>
<li>Standard VLAN assignment needs Tunnel-Type 13, Tunnel-Medium-Type 6 and Tunnel-Private-Group-Id; otherwise the switch ignores it.</li>
<li>Switch role names are case-sensitive and must exist; the role's VLAN must exist and be allowed on the uplink.</li>
<li>Changes take effect at the next authentication; bounce the port, reauthorize or send a Disconnect.</li>
<li>Not simulated in the lab: the web GUI, AD/LDAP, EAP-TLS, guest portals, OnGuard, profiling, TACACS+, downloadable user roles.</li>
</ol>

<h3>Lab shell cheat sheet</h3>
<p>The commands below mirror the GUI menus. They exist in the lab shell only; the real product uses the web GUI.</p>
<pre class="code"><span class="c">! Role mapping (Configuration &gt; Identity)</span>
configuration identity role add CONTRACTOR
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Contractor then CONTRACTOR
configuration identity role-mapping show RM-WIRED
<span class="c">! Enforcement (Configuration &gt; Enforcement)</span>
configuration enforcement profile add EP-CONTRACTOR type radius
configuration enforcement profile EP-CONTRACTOR attribute add Radius:Aruba:Aruba-User-Role CONTRACTOR
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR
configuration enforcement policy show EPOL-WIRED
configuration enforcement policy EPOL-WIRED rule remove 1
<span class="c">! Services (Configuration &gt; Services)</span>
configuration service show
configuration service "Wired 802.1X" order 1
configuration service "Wired Allow-All Test" disable
<span class="c">! Monitoring</span>
monitoring access-tracker detail latest summary
monitoring access-tracker detail bob alerts
<span class="c">! Switch ACCESS</span>
show port-access clients detail
interface 1/1/3-1/1/4
    shutdown
    no shutdown</pre>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Mixing up ClearPass roles and switch roles. Forgetting that rule numbers shift after a removal. Calling a reject "a password problem" without reading the alert. Saying a policy edit applies to live sessions immediately.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question lists "service", "role mapping", "enforcement policy" and "enforcement profile" and asks for the order, the answer is: service, authentication, role mapping, enforcement policy, enforcement profile. Authentication always sits between the service and the role mapping.</p></div>

<div class="scn"><h4>The interview you are now ready for</h4><p>An interviewer describes a company where contractors are rejected, employees sometimes land in the guest VLAN, and a pilot service is still enabled. A candidate who finished this module draws the five-stage chain on the whiteboard, asks for the Access Tracker summary of one failing user per symptom, and names a stage for each: mapping, order of the policy, order of the services. The interviewer stops the case early and moves on to design questions.</p><p><b>Lesson:</b> a clear mental model is worth more than memorised screens.</p></div>

<div class="iv"><p class="q">"Summarise how ClearPass decides what network access a user gets."</p><p>Strong answer: the request is matched to the first matching service, authenticated by the service's method against its source, mapped to roles from attributes, run through an ordered enforcement policy with a default profile, and answered with the profile's RADIUS attributes such as Aruba-User-Role. Add that every stage is visible in the Access Tracker, order matters in three lists, and changes apply at the next authentication.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five stages, always in order; the Access Tracker shows each one.</li>
<li>First match in service list, role mapping and enforcement policy; specific before general.</li>
<li>Role mapping makes labels; policy picks profiles; profiles carry switch settings.</li>
<li>Default deny and exact switch role names keep the design safe and predictable.</li>
<li>Know what the lab simulates and what is concept-only.</li>
</ul></div>
`,hi:`
<p>Is module ko aapne ek working user ke saath shuru kiya tha aur ek poori decision chain par khatam kiya jise aap bana sakte ho, padh sakte ho aur repair kar sakte ho. Yeh chapter woh sab collect karta hai jo aapko kar paana chahiye, woh shabd jo aapko aane chahiye aur woh facts jo exams aur interviews mein baar baar aate hain. Lab test ya interview se ek raat pehle ise padho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap chain lab ke objects ke saath">
<rect x="8" y="30" width="118" height="60" rx="8" fill="#bae6fd"/><text x="67" y="55" text-anchor="middle" class="svg-ink" font-size="12">Service</text><text x="67" y="73" text-anchor="middle" class="svg-muted" font-size="11">Wired 802.1X</text>
<rect x="138" y="30" width="118" height="60" rx="8" fill="#bbf7d0"/><text x="197" y="55" text-anchor="middle" class="svg-ink" font-size="12">Authentication</text><text x="197" y="73" text-anchor="middle" class="svg-muted" font-size="11">PEAP, local users</text>
<rect x="268" y="30" width="118" height="60" rx="8" fill="#ddd6fe"/><text x="327" y="55" text-anchor="middle" class="svg-ink" font-size="12">Role mapping</text><text x="327" y="73" text-anchor="middle" class="svg-muted" font-size="11">RM-WIRED</text>
<rect x="398" y="30" width="118" height="60" rx="8" fill="#fde68a"/><text x="457" y="55" text-anchor="middle" class="svg-ink" font-size="12">Policy</text><text x="457" y="73" text-anchor="middle" class="svg-muted" font-size="11">EPOL-WIRED</text>
<rect x="528" y="30" width="104" height="60" rx="8" fill="#fed7aa"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="12">Profile</text><text x="580" y="73" text-anchor="middle" class="svg-muted" font-size="11">EP-*</text>
<g stroke="#64748b" stroke-width="2"><line x1="126" y1="60" x2="138" y2="60"/><line x1="256" y1="60" x2="268" y2="60"/><line x1="386" y1="60" x2="398" y2="60"/><line x1="516" y1="60" x2="528" y2="60"/></g>
<text x="320" y="124" text-anchor="middle" class="svg-accent" font-size="13">Teen jagah first match: service list, mapping rules, policy rules</text>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Paanch stages ko order mein samjhao aur batao kaunsa alert code kaunse stage ka hai.</li>
<li>Wired 802.1X ya wired MAC auth template se service banao aur uske classification rules padho.</li>
<li>Batao ki NAS-Port-Type 15 aur Service-Type 1, 2 ya 8 wired 802.1X kyun pehchante hain, aur Service-Type 10 MAC auth ko.</li>
<li>Authentication methods aur sources describe karo, aur batao kya concept-only hai (AD, LDAP, EAP-TLS).</li>
<li>ClearPass role aur attribute par role mapping rule jodo; first match ya all matches chuno.</li>
<li>Safe default profile ke saath Tips:Role par enforcement policy rules likho.</li>
<li>Aruba-User-Role ke saath, ya teen VLAN attributes ke saath RADIUS profile banao.</li>
<li>Teen order faults diagnose karo: test service pehle, catch-all rule pehle, mapping missing.</li>
<li>Dono side verify karo: Access Tracker tabs aur show port-access clients.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Service</dt><dd>Classification rules, methods, sources, role mapping aur enforcement policy ka bundle; list ki pehli matching service request handle karti hai.</dd>
<dt>Classification rule</dt><dd>Attribute, operator aur value jisse tay hota hai ki service lagu hogi ya nahi; match ALL ya ANY se combine hota hai.</dd>
<dt>Authentication method</dt><dd>Proof kaise check hota hai, jaise [EAP PEAP] ya [MAC AUTH].</dd>
<dt>Authentication source</dt><dd>Identity kahan store hai: [Local User Repository], [Endpoints Repository], ya AD/LDAP (yahan concept-only).</dd>
<dt>Role (ClearPass)</dt><dd>Role mapping se attributes se nikala label, jaise ENGINEER. Switch role jaisa nahi hai.</dd>
<dt>Role mapping policy</dt><dd>Rules jo attributes ko roles banate hain, algorithm aur optional default role ke saath.</dd>
<dt>Enforcement policy</dt><dd>Roles aur doosre context par ordered rules jo enforcement profiles chunte hain, default profile ke saath.</dd>
<dt>Enforcement profile</dt><dd>NAD ko wapas bheje gaye RADIUS attributes (ya accept, reject, drop action).</dd>
<dt>Aruba-User-Role</dt><dd>Woh attribute jo switch par pehle se maujood role ka naam deta hai; exactly compare hota hai.</dd>
<dt>Tips:Role</dt><dd>Condition attribute jisme current request ke ClearPass roles hote hain.</dd>
<dt>Access Tracker</dt><dd>Har request ka record, Summary, Input, Output aur Alerts tabs ke saath.</dd>
<dt>Default profile</dt><dd>Jab koi policy rule match na kare tab jo lagta hai; [Deny Access Profile] safe choice hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ol>
<li>Services upar se neeche evaluate hoti hain; pehla match jeetta hai; match nahi to 9002.</li>
<li>Authentication success se access nahi milta; enforcement outcome chunta hai.</li>
<li>215 password mismatch, 216 user ya endpoint not found, 217 disabled.</li>
<li>[User Authenticated] har authenticated user ke liye true hai. Use akeli Accept condition kabhi mat banao.</li>
<li>First match mein user ko ek mapped role milta hai; all matches mein har matching role.</li>
<li>Default profile sirf tab lagta hai jab koi rule match na ho. Deny safe default hai; Access Tracker use 9010 se samjhata hai.</li>
<li>Standard VLAN assignment ko Tunnel-Type 13, Tunnel-Medium-Type 6 aur Tunnel-Private-Group-Id chahiye; warna switch ignore karta hai.</li>
<li>Switch role names case-sensitive hain aur exist karne chahiye; role ka VLAN exist kare aur uplink par allowed ho.</li>
<li>Changes agli authentication par lagte hain; port bounce karo, reauthorize karo ya Disconnect bhejo.</li>
<li>Lab mein simulate nahi: web GUI, AD/LDAP, EAP-TLS, guest portals, OnGuard, profiling, TACACS+, downloadable user roles.</li>
</ol>

<h3>Lab shell cheat sheet</h3>
<p>Neeche ke commands GUI menus ko mirror karte hain. Yeh sirf lab shell mein hain; asli product web GUI use karta hai.</p>
<pre class="code"><span class="c">! Role mapping (Configuration &gt; Identity)</span>
configuration identity role add CONTRACTOR
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Contractor then CONTRACTOR
configuration identity role-mapping show RM-WIRED
<span class="c">! Enforcement (Configuration &gt; Enforcement)</span>
configuration enforcement profile add EP-CONTRACTOR type radius
configuration enforcement profile EP-CONTRACTOR attribute add Radius:Aruba:Aruba-User-Role CONTRACTOR
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR
configuration enforcement policy show EPOL-WIRED
configuration enforcement policy EPOL-WIRED rule remove 1
<span class="c">! Services (Configuration &gt; Services)</span>
configuration service show
configuration service "Wired 802.1X" order 1
configuration service "Wired Allow-All Test" disable
<span class="c">! Monitoring</span>
monitoring access-tracker detail latest summary
monitoring access-tracker detail bob alerts
<span class="c">! Switch ACCESS</span>
show port-access clients detail
interface 1/1/3-1/1/4
    shutdown
    no shutdown</pre>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> ClearPass roles aur switch roles ko mix karna. Yeh bhoolna ki removal ke baad rule numbers shift ho jaate hain. Alert padhe bina reject ko "password problem" kehna. Yeh kehna ki policy edit live sessions par turant lagu hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar question mein "service", "role mapping", "enforcement policy" aur "enforcement profile" diye hon aur order poocha jaaye, to jawab hai: service, authentication, role mapping, enforcement policy, enforcement profile. Authentication hamesha service aur role mapping ke beech baithta hai.</p></div>

<div class="scn"><h4>Woh interview jiske liye ab aap ready ho</h4><p>Interviewer ek company describe karta hai jahan contractors reject hote hain, employees kabhi kabhi guest VLAN mein land karte hain, aur ek pilot service abhi bhi enabled hai. Is module ko khatam kar chuka candidate whiteboard par paanch-stage chain banata hai, har symptom ke ek failing user ka Access Tracker summary maangta hai, aur har ek ke liye stage batata hai: mapping, policy ka order, services ka order. Interviewer case jaldi rok kar design questions par aa jaata hai.</p><p><b>Seekh:</b> clear mental model ratte hue screens se zyada keemti hai.</p></div>

<div class="iv"><p class="q">"Summarise karo ClearPass kaise tay karta hai ki user ko kaunsa network access milega."</p><p>Strong answer: request pehli matching service se match hoti hai, service ke method se uske source ke against authenticate hoti hai, attributes se roles mein map hoti hai, default profile wali ordered enforcement policy se guzarti hai, aur profile ke RADIUS attributes jaise Aruba-User-Role ke saath jawab milta hai. Jodo ki har stage Access Tracker mein visible hai, order teen lists mein matter karta hai, aur changes agli authentication par lagte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch stage, hamesha order mein; Access Tracker har ek dikhata hai.</li>
<li>Service list, role mapping aur enforcement policy mein first match; specific pehle, general baad mein.</li>
<li>Role mapping labels banata hai; policy profiles chunti hai; profiles switch settings le jaate hain.</li>
<li>Default deny aur exact switch role names design ko safe aur predictable rakhte hain.</li>
<li>Jaano lab kya simulate karta hai aur kya concept-only hai.</li>
</ul></div>
`}};export{e as default};