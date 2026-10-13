var e={id:`troubleshooting`,h:{en:`Verification and troubleshooting: a layered workflow`,hi:`Verification aur troubleshooting: layered workflow`},body:{en:`
<p>A doctor does not start with an MRI. First pulse and temperature, then the obvious questions, then targeted tests. BGP troubleshooting works best the same way: three layers, always in order. <b>Is the session up? Are the right routes exchanged? Is traffic following them?</b> Most tickets are solved in the first layer within two commands.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Three-layer BGP troubleshooting workflow">
<rect x="10" y="20" width="195" height="190" rx="10" fill="#fed7aa"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="14">1. Session</text>
<text x="107" y="75" text-anchor="middle" class="svg-muted" font-size="12">show ip bgp summary</text><text x="107" y="100" text-anchor="middle" class="svg-muted" font-size="12">Idle: route, multihop,</text><text x="107" y="118" text-anchor="middle" class="svg-muted" font-size="12">shutdown</text><text x="107" y="145" text-anchor="middle" class="svg-muted" font-size="12">Active: TCP 179, IPs,</text><text x="107" y="163" text-anchor="middle" class="svg-muted" font-size="12">ACL, source, MD5</text><text x="107" y="190" text-anchor="middle" class="svg-muted" font-size="12">Flap: AS, timers</text>
<rect x="222" y="20" width="195" height="190" rx="10" fill="#bae6fd"/><text x="319" y="45" text-anchor="middle" class="svg-ink" font-size="14">2. Routes</text>
<text x="319" y="75" text-anchor="middle" class="svg-muted" font-size="12">show ip bgp</text><text x="319" y="100" text-anchor="middle" class="svg-muted" font-size="12">network matches RIB?</text><text x="319" y="125" text-anchor="middle" class="svg-muted" font-size="12">advertised-routes</text><text x="319" y="150" text-anchor="middle" class="svg-muted" font-size="12">next hop valid (*)?</text><text x="319" y="175" text-anchor="middle" class="svg-muted" font-size="12">filters, AS loop</text>
<rect x="434" y="20" width="195" height="190" rx="10" fill="#bbf7d0"/><text x="531" y="45" text-anchor="middle" class="svg-ink" font-size="14">3. Forwarding</text>
<text x="531" y="75" text-anchor="middle" class="svg-muted" font-size="12">show ip route bgp</text><text x="531" y="100" text-anchor="middle" class="svg-muted" font-size="12">RIB-failure (r)?</text><text x="531" y="125" text-anchor="middle" class="svg-muted" font-size="12">return path exists?</text><text x="531" y="150" text-anchor="middle" class="svg-muted" font-size="12">expected best path?</text><text x="531" y="175" text-anchor="middle" class="svg-muted" font-size="12">ping, traceroute</text>
</svg><p class="cap">Never debug routes before the session is Established, and never debug forwarding before the routes are right.</p></div>

<h3>Layer 1: the session</h3>
<p>Start with <code>show ip bgp summary</code>. A number in State/PfxRcd means Established; move to layer 2. A word means the session is down:</p>
<table class="cmp"><tr><th>State</th><th>Most likely causes</th><th>Check with</th></tr>
<tr><td>Idle</td><td>No route to the neighbor; eBGP peer not directly connected and no <code>ebgp-multihop</code>; <code>neighbor shutdown</code> (Idle (Admin)); max-prefix reached (Idle (PfxCt))</td><td><code>show ip route x</code>, <code>show ip bgp neighbors x</code></td></tr>
<tr><td>Active</td><td>TCP to port 179 cannot complete: wrong neighbor IP on either side, peer not configured for you, ACL or firewall, missing <code>update-source</code>, MD5 password mismatch</td><td><code>ping x source y</code>, <code>telnet x 179 /source-interface y</code>, <code>show ip access-lists</code>, the log</td></tr>
<tr><td>Flapping Idle and Active with NOTIFICATIONs</td><td>Wrong <code>remote-as</code> (2/2), duplicate router ID (2/3), hold timer expiry (4/0)</td><td>The log: <code>%BGP-3-NOTIFICATION</code></td></tr>
</table>
<p>Remember the lab 2 example: R3's loopback session was <b>Idle</b> and <code>show ip bgp neighbors 2.2.2.2</code> said "External BGP neighbor not directly connected"; the fix was <code>ebgp-multihop 2</code>. A wrong AS shows up in the log like this:</p>
<pre class="out"><span class="hl">%BGP-3-NOTIFICATION: sent to neighbor 100.64.10.1 passive 2/2 (peer in wrong AS) 2 bytes FBF4</span></pre>
<p>FBF4 is hexadecimal for 64500: the peer's real AS, which does not match what you configured.</p>

<h3>Layer 2: the routes</h3>
<ul>
<li><b>Not originated?</b> <code>show ip bgp</code> has no <code>0.0.0.0</code> line for your prefix: the <code>network</code> statement does not match the RIB exactly (lab 1 task 2).</li>
<li><b>Originated but not sent?</b> <code>show ip bgp neighbors x advertised-routes</code> is empty: an outbound filter or route-map is blocking it.</li>
<li><b>Received but not valid?</b> No <code>*</code>: the next hop is unreachable (common with iBGP or loopback peering without a route).</li>
<li><b>Never received?</b> The peer's AS_PATH contains your ASN (loop prevention) or the peer filters it.</li>
</ul>

<h3>Layer 3: forwarding</h3>
<p>Check <code>show ip route bgp</code>. A route with <code>r</code> in the BGP table lost to a lower-AD source. Test with ping and traceroute <b>from the right source</b>: in lab 1, PC1's pings only work because the ISP learned 192.168.50.0/24; in lab 2, task 5 works only when both LANs appear with <code>*&gt;</code> in every router's table.</p>

<h3>Ticket walk-through: session stuck in Active</h3>
<p><b>Ticket:</b> "After last night's security hardening on CUST-EDGE, the internet is down for Kaveri Textiles. The ISP says its side has not changed."</p>
<pre class="out">CUST-EDGE# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">100.64.10.1     4        64500       0       0        1    0    0 00:41:07 Active</span>

CUST-EDGE# ping 100.64.10.1 source GigabitEthernet0/0
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms

CUST-EDGE# telnet 100.64.10.1 179 /source-interface GigabitEthernet0/0
Trying 100.64.10.1, 179 ...
<span class="hl">% Connection timed out; remote host not responding</span></pre>
<p>Active plus a working ping means IP reachability is fine and TCP 179 is the problem. A <b>timeout</b> points to something silently dropping packets; a "Connection refused by remote host" would instead mean the peer received the SYN but has no matching neighbor statement. The hardening change is the obvious suspect:</p>
<pre class="out">CUST-EDGE# show ip access-lists EDGE-IN
Extended IP access list EDGE-IN
    10 permit icmp any any (27 matches)
    20 permit udp any any eq domain (112 matches)
<span class="hl">    30 deny ip any any (64 matches)</span></pre>
<p>The ACL on g0/0 inbound allows ping but drops the ISP's TCP SYNs to port 179 and the SYN-ACK replies to CUST-EDGE's own attempts. BGP needs <b>both directions</b> permitted:</p>
<pre class="code">CUST-EDGE(config)# ip access-list extended EDGE-IN
CUST-EDGE(config-ext-nacl)# 5 permit tcp host 100.64.10.1 host 100.64.10.2 eq bgp
<span class="c">! the ISP opens TCP to our port 179</span>
CUST-EDGE(config-ext-nacl)# 6 permit tcp host 100.64.10.1 eq bgp host 100.64.10.2
<span class="c">! replies from the ISP's port 179 when we open the session</span></pre>
<p>Within one retry interval the log shows <code>%BGP-5-ADJCHANGE: neighbor 100.64.10.1 Up</code>, State/PfxRcd returns to 2, and PC1 can reach 203.0.113.1 again. Other root causes that produce the same Active symptom, and how you would recognise them: a typo in the neighbor IP on either side (refused or no answer), a missing <code>update-source</code> on loopback peering (refused), and an MD5 mismatch (the log shows <code>%TCP-6-BADAUTH: Invalid MD5 digest</code> or <code>No MD5 digest</code>).</p>

<div class="eg"><p><b>Worked example.</b> In lab 2 a learner configures R1 with <code>neighbor 10.12.0.2 remote-as 65201</code> by mistake. TCP comes up, R2 sends an OPEN with My AS 65102, and R1 answers with NOTIFICATION 2/2. R1's log shows <code>peer in wrong AS ... 2 bytes</code> followed by the peer's real AS in hexadecimal. Convert it carefully: 65102 = 65024 + 78 = 0xFE00 + 0x4E, so the log shows <b>FE4E</b>. Converting the bytes tells you which AS the peer really uses; then you correct <code>remote-as</code> to 65102.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using <code>clear ip bgp *</code> as a first reaction. It resets every session on the router, withdraws all routes and causes an outage bigger than the original ticket. Diagnose first, and use <code>clear ip bgp x soft</code> when only policy changed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Idle usually means "not even trying" (routing, multihop, shutdown); Active means "trying TCP and failing". A wrong AS number is <b>not</b> an Active problem: TCP succeeds and the OPEN is rejected with NOTIFICATION 2/2.</p></div>

<div class="scn"><h4>The ACL that only broke half the time</h4><p>A customer's session to an ISP sometimes came up after a reload and sometimes stayed Active for hours. The edge ACL had one line, <code>permit tcp host ISP host CE eq bgp</code>, allowing the ISP's SYN to port 179 but not replies from the ISP's port 179. When the ISP happened to open the session, it worked; when the customer router opened it, the SYN-ACK was dropped. Adding the reverse line made the session come up reliably.</p><p><b>Lesson:</b> either peer may be the TCP client, so ACLs must permit port 179 as destination and as source.</p></div>

<div class="iv"><p class="q">"A BGP neighbor is stuck in Active. How do you troubleshoot it?"</p><p>Strong answer: Active means TCP to port 179 is failing. Ping the neighbor from the correct source; confirm the neighbor IP and remote-as on both sides; test <code>telnet x 179</code> from the right source and read the result (timeout = filtered, refused = peer not configured for you); check ACLs and firewalls for port 179 in both directions; check <code>update-source</code> and <code>ebgp-multihop</code> for loopback peering; check the log for MD5 errors. Only after Established move on to routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in layers: session, then routes, then forwarding.</li>
<li>Idle: routing, multihop, shutdown, max-prefix. Active: TCP 179, IPs, ACLs, update-source, MD5.</li>
<li>Wrong AS gives NOTIFICATION 2/2 with the peer's real AS in hex.</li>
<li>Routes missing: check network-to-RIB match, advertised-routes, next-hop validity, filters.</li>
<li>Permit TCP 179 in both directions; either peer can open the session.</li>
</ul></div>
`,hi:`
<p>Doctor MRI se shuru nahi karta. Pehle nabz aur temperature, phir saaf saaf sawaal, phir targeted tests. BGP troubleshooting bhi aise hi sabse achha chalta hai: teen layers, hamesha order mein. <b>Kya session up hai? Kya sahi routes exchange ho rahe hain? Kya traffic unhe follow kar raha hai?</b> Zyada tar tickets pehli layer mein do commands mein solve ho jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Teen-layer BGP troubleshooting workflow">
<rect x="10" y="20" width="195" height="190" rx="10" fill="#fed7aa"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="14">1. Session</text>
<text x="107" y="75" text-anchor="middle" class="svg-muted" font-size="12">show ip bgp summary</text><text x="107" y="100" text-anchor="middle" class="svg-muted" font-size="12">Idle: route, multihop,</text><text x="107" y="118" text-anchor="middle" class="svg-muted" font-size="12">shutdown</text><text x="107" y="145" text-anchor="middle" class="svg-muted" font-size="12">Active: TCP 179, IPs,</text><text x="107" y="163" text-anchor="middle" class="svg-muted" font-size="12">ACL, source, MD5</text><text x="107" y="190" text-anchor="middle" class="svg-muted" font-size="12">Flap: AS, timers</text>
<rect x="222" y="20" width="195" height="190" rx="10" fill="#bae6fd"/><text x="319" y="45" text-anchor="middle" class="svg-ink" font-size="14">2. Routes</text>
<text x="319" y="75" text-anchor="middle" class="svg-muted" font-size="12">show ip bgp</text><text x="319" y="100" text-anchor="middle" class="svg-muted" font-size="12">network RIB se match?</text><text x="319" y="125" text-anchor="middle" class="svg-muted" font-size="12">advertised-routes</text><text x="319" y="150" text-anchor="middle" class="svg-muted" font-size="12">next hop valid (*)?</text><text x="319" y="175" text-anchor="middle" class="svg-muted" font-size="12">filters, AS loop</text>
<rect x="434" y="20" width="195" height="190" rx="10" fill="#bbf7d0"/><text x="531" y="45" text-anchor="middle" class="svg-ink" font-size="14">3. Forwarding</text>
<text x="531" y="75" text-anchor="middle" class="svg-muted" font-size="12">show ip route bgp</text><text x="531" y="100" text-anchor="middle" class="svg-muted" font-size="12">RIB-failure (r)?</text><text x="531" y="125" text-anchor="middle" class="svg-muted" font-size="12">return path hai?</text><text x="531" y="150" text-anchor="middle" class="svg-muted" font-size="12">expected best path?</text><text x="531" y="175" text-anchor="middle" class="svg-muted" font-size="12">ping, traceroute</text>
</svg><p class="cap">Session Established hone se pehle kabhi routes debug mat karo, aur routes sahi hone se pehle kabhi forwarding debug mat karo.</p></div>

<h3>Layer 1: session</h3>
<p><code>show ip bgp summary</code> se shuru karo. State/PfxRcd mein number matlab Established; layer 2 par jao. Word matlab session down hai:</p>
<table class="cmp"><tr><th>State</th><th>Sabse likely wajah</th><th>Kisse check karo</th></tr>
<tr><td>Idle</td><td>Neighbor tak route nahi; eBGP peer directly connected nahi aur <code>ebgp-multihop</code> nahi; <code>neighbor shutdown</code> (Idle (Admin)); max-prefix pahunch gaya (Idle (PfxCt))</td><td><code>show ip route x</code>, <code>show ip bgp neighbors x</code></td></tr>
<tr><td>Active</td><td>Port 179 tak TCP complete nahi ho pa raha: kisi bhi side galat neighbor IP, peer aapke liye configured nahi, ACL ya firewall, missing <code>update-source</code>, MD5 password mismatch</td><td><code>ping x source y</code>, <code>telnet x 179 /source-interface y</code>, <code>show ip access-lists</code>, log</td></tr>
<tr><td>NOTIFICATIONs ke saath Idle aur Active mein flap</td><td>Galat <code>remote-as</code> (2/2), duplicate router ID (2/3), hold timer expiry (4/0)</td><td>Log: <code>%BGP-3-NOTIFICATION</code></td></tr>
</table>
<p>Lab 2 ka example yaad karo: R3 ka loopback session <b>Idle</b> tha aur <code>show ip bgp neighbors 2.2.2.2</code> keh raha tha "External BGP neighbor not directly connected"; fix tha <code>ebgp-multihop 2</code>. Galat AS log mein aise dikhta hai:</p>
<pre class="out"><span class="hl">%BGP-3-NOTIFICATION: sent to neighbor 100.64.10.1 passive 2/2 (peer in wrong AS) 2 bytes FBF4</span></pre>
<p>FBF4 hexadecimal mein 64500 hai: peer ka asli AS, jo aapke configure kiye se match nahi karta.</p>

<h3>Layer 2: routes</h3>
<ul>
<li><b>Originate nahi hua?</b> <code>show ip bgp</code> mein aapke prefix ki <code>0.0.0.0</code> wali line nahi hai: <code>network</code> statement RIB se exactly match nahi karta (lab 1 task 2).</li>
<li><b>Originate hua par bheja nahi?</b> <code>show ip bgp neighbors x advertised-routes</code> khali hai: koi outbound filter ya route-map use rok raha hai.</li>
<li><b>Mila par valid nahi?</b> <code>*</code> nahi: next hop unreachable hai (iBGP ya bina route ke loopback peering mein common).</li>
<li><b>Kabhi mila hi nahi?</b> Peer ke AS_PATH mein aapka ASN hai (loop prevention) ya peer use filter karta hai.</li>
</ul>

<h3>Layer 3: forwarding</h3>
<p><code>show ip route bgp</code> check karo. BGP table mein <code>r</code> wala route kam AD wale source se haar gaya. Ping aur traceroute <b>sahi source se</b> test karo: lab 1 mein PC1 ke pings sirf isliye chalte hain kyunki ISP ne 192.168.50.0/24 seekha; lab 2 mein task 5 tabhi chalta hai jab dono LANs har router ki table mein <code>*&gt;</code> ke saath dikhein.</p>

<h3>Ticket walk-through: Active mein atka session</h3>
<p><b>Ticket:</b> "Kal raat CUST-EDGE par security hardening ke baad Kaveri Textiles ka internet down hai. ISP kehta hai unki side kuch nahi badla."</p>
<pre class="out">CUST-EDGE# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">100.64.10.1     4        64500       0       0        1    0    0 00:41:07 Active</span>

CUST-EDGE# ping 100.64.10.1 source GigabitEthernet0/0
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms

CUST-EDGE# telnet 100.64.10.1 179 /source-interface GigabitEthernet0/0
Trying 100.64.10.1, 179 ...
<span class="hl">% Connection timed out; remote host not responding</span></pre>
<p>Active plus chalta hua ping matlab IP reachability theek hai aur TCP 179 problem hai. <b>Timeout</b> kisi aisi cheez ki taraf ishara karta hai jo packets chupchaap drop kar rahi hai; "Connection refused by remote host" ka matlab hota ki peer ko SYN mila par uske paas matching neighbor statement nahi hai. Hardening change saaf suspect hai:</p>
<pre class="out">CUST-EDGE# show ip access-lists EDGE-IN
Extended IP access list EDGE-IN
    10 permit icmp any any (27 matches)
    20 permit udp any any eq domain (112 matches)
<span class="hl">    30 deny ip any any (64 matches)</span></pre>
<p>g0/0 inbound par ACL ping allow karta hai par port 179 ki taraf ISP ke TCP SYNs aur CUST-EDGE ki apni koshishon ke SYN-ACK replies drop karta hai. BGP ko <b>dono directions</b> permit chahiye:</p>
<pre class="code">CUST-EDGE(config)# ip access-list extended EDGE-IN
CUST-EDGE(config-ext-nacl)# 5 permit tcp host 100.64.10.1 host 100.64.10.2 eq bgp
<span class="c">! ISP hamare port 179 par TCP kholta hai</span>
CUST-EDGE(config-ext-nacl)# 6 permit tcp host 100.64.10.1 eq bgp host 100.64.10.2
<span class="c">! jab hum session kholte hain to ISP ke port 179 se replies</span></pre>
<p>Ek retry interval ke andar log <code>%BGP-5-ADJCHANGE: neighbor 100.64.10.1 Up</code> dikhata hai, State/PfxRcd wapas 2 ho jaata hai, aur PC1 phir se 203.0.113.1 tak pahunch sakta hai. Doosri root causes jo yahi Active symptom deti hain, aur unhe kaise pehchanoge: kisi bhi side neighbor IP mein typo (refused ya koi jawab nahi), loopback peering par missing <code>update-source</code> (refused), aur MD5 mismatch (log <code>%TCP-6-BADAUTH: Invalid MD5 digest</code> ya <code>No MD5 digest</code> dikhata hai).</p>

<div class="eg"><p><b>Worked example.</b> Lab 2 mein ek learner galti se R1 par <code>neighbor 10.12.0.2 remote-as 65201</code> configure karta hai. TCP up hota hai, R2 My AS 65102 ke saath OPEN bhejta hai, aur R1 NOTIFICATION 2/2 se jawab deta hai. R1 ke log mein <code>peer in wrong AS ... 2 bytes</code> ke baad peer ka asli AS hex mein aata hai. Dhyan se convert karo: 65102 = 65024 + 78 = 0xFE00 + 0x4E, yaani <b>FE4E</b>. Bytes ko sahi convert karna batata hai ki peer sach mein kaunsa AS use karta hai; phir aap <code>remote-as</code> ko 65102 par theek karte ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehli reaction mein <code>clear ip bgp *</code> use karna. Yeh router ke har session ko reset karta hai, saare routes withdraw karta hai aur original ticket se bada outage banata hai. Pehle diagnose karo, aur jab sirf policy badli ho to <code>clear ip bgp x soft</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Idle ka matlab aam taur par "try bhi nahi kar raha" (routing, multihop, shutdown); Active ka matlab "TCP try kar raha hai aur fail ho raha hai". Galat AS number Active problem <b>nahi</b> hai: TCP safal hota hai aur OPEN NOTIFICATION 2/2 ke saath reject hota hai.</p></div>

<div class="scn"><h4>Woh ACL jo sirf aadhe waqt todta tha</h4><p>Ek customer ka ISP session reload ke baad kabhi up hota tha aur kabhi ghanton Active rehta tha. Edge ACL mein ek line thi, <code>permit tcp host ISP host CE eq bgp</code>, jo ISP ke SYN ko port 179 par allow karti thi par ISP ke port 179 se replies ko nahi. Jab ISP session kholta tha, chal jaata tha; jab customer router kholta tha, SYN-ACK drop ho jaata tha. Ulti direction ki line jodne se session bharose se up hone laga.</p><p><b>Seekh:</b> koi bhi peer TCP client ho sakta hai, isliye ACLs ko port 179 destination aur source dono ke roop mein permit karna chahiye.</p></div>

<div class="iv"><p class="q">"Ek BGP neighbor Active mein atka hai. Aap kaise troubleshoot karoge?"</p><p>Strong answer: Active matlab port 179 tak TCP fail ho raha hai. Sahi source se neighbor ko ping karo; dono sides par neighbor IP aur remote-as confirm karo; sahi source se <code>telnet x 179</code> test karo aur result padho (timeout = filtered, refused = peer aapke liye configured nahi); dono directions mein port 179 ke liye ACLs aur firewalls check karo; loopback peering ke liye <code>update-source</code> aur <code>ebgp-multihop</code> check karo; MD5 errors ke liye log dekho. Established ke baad hi routes par jao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers mein kaam karo: session, phir routes, phir forwarding.</li>
<li>Idle: routing, multihop, shutdown, max-prefix. Active: TCP 179, IPs, ACLs, update-source, MD5.</li>
<li>Galat AS NOTIFICATION 2/2 deta hai jisme peer ka asli AS hex mein hota hai.</li>
<li>Routes missing: network-to-RIB match, advertised-routes, next-hop validity, filters check karo.</li>
<li>TCP 179 dono directions mein permit karo; koi bhi peer session khol sakta hai.</li>
</ul></div>
`}};export{e as default};