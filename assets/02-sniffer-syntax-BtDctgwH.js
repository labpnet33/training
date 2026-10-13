var e={id:`sniffer-syntax`,h:{en:`The packet sniffer: syntax, filters and verbose levels`,hi:`Packet sniffer: syntax, filters aur verbose levels`},body:{en:`
<p>The sniffer is the FortiGate's built-in tcpdump. It answers the first question of every network ticket: <b>do the packets actually arrive here, and do they leave?</b> It is safe, light, and works without any policy change, which makes it the right first move.</p>

<h3>Syntax</h3>
<pre class="code">diagnose sniffer packet &lt;interface|any&gt; '&lt;filter&gt;' &lt;verbose&gt; &lt;count&gt; &lt;timestamp&gt;</pre>
<ul>
<li><b>interface</b>: a port name such as <code>port2</code>, or <code>any</code> for all interfaces (any shows each packet with its real interface when verbose is 4 or higher).</li>
<li><b>filter</b>: tcpdump-style expression in quotes, or <code>none</code>.</li>
<li><b>verbose</b>: how much of each packet to print (table below).</li>
<li><b>count</b>: stop after N packets; <code>0</code> (or omitted) keeps running until you press Ctrl+C.</li>
<li><b>timestamp</b>: <code>a</code> prints absolute UTC time, <code>l</code> prints local time; omitted gives relative seconds.</li>
</ul>

<h3>Filter building blocks</h3>
<table class="cmp"><tr><th>Filter</th><th>Matches</th></tr>
<tr><td><code>'host 10.0.2.10'</code></td><td>Packets to or from that address</td></tr>
<tr><td><code>'src 10.0.1.10'</code> / <code>'dst 10.0.2.10'</code></td><td>Only source or only destination</td></tr>
<tr><td><code>'net 10.0.1.0/24'</code></td><td>A subnet</td></tr>
<tr><td><code>'port 80'</code></td><td>TCP or UDP port 80, either direction</td></tr>
<tr><td><code>'icmp'</code>, <code>'tcp'</code>, <code>'udp'</code>, <code>'arp'</code></td><td>The protocol</td></tr>
<tr><td><code>'host 10.0.2.10 and icmp'</code></td><td>Combine with and, or, not</td></tr>
<tr><td><code>'none'</code></td><td>No filter: everything (use only briefly with a count)</td></tr></table>

<h3>Verbose levels</h3>
<table class="cmp"><tr><th>Level</th><th>Prints</th></tr>
<tr><td>1</td><td>Packet headers only</td></tr>
<tr><td>2</td><td>Headers plus IP payload data</td></tr>
<tr><td>3</td><td>Headers plus Ethernet frame data</td></tr>
<tr><td>4</td><td>Headers plus the <b>interface name</b> and direction</td></tr>
<tr><td>5</td><td>Level 2 plus the interface name</td></tr>
<tr><td>6</td><td>Level 3 plus the interface name</td></tr></table>
<p>Level <b>4</b> is the everyday choice: small output, and it shows which interface each packet used and whether it was <code>in</code> or <code>out</code>. Levels 5 and 6 add payload bytes and are what you capture when you want to analyse in Wireshark later.</p>

<h3>A first capture, captured from the lab</h3>
<p>On FGT1 we capture ICMP to or from the DMZ server with verbose 4 and count 4, then ping 10.0.2.10 from PC1:</p>
<pre class="out">FGT1# diagnose sniffer packet any "host 10.0.2.10 and icmp" 4 4
interfaces=[any]
filters=[host 10.0.2.10 and icmp]
0.000000 <span class="hl">port2 in</span> 10.0.1.10 -&gt; 10.0.2.10: icmp: echo request
0.001000 <span class="hl">port3 out</span> 10.0.1.10 -&gt; 10.0.2.10: icmp: echo request
0.001000 port3 in 10.0.2.10 -&gt; 10.0.1.10: icmp: echo reply
0.002000 port2 out 10.0.2.10 -&gt; 10.0.1.10: icmp: echo reply

4 packets received by filter
0 packets dropped by kernel</pre>
<p>Read it as a story: the request comes <b>in</b> on <code>port2</code> (LAN), goes <b>out</b> on <code>port3</code> (DMZ) with the same addresses (no NAT between these two zones), the reply comes <b>in</b> on <code>port3</code> and goes <b>out</b> on <code>port2</code>. The closing lines tell you how many packets matched the filter.</p>

<div class="eg"><p><b>Worked example.</b> To see only the first web request to the DMZ server without noise, you would use <code>diagnose sniffer packet any "host 10.0.2.10 and port 80" 4 6</code>. Six packets is enough for a three-way handshake and the first data exchange. Six, not zero, because a count prevents an endless capture.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using <code>none</code> without a count on a busy interface. The console scrolls so fast that the capture is useless and the CPU takes the load. Always combine a specific filter with a count.</p></div>
<div class="exam"><p><b>Exam trap.</b> Verbose 4 shows the interface name; levels 5 and 6 also show interface names but add packet data. If you need to save a capture for Wireshark, use verbose 6 and convert the output. And remember <code>any</code> is a legal interface value.</p></div>

<div class="scn"><h4>The capture that filled the console</h4><p>A new engineer ran the sniffer with filter <code>none</code> on the WAN interface during business hours. The terminal froze for minutes and the session timed out. The senior engineer reconnected, pressed Ctrl+C, and repeated the capture with <code>'host 203.0.113.1 and icmp'</code> and a count of 10. Result in a second, no impact.</p><p><b>Lesson:</b> a good filter is the whole skill.</p></div>

<div class="iv"><p class="q">"What does verbose level 4 do in the FortiGate sniffer and why use it?"</p><p>Level 4 prints packet headers with the interface name and direction (in or out), so you can see on which port a packet arrived and left. That is exactly what I need for routing, policy and NAT questions. Levels 5 and 6 add payload bytes for deeper analysis.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syntax: interface or any, filter, verbose, count, timestamp.</li>
<li>Filters follow tcpdump: host, src, dst, net, port, protocol, and/or/not.</li>
<li>Verbose 4 adds interface and direction; 5 and 6 add payload.</li>
<li>Always use a filter and a count.</li>
<li>The footer shows packets received by filter and dropped by kernel.</li>
</ul></div>
`,hi:`
<p>Sniffer FortiGate ka built-in tcpdump hai. Yeh har network ticket ke pehle sawaal ka jawab deta hai: <b>kya packets sach mein yahan aate hain, aur jaate hain?</b> Yeh safe, halka hai, aur bina policy change ke chalta hai, isliye pehla move yahi sahi hai.</p>

<h3>Syntax</h3>
<pre class="code">diagnose sniffer packet &lt;interface|any&gt; '&lt;filter&gt;' &lt;verbose&gt; &lt;count&gt; &lt;timestamp&gt;</pre>
<ul>
<li><b>interface</b>: <code>port2</code> jaisa port name, ya saare interfaces ke liye <code>any</code> (verbose 4 ya usse upar any har packet ko uske asli interface ke saath dikhata hai).</li>
<li><b>filter</b>: quotes mein tcpdump-style expression, ya <code>none</code>.</li>
<li><b>verbose</b>: har packet ka kitna hissa print ho (neeche table).</li>
<li><b>count</b>: N packets ke baad ruk jao; <code>0</code> (ya omit) Ctrl+C dabane tak chalta rehta hai.</li>
<li><b>timestamp</b>: <code>a</code> absolute UTC time, <code>l</code> local time print karta hai; omit karne par relative seconds.</li>
</ul>

<h3>Filter ke building blocks</h3>
<table class="cmp"><tr><th>Filter</th><th>Kya match karta hai</th></tr>
<tr><td><code>'host 10.0.2.10'</code></td><td>Us address ke to ya from packets</td></tr>
<tr><td><code>'src 10.0.1.10'</code> / <code>'dst 10.0.2.10'</code></td><td>Sirf source ya sirf destination</td></tr>
<tr><td><code>'net 10.0.1.0/24'</code></td><td>Ek subnet</td></tr>
<tr><td><code>'port 80'</code></td><td>TCP ya UDP port 80, dono directions</td></tr>
<tr><td><code>'icmp'</code>, <code>'tcp'</code>, <code>'udp'</code>, <code>'arp'</code></td><td>Protocol</td></tr>
<tr><td><code>'host 10.0.2.10 and icmp'</code></td><td>and, or, not se combine karo</td></tr>
<tr><td><code>'none'</code></td><td>Koi filter nahi: sab kuch (sirf thodi der, count ke saath)</td></tr></table>

<h3>Verbose levels</h3>
<table class="cmp"><tr><th>Level</th><th>Kya print hota hai</th></tr>
<tr><td>1</td><td>Sirf packet headers</td></tr>
<tr><td>2</td><td>Headers aur IP payload data</td></tr>
<tr><td>3</td><td>Headers aur Ethernet frame data</td></tr>
<tr><td>4</td><td>Headers ke saath <b>interface name</b> aur direction</td></tr>
<tr><td>5</td><td>Level 2 aur interface name</td></tr>
<tr><td>6</td><td>Level 3 aur interface name</td></tr></table>
<p>Level <b>4</b> roz ka choice hai: chhota output, aur dikhata hai ki har packet ne kaunsa interface use kiya aur woh <code>in</code> tha ya <code>out</code>. Level 5 aur 6 payload bytes jodte hain aur tab capture karte ho jab baad mein Wireshark mein analyse karna ho.</p>

<h3>Lab se capture kiya pehla capture</h3>
<p>FGT1 par hum DMZ server ke ICMP ko verbose 4 aur count 4 ke saath capture karte hain, phir PC1 se 10.0.2.10 ping karte hain:</p>
<pre class="out">FGT1# diagnose sniffer packet any "host 10.0.2.10 and icmp" 4 4
interfaces=[any]
filters=[host 10.0.2.10 and icmp]
0.000000 <span class="hl">port2 in</span> 10.0.1.10 -&gt; 10.0.2.10: icmp: echo request
0.001000 <span class="hl">port3 out</span> 10.0.1.10 -&gt; 10.0.2.10: icmp: echo request
0.001000 port3 in 10.0.2.10 -&gt; 10.0.1.10: icmp: echo reply
0.002000 port2 out 10.0.2.10 -&gt; 10.0.1.10: icmp: echo reply

4 packets received by filter
0 packets dropped by kernel</pre>
<p>Ise kahani ki tarah padho: request <code>port2</code> (LAN) par <b>in</b> aayi, same addresses ke saath <code>port3</code> (DMZ) se <b>out</b> gayi (in dono zones ke beech NAT nahi), reply <code>port3</code> par <b>in</b> aayi aur <code>port2</code> se <b>out</b> gayi. Aakhri lines batati hain ki filter se kitne packets match hue.</p>

<div class="eg"><p><b>Worked example.</b> Bina noise ke DMZ server ko pehla web request dekhne ke liye aap <code>diagnose sniffer packet any "host 10.0.2.10 and port 80" 4 6</code> use karoge. Chhe packets three-way handshake aur pehle data exchange ke liye kaafi hain. Zero nahi, chhe, kyunki count endless capture rokta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Busy interface par count ke bina <code>none</code> use karna. Console itni tez scroll hota hai ki capture bekaar ho jaata hai aur CPU par load padta hai. Hamesha specific filter aur count saath do.</p></div>
<div class="exam"><p><b>Exam trap.</b> Verbose 4 interface name dikhata hai; level 5 aur 6 bhi interface names dikhate hain lekin packet data jodte hain. Wireshark ke liye capture save karna ho to verbose 6 use karke output convert karo. Aur yaad rakho <code>any</code> legal interface value hai.</p></div>

<div class="scn"><h4>Capture jisne console bhar diya</h4><p>Naye engineer ne business hours mein WAN interface par filter <code>none</code> ke saath sniffer chalaya. Terminal kuch minute freeze raha aur session timeout ho gaya. Senior engineer ne reconnect kiya, Ctrl+C dabaya, aur <code>'host 203.0.113.1 and icmp'</code> aur count 10 ke saath capture dobara kiya. Ek second mein result, koi impact nahi.</p><p><b>Lesson:</b> accha filter hi poori skill hai.</p></div>

<div class="iv"><p class="q">"FortiGate sniffer mein verbose level 4 kya karta hai aur kyun use karte hain?"</p><p>Level 4 packet headers ke saath interface name aur direction (in ya out) print karta hai, taaki dikhe ki packet kis port par aaya aur gaya. Routing, policy aur NAT ke sawaalon ke liye yahi chahiye. Level 5 aur 6 gehre analysis ke liye payload bytes jodte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Syntax: interface ya any, filter, verbose, count, timestamp.</li>
<li>Filters tcpdump jaise: host, src, dst, net, port, protocol, and/or/not.</li>
<li>Verbose 4 interface aur direction jodta hai; 5 aur 6 payload.</li>
<li>Hamesha filter aur count use karo.</li>
<li>Footer packets received by filter aur dropped by kernel dikhata hai.</li>
</ul></div>
`}};export{e as default};