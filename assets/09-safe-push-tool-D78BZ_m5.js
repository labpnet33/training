var e=`<pre class="code"><span class="c"># push.py - the safe Junos change: lock, load, diff, check, commit confirmed, health gate, confirm</span>
import argparse
import sys
import time

from jnpr.junos.exception import CommitError, ConfigLoadError, LockError
from jnpr.junos.utils.config import Config

from nkjunos import connect, healthy
from render import render

CONFIRM_MINUTES = 2          <span class="c"># the device rolls back by itself after this many minutes</span>
SETTLE_SECONDS = 20          <span class="c"># give BGP time to react before we look</span>


def push(name, text, comment, confirm_it=True):
    dev = connect(name)
    cu = Config(dev)
    try:
        cu.lock()
    except LockError as err:
        print("%s: cannot lock the configuration: %s" % (name, err.message))
        dev.close()
        return 2
    try:
        cu.load(text, format="set", merge=True)
        diff = cu.diff()
        if diff is None:
            print("%s: nothing to change" % name)
            return 0
        print(diff)
        cu.commit_check()
        cu.commit(confirm=CONFIRM_MINUTES, comment=comment)
        print("%s: committed, automatic rollback in %d minutes unless confirmed" % (name, CONFIRM_MINUTES))
        if not confirm_it:
            print("%s: NOT confirming (demo): the device will roll back by itself" % name)
            return 0
        time.sleep(SETTLE_SECONDS)
        ok, why = healthy(dev)
        if not ok:
            print("%s: UNHEALTHY after the change: %s" % (name, why))
            cu.rollback(1)
            cu.commit(comment=comment + " ROLLED BACK by the health gate")
            print("%s: rolled back to the previous commit" % name)
            return 1
        cu.commit(comment=comment + " confirmed")
        print("%s: healthy (%s), change confirmed" % (name, why))
        return 0
    except (ConfigLoadError, CommitError) as err:
        print("%s: FAILED: %s" % (name, err.message))
        cu.rollback()
        return 1
    finally:
        cu.unlock()
        dev.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="push a change to Junos devices, safely")
    ap.add_argument("devices", nargs="+")
    ap.add_argument("--file", help="file of set commands (default: render the template)")
    ap.add_argument("--comment", default="NK-2001 customer uplink")
    ap.add_argument("--no-confirm", action="store_true", help="demo: commit confirmed and walk away")
    args = ap.parse_args()
    worst = 0
    for name in args.devices:
        text = open(args.file).read() if args.file else render(name)
        worst = max(worst, push(name, text, args.comment, not args.no_confirm))
    sys.exit(worst)</pre>`,t=`<pre class="out">AUTO01$ python3 push.py J1

[edit interfaces]
+   ge-0/0/3 {
+       description CUST-ACME-UPLINK;
+       unit 0 {
+           family inet {
+               address 10.44.1.1/30;
+           }
+       }
+   }
[edit protocols ospf area 0.0.0.0]
+   interface ge-0/0/3.0 {
+       passive;
+   }

J1: committed, automatic rollback in 2 minutes unless confirmed
J1: healthy (2 BGP peers Established), change confirmed

J1&gt; show system commit
0   2026-10-11 11:35:04 UTC by netops via netconf
    NK-2001 customer uplink confirmed
1   2026-10-11 11:34:44 UTC by netops via netconf commit confirmed, rollback in 2mins
    NK-2001 customer uplink
2   2026-10-11 11:32:56 UTC by root via other

AUTO01$ python3 push.py J1 J2
J1: nothing to change
...
J2: committed, automatic rollback in 2 minutes unless confirmed
J2: healthy (2 BGP peers Established), change confirmed</pre>`,n=`<pre class="out">AUTO01$ cat bad.set
delete interfaces lo0 unit 0 family inet address 10.255.0.1/32
set interfaces lo0 unit 0 family inet address 10.255.1.1/32
AUTO01$ python3 push.py J1 --file bad.set --comment NK-2002

[edit interfaces lo0 unit 0 family inet]
-   address 10.255.0.1/32;
+   address 10.255.1.1/32;

J1: committed, automatic rollback in 2 minutes unless confirmed
J1: <span class="hl">UNHEALTHY after the change: not Established: 10.255.0.2 Active, 10.255.0.3 Active</span>
J1: rolled back to the previous commit</pre>`,r=`<pre class="out">AUTO01$ python3 rollbacks.py
now      : building B2;
diff vs rollback 1: [edit system location] | -   building B1; | +   building B2;
after rollback(1), candidate differs by: [edit system location] | -   building B2; | +   building B1;
still running: building B2;
after commit : building B1;
ValueError: Invalid rollback #77

0   2026-10-11 11:50:27 UTC by netops via netconf
    back to B1
1   2026-10-11 11:50:27 UTC by netops via netconf
    building B2
2   2026-10-11 11:50:27 UTC by netops via netconf
    building B1
3   2026-10-11 11:45:54 UTC by root via other</pre>`,i={id:`safe-push-tool`,h:{en:`The safe push tool`,hi:`Safe push tool`},body:{en:`
<p>Every piece is now on the table: lock, load, diff, check, commit with a timer, health gate, confirm. This chapter puts them in one script, <code>push.py</code>, which is what Lab 1 asks you to build, and then breaks it on purpose to show that each safety layer does its job. In <code>py-safepush</code> you built the same shape for text-based devices with a backup file; here the router itself keeps the backup, in its numbered rollback files.</p>

<h3>The tool, top to bottom</h3>
`+e+`
<p>Read it as a sequence of gates, each of which can stop the change.</p>
<ol class="steps">
<li><b>Lock.</b> <code>LockError</code> stops everything with exit code 2 ("could not even start"). Nothing was changed, so nothing needs undoing.</li>
<li><b>Load and diff.</b> A <code>None</code> diff returns 0 with "nothing to change". Running the tool twice is safe, which is what makes it usable from a scheduler.</li>
<li><b>Check.</b> <code>commit_check()</code> raises <code>CommitError</code> for an inconsistent candidate. The handler prints the router's own words (<code>err.message</code>) and rolls the candidate back.</li>
<li><b>Commit with a timer.</b> From here the router has a safety net that does not depend on this script.</li>
<li><b>Settle, then judge.</b> The health gate decides.</li>
<li><b>Act on the verdict.</b> Bad: roll back and say so. Good: the plain <code>commit()</code> confirms.</li>
<li><b>Always release.</b> <code>finally</code> unlocks and closes the session on every path.</li></ol>

<h3>Why the exit codes matter</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>A scheduler should</th></tr>
<tr><td>0</td><td>Applied and healthy, or nothing to change</td><td>Carry on to the next stage</td></tr>
<tr><td>1</td><td>Failed or rolled back</td><td>Stop and page a human</td></tr>
<tr><td>2</td><td>Could not lock</td><td>Retry later; someone else is working</td></tr></table>
<p>The main block keeps the <b>worst</b> code across devices. A multi-device run that exits 0 after one router rolled back would let the pipeline continue to the next stage as if all was well.</p>

<h3>The good path</h3>
<p>One router, one command. You see the diff, you see the timer, you see the verdict, and the router's own log has two entries for the change: the confirmed commit and the confirming one, both with the ticket in the comment.</p>
`+t+`
<p>Running it a second time on J1 prints "nothing to change" and moves on to J2. That second line is the proof of idempotence: the template and the router agree, so the tool does nothing, quietly.</p>

<h3>The bad path</h3>
<p>Now a deliberately bad change: renumber the loopback that the BGP sessions use as their source. Everything about it is valid, so the syntax passes, the commit check passes, and the commit is accepted. Only the health gate sees the damage.</p>
`+n+`
<p>This is the whole story of the module in six lines. The load was valid, the commit was accepted, and the network was broken. The tool noticed, within the timer, and put the previous configuration back by itself. Notice <b>how</b>: <code>cu.rollback(1)</code> loads the previous commit into the candidate, and a normal <code>commit()</code> makes it live (and cancels the pending timer). The tool did not wait for the router's own timeout; it acted as soon as it knew. The timer is still there as the backstop if the script dies first.</p>

<h3>How rollback(n) really works</h3>
<p>This is the part that people get wrong, so look at a small experiment on its own. Two commits put <code>B1</code> and then <code>B2</code> in the configuration. Then:</p>
`+r+`
<ul>
<li><code>cu.diff(rb_id=1)</code> compares the running configuration with rollback file 1, without loading anything.</li>
<li><code>cu.rollback(1)</code> only loads rollback file 1 into the <b>candidate</b>. The line "still running: building B2" proves nothing is live yet.</li>
<li>You still need <code>cu.commit()</code>. Only then does "building B1" return.</li>
<li><code>cu.rollback(0)</code> (or <code>rollback()</code> with no argument) discards the uncommitted candidate. That is the call in the <code>except</code> and <code>finally</code> paths.</li>
<li>An id that does not exist raises <code>ValueError: Invalid rollback #77</code>. Valid ids are 0 to 49 on real Junos.</li>
<li>A rollback is a new commit in the history, and it carries your comment. "Roll back" does not erase the story; it adds a line to it.</li></ul>

<div class="warn"><p><b>rollback(1) assumes your commit was the last one.</b> If another person committed between your commit and your rollback, "the previous commit" is now their change, not the state before yours. The lock helps (they cannot commit through the shared candidate while you hold it), and the timer helps, but for long windows a more careful tool records <code>diff</code> and the commit comment, and checks the log entry it is about to undo. Keep windows short.</p></div>

<div class="note"><p><b>What this tool does not do.</b> It pushes one device at a time and stops on the first problem you choose to heed through the exit code. It has no concept of a canary group or a wave; adding one is a loop around <code>push()</code> that stops after the first failure. Rescue configuration is not used: the lab does not model it.</p></div>

<div class="exam"><p><b>Exam trap.</b> "<code>cu.rollback(1)</code> restores the previous configuration." It loads it into the candidate. Nothing changes on the router until <code>commit()</code>.</p></div>

<div class="scn"><h4>Friday night, three routers, one typo</h4><p>A change to a loopback address went out with a confirmed commit and a BGP gate. On the first router the gate printed "not Established: ... Active". The tool rolled back and exited 1, so the pipeline never reached the other two. The next morning the team found a one-line typo in the intent file and an empty page queue.</p><p><b>Lesson:</b> the value of the tool is not that changes never fail, but that a failure is small, early, undone and loud.</p></div>

<div class="iv"><p class="q">"Walk me through a safe PyEZ push for a production router."</p><p>Connect, lock, load the change with merge, take the diff and stop if it is None, run commit_check, then commit with confirm in minutes and a ticket comment. Wait a settle period, run the health gate from the router, and if it passes send a plain commit to confirm; if it fails, rollback(1) and commit, or just let the timer expire. Always unlock in a finally block, and return an exit code that tells the pipeline what happened.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: lock, load, diff, check, commit confirmed, settle, gate, confirm or roll back, unlock.</li>
<li>Exit 0 for ok or nothing to do, 1 for failed or rolled back, 2 for lock failure; keep the worst across devices.</li>
<li><code>rollback(n)</code> only loads into the candidate; a <code>commit()</code> makes it live.</li>
<li><code>rollback(0)</code> or <code>rollback()</code> discards the candidate.</li>
<li>A rolled-back change is still a commit in the log; use comments.</li></ul></div>
`,hi:`
<p>Ab saare tukde mez par hain: lock, load, diff, check, timer ke saath commit, health gate, confirm. Yeh chapter inhe ek script, <code>push.py</code>, mein jodta hai, jo Lab 1 aapse banwata hai, aur phir jaan-boojh kar tod kar dikhata hai ki har safety layer apna kaam karti hai. <code>py-safepush</code> mein aapne text-based devices ke liye backup file ke saath yahi shape banayi thi; yahan router khud backup rakhta hai, apni numbered rollback files mein.</p>

<h3>Tool, upar se neeche</h3>
`+e+`
<p>Ise gates ki sequence ki tarah padho, jinmein se har ek change ko rok sakta hai.</p>
<ol class="steps">
<li><b>Lock.</b> <code>LockError</code> sab kuch exit code 2 ("shuru bhi nahi kar paye") ke saath rok deta hai. Kuch badla nahi, to undo karne ko kuch nahi.</li>
<li><b>Load aur diff.</b> <code>None</code> diff "nothing to change" ke saath 0 lautata hai. Tool ko do baar chalana safe hai, isiliye yeh scheduler se use ho sakta hai.</li>
<li><b>Check.</b> Inconsistent candidate par <code>commit_check()</code> <code>CommitError</code> raise karta hai. Handler router ke apne shabd (<code>err.message</code>) print karta hai aur candidate rollback karta hai.</li>
<li><b>Timer ke saath commit.</b> Yahan se router ke paas safety net hai jo is script par depend nahi karta.</li>
<li><b>Settle, phir faisla.</b> Health gate tay karta hai.</li>
<li><b>Faisle par amal.</b> Bura: rollback karo aur bata do. Achha: plain <code>commit()</code> confirm karta hai.</li>
<li><b>Hamesha chhodo.</b> <code>finally</code> har path par unlock karta hai aur session band karta hai.</li></ol>

<h3>Exit codes kyun matter karte hain</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Scheduler ko kya karna chahiye</th></tr>
<tr><td>0</td><td>Apply hua aur healthy, ya kuch badalna nahi tha</td><td>Agle stage par jaye</td></tr>
<tr><td>1</td><td>Fail hua ya rollback hua</td><td>Ruk jaye aur insaan ko page kare</td></tr>
<tr><td>2</td><td>Lock nahi mila</td><td>Baad mein retry kare; koi aur kaam kar raha hai</td></tr></table>
<p>Main block devices ke beech <b>sabse bura</b> code rakhta hai. Jo multi-device run ek router ke rollback ke baad bhi 0 se exit hoti, woh pipeline ko aage ke stage par jaane deti jaise sab theek ho.</p>

<h3>Achha path</h3>
<p>Ek router, ek command. Aap diff dekhte ho, timer dekhte ho, faisla dekhte ho, aur router ke apne log mein change ki do entries hain: confirmed commit aur confirm karne wala, dono ke comment mein ticket.</p>
`+t+`
<p>J1 par doosri baar chalane se "nothing to change" print hota hai aur J2 par chala jaata hai. Woh doosri line idempotence ka saboot hai: template aur router sehmat hain, isliye tool chupchaap kuch nahi karta.</p>

<h3>Bura path</h3>
<p>Ab jaan-boojh kar bura change: us loopback ko renumber karo jise BGP sessions source ki tarah use karte hain. Uski har cheez valid hai, isliye syntax pass, commit check pass, aur commit accept. Sirf health gate nuksaan dekhta hai.</p>
`+n+`
<p>Chhah lines mein yeh poore module ki kahani hai. Load valid tha, commit accept hua, aur network toota. Tool ne timer ke andar notice kiya aur pichhli configuration khud wapas rakh di. Dhyan do <b>kaise</b>: <code>cu.rollback(1)</code> pichhla commit candidate mein load karta hai, aur normal <code>commit()</code> use live karta hai (aur pending timer cancel karta hai). Tool ne router ke apne timeout ka intezaar nahi kiya; jaise hi pata chala usne kaam kiya. Timer ab bhi backstop ki tarah maujood hai agar script pehle mar jaye.</p>

<h3>rollback(n) asal mein kaise kaam karta hai</h3>
<p>Yeh woh hissa hai jisme log galti karte hain, isliye ek chhota experiment akele dekho. Do commits ne configuration mein pehle <code>B1</code> aur phir <code>B2</code> rakha. Phir:</p>
`+r+`
<ul>
<li><code>cu.diff(rb_id=1)</code> running configuration ko rollback file 1 se compare karta hai, kuch load kiye bina.</li>
<li><code>cu.rollback(1)</code> rollback file 1 ko sirf <b>candidate</b> mein load karta hai. "still running: building B2" line saabit karti hai ki abhi kuch live nahi hai.</li>
<li>Aapko ab bhi <code>cu.commit()</code> chahiye. Tabhi "building B1" wapas aata hai.</li>
<li><code>cu.rollback(0)</code> (ya bina argument ke <code>rollback()</code>) uncommitted candidate discard karta hai. <code>except</code> aur <code>finally</code> paths mein yahi call hai.</li>
<li>Jo id maujood nahi uspe <code>ValueError: Invalid rollback #77</code> raise hota hai. Real Junos par valid ids 0 se 49 hain.</li>
<li>Rollback history mein ek naya commit hai, aur usme aapka comment hota hai. "Roll back" kahani mitata nahi; usme ek line jodta hai.</li></ul>

<div class="warn"><p><b>rollback(1) maanta hai ki aapka commit aakhri tha.</b> Agar aapke commit aur rollback ke beech kisi aur ne commit kiya, to "pichhla commit" ab unka change hai, aapse pehle ki state nahi. Lock madad karta hai (jab tak aapke paas hai woh shared candidate se commit nahi kar sakte), aur timer bhi, par lambi windows ke liye zyada careful tool <code>diff</code> aur commit comment record karta hai, aur jis log entry ko undo karne wala hai use check karta hai. Windows chhoti rakho.</p></div>

<div class="note"><p><b>Yeh tool kya nahi karta.</b> Yeh ek samay mein ek device push karta hai aur exit code ke zariye pehli problem par rukta hai jise aap maano. Ismein canary group ya wave ka concept nahi hai; ek jodna <code>push()</code> ke ird-gird loop hai jo pehli failure ke baad ruk jaye. Rescue configuration use nahi hui: lab use model nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "<code>cu.rollback(1)</code> pichhli configuration restore karta hai." Woh use candidate mein load karta hai. <code>commit()</code> tak router par kuch nahi badalta.</p></div>

<div class="scn"><h4>Friday raat, teen routers, ek typo</h4><p>Loopback address ka change confirmed commit aur BGP gate ke saath gaya. Pehle router par gate ne print kiya "not Established: ... Active". Tool ne rollback kiya aur 1 se exit hua, isliye pipeline baaki do tak pahunchi hi nahi. Agli subah team ko intent file mein ek line ka typo mila aur page queue khaali thi.</p><p><b>Lesson:</b> tool ki value yeh nahi ki changes kabhi fail nahi hote, balki yeh ki failure chhoti, jaldi, undo hui aur shor ke saath hoti hai.</p></div>

<div class="iv"><p class="q">"Production router ke liye safe PyEZ push samjhao."</p><p>Connect, lock, change ko merge ke saath load, diff lo aur None ho to ruk jao, commit_check chalao, phir minutes mein confirm aur ticket comment ke saath commit. Settle period ruko, router se health gate chalao, aur pass ho to confirm ke liye plain commit bhejo; fail ho to rollback(1) aur commit, ya bas timer expire hone do. Hamesha finally block mein unlock karo, aur aisa exit code lautao jo pipeline ko bataye ki kya hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: lock, load, diff, check, commit confirmed, settle, gate, confirm ya rollback, unlock.</li>
<li>Exit 0 ok ya kuch nahi karna, 1 failed ya rolled back, 2 lock failure; devices ke beech sabse bura rakho.</li>
<li><code>rollback(n)</code> sirf candidate mein load karta hai; <code>commit()</code> use live karta hai.</li>
<li><code>rollback(0)</code> ya <code>rollback()</code> candidate discard karta hai.</li>
<li>Rolled-back change bhi log mein commit hai; comments use karo.</li></ul></div>
`}};export{i as default};