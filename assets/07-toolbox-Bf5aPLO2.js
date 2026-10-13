var e={id:`toolbox`,h:{en:`The toolbox: routing, ARP, interfaces, ping, traceroute and policy lookup`,hi:`Toolbox: routing, ARP, interfaces, ping, traceroute aur policy lookup`},body:{en:`
<p>Sniffer, flow and session answer "what happened to this packet". The small tools in this chapter answer the questions that come first and last: is the interface up, is there a route, can the box itself reach the destination, and which policy would match? Every output below was captured from the lab FGT1.</p>

<h3>Routing: get router info routing-table</h3>
<pre class="out">get router info routing-table all
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
...
Routing table for VRF=0
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]
C       10.0.1.0/24 is directly connected, port2
C       10.0.2.0/24 is directly connected, port3
C       203.0.113.0/30 is directly connected, port1</pre>
<p><code>S*</code> is the static default route (distance 10, metric 0); <code>C</code> are connected networks. To ask "which route would be used for this destination", use the details form:</p>
<pre class="out">get router info routing-table details 8.8.8.8

Routing table for VRF=0
Routing entry for 0.0.0.0/0
  Known via "static", distance 10, metric 0, candidate default, best
  * vrf 0 203.0.113.1, via port1</pre>

<h3>Interfaces and ARP</h3>
<pre class="out">get system interface physical
== [onboard]
	==[port1]
		mode: static
		ip: 203.0.113.2 255.255.255.252
		status: up
		speed: 1000Mbps (Duplex: full)
	==[port2]
		mode: static
		ip: 10.0.1.1 255.255.255.0
		status: up
...</pre>
<p>Check <code>status: up</code>, the address and the speed and duplex. A "down" port means cable, peer or administrative state, and no policy can help. <code>diagnose ip arp list</code> shows the neighbour table after traffic has flowed: index (interface), IP and MAC. An address with an incomplete entry means the host did not answer ARP.</p>

<h3>Ping and traceroute from the firewall</h3>
<pre class="out">execute ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=63 time=0.3 ms
...
5 packets transmitted, 5 packets received, 0% packet loss

execute traceroute 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 32 hops max, 3 probe packets per hop, 84 byte packets
 1  203.0.113.1  0.390 ms  0.360 ms  0.370 ms
 2  8.8.8.8  0.550 ms  0.520 ms  0.530 ms</pre>
<p>These start at the FortiGate itself, using the egress interface address, <b>not</b> your PC. A working ping from the firewall does not prove the user's path works, because the user's packets must also pass a policy. Use <code>execute ping-options source 10.0.1.1</code> to change the source (the interface address of the segment you care about).</p>

<h3>Policy lookup: diagnose firewall iprope lookup</h3>
<pre class="out">diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2
&lt;src [10.0.1.10-12345] dst [10.0.2.10-80] proto tcp dev port2&gt; matches policy id: 0</pre>
<p>You give source, source port, destination, destination port, protocol and ingress interface; the firewall tells you which policy would match without sending a packet. In the INC-40211 lab it answers <b>policy id 0</b> (implicit deny) for the web page. After the policy is corrected the same command returns the allowing policy ID.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Toolbox order">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Interface</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">up, address</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Route</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">exists, best</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Ping</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">from the box</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Lookup</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">which policy</text>
</svg><p class="cap">A bottom-up order for the first minutes of any ticket.</p></div>

<h3>Logs</h3>
<p><code>execute log display</code> reads the local log. In the lab it replied "0 logs found" because logging to disk was not producing events for the test traffic. On a real unit, traffic logs record the policy ID, action and bytes, and they are the right tool for a past event, while the debug flow is for the present.</p>

<div class="eg"><p><b>Worked example.</b> A user says "I cannot reach the DMZ web server". In 90 seconds: <code>get system interface physical</code> (port3 up), <code>get router info routing-table details 10.0.2.10</code> (connected on port3), <code>diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2</code> (policy id 0). The cause is policy, found before you touched the sniffer.</p></div>

<div class="warn"><p><b>Common mistake.</b> Concluding "the network is fine" because <code>execute ping</code> from the firewall works. The ping is sourced from the firewall, not from the client segment, and it is not subject to the forwarding policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> The <code>iprope lookup</code> needs the ingress interface and returns policy id 0 for the implicit deny. <code>get router info routing-table details</code> shows the best route for one destination; <code>routing-table all</code> shows everything.</p></div>

<div class="scn"><h4>Ping works, users complain</h4><p>An engineer pinged the Internet from the FortiGate successfully and closed the ticket. Users still had no access. A policy lookup for a user address showed policy id 0: the user subnet had no policy to port1.</p><p><b>Lesson:</b> test with the user's source, or use the lookup, not only the box's own ping.</p></div>

<div class="iv"><p class="q">"Which commands do you run in the first two minutes of a connectivity ticket?"</p><p>Interface status, then the routing table for the destination, then a firewall policy lookup with the user's source and ingress port. If those look right I move to the sniffer and the debug flow.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing: routing-table all and details for one destination.</li>
<li>Interfaces and ARP: status, address, neighbour entries.</li>
<li>Ping and traceroute start at the firewall, not at the client.</li>
<li>iprope lookup predicts the matching policy; id 0 is the implicit deny.</li>
<li>Logs are for history, the debug flow is for now.</li>
</ul></div>
`,hi:`
<p>Sniffer, flow aur session batate hain "is packet ka kya hua". Is chapter ke chhote tools woh sawaal handle karte hain jo sabse pehle aur sabse aakhir mein aate hain: interface up hai, route hai, box khud destination tak pahunch sakta hai, aur kaunsi policy match hogi? Neeche har output lab FGT1 se capture hua hai.</p>

<h3>Routing: get router info routing-table</h3>
<pre class="out">get router info routing-table all
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
...
Routing table for VRF=0
S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0]
C       10.0.1.0/24 is directly connected, port2
C       10.0.2.0/24 is directly connected, port3
C       203.0.113.0/30 is directly connected, port1</pre>
<p><code>S*</code> static default route hai (distance 10, metric 0); <code>C</code> connected networks. "Is destination ke liye kaunsa route use hoga" poochne ke liye details form:</p>
<pre class="out">get router info routing-table details 8.8.8.8

Routing table for VRF=0
Routing entry for 0.0.0.0/0
  Known via "static", distance 10, metric 0, candidate default, best
  * vrf 0 203.0.113.1, via port1</pre>

<h3>Interfaces aur ARP</h3>
<pre class="out">get system interface physical
== [onboard]
	==[port1]
		mode: static
		ip: 203.0.113.2 255.255.255.252
		status: up
		speed: 1000Mbps (Duplex: full)
	==[port2]
		mode: static
		ip: 10.0.1.1 255.255.255.0
		status: up
...</pre>
<p><code>status: up</code>, address aur speed/duplex check karo. "Down" port ka matlab cable, peer ya administrative state; koi policy madad nahi karegi. <code>diagnose ip arp list</code> traffic flow hone ke baad neighbour table dikhata hai: index (interface), IP aur MAC. Incomplete entry ka matlab host ne ARP ka jawab nahi diya.</p>

<h3>Firewall se ping aur traceroute</h3>
<pre class="out">execute ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8): 56 data bytes
64 bytes from 8.8.8.8: icmp_seq=0 ttl=63 time=0.3 ms
...
5 packets transmitted, 5 packets received, 0% packet loss

execute traceroute 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 32 hops max, 3 probe packets per hop, 84 byte packets
 1  203.0.113.1  0.390 ms  0.360 ms  0.370 ms
 2  8.8.8.8  0.550 ms  0.520 ms  0.530 ms</pre>
<p>Yeh FortiGate khud se, egress interface address use karke shuru hote hain, aapke PC se <b>nahi</b>. Firewall se kaam karta ping saabit nahi karta ki user ka path chalta hai, kyunki user ke packets ko policy bhi pass karni hoti hai. Source badalne ke liye <code>execute ping-options source 10.0.1.1</code> use karo (jis segment ki baat hai uska interface address).</p>

<h3>Policy lookup: diagnose firewall iprope lookup</h3>
<pre class="out">diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2
&lt;src [10.0.1.10-12345] dst [10.0.2.10-80] proto tcp dev port2&gt; matches policy id: 0</pre>
<p>Aap source, source port, destination, destination port, protocol aur ingress interface dete ho; firewall bina packet bheje batata hai kaunsi policy match hogi. INC-40211 lab mein web page ke liye jawab <b>policy id 0</b> (implicit deny) hai. Policy theek hone ke baad wahi command allow karne wali policy ID deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Toolbox order">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Interface</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">up, address</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Route</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">hai, best</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Ping</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">box se</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Lookup</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">kaunsi policy</text>
</svg><p class="cap">Kisi bhi ticket ke pehle minutes ke liye bottom-up order.</p></div>

<h3>Logs</h3>
<p><code>execute log display</code> local log padhta hai. Lab mein "0 logs found" aaya kyunki test traffic ke liye disk logging events nahi bana rahi thi. Real unit par traffic logs policy ID, action aur bytes record karte hain, aur beete hue event ke liye sahi tool yehi hain, jabki debug flow abhi ke liye hai.</p>

<div class="eg"><p><b>Worked example.</b> User kehta hai "Main DMZ web server tak nahi pahunch pa raha". 90 seconds mein: <code>get system interface physical</code> (port3 up), <code>get router info routing-table details 10.0.2.10</code> (port3 par connected), <code>diagnose firewall iprope lookup 10.0.1.10 12345 10.0.2.10 80 tcp port2</code> (policy id 0). Sniffer chhue bina policy hi karan nikla.</p></div>

<div class="warn"><p><b>Common mistake.</b> Firewall se <code>execute ping</code> chalne par "network theek hai" maan lena. Ping firewall se source hota hai, client segment se nahi, aur woh forwarding policy ke under nahi aata.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>iprope lookup</code> ko ingress interface chahiye aur implicit deny ke liye policy id 0 deta hai. <code>get router info routing-table details</code> ek destination ka best route dikhata hai; <code>routing-table all</code> sab.</p></div>

<div class="scn"><h4>Ping chalta hai, users shikayat karte hain</h4><p>Engineer ne FortiGate se Internet ping kiya, safal raha, aur ticket band kar diya. Users ko phir bhi access nahi tha. User address ke liye policy lookup ne policy id 0 dikhayi: user subnet ke liye port1 ki koi policy nahi thi.</p><p><b>Lesson:</b> user ke source se test karo, ya lookup use karo, sirf box ka ping nahi.</p></div>

<div class="iv"><p class="q">"Connectivity ticket ke pehle do minutes mein kaunse commands chalate ho?"</p><p>Interface status, phir destination ka routing table, phir user ke source aur ingress port ke saath firewall policy lookup. Yeh sahi dikhe to sniffer aur debug flow par jaata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing: routing-table all aur ek destination ke liye details.</li>
<li>Interfaces aur ARP: status, address, neighbour entries.</li>
<li>Ping aur traceroute firewall se shuru hote hain, client se nahi.</li>
<li>iprope lookup matching policy predict karta hai; id 0 matlab implicit deny.</li>
<li>Logs history ke liye, debug flow abhi ke liye.</li>
</ul></div>
`}};export{e as default};