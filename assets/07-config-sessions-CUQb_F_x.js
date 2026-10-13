var e=String.raw`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Config session life cycle">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="65" y="92" text-anchor="middle" class="svg-ink" font-size="13">open</text><text x="65" y="108" text-anchor="middle" class="svg-muted" font-size="11">pyeapi_1</text>
<rect x="165" y="70" width="110" height="50" rx="8" fill="#fde68a"/><text x="220" y="92" text-anchor="middle" class="svg-ink" font-size="13">stage</text><text x="220" y="108" text-anchor="middle" class="svg-muted" font-size="11">config(...)</text>
<rect x="320" y="70" width="110" height="50" rx="8" fill="#fde68a"/><text x="375" y="92" text-anchor="middle" class="svg-ink" font-size="13">look</text><text x="375" y="108" text-anchor="middle" class="svg-muted" font-size="11">diff()</text>
<rect x="500" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="42" text-anchor="middle" class="svg-ink" font-size="13">commit()</text><text x="565" y="58" text-anchor="middle" class="svg-muted" font-size="11">into running-config</text>
<rect x="500" y="120" width="130" height="50" rx="8" fill="#fecaca"/><text x="565" y="142" text-anchor="middle" class="svg-ink" font-size="13">abort()</text><text x="565" y="158" text-anchor="middle" class="svg-muted" font-size="11">running-config untouched</text>
<line x1="120" y1="95" x2="165" y2="95" stroke="#64748b" stroke-width="2"/><line x1="275" y1="95" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="430" y1="85" x2="500" y2="50" stroke="#64748b" stroke-width="2"/><line x1="430" y1="105" x2="500" y2="140" stroke="#64748b" stroke-width="2"/>
</svg></div>
<p class="cap">Nothing touches the running-config until commit. The diff is your last look before it does.</p>`,t=String.raw`<pre class="code"><span class="c"># d_sess.py - a session by hand, then with pyeapi's helper</span>
import pyeapi

node = pyeapi.connect_to("leaf1")
res = node.run_commands(["configure session RAW1", "vlan 200", "show session-config diffs", "abort"], "text")
print(res[2]["output"])
print(node.api("vlans").get(200))
with node.configure_session() as session:
    session.config(["vlan 210", "name TMP"])
    print(session.name)
    session.abort()
print(node.api("vlans").get(210))</pre>
<pre class="out">AUTO01$ python3 d_sess.py
--- system:/running-config
+++ session:/RAW1-session-config
@@ -9,6 +9,8 @@
 !
 lldp run
 !
+vlan 200
+!
 interface Ethernet1
    no switchport
    ip address 10.99.0.11/24
 
None
pyeapi_1
None</pre>`,n=String.raw`<pre class="code"><span class="c"># guarded.py (Lab 1, step 7) - commit only when the diff is safe</span>
def risky_lines(diff):
    """Added lines that would shut something down."""
    return [line for line in diff.splitlines()
            if line.startswith("+") and not line.startswith("+++") and line[1:].strip() == "shutdown"]


def apply(name, commands):
    node = pyeapi.connect_to(name)
    with node.configure_session() as session:
        session.config(commands)
        diff = session.diff()
        print(diff)
        if risky_lines(diff):
            session.abort()
            print("ABORTED: the candidate shuts something down, running-config untouched")
            return False
        session.commit()
    print("COMMITTED")
    return True</pre>
<pre class="out">AUTO01$ python3 guarded.py bad
--- system:/running-config
+++ session:/pyeapi_1-session-config
@@ -18,6 +18,9 @@
 vlan 130
    name DB
 !
+vlan 140
+   name GUEST
+!
 interface Ethernet1
    no switchport
    ip address 10.99.0.11/24
@@ -26,6 +29,7 @@
    description to-LEAF2
    no switchport
    ip address 10.1.2.1/30
+   <span class="hl">shutdown</span>
 !
 interface Loopback0
    ip address 1.1.1.1/32

ABORTED: the candidate shuts something down, running-config untouched

LEAF1# show configuration sessions
Name           State        User       Terminal
-------------- ------------ ---------- --------
pyeapi_1       aborted      

AUTO01$ python3 guarded.py safe
...
+vlan 140
+   name GUEST
+!
COMMITTED

LEAF1# show configuration sessions
pyeapi_1       committed    </pre>`,r={id:`config-sessions`,h:{en:`Config sessions: stage, diff, commit or abort`,hi:`Config sessions: stage, diff, commit ya abort`},body:{en:`
<p>Chapter 6 ended with a half-applied change. EOS has a built-in cure, the <b>configuration session</b>, which you met at the CLI in <code>eos-ops</code>. pyeapi wraps it in <code>ConfigSession</code>. This chapter is Lab 1, step 7.</p>

<h3>The idea</h3>
`+e+`
<p>A session is a private copy of the configuration. You edit the copy, ask the switch for the <b>difference</b> against the running-config, and only then merge it in. If any line is wrong, or the diff shows something you did not intend, you throw the copy away and the running-config never changed. The commit applies everything at once.</p>

<h3>By hand, then with the helper</h3>
<p>Without a helper a session is only four commands in one request: <code>configure session NAME</code>, your lines, <code>show session-config diffs</code>, then <code>abort</code> or <code>commit</code>. Ask for <code>text</code> because the diff is text.</p>
`+t+`
<p>Look at the diff. Lines starting with <code>+</code> would be added, with <code>-</code> removed, and the surrounding lines are context. After the abort, <code>vlans.get(200)</code> is <code>None</code>: nothing was applied.</p>
<p><code>node.configure_session()</code> returns a <code>ConfigSession</code>. Its useful methods:</p>
<table class="cmp"><tr><th>Method</th><th>Does</th></tr>
<tr><td><code>session.config(commands)</code></td><td>Opens the session if needed and stages the lines (a string or a list)</td></tr>
<tr><td><code>session.diff()</code></td><td>Returns the diff text against the running-config</td></tr>
<tr><td><code>session.commit()</code></td><td>Merges the session into the running-config</td></tr>
<tr><td><code>session.abort()</code></td><td>Discards the session</td></tr>
<tr><td><code>session.name</code></td><td>The session's name, such as <code>pyeapi_1</code></td></tr></table>

<h3>A guard that reads the diff</h3>
<p>The point of <code>diff()</code> is that a program can read it. <code>guarded.py</code> refuses any candidate whose diff adds a <code>shutdown</code> line. The "bad" candidate hides an interface shutdown in the middle of a harmless VLAN change.</p>
`+n+`
<p>On the bad run the VLAN lines were fine but the diff shows <code>+   shutdown</code> under the uplink. The guard aborts, and <code>show configuration sessions</code> confirms <code>aborted</code>. Compare that with chapter 6: here nothing at all reached the running-config, not even the harmless VLAN. On the safe run the same code commits, and the state is <code>committed</code>.</p>
<div class="warn"><p><b>Common mistake.</b> Leaving the decision to the end of the <code>with</code> block. Always call <code>commit()</code> or <code>abort()</code> yourself, inside the block. What the block does on exit differs: in the lab it aborts a session still open, and real pyeapi may commit it. Explicit is the only code that behaves the same everywhere.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab names every helper session <code>pyeapi_1</code>; real pyeapi generates its own name. EOS keeps only a limited number of finished sessions (the lab shows <code>Maximum number of completed sessions: 1</code>), so old ones vanish from the list. EOS also has <code>commit timer HH:MM:SS</code>, a confirmed commit that rolls back by itself unless you confirm in time. The lab does not model it, so it is not exercised here; send it with <code>run_commands</code> on real gear.</p></div>

<h3>Sessions are not locks</h3>
<p>Two sessions can be open together; the lab shows up to five pending. If someone changes the same part of the running-config while your session is open, what the commit does may differ from the diff you reviewed. Keep sessions short: open, stage, diff, decide, close.</p>
<div class="exam"><p><b>Exam trap.</b> A session that raises in the middle (a bad line) is not committed. But a session you simply forget to close stays pending on the switch. Use <code>try/finally</code> so that <code>abort()</code> runs on every error path.</p></div>

<div class="scn"><h4>The shutdown inside the change</h4><p>An engineer merged two change requests into one list. The second contained <code>interface Ethernet2</code> and <code>shutdown</code>, meant for a different switch. Because the script staged everything in a session and printed the diff, the reviewer saw <code>+   shutdown</code> under the live uplink and stopped it. With plain <code>config()</code> the uplink would have gone down at once.</p><p><b>Lesson:</b> let a human or a guard read the diff before commit.</p></div>

<div class="iv"><p class="q">"Why use config sessions from pyeapi instead of node.config()?"</p><p>A session is atomic: the lines are staged in a private copy, I can read the diff, and commit applies it all or abort discards it. With <code>config()</code> a failure leaves the earlier lines applied. The diff also lets a script or reviewer check the change before anything touches the running-config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A config session stages changes in a private copy; nothing changes until <code>commit()</code>.</li>
<li><code>configure_session()</code> gives a <code>ConfigSession</code> with <code>config</code>, <code>diff</code>, <code>commit</code> and <code>abort</code>.</li>
<li><code>diff()</code> is text with <code>+</code> and <code>-</code> lines; a program can screen it for risky lines.</li>
<li>Call <code>commit()</code> or <code>abort()</code> explicitly; do not rely on what <code>with</code> does on exit.</li>
<li>Use <code>try/finally</code> so no session is left pending.</li>
</ul></div>
`,hi:`
<p>Chapter 6 aadhe-lage change par khatam hua tha. EOS ke paas iska built-in ilaaj hai, <b>configuration session</b>, jo aap <code>eos-ops</code> mein CLI par mil chuke ho. pyeapi use <code>ConfigSession</code> mein lapet deta hai. Yeh chapter Lab 1 ka step 7 hai.</p>

<h3>Idea</h3>
`+e+`
<p>Session configuration ki private copy hai. Aap copy edit karte ho, switch se running-config ke saath <b>difference</b> maangte ho, aur tabhi merge karte ho. Koi line galat ho, ya diff mein kuch ankhaha dikhe, to copy phenk do aur running-config kabhi badli hi nahi. Commit sab ek saath lagata hai.</p>

<h3>Haath se, phir helper se</h3>
<p>Helper ke bina session ek request mein bas chaar commands hai: <code>configure session NAME</code>, aapki lines, <code>show session-config diffs</code>, phir <code>abort</code> ya <code>commit</code>. <code>text</code> maango kyunki diff text hai.</p>
`+t+`
<p>Diff dekho. <code>+</code> se shuru lines jodi jaengi, <code>-</code> wali hataai jaengi, aur aas-paas ki lines context hain. Abort ke baad <code>vlans.get(200)</code> <code>None</code> hai: kuch laga hi nahi.</p>
<p><code>node.configure_session()</code> ek <code>ConfigSession</code> lautata hai. Kaam ke methods:</p>
<table class="cmp"><tr><th>Method</th><th>Kya karta hai</th></tr>
<tr><td><code>session.config(commands)</code></td><td>Zaroorat par session kholta hai aur lines stage karta hai (string ya list)</td></tr>
<tr><td><code>session.diff()</code></td><td>Running-config ke against diff text lautata hai</td></tr>
<tr><td><code>session.commit()</code></td><td>Session ko running-config mein merge karta hai</td></tr>
<tr><td><code>session.abort()</code></td><td>Session discard karta hai</td></tr>
<tr><td><code>session.name</code></td><td>Session ka naam, jaise <code>pyeapi_1</code></td></tr></table>

<h3>Diff padhne wala guard</h3>
<p><code>diff()</code> ka matlab yeh hai ki program use padh sakta hai. <code>guarded.py</code> aise candidate ko mana kar deta hai jiske diff mein <code>shutdown</code> line judti ho. "Bad" candidate harmless VLAN change ke beech mein interface shutdown chhupa deta hai.</p>
`+n+`
<p>Bad run mein VLAN lines theek thi par diff uplink ke neeche <code>+   shutdown</code> dikhata hai. Guard abort karta hai, aur <code>show configuration sessions</code> <code>aborted</code> confirm karta hai. Chapter 6 se compare karo: yahan running-config mein kuch bhi nahi pahuncha, harmless VLAN bhi nahi. Safe run mein wahi code commit karta hai, aur state <code>committed</code> hai.</p>
<div class="warn"><p><b>Common mistake.</b> Faisla <code>with</code> block ke ant par chhod dena. <code>commit()</code> ya <code>abort()</code> hamesha khud, block ke andar, bulao. Block exit par kya karta hai woh alag hai: lab mein khula session abort hota hai, aur asli pyeapi use commit kar sakta hai. Explicit code hi har jagah ek jaisa chalta hai.</p></div>
<div class="note"><p><b>Lab vs real gear.</b> Lab har helper session ka naam <code>pyeapi_1</code> rakhta hai; asli pyeapi apna naam banata hai. EOS limited number mein finished sessions rakhta hai (lab mein <code>Maximum number of completed sessions: 1</code>), isliye purane list se gayab ho jaate hain. EOS mein <code>commit timer HH:MM:SS</code> bhi hai, ek confirmed commit jo samay par confirm na karo to khud rollback ho jaata hai. Lab use model nahi karta, isliye yahan nahi chalaya; asli gear par <code>run_commands</code> se bhejo.</p></div>

<h3>Sessions lock nahi hain</h3>
<p>Do sessions saath khuli ho sakti hain; lab paanch tak pending dikhata hai. Session khuli hone ke dauran kisi ne running-config ka wahi hissa badla to commit jo karega woh aapke dekhe diff se alag ho sakta hai. Sessions chhoti rakho: kholo, stage karo, diff dekho, faisla karo, band karo.</p>
<div class="exam"><p><b>Exam trap.</b> Beech mein raise karne wala session (bura line) commit nahi hota. Par jo session aap bas band karna bhool jao woh switch par pending rehta hai. <code>try/finally</code> lagao taaki har error path par <code>abort()</code> chale.</p></div>

<div class="scn"><h4>Change ke andar chhupa shutdown</h4><p>Ek engineer ne do change requests ek list mein mila di. Doosri mein <code>interface Ethernet2</code> aur <code>shutdown</code> tha, jo kisi aur switch ke liye tha. Script ne sab session mein stage kiya aur diff print kiya, isliye reviewer ne live uplink ke neeche <code>+   shutdown</code> dekha aur rok diya. Seedhe <code>config()</code> se uplink turant gir jaata.</p><p><b>Lesson:</b> commit se pehle insaan ya guard ko diff padhne do.</p></div>

<div class="iv"><p class="q">"pyeapi se node.config() ki jagah config sessions kyun?"</p><p>Session atomic hai: lines private copy mein stage hoti hain, diff padh sakta hoon, aur commit sab lagata hai ya abort sab hata deta hai. <code>config()</code> mein failure par pehli lines lagi reh jaati hain. Diff se script ya reviewer running-config chhoone se pehle change check kar leta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Config session private copy mein change stage karta hai; <code>commit()</code> tak kuch nahi badalta.</li>
<li><code>configure_session()</code> <code>config</code>, <code>diff</code>, <code>commit</code> aur <code>abort</code> wala <code>ConfigSession</code> deta hai.</li>
<li><code>diff()</code> <code>+</code> aur <code>-</code> lines wala text hai; program risky lines screen kar sakta hai.</li>
<li><code>commit()</code> ya <code>abort()</code> explicitly bulao; <code>with</code> ke exit par bharosa mat karo.</li>
<li><code>try/finally</code> se koi session pending mat chhodo.</li>
</ul></div>
`}};export{r as default};