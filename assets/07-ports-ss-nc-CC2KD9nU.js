var e={id:`ports-ss-nc`,h:{en:`Is the service reachable? Listening ports with ss and port tests with nc`,hi:`Kya service reachable hai? ss se listening ports aur nc se port tests`},body:{en:`
<p>A ping proves two machines can exchange ICMP. Users do not use ICMP; they use <b>services</b>: SSH, a web page, syslog. Each service waits on a numbered door called a <b>port</b>. A server that has the right address and route can still be useless if nothing is <b>listening</b> on the port, or if something blocks the way to it. Two commands split that question in half.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ss runs on the server and shows what listens; nc runs on the client and tests if it can connect">
<rect x="20" y="50" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="14">Client SRV01</text><text x="105" y="102" text-anchor="middle" class="svg-accent" font-size="13">nc -zv NMS 80</text>
<rect x="450" y="50" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="14">Server NMS01</text><text x="535" y="102" text-anchor="middle" class="svg-accent" font-size="13">ss -tln</text>
<line x1="190" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">network path (routes, firewalls)</text>
<text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">can I reach the port?</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="12">is anything listening?</text>
</svg><p class="cap">nc tests from the client side; ss inspects the server side.</p></div>

<h3>On the server: ss shows what is listening</h3>
<p><code>ss</code> (socket statistics) replaces <code>netstat</code>. The flags you need spell a memorable phrase: <code>-t</code> TCP, <code>-l</code> listening, <code>-n</code> numbers instead of names. Add <code>-p</code> to see which program owns the port; seeing other users' programs needs <code>sudo</code>.</p>
<pre class="out">netadmin@nms01:~$ <span class="hl">sudo ss -tlnp</span>
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
tcp   LISTEN 0      4096     127.0.0.53%lo:53        0.0.0.0:*    users:(("systemd-resolve",pid=402,fd=3))
tcp   LISTEN 0      4096           <span class="hl">0.0.0.0:22</span>        0.0.0.0:*    users:(("sshd",pid=701,fd=3))
tcp   LISTEN 0      4096           <span class="hl">0.0.0.0:80</span>        0.0.0.0:*    users:(("nginx",pid=700,fd=3))</pre>
<p>Read the <code>Local Address:Port</code> column. <code>0.0.0.0:22</code> means "listening on port 22 on every address of this server". <code>127.0.0.53%lo:53</code> means "only on the loopback", so only the server itself can use that DNS stub; other machines cannot. A service bound to <code>127.0.0.1</code> by mistake is a classic reason why it works locally but not from the network. The <code>Process</code> column names the program: here <code>sshd</code> owns port 22 and <code>nginx</code> owns port 80. <code>State LISTEN</code> means waiting for connections.</p>
<p>For UDP, use <code>-u</code> instead of <code>-t</code>. Many network services are UDP: DNS (53), syslog (514), TFTP (69), SNMP (161).</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ss -uln</span>
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
udp   UNCONN 0      0        127.0.0.53%lo:53        0.0.0.0:*</pre>
<p>UDP has no connection, so the state says <code>UNCONN</code>, not LISTEN. You can combine flags: <code>ss -tuln</code> shows TCP and UDP together.</p>

<h3>From the client: nc tests the port</h3>
<p><code>nc</code> (netcat) opens a TCP connection and tells you whether it worked. <code>-z</code> means "just check, send nothing" and <code>-v</code> means "be verbose". This is the best everyday replacement for a telnet test:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">nc -zv 10.10.0.10 22</span>
Connection to 10.10.0.10 22 port [tcp/ssh] succeeded!

netadmin@syslog02:~$ <span class="hl">nc -zv 10.10.0.10 8080</span>
nc: connect to 10.10.0.10 port 8080 (tcp) failed: <span class="hl">Connection refused</span>

netadmin@syslog02:~$ <span class="hl">nc -zv -w 2 10.10.0.99 80</span>
nc: connect to 10.10.0.99 port 80 (tcp) timed out: Operation now in progress</pre>
<p><code>-w 2</code> gives up after two seconds. The three results tell very different stories:</p>
<table class="cmp"><tr><th>Result</th><th>What happened</th><th>Look at</th></tr>
<tr><td><b>succeeded</b></td><td>Handshake completed</td><td>The network and the service are fine</td></tr>
<tr><td><b>Connection refused</b></td><td>The host answered with a reset: nothing listens on that port</td><td>The service: stopped, wrong port, bound to loopback</td></tr>
<tr><td><b>timed out</b></td><td>No answer at all</td><td>The path: firewall dropping, routing, host down</td></tr>
</table>
<p>"Refused" is actually good news for the network: your packet got there and the host replied. A timeout is silence, and silence is what firewalls produce when they drop packets.</p>

<h3>The two-command method</h3>
<ol>
<li>On the client: <code>nc -zv SERVER PORT</code>. Note the result.</li>
<li>On the server: <code>sudo ss -tlnp</code>. Is the port there, on <code>0.0.0.0</code> or the right address, owned by the right program?</li>
</ol>
<p>Refused plus an empty line in <code>ss</code> means the service is not running. Succeeded in <code>ss</code> but timed out in <code>nc</code> means something between them is dropping traffic.</p>

<div class="eg"><p><b>Worked example.</b> Ticket NK-2318 asks whether the NMS web UI on port 80 is reachable and whether anything answers on 8080. From SRV01 you test both ports. Port 80 succeeds; port 8080 says <code>Connection refused</code>. On NMS01 <code>sudo ss -tlnp</code> shows nginx on <code>0.0.0.0:80</code> and nothing on 8080. Answer for the ticket: the UI is up on 80, and nothing is meant to listen on 8080.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Running <code>ss -tln</code> on the <i>client</i> and concluding the server is fine. <code>ss</code> only knows about the machine it runs on. Use nc (or curl) from the client to prove reachability.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember which message means which. Refused = reached the host, no listener (or a firewall that actively rejects). Timeout = no response (firewall drop or no route). "Network is unreachable" = no route on your own machine.</p></div>

<div class="scn"><h4>Works on the server, not from outside</h4><p>A new monitoring tool was reachable at <code>curl localhost</code> but not from the NOC. The engineer ran <code>ss -tln</code> and saw the port listening on <code>127.0.0.1:9100</code> instead of <code>0.0.0.0:9100</code>. The service was configured to bind to loopback only. One line in its config and a service restart (module 6) opened it to the network.</p><p><b>Lesson:</b> always read the address in front of the port number, not only the port.</p></div>

<div class="iv"><p class="q">"A user cannot connect to a service on a server. How do you separate network from application?"</p><p>From the client I run <code>nc -zv host port</code>. "Refused" means the packet arrived and no process listens, an application issue. A timeout points to the network or a firewall. On the server I run <code>sudo ss -tlnp</code> to confirm the process is listening on the right address and port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ss -tln</code> shows TCP listeners; add <code>-p</code> with sudo for the program; <code>-u</code> for UDP.</li>
<li><code>0.0.0.0:PORT</code> listens on all addresses; <code>127.0.0.1:PORT</code> only locally.</li>
<li><code>nc -zv host port</code> tests a TCP port from the client.</li>
<li>Refused means a reply came back (no listener); timed out means silence (drop or no route).</li>
<li>Use ss on the server and nc on the client; together they locate the fault.</li>
</ul></div>
`,hi:`
<p>Ping sabit karta hai ki do machines ICMP exchange kar sakti hain. Users ICMP use nahi karte; woh <b>services</b> use karte hain: SSH, web page, syslog. Har service ek numbered darwaze par intezaar karti hai jise <b>port</b> kehte hain. Sahi address aur route wala server bhi bekaar ho sakta hai agar port par koi <b>sun</b> nahi raha, ya raaste mein kuch rok raha hai. Do commands is sawaal ko aadha-aadha baant dete hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ss server par chalta hai aur dikhata hai kaun sun raha hai; nc client par chalta hai aur test karta hai connect ho sakta hai ya nahi">
<rect x="20" y="50" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="14">Client SRV01</text><text x="105" y="102" text-anchor="middle" class="svg-accent" font-size="13">nc -zv NMS 80</text>
<rect x="450" y="50" width="170" height="80" rx="10" fill="#ddd6fe"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="14">Server NMS01</text><text x="535" y="102" text-anchor="middle" class="svg-accent" font-size="13">ss -tln</text>
<line x1="190" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">network path (routes, firewalls)</text>
<text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">kya main port tak pahunch sakta hoon?</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="12">kya koi sun raha hai?</text>
</svg><p class="cap">nc client side se test karta hai; ss server side ko inspect karta hai.</p></div>

<h3>Server par: ss dikhata hai kaun sun raha hai</h3>
<p><code>ss</code> (socket statistics) <code>netstat</code> ki jagah leta hai. Zaroori flags ek yaad rehne wala phrase banate hain: <code>-t</code> TCP, <code>-l</code> listening, <code>-n</code> names ki jagah numbers. Port kis program ka hai yeh dekhne ke liye <code>-p</code> jodo; doosre users ke programs dekhne ke liye <code>sudo</code> chahiye.</p>
<pre class="out">netadmin@nms01:~$ <span class="hl">sudo ss -tlnp</span>
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
tcp   LISTEN 0      4096     127.0.0.53%lo:53        0.0.0.0:*    users:(("systemd-resolve",pid=402,fd=3))
tcp   LISTEN 0      4096           <span class="hl">0.0.0.0:22</span>        0.0.0.0:*    users:(("sshd",pid=701,fd=3))
tcp   LISTEN 0      4096           <span class="hl">0.0.0.0:80</span>        0.0.0.0:*    users:(("nginx",pid=700,fd=3))</pre>
<p><code>Local Address:Port</code> column padho. <code>0.0.0.0:22</code> matlab "is server ke har address par port 22 par sun raha hai". <code>127.0.0.53%lo:53</code> matlab "sirf loopback par", to sirf server khud woh DNS stub use kar sakta hai; doosri machines nahi. Galti se <code>127.0.0.1</code> par bind hui service ka classic natija: local par chalti hai par network se nahi. <code>Process</code> column program ka naam batata hai: yahan <code>sshd</code> port 22 ka malik hai aur <code>nginx</code> port 80 ka. <code>State LISTEN</code> matlab connections ka intezaar.</p>
<p>UDP ke liye <code>-t</code> ki jagah <code>-u</code>. Kai network services UDP hain: DNS (53), syslog (514), TFTP (69), SNMP (161).</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ss -uln</span>
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
udp   UNCONN 0      0        127.0.0.53%lo:53        0.0.0.0:*</pre>
<p>UDP mein connection nahi hota, isliye state <code>UNCONN</code> kehti hai, LISTEN nahi. Flags mila sakte ho: <code>ss -tuln</code> TCP aur UDP ek saath dikhata hai.</p>

<h3>Client se: nc port test karta hai</h3>
<p><code>nc</code> (netcat) TCP connection kholta hai aur batata hai kaam kiya ya nahi. <code>-z</code> matlab "sirf check karo, kuch mat bhejo" aur <code>-v</code> matlab "verbose". Telnet test ka yeh roz ka behtareen replacement hai:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">nc -zv 10.10.0.10 22</span>
Connection to 10.10.0.10 22 port [tcp/ssh] succeeded!

netadmin@syslog02:~$ <span class="hl">nc -zv 10.10.0.10 8080</span>
nc: connect to 10.10.0.10 port 8080 (tcp) failed: <span class="hl">Connection refused</span>

netadmin@syslog02:~$ <span class="hl">nc -zv -w 2 10.10.0.99 80</span>
nc: connect to 10.10.0.99 port 80 (tcp) timed out: Operation now in progress</pre>
<p><code>-w 2</code> do second baad haar maan leta hai. Teen results bahut alag kahani batate hain:</p>
<table class="cmp"><tr><th>Result</th><th>Kya hua</th><th>Kahan dekho</th></tr>
<tr><td><b>succeeded</b></td><td>Handshake poora hua</td><td>Network aur service dono theek</td></tr>
<tr><td><b>Connection refused</b></td><td>Host ne reset se jawab diya: us port par koi nahi sun raha</td><td>Service: band, galat port, loopback par bound</td></tr>
<tr><td><b>timed out</b></td><td>Koi jawab hi nahi</td><td>Raasta: firewall drop, routing, host down</td></tr>
</table>
<p>"Refused" network ke liye asal mein achhi khabar hai: aapka packet wahan pahuncha aur host ne jawab diya. Timeout khamoshi hai, aur firewalls packets drop karte hain to khamoshi hi paida karte hain.</p>

<h3>Do-command method</h3>
<ol>
<li>Client par: <code>nc -zv SERVER PORT</code>. Result note karo.</li>
<li>Server par: <code>sudo ss -tlnp</code>. Kya port wahan hai, <code>0.0.0.0</code> ya sahi address par, sahi program ka?</li>
</ol>
<p>Refused aur <code>ss</code> mein khaali line matlab service chal nahi rahi. <code>ss</code> mein dikhe par <code>nc</code> mein timed out matlab beech mein kuch traffic drop kar raha hai.</p>

<div class="eg"><p><b>Worked example.</b> Ticket NK-2318 poochta hai ki kya NMS web UI port 80 par reachable hai aur kya 8080 par kuch jawab deta hai. SRV01 se aap dono ports test karte ho. Port 80 succeed; port 8080 <code>Connection refused</code> kehta hai. NMS01 par <code>sudo ss -tlnp</code> nginx ko <code>0.0.0.0:80</code> par dikhata hai aur 8080 par kuch nahi. Ticket ka jawab: UI 80 par up hai, aur 8080 par kuch sunne ke liye bana hi nahi.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> <i>Client</i> par <code>ss -tln</code> chalakar server ko theek maan lena. <code>ss</code> sirf us machine ko jaanta hai jis par chalta hai. Reachability sabit karne ke liye client se nc (ya curl) use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho kaunsa message kya hai. Refused = host tak pahunche, listener nahi (ya firewall jo actively reject karta hai). Timeout = jawab nahi (firewall drop ya route nahi). "Network is unreachable" = aapki apni machine par route nahi.</p></div>

<div class="scn"><h4>Server par chalta hai, bahar se nahi</h4><p>Naya monitoring tool <code>curl localhost</code> par reachable tha par NOC se nahi. Engineer ne <code>ss -tln</code> chalaya aur dekha port <code>0.0.0.0:9100</code> ki jagah <code>127.0.0.1:9100</code> par sun raha hai. Service ko loopback tak hi bind karne ke liye configure kiya gaya tha. Uski config mein ek line aur service restart (module 6) ne use network ke liye khol diya.</p><p><b>Lesson:</b> port number ke aage ka address bhi padho, sirf port nahi.</p></div>

<div class="iv"><p class="q">"User server par service se connect nahi kar pa raha. Network aur application ko kaise alag karoge?"</p><p>Client se main <code>nc -zv host port</code> chalata hoon. "Refused" matlab packet pahuncha aur koi process nahi sun raha, application issue. Timeout network ya firewall ki taraf ishara karta hai. Server par <code>sudo ss -tlnp</code> se confirm karta hoon ki process sahi address aur port par sun raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ss -tln</code> TCP listeners dikhata hai; program ke liye sudo ke saath <code>-p</code>; UDP ke liye <code>-u</code>.</li>
<li><code>0.0.0.0:PORT</code> saare addresses par sunta hai; <code>127.0.0.1:PORT</code> sirf locally.</li>
<li><code>nc -zv host port</code> client se TCP port test karta hai.</li>
<li>Refused matlab reply aaya (listener nahi); timed out matlab khamoshi (drop ya route nahi).</li>
<li>Server par ss aur client par nc; dono milkar fault locate karte hain.</li>
</ul></div>
`}};export{e as default};