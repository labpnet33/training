var e={id:`interfaces`,h:{en:`Interfaces: names, descriptions, IP addresses and interface states`,hi:`Interfaces: naam, descriptions, IP addresses aur interface states`},body:{en:`
<p>Interfaces are the doors of a device. A router's doors lead to different streets (different subnets), so each door needs its own house number: an IP address. A switch's doors all open onto the same corridor, so its ports usually need no address at all. Knowing how to name a door, label it, number it and open it is the core skill of lab 2.</p>

<h3>How interfaces are named</h3>
<p>An interface name is its <b>type</b> followed by its <b>position</b>:</p>
<table class="cmp"><tr><th>Name</th><th>Meaning</th><th>Short form</th></tr>
<tr><td><code>FastEthernet0/1</code></td><td>100 Mbps port, module 0, port 1</td><td><code>fa0/1</code></td></tr>
<tr><td><code>GigabitEthernet0/0</code></td><td>1 Gbps port, slot 0, port 0 (routers often count from 0)</td><td><code>g0/0</code>, <code>gi0/0</code></td></tr>
<tr><td><code>GigabitEthernet1/0/24</code></td><td>Stack member 1, module 0, port 24 (Catalyst 9000)</td><td><code>gi1/0/24</code></td></tr>
<tr><td><code>TenGigabitEthernet1/1/1</code></td><td>10 Gbps uplink on network module 1</td><td><code>te1/1/1</code></td></tr>
<tr><td><code>Serial0/0/0</code></td><td>Serial WAN interface (older routers)</td><td><code>s0/0/0</code></td></tr>
<tr><td><code>Loopback0</code>, <code>Vlan1</code></td><td>Virtual interfaces: always-up loopback, switch virtual interface</td><td><code>lo0</code>, <code>vl1</code></td></tr>
</table>
<p>The name describes the port's maximum type, not the speed it negotiated. Use <code>show ip interface brief</code> to see the exact names on your device before configuring.</p>

<h3>Configuring a router interface</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# description LAN-to-SW1
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
<span class="c">! console messages a few seconds later:</span>
%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to up
%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up</pre>
<ul>
<li><b>description</b> is a free-text label. It changes nothing in forwarding but saves hours in troubleshooting: always say what is on the other end.</li>
<li><b>ip address</b> takes the address and the <b>dotted-decimal mask</b>. IOS does not accept <code>/24</code> here.</li>
<li><b>no shutdown</b> enables the interface. <b>Router interfaces are administratively down by default</b>; switch ports are enabled by default.</li>
</ul>
<p>IOS protects you from two classic errors: it refuses an address that overlaps a subnet already on another interface (<code>% 192.168.10.0 overlaps with GigabitEthernet0/1</code>), and it rejects the network or broadcast address of the subnet as an interface address.</p>

<h3>Reading show ip interface brief</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual up                    up</span>
GigabitEthernet0/1     unassigned      YES unset  administratively down down
GigabitEthernet0/2     unassigned      YES unset  administratively down down</pre>
<p><b>Status</b> is Layer 1 (is there a working physical link?) and <b>Protocol</b> is Layer 2 (is the data link working?). <b>Method</b> shows how the address was set: <code>manual</code>, <code>DHCP</code>, <code>NVRAM</code> (loaded from startup-config at boot) or <code>unset</code>.</p>

<table class="cmp"><tr><th>Status / Protocol</th><th>Meaning</th><th>Typical fix</th></tr>
<tr><td><b>administratively down / down</b></td><td>Someone typed <code>shutdown</code> (or it is a router default)</td><td><code>no shutdown</code></td></tr>
<tr><td><b>down / down</b></td><td>No physical link: cable unplugged or broken, far end off or shut</td><td>Check cable, far-end port, transceiver</td></tr>
<tr><td><b>up / down</b></td><td>Physical link fine, Layer 2 failing</td><td>Encapsulation or keepalive mismatch (serial), err-disable, far end issues</td></tr>
<tr><td><b>up / up</b></td><td>Working</td><td>Now test Layer 3 with ping</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Interface state troubleshooting ladder">
<rect x="10" y="40" width="145" height="80" rx="8" fill="#fed7aa"/><text x="82" y="68" text-anchor="middle" class="svg-ink" font-size="13">admin down</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">no shutdown</text>
<rect x="170" y="40" width="145" height="80" rx="8" fill="#fde68a"/><text x="242" y="68" text-anchor="middle" class="svg-ink" font-size="13">down / down</text><text x="242" y="90" text-anchor="middle" class="svg-muted" font-size="12">cable, far end</text>
<rect x="330" y="40" width="145" height="80" rx="8" fill="#ddd6fe"/><text x="402" y="68" text-anchor="middle" class="svg-ink" font-size="13">up / down</text><text x="402" y="90" text-anchor="middle" class="svg-muted" font-size="12">Layer 2 settings</text>
<rect x="490" y="40" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">up / up</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">now ping</text>
<line x1="155" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/><line x1="315" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/><line x1="475" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Fix the state on the left before looking further right</text>
</svg><p class="cap">Climb the ladder one step at a time: admin, physical, data link, then IP.</p></div>

<h3>More interface views</h3>
<ul>
<li><code>show interfaces GigabitEthernet0/0</code>: full detail, first line repeats the status (<code>GigabitEthernet0/0 is up, line protocol is up</code>), then MAC address, description, IP, MTU, speed/duplex, input/output counters and errors.</li>
<li><code>show interfaces description</code>: one line per interface with status and your labels. Perfect for "which port goes where?".</li>
<li><code>show interfaces status</code> (switches): port, description, status (connected / notconnect / disabled / err-disabled), VLAN, duplex, speed and type.</li>
<li><code>show running-config interface GigabitEthernet0/0</code>: only that interface's configuration.</li>
</ul>

<div class="eg"><p><b>Worked example from lab 2.</b> Before you start, R1's Gi0/0 shows <code>administratively down down</code> and SW1's Gi0/1 (the other end) shows <code>down down</code> because the router side is off. You configure the address and <code>no shutdown</code> on R1. Both ends go <code>up up</code>. <code>show ip interface brief</code> on R1 now shows 192.168.10.1 with method <code>manual</code>. After a reload it would say <code>NVRAM</code>, because the address came from the startup-config.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>no shutdown</code> on a router. Typing <code>ip address 192.168.10.1/24</code> (IOS needs the dotted mask). Putting the address on the wrong interface because you did not re-enter the right one. Assuming <code>up/up</code> means the IP is correct: the status says nothing about the address or mask.</p></div>

<div class="exam"><p><b>Exam traps.</b> "administratively down" always means the <code>shutdown</code> command. down/down points to Layer 1. up/down points to Layer 2. Router interfaces default to shutdown; switch ports default to no shutdown. The interface name shows the hardware type, not the negotiated speed.</p></div>

<div class="scn"><h4>The new branch that would not come up</h4><p>A branch router was racked and the WAN team reported "link down". The engineer checked <code>show ip interface brief</code>: the LAN interface was <code>administratively down</code> and the WAN interface <code>down down</code>. <code>no shutdown</code> fixed the LAN. For the WAN, <code>show interfaces</code> showed no input at all; the fibre patch lead at the provider's box was in the wrong port. After re-patching it went <code>up up</code> and the branch came online.</p><p><b>Lesson:</b> the two columns of <code>show ip interface brief</code> tell you which layer to fix. Read them before touching anything.</p></div>

<div class="iv"><p class="q">"An interface shows up/down. What does that tell you and what would you check?"</p><p>Strong answer: Layer 1 is fine (there is a signal) but Layer 2 is not: on serial links an encapsulation or keepalive mismatch or missing clock; on Ethernet an err-disabled or negotiation problem on the far end. Compare with administratively down (someone typed shutdown) and down/down (cable or far end). Check <code>show interfaces</code>, the far-end configuration and logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interface names are type plus position: <code>GigabitEthernet0/0</code>, <code>FastEthernet0/1</code>, <code>GigabitEthernet1/0/24</code>.</li>
<li>Router interface setup: <code>description</code>, <code>ip address A.B.C.D mask</code>, <code>no shutdown</code>.</li>
<li>Router interfaces are shut by default; switch ports are enabled by default.</li>
<li>Status = Layer 1, Protocol = Layer 2: admin down, down/down, up/down, up/up each point to a different fix.</li>
<li><code>show interfaces description</code> and <code>show interfaces status</code> answer "what is plugged in where?".</li>
</ul></div>
`,hi:`
<p>Interfaces device ke darwaze hain. Router ke darwaze alag alag galiyon (alag subnets) mein khulte hain, isliye har darwaze ko apna house number chahiye: ek IP address. Switch ke saare darwaze ek hi corridor mein khulte hain, isliye uske ports ko aam taur par koi address nahi chahiye. Darwaze ko naam dena, label karna, number dena aur kholna, yahi lab 2 ki core skill hai.</p>

<h3>Interfaces ka naam kaise hota hai</h3>
<p>Interface ka naam uska <b>type</b> aur uske baad uski <b>position</b> hota hai:</p>
<table class="cmp"><tr><th>Naam</th><th>Matlab</th><th>Short form</th></tr>
<tr><td><code>FastEthernet0/1</code></td><td>100 Mbps port, module 0, port 1</td><td><code>fa0/1</code></td></tr>
<tr><td><code>GigabitEthernet0/0</code></td><td>1 Gbps port, slot 0, port 0 (routers aksar 0 se ginte hain)</td><td><code>g0/0</code>, <code>gi0/0</code></td></tr>
<tr><td><code>GigabitEthernet1/0/24</code></td><td>Stack member 1, module 0, port 24 (Catalyst 9000)</td><td><code>gi1/0/24</code></td></tr>
<tr><td><code>TenGigabitEthernet1/1/1</code></td><td>Network module 1 par 10 Gbps uplink</td><td><code>te1/1/1</code></td></tr>
<tr><td><code>Serial0/0/0</code></td><td>Serial WAN interface (purane routers)</td><td><code>s0/0/0</code></td></tr>
<tr><td><code>Loopback0</code>, <code>Vlan1</code></td><td>Virtual interfaces: hamesha up loopback, switch virtual interface</td><td><code>lo0</code>, <code>vl1</code></td></tr>
</table>
<p>Naam port ka maximum type batata hai, negotiate hui speed nahi. Configure karne se pehle apne device ke exact naam dekhne ke liye <code>show ip interface brief</code> use karo.</p>

<h3>Router interface configure karna</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# description LAN-to-SW1
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
<span class="c">! kuch second baad console messages:</span>
%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to up
%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/0, changed state to up</pre>
<ul>
<li><b>description</b> free-text label hai. Yeh forwarding mein kuch nahi badalta lekin troubleshooting mein ghante bachata hai: hamesha likho ki dusre end par kya hai.</li>
<li><b>ip address</b> address aur <b>dotted-decimal mask</b> leta hai. IOS yahan <code>/24</code> accept nahi karta.</li>
<li><b>no shutdown</b> interface enable karta hai. <b>Router interfaces default mein administratively down hote hain</b>; switch ports default mein enabled hote hain.</li>
</ul>
<p>IOS aapko do classic galtiyon se bachata hai: yeh aisa address mana kar deta hai jo kisi dusre interface par pehle se maujood subnet se overlap kare (<code>% 192.168.10.0 overlaps with GigabitEthernet0/1</code>), aur subnet ka network ya broadcast address interface address ke roop mein reject karta hai.</p>

<h3>show ip interface brief padhna</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual up                    up</span>
GigabitEthernet0/1     unassigned      YES unset  administratively down down
GigabitEthernet0/2     unassigned      YES unset  administratively down down</pre>
<p><b>Status</b> Layer 1 hai (kya chalta hua physical link hai?) aur <b>Protocol</b> Layer 2 hai (kya data link kaam kar raha hai?). <b>Method</b> batata hai address kaise set hua: <code>manual</code>, <code>DHCP</code>, <code>NVRAM</code> (boot par startup-config se load hua) ya <code>unset</code>.</p>

<table class="cmp"><tr><th>Status / Protocol</th><th>Matlab</th><th>Typical fix</th></tr>
<tr><td><b>administratively down / down</b></td><td>Kisi ne <code>shutdown</code> type kiya (ya yeh router default hai)</td><td><code>no shutdown</code></td></tr>
<tr><td><b>down / down</b></td><td>Physical link nahi: cable nikla ya toota, far end off ya shut</td><td>Cable, far-end port, transceiver check karo</td></tr>
<tr><td><b>up / down</b></td><td>Physical link theek, Layer 2 fail</td><td>Encapsulation ya keepalive mismatch (serial), err-disable, far end ki problems</td></tr>
<tr><td><b>up / up</b></td><td>Kaam kar raha hai</td><td>Ab ping se Layer 3 test karo</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Interface state troubleshooting seedhi">
<rect x="10" y="40" width="145" height="80" rx="8" fill="#fed7aa"/><text x="82" y="68" text-anchor="middle" class="svg-ink" font-size="13">admin down</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">no shutdown</text>
<rect x="170" y="40" width="145" height="80" rx="8" fill="#fde68a"/><text x="242" y="68" text-anchor="middle" class="svg-ink" font-size="13">down / down</text><text x="242" y="90" text-anchor="middle" class="svg-muted" font-size="12">cable, far end</text>
<rect x="330" y="40" width="145" height="80" rx="8" fill="#ddd6fe"/><text x="402" y="68" text-anchor="middle" class="svg-ink" font-size="13">up / down</text><text x="402" y="90" text-anchor="middle" class="svg-muted" font-size="12">Layer 2 settings</text>
<rect x="490" y="40" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">up / up</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">ab ping karo</text>
<line x1="155" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/><line x1="315" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/><line x1="475" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Right side dekhne se pehle left wali state fix karo</text>
</svg><p class="cap">Seedhi ek ek step chadho: admin, physical, data link, phir IP.</p></div>

<h3>Interface ke aur views</h3>
<ul>
<li><code>show interfaces GigabitEthernet0/0</code>: poori detail, pehli line status dobara batati hai (<code>GigabitEthernet0/0 is up, line protocol is up</code>), phir MAC address, description, IP, MTU, speed/duplex, input/output counters aur errors.</li>
<li><code>show interfaces description</code>: har interface ki ek line, status aur aapke labels ke saath. "Kaunsa port kahan jaata hai?" ke liye perfect.</li>
<li><code>show interfaces status</code> (switches): port, description, status (connected / notconnect / disabled / err-disabled), VLAN, duplex, speed aur type.</li>
<li><code>show running-config interface GigabitEthernet0/0</code>: sirf us interface ki configuration.</li>
</ul>

<div class="eg"><p><b>Lab 2 ka worked example.</b> Shuru karne se pehle R1 ka Gi0/0 <code>administratively down down</code> dikhata hai aur SW1 ka Gi0/1 (dusra end) <code>down down</code> dikhata hai kyunki router side off hai. Aap R1 par address aur <code>no shutdown</code> configure karte ho. Dono ends <code>up up</code> ho jaate hain. R1 par <code>show ip interface brief</code> ab method <code>manual</code> ke saath 192.168.10.1 dikhata hai. Reload ke baad yeh <code>NVRAM</code> bolega, kyunki address startup-config se aaya.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Router par <code>no shutdown</code> bhool jaana. <code>ip address 192.168.10.1/24</code> type karna (IOS ko dotted mask chahiye). Sahi interface mein dobara enter na karne ki wajah se address galat interface par laga dena. Yeh maan lena ki <code>up/up</code> ka matlab IP sahi hai: status address ya mask ke baare mein kuch nahi batata.</p></div>

<div class="exam"><p><b>Exam traps.</b> "administratively down" ka matlab hamesha <code>shutdown</code> command hai. down/down Layer 1 ki taraf ishara karta hai. up/down Layer 2 ki taraf. Router interfaces default mein shutdown hote hain; switch ports default mein no shutdown. Interface ka naam hardware type batata hai, negotiate hui speed nahi.</p></div>

<div class="scn"><h4>Nayi branch jo up hi nahi ho rahi thi</h4><p>Ek branch router rack hua aur WAN team ne "link down" report kiya. Engineer ne <code>show ip interface brief</code> check kiya: LAN interface <code>administratively down</code> tha aur WAN interface <code>down down</code>. <code>no shutdown</code> se LAN theek ho gaya. WAN ke liye, <code>show interfaces</code> mein koi input tha hi nahi; provider ke box par fibre patch lead galat port mein thi. Re-patch karne ke baad woh <code>up up</code> ho gaya aur branch online aa gayi.</p><p><b>Seekh:</b> <code>show ip interface brief</code> ke do columns batate hain ki kaunsi layer fix karni hai. Kuch bhi chhoone se pehle unhe padho.</p></div>

<div class="iv"><p class="q">"Ek interface up/down dikha raha hai. Isse kya pata chalta hai aur aap kya check karoge?"</p><p>Strong answer: Layer 1 theek hai (signal hai) lekin Layer 2 nahi: serial links par encapsulation ya keepalive mismatch ya clock missing; Ethernet par far end par err-disabled ya negotiation problem. Ise administratively down (kisi ne shutdown type kiya) aur down/down (cable ya far end) se compare karo. <code>show interfaces</code>, far-end configuration aur logs check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interface naam type plus position hote hain: <code>GigabitEthernet0/0</code>, <code>FastEthernet0/1</code>, <code>GigabitEthernet1/0/24</code>.</li>
<li>Router interface setup: <code>description</code>, <code>ip address A.B.C.D mask</code>, <code>no shutdown</code>.</li>
<li>Router interfaces default mein shut hote hain; switch ports default mein enabled.</li>
<li>Status = Layer 1, Protocol = Layer 2: admin down, down/down, up/down, up/up har ek alag fix ki taraf ishara karta hai.</li>
<li><code>show interfaces description</code> aur <code>show interfaces status</code> "kya kahan laga hai?" ka jawab dete hain.</li>
</ul></div>
`}};export{e as default};