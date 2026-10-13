var e={id:`troubleshooting`,h:{en:`Troubleshooting IPv6 and dual stack`,hi:`IPv6 aur dual stack troubleshooting`},body:{en:`
<p>A good doctor does not start with surgery. They check pulse, breathing and temperature in a fixed order, because each check rules out a whole family of problems. IPv6 troubleshooting works the same way. Follow the path of a packet from the host outwards, and at each step ask one question. You will use the CompTIA method you already know (identify, theorise, test, plan, implement, verify, document); this chapter gives you the IPv6-specific checks for the "test" step.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="IPv6 troubleshooting ladder">
<rect x="20" y="10" width="600" height="34" rx="6" fill="#bbf7d0"/><text x="30" y="32" class="svg-ink" font-size="13">1. Does the host have a global IPv6 address, or only fe80::?</text>
<rect x="20" y="50" width="600" height="34" rx="6" fill="#bae6fd"/><text x="30" y="72" class="svg-ink" font-size="13">2. Does it have a gateway, and can it ping the gateway?</text>
<rect x="20" y="90" width="600" height="34" rx="6" fill="#ddd6fe"/><text x="30" y="112" class="svg-ink" font-size="13">3. Is there a route there AND a route back (both routers)?</text>
<rect x="20" y="130" width="600" height="34" rx="6" fill="#fde68a"/><text x="30" y="152" class="svg-ink" font-size="13">4. Does the far host have the right address and gateway?</text>
<rect x="20" y="170" width="600" height="34" rx="6" fill="#fed7aa"/><text x="30" y="192" class="svg-ink" font-size="13">5. Tunnels, MTU, firewalls: is ICMPv6 allowed?</text>
<rect x="20" y="210" width="600" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="232" class="svg-ink" font-size="13">6. Works by address but not by name? Check AAAA records and DNS</text>
</svg><p class="cap">Work from the host outwards. Each rung eliminates a whole class of faults.</p></div>

<h3>Step 1: only a link-local address? The RA is missing</h3>
<p>If a host has <code>fe80::</code> but no global address, it never received a usable Router Advertisement. In the lab the PC says so directly:</p>
<pre class="out">PC2&gt; ip auto
<span class="hl">No router answered ICMPv6 Router Solicitation</span>
PC2&gt; show ipv6
LINK-LOCAL SCOPE  : FE80::250:80FF:FE06:6E01/64
GLOBAL SCOPE      :
GATEWAY           :</pre>
<p>Now look at the router interface:</p>
<pre class="out">R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::5054:CFF:FE04:4B01
  Global unicast address(es):
    2001:DB8:ACAD:10::1, subnet is 2001:DB8:ACAD:10::/64
  Joined group address(es):
    FF02::1
    FF02::1:FF04:4B01
    FF02::1:FF00:1
  MTU is 1500 bytes
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 30000)</pre>
<p>Two clues: the router has <b>not joined FF02::2</b> and there are <b>no "ND router advertisements are sent" lines</b>. It is not acting as an IPv6 router, so <code>ipv6 unicast-routing</code> is missing. Other causes of the same symptom: RAs suppressed on the interface, a prefix that is not a /64, RA Guard blocking the real router, or a host firewall dropping ICMPv6.</p>

<h3>Step 2: gateway and first hop</h3>
<p>Check that the host's gateway is the router's link-local address (from <code>show ipv6</code>, <code>ipconfig</code> or <code>ip -6 route</code>) and ping it. A neighbor cache entry in <b>INCMP</b> state means Neighbor Solicitations are going unanswered: check VLANs, cabling and RA Guard or ACLs on the switch.</p>

<h3>Step 3: routes in both directions</h3>
<p>A traceroute that stops shows you where to look, but always check the <b>return</b> path too. In this example PC1 cannot ping SRV even though R1 has a default route:</p>
<pre class="out">PC1&gt; ping 2001:db8:acad:20::10
2001:DB8:ACAD:20::10 icmp_seq=1 timeout
2001:DB8:ACAD:20::10 icmp_seq=2 timeout

R2# show ipv6 route
C  2001:DB8:ACAD:12::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L  2001:DB8:ACAD:12::2/128 [0/0]
     via GigabitEthernet0/0, receive
C  2001:DB8:ACAD:20::/64 [0/0]
     via GigabitEthernet0/1, directly connected
L  2001:DB8:ACAD:20::1/128 [0/0]
     via GigabitEthernet0/1, receive
L  FF00::/8 [0/0]
     via Null0, receive</pre>
<p>R2 has <b>no route to 2001:db8:acad:10::/64</b>, so SRV's replies die at R2. Fix: <code>ipv6 route 2001:db8:acad:10::/64 2001:db8:acad:12::1</code>. Meanwhile IPv4 works, because IPv4 has its own routes: a classic dual-stack symptom.</p>

<h3>Step 4: the far host</h3>
<pre class="out">SRV&gt; show ipv6
GLOBAL SCOPE      : 2001:DB8:ACAD:20::10/64
GATEWAY           : <span class="hl">2001:DB8:ACAD:2::1</span></pre>
<p>A typo in a static gateway (<code>:2::1</code> instead of <code>:20::1</code>) points at an address that is not on the link, so replies are never sent off the subnet. With static IPv6, typos hide easily; compare against the design hextet by hextet.</p>

<h3>Step 5: tunnels, MTU and filters</h3>
<p>A GRE tunnel without keepalives shows <b>up/up</b> as long as the router has a route to the destination, even if the far end is wrong or down. Look at the counters instead:</p>
<pre class="out">R2# show interfaces tunnel0
Tunnel0 is up, line protocol is up
  Tunnel source 198.51.100.1 (GigabitEthernet0/0), <span class="hl">destination 203.0.113.9</span>
  Tunnel protocol/transport GRE/IP
     <span class="hl">0 packets input, 0 bytes, 0 no buffer</span></pre>
<p>R1 is <code>203.0.113.1</code>, so the destination is wrong and nothing ever arrives. Also check that ICMPv6 (ND types and Packet Too Big) is permitted; if small pings work but large transfers hang, suspect MTU.</p>

<h3>Step 6: names</h3>
<p>If <code>ping -6 2001:db8:acad:20::10</code> works but the name fails, check DNS: does the host have an IPv6-capable DNS server (RDNSS or DHCPv6 O flag), and does the name have a correct AAAA record? A AAAA record pointing at a server that does not listen on IPv6 causes delays or failures for every dual-stack client.</p>

<table class="cmp"><tr><th>Symptom</th><th>Most likely cause</th><th>Check</th></tr>
<tr><td>Only fe80:: on hosts</td><td>No RA (routing off, RA suppressed, not /64, RA Guard)</td><td>show ipv6 interface: FF02::2 joined? RA lines?</td></tr>
<tr><td>Two gateways / wrong prefix</td><td>Rogue RA</td><td>Neighbor cache MAC → switch port</td></tr>
<tr><td>IPv4 fine, IPv6 times out</td><td>Missing IPv6 route (often the return)</td><td>show ipv6 route on every hop</td></tr>
<tr><td>Address marked DUP</td><td>Duplicate static address</td><td>Log %IPV6_ND-4-DUPLICATE</td></tr>
<tr><td>Small pings OK, big transfers hang</td><td>Packet Too Big blocked, tunnel MTU</td><td>Firewall ICMPv6 rules</td></tr>
<tr><td>Slow page loads on dual stack</td><td>Broken IPv6 path, fallback to IPv4</td><td>ping -6 vs ping -4</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Declaring "the network is fine" because IPv4 pings work. Testing only from the router (its own addresses answer even when forwarding is off). Blaming the tunnel because it is up/up, or trusting it because it is up/up.</p></div>

<div class="exam"><p><b>Exam traps.</b> A host with only a <b>fe80::</b> address is like an IPv4 host with an APIPA 169.254.x.x address: it cannot reach other networks. Troubleshooting questions often hide the fault on the <b>return</b> path. Check the most basic layer first before changing routing.</p></div>

<div class="scn"><h4>The Monday morning with no IPv6</h4><p>On Monday, every PC in the finance VLAN showed only a link-local IPv6 address, while IPv4 was fine. Over the weekend a contractor had replaced the VLAN gateway with a new router, pasting in the old interface configuration. The engineer checked <code>show ipv6 interface</code> and saw the /64, but no FF02::2 group and no RA lines. The global <code>ipv6 unicast-routing</code> command had not been copied, because it was not part of the interface section. After adding it, the PCs built SLAAC addresses within seconds.</p><p><b>Lesson:</b> when hosts have only link-local, look at the router first: is it really acting as an IPv6 router and sending RAs?</p></div>

<div class="iv"><p class="q">"Users have IPv6 addresses but cannot reach a server over IPv6, while IPv4 works. How do you troubleshoot?"</p><p>Strong answer: confirm the host's global address and gateway, ping the gateway's link-local, then ping and trace to the server with -6. Check the IPv6 routing table on each router in both directions, since IPv6 routes are separate from IPv4. Check the server's address and gateway, IPv6 ACLs and firewall rules including ICMPv6, and tunnel status and MTU if there is one. Finish with DNS AAAA records. Mention that IPv4 working proves nothing about IPv6.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work outwards: host address, gateway, routes both ways, far host, tunnels and filters, DNS.</li>
<li>Only fe80:: means no usable RA: check <code>ipv6 unicast-routing</code>, FF02::2 membership and /64.</li>
<li>IPv4 working proves nothing about IPv6; each has its own routes and filters.</li>
<li>A GRE tunnel can be up/up with a wrong destination; check input counters.</li>
<li>Small pings working while large transfers fail points to MTU and blocked Packet Too Big.</li>
</ul></div>
`,hi:`
<p>Achha doctor surgery se shuru nahi karta. Woh ek fixed order mein pulse, saans aur temperature check karta hai, kyunki har check problems ki ek poori family ko rule out kar deta hai. IPv6 troubleshooting bhi aise hi kaam karta hai. Packet ke path ko host se bahar ki taraf follow karo, aur har step par ek sawaal poochho. Aap woh CompTIA method use karoge jo aap pehle se jaante ho (identify, theorise, test, plan, implement, verify, document); yeh chapter "test" step ke liye IPv6-specific checks deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="IPv6 troubleshooting ladder">
<rect x="20" y="10" width="600" height="34" rx="6" fill="#bbf7d0"/><text x="30" y="32" class="svg-ink" font-size="13">1. Host ke paas global IPv6 address hai, ya sirf fe80::?</text>
<rect x="20" y="50" width="600" height="34" rx="6" fill="#bae6fd"/><text x="30" y="72" class="svg-ink" font-size="13">2. Gateway hai, aur kya woh gateway ping kar sakta hai?</text>
<rect x="20" y="90" width="600" height="34" rx="6" fill="#ddd6fe"/><text x="30" y="112" class="svg-ink" font-size="13">3. Jaane ka route AUR wapas aane ka route hai (dono routers)?</text>
<rect x="20" y="130" width="600" height="34" rx="6" fill="#fde68a"/><text x="30" y="152" class="svg-ink" font-size="13">4. Door wale host ka address aur gateway sahi hai?</text>
<rect x="20" y="170" width="600" height="34" rx="6" fill="#fed7aa"/><text x="30" y="192" class="svg-ink" font-size="13">5. Tunnels, MTU, firewalls: ICMPv6 allowed hai?</text>
<rect x="20" y="210" width="600" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="232" class="svg-ink" font-size="13">6. Address se chalta hai, naam se nahi? AAAA records aur DNS check karo</text>
</svg><p class="cap">Host se bahar ki taraf kaam karo. Har seedhi faults ki ek poori class hata deti hai.</p></div>

<h3>Step 1: sirf link-local address? RA missing hai</h3>
<p>Agar host ke paas <code>fe80::</code> hai lekin global address nahi, to use kabhi kaam ka Router Advertisement nahi mila. Lab mein PC seedha yahi bolta hai:</p>
<pre class="out">PC2&gt; ip auto
<span class="hl">No router answered ICMPv6 Router Solicitation</span>
PC2&gt; show ipv6
LINK-LOCAL SCOPE  : FE80::250:80FF:FE06:6E01/64
GLOBAL SCOPE      :
GATEWAY           :</pre>
<p>Ab router interface dekho:</p>
<pre class="out">R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::5054:CFF:FE04:4B01
  Global unicast address(es):
    2001:DB8:ACAD:10::1, subnet is 2001:DB8:ACAD:10::/64
  Joined group address(es):
    FF02::1
    FF02::1:FF04:4B01
    FF02::1:FF00:1
  MTU is 1500 bytes
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 30000)</pre>
<p>Do clues: router ne <b>FF02::2 join nahi kiya</b> aur <b>"ND router advertisements are sent" wali lines nahi hain</b>. Woh IPv6 router ki tarah kaam nahi kar raha, isliye <code>ipv6 unicast-routing</code> missing hai. Isi symptom ke doosre causes: interface par RAs suppressed, /64 na hone wala prefix, RA Guard asli router ko block kar raha ho, ya host firewall ICMPv6 drop kar raha ho.</p>

<h3>Step 2: gateway aur first hop</h3>
<p>Check karo ki host ka gateway router ka link-local address hai (<code>show ipv6</code>, <code>ipconfig</code> ya <code>ip -6 route</code> se) aur use ping karo. Neighbor cache mein <b>INCMP</b> state wali entry ka matlab hai Neighbor Solicitations ka jawab nahi aa raha: switch par VLANs, cabling aur RA Guard ya ACLs check karo.</p>

<h3>Step 3: dono direction mein routes</h3>
<p>Ruka hua traceroute batata hai ki kahan dekhna hai, lekin hamesha <b>return</b> path bhi check karo. Is example mein PC1 SRV ko ping nahi kar pa raha jabki R1 ke paas default route hai:</p>
<pre class="out">PC1&gt; ping 2001:db8:acad:20::10
2001:DB8:ACAD:20::10 icmp_seq=1 timeout
2001:DB8:ACAD:20::10 icmp_seq=2 timeout

R2# show ipv6 route
C  2001:DB8:ACAD:12::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L  2001:DB8:ACAD:12::2/128 [0/0]
     via GigabitEthernet0/0, receive
C  2001:DB8:ACAD:20::/64 [0/0]
     via GigabitEthernet0/1, directly connected
L  2001:DB8:ACAD:20::1/128 [0/0]
     via GigabitEthernet0/1, receive
L  FF00::/8 [0/0]
     via Null0, receive</pre>
<p>R2 ke paas <b>2001:db8:acad:10::/64 ka koi route nahi</b>, isliye SRV ke replies R2 par mar jaate hain. Fix: <code>ipv6 route 2001:db8:acad:10::/64 2001:db8:acad:12::1</code>. Is beech IPv4 chalta hai, kyunki IPv4 ke apne routes hain: yeh classic dual-stack symptom hai.</p>

<h3>Step 4: door wala host</h3>
<pre class="out">SRV&gt; show ipv6
GLOBAL SCOPE      : 2001:DB8:ACAD:20::10/64
GATEWAY           : <span class="hl">2001:DB8:ACAD:2::1</span></pre>
<p>Static gateway mein typo (<code>:20::1</code> ki jagah <code>:2::1</code>) aise address ki taraf point karta hai jo link par hai hi nahi, isliye replies kabhi subnet se bahar nahi jaate. Static IPv6 mein typos aasani se chhup jaate hain; design se hextet by hextet compare karo.</p>

<h3>Step 5: tunnels, MTU aur filters</h3>
<p>Bina keepalives wala GRE tunnel tab tak <b>up/up</b> dikhata hai jab tak router ke paas destination ka route hai, bhale hi doosra end galat ya down ho. Iski jagah counters dekho:</p>
<pre class="out">R2# show interfaces tunnel0
Tunnel0 is up, line protocol is up
  Tunnel source 198.51.100.1 (GigabitEthernet0/0), <span class="hl">destination 203.0.113.9</span>
  Tunnel protocol/transport GRE/IP
     <span class="hl">0 packets input, 0 bytes, 0 no buffer</span></pre>
<p>R1 <code>203.0.113.1</code> hai, isliye destination galat hai aur kuch bhi kabhi nahi pahunchta. Yeh bhi check karo ki ICMPv6 (ND types aur Packet Too Big) permitted hai; agar chhote pings chalte hain lekin bade transfers atakte hain, to MTU par shak karo.</p>

<h3>Step 6: names</h3>
<p>Agar <code>ping -6 2001:db8:acad:20::10</code> chalta hai lekin naam fail hota hai, DNS check karo: kya host ke paas IPv6-capable DNS server hai (RDNSS ya DHCPv6 O flag), aur kya naam ka sahi AAAA record hai? Aise server ki taraf point karta AAAA record jo IPv6 par listen nahi karta, har dual-stack client ke liye delay ya failure laata hai.</p>

<table class="cmp"><tr><th>Symptom</th><th>Sabse likely cause</th><th>Check</th></tr>
<tr><td>Hosts par sirf fe80::</td><td>RA nahi (routing off, RA suppressed, /64 nahi, RA Guard)</td><td>show ipv6 interface: FF02::2 joined? RA lines?</td></tr>
<tr><td>Do gateways / galat prefix</td><td>Rogue RA</td><td>Neighbor cache MAC → switch port</td></tr>
<tr><td>IPv4 theek, IPv6 time out</td><td>Missing IPv6 route (aksar return wala)</td><td>Har hop par show ipv6 route</td></tr>
<tr><td>Address DUP mark hua</td><td>Duplicate static address</td><td>Log %IPV6_ND-4-DUPLICATE</td></tr>
<tr><td>Chhote pings OK, bade transfers atakte</td><td>Packet Too Big blocked, tunnel MTU</td><td>Firewall ICMPv6 rules</td></tr>
<tr><td>Dual stack par pages dheere khulte</td><td>Toota IPv6 path, IPv4 par fallback</td><td>ping -6 vs ping -4</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> IPv4 pings chalne ki wajah se "network theek hai" bol dena. Sirf router se test karna (forwarding off ho tab bhi uske apne addresses jawab dete hain). Tunnel ko up/up hone ki wajah se blame karna, ya up/up hone ki wajah se us par bharosa karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Sirf <b>fe80::</b> address wala host APIPA 169.254.x.x address wale IPv4 host jaisa hai: woh doosre networks tak nahi pahunch sakta. Troubleshooting sawaal aksar fault ko <b>return</b> path par chhupate hain. Routing badalne se pehle sabse basic layer check karo.</p></div>

<div class="scn"><h4>Bina IPv6 wali Monday subah</h4><p>Monday ko finance VLAN ke har PC par sirf link-local IPv6 address tha, jabki IPv4 theek tha. Weekend mein ek contractor ne VLAN gateway ko naye router se replace kiya tha, purani interface configuration paste karke. Engineer ne <code>show ipv6 interface</code> check kiya aur /64 dekha, lekin FF02::2 group aur RA lines nahi thi. Global <code>ipv6 unicast-routing</code> command copy nahi hui thi, kyunki woh interface section ka hissa nahi thi. Use jodte hi PCs ne kuch second mein SLAAC addresses bana liye.</p><p><b>Seekh:</b> jab hosts ke paas sirf link-local ho, pehle router dekho: kya woh sach mein IPv6 router ki tarah kaam kar raha hai aur RAs bhej raha hai?</p></div>

<div class="iv"><p class="q">"Users ke paas IPv6 addresses hain lekin woh IPv6 par server tak nahi pahunch rahe, jabki IPv4 chal raha hai. Kaise troubleshoot karoge?"</p><p>Strong answer: host ka global address aur gateway confirm karo, gateway ka link-local ping karo, phir -6 ke saath server ko ping aur trace karo. Har router par dono direction mein IPv6 routing table check karo, kyunki IPv6 routes IPv4 se alag hain. Server ka address aur gateway, IPv6 ACLs aur ICMPv6 samet firewall rules, aur tunnel ho to uska status aur MTU check karo. DNS AAAA records se khatam karo. Batao ki IPv4 ka chalna IPv6 ke baare mein kuch saabit nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bahar ki taraf kaam karo: host address, gateway, dono taraf routes, door wala host, tunnels aur filters, DNS.</li>
<li>Sirf fe80:: matlab kaam ka RA nahi: <code>ipv6 unicast-routing</code>, FF02::2 membership aur /64 check karo.</li>
<li>IPv4 ka chalna IPv6 ke baare mein kuch saabit nahi karta; dono ke apne routes aur filters hain.</li>
<li>Galat destination ke saath bhi GRE tunnel up/up ho sakta hai; input counters check karo.</li>
<li>Chhote pings chalna aur bade transfers fail hona MTU aur blocked Packet Too Big ki taraf ishara hai.</li>
</ul></div>
`}};export{e as default};