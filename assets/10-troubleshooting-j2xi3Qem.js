var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the incident drill on a handed-over toolkit`,hi:`Troubleshooting workflow: handover hui toolkit par incident drill`},body:{en:`
<p>Lab 2 gives you a toolkit that someone else built and left. The note says "finished, tested, everything is green". It is not. This chapter walks through the drill in the order you will meet it, with the evidence the lab prints. Try each problem yourself first; the walk-through shows the <i>reasoning</i>, which is the part that transfers to your own network.</p>

<h3>The method, in six lines</h3>
<ol>
<li>Run the documented command and read every line, including the counts.</li>
<li>Place the first surprise in the chain: scope, data, text, gate, change, read-back.</li>
<li>Reproduce it with a read-only command.</li>
<li>Fix the cause, not the symptom, and add a test or a check when you can.</li>
<li>Prove it with a clean run and an exit code.</li>
<li>Write down what you found.</li>
</ol>

<h3>Problem 1: the count is 1, the branch has 2</h3>
<pre class="out">AUTO01$ python3 mvtool.py inventory
1 hosts in scope
NGP-BR-R1    10.99.0.1    ios    zero-touch</pre>
<p>Everything after this looks fine: <code>intent</code> writes 1 intent, <code>render</code> writes 1 file, <code>plan</code> shows one router. The toolkit never says that anything is missing; it only handles what it was given. The evidence is a <b>number</b>, and you have to compare it with the number you expect (two routers). The inventory is NetBox filtered by site <i>nagpur</i> and tag <i>zero-touch</i>, so the question goes to NetBox: which Nagpur router lacks the tag? Fix the data, not the code, with a few lines of pynetbox:</p>
<pre class="code">dev = nb.dcim.devices.get(name="NGP-BR-J1")
print("tags before:", [t.slug for t in dev.tags])
<span class="hl">dev.tags = [{"slug": "zero-touch"}]
dev.save()</span></pre>
<p>Run <code>inventory</code> again: <code>2 hosts in scope</code>. The lesson for the handover note is the count.</p>

<h3>Problem 2: valid, green, and wrong</h3>
<pre class="out">AUTO01$ python3 mvtool.py intent
1 intents written, 0 schema errors
AUTO01$ python3 mvtool.py plan
NGP-BR-R1    would change
    +ntp server 10.99.0.61
    +logging host 10.99.0.600</pre>
<p>The plan is the evidence: <code>10.99.0.600</code> cannot be an address (the last number is above 255), and yet the schema reported 0 errors. Read the code that validates: <code>Draft202012Validator(schema)</code> has no <code>format_checker</code>, so <code>"format": "ipv4"</code> in the schema is only a comment. Repair the check first, so that the toolkit can say no, and look at what it says:</p>
<pre class="out">AUTO01$ python3 mvtool.py intent; echo "exit code: $?"
NGP-BR-R1: syslog_server: '10.99.0.600' is not a 'ipv4'
1 intents written, 1 schema errors
exit code: 1</pre>
<p>Now repair the data at its source. The value comes from the NetBox config context <i>Nagpur branch services</i>, which reaches every router of the site; fix it there, not in the intent file (a generated file, overwritten at the next run). Run <code>intent</code> until it is clean.</p>

<h3>Problem 3: success in the log, failure in the morning</h3>
<pre class="out">AUTO01$ python3 mvtool.py apply
NGP-BR-J1    committed and verified
NGP-BR-R1    committed and verified
2 ok, 0 failed
AUTO01$ <span class="hl">(on J1) show system commit</span>
commit confirmed, rollback in 1mins
0   2026-10-11 17:15:33 UTC by netops via netconf commit confirmed, rollback in 1mins
    mvtoolkit</pre>
<p>Junos itself says the commit is <i>not final</i>: it will roll back in one minute. Wait two minutes and ask again with the read-only command:</p>
<pre class="out">AUTO01$ python3 mvtool.py verify; echo "exit code: $?"
NGP-BR-J1    DRIFT: ntp server 10.99.0.61 is missing
NGP-BR-R1    matches NetBox
1 ok, 1 drifted
exit code: 1</pre>
<p>The tests explain why. <code>python3 -m pytest -q</code> ends with <code>1 failed, 6 passed</code>, and the failing test is <code>test_a_good_read_back_confirms_a_junos_commit</code>: after a clean read-back the code never calls <code>confirm_commit()</code>. Put the missing two lines back in <code>safety.py</code>, see <code>7 passed</code>, and apply again. Do <b>not</b> re-apply before the timer has run out: with a commit still pending, the compare finds no difference and prints "already compliant".</p>

<h3>Problem 4: the secret in the log</h3>
<pre class="out">AUTO01$ grep -c NK@2026 logs/mvtool.log
10
AUTO01$ grep -n NK@2026 logs/mvtool.log | head -2
1:2026-09-29 09:00:04,206 DEBUG login for NGP-BR-R1: netops / NK@2026
3:2026-09-29 09:00:04,812 DEBUG login for NGP-BR-R1: netops / NK@2026</pre>
<p>The password is in the log, once per device per run. Two causes together: a <code>log.debug</code> line in <code>inventory.py</code> that prints the credential, and <code>MVT_LOG=DEBUG</code> in <code>.env</code>, left on from testing. Removing the line is the fix; turning the level back to INFO is the prevention. And the old log still holds the secret: delete it, run <code>verify</code> so that a new log exists, and count again: <code>0</code>. In real life you would also rotate the password, because it has been written down.</p>

<div class="warn"><p><b>Order of the four.</b> The problems hide each other. Until the scope is right, problem 3 cannot show on J1. Until the schema can say no, problem 2 stays green. Fix them in the order the chain meets them and re-run the read-only commands after each fix.</p></div>

<div class="scn"><h4>The fix that was applied twice</h4><p>An engineer saw "committed and verified" on a Junos router and was told next morning that NTP was missing. He ran <code>apply</code> again, got "already compliant" and concluded that the monitoring was wrong. At that moment a commit-confirmed was pending and the router was about to roll back again. A <code>show system commit</code> would have shown the pending line in ten seconds.</p><p><b>Lesson:</b> when two sources disagree, ask the device directly with a command that cannot change it.</p></div>

<div class="iv"><p class="q">"Walk me through how you would take over a toolkit nobody explained."</p><p>I read the note, then run the documented command and read the counts, not only the verdict. I place the first surprise in the chain and reproduce it with read-only commands. I fix causes, not symptoms, for example the NetBox data and the schema check that failed to fire, and I add a test where I can. I finish with a clean run and an exit code, and I write the note I would have wanted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Counts are evidence: "1 hosts in scope" was the first clue.</li>
<li>A green check that never failed proves nothing; make it fail once.</li>
<li>A pending Junos commit looks like success until the timer runs out.</li>
<li>Tests that already fail can name the bug; run them early.</li>
<li>A secret in a log is a leaked secret: remove the line, the level and the old file.</li>
</ul></div>
`,hi:`
<p>Lab 2 aapko aisi toolkit deta hai jo kisi aur ne banayi aur chhodi. Note kehta hai "finished, tested, sab green hai". Aisa nahi hai. Yeh chapter drill ko usi kram mein dikhata hai jis kram mein aap use milenge, us evidence ke saath jo lab print karta hai. Pehle har problem khud try karo; walk-through <i>reasoning</i> dikhata hai, aur wahi hissa aapke apne network par kaam aata hai.</p>

<h3>Method, chhe lines mein</h3>
<ol>
<li>Documented command chalao aur har line padho, ginti samet.</li>
<li>Pehli hairani ko chain mein rakho: scope, data, text, gate, change, read-back.</li>
<li>Read-only command se reproduce karo.</li>
<li>Wajah theek karo, lakshan nahi, aur ho sake to test ya check jodo.</li>
<li>Saaf run aur exit code se saabit karo.</li>
<li>Jo mila woh likh do.</li>
</ol>

<h3>Problem 1: ginti 1 hai, branch mein 2</h3>
<pre class="out">AUTO01$ python3 mvtool.py inventory
1 hosts in scope
NGP-BR-R1    10.99.0.1    ios    zero-touch</pre>
<p>Iske baad sab theek dikhta hai: <code>intent</code> 1 intent likhta hai, <code>render</code> 1 file, <code>plan</code> ek router dikhata hai. Toolkit kabhi nahi kehti ki kuch gayab hai; woh sirf wahi handle karti hai jo use diya gaya. Evidence ek <b>number</b> hai, aur use aapko apni umeed (do routers) se compare karna padta hai. Inventory NetBox hai, site <i>nagpur</i> aur tag <i>zero-touch</i> se chhanta hua, isliye sawal NetBox se hai: Nagpur ke kaunse router par tag nahi hai? Data theek karo, code nahi, pynetbox ki kuch lines se:</p>
<pre class="code">dev = nb.dcim.devices.get(name="NGP-BR-J1")
print("tags before:", [t.slug for t in dev.tags])
<span class="hl">dev.tags = [{"slug": "zero-touch"}]
dev.save()</span></pre>
<p><code>inventory</code> dobara chalao: <code>2 hosts in scope</code>. Handover note ka lesson ginti hai.</p>

<h3>Problem 2: valid, green aur galat</h3>
<pre class="out">AUTO01$ python3 mvtool.py intent
1 intents written, 0 schema errors
AUTO01$ python3 mvtool.py plan
NGP-BR-R1    would change
    +ntp server 10.99.0.61
    +logging host 10.99.0.600</pre>
<p>Plan hi evidence hai: <code>10.99.0.600</code> address ho hi nahi sakta (aakhri number 255 se upar), phir bhi schema ne 0 errors kaha. Validate karne wala code padho: <code>Draft202012Validator(schema)</code> mein <code>format_checker</code> nahi hai, isliye schema ka <code>"format": "ipv4"</code> sirf comment hai. Pehle check theek karo, taaki toolkit na bol sake, aur dekho woh kya kehta hai:</p>
<pre class="out">AUTO01$ python3 mvtool.py intent; echo "exit code: $?"
NGP-BR-R1: syslog_server: '10.99.0.600' is not a 'ipv4'
1 intents written, 1 schema errors
exit code: 1</pre>
<p>Ab data uske source par theek karo. Value NetBox config context <i>Nagpur branch services</i> se aati hai, jo site ke har router tak pahunchta hai; wahan theek karo, intent file mein nahi (generated file hai, agli run overwrite karegi). <code>intent</code> tab tak chalao jab tak saaf na ho.</p>

<h3>Problem 3: log mein success, subah failure</h3>
<pre class="out">AUTO01$ python3 mvtool.py apply
NGP-BR-J1    committed and verified
NGP-BR-R1    committed and verified
2 ok, 0 failed
AUTO01$ <span class="hl">(J1 par) show system commit</span>
commit confirmed, rollback in 1mins
0   2026-10-11 17:15:33 UTC by netops via netconf commit confirmed, rollback in 1mins
    mvtoolkit</pre>
<p>Junos khud kehta hai ki commit <i>final nahi</i> hai: woh ek minute mein rollback hoga. Do minute ruko aur read-only command se dobara poocho:</p>
<pre class="out">AUTO01$ python3 mvtool.py verify; echo "exit code: $?"
NGP-BR-J1    DRIFT: ntp server 10.99.0.61 is missing
NGP-BR-R1    matches NetBox
1 ok, 1 drifted
exit code: 1</pre>
<p>Tests wajah batate hain. <code>python3 -m pytest -q</code> <code>1 failed, 6 passed</code> par khatam hota hai, aur fail hone wala test <code>test_a_good_read_back_confirms_a_junos_commit</code> hai: clean read-back ke baad code <code>confirm_commit()</code> kabhi call nahi karta. <code>safety.py</code> mein missing do lines wapas rakho, <code>7 passed</code> dekho, aur dobara apply karo. Timer khatam hone se pehle dobara apply <b>mat</b> karo: commit pending ho to compare ko koi difference nahi dikhta aur "already compliant" print hota hai.</p>

<h3>Problem 4: log mein secret</h3>
<pre class="out">AUTO01$ grep -c NK@2026 logs/mvtool.log
10
AUTO01$ grep -n NK@2026 logs/mvtool.log | head -2
1:2026-09-29 09:00:04,206 DEBUG login for NGP-BR-R1: netops / NK@2026
3:2026-09-29 09:00:04,812 DEBUG login for NGP-BR-R1: netops / NK@2026</pre>
<p>Password log mein hai, har run mein har device ke liye ek baar. Do wajahen saath: <code>inventory.py</code> mein <code>log.debug</code> line jo credential print karti hai, aur <code>.env</code> mein <code>MVT_LOG=DEBUG</code>, testing se chhodi hui. Line hatana fix hai; level wapas INFO karna prevention hai. Aur purana log abhi bhi secret rakhta hai: use delete karo, <code>verify</code> chalao taaki naya log bane, aur dobara gino: <code>0</code>. Asli duniya mein password rotate bhi karte, kyunki woh likha ja chuka hai.</p>

<div class="warn"><p><b>Chaaron ka kram.</b> Problems ek doosre ko chhupati hain. Jab tak scope sahi nahi, problem 3 J1 par dikh nahi sakti. Jab tak schema na nahi bol sakta, problem 2 green rehti hai. Unhe usi kram mein theek karo jis kram mein chain unhe milti hai, aur har fix ke baad read-only commands dobara chalao.</p></div>

<div class="scn"><h4>Do baar apply hua fix</h4><p>Ek engineer ne Junos router par "committed and verified" dekha aur agli subah bataya gaya ki NTP gayab hai. Usne <code>apply</code> dobara chalaya, "already compliant" mila aur socha ki monitoring galat hai. Us waqt commit-confirmed pending tha aur router phir rollback hone wala tha. <code>show system commit</code> das second mein pending line dikha deta.</p><p><b>Lesson:</b> do sources asahmat hon to device se seedha poocho, aisi command se jo use badal na sake.</p></div>

<div class="iv"><p class="q">"Aisi toolkit sambhalne ka tareeka batao jise kisi ne explain nahi kiya."</p><p>Pehle note padhta hoon, phir documented command chalakar ginti padhta hoon, sirf verdict nahi. Pehli hairani ko chain mein rakhta hoon aur read-only commands se reproduce karta hoon. Wajah theek karta hoon, lakshan nahi, jaise NetBox data aur woh schema check jo fire nahi hua, aur jahan ho sake test jodta hoon. Saaf run aur exit code se khatam karta hoon, aur wahi note likhta hoon jo mujhe chahiye tha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ginti evidence hai: "1 hosts in scope" pehla clue tha.</li>
<li>Jo green check kabhi fail nahi hua woh kuch saabit nahi karta; ek baar use fail karao.</li>
<li>Pending Junos commit timer khatam hone tak success jaisa dikhta hai.</li>
<li>Jo tests pehle se fail hain woh bug ka naam bata sakte hain; jaldi chalao.</li>
<li>Log mein secret leaked secret hai: line, level aur purani file teeno hatao.</li>
</ul></div>
`}};export{e as default};