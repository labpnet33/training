var e={id:`summary`,h:{en:`Summary: checklist, glossary and cheat sheet`,hi:`Summary: checklist, glossary aur cheat sheet`},body:{en:`
<p>You can now do what the opening chapter promised: take a key, change a PAN-OS firewall through its API, wait for the commit job, prove the result and explain every failure. This last chapter gathers it on one page so that you can find a detail fast, in a lab, in an interview, or at 2 am.</p>

<h3>The whole flow in six steps</h3>
<ol>
<li><b>Key.</b> POST <code>type=keygen</code> once with the password from <code>getpass</code>; store the key in <code>.env</code> (mode 600); send it as <code>X-PAN-KEY</code>.</li>
<li><b>Read.</b> <code>get</code> for candidate, <code>show</code> for running. Learn the xpath from a read first.</li>
<li><b>Write.</b> <code>set</code> merges, <code>edit</code> replaces, <code>delete</code> removes. Everything lands in the candidate.</li>
<li><b>Commit.</b> A job: code 19 and an id, poll <code>show jobs</code> to FIN, then OK or FAIL. Code 13 means nothing to do.</li>
<li><b>Verify.</b> Read the running configuration, and ask <code>test security-policy-match</code> for the traffic that matters.</li>
<li><b>Report.</b> One line per step, one exit code, no key in any output.</li>
</ol>

<h3>Cheat sheet</h3>
<pre class="code">type=keygen  user=..  password=..          -&gt; key (POST, never in a URL)
type=config  action=get|show|set|edit|delete|rename|move  xpath=..  element=..
type=op      cmd="&lt;show&gt;&lt;jobs&gt;&lt;id&gt;3&lt;/id&gt;&lt;/jobs&gt;&lt;/show&gt;"
type=commit  cmd="&lt;commit&gt;&lt;/commit&gt;"       -&gt; job id (code 19) or code 13

fw = firewall.Firewall(host, api_key=os.environ["PAN_API_KEY"], timeout=10)
obj = fw.add(objects.AddressObject("web-srv", "10.20.0.10/32"))
obj.create()  obj.apply()  obj.refresh()  obj.delete()
objects.AddressObject.refreshall(fw, add=False)
result = fw.commit(sync=True)        # dict, or None when nothing changed
fw.op(xml_string, cmd_xml=False)     # operational command with your own XML</pre>

<h3>Checklist before you run a change</h3>
<ul>
<li>Is the key from the environment, and is the <code>.env</code> file private and ignored by git?</li>
<li>Does the tool compare first and commit only when it changed something?</li>
<li>Does it delete in the right order and report the job result?</li>
<li>Does it exit 0 or 1 and print a clear one-line reason?</li>
<li>Did you test the traffic, not only read the rule?</li>
</ul>

<h3>Interview checklist</h3>
<ul>
<li>Can you explain candidate versus running, and get versus show, in one breath?</li>
<li>Can you name set versus edit and the damage a wrong choice does?</li>
<li>Can you say what code 19, 13, 16, 12 and 10 each mean?</li>
<li>Can you describe how a commit job is polled and what FIN FAIL tells you?</li>
<li>Can you show how a script stays idempotent and keeps the key secret?</li>
</ul>

<h3>Interview checklist</h3>
<ul>
<li>Kya aap candidate aur running, aur get aur show ka farak ek saans mein samjha sakte ho?</li>
<li>Kya aap set aur edit ka naam aur galat chunav ka nuksaan bata sakte ho?</li>
<li>Kya aap bata sakte ho ki code 19, 13, 16, 12 aur 10 ka kya matlab hai?</li>
<li>Kya aap bata sakte ho ki commit job kaise poll hoti hai aur FIN FAIL kya batata hai?</li>
<li>Kya aap dikha sakte ho ki script idempotent kaise rehti hai aur key secret kaise?</li>
</ul>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr>
<tr><td>Candidate</td><td>Configuration being edited; not live until committed</td></tr>
<tr><td>Running</td><td>Configuration the firewall is using now</td></tr>
<tr><td>XPath</td><td>Route to one node of the configuration tree</td></tr>
<tr><td>Job</td><td>Background task started by a commit; has ACT or FIN status</td></tr>
<tr><td>Admin role</td><td>What an account is allowed to do through the API</td></tr>
<tr><td>Idempotent</td><td>A repeat of the same request changes nothing more</td></tr></table>

<h3>Where this fits</h3>
<p>The XML parsing here is the one from the XML module, and the requests, headers and timeouts are the ones from Program 1. What is new is the firewall's own model: a candidate, a commit job and a reference-checked configuration. The same habits carry over to any device whose changes are staged and then published.</p>

<div class="warn"><p><b>Common mistakes.</b> Treating H&#84;TP 200 as success. Using <code>edit</code> for a partial update. Skipping the commit job result. Printing the key while debugging. Rotating the key when the real cause is a role or a path.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match each symptom to its layer: 403 credential, 16 role, 12 reference or value, 10 delete order, 13 nothing to commit, FIN FAIL validation, timeout path.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab is a simulator with one firewall and a few object types. Panorama, multiple virtual systems, commit locks and partial commits are all real topics that this module did not simulate.</p></div>

<div class="scn"><h4>The handover</h4><p>A colleague left a firewall script with a README of two lines. The new owner read it, saw the key was loaded from the environment, saw that the second run did nothing and that failures had one-line reasons and exit codes, and put it in the pipeline the same day. Without those habits the same script would have been rewritten.</p><p><b>Lesson:</b> a safe tool explains itself.</p></div>

<div class="iv"><p class="q">"Summarise how you would automate a firewall change safely."</p><p>Short-lived secrets from the environment, a reviewed request file, read before write, a compare step so the tool is idempotent, a commit job that I poll and verify, a policy test for the real traffic, and clear exit codes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Key, read, write, commit job, verify, report: six steps in this order.</li>
<li>Candidate versus running explains most surprises.</li>
<li>Three layers of "no": H&#84;TP, code, exception.</li>
<li>Idempotent tools commit only when something changed.</li>
<li>Never print the key; take it from the environment.</li>
</ul></div>
`,hi:`
<p>Ab aap woh kar sakte ho jo pehle chapter ne vaada kiya tha: key lo, PAN-OS firewall ko uski API se badlo, commit job ka intezaar karo, natija saabit karo aur har failure samjhao. Yeh aakhri chapter sab kuch ek page par jodta hai taaki lab mein, interview mein ya raat ke 2 baje koi detail jaldi mil jaye.</p>

<h3>Poora flow chhe steps mein</h3>
<ol>
<li><b>Key.</b> <code>getpass</code> wale password ke saath ek baar <code>type=keygen</code> POST karo; key ko <code>.env</code> (mode 600) mein rakho; <code>X-PAN-KEY</code> ke roop mein bhejo.</li>
<li><b>Padho.</b> Candidate ke liye <code>get</code>, running ke liye <code>show</code>. Xpath pehle read se seekho.</li>
<li><b>Likho.</b> <code>set</code> merge karta hai, <code>edit</code> replace, <code>delete</code> hataata hai. Sab kuch candidate mein jaata hai.</li>
<li><b>Commit.</b> Ek job: code 19 aur id, <code>show jobs</code> ko FIN tak poll karo, phir OK ya FAIL. Code 13 ka matlab karne ko kuch nahi.</li>
<li><b>Verify.</b> Running configuration padho, aur jis traffic ki fikr hai uske liye <code>test security-policy-match</code> pucho.</li>
<li><b>Report.</b> Har step ki ek line, ek exit code, kisi output mein key nahi.</li>
</ol>

<h3>Cheat sheet</h3>
<pre class="code">type=keygen  user=..  password=..          -&gt; key (POST, never in a URL)
type=config  action=get|show|set|edit|delete|rename|move  xpath=..  element=..
type=op      cmd="&lt;show&gt;&lt;jobs&gt;&lt;id&gt;3&lt;/id&gt;&lt;/jobs&gt;&lt;/show&gt;"
type=commit  cmd="&lt;commit&gt;&lt;/commit&gt;"       -&gt; job id (code 19) or code 13

fw = firewall.Firewall(host, api_key=os.environ["PAN_API_KEY"], timeout=10)
obj = fw.add(objects.AddressObject("web-srv", "10.20.0.10/32"))
obj.create()  obj.apply()  obj.refresh()  obj.delete()
objects.AddressObject.refreshall(fw, add=False)
result = fw.commit(sync=True)        # dict, or None when nothing changed
fw.op(xml_string, cmd_xml=False)     # operational command with your own XML</pre>

<h3>Change chalane se pehle checklist</h3>
<ul>
<li>Key environment se aa rahi hai, aur <code>.env</code> file private hai aur git se ignore hai?</li>
<li>Tool pehle compare karta hai aur kuch badla ho tabhi commit karta hai?</li>
<li>Kya woh sahi order mein delete karta hai aur job result report karta hai?</li>
<li>Kya woh exit 0 ya 1 deta hai aur saaf ek-line wajah print karta hai?</li>
<li>Aapne traffic test kiya, sirf rule nahi padha?</li>
</ul>

<h3>Glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th></tr>
<tr><td>Candidate</td><td>Jo configuration edit ho rahi hai; commit tak live nahi</td></tr>
<tr><td>Running</td><td>Jo configuration firewall abhi use kar raha hai</td></tr>
<tr><td>XPath</td><td>Configuration tree ke ek node tak ka raasta</td></tr>
<tr><td>Job</td><td>Commit se shuru background task; ACT ya FIN status</td></tr>
<tr><td>Admin role</td><td>API se account kya kar sakta hai</td></tr>
<tr><td>Idempotent</td><td>Wahi request dohrane se aur kuch nahi badalta</td></tr></table>

<h3>Yeh kahan fit hota hai</h3>
<p>Yahan ka XML parsing XML module wala hai, aur requests, headers aur timeouts Program 1 ke hain. Naya hai firewall ka apna model: candidate, commit job aur reference-checked configuration. Wahi aadatein har us device par kaam aati hain jiske changes pehle stage hote hain phir publish.</p>

<div class="warn"><p><b>Aam galtiyan.</b> H&#84;TP 200 ko success maanna. Adhure update ke liye <code>edit</code> use karna. Commit job ka result chhod dena. Debug karte waqt key print karna. Asli wajah role ya path hone par key rotate karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har lakshan ko uski layer se milao: 403 credential, 16 role, 12 reference ya value, 10 delete order, 13 commit ko kuch nahi, FIN FAIL validation, timeout path.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab ek simulator hai jisme ek firewall aur kuch object types hain. Panorama, multiple virtual systems, commit locks aur partial commits sab asli topics hain jo is module mein simulate nahi hue.</p></div>

<div class="scn"><h4>Handover</h4><p>Ek saathi firewall script do line ke README ke saath chhod gaya. Naye owner ne padha, dekha ki key environment se aati hai, doosri run kuch nahi karti, aur failures ki ek-line wajah aur exit codes hain, aur use usi din pipeline mein daal diya. In aadaton ke bina wahi script dobara likhni padti.</p><p><b>Lesson:</b> safe tool apne aap ko samjhata hai.</p></div>

<div class="iv"><p class="q">"Firewall change ko safely automate kaise karoge, summary mein batao."</p><p>Environment se chhote-umar ke secrets, review hui request file, likhne se pehle padhna, compare step taaki tool idempotent ho, commit job jise main poll aur verify karta hoon, asli traffic ke liye policy test, aur saaf exit codes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Key, padho, likho, commit job, verify, report: chhe steps isi kram mein.</li>
<li>Candidate aur running ka farak zyadatar hairaniyon ko samjhata hai.</li>
<li>"Na" ki teen layers: H&#84;TP, code, exception.</li>
<li>Idempotent tools sirf kuch badla ho tab commit karte hain.</li>
<li>Key kabhi print mat karo; environment se lo.</li>
</ul></div>
`}};export{e as default};