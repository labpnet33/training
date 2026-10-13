var e={id:`udp-icmp-apps`,h:{en:`UDP, ICMP, timeouts and inspection engines`,hi:`UDP, ICMP, timeouts aur inspection engines`},body:{en:`
<p>TCP is a polite guest: it knocks (SYN), waits to be let in (SYN-ACK), and says goodbye (FIN). UDP just walks in and out with no greeting at all, ICMP is a courier who delivers notes about other conversations, and some applications, like FTP and voice calls, arrange a <i>second</i> meeting in a different room during the first one. A stateful firewall must handle all of them. This chapter shows how.</p>

<h3>UDP: pseudo-state</h3>
<p>UDP has no handshake and no close. The firewall still creates a connection entry when the first allowed packet passes, keyed on the same 5-tuple. A reply with the source and destination swapped matches the entry and is allowed back. Because there is no FIN, the only way the entry ends is the <b>idle timeout</b>: 2 minutes by default on the ASA. This "remember it until it goes quiet" approach is called <b>pseudo-state</b> or a UDP pseudo-connection.</p>

<h3>ICMP: off by default on the ASA</h3>
<p>ICMP echo (ping) is a request and a reply, so it can be tracked by identifier and sequence number. But the ASA does <b>not</b> track ICMP statefully by default. The echo request from inside leaves (high to low security), yet the echo reply from outside has no matching entry and is dropped. Two fixes exist; the correct one is to enable ICMP inspection, which is what the lab configuration does:</p>
<pre class="code"><span class="c">! Add ICMP to the default inspection class</span>
policy-map global_policy
 class inspection_default
  inspect icmp
  inspect icmp error</pre>
<p><code>inspect icmp</code> creates a short-lived entry per echo so exactly one reply returns. <code>inspect icmp error</code> goes further: it lets ICMP error messages (TTL exceeded, unreachable) back in only when they refer to a real connection, and translates the addresses embedded inside them, which makes traceroute work through NAT. The lazy alternative, an outside ACL that permits all echo-replies, opens a hole for everyone.</p>

<div class="eg"><p><b>Worked example: the ping that "fails" but the web works.</b> PC1 can open the page on 8.8.8.8 but ping fails. The log shows <code>%ASA-3-106014: Deny inbound icmp src outside:8.8.8.8 dst outside:203.0.113.2 (type 0, code 0)</code>. The echo reply is arriving and being denied because nothing tracks it. After adding <code>inspect icmp</code>, <code>show conn</code> briefly shows an ICMP entry and ping succeeds.</p></div>

<h3>Timeouts: how long the register remembers</h3>
<pre class="out">NK-ASA# show running-config timeout
timeout xlate 3:00:00
timeout pat-xlate 0:00:30
<span class="hl">timeout conn 1:00:00 half-closed 0:10:00 udp 0:02:00 sctp 0:02:00 icmp 0:00:02</span>
timeout sunrpc 0:10:00 h323 0:05:00 h225 1:00:00 mgcp 0:05:00 mgcp-pat 0:05:00
timeout sip 0:30:00 sip_media 0:02:00 sip-invite 0:03:00 sip-disconnect 0:02:00</pre>
<p>TCP idle 1 hour, half-closed 10 minutes, UDP 2 minutes, ICMP 2 seconds, PAT translations 30 seconds after their last connection closes. Change them per traffic class with MPF when one application needs it; changing them globally makes the table grow for everyone.</p>

<h3>Why some applications need inspection engines</h3>
<p>Some protocols break the simple one-connection model. They use a <b>control channel</b> to negotiate a <b>secondary channel</b> on ports that nobody could predict, and some write IP addresses <b>inside the payload</b>, which NAT would otherwise leave wrong. An <b>inspection engine</b> (Cisco also calls it application inspection; on routers, an application layer gateway or ALG) reads the control channel, opens a precise temporary <b>pinhole</b> for the secondary channel, and fixes embedded addresses.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="FTP inspection opening a pinhole">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="265" y="50" width="110" height="90" rx="8" fill="#fed7aa"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">ASA</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">inspect ftp</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">reads PORT/PASV</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="575" y="100" text-anchor="middle" class="svg-ink" font-size="13">FTP server</text>
<line x1="120" y1="80" x2="265" y2="80" stroke="#64748b"/><line x1="375" y1="80" x2="520" y2="80" stroke="#64748b"/>
<text x="190" y="72" text-anchor="middle" class="svg-accent" font-size="12">control TCP 21</text>
<line x1="120" y1="112" x2="265" y2="112" stroke="#64748b" stroke-dasharray="5 4"/><line x1="375" y1="112" x2="520" y2="112" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="450" y="135" text-anchor="middle" class="svg-accent" font-size="12">data: pinhole</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Pinhole = one exact address and port, only for this session, closed after use</text>
</svg><p class="cap">The engine reads the port negotiated on the control channel and opens only that one data connection.</p></div>

<table class="cmp"><tr><th>Protocol</th><th>The problem</th><th>What inspection does</th></tr>
<tr><td><b>FTP</b> (TCP 21)</td><td>Active mode: the server connects back to a port the client announced in a PORT command. Passive mode: the client connects to a port the server announced in a 227 PASV reply. Both carry an IP address inside the text.</td><td>Reads PORT/PASV, opens a pinhole for exactly that data connection, rewrites the embedded IP when NAT is used, and can block dangerous commands.</td></tr>
<tr><td><b>DNS</b> (UDP 53)</td><td>Replies could be spoofed or oversized; UDP entries would linger for 2 minutes.</td><td>Matches the reply ID to the query, allows only one reply per query (DNS Guard) then tears the entry down, enforces message length, and can rewrite A records for NAT.</td></tr>
<tr><td><b>SIP</b> (UDP/TCP 5060)</td><td>The call setup carries an SDP body listing the IPs and RTP media ports for voice and video.</td><td>Reads SDP, opens pinholes for the media streams, fixes addresses for NAT. It cannot see inside SIP over TLS (5061) without decryption.</td></tr>
</table>

<h3>The Modular Policy Framework, briefly</h3>
<p>On the ASA, inspection lives in the <b>Modular Policy Framework (MPF)</b>: a <code>class-map</code> selects traffic, a <code>policy-map</code> says what to do with it (inspect, set connection limits and timeouts), and a <code>service-policy</code> applies it globally or to one interface. The factory configuration already has <code>class-map inspection_default</code> (matching default-inspection-traffic), a <code>policy-map global_policy</code> with common engines such as dns, ftp, sip, esmtp and tftp, and <code>service-policy global_policy global</code>. ICMP is <b>not</b> in the default list.</p>
<pre class="out">NK-ASA# show service-policy
Global policy:
  Service-policy: global_policy
    Class-map: inspection_default
<span class="hl">      Inspect: icmp, packet 8, lock fail 0, drop 0, reset-drop 0</span></pre>

<div class="warn"><p><b>Common mistake.</b> Opening a wide range of high ports "for FTP data" or "for voice media" in an ACL. That is what inspection exists to avoid. Enable the engine and let it open pinholes per session.</p></div>

<div class="exam"><p><b>Exam trap.</b> Inspection engines cannot read encrypted control channels (FTPS, SIP over TLS) unless the firewall decrypts them. And the ASA's default ICMP behaviour is <b>not stateful</b>: expect a question where ping replies are dropped until <code>inspect icmp</code> is added.</p></div>

<div class="scn"><h4>Calls with one-way audio</h4><p>After a firewall migration, IP phones at a branch could ring and connect calls, but callers heard silence in one direction. The SIP signalling passed (it was permitted on 5060), but <code>show service-policy</code> showed no SIP inspection on the new device, so the RTP media ports announced in SDP were never opened and NAT left private addresses inside the SDP. Enabling <code>inspect sip</code> in global_policy fixed audio on the next call.</p><p><b>Lesson:</b> "signalling works, media fails" points straight at application inspection.</p></div>

<div class="iv"><p class="q">"Why does FTP need special handling on a firewall?"</p><p>FTP uses a control channel on TCP 21 and a separate data channel whose port is negotiated inside the control channel (PORT for active, PASV for passive), and it embeds IP addresses in that text. A plain stateful firewall cannot predict the data port and NAT would break the embedded address. FTP inspection reads the negotiation, opens a one-off pinhole and rewrites addresses. Mention that the same idea applies to SIP media and that encryption blinds the engine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UDP uses pseudo-state: entries built on the first packet and removed by the idle timeout (2 minutes).</li>
<li>ASA ICMP is not stateful by default; <code>inspect icmp</code> (and <code>inspect icmp error</code>) fixes replies and traceroute.</li>
<li>Default timeouts: TCP 1 h, half-closed 10 min, UDP 2 min, ICMP 2 s, PAT xlate 30 s.</li>
<li>Inspection engines follow control channels, open pinholes and fix embedded addresses (FTP, DNS, SIP).</li>
<li>MPF = class-map, policy-map, service-policy; global_policy is on by default.</li>
</ul></div>
`,hi:`
<p>TCP ek tameezdaar mehmaan hai: darwaza khatkhatata hai (SYN), andar bulaye jaane ka intezaar karta hai (SYN-ACK), aur alvida kehta hai (FIN). UDP bina kisi namaste ke andar-bahar chala jaata hai, ICMP ek courier hai jo doosri baatcheeton ke baare mein notes deta hai, aur kuch applications, jaise FTP aur voice calls, pehli meeting ke dauraan hi kisi doosre kamre mein <i>doosri</i> meeting tay kar leti hain. Stateful firewall ko in sabko handle karna hota hai. Yeh chapter dikhata hai kaise.</p>

<h3>UDP: pseudo-state</h3>
<p>UDP mein na handshake hai na close. Phir bhi pehla allowed packet guzarne par firewall connection entry banata hai, usi 5-tuple par. Source aur destination swap kiya hua reply entry se match hota hai aur wapas allow hota hai. Kyunki FIN nahi hai, entry khatam hone ka ek hi tareeka hai <b>idle timeout</b>: ASA par default 2 minute. "Jab tak chup na ho jaaye tab tak yaad rakho" wale is approach ko <b>pseudo-state</b> ya UDP pseudo-connection kehte hain.</p>

<h3>ICMP: ASA par default mein off</h3>
<p>ICMP echo (ping) ek request aur ek reply hai, isliye use identifier aur sequence number se track kiya ja sakta hai. Lekin ASA default mein ICMP ko statefully track <b>nahi</b> karta. Inside se echo request bahar chali jaati hai (high se low security), lekin outside se aaye echo reply ki koi matching entry nahi hoti aur woh drop hota hai. Do fixes hain; sahi wala hai ICMP inspection enable karna, jo lab configuration karti hai:</p>
<pre class="code"><span class="c">! Default inspection class mein ICMP jodo</span>
policy-map global_policy
 class inspection_default
  inspect icmp
  inspect icmp error</pre>
<p><code>inspect icmp</code> har echo ke liye thodi der ki entry banata hai taaki exactly ek reply wapas aaye. <code>inspect icmp error</code> aur aage jaata hai: yeh ICMP error messages (TTL exceeded, unreachable) ko sirf tab andar aane deta hai jab woh kisi asli connection ke baare mein hon, aur unke andar embed hue addresses translate karta hai, jisse NAT ke through traceroute chalta hai. Aalsi alternative, outside ACL jo saare echo-replies permit kare, sabke liye ek hole khol deta hai.</p>

<div class="eg"><p><b>Worked example: ping "fail" hota hai lekin web chalta hai.</b> PC1 8.8.8.8 ka page khol sakta hai lekin ping fail hota hai. Log dikhata hai <code>%ASA-3-106014: Deny inbound icmp src outside:8.8.8.8 dst outside:203.0.113.2 (type 0, code 0)</code>. Echo reply aa raha hai aur deny ho raha hai kyunki use koi track nahi karta. <code>inspect icmp</code> jodne ke baad, <code>show conn</code> thodi der ke liye ICMP entry dikhata hai aur ping succeed hota hai.</p></div>

<h3>Timeouts: register kitni der yaad rakhta hai</h3>
<pre class="out">NK-ASA# show running-config timeout
timeout xlate 3:00:00
timeout pat-xlate 0:00:30
<span class="hl">timeout conn 1:00:00 half-closed 0:10:00 udp 0:02:00 sctp 0:02:00 icmp 0:00:02</span>
timeout sunrpc 0:10:00 h323 0:05:00 h225 1:00:00 mgcp 0:05:00 mgcp-pat 0:05:00
timeout sip 0:30:00 sip_media 0:02:00 sip-invite 0:03:00 sip-disconnect 0:02:00</pre>
<p>TCP idle 1 ghanta, half-closed 10 minute, UDP 2 minute, ICMP 2 second, PAT translations apne aakhri connection ke band hone ke 30 second baad. Jab kisi ek application ko zaroorat ho to inhe MPF se har traffic class ke liye badlo; globally badalne se sabke liye table badi ho jaati hai.</p>

<h3>Kuch applications ko inspection engines kyun chahiye</h3>
<p>Kuch protocols simple one-connection model tod dete hain. Woh ek <b>control channel</b> use karke aise ports par <b>secondary channel</b> negotiate karte hain jinhe koi predict nahi kar sakta, aur kuch IP addresses <b>payload ke andar</b> likhte hain, jinhe NAT warna galat chhod deta. <b>Inspection engine</b> (Cisco ise application inspection bhi kehta hai; routers par application layer gateway ya ALG) control channel padhta hai, secondary channel ke liye ek precise temporary <b>pinhole</b> kholta hai, aur embed hue addresses theek karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="FTP inspection pinhole kholta hai">
<rect x="10" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="265" y="50" width="110" height="90" rx="8" fill="#fed7aa"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">ASA</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">inspect ftp</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">PORT/PASV padhta hai</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="575" y="100" text-anchor="middle" class="svg-ink" font-size="13">FTP server</text>
<line x1="120" y1="80" x2="265" y2="80" stroke="#64748b"/><line x1="375" y1="80" x2="520" y2="80" stroke="#64748b"/>
<text x="190" y="72" text-anchor="middle" class="svg-accent" font-size="12">control TCP 21</text>
<line x1="120" y1="112" x2="265" y2="112" stroke="#64748b" stroke-dasharray="5 4"/><line x1="375" y1="112" x2="520" y2="112" stroke="#64748b" stroke-dasharray="5 4"/>
<text x="450" y="135" text-anchor="middle" class="svg-accent" font-size="12">data: pinhole</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Pinhole = ek exact address aur port, sirf is session ke liye, use ke baad band</text>
</svg><p class="cap">Engine control channel par negotiate hua port padhta hai aur sirf woh ek data connection kholta hai.</p></div>

<table class="cmp"><tr><th>Protocol</th><th>Problem</th><th>Inspection kya karta hai</th></tr>
<tr><td><b>FTP</b> (TCP 21)</td><td>Active mode: server us port par wapas connect karta hai jo client ne PORT command mein bataya. Passive mode: client us port par connect karta hai jo server ne 227 PASV reply mein bataya. Dono text ke andar IP address le jaate hain.</td><td>PORT/PASV padhta hai, exactly us data connection ke liye pinhole kholta hai, NAT use hone par embed hua IP rewrite karta hai, aur khatarnaak commands block kar sakta hai.</td></tr>
<tr><td><b>DNS</b> (UDP 53)</td><td>Replies spoof ya oversized ho sakte the; UDP entries 2 minute tak latki rehtin.</td><td>Reply ID ko query se match karta hai, har query ke liye sirf ek reply allow karta hai (DNS Guard) phir entry hata deta hai, message length enforce karta hai, aur NAT ke liye A records rewrite kar sakta hai.</td></tr>
<tr><td><b>SIP</b> (UDP/TCP 5060)</td><td>Call setup ek SDP body le jaata hai jismein voice aur video ke IPs aur RTP media ports hote hain.</td><td>SDP padhta hai, media streams ke liye pinholes kholta hai, NAT ke liye addresses theek karta hai. SIP over TLS (5061) ke andar bina decryption nahi dekh sakta.</td></tr>
</table>

<h3>Modular Policy Framework, sankshep mein</h3>
<p>ASA par inspection <b>Modular Policy Framework (MPF)</b> mein rehta hai: <code>class-map</code> traffic chunta hai, <code>policy-map</code> batata hai ki uske saath kya karna hai (inspect, connection limits aur timeouts set karna), aur <code>service-policy</code> use globally ya ek interface par lagata hai. Factory configuration mein pehle se <code>class-map inspection_default</code> (default-inspection-traffic match karta hua), dns, ftp, sip, esmtp aur tftp jaise common engines wala <code>policy-map global_policy</code>, aur <code>service-policy global_policy global</code> hota hai. ICMP default list mein <b>nahi</b> hai.</p>
<pre class="out">NK-ASA# show service-policy
Global policy:
  Service-policy: global_policy
    Class-map: inspection_default
<span class="hl">      Inspect: icmp, packet 8, lock fail 0, drop 0, reset-drop 0</span></pre>

<div class="warn"><p><b>Common galti.</b> ACL mein "FTP data ke liye" ya "voice media ke liye" high ports ki badi range khol dena. Inspection isi se bachne ke liye bana hai. Engine enable karo aur use har session ke liye pinholes kholne do.</p></div>

<div class="exam"><p><b>Exam trap.</b> Inspection engines encrypted control channels (FTPS, SIP over TLS) nahi padh sakte jab tak firewall unhe decrypt na kare. Aur ASA ka default ICMP behaviour <b>stateful nahi</b> hai: aisa question expect karo jismein <code>inspect icmp</code> jodne tak ping replies drop hote hain.</p></div>

<div class="scn"><h4>One-way audio wali calls</h4><p>Firewall migration ke baad, ek branch ke IP phones ring karke calls connect kar pa rahe the, lekin callers ko ek direction mein khamoshi sunai deti thi. SIP signalling jaa rahi thi (5060 par permitted thi), lekin <code>show service-policy</code> ne naye device par koi SIP inspection nahi dikhaya, isliye SDP mein bataye gaye RTP media ports kabhi khule hi nahi aur NAT ne SDP ke andar private addresses chhod diye. global_policy mein <code>inspect sip</code> enable karne se agli call par audio theek ho gaya.</p><p><b>Seekh:</b> "signalling chalti hai, media fail hota hai" seedha application inspection ki taraf ishaara karta hai.</p></div>

<div class="iv"><p class="q">"Firewall par FTP ko special handling kyun chahiye?"</p><p>FTP TCP 21 par control channel aur ek alag data channel use karta hai jiska port control channel ke andar negotiate hota hai (active ke liye PORT, passive ke liye PASV), aur woh us text mein IP addresses embed karta hai. Plain stateful firewall data port predict nahi kar sakta aur NAT embed hua address tod dega. FTP inspection negotiation padhta hai, ek baar ka pinhole kholta hai aur addresses rewrite karta hai. Batao ki yahi idea SIP media par lagta hai aur encryption engine ko andha kar deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UDP pseudo-state use karta hai: pehle packet par entry banti hai aur idle timeout (2 minute) se hat jaati hai.</li>
<li>ASA ICMP default mein stateful nahi hai; <code>inspect icmp</code> (aur <code>inspect icmp error</code>) replies aur traceroute theek karte hain.</li>
<li>Default timeouts: TCP 1 h, half-closed 10 min, UDP 2 min, ICMP 2 s, PAT xlate 30 s.</li>
<li>Inspection engines control channels follow karte hain, pinholes kholte hain aur embed hue addresses theek karte hain (FTP, DNS, SIP).</li>
<li>MPF = class-map, policy-map, service-policy; global_policy default mein on hai.</li>
</ul></div>
`}};export{e as default};