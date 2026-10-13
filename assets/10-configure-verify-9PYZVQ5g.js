var e={id:`configure`,h:{en:`Configure and verify: router interfaces and Windows, Linux, macOS clients`,hi:`Configure aur verify: router interfaces aur Windows, Linux, macOS clients`},body:{en:`
<p>A plan on paper is worth nothing until the router and every host carry it correctly. This chapter walks through the configuration lab <b>Subnet the branch office</b> step by step, then shows how to check the same settings on real Windows, Linux and macOS machines, because in the field you verify from both ends.</p>

<h3>An analogy: plates on doors, directions for residents</h3>
<p>Addressing a subnet has two halves. First you fix the number plate on the building's own gate (the router interface, which becomes the default gateway). Then you tell every resident their house number, which part of the street is theirs, and where the post office is (IP, mask, gateway on each host). Miss either half and the post does not arrive.</p>

<h3>Lab walkthrough, part 1: the router</h3>
<p>The plan from chapter 6: Sales 192.168.50.0/26 on Gi0/0, HR 192.168.50.64/26 on Gi0/1, IT 192.168.50.128/26 on Gi0/2. R1 takes the first usable address of each. Router interfaces start administratively down, so each needs <code>no shutdown</code>.</p>
<pre class="code">enable
configure terminal
interface GigabitEthernet0/0
 <span class="c">! Sales: first usable of 192.168.50.0/26</span>
 ip address 192.168.50.1 255.255.255.192
 no shutdown
interface GigabitEthernet0/1
 <span class="c">! HR: first usable of 192.168.50.64/26</span>
 ip address 192.168.50.65 255.255.255.192
 no shutdown
interface GigabitEthernet0/2
 <span class="c">! IT: first usable of 192.168.50.128/26</span>
 ip address 192.168.50.129 255.255.255.192
 no shutdown
end</pre>
<pre class="out">R1#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.50.1    YES manual up                    up</span>
GigabitEthernet0/1     192.168.50.65   YES manual up                    up
GigabitEthernet0/2     192.168.50.129  YES manual up                    up
GigabitEthernet0/3     unassigned      YES unset  administratively down down

R1#show ip route connected
      192.168.50.0/24 is variably subnetted, 6 subnets, 2 masks
<span class="hl">C        192.168.50.0/26 is directly connected, GigabitEthernet0/0</span>
L        192.168.50.1/32 is directly connected, GigabitEthernet0/0
C        192.168.50.64/26 is directly connected, GigabitEthernet0/1
L        192.168.50.65/32 is directly connected, GigabitEthernet0/1
C        192.168.50.128/26 is directly connected, GigabitEthernet0/2
L        192.168.50.129/32 is directly connected, GigabitEthernet0/2</pre>
<p>Read it like an engineer: each interface is <b>up/up</b> with the right address; the router computed each <b>C</b> (connected) network from address and mask, exactly as you did with the block size; each <b>L</b> (local) /32 is the router's own address. "2 masks" means /26 and /32. If a C line shows the wrong network, your mask is wrong.</p>

<h3>Lab walkthrough, part 2: the hosts</h3>
<p>Each PC takes the last usable address and its own subnet's gateway. The lab host shell uses <code>ip ADDRESS/PREFIX GATEWAY</code>:</p>
<pre class="code">PC-SALES&gt; ip 192.168.50.62/26 192.168.50.1
PC-HR&gt; ip 192.168.50.126/26 192.168.50.65
PC-IT&gt; ip 192.168.50.190/26 192.168.50.129</pre>
<pre class="out">PC-SALES&gt; show ip
NAME        : PC-SALES[1]
<span class="hl">IP/MASK     : 192.168.50.62/26</span>
<span class="hl">GATEWAY     : 192.168.50.1</span>
MAC         : 00:50:4c:ba:36:01

PC-SALES&gt; ping 192.168.50.126
84 bytes from 192.168.50.126 icmp_seq=1 ttl=63 time=0.500 ms</pre>
<p>The <b>ttl=63</b> is a nice clue: the reply started at 64 and one router (R1) decremented it, proving the packet was routed between subnets. Ping 192.168.50.190 the same way to finish task 3. For task 4, the growth subnet 192.168.50.192/26 has broadcast <b>192.168.50.255</b>.</p>

<h3>Verifying real clients</h3>
<p><b>Windows.</b> Set a static address in the adapter settings or with <code>netsh interface ipv4 set address name="Ethernet" static 192.168.50.62 255.255.255.192 192.168.50.1</code>. Verify with <code>ipconfig</code> (add <code>/all</code> for MAC, DHCP status and DNS):</p>
<pre class="out">C:&#92;&gt;ipconfig
Ethernet adapter Ethernet:
   <span class="hl">IPv4 Address. . . . . . . . . . . : 192.168.50.62</span>
   <span class="hl">Subnet Mask . . . . . . . . . . . : 255.255.255.192</span>
   Default Gateway . . . . . . . . . : 192.168.50.1</pre>
<p><b>Linux.</b> <code>sudo ip addr add 192.168.50.126/26 dev eth0</code> and <code>sudo ip route add default via 192.168.50.65</code> (temporary; make it permanent in NetworkManager or netplan). Verify with <code>ip addr</code> and <code>ip route</code>. Linux even prints the broadcast it calculated:</p>
<pre class="out">$ ip addr show eth0
    <span class="hl">inet 192.168.50.126/26 brd 192.168.50.127 scope global eth0</span>
$ ip route
default via 192.168.50.65 dev eth0
192.168.50.64/26 dev eth0 proto kernel scope link src 192.168.50.126</pre>
<p><b>macOS.</b> <code>networksetup -setmanual "Ethernet" 192.168.50.190 255.255.255.192 192.168.50.129</code>, then verify. Note that <code>ifconfig</code> shows the mask in hexadecimal: 0xffffffc0 is 255.255.255.192 (c0 = 192):</p>
<pre class="out">% ifconfig en0
	<span class="hl">inet 192.168.50.190 netmask 0xffffffc0 broadcast 192.168.50.191</span>
% route -n get default
    gateway: 192.168.50.129</pre>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Verify from both ends">
<rect x="20" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="13">Host</text><text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="12">ipconfig / ip addr / ifconfig</text>
<rect x="230" y="30" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Compare</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">same subnet? same mask?</text>
<rect x="440" y="30" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">show ip int brief / route</text>
<line x1="200" y1="60" x2="230" y2="60" stroke="#64748b"/><line x1="410" y1="60" x2="440" y2="60" stroke="#64748b"/>
</svg><p class="cap">The host's gateway must be the router interface's address, and both must use the same mask.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>no shutdown</code> (status stays "administratively down"); giving a host a gateway from another subnet (the lab shell answers <code>Gateway is not in the same subnet</code>, Linux answers <code>Error: Nexthop has invalid gateway.</code>, Windows only warns); and typing an overlapping address on a second router interface, which the router rejects with <code>% ... overlaps with ...</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know which tool belongs to which OS: <code>ipconfig</code> is Windows; <code>ip addr</code> is modern Linux (<code>ifconfig</code> is legacy there but still standard on macOS). A question showing "netmask 0xffffff00" is macOS output and means /24.</p></div>

<div class="scn"><h4>The new router that answered nobody</h4><p>A field engineer replaced a branch router at night, pasted the three interface addresses from the plan, and left. Next morning no department could reach its gateway. <code>show ip interface brief</code> showed every address correct but status "administratively down": the paste had not included <code>no shutdown</code>. The remote engineer added it on each interface and the C routes appeared immediately.</p><p><b>Lesson:</b> verify with <code>show ip interface brief</code> and <code>show ip route connected</code> every time, not only when something breaks.</p></div>

<div class="iv"><p class="q">"How do you check a host's IP settings on Windows, Linux and macOS, and what do you compare them with?"</p><p>Strong answer: Windows <code>ipconfig</code> or <code>ipconfig /all</code>; Linux <code>ip addr</code> and <code>ip route</code>; macOS <code>ifconfig</code> (mask in hex) plus <code>route -n get default</code> or <code>netstat -rn</code>. Then compare with the router: the gateway must equal the router interface's address, the host must be inside that interface's connected network, and the masks must match.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router: <code>ip address</code> plus <code>no shutdown</code>; verify with <code>show ip interface brief</code> and <code>show ip route connected</code>.</li>
<li>C routes show the network the router computed; L routes are its own /32 addresses.</li>
<li>Hosts need address, mask and a gateway inside their own subnet.</li>
<li>Windows <code>ipconfig</code>, Linux <code>ip addr</code>/<code>ip route</code>, macOS <code>ifconfig</code> (hex mask) and <code>route -n get default</code>.</li>
<li>A reply with ttl=63 from another subnet proves one router hop.</li>
</ul></div>
`,hi:`
<p>Kaagaz par plan tab tak bekaar hai jab tak router aur har host use sahi se na chalayein. Yeh chapter configuration lab <b>Subnet the branch office</b> ko step by step chalata hai, phir dikhata hai ki wahi settings asli Windows, Linux aur macOS machines par kaise check karein, kyunki field mein aap dono siron se verify karte ho.</p>

<h3>Ek analogy: darwazon par plates, residents ko directions</h3>
<p>Subnet ko address karne ke do hisse hain. Pehle aap building ke apne gate par number plate lagate ho (router interface, jo default gateway banta hai). Phir aap har resident ko uska house number, gali ka kaunsa hissa uska hai, aur post office kahan hai batate ho (har host par IP, mask, gateway). Koi bhi hissa chhoot jaaye to daak nahi pahunchti.</p>

<h3>Lab walkthrough, part 1: router</h3>
<p>Chapter 6 ka plan: Sales 192.168.50.0/26 Gi0/0 par, HR 192.168.50.64/26 Gi0/1 par, IT 192.168.50.128/26 Gi0/2 par. R1 har ek ka pehla usable address leta hai. Router interfaces administratively down se shuru hote hain, isliye har ek ko <code>no shutdown</code> chahiye.</p>
<pre class="code">enable
configure terminal
interface GigabitEthernet0/0
 <span class="c">! Sales: 192.168.50.0/26 ka pehla usable</span>
 ip address 192.168.50.1 255.255.255.192
 no shutdown
interface GigabitEthernet0/1
 <span class="c">! HR: 192.168.50.64/26 ka pehla usable</span>
 ip address 192.168.50.65 255.255.255.192
 no shutdown
interface GigabitEthernet0/2
 <span class="c">! IT: 192.168.50.128/26 ka pehla usable</span>
 ip address 192.168.50.129 255.255.255.192
 no shutdown
end</pre>
<pre class="out">R1#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.50.1    YES manual up                    up</span>
GigabitEthernet0/1     192.168.50.65   YES manual up                    up
GigabitEthernet0/2     192.168.50.129  YES manual up                    up
GigabitEthernet0/3     unassigned      YES unset  administratively down down

R1#show ip route connected
      192.168.50.0/24 is variably subnetted, 6 subnets, 2 masks
<span class="hl">C        192.168.50.0/26 is directly connected, GigabitEthernet0/0</span>
L        192.168.50.1/32 is directly connected, GigabitEthernet0/0
C        192.168.50.64/26 is directly connected, GigabitEthernet0/1
L        192.168.50.65/32 is directly connected, GigabitEthernet0/1
C        192.168.50.128/26 is directly connected, GigabitEthernet0/2
L        192.168.50.129/32 is directly connected, GigabitEthernet0/2</pre>
<p>Ise engineer ki tarah padho: har interface sahi address ke saath <b>up/up</b> hai; router ne har <b>C</b> (connected) network address aur mask se nikaala, bilkul waise jaise aapne block size se kiya; har <b>L</b> (local) /32 router ka apna address hai. "2 masks" ka matlab /26 aur /32. Agar kisi C line mein galat network dikhe, to aapka mask galat hai.</p>

<h3>Lab walkthrough, part 2: hosts</h3>
<p>Har PC aakhri usable address aur apne subnet ka gateway leta hai. Lab host shell <code>ip ADDRESS/PREFIX GATEWAY</code> use karta hai:</p>
<pre class="code">PC-SALES&gt; ip 192.168.50.62/26 192.168.50.1
PC-HR&gt; ip 192.168.50.126/26 192.168.50.65
PC-IT&gt; ip 192.168.50.190/26 192.168.50.129</pre>
<pre class="out">PC-SALES&gt; show ip
NAME        : PC-SALES[1]
<span class="hl">IP/MASK     : 192.168.50.62/26</span>
<span class="hl">GATEWAY     : 192.168.50.1</span>
MAC         : 00:50:4c:ba:36:01

PC-SALES&gt; ping 192.168.50.126
84 bytes from 192.168.50.126 icmp_seq=1 ttl=63 time=0.500 ms</pre>
<p><b>ttl=63</b> ek achha clue hai: reply 64 se shuru hua aur ek router (R1) ne use ek kam kiya, jo saabit karta hai ki packet subnets ke beech route hua. Task 3 poora karne ke liye isi tarah 192.168.50.190 ping karo. Task 4 ke liye, growth subnet 192.168.50.192/26 ka broadcast <b>192.168.50.255</b> hai.</p>

<h3>Asli clients verify karna</h3>
<p><b>Windows.</b> Adapter settings mein ya <code>netsh interface ipv4 set address name="Ethernet" static 192.168.50.62 255.255.255.192 192.168.50.1</code> se static address set karo. <code>ipconfig</code> se verify karo (MAC, DHCP status aur DNS ke liye <code>/all</code> jodo):</p>
<pre class="out">C:&#92;&gt;ipconfig
Ethernet adapter Ethernet:
   <span class="hl">IPv4 Address. . . . . . . . . . . : 192.168.50.62</span>
   <span class="hl">Subnet Mask . . . . . . . . . . . : 255.255.255.192</span>
   Default Gateway . . . . . . . . . : 192.168.50.1</pre>
<p><b>Linux.</b> <code>sudo ip addr add 192.168.50.126/26 dev eth0</code> aur <code>sudo ip route add default via 192.168.50.65</code> (temporary; NetworkManager ya netplan mein permanent karo). <code>ip addr</code> aur <code>ip route</code> se verify karo. Linux to apna nikaala hua broadcast bhi print karta hai:</p>
<pre class="out">$ ip addr show eth0
    <span class="hl">inet 192.168.50.126/26 brd 192.168.50.127 scope global eth0</span>
$ ip route
default via 192.168.50.65 dev eth0
192.168.50.64/26 dev eth0 proto kernel scope link src 192.168.50.126</pre>
<p><b>macOS.</b> <code>networksetup -setmanual "Ethernet" 192.168.50.190 255.255.255.192 192.168.50.129</code>, phir verify karo. Dhyan do ki <code>ifconfig</code> mask hexadecimal mein dikhata hai: 0xffffffc0 matlab 255.255.255.192 (c0 = 192):</p>
<pre class="out">% ifconfig en0
	<span class="hl">inet 192.168.50.190 netmask 0xffffffc0 broadcast 192.168.50.191</span>
% route -n get default
    gateway: 192.168.50.129</pre>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Dono siron se verify karo">
<rect x="20" y="30" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="13">Host</text><text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="12">ipconfig / ip addr / ifconfig</text>
<rect x="230" y="30" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Milao</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">same subnet? same mask?</text>
<rect x="440" y="30" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">show ip int brief / route</text>
<line x1="200" y1="60" x2="230" y2="60" stroke="#64748b"/><line x1="410" y1="60" x2="440" y2="60" stroke="#64748b"/>
</svg><p class="cap">Host ka gateway router interface ka address hona chahiye, aur dono ka mask same hona chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>no shutdown</code> bhool jaana (status "administratively down" hi rehta hai); host ko doosre subnet ka gateway dena (lab shell <code>Gateway is not in the same subnet</code> kehta hai, Linux <code>Error: Nexthop has invalid gateway.</code> kehta hai, Windows sirf warning deta hai); aur doosre router interface par overlapping address type karna, jise router <code>% ... overlaps with ...</code> ke saath reject karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Kaunsa tool kis OS ka hai yeh jaano: <code>ipconfig</code> Windows hai; <code>ip addr</code> modern Linux hai (<code>ifconfig</code> wahan legacy hai lekin macOS par ab bhi standard hai). "netmask 0xffffff00" dikhane wala question macOS output hai aur iska matlab /24 hai.</p></div>

<div class="scn"><h4>Naya router jo kisi ko jawab nahi deta tha</h4><p>Ek field engineer ne raat mein branch router badla, plan se teeno interface addresses paste kiye, aur chala gaya. Agli subah koi department apne gateway tak nahi pahunch pa raha tha. <code>show ip interface brief</code> mein har address sahi tha lekin status "administratively down": paste mein <code>no shutdown</code> tha hi nahi. Remote engineer ne har interface par use joda aur C routes turant aa gaye.</p><p><b>Seekh:</b> har baar <code>show ip interface brief</code> aur <code>show ip route connected</code> se verify karo, sirf tab nahi jab kuch toote.</p></div>

<div class="iv"><p class="q">"Windows, Linux aur macOS par host ki IP settings kaise check karte ho, aur unhe kisse milate ho?"</p><p>Strong answer: Windows <code>ipconfig</code> ya <code>ipconfig /all</code>; Linux <code>ip addr</code> aur <code>ip route</code>; macOS <code>ifconfig</code> (mask hex mein) plus <code>route -n get default</code> ya <code>netstat -rn</code>. Phir router se milao: gateway router interface ke address ke barabar hona chahiye, host us interface ke connected network ke andar hona chahiye, aur masks match hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router: <code>ip address</code> plus <code>no shutdown</code>; <code>show ip interface brief</code> aur <code>show ip route connected</code> se verify karo.</li>
<li>C routes woh network dikhate hain jo router ne nikaala; L routes uske apne /32 addresses hain.</li>
<li>Hosts ko address, mask aur apne hi subnet ke andar ka gateway chahiye.</li>
<li>Windows <code>ipconfig</code>, Linux <code>ip addr</code>/<code>ip route</code>, macOS <code>ifconfig</code> (hex mask) aur <code>route -n get default</code>.</li>
<li>Doosre subnet se ttl=63 wala reply ek router hop saabit karta hai.</li>
</ul></div>
`}};export{e as default};