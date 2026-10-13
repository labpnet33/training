var e={id:`troubleshooting`,h:{en:`Troubleshooting walk-through: five failures, one change request`,hi:`Troubleshooting walk-through: paanch failures, ek change request`},body:{en:`
<p>This is Lab 2 told as a story. Change <b>CHG-3107</b> asks a script to publish a new web server <code>web-new</code> (10.20.0.50), point a new rule <code>web-in</code> at it, and retire the old address <code>old-web</code> and its rule <code>web-old</code>. The script <code>chg3107.py</code> is already written. It fails five times in a row, each time for a different reason. The method is the same every time: read the layer, find the one cause, change one thing, run again.</p>

<h3>Failure 1: H&#84;TP 403</h3>
<pre class="out">AUTO01$ python3 chg3107.py
<span class="hl">create address web-new         FAILED h&#116;tp 403 code 403: Invalid Credential</span></pre>
<p>H&#84;TP 403 and "Invalid Credential" mean the key is not accepted at all. The <code>.env</code> file holds a key from last week for the account <code>svc-fw</code>, and the account has since been re-created. A key belongs to the account's current credentials, so an old key is dead. The fix is to generate a fresh one from the password, with the keygen from chapter 2:</p>
<pre class="out">AUTO01$ python3 keygen.py
<span class="hl">PAN_API_KEY for svc-fw saved to .env (95 characters)</span></pre>
<p>The key is written to <code>.env</code> and only its length is printed.</p>

<h3>Failure 2: code 16</h3>
<pre class="out">AUTO01$ python3 chg3107.py
<span class="hl">create address web-new         FAILED h&#116;tp 200 code 16: Unauthorized request</span></pre>
<p>Now the key is accepted: the status is H&#84;TP 200, but the body says code 16, "Unauthorized request". This is a role, not a credential, so another key would not help. The account was created with the role <code>superreader</code>, which can read and cannot write. In this lab a variable <code>ROLE</code> in <code>provision.py</code> decides it. Change it to <code>superuser</code> and run the provisioning step again:</p>
<pre class="out"><span class="hl">AUTO01$ sed -i 's/^ROLE = "superreader"/ROLE = "superuser"/' provision.py</span>
</pre>
<p>The provisioning script asks for the admin password with <code>getpass</code>, so the password is never in a file or in the command line. It rewrites the account and commits, job 4. On real equipment you would assign a custom Admin Role profile with only the permissions the script needs.</p>

<h3>Failure 3: code 12</h3>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
<span class="hl">create rule web-in             FAILED h&#116;tp 200 code 12: rulebase -&gt; security -&gt; rules -&gt; web-in destination 'web-nw' is not a valid reference | Edit breaks config validity</span></pre>
<p>The address was created, and the rule was refused. Read the message the way the firewall wrote it: the rule <code>web-in</code> has a destination <code>web-nw</code> that is not a valid reference. That name does not exist; it is a typo for <code>web-new</code>. One <code>sed</code> fixes it. The script is not re-created from scratch: <code>set</code> on the address is a merge, so running it again is harmless.</p>

<h3>Failure 4: code 10</h3>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
create rule web-in             ok
<span class="hl">delete address old-web         FAILED h&#116;tp 200 code 10: old-web cannot be deleted because of references from: | rulebase -&gt; security -&gt; rules -&gt; web-old destination</span></pre>
<p>The new objects are fine; the delete of <code>old-web</code> is refused, and the message names the holder: the rule <code>web-old</code> still uses it as a destination. The script deleted in the order address, then rule. Reverse it, so that the rule goes first (<code>DELETE_ORDER = ["rule", "address"]</code>). Whenever objects reference each other, create from the inside out and delete from the outside in.</p>

<h3>Failure 5: the commit job fails</h3>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
create rule web-in             ok
delete rule web-old            ok
delete address old-web         ok
job 5: ACT PEND 0%
<span class="hl">job 5: FIN FAIL 100%</span>
<span class="hl">commit job 5 ended FAIL:</span>
   rulebase -&gt; security -&gt; rules -&gt; web-in service is missing</pre>
<p>Every step returned OK, and the commit job ended with <b>FIN FAIL</b>. The details line says that the rule <code>web-in</code> has no service. The hand-written rule element in the script lacks the <code>&lt;service&gt;</code> tag, which the single <code>set</code> did not check but the whole-configuration validation did. The generic first and last lines of every failed job are filtered out, so only the useful line is printed. Add <code>application-default</code> as the service, and the last run:</p>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
create rule web-in             ok
delete rule web-old            ok
delete address old-web         ok
job 6: ACT PEND 0%
<span class="hl">job 6: FIN OK 100%</span>
<span class="hl">CHG-3107 done: commit job 6 OK</span></pre>
<p>Job 6 finished OK. Run <code>verify.py</code> to confirm: only <code>web-new</code> is in the address list, and <code>web-in</code> has the right destination, application, service and action.</p>

<h3>The method in one table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>One change</th></tr>
<tr><td>H&#84;TP 403</td><td>Credential</td><td>New key from the password</td></tr>
<tr><td>H&#84;TP 200, code 16</td><td>Role</td><td>Account role</td></tr>
<tr><td>Code 12 and a name</td><td>Reference</td><td>Spelling or missing object</td></tr>
<tr><td>Code 10 and a holder</td><td>Order</td><td>Delete the holder first</td></tr>
<tr><td>FIN FAIL</td><td>Validation</td><td>Fill the missing field named</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Changing two things at once, so you do not know which helped. Fixing only the symptom (a new key) for a role problem. Retrying a code 12 or 10 unchanged. Reading "commit sent" as done. Printing the key to compare it with another.</p></div>
<div class="exam"><p><b>Exam trap.</b> The same word "Unauthorized" or "Invalid" can come from different layers. Check whether the answer was H&#84;TP 403 or H&#84;TP 200 with code 16 before you pick a fix.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab runs the five faults in a fixed order. In real life they arrive in any order, and some of them (a held commit lock, a pending change by another admin) cannot be fixed from the script at all.</p></div>

<div class="scn"><h4>Friday, 5 pm, one more failure</h4><p>The change window was closing. The engineer fixed the key, then the role, then saw code 12 and, instead of reading it, regenerated the key again for fear it was credentials. Reading the message took ten seconds: a misspelled name. Each wrong guess cost a commit cycle.</p><p><b>Lesson:</b> the message names the cause. Read it before you act.</p></div>

<div class="iv"><p class="q">"Walk me through how you debug a failing PAN-OS automation script."</p><p>I find which layer answered: H&#84;TP status, body code, or exception. I read the message for the name it blames. I change one thing and run again. After every set I read the commit job result, not only the request status.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work layer by layer: credential (403), role (16), reference (12), order (10), validation (FIN FAIL).</li>
<li>The message names the cause: a missing name, a holder, a missing field.</li>
<li>Change one thing per run; reruns are safe because set merges.</li>
<li>Create from the inside out and delete from the outside in.</li>
<li>Verify the final state with a read, not with the success message.</li>
</ul></div>
`,hi:`
<p>Yeh Lab 2 ek kahani ki tarah hai. Change <b>CHG-3107</b> script se kehta hai ki naya web server <code>web-new</code> (10.20.0.50) publish karo, naye rule <code>web-in</code> ko usi par point karo, aur purane address <code>old-web</code> aur uske rule <code>web-old</code> ko retire karo. Script <code>chg3107.py</code> pehle se likhi hai. Woh lagataar paanch baar fail hoti hai, har baar alag wajah se. Tareeka har baar wahi: layer padho, ek wajah dhoondo, ek cheez badlo, dobara chalao.</p>

<h3>Failure 1: H&#84;TP 403</h3>
<pre class="out">AUTO01$ python3 chg3107.py
<span class="hl">create address web-new         FAILED h&#116;tp 403 code 403: Invalid Credential</span></pre>
<p>H&#84;TP 403 aur "Invalid Credential" ka matlab key bilkul accept nahi hui. <code>.env</code> mein pichhle hafte ki key hai account <code>svc-fw</code> ke liye, aur account tab se dobara bana hai. Key account ke maujooda credentials ki hoti hai, isliye puraani key mari hui hai. Fix hai password se nayi key banana, chapter 2 ke keygen se:</p>
<pre class="out">AUTO01$ python3 keygen.py
<span class="hl">PAN_API_KEY for svc-fw saved to .env (95 characters)</span></pre>
<p>Key <code>.env</code> mein likhi gayi aur sirf uski lambai print hui.</p>

<h3>Failure 2: code 16</h3>
<pre class="out">AUTO01$ python3 chg3107.py
<span class="hl">create address web-new         FAILED h&#116;tp 200 code 16: Unauthorized request</span></pre>
<p>Ab key accept hui: status H&#84;TP 200 hai, lekin body code 16, "Unauthorized request" kehti hai. Yeh role hai, credential nahi, isliye doosri key se kuch nahi hoga. Account <code>superreader</code> role ke saath bana tha, jo padh sakta hai, likh nahi sakta. Lab mein <code>provision.py</code> ka ek variable <code>ROLE</code> yeh tay karta hai. Use <code>superuser</code> karo aur provisioning step dobara chalao:</p>
<pre class="out"><span class="hl">AUTO01$ sed -i 's/^ROLE = "superreader"/ROLE = "superuser"/' provision.py</span>
</pre>
<p>Provisioning script admin password <code>getpass</code> se maangti hai, isliye password na file mein hai na command line mein. Woh account dobara likhti hai aur commit karti hai, job 4. Asli equipment par aap ek custom Admin Role profile denge jisme sirf script ko chahiye permissions ho.</p>

<h3>Failure 3: code 12</h3>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
<span class="hl">create rule web-in             FAILED h&#116;tp 200 code 12: rulebase -&gt; security -&gt; rules -&gt; web-in destination 'web-nw' is not a valid reference | Edit breaks config validity</span></pre>
<p>Address ban gaya, aur rule refuse hua. Message ko waise padho jaise firewall ne likha: rule <code>web-in</code> ka destination <code>web-nw</code> valid reference nahi hai. Woh naam maujood nahi; woh <code>web-new</code> ka typo hai. Ek <code>sed</code> ise theek karta hai. Script shuru se nahi banti: address par <code>set</code> merge hai, isliye dobara chalana harmless hai.</p>

<h3>Failure 4: code 10</h3>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
create rule web-in             ok
<span class="hl">delete address old-web         FAILED h&#116;tp 200 code 10: old-web cannot be deleted because of references from: | rulebase -&gt; security -&gt; rules -&gt; web-old destination</span></pre>
<p>Naye objects theek hain; <code>old-web</code> ka delete refuse hua, aur message holder ka naam batata hai: rule <code>web-old</code> use abhi bhi destination ki tarah use karta hai. Script ne order address, phir rule rakha tha. Ise ulta karo, rule pehle jaaye (<code>DELETE_ORDER = ["rule", "address"]</code>). Jab objects ek doosre ko refer karte hon, andar se bahar banao aur bahar se andar delete karo.</p>

<h3>Failure 5: commit job fail</h3>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
create rule web-in             ok
delete rule web-old            ok
delete address old-web         ok
job 5: ACT PEND 0%
<span class="hl">job 5: FIN FAIL 100%</span>
<span class="hl">commit job 5 ended FAIL:</span>
   rulebase -&gt; security -&gt; rules -&gt; web-in service is missing</pre>
<p>Har step OK tha, aur commit job <b>FIN FAIL</b> ke saath khatam hui. Details line kehti hai ki rule <code>web-in</code> mein service nahi hai. Script ke haath se likhe rule element mein <code>&lt;service&gt;</code> tag nahi hai, jise akele <code>set</code> ne check nahi kiya lekin poori-configuration validation ne kiya. Har failed job ki generic pehli aur aakhri line filter ho jaati hai, isliye sirf kaam ki line print hoti hai. Service ke roop mein <code>application-default</code> jodo, aur aakhri run:</p>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
create rule web-in             ok
delete rule web-old            ok
delete address old-web         ok
job 6: ACT PEND 0%
<span class="hl">job 6: FIN OK 100%</span>
<span class="hl">CHG-3107 done: commit job 6 OK</span></pre>
<p>Job 6 OK ke saath khatam hui. Confirm karne ke liye <code>verify.py</code> chalao: address list mein sirf <code>web-new</code> hai, aur <code>web-in</code> ka destination, application, service aur action sahi hain.</p>

<h3>Tareeka ek table mein</h3>
<table class="cmp"><tr><th>Lakshan</th><th>Layer</th><th>Ek badlaav</th></tr>
<tr><td>H&#84;TP 403</td><td>Credential</td><td>Password se nayi key</td></tr>
<tr><td>H&#84;TP 200, code 16</td><td>Role</td><td>Account ka role</td></tr>
<tr><td>Code 12 aur ek naam</td><td>Reference</td><td>Spelling ya gayab object</td></tr>
<tr><td>Code 10 aur ek holder</td><td>Order</td><td>Pehle holder delete karo</td></tr>
<tr><td>FIN FAIL</td><td>Validation</td><td>Bataya gaya gayab field bharo</td></tr></table>

<div class="warn"><p><b>Aam galtiyan.</b> Ek saath do cheezein badalna, phir pata nahi kisse fayda hua. Role ki samasya mein sirf lakshan theek karna (nayi key). Code 12 ya 10 ko bina badle retry karna. "Commit sent" ko done samajhna. Key ko doosri se milane ke liye print karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Unauthorized" ya "Invalid" jaisa shabd alag layers se aa sakta hai. Fix chunne se pehle dekho jawab H&#84;TP 403 tha ya H&#84;TP 200 ke saath code 16.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab paanchon faults ek tay kram mein chalata hai. Asli zindagi mein woh kisi bhi kram mein aate hain, aur kuch (pakda hua commit lock, kisi aur admin ka pending change) script se theek hi nahi ho sakte.</p></div>

<div class="scn"><h4>Shukravaar, shaam 5 baje, ek aur failure</h4><p>Change window band hone wala tha. Engineer ne key theek ki, phir role, phir code 12 dekha aur padhne ke bajaye credentials ke darr se key phir banayi. Message padhne mein das second lagte: naam ki spelling galat thi. Har galat andaza ek commit cycle ka kharcha tha.</p><p><b>Lesson:</b> message wajah ka naam batata hai. Kuch karne se pehle padho.</p></div>

<div class="iv"><p class="q">"Fail hoti PAN-OS automation script ko kaise debug karte ho?"</p><p>Pehle dekhta hoon kaun si layer ne jawab diya: H&#84;TP status, body code ya exception. Message padhta hoon ki woh kis naam ko doshi batata hai. Ek cheez badalta hoon aur dobara chalata hoon. Har set ke baad commit job ka result padhta hoon, sirf request ka status nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer ba layer kaam karo: credential (403), role (16), reference (12), order (10), validation (FIN FAIL).</li>
<li>Message wajah ka naam batata hai: gayab naam, holder, gayab field.</li>
<li>Har run mein ek cheez badlo; reruns safe hain kyunki set merge karta hai.</li>
<li>Andar se bahar banao aur bahar se andar delete karo.</li>
<li>Final state ko read se verify karo, success message se nahi.</li>
</ul></div>
`}};export{e as default};