var e={id:`configure-verify`,h:{en:`Configure and verify: router interfaces and client PCs`,hi:`Configure aur verify: router interfaces aur client PCs`},body:{en:`
<p>A plan on paper is like a seating chart for a wedding: useful only if every guest actually sits in the right chair. This chapter is about putting addresses on real devices and, more importantly, <b>checking</b> what each device really believes. Every device holds four IPv4 facts: <b>address</b>, <b>mask</b>, <b>default gateway</b> and <b>DNS server</b>. Routers have the first two per interface; hosts need all four. You will learn the exact commands on Cisco IOS, on the lab PCs, and on Windows, macOS and Linux (blueprint item 1.10).</p>

<h3>Router interfaces on Cisco IOS</h3>
<pre class="code">R2(config)# interface GigabitEthernet0/1
R2(config-if)# description LAN-B 50 hosts
R2(config-if)# ip address 192.168.50.129 255.255.255.192
R2(config-if)# no shutdown</pre>
<ul>
<li><code>ip address</code> takes the <b>dotted mask</b>. Entering it again <b>replaces</b> the primary address; you do not need <code>no ip address</code> first. The troubleshooting lab fix relies on this.</li>
<li>A second subnet on the same interface needs the <code>secondary</code> keyword; without it you overwrite the first.</li>
<li>Router interfaces are shut down by default: forgetting <code>no shutdown</code> leaves the connected route missing.</li>
</ul>

<h3>Verifying on the router</h3>
<pre class="out">R2# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.50.226  YES manual up                    up
GigabitEthernet0/1     192.168.50.129  YES manual up                    up
GigabitEthernet0/2     192.168.50.193  YES manual up                    up</pre>
<p>This is the fastest overview, but it shows <b>no mask</b>. A wrong mask is invisible here. To see the mask:</p>
<pre class="out">R1# show ip interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
<span class="hl">  Internet address is 10.20.30.1/28</span>
  Broadcast address is 255.255.255.255
  Address determined by setup command
  MTU is 1500 bytes</pre>
<p>Also useful: <code>show running-config interface GigabitEthernet0/1</code> (the dotted mask as configured) and <code>show ip route connected</code> (the resulting C and L routes). The "Broadcast address is 255.255.255.255" line is the address the interface uses for its own broadcasts, not the subnet's directed broadcast; do not let it confuse you.</p>

<h3>Switches: a management address</h3>
<p>A Layer 2 switch has one IP address for management, on an SVI, plus a default gateway so you can reach it from other subnets:</p>
<pre class="code">SW1(config)# interface vlan 1
SW1(config-if)# ip address 10.20.30.2 255.255.255.192
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# ip default-gateway 10.20.30.1</pre>

<h3>The lab PCs</h3>
<p>The simulator PCs use a one-line syntax: address with prefix, then gateway. For Lab 1:</p>
<pre class="code">PCA&gt; ip 192.168.50.126/25 192.168.50.1</pre>

<h3>Windows</h3>
<pre class="out">C:\\&gt; ipconfig /all
Ethernet adapter Ethernet:
   Physical Address. . . . . . . . . : 52-54-00-12-34-56
   DHCP Enabled. . . . . . . . . . . : No
<span class="hl">   IPv4 Address. . . . . . . . . . . : 192.168.50.126(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.128
   Default Gateway . . . . . . . . . : 192.168.50.1</span>
   DNS Servers . . . . . . . . . . . : 192.168.50.10</pre>
<p><code>ipconfig</code> alone shows address, mask and gateway; <code>/all</code> adds MAC, DHCP status, lease times and DNS. <code>ipconfig /release</code> and <code>/renew</code> redo DHCP. <code>route print</code> shows the routing table. A DHCP failure appears as "Autoconfiguration IPv4 Address . . : 169.254.x.x".</p>

<h3>macOS</h3>
<pre class="out">% ifconfig en0 | grep "inet "
<span class="hl">	inet 192.168.50.126 netmask 0xffffff80 broadcast 192.168.50.127</span>
% networksetup -getinfo "Wi-Fi"
Manual Configuration
IP address: 192.168.50.126
Subnet mask: 255.255.255.128
Router: 192.168.50.1
% netstat -rn -f inet | grep default
default            192.168.50.1       UGScg                 en0</pre>
<p>Note the <b>hex mask</b>: <code>0xffffff80</code> = ff.ff.ff.80 = 255.255.255.128. <code>ipconfig getifaddr en0</code> prints just the address, and <code>scutil --dns</code> lists DNS servers.</p>

<h3>Linux</h3>
<pre class="out">$ ip -4 addr show dev eth0
2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP group default qlen 1000
<span class="hl">    inet 192.168.50.126/25 brd 192.168.50.127 scope global eth0</span>
       valid_lft forever preferred_lft forever
$ ip route
<span class="hl">default via 192.168.50.1 dev eth0 proto static</span>
192.168.50.0/25 dev eth0 proto kernel scope link src 192.168.50.126</pre>
<p>Linux shows the prefix and even computes the broadcast (<code>brd</code>) for you. The second route line is the connected subnet, the Linux equivalent of a router's C route. DNS: <code>resolvectl status</code> on systemd systems, or <code>cat /etc/resolv.conf</code>. The old <code>ifconfig</code> and <code>route -n</code> still exist on many systems but <code>ip</code> is the current tool.</p>

<table class="cmp"><tr><th>Check</th><th>Windows</th><th>macOS</th><th>Linux</th></tr>
<tr><td>Address and mask</td><td>ipconfig</td><td>ifconfig en0</td><td>ip addr</td></tr>
<tr><td>Gateway</td><td>ipconfig / route print</td><td>netstat -rn, networksetup -getinfo</td><td>ip route</td></tr>
<tr><td>DNS</td><td>ipconfig /all</td><td>scutil --dns</td><td>resolvectl status</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Four parameters every host needs">
<rect x="20" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">Address</text><text x="90" y="73" text-anchor="middle" class="svg-muted" font-size="12">who am I</text>
<rect x="175" y="30" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="13">Mask</text><text x="245" y="73" text-anchor="middle" class="svg-muted" font-size="12">who is local</text>
<rect x="330" y="30" width="140" height="56" rx="8" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text><text x="400" y="73" text-anchor="middle" class="svg-muted" font-size="12">way out</text>
<rect x="485" y="30" width="135" height="56" rx="8" fill="#ddd6fe"/><text x="552" y="55" text-anchor="middle" class="svg-ink" font-size="13">DNS</text><text x="552" y="73" text-anchor="middle" class="svg-muted" font-size="12">names to IPs</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">verify all four on every host; each fails differently</text>
</svg><p class="cap">The four host parameters. The gateway must be inside the host's own subnet.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trusting <code>show ip interface brief</code> to prove addressing is right (no mask shown). Misreading the macOS hex mask. Configuring a second address without <code>secondary</code> and wiping the first. On Windows, an address marked "(Duplicate)" instead of "(Preferred)" means another device already uses it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint 1.10 expects you to read client output and spot the wrong parameter. Typical question: the output shows a gateway outside the host's subnet, or a mask that does not match the router. Check that the gateway falls inside the host's block.</p></div>

<div class="scn"><h4>The Mac with no way out</h4><p>A designer's MacBook was moved to a manual address for a label printer project. Local printing worked, but no website loaded. <code>networksetup -getinfo "Wi-Fi"</code> showed the IP address and subnet mask but an empty <code>Router:</code> line, and <code>netstat -rn -f inet</code> had no default entry. Without a gateway every off-subnet destination failed. Adding the router address (the first usable of the subnet) fixed it.</p><p><b>Lesson:</b> verify all four parameters. "Local works, remote fails" points straight at the gateway or the mask.</p></div>

<div class="iv"><p class="q">"How do you check a client's IP settings on Windows, macOS and Linux?"</p><p>Strong answer: Windows <code>ipconfig /all</code> for address, mask, gateway, DNS and DHCP status; macOS <code>ifconfig en0</code> (mask in hex) plus <code>netstat -rn</code> or <code>networksetup -getinfo</code> for the gateway; Linux <code>ip addr</code> and <code>ip route</code>, and <code>resolvectl status</code> for DNS. Then say what you look for: gateway inside the host's subnet, mask matching the router's interface, and no 169.254 address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS: <code>ip address</code> with a dotted mask replaces the old one; use <code>secondary</code> to add.</li>
<li><code>show ip interface brief</code> hides the mask; use <code>show ip interface</code> or the running config.</li>
<li>Windows <code>ipconfig /all</code>; macOS <code>ifconfig</code> (hex mask) and <code>netstat -rn</code>; Linux <code>ip addr</code> and <code>ip route</code>.</li>
<li>Every host needs address, mask, gateway and DNS; the gateway must be in the host's subnet.</li>
<li>Switches need a management SVI address and <code>ip default-gateway</code>.</li>
</ul></div>
`,hi:`
<p>Kaagaz par plan shaadi ke seating chart jaisa hai: tabhi kaam ka hai jab har mehmaan sach mein sahi kursi par baithe. Yeh chapter real devices par addresses lagane aur, usse bhi zaroori, yeh <b>check</b> karne ke baare mein hai ki har device asal mein kya maanta hai. Har device chaar IPv4 facts rakhta hai: <b>address</b>, <b>mask</b>, <b>default gateway</b> aur <b>DNS server</b>. Routers mein har interface par pehle do hote hain; hosts ko chaaron chahiye. Aap Cisco IOS, lab PCs, aur Windows, macOS aur Linux par exact commands seekhoge (blueprint item 1.10).</p>

<h3>Cisco IOS par router interfaces</h3>
<pre class="code">R2(config)# interface GigabitEthernet0/1
R2(config-if)# description LAN-B 50 hosts
R2(config-if)# ip address 192.168.50.129 255.255.255.192
R2(config-if)# no shutdown</pre>
<ul>
<li><code>ip address</code> <b>dotted mask</b> leta hai. Ise dobara dene se primary address <b>replace</b> ho jaata hai; pehle <code>no ip address</code> ki zaroorat nahi. Troubleshooting lab ka fix isi par depend karta hai.</li>
<li>Same interface par doosre subnet ke liye <code>secondary</code> keyword chahiye; iske bina aap pehla overwrite kar doge.</li>
<li>Router interfaces default mein shut down hote hain: <code>no shutdown</code> bhoolne se connected route gaayab rehta hai.</li>
</ul>

<h3>Router par verify karna</h3>
<pre class="out">R2# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.50.226  YES manual up                    up
GigabitEthernet0/1     192.168.50.129  YES manual up                    up
GigabitEthernet0/2     192.168.50.193  YES manual up                    up</pre>
<p>Yeh sabse tez overview hai, par isme <b>mask nahi</b> dikhta. Galat mask yahan invisible hai. Mask dekhne ke liye:</p>
<pre class="out">R1# show ip interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
<span class="hl">  Internet address is 10.20.30.1/28</span>
  Broadcast address is 255.255.255.255
  Address determined by setup command
  MTU is 1500 bytes</pre>
<p>Yeh bhi kaam ke hain: <code>show running-config interface GigabitEthernet0/1</code> (configure kiya dotted mask) aur <code>show ip route connected</code> (usse bane C aur L routes). "Broadcast address is 255.255.255.255" line woh address hai jo interface apne broadcasts ke liye use karta hai, subnet ka directed broadcast nahi; isse confuse mat hona.</p>

<h3>Switches: management address</h3>
<p>Layer 2 switch ka management ke liye ek IP address hota hai, ek SVI par, plus ek default gateway taaki aap use doosre subnets se pahunch sako:</p>
<pre class="code">SW1(config)# interface vlan 1
SW1(config-if)# ip address 10.20.30.2 255.255.255.192
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# ip default-gateway 10.20.30.1</pre>

<h3>Lab PCs</h3>
<p>Simulator PCs ek-line syntax use karte hain: prefix ke saath address, phir gateway. Lab 1 ke liye:</p>
<pre class="code">PCA&gt; ip 192.168.50.126/25 192.168.50.1</pre>

<h3>Windows</h3>
<pre class="out">C:\\&gt; ipconfig /all
Ethernet adapter Ethernet:
   Physical Address. . . . . . . . . : 52-54-00-12-34-56
   DHCP Enabled. . . . . . . . . . . : No
<span class="hl">   IPv4 Address. . . . . . . . . . . : 192.168.50.126(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.128
   Default Gateway . . . . . . . . . : 192.168.50.1</span>
   DNS Servers . . . . . . . . . . . : 192.168.50.10</pre>
<p>Akela <code>ipconfig</code> address, mask aur gateway dikhata hai; <code>/all</code> MAC, DHCP status, lease times aur DNS jodta hai. <code>ipconfig /release</code> aur <code>/renew</code> DHCP dobara karte hain. <code>route print</code> routing table dikhata hai. DHCP failure "Autoconfiguration IPv4 Address . . : 169.254.x.x" ki tarah dikhta hai.</p>

<h3>macOS</h3>
<pre class="out">% ifconfig en0 | grep "inet "
<span class="hl">	inet 192.168.50.126 netmask 0xffffff80 broadcast 192.168.50.127</span>
% networksetup -getinfo "Wi-Fi"
Manual Configuration
IP address: 192.168.50.126
Subnet mask: 255.255.255.128
Router: 192.168.50.1
% netstat -rn -f inet | grep default
default            192.168.50.1       UGScg                 en0</pre>
<p><b>Hex mask</b> par dhyan do: <code>0xffffff80</code> = ff.ff.ff.80 = 255.255.255.128. <code>ipconfig getifaddr en0</code> sirf address print karta hai, aur <code>scutil --dns</code> DNS servers list karta hai.</p>

<h3>Linux</h3>
<pre class="out">$ ip -4 addr show dev eth0
2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP group default qlen 1000
<span class="hl">    inet 192.168.50.126/25 brd 192.168.50.127 scope global eth0</span>
       valid_lft forever preferred_lft forever
$ ip route
<span class="hl">default via 192.168.50.1 dev eth0 proto static</span>
192.168.50.0/25 dev eth0 proto kernel scope link src 192.168.50.126</pre>
<p>Linux prefix dikhata hai aur broadcast (<code>brd</code>) bhi aapke liye calculate kar deta hai. Doosri route line connected subnet hai, router ke C route ka Linux equivalent. DNS: systemd systems par <code>resolvectl status</code>, ya <code>cat /etc/resolv.conf</code>. Purane <code>ifconfig</code> aur <code>route -n</code> kai systems par abhi bhi hain par current tool <code>ip</code> hai.</p>

<table class="cmp"><tr><th>Check</th><th>Windows</th><th>macOS</th><th>Linux</th></tr>
<tr><td>Address aur mask</td><td>ipconfig</td><td>ifconfig en0</td><td>ip addr</td></tr>
<tr><td>Gateway</td><td>ipconfig / route print</td><td>netstat -rn, networksetup -getinfo</td><td>ip route</td></tr>
<tr><td>DNS</td><td>ipconfig /all</td><td>scutil --dns</td><td>resolvectl status</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Chaar parameters jo har host ko chahiye">
<rect x="20" y="30" width="140" height="56" rx="8" fill="#bae6fd"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="13">Address</text><text x="90" y="73" text-anchor="middle" class="svg-muted" font-size="12">main kaun hoon</text>
<rect x="175" y="30" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="13">Mask</text><text x="245" y="73" text-anchor="middle" class="svg-muted" font-size="12">kaun local hai</text>
<rect x="330" y="30" width="140" height="56" rx="8" fill="#fde68a"/><text x="400" y="55" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text><text x="400" y="73" text-anchor="middle" class="svg-muted" font-size="12">bahar ka raasta</text>
<rect x="485" y="30" width="135" height="56" rx="8" fill="#ddd6fe"/><text x="552" y="55" text-anchor="middle" class="svg-ink" font-size="13">DNS</text><text x="552" y="73" text-anchor="middle" class="svg-muted" font-size="12">names se IPs</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">har host par chaaron verify karo; har ek alag tarah fail hota hai</text>
</svg><p class="cap">Chaar host parameters. Gateway host ke apne subnet ke andar hona chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Addressing sahi hai yeh prove karne ke liye <code>show ip interface brief</code> par bharosa karna (mask nahi dikhta). macOS hex mask galat padhna. <code>secondary</code> ke bina doosra address configure karna aur pehla mita dena. Windows par "(Preferred)" ki jagah "(Duplicate)" mark hua address matlab koi aur device use pehle se use kar raha hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint 1.10 expect karta hai ki aap client output padh kar galat parameter pakdo. Typical sawaal: output mein gateway host ke subnet ke bahar hai, ya mask router se match nahi karta. Check karo ki gateway host ke block ke andar aata hai.</p></div>

<div class="scn"><h4>Bina bahar ke raaste wala Mac</h4><p>Ek designer ke MacBook ko label printer project ke liye manual address par shift kiya gaya. Local printing chal rahi thi, par koi website load nahi hui. <code>networksetup -getinfo "Wi-Fi"</code> ne IP address aur subnet mask dikhaya par <code>Router:</code> line khaali thi, aur <code>netstat -rn -f inet</code> mein koi default entry nahi thi. Gateway ke bina har off-subnet destination fail hua. Router address (subnet ka pehla usable) jodne se theek ho gaya.</p><p><b>Seekh:</b> chaaron parameters verify karo. "Local chalta hai, remote fail" seedha gateway ya mask ki taraf ishara karta hai.</p></div>

<div class="iv"><p class="q">"Windows, macOS aur Linux par client ki IP settings kaise check karte ho?"</p><p>Strong answer: Windows <code>ipconfig /all</code> address, mask, gateway, DNS aur DHCP status ke liye; macOS <code>ifconfig en0</code> (hex mein mask) plus gateway ke liye <code>netstat -rn</code> ya <code>networksetup -getinfo</code>; Linux <code>ip addr</code> aur <code>ip route</code>, aur DNS ke liye <code>resolvectl status</code>. Phir batao aap kya dhoondte ho: gateway host ke subnet ke andar, mask router ke interface se match karta hua, aur koi 169.254 address nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IOS: dotted mask ke saath <code>ip address</code> purane ko replace karta hai; jodne ke liye <code>secondary</code> use karo.</li>
<li><code>show ip interface brief</code> mask chhupata hai; <code>show ip interface</code> ya running config use karo.</li>
<li>Windows <code>ipconfig /all</code>; macOS <code>ifconfig</code> (hex mask) aur <code>netstat -rn</code>; Linux <code>ip addr</code> aur <code>ip route</code>.</li>
<li>Har host ko address, mask, gateway aur DNS chahiye; gateway host ke subnet mein hona chahiye.</li>
<li>Switches ko management SVI address aur <code>ip default-gateway</code> chahiye.</li>
</ul></div>
`}};export{e as default};