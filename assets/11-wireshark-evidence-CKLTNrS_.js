var e={id:`wireshark-evidence`,h:{en:`Wireshark on 802.11 and CAPWAP, show tech, and the evidence-pack lab`,hi:`802.11 aur CAPWAP par Wireshark, show tech aur evidence-pack lab`},body:{en:`
<p>Wireshark is the microscope of networking. A trace tells you the controller's story; Wireshark lets you read the actual frames. On Wi-Fi it opens three windows: the <b>air</b> (802.11 frames between client and AP), the <b>tunnel</b> (CAPWAP between AP and controller) and the <b>wire</b> (DHCP, RADIUS, DNS beyond the controller). Wireshark itself, real monitor-mode captures and hex dumps are <b>concept only</b> in this module; the lab gives you the controller capture of chapter 6 and the exported file name. Learn where to capture and what to look for so you can do it on a real network.</p>

<h3>Where to capture</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Capture points">
<rect x="10" y="50" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="55" y="78" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="150" y="50" width="70" height="46" rx="8" fill="#bae6fd"/><text x="185" y="78" text-anchor="middle" class="svg-ink" font-size="13">AP</text>
<rect x="270" y="50" width="70" height="46" rx="8" fill="#e2e8f0"/><text x="305" y="78" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="390" y="50" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="435" y="78" text-anchor="middle" class="svg-ink" font-size="13">WLC</text>
<rect x="530" y="50" width="90" height="46" rx="8" fill="#fde68a"/><text x="575" y="78" text-anchor="middle" class="svg-ink" font-size="13">Servers</text>
<line x1="100" y1="73" x2="150" y2="73" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="220" y1="73" x2="270" y2="73" stroke="#64748b" stroke-width="2"/><line x1="340" y1="73" x2="390" y2="73" stroke="#64748b" stroke-width="2"/><line x1="480" y1="73" x2="530" y2="73" stroke="#64748b" stroke-width="2"/>
<text x="125" y="130" text-anchor="middle" class="svg-accent" font-size="12">A: air sniffer</text>
<text x="305" y="130" text-anchor="middle" class="svg-accent" font-size="12">B: SPAN port</text>
<text x="435" y="130" text-anchor="middle" class="svg-accent" font-size="12">C: EPC on WLC</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">A sees 802.11 frames; B and C see CAPWAP and the client VLAN traffic.</text>
</svg><p class="cap">Three capture points answer three different questions.</p></div>
<ul>
<li><b>A: air sniffer.</b> A laptop or AP in monitor (sniffer) mode locked to the client's channel. Shows association, authentication and the EAPOL handshake, retries and signal. Needs the right channel and width.</li>
<li><b>B: switch SPAN port.</b> Mirror the AP or controller port to a laptop running Wireshark. Shows CAPWAP and, for central switching, the traffic between controller and network.</li>
<li><b>C: controller EPC.</b> Chapter 6. Easiest; no extra gear. Shows what reaches the controller port or control plane.</li>
</ul>

<h3>What CAPWAP looks like</h3>
<dl class="terms">
<dt>CAPWAP control</dt><dd>UDP 5246 between AP and controller: discovery, join, configuration, echo. After the discovery messages, control is encrypted with <b>DTLS</b>, so you see a handshake and then opaque Application Data. This is why a capture cannot tell you why a join failed; the join statistics and AP console can.</dd>
<dt>CAPWAP data</dt><dd>UDP 5247. In local mode with central switching, each client frame is wrapped and tunnelled to the controller. DTLS on data is optional. Wireshark can decode unencrypted CAPWAP data and show the client frame inside.</dd>
<dt>Keep-alive and echo</dt><dd>The data keep-alive and the control echo (about every 30 s in the lab capture) show the tunnel is healthy. Missing echoes precede an AP dropping off.</dd>
</dl>

<h3>Useful Wireshark display filters (concept)</h3>
<pre class="code">wlan.addr == 00:50:2f:e9:9a:01        <span class="c">! all frames of one client (radio capture)</span>
wlan.fc.type_subtype == 0x0b          <span class="c">! authentication frames</span>
wlan.fc.type_subtype == 0x00 || wlan.fc.type_subtype == 0x01   <span class="c">! association request and response</span>
wlan.fc.type_subtype == 0x0c          <span class="c">! deauthentication</span>
eapol                                 <span class="c">! the 4-way handshake: expect M1 to M4</span>
wlan.fixed.reason_code                <span class="c">! shows the reason number in deauth or disassoc</span>
udp.port == 5246 || udp.port == 5247  <span class="c">! CAPWAP control and data</span>
radius                                <span class="c">! Access-Request, Accept, Reject</span>
bootp                                 <span class="c">! DHCP Discover, Offer, Request, ACK</span></pre>
<div class="eg"><p><b>Worked example.</b> A client fails with reason 15. In an air capture you filter <code>eapol</code> and see M1 from the AP, M2 from the client, M1 again (retransmit), M2, M1, then a deauthentication with reason code 15. M3 never appears because the AP rejected M2: the passphrase was wrong. This confirms what the trace said, without trusting either tool alone. Wireshark can even verify the key if you give it the passphrase and the captured handshake (concept).</p></div>

<h3>show tech and escalation (concept only)</h3>
<p>For Cisco TAC, collect <code>show tech-support wireless</code> (a large bundle of controller state), the Radioactive Trace files for the affected MACs (use <code>internal</code> when asked), the relevant packet capture and the configuration. It is not simulated in the lab. A ticket without these makes the engineer on the other side ask for them first.</p>

<h3>Lab walkthrough: wl-diag-evidence-pack</h3>
<p>This lab has no fault. You record what a <b>healthy</b> client looks like, so you can compare during an incident.</p>
<pre class="code">WLC1# debug wireless mac 0050.2fe9.9a01 internal monitor-time 300
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# no debug wireless mac 0050.2fe9.9a01
WLC1# show logging profile wireless internal filter mac 0050.2fe9.9a01 to-file LAPTOP1-GOOD.log
WLC1# dir bootflash:
WLC1# monitor capture CAP-GOOD interface GigabitEthernet1 both
WLC1# monitor capture CAP-GOOD start
LAPTOP1# wifi disconnect
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# monitor capture CAP-GOOD stop
WLC1# monitor capture CAP-GOOD export flash:CAP-GOOD.pcap
WLC1# show platform conditions
WLC1# clear platform condition all</pre>
<ol>
<li><b>Task 1</b>: trace with <code>internal</code> and <code>monitor-time 300</code>, connect, stop. A file <code>ra_trace_MAC_...log</code> appears in bootflash.</li>
<li><b>Task 2</b>: save with <code>to-file LAPTOP1-GOOD.log</code> and list <code>dir bootflash:</code>.</li>
<li><b>Task 3</b>: capture CAP-GOOD with a full DHCP exchange (Discover, Offer, Request, ACK) and export to <code>flash:CAP-GOOD.pcap</code> (the lab file is a text summary).</li>
<li><b>Task 4</b>: <code>show platform conditions</code>, then <code>clear platform condition all</code>.</li>
</ol>
<p>GUI: <b>Troubleshooting &gt; Radioactive Trace</b> (Generate and download) and <b>Troubleshooting &gt; Packet Capture</b>.</p>

<h3>What goes in an evidence pack</h3>
<ul>
<li>Ticket text, time, scope and the controller clock.</li>
<li>Known-good trace and capture (this lab) and the failing ones, with names such as <code>LAPTOP1-before-fix.log</code>.</li>
<li>The ERR line, the failing stage, the object changed and the config before and after.</li>
<li>The proof of repair: second trace and capture, client status, ping.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Exporting a capture that holds user data and e-mailing it widely. Captures can contain credentials and personal traffic. Filter to what you need and share only with those who need it.</p></div>
<div class="exam"><p><b>Exam trap.</b> You cannot read DTLS-encrypted CAPWAP control in a capture without the keys. And a client capture on the wire cannot show 802.11 management frames; for those you need a radio (monitor mode) capture.</p></div>

<div class="scn"><h4>Known-good saved the day</h4><p>After an upgrade, a department reported slow log-ins. The engineer compared the new trace with the saved LAPTOP1-GOOD.log: the healthy trace spent two seconds between key management and IP learn; the new one spent fourteen, with a DNS-related RADIUS delay visible in timestamps. The server team found a slow directory lookup.</p><p><b>Lesson:</b> a baseline turns "it feels slow" into a measured difference.</p></div>

<div class="iv"><p class="q">"Where would you capture to debug a client that fails the 4-way handshake?"</p><p>An air capture in monitor mode on the client's channel, filtered on the client MAC and <code>eapol</code>, to see M1 to M4 and the deauthentication reason. The controller trace gives the same story from the inside. A wired or controller capture cannot show the radio frames.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three capture points: air sniffer, switch SPAN port, controller EPC.</li>
<li>CAPWAP control is UDP 5246 and DTLS-encrypted; data is UDP 5247.</li>
<li>Know the filters: eapol, wlan.addr, reason codes, radius, bootp.</li>
<li>show tech, Wireshark and hex dumps are concept only in the lab.</li>
<li>Record a known-good baseline before an incident.</li>
</ul></div>
`,hi:`
<p>Wireshark networking ka microscope hai. Trace controller ki kahani batata hai; Wireshark aapko asli frames padhne deta hai. Wi-Fi par yeh teen khidkiyan kholta hai: <b>hawa</b> (client aur AP ke beech 802.11 frames), <b>tunnel</b> (AP aur controller ke beech CAPWAP) aur <b>wire</b> (controller ke aage DHCP, RADIUS, DNS). Wireshark khud, real monitor-mode captures aur hex dumps is module mein <b>concept only</b> hain; lab aapko chapter 6 ka controller capture aur exported file naam deta hai. Seekho kahan capture karna hai aur kya dekhna hai taaki real network par kar sako.</p>

<h3>Kahan capture karein</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Capture points">
<rect x="10" y="50" width="90" height="46" rx="8" fill="#bbf7d0"/><text x="55" y="78" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="150" y="50" width="70" height="46" rx="8" fill="#bae6fd"/><text x="185" y="78" text-anchor="middle" class="svg-ink" font-size="13">AP</text>
<rect x="270" y="50" width="70" height="46" rx="8" fill="#e2e8f0"/><text x="305" y="78" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="390" y="50" width="90" height="46" rx="8" fill="#ddd6fe"/><text x="435" y="78" text-anchor="middle" class="svg-ink" font-size="13">WLC</text>
<rect x="530" y="50" width="90" height="46" rx="8" fill="#fde68a"/><text x="575" y="78" text-anchor="middle" class="svg-ink" font-size="13">Servers</text>
<line x1="100" y1="73" x2="150" y2="73" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="220" y1="73" x2="270" y2="73" stroke="#64748b" stroke-width="2"/><line x1="340" y1="73" x2="390" y2="73" stroke="#64748b" stroke-width="2"/><line x1="480" y1="73" x2="530" y2="73" stroke="#64748b" stroke-width="2"/>
<text x="125" y="130" text-anchor="middle" class="svg-accent" font-size="12">A: air sniffer</text>
<text x="305" y="130" text-anchor="middle" class="svg-accent" font-size="12">B: SPAN port</text>
<text x="435" y="130" text-anchor="middle" class="svg-accent" font-size="12">C: WLC par EPC</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">A 802.11 frames dekhta hai; B aur C CAPWAP aur client VLAN traffic dekhte hain.</text>
</svg><p class="cap">Teen capture points teen alag sawaalon ka jawab dete hain.</p></div>
<ul>
<li><b>A: air sniffer.</b> Laptop ya AP monitor (sniffer) mode mein, client ke channel par locked. Association, authentication aur EAPOL handshake, retries aur signal dikhata hai. Sahi channel aur width chahiye.</li>
<li><b>B: switch SPAN port.</b> AP ya controller port ko Wireshark chalate laptop par mirror karo. CAPWAP aur, central switching ke liye, controller aur network ke beech ka traffic dikhata hai.</li>
<li><b>C: controller EPC.</b> Chapter 6. Sabse aasaan; extra gear nahi. Jo controller port ya control plane tak pahunchta hai woh dikhata hai.</li>
</ul>

<h3>CAPWAP kaisa dikhta hai</h3>
<dl class="terms">
<dt>CAPWAP control</dt><dd>AP aur controller ke beech UDP 5246: discovery, join, configuration, echo. Discovery messages ke baad control <b>DTLS</b> se encrypted hota hai, isliye aap handshake dekhte ho phir opaque Application Data. Isi wajah se capture nahi bata sakta ki join kyun fail hua; join statistics aur AP console bata sakte hain.</dd>
<dt>CAPWAP data</dt><dd>UDP 5247. Local mode mein central switching ke saath har client frame wrap hokar controller tak tunnel hota hai. Data par DTLS optional hai. Wireshark unencrypted CAPWAP data decode karke andar ka client frame dikha sakta hai.</dd>
<dt>Keep-alive aur echo</dt><dd>Data keep-alive aur control echo (lab capture mein lagbhag har 30 s) dikhate hain ki tunnel healthy hai. Echoes ka missing hona AP ke gir jaane se pehle hota hai.</dd>
</dl>

<h3>Kaam ke Wireshark display filters (concept)</h3>
<pre class="code">wlan.addr == 00:50:2f:e9:9a:01        <span class="c">! ek client ke saare frames (radio capture)</span>
wlan.fc.type_subtype == 0x0b          <span class="c">! authentication frames</span>
wlan.fc.type_subtype == 0x00 || wlan.fc.type_subtype == 0x01   <span class="c">! association request aur response</span>
wlan.fc.type_subtype == 0x0c          <span class="c">! deauthentication</span>
eapol                                 <span class="c">! 4-way handshake: M1 se M4 expect karo</span>
wlan.fixed.reason_code                <span class="c">! deauth ya disassoc mein reason number</span>
udp.port == 5246 || udp.port == 5247  <span class="c">! CAPWAP control aur data</span>
radius                                <span class="c">! Access-Request, Accept, Reject</span>
bootp                                 <span class="c">! DHCP Discover, Offer, Request, ACK</span></pre>
<div class="eg"><p><b>Worked example.</b> Client reason 15 ke saath fail hota hai. Air capture mein <code>eapol</code> filter karte ho aur AP se M1, client se M2, phir M1 (retransmit), M2, M1, phir reason code 15 ke saath deauthentication dikhta hai. M3 kabhi nahi aata kyunki AP ne M2 reject kiya: passphrase galat tha. Yeh trace ki baat confirm karta hai, kisi ek tool par bharosa kiye bina. Agar passphrase aur captured handshake do to Wireshark key verify bhi kar sakta hai (concept).</p></div>

<h3>show tech aur escalation (concept only)</h3>
<p>Cisco TAC ke liye <code>show tech-support wireless</code> (controller state ka bada bundle), affected MACs ki Radioactive Trace files (maangne par <code>internal</code> ke saath), relevant packet capture aur configuration collect karo. Yeh lab mein simulate nahi hota. In ke bina ticket par doosri taraf ka engineer pehle yahi maangta hai.</p>

<h3>Lab walkthrough: wl-diag-evidence-pack</h3>
<p>Is lab mein koi fault nahi. Aap record karte ho ki <b>healthy</b> client kaisa dikhta hai, taaki incident mein compare kar sako.</p>
<pre class="code">WLC1# debug wireless mac 0050.2fe9.9a01 internal monitor-time 300
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# no debug wireless mac 0050.2fe9.9a01
WLC1# show logging profile wireless internal filter mac 0050.2fe9.9a01 to-file LAPTOP1-GOOD.log
WLC1# dir bootflash:
WLC1# monitor capture CAP-GOOD interface GigabitEthernet1 both
WLC1# monitor capture CAP-GOOD start
LAPTOP1# wifi disconnect
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# monitor capture CAP-GOOD stop
WLC1# monitor capture CAP-GOOD export flash:CAP-GOOD.pcap
WLC1# show platform conditions
WLC1# clear platform condition all</pre>
<ol>
<li><b>Task 1</b>: <code>internal</code> aur <code>monitor-time 300</code> ke saath trace, connect, stop. Bootflash mein <code>ra_trace_MAC_...log</code> file aati hai.</li>
<li><b>Task 2</b>: <code>to-file LAPTOP1-GOOD.log</code> se save karo aur <code>dir bootflash:</code> list karo.</li>
<li><b>Task 3</b>: poore DHCP exchange (Discover, Offer, Request, ACK) ke saath capture CAP-GOOD aur <code>flash:CAP-GOOD.pcap</code> par export (lab file text summary hai).</li>
<li><b>Task 4</b>: <code>show platform conditions</code>, phir <code>clear platform condition all</code>.</li>
</ol>
<p>GUI: <b>Troubleshooting &gt; Radioactive Trace</b> (Generate aur download) aur <b>Troubleshooting &gt; Packet Capture</b>.</p>

<h3>Evidence pack mein kya jata hai</h3>
<ul>
<li>Ticket text, time, scope aur controller clock.</li>
<li>Known-good trace aur capture (yeh lab) aur failing wale, <code>LAPTOP1-before-fix.log</code> jaise naamon ke saath.</li>
<li>ERR line, failing stage, badla hua object aur config before aur after.</li>
<li>Repair ka proof: doosra trace aur capture, client status, ping.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> User data wala capture export karke bahut logon ko e-mail karna. Captures mein credentials aur personal traffic ho sakta hai. Jitna chahiye utna filter karo aur sirf unhe share karo jinhe zaroorat hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> DTLS-encrypted CAPWAP control ko keys ke bina capture mein padh nahi sakte. Aur wire par client capture 802.11 management frames nahi dikha sakta; unke liye radio (monitor mode) capture chahiye.</p></div>

<div class="scn"><h4>Known-good ne bachaya</h4><p>Upgrade ke baad ek department ne slow log-ins report kiye. Engineer ne naye trace ko saved LAPTOP1-GOOD.log se compare kiya: healthy trace ne key management aur IP learn ke beech do second liye; naye ne chaudah, timestamps mein DNS-related RADIUS delay dikh raha tha. Server team ko slow directory lookup mila.</p><p><b>Lesson:</b> baseline "slow lag raha hai" ko measured difference bana deta hai.</p></div>

<div class="iv"><p class="q">"4-way handshake fail hone wale client ko debug karne ke liye kahan capture karoge?"</p><p>Client ke channel par monitor mode mein air capture, client MAC aur <code>eapol</code> par filtered, taaki M1 se M4 aur deauthentication reason dikhe. Controller trace andar se wahi kahani deta hai. Wired ya controller capture radio frames nahi dikha sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen capture points: air sniffer, switch SPAN port, controller EPC.</li>
<li>CAPWAP control UDP 5246 hai aur DTLS-encrypted; data UDP 5247.</li>
<li>Filters jaano: eapol, wlan.addr, reason codes, radius, bootp.</li>
<li>show tech, Wireshark aur hex dumps lab mein concept only hain.</li>
<li>Incident se pehle known-good baseline record karo.</li>
</ul></div>
`}};export{e as default};