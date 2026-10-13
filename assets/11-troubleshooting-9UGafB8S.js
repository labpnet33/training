var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and the five labs`,hi:`Troubleshooting workflow aur paanch labs`},body:{en:`
<p>A doctor does not give medicine first. She asks where it hurts, takes measurements, then treats one thing and re-measures. QoS and multicast faults are the same: the symptom ("choppy calls", "no stream") is far from the cause, so you measure first. The measuring tools of this module are the <b>QoS trace</b> (<code>wifi qos trace</code> on the client), the <b>multicast test</b> (<code>wifi mcast test GROUP</code>), and a short list of <code>show</code> commands.</p>

<h3>The workflow</h3>
<ol>
<li><b>Define the flow:</b> which client, which application, which direction is bad.</li>
<li><b>Trace it:</b> run the trace on the client. Read the Summary and the "rewritten at" line.</li>
<li><b>Read the object the trace blames:</b> WLAN (<code>show wlan name</code>), policy profile (<code>show wireless profile policy detailed</code>), policy-map or class-map, SW1 port (<code>show mls qos interface</code>), multicast (<code>show wireless multicast</code>).</li>
<li><b>Fix one thing</b> where the fault lives (shut the WLAN or policy profile first if it is one of those).</li>
<li><b>Re-run the same trace</b> to prove it. Evidence before, evidence after.</li>
</ol>
<table class="cmp"><tr><th>Symptom</th><th>First suspect</th><th>Check</th></tr>
<tr><td>Voice best effort on air, both ways</td><td>WMM disabled or untrusted controller port</td><td>show wlan name; show mls qos interface</td></tr>
<tr><td>DSCP 0 at the servers</td><td>untrusted switch port or distrust on the AP</td><td>trace "rewritten at"; show mls qos interface</td></tr>
<tr><td>Voice capped to 34 or 0</td><td>gold or silver metal</td><td>show wireless profile policy detailed</td></tr>
<tr><td>Marking policy has no effect</td><td>wrong direction or AVC monitor missing</td><td>Input/Output Policy Name; Ingress Monitor</td></tr>
<tr><td>Association refused on the voice WLAN</td><td>wmm require vs a non-WMM client</td><td>show wlan name; controller log</td></tr>
<tr><td>No multicast at all</td><td>wireless multicast off, or CAPWAP group without PIM</td><td>show wireless multicast; wifi mcast test</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting loop">
<rect x="20" y="50" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="13">1 define</text>
<rect x="150" y="50" width="100" height="50" rx="8" fill="#bae6fd"/><text x="200" y="80" text-anchor="middle" class="svg-ink" font-size="13">2 trace</text>
<rect x="280" y="50" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="80" text-anchor="middle" class="svg-ink" font-size="13">3 read object</text>
<rect x="420" y="50" width="90" height="50" rx="8" fill="#fde68a"/><text x="465" y="80" text-anchor="middle" class="svg-ink" font-size="13">4 fix</text>
<rect x="540" y="50" width="80" height="50" rx="8" fill="#fed7aa"/><text x="580" y="80" text-anchor="middle" class="svg-ink" font-size="13">5 prove</text>
<line x1="120" y1="75" x2="150" y2="75" stroke="#64748b" stroke-width="2"/><line x1="250" y1="75" x2="280" y2="75" stroke="#64748b" stroke-width="2"/><line x1="390" y1="75" x2="420" y2="75" stroke="#64748b" stroke-width="2"/><line x1="510" y1="75" x2="540" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">If the proof still fails, go back to step 2: the trace now blames the next hop.</text>
</svg><p class="cap">Measure, blame one object, fix one thing, prove with the same measurement.</p></div>

<h3>Lab 1: wl-qos-voice-build (config)</h3>
<p>Nothing is built yet. Four tasks:</p>
<pre class="code">wlan NK-VOICE 4 NK-VOICE
 no security wpa akm dot1x
 security wpa akm psk
 security wpa psk set-key ascii 0 NkVoice2024
 wmm require
 no shutdown
 exit
wireless profile policy PP-VOICE
 vlan 30
 service-policy input platinum-up
 service-policy output platinum
 no shutdown
 exit
<span class="c">! map NK-VOICE to PP-VOICE in policy tag PT-CAMPUS, then tag the APs</span>
ap name AP1 policy-tag PT-CAMPUS
ap name AP2 policy-tag PT-CAMPUS
<span class="c">! on SW1</span>
mls qos
interface GigabitEthernet0/1
 mls qos trust dscp
interface GigabitEthernet0/2
 mls qos trust dscp
interface GigabitEthernet0/3
 mls qos trust dscp</pre>
<p>Prove with <code>wifi status</code> and <code>wifi qos trace</code> on PHONE1: AC_VO on air and DSCP 46 kept both ways. Web UI for the controller part: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>, <b>Policy</b>, <b>QoS</b>, <b>Tags</b>. SW1 has no web UI.</p>

<h3>Lab 2: wl-qos-uplink-lost (troubleshoot)</h3>
<p>Every voice packet reaches the servers as DSCP 0. WLC1 is right. Run <code>wifi qos trace</code> on PHONE1; the verdict says the marking is lost and names the rewrite point. Then:</p>
<pre class="out">SW1# show mls qos interface GigabitEthernet0/1
GigabitEthernet0/1
<span class="hl">trust state: not trusted</span>
...</pre>
<pre class="code">interface GigabitEthernet0/1
 mls qos trust dscp</pre>
<p>Repair only that port and re-run the trace.</p>

<h3>Lab 3: wl-qos-wmm-off (troubleshoot)</h3>
<p>The WLAN has <code>wmm disabled</code> and the policy profile has silver-up and silver. Evidence: <code>show wlan name NK-VOICE</code> and <code>show wireless profile policy detailed PP-VOICE</code>. Two fixes, each shut first:</p>
<pre class="code">wlan NK-VOICE
 shutdown
 wmm allowed
 no shutdown
 exit
wireless profile policy PP-VOICE
 shutdown
 service-policy input platinum-up
 service-policy output platinum
 no shutdown
 exit</pre>
<p>Then reconnect the phone (<code>wifi connect NK-VOICE psk NkVoice2024</code>) and trace. Reconnect is needed because WMM is decided at association. Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b>, WMM tab and Policy profile QoS.</p>

<h3>Lab 4: wl-qos-direction (troubleshoot)</h3>
<p>The softphone on LAPTOP1 (NK-STAFF, VLAN 20) marks DSCP 0. VOICE-MARK is attached as output and the AVC input monitor is missing. Evidence: <code>show policy-map VOICE-MARK</code> and <code>show wireless profile policy detailed PP-STAFF</code>. Fix:</p>
<pre class="code">wireless profile policy PP-STAFF
 shutdown
 no service-policy output VOICE-MARK
 service-policy input VOICE-MARK
 ipv4 flow monitor wireless-avc-basic input
 no shutdown
 exit</pre>
<p>Reconnect LAPTOP1 and trace: the upstream result is DSCP 46 at the wire. On air the laptop still uses best effort because the controller marks after the AP; this is expected, and the lab check looks at the wired marking.</p>

<h3>Lab 5: wl-qos-mcast (troubleshoot)</h3>
<p>Group 239.10.10.10; both laptops joined; nobody receives. Evidence: <code>show wireless multicast</code> (Multicast: Disabled, CAPWAP mode Multicast with 239.1.1.1) and <code>wifi mcast test 239.10.10.10</code> on LAPTOP1, whose result names wireless multicast. Fix:</p>
<pre class="code">wireless multicast
no ap capwap multicast</pre>
<p>Then test on LAPTOP1 and LAPTOP2. The alternative fix is to give R1 multicast routing and PIM on both the controller-facing and AP-facing interfaces.</p>

<div class="eg"><p><b>Worked example.</b> In lab 2 the trace summary says "upstream on wire: DSCP 0 (marking NOT kept, expected 46)" and "rewritten at SW1 GigabitEthernet0/1". You do not need to touch NK-VOICE, PP-VOICE or the APs. One command on one port fixes both directions, and the second trace shows "marking survives end to end".</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Changing several things at once, so you cannot tell which fixed it.</li>
<li>Testing before the client reconnects when WMM or the policy profile changed.</li>
<li>Reading the lab trace as a throughput measurement: it is a marking trace only.</li>
<li>Forgetting that a shut policy profile or WLAN must be enabled again.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> a ticket that says "voice is choppy" may be a design or capacity fault (CAC, overlap) that no marking fix removes. Say what the trace proves and what it cannot show: queueing, contention and CAC are concept only here.</p></div>

<div class="scn"><h4>One ticket, three suspects</h4><p>A hospital says phones are choppy. The engineer does not guess. The trace shows AC_BE on air and DSCP 46 kept on the wire: the radio side is wrong, not the switch. <code>show wlan name</code> shows WMM disabled. After the WMM fix and a reconnect, the trace shows AC_VO. Had the trace shown DSCP 0 on the wire, the first look would have been SW1.</p><p><b>Lesson:</b> the trace picks the suspect for you.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting a wireless QoS complaint."</p><p>Define the flow, trace the marking hop by hop, read the exact object the trace blames (WLAN WMM, policy profile policies and monitor, switch trust), fix one thing, reconnect, and re-trace as proof. Mention that multicast uses the same discipline with a stream test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Measure with the trace before touching configuration.</li>
<li>The trace names the rewrite point; read only that object.</li>
<li>WLAN and policy profile are shut for edits and enabled after.</li>
<li>Reconnect the client to prove WMM and policy changes.</li>
<li>Prove every fix with the same test that showed the fault.</li>
</ul></div>
`,hi:`
<p>Doctor pehle dawai nahi deti. Woh poochti hai kahan dard hai, measurements leti hai, phir ek cheez treat karti hai aur dobara measure karti hai. QoS aur multicast faults bhi aise hi hain: symptom ("choppy calls", "stream nahi") cause se door hota hai, isliye pehle measure karte hain. Is module ke measuring tools hain <b>QoS trace</b> (client par <code>wifi qos trace</code>), <b>multicast test</b> (<code>wifi mcast test GROUP</code>), aur <code>show</code> commands ki chhoti list.</p>

<h3>Workflow</h3>
<ol>
<li><b>Flow define karo:</b> kaun sa client, kaun si application, kaun si direction kharab hai.</li>
<li><b>Trace karo:</b> client par trace chalao. Summary aur "rewritten at" line padho.</li>
<li><b>Jis object ko trace blame kare use padho:</b> WLAN (<code>show wlan name</code>), policy profile (<code>show wireless profile policy detailed</code>), policy-map ya class-map, SW1 port (<code>show mls qos interface</code>), multicast (<code>show wireless multicast</code>).</li>
<li><b>Ek cheez fix karo</b> wahan jahan fault rehta hai (agar WLAN ya policy profile ho to pehle shut karo).</li>
<li><b>Wahi trace dobara chalao</b> prove karne ke liye. Pehle ka evidence, baad ka evidence.</li>
</ol>
<table class="cmp"><tr><th>Symptom</th><th>Pehla suspect</th><th>Check</th></tr>
<tr><td>Air par voice best effort, dono taraf</td><td>WMM disabled ya untrusted controller port</td><td>show wlan name; show mls qos interface</td></tr>
<tr><td>Servers par DSCP 0</td><td>untrusted switch port ya AP par distrust</td><td>trace "rewritten at"; show mls qos interface</td></tr>
<tr><td>Voice 34 ya 0 tak cap</td><td>gold ya silver metal</td><td>show wireless profile policy detailed</td></tr>
<tr><td>Marking policy ka asar nahi</td><td>galat direction ya AVC monitor missing</td><td>Input/Output Policy Name; Ingress Monitor</td></tr>
<tr><td>Voice WLAN par association refuse</td><td>wmm require vs non-WMM client</td><td>show wlan name; controller log</td></tr>
<tr><td>Multicast bilkul nahi</td><td>wireless multicast off, ya CAPWAP group bina PIM</td><td>show wireless multicast; wifi mcast test</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting loop">
<rect x="20" y="50" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="13">1 define</text>
<rect x="150" y="50" width="100" height="50" rx="8" fill="#bae6fd"/><text x="200" y="80" text-anchor="middle" class="svg-ink" font-size="13">2 trace</text>
<rect x="280" y="50" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="335" y="80" text-anchor="middle" class="svg-ink" font-size="13">3 object padho</text>
<rect x="420" y="50" width="90" height="50" rx="8" fill="#fde68a"/><text x="465" y="80" text-anchor="middle" class="svg-ink" font-size="13">4 fix</text>
<rect x="540" y="50" width="80" height="50" rx="8" fill="#fed7aa"/><text x="580" y="80" text-anchor="middle" class="svg-ink" font-size="13">5 prove</text>
<line x1="120" y1="75" x2="150" y2="75" stroke="#64748b" stroke-width="2"/><line x1="250" y1="75" x2="280" y2="75" stroke="#64748b" stroke-width="2"/><line x1="390" y1="75" x2="420" y2="75" stroke="#64748b" stroke-width="2"/><line x1="510" y1="75" x2="540" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Proof phir bhi fail ho to step 2 par wapas: trace ab agle hop ko blame karta hai.</text>
</svg><p class="cap">Measure karo, ek object blame karo, ek cheez fix karo, usi measurement se prove karo.</p></div>

<h3>Lab 1: wl-qos-voice-build (config)</h3>
<p>Abhi kuch bana nahi hai. Chaar tasks:</p>
<pre class="code">wlan NK-VOICE 4 NK-VOICE
 no security wpa akm dot1x
 security wpa akm psk
 security wpa psk set-key ascii 0 NkVoice2024
 wmm require
 no shutdown
 exit
wireless profile policy PP-VOICE
 vlan 30
 service-policy input platinum-up
 service-policy output platinum
 no shutdown
 exit
<span class="c">! NK-VOICE ko PP-VOICE se policy tag PT-CAMPUS mein map karo, phir APs tag karo</span>
ap name AP1 policy-tag PT-CAMPUS
ap name AP2 policy-tag PT-CAMPUS
<span class="c">! SW1 par</span>
mls qos
interface GigabitEthernet0/1
 mls qos trust dscp
interface GigabitEthernet0/2
 mls qos trust dscp
interface GigabitEthernet0/3
 mls qos trust dscp</pre>
<p>PHONE1 par <code>wifi status</code> aur <code>wifi qos trace</code> se prove karo: air par AC_VO aur dono taraf DSCP 46 kept. Controller hisse ka web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>, <b>Policy</b>, <b>QoS</b>, <b>Tags</b>. SW1 ka web UI nahi hai.</p>

<h3>Lab 2: wl-qos-uplink-lost (troubleshoot)</h3>
<p>Har voice packet servers par DSCP 0 ban kar pahunchta hai. WLC1 sahi hai. PHONE1 par <code>wifi qos trace</code> chalao; verdict batata hai ki marking lost hai aur rewrite point ka naam deta hai. Phir:</p>
<pre class="out">SW1# show mls qos interface GigabitEthernet0/1
GigabitEthernet0/1
<span class="hl">trust state: not trusted</span>
...</pre>
<pre class="code">interface GigabitEthernet0/1
 mls qos trust dscp</pre>
<p>Sirf wahi port repair karo aur trace dobara chalao.</p>

<h3>Lab 3: wl-qos-wmm-off (troubleshoot)</h3>
<p>WLAN par <code>wmm disabled</code> hai aur policy profile mein silver-up aur silver hain. Evidence: <code>show wlan name NK-VOICE</code> aur <code>show wireless profile policy detailed PP-VOICE</code>. Do fixes, har ek pehle shut karke:</p>
<pre class="code">wlan NK-VOICE
 shutdown
 wmm allowed
 no shutdown
 exit
wireless profile policy PP-VOICE
 shutdown
 service-policy input platinum-up
 service-policy output platinum
 no shutdown
 exit</pre>
<p>Phir phone reconnect karo (<code>wifi connect NK-VOICE psk NkVoice2024</code>) aur trace karo. Reconnect isliye chahiye kyunki WMM association par tay hota hai. Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b>, WMM tab aur Policy profile QoS.</p>

<h3>Lab 4: wl-qos-direction (troubleshoot)</h3>
<p>LAPTOP1 (NK-STAFF, VLAN 20) ka softphone DSCP 0 mark karta hai. VOICE-MARK output attach hai aur AVC input monitor missing hai. Evidence: <code>show policy-map VOICE-MARK</code> aur <code>show wireless profile policy detailed PP-STAFF</code>. Fix:</p>
<pre class="code">wireless profile policy PP-STAFF
 shutdown
 no service-policy output VOICE-MARK
 service-policy input VOICE-MARK
 ipv4 flow monitor wireless-avc-basic input
 no shutdown
 exit</pre>
<p>LAPTOP1 reconnect karo aur trace karo: upstream result wire par DSCP 46 hai. Air par laptop phir bhi best effort use karta hai kyunki controller AP ke baad mark karta hai; yeh expected hai, aur lab check wired marking dekhta hai.</p>

<h3>Lab 5: wl-qos-mcast (troubleshoot)</h3>
<p>Group 239.10.10.10; dono laptops ne join kiya; kisi ko kuch nahi milta. Evidence: <code>show wireless multicast</code> (Multicast: Disabled, CAPWAP mode Multicast with 239.1.1.1) aur LAPTOP1 par <code>wifi mcast test 239.10.10.10</code>, jiska result wireless multicast ka naam leta hai. Fix:</p>
<pre class="code">wireless multicast
no ap capwap multicast</pre>
<p>Phir LAPTOP1 aur LAPTOP2 par test karo. Alternative fix R1 ko controller-facing aur AP-facing dono interfaces par multicast routing aur PIM dena hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab 2 mein trace summary kehti hai "upstream on wire: DSCP 0 (marking NOT kept, expected 46)" aur "rewritten at SW1 GigabitEthernet0/1". Aapko NK-VOICE, PP-VOICE ya APs ko chhoone ki zaroorat nahi. Ek port par ek command dono directions fix karta hai, aur doosra trace "marking survives end to end" dikhata hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Kai cheezein ek saath badalna, taaki pata na chale kisne fix kiya.</li>
<li>WMM ya policy profile badalne par client reconnect hone se pehle test karna.</li>
<li>Lab trace ko throughput measurement samajhna: yeh sirf marking trace hai.</li>
<li>Yeh bhoolna ki shut kiye gaye policy profile ya WLAN ko dobara enable karna padta hai.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> "voice choppy hai" wala ticket design ya capacity fault (CAC, overlap) ho sakta hai jise koi marking fix nahi hata sakta. Batao ki trace kya prove karta hai aur kya nahi dikha sakta: queueing, contention aur CAC yahan concept only hain.</p></div>

<div class="scn"><h4>Ek ticket, teen suspects</h4><p>Ek hospital kehta hai phones choppy hain. Engineer andaza nahi lagata. Trace air par AC_BE aur wire par DSCP 46 kept dikhata hai: radio side galat hai, switch nahi. <code>show wlan name</code> mein WMM disabled dikhta hai. WMM fix aur reconnect ke baad trace AC_VO dikhata hai. Agar trace wire par DSCP 0 dikhata, to pehli nazar SW1 par jaati.</p><p><b>Lesson:</b> trace aapke liye suspect chun leta hai.</p></div>

<div class="iv"><p class="q">"Wireless QoS complaint troubleshoot karne ka tareeka batao."</p><p>Flow define karo, marking ko hop by hop trace karo, jis exact object ko trace blame kare use padho (WLAN WMM, policy profile ki policies aur monitor, switch trust), ek cheez fix karo, reconnect karo, aur re-trace se prove karo. Batao ki multicast bhi isi discipline se stream test ke saath chalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration chhoone se pehle trace se measure karo.</li>
<li>Trace rewrite point ka naam deta hai; sirf wahi object padho.</li>
<li>WLAN aur policy profile edits ke liye shut hote hain aur baad mein enable.</li>
<li>WMM aur policy changes prove karne ke liye client reconnect karo.</li>
<li>Har fix ko usi test se prove karo jisne fault dikhaya tha.</li>
</ul></div>
`}};export{e as default};