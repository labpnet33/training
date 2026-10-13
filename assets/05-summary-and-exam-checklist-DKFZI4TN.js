var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module on one page</h3>
<p>Security moved to the cloud because applications and people left the head-office network. Zero trust says verify every request and grant least privilege; SASE delivers the security functions from cloud edges; the secure web gateway, SSL inspection, DLP and cloud firewall protect internet access; ZTNA protects private applications; experience scores show where slowness hides. One admin portal holds the policy. A request meets identity, URL, SSL, path, DLP and malware checks in that order, first match wins.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary map">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">Why cloud</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="12">apps and users moved</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">Zero trust, SASE</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="12">verify, least privilege</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">Three services</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="12">+ identity, 13 pages</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="12">Order and method</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">test, log, fix, verify</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="105" width="620" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="13">Next: zs-fwd (how traffic gets to the cloud), then zs-sec, zs-zpa, zs-id, zs-zdx, zs-ops</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">Not forwarded means not protected</text>
</svg><p class="cap">Four chapters, one idea: policy only protects traffic that reaches it.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain in two sentences why backhaul hurts and what the cloud checkpoint changes.</li>
<li>Define proxy, tunnel, DNS and TLS for a beginner.</li>
<li>Contrast a VPN (network access) with ZTNA (application access).</li>
<li>List what SASE bundles and match each function to a track module.</li>
<li>Name the three services and the identity layer; place a ticket in the right one.</li>
<li>Describe Sahyadri: sites, forwarding methods, users and groups.</li>
<li>Use Overview, Alerts and Audit to find a problem and a recent change.</li>
<li>Edit a rule, press Activate changes and explain why it was needed.</li>
<li>Run the Policy tester and read decision, rule, path, identity and category.</li>
<li>Apply symptom, evidence, root cause, fix, verify to labs zs-start-1, 2 and 3.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Secure web gateway</dt><dd>Cloud proxy that filters and inspects web traffic.</dd>
<dt>Zero trust</dt><dd>Verify identity, device and request every time; least privilege.</dd>
<dt>SASE</dt><dd>Networking plus security delivered from cloud edges.</dd>
<dt>ZTNA</dt><dd>Per-application access without joining the network.</dd>
<dt>SSL inspection</dt><dd>Opening TLS sessions so content checks can work.</dd>
<dt>DLP</dt><dd>Detecting sensitive data, such as card numbers, leaving.</dd>
<dt>Location</dt><dd>The portal record of a site: method, public IP, authentication.</dd>
<dt>Activate changes</dt><dd>Copies the candidate configuration to the running policy.</dd>
<dt>Direct traffic</dt><dd>Traffic that never reached the service: no policy, inspection or logs.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Check order</td><td>Identity, URL host, SSL, URL path, DLP, malware and sandbox</td></tr>
<tr><td>Rule matching</td><td>First match wins; URL default allow; private access implicit deny</td></tr>
<tr><td>SSL no match</td><td>Not inspected</td></tr>
<tr><td>Policy block code</td><td>403 (401 sign-in, 495 certificate)</td></tr>
<tr><td>No log line</td><td>Suspect direct path, not policy</td></tr>
<tr><td>Alerts</td><td>Derived from settings; fix the setting</td></tr>
</table>

<h3>Command and tool cheat-sheet</h3>
<pre class="code"><span class="c">! Client (PC-xxx or LAPTOP-RMT)</span>
curl news.example
curl games.example
zapp status
pac show
ipconfig
<span class="c">! Portal: Policy tester, then Logs, then Alerts and audit</span></pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Nothing in this chapter changes anything; use it to rehearse the question before every click: which packets or decisions does this setting touch?</p></div>

<div class="exam"><p><b>Exam trap.</b> Read wording carefully: "default" (allow for URL), "implicit" (deny at the end of private access), "first match" (not best match).</p></div>

<div class="scn"><h4>The first ticket as a new engineer</h4><p>On day one a manager said "Sales cannot open a gaming-news site, fix it". The engineer ran the Policy tester, saw the Gaming category rule blocking the site's category, confirmed with the log line and the manager's approval, added a narrow allow for one host above it, activated, re-tested and noted the change.</p><p><b>Lesson:</b> evidence, smallest fix, verify, record.</p></div>

<div class="iv"><p class="q">"Walk me through a ticket where a user cannot open a website."</p><p>Strong answer: confirm who, where and when; run the Policy tester with the same user, location and destination; read the rule and the path; check logs (missing logs mean direct traffic); fix the rule or the forwarding; activate; re-test; update the ticket with before and after.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy protects only traffic that reaches the service.</li>
<li>Know the six-step check order and that first match wins.</li>
<li>Know Sahyadri and the thirteen portal pages.</li>
<li>Activate changes before you test; verify after.</li>
<li>Use the same five-step method for every lab and ticket in the track.</li>
</ul></div>
`,hi:`
<h3>Poora module ek page par</h3>
<p>Security cloud mein isliye gayi kyunki applications aur log head-office network se bahar chale gaye. Zero trust kehta hai har request verify karo aur least privilege do; SASE security functions cloud edges se deta hai; secure web gateway, SSL inspection, DLP aur cloud firewall internet access ko protect karte hain; ZTNA private applications ko protect karta hai; experience scores dikhate hain ki slowness kahan chhupi hai. Ek admin portal policy rakhta hai. Request identity, URL, SSL, path, DLP aur malware checks se isi order mein guzarti hai, first match wins.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module summary map">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">Cloud kyun</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="12">apps aur users move hue</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">Zero trust, SASE</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="12">verify, least privilege</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">Teen services</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="12">+ identity, 13 pages</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="12">Order aur method</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">test, log, fix, verify</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="105" width="620" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="13">Aage: zs-fwd (traffic cloud tak kaise pahunchta hai), phir zs-sec, zs-zpa, zs-id, zs-zdx, zs-ops</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">Forward nahi hua matlab protected nahi</text>
</svg><p class="cap">Chaar chapters, ek idea: policy sirf us traffic ko protect karti hai jo us tak pahunchta hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Do sentences mein samjhao ki backhaul kyun nuksan karta hai aur cloud checkpoint kya badalta hai.</li>
<li>Beginner ke liye proxy, tunnel, DNS aur TLS define karo.</li>
<li>VPN (network access) aur ZTNA (application access) ka contrast batao.</li>
<li>SASE kya bundle karta hai list karo aur har function ko track module se match karo.</li>
<li>Teen services aur identity layer ke naam batao; ticket ko sahi jagah rakho.</li>
<li>Sahyadri describe karo: sites, forwarding methods, users aur groups.</li>
<li>Overview, Alerts aur Audit se problem aur recent change dhoondo.</li>
<li>Rule edit karo, Activate changes dabao aur batao kyun zaroori tha.</li>
<li>Policy tester chalao aur decision, rule, path, identity aur category padho.</li>
<li>Labs zs-start-1, 2 aur 3 par symptom, evidence, root cause, fix, verify lagao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Secure web gateway</dt><dd>Cloud proxy jo web traffic filter aur inspect karta hai.</dd>
<dt>Zero trust</dt><dd>Har baar identity, device aur request verify karo; least privilege.</dd>
<dt>SASE</dt><dd>Networking plus security jo cloud edges se milti hai.</dd>
<dt>ZTNA</dt><dd>Network join kiye bina per-application access.</dd>
<dt>SSL inspection</dt><dd>TLS sessions kholna taaki content checks kaam karein.</dd>
<dt>DLP</dt><dd>Card numbers jaisa sensitive data bahar jaate detect karna.</dd>
<dt>Location</dt><dd>Site ka portal record: method, public IP, authentication.</dd>
<dt>Activate changes</dt><dd>Candidate configuration ko running policy mein copy karta hai.</dd>
<dt>Direct traffic</dt><dd>Jo traffic service tak pahunchi hi nahi: koi policy, inspection ya logs nahi.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Check order</td><td>Identity, URL host, SSL, URL path, DLP, malware aur sandbox</td></tr>
<tr><td>Rule matching</td><td>First match wins; URL default allow; private access implicit deny</td></tr>
<tr><td>SSL no match</td><td>Inspect nahi hota</td></tr>
<tr><td>Policy block code</td><td>403 (401 sign-in, 495 certificate)</td></tr>
<tr><td>No log line</td><td>Direct path par shak karo, policy par nahi</td></tr>
<tr><td>Alerts</td><td>Settings se derive; setting fix karo</td></tr>
</table>

<h3>Command aur tool cheat-sheet</h3>
<pre class="code"><span class="c">! Client (PC-xxx ya LAPTOP-RMT)</span>
curl news.example
curl games.example
zapp status
pac show
ipconfig
<span class="c">! Portal: Policy tester, phir Logs, phir Alerts and audit</span></pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Is chapter mein kuch nahi badalta; har click se pehle yeh sawal practice karo: yeh setting kin packets ya decisions ko chhoti hai?</p></div>

<div class="exam"><p><b>Exam trap.</b> Wording dhyan se padho: "default" (URL ke liye allow), "implicit" (private access ke end mein deny), "first match" (best match nahi).</p></div>

<div class="scn"><h4>Naye engineer ka pehla ticket</h4><p>Pehle din manager ne kaha "Sales ek gaming-news site nahi khol pa rahi, fix karo". Engineer ne Policy tester chalaya, dekha ki Gaming category rule site ki category block kar raha hai, log line aur manager ki approval se confirm kiya, ek host ke liye narrow allow upar add kiya, activate kiya, dobara test kiya aur change note kiya.</p><p><b>Seekh:</b> evidence, sabse chhota fix, verify, record.</p></div>

<div class="iv"><p class="q">"Ek ticket walk-through karo jahan user website nahi khol pa raha."</p><p>Strong answer: kaun, kahan, kab confirm karo; same user, location aur destination se Policy tester chalao; rule aur path padho; logs check karo (missing logs ka matlab direct traffic); rule ya forwarding fix karo; activate karo; dobara test karo; ticket mein before aur after update karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy sirf us traffic ko protect karti hai jo service tak pahunchta hai.</li>
<li>Chhe-step check order aur first match wins yaad rakho.</li>
<li>Sahyadri aur terah portal pages jaano.</li>
<li>Test se pehle Activate changes karo; baad mein verify karo.</li>
<li>Track ke har lab aur ticket ke liye wahi paanch-step method use karo.</li>
</ul></div>
`}};export{e as default};