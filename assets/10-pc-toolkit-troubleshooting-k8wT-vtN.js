var e={id:`toolkit`,h:{en:`Your PC toolkit and a first troubleshooting workflow`,hi:`Aapka PC toolkit aur pehla troubleshooting workflow`},body:{en:`
<p>A doctor does not guess. She checks your pulse, temperature and blood pressure first, in the same order every time, and only then decides. Network engineers work the same way, and their stethoscope is the <b>command line</b>: a text window where you type commands and read the answers. In this chapter you will open it on your own computer, learn five commands that every engineer uses daily, and follow a simple step-by-step method to find almost any "my internet does not work" problem.</p>

<h3>Opening the command line</h3>
<ul>
<li><b>Windows</b>: press the Windows key, type <code>cmd</code> and press Enter. A black window called Command Prompt opens (PowerShell or Windows Terminal work too).</li>
<li><b>macOS</b>: open Spotlight (Cmd + Space), type <code>Terminal</code>, press Enter.</li>
<li><b>Linux</b>: press Ctrl + Alt + T on most desktops.</li>
</ul>
<p>Type a command, press Enter, read the output. Nothing you do in this chapter changes your PC except <code>ipconfig /release</code>, which briefly disconnects you.</p>

<h3>1. See your addresses: ipconfig, ip, ifconfig</h3>
<table class="cmp"><tr><th>Command</th><th>System</th><th>What it shows or does</th></tr>
<tr><td><code>ipconfig</code></td><td>Windows</td><td>IP address, mask and default gateway of each adapter</td></tr>
<tr><td><code>ipconfig /all</code></td><td>Windows</td><td>Adds MAC, DHCP server, DNS servers and lease times</td></tr>
<tr><td><code>ipconfig /release</code> then <code>ipconfig /renew</code></td><td>Windows</td><td>Give the DHCP address back, then ask for one again</td></tr>
<tr><td><code>ipconfig /flushdns</code></td><td>Windows</td><td>Forget cached DNS answers</td></tr>
<tr><td><code>ip addr</code> (or <code>ip a</code>) and <code>ip route</code></td><td>Linux</td><td>Addresses, and the routing table with the default gateway</td></tr>
<tr><td><code>ifconfig</code></td><td>macOS, older Linux</td><td>Addresses and MAC of each interface</td></tr>
</table>
<pre class="out">C:\\Users\\asha&gt; ipconfig

Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : home.example
   IPv4 Address. . . . . . . . . . . : <span class="hl">192.168.1.23</span>
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : <span class="hl">192.168.1.1</span></pre>
<pre class="out">asha@laptop:~$ ip addr show wlan0
3: wlan0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 3c:52:82:1a:2b:3c brd ff:ff:ff:ff:ff:ff
    <span class="hl">inet 192.168.1.23/24</span> brd 192.168.1.255 scope global dynamic wlan0
asha@laptop:~$ ip route
<span class="hl">default via 192.168.1.1 dev wlan0</span> proto dhcp metric 600
192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.23 metric 600</pre>

<h3>2. Test reachability: ping</h3>
<p><code>ping</code> sends ICMP echo requests and waits for echo replies. Windows sends 4 and stops; Linux and macOS keep going until you press Ctrl + C (use <code>-c 4</code> to send 4).</p>
<pre class="out">C:\\Users\\asha&gt; ping 192.168.1.1

Pinging 192.168.1.1 with 32 bytes of data:
<span class="hl">Reply from 192.168.1.1: bytes=32 time=2ms TTL=64</span>
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64
Reply from 192.168.1.1: bytes=32 time=3ms TTL=64
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 4, <span class="hl">Lost = 0 (0% loss)</span>,
Approximate round trip times in milli-seconds:
    Minimum = 1ms, Maximum = 3ms, Average = 1ms</pre>
<p>Learn to read the three classic failures: <b>Request timed out</b> (no reply came back; the target is down, blocked by a firewall, or the reply has no route home), <b>Destination host unreachable</b> (a device, often your own PC or a router, knows it cannot deliver), and <b>Ping request could not find host</b> (the name could not be resolved: DNS).</p>

<h3>3. See the path: tracert / traceroute</h3>
<pre class="out">C:\\Users\\asha&gt; tracert www.nkshop.example

Tracing route to www.nkshop.example [203.0.113.80]
over a maximum of 30 hops:

  1     1 ms     1 ms     1 ms  192.168.1.1
  2     8 ms     7 ms     9 ms  198.51.100.1
  3    12 ms    11 ms    12 ms  198.51.100.66
  4     *        *        *     Request timed out.
  5    24 ms    23 ms    25 ms  203.0.113.80

Trace complete.</pre>
<p>Each line is one router (hop). It works by sending packets with TTL 1, 2, 3 and so on; each router that drops a packet because its TTL reached zero sends back an ICMP "time exceeded" message and so reveals itself. A single line of stars in the middle, followed by answers, is normal: that router simply does not reply to traceroute. Stars from some hop to the end mean the path breaks there. Windows <code>tracert</code> uses ICMP; Linux and macOS <code>traceroute</code> use UDP by default.</p>

<h3>4. Test DNS: nslookup</h3>
<pre class="out">C:\\Users\\asha&gt; nslookup www.nkshop.example
Server:  resolver.isp.example
Address:  198.51.100.53

Non-authoritative answer:
Name:    www.nkshop.example
<span class="hl">Address:  203.0.113.80</span></pre>
<p>"Non-authoritative" just means the answer came from the resolver's cache, not from the domain's own server. Two more handy commands: <code>arp -a</code> (the ARP cache, chapter 7) and <code>netstat -an</code> (open connections, chapter 8).</p>

<h3>The troubleshooting workflow: bottom-up, one step at a time</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Bottom-up troubleshooting ladder">
<rect x="20" y="190" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">1. Physical: link light, cable, Wi-Fi connected?</text>
<rect x="20" y="152" width="600" height="30" rx="6" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">2. ipconfig: valid IP, mask, gateway? (169.254.x.x = DHCP failed)</text>
<rect x="20" y="114" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="13">3. ping the default gateway: is the LAN OK?</text>
<rect x="20" y="76" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">4. ping a remote IP (e.g. the DNS server): is routing OK?</text>
<rect x="20" y="38" width="600" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">5. nslookup the name: is DNS OK?</text>
<rect x="20" y="0" width="600" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">6. The application itself (browser, app, firewall rule)</text>
</svg><p class="cap">Climb from the bottom. The first step that fails is where you dig.</p></div>
<ol>
<li><b>Physical.</b> Is the cable plugged in with a link light on the port? Is Wi-Fi connected to the right network? Is airplane mode off?</li>
<li><b>Addressing.</b> Run <code>ipconfig</code>. A 169.254.x.x address means the PC could not reach a DHCP server. A missing gateway, or a gateway in a different network, breaks everything remote.</li>
<li><b>Gateway.</b> <code>ping 192.168.1.1</code>. If this fails, the problem is on your local LAN or the link to it.</li>
<li><b>Beyond the gateway.</b> Ping a remote IP address, such as your DNS server. If the gateway answers but this fails, suspect the router, the ISP link or routing. Use <code>tracert</code> to see where it stops.</li>
<li><b>Names.</b> <code>nslookup</code> a name. If IPs work but names fail, it is DNS.</li>
<li><b>Application.</b> If all of the above work, the network is fine for this PC; look at the application, its server, or a firewall rule for that port.</li>
</ol>
<p>This is the <b>bottom-up</b> approach, following the layers from chapter 7. Formal methods add structure around it; the CompTIA method is: identify the problem, establish a theory of probable cause, test the theory, establish a plan of action, implement the solution or escalate, verify full system functionality and add preventive measures, and document findings. Always ask "what changed recently?" and always write down what you did.</p>

<div class="eg"><p><b>Worked example.</b> Ravi says "no internet". Step 1: Wi-Fi shows connected. Step 2: <code>ipconfig</code> shows 192.168.1.40/24, gateway 192.168.1.1. Step 3: ping 192.168.1.1 gets 4 replies. Step 4: ping 198.51.100.53 gets 4 replies. Step 5: <code>nslookup www.nkshop.example</code> times out with "DNS request timed out". Diagnosis in two minutes: DNS. He had a manual DNS server that no longer exists; setting DNS back to automatic fixed it.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Jumping to the top ("reinstall the browser", "restart the router") before checking the bottom. Another: concluding a server is down because ping times out. Many servers and firewalls block ICMP on purpose; test the actual service too.</p></div>

<div class="exam"><p><b>Exam trap.</b> 169.254.x.x = APIPA, DHCP unreachable. Works by IP but not by name = DNS. Windows: <code>tracert</code>, <code>ipconfig</code>; Linux: <code>traceroute</code>, <code>ip addr</code>/<code>ifconfig</code>. Know the CompTIA troubleshooting steps in order; "verify full system functionality" comes after implementing the fix, and "document" is last.</p></div>

<div class="scn"><h4>The whole floor got 169.254 addresses</h4><p>On Monday morning every PC on the third floor showed "No internet". The engineer asked one user to run <code>ipconfig</code>: IPv4 address 169.254.37.112, mask 255.255.0.0, no gateway. Other floors were fine. Since the whole floor failed DHCP at once, the problem was shared, not on each PC. In the rack, the floor switch's uplink cable had been knocked out during weekend cleaning. Plugging it back in and running <code>ipconfig /renew</code> gave everyone valid addresses.</p><p><b>Lesson:</b> one user failing points at that user; many users failing together points at what they share. APIPA tells you DHCP never answered.</p></div>

<div class="iv"><p class="q">"A user says the internet is not working. Walk me through how you would troubleshoot."</p><p>Strong answer: start by asking what exactly fails and what changed. Then go bottom-up: check the link or Wi-Fi, run <code>ipconfig</code> for a valid IP, mask, gateway and DNS (169.254 means DHCP failed), ping the gateway, ping a remote IP, run <code>tracert</code> to see where the path stops, then <code>nslookup</code> to test DNS, and finally the application or firewall. Check whether other users are affected to decide between a local and a shared problem. Fix, verify, and document.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ipconfig (/all, /release, /renew, /flushdns), ip addr/ip route or ifconfig show your addressing.</li>
<li>ping tests reachability; read "timed out", "unreachable" and "could not find host" differently.</li>
<li>tracert/traceroute shows each hop using TTL; nslookup tests DNS.</li>
<li>Troubleshoot bottom-up: physical, IP config, gateway, remote IP, DNS, application.</li>
<li>Many users failing together means a shared cause; always verify and document.</li>
</ul></div>
`,hi:`
<p>Doctor andaaza nahi lagati. Woh pehle aapki pulse, temperature aur blood pressure check karti hai, har baar same order mein, aur tabhi decide karti hai. Network engineers bhi aise hi kaam karte hain, aur unka stethoscope hai <b>command line</b>: ek text window jahan aap commands type karte ho aur answers padhte ho. Is chapter mein aap ise apne computer par khologe, paanch commands seekhoge jo har engineer roz use karta hai, aur ek simple step-by-step method follow karoge jisse lagbhag koi bhi "mera internet nahi chal raha" problem mil jaaye.</p>

<h3>Command line kholna</h3>
<ul>
<li><b>Windows</b>: Windows key dabao, <code>cmd</code> type karo aur Enter dabao. Command Prompt naam ki kaali window khulegi (PowerShell ya Windows Terminal bhi chalte hain).</li>
<li><b>macOS</b>: Spotlight kholo (Cmd + Space), <code>Terminal</code> type karo, Enter dabao.</li>
<li><b>Linux</b>: zyada tar desktops par Ctrl + Alt + T dabao.</li>
</ul>
<p>Command type karo, Enter dabao, output padho. Is chapter mein aap jo bhi karoge woh aapke PC ko nahi badlega, siwaye <code>ipconfig /release</code> ke, jo thodi der ke liye aapko disconnect karta hai.</p>

<h3>1. Apne addresses dekho: ipconfig, ip, ifconfig</h3>
<table class="cmp"><tr><th>Command</th><th>System</th><th>Kya dikhata ya karta hai</th></tr>
<tr><td><code>ipconfig</code></td><td>Windows</td><td>Har adapter ka IP address, mask aur default gateway</td></tr>
<tr><td><code>ipconfig /all</code></td><td>Windows</td><td>MAC, DHCP server, DNS servers aur lease times bhi</td></tr>
<tr><td><code>ipconfig /release</code> phir <code>ipconfig /renew</code></td><td>Windows</td><td>DHCP address wapas do, phir dobara maango</td></tr>
<tr><td><code>ipconfig /flushdns</code></td><td>Windows</td><td>Cached DNS answers bhool jao</td></tr>
<tr><td><code>ip addr</code> (ya <code>ip a</code>) aur <code>ip route</code></td><td>Linux</td><td>Addresses, aur default gateway ke saath routing table</td></tr>
<tr><td><code>ifconfig</code></td><td>macOS, purana Linux</td><td>Har interface ke addresses aur MAC</td></tr>
</table>
<pre class="out">C:\\Users\\asha&gt; ipconfig

Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : home.example
   IPv4 Address. . . . . . . . . . . : <span class="hl">192.168.1.23</span>
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : <span class="hl">192.168.1.1</span></pre>
<pre class="out">asha@laptop:~$ ip addr show wlan0
3: wlan0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 3c:52:82:1a:2b:3c brd ff:ff:ff:ff:ff:ff
    <span class="hl">inet 192.168.1.23/24</span> brd 192.168.1.255 scope global dynamic wlan0
asha@laptop:~$ ip route
<span class="hl">default via 192.168.1.1 dev wlan0</span> proto dhcp metric 600
192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.23 metric 600</pre>

<h3>2. Reachability test karo: ping</h3>
<p><code>ping</code> ICMP echo requests bhejta hai aur echo replies ka intezaar karta hai. Windows 4 bhej kar ruk jaata hai; Linux aur macOS tab tak chalte rehte hain jab tak aap Ctrl + C na dabao (4 bhejne ke liye <code>-c 4</code> use karo).</p>
<pre class="out">C:\\Users\\asha&gt; ping 192.168.1.1

Pinging 192.168.1.1 with 32 bytes of data:
<span class="hl">Reply from 192.168.1.1: bytes=32 time=2ms TTL=64</span>
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64
Reply from 192.168.1.1: bytes=32 time=3ms TTL=64
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 4, <span class="hl">Lost = 0 (0% loss)</span>,
Approximate round trip times in milli-seconds:
    Minimum = 1ms, Maximum = 3ms, Average = 1ms</pre>
<p>Teen classic failures padhna seekho: <b>Request timed out</b> (koi reply wapas nahi aaya; target down hai, firewall ne block kiya, ya reply ke paas ghar lautne ka route nahi), <b>Destination host unreachable</b> (koi device, aksar aapka apna PC ya router, jaanta hai ki woh deliver nahi kar sakta), aur <b>Ping request could not find host</b> (naam resolve nahi hua: DNS).</p>

<h3>3. Raasta dekho: tracert / traceroute</h3>
<pre class="out">C:\\Users\\asha&gt; tracert www.nkshop.example

Tracing route to www.nkshop.example [203.0.113.80]
over a maximum of 30 hops:

  1     1 ms     1 ms     1 ms  192.168.1.1
  2     8 ms     7 ms     9 ms  198.51.100.1
  3    12 ms    11 ms    12 ms  198.51.100.66
  4     *        *        *     Request timed out.
  5    24 ms    23 ms    25 ms  203.0.113.80

Trace complete.</pre>
<p>Har line ek router (hop) hai. Yeh TTL 1, 2, 3 waghera wale packets bhej kar kaam karta hai; har router jo TTL zero hone ki wajah se packet drop karta hai, ek ICMP "time exceeded" message wapas bhejta hai aur is tarah khud ko dikha deta hai. Beech mein stars ki ek line, uske baad answers, normal hai: woh router bas traceroute ko reply nahi karta. Kisi hop se end tak stars ka matlab hai raasta wahan toot-ta hai. Windows <code>tracert</code> ICMP use karta hai; Linux aur macOS <code>traceroute</code> default mein UDP use karte hain.</p>

<h3>4. DNS test karo: nslookup</h3>
<pre class="out">C:\\Users\\asha&gt; nslookup www.nkshop.example
Server:  resolver.isp.example
Address:  198.51.100.53

Non-authoritative answer:
Name:    www.nkshop.example
<span class="hl">Address:  203.0.113.80</span></pre>
<p>"Non-authoritative" ka matlab bas itna hai ki answer resolver ke cache se aaya, domain ke apne server se nahi. Do aur kaam ke commands: <code>arp -a</code> (ARP cache, chapter 7) aur <code>netstat -an</code> (open connections, chapter 8).</p>

<h3>Troubleshooting workflow: bottom-up, ek baar mein ek step</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Bottom-up troubleshooting ki seedhi">
<rect x="20" y="190" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">1. Physical: link light, cable, Wi-Fi connected?</text>
<rect x="20" y="152" width="600" height="30" rx="6" fill="#fde68a"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">2. ipconfig: sahi IP, mask, gateway? (169.254.x.x = DHCP fail)</text>
<rect x="20" y="114" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="13">3. default gateway ko ping: LAN theek hai?</text>
<rect x="20" y="76" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">4. remote IP ko ping (jaise DNS server): routing theek hai?</text>
<rect x="20" y="38" width="600" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">5. naam ka nslookup: DNS theek hai?</text>
<rect x="20" y="0" width="600" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">6. Application khud (browser, app, firewall rule)</text>
</svg><p class="cap">Neeche se upar chadho. Jo pehla step fail ho, wahi khodo.</p></div>
<ol>
<li><b>Physical.</b> Kya cable lagi hai aur port par link light on hai? Kya Wi-Fi sahi network se connected hai? Kya airplane mode off hai?</li>
<li><b>Addressing.</b> <code>ipconfig</code> chalao. 169.254.x.x address ka matlab hai PC DHCP server tak nahi pahunch paaya. Missing gateway, ya alag network ka gateway, har remote cheez tod deta hai.</li>
<li><b>Gateway.</b> <code>ping 192.168.1.1</code>. Agar yeh fail ho, problem aapke local LAN par ya uske link par hai.</li>
<li><b>Gateway ke aage.</b> Koi remote IP address ping karo, jaise aapka DNS server. Agar gateway jawab de lekin yeh fail ho, router, ISP link ya routing par shak karo. Kahan rukta hai dekhne ke liye <code>tracert</code> use karo.</li>
<li><b>Naam.</b> Kisi naam ka <code>nslookup</code> karo. Agar IPs chalte hain lekin naam fail hote hain, to DNS hai.</li>
<li><b>Application.</b> Agar upar sab chal raha hai, to is PC ke liye network theek hai; application, uske server, ya us port ke firewall rule ko dekho.</li>
</ol>
<p>Yeh <b>bottom-up</b> approach hai, jo chapter 7 ki layers follow karta hai. Formal methods iske aas-paas structure jodte hain; CompTIA method yeh hai: problem identify karo, probable cause ki theory banao, theory test karo, plan of action banao, solution implement karo ya escalate karo, full system functionality verify karo aur preventive measures lagao, aur findings document karo. Hamesha poocho "haal mein kya badla?" aur hamesha likho ki aapne kya kiya.</p>

<div class="eg"><p><b>Worked example.</b> Ravi kehta hai "internet nahi hai". Step 1: Wi-Fi connected dikhata hai. Step 2: <code>ipconfig</code> 192.168.1.40/24, gateway 192.168.1.1 dikhata hai. Step 3: ping 192.168.1.1 ko 4 replies milte hain. Step 4: ping 198.51.100.53 ko 4 replies milte hain. Step 5: <code>nslookup www.nkshop.example</code> "DNS request timed out" ke saath time out hota hai. Do minute mein diagnosis: DNS. Usne ek manual DNS server set kiya tha jo ab exist nahi karta; DNS ko wapas automatic karne se theek ho gaya.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Neeche check kiye bina seedhe upar kood jaana ("browser reinstall karo", "router restart karo"). Ek aur: ping time out hone par maan lena ki server down hai. Bahut saare servers aur firewalls jaan-boojh kar ICMP block karte hain; asli service bhi test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> 169.254.x.x = APIPA, DHCP unreachable. IP se chale lekin naam se nahi = DNS. Windows: <code>tracert</code>, <code>ipconfig</code>; Linux: <code>traceroute</code>, <code>ip addr</code>/<code>ifconfig</code>. CompTIA troubleshooting steps order mein jaano; "verify full system functionality" fix implement karne ke baad aata hai, aur "document" sabse aakhir mein.</p></div>

<div class="scn"><h4>Poore floor ko 169.254 addresses mile</h4><p>Monday subah teesre floor ke har PC par "No internet" dikh raha tha. Engineer ne ek user se <code>ipconfig</code> chalwaya: IPv4 address 169.254.37.112, mask 255.255.0.0, koi gateway nahi. Baaki floors theek the. Kyunki poora floor ek saath DHCP mein fail hua, problem shared thi, har PC par nahi. Rack mein floor switch ki uplink cable weekend ki safai ke dauraan nikal gayi thi. Use wapas lagane aur <code>ipconfig /renew</code> chalane se sabko sahi addresses mil gaye.</p><p><b>Seekh:</b> ek user fail ho to us user ki taraf ishaara hai; bahut users ek saath fail hon to us cheez ki taraf jo woh share karte hain. APIPA batata hai ki DHCP ne kabhi jawab nahi diya.</p></div>

<div class="iv"><p class="q">"Ek user kehta hai internet nahi chal raha. Batao aap kaise troubleshoot karoge."</p><p>Strong answer: pehle poocho ki exactly kya fail ho raha hai aur kya badla. Phir bottom-up jao: link ya Wi-Fi check karo, sahi IP, mask, gateway aur DNS ke liye <code>ipconfig</code> chalao (169.254 matlab DHCP fail), gateway ping karo, remote IP ping karo, raasta kahan rukta hai dekhne ke liye <code>tracert</code> chalao, phir DNS test karne ke liye <code>nslookup</code>, aur aakhir mein application ya firewall. Check karo ki dusre users affected hain ya nahi, taaki local aur shared problem mein farak kar sako. Fix karo, verify karo, aur document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ipconfig (/all, /release, /renew, /flushdns), ip addr/ip route ya ifconfig aapki addressing dikhate hain.</li>
<li>ping reachability test karta hai; "timed out", "unreachable" aur "could not find host" ko alag alag padho.</li>
<li>tracert/traceroute TTL use karke har hop dikhata hai; nslookup DNS test karta hai.</li>
<li>Bottom-up troubleshoot karo: physical, IP config, gateway, remote IP, DNS, application.</li>
<li>Bahut users ek saath fail = shared cause; hamesha verify aur document karo.</li>
</ul></div>
`}};export{e as default};