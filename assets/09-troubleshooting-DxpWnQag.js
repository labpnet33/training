var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from symptom to fix`,hi:`Troubleshooting workflow: symptom se fix tak`},body:{en:`
<p>Good troubleshooting is a habit, not a talent. This chapter gives you one workflow that solves most first-steps problems on a 9800 and applies it to the three labs of this module and to faults you will meet in the next ones.</p>

<h3>Analogy: a doctor, not a guesser</h3>
<p>A doctor does not prescribe because the patient "looks ill". She takes history, runs tests in a sensible order, and treats the proven cause. Treat a wireless ticket the same way: gather evidence from the controller, narrow down by stage, fix one thing and re-test.</p>

<h3>The five stages of a wireless client</h3>
<p>Every working client passes through five stages. A failure at stage N hides everything after it, so test in order.</p>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Five stages">
<rect x="10" y="20" width="112" height="50" rx="8" fill="#bbf7d0"/><text x="66" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 AP joined</text><text x="66" y="58" text-anchor="middle" class="svg-muted" font-size="11">CAPWAP</text>
<rect x="136" y="20" width="112" height="50" rx="8" fill="#bae6fd"/><text x="192" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 AP serving</text><text x="192" y="58" text-anchor="middle" class="svg-muted" font-size="11">tags, radio</text>
<rect x="262" y="20" width="112" height="50" rx="8" fill="#ddd6fe"/><text x="318" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 Associated</text><text x="318" y="58" text-anchor="middle" class="svg-muted" font-size="11">security</text>
<rect x="388" y="20" width="112" height="50" rx="8" fill="#fde68a"/><text x="444" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 Addressed</text><text x="444" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN, DHCP</text>
<rect x="514" y="20" width="116" height="50" rx="8" fill="#fed7aa"/><text x="572" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 Reaches app</text><text x="572" y="58" text-anchor="middle" class="svg-muted" font-size="11">routing</text>
<line x1="122" y1="45" x2="136" y2="45" stroke="#64748b"/><line x1="248" y1="45" x2="262" y2="45" stroke="#64748b"/><line x1="374" y1="45" x2="388" y2="45" stroke="#64748b"/><line x1="500" y1="45" x2="514" y2="45" stroke="#64748b"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">Client sees no SSID: stage 1 or 2. Fails to connect: stage 3.</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Connects but no IP or wrong IP: stage 4. IP fine but no access: stage 5.</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="11">Module labs: wl-mgmt-iface = stage 1, wl-first-wlan and wl-default-tag = stages 2 to 5</text>
</svg><p class="cap">Stage numbers tell you which commands to run first.</p></div>

<h3>The workflow</h3>
<ol>
<li><b>Define the symptom precisely.</b> Which client, which SSID, which AP, since when, what changed?</li>
<li><b>Locate the stage</b> using the symptom table below.</li>
<li><b>Collect evidence</b> with show commands. Do not change anything yet.</li>
<li><b>Name the object that owns the fault.</b> WLAN, policy, tag, AP profile, interface, switch, router?</li>
<li><b>Make one minimal fix on that object</b>, not a rebuild.</li>
<li><b>Prove it</b> with the same evidence plus a client test, then save.</li>
</ol>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Evidence command</th></tr>
<tr><td>APs missing from <code>show ap summary</code></td><td>Management interface, trunk, discovery</td><td><code>show wireless management interface</code>, <code>ping</code> the gateway</td></tr>
<tr><td>AP Registered, no SSID anywhere</td><td>No policy tag, tag empty, WLAN or policy shut</td><td><code>show ap tag summary</code>, <code>show wlan summary</code></td></tr>
<tr><td>SSID on one AP only</td><td>Only that AP tagged</td><td><code>show ap tag summary</code></td></tr>
<tr><td>Radios disabled</td><td>Country not allowed, RF profile shut</td><td><code>show ap dot11 24ghz summary</code>, <code>show wireless country configured</code></td></tr>
<tr><td>Connects but no IP</td><td>Policy VLAN missing or not trunked</td><td><code>show wireless profile policy detailed</code>, <code>show vlan brief</code>, <code>show interfaces trunk</code></td></tr>
<tr><td>IP fine, no reach</td><td>Routing or ACL at R1</td><td><code>ping</code> the gateway, then the server</td></tr></table>
<p>Some of these (country, RF, VLAN, RADIUS) belong to later modules. Here you only need to recognise that they are different stages, so that a missing SSID does not make you guess.</p>

<h3>Worked trace: all three module labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Stage that fails</th><th>Evidence</th><th>One fix</th></tr>
<tr><td>wl-mgmt-iface</td><td>1: AP joined</td><td>No Registered APs; management interface not declared or gateway ping fails</td><td>Complete VLAN 99, SVI, trunk, default route and <code>wireless management interface Vlan99</code></td></tr>
<tr><td>wl-first-wlan</td><td>2 to 5: nothing built yet</td><td>show wlan summary shows Number of WLANs: 0</td><td>Create WLAN, policy, tag and tag the APs</td></tr>
<tr><td>wl-default-tag</td><td>2: AP serving</td><td>Policy tag default-policy-tag, source Default</td><td><code>ap name AP1 policy-tag PT-CAMPUS</code> and for AP2</td></tr></table>

<pre class="out">WLC1# show wireless management interface

Wireless management interface : Vlan99
IP address                    : (interface down or no address)</pre>
<p>This output is evidence for stage 1: the declaration exists but the SVI is not up. Fix: <code>interface Vlan99</code>, give the address, <code>no shutdown</code>, and make sure the VLAN exists and the trunk carries it.</p>

<h3>Use the controller log</h3>
<pre class="out">WLC1# show logging

Syslog logging: enabled
<span class="hl">Oct  4 10:12:44.244: %CAPWAP-5-AP_JOINED: AP AP1 (00:50:42:a6:98:01, 10.10.10.11) joined the controller, discovery by DHCP option 43</span>
Oct  4 10:15:02.512: %APF-6-CLIENT_ASSOC: Client 00:50:2f:e9:9a:01 associated to AP AP1 (5 GHz ch 36) on WLAN 1 (NK-STAFF), interface Vlan20 VLAN 20</pre>
<p>The log timestamps the join of each AP and other significant events. In later modules it also records RADIUS and VLAN problems. Message text is an example; read your own output.</p>

<h3>Habits that save time</h3>
<ul>
<li>Test from both sides: the client view (<code>wifi status</code>) and the controller view (<code>show wireless client summary</code>).</li>
<li>Prefer <code>show running-config | section wlan</code> to scrolling the whole configuration.</li>
<li>Do not touch the objects that evidence says are healthy; the lab tickets deliberately say "without recreating anything".</li>
<li>Save with <code>write memory</code> only after the proof passes.</li>
<li>Write the root cause in one sentence; it forces clarity and builds your interview stories.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Floor 2 cannot see the staff Wi-Fi." Stage test: <code>show ap summary</code> shows AP2 Registered (stage 1 passes). <code>show ap tag summary</code> shows AP2 on default-policy-tag (stage 2 fails). Owner: the AP tag assignment. Fix: <code>ap name AP2 policy-tag PT-CAMPUS</code>. Proof: LAPTOP2 near AP2 gets 10.10.20.x and pings RAD1. Time: two minutes, one command.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing several things at once, so you cannot tell which one worked. (2) Fixing the symptom on the client (forgetting and re-adding the network) instead of the controller object. (3) Rebuilding a working object. (4) Stopping at "the SSID appears" without a ping.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scenario questions give evidence and ask for the owner of the fix. Read the output for the one abnormal value (default-policy-tag, DISABLED, DOWN, not configured) and match it to the object that owns it.</p></div>

<div class="scn"><h4>Two engineers, one outage</h4><p>On Monday, staff Wi-Fi died on floor 2. Engineer A recreated the WLAN and policy, which took forty minutes and broke the other floor briefly. Engineer B, called later, ran <code>show ap tag summary</code> and saw AP2 had reverted to default-policy-tag after a replacement. One command restored service. Both got the same result, but only one understood the cause.</p><p><b>Lesson:</b> evidence first, minimal fix second.</p></div>

<div class="iv"><p class="q">"How do you troubleshoot Wi-Fi that is not working?"</p><p>Strong answer: define the symptom, place it in a stage (AP joined, AP serving, associated, addressed, reaching services), collect controller evidence with show commands, identify the object that owns the fault, make one minimal fix, and prove it with a client test. Give the tag example from this module.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test in order: AP joined, AP serving, associated, addressed, reaching services.</li>
<li>Collect evidence before changing anything; name the owning object.</li>
<li>One minimal fix, then prove with show output and a client ping.</li>
<li>No SSID visible means stage 1 or 2: check join, then tags, WLAN and policy status, then radios.</li>
<li>Save only after the proof, and record the root cause.</li>
</ul></div>
`,hi:`
<p>Achhi troubleshooting ek aadat hai, talent nahi. Yeh chapter ek workflow deta hai jo 9800 par zyadatar first-steps problems solve karta hai aur use is module ke teen labs par aur aage ke modules ke faults par apply karta hai.</p>

<h3>Analogy: doctor, anda-aza lagane wala nahi</h3>
<p>Doctor sirf isliye dawa nahi likhti ki patient "bimar dikhta hai". Woh history leti hai, sahi order mein tests chalati hai, aur proven cause ka ilaaj karti hai. Wireless ticket ko bhi aise hi treat karo: controller se evidence jama karo, stage se narrow down karo, ek cheez fix karo aur dobara test karo.</p>

<h3>Wireless client ke paanch stages</h3>
<p>Har working client paanch stages se guzarta hai. Stage N par failure uske baad ki har cheez chhupa deta hai, isliye order mein test karo.</p>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Paanch stages">
<rect x="10" y="20" width="112" height="50" rx="8" fill="#bbf7d0"/><text x="66" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 AP joined</text><text x="66" y="58" text-anchor="middle" class="svg-muted" font-size="11">CAPWAP</text>
<rect x="136" y="20" width="112" height="50" rx="8" fill="#bae6fd"/><text x="192" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 AP serving</text><text x="192" y="58" text-anchor="middle" class="svg-muted" font-size="11">tags, radio</text>
<rect x="262" y="20" width="112" height="50" rx="8" fill="#ddd6fe"/><text x="318" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 Associated</text><text x="318" y="58" text-anchor="middle" class="svg-muted" font-size="11">security</text>
<rect x="388" y="20" width="112" height="50" rx="8" fill="#fde68a"/><text x="444" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 Addressed</text><text x="444" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN, DHCP</text>
<rect x="514" y="20" width="116" height="50" rx="8" fill="#fed7aa"/><text x="572" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 App tak</text><text x="572" y="58" text-anchor="middle" class="svg-muted" font-size="11">routing</text>
<line x1="122" y1="45" x2="136" y2="45" stroke="#64748b"/><line x1="248" y1="45" x2="262" y2="45" stroke="#64748b"/><line x1="374" y1="45" x2="388" y2="45" stroke="#64748b"/><line x1="500" y1="45" x2="514" y2="45" stroke="#64748b"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">Client ko SSID nahi dikhta: stage 1 ya 2. Connect nahi hota: stage 3.</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Connect hota hai lekin IP nahi ya galat IP: stage 4. IP theek lekin access nahi: stage 5.</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="11">Module labs: wl-mgmt-iface = stage 1, wl-first-wlan aur wl-default-tag = stages 2 se 5</text>
</svg><p class="cap">Stage numbers batate hain ki pehle kaunse commands chalane hain.</p></div>

<h3>Workflow</h3>
<ol>
<li><b>Symptom precisely define karo.</b> Kaunsa client, kaunsa SSID, kaunsa AP, kab se, kya badla?</li>
<li><b>Stage locate karo</b> neeche ki symptom table se.</li>
<li><b>Evidence jama karo</b> show commands se. Abhi kuch badlo mat.</li>
<li><b>Fault ka owner object batao.</b> WLAN, policy, tag, AP profile, interface, switch, router?</li>
<li><b>Us object par ek minimal fix karo</b>, rebuild nahi.</li>
<li><b>Prove karo</b> wahi evidence aur client test se, phir save karo.</li>
</ol>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Evidence command</th></tr>
<tr><td><code>show ap summary</code> mein APs missing</td><td>Management interface, trunk, discovery</td><td><code>show wireless management interface</code>, gateway ko <code>ping</code></td></tr>
<tr><td>AP Registered, kahin SSID nahi</td><td>Policy tag nahi, tag khaali, WLAN ya policy shut</td><td><code>show ap tag summary</code>, <code>show wlan summary</code></td></tr>
<tr><td>SSID sirf ek AP par</td><td>Sirf wohi AP tag hua</td><td><code>show ap tag summary</code></td></tr>
<tr><td>Radios disabled</td><td>Country allowed nahi, RF profile shut</td><td><code>show ap dot11 24ghz summary</code>, <code>show wireless country configured</code></td></tr>
<tr><td>Connect hota hai lekin IP nahi</td><td>Policy VLAN missing ya trunk nahi</td><td><code>show wireless profile policy detailed</code>, <code>show vlan brief</code>, <code>show interfaces trunk</code></td></tr>
<tr><td>IP theek, reach nahi</td><td>R1 par routing ya ACL</td><td>Gateway phir server ko <code>ping</code></td></tr></table>
<p>Inmein se kuch (country, RF, VLAN, RADIUS) aage ke modules ke hain. Yahan bas pehchanna hai ki yeh alag stages hain, taaki SSID missing hone par aap guess na karo.</p>

<h3>Worked trace: module ke teeno labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Kaunsa stage fail</th><th>Evidence</th><th>Ek fix</th></tr>
<tr><td>wl-mgmt-iface</td><td>1: AP joined</td><td>Koi Registered AP nahi; management interface declare nahi ya gateway ping fail</td><td>VLAN 99, SVI, trunk, default route aur <code>wireless management interface Vlan99</code> poore karo</td></tr>
<tr><td>wl-first-wlan</td><td>2 se 5: abhi kuch bana nahi</td><td>show wlan summary Number of WLANs: 0 dikhata hai</td><td>WLAN, policy, tag banao aur APs tag karo</td></tr>
<tr><td>wl-default-tag</td><td>2: AP serving</td><td>Policy tag default-policy-tag, source Default</td><td><code>ap name AP1 policy-tag PT-CAMPUS</code> aur AP2 ke liye</td></tr></table>

<pre class="out">WLC1# show wireless management interface

Wireless management interface : Vlan99
IP address                    : (interface down or no address)</pre>
<p>Yeh output stage 1 ka evidence hai: declaration hai lekin SVI up nahi hai. Fix: <code>interface Vlan99</code>, address do, <code>no shutdown</code>, aur dhyan rakho ki VLAN exist kare aur trunk use carry kare.</p>

<h3>Controller log use karo</h3>
<pre class="out">WLC1# show logging

Syslog logging: enabled
<span class="hl">Oct  4 10:12:44.244: %CAPWAP-5-AP_JOINED: AP AP1 (00:50:42:a6:98:01, 10.10.10.11) joined the controller, discovery by DHCP option 43</span>
Oct  4 10:15:02.512: %APF-6-CLIENT_ASSOC: Client 00:50:2f:e9:9a:01 associated to AP AP1 (5 GHz ch 36) on WLAN 1 (NK-STAFF), interface Vlan20 VLAN 20</pre>
<p>Log har AP ke join aur doosre significant events ko timestamp karta hai. Aage ke modules mein yeh RADIUS aur VLAN problems bhi record karta hai. Message text example hai; apna output padho.</p>

<h3>Time bachane wali aadatein</h3>
<ul>
<li>Dono taraf se test karo: client view (<code>wifi status</code>) aur controller view (<code>show wireless client summary</code>).</li>
<li>Poori configuration scroll karne ki jagah <code>show running-config | section wlan</code> use karo.</li>
<li>Jin objects ko evidence healthy bata raha hai unhe mat chhuo; lab tickets jaan-boojh ke kehte hain "bina kuch recreate kiye".</li>
<li><code>write memory</code> sirf proof pass hone ke baad.</li>
<li>Root cause ek sentence mein likho; isse clarity aati hai aur interview stories bante hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Floor 2 ko staff Wi-Fi nahi dikh raha." Stage test: <code>show ap summary</code> AP2 Registered dikhata hai (stage 1 pass). <code>show ap tag summary</code> AP2 ko default-policy-tag par dikhata hai (stage 2 fail). Owner: AP tag assignment. Fix: <code>ap name AP2 policy-tag PT-CAMPUS</code>. Proof: AP2 ke paas LAPTOP2 ko 10.10.20.x milta hai aur RAD1 ko ping hota hai. Time: do minute, ek command.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Ek saath kai cheezein badalna, phir pata nahi chalta kaunsi se kaam hua. (2) Controller object fix karne ki jagah client par symptom fix karna (network forget karke dobara add karna). (3) Working object ko rebuild karna. (4) "SSID dikh gaya" par ruk jaana bina ping ke.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scenario questions evidence dete hain aur fix ka owner poochte hain. Output mein ek abnormal value padho (default-policy-tag, DISABLED, DOWN, not configured) aur use us object se match karo jo uska owner hai.</p></div>

<div class="scn"><h4>Do engineers, ek outage</h4><p>Monday ko floor 2 ka staff Wi-Fi band ho gaya. Engineer A ne WLAN aur policy dobara banaye, jismein chalis minute lage aur doosri floor kuch der ke liye toot gayi. Engineer B ko baad mein bulaya gaya, usne <code>show ap tag summary</code> chalaya aur dekha ki replacement ke baad AP2 default-policy-tag par wapas aa gaya tha. Ek command ne service restore kar di. Dono ko same result mila, lekin cause sirf ek ne samjha.</p><p><b>Seekh:</b> pehle evidence, phir minimal fix.</p></div>

<div class="iv"><p class="q">"Wi-Fi kaam nahi kar raha to troubleshoot kaise karte ho?"</p><p>Strong answer: symptom define karo, use stage mein rakho (AP joined, AP serving, associated, addressed, services tak reach), show commands se controller evidence jama karo, fault ka owner object pehchano, ek minimal fix karo, aur client test se prove karo. Is module ka tag example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein test karo: AP joined, AP serving, associated, addressed, services tak reach.</li>
<li>Badalne se pehle evidence jama karo; owning object ka naam lo.</li>
<li>Ek minimal fix, phir show output aur client ping se prove.</li>
<li>SSID visible nahi ka matlab stage 1 ya 2: join, phir tags, WLAN aur policy status, phir radios check karo.</li>
<li>Proof ke baad hi save karo, aur root cause record karo.</li>
</ul></div>
`}};export{e as default};