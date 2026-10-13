var e={id:`dhcp-relay`,h:{en:`DHCP relay, giaddr and option 82`,hi:`DHCP relay, giaddr aur option 82`},body:{en:`
<p>A villager shouts "I need a doctor!" in the village square. The shout does not travel to the city hospital fifty kilometres away. The village postmaster hears it, writes a letter to the hospital that says "someone in <b>this village</b> needs a doctor, reply to me", and passes the reply back to the villager. The postmaster is the <b>DHCP relay agent</b>, the letter is a unicast packet, and "this village" is the <b>giaddr</b> field.</p>

<h3>Why a relay is needed</h3>
<p>DHCPDISCOVER is a broadcast to 255.255.255.255. Routers never forward limited broadcasts, so a client on 192.168.50.0/24 cannot reach a central server on 10.30.30.0/24. Rather than a server per branch, one central server serves every subnet and each branch router relays.</p>

<h3>The relay process step by step</h3>
<ol>
<li>PC1 broadcasts DISCOVER on the branch LAN.</li>
<li>BR receives it on Gi0/0, which has <code>ip helper-address 10.30.30.1</code>.</li>
<li>BR writes the IP of the <b>receiving</b> interface, 192.168.50.1, into <b>giaddr</b> (gateway IP address), increments the hop count and unicasts the packet to 10.30.30.1 on UDP 67.</li>
<li>HQ's DHCP server chooses the pool whose network contains giaddr: pool BR-LAN, 192.168.50.0/24.</li>
<li>The server unicasts the OFFER back to <b>giaddr</b>, 192.168.50.1. HQ therefore needs a route to 192.168.50.0/24.</li>
<li>BR delivers the OFFER on Gi0/0 to the client (as a broadcast or unicast depending on the client's broadcast flag). REQUEST and ACK follow the same path.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP relay path">
<rect x="10" y="90" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="55" y="129" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0</text>
<rect x="170" y="80" width="130" height="70" rx="8" fill="#bae6fd"/><text x="235" y="104" text-anchor="middle" class="svg-ink" font-size="13">BR relay</text><text x="235" y="121" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .50.1</text><text x="235" y="138" text-anchor="middle" class="svg-muted" font-size="12">helper here</text>
<rect x="370" y="80" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="430" y="104" text-anchor="middle" class="svg-ink" font-size="13">HQ server</text><text x="430" y="121" text-anchor="middle" class="svg-muted" font-size="12">10.30.30.1</text><text x="430" y="138" text-anchor="middle" class="svg-muted" font-size="12">pool BR-LAN</text>
<rect x="540" y="90" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="585" y="112" text-anchor="middle" class="svg-ink" font-size="13">APP</text><text x="585" y="129" text-anchor="middle" class="svg-muted" font-size="12">.30.80</text>
<line x1="100" y1="115" x2="170" y2="115" stroke="#64748b"/><line x1="300" y1="115" x2="370" y2="115" stroke="#64748b"/><line x1="490" y1="115" x2="540" y2="115" stroke="#64748b"/>
<text x="135" y="75" text-anchor="middle" class="svg-accent" font-size="12">1 broadcast</text>
<text x="335" y="60" text-anchor="middle" class="svg-accent" font-size="12">2 unicast, giaddr .50.1</text>
<text x="335" y="185" text-anchor="middle" class="svg-accent" font-size="12">3 OFFER to giaddr</text>
<text x="335" y="203" text-anchor="middle" class="svg-muted" font-size="12">needs route to 192.168.50.0/24</text>
</svg><p class="cap">The DHCP relay lab topology: the helper sits on the LAN interface and the server replies to giaddr.</p></div>

<h3>Relay configuration and what else it forwards</h3>
<pre class="code">interface GigabitEthernet0/0
 ip address 192.168.50.1 255.255.255.0
 ip helper-address 10.30.30.1           <span class="c">! on the interface that RECEIVES the broadcast</span>
<span class="c">! optional: stop forwarding broadcasts you do not need</span>
no ip forward-protocol udp tftp
no ip forward-protocol udp netbios-ns</pre>
<p><code>ip helper-address</code> forwards eight UDP services by default: DHCP/BOOTP (67 and 68), TFTP (69), DNS (53), Time (37), TACACS (49), NetBIOS name (137), NetBIOS datagram (138) and IEN-116 name service (42). Multiple helper lines send a copy to each server, which is how you build redundant DHCP servers.</p>

<h3>Option 82: relay agent information</h3>
<p>Option 82 lets the relay or an access switch tell the server <b>where</b> the client is connected: a circuit ID (for example VLAN and port) and a remote ID (for example the switch MAC). A router relay adds it with <code>ip dhcp relay information option</code>. Servers can use it for address policy and for tracking.</p>
<p>The famous fault involves <b>DHCP snooping</b> on an access switch. By default the switch inserts option 82 but leaves giaddr at 0.0.0.0, because it is not a relay. The upstream IOS relay or server then sees a packet with option 82 and giaddr 0 arriving on an untrusted interface, and drops it. Fixes, depending on design:</p>
<pre class="code"><span class="c">! on the IOS relay router, trust option 82 from the access switch</span>
interface GigabitEthernet0/0
 ip dhcp relay information trusted
<span class="c">! or globally</span>
ip dhcp relay information trust-all
<span class="c">! or on the access switch, stop inserting option 82</span>
no ip dhcp snooping information option</pre>

<h3>Troubleshooting table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Where to look</th></tr>
<tr><td>Server statistics show no DISCOVER from the branch</td><td>Helper missing, on the wrong interface or pointing to the wrong IP; ACL blocking UDP 67; <code>no service dhcp</code> on the relay</td></tr>
<tr><td>Server receives DISCOVER, client never gets OFFER</td><td>No route from server to giaddr; no pool for the giaddr subnet ("there is no address pool for 192.168.50.1" in the debug); pool exhausted</td></tr>
<tr><td>Works for some VLANs only</td><td>Helper configured on some SVIs only; missing pool for the new subnet</td></tr>
<tr><td>Drops after enabling snooping</td><td>Option 82 with giaddr 0 on an untrusted relay interface</td></tr>
<tr><td>Lease OK, no connectivity</td><td>Wrong default-router in the pool</td></tr></table>

<div class="eg"><p><b>Worked example (lab 2 fault 1 and 2).</b> <code>show ip interface GigabitEthernet0/1</code> on BR shows <code>Helper address is 10.30.30.1</code> on the WAN link, while Gi0/0 says <code>Helper address is not set</code>. Broadcasts arrive on Gi0/0, so nothing is relayed. After moving the helper, <code>debug ip dhcp server packet</code> on HQ shows the DISCOVER from relay 192.168.50.1, but the client still gets nothing: <code>show ip route 192.168.50.1</code> on HQ returns <code>% Network not in table</code>. Adding <code>ip route 192.168.50.0 255.255.255.0 10.20.20.1</code> lets the OFFER reach BR.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the helper on the server-facing interface; pointing the helper at an address the relay cannot reach; forgetting the return route to giaddr (the relay's LAN subnet is often not advertised into the core); configuring the helper on a physical interface when clients live on an SVI or a subinterface.</p></div>

<div class="exam"><p><b>Exam trap.</b> The server selects the pool by <b>giaddr</b>, not by the relay's source IP or the client MAC. giaddr is the IP of the interface that received the broadcast, 192.168.50.1 in the lab.</p></div>

<div class="scn"><h4>A new floor with no addresses</h4><p>A company opened floor 5 with VLAN 50 on a Layer 3 switch. Every other floor got addresses from the central Windows DHCP server. On floor 5, clients self-assigned 169.254.x.x addresses. The SVI for VLAN 50 existed, but the engineer had copied the config from an older floor before the helper was added. After <code>ip helper-address</code> was added to interface Vlan50, the server logs showed requests with no matching scope, so the DHCP team also had to create the 10.5.50.0/24 scope.</p><p><b>Lesson:</b> a relay needs three pieces: helper on the receiving interface, a pool matching giaddr, and routing both ways.</p></div>

<div class="iv"><p class="q">"What is giaddr and why does it matter?"</p><p>The gateway IP address field in the DHCP header. The relay writes the IP of the interface that received the client's broadcast. The server uses it to choose the pool (the pool whose network contains giaddr) and sends its reply to that address. So a wrong helper interface means the wrong pool or none, and a missing route to giaddr means the reply never comes back. Mention option 82 and the snooping giaddr 0 issue for extra points.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip helper-address</code> goes on the interface that receives client broadcasts.</li>
<li>The relay sets giaddr to that interface IP; the server picks the pool by giaddr and replies to it.</li>
<li>The server needs a route back to giaddr's subnet.</li>
<li>A helper forwards eight UDP services by default; trim with <code>no ip forward-protocol udp</code>.</li>
<li>Option 82 from a snooping switch with giaddr 0 is dropped by IOS unless the relay trusts it.</li>
</ul></div>
`,hi:`
<p>Ek gaon wala gaon ke chowk par chillata hai "mujhe doctor chahiye!" Yeh aawaaz pachaas kilometer door city hospital tak nahi jaati. Gaon ka postmaster sunta hai, hospital ko chitthi likhta hai jismein likha hai "<b>is gaon</b> mein kisi ko doctor chahiye, mujhe jawab do", aur jawab gaon wale tak pahuncha deta hai. Postmaster <b>DHCP relay agent</b> hai, chitthi unicast packet hai, aur "is gaon" <b>giaddr</b> field hai.</p>

<h3>Relay kyun chahiye</h3>
<p>DHCPDISCOVER 255.255.255.255 ko broadcast hai. Routers limited broadcasts kabhi forward nahi karte, isliye 192.168.50.0/24 par baitha client 10.30.30.0/24 ke central server tak nahi pahunch sakta. Har branch mein server rakhne ki jagah, ek central server har subnet ko serve karta hai aur har branch router relay karta hai.</p>

<h3>Relay process step by step</h3>
<ol>
<li>PC1 branch LAN par DISCOVER broadcast karta hai.</li>
<li>BR use Gi0/0 par receive karta hai, jis par <code>ip helper-address 10.30.30.1</code> hai.</li>
<li>BR <b>receive karne wale</b> interface ka IP, 192.168.50.1, <b>giaddr</b> (gateway IP address) mein likhta hai, hop count badhata hai aur packet ko UDP 67 par 10.30.30.1 ko unicast karta hai.</li>
<li>HQ ka DHCP server woh pool chunta hai jiske network mein giaddr hai: pool BR-LAN, 192.168.50.0/24.</li>
<li>Server OFFER ko <b>giaddr</b>, 192.168.50.1 par unicast wapas bhejta hai. Isliye HQ ko 192.168.50.0/24 tak route chahiye.</li>
<li>BR OFFER ko Gi0/0 par client tak deta hai (client ke broadcast flag ke hisaab se broadcast ya unicast). REQUEST aur ACK same path follow karte hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP relay path">
<rect x="10" y="90" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="55" y="112" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="55" y="129" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.0</text>
<rect x="170" y="80" width="130" height="70" rx="8" fill="#bae6fd"/><text x="235" y="104" text-anchor="middle" class="svg-ink" font-size="13">BR relay</text><text x="235" y="121" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 .50.1</text><text x="235" y="138" text-anchor="middle" class="svg-muted" font-size="12">helper yahan</text>
<rect x="370" y="80" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="430" y="104" text-anchor="middle" class="svg-ink" font-size="13">HQ server</text><text x="430" y="121" text-anchor="middle" class="svg-muted" font-size="12">10.30.30.1</text><text x="430" y="138" text-anchor="middle" class="svg-muted" font-size="12">pool BR-LAN</text>
<rect x="540" y="90" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="585" y="112" text-anchor="middle" class="svg-ink" font-size="13">APP</text><text x="585" y="129" text-anchor="middle" class="svg-muted" font-size="12">.30.80</text>
<line x1="100" y1="115" x2="170" y2="115" stroke="#64748b"/><line x1="300" y1="115" x2="370" y2="115" stroke="#64748b"/><line x1="490" y1="115" x2="540" y2="115" stroke="#64748b"/>
<text x="135" y="75" text-anchor="middle" class="svg-accent" font-size="12">1 broadcast</text>
<text x="335" y="60" text-anchor="middle" class="svg-accent" font-size="12">2 unicast, giaddr .50.1</text>
<text x="335" y="185" text-anchor="middle" class="svg-accent" font-size="12">3 OFFER giaddr ko</text>
<text x="335" y="203" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/24 tak route chahiye</text>
</svg><p class="cap">DHCP relay lab topology: helper LAN interface par hai aur server giaddr ko jawab deta hai.</p></div>

<h3>Relay configuration aur yeh aur kya forward karta hai</h3>
<pre class="code">interface GigabitEthernet0/0
 ip address 192.168.50.1 255.255.255.0
 ip helper-address 10.30.30.1           <span class="c">! us interface par jo broadcast RECEIVE karta hai</span>
<span class="c">! optional: jo broadcasts nahi chahiye unhe forward karna band karo</span>
no ip forward-protocol udp tftp
no ip forward-protocol udp netbios-ns</pre>
<p><code>ip helper-address</code> default mein aath UDP services forward karta hai: DHCP/BOOTP (67 aur 68), TFTP (69), DNS (53), Time (37), TACACS (49), NetBIOS name (137), NetBIOS datagram (138) aur IEN-116 name service (42). Kai helper lines har server ko ek copy bhejti hain, isi tarah redundant DHCP servers banaye jaate hain.</p>

<h3>Option 82: relay agent information</h3>
<p>Option 82 se relay ya access switch server ko batata hai ki client <b>kahan</b> juda hai: circuit ID (jaise VLAN aur port) aur remote ID (jaise switch MAC). Router relay ise <code>ip dhcp relay information option</code> se jodta hai. Servers ise address policy aur tracking ke liye use kar sakte hain.</p>
<p>Mashhoor fault access switch par <b>DHCP snooping</b> se juda hai. Default mein switch option 82 daalta hai par giaddr ko 0.0.0.0 chhod deta hai, kyunki woh relay nahi hai. Upstream IOS relay ya server phir option 82 aur giaddr 0 wala packet untrusted interface par aata dekhta hai, aur use drop kar deta hai. Design ke hisaab se fixes:</p>
<pre class="code"><span class="c">! IOS relay router par, access switch se aaye option 82 ko trust karo</span>
interface GigabitEthernet0/0
 ip dhcp relay information trusted
<span class="c">! ya globally</span>
ip dhcp relay information trust-all
<span class="c">! ya access switch par, option 82 daalna band karo</span>
no ip dhcp snooping information option</pre>

<h3>Troubleshooting table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Kahan dekhein</th></tr>
<tr><td>Server statistics mein branch se koi DISCOVER nahi</td><td>Helper missing, galat interface par ya galat IP par; ACL UDP 67 block kar raha; relay par <code>no service dhcp</code></td></tr>
<tr><td>Server ko DISCOVER milta hai, client ko OFFER kabhi nahi</td><td>Server se giaddr tak route nahi; giaddr subnet ka pool nahi (debug mein "there is no address pool for 192.168.50.1"); pool khatam</td></tr>
<tr><td>Sirf kuch VLANs ke liye chalta hai</td><td>Helper sirf kuch SVIs par configure; naye subnet ka pool missing</td></tr>
<tr><td>Snooping enable karne ke baad drops</td><td>Untrusted relay interface par giaddr 0 ke saath option 82</td></tr>
<tr><td>Lease OK, connectivity nahi</td><td>Pool mein galat default-router</td></tr></table>

<div class="eg"><p><b>Worked example (lab 2 fault 1 aur 2).</b> BR par <code>show ip interface GigabitEthernet0/1</code> WAN link par <code>Helper address is 10.30.30.1</code> dikhata hai, jabki Gi0/0 kehta hai <code>Helper address is not set</code>. Broadcasts Gi0/0 par aate hain, isliye kuch relay nahi hota. Helper shift karne ke baad, HQ par <code>debug ip dhcp server packet</code> relay 192.168.50.1 se DISCOVER dikhata hai, par client ko phir bhi kuch nahi milta: HQ par <code>show ip route 192.168.50.1</code> <code>% Network not in table</code> lautata hai. <code>ip route 192.168.50.0 255.255.255.0 10.20.20.1</code> jodne se OFFER BR tak pahunchta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Helper ko server ki taraf wale interface par lagana; helper ko aise address par point karna jahan relay pahunch nahi sakta; giaddr tak return route bhoolna (relay ka LAN subnet aksar core mein advertise nahi hota); helper ko physical interface par lagana jabki clients SVI ya subinterface par hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Server pool ko <b>giaddr</b> se chunta hai, relay ke source IP ya client MAC se nahi. giaddr us interface ka IP hai jisne broadcast receive kiya, lab mein 192.168.50.1.</p></div>

<div class="scn"><h4>Bina addresses wala naya floor</h4><p>Ek company ne Layer 3 switch par VLAN 50 ke saath floor 5 khola. Baaki har floor ko central Windows DHCP server se addresses milte the. Floor 5 par clients ne khud 169.254.x.x addresses le liye. VLAN 50 ka SVI tha, par engineer ne helper jodne se pehle ke purane floor se config copy ki thi. Interface Vlan50 par <code>ip helper-address</code> jodne ke baad, server logs mein bina matching scope ke requests dikhi, isliye DHCP team ko 10.5.50.0/24 scope bhi banana pada.</p><p><b>Seekh:</b> relay ko teen tukde chahiye: receiving interface par helper, giaddr se match karta pool, aur dono taraf routing.</p></div>

<div class="iv"><p class="q">"giaddr kya hai aur yeh kyun matter karta hai?"</p><p>DHCP header ka gateway IP address field. Relay us interface ka IP likhta hai jisne client ka broadcast receive kiya. Server ise pool chunne ke liye use karta hai (woh pool jiske network mein giaddr ho) aur apna reply usi address par bhejta hai. Isliye galat helper interface ka matlab galat pool ya koi pool nahi, aur giaddr tak route na ho to reply kabhi wapas nahi aata. Extra points ke liye option 82 aur snooping ka giaddr 0 issue batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip helper-address</code> us interface par jaata hai jo client broadcasts receive karta hai.</li>
<li>Relay giaddr ko us interface IP par set karta hai; server giaddr se pool chunta hai aur usi ko reply karta hai.</li>
<li>Server ko giaddr ke subnet tak wapas route chahiye.</li>
<li>Helper default mein aath UDP services forward karta hai; <code>no ip forward-protocol udp</code> se kam karo.</li>
<li>Snooping switch se giaddr 0 wala option 82 IOS drop karta hai jab tak relay use trust na kare.</li>
</ul></div>
`}};export{e as default};