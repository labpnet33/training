var e={id:`pbr-config`,h:{en:`Building PBR in the lab: guest traffic via ISP2`,hi:`Lab mein PBR banana: guest traffic ISP2 se`},body:{en:`
<p>Before you change anything on a production router, you take a "before" photo. A doctor measures blood pressure before giving medicine, so she can prove the medicine worked. In networking, the "before" photo is a traceroute and a few show commands. This chapter builds the lab policy in the same order you will use at work: observe, select, decide, apply, prove.</p>

<h3>Step 0: observe the default behaviour</h3>
<p>EDGE has one static default route toward ISP1 (10.0.1.1). A trace from PC-GUEST to the web server 198.51.100.10 therefore goes through ISP1:</p>
<pre class="out">PC-GUEST&gt; trace 198.51.100.10
trace to 198.51.100.10, 8 hops max, press Ctrl+C to stop
 1   192.168.20.1   0.912 ms  0.804 ms  0.851 ms
 <span class="hl">2   10.0.1.1   1.733 ms  1.601 ms  1.690 ms</span>
 3   100.64.10.2   2.402 ms  2.215 ms  2.318 ms
 4   *198.51.100.10   2.877 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Hop 2 is ISP1. Write it down; you will compare later.</p>

<h3>Step 1: select the traffic with an ACL</h3>
<pre class="code"><span class="c">! Select every packet sourced from the guest subnet</span>
ip access-list standard GUEST-NET
 permit 192.168.20.0 0.0.0.255</pre>
<p>A standard ACL is enough because the business rule is "everything from guests". The ACL does not permit or block traffic here; it only answers "is this packet in scope of the policy?"</p>

<h3>Step 2: decide with a route map</h3>
<pre class="code"><span class="c">! Matched packets use ISP2 as the next hop</span>
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-NET
 set ip next-hop 10.0.2.1</pre>
<p>10.0.2.1 is ISP2's address on the directly connected /30 of Gi0/1. The next hop in <code>set ip next-hop</code> must be <b>directly connected</b>. If you typed an address two hops away, such as 100.64.20.2, PBR would ignore it and route normally (the <code>recursive</code> keyword changes this; chapter 4).</p>

<h3>Step 3: apply it where guest packets enter</h3>
<pre class="code">interface GigabitEthernet0/3
 description GUEST-WIFI
 ip policy route-map GUEST-VIA-ISP2</pre>
<p>Gi0/3 faces the guest LAN, so every guest packet enters EDGE there. One interface can carry only one <code>ip policy</code> route map; putting a second one replaces the first. If you need several rules, add more sequences to the same route map.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Packet path before and after PBR">
<rect x="20" y="80" width="110" height="44" rx="8" fill="#fde68a"/><text x="75" y="107" text-anchor="middle" class="svg-ink" font-size="13">PC-GUEST</text>
<rect x="190" y="80" width="110" height="44" rx="8" fill="#bae6fd"/><text x="245" y="107" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text>
<rect x="370" y="20" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="420" y="45" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="370" y="144" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="420" y="169" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<rect x="530" y="80" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="577" y="107" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<line x1="130" y1="102" x2="190" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="92" x2="370" y2="40" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="300" y="50" class="svg-muted" font-size="12">before</text>
<line x1="300" y1="112" x2="370" y2="164" stroke="#64748b" stroke-width="3"/><text x="300" y="170" class="svg-accent" font-size="12">after PBR</text>
<line x1="470" y1="40" x2="540" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="470" y1="164" x2="540" y2="124" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">Guest packets used ISP1 before the policy (dashed) and ISP2 after it (solid). Staff packets are unchanged.</p></div>

<h3>Step 4: prove it</h3>
<pre class="out">PC-GUEST&gt; trace 198.51.100.10
 1   192.168.20.1   0.901 ms  0.822 ms  0.843 ms
 <span class="hl">2   10.0.2.1   1.814 ms  1.622 ms  1.705 ms</span>
 3   100.64.20.2   2.391 ms  2.207 ms  2.330 ms
 4   *198.51.100.10   2.902 ms (ICMP type:3, code:3, Destination port unreachable)

EDGE# show ip policy
Interface      Route map
<span class="hl">Gi0/3          GUEST-VIA-ISP2</span>

EDGE# show route-map GUEST-VIA-ISP2
route-map GUEST-VIA-ISP2, permit, sequence 10
  Match clauses:
    ip address (access-lists): GUEST-NET
  Set clauses:
    ip next-hop 10.0.2.1
  Nexthop tracking current: 10.0.2.1
  <span class="hl">Policy routing matches: 42 packets, 3360 bytes</span>

EDGE# show access-lists GUEST-NET
Standard IP access list GUEST-NET
    10 permit 192.168.20.0, wildcard bits 0.0.0.255 (42 matches)</pre>
<p>Hop 2 is now ISP2, <code>show ip policy</code> confirms the interface binding, and the policy-routing counters are above zero. Finally, trace from PC-STAFF: hop 2 must still be 10.0.1.1, because staff packets enter on Gi0/2, which has no policy.</p>

<h3>Variations you should be able to write</h3>
<pre class="code"><span class="c">! Only guest web traffic to ISP2; other guest traffic follows the routing table</span>
ip access-list extended GUEST-WEB
 permit tcp 192.168.20.0 0.0.0.255 any eq www
 permit tcp 192.168.20.0 0.0.0.255 any eq 443
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-WEB
 set ip next-hop 10.0.2.1
<span class="c">! Small packets (under 400 bytes) from staff to the low-latency link</span>
route-map STAFF-SPLIT permit 10
 match ip address STAFF-NET
 match length 0 400
 set ip next-hop 10.0.1.1
<span class="c">! IPv6 uses the same idea with its own keywords</span>
route-map GUEST6 permit 10
 match ipv6 address GUEST6-ACL
 set ipv6 next-hop 2001:db8:2::1
interface GigabitEthernet0/3
 ipv6 policy route-map GUEST6</pre>

<div class="eg"><p><b>Worked example.</b> After an hour, <code>show route-map</code> reports 1,250,000 packets and 1,012,500,000 bytes for sequence 10. Average packet size = 1,012,500,000 / 1,250,000 = 810 bytes, which is typical for mixed web browsing. If the counter had stayed at 0 while guests were browsing, the suspects would be the interface binding, the ACL (source vs destination) or the route map name spelling.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Referencing a route map name that does not exist or is misspelled: IOS accepts <code>ip policy route-map GUEST-VIA-ISP-2</code> without complaint, and nothing is policy-routed. (2) Testing with a ping from EDGE itself: router-originated packets are not policy-routed without a local policy. Always test from a host behind the ingress interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show ip policy</code> tells you only which interface uses which route map. The packet counters live in <code>show route-map</code>. Questions like "which command shows how many packets were policy-routed" want <code>show route-map</code>.</p></div>

<div class="scn"><h4>Zero matches on a busy Monday</h4><p>A hotel chain rolled out a guest PBR template to 40 branches. At one branch guests still used the business link. <code>show ip policy</code> listed the correct interface, but <code>show route-map</code> showed 0 matches. <code>show access-lists</code> revealed the branch used 192.168.30.0/24 for guests, while the template ACL still said 192.168.20.0. The ACL was updated to the local subnet and matches started immediately.</p><p><b>Lesson:</b> when counters stay at zero, the ACL does not describe the packets that really arrive. Compare it with the real source addresses.</p></div>

<div class="iv"><p class="q">"Walk me through configuring PBR to send one subnet to a second ISP."</p><p>Strong answer: take a baseline traceroute; create an ACL selecting the subnet as source; create a route-map permit sequence with <code>match ip address</code> and <code>set ip next-hop</code> pointing to the directly connected ISP2 address; apply <code>ip policy route-map</code> on the interface where that subnet's packets enter; verify with a host traceroute, <code>show ip policy</code> and the counters in <code>show route-map</code>, and confirm other subnets are unchanged. Mention tracking and return-path symmetry as production extras.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order of work: baseline trace, ACL, route map, <code>ip policy</code> on the ingress interface, verify.</li>
<li>The <code>set ip next-hop</code> address must be directly connected unless you use <code>recursive</code>.</li>
<li>One route map per interface; add sequences for more rules.</li>
<li>Counters: <code>show route-map</code>; binding: <code>show ip policy</code>; ACL hits: <code>show access-lists</code>.</li>
<li>Test from a host, not from the router, and check that unmatched traffic is unchanged.</li>
</ul></div>
`,hi:`
<p>Production router par kuch bhi badalne se pehle aap ek "before" photo lete ho. Doctor dawai dene se pehle blood pressure naapti hai, taaki saabit kar sake ki dawai ne kaam kiya. Networking mein "before" photo ek traceroute aur kuch show commands hain. Yeh chapter lab policy ko usi order mein banata hai jo aap kaam par use karoge: observe, select, decide, apply, prove.</p>

<h3>Step 0: default behaviour dekho</h3>
<p>EDGE par ISP1 (10.0.1.1) ki taraf ek static default route hai. Isliye PC-GUEST se web server 198.51.100.10 tak ka trace ISP1 se jaata hai:</p>
<pre class="out">PC-GUEST&gt; trace 198.51.100.10
trace to 198.51.100.10, 8 hops max, press Ctrl+C to stop
 1   192.168.20.1   0.912 ms  0.804 ms  0.851 ms
 <span class="hl">2   10.0.1.1   1.733 ms  1.601 ms  1.690 ms</span>
 3   100.64.10.2   2.402 ms  2.215 ms  2.318 ms
 4   *198.51.100.10   2.877 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Hop 2 ISP1 hai. Ise likh lo; baad mein compare karoge.</p>

<h3>Step 1: ACL se traffic select karo</h3>
<pre class="code"><span class="c">! Guest subnet se aane wala har packet select karo</span>
ip access-list standard GUEST-NET
 permit 192.168.20.0 0.0.0.255</pre>
<p>Standard ACL kaafi hai kyunki business rule hai "guests ka sab kuch". Yahan ACL traffic ko permit ya block nahi karta; sirf yeh batata hai "kya yeh packet policy ke scope mein hai?"</p>

<h3>Step 2: route map se decide karo</h3>
<pre class="code"><span class="c">! Match hue packets ISP2 ko next hop ki tarah use karte hain</span>
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-NET
 set ip next-hop 10.0.2.1</pre>
<p>10.0.2.1 Gi0/1 ke directly connected /30 par ISP2 ka address hai. <code>set ip next-hop</code> ka next hop <b>directly connected</b> hona chahiye. Agar aap do hop door ka address likhte, jaise 100.64.20.2, to PBR use ignore karke normal route karta (<code>recursive</code> keyword ise badalta hai; chapter 4).</p>

<h3>Step 3: wahan lagao jahan guest packets aate hain</h3>
<pre class="code">interface GigabitEthernet0/3
 description GUEST-WIFI
 ip policy route-map GUEST-VIA-ISP2</pre>
<p>Gi0/3 guest LAN ki taraf hai, isliye har guest packet EDGE mein wahin se aata hai. Ek interface par sirf ek <code>ip policy</code> route map ho sakta hai; doosra lagane se pehla replace ho jaata hai. Agar kai rules chahiye, to usi route map mein aur sequences jodo.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Packet path before and after PBR">
<rect x="20" y="80" width="110" height="44" rx="8" fill="#fde68a"/><text x="75" y="107" text-anchor="middle" class="svg-ink" font-size="13">PC-GUEST</text>
<rect x="190" y="80" width="110" height="44" rx="8" fill="#bae6fd"/><text x="245" y="107" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text>
<rect x="370" y="20" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="420" y="45" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<rect x="370" y="144" width="100" height="40" rx="8" fill="#ddd6fe"/><text x="420" y="169" text-anchor="middle" class="svg-ink" font-size="13">ISP2</text>
<rect x="530" y="80" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="577" y="107" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<line x1="130" y1="102" x2="190" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="92" x2="370" y2="40" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="300" y="50" class="svg-muted" font-size="12">pehle</text>
<line x1="300" y1="112" x2="370" y2="164" stroke="#64748b" stroke-width="3"/><text x="300" y="170" class="svg-accent" font-size="12">PBR ke baad</text>
<line x1="470" y1="40" x2="540" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="470" y1="164" x2="540" y2="124" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">Policy se pehle guest packets ISP1 use karte the (dashed) aur baad mein ISP2 (solid). Staff packets nahi badle.</p></div>

<h3>Step 4: saabit karo</h3>
<pre class="out">PC-GUEST&gt; trace 198.51.100.10
 1   192.168.20.1   0.901 ms  0.822 ms  0.843 ms
 <span class="hl">2   10.0.2.1   1.814 ms  1.622 ms  1.705 ms</span>
 3   100.64.20.2   2.391 ms  2.207 ms  2.330 ms
 4   *198.51.100.10   2.902 ms (ICMP type:3, code:3, Destination port unreachable)

EDGE# show ip policy
Interface      Route map
<span class="hl">Gi0/3          GUEST-VIA-ISP2</span>

EDGE# show route-map GUEST-VIA-ISP2
route-map GUEST-VIA-ISP2, permit, sequence 10
  Match clauses:
    ip address (access-lists): GUEST-NET
  Set clauses:
    ip next-hop 10.0.2.1
  Nexthop tracking current: 10.0.2.1
  <span class="hl">Policy routing matches: 42 packets, 3360 bytes</span>

EDGE# show access-lists GUEST-NET
Standard IP access list GUEST-NET
    10 permit 192.168.20.0, wildcard bits 0.0.0.255 (42 matches)</pre>
<p>Hop 2 ab ISP2 hai, <code>show ip policy</code> interface binding confirm karta hai, aur policy-routing counters zero se upar hain. Aakhir mein PC-STAFF se trace karo: hop 2 abhi bhi 10.0.1.1 hona chahiye, kyunki staff packets Gi0/2 par aate hain, jis par koi policy nahi hai.</p>

<h3>Variations jo aapko likhne aane chahiye</h3>
<pre class="code"><span class="c">! Sirf guest web traffic ISP2 par; baaki guest traffic routing table follow kare</span>
ip access-list extended GUEST-WEB
 permit tcp 192.168.20.0 0.0.0.255 any eq www
 permit tcp 192.168.20.0 0.0.0.255 any eq 443
route-map GUEST-VIA-ISP2 permit 10
 match ip address GUEST-WEB
 set ip next-hop 10.0.2.1
<span class="c">! Staff ke chhote packets (400 bytes se kam) kam-latency link par</span>
route-map STAFF-SPLIT permit 10
 match ip address STAFF-NET
 match length 0 400
 set ip next-hop 10.0.1.1
<span class="c">! IPv6 wahi idea apne keywords ke saath use karta hai</span>
route-map GUEST6 permit 10
 match ipv6 address GUEST6-ACL
 set ipv6 next-hop 2001:db8:2::1
interface GigabitEthernet0/3
 ipv6 policy route-map GUEST6</pre>

<div class="eg"><p><b>Worked example.</b> Ek ghante baad <code>show route-map</code> sequence 10 ke liye 1,250,000 packets aur 1,012,500,000 bytes report karta hai. Average packet size = 1,012,500,000 / 1,250,000 = 810 bytes, jo mixed web browsing ke liye typical hai. Agar guests browse kar rahe hote aur counter 0 par rehta, to suspects hote interface binding, ACL (source vs destination) ya route map naam ki spelling.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Aise route map naam ko reference karna jo exist nahi karta ya galat likha hai: IOS <code>ip policy route-map GUEST-VIA-ISP-2</code> bina shikayat accept kar leta hai, aur kuch bhi policy-route nahi hota. (2) EDGE se hi ping karke test karna: local policy ke bina router ke apne packets policy-route nahi hote. Hamesha ingress interface ke peeche wale host se test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show ip policy</code> sirf batata hai kaunsa interface kaunsa route map use karta hai. Packet counters <code>show route-map</code> mein hote hain. "Kaunsa command dikhata hai kitne packets policy-route hue" jaise sawaal <code>show route-map</code> maangte hain.</p></div>

<div class="scn"><h4>Busy Monday par zero matches</h4><p>Ek hotel chain ne 40 branches par guest PBR template roll out kiya. Ek branch par guests abhi bhi business link use kar rahe the. <code>show ip policy</code> sahi interface list kar raha tha, lekin <code>show route-map</code> 0 matches dikha raha tha. <code>show access-lists</code> se pata chala ki us branch mein guests ke liye 192.168.30.0/24 tha, jabki template ACL abhi bhi 192.168.20.0 keh raha tha. ACL ko local subnet par update kiya gaya aur matches turant shuru ho gaye.</p><p><b>Seekh:</b> jab counters zero par rahein, to ACL un packets ko describe nahi kar raha jo sach mein aate hain. Use asli source addresses se compare karo.</p></div>

<div class="iv"><p class="q">"Ek subnet ko doosre ISP par bhejne ke liye PBR configure karna samjhao."</p><p>Strong answer: baseline traceroute lo; ek ACL banao jo subnet ko source ki tarah select kare; ek route-map permit sequence banao jismein <code>match ip address</code> aur directly connected ISP2 address ki taraf <code>set ip next-hop</code> ho; <code>ip policy route-map</code> us interface par lagao jahan us subnet ke packets aate hain; host traceroute, <code>show ip policy</code> aur <code>show route-map</code> ke counters se verify karo, aur confirm karo ki baaki subnets nahi badle. Production extras ki tarah tracking aur return-path symmetry ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kaam ka order: baseline trace, ACL, route map, ingress interface par <code>ip policy</code>, verify.</li>
<li><code>set ip next-hop</code> address directly connected hona chahiye jab tak aap <code>recursive</code> use na karo.</li>
<li>Ek interface par ek route map; zyada rules ke liye sequences jodo.</li>
<li>Counters: <code>show route-map</code>; binding: <code>show ip policy</code>; ACL hits: <code>show access-lists</code>.</li>
<li>Router se nahi, host se test karo, aur check karo ki unmatched traffic nahi badla.</li>
</ul></div>
`}};export{e as default};