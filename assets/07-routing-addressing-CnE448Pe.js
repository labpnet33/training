var e={id:`routing-addressing`,h:{en:`Routing and addressing faults`,hi:`Routing aur addressing faults`},body:{en:`
<p>The second half of objective 5.3 is about layer 3: route selection, default routes, DHCP address pool exhaustion, and the three host settings that break most often, the IP address, the subnet mask and the default gateway. Think of the postal system. The address on the envelope (IP), the postcode area it belongs to (mask), the local post office where you drop letters for other towns (gateway), and the sorting office's rulebook of which town goes where (routing table). Get any one wrong and the letter is lost.</p>

<h3>Route selection: reading the routing table</h3>
<p>A router chooses a path for each packet in this order:</p>
<ol>
<li><b>Longest prefix match.</b> The most specific matching route wins. For 10.20.30.40, a /24 beats a /16, which beats the default /0.</li>
<li><b>Administrative distance</b> (only when two sources offer the same prefix): connected 0, static 1, OSPF 110, RIP 120. Lower is more trusted.</li>
<li><b>Metric</b> (within one routing protocol): lower cost wins; equal costs may load-share.</li>
</ol>
<pre class="out">R1# show ip route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0
S*    0.0.0.0/0 [1/0] via 203.0.113.1
      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
C        10.0.10.0/24 is directly connected, GigabitEthernet0/0
L        10.0.10.1/32 is directly connected, GigabitEthernet0/0
S        10.20.0.0/16 [1/0] via 10.0.99.2
<span class="hl">O        10.20.30.0/24 [110/2] via 10.0.99.6, 00:14:22, GigabitEthernet0/2</span></pre>
<p>A packet to 10.20.30.40 matches both 10.20.0.0/16 and 10.20.30.0/24, so it follows the /24 via 10.0.99.6, even though the static route has a better AD. AD only compares routes to the <b>same</b> prefix. Typical routing faults: a missing route (the packet falls to the default or is dropped), a wrong next hop, a more specific route that sends traffic somewhere unexpected, and a missing <b>return route</b> on the far side, so replies never come back.</p>

<h3>Default routes</h3>
<p>The default route 0.0.0.0/0 is the "everything else" route, usually toward the internet. When it is missing, internal traffic works but the internet does not, and <code>show ip route</code> says <b>Gateway of last resort is not set</b>. When it points at the wrong next hop (an old ISP address), traceroute stops at the first hop. Hosts have their own version: the <b>default gateway</b>.</p>

<h3>Incorrect default gateway</h3>
<p>A host sends anything outside its own subnet to its gateway. If the gateway is wrong, the host still reaches its own subnet, but nothing remote. The trap: a wrong gateway on a <b>server</b> breaks <b>replies</b>. Clients' requests arrive, but the server sends its answers to a gateway that does not exist. That is the second fault in the file-server lab:</p>
<pre class="out">SRV&gt; show ip
NAME        : SRV[1]
IP/MASK     : 10.0.20.10/24
<span class="hl">GATEWAY     : 10.0.20.254</span>
DNS         :
MAC         : 00:50:79:66:68:02</pre>
<p>R1's interface on that subnet is 10.0.20.1, so the fix is <code>ip 10.0.20.10/24 10.0.20.1</code>.</p>

<h3>Incorrect subnet mask</h3>
<p>The mask tells a host which addresses are local (send directly, using ARP) and which are remote (send to the gateway). A wrong mask makes it guess wrong.</p>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Host forwarding decision">
<rect x="200" y="10" width="240" height="44" rx="8" fill="#fde68a"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Destination inside my subnet?</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">(my IP AND my mask)</text>
<rect x="40" y="100" width="230" height="44" rx="8" fill="#bbf7d0"/><text x="155" y="120" text-anchor="middle" class="svg-ink" font-size="13">Yes: ARP for the host</text><text x="155" y="136" text-anchor="middle" class="svg-muted" font-size="12">send directly</text>
<rect x="370" y="100" width="230" height="44" rx="8" fill="#bae6fd"/><text x="485" y="120" text-anchor="middle" class="svg-ink" font-size="13">No: ARP for the gateway</text><text x="485" y="136" text-anchor="middle" class="svg-muted" font-size="12">send to the router</text>
<line x1="260" y1="54" x2="155" y2="100" stroke="#64748b"/><line x1="380" y1="54" x2="485" y2="100" stroke="#64748b"/>
</svg><p class="cap">The mask drives this decision. A wrong mask sends traffic down the wrong branch.</p></div>

<div class="eg"><p><b>Worked example.</b> PC1 is 10.0.10.10 with gateway 10.0.10.1, but someone typed <b>255.255.0.0</b> instead of 255.255.255.0.</p>
<ul>
<li>With /16, PC1 thinks the local network is 10.0.0.0 to 10.0.255.255.</li>
<li>The file server 10.0.20.10 falls inside that range, so PC1 believes it is local and sends an ARP request for 10.0.20.10 instead of using the gateway.</li>
<li>The server is in another VLAN, behind R1, so nobody answers the ARP. Ping fails, while pings to 10.0.10.x hosts still work.</li>
</ul>
<p>The reverse also fails: a mask that is too long (say /28) makes a host treat local neighbours as remote and send them to the gateway. Fix: correct the mask to match the subnet design (/24).</p></div>

<h3>Incorrect IP address</h3>
<ul>
<li><b>Wrong subnet:</b> an address outside the VLAN's range (for example 10.0.30.5 on the 10.0.10.0/24 VLAN) cannot reach its gateway.</li>
<li><b>Duplicate IP:</b> two devices share one address. Symptoms are intermittent: connections drop, then work, as other devices' ARP caches flip between the two MACs. Windows may warn about an address conflict. <code>arp -a</code> on a neighbour, or <code>show ip arp</code> on the gateway, shows the address with an unexpected MAC.</li>
<li><b>APIPA 169.254.x.x:</b> the host asked DHCP and got no answer. Check the path to the DHCP server, the relay (<code>ip helper-address</code>) and the pool.</li>
</ul>

<h3>Address pool exhaustion</h3>
<p>A DHCP scope has a fixed number of addresses. When all are leased, new clients get nothing and fall back to APIPA, while existing clients carry on, which makes the problem look random. Common on guest Wi-Fi with long leases.</p>
<pre class="out">R1# show ip dhcp pool GUEST
Pool GUEST :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 <span class="hl">Total addresses                : 254</span>
 <span class="hl">Leased addresses               : 254</span>
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 10.0.50.1            10.0.50.1        - 10.0.50.254       254</pre>
<p>Fixes: shorten the lease (for example from 8 days to 4 hours for guests), enlarge the scope (a /23 instead of a /24), remove stale bindings (<code>clear ip dhcp binding *</code> in a quiet period), and if a single MAC is grabbing many leases, suspect a starvation attack and enable DHCP snooping.</p>

<div class="warn"><p><b>Common mistakes.</b> Checking only the client when replies never return: always check the server's gateway and the far router's return route. Believing administrative distance beats a longer prefix. Rebooting a PC with APIPA again and again instead of checking the DHCP pool.</p></div>

<div class="exam"><p><b>Exam traps.</b> Can reach local hosts but not remote = default gateway (or routing). Can reach some local hosts but not others, or remote hosts that "look local" fail = subnet mask. 169.254.x.x = no DHCP answer, possibly pool exhaustion. Intermittent drops for one address = duplicate IP. Longest prefix match beats AD.</p></div>

<div class="scn"><h4>The conference that ran out of addresses</h4><p>During a two-day conference, guest Wi-Fi worked for the first hour, then new arrivals could not connect. Their phones showed "connected, no internet" and 169.254 addresses. The DHCP pool for guests was a /24 with an 8-day lease: 254 addresses were all leased to the first wave of phones, many of them from people who had already left. The team shortened the lease to 2 hours, expanded the guest scope to a /22 and cleared stale bindings. New clients connected within minutes.</p><p><b>Lesson:</b> when some clients work and new ones do not, look at the DHCP pool utilisation first.</p></div>

<div class="iv"><p class="q">"A host can ping devices in its own subnet but nothing outside it. What do you check?"</p><p>First the host's default gateway: is it configured, in the same subnet, and the correct address? Then the gateway itself: is its interface up, does it have a route to the destination, and does the destination have a route (or a correct gateway) back? Mention checking the subnet mask too, and using traceroute to see where the path stops.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route selection: longest prefix first, then administrative distance, then metric.</li>
<li>No default route = no internet; <code>show ip route</code> shows "Gateway of last resort is not set".</li>
<li>Wrong gateway breaks remote traffic, and on a server it breaks the replies.</li>
<li>Wrong mask makes a host treat remote hosts as local (or the reverse); duplicate IPs cause intermittent drops.</li>
<li>Pool exhaustion: new clients get 169.254.x.x; shorten leases, enlarge the scope, clear stale bindings.</li>
</ul></div>
`,hi:`
<p>Objective 5.3 ka doosra half layer 3 ke baare mein hai: route selection, default routes, DHCP address pool exhaustion, aur woh teen host settings jo sabse zyada tootti hain, IP address, subnet mask aur default gateway. Postal system ke baare mein socho. Lifaafe par address (IP), woh postcode area jiska woh hissa hai (mask), local post office jahan aap doosre shehron ki chitthiyan daalte ho (gateway), aur sorting office ki rulebook ki kaunsa shehar kahan jaata hai (routing table). Inmein se ek bhi galat ho aur chitthi kho jaati hai.</p>

<h3>Route selection: routing table padhna</h3>
<p>Router har packet ke liye is order mein path chunta hai:</p>
<ol>
<li><b>Longest prefix match.</b> Sabse specific matching route jeetta hai. 10.20.30.40 ke liye /24, /16 ko harata hai, jo default /0 ko harata hai.</li>
<li><b>Administrative distance</b> (sirf tab jab do sources same prefix dein): connected 0, static 1, OSPF 110, RIP 120. Kam matlab zyada trusted.</li>
<li><b>Metric</b> (ek routing protocol ke andar): kam cost jeetta hai; barabar costs load-share kar sakte hain.</li>
</ol>
<pre class="out">R1# show ip route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0
S*    0.0.0.0/0 [1/0] via 203.0.113.1
      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
C        10.0.10.0/24 is directly connected, GigabitEthernet0/0
L        10.0.10.1/32 is directly connected, GigabitEthernet0/0
S        10.20.0.0/16 [1/0] via 10.0.99.2
<span class="hl">O        10.20.30.0/24 [110/2] via 10.0.99.6, 00:14:22, GigabitEthernet0/2</span></pre>
<p>10.20.30.40 ka packet 10.20.0.0/16 aur 10.20.30.0/24 dono se match karta hai, isliye woh 10.0.99.6 via /24 follow karta hai, bhale hi static route ka AD behtar hai. AD sirf <b>same</b> prefix ke routes compare karta hai. Typical routing faults: missing route (packet default par girta hai ya drop hota hai), galat next hop, zyada specific route jo traffic kahin aur bhej de, aur door wali side par missing <b>return route</b>, jisse replies kabhi wapas nahi aate.</p>

<h3>Default routes</h3>
<p>Default route 0.0.0.0/0 "baaki sab kuch" wala route hai, aam taur par internet ki taraf. Jab yeh missing ho, internal traffic chalta hai lekin internet nahi, aur <code>show ip route</code> kehta hai <b>Gateway of last resort is not set</b>. Jab yeh galat next hop (purana ISP address) ki taraf point kare, traceroute pehle hop par ruk jaata hai. Hosts ka apna version hota hai: <b>default gateway</b>.</p>

<h3>Galat default gateway</h3>
<p>Host apne subnet ke bahar ki har cheez apne gateway ko bhejta hai. Agar gateway galat hai, to host ab bhi apne subnet tak pahunchta hai, lekin remote kuch nahi. Trap: <b>server</b> par galat gateway <b>replies</b> tod deta hai. Clients ki requests pahunchti hain, lekin server apne jawab aise gateway ko bhejta hai jo exist hi nahi karta. File-server lab ka doosra fault yahi hai:</p>
<pre class="out">SRV&gt; show ip
NAME        : SRV[1]
IP/MASK     : 10.0.20.10/24
<span class="hl">GATEWAY     : 10.0.20.254</span>
DNS         :
MAC         : 00:50:79:66:68:02</pre>
<p>Us subnet par R1 ka interface 10.0.20.1 hai, isliye fix hai <code>ip 10.0.20.10/24 10.0.20.1</code>.</p>

<h3>Galat subnet mask</h3>
<p>Mask host ko batata hai kaunse addresses local hain (seedha bhejo, ARP use karke) aur kaunse remote (gateway ko bhejo). Galat mask use galat andaaza lagwata hai.</p>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Host ka forwarding decision">
<rect x="200" y="10" width="240" height="44" rx="8" fill="#fde68a"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Destination mere subnet mein?</text><text x="320" y="46" text-anchor="middle" class="svg-muted" font-size="12">(mera IP AND mera mask)</text>
<rect x="40" y="100" width="230" height="44" rx="8" fill="#bbf7d0"/><text x="155" y="120" text-anchor="middle" class="svg-ink" font-size="13">Haan: host ke liye ARP</text><text x="155" y="136" text-anchor="middle" class="svg-muted" font-size="12">seedha bhejo</text>
<rect x="370" y="100" width="230" height="44" rx="8" fill="#bae6fd"/><text x="485" y="120" text-anchor="middle" class="svg-ink" font-size="13">Nahi: gateway ke liye ARP</text><text x="485" y="136" text-anchor="middle" class="svg-muted" font-size="12">router ko bhejo</text>
<line x1="260" y1="54" x2="155" y2="100" stroke="#64748b"/><line x1="380" y1="54" x2="485" y2="100" stroke="#64748b"/>
</svg><p class="cap">Mask yeh decision chalata hai. Galat mask traffic ko galat branch mein bhejta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> PC1 10.0.10.10 hai gateway 10.0.10.1 ke saath, lekin kisi ne 255.255.255.0 ki jagah <b>255.255.0.0</b> type kar diya.</p>
<ul>
<li>/16 ke saath PC1 sochta hai local network 10.0.0.0 se 10.0.255.255 tak hai.</li>
<li>File server 10.0.20.10 us range ke andar aata hai, isliye PC1 use local maanta hai aur gateway use karne ki jagah 10.0.20.10 ke liye ARP request bhejta hai.</li>
<li>Server doosre VLAN mein hai, R1 ke peeche, isliye ARP ka koi jawab nahi deta. Ping fail hoti hai, jabki 10.0.10.x hosts ki pings ab bhi chalti hain.</li>
</ul>
<p>Ulta bhi fail hota hai: bahut lamba mask (jaise /28) host se local neighbours ko remote maanwata hai aur unhe gateway ko bhejwata hai. Fix: mask ko subnet design (/24) se match karo.</p></div>

<h3>Galat IP address</h3>
<ul>
<li><b>Galat subnet:</b> VLAN ki range ke bahar ka address (jaise 10.0.10.0/24 VLAN par 10.0.30.5) apne gateway tak nahi pahunch sakta.</li>
<li><b>Duplicate IP:</b> do devices ek address share karte hain. Symptoms intermittent hote hain: connections girte hain, phir chalte hain, kyunki doosre devices ke ARP caches do MACs ke beech palat-te rehte hain. Windows address conflict ki warning de sakta hai. Neighbour par <code>arp -a</code>, ya gateway par <code>show ip arp</code>, address ko unexpected MAC ke saath dikhata hai.</li>
<li><b>APIPA 169.254.x.x:</b> host ne DHCP se poochha aur jawab nahi mila. DHCP server tak path, relay (<code>ip helper-address</code>) aur pool check karo.</li>
</ul>

<h3>Address pool exhaustion</h3>
<p>DHCP scope mein addresses ki fixed sankhya hoti hai. Jab saare lease ho jaate hain, naye clients ko kuch nahi milta aur woh APIPA par gir jaate hain, jabki existing clients chalte rehte hain, jisse problem random lagti hai. Lambe leases wale guest Wi-Fi par common hai.</p>
<pre class="out">R1# show ip dhcp pool GUEST
Pool GUEST :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (first/next)       : 0 / 0
 <span class="hl">Total addresses                : 254</span>
 <span class="hl">Leased addresses               : 254</span>
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range                    Leased addresses
 10.0.50.1            10.0.50.1        - 10.0.50.254       254</pre>
<p>Fixes: lease chhota karo (jaise guests ke liye 8 din se 4 ghante), scope bada karo (/24 ki jagah /23), stale bindings hatao (shaant samay mein <code>clear ip dhcp binding *</code>), aur agar ek hi MAC bahut saare leases le raha ho, to starvation attack ka shak karo aur DHCP snooping enable karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Jab replies kabhi wapas na aayein tab sirf client check karna: hamesha server ka gateway aur door wale router ka return route check karo. Yeh maanna ki administrative distance lambe prefix ko harata hai. APIPA wale PC ko baar baar reboot karna bajaye DHCP pool check karne ke.</p></div>

<div class="exam"><p><b>Exam traps.</b> Local hosts tak pahunch hai lekin remote nahi = default gateway (ya routing). Kuch local hosts tak pahunch hai aur kuch tak nahi, ya "local dikhne wale" remote hosts fail = subnet mask. 169.254.x.x = DHCP jawab nahi, shayad pool exhaustion. Ek address ke intermittent drops = duplicate IP. Longest prefix match AD ko harata hai.</p></div>

<div class="scn"><h4>Conference jiske addresses khatam ho gaye</h4><p>Do din ki conference mein guest Wi-Fi pehle ghante chala, phir naye aane wale connect nahi kar paaye. Unke phones "connected, no internet" aur 169.254 addresses dikha rahe the. Guests ka DHCP pool 8-din lease ke saath /24 tha: saare 254 addresses phones ki pehli wave ko lease ho gaye, jinmein se kai log ja chuke the. Team ne lease 2 ghante kiya, guest scope /22 tak badhaya aur stale bindings clear ki. Naye clients minuton mein connect ho gaye.</p><p><b>Seekh:</b> jab kuch clients chalein aur naye na chalein, to pehle DHCP pool utilisation dekho.</p></div>

<div class="iv"><p class="q">"Ek host apne subnet ke devices ko ping kar sakta hai lekin bahar kuch nahi. Kya check karoge?"</p><p>Pehle host ka default gateway: configured hai, same subnet mein hai, aur sahi address hai? Phir khud gateway: uska interface up hai, destination tak route hai, aur destination ke paas wapas route (ya sahi gateway) hai? Subnet mask check karna bhi mention karo, aur traceroute se dekhna ki path kahan rukta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route selection: pehle longest prefix, phir administrative distance, phir metric.</li>
<li>Default route nahi = internet nahi; <code>show ip route</code> "Gateway of last resort is not set" dikhata hai.</li>
<li>Galat gateway remote traffic todta hai, aur server par replies tod deta hai.</li>
<li>Galat mask host se remote hosts ko local maanwata hai (ya ulta); duplicate IPs intermittent drops laate hain.</li>
<li>Pool exhaustion: naye clients ko 169.254.x.x milta hai; leases chhote karo, scope bada karo, stale bindings clear karo.</li>
</ul></div>
`}};export{e as default};