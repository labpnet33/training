var e={id:`trajectory`,h:{en:`Device trajectory and file trajectory: finding patient zero (Lab c)`,hi:`Device trajectory aur file trajectory: patient zero dhoondhna (Lab c)`},body:{en:`
<p>Epidemiologists tracking an outbreak ask two questions. For one patient: "where were you, what did you eat, who did you meet, in what order?" For the disease: "who has it, who had it first, how did it travel from person to person?" Secure Endpoint gives you both views. <b>Device trajectory</b> is the diary of one computer. <b>File trajectory</b> is the travel map of one file across the whole organisation. Together they find <b>patient zero</b>, the first machine and the first action of an incident.</p>

<h3>Device trajectory</h3>
<p>Device trajectory shows the recorded activity of a single computer on a timeline: files created, moved and executed, the <b>parent process</b> that did it, network connections with the process that made them, detections, quarantines and isolation events. Each file is shown with its disposition colour, so a malicious child stands out under a clean parent. You use it to answer:</p>
<ul>
<li>How did the file arrive? (Written by <code>outlook.exe</code> means an attachment; by <code>chrome.exe</code> means a download; by <code>explorer.exe</code> often means a user copied or double-clicked it.)</li>
<li>What did it do next? Child processes, persistence, connections.</li>
<li>Is it still active? Later events after the first detection.</li>
</ul>

<h3>File trajectory</h3>
<p>File trajectory takes one SHA-256 and shows every computer in the organisation that has seen it, ordered by time: <b>first seen</b>, who created it, who executed it, where it was quarantined. It answers "how far did this spread?" and, sorted by time, "where did it start?". It works for clean and unknown files too, which is what makes retrospection and scoping possible.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="File trajectory across three PCs">
<line x1="120" y1="40" x2="620" y2="40" stroke="#64748b" stroke-width="1"/>
<text x="20" y="44" class="svg-muted" font-size="12">time</text>
<text x="160" y="30" text-anchor="middle" class="svg-muted" font-size="12">09:01</text><text x="360" y="30" text-anchor="middle" class="svg-muted" font-size="12">09:44</text><text x="540" y="30" text-anchor="middle" class="svg-muted" font-size="12">10:12</text>
<text x="20" y="84" class="svg-ink" font-size="13">PC-SALES</text><text x="20" y="144" class="svg-ink" font-size="13">PC-HR</text><text x="20" y="204" class="svg-ink" font-size="13">PC-FIN</text>
<line x1="120" y1="80" x2="620" y2="80" stroke="#e2e8f0" stroke-width="10"/><line x1="120" y1="140" x2="620" y2="140" stroke="#e2e8f0" stroke-width="10"/><line x1="120" y1="200" x2="620" y2="200" stroke="#e2e8f0" stroke-width="10"/>
<circle cx="160" cy="80" r="10" fill="#fed7aa"/><text x="185" y="70" class="svg-accent" font-size="12">first seen, parent outlook.exe</text>
<circle cx="360" cy="140" r="10" fill="#fed7aa"/><text x="385" y="130" class="svg-muted" font-size="12">parent chrome.exe</text>
<circle cx="540" cy="200" r="10" fill="#fed7aa"/><text x="460" y="190" class="svg-muted" font-size="12">parent chrome.exe</text>
</svg><p class="cap">File trajectory of invoice_2026.exe in lab (c): the earliest execution is patient zero.</p></div>

<h3>Lab (c) walkthrough: NOC ticket, find patient zero</h3>
<p>The SOC reports that <code>invoice_2026.exe</code> executed on PC-SALES (10.10.0.11), PC-HR (10.10.0.12) and PC-FIN (10.10.0.13). All three are in the Workstations group with the Protect policy, yet the file ran on all three. <b>Step 1:</b> read the Events tab, sorted by time.</p>
<pre class="out">Time                 Event             Computer  File              Detail
<span class="hl">2026-09-29 09:01:04  Executed malware  PC-SALES  invoice_2026.exe  Allowed by allow list</span>
2026-09-29 09:44:39  Executed malware  PC-HR     invoice_2026.exe  Allowed by allow list
2026-09-29 10:12:57  Executed malware  PC-FIN    invoice_2026.exe  Allowed by allow list</pre>
<p>The detail column already tells you the root cause: the hash is on the <b>Allowed</b> list, which overrides the Malicious disposition. The earliest execution is <b>PC-SALES</b>, so that is patient zero (task 1).</p>
<p><b>Step 2:</b> open Device Trajectory for PC-SALES to see how it arrived.</p>
<pre class="out">Device Trajectory: PC-SALES
2026-09-29 09:01:04  Executed  invoice_2026.exe  &lt;- <span class="hl">outlook.exe</span>
                     SHA-256 a1b2c3d4e5f6...ccddeeff00  disposition Malicious
                     threat W32.Ransom.Rans:Trojan</pre>
<p>The parent process is <b>outlook.exe</b> (task 2): the file was opened from an email attachment. On PC-HR and PC-FIN the parent was <code>chrome.exe</code>, meaning those users downloaded it later, probably from a link or a shared copy. Patient zero is where the email landed.</p>
<p><b>Step 3:</b> contain patient zero and verify.</p>
<pre class="code"><span class="c">! Secure Endpoint console on SEC-CLOUD</span>
Computers &gt; PC-SALES &gt; Isolate</pre>
<pre class="out">PC-SALES&gt; ping 203.0.113.9
<span class="hl">203.0.113.9 icmp_seq=1 timeout</span>
203.0.113.9 icmp_seq=2 timeout
...</pre>
<p>In a real incident you would continue: isolate PC-HR and PC-FIN too, <b>remove the over-broad Allowed list entry</b> so the Protect policy can quarantine the file again, ask the email team to find and remediate the original message (chapter 11), and restore encrypted data from backup.</p>

<div class="eg"><p><b>Worked example: reading prevalence.</b> File trajectory for an unknown file shows it on 1 of 2,400 computers, created by <code>chrome.exe</code> 3 minutes ago. Low prevalence plus a fresh download is a classic sign to submit it to Secure Malware Analytics. Another file shows on 2,350 of 2,400 computers, created by the software deployment service months ago: that is your standard image, and probably benign even if it is Unknown.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the computer with the loudest alert as patient zero. The SOC often notices the third or fourth victim first. Always sort the file trajectory by time and read the parent process on the earliest host.</p></div>

<div class="exam"><p><b>Exam trap.</b> Device trajectory = one computer, many files and processes. File trajectory = one file (SHA-256), many computers. If the question asks "which hosts in the organisation have this file?", the answer is file trajectory.</p></div>

<div class="scn"><h4>Patient zero was not the CFO</h4><p>An alert fired on the CFO's laptop and the incident was escalated as a targeted attack on the executive. File trajectory told a different story: the same loader had first appeared 40 minutes earlier on a reception PC, written by <code>outlook.exe</code> from a "parcel delivery" email sent to a shared mailbox. The CFO had received a forwarded copy. Isolating only the CFO's laptop would have left the original infection running.</p><p><b>Lesson:</b> trust the timeline, not the job title. Patient zero is the earliest event.</p></div>

<div class="iv"><p class="q">"How would you find patient zero in a Secure Endpoint incident?"</p><p>Strong answer: take the SHA-256 from the event, open file trajectory, sort by time and find the first computer that saw or executed it. Then open device trajectory on that computer and read the parent process to learn the delivery vector, for example <code>outlook.exe</code> for email or a browser for a download. Contain that host first, then scope the others and fix the root cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device trajectory: timeline of one computer with parent processes, files, connections and detections.</li>
<li>File trajectory: one SHA-256 across all computers, ordered by first seen.</li>
<li>Patient zero = earliest execution; its parent process reveals the delivery vector.</li>
<li>Lab (c): PC-SALES at 09:01:04, parent <code>outlook.exe</code>, root cause an over-broad Allowed list.</li>
<li>Prevalence (how many computers have the file) helps judge unknown files.</li>
</ul></div>
`,hi:`
<p>Outbreak track karne wale epidemiologists do sawaal poochte hain. Ek patient ke liye: "aap kahan the, kya khaya, kisse mile, kis order mein?" Bimaari ke liye: "kisko hai, sabse pehle kisko hua, insaan se insaan tak kaise gayi?" Secure Endpoint aapko dono views deta hai. <b>Device trajectory</b> ek computer ki diary hai. <b>File trajectory</b> ek file ka poori organisation mein travel map hai. Dono milkar <b>patient zero</b> dhoondhte hain, incident ki pehli machine aur pehla action.</p>

<h3>Device trajectory</h3>
<p>Device trajectory ek computer ki recorded activity timeline par dikhati hai: files create, move aur execute hona, woh <b>parent process</b> jisne yeh kiya, network connections unhe banane wale process ke saath, detections, quarantines aur isolation events. Har file apne disposition colour ke saath dikhti hai, isliye clean parent ke neeche malicious child alag dikhta hai. Aap ise in sawaalon ke liye use karte ho:</p>
<ul>
<li>File kaise aayi? (<code>outlook.exe</code> ne likhi matlab attachment; <code>chrome.exe</code> ne matlab download; <code>explorer.exe</code> ne aksar matlab user ne copy ya double-click kiya.)</li>
<li>Usne aage kya kiya? Child processes, persistence, connections.</li>
<li>Kya woh abhi bhi active hai? Pehli detection ke baad ke events.</li>
</ul>

<h3>File trajectory</h3>
<p>File trajectory ek SHA-256 leti hai aur organisation ka har woh computer dikhati hai jisne use dekha, time ke order mein: <b>first seen</b>, kisne create kiya, kisne execute kiya, kahan quarantine hui. Yeh jawab deti hai "yeh kitna phaila?" aur, time se sort karke, "yeh kahan se shuru hua?". Yeh clean aur unknown files ke liye bhi kaam karti hai, isi se retrospection aur scoping possible hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Teen PCs par file trajectory">
<line x1="120" y1="40" x2="620" y2="40" stroke="#64748b" stroke-width="1"/>
<text x="20" y="44" class="svg-muted" font-size="12">time</text>
<text x="160" y="30" text-anchor="middle" class="svg-muted" font-size="12">09:01</text><text x="360" y="30" text-anchor="middle" class="svg-muted" font-size="12">09:44</text><text x="540" y="30" text-anchor="middle" class="svg-muted" font-size="12">10:12</text>
<text x="20" y="84" class="svg-ink" font-size="13">PC-SALES</text><text x="20" y="144" class="svg-ink" font-size="13">PC-HR</text><text x="20" y="204" class="svg-ink" font-size="13">PC-FIN</text>
<line x1="120" y1="80" x2="620" y2="80" stroke="#e2e8f0" stroke-width="10"/><line x1="120" y1="140" x2="620" y2="140" stroke="#e2e8f0" stroke-width="10"/><line x1="120" y1="200" x2="620" y2="200" stroke="#e2e8f0" stroke-width="10"/>
<circle cx="160" cy="80" r="10" fill="#fed7aa"/><text x="185" y="70" class="svg-accent" font-size="12">first seen, parent outlook.exe</text>
<circle cx="360" cy="140" r="10" fill="#fed7aa"/><text x="385" y="130" class="svg-muted" font-size="12">parent chrome.exe</text>
<circle cx="540" cy="200" r="10" fill="#fed7aa"/><text x="460" y="190" class="svg-muted" font-size="12">parent chrome.exe</text>
</svg><p class="cap">Lab (c) mein invoice_2026.exe ki file trajectory: sabse pehla execution patient zero hai.</p></div>

<h3>Lab (c) walkthrough: NOC ticket, patient zero dhoondho</h3>
<p>SOC report karta hai ki <code>invoice_2026.exe</code> PC-SALES (10.10.0.11), PC-HR (10.10.0.12) aur PC-FIN (10.10.0.13) par execute hui. Teeno Protect policy wale Workstations group mein hain, phir bhi file teeno par chali. <b>Step 1:</b> Events tab time se sort karke padho.</p>
<pre class="out">Time                 Event             Computer  File              Detail
<span class="hl">2026-09-29 09:01:04  Executed malware  PC-SALES  invoice_2026.exe  Allowed by allow list</span>
2026-09-29 09:44:39  Executed malware  PC-HR     invoice_2026.exe  Allowed by allow list
2026-09-29 10:12:57  Executed malware  PC-FIN    invoice_2026.exe  Allowed by allow list</pre>
<p>Detail column pehle hi root cause bata deta hai: hash <b>Allowed</b> list par hai, jo Malicious disposition ko override karta hai. Sabse pehla execution <b>PC-SALES</b> hai, isliye wahi patient zero hai (task 1).</p>
<p><b>Step 2:</b> PC-SALES ki Device Trajectory kholo yeh dekhne ke liye ki file kaise aayi.</p>
<pre class="out">Device Trajectory: PC-SALES
2026-09-29 09:01:04  Executed  invoice_2026.exe  &lt;- <span class="hl">outlook.exe</span>
                     SHA-256 a1b2c3d4e5f6...ccddeeff00  disposition Malicious
                     threat W32.Ransom.Rans:Trojan</pre>
<p>Parent process <b>outlook.exe</b> hai (task 2): file email attachment se kholi gayi. PC-HR aur PC-FIN par parent <code>chrome.exe</code> tha, matlab un users ne baad mein use download kiya, shayad kisi link ya shared copy se. Patient zero wahi hai jahan email utri.</p>
<p><b>Step 3:</b> patient zero ko contain karo aur verify karo.</p>
<pre class="code"><span class="c">! SEC-CLOUD par Secure Endpoint console</span>
Computers &gt; PC-SALES &gt; Isolate</pre>
<pre class="out">PC-SALES&gt; ping 203.0.113.9
<span class="hl">203.0.113.9 icmp_seq=1 timeout</span>
203.0.113.9 icmp_seq=2 timeout
...</pre>
<p>Real incident mein aap aage badhte: PC-HR aur PC-FIN ko bhi isolate karte, <b>over-broad Allowed list entry hataate</b> taaki Protect policy file ko phir se quarantine kar sake, email team se original message dhoondhkar remediate karwaate (chapter 11), aur encrypted data backup se restore karte.</p>

<div class="eg"><p><b>Worked example: prevalence padhna.</b> Ek unknown file ki file trajectory use 2,400 mein se 1 computer par dikhati hai, 3 minute pehle <code>chrome.exe</code> dwara create hui. Low prevalence plus taaza download ise Secure Malware Analytics ko submit karne ka classic sign hai. Ek doosri file 2,400 mein se 2,350 computers par dikhti hai, mahinon pehle software deployment service dwara create hui: woh aapki standard image hai, aur Unknown hone par bhi shayad benign hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Sabse tez alert wale computer ko patient zero maan lena. SOC aksar teesre ya chauthe victim ko pehle notice karta hai. Hamesha file trajectory ko time se sort karo aur sabse pehle host par parent process padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Device trajectory = ek computer, kai files aur processes. File trajectory = ek file (SHA-256), kai computers. Agar question poochta hai "organisation ke kin hosts par yeh file hai?", to answer file trajectory hai.</p></div>

<div class="scn"><h4>Patient zero CFO nahi tha</h4><p>CFO ke laptop par alert fire hua aur incident ko executive par targeted attack ki tarah escalate kiya gaya. File trajectory ne alag kahani batayi: wahi loader 40 minute pehle reception PC par aaya tha, shared mailbox ko bheji "parcel delivery" email se <code>outlook.exe</code> dwara likha gaya. CFO ko forwarded copy mili thi. Sirf CFO ka laptop isolate karne se original infection chalta rehta.</p><p><b>Seekh:</b> timeline par bharosa karo, job title par nahi. Patient zero sabse pehla event hai.</p></div>

<div class="iv"><p class="q">"Secure Endpoint incident mein patient zero kaise dhoondhoge?"</p><p>Strong answer: event se SHA-256 lo, file trajectory kholo, time se sort karo aur pehla computer dhoondho jisne use dekha ya execute kiya. Phir us computer par device trajectory kholo aur delivery vector jaanne ke liye parent process padho, jaise email ke liye <code>outlook.exe</code> ya download ke liye browser. Pehle us host ko contain karo, phir baaki ko scope karo aur root cause fix karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device trajectory: ek computer ki timeline, parent processes, files, connections aur detections ke saath.</li>
<li>File trajectory: ek SHA-256 saare computers par, first seen ke order mein.</li>
<li>Patient zero = sabse pehla execution; uska parent process delivery vector batata hai.</li>
<li>Lab (c): PC-SALES 09:01:04 par, parent <code>outlook.exe</code>, root cause over-broad Allowed list.</li>
<li>Prevalence (kitne computers par file hai) unknown files judge karne mein madad karta hai.</li>
</ul></div>
`}};export{e as default};