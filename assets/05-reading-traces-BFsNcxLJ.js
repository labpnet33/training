var e={id:`reading-traces`,h:{en:`Reading a trace: client states, levels and failure reasons`,hi:`Trace padhna: client states, levels aur failure reasons`},body:{en:`
<p>A trace can have hundreds of lines, and a beginner feels like reading a foreign newspaper. A journalist does not read every word first; she reads the headline, then the first paragraph. For a trace, the "headline" is the <b>level</b> (ERR, warn, note), and the "first paragraph" is the <b>client state transitions</b>. Learn these two and any trace becomes readable in under a minute.</p>

<div class="note"><p>As in chapter 1: the lab's line <b>layout</b> and module names follow the real platform, but the <b>sentences</b> are written by the model. On a real 9800 the wording differs. Read stage, level and reason the same way.</p></div>

<h3>Anatomy of one line</h3>
<pre class="out"><span class="hl">2026/10/04 17:12:57.457487</span> {wncd_x_R0-0}{1}: [<span class="hl">client-orch-sm</span>] [17765]: (<span class="hl">ERR</span>): MAC: 0050.2fe9.9a01 Policy profile PP-STAFF: VLAN 20 is not in the VLAN database; client cannot be placed</pre>
<dl class="terms">
<dt>Timestamp</dt><dd>Date, time, microseconds. Use it to correlate with RADIUS server logs and captures.</dd>
<dt>{wncd_x_R0-0}{1}</dt><dd>Process and instance. <b>wncd</b> is the wireless network controller daemon: it handles client state. <b>smd</b> handles security sessions.</dd>
<dt>[client-orch-sm]</dt><dd>The module (a part of the process). Names to know: <code>client-orch-sm</code> (client orchestration state machine), <code>client-orch-state</code> (state changes), <code>dot11</code>, <code>client-auth</code>, <code>client-keymgmt</code> (key exchange), <code>dot1x</code>, <code>radius</code>, <code>aaa</code>, <code>client-iplearn</code>, <code>sisf-packet</code> (DHCP snooping on the client).</dd>
<dt>[17765]</dt><dd>Process ID. Ignore it.</dd>
<dt>(ERR)</dt><dd>Level, from noisiest to loudest: <code>debug</code>, <code>info</code>, <code>note</code>, <code>warn</code>, <code>ERR</code>.</dd>
<dt>MAC: ...</dt><dd>The client. Then the message text.</dd>
</dl>

<h3>The client state machine</h3>
<p>The controller moves every client through named states. A healthy client passes all of them; a failing client stops, then goes to delete.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Client states">
<rect x="5" y="30" width="80" height="44" rx="6" fill="#bae6fd"/><text x="45" y="50" text-anchor="middle" class="svg-ink" font-size="11">INIT</text><text x="45" y="64" text-anchor="middle" class="svg-muted" font-size="10">ASSOCIATING</text>
<rect x="100" y="30" width="95" height="44" rx="6" fill="#ddd6fe"/><text x="147" y="50" text-anchor="middle" class="svg-ink" font-size="11">L2_AUTH</text><text x="147" y="64" text-anchor="middle" class="svg-muted" font-size="10">IN_PROGRESS</text>
<rect x="210" y="30" width="100" height="44" rx="6" fill="#bbf7d0"/><text x="260" y="50" text-anchor="middle" class="svg-ink" font-size="11">MOBILITY</text><text x="260" y="64" text-anchor="middle" class="svg-muted" font-size="10">DISCOVERY</text>
<rect x="325" y="30" width="95" height="44" rx="6" fill="#fde68a"/><text x="372" y="50" text-anchor="middle" class="svg-ink" font-size="11">DPATH_PLUMB</text><text x="372" y="64" text-anchor="middle" class="svg-muted" font-size="10">IN_PROGRESS</text>
<rect x="435" y="30" width="105" height="44" rx="6" fill="#fed7aa"/><text x="487" y="50" text-anchor="middle" class="svg-ink" font-size="11">IP_LEARN</text><text x="487" y="64" text-anchor="middle" class="svg-muted" font-size="10">IN_PROGRESS</text>
<rect x="555" y="30" width="75" height="44" rx="6" fill="#86efac"/><text x="592" y="57" text-anchor="middle" class="svg-ink" font-size="12">RUN</text>
<line x1="85" y1="52" x2="100" y2="52" stroke="#64748b" stroke-width="2"/><line x1="195" y1="52" x2="210" y2="52" stroke="#64748b" stroke-width="2"/><line x1="310" y1="52" x2="325" y2="52" stroke="#64748b" stroke-width="2"/><line x1="420" y1="52" x2="435" y2="52" stroke="#64748b" stroke-width="2"/><line x1="540" y1="52" x2="555" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">any stage can end in S_CO_DELETE_IN_PROGRESS</text>
</svg><p class="cap">Prefix every name with S_CO_. The last state printed before DELETE is the failed stage.</p></div>

<h3>A healthy order, and where it breaks</h3>
<p>In the lab a healthy client shows: association received, <code>S_CO_INIT -&gt; S_CO_ASSOCIATING</code>, dot11 association success, <code>S_CO_L2_AUTH_IN_PROGRESS</code>, key management successful, policy resolved, mobility, dpath plumb, <code>S_CO_IP_LEARN_IN_PROGRESS</code>, DHCP exchange (sisf-packet lines), IP learn successful, <code>S_CO_RUN</code>. A failing client leaves through <code>S_CO_DELETE_IN_PROGRESS</code> with "Deleting the client, reason: ..." and a deauthentication line that carries the 802.11 code.</p>
<pre class="out">... (note): MAC: 0050.2fe9.9a01 Association received. BSSID 0050.56aa.1001, WLAN NK-STAFF ... AP AP1
... [client-orch-state] (note): MAC: 0050.2fe9.9a01 Client state transition: S_CO_INIT -&gt; S_CO_ASSOCIATING
... [client-orch-state] (note): MAC: 0050.2fe9.9a01 Client state transition: S_CO_ASSOCIATING -&gt; S_CO_L2_AUTH_IN_PROGRESS
... [client-keymgmt] (note): MAC: 0050.2fe9.9a01 EAP Key management successful. AKM:PSK Cipher:CCMP WPA Version: WPA2
... [client-orch-sm] (<span class="hl">ERR</span>): MAC: 0050.2fe9.9a01 Policy profile PP-STAFF has central switching disabled but AP AP1 is in local mode (no FlexConnect profile): association rejected
... [client-orch-state] (note): MAC: 0050.2fe9.9a01 Client state transition: S_CO_L2_AUTH_IN_PROGRESS -&gt; S_CO_DELETE_IN_PROGRESS
... [client-orch-sm] (note): MAC: 0050.2fe9.9a01 Deleting the client, reason: policy profile has central switching disabled ...</pre>
<p>Reading it: association passed, the PSK was right (key management successful), and the failure is in the policy placement stage. The key is irrelevant; changing the passphrase would have wasted an hour.</p>

<h3>The failure table</h3>
<p>One table covers the trace, the client detail view and the delete-reason statistics. The 802.11 numbers are real IEEE codes; the mapping from a failure to a code is a teaching choice.</p>
<table class="cmp"><tr><th>Key</th><th>Stage</th><th>Trace shows</th><th>Real cause in the lab</th></tr>
<tr><td>psk</td><td>L2 auth</td><td>EAPOL-Key M2 invalid MIC, retransmits, 4-way handshake timeout, reason 15</td><td>Wrong passphrase</td></tr>
<tr><td>sae</td><td>L2 auth</td><td>SAE confirm mismatch</td><td>Wrong key on WPA3-only WLAN</td></tr>
<tr><td>eap</td><td>L2 auth</td><td>Access-Request, Access-Reject, EAP-Failure, reason 23</td><td>Wrong user or password</td></tr>
<tr><td>radius</td><td>L2 auth</td><td>Access-Request, three retransmits, no response, RADIUS_DEAD</td><td>Wrong shared secret, address or port, server unreachable</td></tr>
<tr><td>noserver</td><td>L2 auth</td><td>No RADIUS server available for the WLAN</td><td>Missing server group or method list</td></tr>
<tr><td>security</td><td>WLAN config</td><td>No valid AKM, reason 20</td><td>WLAN has no usable security</td></tr>
<tr><td>full</td><td>Association</td><td>Client limit reached, status 17</td><td>Association limit hit</td></tr>
<tr><td>vlan</td><td>Placement</td><td>Policy VLAN not in database</td><td>VLAN missing on controller</td></tr>
<tr><td>central</td><td>Placement</td><td>Central switching disabled, AP in local mode</td><td>Policy without central switching</td></tr>
<tr><td>nopolicy</td><td>Placement</td><td>No policy mapped in policy tag</td><td>Missing WLAN-to-policy map</td></tr>
<tr><td>dhcp</td><td>IP learn</td><td>DISCOVER sent n times, no OFFER</td><td>No DHCP server path</td></tr>
<tr><td>notfound</td><td>Scan</td><td>No AP answered the probe</td><td>SSID not served (tag, policy, radio, AP not joined)</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Mixing the two RADIUS failures. <b>Access-Reject</b> means the server answered "no" (user, password, policy). <b>Timeout</b> means no answer at all (secret, address, route, server down). Different layer, different owner.</p></div>

<div class="eg"><p><b>Worked example (real codes).</b> Reason 15 is "4-way handshake timeout": the client could not prove it knows the passphrase. Reason 23 is "802.1X authentication failed". Status 17 is "AP unable to handle additional associated stations". Reason 3 is "station leaving": the client left on its own, which is normal when a user switches SSID.</p></div>

<div class="exam"><p><b>Exam trap.</b> A reason code in a deauthentication is not always the root cause. Reason 1 (unspecified) is a catch-all. Find the ERR line before the delete; that line carries the real cause.</p></div>

<div class="scn"><h4>Reason code 15 at the keynote</h4><p>At an event, 30 attendees reported a Wi-Fi password failure. The trace of one showed M2 with invalid MIC, three retransmits and reason 15. The engineer compared the event QR code with the WLAN: the QR carried last year's passphrase. Printing the correct QR fixed all 30 in minutes.</p><p><b>Lesson:</b> "invalid MIC and 4-way timeout" means a wrong PSK, not an RF problem, even though the symptom looks like flaky Wi-Fi.</p></div>

<div class="iv"><p class="q">"How do you read a Radioactive Trace?"</p><p>I look at the lines with level ERR or warn first, then the last client state before S_CO_DELETE_IN_PROGRESS to know the stage, then the delete reason and the 802.11 code. I confirm with the timestamps and then check the object that owns that stage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read level first (ERR and warn), then the state transitions.</li>
<li>The last state before DELETE is the failed stage.</li>
<li>Reject means the server said no; timeout means no answer.</li>
<li>The 802.11 codes are real; reason 1 is a vague catch-all.</li>
<li>One failure per trace makes the reading faster.</li>
</ul></div>
`,hi:`
<p>Ek trace mein sainkdon lines ho sakti hain, aur beginner ko lagta hai jaise koi videshi akhbaar padh raha ho. Journalist har shabd pehle nahi padhti; woh headline padhti hai, phir pehla paragraph. Trace ki "headline" <b>level</b> hai (ERR, warn, note), aur "pehla paragraph" <b>client state transitions</b> hain. Yeh do cheezein seekh lo to koi bhi trace ek minute se kam mein padhne layak ho jata hai.</p>

<div class="note"><p>Chapter 1 ki tarah: lab ki line <b>layout</b> aur module names real platform jaise hain, lekin <b>sentences</b> model ne likhe hain. Real 9800 par wording alag hoti hai. Stage, level aur reason ko usi tarah padho.</p></div>

<h3>Ek line ki anatomy</h3>
<pre class="out"><span class="hl">2026/10/04 17:12:57.457487</span> {wncd_x_R0-0}{1}: [<span class="hl">client-orch-sm</span>] [17765]: (<span class="hl">ERR</span>): MAC: 0050.2fe9.9a01 Policy profile PP-STAFF: VLAN 20 is not in the VLAN database; client cannot be placed</pre>
<dl class="terms">
<dt>Timestamp</dt><dd>Date, time, microseconds. RADIUS server logs aur captures se correlate karne ke liye use karo.</dd>
<dt>{wncd_x_R0-0}{1}</dt><dd>Process aur instance. <b>wncd</b> wireless network controller daemon hai: yeh client state sambhalta hai. <b>smd</b> security sessions sambhalta hai.</dd>
<dt>[client-orch-sm]</dt><dd>Module (process ka hissa). Jaanne layak naam: <code>client-orch-sm</code> (client orchestration state machine), <code>client-orch-state</code> (state changes), <code>dot11</code>, <code>client-auth</code>, <code>client-keymgmt</code> (key exchange), <code>dot1x</code>, <code>radius</code>, <code>aaa</code>, <code>client-iplearn</code>, <code>sisf-packet</code> (client par DHCP snooping).</dd>
<dt>[17765]</dt><dd>Process ID. Ignore karo.</dd>
<dt>(ERR)</dt><dd>Level, sabse noisy se sabse loud: <code>debug</code>, <code>info</code>, <code>note</code>, <code>warn</code>, <code>ERR</code>.</dd>
<dt>MAC: ...</dt><dd>Client. Phir message text.</dd>
</dl>

<h3>Client state machine</h3>
<p>Controller har client ko named states se guzarta hai. Healthy client sab pass karta hai; failing client ruk jata hai, phir delete ho jata hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Client states">
<rect x="5" y="30" width="80" height="44" rx="6" fill="#bae6fd"/><text x="45" y="50" text-anchor="middle" class="svg-ink" font-size="11">INIT</text><text x="45" y="64" text-anchor="middle" class="svg-muted" font-size="10">ASSOCIATING</text>
<rect x="100" y="30" width="95" height="44" rx="6" fill="#ddd6fe"/><text x="147" y="50" text-anchor="middle" class="svg-ink" font-size="11">L2_AUTH</text><text x="147" y="64" text-anchor="middle" class="svg-muted" font-size="10">IN_PROGRESS</text>
<rect x="210" y="30" width="100" height="44" rx="6" fill="#bbf7d0"/><text x="260" y="50" text-anchor="middle" class="svg-ink" font-size="11">MOBILITY</text><text x="260" y="64" text-anchor="middle" class="svg-muted" font-size="10">DISCOVERY</text>
<rect x="325" y="30" width="95" height="44" rx="6" fill="#fde68a"/><text x="372" y="50" text-anchor="middle" class="svg-ink" font-size="11">DPATH_PLUMB</text><text x="372" y="64" text-anchor="middle" class="svg-muted" font-size="10">IN_PROGRESS</text>
<rect x="435" y="30" width="105" height="44" rx="6" fill="#fed7aa"/><text x="487" y="50" text-anchor="middle" class="svg-ink" font-size="11">IP_LEARN</text><text x="487" y="64" text-anchor="middle" class="svg-muted" font-size="10">IN_PROGRESS</text>
<rect x="555" y="30" width="75" height="44" rx="6" fill="#86efac"/><text x="592" y="57" text-anchor="middle" class="svg-ink" font-size="12">RUN</text>
<line x1="85" y1="52" x2="100" y2="52" stroke="#64748b" stroke-width="2"/><line x1="195" y1="52" x2="210" y2="52" stroke="#64748b" stroke-width="2"/><line x1="310" y1="52" x2="325" y2="52" stroke="#64748b" stroke-width="2"/><line x1="420" y1="52" x2="435" y2="52" stroke="#64748b" stroke-width="2"/><line x1="540" y1="52" x2="555" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">koi bhi stage S_CO_DELETE_IN_PROGRESS par khatam ho sakta hai</text>
</svg><p class="cap">Har naam ke aage S_CO_ lagao. DELETE se pehle chhapa aakhri state hi failed stage hai.</p></div>

<h3>Healthy order, aur kahan toot'ta hai</h3>
<p>Lab mein healthy client yeh dikhata hai: association received, <code>S_CO_INIT -&gt; S_CO_ASSOCIATING</code>, dot11 association success, <code>S_CO_L2_AUTH_IN_PROGRESS</code>, key management successful, policy resolved, mobility, dpath plumb, <code>S_CO_IP_LEARN_IN_PROGRESS</code>, DHCP exchange (sisf-packet lines), IP learn successful, <code>S_CO_RUN</code>. Failing client <code>S_CO_DELETE_IN_PROGRESS</code> se nikalta hai "Deleting the client, reason: ..." ke saath aur ek deauthentication line jo 802.11 code carry karti hai.</p>
<pre class="out">... (note): MAC: 0050.2fe9.9a01 Association received. BSSID 0050.56aa.1001, WLAN NK-STAFF ... AP AP1
... [client-orch-state] (note): MAC: 0050.2fe9.9a01 Client state transition: S_CO_INIT -&gt; S_CO_ASSOCIATING
... [client-orch-state] (note): MAC: 0050.2fe9.9a01 Client state transition: S_CO_ASSOCIATING -&gt; S_CO_L2_AUTH_IN_PROGRESS
... [client-keymgmt] (note): MAC: 0050.2fe9.9a01 EAP Key management successful. AKM:PSK Cipher:CCMP WPA Version: WPA2
... [client-orch-sm] (<span class="hl">ERR</span>): MAC: 0050.2fe9.9a01 Policy profile PP-STAFF has central switching disabled but AP AP1 is in local mode (no FlexConnect profile): association rejected
... [client-orch-state] (note): MAC: 0050.2fe9.9a01 Client state transition: S_CO_L2_AUTH_IN_PROGRESS -&gt; S_CO_DELETE_IN_PROGRESS
... [client-orch-sm] (note): MAC: 0050.2fe9.9a01 Deleting the client, reason: policy profile has central switching disabled ...</pre>
<p>Padhna: association pass hua, PSK sahi tha (key management successful), aur failure policy placement stage mein hai. Key irrelevant hai; passphrase badalna ek ghanta waste karta.</p>

<h3>Failure table</h3>
<p>Ek table trace, client detail view aur delete-reason statistics teeno cover karti hai. 802.11 numbers real IEEE codes hain; failure se code ka mapping teaching choice hai.</p>
<table class="cmp"><tr><th>Key</th><th>Stage</th><th>Trace dikhata hai</th><th>Lab mein asli cause</th></tr>
<tr><td>psk</td><td>L2 auth</td><td>EAPOL-Key M2 invalid MIC, retransmits, 4-way handshake timeout, reason 15</td><td>Galat passphrase</td></tr>
<tr><td>sae</td><td>L2 auth</td><td>SAE confirm mismatch</td><td>WPA3-only WLAN par galat key</td></tr>
<tr><td>eap</td><td>L2 auth</td><td>Access-Request, Access-Reject, EAP-Failure, reason 23</td><td>Galat user ya password</td></tr>
<tr><td>radius</td><td>L2 auth</td><td>Access-Request, teen retransmits, no response, RADIUS_DEAD</td><td>Galat shared secret, address ya port, server unreachable</td></tr>
<tr><td>noserver</td><td>L2 auth</td><td>WLAN ke liye koi RADIUS server available nahi</td><td>Server group ya method list missing</td></tr>
<tr><td>security</td><td>WLAN config</td><td>No valid AKM, reason 20</td><td>WLAN mein usable security nahi</td></tr>
<tr><td>full</td><td>Association</td><td>Client limit reached, status 17</td><td>Association limit hit</td></tr>
<tr><td>vlan</td><td>Placement</td><td>Policy VLAN database mein nahi</td><td>Controller par VLAN missing</td></tr>
<tr><td>central</td><td>Placement</td><td>Central switching disabled, AP local mode mein</td><td>Policy mein central switching nahi</td></tr>
<tr><td>nopolicy</td><td>Placement</td><td>Policy tag mein koi policy mapped nahi</td><td>WLAN-to-policy map missing</td></tr>
<tr><td>dhcp</td><td>IP learn</td><td>DISCOVER n baar bheja, OFFER nahi</td><td>DHCP server path nahi</td></tr>
<tr><td>notfound</td><td>Scan</td><td>Kisi AP ne probe ka jawab nahi diya</td><td>SSID served nahi (tag, policy, radio, AP not joined)</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Do RADIUS failures ko mix karna. <b>Access-Reject</b> ka matlab server ne "na" bola (user, password, policy). <b>Timeout</b> ka matlab koi jawab nahi (secret, address, route, server down). Alag layer, alag owner.</p></div>

<div class="eg"><p><b>Worked example (real codes).</b> Reason 15 "4-way handshake timeout" hai: client prove nahi kar paya ki use passphrase pata hai. Reason 23 "802.1X authentication failed" hai. Status 17 "AP unable to handle additional associated stations" hai. Reason 3 "station leaving" hai: client khud gaya, jo normal hai jab user SSID badalta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Deauthentication mein reason code hamesha root cause nahi hota. Reason 1 (unspecified) catch-all hai. Delete se pehle ki ERR line dhundo; wahi asli cause carry karti hai.</p></div>

<div class="scn"><h4>Keynote par reason code 15</h4><p>Ek event mein 30 attendees ne Wi-Fi password failure report kiya. Ek ka trace M2 invalid MIC, teen retransmits aur reason 15 dikha raha tha. Engineer ne event ke QR code ko WLAN se compare kiya: QR mein pichhle saal ka passphrase tha. Sahi QR print karne se 30 ke 30 minutes mein theek ho gaye.</p><p><b>Lesson:</b> "invalid MIC aur 4-way timeout" ka matlab galat PSK hai, RF problem nahi, bhale symptom flaky Wi-Fi jaisa dikhe.</p></div>

<div class="iv"><p class="q">"Radioactive Trace kaise padhte ho?"</p><p>Pehle ERR ya warn level wali lines dekhta hoon, phir S_CO_DELETE_IN_PROGRESS se pehle ki aakhri client state se stage pata karta hoon, phir delete reason aur 802.11 code. Timestamps se confirm karta hoon aur phir us stage ko own karne wala object check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle level padho (ERR aur warn), phir state transitions.</li>
<li>DELETE se pehle ki aakhri state hi failed stage hai.</li>
<li>Reject ka matlab server ne na kaha; timeout ka matlab koi jawab nahi.</li>
<li>802.11 codes real hain; reason 1 vague catch-all hai.</li>
<li>Ek trace mein ek failure padhna tez banata hai.</li>
</ul></div>
`}};export{e as default};