var e={id:`tshoot`,h:{en:`Troubleshooting workflow: SOC triage and failing API scripts`,hi:`Troubleshooting workflow: SOC triage aur fail hoti API scripts`},body:{en:`
<p>A good mechanic does not replace random parts. They ask what the symptom is, check the simplest cause first, test one thing at a time and write down what they did. Security operations work the same way. This chapter gives you two repeatable workflows: one for the Monday-morning <b>triage</b> of findings and reported mail, and one for an <b>automation script</b> that suddenly fails.</p>

<h3>Workflow A: triage a queue</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Triage workflow">
<rect x="10" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 Collect</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">facts, not scores</text>
<rect x="137" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="192" y="45" text-anchor="middle" class="svg-ink" font-size="13">2 Score</text><text x="192" y="63" text-anchor="middle" class="svg-muted" font-size="12">CVSS, OWASP</text>
<rect x="264" y="20" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="319" y="45" text-anchor="middle" class="svg-ink" font-size="13">3 Context</text><text x="319" y="63" text-anchor="middle" class="svg-muted" font-size="12">KEV, EPSS, exposure</text>
<rect x="391" y="20" width="110" height="56" rx="8" fill="#fed7aa"/><text x="446" y="45" text-anchor="middle" class="svg-ink" font-size="13">4 Act</text><text x="446" y="63" text-anchor="middle" class="svg-muted" font-size="12">P1, ticket, purge</text>
<rect x="518" y="20" width="112" height="56" rx="8" fill="#bbf7d0"/><text x="574" y="45" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text><text x="574" y="63" text-anchor="middle" class="svg-muted" font-size="12">rescan, logs</text>
<line x1="120" y1="48" x2="137" y2="48" stroke="#64748b" stroke-width="2"/><line x1="247" y1="48" x2="264" y2="48" stroke="#64748b" stroke-width="2"/><line x1="374" y1="48" x2="391" y2="48" stroke="#64748b" stroke-width="2"/><line x1="501" y1="48" x2="518" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">Document each decision in the ticket so the next shift can follow it</text>
</svg><p class="cap">The same five steps work for a vulnerability and for a reported e-mail.</p></div>

<p><b>Walking the lab "Vulnerability prioritisation and phishing triage".</b> Open VULN-MGMT from the ANALYST PC.</p>
<ol>
<li><b>Score the unscored finding.</b> Findings tab, VUL-103 shows "not scored". Click <b>Open in calculator</b> and check the metrics match <code>AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N</code>. The calculator shows <b>8.1 High</b> (Impact 5.2, Exploitability 2.8). Answer 8.1.</li>
<li><b>Classify.</b> User input changes a database query: <b>A03:2021 Injection</b>.</li>
<li><b>Prioritise.</b> Compare the table:
<pre class="out">ID       CVE             Asset       Exposure                    CVSS          EPSS  KEV
<span class="hl">VUL-101  CVE-2026-20417  vpn-gw-01   Internet-facing             9.8 Critical  0.94  Yes</span>
VUL-102  CVE-2021-44228  ci-02       Internal (no inbound ...)   10.0 Critical 0.97  Yes
VUL-103  CVE-2026-31022  hr-portal   Internet-facing             not scored    0.31  No
VUL-104  CVE-2026-28841  print-01    Internal                    7.8 High      0.02  No
VUL-105  CVE-2026-27733  wiki-01     Internal                    5.4 Medium    0.04  No</pre>
Set VUL-101 to <b>P1</b> and click <b>Create remediation ticket</b> (CHG-5100, due 48 hours). Set VUL-102 to <b>P2</b>. Leave VUL-104 at P3 or P4. If the check fails, the usual cause is that the ticket was not created, or P1 was given to VUL-102 because of its 10.0.</li>
<li><b>Triage mail.</b> Reported Phishing tab, PH-7781: From <code>payroll@nwkings-payro11.example</code>, Reply-To on fastmail-drop.example, <code>spf=fail</code>, <code>dkim=none</code>, <code>dmarc=fail</code>. Answer the domain <b>nwkings-payro11.example</b>.</li>
<li><b>Act.</b> PH-7781: <b>Phishing: purge from all mailboxes and block sender domain</b>. PH-7782: <b>Legitimate</b> (all three checks pass for cloudbox.example). Confirm the line "Blocked sender domains: nwkings-payro11.example".</li>
</ol>

<h3>Workflow B: a security API script fails</h3>
<p>Read the error from the bottom up, then map it to a layer: network, TLS, authentication, authorisation, request, rate, or your own code.</p>
<table class="cmp"><tr><th>Symptom</th><th>Meaning</th><th>First check</th></tr>
<tr><td><code>ConnectionError ... Failed to establish a new connection</code></td><td>No TCP/TLS path to the API</td><td>DNS, default gateway, proxy, firewall to port 443</td></tr>
<tr><td><code>SSLError: certificate verify failed</code></td><td>TLS inspection or private CA</td><td>Install the CA bundle; do not just set verify=False</td></tr>
<tr><td>400 Bad Request</td><td>Body or parameters invalid</td><td>JSON shape (list vs object), field names, <code>json=</code> vs <code>data=</code></td></tr>
<tr><td>401 Unauthorized</td><td>Not authenticated</td><td>Token expired, key or secret rotated, wrong header name</td></tr>
<tr><td>403 Forbidden</td><td>Authenticated but not allowed</td><td>API key scope or role (read-only key trying to write)</td></tr>
<tr><td>404 Not Found</td><td>Wrong path or object ID</td><td>List ID, domain UUID, API version in the path</td></tr>
<tr><td>409 Conflict</td><td>Object already exists or is locked</td><td>Duplicate name, concurrent change</td></tr>
<tr><td>429 Too Many Requests</td><td>Rate limited</td><td>Honour Retry-After, add back-off, batch requests (FMC allows 120 per minute)</td></tr>
<tr><td>5xx</td><td>Server-side problem</td><td>Retry later, check the service status page</td></tr>
<tr><td><code>KeyError: 'access_token'</code></td><td>Your code expected a key the JSON does not have</td><td>Print <code>r.status_code</code> and <code>r.text</code>; the call probably failed</td></tr>
</table>

<div class="eg"><p><b>Worked example: three failures of sa_block_domain.py.</b></p>
<pre class="out">AUTOMATION&gt; python3 sa_block_domain.py k7x2qvz9lm.example
Traceback (most recent call last):
  File "sa_block_domain.py", line 20, in get_token
<span class="hl">requests.exceptions.ConnectionError: HTTPSConnectionPool(host='api.sse.cisco.com', port=443): Max retries exceeded (Failed to establish a new connection)</span></pre>
<p>The failure is in <b>get_token</b>, before any API logic: the host cannot reach the API. Check the AUTOMATION host's IP 198.51.100.40/24, gateway 198.51.100.1 and the path through the ISP.</p>
<pre class="out">POST .../destinationlists/17749231/destinations -&gt; <span class="hl">404</span>
{'message': 'Destination list 17749231 not found'}</pre>
<p>Authentication worked; the <b>list ID</b> is wrong or the list was deleted. Run <code>sa_list_destlists.py</code> and compare IDs.</p>
<pre class="out">POST /policies/v2/destinationlists/17749231/destinations -&gt; <span class="hl">401</span>
{"message": "Unauthorized: invalid or expired token"}</pre>
<p>Authentication problem: a token cached from yesterday, or the API key was rotated. Get a fresh token; if that fails, check the key and secret in the environment.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once. "Fixing" a certificate error with <code>verify=False</code> permanently. Retrying a 429 in a tight loop, which extends the block. Treating 401 and 403 as the same problem.</p></div>

<div class="exam"><p><b>Exam traps.</b> 401 = <b>who are you?</b> (authentication); 403 = <b>you may not</b> (authorisation). 404 on a correct path usually means the <b>object ID</b> is wrong. 201 Created and 204 No Content are successes too. A traceback ending in ConnectionError is a network problem, not an API error.</p></div>

<div class="scn"><h4>The nightly job that stopped on the first of the month</h4><p>A script that added threat-intel domains to a Secure Access list every night began failing with 401 on the first day of a month. Nothing in the code had changed. The engineer ran the token script alone: it also returned 401. The security team had rotated API keys the evening before as part of a monthly policy, and the job's environment variables still held the old secret. The fix was to store the key in the vault the rotation process updates, and to alert on the first 401 instead of silently failing for a week.</p><p><b>Lesson:</b> test the token step on its own; a 401 on everything means credentials, not the request.</p></div>

<div class="iv"><p class="q">"Your automation script returns 403. What do you do?"</p><p>Explain that 403 means the request was authenticated but the identity lacks permission. Check the API key's scope or role (for example read-only versus read-write on destination lists), the tenant or domain the key belongs to, and whether the object is protected. Contrast with 401 (bad or expired credentials) and 404 (wrong ID). Mention least privilege: request only the scope the job needs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triage workflow: collect, score, add context, act, verify, and document in the ticket.</li>
<li>Lab 1 answers: 8.1; A03 Injection; VUL-101 P1 with ticket, VUL-102 P2; nwkings-payro11.example phishing and blocked; PH-7782 legitimate.</li>
<li>API errors map to layers: ConnectionError network, SSLError TLS, 401 authentication, 403 authorisation, 404 ID or path, 400 body, 429 rate.</li>
<li>Test the token call alone; print status and body before trusting the JSON.</li>
<li>Change one thing at a time and never leave verify=False as the fix.</li>
</ul></div>
`,hi:`
<p>Achha mechanic random parts nahi badalta. Woh poochta hai symptom kya hai, pehle sabse simple cause check karta hai, ek baar mein ek cheez test karta hai aur likhta hai usne kya kiya. Security operations bhi aise hi kaam karte hain. Yeh chapter aapko do repeatable workflows deta hai: ek Monday subah ke findings aur reported mail ke <b>triage</b> ke liye, aur ek us <b>automation script</b> ke liye jo achanak fail ho jaaye.</p>

<h3>Workflow A: queue triage karna</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Triage workflow">
<rect x="10" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 Collect</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">facts, scores nahi</text>
<rect x="137" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="192" y="45" text-anchor="middle" class="svg-ink" font-size="13">2 Score</text><text x="192" y="63" text-anchor="middle" class="svg-muted" font-size="12">CVSS, OWASP</text>
<rect x="264" y="20" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="319" y="45" text-anchor="middle" class="svg-ink" font-size="13">3 Context</text><text x="319" y="63" text-anchor="middle" class="svg-muted" font-size="12">KEV, EPSS, exposure</text>
<rect x="391" y="20" width="110" height="56" rx="8" fill="#fed7aa"/><text x="446" y="45" text-anchor="middle" class="svg-ink" font-size="13">4 Act</text><text x="446" y="63" text-anchor="middle" class="svg-muted" font-size="12">P1, ticket, purge</text>
<rect x="518" y="20" width="112" height="56" rx="8" fill="#bbf7d0"/><text x="574" y="45" text-anchor="middle" class="svg-ink" font-size="13">5 Verify</text><text x="574" y="63" text-anchor="middle" class="svg-muted" font-size="12">rescan, logs</text>
<line x1="120" y1="48" x2="137" y2="48" stroke="#64748b" stroke-width="2"/><line x1="247" y1="48" x2="264" y2="48" stroke="#64748b" stroke-width="2"/><line x1="374" y1="48" x2="391" y2="48" stroke="#64748b" stroke-width="2"/><line x1="501" y1="48" x2="518" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">Har decision ticket mein likho taaki agli shift follow kar sake</text>
</svg><p class="cap">Wahi paanch steps vulnerability aur reported e-mail dono ke liye kaam karte hain.</p></div>

<p><b>Lab "Vulnerability prioritisation and phishing triage" ka walk-through.</b> ANALYST PC se VULN-MGMT kholo.</p>
<ol>
<li><b>Unscored finding ko score karo.</b> Findings tab mein VUL-103 "not scored" dikhata hai. <b>Open in calculator</b> click karo aur check karo metrics <code>AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N</code> se match karein. Calculator <b>8.1 High</b> dikhata hai (Impact 5.2, Exploitability 2.8). Jawab 8.1.</li>
<li><b>Classify karo.</b> User input database query badal deta hai: <b>A03:2021 Injection</b>.</li>
<li><b>Prioritise karo.</b> Table compare karo:
<pre class="out">ID       CVE             Asset       Exposure                    CVSS          EPSS  KEV
<span class="hl">VUL-101  CVE-2026-20417  vpn-gw-01   Internet-facing             9.8 Critical  0.94  Yes</span>
VUL-102  CVE-2021-44228  ci-02       Internal (no inbound ...)   10.0 Critical 0.97  Yes
VUL-103  CVE-2026-31022  hr-portal   Internet-facing             not scored    0.31  No
VUL-104  CVE-2026-28841  print-01    Internal                    7.8 High      0.02  No
VUL-105  CVE-2026-27733  wiki-01     Internal                    5.4 Medium    0.04  No</pre>
VUL-101 ko <b>P1</b> set karo aur <b>Create remediation ticket</b> click karo (CHG-5100, due 48 hours). VUL-102 ko <b>P2</b> set karo. VUL-104 ko P3 ya P4 par chhodo. Agar check fail ho, to aam wajah hai ki ticket nahi bana, ya 10.0 ki wajah se P1 VUL-102 ko de diya.</li>
<li><b>Mail triage karo.</b> Reported Phishing tab, PH-7781: From <code>payroll@nwkings-payro11.example</code>, Reply-To fastmail-drop.example par, <code>spf=fail</code>, <code>dkim=none</code>, <code>dmarc=fail</code>. Jawab mein domain <b>nwkings-payro11.example</b> likho.</li>
<li><b>Action lo.</b> PH-7781: <b>Phishing: purge from all mailboxes and block sender domain</b>. PH-7782: <b>Legitimate</b> (cloudbox.example ke liye teeno checks pass). Line "Blocked sender domains: nwkings-payro11.example" confirm karo.</li>
</ol>

<h3>Workflow B: security API script fail hoti hai</h3>
<p>Error neeche se upar padho, phir use ek layer se map karo: network, TLS, authentication, authorisation, request, rate, ya aapka apna code.</p>
<table class="cmp"><tr><th>Symptom</th><th>Matlab</th><th>Pehla check</th></tr>
<tr><td><code>ConnectionError ... Failed to establish a new connection</code></td><td>API tak TCP/TLS raasta nahi</td><td>DNS, default gateway, proxy, port 443 tak firewall</td></tr>
<tr><td><code>SSLError: certificate verify failed</code></td><td>TLS inspection ya private CA</td><td>CA bundle install karo; bas verify=False mat karo</td></tr>
<tr><td>400 Bad Request</td><td>Body ya parameters invalid</td><td>JSON shape (list vs object), field names, <code>json=</code> vs <code>data=</code></td></tr>
<tr><td>401 Unauthorized</td><td>Authenticated nahi</td><td>Token expired, key ya secret rotate hua, galat header naam</td></tr>
<tr><td>403 Forbidden</td><td>Authenticated par allowed nahi</td><td>API key scope ya role (read-only key likhne ki koshish kar rahi)</td></tr>
<tr><td>404 Not Found</td><td>Galat path ya object ID</td><td>List ID, domain UUID, path mein API version</td></tr>
<tr><td>409 Conflict</td><td>Object pehle se hai ya locked hai</td><td>Duplicate naam, saath-saath change</td></tr>
<tr><td>429 Too Many Requests</td><td>Rate limited</td><td>Retry-After maano, back-off jodo, requests batch karo (FMC 120 per minute allow karta hai)</td></tr>
<tr><td>5xx</td><td>Server-side problem</td><td>Baad mein retry, service status page check</td></tr>
<tr><td><code>KeyError: 'access_token'</code></td><td>Aapke code ne woh key expect ki jo JSON mein nahi</td><td><code>r.status_code</code> aur <code>r.text</code> print karo; call shayad fail hui</td></tr>
</table>

<div class="eg"><p><b>Worked example: sa_block_domain.py ke teen failures.</b></p>
<pre class="out">AUTOMATION&gt; python3 sa_block_domain.py k7x2qvz9lm.example
Traceback (most recent call last):
  File "sa_block_domain.py", line 20, in get_token
<span class="hl">requests.exceptions.ConnectionError: HTTPSConnectionPool(host='api.sse.cisco.com', port=443): Max retries exceeded (Failed to establish a new connection)</span></pre>
<p>Failure <b>get_token</b> mein hai, kisi bhi API logic se pehle: host API tak nahi pahunch pa raha. AUTOMATION host ka IP 198.51.100.40/24, gateway 198.51.100.1 aur ISP se raasta check karo.</p>
<pre class="out">POST .../destinationlists/17749231/destinations -&gt; <span class="hl">404</span>
{'message': 'Destination list 17749231 not found'}</pre>
<p>Authentication chala; <b>list ID</b> galat hai ya list delete ho gayi. <code>sa_list_destlists.py</code> chalao aur IDs compare karo.</p>
<pre class="out">POST /policies/v2/destinationlists/17749231/destinations -&gt; <span class="hl">401</span>
{"message": "Unauthorized: invalid or expired token"}</pre>
<p>Authentication problem: kal se cached token, ya API key rotate hui. Naya token lo; woh bhi fail ho to environment mein key aur secret check karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath teen cheezein badalna. Certificate error ko hamesha ke liye <code>verify=False</code> se "fix" karna. 429 ko tight loop mein retry karna, jisse block lamba ho jaata hai. 401 aur 403 ko same problem maanna.</p></div>

<div class="exam"><p><b>Exam traps.</b> 401 = <b>aap kaun ho?</b> (authentication); 403 = <b>aap nahi kar sakte</b> (authorisation). Sahi path par 404 ka matlab aam taur par <b>object ID</b> galat hai. 201 Created aur 204 No Content bhi success hain. ConnectionError par khatam hone wala traceback network problem hai, API error nahi.</p></div>

<div class="scn"><h4>Nightly job jo mahine ki pehli tareekh ko ruk gayi</h4><p>Ek script jo har raat threat-intel domains Secure Access list mein jodti thi, mahine ki pehli tareekh ko 401 ke saath fail hone lagi. Code mein kuch nahi badla tha. Engineer ne token script akeli chalayi: woh bhi 401 de rahi thi. Security team ne monthly policy ke tahat pichhli shaam API keys rotate ki thi, aur job ke environment variables mein abhi bhi purana secret tha. Fix tha key ko us vault mein rakhna jise rotation process update karta hai, aur ek hafte chupchaap fail hone ki jagah pehle 401 par alert karna.</p><p><b>Seekh:</b> token step akele test karo; har cheez par 401 ka matlab credentials, request nahi.</p></div>

<div class="iv"><p class="q">"Aapki automation script 403 lautati hai. Kya karoge?"</p><p>Samjhao ki 403 ka matlab request authenticated thi par identity ke paas permission nahi. API key ka scope ya role check karo (jaise destination lists par read-only vs read-write), key kis tenant ya domain ki hai, aur object protected hai ya nahi. 401 (kharaab ya expired credentials) aur 404 (galat ID) se contrast karo. Least privilege mention karo: sirf woh scope maango jo job ko chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triage workflow: collect, score, context jodo, act, verify, aur ticket mein document karo.</li>
<li>Lab 1 answers: 8.1; A03 Injection; VUL-101 P1 ticket ke saath, VUL-102 P2; nwkings-payro11.example phishing aur blocked; PH-7782 legitimate.</li>
<li>API errors layers se map hote hain: ConnectionError network, SSLError TLS, 401 authentication, 403 authorisation, 404 ID ya path, 400 body, 429 rate.</li>
<li>Token call akele test karo; JSON par bharosa karne se pehle status aur body print karo.</li>
<li>Ek baar mein ek cheez badlo aur verify=False ko kabhi fix mat maano.</li>
</ul></div>
`}};export{e as default};