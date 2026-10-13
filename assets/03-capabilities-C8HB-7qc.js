var e={id:`capabilities`,h:{en:`Capabilities: ask the device what it can do`,hi:`Capabilities: device se poocho woh kya kar sakta hai`},body:{en:`
<p>A NETCONF server is not a fixed menu. Every device announces in its hello what it can do, and the answer differs between vendors and even between software releases. A script that assumes "all devices have a candidate datastore" works on Junos and crashes on IOS XE. This chapter shows how to ask first and then choose the workflow.</p>

<h3>An analogy: the spec sheet in the box</h3>
<p>Before you plug in a new appliance you read the spec sheet: does it have a timer, does it have a safety cut-out? You do not try the buttons to find out. Capabilities are the spec sheet. Your script reads it once at the start and decides what to do.</p>

<h3>Reading them in ncclient</h3>
<p><code>m.server_capabilities</code> holds the list the server sent in its hello. Each entry is a URN such as <code>urn:ietf:params:netconf:capability:candidate:1.0</code>. Typing that every time is tiresome, so ncclient lets you test with a short form: <code>":candidate" in m.server_capabilities</code>.</p>
<pre class="code"><span class="c"># caps.py (Lab 1, step 1) - which workflow does each device support?</span>
from ncutil import DEVICES, connect

for name, dev in DEVICES.items():
    with connect(name) as m:
        print(name, dev["vendor"], "session", m.session_id)
        for cap in (":candidate", ":confirmed-commit", ":validate", ":writable-running"):
            print("   %-18s %s" % (cap, cap in m.server_capabilities))</pre>
<pre class="out">AUTO01$ python3 caps.py
R1 iosxe session 31
   :candidate         <span class="hl">False</span>
   :confirmed-commit  <span class="hl">False</span>
   :validate          <span class="hl">False</span>
   :writable-running  <span class="hl">True</span>
J1 junos session 1633
   :candidate         <span class="hl">True</span>
   :confirmed-commit  <span class="hl">True</span>
   :validate          <span class="hl">True</span>
   :writable-running  <span class="hl">False</span></pre>
<p>Two different devices, two different workflows, and the script found out without trying a single change.</p>

<h3>The capabilities you must know</h3>
<table class="cmp"><tr><th>Capability</th><th>What it allows</th><th>R1 (IOS XE)</th><th>J1 (Junos)</th></tr>
<tr><td><code>:candidate</code></td><td>A draft datastore. Edit it, then <code>commit</code> to make it live.</td><td>no</td><td>yes</td></tr>
<tr><td><code>:confirmed-commit</code></td><td><code>commit(confirmed=True, timeout=...)</code>: the change reverts unless confirmed. Needs <code>:candidate</code>.</td><td>no</td><td>yes</td></tr>
<tr><td><code>:validate</code></td><td>Check a configuration without applying it: <code>validate()</code> and <code>test_option</code>.</td><td>no</td><td>yes</td></tr>
<tr><td><code>:writable-running</code></td><td><code>edit_config(target="running")</code> is allowed.</td><td>yes</td><td>no</td></tr>
<tr><td><code>:xpath</code></td><td>Filter type <code>xpath</code> besides <code>subtree</code>.</td><td>yes</td><td>no</td></tr>
<tr><td><code>:rollback-on-error</code></td><td>With <code>error_option</code>, a failed edit changes nothing.</td><td>yes</td><td>not offered</td></tr>
<tr><td><code>:url</code></td><td>Load or save a configuration from a URL.</td><td>no</td><td>yes</td></tr></table>
<p>R1 also lists the YANG models it implements (ietf-interfaces, ietf-ip, the Cisco native model and a few others). Those entries are in the same list, which is how you learn which models you can ask for.</p>

<h3>Decide the workflow from the capabilities</h3>
<p>The rule is simple. If the device has <code>:candidate</code>, use the candidate workflow: lock, edit, validate, commit. If it only has <code>:writable-running</code>, edit running directly and be extra careful, because there is no undo. The helper below is the first piece of the final script.</p>
<pre class="code">from ncclient.operations import MissingCapabilityError
from ncutil import DEVICES, connect


def supports(m, *caps):
    return all(cap in m.server_capabilities for cap in caps)


for name in DEVICES:
    with connect(name) as m:
        print(name, "candidate:", supports(m, ":candidate"),
              "| confirmed commit:", supports(m, ":candidate", ":confirmed-commit"),
              "| validate:", supports(m, ":validate"))
        if not supports(m, ":candidate"):
            try:
                m.commit()
            except MissingCapabilityError as err:
                print("   commit() -&gt;", type(err).__name__ + ":", err)</pre>
<pre class="out">AUTO01$ python3 require.py
R1 candidate: False | confirmed commit: False | validate: False
   commit() -&gt; <span class="hl">MissingCapabilityError: Server does not support [:candidate]</span>
J1 candidate: True | confirmed commit: True | validate: True</pre>
<p>Look at the last line for R1. When your code calls <code>commit()</code> on a server that lacks <code>:candidate</code>, ncclient refuses <b>before</b> sending anything. This is the exception <code>MissingCapabilityError</code>. It is a client-side check, so it costs no network round trip and it cannot half-apply a change.</p>

<div class="warn"><p><b>Common mistake.</b> Catching only <code>RPCError</code> and forgetting that some failures are raised by ncclient itself. <code>MissingCapabilityError</code>, <code>OperationError</code> and <code>TimeoutExpiredError</code> are not <code>RPCError</code>; see chapter 8.</p></div>

<h3>Features the server does not have fail in two different ways</h3>
<p>Some missing features are caught by ncclient from the capability list (as above). Others are only discovered by the device. Here R1 answers an XPath filter, while J1 rejects it, and J1 also rejects the <code>startup</code> datastore:</p>
<pre class="code">from ncclient.operations import RPCError
from ncutil import connect

PATH = "/interfaces/interface[name='GigabitEthernet0/1']/description"
with connect("R1") as m:
    reply = m.get_config(source="running", filter=("xpath", PATH))
    print("R1 xpath -&gt;", reply.data.findtext(".//{*}description"))

with connect("J1") as m:
    for label, call in [
        ("xpath", lambda: m.get_config(source="running", filter=("xpath", "/configuration/interfaces"))),
        ("startup", lambda: m.get_config(source="startup")),
    ]:
        try:
            call()
        except Exception as err:
            tag = getattr(err, "tag", type(err).__name__)
            print("J1 %-8s-&gt; %s | %s" % (label, tag, err))</pre>
<pre class="out">AUTO01$ python3 xp.py
R1 xpath -&gt; LINK-TO-PUN-OLD
J1 xpath   -&gt; <span class="hl">operation-not-supported | filter type xpath is not supported</span>
J1 startup -&gt; <span class="hl">operation-not-supported | datastore startup is not supported</span></pre>
<p>The error is an <code>rpc-error</code> with the tag <code>operation-not-supported</code>. Read it as "this device never offered that" and switch to what it does offer: a subtree filter and the <code>running</code> or <code>candidate</code> datastore.</p>

<div class="exam"><p><b>Exam trap.</b> The capability name tells you the workflow. <code>:candidate</code> plus <code>:confirmed-commit</code> means Junos-style editing with a safety net; <code>:writable-running</code> alone means edits take effect immediately. <code>:confirmed-commit</code> is useless without <code>:candidate</code>.</p></div>

<div class="scn"><h4>The upgrade that removed a feature</h4><p>A nightly script used <code>validate()</code> on a router for a year. After a software upgrade it began to fail with <code>MissingCapabilityError</code>. The release no longer advertised <code>:validate</code> in the hello. The script had no capability check, so it failed halfway through a change window.</p><p><b>Lesson:</b> check capabilities at the start of every session, and decide to continue, fall back, or stop before the first edit.</p></div>

<div class="iv"><p class="q">"How does a script know whether a device supports a candidate datastore?"</p><p>Read the capabilities from the hello: <code>":candidate" in m.server_capabilities</code>. If present use lock, edit candidate, validate and commit; if only <code>:writable-running</code> is present, edit running. Do the check once per session, before any change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capabilities come from the device's hello; read them before you act.</li>
<li><code>:candidate</code>, <code>:confirmed-commit</code>, <code>:validate</code> and <code>:writable-running</code> decide the workflow.</li>
<li>In this lab R1 is running-only (writable-running); J1 has candidate, confirmed commit and validate.</li>
<li>ncclient raises <code>MissingCapabilityError</code> itself when you call something the server lacks.</li>
<li>Unsupported filters or datastores come back as <code>operation-not-supported</code>.</li>
</ul></div>
`,hi:`
<p>NETCONF server koi fixed menu nahi hai. Har device apne hello mein batata hai ki woh kya kar sakta hai, aur jawab vendors ke beech, aur software releases ke beech bhi alag hota hai. "Sab devices mein candidate datastore hota hai" maan kar likhi script Junos par chalti hai aur IOS XE par crash hoti hai. Yeh chapter dikhata hai ki pehle poochho, phir workflow chuno.</p>

<h3>Analogy: dibbe mein rakhi spec sheet</h3>
<p>Naya appliance lagane se pehle aap spec sheet padhte ho: timer hai, safety cut-out hai? Aap buttons dabakar pata nahi lagate. Capabilities wahi spec sheet hain. Aapki script use shuru mein ek baar padhti hai aur tay karti hai kya karna hai.</p>

<h3>ncclient mein padhna</h3>
<p><code>m.server_capabilities</code> mein woh list hoti hai jo server ne apne hello mein bheji. Har entry ek URN hoti hai jaise <code>urn:ietf:params:netconf:capability:candidate:1.0</code>. Isse har baar type karna thakaane wala hai, isliye ncclient chhota form test karne deta hai: <code>":candidate" in m.server_capabilities</code>.</p>
<pre class="code"><span class="c"># caps.py (Lab 1, step 1) - which workflow does each device support?</span>
from ncutil import DEVICES, connect

for name, dev in DEVICES.items():
    with connect(name) as m:
        print(name, dev["vendor"], "session", m.session_id)
        for cap in (":candidate", ":confirmed-commit", ":validate", ":writable-running"):
            print("   %-18s %s" % (cap, cap in m.server_capabilities))</pre>
<pre class="out">AUTO01$ python3 caps.py
R1 iosxe session 31
   :candidate         <span class="hl">False</span>
   :confirmed-commit  <span class="hl">False</span>
   :validate          <span class="hl">False</span>
   :writable-running  <span class="hl">True</span>
J1 junos session 1633
   :candidate         <span class="hl">True</span>
   :confirmed-commit  <span class="hl">True</span>
   :validate          <span class="hl">True</span>
   :writable-running  <span class="hl">False</span></pre>
<p>Do alag devices, do alag workflows, aur script ne ek bhi change try kiye bina pata laga liya.</p>

<h3>Jo capabilities aapko aani chahiye</h3>
<table class="cmp"><tr><th>Capability</th><th>Kya allow karti hai</th><th>R1 (IOS XE)</th><th>J1 (Junos)</th></tr>
<tr><td><code>:candidate</code></td><td>Draft datastore. Usme edit karo, phir <code>commit</code> se live karo.</td><td>nahi</td><td>haan</td></tr>
<tr><td><code>:confirmed-commit</code></td><td><code>commit(confirmed=True, timeout=...)</code>: confirm na karo to change wapas. <code>:candidate</code> chahiye.</td><td>nahi</td><td>haan</td></tr>
<tr><td><code>:validate</code></td><td>Configuration ko apply kiye bina check karna: <code>validate()</code> aur <code>test_option</code>.</td><td>nahi</td><td>haan</td></tr>
<tr><td><code>:writable-running</code></td><td><code>edit_config(target="running")</code> allowed hai.</td><td>haan</td><td>nahi</td></tr>
<tr><td><code>:xpath</code></td><td><code>subtree</code> ke alawa filter type <code>xpath</code>.</td><td>haan</td><td>nahi</td></tr>
<tr><td><code>:rollback-on-error</code></td><td><code>error_option</code> ke saath fail hua edit kuch nahi badalta.</td><td>haan</td><td>offer nahi</td></tr>
<tr><td><code>:url</code></td><td>URL se configuration load ya save karna.</td><td>nahi</td><td>haan</td></tr></table>
<p>R1 un YANG models ki bhi list deta hai jo woh implement karta hai (ietf-interfaces, ietf-ip, Cisco native model aur kuch aur). Woh entries usi list mein hoti hain, isi se pata chalta hai ki kaunse models maang sakte ho.</p>

<h3>Capabilities se workflow tay karo</h3>
<p>Rule seedha hai. Device mein <code>:candidate</code> hai to candidate workflow: lock, edit, validate, commit. Sirf <code>:writable-running</code> hai to running seedha edit karo aur extra savdhan raho, kyunki undo nahi hai. Neeche ka helper final script ka pehla tukda hai.</p>
<pre class="code">from ncclient.operations import MissingCapabilityError
from ncutil import DEVICES, connect


def supports(m, *caps):
    return all(cap in m.server_capabilities for cap in caps)


for name in DEVICES:
    with connect(name) as m:
        print(name, "candidate:", supports(m, ":candidate"),
              "| confirmed commit:", supports(m, ":candidate", ":confirmed-commit"),
              "| validate:", supports(m, ":validate"))
        if not supports(m, ":candidate"):
            try:
                m.commit()
            except MissingCapabilityError as err:
                print("   commit() -&gt;", type(err).__name__ + ":", err)</pre>
<pre class="out">AUTO01$ python3 require.py
R1 candidate: False | confirmed commit: False | validate: False
   commit() -&gt; <span class="hl">MissingCapabilityError: Server does not support [:candidate]</span>
J1 candidate: True | confirmed commit: True | validate: True</pre>
<p>R1 ki aakhri line dekho. Jab aapka code aise server par <code>commit()</code> bulata hai jisme <code>:candidate</code> nahi, ncclient kuch bhejne se <b>pehle</b> mana kar deta hai. Yeh exception <code>MissingCapabilityError</code> hai. Yeh client-side check hai, isliye network round trip nahi lagta aur change aadha apply nahi ho sakta.</p>

<div class="warn"><p><b>Common mistake.</b> Sirf <code>RPCError</code> pakadna aur bhool jaana ki kuch failures ncclient khud raise karta hai. <code>MissingCapabilityError</code>, <code>OperationError</code> aur <code>TimeoutExpiredError</code> <code>RPCError</code> nahi hain; chapter 8 dekho.</p></div>

<h3>Jo feature server mein nahi, woh do tarah se fail hota hai</h3>
<p>Kuch missing features ncclient capability list se pakad leta hai (upar jaisa). Baaki sirf device pakadta hai. Yahan R1 XPath filter ka jawab deta hai, J1 use reject karta hai, aur J1 <code>startup</code> datastore bhi reject karta hai:</p>
<pre class="code">from ncclient.operations import RPCError
from ncutil import connect

PATH = "/interfaces/interface[name='GigabitEthernet0/1']/description"
with connect("R1") as m:
    reply = m.get_config(source="running", filter=("xpath", PATH))
    print("R1 xpath -&gt;", reply.data.findtext(".//{*}description"))

with connect("J1") as m:
    for label, call in [
        ("xpath", lambda: m.get_config(source="running", filter=("xpath", "/configuration/interfaces"))),
        ("startup", lambda: m.get_config(source="startup")),
    ]:
        try:
            call()
        except Exception as err:
            tag = getattr(err, "tag", type(err).__name__)
            print("J1 %-8s-&gt; %s | %s" % (label, tag, err))</pre>
<pre class="out">AUTO01$ python3 xp.py
R1 xpath -&gt; LINK-TO-PUN-OLD
J1 xpath   -&gt; <span class="hl">operation-not-supported | filter type xpath is not supported</span>
J1 startup -&gt; <span class="hl">operation-not-supported | datastore startup is not supported</span></pre>
<p>Error ek <code>rpc-error</code> hai jiska tag <code>operation-not-supported</code> hai. Ise aise padho: "yeh device ne kabhi offer hi nahi kiya", aur jo woh offer karta hai us par aao: subtree filter aur <code>running</code> ya <code>candidate</code> datastore.</p>

<div class="exam"><p><b>Exam trap.</b> Capability ka naam workflow batata hai. <code>:candidate</code> aur <code>:confirmed-commit</code> ka matlab safety net ke saath Junos-style editing; sirf <code>:writable-running</code> ka matlab edits turant effect mein aate hain. <code>:confirmed-commit</code> bina <code>:candidate</code> ke bekaar hai.</p></div>

<div class="scn"><h4>Upgrade jisne ek feature hata diya</h4><p>Ek nightly script ek saal tak router par <code>validate()</code> use karti rahi. Software upgrade ke baad woh <code>MissingCapabilityError</code> se fail hone lagi. Naye release ne hello mein <code>:validate</code> advertise karna band kar diya tha. Script mein capability check nahi tha, isliye change window ke beech mein fail hui.</p><p><b>Lesson:</b> har session ke shuru mein capabilities check karo, aur pehle edit se pehle tay karo ki aage badhna hai, fallback lena hai ya rukna hai.</p></div>

<div class="iv"><p class="q">"Script ko kaise pata chalega ki device candidate datastore support karta hai?"</p><p>Hello se capabilities padho: <code>":candidate" in m.server_capabilities</code>. Ho to lock, candidate edit, validate aur commit; sirf <code>:writable-running</code> ho to running edit karo. Yeh check har session mein ek baar, kisi bhi change se pehle karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capabilities device ke hello se aati hain; kuch karne se pehle padho.</li>
<li><code>:candidate</code>, <code>:confirmed-commit</code>, <code>:validate</code> aur <code>:writable-running</code> workflow tay karte hain.</li>
<li>Is lab mein R1 running-only hai (writable-running); J1 mein candidate, confirmed commit aur validate hain.</li>
<li>Jo cheez server mein nahi use bulao to ncclient khud <code>MissingCapabilityError</code> raise karta hai.</li>
<li>Unsupported filters ya datastores <code>operation-not-supported</code> ban kar aate hain.</li>
</ul></div>
`}};export{e as default};