var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: client cannot get DHCP, and rule order`,hi:`Troubleshooting workflow: client ko DHCP nahi mil raha, aur rule order`},body:{en:`
<h3>A workflow you can repeat</h3>
<p>Troubleshooting is not guessing; it is a fixed order of questions where each answer removes a whole group of causes. For the module lab <b>mk-mx-4</b> (a client cannot get DHCP) and for rule-order problems like <b>mk-mx-2</b>, use the same six steps. Say them out loud on the ticket: it keeps you calm and gives the next engineer something to follow.</p>
<ol>
<li><b>Define the symptom exactly.</b> Which client, which VLAN or SSID, since when, what does the client show (169.254.x.x, an address but no internet, an address but no access to one server)?</li>
<li><b>Is the path to the dashboard healthy?</b> Is MX online? Is the switch or AP in the path online? An offline device cannot be fixed from here (module 1).</li>
<li><b>Is the L2 path right?</b> Is the client in the right VLAN (access VLAN on the port, SSID VLAN), and is that VLAN allowed on every trunk up to the MX?</li>
<li><b>Is the service there?</b> For DHCP: does the VLAN have mode server (or a reachable relay), an enabled scope and free addresses?</li>
<li><b>Is policy blocking it?</b> Firewall order and hit counts, content filtering.</li>
<li><b>Fix one thing, retest, record.</b> Check the change log, apply the smallest fix, test with a new connection, write what you changed and why.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP troubleshooting decision flow">
<rect x="10" y="10" width="190" height="50" rx="8" fill="#fde68a"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="13">Client: no address</text>
<rect x="225" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Right VLAN on port/SSID?</text>
<rect x="440" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="13">VLAN allowed on trunks?</text>
<line x1="200" y1="35" x2="225" y2="35" stroke="#64748b" stroke-width="2"/><line x1="415" y1="35" x2="440" y2="35" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="60" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="90" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="120" text-anchor="middle" class="svg-ink" font-size="13">DHCP mode server?</text>
<line x1="440" y1="115" x2="415" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="225" y="90" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Scope enabled, pool free?</text>
<line x1="225" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="90" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">Then firewall / filter</text>
<rect x="10" y="165" width="620" height="55" rx="8" fill="#e2e8f0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Each "no" is the cause: fix that one thing, retest with a new connection</text><text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">Then record the change in the log</text>
</svg><p class="cap">From client back to the MX: VLAN, trunk, DHCP mode, pool, then policy.</p></div>

<h3>The five usual DHCP causes</h3>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>VLAN has no scope or it is disabled</td><td>Scope missing or disabled</td><td>Create or enable the scope in the VLAN table</td></tr>
<tr><td>Used 101 / 101</td><td>Pool exhausted</td><td>Shorten the lease, enlarge the pool, clear old leases</td></tr>
<tr><td>DHCP mode off</td><td>No server on that VLAN</td><td>Set server (or relay to a reachable server)</td></tr>
<tr><td>Client reaches nothing, other VLANs fine</td><td>VLAN not allowed on a trunk</td><td>Add the VLAN to the allowed list on every trunk to the MX</td></tr>
<tr><td>Client is in another VLAN's subnet</td><td>Wrong access VLAN on the switch port</td><td>Set the port to the right VLAN</td></tr>
</table>

<h3>Worked example: LAPTOP-BLR has no address</h3>
<p>Ticket: "LAPTOP-BLR shows 169.254.x.x on Bengaluru Wi-Fi staff". Step 1: symptom is clear, wireless, VLAN 10. Step 2: MX-BLR, SW-BLR and AP-BLR are online. Step 3: the SSID BharatRetail-Staff is tagged VLAN 10 and the switch port of the AP allows it. Step 4: the DHCP page shows this:</p>
<pre class="out">Addressing and VLANs / DHCP  (network: Bengaluru Branch)
VLAN  Name     Subnet         MX IP        DHCP     Used / Size
10    Staff    10.2.10.0/24   10.2.10.1    <span class="hl">off</span>      -
30    Guest    10.2.30.0/24   10.2.30.1    server   12 / 101

Alerts and events
10:36  event  Imran changed VLAN 10 DHCP mode server to off</pre>
<p>The cause is on the DHCP page itself: VLAN 10 has mode <b>off</b>, so nobody answers the Discover. The change log even names the change. Fix: set the mode back to server, keep the pool .100 to .200, click Save changes, and renew the client. It receives 10.2.10.1xx, gateway 10.2.10.1, DNS 1.1.1.1. Record: "restored VLAN 10 DHCP server; was switched off at 10:36".</p>

<h3>The same method for rule order (mk-mx-2)</h3>
<p>Symptom: "guests can still open the Mumbai server". Steps 1 to 4 confirm the guest has an address in VLAN 30 and the server is reachable, so the L2 and DHCP path are fine. Step 5 is the Firewall page: read the rules top to bottom for the guest source and the server destination, look for an earlier broad Allow, and read the hit counts (a rule with zero hits that you expect to fire is shadowed). Fix by moving the deny above the broad allow, then retest with a new connection and watch the deny's counter rise.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Reading pages changes nothing. Each fix has its own effect and you should say it before clicking: DHCP mode to server makes the MX answer Discover on VLAN 10 again; moving a deny above an allow changes the verdict for every matching connection from now on.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing several settings at once; rebooting devices first; testing on a client that already holds an old lease; assuming the firewall blocks DHCP (a client with 169.254.x.x never reached the policy stage); skipping the record.</p></div>
<div class="exam"><p><b>Exam trap.</b> No address: look at DHCP and the VLAN path. Address but no access to one place: look at the firewall and content filtering. The two groups of causes do not overlap.</p></div>

<div class="scn"><h4>Monday morning at Delhi</h4><p>Eight Delhi staff arrive on Monday with no network. Because it is every wired and wireless client in VLAN 10 only, the engineer skips the cable theory. VLAN 30 guests are fine, so the MX and uplink are healthy. The DHCP table shows VLAN 10 at 101 of 101. A weekend backup job had been plugged into the staff VLAN and cloned many virtual MAC addresses, each taking a lease. The engineer cleared the stale leases, shortened the lease time, and the backup was moved to the server VLAN.</p><p><b>Lesson:</b> the workflow found a pool problem in two minutes by comparing which VLANs are affected.</p></div>

<div class="iv"><p class="q">"Walk me through troubleshooting a client that cannot get an IP address."</p><p>Strong answer: confirm the symptom (169.254.x.x), check that the MX, switch and AP are online, verify the client is in the right VLAN and the VLAN is allowed on every trunk, check DHCP mode, scope and pool usage, then policy. Change one thing, retest with a new connection, and record it. Mention using the change log to find a recent change first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed order: symptom, devices online, L2 path, DHCP service, policy, fix and record.</li>
<li>Five DHCP causes: scope missing, pool exhausted, mode off, VLAN not on trunk, wrong access VLAN.</li>
<li>169.254.x.x points to DHCP, not to the firewall.</li>
<li>For rule problems read order and hit counts; move the specific deny above the broad allow.</li>
<li>Change one thing, retest on a new connection, and write down what you did.</li>
</ul></div>
`,hi:`
<h3>Ek workflow jo aap repeat kar sako</h3>
<p>Troubleshooting guess karna nahi hai; yeh sawaalon ka ek fixed order hai jahan har jawab causes ke poore group ko hata deta hai. Module lab <b>mk-mx-4</b> (client ko DHCP nahi mil raha) aur <b>mk-mx-2</b> jaise rule-order problems ke liye wahi chhe steps use karo. Unhe ticket par zor se bolo: isse aap shaant rehte ho aur agle engineer ko follow karne ke liye kuch milta hai.</p>
<ol>
<li><b>Symptom exactly define karo.</b> Kaunsa client, kaunsi VLAN ya SSID, kab se, client kya dikha raha hai (169.254.x.x, address hai lekin internet nahi, address hai lekin ek server tak access nahi)?</li>
<li><b>Dashboard tak path healthy hai?</b> MX online hai? Raaste ka switch ya AP online hai? Offline device yahan se fix nahi ho sakta (module 1).</li>
<li><b>L2 path sahi hai?</b> Client sahi VLAN mein hai (port par access VLAN, SSID VLAN), aur woh VLAN MX tak har trunk par allowed hai?</li>
<li><b>Service hai?</b> DHCP ke liye: VLAN ka mode server hai (ya reachable relay), scope enabled hai aur free addresses hain?</li>
<li><b>Policy rok rahi hai?</b> Firewall order aur hit counts, content filtering.</li>
<li><b>Ek cheez fix karo, retest karo, record karo.</b> Change log check karo, sabse chhota fix lagao, nayi connection se test karo, aur likho kya badla aur kyun.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP troubleshooting decision flow">
<rect x="10" y="10" width="190" height="50" rx="8" fill="#fde68a"/><text x="105" y="40" text-anchor="middle" class="svg-ink" font-size="13">Client: address nahi</text>
<rect x="225" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Sahi VLAN port/SSID par?</text>
<rect x="440" y="10" width="190" height="50" rx="8" fill="#bae6fd"/><text x="535" y="40" text-anchor="middle" class="svg-ink" font-size="13">VLAN trunks par allowed?</text>
<line x1="200" y1="35" x2="225" y2="35" stroke="#64748b" stroke-width="2"/><line x1="415" y1="35" x2="440" y2="35" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="60" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="90" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="120" text-anchor="middle" class="svg-ink" font-size="13">DHCP mode server?</text>
<line x1="440" y1="115" x2="415" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="225" y="90" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Scope enabled, pool free?</text>
<line x1="225" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="90" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="13">Phir firewall / filter</text>
<rect x="10" y="165" width="620" height="55" rx="8" fill="#e2e8f0"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Har "nahi" cause hai: wahi ek cheez fix karo, nayi connection se retest</text><text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">Phir change log mein record karo</text>
</svg><p class="cap">Client se MX tak peeche: VLAN, trunk, DHCP mode, pool, phir policy.</p></div>

<h3>DHCP ke paanch aam causes</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td>VLAN par scope nahi ya disabled</td><td>Scope missing ya disabled</td><td>VLAN table mein scope banao ya enable karo</td></tr>
<tr><td>Used 101 / 101</td><td>Pool exhausted</td><td>Lease chhota karo, pool bada karo, purane leases clear karo</td></tr>
<tr><td>DHCP mode off</td><td>Us VLAN par server nahi</td><td>Server set karo (ya reachable server ko relay)</td></tr>
<tr><td>Client kuch reach nahi karta, baaki VLANs theek</td><td>VLAN trunk par allowed nahi</td><td>MX tak har trunk ki allowed list mein VLAN jodo</td></tr>
<tr><td>Client doosri VLAN ke subnet mein hai</td><td>Switch port par galat access VLAN</td><td>Port ko sahi VLAN par set karo</td></tr>
</table>

<h3>Worked example: LAPTOP-BLR ko address nahi mil raha</h3>
<p>Ticket: "LAPTOP-BLR Bengaluru Wi-Fi staff par 169.254.x.x dikha raha hai". Step 1: symptom saaf hai, wireless, VLAN 10. Step 2: MX-BLR, SW-BLR aur AP-BLR online hain. Step 3: SSID BharatRetail-Staff VLAN 10 tagged hai aur AP ka switch port use allow karta hai. Step 4: DHCP page yeh dikhata hai:</p>
<pre class="out">Addressing and VLANs / DHCP  (network: Bengaluru Branch)
VLAN  Name     Subnet         MX IP        DHCP     Used / Size
10    Staff    10.2.10.0/24   10.2.10.1    <span class="hl">off</span>      -
30    Guest    10.2.30.0/24   10.2.30.1    server   12 / 101

Alerts and events
10:36  event  Imran changed VLAN 10 DHCP mode server to off</pre>
<p>Cause DHCP page par hi hai: VLAN 10 ka mode <b>off</b> hai, isliye Discover ka koi jawab nahi deta. Change log change ka naam bhi batata hai. Fix: mode wapas server karo, pool .100 se .200 rakho, Save changes click karo, aur client ko renew karo. Use 10.2.10.1xx, gateway 10.2.10.1, DNS 1.1.1.1 milta hai. Record: "VLAN 10 DHCP server restore kiya; 10:36 par off kiya gaya tha".</p>

<h3>Rule order ke liye wahi method (mk-mx-2)</h3>
<p>Symptom: "guests ab bhi Mumbai server khol sakte hain". Steps 1 se 4 confirm karte hain ki guest ko VLAN 30 mein address hai aur server reachable hai, isliye L2 aur DHCP path theek hain. Step 5 Firewall page hai: guest source aur server destination ke liye rules upar se neeche padho, pehle ka koi broad Allow dhoondho, aur hit counts padho (jis rule se fire hone ki ummeed hai uske zero hits ka matlab shadowed). Deny ko broad allow ke upar le jaakar fix karo, phir nayi connection se retest karo aur deny ka counter badhta dekho.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Pages padhne se kuch nahi badalta. Har fix ka apna effect hota hai aur click se pehle use bolna chahiye: DHCP mode server karne se MX VLAN 10 par phir Discover ka jawab dene lagta hai; deny ko allow ke upar le jaane se ab se har matching connection ka verdict badal jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Kai settings ek saath badalna; pehle devices reboot karna; aise client par test karna jiske paas purani lease hai; maan lena ki firewall DHCP block karta hai (169.254.x.x wala client kabhi policy stage tak pahuncha hi nahi); record skip karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Address nahi: DHCP aur VLAN path dekho. Address hai lekin ek jagah access nahi: firewall aur content filtering dekho. Causes ke yeh do groups overlap nahi karte.</p></div>

<div class="scn"><h4>Delhi mein Monday subah</h4><p>Monday ko Delhi ke aath staff aate hain aur network nahi hai. Kyunki sirf VLAN 10 ke har wired aur wireless client ko problem hai, engineer cable ki theory skip karta hai. VLAN 30 guests theek hain, isliye MX aur uplink healthy hain. DHCP table mein VLAN 10 par 101 mein se 101 dikhta hai. Weekend ka ek backup job staff VLAN mein lag gaya tha aur usne bahut saare virtual MAC addresses clone kiye, har ek ne lease li. Engineer ne stale leases clear kiye, lease time chhota kiya, aur backup ko server VLAN mein move kiya.</p><p><b>Seekh:</b> workflow ne do minute mein pool problem pakad li, yeh compare karke ki kaunsi VLANs affected hain.</p></div>

<div class="iv"><p class="q">"Mujhe bataao ki jis client ko IP address nahi mil raha use kaise troubleshoot karoge."</p><p>Strong answer: symptom confirm karo (169.254.x.x), check karo ki MX, switch aur AP online hain, verify karo ki client sahi VLAN mein hai aur VLAN har trunk par allowed hai, DHCP mode, scope aur pool usage check karo, phir policy. Ek cheez badlo, nayi connection se retest karo, aur record karo. Bolo ki pehle change log se recent change dhoondhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed order: symptom, devices online, L2 path, DHCP service, policy, fix aur record.</li>
<li>DHCP ke paanch causes: scope missing, pool exhausted, mode off, VLAN trunk par nahi, galat access VLAN.</li>
<li>169.254.x.x DHCP ki taraf ishara karta hai, firewall ki taraf nahi.</li>
<li>Rule problems ke liye order aur hit counts padho; specific deny ko broad allow ke upar le jao.</li>
<li>Ek cheez badlo, nayi connection par retest karo, aur likho kya kiya.</li>
</ul></div>
`}};export{e as default};