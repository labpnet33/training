var e=String.raw`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="eAPI stack">
<rect x="8" y="50" width="120" height="70" rx="8" fill="#bae6fd"/><text x="68" y="80" text-anchor="middle" class="svg-ink" font-size="13">Your script</text><text x="68" y="98" text-anchor="middle" class="svg-muted" font-size="11">AUTO01, Python</text>
<rect x="160" y="50" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="225" y="78" text-anchor="middle" class="svg-ink" font-size="13">pyeapi</text><text x="225" y="96" text-anchor="middle" class="svg-muted" font-size="11">Node, api(), sessions</text>
<rect x="322" y="50" width="140" height="70" rx="8" fill="#fde68a"/><text x="392" y="78" text-anchor="middle" class="svg-ink" font-size="13">POST /command-api</text><text x="392" y="96" text-anchor="middle" class="svg-muted" font-size="11">JSON-RPC over TLS</text>
<rect x="494" y="50" width="138" height="70" rx="8" fill="#bbf7d0"/><text x="563" y="78" text-anchor="middle" class="svg-ink" font-size="13">EOS leaf</text><text x="563" y="96" text-anchor="middle" class="svg-muted" font-size="11">eAPI server + CLI</text>
<line x1="128" y1="85" x2="160" y2="85" stroke="#64748b" stroke-width="2"/><line x1="290" y1="85" x2="322" y2="85" stroke="#64748b" stroke-width="2"/><line x1="462" y1="85" x2="494" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="24" text-anchor="middle" class="svg-muted" font-size="12">commands go in as text, answers come back as JSON</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">one request can carry many commands; the answer has one result per command</text>
</svg></div>
<p class="cap">The eAPI stack. pyeapi is a thin client: it builds the request, sends it and unpacks the answer.</p>`,t=String.raw`<pre class="code"><span class="c">! LEAF1 and LEAF2 startup (built in module eos-ops)</span>
username netops privilege 15 secret NK@2026
username viewer privilege 1 secret View@2026
management api h&#116;tp-commands
   protocol h&#116;tps
   no shutdown</pre>
<pre class="out">LEAF1# show management api h&#116;tp-commands
Enabled:            <span class="hl">Yes</span>
HTTPS server:       <span class="hl">running, set to use port 443</span>
HT&#84;P server:        shutdown, set to use port 80
Local HT&#84;P server:  shutdown, no authentication, set to use port 8080
Unix Socket server: shutdown, no authentication
VRFs:               default
Hits:               0
Last hit:           never
Requests:           0
Commands:           0</pre>`,n={id:`big-picture`,h:{en:`eAPI and pyeapi: the big picture`,hi:`eAPI aur pyeapi: badi tasveer`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you can talk to an Arista EOS switch from Python in four ways and know which one to pick: a raw JSON-RPC request with curl, the <code>pyeapi</code> client with <code>run_commands</code>, the <code>api()</code> helper modules for VLANs, interfaces and BGP, and <b>config sessions</b> that give you a diff, a commit and an abort. You will also learn to read the six ways eAPI says no: 401, connection refused, an ACL timeout, the wrong transport, a <code>CommandError</code> and a privilege failure.</p>
<ul>
<li>Send a request by hand and read the JSON answer.</li>
<li>Describe a fleet in <code>~/.eapi.conf</code> and connect with <code>connect_to</code>.</li>
<li>Use <code>run_commands</code>, <code>enable</code>, <code>config</code> and <code>get_config</code> correctly.</li>
<li>Build VLANs and a BGP neighbour idempotently with <code>node.api()</code>.</li>
<li>Stage a change in a config session, read the diff and commit or abort it.</li>
<li>Diagnose any failure from the exception class and message alone.</li>
</ul>
<p><b>Prerequisites.</b> <code>eos-ops</code> (you enabled eAPI and used configuration sessions at the CLI there), <code>auto-requests</code> and <code>auto-h&#116;tp</code> (REST, JSON and status codes), <code>adv-nkmiko</code> (netmiko on EOS, so you know the screen-scraping way), <code>py-secrets</code> (keep passwords out of scripts). Basic Linux on AUTO01 is assumed.</p>

<h3>An analogy: the order window</h3>
<p>The CLI is a waiter who talks to you: you type, he answers in sentences, and your script must guess where the sentence ends. eAPI is an <b>order window</b>. You pass a numbered slip with the dishes you want (the commands), and you get the plates back in labelled boxes (JSON), one box per dish, every time. <code>pyeapi</code> is the clerk who fills in the slip for you and carries the boxes to your table.</p>
`+e+`
<h3>Why eAPI, when we already have netmiko?</h3>
<table class="cmp"><tr><th></th><th>CLI scraping (netmiko)</th><th>eAPI with pyeapi</th></tr>
<tr><td>Answer</td><td>Text you must parse</td><td>JSON dictionaries (or text if you ask)</td></tr>
<tr><td>Session</td><td>One long SSH session, prompts, paging</td><td>Stateless request per call, no prompt to wait for</td></tr>
<tr><td>Many commands</td><td>Sent one by one</td><td>One request, one result per command</td></tr>
<tr><td>Errors</td><td>Search the text for "Invalid input"</td><td>A JSON error with a code, and a Python exception</td></tr>
<tr><td>Scope</td><td>Any vendor</td><td>Arista EOS only</td></tr></table>
<p>eAPI is <b>command-oriented</b>: you send the same commands you would type, and EOS answers in JSON. It is not model-oriented like NETCONF or gNMI (modules <code>adv-netconf</code> and <code>adv-gnmi</code>), where you address YANG paths. For EOS that is often a benefit: everything you know from the CLI still works, and every <code>show</code> command that has a JSON model returns structured data.</p>

<h3>Switching it on</h3>
<p>You built this in <code>eos-ops</code>. A user, the <code>management api</code> block, <code>protocol https</code> and <code>no shutdown</code>. Without <code>no shutdown</code> the service is off and nobody can connect.</p>
`+t+`
<p>eAPI authenticates with HT&#84;P basic authentication against the local user database (or AAA). The <code>Hits</code> and <code>Commands</code> counters are your first debugging tool: if a request never reaches the switch they stay at zero.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab accepts <code>vrf MGMT</code> under the management api block but has one routing table, so eAPI always answers in the default VRF. It never checks the switch certificate (TLS errors such as <code>CERTIFICATE_VERIFY_FAILED</code> cannot happen), and the CLI is the lab's EOS personality with 8 ports. Everything else you meet in this module, the JSON keys, the error codes and the pyeapi calls, follows real EOS 4.31 and pyeapi 0.8.</p></div>

<h3>The two labs</h3>
<p><b>Lab 1 (configure)</b> builds a small tool on AUTO01 against two leaves: LEAF1 (10.99.0.11) and LEAF2 (10.99.0.12), both reachable as <code>netops / NK@2026</code>. You send a raw request, write <code>.eapi.conf</code>, take a snapshot, create three VLANs, bring up a BGP neighbour and abort a risky config session. <b>Lab 2 (troubleshoot)</b> hands you <code>fleetcheck.py</code> with six different failures across three leaves.</p>

<div class="scn"><h4>The night shift script that guessed</h4><p>A team scraped <code>show interfaces status</code> over SSH. After an EOS upgrade one column changed width and the parser silently read the wrong port as down. They moved to eAPI: the same command, but <code>status["Ethernet5"]["linkStatus"]</code> is a key, not a column. The parser never broke again.</p><p><b>Lesson:</b> structured answers survive upgrades that formatted text does not.</p></div>

<div class="iv"><p class="q">"What is eAPI and how is it different from SSH automation?"</p><p>eAPI is Arista's JSON-RPC interface: I POST a list of CLI commands to <code>/command-api</code> over TLS with basic authentication and get one JSON result per command. There is no prompt or paging to handle, errors come back as codes, and one request can carry many commands. pyeapi wraps that in Python. It is EOS-specific and command-based, unlike YANG-based NETCONF or gNMI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>eAPI = JSON-RPC over TLS at <code>/command-api</code>; the commands are normal EOS CLI commands.</li>
<li>pyeapi is a thin Python client: <code>Node</code>, <code>run_commands</code>, <code>config</code>, <code>api()</code>, sessions.</li>
<li>The service needs a user, <code>protocol https</code> and <code>no shutdown</code>.</li>
<li><code>show management api h&#116;tp-commands</code> shows state and hit counters.</li>
<li>Prerequisites: eos-ops, auto-requests, adv-nkmiko, py-secrets.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Is module ke ant tak aap Python se Arista EOS switch se chaar tareeke se baat kar sakte ho aur jaante ho kaunsa kab chunna hai: curl se raw JSON-RPC request, <code>run_commands</code> ke saath <code>pyeapi</code> client, VLAN, interface aur BGP ke liye <code>api()</code> helper modules, aur <b>config sessions</b> jo diff, commit aur abort dete hain. Aap eAPI ke "nahi" kehne ke chhe tareeke padhna bhi seekhoge: 401, connection refused, ACL timeout, galat transport, <code>CommandError</code> aur privilege failure.</p>
<ul>
<li>Haath se request bhejo aur JSON answer padho.</li>
<li>Fleet ko <code>~/.eapi.conf</code> mein describe karo aur <code>connect_to</code> se jodo.</li>
<li><code>run_commands</code>, <code>enable</code>, <code>config</code> aur <code>get_config</code> sahi use karo.</li>
<li><code>node.api()</code> se VLANs aur BGP neighbour idempotent tareeke se banao.</li>
<li>Config session mein change stage karo, diff padho aur commit ya abort karo.</li>
<li>Sirf exception class aur message se har failure diagnose karo.</li>
</ul>
<p><b>Prerequisites.</b> <code>eos-ops</code> (wahan aapne eAPI enable kiya aur CLI par configuration sessions use kiye), <code>auto-requests</code> aur <code>auto-h&#116;tp</code> (REST, JSON aur status codes), <code>adv-nkmiko</code> (EOS par netmiko, yaani screen-scraping ka tareeka), <code>py-secrets</code> (passwords script se bahar rakho). AUTO01 par basic Linux maani gayi hai.</p>

<h3>Analogy: order window</h3>
<p>CLI ek waiter hai jo aapse baat karta hai: aap type karte ho, woh sentences mein jawab deta hai, aur aapki script ko guess karna padta hai ki sentence kahan khatam hua. eAPI ek <b>order window</b> hai. Aap ek numbered slip dete ho jisme dishes (commands) likhe hain, aur plates labelled boxes (JSON) mein wapas aati hain, har dish ka ek box, har baar. <code>pyeapi</code> woh clerk hai jo slip bharta hai aur boxes aapki table tak laata hai.</p>
`+e+`
<h3>netmiko hote hue eAPI kyon?</h3>
<table class="cmp"><tr><th></th><th>CLI scraping (netmiko)</th><th>pyeapi ke saath eAPI</th></tr>
<tr><td>Answer</td><td>Text jise parse karna padta hai</td><td>JSON dictionaries (ya text agar maango)</td></tr>
<tr><td>Session</td><td>Ek lambi SSH session, prompts, paging</td><td>Har call ek stateless request, prompt ka intezaar nahi</td></tr>
<tr><td>Kayi commands</td><td>Ek ek karke</td><td>Ek request, har command ka ek result</td></tr>
<tr><td>Errors</td><td>Text mein "Invalid input" dhoondho</td><td>Code ke saath JSON error aur Python exception</td></tr>
<tr><td>Scope</td><td>Koi bhi vendor</td><td>Sirf Arista EOS</td></tr></table>
<p>eAPI <b>command-oriented</b> hai: aap wahi commands bhejte ho jo type karte, aur EOS JSON mein jawab deta hai. Yeh NETCONF ya gNMI (modules <code>adv-netconf</code> aur <code>adv-gnmi</code>) ki tarah model-oriented nahi hai, jahan YANG paths address hote hain. EOS ke liye yeh aksar fayda hai: CLI ka jo bhi aap jaante ho woh chalta hai, aur har <code>show</code> command jiska JSON model hai structured data deta hai.</p>

<h3>Ise chalu karna</h3>
<p>Yeh aapne <code>eos-ops</code> mein banaya tha. Ek user, <code>management api</code> block, <code>protocol https</code> aur <code>no shutdown</code>. <code>no shutdown</code> ke bina service band hai aur koi connect nahi kar sakta.</p>
`+t+`
<p>eAPI HT&#84;P basic authentication se local user database (ya AAA) ke against authenticate karta hai. <code>Hits</code> aur <code>Commands</code> counters aapka pehla debugging tool hain: request switch tak na pahunche to woh zero par rehte hain.</p>

<div class="note"><p><b>Lab vs real gear.</b> Lab management api block ke andar <code>vrf MGMT</code> accept karta hai par uska ek hi routing table hai, isliye eAPI hamesha default VRF mein jawab deta hai. Woh switch certificate kabhi check nahi karta (<code>CERTIFICATE_VERIFY_FAILED</code> jaise TLS errors nahi aa sakte), aur CLI lab ka EOS personality hai jisme 8 ports hain. Is module mein baaki sab, JSON keys, error codes aur pyeapi calls, asli EOS 4.31 aur pyeapi 0.8 ko follow karte hain.</p></div>

<h3>Do labs</h3>
<p><b>Lab 1 (configure)</b> AUTO01 par do leaves ke saamne chhota tool banata hai: LEAF1 (10.99.0.11) aur LEAF2 (10.99.0.12), dono <code>netops / NK@2026</code> se. Aap raw request bhejte ho, <code>.eapi.conf</code> likhte ho, snapshot lete ho, teen VLANs banate ho, BGP neighbour up karte ho aur risky config session abort karte ho. <b>Lab 2 (troubleshoot)</b> aapko <code>fleetcheck.py</code> deta hai jisme teen leaves par chhe alag failures hain.</p>

<div class="scn"><h4>Raat ki shift ki script jo andaza lagati thi</h4><p>Ek team SSH par <code>show interfaces status</code> scrape karti thi. EOS upgrade ke baad ek column ki width badal gayi aur parser ne chupchap galat port ko down padh liya. Unhone eAPI par move kiya: wahi command, par <code>status["Ethernet5"]["linkStatus"]</code> ek key hai, column nahi. Parser phir kabhi nahi toota.</p><p><b>Lesson:</b> structured answers un upgrades se bachte hain jinse formatted text nahi bachta.</p></div>

<div class="iv"><p class="q">"eAPI kya hai aur SSH automation se kaise alag hai?"</p><p>eAPI Arista ka JSON-RPC interface hai: main CLI commands ki list <code>/command-api</code> par TLS ke upar basic authentication ke saath POST karta hoon aur har command ka ek JSON result paata hoon. Prompt ya paging handle nahi karni padti, errors codes ke roop mein aate hain, aur ek request mein kayi commands ja sakte hain. pyeapi use Python mein wrap karta hai. Yeh EOS-specific aur command-based hai, YANG-based NETCONF ya gNMI se alag.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>eAPI = <code>/command-api</code> par TLS ke upar JSON-RPC; commands normal EOS CLI commands hain.</li>
<li>pyeapi patla Python client hai: <code>Node</code>, <code>run_commands</code>, <code>config</code>, <code>api()</code>, sessions.</li>
<li>Service ko user, <code>protocol https</code> aur <code>no shutdown</code> chahiye.</li>
<li><code>show management api h&#116;tp-commands</code> state aur hit counters dikhata hai.</li>
<li>Prerequisites: eos-ops, auto-requests, adv-nkmiko, py-secrets.</li>
</ul></div>
`}};export{n as default};