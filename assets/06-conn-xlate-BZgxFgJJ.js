var e={id:`conn-xlate`,h:{en:`show conn and show xlate: reading live state and flags`,hi:`show conn aur show xlate: live state aur flags padhna`},body:{en:`
<p>A hotel reception keeps two books. The <b>guest register</b> lists who is staying right now, in which room, since when, and whether they have checked in fully or are still waiting for a key. The <b>key book</b> records which outside name maps to which room number. On the ASA, the guest register is the <b>connection table</b> (<code>show conn</code>) and the key book is the <b>translation table</b> (<code>show xlate</code>). packet-tracer tells you what should happen; these two tables tell you what <b>is</b> happening right now.</p>

<h3>Reading a connection line</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="show conn line anatomy">
<rect x="10" y="40" width="50" height="40" rx="6" fill="#e2e8f0"/><text x="35" y="65" text-anchor="middle" class="svg-ink" font-size="13">TCP</text>
<rect x="68" y="40" width="190" height="40" rx="6" fill="#bae6fd"/><text x="163" y="65" text-anchor="middle" class="svg-ink" font-size="13">outside 198.51.100.10:55191</text>
<rect x="266" y="40" width="140" height="40" rx="6" fill="#ddd6fe"/><text x="336" y="65" text-anchor="middle" class="svg-ink" font-size="13">dmz 10.0.2.10:443</text>
<rect x="414" y="40" width="80" height="40" rx="6" fill="#e2e8f0"/><text x="454" y="65" text-anchor="middle" class="svg-ink" font-size="13">idle 0:00:02</text>
<rect x="502" y="40" width="64" height="40" rx="6" fill="#e2e8f0"/><text x="534" y="65" text-anchor="middle" class="svg-ink" font-size="13">bytes 600</text>
<rect x="574" y="40" width="58" height="40" rx="6" fill="#bbf7d0"/><text x="603" y="65" text-anchor="middle" class="svg-ink" font-size="13">UIO</text>
<text x="35" y="105" text-anchor="middle" class="svg-muted" font-size="12">protocol</text>
<text x="163" y="105" text-anchor="middle" class="svg-muted" font-size="12">lower-security side</text>
<text x="336" y="105" text-anchor="middle" class="svg-muted" font-size="12">higher side, real IP</text>
<text x="454" y="105" text-anchor="middle" class="svg-muted" font-size="12">since last pkt</text>
<text x="534" y="105" text-anchor="middle" class="svg-muted" font-size="12">both ways</text>
<text x="603" y="105" text-anchor="middle" class="svg-muted" font-size="12">flags</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">The server appears as 10.0.2.10 (real), not 203.0.113.3; show xlate or show conn long gives the mapped address</text>
</svg><p class="cap">One line per connection: protocol, both ends with interface names, idle time, bytes and state flags.</p></div>

<pre class="out">NK-ASA# show conn
2 in use, 2 most used

TCP outside  198.51.100.10:58140 dmz  10.0.2.10:443, idle 0:00:03, bytes 600, <span class="hl">flags UIO</span>
TCP outside  198.51.100.10:55191 dmz  10.0.2.10:443, idle 0:00:02, bytes 600, <span class="hl">flags UIO</span></pre>
<p>The header gives the current count and the peak since the counters were cleared. The lower-security interface is listed first. Addresses are <b>real</b> addresses on each side.</p>

<h3>TCP flags decoded</h3>
<table class="cmp"><tr><th>Flag</th><th>Meaning (9.x wording)</th><th>What it tells you</th></tr>
<tr><td><b>U</b></td><td>up</td><td>Handshake completed; the connection is established.</td></tr>
<tr><td><b>I</b></td><td>initiator data</td><td>The side that opened the connection has sent data.</td></tr>
<tr><td><b>O</b></td><td>responder data</td><td>The server side has sent data back.</td></tr>
<tr><td><b>A</b></td><td>awaiting responder ACK to SYN</td><td>SYN passed through, the server has not answered: embryonic.</td></tr>
<tr><td><b>a</b></td><td>awaiting initiator ACK to SYN</td><td>SYN-ACK came back, the client never sent the final ACK.</td></tr>
<tr><td><b>F / f</b></td><td>initiator FIN / responder FIN</td><td>A side has started closing.</td></tr>
<tr><td><b>R / r</b></td><td>initiator / responder acknowledged FIN</td><td>The close is progressing.</td></tr>
<tr><td><b>b</b></td><td>TCP state-bypass or nailed</td><td>State checks are disabled for this flow by policy.</td></tr>
<tr><td><b>X</b></td><td>inspected by service module</td><td>Sent to a module such as a FirePOWER service module.</td></tr></table>
<p>The pattern matters more than each letter. <b>UIO</b> is a healthy, two-way conversation. An entry <b>without U</b> but with A or a is <b>embryonic</b> (half-open): you will see combinations such as <code>saA</code> on hardware, and <code>SaAB</code> for a half-open flow in the lab simulator. Older 8.x software printed the same idea with inside and outside wording, so always read the legend that <code>show conn detail</code> prints for your release.</p>

<h3>Narrowing the table</h3>
<pre class="code"><span class="c">! only the flows of one host, or one port</span>
show conn address 198.51.100.10
show conn port 443
show conn protocol tcp
<span class="c">! count only (a quick load check)</span>
show conn count
<span class="c">! mapped addresses in brackets, uptime and timeout per connection</span>
show conn long
show conn detail
<span class="c">! include connections to and from the ASA itself</span>
show conn all</pre>
<pre class="out">NK-ASA# show conn detail
2 in use, 2 most used
Flags: A - awaiting responder ACK to SYN, a - awaiting initiator ACK to SYN,
       ...
       I - initiator data, i - incomplete, O - responder data, U - up, ...

TCP outside: 198.51.100.10/55191 dmz: 10.0.2.10/443,
    flags UIO, idle 2s, uptime 2s, <span class="hl">timeout 1h0m</span>, bytes 600
  Connection lookup keyid: 71461056</pre>

<h3>Idle timeouts</h3>
<p>Every connection and translation has an idle timer. Defaults: TCP connections 1 hour (<code>timeout conn 1:00:00</code>), UDP 2 minutes, ICMP 2 seconds, dynamic xlates 3 hours and PAT xlates 30 seconds. A half-open TCP connection is removed after 30 seconds (the embryonic timeout). <code>show running-config timeout</code> shows yours. Idle timers explain "my database session drops every hour": the application sent nothing for an hour, and the ASA forgot the connection.</p>

<h3>show xlate</h3>
<pre class="out">NK-ASA# show xlate
2 in use, 2 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">NAT from dmz:10.0.2.10 to outside:203.0.113.3</span>
    flags s idle 0:00:00 timeout 0:00:00
<span class="hl">TCP PAT from inside:10.0.1.10/64251 to outside:203.0.113.2/60001 flags ri</span> idle 0:00:01 timeout 0:00:30</pre>
<p>The first entry is the static publishing of WEB (flag <b>s</b>, no timeout: statics are permanent). The second is PC1 using interface PAT (flags <b>r</b> portmap and <b>i</b> dynamic), with the 30-second PAT timeout. Other flags: <b>I</b> identity NAT, <b>T</b> twice NAT, <b>e</b> extended, <b>D</b> DNS rewrite, <b>N</b> net-to-net. For per-rule counters use <code>show nat</code> or <code>show nat detail</code>: <code>translate_hits</code> counts flows leaving through the rule and <code>untranslate_hits</code> counts flows arriving to the mapped address.</p>

<div class="eg"><p><b>Worked example.</b> After the portal fix, <code>show nat</code> shows rule 1 <code>(dmz) to (outside) source static WEB 203.0.113.3</code> with <code>untranslate_hits = 2</code>: two inbound flows arrived for the public address. <code>show conn address 10.0.2.10</code> shows two TCP entries with flags UIO and bytes 600. <code>show xlate</code> shows the static entry. Three tables, one consistent story: the partner connects, the server answers, data flows both ways.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running <code>clear conn</code> or <code>clear xlate</code> without arguments on a production firewall "to refresh things". Both remove state for every user; clearing xlates also removes the connections that use them. Always scope it: <code>clear conn address 198.51.100.10</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show conn</code> lists real addresses; the public address of a statically translated server does not appear in the plain output. Look for it in <code>show xlate</code> or <code>show conn long</code>. Also: a TCP entry without the U flag is not established, no matter how many seconds it has existed.</p></div>

<div class="scn"><h4>Half-open to the payment gateway</h4><p>Checkout pages hung for 30 seconds and then failed. <code>show conn address 192.0.2.80</code> on the edge ASA showed dozens of TCP entries toward the payment gateway on 443, bytes 0, flags <code>saA</code>, none with U. SYNs were leaving but no SYN-ACK returned. An egress capture confirmed the SYNs left with the correct PAT address, 203.0.113.2. The payment provider had rotated their allow list and dropped the company's public address. After the provider re-added it, new entries appeared with UIO.</p><p><b>Lesson:</b> embryonic flags plus bytes 0 mean the far end is silent. Prove the packet left correctly, then call the far end.</p></div>

<div class="iv"><p class="q">"What do the flags UIO mean in show conn, and what would worry you instead?"</p><p>U up, I initiator data, O responder data: an established TCP connection with data in both directions. Worrying signs are entries without U and with A or a (embryonic, the handshake never finished), bytes 0, and many such entries toward one destination. Mention that the output shows real addresses, that <code>show conn detail</code> prints the legend and timeouts, and that you would scope any clear command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show conn</code>: protocol, both ends with real addresses, idle, bytes, flags.</li>
<li>UIO = healthy; no U with A or a = embryonic handshake.</li>
<li>Filter with address, port, protocol; use detail and long for timers and mapped addresses.</li>
<li><code>show xlate</code>: s static, r portmap, i dynamic; PAT xlates time out after 30 seconds by default.</li>
<li>Scope every clear command to a host or port.</li>
</ul></div>
`,hi:`
<p>Hotel reception do register rakhta hai. <b>Guest register</b> batata hai ki abhi kaun ruka hai, kis room mein, kab se, aur kya unka check-in poora hua ya woh abhi key ka intezaar kar rahe hain. <b>Key book</b> record karti hai ki kaunsa bahar ka naam kis room number se juda hai. ASA par guest register <b>connection table</b> (<code>show conn</code>) hai aur key book <b>translation table</b> (<code>show xlate</code>). packet-tracer batata hai ki kya hona chahiye; yeh do tables batati hain ki abhi <b>kya ho raha hai</b>.</p>

<h3>Connection line padhna</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="show conn line anatomy">
<rect x="10" y="40" width="50" height="40" rx="6" fill="#e2e8f0"/><text x="35" y="65" text-anchor="middle" class="svg-ink" font-size="13">TCP</text>
<rect x="68" y="40" width="190" height="40" rx="6" fill="#bae6fd"/><text x="163" y="65" text-anchor="middle" class="svg-ink" font-size="13">outside 198.51.100.10:55191</text>
<rect x="266" y="40" width="140" height="40" rx="6" fill="#ddd6fe"/><text x="336" y="65" text-anchor="middle" class="svg-ink" font-size="13">dmz 10.0.2.10:443</text>
<rect x="414" y="40" width="80" height="40" rx="6" fill="#e2e8f0"/><text x="454" y="65" text-anchor="middle" class="svg-ink" font-size="13">idle 0:00:02</text>
<rect x="502" y="40" width="64" height="40" rx="6" fill="#e2e8f0"/><text x="534" y="65" text-anchor="middle" class="svg-ink" font-size="13">bytes 600</text>
<rect x="574" y="40" width="58" height="40" rx="6" fill="#bbf7d0"/><text x="603" y="65" text-anchor="middle" class="svg-ink" font-size="13">UIO</text>
<text x="35" y="105" text-anchor="middle" class="svg-muted" font-size="12">protocol</text>
<text x="163" y="105" text-anchor="middle" class="svg-muted" font-size="12">kam security side</text>
<text x="336" y="105" text-anchor="middle" class="svg-muted" font-size="12">oonchi side, real IP</text>
<text x="454" y="105" text-anchor="middle" class="svg-muted" font-size="12">aakhri pkt se</text>
<text x="534" y="105" text-anchor="middle" class="svg-muted" font-size="12">dono taraf</text>
<text x="603" y="105" text-anchor="middle" class="svg-muted" font-size="12">flags</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Server 10.0.2.10 (real) dikhta hai, 203.0.113.3 nahi; mapped address show xlate ya show conn long deta hai</text>
</svg><p class="cap">Har connection ki ek line: protocol, interface names ke saath dono ends, idle time, bytes aur state flags.</p></div>

<pre class="out">NK-ASA# show conn
2 in use, 2 most used

TCP outside  198.51.100.10:58140 dmz  10.0.2.10:443, idle 0:00:03, bytes 600, <span class="hl">flags UIO</span>
TCP outside  198.51.100.10:55191 dmz  10.0.2.10:443, idle 0:00:02, bytes 600, <span class="hl">flags UIO</span></pre>
<p>Header current count aur counters clear hone ke baad ka peak deta hai. Kam security wala interface pehle list hota hai. Addresses har side par <b>real</b> addresses hain.</p>

<h3>TCP flags decode</h3>
<table class="cmp"><tr><th>Flag</th><th>Matlab (9.x wording)</th><th>Kya batata hai</th></tr>
<tr><td><b>U</b></td><td>up</td><td>Handshake poora hua; connection established hai.</td></tr>
<tr><td><b>I</b></td><td>initiator data</td><td>Jis side ne connection khola usne data bheja hai.</td></tr>
<tr><td><b>O</b></td><td>responder data</td><td>Server side ne data wapas bheja hai.</td></tr>
<tr><td><b>A</b></td><td>awaiting responder ACK to SYN</td><td>SYN guzar gaya, server ne jawab nahi diya: embryonic.</td></tr>
<tr><td><b>a</b></td><td>awaiting initiator ACK to SYN</td><td>SYN-ACK wapas aaya, client ne final ACK kabhi nahi bheja.</td></tr>
<tr><td><b>F / f</b></td><td>initiator FIN / responder FIN</td><td>Ek side ne band karna shuru kiya.</td></tr>
<tr><td><b>R / r</b></td><td>initiator / responder acknowledged FIN</td><td>Close aage badh raha hai.</td></tr>
<tr><td><b>b</b></td><td>TCP state-bypass or nailed</td><td>Policy se is flow ke liye state checks band hain.</td></tr>
<tr><td><b>X</b></td><td>inspected by service module</td><td>Kisi module, jaise FirePOWER service module, ko bheja gaya.</td></tr></table>
<p>Har letter se zyada pattern matter karta hai. <b>UIO</b> ek healthy, do-tarfa baatcheet hai. <b>U ke bina</b> par A ya a wali entry <b>embryonic</b> (half-open) hai: hardware par aapko <code>saA</code> jaise combinations dikhenge, aur lab simulator mein half-open flow ke liye <code>SaAB</code>. Purana 8.x software yahi idea inside aur outside wording ke saath print karta tha, isliye hamesha woh legend padho jo <code>show conn detail</code> aapke release ke liye print karta hai.</p>

<h3>Table ko chhota karna</h3>
<pre class="code"><span class="c">! sirf ek host ke flows, ya ek port</span>
show conn address 198.51.100.10
show conn port 443
show conn protocol tcp
<span class="c">! sirf count (jaldi load check)</span>
show conn count
<span class="c">! brackets mein mapped addresses, har connection ka uptime aur timeout</span>
show conn long
show conn detail
<span class="c">! khud ASA ke to aur from connections bhi shaamil karo</span>
show conn all</pre>
<pre class="out">NK-ASA# show conn detail
2 in use, 2 most used
Flags: A - awaiting responder ACK to SYN, a - awaiting initiator ACK to SYN,
       ...
       I - initiator data, i - incomplete, O - responder data, U - up, ...

TCP outside: 198.51.100.10/55191 dmz: 10.0.2.10/443,
    flags UIO, idle 2s, uptime 2s, <span class="hl">timeout 1h0m</span>, bytes 600
  Connection lookup keyid: 71461056</pre>

<h3>Idle timeouts</h3>
<p>Har connection aur translation ka ek idle timer hota hai. Defaults: TCP connections 1 ghanta (<code>timeout conn 1:00:00</code>), UDP 2 minute, ICMP 2 second, dynamic xlates 3 ghante aur PAT xlates 30 second. Half-open TCP connection 30 second baad hat jaata hai (embryonic timeout). <code>show running-config timeout</code> aapke timers dikhata hai. Idle timers "mera database session har ghante drop hota hai" ko samjhate hain: application ne ek ghante tak kuch nahi bheja, aur ASA connection bhool gaya.</p>

<h3>show xlate</h3>
<pre class="out">NK-ASA# show xlate
2 in use, 2 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
<span class="hl">NAT from dmz:10.0.2.10 to outside:203.0.113.3</span>
    flags s idle 0:00:00 timeout 0:00:00
<span class="hl">TCP PAT from inside:10.0.1.10/64251 to outside:203.0.113.2/60001 flags ri</span> idle 0:00:01 timeout 0:00:30</pre>
<p>Pehli entry WEB ki static publishing hai (flag <b>s</b>, koi timeout nahi: statics permanent hote hain). Doosri PC1 hai jo interface PAT use kar raha hai (flags <b>r</b> portmap aur <b>i</b> dynamic), 30-second PAT timeout ke saath. Baaki flags: <b>I</b> identity NAT, <b>T</b> twice NAT, <b>e</b> extended, <b>D</b> DNS rewrite, <b>N</b> net-to-net. Per-rule counters ke liye <code>show nat</code> ya <code>show nat detail</code> use karo: <code>translate_hits</code> rule se nikalne wale flows ginta hai aur <code>untranslate_hits</code> mapped address par aane wale flows.</p>

<div class="eg"><p><b>Worked example.</b> Portal fix ke baad <code>show nat</code> rule 1 <code>(dmz) to (outside) source static WEB 203.0.113.3</code> ko <code>untranslate_hits = 2</code> ke saath dikhata hai: public address ke liye do inbound flows aaye. <code>show conn address 10.0.2.10</code> flags UIO aur bytes 600 wali do TCP entries dikhata hai. <code>show xlate</code> static entry dikhata hai. Teen tables, ek consistent kahani: partner connect karta hai, server jawab deta hai, data dono taraf behta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Production firewall par "cheezein refresh karne" ke liye bina arguments ke <code>clear conn</code> ya <code>clear xlate</code> chalana. Dono har user ka state hata dete hain; xlates clear karna unhe use karne wale connections bhi hata deta hai. Hamesha scope karo: <code>clear conn address 198.51.100.10</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show conn</code> real addresses list karta hai; statically translated server ka public address plain output mein nahi dikhta. Use <code>show xlate</code> ya <code>show conn long</code> mein dhoondho. Aur: U flag ke bina TCP entry established nahi hai, chahe woh kitne bhi seconds se exist kar rahi ho.</p></div>

<div class="scn"><h4>Payment gateway tak half-open</h4><p>Checkout pages 30 second latakte aur phir fail ho jaate. Edge ASA par <code>show conn address 192.0.2.80</code> ne payment gateway ki taraf 443 par darjanon TCP entries dikhayi, bytes 0, flags <code>saA</code>, kisi mein U nahi. SYNs nikal rahe the par koi SYN-ACK wapas nahi aa raha tha. Egress capture ne confirm kiya ki SYNs sahi PAT address, 203.0.113.2, ke saath nikle. Payment provider ne apni allow list rotate ki thi aur company ka public address gira diya tha. Provider ke use wapas jodne ke baad nayi entries UIO ke saath dikhi.</p><p><b>Seekh:</b> embryonic flags plus bytes 0 matlab doosra sira chup hai. Saabit karo ki packet sahi nikla, phir doosre sire ko call karo.</p></div>

<div class="iv"><p class="q">"show conn mein flags UIO ka kya matlab hai, aur iski jagah kya dekh kar aap chintit hoge?"</p><p>U up, I initiator data, O responder data: dono directions mein data wala established TCP connection. Chinta ke sign hain U ke bina aur A ya a wali entries (embryonic, handshake kabhi poora nahi hua), bytes 0, aur ek destination ki taraf aisi bahut saari entries. Mention karo ki output real addresses dikhata hai, <code>show conn detail</code> legend aur timeouts print karta hai, aur aap koi bhi clear command scope karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show conn</code>: protocol, real addresses ke saath dono ends, idle, bytes, flags.</li>
<li>UIO = healthy; U ke bina A ya a = embryonic handshake.</li>
<li>address, port, protocol se filter karo; timers aur mapped addresses ke liye detail aur long use karo.</li>
<li><code>show xlate</code>: s static, r portmap, i dynamic; PAT xlates default mein 30 second baad timeout hote hain.</li>
<li>Har clear command ko ek host ya port tak scope karo.</li>
</ul></div>
`}};export{e as default};