var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a hotel: a reception desk that hands out rooms (DHCP), an operator who finds people by name (DNS), a master clock (NTP) and a switchboard that shares one outside line (PAT). You have now configured all of these on a router and learned to troubleshoot them. Use this chapter as your revision sheet the week before the exam and the morning of an interview.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="145" height="56" rx="8" fill="#bbf7d0"/><text x="82" y="44" text-anchor="middle" class="svg-ink" font-size="13">DHCP / SLAAC</text><text x="82" y="63" text-anchor="middle" class="svg-muted" font-size="12">UDP 67/68, 546/547</text>
<rect x="170" y="20" width="145" height="56" rx="8" fill="#fde68a"/><text x="242" y="44" text-anchor="middle" class="svg-ink" font-size="13">DNS</text><text x="242" y="63" text-anchor="middle" class="svg-muted" font-size="12">UDP/TCP 53</text>
<rect x="330" y="20" width="145" height="56" rx="8" fill="#bae6fd"/><text x="402" y="44" text-anchor="middle" class="svg-ink" font-size="13">NTP / PTP / NTS</text><text x="402" y="63" text-anchor="middle" class="svg-muted" font-size="12">UDP 123</text>
<rect x="490" y="20" width="140" height="56" rx="8" fill="#fed7aa"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">NAT / PAT</text><text x="560" y="63" text-anchor="middle" class="svg-muted" font-size="12">inside ↔ outside</text>
<rect x="10" y="100" width="620" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot in order: address → gateway → name → edge → time</text>
</svg><p class="cap">The four service families of this module and the troubleshooting order that ties them together.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain DORA, the ports (67/68) and the lease timers T1 (50%) and T2 (87.5%).</li>
<li>I can configure a DHCP pool with exclusions, gateway, DNS, domain name and lease time, and create a reservation.</li>
<li>I can explain why a DHCP relay is needed and place <code>ip helper-address</code> on the correct interface.</li>
<li>I can describe SLAAC, the M and O flags, and stateless vs stateful DHCPv6.</li>
<li>I can explain recursive vs iterative resolution, caching and TTL, and the role of the hosts file.</li>
<li>I can match every DNS record type to its job and build a reverse (PTR) name.</li>
<li>I can explain primary vs secondary servers and zone transfers.</li>
<li>I can explain what DNSSEC, DoT and DoH (DNS over HTTPS) each protect.</li>
<li>I can configure and verify NTP and explain stratum, PTP and NTS.</li>
<li>I can configure PAT and read <code>show ip nat translations</code>.</li>
<li>I can troubleshoot the classic faults: 169.254, missing helper, full pool, works-by-IP-only, NAT not translating, unsynchronised clock.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Scope / pool</dt><dd>The range of addresses and options for one subnet.</dd>
<dt>Exclusion / reservation</dt><dd>Addresses never handed out / one address always given to one client.</dd>
<dt>APIPA</dt><dd>Self-assigned 169.254.0.0/16 address when DHCP fails.</dd>
<dt>Relay (IP helper)</dt><dd>Forwards DHCP broadcasts to a server on another subnet, filling in giaddr.</dd>
<dt>SLAAC</dt><dd>IPv6 hosts build their own address from the RA prefix.</dd>
<dt>Recursive resolver</dt><dd>The DNS server that chases answers for clients and caches them.</dd>
<dt>Authoritative</dt><dd>An answer from the server that holds the zone (AA flag).</dd>
<dt>Zone transfer</dt><dd>Copying a zone from primary to secondary (AXFR/IXFR, TCP 53).</dd>
<dt>DNSSEC</dt><dd>Signatures on DNS records for integrity and authenticity.</dd>
<dt>Stratum</dt><dd>Distance from the reference clock; 16 = unsynchronised.</dd>
<dt>Inside local / inside global</dt><dd>A host's private address / the public address that represents it.</dd>
<dt>PAT (overload)</dt><dd>Many hosts share one public address, separated by port.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>DHCP</td><td>UDP 67 server / 68 client; Discover and Request are broadcasts; renew at 50%</td></tr>
<tr><td>DHCP options</td><td>3 router, 6 DNS, 15 domain, 42 NTP, 43 vendor, 51 lease, 66/67 boot</td></tr>
<tr><td>DHCPv6</td><td>UDP 546 client / 547 server; gateway always from the RA</td></tr>
<tr><td>SLAAC</td><td>RS 133 / RA 134; M flag = stateful, O flag = other info; needs /64</td></tr>
<tr><td>DNS</td><td>UDP 53 queries; TCP 53 zone transfers; A, AAAA, CNAME, MX, TXT, NS, PTR, SOA, SRV</td></tr>
<tr><td>Reverse zones</td><td>in-addr.arpa (IPv4), ip6.arpa (IPv6)</td></tr>
<tr><td>Encrypted DNS</td><td>DoT TCP 853; DoH (DNS over HTTPS) TCP 443; DNSSEC signs, does not encrypt</td></tr>
<tr><td>Time</td><td>NTP UDP 123; PTP IEEE 1588 sub-microsecond; NTS-KE TCP 4460</td></tr>
<tr><td>NAT</td><td>RFC 1918: 10/8, 172.16/12, 192.168/16; CGNAT 100.64/10; PAT = overload</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! DHCP server</span>
ip dhcp excluded-address 192.168.10.1 192.168.10.20
ip dhcp pool LAN
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 192.168.10.1
show ip dhcp pool | show ip dhcp binding | show ip dhcp conflict
<span class="c">! DHCP relay (client-facing interface)</span>
ip helper-address 10.0.20.10
<span class="c">! DNS on the router</span>
ip dns server
ip host web.nwk.lab 10.0.20.10
show hosts
<span class="c">! NTP</span>
ntp server 10.0.20.10
show ntp status | show ntp associations
<span class="c">! PAT</span>
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside
access-list 1 permit 192.168.10.0 0.0.0.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
show ip nat translations | show ip nat statistics
<span class="c">! Lab PCs</span>
ip dhcp | show ip | ip dns 192.168.10.1 | nslookup web.nwk.lab</pre>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Helper on the wrong interface; forgetting exclusions; confusing exclusion with reservation; thinking DNSSEC encrypts; forgetting that the IPv6 gateway comes from the RA; forgetting <code>overload</code>; swapping NAT inside and outside.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Read symptom questions for the key clue: "169.254" (DHCP), "by IP but not by name" (DNS), "only one VLAN" (relay), "only the first user" (no overload), "clock skew" (NTP), "RRSIG/DS" (DNSSEC), "port 853" (DoT), "port 443 DNS" (DoH).</p></div>

<div class="scn"><h4>The new branch go-live checklist</h4><p>A network team opening a new branch turned this module into a go-live checklist: DHCP pool with exclusions and a reservation for the printer; relay on every user VLAN pointing to both central DHCP servers; DNS servers handed out by DHCP and tested with nslookup for internal and external names; NTP pointing at three HQ sources with <code>show ntp status</code> showing synchronized; PAT on the internet router with translations verified. The branch opened on Monday with zero tickets.</p><p><b>Lesson:</b> these services are simple individually, but a checklist that covers all of them is what makes a site "just work".</p></div>

<div class="iv"><p class="q">"A new laptop is plugged in and the user opens a website by name. Which services are involved, from power-on to page?"</p><p>Strong answer: DHCP (DORA) gives the IP, mask, gateway and DNS server (options 1, 3, 6); IPv6 may also configure via SLAAC. The OS checks the hosts file and cache, then sends a DNS query (UDP 53) to the resolver, which resolves recursively and returns an A or AAAA record. The browser connects; at the edge, PAT translates the private source to the public address and records the mapping. NTP in the background keeps the clock right so the site's TLS certificate validates. Walking the whole chain shows you understand how the services fit together.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP, SLAAC and DHCPv6 give hosts their addresses and options; relays extend DHCP across routers.</li>
<li>DNS resolves names through resolvers, zones and records; DNSSEC, DoT and DoH make it trustworthy and private.</li>
<li>NTP, PTP and NTS keep time accurate and authenticated.</li>
<li>PAT lets a whole network share one public IPv4 address.</li>
<li>Troubleshoot in order: address, gateway, name, edge, time.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek hotel se shuru kiya tha: reception desk jo rooms deta hai (DHCP), operator jo logon ko naam se dhoondhta hai (DNS), master clock (NTP) aur switchboard jo ek outside line share karta hai (PAT). Ab aap yeh sab router par configure kar chuke ho aur inhe troubleshoot karna seekh chuke ho. Is chapter ko exam se pehle wale hafte aur interview ki subah apni revision sheet ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="145" height="56" rx="8" fill="#bbf7d0"/><text x="82" y="44" text-anchor="middle" class="svg-ink" font-size="13">DHCP / SLAAC</text><text x="82" y="63" text-anchor="middle" class="svg-muted" font-size="12">UDP 67/68, 546/547</text>
<rect x="170" y="20" width="145" height="56" rx="8" fill="#fde68a"/><text x="242" y="44" text-anchor="middle" class="svg-ink" font-size="13">DNS</text><text x="242" y="63" text-anchor="middle" class="svg-muted" font-size="12">UDP/TCP 53</text>
<rect x="330" y="20" width="145" height="56" rx="8" fill="#bae6fd"/><text x="402" y="44" text-anchor="middle" class="svg-ink" font-size="13">NTP / PTP / NTS</text><text x="402" y="63" text-anchor="middle" class="svg-muted" font-size="12">UDP 123</text>
<rect x="490" y="20" width="140" height="56" rx="8" fill="#fed7aa"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">NAT / PAT</text><text x="560" y="63" text-anchor="middle" class="svg-muted" font-size="12">inside ↔ outside</text>
<rect x="10" y="100" width="620" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Is order mein troubleshoot karo: address → gateway → naam → edge → time</text>
</svg><p class="cap">Is module ki chaar service families aur troubleshooting order jo unhe jodta hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main DORA, ports (67/68) aur lease timers T1 (50%) aur T2 (87.5%) samjha sakta hoon.</li>
<li>Main exclusions, gateway, DNS, domain name aur lease time ke saath DHCP pool configure kar sakta hoon, aur reservation bana sakta hoon.</li>
<li>Main samjha sakta hoon ki DHCP relay kyun chahiye aur <code>ip helper-address</code> sahi interface par laga sakta hoon.</li>
<li>Main SLAAC, M aur O flags, aur stateless vs stateful DHCPv6 describe kar sakta hoon.</li>
<li>Main recursive vs iterative resolution, caching aur TTL, aur hosts file ka role samjha sakta hoon.</li>
<li>Main har DNS record type ko uske kaam se match kar sakta hoon aur reverse (PTR) naam bana sakta hoon.</li>
<li>Main primary vs secondary servers aur zone transfers samjha sakta hoon.</li>
<li>Main samjha sakta hoon ki DNSSEC, DoT aur DoH (DNS over HTTPS) har ek kya bachata hai.</li>
<li>Main NTP configure aur verify kar sakta hoon aur stratum, PTP aur NTS samjha sakta hoon.</li>
<li>Main PAT configure kar sakta hoon aur <code>show ip nat translations</code> padh sakta hoon.</li>
<li>Main classic faults troubleshoot kar sakta hoon: 169.254, missing helper, full pool, sirf-IP-se-chalta-hai, NAT translate nahi kar raha, unsynchronised clock.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Scope / pool</dt><dd>Ek subnet ke liye addresses aur options ki range.</dd>
<dt>Exclusion / reservation</dt><dd>Addresses jo kabhi nahi diye jaate / ek address jo hamesha ek client ko diya jaata hai.</dd>
<dt>APIPA</dt><dd>DHCP fail hone par khud assign kiya gaya 169.254.0.0/16 address.</dd>
<dt>Relay (IP helper)</dt><dd>DHCP broadcasts ko doosre subnet ke server tak forward karta hai, giaddr bharte hue.</dd>
<dt>SLAAC</dt><dd>IPv6 hosts RA prefix se apna address khud banate hain.</dd>
<dt>Recursive resolver</dt><dd>Woh DNS server jo clients ke liye answers dhoondhta aur cache karta hai.</dd>
<dt>Authoritative</dt><dd>Zone rakhne wale server se aaya answer (AA flag).</dd>
<dt>Zone transfer</dt><dd>Zone ko primary se secondary par copy karna (AXFR/IXFR, TCP 53).</dd>
<dt>DNSSEC</dt><dd>Integrity aur authenticity ke liye DNS records par signatures.</dd>
<dt>Stratum</dt><dd>Reference clock se doori; 16 = unsynchronised.</dd>
<dt>Inside local / inside global</dt><dd>Host ka private address / use represent karne wala public address.</dd>
<dt>PAT (overload)</dt><dd>Bahut saare hosts ek public address share karte hain, port se alag.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>DHCP</td><td>UDP 67 server / 68 client; Discover aur Request broadcasts hain; 50% par renew</td></tr>
<tr><td>DHCP options</td><td>3 router, 6 DNS, 15 domain, 42 NTP, 43 vendor, 51 lease, 66/67 boot</td></tr>
<tr><td>DHCPv6</td><td>UDP 546 client / 547 server; gateway hamesha RA se</td></tr>
<tr><td>SLAAC</td><td>RS 133 / RA 134; M flag = stateful, O flag = other info; /64 chahiye</td></tr>
<tr><td>DNS</td><td>UDP 53 queries; TCP 53 zone transfers; A, AAAA, CNAME, MX, TXT, NS, PTR, SOA, SRV</td></tr>
<tr><td>Reverse zones</td><td>in-addr.arpa (IPv4), ip6.arpa (IPv6)</td></tr>
<tr><td>Encrypted DNS</td><td>DoT TCP 853; DoH (DNS over HTTPS) TCP 443; DNSSEC sign karta hai, encrypt nahi</td></tr>
<tr><td>Time</td><td>NTP UDP 123; PTP IEEE 1588 sub-microsecond; NTS-KE TCP 4460</td></tr>
<tr><td>NAT</td><td>RFC 1918: 10/8, 172.16/12, 192.168/16; CGNAT 100.64/10; PAT = overload</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! DHCP server</span>
ip dhcp excluded-address 192.168.10.1 192.168.10.20
ip dhcp pool LAN
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 192.168.10.1
show ip dhcp pool | show ip dhcp binding | show ip dhcp conflict
<span class="c">! DHCP relay (client-facing interface)</span>
ip helper-address 10.0.20.10
<span class="c">! Router par DNS</span>
ip dns server
ip host web.nwk.lab 10.0.20.10
show hosts
<span class="c">! NTP</span>
ntp server 10.0.20.10
show ntp status | show ntp associations
<span class="c">! PAT</span>
interface GigabitEthernet0/0
 ip nat inside
interface GigabitEthernet0/1
 ip nat outside
access-list 1 permit 192.168.10.0 0.0.0.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
show ip nat translations | show ip nat statistics
<span class="c">! Lab PCs</span>
ip dhcp | show ip | ip dns 192.168.10.1 | nslookup web.nwk.lab</pre>

<div class="warn"><p><b>Last-minute galtiyan jinse bachna hai.</b> Galat interface par helper; exclusions bhool jaana; exclusion aur reservation mein confusion; sochna ki DNSSEC encrypt karta hai; bhool jaana ki IPv6 gateway RA se aata hai; <code>overload</code> bhool jaana; NAT inside aur outside ulta karna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Symptom questions mein key clue padho: "169.254" (DHCP), "IP se lekin naam se nahi" (DNS), "sirf ek VLAN" (relay), "sirf pehla user" (overload nahi), "clock skew" (NTP), "RRSIG/DS" (DNSSEC), "port 853" (DoT), "port 443 DNS" (DoH).</p></div>

<div class="scn"><h4>Nayi branch ka go-live checklist</h4><p>Nayi branch khol rahi ek network team ne is module ko go-live checklist bana diya: exclusions aur printer ki reservation ke saath DHCP pool; har user VLAN par dono central DHCP servers ki taraf relay; DHCP se diye gaye DNS servers, internal aur external names ke liye nslookup se tested; teen HQ sources par NTP, <code>show ntp status</code> synchronized dikhata hua; internet router par PAT, translations verified. Branch Monday ko zero tickets ke saath khuli.</p><p><b>Seekh:</b> yeh services akele akele simple hain, lekin sabko cover karne wala checklist hi site ko "bas chalne wala" banata hai.</p></div>

<div class="iv"><p class="q">"Naya laptop plug in hota hai aur user naam se website kholta hai. Power-on se page tak kaunsi services involved hain?"</p><p>Strong answer: DHCP (DORA) IP, mask, gateway aur DNS server deta hai (options 1, 3, 6); IPv6 SLAAC se bhi configure ho sakta hai. OS hosts file aur cache check karta hai, phir resolver ko DNS query (UDP 53) bhejta hai, jo recursively resolve karke A ya AAAA record lautata hai. Browser connect karta hai; edge par PAT private source ko public address mein translate karta hai aur mapping record karta hai. Background mein NTP clock sahi rakhta hai taaki site ka TLS certificate validate ho. Poori chain batana dikhata hai ki aap samajhte ho services aapas mein kaise judti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP, SLAAC aur DHCPv6 hosts ko unke addresses aur options dete hain; relays DHCP ko routers ke paar le jaate hain.</li>
<li>DNS resolvers, zones aur records se names resolve karta hai; DNSSEC, DoT aur DoH ise trustworthy aur private banate hain.</li>
<li>NTP, PTP aur NTS time ko accurate aur authenticated rakhte hain.</li>
<li>PAT poore network ko ek public IPv4 address share karne deta hai.</li>
<li>Is order mein troubleshoot karo: address, gateway, naam, edge, time.</li>
</ul></div>
`}};export{e as default};