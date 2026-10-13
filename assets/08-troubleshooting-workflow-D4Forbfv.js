var e={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: no neighbour, no tree, empty list`,hi:`Troubleshooting workflow: no neighbour, no tree, empty list`},body:{en:`
<p>When a stream does not arrive, guessing is the slowest method. A doctor does not start with surgery; she checks pulse, then temperature, then blood. Multicast troubleshooting is the same: a fixed order of cheap checks, from the receiver back toward the source, and you stop at the first layer that is wrong.</p>

<h3>The five-layer method</h3>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Troubleshooting layers">
<rect x="5" y="30" width="118" height="100" rx="8" fill="#bbf7d0"/><text x="64" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Receiver</text><text x="64" y="75" text-anchor="middle" class="svg-muted" font-size="11">IGMP group,</text><text x="64" y="90" text-anchor="middle" class="svg-muted" font-size="11">version</text>
<rect x="133" y="30" width="118" height="100" rx="8" fill="#bae6fd"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Neighbours</text><text x="192" y="75" text-anchor="middle" class="svg-muted" font-size="11">PIM on every</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="11">path link</text>
<rect x="261" y="30" width="118" height="100" rx="8" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 RP</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="11">same address,</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">reachable</text>
<rect x="389" y="30" width="118" height="100" rx="8" fill="#fde68a"/><text x="448" y="55" text-anchor="middle" class="svg-ink" font-size="13">4 Tree</text><text x="448" y="75" text-anchor="middle" class="svg-muted" font-size="11">(*,G) incoming,</text><text x="448" y="90" text-anchor="middle" class="svg-muted" font-size="11">OIL not Null</text>
<rect x="517" y="30" width="118" height="100" rx="8" fill="#fed7aa"/><text x="576" y="55" text-anchor="middle" class="svg-ink" font-size="13">5 Source</text><text x="576" y="75" text-anchor="middle" class="svg-muted" font-size="11">DR, register,</text><text x="576" y="90" text-anchor="middle" class="svg-muted" font-size="11">(S,G)</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Work left to right; stop at the first layer that fails</text>
</svg><p class="cap">Receiver, neighbours, RP, tree, source: five cheap questions.</p></div>
<ol>
<li><b>Receiver.</b> On the last-hop router run <code>show ip igmp groups</code>. Is the group listed on the right interface? If not, the host is not joining or the LAN interface has no PIM or the wrong IGMP version.</li>
<li><b>Neighbours.</b> <code>show ip pim neighbor</code> on a router in the middle of the path. Does it list every neighbour you drew on the diagram? A missing one means PIM is off on one end, or <code>ip multicast-routing</code> is off on that router.</li>
<li><b>RP.</b> <code>show ip pim rp mapping</code> on every router. The RP address must be identical. Then <code>show ip rpf &lt;RP&gt;</code>: the interface it names must have a PIM neighbour.</li>
<li><b>Tree.</b> <code>show ip mroute &lt;group&gt;</code> on the last-hop router, then the RP. In (*,G) the incoming interface must be a real interface, not Null; the outgoing list must not be Null.</li>
<li><b>Source.</b> On the source's DR: is the (S,G) entry there, and is it registering (flag F)? Is the OIL Null? Then the RP is the wrong one, or cannot be reached.</li>
</ol>

<h3>What each symptom usually means</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Next check</th></tr>
<tr><td>IGMP group listed, no mroute at all</td><td>IGMP version too low for SSM, or no multicast routing on the router</td><td><code>show ip igmp interface</code>, running config</td></tr>
<tr><td>(*,G) Incoming interface: Null on the last-hop router</td><td>No RPF path to the RP through a PIM neighbour</td><td><code>show ip rpf</code> RP, <code>show ip pim neighbor</code></td></tr>
<tr><td>Source DR: flags F or P, OIL Null</td><td>The source registers to an RP that cannot be used</td><td><code>show ip pim rp mapping</code> on the DR</td></tr>
<tr><td>RP has (*,G) with OIL but no (S,G)</td><td>Source side: PIM missing on the source LAN, or the register is lost</td><td>Source DR configuration</td></tr>
<tr><td>Everything correct, host sees nothing</td><td>TTL too low, an ACL, a boundary, or a host firewall</td><td>Packet counters, TTL on the sender</td></tr></table>

<h3>Walking the troubleshooting lab: the town-hall stream</h3>
<p>The lab for this module (mq-pim-adjacency-fault) has three independent faults; the method above finds all of them without guessing. Here is the diagnostic path, and the clues it produces. Try it in the lab before you read how to fix anything: this chapter deliberately does not print the commands that repair it.</p>
<p><b>Layer 1, receiver.</b> Both PCs have already joined, and IGMP on the last-hop routers lists the group. The receivers are not the problem.</p>
<p><b>Layer 2, neighbours.</b> The RP, R2, has three router-facing interfaces and should list three neighbours:</p>
<pre class="out">R2#show ip pim neighbor
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
<span class="hl">10.0.12.1         GigabitEthernet0/1       00:00:12/00:01:33 v2    1 / S P G</span>

R3#show ip pim neighbor
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode

R3#show ip mroute 239.60.0.1
<span class="hl">% IP multicast routing is not enabled on this router</span>

R4#show ip pim interface
Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
<span class="hl">10.60.4.1        GigabitEthernet0/0       v2/S   0      30     1          10.60.4.1</span></pre>
<p>Two of the three expected neighbours are missing. Two routers show symptoms of different kinds: on one the multicast engine itself is absent, on the other the interface list is short. The fix in each case is different, which is why you must read both outputs rather than assume the same cause.</p>
<p><b>Layer 3, RP.</b> Even when adjacencies are repaired, compare the RP on every router. One router shows an address that is not the others':</p>
<pre class="out">R1#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    <span class="hl">RP: 2.2.2.3 (?)</span></pre>
<p><b>Layer 4 and 5, tree and source.</b> Meanwhile R4 holds a (*,G) with no way to reach the RP, and the source router registers into the void:</p>
<pre class="out">R4#show ip mroute 239.60.0.1
(*, 239.60.0.1), 00:01:36/00:02:24, RP 2.2.2.2, flags: SC
  <span class="hl">Incoming interface: Null, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:36/00:02:24

R1#show ip mroute 239.60.0.1
(10.60.1.10, 239.60.0.1), 00:00:12/00:02:48, flags: <span class="hl">PFT</span>
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0
  Outgoing interface list: <span class="hl">Null</span></pre>
<p>Incoming interface Null on the last-hop router, flag F with an empty OIL on the source router, and no (*,G) at all on the RP: each clue points at a layer. The lab asks you to answer some of these questions and to prove the final result with host counters.</p>

<div class="eg"><p><b>Worked example.</b> Time budget for a ticket: layer 1 takes 1 minute (one command), layer 2 two minutes (two or three routers), layer 3 two minutes, layer 4 three minutes. A disciplined engineer isolates the layer in under ten minutes. The same engineer without a method can spend an hour changing things at random, which often creates a second fault.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing the configuration before reading the state. (2) Starting at the source and working toward the receiver: each wrong layer hides the next. (3) Testing right after a change: wait for the next join refresh or clear the old state and resend the stream.</p></div>
<div class="exam"><p><b>Exam trap.</b> A router with no <code>ip multicast-routing</code> still shows its interfaces as PIM-enabled in the configuration, but forms no adjacency and answers mroute commands with a "not enabled" message.</p></div>

<div class="scn"><h4>Three tickets in one</h4><p>After a weekend change window the Kolkata and Chennai offices stopped receiving the town hall. The on-call engineer went straight to the source router and found the stream leaving the studio, so he escalated to the WAN team. A colleague applied the layered method instead and found three separate causes in 25 minutes: a router without the global multicast switch, an uplink without PIM, and a mistyped RP address on the source router. Fixing the first one alone changed nothing visible, which almost made the team revert correct work.</p><p><b>Lesson:</b> a result can hide several faults; fix one layer, re-check, and continue until the host counter moves.</p></div>

<div class="iv"><p class="q">"A receiver does not get a multicast stream. How do you troubleshoot?"</p><p>Strong answer: receiver to source in layers. IGMP membership on the last-hop router; PIM neighbours on each hop; the RP address and its RPF path; the mroute entries and incoming and outgoing interfaces at the last-hop router and RP; then the source's DR and register state. Stop at the first failure, fix it, and re-verify with host counters. Mention incoming interface Null as the signature of an RPF problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: receiver, neighbours, RP, tree, source. Stop at the first failing layer.</li>
<li>Incoming interface Null means no RPF path through a PIM neighbour.</li>
<li>Same RP on every router, and a PIM-enabled path toward it.</li>
<li>Source DR with flag F and an empty OIL means a wrong or unreachable RP.</li>
<li>Re-test after each fix; one symptom can hide several faults.</li>
</ul></div>
`,hi:`
<p>Jab stream nahi aati, andaza lagana sabse dheema tareeka hai. Doctor operation se shuru nahi karti; woh pehle nabz dekhti hai, phir temperature, phir khoon. Multicast troubleshooting bhi aisa hi hai: sasti checks ka fixed order, receiver se source ki taraf wapas, aur jis pehli layer mein galti mile wahin ruk jao.</p>

<h3>Paanch-layer method</h3>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Troubleshooting layers">
<rect x="5" y="30" width="118" height="100" rx="8" fill="#bbf7d0"/><text x="64" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Receiver</text><text x="64" y="75" text-anchor="middle" class="svg-muted" font-size="11">IGMP group,</text><text x="64" y="90" text-anchor="middle" class="svg-muted" font-size="11">version</text>
<rect x="133" y="30" width="118" height="100" rx="8" fill="#bae6fd"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Neighbours</text><text x="192" y="75" text-anchor="middle" class="svg-muted" font-size="11">har path link</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="11">par PIM</text>
<rect x="261" y="30" width="118" height="100" rx="8" fill="#ddd6fe"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 RP</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="11">same address,</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">reachable</text>
<rect x="389" y="30" width="118" height="100" rx="8" fill="#fde68a"/><text x="448" y="55" text-anchor="middle" class="svg-ink" font-size="13">4 Tree</text><text x="448" y="75" text-anchor="middle" class="svg-muted" font-size="11">(*,G) incoming,</text><text x="448" y="90" text-anchor="middle" class="svg-muted" font-size="11">OIL Null nahi</text>
<rect x="517" y="30" width="118" height="100" rx="8" fill="#fed7aa"/><text x="576" y="55" text-anchor="middle" class="svg-ink" font-size="13">5 Source</text><text x="576" y="75" text-anchor="middle" class="svg-muted" font-size="11">DR, register,</text><text x="576" y="90" text-anchor="middle" class="svg-muted" font-size="11">(S,G)</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Left se right chalo; jo pehli layer fail ho wahin ruko</text>
</svg><p class="cap">Receiver, neighbours, RP, tree, source: paanch sasti checks.</p></div>
<ol>
<li><b>Receiver.</b> Last-hop router par <code>show ip igmp groups</code> chalao. Kya group sahi interface par listed hai? Agar nahi, to host join nahi kar raha, ya LAN interface par PIM nahi hai, ya IGMP version galat hai.</li>
<li><b>Neighbours.</b> Path ke beech ke router par <code>show ip pim neighbor</code>. Kya woh har neighbour list karta hai jo aapne diagram mein banaya? Ek missing hone ka matlab: ek end par PIM off hai, ya us router par <code>ip multicast-routing</code> off hai.</li>
<li><b>RP.</b> Har router par <code>show ip pim rp mapping</code>. RP address bilkul same hona chahiye. Phir <code>show ip rpf &lt;RP&gt;</code>: jo interface woh batata hai us par PIM neighbour hona chahiye.</li>
<li><b>Tree.</b> Last-hop router par <code>show ip mroute &lt;group&gt;</code>, phir RP par. (*,G) mein incoming interface asli interface hona chahiye, Null nahi; outgoing list Null nahi honi chahiye.</li>
<li><b>Source.</b> Source ke DR par: kya (S,G) entry hai, aur kya woh register kar rahi hai (flag F)? Kya OIL Null hai? To RP galat hai, ya pahunch ke bahar hai.</li>
</ol>

<h3>Har symptom ka aam matlab</h3>
<table class="cmp"><tr><th>Aap kya dekhte ho</th><th>Sambhavit wajah</th><th>Agli check</th></tr>
<tr><td>IGMP group listed, mroute bilkul nahi</td><td>SSM ke liye IGMP version kam, ya router par multicast routing nahi</td><td><code>show ip igmp interface</code>, running config</td></tr>
<tr><td>Last-hop router par (*,G) Incoming interface: Null</td><td>PIM neighbour ke through RP tak RPF path nahi</td><td><code>show ip rpf</code> RP, <code>show ip pim neighbor</code></td></tr>
<tr><td>Source DR: flags F ya P, OIL Null</td><td>Source aise RP ko register karta hai jo use nahi ho sakta</td><td>DR par <code>show ip pim rp mapping</code></td></tr>
<tr><td>RP ke paas OIL ke saath (*,G) hai par (S,G) nahi</td><td>Source side: source LAN par PIM missing, ya register kho gaya</td><td>Source DR ki configuration</td></tr>
<tr><td>Sab sahi, host ko kuch nahi dikhta</td><td>TTL kam, ACL, boundary, ya host firewall</td><td>Packet counters, sender par TTL</td></tr></table>

<h3>Troubleshooting lab ka walkthrough: town-hall stream</h3>
<p>Is module ke lab (mq-pim-adjacency-fault) mein teen independent faults hain; upar ka method bina andaza lagaye teeno dhoondh leta hai. Yeh raha diagnostic path aur woh clues jo yeh deta hai. Kuch bhi theek karna padhne se pehle lab mein try karo: yeh chapter jaanbujhkar woh commands nahi chhapta jo ise repair karte hain.</p>
<p><b>Layer 1, receiver.</b> Dono PCs pehle se join kar chuke hain, aur last-hop routers par IGMP group list karta hai. Receivers problem nahi hain.</p>
<p><b>Layer 2, neighbours.</b> RP, R2, ke teen router-facing interfaces hain aur use teen neighbours list karne chahiye:</p>
<pre class="out">R2#show ip pim neighbor
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode
<span class="hl">10.0.12.1         GigabitEthernet0/1       00:00:12/00:01:33 v2    1 / S P G</span>

R3#show ip pim neighbor
Neighbor          Interface                Uptime/Expires    Ver   DR
Address                                                            Prio/Mode

R3#show ip mroute 239.60.0.1
<span class="hl">% IP multicast routing is not enabled on this router</span>

R4#show ip pim interface
Address          Interface                Ver/   Nbr    Query  DR         DR
                                          Mode   Count  Intvl  Prior
<span class="hl">10.60.4.1        GigabitEthernet0/0       v2/S   0      30     1          10.60.4.1</span></pre>
<p>Teen expected neighbours mein se do missing hain. Do routers alag tarah ke symptoms dikhate hain: ek par multicast engine hi absent hai, doosre par interface list chhoti hai. Har case mein fix alag hai, isliye aapko dono outputs padhne chahiye, same wajah maan nahi leni chahiye.</p>
<p><b>Layer 3, RP.</b> Adjacencies repair hone par bhi, har router par RP compare karo. Ek router ek aisa address dikhata hai jo baaki ka nahi hai:</p>
<pre class="out">R1#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    <span class="hl">RP: 2.2.2.3 (?)</span></pre>
<p><b>Layer 4 aur 5, tree aur source.</b> Is beech R4 ke paas RP tak pahunchne ka raasta nahi aur (*,G) hai, aur source router khaali jagah mein register karta hai:</p>
<pre class="out">R4#show ip mroute 239.60.0.1
(*, 239.60.0.1), 00:01:36/00:02:24, RP 2.2.2.2, flags: SC
  <span class="hl">Incoming interface: Null, RPF nbr 0.0.0.0</span>
  Outgoing interface list:
    GigabitEthernet0/0, Forward/Sparse, 00:01:36/00:02:24

R1#show ip mroute 239.60.0.1
(10.60.1.10, 239.60.0.1), 00:00:12/00:02:48, flags: <span class="hl">PFT</span>
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0
  Outgoing interface list: <span class="hl">Null</span></pre>
<p>Last-hop router par Incoming interface Null, source router par flag F ke saath khaali OIL, aur RP par (*,G) bilkul nahi: har clue ek layer ki taraf ishara karta hai. Lab aapse in mein se kuch sawaalon ke jawab maangta hai aur final result ko host counters se prove karwata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek ticket ka time budget: layer 1 mein 1 minute (ek command), layer 2 mein do minute (do ya teen routers), layer 3 mein do minute, layer 4 mein teen minute. Disciplined engineer das minute se kam mein layer isolate kar leta hai. Bina method wala wahi engineer ek ghanta random changes karte hue bita sakta hai, jisse aksar doosra fault ban jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) State padhne se pehle configuration badalna. (2) Source se shuru karke receiver ki taraf jaana: har galat layer agli ko chhupa deti hai. (3) Change ke turant baad test karna: agle join refresh ka intezaar karo ya purani state clear karke stream dobara bhejo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jis router par <code>ip multicast-routing</code> nahi, woh configuration mein apne interfaces ko PIM-enabled dikhata hai, par adjacency nahi banata aur mroute commands ka jawab "not enabled" message se deta hai.</p></div>

<div class="scn"><h4>Ek mein teen tickets</h4><p>Weekend change window ke baad Kolkata aur Chennai offices ko town hall milna band ho gaya. On-call engineer seedha source router par gaya aur dekha ki stream studio se nikal rahi hai, to usne WAN team ko escalate kar diya. Ek colleague ne layered method lagaya aur 25 minute mein teen alag wajahein dhoondh li: ek router par global multicast switch nahi, ek uplink par PIM nahi, aur source router par mistyped RP address. Sirf pehla fix karne se kuch dikhta nahi badla, jisse team lagbhag sahi kaam revert kar deti.</p><p><b>Seekh:</b> ek result kai faults chhupa sakta hai; ek layer fix karo, dobara check karo, aur tab tak aage badho jab tak host counter na hile.</p></div>

<div class="iv"><p class="q">"Receiver ko multicast stream nahi mil rahi. Aap troubleshoot kaise karoge?"</p><p>Strong answer: receiver se source tak layers mein. Last-hop router par IGMP membership; har hop par PIM neighbours; RP address aur uska RPF path; last-hop router aur RP par mroute entries aur incoming aur outgoing interfaces; phir source ka DR aur register state. Pehli failure par ruko, fix karo, aur host counters se dobara verify karo. Incoming interface Null ko RPF problem ki pehchaan ke roop mein batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: receiver, neighbours, RP, tree, source. Pehli failing layer par ruko.</li>
<li>Incoming interface Null ka matlab PIM neighbour ke through RPF path nahi.</li>
<li>Har router par same RP, aur uski taraf PIM-enabled path.</li>
<li>Flag F aur khaali OIL wala source DR galat ya unreachable RP ka matlab hai.</li>
<li>Har fix ke baad dobara test karo; ek symptom kai faults chhupa sakta hai.</li>
</ul></div>
`}};export{e as default};