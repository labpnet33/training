var e={id:`critical-role-lab`,h:{en:`Critical-role: keep people working when ClearPass is down`,hi:`Critical-role: ClearPass down ho tab bhi log kaam karte rahein`},body:{en:`
<h3>Start with the problem</h3>
<p>ClearPass is the brain of access control, and brains can be unreachable: a power failure in the server room, a broken uplink, a maintenance mistake, or a network split. The switch cannot ask a question nobody answers. With no fallback, no new client can authenticate and the whole floor stops. This is lab <b>cp-critical-role</b>. The link from R1 to the server room (GigabitEthernet0/1) is down, so CPPM at 10.20.60.10 is unreachable, and no laptop can authenticate.</p>

<h3>How the switch knows the server is dead</h3>
<p>The switch sends RADIUS requests and waits for an answer (the model shows Timeout 5 seconds and Retries 1). If requests time out, it marks the server <b>unreachable</b>. The critical-role is applied only when the server is dead, not when it merely said no. That is the key difference from the reject-role. You should always confirm the cause before you change anything.</p>
<pre class="code">ACCESS# show radius-server
ACCESS# ping 10.20.60.10</pre>
<pre class="out">****** Global RADIUS Configuration ******
Shared-Secret:       None
Timeout:             5
Retries:             1
Authentication port: 1812
Accounting port:     1813

***** RADIUS Server information *****
Server-Name        : 10.20.60.10
Auth-Port          : 1812
Acct-Port          : 1813
VRF                : default
Shared-Secret      : &lt;configured&gt;
<span class="hl">Status             : unreachable (no response)</span>
Auth requests sent : 6
Access-Accept      : 0
Access-Reject      : 0
<span class="hl">Timeouts           : 6</span></pre>
<p>Timeouts rising with zero Accepts and zero Rejects is the signature of a dead server, not of bad credentials. The ping to 10.20.60.10 also fails. Together they point to the path (R1 g0/1) or to ClearPass itself, not to alice's password.</p>

<h3>The plan in three steps</h3>
<ol>
<li>Prove from the switch that the RADIUS server is dead (<code>show radius-server</code>, <code>ping</code>).</li>
<li>Define role CRITICAL (VLAN 10), set it as the critical-role on 1/1/3, and prove LAPTOP1 is authorized by the critical role.</li>
<li>Bring the R1 link back up, bounce 1/1/3 and prove LAPTOP1 gets its normal RADIUS role EMPLOYEE again.</li>
</ol>

<h3>Step 2: the configuration</h3>
<pre class="code">ACCESS(config)# port-access role CRITICAL
ACCESS(config-pa-role)# vlan access 10
ACCESS(config-pa-role)# exit
ACCESS(config)# interface 1/1/3
ACCESS(config-if)# aaa authentication port-access critical-role CRITICAL
ACCESS(config-if)# exit</pre>
<p>Notice that CRITICAL maps to VLAN 10, the same VLAN as EMPLOYEE. The role has its own name on purpose. It makes the situation visible: when you read <code>show port-access clients</code>, a client with role CRITICAL is a client that was let in by the switch alone, without a ClearPass decision.</p>
<pre class="code">ACCESS# show port-access clients</pre>
<pre class="out">Port Access Clients

Total Number of Clients : 1

Port   MAC-Address        User   Method  Status         Role      VLAN
<span class="hl">1/1/3  00:50:2f:e9:9a:01  alice  dot1x   Authenticated  CRITICAL  10</span></pre>
<p>In the lab the first authentication attempt after you configure the role waits for the RADIUS timeouts to run out (about 45 seconds in the guided run), so give it time. In a real network the delay depends on the switch timers and the retry settings.</p>

<h3>Step 3: restore and return to normal</h3>
<p>Fix the cause: on R1 bring the interface back with <code>interface GigabitEthernet0/1</code> then <code>no shutdown</code>. Then make LAPTOP1 authenticate again by bouncing its port.</p>
<pre class="code">R1(config)# interface GigabitEthernet0/1
R1(config-if)# no shutdown
ACCESS(config)# interface 1/1/3
ACCESS(config-if)# shutdown
ACCESS(config-if)# no shutdown
ACCESS# show port-access clients</pre>
<pre class="out">Port   MAC-Address        User   Method  Status         Role      VLAN
<span class="hl">1/1/3  00:50:2f:e9:9a:01  alice  dot1x   Authenticated  EMPLOYEE  10</span></pre>
<p>The role is EMPLOYEE again, assigned by ClearPass. That is the success condition: the client must not remain in CRITICAL once the server is back. A session that stays in the critical-role after recovery is a quiet policy bypass. In the lab you force the re-authentication by bouncing the port; a production design must also cover how and when clients are re-evaluated after recovery, and the behaviour depends on the switch software release and its timers.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Critical role timeline">
<line x1="30" y1="70" x2="610" y2="70" stroke="#64748b"/>
<rect x="30" y="50" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="105" y="75" text-anchor="middle" class="svg-ink" font-size="12">Normal: role EMPLOYEE</text>
<rect x="180" y="50" width="250" height="40" rx="6" fill="#fed7aa"/><text x="305" y="75" text-anchor="middle" class="svg-ink" font-size="12">ClearPass down: role CRITICAL</text>
<rect x="430" y="50" width="180" height="40" rx="6" fill="#bbf7d0"/><text x="520" y="75" text-anchor="middle" class="svg-ink" font-size="12">Recovered: EMPLOYEE</text>
<text x="180" y="40" text-anchor="middle" class="svg-muted" font-size="12">link down</text><text x="430" y="40" text-anchor="middle" class="svg-muted" font-size="12">link up + bounce</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Existing sessions are not the problem; new logins are.</text>
</svg><p class="cap">The critical-role covers the outage window only; recovery must bring the client back to the ClearPass-assigned role.</p></div>

<h3>Design: the security trade-off</h3>
<p>A critical-role is a <b>fail-open</b> decision: while the server is down, the switch grants network access without an identity check. That is a deliberate trade of security for availability, and you decide it per port and per population.</p>
<ul>
<li>Employees on managed floors: critical-role to the employee VLAN, so work continues. Accept that identity checks are skipped for the outage.</li>
<li>Higher-risk ports, for example contractors or lab areas: map the critical-role to a limited VLAN, or leave it out so that those ports fail closed.</li>
<li>Guest and visitor ports: usually fail closed or to internet-only.</li>
<li>Always log and alarm on the critical-role. It means your authentication service is down.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Testing the critical-role by shutting down the client port or by making ClearPass reject. Neither produces a dead server. A reject triggers the reject-role; a dead server means no answer at all.</p></div>

<div class="exam"><p><b>Exam trap.</b> The critical-role gives access without authentication, so the server must be unreachable. If ClearPass answers, even with a reject, the critical-role is not used. Another trap: a dropped request (wrong secret, unregistered NAD) looks like silence and marks the server dead, which can send clients to the critical-role while ClearPass is perfectly healthy.</p></div>

<div class="scn"><h4>The silent secret change</h4><p>After a ClearPass upgrade, a switch could no longer authenticate anyone. The first symptom was every port landing in CRITICAL. The switch showed the server unreachable, yet ClearPass was up. The Event Viewer on ClearPass showed requests being dropped because the shared secret on the network device had been retyped differently. Because the critical-role was in place, the floor kept working while the engineer corrected the secret.</p><p><b>Lesson:</b> a dead-server status can be caused by drops on the server side, so check both the switch and the ClearPass Event Viewer.</p></div>

<div class="iv"><p class="q">"What is a critical-role and what are the risks of enabling it?"</p><p>Strong answer: it is a role the switch applies when it cannot reach any RADIUS server, so users keep working during an outage. The risk is fail-open access without authentication, so use it only for populations where availability outweighs the risk, restrict its VLAN where possible, monitor it as an alarm, and make sure clients return to their normal role after recovery.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The critical-role is used only when the RADIUS server is unreachable; a reject uses the reject-role.</li>
<li>Prove a dead server first: show radius-server shows unreachable, timeouts rising, no accepts or rejects.</li>
<li>Config: role CRITICAL with VLAN, then the critical-role command under the interface.</li>
<li>After recovery, bounce the port and confirm the RADIUS role EMPLOYEE returns.</li>
<li>It is a fail-open design decision; limit, log and alarm it.</li>
</ul></div>
`,hi:`
<h3>Problem se shuru karo</h3>
<p>ClearPass access control ka dimaag hai, aur dimaag unreachable ho sakta hai: server room mein power failure, toota hua uplink, maintenance ki galti, ya network split. Switch aisa sawaal nahi pooch sakta jiska jawab koi na de. Fallback ke bina koi naya client authenticate nahi kar sakta aur poora floor ruk jaata hai. Yeh lab <b>cp-critical-role</b> hai. R1 se server room ka link (GigabitEthernet0/1) down hai, isliye 10.20.60.10 par CPPM unreachable hai, aur koi laptop authenticate nahi kar sakta.</p>

<h3>Switch ko kaise pata chalta hai ki server dead hai</h3>
<p>Switch RADIUS requests bhejta hai aur jawab ka wait karta hai (model Timeout 5 second aur Retries 1 dikhata hai). Requests time out hon to woh server ko <b>unreachable</b> mark karta hai. Critical-role sirf tab apply hota hai jab server dead ho, tab nahi jab usne sirf na bola ho. Reject-role se yahi key difference hai. Kuch badalne se pehle hamesha cause confirm karo.</p>
<pre class="code">ACCESS# show radius-server
ACCESS# ping 10.20.60.10</pre>
<pre class="out">****** Global RADIUS Configuration ******
Shared-Secret:       None
Timeout:             5
Retries:             1
Authentication port: 1812
Accounting port:     1813

***** RADIUS Server information *****
Server-Name        : 10.20.60.10
Auth-Port          : 1812
Acct-Port          : 1813
VRF                : default
Shared-Secret      : &lt;configured&gt;
<span class="hl">Status             : unreachable (no response)</span>
Auth requests sent : 6
Access-Accept      : 0
Access-Reject      : 0
<span class="hl">Timeouts           : 6</span></pre>
<p>Timeouts badhna aur Accept aur Reject dono zero hona dead server ki signature hai, bad credentials ki nahi. 10.20.60.10 ko ping bhi fail hota hai. Dono milkar path (R1 g0/1) ya ClearPass khud ki taraf ishara karte hain, alice ke password ki taraf nahi.</p>

<h3>Teen steps ka plan</h3>
<ol>
<li>Switch se prove karo ki RADIUS server dead hai (<code>show radius-server</code>, <code>ping</code>).</li>
<li>Role CRITICAL (VLAN 10) define karo, use 1/1/3 par critical-role set karo, aur prove karo LAPTOP1 critical role se authorized hai.</li>
<li>R1 link wapas up karo, 1/1/3 bounce karo aur prove karo LAPTOP1 ko normal RADIUS role EMPLOYEE phir mila.</li>
</ol>

<h3>Step 2: configuration</h3>
<pre class="code">ACCESS(config)# port-access role CRITICAL
ACCESS(config-pa-role)# vlan access 10
ACCESS(config-pa-role)# exit
ACCESS(config)# interface 1/1/3
ACCESS(config-if)# aaa authentication port-access critical-role CRITICAL
ACCESS(config-if)# exit</pre>
<p>Dhyan do ki CRITICAL VLAN 10 se map hai, wahi VLAN jo EMPLOYEE ki hai. Role ka apna naam jaan-boojh kar hai. Isse situation dikhne lagti hai: <code>show port-access clients</code> padhte waqt role CRITICAL wala client woh hai jise sirf switch ne andar aane diya, ClearPass ke decision ke bina.</p>
<pre class="code">ACCESS# show port-access clients</pre>
<pre class="out">Port Access Clients

Total Number of Clients : 1

Port   MAC-Address        User   Method  Status         Role      VLAN
<span class="hl">1/1/3  00:50:2f:e9:9a:01  alice  dot1x   Authenticated  CRITICAL  10</span></pre>
<p>Lab mein role configure karne ke baad pehla authentication attempt RADIUS timeouts khatam hone ka wait karta hai (guided run mein lagbhag 45 second), isliye time do. Real network mein delay switch timers aur retry settings par depend karta hai.</p>

<h3>Step 3: restore karo aur normal par wapas</h3>
<p>Cause fix karo: R1 par <code>interface GigabitEthernet0/1</code> phir <code>no shutdown</code> se interface wapas laao. Phir LAPTOP1 ka port bounce karke use dobara authenticate karwao.</p>
<pre class="code">R1(config)# interface GigabitEthernet0/1
R1(config-if)# no shutdown
ACCESS(config)# interface 1/1/3
ACCESS(config-if)# shutdown
ACCESS(config-if)# no shutdown
ACCESS# show port-access clients</pre>
<pre class="out">Port   MAC-Address        User   Method  Status         Role      VLAN
<span class="hl">1/1/3  00:50:2f:e9:9a:01  alice  dot1x   Authenticated  EMPLOYEE  10</span></pre>
<p>Role phir EMPLOYEE hai, ClearPass ne assign kiya. Yahi success condition hai: server wapas aane par client CRITICAL mein nahi rehna chahiye. Recovery ke baad bhi critical-role mein atka session chupchaap policy bypass hai. Lab mein aap port bounce karke re-authentication force karte ho; production design mein yeh bhi cover karna padta hai ki recovery ke baad clients kab aur kaise re-evaluate honge, aur behaviour switch software release aur timers par depend karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Critical role timeline">
<line x1="30" y1="70" x2="610" y2="70" stroke="#64748b"/>
<rect x="30" y="50" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="105" y="75" text-anchor="middle" class="svg-ink" font-size="12">Normal: role EMPLOYEE</text>
<rect x="180" y="50" width="250" height="40" rx="6" fill="#fed7aa"/><text x="305" y="75" text-anchor="middle" class="svg-ink" font-size="12">ClearPass down: role CRITICAL</text>
<rect x="430" y="50" width="180" height="40" rx="6" fill="#bbf7d0"/><text x="520" y="75" text-anchor="middle" class="svg-ink" font-size="12">Recovered: EMPLOYEE</text>
<text x="180" y="40" text-anchor="middle" class="svg-muted" font-size="12">link down</text><text x="430" y="40" text-anchor="middle" class="svg-muted" font-size="12">link up + bounce</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Problem existing sessions nahi; naye logins hain.</text>
</svg><p class="cap">Critical-role sirf outage window cover karta hai; recovery client ko ClearPass-assigned role par wapas laye.</p></div>

<h3>Design: security trade-off</h3>
<p>Critical-role ek <b>fail-open</b> decision hai: server down hone par switch identity check ke bina network access deta hai. Yeh security ko availability ke liye jaan-boojh kar trade karna hai, aur aap ise per port aur per population decide karte ho.</p>
<ul>
<li>Managed floors ke employees: critical-role employee VLAN par, taaki kaam chalta rahe. Maan lo ki outage ke dauraan identity checks skip honge.</li>
<li>Higher-risk ports, jaise contractors ya lab areas: critical-role ko limited VLAN se map karo, ya hata do taaki woh ports fail closed rahein.</li>
<li>Guest aur visitor ports: aam taur par fail closed ya internet-only.</li>
<li>Critical-role ko hamesha log aur alarm karo. Iska matlab hai ki aapki authentication service down hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Critical-role ko client port shut karke ya ClearPass se reject karwa kar test karna. Dono dead server nahi banate. Reject reject-role trigger karta hai; dead server ka matlab hai bilkul jawab nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Critical-role authentication ke bina access deta hai, isliye server unreachable hona chahiye. Agar ClearPass jawab de, reject ke saath bhi, to critical-role use nahi hota. Ek aur trap: dropped request (galat secret, unregistered NAD) silence jaisa dikhta hai aur server ko dead mark karta hai, jisse ClearPass bilkul healthy hote hue bhi clients critical-role mein ja sakte hain.</p></div>

<div class="scn"><h4>Chupchaap secret change</h4><p>ClearPass upgrade ke baad ek switch kisi ko authenticate nahi kar paya. Pehla symptom: har port CRITICAL mein land hua. Switch ne server unreachable dikhaya, jabki ClearPass up tha. ClearPass ke Event Viewer ne dikhaya ki requests drop ho rahi hain kyunki network device par shared secret alag retype ho gaya tha. Critical-role ke kaaran floor kaam karta raha jab engineer ne secret theek kiya.</p><p><b>Seekh:</b> dead-server status server side ke drops se bhi ho sakta hai, isliye switch aur ClearPass Event Viewer dono check karo.</p></div>

<div class="iv"><p class="q">"Critical-role kya hai aur ise enable karne ke risks kya hain?"</p><p>Strong answer: yeh woh role hai jo switch tab apply karta hai jab woh kisi RADIUS server tak pahunch na sake, taaki outage mein users kaam karte rahein. Risk hai bina authentication ke fail-open access, isliye ise sirf un populations ke liye use karo jahan availability risk se zyada important ho, jahan possible ho uski VLAN restrict karo, use alarm ki tarah monitor karo, aur pakka karo ki recovery ke baad clients apne normal role par wapas aayein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Critical-role sirf tab use hota hai jab RADIUS server unreachable ho; reject par reject-role use hota hai.</li>
<li>Pehle dead server prove karo: show radius-server unreachable, timeouts badhte hue, na accept na reject.</li>
<li>Config: VLAN ke saath role CRITICAL, phir interface ke neeche critical-role command.</li>
<li>Recovery ke baad port bounce karo aur confirm karo RADIUS role EMPLOYEE wapas aaya.</li>
<li>Yeh fail-open design decision hai; limit, log aur alarm karo.</li>
</ul></div>
`}};export{e as default};