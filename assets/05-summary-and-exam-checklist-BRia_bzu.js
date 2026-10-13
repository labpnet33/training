var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module in one minute</h3>
<p>A distributed firewall policy is built from a few objects. <b>VMs</b> sit in the inventory and carry <b>tags</b> (name plus value) that describe what they are. <b>Groups</b> turn tags or names into roles: dynamic groups follow criteria (match ALL or ANY), static groups follow a list. A <b>rule</b> names a source group, a destination group, a service and an action, and <b>Applied To</b> decides which vNICs enforce it. Rules live in <b>categories</b> read in the order Emergency, Infrastructure, Environment, Application; inside a category the order is top to bottom and the first match wins. If nothing matches, the <b>default rule</b> decides, and on a fresh install it allows. Nothing is enforced until you press <b>Publish changes</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="From VM to decision in five steps">
<rect x="10" y="40" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="13">VM + tags</text><text x="65" y="90" text-anchor="middle" class="svg-muted" font-size="11">what it is</text>
<rect x="135" y="40" width="110" height="70" rx="10" fill="#bbf7d0"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="13">Group</text><text x="190" y="90" text-anchor="middle" class="svg-muted" font-size="11">dynamic / static</text>
<rect x="260" y="40" width="110" height="70" rx="10" fill="#ddd6fe"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="315" y="90" text-anchor="middle" class="svg-muted" font-size="11">src, dst, svc, action</text>
<rect x="385" y="40" width="110" height="70" rx="10" fill="#fde68a"/><text x="440" y="70" text-anchor="middle" class="svg-ink" font-size="13">Applied To</text><text x="440" y="90" text-anchor="middle" class="svg-muted" font-size="11">where enforced</text>
<rect x="510" y="40" width="120" height="70" rx="10" fill="#fed7aa"/><text x="570" y="70" text-anchor="middle" class="svg-ink" font-size="13">Order</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="11">category, first match</text>
<line x1="120" y1="75" x2="135" y2="75" stroke="#64748b" stroke-width="2"/><line x1="245" y1="75" x2="260" y2="75" stroke="#64748b" stroke-width="2"/><line x1="370" y1="75" x2="385" y2="75" stroke="#64748b" stroke-width="2"/><line x1="495" y1="75" x2="510" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="12">Then the default rule if nothing matched. Publish changes to make it real.</text>
</svg><p class="cap">The policy model as a chain: each link can break the one after it.</p></div>

<h3>A reading order for any Traceflow</h3>
<p>When a flow does not behave, read the trace in this order. It matches the four chapters.</p>
<ol>
<li><b>Source or destination says no</b>: the VM is not in the group. Check the VM's tags (exact text) and the group's criteria and match mode. Chapters 1 and 2.</li>
<li><b>Service says no</b>: the rule is for another service, for example sql against ssh.</li>
<li><b>Applied to says no</b>: the rule is not enforced at either end of the flow. Chapter 3.</li>
<li><b>An earlier MATCH line</b>: a higher category or a higher rule won first. Chapter 4.</li>
<li><b>Default rule at the end</b>: no rule covers the flow. Add one, or decide that the default is right.</li>
<li><b>Nothing changed after your edit</b>: you forgot to publish.</li>
</ol>

<h3>The four labs at a glance</h3>
<table class="cmp">
<tr><th>Lab</th><th>Symptom</th><th>Root cause</th><th>Fix</th></tr>
<tr><td>1</td><td>New WEB-P2 cannot reach app tier</td><td>Tag app = web missing, so the dynamic group skips it</td><td>Add the tag, publish</td></tr>
<tr><td>2</td><td>Tagged by hand, still cut off</td><td>Value "Web" is not "web" (exact text)</td><td>Correct the VM tag, not the group</td></tr>
<tr><td>3</td><td>Operations needs helper groups</td><td>Not a fault: build one dynamic (name starts with WEB-) and one static group</td><td>Create both, publish, read members</td></tr>
<tr><td>4</td><td>Web cannot reach app after default deny</td><td>Rule Applied To points at the database group</td><td>Set Applied To to DFW</td></tr>
</table>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why IP and name based rules do not scale and what a tag is (name plus value).</li>
<li>Read the Inventory and tags page and list a VM's tags.</li>
<li>Predict the members of a dynamic group under match ALL and match ANY, including name criteria and an empty criteria list.</li>
<li>Say when a static group is the right choice and what its cost is.</li>
<li>Explain DFW versus group in Applied To, and why a rule is enforced when the source or the destination is in the group.</li>
<li>Name the categories in order and give an example rule for each.</li>
<li>Explain first match wins, disabled rules, and why a broad rule above a specific one is dangerous.</li>
<li>Explain the fresh-install default rule and the safe way to harden it.</li>
<li>Tell a draft from a published change, and Traceflow (read only) from Send test traffic (counts hits).</li>
<li>State what the simulator does not model.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Applied To</dt><dd>Setting that controls where a rule is enforced: DFW (every vNIC) or a group.</dd>
<dt>Category</dt><dd>A priority level of rules: Emergency, Infrastructure, Environment, Application.</dd>
<dt>Default rule</dt><dd>The last rule, used only when nothing matched; allow on a fresh install.</dd>
<dt>Draft (candidate)</dt><dd>Edits that are saved in the console but not yet enforced.</dd>
<dt>Dynamic group</dt><dd>A group whose members come from criteria, re-checked automatically.</dd>
<dt>First match wins</dt><dd>The first matching, enabled rule decides and the rest are not read.</dd>
<dt>Inventory</dt><dd>The list of VMs the console knows, with IPs and tags.</dd>
<dt>Match ALL / ANY</dt><dd>Whether a VM must meet every criterion (AND) or at least one (OR).</dd>
<dt>Published (running)</dt><dd>The policy that is actually enforced after Publish changes.</dd>
<dt>Static group</dt><dd>A group that is a fixed list of VMs chosen by hand.</dd>
<dt>Tag</dt><dd>A name plus value label on a VM, compared as exact text.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Category order</td><td>Emergency, Infrastructure, Environment, Application, then the default rule.</td></tr>
<tr><td>Inside a category</td><td>Top to bottom; first match wins; disabled rules are skipped.</td></tr>
<tr><td>Tag compare</td><td>Exact text: Web is not web.</td></tr>
<tr><td>Name compare</td><td>starts with, contains, equals; case is ignored.</td></tr>
<tr><td>Empty dynamic group</td><td>No criteria means no members, not everyone.</td></tr>
<tr><td>Applied To</td><td>DFW or group; enforced when source or destination is a member; empty or missing group enforces nowhere.</td></tr>
<tr><td>Fresh install default</td><td>Allow.</td></tr>
<tr><td>Draft versus published</td><td>Only Publish changes makes a draft enforced.</td></tr>
</table>

<div class="note"><p><b>Simulator limits.</b> This is an original learning model. It does not model the Ethernet (layer 2) category, the "Jump to Application" action, the real ESXi kernel module, NSX Manager clustering, containers or public-cloud workloads, and rule actions are reduced to allow or deny. Publish is instant here. Console pages used in this module: Overview, Inventory and tags, Groups, Policy, Tools (Traceflow, Send test traffic), Flows and logs, Alerts and audit. This is independent training based on published product documentation.</p></div>

<div class="scn"><h4>The new joiner who read the trace in order</h4><p>On her first week a junior engineer got a ticket: a new VM could not reach its database. She did not touch a rule. She ran Traceflow, saw source no on the app-to-database rule, opened the VM in the inventory, found the tag value had a capital letter, fixed it, published, and ran the trace again. Total time: six minutes, one tag changed, no rule edited.</p><p><b>Lesson:</b> read the trace in order and fix the one thing that is wrong.</p></div>

<div class="iv"><p class="q">"A user says a firewall rule is not working. How do you troubleshoot it?"</p><p>Strong answer: run a Traceflow for the exact flow and read it. If source or destination says no, check the VM's tags and the group criteria. If the service says no, check the rule's service. If applied to says no, check Applied To. If another rule matches first, check category and rule order. If only the default rule appears, no rule covers the flow. Then fix the single cause, publish, and run the trace again.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tags describe a VM, groups turn tags into roles, rules use groups, Applied To scopes enforcement.</li>
<li>Order is category priority, then top to bottom, then the default rule.</li>
<li>Exact-text tags and ANY versus ALL are the two most common membership mistakes.</li>
<li>Read a trace as source, destination, service, applied to, earlier match, default.</li>
<li>Publish changes before you test; fix one cause at a time.</li>
</ul></div>
`,hi:`
<h3>Poora module ek minute mein</h3>
<p>Distributed firewall policy kuch objects se banti hai. <b>VMs</b> inventory mein hote hain aur <b>tags</b> (name plus value) rakhte hain jo batate hain woh kya hain. <b>Groups</b> tags ya names ko roles mein badalte hain: dynamic groups criteria follow karte hain (match ALL ya ANY), static groups list follow karte hain. <b>Rule</b> source group, destination group, service aur action ka naam leta hai, aur <b>Applied To</b> tay karta hai kaunse vNICs use enforce karte hain. Rules <b>categories</b> mein rehte hain jo Emergency, Infrastructure, Environment, Application order mein padhi jaati hain; category ke andar order ooper se neeche hai aur pehla match jeetta hai. Kuch match na ho to <b>default rule</b> decide karta hai, aur fresh install par woh allow karta hai. <b>Publish changes</b> dabaye bina kuch enforce nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="VM se decision tak paanch steps">
<rect x="10" y="40" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="13">VM + tags</text><text x="65" y="90" text-anchor="middle" class="svg-muted" font-size="11">woh kya hai</text>
<rect x="135" y="40" width="110" height="70" rx="10" fill="#bbf7d0"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="13">Group</text><text x="190" y="90" text-anchor="middle" class="svg-muted" font-size="11">dynamic / static</text>
<rect x="260" y="40" width="110" height="70" rx="10" fill="#ddd6fe"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="315" y="90" text-anchor="middle" class="svg-muted" font-size="11">src, dst, svc, action</text>
<rect x="385" y="40" width="110" height="70" rx="10" fill="#fde68a"/><text x="440" y="70" text-anchor="middle" class="svg-ink" font-size="13">Applied To</text><text x="440" y="90" text-anchor="middle" class="svg-muted" font-size="11">kahan enforce</text>
<rect x="510" y="40" width="120" height="70" rx="10" fill="#fed7aa"/><text x="570" y="70" text-anchor="middle" class="svg-ink" font-size="13">Order</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="11">category, first match</text>
<line x1="120" y1="75" x2="135" y2="75" stroke="#64748b" stroke-width="2"/><line x1="245" y1="75" x2="260" y2="75" stroke="#64748b" stroke-width="2"/><line x1="370" y1="75" x2="385" y2="75" stroke="#64748b" stroke-width="2"/><line x1="495" y1="75" x2="510" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="12">Kuch match na ho to default rule. Real banane ke liye Publish changes.</text>
</svg><p class="cap">Policy model ek chain ki tarah: har link agle ko tod sakti hai.</p></div>

<h3>Kisi bhi Traceflow ko padhne ka order</h3>
<p>Flow theek behave na kare to trace ko is order mein padho. Yeh chaaron chapters se match karta hai.</p>
<ol>
<li><b>Source ya destination no kahe</b>: VM group mein nahi hai. VM ke tags (exact text) aur group ke criteria aur match mode check karo. Chapters 1 aur 2.</li>
<li><b>Service no kahe</b>: rule kisi doosri service ka hai, jaise sql ke saamne ssh.</li>
<li><b>Applied to no kahe</b>: rule flow ke kisi bhi end par enforce nahi hota. Chapter 3.</li>
<li><b>Pehle ki MATCH line</b>: upar ki category ya upar ka rule pehle jeet gaya. Chapter 4.</li>
<li><b>End mein default rule</b>: koi rule flow ko cover nahi karta. Ek jodo, ya tay karo ki default theek hai.</li>
<li><b>Edit ke baad kuch nahi badla</b>: aap publish karna bhool gaye.</li>
</ol>

<h3>Chaaron labs ek nazar mein</h3>
<table class="cmp">
<tr><th>Lab</th><th>Symptom</th><th>Root cause</th><th>Fix</th></tr>
<tr><td>1</td><td>Naya WEB-P2 app tier tak nahi pahunchta</td><td>Tag app = web gayab hai, isliye dynamic group use skip karta hai</td><td>Tag jodo, publish karo</td></tr>
<tr><td>2</td><td>Haath se tag kiya, phir bhi cut off</td><td>Value "Web", "web" nahi hai (exact text)</td><td>VM ka tag theek karo, group nahi</td></tr>
<tr><td>3</td><td>Operations ko helper groups chahiye</td><td>Fault nahi: ek dynamic (name WEB- se shuru) aur ek static group banao</td><td>Dono banao, publish karo, members padho</td></tr>
<tr><td>4</td><td>Default deny ke baad web app tak nahi pahunchta</td><td>Rule ka Applied To database group par hai</td><td>Applied To ko DFW karo</td></tr>
</table>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki IP aur name based rules scale kyun nahi karte aur tag kya hai (name plus value).</li>
<li>Inventory and tags page padh kar VM ke tags list karo.</li>
<li>Match ALL aur match ANY ke under dynamic group ke members predict karo, name criteria aur khaali criteria list ke saath.</li>
<li>Batao static group kab sahi choice hai aur uski keemat kya hai.</li>
<li>Applied To mein DFW versus group samjhao, aur yeh bhi ki rule source ya destination group mein hone par enforce kyun hota hai.</li>
<li>Categories order mein batao aur har ka ek example rule do.</li>
<li>First match wins, disabled rules, aur specific ke ooper broad rule khatarnak kyun hai samjhao.</li>
<li>Fresh-install default rule aur use harden karne ka safe tareeka samjhao.</li>
<li>Draft aur published change ka fark, aur Traceflow (read only) versus Send test traffic (hits gintata hai) ka fark batao.</li>
<li>Batao ki simulator kya model nahi karta.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Applied To</dt><dd>Setting jo control karti hai rule kahan enforce hota hai: DFW (har vNIC) ya ek group.</dd>
<dt>Category</dt><dd>Rules ka priority level: Emergency, Infrastructure, Environment, Application.</dd>
<dt>Default rule</dt><dd>Aakhri rule, sirf tab use hota hai jab kuch match na ho; fresh install par allow.</dd>
<dt>Draft (candidate)</dt><dd>Edits jo console mein save hain lekin abhi enforce nahi hue.</dd>
<dt>Dynamic group</dt><dd>Aisa group jiske members criteria se aate hain, automatically dobara check hote hain.</dd>
<dt>First match wins</dt><dd>Pehla matching, enabled rule decide karta hai aur baaki padhe nahi jaate.</dd>
<dt>Inventory</dt><dd>VMs ki list jo console jaanta hai, IPs aur tags ke saath.</dd>
<dt>Match ALL / ANY</dt><dd>VM ko har criterion (AND) ya kam se kam ek (OR) poora karna hai.</dd>
<dt>Published (running)</dt><dd>Woh policy jo Publish changes ke baad sach mein enforce hoti hai.</dd>
<dt>Static group</dt><dd>VMs ki fixed list wala group jo haath se chuna jaata hai.</dd>
<dt>Tag</dt><dd>VM par name plus value label, exact text se compare hota hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Category order</td><td>Emergency, Infrastructure, Environment, Application, phir default rule.</td></tr>
<tr><td>Category ke andar</td><td>Ooper se neeche; pehla match jeetta hai; disabled rules skip hote hain.</td></tr>
<tr><td>Tag compare</td><td>Exact text: Web, web nahi hai.</td></tr>
<tr><td>Name compare</td><td>starts with, contains, equals; case ignore hota hai.</td></tr>
<tr><td>Empty dynamic group</td><td>Criteria nahi to members nahi, sab nahi.</td></tr>
<tr><td>Applied To</td><td>DFW ya group; source ya destination member ho to enforce; empty ya missing group kahin enforce nahi.</td></tr>
<tr><td>Fresh install default</td><td>Allow.</td></tr>
<tr><td>Draft versus published</td><td>Sirf Publish changes draft ko enforced banata hai.</td></tr>
</table>

<div class="note"><p><b>Simulator limits.</b> Yeh ek original learning model hai. Yeh Ethernet (layer 2) category, "Jump to Application" action, asli ESXi kernel module, NSX Manager clustering, containers ya public-cloud workloads model nahi karta, aur rule actions allow ya deny tak reduce hain. Yahan Publish instant hai. Is module mein use hone wale console pages: Overview, Inventory and tags, Groups, Policy, Tools (Traceflow, Send test traffic), Flows and logs, Alerts and audit. Yeh independent training hai jo published product documentation par based hai.</p></div>

<div class="scn"><h4>Naya joiner jisne trace order mein padha</h4><p>Pehle hafte mein ek junior engineer ko ticket mila: naya VM apne database tak nahi pahunch raha. Usne koi rule nahi chhua. Usne Traceflow chalaya, app-to-database rule par source no dekha, inventory mein VM kholi, dekha ki tag value mein capital letter hai, use theek kiya, publish kiya, aur trace dobara chalaya. Kul samay: chhe minute, ek tag badla, koi rule edit nahi hua.</p><p><b>Seekh:</b> trace ko order mein padho aur woh ek cheez theek karo jo galat hai.</p></div>

<div class="iv"><p class="q">"User kehta hai firewall rule kaam nahi kar raha. Aap troubleshoot kaise karoge?"</p><p>Strong answer: exact flow ka Traceflow chalao aur padho. Source ya destination no kahe to VM ke tags aur group criteria check karo. Service no kahe to rule ki service check karo. Applied to no kahe to Applied To check karo. Koi aur rule pehle match kare to category aur rule order check karo. Sirf default rule dikhe to koi rule flow ko cover nahi karta. Phir ek hi cause theek karo, publish karo, aur trace dobara chalao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tags VM ko describe karte hain, groups tags ko roles banate hain, rules groups use karte hain, Applied To enforcement scope karta hai.</li>
<li>Order hai category priority, phir ooper se neeche, phir default rule.</li>
<li>Exact-text tags aur ANY versus ALL membership ki do sabse aam galtiyan hain.</li>
<li>Trace ko padho: source, destination, service, applied to, pehla match, default.</li>
<li>Test se pehle Publish changes karo; ek baar mein ek cause theek karo.</li>
</ul></div>
`}};export{e as default};