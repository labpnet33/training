var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The whole module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pipeline recap">
<rect x="10" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">Host and category</text><text x="105" y="64" text-anchor="middle" class="svg-muted" font-size="11">always works</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">SSL decision</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">inspect, skip, block</text>
<rect x="440" y="20" width="190" height="60" rx="8" fill="#fde68a"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="13">Path, DLP, sandbox</text><text x="535" y="64" text-anchor="middle" class="svg-muted" font-size="11">only if inspected</text>
<rect x="225" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="13">Cloud firewall</text><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="11">non-web, port based</text>
<line x1="200" y1="50" x2="225" y2="50" stroke="#64748b" stroke-width="2"/><line x1="415" y1="50" x2="440" y2="50" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Web goes through the top row; non-web goes to the cloud firewall.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the six pipeline stages in order and say what each one can see.</li>
<li>Predict the result of a request from a rule list, first match wins, default allow.</li>
<li>Explain the two TLS sessions and why devices need the company root.</li>
<li>Diagnose a certificate error as missing root or pinning.</li>
<li>Place skip rules above the inspect rule, and say why that creates blind spots.</li>
<li>Explain why DLP and sandbox fail on skipped traffic (ticket 321060).</li>
<li>Add a narrow firewall allow above a broad block (ticket 320100).</li>
<li>Run the five-step workflow with the Policy tester (labs zs-sec-1 to zs-sec-4, tickets 320010, 320020, 320070, 320090, 320100, 321060).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Secure web gateway</dt><dd>A cloud or on-site service that enforces policy on users' web traffic.</dd>
<dt>SSL inspection</dt><dd>Decrypting and re-encrypting TLS so deeper stages can read the content.</dd>
<dt>Root CA</dt><dd>The certificate authority at the top of a trust chain; devices must trust it.</dd>
<dt>Certificate pinning</dt><dd>An app accepting only a specific certificate, so inspection breaks it.</dd>
<dt>DLP</dt><dd>Data loss prevention: content checks for sensitive data using dictionaries.</dd>
<dt>Sandbox</dt><dd>An isolated environment where unknown files are run and judged.</dd>
<dt>Cloud firewall</dt><dd>Protocol and port rules for non-web traffic.</dd>
<dt>Skip rule</dt><dd>A do-not-inspect exception.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which stage sees the host name when traffic is encrypted?</td><td>URL filter by host and category</td></tr>
<tr><td>Which stages need decrypted traffic?</td><td>Full-URL filter, DLP, malware and sandbox</td></tr>
<tr><td>No SSL rule matches?</td><td>Not inspected</td></tr>
<tr><td>URL filter and firewall defaults here?</td><td>Allow</td></tr>
<tr><td>Certificate error on every site, one device?</td><td>Root certificate missing</td></tr>
<tr><td>Certificate error on one app only?</td><td>Pinning; add a skip rule</td></tr>
<tr><td>Large downloads hang, pages load?</td><td>MSS clamp, not policy</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! client commands in the simulator</span>
install-ca
curl news.example
upload docs.share.example expense.txt
download partners.example/setup-tool.exe
nc -z 203.0.113.200 22
nc -zu 203.0.113.200 53</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Ask this for every setting. URL rules change one answer. SSL rules change whether TLS is split in two. DLP and sandbox rules change what happens to content. Firewall rules change whether a connection is forwarded.</p></div>
<div class="exam"><p><b>Exam trap.</b> Resume terms to be able to define in one sentence each: SSL inspection, DLP, secure web gateway, cloud firewall.</p></div>

<div class="scn"><h4>The new joiner's first week</h4><p>A junior engineer received four tickets: a certificate warning, a blocked CRM, a failing updater and a card-number leak. By asking "which stage decided?" each time, she used the Policy tester and solved all four in an afternoon without guessing.</p><p><b>Lesson:</b> one method beats memorising four fixes.</p></div>

<div class="iv"><p class="q">"Walk me through a request in your secure web gateway."</p><p>Identity, host and category, SSL decision, path, DLP, malware and sandbox, with first-match rules, default allow, and the dependency on inspection. Then add the cloud firewall for non-web traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The order of stages explains almost every result.</li>
<li>Inspection is the gate to path rules, DLP and sandbox.</li>
<li>Skip rules fix pinned apps but create blind spots.</li>
<li>Position decides rule results.</li>
<li>Verify with a positive and a negative test.</li>
</ul></div>
`,hi:`
<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pipeline ka recap">
<rect x="10" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">Host aur category</text><text x="105" y="64" text-anchor="middle" class="svg-muted" font-size="11">hamesha chalta hai</text>
<rect x="225" y="20" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">SSL decision</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="11">inspect, skip, block</text>
<rect x="440" y="20" width="190" height="60" rx="8" fill="#fde68a"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="13">Path, DLP, sandbox</text><text x="535" y="64" text-anchor="middle" class="svg-muted" font-size="11">sirf inspect hone par</text>
<rect x="225" y="110" width="190" height="60" rx="8" fill="#fed7aa"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="13">Cloud firewall</text><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="11">non-web, port based</text>
<line x1="200" y1="50" x2="225" y2="50" stroke="#64748b" stroke-width="2"/><line x1="415" y1="50" x2="440" y2="50" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Web upar wali row se guzarta hai; non-web cloud firewall jaata hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Pipeline ke chhe stages order mein batao aur kaho har ek kya dekh sakta hai.</li>
<li>Rule list se request ka result predict karo, first match wins, default allow.</li>
<li>Do TLS sessions samjhao aur batao devices ko company root kyun chahiye.</li>
<li>Certificate error ko missing root ya pinning ke roop mein diagnose karo.</li>
<li>Skip rules ko inspect rule ke upar rakho, aur batao ki isse blind spots kyun bante hain.</li>
<li>Samjhao ki skipped traffic par DLP aur sandbox kyun fail hote hain (ticket 321060).</li>
<li>Broad block ke upar narrow firewall allow daalo (ticket 320100).</li>
<li>Policy tester ke saath paanch-step workflow chalao (labs zs-sec-1 se zs-sec-4, tickets 320010, 320020, 320070, 320090, 320100, 321060).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Secure web gateway</dt><dd>Cloud ya on-site service jo users ke web traffic par policy enforce karti hai.</dd>
<dt>SSL inspection</dt><dd>TLS ko decrypt aur re-encrypt karna taaki deeper stages content padh sakein.</dd>
<dt>Root CA</dt><dd>Trust chain ke top par certificate authority; devices ko use trust karna padta hai.</dd>
<dt>Certificate pinning</dt><dd>App sirf specific certificate accept karti hai, isliye inspection use tod deta hai.</dd>
<dt>DLP</dt><dd>Data loss prevention: dictionaries se sensitive data ke liye content checks.</dd>
<dt>Sandbox</dt><dd>Isolated environment jahan unknown files chalakar judge ki jaati hain.</dd>
<dt>Cloud firewall</dt><dd>Non-web traffic ke liye protocol aur port rules.</dd>
<dt>Skip rule</dt><dd>Do-not-inspect exception.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Traffic encrypted ho to host name kaun sa stage dekhta hai?</td><td>Host aur category se URL filter</td></tr>
<tr><td>Kin stages ko decrypted traffic chahiye?</td><td>Full-URL filter, DLP, malware aur sandbox</td></tr>
<tr><td>Koi SSL rule match na kare?</td><td>Not inspected</td></tr>
<tr><td>Yahan URL filter aur firewall ke defaults?</td><td>Allow</td></tr>
<tr><td>Ek device par har site par certificate error?</td><td>Root certificate missing</td></tr>
<tr><td>Sirf ek app par certificate error?</td><td>Pinning; skip rule add karo</td></tr>
<tr><td>Bade downloads hang, pages load?</td><td>MSS clamp, policy nahi</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! simulator mein client commands</span>
install-ca
curl news.example
upload docs.share.example expense.txt
download partners.example/setup-tool.exe
nc -z 203.0.113.200 22
nc -zu 203.0.113.200 53</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Har setting ke liye yeh poochho. URL rules ek jawab badalte hain. SSL rules badalte hain ki TLS do mein tootega ya nahi. DLP aur sandbox rules content ke saath kya hoga yeh badalte hain. Firewall rules badalte hain ki connection forward hoga ya nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Resume terms jo ek-ek line mein define kar paane chahiye: SSL inspection, DLP, secure web gateway, cloud firewall.</p></div>

<div class="scn"><h4>Naye joiner ka pehla hafta</h4><p>Ek junior engineer ko chaar tickets mile: certificate warning, blocked CRM, failing updater aur card-number leak. Har baar "kis stage ne decide kiya?" poochkar usne Policy tester use kiya aur chaaron ek dopahar mein bina guess kiye solve kar diye.</p><p><b>Seekh:</b> ek method chaar fixes ratne se behtar hai.</p></div>

<div class="iv"><p class="q">"Apne secure web gateway mein ek request ka safar batao."</p><p>Identity, host aur category, SSL decision, path, DLP, malware aur sandbox, first-match rules, default allow, aur inspection par dependency ke saath. Phir non-web traffic ke liye cloud firewall jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stages ka order lagbhag har result samjha deta hai.</li>
<li>Inspection path rules, DLP aur sandbox ka gate hai.</li>
<li>Skip rules pinned apps theek karte hain lekin blind spots banate hain.</li>
<li>Position rule ka result decide karti hai.</li>
<li>Positive aur negative test se verify karo.</li>
</ul></div>
`}};export{e as default};