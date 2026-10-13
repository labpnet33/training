var e={id:`ssl-inspection-and-certificates`,h:{en:`SSL inspection and certificates: opening the envelope safely`,hi:`SSL inspection aur certificates: envelope ko safely kholna`},body:{en:`
<h3>The sealed envelope problem</h3>
<p>Almost all web traffic today is encrypted with TLS (people still say "SSL"). Imagine every letter leaving Sahyadri Logistics is in a sealed envelope. The gateway can read the address on the outside, which is the host name, but not the letter. A card number in an upload, or a virus inside a download, is invisible. <b>SSL inspection</b> solves this: the gateway opens the envelope, reads the letter, reseals it and forwards it.</p>

<h3>How inspection works</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Two TLS sessions">
<rect x="10" y="50" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="85" text-anchor="middle" class="svg-ink" font-size="13">PC / browser</text>
<rect x="260" y="50" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">Cloud gateway</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="11">reads the plain text</text>
<rect x="510" y="50" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="85" text-anchor="middle" class="svg-ink" font-size="13">Web server</text>
<line x1="130" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="195" y="40" text-anchor="middle" class="svg-muted" font-size="12">TLS session 1</text><text x="195" y="135" text-anchor="middle" class="svg-muted" font-size="11">company certificate</text>
<text x="445" y="40" text-anchor="middle" class="svg-muted" font-size="12">TLS session 2</text><text x="445" y="135" text-anchor="middle" class="svg-muted" font-size="11">real site certificate</text>
</svg><p class="cap">Inspection means two separate TLS sessions with a reader in the middle.</p></div>
<p>The gateway ends the browser's TLS session itself, then opens a second session to the real site. To the browser it must show a certificate for, say, bank.fin.example. It cannot have the real site's private key, so it signs a fresh certificate with the <b>company's own root CA</b> (certificate authority). The browser accepts it <b>only if the device trusts that root CA</b>. This is a generic PKI fact: a certificate is trusted when its chain ends at a root the device already holds.</p>

<h3>Failure one: the device does not trust the root</h3>
<p>If the root is not installed, every inspected site gives a certificate warning or error 495 in the simulator. That is ticket 320010: a Chennai PC (PC-CHN, user meena) shows a warning on every secure site. Evidence: the warning names an unknown issuer; some other PC works. Root cause: the device lacks the company root certificate. Fix: install it (in the lab, the <code>install-ca</code> command on the client; in real life, device management pushes it). Verify: <code>curl news.example</code> returns the page.</p>
<pre class="out">C:\\&gt; curl news.example
<span class="hl">Result: 495 certificate problem: issuer not trusted</span>
C:\\&gt; install-ca
Company root certificate installed in the device trust store.
C:\\&gt; curl news.example
Result: 200 OK  (inspected, rule: Inspect-all)</pre>

<h3>Failure two: certificate pinning</h3>
<p><b>Certificate pinning</b> means an application carries a copy of the exact certificate (or key) it expects and refuses anything else, even one that the operating system trusts. This protects software updaters from fake servers. But inspection is, technically, a controlled impersonation, so a pinned application rejects it. In our company update.pinned.example (category Software updates) is such an app. The fix is not to install more certificates; it is a <b>do-not-inspect (skip) rule</b> for that destination. The traffic is still allowed by URL policy and still goes through the cloud, but it stays encrypted end to end.</p>

<h3>Order matters: skip above inspect</h3>
<p>SSL rules are also ordered, first match wins, actions <code>inspect</code>, <code>skip</code> or <code>block</code>. If no rule matches the connection is <b>not inspected</b>.</p>
<table class="cmp"><tr><th>#</th><th>Rule</th><th>Match</th><th>Action</th></tr>
<tr><td>1</td><td>Skip-pinned-updates</td><td>category Software updates</td><td>skip</td></tr>
<tr><td>2</td><td>Skip-banking</td><td>category Banking</td><td>skip</td></tr>
<tr><td>3</td><td>Inspect-all</td><td>any</td><td>inspect</td></tr></table>
<p>If the skip rules sit below Inspect-all they are never reached, and the pinned app breaks again. The simulator even raises an alert for a skip rule below "inspect everything". Banking is skipped for privacy and legal reasons, a normal business decision.</p>
<p>Ticket 320070 is exactly this: the software updater fails with a TLS error after someone removed the exception during a clean-up. Evidence: the Policy tester shows Inspect-all deciding for update.pinned.example, result 495. Root cause: the skip rule is gone. Fix: add it back above Inspect-all. Verify: updater works, Policy tester shows rule Skip-pinned-updates, SSL decision skip.</p>

<h3>Why uninspected traffic is blind</h3>
<p>When a connection is skipped, stages 4, 5 and 6 (full-URL, DLP, malware and sandbox) see only ciphertext. Every skip rule is therefore a deliberate blind spot. Keep them few, specific and documented.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> An <b>inspect</b> rule makes the gateway terminate and re-originate TLS, so the browser receives a certificate issued by the company root. A <b>skip</b> rule leaves the original end-to-end TLS untouched. Installing the root changes nothing on the wire; it only makes the browser accept the substituted certificate.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Rolling out inspection before the root certificate reaches all devices. (2) Fixing a pinned app by disabling inspection for everyone. (3) Putting a skip rule below a broad inspect rule. (4) Skipping a whole category such as File sharing "to stop a complaint" and silently disabling DLP.</p></div>
<div class="exam"><p><b>Exam trap.</b> A certificate error on one app while everything else works points to pinning. A certificate error on every site on one device points to a missing root.</p></div>

<div class="scn"><h4>Friday clean-up, Monday updater failure</h4><p>An admin removed old exceptions on Friday. Monday morning the software updater on Pune laptops failed with TLS errors while browsing was fine. The audit log showed the deleted skip rule. Re-adding it restored updates.</p><p><b>Lesson:</b> read the audit log first when something that worked last week stops.</p></div>

<div class="iv"><p class="q">"Why can SSL inspection break an application, and what do you do?"</p><p>Explain the two TLS sessions and the company root. Apps with certificate pinning reject the substituted certificate. Fix with a do-not-inspect rule above the broad inspect rule, scoped to that destination, and accept the lost visibility.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inspection splits one TLS session into two, with the gateway reading in the middle.</li>
<li>Devices must trust the company root CA or they show certificate errors.</li>
<li>Pinned applications reject inspection and need a skip rule.</li>
<li>SSL rules are first match; no match means not inspected.</li>
<li>Skip rules must sit above the broad inspect rule and create blind spots.</li>
</ul></div>
`,hi:`
<h3>Sealed envelope ki problem</h3>
<p>Aaj ka lagbhag saara web traffic TLS se encrypted hota hai (log ab bhi "SSL" bolte hain). Socho Sahyadri Logistics se nikalne wala har letter sealed envelope mein hai. Gateway bahar likha address padh sakta hai, yaani host name, lekin letter nahi. Upload mein card number ya download mein virus dikhta hi nahi. <b>SSL inspection</b> yeh solve karta hai: gateway envelope kholta hai, letter padhta hai, wapas seal karta hai aur aage bhejta hai.</p>

<h3>Inspection kaise kaam karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Do TLS sessions">
<rect x="10" y="50" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="85" text-anchor="middle" class="svg-ink" font-size="13">PC / browser</text>
<rect x="260" y="50" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">Cloud gateway</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="11">plain text padhta hai</text>
<rect x="510" y="50" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="85" text-anchor="middle" class="svg-ink" font-size="13">Web server</text>
<line x1="130" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="195" y="40" text-anchor="middle" class="svg-muted" font-size="12">TLS session 1</text><text x="195" y="135" text-anchor="middle" class="svg-muted" font-size="11">company certificate</text>
<text x="445" y="40" text-anchor="middle" class="svg-muted" font-size="12">TLS session 2</text><text x="445" y="135" text-anchor="middle" class="svg-muted" font-size="11">asli site certificate</text>
</svg><p class="cap">Inspection ka matlab hai do alag TLS sessions aur beech mein ek reader.</p></div>
<p>Gateway browser ka TLS session khud khatam karta hai, phir asli site se doosra session kholta hai. Browser ko use, maan lo, bank.fin.example ka certificate dikhana padta hai. Uske paas asli site ki private key nahi ho sakti, to woh ek naya certificate <b>company ke apne root CA</b> (certificate authority) se sign karta hai. Browser use <b>tabhi accept karta hai jab device us root CA ko trust karta ho</b>. Yeh generic PKI fact hai: certificate tab trusted hota hai jab uski chain us root par khatam ho jo device ke paas pehle se hai.</p>

<h3>Failure ek: device root ko trust nahi karta</h3>
<p>Root install nahi hai to har inspected site par certificate warning ya simulator mein error 495 aata hai. Yahi ticket 320010 hai: Chennai ka PC (PC-CHN, user meena) har secure site par warning dikhata hai. Evidence: warning mein unknown issuer likha hai; koi doosra PC chal raha hai. Root cause: device mein company root certificate nahi hai. Fix: use install karo (lab mein client par <code>install-ca</code> command; real life mein device management push karta hai). Verify: <code>curl news.example</code> page return karta hai.</p>
<pre class="out">C:\\&gt; curl news.example
<span class="hl">Result: 495 certificate problem: issuer not trusted</span>
C:\\&gt; install-ca
Company root certificate installed in the device trust store.
C:\\&gt; curl news.example
Result: 200 OK  (inspected, rule: Inspect-all)</pre>

<h3>Failure do: certificate pinning</h3>
<p><b>Certificate pinning</b> ka matlab hai ki application apne saath exact certificate (ya key) ki copy rakhti hai aur kuch aur accept nahi karti, chahe operating system use trust kare. Yeh software updaters ko fake servers se bachata hai. Lekin inspection technically ek controlled impersonation hai, isliye pinned application use reject kar deti hai. Hamari company mein update.pinned.example (category Software updates) aisi hi app hai. Fix zyada certificates install karna nahi hai; fix us destination ke liye <b>do-not-inspect (skip) rule</b> hai. Traffic URL policy se allow rehta hai aur cloud se hi guzarta hai, bas end to end encrypted rehta hai.</p>

<h3>Order matters: skip upar, inspect neeche</h3>
<p>SSL rules bhi ordered hain, first match wins, actions <code>inspect</code>, <code>skip</code> ya <code>block</code>. Koi rule match na kare to connection <b>inspect nahi hota</b>.</p>
<table class="cmp"><tr><th>#</th><th>Rule</th><th>Match</th><th>Action</th></tr>
<tr><td>1</td><td>Skip-pinned-updates</td><td>category Software updates</td><td>skip</td></tr>
<tr><td>2</td><td>Skip-banking</td><td>category Banking</td><td>skip</td></tr>
<tr><td>3</td><td>Inspect-all</td><td>any</td><td>inspect</td></tr></table>
<p>Skip rules Inspect-all ke neeche hon to woh kabhi reach hi nahi hote, aur pinned app phir toot jaati hai. Simulator "inspect everything" ke neeche wale skip rule ke liye alert bhi deta hai. Banking privacy aur legal reasons se skip hoti hai, yeh normal business decision hai.</p>
<p>Ticket 320070 bilkul yahi hai: clean-up mein kisi ne exception hata di aur software updater TLS error ke saath fail ho gaya. Evidence: Policy tester update.pinned.example ke liye Inspect-all ko deciding dikhata hai, result 495. Root cause: skip rule gayab hai. Fix: use Inspect-all ke upar wapas add karo. Verify: updater chalta hai, Policy tester mein rule Skip-pinned-updates aur SSL decision skip dikhta hai.</p>

<h3>Uninspected traffic andha kyun hai</h3>
<p>Connection skip hone par stages 4, 5 aur 6 (full-URL, DLP, malware aur sandbox) sirf ciphertext dekhte hain. Isliye har skip rule ek jaanboojh kar banaya blind spot hai. Unhe kam, specific aur documented rakho.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> <b>Inspect</b> rule gateway ko TLS terminate aur re-originate karwata hai, to browser ko company root ka issued certificate milta hai. <b>Skip</b> rule original end-to-end TLS ko chhuta nahi. Root install karne se wire par kuch nahi badalta; bas browser badla hua certificate accept karne lagta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Root certificate saare devices tak pahunchne se pehle inspection roll out karna. (2) Pinned app ko theek karne ke liye sabke liye inspection band kar dena. (3) Skip rule ko broad inspect rule ke neeche rakhna. (4) Poori category jaise File sharing ko "complaint band karne ke liye" skip kar dena aur chupchaap DLP disable kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek app par certificate error aur baaki sab theek: pinning ki taraf ishara. Ek device ki har site par certificate error: missing root ki taraf ishara.</p></div>

<div class="scn"><h4>Friday clean-up, Monday updater failure</h4><p>Ek admin ne Friday ko purane exceptions hata diye. Monday subah Pune laptops par software updater TLS errors ke saath fail hua jabki browsing theek thi. Audit log mein delete hua skip rule dikha. Use wapas add karne se updates chal pade.</p><p><b>Seekh:</b> jo pichle hafte chal raha tha woh ruk jaye to pehle audit log padho.</p></div>

<div class="iv"><p class="q">"SSL inspection kisi application ko kyun tod sakta hai, aur aap kya karoge?"</p><p>Do TLS sessions aur company root samjhao. Certificate pinning wali apps badla hua certificate reject karti hain. Fix: broad inspect rule ke upar us destination tak scoped do-not-inspect rule, aur kam hui visibility ko accept karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inspection ek TLS session ko do mein todta hai, beech mein gateway padhta hai.</li>
<li>Devices ko company root CA trust karna padta hai warna certificate errors aate hain.</li>
<li>Pinned applications inspection reject karti hain aur skip rule maangti hain.</li>
<li>SSL rules first match hain; no match ka matlab not inspected.</li>
<li>Skip rules broad inspect rule ke upar rehte hain aur blind spots banate hain.</li>
</ul></div>
`}};export{e as default};