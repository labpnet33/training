var e={id:`troubleshooting-method`,h:{en:`A fixed troubleshooting method`,hi:`Ek fixed troubleshooting method`},body:{en:`
<p>Beginners troubleshoot by guessing: change a rule, install, hope. Professionals use a <b>fixed order</b>, because a fixed order finds faults faster and never skips the boring cause. The order below follows the way a packet and a policy actually travel, from the management plane to the traffic plane, and it is the order you will need in the capstone with ten injected faults.</p>

<h3>Analogy: the doctor checks vitals first</h3>
<p>A good doctor does not start with surgery. Pulse and temperature first, then history, then specific tests. In the firewall the vitals are contact and status. Only when they are healthy do you move on to the specific tests.</p>

<h3>The eight steps</h3>
<ol>
<li><b>Contact and status.</b> Is the engine Online with the right nodes? If Unknown, solve contact first: control IP or contact address, tcp 8902 both ways, a firewall in between. If No Policy Installed, install. Nothing below matters until this is healthy.</li>
<li><b>Installed versus pending.</b> Does the engine run what you think? Open the Install policy bar: pending changes mean the engine still runs the old snapshot. Many "my fix does not work" tickets end here.</li>
<li><b>Route.</b> Does the engine know where to send the packet? Check interfaces and static routes. A gateway must sit on a connected network. Test with ping and traceroute from the engine tools.</li>
<li><b>Rule via Policy match.</b> Ask the engine what its policy would do for this exact source, destination, protocol and port. The Policy match tool on the Tools page prints a trace and a result such as Result: DISCARD by rule 12, or an implicit discard. This replaces guessing about rule order, disabled rules and shadowing.</li>
<li><b>NAT.</b> Access rules match original addresses; NAT happens after an Allow. If the result is Allow but the server never answers, check the NAT rule that matched, whether translated addresses are routable, and whether a no-NAT exception is missing above a general rule.</li>
<li><b>Inspection.</b> If a deep inspection rule or URL category sits in the path, the connection may be terminated by a situation. Look for the situation name in the logs and decide if it is a real attack or a false positive needing an exception. HTTPS needs the rule HTTPS flag and an enabled HTTPS inspection policy; sites that pin certificates need an exclusion.</li>
<li><b>VPN.</b> For site traffic, both gateways must have installed the same profile and key, the peer gateway must be reachable, the rule must apply the VPN, the source and destination must be in the protected networks, and NAT must not rewrite the source before encapsulation.</li>
<li><b>Logs.</b> Confirm with evidence: filter by source and destination, read the action and the deciding rule or situation, then retest after the fix and see the new line.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Eight step troubleshooting order">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 Contact, status</text>
<rect x="170" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="235" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 Installed or pending</text>
<rect x="320" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="385" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 Route</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 Policy match</text>
<rect x="20" y="130" width="130" height="50" rx="8" fill="#fde68a"/><text x="85" y="160" text-anchor="middle" class="svg-ink" font-size="12">5 NAT</text>
<rect x="170" y="130" width="130" height="50" rx="8" fill="#fde68a"/><text x="235" y="160" text-anchor="middle" class="svg-ink" font-size="12">6 Inspection</text>
<rect x="320" y="130" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="385" y="160" text-anchor="middle" class="svg-ink" font-size="12">7 VPN</text>
<rect x="470" y="130" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="545" y="160" text-anchor="middle" class="svg-ink" font-size="12">8 Logs, retest</text>
<line x1="150" y1="45" x2="170" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="45" x2="320" y2="45" stroke="#64748b" stroke-width="2"/><line x1="450" y1="45" x2="470" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="155" x2="170" y2="155" stroke="#64748b" stroke-width="2"/><line x1="300" y1="155" x2="320" y2="155" stroke="#64748b" stroke-width="2"/><line x1="450" y1="155" x2="470" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Change one thing, Install policy, retest, then move on</text>
</svg><p class="cap">Top row: is the engine reachable and running the right thing, and can it route. Bottom row: what the traffic meets on the way.</p></div>

<h3>Using Policy match well</h3>
<pre class="out">Policy match: 10.1.1.10 -> 172.16.20.20 tcp/443
  rule 8  Staff-to-web   skipped (service does not match)
  rule 12 Block-DMZ-admin  matched
Result: <span class="hl">DISCARD by rule 12 "Block-DMZ-admin"</span></pre>
<p>The trace is a map of the first-match logic: top to bottom, template rules first, disabled rules skipped, no match means implicit discard. Remember Policy match reads the installed snapshot, so step 2 must come first. If the trace says Allow while the real test fails, move on to NAT, route and the server itself. A trace line shows exact wording of your lab; treat the sample above as a shape, not a promise.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "Staff cannot reach the DMZ web server". Step 1: status Online. Step 2: no pending changes. Step 3: route to 172.16.20.0/24 is connected on the DMZ interface. Step 4: Policy match for 10.1.1.10 to 172.16.20.20 tcp/80 returns Allow by rule 8. Step 5: no NAT involved inside the branch. Step 6: no deep inspection on rule 8. Step 7: no VPN. Step 8: logs show Allow, so the engine is innocent; the web service on WEB1 is stopped. Eight steps, five minutes, and the right team gets the ticket.</p></div>

<h3>Rules of the method</h3>
<ul>
<li>Change one thing at a time, then Install policy and retest. Every lab and the capstone pass only after install.</li>
<li>Write down the symptom in measurable terms: source, destination, port, time, exact error or timeout.</li>
<li>Do not skip steps because a cause looks obvious; ten injected faults in the capstone are placed to punish skipping.</li>
<li>Know what is not modelled: real signature updates, dynamic routing and IPv6 are outside the simulator, so do not search for them.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Starting at the rules and never checking contact or pending changes. A rule can be perfect in the SMC and absent on the engine.</p></div>

<div class="exam"><p><b>Exam trap.</b> The questions describe a symptom and ask for the next best step. The answer is usually the earliest unchecked item in the order, not the most exciting tool.</p></div>

<div class="scn"><h4>Three faults in one ticket</h4><p>After a weekend change window, Pune users could not reach a partner portal over the site VPN. The engineer first found NK-PUNE-FW showing pending changes: a NAT exception had been written but never installed. After installing, Policy match said Allow, yet the tunnel carried nothing. The VPN rule lacked the apply option. A third issue appeared in the logs: a Discard by an old time-range rule at lunch hour. Because she followed the order, she fixed one fault per install and could name each cause in the report.</p><p><b>Lesson:</b> real tickets often hide more than one fault; the order makes sure you find them all.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a firewall connectivity issue."</p><p>Strong answer: contact and status, installed versus pending, routing, policy evaluation with a policy match tool, NAT, inspection, VPN, and finally logs to confirm and retest. Emphasise one change per install and evidence from logs, and mention the defensive habit of documenting each finding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the fixed order: contact, installed vs pending, route, policy match, NAT, inspection, VPN, logs.</li>
<li>Policy match shows the deciding rule without guessing; it reads the installed snapshot.</li>
<li>Access rules use original addresses; NAT follows an Allow.</li>
<li>One change, one install, one retest.</li>
<li>Do not skip steps; later faults hide behind earlier ones.</li>
</ul></div>
`,hi:`
<p>Beginners andaza lagakar troubleshoot karte hain: rule badlo, install karo, ummeed rakho. Professionals <b>fixed order</b> use karte hain, kyunki fixed order faults jaldi dhundta hai aur boring cause kabhi skip nahi karta. Neeche ka order is tarah chalta hai jaise packet aur policy asal mein chalte hain, management plane se traffic plane tak, aur yahi order aapko ten injected faults wale capstone mein chahiye hoga.</p>

<h3>Analogy: doctor pehle vitals dekhta hai</h3>
<p>Acha doctor surgery se shuru nahi karta. Pehle pulse aur temperature, phir history, phir specific tests. Firewall mein vitals contact aur status hain. Jab woh healthy hon tabhi specific tests par jaate ho.</p>

<h3>Aath steps</h3>
<ol>
<li><b>Contact aur status.</b> Kya engine sahi nodes ke saath Online hai? Unknown ho to pehle contact solve karo: control IP ya contact address, tcp 8902 dono taraf, beech mein firewall. No Policy Installed ho to install karo. Jab tak yeh healthy nahi, neeche kuch matter nahi karta.</li>
<li><b>Installed versus pending.</b> Kya engine wahi chala raha hai jo aap sochte ho? Install policy bar kholo: pending changes ka matlab engine abhi purana snapshot chala raha hai. Bahut saare "mera fix kaam nahi kar raha" tickets yahin khatam hote hain.</li>
<li><b>Route.</b> Kya engine ko pata hai packet kahan bhejna hai? Interfaces aur static routes check karo. Gateway connected network par hona chahiye. Engine tools se ping aur traceroute karo.</li>
<li><b>Policy match se rule.</b> Engine se pucho ki is exact source, destination, protocol aur port ke liye uski policy kya karegi. Tools page ka Policy match tool trace aur result print karta hai, jaise Result: DISCARD by rule 12, ya implicit discard. Yeh rule order, disabled rules aur shadowing ke andaze ki jagah leta hai.</li>
<li><b>NAT.</b> Access rules original addresses match karte hain; NAT Allow ke baad hota hai. Result Allow hai lekin server jawab nahi deta to dekho kaunsa NAT rule match hua, translated addresses routable hain ya nahi, aur general rule ke upar no-NAT exception missing to nahi.</li>
<li><b>Inspection.</b> Path mein deep inspection rule ya URL category ho to connection kisi situation se terminate ho sakta hai. Logs mein situation ka naam dekho aur decide karo ki real attack hai ya false positive jise exception chahiye. HTTPS ko rule ka HTTPS flag aur enabled HTTPS inspection policy chahiye; jo sites certificate pin karti hain unhe exclusion chahiye.</li>
<li><b>VPN.</b> Site traffic ke liye dono gateways ne same profile aur key install ki ho, peer gateway reachable ho, rule VPN apply kare, source aur destination protected networks mein hon, aur NAT encapsulation se pehle source rewrite na kare.</li>
<li><b>Logs.</b> Evidence se confirm karo: source aur destination se filter karo, action aur deciding rule ya situation padho, fix ke baad retest karo aur nayi line dekho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Aath step troubleshooting order">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 Contact, status</text>
<rect x="170" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="235" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 Installed ya pending</text>
<rect x="320" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="385" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 Route</text>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 Policy match</text>
<rect x="20" y="130" width="130" height="50" rx="8" fill="#fde68a"/><text x="85" y="160" text-anchor="middle" class="svg-ink" font-size="12">5 NAT</text>
<rect x="170" y="130" width="130" height="50" rx="8" fill="#fde68a"/><text x="235" y="160" text-anchor="middle" class="svg-ink" font-size="12">6 Inspection</text>
<rect x="320" y="130" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="385" y="160" text-anchor="middle" class="svg-ink" font-size="12">7 VPN</text>
<rect x="470" y="130" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="545" y="160" text-anchor="middle" class="svg-ink" font-size="12">8 Logs, retest</text>
<line x1="150" y1="45" x2="170" y2="45" stroke="#64748b" stroke-width="2"/><line x1="300" y1="45" x2="320" y2="45" stroke="#64748b" stroke-width="2"/><line x1="450" y1="45" x2="470" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="155" x2="170" y2="155" stroke="#64748b" stroke-width="2"/><line x1="300" y1="155" x2="320" y2="155" stroke="#64748b" stroke-width="2"/><line x1="450" y1="155" x2="470" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Ek cheez badlo, Install policy, retest, phir aage badho</text>
</svg><p class="cap">Upar ki row: engine reachable hai, sahi cheez chala raha hai, aur route kar sakta hai. Neeche ki row: traffic raste mein kis se milta hai.</p></div>

<h3>Policy match ko acche se use karo</h3>
<pre class="out">Policy match: 10.1.1.10 -> 172.16.20.20 tcp/443
  rule 8  Staff-to-web   skipped (service does not match)
  rule 12 Block-DMZ-admin  matched
Result: <span class="hl">DISCARD by rule 12 "Block-DMZ-admin"</span></pre>
<p>Trace first-match logic ka naksha hai: upar se neeche, template rules pehle, disabled rules skip, no match ka matlab implicit discard. Yaad rakho Policy match installed snapshot padhta hai, isliye step 2 pehle aana chahiye. Trace Allow kahe aur real test fail ho, to NAT, route aur server par jao. Trace line ke exact words aapke lab mein alag ho sakte hain; upar ke sample ko shape samjho, promise nahi.</p>

<div class="eg"><p><b>Worked example.</b> Ticket: "Staff DMZ web server tak nahi pahunch pa raha". Step 1: status Online. Step 2: koi pending changes nahi. Step 3: 172.16.20.0/24 ka route DMZ interface par connected hai. Step 4: 10.1.1.10 se 172.16.20.20 tcp/80 ke liye Policy match rule 8 se Allow deta hai. Step 5: branch ke andar NAT involved nahi. Step 6: rule 8 par deep inspection nahi. Step 7: VPN nahi. Step 8: logs Allow dikhate hain, isliye engine nirdosh hai; WEB1 ki web service band hai. Aath steps, paanch minute, aur ticket sahi team ko mila.</p></div>

<h3>Method ke niyam</h3>
<ul>
<li>Ek time par ek cheez badlo, phir Install policy aur retest. Har lab aur capstone install ke baad hi pass hota hai.</li>
<li>Symptom ko measurable shabdon mein likho: source, destination, port, time, exact error ya timeout.</li>
<li>Cause obvious lage tab bhi steps skip mat karo; capstone ke ten injected faults skipping ko saza dene ke liye rakhe gaye hain.</li>
<li>Jaano kya model nahi hai: real signature updates, dynamic routing aur IPv6 simulator ke bahar hain, unhe mat dhundo.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Rules se shuru karna aur contact ya pending changes kabhi check na karna. Rule SMC mein perfect ho sakta hai aur engine par exist hi na kare.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawal symptom batate hain aur next best step poochte hain. Jawab aam taur par order ka sabse pehla unchecked item hota hai, sabse exciting tool nahi.</p></div>

<div class="scn"><h4>Ek ticket mein teen faults</h4><p>Weekend change window ke baad Pune users site VPN se partner portal tak nahi pahunch pa rahe the. Engineer ne pehle dekha ki NK-PUNE-FW pending changes dikha raha tha: NAT exception likha gaya tha lekin kabhi install nahi hua. Install ke baad Policy match ne Allow kaha, phir bhi tunnel mein kuch nahi chala. VPN rule mein apply option nahi tha. Logs mein teesra issue dikha: lunch hour par purane time-range rule ka Discard. Order follow karne se usne har install mein ek fault theek kiya aur report mein har cause ka naam likh saki.</p><p><b>Seekh:</b> real tickets mein aksar ek se zyada fault chhupe hote hain; order yeh pakka karta hai ki aap sab dhundo.</p></div>

<div class="iv"><p class="q">"Firewall connectivity issue ko aap kaise troubleshoot karte ho, step by step batao."</p><p>Strong answer: contact aur status, installed versus pending, routing, policy match tool se policy evaluation, NAT, inspection, VPN, aur aakhir mein logs se confirm aur retest. Ek install mein ek change aur logs ki evidence par zor do, aur har finding document karne ki defensive habit batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed order use karo: contact, installed vs pending, route, policy match, NAT, inspection, VPN, logs.</li>
<li>Policy match bina andaze ke deciding rule dikhata hai; yeh installed snapshot padhta hai.</li>
<li>Access rules original addresses use karte hain; NAT Allow ke baad aata hai.</li>
<li>Ek change, ek install, ek retest.</li>
<li>Steps skip mat karo; pehle ke faults baad ke faults ko chhupa dete hain.</li>
</ul></div>
`}};export{e as default};