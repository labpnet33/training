var e={id:`architecture-log-flow`,h:{en:`Architecture of the log flow: OFTP, port 514, UDP and reliable TCP`,hi:`Log flow ka architecture: OFTP, port 514, UDP aur reliable TCP`},body:{en:`
<p>Think of the post. A shop owner writes a daily sales slip and hands it to the courier, who delivers it to head office. The slip can go by ordinary post (cheap, no receipt) or by registered post (a receipt, and a retry if it fails). The logs of a FortiGate travel the same way: written locally, queued, then sent to the FortiAnalyzer by one of two delivery methods.</p>

<h3>Step by step: from a packet to a stored log</h3>
<ol>
<li><b>Traffic happens.</b> PC-HQ opens a web page on SRV-WEB (192.0.2.80). HQ-FGT matches a firewall policy.</li>
<li><b>The FortiGate writes a log.</b> Only if the policy has <code>logtraffic</code> on. A security profile that finds something writes a UTM log. A configuration change writes an event log.</li>
<li><b>The filter decides.</b> The FortiAnalyzer filter on the FortiGate (chapter 3) may drop the log before it leaves.</li>
<li><b>The log waits in a queue</b> until the next upload time.</li>
<li><b>The log is sent</b> to the FortiAnalyzer over <b>OFTP</b>, port 514.</li>
<li><b>FAZ-1 checks the sender.</b> Is this serial number in my device table? If yes, store it. If no, discard it (chapter 4).</li>
</ol>
<p><b>OFTP</b> is the Fortinet protocol used to carry logs and some control messages between a FortiGate and a FortiAnalyzer. The FortiGate is always the one that sends. The word to remember is <b>514</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Log flow from policy to storage">
<rect x="10" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="86" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="65" y="104" text-anchor="middle" class="svg-muted" font-size="12">logtraffic</text>
<rect x="140" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="190" y="86" text-anchor="middle" class="svg-ink" font-size="13">Filter</text><text x="190" y="104" text-anchor="middle" class="svg-muted" font-size="12">severity</text>
<rect x="260" y="60" width="100" height="60" rx="8" fill="#fde68a"/><text x="310" y="86" text-anchor="middle" class="svg-ink" font-size="13">Queue</text><text x="310" y="104" text-anchor="middle" class="svg-muted" font-size="12">upload time</text>
<rect x="380" y="60" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="430" y="86" text-anchor="middle" class="svg-ink" font-size="13">OFTP</text><text x="430" y="104" text-anchor="middle" class="svg-muted" font-size="12">port 514</text>
<rect x="500" y="60" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="565" y="104" text-anchor="middle" class="svg-muted" font-size="12">registered?</text>
<line x1="120" y1="90" x2="140" y2="90" stroke="#64748b" stroke-width="2"/><line x1="240" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="90" x2="380" y2="90" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">any step can stop a log: logtraffic off, filter, no route, not registered</text>
</svg><p class="cap">Five places where a log can be lost before it is stored.</p></div>

<h3>UDP versus reliable TCP</h3>
<p>By default the FortiGate sends the log records over <b>UDP</b> port 514. UDP is fire and forget: no acknowledgement, no retry. With <code>set reliable enable</code> the records go over <b>TCP</b> port 514 instead. TCP acknowledges data and resends what was lost. The price is a little more load.</p>
<table class="cmp"><tr><th></th><th>reliable disable (default)</th><th>reliable enable</th></tr>
<tr><td>Transport</td><td>UDP/514</td><td>TCP/514</td></tr>
<tr><td>Lost packet</td><td>Log is lost</td><td>Resent</td></tr>
<tr><td>Typical use</td><td>Lab or low-risk sites</td><td>Audit or compliance logs</td></tr>
</table>
<p>In the simulator the control connection always needs TCP/514 to reach FAZ-1. The data path follows the transport you chose. That gives a classic trap: a firewall in the path blocks UDP/514 but allows TCP/514. The connection test says <code>Allow</code> and yet the logs never arrive. The counter <code>lost</code> in <code>miglogd 6</code> then grows.</p>

<h3>Upload options</h3>
<p><code>upload-option</code> controls when the queue is flushed: <code>realtime</code> (about every second), <code>1-minute</code> or <code>5-minute</code>. A longer interval saves resources but delays what an analyst sees. When FAZ-1 cannot be reached, records wait in the queue and go at the next upload. The queue is limited; in the simulator it holds 1500 records, and older ones are dropped and counted in <code>lost</code>.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FGT sends 40 logs per minute and FAZ-1 is unreachable for 10 minutes. That is 400 logs, which fit in the queue (limit 1500). When the connection returns, the queue empties at the next upload and nothing is lost. If the outage lasted 60 minutes, 2400 logs would be generated; the oldest 900 would be dropped and counted.</p></div>

<h3>Real output</h3>
<p>The command <code>diagnose test application miglogd 6</code> on a FortiGate shows the log connection. The name is real; the layout in the simulator is approximated.</p>
<pre class="out">HQ-FGT # diagnose test application miglogd 6
Log server connection status (simulated miglogd output):
  fortianalyzer: server=192.0.2.6:514 <span class="hl">status=connected mode=udp</span> upload=realtime data-path=ok
  registration=unregistered source=192.0.2.11 queued=0 sent(t/u/e)=6/0/2 <span class="hl">lost=0</span></pre>
<p>Read it left to right: the server and port, the status, the mode (udp or reliable(tcp)), the upload option, the registration state, how many logs wait (<code>queued</code>), how many were sent as traffic, UTM and event logs (<code>t/u/e</code>), and how many were lost.</p>

<div class="warn"><p><b>Common mistakes.</b> Assuming a connected status means logs are stored: connected only says the FortiGate reached the server. Forgetting that the firewall policy needs logging on. Believing that FortiAnalyzer sits in the traffic path, so that a failure would break the network. Confusing the log port 514 with the management ports of the FortiGate.</p></div>

<div class="exam"><p><b>Exam traps.</b> OFTP uses port 514. Default is UDP; <code>reliable enable</code> means TCP. The FortiGate initiates the connection. Queue and <code>upload-option</code> are on the FortiGate, not on the FortiAnalyzer.</p></div>

<div class="scn"><h4>Connected, but the logs were missing</h4><p>A bank branch had a small firewall between the FortiGate and the FortiAnalyzer. The test said Allow, yet analysts saw gaps. The miglogd output showed mode=udp and lost rising. The small firewall allowed TCP/514 only. Switching the FortiGate to <code>reliable enable</code> fixed it, and the lost counter stayed at zero.</p><p><b>Lesson:</b> compare the mode in miglogd with what the network between the two units really allows.</p></div>

<div class="iv"><p class="q">"What is the difference between UDP and reliable logging to FortiAnalyzer?"</p><p>Both use port 514. UDP has no acknowledgement, so a lost packet is a lost log. Reliable uses TCP with acknowledgement and resend. Mention that you check the mode and the lost counter with miglogd 6.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A log goes: policy logging, filter, queue, OFTP on port 514, FAZ-1 registration check, storage.</li>
<li>The FortiGate sends; FAZ-1 is outside the traffic path.</li>
<li>Default transport is UDP/514; <code>reliable enable</code> uses TCP/514.</li>
<li>Upload options are realtime, 1-minute and 5-minute; the queue holds logs while the server is unreachable.</li>
<li><code>diagnose test application miglogd 6</code> shows mode, queue and lost.</li>
</ul></div>
`,hi:`
<p>Post office socho. Shop owner roz ka sales slip likhta hai aur courier ko deta hai, jo head office tak pahunchata hai. Slip normal post se ja sakti hai (sasta, receipt nahi) ya registered post se (receipt, aur fail ho to dobara koshish). FortiGate ke logs bhi isi tarah jate hain: local likhe jate hain, queue mein rehte hain, phir do delivery methods mein se ek se FortiAnalyzer ko bheje jate hain.</p>

<h3>Step by step: packet se stored log tak</h3>
<ol>
<li><b>Traffic hota hai.</b> PC-HQ SRV-WEB (192.0.2.80) par web page kholta hai. HQ-FGT ek firewall policy se match karta hai.</li>
<li><b>FortiGate log likhta hai.</b> Sirf tab jab policy par <code>logtraffic</code> on ho. Security profile ko kuch mile to UTM log likhta hai. Configuration change event log likhta hai.</li>
<li><b>Filter decide karta hai.</b> FortiGate par FortiAnalyzer filter (chapter 3) log ko nikalne se pehle hi drop kar sakta hai.</li>
<li><b>Log queue mein rukta hai</b> agle upload time tak.</li>
<li><b>Log bheja jata hai</b> FortiAnalyzer ko <b>OFTP</b> par, port 514.</li>
<li><b>FAZ-1 sender check karta hai.</b> Kya ye serial number mere device table mein hai? Haan to store. Nahi to discard (chapter 4).</li>
</ol>
<p><b>OFTP</b> Fortinet ka protocol hai jo FortiGate aur FortiAnalyzer ke beech logs aur kuch control messages le jata hai. Bhejne wala hamesha FortiGate hota hai. Yaad rakhne wala number hai <b>514</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Policy se storage tak log flow">
<rect x="10" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="86" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="65" y="104" text-anchor="middle" class="svg-muted" font-size="12">logtraffic</text>
<rect x="140" y="60" width="100" height="60" rx="8" fill="#bae6fd"/><text x="190" y="86" text-anchor="middle" class="svg-ink" font-size="13">Filter</text><text x="190" y="104" text-anchor="middle" class="svg-muted" font-size="12">severity</text>
<rect x="260" y="60" width="100" height="60" rx="8" fill="#fde68a"/><text x="310" y="86" text-anchor="middle" class="svg-ink" font-size="13">Queue</text><text x="310" y="104" text-anchor="middle" class="svg-muted" font-size="12">upload time</text>
<rect x="380" y="60" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="430" y="86" text-anchor="middle" class="svg-ink" font-size="13">OFTP</text><text x="430" y="104" text-anchor="middle" class="svg-muted" font-size="12">port 514</text>
<rect x="500" y="60" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="565" y="86" text-anchor="middle" class="svg-ink" font-size="13">FAZ-1</text><text x="565" y="104" text-anchor="middle" class="svg-muted" font-size="12">registered?</text>
<line x1="120" y1="90" x2="140" y2="90" stroke="#64748b" stroke-width="2"/><line x1="240" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="90" x2="380" y2="90" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="500" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">har step log rok sakta hai: logtraffic off, filter, route nahi, registered nahi</text>
</svg><p class="cap">Stored hone se pehle paanch jagah jahan log kho sakta hai.</p></div>

<h3>UDP versus reliable TCP</h3>
<p>Default mein FortiGate log records <b>UDP</b> port 514 par bhejta hai. UDP fire and forget hai: acknowledgement nahi, retry nahi. <code>set reliable enable</code> karne par records UDP ki jagah <b>TCP</b> port 514 par jate hain. TCP data ko acknowledge karta hai aur jo kho gaya use dobara bhejta hai. Keemat hai thoda zyada load.</p>
<table class="cmp"><tr><th></th><th>reliable disable (default)</th><th>reliable enable</th></tr>
<tr><td>Transport</td><td>UDP/514</td><td>TCP/514</td></tr>
<tr><td>Packet kho jaye</td><td>Log kho jata hai</td><td>Dobara bheja jata hai</td></tr>
<tr><td>Kahan use hota hai</td><td>Lab ya low-risk sites</td><td>Audit ya compliance logs</td></tr>
</table>
<p>Simulator mein control connection ko hamesha FAZ-1 tak TCP/514 chahiye. Data path wahi transport follow karta hai jo aapne chuna. Isse classic trap banta hai: raste mein ek firewall UDP/514 block karta hai par TCP/514 allow karta hai. Connection test <code>Allow</code> kehta hai phir bhi logs nahi pahunchte. <code>miglogd 6</code> mein <code>lost</code> counter badhta hai.</p>

<h3>Upload options</h3>
<p><code>upload-option</code> tay karta hai queue kab flush hogi: <code>realtime</code> (lagbhag har second), <code>1-minute</code> ya <code>5-minute</code>. Lamba interval resources bachata hai par analyst ko dikhne wala data der se aata hai. FAZ-1 reach na ho to records queue mein rukte hain aur agle upload par jate hain. Queue limited hai; simulator mein 1500 records, aur purane drop hokar <code>lost</code> mein ginte jate hain.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FGT har minute 40 logs bhejta hai aur FAZ-1 10 minute unreachable hai. Matlab 400 logs, jo queue mein fit hain (limit 1500). Connection wapas aane par queue agle upload par khaali ho jati hai aur kuch nahi khota. Outage 60 minute ka ho to 2400 logs bante; sabse purane 900 drop hokar count hote.</p></div>

<h3>Real output</h3>
<p>FortiGate par <code>diagnose test application miglogd 6</code> log connection dikhata hai. Naam real hai; simulator mein layout approximate hai.</p>
<pre class="out">HQ-FGT # diagnose test application miglogd 6
Log server connection status (simulated miglogd output):
  fortianalyzer: server=192.0.2.6:514 <span class="hl">status=connected mode=udp</span> upload=realtime data-path=ok
  registration=unregistered source=192.0.2.11 queued=0 sent(t/u/e)=6/0/2 <span class="hl">lost=0</span></pre>
<p>Left se right padho: server aur port, status, mode (udp ya reliable(tcp)), upload option, registration state, kitne logs wait kar rahe hain (<code>queued</code>), traffic, UTM aur event logs kitne bheje gaye (<code>t/u/e</code>), aur kitne lost hue.</p>

<div class="warn"><p><b>Common mistakes.</b> Ye maan lena ki connected status ka matlab logs stored hain: connected sirf batata hai ki FortiGate server tak pahunch gaya. Bhool jana ki firewall policy par logging on honi chahiye. Ye sochna ki FortiAnalyzer traffic path mein hai aur uski failure network tod degi. Log port 514 ko FortiGate ke management ports se confuse karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> OFTP port 514 use karta hai. Default UDP hai; <code>reliable enable</code> matlab TCP. Connection FortiGate initiate karta hai. Queue aur <code>upload-option</code> FortiGate par hain, FortiAnalyzer par nahi.</p></div>

<div class="scn"><h4>Connected tha, phir bhi logs missing</h4><p>Ek bank branch mein FortiGate aur FortiAnalyzer ke beech ek chhota firewall tha. Test Allow dikha raha tha, phir bhi analysts ko gaps dikhte the. Miglogd output mein mode=udp aur lost badhta dikha. Chhota firewall sirf TCP/514 allow karta tha. FortiGate par <code>reliable enable</code> karne se fix ho gaya aur lost counter zero raha.</p><p><b>Lesson:</b> miglogd ka mode us se compare karo jo dono units ke beech network sach mein allow karta hai.</p></div>

<div class="iv"><p class="q">"FortiAnalyzer ko UDP aur reliable logging mein kya fark hai?"</p><p>Dono port 514 use karte hain. UDP mein acknowledgement nahi, isliye packet gaya to log gaya. Reliable TCP use karta hai acknowledgement aur resend ke saath. Batao ki aap mode aur lost counter miglogd 6 se check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Log ka raasta: policy logging, filter, queue, port 514 par OFTP, FAZ-1 registration check, storage.</li>
<li>Bhejta FortiGate hai; FAZ-1 traffic path ke bahar hai.</li>
<li>Default transport UDP/514 hai; <code>reliable enable</code> TCP/514 use karta hai.</li>
<li>Upload options realtime, 1-minute aur 5-minute hain; server unreachable ho to queue logs rakhti hai.</li>
<li><code>diagnose test application miglogd 6</code> mode, queue aur lost dikhata hai.</li>
</ul></div>
`}};export{e as default};