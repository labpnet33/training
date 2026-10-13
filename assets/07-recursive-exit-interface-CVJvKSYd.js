var e={id:`recursive-exit-interface`,h:{en:`Recursive lookup and exit-interface routes on Ethernet`,hi:`Recursive lookup aur Ethernet par exit-interface routes`},body:{en:`
<p>You ask a colleague where the finance office is. "Go to Meena's desk." Fine, but where is Meena's desk? You ask again: "Second floor, east wing." Two questions to get one answer. That second question is a <b>recursive lookup</b>. Now imagine instead you were told only "take the east staircase". You go up and must ask every single person you meet whether they are the finance office. That is an <b>exit-interface-only</b> route on Ethernet.</p>

<h3>Recursive lookup, step by step</h3>
<p>A next-hop static route tells the router <i>who</i> to send to, not <i>which interface</i> to use. So the router does a second lookup on the next-hop address itself.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Recursive lookup in two steps">
<rect x="20" y="30" width="190" height="70" rx="8" fill="#bae6fd"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="13">Packet to 172.16.3.10</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="12">lookup 1</text>
<rect x="230" y="30" width="190" height="70" rx="8" fill="#ddd6fe"/><text x="325" y="55" text-anchor="middle" class="svg-ink" font-size="13">S 172.16.3.0/24</text><text x="325" y="78" text-anchor="middle" class="svg-muted" font-size="12">via 10.12.12.2</text>
<rect x="440" y="30" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">C 10.12.12.0/30</text><text x="530" y="78" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 (lookup 2)</text>
<line x1="210" y1="65" x2="230" y2="65" stroke="#64748b" stroke-width="2"/><line x1="420" y1="65" x2="440" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="130" width="320" height="56" rx="8" fill="#fde68a"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">ARP for 10.12.12.2 only</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">one ARP entry serves every remote host</text>
<line x1="530" y1="100" x2="420" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A next-hop route needs two lookups: destination to next hop, then next hop to interface.</p></div>
<ol>
<li>Destination 172.16.3.10 matches <code>S 172.16.3.0/24 via 10.12.12.2</code>.</li>
<li>The router looks up 10.12.12.2 and finds <code>C 10.12.12.0/30, GigabitEthernet0/1</code>.</li>
<li>It ARPs once for 10.12.12.2 and reuses that MAC for every destination behind R2.</li>
</ol>
<p>Recursion can go deeper. If the next hop is a loopback on a distant router that is itself reached through another static, the router follows the chain until it lands on a connected route. CEF resolves the whole chain in advance, so there is no per-packet cost on modern routers, but every extra level is another dependency that can break.</p>

<h3>When recursion fails</h3>
<p>If the next hop does not fall inside any route in the table, the static route is <b>not installed</b>. The configuration still shows it, so beginners assume it works. This is exactly the bug in the NOC ticket for this module:</p>
<pre class="out">BR-JAIPUR#show running-config | include ip route
ip route 10.10.0.0 255.255.0.0 10.99.0.6 name HQ-CAMPUS

BR-JAIPUR#show ip route 10.99.0.6
<span class="hl">% Subnet not in table</span></pre>
<p>BR's WAN link is 10.99.0.0/30 (.1 and .2). 10.99.0.6 is in 10.99.0.4/30, which BR does not know, so the HQ route never enters the table. Chapter 11 walks through the full ticket.</p>

<h3>Exit-interface routes on Ethernet</h3>
<p>An exit-interface-only route tells the router that the destination network is reachable directly out of that interface, as if it were connected. On a <b>point-to-point</b> link (serial HDLC or PPP) that is perfect: there is exactly one device at the other end and no ARP. On <b>Ethernet</b>, a multi-access medium, the router does not know which neighbour to send to, so it ARPs for the <b>final destination</b> of every packet.</p>
<p>That only works if the neighbouring router answers those ARP requests on behalf of hosts behind it, a feature called <b>proxy ARP</b>. Cisco IOS enables proxy ARP on interfaces by default, which is why the lab works, but many security baselines disable it with <code>no ip proxy-arp</code>.</p>
<pre class="out">R2#show ip arp GigabitEthernet0/1
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.23.23.1              -   5254.0012.0201  ARPA   GigabitEthernet0/1
Internet  10.23.23.2             12   5254.0012.0302  ARPA   GigabitEthernet0/1
<span class="hl">Internet  172.16.3.10             3   5254.0012.0302  ARPA   GigabitEthernet0/1
Internet  172.16.3.11             1   5254.0012.0302  ARPA   GigabitEthernet0/1</span></pre>
<p>Each Studio-B host appears as its own ARP entry, all with R3's MAC: proxy ARP at work. With 250 users that is 250 ARP entries instead of one. Now imagine <code>ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/2</code> toward an ISP: the router ARPs for every internet address a user visits, filling memory and CPU, and fails completely if the ISP disables proxy ARP.</p>

<h3>The three forms side by side</h3>
<table class="cmp">
<tr><th>Form</th><th>Recursive lookup</th><th>ARP for</th><th>Best on</th></tr>
<tr><td>Next hop only</td><td>Yes</td><td>Next hop</td><td>Any link (most common)</td></tr>
<tr><td>Exit interface only</td><td>No</td><td>Every destination (needs proxy ARP)</td><td>Point-to-point serial, tunnels</td></tr>
<tr><td>Fully specified</td><td>No</td><td>Next hop</td><td>Ethernet, IPv6 link-local next hops</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> An engineer hardens R3 with <code>no ip proxy-arp</code> on Gi0/1. R2's exit-interface route to Studio-B now fails: R2 ARPs for 172.16.3.10, nobody answers, and the ARP entry shows <code>Incomplete</code>. PC1 pings time out. Changing R2's route to <code>ip route 172.16.3.0 255.255.255.0 GigabitEthernet0/1 10.23.23.2</code> (fully specified) makes R2 ARP for 10.23.23.2, which R3 answers normally. Reachability returns with proxy ARP still off.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking an exit-interface static has AD 0 because it prints "directly connected". It has AD 1 like every static; <code>show ip route 172.16.3.0</code> shows <code>Known via "static", distance 1, metric 0 (connected)</code>. The word "connected" there describes the forwarding style, not the route source.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which static route form requires proxy ARP on the neighbour when used on Ethernet?" Exit interface only. "Which form avoids a recursive lookup?" Both exit interface and fully specified; the one that avoids recursion <b>and</b> proxy ARP is fully specified.</p></div>

<div class="scn"><h4>The firewall upgrade that broke the internet</h4><p>A company replaced its internet firewall. The core router had <code>ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/3</code> toward it, which had always worked because the old firewall answered proxy ARP. The new firewall did not. Users lost the internet, but the firewall's own address pinged fine. <code>show ip arp</code> on the core showed hundreds of <code>Incomplete</code> entries for public addresses. The fix was one line: <code>ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/3 192.0.2.1</code>, plus <code>clear ip arp</code>.</p><p><b>Lesson:</b> on Ethernet, never point a route at an interface alone; give the next hop.</p></div>

<div class="iv"><p class="q">"What is a recursive route lookup, and what problem does an exit-interface-only static cause on Ethernet?"</p><p>Strong answer: with a next-hop static, the router first matches the destination, then looks up the next-hop address to find the exit interface; if the next hop is not reachable the route is not installed. An exit-interface-only static on Ethernet makes the router treat every destination as on-link and ARP for each one, relying on the neighbour's proxy ARP; it bloats the ARP table and breaks if proxy ARP is off. The fix is a fully specified route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Next-hop statics need a recursive lookup to find the exit interface; CEF pre-resolves it.</li>
<li>If the next hop is not reachable through the table, the static is not installed.</li>
<li>Exit-interface-only statics on Ethernet ARP for every destination and depend on proxy ARP.</li>
<li>Exit-interface-only is fine on point-to-point serial links.</li>
<li>Fully specified (interface plus next hop) is the safest form on Ethernet.</li>
</ul></div>
`,hi:`
<p>Aap ek colleague se poochte ho ki finance office kahan hai. "Meena ki desk par jao." Theek hai, par Meena ki desk kahan hai? Aap phir poochte ho: "Second floor, east wing." Ek jawab ke liye do sawaal. Woh doosra sawaal <b>recursive lookup</b> hai. Ab socho aapko sirf bola gaya "east wali seedhi le lo". Aap upar jaate ho aur har milne wale insaan se poochna padta hai ki kya woh finance office hai. Yeh Ethernet par <b>sirf exit-interface</b> wala route hai.</p>

<h3>Recursive lookup, step by step</h3>
<p>Next-hop static route router ko batata hai ki <i>kisko</i> bhejna hai, <i>kaunsa interface</i> use karna hai yeh nahi. Isliye router khud next-hop address par doosra lookup karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Do steps mein recursive lookup">
<rect x="20" y="30" width="190" height="70" rx="8" fill="#bae6fd"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="13">172.16.3.10 ka packet</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="12">lookup 1</text>
<rect x="230" y="30" width="190" height="70" rx="8" fill="#ddd6fe"/><text x="325" y="55" text-anchor="middle" class="svg-ink" font-size="13">S 172.16.3.0/24</text><text x="325" y="78" text-anchor="middle" class="svg-muted" font-size="12">via 10.12.12.2</text>
<rect x="440" y="30" width="180" height="70" rx="8" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">C 10.12.12.0/30</text><text x="530" y="78" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 (lookup 2)</text>
<line x1="210" y1="65" x2="230" y2="65" stroke="#64748b" stroke-width="2"/><line x1="420" y1="65" x2="440" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="130" width="320" height="56" rx="8" fill="#fde68a"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">ARP sirf 10.12.12.2 ke liye</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">ek ARP entry har remote host ko serve karti hai</text>
<line x1="530" y1="100" x2="420" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Next-hop route ko do lookups chahiye: destination se next hop, phir next hop se interface.</p></div>
<ol>
<li>Destination 172.16.3.10 <code>S 172.16.3.0/24 via 10.12.12.2</code> se match karta hai.</li>
<li>Router 10.12.12.2 lookup karta hai aur <code>C 10.12.12.0/30, GigabitEthernet0/1</code> paata hai.</li>
<li>Woh 10.12.12.2 ke liye ek baar ARP karta hai aur R2 ke peeche ke har destination ke liye wahi MAC reuse karta hai.</li>
</ol>
<p>Recursion aur gehri bhi ho sakti hai. Agar next hop kisi door ke router ka loopback hai jo khud kisi doosre static se reach hota hai, to router chain follow karta hai jab tak connected route par na pahunch jaaye. CEF poori chain pehle se resolve kar leta hai, isliye modern routers par per-packet cost nahi hoti, lekin har extra level ek aur dependency hai jo toot sakti hai.</p>

<h3>Jab recursion fail ho</h3>
<p>Agar next hop table ke kisi route ke andar nahi aata, to static route <b>install nahi hota</b>. Configuration mein woh phir bhi dikhta hai, isliye beginners maan lete hain ki kaam kar raha hai. Is module ke NOC ticket mein exactly yahi bug hai:</p>
<pre class="out">BR-JAIPUR#show running-config | include ip route
ip route 10.10.0.0 255.255.0.0 10.99.0.6 name HQ-CAMPUS

BR-JAIPUR#show ip route 10.99.0.6
<span class="hl">% Subnet not in table</span></pre>
<p>BR ka WAN link 10.99.0.0/30 hai (.1 aur .2). 10.99.0.6 10.99.0.4/30 mein aata hai, jo BR ko pata hi nahi, isliye HQ route kabhi table mein nahi aata. Chapter 11 poora ticket walk through karta hai.</p>

<h3>Ethernet par exit-interface routes</h3>
<p>Sirf exit-interface wala route router ko batata hai ki destination network us interface se seedha reachable hai, jaise connected ho. <b>Point-to-point</b> link (serial HDLC ya PPP) par yeh perfect hai: doosre end par exactly ek device hai aur ARP nahi hota. <b>Ethernet</b> par, jo multi-access medium hai, router ko pata nahi ki kis neighbour ko bhejna hai, isliye woh har packet ke <b>final destination</b> ke liye ARP karta hai.</p>
<p>Yeh tabhi kaam karta hai jab padosi router apne peeche ke hosts ki taraf se un ARP requests ka jawab de, is feature ko <b>proxy ARP</b> kehte hain. Cisco IOS interfaces par proxy ARP default mein enable hota hai, isliye lab chalta hai, lekin kai security baselines ise <code>no ip proxy-arp</code> se disable karti hain.</p>
<pre class="out">R2#show ip arp GigabitEthernet0/1
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.23.23.1              -   5254.0012.0201  ARPA   GigabitEthernet0/1
Internet  10.23.23.2             12   5254.0012.0302  ARPA   GigabitEthernet0/1
<span class="hl">Internet  172.16.3.10             3   5254.0012.0302  ARPA   GigabitEthernet0/1
Internet  172.16.3.11             1   5254.0012.0302  ARPA   GigabitEthernet0/1</span></pre>
<p>Studio-B ka har host apni alag ARP entry ki tarah dikhta hai, sab R3 ke MAC ke saath: proxy ARP kaam kar raha hai. 250 users ke saath ek ki jagah 250 ARP entries. Ab ISP ki taraf <code>ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/2</code> socho: router har internet address ke liye ARP karta hai jo user visit kare, memory aur CPU bhar jaate hain, aur agar ISP proxy ARP disable kar de to poori tarah fail.</p>

<h3>Teeno forms side by side</h3>
<table class="cmp">
<tr><th>Form</th><th>Recursive lookup</th><th>ARP kiske liye</th><th>Kahan best</th></tr>
<tr><td>Sirf next hop</td><td>Haan</td><td>Next hop</td><td>Koi bhi link (sabse common)</td></tr>
<tr><td>Sirf exit interface</td><td>Nahi</td><td>Har destination (proxy ARP chahiye)</td><td>Point-to-point serial, tunnels</td></tr>
<tr><td>Fully specified</td><td>Nahi</td><td>Next hop</td><td>Ethernet, IPv6 link-local next hops</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek engineer R3 ko Gi0/1 par <code>no ip proxy-arp</code> se harden karta hai. R2 ka Studio-B wala exit-interface route ab fail hota hai: R2 172.16.3.10 ke liye ARP karta hai, koi jawab nahi deta, aur ARP entry <code>Incomplete</code> dikhati hai. PC1 ke pings time out. R2 ka route <code>ip route 172.16.3.0 255.255.255.0 GigabitEthernet0/1 10.23.23.2</code> (fully specified) karne se R2 10.23.23.2 ke liye ARP karta hai, jiska R3 normally jawab deta hai. Proxy ARP off rehte hue bhi reachability wapas aa jaati hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Sochna ki exit-interface static ki AD 0 hai kyunki woh "directly connected" print karta hai. Har static ki tarah iski AD 1 hai; <code>show ip route 172.16.3.0</code> dikhata hai <code>Known via "static", distance 1, metric 0 (connected)</code>. Wahan "connected" word forwarding style describe karta hai, route source nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Ethernet par use karne par kaunsa static route form neighbour par proxy ARP maangta hai?" Sirf exit interface. "Kaunsa form recursive lookup se bachata hai?" Exit interface aur fully specified dono; jo recursion <b>aur</b> proxy ARP dono se bachata hai woh fully specified hai.</p></div>

<div class="scn"><h4>Firewall upgrade jisne internet tod diya</h4><p>Ek company ne apna internet firewall replace kiya. Core router par uski taraf <code>ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/3</code> tha, jo hamesha chala kyunki purana firewall proxy ARP ka jawab deta tha. Naya firewall nahi deta tha. Users ka internet chala gaya, lekin firewall ka apna address ping ho raha tha. Core par <code>show ip arp</code> ne public addresses ke liye sainkadon <code>Incomplete</code> entries dikhayi. Fix ek line thi: <code>ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/3 192.0.2.1</code>, plus <code>clear ip arp</code>.</p><p><b>Seekh:</b> Ethernet par kabhi route ko sirf interface par point mat karo; next hop do.</p></div>

<div class="iv"><p class="q">"Recursive route lookup kya hai, aur sirf exit-interface wala static Ethernet par kya problem karta hai?"</p><p>Strong answer: next-hop static mein router pehle destination match karta hai, phir exit interface dhoondhne ke liye next-hop address lookup karta hai; agar next hop reachable nahi to route install nahi hota. Ethernet par sirf exit-interface static router se har destination ko on-link maanwata hai aur har ek ke liye ARP karwata hai, neighbour ke proxy ARP par depend karte hue; isse ARP table phoolti hai aur proxy ARP off ho to toot jaata hai. Fix hai fully specified route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Next-hop statics ko exit interface dhoondhne ke liye recursive lookup chahiye; CEF ise pehle se resolve karta hai.</li>
<li>Agar next hop table ke through reachable nahi hai, to static install nahi hota.</li>
<li>Ethernet par sirf exit-interface statics har destination ke liye ARP karte hain aur proxy ARP par depend karte hain.</li>
<li>Point-to-point serial links par sirf exit-interface theek hai.</li>
<li>Ethernet par fully specified (interface plus next hop) sabse safe form hai.</li>
</ul></div>
`}};export{e as default};