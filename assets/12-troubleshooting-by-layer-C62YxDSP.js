var e={id:`troubleshooting`,h:{en:`Troubleshooting by layer: a workflow using the lab network`,hi:`Layer ke hisaab se troubleshooting: lab network ke saath workflow`},body:{en:`
<p>Everything in this module comes together when something breaks. A doctor does not guess; she checks pulse, blood pressure and temperature in a fixed order, and each result rules things in or out. Network troubleshooting by OSI layer works the same way. This chapter gives you the workflow, the tool for each layer, and four faults on the lab network (PC1, SW1, R1, SRV) with the exact output that points to each one. The full CompTIA troubleshooting methodology comes in the troubleshooting module; here we focus on using layers to find the fault fast.</p>

<h3>Three ways to walk the layers</h3>
<ul>
<li><b>Bottom-up:</b> start at Layer 1 (link lights, interface status) and move up. Best when you suspect cabling or a new install.</li>
<li><b>Top-down:</b> start at the application (does the web page load, does the name resolve?) and move down. Best when only one application is affected.</li>
<li><b>Divide and conquer:</b> start in the middle with a <b>ping</b> (Layer 3). If it works, Layers 1-3 are fine and you go up; if it fails, you go down. This is usually the fastest.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Divide and conquer troubleshooting flow">
<rect x="220" y="10" width="200" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Ping the server IP</text>
<rect x="20" y="90" width="260" height="36" rx="8" fill="#fed7aa"/><text x="150" y="113" text-anchor="middle" class="svg-ink" font-size="13">Fails: go DOWN (L3, L2, L1)</text>
<rect x="360" y="90" width="260" height="36" rx="8" fill="#bbf7d0"/><text x="490" y="113" text-anchor="middle" class="svg-ink" font-size="13">Works: go UP (L4, L7)</text>
<rect x="20" y="160" width="260" height="84" rx="8" fill="#e2e8f0"/><text x="150" y="182" text-anchor="middle" class="svg-muted" font-size="12">show ip: address, mask, gateway</text><text x="150" y="202" text-anchor="middle" class="svg-muted" font-size="12">arp: gateway MAC learned?</text><text x="150" y="222" text-anchor="middle" class="svg-muted" font-size="12">interface status, routes</text>
<rect x="360" y="160" width="260" height="84" rx="8" fill="#e2e8f0"/><text x="490" y="182" text-anchor="middle" class="svg-muted" font-size="12">nslookup: name resolves?</text><text x="490" y="202" text-anchor="middle" class="svg-muted" font-size="12">curl: refused or timed out?</text><text x="490" y="222" text-anchor="middle" class="svg-muted" font-size="12">capture: which port, which reply</text>
<line x1="300" y1="46" x2="150" y2="90" stroke="#64748b" stroke-width="2"/><line x1="340" y1="46" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="126" x2="150" y2="160" stroke="#64748b"/><line x1="490" y1="126" x2="490" y2="160" stroke="#64748b"/>
</svg><p class="cap">One ping splits the problem in half. Each later check removes one more layer.</p></div>

<h3>A tool for every layer</h3>
<table class="cmp"><tr><th>Layer</th><th>Question</th><th>Tools and commands</th></tr>
<tr><td>1 Physical</td><td>Is there a clean link?</td><td>Link lights, <code>show interfaces</code> (up/down, CRC, speed, duplex), cable tester, light meter or OTDR for fibre</td></tr>
<tr><td>2 Data link</td><td>Can I reach the next hop's MAC?</td><td><code>arp</code> on the PC, <code>show mac address-table</code>, VLAN and trunk checks</td></tr>
<tr><td>3 Network</td><td>Is the addressing right and is there a route?</td><td><code>show ip</code> on the PC, <code>ping</code>, <code>traceroute</code>, <code>show ip route</code>, <code>show ip interface brief</code></td></tr>
<tr><td>4 Transport</td><td>Is the port open and allowed?</td><td><code>curl</code> or a port test to the service port, ACL hit counts, firewall logs, <code>netstat</code></td></tr>
<tr><td>5-7 Upper</td><td>Does the service answer correctly?</td><td><code>nslookup</code>, <code>curl</code>, application logs, packet capture</td></tr>
</table>

<h3>Fault 1: nothing works, even the gateway</h3>
<pre class="out">PC1&gt; ping 10.0.20.10
<span class="hl">host (10.0.10.1) not reachable</span>

PC1&gt; arp
<span class="hl">arp table is empty</span></pre>
<p>PC1 cannot even resolve the gateway's MAC, so the problem is at Layer 1 or 2 between PC1 and R1. On R1:</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     10.0.10.1       YES manual administratively down down</span>
GigabitEthernet0/1     10.0.20.1       YES manual up                    up</pre>
<p>The gateway interface is shut down. Fix with <code>interface GigabitEthernet0/0</code>, <code>no shutdown</code>. "administratively down" means someone configured it off; plain "down down" would point to a cable or far-end problem.</p>

<h3>Fault 2: the gateway works, the server does not</h3>
<pre class="out">PC1&gt; ping 10.0.10.1
84 bytes from 10.0.10.1 icmp_seq=1 ttl=255 time=0.500 ms
PC1&gt; ping 10.0.20.10
<span class="hl">10.0.20.10 icmp_seq=1 timeout</span>
10.0.20.10 icmp_seq=2 timeout</pre>
<p>Layers 1-3 to the gateway are fine. Check the far side: is SRV's gateway correct, is its link up, does R1 have the route? In the lab, <code>show ip route</code> on R1 must show the C route for 10.0.20.0/24 out GigabitEthernet0/1. A wrong gateway on SRV produces exactly this: requests arrive but replies never return.</p>

<h3>Fault 3: ping by IP works, the name does not</h3>
<pre class="out">PC1&gt; ping 10.0.20.10
84 bytes from 10.0.20.10 icmp_seq=1 ttl=63 time=0.700 ms
PC1&gt; nslookup web.nwk.lab
<span class="hl">;; no DNS server configured (use: ip dns &lt;server&gt;)</span></pre>
<p>Layers 1-4 are fine; name resolution is not. Configure the resolver as in the ports lab: <code>ip dns 10.0.10.1</code>. If a DNS server is configured but the query times out, check that UDP 53 reaches it and that the server (here R1 with <code>ip dns server</code>) is running.</p>

<h3>Fault 4: the name resolves, the web page fails</h3>
<pre class="out">PC1&gt; curl h&#116;tps://web.nwk.lab
<span class="hl">curl: (7) Failed to connect to 10.0.20.10 port 443: Connection refused</span></pre>
<p>"Connection refused" means the packet reached the server and it answered with a TCP RST: nothing is listening on 443. That is a service problem on SRV (Layer 4-7). If instead you see <b>"Timeout was reached"</b>, the SYN got no answer at all, which usually means an ACL or firewall is silently dropping it, or the server is unreachable.</p>

<div class="eg"><p><b>Worked example: read the evidence.</b> ttl=63 in replies = one router on the return path. ARP cache with the gateway MAC = Layer 2 to the gateway works. ICMP type 3 code 13 in a ping reply = an ACL administratively blocked it. "Connection refused" = the host is alive and replied with RST. "Timeout" = nothing replied. Each message points to a specific layer.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once, so you never learn which one fixed it. Assuming "ping works" means the application works (ping tests Layer 3 only). Rebooting before collecting evidence, which erases counters and tables. Forgetting to test the return path.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Can ping by IP, not by name" = DNS. "Can reach local hosts, not remote" = default gateway or routing. "APIPA 169.254.x.x" = no DHCP answer. "Connection refused" = service not listening; "timeout" = filtered or unreachable. Divide and conquer usually starts with ping at Layer 3.</p></div>

<div class="scn"><h4>Refused or timed out?</h4><p>After a data center change, the finance application stopped loading. The application team insisted the network was down. The engineer ran a port test from a client to the app server on TCP 443 and got "connection refused". That single word proved the network path was fine: the server itself had actively rejected the connection. The web service had failed to start after a certificate renewal. The app team restarted it with the correct certificate path, and the issue closed in 20 minutes instead of becoming a network blame meeting.</p><p><b>Lesson:</b> the exact error text tells you which layer answered.</p></div>

<div class="iv"><p class="q">"A user says they cannot reach an internal web server. How do you troubleshoot?"</p><p>Strong answer: gather scope first (one user or many, one app or all, what changed). Then divide and conquer: check the client's IP, mask, gateway and DNS; ping the gateway and the server IP. If ping fails, go down: ARP, interface status, VLAN, routes, ACLs. If ping works, go up: nslookup the name, test the TCP port, and distinguish "refused" (service down) from "timeout" (filtered). Use traceroute to see where a path stops and a capture to confirm. Change one thing at a time, verify, and document the fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose bottom-up, top-down or divide and conquer; a ping splits the problem in half.</li>
<li>Each layer has its tools: interface counters, ARP, routes, port tests, nslookup, captures.</li>
<li>Empty ARP cache for the gateway = Layer 1/2 problem to the gateway.</li>
<li>Works by IP but not by name = DNS; refused = no service; timeout = filtered or unreachable.</li>
<li>Collect evidence before changing anything, change one thing at a time, verify end to end.</li>
</ul></div>
`,hi:`
<p>Is module ki har cheez tab ek saath aati hai jab kuch toot-ta hai. Doctor andaza nahi lagati; woh ek fixed order mein pulse, blood pressure aur temperature check karti hai, aur har result cheezon ko shaamil ya bahar karta hai. OSI layer ke hisaab se network troubleshooting bhi aise hi kaam karti hai. Yeh chapter aapko workflow, har layer ka tool, aur lab network (PC1, SW1, R1, SRV) par chaar faults deta hai, us exact output ke saath jo har ek ki taraf ishara karta hai. Poori CompTIA troubleshooting methodology troubleshooting module mein aati hai; yahan hum layers use karke fault jaldi dhoondhne par focus karte hain.</p>

<h3>Layers par chalne ke teen tareeke</h3>
<ul>
<li><b>Bottom-up:</b> Layer 1 (link lights, interface status) se shuru karo aur upar jao. Jab cabling ya naye install par shak ho tab best.</li>
<li><b>Top-down:</b> application se shuru karo (web page load hota hai, naam resolve hota hai?) aur neeche jao. Jab sirf ek application affected ho tab best.</li>
<li><b>Divide and conquer:</b> beech mein <b>ping</b> (Layer 3) se shuru karo. Chal jaaye to Layers 1-3 theek hain aur aap upar jaate ho; fail ho to neeche. Yeh aam taur par sabse tez hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Divide and conquer troubleshooting flow">
<rect x="220" y="10" width="200" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Server IP ko ping karo</text>
<rect x="20" y="90" width="260" height="36" rx="8" fill="#fed7aa"/><text x="150" y="113" text-anchor="middle" class="svg-ink" font-size="13">Fail: NEECHE jao (L3, L2, L1)</text>
<rect x="360" y="90" width="260" height="36" rx="8" fill="#bbf7d0"/><text x="490" y="113" text-anchor="middle" class="svg-ink" font-size="13">Chala: UPAR jao (L4, L7)</text>
<rect x="20" y="160" width="260" height="84" rx="8" fill="#e2e8f0"/><text x="150" y="182" text-anchor="middle" class="svg-muted" font-size="12">show ip: address, mask, gateway</text><text x="150" y="202" text-anchor="middle" class="svg-muted" font-size="12">arp: gateway MAC seekha?</text><text x="150" y="222" text-anchor="middle" class="svg-muted" font-size="12">interface status, routes</text>
<rect x="360" y="160" width="260" height="84" rx="8" fill="#e2e8f0"/><text x="490" y="182" text-anchor="middle" class="svg-muted" font-size="12">nslookup: naam resolve hua?</text><text x="490" y="202" text-anchor="middle" class="svg-muted" font-size="12">curl: refused ya timed out?</text><text x="490" y="222" text-anchor="middle" class="svg-muted" font-size="12">capture: kaunsa port, kaunsa reply</text>
<line x1="300" y1="46" x2="150" y2="90" stroke="#64748b" stroke-width="2"/><line x1="340" y1="46" x2="490" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="126" x2="150" y2="160" stroke="#64748b"/><line x1="490" y1="126" x2="490" y2="160" stroke="#64748b"/>
</svg><p class="cap">Ek ping problem ko aadha kar deta hai. Har agla check ek aur layer hata deta hai.</p></div>

<h3>Har layer ka tool</h3>
<table class="cmp"><tr><th>Layer</th><th>Sawaal</th><th>Tools aur commands</th></tr>
<tr><td>1 Physical</td><td>Kya saaf link hai?</td><td>Link lights, <code>show interfaces</code> (up/down, CRC, speed, duplex), cable tester, fibre ke liye light meter ya OTDR</td></tr>
<tr><td>2 Data link</td><td>Kya main next hop ke MAC tak pahunch sakta hoon?</td><td>PC par <code>arp</code>, <code>show mac address-table</code>, VLAN aur trunk checks</td></tr>
<tr><td>3 Network</td><td>Addressing sahi hai aur route hai?</td><td>PC par <code>show ip</code>, <code>ping</code>, <code>traceroute</code>, <code>show ip route</code>, <code>show ip interface brief</code></td></tr>
<tr><td>4 Transport</td><td>Port khula aur allowed hai?</td><td>Service port par <code>curl</code> ya port test, ACL hit counts, firewall logs, <code>netstat</code></td></tr>
<tr><td>5-7 Upper</td><td>Service sahi jawab deti hai?</td><td><code>nslookup</code>, <code>curl</code>, application logs, packet capture</td></tr>
</table>

<h3>Fault 1: kuch nahi chalta, gateway bhi nahi</h3>
<pre class="out">PC1&gt; ping 10.0.20.10
<span class="hl">host (10.0.10.1) not reachable</span>

PC1&gt; arp
<span class="hl">arp table is empty</span></pre>
<p>PC1 gateway ka MAC bhi resolve nahi kar pa raha, isliye problem PC1 aur R1 ke beech Layer 1 ya 2 par hai. R1 par:</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     10.0.10.1       YES manual administratively down down</span>
GigabitEthernet0/1     10.0.20.1       YES manual up                    up</pre>
<p>Gateway interface shut down hai. <code>interface GigabitEthernet0/0</code>, <code>no shutdown</code> se theek karo. "administratively down" ka matlab kisi ne ise off configure kiya; sirf "down down" cable ya far-end problem ki taraf ishara karta.</p>

<h3>Fault 2: gateway chalta hai, server nahi</h3>
<pre class="out">PC1&gt; ping 10.0.10.1
84 bytes from 10.0.10.1 icmp_seq=1 ttl=255 time=0.500 ms
PC1&gt; ping 10.0.20.10
<span class="hl">10.0.20.10 icmp_seq=1 timeout</span>
10.0.20.10 icmp_seq=2 timeout</pre>
<p>Gateway tak Layers 1-3 theek hain. Doosri side check karo: SRV ka gateway sahi hai, uska link up hai, R1 ke paas route hai? Lab mein R1 par <code>show ip route</code> ko 10.0.20.0/24 ka C route GigabitEthernet0/1 se bahar dikhana chahiye. SRV par galat gateway bilkul yahi paida karta hai: requests pahunchti hain lekin replies kabhi wapas nahi aate.</p>

<h3>Fault 3: IP se ping chalta hai, naam nahi</h3>
<pre class="out">PC1&gt; ping 10.0.20.10
84 bytes from 10.0.20.10 icmp_seq=1 ttl=63 time=0.700 ms
PC1&gt; nslookup web.nwk.lab
<span class="hl">;; no DNS server configured (use: ip dns &lt;server&gt;)</span></pre>
<p>Layers 1-4 theek hain; name resolution nahi. Ports lab ki tarah resolver configure karo: <code>ip dns 10.0.10.1</code>. Agar DNS server configured hai lekin query time out hoti hai, to check karo ki UDP 53 us tak pahunchta hai aur server (yahan <code>ip dns server</code> wala R1) chal raha hai.</p>

<h3>Fault 4: naam resolve hota hai, web page fail hota hai</h3>
<pre class="out">PC1&gt; curl h&#116;tps://web.nwk.lab
<span class="hl">curl: (7) Failed to connect to 10.0.20.10 port 443: Connection refused</span></pre>
<p>"Connection refused" ka matlab packet server tak pahuncha aur usne TCP RST se jawab diya: 443 par koi listen nahi kar raha. Yeh SRV par service problem hai (Layer 4-7). Agar iski jagah <b>"Timeout was reached"</b> dikhe, to SYN ka koi jawab hi nahi aaya, jiska aam taur par matlab hai ki koi ACL ya firewall ise chupchaap drop kar raha hai, ya server unreachable hai.</p>

<div class="eg"><p><b>Worked example: saboot padho.</b> Replies mein ttl=63 = return path par ek router. ARP cache mein gateway ka MAC = gateway tak Layer 2 chalta hai. Ping reply mein ICMP type 3 code 13 = ACL ne administratively block kiya. "Connection refused" = host zinda hai aur RST se reply kiya. "Timeout" = kisi ne reply nahi kiya. Har message ek specific layer ki taraf ishara karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath kai cheezein badalna, taaki aapko kabhi pata na chale ki kisne theek kiya. Maan lena ki "ping chalta hai" matlab application chalti hai (ping sirf Layer 3 test karta hai). Saboot collect karne se pehle reboot karna, jo counters aur tables mita deta hai. Return path test karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> "IP se ping hota hai, naam se nahi" = DNS. "Local hosts tak pahunchte hain, remote nahi" = default gateway ya routing. "APIPA 169.254.x.x" = DHCP ka jawab nahi. "Connection refused" = service listen nahi kar rahi; "timeout" = filtered ya unreachable. Divide and conquer aam taur par Layer 3 par ping se shuru hota hai.</p></div>

<div class="scn"><h4>Refused ya timed out?</h4><p>Data center change ke baad finance application load hona band ho gayi. Application team ne zor diya ki network down hai. Engineer ne client se app server par TCP 443 ka port test chalaya aur "connection refused" mila. Us ek shabd ne prove kiya ki network path theek tha: server ne khud connection active roop se reject kiya tha. Certificate renewal ke baad web service start nahi hui thi. App team ne sahi certificate path ke saath use restart kiya, aur issue network blame meeting banne ki jagah 20 minute mein band ho gaya.</p><p><b>Seekh:</b> exact error text batata hai ki kis layer ne jawab diya.</p></div>

<div class="iv"><p class="q">"User kehta hai woh internal web server tak nahi pahunch pa raha. Aap kaise troubleshoot karoge?"</p><p>Strong answer: pehle scope jaano (ek user ya bahut, ek app ya sab, kya badla). Phir divide and conquer: client ka IP, mask, gateway aur DNS check karo; gateway aur server IP ko ping karo. Ping fail ho to neeche jao: ARP, interface status, VLAN, routes, ACLs. Ping chale to upar jao: naam ka nslookup, TCP port test, aur "refused" (service down) ko "timeout" (filtered) se alag karo. Path kahan rukta hai dekhne ke liye traceroute aur confirm karne ke liye capture use karo. Ek baar mein ek cheez badlo, verify karo, aur fix document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bottom-up, top-down ya divide and conquer chuno; ek ping problem ko aadha kar deta hai.</li>
<li>Har layer ke apne tools hain: interface counters, ARP, routes, port tests, nslookup, captures.</li>
<li>Gateway ke liye khaali ARP cache = gateway tak Layer 1/2 problem.</li>
<li>IP se chalta hai naam se nahi = DNS; refused = service nahi; timeout = filtered ya unreachable.</li>
<li>Kuch bhi badalne se pehle saboot collect karo, ek baar mein ek cheez badlo, end to end verify karo.</li>
</ul></div>
`}};export{e as default};