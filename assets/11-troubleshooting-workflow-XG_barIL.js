var e={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow and the three labs`,hi:`Troubleshooting workflow aur teeno labs`},body:{en:`
<p>A good building security manager does not run around every floor when a visitor is stuck. She asks one question first: "Where exactly did the visitor stop?" At the lobby door, at the floor door, in the mailroom, or at the CEO's assistant? Once she knows the checkpoint, she reads that checkpoint's log. This chapter gives you the same discipline for AAA, ACLs, uRPF and CoPP, then walks the three labs of this module.</p>

<h3>The workflow</h3>
<ol>
<li><b>Define the flow.</b> Source, destination, protocol, port, and whether it passes <b>through</b> the router or goes <b>to</b> the router. Transit flows meet ACLs and uRPF; router-bound flows also meet CoPP, VTY filters and AAA.</li>
<li><b>Ask what changed.</b> Security pushes, route changes that create asymmetry, clock resets that deactivate time-ranges, moved servers.</li>
<li><b>Walk the checkpoints in order</b> and read each one's counter, as in the table below. Generate the traffic, read twice, compare.</li>
<li><b>Fix the narrowest thing</b>: a line, a subnet, a mode, a rate. Never remove the feature as the fix.</li>
<li><b>Verify with the same counter</b> and with the user's real traffic.</li>
</ol>
<table class="cmp"><tr><th>Checkpoint</th><th>Evidence</th><th>Classic fault</th></tr>
<tr><td>Input / output ACL</td><td><code>show ip access-lists</code>, <code>show ipv6 access-list</code>, <code>show ip interface</code></td><td>Order, wildcard, direction, implicit deny, missing ND permits, inactive time-range</td></tr>
<tr><td>uRPF</td><td><code>show ip interface</code> verification drops, <code>show ip traffic</code>, <code>show ip cef SOURCE</code></td><td>Strict mode on an asymmetric link, allow-default misunderstanding</td></tr>
<tr><td>CoPP</td><td><code>show policy-map control-plane</code>, <code>show ip access-lists</code></td><td>Traffic in class-default, policer too tight, one-direction BGP</td></tr>
<tr><td>VTY</td><td><code>show line</code>, <code>show running-config | section vty</code></td><td>access-class, <code>transport input</code></td></tr>
<tr><td>AAA</td><td><code>test aaa</code>, <code>show aaa servers</code>, <code>debug aaa authentication</code>, <code>debug tacacs</code> / <code>debug radius</code></td><td>Key, source interface, ERROR versus FAIL, missing exec authorization</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Workflow">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">Define</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="12">the flow</text>
<rect x="135" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="190" y="76" text-anchor="middle" class="svg-ink" font-size="13">What</text><text x="190" y="94" text-anchor="middle" class="svg-muted" font-size="12">changed?</text>
<rect x="260" y="50" width="120" height="60" rx="8" fill="#bae6fd"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">Checkpoints</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="12">read counters</text>
<rect x="395" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="450" y="76" text-anchor="middle" class="svg-ink" font-size="13">Narrow</text><text x="450" y="94" text-anchor="middle" class="svg-muted" font-size="12">fix</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="76" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="575" y="94" text-anchor="middle" class="svg-muted" font-size="12">same counter</text>
<line x1="120" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="505" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Evidence first, the smallest possible fix, same counter to verify</text>
</svg><p class="cap">Five steps that work for every feature in this module.</p></div>

<h3>Lab walk-through 1: Stop spoofed sources with unicast RPF</h3>
<p>Flow: forged packets from PC-CUST (source 203.0.113.50) to INET 198.51.100.10, plus real traffic both ways. Checkpoints: uRPF on EDGE Gi0/1 and Gi0/2. Strict on Gi0/1 (<code>reachable-via rx</code>) drops the forged source; <code>show ip interface Gi0/1</code> and <code>show ip traffic</code> prove it with 5 verification drops. On Gi0/2 strict mode would drop INET's real packets, because EDGE routes 198.51.100.0/24 back via ISP-A on Gi0/0, so you use loose mode (<code>reachable-via any</code>) without allow-default: 198.51.100.10 passes, the unroutable 192.0.2.66 is dropped.</p>

<h3>Lab walk-through 2: Keep guests away from the servers with an IPv6 ACL</h3>
<p>Flow: PC-GUEST 2001:db8:20::10 to SRV6 2001:db8:99::10. Checkpoint: the inbound filter on R1 Gi0/1. Build GUEST-IN with a deny for the server prefix and a final <code>permit ipv6 any any</code>, apply it with <code>ipv6 traffic-filter GUEST-IN in</code>, then insert <code>sequence 5 permit icmp 2001:db8:20::/64 host 2001:db8:99::10 echo-request</code>. <code>show ipv6 access-list GUEST-IN</code> must show matches on sequence 5 after a ping and on the deny after the UDP 445 flow. Staff still reach SRV6 because the filter sits only on the guest interface.</p>

<h3>Lab walk-through 3: CoPP went live and the router went dark</h3>
<p><b>Ticket:</b> after the night's CoPP change on R1, the OSPF adjacency with R2 is gone, users on 10.1.1.0/24 cannot reach 172.20.0.0/24, and the NOC cannot SSH from MGMT 10.99.0.10. Telnet must stay blocked, and CoPP must stay.</p>
<p><b>Step 1, evidence.</b> Both broken flows go <b>to</b> the router, so CoPP is the prime suspect.</p>
<pre class="out">R1# show policy-map control-plane | include Class-map|packets|drop
    Class-map: CP-ROUTING (match-all)
      <span class="hl">0 packets, 0 bytes</span>
    Class-map: CP-MGMT (match-all)
      <span class="hl">0 packets, 0 bytes</span>
    Class-map: CP-ICMP (match-any)
      12 packets, 1008 bytes
    Class-map: class-default (match-any)
      <span class="hl">97 packets, 8120 bytes</span>
      drop

R1# show ip access-lists
Extended IP access list ACL-MGMT
    10 permit tcp <span class="hl">10.99.1.0</span> 0.0.0.255 any eq 22
Extended IP access list ACL-ROUTING
    10 permit tcp any any eq bgp
    20 permit tcp any eq bgp any</pre>
<p>ACL-ROUTING lists only BGP; OSPF (protocol 89) matches nothing and lands in <b>class-default</b>, which drops. That is the answer to the lab's first question. ACL-MGMT permits 10.99.<b>1</b>.0/24, but the NOC is on 10.99.<b>0</b>.0/24, so SSH also falls to class-default.</p>
<p><b>Step 2, narrow fixes.</b></p>
<pre class="code">R1(config)# ip access-list extended ACL-ROUTING
R1(config-ext-nacl)# permit ospf any any
R1(config-ext-nacl)# ip access-list extended ACL-MGMT
R1(config-ext-nacl)# no permit tcp 10.99.1.0 0.0.0.255 any eq 22
R1(config-ext-nacl)# permit tcp 10.99.0.0 0.0.0.255 any eq 22</pre>
<p>The class-maps reference the ACLs by name, so they pick up the change immediately; the policy stays attached.</p>
<p><b>Step 3, verify.</b> Within the OSPF dead interval the adjacency returns (<code>show ip ospf neighbor</code> shows FULL), <code>show ip route 172.20.0.0</code> shows an O route, PC-USER reaches SRV, and <code>ssh -l noc 10.99.0.1</code> from MGMT works. Telnet from anywhere still matches no class and is dropped in class-default, and PC-USER cannot SSH because it is not in 10.99.0.0/24. Run <code>show policy-map control-plane</code> again: CP-ROUTING and CP-MGMT now count packets.</p>

<div class="eg"><p><b>Worked example: guessing versus evidence.</b> A guesser would raise the CP-ROUTING policer, remove class-default's <code>drop</code>, or delete CoPP. None of that was needed: the counters showed zero packets in the routing class, which proves a classification gap, not a rate problem. Two ACL lines fixed both symptoms and kept Telnet blocked.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once so you never learn which one fixed it. Troubleshooting AAA when SSH never reaches the VTY because CoPP drops it (no AAA debug output at all is the hint). Forgetting to re-test the things that must stay blocked, such as Telnet.</p></div>

<div class="exam"><p><b>Exam trap.</b> In a troubleshooting simulation, the fix that removes a security feature is always marked wrong when the ticket says to keep it. Prefer the answer that corrects one line of classification, one mode, or one address.</p></div>

<div class="scn"><h4>SSH timeouts that were not AAA</h4><p>The NOC reported "TACACS+ is broken" because SSH to a core router timed out. The AAA engineer found nothing in <code>debug aaa authentication</code>: no request at all. That silence was the clue. <code>show policy-map control-plane</code> showed the NOC's SSH packets in class-default, dropped, because a new jump host used a subnet missing from the CoPP management ACL. The fix was one ACL line; TACACS+ had never been involved.</p><p><b>Lesson:</b> if the checkpoint you are debugging sees nothing, the packet died at an earlier one.</p></div>

<div class="iv"><p class="q">"OSPF and SSH to a router broke right after a CoPP change. Walk me through your troubleshooting."</p><p>Strong answer: both flows terminate on the router, so start with <code>show policy-map control-plane</code>, generate traffic and see which class counts it. If the routing and management classes show zero and class-default rises, inspect the ACLs behind the classes with <code>show ip access-lists</code>: here OSPF was missing and the management subnet was wrong. Fix those lines, keep the policy, verify the adjacency, routes and SSH, and confirm Telnet is still dropped.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Define the flow, ask what changed, walk the checkpoints in packet order, fix narrowly, verify with the same counter.</li>
<li>Transit flows meet ACLs and uRPF; router-bound flows also meet CoPP, VTY filters and AAA.</li>
<li>uRPF lab: strict on the customer, loose on the asymmetric ISP-B link.</li>
<li>IPv6 lab: GUEST-IN inbound on Gi0/1 with sequence 5 as the ping exception.</li>
<li>CoPP lab: OSPF was in class-default and the management ACL had 10.99.1.0 instead of 10.99.0.0.</li>
</ul></div>
`,hi:`
<p>Achhi building security manager visitor atakne par har floor par nahi daudti. Woh pehle ek sawaal poochhti hai: "Visitor theek kahan ruka?" Lobby door par, floor door par, mailroom mein, ya CEO ki assistant ke paas? Checkpoint pata chalte hi woh us checkpoint ka log padhti hai. Yeh chapter aapko AAA, ACLs, uRPF aur CoPP ke liye wahi discipline deta hai, phir is module ki teeno labs chalta hai.</p>

<h3>Workflow</h3>
<ol>
<li><b>Flow define karo.</b> Source, destination, protocol, port, aur yeh ki woh router ke <b>through</b> jaata hai ya router <b>ko</b> jaata hai. Transit flows ACLs aur uRPF se milte hain; router-bound flows CoPP, VTY filters aur AAA se bhi milte hain.</li>
<li><b>Poochho kya badla.</b> Security pushes, route changes jo asymmetry banayein, clock resets jo time-ranges inactive karein, shift hue servers.</li>
<li><b>Checkpoints ko kram se chalo</b> aur har ek ka counter padho, neeche ki table jaisa. Traffic generate karo, do baar padho, compare karo.</li>
<li><b>Sabse sankri cheez theek karo</b>: ek line, ek subnet, ek mode, ek rate. Fix ke naam par feature kabhi mat hatao.</li>
<li><b>Usi counter se verify karo</b> aur user ke asli traffic se.</li>
</ol>
<table class="cmp"><tr><th>Checkpoint</th><th>Saboot</th><th>Classic fault</th></tr>
<tr><td>Input / output ACL</td><td><code>show ip access-lists</code>, <code>show ipv6 access-list</code>, <code>show ip interface</code></td><td>Order, wildcard, direction, implicit deny, missing ND permits, inactive time-range</td></tr>
<tr><td>uRPF</td><td><code>show ip interface</code> verification drops, <code>show ip traffic</code>, <code>show ip cef SOURCE</code></td><td>Asymmetric link par strict mode, allow-default ki galat samajh</td></tr>
<tr><td>CoPP</td><td><code>show policy-map control-plane</code>, <code>show ip access-lists</code></td><td>Class-default mein traffic, bahut tight policer, ek-direction BGP</td></tr>
<tr><td>VTY</td><td><code>show line</code>, <code>show running-config | section vty</code></td><td>access-class, <code>transport input</code></td></tr>
<tr><td>AAA</td><td><code>test aaa</code>, <code>show aaa servers</code>, <code>debug aaa authentication</code>, <code>debug tacacs</code> / <code>debug radius</code></td><td>Key, source interface, ERROR vs FAIL, missing exec authorization</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Workflow">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">Flow</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="12">define karo</text>
<rect x="135" y="50" width="110" height="60" rx="8" fill="#fde68a"/><text x="190" y="76" text-anchor="middle" class="svg-ink" font-size="13">Kya</text><text x="190" y="94" text-anchor="middle" class="svg-muted" font-size="12">badla?</text>
<rect x="260" y="50" width="120" height="60" rx="8" fill="#bae6fd"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">Checkpoints</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="12">counters padho</text>
<rect x="395" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="450" y="76" text-anchor="middle" class="svg-ink" font-size="13">Sankra</text><text x="450" y="94" text-anchor="middle" class="svg-muted" font-size="12">fix</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="76" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="575" y="94" text-anchor="middle" class="svg-muted" font-size="12">wahi counter</text>
<line x1="120" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="245" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="380" y1="80" x2="395" y2="80" stroke="#64748b" stroke-width="2"/><line x1="505" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Pehle saboot, sabse chhota fix, verify ke liye wahi counter</text>
</svg><p class="cap">Paanch steps jo is module ke har feature ke liye kaam karte hain.</p></div>

<h3>Lab walk-through 1: Unicast RPF se spoofed sources roko</h3>
<p>Flow: PC-CUST se INET 198.51.100.10 tak jaali packets (source 203.0.113.50), plus dono taraf asli traffic. Checkpoints: EDGE Gi0/1 aur Gi0/2 par uRPF. Gi0/1 par strict (<code>reachable-via rx</code>) jaali source ko drop karta hai; <code>show ip interface Gi0/1</code> aur <code>show ip traffic</code> 5 verification drops se ise sabit karte hain. Gi0/2 par strict mode INET ke asli packets drop kar deta, kyunki EDGE 198.51.100.0/24 ko Gi0/0 par ISP-A se wapas route karta hai, isliye aap bina allow-default ke loose mode (<code>reachable-via any</code>) use karte ho: 198.51.100.10 pass hota hai, bina route wala 192.0.2.66 drop hota hai.</p>

<h3>Lab walk-through 2: IPv6 ACL se guests ko servers se door rakho</h3>
<p>Flow: PC-GUEST 2001:db8:20::10 se SRV6 2001:db8:99::10. Checkpoint: R1 Gi0/1 par inbound filter. Server prefix ke deny aur aakhri <code>permit ipv6 any any</code> ke saath GUEST-IN banao, use <code>ipv6 traffic-filter GUEST-IN in</code> se lagao, phir <code>sequence 5 permit icmp 2001:db8:20::/64 host 2001:db8:99::10 echo-request</code> insert karo. Ping ke baad sequence 5 par aur UDP 445 flow ke baad deny par <code>show ipv6 access-list GUEST-IN</code> matches dikhaye. Staff abhi bhi SRV6 tak pahunchta hai kyunki filter sirf guest interface par hai.</p>

<h3>Lab walk-through 3: CoPP live hua aur router andhera ho gaya</h3>
<p><b>Ticket:</b> R1 par raat ke CoPP change ke baad R2 ke saath OSPF adjacency gayab hai, 10.1.1.0/24 ke users 172.20.0.0/24 tak nahi pahunch paa rahe, aur NOC MGMT 10.99.0.10 se SSH nahi kar pa raha. Telnet blocked rehna chahiye, aur CoPP rehna chahiye.</p>
<p><b>Step 1, saboot.</b> Dono toote flows router <b>ko</b> jaate hain, isliye CoPP mukhya shak hai.</p>
<pre class="out">R1# show policy-map control-plane | include Class-map|packets|drop
    Class-map: CP-ROUTING (match-all)
      <span class="hl">0 packets, 0 bytes</span>
    Class-map: CP-MGMT (match-all)
      <span class="hl">0 packets, 0 bytes</span>
    Class-map: CP-ICMP (match-any)
      12 packets, 1008 bytes
    Class-map: class-default (match-any)
      <span class="hl">97 packets, 8120 bytes</span>
      drop

R1# show ip access-lists
Extended IP access list ACL-MGMT
    10 permit tcp <span class="hl">10.99.1.0</span> 0.0.0.255 any eq 22
Extended IP access list ACL-ROUTING
    10 permit tcp any any eq bgp
    20 permit tcp any eq bgp any</pre>
<p>ACL-ROUTING mein sirf BGP hai; OSPF (protocol 89) kisi se match nahi karta aur <b>class-default</b> mein girta hai, jo drop karti hai. Yahi lab ke pehle sawaal ka jawab hai. ACL-MGMT 10.99.<b>1</b>.0/24 permit karti hai, lekin NOC 10.99.<b>0</b>.0/24 par hai, isliye SSH bhi class-default mein girta hai.</p>
<p><b>Step 2, sankre fixes.</b></p>
<pre class="code">R1(config)# ip access-list extended ACL-ROUTING
R1(config-ext-nacl)# permit ospf any any
R1(config-ext-nacl)# ip access-list extended ACL-MGMT
R1(config-ext-nacl)# no permit tcp 10.99.1.0 0.0.0.255 any eq 22
R1(config-ext-nacl)# permit tcp 10.99.0.0 0.0.0.255 any eq 22</pre>
<p>Class-maps ACLs ko naam se reference karte hain, isliye change turant utha lete hain; policy lagi rehti hai.</p>
<p><b>Step 3, verify.</b> OSPF dead interval ke andar adjacency wapas aati hai (<code>show ip ospf neighbor</code> FULL dikhata hai), <code>show ip route 172.20.0.0</code> ek O route dikhata hai, PC-USER SRV tak pahunchta hai, aur MGMT se <code>ssh -l noc 10.99.0.1</code> chalta hai. Kahin se bhi Telnet abhi bhi kisi class se match nahi karta aur class-default mein drop hota hai, aur PC-USER SSH nahi kar sakta kyunki woh 10.99.0.0/24 mein nahi hai. <code>show policy-map control-plane</code> phir chalao: CP-ROUTING aur CP-MGMT ab packets gin rahi hain.</p>

<div class="eg"><p><b>Worked example: andaza vs saboot.</b> Andaza lagane wala CP-ROUTING policer badhata, class-default ka <code>drop</code> hatata, ya CoPP delete karta. Inmein se kuch nahi chahiye tha: counters ne routing class mein zero packets dikhaye, jo classification gap sabit karta hai, rate problem nahi. Do ACL lines ne dono lakshan theek kiye aur Telnet blocked rakha.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath kai cheezein badalna, jisse kabhi pata nahi chalta ki kisne theek kiya. AAA troubleshoot karna jab SSH VTY tak pahunchta hi nahi kyunki CoPP use drop karta hai (AAA debug output ka bilkul na hona hint hai). Jo cheezein blocked rehni chahiye, jaise Telnet, unhe dobara test karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Troubleshooting simulation mein, jab ticket feature rakhne ko kahe, to security feature hatane wala fix hamesha galat mana jaata hai. Us jawab ko prefer karo jo classification ki ek line, ek mode, ya ek address theek kare.</p></div>

<div class="scn"><h4>SSH timeouts jo AAA nahi the</h4><p>NOC ne report kiya "TACACS+ toota hai" kyunki core router par SSH time out ho raha tha. AAA engineer ko <code>debug aaa authentication</code> mein kuch nahi mila: koi request hi nahi. Wahi chuppi clue thi. <code>show policy-map control-plane</code> ne NOC ke SSH packets class-default mein, drop hote dikhaye, kyunki ek naya jump host aise subnet par tha jo CoPP management ACL mein missing tha. Fix ek ACL line thi; TACACS+ kabhi shamil hi nahi tha.</p><p><b>Seekh:</b> agar jis checkpoint ko aap debug kar rahe ho use kuch nahi dikhta, to packet pehle wale checkpoint par mar gaya.</p></div>

<div class="iv"><p class="q">"CoPP change ke theek baad router ka OSPF aur SSH toot gaya. Apni troubleshooting samjhao."</p><p>Strong answer: dono flows router par khatam hote hain, isliye <code>show policy-map control-plane</code> se shuru karo, traffic generate karo aur dekho kaunsi class use ginti hai. Agar routing aur management classes zero dikhayein aur class-default badhe, to <code>show ip access-lists</code> se classes ke peeche ki ACLs dekho: yahan OSPF missing tha aur management subnet galat tha. Woh lines theek karo, policy rakho, adjacency, routes aur SSH verify karo, aur confirm karo ki Telnet abhi bhi drop hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow define karo, poochho kya badla, packet ke kram mein checkpoints chalo, sankra fix karo, usi counter se verify karo.</li>
<li>Transit flows ACLs aur uRPF se milte hain; router-bound flows CoPP, VTY filters aur AAA se bhi.</li>
<li>uRPF lab: customer par strict, asymmetric ISP-B link par loose.</li>
<li>IPv6 lab: Gi0/1 par inbound GUEST-IN, ping exception ke roop mein sequence 5.</li>
<li>CoPP lab: OSPF class-default mein tha aur management ACL mein 10.99.0.0 ki jagah 10.99.1.0 tha.</li>
</ul></div>
`}};export{e as default};