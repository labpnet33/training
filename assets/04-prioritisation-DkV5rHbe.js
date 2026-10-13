var e={id:`prioritise`,h:{en:`From score to priority: temporal, environmental, CVSS v4, EPSS and KEV`,hi:`Score se priority tak: temporal, environmental, CVSS v4, EPSS aur KEV`},body:{en:`
<p>Back to the emergency room. Two patients both have a triage score of 8. One is stable and waiting quietly; the other's blood pressure is dropping right now. A good doctor treats the second one first. Vulnerability management works the same way: the CVSS base score says how bad a flaw <i>could</i> be; <b>exploitation data</b> and <b>your environment</b> say how urgent it is <i>today</i>.</p>

<h3>CVSS v3.1 temporal metrics</h3>
<p>The temporal score multiplies the base score by three factors that change over time:</p>
<table class="cmp"><tr><th>Metric</th><th>Values (multiplier)</th></tr>
<tr><td>Exploit Code Maturity (E)</td><td>High 1, Functional 0.97, Proof-of-Concept 0.94, Unproven 0.91, Not Defined 1</td></tr>
<tr><td>Remediation Level (RL)</td><td>Unavailable 1, Workaround 0.97, Temporary Fix 0.96, Official Fix 0.95</td></tr>
<tr><td>Report Confidence (RC)</td><td>Confirmed 1, Reasonable 0.96, Unknown 0.92</td></tr>
</table>
<p>Temporal = Roundup(Base x E x RL x RC). It can only stay the same or go down.</p>

<h3>CVSS v3.1 environmental metrics</h3>
<p>Here <b>you</b> describe your organisation. <b>Security requirements</b> CR, IR and AR (Low 0.5, Medium 1, High 1.5) say how much confidentiality, integrity and availability of this asset matter. <b>Modified base metrics</b> (MAV, MAC, MPR and so on) let you correct the base for your deployment, for example MAV:L when the service is only reachable from the console.</p>

<div class="eg"><p><b>Worked example: VUL-103, base 8.1.</b></p><ol>
<li><b>Temporal.</b> A public proof of concept exists (E:P 0.94), the vendor has an official fix (RL:O 0.95), confirmed (RC:C 1). 8.1 x 0.94 x 0.95 x 1 = 7.233, roundup <b>7.3</b>.</li>
<li><b>Environmental.</b> The HR portal holds salary data, so CR:H and IR:H (1.5); AR:L. Modified impact sub-score = min(1 - (1 - 1.5 x 0.56) x (1 - 1.5 x 0.56) x (1 - 0), 0.915) = min(0.974, 0.915) = 0.915. Modified impact = 6.42 x 0.915 = 5.874; plus exploitability 2.835 = 8.709, roundup 8.8. Apply the temporal factors: 8.8 x 0.94 x 0.95 = 7.858, roundup <b>7.9</b>.</li></ol>
<p>So the same flaw is 8.1 in the advisory, 7.3 after temporal context and 7.9 for this organisation.</p></div>

<h3>CVSS v4.0 in one page</h3>
<p>FIRST published CVSS v4.0 in 2023. What changed:</p>
<ul>
<li>Four groups: <b>Base, Threat, Environmental, Supplemental</b>. "Temporal" is renamed <b>Threat</b> and keeps only <b>Exploit Maturity</b> (Attacked, POC, Unreported).</li>
<li>New base metric <b>Attack Requirements (AT)</b>: None or Present, for conditions like a race window or a specific configuration. UI becomes None, Passive or Active.</li>
<li><b>Scope is removed.</b> Impact is split into the <b>vulnerable system</b> (VC, VI, VA) and <b>subsequent systems</b> (SC, SI, SA).</li>
<li>Supplemental metrics (Safety, Automatable, Recovery, Value Density and others) add context but do not change the score.</li>
<li>Names say which groups were used: <b>CVSS-B</b>, CVSS-BT, CVSS-BE, CVSS-BTE.</li>
<li>Scoring uses a lookup of "macro vectors" rather than a simple formula, so you read it from a calculator. Example: <code>CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N</code> = <b>9.3</b>.</li>
</ul>

<h3>EPSS, KEV and SSVC: is anyone exploiting it?</h3>
<dl class="terms">
<dt>EPSS (Exploit Prediction Scoring System)</dt><dd>A FIRST model, updated daily, giving the <b>probability (0 to 1)</b> that exploitation activity for a CVE is seen in the next <b>30 days</b>, plus a percentile. EPSS 0.94 means very likely; 0.02 means unlikely.</dd>
<dt>CISA KEV (Known Exploited Vulnerabilities catalog)</dt><dd>A list of CVEs with <b>evidence of active exploitation</b> and clear remediation. US federal agencies must fix them by a due date (BOD 22-01); everyone else uses KEV as a "fix first" list. EPSS <i>predicts</i>; KEV <i>confirms</i>.</dd>
<dt>SSVC (Stakeholder-Specific Vulnerability Categorization)</dt><dd>A decision tree used by CISA. It asks about exploitation, technical impact, whether exploitation is automatable and mission impact, and outputs <b>Track, Track*, Attend or Act</b>.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Prioritisation funnel">
<polygon points="20,15 620,15 560,65 80,65" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">2,000 scanner findings (all CVSS scores)</text>
<polygon points="80,72 560,72 500,122 140,122" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Reachable and on important assets</text>
<polygon points="140,129 500,129 440,179 200,179" fill="#fde68a"/><text x="320" y="159" text-anchor="middle" class="svg-ink" font-size="13">KEV listed or high EPSS</text>
<polygon points="200,186 440,186 380,222 260,222" fill="#fed7aa"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">P1 tonight</text>
</svg><p class="cap">Each layer of context removes findings until only the truly urgent ones remain.</p></div>

<h3>Walking the lab: five findings, one window</h3>
<table class="cmp"><tr><th>Finding</th><th>CVSS</th><th>EPSS</th><th>KEV</th><th>Exposure</th><th>Priority</th></tr>
<tr><td>VUL-101 VPN gateway path traversal to RCE</td><td>9.8</td><td>0.94</td><td>Yes</td><td>Internet, business-critical</td><td><b>P1</b> + ticket</td></tr>
<tr><td>VUL-102 Log4Shell on build agent ci-02</td><td>10.0</td><td>0.97</td><td>Yes</td><td>Internal, no inbound</td><td><b>P2</b></td></tr>
<tr><td>VUL-103 HR portal SQL injection</td><td>8.1</td><td>0.31</td><td>No</td><td>Internet, high</td><td>P2 with WAF rule meanwhile</td></tr>
<tr><td>VUL-104 print server local privilege escalation</td><td>7.8</td><td>0.02</td><td>No</td><td>Internal, low</td><td>P3 or P4, never P1</td></tr>
<tr><td>VUL-105 wiki stored XSS</td><td>5.4</td><td>0.04</td><td>No</td><td>Internal, low</td><td>P4</td></tr>
</table>
<p>VUL-101 wins even though VUL-102 has the higher base score: it is exploited in the wild <b>and</b> reachable from the internet on a business-critical asset. Setting P1 and clicking <b>Create remediation ticket</b> produces:</p>
<pre class="out">VUL-101 · CVE-2026-20417
Priority  <span class="hl">P1</span>   Ticket  <span class="hl">CHG-5100</span>
Due       48 hours</pre>

<div class="warn"><p><b>Common mistake.</b> Sorting the scanner export by CVSS and patching from the top. Teams then spend the window on a 10.0 in an isolated lab while an internet-facing 9.8 that is in KEV waits. Also: forgetting <b>compensating controls</b> (IPS signature, WAF rule, disabling the feature, restricting access) when a patch cannot be applied today.</p></div>

<div class="exam"><p><b>Exam traps.</b> EPSS is a probability for the next 30 days, not a severity. KEV means "exploited in the wild". CVSS v4 has no Scope metric and calls the time-based group "Threat". Temporal and environmental scores never exceed what the formulas allow; temporal can only lower the base.</p></div>

<div class="scn"><h4>The printer that ate the weekend</h4><p>A team's policy said "every CVSS 7.0 and above within 7 days". A print-driver privilege escalation (7.8, local only, EPSS 0.02) forced weekend work on 300 print servers, while an SSL VPN flaw scored 7.2 but listed in KEV went into the 30-day queue because it was "only High". The VPN was exploited ten days later. The policy was rewritten: KEV and internet exposure first, EPSS above a threshold next, base score only as a tie-breaker.</p><p><b>Lesson:</b> prioritise on exploitation and exposure; severity alone is a poor predictor of what attackers will use.</p></div>

<div class="iv"><p class="q">"You have 500 critical and high findings and one weekend. How do you choose?"</p><p>Explain a layered filter: first anything in CISA KEV on internet-facing or critical assets, then high EPSS, then asset criticality and exposure, then CVSS as a tie-breaker. Mention compensating controls for what cannot be patched, SLAs per priority (for example P1 in 48 hours), and verifying the fix with a rescan. Naming SSVC or the environmental metrics shows depth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Temporal = Base x E x RL x RC; environmental adds CR/IR/AR and modified base metrics.</li>
<li>CVSS v4: Base, Threat, Environmental, Supplemental; AT added; Scope replaced by vulnerable and subsequent system impact.</li>
<li>EPSS = probability of exploitation in 30 days; KEV = confirmed exploitation; SSVC = decision tree (Track to Act).</li>
<li>Prioritise: KEV and exposure first, EPSS next, CVSS as tie-breaker, compensating controls meanwhile.</li>
<li>In the lab, VUL-101 is P1 with ticket CHG-5100 (48 hours); VUL-102 is P2; VUL-104 is never P1.</li>
</ul></div>
`,hi:`
<p>Wapas emergency room. Do patients ka triage score 8 hai. Ek stable hai aur chupchaap wait kar raha hai; doosre ka blood pressure abhi gir raha hai. Achha doctor pehle doosre ka ilaaj karta hai. Vulnerability management bhi aise hi kaam karta hai: CVSS base score batata hai flaw kitna bura <i>ho sakta</i> hai; <b>exploitation data</b> aur <b>aapka environment</b> batate hain ki woh <i>aaj</i> kitna urgent hai.</p>

<h3>CVSS v3.1 temporal metrics</h3>
<p>Temporal score base score ko teen factors se multiply karta hai jo waqt ke saath badalte hain:</p>
<table class="cmp"><tr><th>Metric</th><th>Values (multiplier)</th></tr>
<tr><td>Exploit Code Maturity (E)</td><td>High 1, Functional 0.97, Proof-of-Concept 0.94, Unproven 0.91, Not Defined 1</td></tr>
<tr><td>Remediation Level (RL)</td><td>Unavailable 1, Workaround 0.97, Temporary Fix 0.96, Official Fix 0.95</td></tr>
<tr><td>Report Confidence (RC)</td><td>Confirmed 1, Reasonable 0.96, Unknown 0.92</td></tr>
</table>
<p>Temporal = Roundup(Base x E x RL x RC). Yeh sirf same reh sakta hai ya neeche ja sakta hai.</p>

<h3>CVSS v3.1 environmental metrics</h3>
<p>Yahan <b>aap</b> apne organisation ko describe karte ho. <b>Security requirements</b> CR, IR aur AR (Low 0.5, Medium 1, High 1.5) batate hain ki is asset ki confidentiality, integrity aur availability kitni matter karti hai. <b>Modified base metrics</b> (MAV, MAC, MPR wagairah) aapko apne deployment ke liye base theek karne dete hain, jaise MAV:L jab service sirf console se reachable ho.</p>

<div class="eg"><p><b>Worked example: VUL-103, base 8.1.</b></p><ol>
<li><b>Temporal.</b> Public proof of concept hai (E:P 0.94), vendor ka official fix hai (RL:O 0.95), confirmed (RC:C 1). 8.1 x 0.94 x 0.95 x 1 = 7.233, roundup <b>7.3</b>.</li>
<li><b>Environmental.</b> HR portal mein salary data hai, isliye CR:H aur IR:H (1.5); AR:L. Modified impact sub-score = min(1 - (1 - 1.5 x 0.56) x (1 - 1.5 x 0.56) x (1 - 0), 0.915) = min(0.974, 0.915) = 0.915. Modified impact = 6.42 x 0.915 = 5.874; plus exploitability 2.835 = 8.709, roundup 8.8. Temporal factors lagao: 8.8 x 0.94 x 0.95 = 7.858, roundup <b>7.9</b>.</li></ol>
<p>Yaani same flaw advisory mein 8.1 hai, temporal context ke baad 7.3 aur is organisation ke liye 7.9.</p></div>

<h3>CVSS v4.0 ek page mein</h3>
<p>FIRST ne CVSS v4.0 2023 mein publish kiya. Kya badla:</p>
<ul>
<li>Chaar groups: <b>Base, Threat, Environmental, Supplemental</b>. "Temporal" ka naam <b>Threat</b> ho gaya aur usmein sirf <b>Exploit Maturity</b> (Attacked, POC, Unreported) bacha.</li>
<li>Naya base metric <b>Attack Requirements (AT)</b>: None ya Present, race window ya specific configuration jaisi conditions ke liye. UI ab None, Passive ya Active hai.</li>
<li><b>Scope hata diya gaya.</b> Impact ko <b>vulnerable system</b> (VC, VI, VA) aur <b>subsequent systems</b> (SC, SI, SA) mein baanta gaya.</li>
<li>Supplemental metrics (Safety, Automatable, Recovery, Value Density aur baaki) context jodte hain par score nahi badalte.</li>
<li>Naam batate hain kaunse groups use hue: <b>CVSS-B</b>, CVSS-BT, CVSS-BE, CVSS-BTE.</li>
<li>Scoring simple formula ki jagah "macro vectors" ke lookup se hoti hai, isliye use calculator se padhte ho. Example: <code>CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N</code> = <b>9.3</b>.</li>
</ul>

<h3>EPSS, KEV aur SSVC: kya koi ise exploit kar raha hai?</h3>
<dl class="terms">
<dt>EPSS (Exploit Prediction Scoring System)</dt><dd>FIRST ka model, roz update hota hai, jo <b>probability (0 se 1)</b> deta hai ki kisi CVE ki exploitation activity agle <b>30 din</b> mein dikhegi, saath mein percentile. EPSS 0.94 matlab bahut likely; 0.02 matlab unlikely.</dd>
<dt>CISA KEV (Known Exploited Vulnerabilities catalog)</dt><dd>Un CVEs ki list jinke <b>active exploitation ka saboot</b> aur clear remediation hai. US federal agencies ko unhe due date tak fix karna hota hai (BOD 22-01); baaki sab KEV ko "pehle fix karo" list ki tarah use karte hain. EPSS <i>predict</i> karta hai; KEV <i>confirm</i> karta hai.</dd>
<dt>SSVC (Stakeholder-Specific Vulnerability Categorization)</dt><dd>CISA ka use kiya decision tree. Yeh exploitation, technical impact, exploitation automatable hai ya nahi aur mission impact poochta hai, aur <b>Track, Track*, Attend ya Act</b> output deta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Prioritisation funnel">
<polygon points="20,15 620,15 560,65 80,65" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">2,000 scanner findings (saare CVSS scores)</text>
<polygon points="80,72 560,72 500,122 140,122" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Reachable aur important assets par</text>
<polygon points="140,129 500,129 440,179 200,179" fill="#fde68a"/><text x="320" y="159" text-anchor="middle" class="svg-ink" font-size="13">KEV listed ya high EPSS</text>
<polygon points="200,186 440,186 380,222 260,222" fill="#fed7aa"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">P1 aaj raat</text>
</svg><p class="cap">Context ki har layer findings hatati hai jab tak sirf sach mein urgent wale bachte hain.</p></div>

<h3>Lab walk-through: paanch findings, ek window</h3>
<table class="cmp"><tr><th>Finding</th><th>CVSS</th><th>EPSS</th><th>KEV</th><th>Exposure</th><th>Priority</th></tr>
<tr><td>VUL-101 VPN gateway path traversal se RCE</td><td>9.8</td><td>0.94</td><td>Haan</td><td>Internet, business-critical</td><td><b>P1</b> + ticket</td></tr>
<tr><td>VUL-102 build agent ci-02 par Log4Shell</td><td>10.0</td><td>0.97</td><td>Haan</td><td>Internal, no inbound</td><td><b>P2</b></td></tr>
<tr><td>VUL-103 HR portal SQL injection</td><td>8.1</td><td>0.31</td><td>Nahi</td><td>Internet, high</td><td>P2, beech mein WAF rule</td></tr>
<tr><td>VUL-104 print server local privilege escalation</td><td>7.8</td><td>0.02</td><td>Nahi</td><td>Internal, low</td><td>P3 ya P4, kabhi P1 nahi</td></tr>
<tr><td>VUL-105 wiki stored XSS</td><td>5.4</td><td>0.04</td><td>Nahi</td><td>Internal, low</td><td>P4</td></tr>
</table>
<p>VUL-101 jeetta hai halanki VUL-102 ka base score zyada hai: woh wild mein exploit ho raha hai <b>aur</b> business-critical asset par internet se reachable hai. P1 set karke <b>Create remediation ticket</b> click karne par milta hai:</p>
<pre class="out">VUL-101 · CVE-2026-20417
Priority  <span class="hl">P1</span>   Ticket  <span class="hl">CHG-5100</span>
Due       48 hours</pre>

<div class="warn"><p><b>Common galti.</b> Scanner export ko CVSS se sort karke upar se patch karna. Phir teams window ek isolated lab ke 10.0 par kharch karti hain jabki KEV mein listed internet-facing 9.8 wait karta hai. Aur: jab patch aaj nahi lag sakta tab <b>compensating controls</b> (IPS signature, WAF rule, feature disable karna, access restrict karna) bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> EPSS agle 30 din ki probability hai, severity nahi. KEV ka matlab "wild mein exploited". CVSS v4 mein Scope metric nahi hai aur time-based group ko "Threat" kehte hain. Temporal aur environmental scores formulas ki had se bahar nahi jaate; temporal sirf base ko kam kar sakta hai.</p></div>

<div class="scn"><h4>Printer jo weekend kha gaya</h4><p>Ek team ki policy thi "har CVSS 7.0 aur upar 7 din mein". Ek print-driver privilege escalation (7.8, sirf local, EPSS 0.02) ne 300 print servers par weekend kaam karwaya, jabki ek SSL VPN flaw jiska score 7.2 tha par KEV mein listed tha, 30-day queue mein chala gaya kyunki woh "sirf High" tha. Das din baad VPN exploit hua. Policy dobara likhi gayi: pehle KEV aur internet exposure, phir threshold se upar EPSS, base score sirf tie-breaker.</p><p><b>Seekh:</b> exploitation aur exposure par prioritise karo; sirf severity yeh predict karne mein kamzor hai ki attackers kya use karenge.</p></div>

<div class="iv"><p class="q">"Aapke paas 500 critical aur high findings aur ek weekend hai. Kaise choose karoge?"</p><p>Layered filter samjhao: pehle internet-facing ya critical assets par CISA KEV wala sab kuch, phir high EPSS, phir asset criticality aur exposure, phir tie-breaker ke roop mein CVSS. Jo patch na ho sake uske liye compensating controls, har priority ka SLA (jaise P1 48 ghante mein), aur rescan se fix verify karna mention karo. SSVC ya environmental metrics ka naam lena depth dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Temporal = Base x E x RL x RC; environmental CR/IR/AR aur modified base metrics jodta hai.</li>
<li>CVSS v4: Base, Threat, Environmental, Supplemental; AT joda gaya; Scope ki jagah vulnerable aur subsequent system impact.</li>
<li>EPSS = 30 din mein exploitation ki probability; KEV = confirmed exploitation; SSVC = decision tree (Track se Act).</li>
<li>Prioritise: pehle KEV aur exposure, phir EPSS, tie-breaker CVSS, beech mein compensating controls.</li>
<li>Lab mein VUL-101 P1 hai ticket CHG-5100 (48 ghante) ke saath; VUL-102 P2 hai; VUL-104 kabhi P1 nahi.</li>
</ul></div>
`}};export{e as default};