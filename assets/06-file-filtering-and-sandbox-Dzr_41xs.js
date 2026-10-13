var e={id:`file-sandbox`,h:{en:`File filtering and malware sandbox (concept)`,hi:`File filtering aur malware sandbox (concept)`},body:{en:`
<div class="note"><p><b>Reference only.</b> File filtering and the anti-malware sandbox are <b>not modelled</b> in the simulator. There is no lab for this chapter. It is here so you understand the idea, can answer interview questions, and know what to look for in the documentation for your NGFW version. Everything configuration-like below is labelled Reference configuration (not run in the simulator).</p></div>

<p>So far the engine looked at the request: a path, a host, a category. Files are different. A user downloads a spreadsheet; an attacker hopes it carries harmful code. This chapter is the defender's view of how a firewall helps with file-borne threats.</p>

<h3>Start with an analogy: the parcel room</h3>
<p>A company mail room does not give every parcel straight to the employee. It checks the label (who sent it, what type of parcel), compares it with a list of known bad senders, and opens suspicious ones in a safe room with gloves and a camera. The three steps map to file filtering, reputation checks and sandboxing.</p>

<h3>Three layers of file protection</h3>
<table class="cmp"><tr><th>Layer</th><th>Question it answers</th><th>Speed</th></tr>
<tr><td><b>File filtering</b> (by file type)</td><td>Is this kind of file allowed here at all? For example, executable programs from the Internet to Staff LAN.</td><td>Immediate</td></tr>
<tr><td><b>Reputation / signature check</b></td><td>Is this exact file already known to be bad (or good)?</td><td>Fast</td></tr>
<tr><td><b>Malware sandbox</b></td><td>What does an unknown file do when it runs in an isolated environment?</td><td>Slow: seconds to minutes</td></tr>
</table>

<h3>How a sandbox fits into the traffic flow</h3>
<ol>
<li>The engine detects a file in an allowed connection (this needs content visibility; encrypted downloads need HTTPS inspection first, chapter 4).</li>
<li>It checks the file type against the file policy. If the type is blocked, the transfer is stopped there.</li>
<li>For allowed but risky types, a hash or the file itself is checked against known verdicts.</li>
<li>If the verdict is unknown, the file can be sent to a sandbox service, which runs it in a monitored, isolated virtual machine and returns a verdict: clean, suspicious or malicious.</li>
<li>The engine logs the verdict and, if configured, blocks or allows the file.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="File inspection pipeline">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="13">Download</text><text x="65" y="76" text-anchor="middle" class="svg-muted" font-size="12">file in flow</text>
<rect x="150" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="205" y="58" text-anchor="middle" class="svg-ink" font-size="13">File type</text><text x="205" y="76" text-anchor="middle" class="svg-muted" font-size="12">allowed?</text>
<rect x="290" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="345" y="58" text-anchor="middle" class="svg-ink" font-size="13">Known verdict</text><text x="345" y="76" text-anchor="middle" class="svg-muted" font-size="12">hash lookup</text>
<rect x="430" y="30" width="110" height="60" rx="8" fill="#fed7aa"/><text x="485" y="58" text-anchor="middle" class="svg-ink" font-size="13">Sandbox</text><text x="485" y="76" text-anchor="middle" class="svg-muted" font-size="12">unknown files</text>
<rect x="560" y="30" width="70" height="60" rx="8" fill="#bbf7d0"/><text x="595" y="64" text-anchor="middle" class="svg-ink" font-size="13">Verdict</text>
<line x1="120" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2"/><line x1="260" y1="60" x2="290" y2="60" stroke="#64748b" stroke-width="2"/><line x1="400" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2"/><line x1="540" y1="60" x2="560" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="130" width="620" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Each stage logs. The sandbox adds delay, so policy decides what waits and what is blocked.</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Concept diagram, not a lab</text>
</svg><p class="cap">Cheap checks first, expensive sandbox last.</p></div>

<h3>Design questions you must answer</h3>
<ul>
<li><b>Hold or allow while waiting?</b> Holding the file protects better but delays the user. Allowing and alerting later is faster but weaker.</li>
<li><b>Privacy and data residency.</b> Many sandboxes are cloud services. The file leaves your network. Decide which file types and sources are allowed to be sent, and check the legal rules.</li>
<li><b>Visibility.</b> Encrypted traffic must be decrypted first, with the exclusions and trust caveats from chapter 4.</li>
<li><b>User message.</b> Tell users why a download was blocked and whom to contact.</li>
</ul>

<h3>What a defender writes down (Reference configuration, not run in the simulator)</h3>
<pre class="out">Reference configuration (not run in the simulator)
Traffic class:   Staff LAN to Internet, web downloads
File types:      executables and macro documents are blocked or sent for analysis
Known verdict:   file already known as malicious -> block and alert
Unknown file:    analysed in the sandbox service; user waits or gets the file later (policy choice)
Logging:         verdict and file name recorded at Stored level or higher
Check:           exact settings and names depend on your NGFW version, read its documentation</pre>

<div class="eg"><p><b>Worked example (thinking exercise).</b> A Pune accountant downloads an invoice archive from a new sender. The file type is allowed, the hash is unknown, so the engine sends it to the sandbox. Forty seconds later the verdict returns as suspicious. The log shows the file name, source host and verdict; the SOC contacts the accountant before the file is opened. Without the sandbox the same file would have been allowed because its type is permitted.</p></div>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Assuming the firewall opens files by default. It only does so when a file policy is applied to the rule traffic.</li>
<li>Expecting a sandbox to find everything: some malware waits or checks for sandboxes. It is one layer, not the only layer.</li>
<li>Forgetting that encrypted downloads are invisible without HTTPS inspection.</li>
<li>Sending sensitive internal documents to an external service without review.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> Do not describe the sandbox as signature-based. Signatures and hash checks are the fast layer; the sandbox is behavioural analysis for unknown files. Also remember this simulator does not run it.</p></div>

<div class="scn"><h4>The invoice that was not an invoice</h4><p>A small Network Kings partner office received a mail with a link to an archive named like an invoice. The user downloaded it over HTTPS. The firewall had no file policy on the Staff rule and HTTPS was not decrypted, so the file arrived unchecked. The endpoint protection later flagged it. The incident review changed three things: HTTPS inspection for the Staff rule, a file policy for risky types, and sandbox analysis for unknown files from new sources, with an alert to the SOC.</p><p><b>Lesson:</b> several cheap layers together beat one expensive layer.</p></div>

<div class="iv"><p class="q">"What is a malware sandbox and where does it fit in a firewall?"</p><p>Strong answer: an isolated environment where an unknown file is run and its behaviour observed. The firewall filters by type and known verdict first, and sends only unknown files to the sandbox. Mention the delay, the privacy question for cloud sandboxes, and that it needs content visibility, so HTTPS inspection comes first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>File protection is layered: type filter, known verdict, sandbox.</li>
<li>The sandbox analyses behaviour of unknown files; it is slow, so policy decides hold or allow.</li>
<li>Encrypted downloads need HTTPS inspection before files can be checked.</li>
<li>This topic is concept only; it is not simulated and has no lab.</li>
<li>For real settings, check the documentation for your NGFW version.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Sirf reference.</b> File filtering aur anti-malware sandbox simulator mein <b>model nahi</b> hain. Is chapter ka koi lab nahi hai. Yeh isliye hai taaki aap idea samjho, interview questions ke jawab de sako, aur jaano ki apne NGFW version ki documentation mein kya dekhna hai. Neeche jo kuch configuration jaisa hai woh Reference configuration (not run in the simulator) ke naam se label hai.</p></div>

<p>Ab tak engine ne request dekhi: path, host, category. Files alag hoti hain. Ek user spreadsheet download karta hai; attacker ummeed karta hai ki usme harmful code ho. Yeh chapter defender ka view hai ki firewall file-borne threats mein kaise madad karta hai.</p>

<h3>Ek analogy se shuru karo: parcel room</h3>
<p>Company ka mail room har parcel seedha employee ko nahi deta. Woh label check karta hai (kisne bheja, parcel ka type kya hai), known bad senders ki list se compare karta hai, aur suspicious parcels ko safe room mein gloves aur camera ke saath kholta hai. Teen steps file filtering, reputation checks aur sandboxing se map hote hain.</p>

<h3>File protection ki teen layers</h3>
<table class="cmp"><tr><th>Layer</th><th>Kaunsa sawaal solve karti hai</th><th>Speed</th></tr>
<tr><td><b>File filtering</b> (file type se)</td><td>Kya yahan is tarah ki file allowed hai bhi? Jaise Internet se Staff LAN tak executable programs.</td><td>Turant</td></tr>
<tr><td><b>Reputation / signature check</b></td><td>Kya yeh exact file pehle se bad (ya good) known hai?</td><td>Fast</td></tr>
<tr><td><b>Malware sandbox</b></td><td>Unknown file isolated environment mein chale to kya karti hai?</td><td>Slow: seconds se minutes</td></tr>
</table>

<h3>Sandbox traffic flow mein kahan fit hota hai</h3>
<ol>
<li>Engine allowed connection mein file detect karta hai (iske liye content visibility chahiye; encrypted downloads ko pehle HTTPS inspection chahiye, chapter 4).</li>
<li>Woh file type ko file policy se check karta hai. Type blocked ho to transfer wahin ruk jaata hai.</li>
<li>Allowed lekin risky types ke liye hash ya file ko known verdicts se check kiya jaata hai.</li>
<li>Verdict unknown ho to file sandbox service ko bheji ja sakti hai, jo use monitored, isolated virtual machine mein chalati hai aur verdict lautati hai: clean, suspicious ya malicious.</li>
<li>Engine verdict log karta hai aur, configure ho to, file block ya allow karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="File inspection pipeline">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="58" text-anchor="middle" class="svg-ink" font-size="13">Download</text><text x="65" y="76" text-anchor="middle" class="svg-muted" font-size="12">flow mein file</text>
<rect x="150" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="205" y="58" text-anchor="middle" class="svg-ink" font-size="13">File type</text><text x="205" y="76" text-anchor="middle" class="svg-muted" font-size="12">allowed?</text>
<rect x="290" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="345" y="58" text-anchor="middle" class="svg-ink" font-size="13">Known verdict</text><text x="345" y="76" text-anchor="middle" class="svg-muted" font-size="12">hash lookup</text>
<rect x="430" y="30" width="110" height="60" rx="8" fill="#fed7aa"/><text x="485" y="58" text-anchor="middle" class="svg-ink" font-size="13">Sandbox</text><text x="485" y="76" text-anchor="middle" class="svg-muted" font-size="12">unknown files</text>
<rect x="560" y="30" width="70" height="60" rx="8" fill="#bbf7d0"/><text x="595" y="64" text-anchor="middle" class="svg-ink" font-size="13">Verdict</text>
<line x1="120" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2"/><line x1="260" y1="60" x2="290" y2="60" stroke="#64748b" stroke-width="2"/><line x1="400" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2"/><line x1="540" y1="60" x2="560" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="130" width="620" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Har stage log karta hai. Sandbox delay jodta hai, isliye policy decide karti hai kya wait kare.</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Concept diagram, lab nahi</text>
</svg><p class="cap">Sasti checks pehle, mehengi sandbox aakhir mein.</p></div>

<h3>Design ke sawaal jinke jawab aapko dene hain</h3>
<ul>
<li><b>Wait karte waqt hold ya allow?</b> File hold karna better protect karta hai lekin user ko delay hota hai. Allow karke baad mein alert karna fast hai lekin weaker.</li>
<li><b>Privacy aur data residency.</b> Kayi sandboxes cloud services hain. File aapke network se bahar jaati hai. Decide karo ki kaunse file types aur sources bheje ja sakte hain, aur legal rules check karo.</li>
<li><b>Visibility.</b> Encrypted traffic ko pehle decrypt karna hoga, chapter 4 ke exclusions aur trust caveats ke saath.</li>
<li><b>User message.</b> Users ko batao ki download kyun block hua aur kisse contact karna hai.</li>
</ul>

<h3>Defender kya likh ke rakhta hai (Reference configuration, not run in the simulator)</h3>
<pre class="out">Reference configuration (not run in the simulator)
Traffic class:   Staff LAN to Internet, web downloads
File types:      executables and macro documents are blocked or sent for analysis
Known verdict:   file already known as malicious -> block and alert
Unknown file:    analysed in the sandbox service; user waits or gets the file later (policy choice)
Logging:         verdict and file name recorded at Stored level or higher
Check:           exact settings and names depend on your NGFW version, read its documentation</pre>

<div class="eg"><p><b>Worked example (thinking exercise).</b> Pune ka ek accountant naye sender se invoice archive download karta hai. File type allowed hai, hash unknown hai, isliye engine use sandbox ko bhejta hai. Chalis second baad verdict suspicious aata hai. Log file name, source host aur verdict dikhata hai; SOC file khulne se pehle accountant se contact karta hai. Sandbox ke bina wahi file allow ho jaati kyunki uska type permitted hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b></p><ul>
<li>Yeh maanna ki firewall files default mein kholta hai. Woh tabhi karta hai jab rule ke traffic par file policy lagi ho.</li>
<li>Sandbox se sab kuch pakadne ki ummeed: kuch malware wait karta hai ya sandbox check karta hai. Yeh ek layer hai, akeli layer nahi.</li>
<li>Yeh bhoolna ki HTTPS inspection ke bina encrypted downloads invisible hain.</li>
<li>Sensitive internal documents ko review ke bina external service ko bhejna.</li>
</ul></div>

<div class="exam"><p><b>Exam trap.</b> Sandbox ko signature-based mat batao. Signatures aur hash checks fast layer hain; sandbox unknown files ke liye behavioural analysis hai. Yeh bhi yaad rakho ki yeh simulator ise chalata nahi.</p></div>

<div class="scn"><h4>Invoice jo invoice nahi tha</h4><p>Network Kings ke ek chhote partner office ko mail aaya jisme invoice jaise naam ke archive ka link tha. User ne use HTTPS par download kiya. Firewall par Staff rule mein file policy nahi thi aur HTTPS decrypt nahi ho raha tha, isliye file bina check hue aa gayi. Endpoint protection ne baad mein flag kiya. Incident review ne teen cheezein badlin: Staff rule ke liye HTTPS inspection, risky types ke liye file policy, aur naye sources ki unknown files ke liye sandbox analysis, SOC ko alert ke saath.</p><p><b>Lesson:</b> kayi sasti layers milkar ek mehengi layer se behtar hoti hain.</p></div>

<div class="iv"><p class="q">"Malware sandbox kya hai aur firewall mein kahan fit hota hai?"</p><p>Strong answer: ek isolated environment jahan unknown file chalayi jaati hai aur uska behaviour dekha jaata hai. Firewall pehle type aur known verdict se filter karta hai, aur sirf unknown files sandbox ko bhejta hai. Delay, cloud sandboxes ka privacy sawaal, aur yeh ki content visibility chahiye (isliye pehle HTTPS inspection) mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>File protection layered hai: type filter, known verdict, sandbox.</li>
<li>Sandbox unknown files ka behaviour analyse karta hai; slow hai, isliye policy hold ya allow decide karti hai.</li>
<li>Encrypted downloads ko files check hone se pehle HTTPS inspection chahiye.</li>
<li>Yeh topic sirf concept hai; simulate nahi hota aur koi lab nahi hai.</li>
<li>Real settings ke liye apne NGFW version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};