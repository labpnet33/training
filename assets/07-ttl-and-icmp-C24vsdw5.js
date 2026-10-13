var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(e,t,n,r,i)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" fill="`+i+`" stroke="#64748b" stroke-width="0.8"/>`,n=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="1.5"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,r=(n,r,i)=>{let a=600/32,o=``;return[0,8,16,24].forEach(t=>{o+=e(20+t*a+2,12,t,`svg-muted`,10,`start`)}),o+=e(618,12,31,`svg-muted`,10,`end`),n.forEach((n,r)=>{let i=20,s=18+r*34;n.forEach(n=>{let r=n[1]*a;o+=t(i,s,r,32,n[2])+e(i+r/2,s+20,n[0],`svg-ink`,n[3]||11),i+=r})}),`<div class="dia"><svg viewBox="0 0 640 `+(24+n.length*34)+`" role="img" aria-label="`+i+`">`+o+`</svg><p class="cap">`+r+`</p></div>`},i=[[[`Type (8)`,8,`#fde68a`],[`Code (8)`,8,`#fde68a`],[`Checksum (16)`,16,`#e2e8f0`]],[[`Rest of header (32): echo = identifier + sequence; unreachable = unused or next-hop MTU; redirect = gateway`,32,`#bae6fd`,10]],[[`Data: echo payload, or the original IP header + first 8 bytes of the packet that caused the error`,32,`#bbf7d0`,10]]],a=(t,r,i,a,o)=>{let s=``;return[[70,`PC1`],[230,`R1`],[380,`R2`],[500,`R3`],[600,`Server`]].forEach(t=>{s+=e(t[0],16,t[1],`svg-ink`,12)+n(t[0],24,t[0],192,0)}),s+=n(70,44,230,44)+e(150,40,`TTL 1`,`svg-accent`,11)+n(230,54,70,54,1)+e(150,68,r,`svg-muted`,10),s+=n(70,82,380,82)+e(225,78,`TTL 2`,`svg-accent`,11)+n(380,92,70,92,1)+e(225,106,i,`svg-muted`,10),s+=n(70,120,500,120)+e(285,116,`TTL 3`,`svg-accent`,11)+e(285,134,a,`svg-muted`,10),s+=n(70,152,600,152)+e(335,148,`TTL 4`,`svg-accent`,11)+n(600,168,70,168,1)+e(335,184,o,`svg-muted`,10),`<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Traceroute ladder">`+s+`</svg><p class="cap">`+t+`</p></div>`},o=`<pre class="out">PC1&gt; ping 203.0.113.80 -c 2
84 bytes from 203.0.113.80 icmp_seq=1 <span class="hl">ttl=63</span> time=0.500 ms
84 bytes from 203.0.113.80 icmp_seq=2 <span class="hl">ttl=63</span> time=0.600 ms

PC1&gt; trace 203.0.113.80
trace to 203.0.113.80, 8 hops max, press Ctrl+C to stop
 1   10.1.1.1        0.500 ms  0.450 ms  0.480 ms
 2   *203.0.113.80   0.800 ms (ICMP type:3, code:3, Destination port unreachable)</pre>`,s=`<pre class="out">Source          Destination     Protocol Length Info
192.168.10.10   203.0.113.80    UDP          74 43210 → 33434 Len=32
192.168.10.1    192.168.10.10   ICMP         70 Time-to-live exceeded (Time to live exceeded in transit)
192.168.10.10   203.0.113.80    UDP          74 43210 → 33435 Len=32
198.51.100.1    192.168.10.10   ICMP         70 Time-to-live exceeded (Time to live exceeded in transit)
192.168.10.10   203.0.113.80    UDP          74 43210 → 33436 Len=32
192.168.10.10   203.0.113.80    UDP          74 43210 → 33437 Len=32
203.0.113.80    192.168.10.10   ICMP         70 Destination unreachable (Port unreachable)</pre>`,c=`<pre class="out">0000  52 54 00 a1 00 10 52 54 00 b2 00 01 08 00 <span class="hl">45 00</span>
0010  00 38 0a 02 00 00 <span class="hl">ff 01</span> 1c 67 c0 a8 0a 01 c0 a8
0020  0a 0a <span class="hl">0b 00</span> c9 72 00 00 00 00 45 00 00 3c 61 00
0030  00 00 <span class="hl">01 11</span> 51 ae c0 a8 0a 0a cb 00 71 50 <span class="hl">a8 ca</span>
0040  <span class="hl">82 9a</span> 00 28 00 00

Type: 11 (Time-to-live exceeded)
Code: 0 (Time to live exceeded in transit)
Original datagram: IPv4 192.168.10.10 → 203.0.113.80, UDP 43210 → 33434</pre>`,l=`<pre class="out">PC1&gt; ping 10.99.99.99 -c 1
*10.1.1.1 icmp_seq=1 ttl=255 time=1.012 ms (ICMP type:3, code:1, Destination host unreachable)

PC1&gt; ping 203.0.113.80 -c 1        <span class="c">! after R1 applies "access-list 101 deny icmp any any" outbound</span>
*10.1.1.1 icmp_seq=1 ttl=255 time=1.012 ms (ICMP type:3, code:13, Communication administratively prohibited)</pre>`,u={id:`ttl-and-icmp`,h:{en:`TTL and ICMP: ping, traceroute, Time Exceeded, Unreachable codes and redirects`,hi:`TTL aur ICMP: ping, traceroute, Time Exceeded, Unreachable codes aur redirects`},body:{en:`
<p>IP is a postal system that never sends you a receipt. ICMP is the small <b>returns department</b>: when a parcel cannot be delivered, expires, or could take a better route, a router writes a short note and posts it back to the sender. Ping and traceroute are just two ways of provoking those notes on purpose. If you can read the type and code of an ICMP message, you can usually name the exact fault without touching the device.</p>

<h3>The ICMP message layout</h3>
`+r(i,`ICMP rides directly inside IP (protocol 1). Every message starts with type, code and checksum; the next four bytes depend on the type.`,`ICMP header`)+`
<div class="tbl"><table class="cmp">
<tr><th>Type</th><th>Meaning</th><th>Codes you must know</th></tr>
<tr><td>0 and 8</td><td>Echo reply, echo request (ping)</td><td>0; the identifier and sequence number match a reply to its request</td></tr>
<tr><td>3</td><td>Destination unreachable</td><td>0 network, 1 host, 2 protocol, 3 port, 4 fragmentation needed with DF set, 9 or 10 network or host administratively prohibited, 13 communication administratively prohibited</td></tr>
<tr><td>5</td><td>Redirect</td><td>0 network, 1 host: "use this other router for that destination"</td></tr>
<tr><td>11</td><td>Time exceeded</td><td>0 TTL expired in transit, 1 fragment reassembly time exceeded</td></tr>
<tr><td>12</td><td>Parameter problem</td><td>a header field is invalid</td></tr>
</table></div>

<h3>Ping: echo request and reply</h3>
<p>Ping sends type 8, the target answers with type 0 copying the identifier, sequence number and data. The Packet Studio <code>arp</code> flow shows Windows-style probes: Type 8, Code 0, Identifier 1, Sequence 1, 32 bytes of data, TTL 128; the router's reply comes back with TTL 255. In the ccna-models lab the server is one router away:</p>
`+o+`
<p>Replies show <code>ttl=63</code>: SRV starts at 64 and R1 took one off. The line reports 84 bytes (20 IP + 8 ICMP + 56 data). Note also that the trace stops at hop 2 with <b>type 3 code 3</b>, which is how traceroute knows it arrived.</p>

<h3>Traceroute: TTL used as a weapon</h3>
<p>Traceroute sends probes with TTL 1, 2, 3 and so on. The router that decrements TTL to 0 discards the probe and returns <b>type 11 code 0</b>, from its own address, so each hop reveals itself. The Packet Studio <code>traceroute</code> flow (UDP from source port 43210 to destination ports 33434, 33435 ...) produces this:</p>
`+a(`The Packet Studio traceroute: hop 3 stays silent, yet the fourth probe is delivered, so hop 3 forwards traffic but does not answer.`,`Time Exceeded from 192.168.10.1`,`Time Exceeded from 198.51.100.1`,`no reply (* * *)`,`Port Unreachable from 203.0.113.80`)+`
`+s+`
<p>Read it: hop 1 is 192.168.10.1, hop 2 is 198.51.100.1, hop 3 printed <b>* * *</b>, and the destination answered the fourth probe with <b>type 3 code 3</b>, because nothing listens on UDP port 33437. The unreachable is a success signal. Windows <code>tracert</code> and some Linux tools send ICMP echo instead; the last hop then answers with an echo reply.</p>

<h3>What the router quotes back</h3>
<p>Time Exceeded and Unreachable messages carry the original IP header plus the first 8 bytes of its payload. That is how traceroute matches the reply to its probe, and why a firewall log of an ICMP error can still name the connection. This is the Time Exceeded from hop 1, byte by byte:</p>
`+c+`
<div class="eg"><p><b>Worked example: read the quote.</b> The outer IP header has TTL <code>ff</code> (255) and protocol <code>01</code>: a router-generated ICMP. The ICMP header is <code>0b 00</code>: type 11, code 0. After four unused bytes comes the quoted header <code>45 00 00 3c ... 01 11 ...</code>: total length 60, <b>TTL 1</b>, protocol 0x11 (17, UDP), then the addresses c0a80a0a (192.168.10.10) and cb007150 (203.0.113.80) and the first 8 UDP bytes <code>a8ca 829a 0028 0000</code>: source port 43210, destination port 33434, length 40. The TTL 61 on the server's port-unreachable (a server starts at 64) says the reply crossed three routers on the way back, matching the three routers of the forward path.</p></div>

<h3>Unreachable and administratively prohibited</h3>
<p>When a ping fails, the code says why. The simulator PC prints the type and code it receives:</p>
`+l+`
<p>Code 13 (or 9 and 10) means a <b>filter</b> on a router or firewall deliberately refused the packet and said so; compare that with silence, which means a device dropped it without an ICMP (a firewall set to drop, or an ACL on a device configured with <code>no ip unreachables</code>). The simulator reports a missing route as code 1; on real IOS a missing route usually produces code 0 (network unreachable) and code 1 comes from the last-hop router when ARP for the host fails. IOS also rate-limits unreachables, by default one every 500 ms, which is why a flood of failing pings shows a mixture of <code>U</code> and <code>.</code>.</p>

<h3>Redirects</h3>
<p>If R1 receives a packet from PC1 (10.1.1.10, gateway 10.1.1.1) for 198.51.100.7 and its routing table says the next hop is R2 at 10.1.1.2 on the <b>same subnet</b>, R1 forwards the packet and sends PC1 an ICMP <b>type 5 code 1</b> carrying the better gateway 10.1.1.2. PC1 then talks to R2 directly. Redirects are mostly disabled in modern networks because hosts should not be steered by routers they do not trust; the simulator does not generate them, so you will meet them in theory and in real packet files.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading <code>* * *</code> as "this hop is down": it only means no Time Exceeded came back. Believing "request timed out" means the host is down, when a filter may be dropping ICMP. Blocking type 3 and type 11 on a firewall, which breaks path MTU discovery and traceroute. Reading TTL as time.</p></div>

<div class="exam"><p><b>Exam traps.</b> Echo request is 8, echo reply 0, Time Exceeded 11, Destination Unreachable 3, Redirect 5. Code 3 is port unreachable, code 4 fragmentation needed. Traceroute relies on Time Exceeded from each router and on the destination's own reply. Routers do not generate ICMP errors about ICMP errors.</p></div>

<div class="scn"><h4>The trace that bounced</h4><p>A new subnet was unreachable. A trace from the core showed hop 1 as the edge, hop 2 as the core, hop 3 as the edge again, and so on until the 30-hop limit. Each router had a static route to the prefix pointing at the other one. The packets looped until TTL reached 0 and Time Exceeded came back from alternating addresses. The edge route was repointed at the WAN next hop and the trace finished in three hops.</p><p><b>Lesson:</b> alternating addresses in a trace are a routing loop; TTL is the fuse that stopped it.</p></div>

<div class="iv"><p class="q">"How does traceroute work, and why can a hop show * * * when traffic still passes?"</p><p>It sends probes with increasing TTL; each router that expires one returns ICMP Time Exceeded, so its address is revealed, and the destination answers with port unreachable (UDP) or echo reply (ICMP). A hop can stay silent because it rate-limits or filters ICMP while still forwarding the probe, as the following hop proves.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ICMP is protocol 1: type, code, checksum, then type-specific fields and, for errors, the original header plus 8 bytes.</li>
<li>Ping = 8 and 0; traceroute = TTL probes answered by type 11 code 0, ending with type 3 code 3 or an echo reply.</li>
<li>Type 3 codes name the fault: 0 net, 1 host, 3 port, 4 fragmentation needed, 13 prohibited by a filter.</li>
<li>Silence is not the same as an error: no ICMP back can mean a drop, a filter or rate limiting.</li>
<li>Redirects tell a host about a better gateway on its own subnet; most networks disable them.</li>
</ul></div>
`,hi:`
<p>IP ek aisa postal system hai jo kabhi receipt nahi bhejta. ICMP chhota sa <b>returns department</b> hai: jab parcel deliver nahi ho sakta, expire ho jaata hai, ya behtar raasta mil sakta hai, to router ek chhota note likhkar sender ko wapas post kar deta hai. Ping aur traceroute in notes ko jaan boojh kar bulwane ke do tareeke hain. Agar aap ICMP message ka type aur code padh sako, to aap aksar device ko chhue bina exact fault ka naam bata sakte ho.</p>

<h3>ICMP message layout</h3>
`+r(i,`ICMP seedha IP ke andar chalta hai (protocol 1). Har message type, code aur checksum se shuru hota hai; agle chaar bytes type par depend karte hain.`,`ICMP header`)+`
<div class="tbl"><table class="cmp">
<tr><th>Type</th><th>Matlab</th><th>Jo codes aapko aane chahiye</th></tr>
<tr><td>0 aur 8</td><td>Echo reply, echo request (ping)</td><td>0; identifier aur sequence number reply ko request se match karte hain</td></tr>
<tr><td>3</td><td>Destination unreachable</td><td>0 network, 1 host, 2 protocol, 3 port, 4 DF set hone par fragmentation needed, 9 ya 10 network ya host administratively prohibited, 13 communication administratively prohibited</td></tr>
<tr><td>5</td><td>Redirect</td><td>0 network, 1 host: "us destination ke liye yeh dusra router use karo"</td></tr>
<tr><td>11</td><td>Time exceeded</td><td>0 TTL transit mein expire, 1 fragment reassembly time exceeded</td></tr>
<tr><td>12</td><td>Parameter problem</td><td>header ka koi field invalid hai</td></tr>
</table></div>

<h3>Ping: echo request aur reply</h3>
<p>Ping type 8 bhejta hai, target type 0 se jawab deta hai aur identifier, sequence number aur data copy karta hai. Packet Studio ka <code>arp</code> flow Windows-style probes dikhata hai: Type 8, Code 0, Identifier 1, Sequence 1, 32 bytes data, TTL 128; router ka reply TTL 255 ke saath aata hai. ccna-models lab mein server ek router door hai:</p>
`+o+`
<p>Replies <code>ttl=63</code> dikhate hain: SRV 64 se shuru karta hai aur R1 ne ek kam kiya. Line 84 bytes report karti hai (20 IP + 8 ICMP + 56 data). Yeh bhi dekho ki trace hop 2 par <b>type 3 code 3</b> ke saath rukta hai, aur traceroute isi se jaanta hai ki woh pahunch gaya.</p>

<h3>Traceroute: TTL ko hathiyaar banana</h3>
<p>Traceroute TTL 1, 2, 3 waghera ke probes bhejta hai. Jo router TTL ko 0 karta hai woh probe discard karta hai aur apne address se <b>type 11 code 0</b> lautata hai, isliye har hop apna pata batata hai. Packet Studio ka <code>traceroute</code> flow (source port 43210 se destination ports 33434, 33435 ... tak UDP) yeh banata hai:</p>
`+a(`Packet Studio ka traceroute: hop 3 chup rehta hai, phir bhi chautha probe deliver hota hai, yaani hop 3 traffic forward karta hai par jawab nahi deta.`,`192.168.10.1 se Time Exceeded`,`198.51.100.1 se Time Exceeded`,`koi reply nahi (* * *)`,`203.0.113.80 se Port Unreachable`)+`
`+s+`
<p>Padho: hop 1 192.168.10.1 hai, hop 2 198.51.100.1 hai, hop 3 ne <b>* * *</b> print kiya, aur destination ne chauthe probe ka jawab <b>type 3 code 3</b> se diya, kyunki UDP port 33437 par kuch listen nahi karta. Unreachable yahan success ka signal hai. Windows <code>tracert</code> aur kuch Linux tools ICMP echo bhejte hain; tab aakhri hop echo reply se jawab deta hai.</p>

<h3>Router wapas kya quote karta hai</h3>
<p>Time Exceeded aur Unreachable messages original IP header plus uske payload ke pehle 8 bytes carry karte hain. Isi se traceroute reply ko probe se match karta hai, aur isiliye ICMP error ka firewall log bhi connection ka naam bata sakta hai. Yeh hop 1 ka Time Exceeded hai, byte by byte:</p>
`+c+`
<div class="eg"><p><b>Worked example: quote padho.</b> Outer IP header mein TTL <code>ff</code> (255) aur protocol <code>01</code> hai: router-generated ICMP. ICMP header <code>0b 00</code> hai: type 11, code 0. Chaar unused bytes ke baad quoted header <code>45 00 00 3c ... 01 11 ...</code> aata hai: total length 60, <b>TTL 1</b>, protocol 0x11 (17, UDP), phir addresses c0a80a0a (192.168.10.10) aur cb007150 (203.0.113.80) aur UDP ke pehle 8 bytes <code>a8ca 829a 0028 0000</code>: source port 43210, destination port 33434, length 40. Server ke port-unreachable par TTL 61 (server 64 se shuru karta hai) batata hai ki reply ne wapas aate hue teen routers paar kiye, forward path ke teen routers ke barabar.</p></div>

<h3>Unreachable aur administratively prohibited</h3>
<p>Jab ping fail ho, code batata hai kyun. Simulator ka PC jo type aur code receive karta hai woh print karta hai:</p>
`+l+`
<p>Code 13 (ya 9 aur 10) ka matlab router ya firewall ke <b>filter</b> ne jaan boojh kar packet refuse kiya aur bata diya; ise khamoshi se compare karo, jiska matlab kisi device ne bina ICMP ke drop kiya (drop par set firewall, ya <code>no ip unreachables</code> wala device). Simulator missing route ko code 1 report karta hai; real IOS par missing route aam taur par code 0 (network unreachable) deta hai aur code 1 last-hop router se tab aata hai jab host ka ARP fail ho. IOS unreachables ko rate-limit bhi karta hai, default mein har 500 ms mein ek, isliye fail hote pings ki baadh mein <code>U</code> aur <code>.</code> ka mix dikhta hai.</p>

<h3>Redirects</h3>
<p>Agar R1 ko PC1 (10.1.1.10, gateway 10.1.1.1) se 198.51.100.7 ka packet mile aur routing table kahe ki next hop R2 hai, 10.1.1.2 par, <b>wahi subnet</b> mein, to R1 packet forward karta hai aur PC1 ko ICMP <b>type 5 code 1</b> bhejta hai jisme behtar gateway 10.1.1.2 hota hai. PC1 phir R2 se seedha baat karta hai. Modern networks mein redirects zyada tar disabled hote hain kyunki hosts ko aise routers steer nahi karne chahiye jin par bharosa nahi; simulator inhe generate nahi karta, isliye aap inhe theory aur real packet files mein hi milenge.</p>

<div class="warn"><p><b>Common galtiyan.</b> <code>* * *</code> ko "yeh hop down hai" padhna: iska matlab sirf itna hai ki Time Exceeded wapas nahi aaya. "Request timed out" ka matlab host down samajhna, jabki filter ICMP drop kar raha ho sakta hai. Firewall par type 3 aur type 11 block karna, jisse path MTU discovery aur traceroute tootte hain. TTL ko time padhna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Echo request 8, echo reply 0, Time Exceeded 11, Destination Unreachable 3, Redirect 5. Code 3 port unreachable, code 4 fragmentation needed. Traceroute har router ke Time Exceeded aur destination ke apne reply par depend karta hai. Routers ICMP errors ke baare mein ICMP errors generate nahi karte.</p></div>

<div class="scn"><h4>Trace jo uchhalta raha</h4><p>Ek naya subnet unreachable tha. Core se trace mein hop 1 edge, hop 2 core, hop 3 phir edge, aur aise hi 30-hop limit tak. Har router ke paas us prefix ka static route doosre ki taraf point karta tha. Packets tab tak loop mein ghoome jab tak TTL 0 nahi hua aur baari baari addresses se Time Exceeded wapas aaya. Edge route ko WAN next hop par repoint kiya gaya aur trace teen hops mein poora hua.</p><p><b>Seekh:</b> trace mein baari baari aate addresses routing loop hain; TTL woh fuse hai jisne ise roka.</p></div>

<div class="iv"><p class="q">"Traceroute kaise kaam karta hai, aur traffic guzarne par bhi hop * * * kyun dikha sakta hai?"</p><p>Woh badhte TTL ke probes bhejta hai; jo router ek expire karta hai woh ICMP Time Exceeded lautata hai, isliye uska address pata chalta hai, aur destination port unreachable (UDP) ya echo reply (ICMP) se jawab deta hai. Hop isliye chup reh sakta hai ki woh ICMP rate-limit ya filter karta hai lekin probe forward karta hai, jaisa agla hop saabit karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ICMP protocol 1 hai: type, code, checksum, phir type-specific fields aur errors mein original header plus 8 bytes.</li>
<li>Ping = 8 aur 0; traceroute = TTL probes jinka jawab type 11 code 0 deta hai, aur ant mein type 3 code 3 ya echo reply.</li>
<li>Type 3 codes fault ka naam batate hain: 0 net, 1 host, 3 port, 4 fragmentation needed, 13 filter ne roka.</li>
<li>Khamoshi error jaisi nahi: ICMP wapas na aana drop, filter ya rate limiting ho sakta hai.</li>
<li>Redirects host ko apne subnet ke behtar gateway ke baare mein batate hain; zyada tar networks inhe disable karte hain.</li>
</ul></div>
`}};export{u as default};