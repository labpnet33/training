var e={id:`software-tools`,h:{en:`Software tools and command-line utilities`,hi:`Software tools aur command-line utilities`},body:{en:`
<p>Objective 5.5 is the toolbox. A mechanic does not use a hammer for every job, and a network engineer does not use ping for every question. Each tool answers <b>one kind of question</b>. Learn the question first and the tool becomes obvious. This chapter covers the software tools; the next chapter covers hardware tools and device commands.</p>

<table class="cmp"><tr><th>Question you are asking</th><th>Tool</th></tr>
<tr><td>Can I reach it, and how long does it take?</td><td><code>ping</code></td></tr>
<tr><td>Where along the path does it stop or slow down?</td><td><code>traceroute</code> / <code>tracert</code></td></tr>
<tr><td>What does DNS say this name is?</td><td><code>nslookup</code>, <code>dig</code></td></tr>
<tr><td>What are my own address, mask, gateway, DNS?</td><td><code>ipconfig</code>, <code>ip</code>, <code>ifconfig</code></td></tr>
<tr><td>Which MAC does this IP map to?</td><td><code>arp</code></td></tr>
<tr><td>Which connections and listening ports does this host have?</td><td><code>netstat</code></td></tr>
<tr><td>What exactly is on the wire?</td><td>Protocol analyzer, <code>tcpdump</code></td></tr>
<tr><td>Which ports and services does a host expose? (authorised audits only)</td><td><code>nmap</code></td></tr>
<tr><td>What device is plugged into this switch port?</td><td>LLDP / CDP</td></tr>
<tr><td>How fast is this path really?</td><td>Speed tester, iperf</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Software tools by OSI layer">
<rect x="10" y="10" width="150" height="36" rx="6" fill="#ddd6fe"/><text x="85" y="33" text-anchor="middle" class="svg-ink" font-size="13">L7 application</text><text x="180" y="33" class="svg-muted" font-size="12">nslookup, dig, speed test</text>
<rect x="10" y="52" width="150" height="36" rx="6" fill="#ddd6fe"/><text x="85" y="75" text-anchor="middle" class="svg-ink" font-size="13">L4 transport</text><text x="180" y="75" class="svg-muted" font-size="12">netstat, nmap (authorised), tcpdump</text>
<rect x="10" y="94" width="150" height="36" rx="6" fill="#bae6fd"/><text x="85" y="117" text-anchor="middle" class="svg-ink" font-size="13">L3 network</text><text x="180" y="117" class="svg-muted" font-size="12">ping, traceroute, ipconfig / ip</text>
<rect x="10" y="136" width="150" height="36" rx="6" fill="#bbf7d0"/><text x="85" y="159" text-anchor="middle" class="svg-ink" font-size="13">L2 data link</text><text x="180" y="159" class="svg-muted" font-size="12">arp, LLDP / CDP</text>
<text x="620" y="100" text-anchor="end" class="svg-accent" font-size="12">protocol analyzer: all layers</text>
</svg><p class="cap">Each tool tests a layer; a protocol analyzer decodes every layer at once.</p></div>

<h3>ping</h3>
<p>Sends ICMP echo requests and reports replies, round-trip time and loss. Use it for reachability and for divide and conquer. Remember that many firewalls block ICMP, so "no reply" does not always mean "down". On Windows use <code>ping -t</code> for a continuous test; on Linux <code>ping -c 100</code> for a fixed count. Routers support <code>ping 10.0.12.2 repeat 100</code>, which you will use in the slow-link lab.</p>

<h3>traceroute / tracert</h3>
<p>Shows every router hop to a destination by sending packets with TTL 1, 2, 3 and so on, and listening for ICMP "time exceeded" messages. Windows <code>tracert</code> uses ICMP echo; Linux <code>traceroute</code> uses UDP by default. A row of <code>* * *</code> means that hop did not answer, which may simply be a filter. The useful signal is <b>where the trace stops</b> or <b>where latency jumps</b>.</p>
<pre class="out">PC1&gt; trace 10.0.20.10
trace to 10.0.20.10, 8 hops max, press Ctrl+C to stop
 1   10.0.10.1   1.204 ms  0.873 ms  0.911 ms
<span class="hl"> 2   *10.0.10.1   1.022 ms (ICMP type:3, code:0, Destination network unreachable)</span></pre>
<p>The gateway answers hop 1, then itself reports the destination network unreachable: R1 has no route to 10.0.20.0/24. That is how the file-server lab starts.</p>

<h3>nslookup and dig</h3>
<p>Both query DNS directly, bypassing the application. <code>nslookup</code> exists on Windows and Linux; <code>dig</code> is the Linux/macOS tool with more detailed output. Both let you ask a <b>specific server</b>, which is how you prove whether the client's DNS server or the record itself is wrong.</p>
<pre class="out">C:&#92;&gt; nslookup web.nwk.lab 10.0.10.1
Server:  UnKnown
Address:  10.0.10.1

Name:    web.nwk.lab
<span class="hl">Address:  10.0.20.99</span>

$ dig @10.0.10.1 web.corp.example A
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, <span class="hl">status: NOERROR</span>, id: 4121
;; ANSWER SECTION:
web.corp.example.     3600    IN    A    10.0.20.10
;; SERVER: 10.0.10.1#53(10.0.10.1)</pre>
<p>Watch the status: <b>NOERROR</b> with an answer is good; <b>NXDOMAIN</b> means the name does not exist; <b>SERVFAIL</b> means the server could not resolve it; a timeout or "connection refused" means you are not talking to a working DNS server at all.</p>

<h3>ip, ifconfig, ipconfig</h3>
<p>Show the host's own settings. Windows: <code>ipconfig /all</code> (address, mask, gateway, DNS, DHCP server, lease), <code>ipconfig /release</code>, <code>/renew</code>, <code>/flushdns</code>. Linux: <code>ip addr</code>, <code>ip route</code> (the host's routing table and default gateway); <code>ifconfig</code> is the older tool. Always check these before blaming the network.</p>

<h3>arp</h3>
<p><code>arp -a</code> lists the host's ARP cache: IP to MAC mappings on the local subnet. Use it to spot a duplicate IP (the MAC is not the device you expect) or to confirm the gateway's MAC was learnt at all.</p>

<h3>netstat</h3>
<p>Lists the host's connections and listening ports: <code>netstat -an</code> (all, numeric), <code>netstat -ano</code> on Windows adds the process ID, <code>netstat -r</code> shows the routing table. Use it to answer "is the service actually listening on port 443?" and "is the client's connection stuck in SYN_SENT?" (the SYN left but no reply came back). On modern Linux, <code>ss</code> does the same job.</p>

<h3>Protocol analyzer and tcpdump</h3>
<p>A <b>protocol analyzer</b> (packet sniffer, such as Wireshark) captures frames and decodes every header, so you see exactly what was sent and what came back. <code>tcpdump</code> is the command-line capture tool on Linux and network appliances. Capture close to the problem, filter tightly, and read the handshake:</p>
<pre class="out">$ sudo tcpdump -i eth0 -n host 10.0.20.10 and port 80
10:14:02.118 IP 10.0.10.10.51544 &gt; 10.0.20.10.80: Flags [S], seq 1840012, win 64240, length 0
<span class="hl">10:14:03.121 IP 10.0.10.10.51544 &gt; 10.0.20.10.80: Flags [S], seq 1840012, win 64240, length 0</span></pre>
<p>The client sends a SYN, gets no SYN-ACK, and retransmits. Either the SYN never reaches the server, or the reply cannot come back (a wrong gateway on the server, a missing route, or a filter).</p>

<h3>nmap: port scanning, authorised use only</h3>
<p><code>nmap</code> discovers hosts and tests which TCP/UDP ports are <b>open</b>, <b>closed</b> or <b>filtered</b>. Network teams use it defensively: to confirm a firewall rule really blocks a port, to verify that a new server exposes only the intended services, or to audit their own subnets for unexpected listeners. Scan <b>only</b> systems you own or have written permission to test; unauthorised scanning breaks policy and often the law, and intrusion detection systems will flag it.</p>
<pre class="out">$ nmap -sT -p 22,80,443 10.0.20.10
PORT    STATE    SERVICE
22/tcp  filtered ssh
80/tcp  open     h&#116;tp
443/tcp closed   h&#116;tps</pre>

<h3>LLDP and CDP</h3>
<p>Discovery protocols that let directly connected devices announce their name, model, port and address. <b>LLDP</b> is the open IEEE 802.1AB standard; <b>CDP</b> is Cisco's own. Use <code>show lldp neighbors</code> or <code>show cdp neighbors</code> to learn what is really on the other end of a port, which is priceless when the documentation is out of date. Disable them on ports that face untrusted networks, because they reveal device details.</p>

<h3>Speed testers</h3>
<p>Internet speed test sites measure your internet path; <b>iperf</b> measures throughput between two hosts you control, which isolates internal links. Test wired, from a known-good host, several times, and at different hours before drawing conclusions.</p>

<div class="warn"><p><b>Common mistakes.</b> Treating a failed ping as proof a host is down (ICMP may be blocked). Testing DNS with a browser instead of nslookup against a specific server. Capturing on the wrong interface or without a filter and drowning in data. Running nmap against someone else's network "just to check".</p></div>

<div class="exam"><p><b>Exam traps.</b> tracert (Windows) uses ICMP; traceroute (Linux) uses UDP by default. dig and nslookup test DNS. netstat shows connections and listening ports; arp shows IP-to-MAC. LLDP is vendor-neutral; CDP is Cisco. A protocol analyzer decodes captured traffic; nmap is a port scanner.</p></div>

<div class="scn"><h4>The web server that was "up"</h4><p>A new intranet server passed every ping, but nobody could open the site. <code>netstat -an</code> on the server showed port 443 in LISTENING state only on 127.0.0.1, not on its LAN address. The web service had been configured to bind to localhost during testing. After the bind address was fixed, <code>netstat</code> showed 0.0.0.0:443 LISTENING, and an authorised <code>nmap</code> check from the admin VLAN confirmed port 443 open and every other port filtered, exactly as the change request specified.</p><p><b>Lesson:</b> ping proves layer 3; only a port check proves the service.</p></div>

<div class="iv"><p class="q">"Ping works but the application does not. Which tools do you use next?"</p><p>Move up the stack. Check name resolution with nslookup or dig against the configured DNS server; check the port with netstat on the server (is it listening, on which address?) and a TCP test from the client; then capture with a protocol analyzer or tcpdump to see whether the SYN gets a SYN-ACK, a RST or nothing. Mention checking ACLs or firewalls along the path, and using nmap only within an authorised scope.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pick the tool by the question: reach (ping), path (traceroute), name (nslookup/dig), host settings (ipconfig/ip), neighbours (arp), sockets (netstat).</li>
<li>Protocol analyzers and tcpdump show the truth on the wire; read the TCP handshake.</li>
<li>nmap is for authorised, defensive checks of your own systems only.</li>
<li>LLDP (IEEE) and CDP (Cisco) reveal what is connected to each port.</li>
<li>Speed tests measure a path at a moment; iperf between your own hosts isolates internal links.</li>
</ul></div>
`,hi:`
<p>Objective 5.5 toolbox hai. Mechanic har kaam ke liye hathoda use nahi karta, aur network engineer har sawaal ke liye ping use nahi karta. Har tool <b>ek tarah ke sawaal</b> ka jawab deta hai. Pehle sawaal seekho aur tool apne aap samajh aa jaata hai. Yeh chapter software tools cover karta hai; agla chapter hardware tools aur device commands.</p>

<table class="cmp"><tr><th>Aap kya poochh rahe ho</th><th>Tool</th></tr>
<tr><td>Kya main wahan pahunch sakta hoon, aur kitna time lagta hai?</td><td><code>ping</code></td></tr>
<tr><td>Path mein kahan rukta hai ya slow hota hai?</td><td><code>traceroute</code> / <code>tracert</code></td></tr>
<tr><td>DNS is naam ke baare mein kya kehta hai?</td><td><code>nslookup</code>, <code>dig</code></td></tr>
<tr><td>Mera apna address, mask, gateway, DNS kya hai?</td><td><code>ipconfig</code>, <code>ip</code>, <code>ifconfig</code></td></tr>
<tr><td>Yeh IP kis MAC se map hota hai?</td><td><code>arp</code></td></tr>
<tr><td>Is host ke kaunse connections aur listening ports hain?</td><td><code>netstat</code></td></tr>
<tr><td>Wire par exactly kya hai?</td><td>Protocol analyzer, <code>tcpdump</code></td></tr>
<tr><td>Host kaunse ports aur services expose karta hai? (sirf authorised audits)</td><td><code>nmap</code></td></tr>
<tr><td>Is switch port mein kaunsa device laga hai?</td><td>LLDP / CDP</td></tr>
<tr><td>Yeh path asal mein kitna tez hai?</td><td>Speed tester, iperf</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="OSI layer ke hisaab se software tools">
<rect x="10" y="10" width="150" height="36" rx="6" fill="#ddd6fe"/><text x="85" y="33" text-anchor="middle" class="svg-ink" font-size="13">L7 application</text><text x="180" y="33" class="svg-muted" font-size="12">nslookup, dig, speed test</text>
<rect x="10" y="52" width="150" height="36" rx="6" fill="#ddd6fe"/><text x="85" y="75" text-anchor="middle" class="svg-ink" font-size="13">L4 transport</text><text x="180" y="75" class="svg-muted" font-size="12">netstat, nmap (authorised), tcpdump</text>
<rect x="10" y="94" width="150" height="36" rx="6" fill="#bae6fd"/><text x="85" y="117" text-anchor="middle" class="svg-ink" font-size="13">L3 network</text><text x="180" y="117" class="svg-muted" font-size="12">ping, traceroute, ipconfig / ip</text>
<rect x="10" y="136" width="150" height="36" rx="6" fill="#bbf7d0"/><text x="85" y="159" text-anchor="middle" class="svg-ink" font-size="13">L2 data link</text><text x="180" y="159" class="svg-muted" font-size="12">arp, LLDP / CDP</text>
<text x="620" y="100" text-anchor="end" class="svg-accent" font-size="12">protocol analyzer: saari layers</text>
</svg><p class="cap">Har tool ek layer test karta hai; protocol analyzer har layer ek saath decode karta hai.</p></div>

<h3>ping</h3>
<p>ICMP echo requests bhejta hai aur replies, round-trip time aur loss report karta hai. Reachability aur divide and conquer ke liye use karo. Yaad rakho ki kai firewalls ICMP block karte hain, isliye "no reply" ka matlab hamesha "down" nahi hota. Windows par continuous test ke liye <code>ping -t</code>; Linux par fixed count ke liye <code>ping -c 100</code>. Routers <code>ping 10.0.12.2 repeat 100</code> support karte hain, jo aap slow-link lab mein use karoge.</p>

<h3>traceroute / tracert</h3>
<p>Destination tak har router hop dikhata hai, TTL 1, 2, 3 waghera wale packets bhej kar aur ICMP "time exceeded" messages sun kar. Windows <code>tracert</code> ICMP echo use karta hai; Linux <code>traceroute</code> default mein UDP. <code>* * *</code> ki row matlab us hop ne jawab nahi diya, jo bas ek filter ho sakta hai. Useful signal hai <b>trace kahan rukta hai</b> ya <b>latency kahan uchhalti hai</b>.</p>
<pre class="out">PC1&gt; trace 10.0.20.10
trace to 10.0.20.10, 8 hops max, press Ctrl+C to stop
 1   10.0.10.1   1.204 ms  0.873 ms  0.911 ms
<span class="hl"> 2   *10.0.10.1   1.022 ms (ICMP type:3, code:0, Destination network unreachable)</span></pre>
<p>Gateway hop 1 ka jawab deta hai, phir khud destination network unreachable report karta hai: R1 ke paas 10.0.20.0/24 ka route nahi hai. File-server lab aise hi shuru hota hai.</p>

<h3>nslookup aur dig</h3>
<p>Dono DNS ko seedha query karte hain, application ko bypass karke. <code>nslookup</code> Windows aur Linux par hai; <code>dig</code> Linux/macOS tool hai zyada detailed output ke saath. Dono aapko <b>specific server</b> se poochhne dete hain, jisse aap saabit karte ho ki client ka DNS server galat hai ya record khud.</p>
<pre class="out">C:&#92;&gt; nslookup web.nwk.lab 10.0.10.1
Server:  UnKnown
Address:  10.0.10.1

Name:    web.nwk.lab
<span class="hl">Address:  10.0.20.99</span>

$ dig @10.0.10.1 web.corp.example A
;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, <span class="hl">status: NOERROR</span>, id: 4121
;; ANSWER SECTION:
web.corp.example.     3600    IN    A    10.0.20.10
;; SERVER: 10.0.10.1#53(10.0.10.1)</pre>
<p>Status dekho: jawab ke saath <b>NOERROR</b> achha hai; <b>NXDOMAIN</b> matlab naam exist nahi karta; <b>SERVFAIL</b> matlab server resolve nahi kar paya; timeout ya "connection refused" matlab aap kisi working DNS server se baat hi nahi kar rahe.</p>

<h3>ip, ifconfig, ipconfig</h3>
<p>Host ki apni settings dikhate hain. Windows: <code>ipconfig /all</code> (address, mask, gateway, DNS, DHCP server, lease), <code>ipconfig /release</code>, <code>/renew</code>, <code>/flushdns</code>. Linux: <code>ip addr</code>, <code>ip route</code> (host ki routing table aur default gateway); <code>ifconfig</code> purana tool hai. Network ko blame karne se pehle hamesha yeh check karo.</p>

<h3>arp</h3>
<p><code>arp -a</code> host ka ARP cache list karta hai: local subnet par IP se MAC mappings. Isse duplicate IP pakdo (MAC woh device nahi jo aap expect karte ho) ya confirm karo ki gateway ka MAC seekha bhi gaya hai.</p>

<h3>netstat</h3>
<p>Host ke connections aur listening ports list karta hai: <code>netstat -an</code> (all, numeric), Windows par <code>netstat -ano</code> process ID jodta hai, <code>netstat -r</code> routing table dikhata hai. Ise "kya service sach mein port 443 par listen kar rahi hai?" aur "kya client ka connection SYN_SENT mein atka hai?" (SYN gaya lekin reply wapas nahi aaya) ka jawab dene ke liye use karo. Modern Linux par <code>ss</code> yahi kaam karta hai.</p>

<h3>Protocol analyzer aur tcpdump</h3>
<p><b>Protocol analyzer</b> (packet sniffer, jaise Wireshark) frames capture karta hai aur har header decode karta hai, taaki aap exactly dekho kya bheja gaya aur kya wapas aaya. <code>tcpdump</code> Linux aur network appliances par command-line capture tool hai. Problem ke paas capture karo, tight filter lagao, aur handshake padho:</p>
<pre class="out">$ sudo tcpdump -i eth0 -n host 10.0.20.10 and port 80
10:14:02.118 IP 10.0.10.10.51544 &gt; 10.0.20.10.80: Flags [S], seq 1840012, win 64240, length 0
<span class="hl">10:14:03.121 IP 10.0.10.10.51544 &gt; 10.0.20.10.80: Flags [S], seq 1840012, win 64240, length 0</span></pre>
<p>Client SYN bhejta hai, SYN-ACK nahi milta, aur retransmit karta hai. Ya to SYN server tak pahunchta hi nahi, ya reply wapas nahi aa sakta (server par galat gateway, missing route, ya filter).</p>

<h3>nmap: port scanning, sirf authorised use</h3>
<p><code>nmap</code> hosts discover karta hai aur test karta hai ki kaunse TCP/UDP ports <b>open</b>, <b>closed</b> ya <b>filtered</b> hain. Network teams ise defensively use karti hain: confirm karne ke liye ki firewall rule sach mein port block karta hai, verify karne ke liye ki naya server sirf intended services expose karta hai, ya apne subnets ko unexpected listeners ke liye audit karne ke liye. <b>Sirf</b> un systems ko scan karo jo aapke hain ya jinhe test karne ki likhit permission hai; unauthorised scanning policy aur aksar kanoon todti hai, aur intrusion detection systems use flag karenge.</p>
<pre class="out">$ nmap -sT -p 22,80,443 10.0.20.10
PORT    STATE    SERVICE
22/tcp  filtered ssh
80/tcp  open     h&#116;tp
443/tcp closed   h&#116;tps</pre>

<h3>LLDP aur CDP</h3>
<p>Discovery protocols jo directly connected devices ko apna naam, model, port aur address announce karne dete hain. <b>LLDP</b> open IEEE 802.1AB standard hai; <b>CDP</b> Cisco ka apna hai. <code>show lldp neighbors</code> ya <code>show cdp neighbors</code> se seekho ki port ke doosre end par asal mein kya hai, jo documentation purani hone par anmol hai. Untrusted networks ki taraf wale ports par inhe disable karo, kyunki yeh device details reveal karte hain.</p>

<h3>Speed testers</h3>
<p>Internet speed test sites aapka internet path naapti hain; <b>iperf</b> do aise hosts ke beech throughput naapta hai jo aapke control mein hain, jo internal links isolate karta hai. Nateeja nikaalne se pehle wired, known-good host se, kai baar, aur alag ghanton par test karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Failed ping ko host down hone ka saboot maanna (ICMP block ho sakta hai). DNS ko specific server ke against nslookup ki jagah browser se test karna. Galat interface par ya bina filter capture karna aur data mein doob jaana. Kisi aur ke network par "bas check karne ke liye" nmap chalana.</p></div>

<div class="exam"><p><b>Exam traps.</b> tracert (Windows) ICMP use karta hai; traceroute (Linux) default mein UDP. dig aur nslookup DNS test karte hain. netstat connections aur listening ports dikhata hai; arp IP-to-MAC dikhata hai. LLDP vendor-neutral hai; CDP Cisco. Protocol analyzer captured traffic decode karta hai; nmap port scanner hai.</p></div>

<div class="scn"><h4>Web server jo "up" tha</h4><p>Ek naya intranet server har ping pass karta tha, lekin koi site nahi khol pa raha tha. Server par <code>netstat -an</code> ne port 443 ko LISTENING state mein sirf 127.0.0.1 par dikhaya, LAN address par nahi. Testing ke dauraan web service ko localhost par bind karne ke liye configure kiya gaya tha. Bind address theek hone ke baad <code>netstat</code> ne 0.0.0.0:443 LISTENING dikhaya, aur admin VLAN se ek authorised <code>nmap</code> check ne port 443 open aur baaki har port filtered confirm kiya, bilkul waisa jaisa change request mein likha tha.</p><p><b>Seekh:</b> ping layer 3 saabit karta hai; sirf port check service saabit karta hai.</p></div>

<div class="iv"><p class="q">"Ping chalti hai lekin application nahi. Aage kaunse tools use karoge?"</p><p>Stack mein upar jao. Configured DNS server ke against nslookup ya dig se name resolution check karo; server par netstat se port check karo (listen kar raha hai, kis address par?) aur client se TCP test; phir protocol analyzer ya tcpdump se capture karo aur dekho ki SYN ko SYN-ACK, RST ya kuch nahi milta. Path par ACLs ya firewalls check karna mention karo, aur nmap sirf authorised scope ke andar use karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sawaal se tool chuno: reach (ping), path (traceroute), naam (nslookup/dig), host settings (ipconfig/ip), neighbours (arp), sockets (netstat).</li>
<li>Protocol analyzers aur tcpdump wire ka sach dikhate hain; TCP handshake padho.</li>
<li>nmap sirf apne systems ke authorised, defensive checks ke liye hai.</li>
<li>LLDP (IEEE) aur CDP (Cisco) batate hain har port se kya juda hai.</li>
<li>Speed tests ek pal mein ek path naapte hain; apne hosts ke beech iperf internal links isolate karta hai.</li>
</ul></div>
`}};export{e as default};