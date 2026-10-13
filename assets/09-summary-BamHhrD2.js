var e={id:`summary`,h:{en:`Summary and exam checklist: Linux networking on one page`,hi:`Summary aur exam checklist: Linux networking ek page par`},body:{en:`
<p>You started with a server that had no address and finished by fixing two real tickets. This chapter collects everything on one page: what you can now do, the words to know, the facts that interviewers and exams repeat, and a cheat sheet to keep beside you in the first weeks on the job.</p>

<h3>Can-do checklist</h3>
<p>Tick each line only if you could do it on a server you have never seen, without notes.</p>
<ul>
<li>Show the interfaces, their state and their addresses with <code>ip link</code> and <code>ip -br a</code>, and read UP, LOWER_UP, NO-CARRIER and DOWN.</li>
<li>Add and remove an address and a default route at runtime with <code>sudo ip addr add</code> and <code>sudo ip route add default via</code>.</li>
<li>Explain "Network is unreachable" and prove it with <code>ip route get</code>.</li>
<li>Read the ARP (neighbour) table with <code>ip neigh</code>.</li>
<li>Read a netplan YAML file, spot a wrong interface name, fix it with <code>sed</code>, and apply it with <code>netplan try</code> or <code>netplan apply</code>.</li>
<li>Explain the resolver order (<code>/etc/hosts</code>, then DNS), and use <code>getent</code>, <code>dig</code>, <code>nslookup</code>.</li>
<li>Ping with <code>-c</code>, read TTL and loss, and trace the path with <code>tracepath</code> or <code>traceroute</code>.</li>
<li>List listeners with <code>ss -tln</code>, <code>ss -uln</code>, <code>sudo ss -tlnp</code>; test a port with <code>nc -zv</code>.</li>
<li>Run the seven-rung ladder and say what each failure points to.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Interface</dt><dd>A network card, physical or virtual, such as eth0 or ens160.</dd>
<dt>Loopback (lo)</dt><dd>The internal interface 127.0.0.1 used by the server to talk to itself.</dd>
<dt>CIDR / prefix</dt><dd>The /24 style mask length after an address.</dd>
<dt>Default route</dt><dd>The route for "everything else", pointing at the gateway.</dd>
<dt>Gateway</dt><dd>The router that carries traffic to other subnets.</dd>
<dt>Neighbour (ARP) table</dt><dd>IP-to-MAC mappings learned on the local subnet.</dd>
<dt>netplan</dt><dd>Ubuntu's YAML network configuration in /etc/netplan/.</dd>
<dt>Resolver</dt><dd>The part of Linux that turns names into addresses.</dd>
<dt>Search domain</dt><dd>A suffix appended to short names, such as nk.lab.</dd>
<dt>Port / socket</dt><dd>A numbered door on a server where a service listens.</dd>
<dt>TTL</dt><dd>Time-to-live; reduced by one at each router.</dd>
<dt>sudo</dt><dd>Run one command with administrator rights.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Replacement for ifconfig / route / arp / netstat</td><td><code>ip addr</code> / <code>ip route</code> / <code>ip neigh</code> / <code>ss</code></td></tr>
<tr><td>Does <code>ip addr add</code> survive a reboot?</td><td>No. Use netplan.</td></tr>
<tr><td>Where is permanent Ubuntu network config?</td><td><code>/etc/netplan/*.yaml</code></td></tr>
<tr><td>Safe remote change</td><td><code>sudo netplan try</code> (auto-rollback)</td></tr>
<tr><td>YAML indentation</td><td>Spaces only, never tabs</td></tr>
<tr><td>Resolver order</td><td>/etc/hosts, then DNS</td></tr>
<tr><td>Package that gives dig and nslookup</td><td>dnsutils</td></tr>
<tr><td>DNS port</td><td>53 (UDP, TCP for large answers)</td></tr>
<tr><td>"Network is unreachable"</td><td>No route on the sending host</td></tr>
<tr><td>"Connection refused" versus timeout</td><td>Reply with no listener versus no reply at all</td></tr>
<tr><td>Port shown as 0.0.0.0:80 versus 127.0.0.1:80</td><td>All addresses versus local only</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># look</span>
ip link                      <span class="c"># interfaces, state, MAC</span>
ip -br a                     <span class="c"># one line per interface with addresses</span>
ip route                     <span class="c"># routing table</span>
ip route get 10.10.0.10      <span class="c"># route the kernel will use</span>
ip neigh                     <span class="c"># ARP table</span>
<span class="c"># change (temporary)</span>
sudo ip addr add 10.30.0.10/24 dev eth0
sudo ip link set eth0 up
sudo ip route add default via 10.30.0.1
<span class="c"># change (permanent)</span>
sudo cat /etc/netplan/50-cloud-init.yaml
sudo netplan try             <span class="c"># or: sudo netplan apply</span>
<span class="c"># names</span>
cat /etc/resolv.conf
getent hosts nms.nk.lab
dig +short nms.nk.lab        <span class="c"># needs dnsutils</span>
nslookup nms.nk.lab 10.30.0.1
<span class="c"># test</span>
ping -c 3 10.10.0.10
tracepath 10.10.0.10
ss -tln                      <span class="c"># add p with sudo for programs, u for UDP</span>
nc -zv 10.10.0.10 22</pre>

<h3>Reference commands (not run in the simulator)</h3>
<pre class="code">sudo netplan generate            <span class="c"># validate the YAML without applying</span>
resolvectl query nms.nk.lab      <span class="c"># ask the local resolver and show which server answered</span>
ip -s link show eth0             <span class="c"># error and drop counters on the interface</span>
mtr -n 10.10.0.10                <span class="c"># continuous trace</span></pre>

<div class="eg"><p><b>Worked example.</b> Final self-test. A server shows <code>eth0 UP</code> with 10.30.0.10/24, a default route, a successful gateway ping, a failing remote ping that says "Destination Host Unreachable" from the gateway's address, and a netplan file that is correct. Which rung failed and who do you call? Rung 5: the network beyond the gateway. You attach the trace and call the network team; the server needs no change.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Memorising commands without the method. The commands change between distributions; the ladder does not.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often put two true-sounding answers side by side: "ip addr add" versus "netplan apply". If the question says "permanent" or "after reboot", the answer is the file.</p></div>

<div class="scn"><h4>First week on the night shift</h4><p>A new engineer on night shift got a page that a monitoring server could not reach a new switch. She did not know the topology, but she knew the ladder. In ten minutes she found a correct address, a missing return route on the router, and wrote exactly that in the ticket. The day team fixed the route in one line.</p><p><b>Lesson:</b> a method lets you contribute useful evidence even when you do not know the network yet.</p></div>

<div class="iv"><p class="q">"Describe the Linux commands you use daily as a network engineer."</p><p>I use <code>ip -br a</code>, <code>ip route get</code> and <code>ip neigh</code> for state, <code>ping -c</code> and <code>tracepath</code> for reachability, <code>getent</code> and <code>dig</code> for names, and <code>ss -tlnp</code> with <code>nc -zv</code> for services. For permanent changes I edit netplan and use <code>netplan try</code> when remote.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the router-to-Linux command map: ip addr, ip route, ip neigh, ss.</li>
<li>Temporary (ip) versus permanent (netplan) is the most repeated theme.</li>
<li>Three signature messages: Network is unreachable, Temporary failure in name resolution, Connection refused.</li>
<li>Use the seven-rung ladder for every ticket.</li>
<li>Next modules: SSH keys and jump hosts, then services and logs with systemd.</li>
</ul></div>
`,hi:`
<p>Aapne bina address wale server se shuru kiya aur do asli tickets fix karke khatam kiya. Yeh chapter sab kuch ek page par jama karta hai: ab aap kya kar sakte ho, jaanne wale words, woh facts jo interviewers aur exams dohrate hain, aur ek cheat sheet jo job ke pehle hafton mein aapke saath rahe.</p>

<h3>Can-do checklist</h3>
<p>Har line tabhi tick karo jab aap use aise server par bina notes ke kar sako jo aapne kabhi dekha nahi.</p>
<ul>
<li><code>ip link</code> aur <code>ip -br a</code> se interfaces, unki state aur addresses dikhana, aur UP, LOWER_UP, NO-CARRIER aur DOWN padhna.</li>
<li><code>sudo ip addr add</code> aur <code>sudo ip route add default via</code> se runtime par address aur default route jodna aur hatana.</li>
<li>"Network is unreachable" samjhana aur <code>ip route get</code> se sabit karna.</li>
<li><code>ip neigh</code> se ARP (neighbour) table padhna.</li>
<li>Netplan YAML file padhna, galat interface name pakadna, <code>sed</code> se fix karna, aur <code>netplan try</code> ya <code>netplan apply</code> se apply karna.</li>
<li>Resolver order (<code>/etc/hosts</code>, phir DNS) samjhana, aur <code>getent</code>, <code>dig</code>, <code>nslookup</code> use karna.</li>
<li><code>-c</code> ke saath ping karna, TTL aur loss padhna, aur <code>tracepath</code> ya <code>traceroute</code> se path trace karna.</li>
<li><code>ss -tln</code>, <code>ss -uln</code>, <code>sudo ss -tlnp</code> se listeners dikhana; <code>nc -zv</code> se port test karna.</li>
<li>Saat-rung seedhi chalana aur batana har failure kis taraf ishara karta hai.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Interface</dt><dd>Network card, physical ya virtual, jaise eth0 ya ens160.</dd>
<dt>Loopback (lo)</dt><dd>Internal interface 127.0.0.1 jise server khud se baat karne ke liye use karta hai.</dd>
<dt>CIDR / prefix</dt><dd>Address ke baad /24 jaisi mask length.</dd>
<dt>Default route</dt><dd>"Baaki sab kuch" ka route, gateway ki taraf point karta hai.</dd>
<dt>Gateway</dt><dd>Router jo traffic ko doosre subnets tak le jaata hai.</dd>
<dt>Neighbour (ARP) table</dt><dd>Local subnet par seekhe IP-to-MAC mappings.</dd>
<dt>netplan</dt><dd>/etc/netplan/ mein Ubuntu ki YAML network configuration.</dd>
<dt>Resolver</dt><dd>Linux ka woh hissa jo names ko addresses mein badalta hai.</dd>
<dt>Search domain</dt><dd>Chhote names ke peeche lagne wala suffix, jaise nk.lab.</dd>
<dt>Port / socket</dt><dd>Server par numbered darwaza jahan service sunti hai.</dd>
<dt>TTL</dt><dd>Time-to-live; har router par ek kam hota hai.</dd>
<dt>sudo</dt><dd>Ek command administrator rights ke saath chalana.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>ifconfig / route / arp / netstat ki jagah</td><td><code>ip addr</code> / <code>ip route</code> / <code>ip neigh</code> / <code>ss</code></td></tr>
<tr><td>Kya <code>ip addr add</code> reboot ke baad rehta hai?</td><td>Nahi. Netplan use karo.</td></tr>
<tr><td>Ubuntu ka permanent network config kahan?</td><td><code>/etc/netplan/*.yaml</code></td></tr>
<tr><td>Safe remote change</td><td><code>sudo netplan try</code> (auto-rollback)</td></tr>
<tr><td>YAML indentation</td><td>Sirf spaces, kabhi tabs nahi</td></tr>
<tr><td>Resolver order</td><td>/etc/hosts, phir DNS</td></tr>
<tr><td>dig aur nslookup dene wala package</td><td>dnsutils</td></tr>
<tr><td>DNS port</td><td>53 (UDP, bade answers ke liye TCP)</td></tr>
<tr><td>"Network is unreachable"</td><td>Sending host par route nahi</td></tr>
<tr><td>"Connection refused" versus timeout</td><td>Reply par listener nahi versus koi reply hi nahi</td></tr>
<tr><td>Port 0.0.0.0:80 versus 127.0.0.1:80</td><td>Saare addresses versus sirf local</td></tr>
</table>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c"># dekho</span>
ip link                      <span class="c"># interfaces, state, MAC</span>
ip -br a                     <span class="c"># har interface ki ek line addresses ke saath</span>
ip route                     <span class="c"># routing table</span>
ip route get 10.10.0.10      <span class="c"># kernel jo route use karega</span>
ip neigh                     <span class="c"># ARP table</span>
<span class="c"># badlo (temporary)</span>
sudo ip addr add 10.30.0.10/24 dev eth0
sudo ip link set eth0 up
sudo ip route add default via 10.30.0.1
<span class="c"># badlo (permanent)</span>
sudo cat /etc/netplan/50-cloud-init.yaml
sudo netplan try             <span class="c"># ya: sudo netplan apply</span>
<span class="c"># names</span>
cat /etc/resolv.conf
getent hosts nms.nk.lab
dig +short nms.nk.lab        <span class="c"># dnsutils chahiye</span>
nslookup nms.nk.lab 10.30.0.1
<span class="c"># test</span>
ping -c 3 10.10.0.10
tracepath 10.10.0.10
ss -tln                      <span class="c"># programs ke liye sudo ke saath p, UDP ke liye u</span>
nc -zv 10.10.0.10 22</pre>

<h3>Reference commands (simulator mein nahi chalte)</h3>
<pre class="code">sudo netplan generate            <span class="c"># bina apply kiye YAML validate karo</span>
resolvectl query nms.nk.lab      <span class="c"># local resolver se poocho aur dekho kis server ne jawab diya</span>
ip -s link show eth0             <span class="c"># interface par error aur drop counters</span>
mtr -n 10.10.0.10                <span class="c"># continuous trace</span></pre>

<div class="eg"><p><b>Worked example.</b> Final self-test. Server <code>eth0 UP</code> 10.30.0.10/24 ke saath dikhata hai, default route hai, gateway ping successful hai, remote ping gateway ke address se "Destination Host Unreachable" kehkar fail hota hai, aur netplan file sahi hai. Kaunsa rung fail hua aur kise call karoge? Rung 5: gateway ke aage ka network. Aap trace attach karke network team ko call karte ho; server mein change ki zaroorat nahi.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Method ke bina commands ratna. Commands distributions ke beech badalte hain; seedhi nahi badalti.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions aksar do sach jaise lagne wale answers saath rakhte hain: "ip addr add" versus "netplan apply". Question mein "permanent" ya "after reboot" likha ho to answer file hai.</p></div>

<div class="scn"><h4>Night shift ka pehla hafta</h4><p>Night shift ki nayi engineer ko page aaya ki ek monitoring server naye switch tak nahi pahunch pa raha. Use topology nahi pata thi, par seedhi pata thi. Das minute mein usne sahi address, router par missing return route paya, aur ticket mein bilkul wahi likha. Day team ne route ek line mein theek kar diya.</p><p><b>Lesson:</b> method se aap tab bhi kaam ka saboot de sakte ho jab network abhi jaante nahi.</p></div>

<div class="iv"><p class="q">"Network engineer ke roop mein roz kaunse Linux commands use karte ho?"</p><p>State ke liye <code>ip -br a</code>, <code>ip route get</code> aur <code>ip neigh</code>, reachability ke liye <code>ping -c</code> aur <code>tracepath</code>, names ke liye <code>getent</code> aur <code>dig</code>, aur services ke liye <code>ss -tlnp</code> ke saath <code>nc -zv</code>. Permanent changes ke liye netplan edit karta hoon aur remote hone par <code>netplan try</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router-to-Linux command map jaano: ip addr, ip route, ip neigh, ss.</li>
<li>Temporary (ip) versus permanent (netplan) sabse dohraya jaane wala theme hai.</li>
<li>Teen signature messages: Network is unreachable, Temporary failure in name resolution, Connection refused.</li>
<li>Har ticket ke liye saat-rung seedhi use karo.</li>
<li>Agle modules: SSH keys aur jump hosts, phir systemd se services aur logs.</li>
</ul></div>
`}};export{e as default};