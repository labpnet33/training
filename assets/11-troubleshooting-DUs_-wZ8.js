var e={id:`troubleshooting`,h:{en:`Troubleshooting drill: a vPC workflow for the NOC`,hi:`Troubleshooting drill: NOC ke liye vPC workflow`},body:{en:`
<p>A good doctor does not start with a brain scan. She checks pulse, breathing and temperature first, in the same order every time, because the order catches most problems quickly and stops her from missing the obvious. vPC troubleshooting works the same way: a fixed sequence of show commands, from the pair's heartbeat down to a single server NIC. This chapter gives you that sequence and then walks through the NOC drill lab with it.</p>

<h3>The workflow: top-down, both peers</h3>
<ol>
<li><b>Scope.</b> Which devices are affected: one server, every server on one leaf, or everything? Single-attached or dual-homed?</li>
<li><b>The pair's health</b>: <code>show vpc brief</code> on <b>both</b> peers. Read the header top to bottom: Peer status, keep-alive status, consistency status, vPC role. Then the vPC table: Status, Consistency, Reason.</li>
<li><b>Keepalive</b>: <code>show vpc peer-keepalive</code> if it is not "peer is alive". Check addresses, VRF and <code>ping ... vrf ...</code>.</li>
<li><b>Peer-link and bundles</b>: <code>show port-channel summary</code> and <code>show lacp neighbor</code>. Is Po1 SU with all members P? Do vPC member ports see the right partner?</li>
<li><b>Consistency</b>: <code>show vpc consistency-parameters interface port-channel N</code> or <code>global</code> when the reason mentions a compatibility check.</li>
<li><b>Orphans</b>: <code>show vpc orphan-ports</code> when single-attached devices are involved.</li>
<li><b>Gateway</b>: <code>show hsrp brief</code> on both peers.</li>
<li><b>Server side</b>: <code>cat /proc/net/bonding/bond0</code>, <code>ip neigh</code>, ping.</li>
<li><b>History</b>: <code>show logging</code> for %VPC messages with timestamps.</li>
</ol>

<h3>Symptom to cause: the cheat sheet</h3>
<table class="cmp"><tr><th>What you see</th><th>Most likely cause</th><th>Next command</th></tr>
<tr><td>Peer status: peer adjacency not formed yet; keepalive Suspended</td><td>Keepalive addresses, VRF or reachability</td><td><code>show vpc peer-keepalive</code>, ping in the right VRF</td></tr>
<tr><td>Peer status: peer link is down; keepalive: peer is alive</td><td>Peer-link failure; secondary has suspended its vPCs</td><td><code>show port-channel summary</code>, check optics and cables</td></tr>
<tr><td>vPC Status down* with "Compatibility check failed for ..."</td><td>Type-1 interface mismatch on this peer</td><td><code>show vpc consistency-parameters interface port-channel N</code></td></tr>
<tr><td>Configuration consistency status: failed, "Global compat check failed"</td><td>Type-1 global mismatch (for example STP mode)</td><td><code>show vpc consistency-parameters global</code></td></tr>
<tr><td>vPC up but some VLANs fail through it</td><td>Type-2 allowed-VLAN mismatch</td><td>Allowed VLANs row in consistency parameters</td></tr>
<tr><td>Role shows "secondary, operational primary"</td><td>The original primary failed or reloaded earlier</td><td><code>show vpc role</code>, <code>show logging</code></td></tr>
<tr><td>Single-NIC device unreachable during a peer-link outage</td><td>Orphan port on the secondary</td><td><code>show vpc orphan-ports</code></td></tr>
</table>

<h3>The NOC drill, step by step</h3>
<p>Change CHG-2210 is a rehearsal. Start state: NX1 primary and HSRP Active for 10.10.10.1, NX2 secondary, SRV1 on vPC 20 with bond0, SRV2 single-NIC on NX2 Ethernet1/5.</p>

<h4>Step 1: shut the peer-link on NX1</h4>
<pre class="code">NX1(config)# interface port-channel1
NX1(config-if)# shutdown</pre>
<pre class="out">NX2# show vpc brief
<span class="hl">Peer status                       : peer link is down</span>
<span class="hl">vPC keep-alive status             : peer is alive</span>
vPC role                          : secondary
Id    Port          Status Consistency Reason                Active vlans
<span class="hl">20    Po20          down   success     Peer-link is down     -</span></pre>
<p>Interpretation: the keepalive proves NX1 is alive, so NX2, the secondary, suspends vPC 20 and its VLAN 10 SVI. The answer the lab wants for the status of vPC 20 on NX2 is <b>down</b>. SRV1 keeps working on eth0 through NX1.</p>

<h4>Step 2: test the orphan</h4>
<pre class="out">SRV2$ ping 10.10.10.1
<span class="hl">Request timed out.</span>
NX2# show vpc orphan-ports
VLAN            Orphan Ports
<span class="hl">10              Eth1/5</span></pre>
<p>SRV2's port is up, but its switch's SVI is suspended and the peer-link to the HSRP Active is down. The answer is <b>no</b>, the ping fails. In the post-drill report, recommend dual-homing SRV2 or moving it to NX1.</p>

<h4>Step 3: restore the peer-link</h4>
<pre class="code">NX1(config)# interface port-channel1
NX1(config-if)# no shutdown</pre>
<p>Watch <code>show vpc brief</code> on both switches until they show <b>peer adjacency formed ok</b>. vPC 20 on NX2 comes back after the delay restore timer, and SRV1's bond gets eth1 back.</p>

<h4>Step 4: simulate a dead primary</h4>
<pre class="code">NX1(config)# interface ethernet1/1-8
NX1(config-if-range)# shutdown</pre>
<pre class="out">NX2# show vpc role
<span class="hl">vPC role                        : secondary, operational primary</span>
NX2# show logging last 2
%VPC-2-PEER_KEEP_ALIVE_RECV_FAIL: In domain 10, VPC peer keep-alive receive has failed
%VPC-5-ROLE_CHANGE: In domain 10, VPC role status has changed to Primary</pre>
<p>Keepalive and peer-link are both silent, so NX2 concludes NX1 is dead and takes over as operational primary, keeping vPC 20 up.</p>

<h4>Step 5: confirm the gateway survived</h4>
<pre class="out">NX2# show hsrp brief
 Interface   Grp  Prio P State    Active addr      Standby addr     Group addr
<span class="hl">  Vlan10     10   100    Active   local            unknown          10.10.10.1      (conf)</span>
SRV1$ ping -c 3 10.10.10.1
3 packets transmitted, 3 received, 0% packet loss</pre>
<p>After the 10-second HSRP hold time, NX2 is Active. SRV1's bond shows one slave in the aggregator, and the gateway answers. The drill proved every design assumption: dual-homed servers survive everything, the orphan does not.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="NOC drill timeline">
<line x1="30" y1="70" x2="610" y2="70" stroke="#64748b" stroke-width="2"/>
<circle cx="60" cy="70" r="8" fill="#fed7aa"/><text x="60" y="45" text-anchor="middle" class="svg-ink" font-size="12">Po1 shut</text><text x="60" y="100" text-anchor="middle" class="svg-muted" font-size="12">NX2 suspends</text>
<circle cx="190" cy="70" r="8" fill="#fde68a"/><text x="190" y="45" text-anchor="middle" class="svg-ink" font-size="12">SRV2 ping</text><text x="190" y="100" text-anchor="middle" class="svg-muted" font-size="12">fails</text>
<circle cx="320" cy="70" r="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">Po1 no shut</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">reformed</text>
<circle cx="450" cy="70" r="8" fill="#fed7aa"/><text x="450" y="45" text-anchor="middle" class="svg-ink" font-size="12">NX1 dead</text><text x="450" y="100" text-anchor="middle" class="svg-muted" font-size="12">NX2 oper primary</text>
<circle cx="580" cy="70" r="8" fill="#bbf7d0"/><text x="580" y="45" text-anchor="middle" class="svg-ink" font-size="12">HSRP</text><text x="580" y="100" text-anchor="middle" class="svg-muted" font-size="12">NX2 Active</text>
</svg><p class="cap">The five events of the NOC drill and what each one proved.</p></div>

<div class="eg"><p><b>Worked example: reading a timeline from logs.</b> A ticket says "servers on leaf B dropped for 40 seconds at 02:14". <code>show logging</code> on leaf B shows PEER_LINK_DOWN at 02:14:03, VPC_SUSP_ALL_VPC at 02:14:03, then the peer-link back at 02:14:13 and vPCs restored at 02:14:43. 02:14:43 minus 02:14:13 is 30 seconds: exactly the default delay restore. So the outage was 10 seconds of peer-link loss plus 30 seconds of deliberate delay, and only single-attached devices on leaf B would have been fully down; dual-homed ones ran on leaf A.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Looking at only one peer; the other peer often holds the answer. Fixing the symptom (reloading a switch) before capturing <code>show vpc brief</code>, <code>show logging</code> and consistency parameters. And changing both peers at once during an incident, which can turn a half outage into a full one.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect scenario questions that show a <code>show vpc brief</code> fragment and ask what happened. Anchor on two lines: Peer status and keep-alive status. Their combination tells you which failure you are looking at.</p></div>

<div class="scn"><h4>The 2 a.m. call</h4><p>A NOC engineer was paged: "half the VMs on rack 12 unreachable". She assumed 12A was the primary, as the design document said, and checked 12B first: vPCs up, but Configuration consistency status failed with "STP Mode inconsistent". Confused that nothing was suspended, she ran <code>show vpc brief</code> on 12A and found every vPC down. After an earlier reload, 12B had become the operational primary and 12A the operational secondary, so graceful consistency check had suspended 12A. A colleague had changed the STP mode on 12B in a mis-scoped change. Reverting it restored everything. Her report recommended adding "which peer is operational primary right now" to the runbook's first step.</p><p><b>Lesson:</b> always check the role on both peers; with non-preemption, the primary is not always the switch you think.</p></div>

<div class="iv"><p class="q">"A server behind a vPC has lost one of its two links. How do you troubleshoot?"</p><p>Strong answer: start with <code>show vpc brief</code> on both peers: peer status, keepalive, role and the vPC's Status and Reason. If the vPC is down* with a compatibility reason, compare with <code>show vpc consistency-parameters interface port-channel N</code> and fix the side that changed. If the member port is suspended or individual, check <code>show port-channel summary</code> and <code>show lacp neighbor</code> for the partner ID and the server's bond mode. Confirm on the server with <code>/proc/net/bonding/bond0</code>. Mention checking logs for when it started.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a fixed, top-down order: scope, <code>show vpc brief</code> on both peers, keepalive, bundles, consistency, orphans, HSRP, server, logs.</li>
<li>Peer status plus keepalive status together identify the failure type.</li>
<li>down* plus a compatibility reason means a type-1 mismatch on that peer.</li>
<li>In the drill: peer-link down suspends NX2's vPC and isolates SRV2; a dead NX1 makes NX2 "secondary, operational primary" and HSRP Active.</li>
<li>Timestamps in <code>show logging</code> reveal timers such as delay restore.</li>
</ul></div>
`,hi:`
<p>Achhi doctor brain scan se shuru nahi karti. Woh pehle nabz, saans aur temperature check karti hai, har baar same kram mein, kyunki yeh kram zyada tar problems jaldi pakad leta hai aur use obvious cheez miss karne se rokta hai. vPC troubleshooting bhi aisa hi hai: show commands ka ek fixed sequence, pair ki dhadkan se lekar ek server NIC tak. Yeh chapter aapko woh sequence deta hai aur phir usi se NOC drill lab karwata hai.</p>

<h3>Workflow: top-down, dono peers</h3>
<ol>
<li><b>Scope.</b> Kaunse devices affected hain: ek server, ek leaf ke saare servers, ya sab kuch? Single-attached ya dual-homed?</li>
<li><b>Pair ki health</b>: <b>dono</b> peers par <code>show vpc brief</code>. Header upar se neeche padho: Peer status, keep-alive status, consistency status, vPC role. Phir vPC table: Status, Consistency, Reason.</li>
<li><b>Keepalive</b>: agar "peer is alive" nahi hai to <code>show vpc peer-keepalive</code>. Addresses, VRF aur <code>ping ... vrf ...</code> check karo.</li>
<li><b>Peer-link aur bundles</b>: <code>show port-channel summary</code> aur <code>show lacp neighbor</code>. Kya Po1 SU hai aur saare members P? Kya vPC member ports ko sahi partner dikhta hai?</li>
<li><b>Consistency</b>: jab reason compatibility check ka zikr kare to <code>show vpc consistency-parameters interface port-channel N</code> ya <code>global</code>.</li>
<li><b>Orphans</b>: jab single-attached devices shamil hon to <code>show vpc orphan-ports</code>.</li>
<li><b>Gateway</b>: dono peers par <code>show hsrp brief</code>.</li>
<li><b>Server side</b>: <code>cat /proc/net/bonding/bond0</code>, <code>ip neigh</code>, ping.</li>
<li><b>History</b>: timestamps ke saath %VPC messages ke liye <code>show logging</code>.</li>
</ol>

<h3>Symptom se cause: cheat sheet</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Sabse sambhavit cause</th><th>Agla command</th></tr>
<tr><td>Peer status: peer adjacency not formed yet; keepalive Suspended</td><td>Keepalive addresses, VRF ya reachability</td><td><code>show vpc peer-keepalive</code>, sahi VRF mein ping</td></tr>
<tr><td>Peer status: peer link is down; keepalive: peer is alive</td><td>Peer-link failure; secondary ne apne vPCs suspend kar diye</td><td><code>show port-channel summary</code>, optics aur cables check karo</td></tr>
<tr><td>vPC Status down* ke saath "Compatibility check failed for ..."</td><td>Is peer par type-1 interface mismatch</td><td><code>show vpc consistency-parameters interface port-channel N</code></td></tr>
<tr><td>Configuration consistency status: failed, "Global compat check failed"</td><td>Type-1 global mismatch (jaise STP mode)</td><td><code>show vpc consistency-parameters global</code></td></tr>
<tr><td>vPC up par uske through kuch VLANs fail</td><td>Type-2 allowed-VLAN mismatch</td><td>Consistency parameters mein Allowed VLANs row</td></tr>
<tr><td>Role "secondary, operational primary" dikhata hai</td><td>Original primary pehle fail ya reload hua tha</td><td><code>show vpc role</code>, <code>show logging</code></td></tr>
<tr><td>Peer-link outage mein single-NIC device unreachable</td><td>Secondary par orphan port</td><td><code>show vpc orphan-ports</code></td></tr>
</table>

<h3>NOC drill, step by step</h3>
<p>Change CHG-2210 ek rehearsal hai. Shuruaati state: NX1 primary aur 10.10.10.1 ke liye HSRP Active, NX2 secondary, SRV1 bond0 ke saath vPC 20 par, SRV2 single-NIC NX2 Ethernet1/5 par.</p>

<h4>Step 1: NX1 par peer-link shut karo</h4>
<pre class="code">NX1(config)# interface port-channel1
NX1(config-if)# shutdown</pre>
<pre class="out">NX2# show vpc brief
<span class="hl">Peer status                       : peer link is down</span>
<span class="hl">vPC keep-alive status             : peer is alive</span>
vPC role                          : secondary
Id    Port          Status Consistency Reason                Active vlans
<span class="hl">20    Po20          down   success     Peer-link is down     -</span></pre>
<p>Matlab: keepalive saabit karta hai ki NX1 zinda hai, isliye NX2, jo secondary hai, vPC 20 aur apna VLAN 10 SVI suspend karta hai. NX2 par vPC 20 ke status ke liye lab jo jawab chahta hai woh <b>down</b> hai. SRV1 NX1 ke through eth0 par chalta rehta hai.</p>

<h4>Step 2: orphan ko test karo</h4>
<pre class="out">SRV2$ ping 10.10.10.1
<span class="hl">Request timed out.</span>
NX2# show vpc orphan-ports
VLAN            Orphan Ports
<span class="hl">10              Eth1/5</span></pre>
<p>SRV2 ka port up hai, par uske switch ka SVI suspended hai aur HSRP Active tak ka peer-link down hai. Jawab <b>no</b> hai, ping fail hota hai. Post-drill report mein SRV2 ko dual-home karne ya NX1 par shift karne ki recommendation do.</p>

<h4>Step 3: peer-link wapas laao</h4>
<pre class="code">NX1(config)# interface port-channel1
NX1(config-if)# no shutdown</pre>
<p>Dono switches par <code>show vpc brief</code> dekhte raho jab tak woh <b>peer adjacency formed ok</b> na dikhayein. NX2 par vPC 20 delay restore timer ke baad wapas aata hai, aur SRV1 ke bond ko eth1 wapas milta hai.</p>

<h4>Step 4: mara hua primary simulate karo</h4>
<pre class="code">NX1(config)# interface ethernet1/1-8
NX1(config-if-range)# shutdown</pre>
<pre class="out">NX2# show vpc role
<span class="hl">vPC role                        : secondary, operational primary</span>
NX2# show logging last 2
%VPC-2-PEER_KEEP_ALIVE_RECV_FAIL: In domain 10, VPC peer keep-alive receive has failed
%VPC-5-ROLE_CHANGE: In domain 10, VPC role status has changed to Primary</pre>
<p>Keepalive aur peer-link dono chup hain, isliye NX2 maan leta hai NX1 mar gaya aur operational primary ban kar kaam sambhal leta hai, vPC 20 ko up rakhte hue.</p>

<h4>Step 5: confirm karo ki gateway bach gaya</h4>
<pre class="out">NX2# show hsrp brief
 Interface   Grp  Prio P State    Active addr      Standby addr     Group addr
<span class="hl">  Vlan10     10   100    Active   local            unknown          10.10.10.1      (conf)</span>
SRV1$ ping -c 3 10.10.10.1
3 packets transmitted, 3 received, 0% packet loss</pre>
<p>10 second ke HSRP hold time ke baad NX2 Active hai. SRV1 ka bond aggregator mein ek slave dikhata hai, aur gateway jawab deta hai. Drill ne design ki har maanyata saabit ki: dual-homed servers sab kuch jhel jaate hain, orphan nahi.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="NOC drill timeline">
<line x1="30" y1="70" x2="610" y2="70" stroke="#64748b" stroke-width="2"/>
<circle cx="60" cy="70" r="8" fill="#fed7aa"/><text x="60" y="45" text-anchor="middle" class="svg-ink" font-size="12">Po1 shut</text><text x="60" y="100" text-anchor="middle" class="svg-muted" font-size="12">NX2 suspend</text>
<circle cx="190" cy="70" r="8" fill="#fde68a"/><text x="190" y="45" text-anchor="middle" class="svg-ink" font-size="12">SRV2 ping</text><text x="190" y="100" text-anchor="middle" class="svg-muted" font-size="12">fail</text>
<circle cx="320" cy="70" r="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">Po1 no shut</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">dobara bana</text>
<circle cx="450" cy="70" r="8" fill="#fed7aa"/><text x="450" y="45" text-anchor="middle" class="svg-ink" font-size="12">NX1 mara</text><text x="450" y="100" text-anchor="middle" class="svg-muted" font-size="12">NX2 oper primary</text>
<circle cx="580" cy="70" r="8" fill="#bbf7d0"/><text x="580" y="45" text-anchor="middle" class="svg-ink" font-size="12">HSRP</text><text x="580" y="100" text-anchor="middle" class="svg-muted" font-size="12">NX2 Active</text>
</svg><p class="cap">NOC drill ke paanch events aur har ek ne kya saabit kiya.</p></div>

<div class="eg"><p><b>Worked example: logs se timeline padhna.</b> Ticket kehta hai "leaf B ke servers 02:14 par 40 second ke liye gire". Leaf B par <code>show logging</code> 02:14:03 par PEER_LINK_DOWN, 02:14:03 par VPC_SUSP_ALL_VPC, phir 02:14:13 par peer-link wapas aur 02:14:43 par vPCs restore dikhata hai. 02:14:43 minus 02:14:13 = 30 second: bilkul default delay restore. To outage 10 second ka peer-link loss plus 30 second ki jaan-boojh kar di gayi deri tha, aur sirf leaf B ke single-attached devices poori tarah down hote; dual-homed wale leaf A par chale.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf ek peer ko dekhna; jawab aksar doosre peer ke paas hota hai. <code>show vpc brief</code>, <code>show logging</code> aur consistency parameters capture karne se pehle symptom theek karna (switch reload karna). Aur incident ke dauraan dono peers ek saath badalna, jo aadhe outage ko poora bana sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aise scenario questions ki umeed rakho jo <code>show vpc brief</code> ka tukda dikha kar poochein ki kya hua. Do lines par tiko: Peer status aur keep-alive status. Dono ka combination batata hai ki aap kaunsa failure dekh rahe ho.</p></div>

<div class="scn"><h4>Raat 2 baje ki call</h4><p>Ek NOC engineer ko page aaya: "rack 12 ki aadhi VMs unreachable". Usne maana ki 12A primary hai, jaisa design document kehta tha, aur pehle 12B check kiya: vPCs up, par Configuration consistency status "STP Mode inconsistent" ke saath failed. Hairaan ki kuch suspend nahi hua, usne 12A par <code>show vpc brief</code> chalaya aur har vPC down paaya. Pehle ke ek reload ke baad 12B operational primary aur 12A operational secondary ban gaya tha, isliye graceful consistency check ne 12A ko suspend kiya tha. Ek colleague ne galat scope wale change mein 12B par STP mode badal diya tha. Use revert karte hi sab theek ho gaya. Uski report ne runbook ke pehle step mein "abhi operational primary kaunsa peer hai" jodne ki recommendation di.</p><p><b>Seekh:</b> hamesha dono peers par role check karo; non-preemption ke saath primary hamesha woh switch nahi hota jo aap sochte ho.</p></div>

<div class="iv"><p class="q">"vPC ke peeche ek server ne apne do mein se ek link kho diya. Aap kaise troubleshoot karoge?"</p><p>Strong answer: dono peers par <code>show vpc brief</code> se shuru karo: peer status, keepalive, role aur vPC ka Status aur Reason. Agar vPC compatibility reason ke saath down* hai, to <code>show vpc consistency-parameters interface port-channel N</code> se compare karo aur jo side badli use theek karo. Agar member port suspended ya individual hai, to partner ID aur server ke bond mode ke liye <code>show port-channel summary</code> aur <code>show lacp neighbor</code> check karo. Server par <code>/proc/net/bonding/bond0</code> se confirm karo. Yeh bhi batao ki kab shuru hua yeh jaanne ke liye logs check karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed, top-down kram use karo: scope, dono peers par <code>show vpc brief</code>, keepalive, bundles, consistency, orphans, HSRP, server, logs.</li>
<li>Peer status aur keepalive status milkar failure type pehchante hain.</li>
<li>down* plus compatibility reason ka matlab us peer par type-1 mismatch.</li>
<li>Drill mein: peer-link down NX2 ka vPC suspend karta hai aur SRV2 ko akela kar deta hai; mara NX1 NX2 ko "secondary, operational primary" aur HSRP Active banata hai.</li>
<li><code>show logging</code> ke timestamps delay restore jaise timers bata dete hain.</li>
</ul></div>
`}};export{e as default};