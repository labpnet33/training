var e=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two sessions and one candidate"><rect x="20" y="20" width="150" height="50" rx="8" fill="#bae6fd"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="13">`+e+`</text><text x="95" y="58" text-anchor="middle" class="svg-muted" font-size="11">lock() = True</text><rect x="20" y="120" width="150" height="50" rx="8" fill="#fed7aa"/><text x="95" y="142" text-anchor="middle" class="svg-ink" font-size="13">`+t+`</text><text x="95" y="158" text-anchor="middle" class="svg-muted" font-size="11">LockError</text><rect x="260" y="50" width="200" height="90" rx="10" fill="#ddd6fe"/><text x="360" y="85" text-anchor="middle" class="svg-ink" font-size="14">`+n+`</text><text x="360" y="108" text-anchor="middle" class="svg-muted" font-size="12">`+r+`</text><line x1="170" y1="45" x2="258" y2="80" stroke="#16a34a" stroke-width="3"/><line x1="170" y1="145" x2="258" y2="112" stroke="#dc2626" stroke-width="3" stroke-dasharray="5 4"/><rect x="520" y="70" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="92" text-anchor="middle" class="svg-ink" font-size="13">running</text><text x="570" y="108" text-anchor="middle" class="svg-muted" font-size="11">live config</text><line x1="460" y1="95" x2="518" y2="95" stroke="#64748b" stroke-width="2"/></svg>`,t={id:`lock-and-modes`,h:{en:`The Config object, locks and sessions`,hi:`Config object, locks aur sessions`},body:{en:`
<p>Two engineers editing the same router at the same time is how half-finished changes get committed. On Junos the candidate configuration is shared by default: whatever one session loads into it, another session sees, and whoever commits first commits everything. PyEZ gives you the tools to prevent this, and the first one is the lock.</p>

<h3>The Config object</h3>
<p>You create it from an open device: <code>cu = Config(dev)</code>. There is also a shortcut, <code>dev.bind(cu=Config)</code>, after which the object lives at <code>dev.cu</code>. Both are the same class from <code>jnpr.junos.utils.config</code>. The object does not open a new connection: it sends NETCONF operations (see adv-netconf) on the session your <code>Device</code> already has.</p>

<h3>lock() and unlock()</h3>
<p><code>cu.lock()</code> asks the router for exclusive use of the candidate. While you hold it, another session's <code>lock()</code> is refused with <code>LockError</code>. <code>cu.unlock()</code> gives it back. The script below uses two sessions, Alice and Bob, to the same router.</p>
<pre class="code"><span class="c"># locks.py - what lock() does, shown with two sessions to the same router</span>
from jnpr.junos.exception import LockError
from jnpr.junos.utils.config import Config

from nkjunos import connect

alice = Config(connect("J1"))
bob = Config(connect("J1"))

print("alice lock:", alice.lock())
try:
    bob.lock()
except LockError as err:
    print("bob lock failed:", err.message)
print("alice unlock:", alice.unlock())
print("bob lock:", bob.lock())
bob.unlock()

alice.lock()
alice.load("set system location building HQ-R9", format="set")
<span class="c">alice.unlock()                      # unlock does NOT discard the change</span>
try:
    bob.lock()
except LockError as err:
    print("bob lock failed:", err.message)
print("bob sees:", bob.diff().strip().splitlines())
bob.rollback()
print("bob lock:", bob.lock())
bob.unlock()</pre>
<pre class="out">AUTO01$ python3 locks.py
alice lock: True
bob lock failed: <span class="hl">configuration database is locked by another session</span>
alice unlock: True
bob lock: True
bob lock failed: <span class="hl">configuration database modified</span>
bob sees: ['[edit system]', '+   location {', '+       building HQ-R9;', '+   }']
bob lock: True</pre>
<p>There are two different refusals, and the second one is the more useful. <b>"locked by another session"</b> is the plain case: someone else holds the lock right now. <b>"configuration database modified"</b> is Junos protecting you from a stranger's draft: the candidate already contains uncommitted changes (here Alice loaded a line and unlocked without committing or rolling back), so a new lock is refused. Notice that <code>unlock()</code> did not discard Alice's change. Bob can read it with <code>diff()</code>. If he had simply gone ahead and committed, Alice's unreviewed line would have gone live with his.</p>
`+e(`Alice`,`Bob`,`candidate`,`one shared draft`)+`<p class="cap">In shared mode every session works on one candidate. The lock decides who may start; "modified" tells you the draft is not clean.</p></div>

<div class="warn"><p><b>Common mistake.</b> Catching <code>LockError</code> and carrying on without a lock. A refused lock is information: either someone is working there now, or someone left a draft. Stop, report which, and let a human decide. Never "fix" it by rolling back a candidate you did not create.</p></div>

<h3>The with statement</h3>
<p><code>with Config(dev) as cu:</code> locks on entry and unlocks on exit, even after an exception. It is tidy, but it does <b>not</b> roll back. If your block loads a change and then ends without a commit, the draft stays in the candidate and the next session meets "configuration database modified". Chapter 10 shows the incident this causes. Prefer an explicit <code>try ... finally</code> with <code>rollback()</code> in it.</p>

<h3>Private and exclusive modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Code</th><th>What you get</th></tr>
<tr><td>shared (default)</td><td><code>Config(dev)</code></td><td>One candidate for everyone. You must lock and keep it clean.</td></tr>
<tr><td>private</td><td><code>with Config(dev, mode="private") as cu:</code></td><td>Your own copy of the candidate. Others cannot see your edits and you do not see theirs. Your commit applies only your changes.</td></tr>
<tr><td>exclusive</td><td><code>with Config(dev, mode="exclusive") as cu:</code></td><td>The candidate is locked for everybody else for the whole block, as with <code>configure exclusive</code> in the CLI.</td></tr></table>
<p>In private mode the shared candidate stays untouched, as this run shows:</p>
<pre class="code"><span class="c"># priv.py - private mode: your own copy of the candidate</span>
from jnpr.junos.utils.config import Config

from nkjunos import connect

dev = connect("J1")
other = connect("J1")
with Config(dev, mode="private") as p:
    p.load("set system location building PRIV", format="set")
    print("private diff     :", p.diff().strip().replace("\\n", " | "))
    print("shared candidate :", repr(Config(other).diff()))
    p.commit(comment="from a private session")
print("running now      :", other.cli("show configuration system location", warning=False).strip())
dev.close()
other.close()</pre>
<pre class="out">AUTO01$ python3 priv.py
private diff     : [edit system] | +   location { | +       building PRIV; | +   }
shared candidate : <span class="hl">None</span>
running now      : building PRIV;</pre>
<p>Private mode suits a human-sized change on a busy shared device. For automation on a fleet we still prefer the shared candidate with a lock: a refused lock tells you something is wrong, where a private copy would quietly hide it.</p>

<div class="exam"><p><b>Exam trap.</b> Which statement is true: <code>unlock()</code> discards my changes, or it does not? It does <b>not</b>. Only <code>rollback()</code> (or a commit) clears the candidate.</p></div>

<div class="scn"><h4>Ravi's draft</h4><p>Ravi loaded an NTP change on J2 before lunch, got pulled into a meeting and left. The afternoon push script did not lock, loaded its own lines, committed, and Ravi's untested NTP server went live on the whole path. A script with <code>lock()</code> would have failed with "configuration database modified" and the on-call engineer would have asked Ravi first.</p><p><b>Lesson:</b> the lock is not paperwork. It is how the router tells you the candidate is not yours alone.</p></div>

<div class="iv"><p class="q">"What does lock() protect against, and what does it not?"</p><p>It stops a second session from taking the lock, and on Junos it also refuses when the candidate already holds uncommitted changes, which protects me from committing someone else's draft. It does not discard changes on unlock, and it does not stop a session that never asks for the lock from editing the shared candidate. So every script of mine takes the lock and releases it in finally.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Config(dev)</code> or <code>dev.bind(cu=Config)</code> gives you the object; it reuses the open session.</li>
<li><code>lock()</code> raises <code>LockError</code>; read the message: "locked by another session" or "configuration database modified".</li>
<li><code>unlock()</code> and the <code>with</code> block do not roll back.</li>
<li>Private mode gives you a separate copy; exclusive mode blocks everyone else.</li>
<li>Refused lock: stop and report, do not roll back someone else's draft.</li></ul></div>
`,hi:`
<p>Do engineers ka ek hi router par ek saath edit karna aise hi adhure changes commit hone ka tareeka hai. Junos mein candidate configuration default roop se shared hota hai: ek session jo kuch usme load karta hai, doosra session use dekhta hai, aur jo pehle commit karta hai woh sab kuch commit kar deta hai. PyEZ aapko ise rokne ke tools deta hai, aur pehla tool lock hai.</p>

<h3>Config object</h3>
<p>Aap ise open device se banate ho: <code>cu = Config(dev)</code>. Ek shortcut bhi hai, <code>dev.bind(cu=Config)</code>, jiske baad object <code>dev.cu</code> par rehta hai. Dono <code>jnpr.junos.utils.config</code> ki wahi class hain. Object nayi connection nahi kholta: woh aapke <code>Device</code> ke maujooda session par NETCONF operations (adv-netconf dekho) bhejta hai.</p>

<h3>lock() aur unlock()</h3>
<p><code>cu.lock()</code> router se candidate ka exclusive use maangta hai. Jab tak aapke paas lock hai, doosre session ka <code>lock()</code> <code>LockError</code> ke saath mana ho jaata hai. <code>cu.unlock()</code> use wapas deta hai. Neeche ki script ek hi router ke do sessions, Alice aur Bob, use karti hai.</p>
<pre class="code"><span class="c"># locks.py - what lock() does, shown with two sessions to the same router</span>
from jnpr.junos.exception import LockError
from jnpr.junos.utils.config import Config

from nkjunos import connect

alice = Config(connect("J1"))
bob = Config(connect("J1"))

print("alice lock:", alice.lock())
try:
    bob.lock()
except LockError as err:
    print("bob lock failed:", err.message)
print("alice unlock:", alice.unlock())
print("bob lock:", bob.lock())
bob.unlock()

alice.lock()
alice.load("set system location building HQ-R9", format="set")
<span class="c">alice.unlock()                      # unlock does NOT discard the change</span>
try:
    bob.lock()
except LockError as err:
    print("bob lock failed:", err.message)
print("bob sees:", bob.diff().strip().splitlines())
bob.rollback()
print("bob lock:", bob.lock())
bob.unlock()</pre>
<pre class="out">AUTO01$ python3 locks.py
alice lock: True
bob lock failed: <span class="hl">configuration database is locked by another session</span>
alice unlock: True
bob lock: True
bob lock failed: <span class="hl">configuration database modified</span>
bob sees: ['[edit system]', '+   location {', '+       building HQ-R9;', '+   }']
bob lock: True</pre>
<p>Do alag inkaar hain, aur doosra zyada kaam ka hai. <b>"locked by another session"</b> seedha case hai: abhi kisi aur ke paas lock hai. <b>"configuration database modified"</b> Junos aapko kisi anjaan ke draft se bacha raha hai: candidate mein pehle se uncommitted changes hain (yahan Alice ne ek line load ki aur commit ya rollback kiye bina unlock kar diya), isliye naya lock mana ho gaya. Dhyan do ki <code>unlock()</code> ne Alice ka change discard nahi kiya. Bob use <code>diff()</code> se padh sakta hai. Agar woh seedha aage badhkar commit kar deta, to Alice ki unreviewed line uske saath live ho jaati.</p>
`+e(`Alice`,`Bob`,`candidate`,`ek shared draft`)+`<p class="cap">Shared mode mein har session ek hi candidate par kaam karta hai. Lock tay karta hai kaun shuru kar sakta hai; "modified" batata hai ki draft saaf nahi hai.</p></div>

<div class="warn"><p><b>Aam galti.</b> <code>LockError</code> pakadkar bina lock ke aage badh jaana. Lock ka inkaar ek jaankari hai: ya to abhi koi wahan kaam kar raha hai, ya kisi ne draft chhod rakha hai. Ruko, report karo ki kaun sa, aur insaan ko faisla karne do. Jo candidate aapne nahi banaya use rollback karke "theek" kabhi mat karo.</p></div>

<h3>with statement</h3>
<p><code>with Config(dev) as cu:</code> enter par lock aur exit par unlock karta hai, exception ke baad bhi. Yeh saaf-suthra hai, par yeh rollback <b>nahi</b> karta. Agar aapka block change load karke bina commit ke khatam ho jaaye, to draft candidate mein rehta hai aur agla session "configuration database modified" se milta hai. Chapter 10 mein is se hua incident dikhaya gaya hai. Explicit <code>try ... finally</code> ko prefer karo, jisme <code>rollback()</code> ho.</p>

<h3>Private aur exclusive modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Code</th><th>Kya milta hai</th></tr>
<tr><td>shared (default)</td><td><code>Config(dev)</code></td><td>Sab ke liye ek candidate. Aapko lock lena hai aur use saaf rakhna hai.</td></tr>
<tr><td>private</td><td><code>with Config(dev, mode="private") as cu:</code></td><td>Candidate ki aapki apni copy. Doosre aapke edits nahi dekhte aur aap unke nahi dekhte. Aapka commit sirf aapke changes lagata hai.</td></tr>
<tr><td>exclusive</td><td><code>with Config(dev, mode="exclusive") as cu:</code></td><td>Poore block ke liye candidate baaki sab ke liye locked rehta hai, jaise CLI mein <code>configure exclusive</code>.</td></tr></table>
<p>Private mode mein shared candidate chhua nahi jaata, jaisa is run mein dikhta hai:</p>
<pre class="code"><span class="c"># priv.py - private mode: your own copy of the candidate</span>
from jnpr.junos.utils.config import Config

from nkjunos import connect

dev = connect("J1")
other = connect("J1")
with Config(dev, mode="private") as p:
    p.load("set system location building PRIV", format="set")
    print("private diff     :", p.diff().strip().replace("\\n", " | "))
    print("shared candidate :", repr(Config(other).diff()))
    p.commit(comment="from a private session")
print("running now      :", other.cli("show configuration system location", warning=False).strip())
dev.close()
other.close()</pre>
<pre class="out">AUTO01$ python3 priv.py
private diff     : [edit system] | +   location { | +       building PRIV; | +   }
shared candidate : <span class="hl">None</span>
running now      : building PRIV;</pre>
<p>Private mode busy shared device par insaan-size ke change ke liye theek hai. Fleet par automation ke liye hum phir bhi lock wala shared candidate pasand karte hain: lock ka inkaar aapko batata hai ki kuch galat hai, jabki private copy use chupchaap chhupa deti.</p>

<div class="exam"><p><b>Exam trap.</b> Kaun sa statement sahi hai: <code>unlock()</code> mere changes discard karta hai, ya nahi karta? Yeh <b>nahi</b> karta. Candidate sirf <code>rollback()</code> (ya commit) se saaf hota hai.</p></div>

<div class="scn"><h4>Ravi ka draft</h4><p>Ravi ne lunch se pehle J2 par NTP change load kiya, meeting mein phans gaya aur chala gaya. Dopahar ki push script ne lock nahi liya, apni lines load ki, commit kiya, aur Ravi ka untested NTP server poore path par live ho gaya. <code>lock()</code> wali script "configuration database modified" se fail hoti aur on-call engineer pehle Ravi se poochta.</p><p><b>Lesson:</b> lock kaagzi karwai nahi hai. Yeh router ka tareeka hai batane ka ki candidate sirf aapka nahi hai.</p></div>

<div class="iv"><p class="q">"lock() kis se bachata hai, aur kis se nahi?"</p><p>Yeh doosre session ko lock lene se rokta hai, aur Junos par jab candidate mein uncommitted changes ho tab bhi mana kar deta hai, jisse main kisi aur ka draft commit karne se bachta hoon. Yeh unlock par changes discard nahi karta, aur us session ko edit karne se nahi rokta jo lock maangta hi nahi. Isliye meri har script lock leti hai aur finally mein chhodti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Config(dev)</code> ya <code>dev.bind(cu=Config)</code> object deta hai; woh khula session reuse karta hai.</li>
<li><code>lock()</code> <code>LockError</code> raise karta hai; message padho: "locked by another session" ya "configuration database modified".</li>
<li><code>unlock()</code> aur <code>with</code> block rollback nahi karte.</li>
<li>Private mode alag copy deta hai; exclusive mode baaki sab ko rokta hai.</li>
<li>Lock mana ho to ruko aur report karo, kisi aur ka draft rollback mat karo.</li></ul></div>
`}};export{t as default};