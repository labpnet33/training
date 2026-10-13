var e={id:`ping-traceroute`,h:{en:`Troubleshooting method, extended ping and traceroute`,hi:`Troubleshooting method, extended ping aur traceroute`},body:{en:`
<p>Imagine a courier company that loses a parcel. A lazy manager says "the delivery system is broken". A good manager asks: did it leave the warehouse, did it reach the hub, did it reach the local office? Each checkpoint halves the search. Ping and traceroute are your checkpoints, and extended options let you send exactly the parcel you want, from exactly the depot you want.</p>

<h3>A method before the tools</h3>
<p>Structured troubleshooting follows a simple loop: <b>define the problem</b> (who, what, since when), <b>gather facts</b>, <b>form a hypothesis</b>, <b>test it</b>, <b>fix</b>, <b>verify</b>, and <b>document</b>. For choosing where to look, three approaches are common:</p>
<ul>
<li><b>Bottom-up</b>: start at the physical layer and move up. Good when you suspect cabling or interfaces.</li>
<li><b>Top-down</b>: start at the application and move down. Good when only one application fails.</li>
<li><b>Divide and conquer</b>: start in the middle, usually with a ping. If ping works, Layers 1 to 3 are fine along that path, so look up; if it fails, look down. This is the fastest method for most network tickets.</li>
<li><b>Follow the path</b>: walk hop by hop along the route the packet takes, which is exactly what traceroute automates.</li>
</ul>

<h3>Extended ping: every option that matters</h3>
<p>A plain <code>ping</code> from a router uses the address of the <b>outgoing interface</b> as the source, sends five 100-byte packets and waits two seconds for each. That default often lies to you. The return traffic from the far end goes to the router's WAN address, which is almost always routed correctly, while the real users live on the LAN subnet, which may be missing from a remote routing table. So always test from the address the users actually use.</p>
<pre class="code">EDGE# ping 198.51.100.10 source GigabitEthernet0/2 repeat 100 size 1500 df-bit timeout 1
<span class="c">! source    : use the LAN address 192.168.50.1 as the source</span>
<span class="c">! repeat    : 100 probes instead of 5, to catch intermittent loss</span>
<span class="c">! size      : total IP packet size in bytes (36 to 18024)</span>
<span class="c">! df-bit    : do not fragment, used to discover the path MTU</span>
<span class="c">! timeout   : seconds to wait for each reply</span></pre>
<p>Typing just <code>ping</code> and pressing Enter starts the <b>interactive</b> extended ping, which also offers a <b>sweep range of sizes</b>, type of service, data pattern and record route. The sweep is useful to find the exact size at which packets start failing.</p>
<pre class="out">EDGE# ping 198.51.100.10 source g0/2 size 1500 df-bit
Type escape sequence to abort.
Sending 5, 1500-byte ICMP Echos to 198.51.100.10, timeout is 2 seconds:
Packet sent with a source address of 192.168.50.1
Packet sent with the DF bit set
<span class="hl">M.M.M</span>
Success rate is 0 percent (0/5)</pre>
<table class="cmp">
<tr><th>Code</th><th>Meaning</th></tr>
<tr><td><code>!</code></td><td>Echo reply received</td></tr>
<tr><td><code>.</code></td><td>Timed out waiting for a reply (no answer at all)</td></tr>
<tr><td><code>U</code></td><td>A router sent "destination unreachable"</td></tr>
<tr><td><code>M</code></td><td>"Could not fragment": DF set and a link MTU is smaller</td></tr>
<tr><td><code>Q</code></td><td>Source quench (destination too busy)</td></tr>
<tr><td><code>&amp;</code></td><td>Packet lifetime (TTL) exceeded</td></tr>
<tr><td><code>?</code></td><td>Unknown packet type</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A GRE tunnel adds 24 bytes, so a 1500-byte link carries at most 1476-byte packets through the tunnel. <code>ping ... size 1476 df-bit</code> returns <code>!!!!!</code>, and <code>size 1477 df-bit</code> returns <code>M.M.M</code>. The alternating M and dot are normal: routers rate-limit ICMP unreachable messages, so every second reply is suppressed. You have just measured the path MTU as 1476 bytes.</p></div>

<h3>Traceroute: follow the path</h3>
<p>Cisco IOS traceroute sends <b>UDP probes</b> to high port numbers (starting at 33434) with TTL 1, 2, 3 and so on. Each router that decrements the TTL to zero returns ICMP <b>time exceeded</b>, revealing itself. The destination returns ICMP <b>port unreachable</b>, which ends the trace. Windows <code>tracert</code> uses ICMP echo instead, which matters when a firewall allows one and not the other.</p>
<pre class="code">EDGE# traceroute 198.51.100.10 source GigabitEthernet0/2 numeric probe 2 ttl 1 10 timeout 2
<span class="c">! numeric   : skip DNS lookups (much faster)</span>
<span class="c">! probe 2   : two probes per hop instead of three</span>
<span class="c">! ttl 1 10  : minimum and maximum TTL</span></pre>
<pre class="out">Type escape sequence to abort.
Tracing the route to 198.51.100.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.0.1.1 1 msec 1 msec
  2 100.64.10.2 2 msec 1 msec
  <span class="hl">3 * *</span>
  <span class="hl">4 * *</span></pre>
<p>Stars mean no reply arrived for that TTL. A few stars in the middle followed by normal hops usually mean a router that rate-limits or does not send time exceeded messages: not a problem. Stars all the way to the maximum TTL mean the packets, or the replies, die at that point. Other markers: <code>!H</code> host unreachable, <code>!N</code> network unreachable, <code>!P</code> protocol unreachable, <code>!A</code> administratively prohibited (an ACL).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Traceroute TTL steps">
<rect x="20" y="60" width="100" height="44" rx="8" fill="#bae6fd"/><text x="70" y="87" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text>
<rect x="190" y="60" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="240" y="87" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="360" y="60" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="410" y="87" text-anchor="middle" class="svg-ink" font-size="13">CORE</text>
<rect x="530" y="60" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="575" y="87" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<line x1="120" y1="82" x2="190" y2="82" stroke="#64748b" stroke-width="2"/><line x1="290" y1="82" x2="360" y2="82" stroke="#64748b" stroke-width="2"/><line x1="460" y1="82" x2="530" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="240" y="40" text-anchor="middle" class="svg-accent" font-size="12">TTL 1: time exceeded</text>
<text x="410" y="40" text-anchor="middle" class="svg-accent" font-size="12">TTL 2: time exceeded</text>
<text x="575" y="40" text-anchor="middle" class="svg-accent" font-size="12">TTL 3: port unreach</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">UDP probes to port 33434 and up; each hop reveals itself</text>
</svg><p class="cap">Traceroute raises the TTL by one for each hop. Routers answer "time exceeded", the destination answers "port unreachable".</p></div>

<div class="warn"><p><b>Common mistake.</b> Pinging from the router without a <code>source</code> and declaring "the WAN is fine". The users' subnet may be missing from the far side's routing table, a NAT rule or an ACL. Always test from the LAN interface or the loopback that matters.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>M</code> in ping output is "could not fragment", not "MTU mismatch between neighbours". And <code>U</code> means someone actively answered "unreachable", while <code>.</code> means silence. Silence points to a filter that drops, a missing return route, or a dead host.</p></div>

<div class="scn"><h4>Web pages that half load</h4><p>After a new IPsec VPN went live, users at a branch could open small pages but large pages and file downloads hung. Normal pings worked. The engineer ran <code>ping 10.20.0.10 source g0/2 size 1500 df-bit</code> and got <code>M.M.M</code>, then swept sizes and found 1400 bytes as the limit because of the tunnel overhead. Adjusting the TCP MSS on the tunnel interface (<code>ip tcp adjust-mss 1360</code>) fixed the problem.</p><p><b>Lesson:</b> small pings prove reachability, not that full-size packets fit. Test with size and DF bit.</p></div>

<div class="iv"><p class="q">"Why would a ping from the router succeed while users behind it cannot reach the same server?"</p><p>Because a plain ping uses the outgoing interface address as the source. The far end knows how to return traffic to that address, but not necessarily to the LAN subnet, which may be missing from routing, blocked by an ACL or not covered by NAT. Show that you would repeat the test with <code>source</code> set to the LAN interface, then trace the return path from the far side.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a method: define, gather, hypothesise, test, fix, verify, document; divide and conquer with ping is usually fastest.</li>
<li>Extended ping options: source, repeat, size, df-bit, timeout, and a sweep range in the interactive version.</li>
<li>Codes: ! reply, . timeout, U unreachable, M could not fragment, Q source quench, &amp; TTL exceeded.</li>
<li>IOS traceroute uses UDP probes from port 33434 and reads ICMP time exceeded and port unreachable.</li>
<li>Use <code>numeric</code> to skip DNS and <code>source</code> to test the real user path.</li>
</ul></div>
`,hi:`
<p>Ek courier company socho jiska parcel kho jaata hai. Aalsi manager kehta hai "delivery system kharab hai". Achha manager poochta hai: kya parcel warehouse se nikla, kya hub tak pahuncha, kya local office tak pahuncha? Har checkpoint search ko aadha kar deta hai. Ping aur traceroute aapke checkpoints hain, aur extended options se aap bilkul wahi parcel bhej sakte ho jo chahiye, bilkul usi depot se jo chahiye.</p>

<h3>Tools se pehle ek method</h3>
<p>Structured troubleshooting ek simple loop follow karta hai: <b>problem define karo</b> (kaun, kya, kab se), <b>facts ikattha karo</b>, <b>hypothesis banao</b>, <b>use test karo</b>, <b>fix karo</b>, <b>verify karo</b>, aur <b>document karo</b>. Kahan dekhna hai yeh chunne ke liye teen approaches common hain:</p>
<ul>
<li><b>Bottom-up</b>: physical layer se shuru karke upar jao. Jab cabling ya interfaces par shak ho tab achha.</li>
<li><b>Top-down</b>: application se shuru karke neeche jao. Jab sirf ek application fail ho tab achha.</li>
<li><b>Divide and conquer</b>: beech se shuru karo, aam taur par ping se. Agar ping chalta hai, to us path par Layers 1 se 3 theek hain, isliye upar dekho; agar fail hota hai, neeche dekho. Zyada tar network tickets ke liye yeh sabse tez method hai.</li>
<li><b>Follow the path</b>: packet jis route se jaata hai us par hop by hop chalo, jo exactly traceroute automate karta hai.</li>
</ul>

<h3>Extended ping: har zaroori option</h3>
<p>Router se plain <code>ping</code> source ke roop mein <b>outgoing interface</b> ka address use karta hai, paanch 100-byte packets bhejta hai aur har ek ke liye do second wait karta hai. Yeh default aksar aapse jhooth bolta hai. Far end se return traffic router ke WAN address par jaata hai, jo lagbhag hamesha sahi route hota hai, jabki asli users LAN subnet par hote hain, jo remote routing table se gayab ho sakta hai. Isliye hamesha usi address se test karo jo users sach mein use karte hain.</p>
<pre class="code">EDGE# ping 198.51.100.10 source GigabitEthernet0/2 repeat 100 size 1500 df-bit timeout 1
<span class="c">! source    : LAN address 192.168.50.1 ko source ki tarah use karo</span>
<span class="c">! repeat    : 5 ki jagah 100 probes, intermittent loss pakadne ke liye</span>
<span class="c">! size      : bytes mein total IP packet size (36 se 18024)</span>
<span class="c">! df-bit    : do not fragment, path MTU discover karne ke liye</span>
<span class="c">! timeout   : har reply ke liye kitne second wait karna</span></pre>
<p>Sirf <code>ping</code> type karke Enter dabane se <b>interactive</b> extended ping shuru hota hai, jo <b>sweep range of sizes</b>, type of service, data pattern aur record route bhi deta hai. Sweep exact woh size dhoondhne mein kaam aata hai jahan se packets fail hona shuru hote hain.</p>
<pre class="out">EDGE# ping 198.51.100.10 source g0/2 size 1500 df-bit
Type escape sequence to abort.
Sending 5, 1500-byte ICMP Echos to 198.51.100.10, timeout is 2 seconds:
Packet sent with a source address of 192.168.50.1
Packet sent with the DF bit set
<span class="hl">M.M.M</span>
Success rate is 0 percent (0/5)</pre>
<table class="cmp">
<tr><th>Code</th><th>Matlab</th></tr>
<tr><td><code>!</code></td><td>Echo reply mila</td></tr>
<tr><td><code>.</code></td><td>Reply ka wait karte karte time out (koi jawab nahi)</td></tr>
<tr><td><code>U</code></td><td>Kisi router ne "destination unreachable" bheja</td></tr>
<tr><td><code>M</code></td><td>"Could not fragment": DF set hai aur kisi link ka MTU chhota hai</td></tr>
<tr><td><code>Q</code></td><td>Source quench (destination bahut busy)</td></tr>
<tr><td><code>&amp;</code></td><td>Packet lifetime (TTL) exceed ho gaya</td></tr>
<tr><td><code>?</code></td><td>Unknown packet type</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> GRE tunnel 24 bytes jodta hai, isliye 1500-byte link tunnel ke through zyada se zyada 1476-byte packets le jaata hai. <code>ping ... size 1476 df-bit</code> <code>!!!!!</code> deta hai, aur <code>size 1477 df-bit</code> <code>M.M.M</code> deta hai. Baari baari M aur dot normal hain: routers ICMP unreachable messages ko rate-limit karte hain, isliye har doosra reply suppress hota hai. Aapne abhi path MTU 1476 bytes naap liya.</p></div>

<h3>Traceroute: path follow karo</h3>
<p>Cisco IOS traceroute ucche port numbers (33434 se shuru) par <b>UDP probes</b> bhejta hai, TTL 1, 2, 3 aur aage ke saath. Har router jo TTL ko zero tak ghatata hai ICMP <b>time exceeded</b> lautata hai, aur apni pehchaan de deta hai. Destination ICMP <b>port unreachable</b> lautata hai, jisse trace khatam hota hai. Windows <code>tracert</code> iski jagah ICMP echo use karta hai, jo tab matter karta hai jab firewall ek ko allow kare aur doosre ko nahi.</p>
<pre class="code">EDGE# traceroute 198.51.100.10 source GigabitEthernet0/2 numeric probe 2 ttl 1 10 timeout 2
<span class="c">! numeric   : DNS lookups skip karo (bahut tez)</span>
<span class="c">! probe 2   : har hop par teen ki jagah do probes</span>
<span class="c">! ttl 1 10  : minimum aur maximum TTL</span></pre>
<pre class="out">Type escape sequence to abort.
Tracing the route to 198.51.100.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.0.1.1 1 msec 1 msec
  2 100.64.10.2 2 msec 1 msec
  <span class="hl">3 * *</span>
  <span class="hl">4 * *</span></pre>
<p>Stars ka matlab hai us TTL ke liye koi reply nahi aaya. Beech mein kuch stars ke baad normal hops ka matlab aam taur par ek router hai jo rate-limit karta hai ya time exceeded messages nahi bhejta: koi problem nahi. Maximum TTL tak lagatar stars ka matlab hai packets, ya replies, usi point par mar rahe hain. Doosre markers: <code>!H</code> host unreachable, <code>!N</code> network unreachable, <code>!P</code> protocol unreachable, <code>!A</code> administratively prohibited (ek ACL).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Traceroute TTL steps">
<rect x="20" y="60" width="100" height="44" rx="8" fill="#bae6fd"/><text x="70" y="87" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text>
<rect x="190" y="60" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="240" y="87" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="360" y="60" width="100" height="44" rx="8" fill="#e2e8f0"/><text x="410" y="87" text-anchor="middle" class="svg-ink" font-size="13">CORE</text>
<rect x="530" y="60" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="575" y="87" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<line x1="120" y1="82" x2="190" y2="82" stroke="#64748b" stroke-width="2"/><line x1="290" y1="82" x2="360" y2="82" stroke="#64748b" stroke-width="2"/><line x1="460" y1="82" x2="530" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="240" y="40" text-anchor="middle" class="svg-accent" font-size="12">TTL 1: time exceeded</text>
<text x="410" y="40" text-anchor="middle" class="svg-accent" font-size="12">TTL 2: time exceeded</text>
<text x="575" y="40" text-anchor="middle" class="svg-accent" font-size="12">TTL 3: port unreach</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Port 33434 aur upar UDP probes; har hop apni pehchaan deta hai</text>
</svg><p class="cap">Traceroute har hop ke liye TTL ek badhata hai. Routers "time exceeded" jawab dete hain, destination "port unreachable".</p></div>

<div class="warn"><p><b>Common galti.</b> Router se bina <code>source</code> ke ping karke kehna "WAN theek hai". Users ka subnet far side ki routing table, kisi NAT rule ya ACL se gayab ho sakta hai. Hamesha LAN interface ya us loopback se test karo jo matter karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ping output mein <code>M</code> "could not fragment" hai, "neighbours ke beech MTU mismatch" nahi. Aur <code>U</code> ka matlab hai kisi ne actively "unreachable" jawab diya, jabki <code>.</code> ka matlab khamoshi. Khamoshi ek drop karne wale filter, gayab return route, ya dead host ki taraf ishara karti hai.</p></div>

<div class="scn"><h4>Web pages jo aadhe load hote hain</h4><p>Ek naya IPsec VPN live hone ke baad ek branch ke users chhote pages khol paate the par bade pages aur file downloads atak jaate the. Normal pings chal rahe the. Engineer ne <code>ping 10.20.0.10 source g0/2 size 1500 df-bit</code> chalaya aur <code>M.M.M</code> mila, phir sizes sweep karke tunnel overhead ki wajah se 1400 bytes ki limit paayi. Tunnel interface par TCP MSS adjust karne (<code>ip tcp adjust-mss 1360</code>) se problem theek hui.</p><p><b>Seekh:</b> chhote pings reachability prove karte hain, yeh nahi ki full-size packets fit hote hain. Size aur DF bit ke saath test karo.</p></div>

<div class="iv"><p class="q">"Router se ping kyun succeed hoga jabki uske peeche ke users usi server tak nahi pahunch paate?"</p><p>Kyunki plain ping source ke roop mein outgoing interface ka address use karta hai. Far end ko us address par traffic lautana aata hai, par zaroori nahi ki LAN subnet par bhi, jo routing se gayab ho sakta hai, ACL se block ho sakta hai ya NAT mein cover na ho. Dikhao ki aap test ko <code>source</code> LAN interface par set karke dohraoge, phir far side se return path trace karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method use karo: define, gather, hypothesise, test, fix, verify, document; ping ke saath divide and conquer aam taur par sabse tez hai.</li>
<li>Extended ping options: source, repeat, size, df-bit, timeout, aur interactive version mein sweep range.</li>
<li>Codes: ! reply, . timeout, U unreachable, M could not fragment, Q source quench, &amp; TTL exceeded.</li>
<li>IOS traceroute port 33434 se UDP probes use karta hai aur ICMP time exceeded aur port unreachable padhta hai.</li>
<li>DNS skip karne ke liye <code>numeric</code> aur asli user path test karne ke liye <code>source</code> use karo.</li>
</ul></div>
`}};export{e as default};