var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the PBR lab, a VRF ticket and a BFD ticket`,hi:`Troubleshooting workflow: PBR lab, ek VRF ticket aur ek BFD ticket`},body:{en:`
<p>A good mechanic does not replace parts at random. He listens, checks the fuel, then the spark, then the timing, in the same order every time, and he stops the moment he finds the fault. This chapter gives you that fixed order for PBR, then applies the structured method from the <i>Structured troubleshooting</i> module to a VRF ticket and a BFD ticket.</p>

<h3>The PBR checklist (follow the packet)</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="PBR troubleshooting order">
<rect x="5" y="40" width="96" height="60" rx="8" fill="#fde68a"/><text x="53" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Host</text><text x="53" y="84" text-anchor="middle" class="svg-muted" font-size="12">trace</text>
<rect x="111" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="159" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Binding</text><text x="159" y="84" text-anchor="middle" class="svg-muted" font-size="12">ingress?</text>
<rect x="217" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="265" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Match</text><text x="265" y="84" text-anchor="middle" class="svg-muted" font-size="12">ACL hits</text>
<rect x="323" y="40" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="371" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Set</text><text x="371" y="84" text-anchor="middle" class="svg-muted" font-size="12">next hop ok?</text>
<rect x="429" y="40" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="477" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Debug</text><text x="477" y="84" text-anchor="middle" class="svg-muted" font-size="12">per packet</text>
<rect x="535" y="40" width="100" height="60" rx="8" fill="#fed7aa"/><text x="585" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Return</text><text x="585" y="84" text-anchor="middle" class="svg-muted" font-size="12">path, NAT</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Stop at the first step that is wrong, fix it, then re-test from the host</text>
</svg><p class="cap">The PBR troubleshooting order used in the lab and in every ticket below.</p></div>
<ol>
<li><b>Host view.</b> Trace from a host behind the ingress interface, never from the router.</li>
<li><b>Binding.</b> <code>show ip policy</code>: is the route map on the interface where the packets <b>enter</b>? Does <code>show route-map NAME</code> return anything (a misspelled name returns nothing)?</li>
<li><b>Match.</b> <code>show access-lists</code>: are the ACL hit counters climbing? Is the steered subnet written as the source?</li>
<li><b>Set.</b> Is the next hop directly connected (<code>show ip route 10.0.2.1</code> says "directly connected")? Is its ARP entry present? If tracked, is the track Up?</li>
<li><b>Debug.</b> <code>debug ip policy</code> limited by an ACL: "policy match" and "policy routed", or "rejected(no match) - normal forwarding".</li>
<li><b>Return path.</b> Does the reply come back through the same provider? Check NAT, firewalls and provider anti-spoofing.</li>
</ol>

<h3>Walking the lab: guest traffic via ISP2</h3>
<p><b>Task 1, observe.</b> <code>trace 198.51.100.10</code> from PC-GUEST shows hop 2 = 10.0.1.1 (ISP1). This is your baseline and your definition of the problem.</p>
<p><b>Task 2, select.</b> <code>ip access-list standard GUEST-NET</code>, <code>permit 192.168.20.0 0.0.0.255</code>. Staff 192.168.10.10 must not match; guests must.</p>
<p><b>Task 3, decide.</b> <code>route-map GUEST-VIA-ISP2 permit 10</code>, <code>match ip address GUEST-NET</code>, <code>set ip next-hop 10.0.2.1</code>. 10.0.2.1 is on EDGE's connected /30 on Gi0/1.</p>
<p><b>Task 4, apply.</b> <code>interface GigabitEthernet0/3</code>, <code>ip policy route-map GUEST-VIA-ISP2</code>. Guests now cross ISP2; staff still cross ISP1; both still reach SRV.</p>
<p><b>Task 5, prove.</b> Trace from both PCs, then <code>show route-map GUEST-VIA-ISP2</code> (policy routing matches above zero) and <code>show ip policy</code>.</p>

<h3>The three classic PBR pitfalls, with evidence</h3>
<p><b>1. ACL direction.</b> Someone writes <code>permit ip any 192.168.20.0 0.0.0.255</code>:</p>
<pre class="out">EDGE# show access-lists GUEST-NET
Extended IP access list GUEST-NET
    <span class="hl">10 permit ip any 192.168.20.0 0.0.0.255</span>
EDGE# show route-map GUEST-VIA-ISP2 | include matches
  <span class="hl">Policy routing matches: 0 packets, 0 bytes</span></pre>
<p>Zero hits: the ACL describes return traffic, which never arrives on Gi0/3. Fix: guest subnet as source.</p>
<p><b>2. Next hop not connected.</b> Someone sets <code>set ip next-hop 100.64.20.1</code> (ISP2's far side):</p>
<pre class="out">EDGE# show ip route 100.64.20.1
% Network not in table
EDGE# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0, supernet
  Known via "static", distance 1, metric 0, candidate default path
  Routing Descriptor Blocks:
  <span class="hl">* 10.0.1.1</span></pre>
<p>The next hop is not on a connected subnet, so PBR ignores it and guests follow the default route to ISP1. The match counters can still climb, because packets did match; only the traceroute tells the truth. Fix: use 10.0.2.1, or add <code>recursive</code> deliberately.</p>
<p><b>3. Return traffic asymmetry.</b> In production EDGE would NAT guests. If NAT always translates to the ISP1 address, guest packets leave via ISP2 with an ISP1 source address. ISP2's anti-spoofing filters drop them, or replies come back through ISP1 and a stateful firewall discards them. Symptom: outbound counters rise, pages never load. Fix: NAT with a route map that matches the exit interface, so traffic leaving Gi0/1 uses ISP2's address. In the lab, CORE routes 192.168.20.0/24 back via ISP2, so the path is symmetric.</p>

<h3>Ticket: VRF-lite, guests offline after migration</h3>
<p><b>Symptom.</b> After moving guests into VRF GUEST, no guest reaches the internet. Staff are fine.</p>
<pre class="out">EDGE# show ip vrf interfaces GUEST
Interface              IP-Address      VRF                              Protocol
<span class="hl">Gi0/3                  192.168.20.1    GUEST                            up</span>
EDGE# show ip route vrf GUEST
Routing Table: GUEST
<span class="hl">Gateway of last resort is not set</span>
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, GigabitEthernet0/3
L        192.168.20.1/32 is directly connected, GigabitEthernet0/3</pre>
<p><b>Analysis.</b> Only Gi0/3 is in GUEST. Gi0/1 (toward ISP2) is still global, so 10.0.2.1 is unknown inside GUEST and <code>ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1</code> cannot install. <b>Fix.</b> Put Gi0/1 into VRF GUEST and re-enter its address, or use <code>ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1 global</code> plus a return route. <b>Verify</b> with <code>ping vrf GUEST 198.51.100.10</code> and a host trace.</p>

<h3>Ticket: BFD, failover still takes 40 seconds</h3>
<p><b>Symptom.</b> BFD and <code>bfd all-interfaces</code> were added under OSPF on EDGE, but a failure test on the ISP1 link still took 40 seconds.</p>
<pre class="out">EDGE# show bfd neighbors
IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
<span class="hl">10.0.1.1                                 1/0          Down      Down      Gi0/0</span></pre>
<p><b>Analysis.</b> A remote discriminator of 0 means EDGE has never heard from ISP1. Either ISP1 has no BFD on its interface or client, or something drops UDP 3784. <code>show running-config interface</code> on ISP1 shows no <code>bfd interval</code>. <b>Fix.</b> Configure matching BFD timers on ISP1 and register OSPF there. <b>Verify</b> that the session is Up/Up and that <b>Registered protocols</b> lists OSPF; re-run the failure test.</p>

<div class="eg"><p><b>Worked example.</b> After the fix, EDGE and ISP1 both use 50 ms x 3 with echo mode. The failure test cuts forwarding at 14:02:10.000. BFD declares the session down about 150 ms later, OSPF drops the adjacency at once, SPF runs, and traffic moves to the backup path roughly 200 to 300 ms after the failure, compared with 40 seconds before.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing several things at once during an outage (new ACL, new next hop and a new interface binding). When it starts working you do not know which change fixed it, and when it breaks again you do not know which one to undo. One change, one test.</p></div>

<div class="exam"><p><b>Exam trap.</b> In PBR tickets, a counter of zero points at binding or ACL; counters rising but traffic on the old path point at the set clause (next hop unusable or track down). In BFD tickets, RD = 0 points at the remote end.</p></div>

<div class="scn"><h4>The PBR that worked only in the morning</h4><p>An office reported that guest Wi-Fi was fast in the morning and dead in the afternoon. The engineer followed the checklist: binding correct, ACL hits rising, next hop connected, track Up. The return path was the fault: the afternoon load pushed traffic onto a second firewall cluster that only knew the ISP1 NAT pool. The fix was a consistent NAT per exit interface on both clusters.</p><p><b>Lesson:</b> the last step, the return path, is where the hard PBR faults hide.</p></div>

<div class="iv"><p class="q">"PBR is configured but traffic still takes the normal path. How do you troubleshoot?"</p><p>Strong answer: trace from a host; check <code>show ip policy</code> for the right ingress interface; check the route map exists and its counters; check ACL hits and that the source is correct; check the next hop is directly connected, resolved and, if tracked, Up; use an ACL-limited <code>debug ip policy</code>; finally check the return path, NAT and firewalls. Name each command and what output you expect.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PBR order: host trace, binding, ACL match, set/next hop, debug, return path.</li>
<li>Zero counters: binding or ACL. Rising counters but old path: next hop unusable or track down.</li>
<li>VRF faults: check which interfaces are really in the VRF and look with the <code>vrf</code> keyword.</li>
<li>BFD faults: RD = 0 or Down/Down means the remote side never answered; check its config and CoPP.</li>
<li>One change at a time, and re-test from a real host.</li>
</ul></div>
`,hi:`
<p>Achha mechanic parts randomly nahi badalta. Woh sunta hai, fuel check karta hai, phir spark, phir timing, har baar isi order mein, aur fault milte hi ruk jaata hai. Yeh chapter aapko PBR ke liye wahi fixed order deta hai, phir <i>Structured troubleshooting</i> module ka structured method ek VRF ticket aur ek BFD ticket par lagata hai.</p>

<h3>PBR checklist (packet ko follow karo)</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="PBR troubleshooting order">
<rect x="5" y="40" width="96" height="60" rx="8" fill="#fde68a"/><text x="53" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Host</text><text x="53" y="84" text-anchor="middle" class="svg-muted" font-size="12">trace</text>
<rect x="111" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="159" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Binding</text><text x="159" y="84" text-anchor="middle" class="svg-muted" font-size="12">ingress?</text>
<rect x="217" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="265" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Match</text><text x="265" y="84" text-anchor="middle" class="svg-muted" font-size="12">ACL hits</text>
<rect x="323" y="40" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="371" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Set</text><text x="371" y="84" text-anchor="middle" class="svg-muted" font-size="12">next hop theek?</text>
<rect x="429" y="40" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="477" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Debug</text><text x="477" y="84" text-anchor="middle" class="svg-muted" font-size="12">har packet</text>
<rect x="535" y="40" width="100" height="60" rx="8" fill="#fed7aa"/><text x="585" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Return</text><text x="585" y="84" text-anchor="middle" class="svg-muted" font-size="12">path, NAT</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">Pehle galat step par ruko, fix karo, phir host se dobara test karo</text>
</svg><p class="cap">Lab mein aur neeche ke har ticket mein use hone wala PBR troubleshooting order.</p></div>
<ol>
<li><b>Host view.</b> Ingress interface ke peeche wale host se trace karo, router se kabhi nahi.</li>
<li><b>Binding.</b> <code>show ip policy</code>: kya route map us interface par hai jahan packets <b>aate</b> hain? Kya <code>show route-map NAME</code> kuch return karta hai (galat likha naam kuch return nahi karta)?</li>
<li><b>Match.</b> <code>show access-lists</code>: kya ACL hit counters badh rahe hain? Kya steer hone wala subnet source ki tarah likha hai?</li>
<li><b>Set.</b> Kya next hop directly connected hai (<code>show ip route 10.0.2.1</code> "directly connected" kehta hai)? Kya uski ARP entry hai? Agar tracked hai, kya track Up hai?</li>
<li><b>Debug.</b> ACL se limited <code>debug ip policy</code>: "policy match" aur "policy routed", ya "rejected(no match) - normal forwarding".</li>
<li><b>Return path.</b> Kya reply usi provider se wapas aata hai? NAT, firewalls aur provider anti-spoofing check karo.</li>
</ol>

<h3>Lab walk karna: guest traffic ISP2 se</h3>
<p><b>Task 1, observe.</b> PC-GUEST se <code>trace 198.51.100.10</code> hop 2 = 10.0.1.1 (ISP1) dikhata hai. Yahi aapka baseline aur problem ki definition hai.</p>
<p><b>Task 2, select.</b> <code>ip access-list standard GUEST-NET</code>, <code>permit 192.168.20.0 0.0.0.255</code>. Staff 192.168.10.10 match nahi hona chahiye; guests hone chahiye.</p>
<p><b>Task 3, decide.</b> <code>route-map GUEST-VIA-ISP2 permit 10</code>, <code>match ip address GUEST-NET</code>, <code>set ip next-hop 10.0.2.1</code>. 10.0.2.1 Gi0/1 par EDGE ke connected /30 par hai.</p>
<p><b>Task 4, apply.</b> <code>interface GigabitEthernet0/3</code>, <code>ip policy route-map GUEST-VIA-ISP2</code>. Ab guests ISP2 cross karte hain; staff abhi bhi ISP1; dono SRV tak pahunchte hain.</p>
<p><b>Task 5, prove.</b> Dono PCs se trace, phir <code>show route-map GUEST-VIA-ISP2</code> (policy routing matches zero se upar) aur <code>show ip policy</code>.</p>

<h3>Teen classic PBR pitfalls, saboot ke saath</h3>
<p><b>1. ACL direction.</b> Koi <code>permit ip any 192.168.20.0 0.0.0.255</code> likh deta hai:</p>
<pre class="out">EDGE# show access-lists GUEST-NET
Extended IP access list GUEST-NET
    <span class="hl">10 permit ip any 192.168.20.0 0.0.0.255</span>
EDGE# show route-map GUEST-VIA-ISP2 | include matches
  <span class="hl">Policy routing matches: 0 packets, 0 bytes</span></pre>
<p>Zero hits: ACL return traffic describe karta hai, jo Gi0/3 par kabhi aata hi nahi. Fix: guest subnet source ki tarah.</p>
<p><b>2. Next hop connected nahi.</b> Koi <code>set ip next-hop 100.64.20.1</code> (ISP2 ki door wali side) set kar deta hai:</p>
<pre class="out">EDGE# show ip route 100.64.20.1
% Network not in table
EDGE# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0, supernet
  Known via "static", distance 1, metric 0, candidate default path
  Routing Descriptor Blocks:
  <span class="hl">* 10.0.1.1</span></pre>
<p>Next hop connected subnet par nahi hai, isliye PBR use ignore karta hai aur guests default route se ISP1 jaate hain. Match counters phir bhi badh sakte hain, kyunki packets match hue the; sirf traceroute sach batata hai. Fix: 10.0.2.1 use karo, ya soch-samajh kar <code>recursive</code> jodo.</p>
<p><b>3. Return traffic asymmetry.</b> Production mein EDGE guests ko NAT karega. Agar NAT hamesha ISP1 address mein translate kare, guest packets ISP1 source address ke saath ISP2 se bahar jaate hain. ISP2 ke anti-spoofing filters unhe drop kar dete hain, ya replies ISP1 se wapas aate hain aur stateful firewall unhe discard kar deta hai. Symptom: outbound counters badhte hain, pages kabhi load nahi hote. Fix: exit interface match karne wale route map ke saath NAT, taaki Gi0/1 se jaane wala traffic ISP2 ka address use kare. Lab mein CORE 192.168.20.0/24 ko ISP2 se wapas route karta hai, isliye path symmetric hai.</p>

<h3>Ticket: VRF-lite, migration ke baad guests offline</h3>
<p><b>Symptom.</b> Guests ko VRF GUEST mein daalne ke baad koi guest internet tak nahi pahunchta. Staff theek hai.</p>
<pre class="out">EDGE# show ip vrf interfaces GUEST
Interface              IP-Address      VRF                              Protocol
<span class="hl">Gi0/3                  192.168.20.1    GUEST                            up</span>
EDGE# show ip route vrf GUEST
Routing Table: GUEST
<span class="hl">Gateway of last resort is not set</span>
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.20.0/24 is directly connected, GigabitEthernet0/3
L        192.168.20.1/32 is directly connected, GigabitEthernet0/3</pre>
<p><b>Analysis.</b> Sirf Gi0/3 GUEST mein hai. Gi0/1 (ISP2 ki taraf) abhi bhi global hai, isliye GUEST ke andar 10.0.2.1 unknown hai aur <code>ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1</code> install nahi ho sakta. <b>Fix.</b> Gi0/1 ko VRF GUEST mein daalo aur uska address dobara daalo, ya <code>ip route vrf GUEST 0.0.0.0 0.0.0.0 10.0.2.1 global</code> plus return route use karo. <code>ping vrf GUEST 198.51.100.10</code> aur host trace se <b>verify</b> karo.</p>

<h3>Ticket: BFD, failover abhi bhi 40 second leta hai</h3>
<p><b>Symptom.</b> EDGE par BFD aur OSPF ke neeche <code>bfd all-interfaces</code> joda gaya, lekin ISP1 link par failure test abhi bhi 40 second le raha tha.</p>
<pre class="out">EDGE# show bfd neighbors
IPv4 Sessions
NeighAddr                              LD/RD         RH/RS     State     Int
<span class="hl">10.0.1.1                                 1/0          Down      Down      Gi0/0</span></pre>
<p><b>Analysis.</b> Remote discriminator 0 ka matlab hai EDGE ne ISP1 se kabhi kuch nahi suna. Ya to ISP1 ke interface ya client par BFD nahi hai, ya kuch UDP 3784 drop kar raha hai. ISP1 par <code>show running-config interface</code> koi <code>bfd interval</code> nahi dikhata. <b>Fix.</b> ISP1 par matching BFD timers configure karo aur wahan OSPF register karo. <b>Verify</b> karo ki session Up/Up hai aur <b>Registered protocols</b> mein OSPF listed hai; failure test dobara chalao.</p>

<div class="eg"><p><b>Worked example.</b> Fix ke baad EDGE aur ISP1 dono echo mode ke saath 50 ms x 3 use karte hain. Failure test 14:02:10.000 par forwarding kaat-ta hai. BFD lagbhag 150 ms baad session down declare karta hai, OSPF turant adjacency girata hai, SPF chalta hai, aur traffic failure ke lagbhag 200 se 300 ms baad backup path par chala jaata hai, pehle ke 40 second ke muqable.</p></div>

<div class="warn"><p><b>Common galti.</b> Outage ke dauraan ek saath kai cheezein badalna (naya ACL, naya next hop aur naya interface binding). Jab kaam karne lage to pata nahi chalta kis change ne fix kiya, aur jab phir toote to pata nahi kaunsa undo karein. Ek change, ek test.</p></div>

<div class="exam"><p><b>Exam trap.</b> PBR tickets mein zero counter binding ya ACL ki taraf ishara karta hai; counters badh rahe hain lekin traffic purane path par hai to set clause (next hop unusable ya track down) ki taraf. BFD tickets mein RD = 0 remote end ki taraf ishara karta hai.</p></div>

<div class="scn"><h4>Woh PBR jo sirf subah chalta tha</h4><p>Ek office ne report kiya ki guest Wi-Fi subah tez aur dopahar mein dead rehta hai. Engineer ne checklist follow ki: binding sahi, ACL hits badh rahe, next hop connected, track Up. Fault return path mein tha: dopahar ka load traffic ko doosre firewall cluster par dhakel deta tha jo sirf ISP1 NAT pool jaanta tha. Fix tha dono clusters par har exit interface ke liye consistent NAT.</p><p><b>Seekh:</b> aakhri step, return path, mein hi mushkil PBR faults chhupe hote hain.</p></div>

<div class="iv"><p class="q">"PBR configured hai lekin traffic abhi bhi normal path le raha hai. Kaise troubleshoot karoge?"</p><p>Strong answer: host se trace; <code>show ip policy</code> mein sahi ingress interface check; route map exist karta hai aur uske counters check; ACL hits aur source sahi hai check; next hop directly connected, resolved aur tracked ho to Up hai check; ACL-limited <code>debug ip policy</code> use karo; aakhir mein return path, NAT aur firewalls check karo. Har command ka naam lo aur batao kaunsa output expect karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PBR order: host trace, binding, ACL match, set/next hop, debug, return path.</li>
<li>Zero counters: binding ya ACL. Counters badh rahe lekin purana path: next hop unusable ya track down.</li>
<li>VRF faults: check karo kaunse interfaces sach mein VRF mein hain aur <code>vrf</code> keyword se dekho.</li>
<li>BFD faults: RD = 0 ya Down/Down ka matlab remote side ne kabhi jawab nahi diya; uska config aur CoPP check karo.</li>
<li>Ek baar mein ek change, aur asli host se dobara test.</li>
</ul></div>
`}};export{e as default};