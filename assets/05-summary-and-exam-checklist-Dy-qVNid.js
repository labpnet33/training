var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Private access recap">
<rect x="10" y="50" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="78" text-anchor="middle" class="svg-ink" font-size="12">Client connector</text><text x="70" y="95" text-anchor="middle" class="svg-muted" font-size="11">bypass, synthetic IP</text>
<rect x="260" y="40" width="120" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">Broker</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">segment + policy</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">implicit deny</text>
<rect x="510" y="50" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="78" text-anchor="middle" class="svg-ink" font-size="12">App connector</text><text x="570" y="95" text-anchor="middle" class="svg-muted" font-size="11">up, enrolled, site</text>
<line x1="130" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="510" y1="80" x2="380" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Both ends dial out; the broker allows or denies by policy.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain VPN versus ZTNA and what zero trust means in one minute.</li>
<li>Explain inside-out connections and why no inbound port is needed.</li>
<li>Build the chain: segment, segment group, server group, connector group, connector (lab zs-zpa-1).</li>
<li>Write an access policy by group and predict implicit deny (lab zs-zpa-2).</li>
<li>Explain synthetic addresses and the bypass trap.</li>
<li>Spot a wrong-site connector group, a disabled server group and an unenrolled connector.</li>
<li>Run the five-step method on lab zs-zpa-3 and tickets 320110, 321010, 321020, 321080 and 321100.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ZTNA</dt><dd>Zero trust network access: per-application access after verifying user and device, with no network-level trust.</dd>
<dt>Zero trust</dt><dd>Never trust by location; verify and grant least privilege.</dd>
<dt>App connector</dt><dd>Site-side program that dials out to the cloud and reaches the private app.</dd>
<dt>Client connector</dt><dd>Laptop agent that steers private and internet traffic into the cloud.</dd>
<dt>Application segment</dt><dd>Domain, port and protocol of one private app.</dd>
<dt>Segment group</dt><dd>Bundle of segments used by policy.</dd>
<dt>Server group</dt><dd>Links segments to connector groups.</dd>
<dt>Synthetic address</dt><dd>Stand-in address handed to apps so traffic enters the tunnel.</dd>
<dt>Implicit deny</dt><dd>The invisible last rule: no match means denied.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Who initiates the connections?</td><td>Both connectors, outbound</td></tr>
<tr><td>Default if no access rule matches?</td><td>Deny</td></tr>
<tr><td>Which beats which, domains?</td><td>Exact beats wildcard</td></tr>
<tr><td>What must be true of a connector?</td><td>Up and enrolled, in a group whose site equals the app site</td></tr>
<tr><td>Corporate domain on bypass list?</td><td>Never reaches private access</td></tr>
<tr><td>User on the app's own site LAN?</td><td>Reaches it directly</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! client commands in the simulator</span>
zapp status
zapp update-policy
nslookup erp.corp.example
nc -z git.corp.example 22
curl erp.corp.example</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Segments name what is private, policy decides who, connectors provide the path, bypass decides what even enters the tunnel. Ask which of these four a setting changes.</p></div>
<div class="exam"><p><b>Exam trap.</b> Resume terms to define in a sentence: ZTNA and zero trust.</p></div>

<div class="scn"><h4>Interview day</h4><p>A candidate was asked to troubleshoot an unreachable internal app on a whiteboard. She drew the six-link chain, asked which link the tester flagged, and explained the likely fix for each. The panel hired her for exactly that structure.</p><p><b>Lesson:</b> a drawn chain beats a list of random ideas.</p></div>

<div class="iv"><p class="q">"Why is zero trust better than a perimeter?"</p><p>A perimeter trusts anyone inside once through; zero trust verifies each request, grants per-application access and limits what a compromised device can reach.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ZTNA connects users to applications, not networks.</li>
<li>Outbound-only connectors remove inbound exposure.</li>
<li>Policy is first match with implicit deny.</li>
<li>Check the chain in order and change one thing at a time.</li>
<li>Prove changes with a positive and a negative test.</li>
</ul></div>
`,hi:`
<h3>Module ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Private access ka recap">
<rect x="10" y="50" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="78" text-anchor="middle" class="svg-ink" font-size="12">Client connector</text><text x="70" y="95" text-anchor="middle" class="svg-muted" font-size="11">bypass, synthetic IP</text>
<rect x="260" y="40" width="120" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">Broker</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">segment + policy</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="11">implicit deny</text>
<rect x="510" y="50" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="78" text-anchor="middle" class="svg-ink" font-size="12">App connector</text><text x="570" y="95" text-anchor="middle" class="svg-muted" font-size="11">up, enrolled, site</text>
<line x1="130" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="510" y1="80" x2="380" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Dono ends outbound dial karte hain; broker policy se allow ya deny karta hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>VPN versus ZTNA aur zero trust ka matlab ek minute mein samjhao.</li>
<li>Inside-out connections samjhao aur batao inbound port kyun nahi chahiye.</li>
<li>Chain banao: segment, segment group, server group, connector group, connector (lab zs-zpa-1).</li>
<li>Group ke hisaab se access policy likho aur implicit deny predict karo (lab zs-zpa-2).</li>
<li>Synthetic addresses aur bypass trap samjhao.</li>
<li>Wrong-site connector group, disabled server group aur unenrolled connector pehchano.</li>
<li>Lab zs-zpa-3 aur tickets 320110, 321010, 321020, 321080 aur 321100 par paanch-step method chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ZTNA</dt><dd>Zero trust network access: user aur device verify karke per-application access, network-level trust ke bina.</dd>
<dt>Zero trust</dt><dd>Location se trust mat karo; verify karo aur least privilege do.</dd>
<dt>App connector</dt><dd>Site-side program jo cloud ki taraf dial out karta hai aur private app tak pahunchta hai.</dd>
<dt>Client connector</dt><dd>Laptop agent jo private aur internet traffic ko cloud mein steer karta hai.</dd>
<dt>Application segment</dt><dd>Ek private app ka domain, port aur protocol.</dd>
<dt>Segment group</dt><dd>Policy ke use ke liye segments ka bundle.</dd>
<dt>Server group</dt><dd>Segments ko connector groups se jodta hai.</dd>
<dt>Synthetic address</dt><dd>Apps ko diya gaya stand-in address taaki traffic tunnel mein jaye.</dd>
<dt>Implicit deny</dt><dd>Invisible aakhri rule: no match ka matlab denied.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Connections kaun initiate karta hai?</td><td>Dono connectors, outbound</td></tr>
<tr><td>Koi access rule match na kare to default?</td><td>Deny</td></tr>
<tr><td>Domains mein kaun jeetta hai?</td><td>Exact wildcard ko harata hai</td></tr>
<tr><td>Connector ke liye kya sach hona chahiye?</td><td>Up aur enrolled, aise group mein jiski site app site ke barabar ho</td></tr>
<tr><td>Corporate domain bypass list mein?</td><td>Private access tak kabhi nahi pahunchta</td></tr>
<tr><td>App ki apni site ke LAN ka user?</td><td>Seedha reach karta hai</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! simulator mein client commands</span>
zapp status
zapp update-policy
nslookup erp.corp.example
nc -z git.corp.example 22
curl erp.corp.example</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Segments batate hain kya private hai, policy decide karti hai kaun, connectors path dete hain, bypass decide karta hai ki tunnel mein kya jaata hi hai. Poochho ki koi setting in chaar mein se kya badalti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Resume terms jo ek line mein define karne hain: ZTNA aur zero trust.</p></div>

<div class="scn"><h4>Interview ka din</h4><p>Ek candidate se whiteboard par unreachable internal app troubleshoot karne ko kaha gaya. Usne chhe-kadi wali chain banayi, poocha ki tester ne kaun si kadi flag ki, aur har ek ka likely fix samjhaya. Panel ne usi structure ke liye use hire kiya.</p><p><b>Seekh:</b> banayi hui chain random ideas ki list se behtar hai.</p></div>

<div class="iv"><p class="q">"Zero trust perimeter se behtar kyun hai?"</p><p>Perimeter andar aane ke baad sabko trust karta hai; zero trust har request verify karta hai, per-application access deta hai aur compromised device jahan tak pahunch sakta hai use limit karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ZTNA users ko applications se jodta hai, networks se nahi.</li>
<li>Outbound-only connectors inbound exposure hata dete hain.</li>
<li>Policy first match hai implicit deny ke saath.</li>
<li>Chain ko order mein check karo aur ek baar mein ek cheez badlo.</li>
<li>Changes ko positive aur negative test se prove karo.</li>
</ul></div>
`}};export{e as default};