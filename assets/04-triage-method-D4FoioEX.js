var e={id:`triage-method`,h:{en:`The triage method: scope, evidence, one change, proof and baselines`,hi:`Triage method: scope, evidence, ek change, proof aur baselines`},body:{en:`
<p>A pilot flying through cloud does not fly by feel. She follows a checklist and trusts instruments. Triage in wireless is your checklist. It protects you from the two most expensive habits in operations: guessing and changing several things at once.</p>
<h3>Six steps</h3>
<ol>
<li><b>Symptom.</b> Write the complaint in testable words: who (user, device), where (floor, AP), when (since 09:10), what SSID, what exactly happens (no SSID, wrong password, no IP, no internet).</li>
<li><b>Scope.</b> One client, one AP, one SSID, one VLAN or everyone? Ask a second user. Scope narrows the layer, as in chapter 2.</li>
<li><b>Evidence.</b> Collect read-only outputs from the suspected layer and the one below it. Copy them into the ticket before any change; this is your "before" picture.</li>
<li><b>Hypothesis and one change.</b> Name the single object that explains <i>all</i> the evidence. Change only that object, by the smallest edit.</li>
<li><b>Proof.</b> Test from the same client that failed, and run a negative test where relevant (a wrong password must still fail; the guest must still not reach servers).</li>
<li><b>Record.</b> Save the configuration, note the root cause, the change and the evidence in the ticket.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Triage decision">
<rect x="10" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ticket arrives</text>
<polygon points="215,15 290,45 215,75 140,45" fill="#fde68a"/><text x="215" y="49" text-anchor="middle" class="svg-ink" font-size="12">Scope?</text>
<rect x="330" y="10" width="130" height="30" rx="6" fill="#ddd6fe"/><text x="395" y="30" text-anchor="middle" class="svg-ink" font-size="12">One client: client layer</text>
<rect x="330" y="50" width="130" height="30" rx="6" fill="#bbf7d0"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="12">One AP: AP and port</text>
<rect x="475" y="10" width="155" height="30" rx="6" fill="#fed7aa"/><text x="552" y="30" text-anchor="middle" class="svg-ink" font-size="12">One SSID: WLC or AAA</text>
<rect x="475" y="50" width="155" height="30" rx="6" fill="#e2e8f0"/><text x="552" y="70" text-anchor="middle" class="svg-ink" font-size="12">All: trunk, DHCP, country</text>
<line x1="140" y1="45" x2="140" y2="45" stroke="#64748b"/><line x1="75" y1="70" x2="75" y2="100" stroke="#64748b"/><line x1="290" y1="45" x2="330" y2="25" stroke="#64748b"/><line x1="290" y1="45" x2="330" y2="65" stroke="#64748b"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Evidence, one change, proof, record. Then close.</text>
</svg><p class="cap">Scope picks the layer. The rest of the method is always the same.</p></div>
<h3>Why one change at a time</h3>
<p>Suppose a voice SSID fails and you enable the policy profile, edit the key and reboot an AP all at once. The phone connects. Which action fixed it? You will never know, you may have broken something else, and you cannot roll back one part. The 9800 even forces discipline: a WLAN must be shut down before its security is edited, a policy profile before its VLAN is changed. These rules exist because edits to live objects drop clients.</p>
<h3>Baselines: knowing normal</h3>
<p>Troubleshooting is comparison. A <b>baseline</b> is a saved picture of the healthy network: <code>show ap summary</code> with every AP registered and the country code, <code>show ap tag summary</code> with expected tags, <code>show wlan summary</code>, <code>show wireless profile policy summary</code>, <code>show ap dot11 5ghz summary</code> with channels and power, and a client count per SSID. Save these outputs with a date when the network works. During an incident you diff reality against the baseline, and the missing tag or disabled profile jumps out. Take a new baseline after every approved change.</p>
<div class="eg"><p><b>Worked example.</b> Baseline: 2 APs Registered, both PT-CAMPUS, four WLANs enabled, PP-STAFF ENABLED VLAN 20. Incident output: AP2 tag source Default. The diff is one line, the cause is one object, the fix is one command.</p></div>
<h3>Evidence worth collecting</h3>
<table class="cmp"><tr><th>Evidence</th><th>Why</th></tr>
<tr><td>Client MAC, SSID, time, location</td><td>Lets you find the right log lines</td></tr>
<tr><td>Client summary and detail</td><td>Shows state, AP, WLAN, VLAN, IP</td></tr>
<tr><td>AP summary and tag summary</td><td>Registered, tags, country</td></tr>
<tr><td>Policy profile detail</td><td>Status and VLAN</td></tr>
<tr><td>show logging</td><td>Timeline and mnemonics</td></tr>
<tr><td>show aaa servers</td><td>Requests and timeouts counters for RADIUS</td></tr>
</table>
<div class="tip"><p>Copy output with the command and the prompt included. A pasted line without the command is hard to trust later.</p></div>
<h3>Proving the fix</h3>
<p>A fix is proven by the <i>original</i> symptom disappearing and by nothing else breaking. In lab terms: after repairing the voice policy, PHONE1 shows VLAN 30 <b>and</b> LAPTOP1 still shows VLAN 20. That second check is your regression test. For security fixes add a negative test: a wrong password rejected, GUEST1 unable to ping RAD1.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Declaring victory because the repaired client works while the others are untested. (2) Fixing the symptom you see rather than the cause: pinging the phone works once DHCP is manually set, but the policy VLAN is still missing. (3) Not saving the configuration, so the next reload reverts the fix.</p></div>
<div class="exam"><p><b>Exam trap.</b> When asked what to do <i>before</i> a change, the correct answer is gather evidence and record the current state, not reload the AP.</p></div>
<div class="scn"><h4>Three changes, no idea</h4><p>An engineer facing a dead guest SSID enabled the policy profile, recreated the WLAN and bounced the uplink in five minutes. Guests connected, but the next morning staff users lost their VLAN. The recreated WLAN had lost its policy-tag map and the bounce hid it. A calm audit of the baseline versus the running-config repaired it, but the incident report could only say "something we did".</p><p><b>Lesson:</b> single changes keep cause and effect visible.</p></div>
<div class="iv"><p class="q">"What is a baseline and why do you need one?"</p><p>A dated copy of healthy show outputs (APs, tags, WLANs, profiles, radios, client counts). It turns troubleshooting into a diff and makes change reviews and rollbacks factual.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Six steps: symptom, scope, evidence, one change, proof, record.</li>
<li>Collect the "before" evidence ahead of any change.</li>
<li>One change at a time keeps cause and effect clear.</li>
<li>Baselines let you spot the difference quickly.</li>
<li>Prove with the original client plus a regression and a negative test.</li>
</ul></div>
`,hi:`
<p>Badal mein udta pilot feel se nahi udta. Woh checklist follow karti hai aur instruments par bharosa karti hai. Wireless mein triage aapki checklist hai. Yeh operations ki do sabse mehngi aadaton se bachata hai: andaza lagana aur ek saath kai cheezein badalna.</p>
<h3>Chhe steps</h3>
<ol>
<li><b>Symptom.</b> Complaint ko testable shabdon mein likho: kaun (user, device), kahan (floor, AP), kab (09:10 se), kaunsa SSID, exactly kya hota hai (SSID nahi, galat password, IP nahi, internet nahi).</li>
<li><b>Scope.</b> Ek client, ek AP, ek SSID, ek VLAN ya sab? Doosre user se poochho. Scope layer ko narrow karta hai, jaise chapter 2 mein.</li>
<li><b>Evidence.</b> Suspected layer aur uske neeche wali layer ke read-only outputs collect karo. Kisi change se pehle unhe ticket mein copy karo; yeh aapki "before" tasveer hai.</li>
<li><b>Hypothesis aur ek change.</b> Woh ek object batao jo <i>saare</i> evidence ko explain kare. Sirf wahi object badlo, sabse chhote edit se.</li>
<li><b>Proof.</b> Usi client se test karo jo fail hua tha, aur jahan zaroori ho negative test chalao (galat password ab bhi fail ho; guest ab bhi servers tak na pahunche).</li>
<li><b>Record.</b> Configuration save karo, ticket mein root cause, change aur evidence likho.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Triage decision">
<rect x="10" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">Ticket aaya</text>
<polygon points="215,15 290,45 215,75 140,45" fill="#fde68a"/><text x="215" y="49" text-anchor="middle" class="svg-ink" font-size="12">Scope?</text>
<rect x="330" y="10" width="130" height="30" rx="6" fill="#ddd6fe"/><text x="395" y="30" text-anchor="middle" class="svg-ink" font-size="12">Ek client: client layer</text>
<rect x="330" y="50" width="130" height="30" rx="6" fill="#bbf7d0"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="12">Ek AP: AP aur port</text>
<rect x="475" y="10" width="155" height="30" rx="6" fill="#fed7aa"/><text x="552" y="30" text-anchor="middle" class="svg-ink" font-size="12">Ek SSID: WLC ya AAA</text>
<rect x="475" y="50" width="155" height="30" rx="6" fill="#e2e8f0"/><text x="552" y="70" text-anchor="middle" class="svg-ink" font-size="12">Sab: trunk, DHCP, country</text>
<line x1="75" y1="70" x2="75" y2="100" stroke="#64748b"/><line x1="290" y1="45" x2="330" y2="25" stroke="#64748b"/><line x1="290" y1="45" x2="330" y2="65" stroke="#64748b"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Evidence, ek change, proof, record. Phir close.</text>
</svg><p class="cap">Scope layer chunta hai. Baaki method hamesha same rehta hai.</p></div>
<h3>Ek samay mein ek change kyun</h3>
<p>Maano voice SSID fail hai aur aap policy profile enable karte ho, key edit karte ho aur AP reboot karte ho, sab ek saath. Phone connect ho gaya. Kisne fix kiya? Aapko kabhi pata nahi chalega, ho sakta hai kuch aur toot gaya ho, aur aap ek hissa rollback nahi kar sakte. 9800 khud discipline force karta hai: WLAN ki security edit karne se pehle use shut down karna padta hai, policy profile ka VLAN badalne se pehle policy profile. Yeh rules isliye hain kyunki live objects ke edits clients ko gira dete hain.</p>
<h3>Baselines: normal kya hai pata hona</h3>
<p>Troubleshooting comparison hai. <b>Baseline</b> healthy network ki saved tasveer hai: <code>show ap summary</code> jisme har AP registered aur country code, <code>show ap tag summary</code> expected tags ke saath, <code>show wlan summary</code>, <code>show wireless profile policy summary</code>, <code>show ap dot11 5ghz summary</code> channels aur power ke saath, aur har SSID par client count. Network theek ho tab inhe date ke saath save karo. Incident mein aap reality ko baseline se diff karte ho, aur missing tag ya disabled profile saamne aa jaata hai. Har approved change ke baad naya baseline lo.</p>
<div class="eg"><p><b>Worked example.</b> Baseline: 2 APs Registered, dono PT-CAMPUS, chaar WLANs enabled, PP-STAFF ENABLED VLAN 20. Incident output: AP2 tag source Default. Diff ek line hai, cause ek object hai, fix ek command hai.</p></div>
<h3>Kaunsa evidence collect karna chahiye</h3>
<table class="cmp"><tr><th>Evidence</th><th>Kyun</th></tr>
<tr><td>Client MAC, SSID, time, location</td><td>Sahi log lines dhundhne mein madad</td></tr>
<tr><td>Client summary aur detail</td><td>State, AP, WLAN, VLAN, IP dikhata hai</td></tr>
<tr><td>AP summary aur tag summary</td><td>Registered, tags, country</td></tr>
<tr><td>Policy profile detail</td><td>Status aur VLAN</td></tr>
<tr><td>show logging</td><td>Timeline aur mnemonics</td></tr>
<tr><td>show aaa servers</td><td>RADIUS ke requests aur timeouts counters</td></tr>
</table>
<div class="tip"><p>Output ko command aur prompt ke saath copy karo. Command ke bina paste ki hui line baad mein bharose layak nahi hoti.</p></div>
<h3>Fix prove karna</h3>
<p>Fix tab prove hota hai jab <i>original</i> symptom chala jaye aur kuch aur na toote. Lab ke terms mein: voice policy repair ke baad PHONE1 VLAN 30 dikhata hai <b>aur</b> LAPTOP1 ab bhi VLAN 20 dikhata hai. Woh doosra check aapka regression test hai. Security fixes ke liye negative test jodo: galat password reject ho, GUEST1 RAD1 ko ping na kar sake.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Repaired client chalne par jeet declare karna jabki baaki untested hain. (2) Cause ke bajaye dikhne wale symptom ko fix karna: manual DHCP set karne par phone ping hota hai lekin policy VLAN abhi bhi missing hai. (3) Configuration save na karna, to agla reload fix ko revert kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab poocha jaye ki change se <i>pehle</i> kya karna hai, sahi jawab hai evidence collect karo aur current state record karo, AP reload nahi.</p></div>
<div class="scn"><h4>Teen changes, kuch pata nahi</h4><p>Mara hua guest SSID dekh kar ek engineer ne paanch minute mein policy profile enable kiya, WLAN recreate kiya aur uplink bounce kiya. Guests connect ho gaye, lekin agli subah staff users ka VLAN chala gaya. Recreate kiye WLAN ka policy-tag map kho gaya tha aur bounce ne use chhupa diya tha. Baseline versus running-config ke shaant audit ne repair kar diya, lekin incident report sirf "humne kuch kiya" keh paayi.</p><p><b>Seekh:</b> single changes cause aur effect ko dikhne dete hain.</p></div>
<div class="iv"><p class="q">"Baseline kya hai aur kyun chahiye?"</p><p>Healthy show outputs ki dated copy (APs, tags, WLANs, profiles, radios, client counts). Yeh troubleshooting ko diff bana deta hai aur change reviews aur rollbacks ko factual banata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe steps: symptom, scope, evidence, ek change, proof, record.</li>
<li>Kisi bhi change se pehle "before" evidence collect karo.</li>
<li>Ek samay mein ek change cause aur effect saaf rakhta hai.</li>
<li>Baselines se difference jaldi dikhta hai.</li>
<li>Original client ke saath regression aur negative test se prove karo.</li>
</ul></div>
`}};export{e as default};