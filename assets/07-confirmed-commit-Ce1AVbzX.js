var e={id:`confirmed-commit`,h:{en:`Confirmed commit: the safety net`,hi:`Confirmed commit: safety net`},body:{en:`
<p>The most dangerous change in networking is the one that cuts off your own access. You move the management address, the commit succeeds, the session dies, and now you cannot log in to undo it. A confirmed commit exists for exactly this. It is the single most valuable habit in this module.</p>

<h3>An analogy: the dead-man's switch</h3>
<p>A train driver must press a pedal every few seconds. If the driver stops pressing, because something went wrong, the train brakes by itself. A confirmed commit is the pedal: "apply this change, but if I do not press confirm within a minute, put everything back". If the change cut you off, you cannot press the pedal, and the device undoes it for you.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Timeline of a confirmed commit">
<line x1="30" y1="100" x2="610" y2="100" stroke="#94a3b8" stroke-width="3"/>
<circle cx="90" cy="100" r="9" fill="#bae6fd"/><text x="90" y="76" text-anchor="middle" class="svg-ink" font-size="12">commit(confirmed=True,</text><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="12">timeout="60")</text>
<rect x="90" y="106" width="300" height="12" rx="3" fill="#fde68a"/><text x="240" y="134" text-anchor="middle" class="svg-muted" font-size="12">trial period: change is live</text>
<circle cx="390" cy="100" r="9" fill="#fecaca"/><text x="390" y="156" text-anchor="middle" class="svg-ink" font-size="12">60 s: automatic rollback</text><text x="390" y="172" text-anchor="middle" class="svg-muted" font-size="11">if nobody confirmed</text>
<circle cx="250" cy="100" r="9" fill="#bbf7d0"/><text x="250" y="62" text-anchor="middle" class="svg-ink" font-size="12">m.commit()</text><text x="250" y="48" text-anchor="middle" class="svg-muted" font-size="11">confirms: change stays</text>
<text x="530" y="90" text-anchor="middle" class="svg-muted" font-size="12">old config back</text>
</svg></div>
<p class="cap">Commit confirmed: the change is live during the trial period; a confirming commit keeps it, silence reverts it.</p>

<h3>The calls</h3>
<dl class="terms">
<dt><code>commit(confirmed=True, timeout="60")</code></dt><dd>Commit the candidate now, and start a countdown of 60 <b>seconds</b>. Needs <code>:candidate</code> and <code>:confirmed-commit</code>. The default timeout is 600 seconds (10 minutes) if you omit it.</dd>
<dt><code>commit()</code></dt><dd>Sent while a confirmed commit is pending, this is the <b>confirming commit</b>: the change becomes permanent and the countdown stops.</dd>
<dt><code>cancel_commit()</code></dt><dd>Cancels a pending confirmed commit and rolls back at once, without waiting for the timer.</dd></dl>
<p>Units are a classic trap. ncclient takes seconds (as a string), while the Junos CLI log shows minutes, "rollback in 1mins".</p>

<h3>What a lapsed confirmation looks like</h3>
<p>The script commits with a 60-second timeout, reads the running configuration, sleeps 70 seconds and reads again:</p>
<pre class="code"><span class="c"># conf.py - commit confirmed, then do nothing</span>
import time

from ncutil import connect

FLT = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;"
CFG = """&lt;config&gt;&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;
  &lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;description&gt;CONFIRM-DEMO&lt;/description&gt;
&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;&lt;/config&gt;"""


def desc(m):
    return m.get_config(source="running", filter=("subtree", FLT)).data.findtext(".//{*}description")


with connect("J1") as m:
    with m.locked("candidate"):
        m.edit_config(target="candidate", config=CFG)
        m.commit(confirmed=True, timeout="60")
    print("right after the commit:", desc(m))
    time.sleep(70)
    print("70 seconds later:      ", desc(m))</pre>
<pre class="out">AUTO01$ python3 conf.py
right after the commit: <span class="hl">CONFIRM-DEMO</span>
70 seconds later:       <span class="hl">None</span>
J1&gt; show system commit
0   2026-10-11 08:08:16 UTC by root via other
    <span class="hl">automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 08:07:16 UTC by netops via netconf commit confirmed, rollback in 1mins
2   2026-10-11 08:07:04 UTC by root via other</pre>
<p>Right after the commit the change is live (<code>CONFIRM-DEMO</code>). After the timer the description is back to nothing. The commit log on J1 tells the story: entry 1 is our "commit confirmed, rollback in 1mins" and entry 0 is "<b>automatic rollback (commit confirmed not confirmed)</b>", written by the device itself. If you ever see that line, someone forgot to confirm. Chapter 10 builds a whole investigation around it.</p>

<h3>Confirm and cancel</h3>
<p>Now the two other paths: confirm in time, and cancel.</p>
<pre class="code"><span class="c"># conf2.py (shortened) - confirm, wait, then cancel a second one</span>
with connect("J1") as m:
    with m.locked("candidate"):
        m.edit_config(target="candidate", config=CFG)
        m.commit(confirmed=True, timeout="120")
    time.sleep(30)
    print("confirming commit:", m.commit().ok)
    time.sleep(200)
    print("200 s later:", desc(m))
    with m.locked("candidate"):
        m.edit_config(target="candidate", config=CFG.replace("CONFIRM-DEMO", "CANCEL-DEMO"))
        m.commit(confirmed=True, timeout="120")
        print("cancel_commit:", m.cancel_commit().ok)
    time.sleep(150)
    print("after cancel + 150 s:", desc(m))</pre>
<pre class="out">AUTO01$ python3 conf2.py
confirming commit: True
200 s later: <span class="hl">CONFIRM-DEMO</span>
cancel_commit: True
after cancel + 150 s: <span class="hl">CONFIRM-DEMO</span>
J1&gt; show system commit
0   2026-10-11 08:11:08 UTC by netops via netconf
    <span class="hl">confirmed commit cancelled</span>
1   2026-10-11 08:11:08 UTC by netops via netconf commit confirmed, rollback in 2mins
2   2026-10-11 08:07:48 UTC by netops via netconf
3   2026-10-11 08:07:17 UTC by netops via netconf commit confirmed, rollback in 2mins
4   2026-10-11 08:07:05 UTC by root via other</pre>
<p>The first change was confirmed after 30 seconds, and 200 seconds later (well past the 120-second timeout) it was still there. For the second change <code>cancel_commit()</code> was used: the log says "confirmed commit cancelled", and note that the description stayed <code>CONFIRM-DEMO</code>, because <code>cancel_commit</code> reverted <b>to the state before the second commit</b>, which was the confirmed first change.</p>

<h3>The pattern: prove you still have access, then confirm</h3>
<p>Confirming straight after the commit proves nothing, because the same session can survive a change that breaks every new connection. The safe pattern is:</p>
<ol>
<li>Commit confirmed with a short timeout (60 seconds for a lab, one to five minutes in the real world).</li>
<li>Open a <b>new</b> session to the device, the way your next script will have to. Make it quick, with a short <code>timeout=5</code>.</li>
<li>Read the change back on it, if you can.</li>
<li>Only if that worked, send <code>m.commit()</code> on the first session.</li>
<li>If anything fails, <b>do not confirm</b>. Print what happened and exit. The device reverts on its own.</li></ol>
<p>The lab script has this as <code>still_reachable()</code> (you finish it in chapter 9). Here is the test of it, Lab 1 step 7: the script is asked to change the management address of J1, the address on which our own sessions arrive.</p>
<pre class="out">AUTO01$ python3 ifchange.py J1 MGMT-TEST 10.99.0.111/24 ge-0/0/0
[edit interfaces ge-0/0/0]
+   description MGMT-TEST;
[edit interfaces ge-0/0/0 unit 0 family inet]
-   address 10.99.0.11/24;
+   address 10.99.0.111/24;
J1: new session failed (<span class="hl">SSHError</span>)
J1: <span class="hl">NOT confirming</span> - Junos rolls the change back in 60 s
AUTO01$ python3 wait.py 65
waiting 65 s ...
done
J1&gt; show system commit
0   2026-10-11 08:09:43 UTC by root via other
    <span class="hl">automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 08:08:43 UTC by netops via netconf commit confirmed, rollback in 1mins
2   2026-10-11 08:08:19 UTC by netops via netconf
3   2026-10-11 08:08:19 UTC by netops via netconf commit confirmed, rollback in 1mins
4   2026-10-11 08:08:07 UTC by root via other</pre>
<p>The diff is the warning: the management address <code>10.99.0.11/24</code> is being replaced. After the commit the new session cannot connect (<code>SSHError</code>), so the script refuses to confirm. The device waits out the 60 seconds and restores the old address; the log's automatic rollback line is the proof. The wait is done by <code>wait.py</code>:</p>
<pre class="code"><span class="c"># wait.py - let N seconds pass (the lab clock is virtual, see the note below)</span>
import sys
import time

from ncutil import connect

secs = int(sys.argv[1]) if len(sys.argv) &gt; 1 else 65
with connect("R1") as m:
    print("waiting %d s ..." % secs)
    time.sleep(secs)
    m.get_config(source="running", filter=("subtree", "&lt;interfaces xmlns='urn:ietf:params:xml:ns:yang:ietf-interfaces'/&gt;"))
print("done")</pre>
<p>In the real world you would simply wait for a minute. In this lab the clock is virtual: time moves forward when your session does something, so <code>wait.py</code> sleeps and then makes a harmless call to let the lab device catch up.</p>

<div class="warn"><p><b>Common mistake.</b> Using a confirmed commit and then confirming blindly in the next line. The safety net is only worth something if the check between the commit and the confirm exercises the thing that could break: a new connection to the management address.</p></div>
<div class="exam"><p><b>Exam trap.</b> A confirmed commit needs both <code>:candidate</code> and <code>:confirmed-commit</code>. Plain <code>commit()</code> during the countdown is the confirmation; it is not a second change. The timer is in seconds in the RPC, minutes in the Junos CLI log.</p></div>
<div class="scn"><h4>The 03:00 renumbering</h4><p>An engineer renumbered a branch router's management interface from a script, using a plain commit. The new address was in the wrong subnet, the session dropped, and the router was unreachable until someone drove to the site at dawn. The follow-up rule: every Junos change goes through commit confirmed with a one-minute timeout, and the script confirms only after a new session logs in on the new address.</p><p><b>Lesson:</b> assume the change can break your own path, and make the device repair it for you.</p></div>

<div class="iv"><p class="q">"What is a confirmed commit and when would you use it?"</p><p>A commit that is only temporary. The change goes live, a timer starts, and unless a confirming commit arrives before the timer ends the device rolls back to the previous configuration. I use it for any change that could affect reachability, such as management addresses, routing or ACLs. After the commit I open a new session to prove access, and only then confirm.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>commit(confirmed=True, timeout="60")</code> starts a countdown in seconds; <code>commit()</code> confirms; <code>cancel_commit()</code> reverts at once.</li>
<li>Unconfirmed changes disappear and the log says "automatic rollback (commit confirmed not confirmed)".</li>
<li>Test with a <b>new</b> session before you confirm; never confirm blindly.</li>
<li>If the test fails, do nothing: the device repairs itself.</li>
<li>IOS XE in this lab has no confirmed commit; take extra care with running edits there.</li>
</ul></div>
`,hi:`
<p>Networking mein sabse khatarnaak change woh hai jo aapki apni access kaat de. Aap management address badalte ho, commit succeed hota hai, session mar jaata hai, aur ab aap login karke undo nahi kar sakte. Confirmed commit isi ke liye hai. Yeh is module ki sabse keemti aadat hai.</p>

<h3>Analogy: dead-man's switch</h3>
<p>Train driver ko har kuch second mein ek pedal dabana padta hai. Driver dabana band kar de, kyunki kuch gadbad hui, to train khud brake laga leti hai. Confirmed commit woh pedal hai: "yeh change lagao, par agar main ek minute mein confirm na karun to sab wapas rakh do". Change ne aapko kaat diya to aap pedal nahi daba sakte, aur device aapke liye use undo kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Timeline of a confirmed commit">
<line x1="30" y1="100" x2="610" y2="100" stroke="#94a3b8" stroke-width="3"/>
<circle cx="90" cy="100" r="9" fill="#bae6fd"/><text x="90" y="76" text-anchor="middle" class="svg-ink" font-size="12">commit(confirmed=True,</text><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="12">timeout="60")</text>
<rect x="90" y="106" width="300" height="12" rx="3" fill="#fde68a"/><text x="240" y="134" text-anchor="middle" class="svg-muted" font-size="12">trial period: change is live</text>
<circle cx="390" cy="100" r="9" fill="#fecaca"/><text x="390" y="156" text-anchor="middle" class="svg-ink" font-size="12">60 s: automatic rollback</text><text x="390" y="172" text-anchor="middle" class="svg-muted" font-size="11">if nobody confirmed</text>
<circle cx="250" cy="100" r="9" fill="#bbf7d0"/><text x="250" y="62" text-anchor="middle" class="svg-ink" font-size="12">m.commit()</text><text x="250" y="48" text-anchor="middle" class="svg-muted" font-size="11">confirms: change stays</text>
<text x="530" y="90" text-anchor="middle" class="svg-muted" font-size="12">old config back</text>
</svg></div>
<p class="cap">Commit confirmed: trial period mein change live hai; confirming commit use rakhta hai, khamoshi use wapas karti hai.</p>

<h3>Calls</h3>
<dl class="terms">
<dt><code>commit(confirmed=True, timeout="60")</code></dt><dd>Candidate ko abhi commit karo, aur 60 <b>second</b> ka countdown shuru karo. <code>:candidate</code> aur <code>:confirmed-commit</code> chahiye. Timeout na do to default 600 second (10 minute) hai.</dd>
<dt><code>commit()</code></dt><dd>Confirmed commit pending hone par bheja jaye to yeh <b>confirming commit</b> hai: change permanent ho jaata hai aur countdown ruk jaata hai.</dd>
<dt><code>cancel_commit()</code></dt><dd>Pending confirmed commit ko cancel karta hai aur timer ka intezaar kiye bina turant rollback karta hai.</dd></dl>
<p>Units ek classic trap hain. ncclient seconds leta hai (string ki tarah), jabki Junos CLI log minutes dikhata hai, "rollback in 1mins".</p>

<h3>Lapsed confirmation kaisa dikhta hai</h3>
<p>Script 60 second ke timeout se commit karti hai, running configuration padhti hai, 70 second sone jaati hai aur phir se padhti hai:</p>
<pre class="code"><span class="c"># conf.py - commit confirmed, then do nothing</span>
import time

from ncutil import connect

FLT = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;"
CFG = """&lt;config&gt;&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;
  &lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;description&gt;CONFIRM-DEMO&lt;/description&gt;
&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;&lt;/config&gt;"""


def desc(m):
    return m.get_config(source="running", filter=("subtree", FLT)).data.findtext(".//{*}description")


with connect("J1") as m:
    with m.locked("candidate"):
        m.edit_config(target="candidate", config=CFG)
        m.commit(confirmed=True, timeout="60")
    print("right after the commit:", desc(m))
    time.sleep(70)
    print("70 seconds later:      ", desc(m))</pre>
<pre class="out">AUTO01$ python3 conf.py
right after the commit: <span class="hl">CONFIRM-DEMO</span>
70 seconds later:       <span class="hl">None</span>
J1&gt; show system commit
0   2026-10-11 08:08:16 UTC by root via other
    <span class="hl">automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 08:07:16 UTC by netops via netconf commit confirmed, rollback in 1mins
2   2026-10-11 08:07:04 UTC by root via other</pre>
<p>Commit ke turant baad change live hai (<code>CONFIRM-DEMO</code>). Timer ke baad description wapas khaali. J1 ka commit log poori kahani batata hai: entry 1 hamara "commit confirmed, rollback in 1mins" hai aur entry 0 hai "<b>automatic rollback (commit confirmed not confirmed)</b>", jo device ne khud likha. Yeh line kabhi dikhe to kisi ne confirm karna bhula diya. Chapter 10 poori investigation isi par banata hai.</p>

<h3>Confirm aur cancel</h3>
<p>Ab do aur raaste: waqt par confirm, aur cancel.</p>
<pre class="code"><span class="c"># conf2.py (shortened) - confirm, wait, then cancel a second one</span>
with connect("J1") as m:
    with m.locked("candidate"):
        m.edit_config(target="candidate", config=CFG)
        m.commit(confirmed=True, timeout="120")
    time.sleep(30)
    print("confirming commit:", m.commit().ok)
    time.sleep(200)
    print("200 s later:", desc(m))
    with m.locked("candidate"):
        m.edit_config(target="candidate", config=CFG.replace("CONFIRM-DEMO", "CANCEL-DEMO"))
        m.commit(confirmed=True, timeout="120")
        print("cancel_commit:", m.cancel_commit().ok)
    time.sleep(150)
    print("after cancel + 150 s:", desc(m))</pre>
<pre class="out">AUTO01$ python3 conf2.py
confirming commit: True
200 s later: <span class="hl">CONFIRM-DEMO</span>
cancel_commit: True
after cancel + 150 s: <span class="hl">CONFIRM-DEMO</span>
J1&gt; show system commit
0   2026-10-11 08:11:08 UTC by netops via netconf
    <span class="hl">confirmed commit cancelled</span>
1   2026-10-11 08:11:08 UTC by netops via netconf commit confirmed, rollback in 2mins
2   2026-10-11 08:07:48 UTC by netops via netconf
3   2026-10-11 08:07:17 UTC by netops via netconf commit confirmed, rollback in 2mins
4   2026-10-11 08:07:05 UTC by root via other</pre>
<p>Pehla change 30 second baad confirm hua, aur 200 second baad (120 second timeout se bahut aage) bhi wahin tha. Doosre change ke liye <code>cancel_commit()</code> use hua: log kehta hai "confirmed commit cancelled", aur dhyan do ki description <code>CONFIRM-DEMO</code> hi rahi, kyunki <code>cancel_commit</code> <b>doosre commit se pehle ki state</b> par gaya, jo confirmed pehla change tha.</p>

<h3>Pattern: pehle access saabit karo, phir confirm</h3>
<p>Commit ke turant baad confirm karna kuch saabit nahi karta, kyunki wahi session us change se bach sakta hai jo har naya connection tod deta hai. Safe pattern:</p>
<ol>
<li>Chhote timeout ke saath commit confirmed (lab mein 60 second, asli duniya mein ek se paanch minute).</li>
<li>Device par <b>naya</b> session kholo, jaise aapki agli script ko kholna padega. Tez rakho, chhote <code>timeout=5</code> ke saath.</li>
<li>Ho sake to change ko uspar read back karo.</li>
<li>Tabhi jab yeh chala, pehle session par <code>m.commit()</code> bhejo.</li>
<li>Kuch bhi fail ho to <b>confirm mat karo</b>. Kya hua print karo aur exit karo. Device khud wapas kar leta hai.</li></ol>
<p>Lab script mein yeh <code>still_reachable()</code> hai (aap ise chapter 9 mein poora karoge). Yeh uska test hai, Lab 1 ka step 7: script se J1 ka management address badalne ko kaha gaya hai, wahi address jis par hamare sessions aate hain.</p>
<pre class="out">AUTO01$ python3 ifchange.py J1 MGMT-TEST 10.99.0.111/24 ge-0/0/0
[edit interfaces ge-0/0/0]
+   description MGMT-TEST;
[edit interfaces ge-0/0/0 unit 0 family inet]
-   address 10.99.0.11/24;
+   address 10.99.0.111/24;
J1: new session failed (<span class="hl">SSHError</span>)
J1: <span class="hl">NOT confirming</span> - Junos rolls the change back in 60 s
AUTO01$ python3 wait.py 65
waiting 65 s ...
done
J1&gt; show system commit
0   2026-10-11 08:09:43 UTC by root via other
    <span class="hl">automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 08:08:43 UTC by netops via netconf commit confirmed, rollback in 1mins
2   2026-10-11 08:08:19 UTC by netops via netconf
3   2026-10-11 08:08:19 UTC by netops via netconf commit confirmed, rollback in 1mins
4   2026-10-11 08:08:07 UTC by root via other</pre>
<p>Diff chetavni hai: management address <code>10.99.0.11/24</code> badla ja raha hai. Commit ke baad naya session connect nahi hota (<code>SSHError</code>), isliye script confirm karne se mana kar deti hai. Device 60 second intezaar karta hai aur purana address wapas laga deta hai; log ki automatic rollback line saboot hai. Intezaar <code>wait.py</code> karta hai:</p>
<pre class="code"><span class="c"># wait.py - let N seconds pass (the lab clock is virtual, see the note below)</span>
import sys
import time

from ncutil import connect

secs = int(sys.argv[1]) if len(sys.argv) &gt; 1 else 65
with connect("R1") as m:
    print("waiting %d s ..." % secs)
    time.sleep(secs)
    m.get_config(source="running", filter=("subtree", "&lt;interfaces xmlns='urn:ietf:params:xml:ns:yang:ietf-interfaces'/&gt;"))
print("done")</pre>
<p>Asli duniya mein aap bas ek minute ruk jaate. Is lab mein clock virtual hai: time tab aage badhta hai jab aapka session kuch karta hai, isliye <code>wait.py</code> sota hai aur phir ek nuksaanrahit call karta hai taaki lab device catch up kar le.</p>

<div class="warn"><p><b>Common mistake.</b> Confirmed commit use karke agli hi line mein andhadhundh confirm kar dena. Safety net tabhi kaam ki hai jab commit aur confirm ke beech ka check wahi cheez aazmaye jo toot sakti hai: management address par naya connection.</p></div>
<div class="exam"><p><b>Exam trap.</b> Confirmed commit ko <code>:candidate</code> aur <code>:confirmed-commit</code> dono chahiye. Countdown ke dauran plain <code>commit()</code> hi confirmation hai; woh doosra change nahi hai. Timer RPC mein seconds mein hai, Junos CLI log mein minutes mein.</p></div>
<div class="scn"><h4>03:00 ki renumbering</h4><p>Ek engineer ne branch router ka management interface script se plain commit ke saath renumber kiya. Naya address galat subnet mein tha, session gir gaya, aur router tab tak unreachable raha jab tak koi subah site par gaadi chalakar nahi gaya. Follow-up rule: har Junos change ek minute ke timeout ke saath commit confirmed se jaata hai, aur script tabhi confirm karti hai jab naya session naye address par login kar le.</p><p><b>Lesson:</b> maan lo ki change aapka apna raasta tod sakta hai, aur device se use theek karwao.</p></div>

<div class="iv"><p class="q">"Confirmed commit kya hai aur kab use karoge?"</p><p>Aisa commit jo sirf temporary hai. Change live hota hai, timer shuru hota hai, aur timer khatam hone se pehle confirming commit na aaye to device pichli configuration par rollback kar deta hai. Main ise un changes ke liye use karta hoon jo reachability ko chhoo sakte hain, jaise management addresses, routing ya ACLs. Commit ke baad main access saabit karne ke liye naya session kholta hoon, aur tabhi confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>commit(confirmed=True, timeout="60")</code> seconds mein countdown shuru karta hai; <code>commit()</code> confirm karta hai; <code>cancel_commit()</code> turant revert karta hai.</li>
<li>Unconfirmed changes gayab ho jaate hain aur log "automatic rollback (commit confirmed not confirmed)" kehta hai.</li>
<li>Confirm se pehle <b>naye</b> session se test karo; andhadhundh confirm mat karo.</li>
<li>Test fail ho to kuch mat karo: device khud ko theek kar leta hai.</li>
<li>Is lab mein IOS XE mein confirmed commit nahi hai; wahan running edits mein extra savdhani rakho.</li>
</ul></div>
`}};export{e as default};