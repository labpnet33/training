var e={id:`end-to-end-troubleshooting`,h:{en:`End-to-end troubleshooting: a layered method`,hi:`End-to-end troubleshooting: layered method`},body:{en:`
<h3>Why a method beats guessing</h3>
<p>When a user says "the intranet does not open", the fault could be in seven places. Guessing wastes time and can make things worse. A <b>layered method</b> walks the path from the user outward, one layer at a time, and uses a test to <b>prove</b> each layer before moving on. This is the workflow for lab <b>mk-ops-2 (troubleshoot): prove the path with ping and traceroute</b>, and it works for any ticket.</p>

<h3>The seven layers</h3>
<table class="cmp"><tr><th>#</th><th>Layer</th><th>Question</th><th>Where to look</th></tr>
<tr><td>1</td><td>Client</td><td>Does it have the right address, gateway, SSID?</td><td>Clients list, the client shell</td></tr>
<tr><td>2</td><td>Port or AP</td><td>Is the port up, PoE on, VLAN right? Is the AP online?</td><td>Switch ports, Devices</td></tr>
<tr><td>3</td><td>Switch</td><td>Does the trunk carry the VLAN, native VLAN match?</td><td>Switch ports, alerts</td></tr>
<tr><td>4</td><td>MX</td><td>Does the MX have the VLAN, DHCP, and does the firewall allow it?</td><td>Addressing and VLANs, Firewall hits</td></tr>
<tr><td>5</td><td>Uplink</td><td>Is wan1 up, did it fail over?</td><td>Uplinks, Overview</td></tr>
<tr><td>6</td><td>VPN</td><td>Is the tunnel to the hub up, subnets enabled?</td><td>Site-to-site VPN</td></tr>
<tr><td>7</td><td>Cloud / far side</td><td>Is the destination or the dashboard itself reachable?</td><td>Live tools to the target, remote site</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Layers from client to cloud">
<rect x="5" y="40" width="80" height="50" rx="8" fill="#bae6fd"/><text x="45" y="70" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="95" y="40" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="135" y="70" text-anchor="middle" class="svg-ink" font-size="12">Port/AP</text>
<rect x="185" y="40" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="225" y="70" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<rect x="275" y="40" width="80" height="50" rx="8" fill="#fde68a"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="12">MX</text>
<rect x="365" y="40" width="80" height="50" rx="8" fill="#fed7aa"/><text x="405" y="70" text-anchor="middle" class="svg-ink" font-size="12">Uplink</text>
<rect x="455" y="40" width="80" height="50" rx="8" fill="#fecaca"/><text x="495" y="70" text-anchor="middle" class="svg-ink" font-size="12">VPN</text>
<rect x="545" y="40" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="590" y="70" text-anchor="middle" class="svg-ink" font-size="12">Cloud/far</text>
<line x1="85" y1="65" x2="95" y2="65" stroke="#64748b" stroke-width="2"/><line x1="175" y1="65" x2="185" y2="65" stroke="#64748b" stroke-width="2"/><line x1="265" y1="65" x2="275" y2="65" stroke="#64748b" stroke-width="2"/><line x1="355" y1="65" x2="365" y2="65" stroke="#64748b" stroke-width="2"/><line x1="445" y1="65" x2="455" y2="65" stroke="#64748b" stroke-width="2"/><line x1="535" y1="65" x2="545" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="5" y="115" width="630" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="13">Test each layer in order. The first layer that fails is where you work.</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Or bisect: test the middle first, then go toward the break</text>
</svg><p class="cap">The path from client to far side, one layer at a time.</p></div>

<h3>The workflow</h3>
<ol>
<li><b>State the symptom exactly.</b> Who, what, from where, since when. "Delhi PC-DEL cannot open intranet.example (10.1.20.10) since 14:10."</li>
<li><b>Check the dashboard first.</b> Overview and alerts, then the change log in the time window (previous chapters).</li>
<li><b>Test outward with live tools.</b> Ping the gateway, then 8.8.8.8, then the target. Traceroute to see the last good hop.</li>
<li><b>Map the result to a layer.</b> Use the table below.</li>
<li><b>Fix one thing, then retest from the start.</b></li>
<li><b>Record</b> cause, fix and time in the ticket.</li>
</ol>
<pre class="out">Test results  (from MX-DEL)
Ping 10.3.20.1 (MX LAN)     3/3 ok       layer 4 fine
Ping 8.8.8.8                3/3 ok       <span class="hl">layer 5 fine</span>
Ping 10.1.20.10 (Mumbai)    0/3          layer 6 or 7?
Traceroute 10.1.20.10       1 203.0.113.1 ok, 2 * * *
VPN page                    tunnel to MX-MUM: <span class="hl">down</span>
Alerts                      tunnel down (Delhi)</pre>

<table class="cmp"><tr><th>Test result</th><th>Break is at</th></tr>
<tr><td>Cannot ping the MX LAN address</td><td>Layers 1 to 3 (client, port or AP, switch)</td></tr>
<tr><td>MX LAN ok, 8.8.8.8 fails</td><td>Layer 5 (uplink) or MX NAT/firewall</td></tr>
<tr><td>8.8.8.8 ok, remote site fails</td><td>Layer 6 (VPN) or the far side</td></tr>
<tr><td>Everything pings, one app fails</td><td>Firewall rule or content filter, check hit counts</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bengaluru laptop (LAPTOP-BLR) cannot browse. Layer 1: it has 169.254.x.x, no DHCP address. Layer 2: its AP AP-BLR is online. Layer 3: the AP port trunk lacks VLAN 10 in the allowed list. The engineer adds VLAN 10, saves, and the laptop gets 10.2.10.121. Then he retests the intranet end to end. The method stopped at layer 3 because the first failing layer was found.</p></div>

<h3>Bisecting: do not always start at the client</h3>
<p>When you can test from the MX, you can <b>bisect</b>: test the middle (can the MX ping the internet?) and move toward whichever half is broken. This saves time on branches with many layers. Use the order above when you have no better clue.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> The tests change nothing. The fix is one setting at the failing layer, such as an allowed VLAN, a rule order or a VPN subnet. Retest the whole path after the fix because a fix at one layer can reveal a second fault behind it.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Changing three things at once; stopping at the first working ping; skipping the change log; not retesting end to end; trusting one test from your laptop; leaving no notes for the next shift.</p></div>
<div class="exam"><p><b>Exam trap.</b> The question shows ping results and asks which layer is broken. Find the farthest target that works: the fault is just beyond it.</p></div>

<div class="scn"><h4>Two faults, one ticket</h4><p>Delhi store: no Wi-Fi for staff and no printing. The engineer worked outward. Layer 2: AP-DEL offline, because PoE was off after a switch reboot; he enabled PoE and Wi-Fi returned. Retesting end to end showed the intranet still failed: layer 6, the VPN subnet for Delhi was disabled. Fixing both took 20 minutes, and the ticket recorded both causes.</p><p><b>Lesson:</b> retest after each fix; the first fix may hide a second fault.</p></div>

<div class="iv"><p class="q">"A branch user cannot reach a server at HQ. Walk me through your troubleshooting."</p><p>Strong answer: I confirm the exact symptom, check alerts and the change log, then test outward from the branch MX: gateway, internet, the server. I map the result to a layer (client, port or AP, switch, MX, uplink, VPN, far side), fix one thing, retest end to end and record it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a layered path: client, port or AP, switch, MX, uplink, VPN, cloud or far side.</li>
<li>State the symptom, read alerts and the change log, then test outward.</li>
<li>The farthest working target tells you the fault is just beyond it.</li>
<li>One change at a time, then retest from the start.</li>
<li>Record cause and fix in the ticket.</li>
</ul></div>
`,hi:`
<h3>Method guessing se behtar kyun hai</h3>
<p>Jab user kehta hai "intranet nahi khul raha", to fault saat jagahon mein ho sakta hai. Guess karne se time waste hota hai aur halat aur kharab ho sakti hai. <b>Layered method</b> user se bahar ki taraf path chalta hai, ek ek layer, aur har layer ko aage badhne se pehle test se <b>prove</b> karta hai. Yeh lab <b>mk-ops-2 (troubleshoot): ping aur traceroute se path prove karo</b> ka workflow hai, aur har ticket par kaam karta hai.</p>

<h3>Saat layers</h3>
<table class="cmp"><tr><th>#</th><th>Layer</th><th>Sawal</th><th>Kahan dekhna hai</th></tr>
<tr><td>1</td><td>Client</td><td>Sahi address, gateway, SSID hai?</td><td>Clients list, client shell</td></tr>
<tr><td>2</td><td>Port ya AP</td><td>Port up, PoE on, VLAN sahi? AP online?</td><td>Switch ports, Devices</td></tr>
<tr><td>3</td><td>Switch</td><td>Trunk VLAN carry karta hai, native VLAN match?</td><td>Switch ports, alerts</td></tr>
<tr><td>4</td><td>MX</td><td>MX mein VLAN, DHCP hai, aur firewall allow karta hai?</td><td>Addressing and VLANs, Firewall hits</td></tr>
<tr><td>5</td><td>Uplink</td><td>wan1 up hai, failover hua?</td><td>Uplinks, Overview</td></tr>
<tr><td>6</td><td>VPN</td><td>Hub tak tunnel up hai, subnets enabled?</td><td>Site-to-site VPN</td></tr>
<tr><td>7</td><td>Cloud / far side</td><td>Destination ya dashboard khud reachable hai?</td><td>Target tak Live tools, remote site</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Client se cloud tak layers">
<rect x="5" y="40" width="80" height="50" rx="8" fill="#bae6fd"/><text x="45" y="70" text-anchor="middle" class="svg-ink" font-size="12">Client</text>
<rect x="95" y="40" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="135" y="70" text-anchor="middle" class="svg-ink" font-size="12">Port/AP</text>
<rect x="185" y="40" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="225" y="70" text-anchor="middle" class="svg-ink" font-size="12">Switch</text>
<rect x="275" y="40" width="80" height="50" rx="8" fill="#fde68a"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="12">MX</text>
<rect x="365" y="40" width="80" height="50" rx="8" fill="#fed7aa"/><text x="405" y="70" text-anchor="middle" class="svg-ink" font-size="12">Uplink</text>
<rect x="455" y="40" width="80" height="50" rx="8" fill="#fecaca"/><text x="495" y="70" text-anchor="middle" class="svg-ink" font-size="12">VPN</text>
<rect x="545" y="40" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="590" y="70" text-anchor="middle" class="svg-ink" font-size="12">Cloud/far</text>
<line x1="85" y1="65" x2="95" y2="65" stroke="#64748b" stroke-width="2"/><line x1="175" y1="65" x2="185" y2="65" stroke="#64748b" stroke-width="2"/><line x1="265" y1="65" x2="275" y2="65" stroke="#64748b" stroke-width="2"/><line x1="355" y1="65" x2="365" y2="65" stroke="#64748b" stroke-width="2"/><line x1="445" y1="65" x2="455" y2="65" stroke="#64748b" stroke-width="2"/><line x1="535" y1="65" x2="545" y2="65" stroke="#64748b" stroke-width="2"/>
<rect x="5" y="115" width="630" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="13">Har layer order mein test karo. Jo pehli layer fail ho wahan kaam karo.</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Ya bisect karo: pehle beech ka test, phir toot ki taraf jao</text>
</svg><p class="cap">Client se far side tak path, ek ek layer.</p></div>

<h3>Workflow</h3>
<ol>
<li><b>Symptom exactly batao.</b> Kaun, kya, kahan se, kab se. "Delhi PC-DEL 14:10 se intranet.example (10.1.20.10) nahi khol pa raha."</li>
<li><b>Pehle dashboard dekho.</b> Overview aur alerts, phir time window ka change log (pichhle chapters).</li>
<li><b>Live tools se bahar ki taraf test karo.</b> Gateway ping karo, phir 8.8.8.8, phir target. Aakhri achha hop dekhne ke liye traceroute.</li>
<li><b>Result ko layer se map karo.</b> Neeche ki table use karo.</li>
<li><b>Ek cheez fix karo, phir shuru se retest.</b></li>
<li>Ticket mein cause, fix aur time <b>record</b> karo.</li>
</ol>
<pre class="out">Test results  (from MX-DEL)
Ping 10.3.20.1 (MX LAN)     3/3 ok       layer 4 fine
Ping 8.8.8.8                3/3 ok       <span class="hl">layer 5 fine</span>
Ping 10.1.20.10 (Mumbai)    0/3          layer 6 or 7?
Traceroute 10.1.20.10       1 203.0.113.1 ok, 2 * * *
VPN page                    tunnel to MX-MUM: <span class="hl">down</span>
Alerts                      tunnel down (Delhi)</pre>

<table class="cmp"><tr><th>Test result</th><th>Break kahan hai</th></tr>
<tr><td>MX LAN address ping nahi hota</td><td>Layers 1 se 3 (client, port ya AP, switch)</td></tr>
<tr><td>MX LAN ok, 8.8.8.8 fail</td><td>Layer 5 (uplink) ya MX NAT/firewall</td></tr>
<tr><td>8.8.8.8 ok, remote site fail</td><td>Layer 6 (VPN) ya far side</td></tr>
<tr><td>Sab ping hota hai, ek app fail</td><td>Firewall rule ya content filter, hit counts dekho</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bengaluru laptop (LAPTOP-BLR) browse nahi kar pa raha. Layer 1: use 169.254.x.x mila, DHCP address nahi. Layer 2: uska AP AP-BLR online hai. Layer 3: AP port trunk ki allowed list mein VLAN 10 nahi hai. Engineer VLAN 10 add karta hai, save karta hai, aur laptop ko 10.2.10.121 milta hai. Phir woh intranet end to end retest karta hai. Method layer 3 par ruk gaya kyunki pehli failing layer mil gayi.</p></div>

<h3>Bisecting: hamesha client se shuru mat karo</h3>
<p>Jab aap MX se test kar sakte ho, to <b>bisect</b> kar sakte ho: beech ka test karo (kya MX internet ping kar sakta hai?) aur jo aadha toota hai uski taraf jao. Bahut layers wali branches par isse time bachta hai. Jab koi behtar clue na ho to upar wala order use karo.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Tests kuch nahi badalte. Fix failing layer par ek setting hai, jaise allowed VLAN, rule order ya VPN subnet. Fix ke baad poora path retest karo kyunki ek layer ka fix uske peeche chhupi doosri fault ko dikha sakta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Teen cheezein ek saath badalna; pehle kaam karne wale ping par ruk jaana; change log skip karna; end to end retest na karna; apne laptop ke ek test par bharosa karna; agli shift ke liye notes na chhodna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal ping results dikhata hai aur poochta hai kaun si layer toot gayi hai. Sabse door ka target dhoondho jo kaam karta hai: fault uske theek aage hai.</p></div>

<div class="scn"><h4>Do faults, ek ticket</h4><p>Delhi store: staff ka Wi-Fi nahi aur printing nahi. Engineer ne bahar ki taraf kaam kiya. Layer 2: AP-DEL offline tha, switch reboot ke baad PoE off tha; usne PoE enable kiya aur Wi-Fi wapas aaya. End to end retest mein intranet ab bhi fail tha: layer 6, Delhi ka VPN subnet disabled tha. Dono fix karne mein 20 minute lage, aur ticket mein dono causes record hue.</p><p><b>Seekh:</b> har fix ke baad retest karo; pehla fix doosri fault chhupa sakta hai.</p></div>

<div class="iv"><p class="q">"Branch user HQ ke server tak nahi pahunch pa raha. Apna troubleshooting samjhao."</p><p>Strong answer: main exact symptom confirm karta hoon, alerts aur change log dekhta hoon, phir branch MX se bahar ki taraf test karta hoon: gateway, internet, server. Result ko layer se map karta hoon (client, port ya AP, switch, MX, uplink, VPN, far side), ek cheez fix karta hoon, end to end retest karta hoon aur record karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layered path use karo: client, port ya AP, switch, MX, uplink, VPN, cloud ya far side.</li>
<li>Symptom batao, alerts aur change log padho, phir bahar ki taraf test karo.</li>
<li>Sabse door ka working target batata hai ki fault uske theek aage hai.</li>
<li>Ek baar mein ek change, phir shuru se retest.</li>
<li>Ticket mein cause aur fix record karo.</li>
</ul></div>
`}};export{e as default};