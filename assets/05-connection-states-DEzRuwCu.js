var e={id:`connection-states`,h:{en:`Connection states and an ordered troubleshooting workflow`,hi:`Connection states aur troubleshooting ka ordered workflow`},body:{en:`
<p>When a call does not connect, a good receptionist does not randomly press buttons. She asks in order: is the phone plugged in, did you dial the right number, does the other side pick up, and is it the right person? The logging connection between a FortiGate and a FortiAnalyzer has the same order of questions, and each wrong answer produces its own message.</p>

<h3>The messages and what they mean</h3>
<table class="cmp"><tr><th>Message</th><th>Meaning</th><th>First thing to check</th></tr>
<tr><td>Logging is disabled</td><td><code>status</code> is disable</td><td><code>show full-configuration log fortianalyzer setting</code></td></tr>
<tr><td>Connection timeout</td><td>No answer from the server address</td><td>Server IP typed correctly, route, interface, switch</td></tr>
<tr><td>Serial number mismatch</td><td>The FortiAnalyzer serial is not in the FortiGate <code>serial</code> list</td><td>Compare serial values</td></tr>
<tr><td>Certificate verification failed</td><td><code>certificate-verification</code> is enabled without a usable <code>serial</code></td><td>Set the serial or disable verification</td></tr>
<tr><td>Connection: Allow, Registration: unregistered</td><td>The link works; FAZ-1 does not know the device</td><td>The unregistered list on FAZ-1</td></tr>
</table>
<p>In the simulator the internal states behind these messages are: disabled, off, no server, timeout, serial, cert, connected. A timeout needs the following to hold: a route to the server, a TCP/514 request that reaches the unit owning the address, and a route back. If any one fails, the FortiGate shows Connection timeout, whatever the real cause.</p>

<h3>The real output for each case</h3>
<p>Serial mismatch: the connection works but the FortiGate trusts a different serial. The queue grows because the FortiGate keeps the records and tries again.</p>
<pre class="out">MDU-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Serial number mismatch</span>
MDU-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 <span class="hl">status=disconnected: FortiAnalyzer serial number FAZ-VMEVYXM9SG00 is not in the serial list of this FortiGate (FAZ-VMEV00000000)</span> mode=udp upload=realtime data-path=-
  registration=unknown source=192.0.2.12 <span class="hl">queued=3</span> sent(t/u/e)=0/0/0 lost=0</pre>
<p>Timeout: all host fields are empty because nothing answered.</p>
<pre class="out">TRY-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: -
FortiAnalyzer Serial: -
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Connection timeout</span></pre>
<p>Certificate verification: the host is found, but verification fails.</p>
<pre class="out">TRY-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Certificate verification failed</span></pre>
<p>Notice the clue in the host fields. <b>Empty</b> host fields mean nobody answered (address, route, network). <b>Filled</b> host fields with a failed connection mean FAZ-1 answered and the problem is about identity (serial, certificate).</p>

<h3>Ordered workflow</h3>
<ol>
<li><b>Is logging on?</b> If test-connectivity says "logging is disabled", enable it. Stop there for this device.</li>
<li><b>Is the server address right?</b> Compare with 192.0.2.6. Timeout with empty host fields starts here.</li>
<li><b>Is the path open?</b> From the FortiGate, can it reach 192.0.2.6 at all? Check route, interface status and any firewall in between for TCP/514 (and UDP/514 if reliable is off).</li>
<li><b>Does identity match?</b> If the host fields are filled but Connection fails, check <code>serial</code> and <code>certificate-verification</code>.</li>
<li><b>Is the device registered?</b> Connection Allow with Registration unregistered: go to FAZ-1 and register.</li>
<li><b>Do logs actually arrive?</b> Generate traffic, then <code>diagnose log device</code>. Also check the policy logging and the filter, then miglogd 6 for lost.</li>
</ol>
<p>Work in this order and stop at the first fault. After you fix it, run the test again: a second fault often sits behind the first. This is the idea of the third lab.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting order">
<rect x="20" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">1 Logging on?</text>
<rect x="230" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">2 Server address</text>
<rect x="440" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 Path open</text>
<rect x="20" y="150" width="180" height="46" rx="8" fill="#ddd6fe"/><text x="110" y="178" text-anchor="middle" class="svg-ink" font-size="13">4 Serial, certificate</text>
<rect x="230" y="150" width="180" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">5 Registered?</text>
<rect x="440" y="150" width="180" height="46" rx="8" fill="#bbf7d0"/><text x="530" y="178" text-anchor="middle" class="svg-ink" font-size="13">6 Logs arrive</text>
<line x1="200" y1="43" x2="230" y2="43" stroke="#64748b" stroke-width="2"/><line x1="410" y1="43" x2="440" y2="43" stroke="#64748b" stroke-width="2"/><line x1="530" y1="66" x2="530" y2="108" stroke="#64748b" stroke-width="2"/><line x1="530" y1="108" x2="110" y2="108" stroke="#64748b" stroke-width="2"/><line x1="110" y1="108" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><line x1="200" y1="173" x2="230" y2="173" stroke="#64748b" stroke-width="2"/><line x1="410" y1="173" x2="440" y2="173" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">fix the first fault, then test again</text>
</svg><p class="cap">Ordered checks from the FortiGate to the stored log.</p></div>

<div class="eg"><p><b>Worked example.</b> TRY-FGT reports "Connection timeout" and empty host fields. Step 1: logging is on. Step 2: <code>show log fortianalyzer setting</code> shows server 192.0.2.16, but FAZ-1 is 192.0.2.6. Correct it. The test now says Allow with Registration unregistered. That is a new, different message: step 5, register on FAZ-1.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three settings at once, so you cannot tell which one fixed it. Debugging the FortiAnalyzer when the FortiGate has logging disabled. Reading "Serial number mismatch" as a network fault. Forgetting that a serial list can hold several serials separated by a space. Stopping when Connection says Allow.</p></div>

<div class="exam"><p><b>Exam traps.</b> Certificate verification needs a serial; without it the connection fails. Timeout versus serial mismatch: empty versus filled host fields. A mismatch queues logs on the FortiGate, whereas an unregistered device has logs discarded on FAZ-1. A missing or disabled setting is not "Connection timeout".</p></div>

<div class="scn"><h4>Fixed one fault, found the next</h4><p>A branch had a typo in the server address and, behind it, a stale serial list from an earlier FortiAnalyzer. After the address was fixed, the message changed from Connection timeout to Serial number mismatch. The engineer cleared the serial list and the next message was Allow with unregistered. Three different messages, three faults, one after another.</p><p><b>Lesson:</b> every message answers a different question; re-run the test after each fix.</p></div>

<div class="iv"><p class="q">"How do you troubleshoot a FortiGate that does not log to the FortiAnalyzer?"</p><p>I follow an order: logging enabled, server address, network path and ports, identity (serial, certificate), registration, and finally real logs with diagnose log device. I use test-connectivity and miglogd 6, change one thing at a time and re-test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each connection message points to a different layer: setting, address, path, identity, registration.</li>
<li>Empty host fields mean no answer; filled host fields mean FAZ-1 answered.</li>
<li>Serial mismatch queues logs on the FortiGate; unregistered devices have logs discarded on FAZ-1.</li>
<li>Work in order, fix one fault, test again.</li>
<li>Connection Allow is not the end: check Registration and real counters.</li>
</ul></div>
`,hi:`
<p>Call connect na ho to achhi receptionist randomly buttons nahi dabati. Wo order mein poochti hai: phone plug hai, number sahi dial kiya, doosri taraf koi utha raha hai, aur kya wo sahi insaan hai? FortiGate aur FortiAnalyzer ke beech logging connection ke sawal bhi isi order mein hain, aur har galat jawab ka apna message hota hai.</p>

<h3>Messages aur unka matlab</h3>
<table class="cmp"><tr><th>Message</th><th>Matlab</th><th>Pehle kya check karein</th></tr>
<tr><td>Logging is disabled</td><td><code>status</code> disable hai</td><td><code>show full-configuration log fortianalyzer setting</code></td></tr>
<tr><td>Connection timeout</td><td>Server address se jawab nahi</td><td>Server IP sahi type hua, route, interface, switch</td></tr>
<tr><td>Serial number mismatch</td><td>FortiAnalyzer ka serial FortiGate ki <code>serial</code> list mein nahi</td><td>Serial values compare karo</td></tr>
<tr><td>Certificate verification failed</td><td><code>certificate-verification</code> enable hai par kaam ka <code>serial</code> nahi</td><td>Serial set karo ya verification disable karo</td></tr>
<tr><td>Connection: Allow, Registration: unregistered</td><td>Link chal raha hai; FAZ-1 device ko nahi jaanta</td><td>FAZ-1 par unregistered list</td></tr>
</table>
<p>Simulator mein in messages ke peeche internal states hain: disabled, off, no server, timeout, serial, cert, connected. Timeout ke liye ye sab sach hona chahiye: server tak route, TCP/514 request jo address ke malik unit tak pahunche, aur wapsi ka route. Inmein se koi ek fail ho to FortiGate Connection timeout dikhata hai, asli wajah kuch bhi ho.</p>

<h3>Har case ka real output</h3>
<p>Serial mismatch: connection chalta hai par FortiGate kisi doosre serial par bharosa karta hai. Queue badhti hai kyunki FortiGate records rakhta hai aur dobara koshish karta hai.</p>
<pre class="out">MDU-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Serial number mismatch</span>
MDU-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 <span class="hl">status=disconnected: FortiAnalyzer serial number FAZ-VMEVYXM9SG00 is not in the serial list of this FortiGate (FAZ-VMEV00000000)</span> mode=udp upload=realtime data-path=-
  registration=unknown source=192.0.2.12 <span class="hl">queued=3</span> sent(t/u/e)=0/0/0 lost=0</pre>
<p>Timeout: saare host fields khaali hain kyunki kisi ne jawab nahi diya.</p>
<pre class="out">TRY-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: -
FortiAnalyzer Serial: -
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Connection timeout</span></pre>
<p>Certificate verification: host mil jata hai, par verification fail hota hai.</p>
<pre class="out">TRY-FGT # execute log fortianalyzer test-connectivity
FortiAnalyzer Host Name: FAZ-1
FortiAnalyzer Serial: FAZ-VMEVYXM9SG00
FortiAnalyzer Registration: unknown
<span class="hl">Connection: Certificate verification failed</span></pre>
<p>Host fields mein clue dekho. <b>Khaali</b> host fields matlab kisi ne jawab nahi diya (address, route, network). <b>Bhare hue</b> host fields ke saath failed connection matlab FAZ-1 ne jawab diya aur problem identity ki hai (serial, certificate).</p>

<h3>Ordered workflow</h3>
<ol>
<li><b>Logging on hai?</b> test-connectivity "logging is disabled" kahe to enable karo. Is device ke liye wahin ruko.</li>
<li><b>Server address sahi hai?</b> 192.0.2.6 se compare karo. Khaali host fields ke saath timeout yahin se shuru hota hai.</li>
<li><b>Path khula hai?</b> FortiGate se 192.0.2.6 tak pahunch sakte ho? Route, interface status aur beech ka koi firewall TCP/514 ke liye (aur reliable off ho to UDP/514 ke liye) check karo.</li>
<li><b>Identity match karti hai?</b> Host fields bhare hain par Connection fail hai to <code>serial</code> aur <code>certificate-verification</code> check karo.</li>
<li><b>Device registered hai?</b> Connection Allow aur Registration unregistered: FAZ-1 par jaakar register karo.</li>
<li><b>Logs sach mein aa rahe hain?</b> Traffic generate karo, phir <code>diagnose log device</code>. Policy logging aur filter bhi check karo, phir lost ke liye miglogd 6.</li>
</ol>
<p>Is order mein kaam karo aur pehli fault par ruko. Fix ke baad test dobara chalao: doosri fault aksar pehli ke peeche chhupi hoti hai. Teesre lab ka yahi idea hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Troubleshooting ka order">
<rect x="20" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="110" y="48" text-anchor="middle" class="svg-ink" font-size="13">1 Logging on?</text>
<rect x="230" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">2 Server address</text>
<rect x="440" y="20" width="180" height="46" rx="8" fill="#bae6fd"/><text x="530" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 Path khula</text>
<rect x="20" y="150" width="180" height="46" rx="8" fill="#ddd6fe"/><text x="110" y="178" text-anchor="middle" class="svg-ink" font-size="13">4 Serial, certificate</text>
<rect x="230" y="150" width="180" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">5 Registered?</text>
<rect x="440" y="150" width="180" height="46" rx="8" fill="#bbf7d0"/><text x="530" y="178" text-anchor="middle" class="svg-ink" font-size="13">6 Logs aate hain</text>
<line x1="200" y1="43" x2="230" y2="43" stroke="#64748b" stroke-width="2"/><line x1="410" y1="43" x2="440" y2="43" stroke="#64748b" stroke-width="2"/><line x1="530" y1="66" x2="530" y2="108" stroke="#64748b" stroke-width="2"/><line x1="530" y1="108" x2="110" y2="108" stroke="#64748b" stroke-width="2"/><line x1="110" y1="108" x2="110" y2="150" stroke="#64748b" stroke-width="2"/><line x1="200" y1="173" x2="230" y2="173" stroke="#64748b" stroke-width="2"/><line x1="410" y1="173" x2="440" y2="173" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">pehli fault fix karo, phir dobara test</text>
</svg><p class="cap">FortiGate se stored log tak ordered checks.</p></div>

<div class="eg"><p><b>Worked example.</b> TRY-FGT "Connection timeout" aur khaali host fields report karta hai. Step 1: logging on hai. Step 2: <code>show log fortianalyzer setting</code> mein server 192.0.2.16 hai, jabki FAZ-1 192.0.2.6 hai. Sahi karo. Test ab Allow aur Registration unregistered kehta hai. Ye naya, alag message hai: step 5, FAZ-1 par register karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath teen settings badalna, phir pata nahi chalta kisne fix kiya. FortiGate par logging disabled ho aur FortiAnalyzer debug karna. "Serial number mismatch" ko network fault padhna. Ye bhool jana ki serial list mein space se alag kai serials ho sakte hain. Connection Allow dekhkar ruk jana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Certificate verification ko serial chahiye; uske bina connection fail hota hai. Timeout versus serial mismatch: khaali versus bhare host fields. Mismatch FortiGate par logs queue karta hai, jabki unregistered device ke logs FAZ-1 par discard hote hain. Missing ya disabled setting "Connection timeout" nahi hai.</p></div>

<div class="scn"><h4>Ek fault fix ki, agli mil gayi</h4><p>Ek branch mein server address mein typo tha, aur uske peeche pichhle FortiAnalyzer ki purani serial list. Address fix hone ke baad message Connection timeout se Serial number mismatch ho gaya. Engineer ne serial list saaf ki aur agla message Allow with unregistered tha. Teen alag messages, teen faults, ek ke baad ek.</p><p><b>Lesson:</b> har message alag sawal ka jawab hai; har fix ke baad test dobara chalao.</p></div>

<div class="iv"><p class="q">"Jo FortiGate FortiAnalyzer ko log nahi bhej raha, uska troubleshooting kaise karte ho?"</p><p>Main order follow karta hoon: logging enabled, server address, network path aur ports, identity (serial, certificate), registration, aur aakhir mein diagnose log device se real logs. test-connectivity aur miglogd 6 use karta hoon, ek baar mein ek cheez badalta hoon aur dobara test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har connection message alag layer batata hai: setting, address, path, identity, registration.</li>
<li>Khaali host fields matlab jawab nahi; bhare host fields matlab FAZ-1 ne jawab diya.</li>
<li>Serial mismatch FortiGate par logs queue karta hai; unregistered devices ke logs FAZ-1 par discard hote hain.</li>
<li>Order mein kaam karo, ek fault fix karo, phir test karo.</li>
<li>Connection Allow antim nahi: Registration aur real counters check karo.</li>
</ul></div>
`}};export{e as default};