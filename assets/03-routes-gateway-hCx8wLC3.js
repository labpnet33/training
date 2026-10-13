var e={id:`routes-gateway`,h:{en:`Routes and the default gateway: ip route and ip neigh`,hi:`Routes aur default gateway: ip route aur ip neigh`},body:{en:`
<p>An address alone only lets a server talk to its own subnet. To reach anything else it needs a <b>route</b>: a rule that says "to reach network X, hand the packet to neighbour Y". A server usually needs just one such rule, the <b>default route</b>, which means "for everything I do not know, give it to my gateway". The gateway is a router, here R1 at 10.30.0.1.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Server decision: same subnet goes direct, other subnet goes to the gateway">
<rect x="20" y="60" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="95" y="88" text-anchor="middle" class="svg-ink" font-size="14">SRV01</text><text x="95" y="108" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10/24</text>
<rect x="260" y="20" width="150" height="50" rx="10" fill="#e2e8f0"/><text x="335" y="50" text-anchor="middle" class="svg-ink" font-size="13">10.30.0.2 (same /24)</text>
<rect x="260" y="120" width="150" height="50" rx="10" fill="#bae6fd"/><text x="335" y="150" text-anchor="middle" class="svg-ink" font-size="13">R1 gateway 10.30.0.1</text>
<rect x="480" y="120" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="550" y="150" text-anchor="middle" class="svg-ink" font-size="13">10.10.0.10 NMS</text>
<line x1="170" y1="85" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><line x1="170" y1="105" x2="260" y2="145" stroke="#64748b" stroke-width="2"/><line x1="410" y1="145" x2="480" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="205" y="55" class="svg-accent" font-size="12">connected: direct</text><text x="190" y="140" class="svg-accent" font-size="12">default: via gateway</text>
</svg><p class="cap">Same subnet: deliver directly. Anything else: send to the default gateway.</p></div>

<h3>Reading the routing table</h3>
<p><code>ip route</code> is the Linux "show ip route". Here is the table of SRV01 after we added only the address, captured from the simulator:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip route</span>
10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10</pre>
<p>One line. <code>10.30.0.0/24 dev eth0</code> says "this network is reachable directly out of eth0". <code>proto kernel</code> means Linux created it by itself when the address was added, like a router's "C" connected route. <code>src 10.30.0.10</code> is the source address used for traffic on this route. There is no default route, so the NMS at 10.10.0.10 is unknown. Linux does not even try:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 3 10.10.0.10
<span class="hl">ping: connect: Network is unreachable</span></pre>
<p>"Network is unreachable" is printed <b>by your own server</b>. No packet left the box, because the kernel had no route to choose. Remember this: it always points at a missing route on the sending host, never at the far end.</p>

<h3>Adding and removing routes (temporary)</h3>
<pre class="code"><span class="c"># default gateway, like: ip route 0.0.0.0 0.0.0.0 10.30.0.1</span>
sudo ip route add default via 10.30.0.1
<span class="c"># a static route to one remote network through the gateway</span>
sudo ip route add 192.0.2.0/24 via 10.30.0.1
<span class="c"># remove</span>
sudo ip route del default</pre>
<p>The gateway given after <code>via</code> must be inside a subnet you are directly connected to. Linux refuses a gateway it cannot reach.</p>
<pre class="out">netadmin@syslog02:~$ sudo ip route add default via 10.30.0.1
netadmin@syslog02:~$ <span class="hl">ip route</span>
default via 10.30.0.1 dev eth0 proto static
10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10</pre>
<p><code>default via 10.30.0.1</code> is the default route. <code>proto static</code> means someone added it by hand.</p>

<h3>Which route will Linux really use? ip route get</h3>
<p>Routing tables can get long. <code>ip route get DESTINATION</code> asks the kernel to do the lookup and tell you the answer:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip route get 10.10.0.10</span>
10.10.0.10 via 10.30.0.1 dev eth0 src 10.30.0.10 uid 1001
    cache</pre>
<p>Read it as: "to reach 10.10.0.10, send out eth0 to next hop 10.30.0.1, using source address 10.30.0.10". Before the default route exists the same command prints <code>RTNETLINK answers: Network is unreachable</code>. This one command settles arguments about routing in seconds.</p>

<h3>The neighbour table: ip neigh</h3>
<p>To send to the gateway at layer 2, the server needs its MAC address, learned with ARP. <code>ip neigh</code> is the Linux "show arp":</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip neigh</span>
10.30.0.1 dev eth0 lladdr 52:54:0c:04:4b:01 REACHABLE</pre>
<p><code>lladdr</code> is the neighbour's MAC address. <code>REACHABLE</code> means it was confirmed recently. If you see <code>FAILED</code> or <code>INCOMPLETE</code>, ARP got no answer: the gateway is down, in another VLAN, or the cable is wrong. The table is empty on a freshly started server until it talks to someone.</p>

<div class="eg"><p><b>Worked example.</b> SRV01 pings the gateway successfully but the NMS fails with "Network is unreachable". Because the gateway answers, layer 1 to 3 on the local subnet are fine. The failure is the missing default route. You add <code>sudo ip route add default via 10.30.0.1</code>, <code>ip route get 10.10.0.10</code> now shows the next hop, and the ping to 10.10.0.10 answers.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Adding a default route whose gateway is not in the server's own subnet, or adding two default routes. Two defaults cause random-looking behaviour; keep exactly one unless you know why.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Network is unreachable" and "Destination Host Unreachable" are different. The first is the local routing table (no route). The second is ARP failing on the connected subnet (the neighbour does not answer). Chapter 6 covers both.</p></div>

<div class="scn"><h4>Pings to the gateway work, pings beyond fail</h4><p>A new web server could ping its gateway but not the database in another subnet. The engineer blamed a firewall for two hours. One look at <code>ip route</code> showed no default route; the netplan file had a typo in the routes section so the route was never installed. <code>ip route get</code> on the database address confirmed it with "Network is unreachable". After the file was fixed the route appeared.</p><p><b>Lesson:</b> run <code>ip route get</code> before you suspect firewalls.</p></div>

<div class="iv"><p class="q">"What does 'Network is unreachable' mean when you ping from Linux?"</p><p>The sending host has no route to that destination, usually a missing default gateway. No packet was sent. I would check <code>ip route</code> and <code>ip route get</code>, then add or fix the default route. It is not a problem on the remote side.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Adding an address creates the connected route automatically (proto kernel).</li>
<li>A host needs one default route: <code>ip route add default via GATEWAY</code>.</li>
<li>"Network is unreachable" means the local kernel has no route; nothing was sent.</li>
<li><code>ip route get X</code> shows the exact route, next hop and source Linux will use.</li>
<li><code>ip neigh</code> is the ARP table; FAILED or INCOMPLETE means no layer 2 answer.</li>
</ul></div>
`,hi:`
<p>Sirf address se server apne hi subnet se baat kar sakta hai. Baaki kisi tak pahunchne ke liye use <b>route</b> chahiye: ek rule jo kehta hai "network X tak pahunchna ho to packet neighbour Y ko do". Server ko aam taur par sirf ek aisa rule chahiye, <b>default route</b>, jiska matlab "jo mujhe nahi pata woh sab apne gateway ko do". Gateway ek router hai, yahan 10.30.0.1 par R1.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Server ka decision: same subnet direct jaata hai, doosra subnet gateway ko">
<rect x="20" y="60" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="95" y="88" text-anchor="middle" class="svg-ink" font-size="14">SRV01</text><text x="95" y="108" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10/24</text>
<rect x="260" y="20" width="150" height="50" rx="10" fill="#e2e8f0"/><text x="335" y="50" text-anchor="middle" class="svg-ink" font-size="13">10.30.0.2 (same /24)</text>
<rect x="260" y="120" width="150" height="50" rx="10" fill="#bae6fd"/><text x="335" y="150" text-anchor="middle" class="svg-ink" font-size="13">R1 gateway 10.30.0.1</text>
<rect x="480" y="120" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="550" y="150" text-anchor="middle" class="svg-ink" font-size="13">10.10.0.10 NMS</text>
<line x1="170" y1="85" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><line x1="170" y1="105" x2="260" y2="145" stroke="#64748b" stroke-width="2"/><line x1="410" y1="145" x2="480" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="205" y="55" class="svg-accent" font-size="12">connected: seedha</text><text x="190" y="140" class="svg-accent" font-size="12">default: gateway se</text>
</svg><p class="cap">Same subnet: seedha deliver karo. Baaki sab kuch: default gateway ko bhejo.</p></div>

<h3>Routing table padhna</h3>
<p><code>ip route</code> Linux ka "show ip route" hai. Sirf address add karne ke baad SRV01 ka table, simulator se capture kiya hua:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip route</span>
10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10</pre>
<p>Ek line. <code>10.30.0.0/24 dev eth0</code> kehta hai "yeh network eth0 se seedha reachable hai". <code>proto kernel</code> matlab address add hote hi Linux ne ise khud banaya, router ke "C" connected route jaisa. <code>src 10.30.0.10</code> is route par traffic ka source address hai. Default route nahi hai, isliye 10.10.0.10 wala NMS unknown hai. Linux koshish bhi nahi karta:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 3 10.10.0.10
<span class="hl">ping: connect: Network is unreachable</span></pre>
<p>"Network is unreachable" <b>aapka apna server</b> print karta hai. Koi packet box se bahar nahi gaya, kyunki kernel ke paas chunne ke liye route hi nahi tha. Yaad rakho: yeh hamesha sending host ke missing route ki taraf ishara karta hai, door wale end ki taraf kabhi nahi.</p>

<h3>Routes jodna aur hatana (temporary)</h3>
<pre class="code"><span class="c"># default gateway, jaise: ip route 0.0.0.0 0.0.0.0 10.30.0.1</span>
sudo ip route add default via 10.30.0.1
<span class="c"># gateway ke through ek remote network ka static route</span>
sudo ip route add 192.0.2.0/24 via 10.30.0.1
<span class="c"># hatao</span>
sudo ip route del default</pre>
<p><code>via</code> ke baad diya gateway aise subnet mein hona chahiye jisse aap directly connected ho. Jo gateway pahunch se bahar ho Linux use mana kar deta hai.</p>
<pre class="out">netadmin@syslog02:~$ sudo ip route add default via 10.30.0.1
netadmin@syslog02:~$ <span class="hl">ip route</span>
default via 10.30.0.1 dev eth0 proto static
10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10</pre>
<p><code>default via 10.30.0.1</code> default route hai. <code>proto static</code> matlab kisi ne haath se jodi.</p>

<h3>Linux asal mein kaunsa route use karega? ip route get</h3>
<p>Routing tables lambe ho sakte hain. <code>ip route get DESTINATION</code> kernel se lookup karwa kar jawab batata hai:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip route get 10.10.0.10</span>
10.10.0.10 via 10.30.0.1 dev eth0 src 10.30.0.10 uid 1001
    cache</pre>
<p>Aise padho: "10.10.0.10 tak pahunchne ke liye eth0 se next hop 10.30.0.1 ko bhejo, source address 10.30.0.10 se". Default route banne se pehle yahi command <code>RTNETLINK answers: Network is unreachable</code> print karta hai. Yeh ek command routing ki behes seconds mein khatam kar deta hai.</p>

<h3>Neighbour table: ip neigh</h3>
<p>Gateway ko layer 2 par bhejne ke liye server ko uska MAC address chahiye, jo ARP se seekha jaata hai. <code>ip neigh</code> Linux ka "show arp" hai:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip neigh</span>
10.30.0.1 dev eth0 lladdr 52:54:0c:04:4b:01 REACHABLE</pre>
<p><code>lladdr</code> neighbour ka MAC address hai. <code>REACHABLE</code> matlab haal hi mein confirm hua. <code>FAILED</code> ya <code>INCOMPLETE</code> dikhe to ARP ka jawab nahi mila: gateway down hai, doosre VLAN mein hai, ya cable galat hai. Naya start hua server jab tak kisi se baat na kare table khaali rehta hai.</p>

<div class="eg"><p><b>Worked example.</b> SRV01 gateway ko successfully ping karta hai par NMS "Network is unreachable" deta hai. Gateway jawab de raha hai, to local subnet par layer 1 se 3 theek hain. Failure missing default route hai. Aap <code>sudo ip route add default via 10.30.0.1</code> chalate ho, <code>ip route get 10.10.0.10</code> ab next hop dikhata hai, aur 10.10.0.10 ka ping jawab deta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Aisa gateway likhna jo server ke apne subnet mein nahi, ya do default routes jodna. Do defaults random jaisa behaviour dete hain; jab tak wajah na pata ho ek hi rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Network is unreachable" aur "Destination Host Unreachable" alag hain. Pehla local routing table (route nahi). Doosra connected subnet par ARP fail hona (neighbour jawab nahi deta). Chapter 6 dono dikhata hai.</p></div>

<div class="scn"><h4>Gateway tak ping chalta hai, uske aage fail</h4><p>Naya web server apne gateway ko ping kar sakta tha par doosre subnet ke database ko nahi. Engineer ne do ghante firewall ko blame kiya. <code>ip route</code> ek baar dekha to default route tha hi nahi; netplan file ke routes section mein typo tha, isliye route install hi nahi hua. Database address par <code>ip route get</code> ne "Network is unreachable" se confirm kiya. File theek hone par route aa gaya.</p><p><b>Lesson:</b> firewall par shak karne se pehle <code>ip route get</code> chalao.</p></div>

<div class="iv"><p class="q">"Linux se ping karne par 'Network is unreachable' ka kya matlab hai?"</p><p>Sending host ke paas us destination ka route nahi, aam taur par default gateway missing. Koi packet bheja hi nahi gaya. Main <code>ip route</code> aur <code>ip route get</code> check karunga, phir default route add ya fix karunga. Yeh remote side ki problem nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Address add karne par connected route khud ban jaata hai (proto kernel).</li>
<li>Host ko ek default route chahiye: <code>ip route add default via GATEWAY</code>.</li>
<li>"Network is unreachable" matlab local kernel ke paas route nahi; kuch bheja nahi gaya.</li>
<li><code>ip route get X</code> exact route, next hop aur source dikhata hai jo Linux use karega.</li>
<li><code>ip neigh</code> ARP table hai; FAILED ya INCOMPLETE matlab layer 2 jawab nahi.</li>
</ul></div>
`}};export{e as default};