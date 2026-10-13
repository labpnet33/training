var e={id:`what-is-sent`,h:{en:`What exactly is sent: device group, template and collector configuration`,hi:`Exactly kya bheja jaata hai: device group, template aur collector configuration`},body:{en:`
<p>When you press push, Panorama does not send "everything". It sends one of three kinds of package, and each kind has its own command. Choosing the wrong package is a classic reason a change "did not arrive".</p>

<h3>Analogy: three courier boxes</h3>
<p>The head office keeps three boxes ready. The red box holds the <b>rulebook and shared objects</b> (device group). The blue box holds the <b>building setup</b>: network ports, zones, routing, server settings (template). The green box holds <b>instructions for the log warehouse</b> (collector configuration). A branch needs the right box; sending a red box does not install the building.</p>

<h3>The three packages</h3>
<table class="tbl">
<tr><th>Package</th><th>Lab command</th><th>Contents</th></tr>
<tr><td>Device group</td><td><code>commit-all shared-policy device-group &lt;dg&gt;</code></td><td>Pre and post security and NAT rules, address and service objects (and groups), log forwarding profiles</td></tr>
<tr><td>Template or stack</td><td><code>commit-all template-stack name &lt;stack&gt;</code> or <code>commit-all template name &lt;t&gt;</code></td><td>Resolved template configuration: interfaces, zones, virtual router, server profiles, Panorama server settings</td></tr>
<tr><td>Collector config</td><td><code>commit-all log-collector-config log-collector-group &lt;g&gt;</code></td><td>Collector group membership</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Three packages">
<rect x="20" y="20" width="180" height="70" rx="8" fill="#fed7aa"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">Device group</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="11">rules and objects</text>
<rect x="230" y="20" width="180" height="70" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Template stack</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">interfaces, zones, servers</text>
<rect x="440" y="20" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">Collector config</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">collector group</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Each package has its own commit-all form</text>
</svg><p class="cap">One push command carries one kind of package (the device-group push can also carry the template, see chapter 4).</p></div>

<h3>Per firewall, not per Panorama</h3>
<p>A push is resolved <b>per firewall</b>. For a device-group push, Panorama collects Shared plus parent plus child objects and rules that apply to that firewall, honours rule targets, and sends the result. For a template push, Panorama merges the templates of the firewall's stack (top template wins) and resolves variables for that firewall. Two firewalls in the same device group can therefore receive different final configurations.</p>
<p>What each push does not do: a device-group push does not change interfaces or zones; a template push does not deliver security rules. After either push, firewall commands show you the pushed portion:</p>
<pre class="code">PA1&gt; show config pushed-shared-policy
PA1&gt; show config pushed-template</pre>

<div class="warn"><p><b>Common mistakes.</b> Pushing the device group after changing a zone name in the template (the template still has to be pushed); changing a variable value and pushing only policy; expecting a collector group change to take effect from a normal device-group push.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the change to the package: rule or object means device group; interface, zone, variable or server profile means template; collector group membership means collector config.</p></div>

<div class="scn"><h4>The zone rename</h4><p>An engineer renamed a zone in the template, committed to Panorama, and pushed the device group. Policy push failed on every firewall: rules referred to a zone that no longer existed in the firewall's pushed template, because the template was never pushed. Pushing the template stack fixed it.</p><p><b>Lesson:</b> a template change needs a template push.</p></div>

<div class="iv"><p class="q">"I changed a variable in a template stack. What do I push?"</p><p>The template stack, because a variable is template configuration, resolved per firewall. A device-group push would not carry it unless I include the template explicitly. I would validate first, then push and verify with show config pushed-template.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three packages: device group, template or stack, collector config.</li>
<li>Every package is resolved per firewall.</li>
<li>Match the kind of change to the kind of push.</li>
<li>Firewall show config pushed-* commands show what arrived.</li>
</ul></div>
`,hi:`
<p>Jab aap push dabate ho, Panorama "sab kuch" nahi bhejta. Wo teen tarah ke package mein se ek bhejta hai, aur har type ka apna command hai. Galat package chunna "change pahuncha nahi" ka classic reason hai.</p>

<h3>Analogy: teen courier boxes</h3>
<p>Head office teen boxes ready rakhta hai. Red box mein <b>rulebook aur shared objects</b> hain (device group). Blue box mein <b>building setup</b>: network ports, zones, routing, server settings (template). Green box mein <b>log warehouse ke instructions</b> hain (collector configuration). Branch ko sahi box chahiye; red box bhejne se building install nahi hoti.</p>

<h3>Teen packages</h3>
<table class="tbl">
<tr><th>Package</th><th>Lab command</th><th>Contents</th></tr>
<tr><td>Device group</td><td><code>commit-all shared-policy device-group &lt;dg&gt;</code></td><td>Pre aur post security aur NAT rules, address aur service objects (aur groups), log forwarding profiles</td></tr>
<tr><td>Template ya stack</td><td><code>commit-all template-stack name &lt;stack&gt;</code> ya <code>commit-all template name &lt;t&gt;</code></td><td>Resolved template configuration: interfaces, zones, virtual router, server profiles, Panorama server settings</td></tr>
<tr><td>Collector config</td><td><code>commit-all log-collector-config log-collector-group &lt;g&gt;</code></td><td>Collector group membership</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Three packages">
<rect x="20" y="20" width="180" height="70" rx="8" fill="#fed7aa"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">Device group</text><text x="110" y="68" text-anchor="middle" class="svg-muted" font-size="11">rules aur objects</text>
<rect x="230" y="20" width="180" height="70" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Template stack</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">interfaces, zones, servers</text>
<rect x="440" y="20" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">Collector config</text><text x="530" y="68" text-anchor="middle" class="svg-muted" font-size="11">collector group</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Har package ka apna commit-all form hai</text>
</svg><p class="cap">Ek push command ek type ka package le jaata hai (device-group push template bhi le ja sakta hai, chapter 4 dekho).</p></div>

<h3>Per firewall, per Panorama nahi</h3>
<p>Push <b>per firewall</b> resolve hota hai. Device-group push ke liye Panorama us firewall par lagne wale Shared plus parent plus child objects aur rules collect karta hai, rule targets maanta hai, aur result bhejta hai. Template push ke liye Panorama firewall ke stack ke templates merge karta hai (top template jeette) aur us firewall ke liye variables resolve karta hai. Isliye ek hi device group ke do firewalls ko alag final configuration mil sakti hai.</p>
<p>Har push kya nahi karta: device-group push interfaces ya zones nahi badalta; template push security rules deliver nahi karta. Dono ke baad firewall commands pushed hissa dikhate hain:</p>
<pre class="code">PA1&gt; show config pushed-shared-policy
PA1&gt; show config pushed-template</pre>

<div class="warn"><p><b>Common mistakes.</b> Template mein zone name badalke sirf device group push karna (template ko bhi push karna padta hai); variable value badalke sirf policy push karna; collector group change ko normal device-group push se effect ki ummeed rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Change ko package se match karo: rule ya object matlab device group; interface, zone, variable ya server profile matlab template; collector group membership matlab collector config.</p></div>

<div class="scn"><h4>Zone rename</h4><p>Ek engineer ne template mein zone rename kiya, Panorama par commit kiya, aur device group push kiya. Har firewall par policy push fail hua: rules aise zone ko refer kar rahi thi jo firewall ke pushed template mein ab tha hi nahi, kyunki template push hua hi nahi tha. Template stack push karne se fix hua.</p><p><b>Lesson:</b> template change ko template push chahiye.</p></div>

<div class="iv"><p class="q">"Maine template stack mein variable badla. Kya push karun?"</p><p>Template stack, kyunki variable template configuration hai, per firewall resolve hota hai. Device-group push use tab tak nahi le jaata jab tak template explicitly include na karun. Pehle validate, phir push, aur show config pushed-template se verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen packages: device group, template ya stack, collector config.</li>
<li>Har package per firewall resolve hota hai.</li>
<li>Change ke type ko push ke type se match karo.</li>
<li>Firewall ke show config pushed-* commands dikhate hain kya pahuncha.</li>
</ul></div>
`}};export{e as default};