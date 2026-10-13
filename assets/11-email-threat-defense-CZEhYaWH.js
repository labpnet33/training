var e={id:`email-threat-defense`,h:{en:`Secure Email Threat Defense: search and remediate (Lab d)`,hi:`Secure Email Threat Defense: search aur remediate (Lab d)`},body:{en:`
<p>A gateway is a security guard at the front gate: once a parcel is through the gate and on someone's desk, the guard cannot touch it. Imagine instead a cleaner who has a key to every office, reads the post after it is delivered, and when head office calls to say "that parcel from Payroll Services is a fake", walks into every office and removes it from every desk. That cleaner is <b>Secure Email Threat Defense</b>: it works inside the mailboxes, after delivery, and can take mail back.</p>

<h3>How Email Threat Defense connects</h3>
<p>Cisco Secure Email Threat Defense is a cloud service built for Microsoft 365. Instead of changing MX records, it integrates through the Microsoft 365 API and receives a copy of messages (through a journal rule) to analyse. It can work alongside a gateway or on its own.</p>
<ul>
<li><b>Visibility</b>: every inbound, outbound and internal message is analysed and given a verdict.</li>
<li><b>Remediation</b>: with read/write permission granted to the Microsoft 365 tenant, it can move messages between folders in users' mailboxes, manually or automatically.</li>
<li><b>Retrospective verdicts</b>: if intelligence about a URL, attachment or sender changes after delivery, the verdict is updated and the configured action can run on mail that is already in inboxes.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Email Threat Defense with Microsoft 365">
<rect x="20" y="85" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="107" text-anchor="middle" class="svg-ink" font-size="13">Internet mail</text><text x="80" y="125" text-anchor="middle" class="svg-muted" font-size="12">attacker, partners</text>
<rect x="200" y="85" width="160" height="50" rx="8" fill="#bae6fd"/><text x="280" y="107" text-anchor="middle" class="svg-ink" font-size="13">Microsoft 365</text><text x="280" y="125" text-anchor="middle" class="svg-muted" font-size="12">user mailboxes</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Email Threat Defense</text><text x="525" y="60" text-anchor="middle" class="svg-muted" font-size="12">verdicts, search</text>
<rect x="430" y="150" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="13">Talos, ML, sandbox</text><text x="525" y="190" text-anchor="middle" class="svg-muted" font-size="12">intent and content</text>
<line x1="140" y1="110" x2="200" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="95" x2="430" y2="45" stroke="#64748b" stroke-width="2"/><text x="380" y="62" class="svg-muted" font-size="12">journal copy</text>
<line x1="430" y1="58" x2="360" y2="120" stroke="#64748b" stroke-dasharray="4 4"/><text x="372" y="150" class="svg-accent" font-size="12">API: move to Quarantine</text>
<line x1="525" y1="70" x2="525" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Mail is analysed from a journal copy; remediation acts in the mailbox through the API.</p></div>

<h3>Verdicts</h3>
<table class="cmp"><tr><th>Verdict</th><th>Meaning</th></tr>
<tr><td><b>BEC</b></td><td>Impersonation that asks for money, data or a change, usually without links or files</td></tr>
<tr><td><b>Scam</b></td><td>Fraud such as fake invoices, lottery or advance-fee messages</td></tr>
<tr><td><b>Phishing</b></td><td>Tries to steal credentials or get a click, often a fake login page</td></tr>
<tr><td><b>Malicious</b></td><td>Contains a malicious attachment or URL</td></tr>
<tr><td><b>Spam / Graymail</b></td><td>Unwanted bulk mail / legitimate marketing</td></tr>
<tr><td><b>Neutral (clean)</b></td><td>No threat found</td></tr>
</table>
<p>Behind each verdict is a list of <b>techniques</b> and indicators the engines found, for example a lookalike sender domain, urgency language, a credential-harvesting URL, or a first-time sender to this recipient. Natural-language analysis is what lets it catch BEC, where there is nothing technical to scan.</p>

<h3>Message search and remediation</h3>
<p>Message Search filters by sender, recipient, subject, verdict, direction and time. From the results you can open a message's details and take action: <b>Move to Quarantine</b>, <b>Move to Junk</b>, <b>Move to Trash</b>, or move a wrongly flagged message back to the Inbox. Policy can also <b>auto-remediate</b> by verdict, for example "Phishing and Malicious → Quarantine, BEC and Scam → Junk".</p>

<h3>Lab (d) walkthrough: INC-9330, the fake payroll update</h3>
<p>Open Email Threat Defense → Message Search. The view shows:</p>
<pre class="out">ID  From                   To               Subject                           Verdict   Folder
<span class="hl">M1  payroll@nwk-secure.co  ravi@nwk.lab     Action required: payroll update   Phishing  inbox</span>
<span class="hl">M2  payroll@nwk-secure.co  sana@nwk.lab     Action required: payroll update   Phishing  inbox</span>
M3  hr@nwk.lab             all@nwk.lab      Team lunch Friday                 Clean     inbox
<span class="hl">M4  payroll@nwk-secure.co  amit@nwk.lab     Action required: payroll update   Phishing  inbox</span>
M5  ceo@nwk.lab            finance@nwk.lab  Wire transfer request             BEC       inbox</pre>
<p><b>Task 1:</b> count the rows with verdict Phishing: <b>3</b> (M1, M2, M4). M5 is BEC, a different verdict and a different case; M3 is clean.</p>
<p><b>Task 2:</b> remediate each phishing message.</p>
<pre class="code"><span class="c">! Email Threat Defense console</span>
Message Search &gt; select M1 &gt; Move to Quarantine
Message Search &gt; select M2 &gt; Move to Quarantine
Message Search &gt; select M4 &gt; Move to Quarantine
<span class="c">! M3 (Clean) stays in the inbox</span></pre>
<pre class="out">ID  Verdict   Folder       Remediated
<span class="hl">M1  Phishing  quarantine   yes</span>
<span class="hl">M2  Phishing  quarantine   yes</span>
M3  Clean     inbox        no
<span class="hl">M4  Phishing  quarantine   yes</span>
M5  BEC       inbox        no</pre>
<p><b>Task 3:</b> confirm M3 is untouched. Remediating clean mail is a false positive that erodes user trust. M5 should be handled as its own BEC incident: verify with the finance team by phone, check whether the CEO account itself is compromised, then remediate. It is outside this ticket's scope.</p>

<div class="eg"><p><b>Worked example: from email to endpoint.</b> In lab (c), patient zero ran <code>invoice_2026.exe</code> with parent <code>outlook.exe</code> at 09:01:04. Searching Email Threat Defense for messages to that user with an attachment named <code>invoice_2026.exe</code> or matching its SHA-256 finds 9 copies of the delivering email across 9 mailboxes. Moving all 9 to Quarantine stops the next 6 users from opening it, and the SHA-256 goes into a Simple Custom Detection so any copy already saved to disk is quarantined retrospectively. One incident, two layers, one IOC.</p></div>

<div class="warn"><p><b>Common mistake.</b> Remediating by subject line alone. Attackers reuse innocent-looking subjects, and an internal "payroll update" from HR may be real. Filter on sender and verdict (and verify the domain) before moving mail.</p></div>

<div class="exam"><p><b>Exam trap.</b> A gateway acts <b>before</b> delivery in the SMTP path. Email Threat Defense acts <b>after</b> delivery through the Microsoft 365 API, which is why it can remediate retrospectively. Remediation requires read/write access; read-only mode gives visibility only.</p></div>

<div class="scn"><h4>Clean at 08:00, phishing at 08:40</h4><p>A campaign used a link to a page that was harmless when the mail was delivered at 08:00 and turned into a credential-harvesting page at 08:30. Email Threat Defense rescanned the URL, changed 212 messages to Phishing at 08:40 and, because auto-remediation was set for Phishing, moved them all to Quarantine. Three users had already clicked; their sessions were revoked and passwords reset, guided by the click data.</p><p><b>Lesson:</b> verdicts can change after delivery; retrospective remediation is the email equivalent of endpoint retrospection.</p></div>

<div class="iv"><p class="q">"How is Secure Email Threat Defense different from a secure email gateway?"</p><p>Strong answer: the gateway is in the SMTP path as the MX and filters before delivery (reputation, authentication, anti-spam, AV, content, DLP, encryption). Email Threat Defense connects to Microsoft 365 by API, analyses every message including internal mail, uses AI to detect BEC and phishing, and can remediate messages already in mailboxes, manually or automatically, including after a verdict changes. Many organisations use both.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Email Threat Defense integrates with Microsoft 365 by API and journaling, not by MX change.</li>
<li>Verdicts: BEC, Scam, Phishing, Malicious, Spam, Graymail, Neutral.</li>
<li>Remediation actions: Move to Quarantine, Junk or Trash (or back to Inbox); can be automatic per verdict.</li>
<li>Lab (d): 3 Phishing messages (M1, M2, M4) moved to Quarantine; M3 Clean untouched; M5 BEC is a separate case.</li>
<li>Retrospective remediation pulls mail back when a verdict changes after delivery.</li>
</ul></div>
`,hi:`
<p>Gateway front gate par security guard hai: jab parcel gate se nikalkar kisi ki desk par pahunch gaya, guard use chhu nahi sakta. Iski jagah ek cleaner socho jiske paas har office ki chaabi hai, jo delivery ke baad post padhta hai, aur jab head office phone karke kehta hai "Payroll Services wala parcel nakli hai", to har office mein jaakar har desk se use hata deta hai. Woh cleaner <b>Secure Email Threat Defense</b> hai: yeh mailboxes ke andar, delivery ke baad kaam karta hai, aur mail wapas le sakta hai.</p>

<h3>Email Threat Defense kaise judta hai</h3>
<p>Cisco Secure Email Threat Defense Microsoft 365 ke liye bani cloud service hai. MX records badalne ki jagah, yeh Microsoft 365 API ke through integrate hoti hai aur analyse karne ke liye messages ki copy (journal rule ke through) leti hai. Yeh gateway ke saath ya akele kaam kar sakti hai.</p>
<ul>
<li><b>Visibility</b>: har inbound, outbound aur internal message analyse hota hai aur use verdict milta hai.</li>
<li><b>Remediation</b>: Microsoft 365 tenant ko di gayi read/write permission ke saath, yeh users ke mailboxes mein messages ko folders ke beech move kar sakti hai, manually ya automatically.</li>
<li><b>Retrospective verdicts</b>: agar delivery ke baad kisi URL, attachment ya sender ki intelligence badalti hai, to verdict update hota hai aur configured action pehle se inbox mein pade mail par chal sakta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Microsoft 365 ke saath Email Threat Defense">
<rect x="20" y="85" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="107" text-anchor="middle" class="svg-ink" font-size="13">Internet mail</text><text x="80" y="125" text-anchor="middle" class="svg-muted" font-size="12">attacker, partners</text>
<rect x="200" y="85" width="160" height="50" rx="8" fill="#bae6fd"/><text x="280" y="107" text-anchor="middle" class="svg-ink" font-size="13">Microsoft 365</text><text x="280" y="125" text-anchor="middle" class="svg-muted" font-size="12">user mailboxes</text>
<rect x="430" y="20" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Email Threat Defense</text><text x="525" y="60" text-anchor="middle" class="svg-muted" font-size="12">verdicts, search</text>
<rect x="430" y="150" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="13">Talos, ML, sandbox</text><text x="525" y="190" text-anchor="middle" class="svg-muted" font-size="12">intent aur content</text>
<line x1="140" y1="110" x2="200" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="95" x2="430" y2="45" stroke="#64748b" stroke-width="2"/><text x="380" y="62" class="svg-muted" font-size="12">journal copy</text>
<line x1="430" y1="58" x2="360" y2="120" stroke="#64748b" stroke-dasharray="4 4"/><text x="372" y="150" class="svg-accent" font-size="12">API: Quarantine mein move</text>
<line x1="525" y1="70" x2="525" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Mail journal copy se analyse hota hai; remediation API ke through mailbox mein act karta hai.</p></div>

<h3>Verdicts</h3>
<table class="cmp"><tr><th>Verdict</th><th>Matlab</th></tr>
<tr><td><b>BEC</b></td><td>Nakal jo paisa, data ya koi change maangti hai, aam taur par bina links ya files</td></tr>
<tr><td><b>Scam</b></td><td>Fraud jaise nakli invoices, lottery ya advance-fee messages</td></tr>
<tr><td><b>Phishing</b></td><td>Credentials churane ya click karwane ki koshish, aksar nakli login page</td></tr>
<tr><td><b>Malicious</b></td><td>Malicious attachment ya URL hai</td></tr>
<tr><td><b>Spam / Graymail</b></td><td>Anchaha bulk mail / legitimate marketing</td></tr>
<tr><td><b>Neutral (clean)</b></td><td>Koi threat nahi mila</td></tr>
</table>
<p>Har verdict ke peeche <b>techniques</b> aur indicators ki list hoti hai jo engines ne paayi, jaise lookalike sender domain, urgency wali bhasha, credential-harvesting URL, ya is recipient ko pehli baar likhne wala sender. Natural-language analysis hi ise BEC pakadne deta hai, jahan scan karne ko kuch technical hota hi nahi.</p>

<h3>Message search aur remediation</h3>
<p>Message Search sender, recipient, subject, verdict, direction aur time se filter karta hai. Results se aap message ki details khol kar action le sakte ho: <b>Move to Quarantine</b>, <b>Move to Junk</b>, <b>Move to Trash</b>, ya galat flag hue message ko wapas Inbox mein. Policy verdict ke hisaab se <b>auto-remediate</b> bhi kar sakti hai, jaise "Phishing aur Malicious → Quarantine, BEC aur Scam → Junk".</p>

<h3>Lab (d) walkthrough: INC-9330, nakli payroll update</h3>
<p>Email Threat Defense → Message Search kholo. View dikhata hai:</p>
<pre class="out">ID  From                   To               Subject                           Verdict   Folder
<span class="hl">M1  payroll@nwk-secure.co  ravi@nwk.lab     Action required: payroll update   Phishing  inbox</span>
<span class="hl">M2  payroll@nwk-secure.co  sana@nwk.lab     Action required: payroll update   Phishing  inbox</span>
M3  hr@nwk.lab             all@nwk.lab      Team lunch Friday                 Clean     inbox
<span class="hl">M4  payroll@nwk-secure.co  amit@nwk.lab     Action required: payroll update   Phishing  inbox</span>
M5  ceo@nwk.lab            finance@nwk.lab  Wire transfer request             BEC       inbox</pre>
<p><b>Task 1:</b> Phishing verdict wali rows gino: <b>3</b> (M1, M2, M4). M5 BEC hai, alag verdict aur alag case; M3 clean hai.</p>
<p><b>Task 2:</b> har phishing message remediate karo.</p>
<pre class="code"><span class="c">! Email Threat Defense console</span>
Message Search &gt; select M1 &gt; Move to Quarantine
Message Search &gt; select M2 &gt; Move to Quarantine
Message Search &gt; select M4 &gt; Move to Quarantine
<span class="c">! M3 (Clean) inbox mein hi rehta hai</span></pre>
<pre class="out">ID  Verdict   Folder       Remediated
<span class="hl">M1  Phishing  quarantine   yes</span>
<span class="hl">M2  Phishing  quarantine   yes</span>
M3  Clean     inbox        no
<span class="hl">M4  Phishing  quarantine   yes</span>
M5  BEC       inbox        no</pre>
<p><b>Task 3:</b> confirm karo ki M3 ko chhua nahi gaya. Clean mail remediate karna false positive hai jo user trust ghatata hai. M5 ko apne alag BEC incident ki tarah handle karna chahiye: finance team se phone par verify karo, check karo ki kahin CEO ka account hi to compromise nahi hua, phir remediate karo. Yeh is ticket ke scope se bahar hai.</p>

<div class="eg"><p><b>Worked example: email se endpoint tak.</b> Lab (c) mein patient zero ne 09:01:04 par parent <code>outlook.exe</code> ke saath <code>invoice_2026.exe</code> chalayi. Email Threat Defense mein us user ko gaye messages search karna jinmein <code>invoice_2026.exe</code> naam ka attachment ho ya uske SHA-256 se match kare, 9 mailboxes mein delivering email ki 9 copies dhoondhta hai. Saari 9 ko Quarantine mein move karne se agle 6 users ise kholne se bach jaate hain, aur SHA-256 Simple Custom Detection mein jaata hai taaki disk par pehle se save koi bhi copy retrospectively quarantine ho. Ek incident, do layers, ek IOC.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf subject line se remediate karna. Attackers masoom dikhne wale subjects reuse karte hain, aur HR se aaya internal "payroll update" asli ho sakta hai. Mail move karne se pehle sender aur verdict par filter karo (aur domain verify karo).</p></div>

<div class="exam"><p><b>Exam trap.</b> Gateway SMTP path mein delivery se <b>pehle</b> act karta hai. Email Threat Defense Microsoft 365 API ke through delivery ke <b>baad</b> act karta hai, isiliye yeh retrospectively remediate kar sakta hai. Remediation ko read/write access chahiye; read-only mode sirf visibility deta hai.</p></div>

<div class="scn"><h4>08:00 par clean, 08:40 par phishing</h4><p>Ek campaign ne aise page ka link use kiya jo 08:00 par mail deliver hote waqt harmless tha aur 08:30 par credential-harvesting page ban gaya. Email Threat Defense ne URL rescan kiya, 08:40 par 212 messages ko Phishing mein badla aur, kyunki Phishing ke liye auto-remediation set tha, sabko Quarantine mein move kar diya. Teen users pehle hi click kar chuke the; click data ki madad se unke sessions revoke aur passwords reset hue.</p><p><b>Seekh:</b> verdicts delivery ke baad badal sakte hain; retrospective remediation endpoint retrospection ka email wala roop hai.</p></div>

<div class="iv"><p class="q">"Secure Email Threat Defense secure email gateway se kaise alag hai?"</p><p>Strong answer: gateway MX ki tarah SMTP path mein hai aur delivery se pehle filter karta hai (reputation, authentication, anti-spam, AV, content, DLP, encryption). Email Threat Defense Microsoft 365 se API se judta hai, internal mail samet har message analyse karta hai, BEC aur phishing detect karne ke liye AI use karta hai, aur pehle se mailboxes mein pade messages ko manually ya automatically remediate kar sakta hai, verdict badalne ke baad bhi. Kai organisations dono use karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Email Threat Defense Microsoft 365 se API aur journaling se integrate hota hai, MX change se nahi.</li>
<li>Verdicts: BEC, Scam, Phishing, Malicious, Spam, Graymail, Neutral.</li>
<li>Remediation actions: Quarantine, Junk ya Trash mein move (ya wapas Inbox); verdict ke hisaab se automatic ho sakte hain.</li>
<li>Lab (d): 3 Phishing messages (M1, M2, M4) Quarantine mein; M3 Clean ko chhua nahi; M5 BEC alag case hai.</li>
<li>Retrospective remediation delivery ke baad verdict badalne par mail wapas kheenchta hai.</li>
</ul></div>
`}};export{e as default};