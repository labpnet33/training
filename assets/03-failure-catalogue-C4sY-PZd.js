var e={id:`failure-catalogue`,h:{en:`Logging faults: the catalogue and the ordered workflow`,hi:`Logging faults: catalogue aur ordered workflow`},body:{en:`
<p>A security guard at a gate checks a visitor in a fixed order: is there an appointment, is the name on the list, is the ID real, is the pass valid. He stops at the first failed check. If the visitor has two problems, the guard only tells him about the first. Fix that and the visitor returns, only to hear about the second. A FortiGate logging to a FortiAnalyzer is judged the same way, and this is why a connection with two faults needs two rounds of repair.</p>

<h3>The order of checks</h3>
<p>The simulator decides the connection state of a FortiGate in a fixed order, and the check commands show the first failure only:</p>
<ol>
<li>Is logging enabled (<code>status enable</code>)?</li>
<li>Is a server address set, and can it be resolved (the simulator takes an IP address)?</li>
<li>Does a TCP session to port 514 reach FAZ-1, and can FAZ-1 answer (route, interface, firewall in between)?</li>
<li>If a <code>serial</code> list is set, does it contain the serial number of FAZ-1?</li>
<li>If <code>certificate-verification</code> is on, is a serial configured?</li>
<li>Connected. Now the FortiAnalyzer decides: is the device registered?</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Ordered checks of a logging connection">
<rect x="6" y="20" width="96" height="50" rx="6" fill="#e2e8f0"/><text x="54" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 enabled</text><text x="54" y="58" text-anchor="middle" class="svg-muted" font-size="12">status</text>
<rect x="112" y="20" width="96" height="50" rx="6" fill="#e2e8f0"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 server</text><text x="160" y="58" text-anchor="middle" class="svg-muted" font-size="12">address</text>
<rect x="218" y="20" width="96" height="50" rx="6" fill="#bae6fd"/><text x="266" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 reach</text><text x="266" y="58" text-anchor="middle" class="svg-muted" font-size="12">514 + return</text>
<rect x="324" y="20" width="96" height="50" rx="6" fill="#ddd6fe"/><text x="372" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 serial</text><text x="372" y="58" text-anchor="middle" class="svg-muted" font-size="12">list match</text>
<rect x="430" y="20" width="96" height="50" rx="6" fill="#ddd6fe"/><text x="478" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 cert</text><text x="478" y="58" text-anchor="middle" class="svg-muted" font-size="12">needs serial</text>
<rect x="536" y="20" width="98" height="50" rx="6" fill="#bbf7d0"/><text x="585" y="42" text-anchor="middle" class="svg-ink" font-size="12">6 register</text><text x="585" y="58" text-anchor="middle" class="svg-muted" font-size="12">on FAZ-1</text>
<text x="6" y="108" class="svg-muted" font-size="12">The first failing check is the only one you see. Steps 1 to 5 are on the FortiGate side of the story, step 6 is FAZ-1.</text>
</svg><p class="cap">Fix them in this order; the next message may appear only after the previous one is gone.</p></div>

<h3>The catalogue</h3>
<p>The check command on the FortiGate is <code>execute log fortianalyzer test-connectivity</code>; its second view is <code>diagnose test application miglogd 6</code> (both names are real, the output is approximated). On FAZ-1 use <code>execute fazui unregistered list</code> (a stand-in for the GUI) and <code>diagnose device list</code>.</p>
<table class="cmp"><tr><th>Symptom (exact wording)</th><th>Check</th><th>Cause and fix</th></tr>
<tr><td>FortiAnalyzer logging is disabled. Enable it: ...</td><td>test-connectivity</td><td>status disable. Set status enable. (miglogd 6 says "Log servers: none (FortiAnalyzer logging is disabled).")</td></tr>
<tr><td>Attribute 'server' MUST be set.</td><td>end of the config</td><td>Enabling without a server is refused. Set the server first.</td></tr>
<tr><td>Connection: cannot resolve faz.kaveri.example (the simulator takes an IP address)</td><td>test-connectivity</td><td>A name instead of an address. Use the IP address 192.0.2.6.</td></tr>
<tr><td>Connection: Connection timeout</td><td>test-connectivity, miglogd 6 ("timed out")</td><td>Wrong server address, no route, interface down, a firewall dropping TCP 514, or no return path.</td></tr>
<tr><td>Connection: Serial number mismatch</td><td>miglogd 6 names both serials</td><td>The serial list does not contain the FAZ-1 serial. Copy it from <code>get system status</code>.</td></tr>
<tr><td>Connection: Certificate verification failed</td><td>test-connectivity</td><td>certificate-verification enable but no serial. Set the serial or disable the check.</td></tr>
<tr><td>Connection: Allow with Registration: unregistered</td><td>test-connectivity, unregistered list</td><td>Connected but not in the device table. Register it; logs sent before are lost.</td></tr>
<tr><td>Connection: Allow but logs missing, lost grows</td><td>miglogd 6 (lost=)</td><td>mode=udp and a firewall blocks UDP 514 while TCP 514 is allowed. Use <code>set reliable enable</code> or open UDP.</td></tr>
<tr><td>Registered, 0/0/0 and no last log</td><td>diagnose device list</td><td>No traffic yet, or logtraffic disabled on the policy, or a filter.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Compare the same test on two units. HQ-FGT points to 192.0.2.60, MDU-FGT is the reference with the correct address:</p></div>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: -
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Connection timeout</span>
HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.60:514 status=disconnected: connection to 192.0.2.60:514 timed out (no FortiAnalyzer answers at that address) mode=udp upload=realtime data-path=-
MDU-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Adom Name: root
<span class="hl">Connection: Allow</span></pre>
<p>The host name line is "-" when nothing answered and "FAZ-1" when something did. That single line already tells you whether you are at step 3 or past it.</p>

<h3>Use a reference device</h3>
<p>When one FortiGate works and another does not, run <code>show log fortianalyzer setting</code> on both and compare line by line. The reference shows server "192.0.2.6" and no extras; the broken unit shows "192.0.2.60" and a serial. A difference you can see beats a theory.</p>

<div class="warn"><p><b>Common mistakes.</b> Stopping after the first fix because "the message changed". Changing three things at once and not knowing which one worked. Reading "Connection timeout" as a FAZ-1 problem when the address was simply mistyped. Treating "Allow" as success while the Registration line says unregistered. Putting a host name in the server field in the simulator.</p></div>

<div class="exam"><p><b>Exam traps.</b> Timeout comes before serial mismatch, so a wrong address hides a wrong serial. A certificate failure here means certificate verification without a configured serial. Connection Allow plus unregistered means logs are discarded. UDP loss shows as Allow with a growing lost counter.</p></div>

<div class="scn"><h4>Two faults, one ticket</h4><p>After a change ticket, HQ-FGT sent nothing. The engineer corrected the address from 192.0.2.60 to 192.0.2.6 and the test turned from "Connection timeout" to "Serial number mismatch". He nearly reported a new fault. It was the second one of the same ticket, hidden until the first was fixed. He copied the serial from the FAZ-1 status output and the test said Allow.</p><p><b>Lesson:</b> a changed message means progress. Keep going until Allow, then check registration, then check a log.</p></div>

<div class="iv"><p class="q">"A FortiGate does not appear on the FortiAnalyzer. How do you troubleshoot?"</p><p>Work in order: logging enabled, server address, reachability of port 514, serial list, certificate setting, registration, then a real log in Log View. Use test-connectivity and miglogd 6 on the FortiGate, and the unregistered list on the FortiAnalyzer. Say that the first error can hide the next.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The connection is judged in a fixed order and only the first failure is shown.</li>
<li>Know the messages: disabled, timeout, serial mismatch, certificate failed, Allow plus unregistered.</li>
<li>Compare with a working reference device before guessing.</li>
<li>Fix one thing, test, repeat. A different message means progress.</li>
<li>Done means a log you can see in Log View, not only Connection: Allow.</li>
</ul></div>
`,hi:`
<p>Gate par security guard visitor ko fixed order mein check karta hai: appointment hai, naam list mein hai, ID asli hai, pass valid hai. Pehle fail hone wale check par wo ruk jaata hai. Agar visitor ki do problems hain to guard sirf pehli batata hai. Wo fix karke lautta hai tab doosri sunta hai. FortiAnalyzer ko log karta FortiGate bhi isi tarah judge hota hai, aur isiliye do faults wali connection ko do round ki repair chahiye.</p>

<h3>Checks ka order</h3>
<p>Simulator FortiGate ki connection state fixed order mein tay karta hai, aur check commands sirf pehla failure dikhate hain:</p>
<ol>
<li>Kya logging enabled hai (<code>status enable</code>)?</li>
<li>Kya server address set hai, aur resolve ho sakta hai (simulator IP address leta hai)?</li>
<li>Kya port 514 par TCP session FAZ-1 tak pahunchta hai, aur FAZ-1 jawab de sakta hai (route, interface, beech ka firewall)?</li>
<li>Agar <code>serial</code> list set hai to kya usme FAZ-1 ka serial number hai?</li>
<li>Agar <code>certificate-verification</code> on hai to kya serial configured hai?</li>
<li>Connected. Ab FortiAnalyzer decide karta hai: kya device registered hai?</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Logging connection ke ordered checks">
<rect x="6" y="20" width="96" height="50" rx="6" fill="#e2e8f0"/><text x="54" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 enabled</text><text x="54" y="58" text-anchor="middle" class="svg-muted" font-size="12">status</text>
<rect x="112" y="20" width="96" height="50" rx="6" fill="#e2e8f0"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 server</text><text x="160" y="58" text-anchor="middle" class="svg-muted" font-size="12">address</text>
<rect x="218" y="20" width="96" height="50" rx="6" fill="#bae6fd"/><text x="266" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 reach</text><text x="266" y="58" text-anchor="middle" class="svg-muted" font-size="12">514 + return</text>
<rect x="324" y="20" width="96" height="50" rx="6" fill="#ddd6fe"/><text x="372" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 serial</text><text x="372" y="58" text-anchor="middle" class="svg-muted" font-size="12">list match</text>
<rect x="430" y="20" width="96" height="50" rx="6" fill="#ddd6fe"/><text x="478" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 cert</text><text x="478" y="58" text-anchor="middle" class="svg-muted" font-size="12">serial chahiye</text>
<rect x="536" y="20" width="98" height="50" rx="6" fill="#bbf7d0"/><text x="585" y="42" text-anchor="middle" class="svg-ink" font-size="12">6 register</text><text x="585" y="58" text-anchor="middle" class="svg-muted" font-size="12">FAZ-1 par</text>
<text x="6" y="108" class="svg-muted" font-size="12">Pehla failing check hi dikhta hai. Steps 1 se 5 FortiGate side, step 6 FAZ-1.</text>
</svg><p class="cap">Isi order mein fix karo; agla message pichhle ke jaane ke baad hi dikh sakta hai.</p></div>

<h3>Catalogue</h3>
<p>FortiGate par check command <code>execute log fortianalyzer test-connectivity</code> hai; doosra view <code>diagnose test application miglogd 6</code> hai (dono naam real hain, output approximate). FAZ-1 par <code>execute fazui unregistered list</code> (GUI ka stand-in) aur <code>diagnose device list</code> use karo.</p>
<table class="cmp"><tr><th>Symptom (exact wording)</th><th>Check</th><th>Cause aur fix</th></tr>
<tr><td>FortiAnalyzer logging is disabled. Enable it: ...</td><td>test-connectivity</td><td>status disable. status enable set karo. (miglogd 6 kehta hai "Log servers: none (FortiAnalyzer logging is disabled).")</td></tr>
<tr><td>Attribute 'server' MUST be set.</td><td>config ka end</td><td>Server ke bina enable refuse hota hai. Pehle server set karo.</td></tr>
<tr><td>Connection: cannot resolve faz.kaveri.example (the simulator takes an IP address)</td><td>test-connectivity</td><td>Address ki jagah naam. IP address 192.0.2.6 use karo.</td></tr>
<tr><td>Connection: Connection timeout</td><td>test-connectivity, miglogd 6 ("timed out")</td><td>Galat server address, route nahi, interface down, firewall TCP 514 drop kar raha hai, ya return path nahi.</td></tr>
<tr><td>Connection: Serial number mismatch</td><td>miglogd 6 dono serials batata hai</td><td>Serial list mein FAZ-1 ka serial nahi hai. <code>get system status</code> se copy karo.</td></tr>
<tr><td>Connection: Certificate verification failed</td><td>test-connectivity</td><td>certificate-verification enable hai par serial nahi. Serial set karo ya check disable karo.</td></tr>
<tr><td>Connection: Allow aur Registration: unregistered</td><td>test-connectivity, unregistered list</td><td>Connected hai par device table mein nahi. Register karo; pehle bheje logs lost.</td></tr>
<tr><td>Connection: Allow par logs missing, lost badh raha hai</td><td>miglogd 6 (lost=)</td><td>mode=udp aur firewall UDP 514 block karta hai jabki TCP 514 allowed. <code>set reliable enable</code> karo ya UDP kholo.</td></tr>
<tr><td>Registered, 0/0/0 aur last log nahi</td><td>diagnose device list</td><td>Abhi traffic nahi, ya policy par logtraffic disabled, ya filter.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Do units par wahi test compare karo. HQ-FGT 192.0.2.60 ko point karta hai, MDU-FGT sahi address wala reference hai:</p></div>
<pre class="out">HQ-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: -
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Connection timeout</span>
HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.60:514 status=disconnected: connection to 192.0.2.60:514 timed out (no FortiAnalyzer answers at that address) mode=udp upload=realtime data-path=-
MDU-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Adom Name: root
<span class="hl">Connection: Allow</span></pre>
<p>Jab kisi ne jawab nahi diya to host name line "-" hoti hai aur jawab aaye to "FAZ-1". Ye ek line hi bata deti hai ki aap step 3 par ho ya usse aage.</p>

<h3>Reference device use karo</h3>
<p>Jab ek FortiGate chalta hai aur doosra nahi, dono par <code>show log fortianalyzer setting</code> chalao aur line-by-line compare karo. Reference mein server "192.0.2.6" hai aur extras nahi; broken unit mein "192.0.2.60" aur ek serial hai. Jo difference aap dekh sako wo theory se behtar hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Pehle fix ke baad ruk jana kyunki "message badal gaya". Ek saath teen cheezein badalna aur pata na chalna ki kaun si kaam aayi. "Connection timeout" ko FAZ-1 problem samajhna jabki address bas galat type hua tha. "Allow" ko success maanna jabki Registration line unregistered kehti hai. Simulator mein server field mein host name daalna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Timeout serial mismatch se pehle aata hai, isliye galat address galat serial ko chhupa deta hai. Yahan certificate failure ka matlab hai certificate verification bina configured serial ke. Connection Allow plus unregistered ka matlab logs discard ho rahe hain. UDP loss Allow ke saath badhte lost counter ki tarah dikhta hai.</p></div>

<div class="scn"><h4>Do faults, ek ticket</h4><p>Change ticket ke baad HQ-FGT ne kuch nahi bheja. Engineer ne address 192.0.2.60 se 192.0.2.6 sahi kiya aur test "Connection timeout" se "Serial number mismatch" ban gaya. Wo lagbhag naya fault report karne wala tha. Wo usi ticket ka doosra fault tha, pehle ke fix hone tak chhupa hua. Usne serial FAZ-1 status output se copy kiya aur test ne Allow kaha.</p><p><b>Lesson:</b> badla hua message progress hai. Allow tak chalte raho, phir registration check karo, phir ek log check karo.</p></div>

<div class="iv"><p class="q">"Ek FortiGate FortiAnalyzer par nahi dikh raha. Aap troubleshoot kaise karoge?"</p><p>Order mein kaam karo: logging enabled, server address, port 514 ki reachability, serial list, certificate setting, registration, phir Log View mein ek asli log. FortiGate par test-connectivity aur miglogd 6, FortiAnalyzer par unregistered list use karo. Bolo ki pehla error agle ko chhupa sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connection fixed order mein judge hoti hai aur sirf pehla failure dikhta hai.</li>
<li>Messages yaad rakho: disabled, timeout, serial mismatch, certificate failed, Allow plus unregistered.</li>
<li>Guess karne se pehle working reference device se compare karo.</li>
<li>Ek cheez fix karo, test karo, repeat. Alag message matlab progress.</li>
<li>Done matlab Log View mein dikhta log, sirf Connection: Allow nahi.</li>
</ul></div>
`}};export{e as default};