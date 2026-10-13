var e={id:`structured-approaches`,h:{en:`Structured approaches: choosing where to start`,hi:`Structured approaches: kahan se shuru karein, yeh chunna`},body:{en:`
<p>Imagine a water pipe from a tank on the roof to a tap in the kitchen, and no water comes out of the tap. You could start at the tank and walk down (is there water, is the valve open?), start at the tap and walk up, or cut into the pipe halfway and see if water is flowing there. If a neighbour has the same plumbing and their tap works, you could compare the two houses. Or you could simply replace the tap. Each of those is a real troubleshooting approach, and each is best in a different situation. Step 4 of the process in chapter 2 said "eliminate potential causes". The approaches in this chapter are the ways you do that efficiently.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Top-down, bottom-up and divide and conquer">
<rect x="220" y="20" width="200" height="28" rx="4" fill="#ddd6fe"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="12">7 Application</text>
<rect x="220" y="52" width="200" height="28" rx="4" fill="#ddd6fe"/><text x="320" y="71" text-anchor="middle" class="svg-ink" font-size="12">6 Presentation</text>
<rect x="220" y="84" width="200" height="28" rx="4" fill="#ddd6fe"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="12">5 Session</text>
<rect x="220" y="116" width="200" height="28" rx="4" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">4 Transport</text>
<rect x="220" y="148" width="200" height="28" rx="4" fill="#fed7aa"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="12">3 Network</text>
<rect x="220" y="180" width="200" height="28" rx="4" fill="#bae6fd"/><text x="320" y="199" text-anchor="middle" class="svg-ink" font-size="12">2 Data link</text>
<rect x="220" y="212" width="200" height="28" rx="4" fill="#bae6fd"/><text x="320" y="231" text-anchor="middle" class="svg-ink" font-size="12">1 Physical</text>
<line x1="160" y1="30" x2="160" y2="230" stroke="#64748b" stroke-width="2"/><polygon points="154,222 166,222 160,236" fill="#64748b"/><text x="150" y="130" text-anchor="end" class="svg-ink" font-size="12">top-down</text>
<line x1="480" y1="230" x2="480" y2="30" stroke="#64748b" stroke-width="2"/><polygon points="474,38 486,38 480,24" fill="#64748b"/><text x="490" y="130" class="svg-ink" font-size="12">bottom-up</text>
<text x="430" y="166" class="svg-accent" font-size="12">start here: ping</text>
<text x="20" y="252" class="svg-muted" font-size="12">Divide and conquer starts at Layer 3 and moves up or down</text>
</svg><p class="cap">Three layer-based approaches: from the top, from the bottom, or from the middle.</p></div>

<h3>1. Top-down</h3>
<p>Start at the application layer and work down. Does the application respond? Is the port reachable? Is there IP reachability? Is the link up? Use top-down when the complaint is specific to one application and other traffic is fine, for example "SSH to SRV1 works but HTTPS does not". You will usually find the fault at Layer 4 to 7: an ACL, a firewall rule, a NAT translation or a service that is not listening.</p>

<h3>2. Bottom-up</h3>
<p>Start with cables, optics and interface counters, then Layer 2 (VLANs, trunks, STP), then Layer 3. Use bottom-up when the symptoms smell physical: interfaces flapping, CRC and input errors, a new installation or a recent patch-panel move. It is thorough but slow when the fault is high up the stack, because you check a lot of healthy things first.</p>

<h3>3. Divide and conquer</h3>
<p>Start in the middle, usually with a Layer 3 test such as a ping between the two endpoints. If the ping works, Layers 1 to 3 on that path are healthy and you move up. If it fails, you move down. Divide and conquer is the default choice when you have no strong clue, because one test halves the search space.</p>

<h3>4. Follow the traffic path</h3>
<p>Start at the source and follow the packet hop by hop toward the destination, checking the forwarding decision on each device (and then the return path back). Routing problems suit this approach perfectly: on each router you ask "what does this router do with a packet to SRV1?" Traceroute is the quick version of it:</p>
<pre class="out">R1# traceroute 10.3.30.10 source 10.1.10.1 numeric
Type escape sequence to abort.
Tracing the route to 10.3.30.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.0.12.2 1 msec 1 msec 1 msec
<span class="hl">  2 10.0.23.2 2 msec 1 msec 2 msec</span>
<span class="hl">  3  *  *  *</span></pre>
<p>The trace reaches R3 (10.0.23.2) and stops. Either R3 cannot deliver to SRV1, something blocks the traffic after R3, or the <b>replies</b> cannot find their way back. Traceroute only tells you where replies stopped arriving, so the next step is to log in to R3 and check both directions.</p>

<h3>5. Compare configurations</h3>
<p>Compare the broken device with a working one (another branch router built from the same template), or compare today's configuration with the last known good configuration. It works even when you do not fully understand the technology, which also makes it risky: you may copy a difference that is not the cause. IOS can do the comparison for you:</p>
<pre class="out">R3# show archive config differences flash:R3-baseline.cfg system:running-config
!Contextual Config Diffs:
+ip access-list extended SRV-PROTECT
 +permit icmp any any
 +permit tcp any any eq 22
 +deny ip any any log
<span class="hl">interface GigabitEthernet0/2
 +ip access-group SRV-PROTECT out</span></pre>

<h3>6. Component swapping</h3>
<p>Replace a suspected part with a known-good one: a cable, an optic, a line card, a whole router. If the problem moves with the part, you found it. It is useful for hardware faults and when remote hands can do it quickly, but it proves little about configuration faults, it needs spares, and you may introduce a new variable (different software, different config).</p>

<table class="cmp"><tr><th>Approach</th><th>Best when</th><th>Weakness</th></tr>
<tr><td>Top-down</td><td>One application fails, others work</td><td>Slow for physical faults</td></tr>
<tr><td>Bottom-up</td><td>Physical symptoms, new install</td><td>Slow for application faults</td></tr>
<tr><td>Divide and conquer</td><td>No strong clue; general default</td><td>Needs an experienced choice of first test</td></tr>
<tr><td>Follow the path</td><td>Routing and reachability problems</td><td>Needs access to every hop</td></tr>
<tr><td>Compare configurations</td><td>Working twin or baseline exists</td><td>Copies differences that are not the cause</td></tr>
<tr><td>Component swapping</td><td>Suspected hardware</td><td>Needs spares; weak for config faults</td></tr>
</table>

<div class="eg"><p><b>Worked example: choosing an approach.</b> Three tickets arrive. Ticket A: "R1 Gi0/0 has 4,812 CRC errors and OSPF flaps." Physical symptom, so bottom-up: check the cable, optic and duplex first. Ticket B: "PC1 cannot reach SRV1 at all, since this morning." No clue about the layer, so divide and conquer with a ping, then follow the path with traceroute and <code>show ip route 10.3.30.10</code> on each hop. Ticket C: "HTTPS to SRV1 fails, ping works." Layer 3 is proven, so top-down from the application: check ACLs and the service on SRV1.</p></div>

<div class="warn"><p><b>Common mistake.</b> Following the path only in the forward direction. A large share of routing faults are on the <b>return path</b>: SRV1's replies go to R3, and R3 has no route back to 10.1.10.0/24. Always ask "can the reply come back?"</p></div>

<div class="exam"><p><b>Exam trap.</b> If a question says the user can ping but not browse, the answer is almost never a routing protocol problem. If a question describes CRC errors or late collisions, the correct first approach is bottom-up, not divide and conquer.</p></div>

<div class="scn"><h4>The template that did not match</h4><p>A new branch router could not bring up its EIGRP neighbour to the hub, while 40 other branches built from the same template worked. The engineer used compare configurations: a diff of the new router against a working branch showed <code>router eigrp 110</code> instead of <code>router eigrp 100</code>, a typo during staging. Correcting the AS number brought the neighbour up in seconds.</p><p><b>Lesson:</b> when you have a working twin, a configuration diff is often the fastest approach of all, even before reading protocol output.</p></div>

<div class="iv"><p class="q">"Name some troubleshooting approaches and tell me when you would use each."</p><p>List top-down, bottom-up, divide and conquer, follow the traffic path, compare configurations and component swapping. Give one example each: top-down for "one app fails", bottom-up for CRC errors, divide and conquer with a ping when you have no clue, follow the path for routing, compare configs against a working twin, swap components for suspected hardware. Mention checking the return path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Six approaches: top-down, bottom-up, divide and conquer, follow the traffic path, compare configurations, component swapping.</li>
<li>Pick the approach from the symptom: application-only failure means top-down, physical errors mean bottom-up, no clue means divide and conquer.</li>
<li>Follow the path is the natural approach for routing faults; always check the return path too.</li>
<li><code>show archive config differences</code> compares a saved good configuration with the running one.</li>
<li>Component swapping proves hardware faults but says little about configuration faults.</li>
</ul></div>
`,hi:`
<p>Chhat par tank se kitchen ke nal tak ek paani ki pipe socho, aur nal se paani nahi aa raha. Aap tank se shuru karke neeche aa sakte ho (paani hai, valve khula hai?), nal se shuru karke upar jaa sakte ho, ya pipe ko beech mein kaat kar dekh sakte ho ki wahan paani beh raha hai ya nahi. Agar padosi ki plumbing same hai aur unka nal chal raha hai, to aap dono gharon ko compare kar sakte ho. Ya seedha nal badal sakte ho. Inmein se har ek asli troubleshooting approach hai, aur har ek alag situation mein best hai. Chapter 2 ke process ka step 4 kehta tha "potential causes eliminate karo". Is chapter ke approaches woh tarike hain jinse aap yeh efficiently karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Top-down, bottom-up and divide and conquer">
<rect x="220" y="20" width="200" height="28" rx="4" fill="#ddd6fe"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="12">7 Application</text>
<rect x="220" y="52" width="200" height="28" rx="4" fill="#ddd6fe"/><text x="320" y="71" text-anchor="middle" class="svg-ink" font-size="12">6 Presentation</text>
<rect x="220" y="84" width="200" height="28" rx="4" fill="#ddd6fe"/><text x="320" y="103" text-anchor="middle" class="svg-ink" font-size="12">5 Session</text>
<rect x="220" y="116" width="200" height="28" rx="4" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">4 Transport</text>
<rect x="220" y="148" width="200" height="28" rx="4" fill="#fed7aa"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="12">3 Network</text>
<rect x="220" y="180" width="200" height="28" rx="4" fill="#bae6fd"/><text x="320" y="199" text-anchor="middle" class="svg-ink" font-size="12">2 Data link</text>
<rect x="220" y="212" width="200" height="28" rx="4" fill="#bae6fd"/><text x="320" y="231" text-anchor="middle" class="svg-ink" font-size="12">1 Physical</text>
<line x1="160" y1="30" x2="160" y2="230" stroke="#64748b" stroke-width="2"/><polygon points="154,222 166,222 160,236" fill="#64748b"/><text x="150" y="130" text-anchor="end" class="svg-ink" font-size="12">top-down</text>
<line x1="480" y1="230" x2="480" y2="30" stroke="#64748b" stroke-width="2"/><polygon points="474,38 486,38 480,24" fill="#64748b"/><text x="490" y="130" class="svg-ink" font-size="12">bottom-up</text>
<text x="430" y="166" class="svg-accent" font-size="12">yahan se shuru: ping</text>
<text x="20" y="252" class="svg-muted" font-size="12">Divide and conquer Layer 3 se shuru hota hai aur upar ya neeche jaata hai</text>
</svg><p class="cap">Teen layer-based approaches: upar se, neeche se, ya beech se.</p></div>

<h3>1. Top-down</h3>
<p>Application layer se shuru karke neeche aao. Kya application respond karti hai? Kya port reachable hai? Kya IP reachability hai? Kya link up hai? Top-down tab use karo jab complaint ek application tak seemit ho aur baaki traffic theek ho, jaise "SRV1 par SSH chalta hai par HTTPS nahi". Aam taur par fault Layer 4 se 7 par milega: ACL, firewall rule, NAT translation ya aisi service jo listen nahi kar rahi.</p>

<h3>2. Bottom-up</h3>
<p>Cables, optics aur interface counters se shuru karo, phir Layer 2 (VLANs, trunks, STP), phir Layer 3. Bottom-up tab use karo jab symptoms physical lagein: interfaces flap ho rahe hain, CRC aur input errors, naya installation ya haal ka patch-panel move. Yeh thorough hai par jab fault stack mein upar ho to dheema hai, kyunki aap pehle bahut saari healthy cheezein check karte ho.</p>

<h3>3. Divide and conquer</h3>
<p>Beech se shuru karo, aam taur par Layer 3 test jaise dono endpoints ke beech ping. Agar ping chalta hai, to us path par Layers 1 se 3 healthy hain aur aap upar jaate ho. Agar fail hota hai, to neeche jaate ho. Jab koi strong clue na ho to divide and conquer default choice hai, kyunki ek test search space ko aadha kar deta hai.</p>

<h3>4. Traffic path follow karo</h3>
<p>Source se shuru karke packet ko hop by hop destination tak follow karo, har device par forwarding decision check karte hue (aur phir return path wapas). Routing problems ke liye yeh approach bilkul fit hai: har router par aap poochte ho "yeh router SRV1 ke packet ke saath kya karta hai?" Traceroute iska jaldi wala version hai:</p>
<pre class="out">R1# traceroute 10.3.30.10 source 10.1.10.1 numeric
Type escape sequence to abort.
Tracing the route to 10.3.30.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.0.12.2 1 msec 1 msec 1 msec
<span class="hl">  2 10.0.23.2 2 msec 1 msec 2 msec</span>
<span class="hl">  3  *  *  *</span></pre>
<p>Trace R3 (10.0.23.2) tak pahunchta hai aur ruk jaata hai. Ya to R3 SRV1 tak deliver nahi kar pa raha, ya R3 ke baad kuch traffic block kar raha hai, ya <b>replies</b> wapas ka raasta nahi dhoondh pa rahe. Traceroute sirf yeh batata hai ki replies kahan aana band hue, isliye agla step R3 par login karke dono directions check karna hai.</p>

<h3>5. Configurations compare karo</h3>
<p>Toote device ko ek working device se compare karo (same template se bana doosra branch router), ya aaj ki configuration ko last known good configuration se compare karo. Yeh tab bhi kaam karta hai jab aap technology poori tarah na samjho, jo ise risky bhi banata hai: aap aisa difference copy kar sakte ho jo cause nahi hai. IOS aapke liye comparison kar sakta hai:</p>
<pre class="out">R3# show archive config differences flash:R3-baseline.cfg system:running-config
!Contextual Config Diffs:
+ip access-list extended SRV-PROTECT
 +permit icmp any any
 +permit tcp any any eq 22
 +deny ip any any log
<span class="hl">interface GigabitEthernet0/2
 +ip access-group SRV-PROTECT out</span></pre>

<h3>6. Component swapping</h3>
<p>Shak wale part ko known-good part se badlo: cable, optic, line card, poora router. Agar problem part ke saath move hoti hai, to aapko mil gaya. Yeh hardware faults ke liye aur jab remote hands jaldi kar sakein tab useful hai, par configuration faults ke baare mein kam sabit karta hai, spares chahiye, aur aap ek naya variable la sakte ho (alag software, alag config).</p>

<table class="cmp"><tr><th>Approach</th><th>Kab best</th><th>Kamzori</th></tr>
<tr><td>Top-down</td><td>Ek application fail, baaki chal rahi</td><td>Physical faults ke liye dheema</td></tr>
<tr><td>Bottom-up</td><td>Physical symptoms, naya install</td><td>Application faults ke liye dheema</td></tr>
<tr><td>Divide and conquer</td><td>Koi strong clue nahi; general default</td><td>Pehla test chunne ke liye experience chahiye</td></tr>
<tr><td>Path follow karo</td><td>Routing aur reachability problems</td><td>Har hop ka access chahiye</td></tr>
<tr><td>Configurations compare karo</td><td>Working twin ya baseline maujood</td><td>Aise differences copy karta hai jo cause nahi</td></tr>
<tr><td>Component swapping</td><td>Hardware par shak</td><td>Spares chahiye; config faults ke liye kamzor</td></tr>
</table>

<div class="eg"><p><b>Worked example: approach chunna.</b> Teen tickets aate hain. Ticket A: "R1 Gi0/0 par 4,812 CRC errors hain aur OSPF flap ho raha hai." Physical symptom, isliye bottom-up: pehle cable, optic aur duplex check karo. Ticket B: "PC1 aaj subah se SRV1 tak bilkul nahi pahunch raha." Layer ka koi clue nahi, isliye ping ke saath divide and conquer, phir traceroute aur har hop par <code>show ip route 10.3.30.10</code> se path follow karo. Ticket C: "SRV1 par HTTPS fail, ping chalta hai." Layer 3 sabit hai, isliye application se top-down: ACLs aur SRV1 par service check karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Path sirf forward direction mein follow karna. Routing faults ka bada hissa <b>return path</b> par hota hai: SRV1 ke replies R3 par jaate hain, aur R3 ke paas 10.1.10.0/24 ka wapas route nahi hai. Hamesha poochho "kya reply wapas aa sakta hai?"</p></div>

<div class="exam"><p><b>Exam trap.</b> Agar question kehta hai ki user ping kar sakta hai par browse nahi, to jawab lagbhag kabhi routing protocol problem nahi hota. Agar question CRC errors ya late collisions describe karta hai, to sahi pehla approach bottom-up hai, divide and conquer nahi.</p></div>

<div class="scn"><h4>Template jo match nahi hua</h4><p>Ek naya branch router hub tak apna EIGRP neighbour up nahi kar pa raha tha, jabki same template se bani 40 doosri branches chal rahi thi. Engineer ne compare configurations use kiya: naye router ka ek working branch se diff karne par <code>router eigrp 100</code> ki jagah <code>router eigrp 110</code> dikha, staging ke dauraan hua typo. AS number theek karte hi neighbour seconds mein up ho gaya.</p><p><b>Seekh:</b> jab working twin ho, to configuration diff aksar sabse tez approach hota hai, protocol output padhne se bhi pehle.</p></div>

<div class="iv"><p class="q">"Kuch troubleshooting approaches batao aur bataao aap har ek kab use karoge."</p><p>Top-down, bottom-up, divide and conquer, follow the traffic path, compare configurations aur component swapping list karo. Har ek ka ek example do: "ek app fail" ke liye top-down, CRC errors ke liye bottom-up, koi clue na ho to ping ke saath divide and conquer, routing ke liye path follow karo, working twin se configs compare karo, hardware par shak ho to components swap karo. Return path check karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe approaches: top-down, bottom-up, divide and conquer, follow the traffic path, compare configurations, component swapping.</li>
<li>Approach symptom se chuno: sirf application failure matlab top-down, physical errors matlab bottom-up, koi clue nahi matlab divide and conquer.</li>
<li>Routing faults ke liye path follow karna natural approach hai; return path bhi hamesha check karo.</li>
<li><code>show archive config differences</code> saved good configuration ko running wali se compare karta hai.</li>
<li>Component swapping hardware faults sabit karta hai par configuration faults ke baare mein kam batata hai.</li>
</ul></div>
`}};export{e as default};