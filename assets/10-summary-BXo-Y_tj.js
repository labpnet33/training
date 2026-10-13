var e={id:`summary`,h:{en:`Summary, checklist and cheat-sheet`,hi:`Summary, checklist aur cheat-sheet`},body:{en:`
<p>You started with a pizza shop and finish with a streaming collector that computes bits per second and names the flapping port. This chapter is your revision sheet: a can-do checklist, a glossary, the facts that examiners and interviewers love, and a cheat-sheet to keep next to your keyboard.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why gNMI streaming sees events that SNMP polling misses, and name the four RPCs.</li>
<li>Enable the gNMI server on EOS, IOS XE and Junos, and say which port each uses.</li>
<li>Write a path with a key, a wildcard and an origin, and say what config and state mean.</li>
<li>Connect with <code>gNMIclient</code>, call <code>capabilities()</code>, and choose an encoding the device supports.</li>
<li>Read state with <code>get()</code>, flatten the reply, and use <code>datatype</code>.</li>
<li>Change a leaf with <code>set(update=...)</code>, read it back, and confirm it in the device CLI.</li>
<li>Write subscriptions in stream, once and poll modes, with sample, on_change and target_defined.</li>
<li>Turn two octet samples into bits per second using device timestamps, with guards.</li>
<li>Detect a flapping port from on_change events.</li>
<li>Read UNAVAILABLE, UNAUTHENTICATED, PERMISSION_DENIED, NOT_FOUND and INVALID_ARGUMENT and name the fix.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>gRPC</dt><dd>Remote procedure call framework over h&#116;tp/2 with protobuf messages and long-lived streams.</dd>
<dt>gNMI</dt><dd>OpenConfig service on gRPC with Capabilities, Get, Set and Subscribe.</dd>
<dt>OpenConfig</dt><dd>Vendor-neutral YANG models for interfaces, system, routing and more.</dd>
<dt>Path</dt><dd>Address in the model tree: containers, lists with keys, leaves.</dd>
<dt>Origin</dt><dd>Prefix naming the model family, such as openconfig or cli.</dd>
<dt>Encoding</dt><dd>Wire format of values: json, json_ietf, proto, ascii.</dd>
<dt>Notification</dt><dd>One timestamped group of updates in a reply or stream.</dd>
<dt>sync_response</dt><dd>Marker that all initial values have been delivered.</dd>
<dt>sample / on_change / target_defined</dt><dd>Per-path subscription modes: periodic, event-driven, device's choice.</dd>
<dt>heartbeat_interval</dt><dd>Resend an unchanged value after this many nanoseconds.</dd>
<dt>Flap</dt><dd>Repeated up and down changes of an interface in a short time.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>gNMI operations</td><td>Capabilities, Get, Set, Subscribe</td></tr>
<tr><td>Dial-in or dial-out?</td><td>Dial-in: the client connects</td></tr>
<tr><td>Ports</td><td>EOS 6030; IOS XE 50052 plaintext and 9339 secure; Junos 32767 clear-text</td></tr>
<tr><td>sample_interval unit</td><td>Nanoseconds</td></tr>
<tr><td>on_change on counters</td><td>Not allowed; use sample</td></tr>
<tr><td>Refused vs timeout</td><td>Refused = live host, closed port. Timeout = no answer</td></tr>
<tr><td>Socket closed</td><td>Plaintext client against a TLS listener</td></tr>
<tr><td>insecure vs skip_verify</td><td>No TLS at all vs TLS without validation</td></tr>
<tr><td>UNAUTHENTICATED vs PERMISSION_DENIED</td><td>Unknown identity vs known but not allowed</td></tr>
<tr><td>Update vs replace</td><td>Merge vs overwrite the path</td></tr></table>

<h3>Cheat-sheet</h3>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

with gNMIclient(target=(host, 6030), username=u, password=p, insecure=True) as gc:
    gc.capabilities()                                     <span class="c"># version, encodings, models</span>
    gc.get(path=["/interfaces/interface[name=*]/state/oper-status"], datatype="state")
    gc.set(update=[("/interfaces/interface[name=Ethernet3]/config/description", "text")])
    gc.set(replace=[(path, value)], delete=[path])
    gc.subscribe2(subscribe={"subscription": [{"path": p, "mode": "sample",
                  "sample_interval": 10 * 1000000000}], "mode": "stream"})
<span class="c"># TLS: skip insecure=True and add path_root=, override= (or skip_verify=True for tests)</span>
<span class="c"># EOS: show management api gnmi        IOS XE: show gnxi state</span>
<span class="c"># Junos: show configuration system services extension-service | display set</span></pre>

<div class="eg"><p><b>Lab recap.</b> Lab 1 gave you cap.py, snap.py, once.py, rates.py, ifmon.py and fix.py on AUTO01 against LEAF1. Lab 2 gave you five faults in gnmi_audit.py: port 6042, TLS on LEAF2, a password typo, a read-only account used for Set, and the path typo counter.</p></div>
<div class="warn"><p><b>Common mistakes to remember.</b> Seconds instead of nanoseconds. A path string instead of a list. insecure=True against TLS. A replace on a container. Rates from the local clock.</p></div>
<div class="exam"><p><b>Exam trap.</b> Reading a status code as the whole story. The code names the layer; the detail text names the cause.</p></div>
<div class="note"><p><b>Next steps.</b> NETCONF in <code>adv-netconf</code> is the transactional XML cousin of Set, and <code>adv-xml</code> teaches the parsing it needs. For many devices, collectors such as gnmic or a Telegraf input repeat the Subscribe you wrote here at scale.</p></div>

<div class="scn"><h4>From Python to production</h4><p>A team moved the ifmon.py idea into a collector: one subscription per port, rates computed from device timestamps, oper-status changes pushed to chat. They added a read-only account, TLS with a company CA, and a heartbeat so a silent stream raised an alert.</p><p><b>Lesson:</b> the lab script is the prototype; the habits (device timestamps, guards, read-back, least privilege) are what you ship.</p></div>
<div class="iv"><p class="q">"Walk me through building interface monitoring with gNMI."</p><p>Capabilities to pick the encoding, a stream with sample on counters and on_change on oper-status, rates from device timestamps with reset guards, a flap rule such as three changes in a window, TLS and a read-only account, and a heartbeat to detect a silent stream.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four RPCs, one pygnmi call each.</li>
<li>Paths, encodings and ports are vendor-aware; ask the device.</li>
<li>Read back every Set and confirm on the device.</li>
<li>Counters need sample, status needs on_change; rates use device timestamps.</li>
<li>Status code first, detail text second.</li></ul></div>
`,hi:`
<p>Aapne pizza shop se shuru kiya aur ab ek streaming collector par khatam kar rahe ho jo bits per second nikalta hai aur flapping port ka naam batata hai. Yeh chapter aapki revision sheet hai: can-do checklist, glossary, woh facts jo examiners aur interviewers ko pasand hain, aur keyboard ke paas rakhne layak cheat-sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki gNMI streaming woh events kyon dekhti hai jo SNMP polling miss karti hai, aur chaar RPCs ke naam batao.</li>
<li>EOS, IOS XE aur Junos par gNMI server enable karo, aur batao har ek kaunsa port use karta hai.</li>
<li>Key, wildcard aur origin wala path likho, aur batao config aur state ka kya matlab hai.</li>
<li><code>gNMIclient</code> se connect karo, <code>capabilities()</code> call karo, aur device ki supported encoding chuno.</li>
<li><code>get()</code> se state padho, reply flatten karo, aur <code>datatype</code> use karo.</li>
<li><code>set(update=...)</code> se leaf badlo, wapas padho, aur device CLI mein confirm karo.</li>
<li>Stream, once aur poll modes mein subscriptions likho, sample, on_change aur target_defined ke saath.</li>
<li>Guards ke saath device timestamps se do octet samples ko bits per second mein badlo.</li>
<li>on_change events se flapping port pakdo.</li>
<li>UNAVAILABLE, UNAUTHENTICATED, PERMISSION_DENIED, NOT_FOUND aur INVALID_ARGUMENT padho aur fix batao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>gRPC</dt><dd>h&#116;tp/2 par remote procedure call framework, protobuf messages aur lambi streams ke saath.</dd>
<dt>gNMI</dt><dd>gRPC par OpenConfig service: Capabilities, Get, Set aur Subscribe.</dd>
<dt>OpenConfig</dt><dd>Interfaces, system, routing aur aur cheezon ke liye vendor-neutral YANG models.</dd>
<dt>Path</dt><dd>Model tree mein address: containers, keys wali lists, leaves.</dd>
<dt>Origin</dt><dd>Model family ka naam batane wala prefix, jaise openconfig ya cli.</dd>
<dt>Encoding</dt><dd>Values ka wire format: json, json_ietf, proto, ascii.</dd>
<dt>Notification</dt><dd>Reply ya stream mein updates ka ek timestamp wala group.</dd>
<dt>sync_response</dt><dd>Marker ki saari shuruaati values pahunch gayi.</dd>
<dt>sample / on_change / target_defined</dt><dd>Per-path subscription modes: periodic, event-driven, device ki pasand.</dd>
<dt>heartbeat_interval</dt><dd>Utne nanoseconds baad na badli hui value dobara bhejo.</dd>
<dt>Flap</dt><dd>Interface ka chhote waqt mein baar-baar up aur down badalna.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>gNMI operations</td><td>Capabilities, Get, Set, Subscribe</td></tr>
<tr><td>Dial-in ya dial-out?</td><td>Dial-in: client connect karta hai</td></tr>
<tr><td>Ports</td><td>EOS 6030; IOS XE 50052 plaintext aur 9339 secure; Junos 32767 clear-text</td></tr>
<tr><td>sample_interval ki unit</td><td>Nanoseconds</td></tr>
<tr><td>Counters par on_change</td><td>Allowed nahi; sample use karo</td></tr>
<tr><td>Refused vs timeout</td><td>Refused = zinda host, band port. Timeout = jawab nahi</td></tr>
<tr><td>Socket closed</td><td>TLS listener ke saamne plaintext client</td></tr>
<tr><td>insecure vs skip_verify</td><td>Bilkul TLS nahi vs validation ke bina TLS</td></tr>
<tr><td>UNAUTHENTICATED vs PERMISSION_DENIED</td><td>Anjaan pehchan vs pehchani par allowed nahi</td></tr>
<tr><td>Update vs replace</td><td>Merge vs path overwrite</td></tr></table>

<h3>Cheat-sheet</h3>
<pre class="code">from pygnmi.client import gNMIclient, gNMIException

with gNMIclient(target=(host, 6030), username=u, password=p, insecure=True) as gc:
    gc.capabilities()                                     <span class="c"># version, encodings, models</span>
    gc.get(path=["/interfaces/interface[name=*]/state/oper-status"], datatype="state")
    gc.set(update=[("/interfaces/interface[name=Ethernet3]/config/description", "text")])
    gc.set(replace=[(path, value)], delete=[path])
    gc.subscribe2(subscribe={"subscription": [{"path": p, "mode": "sample",
                  "sample_interval": 10 * 1000000000}], "mode": "stream"})
<span class="c"># TLS: insecure=True hatao aur path_root=, override= jodo (test ke liye skip_verify=True)</span>
<span class="c"># EOS: show management api gnmi        IOS XE: show gnxi state</span>
<span class="c"># Junos: show configuration system services extension-service | display set</span></pre>

<div class="eg"><p><b>Lab recap.</b> Lab 1 ne AUTO01 par LEAF1 ke khilaf cap.py, snap.py, once.py, rates.py, ifmon.py aur fix.py diye. Lab 2 ne gnmi_audit.py mein paanch faults diye: port 6042, LEAF2 par TLS, password ki typo, Set ke liye read-only account, aur path typo counter.</p></div>
<div class="warn"><p><b>Yaad rakhne wali aam galtiyan.</b> Nanoseconds ki jagah seconds. List ki jagah path string. TLS ke saamne insecure=True. Container par replace. Local clock se rates.</p></div>
<div class="exam"><p><b>Exam trap.</b> Status code ko poori kahani samajhna. Code layer batata hai; detail text karan.</p></div>
<div class="note"><p><b>Aage kya.</b> <code>adv-netconf</code> mein NETCONF Set ka transactional XML cousin hai, aur <code>adv-xml</code> uski zaroori parsing sikhata hai. Bahut devices ke liye gnmic jaise collectors ya Telegraf input wahi Subscribe bade scale par dohrate hain jo aapne yahan likha.</p></div>

<div class="scn"><h4>Python se production tak</h4><p>Ek team ne ifmon.py ka idea collector mein daala: har port ke liye ek subscription, device timestamps se rates, oper-status changes chat mein push. Unhone read-only account, company CA ke saath TLS, aur heartbeat jodi taaki khamosh stream alert uthaye.</p><p><b>Lesson:</b> lab script prototype hai; aadatein (device timestamps, guards, read-back, least privilege) woh hain jo aap ship karte ho.</p></div>
<div class="iv"><p class="q">"gNMI se interface monitoring banane ka tareeka batao."</p><p>Encoding chunne ke liye Capabilities, counters par sample aur oper-status par on_change wali stream, reset guards ke saath device timestamps se rates, flap rule jaise window mein teen changes, TLS aur read-only account, aur khamosh stream pakadne ke liye heartbeat.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar RPCs, har ek ka ek pygnmi call.</li>
<li>Paths, encodings aur ports vendor-aware hain; device se poochho.</li>
<li>Har Set ko read-back karo aur device par confirm karo.</li>
<li>Counters ko sample, status ko on_change; rates device timestamps se.</li>
<li>Pehle status code, phir detail text.</li></ul></div>
`}};export{e as default};