var e={id:`netconf-protocol`,h:{en:`NETCONF: layers, hello, RPCs and datastores`,hi:`NETCONF: layers, hello, RPCs aur datastores`},body:{en:`
<p>Picture a formal meeting between two company lawyers. They first exchange business cards that list what each firm can do (the <b>hello</b> with <b>capabilities</b>). Then one hands over numbered written requests (<b>RPCs</b> with a <b>message-id</b>); the other returns a numbered written reply for each. Before changing a shared contract, one lawyer can put a <b>lock</b> on it so nobody else edits at the same time, and drafts can be prepared on a copy (the <b>candidate</b>) before being signed into the live contract (<b>commit</b>). That meeting is NETCONF.</p>

<h3>What NETCONF is</h3>
<p><b>NETCONF</b> (Network Configuration Protocol) is defined in <b>RFC 6241</b>; running it over SSH is RFC 6242. It runs as an <b>SSH subsystem</b> named <code>netconf</code> on <b>TCP 830</b>, and all messages are <b>XML</b>. It was designed for configuration management at scale, so it has features REST APIs lack: separate configuration datastores, locking, validation, and all-or-nothing transactions.</p>

<h3>The four layers</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NETCONF layers">
<rect x="120" y="15" width="400" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Content: YANG-modelled XML data</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="11">&lt;interfaces&gt;...&lt;/interfaces&gt;</text>
<rect x="120" y="67" width="400" height="42" rx="8" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Operations: get-config, edit-config, get, lock...</text>
<rect x="120" y="119" width="400" height="42" rx="8" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Messages: rpc, rpc-reply, notification</text>
<rect x="120" y="171" width="400" height="42" rx="8" fill="#fde68a"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Secure transport: SSH, TCP 830</text>
</svg><p class="cap">NETCONF layers from top to bottom. The exam likes to ask which layer an element belongs to.</p></div>

<h3>Session start: hello and capabilities</h3>
<p>As soon as the SSH subsystem opens, <b>both</b> sides send a <code>&lt;hello&gt;</code>. The server's hello lists its <b>capabilities</b> and a <b>session-id</b>. Capabilities are URNs: base protocol versions, optional features, and every YANG module with its revision. In Lab 1 task 3 you open the session with <code>netconf 192.168.50.1 -u devnet:DevNet123</code> and see:</p>
<pre class="out">Connected to 192.168.50.1 port 830 (SSH subsystem "netconf") as devnet
&lt;&lt;&lt; server hello
&lt;hello xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;capabilities&gt;
    &lt;capability&gt;urn:ietf:params:netconf:base:1.0&lt;/capability&gt;
<span class="hl">    &lt;capability&gt;urn:ietf:params:netconf:base:1.1&lt;/capability&gt;</span>
<span class="hl">    &lt;capability&gt;urn:ietf:params:netconf:capability:writable-running:1.0&lt;/capability&gt;</span>
    &lt;capability&gt;urn:ietf:params:netconf:capability:xpath:1.0&lt;/capability&gt;
    &lt;capability&gt;urn:ietf:params:netconf:capability:rollback-on-error:1.0&lt;/capability&gt;
    &lt;capability&gt;urn:ietf:params:xml:ns:yang:ietf-interfaces?module=ietf-interfaces&amp;amp;revision=2018-02-20&lt;/capability&gt;
    ...
  &lt;/capabilities&gt;
  &lt;session-id&gt;31&lt;/session-id&gt;
&lt;/hello&gt;
]]&gt;]]&gt;</pre>
<p>Read it like a menu. <code>base:1.1</code> means the newer chunked framing can be used; <code>base:1.0</code> uses the end marker <code>]]&gt;]]&gt;</code>. <code>:writable-running</code> means you may edit the running datastore directly. <code>:candidate</code> is <b>missing</b>, so this router has no candidate datastore. <code>:xpath</code> means XPath filters are accepted. <code>:rollback-on-error</code> means a failed edit leaves nothing half-applied.</p>

<h3>Messages: rpc and rpc-reply</h3>
<p>Every request is an <code>&lt;rpc&gt;</code> with a <code>message-id</code>; the answer is an <code>&lt;rpc-reply&gt;</code> with the same id, containing <code>&lt;data&gt;</code>, <code>&lt;ok/&gt;</code> or <code>&lt;rpc-error&gt;</code>. Event messages (<code>&lt;notification&gt;</code>) are used for subscriptions and telemetry.</p>
<pre class="code">&lt;rpc message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;get-config&gt;
    &lt;source&gt;&lt;running/&gt;&lt;/source&gt;
    &lt;filter type="xpath" select="/if:interfaces"/&gt;
  &lt;/get-config&gt;
&lt;/rpc&gt;</pre>

<h3>The operations</h3>
<table class="cmp"><tr><th>Operation</th><th>What it does</th></tr>
<tr><td><code>get-config</code></td><td>Read configuration from one datastore (running, candidate or startup)</td></tr>
<tr><td><code>get</code></td><td>Read configuration <b>and</b> operational state (config false data)</td></tr>
<tr><td><code>edit-config</code></td><td>Change a target datastore with an XML <code>&lt;config&gt;</code> body</td></tr>
<tr><td><code>copy-config</code> / <code>delete-config</code></td><td>Copy a whole datastore (e.g. running to startup) / delete one (never running)</td></tr>
<tr><td><code>lock</code> / <code>unlock</code></td><td>Exclusive access to a datastore for this session</td></tr>
<tr><td><code>commit</code> / <code>discard-changes</code></td><td>Apply or throw away the candidate (needs <code>:candidate</code>)</td></tr>
<tr><td><code>validate</code></td><td>Check a datastore without applying it (needs <code>:validate</code>)</td></tr>
<tr><td><code>close-session</code> / <code>kill-session</code></td><td>End your session / force-end another</td></tr></table>

<h3>Datastores</h3>
<ul>
<li><b>running</b>: the active configuration. Always present.</li>
<li><b>startup</b>: loaded at boot (<code>:startup</code> capability). Save with <code>copy-config</code> running to startup.</li>
<li><b>candidate</b>: a scratch pad. You build a whole change, <code>validate</code> it, then <code>commit</code> it to running in one step, or <code>discard-changes</code>. Only with <code>:candidate</code>; IOS XE enables it with <code>netconf-yang feature candidate-datastore</code>.</li>
</ul>
<p>Newer RFC 8342 (NMDA) adds <b>intended</b> and <b>operational</b> datastores; you only need to know that operational holds the live state.</p>

<div class="eg"><p><b>Worked example.</b> A safe multi-device change with a candidate-capable box: <code>lock</code> running, <code>lock</code> candidate, <code>edit-config</code> target candidate, <code>validate</code>, <code>commit</code>, <code>unlock</code> both. If any device rejects its edit, the script sends <code>discard-changes</code> everywhere and nothing reached running. On R1, which only has <code>:writable-running</code>, you would <code>lock running</code>, send <code>edit-config</code> to running (rollback-on-error protects you), then <code>unlock running</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sending <code>commit</code> on a device that did not advertise <code>:candidate</code>. The reply is an <code>&lt;rpc-error&gt;</code> with <code>operation-not-supported</code>. Always read the hello first.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get</code> returns config <b>and</b> state; <code>get-config</code> returns config only. NETCONF uses XML only (not JSON). Port 830, SSH subsystem. The layer holding <code>&lt;rpc&gt;</code> is Messages; <code>&lt;get-config&gt;</code> is Operations.</p></div>

<div class="scn"><h4>Two tools, one lock</h4><p>A nightly compliance tool locked the running datastore with NETCONF and crashed without unlocking. In the morning every automation job failed with <code>lock-denied</code> or <code>in-use</code>. <code>show netconf-yang sessions</code> showed the stale session holding global lock R. The engineer cleared it (<code>clear netconf-yang session</code> on the device, or <code>kill-session</code> from a client) and added a timeout and a finally-unlock to the tool.</p><p><b>Lesson:</b> locks protect changes, but a forgotten lock blocks everyone; always unlock and monitor sessions.</p></div>

<div class="iv"><p class="q">"What happens when a NETCONF session starts, and why does it matter?"</p><p>Strong answer: the client opens SSH to port 830 and requests the netconf subsystem; both sides exchange hello messages; the server's hello carries capabilities (base 1.0/1.1, writable-running, candidate, xpath, rollback-on-error and every YANG module with revision) and a session-id. It matters because the client learns which datastores, operations and models it may use before sending any RPC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NETCONF: RFC 6241, SSH subsystem on TCP 830, XML encoding.</li>
<li>Layers: content, operations, messages, secure transport.</li>
<li>Hello exchanges capabilities; they decide what you may do (candidate, writable-running, xpath).</li>
<li>Datastores: running, startup, candidate (commit/discard-changes).</li>
<li><code>get</code> = config + state; <code>get-config</code> = config; <code>edit-config</code> changes a target; lock/unlock protect it.</li>
</ul></div>
`,hi:`
<p>Do companies ke lawyers ki ek formal meeting socho. Pehle woh business cards exchange karte hain jinme likha hai ki har firm kya kar sakti hai (<b>capabilities</b> ke saath <b>hello</b>). Phir ek numbered written requests deta hai (<b>message-id</b> ke saath <b>RPCs</b>); doosra har ek ka numbered written reply lautata hai. Shared contract badalne se pehle ek lawyer us par <b>lock</b> laga sakta hai taaki usi waqt koi aur edit na kare, aur drafts ek copy (<b>candidate</b>) par taiyaar ho sakte hain phir live contract mein sign (<b>commit</b>) hote hain. Woh meeting NETCONF hai.</p>

<h3>NETCONF kya hai</h3>
<p><b>NETCONF</b> (Network Configuration Protocol) <b>RFC 6241</b> mein define hai; ise SSH par chalana RFC 6242 hai. Yeh <b>TCP 830</b> par <code>netconf</code> naam ke <b>SSH subsystem</b> ki tarah chalta hai, aur saare messages <b>XML</b> hote hain. Ise scale par configuration management ke liye design kiya gaya, isliye isme woh features hain jo REST APIs mein nahi: alag configuration datastores, locking, validation, aur all-or-nothing transactions.</p>

<h3>Chaar layers</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NETCONF layers">
<rect x="120" y="15" width="400" height="42" rx="8" fill="#ddd6fe"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Content: YANG-modelled XML data</text><text x="320" y="51" text-anchor="middle" class="svg-muted" font-size="11">&lt;interfaces&gt;...&lt;/interfaces&gt;</text>
<rect x="120" y="67" width="400" height="42" rx="8" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">Operations: get-config, edit-config, get, lock...</text>
<rect x="120" y="119" width="400" height="42" rx="8" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Messages: rpc, rpc-reply, notification</text>
<rect x="120" y="171" width="400" height="42" rx="8" fill="#fde68a"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Secure transport: SSH, TCP 830</text>
</svg><p class="cap">NETCONF layers upar se neeche. Exam poochhna pasand karta hai ki koi element kis layer ka hai.</p></div>

<h3>Session start: hello aur capabilities</h3>
<p>SSH subsystem khulte hi <b>dono</b> sides <code>&lt;hello&gt;</code> bhejti hain. Server ka hello apni <b>capabilities</b> aur ek <b>session-id</b> list karta hai. Capabilities URNs hain: base protocol versions, optional features, aur har YANG module uski revision ke saath. Lab 1 task 3 mein aap <code>netconf 192.168.50.1 -u devnet:DevNet123</code> se session kholte ho aur dekhte ho:</p>
<pre class="out">Connected to 192.168.50.1 port 830 (SSH subsystem "netconf") as devnet
&lt;&lt;&lt; server hello
&lt;hello xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;capabilities&gt;
    &lt;capability&gt;urn:ietf:params:netconf:base:1.0&lt;/capability&gt;
<span class="hl">    &lt;capability&gt;urn:ietf:params:netconf:base:1.1&lt;/capability&gt;</span>
<span class="hl">    &lt;capability&gt;urn:ietf:params:netconf:capability:writable-running:1.0&lt;/capability&gt;</span>
    &lt;capability&gt;urn:ietf:params:netconf:capability:xpath:1.0&lt;/capability&gt;
    &lt;capability&gt;urn:ietf:params:netconf:capability:rollback-on-error:1.0&lt;/capability&gt;
    &lt;capability&gt;urn:ietf:params:xml:ns:yang:ietf-interfaces?module=ietf-interfaces&amp;amp;revision=2018-02-20&lt;/capability&gt;
    ...
  &lt;/capabilities&gt;
  &lt;session-id&gt;31&lt;/session-id&gt;
&lt;/hello&gt;
]]&gt;]]&gt;</pre>
<p>Ise menu ki tarah padho. <code>base:1.1</code> ka matlab naya chunked framing use ho sakta hai; <code>base:1.0</code> end marker <code>]]&gt;]]&gt;</code> use karta hai. <code>:writable-running</code> ka matlab aap running datastore seedha edit kar sakte ho. <code>:candidate</code> <b>gayab</b> hai, isliye is router ke paas candidate datastore nahi hai. <code>:xpath</code> ka matlab XPath filters accept hote hain. <code>:rollback-on-error</code> ka matlab failed edit kuch bhi aadha-adhoora nahi chhodta.</p>

<h3>Messages: rpc aur rpc-reply</h3>
<p>Har request ek <code>&lt;rpc&gt;</code> hai jiska <code>message-id</code> hota hai; jawab same id wala <code>&lt;rpc-reply&gt;</code> hai, jisme <code>&lt;data&gt;</code>, <code>&lt;ok/&gt;</code> ya <code>&lt;rpc-error&gt;</code> hota hai. Event messages (<code>&lt;notification&gt;</code>) subscriptions aur telemetry ke liye use hote hain.</p>
<pre class="code">&lt;rpc message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;get-config&gt;
    &lt;source&gt;&lt;running/&gt;&lt;/source&gt;
    &lt;filter type="xpath" select="/if:interfaces"/&gt;
  &lt;/get-config&gt;
&lt;/rpc&gt;</pre>

<h3>Operations</h3>
<table class="cmp"><tr><th>Operation</th><th>Kya karta hai</th></tr>
<tr><td><code>get-config</code></td><td>Ek datastore (running, candidate ya startup) se configuration padhta hai</td></tr>
<tr><td><code>get</code></td><td>Configuration <b>aur</b> operational state (config false data) padhta hai</td></tr>
<tr><td><code>edit-config</code></td><td>XML <code>&lt;config&gt;</code> body se target datastore badalta hai</td></tr>
<tr><td><code>copy-config</code> / <code>delete-config</code></td><td>Poora datastore copy karta hai (jaise running se startup) / ek delete karta hai (running kabhi nahi)</td></tr>
<tr><td><code>lock</code> / <code>unlock</code></td><td>Is session ke liye datastore ka exclusive access</td></tr>
<tr><td><code>commit</code> / <code>discard-changes</code></td><td>Candidate apply karo ya phenk do (<code>:candidate</code> chahiye)</td></tr>
<tr><td><code>validate</code></td><td>Datastore ko bina apply kiye check karo (<code>:validate</code> chahiye)</td></tr>
<tr><td><code>close-session</code> / <code>kill-session</code></td><td>Apna session khatam karo / doosre ko zabardasti khatam karo</td></tr></table>

<h3>Datastores</h3>
<ul>
<li><b>running</b>: active configuration. Hamesha hota hai.</li>
<li><b>startup</b>: boot par load hota hai (<code>:startup</code> capability). <code>copy-config</code> running se startup karke save karo.</li>
<li><b>candidate</b>: ek scratch pad. Aap poora change banate ho, use <code>validate</code> karte ho, phir ek step mein running mein <code>commit</code> karte ho, ya <code>discard-changes</code>. Sirf <code>:candidate</code> ke saath; IOS XE ise <code>netconf-yang feature candidate-datastore</code> se enable karta hai.</li>
</ul>
<p>Naya RFC 8342 (NMDA) <b>intended</b> aur <b>operational</b> datastores jodta hai; aapko bas itna pata hona chahiye ki operational live state rakhta hai.</p>

<div class="eg"><p><b>Worked example.</b> Candidate-capable box ke saath ek safe multi-device change: running <code>lock</code>, candidate <code>lock</code>, target candidate par <code>edit-config</code>, <code>validate</code>, <code>commit</code>, dono <code>unlock</code>. Agar koi device apna edit reject kare, to script har jagah <code>discard-changes</code> bhejti hai aur running tak kuch nahi pahuncha. R1 par, jiske paas sirf <code>:writable-running</code> hai, aap <code>lock running</code> karoge, running par <code>edit-config</code> bhejoge (rollback-on-error aapko bachata hai), phir <code>unlock running</code>.</p></div>

<div class="warn"><p><b>Common galti.</b> Us device par <code>commit</code> bhejna jisne <code>:candidate</code> advertise nahi kiya. Reply <code>operation-not-supported</code> ke saath ek <code>&lt;rpc-error&gt;</code> hota hai. Hamesha pehle hello padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get</code> config <b>aur</b> state deta hai; <code>get-config</code> sirf config. NETCONF sirf XML use karta hai (JSON nahi). Port 830, SSH subsystem. <code>&lt;rpc&gt;</code> wali layer Messages hai; <code>&lt;get-config&gt;</code> Operations hai.</p></div>

<div class="scn"><h4>Do tools, ek lock</h4><p>Ek nightly compliance tool ne NETCONF se running datastore lock kiya aur bina unlock kiye crash ho gaya. Subah har automation job <code>lock-denied</code> ya <code>in-use</code> ke saath fail hua. <code>show netconf-yang sessions</code> ne purana session global lock R pakde dikhaya. Engineer ne use clear kiya (device par <code>clear netconf-yang session</code>, ya client se <code>kill-session</code>) aur tool mein timeout aur finally-unlock joda.</p><p><b>Seekh:</b> locks changes ko bachate hain, par bhoola hua lock sabko rok deta hai; hamesha unlock karo aur sessions monitor karo.</p></div>

<div class="iv"><p class="q">"NETCONF session shuru hone par kya hota hai, aur yeh kyun matter karta hai?"</p><p>Strong answer: client port 830 par SSH kholta hai aur netconf subsystem maangta hai; dono sides hello messages exchange karti hain; server ke hello mein capabilities (base 1.0/1.1, writable-running, candidate, xpath, rollback-on-error aur har YANG module revision ke saath) aur session-id hota hai. Yeh isliye matter karta hai kyunki koi bhi RPC bhejne se pehle client jaan leta hai ki woh kaunse datastores, operations aur models use kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NETCONF: RFC 6241, TCP 830 par SSH subsystem, XML encoding.</li>
<li>Layers: content, operations, messages, secure transport.</li>
<li>Hello capabilities exchange karta hai; woh decide karti hain ki aap kya kar sakte ho (candidate, writable-running, xpath).</li>
<li>Datastores: running, startup, candidate (commit/discard-changes).</li>
<li><code>get</code> = config + state; <code>get-config</code> = config; <code>edit-config</code> target badalta hai; lock/unlock use bachate hain.</li>
</ul></div>
`}};export{e as default};