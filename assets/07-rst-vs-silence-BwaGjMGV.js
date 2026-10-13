var e={id:`rst-vs-silence`,h:{en:`Reset versus silence: what firewalls, ACLs and servers leave on the wire (Lab 2)`,hi:`Reset versus khamoshi: firewalls, ACLs aur servers wire par kya chhodte hain (Lab 2)`},body:{en:`
<p>You knock on a flat door. Three things can happen. Someone opens it: welcome. Someone shouts from inside, "Go away, we are not taking visitors": rude, but it proves somebody is home and your knock reached them. Or nothing happens at all: maybe nobody lives there, maybe the security guard downstairs never let you reach the door, maybe they cannot hear. A fourth option: the guard at the gate hands you a note, "Visitors not allowed". Every TCP connection attempt ends in one of these four ways, and a capture shows you which.</p>

<h3>The four answers to a SYN</h3>
<table class="cmp"><tr><th>On the wire</th><th>Client message</th><th>What it proves</th></tr>
<tr><td><b>SYN → SYN, ACK → ACK</b></td><td>Connected</td><td>Path works both ways and the service listens</td></tr>
<tr><td><b>SYN → RST, ACK</b></td><td>Connection refused</td><td>The SYN reached the target and the reply came back. Routing and path ACLs are fine; the target refuses that port</td></tr>
<tr><td><b>SYN, SYN, SYN… nothing</b></td><td>Connection timed out</td><td>Something dropped the SYN or the reply silently: ACL or firewall drop, no route back, target down or without a gateway</td></tr>
<tr><td><b>SYN → ICMP type 3</b></td><td>No route to host / Destination unreachable</td><td>A router or firewall rejected it and told you: code 13 = ACL, code 0/1 = routing</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Reset versus silence">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="265" y="20" width="110" height="40" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">ACL / firewall</text>
<rect x="520" y="20" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="575" y="45" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="120" y1="40" x2="265" y2="40" stroke="#64748b" stroke-width="2"/><line x1="375" y1="40" x2="520" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="20" y="95" class="svg-ink" font-size="12">RST from the server IP  → SYN crossed the firewall; the server refused the port</text>
<text x="20" y="130" class="svg-ink" font-size="12">Repeated SYNs, no answer  → silent drop (ACL deny, firewall drop) or no return path</text>
<text x="20" y="165" class="svg-ink" font-size="12">ICMP 3 code 13 from the firewall IP  → firewall/ACL rejected it and said so</text>
<text x="20" y="200" class="svg-accent" font-size="12">Always check WHO sent the answer: source IP, source port, TTL</text>
</svg><p class="cap">The source address of the answer tells you which device is responsible.</p></div>

<h3>What this means for firewalls and ACLs</h3>
<ul>
<li>A Cisco IOS <b>ACL deny</b> drops the packet. By default the router also sends an ICMP <b>type 3 code 13</b> (administratively prohibited) back to the source, rate-limited. With <code>no ip unreachables</code> on the interface it stays silent, and the client just times out.</li>
<li><b>Firewalls</b> usually offer two actions: <b>drop</b> (silent, the client retries SYNs until it gives up) and <b>reject</b> (send a TCP RST or an ICMP unreachable). Security teams often prefer drop, so they do not reveal what exists.</li>
<li>Some firewalls send the RST <b>on behalf of</b> the server. The IP address is the server's, but the TTL and source MAC give it away: a server that normally answers with TTL 62 suddenly "answers" with TTL 255, or the RST arrives in 0.2 ms when the real round trip is 30 ms. Compare the RST with a normal reply from the same server.</li>
<li>A RST from the real server means the path, including every ACL and firewall rule in between, allowed the SYN. Stop looking at the network and look at the service: is it running, on which port, does it accept your source?</li>
</ul>

<h3>Lab 2 walkthrough: find the TCP reset</h3>
<p>The ticket: the admin PC (10.9.9.10) gets "Connection refused" when it tries SSH to R1 (10.9.9.1). Ping works, and R1 has a domain name, RSA keys and a local user. Open the capture on <code>PC1 eth0 ↔ SW1 Gi0/1</code> and reproduce:</p>
<pre class="code">PC1&gt; ssh -l admin 10.9.9.1</pre>
<pre class="out">ssh: connect to host 10.9.9.1 port 22: <span class="hl">Connection refused</span></pre>
<p>Filter with <code>tcp</code> (or <code>tcp.flags.rst == 1</code> in the lab viewer). Two rows tell the whole story:</p>
<pre class="out">No. Source      Destination  Protocol Info
 5  10.9.9.10   10.9.9.1     TCP      51377 → 22 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM
<span class="hl"> 6  10.9.9.1    10.9.9.10    TCP      22 → 51377 [RST, ACK] Seq=0 Ack=1 Win=64240 Len=0</span></pre>
<p>The RST comes from <b>10.9.9.1</b>, the router itself, from source port <b>22</b> (the SYN's ports swapped; your client port will differ). Those are the answers to tasks 1 and 2. Since the reset came back, the path is fine: the question becomes "why does R1 refuse port 22?" SSH needs a hostname, a domain name, RSA keys, a local user and vty lines that accept SSH. The first four are present, so check the lines:</p>
<pre class="out">R1# show running-config | section line vty
line vty 0 4
 login local
<span class="hl"> transport input telnet</span></pre>
<p>The vty lines accept only Telnet. The fix is one command, which also meets the security requirement to refuse Telnet:</p>
<pre class="code">R1# configure terminal
R1(config)# line vty 0 4
R1(config-line)# transport input ssh     <span class="c">! SSH only, Telnet refused</span>
R1(config-line)# end</pre>
<p>Capture again. <code>ssh -l admin 10.9.9.1</code> now shows <b>SYN → SYN, ACK → ACK</b> and the login prompt. Then test <code>telnet 10.9.9.1</code>: a new <b>RST, ACK from source port 23</b> proves Telnet is refused. The same capture that found the fault now proves the fix.</p>

<div class="eg"><p><b>Worked example: timeout instead.</b> Suppose instead that an inbound ACL on R1 Gi0/0 denied TCP 22 and the interface had <code>no ip unreachables</code>. The capture would show the SYN from 10.9.9.10 repeated at growing intervals, and nothing from 10.9.9.1. PC1 would print "Connection timed out", not "refused". Same symptom for the user ("SSH does not work"), completely different evidence and fix.</p></div>

<div class="warn"><p><b>Common mistake.</b> Seeing "Connection refused" and adding permit lines to every ACL and firewall on the path. A refusal is an answer from the target: the network already delivered the SYN. Changing ACLs cannot fix a service that is not listening or a vty line that does not accept the protocol.</p></div>

<div class="exam"><p><b>Exam trap.</b> For SSH on IOS you need: hostname (not the default), <code>ip domain name</code>, <code>crypto key generate rsa</code> (at least 768 bits for SSH version 2; 2048 is recommended), a local user or AAA, <code>login local</code> and <code>transport input ssh</code> on the vty lines. Forgetting the transport line is a classic distractor.</p></div>

<div class="scn"><h4>The "firewall" reset that was not the server</h4><p>An application team insisted their server was listening on TCP 8443, yet clients got "connection refused". A capture at the client showed RST, ACK "from" the server IP arriving 0.3 ms after the SYN, with TTL 255, while normal replies from that server had TTL 60 and took 18 ms. A second capture on the server's own port showed no SYN at all. A new firewall rule was rejecting the traffic with a spoofed reset. The firewall team corrected the rule order.</p><p><b>Lesson:</b> check who really sent the reset. Timing and TTL expose a middlebox pretending to be the server.</p></div>

<div class="iv"><p class="q">"A user says the application connection fails. How do you tell whether a firewall is blocking it or the server is refusing it?"</p><p>Strong answer: I capture close to the client, and ideally at the server too. If the SYN gets a RST, ACK from the server, the path including firewalls allowed it and the server refused the port, so I check the service. If the SYN repeats with no answer, something silently drops it, typically an ACL or firewall drop or a missing return route, so I capture further along to find where it stops. An ICMP unreachable code 13 names the device that rejected it. I also compare TTL and timing to spot a firewall sending resets on the server's behalf.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SYN answered by RST, ACK = reached the target, target refused: check the service, not the path.</li>
<li>Repeated SYNs with no answer = silent drop or missing return path: find where it stops.</li>
<li>ICMP type 3 code 13 = an ACL or firewall rejected it; the ICMP source names the device.</li>
<li>Always check the answer's source IP, source port, TTL and timing; firewalls can spoof resets.</li>
<li>Lab 2: RST from 10.9.9.1 port 22 because vty lines had <code>transport input telnet</code>; fix with <code>transport input ssh</code>.</li>
</ul></div>
`,hi:`
<p>Aap ek flat ka darwaza khatkhatate ho. Teen cheezein ho sakti hain. Koi darwaza khol deta hai: swagat. Koi andar se chillata hai, "Jao, hum visitors se nahi milte": rude hai, lekin prove karta hai ki koi ghar par hai aur aapki dastak pahunchi. Ya kuch bhi nahi hota: shayad wahan koi rehta hi nahi, shayad neeche ke guard ne aapko darwaze tak pahunchne hi nahi diya, shayad unhe sunai nahi deta. Chautha option: gate ka guard aapko ek note deta hai, "Visitors allowed nahi". Har TCP connection attempt inmein se ek tarike se khatam hota hai, aur capture dikhata hai kaunsa.</p>

<h3>SYN ke chaar jawab</h3>
<table class="cmp"><tr><th>Wire par</th><th>Client message</th><th>Kya prove hota hai</th></tr>
<tr><td><b>SYN → SYN, ACK → ACK</b></td><td>Connected</td><td>Path dono taraf chalta hai aur service listen kar rahi hai</td></tr>
<tr><td><b>SYN → RST, ACK</b></td><td>Connection refused</td><td>SYN target tak pahuncha aur reply wapas aaya. Routing aur path ke ACLs theek hain; target us port ko mana karta hai</td></tr>
<tr><td><b>SYN, SYN, SYN… kuch nahi</b></td><td>Connection timed out</td><td>Kisi ne SYN ya reply chupchaap drop kiya: ACL ya firewall drop, wapas ka route nahi, target down ya bina gateway ke</td></tr>
<tr><td><b>SYN → ICMP type 3</b></td><td>No route to host / Destination unreachable</td><td>Router ya firewall ne reject kiya aur bataya: code 13 = ACL, code 0/1 = routing</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Reset versus khamoshi">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="265" y="20" width="110" height="40" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">ACL / firewall</text>
<rect x="520" y="20" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="575" y="45" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="120" y1="40" x2="265" y2="40" stroke="#64748b" stroke-width="2"/><line x1="375" y1="40" x2="520" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="20" y="95" class="svg-ink" font-size="12">Server IP se RST  → SYN firewall paar kar gaya; server ne port mana kiya</text>
<text x="20" y="130" class="svg-ink" font-size="12">Baar baar SYNs, jawab nahi  → silent drop (ACL deny, firewall drop) ya return path nahi</text>
<text x="20" y="165" class="svg-ink" font-size="12">Firewall IP se ICMP 3 code 13  → firewall/ACL ne reject kiya aur bataya</text>
<text x="20" y="200" class="svg-accent" font-size="12">Hamesha check karo jawab KISNE bheja: source IP, source port, TTL</text>
</svg><p class="cap">Jawab ka source address batata hai kaunsa device zimmedar hai.</p></div>

<h3>Firewalls aur ACLs ke liye iska matlab</h3>
<ul>
<li>Cisco IOS <b>ACL deny</b> packet drop karta hai. Default mein router source ko ICMP <b>type 3 code 13</b> (administratively prohibited) bhi bhejta hai, rate-limited. Interface par <code>no ip unreachables</code> ho to woh khamosh rehta hai, aur client bas timeout hota hai.</li>
<li><b>Firewalls</b> aam taur par do actions dete hain: <b>drop</b> (khamosh, client haar maanne tak SYNs retry karta hai) aur <b>reject</b> (TCP RST ya ICMP unreachable bhejo). Security teams aksar drop pasand karti hain, taaki yeh pata na chale ki kya exist karta hai.</li>
<li>Kuch firewalls server ki <b>taraf se</b> RST bhejte hain. IP address server ka hota hai, lekin TTL aur source MAC pol khol dete hain: jo server normally TTL 62 se jawab deta hai woh achanak TTL 255 se "jawab" deta hai, ya RST 0.2 ms mein aata hai jabki asli round trip 30 ms hai. RST ko usi server ke normal reply se compare karo.</li>
<li>Asli server se RST ka matlab hai path ne, beech ke har ACL aur firewall rule samet, SYN allow kiya. Network dekhna band karo aur service dekho: chal rahi hai, kis port par, aapka source accept karti hai?</li>
</ul>

<h3>Lab 2 walkthrough: TCP reset dhoondo</h3>
<p>Ticket: admin PC (10.9.9.10) ko R1 (10.9.9.1) par SSH try karte waqt "Connection refused" milta hai. Ping chalta hai, aur R1 par domain name, RSA keys aur local user hain. <code>PC1 eth0 ↔ SW1 Gi0/1</code> par capture kholo aur reproduce karo:</p>
<pre class="code">PC1&gt; ssh -l admin 10.9.9.1</pre>
<pre class="out">ssh: connect to host 10.9.9.1 port 22: <span class="hl">Connection refused</span></pre>
<p><code>tcp</code> se filter karo (ya lab viewer mein <code>tcp.flags.rst == 1</code>). Do rows poori kahani batati hain:</p>
<pre class="out">No. Source      Destination  Protocol Info
 5  10.9.9.10   10.9.9.1     TCP      51377 → 22 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM
<span class="hl"> 6  10.9.9.1    10.9.9.10    TCP      22 → 51377 [RST, ACK] Seq=0 Ack=1 Win=64240 Len=0</span></pre>
<p>RST <b>10.9.9.1</b> se aata hai, yaani router khud, source port <b>22</b> se (SYN ke ports ulte; aapka client port alag hoga). Yahi tasks 1 aur 2 ke jawab hain. Kyunki reset wapas aaya, path theek hai: sawaal ban jaata hai "R1 port 22 kyun mana karta hai?" SSH ko hostname, domain name, RSA keys, local user aur SSH accept karne wali vty lines chahiye. Pehle chaar maujood hain, to lines check karo:</p>
<pre class="out">R1# show running-config | section line vty
line vty 0 4
 login local
<span class="hl"> transport input telnet</span></pre>
<p>Vty lines sirf Telnet accept karti hain. Fix ek command hai, jo Telnet refuse karne ki security requirement bhi poori karta hai:</p>
<pre class="code">R1# configure terminal
R1(config)# line vty 0 4
R1(config-line)# transport input ssh     <span class="c">! sirf SSH, Telnet refuse</span>
R1(config-line)# end</pre>
<p>Dobara capture karo. <code>ssh -l admin 10.9.9.1</code> ab <b>SYN → SYN, ACK → ACK</b> aur login prompt dikhata hai. Phir <code>telnet 10.9.9.1</code> test karo: <b>source port 23 se naya RST, ACK</b> prove karta hai ki Telnet refuse hota hai. Jis capture ne fault dhoondha, wahi ab fix prove karta hai.</p>

<div class="eg"><p><b>Worked example: iski jagah timeout.</b> Maan lo iski jagah R1 Gi0/0 par inbound ACL TCP 22 deny karta aur interface par <code>no ip unreachables</code> hota. Capture mein 10.9.9.10 se SYN badhte intervals par repeat hota dikhta, aur 10.9.9.1 se kuch nahi. PC1 "Connection timed out" print karta, "refused" nahi. User ke liye same symptom ("SSH nahi chalta"), bilkul alag saboot aur fix.</p></div>

<div class="warn"><p><b>Common galti.</b> "Connection refused" dekh kar path ke har ACL aur firewall mein permit lines jod dena. Refusal target ka jawab hai: network ne SYN pehle hi deliver kar diya. ACLs badalne se woh service fix nahi hoti jo listen nahi kar rahi, ya woh vty line jo protocol accept nahi karti.</p></div>

<div class="exam"><p><b>Exam trap.</b> IOS par SSH ke liye chahiye: hostname (default nahi), <code>ip domain name</code>, <code>crypto key generate rsa</code> (SSH version 2 ke liye kam se kam 768 bits; 2048 recommended), local user ya AAA, vty lines par <code>login local</code> aur <code>transport input ssh</code>. Transport line bhoolna classic distractor hai.</p></div>

<div class="scn"><h4>"Firewall" ka reset jo server ka nahi tha</h4><p>Ek application team keh rahi thi ki unka server TCP 8443 par listen kar raha hai, phir bhi clients ko "connection refused" mil raha tha. Client par capture mein server IP "se" RST, ACK SYN ke 0.3 ms baad aata dikha, TTL 255 ke saath, jabki us server ke normal replies TTL 60 ke the aur 18 ms lete the. Server ke apne port par dusre capture mein koi SYN tha hi nahi. Ek naya firewall rule spoofed reset ke saath traffic reject kar raha tha. Firewall team ne rule order theek kiya.</p><p><b>Seekh:</b> check karo reset asal mein kisne bheja. Timing aur TTL server hone ka naatak karte middlebox ko pakad lete hain.</p></div>

<div class="iv"><p class="q">"User kehta hai application connection fail hota hai. Aap kaise bataoge ki firewall block kar raha hai ya server refuse kar raha hai?"</p><p>Strong answer: main client ke paas capture karta hoon, aur ideally server par bhi. Agar SYN ko server se RST, ACK milta hai, to firewalls samet path ne allow kiya aur server ne port refuse kiya, to main service check karta hoon. Agar SYN bina jawab ke repeat hota hai, to koi chupchaap drop kar raha hai, aam taur par ACL ya firewall drop ya missing return route, to main aage capture karke dhoondhta hoon ki kahan rukta hai. ICMP unreachable code 13 reject karne wale device ka naam batata hai. Main TTL aur timing bhi compare karta hoon taaki server ki taraf se reset bhejne wala firewall pakda jaaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SYN ka jawab RST, ACK = target tak pahuncha, target ne mana kiya: service check karo, path nahi.</li>
<li>Bina jawab ke baar baar SYNs = silent drop ya missing return path: dhoondho kahan rukta hai.</li>
<li>ICMP type 3 code 13 = ACL ya firewall ne reject kiya; ICMP source device ka naam batata hai.</li>
<li>Hamesha jawab ka source IP, source port, TTL aur timing check karo; firewalls resets spoof kar sakte hain.</li>
<li>Lab 2: 10.9.9.1 port 22 se RST kyunki vty lines par <code>transport input telnet</code> tha; <code>transport input ssh</code> se fix.</li>
</ul></div>
`}};export{e as default};