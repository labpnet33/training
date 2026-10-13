var e={id:`worked-ticket`,h:{en:`Troubleshooting workflow: a multi-fault ticket end to end`,hi:`Troubleshooting workflow: ek multi-fault ticket shuru se aakhir tak`},body:{en:`
<p>A detective story rarely has only one clue. The first clue leads to a suspect, the suspect has an alibi, and a second clue appears only after the first is explained. Real tickets are like that, and so are ENARSI simulations: fix one fault and the symptom changes, revealing the next. This chapter walks through one ticket from the first sentence to the documentation, using every tool from this module on the reference topology.</p>

<h3>The ticket</h3>
<div class="note"><p><b>INC-7302</b>: "Since last night's maintenance, branch users in 10.1.10.0/24 cannot open the HR portal on SRV1 (10.3.30.10, HTTPS). Constraints: do not add static routes; SRV1 must stay protected (only ICMP, SSH and HTTPS allowed to it)." In this lab R1 has no default route.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Fault locations">
<rect x="10" y="70" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="50" y="97" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="140" y="70" width="90" height="44" rx="8" fill="#bae6fd"/><text x="185" y="97" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="70" width="90" height="44" rx="8" fill="#fde68a"/><text x="335" y="97" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="440" y="70" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="485" y="97" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="560" y="70" width="74" height="44" rx="8" fill="#e2e8f0"/><text x="597" y="97" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text>
<line x1="90" y1="92" x2="140" y2="92" stroke="#64748b" stroke-width="2"/><line x1="230" y1="92" x2="290" y2="92" stroke="#64748b" stroke-width="2"/><line x1="380" y1="92" x2="440" y2="92" stroke="#64748b" stroke-width="2"/><line x1="530" y1="92" x2="560" y2="92" stroke="#64748b" stroke-width="2"/>
<circle cx="310" cy="45" r="12" fill="#fed7aa"/><text x="310" y="50" text-anchor="middle" class="svg-ink" font-size="12">1</text><text x="330" y="30" class="svg-muted" font-size="12">EIGRP to OSPF filter</text>
<circle cx="360" cy="145" r="12" fill="#fed7aa"/><text x="360" y="150" text-anchor="middle" class="svg-ink" font-size="12">2</text><text x="380" y="150" class="svg-muted" font-size="12">OSPF to EIGRP, no metric</text>
<circle cx="545" cy="45" r="12" fill="#fed7aa"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="12">3</text><text x="470" y="30" class="svg-muted" font-size="12">ACL out Gi0/2</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Each fault is visible only after the previous one is fixed</text>
</svg><p class="cap">The three faults hidden in INC-7302, in the order you will find them.</p></div>

<h3>Steps 1 and 2: define and gather</h3>
<p>Restated: "Hosts in 10.1.10.0/24 cannot reach 10.3.30.10 on TCP 443; a maintenance happened last night." PC1 shows <code>Reply from 10.1.10.1: Destination net unreachable.</code> That message comes from R1, its gateway, so R1 has no usable route. Divide and conquer has already told us where to start: Layer 3 on R1.</p>
<pre class="out">R1# show ip route 10.3.30.10
<span class="hl">% Subnet not in table</span>
R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.0.2        1   FULL/DR         00:00:36    10.0.12.2       GigabitEthernet0/0</pre>

<h3>Fault 1: the route is not redistributed into OSPF</h3>
<p>The OSPF neighbour is Full, so the problem is not the adjacency. Following the routing-protocol checklist, go to where the prefix should be advertised: R2 must redistribute it from EIGRP into OSPF.</p>
<pre class="out">R2# show ip route 10.3.30.10
Routing entry for 10.3.30.0/24
<span class="hl">  Known via "eigrp 100", distance 90, metric 3072, type internal</span>
  Redistributing via eigrp 100, ospf 1
R2# show run | section router ospf
router ospf 1
<span class="hl"> redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF</span>
 network 10.0.12.0 0.0.0.3 area 0
 network 10.255.0.2 0.0.0.0 area 0
R2# show route-map EIGRP-TO-OSPF
route-map EIGRP-TO-OSPF, permit, sequence 10
  Match clauses:
    ip address prefix-lists: DC-NETS
  Set clauses:
    tag 100
  Policy routing matches: 0 packets, 0 bytes
R2# show ip prefix-list DC-NETS
ip prefix-list DC-NETS: 2 entries
   seq 5 permit 10.3.20.0/24
<span class="hl">   seq 10 permit 10.3.40.0/24</span></pre>
<p>Hypothesis: the maintenance rewrote the prefix list and typed 10.3.40.0/24 instead of 10.3.30.0/24, so the route map's implicit deny blocks SRV1's subnet. It is a read-only confirmation; now a single, minimal change:</p>
<pre class="code"><span class="c">! Add the missing data-centre subnet; keep the route-map design intact</span>
R2(config)# ip prefix-list DC-NETS seq 15 permit 10.3.30.0/24
R2(config)# do show ip ospf database external 10.3.30.0 | include Link State ID
  Link State ID: 10.3.30.0 (External Network Number )</pre>
<p>R1 now shows <code>O E2 10.3.30.0/24 [110/20] via 10.0.12.2</code>. Re-test from the user's point of view.</p>

<h3>Fault 2: the return path is missing</h3>
<pre class="out">R1# ping 10.3.30.10 source GigabitEthernet0/1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.3.30.10, timeout is 2 seconds:
Packet sent with a source address of 10.1.10.1
.....
Success rate is 0 percent (0/5)
R3# show ip route 10.1.10.10
<span class="hl">% Subnet not in table</span></pre>
<p>The symptom changed: the forward route exists, but R3 cannot send the replies back. R3's EIGRP neighbour R2 is up, so check whether R2 advertises 10.1.10.0/24 into EIGRP.</p>
<pre class="out">R2# show ip eigrp topology 10.1.10.0/24
%Entry 10.1.10.0/24 not in topology table
R2# show run | section router eigrp
router eigrp 100
 network 10.0.23.0 0.0.0.3
<span class="hl"> redistribute ospf 1</span></pre>
<p>Classic EIGRP needs a seed metric for routes from OSPF. The maintenance removed the old <code>default-metric</code> line. Fix:</p>
<pre class="code">R2(config)# router eigrp 100
R2(config-router)# redistribute ospf 1 metric 100000 10 255 1 1500</pre>
<pre class="out">R3# show ip route eigrp | include 10.1.10
<span class="hl">D EX     10.1.10.0/24 [170/28416] via 10.0.23.1, 00:00:09, GigabitEthernet0/1</span></pre>
<p>The metric checks out: the minimum bandwidth of 100,000 kbps gives 10,000,000 / 100,000 = 100; the seed delay of 10 (tens of microseconds) plus 1 for R3's GigabitEthernet interface gives 11; and 256 x (100 + 11) = 28416. Ping from the branch LAN now succeeds.</p>

<h3>Fault 3: ping works, HTTPS does not</h3>
<p>Layer 3 is proven in both directions, so switch to top-down for the application.</p>
<pre class="out">R3# show ip interface GigabitEthernet0/2 | include access list
<span class="hl">  Outgoing access list is SRV-PROTECT</span>
  Inbound  access list is not set
R3# show access-lists SRV-PROTECT
Extended IP access list SRV-PROTECT
    10 permit icmp any any (10 matches)
    20 permit tcp any any eq 22
<span class="hl">    30 deny ip any any log (38 matches)</span>
R3# show logging | include SRV-PROTECT
%SEC-6-IPACCESSLOGP: list SRV-PROTECT denied tcp 10.1.10.10(51544) -&gt; 10.3.30.10(443), 1 packet</pre>
<p>The constraint says SRV1 must stay protected, so removing the ACL is not allowed. Insert one permit before the deny:</p>
<pre class="code">R3(config)# ip access-list extended SRV-PROTECT
R3(config-ext-nacl)# 25 permit tcp any host 10.3.30.10 eq 443</pre>

<h3>Steps 7 and 8: verify and document</h3>
<p>From PC1, the HR portal loads; <code>show access-lists SRV-PROTECT</code> shows matches on line 25. Then check that nothing else broke: both neighbours up, <code>show ip route summary</code> on R2 matches the baseline plus the restored routes, and other branches still reach their services.</p>
<table class="cmp"><tr><th>#</th><th>Root cause</th><th>Fix</th></tr>
<tr><td>1</td><td>Prefix list DC-NETS on R2 had 10.3.40.0/24 instead of 10.3.30.0/24</td><td><code>ip prefix-list DC-NETS seq 15 permit 10.3.30.0/24</code></td></tr>
<tr><td>2</td><td>OSPF redistributed into EIGRP without a seed metric</td><td><code>redistribute ospf 1 metric 100000 10 255 1 1500</code></td></tr>
<tr><td>3</td><td>SRV-PROTECT ACL did not allow HTTPS</td><td><code>25 permit tcp any host 10.3.30.10 eq 443</code></td></tr>
</table>

<div class="eg"><p><b>Worked example: why three faults looked like one.</b> Before any fix, all three faults produced the same user symptom, "HR portal down". Only after fault 1 was fixed did ping change from "net unreachable" to timeouts (fault 2), and only after fault 2 did ping succeed while HTTPS failed (fault 3). Each fix changed the symptom, and each new symptom pointed to a different checklist.</p></div>

<div class="warn"><p><b>Common mistake.</b> Stopping after fault 1 because "the route is back now". Always re-run the user's test after every fix.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Destination net unreachable" from the gateway means the gateway has no route; timeouts usually mean the packet was forwarded and something later (often the return path or an ACL without an ICMP reply) failed. An ACL log line proves a deny at a precise place.</p></div>

<div class="scn"><h4>The maintenance that "only tidied up"</h4><p>This ticket is modelled on a real pattern: an engineer "tidied up" redistribution on a border router, replacing a long prefix list with a short one, and removing a <code>default-metric</code> line that looked unused. Separately, another engineer hardened a server ACL. Each change passed its own quick test. Together they cut off one application. The configuration change logger showed both sessions, which turned a three-hour hunt into a thirty-minute fix.</p><p><b>Lesson:</b> small unrelated changes combine into multi-fault outages; change logs and a method untangle them.</p></div>

<div class="iv"><p class="q">"Tell me about a time you fixed a problem that had more than one cause."</p><p>Use a structure like INC-7302: the symptom, how you isolated the first fault with evidence, how the symptom changed after the fix, the second and third faults, how you respected constraints (no static routes, keep the ACL), how you verified end to end, and what you documented so it does not happen again.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Restate the ticket with addresses, protocol and constraints before you touch anything.</li>
<li>The gateway's "net unreachable" pointed to a missing route; the routing-protocol checklist found a prefix-list error.</li>
<li>After each fix, re-test: the changed symptom (timeouts, then HTTPS only) revealed the next fault.</li>
<li>Minimal fixes that respect constraints: add a prefix-list line, add a seed metric, add one ACL permit.</li>
<li>Verify end to end, check nothing else changed against the baseline, and document every root cause.</li>
</ul></div>
`,hi:`
<p>Jasoosi kahani mein shaayad hi kabhi ek clue hota hai. Pehla clue ek suspect tak le jaata hai, suspect ke paas alibi hota hai, aur doosra clue tabhi dikhta hai jab pehla samajh aa jaaye. Real tickets aise hi hote hain, aur ENARSI simulations bhi: ek fault theek karo aur symptom badal jaata hai, agla dikhata hua. Yeh chapter ek ticket ko pehle sentence se documentation tak chalta hai, reference topology par is module ka har tool use karke.</p>

<h3>Ticket</h3>
<div class="note"><p><b>INC-7302</b>: "Kal raat ke maintenance se, 10.1.10.0/24 ke branch users SRV1 (10.3.30.10, HTTPS) par HR portal nahi khol pa rahe. Constraints: static routes mat jodo; SRV1 protected rehna chahiye (uske liye sirf ICMP, SSH aur HTTPS allowed)." Is lab mein R1 ke paas default route nahi hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Fault locations">
<rect x="10" y="70" width="80" height="44" rx="8" fill="#e2e8f0"/><text x="50" y="97" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="140" y="70" width="90" height="44" rx="8" fill="#bae6fd"/><text x="185" y="97" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="290" y="70" width="90" height="44" rx="8" fill="#fde68a"/><text x="335" y="97" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="440" y="70" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="485" y="97" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="560" y="70" width="74" height="44" rx="8" fill="#e2e8f0"/><text x="597" y="97" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text>
<line x1="90" y1="92" x2="140" y2="92" stroke="#64748b" stroke-width="2"/><line x1="230" y1="92" x2="290" y2="92" stroke="#64748b" stroke-width="2"/><line x1="380" y1="92" x2="440" y2="92" stroke="#64748b" stroke-width="2"/><line x1="530" y1="92" x2="560" y2="92" stroke="#64748b" stroke-width="2"/>
<circle cx="310" cy="45" r="12" fill="#fed7aa"/><text x="310" y="50" text-anchor="middle" class="svg-ink" font-size="12">1</text><text x="330" y="30" class="svg-muted" font-size="12">EIGRP se OSPF filter</text>
<circle cx="360" cy="145" r="12" fill="#fed7aa"/><text x="360" y="150" text-anchor="middle" class="svg-ink" font-size="12">2</text><text x="380" y="150" class="svg-muted" font-size="12">OSPF se EIGRP, metric nahi</text>
<circle cx="545" cy="45" r="12" fill="#fed7aa"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="12">3</text><text x="470" y="30" class="svg-muted" font-size="12">ACL out Gi0/2</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Har fault tabhi dikhta hai jab pichhla theek ho jaaye</text>
</svg><p class="cap">INC-7302 mein chhupe teen faults, usi order mein jismein aap unhe dhoondhoge.</p></div>

<h3>Steps 1 aur 2: define aur gather</h3>
<p>Dohraaya gaya: "10.1.10.0/24 ke hosts TCP 443 par 10.3.30.10 tak nahi pahunch pa rahe; kal raat maintenance hua." PC1 <code>Reply from 10.1.10.1: Destination net unreachable.</code> dikhata hai. Yeh message R1 se aata hai, uska gateway, yaani R1 ke paas usable route nahi hai. Divide and conquer ne pehle hi bata diya kahan se shuru karna hai: R1 par Layer 3.</p>
<pre class="out">R1# show ip route 10.3.30.10
<span class="hl">% Subnet not in table</span>
R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.255.0.2        1   FULL/DR         00:00:36    10.0.12.2       GigabitEthernet0/0</pre>

<h3>Fault 1: route OSPF mein redistribute nahi ho raha</h3>
<p>OSPF neighbour Full hai, isliye problem adjacency nahi hai. Routing-protocol checklist follow karte hue, wahan jao jahan prefix advertise hona chahiye: R2 ko ise EIGRP se OSPF mein redistribute karna hai.</p>
<pre class="out">R2# show ip route 10.3.30.10
Routing entry for 10.3.30.0/24
<span class="hl">  Known via "eigrp 100", distance 90, metric 3072, type internal</span>
  Redistributing via eigrp 100, ospf 1
R2# show run | section router ospf
router ospf 1
<span class="hl"> redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF</span>
 network 10.0.12.0 0.0.0.3 area 0
 network 10.255.0.2 0.0.0.0 area 0
R2# show route-map EIGRP-TO-OSPF
route-map EIGRP-TO-OSPF, permit, sequence 10
  Match clauses:
    ip address prefix-lists: DC-NETS
  Set clauses:
    tag 100
  Policy routing matches: 0 packets, 0 bytes
R2# show ip prefix-list DC-NETS
ip prefix-list DC-NETS: 2 entries
   seq 5 permit 10.3.20.0/24
<span class="hl">   seq 10 permit 10.3.40.0/24</span></pre>
<p>Hypothesis: maintenance ne prefix list dobara likhi aur 10.3.30.0/24 ki jagah 10.3.40.0/24 type kar diya, isliye route map ka implicit deny SRV1 ka subnet block karta hai. Yeh read-only confirmation hai; ab ek single, minimal change:</p>
<pre class="code"><span class="c">! Missing data-centre subnet jodo; route-map design waisa hi rakho</span>
R2(config)# ip prefix-list DC-NETS seq 15 permit 10.3.30.0/24
R2(config)# do show ip ospf database external 10.3.30.0 | include Link State ID
  Link State ID: 10.3.30.0 (External Network Number )</pre>
<p>Ab R1 <code>O E2 10.3.30.0/24 [110/20] via 10.0.12.2</code> dikhata hai. User ke point of view se dobara test karo.</p>

<h3>Fault 2: return path missing hai</h3>
<pre class="out">R1# ping 10.3.30.10 source GigabitEthernet0/1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.3.30.10, timeout is 2 seconds:
Packet sent with a source address of 10.1.10.1
.....
Success rate is 0 percent (0/5)
R3# show ip route 10.1.10.10
<span class="hl">% Subnet not in table</span></pre>
<p>Symptom badal gaya: forward route maujood hai, par R3 replies wapas nahi bhej sakta. R3 ka EIGRP neighbour R2 up hai, isliye check karo ki kya R2 10.1.10.0/24 ko EIGRP mein advertise karta hai.</p>
<pre class="out">R2# show ip eigrp topology 10.1.10.0/24
%Entry 10.1.10.0/24 not in topology table
R2# show run | section router eigrp
router eigrp 100
 network 10.0.23.0 0.0.0.3
<span class="hl"> redistribute ospf 1</span></pre>
<p>Classic EIGRP ko OSPF se aaye routes ke liye seed metric chahiye. Maintenance ne purani <code>default-metric</code> line hata di. Fix:</p>
<pre class="code">R2(config)# router eigrp 100
R2(config-router)# redistribute ospf 1 metric 100000 10 255 1 1500</pre>
<pre class="out">R3# show ip route eigrp | include 10.1.10
<span class="hl">D EX     10.1.10.0/24 [170/28416] via 10.0.23.1, 00:00:09, GigabitEthernet0/1</span></pre>
<p>Metric sahi baithta hai: 100,000 kbps ki minimum bandwidth se 10,000,000 / 100,000 = 100 aata hai; seed delay 10 (tens of microseconds) plus R3 ke GigabitEthernet interface ka 1 se 11; aur 256 x (100 + 11) = 28416. Branch LAN se ping ab succeed hota hai.</p>

<h3>Fault 3: ping chalta hai, HTTPS nahi</h3>
<p>Layer 3 dono directions mein sabit hai, isliye application ke liye top-down par switch karo.</p>
<pre class="out">R3# show ip interface GigabitEthernet0/2 | include access list
<span class="hl">  Outgoing access list is SRV-PROTECT</span>
  Inbound  access list is not set
R3# show access-lists SRV-PROTECT
Extended IP access list SRV-PROTECT
    10 permit icmp any any (10 matches)
    20 permit tcp any any eq 22
<span class="hl">    30 deny ip any any log (38 matches)</span>
R3# show logging | include SRV-PROTECT
%SEC-6-IPACCESSLOGP: list SRV-PROTECT denied tcp 10.1.10.10(51544) -&gt; 10.3.30.10(443), 1 packet</pre>
<p>Constraint kehta hai SRV1 protected rehna chahiye, isliye ACL hatana allowed nahi hai. Deny se pehle ek permit daalo:</p>
<pre class="code">R3(config)# ip access-list extended SRV-PROTECT
R3(config-ext-nacl)# 25 permit tcp any host 10.3.30.10 eq 443</pre>

<h3>Steps 7 aur 8: verify aur document</h3>
<p>PC1 se HR portal load hota hai; <code>show access-lists SRV-PROTECT</code> line 25 par matches dikhata hai. Phir check karo ki kuch aur nahi toota: dono neighbours up, R2 par <code>show ip route summary</code> baseline plus wapas aaye routes se match karta hai, aur doosri branches abhi bhi apni services tak pahunchti hain.</p>
<table class="cmp"><tr><th>#</th><th>Root cause</th><th>Fix</th></tr>
<tr><td>1</td><td>R2 par prefix list DC-NETS mein 10.3.30.0/24 ki jagah 10.3.40.0/24 tha</td><td><code>ip prefix-list DC-NETS seq 15 permit 10.3.30.0/24</code></td></tr>
<tr><td>2</td><td>OSPF bina seed metric ke EIGRP mein redistribute hua</td><td><code>redistribute ospf 1 metric 100000 10 255 1 1500</code></td></tr>
<tr><td>3</td><td>SRV-PROTECT ACL HTTPS allow nahi karta tha</td><td><code>25 permit tcp any host 10.3.30.10 eq 443</code></td></tr>
</table>

<div class="eg"><p><b>Worked example: teen faults ek jaise kyun dikhe.</b> Kisi bhi fix se pehle, teeno faults ne ek hi user symptom diya, "HR portal down". Fault 1 theek hone ke baad hi ping "net unreachable" se timeouts mein badla (fault 2), aur fault 2 ke baad hi ping succeed hua jabki HTTPS fail hua (fault 3). Har fix ne symptom badla, aur har naya symptom ek alag checklist ki taraf ishaara karta tha.</p></div>

<div class="warn"><p><b>Common galti.</b> Fault 1 ke baad ruk jaana kyunki "route ab wapas aa gaya". Har fix ke baad user ka test hamesha dobara chalao.</p></div>

<div class="exam"><p><b>Exam trap.</b> Gateway se "Destination net unreachable" ka matlab gateway ke paas route nahi hai; timeouts ka aam taur par matlab packet forward hua aur baad mein kuch (aksar return path ya bina ICMP reply wala ACL) fail hua. ACL log line ek precise jagah par deny sabit karti hai.</p></div>

<div class="scn"><h4>Woh maintenance jisne "sirf safai ki"</h4><p>Yeh ticket ek real pattern par bana hai: ek engineer ne border router par redistribution ki "safai" ki, lambi prefix list ko chhoti se replace kiya, aur ek <code>default-metric</code> line hata di jo unused lag rahi thi. Alag se, doosre engineer ne ek server ACL harden kiya. Har change apna jaldi wala test pass kar gaya. Saath milkar unhone ek application kaat di. Configuration change logger ne dono sessions dikhaye, jisne teen ghante ki talaash ko tees minute ke fix mein badal diya.</p><p><b>Seekh:</b> chhote, bina rishte wale changes milkar multi-fault outages banate hain; change logs aur method unhe suljhaate hain.</p></div>

<div class="iv"><p class="q">"Mujhe us samay ke baare mein batao jab aapne aisi problem theek ki jiske ek se zyada causes the."</p><p>INC-7302 jaisa structure use karo: symptom, pehla fault saboot ke saath kaise isolate kiya, fix ke baad symptom kaise badla, doosra aur teesra fault, constraints ka samman kaise kiya (static routes nahi, ACL rakho), end to end kaise verify kiya, aur kya document kiya taaki dobara na ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kuch bhi chhune se pehle ticket ko addresses, protocol aur constraints ke saath dohrao.</li>
<li>Gateway ke "net unreachable" ne missing route ki taraf ishaara kiya; routing-protocol checklist ne prefix-list error dhoondha.</li>
<li>Har fix ke baad re-test karo: badle symptom (timeouts, phir sirf HTTPS) ne agla fault dikhaya.</li>
<li>Constraints ka samman karne wale minimal fixes: ek prefix-list line, ek seed metric, ek ACL permit.</li>
<li>End to end verify karo, baseline se check karo ki kuch aur nahi badla, aur har root cause document karo.</li>
</ul></div>
`}};export{e as default};