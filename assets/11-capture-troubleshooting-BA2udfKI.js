var e={id:`capture-troubleshooting`,h:{en:`Reading a capture like an engineer: a troubleshooting workflow`,hi:`Capture ko engineer ki tarah padhna: troubleshooting workflow`},body:{en:`
<p>A doctor does not guess from "I feel unwell". She takes your temperature, listens to your chest, and reads the blood test line by line, looking for the value that is out of range or missing. A packet capture is the network's blood test: every frame, every header, every timestamp. The skill is not opening the capture; it is knowing where to look and what "normal" looks like, so the one abnormal line jumps out.</p>

<h3>The five-step workflow</h3>
<ol>
<li><b>Define the symptom precisely.</b> Who cannot reach what, on which port, since when? "PC1 cannot load the page on 203.0.113.80 port 80; ping works" is a ticket you can solve. "The network is slow" is not yet.</li>
<li><b>Choose the capture point.</b> A capture sees only one link. The same packet looks different on each link (MACs, TTL), and a packet that is lost will appear on the links before the problem and not after. Capture close to the client first, then close to the server.</li>
<li><b>Filter.</b> Cut the noise with display filters: <code>arp</code>, <code>icmp</code>, <code>ip.addr == 203.0.113.80</code>, <code>tcp.port == 80</code>, <code>tcp.flags.syn == 1</code>, <code>tcp.flags.reset == 1</code>, <code>udp.port == 53</code>, <code>tcp.analysis.retransmission</code>.</li>
<li><b>Read each packet top to bottom.</b> Ethernet: who sent it on this wire and to whom. IP: who end to end, TTL, Protocol. TCP or UDP: which application and which phase (SYN, data, FIN, RST).</li>
<li><b>Ask what is missing or odd.</b> Most faults show up as an answer that never comes, or an answer you did not expect.</li>
</ol>

<h3>What the patterns mean</h3>
<table class="cmp"><tr><th>You see</th><th>It usually means</th><th>Check next</th></tr>
<tr><td>ARP requests, no reply</td><td>Target down, wrong VLAN or wrong IP</td><td>Cabling, VLAN, target's IP</td></tr>
<tr><td>SYN, no SYN-ACK</td><td>Request or reply lost: routing, ACL, or the server cannot route back</td><td>Capture near the server; its gateway and routes</td></tr>
<tr><td>SYN answered by RST</td><td>Path works, nothing listening on that port</td><td>Service status, port number</td></tr>
<tr><td>ICMP type 3 code 13</td><td>Administratively prohibited (ACL)</td><td>ACLs on the router that sent it</td></tr>
<tr><td>ICMP type 11</td><td>TTL expired: loop, or traceroute</td><td>Routing tables along the path</td></tr>
<tr><td>Retransmissions, duplicate ACKs</td><td>Packet loss on the path</td><td>Interface errors, congestion</td></tr>
<tr><td>Win=0 (zero window)</td><td>Receiving host overloaded</td><td>The host's application and disk</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Where to capture in Lab 2">
<rect x="20" y="70" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="180" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="230" y="100" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="340" y="70" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="390" y="100" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="500" y="70" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="93" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="12">no gateway</text>
<line x1="120" y1="95" x2="180" y2="95" stroke="#64748b" stroke-width="2"/><line x1="280" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="2"/><line x1="440" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="150" y="60" text-anchor="middle" class="svg-accent" font-size="12">SYN seen</text>
<text x="470" y="60" text-anchor="middle" class="svg-accent" font-size="12">SYN seen</text>
<text x="470" y="145" text-anchor="middle" class="svg-accent" font-size="12">no SYN-ACK</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">The request arrives; the reply is never sent. Look at the server.</text>
</svg><p class="cap">Capturing on two links splits the path in half and points straight at the faulty side.</p></div>

<h3>Walkthrough: the Lab 2 ticket</h3>
<p><b>Symptom.</b> "PC1 cannot load the web page on SRV. The SYN leaves PC1 and even reaches SRV, but nothing ever comes back."</p>
<pre class="out">PC1&gt; h&#116;tp 203.0.113.80
<span class="hl">curl: (28) Failed to connect to 203.0.113.80 port 80 after 2001 ms: Timeout was reached</span></pre>
<p>A <b>timeout</b>, not "connection refused": no RST came back, so this is not a closed port. On the PC1-SW1 link you see ARP, then a SYN, then SYN retransmissions. On the R1-SRV link the SYN arrives with TTL 63, so PC1, SW1, R1 and routing are all fine. There is no SYN-ACK. The fault is on the server side. Check SRV:</p>
<pre class="code"><span class="c">! Does the server know how to reach anything outside its own subnet?</span>
SRV&gt; show ip</pre>
<pre class="out">NAME        : SRV[1]
IP/MASK     : 203.0.113.80/24
<span class="hl">GATEWAY     : 0.0.0.0</span>
DNS         :
MAC         : 52:54:00:c3:00:80
MTU         : 1500</pre>
<p>SRV has <b>no default gateway</b>. It can answer hosts inside 203.0.113.0/24, but 10.1.1.10 is outside its mask and it has nowhere to send the SYN-ACK. Fix it and retest:</p>
<pre class="code">SRV&gt; ip 203.0.113.80/24 203.0.113.1
PC1&gt; h&#116;tp 203.0.113.80
PC1&gt; trace 203.0.113.80
PC1&gt; ping 203.0.113.80</pre>
<pre class="out">SRV : 203.0.113.80 255.255.255.0 gateway 203.0.113.1
...
trace to 203.0.113.80, 8 hops max, press Ctrl+C to stop
 1   10.1.1.1        0.500 ms  0.450 ms  0.480 ms
 2   *203.0.113.80   0.800 ms (ICMP type:3, code:3, Destination port unreachable)
<span class="hl">84 bytes from 203.0.113.80 icmp_seq=1 ttl=63 time=0.500 ms</span></pre>
<p>The page loads, the trace shows exactly two hops (R1, then SRV, which answers the final probe with "port unreachable"), and replies arrive with TTL 63 because SRV starts at 64 and R1 subtracts one.</p>

<div class="eg"><p><b>Worked example: reading the working exchange (Lab 2 questions).</b> Click any IPv4 frame, Ethernet II layer: <b>Type: IPv4 (0x0800)</b>. Click SRV's answer to the SYN, TCP layer: <b>Flags: 0x012 (SYN, ACK)</b>. Filter <code>tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0</code> to isolate PC1's SYN: <b>Destination Port: 80</b>, source port a random high number. Every answer comes from reading one field in the right layer.</p></div>

<h3>Where captures come from</h3>
<p>In the labs the capture panel taps any link. In real networks you capture on a host (Wireshark, tcpdump), copy switch traffic to an analyser with <b>SPAN</b> (port mirroring), or capture on the device itself with Embedded Packet Capture on IOS XE. The ccna-capture module goes deeper; the reading skill is the same.</p>

<div class="warn"><p><b>Common mistakes.</b> Capturing only at the client and concluding "the server never replies" when the reply is being dropped in the middle. Forgetting that a host without a gateway can still reply to hosts on its own subnet, so local tests pass. Treating "timeout" and "connection refused" as the same symptom: refused means an RST came back, so the path works.</p></div>

<div class="exam"><p><b>Exam traps.</b> A missing SYN-ACK is a reachability or return-path problem; an RST is a service problem. Traceroute relies on TTL expiry and ICMP Time Exceeded. A reply TTL of 63 from a host that starts at 64 means one router in the path.</p></div>

<div class="scn"><h4>Half the path, half the time</h4><p>An application team reported that a new API server could not be reached from branch offices, while head-office users were fine. The engineer captured on the server's switch port: SYNs from head-office addresses got SYN-ACKs; SYNs from branch addresses (10.20.0.0/16) arrived and got nothing. The server had two NICs and a static route sending 10.0.0.0/8 out of the backup NIC, which led nowhere, so replies to branches went the wrong way. Removing the stray route fixed it.</p><p><b>Lesson:</b> when requests arrive and replies never leave, look at the replying host's routing: gateway, static routes, multiple NICs. The capture tells you which side to investigate.</p></div>

<div class="iv"><p class="q">"A user says a website will not load. How would you use a packet capture to find the problem?"</p><p>Describe the workflow: define the symptom, capture near the client, filter on the server IP, check DNS first if a name is used, then ARP, the TCP handshake and the HTTP response. Explain what each missing piece means: no DNS reply, no ARP reply, SYN with no SYN-ACK, RST, retransmissions, zero window. Then capture at the server side to split the path. Showing that you know "timeout" versus "refused" impresses interviewers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: define the symptom, pick the capture point, filter, read each layer top to bottom, look for what is missing.</li>
<li>No ARP reply = Layer 2 or target problem; SYN without SYN-ACK = routing, ACL or return-path problem; RST = nothing listening.</li>
<li>Capturing on two links splits the path and points at the faulty side.</li>
<li>Lab 2 fault: server without a default gateway; fix <code>ip 203.0.113.80/24 203.0.113.1</code>.</li>
<li>Verify with the page, <code>trace</code> (two hops) and <code>ping</code> (TTL 63).</li>
</ul></div>
`,hi:`
<p>Doctor "tabiyat theek nahi lag rahi" sun kar andaza nahi lagati. Woh aapka temperature leti hai, chest sunti hai, aur blood test line by line padhti hai, woh value dhoondhte hue jo range se bahar hai ya missing hai. Packet capture network ka blood test hai: har frame, har header, har timestamp. Skill capture kholne mein nahi hai; skill yeh jaanne mein hai ki kahan dekhna hai aur "normal" kaisa dikhta hai, taaki woh ek abnormal line turant nazar aaye.</p>

<h3>Paanch-step workflow</h3>
<ol>
<li><b>Symptom ko precisely define karo.</b> Kaun kis tak nahi pahunch pa raha, kis port par, kab se? "PC1 203.0.113.80 port 80 ka page load nahi kar pa raha; ping chal raha hai" ek aisa ticket hai jo solve ho sakta hai. "Network slow hai" abhi nahi.</li>
<li><b>Capture point chuno.</b> Capture sirf ek link dekhta hai. Wahi packet har link par alag dikhta hai (MACs, TTL), aur jo packet kho jaata hai woh problem se pehle wale links par dikhega aur baad wale par nahi. Pehle client ke paas capture karo, phir server ke paas.</li>
<li><b>Filter lagao.</b> Display filters se noise kaato: <code>arp</code>, <code>icmp</code>, <code>ip.addr == 203.0.113.80</code>, <code>tcp.port == 80</code>, <code>tcp.flags.syn == 1</code>, <code>tcp.flags.reset == 1</code>, <code>udp.port == 53</code>, <code>tcp.analysis.retransmission</code>.</li>
<li><b>Har packet upar se neeche padho.</b> Ethernet: is wire par kisne kise bheja. IP: end to end kaun, TTL, Protocol. TCP ya UDP: kaunsi application aur kaunsa phase (SYN, data, FIN, RST).</li>
<li><b>Poocho kya missing ya ajeeb hai.</b> Zyada tar faults ek aise jawab ki tarah dikhte hain jo kabhi nahi aata, ya ek aisa jawab jiski umeed nahi thi.</li>
</ol>

<h3>Patterns ka matlab</h3>
<table class="cmp"><tr><th>Aap dekhte ho</th><th>Aam taur par matlab</th><th>Aage check karo</th></tr>
<tr><td>ARP requests, koi reply nahi</td><td>Target down, galat VLAN ya galat IP</td><td>Cabling, VLAN, target ka IP</td></tr>
<tr><td>SYN, koi SYN-ACK nahi</td><td>Request ya reply kho gaya: routing, ACL, ya server wapas route nahi kar sakta</td><td>Server ke paas capture; uska gateway aur routes</td></tr>
<tr><td>SYN ka jawab RST</td><td>Path chal raha hai, us port par koi listen nahi kar raha</td><td>Service status, port number</td></tr>
<tr><td>ICMP type 3 code 13</td><td>Administratively prohibited (ACL)</td><td>Jis router ne bheja uske ACLs</td></tr>
<tr><td>ICMP type 11</td><td>TTL expire: loop, ya traceroute</td><td>Path ke routing tables</td></tr>
<tr><td>Retransmissions, duplicate ACKs</td><td>Path par packet loss</td><td>Interface errors, congestion</td></tr>
<tr><td>Win=0 (zero window)</td><td>Receive karne wala host overloaded</td><td>Host ki application aur disk</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab 2 mein kahan capture karein">
<rect x="20" y="70" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="100" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="180" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="230" y="100" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="340" y="70" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="390" y="100" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="500" y="70" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="93" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="12">gateway nahi</text>
<line x1="120" y1="95" x2="180" y2="95" stroke="#64748b" stroke-width="2"/><line x1="280" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="2"/><line x1="440" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="150" y="60" text-anchor="middle" class="svg-accent" font-size="12">SYN dikha</text>
<text x="470" y="60" text-anchor="middle" class="svg-accent" font-size="12">SYN dikha</text>
<text x="470" y="145" text-anchor="middle" class="svg-accent" font-size="12">SYN-ACK nahi</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Request pahunchti hai; reply kabhi nahi bheja jaata. Server ko dekho.</text>
</svg><p class="cap">Do links par capture karne se path aadha ho jaata hai aur seedha kharab side ki taraf ishaara milta hai.</p></div>

<h3>Walkthrough: Lab 2 ka ticket</h3>
<p><b>Symptom.</b> "PC1 SRV ka web page load nahi kar pa raha. SYN PC1 se nikalta hai aur SRV tak pahunchta bhi hai, lekin wapas kuch nahi aata."</p>
<pre class="out">PC1&gt; h&#116;tp 203.0.113.80
<span class="hl">curl: (28) Failed to connect to 203.0.113.80 port 80 after 2001 ms: Timeout was reached</span></pre>
<p>Yeh <b>timeout</b> hai, "connection refused" nahi: koi RST wapas nahi aaya, isliye yeh closed port nahi hai. PC1-SW1 link par aap ARP, phir SYN, phir SYN retransmissions dekhte ho. R1-SRV link par SYN TTL 63 ke saath pahunchta hai, isliye PC1, SW1, R1 aur routing sab theek hain. Koi SYN-ACK nahi hai. Fault server side par hai. SRV check karo:</p>
<pre class="code"><span class="c">! Kya server ko pata hai ki apne subnet ke bahar kuch bhi kaise pahunchana hai?</span>
SRV&gt; show ip</pre>
<pre class="out">NAME        : SRV[1]
IP/MASK     : 203.0.113.80/24
<span class="hl">GATEWAY     : 0.0.0.0</span>
DNS         :
MAC         : 52:54:00:c3:00:80
MTU         : 1500</pre>
<p>SRV ka <b>koi default gateway nahi</b> hai. Woh 203.0.113.0/24 ke andar ke hosts ko jawab de sakta hai, lekin 10.1.1.10 uske mask ke bahar hai aur SYN-ACK bhejne ki koi jagah nahi hai. Fix karo aur dobara test karo:</p>
<pre class="code">SRV&gt; ip 203.0.113.80/24 203.0.113.1
PC1&gt; h&#116;tp 203.0.113.80
PC1&gt; trace 203.0.113.80
PC1&gt; ping 203.0.113.80</pre>
<pre class="out">SRV : 203.0.113.80 255.255.255.0 gateway 203.0.113.1
...
trace to 203.0.113.80, 8 hops max, press Ctrl+C to stop
 1   10.1.1.1        0.500 ms  0.450 ms  0.480 ms
 2   *203.0.113.80   0.800 ms (ICMP type:3, code:3, Destination port unreachable)
<span class="hl">84 bytes from 203.0.113.80 icmp_seq=1 ttl=63 time=0.500 ms</span></pre>
<p>Page load hota hai, trace bilkul do hops dikhata hai (R1, phir SRV, jo aakhri probe ka jawab "port unreachable" se deta hai), aur replies TTL 63 ke saath aate hain kyunki SRV 64 se shuru karta hai aur R1 ek ghata deta hai.</p>

<div class="eg"><p><b>Worked example: working exchange padhna (Lab 2 ke sawaal).</b> Koi bhi IPv4 frame click karo, Ethernet II layer: <b>Type: IPv4 (0x0800)</b>. SYN ke jawab mein SRV ka packet click karo, TCP layer: <b>Flags: 0x012 (SYN, ACK)</b>. PC1 ka SYN alag karne ke liye filter <code>tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0</code> lagao: <b>Destination Port: 80</b>, source port ek random high number. Har jawab sahi layer mein ek field padhne se milta hai.</p></div>

<h3>Captures kahan se aate hain</h3>
<p>Labs mein capture panel kisi bhi link ko tap karta hai. Real networks mein aap host par capture karte ho (Wireshark, tcpdump), <b>SPAN</b> (port mirroring) se switch traffic ko analyser par copy karte ho, ya IOS XE par Embedded Packet Capture se device par hi capture karte ho. ccna-capture module isme aur gehrai mein jaata hai; padhne ki skill wahi hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Sirf client par capture karke nateeja nikaalna ki "server kabhi reply nahi karta" jabki reply beech mein drop ho raha hai. Bhoolna ki bina gateway wala host apne subnet ke hosts ko ab bhi reply kar sakta hai, isliye local tests pass hote hain. "Timeout" aur "connection refused" ko same symptom samajhna: refused ka matlab RST wapas aaya, yaani path chal raha hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Missing SYN-ACK reachability ya return-path problem hai; RST service problem hai. Traceroute TTL expiry aur ICMP Time Exceeded par depend karta hai. 64 se shuru hone wale host se reply TTL 63 ka matlab path mein ek router.</p></div>

<div class="scn"><h4>Aadha path, aadha time</h4><p>Ek application team ne report kiya ki naya API server branch offices se reach nahi ho raha, jabki head-office users theek the. Engineer ne server ke switch port par capture kiya: head-office addresses ke SYNs ko SYN-ACKs mile; branch addresses (10.20.0.0/16) ke SYNs pahunche aur kuch nahi mila. Server ke do NICs the aur ek static route 10.0.0.0/8 ko backup NIC se bhej raha tha, jo kahin nahi jaata tha, isliye branches ke replies galat raaste ja rahe the. Us bhatke route ko hatane se theek ho gaya.</p><p><b>Seekh:</b> jab requests pahunchti hain aur replies kabhi nahi nikalte, to reply karne wale host ki routing dekho: gateway, static routes, multiple NICs. Capture batata hai ki kis side ki jaanch karni hai.</p></div>

<div class="iv"><p class="q">"User kehta hai website load nahi ho rahi. Problem dhoondhne ke liye aap packet capture kaise use karoge?"</p><p>Workflow describe karo: symptom define karo, client ke paas capture karo, server IP par filter lagao, agar name use ho raha hai to pehle DNS check karo, phir ARP, TCP handshake aur HTTP response. Samjhao ki har missing hisse ka kya matlab hai: DNS reply nahi, ARP reply nahi, SYN bina SYN-ACK, RST, retransmissions, zero window. Phir path ko aadha karne ke liye server side par capture karo. "Timeout" vs "refused" ka farak jaanna interviewers ko impress karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: symptom define karo, capture point chuno, filter lagao, har layer upar se neeche padho, dekho kya missing hai.</li>
<li>ARP reply nahi = Layer 2 ya target problem; SYN bina SYN-ACK = routing, ACL ya return-path problem; RST = koi listen nahi kar raha.</li>
<li>Do links par capture karne se path aadha hota hai aur kharab side ki taraf ishaara milta hai.</li>
<li>Lab 2 fault: bina default gateway ka server; fix <code>ip 203.0.113.80/24 203.0.113.1</code>.</li>
<li>Page, <code>trace</code> (do hops) aur <code>ping</code> (TTL 63) se verify karo.</li>
</ul></div>
`}};export{e as default};