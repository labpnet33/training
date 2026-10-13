var e={id:`lab-practice`,h:{en:`How to practise in the labs: a bottom-up routine and the commands to know`,hi:`Labs mein practice kaise karein: bottom-up routine aur zaroori commands`},body:{en:`
<p>Reading explains; labs build skill. Each SPCOR module in this course comes with labs on simulated routers. They speak the <b>IOS XE-style</b> command line you know from CCNA and ENARSI, and some labs also include <b>Junos</b> routers so you meet a multivendor core. This chapter gives you a routine that works for every lab, and the most useful commands side by side.</p>

<h3>A five-step routine for every lab</h3>
<ol>
<li><b>Read the brief and draw the picture.</b> Write down device names, links, addresses and which routers are PE, P or RR. Two minutes of drawing saves twenty of confusion.</li>
<li><b>Work bottom-up.</b> Interfaces and IP, then IGP, then LDP, then BGP, then services. Verify each layer before you start the next.</li>
<li><b>Use the task list as a checklist.</b> Each task has a hint and a verification. If a task fails, read the hint, not the solution.</li>
<li><b>Read the output, do not skim it.</b> The most useful column is often one word: State, Type, Circuit Id, Next Hop, Outgoing Label.</li>
<li><b>After success, break it on purpose.</b> Shut a link, remove a command, mismatch a setting, and predict what each <code>show</code> command will say before you run it.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Bottom up verification">
<rect x="15" y="75" width="105" height="50" rx="8" fill="#bae6fd"/><text x="67" y="105" text-anchor="middle" class="svg-ink" font-size="12">1 Links, IP</text>
<rect x="140" y="75" width="105" height="50" rx="8" fill="#bbf7d0"/><text x="192" y="105" text-anchor="middle" class="svg-ink" font-size="12">2 IGP</text>
<rect x="265" y="75" width="105" height="50" rx="8" fill="#fde68a"/><text x="317" y="105" text-anchor="middle" class="svg-ink" font-size="12">3 LDP / labels</text>
<rect x="390" y="75" width="105" height="50" rx="8" fill="#ddd6fe"/><text x="442" y="105" text-anchor="middle" class="svg-ink" font-size="12">4 BGP</text>
<rect x="515" y="75" width="110" height="50" rx="8" fill="#fed7aa"/><text x="570" y="105" text-anchor="middle" class="svg-ink" font-size="12">5 VPN service</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="100" x2="140" y2="100"/><line x1="245" y1="100" x2="265" y2="100"/><line x1="370" y1="100" x2="390" y2="100"/><line x1="495" y1="100" x2="515" y2="100"/></g>
<text x="320" y="45" text-anchor="middle" class="svg-accent" font-size="13">Build and verify in this order. Troubleshoot in the same order.</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">A fault in box N shows up as a symptom in box N+1 or later</text>
</svg><p class="cap">The same bottom-up order is used to build a network and to find a fault.</p></div>

<h3>Commands by layer</h3>
<table class="cmp"><tr><th>Layer</th><th>IOS XE-style router</th><th>Junos router (multivendor labs)</th></tr>
<tr><td>Interfaces</td><td><code>show ip interface brief</code></td><td><code>show interfaces terse</code></td></tr>
<tr><td>IS-IS neighbours</td><td><code>show isis neighbors</code></td><td><code>show isis adjacency</code></td></tr>
<tr><td>IS-IS database</td><td><code>show isis database detail</code></td><td><code>show isis database</code></td></tr>
<tr><td>Routes</td><td><code>show ip route isis</code></td><td><code>show route protocol isis</code></td></tr>
<tr><td>LDP and labels</td><td><code>show mpls ldp neighbor</code>, <code>show mpls forwarding-table</code></td><td>(see the MPLS modules)</td></tr>
<tr><td>BGP</td><td><code>show ip bgp summary</code>, <code>show bgp vpnv4 unicast all</code></td><td>(see the BGP modules)</td></tr>
<tr><td>Config section</td><td><code>show running-config | section router isis</code></td><td><code>show configuration</code></td></tr></table>

<h3>Two outputs, the same network, different vendors</h3>
<p>This is from the spcor-isis-design lab, a square of Cisco R1, R2 and Juniper JR1, JR2. The Cisco router and the Juniper router describe the same adjacency in their own style:</p>
<pre class="out">R1# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
JR1             L2   Gi0/0         10.2.1.2        <span class="hl">UP</span>    25       00
R2              L2   Gi0/1         10.2.4.1        UP    24       00

JR1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             2 <span class="hl">Up</span>                   27
ge-0/0/1.0            JR2            2 Up                   23</pre>
<p>Same facts: neighbour R1, level 2, Up. Learn to read both; the exam and real networks mix vendors.</p>

<h3>Read the symptom, then the layer</h3>
<p>Here is a lab fault from the spcor-isis troubleshooting lab. Nothing works. What do you check first?</p>
<pre class="out">R1# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id

R1# show running-config | section router isis
router isis
 net <span class="hl">49.0003</span>.0000.0000.0001.00
 is-type level-1
 log-adjacency-changes</pre>
<p>The IGP layer is down (no neighbour), so there is no point looking higher up. R1 is level-1 only, so its area must match the neighbour's: 49.0003 here, while R2 is in 49.0001. That one line is the whole fault. Chapter 3 of the spcor-isis module explains the rule, and its troubleshooting chapter walks the complete lab.</p>

<div class="eg"><p><b>Worked example.</b> A lab asks you to "make R1 reach R4's loopback". Your routine: (1) check links with <code>show ip interface brief</code>; (2) <code>show isis neighbors</code> on each router; (3) <code>show ip route isis</code> on R1 and see if 4.4.4.4 or a default route is present; (4) <code>ping 4.4.4.4</code>. Four commands, one per layer, and you know exactly which layer a failure belongs to.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing three things at once when something fails. Change one setting, wait for the protocol to react (IS-IS neighbours need a few seconds), and re-run the verification. If you change several things you will not know which one fixed it, and you will not learn.</p></div>
<div class="exam"><p><b>Exam trap.</b> Simulation questions give you only a few commands and a limited time. Practise typing the verification commands from memory and know their abbreviations (<code>sh ip ro isis</code>, <code>sh isis nei</code>). A routine saves minutes on exam day.</p></div>

<div class="scn"><h4>Solving the lab by pattern, not by luck</h4><p>A learner stuck on a BGP lab for an hour started again with the five-step routine. The IGP showed a neighbour in INIT state because one side had an MTU mismatch. Fixing it brought up IS-IS, the loopbacks became reachable, and the BGP session established on its own. The BGP configuration had been correct all along.</p><p><b>Lesson:</b> the visible symptom was BGP, the cause was two layers down. Bottom-up checking finds it quickly.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot an MPLS VPN that is down."</p><p>Say it as layers: first check the PE-CE link and VRF routing, then the VPNv4 session and the routes in each VRF with the right route targets, then the LSP between the PE loopbacks with LDP and traceroute, and finally the IGP route to the loopbacks. Starting at the symptom and working to the foundation in a repeatable order impresses interviewers more than naming every command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the five-step routine: read, build bottom-up, check tasks, read output, break it.</li>
<li>Verify each layer before building the next: links, IGP, LDP, BGP, service.</li>
<li>Learn both IOS XE and Junos forms of the common show commands.</li>
<li>Change one thing at a time and re-run the same verification.</li>
<li>Symptoms appear above the faulty layer; troubleshoot from the bottom.</li>
</ul></div>
`,hi:`
<p>Padhne se samajh aati hai; labs se skill banti hai. Is course ke har SPCOR module ke saath simulated routers par labs aate hain. Woh wahi <b>IOS XE-style</b> command line bolte hain jo aap CCNA aur ENARSI se jaante ho, aur kuch labs mein <b>Junos</b> routers bhi hain taaki aapko multivendor core mile. Yeh chapter har lab ke liye chalne wali routine deta hai, aur sabse kaam ke commands saath-saath.</p>

<h3>Har lab ke liye paanch-step routine</h3>
<ol>
<li><b>Brief padho aur picture banao.</b> Device names, links, addresses likho aur kaun PE, P ya RR hai. Do minute ki drawing bees minute ki confusion bachati hai.</li>
<li><b>Bottom-up kaam karo.</b> Interfaces aur IP, phir IGP, phir LDP, phir BGP, phir services. Agla shuru karne se pehle har layer verify karo.</li>
<li><b>Task list ko checklist ki tarah use karo.</b> Har task ka hint aur verification hai. Task fail ho to hint padho, solution nahi.</li>
<li><b>Output padho, skim mat karo.</b> Sabse kaam ka column aksar ek shabd hota hai: State, Type, Circuit Id, Next Hop, Outgoing Label.</li>
<li><b>Success ke baad jaan-boojhkar tod do.</b> Link shut karo, command hatao, setting mismatch karo, aur har <code>show</code> command chalane se pehle andaza lagao ki woh kya kahega.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Bottom up verification">
<rect x="15" y="75" width="105" height="50" rx="8" fill="#bae6fd"/><text x="67" y="105" text-anchor="middle" class="svg-ink" font-size="12">1 Links, IP</text>
<rect x="140" y="75" width="105" height="50" rx="8" fill="#bbf7d0"/><text x="192" y="105" text-anchor="middle" class="svg-ink" font-size="12">2 IGP</text>
<rect x="265" y="75" width="105" height="50" rx="8" fill="#fde68a"/><text x="317" y="105" text-anchor="middle" class="svg-ink" font-size="12">3 LDP / labels</text>
<rect x="390" y="75" width="105" height="50" rx="8" fill="#ddd6fe"/><text x="442" y="105" text-anchor="middle" class="svg-ink" font-size="12">4 BGP</text>
<rect x="515" y="75" width="110" height="50" rx="8" fill="#fed7aa"/><text x="570" y="105" text-anchor="middle" class="svg-ink" font-size="12">5 VPN service</text>
<g stroke="#64748b" stroke-width="2"><line x1="120" y1="100" x2="140" y2="100"/><line x1="245" y1="100" x2="265" y2="100"/><line x1="370" y1="100" x2="390" y2="100"/><line x1="495" y1="100" x2="515" y2="100"/></g>
<text x="320" y="45" text-anchor="middle" class="svg-accent" font-size="13">Isi order mein build aur verify karo. Troubleshoot bhi isi order mein.</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Box N ka fault box N+1 ya baad mein symptom ki tarah dikhta hai</text>
</svg><p class="cap">Network banane aur fault dhoondhne ke liye wahi bottom-up order.</p></div>

<h3>Layer ke hisaab se commands</h3>
<table class="cmp"><tr><th>Layer</th><th>IOS XE-style router</th><th>Junos router (multivendor labs)</th></tr>
<tr><td>Interfaces</td><td><code>show ip interface brief</code></td><td><code>show interfaces terse</code></td></tr>
<tr><td>IS-IS neighbours</td><td><code>show isis neighbors</code></td><td><code>show isis adjacency</code></td></tr>
<tr><td>IS-IS database</td><td><code>show isis database detail</code></td><td><code>show isis database</code></td></tr>
<tr><td>Routes</td><td><code>show ip route isis</code></td><td><code>show route protocol isis</code></td></tr>
<tr><td>LDP aur labels</td><td><code>show mpls ldp neighbor</code>, <code>show mpls forwarding-table</code></td><td>(MPLS modules dekho)</td></tr>
<tr><td>BGP</td><td><code>show ip bgp summary</code>, <code>show bgp vpnv4 unicast all</code></td><td>(BGP modules dekho)</td></tr>
<tr><td>Config section</td><td><code>show running-config | section router isis</code></td><td><code>show configuration</code></td></tr></table>

<h3>Do outputs, ek network, alag vendors</h3>
<p>Yeh spcor-isis-design lab se hai, Cisco R1, R2 aur Juniper JR1, JR2 ka square. Cisco router aur Juniper router wahi adjacency apne-apne style mein batate hain:</p>
<pre class="out">R1# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
JR1             L2   Gi0/0         10.2.1.2        <span class="hl">UP</span>    25       00
R2              L2   Gi0/1         10.2.4.1        UP    24       00

JR1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R1             2 <span class="hl">Up</span>                   27
ge-0/0/1.0            JR2            2 Up                   23</pre>
<p>Wahi facts: neighbour R1, level 2, Up. Dono padhna seekho; exam aur real networks mein vendors mix hote hain.</p>

<h3>Pehle symptom padho, phir layer</h3>
<p>Yeh spcor-isis troubleshooting lab ka ek fault hai. Kuch kaam nahi karta. Pehle kya check karoge?</p>
<pre class="out">R1# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id

R1# show running-config | section router isis
router isis
 net <span class="hl">49.0003</span>.0000.0000.0001.00
 is-type level-1
 log-adjacency-changes</pre>
<p>IGP layer down hai (koi neighbour nahi), isliye upar ki layers dekhne ka koi matlab nahi. R1 sirf level-1 hai, isliye uska area neighbour ke area se match karna chahiye: yahan 49.0003, jabki R2 49.0001 mein hai. Wahi ek line poora fault hai. spcor-isis module ka chapter 3 rule samjhata hai, aur uska troubleshooting chapter poori lab walk karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab kehta hai "R1 ko R4 ke loopback tak pahunchao". Aapki routine: (1) <code>show ip interface brief</code> se links check; (2) har router par <code>show isis neighbors</code>; (3) R1 par <code>show ip route isis</code> aur dekho ki 4.4.4.4 ya default route hai ya nahi; (4) <code>ping 4.4.4.4</code>. Chaar commands, har layer ke liye ek, aur aapko pata chal jaata hai ki failure kis layer ka hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Kuch fail hone par ek saath teen cheezein badalna. Ek setting badlo, protocol ke react karne ka wait karo (IS-IS neighbours ko kuch seconds chahiye), aur wahi verification dobara chalao. Kai cheezein badaloge to pata nahi chalega kis ne theek kiya, aur aap seekhoge nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Simulation questions mein sirf kuch commands aur limited time milta hai. Verification commands ko yaad se type karne ki practice karo aur unke abbreviations jaano (<code>sh ip ro isis</code>, <code>sh isis nei</code>). Routine exam ke din minutes bachati hai.</p></div>

<div class="scn"><h4>Lab ko luck se nahi, pattern se solve karna</h4><p>Ek learner BGP lab par ghante bhar atka raha, phir paanch-step routine se dobara shuru kiya. IGP mein ek neighbour INIT state mein tha kyunki ek side par MTU mismatch tha. Use theek karne se IS-IS up hua, loopbacks reachable ho gaye, aur BGP session apne aap establish ho gaya. BGP configuration pehle se hi sahi thi.</p><p><b>Lesson:</b> dikhne wala symptom BGP ka tha, cause do layers neeche tha. Bottom-up checking use jaldi dhoondh leti hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki band pada MPLS VPN kaise troubleshoot karte ho."</p><p>Layers mein bolo: pehle PE-CE link aur VRF routing, phir VPNv4 session aur har VRF ke routes sahi route targets ke saath, phir PE loopbacks ke beech LSP (LDP aur traceroute se), aur aakhir mein loopbacks ka IGP route. Symptom se shuru karke ek repeatable order mein foundation tak jaana interviewers ko har command ka naam gunne se zyada prabhavit karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch-step routine use karo: padho, bottom-up banao, tasks check karo, output padho, tod do.</li>
<li>Agli layer banane se pehle har layer verify karo: links, IGP, LDP, BGP, service.</li>
<li>Common show commands ke IOS XE aur Junos dono forms seekho.</li>
<li>Ek baar mein ek cheez badlo aur wahi verification dobara chalao.</li>
<li>Symptoms faulty layer ke upar dikhte hain; troubleshooting neeche se karo.</li>
</ul></div>
`}};export{e as default};