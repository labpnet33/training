var e={id:`dns-security`,h:{en:`Securing DNS: DNSSEC, DoT and DoH (DNS over HTTPS)`,hi:`DNS ko secure karna: DNSSEC, DoT aur DoH (DNS over HTTPS)`},body:{en:`
<p>Imagine sending a postcard to ask a friend for the bank's address. Anyone who handles the postcard can read your question (no privacy), and a dishonest postman could replace the reply with a fake address (no integrity). DNS was designed in the 1980s exactly like that postcard: plain-text UDP, no signatures. Two different families of fixes exist. <b>DNSSEC</b> adds a tamper-proof seal to the answer. <b>DoT</b> and <b>DoH (DNS over HTTPS)</b> put the postcard inside a locked envelope.</p>

<h3>The threats</h3>
<ul>
<li><b>Spoofing and cache poisoning.</b> An attacker sends forged answers to a resolver, hoping one is accepted and cached. Every user of that resolver is then sent to the attacker's server.</li>
<li><b>Eavesdropping.</b> Anyone on the path (a public Wi-Fi operator, a compromised router) can see every name you look up, which reveals a lot about you.</li>
<li><b>On-path modification.</b> Answers can be changed in transit to redirect or block sites.</li>
</ul>

<h3>DNSSEC: signed answers (integrity and authenticity)</h3>
<p><b>DNS Security Extensions (DNSSEC)</b> let a zone owner sign its records with a private key. A validating resolver checks the signature with the public key. New record types appear:</p>
<dl class="terms">
<dt>RRSIG</dt><dd>The digital signature over a set of records (for example, all A records for one name).</dd>
<dt>DNSKEY</dt><dd>The zone's public keys: a zone-signing key (ZSK) and a key-signing key (KSK).</dd>
<dt>DS</dt><dd>Delegation Signer: a hash of the child zone's KSK, published in the <b>parent</b> zone. This links parent to child.</dd>
<dt>NSEC / NSEC3</dt><dd>Signed proof that a name does <b>not</b> exist, so an attacker cannot forge "no such domain" answers.</dd>
</dl>
<p>The <b>chain of trust</b> starts at the root zone, whose key is built into validating resolvers (the trust anchor). The root signs the DS record for <code>.example</code>, <code>.example</code> signs the DS record for <code>shop.example</code>, and <code>shop.example</code> signs its own records. If any signature fails, the resolver returns <b>SERVFAIL</b> instead of a possibly forged answer.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DNSSEC chain of trust">
<rect x="20" y="70" width="160" height="56" rx="8" fill="#fde68a"/><text x="100" y="94" text-anchor="middle" class="svg-ink" font-size="13">Root "."</text><text x="100" y="113" text-anchor="middle" class="svg-muted" font-size="12">trust anchor</text>
<rect x="240" y="70" width="160" height="56" rx="8" fill="#fed7aa"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">.example</text><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="12">DS signed by root</text>
<rect x="460" y="70" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="540" y="94" text-anchor="middle" class="svg-ink" font-size="13">shop.example</text><text x="540" y="113" text-anchor="middle" class="svg-muted" font-size="12">A + RRSIG</text>
<line x1="180" y1="98" x2="240" y2="98" stroke="#64748b" stroke-width="2"/><line x1="400" y1="98" x2="460" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">each parent vouches for its child's key with a DS record</text>
</svg><p class="cap">DNSSEC: a chain of signatures from the root down to the answer.</p></div>

<p>Important: DNSSEC does <b>not</b> encrypt anything. Queries and answers are still readable on the wire. It proves the answer is genuine and unmodified.</p>
<pre class="out">$ dig +dnssec www.shop.example
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, status: NOERROR, id: 40711
;; flags: qr rd ra <span class="hl">ad</span>; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; ANSWER SECTION:
www.shop.example.   3600  IN  A      198.51.100.25
www.shop.example.   3600  IN  RRSIG  A 13 3 3600 ...</pre>
<p>The <b>ad</b> (authenticated data) flag means the resolver validated the signatures.</p>

<h3>DoT and DoH (DNS over HTTPS): encrypted transport (confidentiality)</h3>
<table class="cmp"><tr><th></th><th>DNS over TLS (DoT)</th><th>DoH (DNS over HTTPS)</th></tr>
<tr><td>Port</td><td>TCP 853</td><td>TCP 443</td></tr>
<tr><td>How it looks on the network</td><td>Easy to identify (dedicated port)</td><td>Blends in with normal web traffic</td></tr>
<tr><td>Typical user</td><td>Operating systems, Android "Private DNS", resolvers</td><td>Web browsers and apps</td></tr>
<tr><td>Protects</td><td colspan="2">Privacy and integrity between client and resolver</td></tr>
</table>
<p>Both encrypt the path between the client and its resolver, so an on-path observer cannot read or change the queries. They do not prove the answer from the authoritative server is genuine; that is DNSSEC's job. The two are complementary. (A newer option, DNS over QUIC, uses UDP 853.)</p>

<h3>The enterprise angle</h3>
<p>Companies often rely on their internal DNS servers to block malware and phishing domains and to log lookups for security investigations. If a browser silently uses DoH (DNS over HTTPS) to a public resolver on port 443, it bypasses all of that and internal names stop resolving. Network teams therefore publish a policy: managed browsers are configured to use the company resolver (which may itself offer DoH or DoT), and the firewall blocks known public DoH and DoT resolvers.</p>

<div class="eg"><p><b>Worked example.</b> A café's Wi-Fi owner runs a packet capture. Laptop A uses plain DNS: the capture shows <code>UDP 53 query: payroll.bank.example</code>. Laptop B uses DoT: the capture shows only a TLS session to the resolver on TCP 853. Laptop C uses DoH (DNS over HTTPS): the capture shows TCP 443 to the resolver, indistinguishable from web browsing. Only laptop A leaked the name.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Saying DNSSEC encrypts DNS. It signs; it does not encrypt. (2) Enabling DNSSEC signing and letting keys or signatures expire: validating resolvers worldwide then return SERVFAIL for the whole domain. (3) Ignoring DoH on a managed network, then wondering why DNS filtering and internal names fail for one browser.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the goal to the tool: <b>integrity/authenticity</b> of records = DNSSEC; <b>confidentiality</b> of queries = DoT (TCP 853) or DoH (DNS over HTTPS) on TCP 443. A question mentioning "RRSIG" or "DS record" is about DNSSEC.</p></div>

<div class="scn"><h4>Internal names fail in one browser only</h4><p>After a browser update, some staff could no longer open <code>web.nwk.lab</code> in that browser, while other browsers and <code>nslookup</code> worked. The engineer found the browser had enabled DoH (DNS over HTTPS) to a public resolver, which knew nothing about the internal <code>nwk.lab</code> zone. Security logs also showed those laptops had stopped appearing in DNS filtering reports. The team pushed a managed browser policy that points DoH at the company's own resolver and blocked public DoH endpoints at the firewall.</p><p><b>Lesson:</b> encrypted DNS is good for privacy, but in an enterprise it must terminate on resolvers you control.</p></div>

<div class="iv"><p class="q">"Does DNSSEC encrypt DNS traffic? How is it different from DoT or DoH?"</p><p>Strong answer: no. DNSSEC adds digital signatures (RRSIG, DNSKEY, DS) so a validating resolver can prove records are authentic and unmodified along a chain of trust from the root; queries remain readable. DoT (TCP 853) and DoH (DNS over HTTPS) on TCP 443 encrypt the client-to-resolver path for privacy but do not validate the data's origin. They solve different problems and work well together. Mention the enterprise concern that DoH can bypass internal DNS filtering.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plain DNS is readable and forgeable; cache poisoning and eavesdropping are the main threats.</li>
<li>DNSSEC signs records (RRSIG, DNSKEY, DS, NSEC) for integrity and authenticity, not privacy.</li>
<li>DoT = TCP 853, DoH (DNS over HTTPS) = TCP 443: both encrypt the client-to-resolver path.</li>
<li>A failed DNSSEC validation returns SERVFAIL; the ad flag shows a validated answer.</li>
<li>Enterprises steer encrypted DNS to their own resolvers so filtering and internal names keep working.</li>
</ul></div>
`,hi:`
<p>Socho aap bank ka address poochne ke liye dost ko postcard bhejte ho. Postcard ko chhoone wala koi bhi aapka sawaal padh sakta hai (privacy nahi), aur ek beimaan postman reply ko fake address se badal sakta hai (integrity nahi). DNS 1980s mein bilkul us postcard ki tarah design hua tha: plain-text UDP, koi signatures nahi. Fixes ki do alag families hain. <b>DNSSEC</b> answer par tamper-proof seal lagata hai. <b>DoT</b> aur <b>DoH (DNS over HTTPS)</b> postcard ko ek locked envelope mein daal dete hain.</p>

<h3>Threats</h3>
<ul>
<li><b>Spoofing aur cache poisoning.</b> Attacker resolver ko forged answers bhejta hai, is umeed mein ki ek accept aur cache ho jaaye. Phir us resolver ka har user attacker ke server par bheja jaata hai.</li>
<li><b>Eavesdropping.</b> Path par koi bhi (public Wi-Fi operator, compromised router) aapka har dhoondha gaya naam dekh sakta hai, jo aapke baare mein bahut kuch batata hai.</li>
<li><b>On-path modification.</b> Sites ko redirect ya block karne ke liye answers raaste mein badle ja sakte hain.</li>
</ul>

<h3>DNSSEC: signed answers (integrity aur authenticity)</h3>
<p><b>DNS Security Extensions (DNSSEC)</b> zone owner ko apne records private key se sign karne dete hain. Validating resolver public key se signature check karta hai. Naye record types aate hain:</p>
<dl class="terms">
<dt>RRSIG</dt><dd>Records ke ek set par digital signature (jaise ek naam ke saare A records).</dd>
<dt>DNSKEY</dt><dd>Zone ki public keys: zone-signing key (ZSK) aur key-signing key (KSK).</dd>
<dt>DS</dt><dd>Delegation Signer: child zone ki KSK ka hash, jo <b>parent</b> zone mein publish hota hai. Yeh parent ko child se jodta hai.</dd>
<dt>NSEC / NSEC3</dt><dd>Signed proof ki koi naam exist <b>nahi</b> karta, taaki attacker "aisa koi domain nahi" answers forge na kar sake.</dd>
</dl>
<p><b>Chain of trust</b> root zone se shuru hoti hai, jiski key validating resolvers mein built-in hoti hai (trust anchor). Root <code>.example</code> ka DS record sign karta hai, <code>.example</code> <code>shop.example</code> ka DS record sign karta hai, aur <code>shop.example</code> apne records khud sign karta hai. Agar koi bhi signature fail ho, to resolver shayad-forged answer ki jagah <b>SERVFAIL</b> deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DNSSEC chain of trust">
<rect x="20" y="70" width="160" height="56" rx="8" fill="#fde68a"/><text x="100" y="94" text-anchor="middle" class="svg-ink" font-size="13">Root "."</text><text x="100" y="113" text-anchor="middle" class="svg-muted" font-size="12">trust anchor</text>
<rect x="240" y="70" width="160" height="56" rx="8" fill="#fed7aa"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">.example</text><text x="320" y="113" text-anchor="middle" class="svg-muted" font-size="12">DS root ne sign kiya</text>
<rect x="460" y="70" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="540" y="94" text-anchor="middle" class="svg-ink" font-size="13">shop.example</text><text x="540" y="113" text-anchor="middle" class="svg-muted" font-size="12">A + RRSIG</text>
<line x1="180" y1="98" x2="240" y2="98" stroke="#64748b" stroke-width="2"/><line x1="400" y1="98" x2="460" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">har parent DS record se apne child ki key ki guarantee deta hai</text>
</svg><p class="cap">DNSSEC: root se answer tak signatures ki ek chain.</p></div>

<p>Zaroori: DNSSEC kuch bhi encrypt <b>nahi</b> karta. Queries aur answers wire par abhi bhi padhe ja sakte hain. Yeh saabit karta hai ki answer asli aur unmodified hai.</p>
<pre class="out">$ dig +dnssec www.shop.example
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, status: NOERROR, id: 40711
;; flags: qr rd ra <span class="hl">ad</span>; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; ANSWER SECTION:
www.shop.example.   3600  IN  A      198.51.100.25
www.shop.example.   3600  IN  RRSIG  A 13 3 3600 ...</pre>
<p><b>ad</b> (authenticated data) flag ka matlab hai ki resolver ne signatures validate kiye.</p>

<h3>DoT aur DoH (DNS over HTTPS): encrypted transport (confidentiality)</h3>
<table class="cmp"><tr><th></th><th>DNS over TLS (DoT)</th><th>DoH (DNS over HTTPS)</th></tr>
<tr><td>Port</td><td>TCP 853</td><td>TCP 443</td></tr>
<tr><td>Network par kaisa dikhta hai</td><td>Pehchaanna aasaan (dedicated port)</td><td>Normal web traffic mein ghul jaata hai</td></tr>
<tr><td>Typical user</td><td>Operating systems, Android "Private DNS", resolvers</td><td>Web browsers aur apps</td></tr>
<tr><td>Kya bachata hai</td><td colspan="2">Client aur resolver ke beech privacy aur integrity</td></tr>
</table>
<p>Dono client aur uske resolver ke beech ka path encrypt karte hain, to on-path observer queries padh ya badal nahi sakta. Yeh saabit nahi karte ki authoritative server se aaya answer asli hai; woh DNSSEC ka kaam hai. Dono ek doosre ke complementary hain. (Ek naya option, DNS over QUIC, UDP 853 use karta hai.)</p>

<h3>Enterprise angle</h3>
<p>Companies malware aur phishing domains block karne aur security investigations ke liye lookups log karne ke liye aksar apne internal DNS servers par nirbhar hoti hain. Agar browser chupchaap port 443 par public resolver ke saath DoH (DNS over HTTPS) use kare, to woh yeh sab bypass kar deta hai aur internal names resolve hona band ho jaate hain. Isliye network teams policy publish karti hain: managed browsers company resolver use karne ke liye configured hote hain (jo khud DoH ya DoT offer kar sakta hai), aur firewall known public DoH aur DoT resolvers block karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Café ka Wi-Fi owner packet capture chalata hai. Laptop A plain DNS use karta hai: capture mein <code>UDP 53 query: payroll.bank.example</code> dikhta hai. Laptop B DoT use karta hai: capture mein sirf TCP 853 par resolver ke saath TLS session dikhta hai. Laptop C DoH (DNS over HTTPS) use karta hai: capture mein resolver ke saath TCP 443 dikhta hai, web browsing se alag nahi. Sirf laptop A ne naam leak kiya.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Kehna ki DNSSEC DNS encrypt karta hai. Yeh sign karta hai; encrypt nahi. (2) DNSSEC signing enable karke keys ya signatures expire hone dena: tab duniya bhar ke validating resolvers poore domain ke liye SERVFAIL dete hain. (3) Managed network par DoH ko ignore karna, phir sochna ki ek browser ke liye DNS filtering aur internal names kyun fail ho rahe hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Goal ko tool se match karo: records ki <b>integrity/authenticity</b> = DNSSEC; queries ki <b>confidentiality</b> = DoT (TCP 853) ya DoH (DNS over HTTPS) on TCP 443. "RRSIG" ya "DS record" wala sawaal DNSSEC ke baare mein hai.</p></div>

<div class="scn"><h4>Internal names sirf ek browser mein fail</h4><p>Browser update ke baad kuch staff us browser mein <code>web.nwk.lab</code> nahi khol pa rahe the, jabki doosre browsers aur <code>nslookup</code> chal rahe the. Engineer ne dekha ki browser ne public resolver ke saath DoH (DNS over HTTPS) enable kar diya tha, jise internal <code>nwk.lab</code> zone ke baare mein kuch pata nahi tha. Security logs mein bhi dikha ki woh laptops DNS filtering reports mein aana band ho gaye the. Team ne managed browser policy push ki jo DoH ko company ke apne resolver par point karti hai aur firewall par public DoH endpoints block kiye.</p><p><b>Seekh:</b> encrypted DNS privacy ke liye achha hai, lekin enterprise mein use aapke control wale resolvers par terminate hona chahiye.</p></div>

<div class="iv"><p class="q">"Kya DNSSEC DNS traffic encrypt karta hai? Yeh DoT ya DoH se kaise alag hai?"</p><p>Strong answer: nahi. DNSSEC digital signatures (RRSIG, DNSKEY, DS) jodta hai taaki validating resolver root se chain of trust ke saath saabit kar sake ki records authentic aur unmodified hain; queries padhne laayak rehti hain. DoT (TCP 853) aur DoH (DNS over HTTPS) on TCP 443 privacy ke liye client-to-resolver path encrypt karte hain lekin data ka origin validate nahi karte. Yeh alag problems solve karte hain aur saath mein achha kaam karte hain. Enterprise concern ka zikr karo ki DoH internal DNS filtering bypass kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plain DNS padha aur forge kiya ja sakta hai; cache poisoning aur eavesdropping main threats hain.</li>
<li>DNSSEC records sign karta hai (RRSIG, DNSKEY, DS, NSEC) integrity aur authenticity ke liye, privacy ke liye nahi.</li>
<li>DoT = TCP 853, DoH (DNS over HTTPS) = TCP 443: dono client-to-resolver path encrypt karte hain.</li>
<li>Failed DNSSEC validation SERVFAIL deta hai; ad flag validated answer dikhata hai.</li>
<li>Enterprises encrypted DNS ko apne resolvers par le jaati hain taaki filtering aur internal names chalte rahein.</li>
</ul></div>
`}};export{e as default};