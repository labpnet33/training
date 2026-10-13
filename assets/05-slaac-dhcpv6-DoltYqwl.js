var e={id:`slaac`,h:{en:`IPv6 addressing services: SLAAC and DHCPv6`,hi:`IPv6 addressing services: SLAAC aur DHCPv6`},body:{en:`
<p>In a new housing society, the builder puts a signboard at the gate: "This is Block C, Street 7." Every new resident simply combines the street name on the board with their own flat number and knows their full address. Nobody has to visit an office. If residents also want the number of the society's doctor, they ask the office for that one piece of information. That is IPv6 addressing: the router advertises the <b>prefix</b> (the street), the host adds its own <b>interface ID</b> (the flat number), and a DHCPv6 server can optionally supply extra details.</p>

<h3>Recap: what an IPv6 host needs</h3>
<p>You met IPv6 addresses in the <i>IPv6 addressing</i> module. Every IPv6 interface automatically has a <b>link-local</b> address in <code>fe80::/10</code>. To talk beyond the link it also needs a <b>global unicast address</b> (for example in <code>2001:db8:10::/64</code>), a <b>default gateway</b> and one or more <b>DNS servers</b>. There are three ways to get them.</p>

<h3>Method 1: SLAAC (Stateless Address Autoconfiguration)</h3>
<ol>
<li>The host sends a <b>Router Solicitation</b> (ICMPv6 type 133) to the all-routers multicast group <code>ff02::2</code>.</li>
<li>The router replies with a <b>Router Advertisement</b> (RA, ICMPv6 type 134), which it also sends periodically to <code>ff02::1</code>. The RA contains the prefix, its length (/64), and the router's link-local address, which becomes the host's default gateway.</li>
<li>The host builds its own interface ID, either with <b>EUI-64</b> (derived from the MAC address) or a random value (privacy or stable-random addresses, used by default on modern Windows, macOS, Android and iOS).</li>
<li>The host runs <b>Duplicate Address Detection (DAD)</b>, asking on the link whether anybody already uses the address, and then starts using it.</li>
</ol>
<p>"Stateless" means no server keeps a record of which host has which address. There is no lease table to look at. Modern RAs can also carry DNS server addresses in the <b>RDNSS</b> option, so SLAAC alone can give a host everything it needs.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="SLAAC">
<rect x="20" y="10" width="140" height="40" rx="8" fill="#bae6fd"/><text x="90" y="35" text-anchor="middle" class="svg-ink" font-size="14">Host</text>
<rect x="480" y="10" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="550" y="35" text-anchor="middle" class="svg-ink" font-size="14">Router R1</text>
<line x1="90" y1="50" x2="90" y2="200" stroke="#64748b"/><line x1="550" y1="50" x2="550" y2="200" stroke="#64748b"/>
<line x1="90" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="79" text-anchor="middle" class="svg-ink" font-size="13">RS (type 133) to ff02::2</text>
<line x1="550" y1="130" x2="90" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-accent" font-size="13">RA (type 134): 2001:db8:10::/64, M/O flags</text>
<rect x="100" y="150" width="440" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">Host: prefix + own interface ID, then DAD</text>
</svg><p class="cap">SLAAC: the router advertises the prefix and gateway; the host builds its own address.</p></div>

<h3>Method 2: stateless DHCPv6 (SLAAC plus options)</h3>
<p>The host builds its address with SLAAC, but asks a DHCPv6 server for extra information such as DNS servers and the domain name. The router tells hosts to do this by setting the <b>O flag</b> (Other configuration) in the RA.</p>

<h3>Method 3: stateful DHCPv6</h3>
<p>A DHCPv6 server assigns the address and keeps a binding table, much like DHCP for IPv4. The router sets the <b>M flag</b> (Managed address configuration) in the RA. Organisations that must know exactly which host had which address, for audit or compliance, often prefer this.</p>

<table class="cmp"><tr><th>Method</th><th>RA flags</th><th>Address from</th><th>DNS from</th><th>Gateway from</th></tr>
<tr><td>SLAAC only</td><td>M=0, O=0</td><td>Host (prefix from RA)</td><td>RA (RDNSS) or manual</td><td>RA</td></tr>
<tr><td>Stateless DHCPv6</td><td>M=0, O=1</td><td>Host (SLAAC)</td><td>DHCPv6</td><td>RA</td></tr>
<tr><td>Stateful DHCPv6</td><td>M=1</td><td>DHCPv6 server</td><td>DHCPv6</td><td>RA</td></tr>
</table>
<p>Notice the last column: <b>the default gateway always comes from the Router Advertisement</b>. DHCPv6 has no default-gateway option.</p>

<h3>Configuration example: stateless DHCPv6 on the router</h3>
<pre class="code">ipv6 unicast-routing
<span class="c">! Options-only pool: no addresses, just DNS and domain</span>
ipv6 dhcp pool LAN6
 dns-server 2001:db8:20::10
 domain-name nwk.lab
interface GigabitEthernet0/0
 ipv6 address 2001:db8:10::1/64
 ipv6 nd other-config-flag
 ipv6 dhcp server LAN6</pre>
<pre class="out">R1# show ipv6 interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::1
  Global unicast address(es):
    2001:DB8:10::1, subnet is 2001:DB8:10::/64
  ND router advertisements are sent every 200 seconds
  <span class="hl">Hosts use stateless autoconfig for addresses.</span>
  <span class="hl">Hosts use DHCP to obtain other configuration.</span></pre>
<p>DHCPv6 uses UDP <b>546</b> (client) and <b>547</b> (server). Clients send to the multicast address <code>ff02::1:2</code> (all DHCP relay agents and servers). A router relays DHCPv6 across subnets with <code>ipv6 dhcp relay destination 2001:db8:20::10</code> on the client-facing interface.</p>

<div class="eg"><p><b>Worked example: EUI-64.</b> A host with MAC <code>00:50:79:66:68:01</code> receives prefix <code>2001:db8:10::/64</code>. EUI-64 splits the MAC in half, inserts <code>ff:fe</code> in the middle (<code>0050:79ff:fe66:6801</code>) and flips the seventh bit of the first byte (00 becomes 02). The interface ID is <code>0250:79ff:fe66:6801</code>, so the address is <code>2001:db8:10::250:79ff:fe66:6801</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>ipv6 unicast-routing</code>: the router does not send RAs, so hosts get only link-local addresses. (2) Using a prefix other than /64 on a LAN: SLAAC requires a /64. (3) Configuring a DHCPv6 server and expecting it to hand out the gateway; the gateway always comes from the RA.</p></div>

<div class="exam"><p><b>Exam trap.</b> SLAAC is stateless: there is no server and no lease database. If a question asks which method gives hosts an address "without a DHCP server", the answer is SLAAC. If it asks which RA flag tells hosts to get their address from DHCPv6, the answer is the M (managed) flag; the O flag means "other information only".</p></div>

<div class="scn"><h4>IPv6 addresses but no IPv6 DNS</h4><p>After enabling IPv6 in an office, laptops had global IPv6 addresses and could ping IPv6 servers by address, but DNS queries still went only to the IPv4 DNS server. The RA had M=0 and O=0 and no RDNSS option, so hosts had no IPv6 DNS server. The engineer set <code>ipv6 nd other-config-flag</code> and created an options-only DHCPv6 pool with the DNS server. Clients picked up the IPv6 DNS server on the next RA.</p><p><b>Lesson:</b> SLAAC gives an address and gateway; make sure DNS reaches hosts too, through RDNSS or stateless DHCPv6.</p></div>

<div class="iv"><p class="q">"Explain SLAAC. How does it differ from stateless and stateful DHCPv6?"</p><p>Strong answer: SLAAC uses Router Solicitation and Router Advertisement (ICMPv6 133/134). The RA gives the /64 prefix and the gateway; the host builds its interface ID (EUI-64 or random) and runs DAD. No server tracks addresses. Stateless DHCPv6 (O flag) adds options like DNS from a server while the address still comes from SLAAC. Stateful DHCPv6 (M flag) has a server assign and track addresses. In every case the default gateway comes from the RA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLAAC: RS/RA (ICMPv6 133/134), host builds its own address, runs DAD, no server state.</li>
<li>RA flags: M=1 stateful DHCPv6, O=1 stateless DHCPv6 (options only).</li>
<li>The default gateway always comes from the RA, never from DHCPv6.</li>
<li>DHCPv6 uses UDP 546/547 and multicast <code>ff02::1:2</code>.</li>
<li>SLAAC needs a /64 prefix and <code>ipv6 unicast-routing</code> on the router.</li>
</ul></div>
`,hi:`
<p>Ek nayi housing society mein builder gate par signboard lagata hai: "Yeh Block C, Street 7 hai." Har naya resident board par likhe street ke naam ko apne flat number ke saath jodta hai aur use apna poora address pata chal jaata hai. Kisi ko office nahi jaana padta. Agar residents ko society ke doctor ka number bhi chahiye, to woh sirf woh ek jaankari office se maangte hain. Yahi IPv6 addressing hai: router <b>prefix</b> (street) advertise karta hai, host apna <b>interface ID</b> (flat number) jodta hai, aur DHCPv6 server optionally extra details de sakta hai.</p>

<h3>Recap: IPv6 host ko kya chahiye</h3>
<p>Aap <i>IPv6 addressing</i> module mein IPv6 addresses se mile the. Har IPv6 interface ke paas apne aap <code>fe80::/10</code> mein ek <b>link-local</b> address hota hai. Link ke bahar baat karne ke liye use ek <b>global unicast address</b> (jaise <code>2001:db8:10::/64</code> mein), ek <b>default gateway</b> aur ek ya zyada <b>DNS servers</b> bhi chahiye. Inhe paane ke teen tareeke hain.</p>

<h3>Method 1: SLAAC (Stateless Address Autoconfiguration)</h3>
<ol>
<li>Host all-routers multicast group <code>ff02::2</code> ko <b>Router Solicitation</b> (ICMPv6 type 133) bhejta hai.</li>
<li>Router <b>Router Advertisement</b> (RA, ICMPv6 type 134) se jawab deta hai, jo woh <code>ff02::1</code> par periodically bhi bhejta hai. RA mein prefix, uski length (/64), aur router ka link-local address hota hai, jo host ka default gateway ban jaata hai.</li>
<li>Host apna interface ID khud banata hai, ya to <b>EUI-64</b> se (MAC address se nikala hua) ya random value se (privacy ya stable-random addresses, jo modern Windows, macOS, Android aur iOS par default hain).</li>
<li>Host <b>Duplicate Address Detection (DAD)</b> chalata hai, link par poochta hai ki kya koi pehle se yeh address use kar raha hai, aur phir use use karna shuru karta hai.</li>
</ol>
<p>"Stateless" ka matlab hai ki koi server record nahi rakhta ki kis host ke paas kaunsa address hai. Dekhne ke liye koi lease table nahi hai. Modern RAs <b>RDNSS</b> option mein DNS server addresses bhi le ja sakte hain, to sirf SLAAC bhi host ko uski zaroorat ki har cheez de sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="SLAAC">
<rect x="20" y="10" width="140" height="40" rx="8" fill="#bae6fd"/><text x="90" y="35" text-anchor="middle" class="svg-ink" font-size="14">Host</text>
<rect x="480" y="10" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="550" y="35" text-anchor="middle" class="svg-ink" font-size="14">Router R1</text>
<line x1="90" y1="50" x2="90" y2="200" stroke="#64748b"/><line x1="550" y1="50" x2="550" y2="200" stroke="#64748b"/>
<line x1="90" y1="85" x2="550" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="79" text-anchor="middle" class="svg-ink" font-size="13">RS (type 133) ff02::2 ko</text>
<line x1="550" y1="130" x2="90" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-accent" font-size="13">RA (type 134): 2001:db8:10::/64, M/O flags</text>
<rect x="100" y="150" width="440" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">Host: prefix + apna interface ID, phir DAD</text>
</svg><p class="cap">SLAAC: router prefix aur gateway advertise karta hai; host apna address khud banata hai.</p></div>

<h3>Method 2: stateless DHCPv6 (SLAAC plus options)</h3>
<p>Host apna address SLAAC se banata hai, lekin DNS servers aur domain name jaisi extra jaankari DHCPv6 server se maangta hai. Router RA mein <b>O flag</b> (Other configuration) set karke hosts ko aisa karne ko kehta hai.</p>

<h3>Method 3: stateful DHCPv6</h3>
<p>DHCPv6 server address assign karta hai aur binding table rakhta hai, bilkul IPv4 ke DHCP ki tarah. Router RA mein <b>M flag</b> (Managed address configuration) set karta hai. Jin organisations ko audit ya compliance ke liye exact pata hona chahiye ki kis host ke paas kaunsa address tha, woh aksar ise prefer karti hain.</p>

<table class="cmp"><tr><th>Method</th><th>RA flags</th><th>Address kahan se</th><th>DNS kahan se</th><th>Gateway kahan se</th></tr>
<tr><td>Sirf SLAAC</td><td>M=0, O=0</td><td>Host (prefix RA se)</td><td>RA (RDNSS) ya manual</td><td>RA</td></tr>
<tr><td>Stateless DHCPv6</td><td>M=0, O=1</td><td>Host (SLAAC)</td><td>DHCPv6</td><td>RA</td></tr>
<tr><td>Stateful DHCPv6</td><td>M=1</td><td>DHCPv6 server</td><td>DHCPv6</td><td>RA</td></tr>
</table>
<p>Aakhri column dekho: <b>default gateway hamesha Router Advertisement se aata hai</b>. DHCPv6 mein koi default-gateway option nahi hai.</p>

<h3>Configuration example: router par stateless DHCPv6</h3>
<pre class="code">ipv6 unicast-routing
<span class="c">! Sirf options wala pool: addresses nahi, sirf DNS aur domain</span>
ipv6 dhcp pool LAN6
 dns-server 2001:db8:20::10
 domain-name nwk.lab
interface GigabitEthernet0/0
 ipv6 address 2001:db8:10::1/64
 ipv6 nd other-config-flag
 ipv6 dhcp server LAN6</pre>
<pre class="out">R1# show ipv6 interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::1
  Global unicast address(es):
    2001:DB8:10::1, subnet is 2001:DB8:10::/64
  ND router advertisements are sent every 200 seconds
  <span class="hl">Hosts use stateless autoconfig for addresses.</span>
  <span class="hl">Hosts use DHCP to obtain other configuration.</span></pre>
<p>DHCPv6 UDP <b>546</b> (client) aur <b>547</b> (server) use karta hai. Clients multicast address <code>ff02::1:2</code> (all DHCP relay agents and servers) par bhejte hain. Router subnets ke paar DHCPv6 ko client-facing interface par <code>ipv6 dhcp relay destination 2001:db8:20::10</code> se relay karta hai.</p>

<div class="eg"><p><b>Worked example: EUI-64.</b> MAC <code>00:50:79:66:68:01</code> wale host ko prefix <code>2001:db8:10::/64</code> milta hai. EUI-64 MAC ko aadha-aadha baantta hai, beech mein <code>ff:fe</code> daalta hai (<code>0050:79ff:fe66:6801</code>) aur pehle byte ka saatvaan bit flip karta hai (00 banta hai 02). Interface ID <code>0250:79ff:fe66:6801</code> hai, to address <code>2001:db8:10::250:79ff:fe66:6801</code> hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>ipv6 unicast-routing</code> bhool jaana: router RAs nahi bhejta, to hosts ko sirf link-local addresses milte hain. (2) LAN par /64 ke alawa koi prefix use karna: SLAAC ko /64 chahiye. (3) DHCPv6 server configure karke yeh expect karna ki woh gateway dega; gateway hamesha RA se aata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> SLAAC stateless hai: na server hai na lease database. Agar sawaal pooche kaunsa method hosts ko "bina DHCP server ke" address deta hai, jawab SLAAC hai. Agar pooche kaunsa RA flag hosts ko DHCPv6 se address lene ko kehta hai, jawab M (managed) flag hai; O flag ka matlab hai "sirf other information".</p></div>

<div class="scn"><h4>IPv6 addresses hain lekin IPv6 DNS nahi</h4><p>Office mein IPv6 enable karne ke baad laptops ke paas global IPv6 addresses the aur woh IPv6 servers ko address se ping kar sakte the, lekin DNS queries abhi bhi sirf IPv4 DNS server par jaa rahi thi. RA mein M=0 aur O=0 tha aur koi RDNSS option nahi tha, to hosts ke paas koi IPv6 DNS server nahi tha. Engineer ne <code>ipv6 nd other-config-flag</code> set kiya aur DNS server ke saath ek options-only DHCPv6 pool banaya. Clients ne agle RA par IPv6 DNS server le liya.</p><p><b>Seekh:</b> SLAAC address aur gateway deta hai; ensure karo ki DNS bhi hosts tak pahunche, RDNSS ya stateless DHCPv6 ke through.</p></div>

<div class="iv"><p class="q">"SLAAC samjhao. Yeh stateless aur stateful DHCPv6 se kaise alag hai?"</p><p>Strong answer: SLAAC Router Solicitation aur Router Advertisement (ICMPv6 133/134) use karta hai. RA /64 prefix aur gateway deta hai; host apna interface ID (EUI-64 ya random) banata hai aur DAD chalata hai. Koi server addresses track nahi karta. Stateless DHCPv6 (O flag) server se DNS jaise options jodta hai jabki address abhi bhi SLAAC se aata hai. Stateful DHCPv6 (M flag) mein server addresses assign aur track karta hai. Har case mein default gateway RA se aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLAAC: RS/RA (ICMPv6 133/134), host apna address khud banata hai, DAD chalata hai, koi server state nahi.</li>
<li>RA flags: M=1 stateful DHCPv6, O=1 stateless DHCPv6 (sirf options).</li>
<li>Default gateway hamesha RA se aata hai, kabhi DHCPv6 se nahi.</li>
<li>DHCPv6 UDP 546/547 aur multicast <code>ff02::1:2</code> use karta hai.</li>
<li>SLAAC ko /64 prefix aur router par <code>ipv6 unicast-routing</code> chahiye.</li>
</ul></div>
`}};export{e as default};