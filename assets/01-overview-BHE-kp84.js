var e={id:`overview`,h:{en:`A Linux server is a host on your network: what you will learn and the big picture`,hi:`Linux server aapke network ka ek host hai: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to look at, configure and troubleshoot the network side of a Linux server, using the same thinking you already use on a router: interfaces, addresses, routes, a default gateway, DNS, and "which ports are open". You will use a handful of commands (<code>ip</code>, <code>ping</code>, <code>tracepath</code>, <code>ss</code>, <code>nc</code>, <code>netplan</code>) and, at the end, fix real tickets in the simulator.</p>
<p><b>Prerequisites.</b> You should know what an IP address, a subnet mask and a default gateway are. You do <b>not</b> need to have used Linux before. We explain every command the first time it appears, and we will tell you what each line of output means.</p>

<h3>Analogy: a server is a very busy office worker with one phone line</h3>
<p>Think of a server as an office worker. The worker has a <b>phone</b> (the network interface), a <b>phone number</b> (the IP address), a rule for <b>who to call for anything outside the building</b> (the default gateway), and a <b>phone book</b> (DNS) for turning names into numbers. Customers ring different <b>extensions</b> (ports) to reach different services. When a customer says "I cannot reach the server", one of those five things is broken. This module teaches you to check them in order.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab topology: SRV01 and the core switch SW1 in the server VLAN 10.30.0.0/24, router R1 (DC-GW) in the middle, NMS01 in 10.10.0.0/24">
<rect x="20" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="97" text-anchor="middle" class="svg-ink" font-size="14">SRV01</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10</text>
<rect x="175" y="70" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="230" y="97" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="230" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.2</text>
<rect x="330" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="385" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1 DC-GW</text><text x="385" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.1 / 10.10.0.1</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="97" text-anchor="middle" class="svg-ink" font-size="14">NMS01</text><text x="560" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.10</text>
<line x1="130" y1="100" x2="175" y2="100" stroke="#64748b" stroke-width="2"/><line x1="285" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="230" y="165" text-anchor="middle" class="svg-accent" font-size="12">server VLAN 10.30.0.0/24</text><text x="560" y="165" text-anchor="middle" class="svg-accent" font-size="12">NMS network 10.10.0.0/24</text>
</svg><p class="cap">The module lab: a new server SRV01 must reach NMS01 through the gateway R1.</p></div>

<h3>Router words and their Linux twins</h3>
<p>Good news: you already know the ideas. Only the commands change.</p>
<table class="cmp"><tr><th>On a router</th><th>On Linux</th></tr>
<tr><td>show ip interface brief</td><td><code>ip -br a</code></td></tr>
<tr><td>show ip route</td><td><code>ip route</code></td></tr>
<tr><td>show arp</td><td><code>ip neigh</code></td></tr>
<tr><td>ip address / no shutdown</td><td><code>ip addr add</code> / <code>ip link set eth0 up</code></td></tr>
<tr><td>ip route 0.0.0.0 0.0.0.0 gw</td><td><code>ip route add default via gw</code></td></tr>
<tr><td>startup-config</td><td>netplan files in <code>/etc/netplan/</code></td></tr>
<tr><td>show ip sockets / show control-plane</td><td><code>ss -tln</code></td></tr>
</table>

<h3>What a command line looks like</h3>
<p>When you log in you see a <b>prompt</b> such as <code>netadmin@syslog02:~$</code>. It tells you who you are (<code>netadmin</code>), which machine you are on (<code>syslog02</code>) and where you are. The <code>$</code> means an ordinary user. Some changes need administrator rights, so you put <code>sudo</code> (superuser do) in front of the command and type your password. Here is the first thing every engineer types on a new server, captured from the simulator:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip -br a</span>
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP

netadmin@syslog02:~$ <span class="hl">ip route</span>
(empty - the server has no routes at all)</pre>
<p>Read it like a router: <code>eth0</code> is up, but it has <b>no IPv4 address</b> and the routing table is empty. The server cannot talk to anyone. Fixing exactly this is Lab 1.</p>

<div class="eg"><p><b>Worked example.</b> The server team racks a new server called syslog02 in the server VLAN 10.30.0.0/24. The gateway is R1 at 10.30.0.1. You plan the build: address 10.30.0.10/24, default route via 10.30.0.1, DNS server 10.30.0.1. You will then prove it works by pinging the gateway and the NMS at 10.10.0.10. The same plan works for every server you ever rack.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Searching the internet for old Linux tutorials and using <code>ifconfig</code>, <code>route</code> and <code>netstat</code>. They belong to the old <i>net-tools</i> package, and a fresh Ubuntu server does not even have them. The modern tools are <code>ip</code> and <code>ss</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interview and exam questions love "temporary versus permanent". A change made with <code>ip</code> lives only until the next reboot. Permanent settings live in configuration files (netplan on Ubuntu).</p></div>

<div class="scn"><h4>The server that was racked but never answered</h4><p>A new log server was cabled on Monday. By Tuesday the NMS still showed no logs. The network team saw the switch port up and blamed the server team. The server team logged in on the console, ran <code>ip -br a</code> and saw the interface up with no address. The installer had written the network file for a different interface name. Ten minutes later it had an address, a gateway and logs.</p><p><b>Lesson:</b> "port up" only proves layer 1. Always check the host's own view with <code>ip -br a</code> and <code>ip route</code> first.</p></div>

<div class="iv"><p class="q">"A Linux server cannot reach another subnet. How do you start?"</p><p>Work bottom-up like on a router. Check the interface with <code>ip -br a</code>, the address and mask, then the routing table with <code>ip route</code> for a default gateway, then ping the gateway, then the destination, then DNS. Mention that you would use <code>ip route get</code> to see which route the kernel will really use.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A server needs the same five things as any host: interface, address, route, DNS and open ports.</li>
<li><code>ip</code> replaces ifconfig, route and arp; <code>ss</code> replaces netstat.</li>
<li><code>ip</code> changes are temporary; netplan files are permanent on Ubuntu.</li>
<li>Administrator tasks use <code>sudo</code>; the prompt shows which machine you are on.</li>
<li>Always verify from the host itself, not only from the switch port.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Linux server ke network side ko dekhna, configure karna aur troubleshoot karna seekhoge, wahi soch use karke jo aap router par pehle se use karte ho: interfaces, addresses, routes, default gateway, DNS, aur "kaunse ports open hain". Aap kuch commands (<code>ip</code>, <code>ping</code>, <code>tracepath</code>, <code>ss</code>, <code>nc</code>, <code>netplan</code>) use karoge aur end mein simulator mein asli tickets fix karoge.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki IP address, subnet mask aur default gateway kya hote hain. Linux pehle use kiya ho yeh <b>zaroori nahi</b>. Har command jab pehli baar aata hai hum use samjhate hain, aur output ki har line ka matlab batate hain.</p>

<h3>Analogy: server ek bahut busy office worker hai jiske paas ek phone line hai</h3>
<p>Server ko ek office worker samjho. Worker ke paas ek <b>phone</b> hai (network interface), ek <b>phone number</b> (IP address), ek rule ki <b>building ke bahar kisi ko call karna ho to kise karein</b> (default gateway), aur ek <b>phone book</b> (DNS) jo naam ko number mein badalti hai. Customers alag <b>extensions</b> (ports) par ring karke alag services tak pahunchte hain. Jab customer kehta hai "server nahi mil raha", to in paanch cheezon mein se ek toota hota hai. Yeh module aapko unhe order mein check karna sikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Lab topology: server VLAN 10.30.0.0/24 mein SRV01 aur core switch SW1, beech mein router R1 (DC-GW), 10.10.0.0/24 mein NMS01">
<rect x="20" y="70" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="97" text-anchor="middle" class="svg-ink" font-size="14">SRV01</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10</text>
<rect x="175" y="70" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="230" y="97" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="230" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.2</text>
<rect x="330" y="70" width="110" height="60" rx="10" fill="#bae6fd"/><text x="385" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1 DC-GW</text><text x="385" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.1 / 10.10.0.1</text>
<rect x="500" y="70" width="120" height="60" rx="10" fill="#ddd6fe"/><text x="560" y="97" text-anchor="middle" class="svg-ink" font-size="14">NMS01</text><text x="560" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.10</text>
<line x1="130" y1="100" x2="175" y2="100" stroke="#64748b" stroke-width="2"/><line x1="285" y1="100" x2="330" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="230" y="165" text-anchor="middle" class="svg-accent" font-size="12">server VLAN 10.30.0.0/24</text><text x="560" y="165" text-anchor="middle" class="svg-accent" font-size="12">NMS network 10.10.0.0/24</text>
</svg><p class="cap">Module ka lab: naye server SRV01 ko gateway R1 ke through NMS01 tak pahunchna hai.</p></div>

<h3>Router ke words aur unke Linux jodidaar</h3>
<p>Achhi baat: ideas aap pehle se jaante ho. Sirf commands badalte hain.</p>
<table class="cmp"><tr><th>Router par</th><th>Linux par</th></tr>
<tr><td>show ip interface brief</td><td><code>ip -br a</code></td></tr>
<tr><td>show ip route</td><td><code>ip route</code></td></tr>
<tr><td>show arp</td><td><code>ip neigh</code></td></tr>
<tr><td>ip address / no shutdown</td><td><code>ip addr add</code> / <code>ip link set eth0 up</code></td></tr>
<tr><td>ip route 0.0.0.0 0.0.0.0 gw</td><td><code>ip route add default via gw</code></td></tr>
<tr><td>startup-config</td><td><code>/etc/netplan/</code> ki netplan files</td></tr>
<tr><td>show ip sockets / show control-plane</td><td><code>ss -tln</code></td></tr>
</table>

<h3>Command line kaisi dikhti hai</h3>
<p>Login karne par aapko ek <b>prompt</b> dikhta hai jaise <code>netadmin@syslog02:~$</code>. Woh batata hai aap kaun ho (<code>netadmin</code>), kis machine par ho (<code>syslog02</code>) aur kahan ho. <code>$</code> ka matlab ordinary user. Kuch changes ke liye administrator rights chahiye, isliye command ke aage <code>sudo</code> (superuser do) lagate hain aur apna password type karte hain. Naye server par har engineer jo pehla command type karta hai, simulator se capture kiya hua:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip -br a</span>
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP

netadmin@syslog02:~$ <span class="hl">ip route</span>
(khaali - server ke paas koi route hi nahi)</pre>
<p>Router ki tarah padho: <code>eth0</code> up hai, par uske paas <b>koi IPv4 address nahi</b> hai aur routing table khaali hai. Server kisi se baat nahi kar sakta. Isi ko fix karna Lab 1 hai.</p>

<div class="eg"><p><b>Worked example.</b> Server team naya server syslog02 server VLAN 10.30.0.0/24 mein rack karti hai. Gateway R1 par 10.30.0.1 hai. Aap build plan karte ho: address 10.30.0.10/24, default route via 10.30.0.1, DNS server 10.30.0.1. Phir aap gateway aur 10.10.0.10 wale NMS ko ping karke sabit karte ho ki sab chalta hai. Yahi plan har server ke liye chalta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Internet par purane Linux tutorials dhoondh kar <code>ifconfig</code>, <code>route</code> aur <code>netstat</code> use karna. Yeh purane <i>net-tools</i> package ke hain, aur fresh Ubuntu server mein woh hota hi nahi. Modern tools <code>ip</code> aur <code>ss</code> hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Interview aur exam mein "temporary versus permanent" bahut poochte hain. <code>ip</code> se kiya change agle reboot tak hi rehta hai. Permanent settings configuration files mein hoti hain (Ubuntu par netplan).</p></div>

<div class="scn"><h4>Woh server jo rack hua par kabhi jawab nahi diya</h4><p>Naya log server Monday ko cable hua. Tuesday tak NMS par koi log nahi aaye. Network team ne dekha switch port up hai aur server team ko blame kiya. Server team ne console par login karke <code>ip -br a</code> chalaya aur dekha interface up hai par address nahi. Installer ne network file kisi aur interface name ke liye likhi thi. Das minute baad uske paas address, gateway aur logs the.</p><p><b>Lesson:</b> "port up" sirf layer 1 sabit karta hai. Hamesha pehle host ka apna view <code>ip -br a</code> aur <code>ip route</code> se check karo.</p></div>

<div class="iv"><p class="q">"Linux server doosre subnet tak nahi pahunch pa raha. Kahan se shuru karoge?"</p><p>Router ki tarah neeche se upar. <code>ip -br a</code> se interface, address aur mask check karo, phir <code>ip route</code> se default gateway, phir gateway ping, phir destination, phir DNS. Batao ki aap <code>ip route get</code> use karoge ye dekhne ke liye ki kernel asal mein kaunsa route use karega.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Server ko bhi wahi paanch cheezein chahiye jo kisi host ko: interface, address, route, DNS aur open ports.</li>
<li><code>ip</code> ifconfig, route aur arp ki jagah leta hai; <code>ss</code> netstat ki.</li>
<li><code>ip</code> ke changes temporary hain; Ubuntu par permanent ke liye netplan files.</li>
<li>Administrator kaam ke liye <code>sudo</code>; prompt batata hai aap kis machine par ho.</li>
<li>Hamesha host se hi verify karo, sirf switch port se nahi.</li>
</ul></div>
`}};export{e as default};