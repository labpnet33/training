var e={id:`switch-end-to-end`,h:{en:`The switch side and end-to-end testing`,hi:`Switch side aur end-to-end testing`},body:{en:`
<p><b>Analogy: a two-ended pipe.</b> Water flows only if both ends of the pipe are fitted. The firewall subinterfaces are one end; the switch trunk is the other. Most "the firewall does not work" tickets with subinterfaces are actually a bad second end. This chapter builds the switch end, then tests the whole path.</p>

<h3>The switch configuration</h3>
<p>The lab switch SW1 (Cisco-style syntax, as in ccna-vlans) has VLAN 10 and VLAN 20, a trunk to the firewall, and one host port in each VLAN:</p>
<pre class="code">vlan 10
 name USERS
vlan 20
 name SERVERS
interface g0/1
 switchport mode trunk
interface g0/2
 switchport mode access
 switchport access vlan 10
interface g0/3
 switchport mode access
 switchport access vlan 20</pre>
<p>g0/1 goes to the firewall's ethernet1/2. g0/2 connects PC10 (10.10.10.50, gateway 10.10.10.1) and g0/3 connects SRV20 (10.10.20.50, gateway 10.10.20.1). Verify the VLANs and the trunk:</p>
<pre class="out">SW1&gt; show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/4, Gi0/5, Gi0/6
10   USERS                            active    Gi0/2
20   SERVERS                          active    Gi0/3

SW1&gt; show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1
Port        Vlans allowed and active in management domain
<span class="hl">Gi0/1       1,10,20</span></pre>
<p>(Output trimmed to the lines that matter.) Both VLANs reach the trunk. Now the hosts can find their gateways.</p>

<h3>Test 1: the gateway</h3>
<pre class="out">PC10&gt; ping 10.10.10.1
84 bytes from 10.10.10.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.10.10.1 icmp_seq=2 ttl=64 time=0.600 ms
...</pre>
<p>The subinterface answers because of the <code>allow-ping</code> profile and because the VLAN 10 frames, tagged on the trunk, reach ethernet1/2.10. TTL 64 is the firewall's own reply.</p>

<h3>Test 2: through the firewall, before the policy exists</h3>
<p>In the first build the servers subinterface was in the virtual router but not yet in a zone. PC10 tried to reach SRV20:</p>
<pre class="out">PC10&gt; ping 10.10.20.50
10.10.20.50 icmp_seq=1 timeout
10.10.20.50 icmp_seq=2 timeout
10.10.20.50 icmp_seq=3 timeout
...</pre>
<p>The packet reached the firewall, but with no zone on the destination subinterface and no rule, it was dropped. Create the zone and one rule:</p>
<pre class="code">set zone servers network layer3 ethernet1/2.20
set rulebase security rules Users-to-Servers from users to servers source any destination any application [ ping web-browsing ] service application-default action allow
commit</pre>
<pre class="out">PC10&gt; ping 10.10.20.50
84 bytes from 10.10.20.50 icmp_seq=1 ttl=63 time=0.500 ms
84 bytes from 10.10.20.50 icmp_seq=2 ttl=63 time=0.600 ms
...</pre>
<p>TTL 63 means the packet was routed once (64 minus one hop), the sign of passing through the firewall rather than a switch. Now prove what the firewall did.</p>

<h3>Proving it: ARP, session, log</h3>
<pre class="out">admin@NK-PA&gt; show arp all
total ARP entries in table :        2
interface         ip address        hw address          port              status  ttl
<span class="hl">ethernet1/2.10    10.10.10.50       00:50:36:1d:fa:01   ethernet1/2.10    c       1800</span>
<span class="hl">ethernet1/2.20    10.10.20.50       00:50:1b:aa:69:01   ethernet1/2.20    c       1800</span>

admin@NK-PA&gt; show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW       10.10.10.50[19499]/users/1  (10.10.10.50[19499])
vsys1                                          10.10.20.50[8]/servers  (10.10.20.50[8])

admin@NK-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
2026/10/02 03:41:32 ping            users           19499     10.10.10.50
<span class="hl">Users-to-Servers allow           servers         0         10.10.20.50</span></pre>
<p>The ARP entries show that each neighbour was learned on its own subinterface. The session shows <b>users to servers</b> with no NAT (both are internal), and the log names the rule. Finally you can ask the policy engine without traffic:</p>
<pre class="out">admin@NK-PA&gt; test security-policy-match from users to servers source 10.10.10.50 destination 10.10.20.50 protocol 6 destination-port 80
"Users-to-Servers; index: 1" {
        from users;
        to servers;
        application/service [ ping web-browsing ]/application-default;
        action allow;
}</pre>

<div class="eg"><p><b>Worked example.</b> Management wants the servers to be reachable from users only for web. Edit the rule applications to <code>web-browsing</code> only (and ping if you want test access). SSH from a user to the server finds no rule and is denied by the interzone default. The change is a policy edit, not a network redesign, which is the payoff of per-VLAN zones.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Testing from a host whose own default gateway is wrong. Forgetting that the hosts' gateway must be the subinterface IP, not the switch's management address. Changing the firewall without checking the trunk allowed list. Declaring victory after a ping from the firewall instead of from a host in the VLAN.</p></div>
<div class="exam"><p><b>Exam trap.</b> A ping from a VLAN host to its own gateway tests the subinterface and the trunk. A ping from a host in VLAN 10 to a host in VLAN 20 additionally tests zones and policy. Decide which test answers which question.</p></div>

<div class="scn"><h4>The test that proved nothing</h4><p>After a migration the engineer pinged the new gateways from the firewall CLI and reported success. Hosts in VLAN 20 still had no connectivity. The trunk allowed list on the switch had been trimmed during the change and VLAN 20 was missing: the firewall's own ARP table showed no hosts on ethernet1/2.20. Restoring the VLAN on the trunk fixed it.</p><p><b>Lesson:</b> test from the host side and read the ARP table per subinterface.</p></div>

<div class="iv"><p class="q">"Inter-VLAN traffic through a firewall subinterface setup is not working. What do you check?"</p><p>First the trunk: VLANs allowed and active on the switch port and matching tags on the firewall. Then show interface all for the tag, zone and virtual router of each subinterface, then the ARP table per subinterface, then test security-policy-match between the zones, and finally the session and traffic log after a test from a host.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The switch trunk must carry and allow the same VLANs and tags.</li>
<li>A ping to the subinterface IP tests the trunk and subinterface; a ping across VLANs also tests zones and policy.</li>
<li>TTL 63 across VLANs shows the firewall routed the packet once.</li>
<li>show arp all shows neighbours per subinterface.</li>
<li>Prove policy with test security-policy-match, show session all and show log traffic.</li>
</ul></div>
`,hi:`
<p><b>Analogy: do-sire wali pipe.</b> Paani tabhi behta hai jab pipe ke dono sire lage hon. Firewall subinterfaces ek sira hain; switch trunk doosra. Subinterfaces wale zyadatar "firewall kaam nahi kar raha" tickets asal mein kharab doosre sire ke hote hain. Yeh chapter switch ka sira banata hai, phir poore path ko test karta hai.</p>

<h3>Switch configuration</h3>
<p>Lab switch SW1 (Cisco-style syntax, jaise ccna-vlans mein) mein VLAN 10 aur VLAN 20, firewall ki taraf trunk, aur har VLAN mein ek host port hai:</p>
<pre class="code">vlan 10
 name USERS
vlan 20
 name SERVERS
interface g0/1
 switchport mode trunk
interface g0/2
 switchport mode access
 switchport access vlan 10
interface g0/3
 switchport mode access
 switchport access vlan 20</pre>
<p>g0/1 firewall ke ethernet1/2 se jaata hai. g0/2 PC10 (10.10.10.50, gateway 10.10.10.1) aur g0/3 SRV20 (10.10.20.50, gateway 10.10.20.1) se judta hai. VLANs aur trunk verify karo:</p>
<pre class="out">SW1&gt; show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/4, Gi0/5, Gi0/6
10   USERS                            active    Gi0/2
20   SERVERS                          active    Gi0/3

SW1&gt; show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1
Port        Vlans allowed and active in management domain
<span class="hl">Gi0/1       1,10,20</span></pre>
<p>(Output sirf kaam ki lines tak trim kiya.) Dono VLANs trunk tak pahunchti hain. Ab hosts apne gateways dhoondh sakte hain.</p>

<h3>Test 1: gateway</h3>
<pre class="out">PC10&gt; ping 10.10.10.1
84 bytes from 10.10.10.1 icmp_seq=1 ttl=64 time=0.500 ms
84 bytes from 10.10.10.1 icmp_seq=2 ttl=64 time=0.600 ms
...</pre>
<p>Subinterface <code>allow-ping</code> profile ki wajah se jawab deta hai, aur isliye ki trunk par tagged VLAN 10 ke frames ethernet1/2.10 tak pahunchte hain. TTL 64 firewall ka apna reply hai.</p>

<h3>Test 2: firewall ke through, policy bante se pehle</h3>
<p>Pehle build mein servers subinterface virtual router mein tha lekin abhi zone mein nahi. PC10 ne SRV20 tak pahunchne ki koshish ki:</p>
<pre class="out">PC10&gt; ping 10.10.20.50
10.10.20.50 icmp_seq=1 timeout
10.10.20.50 icmp_seq=2 timeout
10.10.20.50 icmp_seq=3 timeout
...</pre>
<p>Packet firewall tak pahuncha, lekin destination subinterface ka zone nahi tha aur rule bhi nahi, isliye drop hua. Zone aur ek rule banao:</p>
<pre class="code">set zone servers network layer3 ethernet1/2.20
set rulebase security rules Users-to-Servers from users to servers source any destination any application [ ping web-browsing ] service application-default action allow
commit</pre>
<pre class="out">PC10&gt; ping 10.10.20.50
84 bytes from 10.10.20.50 icmp_seq=1 ttl=63 time=0.500 ms
84 bytes from 10.10.20.50 icmp_seq=2 ttl=63 time=0.600 ms
...</pre>
<p>TTL 63 ka matlab packet ek baar route hua (64 minus ek hop), yeh firewall se guzarne ka nishan hai, switch se nahi. Ab saabit karo ki firewall ne kya kiya.</p>

<h3>Saabit karna: ARP, session, log</h3>
<pre class="out">admin@NK-PA&gt; show arp all
total ARP entries in table :        2
interface         ip address        hw address          port              status  ttl
<span class="hl">ethernet1/2.10    10.10.10.50       00:50:36:1d:fa:01   ethernet1/2.10    c       1800</span>
<span class="hl">ethernet1/2.20    10.10.20.50       00:50:1b:aa:69:01   ethernet1/2.20    c       1800</span>

admin@NK-PA&gt; show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW       10.10.10.50[19499]/users/1  (10.10.10.50[19499])
vsys1                                          10.10.20.50[8]/servers  (10.10.20.50[8])

admin@NK-PA&gt; show log traffic
Time                App             From            Src Port  Source
Rule            Action          To              Dst Port  Destination
2026/10/02 03:41:32 ping            users           19499     10.10.10.50
<span class="hl">Users-to-Servers allow           servers         0         10.10.20.50</span></pre>
<p>ARP entries dikhati hain ki har neighbour apne subinterface par seekha gaya. Session <b>users se servers</b> dikhata hai bina NAT ke (dono internal hain), aur log rule ka naam batata hai. Aakhir mein aap traffic ke bina policy engine se pooch sakte ho:</p>
<pre class="out">admin@NK-PA&gt; test security-policy-match from users to servers source 10.10.10.50 destination 10.10.20.50 protocol 6 destination-port 80
"Users-to-Servers; index: 1" {
        from users;
        to servers;
        application/service [ ping web-browsing ]/application-default;
        action allow;
}</pre>

<div class="eg"><p><b>Worked example.</b> Management chahta hai ki servers users se sirf web ke liye reachable hon. Rule ki applications ko sirf <code>web-browsing</code> karo (aur test access chahiye to ping). User ka server par SSH kisi rule se match nahi karta aur interzone default se denied hota hai. Change ek policy edit hai, network redesign nahi, yahi har-VLAN zones ka fayda hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Aise host se test karna jiska apna default gateway galat hai. Yeh bhool jaana ki hosts ka gateway subinterface IP hona chahiye, switch ka management address nahi. Trunk allowed list check kiye bina firewall badalna. Firewall CLI se ping ke baad jeet ghoshit karna, VLAN ke host se nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> VLAN host ka apne gateway ko ping subinterface aur trunk test karta hai. VLAN 10 ke host ka VLAN 20 ke host ko ping zones aur policy bhi test karta hai. Tay karo kaunsa test kis sawal ka jawab deta hai.</p></div>

<div class="scn"><h4>Test jisne kuch saabit nahi kiya</h4><p>Migration ke baad engineer ne firewall CLI se naye gateways ping kiye aur success report kiya. VLAN 20 ke hosts ko ab bhi connectivity nahi thi. Change ke dauran switch par trunk allowed list trim ho gayi thi aur VLAN 20 missing thi: firewall ki apni ARP table ne ethernet1/2.20 par koi host nahi dikhaya. VLAN ko trunk par wapas laane se fix hua.</p><p><b>Lesson:</b> host side se test karo aur har subinterface ki ARP table padho.</p></div>

<div class="iv"><p class="q">"Firewall subinterface setup mein inter-VLAN traffic nahi chal raha. Kya check karoge?"</p><p>Pehle trunk: switch port par VLANs allowed aur active hon aur firewall par tags match karein. Phir har subinterface ke tag, zone aur virtual router ke liye show interface all, phir har subinterface ki ARP table, phir zones ke beech test security-policy-match, aur aakhir mein host se test ke baad session aur traffic log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch trunk ko wahi VLANs aur tags carry aur allow karne honge.</li>
<li>Subinterface IP ka ping trunk aur subinterface test karta hai; VLANs ke beech ping zones aur policy bhi.</li>
<li>VLANs ke beech TTL 63 dikhata hai firewall ne packet ek baar route kiya.</li>
<li>show arp all subinterface ke hisaab se neighbours dikhata hai.</li>
<li>Policy ko test security-policy-match, show session all aur show log traffic se saabit karo.</li>
</ul></div>
`}};export{e as default};