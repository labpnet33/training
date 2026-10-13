var e={id:`routing-over-tunnels`,h:{en:`Routing over a tunnel: OSPF, static routes and the underlay rule`,hi:`Tunnel par routing: OSPF, static routes aur underlay ka rule`},body:{en:`
<p>A tunnel by itself only moves packets between its two ends. The real goal of the Lucknow-Kanpur design is for PC1 (192.168.61.10) to reach PC3 (192.168.63.10). For that, each router must learn the other site's LAN and point it at the tunnel. You have two options: static routes or a dynamic routing protocol. The lab uses OSPF.</p>

<h3>Option 1: static routes through the tunnel</h3>
<p>The simplest approach is one line per remote LAN, with the far end's overlay address as next hop:</p>
<pre class="code"><span class="c">! R1: reach Kanpur LAN through the tunnel</span>
set routing-options static route 192.168.63.0/24 next-hop 172.31.6.2
<span class="c">! R3: reach Lucknow LAN through the tunnel</span>
set routing-options static route 192.168.61.0/24 next-hop 172.31.6.1</pre>
<p>Static routes are fine for a handful of sites. They do not react to failures unless the tunnel unit itself goes down (this is where GRE keepalives matter) and they do not scale. For many sites we use a protocol.</p>

<h3>Option 2: OSPF on the tunnel interface</h3>
<p>A tunnel unit is a point-to-point interface, so OSPF treats it like a serial link: neighbours form quickly and there is <b>no DR/BDR election</b>. The configuration puts the tunnel and the LAN into area 0 and makes the LAN passive:</p>
<pre class="code"><span class="c">! on both R1 and R3</span>
set protocols ospf area 0.0.0.0 interface gr-0/0/0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 passive
commit</pre>
<ul>
<li><code>gr-0/0/0.0</code> carries the OSPF adjacency across the overlay.</li>
<li><code>ge-0/0/1.0 passive</code> advertises the LAN prefix (192.168.61.0/24 or 192.168.63.0/24) but sends no hellos towards hosts. Passive interfaces keep unnecessary neighbours and attackers away from the LAN.</li>
<li>The WAN interface <code>ge-0/0/0.0</code> is deliberately <b>not</b> in OSPF. Chapter 8 explains why this is critical.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OSPF over GRE with passive LANs">
<rect x="20" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="52" text-anchor="middle" class="svg-ink" font-size="12">LAN 192.168.61.0/24</text><text x="75" y="68" text-anchor="middle" class="svg-muted" font-size="12">passive</text>
<rect x="510" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="565" y="52" text-anchor="middle" class="svg-ink" font-size="12">LAN 192.168.63.0/24</text><text x="565" y="68" text-anchor="middle" class="svg-muted" font-size="12">passive</text>
<rect x="150" y="100" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="200" y="135" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="390" y="100" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="440" y="135" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="75" y1="80" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="565" y1="80" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="130" x2="390" y2="130" stroke="#7c3aed" stroke-width="3"/><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">gr-0/0/0.0  OSPF area 0</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">172.31.6.1 and .2</text>
<text x="200" y="185" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0 not in OSPF</text><text x="440" y="185" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0 not in OSPF</text>
</svg><p class="cap">OSPF runs on the overlay only. The WAN (underlay) interfaces stay out of it.</p></div>

<h3>Verification</h3>
<p>Wait about half a minute for the adjacency, then check the neighbour, the learned route and finally an end-to-end ping. Real output from the lab:</p>
<pre class="out">lab@R1&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
172.31.6.2       gr-0/0/0.0             <span class="hl">Full</span>            10.255.6.3       128    31

lab@R1&gt; show route 192.168.63.0/24
inet.0: 10 destinations, 10 routes (10 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

<span class="hl">192.168.63.0/24    *[OSPF/10] 00:00:26, metric 2
                    &gt;  to 172.31.6.2 via gr-0/0/0.0</span>

PC1&gt; ping 192.168.63.10
84 bytes from 192.168.63.10 icmp_seq=1 ttl=62 time=0.500 ms</pre>
<p>The route has metric 2: the tunnel link costs 1 and the passive LAN interface adds 1. The next hop is the far end's <b>overlay</b> address 172.31.6.2, reached via the tunnel unit. The ping reply shows ttl=62: PC1 sent with 64, and R1 and R3 each decrement once. The tunnel itself counts as a single hop; the ISP is invisible to the inner packet.</p>

<h3>The golden rule: keep underlay and overlay separate</h3>
<p>Two different routing worlds share the same router:</p>
<table class="cmp"><tr><th>World</th><th>Purpose</th><th>Learned how</th></tr>
<tr><td>Underlay</td><td>Get outer packets to the tunnel destination</td><td>Static default to the ISP (or an underlay IGP)</td></tr>
<tr><td>Overlay</td><td>Carry the site LANs</td><td>OSPF or static, over the tunnel unit</td></tr></table>
<p>The rule that keeps the tunnel healthy is: <b>the route to the tunnel destination must never be learned through the tunnel</b>. Do not advertise WAN prefixes into the overlay protocol.</p>

<div class="eg"><p><b>Worked example.</b> R1's table has 0.0.0.0/0 via 203.0.113.2 (ge-0/0/0.0) for the underlay and 192.168.63.0/24 via 172.31.6.2 (gr-0/0/0.0) for the overlay. A packet to 192.168.63.10 matches the overlay route, is encapsulated towards 203.0.113.9, and that outer packet matches the default route. Clean separation: each lookup uses the right world.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding every interface to OSPF "just in case", including the WAN. This puts the underlay prefix into the overlay and causes recursive routing (chapter 8). Another is forgetting the <code>passive</code> keyword on the LAN, which sends hellos to hosts and is unnecessary.</p></div>
<div class="exam"><p><b>Exam trap.</b> A tunnel unit is point-to-point, so OSPF shows no DR/BDR on it and the neighbour state is Full, not 2-Way. Also remember a passive interface still advertises its prefix.</p></div>

<div class="scn"><h4>OSPF Full, but PC1 cannot reach PC3</h4><p>After the tunnel and OSPF came up, <code>show ospf neighbor</code> read Full on both routers, yet the users could not connect. The route table on R3 had no route to 192.168.61.0/24: the LAN interface on R1 had been left out of OSPF. Adding <code>interface ge-0/0/1.0 passive</code> advertised it, and the ping worked within seconds.</p><p><b>Lesson:</b> a Full adjacency only proves the neighbours talk. You still have to advertise the prefixes you want reachable.</p></div>

<div class="iv"><p class="q">"How do you run a routing protocol over a tunnel without causing problems?"</p><p>Run OSPF on the tunnel unit, advertise the LANs as passive interfaces, and keep the WAN/underlay prefixes out of the overlay protocol so the tunnel destination is never learned through the tunnel. Verify with <code>show ospf neighbor</code> and <code>show route</code>, and test with a ping between hosts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tunnel unit behaves like a point-to-point link: no DR election, Full adjacency.</li>
<li>Put the tunnel unit and the LAN (passive) in OSPF; leave the WAN interface out.</li>
<li>Static routes over a tunnel use the far overlay address as next hop.</li>
<li>Underlay routes reach the tunnel destination; overlay routes carry the LANs.</li>
<li>Never learn the tunnel destination through the tunnel itself.</li>
</ul></div>
`,hi:`
<p>Tunnel akela sirf apne do ends ke beech packets le jaata hai. Lucknow-Kanpur design ka asli maqsad hai ki PC1 (192.168.61.10) PC3 (192.168.63.10) tak pahunche. Iske liye har router ko doosri site ki LAN seekhni hogi aur use tunnel ki taraf point karna hoga. Do raaste hain: static routes ya dynamic routing protocol. Lab OSPF use karta hai.</p>

<h3>Option 1: tunnel ke through static routes</h3>
<p>Sabse simple tareeka: har remote LAN ke liye ek line, next hop ke roop mein far end ka overlay address:</p>
<pre class="code"><span class="c">! R1: Kanpur LAN tunnel ke through</span>
set routing-options static route 192.168.63.0/24 next-hop 172.31.6.2
<span class="c">! R3: Lucknow LAN tunnel ke through</span>
set routing-options static route 192.168.61.0/24 next-hop 172.31.6.1</pre>
<p>Kuch hi sites ke liye static routes theek hain. Woh failures par react nahi karte jab tak tunnel unit khud down na ho (yahin GRE keepalives kaam aate hain) aur scale nahi karte. Bahut sites ke liye protocol use karte hain.</p>

<h3>Option 2: tunnel interface par OSPF</h3>
<p>Tunnel unit point-to-point interface hai, isliye OSPF use serial link ki tarah treat karta hai: neighbours jaldi bante hain aur <b>DR/BDR election nahi</b> hota. Configuration tunnel aur LAN ko area 0 mein daalti hai aur LAN ko passive karti hai:</p>
<pre class="code"><span class="c">! R1 aur R3 dono par</span>
set protocols ospf area 0.0.0.0 interface gr-0/0/0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 passive
commit</pre>
<ul>
<li><code>gr-0/0/0.0</code> overlay ke paar OSPF adjacency le jaata hai.</li>
<li><code>ge-0/0/1.0 passive</code> LAN prefix (192.168.61.0/24 ya 192.168.63.0/24) advertise karta hai lekin hosts ki taraf hellos nahi bhejta. Passive interfaces LAN se faltu neighbours aur attackers ko door rakhte hain.</li>
<li>WAN interface <code>ge-0/0/0.0</code> jaanbujhkar OSPF mein <b>nahi</b> hai. Chapter 8 batata hai yeh itna zaroori kyun hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Passive LANs ke saath GRE par OSPF">
<rect x="20" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="52" text-anchor="middle" class="svg-ink" font-size="12">LAN 192.168.61.0/24</text><text x="75" y="68" text-anchor="middle" class="svg-muted" font-size="12">passive</text>
<rect x="510" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="565" y="52" text-anchor="middle" class="svg-ink" font-size="12">LAN 192.168.63.0/24</text><text x="565" y="68" text-anchor="middle" class="svg-muted" font-size="12">passive</text>
<rect x="150" y="100" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="200" y="135" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="390" y="100" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="440" y="135" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="75" y1="80" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="565" y1="80" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="130" x2="390" y2="130" stroke="#7c3aed" stroke-width="3"/><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">gr-0/0/0.0  OSPF area 0</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">172.31.6.1 aur .2</text>
<text x="200" y="185" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0 OSPF mein nahi</text><text x="440" y="185" text-anchor="middle" class="svg-muted" font-size="12">ge-0/0/0 OSPF mein nahi</text>
</svg><p class="cap">OSPF sirf overlay par chalta hai. WAN (underlay) interfaces usse bahar rehte hain.</p></div>

<h3>Verification</h3>
<p>Adjacency ke liye lagbhag aadha minute ruko, phir neighbour, seekha hua route aur end-to-end ping check karo. Lab ka real output:</p>
<pre class="out">lab@R1&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
172.31.6.2       gr-0/0/0.0             <span class="hl">Full</span>            10.255.6.3       128    31

lab@R1&gt; show route 192.168.63.0/24
inet.0: 10 destinations, 10 routes (10 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

<span class="hl">192.168.63.0/24    *[OSPF/10] 00:00:26, metric 2
                    &gt;  to 172.31.6.2 via gr-0/0/0.0</span>

PC1&gt; ping 192.168.63.10
84 bytes from 192.168.63.10 icmp_seq=1 ttl=62 time=0.500 ms</pre>
<p>Route ka metric 2 hai: tunnel link ki cost 1 aur passive LAN interface ka 1. Next hop far end ka <b>overlay</b> address 172.31.6.2 hai, jo tunnel unit se reach hota hai. Ping reply mein ttl=62: PC1 ne 64 se bheja aur R1 aur R3 ne ek-ek baar ghataya. Tunnel khud ek hi hop gina jaata hai; ISP inner packet ko dikhta hi nahi.</p>

<h3>Sunehra rule: underlay aur overlay alag rakho</h3>
<p>Ek hi router par do alag routing duniya hain:</p>
<table class="cmp"><tr><th>Duniya</th><th>Maqsad</th><th>Kaise seekhi</th></tr>
<tr><td>Underlay</td><td>Outer packets ko tunnel destination tak pahunchana</td><td>ISP ki taraf static default (ya underlay IGP)</td></tr>
<tr><td>Overlay</td><td>Site LANs le jaana</td><td>Tunnel unit par OSPF ya static</td></tr></table>
<p>Tunnel ko healthy rakhne wala rule: <b>tunnel destination ka route kabhi tunnel ke through nahi seekha jaana chahiye</b>. WAN prefixes ko overlay protocol mein advertise mat karo.</p>

<div class="eg"><p><b>Worked example.</b> R1 ki table mein underlay ke liye 0.0.0.0/0 via 203.0.113.2 (ge-0/0/0.0) aur overlay ke liye 192.168.63.0/24 via 172.31.6.2 (gr-0/0/0.0) hai. 192.168.63.10 ka packet overlay route se match hota hai, 203.0.113.9 ki taraf encapsulate hota hai, aur woh outer packet default route se match hota hai. Saaf separation: har lookup sahi duniya use karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Kisi bhi halat ke liye" har interface ko OSPF mein daal dena, WAN ko bhi. Isse underlay prefix overlay mein chala jaata hai aur recursive routing hoti hai (chapter 8). Ek aur: LAN par <code>passive</code> keyword bhool jaana, jisse hosts ko hellos jaate hain jo zaroori nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnel unit point-to-point hai, isliye us par OSPF mein DR/BDR nahi dikhta aur neighbour state Full hoti hai, 2-Way nahi. Yeh bhi yaad rakho ki passive interface apna prefix phir bhi advertise karta hai.</p></div>

<div class="scn"><h4>OSPF Full, phir bhi PC1 PC3 tak nahi pahunchta</h4><p>Tunnel aur OSPF up hone ke baad dono routers par <code>show ospf neighbor</code> Full tha, phir bhi users connect nahi kar paaye. R3 ki route table mein 192.168.61.0/24 ka route nahi tha: R1 ka LAN interface OSPF se bahar chhoot gaya tha. <code>interface ge-0/0/1.0 passive</code> jodte hi woh advertise hua aur ping kuch seconds mein chal gaya.</p><p><b>Lesson:</b> Full adjacency sirf yeh saabit karti hai ki neighbours baat kar rahe hain. Jo prefixes reachable chahiye unhe advertise karna aapko hi padta hai.</p></div>

<div class="iv"><p class="q">"Tunnel par routing protocol bina problem ke kaise chalate ho?"</p><p>Tunnel unit par OSPF chalao, LANs ko passive interfaces ke roop mein advertise karo, aur WAN/underlay prefixes ko overlay protocol se bahar rakho taaki tunnel destination kabhi tunnel ke through na seekhi jaaye. <code>show ospf neighbor</code> aur <code>show route</code> se verify karo, aur hosts ke beech ping se test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel unit point-to-point link ki tarah chalta hai: DR election nahi, Full adjacency.</li>
<li>Tunnel unit aur LAN (passive) ko OSPF mein daalo; WAN interface bahar rakho.</li>
<li>Tunnel par static routes ka next hop far overlay address hota hai.</li>
<li>Underlay routes tunnel destination tak pahunchate hain; overlay routes LANs le jaate hain.</li>
<li>Tunnel destination ko tunnel ke through kabhi mat seekho.</li>
</ul></div>
`}};export{e as default};