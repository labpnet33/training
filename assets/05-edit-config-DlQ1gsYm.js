var e={id:`edit-config`,h:{en:`Changing configuration with edit_config`,hi:`edit_config se configuration badalna`},body:{en:`
<p>Now the half that changes things. <code>edit_config</code> sends a piece of configuration and tells the device how to combine it with what is already there. It is small, but nearly every mistake that causes an outage in automation is in this call: the wrong target, a payload that replaces more than you meant, or an operation that fails the second time you run it.</p>

<h3>An analogy: instructions in the margin</h3>
<p>Think of a contract in a shared folder. You do not rewrite it; you send a marked-up page with notes in the margin: "add this clause", "replace this paragraph", "strike this line". <code>edit_config</code> is the marked-up page. The XML is the text; the margin note is the <code>operation</code> attribute.</p>

<h3>The call and its arguments</h3>
<p><code>m.edit_config(target=..., config=..., default_operation=..., test_option=..., error_option=...)</code></p>
<table class="cmp"><tr><th>Argument</th><th>Meaning</th><th>Needs</th></tr>
<tr><td><code>target</code></td><td>The datastore to change: <code>"running"</code> or <code>"candidate"</code></td><td><code>:writable-running</code> or <code>:candidate</code></td></tr>
<tr><td><code>config</code></td><td>XML with a root element <code>&amp;lt;config&amp;gt;</code> (a string or an lxml element)</td><td></td></tr>
<tr><td><code>default_operation</code></td><td>What to do where the XML has no <code>operation</code>: <code>merge</code> (the default), <code>replace</code> or <code>none</code></td><td></td></tr>
<tr><td><code>test_option</code></td><td><code>test-then-set</code>: validate first, then apply</td><td><code>:validate</code></td></tr>
<tr><td><code>error_option</code></td><td><code>stop-on-error</code>, <code>continue-on-error</code> or <code>rollback-on-error</code></td><td><code>rollback-on-error</code> needs its capability</td></tr></table>
<p>The reply object has <code>.ok</code>. An error does not return a false value; it raises <code>RPCError</code> (chapter 8).</p>

<h3>The operation attribute</h3>
<p>Put <code>nc:operation="..."</code> on any element, with the namespace <code>urn:ietf:params:xml:ns:netconf:base:1.0</code> declared as <code>nc</code>. It applies to that element and everything below it, until a lower element overrides it.</p>
<table class="cmp"><tr><th>Operation</th><th>Effect</th><th>If you run it twice</th></tr>
<tr><td><code>merge</code></td><td>Create if missing, otherwise update the leaves given</td><td>Same result: safe to repeat</td></tr>
<tr><td><code>replace</code></td><td>Put exactly this content in its place; leaves not given are removed</td><td>Same result: safe to repeat</td></tr>
<tr><td><code>create</code></td><td>Create; fail if it already exists</td><td>Error <code>data-exists</code></td></tr>
<tr><td><code>delete</code></td><td>Delete; fail if it does not exist</td><td>Error <code>data-missing</code></td></tr>
<tr><td><code>remove</code></td><td>Delete if it exists, otherwise do nothing</td><td>Same result: safe to repeat</td></tr></table>
<p>Here are all of them against a Loopback on R1, in the order create, create, merge, replace, delete, delete, remove:</p>
<pre class="code"><span class="c"># ops.py - the five operations on a list entry (a Loopback), IOS XE running</span>
from ncclient.operations import RPCError
from ncutil import connect

LOOP = "&lt;type&gt;ianaift:softwareLoopback&lt;/type&gt;&lt;description&gt;demo&lt;/description&gt;"


def body(op, extra=""):
    return """&lt;config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"
              xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;
    &lt;interface nc:operation="%s"&gt;&lt;name&gt;Loopback77&lt;/name&gt;%s&lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/config&gt;""" % (op, extra)


with connect("R1") as m:
    steps = [("create", LOOP), ("create", LOOP), ("merge", "&lt;description&gt;second&lt;/description&gt;"),
             ("replace", LOOP), ("delete", ""), ("delete", ""), ("remove", "")]
    for op, extra in steps:
        try:
            m.edit_config(target="running", config=body(op, extra))
            print("%-8s ok" % op)
        except RPCError as err:
            print("%-8s %s: %s" % (op, err.tag, err.message))</pre>
<pre class="out">AUTO01$ python3 ops.py
create   ok
create   <span class="hl">data-exists: interface Loopback77 already exists</span>
merge    ok
replace  ok
delete   ok
delete   <span class="hl">data-missing: interface Loopback77 does not exist</span>
remove   ok</pre>
<p>The two errors are the point of the exercise. <code>create</code> twice fails with <code>data-exists</code>, <code>delete</code> twice fails with <code>data-missing</code>. Neither is a bug in the device: they are the operations telling you the state was not what you assumed. For a script that must be safe to run again, prefer <code>merge</code>, <code>replace</code> and <code>remove</code>.</p>

<h3>The same operations on Junos</h3>
<p>On Junos the edit goes to the <b>candidate</b>, not to running, so nothing is live until you commit. The comparison below also reads the candidate back to show the effect of each step. (The lock and the discard are explained in the next chapter.)</p>
<pre class="code"><span class="c"># jops.py - the same operations on Junos (candidate; the lock is explained in the next chapter)</span>
from ncclient.operations import RPCError
from ncutil import connect

FLT = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;"


def body(attr="", text="DEMO"):
    return """&lt;config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;
    &lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;description %s&gt;%s&lt;/description&gt;
  &lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;
&lt;/config&gt;""" % (attr, text)


def candidate_description(m):
    return m.get_config(source="candidate", filter=("subtree", FLT)).data.findtext(".//{*}description")


with connect("J1") as m:
    with m.locked("candidate"):
        steps = [("merge", ""), ("create", 'nc:operation="create"'), ("replace", 'nc:operation="replace"'),
                 ("delete", 'nc:operation="delete"'), ("delete", 'nc:operation="delete"')]
        for label, attr in steps:
            try:
                m.edit_config(target="candidate", config=body(attr, "" if label == "delete" else "DEMO"))
                print("%-8s ok     candidate now: %s" % (label, candidate_description(m)))
            except RPCError as err:
                print("%-8s %s: %s" % (label, err.tag, err.message))
        m.discard_changes()</pre>
<pre class="out">AUTO01$ python3 jops.py
merge    ok     candidate now: DEMO
create   <span class="hl">data-exists: statement already exists</span>
replace  ok     candidate now: DEMO
delete   ok     candidate now: None
delete   ok     candidate now: None</pre>
<p><code>create</code> again fails with a <code>data-exists</code> error; <code>replace</code> and <code>merge</code> succeed; <code>delete</code> succeeds. In this lab a second <code>delete</code> of a statement that is already gone also returns ok, which is lenient. Real Junos may warn about a missing statement, so use <code>remove</code> when you mean "make sure it is not there".</p>

<h3>Applying it: the IOS XE push</h3>
<p>Lab 1, step 3 adds the first writer to <code>ifchange.py</code>. It builds a configuration in the standard ietf-interfaces and ietf-ip models from a description and an address such as <code>172.16.10.5/30</code>, and sends it to <b>running</b>. There is no operation attribute, so the default <code>merge</code> applies: the interface exists, so its description and address leaves are updated.</p>
<pre class="code"><span class="c"># ifchange.py, part 2 (Lab 1, step 3) - the IOS XE push</span>
def iosxe_config(ifname, description, address):
    ifc = ip_interface(address)
    return """&lt;config&gt;
  &lt;interfaces xmlns="%s"&gt;
    &lt;interface&gt;
      &lt;name&gt;%s&lt;/name&gt;
      &lt;description&gt;%s&lt;/description&gt;
      &lt;ipv4 xmlns="%s"&gt;
        &lt;address&gt;&lt;ip&gt;%s&lt;/ip&gt;&lt;netmask&gt;%s&lt;/netmask&gt;&lt;/address&gt;
      &lt;/ipv4&gt;
    &lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/config&gt;""" % (IETF, ifname, description, IETF_IP, ifc.ip, ifc.netmask)


def push_iosxe(m, ifname, description, address):
    """IOS XE: edit-config goes straight to running (:writable-running), no commit."""
    m.edit_config(target="running", config=iosxe_config(ifname, description, address))</pre>
<pre class="code"><span class="c"># try_r1.py</span>
from ifchange import push_iosxe, read_interface
from ncutil import connect

with connect("R1") as m:
    push_iosxe(m, "GigabitEthernet0/1", "TO-BLR-CORE", "172.16.10.5/30")
    print(read_interface(m, "iosxe", "GigabitEthernet0/1"))</pre>
<pre class="out">AUTO01$ python3 try_r1.py
('TO-BLR-CORE', <span class="hl">'172.16.10.5/30'</span>)</pre>
<p>Notice that the change is live the moment <code>edit_config</code> returns; there is no commit. That is what <code>:writable-running</code> means, and it is also why the read-back on the next line matters.</p>

<h3>Testing and saving</h3>
<p>Two extras depend on capabilities, as chapter 3 said.</p>
<pre class="code"><span class="c"># testopt.py - things that depend on capabilities</span>
from ncclient.operations import MissingCapabilityError
from ncutil import connect

CFG = """&lt;config&gt;&lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;
  &lt;interface&gt;&lt;name&gt;GigabitEthernet0/1&lt;/name&gt;&lt;description&gt;LINK-TO-PUN-OLD&lt;/description&gt;&lt;/interface&gt;
&lt;/interfaces&gt;&lt;/config&gt;"""

with connect("R1") as m:
    print("plain edit-config ok:", m.edit_config(target="running", config=CFG).ok)
    try:
        m.edit_config(target="running", config=CFG, test_option="test-then-set")
    except MissingCapabilityError as err:
        print("test_option -&gt;", type(err).__name__ + ":", err)
    print("save_config ok:", m.save_config().ok)</pre>
<pre class="out">AUTO01$ python3 testopt.py
plain edit-config ok: True
test_option -&gt; <span class="hl">MissingCapabilityError: Server does not support [:validate]</span>
save_config ok: True</pre>
<p><code>test_option="test-then-set"</code> needs <code>:validate</code>, which R1 does not advertise, so ncclient stops before sending. The <code>save_config()</code> call is an IOS XE extra from the <code>iosxe</code> handler: it asks the device to copy running to startup, like <code>write memory</code>. Editing running on IOS XE does not survive a reload until you save.</p>

<div class="warn"><p><b>Common mistake.</b> Using <code>replace</code> on the whole interface to change one description. <code>replace</code> removes everything you did not mention, such as the IP address. Use <code>merge</code> for "change this leaf", and <code>replace</code> only on a subtree whose full content you generate yourself.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default <code>default_operation</code> is <code>merge</code>. <code>create</code> fails on an existing node, <code>delete</code> fails on a missing one, <code>remove</code> never fails for either reason.</p></div>

<div class="scn"><h4>The second run that broke</h4><p>A new-site script created a Loopback with <code>operation="create"</code>. It worked on the first night. When the job was run again after a power cut, every router returned <code>data-exists</code> and the whole run reported failure, though every Loopback was exactly as wanted. Changing the operation to <code>merge</code> made the job safe to repeat.</p><p><b>Lesson:</b> a good change script ends in the same state however many times you run it.</p></div>

<div class="iv"><p class="q">"What are the NETCONF edit operations and which are idempotent?"</p><p>merge, replace, create, delete and remove. merge, replace and remove give the same end state when repeated. create fails with data-exists if the node is there, and delete fails with data-missing if it is not. For repeatable automation I choose merge or replace, and remove for deletions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>edit_config(target, config)</code> merges the XML into the target datastore; errors raise <code>RPCError</code>.</li>
<li>Per-element <code>nc:operation</code>: merge, replace, create, delete, remove.</li>
<li>create and delete are strict; merge, replace and remove are safe to repeat.</li>
<li>On IOS XE the edit goes to running and is live at once; save it with <code>save_config()</code>.</li>
<li><code>test_option</code> needs <code>:validate</code>; ncclient checks that before it sends.</li>
</ul></div>
`,hi:`
<p>Ab woh hissa jo cheezein badalta hai. <code>edit_config</code> configuration ka ek tukda bhejta hai aur device ko batata hai ki use jo pehle se hai uske saath kaise milana hai. Yeh chhota hai, par automation ke lagbhag har outage wali galti isi call mein hoti hai: galat target, aisa payload jo aapke irade se zyada replace kar de, ya aisa operation jo doosri baar chalane par fail ho.</p>

<h3>Analogy: margin mein hidayatein</h3>
<p>Shared folder mein ek contract socho. Aap use dobara nahi likhte; aap margin mein notes ke saath marked-up page bhejte ho: "yeh clause jodo", "yeh paragraph badlo", "yeh line kaato". <code>edit_config</code> woh marked-up page hai. XML text hai; margin ka note <code>operation</code> attribute hai.</p>

<h3>Call aur uske arguments</h3>
<p><code>m.edit_config(target=..., config=..., default_operation=..., test_option=..., error_option=...)</code></p>
<table class="cmp"><tr><th>Argument</th><th>Matlab</th><th>Kya chahiye</th></tr>
<tr><td><code>target</code></td><td>Jo datastore badalna hai: <code>"running"</code> ya <code>"candidate"</code></td><td><code>:writable-running</code> ya <code>:candidate</code></td></tr>
<tr><td><code>config</code></td><td>Root element <code>&amp;lt;config&amp;gt;</code> wala XML (string ya lxml element)</td><td></td></tr>
<tr><td><code>default_operation</code></td><td>Jahan XML mein <code>operation</code> nahi, wahan kya karna hai: <code>merge</code> (default), <code>replace</code> ya <code>none</code></td><td></td></tr>
<tr><td><code>test_option</code></td><td><code>test-then-set</code>: pehle validate, phir apply</td><td><code>:validate</code></td></tr>
<tr><td><code>error_option</code></td><td><code>stop-on-error</code>, <code>continue-on-error</code> ya <code>rollback-on-error</code></td><td><code>rollback-on-error</code> ko apni capability chahiye</td></tr></table>
<p>Reply object mein <code>.ok</code> hota hai. Error false value nahi lautata; woh <code>RPCError</code> raise karta hai (chapter 8).</p>

<h3>Operation attribute</h3>
<p>Kisi bhi element par <code>nc:operation="..."</code> lagao, namespace <code>urn:ietf:params:xml:ns:netconf:base:1.0</code> ko <code>nc</code> declare karke. Yeh us element aur uske neeche sab par lagta hai, jab tak koi neeche wala element use override na kare.</p>
<table class="cmp"><tr><th>Operation</th><th>Asar</th><th>Do baar chalao to</th></tr>
<tr><td><code>merge</code></td><td>Na ho to banao, warna diye gaye leaves update karo</td><td>Wahi result: repeat karna safe</td></tr>
<tr><td><code>replace</code></td><td>Bilkul yahi content uski jagah rakho; jo leaves nahi diye woh hat jaate hain</td><td>Wahi result: repeat karna safe</td></tr>
<tr><td><code>create</code></td><td>Banao; pehle se ho to fail</td><td>Error <code>data-exists</code></td></tr>
<tr><td><code>delete</code></td><td>Hatao; na ho to fail</td><td>Error <code>data-missing</code></td></tr>
<tr><td><code>remove</code></td><td>Ho to hatao, warna kuch nahi</td><td>Wahi result: repeat karna safe</td></tr></table>
<p>Yeh sab R1 par ek Loopback ke against, is order mein: create, create, merge, replace, delete, delete, remove:</p>
<pre class="code"><span class="c"># ops.py - the five operations on a list entry (a Loopback), IOS XE running</span>
from ncclient.operations import RPCError
from ncutil import connect

LOOP = "&lt;type&gt;ianaift:softwareLoopback&lt;/type&gt;&lt;description&gt;demo&lt;/description&gt;"


def body(op, extra=""):
    return """&lt;config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"
              xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;
    &lt;interface nc:operation="%s"&gt;&lt;name&gt;Loopback77&lt;/name&gt;%s&lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/config&gt;""" % (op, extra)


with connect("R1") as m:
    steps = [("create", LOOP), ("create", LOOP), ("merge", "&lt;description&gt;second&lt;/description&gt;"),
             ("replace", LOOP), ("delete", ""), ("delete", ""), ("remove", "")]
    for op, extra in steps:
        try:
            m.edit_config(target="running", config=body(op, extra))
            print("%-8s ok" % op)
        except RPCError as err:
            print("%-8s %s: %s" % (op, err.tag, err.message))</pre>
<pre class="out">AUTO01$ python3 ops.py
create   ok
create   <span class="hl">data-exists: interface Loopback77 already exists</span>
merge    ok
replace  ok
delete   ok
delete   <span class="hl">data-missing: interface Loopback77 does not exist</span>
remove   ok</pre>
<p>Do errors hi is exercise ka maksad hain. <code>create</code> do baar <code>data-exists</code> se fail hota hai, <code>delete</code> do baar <code>data-missing</code> se. Dono device ke bug nahi hain: yeh operations aapko bata rahe hain ki state woh nahi thi jo aapne maani. Jo script dobara chalane par safe honi chahiye, usme <code>merge</code>, <code>replace</code> aur <code>remove</code> prefer karo.</p>

<h3>Junos par wahi operations</h3>
<p>Junos par edit <b>candidate</b> mein jaata hai, running mein nahi, isliye commit tak kuch live nahi hota. Neeche ka comparison har step ka asar dikhane ke liye candidate ko wapas bhi padhta hai. (Lock aur discard agle chapter mein samjhaye gaye hain.)</p>
<pre class="code"><span class="c"># jops.py - the same operations on Junos (candidate; the lock is explained in the next chapter)</span>
from ncclient.operations import RPCError
from ncutil import connect

FLT = "&lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;&lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;"


def body(attr="", text="DEMO"):
    return """&lt;config xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;configuration&gt;&lt;interfaces&gt;&lt;interface&gt;
    &lt;name&gt;ge-0/0/2&lt;/name&gt;&lt;description %s&gt;%s&lt;/description&gt;
  &lt;/interface&gt;&lt;/interfaces&gt;&lt;/configuration&gt;
&lt;/config&gt;""" % (attr, text)


def candidate_description(m):
    return m.get_config(source="candidate", filter=("subtree", FLT)).data.findtext(".//{*}description")


with connect("J1") as m:
    with m.locked("candidate"):
        steps = [("merge", ""), ("create", 'nc:operation="create"'), ("replace", 'nc:operation="replace"'),
                 ("delete", 'nc:operation="delete"'), ("delete", 'nc:operation="delete"')]
        for label, attr in steps:
            try:
                m.edit_config(target="candidate", config=body(attr, "" if label == "delete" else "DEMO"))
                print("%-8s ok     candidate now: %s" % (label, candidate_description(m)))
            except RPCError as err:
                print("%-8s %s: %s" % (label, err.tag, err.message))
        m.discard_changes()</pre>
<pre class="out">AUTO01$ python3 jops.py
merge    ok     candidate now: DEMO
create   <span class="hl">data-exists: statement already exists</span>
replace  ok     candidate now: DEMO
delete   ok     candidate now: None
delete   ok     candidate now: None</pre>
<p>Dobara <code>create</code> <code>data-exists</code> error se fail hota hai; <code>replace</code> aur <code>merge</code> chalte hain; <code>delete</code> chalta hai. Is lab mein jo statement pehle se hat chuka hai uska dusra <code>delete</code> bhi ok deta hai, jo lenient hai. Asli Junos missing statement par warning de sakta hai, isliye "pakka karo ki yeh na ho" ke liye <code>remove</code> use karo.</p>

<h3>Lagana: IOS XE push</h3>
<p>Lab 1 ka step 3 <code>ifchange.py</code> mein pehla writer jodta hai. Woh description aur <code>172.16.10.5/30</code> jaise address se standard ietf-interfaces aur ietf-ip models mein configuration banata hai, aur use <b>running</b> mein bhejta hai. Operation attribute nahi hai, isliye default <code>merge</code> lagta hai: interface hai, to uske description aur address leaves update hote hain.</p>
<pre class="code"><span class="c"># ifchange.py, part 2 (Lab 1, step 3) - the IOS XE push</span>
def iosxe_config(ifname, description, address):
    ifc = ip_interface(address)
    return """&lt;config&gt;
  &lt;interfaces xmlns="%s"&gt;
    &lt;interface&gt;
      &lt;name&gt;%s&lt;/name&gt;
      &lt;description&gt;%s&lt;/description&gt;
      &lt;ipv4 xmlns="%s"&gt;
        &lt;address&gt;&lt;ip&gt;%s&lt;/ip&gt;&lt;netmask&gt;%s&lt;/netmask&gt;&lt;/address&gt;
      &lt;/ipv4&gt;
    &lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/config&gt;""" % (IETF, ifname, description, IETF_IP, ifc.ip, ifc.netmask)


def push_iosxe(m, ifname, description, address):
    """IOS XE: edit-config goes straight to running (:writable-running), no commit."""
    m.edit_config(target="running", config=iosxe_config(ifname, description, address))</pre>
<pre class="code"><span class="c"># try_r1.py</span>
from ifchange import push_iosxe, read_interface
from ncutil import connect

with connect("R1") as m:
    push_iosxe(m, "GigabitEthernet0/1", "TO-BLR-CORE", "172.16.10.5/30")
    print(read_interface(m, "iosxe", "GigabitEthernet0/1"))</pre>
<pre class="out">AUTO01$ python3 try_r1.py
('TO-BLR-CORE', <span class="hl">'172.16.10.5/30'</span>)</pre>
<p>Dhyan do ki <code>edit_config</code> lautte hi change live hai; commit nahi hota. <code>:writable-running</code> ka yahi matlab hai, aur isiliye agli line ka read-back zaroori hai.</p>

<h3>Test aur save</h3>
<p>Do extras capabilities par nirbhar hain, jaisa chapter 3 ne kaha.</p>
<pre class="code"><span class="c"># testopt.py - things that depend on capabilities</span>
from ncclient.operations import MissingCapabilityError
from ncutil import connect

CFG = """&lt;config&gt;&lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;
  &lt;interface&gt;&lt;name&gt;GigabitEthernet0/1&lt;/name&gt;&lt;description&gt;LINK-TO-PUN-OLD&lt;/description&gt;&lt;/interface&gt;
&lt;/interfaces&gt;&lt;/config&gt;"""

with connect("R1") as m:
    print("plain edit-config ok:", m.edit_config(target="running", config=CFG).ok)
    try:
        m.edit_config(target="running", config=CFG, test_option="test-then-set")
    except MissingCapabilityError as err:
        print("test_option -&gt;", type(err).__name__ + ":", err)
    print("save_config ok:", m.save_config().ok)</pre>
<pre class="out">AUTO01$ python3 testopt.py
plain edit-config ok: True
test_option -&gt; <span class="hl">MissingCapabilityError: Server does not support [:validate]</span>
save_config ok: True</pre>
<p><code>test_option="test-then-set"</code> ko <code>:validate</code> chahiye, jo R1 advertise nahi karta, isliye ncclient bhejne se pehle ruk jaata hai. <code>save_config()</code> <code>iosxe</code> handler ka IOS XE extra hai: yeh device se running ko startup mein copy karne ko kehta hai, <code>write memory</code> jaisa. IOS XE par running edit karne ke baad save kiye bina reload par change nahi bachta.</p>

<div class="warn"><p><b>Common mistake.</b> Ek description badalne ke liye poore interface par <code>replace</code> use karna. <code>replace</code> jo aapne nahi likha woh sab hata deta hai, jaise IP address. "Yeh leaf badlo" ke liye <code>merge</code>; <code>replace</code> sirf aise subtree par jiska poora content aap khud generate karte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>default_operation</code> ka default <code>merge</code> hai. <code>create</code> maujooda node par fail hota hai, <code>delete</code> missing par fail hota hai, <code>remove</code> in dono wajah se kabhi fail nahi hota.</p></div>

<div class="scn"><h4>Doosri run jo toot gayi</h4><p>Ek new-site script ne <code>operation="create"</code> se Loopback banaya. Pehli raat chala. Power cut ke baad jab job dobara chali, har router ne <code>data-exists</code> diya aur poori run failure report hui, jabki har Loopback bilkul waisa tha jaisa chahiye tha. Operation ko <code>merge</code> karne se job repeat karne par safe ho gayi.</p><p><b>Lesson:</b> achhi change script kitni bhi baar chalao, usi state par khatam hoti hai.</p></div>

<div class="iv"><p class="q">"NETCONF edit operations kaun se hain aur kaun idempotent hain?"</p><p>merge, replace, create, delete aur remove. merge, replace aur remove repeat karne par wahi end state dete hain. create node ho to data-exists se fail hota hai, aur delete node na ho to data-missing se. Repeatable automation ke liye main merge ya replace chunta hoon, aur deletion ke liye remove.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>edit_config(target, config)</code> XML ko target datastore mein merge karta hai; errors <code>RPCError</code> raise karte hain.</li>
<li>Per-element <code>nc:operation</code>: merge, replace, create, delete, remove.</li>
<li>create aur delete strict hain; merge, replace aur remove repeat karne par safe hain.</li>
<li>IOS XE par edit running mein jaata hai aur turant live hota hai; <code>save_config()</code> se save karo.</li>
<li><code>test_option</code> ko <code>:validate</code> chahiye; ncclient bhejne se pehle yeh check karta hai.</li>
</ul></div>
`}};export{e as default};