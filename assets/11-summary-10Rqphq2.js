var e=String.raw`<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="The pyeapi toolkit on one page">
<rect x="10" y="10" width="190" height="96" rx="8" fill="#ddd6fe"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">Connect</text><text x="22" y="54" class="svg-ink" font-size="12">.eapi.conf profiles</text><text x="22" y="72" class="svg-ink" font-size="12">connect_to(name)</text><text x="22" y="90" class="svg-ink" font-size="12">enablepwd if needed</text>
<rect x="225" y="10" width="190" height="96" rx="8" fill="#fde68a"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Read</text><text x="237" y="54" class="svg-ink" font-size="12">run_commands(list)</text><text x="237" y="72" class="svg-ink" font-size="12">enable(strict=True)</text><text x="237" y="90" class="svg-ink" font-size="12">api("vlans").get()</text>
<rect x="440" y="10" width="190" height="96" rx="8" fill="#bbf7d0"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">Change</text><text x="452" y="54" class="svg-ink" font-size="12">configure_session()</text><text x="452" y="72" class="svg-ink" font-size="12">diff, then commit/abort</text><text x="452" y="90" class="svg-ink" font-size="12">api setters: check True</text>
<rect x="10" y="124" width="300" height="86" rx="8" fill="#fecaca"/><text x="160" y="146" text-anchor="middle" class="svg-ink" font-size="13">Fail well</text><text x="22" y="168" class="svg-ink" font-size="12">CommandError: read code, output</text><text x="22" y="186" class="svg-ink" font-size="12">ConnectionError: place the rung</text><text x="22" y="204" class="svg-ink" font-size="12">log class and message, per switch</text>
<rect x="330" y="124" width="300" height="86" rx="8" fill="#ddd6fe"/><text x="480" y="146" text-anchor="middle" class="svg-ink" font-size="13">Prove</text><text x="342" y="168" class="svg-ink" font-size="12">small snapshot before and after</text><text x="342" y="186" class="svg-ink" font-size="12">idempotent: compare, then change</text><text x="342" y="204" class="svg-ink" font-size="12">exit non-zero on any failure</text>
</svg></div>
<p class="cap">The module on one page. Every box was used in Lab 1 or Lab 2.</p>`,t={id:`summary`,h:{en:`Summary, cheat sheet and choosing a tool`,hi:`Summary, cheat sheet aur tool chunna`},body:{en:`
<p>You started with a raw POST and finished with scripts that read, change, verify and troubleshoot a small fabric. This chapter puts it on one page and then answers the question that comes up at work: when is pyeapi the right tool?</p>

<h3>The module on a page</h3>
`+e+`
<table class="cmp"><tr><th>I want to...</th><th>Use</th><th>Chapter</th></tr>
<tr><td>See what travels on the wire</td><td><code>curl -k -u user:pass -d '{...runCmds...}' h&#116;tps://switch/command-api</code></td><td>2</td></tr>
<tr><td>Reach a switch without passwords in code</td><td><code>~/.eapi.conf</code> and <code>pyeapi.connect_to("leaf1")</code></td><td>3</td></tr>
<tr><td>Run show commands</td><td><code>node.run_commands([...])</code>, <code>[0]</code> for the first result</td><td>4</td></tr>
<tr><td>Read a command with no JSON model</td><td><code>encoding="text"</code> or <code>node.enable(cmd)</code></td><td>4</td></tr>
<tr><td>Handle failures</td><td><code>except CommandError</code> and <code>except ConnectionError</code>, both from <code>pyeapi.eapilib</code></td><td>5</td></tr>
<tr><td>Push a few config lines</td><td><code>node.config([...])</code>, interface and sub-commands in one list</td><td>6</td></tr>
<tr><td>Change safely</td><td><code>configure_session()</code>, <code>diff()</code>, explicit <code>commit()</code> or <code>abort()</code></td><td>7</td></tr>
<tr><td>Manage VLANs, BGP, interfaces</td><td><code>node.api("vlans")</code> and friends; check the returned <code>True</code></td><td>8</td></tr>
<tr><td>Prove it worked, at scale</td><td>Snapshot before and after, thread pool, non-zero exit</td><td>9</td></tr>
<tr><td>Find out why it fails</td><td>The ladder, <code>show management api h&#116;tp-commands</code></td><td>10</td></tr></table>

<h3>Choosing a tool</h3>
<table class="cmp"><tr><th>Tool</th><th>Talks to</th><th>Good for</th><th>Limit</th></tr>
<tr><td><code>netmiko</code></td><td>The CLI over SSH, as text</td><td>Any vendor, quick wins, commands with no API</td><td>You parse text and handle prompts</td></tr>
<tr><td><code>requests</code> + eAPI</td><td>JSON-RPC over TLS</td><td>No extra package, full control of the request</td><td>You build and unwrap every request and error</td></tr>
<tr><td><code>pyeapi</code></td><td>The same eAPI</td><td>Arista fleets: profiles, exceptions, sessions, api modules</td><td>Arista only; the api modules cover a subset</td></tr>
<tr><td><code>ncclient</code></td><td>NETCONF over SSH, as XML</td><td>Vendor-neutral models, candidate and commit (Junos)</td><td>XML, and vendor models differ</td></tr></table>
<p>On a mixed network you will use more than one. Use pyeapi when the box is an Arista switch and you want the object model; use netmiko when you need a vendor-neutral CLI loop; use ncclient where the platform offers NETCONF. They share the same safe habits: idempotence, read the diff, verify afterwards.</p>

<h3>What is different on a real switch</h3>
<ul>
<li>The lab's curl prints response headers on every call; real curl needs <code>-i</code>.</li>
<li>The lab loads <code>~/.eapi.conf</code> on first use; real pyeapi loads it at import.</li>
<li>The lab names helper sessions <code>pyeapi_1</code> and aborts a session left open when <code>with</code> ends; real pyeapi may name and commit differently, so always call <code>commit()</code> or <code>abort()</code> yourself.</li>
<li>A 401 is an <code>HttpError</code> in the lab; on real gear it may surface as <code>ConnectionError</code>. Catch the parent.</li>
<li>The lab implements a subset of the api modules and a few setters return <code>False</code>; the lab has one VRF and no <code>commit timer</code>.</li>
<li>Certificates are never verified in the lab. In production, use a real certificate and verify it.</li>
</ul>
<div class="exam"><p><b>Exam trap.</b> "eAPI is REST." It is not. It is one POST endpoint speaking JSON-RPC, with every command in the body. REST has many URLs and uses the HT&#84;P verbs. The status code is 200 even for failed commands.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating <code>True</code>, a 200 or "no exception" as proof. Proof is a read-back of the thing you wanted: the VLAN exists, the peer is Established.</p></div>

<div class="scn"><h4>The migration that did not need a rewrite</h4><p>A team had 200 lines of netmiko that logged in over SSH and cut the output of <code>show ip bgp summary</code> with regular expressions. After a software upgrade a column moved and the report broke. They replaced the parsing with <code>run_commands("show ip bgp summary")[0]["vrfs"]</code> and added a profile file. The report no longer cared about columns, and the same file now served the config scripts.</p><p><b>Lesson:</b> structured output removes a whole class of breakage.</p></div>

<div class="iv"><p class="q">"Give me the one-minute summary of Arista automation with pyeapi."</p><p>pyeapi talks to eAPI, a JSON-RPC endpoint on HTTPS. I keep connection profiles in a protected file, call <code>run_commands</code> for structured show output, and use the api modules for VLANs, interfaces and BGP, checking each return value. For changes I use a config session, read the diff and commit or abort explicitly. I catch <code>CommandError</code> and <code>ConnectionError</code> separately, snapshot the state before and after, and exit non-zero on any failure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>pyeapi is a thin Python layer over eAPI: profiles, <code>run_commands</code>, <code>config</code>, sessions and api modules.</li>
<li>Safe automation is the same everywhere: idempotent, diff before commit, verify after, fail loudly.</li>
<li>Pick the tool by what the platform offers: pyeapi for Arista, netmiko for any CLI, ncclient for NETCONF.</li>
<li>Know the lab-versus-real differences: headers, session behaviour, error classes, module coverage.</li>
<li>Next: work through the scenarios, the quiz and the interview questions.</li>
</ul></div>
`,hi:`
<p>Aapne raw POST se shuru kiya aur aisi scripts par khatam kiya jo ek chhote fabric ko padhti, badalti, verify karti aur troubleshoot karti hain. Yeh chapter sab ek page par rakhta hai aur phir woh sawaal jawab deta hai jo kaam par uthta hai: pyeapi kab sahi tool hai?</p>

<h3>Ek page par module</h3>
`+e+`
<table class="cmp"><tr><th>Mujhe chahiye...</th><th>Use karo</th><th>Chapter</th></tr>
<tr><td>Wire par kya jaata hai dekhna</td><td><code>curl -k -u user:pass -d '{...runCmds...}' h&#116;tps://switch/command-api</code></td><td>2</td></tr>
<tr><td>Code mein passwords ke bina switch tak pahunchna</td><td><code>~/.eapi.conf</code> aur <code>pyeapi.connect_to("leaf1")</code></td><td>3</td></tr>
<tr><td>Show commands chalana</td><td><code>node.run_commands([...])</code>, pehle result ke liye <code>[0]</code></td><td>4</td></tr>
<tr><td>Bina JSON model wala command padhna</td><td><code>encoding="text"</code> ya <code>node.enable(cmd)</code></td><td>4</td></tr>
<tr><td>Failures sambhalna</td><td><code>except CommandError</code> aur <code>except ConnectionError</code>, dono <code>pyeapi.eapilib</code> se</td><td>5</td></tr>
<tr><td>Kuch config lines push karna</td><td><code>node.config([...])</code>, interface aur sub-commands ek list mein</td><td>6</td></tr>
<tr><td>Surakshit change</td><td><code>configure_session()</code>, <code>diff()</code>, explicit <code>commit()</code> ya <code>abort()</code></td><td>7</td></tr>
<tr><td>VLANs, BGP, interfaces manage karna</td><td><code>node.api("vlans")</code> aur saathi; lautaya <code>True</code> check karo</td><td>8</td></tr>
<tr><td>Scale par sabit karna ki chala</td><td>Pehle aur baad snapshot, thread pool, non-zero exit</td><td>9</td></tr>
<tr><td>Fail kyun hota hai pata karna</td><td>Seedhi, <code>show management api h&#116;tp-commands</code></td><td>10</td></tr></table>

<h3>Tool chunna</h3>
<table class="cmp"><tr><th>Tool</th><th>Kisse baat karta hai</th><th>Kis kaam ka</th><th>Seema</th></tr>
<tr><td><code>netmiko</code></td><td>SSH par CLI, text mein</td><td>Koi bhi vendor, tez jeet, jin commands ka API nahi</td><td>Text parse karna aur prompts sambhalna</td></tr>
<tr><td><code>requests</code> + eAPI</td><td>TLS par JSON-RPC</td><td>Koi extra package nahi, request par poora control</td><td>Har request aur error khud banao aur kholo</td></tr>
<tr><td><code>pyeapi</code></td><td>Wahi eAPI</td><td>Arista fleets: profiles, exceptions, sessions, api modules</td><td>Sirf Arista; api modules ek hissa cover karte hain</td></tr>
<tr><td><code>ncclient</code></td><td>SSH par NETCONF, XML mein</td><td>Vendor-neutral models, candidate aur commit (Junos)</td><td>XML, aur vendor models alag hote hain</td></tr></table>
<p>Mixed network par aap ek se zyada use karoge. Box Arista switch ho aur object model chahiye to pyeapi; vendor-neutral CLI loop chahiye to netmiko; platform NETCONF de to ncclient. Teeno ki surakshit aadatein ek hain: idempotence, diff padho, baad mein verify karo.</p>

<h3>Asli switch par kya alag hai</h3>
<ul>
<li>Lab ka curl har call par response headers print karta hai; asli curl ko <code>-i</code> chahiye.</li>
<li>Lab <code>~/.eapi.conf</code> pehli baar use par load karta hai; asli pyeapi import par load karta hai.</li>
<li>Lab helper sessions ka naam <code>pyeapi_1</code> rakhta hai aur <code>with</code> khatam hone par khula session abort karta hai; asli pyeapi naam aur commit alag kar sakta hai, isliye <code>commit()</code> ya <code>abort()</code> khud bulao.</li>
<li>Lab mein 401 <code>HttpError</code> hai; asli gear par <code>ConnectionError</code> ke roop mein aa sakta hai. Parent pakdo.</li>
<li>Lab api modules ka ek hissa implement karta hai aur kuch setters <code>False</code> lautate hain; lab mein ek VRF hai aur <code>commit timer</code> nahi.</li>
<li>Lab mein certificates kabhi verify nahi hote. Production mein asli certificate lagao aur verify karo.</li>
</ul>
<div class="exam"><p><b>Exam trap.</b> "eAPI REST hai." Nahi hai. Yeh ek POST endpoint hai jo JSON-RPC bolta hai, har command body mein. REST ke kai URLs hote hain aur HT&#84;P verbs use hote hain. Failed commands par bhi status code 200 hota hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>True</code>, 200 ya "exception nahi aaya" ko saboot maanna. Saboot woh read-back hai jo aap chahte the: VLAN maujood hai, peer Established hai.</p></div>

<div class="scn"><h4>Woh migration jise rewrite nahi chahiye tha</h4><p>Ek team ke paas netmiko ki 200 lines thi jo SSH se login karke <code>show ip bgp summary</code> ka output regular expressions se kaatti thi. Software upgrade ke baad ek column khisak gaya aur report toot gayi. Unhone parsing ki jagah <code>run_commands("show ip bgp summary")[0]["vrfs"]</code> lagaya aur ek profile file joda. Report ko columns se matlab nahi raha, aur wahi file ab config scripts ke bhi kaam aati hai.</p><p><b>Lesson:</b> structured output ek poori kism ki toot-phoot hata deta hai.</p></div>

<div class="iv"><p class="q">"pyeapi ke saath Arista automation ka ek minute ka summary do."</p><p>pyeapi eAPI se baat karta hai, jo HTTPS par JSON-RPC endpoint hai. Connection profiles protected file mein rakhta hoon, structured show output ke liye <code>run_commands</code> bulata hoon, aur VLANs, interfaces aur BGP ke liye api modules use karta hoon, har return value check karke. Changes ke liye config session, diff padhta hoon aur commit ya abort explicitly karta hoon. <code>CommandError</code> aur <code>ConnectionError</code> alag pakadta hoon, pehle aur baad snapshot leta hoon, aur koi bhi failure par non-zero exit karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>pyeapi eAPI par patli Python layer hai: profiles, <code>run_commands</code>, <code>config</code>, sessions aur api modules.</li>
<li>Surakshit automation har jagah ek jaisi hai: idempotent, commit se pehle diff, baad mein verify, zor se fail.</li>
<li>Tool platform ke hisaab se chuno: Arista ke liye pyeapi, kisi bhi CLI ke liye netmiko, NETCONF ke liye ncclient.</li>
<li>Lab-vs-real ke farq jaano: headers, session behaviour, error classes, module coverage.</li>
<li>Agla kadam: scenarios, quiz aur interview questions karo.</li>
</ul></div>
`}};export{t as default};