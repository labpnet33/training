var e={id:`clients`,h:{en:`DHCP clients: routers, Windows, Linux and macOS`,hi:`DHCP clients: routers, Windows, Linux aur macOS`},body:{en:`
<p>A doctor does not only ask the hospital records what medicine a patient received; they also look at the patient. In networking, the server's binding table is the records office, and the client is the patient. Half of all DHCP troubleshooting is done on the client, so you must be fluent in reading its view on every operating system, and on a router that is itself a DHCP client.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Client verification commands per platform">
<rect x="10" y="20" width="145" height="110" rx="10" fill="#bbf7d0"/><text x="82" y="45" text-anchor="middle" class="svg-ink" font-size="14">Cisco router</text><text x="82" y="72" text-anchor="middle" class="svg-muted" font-size="12">ip address dhcp</text><text x="82" y="94" text-anchor="middle" class="svg-muted" font-size="12">show dhcp lease</text><text x="82" y="116" text-anchor="middle" class="svg-muted" font-size="12">S* AD 254</text>
<rect x="170" y="20" width="145" height="110" rx="10" fill="#bae6fd"/><text x="242" y="45" text-anchor="middle" class="svg-ink" font-size="14">Windows</text><text x="242" y="72" text-anchor="middle" class="svg-muted" font-size="12">ipconfig /all</text><text x="242" y="94" text-anchor="middle" class="svg-muted" font-size="12">/release /renew</text><text x="242" y="116" text-anchor="middle" class="svg-muted" font-size="12">DHCP Server line</text>
<rect x="330" y="20" width="145" height="110" rx="10" fill="#ddd6fe"/><text x="402" y="45" text-anchor="middle" class="svg-ink" font-size="14">Linux</text><text x="402" y="72" text-anchor="middle" class="svg-muted" font-size="12">ip addr (dynamic)</text><text x="402" y="94" text-anchor="middle" class="svg-muted" font-size="12">ip route (proto dhcp)</text><text x="402" y="116" text-anchor="middle" class="svg-muted" font-size="12">resolvectl status</text>
<rect x="490" y="20" width="140" height="110" rx="10" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="14">macOS</text><text x="560" y="72" text-anchor="middle" class="svg-muted" font-size="12">ipconfig getifaddr</text><text x="560" y="94" text-anchor="middle" class="svg-muted" font-size="12">ipconfig getpacket</text><text x="560" y="116" text-anchor="middle" class="svg-muted" font-size="12">scutil --dns</text>
</svg><p class="cap">Four places a lease lives, and the commands that show it.</p></div>

<h3>A router as a DHCP client</h3>
<p>Small branches and home-style internet links often get their public address from the ISP by DHCP. A Cisco router can be a DHCP client on any routed interface:</p>
<pre class="code"><span class="c">! edge router, Gi0/2 faces the ISP</span>
EDGE(config)# interface GigabitEthernet0/2
EDGE(config-if)# ip address dhcp
EDGE(config-if)# no shutdown
EDGE(config-if)# end
*Sep 29 10:02:11.345: %DHCP-6-ADDRESS_ASSIGN: Interface GigabitEthernet0/2 assigned DHCP address 203.0.113.46, mask 255.255.255.0, hostname EDGE</pre>
<p>The syslog message <code>%DHCP-6-ADDRESS_ASSIGN</code> is your first proof it worked. Two more things happen automatically:</p>
<ul>
<li>If the offer contains option 3, the router installs a <b>default static route with administrative distance 254</b> pointing at that gateway. AD 254 means any static default you configure yourself (AD 1) wins over it.</li>
<li><code>show ip interface brief</code> shows <b>DHCP</b> in the Method column instead of manual.</li>
</ul>
<pre class="out">EDGE# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.10.1    YES manual up                    up
<span class="hl">GigabitEthernet0/2     203.0.113.46    YES DHCP   up                    up</span>

EDGE# show ip route static
Gateway of last resort is 203.0.113.1 to network 0.0.0.0
<span class="hl">S*    0.0.0.0/0 [254/0] via 203.0.113.1</span>

EDGE# show dhcp lease
Temp IP addr: 203.0.113.46  for peer on Interface: GigabitEthernet0/2
Temp  sub net mask: 255.255.255.0
   DHCP Lease server: 203.0.113.1, state: 5 Bound
   DHCP transaction id: 1A2B
   <span class="hl">Lease: 86400 secs,  Renewal: 43200 secs,  Rebind: 75600 secs</span>
Temp default-gateway addr: 203.0.113.1
   Next timer fires after: 11:59:48
   Retry count: 0   Client-ID: cisco-5254.0012.3456-Gi0/2
   Hostname: EDGE</pre>
<p>Look at the lease line: 86400 seconds is one day, renewal (T1) at 43200 (50%), rebind (T2) at 75600 (87.5%), exactly the timers from chapter 3.</p>

<h3>Windows</h3>
<pre class="out">C:\\&gt; ipconfig /all
Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : nwk.lab
   Physical Address. . . . . . . . . : 00-50-79-66-68-01
   <span class="hl">DHCP Enabled. . . . . . . . . . . : Yes</span>
   IPv4 Address. . . . . . . . . . . : 192.168.10.22(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Tuesday, 29 September 2026 09:15:02
   Lease Expires . . . . . . . . . . : Thursday, 1 October 2026 21:15:02
   Default Gateway . . . . . . . . . : 192.168.10.1
   <span class="hl">DHCP Server . . . . . . . . . . . : 192.168.10.1</span>
   DNS Servers . . . . . . . . . . . : 10.1.100.53</pre>
<p>Everything you need is here: DHCP enabled, the address, the gateway, the DNS server, the domain suffix (option 15), the lease window (2 days 12 hours, matching <code>lease 2 12</code>) and <b>which DHCP server answered</b>. That last line is how you catch a rogue server. Useful commands: <code>ipconfig /release</code> (sends DHCPRELEASE), <code>ipconfig /renew</code> (starts a new request), and <code>ipconfig /flushdns</code> for the DNS cache.</p>

<h3>Linux</h3>
<pre class="out">$ ip -4 addr show eth0
2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.10.23/24 metric 100 brd 192.168.10.255 scope global <span class="hl">dynamic</span> eth0
       valid_lft 215983sec preferred_lft 215983sec

$ ip route
<span class="hl">default via 192.168.10.1 dev eth0 proto dhcp</span> src 192.168.10.23 metric 100
192.168.10.0/24 dev eth0 proto kernel scope link src 192.168.10.23 metric 100

$ resolvectl status eth0
Link 2 (eth0)
    Current Scopes: DNS
Current DNS Server: 10.1.100.53
       DNS Servers: 10.1.100.53
        DNS Domain: nwk.lab</pre>
<p>The word <b>dynamic</b> and the <b>valid_lft</b> countdown show a DHCP lease; <b>proto dhcp</b> on the default route shows the gateway came from option 3. On systems with systemd-resolved, <code>/etc/resolv.conf</code> points at 127.0.0.53, the local stub resolver, so use <code>resolvectl status</code> to see the real DNS servers. To renew: <code>sudo networkctl renew eth0</code> on systemd-networkd, or <code>sudo dhclient -r eth0</code> then <code>sudo dhclient eth0</code> where dhclient is used.</p>

<h3>macOS</h3>
<pre class="out">$ ipconfig getifaddr en0
192.168.10.24
$ ipconfig getpacket en0
op = BOOTREPLY
yiaddr = 192.168.10.24
<span class="hl">server_identifier (ip): 192.168.10.1</span>
lease_time (uint32): 0x34bc0
subnet_mask (ip): 255.255.255.0
router (ip_mult): {192.168.10.1}
domain_name_server (ip_mult): {10.1.100.53}
domain_name (string): nwk.lab</pre>
<p><code>ipconfig getpacket</code> shows the actual last DHCP reply, option by option (0x34bc0 = 216000 seconds = 2.5 days). <code>scutil --dns</code> lists the resolvers in use.</p>

<h3>The lab PCs</h3>
<pre class="code">PC3&gt; ip dhcp
DDORA IP 192.168.20.21/24 GW 192.168.20.1
PC3&gt; show ip</pre>
<p>The lab PC's <code>show ip</code> displays the address, gateway, DNS server and the DHCP server it got the lease from; <code>ip dhcp -x</code> releases the lease.</p>

<div class="eg"><p><b>Worked example: reading one line.</b> A user in the annex sends you: "IPv4 Address 192.168.20.22, Gateway 192.168.20.1, DHCP Server 10.1.12.1, DNS 10.1.100.53". That tells you the lease was relayed (the server is not on the local subnet), the pool is LAN20, and the DNS option is correct. If instead the DHCP Server line had shown 192.168.20.254, you would look for an unauthorised server in the annex.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring <code>ip address dhcp</code> and also a manual <code>ip route 0.0.0.0 0.0.0.0</code>, then wondering why the DHCP default is not in the table (AD 1 beats 254). Forgetting <code>no shutdown</code> on the DHCP client interface. On Linux, reading 127.0.0.53 in resolv.conf and concluding DNS is misconfigured.</p></div>
<div class="exam"><p><b>Exam trap.</b> Router DHCP client = <code>ip address dhcp</code> in interface mode. The learned default route has AD <b>254</b>. The blueprint asks you to verify IP parameters for Windows, Mac OS and Linux: know <code>ipconfig /all</code>, <code>ip addr</code>/<code>ip route</code>, and <code>ifconfig</code>/<code>ipconfig getpacket</code> on macOS.</p></div>

<div class="scn"><h4>The branch that lost the internet at midnight</h4><p>A branch router got its ISP address by DHCP. Someone had also added <code>ip route 0.0.0.0 0.0.0.0 203.0.113.1</code> "to be safe". Months later the ISP renumbered; the router's DHCP lease moved to 198.51.100.0/24 with a new gateway, but the old static default (AD 1) still pointed at 203.0.113.1, now unreachable. <code>show ip route</code> showed only the static S* route. Removing the manual static let the DHCP-learned AD 254 default take over.</p><p><b>Lesson:</b> on a DHCP-learned uplink, let DHCP supply the default route, or track the static one.</p></div>

<div class="iv"><p class="q">"How do you check what a Windows client received from DHCP, and how would you spot a rogue DHCP server?"</p><p><code>ipconfig /all</code>: DHCP Enabled, IPv4 address, mask, gateway, DNS servers, suffix, lease obtained/expires and the DHCP Server line. If the DHCP Server or gateway is an address you do not own, a rogue server answered. Then run <code>ipconfig /release</code> and <code>/renew</code> after removing it, and mention DHCP snooping as prevention.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip address dhcp</code> makes a router interface a DHCP client; a default route with AD 254 is installed from option 3.</li>
<li>Verify on routers with <code>%DHCP-6-ADDRESS_ASSIGN</code>, <code>show ip interface brief</code> (Method DHCP) and <code>show dhcp lease</code>.</li>
<li>Windows: <code>ipconfig /all</code>, <code>/release</code>, <code>/renew</code>; the DHCP Server line exposes rogue servers.</li>
<li>Linux: <code>ip addr</code> (dynamic), <code>ip route</code> (proto dhcp), <code>resolvectl status</code>.</li>
<li>macOS: <code>ipconfig getifaddr</code>, <code>ipconfig getpacket</code>, <code>scutil --dns</code>.</li>
</ul></div>
`,hi:`
<p>Doctor sirf hospital records se nahi poochta ki patient ko kaunsi dawai mili; woh patient ko bhi dekhta hai. Networking mein server ki binding table records office hai, aur client patient hai. DHCP troubleshooting ka aadha kaam client par hota hai, isliye aapko har operating system par uska view padhne mein fluent hona chahiye, aur us router par bhi jo khud DHCP client hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Har platform ke client verification commands">
<rect x="10" y="20" width="145" height="110" rx="10" fill="#bbf7d0"/><text x="82" y="45" text-anchor="middle" class="svg-ink" font-size="14">Cisco router</text><text x="82" y="72" text-anchor="middle" class="svg-muted" font-size="12">ip address dhcp</text><text x="82" y="94" text-anchor="middle" class="svg-muted" font-size="12">show dhcp lease</text><text x="82" y="116" text-anchor="middle" class="svg-muted" font-size="12">S* AD 254</text>
<rect x="170" y="20" width="145" height="110" rx="10" fill="#bae6fd"/><text x="242" y="45" text-anchor="middle" class="svg-ink" font-size="14">Windows</text><text x="242" y="72" text-anchor="middle" class="svg-muted" font-size="12">ipconfig /all</text><text x="242" y="94" text-anchor="middle" class="svg-muted" font-size="12">/release /renew</text><text x="242" y="116" text-anchor="middle" class="svg-muted" font-size="12">DHCP Server line</text>
<rect x="330" y="20" width="145" height="110" rx="10" fill="#ddd6fe"/><text x="402" y="45" text-anchor="middle" class="svg-ink" font-size="14">Linux</text><text x="402" y="72" text-anchor="middle" class="svg-muted" font-size="12">ip addr (dynamic)</text><text x="402" y="94" text-anchor="middle" class="svg-muted" font-size="12">ip route (proto dhcp)</text><text x="402" y="116" text-anchor="middle" class="svg-muted" font-size="12">resolvectl status</text>
<rect x="490" y="20" width="140" height="110" rx="10" fill="#fde68a"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="14">macOS</text><text x="560" y="72" text-anchor="middle" class="svg-muted" font-size="12">ipconfig getifaddr</text><text x="560" y="94" text-anchor="middle" class="svg-muted" font-size="12">ipconfig getpacket</text><text x="560" y="116" text-anchor="middle" class="svg-muted" font-size="12">scutil --dns</text>
</svg><p class="cap">Chaar jagah jahan lease rehti hai, aur use dikhane wale commands.</p></div>

<h3>Router DHCP client ke roop mein</h3>
<p>Chhoti branches aur home-style internet links aksar apna public address ISP se DHCP se lete hain. Cisco router kisi bhi routed interface par DHCP client ban sakta hai:</p>
<pre class="code"><span class="c">! edge router, Gi0/2 ISP ki taraf hai</span>
EDGE(config)# interface GigabitEthernet0/2
EDGE(config-if)# ip address dhcp
EDGE(config-if)# no shutdown
EDGE(config-if)# end
*Sep 29 10:02:11.345: %DHCP-6-ADDRESS_ASSIGN: Interface GigabitEthernet0/2 assigned DHCP address 203.0.113.46, mask 255.255.255.0, hostname EDGE</pre>
<p>Syslog message <code>%DHCP-6-ADDRESS_ASSIGN</code> aapka pehla saboot hai ki kaam hua. Do cheezein aur automatically hoti hain:</p>
<ul>
<li>Agar offer mein option 3 hai, router us gateway ki taraf <b>administrative distance 254 wala default static route</b> install karta hai. AD 254 ka matlab hai jo bhi static default aap khud configure karoge (AD 1) woh isse jeet jaayega.</li>
<li><code>show ip interface brief</code> Method column mein manual ki jagah <b>DHCP</b> dikhata hai.</li>
</ul>
<pre class="out">EDGE# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.10.1    YES manual up                    up
<span class="hl">GigabitEthernet0/2     203.0.113.46    YES DHCP   up                    up</span>

EDGE# show ip route static
Gateway of last resort is 203.0.113.1 to network 0.0.0.0
<span class="hl">S*    0.0.0.0/0 [254/0] via 203.0.113.1</span>

EDGE# show dhcp lease
Temp IP addr: 203.0.113.46  for peer on Interface: GigabitEthernet0/2
Temp  sub net mask: 255.255.255.0
   DHCP Lease server: 203.0.113.1, state: 5 Bound
   DHCP transaction id: 1A2B
   <span class="hl">Lease: 86400 secs,  Renewal: 43200 secs,  Rebind: 75600 secs</span>
Temp default-gateway addr: 203.0.113.1
   Next timer fires after: 11:59:48
   Retry count: 0   Client-ID: cisco-5254.0012.3456-Gi0/2
   Hostname: EDGE</pre>
<p>Lease line dekho: 86400 seconds ek din hai, renewal (T1) 43200 par (50%), rebind (T2) 75600 par (87.5%), bilkul chapter 3 ke timers.</p>

<h3>Windows</h3>
<pre class="out">C:\\&gt; ipconfig /all
Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : nwk.lab
   Physical Address. . . . . . . . . : 00-50-79-66-68-01
   <span class="hl">DHCP Enabled. . . . . . . . . . . : Yes</span>
   IPv4 Address. . . . . . . . . . . : 192.168.10.22(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Tuesday, 29 September 2026 09:15:02
   Lease Expires . . . . . . . . . . : Thursday, 1 October 2026 21:15:02
   Default Gateway . . . . . . . . . : 192.168.10.1
   <span class="hl">DHCP Server . . . . . . . . . . . : 192.168.10.1</span>
   DNS Servers . . . . . . . . . . . : 10.1.100.53</pre>
<p>Jo chahiye sab yahan hai: DHCP enabled, address, gateway, DNS server, domain suffix (option 15), lease window (2 din 12 ghante, <code>lease 2 12</code> se match) aur <b>kaunse DHCP server ne jawab diya</b>. Wahi aakhri line rogue server pakadne ka tareeka hai. Useful commands: <code>ipconfig /release</code> (DHCPRELEASE bhejta hai), <code>ipconfig /renew</code> (nayi request shuru karta hai), aur DNS cache ke liye <code>ipconfig /flushdns</code>.</p>

<h3>Linux</h3>
<pre class="out">$ ip -4 addr show eth0
2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.10.23/24 metric 100 brd 192.168.10.255 scope global <span class="hl">dynamic</span> eth0
       valid_lft 215983sec preferred_lft 215983sec

$ ip route
<span class="hl">default via 192.168.10.1 dev eth0 proto dhcp</span> src 192.168.10.23 metric 100
192.168.10.0/24 dev eth0 proto kernel scope link src 192.168.10.23 metric 100

$ resolvectl status eth0
Link 2 (eth0)
    Current Scopes: DNS
Current DNS Server: 10.1.100.53
       DNS Servers: 10.1.100.53
        DNS Domain: nwk.lab</pre>
<p>Shabd <b>dynamic</b> aur <b>valid_lft</b> countdown DHCP lease dikhate hain; default route par <b>proto dhcp</b> dikhata hai ki gateway option 3 se aaya. systemd-resolved wale systems par <code>/etc/resolv.conf</code> 127.0.0.53, yaani local stub resolver, ko point karta hai, isliye asli DNS servers dekhne ke liye <code>resolvectl status</code> use karo. Renew karne ke liye: systemd-networkd par <code>sudo networkctl renew eth0</code>, ya jahan dhclient use hota hai wahan <code>sudo dhclient -r eth0</code> phir <code>sudo dhclient eth0</code>.</p>

<h3>macOS</h3>
<pre class="out">$ ipconfig getifaddr en0
192.168.10.24
$ ipconfig getpacket en0
op = BOOTREPLY
yiaddr = 192.168.10.24
<span class="hl">server_identifier (ip): 192.168.10.1</span>
lease_time (uint32): 0x34bc0
subnet_mask (ip): 255.255.255.0
router (ip_mult): {192.168.10.1}
domain_name_server (ip_mult): {10.1.100.53}
domain_name (string): nwk.lab</pre>
<p><code>ipconfig getpacket</code> aakhri asli DHCP reply dikhata hai, option by option (0x34bc0 = 216000 seconds = 2.5 din). <code>scutil --dns</code> use ho rahe resolvers list karta hai.</p>

<h3>Lab PCs</h3>
<pre class="code">PC3&gt; ip dhcp
DDORA IP 192.168.20.21/24 GW 192.168.20.1
PC3&gt; show ip</pre>
<p>Lab PC ka <code>show ip</code> address, gateway, DNS server aur woh DHCP server dikhata hai jisse lease mili; <code>ip dhcp -x</code> lease release karta hai.</p>

<div class="eg"><p><b>Worked example: ek line padhna.</b> Annex ka ek user aapko bhejta hai: "IPv4 Address 192.168.20.22, Gateway 192.168.20.1, DHCP Server 10.1.12.1, DNS 10.1.100.53". Isse pata chalta hai ki lease relay hui thi (server local subnet par nahi hai), pool LAN20 hai, aur DNS option sahi hai. Agar DHCP Server line 192.168.20.254 dikhati, to aap annex mein koi unauthorised server dhoondhte.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>ip address dhcp</code> ke saath manual <code>ip route 0.0.0.0 0.0.0.0</code> bhi configure karna, phir sochna ki DHCP default table mein kyun nahi (AD 1, 254 ko harata hai). DHCP client interface par <code>no shutdown</code> bhool jaana. Linux par resolv.conf mein 127.0.0.53 padh kar yeh maan lena ki DNS misconfigured hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Router DHCP client = interface mode mein <code>ip address dhcp</code>. Seekhe hue default route ka AD <b>254</b> hai. Blueprint Windows, Mac OS aur Linux ke IP parameters verify karne ko kehta hai: <code>ipconfig /all</code>, <code>ip addr</code>/<code>ip route</code>, aur macOS par <code>ifconfig</code>/<code>ipconfig getpacket</code> jaano.</p></div>

<div class="scn"><h4>Branch jiska internet aadhi raat ko gaya</h4><p>Ek branch router apna ISP address DHCP se leta tha. Kisi ne "safe rehne ke liye" <code>ip route 0.0.0.0 0.0.0.0 203.0.113.1</code> bhi add kar diya tha. Mahino baad ISP ne renumber kiya; router ki DHCP lease naye gateway ke saath 198.51.100.0/24 par shift ho gayi, lekin purana static default (AD 1) ab bhi 203.0.113.1 ko point kar raha tha, jo ab unreachable tha. <code>show ip route</code> mein sirf static S* route tha. Manual static hatane se DHCP se seekha AD 254 default aa gaya.</p><p><b>Seekh:</b> DHCP-learned uplink par default route DHCP ko dene do, ya static wale ko track karo.</p></div>

<div class="iv"><p class="q">"Windows client ko DHCP se kya mila yeh kaise check karoge, aur rogue DHCP server kaise pakdoge?"</p><p><code>ipconfig /all</code>: DHCP Enabled, IPv4 address, mask, gateway, DNS servers, suffix, lease obtained/expires aur DHCP Server line. Agar DHCP Server ya gateway aisa address hai jo aapka nahi, to rogue server ne jawab diya. Use hatane ke baad <code>ipconfig /release</code> aur <code>/renew</code> chalao, aur prevention ke liye DHCP snooping ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip address dhcp</code> router interface ko DHCP client banata hai; option 3 se AD 254 wala default route install hota hai.</li>
<li>Routers par <code>%DHCP-6-ADDRESS_ASSIGN</code>, <code>show ip interface brief</code> (Method DHCP) aur <code>show dhcp lease</code> se verify karo.</li>
<li>Windows: <code>ipconfig /all</code>, <code>/release</code>, <code>/renew</code>; DHCP Server line rogue servers ko expose karti hai.</li>
<li>Linux: <code>ip addr</code> (dynamic), <code>ip route</code> (proto dhcp), <code>resolvectl status</code>.</li>
<li>macOS: <code>ipconfig getifaddr</code>, <code>ipconfig getpacket</code>, <code>scutil --dns</code>.</li>
</ul></div>
`}};export{e as default};