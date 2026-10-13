var e={id:`big-picture`,h:{en:`Why NETCONF from Python: the big picture`,hi:`Python se NETCONF kyon: big picture`},body:{en:`
<p><b>What you will learn.</b> This module takes you from "I can send a command over SSH" to "I can change a router transactionally from Python and prove the change is there". By the end you can open a NETCONF session with <code>ncclient</code>, read the capabilities, read data with <code>get</code> and <code>get_config</code>, change it with <code>edit_config</code>, use the candidate datastore with <code>lock</code>, <code>validate</code> and <code>commit</code>, protect yourself with a confirmed commit, read an <code>RPCError</code> properly, and write one function that makes the same change on IOS XE and on Junos.</p>
<p><b>Prerequisites.</b> <code>encor-yang</code> (YANG, NETCONF and RESTCONF at CLI level, so you already know hello, RPC, datastores and filters by name), <code>auto-ssh</code> (SSH from Python), <code>py-tools</code> and <code>py-secrets</code> (scripts you can run safely, no passwords in code). The next module, <code>adv-xml</code>, teaches XML parsing in depth; here we only read replies with a few simple calls.</p>

<h3>An analogy: a phone call versus a registered form</h3>
<p>Changing a router with an SSH script is like phoning a clerk and dictating: you type commands and read back text, hoping the clerk heard you. NETCONF is a registered form. Every request is numbered, every answer is structured, you can put a <b>lock</b> on the file while you work, prepare your changes on a <b>draft copy</b> (the candidate), have them checked (validate), sign them (commit), and even add a <b>cooling-off period</b>: if you do not confirm within a minute the deal is cancelled by itself. A script that uses those features is far safer than one that types lines into a terminal.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="From a Python script to the datastores of a router">
<rect x="8" y="20" width="108" height="60" rx="10" fill="#bae6fd"/><text x="62" y="46" text-anchor="middle" class="svg-ink" font-size="13">Python script</text><text x="62" y="64" text-anchor="middle" class="svg-muted" font-size="11">AUTO01</text>
<rect x="140" y="20" width="108" height="60" rx="10" fill="#ddd6fe"/><text x="194" y="46" text-anchor="middle" class="svg-ink" font-size="13">ncclient</text><text x="194" y="64" text-anchor="middle" class="svg-muted" font-size="11">manager.connect</text>
<rect x="272" y="20" width="108" height="60" rx="10" fill="#fde68a"/><text x="326" y="46" text-anchor="middle" class="svg-ink" font-size="13">SSH subsystem</text><text x="326" y="64" text-anchor="middle" class="svg-muted" font-size="11">TCP 830, XML</text>
<rect x="404" y="20" width="108" height="60" rx="10" fill="#bbf7d0"/><text x="458" y="46" text-anchor="middle" class="svg-ink" font-size="13">NETCONF server</text><text x="458" y="64" text-anchor="middle" class="svg-muted" font-size="11">on the device</text>
<rect x="536" y="8" width="96" height="40" rx="8" fill="#fed7aa"/><text x="584" y="33" text-anchor="middle" class="svg-ink" font-size="12">running</text>
<rect x="536" y="56" width="96" height="40" rx="8" fill="#e2e8f0"/><text x="584" y="81" text-anchor="middle" class="svg-ink" font-size="12">candidate</text>
<line x1="116" y1="50" x2="140" y2="50" stroke="#64748b" stroke-width="2"/><line x1="248" y1="50" x2="272" y2="50" stroke="#64748b" stroke-width="2"/><line x1="380" y1="50" x2="404" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="512" y1="40" x2="536" y2="28" stroke="#64748b" stroke-width="2"/><line x1="512" y1="60" x2="536" y2="76" stroke="#64748b" stroke-width="2"/>
<rect x="8" y="120" width="190" height="56" rx="10" fill="#fed7aa"/><text x="103" y="144" text-anchor="middle" class="svg-ink" font-size="12">R1 PUN-CORE-R1 (IOS XE)</text><text x="103" y="162" text-anchor="middle" class="svg-muted" font-size="11">running only, no commit</text>
<rect x="222" y="120" width="190" height="56" rx="10" fill="#bbf7d0"/><text x="317" y="144" text-anchor="middle" class="svg-ink" font-size="12">J1 BLR-EDGE-J1 (Junos)</text><text x="317" y="162" text-anchor="middle" class="svg-muted" font-size="11">candidate, commit, confirmed</text>
<text x="520" y="156" text-anchor="middle" class="svg-muted" font-size="12">the two lab devices</text>
</svg><p class="cap">One script talks to a NETCONF server over an SSH subsystem. The server offers one or more datastores.</p></div>

<h3>What encor-yang gave you, and what this module adds</h3>
<table class="cmp"><tr><th>encor-yang (CLI level)</th><th>adv-netconf (Python level)</th></tr>
<tr><td>Layers: content, operations, messages, SSH transport</td><td>The same layers driven by <code>ncclient.manager</code></td></tr>
<tr><td>Typed an RPC by hand in a lab client</td><td>Methods such as <code>get_config</code> and <code>edit_config</code> build and check the RPC for you</td></tr>
<tr><td>Read an <code>rpc-error</code> on screen</td><td>Catch <code>RPCError</code>, read <code>tag</code> and <code>message</code>, decide what to do</td></tr>
<tr><td>One vendor (IOS XE)</td><td>IOS XE and Junos, with their different datastores</td></tr></table>

<h3>Your first call</h3>
<p>The lab host AUTO01 has <code>ncutil.py</code> with the device inventory and a <code>connect()</code> helper. Everything in this module imports it, so the credentials live in one place (lab values only; real scripts read them from the environment, as you learned in <code>py-secrets</code>).</p>
<pre class="code"><span class="c"># first.py - the first NETCONF call of this module</span>
from ncutil import connect

with connect("J1") as m:
    print("session", m.session_id, "connected:", m.connected)
    flt = "&lt;configuration&gt;&lt;system&gt;&lt;host-name/&gt;&lt;/system&gt;&lt;/configuration&gt;"
    reply = m.get_config(source="running", filter=("subtree", flt))
    print(reply.data_xml)</pre>
<p><code>with</code> makes sure the session is closed at the end. <code>get_config</code> asks for the <b>running</b> datastore, and the subtree filter says "only the host name". The reply is XML; <code>data_xml</code> is its text. Note the <code>session</code> number: it is the session-id that the device gave this connection.</p>
<pre class="out">AUTO01$ python3 first.py
<span class="hl">session 1633 connected: True</span>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;data&gt;
&lt;configuration junos:commit-seconds="1791706005" junos:commit-localtime="2026-10-11 08:06:45 UTC" junos:commit-user="root"&gt;
&lt;system&gt;
<span class="hl">&lt;host-name&gt;BLR-EDGE-J1&lt;/host-name&gt;</span>
&lt;/system&gt;
&lt;/configuration&gt;
&lt;/data&gt;</pre>

<div class="eg"><p><b>Worked example: the ticket.</b> Change request CHG-2041 says: the uplink to Bengaluru, <code>GigabitEthernet0/1</code> on R1 and <code>ge-0/0/1</code> on J1, gets a new description and a new /30 address on both routers. By hand that is two different CLIs. In this module you build one function that does it on both, reads the result back, and refuses to keep a Junos change that cuts you off.</p></div>

<h3>The road map</h3>
<ul>
<li>Chapters 2 and 3: the session, the hello and the capabilities.</li>
<li>Chapters 4 and 5: reading and changing (Lab 1 steps 1 to 3).</li>
<li>Chapters 6 and 7: the candidate datastore and the confirmed commit (Lab 1 steps 4 and 7).</li>
<li>Chapters 8 and 9: errors, and one function for two vendors (Lab 1 steps 5 and 6).</li>
<li>Chapter 10: Lab 2, "The change that vanished". Chapter 11: summary.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Treating NETCONF as "SSH with XML". The value is in the features around the edit: capabilities to discover what the device can do, locks to avoid collisions, validation and commit to make a change atomic, structured errors to react to. Skip them and you have rebuilt screen scraping with angle brackets.</p></div>
<div class="exam"><p><b>Exam trap.</b> NETCONF runs over SSH on <b>TCP 830</b> as a subsystem named <code>netconf</code>, not over the normal SSH shell on port 22, and its messages are XML. RESTCONF is a different protocol with a web transport.</p></div>

<div class="scn"><h4>The script that was "just SSH"</h4><p>A team pushed interface changes to 40 routers by sending CLI lines and checking that no error text came back. One router rejected a line but printed the complaint in a format the script did not look for, and the change went half in. After moving to NETCONF the same script got a structured <code>rpc-error</code> with a tag, caught it, and stopped before touching the next router.</p><p><b>Lesson:</b> a structured error you can catch beats text you have to guess at.</p></div>

<div class="iv"><p class="q">"Why would you use NETCONF instead of SSH and the CLI for automation?"</p><p>Structured, model-based data instead of text to parse; separate datastores, locking and validation so a change is atomic and checkable; a confirmed commit as a safety net; and machine-readable errors with a tag and a path. I would still use the CLI for one-off troubleshooting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NETCONF = XML messages over an SSH subsystem on TCP 830, driven from Python by <code>ncclient</code>.</li>
<li>The device decides the workflow: IOS XE in this lab edits running directly, Junos uses candidate and commit.</li>
<li>Locks, validate, commit and confirmed commit are what make NETCONF safer than typing CLI lines.</li>
<li>Errors arrive as <code>rpc-error</code> and become <code>RPCError</code> in Python.</li>
<li>Everything in the module imports <code>connect()</code> from <code>ncutil.py</code>.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Yeh module aapko "main SSH par command bhej sakta hoon" se "main Python se router ko transactionally badal sakta hoon aur saabit kar sakta hoon ki change wahan hai" tak le jaata hai. Ant mein aap <code>ncclient</code> se NETCONF session khol sakoge, capabilities padh sakoge, <code>get</code> aur <code>get_config</code> se data padh sakoge, <code>edit_config</code> se badal sakoge, <code>lock</code>, <code>validate</code> aur <code>commit</code> ke saath candidate datastore use kar sakoge, confirmed commit se khud ko bacha sakoge, <code>RPCError</code> sahi tarah padh sakoge, aur ek aisa function likh sakoge jo IOS XE aur Junos par wahi change kare.</p>
<p><b>Prerequisites.</b> <code>encor-yang</code> (CLI level par YANG, NETCONF aur RESTCONF, isliye hello, RPC, datastores aur filters ke naam aap jaante ho), <code>auto-ssh</code> (Python se SSH), <code>py-tools</code> aur <code>py-secrets</code> (aisi scripts jo safely chalein, code mein password nahi). Agla module <code>adv-xml</code> XML parsing gehraai se sikhata hai; yahan hum replies sirf kuch simple calls se padhte hain.</p>

<h3>Ek analogy: phone call versus registered form</h3>
<p>SSH script se router badalna aisa hai jaise clerk ko phone karke dictation dena: aap commands type karte ho aur text wapas padhte ho, is umeed mein ki clerk ne sahi suna. NETCONF ek registered form hai. Har request numbered hai, har jawab structured hai, kaam ke dauran file par <b>lock</b> laga sakte ho, changes <b>draft copy</b> (candidate) par taiyar kar sakte ho, unhe check karwa sakte ho (validate), sign kar sakte ho (commit), aur ek <b>cooling-off period</b> bhi jod sakte ho: agar ek minute mein confirm nahi kiya to deal apne aap cancel ho jaati hai. Jo script in features ko use karti hai woh terminal mein lines type karne wali script se kahin zyada safe hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Python script se router ke datastores tak">
<rect x="8" y="20" width="108" height="60" rx="10" fill="#bae6fd"/><text x="62" y="46" text-anchor="middle" class="svg-ink" font-size="13">Python script</text><text x="62" y="64" text-anchor="middle" class="svg-muted" font-size="11">AUTO01</text>
<rect x="140" y="20" width="108" height="60" rx="10" fill="#ddd6fe"/><text x="194" y="46" text-anchor="middle" class="svg-ink" font-size="13">ncclient</text><text x="194" y="64" text-anchor="middle" class="svg-muted" font-size="11">manager.connect</text>
<rect x="272" y="20" width="108" height="60" rx="10" fill="#fde68a"/><text x="326" y="46" text-anchor="middle" class="svg-ink" font-size="13">SSH subsystem</text><text x="326" y="64" text-anchor="middle" class="svg-muted" font-size="11">TCP 830, XML</text>
<rect x="404" y="20" width="108" height="60" rx="10" fill="#bbf7d0"/><text x="458" y="46" text-anchor="middle" class="svg-ink" font-size="13">NETCONF server</text><text x="458" y="64" text-anchor="middle" class="svg-muted" font-size="11">device par</text>
<rect x="536" y="8" width="96" height="40" rx="8" fill="#fed7aa"/><text x="584" y="33" text-anchor="middle" class="svg-ink" font-size="12">running</text>
<rect x="536" y="56" width="96" height="40" rx="8" fill="#e2e8f0"/><text x="584" y="81" text-anchor="middle" class="svg-ink" font-size="12">candidate</text>
<line x1="116" y1="50" x2="140" y2="50" stroke="#64748b" stroke-width="2"/><line x1="248" y1="50" x2="272" y2="50" stroke="#64748b" stroke-width="2"/><line x1="380" y1="50" x2="404" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="512" y1="40" x2="536" y2="28" stroke="#64748b" stroke-width="2"/><line x1="512" y1="60" x2="536" y2="76" stroke="#64748b" stroke-width="2"/>
<rect x="8" y="120" width="190" height="56" rx="10" fill="#fed7aa"/><text x="103" y="144" text-anchor="middle" class="svg-ink" font-size="12">R1 PUN-CORE-R1 (IOS XE)</text><text x="103" y="162" text-anchor="middle" class="svg-muted" font-size="11">sirf running, commit nahi</text>
<rect x="222" y="120" width="190" height="56" rx="10" fill="#bbf7d0"/><text x="317" y="144" text-anchor="middle" class="svg-ink" font-size="12">J1 BLR-EDGE-J1 (Junos)</text><text x="317" y="162" text-anchor="middle" class="svg-muted" font-size="11">candidate, commit, confirmed</text>
<text x="520" y="156" text-anchor="middle" class="svg-muted" font-size="12">lab ke do devices</text>
</svg><p class="cap">Ek script SSH subsystem ke upar NETCONF server se baat karti hai. Server ek ya zyada datastores deta hai.</p></div>

<h3>encor-yang ne kya diya, aur yeh module kya jodta hai</h3>
<table class="cmp"><tr><th>encor-yang (CLI level)</th><th>adv-netconf (Python level)</th></tr>
<tr><td>Layers: content, operations, messages, SSH transport</td><td>Wahi layers, <code>ncclient.manager</code> se chalayi gayi</td></tr>
<tr><td>Lab client mein RPC haath se type kiya</td><td><code>get_config</code> aur <code>edit_config</code> jaise methods RPC banate aur check karte hain</td></tr>
<tr><td>Screen par <code>rpc-error</code> padha</td><td><code>RPCError</code> pakdo, <code>tag</code> aur <code>message</code> padho, decide karo kya karna hai</td></tr>
<tr><td>Ek vendor (IOS XE)</td><td>IOS XE aur Junos, apne alag datastores ke saath</td></tr></table>

<h3>Aapki pehli call</h3>
<p>Lab host AUTO01 par <code>ncutil.py</code> hai jisme device inventory aur ek <code>connect()</code> helper hai. Is module ka har script ise import karta hai, isliye credentials ek hi jagah rehte hain (sirf lab values; asli scripts unhe environment se padhti hain, jaisa aapne <code>py-secrets</code> mein seekha).</p>
<pre class="code"><span class="c"># first.py - the first NETCONF call of this module</span>
from ncutil import connect

with connect("J1") as m:
    print("session", m.session_id, "connected:", m.connected)
    flt = "&lt;configuration&gt;&lt;system&gt;&lt;host-name/&gt;&lt;/system&gt;&lt;/configuration&gt;"
    reply = m.get_config(source="running", filter=("subtree", flt))
    print(reply.data_xml)</pre>
<p><code>with</code> pakka karta hai ki session ant mein band ho. <code>get_config</code> <b>running</b> datastore maangta hai, aur subtree filter kehta hai "sirf host name". Reply XML hai; <code>data_xml</code> uska text hai. <code>session</code> number dekho: yeh woh session-id hai jo device ne is connection ko diya.</p>
<pre class="out">AUTO01$ python3 first.py
<span class="hl">session 1633 connected: True</span>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;&lt;data&gt;
&lt;configuration junos:commit-seconds="1791706005" junos:commit-localtime="2026-10-11 08:06:45 UTC" junos:commit-user="root"&gt;
&lt;system&gt;
<span class="hl">&lt;host-name&gt;BLR-EDGE-J1&lt;/host-name&gt;</span>
&lt;/system&gt;
&lt;/configuration&gt;
&lt;/data&gt;</pre>

<div class="eg"><p><b>Worked example: ticket.</b> Change request CHG-2041 kehti hai: Bengaluru wala uplink, R1 par <code>GigabitEthernet0/1</code> aur J1 par <code>ge-0/0/1</code>, dono routers par nayi description aur naya /30 address legi. Haath se yeh do alag CLIs hain. Is module mein aap ek function banate ho jo dono par yeh kare, result wapas padhe, aur aisa Junos change rakhne se mana kar de jo aapko kaat deta hai.</p></div>

<h3>Road map</h3>
<ul>
<li>Chapters 2 aur 3: session, hello aur capabilities.</li>
<li>Chapters 4 aur 5: padhna aur badalna (Lab 1 ke steps 1 se 3).</li>
<li>Chapters 6 aur 7: candidate datastore aur confirmed commit (Lab 1 ke steps 4 aur 7).</li>
<li>Chapters 8 aur 9: errors, aur do vendors ke liye ek function (Lab 1 ke steps 5 aur 6).</li>
<li>Chapter 10: Lab 2, "The change that vanished". Chapter 11: summary.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> NETCONF ko "XML wala SSH" samajhna. Asli value edit ke aas-paas ke features mein hai: capabilities se pata karna device kya kar sakta hai, locks se takraav bachana, validation aur commit se change atomic banana, structured errors se react karna. Inhe chhodo to aapne screen scraping ko angle brackets ke saath dobara bana liya.</p></div>
<div class="exam"><p><b>Exam trap.</b> NETCONF SSH par <b>TCP 830</b> par <code>netconf</code> naam ke subsystem ki tarah chalta hai, port 22 ke normal SSH shell par nahi, aur uske messages XML hain. RESTCONF alag protocol hai jisme web transport hota hai.</p></div>

<div class="scn"><h4>Jo script "sirf SSH" thi</h4><p>Ek team ne 40 routers par CLI lines bhejkar interface changes push kiye aur bas dekha ki koi error text wapas na aaye. Ek router ne ek line reject ki par shikayat aise format mein print ki jo script dhoondh nahi rahi thi, aur change aadha ghus gaya. NETCONF par jaane ke baad wahi script ko tag ke saath structured <code>rpc-error</code> mila, usne use pakda, aur agle router ko chhoone se pehle ruk gayi.</p><p><b>Lesson:</b> jo structured error aap pakad sako woh us text se behtar hai jise andaza lagana pade.</p></div>

<div class="iv"><p class="q">"Automation ke liye SSH aur CLI ki jagah NETCONF kyon use karoge?"</p><p>Text parse karne ki jagah structured, model-based data; alag datastores, locking aur validation taaki change atomic aur checkable ho; safety net ke roop mein confirmed commit; aur tag aur path ke saath machine-readable errors. One-off troubleshooting ke liye main phir bhi CLI use karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NETCONF = SSH subsystem par TCP 830 ke upar XML messages, Python se <code>ncclient</code> ke zariye chalaya jaata hai.</li>
<li>Workflow device tay karta hai: is lab mein IOS XE seedha running edit karta hai, Junos candidate aur commit use karta hai.</li>
<li>Locks, validate, commit aur confirmed commit NETCONF ko CLI lines type karne se safer banate hain.</li>
<li>Errors <code>rpc-error</code> ki tarah aate hain aur Python mein <code>RPCError</code> ban jaate hain.</li>
<li>Module ka har script <code>ncutil.py</code> se <code>connect()</code> import karta hai.</li>
</ul></div>
`}};export{e as default};