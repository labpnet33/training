var e={id:`confirm-rollback`,h:{en:`Commit confirm, pending commits and rollback`,hi:`Commit confirm, pending commits aur rollback`},body:{en:`<p>A diff you read before you commit protects you from changes you did not mean. It does not protect you from a change that is correct on paper and wrong on the wire: a route that black-holes traffic, a management address that cuts you off. For those you need a <b>safety net that works after the commit</b>. NAPALM offers two, and which one you get depends on the driver: a timed <b>confirmed commit</b>, and a manual <b>rollback</b>.</p>

<h3>An analogy: the dead-man's switch</h3>
<p>A train driver holds a lever; if he lets go, the train brakes by itself. A confirmed commit is that lever. You commit with a timer, prove the network still works, and then press "confirm". If your script dies or the change cuts you off, nobody presses the lever and the device returns to its previous configuration.</p>

<h3>Junos: revert_in, has_pending_commit, confirm_commit</h3>
<p><code>commit_config(message="", revert_in=None)</code> accepts <code>revert_in</code> in seconds on the Junos driver. The router starts a <code>commit confirmed</code> timer (rounded up to whole minutes, minimum 1). Until you call <code>confirm_commit()</code>, <code>has_pending_commit()</code> is true. <code>autorevert.py</code> commits and then does nothing for 90 seconds:</p>
<pre class="code">import time

from nkdev import open_device

dev = open_device("J1")
dev.load_merge_candidate(config="set system ntp server 10.99.0.62\\n")
print(dev.compare_config())
dev.commit_config(revert_in=60, message="try 62")
print("pending:", dev.has_pending_commit(), sorted(dev.get_ntp_servers()))
time.sleep(90)
print("pending:", dev.has_pending_commit(), sorted(dev.get_ntp_servers()))
dev.close()</pre>
<pre class="out">AUTO01$ python3 autorevert.py
[edit system ntp]
+   server 10.99.0.62;
<span class="hl">pending: True ['10.99.0.60', '10.99.0.61', '10.99.0.62']</span>
<span class="hl">pending: False ['10.99.0.60', '10.99.0.61']</span></pre>
<p>After the commit the new server was live and a commit was pending. After the timer expired the router rolled itself back: the server is gone and nothing is pending, though the script never asked. That is exactly what you want when the script crashed. In the lab the clock is virtual, so <code>time.sleep(90)</code> costs no real time.</p>
<p>Two rules protect you from yourself:</p>
<pre class="code">from napalm.base.exceptions import CommitConfirmException
from nkdev import open_device

dev = open_device("J1")
try:
    dev.confirm_commit()
except CommitConfirmException as err:
    print("CommitConfirmException:", err)
dev.load_merge_candidate(config="set system ntp server 10.99.0.62\\n")
dev.commit_config(revert_in=120)
dev.load_merge_candidate(config="set system ntp server 10.99.0.63\\n")
try:
    dev.commit_config(revert_in=120)
except CommitConfirmException as err:
    print("CommitConfirmException:", err)
dev.discard_config()
dev.rollback()
print("pending:", dev.has_pending_commit(), sorted(dev.get_ntp_servers()))
dev.close()</pre>
<pre class="out">AUTO01$ python3 nopending.py
<span class="hl">CommitConfirmException: No pending commit-confirm found!</span>
<span class="hl">CommitConfirmException: Pending commit confirm already in process!</span>
pending: False ['10.99.0.60', '10.99.0.61']</pre>
<ul>
<li><code>confirm_commit()</code> with nothing pending raises <code>CommitConfirmException</code>: "No pending commit-confirm found!".</li>
<li>A second <code>commit_config(revert_in=...)</code> while one is pending raises the same class: "Pending commit confirm already in process!". Confirm or wait first.</li></ul>

<h3>IOS and EOS in the lab: no timer</h3>
<p>The IOS driver has no confirmed commit, and the lab EOS has no commit timer. Both raise <code>NotImplementedError</code>, and neither accepts a commit message.</p>
<pre class="code">from ntpsync import candidate
from nkdev import open_device

for name in ("R1", "E1"):
    dev = open_device(name)
    dev.load_merge_candidate(config=candidate("ios", ["10.99.0.62"]))
    for kwargs in ({"revert_in": 60}, {"message": "ntp"}):
        try:
            dev.commit_config(**kwargs)
        except NotImplementedError as err:
            print("%s commit_config(%s): NotImplementedError: %s" % (name, list(kwargs)[0], err))
    dev.discard_config()
    dev.close()</pre>
<pre class="out">AUTO01$ python3 limits.py
R1 commit_config(revert_in): <span class="hl">NotImplementedError: Commit confirm has not been implemented on this platform.</span>
R1 commit_config(message): NotImplementedError: Commit message not implemented for this platform
E1 commit_config(revert_in): NotImplementedError: Commit confirm (commit timer) is not supported by the simulated EOS; use commit_config() and rollback()
E1 commit_config(message): NotImplementedError: Commit message not implemented for this platform</pre>
<p>The IOS texts are those of the real IOS driver. The EOS texts are the simulator's own; the real NAPALM EOS driver can use <code>commit timer</code> for <code>revert_in</code> on recent versions, so read your driver's release notes before you assume either way. On a platform without a timer your safety net is the one in chapter 7: verify with a getter, and call <code>rollback()</code> yourself.</p>

<h3>rollback(): one step back</h3>
<p><code>rollback()</code> returns the device to the configuration it had <b>before the last commit</b>. It is a single step, not a history browser. Lab 1, step 7 commits a bad NTP server on purpose and undoes it:</p>
<pre class="code">import sys

from nkdev import DEVICES, open_device

name = sys.argv[1]
driver = DEVICES[name]["driver"]
dev = open_device(name)
bad = "set system ntp server 10.99.0.99\\n" if driver == "junos" else "ntp server 10.99.0.99\\n"
dev.load_merge_candidate(config=bad)
dev.commit_config()
print("%s after the bad commit: %s" % (name, sorted(dev.get_ntp_servers())))
dev.rollback()
print("%s after rollback():     %s" % (name, sorted(dev.get_ntp_servers())))
dev.close()</pre>
<pre class="out">AUTO01$ python3 oops.py R1
R1 after the bad commit: ['10.99.0.60', '10.99.0.61', '10.99.0.99']
R1 after rollback():     ['10.99.0.60', '10.99.0.61']</pre>
<pre class="out">AUTO01$ python3 oops.py J1
J1 after the bad commit: ['10.99.0.60', '10.99.0.61', '10.99.0.99']
<span class="hl">J1 after rollback():     ['10.99.0.60', '10.99.0.61']</span></pre>
<p>Underneath, the IOS lab driver re-applies the configuration it saved just before the commit, EOS uses its replace flow, and Junos runs <code>rollback 1</code> followed by a commit. On a real IOS router the driver depends on file system features that the lab does not have, so test <code>rollback()</code> once in a lab before you trust it in production.</p>

<h3>Which safety net when?</h3>
<table class="cmp"><tr><th>Situation</th><th>Use</th></tr>
<tr><td>Junos change that could cut you off</td><td><code>commit_config(revert_in=...)</code>, verify from a new session, then <code>confirm_commit()</code></td></tr>
<tr><td>IOS or EOS in the lab</td><td>Commit, verify with a getter, <code>rollback()</code> on failure</td></tr>
<tr><td>Anything where the script itself may die</td><td>A timer on the device; a Python <code>try/finally</code> cannot run if the machine is dead</td></tr>
<tr><td>Need to undo an old change</td><td>A new merge or replace; <code>rollback()</code> only goes back one commit</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Calling <code>confirm_commit()</code> without first checking the network from a fresh session; setting a timer shorter than the verification takes; assuming <code>rollback()</code> goes back more than one commit; passing <code>revert_in</code> or <code>message</code> to the IOS driver.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The script crashed after a confirmed commit. What happens?" The device reverts when the timer ends. "What does revert_in mean?" Seconds, but Junos works in whole minutes.</p></div>

<div class="scn"><h4>The change that cut off the engineer</h4><p>A static route change on a Junos edge router was pushed with <code>revert_in=120</code>. It sent the management subnet the wrong way, and the engineer's laptop lost the session. He did nothing. Two minutes later the router rolled back, the session came back, and the ticket recorded "change failed verification, auto-reverted".</p><p><b>Lesson:</b> use the device's timer, because the device is the one component still alive when everything else fails.</p></div>

<div class="iv"><p class="q">"How do you protect against a change that locks you out?"</p><p>A confirmed commit where the platform has one: commit with a timer, check from a new session, and confirm only if the check passes; if not, the router reverts alone. Where there is no timer, I verify with a getter and call rollback, and I schedule a backup restore as the last resort.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>commit_config(revert_in=N)</code> starts a timed commit on Junos; <code>confirm_commit()</code> ends it.</li>
<li>IOS raises <code>NotImplementedError</code> for <code>revert_in</code> and <code>message</code>.</li>
<li><code>CommitConfirmException</code> covers "nothing pending" and "already pending".</li>
<li><code>rollback()</code> undoes the last commit only.</li>
<li>A device-side timer survives a dead script.</li></ul></div>`,hi:`<p>Commit se pehle padha hua diff aapko un changes se bachata hai jo aapne chahe nahi. Yeh aapko us change se nahi bachata jo kaagaz par sahi hai aur wire par galat: aisa route jo traffic ko black-hole kare, aisa management address jo aapko kaat de. Un ke liye aapko <b>commit ke baad kaam karne wala safety net</b> chahiye. NAPALM do deta hai, aur kaunsa milega driver par nirbhar hai: timed <b>confirmed commit</b>, aur haath se <b>rollback</b>.</p>

<h3>Ek analogy: dead-man's switch</h3>
<p>Train driver ek lever pakadta hai; woh chhod de to train khud brake lagati hai. Confirmed commit woh lever hai. Aap timer ke saath commit karte ho, saabit karte ho ki network ab bhi chal raha hai, phir "confirm" dabate ho. Script mar jaye ya change aapko kaat de to koi lever nahi dabata aur device apni pichli configuration par wapas aa jaata hai.</p>

<h3>Junos: revert_in, has_pending_commit, confirm_commit</h3>
<p><code>commit_config(message="", revert_in=None)</code> Junos driver par seconds mein <code>revert_in</code> leta hai. Router <code>commit confirmed</code> timer shuru karta hai (poore minutes tak round up, kam se kam 1). <code>confirm_commit()</code> bulane tak <code>has_pending_commit()</code> true rehta hai. <code>autorevert.py</code> commit karti hai aur phir 90 seconds kuch nahi karti:</p>
<pre class="code">import time

from nkdev import open_device

dev = open_device("J1")
dev.load_merge_candidate(config="set system ntp server 10.99.0.62\\n")
print(dev.compare_config())
dev.commit_config(revert_in=60, message="try 62")
print("pending:", dev.has_pending_commit(), sorted(dev.get_ntp_servers()))
time.sleep(90)
print("pending:", dev.has_pending_commit(), sorted(dev.get_ntp_servers()))
dev.close()</pre>
<pre class="out">AUTO01$ python3 autorevert.py
[edit system ntp]
+   server 10.99.0.62;
<span class="hl">pending: True ['10.99.0.60', '10.99.0.61', '10.99.0.62']</span>
<span class="hl">pending: False ['10.99.0.60', '10.99.0.61']</span></pre>
<p>Commit ke baad naya server live tha aur ek commit pending tha. Timer khatam hone par router ne khud rollback kiya: server chala gaya aur kuch pending nahi, jabki script ne kabhi nahi kaha. Script crash ho jaye to yahi chahiye. Lab mein clock virtual hai, isliye <code>time.sleep(90)</code> mein asli waqt nahi lagta.</p>
<p>Do niyam aapko khud se bachate hain:</p>
<pre class="code">from napalm.base.exceptions import CommitConfirmException
from nkdev import open_device

dev = open_device("J1")
try:
    dev.confirm_commit()
except CommitConfirmException as err:
    print("CommitConfirmException:", err)
dev.load_merge_candidate(config="set system ntp server 10.99.0.62\\n")
dev.commit_config(revert_in=120)
dev.load_merge_candidate(config="set system ntp server 10.99.0.63\\n")
try:
    dev.commit_config(revert_in=120)
except CommitConfirmException as err:
    print("CommitConfirmException:", err)
dev.discard_config()
dev.rollback()
print("pending:", dev.has_pending_commit(), sorted(dev.get_ntp_servers()))
dev.close()</pre>
<pre class="out">AUTO01$ python3 nopending.py
<span class="hl">CommitConfirmException: No pending commit-confirm found!</span>
<span class="hl">CommitConfirmException: Pending commit confirm already in process!</span>
pending: False ['10.99.0.60', '10.99.0.61']</pre>
<ul>
<li>Kuch pending na ho aur <code>confirm_commit()</code> bulao to <code>CommitConfirmException</code> uthti hai: "No pending commit-confirm found!".</li>
<li>Ek pending ke dauran doosra <code>commit_config(revert_in=...)</code> wahi class uthata hai: "Pending commit confirm already in process!". Pehle confirm karo ya ruko.</li></ul>

<h3>Lab mein IOS aur EOS: timer nahi</h3>
<p>IOS driver mein confirmed commit nahi hai, aur lab EOS mein commit timer nahi hai. Dono <code>NotImplementedError</code> uthate hain, aur kisi mein commit message nahi chalta.</p>
<pre class="code">from ntpsync import candidate
from nkdev import open_device

for name in ("R1", "E1"):
    dev = open_device(name)
    dev.load_merge_candidate(config=candidate("ios", ["10.99.0.62"]))
    for kwargs in ({"revert_in": 60}, {"message": "ntp"}):
        try:
            dev.commit_config(**kwargs)
        except NotImplementedError as err:
            print("%s commit_config(%s): NotImplementedError: %s" % (name, list(kwargs)[0], err))
    dev.discard_config()
    dev.close()</pre>
<pre class="out">AUTO01$ python3 limits.py
R1 commit_config(revert_in): <span class="hl">NotImplementedError: Commit confirm has not been implemented on this platform.</span>
R1 commit_config(message): NotImplementedError: Commit message not implemented for this platform
E1 commit_config(revert_in): NotImplementedError: Commit confirm (commit timer) is not supported by the simulated EOS; use commit_config() and rollback()
E1 commit_config(message): NotImplementedError: Commit message not implemented for this platform</pre>
<p>IOS ke texts asli IOS driver ke hain. EOS ke texts simulator ke apne hain; asli NAPALM EOS driver recent versions par <code>revert_in</code> ke liye <code>commit timer</code> use kar sakta hai, isliye dono taraf maanne se pehle apne driver ke release notes padho. Jis platform par timer nahi, wahan aapka safety net chapter 7 wala hai: getter se verify karo, aur khud <code>rollback()</code> bulao.</p>

<h3>rollback(): ek kadam peeche</h3>
<p><code>rollback()</code> device ko us configuration par wapas le jaata hai jo <b>aakhri commit se pehle</b> thi. Yeh ek kadam hai, history browser nahi. Lab 1, step 7 jaan boojh kar galat NTP server commit karta hai aur use undo karta hai:</p>
<pre class="code">import sys

from nkdev import DEVICES, open_device

name = sys.argv[1]
driver = DEVICES[name]["driver"]
dev = open_device(name)
bad = "set system ntp server 10.99.0.99\\n" if driver == "junos" else "ntp server 10.99.0.99\\n"
dev.load_merge_candidate(config=bad)
dev.commit_config()
print("%s after the bad commit: %s" % (name, sorted(dev.get_ntp_servers())))
dev.rollback()
print("%s after rollback():     %s" % (name, sorted(dev.get_ntp_servers())))
dev.close()</pre>
<pre class="out">AUTO01$ python3 oops.py R1
R1 after the bad commit: ['10.99.0.60', '10.99.0.61', '10.99.0.99']
R1 after rollback():     ['10.99.0.60', '10.99.0.61']</pre>
<pre class="out">AUTO01$ python3 oops.py J1
J1 after the bad commit: ['10.99.0.60', '10.99.0.61', '10.99.0.99']
<span class="hl">J1 after rollback():     ['10.99.0.60', '10.99.0.61']</span></pre>
<p>Neeche, IOS lab driver commit se just pehle save ki hui configuration dobara apply karta hai, EOS replace flow use karta hai, aur Junos <code>rollback 1</code> ke baad commit chalata hai. Asli IOS router par driver un file system features par nirbhar hai jo lab mein nahi hain, isliye production mein bharosa karne se pehle <code>rollback()</code> ko ek baar lab mein test karo.</p>

<h3>Kab kaunsa safety net</h3>
<table class="cmp"><tr><th>Sthiti</th><th>Use karo</th></tr>
<tr><td>Junos change jo aapko kaat sakta hai</td><td><code>commit_config(revert_in=...)</code>, naye session se verify, phir <code>confirm_commit()</code></td></tr>
<tr><td>Lab mein IOS ya EOS</td><td>Commit, getter se verify, fail par <code>rollback()</code></td></tr>
<tr><td>Jahan script khud mar sakti hai</td><td>Device par timer; Python ka <code>try/finally</code> tab nahi chalta jab machine hi dead ho</td></tr>
<tr><td>Purana change undo karna</td><td>Naya merge ya replace; <code>rollback()</code> sirf ek commit peeche jaata hai</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Naye session se network check kiye bina <code>confirm_commit()</code> bulana; verification se chhota timer rakhna; maan lena ki <code>rollback()</code> ek se zyada commit peeche jaata hai; IOS driver ko <code>revert_in</code> ya <code>message</code> dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Confirmed commit ke baad script crash hui. Kya hota hai?" Timer khatam hone par device revert ho jaata hai. "revert_in ka matlab?" Seconds, par Junos poore minutes mein kaam karta hai.</p></div>

<div class="scn"><h4>Change jisne engineer ko kaat diya</h4><p>Junos edge router par static route change <code>revert_in=120</code> ke saath push hua. Usne management subnet ko galat taraf bhej diya, aur engineer ka laptop session kho baitha. Usne kuch nahi kiya. Do minute baad router rollback ho gaya, session wapas aa gaya, aur ticket mein likha gaya "change failed verification, auto-reverted".</p><p><b>Lesson:</b> device ka timer use karo, kyunki jab baaki sab fail ho tab device hi akela zinda component hota hai.</p></div>

<div class="iv"><p class="q">"Aisa change jo lock out kar de, usse kaise bachoge?"</p><p>Jahan platform mein ho wahan confirmed commit: timer ke saath commit, naye session se check, aur check pass ho tabhi confirm; nahi to router khud revert ho jaata hai. Jahan timer nahi, wahan getter se verify karta hoon aur rollback bulata hoon, aur aakhri sahare ke liye backup restore schedule karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>commit_config(revert_in=N)</code> Junos par timed commit shuru karta hai; <code>confirm_commit()</code> use khatam karta hai.</li>
<li>IOS <code>revert_in</code> aur <code>message</code> par <code>NotImplementedError</code> uthata hai.</li>
<li><code>CommitConfirmException</code> "kuch pending nahi" aur "pehle se pending" dono cover karti hai.</li>
<li><code>rollback()</code> sirf aakhri commit undo karta hai.</li>
<li>Device-side timer dead script se bach jaata hai.</li></ul></div>`}};export{e as default};