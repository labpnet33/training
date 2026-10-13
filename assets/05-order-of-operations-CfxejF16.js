var e={id:`order-of-operations`,h:{en:`Order of operations: template before policy`,hi:`Operations ka order: policy se pehle template`},body:{en:`
<p>Some pushes fail not because the policy is wrong but because the firewall is not ready for it. The most important readiness rule on Panorama is: <b>the template goes first, the policy goes second</b>.</p>

<h3>Analogy: furniture before walls</h3>
<p>Imagine ordering cupboards for a new office before the walls are built. The cupboard plan says "fit on the north wall", but there is no north wall yet, so the carpenter refuses. A security rule says "from zone trust to zone untrust". If the firewall has no zones called trust and untrust yet, the firewall refuses the rule.</p>

<h3>Why the order matters</h3>
<p>Security and NAT rules refer to <b>zones</b>. Zones are configuration that comes from the <b>template</b>. A new firewall that never received its template has no such zones. When a device-group push arrives, per-firewall validation looks for the referenced zones and fails:</p>
<pre class="out">0079151765883     NK-CHENNAI-PA     <span class="hl">commit failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out from 'trust' is not a valid reference
                                    rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out to 'untrust' is not a valid reference
                                    rulebase -&gt; nat -&gt; rules -&gt; SNAT-Out from 'trust' is not a valid reference</pre>
<p>Read the words "is not a valid reference": a rule points at something the firewall does not have yet. The fix is not to edit the rule; it is to deliver what the rule points at.</p>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Order">
<rect x="20" y="30" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">1. Template stack</text><text x="105" y="74" text-anchor="middle" class="svg-muted" font-size="11">zones, interfaces</text>
<rect x="240" y="30" width="170" height="60" rx="8" fill="#fed7aa"/><text x="325" y="56" text-anchor="middle" class="svg-ink" font-size="13">2. Device group</text><text x="325" y="74" text-anchor="middle" class="svg-muted" font-size="11">rules using the zones</text>
<rect x="460" y="30" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="540" y="56" text-anchor="middle" class="svg-ink" font-size="13">3. Verify</text><text x="540" y="74" text-anchor="middle" class="svg-muted" font-size="11">show commands</text>
<line x1="190" y1="60" x2="240" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Dependencies flow left to right: rules depend on zones, zones come from the template.</p></div>

<h3>Two ways to respect the order</h3>
<ol>
<li><b>Two pushes.</b> Push the template stack, then the device group. Easy to pause and verify between them.</li>
<li><b>One push.</b> Push the device group with <code>include-template yes</code>. Fewer steps, but you cannot check the template result separately.</li>
</ol>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no validate-only yes
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no</pre>
<p>Notice the validate-only run between the two real pushes. It proves the policy will now pass before you change anything.</p>

<h3>Other dependency pairs</h3>
<ul>
<li>A template that uses a variable needs a value for each firewall; an unresolved variable fails that firewall (templates module).</li>
<li>A rule can only use objects visible to its device group; Panorama refuses that at commit to Panorama, before any push.</li>
<li>A log forwarding profile used by a rule must exist in the pushed policy.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Onboarding a firewall and pushing policy on day one; fixing "not a valid reference" by renaming zones in the rule; assuming Panorama will push the template by itself.</p></div>
<div class="exam"><p><b>Exam trap.</b> The error appears on the firewall's result line, not at commit to Panorama. A successful Panorama commit does not prove a firewall can accept the push.</p></div>

<div class="scn"><h4>New branch, red result</h4><p>Chennai was added to the device group and the policy push showed a failure listing trust and untrust. The engineer began editing rules. A colleague noticed that the template stack had never been pushed to that firewall. After the template push the same device-group push succeeded without any rule change.</p><p><b>Lesson:</b> read "not a valid reference" as "missing dependency".</p></div>

<div class="iv"><p class="q">"A device-group push fails with an invalid zone reference. What do you check?"</p><p>Whether the firewall received its template. Zones come from the template; I push the template stack first, validate the policy, then push the device group.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rules depend on zones; zones come from the template.</li>
<li>Template first, device group second, or use include-template yes.</li>
<li>"Not a valid reference" means a missing dependency, not a bad rule.</li>
<li>Validate-only between the pushes proves readiness.</li>
</ul></div>
`,hi:`
<p>Kuch pushes policy galat hone ki wajah se fail nahi hote balki isliye ki firewall uske liye ready nahi hota. Panorama ka sabse zaroori readiness rule hai: <b>pehle template, phir policy</b>.</p>

<h3>Analogy: deewar se pehle furniture</h3>
<p>Soch lo nayi office mein deewarein bani nahi aur aap cupboards order kar dete ho. Cupboard plan kehta hai "north wall par lagao", par north wall hai hi nahi, to carpenter mana kar deta hai. Security rule kehti hai "zone trust se zone untrust". Agar firewall mein trust aur untrust naam ke zones abhi hain hi nahi, to firewall rule reject kar deta hai.</p>

<h3>Order kyun matter karta hai</h3>
<p>Security aur NAT rules <b>zones</b> ko refer karte hain. Zones wo configuration hai jo <b>template</b> se aati hai. Jis naye firewall ko template mila hi nahi, uske paas aise zones nahi hote. Device-group push aane par per-firewall validation referenced zones dhundta hai aur fail hota hai:</p>
<pre class="out">0079151765883     NK-CHENNAI-PA     <span class="hl">commit failed</span>: rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out from 'trust' is not a valid reference
                                    rulebase -&gt; security -&gt; rules -&gt; Allow-Web-Out to 'untrust' is not a valid reference
                                    rulebase -&gt; nat -&gt; rules -&gt; SNAT-Out from 'trust' is not a valid reference</pre>
<p>"is not a valid reference" shabd padho: rule aisi cheez ko point kar rahi hai jo firewall ke paas abhi hai nahi. Fix rule edit karna nahi hai; fix hai wo cheez deliver karna jisko rule point karti hai.</p>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Order">
<rect x="20" y="30" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">1. Template stack</text><text x="105" y="74" text-anchor="middle" class="svg-muted" font-size="11">zones, interfaces</text>
<rect x="240" y="30" width="170" height="60" rx="8" fill="#fed7aa"/><text x="325" y="56" text-anchor="middle" class="svg-ink" font-size="13">2. Device group</text><text x="325" y="74" text-anchor="middle" class="svg-muted" font-size="11">zones use karne wali rules</text>
<rect x="460" y="30" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="540" y="56" text-anchor="middle" class="svg-ink" font-size="13">3. Verify</text><text x="540" y="74" text-anchor="middle" class="svg-muted" font-size="11">show commands</text>
<line x1="190" y1="60" x2="240" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Dependencies left se right: rules zones par depend karti hain, zones template se aate hain.</p></div>

<h3>Order maanne ke do tareeke</h3>
<ol>
<li><b>Do pushes.</b> Pehle template stack push, phir device group. Beech mein ruk kar verify karna easy hai.</li>
<li><b>Ek push.</b> Device group ko <code>include-template yes</code> ke saath push karo. Kam steps, par template result alag se check nahi kar sakte.</li>
</ol>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no validate-only yes
PANO&gt; commit-all shared-policy device-group NK-BRANCHES include-template no</pre>
<p>Dono real pushes ke beech validate-only run dekho. Ye kuch badalne se pehle prove karta hai ki policy ab pass hogi.</p>

<h3>Doosre dependency pairs</h3>
<ul>
<li>Variable use karne wale template ko har firewall ke liye value chahiye; unresolved variable us firewall ko fail karta hai (templates module).</li>
<li>Rule sirf apne device group ko visible objects use kar sakti hai; Panorama ye commit to Panorama par hi refuse karta hai, kisi push se pehle.</li>
<li>Rule jo log forwarding profile use karti hai wo pushed policy mein exist karni chahiye.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Firewall onboard karke pehle din policy push karna; "not a valid reference" ko rule mein zones rename karke fix karna; maan lena ki Panorama template khud push kar dega.</p></div>
<div class="exam"><p><b>Exam trap.</b> Error firewall ki result line par aata hai, commit to Panorama par nahi. Successful Panorama commit prove nahi karta ki firewall push accept kar lega.</p></div>

<div class="scn"><h4>Naya branch, red result</h4><p>Chennai device group mein add hua aur policy push ne trust aur untrust list karti failure dikhayi. Engineer rules edit karne lagi. Ek colleague ne dekha ki us firewall ko template stack kabhi push hua hi nahi tha. Template push ke baad wahi device-group push bina kisi rule change ke succeed hua.</p><p><b>Lesson:</b> "not a valid reference" ko "missing dependency" padho.</p></div>

<div class="iv"><p class="q">"Device-group push invalid zone reference ke saath fail hota hai. Kya check karte ho?"</p><p>Firewall ko template mila ya nahi. Zones template se aate hain; pehle template stack push karta hoon, policy validate karta hoon, phir device group push karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rules zones par depend karti hain; zones template se aate hain.</li>
<li>Pehle template, phir device group, ya include-template yes use karo.</li>
<li>"Not a valid reference" matlab missing dependency, buri rule nahi.</li>
<li>Pushes ke beech validate-only readiness prove karta hai.</li>
</ul></div>
`}};export{e as default};