var e={id:`dhcpv6`,h:{en:`DHCPv6: SLAAC, stateless, stateful and relay`,hi:`DHCPv6: SLAAC, stateless, stateful aur relay`},body:{en:`
<p>In IPv4 the DHCP server is the whole reception desk. In IPv6 the job is shared. The <b>router</b> stands at the door and shouts announcements (Router Advertisements, RAs): "the prefix here is 2001:db8:50::/64, I am your gateway, and by the way, ask the desk for your room" or "just ask the desk for the Wi-Fi password". The <b>DHCPv6 server</b> is the desk that answers. Most DHCPv6 tickets are really about what the router's RA told the client to do.</p>

<h3>The three flags that decide everything</h3>
<table class="cmp"><tr><th>Mode</th><th>RA flags</th><th>Address from</th><th>DNS and domain from</th></tr>
<tr><td>SLAAC only</td><td>A=1, M=0, O=0</td><td>Client builds it from the prefix</td><td>RA (RDNSS) if supported</td></tr>
<tr><td>Stateless DHCPv6</td><td>A=1, M=0, <b>O=1</b></td><td>SLAAC</td><td>DHCPv6 (Information-Request / Reply)</td></tr>
<tr><td>Stateful DHCPv6</td><td><b>M=1</b> (A usually 0)</td><td>DHCPv6 server (SOLICIT, ADVERTISE, REQUEST, REPLY)</td><td>DHCPv6</td></tr></table>
<p>The <b>default gateway always comes from the RA</b>, from the router's link-local address. DHCPv6 has no default-router option. Clients use UDP 546, servers and relays UDP 547, and clients send to the multicast ff02::1:2 (All_DHCP_Relay_Agents_and_Servers). Clients are identified by a <b>DUID</b>, not by a MAC.</p>

<h3>Stateful server on IOS</h3>
<pre class="code">ipv6 unicast-routing
ipv6 dhcp pool V6-LAN
 address prefix 2001:db8:50::/64 lifetime 172800 86400
 dns-server 2001:db8:30::53
 domain-name branch.example
interface GigabitEthernet0/0
 ipv6 address 2001:db8:50::1/64
 ipv6 dhcp server V6-LAN
 ipv6 nd managed-config-flag                          <span class="c">! M=1</span>
 ipv6 nd prefix 2001:db8:50::/64 2592000 604800 no-autoconfig   <span class="c">! optional: A=0, no SLAAC</span></pre>
<p>For <b>stateless</b>, the pool carries only <code>dns-server</code> and <code>domain-name</code>, and the interface uses <code>ipv6 nd other-config-flag</code> instead of the managed flag.</p>

<h3>DHCPv6 relay</h3>
<p>If the server is elsewhere, the router on the client LAN relays. It wraps the client's message in a <b>RELAY-FORW</b> and puts an address of the receiving interface in the <b>link-address</b> field, the IPv6 equivalent of giaddr. The server picks the pool whose prefix matches link-address and answers with a <b>RELAY-REPL</b> to the relay.</p>
<pre class="code">interface GigabitEthernet0/0
 ipv6 address 2001:db8:50::1/64
 ipv6 dhcp relay destination 2001:db8:30::1
 ipv6 nd managed-config-flag        <span class="c">! the RA still comes from THIS router</span>
<span class="c">! a link-local destination needs the outgoing interface:</span>
<span class="c">! ipv6 dhcp relay destination FE80::1 GigabitEthernet0/1</span></pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DHCPv6 relay">
<rect x="10" y="80" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="65" y="104" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="65" y="122" text-anchor="middle" class="svg-muted" font-size="12">DUID</text>
<rect x="220" y="70" width="170" height="76" rx="8" fill="#bae6fd"/><text x="305" y="94" text-anchor="middle" class="svg-ink" font-size="13">BR relay</text><text x="305" y="112" text-anchor="middle" class="svg-muted" font-size="12">RA: M=1</text><text x="305" y="130" text-anchor="middle" class="svg-muted" font-size="12">link-addr 2001:db8:50::1</text>
<rect x="490" y="80" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="104" text-anchor="middle" class="svg-ink" font-size="13">DHCPv6 server</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:30::1</text>
<line x1="120" y1="108" x2="220" y2="108" stroke="#64748b"/><line x1="390" y1="108" x2="490" y2="108" stroke="#64748b"/>
<text x="170" y="60" text-anchor="middle" class="svg-accent" font-size="12">SOLICIT to ff02::1:2</text>
<text x="440" y="60" text-anchor="middle" class="svg-accent" font-size="12">RELAY-FORW</text>
<text x="440" y="170" text-anchor="middle" class="svg-accent" font-size="12">RELAY-REPL</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Server needs a route back to 2001:db8:50::/64</text>
</svg><p class="cap">The relay announces M=1, forwards SOLICIT as RELAY-FORW, and the server replies to the relay.</p></div>

<h3>Verification</h3>
<pre class="out">BR# show ipv6 dhcp interface
GigabitEthernet0/0 is in <span class="hl">relay mode</span>
  Relay destinations:
    <span class="hl">2001:DB8:30::1</span>

HQ# show ipv6 dhcp binding
Client: FE80::5054:FF:FE12:3456
  DUID: 00030001525400123456
  Username : unassigned
  VRF : default
  IA NA: IA ID 0x00060001, T1 43200, T2 69120
    Address: <span class="hl">2001:DB8:50::6C1A:22F3:9B4D:1E07</span>
            preferred lifetime 86400, valid lifetime 172800
            expires at Oct 02 2026 09:14 AM (172780 seconds)</pre>
<p>On the router sending RAs, <code>show ipv6 interface GigabitEthernet0/0</code> ends with a line such as "Hosts use DHCP to obtain routable addresses." when M=1, or "Hosts use stateless autoconfig for addresses." when it is not set. Also useful: <code>show ipv6 dhcp pool</code>, <code>debug ipv6 dhcp detail</code>, <code>debug ipv6 nd</code>.</p>

<h3>IOS as a DHCPv6 client</h3>
<p><code>ipv6 address dhcp</code> leases a stateful address on an interface; <code>ipv6 address autoconfig</code> uses SLAAC (add <code>default</code> to install a default route from the RA). For prefix delegation, a CPE router uses <code>ipv6 dhcp client pd PREFIX-NAME</code> and then numbers its LANs from that general prefix.</p>

<div class="eg"><p><b>Worked example.</b> Windows clients on 2001:db8:50::/64 get a SLAAC address but no DNS server, and the DHCPv6 binding table on HQ is empty. <code>show ipv6 interface g0/0</code> on BR says "Hosts use stateless autoconfig for addresses." and there is no relay line. Two faults: no M or O flag, and no relay destination. After adding <code>ipv6 nd managed-config-flag</code> and <code>ipv6 dhcp relay destination 2001:db8:30::1</code>, HQ shows a binding for each DUID.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting DHCPv6 to hand out a default gateway; forgetting the M or O flag; configuring the relay on the wrong interface; a pool prefix that does not match the link-address; no route from the server back to the relay; RAs suppressed with <code>ipv6 nd ra suppress</code> so clients never start; DHCPv6 guard or an ACL dropping UDP 546/547.</p></div>

<div class="exam"><p><b>Exam trap.</b> M=1 means stateful (addresses from DHCPv6); O=1 with M=0 means stateless (only other information). The gateway is always learned from the RA. The relay uses <code>ipv6 dhcp relay destination</code>, not <code>ip helper-address</code>.</p></div>

<div class="scn"><h4>Half the laptops had no IPv6 DNS</h4><p>A campus enabled IPv6 with stateful DHCPv6. Linux laptops worked; some older clients had addresses but no DNS. The engineer found that the RA had A=1 and M=1: clients that supported DHCPv6 used it, others fell back to SLAAC and never asked for DNS. The team kept stateful DHCPv6, also advertised the DNS server inside the RA (RDNSS) for clients that never run DHCPv6, and documented which client types used which method.</p><p><b>Lesson:</b> in IPv6 the RA flags drive client behaviour; check them first on every DHCPv6 ticket.</p></div>

<div class="iv"><p class="q">"Explain stateless versus stateful DHCPv6."</p><p>Stateless: the RA has O=1, clients build their address with SLAAC and ask DHCPv6 only for other information like DNS; the server keeps no binding. Stateful: M=1, the server assigns addresses and keeps bindings through SOLICIT, ADVERTISE, REQUEST, REPLY. In both cases the default gateway comes from the RA. Mention the relay command, link-address, UDP 546/547 and DUIDs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RA flags: M=1 stateful, O=1 stateless, A=1 SLAAC; the gateway always comes from the RA.</li>
<li>Stateful IOS server: pool with <code>address prefix</code>, <code>ipv6 dhcp server</code> plus <code>ipv6 nd managed-config-flag</code>.</li>
<li>Relay: <code>ipv6 dhcp relay destination</code>; link-address selects the pool; server needs a return route.</li>
<li>Clients use UDP 546 to ff02::1:2, servers UDP 547; clients are identified by DUID.</li>
<li>Verify with <code>show ipv6 dhcp interface</code>, <code>binding</code>, <code>pool</code>, and the last line of <code>show ipv6 interface</code>.</li>
</ul></div>
`,hi:`
<p>IPv4 mein DHCP server poora reception desk hai. IPv6 mein kaam baanta hua hai. <b>Router</b> darwaze par khada hokar announcements chillata hai (Router Advertisements, RAs): "yahan prefix 2001:db8:50::/64 hai, main tumhara gateway hoon, aur haan, apna room desk se poocho" ya "bas Wi-Fi password desk se poocho". <b>DHCPv6 server</b> woh desk hai jo jawab deta hai. Zyada tar DHCPv6 tickets asal mein is baare mein hote hain ki router ke RA ne client ko kya karne ko kaha.</p>

<h3>Teen flags jo sab tay karte hain</h3>
<table class="cmp"><tr><th>Mode</th><th>RA flags</th><th>Address kahan se</th><th>DNS aur domain kahan se</th></tr>
<tr><td>Sirf SLAAC</td><td>A=1, M=0, O=0</td><td>Client prefix se khud banata hai</td><td>RA (RDNSS) agar supported</td></tr>
<tr><td>Stateless DHCPv6</td><td>A=1, M=0, <b>O=1</b></td><td>SLAAC</td><td>DHCPv6 (Information-Request / Reply)</td></tr>
<tr><td>Stateful DHCPv6</td><td><b>M=1</b> (A aam taur par 0)</td><td>DHCPv6 server (SOLICIT, ADVERTISE, REQUEST, REPLY)</td><td>DHCPv6</td></tr></table>
<p><b>Default gateway hamesha RA se aata hai</b>, router ke link-local address se. DHCPv6 mein koi default-router option nahi hai. Clients UDP 546 use karte hain, servers aur relays UDP 547, aur clients multicast ff02::1:2 (All_DHCP_Relay_Agents_and_Servers) par bhejte hain. Clients ko <b>DUID</b> se pehchana jaata hai, MAC se nahi.</p>

<h3>IOS par stateful server</h3>
<pre class="code">ipv6 unicast-routing
ipv6 dhcp pool V6-LAN
 address prefix 2001:db8:50::/64 lifetime 172800 86400
 dns-server 2001:db8:30::53
 domain-name branch.example
interface GigabitEthernet0/0
 ipv6 address 2001:db8:50::1/64
 ipv6 dhcp server V6-LAN
 ipv6 nd managed-config-flag                          <span class="c">! M=1</span>
 ipv6 nd prefix 2001:db8:50::/64 2592000 604800 no-autoconfig   <span class="c">! optional: A=0, SLAAC nahi</span></pre>
<p><b>Stateless</b> ke liye pool mein sirf <code>dns-server</code> aur <code>domain-name</code> hote hain, aur interface managed flag ki jagah <code>ipv6 nd other-config-flag</code> use karta hai.</p>

<h3>DHCPv6 relay</h3>
<p>Agar server kahin aur hai, to client LAN wala router relay karta hai. Woh client ke message ko <b>RELAY-FORW</b> mein lapet-ta hai aur receive karne wale interface ka address <b>link-address</b> field mein daalta hai, jo giaddr ka IPv6 equivalent hai. Server woh pool chunta hai jiska prefix link-address se match kare aur relay ko <b>RELAY-REPL</b> se jawab deta hai.</p>
<pre class="code">interface GigabitEthernet0/0
 ipv6 address 2001:db8:50::1/64
 ipv6 dhcp relay destination 2001:db8:30::1
 ipv6 nd managed-config-flag        <span class="c">! RA abhi bhi ISI router se aata hai</span>
<span class="c">! link-local destination ko outgoing interface chahiye:</span>
<span class="c">! ipv6 dhcp relay destination FE80::1 GigabitEthernet0/1</span></pre>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DHCPv6 relay">
<rect x="10" y="80" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="65" y="104" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="65" y="122" text-anchor="middle" class="svg-muted" font-size="12">DUID</text>
<rect x="220" y="70" width="170" height="76" rx="8" fill="#bae6fd"/><text x="305" y="94" text-anchor="middle" class="svg-ink" font-size="13">BR relay</text><text x="305" y="112" text-anchor="middle" class="svg-muted" font-size="12">RA: M=1</text><text x="305" y="130" text-anchor="middle" class="svg-muted" font-size="12">link-addr 2001:db8:50::1</text>
<rect x="490" y="80" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="560" y="104" text-anchor="middle" class="svg-ink" font-size="13">DHCPv6 server</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:30::1</text>
<line x1="120" y1="108" x2="220" y2="108" stroke="#64748b"/><line x1="390" y1="108" x2="490" y2="108" stroke="#64748b"/>
<text x="170" y="60" text-anchor="middle" class="svg-accent" font-size="12">SOLICIT ff02::1:2 ko</text>
<text x="440" y="60" text-anchor="middle" class="svg-accent" font-size="12">RELAY-FORW</text>
<text x="440" y="170" text-anchor="middle" class="svg-accent" font-size="12">RELAY-REPL</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Server ko 2001:db8:50::/64 tak wapas route chahiye</text>
</svg><p class="cap">Relay M=1 announce karta hai, SOLICIT ko RELAY-FORW bana kar forward karta hai, aur server relay ko reply karta hai.</p></div>

<h3>Verification</h3>
<pre class="out">BR# show ipv6 dhcp interface
GigabitEthernet0/0 is in <span class="hl">relay mode</span>
  Relay destinations:
    <span class="hl">2001:DB8:30::1</span>

HQ# show ipv6 dhcp binding
Client: FE80::5054:FF:FE12:3456
  DUID: 00030001525400123456
  Username : unassigned
  VRF : default
  IA NA: IA ID 0x00060001, T1 43200, T2 69120
    Address: <span class="hl">2001:DB8:50::6C1A:22F3:9B4D:1E07</span>
            preferred lifetime 86400, valid lifetime 172800
            expires at Oct 02 2026 09:14 AM (172780 seconds)</pre>
<p>RA bhejne wale router par, <code>show ipv6 interface GigabitEthernet0/0</code> M=1 hone par "Hosts use DHCP to obtain routable addresses." jaisi line par khatam hota hai, ya set na hone par "Hosts use stateless autoconfig for addresses." Yeh bhi useful hain: <code>show ipv6 dhcp pool</code>, <code>debug ipv6 dhcp detail</code>, <code>debug ipv6 nd</code>.</p>

<h3>IOS ek DHCPv6 client ke roop mein</h3>
<p><code>ipv6 address dhcp</code> interface par stateful address lease karta hai; <code>ipv6 address autoconfig</code> SLAAC use karta hai (RA se default route install karne ke liye <code>default</code> jodo). Prefix delegation ke liye CPE router <code>ipv6 dhcp client pd PREFIX-NAME</code> use karta hai aur phir us general prefix se apne LANs number karta hai.</p>

<div class="eg"><p><b>Worked example.</b> 2001:db8:50::/64 par Windows clients ko SLAAC address milta hai par DNS server nahi, aur HQ ki DHCPv6 binding table khaali hai. BR par <code>show ipv6 interface g0/0</code> kehta hai "Hosts use stateless autoconfig for addresses." aur koi relay line nahi. Do faults: na M na O flag, aur koi relay destination nahi. <code>ipv6 nd managed-config-flag</code> aur <code>ipv6 dhcp relay destination 2001:db8:30::1</code> jodne ke baad, HQ har DUID ki binding dikhata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> DHCPv6 se default gateway expect karna; M ya O flag bhoolna; relay galat interface par configure karna; pool prefix jo link-address se match nahi karta; server se relay tak wapas route nahi; <code>ipv6 nd ra suppress</code> se RAs dabana jisse clients kabhi shuru hi nahi karte; DHCPv6 guard ya ACL UDP 546/547 drop kar raha.</p></div>

<div class="exam"><p><b>Exam trap.</b> M=1 ka matlab stateful (addresses DHCPv6 se); M=0 ke saath O=1 ka matlab stateless (sirf other information). Gateway hamesha RA se seekha jaata hai. Relay <code>ipv6 dhcp relay destination</code> use karta hai, <code>ip helper-address</code> nahi.</p></div>

<div class="scn"><h4>Aadhe laptops ke paas IPv6 DNS nahi tha</h4><p>Ek campus ne stateful DHCPv6 ke saath IPv6 enable kiya. Linux laptops chal gaye; kuch purane clients ke paas addresses the par DNS nahi. Engineer ne paaya ki RA mein A=1 aur M=1 tha: jo clients DHCPv6 support karte the unhone use kiya, baaki SLAAC par wapas gaye aur kabhi DNS nahi maanga. Team ne stateful DHCPv6 rakha, jo clients kabhi DHCPv6 nahi chalate unke liye RA ke andar bhi DNS server advertise kiya (RDNSS), aur document kiya kaunse client types kaunsa method use karte hain.</p><p><b>Seekh:</b> IPv6 mein RA flags client behaviour chalate hain; har DHCPv6 ticket par pehle unhe check karo.</p></div>

<div class="iv"><p class="q">"Stateless aur stateful DHCPv6 samjhao."</p><p>Stateless: RA mein O=1, clients SLAAC se apna address banate hain aur DHCPv6 se sirf DNS jaisi other information maangte hain; server koi binding nahi rakhta. Stateful: M=1, server SOLICIT, ADVERTISE, REQUEST, REPLY ke through addresses deta hai aur bindings rakhta hai. Dono cases mein default gateway RA se aata hai. Relay command, link-address, UDP 546/547 aur DUIDs batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RA flags: M=1 stateful, O=1 stateless, A=1 SLAAC; gateway hamesha RA se aata hai.</li>
<li>Stateful IOS server: <code>address prefix</code> wala pool, <code>ipv6 dhcp server</code> plus <code>ipv6 nd managed-config-flag</code>.</li>
<li>Relay: <code>ipv6 dhcp relay destination</code>; link-address pool chunta hai; server ko return route chahiye.</li>
<li>Clients UDP 546 se ff02::1:2 par bhejte hain, servers UDP 547; clients DUID se pehchane jaate hain.</li>
<li><code>show ipv6 dhcp interface</code>, <code>binding</code>, <code>pool</code>, aur <code>show ipv6 interface</code> ki aakhri line se verify karo.</li>
</ul></div>
`}};export{e as default};