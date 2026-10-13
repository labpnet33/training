var e={id:`routing-interfaces`,h:{en:`Routing, interfaces, ARP and ping: is the path itself healthy?`,hi:`Routing, interfaces, ARP aur ping: kya raasta khud theek hai?`},body:{en:`

<p><b>Sometimes the policy is perfect and the road is broken.</b> A firewall decides with rules, but the packet still needs a route, a working link, a neighbour that answers ARP, and a return path. This chapter covers the commands that test the path itself.</p>

<h3>Analogy: the road behind the gate</h3>
<p>Security can wave a traveller through, but if the road beyond the gate is closed or has no signboard, the traveller never arrives. Routing is the signboard, the interface is the road surface, ARP is knowing the address of the next house, and ping is a courtesy call to see if anyone is home.</p>

<h3>Routing table</h3>
<p><code>show routing route</code> prints the table of the virtual router. Read the <b>flags</b>: <code>A</code> active, <code>S</code> static, <code>C</code> connected, <code>H</code> host.</p>
<pre class="out">PA1&gt; show routing route
flags: A:active, ?:loose, C:connect, H:host, S:static, ~:internal, R:rip, O:ospf, B:bgp,
       Oi:ospf intra-area, Oo:ospf inter-area, O1:ospf ext-type-1, O2:ospf ext-type-2, E:ecmp, M:multicast

VIRTUAL ROUTER: default (id 1)
  ==========
destination                                 nexthop                                 metric flags      age   interface          next-AS
<span class="hl">0.0.0.0/0                                   203.0.113.1                             10     A S              ethernet1/1        </span>
10.0.1.0/24                                 10.0.1.1                                0      A C              ethernet1/2        
10.0.2.0/24                                 10.0.2.1                                0      A C              ethernet1/3        
203.0.113.0/29                              203.0.113.2                             0      A C              ethernet1/1        
total routes shown: 7</pre>
<p>The highlighted line is the default route: send everything unknown to 203.0.113.1 (the ISP) out of ethernet1/1. The connected routes for 10.0.1.0/24 and 10.0.2.0/24 exist because the interfaces have those addresses. The output above is trimmed (the host routes are left out).</p>
<p>The firewall uses the route lookup in two ways. First, to find the <b>egress zone</b> for the security and NAT decision. Second, to forward the packet. If a route is missing, the destination zone is wrong or unknown, so a rule that looks right never matches.</p>

<h3>Interfaces and zones</h3>
<p><code>show interface all</code> lists the hardware ports and then the logical interfaces with their zone, virtual router and address.</p>
<pre class="out">PA1&gt; show interface all
...
total configured logical interfaces: 3

name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/1         16    1    untrust          vr:default               0      203.0.113.2/29
ethernet1/2         17    1    trust            vr:default               0      10.0.1.1/24
ethernet1/3         18    1    dmz              vr:default               0      10.0.2.1/24</pre>
<p>Check three things: the link is up (the hardware section shows <code>1000/full/up</code>), the interface is in the right zone, and it is in the virtual router. An interface without a zone raises <code>flow_fwd_notopology</code>. To see one interface and its management profile:</p>
<pre class="out">PA1&gt; show interface ethernet1/2
Name: ethernet1/2, ID: 16, 802.1q tag: 0
Operation mode: layer3
Virtual router default
Interface MTU 1500
Interface IP address: 10.0.1.1/24
<span class="hl">Interface management profile: mgmt-lan</span>
Zone: trust, virtual system: vsys1</pre>
<p>The management profile decides whether the firewall answers ping, SSH or HTTPS on this interface. Traffic <i>through</i> the firewall is governed by security rules; traffic <i>to</i> the firewall interface is governed by this profile.</p>

<h3>ARP</h3>
<p><code>show arp all</code> lists neighbours the firewall has learned. Status <code>c</code> means complete. A missing or incomplete (<code>i</code>) entry for a next hop means the neighbour does not answer: wrong VLAN, cable, or the neighbour is down.</p>
<pre class="out">PA1&gt; show arp all
total ARP entries in table :        1
interface         ip address        hw address          port              status  ttl
ethernet1/2       10.0.1.10         00:50:7f:06:6d:01   ethernet1/2       c       1800</pre>

<h3>Ping and traceroute from the firewall</h3>
<p>This is a classic trap. If you run <code>ping host 8.8.8.8</code> without a source, the firewall uses its <b>management interface</b> and the management route, not the data plane. In the lab the management interface has no route to the internet, so the answer is misleading:</p>
<pre class="out">PA1&gt; ping host 8.8.8.8 count 2
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 0 received, 100% packet loss, time 1003ms</pre>
<p>The internet is fine; the test used the wrong path. To test the real data path, give the data interface address as the source:</p>
<pre class="out">PA1&gt; ping source 203.0.113.2 host 8.8.8.8 count 3
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=63 time=0.80 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=63 time=0.30 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=63 time=0.70 ms
--- 8.8.8.8 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss</pre>
<pre class="out">PA1&gt; traceroute source 203.0.113.2 host 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets
 1  203.0.113.1 (203.0.113.1)  0.540 ms  0.520 ms  0.530 ms
 2  8.8.8.8 (8.8.8.8)  0.750 ms  0.720 ms  0.730 ms</pre>
<p>Hop 1 is the ISP router, hop 2 the destination. If hop 1 does not answer, the problem is between the firewall and the ISP.</p>

<div class="eg"><p><b>Worked example.</b> Users in the DMZ cannot reach the internet. The security rule and NAT test are correct. show routing route has no default route because someone deleted it during a change. ping source 203.0.113.2 host 8.8.8.8 fails. Adding the static default route 0.0.0.0/0 via 203.0.113.1 restores service. The counters showed nothing because no policy was involved; the packet had no route.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pinging without source and concluding "the internet works". The ping went out of the management interface. Always specify the source address of the interface under test.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the difference: interface management profile controls traffic to the firewall; security policy controls traffic through it. Also know that route lookup determines the egress zone used by security and NAT.</p></div>

<div class="scn"><h4>The interface that never answered ping</h4><p>A new DMZ interface was configured and a server could not ping its gateway on the firewall. The security rules were irrelevant. flow_host_service_deny rose on every ping. The interface used a profile that did not allow ping. Switching it to a profile with ping enabled fixed it instantly.</p><p><b>Lesson:</b> Traffic to the firewall itself is not governed by security rules. Check the management profile and the delta counters.</p></div>

<div class="iv"><p class="q">"You ping an internet address from the firewall CLI and it works, but users cannot reach it. Why?"</p><p>Without a source address the firewall pings from the management interface, which can have its own route. I would repeat with ping source set to the data interface, check show routing route and show interface all for the zone and virtual router, and then test the security and NAT policy for the user traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show routing route and show interface all prove route, zone and virtual router.</li>
<li>Route lookup decides the egress zone used by NAT and security.</li>
<li>Interface management profile controls traffic to the firewall.</li>
<li>ping and traceroute need a source address to test the data plane.</li>
<li>show arp all confirms the next hop answers.</li>
</ul></div>

`,hi:`

<p><b>Kabhi policy perfect hoti hai aur sadak toot chuki hoti hai.</b> Firewall rules se decide karta hai, lekin packet ko phir bhi route, chalta link, ARP ka jawab dene waala neighbour aur return path chahiye. Yeh chapter woh commands cover karta hai jo raaste ko khud test karte hain.</p>

<h3>Analogy: gate ke peeche ki sadak</h3>
<p>Security traveller ko jaane de sakti hai, lekin gate ke aage sadak band ho ya signboard na ho to traveller kabhi nahi pahunchta. Routing signboard hai, interface sadak ki surface, ARP agle ghar ka pata jaanna, aur ping yeh dekhne ki call ki koi ghar par hai ya nahi.</p>

<h3>Routing table</h3>
<p><code>show routing route</code> virtual router ka table print karta hai. <b>Flags</b> padho: <code>A</code> active, <code>S</code> static, <code>C</code> connected, <code>H</code> host.</p>
<pre class="out">PA1&gt; show routing route
flags: A:active, ?:loose, C:connect, H:host, S:static, ~:internal, R:rip, O:ospf, B:bgp,
       Oi:ospf intra-area, Oo:ospf inter-area, O1:ospf ext-type-1, O2:ospf ext-type-2, E:ecmp, M:multicast

VIRTUAL ROUTER: default (id 1)
  ==========
destination                                 nexthop                                 metric flags      age   interface          next-AS
<span class="hl">0.0.0.0/0                                   203.0.113.1                             10     A S              ethernet1/1        </span>
10.0.1.0/24                                 10.0.1.1                                0      A C              ethernet1/2        
10.0.2.0/24                                 10.0.2.1                                0      A C              ethernet1/3        
203.0.113.0/29                              203.0.113.2                             0      A C              ethernet1/1        
total routes shown: 7</pre>
<p>Highlighted line default route hai: har unknown cheez 203.0.113.1 (ISP) ko ethernet1/1 se bhejo. 10.0.1.0/24 aur 10.0.2.0/24 ke connected routes isliye hain kyunki interfaces ke yeh addresses hain. Upar ka output trim hai (host routes hata diye gaye hain).</p>
<p>Firewall route lookup do tarah use karta hai. Pehla, security aur NAT decision ke liye <b>egress zone</b> nikalne mein. Doosra, packet forward karne mein. Route na ho to destination zone galat ya unknown hota hai, isliye sahi dikhne waali rule kabhi match nahi karti.</p>

<h3>Interfaces aur zones</h3>
<p><code>show interface all</code> hardware ports ki list deta hai, phir logical interfaces zone, virtual router aur address ke saath.</p>
<pre class="out">PA1&gt; show interface all
...
total configured logical interfaces: 3

name                id    vsys zone             forwarding               tag    address
------------------- ----- ---- ---------------- ------------------------ ------ ------------------
ethernet1/1         16    1    untrust          vr:default               0      203.0.113.2/29
ethernet1/2         17    1    trust            vr:default               0      10.0.1.1/24
ethernet1/3         18    1    dmz              vr:default               0      10.0.2.1/24</pre>
<p>Teen cheezein check karo: link up hai (hardware section mein <code>1000/full/up</code>), interface sahi zone mein hai, aur virtual router mein hai. Bina zone ka interface <code>flow_fwd_notopology</code> badhata hai. Ek interface aur uska management profile dekhne ke liye:</p>
<pre class="out">PA1&gt; show interface ethernet1/2
Name: ethernet1/2, ID: 16, 802.1q tag: 0
Operation mode: layer3
Virtual router default
Interface MTU 1500
Interface IP address: 10.0.1.1/24
<span class="hl">Interface management profile: mgmt-lan</span>
Zone: trust, virtual system: vsys1</pre>
<p>Management profile decide karta hai ki firewall is interface par ping, SSH ya HTTPS ka jawab dega ya nahi. Firewall <i>ke through</i> jaane waala traffic security rules se chalta hai; firewall interface <i>tak</i> ka traffic is profile se.</p>

<h3>ARP</h3>
<p><code>show arp all</code> woh neighbours dikhata hai jo firewall ne seekhe hain. Status <code>c</code> matlab complete. Next hop ki entry missing ya incomplete (<code>i</code>) ho to neighbour jawab nahi de raha: galat VLAN, cable, ya neighbour down.</p>
<pre class="out">PA1&gt; show arp all
total ARP entries in table :        1
interface         ip address        hw address          port              status  ttl
ethernet1/2       10.0.1.10         00:50:7f:06:6d:01   ethernet1/2       c       1800</pre>

<h3>Firewall se ping aur traceroute</h3>
<p>Yeh classic trap hai. <code>ping host 8.8.8.8</code> bina source ke chalao to firewall apna <b>management interface</b> aur management route use karta hai, data plane nahi. Lab mein management interface ke paas internet ka route nahi hai, isliye jawab bhramak hai:</p>
<pre class="out">PA1&gt; ping host 8.8.8.8 count 2
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 0 received, 100% packet loss, time 1003ms</pre>
<p>Internet theek hai; test ne galat raasta use kiya. Asli data path test karne ke liye data interface ka address source do:</p>
<pre class="out">PA1&gt; ping source 203.0.113.2 host 8.8.8.8 count 3
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=63 time=0.80 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=63 time=0.30 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=63 time=0.70 ms
--- 8.8.8.8 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss</pre>
<pre class="out">PA1&gt; traceroute source 203.0.113.2 host 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets
 1  203.0.113.1 (203.0.113.1)  0.540 ms  0.520 ms  0.530 ms
 2  8.8.8.8 (8.8.8.8)  0.750 ms  0.720 ms  0.730 ms</pre>
<p>Hop 1 ISP router hai, hop 2 destination. Hop 1 jawab na de to problem firewall aur ISP ke beech hai.</p>

<div class="eg"><p><b>Worked example.</b> DMZ ke users internet tak nahi pahunch pa rahe. Security rule aur NAT test sahi hain. show routing route mein default route nahi hai kyunki kisi ne change ke dauran delete kar di. ping source 203.0.113.2 host 8.8.8.8 fail hoti hai. Static default route 0.0.0.0/0 via 203.0.113.1 jodne se service wapas aati hai. Counters ne kuch nahi dikhaya kyunki policy involved hi nahi thi; packet ke paas route nahi tha.</p></div>

<div class="warn"><p><b>Common mistake.</b> Bina source ke ping karke nateeja nikalna "internet chal raha hai". Ping management interface se gayi. Jis interface ko test karna hai uska source address hamesha do.</p></div>
<div class="exam"><p><b>Exam trap.</b> Fark yaad rakho: interface management profile firewall tak ke traffic ko control karta hai; security policy firewall ke through ke traffic ko. Yeh bhi ki route lookup egress zone decide karta hai jo security aur NAT use karte hain.</p></div>

<div class="scn"><h4>Woh interface jisne ping ka jawab nahi diya</h4><p>Naya DMZ interface configure hua aur ek server firewall par apne gateway ko ping nahi kar pa raha tha. Security rules irrelevant thi. Har ping par flow_host_service_deny badh raha tha. Interface aisa profile use kar raha tha jo ping allow nahi karta. Use ping-enabled profile par karte hi turant fix ho gaya.</p><p><b>Lesson:</b> Firewall khud tak ka traffic security rules se control nahi hota. Management profile aur delta counters dekho.</p></div>

<div class="iv"><p class="q">"Firewall CLI se internet address ping karte ho to chalta hai, lekin users nahi pahunch paate. Kyun?"</p><p>Source address ke bina firewall management interface se ping karta hai, jiska apna route ho sakta hai. Main ping ko data interface ke source ke saath dohrata hoon, zone aur virtual router ke liye show routing route aur show interface all dekhta hoon, phir user traffic ke liye security aur NAT policy test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>show routing route aur show interface all route, zone aur virtual router saabit karte hain.</li>
<li>Route lookup egress zone decide karta hai jo NAT aur security use karte hain.</li>
<li>Interface management profile firewall tak ka traffic control karta hai.</li>
<li>ping aur traceroute ko data plane test karne ke liye source address chahiye.</li>
<li>show arp all confirm karta hai ki next hop jawab deta hai.</li>
</ul></div>

`}};export{e as default};