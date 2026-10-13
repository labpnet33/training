var e={id:`ping-tracepath`,h:{en:`Reachability tests: ping, tracepath and traceroute`,hi:`Reachability tests: ping, tracepath aur traceroute`},body:{en:`
<p>Once the server has an address, a route and DNS, you test the path. Two tools do almost all of the work: <b>ping</b> asks "are you there and how fast?", and <b>tracepath</b> or <b>traceroute</b> ask "which routers are on the way?". You know both from routers. Linux has a few differences worth learning.</p>

<h3>ping on Linux runs forever</h3>
<p>Cisco IOS sends five pings and stops. Linux <code>ping</code> keeps going until you press Ctrl+C. In scripts and tickets always limit it with <code>-c COUNT</code>:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ping -c 3 10.30.0.1</span>
PING 10.30.0.1 (10.30.0.1) 56(84) bytes of data.
64 bytes from 10.30.0.1: icmp_seq=1 <span class="hl">ttl=255</span> time=0.50 ms
64 bytes from 10.30.0.1: icmp_seq=2 ttl=255 time=0.60 ms
64 bytes from 10.30.0.1: icmp_seq=3 ttl=255 time=0.70 ms

--- 10.30.0.1 ping statistics ---
3 packets transmitted, 3 received, <span class="hl">0% packet loss</span>, time 2006ms
rtt min/avg/max/mdev = 0.500/0.600/0.700/0.100 ms</pre>
<p>Read it: <code>56(84) bytes</code> is the data size (56) and the total packet with headers (84). <code>icmp_seq</code> numbers the replies, so a gap shows a lost packet. <code>time</code> is the round-trip time in milliseconds. <b>ttl</b> is the time-to-live left in the reply. Each router on the way subtracts 1, so TTL is a quick hint about distance. Compare the reply from the NMS two hops away:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 3 10.10.0.10
64 bytes from 10.10.0.10: icmp_seq=1 <span class="hl">ttl=63</span> time=0.50 ms</pre>
<p>The router answered with TTL 255 (its default start value) while the server behind it answered with 63, which is a start value of 64 minus one router hop. The last block, <code>0% packet loss</code> and the <code>rtt</code> line, is the summary you quote in a ticket.</p>

<h3>The three failure messages and what each means</h3>
<table class="cmp"><tr><th>Message</th><th>Who says it</th><th>Typical cause</th></tr>
<tr><td><code>ping: connect: Network is unreachable</code></td><td>Your own kernel</td><td>No route (missing default gateway)</td></tr>
<tr><td><code>From 10.30.0.10 ... Destination Host Unreachable</code></td><td>The device in the "From" field</td><td>ARP got no answer, or a router has no route</td></tr>
<tr><td>No reply, 100% loss, no message</td><td>Nobody</td><td>Firewall drop, device down, or replies lost</td></tr>
<tr><td><code>ping: NAME: Temporary failure in name resolution</code></td><td>The resolver</td><td>DNS problem (Chapter 5)</td></tr>
</table>
<p>Here is the second one captured from the simulator, for an address nobody owns:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 2 10.10.0.99
PING 10.10.0.99 (10.10.0.99) 56(84) bytes of data.
<span class="hl">From 10.30.0.10 icmp_seq=1 Destination Host Unreachable</span>
From 10.30.0.10 icmp_seq=2 Destination Host Unreachable

--- 10.10.0.99 ping statistics ---
2 packets transmitted, 0 received, +2 errors, 100% packet loss, time 1003ms</pre>
<p>The <code>From</code> address tells you <b>who gave up</b>. Here it is the server itself (10.30.0.10): it could not find that host, so it reported the failure on its own. If the <code>From</code> were the gateway's address, the gateway would be the one telling you it has no way forward. Always read that field.</p>

<h3>Seeing the path: tracepath and traceroute</h3>
<p><code>tracepath</code> is installed on Ubuntu by default and needs no administrator rights. It lists each hop with the delay:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">tracepath 10.10.0.10</span>
 1?: [LOCALHOST]                      pmtu 1500
 1:   10.30.0.1                        0.510ms
 2:   10.10.0.10                       0.720ms reached
     Resume: pmtu 1500 hops 2 back 2</pre>
<p>Hop 1 is the gateway R1, hop 2 is the destination itself, marked <code>reached</code>. <code>pmtu 1500</code> is the path MTU, the largest packet that fits end to end, useful when "big packets fail". <code>traceroute</code> is the classic tool; it is not installed by default, so you add it with <code>sudo apt install traceroute</code> (shown in the services module):</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">traceroute -n 10.10.0.10</span>
traceroute to 10.10.0.10 (10.10.0.10), 30 hops max, 60 byte packets
 1  10.30.0.1 (10.30.0.1)  0.510 ms  0.470 ms  0.490 ms
 2  10.10.0.10 (10.10.0.10)  0.720 ms  0.670 ms  0.690 ms</pre>
<p>Each line is a hop; three times show three probes. A line of <code>* * *</code> means that hop did not answer (many routers rate-limit or drop probes), which does not always mean a break. The <code>-n</code> option skips reverse DNS lookups and makes the output faster. Where the trace <b>stops</b> shows where to look next.</p>

<h3>Reference commands (not run in the simulator)</h3>
<pre class="code"><span class="c"># choose the source interface or packet size</span>
ping -c 4 -I eth0 10.10.0.10
ping -c 2 -M do -s 1472 10.10.0.10   <span class="c"># test the largest packet without fragmenting</span>
<span class="c"># continuous path quality, if the mtr package is installed</span>
mtr -n 10.10.0.10</pre>
<p>The simulator answers <code>-I</code> and <code>-s</code> like a plain ping; on a real server they change the source and the size.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "syslog02 cannot reach the NMS." You ping the gateway: replies, so the local link is good. You ping 10.10.0.10: <code>Network is unreachable</code>, so the server has no route. After adding the default route, the ping answers with TTL 63 and <code>tracepath</code> shows two hops. You attach those two outputs to the ticket as proof.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating a failed ping as proof that the host is down. Many servers and firewalls drop ICMP on purpose. Confirm with a TCP test (<code>nc -zv</code>, Chapter 7) before you declare an outage.</p></div>
<div class="exam"><p><b>Exam trap.</b> The TTL in the reply is not the hop count. It is the starting value minus the number of routers. Common starting values are 64 (Linux), 128 (Windows) and 255 (network devices).</p></div>

<div class="scn"><h4>The "down" server that was only hiding</h4><p>A monitoring system raised an alarm because a database host stopped answering ping. The on-call engineer almost restarted the server. First he ran <code>nc -zv</code> to the database port: it succeeded. A security change had started dropping ICMP at the firewall. Ping was blocked but the service was fine.</p><p><b>Lesson:</b> test the thing users actually use, the TCP port, as well as ping.</p></div>

<div class="iv"><p class="q">"What is the difference between traceroute and tracepath, and how does a trace help you?"</p><p>Both show the hop-by-hop path by raising the TTL one at a time. <code>tracepath</code> ships with Ubuntu, needs no root and also reports path MTU; <code>traceroute</code> is the classic tool and needs installing. The point where replies stop shows which hop or link to investigate, though silent hops (<code>* * *</code>) can just be rate limiting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use <code>ping -c N</code>; Linux ping never stops on its own.</li>
<li>"Network is unreachable" is local; "Destination Host Unreachable" names who gave up in the From field.</li>
<li>TTL minus the start value tells you roughly how many routers were crossed.</li>
<li><code>tracepath</code> is built in; <code>traceroute</code> needs <code>apt install traceroute</code>.</li>
<li>A failed ping is not proof of an outage; confirm with a TCP port test.</li>
</ul></div>
`,hi:`
<p>Server ke paas address, route aur DNS aa jaaye to aap raaste ko test karte ho. Do tools lagbhag saara kaam karte hain: <b>ping</b> poochta hai "tum wahan ho aur kitni tez?", aur <b>tracepath</b> ya <b>traceroute</b> poochte hain "raaste mein kaunse routers hain?". Dono aap routers se jaante ho. Linux mein kuch fark seekhne layak hain.</p>

<h3>Linux par ping chalta hi rehta hai</h3>
<p>Cisco IOS paanch ping bhejkar ruk jaata hai. Linux <code>ping</code> Ctrl+C dabane tak chalta rehta hai. Scripts aur tickets mein hamesha <code>-c COUNT</code> se limit lagao:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ping -c 3 10.30.0.1</span>
PING 10.30.0.1 (10.30.0.1) 56(84) bytes of data.
64 bytes from 10.30.0.1: icmp_seq=1 <span class="hl">ttl=255</span> time=0.50 ms
64 bytes from 10.30.0.1: icmp_seq=2 ttl=255 time=0.60 ms
64 bytes from 10.30.0.1: icmp_seq=3 ttl=255 time=0.70 ms

--- 10.30.0.1 ping statistics ---
3 packets transmitted, 3 received, <span class="hl">0% packet loss</span>, time 2006ms
rtt min/avg/max/mdev = 0.500/0.600/0.700/0.100 ms</pre>
<p>Aise padho: <code>56(84) bytes</code> data size (56) aur headers ke saath poora packet (84) hai. <code>icmp_seq</code> replies ko number deta hai, isliye gap matlab packet loss. <code>time</code> millisecond mein round-trip time hai. <b>ttl</b> reply mein bacha time-to-live hai. Raaste ka har router 1 ghatata hai, isliye TTL doori ka quick hint hai. Do hop door NMS ka reply dekho:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 3 10.10.0.10
64 bytes from 10.10.0.10: icmp_seq=1 <span class="hl">ttl=63</span> time=0.50 ms</pre>
<p>Router ne TTL 255 (uski default start value) se jawab diya jabki uske peeche wale server ne 63 se, jo 64 minus ek router hop hai. Aakhri block, <code>0% packet loss</code> aur <code>rtt</code> line, woh summary hai jo aap ticket mein quote karte ho.</p>

<h3>Teen failure messages aur unka matlab</h3>
<table class="cmp"><tr><th>Message</th><th>Kaun bolta hai</th><th>Aam wajah</th></tr>
<tr><td><code>ping: connect: Network is unreachable</code></td><td>Aapka apna kernel</td><td>Route nahi (default gateway missing)</td></tr>
<tr><td><code>From 10.30.0.10 ... Destination Host Unreachable</code></td><td>"From" field wala device</td><td>ARP ka jawab nahi, ya router ke paas route nahi</td></tr>
<tr><td>Koi reply nahi, 100% loss, koi message nahi</td><td>Koi nahi</td><td>Firewall drop, device down, ya replies kho gaye</td></tr>
<tr><td><code>ping: NAME: Temporary failure in name resolution</code></td><td>Resolver</td><td>DNS problem (Chapter 5)</td></tr>
</table>
<p>Doosra wala simulator se capture kiya, aise address ke liye jiska koi malik nahi:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 2 10.10.0.99
PING 10.10.0.99 (10.10.0.99) 56(84) bytes of data.
<span class="hl">From 10.30.0.10 icmp_seq=1 Destination Host Unreachable</span>
From 10.30.0.10 icmp_seq=2 Destination Host Unreachable

--- 10.10.0.99 ping statistics ---
2 packets transmitted, 0 received, +2 errors, 100% packet loss, time 1003ms</pre>
<p><code>From</code> address batata hai <b>kisne haar maani</b>. Yahan woh server khud hai (10.30.0.10): use woh host nahi mila, isliye usne khud failure report kiya. Agar <code>From</code> gateway ka address hota, to gateway bata raha hota ki uske paas aage ka raasta nahi. Yeh field hamesha padho.</p>

<h3>Raasta dekhna: tracepath aur traceroute</h3>
<p><code>tracepath</code> Ubuntu par default install hai aur administrator rights nahi maangta. Har hop delay ke saath dikhata hai:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">tracepath 10.10.0.10</span>
 1?: [LOCALHOST]                      pmtu 1500
 1:   10.30.0.1                        0.510ms
 2:   10.10.0.10                       0.720ms reached
     Resume: pmtu 1500 hops 2 back 2</pre>
<p>Hop 1 gateway R1 hai, hop 2 destination khud, <code>reached</code> ke saath. <code>pmtu 1500</code> path MTU hai, end-to-end fit hone wala sabse bada packet, jab "bade packets fail hote hain" tab kaam aata hai. <code>traceroute</code> classic tool hai; default install nahi hota, isliye <code>sudo apt install traceroute</code> se jodte hain (services module mein dikhaya hai):</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">traceroute -n 10.10.0.10</span>
traceroute to 10.10.0.10 (10.10.0.10), 30 hops max, 60 byte packets
 1  10.30.0.1 (10.30.0.1)  0.510 ms  0.470 ms  0.490 ms
 2  10.10.0.10 (10.10.0.10)  0.720 ms  0.670 ms  0.690 ms</pre>
<p>Har line ek hop hai; teen baar matlab teen probes. <code>* * *</code> wali line ka matlab us hop ne jawab nahi diya (kai routers probes rate-limit ya drop karte hain), jo hamesha break nahi hota. <code>-n</code> option reverse DNS lookups skip karta hai aur output tez karta hai. Trace jahan <b>ruk</b> jaaye wahin se agla dekhna hota hai.</p>

<h3>Reference commands (simulator mein nahi chalte)</h3>
<pre class="code"><span class="c"># source interface ya packet size chuno</span>
ping -c 4 -I eth0 10.10.0.10
ping -c 2 -M do -s 1472 10.10.0.10   <span class="c"># bina fragment kiye sabse bada packet test karo</span>
<span class="c"># continuous path quality, agar mtr package install ho</span>
mtr -n 10.10.0.10</pre>
<p>Simulator <code>-I</code> aur <code>-s</code> ko plain ping ki tarah jawab deta hai; asli server par woh source aur size badalte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "syslog02 NMS tak nahi pahunch raha." Aap gateway ping karte ho: replies, to local link theek hai. Aap 10.10.0.10 ping karte ho: <code>Network is unreachable</code>, to server ke paas route nahi. Default route jodne ke baad ping TTL 63 se jawab deta hai aur <code>tracepath</code> do hops dikhata hai. Yeh dono outputs aap ticket mein saboot ke roop mein lagate ho.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Failed ping ko host down ka saboot samajhna. Kai servers aur firewalls ICMP jaan-boojh kar drop karte hain. Outage declare karne se pehle TCP test (<code>nc -zv</code>, Chapter 7) se confirm karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Reply ka TTL hop count nahi hai. Woh start value minus routers ki ginti hai. Aam start values 64 (Linux), 128 (Windows) aur 255 (network devices) hain.</p></div>

<div class="scn"><h4>Woh "down" server jo sirf chhupa tha</h4><p>Monitoring system ne alarm uthaya kyunki ek database host ne ping ka jawab dena band kar diya. On-call engineer server restart karne hi wala tha. Pehle usne database port par <code>nc -zv</code> chalaya: succeed. Ek security change ne firewall par ICMP drop karna shuru kar diya tha. Ping blocked tha par service theek thi.</p><p><b>Lesson:</b> woh cheez test karo jo users asal mein use karte hain, TCP port, ping ke saath.</p></div>

<div class="iv"><p class="q">"traceroute aur tracepath mein kya difference hai, aur trace aapki kaise madad karta hai?"</p><p>Dono TTL ek-ek badha kar hop-by-hop path dikhate hain. <code>tracepath</code> Ubuntu ke saath aata hai, root nahi maangta aur path MTU bhi batata hai; <code>traceroute</code> classic tool hai aur install karna padta hai. Jahan replies ruk jaayein wahi hop ya link investigate karna hai, par silent hops (<code>* * *</code>) sirf rate limiting bhi ho sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ping -c N</code> use karo; Linux ping apne aap nahi rukta.</li>
<li>"Network is unreachable" local hai; "Destination Host Unreachable" mein From field batata hai kisne haar maani.</li>
<li>TTL aur start value ka fark batata hai kitne routers cross hue.</li>
<li><code>tracepath</code> built-in hai; <code>traceroute</code> ke liye <code>apt install traceroute</code>.</li>
<li>Failed ping outage ka saboot nahi; TCP port test se confirm karo.</li>
</ul></div>
`}};export{e as default};