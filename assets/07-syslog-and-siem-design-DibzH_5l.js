var e={id:`syslog-and-siem-design`,h:{en:`Syslog and SIEM design: what to send where`,hi:`Syslog aur SIEM design: kya kahan bhejna hai`},body:{en:`
<p>A SIEM is a security analyst's inbox. If you forward every message to an inbox, it fills with noise and the important mail is buried. If you forward nothing, it is empty and useless. Good design is deciding what deserves a place in that inbox. Panorama keeps the complete history; the SIEM gets the signals that someone will act on.</p>

<h3>What syslog is</h3>
<p><b>Syslog</b> is a simple standard for sending log messages over the network to a collecting server. In PAN-OS you describe the receiving server in a <b>syslog server profile</b>. The main choices are:</p>
<table class="tbl"><tr><th>Setting</th><th>Meaning</th><th>Note</th></tr>
<tr><td>Server address</td><td>Where the SIEM or collector listens</td><td>192.0.2.60 in the lab</td></tr>
<tr><td>Transport</td><td>UDP, TCP or SSL</td><td>UDP is light but gives no delivery guarantee; TCP is reliable; SSL adds encryption. Check the documentation for your PAN-OS version for what is supported</td></tr>
<tr><td>Port</td><td>The listening port</td><td>514 for classic UDP syslog; other transports often use other ports, so follow your SIEM's documentation</td></tr>
<tr><td>Format</td><td>BSD or IETF message style</td><td>Choose what your SIEM parses</td></tr>
<tr><td>Facility</td><td>A label used by the receiver to sort messages</td><td>LOG_USER in the lab</td></tr>
</table>

<h3>Deciding what goes where</h3>
<div class="dia"><svg viewBox="0 0 680 200" role="img" aria-label="Forwarding split">
<rect x="10" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="105" text-anchor="middle" class="svg-ink" font-size="13">Firewall logs</text>
<rect x="260" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="355" y="48" text-anchor="middle" class="svg-ink" font-size="12">Match list ALL</text><text x="355" y="66" text-anchor="middle" class="svg-ink" font-size="11">everything</text>
<rect x="260" y="120" width="190" height="60" rx="8" fill="#fed7aa"/><text x="355" y="148" text-anchor="middle" class="svg-ink" font-size="12">Match list DENY</text><text x="355" y="166" text-anchor="middle" class="svg-ink" font-size="11">action eq deny</text>
<rect x="540" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="605" y="55" text-anchor="middle" class="svg-ink" font-size="13">Panorama</text>
<rect x="540" y="120" width="130" height="60" rx="8" fill="#fde68a"/><text x="605" y="155" text-anchor="middle" class="svg-ink" font-size="13">SIEM</text>
<path d="M130 100L260 50M130 100L260 150M450 50H540M450 150H540" stroke="#475569" stroke-width="2" fill="none"/>
</svg><p class="cap">Filter at the source: the SIEM never receives the allowed traffic it does not need.</p></div>
<ul>
<li><b>Panorama:</b> the complete record. Cheap to keep relative to what it saves in investigations.</li>
<li><b>SIEM:</b> events with a use case. Denies, specific sensitive rules or applications, and critical system events, for example.</li>
<li><b>Archive or compliance store:</b> whatever your policy requires and for as long as it requires; ask the compliance owner, not the network team.</li>
</ul>

<h3>Why filter at the source</h3>
<p>A SIEM is often licensed or sized by the volume it ingests. A busy branch generates enormous numbers of allowed web sessions. Sending them all costs money, bandwidth and analyst attention. Filtering in the match list means the unwanted logs never leave the firewall. It is also easier to reason about: the filter text is the contract between the network team and the security team. Write it down and review it when use cases change.</p>

<h3>In the lab</h3>
<p>After the split, the firewall counters show that Panorama received both logs and the syslog profile only the denial:</p>
<pre class="out">PA1&gt; show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0
    Forwarded to syslog profile NK-SYSLOG : 1</pre>
<p>Created two, forwarded two to Panorama, one to syslog. The syslog counter never exceeds the number of denials. If it counted allowed sessions too, the DENY filter would be wrong.</p>

<div class="warn"><p><b>Honest boundary.</b> The simulator counts forwards to the syslog profile but does not deliver to a real syslog host, so TCP, SSL and parsing issues are outside the lab. Keep in mind that UDP syslog can lose messages silently on a congested path.</p></div>

<div class="scn"><h4>The SIEM bill</h4><p>A retailer forwarded all traffic logs from 200 stores to its SIEM with an All Logs filter. The licence limit was reached in the first week and the SIEM began dropping events, including real denies. After the team filtered on denies and a short list of sensitive rules, ingest fell sharply and the alerts became meaningful again. Panorama still held every log.</p><p><b>Lesson:</b> filter at the source, and keep the full copy in a cheaper place.</p></div>

<div class="iv"><p class="q">"How would you design log forwarding for a branch estate with a SIEM?"</p><p>Everything to Panorama for investigation, and only use-case driven events to the SIEM, selected by filters on the firewall: denies, sensitive rules, critical events. Pick a transport that matches the loss tolerance, document the filters with the security team, and review volume regularly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog server profile: address, transport, port, format and facility.</li>
<li>Panorama gets the full record; the SIEM gets signals with a use case.</li>
<li>Filter at the source to save cost, bandwidth and analyst attention.</li>
<li>UDP is light but unreliable; check the documentation for your PAN-OS version for transport options.</li>
</ul></div>
`,hi:`
<p>SIEM security analyst ka inbox hai. Har message inbox mein forward karoge to wo noise se bhar jayega aur zaroori mail dab jayegi. Kuch bhi forward nahi karoge to wo khaali aur bekaar hai. Achha design ye decide karna hai ki us inbox mein kis cheez ki jagah banti hai. Panorama poori history rakhta hai; SIEM ko wo signals milte hain jin par koi action lega.</p>

<h3>Syslog kya hai</h3>
<p><b>Syslog</b> network par collecting server ko log messages bhejne ka simple standard hai. PAN-OS mein receiving server ko <b>syslog server profile</b> mein describe karte hain. Main choices:</p>
<table class="tbl"><tr><th>Setting</th><th>Matlab</th><th>Note</th></tr>
<tr><td>Server address</td><td>SIEM ya collector kahan sunta hai</td><td>Lab mein 192.0.2.60</td></tr>
<tr><td>Transport</td><td>UDP, TCP ya SSL</td><td>UDP halka hai lekin delivery guarantee nahi; TCP reliable; SSL encryption jodta hai. Kya supported hai ye apne PAN-OS version ki documentation mein check karo</td></tr>
<tr><td>Port</td><td>Listening port</td><td>Classic UDP syslog ke liye 514; doosre transports aksar doosre ports use karte hain, isliye apne SIEM ki documentation follow karo</td></tr>
<tr><td>Format</td><td>BSD ya IETF message style</td><td>Wo chuno jo aapka SIEM parse kare</td></tr>
<tr><td>Facility</td><td>Receiver ka messages sort karne ka label</td><td>Lab mein LOG_USER</td></tr>
</table>

<h3>Kya kahan jayega, decide karna</h3>
<div class="dia"><svg viewBox="0 0 680 200" role="img" aria-label="Forwarding split">
<rect x="10" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="105" text-anchor="middle" class="svg-ink" font-size="13">Firewall logs</text>
<rect x="260" y="20" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="355" y="48" text-anchor="middle" class="svg-ink" font-size="12">Match list ALL</text><text x="355" y="66" text-anchor="middle" class="svg-ink" font-size="11">sab kuch</text>
<rect x="260" y="120" width="190" height="60" rx="8" fill="#fed7aa"/><text x="355" y="148" text-anchor="middle" class="svg-ink" font-size="12">Match list DENY</text><text x="355" y="166" text-anchor="middle" class="svg-ink" font-size="11">action eq deny</text>
<rect x="540" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="605" y="55" text-anchor="middle" class="svg-ink" font-size="13">Panorama</text>
<rect x="540" y="120" width="130" height="60" rx="8" fill="#fde68a"/><text x="605" y="155" text-anchor="middle" class="svg-ink" font-size="13">SIEM</text>
<path d="M130 100L260 50M130 100L260 150M450 50H540M450 150H540" stroke="#475569" stroke-width="2" fill="none"/>
</svg><p class="cap">Source par filter karo: SIEM ko wo allowed traffic kabhi milta hi nahi jo use chahiye nahi.</p></div>
<ul>
<li><b>Panorama:</b> poora record. Investigations mein jo bachata hai uske muqable rakhna sasta hai.</li>
<li><b>SIEM:</b> use case wale events. Jaise denies, specific sensitive rules ya applications, aur critical system events.</li>
<li><b>Archive ya compliance store:</b> jo bhi aapki policy maangti hai aur jitne time ke liye; compliance owner se poochho, network team se nahi.</li>
</ul>

<h3>Source par filter kyun</h3>
<p>SIEM aksar us volume ke hisaab se licensed ya sized hota hai jo wo ingest karta hai. Busy branch bahut saare allowed web sessions banati hai. Sabko bhejne mein paisa, bandwidth aur analyst ka dhyan lagta hai. Match list mein filter karne ka matlab unwanted logs firewall se nikalte hi nahi. Samajhna bhi aasan: filter text network team aur security team ke beech contract hai. Use likh kar rakho aur use cases badalne par review karo.</p>

<h3>Lab mein</h3>
<p>Split ke baad firewall counters dikhate hain ki Panorama ko dono logs mile aur syslog profile ko sirf denial:</p>
<pre class="out">PA1&gt; show logging-status

Log forwarding agent: connected to Panorama 192.0.2.50
Panorama Server 1: 192.0.2.50  connected
Traffic logs:
    Total logs created                : 2
    Forwarded to Panorama             : 2
    Waiting to be forwarded           : 0
    Forwarded to syslog profile NK-SYSLOG : 1</pre>
<p>Created do, Panorama ko do, syslog ko ek. Syslog counter denials ki ginti se kabhi zyada nahi hota. Agar wo allowed sessions bhi ginta, to DENY filter galat hota.</p>

<div class="warn"><p><b>Honest boundary.</b> Simulator syslog profile ke forwards ginta hai lekin real syslog host ko deliver nahi karta, isliye TCP, SSL aur parsing issues lab ke bahar hain. Yaad rakho ki UDP syslog congested path par chupchaap messages kho sakta hai.</p></div>

<div class="scn"><h4>SIEM ka bill</h4><p>Ek retailer ne 200 stores ke saare traffic logs All Logs filter se SIEM ko forward kiye. Pehle hafte mein licence limit aa gayi aur SIEM events drop karne laga, asli denies bhi. Team ne denies aur kuch sensitive rules par filter kiya to ingest kaafi gir gaya aur alerts phir se meaningful ho gaye. Panorama ke paas har log phir bhi tha.</p><p><b>Lesson:</b> source par filter karo, aur poori copy sasti jagah rakho.</p></div>

<div class="iv"><p class="q">"SIEM wale branch estate ke liye log forwarding kaise design karoge?"</p><p>Investigation ke liye sab kuch Panorama ko, aur SIEM ko sirf use-case wale events, firewall par filters se: denies, sensitive rules, critical events. Loss tolerance ke hisaab se transport chuno, filters security team ke saath document karo, aur volume regularly review karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syslog server profile: address, transport, port, format aur facility.</li>
<li>Panorama ko poora record; SIEM ko use case wale signals.</li>
<li>Source par filter karo: cost, bandwidth aur analyst ka dhyan bachta hai.</li>
<li>UDP halka lekin unreliable; transport options ke liye apne PAN-OS version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};