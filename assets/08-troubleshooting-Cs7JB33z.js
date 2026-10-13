var e={id:`troubleshooting`,h:{en:`Troubleshooting tunnels and the recursive-routing trap`,hi:`Tunnels ki troubleshooting aur recursive-routing ka jaal`},body:{en:`
<p>Tunnel faults look dramatic ("the whole branch is down") but nearly all of them fall into five buckets. A fixed workflow, always in the same order, finds them quickly. This chapter gives you that workflow and then walks through the second lab, where two faults hide behind each other.</p>

<h3>The five-step workflow</h3>
<ol>
<li><b>Underlay first.</b> Can each router reach the other's tunnel address? <code>show route 203.0.113.25</code> and <code>ping 203.0.113.25</code> (sourced from the WAN address). No underlay, no tunnel.</li>
<li><b>Tunnel definition.</b> <code>show interfaces ip-0/0/0.0 detail</code> on <i>both</i> routers. Source and destination must be mirror images, the protocol must match (47 or 4), and the unit must be Up.</li>
<li><b>Overlay reachability.</b> Ping the far overlay address (172.31.7.2). If this works, the tunnel is fine and any remaining fault is routing.</li>
<li><b>Routing over the tunnel.</b> <code>show ospf neighbor</code>, <code>show route</code> for the remote LAN. Is the prefix learned, and via the tunnel unit?</li>
<li><b>Size and stability.</b> Large DF pings for MTU, <code>show log messages</code> for flapping, keepalive state for GRE.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Tunnel troubleshooting order">
<rect x="10" y="40" width="112" height="60" rx="8" fill="#bae6fd"/><text x="66" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay</text><text x="66" y="84" text-anchor="middle" class="svg-muted" font-size="11">route + ping</text>
<rect x="134" y="40" width="112" height="60" rx="8" fill="#bbf7d0"/><text x="190" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Definition</text><text x="190" y="84" text-anchor="middle" class="svg-muted" font-size="11">both ends</text>
<rect x="258" y="40" width="112" height="60" rx="8" fill="#ddd6fe"/><text x="314" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Overlay</text><text x="314" y="84" text-anchor="middle" class="svg-muted" font-size="11">ping far /30</text>
<rect x="382" y="40" width="112" height="60" rx="8" fill="#fde68a"/><text x="438" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Routing</text><text x="438" y="84" text-anchor="middle" class="svg-muted" font-size="11">OSPF + routes</text>
<rect x="506" y="40" width="124" height="60" rx="8" fill="#fed7aa"/><text x="568" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Size, flaps</text><text x="568" y="84" text-anchor="middle" class="svg-muted" font-size="11">MTU, log</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Work left to right; stop at the first step that fails</text>
</svg><p class="cap">Each step proves one layer, so a failure points to exactly one place.</p></div>

<h3>Lab walkthrough: the IP-IP tunnel that keeps falling over</h3>
<p>Bhopal (R1) and Indore (R3) run an IP-IP tunnel on ip-0/0/0.0 with OSPF. The PCs never reach each other. The lab asks you to find and fix two faults.</p>

<h4>Fault 1: the tunnel points at the wrong router</h4>
<p>Step 2 of the workflow already catches it. On R1:</p>
<pre class="out">lab@R1&gt; show interfaces ip-0/0/0.0 detail
    Tunnel source 203.0.113.17, destination <span class="hl">203.0.113.26</span>, IP protocol 4 (IP-IP), TTL 64
    Tunnel state: Up (destination reachable via ge-0/0/0.0)

lab@R1&gt; show ospf neighbor
<span class="c">(empty)</span></pre>
<p>203.0.113.26 is the ISP, not R3 (203.0.113.25). The OSPF table is empty because no hello can reach R3. Fix:</p>
<pre class="code">set interfaces ip-0/0/0 unit 0 tunnel destination 203.0.113.25
commit</pre>

<h4>Fault 2: the tunnel now flaps forever</h4>
<p>The neighbour comes up and then dies about every twelve seconds. The log tells the story, in real output:</p>
<pre class="out">lab@R1&gt; show log messages | match "recursive|OSPF"
... rpd[1140]: RPD_OSPF_NBRUP: OSPF neighbor 10.255.7.3 on ip-0/0/0.0 moved from Loading to Full
... kernel: <span class="hl">ip-0/0/0.0: tunnel destination resolves through the tunnel itself (recursive route), interface held down</span>
... rpd[1140]: RPD_OSPF_NBRDOWN: OSPF neighbor 10.255.7.3 on ip-0/0/0.0 moved from Full to Down
... rpd[1140]: RPD_OSPF_NBRUP: OSPF neighbor 10.255.7.3 on ip-0/0/0.0 moved from Loading to Full
... kernel: ip-0/0/0.0: tunnel destination resolves through the tunnel itself (recursive route), interface held down</pre>
<p>After you fix the destination, the interface detail even counts these events: <code>Tunnel state: Up (destination reachable via ge-0/0/0.0), recursive-route events: 2</code>.</p>

<h3>Why recursive routing happens</h3>
<ol>
<li>R3's startup configuration places its WAN interface <code>ge-0/0/0.0</code> (203.0.113.25/30) into OSPF as a passive interface. R3 therefore advertises the prefix <b>203.0.113.24/30</b>.</li>
<li>The OSPF adjacency comes up over the tunnel, so R1 learns 203.0.113.24/30 <b>through the tunnel</b>.</li>
<li>That prefix is more specific than R1's static default (0.0.0.0/0). The tunnel destination 203.0.113.25 now matches the OSPF route, whose next hop is the tunnel.</li>
<li>R1 would have to send the tunnel's own packets into the tunnel. Junos refuses, holds the interface down, and the OSPF adjacency dies.</li>
<li>With the adjacency gone, the OSPF route disappears, the destination resolves through ge-0/0/0.0 again, the tunnel recovers, OSPF re-forms, and the cycle repeats.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Recursive routing loop">
<rect x="20" y="60" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="12">OSPF adjacency up</text>
<rect x="255" y="60" width="130" height="50" rx="8" fill="#fde68a"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">learn /30 via tunnel</text><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="12">(more specific)</text>
<rect x="490" y="60" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="82" text-anchor="middle" class="svg-ink" font-size="12">tunnel held down</text><text x="555" y="98" text-anchor="middle" class="svg-ink" font-size="12">adjacency dies</text>
<line x1="150" y1="85" x2="255" y2="85" stroke="#64748b" stroke-width="2"/><line x1="385" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
<path d="M555 110 Q555 160 320 160 Q85 160 85 110" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">route withdrawn, tunnel recovers, repeat</text>
</svg><p class="cap">The tunnel destroys the route that keeps it alive, then rebuilds it.</p></div>

<h3>The fix and the proof</h3>
<p>Remove the cause on R3: its WAN interface must not be in OSPF.</p>
<pre class="code"><span class="c">! R3</span>
delete protocols ospf area 0.0.0.0 interface ge-0/0/0.0
commit</pre>
<p>Then confirm: the tunnel stays Up, the neighbour is Full, no OSPF route to 203.0.113.24/30 exists, and the LAN route goes through the tunnel:</p>
<pre class="out">lab@R1&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
172.31.7.2       ip-0/0/0.0             <span class="hl">Full</span>            10.255.7.3       128    31

lab@R1&gt; show route 192.168.73.0/24 exact
<span class="hl">192.168.73.0/24    *[OSPF/10] 00:00:37, metric 2
                    &gt;  to 172.31.7.2 via ip-0/0/0.0</span></pre>
<p>Other valid cures: filter the underlay prefix out with an OSPF export policy, or give the underlay a longer, preferred route. The cleanest cure is design discipline: underlay prefixes never enter the overlay protocol.</p>

<div class="eg"><p><b>Worked example.</b> You are on call and OSPF over a tunnel flaps every 12 seconds. You read the log: "resolves through the tunnel itself". You ask "which prefix covers the tunnel destination?" and check the remote router's OSPF interfaces. The WAN interface is in there. One <code>delete</code> and a commit solves it in under a minute.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing only the first fault and declaring victory. A neighbour that reaches Full for a few seconds is not a stable tunnel. Watch the log for at least one full cycle (about 30 seconds) before closing the ticket.</p></div>
<div class="exam"><p><b>Exam trap.</b> The symptom "tunnel flaps, destination learned via the tunnel" means recursive routing, and the answer is to stop advertising the underlay prefix over the tunnel, not to change the MTU or the keepalive timers.</p></div>

<div class="scn"><h4>Flap every twelve seconds</h4><p>A retail chain reported that its Indore store lost the head office every few seconds. Engineers saw the interface state change in the log with the words "recursive route". The Indore router had been given a template that included the WAN interface in OSPF. They removed it, the flapping stopped, and they added a pre-change checklist item: "WAN interfaces are never in the overlay IGP".</p><p><b>Lesson:</b> templates copy mistakes at scale; checklists stop them.</p></div>

<div class="iv"><p class="q">"A GRE tunnel with OSPF flaps constantly and the log mentions recursive routing. What happened and how do you fix it?"</p><p>The router learned the tunnel destination's prefix through the tunnel itself, usually because the underlay (WAN) subnet is advertised into OSPF. That more specific route overrides the underlay default, so the tunnel collapses. I remove the WAN interface from OSPF or filter that prefix, then confirm the destination resolves through the physical interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in order: underlay, definition on both ends, overlay ping, routing, size and flaps.</li>
<li>Compare the tunnel destination with the far router's real address.</li>
<li>Recursive routing: the destination is learned through the tunnel, so the tunnel is held down.</li>
<li>The log line says "resolves through the tunnel itself (recursive route)".</li>
<li>Cure: keep underlay prefixes out of the overlay protocol.</li>
</ul></div>
`,hi:`
<p>Tunnel faults dramatic dikhte hain ("poori branch down hai") lekin lagbhag sabhi paanch buckets mein aate hain. Hamesha ek hi order mein chalne wala fixed workflow unhe jaldi dhoondh leta hai. Yeh chapter woh workflow deta hai aur phir doosre lab ko walk-through karta hai, jahan do faults ek doosre ke peeche chhupe hain.</p>

<h3>Paanch-step workflow</h3>
<ol>
<li><b>Pehle underlay.</b> Kya har router doosre ke tunnel address tak pahunch sakta hai? <code>show route 203.0.113.25</code> aur <code>ping 203.0.113.25</code> (WAN address se source karke). Underlay nahi to tunnel nahi.</li>
<li><b>Tunnel definition.</b> <i>Dono</i> routers par <code>show interfaces ip-0/0/0.0 detail</code>. Source aur destination mirror images hon, protocol match kare (47 ya 4), aur unit Up ho.</li>
<li><b>Overlay reachability.</b> Far overlay address (172.31.7.2) ko ping karo. Yeh chale to tunnel theek hai aur baaki fault routing ka hai.</li>
<li><b>Tunnel par routing.</b> <code>show ospf neighbor</code>, remote LAN ke liye <code>show route</code>. Prefix seekha gaya hai, aur tunnel unit se?</li>
<li><b>Size aur stability.</b> MTU ke liye bade DF pings, flapping ke liye <code>show log messages</code>, GRE ke liye keepalive state.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Tunnel troubleshooting order">
<rect x="10" y="40" width="112" height="60" rx="8" fill="#bae6fd"/><text x="66" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay</text><text x="66" y="84" text-anchor="middle" class="svg-muted" font-size="11">route + ping</text>
<rect x="134" y="40" width="112" height="60" rx="8" fill="#bbf7d0"/><text x="190" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Definition</text><text x="190" y="84" text-anchor="middle" class="svg-muted" font-size="11">dono ends</text>
<rect x="258" y="40" width="112" height="60" rx="8" fill="#ddd6fe"/><text x="314" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Overlay</text><text x="314" y="84" text-anchor="middle" class="svg-muted" font-size="11">far /30 ping</text>
<rect x="382" y="40" width="112" height="60" rx="8" fill="#fde68a"/><text x="438" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Routing</text><text x="438" y="84" text-anchor="middle" class="svg-muted" font-size="11">OSPF + routes</text>
<rect x="506" y="40" width="124" height="60" rx="8" fill="#fed7aa"/><text x="568" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Size, flaps</text><text x="568" y="84" text-anchor="middle" class="svg-muted" font-size="11">MTU, log</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Left se right chalo; pehle fail hone wale step par ruko</text>
</svg><p class="cap">Har step ek layer saabit karta hai, isliye failure theek ek jagah ishaara karta hai.</p></div>

<h3>Lab walkthrough: IP-IP tunnel jo baar-baar girta hai</h3>
<p>Bhopal (R1) aur Indore (R3) ip-0/0/0.0 par OSPF ke saath IP-IP tunnel chalate hain. PCs kabhi ek doosre tak nahi pahunchte. Lab aapse do faults dhoondhne aur theek karne ko kehta hai.</p>

<h4>Fault 1: tunnel galat router ko point karta hai</h4>
<p>Workflow ka step 2 ise pakad leta hai. R1 par:</p>
<pre class="out">lab@R1&gt; show interfaces ip-0/0/0.0 detail
    Tunnel source 203.0.113.17, destination <span class="hl">203.0.113.26</span>, IP protocol 4 (IP-IP), TTL 64
    Tunnel state: Up (destination reachable via ge-0/0/0.0)

lab@R1&gt; show ospf neighbor
<span class="c">(khaali)</span></pre>
<p>203.0.113.26 ISP hai, R3 (203.0.113.25) nahi. OSPF table khaali hai kyunki koi hello R3 tak nahi pahunchta. Fix:</p>
<pre class="code">set interfaces ip-0/0/0 unit 0 tunnel destination 203.0.113.25
commit</pre>

<h4>Fault 2: tunnel ab hamesha flap karta hai</h4>
<p>Neighbour up hota hai aur lagbhag har barah second mein mar jaata hai. Log kahani sunata hai, real output mein:</p>
<pre class="out">lab@R1&gt; show log messages | match "recursive|OSPF"
... rpd[1140]: RPD_OSPF_NBRUP: OSPF neighbor 10.255.7.3 on ip-0/0/0.0 moved from Loading to Full
... kernel: <span class="hl">ip-0/0/0.0: tunnel destination resolves through the tunnel itself (recursive route), interface held down</span>
... rpd[1140]: RPD_OSPF_NBRDOWN: OSPF neighbor 10.255.7.3 on ip-0/0/0.0 moved from Full to Down
... rpd[1140]: RPD_OSPF_NBRUP: OSPF neighbor 10.255.7.3 on ip-0/0/0.0 moved from Loading to Full
... kernel: ip-0/0/0.0: tunnel destination resolves through the tunnel itself (recursive route), interface held down</pre>
<p>Destination theek karne ke baad interface detail in events ko ginta bhi hai: <code>Tunnel state: Up (destination reachable via ge-0/0/0.0), recursive-route events: 2</code>.</p>

<h3>Recursive routing kyun hoti hai</h3>
<ol>
<li>R3 ki startup configuration uska WAN interface <code>ge-0/0/0.0</code> (203.0.113.25/30) OSPF mein passive interface ke roop mein daalti hai. Isliye R3 prefix <b>203.0.113.24/30</b> advertise karta hai.</li>
<li>OSPF adjacency tunnel par up hoti hai, isliye R1 203.0.113.24/30 ko <b>tunnel ke through</b> seekhta hai.</li>
<li>Yeh prefix R1 ke static default (0.0.0.0/0) se zyada specific hai. Tunnel destination 203.0.113.25 ab OSPF route se match karta hai, jiska next hop tunnel hai.</li>
<li>R1 ko tunnel ke apne packets tunnel ke andar bhejne padenge. Junos mana karta hai, interface ko down rakhta hai, aur OSPF adjacency mar jaati hai.</li>
<li>Adjacency jaate hi OSPF route gayab, destination phir ge-0/0/0.0 se resolve hota hai, tunnel theek hota hai, OSPF dobara banta hai, aur chakkar phir chalta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Recursive routing loop">
<rect x="20" y="60" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="12">OSPF adjacency up</text>
<rect x="255" y="60" width="130" height="50" rx="8" fill="#fde68a"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">/30 tunnel se seekha</text><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="12">(zyada specific)</text>
<rect x="490" y="60" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="82" text-anchor="middle" class="svg-ink" font-size="12">tunnel held down</text><text x="555" y="98" text-anchor="middle" class="svg-ink" font-size="12">adjacency mari</text>
<line x1="150" y1="85" x2="255" y2="85" stroke="#64748b" stroke-width="2"/><line x1="385" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
<path d="M555 110 Q555 160 320 160 Q85 160 85 110" fill="none" stroke="#64748b" stroke-width="2"/><text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">route gayab, tunnel theek, phir dohrao</text>
</svg><p class="cap">Tunnel wahi route khatam karta hai jo use zinda rakhta hai, phir use dobara banata hai.</p></div>

<h3>Fix aur saboot</h3>
<p>R3 par kaaran hatao: uska WAN interface OSPF mein nahi hona chahiye.</p>
<pre class="code"><span class="c">! R3</span>
delete protocols ospf area 0.0.0.0 interface ge-0/0/0.0
commit</pre>
<p>Phir confirm karo: tunnel Up rahe, neighbour Full ho, 203.0.113.24/30 ka OSPF route na ho, aur LAN route tunnel ke through ho:</p>
<pre class="out">lab@R1&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
172.31.7.2       ip-0/0/0.0             <span class="hl">Full</span>            10.255.7.3       128    31

lab@R1&gt; show route 192.168.73.0/24 exact
<span class="hl">192.168.73.0/24    *[OSPF/10] 00:00:37, metric 2
                    &gt;  to 172.31.7.2 via ip-0/0/0.0</span></pre>
<p>Doosre valid ilaaj: OSPF export policy se underlay prefix filter karo, ya underlay ko lamba, preferred route do. Sabse saaf ilaaj design discipline hai: underlay prefixes overlay protocol mein kabhi nahi jaate.</p>

<div class="eg"><p><b>Worked example.</b> Aap on-call ho aur tunnel par OSPF har 12 second mein flap kar raha hai. Log padhte ho: "resolves through the tunnel itself". Poochte ho "tunnel destination ko kaunsa prefix cover karta hai?" aur remote router ke OSPF interfaces check karte ho. WAN interface wahin hai. Ek <code>delete</code> aur commit se ek minute mein solve.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf pehla fault theek karke jeet ghoshit kar dena. Jo neighbour kuch seconds ke liye Full ho woh stable tunnel nahi hai. Ticket band karne se pehle kam se kam ek poora cycle (lagbhag 30 second) log dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Symptom "tunnel flap karta hai, destination tunnel ke through seekhi gayi" ka matlab recursive routing hai, aur jawab underlay prefix ko tunnel par advertise karna band karna hai, MTU ya keepalive timers badalna nahi.</p></div>

<div class="scn"><h4>Har barah second mein flap</h4><p>Ek retail chain ne bataya ki uska Indore store head office se har kuch seconds mein kat jaata hai. Engineers ne log mein interface state change dekha jisme "recursive route" shabd tha. Indore router ko ek template mili thi jisme WAN interface OSPF mein tha. Unhone use hataya, flapping ruk gayi, aur pre-change checklist mein item joda: "WAN interfaces overlay IGP mein kabhi nahi".</p><p><b>Lesson:</b> templates galtiyan bade scale par copy karte hain; checklists unhe rokte hain.</p></div>

<div class="iv"><p class="q">"OSPF wala GRE tunnel hamesha flap karta hai aur log mein recursive routing likha hai. Kya hua aur kaise fix karoge?"</p><p>Router ne tunnel destination ka prefix tunnel ke through hi seekh liya, aam taur par kyunki underlay (WAN) subnet OSPF mein advertise hua. Woh zyada specific route underlay default ko override karta hai, to tunnel collapse hota hai. Main WAN interface ko OSPF se hata deta hoon ya woh prefix filter karta hoon, phir confirm karta hoon ki destination physical interface se resolve ho raha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein troubleshoot karo: underlay, dono ends par definition, overlay ping, routing, size aur flaps.</li>
<li>Tunnel destination ko far router ke asli address se compare karo.</li>
<li>Recursive routing: destination tunnel ke through seekhi gayi, isliye tunnel held down.</li>
<li>Log line kehti hai "resolves through the tunnel itself (recursive route)".</li>
<li>Ilaaj: underlay prefixes ko overlay protocol se bahar rakho.</li>
</ul></div>
`}};export{e as default};