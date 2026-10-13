var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a courier-envelope analogy and now you can build, verify and repair GRE and IP-IP tunnels on Junos. This last chapter is your revision sheet: a can-do checklist, the most tested facts, a command cheat-sheet and a mini glossary. Read it the evening before your exam or interview.</p>

<h3>Can-do checklist</h3>
<p>Tick each line honestly. If you cannot do it without notes, reread the chapter in brackets.</p>
<ul>
<li>Explain encapsulation, decapsulation, passenger, delivery header, underlay and overlay (chapters 1 and 2).</li>
<li>State the protocol numbers and overheads of GRE and IP-IP, and which passengers each carries (chapter 2).</li>
<li>Configure a GRE tunnel on two routers with mirrored source and destination and a /30 overlay (chapter 3).</li>
<li>Configure IP-IP, and say when you would choose it over GRE (chapter 4).</li>
<li>Calculate the tunnel MTU, and prove it with a do-not-fragment ping (chapter 5).</li>
<li>Configure GRE keepalives and read the keepalive state (chapter 6).</li>
<li>Run OSPF over a tunnel with passive LANs and keep the WAN out of OSPF (chapter 7).</li>
<li>Recognise recursive routing from the log and fix it (chapter 8).</li>
</ul>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>GRE interface and IP protocol</td><td>gr-0/0/0, protocol 47</td></tr>
<tr><td>IP-IP interface and IP protocol</td><td>ip-0/0/0, protocol 4</td></tr>
<tr><td>GRE overhead and protocol MTU</td><td>24 bytes, 1476</td></tr>
<tr><td>IP-IP overhead and protocol MTU</td><td>20 bytes, 1480</td></tr>
<tr><td>Passengers</td><td>GRE: IPv4, IPv6, MPLS and others. IP-IP: IPv4 only</td></tr>
<tr><td>Keepalives</td><td>GRE only, under protocols oam gre-tunnel</td></tr>
<tr><td>Unit Up means</td><td>destination is routable, not that the far end works</td></tr>
<tr><td>Encryption</td><td>neither GRE nor IP-IP encrypts</td></tr>
<tr><td>OSPF on a tunnel unit</td><td>point-to-point: no DR/BDR, neighbour state Full</td></tr>
<tr><td>Recursive routing</td><td>destination learned through the tunnel; interface held down; flapping</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Tunnel summary map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">Underlay: reach destination</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Tunnel: source / dest</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">Overlay: /30 + OSPF</text>
<rect x="20" y="85" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="115" text-anchor="middle" class="svg-ink" font-size="13">MTU: 1476 / 1480</text>
<rect x="230" y="85" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">GRE keepalives (OAM)</text>
<rect x="440" y="85" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="115" text-anchor="middle" class="svg-ink" font-size="13">No recursion</text>
</svg><p class="cap">Six boxes to remember: underlay, tunnel, overlay, MTU, keepalives, no recursion.</p></div>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! GRE tunnel</span>
set interfaces gr-0/0/0 unit 0 tunnel source 203.0.113.1
set interfaces gr-0/0/0 unit 0 tunnel destination 203.0.113.9
set interfaces gr-0/0/0 unit 0 family inet address 172.31.6.1/30
<span class="c">! IP-IP tunnel: same, with ip-0/0/0</span>
set interfaces ip-0/0/0 unit 0 tunnel source 203.0.113.17
<span class="c">! Keepalives (GRE)</span>
set protocols oam gre-tunnel interface gr-0/0/0.0 keepalive-time 5 hold-time 15
<span class="c">! OSPF over the tunnel, LAN passive, WAN not in OSPF</span>
set protocols ospf area 0.0.0.0 interface gr-0/0/0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 passive

<span class="c">! Verify</span>
show interfaces gr-0/0/0.0 detail
show ospf neighbor
show route 192.168.63.0/24
ping 192.168.63.10 size 1448 do-not-fragment
show log messages | match recursive</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Encapsulation</dt><dd>Adding a new outer header around a packet.</dd>
<dt>Passenger</dt><dd>The inner packet carried by the tunnel.</dd>
<dt>Underlay</dt><dd>The real network that carries the outer packets.</dd>
<dt>Overlay</dt><dd>The logical network formed by tunnels and the routing on them.</dd>
<dt>GRE</dt><dd>Generic Routing Encapsulation: IP protocol 47, 4-byte header, carries many passenger types.</dd>
<dt>IP-IP</dt><dd>IPv4 in IPv4: IP protocol 4, no extra header.</dd>
<dt>MTU</dt><dd>Largest packet an interface sends without fragmenting.</dd>
<dt>DF bit</dt><dd>Don't Fragment: packets that are too big are dropped, not split.</dd>
<dt>Keepalive</dt><dd>Periodic probe that proves the far end of a tunnel is alive.</dd>
<dt>Recursive routing</dt><dd>The route to the tunnel destination points into the tunnel itself.</dd>
</dl>

<div class="eg"><p><b>Worked example for revision.</b> Given "R1 shows gr-0/0/0.0 Up, ping to the overlay address fails, and R3's tunnel destination is 203.0.113.2": use the workflow. The definition check (step 2) shows R3 points at the ISP, not R1 (203.0.113.1). Fix the destination and the overlay ping works.</p></div>

<div class="warn"><p><b>Last-minute mistake list.</b> Forgetting to mirror source and destination; adding WAN interfaces to OSPF; testing MTU with tiny pings; assuming Up means the far end works; assuming a tunnel is encrypted.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Numbers: 47, 4, 1476, 1480. Concepts: keepalives are GRE-only; IP-IP is IPv4-only; recursive routing means the destination is learned through the tunnel; and ping size is data bytes (add 28).</p></div>

<div class="scn"><h4>Putting it all together</h4><p>A new site must join head office within a day. You choose GRE for IPv6 readiness, mirror the two ends, give a /30 overlay, add keepalives of 5 and 15 seconds, run OSPF on the tunnel with the LAN passive and the WAN excluded, and lower the TCP MSS for the file servers. Verification takes five commands and the site is live.</p><p><b>Lesson:</b> each chapter of this module is one step of that checklist.</p></div>

<div class="iv"><p class="q">"Walk me through building and verifying a site-to-site GRE tunnel from scratch."</p><p>Prove the underlay route first, configure mirrored source and destination with a /30 overlay, verify the IP-Header line and an overlay ping, add keepalives, run OSPF on the tunnel with passive LANs and the WAN excluded, test large DF pings for MTU, and finally watch the log for flapping. Mention that GRE does not encrypt, so IPsec is added where privacy matters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel = outer header on top of a passenger; underlay carries it, overlay is the logical link.</li>
<li>GRE: gr-0/0/0, protocol 47, MTU 1476, keepalives. IP-IP: ip-0/0/0, protocol 4, MTU 1480, IPv4 only.</li>
<li>Mirror source and destination; check the IP-Header line on both routers.</li>
<li>OSPF on the tunnel, LANs passive, WAN out of OSPF.</li>
<li>Flapping with "recursive route" in the log means the destination is learned through the tunnel.</li>
</ul></div>
`,hi:`
<p>Is module ki shuruaat aapne courier-envelope analogy se ki thi aur ab aap Junos par GRE aur IP-IP tunnels banana, verify karna aur repair karna jaante ho. Yeh aakhri chapter aapki revision sheet hai: can-do checklist, sabse zyada pooche jaane wale facts, command cheat-sheet aur mini glossary. Exam ya interview se pehle ki shaam ise padho.</p>

<h3>Can-do checklist</h3>
<p>Har line imaandaari se tick karo. Notes ke bina na kar paao to bracket wala chapter dobara padho.</p>
<ul>
<li>Encapsulation, decapsulation, passenger, delivery header, underlay aur overlay samjhao (chapters 1 aur 2).</li>
<li>GRE aur IP-IP ke protocol numbers aur overhead batao, aur har ek kaunse passengers le jaata hai (chapter 2).</li>
<li>Do routers par mirrored source aur destination aur /30 overlay ke saath GRE tunnel configure karo (chapter 3).</li>
<li>IP-IP configure karo, aur batao ki GRE ki jagah use kab chunoge (chapter 4).</li>
<li>Tunnel MTU calculate karo, aur do-not-fragment ping se saabit karo (chapter 5).</li>
<li>GRE keepalives configure karo aur keepalive state padho (chapter 6).</li>
<li>Passive LANs ke saath tunnel par OSPF chalao aur WAN ko OSPF se bahar rakho (chapter 7).</li>
<li>Log se recursive routing pehchano aur fix karo (chapter 8).</li>
</ul>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>GRE interface aur IP protocol</td><td>gr-0/0/0, protocol 47</td></tr>
<tr><td>IP-IP interface aur IP protocol</td><td>ip-0/0/0, protocol 4</td></tr>
<tr><td>GRE overhead aur protocol MTU</td><td>24 bytes, 1476</td></tr>
<tr><td>IP-IP overhead aur protocol MTU</td><td>20 bytes, 1480</td></tr>
<tr><td>Passengers</td><td>GRE: IPv4, IPv6, MPLS aur bhi. IP-IP: sirf IPv4</td></tr>
<tr><td>Keepalives</td><td>sirf GRE, protocols oam gre-tunnel ke neeche</td></tr>
<tr><td>Unit Up ka matlab</td><td>destination routable hai, far end kaam kar raha hai yeh nahi</td></tr>
<tr><td>Encryption</td><td>na GRE na IP-IP encrypt karta hai</td></tr>
<tr><td>Tunnel unit par OSPF</td><td>point-to-point: DR/BDR nahi, neighbour state Full</td></tr>
<tr><td>Recursive routing</td><td>destination tunnel ke through seekhi; interface held down; flapping</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Tunnel summary map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">Underlay: destination tak</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Tunnel: source / dest</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">Overlay: /30 + OSPF</text>
<rect x="20" y="85" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="115" text-anchor="middle" class="svg-ink" font-size="13">MTU: 1476 / 1480</text>
<rect x="230" y="85" width="180" height="50" rx="8" fill="#fed7aa"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">GRE keepalives (OAM)</text>
<rect x="440" y="85" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="115" text-anchor="middle" class="svg-ink" font-size="13">Recursion nahi</text>
</svg><p class="cap">Yaad rakhne ke chhe box: underlay, tunnel, overlay, MTU, keepalives, recursion nahi.</p></div>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! GRE tunnel</span>
set interfaces gr-0/0/0 unit 0 tunnel source 203.0.113.1
set interfaces gr-0/0/0 unit 0 tunnel destination 203.0.113.9
set interfaces gr-0/0/0 unit 0 family inet address 172.31.6.1/30
<span class="c">! IP-IP tunnel: wahi, ip-0/0/0 ke saath</span>
set interfaces ip-0/0/0 unit 0 tunnel source 203.0.113.17
<span class="c">! Keepalives (GRE)</span>
set protocols oam gre-tunnel interface gr-0/0/0.0 keepalive-time 5 hold-time 15
<span class="c">! Tunnel par OSPF, LAN passive, WAN OSPF mein nahi</span>
set protocols ospf area 0.0.0.0 interface gr-0/0/0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0 passive

<span class="c">! Verify</span>
show interfaces gr-0/0/0.0 detail
show ospf neighbor
show route 192.168.63.0/24
ping 192.168.63.10 size 1448 do-not-fragment
show log messages | match recursive</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Encapsulation</dt><dd>Packet ke around naya outer header jodna.</dd>
<dt>Passenger</dt><dd>Tunnel jo inner packet le jaata hai.</dd>
<dt>Underlay</dt><dd>Asli network jo outer packets le jaata hai.</dd>
<dt>Overlay</dt><dd>Tunnels aur unpar routing se bana logical network.</dd>
<dt>GRE</dt><dd>Generic Routing Encapsulation: IP protocol 47, 4-byte header, kai passenger types.</dd>
<dt>IP-IP</dt><dd>IPv4 ke andar IPv4: IP protocol 4, koi extra header nahi.</dd>
<dt>MTU</dt><dd>Sabse bada packet jo interface bina fragment kiye bhejta hai.</dd>
<dt>DF bit</dt><dd>Don't Fragment: bahut bade packets split nahi hote, drop hote hain.</dd>
<dt>Keepalive</dt><dd>Periodic probe jo saabit karta hai ki tunnel ka far end zinda hai.</dd>
<dt>Recursive routing</dt><dd>Tunnel destination ka route tunnel ke andar hi ishaara karta hai.</dd>
</dl>

<div class="eg"><p><b>Revision ka worked example.</b> Diya hai "R1 par gr-0/0/0.0 Up hai, overlay address ka ping fail hai, aur R3 ka tunnel destination 203.0.113.2 hai": workflow use karo. Definition check (step 2) dikhata hai ki R3 ISP ko point karta hai, R1 (203.0.113.1) ko nahi. Destination theek karo to overlay ping chal jaata hai.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyon ki list.</b> Source aur destination mirror karna bhoolna; WAN interfaces ko OSPF mein daalna; chhote pings se MTU test karna; Up ko far end ka kaam karna maan lena; tunnel ko encrypted maan lena.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Numbers: 47, 4, 1476, 1480. Concepts: keepalives sirf GRE ke; IP-IP sirf IPv4; recursive routing matlab destination tunnel ke through seekhi gayi; aur ping size data bytes hai (28 jodo).</p></div>

<div class="scn"><h4>Sab kuch ek saath</h4><p>Nayi site ko ek din mein head office se judna hai. Aap IPv6-readiness ke liye GRE chunte ho, dono ends mirror karte ho, /30 overlay dete ho, 5 aur 15 second ke keepalives jodte ho, tunnel par OSPF chalate ho LAN passive aur WAN excluded ke saath, aur file servers ke liye TCP MSS kam karte ho. Verification paanch commands mein hota hai aur site live.</p><p><b>Lesson:</b> is module ka har chapter us checklist ka ek step hai.</p></div>

<div class="iv"><p class="q">"Site-to-site GRE tunnel zero se banana aur verify karna samjhao."</p><p>Pehle underlay route saabit karo, mirrored source aur destination aur /30 overlay configure karo, IP-Header line aur overlay ping verify karo, keepalives jodo, tunnel par OSPF chalao passive LANs aur WAN excluded ke saath, MTU ke liye bade DF pings test karo, aur aakhir mein flapping ke liye log dekho. Yeh bhi kaho ki GRE encrypt nahi karta, isliye jahan privacy chahiye wahan IPsec jodte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel = passenger ke upar outer header; underlay use le jaata hai, overlay logical link hai.</li>
<li>GRE: gr-0/0/0, protocol 47, MTU 1476, keepalives. IP-IP: ip-0/0/0, protocol 4, MTU 1480, sirf IPv4.</li>
<li>Source aur destination mirror karo; dono routers par IP-Header line check karo.</li>
<li>Tunnel par OSPF, LANs passive, WAN OSPF se bahar.</li>
<li>Log mein "recursive route" ke saath flapping matlab destination tunnel ke through seekhi gayi.</li>
</ul></div>
`}};export{e as default};