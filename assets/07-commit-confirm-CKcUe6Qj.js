var e=`<pre class="code"><span class="c"># confirm.py - confirm in time, and let the timer run out</span>
import time

from jnpr.junos.utils.config import Config

from nkjunos import connect

dev = connect("J2")
cu = Config(dev)
cu.lock()

cu.load("set system location building CONFIRMED", format="set")
cu.commit(confirm=1, comment="confirm in time")
time.sleep(30)
cu.commit(comment="confirming commit")
time.sleep(100)
print("after 130 s :", dev.cli("show configuration system location", warning=False).strip())

cu.load("set system location building NOT-CONFIRMED", format="set")
cu.commit(confirm=1, comment="timer runs out")
print("right away  :", dev.cli("show configuration system location", warning=False).strip())
time.sleep(70)
print("after 70 s  :", dev.cli("show configuration system location", warning=False).strip())
print(dev.cli("show system commit", warning=False))
cu.unlock()
dev.close()</pre>`,t=`<pre class="out">AUTO01$ python3 confirm.py
after 130 s : building CONFIRMED;
right away  : <span class="hl">building NOT-CONFIRMED;</span>
after 70 s  : <span class="hl">building CONFIRMED;</span>

0   2026-10-11 11:50:17 UTC by root via other
    <span class="hl">automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 11:49:17 UTC by netops via netconf commit confirmed, rollback in 1mins
    timer runs out
2   2026-10-11 11:47:37 UTC by netops via netconf
    confirming commit
3   2026-10-11 11:47:06 UTC by netops via netconf commit confirmed, rollback in 1mins
    confirm in time
4   2026-10-11 11:45:54 UTC by root via other</pre>`,n=`<pre class="out">AUTO01$ python3 push.py J3 --file ntp.set --comment NK-2003 --no-confirm

[edit system]
+   ntp {
+       server 10.99.0.60;
+   }

J3: committed, automatic rollback in 2 minutes unless confirmed
J3: NOT confirming (demo): the device will roll back by itself
J3&gt; show configuration system ntp
server 10.99.0.60;
AUTO01$ python3 wait.py 130
waiting 130 s ...
done
J3&gt; show system commit
0   2026-10-11 11:40:15 UTC by root via other
    <span class="hl">automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 11:38:15 UTC by netops via netconf commit confirmed, rollback in 2mins
    NK-2003</pre>`,r={id:`commit-confirm`,h:{en:`Commit confirmed: the dead-man switch`,hi:`Commit confirmed: dead-man switch`},body:{en:`
<p>You met commit confirmed in <code>adv-netconf</code>, where the timer was written in <b>seconds</b> on the wire. In PyEZ the same feature is one argument, but the unit is different, and that difference has caused real outages. This chapter is short on theory and long on the one habit that matters: <b>every change that could cut you off is committed with a timer, and confirmed only after you have looked.</b></p>

<h3>One argument, in minutes</h3>
<dl class="terms">
<dt><code>cu.commit(confirm=N)</code></dt><dd>Commit now, and roll back automatically after <b>N minutes</b> unless a second commit arrives in time. N is minutes, as in the CLI's <code>commit confirmed 2</code>.</dd>
<dt><code>cu.commit()</code> (the confirming commit)</dt><dd>A normal commit while a confirm timer is running. It makes the change permanent and cancels the rollback.</dd>
<dt><code>comment="..."</code></dt><dd>A text stored in the commit history. Put the ticket number in it. The rollback entry in the log is written by the system, so your comment is how you find the change later.</dd></dl>
<div class="warn"><p><b>Minutes here, seconds in ncclient.</b> <code>confirm=60</code> in PyEZ means one <b>hour</b>. The same number in a raw NETCONF <code>confirm-timeout</code> means one minute. Carrying a value between the two libraries without converting is how a 60-second safety net turns into an hour of waiting for a router that cannot be reached. Name your constant with its unit, as <code>CONFIRM_MINUTES = 2</code> does in the Lab 1 tool.</p></div>

<h3>Watch the timer run out</h3>
<p>The script commits one change and confirms it in time. It then commits a second change with a one-minute timer and does nothing. Read the history at the end.</p>
`+e+`
`+t+`
<p>Walk through it. The first change was confirmed after 30 seconds (the plain commit, entry 2), so it is still there after 130 seconds. The second was live "right away", exactly as a normal commit would be, and then at the 70-second mark it was <b>gone</b>: the router put back the previous configuration by itself, and wrote entry 0, written by <code>root via other</code>, to say so. Your script did not run, your SSH session was not needed, and nothing needed to be reachable. That is the entire value of the feature.</p>

<h3>What confirm protects you from, and what it does not</h3>
<table class="cmp"><tr><th>Failure</th><th>Does confirmed commit save you?</th></tr>
<tr><td>Change cuts off your management path</td><td><b>Yes.</b> You never send the confirming commit, so the router reverts.</td></tr>
<tr><td>Your script crashes after the commit</td><td><b>Yes.</b> The timer expires on its own.</td></tr>
<tr><td>Change breaks BGP but you can still log in</td><td><b>Only if</b> you test and decide. Reachability alone does not prove the change is good (chapter 8).</td></tr>
<tr><td>Confirm timer set too short for your check</td><td>No. The rollback fires before your check finishes. Size it for the slowest thing you do.</td></tr>
<tr><td>You confirm without looking</td><td>No. A <code>commit()</code> in the next line defeats the purpose.</td></tr></table>

<h3>Confirm from a new look, not from the same session</h3>
<p>A change that breaks the management path often leaves your <i>existing</i> session alive, because the TCP connection was established before the change. If your script checks health over that same connection and sees success, it will confirm, and the first person to open a new session is locked out. Where the change could affect the path to the device, the check you rely on should come from a <b>fresh connection</b> (a new <code>Device().open()</code>) or from a different system. In the lab the health gate in chapter 8 reads from the device after a settle delay for the same reason.</p>

<h3>Rollback happens even if you hold the lock</h3>
<p>Remember that the automatic rollback is performed by the router, not by your session. It will occur whether or not you still hold <code>lock()</code>, and the end of a Python script does not cancel it. If you want a change to stay, you must send the confirming commit before the timer ends. This is why the Lab 1 tool prints the deadline, and why the demonstration below uses <code>--no-confirm</code>.</p>
`+n+`
<div class="note"><p><b>Lab and real gear.</b> The lab clock is virtual, so a <code>time.sleep(130)</code> costs no real time, and the routers catch up on the next call to them (that is why <code>wait.py</code> connects to each router after sleeping). On real gear time is real. Rescue configuration (<code>request system configuration rescue save</code>) is another real-world safety net, but this lab does not model it, so it is not used here.</p></div>

<div class="exam"><p><b>Exam trap.</b> "<code>commit(confirm=5)</code> rolls back in 5 seconds." It is 5 minutes in PyEZ. Also: there is no separate "confirm" method. The confirmation is simply a normal <code>commit()</code>.</p></div>

<div class="scn"><h4>The hour that felt like a minute</h4><p>An engineer ported a working ncclient push to PyEZ and kept <code>confirm=120</code>, meaning two minutes. The change broke the uplink. The router would have recovered in two minutes; with PyEZ's unit it waited two hours, and the customer waited with it.</p><p><b>Lesson:</b> constants carry units. <code>CONFIRM_MINUTES</code> cannot be mistaken for seconds, and a code review catches it.</p></div>

<div class="iv"><p class="q">"How does commit confirmed work in PyEZ, and what are the pitfalls?"</p><p>I call <code>cu.commit(confirm=N, comment=...)</code>. N is in minutes. The change goes live immediately, and the router reverts it on its own unless I send a normal commit before N minutes pass. Pitfalls: the unit differs from ncclient's seconds, the timer must be longer than my checks, and I must verify health from a fresh view before confirming, not just assume a live session proves anything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>commit(confirm=N)</code>: N is <b>minutes</b> in PyEZ.</li>
<li>A plain <code>commit()</code> during the timer is the confirmation.</li>
<li>The router performs the rollback itself, even if your script has died.</li>
<li>Always put the ticket in <code>comment=</code>.</li>
<li>Size the timer to your slowest check, and check from a fresh view.</li></ul></div>
`,hi:`
<p>Commit confirmed aap <code>adv-netconf</code> mein mil chuke ho, jahan timer wire par <b>seconds</b> mein likha jaata tha. PyEZ mein wahi feature ek argument hai, par unit alag hai, aur is farq se asli outages hue hain. Yeh chapter theory mein chhota hai aur us ek aadat mein lamba hai jo matter karti hai: <b>jis change se aap cut off ho sakte ho use hamesha timer ke saath commit karo, aur dekhne ke baad hi confirm karo.</b></p>

<h3>Ek argument, minutes mein</h3>
<dl class="terms">
<dt><code>cu.commit(confirm=N)</code></dt><dd>Abhi commit karo, aur <b>N minutes</b> ke baad automatically rollback ho jaye jab tak doosra commit samay par na aaye. N minutes hai, jaise CLI ke <code>commit confirmed 2</code> mein.</dd>
<dt><code>cu.commit()</code> (confirm karne wala commit)</dt><dd>Confirm timer chalte waqt ek normal commit. Yeh change ko permanent kar deta hai aur rollback cancel kar deta hai.</dd>
<dt><code>comment="..."</code></dt><dd>Commit history mein store hone wala text. Ticket number isme daalo. Log mein rollback entry system likhta hai, isliye aapka comment hi change baad mein dhoondhne ka tareeka hai.</dd></dl>
<div class="warn"><p><b>Yahan minutes, ncclient mein seconds.</b> PyEZ mein <code>confirm=60</code> ka matlab ek <b>ghanta</b> hai. Raw NETCONF <code>confirm-timeout</code> mein wahi number ek minute hai. Dono libraries ke beech value bina convert kiye le jaane se 60 second ka safety net ek ghante ka intezaar ban jaata hai us router ke liye jo reach nahi ho raha. Apne constant ka naam unit ke saath rakho, jaise Lab 1 tool mein <code>CONFIRM_MINUTES = 2</code>.</p></div>

<h3>Timer ko khatam hote dekho</h3>
<p>Script ek change commit karti hai aur use samay par confirm karti hai. Phir ek minute ke timer ke saath doosra change commit karti hai aur kuch nahi karti. End mein history padho.</p>
`+e+`
`+t+`
<p>Ise step by step dekho. Pehla change 30 second baad confirm hua (plain commit, entry 2), isliye 130 second baad bhi maujood hai. Doosra "right away" live tha, bilkul normal commit ki tarah, aur phir 70 second ke mark par woh <b>gaya</b>: router ne pichhli configuration khud wapas rakh di, aur entry 0 likhi, jo <code>root via other</code> ne likhi, yeh batane ke liye. Aapki script nahi chali, aapke SSH session ki zaroorat nahi padi, aur kuch bhi reachable hona zaroori nahi tha. Yahi poore feature ki value hai.</p>

<h3>Confirm kis se bachata hai, aur kis se nahi</h3>
<table class="cmp"><tr><th>Failure</th><th>Kya confirmed commit bachata hai?</th></tr>
<tr><td>Change aapka management path kaat deta hai</td><td><b>Haan.</b> Aap confirming commit bhejte hi nahi, to router revert kar deta hai.</td></tr>
<tr><td>Commit ke baad aapki script crash ho jaati hai</td><td><b>Haan.</b> Timer apne aap expire hota hai.</td></tr>
<tr><td>Change BGP tod deta hai par aap login kar sakte ho</td><td><b>Tabhi</b> jab aap test karo aur faisla lo. Sirf reachability se change achha nahi saabit hota (chapter 8).</td></tr>
<tr><td>Confirm timer aapke check ke liye bahut chhota hai</td><td>Nahi. Rollback aapka check khatam hone se pehle chal jaata hai. Apni sabse dheemi cheez ke hisaab se size karo.</td></tr>
<tr><td>Aap bina dekhe confirm kar dete ho</td><td>Nahi. Agli line mein <code>commit()</code> poora maqsad bekaar kar deta hai.</td></tr></table>

<h3>Naye nazariye se confirm karo, usi session se nahi</h3>
<p>Jo change management path todta hai woh aksar aapka <i>maujooda</i> session zinda chhod deta hai, kyunki TCP connection change se pehle bana tha. Agar aapki script usi connection par health check karti hai aur success dekhti hai, to woh confirm kar degi, aur pehla insaan jo naya session kholega lock-out ho jayega. Jahan change device tak ke path ko affect kar sakta hai, wahan jis check par aap bharosa karte ho woh <b>fresh connection</b> (naya <code>Device().open()</code>) se ya kisi aur system se aana chahiye. Lab mein chapter 8 ka health gate isi wajah se settle delay ke baad device se padhta hai.</p>

<h3>Lock aapke paas ho tab bhi rollback hota hai</h3>
<p>Yaad rakho ki automatic rollback router karta hai, aapka session nahi. Woh tab bhi hoga jab aapke paas <code>lock()</code> ho, aur Python script ka end use cancel nahi karta. Agar change rakhna hai to timer khatam hone se pehle confirming commit bhejna zaroori hai. Isiliye Lab 1 tool deadline print karta hai, aur neeche ka demonstration <code>--no-confirm</code> use karta hai.</p>
`+n+`
<div class="note"><p><b>Lab aur real gear.</b> Lab ki clock virtual hai, isliye <code>time.sleep(130)</code> mein asli samay nahi lagta, aur routers agli call par catch up kar lete hain (isiliye <code>wait.py</code> sone ke baad har router se connect karta hai). Real gear par samay asli hai. Rescue configuration (<code>request system configuration rescue save</code>) ek aur real-world safety net hai, par yeh lab ise model nahi karta, isliye yahan use nahi hua.</p></div>

<div class="exam"><p><b>Exam trap.</b> "<code>commit(confirm=5)</code> 5 second mein rollback karta hai." PyEZ mein yeh 5 minute hai. Aur: koi alag "confirm" method nahi hai. Confirmation bas ek normal <code>commit()</code> hai.</p></div>

<div class="scn"><h4>Woh ghanta jo minute jaisa laga</h4><p>Ek engineer ne chalte hue ncclient push ko PyEZ mein port kiya aur <code>confirm=120</code> rakha, matlab do minute. Change ne uplink tod diya. Router do minute mein recover ho jata; PyEZ ki unit ke saath usne do ghante intezaar kiya, aur customer ne bhi.</p><p><b>Lesson:</b> constants unit ke saath rakho. <code>CONFIRM_MINUTES</code> ko seconds samajhna mushkil hai, aur code review pakad leta hai.</p></div>

<div class="iv"><p class="q">"PyEZ mein commit confirmed kaise kaam karta hai, aur pitfalls kya hain?"</p><p>Main <code>cu.commit(confirm=N, comment=...)</code> call karta hoon. N minutes mein hai. Change turant live hota hai, aur router use khud revert kar deta hai jab tak main N minute se pehle normal commit na bhejun. Pitfalls: unit ncclient ke seconds se alag hai, timer mere checks se lamba hona chahiye, aur confirm karne se pehle mujhe fresh view se health verify karni chahiye, yeh maan kar nahi ki chalta hua session kuch saabit karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>commit(confirm=N)</code>: PyEZ mein N <b>minutes</b> hai.</li>
<li>Timer ke dauran plain <code>commit()</code> hi confirmation hai.</li>
<li>Rollback router khud karta hai, script mar bhi gayi ho to bhi.</li>
<li>Ticket hamesha <code>comment=</code> mein daalo.</li>
<li>Timer ko apne sabse dheemi check ke hisaab se size karo, aur fresh view se check karo.</li></ul></div>
`}};export{r as default};