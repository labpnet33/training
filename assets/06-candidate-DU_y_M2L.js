var e={id:`candidate`,h:{en:`The candidate datastore: lock, edit, compare, validate, commit`,hi:`Candidate datastore: lock, edit, compare, validate, commit`},body:{en:`
<p>On IOS XE the edit you send is live at once. Junos works differently, and so does every device that advertises <code>:candidate</code>: edits go to a draft copy of the configuration, and nothing happens on the network until you <b>commit</b>. That gives you time to look at the result, check it, and throw it away. This chapter is the workflow; the next one adds the safety net.</p>

<h3>An analogy: the shopping cart</h3>
<p>You fill a cart (edit the candidate), look at the receipt before paying (compare), let the shop check the stock (validate), and pay (commit). If you change your mind you empty the cart (discard). While you stand at the till nobody else should add things to your cart, and that is the lock.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Candidate workflow">
<rect x="8" y="30" width="86" height="50" rx="8" fill="#bae6fd"/><text x="51" y="60" text-anchor="middle" class="svg-ink" font-size="13">lock</text>
<rect x="116" y="30" width="86" height="50" rx="8" fill="#ddd6fe"/><text x="159" y="55" text-anchor="middle" class="svg-ink" font-size="13">edit_config</text><text x="159" y="71" text-anchor="middle" class="svg-muted" font-size="10">target candidate</text>
<rect x="224" y="30" width="86" height="50" rx="8" fill="#fde68a"/><text x="267" y="55" text-anchor="middle" class="svg-ink" font-size="13">compare</text><text x="267" y="71" text-anchor="middle" class="svg-muted" font-size="10">read the diff</text>
<rect x="332" y="30" width="86" height="50" rx="8" fill="#fde68a"/><text x="375" y="60" text-anchor="middle" class="svg-ink" font-size="13">validate</text>
<rect x="440" y="30" width="86" height="50" rx="8" fill="#bbf7d0"/><text x="483" y="60" text-anchor="middle" class="svg-ink" font-size="13">commit</text>
<rect x="548" y="30" width="84" height="50" rx="8" fill="#bae6fd"/><text x="590" y="60" text-anchor="middle" class="svg-ink" font-size="13">unlock</text>
<line x1="94" y1="55" x2="116" y2="55" stroke="#64748b" stroke-width="2"/><line x1="202" y1="55" x2="224" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="332" y2="55" stroke="#64748b" stroke-width="2"/><line x1="418" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/><line x1="526" y1="55" x2="548" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="224" y="112" width="302" height="40" rx="8" fill="#fecaca"/><text x="375" y="137" text-anchor="middle" class="svg-ink" font-size="13">anything wrong: discard_changes, then unlock</text>
<line x1="267" y1="80" x2="267" y2="112" stroke="#dc2626" stroke-width="2"/><line x1="375" y1="80" x2="375" y2="112" stroke="#dc2626" stroke-width="2"/>
<text x="320" y="16" text-anchor="middle" class="svg-muted" font-size="12">nothing is live until commit</text>
</svg></div>
<p class="cap">The candidate workflow. Only the commit changes what the device is running.</p>

<h3>The steps and their ncclient calls</h3>
<table class="cmp"><tr><th>Step</th><th>Call</th><th>What it does</th></tr>
<tr><td>lock</td><td><code>m.lock("candidate")</code></td><td>Reserves the candidate for this session. Another session's lock gets <code>lock-denied</code>.</td></tr>
<tr><td>edit</td><td><code>m.edit_config(target="candidate", config=...)</code></td><td>Changes the draft only.</td></tr>
<tr><td>compare</td><td><code>m.compare_configuration()</code></td><td>Junos extra: the difference between candidate and running, as text.</td></tr>
<tr><td>validate</td><td><code>m.validate(source="candidate")</code></td><td>Checks syntax and consistency without applying. Needs <code>:validate</code>.</td></tr>
<tr><td>commit</td><td><code>m.commit()</code></td><td>Copies the candidate into running. Needs <code>:candidate</code>.</td></tr>
<tr><td>discard</td><td><code>m.discard_changes()</code></td><td>Resets the candidate to equal running.</td></tr>
<tr><td>unlock</td><td><code>m.unlock("candidate")</code></td><td>Releases the lock. Closing the session releases it too.</td></tr></table>

<h3>The lock, and why you want it</h3>
<p>The candidate is one shared draft. If two scripts edit it without locks, the first <code>commit</code> publishes both sets of edits, including the half-finished ones of the other script. <code>lock</code> says "the draft is mine until I let go": any other session that tries gets a <code>lock-denied</code> error that names the session that holds it.</p>
<p>ncclient gives you a context manager for the pair <code>lock</code> and <code>unlock</code>: <code>with m.locked("candidate"):</code>. The <code>unlock</code> runs even if your code in the block raises an exception.</p>
<pre class="code"><span class="c"># lockexc.py - what does the 'with' block do if my own code fails?</span>
from ncutil import connect

with connect("J1") as m, connect("J1") as other:
    try:
        with m.locked("candidate"):
            raise RuntimeError("something in my own code broke")
    except RuntimeError as err:
        print("caught:", err)
    print("lock was released by with:", other.lock("candidate").ok)</pre>
<pre class="out">AUTO01$ python3 lockexc.py
caught: something in my own code broke
lock was released by with: <span class="hl">True</span></pre>
<p>The block failed, the exception reached our <code>except</code>, and still the lock was released: a second session could take it. Never write the pair as separate <code>lock</code> and <code>unlock</code> lines without <code>try/finally</code>; one missed unlock can lock everybody else out until the session ends. Chapter 10 shows exactly that.</p>

<h3>One session, step by step</h3>
<p>This script uses two sessions on J1, <code>m</code> and <code>other</code>, to show the lock, then walks the whole workflow on a spare port <code>ge-0/0/2</code> and discards the result.</p>
<pre class="code"><span class="c"># cand.py - two sessions, one candidate</span>
from ncclient.operations import RPCError
from ncutil import connect

FLT = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;"
CFG = """&lt;config&gt;&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;
  &lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;description&gt;CAND-DEMO&lt;/description&gt;
&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;&lt;/config&gt;"""


def desc(m, source):
    return m.get_config(source=source, filter=("subtree", FLT)).data.findtext(".//{*}description")


with connect("J1") as m, connect("J1") as other:
    print("sessions:", m.session_id, other.session_id)
    with m.locked("candidate"):
        try:
            other.lock("candidate")
        except RPCError as err:
            print("other cannot lock:", err.tag, "-", err.message)
        m.edit_config(target="candidate", config=CFG)
        print("candidate reads:", desc(m, "candidate"))
        print("running reads:  ", desc(m, "running"))
        print(m.compare_configuration().xpath("//configuration-output")[0].text.strip())
        print("validate ok:", m.validate(source="candidate").ok)
        m.discard_changes()
        print("after discard:  ", desc(m, "candidate"))
    print("lock free again:", other.lock("candidate").ok)</pre>
<pre class="out">AUTO01$ python3 cand.py
sessions: 1633 1650
other cannot lock: <span class="hl">lock-denied - configuration database is locked by another session</span>
candidate reads: <span class="hl">CAND-DEMO</span>
running reads:   <span class="hl">None</span>
[edit interfaces]
+   ge-0/0/2 {
+       description CAND-DEMO;
+   }
validate ok: True
after discard:   None
lock free again: True</pre>
<ul>
<li>The two sessions have ids 1633 and 1650: sessions that existed in between belong to other users or earlier runs.</li>
<li><code>other.lock</code> fails with <code>lock-denied</code> while <code>m</code> holds it.</li>
<li>The candidate shows the new description but <b>running still says None</b>: the draft and the live configuration are different things.</li>
<li><code>compare_configuration()</code> returns the difference in Junos display format; <code>+</code> marks what a commit would add and <code>-</code> what it would remove. Read it before every commit: it is the one place where you see exactly what will change.</li>
<li><code>validate</code> says ok; <code>discard_changes</code> empties the cart; the lock is free again after the <code>with</code> block.</li></ul>

<h3>Applying it: the Junos push</h3>
<p>Lab 1, step 4 writes <code>push_junos</code>. Everything above is in it: lock, a <code>discard_changes</code> to start from a clean draft, the edit, the diff printed for the log, validate, and a commit. The commit here is <code>confirmed=True</code>, which the next chapter explains. The function does not confirm; its caller does, once it has checked the result.</p>
<pre class="code"><span class="c"># ifchange.py, part 3 (Lab 1, step 4) - the Junos push, up to the commit</span>
def junos_config(ifname, description, address):
    return """&lt;config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;
    &lt;name&gt;%s&lt;/name&gt;
    &lt;description&gt;%s&lt;/description&gt;
    &lt;unit&gt;&lt;name&gt;0&lt;/name&gt;&lt;family&gt;&lt;inet nc:operation="replace"&gt;
      &lt;address&gt;&lt;name&gt;%s&lt;/name&gt;&lt;/address&gt;
    &lt;/inet&gt;&lt;/family&gt;&lt;/unit&gt;
  &lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;
&lt;/config&gt;""" % (ifname, description, address)


def push_junos(m, ifname, description, address):
    """Junos: candidate, validate, COMMIT CONFIRMED (60 s). The caller must confirm with m.commit()."""
    with m.locked("candidate"):
        m.discard_changes()
        m.edit_config(target="candidate", config=junos_config(ifname, description, address))
        print(m.compare_configuration().xpath("//configuration-output")[0].text.strip())
        m.validate(source="candidate")
        m.commit(confirmed=True, timeout="60")</pre>
<p>The interface address uses <code>nc:operation="replace"</code> on the <code>inet</code> element. That is on purpose: replacing the whole <code>inet</code> block removes the old address, so the interface does not end up with two. With plain merge, Junos would add the new address as a second one.</p>
<pre class="code"><span class="c"># try_j1.py</span>
from ifchange import push_junos, read_interface
from ncutil import connect

with connect("J1") as m:
    push_junos(m, "ge-0/0/1", "TO-BLR-CORE", "172.16.20.5/30")
    print(read_interface(m, "junos", "ge-0/0/1"))
    m.commit()                       <span class="c"># the confirming commit (next chapter)</span>
    print("confirmed")</pre>
<pre class="out">AUTO01$ python3 try_j1.py
[edit interfaces ge-0/0/1]
-   description LINK-TO-PUN-OLD;
+   description TO-BLR-CORE;
[edit interfaces ge-0/0/1 unit 0 family inet]
-   address 172.16.20.1/30;
+   address 172.16.20.5/30;
('TO-BLR-CORE', <span class="hl">'172.16.20.5/30'</span>)
confirmed</pre>
<p>The diff shows exactly the two changes: the description and the address. The read-back shows them in the data. Only then does <code>m.commit()</code> make the change permanent.</p>

<div class="warn"><p><b>Common mistake.</b> Editing the candidate without the lock, or without <code>discard_changes</code> first. Someone else's unfinished edit, or the leftover of your last failed run, sits in the draft and rides along with your commit. Lock first, discard to start clean, then edit.</p></div>
<div class="exam"><p><b>Exam trap.</b> Closing the NETCONF session releases its lock, but it does <b>not</b> by itself undo uncommitted candidate edits on every platform. Do not rely on the session ending to clean up; call <code>discard_changes()</code>.</p></div>

<div class="scn"><h4>Two scripts, one draft</h4><p>At 02:00 a backup job and a VLAN change job both opened J1. Neither locked the candidate. The change job was still editing when the backup job's helper called <code>commit</code> for an unrelated comment change. The half-built VLAN configuration went live for 40 seconds. With <code>with m.locked("candidate")</code> in both scripts, the second would have received <code>lock-denied</code> and waited.</p><p><b>Lesson:</b> the candidate is shared; the lock is how you own it.</p></div>

<div class="iv"><p class="q">"Why lock the candidate datastore before editing?"</p><p>The candidate is shared by every session. Without a lock, one session's commit would publish another session's half-finished edits. Locking gives exclusive use; others get lock-denied. I use <code>with m.locked("candidate")</code> so the lock is released even when my code fails, and I start with <code>discard_changes</code> so no old edits remain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>With <code>:candidate</code>, edits change a draft and nothing is live until <code>commit()</code>.</li>
<li>Use <code>with m.locked("candidate"):</code>; discard first; compare before you commit.</li>
<li><code>compare_configuration()</code> (Junos) shows the diff; <code>validate()</code> checks without applying.</li>
<li>A second session that tries to lock gets <code>lock-denied</code> with the owner's session-id.</li>
<li>For a replaced block such as an IPv4 address use <code>nc:operation="replace"</code> to avoid two addresses.</li>
</ul></div>
`,hi:`
<p>IOS XE par aap jo edit bhejte ho woh turant live hota hai. Junos alag tarah se kaam karta hai, aur waise hi har woh device jo <code>:candidate</code> advertise karta hai: edits configuration ki draft copy mein jaate hain, aur network par kuch nahi hota jab tak aap <b>commit</b> na karo. Isse aapko result dekhne, check karne aur phenk dene ka samay milta hai. Yeh chapter workflow hai; agla chapter safety net jodta hai.</p>

<h3>Analogy: shopping cart</h3>
<p>Aap cart bharte ho (candidate edit), paisa dene se pehle receipt dekhte ho (compare), dukaan se stock check karwate ho (validate), aur pay karte ho (commit). Man badal jaye to cart khaali kar dete ho (discard). Jab aap till par khade ho tab koi aur aapke cart mein cheezein na daale, wahi lock hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Candidate workflow">
<rect x="8" y="30" width="86" height="50" rx="8" fill="#bae6fd"/><text x="51" y="60" text-anchor="middle" class="svg-ink" font-size="13">lock</text>
<rect x="116" y="30" width="86" height="50" rx="8" fill="#ddd6fe"/><text x="159" y="55" text-anchor="middle" class="svg-ink" font-size="13">edit_config</text><text x="159" y="71" text-anchor="middle" class="svg-muted" font-size="10">target candidate</text>
<rect x="224" y="30" width="86" height="50" rx="8" fill="#fde68a"/><text x="267" y="55" text-anchor="middle" class="svg-ink" font-size="13">compare</text><text x="267" y="71" text-anchor="middle" class="svg-muted" font-size="10">read the diff</text>
<rect x="332" y="30" width="86" height="50" rx="8" fill="#fde68a"/><text x="375" y="60" text-anchor="middle" class="svg-ink" font-size="13">validate</text>
<rect x="440" y="30" width="86" height="50" rx="8" fill="#bbf7d0"/><text x="483" y="60" text-anchor="middle" class="svg-ink" font-size="13">commit</text>
<rect x="548" y="30" width="84" height="50" rx="8" fill="#bae6fd"/><text x="590" y="60" text-anchor="middle" class="svg-ink" font-size="13">unlock</text>
<line x1="94" y1="55" x2="116" y2="55" stroke="#64748b" stroke-width="2"/><line x1="202" y1="55" x2="224" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="332" y2="55" stroke="#64748b" stroke-width="2"/><line x1="418" y1="55" x2="440" y2="55" stroke="#64748b" stroke-width="2"/><line x1="526" y1="55" x2="548" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="224" y="112" width="302" height="40" rx="8" fill="#fecaca"/><text x="375" y="137" text-anchor="middle" class="svg-ink" font-size="13">anything wrong: discard_changes, then unlock</text>
<line x1="267" y1="80" x2="267" y2="112" stroke="#dc2626" stroke-width="2"/><line x1="375" y1="80" x2="375" y2="112" stroke="#dc2626" stroke-width="2"/>
<text x="320" y="16" text-anchor="middle" class="svg-muted" font-size="12">nothing is live until commit</text>
</svg></div>
<p class="cap">Candidate workflow. Sirf commit hi device ki running ko badalta hai.</p>

<h3>Steps aur unki ncclient calls</h3>
<table class="cmp"><tr><th>Step</th><th>Call</th><th>Kya karta hai</th></tr>
<tr><td>lock</td><td><code>m.lock("candidate")</code></td><td>Candidate ko is session ke liye reserve karta hai. Doosre session ka lock <code>lock-denied</code> paata hai.</td></tr>
<tr><td>edit</td><td><code>m.edit_config(target="candidate", config=...)</code></td><td>Sirf draft badalta hai.</td></tr>
<tr><td>compare</td><td><code>m.compare_configuration()</code></td><td>Junos extra: candidate aur running ka farq, text mein.</td></tr>
<tr><td>validate</td><td><code>m.validate(source="candidate")</code></td><td>Apply kiye bina syntax aur consistency check karta hai. <code>:validate</code> chahiye.</td></tr>
<tr><td>commit</td><td><code>m.commit()</code></td><td>Candidate ko running mein copy karta hai. <code>:candidate</code> chahiye.</td></tr>
<tr><td>discard</td><td><code>m.discard_changes()</code></td><td>Candidate ko running ke barabar kar deta hai.</td></tr>
<tr><td>unlock</td><td><code>m.unlock("candidate")</code></td><td>Lock chhodta hai. Session band karne par bhi lock chhoot jaata hai.</td></tr></table>

<h3>Lock, aur aap use kyon chahte ho</h3>
<p>Candidate ek shared draft hai. Do scripts bina lock ke edit karein to pehla <code>commit</code> dono ke edits publish kar deta hai, doosri script ke adhoore edits bhi. <code>lock</code> kehta hai "jab tak main na chhodun draft mera hai": koi bhi doosra session jo koshish kare use <code>lock-denied</code> error milta hai jo lock pakadne wale session ka naam batata hai.</p>
<p>ncclient <code>lock</code> aur <code>unlock</code> ki jodi ke liye context manager deta hai: <code>with m.locked("candidate"):</code>. Block ke andar aapka code exception raise kare tab bhi <code>unlock</code> chalta hai.</p>
<pre class="code"><span class="c"># lockexc.py - what does the 'with' block do if my own code fails?</span>
from ncutil import connect

with connect("J1") as m, connect("J1") as other:
    try:
        with m.locked("candidate"):
            raise RuntimeError("something in my own code broke")
    except RuntimeError as err:
        print("caught:", err)
    print("lock was released by with:", other.lock("candidate").ok)</pre>
<pre class="out">AUTO01$ python3 lockexc.py
caught: something in my own code broke
lock was released by with: <span class="hl">True</span></pre>
<p>Block fail hua, exception hamare <code>except</code> tak pahunchi, aur phir bhi lock chhoot gaya: doosra session use le paya. <code>lock</code> aur <code>unlock</code> ko bina <code>try/finally</code> ke alag lines mein kabhi mat likho; ek chhoota hua unlock session khatam hone tak sabko bahar rakh sakta hai. Chapter 10 bilkul yahi dikhata hai.</p>

<h3>Ek session, step by step</h3>
<p>Yeh script J1 par do sessions, <code>m</code> aur <code>other</code>, use karti hai lock dikhane ke liye, phir spare port <code>ge-0/0/2</code> par poora workflow chalati hai aur result discard kar deti hai.</p>
<pre class="code"><span class="c"># cand.py - two sessions, one candidate</span>
from ncclient.operations import RPCError
from ncutil import connect

FLT = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;"
CFG = """&lt;config&gt;&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;
  &lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;description&gt;CAND-DEMO&lt;/description&gt;
&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;&lt;/config&gt;"""


def desc(m, source):
    return m.get_config(source=source, filter=("subtree", FLT)).data.findtext(".//{*}description")


with connect("J1") as m, connect("J1") as other:
    print("sessions:", m.session_id, other.session_id)
    with m.locked("candidate"):
        try:
            other.lock("candidate")
        except RPCError as err:
            print("other cannot lock:", err.tag, "-", err.message)
        m.edit_config(target="candidate", config=CFG)
        print("candidate reads:", desc(m, "candidate"))
        print("running reads:  ", desc(m, "running"))
        print(m.compare_configuration().xpath("//configuration-output")[0].text.strip())
        print("validate ok:", m.validate(source="candidate").ok)
        m.discard_changes()
        print("after discard:  ", desc(m, "candidate"))
    print("lock free again:", other.lock("candidate").ok)</pre>
<pre class="out">AUTO01$ python3 cand.py
sessions: 1633 1650
other cannot lock: <span class="hl">lock-denied - configuration database is locked by another session</span>
candidate reads: <span class="hl">CAND-DEMO</span>
running reads:   <span class="hl">None</span>
[edit interfaces]
+   ge-0/0/2 {
+       description CAND-DEMO;
+   }
validate ok: True
after discard:   None
lock free again: True</pre>
<ul>
<li>Do sessions ke ids 1633 aur 1650 hain: beech ke sessions doosre users ya purani runs ke the.</li>
<li><code>m</code> ke lock pakadne tak <code>other.lock</code> <code>lock-denied</code> se fail hota hai.</li>
<li>Candidate nayi description dikhata hai par <b>running abhi bhi None kehta hai</b>: draft aur live configuration alag cheezein hain.</li>
<li><code>compare_configuration()</code> Junos display format mein farq lautata hai; <code>+</code> woh dikhata hai jo commit jodega aur <code>-</code> jo hatayega. Har commit se pehle ise padho: yahi ek jagah hai jahan aap bilkul dekhte ho kya badlega.</li>
<li><code>validate</code> ok deta hai; <code>discard_changes</code> cart khaali karta hai; <code>with</code> block ke baad lock phir free hai.</li></ul>

<h3>Lagana: Junos push</h3>
<p>Lab 1 ka step 4 <code>push_junos</code> likhta hai. Upar ka sab usme hai: lock, saaf draft se shuru karne ke liye <code>discard_changes</code>, edit, log ke liye diff print, validate, aur commit. Yahan commit <code>confirmed=True</code> hai, jo agla chapter samjhata hai. Function confirm nahi karta; uska caller result check karke karta hai.</p>
<pre class="code"><span class="c"># ifchange.py, part 3 (Lab 1, step 4) - the Junos push, up to the commit</span>
def junos_config(ifname, description, address):
    return """&lt;config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;
    &lt;name&gt;%s&lt;/name&gt;
    &lt;description&gt;%s&lt;/description&gt;
    &lt;unit&gt;&lt;name&gt;0&lt;/name&gt;&lt;family&gt;&lt;inet nc:operation="replace"&gt;
      &lt;address&gt;&lt;name&gt;%s&lt;/name&gt;&lt;/address&gt;
    &lt;/inet&gt;&lt;/family&gt;&lt;/unit&gt;
  &lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;
&lt;/config&gt;""" % (ifname, description, address)


def push_junos(m, ifname, description, address):
    """Junos: candidate, validate, COMMIT CONFIRMED (60 s). The caller must confirm with m.commit()."""
    with m.locked("candidate"):
        m.discard_changes()
        m.edit_config(target="candidate", config=junos_config(ifname, description, address))
        print(m.compare_configuration().xpath("//configuration-output")[0].text.strip())
        m.validate(source="candidate")
        m.commit(confirmed=True, timeout="60")</pre>
<p>Interface address <code>inet</code> element par <code>nc:operation="replace"</code> use karta hai. Yeh jaan-boojhkar hai: poore <code>inet</code> block ko replace karne se purana address hat jaata hai, isliye interface par do addresses nahi bante. Plain merge ke saath Junos naya address doosre address ki tarah jod deta.</p>
<pre class="code"><span class="c"># try_j1.py</span>
from ifchange import push_junos, read_interface
from ncutil import connect

with connect("J1") as m:
    push_junos(m, "ge-0/0/1", "TO-BLR-CORE", "172.16.20.5/30")
    print(read_interface(m, "junos", "ge-0/0/1"))
    m.commit()                       <span class="c"># the confirming commit (next chapter)</span>
    print("confirmed")</pre>
<pre class="out">AUTO01$ python3 try_j1.py
[edit interfaces ge-0/0/1]
-   description LINK-TO-PUN-OLD;
+   description TO-BLR-CORE;
[edit interfaces ge-0/0/1 unit 0 family inet]
-   address 172.16.20.1/30;
+   address 172.16.20.5/30;
('TO-BLR-CORE', <span class="hl">'172.16.20.5/30'</span>)
confirmed</pre>
<p>Diff bilkul do changes dikhata hai: description aur address. Read-back unhe data mein dikhata hai. Tabhi <code>m.commit()</code> change ko permanent karta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Bina lock ke, ya pehle <code>discard_changes</code> kiye bina candidate edit karna. Kisi aur ka adhoora edit, ya aapki pichli fail run ka bacha hua hissa draft mein padha hai aur aapke commit ke saath nikal jaata hai. Pehle lock, saaf shuruaat ke liye discard, phir edit.</p></div>
<div class="exam"><p><b>Exam trap.</b> NETCONF session band karne se uska lock chhoot jaata hai, par yeh har platform par uncommitted candidate edits ko khud <b>undo nahi</b> karta. Cleanup ke liye session khatam hone par bharosa mat karo; <code>discard_changes()</code> bulao.</p></div>

<div class="scn"><h4>Do scripts, ek draft</h4><p>Raat 2 baje ek backup job aur ek VLAN change job dono ne J1 kholi. Kisi ne candidate lock nahi kiya. Change job abhi edit hi kar rahi thi ki backup job ke helper ne ek unrelated comment change ke liye <code>commit</code> bula diya. Adhoori VLAN configuration 40 second ke liye live ho gayi. Dono scripts mein <code>with m.locked("candidate")</code> hota to doosri ko <code>lock-denied</code> milta aur woh intezaar karti.</p><p><b>Lesson:</b> candidate shared hai; lock hi use apna banane ka tareeka hai.</p></div>

<div class="iv"><p class="q">"Edit se pehle candidate datastore ko lock kyon karte hain?"</p><p>Candidate har session ke beech shared hai. Lock ke bina ek session ka commit doosre session ke adhoore edits publish kar dega. Lock exclusive use deta hai; doosron ko lock-denied milta hai. Main <code>with m.locked("candidate")</code> use karta hoon taaki code fail hone par bhi lock chhoote, aur <code>discard_changes</code> se shuru karta hoon taaki purane edits na rahein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>:candidate</code> ke saath edits draft badalte hain aur <code>commit()</code> tak kuch live nahi hota.</li>
<li><code>with m.locked("candidate"):</code> use karo; pehle discard; commit se pehle compare.</li>
<li><code>compare_configuration()</code> (Junos) diff dikhata hai; <code>validate()</code> apply kiye bina check karta hai.</li>
<li>Lock try karne wale doosre session ko owner ke session-id ke saath <code>lock-denied</code> milta hai.</li>
<li>Replace hone wale block (jaise IPv4 address) ke liye <code>nc:operation="replace"</code> use karo taaki do addresses na bane.</li>
</ul></div>
`}};export{e as default};