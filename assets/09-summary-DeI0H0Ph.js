var e={id:`summary`,h:{en:`Summary and exam checklist: security profiles`,hi:`Summary aur exam checklist: security profiles`},body:{en:`
<p>This chapter pulls the module together. Read it the evening before you practise on a lab FortiGate or before an interview. Everything marked as configuration in this module is real FortiOS syntax that the simulator does not run; practise the policy and troubleshooting parts in <b>nse4-policy</b> and <b>nse4-diag</b>, and compare the same engines in <b>sec-ftd-ips</b> and <b>sec-visibility</b>.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Module summary">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Policy</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">accept + match</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SSL profile</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">readability</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Engines</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">web, app, AV, IPS</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Logs</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">evidence</text>
</svg><p class="cap">The whole module in one line: policy, then SSL profile, then the engines, then logs.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why security profiles run only on accepted traffic and where they attach to a policy.</li>
<li>I can describe flow versus proxy inspection and when each is chosen.</li>
<li>I can build a web filter profile with category actions, a static URL filter and a local rating.</li>
<li>I can write an application list that monitors first and blocks by category or risk.</li>
<li>I can configure antivirus per protocol and explain what it cannot scan.</li>
<li>I can configure an IPS sensor by severity and location and roll it out safely.</li>
<li>I can bundle profiles in a profile group and attach it to a policy.</li>
<li>I can troubleshoot "profile not working" with the six-step ladder.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FortiGuard</dt><dd>Fortinet's update service: URL ratings, application, antivirus and IPS signatures.</dd>
<dt>Security profile</dt><dd>Reusable inspection object selected inside an accept policy.</dd>
<dt>Profile group</dt><dd>A named bundle of the SSL profile, antivirus, web filter, IPS and application list.</dd>
<dt>Flow / proxy mode</dt><dd>Streaming inspection versus buffering the whole object.</dd>
<dt>Local rating</dt><dd>A host-to-category mapping on this FortiGate that overrides FortiGuard.</dd>
<dt>Exempt</dt><dd>URL filter action that skips further inspection of that traffic.</dd>
<dt>Application list</dt><dd>Ordered entries that choose applications by category, risk or name and apply an action.</dd>
<dt>IPS sensor</dt><dd>Ordered entries that select signatures by severity, location, protocol and apply an action.</dd>
<dt>Implicit deny (policy 0)</dt><dd>The final rule that drops traffic that matched no policy.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Where profiles run</td><td>Accept policies only; deny never inspects</td></tr>
<tr><td>Web filter order</td><td>Static URL filter first, then FortiGuard category</td></tr>
<tr><td>Category actions</td><td>block, monitor, warning, authenticate; no entry = allowed</td></tr>
<tr><td>URL actions</td><td>allow, block, monitor, exempt</td></tr>
<tr><td>App control actions</td><td>pass, block, reset; monitor = pass + log</td></tr>
<tr><td>AV actions</td><td>block, monitor, disable per protocol</td></tr>
<tr><td>IPS actions</td><td>pass, block, reset, default</td></tr>
<tr><td>Encrypted traffic</td><td>Needs deep inspection for full content, see nse4-ssl</td></tr>
<tr><td>Session behaviour</td><td>Existing sessions keep their old verdict</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># captured in the simulator labs (nse4-diag)</span>
diagnose debug flow filter addr 10.0.2.10
diagnose debug flow trace start 10
diagnose debug enable
diagnose sys session filter dst 10.0.2.10
diagnose sys session list
diagnose sys session clear
diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2
<span class="c"># reference only, not run in the simulator</span>
show full-configuration firewall policy 10
execute log filter category 3
execute log display
diagnose autoupdate versions</pre>

<div class="warn"><p><b>Last reminder.</b> A correct profile on the wrong policy, or on traffic the FortiGate cannot read, protects nobody. Policy first, readability second, profile third.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question describes HTTPS traffic and expects URL path filtering, antivirus or IPS to work, check whether deep inspection is configured. If not, the answer is almost always that those engines cannot see the content.</p></div>

<div class="scn"><h4>The audit that passed on paper and failed in practice</h4><p>An auditor read the firewall configuration and saw a full set of profiles on every policy. A live test then downloaded a harmless test file over an encrypted connection and the file was not detected. The profile list was perfect; the SSL profile was no-inspection. The remediation was a deep-inspection profile for staff traffic, with documented exemptions for banking and health sites and a user notice.</p><p><b>Lesson:</b> audits must test behaviour, not only read configuration.</p></div>

<div class="iv"><p class="q">"Give me a two-minute summary of FortiGate security profiles."</p><p>Security profiles are reusable inspection objects (web filter, application control, antivirus, IPS) selected in accept policies, alone or as a profile group. The SSL/SSH inspection profile decides how much encrypted content they can read. I roll them out from monitor to enforce using logs, troubleshoot from the policy ID inward, and keep FortiGuard updates current.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy, then SSL profile, then engines, then logs.</li>
<li>Profiles run only on accepted traffic and are reusable objects or groups.</li>
<li>Monitor first, enforce with evidence, keep exemptions narrow.</li>
<li>Encrypted traffic needs deep inspection; see nse4-ssl.</li>
<li>Troubleshoot from the policy ID inward and verify behaviour with test events.</li>
</ul></div>
`,hi:`
<p>Yeh chapter poore module ko jodta hai. Lab FortiGate par practice se pehle ya interview se pehle shaam ko ise padho. Is module mein jo bhi configuration hai woh real FortiOS syntax hai jo simulator nahi chalata; policy aur troubleshooting wale hisson ki practice <b>nse4-policy</b> aur <b>nse4-diag</b> mein karo, aur wahi engines ki tulna <b>sec-ftd-ips</b> aur <b>sec-visibility</b> mein.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Module summary">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Policy</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">accept + match</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SSL profile</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">readability</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Engines</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">web, app, AV, IPS</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Logs</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">evidence</text>
</svg><p class="cap">Poora module ek line mein: policy, phir SSL profile, phir engines, phir logs.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki security profiles sirf accepted traffic par kyun chalte hain aur policy mein kahan lagte hain.</li>
<li>Main flow versus proxy inspection aur dono kab chune jaate hain bata sakta hoon.</li>
<li>Main category actions, static URL filter aur local rating ke saath web filter profile bana sakta hoon.</li>
<li>Main aisi application list likh sakta hoon jo pehle monitor kare aur category ya risk se block kare.</li>
<li>Main protocol ke hisaab se antivirus configure kar sakta hoon aur bata sakta hoon woh kya scan nahi kar sakta.</li>
<li>Main severity aur location se IPS sensor configure kar sakta hoon aur safely rollout kar sakta hoon.</li>
<li>Main profiles ko profile group mein bundle karke policy se attach kar sakta hoon.</li>
<li>Main "profile kaam nahi kar raha" ko chhe-step ladder se troubleshoot kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FortiGuard</dt><dd>Fortinet ki update service: URL ratings, application, antivirus aur IPS signatures.</dd>
<dt>Security profile</dt><dd>Reusable inspection object jo accept policy ke andar select hota hai.</dd>
<dt>Profile group</dt><dd>SSL profile, antivirus, web filter, IPS aur application list ka named bundle.</dd>
<dt>Flow / proxy mode</dt><dd>Streaming inspection versus poora object buffer karna.</dd>
<dt>Local rating</dt><dd>Is FortiGate par host-to-category mapping jo FortiGuard ko override karti hai.</dd>
<dt>Exempt</dt><dd>URL filter action jo us traffic ka aage ka inspection skip karta hai.</dd>
<dt>Application list</dt><dd>Ordered entries jo category, risk ya naam se applications chunti hain aur action lagati hain.</dd>
<dt>IPS sensor</dt><dd>Ordered entries jo severity, location, protocol se signatures chunti hain aur action lagati hain.</dd>
<dt>Implicit deny (policy 0)</dt><dd>Aakhri rule jo kisi policy se match na hone wala traffic drop karta hai.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Profiles kahan chalte hain</td><td>Sirf accept policies; deny kabhi inspect nahi karti</td></tr>
<tr><td>Web filter order</td><td>Pehle static URL filter, phir FortiGuard category</td></tr>
<tr><td>Category actions</td><td>block, monitor, warning, authenticate; entry na ho = allowed</td></tr>
<tr><td>URL actions</td><td>allow, block, monitor, exempt</td></tr>
<tr><td>App control actions</td><td>pass, block, reset; monitor = pass + log</td></tr>
<tr><td>AV actions</td><td>protocol ke hisaab se block, monitor, disable</td></tr>
<tr><td>IPS actions</td><td>pass, block, reset, default</td></tr>
<tr><td>Encrypted traffic</td><td>Poore content ke liye deep inspection, dekho nse4-ssl</td></tr>
<tr><td>Session behaviour</td><td>Existing sessions apna purana verdict rakhte hain</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># simulator labs (nse4-diag) mein captured</span>
diagnose debug flow filter addr 10.0.2.10
diagnose debug flow trace start 10
diagnose debug enable
diagnose sys session filter dst 10.0.2.10
diagnose sys session list
diagnose sys session clear
diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2
<span class="c"># sirf reference, simulator mein nahi chalta</span>
show full-configuration firewall policy 10
execute log filter category 3
execute log display
diagnose autoupdate versions</pre>

<div class="warn"><p><b>Aakhri reminder.</b> Galat policy par ya aise traffic par jo FortiGate padh nahi sakta, sahi profile bhi kisi ko protect nahi karta. Pehle policy, doosra readability, teesra profile.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar sawaal HTTPS traffic batata hai aur URL path filtering, antivirus ya IPS ke kaam karne ki umeed rakhta hai, to check karo deep inspection configured hai ya nahi. Nahi hai to jawab lagbhag hamesha yeh hota hai ki woh engines content dekh nahi sakte.</p></div>

<div class="scn"><h4>Audit jo kagaz par pass hua aur practice mein fail</h4><p>Auditor ne firewall configuration padhi aur har policy par profiles ka poora set dekha. Phir live test mein encrypted connection se harmless test file download hui aur detect nahi hui. Profile list perfect thi; SSL profile no-inspection tha. Remediation: staff traffic ke liye deep-inspection profile, banking aur health sites ke documented exemptions aur user notice ke saath.</p><p><b>Lesson:</b> audit mein behaviour test karo, sirf configuration mat padho.</p></div>

<div class="iv"><p class="q">"FortiGate security profiles ka do minute ka summary do."</p><p>Security profiles reusable inspection objects hain (web filter, application control, antivirus, IPS) jo accept policies mein akele ya profile group ke roop mein select hote hain. SSL/SSH inspection profile decide karta hai ki woh encrypted content kitna padh sakte hain. Main logs se monitor se enforce tak rollout karta hoon, policy ID se andar ki taraf troubleshoot karta hoon, aur FortiGuard updates current rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy, phir SSL profile, phir engines, phir logs.</li>
<li>Profiles sirf accepted traffic par chalte hain aur reusable objects ya groups hain.</li>
<li>Pehle monitor, evidence ke saath enforce, exemptions narrow rakho.</li>
<li>Encrypted traffic ko deep inspection chahiye; dekho nse4-ssl.</li>
<li>Policy ID se andar ki taraf troubleshoot karo aur test events se behaviour verify karo.</li>
</ul></div>
`}};export{e as default};