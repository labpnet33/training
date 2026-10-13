var e={id:`commit-confirmed-gate`,h:{en:`The gate: no passing check, no permanent change`,hi:`Gate: check pass nahi, to change permanent nahi`},body:{en:`
<p>Until now a person read the report and decided. A gate removes the decision from the person's tired mind and gives it to the code: apply the change, run the checks, and make the change permanent <b>only if every check passed</b>. The trick that makes this safe on Junos is <code>commit confirmed</code>, which you know from the PyEZ modules. The gate does not have to undo anything when a check fails. It just does not confirm, and the router takes the change back by itself.</p>

<h3>The sequence</h3>
<table class="cmp"><tr><th>#</th><th>Step</th><th>If it goes wrong</th></tr>
<tr><td>1</td><td>Snapshot the network (pre)</td><td>Stop before touching anything</td></tr>
<tr><td>2</td><td>Lock, load, <code>commit_check</code>, <code>commit(confirm=2)</code></td><td>Syntax error: nothing committed</td></tr>
<tr><td>3</td><td>Wait for the network to settle</td><td>-</td></tr>
<tr><td>4</td><td>Snapshot (post) and <code>check pre post</code></td><td>-</td></tr>
<tr><td>5</td><td>All routers Passed: plain <code>commit()</code> confirms</td><td>Any failure: do nothing. The timer runs out and Junos rolls back</td></tr></table>
<p>The rollback is the safety net. If the script crashes at step 4, or your laptop loses power, the change still disappears after two minutes. A gate that depends on cleaning up after itself is not a gate.</p>

<h3>The script</h3>
<pre class="code">"""gate.py - apply a change with commit confirmed, run the JSNAPy checks, confirm only if they pass.
Usage: python3 gate.py CHANGE-ID        exit code 0 = confirmed, 1 = blocked (Junos rolls back by itself)
"""
import contextlib
import sys
import time

from jnpr.jsnapy import SnapAdmin
from jnpr.junos import Device
from jnpr.junos.utils.config import Config

from change import CHANGES, HOST
from jsnap import HOSTS, config

CONFIRM_MINUTES = 2
SETTLE_SECONDS = 20


def quiet(logfile, func, *args):
    """Run func with everything it prints going to a log file, so the gate shows only its verdict."""
    with open(logfile, "a") as log, contextlib.redirect_stdout(log):
        return func(*args)


def main(change_id):
    js = SnapAdmin()
    logfile = "gate-%s.log" % change_id
    quiet(logfile, js.snap, config(), "gpre")
    with Device(host=HOST, user="netops", passwd="NK@2026", gather_facts=False) as dev:
        cu = Config(dev)
        cu.lock()
        try:
            cu.load("\\n".join(CHANGES[change_id]), format="set")
            cu.commit_check()
            cu.commit(confirm=CONFIRM_MINUTES, comment=change_id + " (gated)")
        finally:
            cu.unlock()
        time.sleep(SETTLE_SECONDS)
        quiet(logfile, js.snap, config(), "gpost")
        results = quiet(logfile, js.check, config(), "gpre", "gpost")
        bad = [r.device for r in results if r.result != "Passed"]
        if len(results) &lt; len(HOSTS):
            bad.append("%d router(s) gave no result" % (len(HOSTS) - len(results)))
        if bad:
            print("GATE BLOCKED %s: checks failed on %s (report in %s)" % (change_id, ", ".join(bad), logfile))
            print("not confirming, Junos rolls the change back in %d minutes" % CONFIRM_MINUTES)
            time.sleep(CONFIRM_MINUTES * 60 + 10)
            return 1
        cu.commit(comment=change_id + " confirmed by the gate")
        print("GATE PASSED %s: change confirmed" % change_id)
        return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))</pre>
<p>Three details deserve a second look:</p>
<ul>
<li><b><code>quiet()</code> sends the long report to a log file.</b> The gate prints one line of verdict and the full evidence goes to <code>gate-CHG-ID.log</code>. Pipelines want a short answer and a file to attach.</li>
<li><b>Exit code 0 means confirmed, 1 means blocked.</b> That is all a CI job or a shell <code>&&</code> needs.</li>
<li><b>The guard for missing results.</b> If JSNAPy cannot connect, it returns an empty list and <code>bad</code> would stay empty. The extra line counts results against routers so "no answer" cannot be mistaken for "all good".</li>
</ul>

<h3>Two changes through the gate</h3>
<p>CHG-3106 describes a spare port. CHG-3105 was meant to shut an unused port, but the script holds a typo and disables the link between J2 and J3 instead.</p>
<pre class="out">AUTO01$ python3 gate.py CHG-3106; echo "exit code: $?"
GATE PASSED CHG-3106: change confirmed
exit code: 0</pre>
<pre class="out">AUTO01$ python3 gate.py CHG-3105; echo "exit code: $?"
GATE BLOCKED CHG-3105: checks failed on 10.99.0.12, 10.99.0.13 (report in gate-CHG-3105.log)
not confirming, Junos rolls the change back in 2 minutes
exit code: 1</pre>
<p>The harmless change is confirmed and the harmful one blocked, and nobody had to read a report at 2 a.m. The reason is in the log:</p>
<pre class="out">AUTO01$ grep ERROR gate-CHG-3105.log
ERROR : "neighbor-address" value "10.23.0.2" was in the pre snapshot but is missing from the post snapshot
ERROR : "neighbor-address" value "10.23.0.1" was in the pre snapshot but is missing from the post snapshot</pre>

<h3>The device keeps its own record</h3>
<pre class="out">J2&gt; show system commit
0   2026-10-11 12:39:20 UTC by root via other
<span class="hl">    automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 12:37:20 UTC by netops via netconf commit confirmed, rollback in 2mins
    CHG-3105 (gated)
2   2026-10-11 12:37:18 UTC by netops via netconf
<span class="hl">    CHG-3106 confirmed by the gate</span>
3   2026-10-11 12:36:58 UTC by netops via netconf commit confirmed, rollback in 2mins
    CHG-3106 (gated)
4   2026-10-11 12:36:05 UTC by netops via netconf
    CHG-3105 undo
5   2026-10-11 12:36:05 UTC by netops via netconf
    CHG-3105
6   2026-10-11 12:35:25 UTC by root via other</pre>
<p>Read from the bottom up (newest at the top). CHG-3106 was committed with a rollback timer, then confirmed by the gate. CHG-3105 was committed with a timer and never confirmed, so the top entry says <code>automatic rollback (commit confirmed not confirmed)</code>. This is also your audit trail: every gated change has its comment, its time and its outcome.</p>

<div class="eg"><p><b>Worked example.</b> You want the gate to be stricter for core changes. Add a second condition before the confirm: the pytest intent file must also pass. Call <code>pytest -q -k J2</code> from the gate with <code>subprocess.run</code> and treat a non-zero exit as a block. Both checks use the same rule: confirm only when every one of them says yes.</p></div>

<h3>Settling: how long is enough?</h3>
<p>The gate waits a fixed 20 seconds. That is enough to notice that a link <b>went down</b>, because OSPF reacts to a lost interface quickly. It is not enough to notice that a link <b>came up and is healthy</b>: chapter 5 showed a neighbour sitting in 2Way for a minute or more. For a change that adds something, replace the sleep with a poll of the state you expect, as <code>change.py</code> does when it undoes the change.</p>

<h3>The empty list, once more</h3>
<pre class="out">AUTO01$ python3 errs3.py
--- wrong password
Connecting to device 10.99.0.12 ................
ERROR!! Unable to connect to device: ConnectAuthError(10.99.0.12)
[] True</pre>
<p>The last line, <code>[] True</code>, is the trap: no results, and <code>all()</code> of nothing is True. The gate above avoids it with the length check. If you write your own, put that test in first.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using plain <code>commit()</code> in the gate, so a failed check leaves the change live. (2) A confirm timer shorter than the settle time plus the check time, so the rollback fires before the gate can say yes. (3) Printing the full report to the pipeline log so nobody reads the verdict. (4) Gating only on the exit code of a script that always returns 0.</p></div>
<div class="exam"><p><b>Exam trap.</b> A <code>commit confirmed</code> that is not followed by a second commit rolls back and the rolled-back commit appears in the history. A gate that "blocks" must therefore wait out the timer (or issue a rollback) before it reports that the router is back to normal.</p></div>

<div class="scn"><h4>The gate that always said yes</h4><p>A gate passed every change for a month. When someone changed the password, JSNAPy could not log in, printed an error, returned an empty list, and the gate's loop over the results never ran. A wrong password looked exactly like success. After this, the gate counted results and refused to confirm anything with fewer answers than routers.</p><p><b>Lesson:</b> a check that cannot fail is not a check. Test the gate with a deliberately bad change and a deliberately bad password.</p></div>

<div class="iv"><p class="q">"How do you make an automated change safe?"</p><p>I apply it with commit confirmed, take a post snapshot after the network settles, run the same checks I would run by hand, and confirm only if all pass. If anything fails or the script dies, the router rolls back by itself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A gate is: commit confirmed, settle, check, confirm only on all-pass.</li>
<li>The router's own rollback timer is the safety net; the script does not need to undo anything.</li>
<li>Exit code 0 or 1 and a one-line verdict make the gate usable in pipelines; keep the long report in a log file.</li>
<li>Count results against routers so an empty list cannot pass.</li>
<li>Poll for convergence when the change brings things up; a fixed wait is enough for failures that show quickly.</li>
</ul></div>
`,hi:`
<p>Ab tak ek insaan report padhkar faisla karta tha. Gate faisla thake hue dimaag se nikalkar code ko deta hai: change lagao, checks chalao, aur change ko permanent <b>tabhi karo jab har check pass ho</b>. Junos par ise surakshit banane wali trick <code>commit confirmed</code> hai, jo aap PyEZ modules se jaante ho. Check fail hone par gate ko kuch undo nahi karna padta. Woh bas confirm nahi karta, aur router change ko apne aap wapas le leta hai.</p>

<h3>Kram</h3>
<table class="cmp"><tr><th>#</th><th>Kadam</th><th>Galat hua to</th></tr>
<tr><td>1</td><td>Network ka snapshot (pre)</td><td>Kuch chhoone se pehle ruk jao</td></tr>
<tr><td>2</td><td>Lock, load, <code>commit_check</code>, <code>commit(confirm=2)</code></td><td>Syntax error: kuch commit nahi hua</td></tr>
<tr><td>3</td><td>Network ke settle hone ka wait</td><td>-</td></tr>
<tr><td>4</td><td>Snapshot (post) aur <code>check pre post</code></td><td>-</td></tr>
<tr><td>5</td><td>Sab routers Passed: saada <code>commit()</code> confirm karta hai</td><td>Koi failure: kuch mat karo. Timer khatam hota hai aur Junos rollback kar deta hai</td></tr></table>
<p>Rollback hi safety net hai. Agar script step 4 par crash ho, ya laptop ki bijli chali jaye, change do minute baad phir bhi hat jaata hai. Jo gate khud ke baad safai par nirbhar ho woh gate nahi hai.</p>

<h3>Script</h3>
<pre class="code">"""gate.py - apply a change with commit confirmed, run the JSNAPy checks, confirm only if they pass.
Usage: python3 gate.py CHANGE-ID        exit code 0 = confirmed, 1 = blocked (Junos rolls back by itself)
"""
import contextlib
import sys
import time

from jnpr.jsnapy import SnapAdmin
from jnpr.junos import Device
from jnpr.junos.utils.config import Config

from change import CHANGES, HOST
from jsnap import HOSTS, config

CONFIRM_MINUTES = 2
SETTLE_SECONDS = 20


def quiet(logfile, func, *args):
    """Run func with everything it prints going to a log file, so the gate shows only its verdict."""
    with open(logfile, "a") as log, contextlib.redirect_stdout(log):
        return func(*args)


def main(change_id):
    js = SnapAdmin()
    logfile = "gate-%s.log" % change_id
    quiet(logfile, js.snap, config(), "gpre")
    with Device(host=HOST, user="netops", passwd="NK@2026", gather_facts=False) as dev:
        cu = Config(dev)
        cu.lock()
        try:
            cu.load("\\n".join(CHANGES[change_id]), format="set")
            cu.commit_check()
            cu.commit(confirm=CONFIRM_MINUTES, comment=change_id + " (gated)")
        finally:
            cu.unlock()
        time.sleep(SETTLE_SECONDS)
        quiet(logfile, js.snap, config(), "gpost")
        results = quiet(logfile, js.check, config(), "gpre", "gpost")
        bad = [r.device for r in results if r.result != "Passed"]
        if len(results) &lt; len(HOSTS):
            bad.append("%d router(s) gave no result" % (len(HOSTS) - len(results)))
        if bad:
            print("GATE BLOCKED %s: checks failed on %s (report in %s)" % (change_id, ", ".join(bad), logfile))
            print("not confirming, Junos rolls the change back in %d minutes" % CONFIRM_MINUTES)
            time.sleep(CONFIRM_MINUTES * 60 + 10)
            return 1
        cu.commit(comment=change_id + " confirmed by the gate")
        print("GATE PASSED %s: change confirmed" % change_id)
        return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))</pre>
<p>Teen baaton par dobara nazar daalo:</p>
<ul>
<li><b><code>quiet()</code> lambi report ko log file mein bhejta hai.</b> Gate faisle ki ek line print karta hai aur poora saboot <code>gate-CHG-ID.log</code> mein jaata hai. Pipelines ko chhota jawab aur attach karne ke liye file chahiye.</li>
<li><b>Exit code 0 ka matlab confirmed, 1 ka matlab blocked.</b> CI job ya shell <code>&&</code> ko bas yahi chahiye.</li>
<li><b>Missing results ka guard.</b> Agar JSNAPy connect na kar paye to woh khaali list lautata hai aur <code>bad</code> khaali rehta. Extra line results ko routers se ginti mein milati hai taaki "koi jawab nahi" ko "sab theek" na samjha jaye.</li>
</ul>

<h3>Do changes gate se guzre</h3>
<p>CHG-3106 spare port ka description likhta hai. CHG-3105 ko ek unused port band karna tha, par script mein typo hai aur woh J2 aur J3 ke beech ka link disable kar deti hai.</p>
<pre class="out">AUTO01$ python3 gate.py CHG-3106; echo "exit code: $?"
GATE PASSED CHG-3106: change confirmed
exit code: 0</pre>
<pre class="out">AUTO01$ python3 gate.py CHG-3105; echo "exit code: $?"
GATE BLOCKED CHG-3105: checks failed on 10.99.0.12, 10.99.0.13 (report in gate-CHG-3105.log)
not confirming, Junos rolls the change back in 2 minutes
exit code: 1</pre>
<p>Harmless change confirm hua aur nuksaan wala block, aur raat 2 baje kisi ko report padhni nahi padi. Wajah log mein hai:</p>
<pre class="out">AUTO01$ grep ERROR gate-CHG-3105.log
ERROR : "neighbor-address" value "10.23.0.2" was in the pre snapshot but is missing from the post snapshot
ERROR : "neighbor-address" value "10.23.0.1" was in the pre snapshot but is missing from the post snapshot</pre>

<h3>Device apna record khud rakhta hai</h3>
<pre class="out">J2&gt; show system commit
0   2026-10-11 12:39:20 UTC by root via other
<span class="hl">    automatic rollback (commit confirmed not confirmed)</span>
1   2026-10-11 12:37:20 UTC by netops via netconf commit confirmed, rollback in 2mins
    CHG-3105 (gated)
2   2026-10-11 12:37:18 UTC by netops via netconf
<span class="hl">    CHG-3106 confirmed by the gate</span>
3   2026-10-11 12:36:58 UTC by netops via netconf commit confirmed, rollback in 2mins
    CHG-3106 (gated)
4   2026-10-11 12:36:05 UTC by netops via netconf
    CHG-3105 undo
5   2026-10-11 12:36:05 UTC by netops via netconf
    CHG-3105
6   2026-10-11 12:35:25 UTC by root via other</pre>
<p>Neeche se upar padho (sabse naya upar). CHG-3106 rollback timer ke saath commit hua, phir gate ne confirm kiya. CHG-3105 timer ke saath commit hua aur kabhi confirm nahi hua, isliye sabse upar ki entry kehti hai <code>automatic rollback (commit confirmed not confirmed)</code>. Yahi aapka audit trail bhi hai: har gated change ka comment, waqt aur nateeja.</p>

<div class="eg"><p><b>Worked example.</b> Aap chahte ho ki core changes ke liye gate zyada sakht ho. Confirm se pehle doosri shart jodo: pytest intent file bhi pass honi chahiye. Gate se <code>subprocess.run</code> ke zariye <code>pytest -q -k J2</code> bulao aur non-zero exit ko block maano. Dono checks ek hi niyam maante hain: tabhi confirm karo jab har ek haan kahe.</p></div>

<h3>Settle: kitna wait kaafi hai?</h3>
<p>Gate fixed 20 second rukta hai. Itna yeh dekhne ke liye kaafi hai ki link <b>gir gaya</b>, kyunki OSPF khoye interface par jaldi react karta hai. Yeh dekhne ke liye kaafi nahi ki link <b>upar aaya aur healthy hai</b>: chapter 5 ne dikhaya ki neighbour minute ya usse zyada 2Way mein baitha rehta hai. Jo change kuch jodta hai uske liye sleep ki jagah apekshit state ka poll lagao, jaise <code>change.py</code> undo karte waqt karti hai.</p>

<h3>Khaali list, ek baar aur</h3>
<pre class="out">AUTO01$ python3 errs3.py
--- wrong password
Connecting to device 10.99.0.12 ................
ERROR!! Unable to connect to device: ConnectAuthError(10.99.0.12)
[] True</pre>
<p>Aakhri line, <code>[] True</code>, jaal hai: koi result nahi, aur kuch nahi ka <code>all()</code> True hota hai. Upar wala gate ise length check se bachata hai. Apna likho to woh test sabse pehle daalo.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Gate mein saada <code>commit()</code> use karna, jisse failed check ke baad bhi change live rehta hai. (2) Confirm timer ka settle time plus check time se chhota hona, isliye gate haan kehne se pehle rollback chal jaata hai. (3) Poori report pipeline log mein print karna taaki faisla koi na padhe. (4) Aisi script ke exit code par gate karna jo hamesha 0 lautati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>commit confirmed</code> ke baad doosra commit na ho to rollback hota hai aur rolled-back commit history mein dikhta hai. Isliye "block" karne wale gate ko timer khatam hone tak rukna chahiye (ya rollback dena chahiye) uske baad hi kehna chahiye ki router normal par wapas hai.</p></div>

<div class="scn"><h4>Gate jo hamesha haan kehta tha</h4><p>Ek gate ne mahine bhar har change pass kiya. Kisi ne password badla, JSNAPy login nahi kar paya, error print kiya, khaali list lautayi, aur gate ka results par loop kabhi chala hi nahi. Galat password bilkul success jaisa dikha. Uske baad gate results ginne laga aur routers se kam jawab hone par kuch confirm karne se inkaar karne laga.</p><p><b>Lesson:</b> jo check fail nahi ho sakta woh check nahi hai. Gate ko jaanboojhkar kharaab change aur jaanboojhkar kharaab password se test karo.</p></div>

<div class="iv"><p class="q">"Automated change ko surakshit kaise banate ho?"</p><p>Main use commit confirmed se lagata hoon, network settle hone ke baad post snapshot leta hoon, wahi checks chalata hoon jo haath se chalata, aur sab pass hone par hi confirm karta hoon. Kuch fail ho ya script mar jaye, router apne aap rollback kar leta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gate yeh hai: commit confirmed, settle, check, sab pass hone par hi confirm.</li>
<li>Router ka apna rollback timer safety net hai; script ko kuch undo nahi karna padta.</li>
<li>Exit code 0 ya 1 aur ek-line verdict gate ko pipelines ke layak banate hain; lambi report log file mein rakho.</li>
<li>Results ko routers se ginti mein milao taaki khaali list pass na ho.</li>
<li>Jab change kuch upar laata hai tab convergence poll karo; jaldi dikhne wali failures ke liye fixed wait kaafi hai.</li>
</ul></div>
`}};export{e as default};