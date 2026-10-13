var e={id:`concerto`,h:{en:`Concerto and the bigger picture: orchestration above the Director`,hi:`Concerto aur bada picture: Director ke upar orchestration`},body:{en:`
<p>A restaurant chain has a <b>kitchen manager</b> in each city (the Director) and a <b>head of operations</b> who decides the menu for all cities (Concerto). The head of operations does not cook; she hands a simple intent such as "open a new branch with this menu" to the city managers.</p>

<h3>What Concerto is</h3>
<p><b>Versa Concerto</b> is the <b>orchestrator</b>: a higher-level management layer that provides an intent-based, simpler workflow across Director, Controller and Analytics. It uses the Director's APIs to do the detailed work. Concerto is optional. Small and mid-size deployments often use the Director alone; large enterprises and service providers add Concerto for simplicity, scale and multi-tenant self-service.</p>
<table class="cmp"><tr><th>Question</th><th>Director</th><th>Concerto</th></tr>
<tr><td>Level</td><td>Device and object level: templates, device groups, bind data</td><td>Intent and service level: sites, tenants, policies, connectivity</td></tr>
<tr><td>Typical user</td><td>Network engineer</td><td>Operations team, tenant admin, automation</td></tr>
<tr><td>Provides</td><td>Configuration push and management</td><td>Orchestration, simplified workflows, role-based portals, analytics views</td></tr>
<tr><td>Talks to</td><td>VOS devices, Controllers, Analytics</td><td>Director(s) through their API</td></tr>
<tr><td>Required?</td><td>Yes</td><td>No (optional)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Concerto above the Director">
<rect x="210" y="15" width="220" height="45" rx="10" fill="#fed7aa"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="14">Concerto (optional)</text>
<rect x="210" y="95" width="220" height="45" rx="10" fill="#ddd6fe"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="14">Director (REST API)</text>
<rect x="30" y="180" width="170" height="45" rx="10" fill="#bbf7d0"/><text x="115" y="208" text-anchor="middle" class="svg-ink" font-size="13">Controller(s)</text>
<rect x="235" y="180" width="170" height="45" rx="10" fill="#fde68a"/><text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text>
<rect x="440" y="180" width="170" height="45" rx="10" fill="#bae6fd"/><text x="525" y="208" text-anchor="middle" class="svg-ink" font-size="13">VOS branches</text>
<line x1="320" y1="60" x2="320" y2="95" stroke="#64748b" stroke-width="2.5"/>
<line x1="270" y1="140" x2="130" y2="180" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="180" stroke="#64748b" stroke-width="2"/><line x1="370" y1="140" x2="510" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="330" y="82" class="svg-accent" font-size="12">northbound API calls</text>
</svg><p class="cap">Concerto talks only to the Director API. The lab has no Concerto: you work directly on the Director.</p></div>

<h3>Why it matters to this module</h3>
<ul>
<li>Concerto <b>depends on</b> a correct Director, Controller and Analytics. If the headend link is wrong, Concerto cannot fix it. This is why you learn the base layer first.</li>
<li>The <b>northbound API</b> of the Director is the integration point. Everything you set in the lab by CLI has an API equivalent.</li>
<li>A provider with 50 customers uses Concerto to give each customer a portal, while one Director cluster and its Controllers serve all of them.</li>
</ul>

<h3>Putting the headend together</h3>
<table class="cmp"><tr><th>Component</th><th>Plane</th><th>Talks to</th><th>Fails: what you lose</th></tr>
<tr><td>Concerto</td><td>Orchestration</td><td>Director API</td><td>Simplified workflows; devices unaffected</td></tr>
<tr><td>Director</td><td>Management</td><td>Controller, branches (southbound), Analytics</td><td>Changes and onboarding; traffic unaffected</td></tr>
<tr><td>Controller</td><td>Control</td><td>Branches, Director</td><td>New sites and route changes; stale routes may persist briefly</td></tr>
<tr><td>Analytics</td><td>Monitoring</td><td>Branches (logs), Director</td><td>Visibility and reports; traffic unaffected</td></tr>
<tr><td>VOS branch</td><td>Data</td><td>Controller, other branches</td><td>That site only</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A provider creates tenant "Acme" in Concerto, selects a branch template and site details. Concerto calls the Director API to create the organization, device, bind data and template assignment, then triggers the deploy workflow. The result on the Director is what you build manually in the labs: group BRANCHES, template BR-DUAL, device Branch3 with serial VOS-BR3-0001.</p></div>

<div class="note"><p><b>Course model.</b> The course does not simulate Concerto. We include it because interviews and designs mention it. Know its position, role and that it is optional.</p></div>

<div class="warn"><p><b>Common mistake.</b> Saying that Concerto replaces the Director. It sits above it and uses it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Concerto is not in the data path and not a Controller. It does not run IKE or MP-BGP.</p></div>

<div class="scn"><h4>A provider scales from 5 to 60 customers</h4><p>A managed-service provider started with one Director and a few template-based customers. As customer count grew, operators struggled with manual objects and mistakes. They added Concerto for tenant portals and onboarding wizards. Template quality and headend reachability remained the foundation, and early incidents were again caused by a Controller-to-Director link, not Concerto.</p><p><b>Lesson:</b> orchestration improves speed but the headend fundamentals still decide stability.</p></div>

<div class="iv"><p class="q">"Where does Concerto fit relative to the Director?"</p><p>Above it. Concerto is an optional orchestrator with intent-based workflows and multi-tenant portals; it uses the Director API to create the same objects. The Director still owns device configuration, the Controller owns control, VOS owns data.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Concerto is an optional orchestrator above the Director.</li>
<li>It uses the Director northbound API; it is not in control or data path.</li>
<li>A failure in each component costs a different capability.</li>
<li>The lab works directly on the Director, Controller and Analytics.</li>
</ul></div>
`,hi:`
<p>Ek restaurant chain mein har shehar mein ek <b>kitchen manager</b> hota hai (Director) aur ek <b>head of operations</b> jo saare shehron ka menu decide karti hai (Concerto). Head of operations khana nahi banati; woh city managers ko simple intent deti hai, jaise "is menu ke saath nayi branch kholo".</p>

<h3>Concerto kya hai</h3>
<p><b>Versa Concerto</b> <b>orchestrator</b> hai: ek higher-level management layer jo Director, Controller aur Analytics ke upar intent-based, simple workflow deta hai. Detailed kaam ke liye yeh Director ke APIs use karta hai. Concerto optional hai. Chhote aur mid-size deployments aksar sirf Director use karte hain; bade enterprises aur service providers simplicity, scale aur multi-tenant self-service ke liye Concerto add karte hain.</p>
<table class="cmp"><tr><th>Sawaal</th><th>Director</th><th>Concerto</th></tr>
<tr><td>Level</td><td>Device aur object level: templates, device groups, bind data</td><td>Intent aur service level: sites, tenants, policies, connectivity</td></tr>
<tr><td>Typical user</td><td>Network engineer</td><td>Operations team, tenant admin, automation</td></tr>
<tr><td>Deta hai</td><td>Configuration push aur management</td><td>Orchestration, simple workflows, role-based portals, analytics views</td></tr>
<tr><td>Kisse baat karta hai</td><td>VOS devices, Controllers, Analytics</td><td>Director(s) se unke API ke through</td></tr>
<tr><td>Zaroori hai?</td><td>Haan</td><td>Nahi (optional)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Concerto above the Director">
<rect x="210" y="15" width="220" height="45" rx="10" fill="#fed7aa"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="14">Concerto (optional)</text>
<rect x="210" y="95" width="220" height="45" rx="10" fill="#ddd6fe"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="14">Director (REST API)</text>
<rect x="30" y="180" width="170" height="45" rx="10" fill="#bbf7d0"/><text x="115" y="208" text-anchor="middle" class="svg-ink" font-size="13">Controller(s)</text>
<rect x="235" y="180" width="170" height="45" rx="10" fill="#fde68a"/><text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text>
<rect x="440" y="180" width="170" height="45" rx="10" fill="#bae6fd"/><text x="525" y="208" text-anchor="middle" class="svg-ink" font-size="13">VOS branches</text>
<line x1="320" y1="60" x2="320" y2="95" stroke="#64748b" stroke-width="2.5"/>
<line x1="270" y1="140" x2="130" y2="180" stroke="#64748b" stroke-width="2"/><line x1="320" y1="140" x2="320" y2="180" stroke="#64748b" stroke-width="2"/><line x1="370" y1="140" x2="510" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="330" y="82" class="svg-accent" font-size="12">northbound API calls</text>
</svg><p class="cap">Concerto sirf Director API se baat karta hai. Lab mein Concerto nahi hai: aap seedha Director par kaam karte ho.</p></div>

<h3>Is module ke liye kyun zaroori hai</h3>
<ul>
<li>Concerto sahi Director, Controller aur Analytics par <b>depend</b> karta hai. Headend link galat ho to Concerto use fix nahi kar sakta. Isliye pehle base layer seekhte hain.</li>
<li>Director ka <b>northbound API</b> integration point hai. Lab mein CLI se jo set karte ho uska API equivalent hota hai.</li>
<li>50 customers wala provider har customer ko portal dene ke liye Concerto use karta hai, jabki ek Director cluster aur uske Controllers sabko serve karte hain.</li>
</ul>

<h3>Headend ko jodna</h3>
<table class="cmp"><tr><th>Component</th><th>Plane</th><th>Kisse baat karta hai</th><th>Fail ho to kya jaata hai</th></tr>
<tr><td>Concerto</td><td>Orchestration</td><td>Director API</td><td>Simple workflows; devices par asar nahi</td></tr>
<tr><td>Director</td><td>Management</td><td>Controller, branches (southbound), Analytics</td><td>Changes aur onboarding; traffic par asar nahi</td></tr>
<tr><td>Controller</td><td>Control</td><td>Branches, Director</td><td>Naye sites aur route changes; purane routes thodi der rah sakte hain</td></tr>
<tr><td>Analytics</td><td>Monitoring</td><td>Branches (logs), Director</td><td>Visibility aur reports; traffic par asar nahi</td></tr>
<tr><td>VOS branch</td><td>Data</td><td>Controller, doosri branches</td><td>Sirf woh site</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Provider Concerto mein tenant "Acme" banata hai, branch template aur site details chunta hai. Concerto Director API se organization, device, bind data aur template assignment banata hai, phir deploy workflow trigger karta hai. Director par result wahi hai jo aap labs mein haath se banate ho: group BRANCHES, template BR-DUAL, device Branch3 serial VOS-BR3-0001 ke saath.</p></div>

<div class="note"><p><b>Course model.</b> Course Concerto ko simulate nahi karta. Hum ise isliye lete hain kyunki interviews aur designs mein iska zikr aata hai. Iski position, role aur optional hona jaano.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh kehna ki Concerto Director ko replace karta hai. Yeh uske upar baithta hai aur use use karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Concerto data path mein nahi hai aur Controller nahi hai. Yeh IKE ya MP-BGP nahi chalata.</p></div>

<div class="scn"><h4>Provider 5 se 60 customers tak</h4><p>Ek managed-service provider ek Director aur kuch template-based customers se shuru hua. Customers badhe to operators manual objects aur galtiyon se pareshan hue. Unhone tenant portals aur onboarding wizards ke liye Concerto add kiya. Template quality aur headend reachability foundation rahe, aur shuruati incidents phir Controller-to-Director link se hue, Concerto se nahi.</p><p><b>Lesson:</b> orchestration speed badhata hai lekin stability headend fundamentals hi tay karte hain.</p></div>

<div class="iv"><p class="q">"Concerto Director ke relative kahan fit hota hai?"</p><p>Uske upar. Concerto optional orchestrator hai jisme intent-based workflows aur multi-tenant portals hain; yeh Director API se wahi objects banata hai. Device configuration phir bhi Director ke paas, control Controller ke paas, data VOS ke paas.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Concerto Director ke upar optional orchestrator hai.</li>
<li>Yeh Director northbound API use karta hai; control ya data path mein nahi hai.</li>
<li>Har component ke fail hone par alag capability jaati hai.</li>
<li>Lab seedha Director, Controller aur Analytics par chalta hai.</li>
</ul></div>
`}};export{e as default};