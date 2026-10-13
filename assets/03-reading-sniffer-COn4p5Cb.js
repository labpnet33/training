var e={id:`reading-sniffer`,h:{en:`Reading sniffer output: in without out, NAT and TCP handshakes`,hi:`Sniffer output padhna: in bina out, NAT aur TCP handshakes`},body:{en:`
<p>Capturing is easy. Reading is the skill. This chapter gives you four reading patterns that solve most tickets, each with output captured from the lab.</p>

<h3>Pattern 1: in and out, a healthy forward</h3>
<p>A healthy forwarded packet appears twice: once <code>in</code> on the ingress port and once <code>out</code> on the egress port. We saw this in chapter 2 for LAN to DMZ. The addresses stay the same because no NAT is configured on that policy.</p>

<h3>Pattern 2: in without out, the FortiGate dropped it</h3>
<p>Here a TCP request to the DMZ server on port 80 is sent from PC1 while the policy allows only PING and HTTPS. We capture with verbose 4 and a count of 6:</p>
<pre class="out">diagnose sniffer packet any "host 10.0.2.10 and port 80" 4 6
interfaces=[any]
filters=[host 10.0.2.10 and port 80]
0.000000 <span class="hl">port2 in</span> 10.0.1.10.64251 -&gt; 10.0.2.10.80: syn 0

1 packets received by filter
0 packets dropped by kernel</pre>
<p>The SYN arrives on <code>port2</code> and there is <b>no matching <code>out</code> line</b> on <code>port3</code>. The FortiGate received the packet and did not forward it. The cause is inside the box: routing, policy or the reverse-path check. The sniffer cannot tell which; that is the job of the debug flow in chapter 4. After the policy is fixed and the capture repeated, the full handshake appears:</p>
<pre class="out">0.000000 port2 in 10.0.1.10.57160 -&gt; 10.0.2.10.80: syn 0
0.001000 <span class="hl">port3 out</span> 10.0.1.10.57160 -&gt; 10.0.2.10.80: syn 0
0.001000 port3 in 10.0.2.10.80 -&gt; 10.0.1.10.57160: syn 0 ack 1
0.002000 port2 out 10.0.2.10.80 -&gt; 10.0.1.10.57160: syn 0 ack 1
0.002000 port2 in 10.0.1.10.57160 -&gt; 10.0.2.10.80: ack 1
0.003000 port3 out 10.0.1.10.57160 -&gt; 10.0.2.10.80: ack 1

6 packets received by filter
0 packets dropped by kernel</pre>
<p>This is a TCP three-way handshake: SYN, SYN-ACK, ACK. Each step is shown twice, as <code>in</code> then <code>out</code>, because the FortiGate sits in the middle.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="TCP handshake through FortiGate">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SYN in</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">port2</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SYN out</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">port3</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SYN-ACK in</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">port3</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SYN-ACK out</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">port2</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">ACK</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">both ways</text>
</svg><p class="cap">A healthy handshake shows every packet in and out across the FortiGate.</p></div>

<h3>Pattern 3: NAT is visible on the egress port</h3>
<p>On the WAN interface we capture ICMP and ping 8.8.8.8 from PC1:</p>
<pre class="out">diagnose sniffer packet port1 "icmp" 4 2
interfaces=[port1]
filters=[icmp]
0.000000 port1 out <span class="hl">203.0.113.2</span> -&gt; 8.8.8.8: icmp: echo request
0.001000 port1 in 8.8.8.8 -&gt; <span class="hl">203.0.113.2</span>: icmp: echo reply

2 packets received by filter
0 packets dropped by kernel</pre>
<p>The request leaves with source <b>203.0.113.2</b>, the interface address, not PC1's 10.0.1.10: source NAT happened. The reply comes back addressed to 203.0.113.2, and the FortiGate translates it back for PC1. Capture on <code>port2</code> at the same time and you would see the private address; capture on <code>port1</code> and you see the public one. Comparing the two sides is the quickest way to prove NAT.</p>

<h3>Pattern 4: replies missing, the other side is silent</h3>
<p>If you see <code>out</code> on the egress port but no <code>in</code> reply, the FortiGate did its job. The problem is beyond it: the server, its firewall, the upstream router or a return route. Do not edit the FortiGate; take the evidence to the other team.</p>

<table class="cmp"><tr><th>What you see</th><th>What it means</th><th>Next tool</th></tr>
<tr><td>in, then out</td><td>Forwarded</td><td>Check the reply</td></tr>
<tr><td>in, no out</td><td>Dropped inside FortiGate</td><td>Debug flow</td></tr>
<tr><td>out, no reply in</td><td>Problem beyond the FortiGate</td><td>Other side, return route</td></tr>
<tr><td>Nothing at all</td><td>Traffic never arrived</td><td>Client, switch, cable, wrong gateway</td></tr>
<tr><td>Source differs in and out</td><td>NAT</td><td>Session table</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Pune LAN cannot reach 8.8.8.8." You run two captures at once in two sessions: <code>port2</code> and <code>port1</code> with <code>'icmp'</code>. Port2 shows requests <code>in</code>. Port1 shows nothing. So the packets enter and do not leave: debug flow next. In another ticket port1 shows the request <code>out</code> and no reply: the ISP or the Internet server is at fault.</p></div>

<div class="warn"><p><b>Common mistake.</b> Concluding the "firewall blocked it" because a web page did not load, without checking whether the SYN even went out. Always find the last point where you can see the packet.</p></div>
<div class="exam"><p><b>Exam trap.</b> The sniffer sees packets before and after policy, so a packet captured <code>in</code> may still be denied. It also shows NAT: the source address on the egress interface is the translated one.</p></div>

<div class="scn"><h4>Proving it was not the firewall</h4><p>A branch blamed the FortiGate for a failing VPN-style connection to a partner. The engineer captured on <code>port1</code> and showed requests leaving with the NAT address while no replies arrived. The partner's firewall team found a missing return route on their side within an hour, and the case was closed with the capture as evidence.</p><p><b>Lesson:</b> the sniffer turns opinions into evidence.</p></div>

<div class="iv"><p class="q">"In a sniffer capture you see a packet arrive on port2 but never leave. What does it mean?"</p><p>The FortiGate received it and did not forward it: routing, policy or reverse-path check dropped it. I would run the debug flow with a filter on the source and destination addresses to see the exact reason, for example no route or denied by policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Healthy forward: in on ingress, out on egress.</li>
<li>In without out means the FortiGate dropped it; use the debug flow.</li>
<li>Out without reply means the problem lies beyond the FortiGate.</li>
<li>Compare ingress and egress captures to prove NAT.</li>
<li>A TCP handshake shows as SYN, SYN-ACK, ACK, each in and out.</li>
</ul></div>
`,hi:`
<p>Capture karna aasaan hai. Padhna skill hai. Yeh chapter chaar reading patterns deta hai jo zyadatar tickets solve karte hain, har ek lab se capture kiye output ke saath.</p>

<h3>Pattern 1: in aur out, healthy forward</h3>
<p>Healthy forward hua packet do baar dikhta hai: ek baar ingress port par <code>in</code> aur ek baar egress port par <code>out</code>. Yeh hum chapter 2 mein LAN se DMZ ke liye dekh chuke. Addresses same rehte hain kyunki us policy par NAT configured nahi hai.</p>

<h3>Pattern 2: in lekin out nahi, FortiGate ne drop kiya</h3>
<p>Yahan PC1 se DMZ server ke port 80 par TCP request bheji jaati hai jabki policy sirf PING aur HTTPS allow karti hai. Hum verbose 4 aur count 6 ke saath capture karte hain:</p>
<pre class="out">diagnose sniffer packet any "host 10.0.2.10 and port 80" 4 6
interfaces=[any]
filters=[host 10.0.2.10 and port 80]
0.000000 <span class="hl">port2 in</span> 10.0.1.10.64251 -&gt; 10.0.2.10.80: syn 0

1 packets received by filter
0 packets dropped by kernel</pre>
<p>SYN <code>port2</code> par aaya aur <code>port3</code> par <b>koi matching <code>out</code> line nahi</b>. FortiGate ne packet receive kiya aur forward nahi kiya. Karan box ke andar hai: routing, policy ya reverse-path check. Sniffer yeh nahi bata sakta ki kaunsa; woh chapter 4 ke debug flow ka kaam hai. Policy theek hone aur capture dobara karne ke baad poora handshake dikhta hai:</p>
<pre class="out">0.000000 port2 in 10.0.1.10.57160 -&gt; 10.0.2.10.80: syn 0
0.001000 <span class="hl">port3 out</span> 10.0.1.10.57160 -&gt; 10.0.2.10.80: syn 0
0.001000 port3 in 10.0.2.10.80 -&gt; 10.0.1.10.57160: syn 0 ack 1
0.002000 port2 out 10.0.2.10.80 -&gt; 10.0.1.10.57160: syn 0 ack 1
0.002000 port2 in 10.0.1.10.57160 -&gt; 10.0.2.10.80: ack 1
0.003000 port3 out 10.0.1.10.57160 -&gt; 10.0.2.10.80: ack 1

6 packets received by filter
0 packets dropped by kernel</pre>
<p>Yeh TCP three-way handshake hai: SYN, SYN-ACK, ACK. Har step do baar dikhta hai, pehle <code>in</code> phir <code>out</code>, kyunki FortiGate beech mein hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="TCP handshake through FortiGate">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SYN in</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">port2</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SYN out</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">port3</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SYN-ACK in</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">port3</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">SYN-ACK out</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">port2</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">ACK</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">dono taraf</text>
</svg><p class="cap">Healthy handshake mein har packet FortiGate ke across in aur out dikhta hai.</p></div>

<h3>Pattern 3: NAT egress port par dikhta hai</h3>
<p>WAN interface par hum ICMP capture karte hain aur PC1 se 8.8.8.8 ping karte hain:</p>
<pre class="out">diagnose sniffer packet port1 "icmp" 4 2
interfaces=[port1]
filters=[icmp]
0.000000 port1 out <span class="hl">203.0.113.2</span> -&gt; 8.8.8.8: icmp: echo request
0.001000 port1 in 8.8.8.8 -&gt; <span class="hl">203.0.113.2</span>: icmp: echo reply

2 packets received by filter
0 packets dropped by kernel</pre>
<p>Request source <b>203.0.113.2</b> ke saath nikalti hai, interface address, PC1 ka 10.0.1.10 nahi: source NAT hua. Reply 203.0.113.2 par aati hai, aur FortiGate use PC1 ke liye wapas translate karta hai. Saath mein <code>port2</code> par capture karo to private address dikhega; <code>port1</code> par public. Dono taraf compare karna NAT saabit karne ka sabse tez tareeka hai.</p>

<h3>Pattern 4: replies missing, doosri taraf khamosh</h3>
<p>Egress port par <code>out</code> dikhe lekin reply <code>in</code> nahi, to FortiGate ne apna kaam kiya. Problem uske aage hai: server, uska firewall, upstream router ya return route. FortiGate edit mat karo; evidence doosri team ko do.</p>

<table class="cmp"><tr><th>Kya dikhta hai</th><th>Matlab</th><th>Agla tool</th></tr>
<tr><td>in, phir out</td><td>Forward hua</td><td>Reply check karo</td></tr>
<tr><td>in, out nahi</td><td>FortiGate ke andar drop</td><td>Debug flow</td></tr>
<tr><td>out, reply in nahi</td><td>FortiGate ke aage problem</td><td>Doosri taraf, return route</td></tr>
<tr><td>Kuch bhi nahi</td><td>Traffic aaya hi nahi</td><td>Client, switch, cable, galat gateway</td></tr>
<tr><td>in aur out mein source alag</td><td>NAT</td><td>Session table</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Pune LAN 8.8.8.8 tak nahi pahunchta." Aap do sessions mein ek saath do captures chalate ho: <code>port2</code> aur <code>port1</code> par <code>'icmp'</code> ke saath. Port2 par requests <code>in</code> dikhti hain. Port1 par kuch nahi. Matlab packets andar aate hain aur nikalte nahi: agla debug flow. Doosre ticket mein port1 par request <code>out</code> dikhti hai aur reply nahi: ISP ya Internet server ki galti.</p></div>

<div class="warn"><p><b>Common mistake.</b> Web page load nahi hua to "firewall ne block kiya" maan lena, yeh dekhe bina ki SYN bahar gaya bhi ya nahi. Hamesha woh aakhri point dhoondho jahan packet dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sniffer policy se pehle aur baad ke packets dekhta hai, isliye <code>in</code> capture hua packet bhi denied ho sakta hai. Yeh NAT bhi dikhata hai: egress interface par source address translated wala hota hai.</p></div>

<div class="scn"><h4>Saabit karna ki firewall ki galti nahi thi</h4><p>Ek branch ne partner ke saath VPN-style connection fail hone par FortiGate ko dosh diya. Engineer ne <code>port1</code> par capture karke dikhaya ki requests NAT address ke saath nikal rahi hain aur koi reply nahi aa raha. Partner ki firewall team ko ek ghante mein unki taraf missing return route mila, aur capture ke evidence ke saath case band hua.</p><p><b>Lesson:</b> sniffer opinions ko evidence mein badalta hai.</p></div>

<div class="iv"><p class="q">"Sniffer capture mein packet port2 par aata dikhta hai lekin kabhi jaata nahi. Iska matlab?"</p><p>FortiGate ne receive kiya aur forward nahi kiya: routing, policy ya reverse-path check ne drop kiya. Main source aur destination addresses ke filter ke saath debug flow chalata hoon taaki exact reason dikhe, jaise no route ya denied by policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Healthy forward: ingress par in, egress par out.</li>
<li>In bina out matlab FortiGate ne drop kiya; debug flow use karo.</li>
<li>Out bina reply matlab problem FortiGate ke aage hai.</li>
<li>NAT saabit karne ke liye ingress aur egress captures compare karo.</li>
<li>TCP handshake SYN, SYN-ACK, ACK ke roop mein dikhta hai, har ek in aur out.</li>
</ul></div>
`}};export{e as default};