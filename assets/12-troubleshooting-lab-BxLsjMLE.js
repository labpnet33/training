var e={id:`tshoot`,h:{en:`Troubleshooting workflow: watch a stateful firewall at work`,hi:`Troubleshooting workflow: stateful firewall ko kaam karte dekho`},body:{en:`
<p>When a parcel goes missing, a good courier company does not guess. It checks the tracking record: was it picked up, which hub scanned it, was it held at customs, and why. A firewall keeps exactly that kind of record for every flow. This chapter gives you a repeatable workflow, then walks through the lab <b>Watch a stateful firewall at work</b> step by step, so you know what every output means before you type it.</p>

<h3>The five-question workflow</h3>
<ol>
<li><b>Define the flow.</b> Source IP, destination IP, protocol, destination port, and the interface it enters. "The internet is down" is not a flow; "PC1 10.0.1.10 to 8.8.8.8 TCP 80, entering inside" is.</li>
<li><b>Did a connection get built?</b> <code>show conn address 10.0.1.10</code>. An entry with flags UIO means the firewall did its job; look elsewhere. An entry stuck with awaiting flags means the reply is not coming back.</li>
<li><b>Is it translated correctly?</b> <code>show xlate</code>. No entry for an outbound flow usually means a missing NAT rule.</li>
<li><b>What did the log say?</b> <code>show logging</code>: 302013/302014 for built and torn down, 106001 or 106023 for denied, 305011 for translations, and the teardown reason.</li>
<li><b>What would the firewall do, and what did the wire see?</b> <code>packet-tracer</code> simulates a packet through every phase; <code>capture</code> shows real packets on an interface; <code>show asp drop</code> counts why packets were dropped.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Firewall troubleshooting workflow">
<rect x="5" y="40" width="112" height="60" rx="8" fill="#e2e8f0"/><text x="61" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Define</text><text x="61" y="84" text-anchor="middle" class="svg-muted" font-size="11">5-tuple + in-if</text>
<rect x="132" y="40" width="112" height="60" rx="8" fill="#bae6fd"/><text x="188" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 show conn</text><text x="188" y="84" text-anchor="middle" class="svg-muted" font-size="11">built? flags?</text>
<rect x="259" y="40" width="112" height="60" rx="8" fill="#bbf7d0"/><text x="315" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 show xlate</text><text x="315" y="84" text-anchor="middle" class="svg-muted" font-size="11">NAT right?</text>
<rect x="386" y="40" width="112" height="60" rx="8" fill="#fde68a"/><text x="442" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 show logging</text><text x="442" y="84" text-anchor="middle" class="svg-muted" font-size="11">built / denied</text>
<rect x="513" y="40" width="122" height="60" rx="8" fill="#fed7aa"/><text x="574" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 tracer, capture</text><text x="574" y="84" text-anchor="middle" class="svg-muted" font-size="11">asp drop</text>
<line x1="117" y1="70" x2="132" y2="70" stroke="#64748b"/><line x1="244" y1="70" x2="259" y2="70" stroke="#64748b"/><line x1="371" y1="70" x2="386" y2="70" stroke="#64748b"/><line x1="498" y1="70" x2="513" y2="70" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Each step either proves the firewall innocent or points to the exact phase that failed.</text>
</svg><p class="cap">The same five questions work on the ASA, on Threat Defense and on almost any stateful firewall.</p></div>

<h3>Lab walk-through, task 1: generate inside traffic</h3>
<p>On PC1 run <code>curl 8.8.8.8</code> and <code>ping 8.8.8.8</code>. Both succeed. The web request works because inside (100) to outside (0) is high to low. The ping works only because the lab ASA has <code>inspect icmp</code> in global_policy (chapter 6); without it the echo replies would be denied.</p>

<h3>Task 2: read the connection and translation tables</h3>
<p>On ASA1, type <code>enable</code> (the lab has no enable password; just press Enter), then:</p>
<pre class="out">NK-ASA# show conn
2 in use, 3 most used

TCP outside  8.8.8.8:80 inside  10.0.1.10:51544, idle 0:00:05, bytes 1543, flags UIO
ICMP outside  8.8.8.8:0 inside  10.0.1.10:1, idle 0:00:00, bytes 64, flags

NK-ASA# show xlate
2 in use, 3 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:05 timeout 0:00:30</span>
ICMP PAT from inside:10.0.1.10/1 to outside:203.0.113.2/1 flags ri idle 0:00:00 timeout 0:00:30</pre>
<p>The question in the lab is: which address does the internet server see as the source? Read the "to outside:" part of the PAT entry: <b>203.0.113.2</b>, the ASA's outside interface, because INSIDE-NET uses <code>dynamic interface</code> PAT. Your ports and counters will differ; the pattern will not. If the connections have already closed, run the traffic again and look quickly, because PAT entries expire 30 seconds after their last connection.</p>

<h3>Task 3: be the stranger</h3>
<p>On PARTNER (198.51.100.10) run <code>curl 203.0.113.2</code>. It fails. Nothing on the inside started this conversation, so there is no connection entry, no static NAT publishes anything on 203.0.113.2 port 80, and outside (0) cannot open connections to a higher level without an ACL.</p>

<h3>Task 4: find the evidence</h3>
<pre class="out">NK-ASA# show logging
Syslog logging: enabled
    Buffer logging: level informational, 9 messages logged
%ASA-6-305011: Built dynamic TCP translation from inside:10.0.1.10/51544 to outside:203.0.113.2/51544
%ASA-6-302013: Built outbound TCP connection 41 for outside:8.8.8.8/80 (8.8.8.8/80) to inside:10.0.1.10/51544 (203.0.113.2/51544)
%ASA-6-302014: Teardown TCP connection 41 for outside:8.8.8.8/80 to inside:10.0.1.10/51544 duration 0:00:01 bytes 1543 TCP FINs
<span class="hl">%ASA-2-106001: Inbound TCP connection denied from 198.51.100.10/40001 to 203.0.113.2/80 flags SYN  on interface outside</span></pre>
<p>The lab asks for the message ID of the drop: <b>106001</b> (severity 2, critical). Read it aloud: an inbound TCP SYN from PARTNER to the public address was denied on the outside interface. That single line is stateful inspection proving itself.</p>

<h3>Going further: packet-tracer, capture and ASP drops</h3>
<pre class="code"><span class="c">! Simulate PC1's web flow through every phase</span>
packet-tracer input inside tcp 10.0.1.10 51544 8.8.8.8 80
<span class="c">! Capture real packets on the outside interface</span>
capture CAP-OUT interface outside match tcp host 198.51.100.10 host 203.0.113.2
show capture CAP-OUT
<span class="c">! Count why packets were dropped in the data path</span>
show asp drop</pre>
<pre class="out">NK-ASA# packet-tracer input inside tcp 10.0.1.10 51544 8.8.8.8 80
...
Result:
input-interface: inside
input-status: up
input-line-status: up
output-interface: outside
<span class="hl">Action: allow</span></pre>
<p><code>packet-tracer</code> lists each phase (route lookup, access list, NAT, inspection, flow creation) and shows exactly which one allows or drops. A capture proves whether a packet actually arrived; no packet in the capture means the problem is upstream, not on the firewall.</p>

<div class="warn"><p><b>Common mistake.</b> Changing rules before collecting evidence. Once you edit the policy and clear connections, the original symptom is gone. Always capture <code>show conn</code>, <code>show xlate</code> and the relevant log lines first.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show conn</code> shows sessions; <code>show xlate</code> shows translations; <code>packet-tracer</code> is a simulation and generates no real traffic; <code>capture</code> shows real packets. Know which tool answers which question.</p></div>

<div class="scn"><h4>"The firewall is blocking my ping"</h4><p>After a firmware upgrade and a configuration restore from an old template, users could browse but not ping external hosts. The engineer defined the flow (10.0.1.10 to 8.8.8.8 ICMP), saw ICMP entries appear and vanish in <code>show conn</code>, and found <code>%ASA-3-106014 Deny inbound icmp</code> for the echo replies. <code>show service-policy</code> showed no ICMP inspection in the restored template. Adding <code>inspect icmp</code> under global_policy fixed it with no ACL change.</p><p><b>Lesson:</b> follow the evidence; the log named the dropped packet and the service policy named the cause.</p></div>

<div class="iv"><p class="q">"A user says a website is unreachable through the ASA. What do you do first?"</p><p>Define the exact flow (source, destination, port, ingress interface), then check <code>show conn address</code> for a built connection and its flags, <code>show xlate</code> for the translation, and <code>show logging</code> for build, deny and teardown messages. Use <code>packet-tracer</code> to see which phase would drop it and <code>capture</code> to prove what is on the wire. Say you collect evidence before changing anything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Always start by defining the exact flow and its ingress interface.</li>
<li>show conn (sessions and flags), show xlate (NAT), show logging (built, denied, teardown reason).</li>
<li>In the lab, PC1 appears to the internet as 203.0.113.2 through interface PAT.</li>
<li>An unsolicited SYN from PARTNER is dropped and logged as %ASA-2-106001.</li>
<li>packet-tracer simulates, capture proves, show asp drop counts drop reasons.</li>
</ul></div>
`,hi:`
<p>Jab koi parcel kho jaata hai, achhi courier company andaaza nahi lagati. Woh tracking record check karti hai: pick up hua tha, kis hub ne scan kiya, customs par roka gaya tha, aur kyun. Firewall har flow ke liye bilkul aisa hi record rakhta hai. Yeh chapter aapko ek repeatable workflow deta hai, phir lab <b>Watch a stateful firewall at work</b> ko step by step chalata hai, taaki type karne se pehle aapko pata ho ki har output ka matlab kya hai.</p>

<h3>Paanch sawaalon wala workflow</h3>
<ol>
<li><b>Flow define karo.</b> Source IP, destination IP, protocol, destination port, aur woh interface jismein woh aata hai. "Internet down hai" flow nahi hai; "PC1 10.0.1.10 se 8.8.8.8 TCP 80, inside mein aata hua" flow hai.</li>
<li><b>Kya connection bana?</b> <code>show conn address 10.0.1.10</code>. Flags UIO wali entry ka matlab firewall ne apna kaam kiya; kahin aur dekho. Awaiting flags ke saath atki entry ka matlab reply wapas nahi aa raha.</li>
<li><b>Kya sahi translate hua?</b> <code>show xlate</code>. Outbound flow ke liye entry na hona aam taur par missing NAT rule ka matlab hai.</li>
<li><b>Log ne kya kaha?</b> <code>show logging</code>: built aur torn down ke liye 302013/302014, denied ke liye 106001 ya 106023, translations ke liye 305011, aur teardown reason.</li>
<li><b>Firewall kya karega, aur wire ne kya dekha?</b> <code>packet-tracer</code> har phase se ek packet simulate karta hai; <code>capture</code> interface par real packets dikhata hai; <code>show asp drop</code> ginta hai ki packets kyun drop hue.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Firewall troubleshooting workflow">
<rect x="5" y="40" width="112" height="60" rx="8" fill="#e2e8f0"/><text x="61" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Define</text><text x="61" y="84" text-anchor="middle" class="svg-muted" font-size="11">5-tuple + in-if</text>
<rect x="132" y="40" width="112" height="60" rx="8" fill="#bae6fd"/><text x="188" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 show conn</text><text x="188" y="84" text-anchor="middle" class="svg-muted" font-size="11">bana? flags?</text>
<rect x="259" y="40" width="112" height="60" rx="8" fill="#bbf7d0"/><text x="315" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 show xlate</text><text x="315" y="84" text-anchor="middle" class="svg-muted" font-size="11">NAT sahi?</text>
<rect x="386" y="40" width="112" height="60" rx="8" fill="#fde68a"/><text x="442" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 show logging</text><text x="442" y="84" text-anchor="middle" class="svg-muted" font-size="11">built / denied</text>
<rect x="513" y="40" width="122" height="60" rx="8" fill="#fed7aa"/><text x="574" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 tracer, capture</text><text x="574" y="84" text-anchor="middle" class="svg-muted" font-size="11">asp drop</text>
<line x1="117" y1="70" x2="132" y2="70" stroke="#64748b"/><line x1="244" y1="70" x2="259" y2="70" stroke="#64748b"/><line x1="371" y1="70" x2="386" y2="70" stroke="#64748b"/><line x1="498" y1="70" x2="513" y2="70" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Har step ya to firewall ko begunaah prove karta hai ya exact fail hua phase dikhata hai.</text>
</svg><p class="cap">Yahi paanch sawaal ASA, Threat Defense aur lagbhag kisi bhi stateful firewall par kaam karte hain.</p></div>

<h3>Lab walk-through, task 1: inside traffic banao</h3>
<p>PC1 par <code>curl 8.8.8.8</code> aur <code>ping 8.8.8.8</code> chalao. Dono succeed hote hain. Web request isliye chalti hai kyunki inside (100) se outside (0) high se low hai. Ping sirf isliye chalta hai kyunki lab ASA ke global_policy mein <code>inspect icmp</code> hai (chapter 6); iske bina echo replies deny ho jaate.</p>

<h3>Task 2: connection aur translation tables padho</h3>
<p>ASA1 par <code>enable</code> type karo (lab mein enable password nahi hai; bas Enter dabao), phir:</p>
<pre class="out">NK-ASA# show conn
2 in use, 3 most used

TCP outside  8.8.8.8:80 inside  10.0.1.10:51544, idle 0:00:05, bytes 1543, flags UIO
ICMP outside  8.8.8.8:0 inside  10.0.1.10:1, idle 0:00:00, bytes 64, flags

NK-ASA# show xlate
2 in use, 3 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:05 timeout 0:00:30</span>
ICMP PAT from inside:10.0.1.10/1 to outside:203.0.113.2/1 flags ri idle 0:00:00 timeout 0:00:30</pre>
<p>Lab ka sawaal hai: internet server source ke roop mein kaunsa address dekhta hai? PAT entry ka "to outside:" hissa padho: <b>203.0.113.2</b>, ASA ka outside interface, kyunki INSIDE-NET <code>dynamic interface</code> PAT use karta hai. Aapke ports aur counters alag honge; pattern nahi. Agar connections pehle hi band ho chuke hain, to traffic dobara chalao aur jaldi dekho, kyunki PAT entries apne aakhri connection ke 30 second baad expire ho jaati hain.</p>

<h3>Task 3: anjaan bano</h3>
<p>PARTNER (198.51.100.10) par <code>curl 203.0.113.2</code> chalao. Yeh fail hota hai. Inside se kisi ne yeh baatcheet shuru nahi ki, isliye koi connection entry nahi hai, koi static NAT 203.0.113.2 port 80 par kuch publish nahi karta, aur outside (0) bina ACL ke higher level par connections nahi khol sakta.</p>

<h3>Task 4: saboot dhoondho</h3>
<pre class="out">NK-ASA# show logging
Syslog logging: enabled
    Buffer logging: level informational, 9 messages logged
%ASA-6-305011: Built dynamic TCP translation from inside:10.0.1.10/51544 to outside:203.0.113.2/51544
%ASA-6-302013: Built outbound TCP connection 41 for outside:8.8.8.8/80 (8.8.8.8/80) to inside:10.0.1.10/51544 (203.0.113.2/51544)
%ASA-6-302014: Teardown TCP connection 41 for outside:8.8.8.8/80 to inside:10.0.1.10/51544 duration 0:00:01 bytes 1543 TCP FINs
<span class="hl">%ASA-2-106001: Inbound TCP connection denied from 198.51.100.10/40001 to 203.0.113.2/80 flags SYN  on interface outside</span></pre>
<p>Lab drop ka message ID maangta hai: <b>106001</b> (severity 2, critical). Ise zor se padho: PARTNER se public address ki taraf ek inbound TCP SYN outside interface par deny hua. Woh ek line stateful inspection ka khud ko prove karna hai.</p>

<h3>Aage badho: packet-tracer, capture aur ASP drops</h3>
<pre class="code"><span class="c">! PC1 ke web flow ko har phase se simulate karo</span>
packet-tracer input inside tcp 10.0.1.10 51544 8.8.8.8 80
<span class="c">! Outside interface par real packets capture karo</span>
capture CAP-OUT interface outside match tcp host 198.51.100.10 host 203.0.113.2
show capture CAP-OUT
<span class="c">! Data path mein packets kyun drop hue, gino</span>
show asp drop</pre>
<pre class="out">NK-ASA# packet-tracer input inside tcp 10.0.1.10 51544 8.8.8.8 80
...
Result:
input-interface: inside
input-status: up
input-line-status: up
output-interface: outside
<span class="hl">Action: allow</span></pre>
<p><code>packet-tracer</code> har phase (route lookup, access list, NAT, inspection, flow creation) list karta hai aur exactly dikhata hai ki kaunsa allow ya drop karta hai. Capture prove karta hai ki packet asal mein aaya ya nahi; capture mein packet na hona ka matlab problem upstream hai, firewall par nahi.</p>

<div class="warn"><p><b>Common galti.</b> Saboot ikattha karne se pehle rules badal dena. Jaise hi aap policy edit karke connections clear karte ho, asli symptom chala jaata hai. Hamesha pehle <code>show conn</code>, <code>show xlate</code> aur relevant log lines capture karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show conn</code> sessions dikhata hai; <code>show xlate</code> translations; <code>packet-tracer</code> simulation hai aur koi real traffic generate nahi karta; <code>capture</code> real packets dikhata hai. Jaano ki kaunsa tool kis sawaal ka jawab deta hai.</p></div>

<div class="scn"><h4>"Firewall mera ping block kar raha hai"</h4><p>Firmware upgrade aur purane template se configuration restore ke baad, users browse kar pa rahe the lekin external hosts ko ping nahi. Engineer ne flow define kiya (10.0.1.10 se 8.8.8.8 ICMP), <code>show conn</code> mein ICMP entries aati aur gayab hoti dekhi, aur echo replies ke liye <code>%ASA-3-106014 Deny inbound icmp</code> paaya. <code>show service-policy</code> ne restore hue template mein koi ICMP inspection nahi dikhaya. global_policy ke under <code>inspect icmp</code> jodne se bina ACL change ke theek ho gaya.</p><p><b>Seekh:</b> saboot ke peeche chalo; log ne drop hua packet bataya aur service policy ne wajah.</p></div>

<div class="iv"><p class="q">"User kehta hai ASA ke through ek website unreachable hai. Aap pehle kya karoge?"</p><p>Exact flow define karo (source, destination, port, ingress interface), phir built connection aur uske flags ke liye <code>show conn address</code>, translation ke liye <code>show xlate</code>, aur build, deny aur teardown messages ke liye <code>show logging</code> check karo. <code>packet-tracer</code> se dekho kaunsa phase drop karega aur <code>capture</code> se prove karo ki wire par kya hai. Kaho ki aap kuch bhi badalne se pehle saboot ikattha karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hamesha exact flow aur uske ingress interface ko define karke shuru karo.</li>
<li>show conn (sessions aur flags), show xlate (NAT), show logging (built, denied, teardown reason).</li>
<li>Lab mein PC1 internet ko interface PAT ke through 203.0.113.2 dikhta hai.</li>
<li>PARTNER ka bina bulaya SYN drop hota hai aur %ASA-2-106001 ki tarah log hota hai.</li>
<li>packet-tracer simulate karta hai, capture prove karta hai, show asp drop drop reasons ginta hai.</li>
</ul></div>
`}};export{e as default};