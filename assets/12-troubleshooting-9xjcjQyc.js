var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking the labs and NOC INC-5530`,hi:`Troubleshooting workflow: labs aur NOC INC-5530 ka walk-through`},body:{en:`
<p>A good doctor never jumps to surgery. She checks pulse and breathing first, then blood tests, then scans, and only then treats. Each step either finds the problem or rules out a whole layer. BGP troubleshooting needs the same discipline, because BGP sits on top of everything else: interfaces, IGP, TCP, policy and the routing table. Skip a layer and you will "fix" the wrong thing.</p>

<h3>The six-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Six-step BGP troubleshooting workflow">
<rect x="20" y="15" width="290" height="44" rx="8" fill="#e2e8f0"/><text x="165" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. Session state</text><text x="165" y="51" text-anchor="middle" class="svg-muted" font-size="12">show ip bgp summary</text>
<rect x="330" y="15" width="290" height="44" rx="8" fill="#bae6fd"/><text x="475" y="35" text-anchor="middle" class="svg-ink" font-size="13">2. Transport and reachability</text><text x="475" y="51" text-anchor="middle" class="svg-muted" font-size="12">ping PEER source Lo0, logs</text>
<rect x="20" y="95" width="290" height="44" rx="8" fill="#ddd6fe"/><text x="165" y="115" text-anchor="middle" class="svg-ink" font-size="13">3. Routes received and accepted</text><text x="165" y="131" text-anchor="middle" class="svg-muted" font-size="12">neighbors X routes, filters</text>
<rect x="330" y="95" width="290" height="44" rx="8" fill="#fde68a"/><text x="475" y="115" text-anchor="middle" class="svg-ink" font-size="13">4. Valid and best?</text><text x="475" y="131" text-anchor="middle" class="svg-muted" font-size="12">show ip bgp PREFIX</text>
<rect x="20" y="175" width="290" height="44" rx="8" fill="#fed7aa"/><text x="165" y="195" text-anchor="middle" class="svg-ink" font-size="13">5. In the routing table?</text><text x="165" y="211" text-anchor="middle" class="svg-muted" font-size="12">show ip route PREFIX, rib-failure</text>
<rect x="330" y="175" width="290" height="44" rx="8" fill="#bbf7d0"/><text x="475" y="195" text-anchor="middle" class="svg-ink" font-size="13">6. Return path advertised?</text><text x="475" y="211" text-anchor="middle" class="svg-muted" font-size="12">neighbors X advertised-routes</text>
<line x1="310" y1="37" x2="330" y2="37" stroke="#64748b" stroke-width="2"/><line x1="475" y1="59" x2="165" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="310" y1="117" x2="330" y2="117" stroke="#64748b" stroke-width="2"/><line x1="475" y1="139" x2="165" y2="175" stroke="#64748b" stroke-width="1.5"/><line x1="310" y1="197" x2="330" y2="197" stroke="#64748b" stroke-width="2"/>
<text x="320" y="250" text-anchor="middle" class="svg-accent" font-size="12">Stop at the first failing step, fix it, then continue down the list</text>
</svg><p class="cap">The same order works for internal and external BGP problems.</p></div>

<table class="cmp"><tr><th>Step</th><th>Look for</th><th>Typical root causes</th></tr>
<tr><td>1 Session</td><td>Idle (Admin), Idle (PfxCt), Idle, Active, or a prefix count</td><td>Shutdown, max-prefix, wrong remote-as, TCP failure</td></tr>
<tr><td>2 Transport</td><td>Ping from the update-source; BADAUTH and NOTIFICATION logs</td><td>Missing IGP route to loopback, ACL on TCP 179, MD5, TTL/GTSM, multihop</td></tr>
<tr><td>3 Received</td><td>PfxRcd, <code>routes</code>, <code>received-routes</code></td><td>Inbound filter, peer not advertising, family not activated</td></tr>
<tr><td>4 Best</td><td><i>inaccessible</i>, missing <code>&gt;</code>, which attribute decided</td><td>Next hop not reachable (next-hop-self), policy steering elsewhere</td></tr>
<tr><td>5 RIB</td><td><code>r</code> RIB-failure, AD, recursive next hop</td><td>IGP or static with lower AD, route recursion loop</td></tr>
<tr><td>6 Return</td><td>What the far side receives from you</td><td>Outbound filter, split horizon, missing network statement</td></tr>
</table>

<h3>Walking NOC INC-5530</h3>
<p><b>The ticket.</b> P2, opened 02:14 IST. ALRT-88121: EDGE1 peer 172.30.1.1 not Established. ALRT-88122: EDGE2 peer 172.30.2.1 not Established. ALRT-88130: 10.80.0.0/16 and 10.81.0.0/16 absent from CORE. Change CHG-2291 edited EDGE1 and EDGE2 during partner maintenance and was closed as "successful". PC-FIN (172.16.0.0/24) cannot reach the payment gateway 10.80.0.1. PTNR (AS 64800) belongs to the partner and must not be changed. AS 65000 has no IGP here: loopbacks are reached with static routes.</p>

<p><b>Step 1 on EDGE2.</b></p>
<pre class="out">EDGE2# show ip bgp summary | begin Neighbor
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.1.1      4        65000      40      41        3    0    0 00:35:10        0
10.255.1.3      4        65000      39      42        3    0    0 00:35:02        1
<span class="hl">172.30.2.1      4        64800       0       0        1    0    0 00:34:58 Idle (Admin)</span></pre>
<p>Idle (Admin) means a <code>neighbor 172.30.2.1 shutdown</code> left behind by the change. Fix: <code>no neighbor 172.30.2.1 shutdown</code>.</p>

<p><b>Step 1 and 2 on EDGE1.</b> The session is Idle and the log shows <code>NOTIFICATION ... 2/2 (peer in wrong AS) 2 bytes FD20</code>. 0xFD20 = 64800, the partner's real AS; EDGE1 has <code>remote-as 64880</code>. Fix: <code>neighbor 172.30.1.1 remote-as 64800</code>. Both sessions now show prefix counts.</p>

<p><b>Step 4 on CORE.</b> Both sessions are up, yet ALRT-88130 is only half solved:</p>
<pre class="out">CORE# show ip bgp 10.80.0.0
BGP routing table entry for 10.80.0.0/16, version 11
Paths: (2 available, best #2, table default)
  Not advertised to any peer
  Refresh Epoch 1
  64800
<span class="hl">    172.30.1.1 (inaccessible) from 10.255.1.1 (10.255.1.1)</span>
      Origin IGP, metric 0, localpref 100, internal
  Refresh Epoch 1
  64800
    10.255.1.2 from 10.255.1.2 (10.255.1.2)
      Origin IGP, metric 0, localpref 100, valid, internal, best</pre>
<p>The path from EDGE1 carries the partner's address as next hop, and CORE has only static routes to the loopbacks. Compare the two edge configurations: EDGE2 has <code>neighbor 10.255.1.3 next-hop-self</code>, EDGE1 does not. Fix on EDGE1: <code>neighbor 10.255.1.3 next-hop-self</code>. CORE now holds two valid paths per partner prefix (EDGE1 wins on router ID, chapter 10).</p>

<p><b>Steps 5 and 6.</b> <code>show ip route 10.80.0.0</code> on CORE shows <i>bgp 65000, distance 200</i> via 10.255.1.1. The return path: CORE originates 172.16.0.0/24 with a network statement; both edges pass it to AS 64800, which you confirm with <code>show ip bgp neighbors 172.30.1.1 advertised-routes</code> on EDGE1. Then PC-FIN proves the service:</p>
<pre class="out">PC-FIN&gt; ping 10.80.0.1
<span class="hl">84 bytes from 10.80.0.1 icmp_seq=1 ttl=253 time=2.114 ms</span>
84 bytes from 10.80.0.1 icmp_seq=2 ttl=253 time=1.870 ms</pre>
<p><b>Evidence before closing.</b> Capture <code>show ip bgp summary</code> on CORE, EDGE1 and EDGE2: every neighbor must show a number in State/PfxRcd, not Idle or Active. Attach it to the ticket and reopen CHG-2291 with the three root causes, because a change closed as "successful" caused this outage.</p>

<h3>The other labs as troubleshooting patterns</h3>
<table class="cmp"><tr><th>Lab</th><th>Symptom</th><th>Step that finds it</th><th>Fix</th></tr>
<tr><td>iBGP full mesh over OSPF</td><td>CORE: no best path, next hop 100.64.0.1 inaccessible; BRANCH has no routes</td><td>4, then 3</td><td>next-hop-self on EDGE; sessions from BRANCH to EDGE and CORE on loopbacks</td></tr>
<tr><td>BGP session hardening</td><td>Session stuck, <code>Invalid MD5 digest</code> on both sides</td><td>2</td><td>Agreed key on PEER-B, then GTSM both ends, max-prefix, timers and reset</td></tr>
<tr><td>Weight and local preference</td><td>Policy configured but <code>show ip bgp</code> unchanged</td><td>3</td><td><code>clear ip bgp X soft in</code>; permit sequence 20 so other prefixes survive</td></tr>
<tr><td>NOC INC-5530</td><td>Two partner sessions down, one path inaccessible</td><td>1, 2, 4</td><td>no shutdown, remote-as 64800, next-hop-self on EDGE1</td></tr>
</table>

<div class="eg"><p><b>Worked example: using debug safely.</b> In production, never run a bare <code>debug ip bgp updates</code> on a router with a full table. Limit it: <code>access-list 99 permit 10.80.0.0 0.0.255.255</code>, then <code>debug ip bgp 10.255.1.1 updates 99</code>, watch the output for one refresh (<code>clear ip bgp 10.255.1.1 soft in</code>), and stop with <code>undebug all</code>. Prefer show commands first; they cost nothing.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Asking the partner to check their side before reading your own states and logs. Fixing one alarm and closing the ticket while the other path is still inaccessible. Using <code>clear ip bgp *</code> as a troubleshooting step. Forgetting the return path, so the forward path is perfect and pings still fail.</p></div>

<div class="exam"><p><b>Exam traps.</b> Scenario questions give you three outputs and four plausible fixes. Pick the step that fails first: a session problem makes every routing answer wrong, and an <i>inaccessible</i> next hop makes every policy answer wrong. Idle (Admin), NOTIFICATION 2/2 and <i>inaccessible</i> each point to exactly one fix.</p></div>

<div class="scn"><h4>The payment gateway that was down twice</h4><p>A night-shift engineer restored only the EDGE2 partner session during INC-5530 because it was the first alarm in the queue. Payments worked, so the ticket was closed. Two days later EDGE2's provider link failed, CORE's only other path was the inaccessible one via EDGE1, and payments stopped again. The postmortem added a rule: every alarm on a ticket must be closed with evidence, and <code>show ip bgp PREFIX</code> on CORE must show two valid paths.</p><p><b>Lesson:</b> redundancy you have not verified is not redundancy.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot 'BGP prefix missing' in an enterprise."</p><p>Give the layered order: session state and logs; transport (update-source ping, ACL, MD5, TTL); received and accepted routes (filters, soft refresh, activation); valid and best (<i>inaccessible</i>, attributes); routing table (AD, RIB-failure, recursion); return path (advertised-routes, outbound filters). Use a real example such as INC-5530 and name the command at each step. Interviewers value that you check your own side first and prove the fix with evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: session, transport, received, best, RIB, return path.</li>
<li>Idle (Admin) = shutdown; NOTIFICATION 2/2 = wrong AS; <i>inaccessible</i> = next-hop problem.</li>
<li>Compare a working router with a broken one; the missing line is often obvious.</li>
<li>Always check the return path and prove the fix end to end.</li>
<li>Close tickets with evidence from every affected router.</li>
</ul></div>
`,hi:`
<p>Achhi doctor kabhi seedha surgery par nahi koodti. Woh pehle pulse aur saans check karti hai, phir blood tests, phir scans, aur tabhi ilaaj karti hai. Har step ya to problem dhoondh leta hai ya poori ek layer ko rule out kar deta hai. BGP troubleshooting ko bhi yahi discipline chahiye, kyunki BGP baaki sab ke upar baitha hai: interfaces, IGP, TCP, policy aur routing table. Ek layer chhodo aur aap galat cheez "fix" kar doge.</p>

<h3>Chhe-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Chhe-step BGP troubleshooting workflow">
<rect x="20" y="15" width="290" height="44" rx="8" fill="#e2e8f0"/><text x="165" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. Session state</text><text x="165" y="51" text-anchor="middle" class="svg-muted" font-size="12">show ip bgp summary</text>
<rect x="330" y="15" width="290" height="44" rx="8" fill="#bae6fd"/><text x="475" y="35" text-anchor="middle" class="svg-ink" font-size="13">2. Transport aur reachability</text><text x="475" y="51" text-anchor="middle" class="svg-muted" font-size="12">ping PEER source Lo0, logs</text>
<rect x="20" y="95" width="290" height="44" rx="8" fill="#ddd6fe"/><text x="165" y="115" text-anchor="middle" class="svg-ink" font-size="13">3. Routes receive aur accept hue</text><text x="165" y="131" text-anchor="middle" class="svg-muted" font-size="12">neighbors X routes, filters</text>
<rect x="330" y="95" width="290" height="44" rx="8" fill="#fde68a"/><text x="475" y="115" text-anchor="middle" class="svg-ink" font-size="13">4. Valid aur best?</text><text x="475" y="131" text-anchor="middle" class="svg-muted" font-size="12">show ip bgp PREFIX</text>
<rect x="20" y="175" width="290" height="44" rx="8" fill="#fed7aa"/><text x="165" y="195" text-anchor="middle" class="svg-ink" font-size="13">5. Routing table mein?</text><text x="165" y="211" text-anchor="middle" class="svg-muted" font-size="12">show ip route PREFIX, rib-failure</text>
<rect x="330" y="175" width="290" height="44" rx="8" fill="#bbf7d0"/><text x="475" y="195" text-anchor="middle" class="svg-ink" font-size="13">6. Return path advertise hua?</text><text x="475" y="211" text-anchor="middle" class="svg-muted" font-size="12">neighbors X advertised-routes</text>
<line x1="310" y1="37" x2="330" y2="37" stroke="#64748b" stroke-width="2"/><line x1="475" y1="59" x2="165" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="310" y1="117" x2="330" y2="117" stroke="#64748b" stroke-width="2"/><line x1="475" y1="139" x2="165" y2="175" stroke="#64748b" stroke-width="1.5"/><line x1="310" y1="197" x2="330" y2="197" stroke="#64748b" stroke-width="2"/>
<text x="320" y="250" text-anchor="middle" class="svg-accent" font-size="12">Pehle fail hone wale step par ruko, use fix karo, phir list mein aage badho</text>
</svg><p class="cap">Yahi order internal aur external dono BGP problems par kaam karta hai.</p></div>

<table class="cmp"><tr><th>Step</th><th>Kya dekhna hai</th><th>Typical root causes</th></tr>
<tr><td>1 Session</td><td>Idle (Admin), Idle (PfxCt), Idle, Active, ya prefix count</td><td>Shutdown, max-prefix, galat remote-as, TCP failure</td></tr>
<tr><td>2 Transport</td><td>Update-source se ping; BADAUTH aur NOTIFICATION logs</td><td>Loopback ka IGP route missing, TCP 179 par ACL, MD5, TTL/GTSM, multihop</td></tr>
<tr><td>3 Received</td><td>PfxRcd, <code>routes</code>, <code>received-routes</code></td><td>Inbound filter, peer advertise nahi kar raha, family activate nahi</td></tr>
<tr><td>4 Best</td><td><i>inaccessible</i>, missing <code>&gt;</code>, kis attribute ne decide kiya</td><td>Next hop reachable nahi (next-hop-self), policy kahin aur steer kar rahi</td></tr>
<tr><td>5 RIB</td><td><code>r</code> RIB-failure, AD, recursive next hop</td><td>Kam AD wala IGP ya static, route recursion loop</td></tr>
<tr><td>6 Return</td><td>Dusri side ko aapse kya milta hai</td><td>Outbound filter, split horizon, missing network statement</td></tr>
</table>

<h3>NOC INC-5530 ka walk-through</h3>
<p><b>Ticket.</b> P2, 02:14 IST par khula. ALRT-88121: EDGE1 ka peer 172.30.1.1 Established nahi. ALRT-88122: EDGE2 ka peer 172.30.2.1 Established nahi. ALRT-88130: 10.80.0.0/16 aur 10.81.0.0/16 CORE mein nahi. Change CHG-2291 ne partner maintenance ke dauraan EDGE1 aur EDGE2 edit kiye aur "successful" close hua. PC-FIN (172.16.0.0/24) payment gateway 10.80.0.1 tak nahi pahunch pa raha. PTNR (AS 64800) partner ka hai aur use badalna mana hai. AS 65000 mein yahan koi IGP nahi: loopbacks static routes se reach hote hain.</p>

<p><b>EDGE2 par step 1.</b></p>
<pre class="out">EDGE2# show ip bgp summary | begin Neighbor
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.1.1      4        65000      40      41        3    0    0 00:35:10        0
10.255.1.3      4        65000      39      42        3    0    0 00:35:02        1
<span class="hl">172.30.2.1      4        64800       0       0        1    0    0 00:34:58 Idle (Admin)</span></pre>
<p>Idle (Admin) matlab change ke baad chhoota hua <code>neighbor 172.30.2.1 shutdown</code>. Fix: <code>no neighbor 172.30.2.1 shutdown</code>.</p>

<p><b>EDGE1 par step 1 aur 2.</b> Session Idle hai aur log mein <code>NOTIFICATION ... 2/2 (peer in wrong AS) 2 bytes FD20</code> dikhta hai. 0xFD20 = 64800, partner ka asli AS; EDGE1 par <code>remote-as 64880</code> hai. Fix: <code>neighbor 172.30.1.1 remote-as 64800</code>. Ab dono sessions prefix counts dikhate hain.</p>

<p><b>CORE par step 4.</b> Dono sessions up hain, phir bhi ALRT-88130 aadha hi solve hua:</p>
<pre class="out">CORE# show ip bgp 10.80.0.0
BGP routing table entry for 10.80.0.0/16, version 11
Paths: (2 available, best #2, table default)
  Not advertised to any peer
  Refresh Epoch 1
  64800
<span class="hl">    172.30.1.1 (inaccessible) from 10.255.1.1 (10.255.1.1)</span>
      Origin IGP, metric 0, localpref 100, internal
  Refresh Epoch 1
  64800
    10.255.1.2 from 10.255.1.2 (10.255.1.2)
      Origin IGP, metric 0, localpref 100, valid, internal, best</pre>
<p>EDGE1 wala path next hop ke roop mein partner ka address le kar aata hai, aur CORE ke paas sirf loopbacks ke static routes hain. Dono edge configurations compare karo: EDGE2 par <code>neighbor 10.255.1.3 next-hop-self</code> hai, EDGE1 par nahi. EDGE1 par fix: <code>neighbor 10.255.1.3 next-hop-self</code>. Ab CORE ke paas har partner prefix ke do valid paths hain (EDGE1 router ID par jeetta hai, chapter 10).</p>

<p><b>Steps 5 aur 6.</b> CORE par <code>show ip route 10.80.0.0</code> 10.255.1.1 via <i>bgp 65000, distance 200</i> dikhata hai. Return path: CORE network statement se 172.16.0.0/24 originate karta hai; dono edges ise AS 64800 ko dete hain, jise aap EDGE1 par <code>show ip bgp neighbors 172.30.1.1 advertised-routes</code> se confirm karte ho. Phir PC-FIN service prove karta hai:</p>
<pre class="out">PC-FIN&gt; ping 10.80.0.1
<span class="hl">84 bytes from 10.80.0.1 icmp_seq=1 ttl=253 time=2.114 ms</span>
84 bytes from 10.80.0.1 icmp_seq=2 ttl=253 time=1.870 ms</pre>
<p><b>Close karne se pehle evidence.</b> CORE, EDGE1 aur EDGE2 par <code>show ip bgp summary</code> capture karo: har neighbor State/PfxRcd mein number dikhaye, Idle ya Active nahi. Ise ticket ke saath attach karo aur teen root causes ke saath CHG-2291 reopen karo, kyunki "successful" close hue change ne yeh outage kiya.</p>

<h3>Baaki labs troubleshooting patterns ki tarah</h3>
<table class="cmp"><tr><th>Lab</th><th>Symptom</th><th>Kaunsa step pakadta hai</th><th>Fix</th></tr>
<tr><td>OSPF ke upar iBGP full mesh</td><td>CORE: koi best path nahi, next hop 100.64.0.1 inaccessible; BRANCH ke paas routes nahi</td><td>4, phir 3</td><td>EDGE par next-hop-self; BRANCH se EDGE aur CORE tak loopbacks par sessions</td></tr>
<tr><td>BGP session hardening</td><td>Session atka, dono sides <code>Invalid MD5 digest</code></td><td>2</td><td>PEER-B par agreed key, phir dono ends GTSM, max-prefix, timers aur reset</td></tr>
<tr><td>Weight aur local preference</td><td>Policy configured par <code>show ip bgp</code> nahi badla</td><td>3</td><td><code>clear ip bgp X soft in</code>; permit sequence 20 taaki baaki prefixes bache rahein</td></tr>
<tr><td>NOC INC-5530</td><td>Do partner sessions down, ek path inaccessible</td><td>1, 2, 4</td><td>no shutdown, remote-as 64800, EDGE1 par next-hop-self</td></tr>
</table>

<div class="eg"><p><b>Worked example: debug ko safely use karna.</b> Production mein full table wale router par kabhi khaali <code>debug ip bgp updates</code> mat chalao. Ise limit karo: <code>access-list 99 permit 10.80.0.0 0.0.255.255</code>, phir <code>debug ip bgp 10.255.1.1 updates 99</code>, ek refresh (<code>clear ip bgp 10.255.1.1 soft in</code>) ke liye output dekho, aur <code>undebug all</code> se band karo. Pehle show commands prefer karo; unki koi keemat nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Apni states aur logs padhne se pehle partner ko unki side check karne ko kehna. Ek alarm fix karke ticket close kar dena jabki dusra path abhi bhi inaccessible hai. <code>clear ip bgp *</code> ko troubleshooting step ki tarah use karna. Return path bhool jaana, jisse forward path perfect hota hai aur pings phir bhi fail hote hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> Scenario questions teen outputs aur chaar plausible fixes dete hain. Woh step chuno jo sabse pehle fail hota hai: session problem har routing answer ko galat bana deti hai, aur <i>inaccessible</i> next hop har policy answer ko galat bana deta hai. Idle (Admin), NOTIFICATION 2/2 aur <i>inaccessible</i> har ek exactly ek fix ki taraf ishara karte hain.</p></div>

<div class="scn"><h4>Payment gateway jo do baar down hua</h4><p>Ek night-shift engineer ne INC-5530 ke dauraan sirf EDGE2 ka partner session restore kiya kyunki woh queue ka pehla alarm tha. Payments chalne lage, isliye ticket close ho gaya. Do din baad EDGE2 ka provider link fail hua, CORE ka dusra path EDGE1 wala inaccessible path tha, aur payments phir ruk gaye. Postmortem ne ek rule joda: ticket ka har alarm evidence ke saath close hona chahiye, aur CORE par <code>show ip bgp PREFIX</code> do valid paths dikhaye.</p><p><b>Seekh:</b> jo redundancy verify nahi ki, woh redundancy nahi hai.</p></div>

<div class="iv"><p class="q">"Enterprise mein 'BGP prefix missing' aap kaise troubleshoot karte ho, samjhao."</p><p>Layered order do: session state aur logs; transport (update-source ping, ACL, MD5, TTL); received aur accepted routes (filters, soft refresh, activation); valid aur best (<i>inaccessible</i>, attributes); routing table (AD, RIB-failure, recursion); return path (advertised-routes, outbound filters). INC-5530 jaisa real example use karo aur har step par command ka naam lo. Interviewers ko pasand aata hai ki aap pehle apni side check karte ho aur fix ko evidence se prove karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein kaam karo: session, transport, received, best, RIB, return path.</li>
<li>Idle (Admin) = shutdown; NOTIFICATION 2/2 = galat AS; <i>inaccessible</i> = next-hop problem.</li>
<li>Chalte router ko toote router se compare karo; missing line aksar saaf dikh jaati hai.</li>
<li>Hamesha return path check karo aur fix end to end prove karo.</li>
<li>Har affected router ke evidence ke saath tickets close karo.</li>
</ul></div>
`}};export{e as default};