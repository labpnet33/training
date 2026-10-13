var e=`<pre class="code"><span class="c"># diffcheck.py - diff(), pdiff(), commit_check() and the two errors they raise</span>
from jnpr.junos.exception import CommitError, ConfigLoadError
from jnpr.junos.utils.config import Config

from nkjunos import connect

dev = connect("J1")
cu = Config(dev)
cu.lock()
print("empty candidate:", repr(cu.diff()))
cu.load("set system location building B1", format="set")
print("text of diff   :", repr(cu.diff()))
cu.pdiff()
print("commit_check   :", cu.commit_check())
cu.rollback()

try:
    cu.load("set interfaces ge-0/0/9 bogus 1", format="set")
except ConfigLoadError as err:
    print("ConfigLoadError.message   :", err.message)
    print("ConfigLoadError.rpc_error :", err.rpc_error)

cu.load("set protocols bgp group IBGP import NO-SUCH-POLICY", format="set")
print("the load itself was fine; the diff:", cu.diff().strip().replace("\\n", " | "))
try:
    cu.commit_check()
except CommitError as err:
    print("CommitError:", err)
    print("CommitError.message:", err.message)
cu.rollback()
cu.unlock()
dev.close()</pre>`,t=`<pre class="out">AUTO01$ python3 diffcheck.py
empty candidate: <span class="hl">None</span>
text of diff   : '\\n[edit system]\\n+   location {\\n+       building B1;\\n+   }\\n'

[edit system]
+   location {
+       building B1;
+   }

commit_check   : True
ConfigLoadError.message   : syntax error
ConfigLoadError.rpc_error : {'severity': 'error', 'bad_element': 'bogus', 'message': 'syntax error', 'edit_path': '[edit interfaces ge-0/0/9]', 'type': None, 'tag': None}
the load itself was fine; the diff: [edit protocols bgp group IBGP] | +   import NO-SUCH-POLICY;
CommitError: CommitError(edit_path: [edit protocols bgp], bad_element: group IBGP, message: <span class="hl">Policy error: Policy NO-SUCH-POLICY referenced but not defined</span>)
CommitError.message: Policy error: Policy NO-SUCH-POLICY referenced but not defined</pre>`,n=`<pre class="code"><span class="c"># dryrun.py - show what the rendered change WOULD do, then leave the device exactly as found</span>
import sys

from jnpr.junos.utils.config import Config

from nkjunos import connect
from render import render

name = sys.argv[1]
dev = connect(name)
cu = Config(dev)
cu.lock()
try:
    cu.load(render(name), format="set", merge=True)
    diff = cu.diff()
    print(diff if diff else "no difference")
    cu.commit_check()
    print("commit check: passed")
finally:
    cu.rollback()
    cu.unlock()
    dev.close()</pre>`,r=`<pre class="out">AUTO01$ python3 dryrun.py J1

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

commit check: passed</pre>`,i={id:`diff-and-check`,h:{en:`Diff, commit check and errors`,hi:`Diff, commit check aur errors`},body:{en:`
<p>A safe push is built from three questions asked <b>before</b> anything is committed. What will change? Will the device accept it? And if something is wrong, which line is it? PyEZ answers them with <code>diff()</code>, <code>commit_check()</code> and the exceptions. This is the same dry-run idea you met in <code>py-safepush</code>, now done on the router itself, where the router's own parser does the checking.</p>

<h3>diff(): the proof of what will happen</h3>
<p><code>cu.diff()</code> compares the candidate with the running configuration and returns the text of the patch. It has two properties that every script depends on.</p>
<ul>
<li><b>It returns <code>None</code> when nothing differs</b>, not an empty string. Test with <code>if diff is None</code> (or <code>if not diff</code>), and treat it as "nothing to do": do not commit, do not log a change.</li>
<li><b>The text starts with a newline</b> and uses the familiar <code>[edit ...]</code>, <code>+</code> and <code>-</code> markers. <code>cu.pdiff()</code> is the same thing printed for you; use <code>diff()</code> in scripts, since you want the string to log and to store with the ticket.</li></ul>
<p>An empty diff is a result, not an error. An idempotent push is one that, run twice, says "nothing to change" the second time.</p>

<h3>commit_check(): the router's opinion</h3>
<p>Loading text only checks <b>syntax</b>. Whether the whole candidate makes sense is decided at commit time: does every referenced policy exist, is every interface valid, is the address plan consistent? <code>cu.commit_check()</code> runs that validation without committing. It returns <code>True</code> when the candidate is good and raises <code>CommitError</code> when it is not.</p>
`+e+`
`+t+`
<p>Look at the two failures, because they come from different stages and carry different details.</p>
<table class="cmp"><tr><th>When</th><th>Exception</th><th>What it means</th><th>Useful attributes</th></tr>
<tr><td><code>load()</code></td><td><code>ConfigLoadError</code></td><td>The text is not valid configuration (syntax, missing argument)</td><td><code>.message</code>, <code>.rpc_error</code> (dict with <code>bad_element</code> and <code>edit_path</code>)</td></tr>
<tr><td><code>commit_check()</code> or <code>commit()</code></td><td><code>CommitError</code></td><td>The syntax is fine but the configuration is inconsistent (policy not defined)</td><td><code>.message</code>, and <code>edit_path</code> and <code>bad_element</code> in its printed text</td></tr>
<tr><td><code>lock()</code></td><td><code>LockError</code></td><td>Someone else has the database, or it holds uncommitted changes</td><td><code>.message</code></td></tr></table>
<p>Note that the bad policy name loaded without complaint: the diff shows <code>import NO-SUCH-POLICY;</code> happily. Only <code>commit_check()</code> noticed. A dry run that stops at <code>load()</code> and <code>diff()</code> would call this change safe. That is why the dry run must include the check.</p>

<h3>The complete dry run</h3>
<p>Lab 1 asks you to build one: a script that renders the template for a device, loads it, prints the diff, runs the check, and then <b>always</b> rolls back and unlocks, so the device is left exactly as it was found.</p>
`+n+`
`+r+`
<p>The <code>try</code>/<code>finally</code> is the whole point. The load and the check can raise, and a script that dies halfway while holding a lock and a half-loaded candidate is the cause of most "database modified" tickets (Lab 2 reproduces exactly that). The <code>finally</code> block runs on success, on <code>ConfigLoadError</code> and on <code>CommitError</code>; it discards the candidate with <code>rollback()</code> (no argument means rollback 0, the running configuration) and releases the lock.</p>

<div class="warn"><p><b>A dry run is only a dry run if it rolls back.</b> Loading and diffing change the shared candidate. If your "preview" script ends without <code>rollback()</code>, the next person's <code>lock()</code> fails with "configuration database modified" and the next commit by anyone includes your lines. Always clean up in <code>finally</code>.</p></div>

<div class="note"><p><b>Lab note.</b> In the lab <code>commit_check()</code> catches missing policies and similar references. It does not model every check a real Junos box does (for example some hardware or licence checks). On real devices a passing check is a strong signal, not a promise, which is exactly why the next two chapters add commit confirmed and a health gate.</p></div>

<div class="exam"><p><b>Exam trap.</b> "<code>cu.diff()</code> returns an empty string when there are no changes." It returns <code>None</code>. Code like <code>diff.strip()</code> on it raises <code>AttributeError</code> on the exact run where nothing needed doing.</p></div>

<div class="scn"><h4>The preview that broke production</h4><p>A teammate wrote a "preview" script: lock, load, print the diff, exit. No rollback. The next morning the scheduled push failed on every router with "configuration database modified", and on two routers where the lock was not enforced a normal commit shipped the unreviewed preview lines as well.</p><p><b>Lesson:</b> every code path that loads must end with rollback and unlock, and the safest shape is a <code>finally</code> block.</p></div>

<div class="iv"><p class="q">"How do you verify a config change in PyEZ without committing it?"</p><p>Lock the candidate, load the change, read <code>diff()</code> to see exactly what would change (None means nothing), then <code>commit_check()</code> so the router validates the whole candidate. Wrap it in try/finally so it always rolls back and unlocks. Syntax errors surface as ConfigLoadError at load, consistency errors as CommitError at the check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>diff()</code> returns <code>None</code> when nothing differs; treat it as "no change needed".</li>
<li>Load checks syntax; <code>commit_check()</code> checks the whole candidate and raises <code>CommitError</code>.</li>
<li><code>ConfigLoadError</code> has <code>.message</code> and <code>.rpc_error</code> with the bad element and path.</li>
<li>A dry run must end with <code>rollback()</code> and <code>unlock()</code> in a <code>finally</code>.</li></ul></div>
`,hi:`
<p>Safe push teen sawaalon se bana hai jo kuch bhi commit hone se <b>pehle</b> poochhe jaate hain. Kya badlega? Kya device ise accept karega? Aur agar kuch galat hai to kaun si line hai? PyEZ inka jawab <code>diff()</code>, <code>commit_check()</code> aur exceptions se deta hai. Yeh wahi dry-run idea hai jo aapne <code>py-safepush</code> mein dekha tha, ab router par hi, jahan router ka apna parser checking karta hai.</p>

<h3>diff(): jo hoga uska saboot</h3>
<p><code>cu.diff()</code> candidate ko running configuration se compare karta hai aur patch ka text lautata hai. Iski do khaasiyatein hain jin par har script depend karti hai.</p>
<ul>
<li><b>Kuch alag na ho to yeh <code>None</code> lautata hai</b>, empty string nahi. <code>if diff is None</code> (ya <code>if not diff</code>) se test karo, aur ise "kuch karna nahi" maano: commit mat karo, change log mat karo.</li>
<li><b>Text ek newline se shuru hota hai</b> aur jaane-pehchaane <code>[edit ...]</code>, <code>+</code> aur <code>-</code> markers use karta hai. <code>cu.pdiff()</code> wahi cheez aapke liye print kar deta hai; scripts mein <code>diff()</code> use karo, kyunki aapko string chahiye jise log karein aur ticket ke saath rakhein.</li></ul>
<p>Empty diff ek result hai, error nahi. Idempotent push woh hai jo do baar chalane par doosri baar "nothing to change" kehta hai.</p>

<h3>commit_check(): router ki raay</h3>
<p>Text load karna sirf <b>syntax</b> check karta hai. Poora candidate samajh mein aata hai ya nahi yeh commit ke waqt tay hota hai: kya har referenced policy maujood hai, kya har interface valid hai, kya address plan consistent hai? <code>cu.commit_check()</code> wahi validation bina commit kiye chalata hai. Candidate theek ho to <code>True</code> deta hai, nahi to <code>CommitError</code> raise karta hai.</p>
`+e+`
`+t+`
<p>Dono failures dekho, kyunki woh alag stages se aati hain aur unki details alag hain.</p>
<table class="cmp"><tr><th>Kab</th><th>Exception</th><th>Matlab</th><th>Kaam ke attributes</th></tr>
<tr><td><code>load()</code></td><td><code>ConfigLoadError</code></td><td>Text valid configuration nahi hai (syntax, missing argument)</td><td><code>.message</code>, <code>.rpc_error</code> (dict jisme <code>bad_element</code> aur <code>edit_path</code>)</td></tr>
<tr><td><code>commit_check()</code> ya <code>commit()</code></td><td><code>CommitError</code></td><td>Syntax theek hai par configuration inconsistent hai (policy defined nahi)</td><td><code>.message</code>, aur uske printed text mein <code>edit_path</code> aur <code>bad_element</code></td></tr>
<tr><td><code>lock()</code></td><td><code>LockError</code></td><td>Database kisi aur ke paas hai, ya usme uncommitted changes hain</td><td><code>.message</code></td></tr></table>
<p>Dhyan do ki galat policy naam bina shikayat ke load ho gaya: diff khushi se <code>import NO-SUCH-POLICY;</code> dikha raha hai. Sirf <code>commit_check()</code> ne notice kiya. Jo dry run <code>load()</code> aur <code>diff()</code> par ruk jaata hai woh is change ko safe bata deta. Isiliye dry run mein check shaamil hona chahiye.</p>

<h3>Poora dry run</h3>
<p>Lab 1 aapse ek banwata hai: ek script jo device ka template render kare, load kare, diff print kare, check chalaye, aur phir <b>hamesha</b> rollback aur unlock kare, taaki device bilkul waisa hi chhoda jaye jaisa mila tha.</p>
`+n+`
`+r+`
<p><code>try</code>/<code>finally</code> hi poora point hai. Load aur check raise kar sakte hain, aur jo script lock aur aadha-loaded candidate lekar beech mein mar jaati hai woh zyaadatar "database modified" tickets ki wajah hai (Lab 2 bilkul yahi reproduce karta hai). <code>finally</code> block success par, <code>ConfigLoadError</code> par aur <code>CommitError</code> par chalta hai; woh <code>rollback()</code> se candidate discard karta hai (bina argument ke matlab rollback 0, running configuration) aur lock chhod deta hai.</p>

<div class="warn"><p><b>Dry run tabhi dry run hai jab woh rollback kare.</b> Load aur diff shared candidate ko badal dete hain. Agar aapki "preview" script <code>rollback()</code> ke bina khatam hoti hai, to agle insaan ka <code>lock()</code> "configuration database modified" se fail hota hai aur kisi ka bhi agla commit aapki lines bhi le jaata hai. Cleanup hamesha <code>finally</code> mein karo.</p></div>

<div class="note"><p><b>Lab note.</b> Lab mein <code>commit_check()</code> missing policies jaise references pakadta hai. Yeh real Junos box ke har check ko model nahi karta (jaise kuch hardware ya licence checks). Real devices par passing check ek majboot signal hai, vaada nahi, isiliye agle do chapters commit confirmed aur health gate jodte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "<code>cu.diff()</code> changes na hone par empty string lautata hai." Woh <code>None</code> lautata hai. Us par <code>diff.strip()</code> jaisa code usi run mein <code>AttributeError</code> deta hai jisme kuch karna hi nahi tha.</p></div>

<div class="scn"><h4>Preview jisne production tod diya</h4><p>Ek teammate ne "preview" script likhi: lock, load, diff print, exit. Rollback nahi. Agli subah scheduled push har router par "configuration database modified" se fail hua, aur do routers par jahan lock enforce nahi tha wahan normal commit ne bina review wali preview lines bhi bhej deen.</p><p><b>Lesson:</b> load karne wala har code path rollback aur unlock par khatam hona chahiye, aur sabse safe shape <code>finally</code> block hai.</p></div>

<div class="iv"><p class="q">"PyEZ mein config change ko bina commit kiye kaise verify karoge?"</p><p>Candidate lock karo, change load karo, <code>diff()</code> padho ki exactly kya badlega (None matlab kuch nahi), phir <code>commit_check()</code> taaki router poora candidate validate kare. Sab kuch try/finally mein rakho taaki hamesha rollback aur unlock ho. Syntax errors load par ConfigLoadError ke roop mein aati hain, consistency errors check par CommitError ke roop mein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kuch alag na ho to <code>diff()</code> <code>None</code> lautata hai; ise "change ki zaroorat nahi" maano.</li>
<li>Load syntax check karta hai; <code>commit_check()</code> poora candidate check karta hai aur <code>CommitError</code> raise karta hai.</li>
<li><code>ConfigLoadError</code> mein <code>.message</code> aur <code>.rpc_error</code> hota hai jisme bad element aur path hai.</li>
<li>Dry run <code>finally</code> mein <code>rollback()</code> aur <code>unlock()</code> par khatam hona chahiye.</li></ul></div>
`}};export{i as default};