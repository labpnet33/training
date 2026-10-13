var e={id:`neighbours`,h:{en:`Neighbour troubleshooting: AS, K values, subnet, passive, ACLs, timers and MTU`,hi:`Neighbour troubleshooting: AS, K values, subnet, passive, ACLs, timers aur MTU`},body:{en:`
<p>Two people can only have a phone conversation if they dial the same number, speak the same language, and can hear each other in both directions. If one person can hear but not speak, the call feels "connected" for a moment and then drops. EIGRP neighbours behave exactly like that. A missing neighbour is a wrong number or a wrong language; a <b>flapping</b> neighbour is almost always a one-way line. Sorting every ticket into "never forms" or "forms and drops" cuts your search in half.</p>

<h3>What must match, and what need not</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Neighbour requirements">
<rect x="20" y="14" width="290" height="200" rx="10" fill="#bbf7d0"/><text x="165" y="40" text-anchor="middle" class="svg-ink" font-size="14">Must match / be true</text>
<text x="40" y="70" class="svg-ink" font-size="13">AS number</text><text x="40" y="94" class="svg-ink" font-size="13">K values (metric weights)</text><text x="40" y="118" class="svg-ink" font-size="13">Primary IPv4 subnet</text><text x="40" y="142" class="svg-ink" font-size="13">Authentication (key ID + string)</text><text x="40" y="166" class="svg-ink" font-size="13">Not passive, EIGRP enabled</text><text x="40" y="190" class="svg-ink" font-size="13">Protocol 88 permitted both ways</text>
<rect x="330" y="14" width="290" height="200" rx="10" fill="#fde68a"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="14">Need not match</text>
<text x="350" y="70" class="svg-ink" font-size="13">Hello and hold timers</text><text x="350" y="94" class="svg-ink" font-size="13">Process name (named mode)</text><text x="350" y="118" class="svg-ink" font-size="13">Router ID (but keep unique)</text><text x="350" y="142" class="svg-ink" font-size="13">Interface MTU (not checked)</text><text x="350" y="166" class="svg-ink" font-size="13">Classic vs named mode</text><text x="350" y="190" class="svg-muted" font-size="12">...but timers and MTU can cause flaps</text>
</svg><p class="cap">The left side stops an adjacency; the right side does not, but two items can still make it unstable.</p></div>

<h3>Fault by fault: symptom, proof, fix</h3>
<table class="cmp"><tr><th>Fault</th><th>What you see</th><th>Prove it with</th></tr>
<tr><td>AS mismatch</td><td>No neighbour, no log message at all</td><td><code>show ip protocols</code> on both sides (AS in the header)</td></tr>
<tr><td>K-value mismatch</td><td><code>is down: K-value mismatch</code> logged repeatedly</td><td><code>show ip protocols | include weight</code></td></tr>
<tr><td>Different subnet</td><td><code>%DUAL-6-NBRINFO ... is blocked: not on common subnet</code></td><td><code>show ip interface brief</code>, check masks too</td></tr>
<tr><td>Passive interface</td><td>No neighbour; interface missing from EIGRP interfaces list</td><td><code>show ip protocols</code> (Passive Interface(s)), <code>show ip eigrp interfaces</code></td></tr>
<tr><td>No network statement</td><td>Same as passive, but the interface's prefix is not advertised either</td><td><code>show ip protocols</code> (Routing for Networks)</td></tr>
<tr><td>ACL blocks 224.0.0.10</td><td>No neighbour</td><td><code>show ip interface Gi0/0 | include access list</code>, ACL hit counts</td></tr>
<tr><td>ACL blocks unicast EIGRP</td><td>Neighbour up, Q Cnt grows, <code>retry limit exceeded</code></td><td>ACL entries: multicast permitted, unicast denied</td></tr>
<tr><td>Hello &gt; peer's hold time</td><td><code>is down: holding time expired</code> every cycle</td><td><code>show ip eigrp interfaces detail</code> on the sender</td></tr>
<tr><td>MTU problem on the path</td><td>Hellos fine, big Updates lost: <code>retry limit exceeded</code></td><td><code>ping</code> with <code>size 1500 df-bit</code></td></tr>
</table>

<h3>The ACL trap in detail</h3>
<p>Hellos are multicast to 224.0.0.10. But RTP retransmissions and acknowledgements are <b>unicast</b> between interface addresses, and on some links Updates are unicast too. An edge ACL that permits only the multicast address lets the neighbour come up, then starves it of reliable delivery.</p>
<pre class="code">ip access-list extended WAN-IN
 permit eigrp any host 224.0.0.10          <span class="c">! Hellos and multicast updates</span>
 permit eigrp 10.20.1.0 0.0.0.255 any      <span class="c">! unicast retransmits and ACKs</span>
 <span class="c">! ... rest of the policy</span>
interface GigabitEthernet0/0
 ip access-group WAN-IN in</pre>

<h3>Timers: they need not match, but they must make sense</h3>
<p>Each router advertises its own <b>hold time</b> in its Hellos. The neighbour uses that value. If someone sets <code>hello-interval 20</code> on SP2 but leaves the hold time at 15, HUB waits 15 seconds, hears nothing, and drops SP2; the next Hello brings it back. Always change hold time together with hello (a common rule is hold = 3 x hello).</p>
<pre class="out">HUB#show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">1   10.20.2.2               Gi0/1                     2 00:00:13    1   100  0  41</span>
HUB#
%DUAL-5-NBRCHANGE: EIGRP-IPv4 10: Neighbor 10.20.2.2 (GigabitEthernet0/1) is down: holding time expired</pre>

<div class="eg"><p><b>Worked example: MTU.</b> R1 and R2 connect through a provider circuit that only carries 1400-byte packets. Hellos (about 60 bytes) arrive, so the neighbour forms. The first full Update after a restart is built to the 1500-byte interface MTU and is dropped. R1 retransmits it 16 times, then logs <code>retry limit exceeded</code>, and the cycle repeats. <code>ping 10.9.12.2 size 1500 df-bit</code> fails while <code>size 1400</code> works. Fix the path MTU, or set <code>ip mtu 1400</code> on both ends so EIGRP builds smaller packets.</p></div>

<h3>Debugs, used carefully</h3>
<pre class="out">HUB#debug eigrp packets hello
EIGRP: Received HELLO on Gi0/0 - paklen 60 nbr 10.20.1.2
  AS 10, Flags 0x0:(NULL), Seq 0/0 interfaceQ 0/0 iidbQ un/rely 0/0
EIGRP: Sending HELLO on Gi0/0
  AS 10, Flags 0x0:(NULL), Seq 0/0 interfaceQ 0/0 iidbQ un/rely 0/0</pre>
<p>If Hellos are sent but never received, the problem is on the other router or in the path. If they are received and ignored, a mismatch or authentication problem is likely. Stop debugs with <code>undebug all</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Changing hello without hold; forgetting that a secondary address never forms neighbours (Hellos use the primary); adding a static <code>neighbor</code> statement on one side only, which disables multicast Hellos on that interface and breaks the adjacency; and assuming a matching MTU is required, as in OSPF.</p></div>

<div class="exam"><p><b>Exam trap.</b> EIGRP does <b>not</b> require matching hello or hold timers, and does <b>not</b> compare MTU. It <b>does</b> require the same AS, K values and primary subnet. A duplicate router ID does not stop an adjacency; it causes external routes from the other router to be ignored.</p></div>

<div class="scn"><h4>The firewall rule written from memory</h4><p>A new ACL on a branch edge router permitted "EIGRP to 224.0.0.10" and denied everything else from the WAN. The hub's log filled with the branch going up and down every 70 to 80 seconds with <code>retry limit exceeded</code>. <code>show ip eigrp neighbors</code> showed the branch with Q Cnt 4. The ACL's implicit deny was dropping unicast ACKs and retransmissions. Adding <code>permit eigrp 10.20.1.0 0.0.0.255 any</code> stabilised the adjacency.</p><p><b>Lesson:</b> a neighbour that forms and then drops with retry limit exceeded means one-way reliable delivery. Look for ACLs, one-sided authentication or MTU.</p></div>

<div class="iv"><p class="q">"An EIGRP neighbour keeps flapping with 'retry limit exceeded'. What does that tell you?"</p><p>Hellos work in both directions, but reliable packets from this router are not being acknowledged. After 16 retransmissions RTP resets the neighbour. Causes: an ACL permitting multicast but not unicast EIGRP, authentication configured on one side only, MTU loss of large Updates, or a unidirectional link. Show the Q Cnt column as evidence and name the checks for each cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify first: never forms (AS, K values, subnet, passive, ACL, authentication) or forms and drops (one-way reliable delivery, timers, MTU).</li>
<li>AS mismatch is silent; K-value and subnet mismatches are logged.</li>
<li>ACLs must permit EIGRP to 224.0.0.10 and unicast EIGRP between neighbours.</li>
<li>Timers need not match, but the hello must be shorter than the hold time the router advertises.</li>
<li>Non-zero Q Cnt plus retry limit exceeded is the fingerprint of one-way reliable delivery.</li>
</ul></div>
`,hi:`
<p>Do log phone par tabhi baat kar sakte hain jab dono same number dial karein, same bhaasha bolein, aur dono taraf se ek dusre ko sun sakein. Agar ek insaan sun sakta hai par bol nahi sakta, to call ek pal ke liye "connected" lagti hai aur phir kat jaati hai. EIGRP neighbours bilkul aise hi behave karte hain. Missing neighbour matlab galat number ya galat bhaasha; <b>flap</b> karta neighbour lagbhag hamesha one-way line hai. Har ticket ko "kabhi nahi banta" ya "banta hai aur girta hai" mein baantne se aapki search aadhi ho jaati hai.</p>

<h3>Kya match hona chahiye, aur kya nahi</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Neighbour requirements">
<rect x="20" y="14" width="290" height="200" rx="10" fill="#bbf7d0"/><text x="165" y="40" text-anchor="middle" class="svg-ink" font-size="14">Match / sach hona chahiye</text>
<text x="40" y="70" class="svg-ink" font-size="13">AS number</text><text x="40" y="94" class="svg-ink" font-size="13">K values (metric weights)</text><text x="40" y="118" class="svg-ink" font-size="13">Primary IPv4 subnet</text><text x="40" y="142" class="svg-ink" font-size="13">Authentication (key ID + string)</text><text x="40" y="166" class="svg-ink" font-size="13">Passive nahi, EIGRP enabled</text><text x="40" y="190" class="svg-ink" font-size="13">Protocol 88 dono taraf permit</text>
<rect x="330" y="14" width="290" height="200" rx="10" fill="#fde68a"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="14">Match zaroori nahi</text>
<text x="350" y="70" class="svg-ink" font-size="13">Hello aur hold timers</text><text x="350" y="94" class="svg-ink" font-size="13">Process name (named mode)</text><text x="350" y="118" class="svg-ink" font-size="13">Router ID (par unique rakho)</text><text x="350" y="142" class="svg-ink" font-size="13">Interface MTU (check nahi hota)</text><text x="350" y="166" class="svg-ink" font-size="13">Classic vs named mode</text><text x="350" y="190" class="svg-muted" font-size="12">...lekin timers aur MTU flap karwa sakte hain</text>
</svg><p class="cap">Left side adjacency rokti hai; right side nahi rokti, lekin do items use unstable bana sakte hain.</p></div>

<h3>Fault by fault: symptom, proof, fix</h3>
<table class="cmp"><tr><th>Fault</th><th>Kya dikhta hai</th><th>Kaise prove karo</th></tr>
<tr><td>AS mismatch</td><td>Koi neighbour nahi, koi log message bhi nahi</td><td>Dono taraf <code>show ip protocols</code> (header mein AS)</td></tr>
<tr><td>K-value mismatch</td><td>Baar baar <code>is down: K-value mismatch</code> log</td><td><code>show ip protocols | include weight</code></td></tr>
<tr><td>Alag subnet</td><td><code>%DUAL-6-NBRINFO ... is blocked: not on common subnet</code></td><td><code>show ip interface brief</code>, masks bhi check karo</td></tr>
<tr><td>Passive interface</td><td>Koi neighbour nahi; interface EIGRP interfaces list se gayab</td><td><code>show ip protocols</code> (Passive Interface(s)), <code>show ip eigrp interfaces</code></td></tr>
<tr><td>Network statement nahi</td><td>Passive jaisa, lekin interface ka prefix bhi advertise nahi hota</td><td><code>show ip protocols</code> (Routing for Networks)</td></tr>
<tr><td>ACL 224.0.0.10 block karta hai</td><td>Koi neighbour nahi</td><td><code>show ip interface Gi0/0 | include access list</code>, ACL hit counts</td></tr>
<tr><td>ACL unicast EIGRP block karta hai</td><td>Neighbour up, Q Cnt badhta hai, <code>retry limit exceeded</code></td><td>ACL entries: multicast permit, unicast deny</td></tr>
<tr><td>Hello &gt; peer ka hold time</td><td>Har cycle mein <code>is down: holding time expired</code></td><td>Sender par <code>show ip eigrp interfaces detail</code></td></tr>
<tr><td>Path par MTU problem</td><td>Hellos theek, bade Updates lost: <code>retry limit exceeded</code></td><td><code>size 1500 df-bit</code> ke saath <code>ping</code></td></tr>
</table>

<h3>ACL trap detail mein</h3>
<p>Hellos 224.0.0.10 par multicast hote hain. Lekin RTP retransmissions aur acknowledgements interface addresses ke beech <b>unicast</b> hote hain, aur kuch links par Updates bhi unicast hote hain. Jo edge ACL sirf multicast address permit karti hai, woh neighbour ko up hone deti hai, phir use reliable delivery se bhookha rakhti hai.</p>
<pre class="code">ip access-list extended WAN-IN
 permit eigrp any host 224.0.0.10          <span class="c">! Hellos aur multicast updates</span>
 permit eigrp 10.20.1.0 0.0.0.255 any      <span class="c">! unicast retransmits aur ACKs</span>
 <span class="c">! ... baaki policy</span>
interface GigabitEthernet0/0
 ip access-group WAN-IN in</pre>

<h3>Timers: match zaroori nahi, par samajhdaar hone chahiye</h3>
<p>Har router apne Hellos mein apna <b>hold time</b> advertise karta hai. Neighbour wahi value use karta hai. Agar koi SP2 par <code>hello-interval 20</code> set kar de lekin hold time 15 hi chhod de, to HUB 15 second wait karta hai, kuch nahi sunta, aur SP2 ko drop kar deta hai; agla Hello use wapas le aata hai. Hello ke saath hamesha hold time bhi badlo (common rule: hold = 3 x hello).</p>
<pre class="out">HUB#show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
<span class="hl">1   10.20.2.2               Gi0/1                     2 00:00:13    1   100  0  41</span>
HUB#
%DUAL-5-NBRCHANGE: EIGRP-IPv4 10: Neighbor 10.20.2.2 (GigabitEthernet0/1) is down: holding time expired</pre>

<div class="eg"><p><b>Worked example: MTU.</b> R1 aur R2 ek provider circuit se jude hain jo sirf 1400-byte packets le jaata hai. Hellos (lagbhag 60 bytes) pahunch jaate hain, isliye neighbour ban jaata hai. Restart ke baad pehla full Update 1500-byte interface MTU tak bana hota hai aur drop ho jaata hai. R1 use 16 baar retransmit karta hai, phir <code>retry limit exceeded</code> log karta hai, aur cycle repeat hoti hai. <code>ping 10.9.12.2 size 1500 df-bit</code> fail hota hai jabki <code>size 1400</code> chalta hai. Path MTU theek karo, ya dono ends par <code>ip mtu 1400</code> set karo taaki EIGRP chhote packets banaye.</p></div>

<h3>Debugs, dhyan se use karo</h3>
<pre class="out">HUB#debug eigrp packets hello
EIGRP: Received HELLO on Gi0/0 - paklen 60 nbr 10.20.1.2
  AS 10, Flags 0x0:(NULL), Seq 0/0 interfaceQ 0/0 iidbQ un/rely 0/0
EIGRP: Sending HELLO on Gi0/0
  AS 10, Flags 0x0:(NULL), Seq 0/0 interfaceQ 0/0 iidbQ un/rely 0/0</pre>
<p>Agar Hellos bheje ja rahe hain par kabhi receive nahi hote, to problem doosre router par ya path mein hai. Agar receive hokar ignore ho rahe hain, to mismatch ya authentication problem ki sambhavna hai. Debugs <code>undebug all</code> se band karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Hold ke bina hello badalna; bhool jaana ki secondary address kabhi neighbours nahi banata (Hellos primary use karte hain); sirf ek side static <code>neighbor</code> statement add karna, jo us interface par multicast Hellos band kar deta hai aur adjacency tod deta hai; aur OSPF ki tarah matching MTU ko zaroori maan lena.</p></div>

<div class="exam"><p><b>Exam trap.</b> EIGRP ko matching hello ya hold timers <b>nahi</b> chahiye, aur yeh MTU compare <b>nahi</b> karta. Isko same AS, K values aur primary subnet <b>chahiye</b>. Duplicate router ID adjacency nahi rokta; yeh doosre router ke external routes ignore karwa deta hai.</p></div>

<div class="scn"><h4>Yaad se likha gaya firewall rule</h4><p>Ek branch edge router par nayi ACL ne "EIGRP to 224.0.0.10" permit kiya aur WAN se baaki sab deny kiya. Hub ka log branch ke har 70 se 80 second mein <code>retry limit exceeded</code> ke saath up-down hone se bhar gaya. <code>show ip eigrp neighbors</code> mein branch Q Cnt 4 ke saath dikhi. ACL ka implicit deny unicast ACKs aur retransmissions drop kar raha tha. <code>permit eigrp 10.20.1.0 0.0.0.255 any</code> add karne se adjacency stable ho gayi.</p><p><b>Seekh:</b> jo neighbour banta hai aur retry limit exceeded ke saath girta hai, matlab one-way reliable delivery. ACLs, ek side authentication ya MTU dhoondho.</p></div>

<div class="iv"><p class="q">"Ek EIGRP neighbour 'retry limit exceeded' ke saath flap karta rehta hai. Isse aapko kya pata chalta hai?"</p><p>Hellos dono direction mein kaam kar rahe hain, lekin is router ke reliable packets ka acknowledgement nahi aa raha. 16 retransmissions ke baad RTP neighbour reset kar deta hai. Wajah: ACL jo multicast permit karti hai par unicast EIGRP nahi, sirf ek side configured authentication, bade Updates ka MTU loss, ya unidirectional link. Saboot ke roop mein Q Cnt column dikhao aur har wajah ke checks ke naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle classify karo: kabhi nahi banta (AS, K values, subnet, passive, ACL, authentication) ya banta hai aur girta hai (one-way reliable delivery, timers, MTU).</li>
<li>AS mismatch silent hota hai; K-value aur subnet mismatches log hote hain.</li>
<li>ACLs ko 224.0.0.10 par EIGRP aur neighbours ke beech unicast EIGRP dono permit karna chahiye.</li>
<li>Timers match hona zaroori nahi, lekin hello router ke advertise kiye hold time se chhota hona chahiye.</li>
<li>Non-zero Q Cnt plus retry limit exceeded one-way reliable delivery ka fingerprint hai.</li>
</ul></div>
`}};export{e as default};