var e={id:`failures`,h:{en:`Failed hosts: causes, retries, processors and logs`,hi:`Failed hosts: causes, retries, processors aur logs`},body:{en:`
<p>A fleet always has a dead device, a changed password or a typo in a key. Nornir expects this, and its answer is simple: the failure is stored as data and the run continues. This chapter (Lab 1, step 6) shows how to read that data, what happens to a failed host afterwards, how to watch a run while it is going, and how to leave a log for the morning.</p>

<h3>An analogy: the boarding gate</h3>
<p>One passenger is missing. The flight is not cancelled. The gate agent writes the name on a list of missing passengers and the others board. If the agent calls the same flight again, the missing passenger is skipped unless the agent asks specially for the list. Nornir's <code>failed_hosts</code> works like that list.</p>

<h3>What a failed host looks like</h3>
<pre class="code">result = nr.run(task=version)
multi = result["r3"]
<span class="hl">print("r3 failed:", multi.failed, "| results:", [r.name for r in multi])</span>
print("parent exception   :", type(multi[0].exception).__name__)
print("sub-task exception :", type(multi[1].exception).__name__)
<span class="hl">print("failed_hosts:", sorted(result.failed_hosts), "| also in nr.data:", sorted(nr.data.failed_hosts))</span>
try:
<span class="hl">    nr.filter(name="r3").run(task=version, on_failed=True, raise_on_error=True)</span>
<span class="hl">except NornirExecutionError as err:</span>
<span class="hl">    print(type(err).__name__, sorted(err.failed_hosts))</span>
    print(str(err).splitlines()[1:4])</pre>
<pre class="out">AUTO01$ python3 failures.py
r3 failed: True | results: ['version', 'netmiko_send_command']
<span class="hl">parent exception   : NornirSubTaskError</span>
<span class="hl">sub-task exception : NetmikoTimeoutException</span>
failed_hosts: ['r3'] | also in nr.data: ['r3']
NornirExecutionError ['r3']
['########################################', '# r3 (failed)', '########################################']</pre>
<p>The task <code>version</code> called a sub-task, and the sub-task timed out. Look at the two exceptions. The parent result holds <code>NornirSubTaskError</code>, a wrapper that only says "a sub-task failed". The <b>real cause</b>, <code>NetmikoTimeoutException</code>, is on the sub-task result. Anyone who prints only the first exception sees a useless message. Lab 2 uses a small <code>cause()</code> helper that walks the results and returns the first exception that is not the wrapper.</p>
<p><code>result.failed_hosts</code> and <code>nr.data.failed_hosts</code> list the same hosts: Nornir remembers failures on the Nornir object, not only in the result. With <code>raise_on_error=True</code>, <code>run()</code> raises <code>NornirExecutionError</code> after the run, and <code>err.failed_hosts</code> gives the names. That is useful for a script that must stop on the first problem. Normally you leave it off and decide yourself.</p>

<h3>What happens to the failed host next</h3>
<pre class="out">AUTO01$ python3 retry.py
run 1: ['e1', 'j1', 'n1', 'r1', 'r3'] | failed: ['r3']
<span class="hl">run 2: ['e1', 'j1', 'n1', 'r1'] (r3 is skipped)</span>
<span class="hl">run 3: ['r3'] (only the failed host)</span>
<span class="hl">run 4: ['e1', 'j1', 'n1', 'r1', 'r3'] (after reset_failed_hosts)</span></pre>
<p>The second <code>nr.run()</code> on the same object <b>skips</b> <code>r3</code>. This protects you: a half-changed host does not get the next step. Two arguments change this. <code>on_failed=True</code> runs on the failed hosts too (with <code>on_good=False</code>, only on them, which is how you retry). <code>nr.data.reset_failed_hosts()</code> forgets all failures. A script that runs several steps must decide which behaviour it wants. A fresh <code>InitNornir()</code> always starts clean.</p>

<h3>Watching the run: processors</h3>
<p>A <b>processor</b> is an object with six methods that Nornir calls at fixed moments. You need no base class, only the methods. Two of them report the progress.</p>
<pre class="code">class Progress:
    def task_started(self, task):
        print("task %s started" % task.name)

<span class="hl">    def task_completed(self, task, result):</span>
        print("task %s done, failed: %s" % (task.name, sorted(result.failed_hosts)))

    def task_instance_started(self, task, host):
        pass

<span class="hl">    def task_instance_completed(self, task, host, result):</span>
        print("  %-3s %s" % (host.name, "FAILED" if result.failed else "ok"))

    def subtask_instance_started(self, task, host):
        pass

<span class="hl">    def subtask_instance_completed(self, task, host, result):</span>
        pass</pre>
<pre class="out">AUTO01$ python3 progress.py
task version started
  r1  ok
  j1  ok
  e1  ok
  n1  ok
<span class="hl">  r3  FAILED</span>
task version done, failed: ['r3']</pre>
<p>Attach it with <code>nr.with_processors([Progress()])</code>. This returns a new Nornir object with the processor. It prints a line as each host finishes: useful for a run that takes minutes, or for sending results to a log or a chat channel while the run is still going.</p>

<h3>A log for the morning</h3>
<p>Lab 1 step 6 turns on Nornir's own logging. First switch it on in <code>config.yaml</code>, then add three keys under <code>logging:</code>.</p>
<pre class="code">  level: DEBUG
  file: nrbackup.log
  to_console: false</pre>
<pre class="out">AUTO01$ sed -i 's/enabled: false/enabled: true/' config.yaml
AUTO01$ python3 nrbackup.py
...
AUTO01$ grep ERROR nrbackup.log | cut -c1-150
2026-09-29 09:01:22,327 - nornir.core.task -    ERROR -      start() - Host 'r3': task 'netmiko_send_command' failed with tr
2026-09-29 09:01:22,327 - nornir.core.task -    ERROR -      start() - Host 'r3': task 'backup' failed with traceback:</pre>
<p>The script prints exactly what it printed before, and the file holds the details: which host, which task, and the traceback. The level matters: Nornir writes "Running task" at <code>DEBUG</code>, so at <code>INFO</code> you see far fewer lines. Use <code>grep ERROR</code> to find failures quickly. Combine this with the exit code from chapter 5 and the morning routine is short: cron mails when the exit code is not 0, you open the log, and the host with its reason is on one line.</p>

<div class="warn"><p><b>Common mistake.</b> Running a second step on the same Nornir object and wondering why a host is missing from the results. It is in the failed list from the first step. Check <code>nr.data.failed_hosts</code> before the second step, or decide on purpose to call <code>reset_failed_hosts()</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> A failed task does not stop the run, but a later <code>run()</code> skips the failed host by default. Both facts are on the exam; the switches are <code>on_failed</code> and <code>reset_failed_hosts()</code>.</p></div>

<div class="scn"><h4>The router that skipped the second half</h4><p>A change script ran two steps: push the configuration, then verify it. One router failed step 1 with a timeout. Step 2 reported "verified on all hosts" because that router was no longer in the run. The report looked perfect. Adding a check of <code>failed_hosts</code> between the steps, and a final summary of all failures, fixed the report.</p><p><b>Lesson:</b> a skipped host is not a verified host.</p></div>

<div class="iv"><p class="q">"What happens when one host fails during a Nornir run?"</p><p>The failure is stored in that host's <code>MultiResult</code> and in <code>failed_hosts</code>; the other hosts continue. The real exception is on the sub-task, because the parent holds a <code>NornirSubTaskError</code> wrapper. Later runs on the same object skip the failed host unless I use <code>on_failed=True</code> or reset the failures.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A failed host is data: <code>multi.failed</code>, <code>result.failed_hosts</code>, <code>nr.data.failed_hosts</code>.</li>
<li>Read the sub-task exception for the real cause; the parent holds a wrapper.</li>
<li>Next runs skip failed hosts; <code>on_failed=True</code> and <code>reset_failed_hosts()</code> change that.</li>
<li><code>raise_on_error=True</code> turns failures into <code>NornirExecutionError</code>.</li>
<li>Processors watch a run live; the log file keeps the details, at <code>DEBUG</code> level.</li>
</ul></div>
`,hi:`
<p>Fleet mein hamesha koi dead device, badla hua password ya key mein typo hota hai. Nornir yeh expect karta hai, aur uska jawab seedha hai: failure data ki tarah store hota hai aur run chalti rehti hai. Yeh chapter (Lab 1, step 6) dikhata hai ki woh data kaise padhte hain, failed host ke saath baad mein kya hota hai, run chalte waqt use kaise dekhte hain, aur subah ke liye log kaise chhodte hain.</p>

<h3>Ek analogy: boarding gate</h3>
<p>Ek passenger missing hai. Flight cancel nahi hoti. Gate agent naam missing passengers ki list mein likhta hai aur baaki board karte hain. Agent wahi flight dobara bulaye to missing passenger skip ho jaata hai, jab tak agent list ke liye khaas na kahe. Nornir ka <code>failed_hosts</code> us list jaisa kaam karta hai.</p>

<h3>Failed host kaisa dikhta hai</h3>
<pre class="code">result = nr.run(task=version)
multi = result["r3"]
<span class="hl">print("r3 failed:", multi.failed, "| results:", [r.name for r in multi])</span>
print("parent exception   :", type(multi[0].exception).__name__)
print("sub-task exception :", type(multi[1].exception).__name__)
<span class="hl">print("failed_hosts:", sorted(result.failed_hosts), "| also in nr.data:", sorted(nr.data.failed_hosts))</span>
try:
<span class="hl">    nr.filter(name="r3").run(task=version, on_failed=True, raise_on_error=True)</span>
<span class="hl">except NornirExecutionError as err:</span>
<span class="hl">    print(type(err).__name__, sorted(err.failed_hosts))</span>
    print(str(err).splitlines()[1:4])</pre>
<pre class="out">AUTO01$ python3 failures.py
r3 failed: True | results: ['version', 'netmiko_send_command']
<span class="hl">parent exception   : NornirSubTaskError</span>
<span class="hl">sub-task exception : NetmikoTimeoutException</span>
failed_hosts: ['r3'] | also in nr.data: ['r3']
NornirExecutionError ['r3']
['########################################', '# r3 (failed)', '########################################']</pre>
<p>Task <code>version</code> ne sub-task bulaya, aur sub-task timeout hua. Dono exceptions dekho. Parent result mein <code>NornirSubTaskError</code> hai, ek wrapper jo sirf kehta hai "sub-task fail hua". <b>Asli wajah</b>, <code>NetmikoTimeoutException</code>, sub-task result par hai. Jo sirf pehla exception print kare use bekaar message dikhta hai. Lab 2 chhota <code>cause()</code> helper use karta hai jo results par chalta hai aur pehla woh exception lautata hai jo wrapper nahi hai.</p>
<p><code>result.failed_hosts</code> aur <code>nr.data.failed_hosts</code> wahi hosts list karte hain: Nornir failures ko sirf result mein nahi, Nornir object par bhi yaad rakhta hai. <code>raise_on_error=True</code> ke saath <code>run()</code> run ke baad <code>NornirExecutionError</code> uthata hai, aur <code>err.failed_hosts</code> naam deta hai. Jis script ko pehli problem par ruk jaana hai uske liye yeh kaam ka hai. Aam taur par ise off rakhte hain aur khud tay karte hain.</p>

<h3>Failed host ke saath aage kya hota hai</h3>
<pre class="out">AUTO01$ python3 retry.py
run 1: ['e1', 'j1', 'n1', 'r1', 'r3'] | failed: ['r3']
<span class="hl">run 2: ['e1', 'j1', 'n1', 'r1'] (r3 is skipped)</span>
<span class="hl">run 3: ['r3'] (only the failed host)</span>
<span class="hl">run 4: ['e1', 'j1', 'n1', 'r1', 'r3'] (after reset_failed_hosts)</span></pre>
<p>Usi object par doosri <code>nr.run()</code> <code>r3</code> ko <b>skip</b> karti hai. Yeh aapko bachata hai: aadha badla hua host agla step nahi paata. Do arguments isse badalte hain. <code>on_failed=True</code> failed hosts par bhi chalata hai (<code>on_good=False</code> ke saath sirf unhi par, yahi retry hai). <code>nr.data.reset_failed_hosts()</code> saari failures bhula deta hai. Kai steps wali script ko tay karna hota hai ki kaunsa behaviour chahiye. Naya <code>InitNornir()</code> hamesha saaf shuru hota hai.</p>

<h3>Run ko dekhna: processors</h3>
<p><b>Processor</b> chhe methods wala object hai jinhe Nornir tay moments par bulata hai. Base class nahi chahiye, sirf methods. Unme se do progress report karte hain.</p>
<pre class="code">class Progress:
    def task_started(self, task):
        print("task %s started" % task.name)

<span class="hl">    def task_completed(self, task, result):</span>
        print("task %s done, failed: %s" % (task.name, sorted(result.failed_hosts)))

    def task_instance_started(self, task, host):
        pass

<span class="hl">    def task_instance_completed(self, task, host, result):</span>
        print("  %-3s %s" % (host.name, "FAILED" if result.failed else "ok"))

    def subtask_instance_started(self, task, host):
        pass

<span class="hl">    def subtask_instance_completed(self, task, host, result):</span>
        pass</pre>
<pre class="out">AUTO01$ python3 progress.py
task version started
  r1  ok
  j1  ok
  e1  ok
  n1  ok
<span class="hl">  r3  FAILED</span>
task version done, failed: ['r3']</pre>
<p><code>nr.with_processors([Progress()])</code> se jodo. Yeh processor ke saath naya Nornir object deta hai. Har host khatam hote hi ek line print hoti hai: jo run minutes leti hai uske liye, ya run chalte-chalte results log ya chat channel mein bhejne ke liye kaam ka.</p>

<h3>Subah ke liye log</h3>
<p>Lab 1 step 6 Nornir ki apni logging on karta hai. Pehle <code>config.yaml</code> mein on karo, phir <code>logging:</code> ke neeche teen keys jodo.</p>
<pre class="code">  level: DEBUG
  file: nrbackup.log
  to_console: false</pre>
<pre class="out">AUTO01$ sed -i 's/enabled: false/enabled: true/' config.yaml
AUTO01$ python3 nrbackup.py
...
AUTO01$ grep ERROR nrbackup.log | cut -c1-150
2026-09-29 09:01:22,327 - nornir.core.task -    ERROR -      start() - Host 'r3': task 'netmiko_send_command' failed with tr
2026-09-29 09:01:22,327 - nornir.core.task -    ERROR -      start() - Host 'r3': task 'backup' failed with traceback:</pre>
<p>Script wahi print karti hai jo pehle karti thi, aur file mein tafseel hai: kaunsa host, kaunsa task, aur traceback. Level matter karta hai: Nornir "Running task" <code>DEBUG</code> par likhta hai, isliye <code>INFO</code> par bahut kam lines dikhti hain. Failures jaldi dhoondhne ke liye <code>grep ERROR</code> use karo. Chapter 5 ke exit code ke saath milao to subah ka routine chhota hai: exit code 0 na ho to cron mail karta hai, aap log kholte ho, aur host apni wajah ke saath ek line mein milta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Usi Nornir object par doosra step chalana aur sochna ki results mein host kyon gayab hai. Woh pehle step ki failed list mein hai. Doosre step se pehle <code>nr.data.failed_hosts</code> check karo, ya soch-samajh kar <code>reset_failed_hosts()</code> bulao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Failed task run ko nahi rokta, par baad ki <code>run()</code> default se failed host ko skip karti hai. Dono baatein exam mein aati hain; switches hain <code>on_failed</code> aur <code>reset_failed_hosts()</code>.</p></div>

<div class="scn"><h4>Router jisne doosra half skip kiya</h4><p>Ek change script ke do steps the: configuration push karo, phir verify karo. Ek router step 1 mein timeout se fail hua. Step 2 ne "sab hosts par verified" report kiya kyunki woh router ab run mein tha hi nahi. Report perfect dikhi. Steps ke beech <code>failed_hosts</code> check aur ant mein saari failures ki summary jodne se report theek hui.</p><p><b>Lesson:</b> skip hua host verified host nahi hota.</p></div>

<div class="iv"><p class="q">"Nornir run mein ek host fail ho jaye to kya hota hai?"</p><p>Failure us host ke <code>MultiResult</code> aur <code>failed_hosts</code> mein store hota hai; baaki hosts chalte rehte hain. Asli exception sub-task par hota hai, kyunki parent mein <code>NornirSubTaskError</code> wrapper hota hai. Usi object par agli runs failed host ko skip karti hain, jab tak main <code>on_failed=True</code> na use karun ya failures reset na karun.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failed host data hai: <code>multi.failed</code>, <code>result.failed_hosts</code>, <code>nr.data.failed_hosts</code>.</li>
<li>Asli wajah ke liye sub-task ka exception padho; parent mein wrapper hota hai.</li>
<li>Agli runs failed hosts skip karti hain; <code>on_failed=True</code> aur <code>reset_failed_hosts()</code> isse badalte hain.</li>
<li><code>raise_on_error=True</code> failures ko <code>NornirExecutionError</code> bana deta hai.</li>
<li>Processors run ko live dekhte hain; log file tafseel rakhti hai, <code>DEBUG</code> level par.</li>
</ul></div>
`}};export{e as default};