var e={id:`email-threats-auth`,h:{en:`Email threats, SPF, DKIM, DMARC and the Secure Email gateway`,hi:`Email threats, SPF, DKIM, DMARC aur Secure Email gateway`},body:{en:`
<p>A letter has two addresses: the one on the envelope that the postman uses, and the one printed on the letterhead inside that the reader sees. A fraudster can write any letterhead he likes. Email is the same, and that is why phishing works. SPF, DKIM and DMARC are the post office's way of checking that a letter claiming to be from your bank really left your bank's post room and was not opened on the way.</p>

<h3>The email threats you must recognise</h3>
<dl class="terms">
<dt>Spam and graymail</dt><dd>Unsolicited bulk mail, and legitimate but unwanted bulk mail (newsletters, marketing).</dd>
<dt>Phishing and spear phishing</dt><dd>Mail that tricks users into clicking a link or opening a file, usually to steal credentials or deliver malware. Spear phishing targets specific people with researched details; whaling targets executives.</dd>
<dt>Business Email Compromise (BEC)</dt><dd>No malware and often no link: a message impersonating an executive or supplier asks for a wire transfer, gift cards or changed bank details. It succeeds on trust and urgency, so content filters looking for attachments miss it.</dd>
<dt>Malicious attachments and URLs</dt><dd>Documents with macros, archives with executables, links to credential-harvesting pages or to downloads.</dd>
<dt>Spoofing and lookalike domains</dt><dd>Forging the visible From address, or registering a near-identical domain such as <code>nwk-secure.co</code> for <code>nwk.lab</code>.</dd>
</dl>

<h3>Two "from" addresses</h3>
<p>SMTP carries the <b>envelope sender</b> (<code>MAIL FROM</code>, also seen later as Return-Path) and the message carries the <b>header From</b> that the mail client displays. They can differ. SPF checks the first; users see the second; DMARC ties them together.</p>

<h3>SPF: is this server allowed to send for the domain?</h3>
<p><b>Sender Policy Framework</b> is a DNS TXT record listing the servers allowed to send mail for a domain. The receiver checks the connecting IP against the record of the envelope sender's domain.</p>
<pre class="code"><span class="c">! DNS TXT record for nwk.example</span>
nwk.example.  TXT  "v=spf1 ip4:198.51.100.25 include:_spf.mailhost.example -all"
<span class="c">! -all = fail anything else, ~all = softfail, ?all = neutral</span></pre>
<p>Results include pass, fail, softfail, neutral, none, permerror and temperror. SPF breaks on plain forwarding (the forwarder's IP is not listed) and is limited to 10 DNS lookups per evaluation.</p>

<h3>DKIM: was the message signed by the domain and unchanged?</h3>
<p><b>DomainKeys Identified Mail</b> adds a digital signature. The sending server hashes the body and selected headers and signs them with its private key; the receiver fetches the public key from DNS using the selector and domain in the signature.</p>
<pre class="code"><span class="c">! signature header added by the sender</span>
DKIM-Signature: v=1; a=rsa-sha256; d=nwk.example; s=sel1; h=from:to:subject:date; bh=...; b=...
<span class="c">! public key published in DNS</span>
sel1._domainkey.nwk.example.  TXT  "v=DKIM1; k=rsa; p=MIIBIjANBgkq..."</pre>
<p>DKIM survives forwarding as long as the signed parts are not modified, and proves integrity, but on its own it does not say anything about the visible From.</p>

<h3>DMARC: alignment, policy and reports</h3>
<p><b>DMARC</b> (Domain-based Message Authentication, Reporting and Conformance) is published by the domain owner and tells receivers what to do when a message claiming that domain in the <b>header From</b> fails. A message passes DMARC if SPF or DKIM passes <b>and</b> the passing domain <b>aligns</b> with the header From domain.</p>
<pre class="code"><span class="c">! DNS TXT record</span>
_dmarc.nwk.example.  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc-rua@nwk.example; adkim=s; aspf=r; pct=100"
<span class="c">! p=none (monitor) | quarantine (junk) | reject (refuse)</span></pre>
<p>The receiver records the results in a header you will read in every phishing investigation:</p>
<pre class="out">Authentication-Results: mx.nwk.example;
       spf=pass smtp.mailfrom=bounce.nwk-secure.co;
       dkim=pass header.d=nwk-secure.co;
<span class="hl">       dmarc=pass header.from=nwk-secure.co</span></pre>
<p>Notice what this proves: the mail genuinely came from <code>nwk-secure.co</code>. It passed everything because the attacker owns that lookalike domain. Authentication stops <b>exact-domain spoofing</b>, not lookalikes; those need reputation, content and AI analysis.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Secure Email gateway pipeline">
<rect x="10" y="70" width="90" height="56" rx="8" fill="#e2e8f0"/><text x="55" y="95" text-anchor="middle" class="svg-ink" font-size="12">Sender</text><text x="55" y="112" text-anchor="middle" class="svg-muted" font-size="12">SMTP</text>
<rect x="115" y="70" width="95" height="56" rx="8" fill="#bae6fd"/><text x="162" y="95" text-anchor="middle" class="svg-ink" font-size="12">Reputation</text><text x="162" y="112" text-anchor="middle" class="svg-muted" font-size="12">SBRS, HAT</text>
<rect x="225" y="70" width="95" height="56" rx="8" fill="#bae6fd"/><text x="272" y="95" text-anchor="middle" class="svg-ink" font-size="12">Auth</text><text x="272" y="112" text-anchor="middle" class="svg-muted" font-size="12">SPF DKIM DMARC</text>
<rect x="335" y="70" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="382" y="95" text-anchor="middle" class="svg-ink" font-size="12">Anti-spam</text><text x="382" y="112" text-anchor="middle" class="svg-muted" font-size="12">AV, malware</text>
<rect x="445" y="70" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="492" y="95" text-anchor="middle" class="svg-ink" font-size="12">Content</text><text x="492" y="112" text-anchor="middle" class="svg-muted" font-size="12">outbreak, DLP</text>
<rect x="555" y="70" width="75" height="56" rx="8" fill="#fde68a"/><text x="592" y="95" text-anchor="middle" class="svg-ink" font-size="12">Mailbox</text><text x="592" y="112" text-anchor="middle" class="svg-muted" font-size="12">TLS</text>
<line x1="100" y1="98" x2="115" y2="98" stroke="#64748b" stroke-width="2"/><line x1="210" y1="98" x2="225" y2="98" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="335" y2="98" stroke="#64748b" stroke-width="2"/><line x1="430" y1="98" x2="445" y2="98" stroke="#64748b" stroke-width="2"/><line x1="540" y1="98" x2="555" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Cheap checks first (connection reputation), expensive checks last (file analysis, content)</text>
</svg><p class="cap">A simplified inbound pipeline of the Cisco Secure Email gateway.</p></div>

<h3>The Secure Email gateway pipeline</h3>
<p>Cisco Secure Email Gateway (formerly ESA, also offered as Cloud Gateway) sits in the SMTP path as the MX for your domain. Inbound, it applies roughly this order:</p>
<ol>
<li><b>Reputation filtering</b>: the <b>SenderBase Reputation Score (SBRS)</b>, from -10 to +10, of the connecting IP decides through the <b>Host Access Table (HAT)</b> whether the connection is blocked, throttled or accepted. Most spam is refused here.</li>
<li><b>Sender authentication</b>: SPF, DKIM and DMARC verification.</li>
<li><b>Anti-spam</b> and <b>antivirus</b> scanning, then <b>file reputation and file analysis</b> (the same Cisco malware intelligence and Secure Malware Analytics sandbox used by Secure Endpoint), plus graymail detection.</li>
<li><b>Content filters</b> (your rules on attachments, keywords, senders) and <b>outbreak filters</b>, which hold or rewrite suspicious URLs during new campaigns before signatures exist.</li>
<li>Outbound: <b>DLP</b> to stop sensitive data leaving, DKIM signing, and <b>encryption</b> with TLS between servers or message-level encryption for sensitive mail.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A mail claims to be from <code>ceo@nwk.example</code> but arrives from 203.0.113.66. SPF for nwk.example lists only 198.51.100.25 with <code>-all</code>: spf=fail. There is no valid DKIM signature for nwk.example: dkim=none. DMARC fails, and with <code>p=reject</code> the receiving gateway refuses it. If the domain had <code>p=none</code>, the same mail would be delivered and only reported.</p></div>

<div class="warn"><p><b>Common mistake.</b> Publishing <code>p=reject</code> on day one. Start with <code>p=none</code> and rua reports, find every legitimate sender (marketing platforms, ticketing systems), fix their SPF and DKIM, then move to quarantine and reject.</p></div>

<div class="exam"><p><b>Exam trap.</b> SPF validates the <b>envelope</b> sender's server; DKIM validates a <b>signature</b>; DMARC requires one of them to pass <b>and align</b> with the <b>header From</b>, and sets the policy. "Which one tells the receiver to reject?" is DMARC.</p></div>

<div class="scn"><h4>The supplier who changed bank details</h4><p>Accounts payable received an email from <code>accounts@supplier-invoices.example</code> asking to update bank details. SPF, DKIM and DMARC all passed. The real supplier used <code>supplier.example</code>. The gateway's anti-spam engine let it through because it contained no link or attachment. Only a call-back to the supplier's known phone number stopped a large payment.</p><p><b>Lesson:</b> authentication proves who sent it, not that the sender is who you think; BEC needs behavioural detection and process controls.</p></div>

<div class="iv"><p class="q">"Explain SPF, DKIM and DMARC and how they work together."</p><p>Strong answer: SPF is a DNS list of servers allowed to send for a domain, checked against the envelope sender. DKIM signs headers and body with a private key whose public key is in DNS, proving the domain and integrity. DMARC requires SPF or DKIM to pass with alignment to the visible From domain, tells receivers to none, quarantine or reject failures, and sends aggregate reports. Add that none of them stop lookalike domains.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threats: spam, phishing, spear phishing, BEC, malicious attachments and URLs, spoofing, lookalikes.</li>
<li>SPF = allowed sending IPs (envelope); DKIM = signature (selector._domainkey); DMARC = alignment + policy + reports.</li>
<li>Authentication stops exact-domain spoofing, not lookalike domains or BEC from real accounts.</li>
<li>Gateway order: reputation (SBRS/HAT), authentication, anti-spam/AV/file analysis, content and outbreak filters, DLP and encryption.</li>
<li>Roll DMARC out from p=none to quarantine to reject.</li>
</ul></div>
`,hi:`
<p>Ek chitthi par do address hote hain: lifaafe wala jise postman use karta hai, aur andar letterhead par chhapa hua jise padhne wala dekhta hai. Fraudster koi bhi letterhead likh sakta hai. Email bhi aisa hi hai, aur isiliye phishing kaam karta hai. SPF, DKIM aur DMARC post office ka tareeka hain yeh check karne ka ki jo chitthi aapke bank ki hone ka daawa karti hai woh sach mein bank ke post room se nikli aur raste mein kholi nahi gayi.</p>

<h3>Email threats jo aapko pehchanne chahiye</h3>
<dl class="terms">
<dt>Spam aur graymail</dt><dd>Bina maange bulk mail, aur legitimate par anchaha bulk mail (newsletters, marketing).</dd>
<dt>Phishing aur spear phishing</dt><dd>Aisa mail jo users ko link click karne ya file kholne ke liye trick karta hai, aam taur par credentials churane ya malware deliver karne ke liye. Spear phishing researched details ke saath specific logon ko target karta hai; whaling executives ko.</dd>
<dt>Business Email Compromise (BEC)</dt><dd>Koi malware nahi aur aksar koi link bhi nahi: executive ya supplier ki nakal karta message wire transfer, gift cards ya badle hue bank details maangta hai. Yeh trust aur urgency par chalta hai, isliye attachments dhoondhne wale content filters ise miss karte hain.</dd>
<dt>Malicious attachments aur URLs</dt><dd>Macros wale documents, executables wale archives, credential-harvesting pages ya downloads ke links.</dd>
<dt>Spoofing aur lookalike domains</dt><dd>Dikhne wala From address forge karna, ya lagbhag same domain register karna jaise <code>nwk.lab</code> ke liye <code>nwk-secure.co</code>.</dd>
</dl>

<h3>Do "from" addresses</h3>
<p>SMTP <b>envelope sender</b> le jaata hai (<code>MAIL FROM</code>, baad mein Return-Path ki tarah bhi dikhta hai) aur message <b>header From</b> le jaata hai jo mail client dikhata hai. Dono alag ho sakte hain. SPF pehle wale ko check karta hai; users doosra dekhte hain; DMARC dono ko jodta hai.</p>

<h3>SPF: kya yeh server domain ke liye bhej sakta hai?</h3>
<p><b>Sender Policy Framework</b> ek DNS TXT record hai jo un servers ki list deta hai jo domain ke liye mail bhej sakte hain. Receiver connect karne wale IP ko envelope sender ke domain ke record se check karta hai.</p>
<pre class="code"><span class="c">! nwk.example ka DNS TXT record</span>
nwk.example.  TXT  "v=spf1 ip4:198.51.100.25 include:_spf.mailhost.example -all"
<span class="c">! -all = baaki sab fail, ~all = softfail, ?all = neutral</span></pre>
<p>Results mein pass, fail, softfail, neutral, none, permerror aur temperror hain. SPF plain forwarding par toot jaata hai (forwarder ka IP list mein nahi hota) aur har evaluation mein 10 DNS lookups tak limited hai.</p>

<h3>DKIM: kya message domain ne sign kiya aur badla nahi?</h3>
<p><b>DomainKeys Identified Mail</b> ek digital signature jodta hai. Sending server body aur chune hue headers ka hash banakar apni private key se sign karta hai; receiver signature mein diye selector aur domain se DNS se public key laata hai.</p>
<pre class="code"><span class="c">! sender ka joda signature header</span>
DKIM-Signature: v=1; a=rsa-sha256; d=nwk.example; s=sel1; h=from:to:subject:date; bh=...; b=...
<span class="c">! DNS mein published public key</span>
sel1._domainkey.nwk.example.  TXT  "v=DKIM1; k=rsa; p=MIIBIjANBgkq..."</pre>
<p>DKIM forwarding mein bach jaata hai jab tak signed parts modify na hon, aur integrity prove karta hai, par akele visible From ke baare mein kuch nahi kehta.</p>

<h3>DMARC: alignment, policy aur reports</h3>
<p><b>DMARC</b> (Domain-based Message Authentication, Reporting and Conformance) domain owner publish karta hai aur receivers ko batata hai ki jab <b>header From</b> mein us domain ka daawa karne wala message fail ho to kya karein. Message DMARC pass karta hai agar SPF ya DKIM pass ho <b>aur</b> pass hone wala domain header From domain se <b>align</b> kare.</p>
<pre class="code"><span class="c">! DNS TXT record</span>
_dmarc.nwk.example.  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc-rua@nwk.example; adkim=s; aspf=r; pct=100"
<span class="c">! p=none (monitor) | quarantine (junk) | reject (refuse)</span></pre>
<p>Receiver results ek header mein record karta hai jo aap har phishing investigation mein padhoge:</p>
<pre class="out">Authentication-Results: mx.nwk.example;
       spf=pass smtp.mailfrom=bounce.nwk-secure.co;
       dkim=pass header.d=nwk-secure.co;
<span class="hl">       dmarc=pass header.from=nwk-secure.co</span></pre>
<p>Dekho yeh kya prove karta hai: mail sach mein <code>nwk-secure.co</code> se aaya. Sab pass hua kyunki attacker us lookalike domain ka maalik hai. Authentication <b>exact-domain spoofing</b> rokta hai, lookalikes nahi; unke liye reputation, content aur AI analysis chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Secure Email gateway pipeline">
<rect x="10" y="70" width="90" height="56" rx="8" fill="#e2e8f0"/><text x="55" y="95" text-anchor="middle" class="svg-ink" font-size="12">Sender</text><text x="55" y="112" text-anchor="middle" class="svg-muted" font-size="12">SMTP</text>
<rect x="115" y="70" width="95" height="56" rx="8" fill="#bae6fd"/><text x="162" y="95" text-anchor="middle" class="svg-ink" font-size="12">Reputation</text><text x="162" y="112" text-anchor="middle" class="svg-muted" font-size="12">SBRS, HAT</text>
<rect x="225" y="70" width="95" height="56" rx="8" fill="#bae6fd"/><text x="272" y="95" text-anchor="middle" class="svg-ink" font-size="12">Auth</text><text x="272" y="112" text-anchor="middle" class="svg-muted" font-size="12">SPF DKIM DMARC</text>
<rect x="335" y="70" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="382" y="95" text-anchor="middle" class="svg-ink" font-size="12">Anti-spam</text><text x="382" y="112" text-anchor="middle" class="svg-muted" font-size="12">AV, malware</text>
<rect x="445" y="70" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="492" y="95" text-anchor="middle" class="svg-ink" font-size="12">Content</text><text x="492" y="112" text-anchor="middle" class="svg-muted" font-size="12">outbreak, DLP</text>
<rect x="555" y="70" width="75" height="56" rx="8" fill="#fde68a"/><text x="592" y="95" text-anchor="middle" class="svg-ink" font-size="12">Mailbox</text><text x="592" y="112" text-anchor="middle" class="svg-muted" font-size="12">TLS</text>
<line x1="100" y1="98" x2="115" y2="98" stroke="#64748b" stroke-width="2"/><line x1="210" y1="98" x2="225" y2="98" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="335" y2="98" stroke="#64748b" stroke-width="2"/><line x1="430" y1="98" x2="445" y2="98" stroke="#64748b" stroke-width="2"/><line x1="540" y1="98" x2="555" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Saste checks pehle (connection reputation), mehenge checks baad mein (file analysis, content)</text>
</svg><p class="cap">Cisco Secure Email gateway ki simplified inbound pipeline.</p></div>

<h3>Secure Email gateway pipeline</h3>
<p>Cisco Secure Email Gateway (pehle ESA, Cloud Gateway ke roop mein bhi milta hai) aapke domain ke MX ki tarah SMTP path mein baithta hai. Inbound mein yeh lagbhag is order mein apply karta hai:</p>
<ol>
<li><b>Reputation filtering</b>: connect karne wale IP ka <b>SenderBase Reputation Score (SBRS)</b>, -10 se +10, <b>Host Access Table (HAT)</b> ke through tay karta hai ki connection block, throttle ya accept ho. Zyadatar spam yahin refuse hota hai.</li>
<li><b>Sender authentication</b>: SPF, DKIM aur DMARC verification.</li>
<li><b>Anti-spam</b> aur <b>antivirus</b> scanning, phir <b>file reputation aur file analysis</b> (wahi Cisco malware intelligence aur Secure Malware Analytics sandbox jo Secure Endpoint use karta hai), plus graymail detection.</li>
<li><b>Content filters</b> (attachments, keywords, senders par aapke rules) aur <b>outbreak filters</b>, jo naye campaigns ke dauraan signatures banne se pehle suspicious URLs ko hold ya rewrite karte hain.</li>
<li>Outbound: sensitive data bahar jaane se rokne ke liye <b>DLP</b>, DKIM signing, aur servers ke beech TLS ya sensitive mail ke liye message-level <b>encryption</b>.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek mail <code>ceo@nwk.example</code> se hone ka daawa karta hai par 203.0.113.66 se aata hai. nwk.example ka SPF sirf 198.51.100.25 ko <code>-all</code> ke saath list karta hai: spf=fail. nwk.example ka koi valid DKIM signature nahi: dkim=none. DMARC fail hota hai, aur <code>p=reject</code> ke saath receiving gateway ise refuse kar deta hai. Agar domain par <code>p=none</code> hota, to wahi mail deliver hota aur sirf report hota.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehle hi din <code>p=reject</code> publish kar dena. <code>p=none</code> aur rua reports se shuru karo, har legitimate sender (marketing platforms, ticketing systems) dhoondho, unka SPF aur DKIM fix karo, phir quarantine aur reject par jao.</p></div>

<div class="exam"><p><b>Exam trap.</b> SPF <b>envelope</b> sender ke server ko validate karta hai; DKIM ek <b>signature</b> validate karta hai; DMARC maangta hai ki unmein se ek pass ho <b>aur</b> <b>header From</b> se <b>align</b> kare, aur policy set karta hai. "Kaunsa receiver ko reject karne ko kehta hai?" DMARC hai.</p></div>

<div class="scn"><h4>Woh supplier jisne bank details badle</h4><p>Accounts payable ko <code>accounts@supplier-invoices.example</code> se email mili jismein bank details update karne ko kaha gaya. SPF, DKIM aur DMARC sab pass hue. Asli supplier <code>supplier.example</code> use karta tha. Gateway ke anti-spam engine ne ise jaane diya kyunki usmein koi link ya attachment nahi tha. Sirf supplier ke known phone number par call-back ne ek bada payment roka.</p><p><b>Seekh:</b> authentication prove karta hai kisne bheja, yeh nahi ki sender wahi hai jo aap samajhte ho; BEC ko behavioural detection aur process controls chahiye.</p></div>

<div class="iv"><p class="q">"SPF, DKIM aur DMARC samjhao aur yeh saath kaise kaam karte hain."</p><p>Strong answer: SPF domain ke liye bhejne wale allowed servers ki DNS list hai, envelope sender ke against check hoti hai. DKIM headers aur body ko private key se sign karta hai jiski public key DNS mein hai, domain aur integrity prove karta hai. DMARC maangta hai ki SPF ya DKIM visible From domain ke alignment ke saath pass ho, receivers ko failures par none, quarantine ya reject batata hai, aur aggregate reports bhejta hai. Jodo ki inmein se koi lookalike domains nahi rokta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threats: spam, phishing, spear phishing, BEC, malicious attachments aur URLs, spoofing, lookalikes.</li>
<li>SPF = allowed sending IPs (envelope); DKIM = signature (selector._domainkey); DMARC = alignment + policy + reports.</li>
<li>Authentication exact-domain spoofing rokta hai, lookalike domains ya real accounts se BEC nahi.</li>
<li>Gateway order: reputation (SBRS/HAT), authentication, anti-spam/AV/file analysis, content aur outbreak filters, DLP aur encryption.</li>
<li>DMARC ko p=none se quarantine se reject tak roll out karo.</li>
</ul></div>
`}};export{e as default};