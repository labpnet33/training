var e={id:`link-headend`,h:{en:`Linking Director, Controller and Analytics (labs 1 and 2)`,hi:`Director, Controller aur Analytics ko link karna (labs 1 aur 2)`},body:{en:`
<p>Three offices in the same building still need each other's phone numbers. The headend nodes are installed, but until each is told <b>who the others are</b>, they behave like strangers. Two small registrations make the whole headend work: Controller to Director, and Analytics to Director, plus the branch exporting to Analytics.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Headend registrations">
<rect x="240" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Director-1  .10</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">knows both nodes</text>
<rect x="30" y="150" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="115" y="172" text-anchor="middle" class="svg-ink" font-size="13">Controller-1  .20</text><text x="115" y="190" text-anchor="middle" class="svg-muted" font-size="12">knows its Director</text>
<rect x="440" y="150" width="170" height="50" rx="10" fill="#fde68a"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="13">Analytics-1  .30</text><text x="525" y="190" text-anchor="middle" class="svg-muted" font-size="12">collector enabled</text>
<line x1="270" y1="70" x2="130" y2="150" stroke="#64748b" stroke-width="2.5"/><line x1="370" y1="70" x2="510" y2="150" stroke="#64748b" stroke-width="2.5"/>
<text x="150" y="105" class="svg-accent" font-size="12">1 set system director</text><text x="40" y="123" class="svg-accent" font-size="12">2 set director controllers</text>
<text x="400" y="105" class="svg-accent" font-size="12">3 set director analytics</text>
<rect x="260" y="180" width="120" height="36" rx="8" fill="#bae6fd"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="12">Branch1 log export</text>
<line x1="380" y1="198" x2="440" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Registrations needed. Both directions of Controller and Director are configured, because each side must know the other.</p></div>

<h3>Lab 1: vs-headend-link</h3>
<p><b>Goal:</b> the Controller at <code>198.51.100.20</code> must know its Director <code>198.51.100.10</code>, and the Director must have the Controller registered.</p>
<p><b>Step 1.</b> On the Controller (<code>Controller-1</code>):</p>
<pre class="code">admin@Controller-1-cli&gt; configure
admin@Controller-1-cli% set system director 198.51.100.10
admin@Controller-1-cli% commit
admin@Controller-1-cli% exit
admin@Controller-1-cli&gt; show system director status</pre>
<pre class="out">Director: 198.51.100.10
Link: <span class="hl">up</span></pre>
<p><b>Step 2.</b> On the Director (<code>Director-1</code>):</p>
<pre class="code">admin@Director-1-cli&gt; configure
admin@Director-1-cli% set director controllers Controller-1 address 198.51.100.20
admin@Director-1-cli% commit
admin@Director-1-cli% exit
admin@Director-1-cli&gt; show controllers</pre>
<pre class="out">Controller      Address         Reachable
Controller-1    198.51.100.20   <span class="hl">yes</span></pre>
<p>If <code>Link: down</code> or <code>Reachable: no</code>, the registration exists but the network path does not. Test with <code>ping 198.51.100.10</code> from the Controller and <code>ping 198.51.100.20</code> from the Director, and check default routes in the management VR (<code>show route</code>).</p>

<h3>Lab 2: vs-analytics-logs</h3>
<p><b>Goal:</b> operations can see Delhi logs. Three configurations fix three different owners.</p>
<pre class="code"><span class="c">! 1. Analytics: enable the collector</span>
admin@Analytics-1-cli% set analytics log-collector enable true
admin@Analytics-1-cli% commit
<span class="c">! 2. Director: register Analytics</span>
admin@Director-1-cli% set director analytics address 198.51.100.30
admin@Director-1-cli% commit
<span class="c">! 3. Branch1: set the exporter destination</span>
admin@Branch1-cli% set orgs org-services Acme log-exporter destination 198.51.100.30
admin@Branch1-cli% commit</pre>
<p>Prove it from the collector, not only from the branch:</p>
<pre class="out">admin@Analytics-1-cli&gt; show analytics sources
Branch         Status
Branch1        <span class="hl">Exporting to Analytics-1</span></pre>
<p>Typical status lines when something is wrong:</p>
<table class="cmp"><tr><th>Branch log-exporter status</th><th>Meaning and owner</th></tr>
<tr><td>No log-exporter destination configured</td><td>Branch config (or Director template log-exporter)</td></tr>
<tr><td>Destination 198.51.100.31 is not an Analytics node</td><td>Typo in the destination address; fix on the branch</td></tr>
<tr><td>Log collector is disabled on Analytics-1</td><td>Analytics node: enable the collector</td></tr>
<tr><td>Analytics 198.51.100.30 is unreachable from this branch</td><td>Network path: underlay, routing, firewall</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Delhi shows <code>No log-exporter destination configured</code>, and <code>show analytics</code> on the Director prints <code>Analytics: not configured</code>. Two links are missing. Fix the Director registration first (the dashboards need it), then the branch destination, then check <code>Log collector: enabled</code>. After the three fixes Analytics shows <code>Sources: 1</code>.</p></div>

<div class="note"><p><b>Course model.</b> Real Versa also needs certificates or credentials between the Director and its nodes, and templates carry the log settings so every branch exports automatically. The lab sets one branch by hand to keep the chain visible. Both are the same chain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Registering only one direction. The Controller pointing to the Director does nothing until the Director also lists the Controller (and vice versa); the link is verified on both sides.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>commit</code> applies a configuration, and <code>rollback</code> discards uncommitted changes. If you forget commit, nothing changes and the show command still prints the old value.</p></div>

<div class="scn"><h4>Controller says link down, Director says reachable</h4><p>After a firewall change, <code>show system director status</code> on the Controller showed <code>Link: down</code> while the Director could still ping the Controller. A return route was missing on the Controller: its management default route pointed to a retired gateway. Correcting the static route in the management VR restored the link, and branches could be onboarded.</p><p><b>Lesson:</b> a link needs two-way reachability; check routes on both ends.</p></div>

<div class="iv"><p class="q">"How do you integrate a new Controller into an existing Versa headend?"</p><p>Give the Controller its management and WAN interfaces and routes, point it at the Director, register it in the Director, verify reachability both ways, then add organizations, WAN interfaces and transport domains, and finally add it to branch templates as another Controller.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller: <code>set system director</code>; Director: <code>set director controllers</code>; check <code>Link: up</code> and <code>Reachable: yes</code>.</li>
<li>Analytics needs collector enabled, Director registration and a branch exporter.</li>
<li>Verify on the receiving side (<code>show analytics sources</code>).</li>
<li>Status text names the owner of the fault.</li>
</ul></div>
`,hi:`
<p>Ek hi building ke teen offices ko bhi ek doosre ke phone numbers chahiye. Headend nodes install hain, lekin jab tak har ek ko nahi bataya jaata ki <b>baaki kaun hain</b>, woh ajnabi ki tarah behave karte hain. Do chhoti registrations poora headend chalu karti hain: Controller se Director, Analytics se Director, aur branch ka Analytics ko export karna.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Headend registrations">
<rect x="240" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Director-1  .10</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">dono nodes ko jaanta hai</text>
<rect x="30" y="150" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="115" y="172" text-anchor="middle" class="svg-ink" font-size="13">Controller-1  .20</text><text x="115" y="190" text-anchor="middle" class="svg-muted" font-size="12">apne Director ko jaanta hai</text>
<rect x="440" y="150" width="170" height="50" rx="10" fill="#fde68a"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="13">Analytics-1  .30</text><text x="525" y="190" text-anchor="middle" class="svg-muted" font-size="12">collector enabled</text>
<line x1="270" y1="70" x2="130" y2="150" stroke="#64748b" stroke-width="2.5"/><line x1="370" y1="70" x2="510" y2="150" stroke="#64748b" stroke-width="2.5"/>
<text x="150" y="105" class="svg-accent" font-size="12">1 set system director</text><text x="40" y="123" class="svg-accent" font-size="12">2 set director controllers</text>
<text x="400" y="105" class="svg-accent" font-size="12">3 set director analytics</text>
<rect x="260" y="180" width="120" height="36" rx="8" fill="#bae6fd"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="12">Branch1 log export</text>
<line x1="380" y1="198" x2="440" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Zaroori registrations. Controller aur Director dono taraf configure hote hain, kyunki har side ko doosri side pata honi chahiye.</p></div>

<h3>Lab 1: vs-headend-link</h3>
<p><b>Goal:</b> Controller <code>198.51.100.20</code> ko apna Director <code>198.51.100.10</code> pata hona chahiye, aur Director mein Controller registered hona chahiye.</p>
<p><b>Step 1.</b> Controller (<code>Controller-1</code>) par:</p>
<pre class="code">admin@Controller-1-cli&gt; configure
admin@Controller-1-cli% set system director 198.51.100.10
admin@Controller-1-cli% commit
admin@Controller-1-cli% exit
admin@Controller-1-cli&gt; show system director status</pre>
<pre class="out">Director: 198.51.100.10
Link: <span class="hl">up</span></pre>
<p><b>Step 2.</b> Director (<code>Director-1</code>) par:</p>
<pre class="code">admin@Director-1-cli&gt; configure
admin@Director-1-cli% set director controllers Controller-1 address 198.51.100.20
admin@Director-1-cli% commit
admin@Director-1-cli% exit
admin@Director-1-cli&gt; show controllers</pre>
<pre class="out">Controller      Address         Reachable
Controller-1    198.51.100.20   <span class="hl">yes</span></pre>
<p>Agar <code>Link: down</code> ya <code>Reachable: no</code> hai, to registration maujood hai lekin network path nahi. Controller se <code>ping 198.51.100.10</code> aur Director se <code>ping 198.51.100.20</code> test karo, aur management VR mein default routes check karo (<code>show route</code>).</p>

<h3>Lab 2: vs-analytics-logs</h3>
<p><b>Goal:</b> operations Delhi logs dekh sake. Teen configurations teen alag owners ko fix karti hain.</p>
<pre class="code"><span class="c">! 1. Analytics: collector enable karo</span>
admin@Analytics-1-cli% set analytics log-collector enable true
admin@Analytics-1-cli% commit
<span class="c">! 2. Director: Analytics register karo</span>
admin@Director-1-cli% set director analytics address 198.51.100.30
admin@Director-1-cli% commit
<span class="c">! 3. Branch1: exporter destination set karo</span>
admin@Branch1-cli% set orgs org-services Acme log-exporter destination 198.51.100.30
admin@Branch1-cli% commit</pre>
<p>Collector side se prove karo, sirf branch se nahi:</p>
<pre class="out">admin@Analytics-1-cli&gt; show analytics sources
Branch         Status
Branch1        <span class="hl">Exporting to Analytics-1</span></pre>
<p>Kuch galat ho to typical status lines:</p>
<table class="cmp"><tr><th>Branch log-exporter status</th><th>Matlab aur owner</th></tr>
<tr><td>No log-exporter destination configured</td><td>Branch config (ya Director template ka log-exporter)</td></tr>
<tr><td>Destination 198.51.100.31 is not an Analytics node</td><td>Destination address mein typo; branch par fix karo</td></tr>
<tr><td>Log collector is disabled on Analytics-1</td><td>Analytics node: collector enable karo</td></tr>
<tr><td>Analytics 198.51.100.30 is unreachable from this branch</td><td>Network path: underlay, routing, firewall</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Delhi <code>No log-exporter destination configured</code> dikhata hai, aur Director par <code>show analytics</code> <code>Analytics: not configured</code> print karta hai. Do links missing hain. Pehle Director registration fix karo (dashboards ko chahiye), phir branch destination, phir <code>Log collector: enabled</code> check karo. Teen fixes ke baad Analytics <code>Sources: 1</code> dikhata hai.</p></div>

<div class="note"><p><b>Course model.</b> Real Versa ko Director aur uske nodes ke beech certificates ya credentials bhi chahiye, aur templates log settings carry karte hain taaki har branch automatically export kare. Lab chain ko dikhane ke liye ek branch haath se set karta hai. Dono wahi chain hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf ek direction register karna. Controller ka Director ko point karna tab tak kuch nahi karta jab tak Director bhi Controller ko list na kare (aur ulta); link dono taraf se verify hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>commit</code> configuration apply karta hai, aur <code>rollback</code> uncommitted changes discard karta hai. Commit bhool gaye to kuch nahi badlega aur show command purani value print karega.</p></div>

<div class="scn"><h4>Controller kehta hai link down, Director kehta hai reachable</h4><p>Firewall change ke baad Controller par <code>show system director status</code> ne <code>Link: down</code> dikhaya jabki Director abhi bhi Controller ko ping kar sakta tha. Controller par return route missing tha: uska management default route retired gateway ki taraf tha. Management VR mein static route theek karne se link wapas aaya, aur branches onboard ho sakin.</p><p><b>Lesson:</b> link ko two-way reachability chahiye; dono ends par routes check karo.</p></div>

<div class="iv"><p class="q">"Existing Versa headend mein naya Controller kaise integrate karoge?"</p><p>Controller ko management aur WAN interfaces aur routes do, use Director ki taraf point karo, Director mein register karo, dono taraf reachability verify karo, phir organizations, WAN interfaces aur transport domains add karo, aur aakhir mein branch templates mein use another Controller ke roop mein jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller: <code>set system director</code>; Director: <code>set director controllers</code>; <code>Link: up</code> aur <code>Reachable: yes</code> check karo.</li>
<li>Analytics ko collector enabled, Director registration aur branch exporter chahiye.</li>
<li>Receiving side par verify karo (<code>show analytics sources</code>).</li>
<li>Status text fault ka owner batata hai.</li>
</ul></div>
`}};export{e as default};