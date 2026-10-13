var e={id:`dhcpv4-server-client`,h:{en:`DHCPv4: IOS server, IOS client and DHCP options`,hi:`DHCPv4: IOS server, IOS client aur DHCP options`},body:{en:`
<p>A hotel reception gives every guest four things at check-in: a room number, the way to the exit, the phone number of the help desk, and a checkout time. DHCP does the same for a host: an IP address and mask, a default gateway, DNS servers and a lease time. Special guests get extra items, such as a map to the conference room; in DHCP these are <b>options</b>, like option 150 for IP phones or option 43 for wireless access points.</p>

<h3>DORA refresher</h3>
<p>The client broadcasts a <b>DISCOVER</b> from 0.0.0.0 (UDP 68 to 67), the server replies with an <b>OFFER</b>, the client broadcasts a <b>REQUEST</b> for that offer, and the server confirms with an <b>ACK</b>. At 50% of the lease (T1) the client renews by unicast; at 87.5% (T2) it rebinds by broadcast. A <b>DECLINE</b> means the client found the address already in use; a <b>NAK</b> means the server refuses the requested address, typically after the client moved to another subnet.</p>

<h3>The IOS DHCP server</h3>
<pre class="code">service dhcp                                       <span class="c">! on by default; "no service dhcp" kills server AND relay</span>
ip dhcp excluded-address 192.168.50.1 192.168.50.10
ip dhcp pool BR-LAN
 network 192.168.50.0 255.255.255.0
 default-router 192.168.50.1                       <span class="c">! option 3</span>
 dns-server 10.30.30.53                            <span class="c">! option 6</span>
 domain-name branch.example                        <span class="c">! option 15</span>
 lease 1                                           <span class="c">! days (default 1 day)</span>
 option 150 ip 10.30.30.20                         <span class="c">! TFTP server for Cisco IP phones</span>
 option 43 hex f104.0a1e.1e05                      <span class="c">! WLC 10.30.30.5 for lightweight APs</span></pre>
<p>Before offering an address, IOS pings it (two echoes by default, <code>ip dhcp ping packets</code>). If something answers, the address is moved to the <b>conflict</b> table and not offered until you clear it.</p>

<h3>Options you must know</h3>
<table class="cmp"><tr><th>Option</th><th>Name</th><th>Typical use and fault</th></tr>
<tr><td>3</td><td>Router</td><td><code>default-router</code>. Wrong value = client has an address but cannot leave the subnet.</td></tr>
<tr><td>6</td><td>DNS servers</td><td><code>dns-server</code>. Missing = ping by IP works, names fail.</td></tr>
<tr><td>43</td><td>Vendor specific</td><td>Cisco lightweight APs: TLV type <b>f1</b>, length = 4 x number of WLCs, then the WLC IPs in hex. 10.30.30.5 = 0a1e1e05, so <code>f104.0a1e.1e05</code>. Wrong length = AP never joins.</td></tr>
<tr><td>82</td><td>Relay agent information</td><td>Inserted by a relay or snooping switch (circuit ID, remote ID). Covered in the next chapter.</td></tr>
<tr><td>150</td><td>TFTP server address</td><td>Cisco IP phones download their configuration from it. Missing = phones stuck at "Configuring IP" or "Registering".</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Two controllers, 10.30.30.5 and 10.30.30.6. Type f1, length 2 x 4 = 8 = 0x08, value 0a1e1e05 0a1e1e06. Command: <code>option 43 hex f108.0a1e.1e05.0a1e.1e06</code>. If you write f104 with two addresses, the AP reads only the first four bytes, and the second controller is ignored.</p></div>

<h3>Verification on the server</h3>
<pre class="out">HQ# show ip dhcp pool BR-LAN
Pool BR-LAN :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
<span class="hl"> Leased addresses               : 2</span>
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 192.168.50.13        192.168.50.1     - 192.168.50.254    2

HQ# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type       State      Interface
                    Hardware address/
                    User name
<span class="hl">192.168.50.11       0100.5079.6668.01       Oct 01 2026 09:14 AM    Automatic  Active     GigabitEthernet0/0</span>
192.168.50.12       0100.5079.6668.02       Oct 01 2026 09:15 AM    Automatic  Active     GigabitEthernet0/0</pre>
<p>More tools: <code>show ip dhcp conflict</code>, <code>clear ip dhcp conflict *</code>, <code>show ip dhcp server statistics</code> (counts of DISCOVER, OFFER, REQUEST, ACK, NAK), and <code>debug ip dhcp server packet</code> / <code>events</code>. The client ID shown is 01 (Ethernet) followed by the MAC.</p>
<pre class="out">DHCPD: DHCPDISCOVER received from client 0100.5079.6668.01 through relay 192.168.50.1.
DHCPD: Sending DHCPOFFER to client 0100.5079.6668.01 (192.168.50.11).
DHCPD: unicasting BOOTREPLY for client 0050.7966.6801 to relay 192.168.50.1.</pre>

<h3>The IOS DHCP client</h3>
<p>A router interface can lease its own address, which is common on internet or LTE links:</p>
<pre class="code">interface GigabitEthernet0/1
 ip address dhcp
<span class="c">! verification</span>
show dhcp lease
show ip route static        <span class="c">! the default route learned from option 3</span></pre>
<pre class="out">%DHCP-6-ADDRESS_ASSIGN: Interface GigabitEthernet0/1 assigned DHCP address 203.0.113.25, mask 255.255.255.0, hostname EDGE</pre>
<p>IOS installs a default route to the offered router with administrative distance <b>254</b>, so any static default you configure wins. If the interface gets no address, check that the provider side offers one, that no inbound ACL blocks UDP 67/68, and <code>debug dhcp detail</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="DORA">
<rect x="20" y="40" width="120" height="90" rx="8" fill="#bbf7d0"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="500" y="40" width="120" height="90" rx="8" fill="#bae6fd"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="13">IOS server</text>
<line x1="140" y1="55" x2="500" y2="55" stroke="#64748b"/><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">DISCOVER (broadcast)</text>
<line x1="140" y1="80" x2="500" y2="80" stroke="#64748b"/><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">OFFER: IP, mask, options</text>
<line x1="140" y1="105" x2="500" y2="105" stroke="#64748b"/><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">REQUEST (broadcast)</text>
<line x1="140" y1="128" x2="500" y2="128" stroke="#64748b"/><text x="320" y="124" text-anchor="middle" class="svg-accent" font-size="12">ACK: lease starts</text>
</svg><p class="cap">DORA on one subnet; the next chapter adds a relay in the middle.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to exclude the gateway and static servers, which produces conflicts; putting <code>network</code> with the wrong mask so the pool never matches; a wrong <code>default-router</code> (the lab fault: 192.168.50.254 instead of 192.168.50.1); leaving <code>no service dhcp</code> from a hardening template.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ip dhcp excluded-address</code> is a <b>global</b> command, not a pool command. And an IOS DHCP client's default route has AD 254, not 1.</p></div>

<div class="scn"><h4>Phones stuck at "Registering"</h4><p>After a voice VLAN was moved to a new IOS DHCP pool, every new desk phone booted, got an address and then sat at "Registering". Laptops were fine. The engineer compared the old and new pools: the new one had default-router and DNS but no option 150. The phones had no TFTP server to fetch their configuration. Adding <code>option 150 ip 10.30.30.20</code> and restarting a phone fixed it.</p><p><b>Lesson:</b> an address alone is not a working lease; check every option the client type needs.</p></div>

<div class="iv"><p class="q">"Clients get an IP address from DHCP but cannot browse the internet. What do you check?"</p><p>Look at what the lease contains: <code>ipconfig /all</code> or the phone's network screen, then the pool with <code>show run | section dhcp</code>. Check the default gateway (option 3) is the router's real LAN IP, DNS (option 6) is reachable, and the mask is correct. Then check the gateway itself routes and NATs. Strong candidates say "an address is not a lease that works" and verify options, not only bindings.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DORA: DISCOVER and REQUEST are broadcast from the client; OFFER and ACK come from the server.</li>
<li>IOS server: global excluded addresses, a pool with network, default-router, dns-server, lease and options.</li>
<li>Option 3 gateway, 6 DNS, 43 WLC list for APs (f1 + length + hex IPs), 82 relay info, 150 TFTP for phones.</li>
<li>Verify with <code>show ip dhcp binding</code>, <code>pool</code>, <code>conflict</code>, <code>server statistics</code> and <code>debug ip dhcp server packet</code>.</li>
<li>IOS DHCP client: <code>ip address dhcp</code>, default route with AD 254, verify with <code>show dhcp lease</code>.</li>
</ul></div>
`,hi:`
<p>Hotel reception check-in par har guest ko chaar cheezein deta hai: room number, exit ka raasta, help desk ka phone number, aur checkout time. DHCP host ke liye yahi karta hai: IP address aur mask, default gateway, DNS servers aur lease time. Special guests ko extra cheezein milti hain, jaise conference room ka map; DHCP mein yeh <b>options</b> hain, jaise IP phones ke liye option 150 ya wireless access points ke liye option 43.</p>

<h3>DORA refresher</h3>
<p>Client 0.0.0.0 se <b>DISCOVER</b> broadcast karta hai (UDP 68 se 67), server <b>OFFER</b> se jawab deta hai, client us offer ke liye <b>REQUEST</b> broadcast karta hai, aur server <b>ACK</b> se confirm karta hai. Lease ke 50% (T1) par client unicast se renew karta hai; 87.5% (T2) par broadcast se rebind karta hai. <b>DECLINE</b> ka matlab client ne paaya address pehle se use mein hai; <b>NAK</b> ka matlab server maange gaye address ko mana karta hai, aksar jab client doosre subnet mein chala gaya ho.</p>

<h3>IOS DHCP server</h3>
<pre class="code">service dhcp                                       <span class="c">! default mein on; "no service dhcp" server AUR relay dono band karta hai</span>
ip dhcp excluded-address 192.168.50.1 192.168.50.10
ip dhcp pool BR-LAN
 network 192.168.50.0 255.255.255.0
 default-router 192.168.50.1                       <span class="c">! option 3</span>
 dns-server 10.30.30.53                            <span class="c">! option 6</span>
 domain-name branch.example                        <span class="c">! option 15</span>
 lease 1                                           <span class="c">! din (default 1 din)</span>
 option 150 ip 10.30.30.20                         <span class="c">! Cisco IP phones ke liye TFTP server</span>
 option 43 hex f104.0a1e.1e05                      <span class="c">! lightweight APs ke liye WLC 10.30.30.5</span></pre>
<p>Address offer karne se pehle IOS use ping karta hai (default mein do echoes, <code>ip dhcp ping packets</code>). Agar koi jawab de, to address <b>conflict</b> table mein chala jaata hai aur jab tak aap clear na karo offer nahi hota.</p>

<h3>Options jo aapko pata hone chahiye</h3>
<table class="cmp"><tr><th>Option</th><th>Naam</th><th>Typical use aur fault</th></tr>
<tr><td>3</td><td>Router</td><td><code>default-router</code>. Galat value = client ke paas address hai par subnet se bahar nahi ja sakta.</td></tr>
<tr><td>6</td><td>DNS servers</td><td><code>dns-server</code>. Missing = IP se ping chalta hai, names fail hote hain.</td></tr>
<tr><td>43</td><td>Vendor specific</td><td>Cisco lightweight APs: TLV type <b>f1</b>, length = 4 x WLCs ki sankhya, phir WLC IPs hex mein. 10.30.30.5 = 0a1e1e05, isliye <code>f104.0a1e.1e05</code>. Galat length = AP kabhi join nahi karta.</td></tr>
<tr><td>82</td><td>Relay agent information</td><td>Relay ya snooping switch dwara daala jaata hai (circuit ID, remote ID). Agle chapter mein cover hai.</td></tr>
<tr><td>150</td><td>TFTP server address</td><td>Cisco IP phones isse apni configuration download karte hain. Missing = phones "Configuring IP" ya "Registering" par atke.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Do controllers, 10.30.30.5 aur 10.30.30.6. Type f1, length 2 x 4 = 8 = 0x08, value 0a1e1e05 0a1e1e06. Command: <code>option 43 hex f108.0a1e.1e05.0a1e.1e06</code>. Agar aap do addresses ke saath f104 likho, to AP sirf pehle chaar bytes padhta hai, aur doosra controller ignore hota hai.</p></div>

<h3>Server par verification</h3>
<pre class="out">HQ# show ip dhcp pool BR-LAN
Pool BR-LAN :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 Total addresses                : 254
<span class="hl"> Leased addresses               : 2</span>
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 192.168.50.13        192.168.50.1     - 192.168.50.254    2

HQ# show ip dhcp binding
Bindings from all pools not associated with VRF:
IP address          Client-ID/              Lease expiration        Type       State      Interface
                    Hardware address/
                    User name
<span class="hl">192.168.50.11       0100.5079.6668.01       Oct 01 2026 09:14 AM    Automatic  Active     GigabitEthernet0/0</span>
192.168.50.12       0100.5079.6668.02       Oct 01 2026 09:15 AM    Automatic  Active     GigabitEthernet0/0</pre>
<p>Aur tools: <code>show ip dhcp conflict</code>, <code>clear ip dhcp conflict *</code>, <code>show ip dhcp server statistics</code> (DISCOVER, OFFER, REQUEST, ACK, NAK ki ginti), aur <code>debug ip dhcp server packet</code> / <code>events</code>. Dikhaya gaya client ID 01 (Ethernet) ke baad MAC hai.</p>
<pre class="out">DHCPD: DHCPDISCOVER received from client 0100.5079.6668.01 through relay 192.168.50.1.
DHCPD: Sending DHCPOFFER to client 0100.5079.6668.01 (192.168.50.11).
DHCPD: unicasting BOOTREPLY for client 0050.7966.6801 to relay 192.168.50.1.</pre>

<h3>IOS DHCP client</h3>
<p>Router interface apna address khud lease kar sakta hai, jo internet ya LTE links par common hai:</p>
<pre class="code">interface GigabitEthernet0/1
 ip address dhcp
<span class="c">! verification</span>
show dhcp lease
show ip route static        <span class="c">! option 3 se seekha default route</span></pre>
<pre class="out">%DHCP-6-ADDRESS_ASSIGN: Interface GigabitEthernet0/1 assigned DHCP address 203.0.113.25, mask 255.255.255.0, hostname EDGE</pre>
<p>IOS offer kiye router ki taraf administrative distance <b>254</b> ka default route install karta hai, isliye aapka configure kiya koi bhi static default jeetta hai. Agar interface ko address na mile, check karo provider side offer karta hai, koi inbound ACL UDP 67/68 block nahi kar raha, aur <code>debug dhcp detail</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="DORA">
<rect x="20" y="40" width="120" height="90" rx="8" fill="#bbf7d0"/><text x="80" y="90" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="500" y="40" width="120" height="90" rx="8" fill="#bae6fd"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="13">IOS server</text>
<line x1="140" y1="55" x2="500" y2="55" stroke="#64748b"/><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">DISCOVER (broadcast)</text>
<line x1="140" y1="80" x2="500" y2="80" stroke="#64748b"/><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">OFFER: IP, mask, options</text>
<line x1="140" y1="105" x2="500" y2="105" stroke="#64748b"/><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">REQUEST (broadcast)</text>
<line x1="140" y1="128" x2="500" y2="128" stroke="#64748b"/><text x="320" y="124" text-anchor="middle" class="svg-accent" font-size="12">ACK: lease shuru</text>
</svg><p class="cap">Ek subnet par DORA; agla chapter beech mein relay jodta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Gateway aur static servers ko exclude karna bhoolna, jisse conflicts bante hain; <code>network</code> galat mask ke saath daalna jisse pool kabhi match nahi hota; galat <code>default-router</code> (lab fault: 192.168.50.1 ki jagah 192.168.50.254); hardening template se <code>no service dhcp</code> reh jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ip dhcp excluded-address</code> <b>global</b> command hai, pool command nahi. Aur IOS DHCP client ke default route ka AD 254 hai, 1 nahi.</p></div>

<div class="scn"><h4>"Registering" par atke phones</h4><p>Voice VLAN ko naye IOS DHCP pool par shift karne ke baad, har naya desk phone boot hota, address leta aur phir "Registering" par baitha rehta. Laptops theek the. Engineer ne purane aur naye pools compare kiye: naye mein default-router aur DNS the par option 150 nahi. Phones ke paas configuration laane ke liye koi TFTP server nahi tha. <code>option 150 ip 10.30.30.20</code> jodne aur ek phone restart karne se theek ho gaya.</p><p><b>Seekh:</b> sirf address kaam karne wala lease nahi hai; client type ko jo bhi option chahiye, sab check karo.</p></div>

<div class="iv"><p class="q">"Clients ko DHCP se IP address milta hai par internet browse nahi kar paate. Aap kya check karoge?"</p><p>Dekho lease mein kya hai: <code>ipconfig /all</code> ya phone ki network screen, phir <code>show run | section dhcp</code> se pool. Check karo default gateway (option 3) router ka asli LAN IP hai, DNS (option 6) reachable hai, aur mask sahi hai. Phir check karo gateway khud route aur NAT karta hai. Strong candidates kehte hain "address kaam karne wala lease nahi hai" aur sirf bindings nahi, options verify karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DORA: DISCOVER aur REQUEST client se broadcast hote hain; OFFER aur ACK server se aate hain.</li>
<li>IOS server: global excluded addresses, network, default-router, dns-server, lease aur options wala pool.</li>
<li>Option 3 gateway, 6 DNS, 43 APs ke liye WLC list (f1 + length + hex IPs), 82 relay info, 150 phones ke liye TFTP.</li>
<li><code>show ip dhcp binding</code>, <code>pool</code>, <code>conflict</code>, <code>server statistics</code> aur <code>debug ip dhcp server packet</code> se verify karo.</li>
<li>IOS DHCP client: <code>ip address dhcp</code>, AD 254 ka default route, <code>show dhcp lease</code> se verify karo.</li>
</ul></div>
`}};export{e as default};