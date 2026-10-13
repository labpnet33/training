var e={id:`nat-route`,h:{en:`Step 2, option A: the NAT DIA route (Lab 1 walkthrough)`,hi:`Step 2, option A: NAT DIA route (Lab 1 walkthrough)`},body:{en:`
<p>NAT is ready on the transport. Now we need something that actually sends traffic to it. The simplest way is a <b>NAT DIA route</b>: one default route in the service VPN that says "for everything else, use the local internet exit". This chapter explains it and walks through the first lab, <i>Enable DIA with the NAT route</i>.</p>

<h3>Analogy: a standing instruction at the reception desk</h3>
<p>You tell the branch reception: "Any letter that is not addressed to our own offices, give it to the local courier." That single standing instruction applies to every department and every sender. It is easy to write and easy to understand, but it is blunt: you cannot say "only the guest wing". (For that you need the data policy of the next chapter.)</p>

<h3>The command</h3>
<pre class="code">E-BR1# config-transaction
E-BR1(config)# ip nat route vrf 10 0.0.0.0 0.0.0.0 global
E-BR1(config)# commit</pre>
<p>It means: in VRF 10, the default route's next hop is "the global routing table, through NAT". In SD-WAN Manager it is the service VPN's IPv4 route <code>0.0.0.0/0</code> whose next hop is <b>VPN 0</b> (the legacy template wording) or the equivalent NAT route in a configuration-group service profile.</p>

<h3>How the route behaves</h3>
<pre class="out">E-BR1# show ip route vrf 10
Codes: C - connected, L - local, m - OMP, n - NAT, Nd - NAT DIA
...
Gateway of last resort is 0.0.0.0 to network 0.0.0.0

<span class="hl">n*Nd  0.0.0.0/0 [6/0], 00:00:01, Null0</span>
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
C        10.1.10.0/24 is directly connected, GigabitEthernet3
L        10.1.10.1/32 is directly connected, GigabitEthernet3
m        10.100.0.0/24 [251/0] via 10.255.0.1, 00:00:04, Sdwan-system-intf</pre>
<ul>
<li>The route shows as <code>n*Nd</code> with <b>administrative distance 6</b>. That beats the default route learned by OMP from the data center (AD 251), so internet traffic now exits locally.</li>
<li>The OMP routes to <b>specific</b> prefixes (such as 10.100.0.0/24, the data center) still win by <b>longest prefix match</b> over 0.0.0.0/0. Site-to-site traffic therefore stays in the overlay.</li>
<li>The OMP default is not removed. It remains as a backup that becomes active if the NAT DIA route disappears (for example when the transport goes down, or when a tracker removes it).</li>
<li>The route is installed only if at least one NAT-enabled transport exists (previous chapter). If NAT is missing, nothing is installed.</li>
</ul>

<h3>Lab 1: Enable DIA with the NAT route</h3>
<p><b>Story.</b> Bharat Retail backhauls all Pune internet traffic to Mumbai, where DC-FW translates it to 203.0.113.14. Staff complain that Microsoft 365 is slow. You prove the backhaul, then enable DIA for VPN 10 on E-BR1 through GigabitEthernet1 using the NAT route. Traffic to the data center (10.100.0.0/24) must stay in the overlay.</p>

<h4>Task 1: prove the backhaul</h4>
<pre class="out">STAFF-PC&gt; traceroute 8.8.8.8
traceroute to 8.8.8.8, 30 hops max
 1  10.1.10.1      1 ms     (E-BR1 LAN)
 2  10.100.0.1     26 ms    (E-DC, across the overlay)
 3  10.100.0.2     27 ms    (DC-FW)
 4  <span class="hl">8.8.8.8</span>        28 ms

DC-FW# show ip nat translations
Pro  Inside global         Inside local        Outside local      Outside global
icmp <span class="hl">203.0.113.14</span>:1034  10.1.10.10:1034     8.8.8.8:1034       8.8.8.8:1034</pre>
<p>The hops after 10.1.10.1 reveal the data center, and the firewall shows the public address the internet sees today: <b>203.0.113.14</b>.</p>

<h4>Task 2: enable NAT on GigabitEthernet1</h4>
<p>Exactly the two NAT lines of chapter 2, then commit. Verify with <code>show ip nat statistics</code> that GigabitEthernet1 is an outside interface.</p>

<h4>Task 3: add the NAT DIA route and test</h4>
<pre class="code">E-BR1# config-transaction
E-BR1(config)# ip nat route vrf 10 0.0.0.0 0.0.0.0 global
E-BR1(config)# commit
E-BR1(config)# end
E-BR1# show ip route vrf 10

STAFF-PC&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=63 time=3.2 ms</pre>
<p>The route table now has <code>n*Nd</code>. The round trip dropped from about 28 ms to about 3 ms. The internet now sees 203.0.113.10, the Pune transport address.</p>

<h4>Task 4: prove site-to-site traffic still uses the overlay</h4>
<pre class="out">E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 10.100.0.2 protocol 1
 Next Hop: IPsec
  Source: 203.0.113.10 12346 Destination: 203.0.113.6 12346
  <span class="hl">Local Color: biz-internet Remote Color: biz-internet</span> Remote System IP: 10.255.0.1

E-BR1# show sdwan bfd sessions
SYSTEM IP    SITE ID  STATE  SRC COLOR     DST COLOR     SOURCE IP     DST PUBLIC IP  PORT   ENCAP
10.255.0.1   100      up     biz-internet  biz-internet  203.0.113.10  203.0.113.6    12346  ipsec</pre>
<p>10.100.0.2 (DC-FW) is inside the data center prefix 10.100.0.0/24, learned by OMP, so the longest match sends it into the tunnel to E-DC. The BFD session to E-DC is up.</p>

<h4>Task 5: see the translations</h4>
<pre class="out">STAFF-PC&gt; ping 8.8.8.8
E-BR1# show ip nat translations vrf 10
Pro  Inside global          Inside local        Outside local     Outside global
icmp <span class="hl">203.0.113.10</span>:19499  10.1.10.10:19499    8.8.8.8:19499     8.8.8.8:19499
Total number of translations: 1

E-BR1# show sdwan nat-dia summary
NAT DIA interfaces : GigabitEthernet1
NAT DIA routes     : vrf 10 0.0.0.0/0
DIA translations   : 1</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) <b>Wrong VRF.</b> The NAT route is per VRF: a route for VRF 20 does nothing for users in VRF 10. (2) <b>Route without NAT.</b> If no transport is NAT-enabled, nothing is installed and <code>show sdwan nat-dia summary</code> says "NAT DIA interfaces : none". (3) <b>AD 6 beats OMP 251.</b> Adding the NAT route to a site silently moves <b>all</b> of that VPN's internet traffic local, including traffic you meant to backhaul for compliance. (4) <b>No safety net.</b> Without a tracker, a dead ISP leaves the route in place and the VPN's internet is black-holed even though the OMP default would have worked.</p></div>

<div class="exam"><p><b>Exam trap.</b> The NAT DIA route has administrative distance <b>6</b> and appears as <b>n*Nd</b>; the OMP route has 251. A question may ask why internet traffic suddenly stopped using the DC: the answer is the NAT DIA route winning on AD, while 10.100.0.0/24 stays in the overlay due to longest prefix match.</p></div>

<div class="scn"><h4>Compliance traffic that left locally</h4><p>A branch engineer enabled the NAT route for VPN 10 to fix slow SaaS. A week later the compliance officer asked why payment-gateway traffic from Pune no longer appeared in the DC firewall logs. Because the route moved all of VPN 10's internet traffic local, the payment gateway was also leaving from the branch address. The team replaced the route with a selective data policy (next chapters) so only approved SaaS and guest traffic broke out.</p><p><b>Lesson:</b> the NAT route is all or nothing for a VPN. Use it when the whole VPN may break out.</p></div>

<div class="iv"><p class="q">"How does the NAT DIA route interact with an OMP default route from the data center?"</p><p>The NAT DIA route has administrative distance 6 versus 251 for OMP, so it wins for destinations that only match the default route. More specific OMP prefixes such as the data center subnet still win by longest match and use the overlay. The OMP default remains as a backup if the NAT route is removed. Mention a tracker for the case where the ISP fails while the interface stays up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ip nat route vrf N 0.0.0.0 0.0.0.0 global installs an n*Nd default route with AD 6.</li>
<li>It beats the OMP default (251), while specific OMP prefixes still use the overlay by longest match.</li>
<li>It applies to the whole VRF and needs NAT-enabled transport, or nothing is installed.</li>
<li>Verify with show ip route vrf, show ip nat translations, show sdwan nat-dia summary and service-path.</li>
<li>Before and after: backhaul seen as 203.0.113.14, DIA seen as 203.0.113.10.</li>
</ul></div>
`,hi:`
<p>Transport par NAT taiyaar hai. Ab humein aisi cheez chahiye jo traffic ko sach mein wahan bheje. Sabse seedha tareeka hai <b>NAT DIA route</b>: service VPN mein ek default route jo kehta hai "baaki sab ke liye local internet exit use karo". Yeh chapter use samjhata hai aur pehli lab, <i>NAT route se DIA enable karo</i>, walk-through karta hai.</p>

<h3>Analogy: reception desk par standing instruction</h3>
<p>Aap branch reception ko kehte ho: "Jo letter hamare apne offices ko address nahi hai, woh local courier ko de do." Yeh ek standing instruction har department aur har sender par lagti hai. Likhna aur samajhna aasaan hai, lekin yeh blunt hai: aap "sirf guest wing" nahi keh sakte. (Uske liye agle chapter ki data policy chahiye.)</p>

<h3>Command</h3>
<pre class="code">E-BR1# config-transaction
E-BR1(config)# ip nat route vrf 10 0.0.0.0 0.0.0.0 global
E-BR1(config)# commit</pre>
<p>Matlab: VRF 10 mein default route ka next hop "global routing table, NAT ke through" hai. SD-WAN Manager mein yeh service VPN ka IPv4 route <code>0.0.0.0/0</code> hai jiska next hop <b>VPN 0</b> hai (legacy template ki wording) ya configuration-group service profile mein equivalent NAT route.</p>

<h3>Route kaise behave karta hai</h3>
<pre class="out">E-BR1# show ip route vrf 10
Codes: C - connected, L - local, m - OMP, n - NAT, Nd - NAT DIA
...
Gateway of last resort is 0.0.0.0 to network 0.0.0.0

<span class="hl">n*Nd  0.0.0.0/0 [6/0], 00:00:01, Null0</span>
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
C        10.1.10.0/24 is directly connected, GigabitEthernet3
L        10.1.10.1/32 is directly connected, GigabitEthernet3
m        10.100.0.0/24 [251/0] via 10.255.0.1, 00:00:04, Sdwan-system-intf</pre>
<ul>
<li>Route <code>n*Nd</code> ke roop mein dikhta hai aur uski <b>administrative distance 6</b> hai. Yeh data center se OMP se seekhe default route (AD 251) ko harata hai, isliye internet traffic ab locally nikalta hai.</li>
<li><b>Specific</b> prefixes ke OMP routes (jaise 10.100.0.0/24, data center) 0.0.0.0/0 par <b>longest prefix match</b> se ab bhi jeette hain. Isliye site-to-site traffic overlay mein hi rehta hai.</li>
<li>OMP default hataya nahi jaata. Woh backup ke roop mein rehta hai jo tab active hota hai jab NAT DIA route gayab ho (jaise transport down ho, ya tracker use hata de).</li>
<li>Route tabhi install hota hai jab kam se kam ek NAT-enabled transport ho (pichhla chapter). NAT missing ho to kuch install nahi hota.</li>
</ul>

<h3>Lab 1: NAT route se DIA enable karo</h3>
<p><b>Story.</b> Bharat Retail Pune ka saara internet traffic Mumbai backhaul karta hai, jahan DC-FW use 203.0.113.14 mein translate karta hai. Staff ko Microsoft 365 slow lagta hai. Aap backhaul saabit karte ho, phir NAT route se GigabitEthernet1 ke through E-BR1 par VPN 10 ke liye DIA enable karte ho. Data center (10.100.0.0/24) ka traffic overlay mein hi rehna chahiye.</p>

<h4>Task 1: backhaul saabit karo</h4>
<pre class="out">STAFF-PC&gt; traceroute 8.8.8.8
traceroute to 8.8.8.8, 30 hops max
 1  10.1.10.1      1 ms     (E-BR1 LAN)
 2  10.100.0.1     26 ms    (E-DC, overlay ke across)
 3  10.100.0.2     27 ms    (DC-FW)
 4  <span class="hl">8.8.8.8</span>        28 ms

DC-FW# show ip nat translations
Pro  Inside global         Inside local        Outside local      Outside global
icmp <span class="hl">203.0.113.14</span>:1034  10.1.10.10:1034     8.8.8.8:1034       8.8.8.8:1034</pre>
<p>10.1.10.1 ke baad ke hops data center dikhate hain, aur firewall woh public address dikhata hai jo internet ko aaj dikhta hai: <b>203.0.113.14</b>.</p>

<h4>Task 2: GigabitEthernet1 par NAT enable karo</h4>
<p>Chapter 2 ki wahi do NAT lines, phir commit. <code>show ip nat statistics</code> se verify karo ki GigabitEthernet1 outside interface hai.</p>

<h4>Task 3: NAT DIA route jodo aur test karo</h4>
<pre class="code">E-BR1# config-transaction
E-BR1(config)# ip nat route vrf 10 0.0.0.0 0.0.0.0 global
E-BR1(config)# commit
E-BR1(config)# end
E-BR1# show ip route vrf 10

STAFF-PC&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=63 time=3.2 ms</pre>
<p>Route table mein ab <code>n*Nd</code> hai. Round trip lagbhag 28 ms se ghat kar lagbhag 3 ms ho gaya. Internet ko ab 203.0.113.10 dikhta hai, yaani Pune transport address.</p>

<h4>Task 4: saabit karo ki site-to-site traffic abhi bhi overlay use karta hai</h4>
<pre class="out">E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 10.100.0.2 protocol 1
 Next Hop: IPsec
  Source: 203.0.113.10 12346 Destination: 203.0.113.6 12346
  <span class="hl">Local Color: biz-internet Remote Color: biz-internet</span> Remote System IP: 10.255.0.1

E-BR1# show sdwan bfd sessions
SYSTEM IP    SITE ID  STATE  SRC COLOR     DST COLOR     SOURCE IP     DST PUBLIC IP  PORT   ENCAP
10.255.0.1   100      up     biz-internet  biz-internet  203.0.113.10  203.0.113.6    12346  ipsec</pre>
<p>10.100.0.2 (DC-FW) data center prefix 10.100.0.0/24 ke andar hai, jo OMP se seekha gaya hai, isliye longest match use E-DC ke tunnel mein bhejta hai. E-DC ka BFD session up hai.</p>

<h4>Task 5: translations dekho</h4>
<pre class="out">STAFF-PC&gt; ping 8.8.8.8
E-BR1# show ip nat translations vrf 10
Pro  Inside global          Inside local        Outside local     Outside global
icmp <span class="hl">203.0.113.10</span>:19499  10.1.10.10:19499    8.8.8.8:19499     8.8.8.8:19499
Total number of translations: 1

E-BR1# show sdwan nat-dia summary
NAT DIA interfaces : GigabitEthernet1
NAT DIA routes     : vrf 10 0.0.0.0/0
DIA translations   : 1</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) <b>Galat VRF.</b> NAT route per VRF hota hai: VRF 20 ka route VRF 10 ke users ke liye kuch nahi karta. (2) <b>NAT ke bina route.</b> Agar koi transport NAT-enabled nahi hai to kuch install nahi hota aur <code>show sdwan nat-dia summary</code> "NAT DIA interfaces : none" kehta hai. (3) <b>AD 6 OMP 251 ko harata hai.</b> Site par NAT route jodne se us VPN ka <b>saara</b> internet traffic chupchaap local ho jaata hai, wo bhi jo aap compliance ke liye backhaul karna chahte the. (4) <b>Safety net nahi.</b> Tracker ke bina, ISP dead hone par route jagah par rehta hai aur VPN ka internet black-hole ho jaata hai jabki OMP default chal jaata.</p></div>

<div class="exam"><p><b>Exam trap.</b> NAT DIA route ki administrative distance <b>6</b> hai aur woh <b>n*Nd</b> dikhta hai; OMP route ki 251. Sawaal pooch sakta hai ki internet traffic achanak DC use karna kyun band ho gaya: jawab hai NAT DIA route AD par jeet raha hai, jabki 10.100.0.0/24 longest prefix match ki wajah se overlay mein rehta hai.</p></div>

<div class="scn"><h4>Compliance traffic jo locally nikal gaya</h4><p>Ek branch engineer ne slow SaaS theek karne ke liye VPN 10 ke liye NAT route enable kiya. Ek hafte baad compliance officer ne poocha ki Pune ka payment-gateway traffic DC firewall logs mein kyun nahi dikhta. Route ne VPN 10 ka saara internet traffic local kar diya tha, isliye payment gateway bhi branch address se nikal raha tha. Team ne route ko selective data policy (agle chapters) se badal diya taaki sirf approved SaaS aur guest traffic break out ho.</p><p><b>Lesson:</b> NAT route ek VPN ke liye all-or-nothing hai. Tab use karo jab poora VPN break out kar sakta ho.</p></div>

<div class="iv"><p class="q">"NAT DIA route data center ke OMP default route ke saath kaise interact karta hai?"</p><p>NAT DIA route ki administrative distance 6 hai jabki OMP ki 251, isliye jo destinations sirf default route se match karte hain unke liye woh jeetta hai. Zyada specific OMP prefixes jaise data center subnet longest match se ab bhi jeette hain aur overlay use karte hain. NAT route hatne par OMP default backup ke roop mein rehta hai. Tracker ka zikr karo us case ke liye jahan interface up rehte hue ISP fail ho jaaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ip nat route vrf N 0.0.0.0 0.0.0.0 global AD 6 ka n*Nd default route install karta hai.</li>
<li>Yeh OMP default (251) ko harata hai, jabki specific OMP prefixes longest match se overlay use karte hain.</li>
<li>Yeh poore VRF par lagta hai aur NAT-enabled transport chahiye, warna kuch install nahi hota.</li>
<li>show ip route vrf, show ip nat translations, show sdwan nat-dia summary aur service-path se verify karo.</li>
<li>Pehle aur baad: backhaul 203.0.113.14 dikhta hai, DIA 203.0.113.10 dikhta hai.</li>
</ul></div>
`}};export{e as default};