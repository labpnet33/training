var e={id:`overview`,h:{en:`Spanning tree: what you will learn and why loops are deadly`,hi:`Spanning tree: kya seekhoge aur loops itne khatarnaak kyun`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn why redundant Layer 2 links create loops, how the Spanning Tree Protocol (STP) and its fast version RSTP break those loops, how a root bridge is elected, which role and state each port gets, how to place the root where you want it with <code>bridge-priority</code> and steer paths with <code>cost</code>, how edge ports speed up access links, and how to troubleshoot a tree that has grown the wrong way. This is the Spanning Tree part of the JNCIS-ENT exam (JN0-352).</p>
<p><b>Prerequisites.</b> You should have finished <b>JNCIA CLI</b> and the <b>Layer 2 switching</b> module: VLANs, access and trunk ports, MAC learning, IRB. You must be able to use <code>configure</code>, <code>set</code>, <code>show | compare</code> and <code>commit</code> without thinking.</p>

<h3>Analogy: one-way roundabouts in a ring of lanes</h3>
<p>A city has two roads between the station and the market so that if one is closed, the other still works. That is good for cars, because cars have a fuel tank and a driver who stops. Now imagine a car that never runs out of fuel and makes a copy of itself at every junction. With a ring of roads, the copies chase each other round and round until the whole city is jammed. An Ethernet broadcast frame behaves like that car: it has no time-to-live. Spanning tree is the traffic police: they keep both roads built, but put a barrier on one of them so that the roads form a tree with no ring. If the open road is damaged, the barrier is lifted.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Loop versus tree">
<rect x="20" y="20" width="270" height="190" rx="10" fill="#fef2f2" stroke="#fca5a5"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">Without STP: loop</text>
<rect x="40" y="70" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="85" y="93" text-anchor="middle" class="svg-ink" font-size="12">SW-A</text>
<rect x="180" y="70" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="225" y="93" text-anchor="middle" class="svg-ink" font-size="12">SW-B</text>
<rect x="110" y="150" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="155" y="173" text-anchor="middle" class="svg-ink" font-size="12">SW-C</text>
<line x1="130" y1="88" x2="180" y2="88" stroke="#64748b" stroke-width="2"/><line x1="70" y1="106" x2="130" y2="150" stroke="#64748b" stroke-width="2"/><line x1="240" y1="106" x2="180" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="155" y="125" text-anchor="middle" class="svg-accent" font-size="12">frames circle forever</text>
<rect x="350" y="20" width="270" height="190" rx="10" fill="#f0fdf4" stroke="#86efac"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">With STP: tree</text>
<rect x="370" y="70" width="90" height="36" rx="8" fill="#fde68a"/><text x="415" y="93" text-anchor="middle" class="svg-ink" font-size="12">SW-A root</text>
<rect x="510" y="70" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="555" y="93" text-anchor="middle" class="svg-ink" font-size="12">SW-B</text>
<rect x="440" y="150" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="485" y="173" text-anchor="middle" class="svg-ink" font-size="12">SW-C</text>
<line x1="460" y1="88" x2="510" y2="88" stroke="#64748b" stroke-width="2"/><line x1="400" y1="106" x2="460" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="570" y1="106" x2="510" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="560" y="135" text-anchor="middle" class="svg-muted" font-size="12">blocked</text>
</svg><p class="cap">Three switches in a triangle. STP leaves all cables in place but blocks one port.</p></div>

<h3>What exactly goes wrong in a loop?</h3>
<ul>
<li><b>Broadcast storm:</b> a broadcast or unknown unicast frame is flooded by every switch, comes back round the ring and is flooded again. Ethernet frames have no TTL, so it never dies. Link capacity and switch CPUs fill within seconds.</li>
<li><b>MAC table instability:</b> the same source MAC arrives on two different ports in turn, so the table keeps changing (MAC flapping).</li>
<li><b>Duplicate frames:</b> a host may receive several copies of one unicast frame.</li>
</ul>
<p>Spanning tree solves all three by choosing one switch as the <b>root</b>, computing the best path from every switch to it, and blocking every other path.</p>

<h3>The family of protocols</h3>
<table class="cmp"><tr><th>Protocol</th><th>Standard</th><th>Idea</th></tr>
<tr><td>STP</td><td>802.1D</td><td>The original; converges in 30 to 50 seconds</td></tr>
<tr><td>RSTP</td><td>802.1w</td><td>Rapid; about one second on point-to-point links; default on EX</td></tr>
<tr><td>MSTP</td><td>802.1s</td><td>Several trees, each for a group of VLANs</td></tr>
<tr><td>VSTP</td><td>Juniper, like PVST+</td><td>One tree per VLAN</td></tr></table>
<p>This module concentrates on RSTP, because it is on by default for most EX deployments and is the base of the others. You will practise on the same lab devices you will find in the simulator: DSW1, DSW2 and FLOOR2 in Noida (root election) and DIST1, DIST2, ACC1 in Kochi (a troubleshooting ticket).</p>

<div class="eg"><p><b>Worked example.</b> Three switches are wired in a triangle with 1 Gbit/s links. Without STP a single ARP broadcast from a PC is flooded in both directions around the ring and copies keep multiplying. With RSTP, one of the three links is placed in the discarding state. The cable stays plugged in, the lights stay green, but no user frames cross it. If another link fails, the blocked port comes into service within about a second.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating a blocked port as a fault. A blocked (alternate) port is a healthy standby. The mistake in the opposite direction is the real danger: disabling spanning tree because it "makes ports go blocking", and then creating a loop with one stray cable.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam asks which protocol is the default on EX switches and how fast it converges. The answer is RSTP and about one second; classic STP takes 30 to 50 seconds.</p></div>

<div class="scn"><h4>The Monday broadcast storm</h4><p>A technician plugged a patch cable between two wall ports in a meeting room "to test them". The floor switch had spanning tree turned off by a previous engineer. Within a minute every switch in the building was at 100 percent CPU and phones went offline. Re-enabling RSTP and removing the cable restored service.</p><p><b>Lesson:</b> keep spanning tree on, and treat edge ports and protection features (a later module) as part of the design.</p></div>

<div class="iv"><p class="q">"Why do we need spanning tree?"</p><p>Redundant Layer 2 paths create loops. Ethernet frames have no TTL, so broadcasts circulate and multiply, MAC tables flap and the network collapses. Spanning tree keeps the redundant cables but blocks enough ports to leave a loop-free tree, and unblocks a port when an active link fails. Name RSTP as the fast, default version.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 loops cause broadcast storms, MAC flapping and duplicate frames because frames have no TTL.</li>
<li>STP blocks redundant ports so the active topology is a tree rooted at one switch.</li>
<li>RSTP (802.1w) is the default on EX and converges in about a second.</li>
<li>MSTP and VSTP build several trees on the same rules.</li>
<li>A blocked port is a healthy standby, not a fault.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki redundant Layer 2 links loops kyun banate hain, Spanning Tree Protocol (STP) aur uska fast version RSTP un loops ko kaise todte hain, root bridge kaise chuna jaata hai, har port ko kaunsa role aur state milta hai, <code>bridge-priority</code> se root ko apni pasand ki jagah kaise rakhte hain aur <code>cost</code> se paths kaise steer karte hain, edge ports access links ko kaise tez karte hain, aur galat taraf ugge tree ko troubleshoot kaise karte hain. Yeh JNCIS-ENT exam (JN0-352) ka Spanning Tree hissa hai.</p>
<p><b>Prerequisites.</b> Aapne <b>JNCIA CLI</b> aur <b>Layer 2 switching</b> module khatam kiye hone chahiye: VLANs, access aur trunk ports, MAC learning, IRB. Aapko <code>configure</code>, <code>set</code>, <code>show | compare</code> aur <code>commit</code> bina soche chalana aana chahiye.</p>

<h3>Analogy: lanes ke ring mein one-way roundabouts</h3>
<p>Ek shehar mein station aur market ke beech do roads hain taaki ek band ho to doosri chale. Gaadiyon ke liye yeh achha hai, kyunki gaadi mein fuel tank hota hai aur driver ruk jaata hai. Ab socho ek aisi gaadi jisme fuel kabhi khatam nahi hota aur jo har junction par apni copy bana leti hai. Roads ke ring mein copies ek doosre ka peecha karti rehti hain jab tak poora shehar jam na ho jaaye. Ethernet broadcast frame usi gaadi jaisa hai: usme time-to-live nahi hota. Spanning tree traffic police hai: dono roads bani rehti hain, lekin ek par barrier laga deti hai taaki roads ring ki jagah tree banayein. Khuli road kharab ho jaaye to barrier hata di jaati hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Loop versus tree">
<rect x="20" y="20" width="270" height="190" rx="10" fill="#fef2f2" stroke="#fca5a5"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">STP ke bina: loop</text>
<rect x="40" y="70" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="85" y="93" text-anchor="middle" class="svg-ink" font-size="12">SW-A</text>
<rect x="180" y="70" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="225" y="93" text-anchor="middle" class="svg-ink" font-size="12">SW-B</text>
<rect x="110" y="150" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="155" y="173" text-anchor="middle" class="svg-ink" font-size="12">SW-C</text>
<line x1="130" y1="88" x2="180" y2="88" stroke="#64748b" stroke-width="2"/><line x1="70" y1="106" x2="130" y2="150" stroke="#64748b" stroke-width="2"/><line x1="240" y1="106" x2="180" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="155" y="125" text-anchor="middle" class="svg-accent" font-size="12">frames hamesha ghoomte hain</text>
<rect x="350" y="20" width="270" height="190" rx="10" fill="#f0fdf4" stroke="#86efac"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">STP ke saath: tree</text>
<rect x="370" y="70" width="90" height="36" rx="8" fill="#fde68a"/><text x="415" y="93" text-anchor="middle" class="svg-ink" font-size="12">SW-A root</text>
<rect x="510" y="70" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="555" y="93" text-anchor="middle" class="svg-ink" font-size="12">SW-B</text>
<rect x="440" y="150" width="90" height="36" rx="8" fill="#ddd6fe"/><text x="485" y="173" text-anchor="middle" class="svg-ink" font-size="12">SW-C</text>
<line x1="460" y1="88" x2="510" y2="88" stroke="#64748b" stroke-width="2"/><line x1="400" y1="106" x2="460" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="570" y1="106" x2="510" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="560" y="135" text-anchor="middle" class="svg-muted" font-size="12">blocked</text>
</svg><p class="cap">Triangle mein teen switches. STP saari cables lagi rehne deta hai lekin ek port block kar deta hai.</p></div>

<h3>Loop mein asal mein kya bigadta hai?</h3>
<ul>
<li><b>Broadcast storm:</b> broadcast ya unknown unicast frame har switch flood karta hai, ring mein ghoom kar wapas aata hai aur phir flood hota hai. Ethernet frames mein TTL nahi hota, isliye woh kabhi nahi marta. Seconds mein link capacity aur switch CPUs bhar jaate hain.</li>
<li><b>MAC table instability:</b> wahi source MAC baari-baari se do alag ports par aata hai, isliye table badalta rehta hai (MAC flapping).</li>
<li><b>Duplicate frames:</b> host ko ek unicast frame ki kai copies mil sakti hain.</li>
</ul>
<p>Spanning tree teeno ko solve karta hai: ek switch ko <b>root</b> chunta hai, har switch se uske liye sabse achha path nikalta hai, aur baaki sab paths block kar deta hai.</p>

<h3>Protocols ka parivaar</h3>
<table class="cmp"><tr><th>Protocol</th><th>Standard</th><th>Idea</th></tr>
<tr><td>STP</td><td>802.1D</td><td>Original; 30 se 50 seconds mein converge</td></tr>
<tr><td>RSTP</td><td>802.1w</td><td>Rapid; point-to-point links par lagbhag ek second; EX par default</td></tr>
<tr><td>MSTP</td><td>802.1s</td><td>Kai trees, har ek VLANs ke group ke liye</td></tr>
<tr><td>VSTP</td><td>Juniper, PVST+ jaisa</td><td>Har VLAN ke liye ek tree</td></tr></table>
<p>Yeh module RSTP par focus karta hai, kyunki yeh zyadatar EX deployments mein default on hai aur baaki ka aadhaar hai. Aap simulator ke wahi lab devices par practice karoge: Noida mein DSW1, DSW2 aur FLOOR2 (root election) aur Kochi mein DIST1, DIST2, ACC1 (troubleshooting ticket).</p>

<div class="eg"><p><b>Worked example.</b> Teen switches triangle mein 1 Gbit/s links se jude hain. STP ke bina PC ka ek ARP broadcast ring mein dono taraf flood hota hai aur copies badhti rehti hain. RSTP ke saath teen mein se ek link discarding state mein rakhi jaati hai. Cable lagi rehti hai, lights green rehti hain, lekin us par koi user frame nahi jaata. Koi aur link fail ho to blocked port lagbhag ek second mein kaam sambhal leta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Blocked port ko fault samajhna. Blocked (alternate) port ek healthy standby hai. Ulti taraf ki galti asli khatra hai: "ports blocking mein jaate hain" kehkar spanning tree disable kar dena, aur phir ek stray cable se loop bana dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochta hai ki EX switches par default protocol kaunsa hai aur kitni tez converge karta hai. Jawab RSTP aur lagbhag ek second; classic STP 30 se 50 seconds leta hai.</p></div>

<div class="scn"><h4>Monday ka broadcast storm</h4><p>Ek technician ne meeting room mein "test karne" ke liye do wall ports ke beech patch cable laga di. Floor switch par pichhle engineer ne spanning tree band kar rakha tha. Ek minute mein building ke har switch ka CPU 100 percent ho gaya aur phones offline ho gaye. RSTP dobara enable karke aur cable hatakar service wapas aayi.</p><p><b>Lesson:</b> spanning tree on rakho, aur edge ports aur protection features (agla module) ko design ka hissa maano.</p></div>

<div class="iv"><p class="q">"Spanning tree ki zaroorat kyun hai?"</p><p>Redundant Layer 2 paths loops banate hain. Ethernet frames mein TTL nahi hota, isliye broadcasts ghoomte aur badhte hain, MAC tables flap karte hain aur network collapse ho jaata hai. Spanning tree redundant cables rakhta hai lekin itne ports block karta hai ki loop-free tree bache, aur active link fail hone par ek port unblock karta hai. RSTP ko fast, default version ke roop mein batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 loops broadcast storms, MAC flapping aur duplicate frames banate hain kyunki frames mein TTL nahi hota.</li>
<li>STP redundant ports block karta hai taaki active topology ek switch par rooted tree ho.</li>
<li>RSTP (802.1w) EX par default hai aur lagbhag ek second mein converge hota hai.</li>
<li>MSTP aur VSTP wahi niyamon par kai trees banate hain.</li>
<li>Blocked port healthy standby hai, fault nahi.</li>
</ul></div>
`}};export{e as default};