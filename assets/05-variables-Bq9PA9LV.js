var e={id:`variables`,h:{en:`Variables: types, values and precedence`,hi:`Variables: types, values aur precedence`},body:{en:`
<p>A wedding card printing shop uses one design for every customer and leaves blank spaces: "Name of the groom", "Date", "Venue". The design is shared; the blanks are filled for each order. A <b>template variable</b> is such a blank. It is written with a dollar sign, like <code>$wan-ip</code>, and it is filled with a real value for each firewall.</p>

<h3>Definition and value are two different things</h3>
<p>This is the point learners confuse most. A variable has a <b>definition</b>: its name and its <b>type</b>, created inside a template. And it has <b>values</b>: the actual data for a stack or for one firewall. The template says "I need an ip-netmask called $wan-ip". The stack, or a firewall inside the stack, says "for this firewall it is 203.0.113.2/30".</p>
<pre class="code"><span class="c">Definition, on the template (default value None means "no default")</span>
PANO# set template NK-BRANCH-NET variable $wan-ip type ip-netmask None
<span class="c">Value, on a firewall entry inside the stack</span>
PANO# set template-stack NK-STACK devices &lt;serial&gt; variable $wan-ip type ip-netmask 203.0.113.2/30</pre>
<p>In the lab, a template that uses <code>$x</code> must also define <code>$x</code>, otherwise Panorama will not accept the commit. A definition with <code>None</code> says that the template has no default; every user of the template must supply a value.</p>

<h3>Types protect you</h3>
<p>A variable has a type, and values are checked against it when you commit to Panorama. The lab accepts these types: <code>ip-netmask</code>, <code>ip-range</code>, <code>fqdn</code>, <code>interface</code>, <code>as-number</code>, <code>group-id</code>, <code>device-priority</code>, <code>device-id</code>, <code>link-tag</code>, <code>qos-profile</code> and <code>egress-max</code>.</p>
<table class="tbl"><thead><tr><th>Type</th><th>Good value</th><th>Bad value</th></tr></thead><tbody>
<tr><td>ip-netmask</td><td>10.2.1.1/24</td><td>10.2.1.1 (no mask), or the word delhi</td></tr>
<tr><td>fqdn</td><td>syslog.example.com</td><td>192.0.2.99 (that is an IP)</td></tr>
<tr><td>interface</td><td>ethernet1/2</td><td>lan</td></tr>
<tr><td>as-number</td><td>65001</td><td>AS-65001</td></tr>
</tbody></table>
<p>A wrong type is caught early, at commit, instead of surfacing as a mystery on one firewall. Which types and which fields can use variables is version dependent, so check the documentation for your PAN-OS version.</p>

<h3>Precedence: who supplies the value?</h3>
<p>A variable can have values in three places, and the most specific one wins:</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Variable precedence">
<rect x="20" y="20" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">1 Firewall entry</text><text x="110" y="65" text-anchor="middle" class="svg-ink" font-size="12">in the stack (wins)</text>
<rect x="230" y="20" width="180" height="60" rx="10" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">2 Stack-level value</text><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="12">shared by all in stack</text>
<rect x="440" y="20" width="180" height="60" rx="10" fill="#e2e8f0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">3 Template default</text><text x="530" y="65" text-anchor="middle" class="svg-ink" font-size="12">or None</text>
<path d="M200 50 L230 50 M410 50 L440 50" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="13">Panorama looks left to right and uses the first value it finds. None at the end = unresolved = failed push.</text>
</svg><p class="cap">device entry beats stack value, and stack value beats template default.</p></div>
<p>A stack-level value is good for something shared, such as a regional DNS or syslog target. A per-firewall value is good for something unique, such as the WAN address.</p>

<h3>When a value is missing</h3>
<p>If no level has a value, the variable is unresolved for that firewall. Panorama will commit, but the push to that firewall fails and the others still succeed. The message in the lab names the variable and tells you where to fix it. You will see it in the third lab.</p>
<pre class="code">0079151765883     NK-CHENNAI-PA     commit failed: template NK-STACK: variable $lan-ip has no value for this firewall (set it on the template stack or on the stack device entry)</pre>

<div class="scn"><h4>The copy-paste value</h4><p>An engineer copied Delhi's variable lines to create Chennai and changed the WAN address, but forgot the LAN address and gateway. The push went through and Chennai came up with Delhi's gateway, which was unreachable. The team later made every shared template define its variables with None and no default, so a forgotten value fails loudly instead of silently inheriting someone else's.</p></div>

<div class="iv"><p class="q">"Explain variable precedence in a template stack."</p><p>A value set on the firewall's own entry in the stack wins, then a stack-level value, then the template's default. If none exist the variable is unresolved and the push to that firewall fails. The template defines the name and type; the stack provides the values.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A variable has a definition (name, type) and values (per stack or firewall).</li>
<li>Precedence: firewall entry in stack, then stack value, then template default.</li>
<li>None means no default; a missing value fails the push for that firewall only.</li>
<li>Type checks run at commit to Panorama, so a wrong type fails early.</li>
</ul></div>
`,hi:`
<p>Shaadi ke card ki printing shop har customer ke liye ek design use karti hai aur khaali jagah chhod deti hai: "Dulhe ka naam", "Date", "Venue". Design shared hai; khaali jagah har order ke liye bhari jaati hai. <b>Template variable</b> aisi hi ek khaali jagah hai. Wo dollar sign se likhi jaati hai, jaise <code>$wan-ip</code>, aur har firewall ke liye real value se bhari jaati hai.</p>

<h3>Definition aur value do alag cheezein hain</h3>
<p>Learners sabse zyada yahi confuse karte hain. Variable ki ek <b>definition</b> hoti hai: uska naam aur <b>type</b>, jo template ke andar banti hai. Aur <b>values</b> hoti hain: stack ya ek firewall ka actual data. Template kehta hai "mujhe $wan-ip naam ka ip-netmask chahiye". Stack, ya stack ke andar ka firewall, kehta hai "is firewall ke liye wo 203.0.113.2/30 hai".</p>
<pre class="code"><span class="c">Definition, template par (default value None matlab "default nahi")</span>
PANO# set template NK-BRANCH-NET variable $wan-ip type ip-netmask None
<span class="c">Value, stack ke andar firewall entry par</span>
PANO# set template-stack NK-STACK devices &lt;serial&gt; variable $wan-ip type ip-netmask 203.0.113.2/30</pre>
<p>Lab mein jo template <code>$x</code> use karta hai use <code>$x</code> define bhi karna padta hai, warna Panorama commit accept nahi karta. <code>None</code> wali definition kehti hai ki template ka koi default nahi; template ke har user ko value deni hogi.</p>

<h3>Types tumhe bachate hain</h3>
<p>Variable ka type hota hai, aur Panorama par commit ke waqt values type ke against check hoti hain. Lab ye types accept karta hai: <code>ip-netmask</code>, <code>ip-range</code>, <code>fqdn</code>, <code>interface</code>, <code>as-number</code>, <code>group-id</code>, <code>device-priority</code>, <code>device-id</code>, <code>link-tag</code>, <code>qos-profile</code> aur <code>egress-max</code>.</p>
<table class="tbl"><thead><tr><th>Type</th><th>Sahi value</th><th>Galat value</th></tr></thead><tbody>
<tr><td>ip-netmask</td><td>10.2.1.1/24</td><td>10.2.1.1 (mask nahi), ya shabd delhi</td></tr>
<tr><td>fqdn</td><td>syslog.example.com</td><td>192.0.2.99 (ye IP hai)</td></tr>
<tr><td>interface</td><td>ethernet1/2</td><td>lan</td></tr>
<tr><td>as-number</td><td>65001</td><td>AS-65001</td></tr>
</tbody></table>
<p>Galat type commit par hi pakda jaata hai, ek firewall par mystery bankar nahi nikalta. Kaunse types aur kaunse fields variables use kar sakte hain ye version par depend karta hai, isliye apne PAN-OS version ki documentation check karo.</p>

<h3>Precedence: value kaun deta hai?</h3>
<p>Variable ki values teen jagah ho sakti hain, aur sabse specific jeetti hai:</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Variable precedence">
<rect x="20" y="20" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">1 Firewall entry</text><text x="110" y="65" text-anchor="middle" class="svg-ink" font-size="12">stack mein (jeetta hai)</text>
<rect x="230" y="20" width="180" height="60" rx="10" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">2 Stack-level value</text><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="12">stack ke sabke liye shared</text>
<rect x="440" y="20" width="180" height="60" rx="10" fill="#e2e8f0"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">3 Template default</text><text x="530" y="65" text-anchor="middle" class="svg-ink" font-size="12">ya None</text>
<path d="M200 50 L230 50 M410 50 L440 50" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="13">Panorama left se right dekhta hai, pehli mili value use karta hai. Aakhir mein None = unresolved = push fail.</text>
</svg><p class="cap">device entry stack value ko haraata hai, aur stack value template default ko.</p></div>
<p>Stack-level value shared cheez ke liye achhi hai, jaise regional DNS ya syslog target. Per-firewall value unique cheez ke liye, jaise WAN address.</p>

<h3>Value missing ho to</h3>
<p>Kisi level par value na ho to variable us firewall ke liye unresolved hai. Panorama commit kar dega, lekin us firewall ka push fail hota hai aur baaki succeed karte hain. Lab ka message variable ka naam batata hai aur ye bhi ki kahan fix karna hai. Ye tum teesre lab mein dekhoge.</p>
<pre class="code">0079151765883     NK-CHENNAI-PA     commit failed: template NK-STACK: variable $lan-ip has no value for this firewall (set it on the template stack or on the stack device entry)</pre>

<div class="scn"><h4>Copy-paste wali value</h4><p>Ek engineer ne Chennai banane ke liye Delhi ki variable lines copy kin aur WAN address badla, lekin LAN address aur gateway bhool gaya. Push ho gaya aur Chennai Delhi ke gateway ke saath aaya jo unreachable tha. Baad mein team ne har shared template ke variables None aur bina default ke define kiye, taaki bhooli hui value shor machakar fail ho, chup-chaap kisi aur ki inherit na kare.</p></div>

<div class="iv"><p class="q">"Template stack mein variable precedence samjhao."</p><p>Stack mein firewall ki apni entry par set value jeetti hai, phir stack-level value, phir template ka default. Kuch na ho to variable unresolved hai aur us firewall ka push fail hota hai. Template naam aur type define karta hai; stack values deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Variable ki definition (naam, type) aur values (per stack ya firewall) alag hain.</li>
<li>Precedence: stack mein firewall entry, phir stack value, phir template default.</li>
<li>None matlab default nahi; missing value sirf us firewall ka push fail karti hai.</li>
<li>Type checks Panorama par commit mein chalte hain, isliye galat type jaldi fail hota hai.</li>
</ul></div>
`}};export{e as default};