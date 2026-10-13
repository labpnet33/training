var e={id:`cli-troubleshooting`,h:{en:`PAN-OS SD-WAN CLI and a troubleshooting workflow`,hi:`PAN-OS SD-WAN CLI aur troubleshooting workflow`},body:{en:`
<p>When a flow does not take the path you expect, the Panorama dashboards give the picture and the firewall CLI gives the proof. The documentation lists a small set of <code>show sdwan</code> commands plus the usual VPN, BGP and routing checks. This chapter lists them with their purpose, then gives a workflow that goes from symptom to cause. I show no sample output, because I did not verify the exact output layout, and I will not invent it.</p>
<h3>Analogy: the car dashboard and the mechanic's tools</h3>
<p>The dashboard tells you the engine light is on (Panorama monitoring). The mechanic then plugs in a reader (CLI) to see which sensor complains. You need both: the light says that something is wrong, the reader says what.</p>
<h3>SD-WAN commands from the documentation</h3>
<table class="cmp"><tr><th>Command</th><th>Purpose</th></tr>
<tr><td><code>show sdwan connection all</code> (or one SD-WAN interface)</td><td>Path names, IDs, state, IP addresses and tunnel interface numbers</td></tr>
<tr><td><code>show sdwan session distribution policy-name</code> followed by the SD-WAN policy name</td><td>How sessions are distributed across the tunnel members</td></tr>
<tr><td><code>show sdwan rule vif sdwan.x</code></td><td>The policy rules on that SD-WAN interface, the distribution method and the thresholds</td></tr>
<tr><td><code>show sdwan event</code></td><td>Path selection and quality measurement events; <code>clear sdwan event</code> removes them</td></tr>
<tr><td><code>show sdwan path-monitor stats vif sdwan.x</code></td><td>Latency, jitter and packet loss measurements</td></tr>
<tr><td><code>show sdwan session path-select session-id</code> followed by a session ID</td><td>Which policy rule matched and how the session was distributed</td></tr>
<tr><td><code>show sdwan path-monitor parameter path-name</code> followed by a path name; also <code>show sdwan path-monitor parameter vif sdwan.x</code></td><td>Monitoring mode, update intervals and probe statistics</td></tr></table>
<h3>Supporting commands</h3>
<table class="cmp"><tr><th>Area</th><th>Commands named in the documentation</th></tr>
<tr><td>Counters</td><td><code>show counter global filter delta yes</code> to check that probe packets sent and received match</td></tr>
<tr><td>VPN</td><td><code>show vpn flow</code>, <code>show vpn ike-sa</code>, <code>show vpn tunnel</code>; <code>test vpn ike-sa gateway</code> and <code>test vpn ipsec-sa tunnel</code> start negotiation</td></tr>
<tr><td>BGP</td><td><code>show routing protocol bgp summary virtual-router</code> followed by the name, and <code>show routing protocol bgp loc-rib</code></td></tr>
<tr><td>Routes</td><td><code>show routing route</code> and <code>show routing fib</code> to see the SD-WAN egress interface</td></tr>
<tr><td>Capacity</td><td><code>debug sdwand capacity show</code> on the firewall</td></tr></table>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Commands as named in the Palo Alto Networks documentation.</span>
<span class="c">! Output is not shown because its exact layout was not verified.</span>
show sdwan connection all
show sdwan rule vif sdwan.1
show sdwan path-monitor stats vif sdwan.1
show sdwan session distribution policy-name VOICE-RULE
show sdwan event
show vpn ike-sa
show vpn flow
show counter global filter delta yes</pre>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Troubleshooting ladder">
<rect x="10" y="10" width="150" height="45" rx="8" fill="#bae6fd"/><text x="85" y="38" text-anchor="middle" class="svg-ink" font-size="12">1. Tunnels up?</text>
<rect x="175" y="10" width="150" height="45" rx="8" fill="#bbf7d0"/><text x="250" y="38" text-anchor="middle" class="svg-ink" font-size="12">2. Probes working?</text>
<rect x="340" y="10" width="150" height="45" rx="8" fill="#fde68a"/><text x="415" y="38" text-anchor="middle" class="svg-ink" font-size="12">3. Quality values?</text>
<rect x="505" y="10" width="125" height="45" rx="8" fill="#fed7aa"/><text x="567" y="38" text-anchor="middle" class="svg-ink" font-size="12">4. Rule match?</text>
<rect x="90" y="120" width="200" height="45" rx="8" fill="#ddd6fe"/><text x="190" y="148" text-anchor="middle" class="svg-ink" font-size="12">5. Distribution method?</text>
<rect x="340" y="120" width="200" height="45" rx="8" fill="#fecaca"/><text x="440" y="148" text-anchor="middle" class="svg-ink" font-size="12">6. Routing and NAT?</text>
<line x1="160" y1="32" x2="175" y2="32" stroke="#64748b" stroke-width="2"/><line x1="325" y1="32" x2="340" y2="32" stroke="#64748b" stroke-width="2"/><line x1="490" y1="32" x2="505" y2="32" stroke="#64748b" stroke-width="2"/>
<line x1="567" y1="55" x2="190" y2="120" stroke="#64748b" stroke-width="2"/><line x1="290" y1="142" x2="340" y2="142" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Work down the ladder; each rung has a command that shows the evidence.</p></div>
<h3>Troubleshooting workflow</h3>
<ol>
<li><b>Are the tunnels up?</b> Check VPN flows and IKE security associations. If a tunnel is down, negotiate it manually with the test commands and read the VPN logs.</li>
<li><b>Are the probes healthy?</b> Check the path monitor parameters and the global counters: probe packets sent and received should match. A mismatch points at a drop on the path or a policy blocking the probes.</li>
<li><b>What are the quality values?</b> Read the path monitor statistics for latency, jitter and loss and compare with the thresholds in the path quality profile.</li>
<li><b>Which rule matched?</b> Use the session path-select command with the session ID, and the rule view for the interface. If the wrong rule matched, check application and zone match and the rule order.</li>
<li><b>Is the distribution method what you expect?</b> A Weighted Session Distribution rule will not leave a brownout link; a Top Down Priority rule restarts at the top after failover.</li>
<li><b>Routing and NAT.</b> Check the routing and forwarding tables for the SD-WAN egress interface, and that source NAT exists per physical link.</li>
<li><b>Events.</b> Read the SD-WAN events to see when and why paths changed.</li>
</ol>
<div class="eg"><p><b>Worked trace: voice stays on 5G.</b> Step 1: tunnels up on all links. Step 2: probe counters match. Step 3: broadband loss is 0.2 percent, below the 1 percent threshold, so broadband is healthy. Step 4: the session matched the "bulk" rule instead of "voice" because voice was identified late. Step 5 onwards is irrelevant. The root cause is a rule match problem, not a link problem; the rule order was changed so that the voice rule is above the bulk rule.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Reading a degraded user experience as a link fault without checking which rule matched. Forgetting that probes can be blocked by a security policy. Clearing events and losing the history you needed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Which command shows which rule a session matched? The session path-select command with the session ID. Which shows latency, jitter and loss? The path-monitor stats command. Which verifies that probe packets are sent and received? The global counters with the delta filter.</p></div>
<div class="scn"><h4>Intermittent failover with no outage</h4><p>Sessions on a branch move between two broadband links several times an hour. The path monitor statistics show latency touching 110 ms while the profile threshold is 100 ms (the default). Raising the latency threshold to match what the application tolerates, or setting a lower sensitivity, stops the flapping.</p></div>
<div class="iv"><p class="q">"A user complains about slowness on a PAN-OS SD-WAN branch. What do you do?"</p><p>I follow the ladder: tunnels, probes, quality values, rule match, distribution method, routing and NAT, then events. I use the SD-WAN show commands and the global counters for evidence, and I compare the measured values with the thresholds in the path quality profile.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Core commands: show sdwan connection, rule, path-monitor stats, session distribution, session path-select, event.</li>
<li>Supporting checks: VPN flow and IKE, global counters, routing and FIB.</li>
<li>Order: tunnels, probes, quality, rule, distribution, routing and NAT, events.</li>
<li>Evidence before changes; I show no invented output.</li>
</ul></div>
`,hi:`
<p>Jab koi flow aapke expect kiye path par nahi chalta, Panorama dashboards tasveer dete hain aur firewall CLI saboot. Documentation chhote se <code>show sdwan</code> commands ka set aur aam VPN, BGP aur routing checks list karti hai. Yeh chapter unhe unke purpose ke saath list karta hai, phir symptom se cause tak ka workflow deta hai. Main koi sample output nahi dikhata, kyunki maine exact output layout verify nahi kiya, aur main use invent nahi karunga.</p>
<h3>Analogy: car dashboard aur mechanic ke tools</h3>
<p>Dashboard batata hai ki engine light on hai (Panorama monitoring). Phir mechanic reader (CLI) lagata hai ki kaunsa sensor shikayat kar raha hai. Dono chahiye: light batati hai ki kuch galat hai, reader batata hai ki kya.</p>
<h3>Documentation ke SD-WAN commands</h3>
<table class="cmp"><tr><th>Command</th><th>Purpose</th></tr>
<tr><td><code>show sdwan connection all</code> (ya ek SD-WAN interface)</td><td>Path names, IDs, state, IP addresses aur tunnel interface numbers</td></tr>
<tr><td><code>show sdwan session distribution policy-name</code> ke baad SD-WAN policy ka naam</td><td>Tunnel members ke beech sessions kaise distribute hue</td></tr>
<tr><td><code>show sdwan rule vif sdwan.x</code></td><td>Us SD-WAN interface ke policy rules, distribution method aur thresholds</td></tr>
<tr><td><code>show sdwan event</code></td><td>Path selection aur quality measurement events; <code>clear sdwan event</code> unhe hata deta hai</td></tr>
<tr><td><code>show sdwan path-monitor stats vif sdwan.x</code></td><td>Latency, jitter aur packet loss measurements</td></tr>
<tr><td><code>show sdwan session path-select session-id</code> ke baad session ID</td><td>Kaunsa policy rule match hua aur session kaise distribute hua</td></tr>
<tr><td><code>show sdwan path-monitor parameter path-name</code> ke baad path name; saath hi <code>show sdwan path-monitor parameter vif sdwan.x</code></td><td>Monitoring mode, update intervals aur probe statistics</td></tr></table>
<h3>Supporting commands</h3>
<table class="cmp"><tr><th>Area</th><th>Documentation mein naam diye commands</th></tr>
<tr><td>Counters</td><td><code>show counter global filter delta yes</code> yeh check karne ke liye ki bheje aur receive hue probe packets barabar hain</td></tr>
<tr><td>VPN</td><td><code>show vpn flow</code>, <code>show vpn ike-sa</code>, <code>show vpn tunnel</code>; <code>test vpn ike-sa gateway</code> aur <code>test vpn ipsec-sa tunnel</code> negotiation shuru karte hain</td></tr>
<tr><td>BGP</td><td><code>show routing protocol bgp summary virtual-router</code> ke baad naam, aur <code>show routing protocol bgp loc-rib</code></td></tr>
<tr><td>Routes</td><td><code>show routing route</code> aur <code>show routing fib</code> SD-WAN egress interface dekhne ke liye</td></tr>
<tr><td>Capacity</td><td>Firewall par <code>debug sdwand capacity show</code></td></tr></table>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Commands jaise Palo Alto Networks documentation mein naam diye gaye hain.</span>
<span class="c">! Output nahi dikhaya kyunki uska exact layout verify nahi hua.</span>
show sdwan connection all
show sdwan rule vif sdwan.1
show sdwan path-monitor stats vif sdwan.1
show sdwan session distribution policy-name VOICE-RULE
show sdwan event
show vpn ike-sa
show vpn flow
show counter global filter delta yes</pre>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Troubleshooting ladder">
<rect x="10" y="10" width="150" height="45" rx="8" fill="#bae6fd"/><text x="85" y="38" text-anchor="middle" class="svg-ink" font-size="12">1. Tunnels up?</text>
<rect x="175" y="10" width="150" height="45" rx="8" fill="#bbf7d0"/><text x="250" y="38" text-anchor="middle" class="svg-ink" font-size="12">2. Probes working?</text>
<rect x="340" y="10" width="150" height="45" rx="8" fill="#fde68a"/><text x="415" y="38" text-anchor="middle" class="svg-ink" font-size="12">3. Quality values?</text>
<rect x="505" y="10" width="125" height="45" rx="8" fill="#fed7aa"/><text x="567" y="38" text-anchor="middle" class="svg-ink" font-size="12">4. Rule match?</text>
<rect x="90" y="120" width="200" height="45" rx="8" fill="#ddd6fe"/><text x="190" y="148" text-anchor="middle" class="svg-ink" font-size="12">5. Distribution method?</text>
<rect x="340" y="120" width="200" height="45" rx="8" fill="#fecaca"/><text x="440" y="148" text-anchor="middle" class="svg-ink" font-size="12">6. Routing and NAT?</text>
<line x1="160" y1="32" x2="175" y2="32" stroke="#64748b" stroke-width="2"/><line x1="325" y1="32" x2="340" y2="32" stroke="#64748b" stroke-width="2"/><line x1="490" y1="32" x2="505" y2="32" stroke="#64748b" stroke-width="2"/>
<line x1="567" y1="55" x2="190" y2="120" stroke="#64748b" stroke-width="2"/><line x1="290" y1="142" x2="340" y2="142" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ladder par neeche jao; har rung ka ek command hai jo saboot dikhata hai.</p></div>
<h3>Troubleshooting workflow</h3>
<ol>
<li><b>Tunnels up hain?</b> VPN flows aur IKE security associations check karo. Tunnel down ho to test commands se manually negotiate karo aur VPN logs padho.</li>
<li><b>Probes healthy hain?</b> Path monitor parameters aur global counters check karo: bheje aur receive hue probe packets barabar hone chahiye. Mismatch path par drop ya probes ko block karti policy ki taraf ishara karta hai.</li>
<li><b>Quality values kya hain?</b> Latency, jitter aur loss ke liye path monitor statistics padho aur path quality profile ke thresholds se compare karo.</li>
<li><b>Kaunsa rule match hua?</b> Session ID ke saath session path-select command aur interface ka rule view use karo. Galat rule match hua to application aur zone match aur rule order check karo.</li>
<li><b>Kya distribution method wahi hai jo expect hai?</b> Weighted Session Distribution rule brownout wale link ko nahi chhodta; Top Down Priority rule failover ke baad top se dobara shuru hota hai.</li>
<li><b>Routing aur NAT.</b> SD-WAN egress interface ke liye routing aur forwarding tables check karo, aur yeh ki per physical link source NAT hai.</li>
<li><b>Events.</b> SD-WAN events padho taaki dekho paths kab aur kyun badle.</li>
</ol>
<div class="eg"><p><b>Worked trace: voice 5G par hi rehti hai.</b> Step 1: saare links par tunnels up. Step 2: probe counters match. Step 3: broadband loss 0.2 percent hai, 1 percent threshold se neeche, isliye broadband healthy hai. Step 4: session "voice" ke bajay "bulk" rule se match hua kyunki voice late identify hui. Step 5 se aage irrelevant hai. Root cause rule match problem hai, link problem nahi; rule order badla gaya ki voice rule bulk rule se upar ho.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Kharab user experience ko bina yeh dekhe link fault samajhna ki kaunsa rule match hua. Yeh bhool jaana ki security policy probes block kar sakti hai. Events clear karke wohi history kho dena jo chahiye thi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaunsa command batata hai ki session ne kaunsa rule match kiya? Session ID ke saath session path-select command. Latency, jitter aur loss kaun dikhata hai? Path-monitor stats command. Probe packets bheje aur receive hue yeh kaun verify karta hai? Delta filter ke saath global counters.</p></div>
<div class="scn"><h4>Bina outage ke intermittent failover</h4><p>Branch par sessions ghante mein kai baar do broadband links ke beech move hote hain. Path monitor statistics mein latency 110 ms tak chhoti hai jabki profile threshold 100 ms (default) hai. Latency threshold ko us level tak badhana jo application sah sakti hai, ya kam sensitivity set karna, flapping rok deta hai.</p></div>
<div class="iv"><p class="q">"PAN-OS SD-WAN branch par user slowness ki shikayat karta hai. Kya karoge?"</p><p>Main ladder follow karta hoon: tunnels, probes, quality values, rule match, distribution method, routing aur NAT, phir events. Saboot ke liye SD-WAN show commands aur global counters use karta hoon, aur measured values ko path quality profile ke thresholds se compare karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Core commands: show sdwan connection, rule, path-monitor stats, session distribution, session path-select, event.</li>
<li>Supporting checks: VPN flow aur IKE, global counters, routing aur FIB.</li>
<li>Order: tunnels, probes, quality, rule, distribution, routing aur NAT, events.</li>
<li>Badalne se pehle saboot; main koi invented output nahi dikhata.</li>
</ul></div>
`}};export{e as default};