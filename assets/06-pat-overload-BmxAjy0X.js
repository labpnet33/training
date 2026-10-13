var e={id:`pat-overload`,h:{en:`PAT (overload): many hosts, one address, the port table`,hi:`PAT (overload): bahut hosts, ek address, port table`},body:{en:`
<p>A large apartment building has one street address, say "Sunrise Towers, 12 MG Road". Hundreds of families live there, and a courier still delivers correctly because every parcel also carries a <b>flat number</b>. The watchman keeps a register so that a reply addressed to "flat 504" reaches the right family. <b>PAT</b>, Port Address Translation, works exactly like that. Many inside hosts share one public address, and the router keeps them apart using the <b>transport port number</b> as the flat number. Cisco calls it <b>NAT overload</b>, and it is what runs in every home router and almost every branch office.</p>

<h3>How PAT keeps flows apart</h3>
<p>With plain NAT, the table key is the address alone. With PAT, each entry is a full flow: protocol, inside local address and port, inside global address and port, and the outside address and port. When a packet leaves, the router rewrites the source address to the shared inside global and, if needed, the source port too. When a reply arrives for inside global address X port Y, only one entry matches, so the router knows exactly which inside host and port to deliver it to.</p>
<ul>
<li><b>TCP and UDP</b> use the source port.</li>
<li><b>ICMP echo</b> has no ports, so PAT uses the <b>query identifier</b> in the echo request instead. That is why icmp lines show address:number.</li>
<li><b>Port preservation:</b> IOS first tries to keep the host's original source port. Only if that port is already in use on the inside global address for that protocol does it choose another free port.</li>
<li><b>Capacity:</b> ports are 16-bit, so in theory about 64,000 simultaneous flows per protocol per public address. In practice memory and platform limits come first, but one address easily serves a normal branch.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PAT port table">
<rect x="10" y="30" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="57" text-anchor="middle" class="svg-ink" font-size="12">PC1 192.168.1.10</text>
<rect x="10" y="130" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="157" text-anchor="middle" class="svg-ink" font-size="12">PC2 192.168.2.10</text>
<rect x="220" y="75" width="110" height="54" rx="8" fill="#bae6fd"/><text x="275" y="99" text-anchor="middle" class="svg-ink" font-size="13">BR</text><text x="275" y="117" text-anchor="middle" class="svg-muted" font-size="12">overload</text>
<line x1="160" y1="52" x2="220" y2="92" stroke="#64748b" stroke-width="2"/><line x1="160" y1="152" x2="220" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="102" x2="370" y2="102" stroke="#64748b" stroke-width="2"/>
<rect x="370" y="20" width="260" height="170" rx="8" fill="#fde68a"/>
<text x="500" y="44" text-anchor="middle" class="svg-ink" font-size="13">Port table</text>
<text x="385" y="74" class="svg-muted" font-size="12">1.10:51000 → .18:51000</text>
<text x="385" y="100" class="svg-muted" font-size="12">2.10:51000 → .18:1024</text>
<text x="385" y="126" class="svg-muted" font-size="12">1.10:1 icmp → .18:1</text>
<text x="385" y="152" class="svg-muted" font-size="12">2.10:1 icmp → .18:2</text>
<text x="500" y="180" text-anchor="middle" class="svg-accent" font-size="12">one address 203.0.113.18</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">A clash on port 51000 forces a new port for PC2.</text>
</svg><p class="cap">PAT gives every flow a unique inside global address:port pair.</p></div>

<h3>Lab walkthrough: PAT on the outside interface</h3>
<p>In the PAT lab, branch router BR has two LANs, 192.168.1.0/24 on g0/0 and 192.168.2.0/24 on g0/2, and one public address 203.0.113.18/30 on g0/1 facing the ISP.</p>
<pre class="code">BR(config)# interface g0/0
BR(config-if)#  ip nat inside
BR(config-if)# interface g0/2
BR(config-if)#  ip nat inside
BR(config-if)# interface g0/1
BR(config-if)#  ip nat outside
BR(config-if)# exit
<span class="c">! one line covers 192.168.0.0 - 192.168.3.255 (chapter 7)</span>
BR(config)# access-list 1 permit 192.168.0.0 0.0.3.255
<span class="c">! translate to whatever address g0/1 has, sharing it with ports</span>
BR(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload</pre>
<p>Using <code>interface</code> instead of a pool means the router always uses the current address of g0/1. That is ideal when the ISP assigns the WAN address with DHCP and it may change. Both PCs now browse and ping the server 198.51.100.80:</p>
<pre class="out">BR# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
<span class="hl">tcp  203.0.113.18:51000    192.168.1.10:51000    198.51.100.80:80      198.51.100.80:80
tcp  203.0.113.18:1024     192.168.2.10:51000    198.51.100.80:80      198.51.100.80:80</span>
icmp 203.0.113.18:1        192.168.1.10:1        198.51.100.80:1       198.51.100.80:1
icmp 203.0.113.18:2        192.168.2.10:1        198.51.100.80:1       198.51.100.80:1</pre>
<p>Read it carefully. Both inside locals map to <b>the same inside global address</b>, 203.0.113.18. PC1 kept its port 51000. PC2 also used 51000, which was already taken on 203.0.113.18, so PAT gave it 1024. There are no <code>---</code> lines, because PAT creates only per-flow entries.</p>

<h3>PAT on a pool</h3>
<p>If you have a small block, you can overload a pool instead:</p>
<pre class="code">EDGE(config)# ip nat pool PUBLIC 100.64.50.10 100.64.50.11 netmask 255.255.255.0
EDGE(config)# ip nat inside source list 20 pool PUBLIC overload</pre>
<p>IOS fills the first address with flows and moves to the next only when needed. This is the one-word fix for the pool exhaustion in chapter 5: PC3 would now share an address instead of being dropped.</p>

<h3>Timers</h3>
<p>PAT entries age out much faster than simple entries, which keeps the table small. Default idle timeouts on IOS: <b>ICMP 60 seconds</b>, <b>UDP 300 seconds</b>, <b>DNS 60 seconds</b>, and <b>established TCP 24 hours</b>, but a TCP entry is removed about 60 seconds after a FIN or RST closes the session. You can see the timers with <code>show ip nat translations verbose</code>. So in the lab, the icmp lines vanish a minute after the ping, while the tcp lines stay.</p>

<div class="eg"><p><b>Worked example.</b> A branch of 300 users averages 40 open flows per user at peak: 12,000 flows. One public address offers roughly 64,000 TCP and 64,000 UDP ports, so one address is enough with plenty of headroom. The same branch with dynamic NAT without overload would need 300 public addresses.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting the word <code>overload</code> on an interface rule. <code>ip nat inside source list 1 interface GigabitEthernet0/1</code> without it gives one-to-one use of a single address: the first host works and every other host fails. On many IOS versions the router adds overload automatically for interface rules, but never rely on it; always type it and verify with show running-config.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which keyword enables PAT?" It is <code>overload</code>. And "which part of the packet lets PAT distinguish hosts?" The transport-layer source port (ICMP query ID for pings), not the MAC address or TTL.</p></div>

<div class="scn"><h4>The game server that broke everyone's calls</h4><p>A hostel network used PAT on one address. Students complained that video calls dropped whenever a large online game tournament started. The engineer ran <code>show ip nat statistics</code> and saw around 60,000 active translations, most UDP from a few hosts. The one address was running out of UDP ports. He added a second address with a small pool and overload, and applied fair-use limits on the heaviest hosts with <code>ip nat translation max-entries all-host 2000</code>.</p><p><b>Lesson:</b> PAT scales far, but not infinitely; watch active translation counts on busy edges.</p></div>

<div class="iv"><p class="q">"How does PAT allow many hosts to share one public IP?"</p><p>Strong answer: it translates both the source address and, when needed, the source port, and stores each flow as protocol plus inside local address:port plus inside global address:port. Replies are matched on the inside global port, which is unique per flow. For ICMP it uses the query ID. IOS tries to preserve the original port and picks a new one on conflict. Configure with the overload keyword on an interface or a pool, verify with show ip nat translations, and note the short UDP and ICMP timeouts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAT = overload: many inside hosts share one inside global address, kept apart by ports.</li>
<li>ip nat inside source list ACL interface INTF overload, or … pool NAME overload.</li>
<li>Each flow is one entry: address:port pairs; no --- lines for PAT.</li>
<li>IOS preserves the original port if free; ICMP uses the query ID.</li>
<li>Default idle timers: ICMP 60 s, UDP 300 s, TCP 24 h (60 s after FIN/RST).</li>
</ul></div>
`,hi:`
<p>Ek badi apartment building ka ek street address hota hai, jaise "Sunrise Towers, 12 MG Road". Wahan sainkdon families rehti hain, phir bhi courier sahi delivery karta hai kyunki har parcel par ek <b>flat number</b> bhi hota hai. Watchman ek register rakhta hai taaki "flat 504" ko addressed reply sahi family tak pahunche. <b>PAT</b>, Port Address Translation, bilkul aise hi kaam karta hai. Bahut saare inside hosts ek public address share karte hain, aur router unhe <b>transport port number</b> ko flat number ki tarah use karke alag rakhta hai. Cisco ise <b>NAT overload</b> kehta hai, aur yahi har home router aur lagbhag har branch office mein chalta hai.</p>

<h3>PAT flows ko alag kaise rakhta hai</h3>
<p>Plain NAT mein table key sirf address hai. PAT mein har entry ek poora flow hai: protocol, inside local address aur port, inside global address aur port, aur outside address aur port. Jab packet nikalta hai, router source address ko shared inside global mein rewrite karta hai aur zaroorat ho to source port bhi. Jab inside global address X port Y ke liye reply aata hai, sirf ek entry match karti hai, isliye router ko exactly pata hota hai kis inside host aur port ko deliver karna hai.</p>
<ul>
<li><b>TCP aur UDP</b> source port use karte hain.</li>
<li><b>ICMP echo</b> mein ports nahi hote, isliye PAT echo request ka <b>query identifier</b> use karta hai. Isi liye icmp lines address:number dikhati hain.</li>
<li><b>Port preservation:</b> IOS pehle host ka original source port rakhne ki koshish karta hai. Sirf agar woh port us protocol ke liye inside global address par pehle se use mein hai, tab doosra free port chunta hai.</li>
<li><b>Capacity:</b> ports 16-bit ke hain, isliye theory mein har public address par har protocol ke lagbhag 64,000 simultaneous flows. Practice mein memory aur platform limits pehle aati hain, par ek address normal branch ko aaram se serve karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="PAT port table">
<rect x="10" y="30" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="57" text-anchor="middle" class="svg-ink" font-size="12">PC1 192.168.1.10</text>
<rect x="10" y="130" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="157" text-anchor="middle" class="svg-ink" font-size="12">PC2 192.168.2.10</text>
<rect x="220" y="75" width="110" height="54" rx="8" fill="#bae6fd"/><text x="275" y="99" text-anchor="middle" class="svg-ink" font-size="13">BR</text><text x="275" y="117" text-anchor="middle" class="svg-muted" font-size="12">overload</text>
<line x1="160" y1="52" x2="220" y2="92" stroke="#64748b" stroke-width="2"/><line x1="160" y1="152" x2="220" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="102" x2="370" y2="102" stroke="#64748b" stroke-width="2"/>
<rect x="370" y="20" width="260" height="170" rx="8" fill="#fde68a"/>
<text x="500" y="44" text-anchor="middle" class="svg-ink" font-size="13">Port table</text>
<text x="385" y="74" class="svg-muted" font-size="12">1.10:51000 → .18:51000</text>
<text x="385" y="100" class="svg-muted" font-size="12">2.10:51000 → .18:1024</text>
<text x="385" y="126" class="svg-muted" font-size="12">1.10:1 icmp → .18:1</text>
<text x="385" y="152" class="svg-muted" font-size="12">2.10:1 icmp → .18:2</text>
<text x="500" y="180" text-anchor="middle" class="svg-accent" font-size="12">ek address 203.0.113.18</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Port 51000 par clash hone se PC2 ko naya port milta hai.</text>
</svg><p class="cap">PAT har flow ko ek unique inside global address:port pair deta hai.</p></div>

<h3>Lab walkthrough: outside interface par PAT</h3>
<p>PAT lab mein branch router BR ke do LANs hain, g0/0 par 192.168.1.0/24 aur g0/2 par 192.168.2.0/24, aur ISP ki taraf g0/1 par ek public address 203.0.113.18/30.</p>
<pre class="code">BR(config)# interface g0/0
BR(config-if)#  ip nat inside
BR(config-if)# interface g0/2
BR(config-if)#  ip nat inside
BR(config-if)# interface g0/1
BR(config-if)#  ip nat outside
BR(config-if)# exit
<span class="c">! ek line 192.168.0.0 - 192.168.3.255 cover karti hai (chapter 7)</span>
BR(config)# access-list 1 permit 192.168.0.0 0.0.3.255
<span class="c">! g0/1 ka jo bhi address ho us par translate karo, ports ke saath share karke</span>
BR(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload</pre>
<p>Pool ki jagah <code>interface</code> use karne ka matlab hai router hamesha g0/1 ka current address use karega. Yeh tab ideal hai jab ISP WAN address DHCP se deta hai aur woh badal sakta hai. Ab dono PCs server 198.51.100.80 ko browse aur ping karte hain:</p>
<pre class="out">BR# show ip nat translations
Pro  Inside global         Inside local          Outside local         Outside global
<span class="hl">tcp  203.0.113.18:51000    192.168.1.10:51000    198.51.100.80:80      198.51.100.80:80
tcp  203.0.113.18:1024     192.168.2.10:51000    198.51.100.80:80      198.51.100.80:80</span>
icmp 203.0.113.18:1        192.168.1.10:1        198.51.100.80:1       198.51.100.80:1
icmp 203.0.113.18:2        192.168.2.10:1        198.51.100.80:1       198.51.100.80:1</pre>
<p>Dhyan se padho. Dono inside locals <b>same inside global address</b>, 203.0.113.18, par map hote hain. PC1 ne apna port 51000 rakha. PC2 ne bhi 51000 use kiya tha, jo 203.0.113.18 par pehle se liya hua tha, isliye PAT ne use 1024 diya. Koi <code>---</code> lines nahi hain, kyunki PAT sirf per-flow entries banata hai.</p>

<h3>Pool par PAT</h3>
<p>Agar aapke paas chhota block hai, to pool ko overload kar sakte ho:</p>
<pre class="code">EDGE(config)# ip nat pool PUBLIC 100.64.50.10 100.64.50.11 netmask 255.255.255.0
EDGE(config)# ip nat inside source list 20 pool PUBLIC overload</pre>
<p>IOS pehle address ko flows se bharta hai aur zaroorat padne par hi agle par jaata hai. Chapter 5 ke pool exhaustion ka yahi ek-shabd wala fix hai: PC3 ab drop hone ki jagah address share karega.</p>

<h3>Timers</h3>
<p>PAT entries simple entries se kahin jaldi age out hoti hain, jisse table chhoti rehti hai. IOS par default idle timeouts: <b>ICMP 60 seconds</b>, <b>UDP 300 seconds</b>, <b>DNS 60 seconds</b>, aur <b>established TCP 24 ghante</b>, par FIN ya RST se session band hone ke lagbhag 60 seconds baad TCP entry hat jaati hai. Timers <code>show ip nat translations verbose</code> se dikhte hain. Isliye lab mein icmp lines ping ke ek minute baad gayab ho jaati hain, jabki tcp lines rehti hain.</p>

<div class="eg"><p><b>Worked example.</b> 300 users ki branch mein peak par har user ke average 40 open flows hain: 12,000 flows. Ek public address lagbhag 64,000 TCP aur 64,000 UDP ports deta hai, isliye ek address kaafi hai aur bahut headroom bachta hai. Yahi branch bina overload dynamic NAT ke saath 300 public addresses maangti.</p></div>

<div class="warn"><p><b>Common galti.</b> Interface rule par <code>overload</code> shabd bhool jaana. Iske bina <code>ip nat inside source list 1 interface GigabitEthernet0/1</code> ek single address ka one-to-one use deta hai: pehla host chalta hai aur baaki sab fail. Kai IOS versions par router interface rules mein overload khud jod deta hai, par us par kabhi bharosa mat karo; hamesha type karo aur show running-config se verify karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa keyword PAT enable karta hai?" <code>overload</code>. Aur "packet ka kaunsa hissa PAT ko hosts alag karne deta hai?" Transport-layer source port (pings ke liye ICMP query ID), MAC address ya TTL nahi.</p></div>

<div class="scn"><h4>Game server jisne sabki calls tod di</h4><p>Ek hostel network ek address par PAT use karta tha. Students ki shikayat thi ki jab bhi bada online game tournament shuru hota, video calls drop ho jaati. Engineer ne <code>show ip nat statistics</code> chalaya aur lagbhag 60,000 active translations dekhe, zyada tar kuch hosts ke UDP. Ek address ke UDP ports khatam ho rahe the. Usne ek chhote pool aur overload ke saath doosra address joda, aur sabse heavy hosts par <code>ip nat translation max-entries all-host 2000</code> se fair-use limits lagayin.</p><p><b>Seekh:</b> PAT bahut door tak scale karta hai, par infinite nahi; busy edges par active translation counts par nazar rakho.</p></div>

<div class="iv"><p class="q">"PAT bahut saare hosts ko ek public IP share kaise karne deta hai?"</p><p>Strong answer: yeh source address aur zaroorat par source port dono translate karta hai, aur har flow ko protocol plus inside local address:port plus inside global address:port ki tarah store karta hai. Replies inside global port par match hote hain, jo har flow ke liye unique hai. ICMP ke liye query ID use hota hai. IOS original port rakhne ki koshish karta hai aur conflict par naya chunta hai. Interface ya pool par overload keyword se configure karo, show ip nat translations se verify karo, aur chhote UDP aur ICMP timeouts ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAT = overload: bahut saare inside hosts ek inside global address share karte hain, ports se alag.</li>
<li>ip nat inside source list ACL interface INTF overload, ya … pool NAME overload.</li>
<li>Har flow ek entry hai: address:port pairs; PAT mein --- lines nahi.</li>
<li>IOS free ho to original port rakhta hai; ICMP query ID use karta hai.</li>
<li>Default idle timers: ICMP 60 s, UDP 300 s, TCP 24 h (FIN/RST ke 60 s baad).</li>
</ul></div>
`}};export{e as default};