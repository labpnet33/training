var e={id:`troubleshooting`,h:{en:`Design review troubleshooting: when traffic takes the long way`,hi:`Design review troubleshooting: jab traffic lamba raasta leta hai`},body:{en:`
<p>A building inspector does not start by knocking down walls. She takes the architect's drawing, walks the building floor by floor, and marks every place where reality differs from the plan. A <b>design review</b> of a network works the same way: you start from the <b>design intent</b>, check each layer in a fixed order, and list every difference. Most "the network is slow" tickets in redundant campuses are not broken links; they are redundancy that no longer matches the design. This chapter gives you the workflow and walks through the second lab, <b>Design review: traffic takes the long way</b>.</p>

<h3>The design-review workflow</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Design review workflow">
<rect x="5" y="30" width="95" height="44" rx="8" fill="#ddd6fe"/><text x="52" y="57" text-anchor="middle" class="svg-ink" font-size="12">1 Intent</text>
<rect x="112" y="30" width="95" height="44" rx="8" fill="#bae6fd"/><text x="159" y="57" text-anchor="middle" class="svg-ink" font-size="12">2 Bundles</text>
<rect x="219" y="30" width="95" height="44" rx="8" fill="#bae6fd"/><text x="266" y="57" text-anchor="middle" class="svg-ink" font-size="12">3 STP</text>
<rect x="326" y="30" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="373" y="57" text-anchor="middle" class="svg-ink" font-size="12">4 FHRP</text>
<rect x="433" y="30" width="95" height="44" rx="8" fill="#fde68a"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="12">5 Routing</text>
<rect x="540" y="30" width="95" height="44" rx="8" fill="#fed7aa"/><text x="587" y="57" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text>
<line x1="100" y1="52" x2="112" y2="52" stroke="#64748b" stroke-width="2"/><line x1="207" y1="52" x2="219" y2="52" stroke="#64748b" stroke-width="2"/><line x1="314" y1="52" x2="326" y2="52" stroke="#64748b" stroke-width="2"/><line x1="421" y1="52" x2="433" y2="52" stroke="#64748b" stroke-width="2"/><line x1="528" y1="52" x2="540" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">Compare every layer with the design, on both distribution switches</text>
</svg><p class="cap">Work bottom-up from the physical bundle to the gateway and routing, always on both peers.</p></div>
<ol>
<li><b>Design intent.</b> Write down what should be true: which switch owns which VLAN (STP root and HSRP active), the inter-switch bundle (members and protocol), and which switches are in OSPF.</li>
<li><b>Bundles.</b> <code>show etherchannel summary</code> and <code>show lacp neighbor</code> on both ends. Healthy is Po(SU) with every member (P).</li>
<li><b>Spanning tree.</b> On the access switch, <code>show spanning-tree vlan N</code> shows the root port; <code>show cdp neighbors</code> maps that port to a switch. On distribution, <code>show spanning-tree root</code>.</li>
<li><b>FHRP.</b> <code>show standby brief</code> on both switches: active, standby, priority, preempt flag.</li>
<li><b>Routing.</b> <code>show ip ospf neighbor</code> on distribution, <code>show ip route ospf</code> on the WAN router for equal-cost paths.</li>
<li><b>Verify forwarding.</b> Ping and traceroute from hosts; on the access switch check which uplink learned the virtual MAC.</li>
</ol>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Next check</th></tr>
<tr><td>Inter-switch link hot, one uplink per access switch idle</td><td>STP root and HSRP active on different switches</td><td><code>show spanning-tree vlan N</code> on access, <code>show standby brief</code></td></tr>
<tr><td>Po1(SD) on one side, members (I) or (s)</td><td>Channel mode mismatch (on versus LACP) or LACP not negotiating</td><td><code>show etherchannel summary</code> both sides, <code>show lacp neighbor</code></td></tr>
<tr><td>Preferred switch stays HSRP standby after recovery</td><td>Preempt missing</td><td><code>show standby</code>, look for "Preemption enabled"</td></tr>
<tr><td>WAN router has one path to a user subnet</td><td>A distribution switch missing from OSPF</td><td><code>show ip ospf neighbor</code>, <code>show ip route ospf</code></td></tr>
</table>

<h3>Lab walkthrough: traffic takes the long way</h3>
<p>Ticket: the DS1–DS2 port-channel is down and VLAN 10 users take a detour, going up to DS2 and hairpinning through AS1 to reach DS1. Design intent: DS1 owns VLAN 10, DS2 owns VLAN 20, the interconnect is a two-member LACP bundle.</p>

<h4>Task 1: who is the root for VLAN 10?</h4>
<pre class="out">AS1# show spanning-tree vlan 10
VLAN0010
<span class="hl">  Root ID    Priority    24586</span>
             Cost        4
<span class="hl">             Port        2 (GigabitEthernet0/1)</span>
AS1# show cdp neighbors
Device ID    Local Intrfce   Holdtme   Capability  Platform  Port ID
DS1          Gig 0/0         152       R S I                 Gig 0/0
<span class="hl">DS2          Gig 0/1         147       R S I                 Gig 0/0</span></pre>
<p>The root port is Gi0/1 and CDP says Gi0/1 connects to DS2, so the answer is <b>DS2</b>. The running configuration explains why: DS1 has <code>spanning-tree vlan 10 priority 28672</code> and <code>vlan 20 priority 24576</code>, DS2 the opposite. The priorities are swapped, while HSRP (DS1 priority 110 for group 10, DS2 for group 20) follows the design.</p>

<h4>Task 2: realign the roots</h4>
<pre class="code">DS1(config)# spanning-tree vlan 10 root primary
DS1(config)# spanning-tree vlan 20 root secondary
DS2(config)# spanning-tree vlan 20 root primary
DS2(config)# spanning-tree vlan 10 root secondary</pre>
<p>Because DS2 already had 24576 for VLAN 10, the root primary macro on DS1 writes <b>20480</b> (4096 lower). Check the result on AS1: VLAN 10 root port Gi0/0 (DS1), VLAN 20 root port Gi0/1 (DS2).</p>

<h4>Task 3: repair the bundle</h4>
<pre class="out">DS1# show etherchannel summary
Group  Port-channel  Protocol    Ports
<span class="hl">1      Po1(SD)         LACP      Gi0/6(I)    Gi0/7(I)</span>

DS2# show etherchannel summary
Group  Port-channel  Protocol    Ports
<span class="hl">1      Po1(SU)          -        Gi0/6(P)    Gi0/7(P)</span></pre>
<p>DS1 speaks LACP (<code>mode active</code>) and receives no LACP packets, so its ports stay stand-alone (I) and its Po1 is down. DS2 uses <code>mode on</code>: no protocol ("-"), so it bundles unconditionally and believes Po1 is up. The two sides disagree, the interconnect is unusable, and anything that must cross between DS1 and DS2 at Layer 2 is forced down through AS1 and back up: the hairpin in the ticket.</p>
<pre class="code">DS2(config)# interface range g0/6 - 7
DS2(config-if-range)# no channel-group 1
DS2(config-if-range)# channel-group 1 mode active</pre>
<p>The Port-channel1 interface and its trunk settings stay in place, and the members inherit them when they rejoin. Verify Po1(SU) with both members (P) and protocol LACP on both switches.</p>

<h4>Task 4: verify gateways and reachability</h4>
<pre class="out">DS1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Vl10        10   110 P Active  local           10.1.10.3       10.1.10.1</span>
Vl20        20   100 P Standby 10.1.20.3       local           10.1.20.1
PC1&gt; ping 172.16.0.10
<span class="hl">84 bytes from 172.16.0.10 icmp_seq=1 ttl=62 time=3.112 ms</span></pre>
<p>TTL 62 means two routed hops (DS1 and R1), the direct path. Repeat from PC2 through DS2.</p>

<div class="eg"><p><b>Worked example.</b> Before the fix, a VLAN 10 frame from PC1 took AS1 → DS2 (STP forwarding uplink) → and, with the bundle broken, back down through AS1 → DS1 to reach the gateway: four link crossings for one hop of routing. After the fix it takes AS1 → DS1: one crossing. Multiply by every VLAN 10 packet in the building.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing only the first difference you find: the lab has two independent faults. Checking the bundle on one switch only; <code>mode on</code> looks perfectly healthy from its own side. Raising HSRP priority on DS2 to "follow" the wrong STP root, which just moves the problem.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>mode on</code> never exchanges LACP or PAgP packets, so it cannot detect a mismatch; pairing it with <code>active</code> leaves the LACP side stand-alone or suspended. <code>on</code> works only with <code>on</code>; <code>active</code> works with <code>active</code> or <code>passive</code>.</p></div>

<div class="scn"><h4>The RMA that undid the design</h4><p>A distribution switch failed and was replaced under RMA. The engineer restored an old configuration backup taken before the VLAN load-sharing project. It had HSRP priorities but no spanning-tree priority lines, so the surviving switch became STP root for every VLAN while HSRP still split the VLANs. A week later users on half the floors reported slow file transfers. The design review found the root/active mismatch in minutes using <code>show spanning-tree root</code> and <code>show standby brief</code> side by side. The team restored the root macros and added a post-change check that compares both commands against the design table.</p><p><b>Lesson:</b> after any hardware swap or restore, re-run the design review, not just a ping.</p></div>

<div class="iv"><p class="q">"Users say a redundant campus block is slow but nothing is down. How do you approach it?"</p><p>Start from the design intent, then check bottom-up on both distribution switches: EtherChannel state and mode, STP root per VLAN from the access switch, HSRP active per VLAN, routing adjacencies and equal-cost paths, then verify with traceroute and the MAC table on the access switch. Explain that the classic causes are a root/active mismatch, a broken or mismatched bundle, missing preempt, or a switch missing from routing, and that you document and fix every difference, not just the first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A design review compares reality with intent, layer by layer, on both peers.</li>
<li>Order: intent, bundles, STP, FHRP, routing, then verify forwarding.</li>
<li>Root port on the access switch plus CDP tells you which switch is root.</li>
<li><code>mode on</code> against <code>active</code> gives Po(SD) with (I) members on the LACP side.</li>
<li>The lab had two faults: swapped STP priorities and a channel-mode mismatch.</li>
</ul></div>
`,hi:`
<p>Building inspector deewarein todne se shuru nahi karti. Woh architect ki drawing leti hai, building ko floor by floor dekhti hai, aur har woh jagah mark karti hai jahan asliyat plan se alag hai. Network ka <b>design review</b> bhi aise hi kaam karta hai: aap <b>design intent</b> se shuru karte ho, har layer ko fixed order mein check karte ho, aur har fark list karte ho. Redundant campuses mein zyada tar "network slow hai" tickets toote links nahi hote; woh redundancy hoti hai jo ab design se match nahi karti. Yeh chapter aapko workflow deta hai aur doosri lab, <b>Design review: traffic lamba raasta le raha hai</b>, walk through karta hai.</p>

<h3>Design-review workflow</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Design review workflow">
<rect x="5" y="30" width="95" height="44" rx="8" fill="#ddd6fe"/><text x="52" y="57" text-anchor="middle" class="svg-ink" font-size="12">1 Intent</text>
<rect x="112" y="30" width="95" height="44" rx="8" fill="#bae6fd"/><text x="159" y="57" text-anchor="middle" class="svg-ink" font-size="12">2 Bundles</text>
<rect x="219" y="30" width="95" height="44" rx="8" fill="#bae6fd"/><text x="266" y="57" text-anchor="middle" class="svg-ink" font-size="12">3 STP</text>
<rect x="326" y="30" width="95" height="44" rx="8" fill="#bbf7d0"/><text x="373" y="57" text-anchor="middle" class="svg-ink" font-size="12">4 FHRP</text>
<rect x="433" y="30" width="95" height="44" rx="8" fill="#fde68a"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="12">5 Routing</text>
<rect x="540" y="30" width="95" height="44" rx="8" fill="#fed7aa"/><text x="587" y="57" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text>
<line x1="100" y1="52" x2="112" y2="52" stroke="#64748b" stroke-width="2"/><line x1="207" y1="52" x2="219" y2="52" stroke="#64748b" stroke-width="2"/><line x1="314" y1="52" x2="326" y2="52" stroke="#64748b" stroke-width="2"/><line x1="421" y1="52" x2="433" y2="52" stroke="#64748b" stroke-width="2"/><line x1="528" y1="52" x2="540" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">Har layer ko design se compare karo, dono distribution switches par</text>
</svg><p class="cap">Physical bundle se gateway aur routing tak bottom-up kaam karo, hamesha dono peers par.</p></div>
<ol>
<li><b>Design intent.</b> Likho kya sach hona chahiye: kaunsa switch kaunse VLAN ka owner hai (STP root aur HSRP active), inter-switch bundle (members aur protocol), aur kaunse switches OSPF mein hain.</li>
<li><b>Bundles.</b> Dono ends par <code>show etherchannel summary</code> aur <code>show lacp neighbor</code>. Healthy matlab Po(SU) aur har member (P).</li>
<li><b>Spanning tree.</b> Access switch par <code>show spanning-tree vlan N</code> root port dikhata hai; <code>show cdp neighbors</code> us port ko switch se map karta hai. Distribution par <code>show spanning-tree root</code>.</li>
<li><b>FHRP.</b> Dono switches par <code>show standby brief</code>: active, standby, priority, preempt flag.</li>
<li><b>Routing.</b> Distribution par <code>show ip ospf neighbor</code>, WAN router par equal-cost paths ke liye <code>show ip route ospf</code>.</li>
<li><b>Forwarding verify karo.</b> Hosts se ping aur traceroute; access switch par check karo ki kis uplink ne virtual MAC seekha.</li>
</ol>

<h3>Symptom se cause</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Likely cause</th><th>Agla check</th></tr>
<tr><td>Inter-switch link garam, har access switch ka ek uplink khaali</td><td>STP root aur HSRP active alag switches par</td><td>Access par <code>show spanning-tree vlan N</code>, <code>show standby brief</code></td></tr>
<tr><td>Ek side Po1(SD), members (I) ya (s)</td><td>Channel mode mismatch (on vs LACP) ya LACP negotiate nahi kar raha</td><td>Dono sides <code>show etherchannel summary</code>, <code>show lacp neighbor</code></td></tr>
<tr><td>Recover hone ke baad preferred switch HSRP standby hi rehta hai</td><td>Preempt missing</td><td><code>show standby</code>, "Preemption enabled" dekho</td></tr>
<tr><td>WAN router ke paas user subnet ka ek hi path</td><td>Ek distribution switch OSPF se gayab</td><td><code>show ip ospf neighbor</code>, <code>show ip route ospf</code></td></tr>
</table>

<h3>Lab walkthrough: traffic lamba raasta le raha hai</h3>
<p>Ticket: DS1–DS2 port-channel down hai aur VLAN 10 users ghoom kar jaate hain, DS2 tak upar jaate hain aur AS1 se hairpin karke DS1 tak pahunchte hain. Design intent: VLAN 10 DS1 ka, VLAN 20 DS2 ka, interconnect do members ka LACP bundle.</p>

<h4>Task 1: VLAN 10 ka root kaun hai?</h4>
<pre class="out">AS1# show spanning-tree vlan 10
VLAN0010
<span class="hl">  Root ID    Priority    24586</span>
             Cost        4
<span class="hl">             Port        2 (GigabitEthernet0/1)</span>
AS1# show cdp neighbors
Device ID    Local Intrfce   Holdtme   Capability  Platform  Port ID
DS1          Gig 0/0         152       R S I                 Gig 0/0
<span class="hl">DS2          Gig 0/1         147       R S I                 Gig 0/0</span></pre>
<p>Root port Gi0/1 hai aur CDP kehta hai Gi0/1 DS2 se juda hai, isliye answer <b>DS2</b> hai. Running configuration wajah batati hai: DS1 par <code>spanning-tree vlan 10 priority 28672</code> aur <code>vlan 20 priority 24576</code> hai, DS2 par ulta. Priorities swap hain, jabki HSRP (group 10 ke liye DS1 priority 110, group 20 ke liye DS2) design follow karta hai.</p>

<h4>Task 2: roots dobara align karo</h4>
<pre class="code">DS1(config)# spanning-tree vlan 10 root primary
DS1(config)# spanning-tree vlan 20 root secondary
DS2(config)# spanning-tree vlan 20 root primary
DS2(config)# spanning-tree vlan 10 root secondary</pre>
<p>Kyunki DS2 ke paas VLAN 10 ke liye pehle se 24576 tha, DS1 par root primary macro <b>20480</b> likhta hai (4096 kam). AS1 par result check karo: VLAN 10 root port Gi0/0 (DS1), VLAN 20 root port Gi0/1 (DS2).</p>

<h4>Task 3: bundle theek karo</h4>
<pre class="out">DS1# show etherchannel summary
Group  Port-channel  Protocol    Ports
<span class="hl">1      Po1(SD)         LACP      Gi0/6(I)    Gi0/7(I)</span>

DS2# show etherchannel summary
Group  Port-channel  Protocol    Ports
<span class="hl">1      Po1(SU)          -        Gi0/6(P)    Gi0/7(P)</span></pre>
<p>DS1 LACP bolta hai (<code>mode active</code>) aur use koi LACP packets nahi milte, isliye uske ports stand-alone (I) rehte hain aur uska Po1 down hai. DS2 <code>mode on</code> use karta hai: koi protocol nahi ("-"), isliye woh bina shart bundle karta hai aur maanta hai ki Po1 up hai. Dono sides asehmat hain, interconnect unusable hai, aur jo kuch DS1 aur DS2 ke beech Layer 2 par cross karna ho woh AS1 se neeche aur wapas upar jaane ko majboor hai: ticket wala hairpin.</p>
<pre class="code">DS2(config)# interface range g0/6 - 7
DS2(config-if-range)# no channel-group 1
DS2(config-if-range)# channel-group 1 mode active</pre>
<p>Port-channel1 interface aur uski trunk settings apni jagah rehti hain, aur members rejoin karte waqt unhe inherit karte hain. Dono switches par Po1(SU), dono members (P) aur protocol LACP verify karo.</p>

<h4>Task 4: gateways aur reachability verify karo</h4>
<pre class="out">DS1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Vl10        10   110 P Active  local           10.1.10.3       10.1.10.1</span>
Vl20        20   100 P Standby 10.1.20.3       local           10.1.20.1
PC1&gt; ping 172.16.0.10
<span class="hl">84 bytes from 172.16.0.10 icmp_seq=1 ttl=62 time=3.112 ms</span></pre>
<p>TTL 62 ka matlab do routed hops (DS1 aur R1), seedha path. PC2 se DS2 ke through repeat karo.</p>

<div class="eg"><p><b>Worked example.</b> Fix se pehle PC1 ka VLAN 10 frame AS1 → DS2 (STP forwarding uplink) → aur toote bundle ki wajah se wapas AS1 se neeche → DS1 tak gateway ke liye jaata tha: routing ke ek hop ke liye chaar link crossings. Fix ke baad AS1 → DS1: ek crossing. Isse building ke har VLAN 10 packet se guna karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf pehla fark theek karna: lab mein do independent faults hain. Bundle sirf ek switch par check karna; <code>mode on</code> apni side se bilkul healthy dikhta hai. Galat STP root ko "follow" karne ke liye DS2 par HSRP priority badhana, jo bas problem ko shift karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>mode on</code> kabhi LACP ya PAgP packets exchange nahi karta, isliye mismatch detect nahi kar sakta; use <code>active</code> ke saath jodne par LACP side stand-alone ya suspended rehti hai. <code>on</code> sirf <code>on</code> ke saath chalta hai; <code>active</code> <code>active</code> ya <code>passive</code> ke saath.</p></div>

<div class="scn"><h4>Woh RMA jisne design ulat diya</h4><p>Ek distribution switch fail hua aur RMA mein replace hua. Engineer ne VLAN load-sharing project se pehle ka purana configuration backup restore kiya. Usmein HSRP priorities thi lekin spanning-tree priority lines nahi, isliye bacha hua switch har VLAN ka STP root ban gaya jabki HSRP abhi bhi VLANs baant raha tha. Ek hafte baad aadhe floors ke users ne slow file transfers report kiye. Design review ne <code>show spanning-tree root</code> aur <code>show standby brief</code> ko saath rakh kar minutes mein root/active mismatch pakad liya. Team ne root macros restore kiye aur ek post-change check joda jo dono commands ko design table se compare karta hai.</p><p><b>Seekh:</b> kisi bhi hardware swap ya restore ke baad design review dobara chalao, sirf ping nahi.</p></div>

<div class="iv"><p class="q">"Users kehte hain ki redundant campus block slow hai lekin kuch down nahi hai. Aap kaise approach karoge?"</p><p>Design intent se shuru karo, phir dono distribution switches par bottom-up check karo: EtherChannel state aur mode, access switch se har VLAN ka STP root, har VLAN ka HSRP active, routing adjacencies aur equal-cost paths, phir traceroute aur access switch ki MAC table se verify karo. Samjhao ki classic causes hain root/active mismatch, toota ya mismatched bundle, missing preempt, ya routing se gayab switch, aur aap har fark document aur fix karte ho, sirf pehla nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design review asliyat ko intent se compare karta hai, layer by layer, dono peers par.</li>
<li>Order: intent, bundles, STP, FHRP, routing, phir forwarding verify.</li>
<li>Access switch ka root port plus CDP batata hai ki root kaunsa switch hai.</li>
<li><code>mode on</code> vs <code>active</code> LACP side par Po(SD) aur (I) members deta hai.</li>
<li>Lab mein do faults the: swapped STP priorities aur channel-mode mismatch.</li>
</ul></div>
`}};export{e as default};