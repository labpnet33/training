var e={id:`templates`,h:{en:`Configuration templates: bind, unbind and what stays local`,hi:`Configuration templates: bind, unbind aur kya local rehta hai`},body:{en:`
<h3>The problem: 200 shops, 200 slightly different configs</h3>
<p>If Bharat Retail Co grows from three sites to thirty, an engineer would have to repeat the same work thirty times: create VLAN 10 Staff, 20 Servers, 30 Guest and 99 Management; copy the guest isolation firewall rule; copy the SSIDs. Each repetition is a chance for a typo, and over time the sites drift apart. A <b>configuration template</b> solves this: you author the common settings once, and every network <b>bound</b> to the template follows it.</p>

<h3>Bind and unbind</h3>
<ul>
<li><b>Bind</b> a network to a template: the network starts taking the template's settings.</li>
<li><b>Unbind</b>: the network stops following the template. In this simulator the network <b>keeps a copy</b> of the settings as they were at that moment, so nothing breaks, and you may now edit them locally.</li>
</ul>
<p>The page is called <b>Templates</b>. It shows each template, the networks bound to it, and the bind and unbind actions.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Template drives bound networks">
<rect x="200" y="10" width="240" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Template: Branch-Standard</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">VLAN names, firewall rules, SSIDs, content</text>
<line x1="260" y1="80" x2="110" y2="130" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="530" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="130" width="200" height="110" rx="8" fill="#bae6fd"/><text x="120" y="155" text-anchor="middle" class="svg-ink" font-size="13">blr (bound)</text><text x="120" y="178" text-anchor="middle" class="svg-ink" font-size="12">from template: VLAN names, rules</text><text x="120" y="198" text-anchor="middle" class="svg-ink" font-size="12">local: 10.2.x.0/24 subnets</text><text x="120" y="218" text-anchor="middle" class="svg-ink" font-size="12">local: devices, uplink IP</text>
<rect x="420" y="130" width="200" height="110" rx="8" fill="#bae6fd"/><text x="520" y="155" text-anchor="middle" class="svg-ink" font-size="13">del (bound)</text><text x="520" y="178" text-anchor="middle" class="svg-ink" font-size="12">from template: VLAN names, rules</text><text x="520" y="198" text-anchor="middle" class="svg-ink" font-size="12">local: 10.3.x.0/24 subnets</text><text x="520" y="218" text-anchor="middle" class="svg-ink" font-size="12">local: devices, uplink IP</text>
</svg><p class="cap">The template gives the shape; each site fills in its own addresses.</p></div>

<h3>What the template controls, and what stays local</h3>
<table class="cmp"><tr><th>Controlled by the template</th><th>Stays local to each network</th></tr>
<tr><td>The VLAN list (ids and names: 10 Staff, 20 Servers, 30 Guest, 99 Management)</td><td>The subnet and MX address of each VLAN (10.2.10.0/24 and 10.2.10.1 at Bengaluru)</td></tr>
<tr><td>Firewall rules and their order</td><td>Which physical devices exist, their serials and names</td></tr>
<tr><td>SSIDs (names, security, VLAN tag)</td><td>The uplink circuits and their IP addresses</td></tr>
<tr><td>Content-filtering settings</td><td>Tags on devices, local admins</td></tr>
</table>
<p>That is why per-network subnets matter: Mumbai uses 10.1.x.0/24, Bengaluru 10.2.x.0/24, Delhi 10.3.x.0/24. The template says "VLAN 10 exists and is called Staff"; each network answers "and in my city it is 10.2.10.0/24".</p>

<h3>Read-only when bound</h3>
<p>Once a network is bound, any setting that the template controls becomes <b>read-only</b> on that network. The page still shows it, but Save is refused or the field is locked. This is deliberate: it prevents one site from drifting away from the standard. To change it you either edit the <i>template</i> (affects all bound networks) or <i>unbind</i> that network (it becomes a standalone site with a copy of the settings). Through the API a read-only item answers with a conflict error, which the mk-api module covers.</p>

<div class="eg"><p><b>Worked example.</b> Imran at Bengaluru tries to rename VLAN 30 from Guest to Visitors on <code>blr</code>. The change is refused because blr is bound to Branch-Standard. Options: ask the template owner to rename it for everyone, or unbind blr (which you rarely want).</p></div>
<pre class="out">Templates
Template          Bound networks        Controls
Branch-Standard   blr, del              VLANs, firewall, SSIDs, content
(none)            mum  (hub, standalone) -

Network blr  &gt;  Addressing and VLANs
<span class="hl">Controlled by template Branch-Standard (read-only)</span>
VLAN  Name    Subnet         MX IP        DHCP
10    Staff   10.2.10.0/24   10.2.10.1    server
30    Guest   10.2.30.0/24   10.2.30.1    server</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Binding replaces the network's VLAN list, firewall rules, SSIDs and content settings with the template's, so a bind can instantly change live behaviour at a branch, even though you never touched the branch. Unbinding keeps a copy, so behaviour does not change at that moment; it only lets you edit locally. Use a maintenance window for a bind on a live site (chapter 5).</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Binding a live branch without checking what its current rules are: the template's rules take over. (2) Unbinding to "make a quick fix" and forgetting to re-bind, so the site silently drifts. (3) Putting site-specific subnets in the template instead of in each network.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Why can I not edit VLAN names on Delhi?" Because the network is bound and the VLAN list is template-controlled. Subnets and addresses, however, are per network and remain yours.</p></div>

<div class="scn"><h4>Thirty sites, one typo fixed once</h4><p>A retail chain found that its guest firewall rule allowed guests to reach the server VLAN. With templates they corrected the rule once in the template and all bound branches updated together. Two stores that had been unbound years earlier "for a quick fix" did not change, and later appeared in the security review as the only non-compliant sites.</p><p><b>Lesson:</b> templates give consistency; unbinding quietly removes it.</p></div>

<div class="iv"><p class="q">"When would you use a template, and what would you not put in it?"</p><p>Strong answer: use a template when many sites share a standard design: same VLAN list, firewall policy, SSIDs. Keep site-specific items local: subnets and addresses, uplink details, device inventory. Mention read-only behaviour, the option to unbind (keeps a copy), and the risk that a template change reaches every bound site at once, so test and schedule it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template holds the common design; bound networks follow it.</li>
<li>Template controls VLAN list, firewall rules, SSIDs and content settings.</li>
<li>Each network keeps its own subnets, addresses, devices and uplinks.</li>
<li>Controlled items are read-only on a bound network; edit the template or unbind.</li>
<li>Binding can change live behaviour; unbinding keeps a copy of current settings.</li>
</ul></div>
`,hi:`
<h3>Problem: 200 shops, 200 thodi alag configs</h3>
<p>Agar Bharat Retail Co teen sites se tees sites tak badhe, to engineer ko wahi kaam tees baar karna padega: VLAN 10 Staff, 20 Servers, 30 Guest aur 99 Management banana; guest isolation firewall rule copy karna; SSIDs copy karna. Har repetition mein typo ka chance hai, aur waqt ke saath sites ek dusre se alag hoti jaati hain. <b>Configuration template</b> isse solve karta hai: aap common settings ek baar likhte ho, aur template se <b>bound</b> har network use follow karta hai.</p>

<h3>Bind aur unbind</h3>
<ul>
<li>Network ko template se <b>bind</b> karna: network template ki settings lena shuru kar deta hai.</li>
<li><b>Unbind</b>: network template ko follow karna band kar deta hai. Is simulator mein network us waqt ki settings ki <b>copy rakh leta hai</b>, isliye kuch toota nahi, aur ab aap unhe locally edit kar sakte ho.</li>
</ul>
<p>Is page ka naam <b>Templates</b> hai. Yeh har template, uske bound networks, aur bind aur unbind actions dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Template bound networks ko drive karta hai">
<rect x="200" y="10" width="240" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Template: Branch-Standard</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">VLAN names, firewall rules, SSIDs, content</text>
<line x1="260" y1="80" x2="110" y2="130" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="530" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="130" width="200" height="110" rx="8" fill="#bae6fd"/><text x="120" y="155" text-anchor="middle" class="svg-ink" font-size="13">blr (bound)</text><text x="120" y="178" text-anchor="middle" class="svg-ink" font-size="12">template se: VLAN names, rules</text><text x="120" y="198" text-anchor="middle" class="svg-ink" font-size="12">local: 10.2.x.0/24 subnets</text><text x="120" y="218" text-anchor="middle" class="svg-ink" font-size="12">local: devices, uplink IP</text>
<rect x="420" y="130" width="200" height="110" rx="8" fill="#bae6fd"/><text x="520" y="155" text-anchor="middle" class="svg-ink" font-size="13">del (bound)</text><text x="520" y="178" text-anchor="middle" class="svg-ink" font-size="12">template se: VLAN names, rules</text><text x="520" y="198" text-anchor="middle" class="svg-ink" font-size="12">local: 10.3.x.0/24 subnets</text><text x="520" y="218" text-anchor="middle" class="svg-ink" font-size="12">local: devices, uplink IP</text>
</svg><p class="cap">Template shape deta hai; har site apne addresses khud bharti hai.</p></div>

<h3>Template kya control karta hai, aur kya local rehta hai</h3>
<table class="cmp"><tr><th>Template control karta hai</th><th>Har network mein local rehta hai</th></tr>
<tr><td>VLAN list (ids aur names: 10 Staff, 20 Servers, 30 Guest, 99 Management)</td><td>Har VLAN ka subnet aur MX address (Bengaluru mein 10.2.10.0/24 aur 10.2.10.1)</td></tr>
<tr><td>Firewall rules aur unka order</td><td>Kaunse physical devices hain, unke serials aur names</td></tr>
<tr><td>SSIDs (names, security, VLAN tag)</td><td>Uplink circuits aur unke IP addresses</td></tr>
<tr><td>Content-filtering settings</td><td>Devices ke tags, local admins</td></tr>
</table>
<p>Isiliye per-network subnets matter karte hain: Mumbai 10.1.x.0/24, Bengaluru 10.2.x.0/24, Delhi 10.3.x.0/24 use karta hai. Template kehta hai "VLAN 10 hai aur uska naam Staff hai"; har network jawab deta hai "aur mere sheher mein woh 10.2.10.0/24 hai".</p>

<h3>Bound hone par read-only</h3>
<p>Network bound hote hi, jo bhi setting template control karta hai woh us network par <b>read-only</b> ho jaati hai. Page use phir bhi dikhata hai, lekin Save refuse hota hai ya field locked hota hai. Yeh jaanboojh kar hai: isse ek site standard se door nahi bhatakti. Badalne ke liye ya to <i>template</i> edit karo (saare bound networks par asar) ya us network ko <i>unbind</i> karo (woh settings ki copy ke saath standalone site ban jaata hai). API se read-only item conflict error deta hai, jo mk-api module mein aayega.</p>

<div class="eg"><p><b>Worked example.</b> Bengaluru mein Imran <code>blr</code> par VLAN 30 ka naam Guest se Visitors karne ki koshish karta hai. Change refuse ho jaata hai kyunki blr, Branch-Standard se bound hai. Options: template owner se sabke liye rename karwao, ya blr ko unbind karo (jo aap shayad hi chahoge).</p></div>
<pre class="out">Templates
Template          Bound networks        Controls
Branch-Standard   blr, del              VLANs, firewall, SSIDs, content
(none)            mum  (hub, standalone) -

Network blr  &gt;  Addressing and VLANs
<span class="hl">Controlled by template Branch-Standard (read-only)</span>
VLAN  Name    Subnet         MX IP        DHCP
10    Staff   10.2.10.0/24   10.2.10.1    server
30    Guest   10.2.30.0/24   10.2.30.1    server</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Bind karne se network ki VLAN list, firewall rules, SSIDs aur content settings template ki settings se replace ho jaati hain, to bind live branch ka behaviour turant badal sakta hai, chahe aapne branch ko chhua bhi nahi. Unbind copy rakhta hai, isliye us waqt behaviour nahi badalta; bas aap locally edit kar sakte ho. Live site par bind ke liye maintenance window use karo (chapter 5).</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Live branch ko bina uske current rules check kiye bind kar dena: template ke rules takeover kar lete hain. (2) "Quick fix" ke liye unbind karke re-bind bhool jaana, jisse site chupchaap drift ho jaati hai. (3) Site-specific subnets ko har network mein rakhne ke bajaye template mein daal dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Delhi par VLAN names edit kyun nahi ho rahe?" Kyunki network bound hai aur VLAN list template-controlled hai. Subnets aur addresses lekin per network hain aur aapke control mein rehte hain.</p></div>

<div class="scn"><h4>Tees sites, ek typo ek baar mein theek</h4><p>Ek retail chain ne dekha ki unka guest firewall rule guests ko server VLAN tak jaane deta tha. Templates ke saath unhone rule template mein ek baar sahi kiya aur saare bound branches ek saath update ho gaye. Do stores jo saalon pehle "quick fix" ke liye unbind hue the, nahi badle, aur baad mein security review mein akele non-compliant sites ke roop mein aaye.</p><p><b>Seekh:</b> templates consistency dete hain; unbind chupchaap use hata deta hai.</p></div>

<div class="iv"><p class="q">"Template kab use karoge, aur usme kya nahi daaloge?"</p><p>Strong answer: jab bahut saari sites ek standard design share karti hon: same VLAN list, firewall policy, SSIDs. Site-specific cheezein local rakho: subnets aur addresses, uplink details, device inventory. Read-only behaviour mention karo, unbind ka option (copy rakhta hai), aur yeh risk ki template change har bound site tak ek saath pahunchta hai, isliye test karo aur schedule karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template common design rakhta hai; bound networks use follow karte hain.</li>
<li>Template VLAN list, firewall rules, SSIDs aur content settings control karta hai.</li>
<li>Har network apne subnets, addresses, devices aur uplinks rakhta hai.</li>
<li>Bound network par controlled items read-only hote hain; template edit karo ya unbind karo.</li>
<li>Bind live behaviour badal sakta hai; unbind current settings ki copy rakhta hai.</li>
</ul></div>
`}};export{e as default};