var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow: when a security control blocks the wrong thing`,hi:`Troubleshooting workflow: jab security control galat cheez block kare`},body:{en:`
<p>A good security guard who stops the managing director at the gate is not "broken"; he was given the wrong list. Most security tickets are like that: a control is working exactly as configured, but the configuration does not match the intention. Your job is to find which control is acting, prove it with output, and fix the smallest thing. This chapter gives you a repeatable workflow and walks through the faults you will meet in both labs.</p>

<h3>The workflow</h3>
<ol>
<li><b>Define the symptom precisely.</b> Who is affected, from which address, to which destination, which protocol, since when, and what changed? "Admin cannot SSH to EDGE from 10.0.99.10 since last night's change" is a ticket you can solve.</li>
<li><b>Read the evidence first.</b> The device usually tells you: <code>show logging</code> for port-security and ACL log messages, error text on the client ("refused", "authentication failed", "timed out").</li>
<li><b>Walk the path bottom-up.</b> Port state (err-disabled?), port security, VLAN, IP reachability (ping), ACLs on the path (counters and direction), then the service itself (SSH keys, VTY settings, AAA).</li>
<li><b>Change one thing, verify, document.</b> Re-test both what should work and what should still be blocked.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Security troubleshooting workflow">
<rect x="10" y="60" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="12">Define symptom</text>
<rect x="140" y="60" width="110" height="50" rx="10" fill="#ddd6fe"/><text x="195" y="90" text-anchor="middle" class="svg-ink" font-size="12">Read logs</text>
<rect x="270" y="60" width="110" height="50" rx="10" fill="#e2e8f0"/><text x="325" y="82" text-anchor="middle" class="svg-ink" font-size="12">Port, VLAN,</text><text x="325" y="98" text-anchor="middle" class="svg-ink" font-size="12">IP, ACL</text>
<rect x="400" y="60" width="110" height="50" rx="10" fill="#fde68a"/><text x="455" y="90" text-anchor="middle" class="svg-ink" font-size="12">Service, AAA</text>
<rect x="530" y="60" width="100" height="50" rx="10" fill="#bbf7d0"/><text x="580" y="82" text-anchor="middle" class="svg-ink" font-size="12">Fix, test</text><text x="580" y="98" text-anchor="middle" class="svg-ink" font-size="12">both ways</text>
<line x1="120" y1="85" x2="140" y2="85" stroke="#64748b" stroke-width="2"/><line x1="250" y1="85" x2="270" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="400" y2="85" stroke="#64748b" stroke-width="2"/><line x1="510" y1="85" x2="530" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Always re-test the allowed path and the blocked path</text>
</svg><p class="cap">Evidence first, bottom-up second, one change at a time.</p></div>

<h3>Symptom to cause: quick map</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>SSH refused, Telnet still works</td><td>No RSA key (hostname or domain missing) or <code>transport input telnet</code></td><td><code>show ip ssh</code>, <code>show run | section line vty</code></td></tr>
<tr><td>SSH refused from the admin PC too</td><td>VTY ACL wrong (bad wildcard, wrong subnet) or admin on another subnet</td><td><code>show access-lists</code>, admin PC's IP</td></tr>
<tr><td>Password prompt, then "Authentication failed"</td><td>No local user, wrong secret, or <code>login</code> instead of <code>login local</code></td><td><code>show run | include username</code></td></tr>
<tr><td>Users can still Telnet after the fix</td><td>Only lines 0 4 were changed; lines 5 15 still accept Telnet</td><td><code>show run | section line vty</code></td></tr>
<tr><td>A port stops passing traffic, link light off</td><td>Port security violation, err-disabled</td><td><code>show interfaces status err-disabled</code></td></tr>
<tr><td>Clients get 169.254.x.x after an ACL change</td><td>Inbound ACL blocks DHCP (<code>bootps</code>)</td><td>ACL log, counters on the final deny</td></tr>
<tr><td>ACL shows zero matches</td><td>Wrong interface or direction, or a broader line above it</td><td><code>show ip interface</code>, line order</td></tr>
</table>

<div class="eg"><p><b>Worked ticket 1 (Lab 1): the admin is refused too.</b> After the change, PC-ADMIN (10.0.99.10) gets "% Connection refused by remote host". SSH is enabled and the VTY lines look right, so check the ACL:</p>
<pre class="out">EDGE# show access-lists 10
Standard IP access list 10
<span class="hl">    10 permit 0.0.0.0, wildcard bits 255.255.255.0</span></pre>
<p>Someone typed a subnet mask (<code>access-list 10 permit 10.0.99.0 255.255.255.0</code>). The router zeroed every "ignore" bit, so the entry now means "any address whose last octet is 0", and 10.0.99.10 falls into the implicit deny. Fix it through the console or from a still-open session:</p>
<pre class="code">EDGE(config)# no access-list 10
EDGE(config)# access-list 10 permit 10.0.99.0 0.0.0.255</pre>
<p>Re-test: PC-ADMIN succeeds, PC-USER is still refused. Both directions verified.</p></div>

<div class="eg"><p><b>Worked ticket 2 (Lab 2): recovery did not work.</b> The engineer bounced Gi0/1, but it went err-disabled again within a second.</p>
<pre class="out">SW1# show port-security interface GigabitEthernet0/1
<span class="hl">Port Status                : Secure-shutdown</span>
<span class="hl">Last Source Address:Vlan   : 0bad.beef.0001:1</span>
<span class="hl">Security Violation Count   : 2</span></pre>
<p>The last source is still the rogue MAC and the count went from 1 to 2: the cause was never removed. Restore PC1's real MAC (<code>set mac 0050.7966.0a01</code>), then <code>shutdown</code> / <code>no shutdown</code>, then ping 192.168.10.1 from PC1.</p></div>

<h3>Command toolkit</h3>
<pre class="code">show logging                              <span class="c">! psecure and ACL log messages</span>
show ip ssh                               <span class="c">! SSH enabled? version?</span>
show running-config | section line vty    <span class="c">! login local, transport, access-class</span>
show users                                <span class="c">! who is connected, from where</span>
show access-lists                         <span class="c">! order and match counters</span>
show ip interface GigabitEthernet0/1      <span class="c">! which ACL, which direction</span>
show port-security interface Gi0/1        <span class="c">! status, last source, violations</span>
show port-security address                <span class="c">! learned secure MACs</span>
show interfaces status err-disabled       <span class="c">! which ports and why</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Editing the VTY ACL over the same SSH session you are protecting, with no console path. Removing a security control "to test" and forgetting to put it back. Clearing counters before recording them, which destroys the evidence. Fixing the symptom (bouncing a port) without the cause (the rogue device).</p></div>

<div class="exam"><p><b>Exam trap.</b> CompTIA's troubleshooting method: identify the problem, establish a theory, test the theory, establish a plan and implement it, verify full functionality and implement preventive measures, then document. When a question says a port "stopped working after a new device was connected", think port security and err-disabled before cabling.</p></div>

<div class="scn"><h4>The monitoring server that went blind</h4><p>After a hardening change, the NMS stopped collecting data from twenty switches, but SSH from the jump host worked. The engineer read the switch logs, saw no errors, and then checked the ACL counters on the management VLAN interface: the final deny had thousands of matches from the NMS address 10.0.99.30 on UDP 161. The new ACL permitted SSH from the admin subnet but nobody had listed SNMP polling. One permit line for the NMS, a re-test of SNMP and SSH, and a note in the hardening template closed the ticket.</p><p><b>Lesson:</b> a deny counter that rises is a message; read it before touching anything.</p></div>

<div class="iv"><p class="q">"A user says the network stopped working after they plugged in a new docking station. How do you troubleshoot?"</p><p>Define the symptom, then check the access port: <code>show interfaces status err-disabled</code> and <code>show port-security interface</code>. A dock often brings its own MAC, exceeding maximum 1 and triggering a violation. Confirm with the last source address, decide whether the new MAC is legitimate, clear the old sticky entry or raise the maximum, recover the port, test and document. Mention not simply disabling port security.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most security tickets are controls working as configured; find which one is acting.</li>
<li>Read logs and client error text first, then walk port, VLAN, IP, ACL, service.</li>
<li>A subnet mask typed as a wildcard silently breaks an ACL; check <code>show access-lists</code>.</li>
<li>Recover err-disabled ports only after removing the cause.</li>
<li>Always re-test both the permitted path and the blocked path, then document.</li>
</ul></div>
`,hi:`
<p>Ek achha security guard jo managing director ko gate par rok de, "kharaab" nahi hai; use galat list di gayi thi. Zyada tar security tickets aise hi hote hain: control bilkul configured tareeke se kaam kar raha hai, lekin configuration iraade se match nahi karti. Aapka kaam hai pata lagana ki kaunsa control act kar raha hai, output se prove karna, aur sabse chhoti cheez theek karna. Yeh chapter aapko ek repeatable workflow deta hai aur dono labs mein milne wale faults step by step dikhata hai.</p>

<h3>Workflow</h3>
<ol>
<li><b>Symptom ko exactly define karo.</b> Kaun affected hai, kis address se, kis destination tak, kaunsa protocol, kab se, aur kya badla? "Kal raat ke change ke baad se admin 10.0.99.10 se EDGE par SSH nahi kar pa raha" aisa ticket hai jo aap solve kar sakte ho.</li>
<li><b>Pehle saboot padho.</b> Device aam taur par bata deta hai: port-security aur ACL log messages ke liye <code>show logging</code>, client par error text ("refused", "authentication failed", "timed out").</li>
<li><b>Path ko bottom-up chalo.</b> Port state (err-disabled?), port security, VLAN, IP reachability (ping), path par ACLs (counters aur direction), phir khud service (SSH keys, VTY settings, AAA).</li>
<li><b>Ek cheez badlo, verify karo, document karo.</b> Jo kaam karna chahiye aur jo ab bhi blocked rehna chahiye, dono re-test karo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Security troubleshooting workflow">
<rect x="10" y="60" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="12">Symptom define</text>
<rect x="140" y="60" width="110" height="50" rx="10" fill="#ddd6fe"/><text x="195" y="90" text-anchor="middle" class="svg-ink" font-size="12">Logs padho</text>
<rect x="270" y="60" width="110" height="50" rx="10" fill="#e2e8f0"/><text x="325" y="82" text-anchor="middle" class="svg-ink" font-size="12">Port, VLAN,</text><text x="325" y="98" text-anchor="middle" class="svg-ink" font-size="12">IP, ACL</text>
<rect x="400" y="60" width="110" height="50" rx="10" fill="#fde68a"/><text x="455" y="90" text-anchor="middle" class="svg-ink" font-size="12">Service, AAA</text>
<rect x="530" y="60" width="100" height="50" rx="10" fill="#bbf7d0"/><text x="580" y="82" text-anchor="middle" class="svg-ink" font-size="12">Fix, test</text><text x="580" y="98" text-anchor="middle" class="svg-ink" font-size="12">dono taraf</text>
<line x1="120" y1="85" x2="140" y2="85" stroke="#64748b" stroke-width="2"/><line x1="250" y1="85" x2="270" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="400" y2="85" stroke="#64748b" stroke-width="2"/><line x1="510" y1="85" x2="530" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Hamesha allowed path aur blocked path dono re-test karo</text>
</svg><p class="cap">Pehle saboot, phir bottom-up, ek baar mein ek change.</p></div>

<h3>Symptom se cause: quick map</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit cause</th><th>Check</th></tr>
<tr><td>SSH refused, Telnet ab bhi chalta hai</td><td>RSA key nahi (hostname ya domain missing) ya <code>transport input telnet</code></td><td><code>show ip ssh</code>, <code>show run | section line vty</code></td></tr>
<tr><td>Admin PC se bhi SSH refused</td><td>VTY ACL galat (bad wildcard, galat subnet) ya admin dusre subnet par</td><td><code>show access-lists</code>, admin PC ka IP</td></tr>
<tr><td>Password prompt, phir "Authentication failed"</td><td>Local user nahi, galat secret, ya <code>login local</code> ki jagah <code>login</code></td><td><code>show run | include username</code></td></tr>
<tr><td>Fix ke baad bhi users Telnet kar sakte hain</td><td>Sirf lines 0 4 badli gayi; lines 5 15 ab bhi Telnet accept karti hain</td><td><code>show run | section line vty</code></td></tr>
<tr><td>Port traffic pass karna band, link light off</td><td>Port security violation, err-disabled</td><td><code>show interfaces status err-disabled</code></td></tr>
<tr><td>ACL change ke baad clients ko 169.254.x.x milta hai</td><td>Inbound ACL DHCP (<code>bootps</code>) block karti hai</td><td>ACL log, final deny par counters</td></tr>
<tr><td>ACL zero matches dikhati hai</td><td>Galat interface ya direction, ya upar koi broader line</td><td><code>show ip interface</code>, line order</td></tr>
</table>

<div class="eg"><p><b>Worked ticket 1 (Lab 1): admin bhi refuse ho raha hai.</b> Change ke baad PC-ADMIN (10.0.99.10) ko "% Connection refused by remote host" milta hai. SSH enabled hai aur VTY lines sahi dikhti hain, to ACL check karo:</p>
<pre class="out">EDGE# show access-lists 10
Standard IP access list 10
<span class="hl">    10 permit 0.0.0.0, wildcard bits 255.255.255.0</span></pre>
<p>Kisi ne subnet mask type kiya (<code>access-list 10 permit 10.0.99.0 255.255.255.0</code>). Router ne har "ignore" bit ko zero kar diya, isliye entry ka matlab ab "koi bhi address jiska aakhri octet 0 ho" hai, aur 10.0.99.10 implicit deny mein gir jaata hai. Console se ya abhi khule session se theek karo:</p>
<pre class="code">EDGE(config)# no access-list 10
EDGE(config)# access-list 10 permit 10.0.99.0 0.0.0.255</pre>
<p>Re-test: PC-ADMIN succeed karta hai, PC-USER ab bhi refuse hota hai. Dono directions verified.</p></div>

<div class="eg"><p><b>Worked ticket 2 (Lab 2): recovery kaam nahi kiya.</b> Engineer ne Gi0/1 bounce kiya, lekin woh ek second mein phir err-disabled ho gaya.</p>
<pre class="out">SW1# show port-security interface GigabitEthernet0/1
<span class="hl">Port Status                : Secure-shutdown</span>
<span class="hl">Last Source Address:Vlan   : 0bad.beef.0001:1</span>
<span class="hl">Security Violation Count   : 2</span></pre>
<p>Last source ab bhi rogue MAC hai aur count 1 se 2 ho gaya: wajah kabhi hatayi hi nahi gayi. PC1 ka asli MAC wapas lao (<code>set mac 0050.7966.0a01</code>), phir <code>shutdown</code> / <code>no shutdown</code>, phir PC1 se 192.168.10.1 ping karo.</p></div>

<h3>Command toolkit</h3>
<pre class="code">show logging                              <span class="c">! psecure and ACL log messages</span>
show ip ssh                               <span class="c">! SSH enabled? version?</span>
show running-config | section line vty    <span class="c">! login local, transport, access-class</span>
show users                                <span class="c">! who is connected, from where</span>
show access-lists                         <span class="c">! order and match counters</span>
show ip interface GigabitEthernet0/1      <span class="c">! which ACL, which direction</span>
show port-security interface Gi0/1        <span class="c">! status, last source, violations</span>
show port-security address                <span class="c">! learned secure MACs</span>
show interfaces status err-disabled       <span class="c">! which ports and why</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> Jis SSH session ko protect kar rahe ho usi par VTY ACL edit karna, bina console path ke. "Test karne ke liye" security control hatana aur wapas lagana bhool jaana. Counters record karne se pehle clear kar dena, jisse saboot khatam ho jaata hai. Wajah (rogue device) ki jagah sirf symptom (port bounce) theek karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> CompTIA ka troubleshooting method: problem identify karo, theory banao, theory test karo, plan banao aur implement karo, full functionality verify karo aur preventive measures lagao, phir document karo. Jab question kahe ki port "naya device connect hone ke baad kaam karna band ho gaya", to cabling se pehle port security aur err-disabled socho.</p></div>

<div class="scn"><h4>Monitoring server jo andha ho gaya</h4><p>Ek hardening change ke baad NMS ne bees switches se data collect karna band kar diya, lekin jump host se SSH chal raha tha. Engineer ne switch logs padhe, koi error nahi dikha, phir management VLAN interface par ACL counters check kiye: final deny par NMS address 10.0.99.30 se UDP 161 ke hazaaron matches the. Nayi ACL admin subnet se SSH permit karti thi lekin kisi ne SNMP polling list nahi ki thi. NMS ke liye ek permit line, SNMP aur SSH ka re-test, aur hardening template mein ek note ne ticket close kar diya.</p><p><b>Seekh:</b> badhta hua deny counter ek message hai; kuch bhi chhoone se pehle use padho.</p></div>

<div class="iv"><p class="q">"User kehta hai naya docking station lagane ke baad network kaam karna band ho gaya. Aap kaise troubleshoot karoge?"</p><p>Symptom define karo, phir access port check karo: <code>show interfaces status err-disabled</code> aur <code>show port-security interface</code>. Dock aksar apna MAC laata hai, jo maximum 1 se zyada ho kar violation trigger karta hai. Last source address se confirm karo, tay karo ki naya MAC legitimate hai ya nahi, purani sticky entry clear karo ya maximum badhao, port recover karo, test karo aur document karo. Batao ki aap port security ko seedha disable nahi karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyada tar security tickets configured tareeke se kaam kar rahe controls hote hain; pata lagao kaunsa act kar raha hai.</li>
<li>Pehle logs aur client error text padho, phir port, VLAN, IP, ACL, service chalo.</li>
<li>Wildcard ki jagah type kiya subnet mask ACL ko chupchaap tod deta hai; <code>show access-lists</code> check karo.</li>
<li>Err-disabled ports ko wajah hatane ke baad hi recover karo.</li>
<li>Hamesha permitted path aur blocked path dono re-test karo, phir document karo.</li>
</ul></div>
`}};export{e as default};