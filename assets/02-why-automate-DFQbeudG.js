var e={id:`why-automate`,h:{en:`Why automate, and the automation ladder`,hi:`Automate kyun karein, aur automation ki seedhi`},body:{en:`
<p>Imagine a hospital where every nurse writes the same patient form by hand, 50 times a day. Sooner or later a nurse writes a wrong dose. The hospital does not fix this by telling nurses to "be more careful". It fixes it with a printed form and a checklist. <b>Network automation</b> is the printed form for network changes: the steps are fixed in a file, reviewed once, and then repeated by a computer.</p>
<h3>The arithmetic of repetition</h3>
<p>Suppose a change takes about 3 minutes per router by hand: log in, <code>conf t</code>, type, <code>end</code>, <code>write memory</code>, check, log out. That is an estimate for illustration, not a measurement. For 5 routers it is 15 minutes. For 50 routers it is 150 minutes, a whole afternoon, and each router is a new chance for a typo. A script does the same steps in the time it takes the SSH sessions to open, and it never mistypes line 2 because it was typed correctly once.</p>
<table class="cmp"><thead><tr><th>Question</th><th>By hand</th><th>With a script</th></tr></thead><tbody>
<tr><td>Speed</td><td>Minutes per device</td><td>Seconds per device</td></tr>
<tr><td>Consistency</td><td>Depends on the person</td><td>Identical every time</td></tr>
<tr><td>Evidence</td><td>Your memory</td><td>The script prints a report</td></tr>
<tr><td>Repeating next month</td><td>Start again from scratch</td><td>Run the same file</td></tr>
</tbody></table>
<h3>The automation ladder</h3>
<p>Teams climb four steps, one at a time. This course teaches all four, and this module is step 2.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Automation ladder">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#e2e8f0"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">1. Manual CLI</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">type, one device</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">2. Scripts</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">Python over SSH</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">3. APIs</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">structured data</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">4. Pipelines</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">Git + auto tests</text>
</svg><p class="cap">The automation ladder. Each step builds on the one before. You do not need step 4 to benefit from step 2.</p></div>
<ul>
<li><b>Manual CLI</b>: you type on one device at a time. Fine for 3 devices.</li>
<li><b>Scripts over SSH</b>: a program types the CLI for you. Works on almost every device that has SSH today.</li>
<li><b>APIs</b>: an <b>API</b> (Application Programming Interface) is a door made for programs. Instead of screen text, the device returns clean structured data (for example JSON). You meet RESTCONF and NETCONF later in the track.</li>
<li><b>Pipelines</b>: the wanted configuration lives in files kept in <b>Git</b> (a history of every change). When a file changes, an automatic <b>pipeline</b> tests it and pushes it. The files become the single source of truth.</li>
</ul>
<h3>Automation also multiplies mistakes</h3>
<p>A script is fast in both directions. A wrong line typed by hand breaks one router. The same wrong line in a script breaks fifty routers in a minute. That is why good teams review the script, run it first on one test device, and verify afterwards. Chapters 6 to 8 build these habits.</p>
<div class="eg"><p><b>Worked example.</b> Task: "Which routers are running for more than 90 days?" Manual: open 40 SSH sessions, read 40 <code>show version</code> outputs. Scripted (step 2): one loop, one filter, one list printed. Step 3 would ask each router for the uptime as a number through an API. Same question, three levels.</p></div>
<div class="warn"><p><b>Common mistake.</b> Starting with the fanciest tool. Many beginners jump to pipelines and give up. Start with one small read-only script (show commands only). Nothing can break, and you learn the rhythm.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the vocabulary: script, API, source of truth, pipeline. A common question asks which approach gives structured data for programs (an API) and which approach parses screen text (a CLI script).</p></div>
<div class="scn"><h4>The audit nobody wanted</h4><p>An auditor asked a company for proof that all 120 routers had the same login banner. The team spent two days opening sessions. The next quarter they wrote a read-only script that logged in, read the banner, compared it to the approved text and printed OK or DIFFERENT for each router. The audit took ten minutes.</p><p><b>Lesson:</b> read-only scripts are the safest first automation, and they produce evidence.</p></div>
<div class="iv"><p class="q">"What is the difference between a CLI script and an API?"</p><p>A CLI script automates what a human types and then has to read the text answer back, so it must parse screen output. An API gives a defined way to ask for data or send a change, and the answer comes back as structured data such as JSON. APIs are easier for programs to read and less fragile, but many older devices only offer the CLI, so both skills matter.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation gives speed, consistency and evidence.</li>
<li>The ladder: manual CLI, scripts, APIs, pipelines.</li>
<li>An API gives programs structured data; the CLI gives screen text.</li>
<li>A script repeats mistakes quickly, so review, test on one device and verify.</li>
<li>Start with read-only scripts.</li>
</ul></div>
`,hi:`
<p>Ek hospital socho jahan har nurse roz 50 baar wahi patient form haath se likhti hai. Der-saver koi nurse galat dose likh degi. Hospital ise nurses ko "zyada careful raho" bolkar fix nahi karta. Woh printed form aur checklist se fix karta hai. <b>Network automation</b> network changes ka printed form hai: steps ek file mein fixed, ek baar review, aur phir computer se repeat.</p>
<h3>Repetition ka hisaab</h3>
<p>Maan lo ek change haath se router par lagbhag 3 minute leta hai: login, <code>conf t</code>, type, <code>end</code>, <code>write memory</code>, check, logout. Yeh samjhane ke liye andaaza hai, naap nahi. 5 routers ke liye 15 minute. 50 routers ke liye 150 minute, poori dopahar, aur har router typo ka naya mauka. Script wahi steps SSH sessions kholne jitne waqt mein kar deta hai, aur woh line 2 galat kabhi nahi likhta kyunki woh ek baar sahi type hui thi.</p>
<table class="cmp"><thead><tr><th>Sawaal</th><th>Haath se</th><th>Script se</th></tr></thead><tbody>
<tr><td>Speed</td><td>Har device par minutes</td><td>Har device par seconds</td></tr>
<tr><td>Consistency</td><td>Insaan par depend</td><td>Har baar identical</td></tr>
<tr><td>Saboot</td><td>Aapki yaadasht</td><td>Script report print karta hai</td></tr>
<tr><td>Agle mahine dobara</td><td>Phir zero se shuru</td><td>Wahi file chalao</td></tr>
</tbody></table>
<h3>Automation ki seedhi</h3>
<p>Teams chaar steps ek-ek karke chadhti hain. Yeh course chaaron sikhata hai, aur yeh module step 2 hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Automation ladder">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#e2e8f0"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">1. Manual CLI</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">ek device, type</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">2. Scripts</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">SSH par Python</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">3. APIs</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">structured data</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">4. Pipelines</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">Git + auto tests</text>
</svg><p class="cap">Automation ki seedhi. Har step pichhle par bana hai. Step 2 ka fayda lene ke liye step 4 zaroori nahi.</p></div>
<ul>
<li><b>Manual CLI</b>: aap ek time par ek device par type karte ho. 3 devices ke liye theek.</li>
<li><b>SSH par scripts</b>: program aapke liye CLI type karta hai. Aaj lagbhag har us device par chalta hai jisme SSH hai.</li>
<li><b>APIs</b>: <b>API</b> (Application Programming Interface) programs ke liye bana darwaza hai. Screen text ki jagah device saaf structured data (jaise JSON) deta hai. RESTCONF aur NETCONF aap track mein aage milenge.</li>
<li><b>Pipelines</b>: chahiye wali configuration files mein rehti hai jo <b>Git</b> mein hoti hain (har change ki history). File badalte hi automatic <b>pipeline</b> use test karke push karti hai. Files single source of truth ban jaati hain.</li>
</ul>
<h3>Automation galtiyon ko bhi multiply karta hai</h3>
<p>Script dono directions mein tez hai. Haath se type ki galat line ek router bigaadti hai. Wahi galat line script mein ho to pachaas routers ek minute mein bigaad deti hai. Isi liye achhi teams script review karti hain, pehle ek test device par chalati hain, aur baad mein verify karti hain. Chapter 6 se 8 yeh habits banate hain.</p>
<div class="eg"><p><b>Worked example.</b> Task: "Kaunse routers 90 din se zyada se chal rahe hain?" Manual: 40 SSH sessions kholo, 40 <code>show version</code> outputs padho. Scripted (step 2): ek loop, ek filter, ek list print. Step 3 mein har router se API ke through uptime number ki tarah poocha jaata. Ek hi sawaal, teen levels.</p></div>
<div class="warn"><p><b>Common galti.</b> Sabse fancy tool se shuru karna. Kai beginners pipelines par jump karke chhod dete hain. Ek chhote read-only script (sirf show commands) se shuru karo. Kuch toot nahi sakta, aur aap rhythm seekhte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Vocabulary yaad rakho: script, API, source of truth, pipeline. Aam sawaal poochta hai ki programs ko structured data kaun sa approach deta hai (API) aur screen text kaun parse karta hai (CLI script).</p></div>
<div class="scn"><h4>Woh audit jo koi nahi chahta tha</h4><p>Ek auditor ne company se saboot maanga ki saare 120 routers par same login banner hai. Team ne do din sessions kholne mein lagaye. Agli quarter unhone ek read-only script likha jo login karke banner padhta, approved text se compare karta aur har router ke liye OK ya DIFFERENT print karta. Audit mein das minute lage.</p><p><b>Lesson:</b> read-only scripts sabse safe pehla automation hain, aur woh saboot dete hain.</p></div>
<div class="iv"><p class="q">"CLI script aur API mein kya fark hai?"</p><p>CLI script wahi automate karta hai jo insaan type karta hai aur phir text jawab padhna padta hai, isliye screen output parse karna padta hai. API data maangne ya change bhejne ka defined tareeka deta hai, aur jawab JSON jaise structured data mein aata hai. APIs programs ke liye padhna aasaan aur kam fragile hain, lekin kai purane devices sirf CLI dete hain, isliye dono skills zaroori hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation speed, consistency aur saboot deta hai.</li>
<li>Seedhi: manual CLI, scripts, APIs, pipelines.</li>
<li>API programs ko structured data deta hai; CLI screen text.</li>
<li>Script galtiyan tezi se repeat karta hai, isliye review, ek device par test aur verify karo.</li>
<li>Read-only scripts se shuru karo.</li>
</ul></div>
`}};export{e as default};