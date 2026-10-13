var e=`<svg viewBox="0 0 640 220" role="img" aria-label="Local SPAN copies traffic to a capture host">
<rect x="20" y="80" width="110" height="60" rx="10" fill="#bae6fd"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">R-KCH</text><text x="75" y="126" text-anchor="middle" class="svg-muted" font-size="11">router</text>
<rect x="240" y="60" width="160" height="100" rx="10" fill="#fde68a"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="13">SW-KCH</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="11">monitor session 1</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="11">source Gi0/1 both</text>
<rect x="510" y="20" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="13">Capture host</text><text x="565" y="66" text-anchor="middle" class="svg-muted" font-size="11">on Gi0/5</text>
<rect x="510" y="140" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="565" y="168" text-anchor="middle" class="svg-ink" font-size="13">PC-KCH</text><text x="565" y="186" text-anchor="middle" class="svg-muted" font-size="11">user, Gi0/2</text>
<line x1="130" y1="110" x2="240" y2="110" stroke="#64748b" stroke-width="2"/><text x="185" y="100" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1</text>
<line x1="400" y1="95" x2="510" y2="55" stroke="#ea5d0c" stroke-width="2" stroke-dasharray="6 4"/><text x="470" y="62" text-anchor="middle" class="svg-accent" font-size="11">copy</text>
<line x1="400" y1="125" x2="510" y2="165" stroke="#64748b" stroke-width="2"/>
</svg>`,t={id:`span-and-packet-capture`,h:{en:`SPAN and packet capture`,hi:`SPAN aur packet capture`},body:{en:`
<h3>When flow data is not enough</h3>
<p>Flow data says that 10.2.20.21 sent 184 KB to 10.1.20.10 on TCP 443. It does not say whether the TCP handshake failed, whether packets were retransmitted, or what DNS answered. For that you need the <b>packets themselves</b>. A switch normally sends a frame only to the port of its destination, so a laptop plugged into another port cannot see it. You must ask the switch to send a copy.</p>

<h3>SPAN: a copy of the traffic</h3>
<p><b>SPAN</b> (Switched Port Analyzer, also called port mirroring) copies the frames of chosen <b>source</b> ports or VLANs to a <b>destination</b> port. A capture host plugged into the destination port sees everything the sources send and receive. Think of a photocopier at a post counter: the original letter still goes to its address, and a copy goes into the inspector's tray.</p>
<div class="dia">`+e+`<p class="cap">The original traffic is unharmed; a copy of Gi0/1 traffic goes to the capture host on Gi0/5.</p></div>

<h3>Configuring a local SPAN session</h3>
<pre class="code">SW-KCH(config)# monitor session 1 source interface GigabitEthernet0/1 both
SW-KCH(config)# monitor session 1 destination interface GigabitEthernet0/5
SW-KCH(config)# end
SW-KCH# show monitor session 1</pre>
<pre class="out">Session 1
---------
Type                     : Local Session
Source Ports             :
    Both                 : Gi0/1
Destination Ports        : <span class="hl">Gi0/5</span>
    Encapsulation        : Native
          Ingress        : Disabled</pre>
<ul>
<li><code>source interface ... both</code> copies traffic received (<b>rx</b>) and transmitted (<b>tx</b>) on that port. You may choose <code>rx</code> or <code>tx</code> only. Choosing both is the usual start.</li>
<li><code>destination interface</code> is a port that now carries only the copy. It stops behaving like a normal access port, so never use a port that a real user needs, and never use an uplink.</li>
<li>Session numbers are local to the switch. Source can also be a VLAN, which captures all ports in that VLAN.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> At Kochi the circuit router R-KCH is on Gi0/1 and the capture host sits on Gi0/5. A user complains that the ERP page hangs. You mirror Gi0/1 both ways and capture on the host. Because Gi0/1 carries all branch traffic to Hyderabad, the capture contains every user. You then narrow it with a filter to PC-KCH (10.2.20.21) and port 443, so you see only the handshake you care about.</p></div>

<h3>Limits to remember</h3>
<ul>
<li>The destination port has a fixed speed. Mirroring a busy 1 Gbps port with both directions can exceed it, and the switch silently drops copies. Mirror fewer ports or capture on a faster port.</li>
<li>Switches have a limited number of sessions, and a port can be a destination in only one.</li>
<li>Some control frames, such as spanning tree and CDP, are not copied by default.</li>
<li>Mirroring uses switch resources. Remove the session when you finish: <code>no monitor session 1</code>.</li>
</ul>

<h3>RSPAN and ERSPAN</h3>
<p>What if the capture host is not on the same switch? <b>RSPAN</b> (Remote SPAN) carries the copy across several switches in a special VLAN (a <code>remote-span</code> VLAN) that every switch in the path must carry as a trunk. The source switch has a session with the RSPAN VLAN as destination, and the far switch has a session that uses the RSPAN VLAN as source and a local port as destination. <b>ERSPAN</b> goes further: it wraps the copy in GRE and routes it across Layer 3 to a capture host at any IP address, with an ERSPAN ID in the header. Use RSPAN inside one Layer 2 domain and ERSPAN when the capture host is across routers, for example capturing at Kochi and analysing at Hyderabad. Remember that the extra bandwidth is real traffic on your network.</p>
<table class="cmp"><tr><th>Type</th><th>Copy travels</th><th>Needs</th></tr>
<tr><td>SPAN (local)</td><td>inside one switch</td><td>source and destination on the same switch</td></tr>
<tr><td>RSPAN</td><td>across switches, Layer 2</td><td>a dedicated RSPAN VLAN on trunks</td></tr>
<tr><td>ERSPAN</td><td>across routers, GRE, Layer 3</td><td>IP reachability to the destination, ERSPAN ID</td></tr></table>

<h3>Capturing and filtering</h3>
<p>The capture host runs a tool such as tcpdump or a graphical analyser. The tool puts the network card in <b>promiscuous mode</b> so it accepts frames not addressed to it. Filters keep the capture small. A <b>capture filter</b> (BPF syntax) decides what is stored; a display filter only hides what is already stored. Common words: <code>host 10.2.20.21</code>, <code>port 443</code>, <code>tcp</code>, <code>udp</code>, <code>src</code>, <code>dst</code>, joined by <code>and</code> or <code>or</code>.</p>
<pre class="code">capture-host$ sudo tcpdump -nn -i eth0 host 10.2.20.21 and tcp port 443</pre>
<p>The flags <code>-nn</code> stop name and port lookups, which is faster and shows true numbers.</p>

<h3>Reading a capture summary</h3>
<pre class="out">10:41:02.100110 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [<span class="hl">S</span>], seq 2210001, win 64240, length 0
10:41:02.131900 IP 10.1.20.10.443 &gt; 10.2.20.21.51044: Flags [<span class="hl">S.</span>], seq 8841100, ack 2210002, win 65160, length 0
10:41:02.132050 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [<span class="hl">.</span>], ack 1, win 502, length 0
10:41:02.132900 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [P.], seq 1:518, ack 1, length 517
10:41:09.190000 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [P.], seq 1:518, ack 1, length 517
10:41:09.440000 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [<span class="hl">R</span>], seq 518, length 0</pre>
<p>Read one line left to right: time, protocol, source address and port, an arrow, destination address and port, TCP flags, and lengths. The first three lines are the <b>three-way handshake</b>: S (SYN), S. (SYN and ACK), then a lone dot for ACK. After that, the client sends data (P is push). The same bytes <code>seq 1:518</code> appear again seven seconds later: a <b>retransmission</b>, meaning no ACK came back. Finally an R (reset) ends the session. Counting retransmissions and resets tells you whether the problem is loss, a dead server or a firewall.</p>
<p>Useful patterns: a SYN with no SYN-ACK means the server or a firewall dropped it; a SYN followed at once by a RST means nothing listens on the port; repeated identical segments mean loss; DNS queries with no answer mean a resolver problem.</p>

<h3>Privacy and good practice</h3>
<p>A capture can hold passwords, session data and personal information. Capture only what you need with the narrowest filter, for the shortest time, store the file safely, share it only with those who need it, and delete it when the case closes. Get approval where policy requires it. Encrypted traffic (TLS) hides the payload but still shows addresses, ports, sizes and timing, which is often enough.</p>

<div class="note"><p><b>Scope.</b> The labs simulate SPAN sessions, a capture view and top-talker flows. They do not simulate real throughput limits or real encryption.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Wrong source or destination port in the monitor session, so the host sees nothing. (2) Using an uplink or user port as destination. (3) Forgetting to remove the session. (4) Capturing everything for hours and filling the disk. (5) Sharing a capture that contains passwords.</p></div>
<div class="exam"><p><b>Exam trap.</b> SPAN is local, RSPAN uses a VLAN across Layer 2, ERSPAN uses GRE across Layer 3. The destination port does not forward normal traffic. A capture filter limits what is stored; a display filter does not.</p></div>

<div class="scn"><h4>The page that hung at the TLS step</h4><p>Kabir Shah reported that a Kochi user could open every site except the ERP. Flow showed traffic to SRV-HYD on TCP 443, so the path was alive. A SPAN on the Kochi uplink and a capture filtered to the user and port 443 showed the handshake finishing, then a request repeated twice and a reset from the server. The cause was a server-side limit, not the network.</p><p><b>Lesson:</b> flow tells you the conversation exists; the capture shows how it ended.</p></div>

<div class="iv"><p class="q">"How would you capture traffic from a switch port and what are the limits?"</p><p>Strong answer: configure a monitor session with the port as source (both directions or rx or tx) and a free port as destination, and connect a capture host. Mention filters to keep it small, that the destination port can be oversubscribed, that RSPAN or ERSPAN are used across switches or routers, and that captures need privacy care and removal of the session afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPAN copies frames from source ports or VLANs to a destination port where a capture host listens.</li>
<li>monitor session 1 source interface X both and destination interface Y; check with show monitor session.</li>
<li>RSPAN crosses Layer 2 in a special VLAN; ERSPAN crosses Layer 3 with GRE.</li>
<li>Capture filters (host, port, tcp, udp, src, dst) limit what is stored.</li>
<li>Read handshakes, retransmissions and resets; protect privacy and remove the session afterwards.</li>
</ul></div>
`,hi:`
<h3>Jab flow data kaafi nahi hota</h3>
<p>Flow data batata hai ki 10.2.20.21 ne 10.1.20.10 ko TCP 443 par 184 KB bheje. Woh yeh nahi batata ki TCP handshake fail hua ya nahi, packets retransmit hue ya nahi, ya DNS ne kya jawab diya. Iske liye aapko <b>packets khud</b> chahiye. Switch aam taur par frame sirf uske destination wale port ko bhejta hai, to doosre port mein laga laptop use nahi dekh sakta. Aapko switch se copy bhejne ko kehna padta hai.</p>

<h3>SPAN: traffic ki copy</h3>
<p><b>SPAN</b> (Switched Port Analyzer, port mirroring bhi kehte hain) chuni hui <b>source</b> ports ya VLANs ke frames ki copy ek <b>destination</b> port ko bhejta hai. Destination port mein laga capture host woh sab dekhta hai jo sources bhejte aur receive karte hain. Socho post counter par ek photocopier: asli chitthi apne address ko jaati hai, aur ek copy inspector ki tray mein.</p>
<div class="dia">`+e+`<p class="cap">Asli traffic ko kuch nahi hota; Gi0/1 traffic ki copy Gi0/5 par capture host ko jaati hai.</p></div>

<h3>Local SPAN session configure karna</h3>
<pre class="code">SW-KCH(config)# monitor session 1 source interface GigabitEthernet0/1 both
SW-KCH(config)# monitor session 1 destination interface GigabitEthernet0/5
SW-KCH(config)# end
SW-KCH# show monitor session 1</pre>
<pre class="out">Session 1
---------
Type                     : Local Session
Source Ports             :
    Both                 : Gi0/1
Destination Ports        : <span class="hl">Gi0/5</span>
    Encapsulation        : Native
          Ingress        : Disabled</pre>
<ul>
<li><code>source interface ... both</code> us port par received (<b>rx</b>) aur transmitted (<b>tx</b>) dono ki copy karta hai. Aap sirf <code>rx</code> ya <code>tx</code> bhi chun sakte ho. Aam shuruaat both se hoti hai.</li>
<li><code>destination interface</code> ab sirf copy carry karta hai. Woh normal access port ki tarah behave karna band kar deta hai, to aisa port mat chuno jo kisi asli user ko chahiye, aur kabhi uplink mat chuno.</li>
<li>Session numbers switch ke local hote hain. Source VLAN bhi ho sakta hai, jisse us VLAN ke saare ports capture hote hain.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Kochi mein circuit router R-KCH Gi0/1 par hai aur capture host Gi0/5 par. Ek user shikayat karta hai ki ERP page hang hota hai. Aap Gi0/1 ko dono taraf mirror karte ho aur host par capture karte ho. Gi0/1 Hyderabad ka saara branch traffic carry karta hai, to capture mein har user aata hai. Phir filter se use PC-KCH (10.2.20.21) aur port 443 tak narrow karte ho, taaki sirf wahi handshake dikhe jo aapko chahiye.</p></div>

<h3>Yaad rakhne wali limits</h3>
<ul>
<li>Destination port ki fixed speed hoti hai. Busy 1 Gbps port ko dono directions mein mirror karne se woh exceed ho sakti hai, aur switch chupchaap copies drop karta hai. Kam ports mirror karo ya tez port par capture karo.</li>
<li>Switches mein sessions ki limited ginti hoti hai, aur ek port sirf ek session mein destination ho sakta hai.</li>
<li>Kuch control frames, jaise spanning tree aur CDP, default mein copy nahi hote.</li>
<li>Mirroring switch resources use karta hai. Kaam khatam hone par session hata do: <code>no monitor session 1</code>.</li>
</ul>

<h3>RSPAN aur ERSPAN</h3>
<p>Agar capture host usi switch par na ho to? <b>RSPAN</b> (Remote SPAN) copy ko kai switches ke across ek special VLAN (<code>remote-span</code> VLAN) mein le jaata hai, jise path ke har switch ko trunk par carry karna padta hai. Source switch ke session ka destination RSPAN VLAN hota hai, aur door wale switch ke session ka source RSPAN VLAN aur destination local port hota hai. <b>ERSPAN</b> aur aage jaata hai: copy ko GRE mein wrap karke Layer 3 par kisi bhi IP address ke capture host tak route karta hai, header mein ERSPAN ID ke saath. RSPAN ek Layer 2 domain ke andar use karo aur ERSPAN tab jab capture host routers ke paar ho, jaise Kochi mein capture karke Hyderabad mein analyse karna. Yaad rakho ki extra bandwidth aapke network par asli traffic hai.</p>
<table class="cmp"><tr><th>Type</th><th>Copy kahan se guzarti hai</th><th>Kya chahiye</th></tr>
<tr><td>SPAN (local)</td><td>ek switch ke andar</td><td>source aur destination same switch par</td></tr>
<tr><td>RSPAN</td><td>switches ke across, Layer 2</td><td>trunks par dedicated RSPAN VLAN</td></tr>
<tr><td>ERSPAN</td><td>routers ke across, GRE, Layer 3</td><td>destination tak IP reachability, ERSPAN ID</td></tr></table>

<h3>Capture aur filtering</h3>
<p>Capture host par tcpdump jaisa tool ya graphical analyser chalta hai. Tool network card ko <b>promiscuous mode</b> mein daalta hai taaki woh un frames ko bhi accept kare jo use address nahi hue. Filters capture ko chhota rakhte hain. <b>Capture filter</b> (BPF syntax) tay karta hai ki kya store hoga; display filter sirf jo store ho chuka use chhupata hai. Aam words: <code>host 10.2.20.21</code>, <code>port 443</code>, <code>tcp</code>, <code>udp</code>, <code>src</code>, <code>dst</code>, jinhe <code>and</code> ya <code>or</code> se jodte hain.</p>
<pre class="code">capture-host$ sudo tcpdump -nn -i eth0 host 10.2.20.21 and tcp port 443</pre>
<p>Flags <code>-nn</code> name aur port lookups band karte hain, jo tez hai aur asli numbers dikhata hai.</p>

<h3>Capture summary padhna</h3>
<pre class="out">10:41:02.100110 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [<span class="hl">S</span>], seq 2210001, win 64240, length 0
10:41:02.131900 IP 10.1.20.10.443 &gt; 10.2.20.21.51044: Flags [<span class="hl">S.</span>], seq 8841100, ack 2210002, win 65160, length 0
10:41:02.132050 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [<span class="hl">.</span>], ack 1, win 502, length 0
10:41:02.132900 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [P.], seq 1:518, ack 1, length 517
10:41:09.190000 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [P.], seq 1:518, ack 1, length 517
10:41:09.440000 IP 10.2.20.21.51044 &gt; 10.1.20.10.443: Flags [<span class="hl">R</span>], seq 518, length 0</pre>
<p>Ek line left se right padho: time, protocol, source address aur port, ek arrow, destination address aur port, TCP flags, aur lengths. Pehli teen lines <b>three-way handshake</b> hain: S (SYN), S. (SYN aur ACK), phir akela dot ACK ke liye. Uske baad client data bhejta hai (P matlab push). Wahi bytes <code>seq 1:518</code> saat second baad dobara dikhte hain: <b>retransmission</b>, yaani koi ACK wapas nahi aaya. Aakhir mein R (reset) session khatam karta hai. Retransmissions aur resets ginne se pata chalta hai ki problem loss, mara hua server ya firewall hai.</p>
<p>Kaam ke patterns: SYN ke baad SYN-ACK nahi aaya to server ya firewall ne drop kiya; SYN ke turant baad RST matlab us port par koi sun nahi raha; baar baar wahi segments matlab loss; DNS queries ke jawab nahi matlab resolver problem.</p>

<h3>Privacy aur achhi practice</h3>
<p>Capture mein passwords, session data aur personal information ho sakti hai. Sirf jitna chahiye utna capture karo, sabse narrow filter ke saath, sabse kam samay ke liye, file ko safe rakho, sirf unhe do jinhe zaroorat hai, aur case band hone par delete karo. Jahan policy kahe wahan approval lo. Encrypted traffic (TLS) payload chhupata hai lekin addresses, ports, sizes aur timing dikhata hai, jo aksar kaafi hota hai.</p>

<div class="note"><p><b>Scope.</b> Labs SPAN sessions, capture view aur top-talker flows simulate karte hain. Woh asli throughput limits ya asli encryption simulate nahi karte.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Monitor session mein galat source ya destination port, to host kuch nahi dekhta. (2) Uplink ya user port ko destination banana. (3) Session hatana bhool jaana. (4) Ghanton sab kuch capture karke disk bhar dena. (5) Aisa capture share karna jisme passwords hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> SPAN local hai, RSPAN Layer 2 par VLAN use karta hai, ERSPAN Layer 3 par GRE use karta hai. Destination port normal traffic forward nahi karta. Capture filter jo store hota hai use limit karta hai; display filter nahi.</p></div>

<div class="scn"><h4>Woh page jo TLS step par hang hua</h4><p>Kabir Shah ne bataya ki Kochi ka ek user ERP chhodkar har site khol leta hai. Flow ne SRV-HYD ko TCP 443 par traffic dikhaya, to path zinda tha. Kochi uplink par SPAN aur user aur port 443 tak filter kiye capture ne dikhaya ki handshake poora hua, phir ek request do baar repeat hui aur server se reset aaya. Cause server ki taraf ki limit thi, network nahi.</p><p><b>Seekh:</b> flow batata hai ki conversation hai; capture dikhata hai ki woh kaise khatam hua.</p></div>

<div class="iv"><p class="q">"Switch port se traffic kaise capture karoge aur limits kya hain?"</p><p>Strong answer: monitor session configure karo jisme port source ho (dono directions ya rx ya tx) aur ek free port destination, aur capture host jodo. Filters bolo jo isse chhota rakhte hain, ki destination port oversubscribed ho sakta hai, ki switches ya routers ke across RSPAN ya ERSPAN use hota hai, aur ki captures ko privacy care aur baad mein session hatana chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPAN source ports ya VLANs ke frames ki copy destination port ko bhejta hai jahan capture host sunta hai.</li>
<li>monitor session 1 source interface X both aur destination interface Y; show monitor session se check karo.</li>
<li>RSPAN Layer 2 par special VLAN mein jaata hai; ERSPAN Layer 3 par GRE ke saath.</li>
<li>Capture filters (host, port, tcp, udp, src, dst) store hone wala data limit karte hain.</li>
<li>Handshakes, retransmissions aur resets padho; privacy bachao aur baad mein session hatao.</li>
</ul></div>
`}};export{t as default};