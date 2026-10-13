var e={id:`commit-jobs`,h:{en:`Commit is a job: start it, poll it, read the verdict`,hi:`Commit ek job hai: shuru karo, poll karo, verdict padho`},body:{en:`
<p>Everything you have set so far sits in the candidate. Nothing protects traffic differently until a <b>commit</b>. On PAN-OS a commit is not an instant reply: the firewall validates the candidate, builds the new running configuration and installs it, which can take seconds or minutes. So the API gives you a <b>job</b> and you wait for it.</p>

<div class="dia"><svg viewBox="0 0 640 158" role="img" aria-label="diagram">
<rect x="8" y="30" width="100" height="56" rx="10" fill="#fed7aa"/><text x="58" y="55" text-anchor="middle" class="svg-ink" font-size="12">set / edit / delete</text><text x="58" y="72" text-anchor="middle" class="svg-muted" font-size="11">candidate only</text>
<rect x="138" y="30" width="100" height="56" rx="10" fill="#bae6fd"/><text x="188" y="55" text-anchor="middle" class="svg-ink" font-size="12">type=commit</text><text x="188" y="72" text-anchor="middle" class="svg-muted" font-size="11">returns job id</text>
<rect x="268" y="30" width="110" height="56" rx="10" fill="#fde68a"/><text x="323" y="55" text-anchor="middle" class="svg-ink" font-size="13">ACT  PEND</text><text x="323" y="72" text-anchor="middle" class="svg-muted" font-size="11">poll every 2 s</text>
<rect x="408" y="8" width="100" height="40" rx="10" fill="#bbf7d0"/><text x="458" y="33" text-anchor="middle" class="svg-ink" font-size="13">FIN  OK</text>
<rect x="408" y="68" width="100" height="40" rx="10" fill="#fecaca"/><text x="458" y="93" text-anchor="middle" class="svg-ink" font-size="13">FIN  FAIL</text>
<rect x="532" y="8" width="100" height="40" rx="10" fill="#bbf7d0"/><text x="582" y="33" text-anchor="middle" class="svg-ink" font-size="12">running updated</text>
<rect x="532" y="68" width="100" height="40" rx="10" fill="#e2e8f0"/><text x="582" y="93" text-anchor="middle" class="svg-ink" font-size="12">read details</text>
<line x1="108" y1="58" x2="138" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="238" y1="58" x2="268" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="378" y1="50" x2="408" y2="28" stroke="#64748b" stroke-width="2"/>
<line x1="378" y1="66" x2="408" y2="88" stroke="#64748b" stroke-width="2"/>
<line x1="508" y1="28" x2="532" y2="28" stroke="#64748b" stroke-width="2"/>
<line x1="508" y1="88" x2="532" y2="88" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">No change in candidate: code 13 "There are no changes to commit", and no job.</text>
</svg><p class="cap">A commit is asynchronous: you get a job id, poll it until FIN, then look at OK or FAIL.</p></div>

<h3>What a commit request returns</h3>
<p>Send <code>type=commit</code> and <code>cmd=&lt;commit&gt;&lt;/commit&gt;</code>. The reply is only a receipt. Look at the raw replies of two commits sent six seconds apart (<code>commitraw.py</code>):</p>
<pre class="out">AUTO01$ python3 commitraw.py
&lt;response status="success" code="19"&gt;&lt;result&gt;&lt;msg&gt;&lt;line&gt;Commit job enqueued with jobid 3&lt;/line&gt;&lt;/msg&gt;&lt;job&gt;3&lt;/job&gt;&lt;/result&gt;&lt;/response&gt;
<span class="hl">&lt;response status="success" code="13"&gt;&lt;msg&gt;There are no changes to commit.&lt;/msg&gt;&lt;/response&gt;</span></pre>
<p>The first reply is code <b>19</b>: job 3 is queued. Do not read it as "committed". The second reply is code <b>13</b>: there was nothing left to commit, so there is no job at all. Code 13 is a normal answer, not a failure, and a script that expects a job number must handle it.</p>

<h3>Polling the job</h3>
<p>To follow a job, send an <code>op</code> command: <code>&lt;show&gt;&lt;jobs&gt;&lt;id&gt;3&lt;/id&gt;&lt;/jobs&gt;&lt;/show&gt;</code>. The reply has <code>status</code> (ACT while working, FIN when finished), <code>progress</code> and <code>result</code>. This is the function the labs keep in <code>xapi.py</code>:</p>
<pre class="code">def commit(poll=2, tries=10):
    """Start a commit and wait for its job. Returns the finished &lt;job&gt;, or None when there is nothing to commit."""
    reply = call(type="commit", cmd="&lt;commit&gt;&lt;/commit&gt;")
    job = reply.findtext("./result/job")
    if job is None:                                   # code 13: There are no changes to commit.
        print("nothing to commit (code %s)" % reply.get("code"))
        return None
    for _ in range(tries):
        info = call(type="op", cmd="&lt;show&gt;&lt;jobs&gt;&lt;id&gt;%s&lt;/id&gt;&lt;/jobs&gt;&lt;/show&gt;" % job).find("./result/job")
        print("job %s: %s %s %s%%" % (job, info.findtext("status"), info.findtext("result"), info.findtext("progress")))
        if info.findtext("status") == "FIN":
            return info
        time.sleep(poll)
    raise TimeoutError("job %s did not finish" % job)</pre>
<p>Read it in three parts. If there is no job, return <code>None</code>. Otherwise poll until <code>status</code> is FIN, sleeping between calls. If it never finishes, raise an error instead of waiting forever. A <b>bounded</b> loop is the rule for every wait in automation.</p>

<h3>The verdict: OK or FAIL</h3>
<p><code>status=FIN</code> only says the job is over. The <code>result</code> field says how it ended, and the <code>details</code> lines say why. This is Lab 1 task 3:</p>
<pre class="out">AUTO01$ python3 commitjob.py
job 3: ACT PEND 0%
job 3: FIN OK 100%
<span class="hl">result: OK - Configuration committed successfully</span>
running: ['web-srv']
nothing to commit (code 13)</pre>
<p>Job 3 went ACT, then FIN with result OK, and the running configuration now holds <code>web-srv</code> (compare chapter 4, where <code>show</code> returned an empty list). Run the commit again and the script prints code 13. A failed job looks different:</p>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
create rule web-in             ok
delete rule web-old            ok
delete address old-web         ok
job 5: ACT PEND 0%
<span class="hl">job 5: FIN FAIL 100%</span>
commit job 5 ended FAIL:
   rulebase -&gt; security -&gt; rules -&gt; web-in service is missing</pre>
<p>Here the job finished with <b>FAIL</b> and the details name the cause: the rule <code>web-in</code> has no service. The earlier <code>set</code> was accepted because a single object is checked lightly; the commit checks the whole configuration together. The fix is to correct the candidate and commit again, the failed job leaves running untouched.</p>

<div class="warn"><p><b>Common mistakes.</b> Treating the commit reply as the result and never polling. Printing only <code>result</code> and not the <code>details</code> lines. A polling loop without a limit. Treating code 13 as an error. Committing from a script that has half-finished changes in the candidate.</p></div>
<div class="exam"><p><b>Exam trap.</b> A commit has two layers of "success": the H&#84;TP request returned code 19 (job accepted), and the job finished with result OK. Only the second means traffic is using the new configuration.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab job finishes in a few seconds. Real commits can take minutes on a large firewall, and a commit lock, or another admin's pending changes, can block or change what you publish. The exact text of the details lines will differ.</p></div>

<div class="scn"><h4>The commit nobody checked</h4><p>A nightly script created 40 rules and printed "commit sent". One rule referenced an address group that did not exist yet, the job ended FIN FAIL, and nothing was published. The change request was marked done, and the new site stayed blocked until the morning shift read the System log.</p><p><b>Lesson:</b> a script is finished when it has read the job result, not when it has sent the request.</p></div>

<div class="iv"><p class="q">"You sent a commit through the API and got H&#84;TP 200. Is the change live?"</p><p>Not yet known. H&#84;TP 200 and code 19 only mean a job was queued. I poll the job with <code>show jobs</code> until status is FIN, then check that result is OK and print the details if it is FAIL. If the reply is code 13, there was nothing to commit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A commit is an asynchronous job: code 19 with a job id means queued, not done.</li>
<li>Poll <code>show jobs id</code> until <code>status</code> is FIN, with a limit on the number of tries.</li>
<li>Then read <code>result</code> (OK or FAIL) and the <code>details</code> lines.</li>
<li>Code 13 means no changes and no job; it is not an error.</li>
<li>A failed commit leaves the running configuration as it was; fix the candidate and commit again.</li>
</ul></div>
`,hi:`
<p>Ab tak jo kuch set kiya woh candidate mein hai. <b>Commit</b> hone tak traffic par koi asar nahi. PAN-OS mein commit turant jawab nahi deta: firewall candidate validate karta hai, nayi running configuration banata hai aur install karta hai, jismein seconds ya minutes lag sakte hain. Isliye API aapko ek <b>job</b> deti hai aur aap uska intezaar karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 158" role="img" aria-label="diagram">
<rect x="8" y="30" width="100" height="56" rx="10" fill="#fed7aa"/><text x="58" y="55" text-anchor="middle" class="svg-ink" font-size="12">set / edit / delete</text><text x="58" y="72" text-anchor="middle" class="svg-muted" font-size="11">sirf candidate</text>
<rect x="138" y="30" width="100" height="56" rx="10" fill="#bae6fd"/><text x="188" y="55" text-anchor="middle" class="svg-ink" font-size="12">type=commit</text><text x="188" y="72" text-anchor="middle" class="svg-muted" font-size="11">job id lautata hai</text>
<rect x="268" y="30" width="110" height="56" rx="10" fill="#fde68a"/><text x="323" y="55" text-anchor="middle" class="svg-ink" font-size="13">ACT  PEND</text><text x="323" y="72" text-anchor="middle" class="svg-muted" font-size="11">har 2 s poll</text>
<rect x="408" y="8" width="100" height="40" rx="10" fill="#bbf7d0"/><text x="458" y="33" text-anchor="middle" class="svg-ink" font-size="13">FIN  OK</text>
<rect x="408" y="68" width="100" height="40" rx="10" fill="#fecaca"/><text x="458" y="93" text-anchor="middle" class="svg-ink" font-size="13">FIN  FAIL</text>
<rect x="532" y="8" width="100" height="40" rx="10" fill="#bbf7d0"/><text x="582" y="33" text-anchor="middle" class="svg-ink" font-size="12">running update</text>
<rect x="532" y="68" width="100" height="40" rx="10" fill="#e2e8f0"/><text x="582" y="93" text-anchor="middle" class="svg-ink" font-size="12">details padho</text>
<line x1="108" y1="58" x2="138" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="238" y1="58" x2="268" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="378" y1="50" x2="408" y2="28" stroke="#64748b" stroke-width="2"/>
<line x1="378" y1="66" x2="408" y2="88" stroke="#64748b" stroke-width="2"/>
<line x1="508" y1="28" x2="532" y2="28" stroke="#64748b" stroke-width="2"/>
<line x1="508" y1="88" x2="532" y2="88" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Candidate mein badlaav nahi: code 13 "There are no changes to commit", aur koi job nahi.</text>
</svg><p class="cap">Commit asynchronous hota hai: job id milta hai, FIN tak poll karo, phir OK ya FAIL dekho.</p></div>

<h3>Commit request kya lautati hai</h3>
<p><code>type=commit</code> aur <code>cmd=&lt;commit&gt;&lt;/commit&gt;</code> bhejo. Reply sirf ek raseed hai. Chhe second ke gap par bheje do commits ke raw replies dekho (<code>commitraw.py</code>):</p>
<pre class="out">AUTO01$ python3 commitraw.py
&lt;response status="success" code="19"&gt;&lt;result&gt;&lt;msg&gt;&lt;line&gt;Commit job enqueued with jobid 3&lt;/line&gt;&lt;/msg&gt;&lt;job&gt;3&lt;/job&gt;&lt;/result&gt;&lt;/response&gt;
<span class="hl">&lt;response status="success" code="13"&gt;&lt;msg&gt;There are no changes to commit.&lt;/msg&gt;&lt;/response&gt;</span></pre>
<p>Pehla reply code <b>19</b> hai: job 3 queue mein hai. Ise "commit ho gaya" mat samjho. Doosra reply code <b>13</b> hai: commit karne ko kuch bacha hi nahi, isliye koi job nahi hai. Code 13 normal jawab hai, failure nahi, aur job number expect karne wali script ko ise sambhalna hoga.</p>

<h3>Job ko poll karna</h3>
<p>Job ko follow karne ke liye <code>op</code> command bhejo: <code>&lt;show&gt;&lt;jobs&gt;&lt;id&gt;3&lt;/id&gt;&lt;/jobs&gt;&lt;/show&gt;</code>. Reply mein <code>status</code> (ACT jab kaam chal raha ho, FIN jab khatam), <code>progress</code> aur <code>result</code> hote hain. Labs ki <code>xapi.py</code> mein yahi function hai:</p>
<pre class="code">def commit(poll=2, tries=10):
    """Start a commit and wait for its job. Returns the finished &lt;job&gt;, or None when there is nothing to commit."""
    reply = call(type="commit", cmd="&lt;commit&gt;&lt;/commit&gt;")
    job = reply.findtext("./result/job")
    if job is None:                                   # code 13: There are no changes to commit.
        print("nothing to commit (code %s)" % reply.get("code"))
        return None
    for _ in range(tries):
        info = call(type="op", cmd="&lt;show&gt;&lt;jobs&gt;&lt;id&gt;%s&lt;/id&gt;&lt;/jobs&gt;&lt;/show&gt;" % job).find("./result/job")
        print("job %s: %s %s %s%%" % (job, info.findtext("status"), info.findtext("result"), info.findtext("progress")))
        if info.findtext("status") == "FIN":
            return info
        time.sleep(poll)
    raise TimeoutError("job %s did not finish" % job)</pre>
<p>Ise teen hisson mein padho. Job nahi hai to <code>None</code> lauta do. Warna <code>status</code> FIN hone tak poll karo, beech mein sleep ke saath. Kabhi khatam na ho to hamesha ke intezaar ki jagah error uthao. Automation ke har wait ke liye <b>bounded</b> loop niyam hai.</p>

<h3>Verdict: OK ya FAIL</h3>
<p><code>status=FIN</code> sirf yeh batata hai ki job khatam hui. <code>result</code> batata hai kaise khatam hui, aur <code>details</code> lines batati hain kyun. Yeh Lab 1 ka task 3 hai:</p>
<pre class="out">AUTO01$ python3 commitjob.py
job 3: ACT PEND 0%
job 3: FIN OK 100%
<span class="hl">result: OK - Configuration committed successfully</span>
running: ['web-srv']
nothing to commit (code 13)</pre>
<p>Job 3 ACT se FIN hui, result OK, aur running configuration mein ab <code>web-srv</code> hai (chapter 4 se compare karo, jahan <code>show</code> ne khaali list di thi). Commit dobara chalao to script code 13 print karti hai. Failed job alag dikhti hai:</p>
<pre class="out">AUTO01$ python3 chg3107.py
create address web-new         ok
create rule web-in             ok
delete rule web-old            ok
delete address old-web         ok
job 5: ACT PEND 0%
<span class="hl">job 5: FIN FAIL 100%</span>
commit job 5 ended FAIL:
   rulebase -&gt; security -&gt; rules -&gt; web-in service is missing</pre>
<p>Yahan job <b>FAIL</b> ke saath khatam hui aur details wajah batati hain: rule <code>web-in</code> mein service nahi hai. Pichla <code>set</code> accept hua kyunki ek object ki halki jaanch hoti hai; commit poori configuration ek saath check karta hai. Fix hai candidate theek karo aur dobara commit karo; failed job running ko chhuti nahi.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Commit reply ko hi result maan lena aur poll na karna. Sirf <code>result</code> print karna, <code>details</code> lines nahi. Bina limit ka polling loop. Code 13 ko error samajhna. Aisi script se commit karna jiske aadhe-adhoore changes candidate mein pade hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Commit mein "success" ki do parten hain: H&#84;TP request ne code 19 diya (job accept hui), aur job result OK ke saath khatam hui. Sirf doosra batata hai ki traffic nayi configuration use kar raha hai.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab mein job kuch seconds mein khatam hoti hai. Asli bade firewall par commit minutes le sakta hai, aur commit lock ya kisi aur admin ke pending changes aapke publish ko rok ya badal sakte hain. Details lines ke exact shabd alag honge.</p></div>

<div class="scn"><h4>Jis commit ko kisi ne check nahi kiya</h4><p>Raat ki ek script ne 40 rules banaye aur "commit sent" print kiya. Ek rule ek aise address group ko refer karta tha jo abhi bana hi nahi tha, job FIN FAIL hui, aur kuch publish nahi hua. Change request done mark ho gayi, aur naya site subah ki shift ke System log padhne tak blocked raha.</p><p><b>Lesson:</b> script tab poori hoti hai jab woh job ka result padh le, request bhejne par nahi.</p></div>

<div class="iv"><p class="q">"Aapne API se commit bheja aur H&#84;TP 200 mila. Kya change live hai?"</p><p>Abhi pata nahi. H&#84;TP 200 aur code 19 ka matlab sirf job queue hui. Main <code>show jobs</code> se job tab tak poll karta hoon jab tak status FIN na ho, phir dekhta hoon result OK hai, aur FAIL ho to details print karta hoon. Reply code 13 ho to commit karne ko kuch tha hi nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commit ek asynchronous job hai: job id ke saath code 19 ka matlab queued, done nahi.</li>
<li><code>show jobs id</code> ko tab tak poll karo jab tak <code>status</code> FIN na ho, tries par limit ke saath.</li>
<li>Phir <code>result</code> (OK ya FAIL) aur <code>details</code> lines padho.</li>
<li>Code 13 ka matlab koi badlaav nahi aur koi job nahi; yeh error nahi hai.</li>
<li>Failed commit running configuration ko jaisa tha waisa chhodta hai; candidate theek karo aur dobara commit karo.</li>
</ul></div>
`}};export{e as default};