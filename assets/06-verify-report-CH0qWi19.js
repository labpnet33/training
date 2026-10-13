var e={id:`verify-report`,h:{en:`After the change: verify, drift, tests and the report`,hi:`Change ke baad: verify, drift, tests aur report`},body:{en:`
<p>"Committed and verified" at the end of an apply is a statement about <i>that moment</i>. Devices drift: somebody types a command on a console, a colleague applies an old template, a Junos timer runs out. A toolkit that only knows how to push cannot say anything about tomorrow. The last stage of the chain is therefore not part of the change at all: it is a <b>read-only verify</b> that you can run at any time, from cron, from a pipeline or by hand.</p>

<h3>Verify is an independent oracle</h3>
<p>The apply path checks its own work once. The verify path asks the same question later and with no ability to change anything: for each device, do the facts that NAPALM reads from it match the intent that NetBox produced?</p>
<pre class="code">def check(task, intents):
    device = task.host.get_connection("napalm", task.nornir.config)
<span class="hl">    problems = problems_in(intents[task.host.name], state_of(device))</span>
    return Result(host=task.host, result=problems or "matches NetBox", failed=bool(problems))</pre>
<p>It reuses <code>problems_in()</code>, the same function that decides about a rollback. One definition of "correct" serves both stages, so the two can never disagree. It compares against the <b>intent</b>, not against the rendered file: if a template had a bug, comparing with the file would call the broken result correct.</p>
<pre class="out">AUTO01$ python3 mvtool.py verify; echo "exit code: $?"
NGP-BR-J1    matches NetBox
NGP-BR-R1    DRIFT: ntp server 10.99.0.61 is missing
1 ok, 1 drifted
exit code: 1</pre>
<p>That was caused by one command on the R1 console, <code>no ntp server 10.99.0.61</code>. The exit code is 1, so cron mails it or CI turns red. The repair is the toolkit itself: <code>plan</code> shows exactly the one missing line, and <code>apply</code> puts it back.</p>
<pre class="out">AUTO01$ python3 mvtool.py plan
NGP-BR-J1    already compliant
NGP-BR-R1    would change
    +ntp server 10.99.0.61
2 ok, 0 failed
AUTO01$ python3 mvtool.py apply
GATE PASSED
NGP-BR-J1    already compliant
NGP-BR-R1    committed and verified
    +ntp server 10.99.0.61
2 ok, 0 failed</pre>
<p>Plan, apply and verify answer three different questions. <b>Plan</b>: what would change from the candidate files? <b>Apply</b>: change it, and check once. <b>Verify</b>: does the device still match the intent? Note that J1 said <i>already compliant</i> and R1 did not, which tells you where the drift was without opening a device.</p>

<h3>The report is a file, not a screen</h3>
<pre class="out">AUTO01$ cat reports/verify.json
{
  "time": "2026-09-29 09:00:50",
  "devices": {
    "NGP-BR-J1": {"ok": true, "problems": []},
    "NGP-BR-R1": {"ok": true, "problems": []}
  }
}</pre>
<p>(The real file spreads each device over several lines.) The report holds the time, a verdict per device and the list of problems. It is what an auditor, a dashboard or tomorrow's run can read. In the Program 1 capstone you built a table report; the same idea applies here, but now the status comes from a recorded run and not from a guess.</p>

<h3>Tests: what is worth testing</h3>
<p>A lab is slow and a router is not always there. The part of the toolkit that decides things lives in <code>safety.py</code> and needs no device, so it gets the unit tests. There are seven, and a <code>FakeDevice</code> that only records what it was asked to do.</p>
<pre class="code">class FakeDevice:
    """Records what the toolkit asks of a device."""
    def __init__(self):
        self.calls = []
    def rollback(self):
        self.calls.append("rollback")
    def confirm_commit(self):
        self.calls.append("confirm_commit")

def test_a_bad_read_back_rolls_the_change_back():
    device = FakeDevice()
    assert settle(device, ["ntp server 10.99.0.61 is missing"], junos=True) == "rolled back"
    assert device.calls == ["rollback"]

<span class="hl">def test_a_good_read_back_confirms_a_junos_commit():
    device = FakeDevice()
    assert settle(device, [], junos=True) == "kept"
    assert device.calls == ["confirm_commit"]</span></pre>
<pre class="out">AUTO01$ python3 -m pytest -q
.......                                                                  [100%]
7 passed in 0.08s</pre>
<p>The tests cover the cases that hurt: a missing server, a wrong prefix length, Junos interfaces read as <code>unit 0</code>, a bad read-back that rolls back, a good one that confirms on Junos and does nothing on IOS. They do not test Nornir, NAPALM or NetBox: those are other people's code and the lab runs are the proof. Test your decisions, not your libraries.</p>

<div class="warn"><p><b>Exam trap.</b> Verify must never use a different definition of "correct" than apply. Two definitions drift apart over months, and then apply says success while verify says drift, and nobody trusts either.</p></div>

<div class="scn"><h4>Green for a month, wrong for a month</h4><p>A team checked changes only at the moment of apply. A colleague with a console session removed a syslog server from two branch routers and told nobody. A month later the SIEM team asked why those branches had no logs. A nightly verify with an exit code, which costs a few minutes of run time, would have turned the pipeline red on the first night.</p><p><b>Lesson:</b> a change is true only until the next person touches the device. The only way to know is to read the device again.</p></div>

<div class="iv"><p class="q">"What is the difference between a dry run, a verify and a test?"</p><p>A dry run asks the device what a candidate would change, without committing. A verify reads the device later, read-only, and compares it with the intent. A test checks my own decision logic with a fake device and no network. They guard different moments: before the change, after it, and every time the code changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify is read-only, repeatable, and uses the same <code>problems_in()</code> as the rollback decision.</li>
<li>Compare with the intent, not with the rendered file.</li>
<li>Exit code 1 on drift makes cron and CI do the alerting for you.</li>
<li>The report is a file with a time, a verdict per device and the problems.</li>
<li>Unit-test your own decisions with a fake device; do not test the libraries.</li>
</ul></div>
`,hi:`
<p>Apply ke ant mein "committed and verified" <i>us pal</i> ke baare mein ek bayaan hai. Devices drift karte hain: koi console par command type karta hai, colleague purana template apply karta hai, Junos ka timer khatam ho jata hai. Jo toolkit sirf push karna jaanti hai woh kal ke baare mein kuch nahi keh sakti. Isliye chain ka aakhri stage change ka hissa hi nahi hai: woh <b>read-only verify</b> hai jo aap kabhi bhi chala sakte ho, cron se, pipeline se ya haath se.</p>

<h3>Verify ek independent oracle hai</h3>
<p>Apply path apna kaam ek baar check karta hai. Verify path wahi sawal baad mein poochta hai aur kuch badalne ki taakat ke bina: har device ke liye, NAPALM jo facts usse padhta hai kya woh NetBox ke banaye intent se match karte hain?</p>
<pre class="code">def check(task, intents):
    device = task.host.get_connection("napalm", task.nornir.config)
<span class="hl">    problems = problems_in(intents[task.host.name], state_of(device))</span>
    return Result(host=task.host, result=problems or "matches NetBox", failed=bool(problems))</pre>
<p>Yeh <code>problems_in()</code> reuse karta hai, wahi function jo rollback ka faisla karta hai. "Sahi" ki ek hi definition dono stages ko deti hai, isliye dono kabhi asahmat nahi ho sakte. Yeh <b>intent</b> se compare karta hai, rendered file se nahi: template mein bug ho to file se compare karna toote result ko sahi kah deta.</p>
<pre class="out">AUTO01$ python3 mvtool.py verify; echo "exit code: $?"
NGP-BR-J1    matches NetBox
NGP-BR-R1    DRIFT: ntp server 10.99.0.61 is missing
1 ok, 1 drifted
exit code: 1</pre>
<p>Yeh R1 console par ek command se hua, <code>no ntp server 10.99.0.61</code>. Exit code 1 hai, isliye cron mail karta hai ya CI laal ho jata hai. Repair toolkit khud hai: <code>plan</code> exactly woh ek missing line dikhata hai, aur <code>apply</code> use wapas laga deta hai.</p>
<pre class="out">AUTO01$ python3 mvtool.py plan
NGP-BR-J1    already compliant
NGP-BR-R1    would change
    +ntp server 10.99.0.61
2 ok, 0 failed
AUTO01$ python3 mvtool.py apply
GATE PASSED
NGP-BR-J1    already compliant
NGP-BR-R1    committed and verified
    +ntp server 10.99.0.61
2 ok, 0 failed</pre>
<p>Plan, apply aur verify teen alag sawalon ka jawab dete hain. <b>Plan</b>: candidate files se kya badlega? <b>Apply</b>: badlo, aur ek baar check karo. <b>Verify</b>: kya device abhi bhi intent se match karta hai? Dhyan do ki J1 ne <i>already compliant</i> kaha aur R1 ne nahi, jisse bina device khole pata chal jata hai drift kahan tha.</p>

<h3>Report file hai, screen nahi</h3>
<pre class="out">AUTO01$ cat reports/verify.json
{
  "time": "2026-09-29 09:00:50",
  "devices": {
    "NGP-BR-J1": {"ok": true, "problems": []},
    "NGP-BR-R1": {"ok": true, "problems": []}
  }
}</pre>
<p>(Asli file har device ko kai lines mein failati hai.) Report mein time, har device ka verdict aur problems ki list hai. Auditor, dashboard ya kal ki run isey padh sakti hai. Program 1 capstone mein aapne table report banayi thi; yahi idea yahan hai, par ab status recorded run se aata hai, andaze se nahi.</p>

<h3>Tests: kya test karna worth hai</h3>
<p>Lab dheema hai aur router hamesha nahi hota. Toolkit ka jo hissa faisle karta hai woh <code>safety.py</code> mein hai aur use device nahi chahiye, isliye unit tests wahi paate hain. Saat tests hain, aur ek <code>FakeDevice</code> jo bas record karta hai ki usse kya manga gaya.</p>
<pre class="code">class FakeDevice:
    """Records what the toolkit asks of a device."""
    def __init__(self):
        self.calls = []
    def rollback(self):
        self.calls.append("rollback")
    def confirm_commit(self):
        self.calls.append("confirm_commit")

def test_a_bad_read_back_rolls_the_change_back():
    device = FakeDevice()
    assert settle(device, ["ntp server 10.99.0.61 is missing"], junos=True) == "rolled back"
    assert device.calls == ["rollback"]

<span class="hl">def test_a_good_read_back_confirms_a_junos_commit():
    device = FakeDevice()
    assert settle(device, [], junos=True) == "kept"
    assert device.calls == ["confirm_commit"]</span></pre>
<pre class="out">AUTO01$ python3 -m pytest -q
.......                                                                  [100%]
7 passed in 0.08s</pre>
<p>Tests un cases ko cover karte hain jo dukhte hain: missing server, galat prefix length, Junos interfaces <code>unit 0</code> ki tarah padhna, kharab read-back jo rollback karta hai, achha read-back jo Junos par confirm karta hai aur IOS par kuch nahi. Woh Nornir, NAPALM ya NetBox ko test nahi karte: woh doosron ka code hai aur lab runs uska saboot hain. Apne faisle test karo, apni libraries nahi.</p>

<div class="warn"><p><b>Exam trap.</b> Verify ko "sahi" ki woh definition kabhi nahi use karni chahiye jo apply se alag ho. Do definitions mahino mein alag ho jaati hain, phir apply success kehta hai aur verify drift, aur kisi par bharosa nahi rehta.</p></div>

<div class="scn"><h4>Ek mahina hara, ek mahina galat</h4><p>Ek team change ko sirf apply ke pal par check karti thi. Console session wale colleague ne do branch routers se ek syslog server hata diya aur kisi ko nahi bataya. Ek mahine baad SIEM team ne poocha ki un branches ke logs kyon nahi aa rahe. Exit code wala nightly verify, jisme kuch minute ka run time lagta hai, pehli raat pipeline laal kar deta.</p><p><b>Lesson:</b> change tab tak sach hai jab tak agla insaan device ko na chhue. Jaanne ka ek hi tareeka hai: device ko dobara padho.</p></div>

<div class="iv"><p class="q">"Dry run, verify aur test mein kya fark hai?"</p><p>Dry run device se poochta hai ki candidate kya badlega, bina commit kiye. Verify baad mein device ko read-only padhta hai aur intent se compare karta hai. Test mere apne decision logic ko fake device ke saath, bina network ke, check karta hai. Teeno alag pal ki raksha karte hain: change se pehle, uske baad, aur har baar jab code badle.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify read-only hai, repeatable hai, aur rollback faisle wala hi <code>problems_in()</code> use karta hai.</li>
<li>Intent se compare karo, rendered file se nahi.</li>
<li>Drift par exit code 1 se cron aur CI alert khud karte hain.</li>
<li>Report ek file hai jisme time, har device ka verdict aur problems hain.</li>
<li>Apne faisle fake device se unit-test karo; libraries ko nahi.</li>
</ul></div>
`}};export{e as default};