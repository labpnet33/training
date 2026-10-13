var e=`<pre class="out">AUTO01$ python3 fleet.py
---- J1

[edit system ntp]
+   server 10.99.0.60;
[edit protocols bgp group IBGP]
+   import NK-IMPORT;

---- J2

[edit system]
<span class="hl">+   location {
+       building HQ-R9;
+   }</span>
[edit system ntp]
+   server 10.99.0.60;
[edit protocols bgp group IBGP]
+   import NK-IMPORT;

---- J3
...
dry run: nothing committed</pre>`,t=`<pre class="out">AUTO01$ sed -i 's/^    cu = Config(dev)$/&\\n    cu.lock()/' fleet.py
AUTO01$ python3 fleet.py
Traceback (most recent call last):
  File "fleet.py", line 45, in &lt;module&gt;
    main()
  File "fleet.py", line 34, in main
    stage(name)
  File "fleet.py", line 20, in stage
    cu.lock()
  File "/usr/lib/python3.11/jnpr/junos/utils/config.py", line 65, in lock
    raise LockError(rsp=err.rsp)
jnpr.junos.exception.LockError: LockError(severity: error, bad_element: lock-configuration, message: <span class="hl">configuration database modified</span>)</pre>`,n=`<pre class="out">AUTO01$ python3 fleet.py
FAILED: LockError(severity: error, bad_element: lock-configuration, message: configuration database modified)
AUTO01$ python3 discard.py J1 J2 J3
J1: uncommitted changes discarded
J2: uncommitted changes discarded
J3: uncommitted changes discarded
AUTO01$ python3 fleet.py
---- J1
...
---- J2

[edit system ntp]
+   server 10.99.0.60;
[edit protocols bgp group IBGP]
+   import NK-IMPORT;
...
dry run: nothing committed</pre>`,r=`<pre class="out">AUTO01$ sed -i 's/^    print(cu.diff())$/&\\n    cu.commit_check()/' fleet.py
AUTO01$ python3 fleet.py
---- J1
...
FAILED: CommitError(edit_path: [edit protocols bgp], bad_element: group IBGP, message: <span class="hl">Policy error: Policy NK-IMPORT referenced but not defined</span>)</pre>`,i=`<pre class="out">AUTO01$ python3 fleet.py --commit
...
J1: committed
J2: committed
J3: committed
AUTO01$ python3 verify.py
J1 ntp=['10.99.0.60', '10.99.0.99'] import=NK-IMPORT <span class="hl">WRONG</span>
J2 ntp=['10.99.0.60', '10.99.0.99'] import=NK-IMPORT <span class="hl">WRONG</span>
J3 ntp=['10.99.0.60', '10.99.0.99'] import=NK-IMPORT <span class="hl">WRONG</span>

AUTO01$ sed -i 's/^    ntp {$/    replace: ntp {/' changes/nk-1042.conf
AUTO01$ sed -i 's/, merge=True//' fleet.py
AUTO01$ python3 fleet.py --commit
...
AUTO01$ python3 verify.py
J1 ntp=['10.99.0.60'] import=NK-IMPORT OK
J2 ntp=['10.99.0.60'] import=NK-IMPORT OK
J3 ntp=['10.99.0.60'] import=NK-IMPORT OK</pre>`,a={id:`troubleshooting`,h:{en:`Troubleshooting a config push`,hi:`Config push ka troubleshooting`},body:{en:`
<p>This is the troubleshooting chapter, and it follows Lab 2 step by step. The night shift left a script, <code>fleet.py</code>, that pushes ticket NK-1042 (a new NTP server and a BGP import policy) to three routers. It "worked on my laptop". The method is the one you use for any config pipeline: <b>read what the tool says it will do before you let it do it, then fix the faults one at a time, in the order they appear</b>, and prove the result by asking the routers, not the script.</p>

<h3>The method</h3>
<ol class="steps">
<li><b>Run the dry run and read the diff.</b> Every line is something that will happen to production.</li>
<li><b>Fix the first failure only,</b> then run again. Faults hide behind each other.</li>
<li><b>Match the symptom to the layer:</b> lock, load, check or commit.</li>
<li><b>Verify against the devices,</b> with a separate script that reads the state and compares it with the intent.</li></ol>

<h3>Fault 1: the diff has lines nobody asked for</h3>
<p>The script has a dry run (without <code>--commit</code> it stages the change and prints the diff). Read it.</p>
`+e+`
<p>J1 and J3 show the two lines the ticket describes. J2 shows a third stanza, <code>location { building HQ-R9; }</code>. That is not in <code>changes/nk-1042.conf</code>. Someone else has an <b>uncommitted change in J2's candidate</b>, and this script's <code>commit()</code> would ship it, because a commit publishes the whole candidate, not just what you loaded. The right reaction is to stop and ask whose it is. The wrong one is to commit and hope.</p>
<div class="warn"><p><b>A commit sends everything in the candidate.</b> This is the cost of the shared candidate model you saw in chapter 2. The diff is how you notice; the lock is how you prevent it.</p></div>

<h3>Fault 2: no lock, and then the lock says no</h3>
<p>Look at <code>stage()</code> in the script: it opens, creates <code>Config(dev)</code>, and loads. There is no <code>lock()</code>. Without it, nothing stops a colleague from editing at the same time. Add it (the Lab gives you a one-line <code>sed</code>), and the script now meets the real state of the world.</p>
`+t+`
<p>Read the message exactly: <b>"configuration database modified"</b>. It is not "locked by another session". It means the database is free but its candidate has uncommitted changes, which is J2's <code>HQ-R9</code> line. The lock has done its job: it refused to let you build on top of a dirty candidate. You also see a raw traceback, which is the second problem: an uncaught <code>LockError</code> kills the script with other sessions still open and, on a different run, other devices already staged and locked.</p>

<h3>Fault 3: cleanup that is missing</h3>
<p>Two edits fix the shape of the script. In <code>release()</code>, roll back and unlock before closing, so no path leaves a lock or a half-loaded candidate behind. Around <code>main()</code>, catch <code>LockError</code>, <code>ConfigLoadError</code> and <code>CommitError</code>, print them in one line, release everything and exit 1. Now the failure is a sentence, not a traceback.</p>
`+n+`
<p>The scripted failure is clean. To get past it, the lab provides <code>discard.py</code>, which runs <code>rollback()</code> (rollback 0) on the named devices. The lab says "use with care" for a reason: it throws away uncommitted work, and in a real shop that work belongs to a person. Find out who it is (a session in <code>show system users</code>, a colleague's message), get their agreement, and only then discard. After the discard, the second dry run is clean: J2 shows only the ticket's two stanzas.</p>

<h3>Fault 4: the check that was never run</h3>
<p>The dry run was clean, but it never asked the router whether the result is valid. Add <code>cu.commit_check()</code> after the diff (one more line) and run again.</p>
`+r+`
<p>The change file sets <code>import NK-IMPORT</code> on the group, but nothing defines the policy. The load accepted it, the diff printed it, and the commit would have been refused at the end, or accepted on a router that already had such a policy and refused on those that did not. The fix is in the change file: add the <code>policy-options</code> stanza, so the file is complete in itself. The new dry run then shows the policy appearing in the diff for J3 (where it is missing), and as already present on J1 and J2.</p>
<div class="note"><p>That difference between routers is itself a finding: J1 and J2 were already carrying the policy, J3 was not. A fleet that has drifted apart is the normal state of things, which is why you read the per-device diff and do not assume the same text produces the same patch.</p></div>

<h3>Fault 5: it committed, and it is still wrong</h3>
<p>Now commit. Every device reports success. This is where most people stop, and where the real problem lives.</p>
`+i+`
<p>The script said "committed", and <code>verify.py</code> says <b>WRONG</b>: the requirement was "the NTP server is 10.99.0.60", meaning exactly one, and each router still has <code>10.99.0.99</code> as well. The load used <code>merge=True</code>, which adds and never removes (chapter 5). The change file also has no <code>replace:</code> tag. The fix has two small pieces: mark the stanza as <code>replace: ntp</code> in the change file, and drop <code>merge=True</code> from the load so that the default replace action honours the tag. The second commit shows the stale server removed on each router, and verify turns green.</p>
<p>Notice what made this findable: <code>verify.py</code> reads each router's configuration with <code>get_config(filter_xml=...)</code> and compares it with the intent. Success output from a pipeline is evidence of effort, not of outcome.</p>

<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>First thing to check</th></tr>
<tr><td>Diff has unexpected lines</td><td>Candidate</td><td>Someone's uncommitted work: ask, then discard</td></tr>
<tr><td>"configuration database modified"</td><td>Lock</td><td>Dirty candidate on that device</td></tr>
<tr><td>"locked by another session"</td><td>Lock</td><td>Another live session holds it: wait or find them</td></tr>
<tr><td>Traceback instead of a message</td><td>Script</td><td>Uncaught exception, missing cleanup</td></tr>
<tr><td>CommitError, "referenced but not defined"</td><td>Check</td><td>A reference with no definition in the change</td></tr>
<tr><td>Committed, but verify says WRONG</td><td>Semantics</td><td>Merge vs replace: did you mean "only"?</td></tr></table>

<div class="exam"><p><b>Exam trap.</b> "The script printed 'committed' for all devices, so the change is correct." It means the router accepted the commit. Correctness is a separate question, answered by reading the state back.</p></div>

<div class="scn"><h4>The fleet script that was correct on Tuesday</h4><p>A team's push worked for months. After a colleague left a half-finished edit on one router, the script's dry run was clean on two routers and showed a stray stanza on the third. The engineer committed anyway "because the ticket lines are there". The stray lines turned on a feature nobody had reviewed.</p><p><b>Lesson:</b> a diff is a contract. If it contains anything you cannot explain, you do not commit.</p></div>

<div class="iv"><p class="q">"A PyEZ push says 'configuration database modified' when it tries to lock. What does it mean and what do you do?"</p><p>The database is not held by another session, but its candidate contains uncommitted changes from someone. I look at what they are, with a diff against running, find the owner, and either have them commit or discard it, or discard it myself with their agreement. I never commit on top of someone else's candidate, because a commit publishes all of it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the dry-run diff first; unexpected lines mean a dirty candidate.</li>
<li>"database modified" is a dirty candidate; "locked by another session" is a live holder.</li>
<li>Catch the exceptions, roll back and unlock in one place, exit non-zero.</li>
<li>Add <code>commit_check()</code> to every dry run.</li>
<li>Verify the outcome from the devices; "exactly" needs replace, not merge.</li></ul></div>
`,hi:`
<p>Yeh troubleshooting chapter hai, aur yeh Lab 2 ko step by step follow karta hai. Night shift ne ek script, <code>fleet.py</code>, chhodi hai jo ticket NK-1042 (naya NTP server aur BGP import policy) teen routers par push karti hai. Woh "mere laptop par chali". Tareeka wahi hai jo kisi bhi config pipeline ke liye hota hai: <b>tool ko kuch karne dene se pehle padho ki woh kya karega, phir faults ko ek ek karke, unke aane ke kram mein fix karo</b>, aur result ko script se nahi, routers se poochh kar saabit karo.</p>

<h3>Tareeka</h3>
<ol class="steps">
<li><b>Dry run chalao aur diff padho.</b> Har line production ke saath hone wali cheez hai.</li>
<li><b>Sirf pehli failure fix karo,</b> phir dobara chalao. Faults ek doosre ke peeche chhupe hote hain.</li>
<li><b>Symptom ko layer se milao:</b> lock, load, check ya commit.</li>
<li><b>Devices se verify karo,</b> ek alag script se jo state padhe aur intent se compare kare.</li></ol>

<h3>Fault 1: diff mein woh lines jo kisi ne nahi maangi</h3>
<p>Script mein dry run hai (<code>--commit</code> ke bina yeh change stage karti hai aur diff print karti hai). Use padho.</p>
`+e+`
<p>J1 aur J3 wahi do lines dikhate hain jo ticket batata hai. J2 teesra stanza dikhata hai, <code>location { building HQ-R9; }</code>. Yeh <code>changes/nk-1042.conf</code> mein nahi hai. Kisi aur ka <b>J2 ke candidate mein uncommitted change</b> hai, aur is script ka <code>commit()</code> use bhej deta, kyunki commit poora candidate publish karta hai, sirf wo nahi jo aapne load kiya. Sahi pratikriya hai rukna aur poochhna ki kiska hai. Galat hai commit karke ummeed rakhna.</p>
<div class="warn"><p><b>Commit candidate ki har cheez bhejta hai.</b> Yeh chapter 2 mein dekhe shared candidate model ki keemat hai. Diff se aap notice karte ho; lock se aap rokte ho.</p></div>

<h3>Fault 2: lock nahi hai, phir lock mana kar deta hai</h3>
<p>Script ka <code>stage()</code> dekho: yeh open karta hai, <code>Config(dev)</code> banata hai, aur load karta hai. <code>lock()</code> nahi hai. Uske bina koi cheez colleague ko ek saath edit karne se nahi rokti. Use jodo (Lab ek line ka <code>sed</code> deta hai), aur script ab duniya ki asli state se milti hai.</p>
`+t+`
<p>Message ko theek se padho: <b>"configuration database modified"</b>. Yeh "locked by another session" nahi hai. Iska matlab hai database free hai par uske candidate mein uncommitted changes hain, jo J2 ki <code>HQ-R9</code> line hai. Lock ne apna kaam kiya: usne aapko dirty candidate ke upar banane se mana kar diya. Aapko raw traceback bhi dikhta hai, jo doosri problem hai: uncaught <code>LockError</code> script ko maar deta hai jabki doosre sessions khule hain aur, kisi aur run mein, doosre devices pehle se staged aur locked hain.</p>

<h3>Fault 3: cleanup jo missing hai</h3>
<p>Do edits script ki shape theek karte hain. <code>release()</code> mein band karne se pehle rollback aur unlock karo, taaki koi path lock ya aadha-loaded candidate peeche na chhode. <code>main()</code> ke ird-gird <code>LockError</code>, <code>ConfigLoadError</code> aur <code>CommitError</code> pakdo, ek line mein print karo, sab release karo aur 1 se exit karo. Ab failure ek vaakya hai, traceback nahi.</p>
`+n+`
<p>Scripted failure saaf hai. Isse aage jaane ke liye lab <code>discard.py</code> deta hai, jo naam diye devices par <code>rollback()</code> (rollback 0) chalata hai. Lab "use with care" kehta hai, aur kisi wajah se: yeh uncommitted kaam phenk deta hai, aur real shop mein woh kaam kisi insaan ka hota hai. Pata karo kiska hai (<code>show system users</code> mein session, colleague ka message), unki sehmati lo, aur tab hi discard karo. Discard ke baad doosra dry run saaf hai: J2 sirf ticket ke do stanzas dikhata hai.</p>

<h3>Fault 4: woh check jo kabhi chala hi nahi</h3>
<p>Dry run saaf tha, par usne kabhi router se nahi poochha ki result valid hai ya nahi. Diff ke baad <code>cu.commit_check()</code> jodo (ek aur line) aur dobara chalao.</p>
`+r+`
<p>Change file group par <code>import NK-IMPORT</code> set karti hai, par policy koi define nahi karta. Load ne accept kiya, diff ne print kiya, aur commit end mein refuse hota, ya aise router par accept hota jisme pehle se aisi policy thi aur unpar refuse jisme nahi thi. Fix change file mein hai: <code>policy-options</code> stanza jodo, taaki file apne aap mein poori ho. Naya dry run phir J3 (jahan woh missing hai) ke diff mein policy aati dikhata hai, aur J1 aur J2 par pehle se maujood.</p>
<div class="note"><p>Routers ke beech yeh farq khud ek finding hai: J1 aur J2 pehle se policy rakhte the, J3 nahi. Jo fleet alag-alag drift ho chuka hai woh aam halat hai, isiliye aap per-device diff padhte ho aur yeh nahi maante ki wahi text wahi patch banata hai.</p></div>

<h3>Fault 5: commit ho gaya, aur ab bhi galat hai</h3>
<p>Ab commit karo. Har device success report karta hai. Zyaadatar log yahin ruk jaate hain, aur asli problem yahin hai.</p>
`+i+`
<p>Script ne "committed" kaha, aur <code>verify.py</code> kehta hai <b>WRONG</b>: requirement thi "NTP server 10.99.0.60 hai", matlab bilkul ek, aur har router par abhi bhi <code>10.99.0.99</code> bhi hai. Load ne <code>merge=True</code> use kiya, jo jodta hai aur kabhi hatata nahi (chapter 5). Change file mein <code>replace:</code> tag bhi nahi hai. Fix ke do chhote hisse hain: change file mein stanza ko <code>replace: ntp</code> mark karo, aur load se <code>merge=True</code> hatao taaki default replace action tag ko maane. Doosra commit har router par stale server hatata dikhata hai, aur verify hara ho jaata hai.</p>
<p>Dhyan do ki ise kisne findable banaya: <code>verify.py</code> har router ki configuration <code>get_config(filter_xml=...)</code> se padhti hai aur intent se compare karti hai. Pipeline ka success output mehnat ka saboot hai, outcome ka nahi.</p>

<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>Pehle kya dekho</th></tr>
<tr><td>Diff mein unexpected lines</td><td>Candidate</td><td>Kisi ka uncommitted kaam: poochho, phir discard</td></tr>
<tr><td>"configuration database modified"</td><td>Lock</td><td>Us device par dirty candidate</td></tr>
<tr><td>"locked by another session"</td><td>Lock</td><td>Koi aur live session pakde hai: ruko ya unhe dhoondho</td></tr>
<tr><td>Message ki jagah traceback</td><td>Script</td><td>Uncaught exception, cleanup missing</td></tr>
<tr><td>CommitError, "referenced but not defined"</td><td>Check</td><td>Aisa reference jiski change mein definition nahi</td></tr>
<tr><td>Committed, par verify WRONG kehta hai</td><td>Semantics</td><td>Merge vs replace: kya aapka matlab "only" tha?</td></tr></table>

<div class="exam"><p><b>Exam trap.</b> "Script ne sab devices ke liye 'committed' print kiya, to change sahi hai." Iska matlab router ne commit accept kiya. Sahi hona alag sawaal hai, jiska jawab state wapas padh kar milta hai.</p></div>

<div class="scn"><h4>Fleet script jo mangalwar ko sahi thi</h4><p>Ek team ka push mahino chala. Jab ek colleague ne ek router par aadhi edit chhod di, to script ka dry run do routers par saaf tha aur teesre par ek stray stanza dikha raha tha. Engineer ne phir bhi commit kiya "kyunki ticket ki lines wahan hain". Stray lines ne ek aisi feature on kar di jise kisi ne review nahi kiya tha.</p><p><b>Lesson:</b> diff ek contract hai. Agar usme kuch aisa hai jo aap samjha nahi sakte, to aap commit nahi karte.</p></div>

<div class="iv"><p class="q">"PyEZ push lock karte waqt 'configuration database modified' deta hai. Iska matlab kya hai aur aap kya karoge?"</p><p>Database kisi aur session ke paas nahi hai, par uske candidate mein kisi ke uncommitted changes hain. Main running ke against diff se dekhta hoon ki woh kya hain, owner dhoondhta hoon, aur ya unse commit ya discard karwata hoon, ya unki sehmati se khud discard karta hoon. Main kabhi kisi aur ke candidate ke upar commit nahi karta, kyunki commit sab kuch publish karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle dry-run diff padho; unexpected lines ka matlab dirty candidate.</li>
<li>"database modified" dirty candidate hai; "locked by another session" live holder hai.</li>
<li>Exceptions pakdo, ek jagah rollback aur unlock karo, non-zero exit do.</li>
<li>Har dry run mein <code>commit_check()</code> jodo.</li>
<li>Outcome devices se verify karo; "exactly" ke liye replace chahiye, merge nahi.</li></ul></div>
`}};export{a as default};