var e={id:`how-to-practise`,h:{en:`How to practise in this simulator`,hi:`Is simulator mein practice kaise karein`},body:{en:`
<p>Reading builds understanding, but typing builds skill. The labs in this course run in a simulated network with Junos routers and switches, virtual PCs and servers. The CLI behaves like real Junos: same prompts, same <code>set</code> syntax, candidate configuration and commit. This chapter shows the routine that gets the most out of every lab.</p>

<h3>What a lab looks like</h3>
<p>Each lab gives you a <b>story</b> (a ticket from a customer or a build request), a <b>topology</b> (devices and links), and a list of <b>tasks</b>. Some labs are <b>configuration</b> labs: build something new. Others are <b>troubleshooting</b> labs: something is broken and you must find and fix it. Tasks are checked automatically by looking at the devices, so you prove the result by the actual network state, not by typing a magic answer. Some tasks also ask a short question, such as "what is the broadcast address?", to make sure you understand what you see.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Practice loop">
<rect x="20" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">1. Read task</text>
<rect x="165" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="220" y="95" text-anchor="middle" class="svg-ink" font-size="13">2. Look first</text>
<rect x="310" y="60" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="365" y="95" text-anchor="middle" class="svg-ink" font-size="13">3. Configure</text>
<rect x="455" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="510" y="95" text-anchor="middle" class="svg-ink" font-size="13">4. Verify</text>
<line x1="130" y1="90" x2="165" y2="90" stroke="#64748b" stroke-width="2"/><line x1="275" y1="90" x2="310" y2="90" stroke="#64748b" stroke-width="2"/><line x1="420" y1="90" x2="455" y2="90" stroke="#64748b" stroke-width="2"/>
<path d="M510 120 L510 160 L75 160 L75 120" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="290" y="180" text-anchor="middle" class="svg-muted" font-size="12">wrong result? read the output, fix, verify again</text>
</svg><p class="cap">The loop of every good engineer: look, change, verify. Verification is a step, not an afterthought.</p></div>

<h3>A repeatable routine</h3>
<ol><li><b>Read the whole task and sketch the topology</b> on paper: devices, links, addresses.</li>
<li><b>Look before you change.</b> On each device run <code>show interfaces terse</code>, <code>show route</code> and <code>show configuration | display set</code>.</li>
<li><b>Enter configuration mode</b> with <code>configure</code> and type <code>set</code> commands, one idea at a time.</li>
<li><b>Preview with</b> <code>show | compare</code>, then <code>commit</code>. Use <code>commit check</code> if you are unsure.</li>
<li><b>Verify from the outside:</b> use <code>run ping</code>, <code>run show route</code> and from a PC use <code>ping</code> and <code>trace</code>.</li>
<li><b>Roll back</b> with <code>rollback 1</code> then <code>commit</code> if it got worse.</li></ol>

<h3>Useful simulator habits</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24
lab@R1# show | compare
lab@R1# commit and-quit
lab@R1&gt; ping 192.0.2.2 count 3</pre>
<p>Virtual PCs have a simple CLI of their own: <code>ip 192.0.2.10/24 192.0.2.1</code> sets address and gateway, then <code>ping</code> and <code>trace</code> test the path. Remember that the PC prompt is not Junos. Use hints when stuck, but try for five minutes first: the struggle is where learning happens. Every lab also has a model solution; study it <i>after</i> you finish, to compare approaches.</p>

<div class="eg"><p><b>Worked example.</b> A task says "PC1 must reach the server". You sketch PC1, SW1, R1, server. You check <code>show interfaces terse</code> on R1 and see ge-0/0/1 has no address. You add it, preview with <code>show | compare</code>, commit, then ping from PC1. It still fails, so you read <code>show route</code>: there is no route to the server's network. You add the route, commit, ping again, success. The fault was found by reading, not guessing.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Typing the model solution from the hint without understanding it. You will pass the lab and fail the exam. Another trap: forgetting to commit, so the check cannot see your change.</p></div>

<div class="scn"><h4>The learner who stopped guessing</h4><p>A learner kept failing a troubleshooting lab where a server was unreachable. He changed things at random: addresses, masks, routes. Each change made the picture muddier. A mentor told him to restore the lab, change nothing for five minutes and only run show commands. The output showed one wrong next-hop address in a static route. A single corrected line and a commit fixed it.</p><p><b>Lesson:</b> observe, form one hypothesis, change one thing, verify. Random edits hide the real fault.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a connectivity problem."</p><p>Define the symptom and the path, check layer by layer: interface state, IP addressing, ARP, routing table, then filters. Change one thing at a time, verify after each, and keep a rollback ready. Name the Junos commands you would use at each layer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Labs are checked by the real device state, so commit and verify every change.</li>
<li>Routine: read, look, configure, preview with show | compare, commit, verify.</li>
<li>Virtual PCs use their own simple CLI for ip, ping and trace.</li>
<li>Use hints after trying, and study the model solution after finishing.</li>
<li>Troubleshooting means one hypothesis and one change at a time.</li>
</ul></div>
`,hi:`
<p>Padhne se samajh banti hai, lekin type karne se skill banti hai. Is course ke labs ek simulated network mein chalte hain jisme Junos routers aur switches, virtual PCs aur servers hote hain. CLI asli Junos jaise behave karti hai: wahi prompts, wahi <code>set</code> syntax, candidate configuration aur commit. Yeh chapter woh routine batata hai jisse har lab se zyada se zyada seekh milti hai.</p>

<h3>Lab kaisa dikhta hai</h3>
<p>Har lab mein ek <b>story</b> hoti hai (customer ka ticket ya build request), ek <b>topology</b> (devices aur links), aur <b>tasks</b> ki list. Kuch labs <b>configuration</b> labs hain: kuch naya banao. Doosre <b>troubleshooting</b> labs hain: kuch toota hai aur aapko dhoondh kar theek karna hai. Tasks automatically devices dekh kar check hote hain, isliye aap asli network state se result saabit karte ho, koi magic jawab type karke nahi. Kuch tasks chhota sawal bhi poochte hain, jaise "broadcast address kya hai?", yeh pakka karne ke liye ki aap jo dekh rahe ho wo samajhte ho.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Practice loop">
<rect x="20" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="13">1. Task padho</text>
<rect x="165" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="220" y="95" text-anchor="middle" class="svg-ink" font-size="13">2. Pehle dekho</text>
<rect x="310" y="60" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="365" y="95" text-anchor="middle" class="svg-ink" font-size="13">3. Configure</text>
<rect x="455" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="510" y="95" text-anchor="middle" class="svg-ink" font-size="13">4. Verify</text>
<line x1="130" y1="90" x2="165" y2="90" stroke="#64748b" stroke-width="2"/><line x1="275" y1="90" x2="310" y2="90" stroke="#64748b" stroke-width="2"/><line x1="420" y1="90" x2="455" y2="90" stroke="#64748b" stroke-width="2"/>
<path d="M510 120 L510 160 L75 160 L75 120" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="290" y="180" text-anchor="middle" class="svg-muted" font-size="12">galat result? output padho, fix karo, dobara verify</text>
</svg><p class="cap">Har achhe engineer ka loop: dekho, badlo, verify karo. Verification ek step hai, baad ka khayal nahi.</p></div>

<h3>Ek repeatable routine</h3>
<ol><li><b>Poora task padho aur topology kaagaz par banao</b>: devices, links, addresses.</li>
<li><b>Badalne se pehle dekho.</b> Har device par <code>show interfaces terse</code>, <code>show route</code> aur <code>show configuration | display set</code> chalao.</li>
<li><b><code>configure</code> se configuration mode mein jao</b> aur <code>set</code> commands type karo, ek idea ek baar mein.</li>
<li><b><code>show | compare</code> se preview karo</b>, phir <code>commit</code>. Shak ho to <code>commit check</code> use karo.</li>
<li><b>Bahar se verify karo:</b> <code>run ping</code>, <code>run show route</code>, aur PC se <code>ping</code> aur <code>trace</code>.</li>
<li><b>Bigad jaye to roll back karo</b>: <code>rollback 1</code> phir <code>commit</code>.</li></ol>

<h3>Simulator ki kaam ki aadatein</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24
lab@R1# show | compare
lab@R1# commit and-quit
lab@R1&gt; ping 192.0.2.2 count 3</pre>
<p>Virtual PCs ki apni simple CLI hoti hai: <code>ip 192.0.2.10/24 192.0.2.1</code> address aur gateway set karta hai, phir <code>ping</code> aur <code>trace</code> rasta test karte hain. Yaad rakho PC ka prompt Junos nahi hai. Atko to hint use karo, lekin pehle paanch minute khud koshish karo: seekhna wahin hota hai jahan sangharsh hai. Har lab ka model solution bhi hota hai; use lab khatam karne ke <i>baad</i> padho, approaches compare karne ke liye.</p>

<div class="eg"><p><b>Worked example.</b> Task kehta hai "PC1 ko server tak pahunchna hai". Aap PC1, SW1, R1, server sketch karte ho. R1 par <code>show interfaces terse</code> dekhte ho aur ge-0/0/1 par address nahi hai. Address jodte ho, <code>show | compare</code> se preview, commit, phir PC1 se ping. Phir bhi fail, to <code>show route</code> padhte ho: server ke network ka route hi nahi hai. Route jodte ho, commit, ping, success. Fault padhne se mila, andaaza lagaane se nahi.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Samjhe bina hint se model solution type kar dena. Lab pass ho jayega, exam fail. Ek aur jaal: commit bhool jaana, to check aapka change dekh hi nahi paata.</p></div>

<div class="scn"><h4>Jisne andaaza lagana band kiya</h4><p>Ek learner ek troubleshooting lab mein baar-baar fail ho raha tha jahan server unreachable tha. Woh random cheezein badalta raha: addresses, masks, routes. Har change se tasveer aur dhundhli hoti gayi. Mentor ne kaha lab restore karo, paanch minute kuch mat badlo aur sirf show commands chalao. Output mein static route ka ek galat next-hop address dikha. Ek line sahi karke commit karne se theek ho gaya.</p><p><b>Lesson:</b> observe karo, ek hypothesis banao, ek cheez badlo, verify karo. Random edits asli fault chhupa dete hain.</p></div>

<div class="iv"><p class="q">"Connectivity problem aap kaise troubleshoot karte ho, batao."</p><p>Symptom aur path define karo, layer by layer check karo: interface state, IP addressing, ARP, routing table, phir filters. Ek baar mein ek cheez badlo, har ke baad verify karo, aur rollback taiyar rakho. Har layer par kaunse Junos commands use karoge, unka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Labs asli device state se check hote hain, isliye har change commit aur verify karo.</li>
<li>Routine: padho, dekho, configure, show | compare se preview, commit, verify.</li>
<li>Virtual PCs ip, ping aur trace ke liye apni simple CLI use karte hain.</li>
<li>Koshish ke baad hint use karo, aur khatam karne ke baad model solution padho.</li>
<li>Troubleshooting ka matlab ek baar mein ek hypothesis aur ek change.</li>
</ul></div>
`}};export{e as default};