var e={id:`phishing`,h:{en:`Phishing, social engineering and security culture`,hi:`Phishing, social engineering aur security culture`},body:{en:`
<p>A con artist does not break the lock on a bank; he calls the branch pretending to be from head office and asks the clerk to open it for him. <b>Social engineering</b> attacks people instead of technology, using urgency, authority, fear, curiosity or helpfulness. <b>Phishing</b> is social engineering delivered by message. It is still the most common first step of a breach, and AI has made the messages more convincing.</p>

<h3>The family of techniques</h3>
<table class="cmp"><tr><th>Technique</th><th>What it is</th></tr>
<tr><td>Phishing</td><td>Mass e-mail pretending to be a trusted brand, asking to click, log in or open a file</td></tr>
<tr><td>Spear phishing / whaling</td><td>Targeted at a specific person or team; whaling targets executives</td></tr>
<tr><td>Business e-mail compromise (BEC)</td><td>Pretends to be (or uses the real mailbox of) a CEO or supplier to redirect payments or change bank details</td></tr>
<tr><td>Smishing, vishing, quishing</td><td>By SMS, by voice call (now with cloned voices), by QR code</td></tr>
<tr><td>Adversary-in-the-middle (AiTM) phishing</td><td>A proxy site relays the real login page and captures the session cookie, bypassing SMS or push MFA</td></tr>
<tr><td>MFA fatigue</td><td>Repeated push prompts until the tired user taps Approve</td></tr>
<tr><td>Pretexting</td><td>A believable story ("I am the new auditor") to obtain information</td></tr>
</table>

<h3>E-mail authentication: SPF, DKIM, DMARC</h3>
<dl class="terms">
<dt>SPF (Sender Policy Framework)</dt><dd>A DNS TXT record listing which IP addresses may send mail for a domain. The receiver checks the envelope sender (Return-Path) domain against the connecting IP.</dd>
<dt>DKIM (DomainKeys Identified Mail)</dt><dd>The sending server signs headers and body with a private key; the receiver fetches the public key from DNS and verifies. Proves the message was not changed and was signed by domain <code>d=</code>.</dd>
<dt>DMARC</dt><dd>A DNS policy that requires SPF or DKIM to pass <b>and align</b> with the visible From domain, then tells receivers what to do on failure: <code>p=none</code> (monitor), <code>p=quarantine</code> (spam folder) or <code>p=reject</code>, and where to send reports.</dd>
</dl>
<p>Important limit: a <b>lookalike domain</b> such as nwkings-payro11.example can publish its own SPF, DKIM and DMARC and pass all three <i>for itself</i>. Authentication proves who sent it, not that the sender is who the user thinks. That is why gateways also check lookalikes, display-name impersonation and reputation.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Phishing controls in layers">
<rect x="10" y="20" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="13">Email gateway</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="12">SPF, DKIM, DMARC</text>
<rect x="167" y="20" width="140" height="56" rx="8" fill="#fde68a"/><text x="237" y="44" text-anchor="middle" class="svg-ink" font-size="13">User</text><text x="237" y="62" text-anchor="middle" class="svg-muted" font-size="12">report button</text>
<rect x="324" y="20" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="394" y="44" text-anchor="middle" class="svg-ink" font-size="13">DNS / web</text><text x="394" y="62" text-anchor="middle" class="svg-muted" font-size="12">block the click</text>
<rect x="481" y="20" width="149" height="56" rx="8" fill="#bbf7d0"/><text x="555" y="44" text-anchor="middle" class="svg-ink" font-size="13">Identity</text><text x="555" y="62" text-anchor="middle" class="svg-muted" font-size="12">FIDO2 MFA</text>
<line x1="150" y1="48" x2="167" y2="48" stroke="#64748b" stroke-width="2"/><line x1="307" y1="48" x2="324" y2="48" stroke="#64748b" stroke-width="2"/><line x1="464" y1="48" x2="481" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="44" rx="8" fill="#fed7aa"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">SOC triage: verdict, purge from all mailboxes, block sender, hunt for clicks</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">A phish must beat every layer; one report can protect everyone</text>
</svg><p class="cap">Technical controls stop most phishing; people and the SOC catch the rest.</p></div>

<h3>Header triage: the lab's two reported messages</h3>
<p>Read headers in this order: From (display name and real address), Reply-To, Return-Path, Received IP, Authentication-Results, then the links and attachment.</p>
<pre class="out">PH-7781 — message headers
From: "NK Payroll Team" &lt;payroll@<span class="hl">nwkings-payro11.example</span>&gt;
Reply-To: hr-desk@fastmail-drop.example
Return-Path: bounce@nwkings-payro11.example
To: asha.verma@nwkings.example
Subject: ACTION REQUIRED: confirm your bank details before salary run
Received: from mail.sender (45.155.205.19)
Authentication-Results: <span class="hl">spf=fail</span> (nwkings-payro11.example does not designate 45.155.205.19 as permitted sender); dkim=none; <span class="hl">dmarc=fail</span> (p=none)
Links: nwkings-payro11.example/secure/verify?u=asha.verma · Attachment: Salary_Revision_2026.html</pre>
<div class="eg"><p><b>Worked example: the verdict.</b> PH-7781: the domain replaces the letters "ll" with the digits "11" (payro<b>11</b>); Reply-To goes to a third domain; SPF fails, there is no DKIM, DMARC fails; the text uses urgency ("within 24 hours") and asks for a password; an HTML attachment is a common credential-harvesting trick. Verdict: <b>Phishing</b>, with "purge from all mailboxes and block sender domain". PH-7782 from Cloudbox passes SPF, DKIM (d=cloudbox.example) and DMARC for the real domain, has no Reply-To trick, and the link stays on the sharing service: <b>Legitimate</b>. After the phishing verdict, also check proxy or DNS logs for anyone who clicked, and reset their credentials.</p></div>

<h3>Controls that work</h3>
<ul>
<li><b>Email security gateway</b> (Cisco Secure Email): reputation, sandboxing of attachments, URL rewriting with time-of-click checks, impersonation detection, auto-remediation that pulls delivered mail back.</li>
<li><b>DNS and web security</b> (Secure Access): newly seen and phishing categories stop the click reaching the site.</li>
<li><b>Phishing-resistant MFA</b>: FIDO2 security keys or passkeys bind the login to the real site's origin, so an AiTM proxy gets nothing useful. Number matching reduces MFA fatigue.</li>
<li><b>Process</b>: out-of-band call-back on a known number for any payment or bank-detail change, even when the request comes by voice or video.</li>
</ul>

<h3>Security culture</h3>
<p>Culture is what people do when nobody is checking. A good culture has a one-click <b>Report Phish</b> button, fast feedback to reporters ("thanks, it was phishing, we removed it from 212 mailboxes"), regular realistic simulations measured by <b>reporting rate</b> rather than only click rate, short targeted training, and a <b>no-blame</b> rule: someone who clicked and reported quickly is a hero, not a problem. Leaders must follow the same rules, because executives are the most targeted group.</p>

<div class="warn"><p><b>Common mistakes.</b> Trusting the display name. Believing "DMARC pass" means "safe" (lookalikes pass their own DMARC). Publishing <code>p=none</code> forever, which only monitors. Punishing users who click, which stops them reporting.</p></div>

<div class="exam"><p><b>Exam traps.</b> SPF checks the <b>sending IP</b>; DKIM checks a <b>signature</b>; DMARC adds <b>alignment and policy</b>. SMS and push MFA can be phished by AiTM; FIDO2 cannot. BEC often contains no link and no attachment, so gateways that only scan links miss it.</p></div>

<div class="scn"><h4>The supplier who changed banks</h4><p>An accounts clerk received an e-mail from a long-time supplier's real address, asking to use a new bank account for next month's invoices. SPF, DKIM and DMARC all passed, because the supplier's mailbox had been compromised. The clerk followed the company's rule and called the supplier on the number stored in the vendor master file. The supplier knew nothing about it. The payment of a large invoice was stopped, and the supplier reset their mail passwords.</p><p><b>Lesson:</b> for payments, process beats technology; call back on a known number every time.</p></div>

<div class="iv"><p class="q">"How would you decide whether a reported e-mail is phishing?"</p><p>Describe a repeatable header review: display name versus real address and lookalike characters, Reply-To and Return-Path domains, sending IP reputation, SPF, DKIM and DMARC results and alignment, link domains versus text, attachment type, urgency and requests for credentials or money. Then describe the actions: verdict, purge from all mailboxes, block the sender, check logs for clicks, reset affected credentials and give feedback to the reporter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Social engineering targets people through urgency and authority; phishing, BEC, vishing, AiTM and MFA fatigue are the main forms.</li>
<li>SPF = allowed IPs, DKIM = signature, DMARC = alignment plus policy and reports; lookalike domains can pass their own checks.</li>
<li>Lab: PH-7781 from nwkings-payro11.example (SPF fail, DMARC fail) is phishing; PH-7782 is legitimate.</li>
<li>Layer controls: gateway, DNS/web blocking, FIDO2 MFA, out-of-band verification.</li>
<li>Culture: easy reporting, fast feedback, simulations measured by reporting rate, no blame.</li>
</ul></div>
`,hi:`
<p>Ek thug bank ka taala nahi todta; woh head office ka banda banke branch ko call karta hai aur clerk se uske liye taala khulwata hai. <b>Social engineering</b> technology ki jagah logon par attack karta hai, jaldbaazi, authority, darr, curiosity ya madad karne ki aadat use karke. <b>Phishing</b> message se pahunchaya gaya social engineering hai. Yeh aaj bhi breach ka sabse common pehla kadam hai, aur AI ne messages ko aur bharosemand bana diya hai.</p>

<h3>Techniques ka parivaar</h3>
<table class="cmp"><tr><th>Technique</th><th>Kya hai</th></tr>
<tr><td>Phishing</td><td>Mass e-mail jo trusted brand banke click, login ya file kholne ko kehta hai</td></tr>
<tr><td>Spear phishing / whaling</td><td>Kisi specific insaan ya team par targeted; whaling executives ko target karta hai</td></tr>
<tr><td>Business e-mail compromise (BEC)</td><td>CEO ya supplier banke (ya uska asli mailbox use karke) payments redirect ya bank details badalwata hai</td></tr>
<tr><td>Smishing, vishing, quishing</td><td>SMS se, voice call se (ab cloned voices ke saath), QR code se</td></tr>
<tr><td>Adversary-in-the-middle (AiTM) phishing</td><td>Proxy site asli login page relay karti hai aur session cookie pakad leti hai, SMS ya push MFA ko bypass karke</td></tr>
<tr><td>MFA fatigue</td><td>Baar baar push prompts jab tak thaka hua user Approve na daba de</td></tr>
<tr><td>Pretexting</td><td>Information paane ke liye bharosemand kahani ("main naya auditor hoon")</td></tr>
</table>

<h3>E-mail authentication: SPF, DKIM, DMARC</h3>
<dl class="terms">
<dt>SPF (Sender Policy Framework)</dt><dd>DNS TXT record jo list karta hai kaunse IP addresses domain ke liye mail bhej sakte hain. Receiver envelope sender (Return-Path) domain ko connecting IP se check karta hai.</dd>
<dt>DKIM (DomainKeys Identified Mail)</dt><dd>Sending server headers aur body ko private key se sign karta hai; receiver DNS se public key laakar verify karta hai. Saabit karta hai ki message badla nahi aur domain <code>d=</code> ne sign kiya.</dd>
<dt>DMARC</dt><dd>DNS policy jo maangti hai ki SPF ya DKIM pass ho <b>aur align</b> kare visible From domain ke saath, phir receivers ko batati hai failure par kya karein: <code>p=none</code> (monitor), <code>p=quarantine</code> (spam folder) ya <code>p=reject</code>, aur reports kahan bhejein.</dd>
</dl>
<p>Important limit: nwkings-payro11.example jaisa <b>lookalike domain</b> apne SPF, DKIM aur DMARC publish karke teeno <i>apne liye</i> pass kar sakta hai. Authentication saabit karta hai kisne bheja, yeh nahi ki sender wahi hai jo user sochta hai. Isliye gateways lookalikes, display-name impersonation aur reputation bhi check karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Layers mein phishing controls">
<rect x="10" y="20" width="140" height="56" rx="8" fill="#bae6fd"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="13">Email gateway</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="12">SPF, DKIM, DMARC</text>
<rect x="167" y="20" width="140" height="56" rx="8" fill="#fde68a"/><text x="237" y="44" text-anchor="middle" class="svg-ink" font-size="13">User</text><text x="237" y="62" text-anchor="middle" class="svg-muted" font-size="12">report button</text>
<rect x="324" y="20" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="394" y="44" text-anchor="middle" class="svg-ink" font-size="13">DNS / web</text><text x="394" y="62" text-anchor="middle" class="svg-muted" font-size="12">click block karo</text>
<rect x="481" y="20" width="149" height="56" rx="8" fill="#bbf7d0"/><text x="555" y="44" text-anchor="middle" class="svg-ink" font-size="13">Identity</text><text x="555" y="62" text-anchor="middle" class="svg-muted" font-size="12">FIDO2 MFA</text>
<line x1="150" y1="48" x2="167" y2="48" stroke="#64748b" stroke-width="2"/><line x1="307" y1="48" x2="324" y2="48" stroke="#64748b" stroke-width="2"/><line x1="464" y1="48" x2="481" y2="48" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="620" height="44" rx="8" fill="#fed7aa"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">SOC triage: verdict, saare mailboxes se purge, sender block, clicks ki hunt</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Phish ko har layer haraani padti hai; ek report sabko bacha sakti hai</text>
</svg><p class="cap">Technical controls zyada tar phishing rokte hain; log aur SOC baaki pakadte hain.</p></div>

<h3>Header triage: lab ke do reported messages</h3>
<p>Headers is order mein padho: From (display name aur asli address), Reply-To, Return-Path, Received IP, Authentication-Results, phir links aur attachment.</p>
<pre class="out">PH-7781 — message headers
From: "NK Payroll Team" &lt;payroll@<span class="hl">nwkings-payro11.example</span>&gt;
Reply-To: hr-desk@fastmail-drop.example
Return-Path: bounce@nwkings-payro11.example
To: asha.verma@nwkings.example
Subject: ACTION REQUIRED: confirm your bank details before salary run
Received: from mail.sender (45.155.205.19)
Authentication-Results: <span class="hl">spf=fail</span> (nwkings-payro11.example does not designate 45.155.205.19 as permitted sender); dkim=none; <span class="hl">dmarc=fail</span> (p=none)
Links: nwkings-payro11.example/secure/verify?u=asha.verma · Attachment: Salary_Revision_2026.html</pre>
<div class="eg"><p><b>Worked example: verdict.</b> PH-7781: domain letters "ll" ko digits "11" se badalta hai (payro<b>11</b>); Reply-To ek teesre domain par jaata hai; SPF fail, DKIM nahi, DMARC fail; text jaldbaazi use karta hai ("24 ghante mein") aur password maangta hai; HTML attachment credential-harvesting ki common chaal hai. Verdict: <b>Phishing</b>, "purge from all mailboxes and block sender domain" ke saath. Cloudbox ka PH-7782 asli domain ke liye SPF, DKIM (d=cloudbox.example) aur DMARC pass karta hai, koi Reply-To chaal nahi, aur link sharing service par hi rehta hai: <b>Legitimate</b>. Phishing verdict ke baad proxy ya DNS logs mein bhi dekho kisne click kiya, aur unke credentials reset karo.</p></div>

<h3>Controls jo kaam karte hain</h3>
<ul>
<li><b>Email security gateway</b> (Cisco Secure Email): reputation, attachments ki sandboxing, time-of-click checks ke saath URL rewriting, impersonation detection, auto-remediation jo deliver hua mail wapas kheench le.</li>
<li><b>DNS aur web security</b> (Secure Access): newly seen aur phishing categories click ko site tak pahunchne se rokti hain.</li>
<li><b>Phishing-resistant MFA</b>: FIDO2 security keys ya passkeys login ko asli site ke origin se baandhte hain, isliye AiTM proxy ko kuch kaam ka nahi milta. Number matching MFA fatigue kam karta hai.</li>
<li><b>Process</b>: kisi bhi payment ya bank-detail badlaav ke liye known number par out-of-band call-back, chahe request voice ya video se aaye.</li>
</ul>

<h3>Security culture</h3>
<p>Culture woh hai jo log tab karte hain jab koi check nahi kar raha. Achhe culture mein one-click <b>Report Phish</b> button hota hai, reporters ko tez feedback ("thanks, yeh phishing tha, humne ise 212 mailboxes se hata diya"), regular realistic simulations jo sirf click rate nahi balki <b>reporting rate</b> se measure hoti hain, chhoti targeted training, aur <b>no-blame</b> rule: jisne click karke jaldi report kiya woh hero hai, problem nahi. Leaders ko bhi wahi rules follow karne chahiye, kyunki executives sabse zyada targeted group hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Display name par bharosa karna. "DMARC pass" ko "safe" maanna (lookalikes apna DMARC pass karte hain). Hamesha ke liye <code>p=none</code> publish karna, jo sirf monitor karta hai. Click karne wale users ko saza dena, jisse woh report karna band kar dete hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> SPF <b>sending IP</b> check karta hai; DKIM <b>signature</b> check karta hai; DMARC <b>alignment aur policy</b> jodta hai. SMS aur push MFA AiTM se phish ho sakte hain; FIDO2 nahi. BEC mein aksar na link hota hai na attachment, isliye sirf links scan karne wale gateways use miss karte hain.</p></div>

<div class="scn"><h4>Supplier jisne bank badla</h4><p>Ek accounts clerk ko ek purane supplier ke asli address se e-mail aaya, jo agle mahine ke invoices ke liye naya bank account use karne ko keh raha tha. SPF, DKIM aur DMARC sab pass hue, kyunki supplier ka mailbox compromise ho chuka tha. Clerk ne company ka rule follow kiya aur supplier ko vendor master file mein stored number par call kiya. Supplier ko iske baare mein kuch pata nahi tha. Ek bade invoice ka payment rok diya gaya, aur supplier ne apne mail passwords reset kiye.</p><p><b>Seekh:</b> payments ke liye process technology se jeetta hai; har baar known number par call back karo.</p></div>

<div class="iv"><p class="q">"Aap kaise decide karoge ki reported e-mail phishing hai ya nahi?"</p><p>Repeatable header review batao: display name vs asli address aur lookalike characters, Reply-To aur Return-Path domains, sending IP reputation, SPF, DKIM aur DMARC results aur alignment, link domains vs text, attachment type, jaldbaazi aur credentials ya paise ki maang. Phir actions batao: verdict, saare mailboxes se purge, sender block, clicks ke liye logs check, affected credentials reset aur reporter ko feedback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Social engineering jaldbaazi aur authority se logon ko target karta hai; phishing, BEC, vishing, AiTM aur MFA fatigue main roop hain.</li>
<li>SPF = allowed IPs, DKIM = signature, DMARC = alignment plus policy aur reports; lookalike domains apne checks pass kar sakte hain.</li>
<li>Lab: nwkings-payro11.example se PH-7781 (SPF fail, DMARC fail) phishing hai; PH-7782 legitimate hai.</li>
<li>Controls layer karo: gateway, DNS/web blocking, FIDO2 MFA, out-of-band verification.</li>
<li>Culture: aasaan reporting, tez feedback, reporting rate se measured simulations, no blame.</li>
</ul></div>
`}};export{e as default};