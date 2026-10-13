var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: "admins cannot log in" and other management-plane tickets`,hi:`Troubleshooting workflow: "admins login nahi kar pa rahe" aur doosre management-plane tickets`},body:{en:`
<p>When a hotel guest's key card does not open the door, a good receptionist does not reprogram every lock. She checks in order: is the card physically working, does the system know this card, does the card's code match the lock's code, is the booking valid, and does the booking include this floor? Troubleshooting AAA follows the same ladder, from the network up to the policy, and you stop at the first rung that fails.</p>

<h3>The AAA troubleshooting ladder</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="AAA troubleshooting ladder">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Reachability: can R1 reach 10.10.10.100 TCP 49 from its source address?</text>
<rect x="20" y="58" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">2. Identity: does ISE know the NAS IP the packets come from?</text>
<rect x="20" y="106" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">3. Shared key: same secret on both sides?</text>
<rect x="20" y="154" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">4. User and policy: right password, account enabled, rule matched?</text>
<rect x="20" y="202" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="13">5. Authorization and accounting: privilege level, command set, records</text>
<text x="320" y="262" text-anchor="middle" class="svg-accent" font-size="12">Steps 1 to 3 give ERROR (no answer); steps 4 and 5 give FAIL (an answer)</text>
</svg><p class="cap">Work top to bottom. The result type tells you which half of the ladder the fault is on.</p></div>

<p>The single most useful clue is the result of <code>test aaa</code>:</p>
<ul>
<li><b>"No authoritative response from any server."</b> = ERROR. The server never gave a valid answer: routing, ACL, source address unknown to ISE, or a key mismatch (a TACACS+ server that cannot decode the packet drops or resets the session). Local fallback will be working, which is why "only the backup account works" is a classic symptom.</li>
<li><b>"User authentication request was rejected by server."</b> = FAIL. The path and key are fine; look at the user, password, account state or policy on ISE.</li>
<li><b>"User was successfully authenticated."</b> but logins still land at level 1 or commands fail: look at authorization (exec authorization missing, wrong shell profile, command set).</li>
</ul>

<h3>Tools on the router and on ISE</h3>
<pre class="code">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
R1# show aaa servers
R1# show tacacs
R1# show running-config | include tacacs|aaa
R1# ping 10.10.10.100 source GigabitEthernet0/0
R1# debug tacacs
R1# debug aaa authentication
R1# debug aaa authorization</pre>
<p>On ISE, the TACACS+ live log shows every request with the NAS address, the user and the failure reason, such as an unknown network device or a shared-secret mismatch. In the lab, <code>aaa-server show log</code> on ISE gives the same information.</p>

<h3>Walkthrough: Lab 2, "Admins cannot log in via TACACS+"</h3>
<p><b>Step 1: reproduce.</b></p>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
Attempting authentication test to server-group tacacs+ using tacacs+
<span class="hl">No authoritative response from any server.</span></pre>
<p>ERROR, so the fault is on rungs 1 to 3. The ping to 10.10.10.100 works, so rung 1 is fine at the IP level.</p>
<p><b>Step 2: ask the server.</b></p>
<pre class="out">ISE&gt; aaa-server show log
Recent events:
<span class="hl">  TACACS+ request from 10.99.99.99 ignored: unknown network device</span></pre>
<p>ISE sees requests from 10.99.99.99, an address it has never heard of. The router config explains why:</p>
<pre class="out">R1# show running-config | include tacacs
tacacs server ISE
<span class="hl">ip tacacs source-interface Loopback0</span></pre>
<p>Loopback0 is 10.99.99.99, but ISE has R1 defined as 10.10.10.1. The answer to the task question is <b>unknown</b>. Fix it by sourcing from the known address, or (in real life) by adding the loopback to ISE as the NAS IP; the lab expects the first:</p>
<pre class="code">R1(config)# no ip tacacs source-interface</pre>
<p><b>Step 3: test again.</b> Still "No authoritative response", but the server log changes:</p>
<pre class="out">ISE&gt; aaa-server show log
<span class="hl">  TACACS+ request from 10.10.10.1 ignored: shared key mismatch</span>

R1# debug tacacs
TPLUS(0000002D)/0/READ: socket closed by server 10.10.10.100 (bad key or unknown NAS?)</pre>
<p>Now ISE knows the device, but the key is wrong. The running config shows <code>key WRONG-KEY</code>.</p>
<pre class="code">R1(config)# tacacs server ISE
R1(config-server-tacacs)# key NK-t4c-26</pre>
<p><b>Step 4: confirm.</b></p>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
Attempting authentication test to server-group tacacs+ using tacacs+
<span class="hl">User was successfully authenticated.</span></pre>
<p>Notice what we did not do: we did not remove TACACS+, change the method list to local first, or disable authorization. The design stayed intact; only the two faults were fixed.</p>

<h3>Other management-plane tickets</h3>
<table class="cmp">
<tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>snmpget: Authentication failure</td><td>wrong auth password or algorithm</td><td><code>show snmp user</code></td></tr>
<tr><td>snmpget: Unknown user name</td><td>user missing, or engine ID changed</td><td><code>show snmp user</code>, <code>show snmp engineID</code></td></tr>
<tr><td>snmpget: Timeout</td><td>ACL on group, routing, UDP 161 blocked</td><td><code>show snmp group</code>, ACL counters</td></tr>
<tr><td>Clock is unsynchronized</td><td>missing trusted-key, key mismatch, UDP 123 blocked</td><td><code>show ntp associations detail</code></td></tr>
<tr><td>No messages on the collector</td><td>trap level too low, wrong host, collector firewall</td><td><code>show logging</code> (lines logged to host)</td></tr>
<tr><td>SSH refused immediately</td><td>access-class, quiet mode, no RSA key</td><td><code>show login</code>, <code>show ip ssh</code></td></tr>
<tr><td>Logged in but level 1</td><td>no <code>aaa authorization exec</code></td><td><code>show privilege</code></td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A NOC ticket says "SNMP polling of CORE stopped after the maintenance". <code>snmpget</code> from NMS returns "Unknown user name". <code>show snmp user</code> on CORE is empty. The change log shows the engineer set a new <code>snmp-server engineID local</code> to fix a duplicate ID. That invalidated the localised keys, so the user vanished. Re-entering <code>snmp-server user nocmon GRP v3 auth sha NocAuth!26 priv aes 128 PrivMon!26</code> restores polling.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Fixing" an AAA outage by changing the method list to <code>local group tacacs+</code> or removing <code>aaa new-model</code>. Logins work again, but personal accounts, command authorization and accounting are gone, and nobody remembers to revert. Fix the reachability, source address or key instead.</p></div>

<div class="exam"><p><b>Exam trap.</b> When only the local backup account works, the server is returning ERROR (unreachable, unknown NAS, key mismatch). When nobody can log in including local users, suspect a FAIL-then-stop situation, or a method list with no local method.</p></div>

<div class="scn"><h4>The loopback that moved</h4><p>After a routing redesign, the network team changed every router's <code>ip tacacs source-interface</code> to Loopback0 for consistency. Overnight, all personal logins failed and admins used the break-glass account. ISE live logs showed hundreds of requests from unknown devices. The loopback addresses had never been added to ISE. The fix was a bulk import of the loopbacks as NAS IPs, followed by rotating the break-glass password that had been used widely during the outage.</p><p><b>Lesson:</b> the source address and the NAS definition must match; change both together, and rotate emergency credentials after using them.</p></div>

<div class="iv"><p class="q">"Admins say only the local account works on a router. How do you troubleshoot?"</p><p>Recognise the ERROR pattern: TACACS+ is not answering validly. Run <code>test aaa</code>, check <code>show aaa servers</code> (DEAD, timeouts), ping the server from the configured source interface, check ISE live logs for "unknown device" or "shared secret mismatch", and compare the source interface and key on both sides. Fix without weakening the design, test, and rotate the break-glass password.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Climb the ladder: reachability, NAS identity, shared key, user and policy, authorization and accounting.</li>
<li>"No authoritative response" = ERROR (path, source, key); "rejected" = FAIL (user or policy).</li>
<li>Use <code>test aaa</code>, <code>show aaa servers</code>, <code>show tacacs</code>, debugs and the ISE live log together.</li>
<li>Lab 2 has two faults: source-interface Loopback0 (unknown device) and a wrong key (key mismatch).</li>
<li>Fix the root cause; never "fix" by weakening method lists or removing AAA.</li>
</ul></div>
`,hi:`
<p>Jab hotel guest ka key card darwaza nahi kholta, to achhi receptionist har lock reprogram nahi karti. Woh order mein check karti hai: kya card physically kaam kar raha hai, kya system is card ko jaanta hai, kya card ka code lock ke code se match karta hai, kya booking valid hai, aur kya booking mein yeh floor shamil hai? AAA troubleshooting isi seedhi ko follow karta hai, network se policy tak, aur aap pehli fail hone wali seedhi par ruk jaate ho.</p>

<h3>AAA troubleshooting ladder</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="AAA troubleshooting ladder">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">1. Reachability: kya R1 apne source address se 10.10.10.100 TCP 49 tak pahunchta hai?</text>
<rect x="20" y="58" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">2. Identity: kya ISE us NAS IP ko jaanta hai jahan se packets aate hain?</text>
<rect x="20" y="106" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">3. Shared key: dono taraf same secret?</text>
<rect x="20" y="154" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">4. User aur policy: sahi password, account enabled, rule match?</text>
<rect x="20" y="202" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="13">5. Authorization aur accounting: privilege level, command set, records</text>
<text x="320" y="262" text-anchor="middle" class="svg-accent" font-size="12">Steps 1 se 3 ERROR dete hain (koi jawab nahi); steps 4 aur 5 FAIL (ek jawab)</text>
</svg><p class="cap">Upar se neeche kaam karo. Result type batata hai ki fault ladder ke kaunse aadhe mein hai.</p></div>

<p>Sabse useful clue <code>test aaa</code> ka result hai:</p>
<ul>
<li><b>"No authoritative response from any server."</b> = ERROR. Server ne kabhi valid jawab nahi diya: routing, ACL, ISE ke liye anjaan source address, ya key mismatch (jo TACACS+ server packet decode nahi kar paata woh session drop ya reset karta hai). Local fallback kaam kar raha hoga, isiliye "sirf backup account chalta hai" ek classic symptom hai.</li>
<li><b>"User authentication request was rejected by server."</b> = FAIL. Path aur key theek hain; ISE par user, password, account state ya policy dekho.</li>
<li><b>"User was successfully authenticated."</b> par logins abhi bhi level 1 par aate hain ya commands fail hote hain: authorization dekho (exec authorization missing, galat shell profile, command set).</li>
</ul>

<h3>Router aur ISE par tools</h3>
<pre class="code">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
R1# show aaa servers
R1# show tacacs
R1# show running-config | include tacacs|aaa
R1# ping 10.10.10.100 source GigabitEthernet0/0
R1# debug tacacs
R1# debug aaa authentication
R1# debug aaa authorization</pre>
<p>ISE par TACACS+ live log har request ko NAS address, user aur failure reason ke saath dikhata hai, jaise unknown network device ya shared-secret mismatch. Lab mein, ISE par <code>aaa-server show log</code> wahi jaankari deta hai.</p>

<h3>Walkthrough: Lab 2, "Admins TACACS+ se login nahi kar pa rahe"</h3>
<p><b>Step 1: reproduce karo.</b></p>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
Attempting authentication test to server-group tacacs+ using tacacs+
<span class="hl">No authoritative response from any server.</span></pre>
<p>ERROR, isliye fault seedhi 1 se 3 par hai. 10.10.10.100 ka ping chalta hai, isliye IP level par seedhi 1 theek hai.</p>
<p><b>Step 2: server se poocho.</b></p>
<pre class="out">ISE&gt; aaa-server show log
Recent events:
<span class="hl">  TACACS+ request from 10.99.99.99 ignored: unknown network device</span></pre>
<p>ISE 10.99.99.99 se requests dekhta hai, ek address jiske baare mein usne kabhi nahi suna. Router config wajah batata hai:</p>
<pre class="out">R1# show running-config | include tacacs
tacacs server ISE
<span class="hl">ip tacacs source-interface Loopback0</span></pre>
<p>Loopback0 10.99.99.99 hai, par ISE mein R1 10.10.10.1 ke roop mein defined hai. Task question ka jawab <b>unknown</b> hai. Ise known address se source karke fix karo, ya (real life mein) loopback ko ISE mein NAS IP ke roop mein jodkar; lab pehla wala expect karta hai:</p>
<pre class="code">R1(config)# no ip tacacs source-interface</pre>
<p><b>Step 3: dobara test karo.</b> Abhi bhi "No authoritative response", par server log badal jaata hai:</p>
<pre class="out">ISE&gt; aaa-server show log
<span class="hl">  TACACS+ request from 10.10.10.1 ignored: shared key mismatch</span>

R1# debug tacacs
TPLUS(0000002D)/0/READ: socket closed by server 10.10.10.100 (bad key or unknown NAS?)</pre>
<p>Ab ISE device ko jaanta hai, par key galat hai. Running config <code>key WRONG-KEY</code> dikhata hai.</p>
<pre class="code">R1(config)# tacacs server ISE
R1(config-server-tacacs)# key NK-t4c-26</pre>
<p><b>Step 4: confirm karo.</b></p>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
Attempting authentication test to server-group tacacs+ using tacacs+
<span class="hl">User was successfully authenticated.</span></pre>
<p>Dekho humne kya nahi kiya: humne TACACS+ nahi hataya, method list ko local first nahi kiya, ya authorization disable nahi kiya. Design waisa hi raha; sirf do faults fix hue.</p>

<h3>Doosre management-plane tickets</h3>
<table class="cmp">
<tr><th>Symptom</th><th>Sambhav cause</th><th>Check</th></tr>
<tr><td>snmpget: Authentication failure</td><td>galat auth password ya algorithm</td><td><code>show snmp user</code></td></tr>
<tr><td>snmpget: Unknown user name</td><td>user missing, ya engine ID badla</td><td><code>show snmp user</code>, <code>show snmp engineID</code></td></tr>
<tr><td>snmpget: Timeout</td><td>group par ACL, routing, UDP 161 blocked</td><td><code>show snmp group</code>, ACL counters</td></tr>
<tr><td>Clock is unsynchronized</td><td>trusted-key missing, key mismatch, UDP 123 blocked</td><td><code>show ntp associations detail</code></td></tr>
<tr><td>Collector par koi messages nahi</td><td>trap level bahut kam, galat host, collector firewall</td><td><code>show logging</code> (host ko logged lines)</td></tr>
<tr><td>SSH turant refuse</td><td>access-class, quiet mode, RSA key nahi</td><td><code>show login</code>, <code>show ip ssh</code></td></tr>
<tr><td>Login ho gaya par level 1</td><td><code>aaa authorization exec</code> nahi</td><td><code>show privilege</code></td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek NOC ticket kehta hai "maintenance ke baad CORE ki SNMP polling ruk gayi". NMS se <code>snmpget</code> "Unknown user name" lautata hai. CORE par <code>show snmp user</code> khaali hai. Change log dikhata hai ki engineer ne duplicate ID fix karne ke liye naya <code>snmp-server engineID local</code> set kiya. Isne localised keys invalid kar di, isliye user gayab ho gaya. <code>snmp-server user nocmon GRP v3 auth sha NocAuth!26 priv aes 128 PrivMon!26</code> dobara daalne se polling wapas aati hai.</p></div>

<div class="warn"><p><b>Common galti.</b> AAA outage ko method list <code>local group tacacs+</code> karke ya <code>aaa new-model</code> hatakar "fix" karna. Logins phir chalne lagte hain, par personal accounts, command authorization aur accounting chale jaate hain, aur koi revert karna yaad nahi rakhta. Iski jagah reachability, source address ya key fix karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jab sirf local backup account chalta hai, to server ERROR lauta raha hai (unreachable, unknown NAS, key mismatch). Jab local users samet koi login nahi kar pata, to FAIL-then-stop situation, ya bina local method wali method list par shak karo.</p></div>

<div class="scn"><h4>Loopback jo khisak gaya</h4><p>Routing redesign ke baad network team ne consistency ke liye har router ka <code>ip tacacs source-interface</code> Loopback0 kar diya. Raaton-raat saare personal logins fail hue aur admins ne break-glass account use kiya. ISE live logs ne unknown devices se sainkdon requests dikhayi. Loopback addresses kabhi ISE mein jode hi nahi gaye the. Fix tha loopbacks ko NAS IPs ke roop mein bulk import karna, aur phir outage ke dauraan bade paimane par use hue break-glass password ko rotate karna.</p><p><b>Seekh:</b> source address aur NAS definition match hone chahiye; dono ko saath badlo, aur emergency credentials use karne ke baad rotate karo.</p></div>

<div class="iv"><p class="q">"Admins kehte hain router par sirf local account chalta hai. Aap kaise troubleshoot karoge?"</p><p>ERROR pattern pehchano: TACACS+ validly jawab nahi de raha. <code>test aaa</code> chalao, <code>show aaa servers</code> check karo (DEAD, timeouts), configured source interface se server ping karo, ISE live logs mein "unknown device" ya "shared secret mismatch" dekho, aur dono taraf source interface aur key compare karo. Design kamzor kiye bina fix karo, test karo, aur break-glass password rotate karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seedhi chadho: reachability, NAS identity, shared key, user aur policy, authorization aur accounting.</li>
<li>"No authoritative response" = ERROR (path, source, key); "rejected" = FAIL (user ya policy).</li>
<li><code>test aaa</code>, <code>show aaa servers</code>, <code>show tacacs</code>, debugs aur ISE live log saath use karo.</li>
<li>Lab 2 mein do faults hain: source-interface Loopback0 (unknown device) aur galat key (key mismatch).</li>
<li>Root cause fix karo; method lists kamzor karke ya AAA hatakar kabhi "fix" mat karo.</li>
</ul></div>
`}};export{e as default};