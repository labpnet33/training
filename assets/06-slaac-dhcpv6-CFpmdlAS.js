var e={id:`slaac-dhcpv6`,h:{en:`SLAAC, stateless DHCPv6 and stateful DHCPv6`,hi:`SLAAC, stateless DHCPv6 aur stateful DHCPv6`},body:{en:`
<p>Picture a new employee on day one. In one company, reception hands over a badge with a desk number already assigned and writes it in a register: that is <b>DHCP</b>, a server that remembers who has what. In another company, the floor manager says "your desk is somewhere on row 10, pick a free one, make sure nobody is sitting there, and here is the phone list": that is <b>SLAAC</b>, where the host builds its own address from information the router announces. IPv6 supports both, and a mix of the two.</p>

<h3>The three methods</h3>
<table class="cmp"><tr><th>Method</th><th>Address from</th><th>DNS and other options from</th><th>Who remembers the address</th><th>RA flags</th></tr>
<tr><td><b>SLAAC only</b></td><td>RA prefix + host's own interface ID</td><td>RA (RDNSS option), if the router sends it</td><td>Nobody</td><td>M=0, O=0</td></tr>
<tr><td><b>SLAAC + stateless DHCPv6</b></td><td>RA prefix + host's own interface ID</td><td>DHCPv6 server</td><td>Nobody (the server keeps no address state)</td><td>M=0, O=1</td></tr>
<tr><td><b>Stateful DHCPv6</b></td><td>DHCPv6 server (like IPv4 DHCP)</td><td>DHCPv6 server</td><td>The server keeps a binding table</td><td>M=1 (O is implied)</td></tr>
</table>
<p>In every case the <b>default gateway comes from the RA</b>, never from DHCPv6. DHCPv6 has no gateway option. A network with a DHCPv6 server but no router sending RAs leaves hosts with an address and no way off the subnet.</p>

<h3>SLAAC step by step</h3>
<ol>
<li>The host enables IPv6, creates its link-local address and runs DAD on it.</li>
<li>It sends a <b>Router Solicitation</b> to ff02::2.</li>
<li>The router answers with a <b>Router Advertisement</b>: prefix <code>2001:db8:acad:10::/64</code> with the A (autonomous) flag set, router lifetime, M and O flags, and it comes from the router's link-local address.</li>
<li>The host appends its interface ID (EUI-64, stable random, plus temporary addresses), runs DAD and starts using the address.</li>
<li>It installs the RA's source link-local address as its default gateway.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Choosing SLAAC or DHCPv6 from the RA flags">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Host receives RA</text>
<line x1="320" y1="50" x2="100" y2="110" stroke="#64748b"/><line x1="320" y1="50" x2="320" y2="110" stroke="#64748b"/><line x1="320" y1="50" x2="540" y2="110" stroke="#64748b"/>
<rect x="20" y="110" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="100" y="135" text-anchor="middle" class="svg-ink" font-size="13">M=0 O=0</text>
<rect x="240" y="110" width="160" height="40" rx="8" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">M=0 O=1</text>
<rect x="460" y="110" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="540" y="135" text-anchor="middle" class="svg-ink" font-size="13">M=1</text>
<text x="100" y="175" text-anchor="middle" class="svg-muted" font-size="12">SLAAC only</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">SLAAC + DHCPv6 for DNS</text>
<text x="540" y="175" text-anchor="middle" class="svg-muted" font-size="12">DHCPv6 gives the address</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="13">Gateway always = router link-local from the RA</text>
</svg><p class="cap">The Managed (M) and Other (O) flags in the Router Advertisement tell hosts which method to use.</p></div>

<h3>How DHCPv6 talks</h3>
<p>DHCPv6 runs over <b>UDP</b>: clients listen on port <b>546</b>, servers and relay agents on <b>547</b>. A client does not know any server address, so it sends to the multicast group <b>ff02::1:2</b> (all DHCPv6 servers and relay agents), sourced from its link-local address.</p>
<ul>
<li><b>Stateful</b>: Solicit → Advertise → Request → Reply (four messages, similar to IPv4's Discover, Offer, Request, Ack). With rapid commit it is just Solicit → Reply.</li>
<li><b>Stateless</b>: Information-request → Reply, carrying only options such as DNS servers and the domain name.</li>
</ul>
<p>DHCPv6 identifies clients by a <b>DUID</b> (DHCP Unique Identifier), not by the MAC address, so a reservation made from a MAC in IPv4 needs the DUID in IPv6. When the server is on another subnet, the router interface acts as a <b>relay agent</b>, exactly like an IPv4 helper address. Providers also use <b>DHCPv6 prefix delegation (PD)</b> to hand a whole prefix, such as a /56, to a customer router, which then carves /64s for its LANs.</p>

<h3>Configuration examples</h3>
<pre class="code"><span class="c">! SLAAC only: nothing extra. A /64 on the interface plus IPv6 routing sends RAs.</span>
interface g0/0
 ipv6 address 2001:db8:acad:10::1/64
<span class="c">! Stateless DHCPv6: SLAAC for addresses, DHCPv6 for DNS</span>
ipv6 dhcp pool OFFICE-DNS
 dns-server 2001:db8:acad:20::53
 domain-name corp.example
interface g0/0
 ipv6 nd other-config-flag
 ipv6 dhcp server OFFICE-DNS
<span class="c">! Stateful DHCPv6: server assigns addresses; stop hosts also doing SLAAC</span>
interface g0/0
 ipv6 nd managed-config-flag
 ipv6 nd prefix 2001:db8:acad:10::/64 no-autoconfig
<span class="c">! Relay to a central server on another subnet</span>
interface g0/0
 ipv6 dhcp relay destination 2001:db8:acad:20::5</pre>

<h3>Verifying which method a router advertises</h3>
<pre class="out">R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::5054:CFF:FE04:4B01
  ...
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  ND advertised default router preference is Medium
  <span class="hl">Hosts use stateless autoconfig for addresses.</span></pre>
<p>With the M flag set, the last line becomes "Hosts use DHCP to obtain routable addresses." With only the O flag, you also see "Hosts use DHCP to obtain other configuration."</p>

<div class="eg"><p><b>Worked example.</b> A hospital wants every tablet's address logged for audits. SLAAC cannot do that because no server records anything, so they choose <b>stateful DHCPv6</b> (M=1) and turn off autonomous addressing on the prefix. A guest Wi-Fi network only needs working Internet with DNS, so it uses <b>SLAAC with RDNSS</b> or SLAAC plus stateless DHCPv6 (M=0, O=1). Some mobile operating systems do not support stateful DHCPv6 at all, which is another reason SLAAC is usually kept available where phones connect.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting DHCPv6 to hand out the default gateway. Setting the M flag but leaving autonomous addressing on, so hosts end up with both a SLAAC and a DHCPv6 address. Placing a DHCPv6 server on a different subnet and forgetting the relay. Firewalling UDP 546/547.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Which method lets hosts configure an address with no server?" is <b>SLAAC</b>. "Stateless DHCPv6" still uses SLAAC for addresses; the server only provides options such as DNS. DHCPv6 uses UDP <b>546/547</b> (IPv4 DHCP uses 67/68). The gateway always comes from the <b>RA</b>.</p></div>

<div class="scn"><h4>Everyone has an address, nobody can resolve names</h4><p>After an IPv6 rollout, users could reach servers by address but every name lookup over IPv6 failed. The router's RA had M=0 and O=0, so hosts built SLAAC addresses correctly but were never told to ask for DNS, and the router sent no RDNSS option. The engineer saw "Hosts use stateless autoconfig for addresses." and no "other configuration" line. Adding <code>ipv6 nd other-config-flag</code> and a stateless DHCPv6 pool with the DNS server fixed it within one RA interval.</p><p><b>Lesson:</b> an address and a gateway are not enough; hosts also need DNS, from RDNSS or from DHCPv6 via the O flag.</p></div>

<div class="iv"><p class="q">"Explain SLAAC, stateless DHCPv6 and stateful DHCPv6. Which gives the default gateway?"</p><p>Strong answer: SLAAC builds the address from the RA prefix and a self-generated interface ID, with no server state. Stateless DHCPv6 (O=1) keeps SLAAC for addresses but gets DNS and other options from a server. Stateful DHCPv6 (M=1) gets the address itself from the server, which keeps bindings. In all three the default gateway is the router's link-local address from the RA, because DHCPv6 has no gateway option. Mention UDP 546/547, ff02::1:2 and relay agents.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLAAC: M=0 O=0, address from the RA prefix plus the host's own interface ID; no server keeps state.</li>
<li>Stateless DHCPv6: M=0 O=1, SLAAC address plus DNS and options from DHCPv6.</li>
<li>Stateful DHCPv6: M=1, the server assigns addresses and keeps bindings, identified by DUID.</li>
<li>The default gateway always comes from the RA (router link-local); DHCPv6 has no gateway option.</li>
<li>DHCPv6 uses UDP 546 (client) and 547 (server/relay) and the group ff02::1:2.</li>
</ul></div>
`,hi:`
<p>Pehle din ek naye employee ke baare mein socho. Ek company mein reception pehle se assigned desk number wala badge deta hai aur register mein likh leta hai: yeh hai <b>DHCP</b>, ek server jo yaad rakhta hai kiske paas kya hai. Doosri company mein floor manager kehta hai "tumhara desk row 10 mein kahin hai, koi khaali chun lo, pakka kar lo ki wahan koi baitha nahi, aur yeh rahi phone list": yeh hai <b>SLAAC</b>, jahan host router ki announce ki gayi jaankari se apna address khud banata hai. IPv6 dono ko support karta hai, aur dono ka mix bhi.</p>

<h3>Teen methods</h3>
<table class="cmp"><tr><th>Method</th><th>Address kahan se</th><th>DNS aur baaki options kahan se</th><th>Address kaun yaad rakhta hai</th><th>RA flags</th></tr>
<tr><td><b>Sirf SLAAC</b></td><td>RA prefix + host ka apna interface ID</td><td>RA (RDNSS option), agar router bheje</td><td>Koi nahi</td><td>M=0, O=0</td></tr>
<tr><td><b>SLAAC + stateless DHCPv6</b></td><td>RA prefix + host ka apna interface ID</td><td>DHCPv6 server</td><td>Koi nahi (server address state nahi rakhta)</td><td>M=0, O=1</td></tr>
<tr><td><b>Stateful DHCPv6</b></td><td>DHCPv6 server (IPv4 DHCP jaisa)</td><td>DHCPv6 server</td><td>Server binding table rakhta hai</td><td>M=1 (O implied hai)</td></tr>
</table>
<p>Har case mein <b>default gateway RA se aata hai</b>, DHCPv6 se kabhi nahi. DHCPv6 mein gateway option hai hi nahi. Jis network mein DHCPv6 server hai lekin RA bhejne wala router nahi, wahan hosts ke paas address hoga lekin subnet se bahar jaane ka raasta nahi.</p>

<h3>SLAAC step by step</h3>
<ol>
<li>Host IPv6 enable karta hai, apna link-local address banata hai aur us par DAD chalata hai.</li>
<li>Woh ff02::2 ko <b>Router Solicitation</b> bhejta hai.</li>
<li>Router <b>Router Advertisement</b> se jawab deta hai: prefix <code>2001:db8:acad:10::/64</code> A (autonomous) flag set ke saath, router lifetime, M aur O flags, aur yeh router ke link-local address se aata hai.</li>
<li>Host apna interface ID jodta hai (EUI-64, stable random, plus temporary addresses), DAD chalata hai aur address use karna shuru karta hai.</li>
<li>Woh RA ke source link-local address ko apne default gateway ke roop mein install karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="RA flags se SLAAC ya DHCPv6 chunna">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Host ko RA milta hai</text>
<line x1="320" y1="50" x2="100" y2="110" stroke="#64748b"/><line x1="320" y1="50" x2="320" y2="110" stroke="#64748b"/><line x1="320" y1="50" x2="540" y2="110" stroke="#64748b"/>
<rect x="20" y="110" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="100" y="135" text-anchor="middle" class="svg-ink" font-size="13">M=0 O=0</text>
<rect x="240" y="110" width="160" height="40" rx="8" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">M=0 O=1</text>
<rect x="460" y="110" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="540" y="135" text-anchor="middle" class="svg-ink" font-size="13">M=1</text>
<text x="100" y="175" text-anchor="middle" class="svg-muted" font-size="12">Sirf SLAAC</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">SLAAC + DNS ke liye DHCPv6</text>
<text x="540" y="175" text-anchor="middle" class="svg-muted" font-size="12">DHCPv6 address deta hai</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="13">Gateway hamesha = RA wala router link-local</text>
</svg><p class="cap">Router Advertisement ke Managed (M) aur Other (O) flags hosts ko batate hain ki kaunsa method use karna hai.</p></div>

<h3>DHCPv6 kaise baat karta hai</h3>
<p>DHCPv6 <b>UDP</b> par chalta hai: clients port <b>546</b> par sunte hain, servers aur relay agents <b>547</b> par. Client ko kisi server ka address pata nahi hota, isliye woh multicast group <b>ff02::1:2</b> (saare DHCPv6 servers aur relay agents) ko bhejta hai, apne link-local address se.</p>
<ul>
<li><b>Stateful</b>: Solicit → Advertise → Request → Reply (chaar messages, IPv4 ke Discover, Offer, Request, Ack jaisa). Rapid commit ke saath sirf Solicit → Reply.</li>
<li><b>Stateless</b>: Information-request → Reply, jisme sirf DNS servers aur domain name jaise options hote hain.</li>
</ul>
<p>DHCPv6 clients ko <b>DUID</b> (DHCP Unique Identifier) se pehchanta hai, MAC address se nahi, isliye IPv4 mein MAC se bani reservation ke liye IPv6 mein DUID chahiye. Jab server doosre subnet par ho, router interface <b>relay agent</b> ki tarah kaam karta hai, bilkul IPv4 helper address jaisa. Providers <b>DHCPv6 prefix delegation (PD)</b> se customer router ko poora prefix, jaise /56, dete hain, jo phir apne LANs ke liye /64s kaatta hai.</p>

<h3>Configuration examples</h3>
<pre class="code"><span class="c">! Sirf SLAAC: kuch extra nahi. Interface par /64 plus IPv6 routing se RAs jaate hain.</span>
interface g0/0
 ipv6 address 2001:db8:acad:10::1/64
<span class="c">! Stateless DHCPv6: addresses ke liye SLAAC, DNS ke liye DHCPv6</span>
ipv6 dhcp pool OFFICE-DNS
 dns-server 2001:db8:acad:20::53
 domain-name corp.example
interface g0/0
 ipv6 nd other-config-flag
 ipv6 dhcp server OFFICE-DNS
<span class="c">! Stateful DHCPv6: server addresses deta hai; hosts ko SLAAC karne se roko</span>
interface g0/0
 ipv6 nd managed-config-flag
 ipv6 nd prefix 2001:db8:acad:10::/64 no-autoconfig
<span class="c">! Doosre subnet ke central server ko relay</span>
interface g0/0
 ipv6 dhcp relay destination 2001:db8:acad:20::5</pre>

<h3>Router kaunsa method advertise kar raha hai, verify karna</h3>
<pre class="out">R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::5054:CFF:FE04:4B01
  ...
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  ND advertised default router preference is Medium
  <span class="hl">Hosts use stateless autoconfig for addresses.</span></pre>
<p>M flag set hone par aakhri line ban jaati hai "Hosts use DHCP to obtain routable addresses." Sirf O flag ho to "Hosts use DHCP to obtain other configuration." bhi dikhta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek hospital audits ke liye har tablet ka address log karna chahta hai. SLAAC yeh nahi kar sakta kyunki koi server kuch record nahi karta, isliye woh <b>stateful DHCPv6</b> (M=1) chunte hain aur prefix par autonomous addressing band karte hain. Guest Wi-Fi ko sirf DNS ke saath chalta Internet chahiye, isliye wahan <b>SLAAC with RDNSS</b> ya SLAAC plus stateless DHCPv6 (M=0, O=1) use hota hai. Kuch mobile operating systems stateful DHCPv6 support hi nahi karte, yeh ek aur wajah hai ki jahan phones connect hote hain wahan SLAAC aam taur par available rakha jata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> DHCPv6 se default gateway ki ummeed karna. M flag set karna lekin autonomous addressing on chhod dena, jisse hosts ke paas SLAAC aur DHCPv6 dono address aa jaate hain. DHCPv6 server doosre subnet par rakhna aur relay bhool jaana. UDP 546/547 ko firewall kar dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Kaunsa method hosts ko bina server ke address configure karne deta hai?" jawab <b>SLAAC</b>. "Stateless DHCPv6" addresses ke liye ab bhi SLAAC use karta hai; server sirf DNS jaise options deta hai. DHCPv6 UDP <b>546/547</b> use karta hai (IPv4 DHCP 67/68). Gateway hamesha <b>RA</b> se aata hai.</p></div>

<div class="scn"><h4>Sabke paas address hai, naam koi resolve nahi kar pa raha</h4><p>IPv6 rollout ke baad users address se servers tak pahunch rahe the lekin IPv6 par har name lookup fail ho raha tha. Router ke RA mein M=0 aur O=0 tha, isliye hosts ne SLAAC addresses sahi banaye lekin unhe kabhi DNS maangne ko nahi kaha gaya, aur router koi RDNSS option nahi bhej raha tha. Engineer ne "Hosts use stateless autoconfig for addresses." dekha aur "other configuration" wali line nahi thi. <code>ipv6 nd other-config-flag</code> aur DNS server ke saath stateless DHCPv6 pool jodne se ek RA interval mein fix ho gaya.</p><p><b>Seekh:</b> address aur gateway kaafi nahi hain; hosts ko DNS bhi chahiye, RDNSS se ya O flag ke through DHCPv6 se.</p></div>

<div class="iv"><p class="q">"SLAAC, stateless DHCPv6 aur stateful DHCPv6 samjhao. Default gateway kaun deta hai?"</p><p>Strong answer: SLAAC RA prefix aur khud banaye interface ID se address banata hai, bina server state ke. Stateless DHCPv6 (O=1) addresses ke liye SLAAC rakhta hai lekin DNS aur baaki options server se leta hai. Stateful DHCPv6 (M=1) address hi server se leta hai, jo bindings rakhta hai. Teeno mein default gateway RA wala router ka link-local address hai, kyunki DHCPv6 mein gateway option nahi hai. UDP 546/547, ff02::1:2 aur relay agents ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SLAAC: M=0 O=0, address RA prefix plus host ke apne interface ID se; koi server state nahi rakhta.</li>
<li>Stateless DHCPv6: M=0 O=1, SLAAC address plus DHCPv6 se DNS aur options.</li>
<li>Stateful DHCPv6: M=1, server addresses deta hai aur bindings rakhta hai, DUID se pehchanta hai.</li>
<li>Default gateway hamesha RA se aata hai (router link-local); DHCPv6 mein gateway option nahi hai.</li>
<li>DHCPv6 UDP 546 (client) aur 547 (server/relay) aur group ff02::1:2 use karta hai.</li>
</ul></div>
`}};export{e as default};