var e={id:`autoconfig`,h:{en:`SLAAC, stateless DHCPv6 and stateful DHCPv6`,hi:`SLAAC, stateless DHCPv6 aur stateful DHCPv6`},body:{en:`
<p>A wedding buffet can run three ways. Pure self-service: guests read the menu board and serve themselves (<b>SLAAC</b>). Self-service food, but a waiter brings drinks on request (<b>stateless DHCPv6</b>: the host builds its own address, a server supplies extras such as DNS). Or full table service with a waiter who writes down exactly what each table received (<b>stateful DHCPv6</b>: a server assigns the address and keeps a record). In every case the <b>menu board</b> is the Router Advertisement, and it tells the guests which style is in use.</p>

<h3>SLAAC: Stateless Address Autoconfiguration</h3>
<ol>
<li>The host creates its link-local address and runs DAD on it.</li>
<li>It sends an <b>RS</b> to <code>ff02::2</code> (or waits for the periodic RA).</li>
<li>The router answers with an <b>RA</b> containing a <b>/64 prefix</b> with the <b>A flag</b> set.</li>
<li>The host appends its own 64-bit interface ID (EUI-64, random or stable-privacy), runs DAD, and starts using the address.</li>
<li>The host takes the RA's <b>source link-local</b> as its default gateway.</li>
</ol>
<p>Nobody keeps a list of who has which address, which is why it is called <b>stateless</b>. SLAAC needs a /64 and an RA from a router with <code>ipv6 unicast-routing</code>. DNS servers can be sent inside the RA itself with the RDNSS option, but not every client uses it, so many networks add DHCPv6 for DNS.</p>

<h3>The M and O flags decide the method</h3>
<table class="cmp"><tr><th>RA flags</th><th>Method</th><th>Address from</th><th>DNS and other options from</th><th>IOS command on the router interface</th></tr>
<tr><td>M=0, O=0</td><td>SLAAC only</td><td>Host (SLAAC)</td><td>RA (RDNSS) or nothing</td><td>default</td></tr>
<tr><td>M=0, O=1</td><td>SLAAC + stateless DHCPv6</td><td>Host (SLAAC)</td><td>DHCPv6 server</td><td><code>ipv6 nd other-config-flag</code></td></tr>
<tr><td>M=1</td><td>Stateful DHCPv6</td><td>DHCPv6 server</td><td>DHCPv6 server</td><td><code>ipv6 nd managed-config-flag</code></td></tr></table>
<p>In all three cases the <b>default gateway comes from the RA</b>. DHCPv6 has no default-gateway option, unlike DHCP for IPv4. With M=1, hosts may still do SLAAC as well if the prefix has A=1; to force DHCPv6-only addressing, clear the A flag with <code>ipv6 nd prefix 2001:db8:cafe:1::/64 no-autoconfig</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Choosing the method from RA flags">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">RA received</text>
<line x1="320" y1="50" x2="110" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="110" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="133" text-anchor="middle" class="svg-ink" font-size="13">M=0 O=0</text><text x="110" y="153" text-anchor="middle" class="svg-muted" font-size="12">SLAAC only</text>
<rect x="240" y="110" width="160" height="60" rx="8" fill="#fde68a"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">M=0 O=1</text><text x="320" y="153" text-anchor="middle" class="svg-muted" font-size="12">SLAAC + DNS by DHCPv6</text>
<rect x="450" y="110" width="160" height="60" rx="8" fill="#ddd6fe"/><text x="530" y="133" text-anchor="middle" class="svg-ink" font-size="13">M=1</text><text x="530" y="153" text-anchor="middle" class="svg-muted" font-size="12">stateful DHCPv6</text>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="13">Gateway = RA source link-local in every case</text>
</svg><p class="cap">The router's RA flags steer every host on the link.</p></div>

<h3>DHCPv6 in brief</h3>
<p>Clients use UDP port <b>546</b>, servers and relays port <b>547</b>. A client sends from its link-local address to <code>ff02::1:2</code> (all DHCPv6 servers and relays). Stateful exchange: <b>Solicit, Advertise, Request, Reply</b>. Stateless exchange: <b>Information-Request, Reply</b>. Clients are identified by a <b>DUID</b>, not by their MAC. If the server is on another subnet, the router interface relays with <code>ipv6 dhcp relay destination 2001:db8:acad:53::5</code>.</p>
<pre class="code"><span class="c">! Stateless DHCPv6 on R1: addresses by SLAAC, DNS by DHCPv6</span>
R1(config)# ipv6 dhcp pool LAN-INFO
R1(config-dhcpv6)# dns-server 2001:db8:acad:53::53
R1(config-dhcpv6)# domain-name branch.example
R1(config-dhcpv6)# interface g0/0
R1(config-if)# ipv6 nd other-config-flag
R1(config-if)# ipv6 dhcp server LAN-INFO
<span class="c">! Stateful alternative: the pool also hands out addresses</span>
R1(config)# ipv6 dhcp pool LAN-ADDR
R1(config-dhcpv6)# address prefix 2001:db8:cafe:1::/64
R1(config-dhcpv6)# dns-server 2001:db8:acad:53::53
R1(config-dhcpv6)# interface g0/0
R1(config-if)# ipv6 nd managed-config-flag
R1(config-if)# ipv6 nd prefix 2001:db8:cafe:1::/64 no-autoconfig
R1(config-if)# ipv6 dhcp server LAN-ADDR</pre>
<p>Verify with <code>show ipv6 dhcp pool</code>, <code>show ipv6 dhcp binding</code> (stateful only) and <code>show ipv6 interface g0/0</code>, whose last lines say <code>Hosts use DHCP to obtain routable addresses.</code> or <code>Hosts use stateless autoconfig for addresses.</code></p>

<h3>Lab 2 walkthrough: SLAAC and EUI-64</h3>
<p>R1 gets <code>ipv6 unicast-routing</code> and <code>ipv6 address 2001:db8:cafe:1::/64 eui-64</code> on G0/0. It now advertises that prefix. On each PC, <code>ip auto</code> sends an RS and builds an EUI-64 address from the RA:</p>
<pre class="out">PC1&gt; ip auto
<span class="hl">GLOBAL SCOPE      : 2001:db8:cafe:1:250:7fff:fe06:6d01/64</span>
ROUTER LINK-LAYER : 52:54:0c:04:4b:01

PC1&gt; show ipv6
NAME              : PC1[1]
LINK-LOCAL SCOPE  : FE80::250:7FFF:FE06:6D01/64
GLOBAL SCOPE      : 2001:DB8:CAFE:1:250:7FFF:FE06:6D01/64 (SLAAC)
ROUTER LINK-LAYER : 52:54:0c:04:4b:01
<span class="hl">GATEWAY           : FE80::5054:CFF:FE04:4B01</span>
MAC               : 00:50:7f:06:6d:01</pre>
<p>The gateway is R1's automatic link-local, exactly as SLAAC promises. A router can be a SLAAC client too. On R2, <code>ipv6 address autoconfig default</code> builds an address from the RA and, because of the <code>default</code> keyword, installs a default route toward the RA's sender with code <b>ND</b> and administrative distance 2:</p>
<pre class="out">R2# show ipv6 route
<span class="hl">ND  ::/0 [2/0]
     via FE80::5054:CFF:FE04:4B01, GigabitEthernet0/0</span>
C   2001:DB8:CAFE:1::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L   2001:DB8:CAFE:1:5054:FFF:FE04:5001/128 [0/0]
     via GigabitEthernet0/0, receive</pre>

<div class="eg"><p><b>Worked example.</b> A router interface shows <code>Hosts use DHCP to obtain routable addresses.</code> and <code>Hosts use DHCP to obtain other configuration.</code> What will a Windows laptop do? The M flag is set, so it runs a stateful DHCPv6 exchange for its address and DNS. It still learns its default gateway from the RA. If the prefix also has A=1, it may build a SLAAC address too and end up with both.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting DHCPv6 to hand out the default gateway; setting the M flag without any DHCPv6 server or relay; forgetting that some clients (Android is the well-known one) do not support stateful DHCPv6 addressing at all; and typing <code>ipv6 address autoconfig</code> without <code>default</code>, then wondering why the router has no default route.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which method assigns addresses without the router or server keeping state?" SLAAC, and stateless DHCPv6 also keeps no address state. "Which flag tells hosts to use a DHCPv6 server for addresses?" M (managed). "Where does a DHCPv6 client get its default gateway?" From the RA, never from DHCPv6.</p></div>

<div class="scn"><h4>The campus that wanted a log of every address</h4><p>A university's compliance team needed to know which device held which IPv6 address. SLAAC with random IDs left no record, so the network team switched the student Wi-Fi to stateful DHCPv6 with M=1 and <code>no-autoconfig</code>. Laptops worked, but Android phones got only link-local addresses and fell back to IPv4. The team checked <code>show ipv6 dhcp binding</code>: no Android entries at all, because Android does not do stateful DHCPv6. The final design kept SLAAC on the phone-heavy SSID and logged address-to-MAC mappings from the switches' IPv6 snooping tables, while managed lab PCs used stateful DHCPv6.</p><p><b>Lesson:</b> pick the method by what your clients support, and remember that the RA flags control every host on the link.</p></div>

<div class="iv"><p class="q">"Compare SLAAC, stateless DHCPv6 and stateful DHCPv6."</p><p>Strong answer: SLAAC (M=0, O=0): the host builds its address from the RA's /64 plus its own interface ID, no server. Stateless DHCPv6 (M=0, O=1): address by SLAAC, DNS and domain from a DHCPv6 server that keeps no bindings. Stateful DHCPv6 (M=1): the server assigns addresses and keeps bindings; clear the A flag to prevent parallel SLAAC. In all cases the default gateway is the RA's link-local source. Mention ports 546/547, ff02::1:2 and the relay command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLAAC: RS, RA with a /64 and A=1, host adds its own interface ID, DAD, gateway = RA source link-local.</li>
<li>M=0 O=0 SLAAC only; M=0 O=1 SLAAC plus stateless DHCPv6; M=1 stateful DHCPv6.</li>
<li>DHCPv6 never supplies the default gateway; the RA always does.</li>
<li>IOS: <code>ipv6 nd other-config-flag</code>, <code>ipv6 nd managed-config-flag</code>, <code>ipv6 nd prefix ... no-autoconfig</code>, <code>ipv6 dhcp server POOL</code>, <code>ipv6 dhcp relay destination</code>.</li>
<li><code>ipv6 address autoconfig default</code> makes a router a SLAAC client with an ND ::/0 route (AD 2).</li>
</ul></div>
`,hi:`
<p>Shaadi ka buffet teen tarike se chal sakta hai. Poora self-service: guests menu board padhte hain aur khud serve karte hain (<b>SLAAC</b>). Khana self-service, par maangne par waiter drinks laata hai (<b>stateless DHCPv6</b>: host apna address khud banata hai, server DNS jaisi extra cheezein deta hai). Ya poori table service, waiter ke saath jo likhta hai ki har table ko exactly kya mila (<b>stateful DHCPv6</b>: server address assign karta hai aur record rakhta hai). Har case mein <b>menu board</b> Router Advertisement hai, aur wahi guests ko batata hai ki kaunsa style chal raha hai.</p>

<h3>SLAAC: Stateless Address Autoconfiguration</h3>
<ol>
<li>Host apna link-local address banata hai aur us par DAD chalata hai.</li>
<li>Woh <code>ff02::2</code> ko <b>RS</b> bhejta hai (ya periodic RA ka intezaar karta hai).</li>
<li>Router <b>A flag</b> set wale <b>/64 prefix</b> ke saath <b>RA</b> se jawab deta hai.</li>
<li>Host apna 64-bit interface ID (EUI-64, random ya stable-privacy) jodta hai, DAD chalata hai, aur address use karna shuru karta hai.</li>
<li>Host RA ke <b>source link-local</b> ko apna default gateway banata hai.</li>
</ol>
<p>Kaunsa address kiske paas hai, iski list koi nahi rakhta, isiliye ise <b>stateless</b> kehte hain. SLAAC ko /64 aur <code>ipv6 unicast-routing</code> wale router se RA chahiye. DNS servers RDNSS option se RA ke andar hi bheje ja sakte hain, par har client ise use nahi karta, isliye kai networks DNS ke liye DHCPv6 jodte hain.</p>

<h3>M aur O flags method tay karte hain</h3>
<table class="cmp"><tr><th>RA flags</th><th>Method</th><th>Address kahan se</th><th>DNS aur doosre options kahan se</th><th>Router interface par IOS command</th></tr>
<tr><td>M=0, O=0</td><td>Sirf SLAAC</td><td>Host (SLAAC)</td><td>RA (RDNSS) ya kuch nahi</td><td>default</td></tr>
<tr><td>M=0, O=1</td><td>SLAAC + stateless DHCPv6</td><td>Host (SLAAC)</td><td>DHCPv6 server</td><td><code>ipv6 nd other-config-flag</code></td></tr>
<tr><td>M=1</td><td>Stateful DHCPv6</td><td>DHCPv6 server</td><td>DHCPv6 server</td><td><code>ipv6 nd managed-config-flag</code></td></tr></table>
<p>Teeno cases mein <b>default gateway RA se aata hai</b>. IPv4 ke DHCP ke ulat, DHCPv6 mein default-gateway option hai hi nahi. M=1 ke saath bhi, agar prefix mein A=1 hai to hosts SLAAC bhi kar sakte hain; sirf DHCPv6 addressing force karne ke liye <code>ipv6 nd prefix 2001:db8:cafe:1::/64 no-autoconfig</code> se A flag clear karo.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="RA flags se method chunna">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">RA mila</text>
<line x1="320" y1="50" x2="110" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="110" width="160" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="133" text-anchor="middle" class="svg-ink" font-size="13">M=0 O=0</text><text x="110" y="153" text-anchor="middle" class="svg-muted" font-size="12">sirf SLAAC</text>
<rect x="240" y="110" width="160" height="60" rx="8" fill="#fde68a"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">M=0 O=1</text><text x="320" y="153" text-anchor="middle" class="svg-muted" font-size="12">SLAAC + DNS DHCPv6 se</text>
<rect x="450" y="110" width="160" height="60" rx="8" fill="#ddd6fe"/><text x="530" y="133" text-anchor="middle" class="svg-ink" font-size="13">M=1</text><text x="530" y="153" text-anchor="middle" class="svg-muted" font-size="12">stateful DHCPv6</text>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="13">Har case mein gateway = RA ka source link-local</text>
</svg><p class="cap">Router ke RA flags link ke har host ko disha dete hain.</p></div>

<h3>DHCPv6 sankshep mein</h3>
<p>Clients UDP port <b>546</b> use karte hain, servers aur relays port <b>547</b>. Client apne link-local address se <code>ff02::1:2</code> (saare DHCPv6 servers aur relays) ko bhejta hai. Stateful exchange: <b>Solicit, Advertise, Request, Reply</b>. Stateless exchange: <b>Information-Request, Reply</b>. Clients <b>DUID</b> se pehchane jaate hain, MAC se nahi. Agar server doosre subnet par hai, to router interface <code>ipv6 dhcp relay destination 2001:db8:acad:53::5</code> se relay karta hai.</p>
<pre class="code"><span class="c">! R1 par stateless DHCPv6: addresses SLAAC se, DNS DHCPv6 se</span>
R1(config)# ipv6 dhcp pool LAN-INFO
R1(config-dhcpv6)# dns-server 2001:db8:acad:53::53
R1(config-dhcpv6)# domain-name branch.example
R1(config-dhcpv6)# interface g0/0
R1(config-if)# ipv6 nd other-config-flag
R1(config-if)# ipv6 dhcp server LAN-INFO
<span class="c">! Stateful alternative: pool addresses bhi deta hai</span>
R1(config)# ipv6 dhcp pool LAN-ADDR
R1(config-dhcpv6)# address prefix 2001:db8:cafe:1::/64
R1(config-dhcpv6)# dns-server 2001:db8:acad:53::53
R1(config-dhcpv6)# interface g0/0
R1(config-if)# ipv6 nd managed-config-flag
R1(config-if)# ipv6 nd prefix 2001:db8:cafe:1::/64 no-autoconfig
R1(config-if)# ipv6 dhcp server LAN-ADDR</pre>
<p><code>show ipv6 dhcp pool</code>, <code>show ipv6 dhcp binding</code> (sirf stateful) aur <code>show ipv6 interface g0/0</code> se verify karo, jiski aakhri lines kehti hain <code>Hosts use DHCP to obtain routable addresses.</code> ya <code>Hosts use stateless autoconfig for addresses.</code></p>

<h3>Lab 2 walkthrough: SLAAC aur EUI-64</h3>
<p>R1 ko <code>ipv6 unicast-routing</code> aur G0/0 par <code>ipv6 address 2001:db8:cafe:1::/64 eui-64</code> milta hai. Ab woh yeh prefix advertise karta hai. Har PC par <code>ip auto</code> RS bhejta hai aur RA se EUI-64 address banata hai:</p>
<pre class="out">PC1&gt; ip auto
<span class="hl">GLOBAL SCOPE      : 2001:db8:cafe:1:250:7fff:fe06:6d01/64</span>
ROUTER LINK-LAYER : 52:54:0c:04:4b:01

PC1&gt; show ipv6
NAME              : PC1[1]
LINK-LOCAL SCOPE  : FE80::250:7FFF:FE06:6D01/64
GLOBAL SCOPE      : 2001:DB8:CAFE:1:250:7FFF:FE06:6D01/64 (SLAAC)
ROUTER LINK-LAYER : 52:54:0c:04:4b:01
<span class="hl">GATEWAY           : FE80::5054:CFF:FE04:4B01</span>
MAC               : 00:50:7f:06:6d:01</pre>
<p>Gateway R1 ka automatic link-local hai, bilkul jaisa SLAAC wada karta hai. Router bhi SLAAC client ban sakta hai. R2 par <code>ipv6 address autoconfig default</code> RA se address banata hai aur, <code>default</code> keyword ki wajah se, RA bhejne wale ki taraf <b>ND</b> code aur administrative distance 2 wala default route install karta hai:</p>
<pre class="out">R2# show ipv6 route
<span class="hl">ND  ::/0 [2/0]
     via FE80::5054:CFF:FE04:4B01, GigabitEthernet0/0</span>
C   2001:DB8:CAFE:1::/64 [0/0]
     via GigabitEthernet0/0, directly connected
L   2001:DB8:CAFE:1:5054:FFF:FE04:5001/128 [0/0]
     via GigabitEthernet0/0, receive</pre>

<div class="eg"><p><b>Worked example.</b> Ek router interface <code>Hosts use DHCP to obtain routable addresses.</code> aur <code>Hosts use DHCP to obtain other configuration.</code> dikhata hai. Windows laptop kya karega? M flag set hai, isliye woh address aur DNS ke liye stateful DHCPv6 exchange chalayega. Default gateway phir bhi RA se seekhega. Agar prefix mein A=1 bhi hai, to woh SLAAC address bhi bana sakta hai aur dono ke saath reh jaayega.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> DHCPv6 se default gateway expect karna; bina kisi DHCPv6 server ya relay ke M flag set karna; yeh bhoolna ki kuch clients (Android sabse mashhoor hai) stateful DHCPv6 addressing support hi nahi karte; aur <code>default</code> ke bina <code>ipv6 address autoconfig</code> type karke sochna ki router ke paas default route kyun nahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa method router ya server ke state rakhe bina addresses assign karta hai?" SLAAC, aur stateless DHCPv6 bhi address state nahi rakhta. "Kaunsa flag hosts ko addresses ke liye DHCPv6 server use karne ko kehta hai?" M (managed). "DHCPv6 client ko default gateway kahan se milta hai?" RA se, DHCPv6 se kabhi nahi.</p></div>

<div class="scn"><h4>Campus jise har address ka log chahiye tha</h4><p>Ek university ki compliance team ko jaanna tha ki kaunsa device kaunsa IPv6 address rakhta hai. Random IDs wale SLAAC se koi record nahi bachta tha, isliye network team ne student Wi-Fi ko M=1 aur <code>no-autoconfig</code> ke saath stateful DHCPv6 par switch kiya. Laptops chal gaye, par Android phones ko sirf link-local addresses mile aur woh IPv4 par wapas chale gaye. Team ne <code>show ipv6 dhcp binding</code> check kiya: Android ki ek bhi entry nahi, kyunki Android stateful DHCPv6 karta hi nahi. Final design mein phones wale SSID par SLAAC rakha gaya aur switches ki IPv6 snooping tables se address-to-MAC mappings log ki gayin, jabki managed lab PCs ne stateful DHCPv6 use kiya.</p><p><b>Seekh:</b> method apne clients ke support ke hisaab se chuno, aur yaad rakho ki RA flags link ke har host ko control karte hain.</p></div>

<div class="iv"><p class="q">"SLAAC, stateless DHCPv6 aur stateful DHCPv6 ko compare karo."</p><p>Strong answer: SLAAC (M=0, O=0): host RA ke /64 plus apne interface ID se address banata hai, koi server nahi. Stateless DHCPv6 (M=0, O=1): address SLAAC se, DNS aur domain DHCPv6 server se jo koi bindings nahi rakhta. Stateful DHCPv6 (M=1): server addresses assign karta hai aur bindings rakhta hai; parallel SLAAC rokne ke liye A flag clear karo. Har case mein default gateway RA ka link-local source hai. Ports 546/547, ff02::1:2 aur relay command bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLAAC: RS, /64 aur A=1 wala RA, host apna interface ID jodta hai, DAD, gateway = RA ka source link-local.</li>
<li>M=0 O=0 sirf SLAAC; M=0 O=1 SLAAC plus stateless DHCPv6; M=1 stateful DHCPv6.</li>
<li>DHCPv6 kabhi default gateway nahi deta; hamesha RA deta hai.</li>
<li>IOS: <code>ipv6 nd other-config-flag</code>, <code>ipv6 nd managed-config-flag</code>, <code>ipv6 nd prefix ... no-autoconfig</code>, <code>ipv6 dhcp server POOL</code>, <code>ipv6 dhcp relay destination</code>.</li>
<li><code>ipv6 address autoconfig default</code> router ko ND ::/0 route (AD 2) ke saath SLAAC client banata hai.</li>
</ul></div>
`}};export{e as default};