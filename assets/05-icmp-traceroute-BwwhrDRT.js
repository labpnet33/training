var e={id:`icmp-traceroute`,h:{en:`ICMP: echo, unreachable codes, TTL exceeded and traceroute`,hi:`ICMP: echo, unreachable codes, TTL exceeded aur traceroute`},body:{en:`
<p>When the post office cannot deliver a letter, it does not simply throw it away. It sends it back with a stamp: "no such street", "addressee unknown", "refused", or "forwarded too many times". The stamp tells you exactly where the problem is. <b>ICMP</b> (Internet Control Message Protocol) is that stamp for IP networks, and a capture lets you read it.</p>

<h3>ICMP basics</h3>
<p>ICMP travels inside IPv4 (IP protocol number <b>1</b>). Every ICMP message starts with a <b>Type</b> and a <b>Code</b>. The type says what kind of message it is; the code adds detail. These are the ones you must know:</p>
<table class="cmp"><tr><th>Type</th><th>Code</th><th>Meaning</th><th>Who sends it</th></tr>
<tr><td><b>8</b></td><td>0</td><td>Echo request (ping)</td><td>The pinging host</td></tr>
<tr><td><b>0</b></td><td>0</td><td>Echo reply</td><td>The pinged host</td></tr>
<tr><td><b>3</b></td><td>0</td><td>Network unreachable</td><td>A router with no route to the destination</td></tr>
<tr><td>3</td><td>1</td><td>Host unreachable</td><td>The last router, when the host does not answer ARP</td></tr>
<tr><td>3</td><td>3</td><td>Port unreachable</td><td>The destination host: nothing listens on that UDP port</td></tr>
<tr><td>3</td><td>4</td><td>Fragmentation needed and DF set</td><td>A router whose next link MTU is too small</td></tr>
<tr><td>3</td><td>13</td><td>Communication administratively prohibited</td><td>A router or firewall whose ACL denied the packet</td></tr>
<tr><td><b>11</b></td><td>0</td><td>Time to live exceeded in transit</td><td>A router that decremented TTL to 0</td></tr>
<tr><td>5</td><td>0-3</td><td>Redirect</td><td>A router telling a host about a better gateway</td></tr>
</table>

<h3>Reading echo request and reply</h3>
<p>Each echo carries an <b>Identifier</b> and a <b>Sequence number</b>. The reply copies both, so you can pair them even in a busy capture. The Info column in the lab viewer reads like <code>Echo (ping) request  id=0x1a2b, seq=1, ttl=64</code>. The time difference between a request and its reply is the round-trip time.</p>
<p>The <b>TTL</b> of the reply also tells a story. Hosts start with well-known values: Linux and most network appliances 64, Windows 128, Cisco IOS 255. A reply arriving with TTL 62 left a Linux-like host 2 router hops away. A sudden change in TTL for the same destination means the path changed.</p>

<h3>Why errors are so useful in a capture</h3>
<p>An ICMP error message carries the <b>original IP header plus the first 8 bytes</b> of the packet that caused it. Expand it in the details pane and you can see exactly which packet failed: its source, destination and, for TCP or UDP, its ports. So when a type 3 code 13 arrives, you know which router refused it (the source of the ICMP) and which flow was refused (inside it).</p>

<pre class="out">R1# ping 198.51.100.20
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 198.51.100.20, timeout is 2 seconds:
<span class="hl">U.U.U</span>
Success rate is 0 percent (0/5)</pre>
<p>IOS prints <code>!</code> for a reply, <code>.</code> for a timeout, <code>U</code> when an unreachable came back and <code>M</code> for "could not fragment". The pattern <code>U.U.U</code> is classic: a router is returning unreachables, but IOS rate-limits ICMP errors (by default one per 500 ms), so every second probe times out. On a router, <code>no ip unreachables</code> on an interface stops it sending type 3 messages, which turns a clear "U" into silent dots.</p>

<h3>TTL exceeded and traceroute</h3>
<p>Every router that forwards an IPv4 packet subtracts 1 from its TTL. If the result is 0, the router drops the packet and sends <b>ICMP type 11 code 0</b> back to the source, from the interface where the packet arrived. That protects the network from packets looping forever. <b>Traceroute</b> abuses this rule on purpose:</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="How traceroute works">
<rect x="10" y="20" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="60" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="270" y="20" width="100" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="530" y="20" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="580" y="45" text-anchor="middle" class="svg-ink" font-size="13">R3 3.3.3.3</text>
<line x1="110" y1="40" x2="270" y2="40" stroke="#64748b" stroke-width="2"/><line x1="370" y1="40" x2="530" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="20" y="95" class="svg-ink" font-size="12">Probe TTL=1  → R2 sets TTL 0, drops it → ICMP 11 from 10.0.12.2</text>
<text x="20" y="130" class="svg-ink" font-size="12">Probe TTL=2  → reaches R3 → ICMP 3 code 3 (port unreachable) from 3.3.3.3</text>
<text x="20" y="165" class="svg-accent" font-size="12">Each hop answers with its own address, so the source learns the path.</text>
<text x="20" y="200" class="svg-muted" font-size="12">Cisco and Linux send UDP probes to high ports; Windows tracert sends ICMP echo.</text>
</svg><p class="cap">Traceroute sends probes with TTL 1, 2, 3… and lists who returns the error at each step.</p></div>
<p>Cisco IOS and Linux send <b>UDP</b> probes to high port numbers (33434 and up), so the destination itself answers with <b>port unreachable</b>, which marks the end of the trace. Windows <code>tracert</code> sends <b>ICMP echo requests</b> instead, so the last hop answers with an echo reply. After you fix Lab 3, a traceroute from R1 looks like this:</p>
<pre class="out">R1# traceroute 3.3.3.3
Type escape sequence to abort.
Tracing the route to 3.3.3.3
VRF info: (vrf in name/id, vrf out name/id)
  <span class="hl">1 10.0.12.2</span> 1 msec 1 msec 0 msec
  <span class="hl">2 10.0.23.2</span> 1 msec 1 msec 1 msec</pre>
<p>The lab PCs also have <code>trace</code>; the last line shows the destination with <code>(ICMP type:3, code:3, Destination port unreachable)</code>, the same end-of-trace signal.</p>

<div class="eg"><p><b>Worked example: a routing loop.</b> A capture on the link between two routers shows the same echo request (same IP ID) passing again and again, its TTL dropping by 2 each time it returns: 63, 61, 59… until an ICMP type 11 appears. A traceroute alternates <code>10.0.12.2</code>, <code>10.0.12.1</code>, <code>10.0.12.2</code>… Two routers point their routes for the destination at each other. One capture line, one TTL column, and the loop is proven.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading <code>* * *</code> in a traceroute as "the packet was dropped here". It only means that hop did not send an ICMP error back, often because a firewall blocks ICMP or the router rate-limits it. If later hops answer, traffic is passing through the silent hop just fine.</p></div>

<div class="exam"><p><b>Exam trap.</b> Echo request is type <b>8</b>, echo reply is type <b>0</b>, not the other way round. Time exceeded is type <b>11</b>. Destination unreachable is type <b>3</b>, and code 3 (port unreachable) comes from the destination host, while codes 0 and 1 come from routers.</p></div>

<div class="scn"><h4>The monitoring server that saw "U"</h4><p>A monitoring server started showing <code>U.U.U</code> when pinging a branch LAN. A capture on the monitoring server's link showed ICMP type 3 code 13 replies whose source was the branch router's WAN address, 203.0.113.2. Inside each error was the original echo request from the monitoring server. A new inbound ACL on the branch router permitted only the head-office subnet and forgot the monitoring subnet. Adding one permit line fixed it.</p><p><b>Lesson:</b> the source of an ICMP error is the device that refused your packet, and the payload tells you which packet it was.</p></div>

<div class="iv"><p class="q">"How does traceroute work, and why does the last hop answer differently?"</p><p>Strong answer: traceroute sends probes with increasing TTL starting at 1. Each router that decrements the TTL to 0 drops the probe and returns ICMP time exceeded (type 11) from its incoming interface, which reveals that hop. On Cisco and Linux the probes are UDP to high ports, so the destination replies with port unreachable (type 3 code 3), ending the trace; Windows uses ICMP echo, so the last hop sends an echo reply. Asterisks mean no ICMP came back from that hop, not necessarily a drop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ICMP rides in IP protocol 1; read Type and Code together.</li>
<li>Type 8/0 = echo request/reply; type 3 = unreachable (0 net, 1 host, 3 port, 4 frag needed, 13 admin prohibited); type 11 = TTL exceeded.</li>
<li>An ICMP error contains the original IP header and 8 bytes: it names the failed flow.</li>
<li>Traceroute uses increasing TTLs; routers answer with type 11, the destination with port unreachable (UDP) or echo reply (Windows).</li>
<li><code>U.U.U</code> means unreachables with rate limiting; <code>* * *</code> means a silent hop, not always a drop.</li>
</ul></div>
`,hi:`
<p>Jab post office koi chitthi deliver nahi kar pata, to use seedha phenk nahi deta. Woh use ek stamp ke saath wapas bhejta hai: "aisi koi gali nahi", "addressee ka pata nahi", "lene se mana kiya", ya "bahut baar forward hui". Stamp batata hai ki problem theek kahan hai. <b>ICMP</b> (Internet Control Message Protocol) IP networks ke liye wahi stamp hai, aur capture aapko use padhne deta hai.</p>

<h3>ICMP basics</h3>
<p>ICMP IPv4 ke andar chalta hai (IP protocol number <b>1</b>). Har ICMP message <b>Type</b> aur <b>Code</b> se shuru hota hai. Type batata hai kis tarah ka message hai; code detail jodta hai. Yeh aapko pata hone chahiye:</p>
<table class="cmp"><tr><th>Type</th><th>Code</th><th>Matlab</th><th>Kaun bhejta hai</th></tr>
<tr><td><b>8</b></td><td>0</td><td>Echo request (ping)</td><td>Ping karne wala host</td></tr>
<tr><td><b>0</b></td><td>0</td><td>Echo reply</td><td>Jise ping kiya woh host</td></tr>
<tr><td><b>3</b></td><td>0</td><td>Network unreachable</td><td>Router jiske paas destination ka route nahi</td></tr>
<tr><td>3</td><td>1</td><td>Host unreachable</td><td>Aakhri router, jab host ARP ka jawab nahi deta</td></tr>
<tr><td>3</td><td>3</td><td>Port unreachable</td><td>Destination host: us UDP port par koi listen nahi kar raha</td></tr>
<tr><td>3</td><td>4</td><td>Fragmentation needed and DF set</td><td>Router jiske agle link ka MTU bahut chhota hai</td></tr>
<tr><td>3</td><td>13</td><td>Communication administratively prohibited</td><td>Router ya firewall jiske ACL ne packet deny kiya</td></tr>
<tr><td><b>11</b></td><td>0</td><td>Time to live exceeded in transit</td><td>Router jisne TTL ghata kar 0 kiya</td></tr>
<tr><td>5</td><td>0-3</td><td>Redirect</td><td>Router jo host ko behtar gateway batata hai</td></tr>
</table>

<h3>Echo request aur reply padhna</h3>
<p>Har echo mein ek <b>Identifier</b> aur <b>Sequence number</b> hota hai. Reply dono copy karta hai, isliye busy capture mein bhi aap jodi bana sakte ho. Lab viewer ka Info column aisa dikhta hai <code>Echo (ping) request  id=0x1a2b, seq=1, ttl=64</code>. Request aur uske reply ke beech ka time difference round-trip time hai.</p>
<p>Reply ka <b>TTL</b> bhi kahani batata hai. Hosts jaani-maani values se shuru karte hain: Linux aur zyada tar network appliances 64, Windows 128, Cisco IOS 255. TTL 62 ke saath aaya reply ek Linux jaise host se aaya jo 2 router hops door hai. Same destination ke liye TTL achanak badle to path badal gaya.</p>

<h3>Capture mein errors itne kaam ke kyun hain</h3>
<p>ICMP error message us packet ka <b>original IP header aur pehle 8 bytes</b> saath le jaata hai jisne error paida kiya. Details pane mein expand karo aur aap dekh sakte ho ki theek kaunsa packet fail hua: uska source, destination aur, TCP ya UDP ke liye, uske ports. To jab type 3 code 13 aata hai, aapko pata hai kis router ne mana kiya (ICMP ka source) aur kaunsa flow mana hua (uske andar).</p>

<pre class="out">R1# ping 198.51.100.20
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 198.51.100.20, timeout is 2 seconds:
<span class="hl">U.U.U</span>
Success rate is 0 percent (0/5)</pre>
<p>IOS reply ke liye <code>!</code>, timeout ke liye <code>.</code>, unreachable wapas aane par <code>U</code> aur "could not fragment" ke liye <code>M</code> print karta hai. <code>U.U.U</code> pattern classic hai: ek router unreachables wapas bhej raha hai, lekin IOS ICMP errors ko rate-limit karta hai (default mein har 500 ms mein ek), isliye har dusra probe timeout hota hai. Router par interface par <code>no ip unreachables</code> type 3 messages bhejna band kar deta hai, jisse saaf "U" khamosh dots ban jaata hai.</p>

<h3>TTL exceeded aur traceroute</h3>
<p>IPv4 packet forward karne wala har router uske TTL se 1 ghataata hai. Agar result 0 ho, router packet drop karta hai aur source ko <b>ICMP type 11 code 0</b> bhejta hai, us interface se jahan packet aaya tha. Yeh network ko hamesha loop karne wale packets se bachata hai. <b>Traceroute</b> is rule ka jaan boojh kar fayda uthata hai:</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Traceroute kaise kaam karta hai">
<rect x="10" y="20" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="60" y="45" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="270" y="20" width="100" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="530" y="20" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="580" y="45" text-anchor="middle" class="svg-ink" font-size="13">R3 3.3.3.3</text>
<line x1="110" y1="40" x2="270" y2="40" stroke="#64748b" stroke-width="2"/><line x1="370" y1="40" x2="530" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="20" y="95" class="svg-ink" font-size="12">Probe TTL=1  → R2 TTL 0 karta hai, drop → 10.0.12.2 se ICMP 11</text>
<text x="20" y="130" class="svg-ink" font-size="12">Probe TTL=2  → R3 tak pahunchta hai → 3.3.3.3 se ICMP 3 code 3 (port unreachable)</text>
<text x="20" y="165" class="svg-accent" font-size="12">Har hop apne address se jawab deta hai, to source ko path pata chalta hai.</text>
<text x="20" y="200" class="svg-muted" font-size="12">Cisco aur Linux high ports par UDP probes bhejte hain; Windows tracert ICMP echo.</text>
</svg><p class="cap">Traceroute TTL 1, 2, 3… wale probes bhejta hai aur har step par error lautane wale ki list banata hai.</p></div>
<p>Cisco IOS aur Linux high port numbers (33434 aur upar) par <b>UDP</b> probes bhejte hain, isliye destination khud <b>port unreachable</b> se jawab deta hai, jo trace ka end mark karta hai. Windows <code>tracert</code> iski jagah <b>ICMP echo requests</b> bhejta hai, isliye aakhri hop echo reply se jawab deta hai. Lab 3 fix karne ke baad R1 se traceroute aisa dikhta hai:</p>
<pre class="out">R1# traceroute 3.3.3.3
Type escape sequence to abort.
Tracing the route to 3.3.3.3
VRF info: (vrf in name/id, vrf out name/id)
  <span class="hl">1 10.0.12.2</span> 1 msec 1 msec 0 msec
  <span class="hl">2 10.0.23.2</span> 1 msec 1 msec 1 msec</pre>
<p>Lab PCs mein bhi <code>trace</code> hai; aakhri line destination ko <code>(ICMP type:3, code:3, Destination port unreachable)</code> ke saath dikhati hai, wahi end-of-trace signal.</p>

<div class="eg"><p><b>Worked example: routing loop.</b> Do routers ke beech link par capture mein wahi echo request (same IP ID) baar baar guzarta dikhta hai, har baar wapas aane par uska TTL 2 kam hota hai: 63, 61, 59… jab tak ICMP type 11 nahi aata. Traceroute <code>10.0.12.2</code>, <code>10.0.12.1</code>, <code>10.0.12.2</code>… alternate karta hai. Do routers destination ke routes ek dusre ki taraf point kar rahe hain. Ek capture line, ek TTL column, aur loop prove ho gaya.</p></div>

<div class="warn"><p><b>Common galti.</b> Traceroute mein <code>* * *</code> ko "packet yahan drop hua" samajhna. Iska matlab sirf itna hai ki us hop ne ICMP error wapas nahi bheja, aksar isliye ki firewall ICMP block karta hai ya router rate-limit karta hai. Agar baad ke hops jawab dete hain, to traffic us khamosh hop se theek guzar raha hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Echo request type <b>8</b> hai, echo reply type <b>0</b>, ulta nahi. Time exceeded type <b>11</b> hai. Destination unreachable type <b>3</b> hai, aur code 3 (port unreachable) destination host se aata hai, jabki codes 0 aur 1 routers se aate hain.</p></div>

<div class="scn"><h4>Woh monitoring server jise "U" dikha</h4><p>Ek monitoring server branch LAN ko ping karte waqt <code>U.U.U</code> dikhane laga. Monitoring server ke link par capture mein ICMP type 3 code 13 replies dikhe jinka source branch router ka WAN address 203.0.113.2 tha. Har error ke andar monitoring server ki original echo request thi. Branch router par ek naya inbound ACL sirf head-office subnet ko permit karta tha aur monitoring subnet bhool gaya tha. Ek permit line jodne se fix ho gaya.</p><p><b>Seekh:</b> ICMP error ka source woh device hai jisne aapka packet mana kiya, aur payload batata hai ki kaunsa packet tha.</p></div>

<div class="iv"><p class="q">"Traceroute kaise kaam karta hai, aur aakhri hop alag jawab kyun deta hai?"</p><p>Strong answer: traceroute 1 se shuru karke badhte TTL wale probes bhejta hai. Har router jo TTL ko 0 karta hai probe drop karta hai aur apne incoming interface se ICMP time exceeded (type 11) lautata hai, jisse woh hop pata chalta hai. Cisco aur Linux par probes high ports par UDP hote hain, isliye destination port unreachable (type 3 code 3) se jawab deta hai aur trace khatam hota hai; Windows ICMP echo use karta hai, isliye aakhri hop echo reply bhejta hai. Asterisks ka matlab hai us hop se ICMP wapas nahi aaya, zaroori nahi ki drop hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ICMP IP protocol 1 mein chalta hai; Type aur Code saath padho.</li>
<li>Type 8/0 = echo request/reply; type 3 = unreachable (0 net, 1 host, 3 port, 4 frag needed, 13 admin prohibited); type 11 = TTL exceeded.</li>
<li>ICMP error mein original IP header aur 8 bytes hote hain: yeh fail hue flow ka naam batata hai.</li>
<li>Traceroute badhte TTLs use karta hai; routers type 11 se jawab dete hain, destination port unreachable (UDP) ya echo reply (Windows) se.</li>
<li><code>U.U.U</code> matlab rate limiting ke saath unreachables; <code>* * *</code> matlab khamosh hop, hamesha drop nahi.</li>
</ul></div>
`}};export{e as default};