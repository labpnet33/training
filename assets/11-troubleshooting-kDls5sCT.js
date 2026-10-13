var e={id:`troubleshooting`,h:{en:`Common mistakes and the ACL troubleshooting workflow`,hi:`Common galtiyan aur ACL troubleshooting workflow`},body:{en:`
<p>A good doctor does not guess from one symptom. She asks what exactly hurts, checks vital signs, orders the right test, reads the result and only then prescribes. ACL tickets deserve the same discipline. "The ACL is blocking something" is not a diagnosis. This chapter gives you a six-step workflow, a gallery of the mistakes you will meet most often, and walks through the classic "ACL blocks OSPF" ticket and the labs of this module.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ACL troubleshooting workflow">
<rect x="10" y="30" width="95" height="56" rx="8" fill="#bae6fd"/><text x="57" y="54" text-anchor="middle" class="svg-ink" font-size="12">1 Define</text><text x="57" y="72" text-anchor="middle" class="svg-muted" font-size="12">the flow</text>
<rect x="115" y="30" width="95" height="56" rx="8" fill="#bae6fd"/><text x="162" y="54" text-anchor="middle" class="svg-ink" font-size="12">2 Rule out</text><text x="162" y="72" text-anchor="middle" class="svg-muted" font-size="12">routing</text>
<rect x="220" y="30" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="267" y="54" text-anchor="middle" class="svg-ink" font-size="12">3 Find</text><text x="267" y="72" text-anchor="middle" class="svg-muted" font-size="12">every ACL</text>
<rect x="325" y="30" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="372" y="54" text-anchor="middle" class="svg-ink" font-size="12">4 Walk</text><text x="372" y="72" text-anchor="middle" class="svg-muted" font-size="12">top-down</text>
<rect x="430" y="30" width="95" height="56" rx="8" fill="#fde68a"/><text x="477" y="54" text-anchor="middle" class="svg-ink" font-size="12">5 Prove</text><text x="477" y="72" text-anchor="middle" class="svg-muted" font-size="12">counters, log</text>
<rect x="535" y="30" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="582" y="54" text-anchor="middle" class="svg-ink" font-size="12">6 Fix</text><text x="582" y="72" text-anchor="middle" class="svg-muted" font-size="12">and verify</text>
<line x1="105" y1="58" x2="115" y2="58" stroke="#64748b" stroke-width="2"/><line x1="210" y1="58" x2="220" y2="58" stroke="#64748b" stroke-width="2"/><line x1="315" y1="58" x2="325" y2="58" stroke="#64748b" stroke-width="2"/><line x1="420" y1="58" x2="430" y2="58" stroke="#64748b" stroke-width="2"/><line x1="525" y1="58" x2="535" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">Check both directions: request and reply</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Every step leaves evidence you can paste into the ticket.</text>
</svg><p class="cap">Six steps from symptom to proven fix.</p></div>

<h3>The six-step workflow</h3>
<ol>
<li><b>Define the flow.</b> Source IP, destination IP, protocol, destination port. Also note a similar flow that works: "guest to HR fails, guest to WAN works" narrows things fast.</li>
<li><b>Rule out routing and basics.</b> Check routes in both directions and interface status. A ping that returns <code>U.U.U</code> or a PC reporting "administratively prohibited" points strongly to an ACL; timeouts with no reply usually point elsewhere.</li>
<li><b>Find every ACL on the path.</b> On each router: <code>show ip interface | include line protocol|access list</code> and <code>show running-config | include access-group|access-class|traffic-filter</code>.</li>
<li><b>Walk each list top-down</b> with the packet as that interface sees it in that direction. Do the same for the reply. Identify the first matching line, or the implicit deny.</li>
<li><b>Prove it.</b> <code>clear access-list counters</code>, generate one test, and read <code>show access-lists</code>. If nothing increments, the implicit deny is the suspect: temporarily add a logged deny at the end of a named list and watch the log.</li>
<li><b>Fix with the smallest change</b>, usually a sequence-number insert; verify with the same test; remove temporary log lines; add a remark explaining why.</li>
</ol>

<h3>Mistakes gallery</h3>
<table class="cmp">
<tr><th>Mistake</th><th>Symptom</th><th>How you spot it</th></tr>
<tr><td>No permit at the end</td><td>Everything blocked, not just the target</td><td>Only deny lines; no increments except on the deny</td></tr>
<tr><td>General entry above specific</td><td>Exception never applies</td><td>Zero matches on the specific line</td></tr>
<tr><td>Wrong direction</td><td>Rule never matches or replies die</td><td>Sources in the list never appear on that side</td></tr>
<tr><td>Standard ACL near the source</td><td>Source cut off from everything</td><td>Deny counter rising for all destinations</td></tr>
<tr><td>Subnet mask used as wildcard</td><td>Wrong hosts matched</td><td>Odd address such as 0.0.0.0 in the stored entry</td></tr>
<tr><td>Port after the source address</td><td>Service denied</td><td>Line reads "source eq 80"</td></tr>
<tr><td>TCP instead of UDP (or reverse)</td><td>DNS, NTP, SNMP fail</td><td>Zero matches on the service line</td></tr>
<tr><td>Return traffic not permitted</td><td>Requests leave, replies vanish</td><td>Implicit deny on the reply path</td></tr>
<tr><td>Routing protocol not permitted</td><td>Neighbour drops after the dead timer</td><td>Adjacency down after inbound ACL applied</td></tr>
<tr><td>Name typo in ip access-group</td><td>Nothing is filtered</td><td>Names are case-sensitive; applied name has no entries</td></tr>
<tr><td><code>no access-list N ...</code></td><td>Whole list gone, all permitted</td><td><code>show access-lists N</code> empty</td></tr>
<tr><td>IPv6 explicit deny at the end</td><td>IPv6 neighbours fail</td><td>Denied ICMPv6 types 135 and 136 in the log</td></tr>
</table>

<h3>Ticket walkthrough: the ACL that killed OSPF</h3>
<p>R1 and R2 are OSPF neighbours across 10.0.0.0/30. A change adds an inbound extended ACL WAN-IN on R2 Gi0/1 that permits only business traffic. Forty seconds later:</p>
<pre class="out">%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/1 from FULL to DOWN, Neighbor Down: <span class="hl">Dead timer expired</span>

R2# show access-lists WAN-IN
Extended IP access list WAN-IN
    10 permit tcp 10.1.0.0 0.0.255.255 10.2.50.0 0.0.0.255 eq 443 (120 matches)
    20 permit icmp any any echo-reply (4 matches)

R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   <span class="hl">INIT/DROTHER</span>    00:00:35    10.0.0.2        GigabitEthernet0/1</pre>
<p>Walk the flow: R1's hellos (protocol 89, source 10.0.0.1, destination 224.0.0.5) arrive inbound on R2 Gi0/1. Line 10 is TCP, line 20 is ICMP; nothing matches, so the implicit deny drops them. R2 stops hearing R1, so R2's hellos no longer list R1's router ID, and R1 sees R2 stuck in INIT. R2's own hellos leave freely, because outbound traffic from the router is never the problem here. Fix and verify:</p>
<pre class="code">R2(config)# ip access-list extended WAN-IN
R2(config-ext-nacl)# 5 permit ospf host 10.0.0.1 any
R2(config-ext-nacl)# end</pre>
<pre class="out">%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/1 from LOADING to <span class="hl">FULL, Loading Done</span></pre>
<p><code>host 10.0.0.1 any</code> covers both multicast hellos and any unicast OSPF packets from the neighbour.</p>

<h3>Practising the workflow on this module's labs</h3>
<div class="eg"><p><b>acl-standard: "guests still reach HR".</b> Step 3 shows ACL 10 applied <code>in</code> on R2 Gi0/0 instead of <code>out</code>. Step 4: inbound on Gi0/0 the sources are HR servers, never 10.1.20.x, so line 10 never matches. Fix: move it outbound. <b>Variation: "nobody reaches HR"</b>: only the deny line exists; add <code>permit any</code>.</p>
<p><b>acl-extended: "lab web works, SSH to R2 fails".</b> Step 4 finds <code>permit tcp 192.168.40.0 0.0.0.255 eq 22 any</code>: port after the source. SSH clients use a random source port, so the line never matches. Rewrite with the port after <code>any</code>.</p>
<p><b>acl-named: "contractors still cannot browse".</b> <code>show access-lists BRANCH-IN</code> shows the new permit at sequence 40, below <code>20 deny ip 10.50.8.0 0.0.0.255 any</code>, whose counter keeps climbing. Remove 40 and re-add it as 15.</p></div>

<div class="warn"><p><b>Common mistake.</b> Removing the ACL to "see if it is the ACL". It proves little, opens a security hole and destroys the counters you needed. Read the counters and logs first.</p></div>

<div class="exam"><p><b>Exam trap.</b> In troubleshooting items, OSPF neighbour loss right after an ACL change almost always means an inbound ACL on one side lacks <code>permit ospf</code>. An outbound ACL on the same router cannot cause it, because the router's own hellos are not filtered outbound.</p></div>

<div class="scn"><h4>The NTP drift nobody linked to the ACL</h4><p>Weeks after a hardening project, a factory's logs started showing wrong timestamps. The engineer defined the flow (UDP 123 from the switches to the NTP server), confirmed routing, then found an inbound ACL on the core router's server VLAN interface. Walking it top-down, the NTP replies from the server (source port 123) matched nothing and fell to the implicit deny; the counters on the logged deny he added temporarily confirmed it within a minute. One inserted line, <code>permit udp host 10.9.9.123 eq ntp any</code>, fixed the drift.</p><p><b>Lesson:</b> the workflow finds problems that are far from the original change, as long as you trace both directions.</p></div>

<div class="iv"><p class="q">"Users say an application stopped working after an ACL change. How do you troubleshoot?"</p><p>Strong answer: define the exact flow and port; rule out routing; list every ACL and direction on the path; walk each list top-down for the request and the reply; clear counters, reproduce and read them; if nothing increments suspect the implicit deny and add a temporary logged deny; fix with a sequence-number insert and verify. Mention the usual suspects: missing permit, wrong order, wrong direction, wrong port position, blocked return traffic or routing protocols.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Define the flow, rule out routing, find every ACL, walk top-down, prove with counters, fix minimally.</li>
<li>Always trace the reply as well as the request.</li>
<li>No counter increments anywhere means the implicit deny; a temporary logged deny makes it visible.</li>
<li>Inbound ACLs must permit routing protocols such as OSPF (protocol 89) from neighbours.</li>
<li>Do not remove the ACL to test; read counters and logs instead.</li>
</ul></div>
`,hi:`
<p>Achhi doctor ek symptom se andaza nahi lagati. Woh poochti hai ki exactly kya dard hai, vital signs check karti hai, sahi test karwati hai, result padhti hai aur tabhi dawai likhti hai. ACL tickets ko bhi yahi discipline chahiye. "ACL kuch block kar raha hai" diagnosis nahi hai. Yeh chapter aapko six-step workflow deta hai, sabse zyada milne wali galtiyon ki gallery deta hai, aur classic "ACL ne OSPF block kar diya" ticket aur is module ke labs ko step by step dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="ACL troubleshooting workflow">
<rect x="10" y="30" width="95" height="56" rx="8" fill="#bae6fd"/><text x="57" y="54" text-anchor="middle" class="svg-ink" font-size="12">1 Flow</text><text x="57" y="72" text-anchor="middle" class="svg-muted" font-size="12">define karo</text>
<rect x="115" y="30" width="95" height="56" rx="8" fill="#bae6fd"/><text x="162" y="54" text-anchor="middle" class="svg-ink" font-size="12">2 Routing</text><text x="162" y="72" text-anchor="middle" class="svg-muted" font-size="12">rule out</text>
<rect x="220" y="30" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="267" y="54" text-anchor="middle" class="svg-ink" font-size="12">3 Har ACL</text><text x="267" y="72" text-anchor="middle" class="svg-muted" font-size="12">dhoondo</text>
<rect x="325" y="30" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="372" y="54" text-anchor="middle" class="svg-ink" font-size="12">4 Top-down</text><text x="372" y="72" text-anchor="middle" class="svg-muted" font-size="12">chalo</text>
<rect x="430" y="30" width="95" height="56" rx="8" fill="#fde68a"/><text x="477" y="54" text-anchor="middle" class="svg-ink" font-size="12">5 Prove</text><text x="477" y="72" text-anchor="middle" class="svg-muted" font-size="12">counters, log</text>
<rect x="535" y="30" width="95" height="56" rx="8" fill="#ddd6fe"/><text x="582" y="54" text-anchor="middle" class="svg-ink" font-size="12">6 Fix</text><text x="582" y="72" text-anchor="middle" class="svg-muted" font-size="12">aur verify</text>
<line x1="105" y1="58" x2="115" y2="58" stroke="#64748b" stroke-width="2"/><line x1="210" y1="58" x2="220" y2="58" stroke="#64748b" stroke-width="2"/><line x1="315" y1="58" x2="325" y2="58" stroke="#64748b" stroke-width="2"/><line x1="420" y1="58" x2="430" y2="58" stroke="#64748b" stroke-width="2"/><line x1="525" y1="58" x2="535" y2="58" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">Dono directions check karo: request aur reply</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Har step aisa saboot chhodta hai jo ticket mein paste ho sake.</text>
</svg><p class="cap">Symptom se proven fix tak chhe steps.</p></div>

<h3>Six-step workflow</h3>
<ol>
<li><b>Flow define karo.</b> Source IP, destination IP, protocol, destination port. Ek milta-julta flow bhi note karo jo chal raha hai: "guest se HR fail, guest se WAN chalta hai" cheezon ko jaldi narrow karta hai.</li>
<li><b>Routing aur basics rule out karo.</b> Dono directions mein routes aur interface status check karo. <code>U.U.U</code> lautane wala ping ya "administratively prohibited" report karta PC ACL ki taraf strong ishara hai; bina reply ke timeouts aam taur par kahin aur ishara karte hain.</li>
<li><b>Path par har ACL dhoondo.</b> Har router par: <code>show ip interface | include line protocol|access list</code> aur <code>show running-config | include access-group|access-class|traffic-filter</code>.</li>
<li><b>Har list ko top-down chalo</b>, packet ko waise lekar jaise woh interface us direction mein use dekhta hai. Reply ke liye bhi yahi karo. Pehli matching line, ya implicit deny, pehchano.</li>
<li><b>Prove karo.</b> <code>clear access-list counters</code>, ek test chalao, aur <code>show access-lists</code> padho. Agar kuch nahi badhta, to implicit deny suspect hai: named list ke end mein temporarily logged deny jodo aur log dekho.</li>
<li><b>Sabse chhote change se fix karo</b>, aam taur par sequence-number insert; usi test se verify karo; temporary log lines hatao; kyun kiya, yeh batane wala remark jodo.</li>
</ol>

<h3>Galtiyon ki gallery</h3>
<table class="cmp">
<tr><th>Galti</th><th>Symptom</th><th>Kaise pakdoge</th></tr>
<tr><td>End mein permit nahi</td><td>Sirf target nahi, sab block</td><td>Sirf deny lines; deny ke alawa kahin increment nahi</td></tr>
<tr><td>Specific ke upar general entry</td><td>Exception kabhi apply nahi hota</td><td>Specific line par zero matches</td></tr>
<tr><td>Galat direction</td><td>Rule kabhi match nahi, ya replies mar jaate hain</td><td>List ke sources us side par kabhi dikhte hi nahi</td></tr>
<tr><td>Source ke paas standard ACL</td><td>Source har cheez se kat gaya</td><td>Saare destinations ke liye deny counter badh raha</td></tr>
<tr><td>Wildcard ki jagah subnet mask</td><td>Galat hosts match</td><td>Stored entry mein 0.0.0.0 jaisa ajeeb address</td></tr>
<tr><td>Source address ke baad port</td><td>Service deny</td><td>Line padhti hai "source eq 80"</td></tr>
<tr><td>UDP ki jagah TCP (ya ulta)</td><td>DNS, NTP, SNMP fail</td><td>Service line par zero matches</td></tr>
<tr><td>Return traffic permit nahi</td><td>Requests jaati hain, replies gayab</td><td>Reply path par implicit deny</td></tr>
<tr><td>Routing protocol permit nahi</td><td>Dead timer ke baad neighbour drop</td><td>Inbound ACL lagane ke baad adjacency down</td></tr>
<tr><td>ip access-group mein naam ki typo</td><td>Kuch filter nahi hota</td><td>Naam case-sensitive hain; applied naam mein entries nahi</td></tr>
<tr><td><code>no access-list N ...</code></td><td>Poori list gayab, sab permit</td><td><code>show access-lists N</code> khaali</td></tr>
<tr><td>End mein IPv6 explicit deny</td><td>IPv6 neighbours fail</td><td>Log mein denied ICMPv6 types 135 aur 136</td></tr>
</table>

<h3>Ticket walkthrough: woh ACL jisne OSPF maar diya</h3>
<p>R1 aur R2 10.0.0.0/30 par OSPF neighbours hain. Ek change R2 Gi0/1 par inbound extended ACL WAN-IN jodta hai jo sirf business traffic permit karta hai. Chaalis second baad:</p>
<pre class="out">%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/1 from FULL to DOWN, Neighbor Down: <span class="hl">Dead timer expired</span>

R2# show access-lists WAN-IN
Extended IP access list WAN-IN
    10 permit tcp 10.1.0.0 0.0.255.255 10.2.50.0 0.0.0.255 eq 443 (120 matches)
    20 permit icmp any any echo-reply (4 matches)

R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   <span class="hl">INIT/DROTHER</span>    00:00:35    10.0.0.2        GigabitEthernet0/1</pre>
<p>Flow chalo: R1 ke hellos (protocol 89, source 10.0.0.1, destination 224.0.0.5) R2 Gi0/1 par inbound aate hain. Line 10 TCP hai, line 20 ICMP; kuch match nahi hota, isliye implicit deny unhe drop kar deta hai. R2 ko R1 sunna band ho jaata hai, isliye R2 ke hellos mein ab R1 ka router ID nahi hota, aur R1 ko R2 INIT mein atka dikhta hai. R2 ke apne hellos aaram se nikalte hain, kyunki yahan router ka outbound traffic kabhi problem nahi hai. Fix aur verify:</p>
<pre class="code">R2(config)# ip access-list extended WAN-IN
R2(config-ext-nacl)# 5 permit ospf host 10.0.0.1 any
R2(config-ext-nacl)# end</pre>
<pre class="out">%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/1 from LOADING to <span class="hl">FULL, Loading Done</span></pre>
<p><code>host 10.0.0.1 any</code> neighbour se multicast hellos aur koi bhi unicast OSPF packets dono cover karta hai.</p>

<h3>Is module ke labs par workflow ki practice</h3>
<div class="eg"><p><b>acl-standard: "guests ab bhi HR tak pahunch rahe hain".</b> Step 3 dikhata hai ki ACL 10 R2 Gi0/0 par <code>out</code> ki jagah <code>in</code> laga hai. Step 4: Gi0/0 par inbound sources HR servers hain, kabhi 10.1.20.x nahi, isliye line 10 kabhi match nahi hoti. Fix: ise outbound le jao. <b>Variation: "koi HR tak nahi pahunch raha"</b>: sirf deny line hai; <code>permit any</code> jodo.</p>
<p><b>acl-extended: "lab ka web chalta hai, R2 par SSH fail".</b> Step 4 milta hai <code>permit tcp 192.168.40.0 0.0.0.255 eq 22 any</code>: source ke baad port. SSH clients random source port use karte hain, isliye line kabhi match nahi hoti. Port ko <code>any</code> ke baad rakh kar dobara likho.</p>
<p><b>acl-named: "contractors ab bhi browse nahi kar pa rahe".</b> <code>show access-lists BRANCH-IN</code> naye permit ko sequence 40 par dikhata hai, <code>20 deny ip 10.50.8.0 0.0.0.255 any</code> ke neeche, jiska counter badhta ja raha hai. 40 hatao aur use 15 ki tarah dobara jodo.</p></div>

<div class="warn"><p><b>Common galti.</b> "Kya yeh ACL hai" dekhne ke liye ACL hata dena. Isse kam hi prove hota hai, security hole khulta hai aur woh counters mit jaate hain jo aapko chahiye the. Pehle counters aur logs padho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting items mein ACL change ke turant baad OSPF neighbour chale jaane ka matlab lagbhag hamesha yeh hota hai ki ek side ke inbound ACL mein <code>permit ospf</code> nahi hai. Usi router par outbound ACL yeh cause nahi kar sakta, kyunki router ke apne hellos outbound filter nahi hote.</p></div>

<div class="scn"><h4>NTP drift jise kisi ne ACL se nahi joda</h4><p>Hardening project ke hafton baad ek factory ke logs mein galat timestamps aane lage. Engineer ne flow define kiya (switches se NTP server tak UDP 123), routing confirm ki, phir core router ke server VLAN interface par inbound ACL paaya. Use top-down chalne par, server se aane wale NTP replies (source port 123) kuch match nahi karte the aur implicit deny mein gir jaate the; temporarily jode gaye logged deny ke counters ne ek minute mein confirm kar diya. Ek inserted line, <code>permit udp host 10.9.9.123 eq ntp any</code>, ne drift theek kar diya.</p><p><b>Seekh:</b> workflow original change se door ki problems bhi dhoondh leta hai, bas dono directions trace karo.</p></div>

<div class="iv"><p class="q">"Users kehte hain ACL change ke baad ek application band ho gayi. Kaise troubleshoot karoge?"</p><p>Strong answer: exact flow aur port define karo; routing rule out karo; path par har ACL aur direction list karo; request aur reply dono ke liye har list top-down chalo; counters clear karo, reproduce karo aur padho; kuch na badhe to implicit deny par shak karo aur temporary logged deny jodo; sequence-number insert se fix karo aur verify karo. Usual suspects batao: missing permit, galat order, galat direction, galat port position, blocked return traffic ya routing protocols.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow define karo, routing rule out karo, har ACL dhoondo, top-down chalo, counters se prove karo, kam se kam change se fix karo.</li>
<li>Request ke saath reply bhi hamesha trace karo.</li>
<li>Kahin bhi counter na badhe to matlab implicit deny; temporary logged deny use visible banata hai.</li>
<li>Inbound ACLs ko neighbours se OSPF (protocol 89) jaise routing protocols permit karne chahiye.</li>
<li>Test ke liye ACL mat hatao; counters aur logs padho.</li>
</ul></div>
`}};export{e as default};