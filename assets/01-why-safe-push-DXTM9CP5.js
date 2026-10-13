var e=(e,t,n,r,i)=>`<rect x="`+e+`" y="24" width="94" height="52" rx="10" fill="`+t+`"/><text x="`+(e+47)+`" y="48" text-anchor="middle" class="svg-ink" font-size="13">`+n+`</text><text x="`+(e+47)+`" y="66" text-anchor="middle" class="svg-muted" font-size="10">`+r+`</text>`,t=(t,n)=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Six steps of a safe push and the audit log">`+e(8,`#bae6fd`,`1 Backup`,t[0])+e(112,`#ddd6fe`,`2 Plan`,t[1])+e(216,`#fde68a`,`3 Preview`,t[2])+e(320,`#fed7aa`,`4 Push`,t[3])+e(424,`#bbf7d0`,`5 Verify`,t[4])+e(528,`#e2e8f0`,`6 Undo`,t[5])+`<line x1="102" y1="50" x2="112" y2="50" stroke="#64748b" stroke-width="2"/><line x1="206" y1="50" x2="216" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="320" y2="50" stroke="#64748b" stroke-width="2"/><line x1="414" y1="50" x2="424" y2="50" stroke="#64748b" stroke-width="2"/><line x1="518" y1="50" x2="528" y2="50" stroke="#64748b" stroke-width="2"/><rect x="8" y="104" width="614" height="38" rx="10" fill="#e2e8f0"/><text x="315" y="128" text-anchor="middle" class="svg-ink" font-size="13">`+t[6]+`</text></svg><p class="cap">`+n+`</p></div>`,n={id:`why-safe-push`,h:{en:`Why a config push needs a safety net`,hi:`Config push ko safety net kyon chahiye`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you will be able to write, run and debug a Python tool that changes router configuration without fear. In practice you will:</p>
<ul>
<li>take a backup of the running configuration before the first command is sent;</li>
<li>compute a plan that lists only the lines a router is missing, and show it as a <b>dry run</b> that changes nothing;</li>
<li>compare two configurations with <code>difflib.unified_diff</code> and read the result;</li>
<li>push lines with <code>send_config_set</code> and notice when the router answers with a <code>%</code> error;</li>
<li>verify by reading the configuration back, and <b>roll back</b> automatically when a line did not arrive;</li>
<li>write one JSON line per attempt to an audit log, and find four quiet bugs in a push tool that looks fine.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished <b>auto-intro</b> and <b>auto-py-basics</b> (variables, strings, f-strings), <b>auto-py-data</b> (lists, dictionaries, loops), <b>auto-py-func</b> (functions, files, <code>try/except</code>), <b>auto-formats</b> (JSON) and, most important, <b>auto-ssh</b>, where you met <code>ConnectHandler</code>, <code>send_command</code> and <code>send_config_set</code> from the lab library <code>nkmiko</code>. <b>auto-git</b> helps too: a backup is a first cousin of a commit. The option parser <code>argparse</code> is used here in a few lines and explained fully later in <b>py-tools</b>; the next module, <b>py-templates</b>, builds the configuration text that this module learns to push safely.</p>

<h3>The analogy: a surgeon's checklist</h3>
<p>Before an operation, a surgical team reads a checklist aloud: right patient, right side, blood available, count of instruments. Surgeons are skilled; the checklist exists because skilled people still make quiet mistakes when work is routine and the cost of a mistake is high. A configuration push is the same. You are skilled, the change is "just three lines", and that is exactly when a typo goes to production.</p>
<p>The <b>change window</b> is the operating theatre slot. A company agrees on a time, usually at night or on a weekend, when a short interruption hurts least. The window is short and the pressure is real. A script that backs up, previews, checks and can undo itself turns a risky 2 a.m. activity into a routine one.</p>

<h3>Why scripts raise the stakes</h3>
<p>A human types one command, looks at the answer, and types the next. A script does not look. It sends forty lines in a second, and the same forty lines to every router in the list. A single typo that a human would fix in the next breath is now on <b>fifty routers</b> before anybody reads a screen. Speed and scale are why we automate, and the same two things are why automation needs brakes.</p>
<div class="eg"><p><b>Worked example.</b> A baseline of six lines (NTP, logging, SNMP, a few hardening lines) goes to 40 routers. One line has the typo <code>communty</code>. Without a safety net the router answers <code>% Invalid input</code> forty times, nobody sees it, and a week later the monitoring system has no SNMP data. With the net, the first router rejects the line, the tool undoes its work, says so, and the other 39 are never touched.</p></div>

`+t([`save config`,`missing only`,`dry run only`,`send_config_set`,`read it back`,`inverse commands`,`Audit log: one JSON line for every attempt, including the failures`],`The six-step pattern of this module, with the audit log under all of it.`)+`

<h3>Meet the labs</h3>
<p>The company is <b>Kaveri Foods</b>. You work on the Linux host <b>AUTO01</b> (user <code>netadmin</code>, password <code>Deccan@123</code>) and talk to routers over SSH with user <code>netops</code> and password <code>NK@2026</code>. These are lab values; the module <b>py-secrets</b> shows how real passwords stay out of scripts.</p>
<ul>
<li><b>Lab 1</b> uses <code>safepush.py</code>, written by your senior. It controls <b>R1</b> (10.99.0.1) and <b>R2</b> (10.99.0.2). R1 takes a clean push; R2 is given a baseline with a typo and must be rolled back.</li>
<li><b>Lab 2</b> uses <code>pushtool.py</code> with five routers, R1 to R5. It runs without any error and still gets four things wrong. You will find them by their symptoms.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Thinking "the router will tell me if something is wrong". It does, but only in the text that <code>send_config_set</code> returns, and a script that does not read that text never hears it.</p></div>
<div class="exam"><p><b>Exam trap.</b> A dry run is not a backup and a backup is not a verification. They answer three different questions: what would change, what was there before, and did it really land.</p></div>

<div class="scn"><h4>The Friday 17:50 change</h4><p>An engineer pushed a "tiny" logging change to thirty branch routers just before leaving. One mistyped server address was accepted by the routers because it was a valid IP address, only the wrong one. Syslog went silent on every branch. Nobody had a backup of the old lines, so the team rebuilt the lines from memory on Saturday.</p><p><b>Lesson:</b> the safety net is not for typos the router rejects, it is for the mistakes the router accepts. A saved before-copy and a diff would have shown the change in seconds.</p></div>

<div class="iv"><p class="q">"How do you make an automated configuration change safe?"</p><p>I follow a fixed pattern: back up the running configuration, compute a plan of only the missing lines, show it as a dry run, push, read the configuration back to verify, undo automatically if verification fails, and write an audit entry either way. I also make the dry run the default so that a real change needs an explicit <code>--apply</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scripts are fast and wide, so one mistake is repeated on every router.</li>
<li>The safe pattern has six steps: backup, plan, preview, push, verify, undo.</li>
<li>An audit log records every attempt, including the failed ones.</li>
<li>Lab 1 practises the pattern with <code>safepush.py</code>; Lab 2 hunts four quiet bugs in <code>pushtool.py</code>.</li>
<li>Prerequisites: <b>auto-py-func</b>, <b>auto-formats</b> and especially <b>auto-ssh</b>.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Is module ke ant tak aap ek aisa Python tool likh, chala aur debug kar paoge jo router configuration bina darr ke badalta hai. Practically aap yeh karoge:</p>
<ul>
<li>pehla command bhejne se pehle running-config ka backup lena;</li>
<li>aisa plan banana jo sirf router ki missing lines dikhaye, aur use <b>dry run</b> ki tarah dikhana jo kuch nahi badalta;</li>
<li><code>difflib.unified_diff</code> se do configurations compare karna aur result padhna;</li>
<li><code>send_config_set</code> se lines push karna aur pehchanna ki router ne <code>%</code> error diya;</li>
<li>configuration wapas padhkar verify karna, aur line na pahunchi ho to automatic <b>roll back</b> karna;</li>
<li>har attempt ki ek JSON line audit log mein likhna, aur aise push tool ke chaar chhupe bugs dhoondhna jo theek dikhta hai.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapne <b>auto-intro</b> aur <b>auto-py-basics</b> (variables, strings, f-strings), <b>auto-py-data</b> (lists, dictionaries, loops), <b>auto-py-func</b> (functions, files, <code>try/except</code>), <b>auto-formats</b> (JSON) aur sabse zaroori <b>auto-ssh</b> khatam kiya hona chahiye, jahan aapne lab library <code>nkmiko</code> ke <code>ConnectHandler</code>, <code>send_command</code> aur <code>send_config_set</code> dekhe. <b>auto-git</b> bhi madad karta hai: backup commit ka sagga bhai hai. Option parser <code>argparse</code> yahan sirf kuch lines mein use hota hai aur poori tarah baad ke <b>py-tools</b> mein samjhaya jaata hai; agla module <b>py-templates</b> woh configuration text banata hai jise yeh module safely push karna sikhata hai.</p>

<h3>Analogy: surgeon ki checklist</h3>
<p>Operation se pehle surgical team checklist zor se padhti hai: sahi patient, sahi side, khoon ready, instruments ginti. Surgeon skilled hote hain; checklist isliye hai ki skilled log bhi routine kaam mein chhupi galtiyan karte hain jab galti ki keemat bahut hoti hai. Configuration push bhi aisa hi hai. Aap skilled ho, change "bas teen lines" ka hai, aur yahi woh waqt hai jab typo production mein jaata hai.</p>
<p><b>Change window</b> operating theatre ka slot hai. Company ek time tay karti hai, aksar raat ya weekend, jab chhota interruption kam nuksaan kare. Window chhoti hoti hai aur pressure asli. Jo script backup leti hai, preview dikhati hai, check karti hai aur khud undo kar sakti hai, woh raat 2 baje ke risky kaam ko routine bana deti hai.</p>

<h3>Scripts stakes kyon badhati hain</h3>
<p>Insaan ek command type karta hai, jawab dekhta hai, phir agla type karta hai. Script dekhti nahi. Woh ek second mein chalis lines bhejti hai, aur wahi chalis lines list ke har router par. Ek typo jo insaan agli saans mein theek kar leta, ab koi screen padhe usse pehle <b>pachaas routers</b> par hai. Speed aur scale isliye hain ki hum automate karte hain, aur wahi do cheezein hain jinki wajah se automation ko brakes chahiye.</p>
<div class="eg"><p><b>Worked example.</b> Chhe lines ki baseline (NTP, logging, SNMP, kuch hardening lines) 40 routers par jaati hai. Ek line mein typo hai <code>communty</code>. Safety net ke bina router chalis baar <code>% Invalid input</code> kehta hai, koi dekhta nahi, aur ek hafte baad monitoring system ke paas SNMP data nahi hota. Net ke saath pehla router line reject karta hai, tool apna kaam undo karta hai, batata hai, aur baaki 39 ko chhua tak nahi jaata.</p></div>

`+t([`config save`,`sirf missing`,`dry run only`,`send_config_set`,`wapas padho`,`inverse commands`,`Audit log: har attempt ki ek JSON line, failures bhi`],`Is module ka six-step pattern, sabke neeche audit log ke saath.`)+`

<h3>Labs se milo</h3>
<p>Company hai <b>Kaveri Foods</b>. Aap Linux host <b>AUTO01</b> par kaam karte ho (user <code>netadmin</code>, password <code>Deccan@123</code>) aur routers se SSH par user <code>netops</code> aur password <code>NK@2026</code> se baat karte ho. Yeh lab values hain; <b>py-secrets</b> module dikhata hai ki asli passwords scripts se bahar kaise rakhte hain.</p>
<ul>
<li><b>Lab 1</b> <code>safepush.py</code> use karta hai, jo aapke senior ne likhi. Woh <b>R1</b> (10.99.0.1) aur <b>R2</b> (10.99.0.2) ko control karti hai. R1 ko saaf push milta hai; R2 ko typo wali baseline milti hai aur use roll back hona hai.</li>
<li><b>Lab 2</b> <code>pushtool.py</code> use karta hai, paanch routers R1 se R5 ke saath. Yeh bina error ke chalta hai aur phir bhi chaar cheezein galat karta hai. Aap unhe symptoms se dhoondhoge.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki "kuch galat hoga to router bata dega". Woh batata hai, par sirf us text mein jo <code>send_config_set</code> return karta hai, aur jo script woh text padhti nahi, woh kuch sunti nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dry run backup nahi hai aur backup verification nahi hai. Yeh teen alag sawaalon ke jawab hain: kya badlega, pehle kya tha, aur kya sach mein pahunch gaya.</p></div>

<div class="scn"><h4>Friday 17:50 ka change</h4><p>Ek engineer ne jaate-jaate tees branch routers par "chhota" logging change push kiya. Ek galat likha server address routers ne accept kar liya kyunki woh valid IP address tha, bas galat wala. Har branch par syslog chup ho gaya. Kisi ke paas purani lines ka backup nahi tha, to team ne Saturday ko yaad se lines dobara banayin.</p><p><b>Lesson:</b> safety net un typos ke liye nahi hai jo router reject karta hai, un galtiyon ke liye hai jo router accept kar leta hai. Save ki hui before-copy aur ek diff seconds mein change dikha dete.</p></div>

<div class="iv"><p class="q">"Automated configuration change ko safe kaise banate ho?"</p><p>Main ek fixed pattern follow karta hoon: running configuration ka backup, sirf missing lines ka plan, use dry run ki tarah dikhana, push, configuration wapas padhkar verify, verification fail ho to automatic undo, aur dono haalat mein audit entry. Dry run ko default bhi rakhta hoon taaki asli change ke liye explicit <code>--apply</code> chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scripts fast aur wide hain, isliye ek galti har router par dohrati hai.</li>
<li>Safe pattern ke chhe steps hain: backup, plan, preview, push, verify, undo.</li>
<li>Audit log har attempt record karta hai, failed wale bhi.</li>
<li>Lab 1 <code>safepush.py</code> se pattern ki practice karta hai; Lab 2 <code>pushtool.py</code> ke chaar chhupe bugs dhoondhta hai.</li>
<li>Prerequisites: <b>auto-py-func</b>, <b>auto-formats</b> aur khaas taur par <b>auto-ssh</b>.</li>
</ul></div>
`}};export{n as default};