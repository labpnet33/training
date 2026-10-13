var e={id:`vms-tags`,h:{en:`VMs, tags and why names and IPs do not scale`,hi:`VMs, tags aur naam ya IP kyun scale nahi karte`},body:{en:`
<h3>What you will learn</h3>
<p>The previous module showed that a distributed firewall checks traffic at each VM. This module teaches the <b>policy model</b>: the objects you create so that a rule says "web servers may talk to app servers" instead of listing machines one by one. By the end of this chapter you can:</p>
<ul>
<li>explain what the inventory is and what a tag (a name and a value) is;</li>
<li>explain why rules written with IP addresses or VM names break as the data center grows;</li>
<li>read the Inventory and tags page and say which tags a VM carries;</li>
<li>explain what happens to a brand-new VM that nobody has tagged yet.</li>
</ul>
<p><b>Prerequisites:</b> module vd-start (VM, vNIC, rule parts, Traceflow, Publish changes). This is independent training based on published product documentation. It does not claim to prepare you for any named certification.</p>

<h3>An analogy: luggage tags at an airport</h3>
<p>At an airport, the baggage handler does not memorise who owns which bag. Every bag carries a tag with a few facts: flight, destination, class. The sorting machine reads the tag and sends the bag to the right belt. If a new passenger arrives and the bag gets the correct tag, it is sorted correctly with no change to the machine. If the tag is missing, the machine has no idea where the bag belongs.</p>
<p>A distributed firewall works the same way. A <b>tag</b> is a small label stuck on a VM. A rule does not name the VM; it names a <b>group</b> (chapter 2) that collects every VM carrying the right labels.</p>

<h3>Words you must know</h3>
<dl class="terms">
<dt>Inventory</dt><dd>The list of all VMs the console knows about, with their IP address and tags. In the simulator you see it on the <b>Inventory and tags</b> page. A VM that is not in the inventory is unknown to the policy.</dd>
<dt>Tag</dt><dd>A label on a VM made of a <b>name</b> and a <b>value</b>, written app = web. A VM can have several tags. Tags describe what a VM <em>is</em> (its job, its environment), not where it sits.</dd>
<dt>Policy model</dt><dd>The set of objects the policy is built from: VMs, tags, groups, rules, categories and the default rule. This module covers all of them.</dd>
<dt>Hard-coded rule</dt><dd>A rule that names IP addresses or VM names directly. It works today and breaks tomorrow.</dd>
</dl>

<h3>Why names and IPs do not scale</h3>
<p>Imagine the first version of the Narmada policy: "allow 10.10.10.10 to 10.10.10.20 on h&#116;tps". It is correct for exactly two machines. Now think about a normal month in a data center:</p>
<ul>
<li>The team adds a second web VM. A new rule is needed, or the old one must be edited.</li>
<li>A VM is rebuilt and receives a new IP. The old rule now points at nothing, or at a stranger.</li>
<li>The company adds a dev environment. Every rule is copied and edited by hand.</li>
</ul>
<p>With thousands of VMs, nobody can keep such rules correct. The fix is to <b>describe what a VM is</b> (a production web server) and let the policy follow that description. Add a VM, give it the right tags, and every existing rule covers it. Remove the VM and the rules shrink with it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Rules by IP versus rules by tag">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Rule by IP list</text>
<rect x="30" y="35" width="260" height="34" rx="8" fill="#fed7aa"/><text x="160" y="57" text-anchor="middle" class="svg-ink" font-size="12">allow 10.10.10.10 to 10.10.10.20</text>
<rect x="30" y="80" width="260" height="34" rx="8" fill="#fed7aa"/><text x="160" y="102" text-anchor="middle" class="svg-ink" font-size="12">allow 10.10.10.11 to 10.10.10.20</text>
<rect x="30" y="125" width="260" height="34" rx="8" fill="#fed7aa"/><text x="160" y="147" text-anchor="middle" class="svg-ink" font-size="12">allow 10.10.20.10 to 10.10.20.20</text>
<text x="160" y="190" text-anchor="middle" class="svg-muted" font-size="12">One new line for every new VM</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Rule by tag-based group</text>
<rect x="350" y="35" width="260" height="34" rx="8" fill="#bbf7d0"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="12">allow Web servers (prod) to App servers (prod)</text>
<rect x="350" y="85" width="120" height="30" rx="8" fill="#bae6fd"/><text x="410" y="105" text-anchor="middle" class="svg-ink" font-size="12">WEB-P  app=web</text>
<rect x="490" y="85" width="120" height="30" rx="8" fill="#bae6fd"/><text x="550" y="105" text-anchor="middle" class="svg-ink" font-size="12">WEB-P2 app=web</text>
<text x="480" y="190" text-anchor="middle" class="svg-muted" font-size="12">The rule never changes; tags decide who is covered</text>
</svg><p class="cap">Left: the rule list grows with the machines. Right: one rule and tags that describe each machine.</p></div>

<h3>The Narmada inventory and its tags</h3>
<p>The six Narmada VMs carry three tags each: <code>app</code> (web, app or db), <code>env</code> (prod or dev) and <code>tier</code> (1, 2 or 3).</p>
<table class="cmp">
<tr><th>VM</th><th>IP</th><th>app</th><th>env</th><th>tier</th></tr>
<tr><td>WEB-P</td><td>10.10.10.10</td><td>web</td><td>prod</td><td>1</td></tr>
<tr><td>APP-P</td><td>10.10.10.20</td><td>app</td><td>prod</td><td>2</td></tr>
<tr><td>DB-P</td><td>10.10.10.30</td><td>db</td><td>prod</td><td>3</td></tr>
<tr><td>WEB-D</td><td>10.10.20.10</td><td>web</td><td>dev</td><td>1</td></tr>
<tr><td>APP-D</td><td>10.10.20.20</td><td>app</td><td>dev</td><td>2</td></tr>
<tr><td>DB-D</td><td>10.10.20.30</td><td>db</td><td>dev</td><td>3</td></tr>
</table>
<p>Notice that the IP address is only one column. Policy cares about the other three.</p>

<div class="eg"><p><b>Worked example (Lab 1).</b> The team adds a second production web VM, WEB-P2 (10.10.10.11). Someone gave it the tags env = prod and tier = 1 but forgot app = web. The default rule has already been hardened to deny. Traceflow from WEB-P2 to APP-P on h&#116;tps gives this real output:</p>
<pre class="out">Flow: WEB-P2 -&gt; APP-P (h&#116;tps)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  <span class="hl">Web to app (prod): no match (source no, destination yes, service yes, applied to yes)</span>
  App to DB (prod): no match (source no, destination no, service no, applied to yes)
  Web to app (dev): no match (source no, destination no, service yes, applied to yes)
  App to DB (dev): no match (source no, destination no, service no, applied to yes)
No rule matched: default rule -&gt; DENY
Result: DENY by the default rule</pre>
<p>Read the highlighted line: <b>source no</b>. The rule is fine, the service is fine, but WEB-P2 is not a member of the group the rule names, because it lacks app = web. The fix is not a new rule. Add the tag app = web on the Inventory and tags page and press <b>Publish changes</b>. The group then picks the VM up by itself.</p></div>

<h3>An untagged VM is not invisible</h3>
<p>WEB-P2 did carry env = prod, so it already belonged to <code>g-all-prod</code> ("All prod workloads"). That matters: a half-tagged VM may match broad groups but miss specific ones. Always check every group a VM should and should not be in, not just one.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing a rule per IP address and calling it "policy". (2) Treating the VM name as the identity: names are labels too, and can be reused. (3) Tagging a new VM with only some of the tags. (4) Editing a tag and forgetting to publish: Traceflow and test traffic read the published policy only.</p></div>
<div class="exam"><p><b>Exam trap.</b> A tag is a name plus a value. "The VM has the tag web" is incomplete; say "the tag app has the value web".</p></div>

<div class="scn"><h4>The rule list that doubled every quarter</h4><p>Narmada's first firewall policy used IP addresses. Every new VM meant two new rules, and each rebuilt VM with a new IP silently broke an old one. After a year the list had hundreds of lines and nobody dared delete any. The team switched to tags: each VM was labelled with app and env, and the rules named groups. The list shrank to a few rules, and new VMs started working the minute they were tagged.</p><p><b>Lesson:</b> describe what a VM is, not where it is.</p></div>

<div class="iv"><p class="q">"Why use tags instead of IP addresses in firewall policy?"</p><p>Strong answer: IP addresses change, VMs come and go, and one rule per machine does not scale. Tags describe the role and environment, so a group collects VMs automatically and the rules stay the same. A new VM is covered the moment it is tagged correctly. Add that tagging mistakes become the new failure mode, so inventory hygiene matters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The inventory lists the VMs; a tag is a name plus a value that describes a VM's job or environment.</li>
<li>Rules by IP or name do not scale: every new, moved or rebuilt VM needs a rule change.</li>
<li>Tag-based policy keeps rules stable; tagging the VM is what adds it to the policy.</li>
<li>A traceflow line that says source no means the VM is not in the group the rule names.</li>
<li>Tag edits do nothing until you press Publish changes.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Pichhle module mein dikha ki distributed firewall har VM par traffic check karta hai. Yeh module <b>policy model</b> sikhata hai: woh objects jo aap banate ho taaki rule machines ko ek-ek karke likhne ki jagah kahe "web servers app servers se baat kar sakte hain". Is chapter ke end tak aap yeh kar sakoge:</p>
<ul>
<li>samjha sakoge ki inventory kya hai aur tag (naam aur value) kya hota hai;</li>
<li>samjha sakoge ki IP address ya VM name se likhe rules data center badhne par kyun toot jaate hain;</li>
<li>Inventory and tags page padh kar bata sakoge ki VM par kaunse tags hain;</li>
<li>samjha sakoge ki bilkul naye VM ka kya hota hai jise abhi kisi ne tag nahi kiya.</li>
</ul>
<p><b>Prerequisites:</b> module vd-start (VM, vNIC, rule ke parts, Traceflow, Publish changes). Yeh independent training hai jo published product documentation par based hai. Yeh kisi named certification ki taiyari ka claim nahi karti.</p>

<h3>Ek analogy: airport par luggage tags</h3>
<p>Airport par baggage handler yaad nahi rakhta ki kaunsa bag kiska hai. Har bag par ek tag hota hai jisme kuch facts hote hain: flight, destination, class. Sorting machine tag padhti hai aur bag ko sahi belt par bhej deti hai. Agar naya passenger aaye aur bag par sahi tag lage, to machine mein koi badlav kiye bina bag sahi sort ho jaata hai. Agar tag nahi hai, to machine ko pata hi nahi ki bag kahan jaana chahiye.</p>
<p>Distributed firewall bhi aise hi kaam karta hai. <b>Tag</b> VM par chipka chhota label hai. Rule VM ka naam nahi leta; woh ek <b>group</b> (chapter 2) ka naam leta hai jo sahi labels wale har VM ko collect karta hai.</p>

<h3>Words jo aapko aane chahiye</h3>
<dl class="terms">
<dt>Inventory</dt><dd>Un sab VMs ki list jinhe console jaanta hai, unke IP address aur tags ke saath. Simulator mein yeh <b>Inventory and tags</b> page par dikhti hai. Jo VM inventory mein nahi hai woh policy ke liye anjaan hai.</dd>
<dt>Tag</dt><dd>VM par label jo ek <b>name</b> aur ek <b>value</b> se bana hota hai, jaise app = web. Ek VM par kai tags ho sakte hain. Tags batate hain ki VM <em>kya hai</em> (uska kaam, uska environment), woh kahan baitha hai yeh nahi.</dd>
<dt>Policy model</dt><dd>Un objects ka set jinse policy bani hai: VMs, tags, groups, rules, categories aur default rule. Yeh module sab cover karta hai.</dd>
<dt>Hard-coded rule</dt><dd>Aisa rule jo IP addresses ya VM names seedha likhta hai. Aaj chalta hai, kal toot jaata hai.</dd>
</dl>

<h3>Naam aur IP scale kyun nahi karte</h3>
<p>Narmada ki pehli policy socho: "10.10.10.10 ko 10.10.10.20 tak h&#116;tps par allow karo". Yeh sirf do machines ke liye sahi hai. Ab data center ka ek normal mahina socho:</p>
<ul>
<li>Team doosra web VM jodti hai. Naya rule chahiye, ya purana edit karna padega.</li>
<li>Ek VM rebuild hota hai aur naya IP milta hai. Purana rule ab kisi ko nahi ya kisi anjaan ko point karta hai.</li>
<li>Company dev environment jodti hai. Har rule haath se copy karke edit hota hai.</li>
</ul>
<p>Hazaaron VMs ke saath aise rules ko koi sahi nahi rakh sakta. Hal yeh hai ki <b>VM kya hai yeh describe karo</b> (production web server) aur policy ko us description ke peeche chalne do. VM jodo, sahi tags do, aur har maujooda rule use cover kar leta hai. VM hatao to rules bhi sikud jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IP se rule aur tag se rule ki tulna">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">IP list wala rule</text>
<rect x="30" y="35" width="260" height="34" rx="8" fill="#fed7aa"/><text x="160" y="57" text-anchor="middle" class="svg-ink" font-size="12">allow 10.10.10.10 to 10.10.10.20</text>
<rect x="30" y="80" width="260" height="34" rx="8" fill="#fed7aa"/><text x="160" y="102" text-anchor="middle" class="svg-ink" font-size="12">allow 10.10.10.11 to 10.10.10.20</text>
<rect x="30" y="125" width="260" height="34" rx="8" fill="#fed7aa"/><text x="160" y="147" text-anchor="middle" class="svg-ink" font-size="12">allow 10.10.20.10 to 10.10.20.20</text>
<text x="160" y="190" text-anchor="middle" class="svg-muted" font-size="12">Har naye VM ke liye ek nayi line</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Tag-based group wala rule</text>
<rect x="350" y="35" width="260" height="34" rx="8" fill="#bbf7d0"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="12">allow Web servers (prod) to App servers (prod)</text>
<rect x="350" y="85" width="120" height="30" rx="8" fill="#bae6fd"/><text x="410" y="105" text-anchor="middle" class="svg-ink" font-size="12">WEB-P  app=web</text>
<rect x="490" y="85" width="120" height="30" rx="8" fill="#bae6fd"/><text x="550" y="105" text-anchor="middle" class="svg-ink" font-size="12">WEB-P2 app=web</text>
<text x="480" y="190" text-anchor="middle" class="svg-muted" font-size="12">Rule nahi badalta; tags decide karte hain kaun covered hai</text>
</svg><p class="cap">Left: machines ke saath rule list badhti hai. Right: ek rule aur tags jo har machine ko describe karte hain.</p></div>

<h3>Narmada inventory aur uske tags</h3>
<p>Chhahon Narmada VMs par teen-teen tags hain: <code>app</code> (web, app ya db), <code>env</code> (prod ya dev) aur <code>tier</code> (1, 2 ya 3).</p>
<table class="cmp">
<tr><th>VM</th><th>IP</th><th>app</th><th>env</th><th>tier</th></tr>
<tr><td>WEB-P</td><td>10.10.10.10</td><td>web</td><td>prod</td><td>1</td></tr>
<tr><td>APP-P</td><td>10.10.10.20</td><td>app</td><td>prod</td><td>2</td></tr>
<tr><td>DB-P</td><td>10.10.10.30</td><td>db</td><td>prod</td><td>3</td></tr>
<tr><td>WEB-D</td><td>10.10.20.10</td><td>web</td><td>dev</td><td>1</td></tr>
<tr><td>APP-D</td><td>10.10.20.20</td><td>app</td><td>dev</td><td>2</td></tr>
<tr><td>DB-D</td><td>10.10.20.30</td><td>db</td><td>dev</td><td>3</td></tr>
</table>
<p>Dhyan do ki IP address sirf ek column hai. Policy baaki teen ki parvah karti hai.</p>

<div class="eg"><p><b>Worked example (Lab 1).</b> Team ek doosra production web VM, WEB-P2 (10.10.10.11), jodti hai. Kisi ne use env = prod aur tier = 1 tags diye par app = web bhool gaya. Default rule pehle se deny kar diya gaya hai. WEB-P2 se APP-P tak h&#116;tps ka Traceflow yeh real output deta hai:</p>
<pre class="out">Flow: WEB-P2 -&gt; APP-P (h&#116;tps)
Category infrastructure (1 rule)
  Allow DNS: no match (source yes, destination yes, service no, applied to yes)
Category environment (1 rule)
  Deny dev to prod: no match (source no, destination yes, service yes, applied to yes)
Category application (4 rules)
  <span class="hl">Web to app (prod): no match (source no, destination yes, service yes, applied to yes)</span>
  App to DB (prod): no match (source no, destination no, service no, applied to yes)
  Web to app (dev): no match (source no, destination no, service yes, applied to yes)
  App to DB (dev): no match (source no, destination no, service no, applied to yes)
No rule matched: default rule -&gt; DENY
Result: DENY by the default rule</pre>
<p>Highlighted line padho: <b>source no</b>. Rule theek hai, service theek hai, lekin WEB-P2 us group ka member nahi hai jiska naam rule leta hai, kyunki uske paas app = web nahi hai. Fix naya rule nahi hai. Inventory and tags page par tag app = web jodo aur <b>Publish changes</b> dabao. Phir group VM ko khud utha leta hai.</p></div>

<h3>Untagged VM invisible nahi hota</h3>
<p>WEB-P2 par env = prod tha, isliye woh pehle se <code>g-all-prod</code> ("All prod workloads") mein tha. Yeh matter karta hai: aadha-tag wala VM broad groups match kar sakta hai lekin specific groups miss kar sakta hai. Hamesha har us group ko check karo jisme VM hona chahiye aur jisme nahi hona chahiye, sirf ek ko nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Har IP address ke liye rule likhna aur use "policy" kehna. (2) VM name ko identity maanna: names bhi labels hain aur reuse ho sakte hain. (3) Naye VM par sirf kuch tags lagana. (4) Tag edit karke publish bhool jaana: Traceflow aur test traffic sirf published policy padhte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tag name plus value hota hai. "VM par tag web hai" adhoora hai; kaho "tag app ki value web hai".</p></div>

<div class="scn"><h4>Rule list jo har quarter double hoti rahi</h4><p>Narmada ki pehli firewall policy IP addresses par thi. Har naye VM par do naye rules, aur har rebuilt VM ka naya IP ek purana rule chupchaap tod deta tha. Ek saal baad list mein sau-sau lines thi aur koi kuch delete karne ki himmat nahi karta tha. Team ne tags par switch kiya: har VM par app aur env label lage, aur rules groups ke naam par aaye. List kuch rules tak sikud gayi, aur naye VMs sahi tag hote hi kaam karne lage.</p><p><b>Seekh:</b> VM kya hai yeh describe karo, woh kahan hai yeh nahi.</p></div>

<div class="iv"><p class="q">"Firewall policy mein IP addresses ki jagah tags kyun use karte hain?"</p><p>Strong answer: IP addresses badalte hain, VMs aate-jaate hain, aur ek machine ke liye ek rule scale nahi karta. Tags role aur environment describe karte hain, to group VMs ko khud collect karta hai aur rules wahi rehte hain. Naya VM sahi tag hote hi covered ho jaata hai. Yeh bhi jodo ki tagging galtiyan naya failure mode ban jaati hain, isliye inventory hygiene zaroori hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory VMs ki list hai; tag name plus value hai jo VM ka kaam ya environment describe karta hai.</li>
<li>IP ya name wale rules scale nahi karte: har naye, moved ya rebuilt VM par rule change chahiye.</li>
<li>Tag-based policy rules ko stable rakhti hai; VM ko tag karna hi use policy mein jodta hai.</li>
<li>Traceflow line jo source no kahe, matlab VM us group mein nahi hai jiska naam rule leta hai.</li>
<li>Tag edits Publish changes dabaye bina kuch nahi karte.</li>
</ul></div>
`}};export{e as default};