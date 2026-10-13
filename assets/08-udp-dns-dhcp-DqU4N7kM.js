var e={id:`udp-dns-dhcp`,h:{en:`UDP, DNS and DHCP DORA on the wire`,hi:`Wire par UDP, DNS aur DHCP DORA`},body:{en:`
<p>TCP is a registered letter with a signature on delivery. <b>UDP</b> is a postcard: you write the address, drop it in the box, and hope. No "hello" first, no receipt, no automatic resend. That sounds worse, but for a quick question and a quick answer, like "what is the IP of this name?" or "may I have an address?", a postcard is faster and good enough. The application simply asks again if no answer comes.</p>

<h3>The UDP header: only 8 bytes</h3>
<p>UDP (IP protocol <b>17</b>) has four fields: <b>Source port</b>, <b>Destination port</b>, <b>Length</b> and <b>Checksum</b>. No sequence numbers, no flags, no window. In a capture this means you cannot see "connection refused" in UDP itself. A UDP failure looks like one of two things: a request with <b>no response</b>, or an <b>ICMP port unreachable</b> (type 3 code 3) from the destination host, which means the host is alive but nothing listens on that port.</p>

<h3>DNS: one question, one answer, same ID</h3>
<p>DNS normally uses <b>UDP port 53</b> (TCP 53 for large answers and zone transfers). The client sends a <b>query</b> from a random port to port 53; the server sends a <b>response</b> from 53 back to that port. Both carry the same <b>Transaction ID</b>, which is how you pair them in a busy capture.</p>
<pre class="out">No. Source        Destination   Protocol Info
 21 10.5.5.11     198.51.100.53 DNS      Standard query 0x7c1e A intranet.corp.example
<span class="hl"> 22 198.51.100.53 10.5.5.11     DNS      Standard query response 0x7c1e A intranet.corp.example A 198.51.100.40</span>
 23 10.5.5.11     198.51.100.53 DNS      Standard query 0x51b0 A payrol.corp.example
<span class="hl"> 24 198.51.100.53 10.5.5.11     DNS      Standard query response 0x51b0 No such name A payrol.corp.example</span></pre>
<p>Read the response code in the flags: <b>No error</b> (answer included), <b>No such name</b> (NXDOMAIN: the name does not exist, often a typo like "payrol" above), <b>Server failure</b> (SERVFAIL: the server could not resolve it) or <b>Refused</b>. Record types you will meet: <b>A</b> (IPv4), <b>AAAA</b> (IPv6), <b>CNAME</b> (alias), <b>MX</b> (mail), <b>PTR</b> (reverse lookup). Useful display filters: <code>dns</code>, <code>udp.port == 53</code>, and in Wireshark <code>dns.flags.rcode == 3</code> for NXDOMAIN. In the lab viewer <code>dns.qry.name</code> and <code>dns.flags.response</code> work too.</p>

<div class="note"><p><b>A capture separates DNS from the network.</b> If the query leaves and the response arrives with the wrong address or NXDOMAIN, the network did its job: fix the DNS record. If queries repeat with no response, check reachability of the DNS server and UDP 53 on the path.</p></div>

<h3>DHCP: the DORA exchange</h3>
<p>DHCP gives a host its IP address, mask, default gateway and DNS servers. It uses UDP with <b>server port 67</b> and <b>client port 68</b>. A new client has no address yet, so the first packets look unusual:</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCP DORA">
<rect x="30" y="10" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="470" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">DHCP server</text>
<line x1="100" y1="44" x2="100" y2="240" stroke="#64748b" stroke-width="1.5"/><line x1="540" y1="44" x2="540" y2="240" stroke="#64748b" stroke-width="1.5"/>
<line x1="100" y1="75" x2="540" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">D Discover  0.0.0.0:68 → 255.255.255.255:67</text>
<line x1="540" y1="120" x2="100" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">O Offer  server:67 → client:68, "your IP"</text>
<line x1="100" y1="165" x2="540" y2="175" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">R Request  0.0.0.0 → broadcast, "I take it"</text>
<line x1="540" y1="210" x2="100" y2="220" stroke="#64748b" stroke-width="2"/><text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">A ACK  lease time, mask, router, DNS</text>
</svg><p class="cap">Discover and Request are broadcasts from 0.0.0.0; one Transaction ID ties all four together.</p></div>
<ol>
<li><b>Discover</b>: from 0.0.0.0 port 68 to 255.255.255.255 port 67, destination MAC ff:ff:ff:ff:ff:ff. "Is there a DHCP server?"</li>
<li><b>Offer</b>: from the server (port 67) to the client (port 68). The offered address is in the "Your (client) IP address" field; options carry the mask, router, DNS and lease time.</li>
<li><b>Request</b>: still broadcast from 0.0.0.0, because the client has not been confirmed yet and other servers must see which offer it accepted (option 54, server identifier).</li>
<li><b>ACK</b>: the server confirms. Only now does the client configure the address. A <b>NAK</b> instead means "you cannot have that address", common when a laptop moves to another subnet and asks for its old IP.</li>
</ol>
<p>Options to recognise: <b>53</b> message type, <b>50</b> requested IP, <b>54</b> server identifier, <b>51</b> lease time, <b>1</b> subnet mask, <b>3</b> router, <b>6</b> DNS server. Renewal at 50% of the lease is a unicast Request and ACK, with no Discover.</p>

<h3>DHCP relay on the wire</h3>
<p>Broadcasts do not cross routers, so when the server is in another subnet, the client's gateway must act as a <b>relay</b>:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip helper-address 10.1.1.5   <span class="c">! DHCP server in the data center</span></pre>
<p>Capture on the client side and you see the broadcast Discover. Capture on the server side and the same Discover arrives as a <b>unicast</b> from the router's interface address to 10.1.1.5, with the <b>relay agent IP (giaddr)</b> set to the client subnet's gateway address. The server uses giaddr to pick the right pool.</p>

<h3>DHCP failure signatures</h3>
<table class="cmp"><tr><th>You see</th><th>Likely cause</th></tr>
<tr><td>Discovers repeating, no Offer; client ends up with 169.254.x.x</td><td>No server reachable: missing <code>ip helper-address</code>, wrong VLAN, DHCP snooping dropping on an untrusted port, pool exhausted</td></tr>
<tr><td>Offer from an unexpected IP</td><td>Rogue DHCP server (a home router plugged into the LAN)</td></tr>
<tr><td>Request followed by NAK</td><td>Client asked for an address from another subnet</td></tr>
<tr><td>Discover arrives at server side but no Offer leaves</td><td>Server problem: no pool for that giaddr, pool full, server service stopped</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A capture on a new VLAN 30 access port shows Discovers at 0, 4, 12 and 20 seconds, transaction ID 0x3903f326, and nothing else. A second capture on the DHCP server's port shows no Discover from VLAN 30 at all. The SVI for VLAN 30 has no <code>ip helper-address</code>. Add it, capture again: the server now receives a unicast Discover with giaddr 10.30.0.1, and the client completes DORA in under a second.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming the Offer means the client has an address. Nothing is configured until the ACK. If you see Offers but never an ACK, look at what happens to the Request.</p></div>

<div class="exam"><p><b>Exam trap.</b> DHCP server port 67, client port 68, both UDP. DNS is UDP 53 (TCP 53 for zone transfers and large responses). DORA = Discover, Offer, Request, ACK. <code>ip helper-address</code> goes on the interface facing the <b>clients</b>, not the server.</p></div>

<div class="scn"><h4>Half the floor on the wrong network</h4><p>After a weekend, half the users on one floor had addresses in 192.168.0.0/24 and no access to company systems. A capture on a user port during <code>ipconfig /renew</code> showed two Offers for the same Discover: one from the real server via the relay, one from 192.168.0.1 with a consumer router's MAC. The fastest Offer won. The team found a wireless router someone had plugged in under a desk, removed it, and enabled DHCP snooping with only the uplink trusted.</p><p><b>Lesson:</b> two Offers for one transaction ID means two servers. The capture names the rogue by IP and MAC.</p></div>

<div class="iv"><p class="q">"Describe DHCP DORA as it appears in a packet capture."</p><p>Strong answer: Discover from 0.0.0.0 UDP 68 to 255.255.255.255 UDP 67; Offer from the server with the proposed address in yiaddr plus mask, router, DNS and lease options; Request, still broadcast so all servers know which offer was chosen; ACK confirming the lease. All four share one transaction ID. With a relay, the router forwards the Discover as unicast to the server with giaddr set to the client subnet's gateway. Mention NAK and the 169.254 fallback when nothing answers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UDP is 8 bytes with no handshake; failure = no response or ICMP port unreachable.</li>
<li>DNS: UDP 53, query and response share a Transaction ID; check the response code (No error, No such name, Server failure).</li>
<li>DHCP DORA: Discover and Request broadcast from 0.0.0.0, ports 68 to 67; the address is only valid after the ACK.</li>
<li>A relay turns the broadcast into a unicast to the server and sets giaddr.</li>
<li>Repeated Discovers with no Offer point to relay, VLAN, snooping or server problems; two Offers point to a rogue server.</li>
</ul></div>
`,hi:`
<p>TCP ek registered letter hai jis par delivery par signature hota hai. <b>UDP</b> ek postcard hai: address likho, box mein daalo, aur umeed karo. Pehle koi "hello" nahi, koi receipt nahi, apne aap dobara bhejna nahi. Yeh bura lagta hai, lekin ek chhote sawaal aur chhote jawab ke liye, jaise "is naam ka IP kya hai?" ya "kya mujhe ek address mil sakta hai?", postcard tez aur kaafi hai. Jawab na aaye to application bas dobara pooch leti hai.</p>

<h3>UDP header: sirf 8 bytes</h3>
<p>UDP (IP protocol <b>17</b>) mein chaar fields hain: <b>Source port</b>, <b>Destination port</b>, <b>Length</b> aur <b>Checksum</b>. Na sequence numbers, na flags, na window. Capture mein iska matlab hai ki UDP mein khud "connection refused" nahi dikh sakta. UDP failure do mein se ek tarah dikhta hai: <b>bina response</b> ki request, ya destination host se <b>ICMP port unreachable</b> (type 3 code 3), jiska matlab hai host zinda hai lekin us port par koi listen nahi kar raha.</p>

<h3>DNS: ek sawaal, ek jawab, same ID</h3>
<p>DNS normally <b>UDP port 53</b> use karta hai (bade answers aur zone transfers ke liye TCP 53). Client random port se port 53 ko <b>query</b> bhejta hai; server 53 se usi port par <b>response</b> bhejta hai. Dono mein same <b>Transaction ID</b> hota hai, isi se busy capture mein aap jodi banate ho.</p>
<pre class="out">No. Source        Destination   Protocol Info
 21 10.5.5.11     198.51.100.53 DNS      Standard query 0x7c1e A intranet.corp.example
<span class="hl"> 22 198.51.100.53 10.5.5.11     DNS      Standard query response 0x7c1e A intranet.corp.example A 198.51.100.40</span>
 23 10.5.5.11     198.51.100.53 DNS      Standard query 0x51b0 A payrol.corp.example
<span class="hl"> 24 198.51.100.53 10.5.5.11     DNS      Standard query response 0x51b0 No such name A payrol.corp.example</span></pre>
<p>Flags mein response code padho: <b>No error</b> (answer shamil hai), <b>No such name</b> (NXDOMAIN: naam exist nahi karta, aksar upar wale "payrol" jaisa typo), <b>Server failure</b> (SERVFAIL: server resolve nahi kar paya) ya <b>Refused</b>. Record types jo milenge: <b>A</b> (IPv4), <b>AAAA</b> (IPv6), <b>CNAME</b> (alias), <b>MX</b> (mail), <b>PTR</b> (reverse lookup). Kaam ke display filters: <code>dns</code>, <code>udp.port == 53</code>, aur Wireshark mein NXDOMAIN ke liye <code>dns.flags.rcode == 3</code>. Lab viewer mein <code>dns.qry.name</code> aur <code>dns.flags.response</code> bhi chalte hain.</p>

<div class="note"><p><b>Capture DNS ko network se alag karta hai.</b> Agar query nikalti hai aur response galat address ya NXDOMAIN ke saath aata hai, to network ne apna kaam kiya: DNS record theek karo. Agar queries bina response ke repeat hoti hain, to DNS server ki reachability aur path par UDP 53 check karo.</p></div>

<h3>DHCP: DORA exchange</h3>
<p>DHCP host ko uska IP address, mask, default gateway aur DNS servers deta hai. Yeh UDP use karta hai, <b>server port 67</b> aur <b>client port 68</b>. Naye client ke paas abhi address nahi hota, isliye pehle packets alag dikhte hain:</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DHCP DORA">
<rect x="30" y="10" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="470" y="10" width="140" height="34" rx="8" fill="#ddd6fe"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">DHCP server</text>
<line x1="100" y1="44" x2="100" y2="240" stroke="#64748b" stroke-width="1.5"/><line x1="540" y1="44" x2="540" y2="240" stroke="#64748b" stroke-width="1.5"/>
<line x1="100" y1="75" x2="540" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="12">D Discover  0.0.0.0:68 → 255.255.255.255:67</text>
<line x1="540" y1="120" x2="100" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="12">O Offer  server:67 → client:68, "aapka IP"</text>
<line x1="100" y1="165" x2="540" y2="175" stroke="#64748b" stroke-width="2"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">R Request  0.0.0.0 → broadcast, "main le raha hoon"</text>
<line x1="540" y1="210" x2="100" y2="220" stroke="#64748b" stroke-width="2"/><text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">A ACK  lease time, mask, router, DNS</text>
</svg><p class="cap">Discover aur Request 0.0.0.0 se broadcast hote hain; ek Transaction ID chaaron ko jodta hai.</p></div>
<ol>
<li><b>Discover</b>: 0.0.0.0 port 68 se 255.255.255.255 port 67 ko, destination MAC ff:ff:ff:ff:ff:ff. "Koi DHCP server hai?"</li>
<li><b>Offer</b>: server (port 67) se client (port 68) ko. Offer kiya address "Your (client) IP address" field mein hota hai; options mein mask, router, DNS aur lease time hote hain.</li>
<li><b>Request</b>: ab bhi 0.0.0.0 se broadcast, kyunki client abhi confirm nahi hua aur baaki servers ko dikhna chahiye ki usne kaunsa offer accept kiya (option 54, server identifier).</li>
<li><b>ACK</b>: server confirm karta hai. Tabhi client address configure karta hai. Iski jagah <b>NAK</b> ka matlab hai "aapko yeh address nahi mil sakta", jo aam hai jab laptop dusre subnet mein jaa kar apna purana IP maangta hai.</li>
</ol>
<p>Pehchaanne wale options: <b>53</b> message type, <b>50</b> requested IP, <b>54</b> server identifier, <b>51</b> lease time, <b>1</b> subnet mask, <b>3</b> router, <b>6</b> DNS server. Lease ke 50% par renewal unicast Request aur ACK hota hai, bina Discover ke.</p>

<h3>Wire par DHCP relay</h3>
<p>Broadcasts routers paar nahi karte, isliye jab server dusre subnet mein ho, client ke gateway ko <b>relay</b> banna padta hai:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip helper-address 10.1.1.5   <span class="c">! data center mein DHCP server</span></pre>
<p>Client side par capture karo to broadcast Discover dikhta hai. Server side par capture karo to wahi Discover router ke interface address se 10.1.1.5 ko <b>unicast</b> ke roop mein aata hai, jismein <b>relay agent IP (giaddr)</b> client subnet ke gateway address par set hota hai. Server giaddr se sahi pool chunta hai.</p>

<h3>DHCP failure ki pehchaan</h3>
<table class="cmp"><tr><th>Dikhta hai</th><th>Likely wajah</th></tr>
<tr><td>Discovers repeat, koi Offer nahi; client ko 169.254.x.x milta hai</td><td>Koi server reachable nahi: missing <code>ip helper-address</code>, galat VLAN, untrusted port par DHCP snooping drop, pool khatam</td></tr>
<tr><td>Anjaane IP se Offer</td><td>Rogue DHCP server (LAN mein laga ghar ka router)</td></tr>
<tr><td>Request ke baad NAK</td><td>Client ne dusre subnet ka address maanga</td></tr>
<tr><td>Discover server side par pahunchta hai lekin Offer nahi nikalta</td><td>Server problem: us giaddr ke liye pool nahi, pool full, server service band</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Naye VLAN 30 ke access port par capture mein 0, 4, 12 aur 20 seconds par Discovers dikhte hain, transaction ID 0x3903f326, aur kuch nahi. DHCP server ke port par dusre capture mein VLAN 30 se koi Discover hai hi nahi. VLAN 30 ke SVI par <code>ip helper-address</code> nahi hai. Use jodo, dobara capture karo: ab server ko giaddr 10.30.0.1 ke saath unicast Discover milta hai, aur client ek second se kam mein DORA poora kar leta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Maan lena ki Offer ka matlab hai client ke paas address hai. ACK tak kuch configure nahi hota. Agar Offers dikhte hain lekin kabhi ACK nahi, to dekho Request ke saath kya hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> DHCP server port 67, client port 68, dono UDP. DNS UDP 53 hai (zone transfers aur bade responses ke liye TCP 53). DORA = Discover, Offer, Request, ACK. <code>ip helper-address</code> <b>clients</b> ki taraf wale interface par lagta hai, server ki taraf nahi.</p></div>

<div class="scn"><h4>Aadha floor galat network par</h4><p>Ek weekend ke baad ek floor ke aadhe users ke paas 192.168.0.0/24 ke addresses the aur company systems ka access nahi tha. <code>ipconfig /renew</code> ke dauraan user port par capture mein ek hi Discover ke do Offers dikhe: ek relay ke through asli server se, ek 192.168.0.1 se consumer router ke MAC ke saath. Sabse tez Offer jeet gaya. Team ko desk ke neeche kisi ka lagaya wireless router mila, use hataya, aur sirf uplink trusted rakh kar DHCP snooping enable kiya.</p><p><b>Seekh:</b> ek transaction ID ke do Offers ka matlab do servers. Capture rogue ka naam IP aur MAC se batata hai.</p></div>

<div class="iv"><p class="q">"Packet capture mein DHCP DORA kaisa dikhta hai, batao."</p><p>Strong answer: Discover 0.0.0.0 UDP 68 se 255.255.255.255 UDP 67 ko; server se Offer jismein proposed address yiaddr mein aur mask, router, DNS aur lease options; Request, ab bhi broadcast taaki saare servers jaanein kaunsa offer chuna gaya; lease confirm karta ACK. Chaaron ek transaction ID share karte hain. Relay ke saath router Discover ko unicast karke server ko forward karta hai, giaddr client subnet ke gateway par set karke. NAK aur kuch jawab na aane par 169.254 fallback mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UDP 8 bytes ka hai, koi handshake nahi; failure = koi response nahi ya ICMP port unreachable.</li>
<li>DNS: UDP 53, query aur response ek Transaction ID share karte hain; response code check karo (No error, No such name, Server failure).</li>
<li>DHCP DORA: Discover aur Request 0.0.0.0 se broadcast, ports 68 se 67; address sirf ACK ke baad valid hai.</li>
<li>Relay broadcast ko server ke liye unicast mein badalta hai aur giaddr set karta hai.</li>
<li>Bina Offer ke baar baar Discovers relay, VLAN, snooping ya server problems ki taraf ishara karte hain; do Offers rogue server ki taraf.</li>
</ul></div>
`}};export{e as default};