var e={id:`errors`,h:{en:`Errors: RPCError, raise_mode and the exception ladder`,hi:`Errors: RPCError, raise_mode aur exception ladder`},body:{en:`
<p>Failures are normal in network automation: a typo in an address, a device that is busy, a lock taken by a colleague. The difference between a good script and a bad one is not that it never fails, but that it fails <b>specifically</b>: it knows which thing went wrong and what to do next. NETCONF helps, because its errors are structured.</p>

<h3>An analogy: the form that is returned</h3>
<p>When the registry rejects your form, it does not say "no". It returns the form with a stamp: the department, the kind of problem, how serious it is, and a note in words. <code>RPCError</code> is that returned form. The <b>tag</b> is the kind of problem, and it is the part your code should make decisions on. The <b>message</b> is the note, for humans and logs.</p>

<h3>What an RPCError holds</h3>
<dl class="terms">
<dt><code>err.type</code></dt><dd>The layer that complained: <code>application</code>, <code>protocol</code>, <code>rpc</code> or <code>transport</code>.</dd>
<dt><code>err.tag</code></dt><dd>The machine-readable kind, such as <code>invalid-value</code>, <code>data-exists</code>, <code>lock-denied</code>. This is what you compare in code.</dd>
<dt><code>err.severity</code></dt><dd><code>error</code> or <code>warning</code>.</dd>
<dt><code>err.message</code></dt><dd>Human text from the device. It differs between vendors and releases, so log it but never match on it.</dd>
<dt><code>err.path</code></dt><dd>The XPath of the failing node, when the device supplies one (empty in this lab).</dd>
<dt><code>err.info</code></dt><dd>Extra XML such as the <code>session-id</code> of a lock holder.</dd></dl>
<pre class="code"><span class="c"># errs.py - what is inside an RPCError?</span>
from ncclient.operations import OperationError, RaiseMode, RPCError, TimeoutExpiredError
from ncclient.transport.errors import SessionCloseError
from ncclient.xml_ import XMLError
from ncutil import connect

with connect("R1") as m:
    bad = "&lt;config&gt;&lt;interfaces xmlns='urn:ietf:params:xml:ns:yang:ietf-interfaces'&gt;&lt;interface&gt;&lt;name&gt;GigabitEthernet0/1&lt;/name&gt;&lt;ipv4 xmlns='urn:ietf:params:xml:ns:yang:ietf-ip'&gt;&lt;address&gt;&lt;ip&gt;172.16.10.500&lt;/ip&gt;&lt;netmask&gt;255.255.255.252&lt;/netmask&gt;&lt;/address&gt;&lt;/ipv4&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/config&gt;"
    try:
        m.edit_config(target="running", config=bad)
    except RPCError as err:
        print("type    :", err.type)
        print("tag     :", err.tag)
        print("severity:", err.severity)
        print("message :", err.message)
        print("path    :", err.path)
        print("str(err):", str(err))
    m.raise_mode = RaiseMode.NONE
    reply = m.edit_config(target="running", config=bad)
    print("RaiseMode.NONE -&gt;", "ok" if reply.ok else "not ok", [e.tag for e in reply.errors])
    m.raise_mode = RaiseMode.ALL
    for label, call in [
        ("bad filter type", lambda: m.get_config(source="running", filter=("regex", "x"))),
        ("no &lt;config&gt; root", lambda: m.edit_config(target="running", config="&lt;notconfig/&gt;")),
        ("tiny timeout", lambda: setattr(m, "timeout", 0.0001) or m.get_config(source="running")),
    ]:
        try:
            call()
        except (OperationError, XMLError, TimeoutExpiredError) as err:
            print("%-16s %s: %s" % (label, type(err).__name__, err))
    m.timeout = 30
    m.close_session()
    try:
        m.get_config(source="running")
    except SessionCloseError as err:
        print("after close      SessionCloseError:", err)</pre>
<pre class="out">AUTO01$ python3 errs.py
type    : <span class="hl">application</span>
tag     : <span class="hl">invalid-value</span>
severity: <span class="hl">error</span>
message : <span class="hl">invalid value "172.16.10.500" for leaf ip (expected an IPv4 address)</span>
path    : None
str(err): invalid value "172.16.10.500" for leaf ip (expected an IPv4 address)
RaiseMode.NONE -&gt; not ok ['invalid-value']
bad filter type  OperationError: Invalid filter type
no &lt;config&gt; root XMLError: Element [notconfig] does not meet requirement
tiny timeout     TimeoutExpiredError: ncclient timed out while waiting for an rpc reply.
after close      SessionCloseError: Unexpected session close</pre>

<h3>raise_mode: when should a reply turn into an exception?</h3>
<p>By default ncclient turns every <code>rpc-error</code> into an <code>RPCError</code> exception. You can change that per session with <code>m.raise_mode</code>:</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td><code>RaiseMode.ALL</code> (default)</td><td>Raise for every error and every warning.</td></tr>
<tr><td><code>RaiseMode.ERRORS</code></td><td>Raise only when the severity is <code>error</code>; ignore warnings.</td></tr>
<tr><td><code>RaiseMode.NONE</code></td><td>Never raise; you inspect <code>reply.ok</code> and <code>reply.errors</code> yourself.</td></tr></table>
<p>In the output above, the run with <code>RaiseMode.NONE</code> returned a reply that was <b>not ok</b>, with the list <code>['invalid-value']</code>. Use that mode only when you really want to collect several errors; with the default, a change script cannot forget to check.</p>

<h3>Not everything is an RPCError</h3>
<p>The second half of the output shows errors raised by ncclient itself. They are different classes, so <code>except RPCError</code> does not catch them.</p>
<table class="cmp"><tr><th>Exception</th><th>Where it comes from</th><th>Typical reaction</th></tr>
<tr><td><code>RPCError</code></td><td>The device sent an <code>rpc-error</code></td><td>Decide from the tag</td></tr>
<tr><td><code>MissingCapabilityError</code></td><td>You called something the server did not advertise</td><td>Fix the workflow (chapter 3)</td></tr>
<tr><td><code>OperationError</code></td><td>Wrong argument, for example a bad filter type</td><td>It is a bug in your code</td></tr>
<tr><td><code>XMLError</code></td><td>Your XML is not what the call needs, for example no <code>&amp;lt;config&amp;gt;</code> root</td><td>It is a bug in your code</td></tr>
<tr><td><code>TimeoutExpiredError</code></td><td>No reply within <code>m.timeout</code> seconds</td><td>Do <b>not</b> assume the change failed; read back</td></tr>
<tr><td><code>SessionCloseError</code></td><td>The session ended while you used it</td><td>Reconnect, then read back</td></tr>
<tr><td><code>SSHError</code>, <code>AuthenticationError</code></td><td><code>connect()</code> failed (chapter 2)</td><td>Skip the device, report, continue</td></tr></table>
<p>The timeout row deserves attention. A timeout means <b>you do not know</b>. The change may or may not have been applied. The only correct reaction is to connect again and read the state.</p>

<h3>From tag to decision</h3>
<p>One small function can turn the common tags into actions. Here it is, run against five real failures on the lab devices, including the lock error of a second session:</p>
<pre class="code"><span class="c"># ladder.py - one place that turns errors into decisions</span>
from ncclient.operations import MissingCapabilityError, OperationError, RPCError, TimeoutExpiredError
from ncclient.transport.errors import AuthenticationError, SessionCloseError, SSHError

ACTION = {
    "invalid-value": "fix the data, the device rejected a value",
    "data-exists": "already there: use merge, or count it as done",
    "data-missing": "not there: use remove, or create it first",
    "lock-denied": "another session holds the lock: wait, retry, report who",
    "operation-not-supported": "the device never offered this: change the method",
}


def attempt(label, call):
    try:
        call()
        print("%-12s ok" % label)
    except RPCError as err:
        print("%-12s RPCError %-23s %s" % (label, err.tag, ACTION.get(err.tag, "read the message")))
    except (MissingCapabilityError, OperationError) as err:
        print("%-12s %s: %s" % (label, type(err).__name__, err))
    except (TimeoutExpiredError, SessionCloseError, SSHError, AuthenticationError) as err:
        print("%-12s %s: %s" % (label, type(err).__name__, err))</pre>
<pre class="out">AUTO01$ python3 ladder.py
create       ok
create again RPCError <span class="hl">data-exists</span>             already there: use merge, or count it as done
delete       ok
delete again RPCError <span class="hl">data-missing</span>            not there: use remove, or create it first
commit on R1 MissingCapabilityError: Server does not support [:candidate]
xpath on J1  RPCError <span class="hl">operation-not-supported</span> the device never offered this: change the method
lock-denied info: &lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;error-info&gt;
&lt;bad-element&gt;lock&lt;/bad-element&gt;
&lt;session-id&gt;<span class="hl">1633</span>&lt;/session-id&gt;
&lt;/error-info&gt;

lock         RPCError <span class="hl">lock-denied</span>             another session holds the lock: wait, retry, report who</pre>
<p>The <code>info</code> of the <code>lock-denied</code> error names session <b>1633</b>: the holder. In a real incident you would look that session up in the device's session list and see who it is and from where.</p>
<table class="cmp"><tr><th>Tag</th><th>Meaning</th><th>Reasonable action</th></tr>
<tr><td><code>invalid-value</code></td><td>A value is outside what the model allows</td><td>Fix the data; do not retry</td></tr>
<tr><td><code>data-exists</code></td><td><code>create</code> on a node that is there</td><td>Use merge, or treat as done</td></tr>
<tr><td><code>data-missing</code></td><td><code>delete</code> on a node that is not there</td><td>Use remove, or create first</td></tr>
<tr><td><code>lock-denied</code></td><td>Another session holds the datastore lock</td><td>Wait and retry a few times; then report the holder</td></tr>
<tr><td><code>operation-not-supported</code></td><td>The device does not offer the filter, datastore or operation</td><td>Choose another method</td></tr>
<tr><td><code>operation-failed</code></td><td>A general failure; read the message (for example, a syntax error)</td><td>Log and stop</td></tr>
<tr><td><code>access-denied</code></td><td>The account may not do this</td><td>Check the role; not a retry case</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> <code>except Exception: pass</code> around a change. A failed edit then looks like success and the next step runs on a device that is not in the state you think. Catch the specific exceptions, handle the ones you understand, and let the rest stop the script with a clear message.</p></div>
<div class="exam"><p><b>Exam trap.</b> The <b>tag</b> is the stable part of an error; the <b>message</b> text is not. Match on the tag. Also remember that a timeout is not a failure, it is an unknown.</p></div>

<div class="scn"><h4>The retry that made it worse</h4><p>A script wrapped every device call in "retry 3 times". One night it hit <code>data-exists</code> on <code>create</code>, retried the create three times, and then reported failure for 30 routers that were in fact already correct. Another night it retried a <code>lock-denied</code> immediately, three times in two seconds, and gave up before the other job finished. The fix was to retry only <code>lock-denied</code>, with a wait between tries, and to treat <code>data-exists</code> as done.</p><p><b>Lesson:</b> retry what can change, never what is final.</p></div>

<div class="iv"><p class="q">"How do you handle errors in a NETCONF script?"</p><p>I catch <code>RPCError</code> and decide from <code>err.tag</code>, logging <code>err.message</code> for people; I catch ncclient's own exceptions separately: missing capability, timeout, session close. After a timeout I reconnect and read the state before deciding. I keep the default raise mode so an edit cannot fail silently.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>RPCError</code> carries <code>type</code>, <code>tag</code>, <code>severity</code>, <code>message</code>, <code>path</code>, <code>info</code>. Decide on the tag.</li>
<li><code>m.raise_mode</code>: ALL (default), ERRORS, NONE.</li>
<li><code>MissingCapabilityError</code>, <code>OperationError</code>, <code>XMLError</code>, <code>TimeoutExpiredError</code>, <code>SessionCloseError</code> are not RPCError.</li>
<li>A timeout is an unknown: reconnect and read back.</li>
<li>Retry only things that can change, such as a lock; never retry data-exists or invalid-value.</li>
</ul></div>
`,hi:`
<p>Network automation mein failures normal hain: address mein typo, busy device, colleague ka liya hua lock. Achhi aur buri script mein farq yeh nahi ki woh kabhi fail nahi hoti, balki yeh ki woh <b>specifically</b> fail hoti hai: use pata hota hai kya galat hua aur aage kya karna hai. NETCONF madad karta hai, kyunki uske errors structured hain.</p>

<h3>Analogy: lautaya gaya form</h3>
<p>Registry aapka form reject kare to sirf "nahi" nahi kehti. Woh form stamp ke saath lauta deti hai: kaunsa department, kis qism ki problem, kitni gambhir, aur shabdon mein ek note. <code>RPCError</code> woh lautaya gaya form hai. <b>tag</b> problem ki qism hai, aur aapka code isi par decision le. <b>message</b> note hai, insaanon aur logs ke liye.</p>

<h3>RPCError mein kya hota hai</h3>
<dl class="terms">
<dt><code>err.type</code></dt><dd>Jis layer ne shikayat ki: <code>application</code>, <code>protocol</code>, <code>rpc</code> ya <code>transport</code>.</dd>
<dt><code>err.tag</code></dt><dd>Machine-readable qism, jaise <code>invalid-value</code>, <code>data-exists</code>, <code>lock-denied</code>. Code mein yahi compare karte ho.</dd>
<dt><code>err.severity</code></dt><dd><code>error</code> ya <code>warning</code>.</dd>
<dt><code>err.message</code></dt><dd>Device ka human text. Vendors aur releases ke beech badalta hai, isliye log karo par us par match kabhi mat karo.</dd>
<dt><code>err.path</code></dt><dd>Fail hue node ka XPath, jab device de (is lab mein khaali).</dd>
<dt><code>err.info</code></dt><dd>Extra XML, jaise lock holder ka <code>session-id</code>.</dd></dl>
<pre class="code"><span class="c"># errs.py - what is inside an RPCError?</span>
from ncclient.operations import OperationError, RaiseMode, RPCError, TimeoutExpiredError
from ncclient.transport.errors import SessionCloseError
from ncclient.xml_ import XMLError
from ncutil import connect

with connect("R1") as m:
    bad = "&lt;config&gt;&lt;interfaces xmlns='urn:ietf:params:xml:ns:yang:ietf-interfaces'&gt;&lt;interface&gt;&lt;name&gt;GigabitEthernet0/1&lt;/name&gt;&lt;ipv4 xmlns='urn:ietf:params:xml:ns:yang:ietf-ip'&gt;&lt;address&gt;&lt;ip&gt;172.16.10.500&lt;/ip&gt;&lt;netmask&gt;255.255.255.252&lt;/netmask&gt;&lt;/address&gt;&lt;/ipv4&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/config&gt;"
    try:
        m.edit_config(target="running", config=bad)
    except RPCError as err:
        print("type    :", err.type)
        print("tag     :", err.tag)
        print("severity:", err.severity)
        print("message :", err.message)
        print("path    :", err.path)
        print("str(err):", str(err))
    m.raise_mode = RaiseMode.NONE
    reply = m.edit_config(target="running", config=bad)
    print("RaiseMode.NONE -&gt;", "ok" if reply.ok else "not ok", [e.tag for e in reply.errors])
    m.raise_mode = RaiseMode.ALL
    for label, call in [
        ("bad filter type", lambda: m.get_config(source="running", filter=("regex", "x"))),
        ("no &lt;config&gt; root", lambda: m.edit_config(target="running", config="&lt;notconfig/&gt;")),
        ("tiny timeout", lambda: setattr(m, "timeout", 0.0001) or m.get_config(source="running")),
    ]:
        try:
            call()
        except (OperationError, XMLError, TimeoutExpiredError) as err:
            print("%-16s %s: %s" % (label, type(err).__name__, err))
    m.timeout = 30
    m.close_session()
    try:
        m.get_config(source="running")
    except SessionCloseError as err:
        print("after close      SessionCloseError:", err)</pre>
<pre class="out">AUTO01$ python3 errs.py
type    : <span class="hl">application</span>
tag     : <span class="hl">invalid-value</span>
severity: <span class="hl">error</span>
message : <span class="hl">invalid value "172.16.10.500" for leaf ip (expected an IPv4 address)</span>
path    : None
str(err): invalid value "172.16.10.500" for leaf ip (expected an IPv4 address)
RaiseMode.NONE -&gt; not ok ['invalid-value']
bad filter type  OperationError: Invalid filter type
no &lt;config&gt; root XMLError: Element [notconfig] does not meet requirement
tiny timeout     TimeoutExpiredError: ncclient timed out while waiting for an rpc reply.
after close      SessionCloseError: Unexpected session close</pre>

<h3>raise_mode: reply kab exception bane?</h3>
<p>Default mein ncclient har <code>rpc-error</code> ko <code>RPCError</code> exception bana deta hai. Aap ise session ke hisaab se <code>m.raise_mode</code> se badal sakte ho:</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td><code>RaiseMode.ALL</code> (default)</td><td>Har error aur har warning par raise.</td></tr>
<tr><td><code>RaiseMode.ERRORS</code></td><td>Sirf severity <code>error</code> par raise; warnings ignore.</td></tr>
<tr><td><code>RaiseMode.NONE</code></td><td>Kabhi raise nahi; aap khud <code>reply.ok</code> aur <code>reply.errors</code> dekhte ho.</td></tr></table>
<p>Upar ke output mein <code>RaiseMode.NONE</code> wali run ne aisa reply lautaya jo <b>not ok</b> tha, list <code>['invalid-value']</code> ke saath. Yeh mode tabhi use karo jab aap sach mein kai errors ikatthe karna chahte ho; default ke saath change script check karna bhool nahi sakti.</p>

<h3>Har cheez RPCError nahi hoti</h3>
<p>Output ka doosra hissa ncclient ke apne raise kiye errors dikhata hai. Woh alag classes hain, isliye <code>except RPCError</code> unhe nahi pakadta.</p>
<table class="cmp"><tr><th>Exception</th><th>Kahan se aata hai</th><th>Aam reaction</th></tr>
<tr><td><code>RPCError</code></td><td>Device ne <code>rpc-error</code> bheja</td><td>Tag se decide karo</td></tr>
<tr><td><code>MissingCapabilityError</code></td><td>Aapne woh cheez bulayi jo server ne advertise nahi ki</td><td>Workflow theek karo (chapter 3)</td></tr>
<tr><td><code>OperationError</code></td><td>Galat argument, jaise bad filter type</td><td>Aapke code ka bug hai</td></tr>
<tr><td><code>XMLError</code></td><td>Aapka XML call ki zaroorat jaisa nahi, jaise <code>&amp;lt;config&amp;gt;</code> root nahi</td><td>Aapke code ka bug hai</td></tr>
<tr><td><code>TimeoutExpiredError</code></td><td><code>m.timeout</code> seconds mein reply nahi aaya</td><td>Yeh maan <b>mat</b> lo ki change fail hua; read back karo</td></tr>
<tr><td><code>SessionCloseError</code></td><td>Aap use kar rahe the aur session khatam ho gaya</td><td>Reconnect, phir read back</td></tr>
<tr><td><code>SSHError</code>, <code>AuthenticationError</code></td><td><code>connect()</code> fail hua (chapter 2)</td><td>Device skip, report, aage badho</td></tr></table>
<p>Timeout wali row par dhyan do. Timeout ka matlab hai <b>aapko pata nahi</b>. Change lag bhi gaya ho sakta hai, nahi bhi. Sahi reaction sirf yeh hai ki dobara connect karo aur state padho.</p>

<h3>Tag se decision tak</h3>
<p>Ek chhota function aam tags ko actions mein badal sakta hai. Yeh lab devices par paanch asli failures ke against chala hai, doosre session ke lock error samet:</p>
<pre class="code"><span class="c"># ladder.py - one place that turns errors into decisions</span>
from ncclient.operations import MissingCapabilityError, OperationError, RPCError, TimeoutExpiredError
from ncclient.transport.errors import AuthenticationError, SessionCloseError, SSHError

ACTION = {
    "invalid-value": "fix the data, the device rejected a value",
    "data-exists": "already there: use merge, or count it as done",
    "data-missing": "not there: use remove, or create it first",
    "lock-denied": "another session holds the lock: wait, retry, report who",
    "operation-not-supported": "the device never offered this: change the method",
}


def attempt(label, call):
    try:
        call()
        print("%-12s ok" % label)
    except RPCError as err:
        print("%-12s RPCError %-23s %s" % (label, err.tag, ACTION.get(err.tag, "read the message")))
    except (MissingCapabilityError, OperationError) as err:
        print("%-12s %s: %s" % (label, type(err).__name__, err))
    except (TimeoutExpiredError, SessionCloseError, SSHError, AuthenticationError) as err:
        print("%-12s %s: %s" % (label, type(err).__name__, err))</pre>
<pre class="out">AUTO01$ python3 ladder.py
create       ok
create again RPCError <span class="hl">data-exists</span>             already there: use merge, or count it as done
delete       ok
delete again RPCError <span class="hl">data-missing</span>            not there: use remove, or create it first
commit on R1 MissingCapabilityError: Server does not support [:candidate]
xpath on J1  RPCError <span class="hl">operation-not-supported</span> the device never offered this: change the method
lock-denied info: &lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;error-info&gt;
&lt;bad-element&gt;lock&lt;/bad-element&gt;
&lt;session-id&gt;<span class="hl">1633</span>&lt;/session-id&gt;
&lt;/error-info&gt;

lock         RPCError <span class="hl">lock-denied</span>             another session holds the lock: wait, retry, report who</pre>
<p><code>lock-denied</code> ka <code>info</code> session <b>1633</b> ka naam leta hai: holder. Asli incident mein aap us session ko device ki session list mein dhoondhte aur dekhte ki kaun hai aur kahan se.</p>
<table class="cmp"><tr><th>Tag</th><th>Matlab</th><th>Samajhdaar action</th></tr>
<tr><td><code>invalid-value</code></td><td>Value model ki seema se bahar hai</td><td>Data theek karo; retry mat karo</td></tr>
<tr><td><code>data-exists</code></td><td>Maujood node par <code>create</code></td><td>Merge use karo, ya done maano</td></tr>
<tr><td><code>data-missing</code></td><td>Na hone wale node par <code>delete</code></td><td>Remove use karo, ya pehle create</td></tr>
<tr><td><code>lock-denied</code></td><td>Doosre session ke paas datastore lock hai</td><td>Kuch baar wait karke retry; phir holder report karo</td></tr>
<tr><td><code>operation-not-supported</code></td><td>Device filter, datastore ya operation offer nahi karta</td><td>Doosra tareeka chuno</td></tr>
<tr><td><code>operation-failed</code></td><td>Aam failure; message padho (jaise syntax error)</td><td>Log karo aur ruko</td></tr>
<tr><td><code>access-denied</code></td><td>Account yeh nahi kar sakta</td><td>Role check karo; retry ka case nahi</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Change ke gird <code>except Exception: pass</code>. Fail hua edit tab success jaisa dikhta hai aur agla step aise device par chalta hai jo us state mein nahi jo aap sochte ho. Specific exceptions pakdo, jo samajhte ho unhe handle karo, aur baaki ko saaf message ke saath script rokne do.</p></div>
<div class="exam"><p><b>Exam trap.</b> Error ka <b>tag</b> stable hissa hai; <b>message</b> text nahi. Tag par match karo. Yeh bhi yaad rakho: timeout failure nahi, ek unknown hai.</p></div>

<div class="scn"><h4>Retry jisne halat bigaadi</h4><p>Ek script har device call ko "3 baar retry" mein lapete thi. Ek raat <code>create</code> par <code>data-exists</code> mila, usne create teen baar retry kiya, aur phir 30 routers ke liye failure report kiya jo asal mein pehle se theek the. Doosri raat usne <code>lock-denied</code> ko do second mein teen baar turant retry kiya aur doosri job khatam hone se pehle haar maan li. Fix: sirf <code>lock-denied</code> ko retry karo, beech mein wait ke saath, aur <code>data-exists</code> ko done maano.</p><p><b>Lesson:</b> jo badal sakta hai use retry karo, jo final hai use kabhi nahi.</p></div>

<div class="iv"><p class="q">"NETCONF script mein errors kaise handle karte ho?"</p><p>Main <code>RPCError</code> pakadta hoon aur <code>err.tag</code> se decide karta hoon, <code>err.message</code> logs mein logon ke liye rakhta hoon; ncclient ke apne exceptions alag pakadta hoon: missing capability, timeout, session close. Timeout ke baad main reconnect karke state padhta hoon phir decide karta hoon. Default raise mode rakhta hoon taaki edit chupchaap fail na ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>RPCError</code> mein <code>type</code>, <code>tag</code>, <code>severity</code>, <code>message</code>, <code>path</code>, <code>info</code> hote hain. Tag par decide karo.</li>
<li><code>m.raise_mode</code>: ALL (default), ERRORS, NONE.</li>
<li><code>MissingCapabilityError</code>, <code>OperationError</code>, <code>XMLError</code>, <code>TimeoutExpiredError</code>, <code>SessionCloseError</code> RPCError nahi hain.</li>
<li>Timeout ek unknown hai: reconnect karo aur read back.</li>
<li>Sirf wahi retry karo jo badal sakta hai, jaise lock; data-exists ya invalid-value kabhi nahi.</li>
</ul></div>
`}};export{e as default};