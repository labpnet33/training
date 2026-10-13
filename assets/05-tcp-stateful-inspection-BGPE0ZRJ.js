var e={id:`tcp-state`,h:{en:`How stateful inspection tracks TCP`,hi:`Stateful inspection TCP ko kaise track karta hai`},body:{en:`
<p>Go back to the security desk. The register line for a delivery is not just "Ravi". It says who is expected, from which shop, to which floor, when it was written, and whether the rider has arrived yet. A stateful firewall's connection entry is just as detailed, and for TCP it follows the conversation step by step. This chapter opens the register.</p>

<h3>What a connection entry contains</h3>
<dl class="terms">
<dt>The 5-tuple</dt><dd>Protocol, source IP, source port, destination IP, destination port. This uniquely identifies a flow.</dd>
<dt>Interfaces</dt><dd>Which interface the flow came in on and which it leaves by (for example inside and outside).</dd>
<dt>NAT information</dt><dd>The real and mapped addresses and ports, linked to the translation table (<code>show xlate</code>).</dd>
<dt>State and flags</dt><dd>Where the TCP conversation is: waiting for the handshake, up, closing.</dd>
<dt>Timers and counters</dt><dd>Idle time, uptime, the timeout that applies, and bytes transferred.</dd>
</dl>

<h3>The life of a TCP connection through the ASA</h3>
<ol>
<li><b>SYN arrives on inside</b> (PC1 10.0.1.10 port 51544 to 8.8.8.8 port 80). No entry exists, so this packet takes the slow path: route lookup, access check (security levels or the interface ACL), NAT rule lookup, then inspection policy.</li>
<li><b>Allowed.</b> The ASA builds a connection and a PAT translation (10.0.1.10/51544 becomes 203.0.113.2/51544). The connection is <b>embryonic</b>: half-open, waiting for the handshake to finish. The ASA also randomises the initial sequence number by default, so hosts with weak ISN generators are protected.</li>
<li><b>SYN-ACK arrives on outside.</b> It matches the entry. The ASA checks it is a valid reply (right flags, acknowledgment matches the SYN) and forwards it, un-translating the destination back to 10.0.1.10.</li>
<li><b>ACK from PC1.</b> The handshake is complete; the connection is <b>up</b>. From now on every packet takes the fast path: a hash lookup in the connection table, no rule evaluation.</li>
<li><b>Data flows.</b> The TCP normaliser checks each segment is inside the expected sequence window and has sane flags. Counters and idle timers update.</li>
<li><b>Close.</b> FIN from one side makes the connection half-closed; when both FINs are acknowledged the entry is removed. A RST removes it at once. If nothing is seen for the idle timeout (1 hour by default for TCP), it is removed anyway.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="TCP handshake through a stateful firewall">
<text x="70" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">ASA conn table</text><text x="570" y="20" text-anchor="middle" class="svg-ink" font-size="13">8.8.8.8</text>
<line x1="70" y1="28" x2="70" y2="250" stroke="#64748b"/><line x1="570" y1="28" x2="570" y2="250" stroke="#64748b"/>
<rect x="240" y="28" width="160" height="222" rx="8" fill="#e2e8f0"/>
<line x1="70" y1="50" x2="570" y2="70" stroke="#64748b"/><text x="120" y="48" class="svg-accent" font-size="12">SYN</text>
<rect x="250" y="76" width="140" height="26" rx="6" fill="#fde68a"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="12">entry built: embryonic</text>
<line x1="570" y1="112" x2="70" y2="132" stroke="#64748b"/><text x="480" y="108" class="svg-accent" font-size="12">SYN-ACK</text>
<line x1="70" y1="150" x2="570" y2="170" stroke="#64748b"/><text x="120" y="148" class="svg-accent" font-size="12">ACK</text>
<rect x="250" y="176" width="140" height="26" rx="6" fill="#bbf7d0"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="12">flags UIO: up</text>
<line x1="70" y1="222" x2="570" y2="238" stroke="#64748b"/><text x="120" y="220" class="svg-accent" font-size="12">FIN / RST</text>
<text x="320" y="246" text-anchor="middle" class="svg-muted" font-size="12">entry removed</text>
</svg><p class="cap">The first packet builds the entry; everything after it is matched against the table.</p></div>

<h3>Seeing it on the ASA</h3>
<pre class="out">NK-ASA# show conn
1 in use, 3 most used

<span class="hl">TCP outside  8.8.8.8:80 inside  10.0.1.10:51544, idle 0:00:02, bytes 1543, flags UIO</span>

NK-ASA# show conn detail
1 in use, 3 most used
Flags: A - awaiting responder ACK to SYN, a - awaiting initiator ACK to SYN,
       B - TCP probe for server, b - TCP state-bypass or nailed,
       I - initiator data, i - incomplete, O - responder data, U - up, X - inspected by service module

TCP outside: 8.8.8.8/80 inside: 10.0.1.10/51544,
    flags UIO, idle 2s, uptime 4s, <span class="hl">timeout 1h0m</span>, bytes 1543</pre>
<p>Read the line left to right: the <b>outside</b> end is 8.8.8.8 port 80, the <b>inside</b> end is 10.0.1.10 port 51544. Flags <b>U</b> (up), <b>I</b> (initiator sent data) and <b>O</b> (responder sent data) mean a healthy, two-way session. A connection stuck with "awaiting" flags (A, a) and no I or O means the handshake never finished: the server did not answer or the reply went elsewhere.</p>
<p>The log tells the same story. With <code>logging buffered informational</code> you see a build and a teardown for each connection:</p>
<pre class="out">%ASA-6-302013: Built outbound TCP connection 41 for outside:8.8.8.8/80 (8.8.8.8/80) to inside:10.0.1.10/51544 (203.0.113.2/51544)
<span class="hl">%ASA-6-302014: Teardown TCP connection 41 for outside:8.8.8.8/80 to inside:10.0.1.10/51544 duration 0:00:01 bytes 1543 TCP FINs</span></pre>
<p>The teardown reason is gold for troubleshooting: <b>TCP FINs</b> is a normal close; <b>TCP Reset-O</b> or <b>Reset-I</b> means the outside or inside host sent a reset; <b>SYN Timeout</b> means the handshake never completed; <b>Conn-timeout</b> means the idle timer expired.</p>

<h3>State also protects you</h3>
<p>Because the firewall understands TCP, it can defend against abuse of TCP itself. Embryonic connection limits (configured with the Modular Policy Framework using <code>set connection embryonic-conn-max</code>) make the ASA answer SYNs on the server's behalf with <b>TCP intercept</b> during a SYN flood, so the server's table never fills. Packets that do not fit the state (an ACK for a connection that does not exist, a SYN-ACK nobody asked for) are dropped and counted in <code>show asp drop</code>.</p>

<div class="eg"><p><b>Worked example.</b> A server team complains that sessions to 8.8.8.8 "die after lunch". <code>show conn</code> shows the database sync connection idle for 0:59:50, then it vanishes, and the log shows <b>Conn-timeout</b>. The application keeps an idle TCP session open for 90 minutes. Fix options: enable TCP keepalives on the application, or raise the idle timeout for that one flow class with MPF (<code>set connection timeout idle</code>), never globally.</p></div>

<div class="warn"><p><b>Common mistake.</b> Asymmetric routing. If the SYN leaves through firewall A but the SYN-ACK returns through firewall B, B has no entry and drops the reply. Stateful firewalls need both directions of a flow to pass the same device (or a cluster that shares state).</p></div>

<div class="exam"><p><b>Exam trap.</b> Only the <b>first</b> packet of a flow is checked against the access policy. Changing an ACL does not affect connections that already exist; you must clear them (<code>clear conn address ...</code>) or wait for them to close.</p></div>

<div class="scn"><h4>The half-open storm</h4><p>A public web server behind an ASA became unreachable every evening. <code>show conn count</code> jumped from 300 to 180,000 in minutes, and <code>show conn</code> was full of entries with awaiting-ACK flags from thousands of internet sources to 10.0.2.10 port 443. It was a SYN flood. The team applied an MPF policy for that server with an embryonic connection limit, so the ASA began intercepting and validating handshakes itself. Legitimate users reconnected, and the ISP was asked to filter the rest upstream.</p><p><b>Lesson:</b> the connection table is both your evidence and your defence.</p></div>

<div class="iv"><p class="q">"Walk me through what a stateful firewall does with a TCP SYN from inside."</p><p>Route lookup, policy check, NAT lookup and inspection on the slow path; if allowed, it creates an embryonic connection and translation, randomises the ISN, and forwards. The SYN-ACK is matched to the entry; after the final ACK the connection is up and later packets use the fast path. FIN or RST or the idle timer removes it. Mention the verification: <code>show conn</code> flags UIO, and 302013/302014 syslogs with the teardown reason.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A connection entry holds the 5-tuple, interfaces, NAT, TCP state, timers and byte counts.</li>
<li>Only the first packet is checked against policy; the rest use the fast path.</li>
<li>Flags UIO mean a healthy two-way TCP session; awaiting flags mean the handshake did not finish.</li>
<li>Teardown reasons (TCP FINs, Reset-I/O, SYN Timeout, Conn-timeout) explain why a session ended.</li>
<li>State enables TCP defences: ISN randomisation, normalisation and TCP intercept.</li>
</ul></div>
`,hi:`
<p>Security desk par wapas chalo. Delivery ki register line sirf "Ravi" nahi hoti. Usmein likha hota hai kaun expected hai, kis shop se, kis floor par, kab likha gaya, aur rider aa chuka hai ya nahi. Stateful firewall ki connection entry bhi utni hi detailed hoti hai, aur TCP ke liye woh baatcheet ko step by step follow karti hai. Yeh chapter register kholta hai.</p>

<h3>Connection entry mein kya hota hai</h3>
<dl class="terms">
<dt>5-tuple</dt><dd>Protocol, source IP, source port, destination IP, destination port. Yeh ek flow ko uniquely pehchaanta hai.</dd>
<dt>Interfaces</dt><dd>Flow kis interface par aaya aur kis se bahar jaata hai (jaise inside aur outside).</dd>
<dt>NAT information</dt><dd>Real aur mapped addresses aur ports, translation table (<code>show xlate</code>) se jude hue.</dd>
<dt>State aur flags</dt><dd>TCP baatcheet kahan hai: handshake ka intezaar, up, band ho rahi hai.</dd>
<dt>Timers aur counters</dt><dd>Idle time, uptime, lagu timeout, aur transfer hue bytes.</dd>
</dl>

<h3>ASA ke through ek TCP connection ki zindagi</h3>
<ol>
<li><b>Inside par SYN aata hai</b> (PC1 10.0.1.10 port 51544 se 8.8.8.8 port 80). Koi entry nahi hai, isliye yeh packet slow path leta hai: route lookup, access check (security levels ya interface ACL), NAT rule lookup, phir inspection policy.</li>
<li><b>Allowed.</b> ASA ek connection aur ek PAT translation banata hai (10.0.1.10/51544 ban jaata hai 203.0.113.2/51544). Connection <b>embryonic</b> hai: half-open, handshake poora hone ka intezaar. ASA default mein initial sequence number bhi randomise karta hai, isliye kamzor ISN generators wale hosts protected rehte hain.</li>
<li><b>Outside par SYN-ACK aata hai.</b> Yeh entry se match hota hai. ASA check karta hai ki yeh valid reply hai (sahi flags, acknowledgment SYN se match karta hai) aur ise aage bhejta hai, destination ko wapas 10.0.1.10 mein un-translate karke.</li>
<li><b>PC1 se ACK.</b> Handshake poora; connection <b>up</b> hai. Ab se har packet fast path leta hai: connection table mein hash lookup, koi rule evaluation nahi.</li>
<li><b>Data flow hota hai.</b> TCP normaliser check karta hai ki har segment expected sequence window ke andar ho aur uske flags sahi hon. Counters aur idle timers update hote hain.</li>
<li><b>Close.</b> Ek taraf se FIN connection ko half-closed banata hai; jab dono FINs acknowledge ho jaate hain to entry hat jaati hai. RST use turant hata deta hai. Agar idle timeout tak kuch na dikhe (TCP ke liye default 1 ghanta), to bhi woh hat jaati hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Stateful firewall ke through TCP handshake">
<text x="70" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">ASA conn table</text><text x="570" y="20" text-anchor="middle" class="svg-ink" font-size="13">8.8.8.8</text>
<line x1="70" y1="28" x2="70" y2="250" stroke="#64748b"/><line x1="570" y1="28" x2="570" y2="250" stroke="#64748b"/>
<rect x="240" y="28" width="160" height="222" rx="8" fill="#e2e8f0"/>
<line x1="70" y1="50" x2="570" y2="70" stroke="#64748b"/><text x="120" y="48" class="svg-accent" font-size="12">SYN</text>
<rect x="250" y="76" width="140" height="26" rx="6" fill="#fde68a"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="12">entry bani: embryonic</text>
<line x1="570" y1="112" x2="70" y2="132" stroke="#64748b"/><text x="480" y="108" class="svg-accent" font-size="12">SYN-ACK</text>
<line x1="70" y1="150" x2="570" y2="170" stroke="#64748b"/><text x="120" y="148" class="svg-accent" font-size="12">ACK</text>
<rect x="250" y="176" width="140" height="26" rx="6" fill="#bbf7d0"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="12">flags UIO: up</text>
<line x1="70" y1="222" x2="570" y2="238" stroke="#64748b"/><text x="120" y="220" class="svg-accent" font-size="12">FIN / RST</text>
<text x="320" y="246" text-anchor="middle" class="svg-muted" font-size="12">entry hatai gayi</text>
</svg><p class="cap">Pehla packet entry banata hai; uske baad sab kuch table se match hota hai.</p></div>

<h3>ASA par dekhna</h3>
<pre class="out">NK-ASA# show conn
1 in use, 3 most used

<span class="hl">TCP outside  8.8.8.8:80 inside  10.0.1.10:51544, idle 0:00:02, bytes 1543, flags UIO</span>

NK-ASA# show conn detail
1 in use, 3 most used
Flags: A - awaiting responder ACK to SYN, a - awaiting initiator ACK to SYN,
       B - TCP probe for server, b - TCP state-bypass or nailed,
       I - initiator data, i - incomplete, O - responder data, U - up, X - inspected by service module

TCP outside: 8.8.8.8/80 inside: 10.0.1.10/51544,
    flags UIO, idle 2s, uptime 4s, <span class="hl">timeout 1h0m</span>, bytes 1543</pre>
<p>Line ko baayen se daayen padho: <b>outside</b> end 8.8.8.8 port 80 hai, <b>inside</b> end 10.0.1.10 port 51544. Flags <b>U</b> (up), <b>I</b> (initiator ne data bheja) aur <b>O</b> (responder ne data bheja) ka matlab healthy, two-way session. Jo connection "awaiting" flags (A, a) ke saath atka ho aur usmein I ya O na ho, uska matlab handshake kabhi poora nahi hua: server ne jawab nahi diya ya reply kahin aur chala gaya.</p>
<p>Log bhi wahi kahani batata hai. <code>logging buffered informational</code> ke saath aapko har connection ka build aur teardown dikhta hai:</p>
<pre class="out">%ASA-6-302013: Built outbound TCP connection 41 for outside:8.8.8.8/80 (8.8.8.8/80) to inside:10.0.1.10/51544 (203.0.113.2/51544)
<span class="hl">%ASA-6-302014: Teardown TCP connection 41 for outside:8.8.8.8/80 to inside:10.0.1.10/51544 duration 0:00:01 bytes 1543 TCP FINs</span></pre>
<p>Teardown reason troubleshooting ke liye sona hai: <b>TCP FINs</b> normal close hai; <b>TCP Reset-O</b> ya <b>Reset-I</b> ka matlab outside ya inside host ne reset bheja; <b>SYN Timeout</b> ka matlab handshake kabhi poora nahi hua; <b>Conn-timeout</b> ka matlab idle timer khatam ho gaya.</p>

<h3>State aapko bachati bhi hai</h3>
<p>Kyunki firewall TCP samajhta hai, woh khud TCP ke galat use se bacha sakta hai. Embryonic connection limits (Modular Policy Framework mein <code>set connection embryonic-conn-max</code> se configure) SYN flood ke dauraan ASA ko server ki taraf se <b>TCP intercept</b> ke saath SYNs ka jawab dene dete hain, taaki server ki table kabhi na bhare. Jo packets state mein fit nahi hote (aise connection ka ACK jo exist hi nahi karta, aisa SYN-ACK jo kisi ne maanga nahi) woh drop hote hain aur <code>show asp drop</code> mein gine jaate hain.</p>

<div class="eg"><p><b>Worked example.</b> Server team shikayat karti hai ki 8.8.8.8 ke sessions "lunch ke baad mar jaate hain". <code>show conn</code> dikhata hai ki database sync connection 0:59:50 se idle hai, phir gayab ho jaata hai, aur log <b>Conn-timeout</b> dikhata hai. Application idle TCP session 90 minute tak khula rakhti hai. Fix options: application par TCP keepalives enable karo, ya sirf us ek flow class ke liye MPF (<code>set connection timeout idle</code>) se idle timeout badhao, kabhi globally nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Asymmetric routing. Agar SYN firewall A se jaata hai lekin SYN-ACK firewall B se wapas aata hai, to B ke paas entry nahi hai aur woh reply drop karta hai. Stateful firewalls ko flow ki dono directions ek hi device se (ya state share karne wale cluster se) guzarni chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Access policy se sirf flow ka <b>pehla</b> packet check hota hai. ACL badalne se pehle se bane connections par asar nahi padta; aapko unhe clear karna padta hai (<code>clear conn address ...</code>) ya unke band hone ka intezaar karna padta hai.</p></div>

<div class="scn"><h4>Half-open ka toofan</h4><p>ASA ke peeche ek public web server har shaam unreachable ho jaata tha. <code>show conn count</code> minutes mein 300 se 180,000 par pahunch gaya, aur <code>show conn</code> hazaaron internet sources se 10.0.2.10 port 443 ki taraf awaiting-ACK flags wali entries se bhara tha. Yeh SYN flood tha. Team ne us server ke liye embryonic connection limit wali MPF policy lagayi, taaki ASA khud handshakes intercept aur validate karne lage. Legitimate users reconnect ho gaye, aur ISP se baaki ko upstream filter karne ko kaha gaya.</p><p><b>Seekh:</b> connection table aapka saboot bhi hai aur aapki defence bhi.</p></div>

<div class="iv"><p class="q">"Mujhe batao inside se aaye TCP SYN ke saath stateful firewall kya karta hai."</p><p>Slow path par route lookup, policy check, NAT lookup aur inspection; allowed hai to woh embryonic connection aur translation banata hai, ISN randomise karta hai, aur forward karta hai. SYN-ACK entry se match hota hai; final ACK ke baad connection up hai aur baad ke packets fast path use karte hain. FIN ya RST ya idle timer use hata deta hai. Verification batao: <code>show conn</code> mein flags UIO, aur teardown reason ke saath 302013/302014 syslogs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connection entry mein 5-tuple, interfaces, NAT, TCP state, timers aur byte counts hote hain.</li>
<li>Policy se sirf pehla packet check hota hai; baaki fast path use karte hain.</li>
<li>Flags UIO ka matlab healthy two-way TCP session; awaiting flags ka matlab handshake poora nahi hua.</li>
<li>Teardown reasons (TCP FINs, Reset-I/O, SYN Timeout, Conn-timeout) batate hain ki session kyun khatam hua.</li>
<li>State TCP defences sambhav banati hai: ISN randomisation, normalisation aur TCP intercept.</li>
</ul></div>
`}};export{e as default};