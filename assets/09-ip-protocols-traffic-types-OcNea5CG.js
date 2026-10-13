var e={id:`ip-types`,h:{en:`IP protocol types and traffic types: ICMP, GRE, IPsec, unicast to anycast`,hi:`IP protocol types aur traffic types: ICMP, GRE, IPsec, unicast se anycast`},body:{en:`
<p>Not everything inside an IP packet is TCP or UDP. The IP header's <b>Protocol</b> field (chapter 2) says what the payload is, and several important protocols have <b>no port numbers at all</b>. Objective 1.4 also asks you to tell apart four ways of addressing traffic: unicast, broadcast, multicast and anycast. Think of a post office: a letter to one person, a notice to every house on the street, a magazine to its subscribers, and a call to "the nearest open pharmacy".</p>

<h3>The IP protocol numbers to know</h3>
<table class="cmp"><tr><th>Protocol number</th><th>Protocol</th><th>Purpose</th></tr>
<tr><td>1</td><td>ICMP</td><td>Error reporting and diagnostics (ping, traceroute, unreachable, time exceeded)</td></tr>
<tr><td>6</td><td>TCP</td><td>Reliable, connection-oriented transport</td></tr>
<tr><td>17</td><td>UDP</td><td>Connectionless, best-effort transport</td></tr>
<tr><td>47</td><td>GRE</td><td>Generic Routing Encapsulation tunnels</td></tr>
<tr><td>50</td><td>ESP</td><td>IPsec Encapsulating Security Payload: encryption plus integrity</td></tr>
<tr><td>51</td><td>AH</td><td>IPsec Authentication Header: integrity and authentication, no encryption</td></tr>
</table>
<p>Because GRE, ESP and AH sit directly on IP, a firewall must permit them <b>by protocol</b>, not by port.</p>

<h3>ICMP</h3>
<p><b>ICMP</b> (Internet Control Message Protocol) carries messages about the network itself. Types you will see: <b>8</b> echo request and <b>0</b> echo reply (ping); <b>3</b> destination unreachable, with codes such as 1 host unreachable, 3 port unreachable and 4 fragmentation needed; <b>11</b> time exceeded (TTL reached 0, used by traceroute); <b>5</b> redirect. Blocking all ICMP "for security" breaks path MTU discovery and troubleshooting; good practice is to allow the useful types.</p>

<h3>GRE</h3>
<p><b>GRE</b> wraps almost any packet, including multicast and routing protocol traffic, inside a new IP packet with a 4-byte GRE header (24 bytes of overhead with the new IP header). It creates a simple point-to-point tunnel interface. GRE provides <b>no encryption</b>, so it is often run inside IPsec (GRE over IPsec) when a tunnel must carry routing protocols securely.</p>

<h3>IPsec: IKE, AH and ESP</h3>
<ul>
<li><b>IKE</b> (Internet Key Exchange) authenticates the peers and negotiates keys and security associations. It runs over <b>UDP 500</b>. When either peer is behind NAT, IPsec switches to <b>NAT traversal</b> and uses <b>UDP 4500</b>.</li>
<li><b>AH</b> (protocol 51) signs the whole packet, including the outer IP header, to prove integrity and origin. It does <b>not encrypt</b>, and because NAT changes the IP header, AH <b>breaks through NAT</b>.</li>
<li><b>ESP</b> (protocol 50) <b>encrypts</b> the payload and provides integrity and authentication. It is what almost every real VPN uses.</li>
</ul>
<p>IPsec runs in <b>tunnel mode</b> (the whole original packet is encrypted and a new IP header is added; used between gateways for site-to-site VPNs) or <b>transport mode</b> (only the payload is protected; used host to host).</p>

<pre class="code"><span class="c">! Edge ACL on the head-office router: allow a branch VPN and useful ICMP</span>
ip access-list extended OUTSIDE-IN
 permit udp host 198.51.100.2 host 203.0.113.1 eq isakmp
 permit udp host 198.51.100.2 host 203.0.113.1 eq non500-isakmp
 permit esp host 198.51.100.2 host 203.0.113.1
 permit gre host 198.51.100.2 host 203.0.113.1
 permit icmp any any echo-reply
 permit icmp any any time-exceeded
 permit icmp any any unreachable
interface GigabitEthernet0/1
 ip access-group OUTSIDE-IN in</pre>
<pre class="out">R1# show access-lists OUTSIDE-IN
Extended IP access list OUTSIDE-IN
    10 permit udp host 198.51.100.2 host 203.0.113.1 eq isakmp (14 matches)
    20 permit udp host 198.51.100.2 host 203.0.113.1 eq non500-isakmp (52 matches)
<span class="hl">    30 permit esp host 198.51.100.2 host 203.0.113.1 (18342 matches)</span>
    40 permit gre host 198.51.100.2 host 203.0.113.1
    50 permit icmp any any echo-reply (9 matches)
    60 permit icmp any any time-exceeded (3 matches)
    70 permit icmp any any unreachable (1 match)</pre>
<p>On IOS, <code>isakmp</code> means UDP 500 and <code>non500-isakmp</code> means UDP 4500. The ESP line has thousands of matches: the tunnel is carrying data. The GRE line has none because this tunnel does not use GRE.</p>

<h3>Traffic types: who receives the packet</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Unicast, broadcast, multicast and anycast">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">Unicast</text><text x="240" y="20" text-anchor="middle" class="svg-ink" font-size="13">Broadcast</text><text x="400" y="20" text-anchor="middle" class="svg-ink" font-size="13">Multicast</text><text x="560" y="20" text-anchor="middle" class="svg-ink" font-size="13">Anycast</text>
<circle cx="80" cy="50" r="14" fill="#fde68a"/><circle cx="240" cy="50" r="14" fill="#fde68a"/><circle cx="400" cy="50" r="14" fill="#fde68a"/><circle cx="560" cy="50" r="14" fill="#fde68a"/>
<circle cx="40" cy="150" r="12" fill="#bbf7d0"/><circle cx="80" cy="150" r="12" fill="#e2e8f0"/><circle cx="120" cy="150" r="12" fill="#e2e8f0"/>
<circle cx="200" cy="150" r="12" fill="#bbf7d0"/><circle cx="240" cy="150" r="12" fill="#bbf7d0"/><circle cx="280" cy="150" r="12" fill="#bbf7d0"/>
<circle cx="360" cy="150" r="12" fill="#bbf7d0"/><circle cx="400" cy="150" r="12" fill="#e2e8f0"/><circle cx="440" cy="150" r="12" fill="#bbf7d0"/>
<circle cx="520" cy="150" r="12" fill="#bbf7d0"/><circle cx="560" cy="170" r="12" fill="#e2e8f0"/><circle cx="600" cy="185" r="12" fill="#e2e8f0"/>
<line x1="80" y1="64" x2="40" y2="138" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="64" x2="200" y2="138" stroke="#64748b" stroke-width="2"/><line x1="240" y1="64" x2="240" y2="138" stroke="#64748b" stroke-width="2"/><line x1="240" y1="64" x2="280" y2="138" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="64" x2="360" y2="138" stroke="#64748b" stroke-width="2"/><line x1="400" y1="64" x2="440" y2="138" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="520" y2="138" stroke="#64748b" stroke-width="2"/>
<text x="80" y="210" text-anchor="middle" class="svg-muted" font-size="12">one to one</text><text x="240" y="210" text-anchor="middle" class="svg-muted" font-size="12">one to all</text><text x="400" y="210" text-anchor="middle" class="svg-muted" font-size="12">one to a group</text><text x="560" y="210" text-anchor="middle" class="svg-muted" font-size="12">one to nearest</text>
</svg><p class="cap">Green hosts receive the packet. In anycast several servers share one address and routing delivers to the closest.</p></div>
<ul>
<li><b>Unicast:</b> one sender to one receiver. Almost all traffic: web, SSH, file transfers.</li>
<li><b>Broadcast:</b> one sender to <b>every</b> host in the Layer 2 broadcast domain (VLAN). IPv4 limited broadcast is 255.255.255.255; the MAC is FF:FF:FF:FF:FF:FF. ARP requests and DHCP DISCOVER use it. Routers do not forward broadcasts. <b>IPv6 has no broadcast</b>; it uses multicast instead.</li>
<li><b>Multicast:</b> one sender to a <b>group</b> of interested receivers. IPv4 range 224.0.0.0/4 (224.0.0.0 to 239.255.255.255). Hosts join groups with <b>IGMP</b>; switches with IGMP snooping send the stream only to ports with members. Used for IPTV, market data, and routing protocols (OSPF uses 224.0.0.5 and 224.0.0.6).</li>
<li><b>Anycast:</b> the same address is configured on <b>several</b> servers in different places, and routing delivers each packet to the <b>nearest</b> one. Native in IPv6; done with BGP for IPv4. DNS root servers, public resolvers and CDNs use it for speed and resilience.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A 4 Mb/s video stream goes to 50 viewers. As unicast, the server sends 50 copies: 200 Mb/s. As multicast, it sends one copy (4 Mb/s) and the network replicates it only where branches split. As broadcast, it would hit every host in the VLAN, interested or not.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing a firewall rule "UDP 50" for ESP. ESP is IP protocol 50, not a port. Choosing AH when the peers are behind NAT. Assuming GRE is secure because it is "a tunnel". Blocking all ICMP and then wondering why large packets disappear.</p></div>

<div class="exam"><p><b>Exam traps.</b> ICMP 1, TCP 6, UDP 17, GRE 47, ESP 50, AH 51; IKE UDP 500, NAT-T UDP 4500. AH = integrity without encryption; ESP = encryption. Broadcast stays in the VLAN and does not exist in IPv6. Anycast = nearest of many. Multicast = 224.0.0.0/4 with IGMP.</p></div>

<div class="scn"><h4>The tunnel that came up but carried nothing</h4><p>A branch firewall showed its IPsec tunnel to head office as "up": IKE had completed. Yet no traffic crossed it. The head-office edge ACL allowed UDP 500 and UDP 4500 but not IP protocol 50. The branch was not behind NAT, so the data was sent as raw ESP, which the ACL dropped. Adding <code>permit esp</code> for the branch peer fixed it; the ESP line's match counter started climbing immediately.</p><p><b>Lesson:</b> IPsec needs IKE for the control plane and ESP (or UDP 4500 with NAT-T) for the data; a working IKE does not prove the data path.</p></div>

<div class="iv"><p class="q">"What is the difference between AH and ESP, and which ports or protocols must a firewall allow for IPsec?"</p><p>Strong answer: AH (IP protocol 51) provides integrity and origin authentication for the whole packet but no confidentiality, and it breaks through NAT because it covers the IP header. ESP (IP protocol 50) encrypts the payload and adds integrity, so it is the normal choice. For IPsec a firewall must allow IKE on UDP 500, NAT-T on UDP 4500 when NAT is present, and ESP (protocol 50), plus AH (51) only if AH is used. Mention tunnel versus transport mode.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The IP Protocol field identifies the payload: ICMP 1, TCP 6, UDP 17, GRE 47, ESP 50, AH 51.</li>
<li>GRE tunnels anything but does not encrypt; ESP encrypts; AH authenticates only and fails with NAT.</li>
<li>IKE uses UDP 500, and UDP 4500 for NAT traversal.</li>
<li>Unicast one to one, broadcast one to all (IPv4 only), multicast one to a group (IGMP), anycast one to nearest.</li>
<li>Allow useful ICMP types; blocking all ICMP breaks troubleshooting and path MTU discovery.</li>
</ul></div>
`,hi:`
<p>IP packet ke andar sab kuch TCP ya UDP nahi hota. IP header ka <b>Protocol</b> field (chapter 2) batata hai ki payload kya hai, aur kai important protocols ke <b>port numbers hote hi nahi</b>. Objective 1.4 aapse traffic address karne ke chaar tareeke bhi alag karwata hai: unicast, broadcast, multicast aur anycast. Post office socho: ek insaan ko chitthi, gali ke har ghar ko notice, subscribers ko magazine, aur "sabse nazdeek khuli pharmacy" ko call.</p>

<h3>IP protocol numbers jo jaanne hain</h3>
<table class="cmp"><tr><th>Protocol number</th><th>Protocol</th><th>Kaam</th></tr>
<tr><td>1</td><td>ICMP</td><td>Error reporting aur diagnostics (ping, traceroute, unreachable, time exceeded)</td></tr>
<tr><td>6</td><td>TCP</td><td>Reliable, connection-oriented transport</td></tr>
<tr><td>17</td><td>UDP</td><td>Connectionless, best-effort transport</td></tr>
<tr><td>47</td><td>GRE</td><td>Generic Routing Encapsulation tunnels</td></tr>
<tr><td>50</td><td>ESP</td><td>IPsec Encapsulating Security Payload: encryption plus integrity</td></tr>
<tr><td>51</td><td>AH</td><td>IPsec Authentication Header: integrity aur authentication, encryption nahi</td></tr>
</table>
<p>Kyunki GRE, ESP aur AH seedhe IP par baithte hain, firewall ko unhe <b>protocol se</b> permit karna padta hai, port se nahi.</p>

<h3>ICMP</h3>
<p><b>ICMP</b> (Internet Control Message Protocol) khud network ke baare mein messages le jaata hai. Jo types aap dekhoge: <b>8</b> echo request aur <b>0</b> echo reply (ping); <b>3</b> destination unreachable, codes jaise 1 host unreachable, 3 port unreachable aur 4 fragmentation needed; <b>11</b> time exceeded (TTL 0 ho gaya, traceroute use karta hai); <b>5</b> redirect. "Security ke liye" saara ICMP block karna path MTU discovery aur troubleshooting tod deta hai; achhi practice kaam ke types allow karna hai.</p>

<h3>GRE</h3>
<p><b>GRE</b> lagbhag kisi bhi packet ko, multicast aur routing protocol traffic samet, 4-byte GRE header ke saath ek naye IP packet mein wrap karta hai (naye IP header ke saath 24 bytes overhead). Yeh ek simple point-to-point tunnel interface banata hai. GRE <b>koi encryption nahi</b> deta, isliye jab tunnel ko routing protocols securely le jaane hon to ise aksar IPsec ke andar chalaya jaata hai (GRE over IPsec).</p>

<h3>IPsec: IKE, AH aur ESP</h3>
<ul>
<li><b>IKE</b> (Internet Key Exchange) peers ko authenticate karta hai aur keys aur security associations negotiate karta hai. Yeh <b>UDP 500</b> par chalta hai. Jab koi peer NAT ke peeche ho, IPsec <b>NAT traversal</b> par switch karta hai aur <b>UDP 4500</b> use karta hai.</li>
<li><b>AH</b> (protocol 51) poore packet ko, outer IP header samet, sign karta hai taaki integrity aur origin prove ho. Yeh <b>encrypt nahi</b> karta, aur kyunki NAT IP header badalta hai, AH <b>NAT ke through toot jaata hai</b>.</li>
<li><b>ESP</b> (protocol 50) payload ko <b>encrypt</b> karta hai aur integrity aur authentication deta hai. Lagbhag har real VPN yahi use karta hai.</li>
</ul>
<p>IPsec <b>tunnel mode</b> mein chalta hai (poora original packet encrypt hota hai aur naya IP header judta hai; site-to-site VPNs ke liye gateways ke beech) ya <b>transport mode</b> mein (sirf payload protect hota hai; host to host).</p>

<pre class="code"><span class="c">! Head-office router par edge ACL: branch VPN aur kaam ka ICMP allow karo</span>
ip access-list extended OUTSIDE-IN
 permit udp host 198.51.100.2 host 203.0.113.1 eq isakmp
 permit udp host 198.51.100.2 host 203.0.113.1 eq non500-isakmp
 permit esp host 198.51.100.2 host 203.0.113.1
 permit gre host 198.51.100.2 host 203.0.113.1
 permit icmp any any echo-reply
 permit icmp any any time-exceeded
 permit icmp any any unreachable
interface GigabitEthernet0/1
 ip access-group OUTSIDE-IN in</pre>
<pre class="out">R1# show access-lists OUTSIDE-IN
Extended IP access list OUTSIDE-IN
    10 permit udp host 198.51.100.2 host 203.0.113.1 eq isakmp (14 matches)
    20 permit udp host 198.51.100.2 host 203.0.113.1 eq non500-isakmp (52 matches)
<span class="hl">    30 permit esp host 198.51.100.2 host 203.0.113.1 (18342 matches)</span>
    40 permit gre host 198.51.100.2 host 203.0.113.1
    50 permit icmp any any echo-reply (9 matches)
    60 permit icmp any any time-exceeded (3 matches)
    70 permit icmp any any unreachable (1 match)</pre>
<p>IOS par <code>isakmp</code> ka matlab UDP 500 aur <code>non500-isakmp</code> ka matlab UDP 4500 hai. ESP line par hazaaron matches hain: tunnel data le ja raha hai. GRE line par koi nahi kyunki yeh tunnel GRE use nahi karta.</p>

<h3>Traffic types: packet kaun receive karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Unicast, broadcast, multicast aur anycast">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">Unicast</text><text x="240" y="20" text-anchor="middle" class="svg-ink" font-size="13">Broadcast</text><text x="400" y="20" text-anchor="middle" class="svg-ink" font-size="13">Multicast</text><text x="560" y="20" text-anchor="middle" class="svg-ink" font-size="13">Anycast</text>
<circle cx="80" cy="50" r="14" fill="#fde68a"/><circle cx="240" cy="50" r="14" fill="#fde68a"/><circle cx="400" cy="50" r="14" fill="#fde68a"/><circle cx="560" cy="50" r="14" fill="#fde68a"/>
<circle cx="40" cy="150" r="12" fill="#bbf7d0"/><circle cx="80" cy="150" r="12" fill="#e2e8f0"/><circle cx="120" cy="150" r="12" fill="#e2e8f0"/>
<circle cx="200" cy="150" r="12" fill="#bbf7d0"/><circle cx="240" cy="150" r="12" fill="#bbf7d0"/><circle cx="280" cy="150" r="12" fill="#bbf7d0"/>
<circle cx="360" cy="150" r="12" fill="#bbf7d0"/><circle cx="400" cy="150" r="12" fill="#e2e8f0"/><circle cx="440" cy="150" r="12" fill="#bbf7d0"/>
<circle cx="520" cy="150" r="12" fill="#bbf7d0"/><circle cx="560" cy="170" r="12" fill="#e2e8f0"/><circle cx="600" cy="185" r="12" fill="#e2e8f0"/>
<line x1="80" y1="64" x2="40" y2="138" stroke="#64748b" stroke-width="2"/>
<line x1="240" y1="64" x2="200" y2="138" stroke="#64748b" stroke-width="2"/><line x1="240" y1="64" x2="240" y2="138" stroke="#64748b" stroke-width="2"/><line x1="240" y1="64" x2="280" y2="138" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="64" x2="360" y2="138" stroke="#64748b" stroke-width="2"/><line x1="400" y1="64" x2="440" y2="138" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="64" x2="520" y2="138" stroke="#64748b" stroke-width="2"/>
<text x="80" y="210" text-anchor="middle" class="svg-muted" font-size="12">ek se ek</text><text x="240" y="210" text-anchor="middle" class="svg-muted" font-size="12">ek se sab</text><text x="400" y="210" text-anchor="middle" class="svg-muted" font-size="12">ek se group</text><text x="560" y="210" text-anchor="middle" class="svg-muted" font-size="12">ek se nazdeek</text>
</svg><p class="cap">Hare hosts packet receive karte hain. Anycast mein kai servers ek address share karte hain aur routing sabse nazdeek tak pahunchati hai.</p></div>
<ul>
<li><b>Unicast:</b> ek sender se ek receiver. Lagbhag saara traffic: web, SSH, file transfers.</li>
<li><b>Broadcast:</b> ek sender se Layer 2 broadcast domain (VLAN) ke <b>har</b> host tak. IPv4 limited broadcast 255.255.255.255 hai; MAC FF:FF:FF:FF:FF:FF. ARP requests aur DHCP DISCOVER ise use karte hain. Routers broadcasts forward nahi karte. <b>IPv6 mein broadcast nahi hai</b>; woh multicast use karta hai.</li>
<li><b>Multicast:</b> ek sender se interested receivers ke <b>group</b> tak. IPv4 range 224.0.0.0/4 (224.0.0.0 se 239.255.255.255). Hosts <b>IGMP</b> se groups join karte hain; IGMP snooping wale switches stream sirf un ports par bhejte hain jahan members hain. IPTV, market data aur routing protocols (OSPF 224.0.0.5 aur 224.0.0.6 use karta hai) ke liye use hota hai.</li>
<li><b>Anycast:</b> same address alag jagahon ke <b>kai</b> servers par configure hota hai, aur routing har packet ko <b>sabse nazdeek</b> wale tak pahunchati hai. IPv6 mein native; IPv4 ke liye BGP se kiya jaata hai. DNS root servers, public resolvers aur CDNs speed aur resilience ke liye ise use karte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 4 Mb/s ka video stream 50 viewers ko jaata hai. Unicast mein server 50 copies bhejta hai: 200 Mb/s. Multicast mein woh ek copy (4 Mb/s) bhejta hai aur network use sirf wahan replicate karta hai jahan branches alag hoti hain. Broadcast mein yeh VLAN ke har host ko lagega, interested ho ya nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> ESP ke liye firewall rule "UDP 50" likhna. ESP IP protocol 50 hai, port nahi. Peers NAT ke peeche hon tab AH chunna. GRE ko secure maan lena kyunki woh "tunnel" hai. Saara ICMP block karna aur phir sochna ki bade packets kyun gayab ho rahe hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> ICMP 1, TCP 6, UDP 17, GRE 47, ESP 50, AH 51; IKE UDP 500, NAT-T UDP 4500. AH = bina encryption ke integrity; ESP = encryption. Broadcast VLAN mein rehta hai aur IPv6 mein hota hi nahi. Anycast = kai mein se nazdeek. Multicast = IGMP ke saath 224.0.0.0/4.</p></div>

<div class="scn"><h4>Woh tunnel jo up tha lekin kuch nahi le jaata tha</h4><p>Ek branch firewall head office tak apna IPsec tunnel "up" dikha raha tha: IKE poora ho gaya tha. Phir bhi koi traffic paar nahi hota tha. Head-office edge ACL UDP 500 aur UDP 4500 allow karta tha lekin IP protocol 50 nahi. Branch NAT ke peeche nahi thi, isliye data raw ESP ki tarah bheja jaata tha, jise ACL drop kar raha tha. Branch peer ke liye <code>permit esp</code> jodne se problem theek ho gayi; ESP line ka match counter turant badhne laga.</p><p><b>Seekh:</b> IPsec ko control plane ke liye IKE aur data ke liye ESP (ya NAT-T ke saath UDP 4500) chahiye; chalta hua IKE data path ko prove nahi karta.</p></div>

<div class="iv"><p class="q">"AH aur ESP mein kya farak hai, aur IPsec ke liye firewall ko kaunse ports ya protocols allow karne chahiye?"</p><p>Strong answer: AH (IP protocol 51) poore packet ke liye integrity aur origin authentication deta hai lekin confidentiality nahi, aur NAT ke through toot jaata hai kyunki woh IP header cover karta hai. ESP (IP protocol 50) payload encrypt karta hai aur integrity jodta hai, isliye normal choice wahi hai. IPsec ke liye firewall ko UDP 500 par IKE, NAT hone par UDP 4500 par NAT-T, aur ESP (protocol 50) allow karna chahiye, plus AH (51) sirf tab jab AH use ho. Tunnel vs transport mode mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP Protocol field payload pehchanta hai: ICMP 1, TCP 6, UDP 17, GRE 47, ESP 50, AH 51.</li>
<li>GRE kuch bhi tunnel karta hai lekin encrypt nahi karta; ESP encrypt karta hai; AH sirf authenticate karta hai aur NAT ke saath fail hota hai.</li>
<li>IKE UDP 500 use karta hai, aur NAT traversal ke liye UDP 4500.</li>
<li>Unicast ek se ek, broadcast ek se sab (sirf IPv4), multicast ek se group (IGMP), anycast ek se nazdeek.</li>
<li>Kaam ke ICMP types allow karo; saara ICMP block karna troubleshooting aur path MTU discovery tod deta hai.</li>
</ul></div>
`}};export{e as default};