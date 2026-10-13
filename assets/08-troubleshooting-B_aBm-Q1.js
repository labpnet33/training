var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from "it is blocked" to a proven fix`,hi:`Troubleshooting workflow: "block ho raha hai" se proven fix tak`},body:{en:`
<p>A doctor does not guess. She asks questions in a fixed order, measures, and only then treats. Firewall troubleshooting works the same way. This chapter gives you a six-step workflow and walks it through the two labs of this module: <b>Lab 1, LAN to internet with objects</b> and <b>Lab 2, a deny policy shadows everything</b>.</p>

<h3>The six steps</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Six-step workflow">
<rect x="8" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="56" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Define</text><text x="56" y="84" text-anchor="middle" class="svg-muted" font-size="11">the flow</text>
<rect x="112" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="160" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Route</text><text x="160" y="84" text-anchor="middle" class="svg-muted" font-size="11">egress ok?</text>
<rect x="216" y="40" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="264" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Lookup</text><text x="264" y="84" text-anchor="middle" class="svg-muted" font-size="11">policy id</text>
<rect x="320" y="40" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="368" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Evidence</text><text x="368" y="84" text-anchor="middle" class="svg-muted" font-size="11">hits, logs</text>
<rect x="424" y="40" width="96" height="60" rx="8" fill="#fde68a"/><text x="472" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Fix</text><text x="472" y="84" text-anchor="middle" class="svg-muted" font-size="11">smallest change</text>
<rect x="528" y="40" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="576" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text><text x="576" y="84" text-anchor="middle" class="svg-muted" font-size="11">lookup + test</text>
</svg><p class="cap">Do not skip to step 5. Steps 1 to 4 tell you what to fix.</p></div>
<ol>
<li><b>Define the flow.</b> Source IP and port, destination IP and port, protocol, and the interface where the first packet enters. Without this, nothing else works.</li>
<li><b>Check the route.</b> The egress interface must be what you expect (<code>get router info routing-table all</code> or the lookup). A wrong route changes which policy can match.</li>
<li><b>Run the lookup.</b> Which policy ID, or 0?</li>
<li><b>Collect evidence.</b> Hit counters, traffic logs and the session table. They show whether the traffic really arrives and which policy it hits.</li>
<li><b>Make the smallest fix.</b> Edit an object, set the action, move a policy. Do not widen to "all" to make the problem go away.</li>
<li><b>Verify.</b> Repeat the lookup, then test with real traffic, then read the counters or logs.</li>
</ol>

<h3>Lab 1: nothing leaves the LAN</h3>
<p>Step 1: PC1 10.0.1.10 to 8.8.8.8, ICMP, entering port2. Step 2: the default route exists. Step 3: the lookup.</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 10.0.1.10 1 8.8.8.8 0 icmp port2
&lt;src [10.0.1.10-1] dst [8.8.8.8-0] proto icmp dev port2&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Policy 0 means there is no policy. The fix is a small chain of objects and one policy. After it, repeat the lookup for web and for SSH:</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 80 tcp port2
&lt;src [10.0.1.10-50000] dst [8.8.8.8-80] proto tcp dev port2&gt; <span class="hl">matches policy id: 1</span>
FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 22 tcp port2
&lt;src [10.0.1.10-50000] dst [8.8.8.8-22] proto tcp dev port2&gt; <span class="hl">matches policy id: 0</span>
PC1&gt; curl 8.8.8.8:22
curl: (28) Failed to connect to 8.8.8.8 port 22 after 2001 ms: Timeout was reached</pre>
<p>The web path is open and SSH stays closed, which is exactly what management asked for. The finishing proof is the log: an <code>accept</code> entry for the web session and, with <code>fwpolicy-implicit-log enable</code>, a <code>deny</code> entry with <code>policyid=0</code> for SSH.</p>

<h3>Lab 2: the deny that shadows everything</h3>
<p>The complaint: no one in Pune reaches the internet since the HR change. Step 1: PC1 to 8.8.8.8, ICMP. The ping shows only timeouts. Step 3 and 4 together: look at the hit counters of both policies.</p>
<pre class="out">PC1&gt; ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
...
FGT1 # diagnose firewall iprope show 100004 1
idx=1 pkts/bytes=0/0 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:10</span> first:2026-10-02 03:40:04 last:2026-10-02 03:40:04
established session count:0
FGT1 # diagnose firewall iprope show 100004 2
idx=2 pkts/bytes=0/0 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:0</span></pre>
<p>Policy 1 (BLOCK-SOCIAL) decides everything. It has action deny (default), source "all" and destination "all". Step 5, the smallest fix: create SOCIAL_SITE for 198.51.100.10/32 and set <code>dstaddr SOCIAL_SITE</code> on policy 1. Then add MKT-SOCIAL (HTTPS for 10.0.1.20) and move it before policy 1. Step 6, verify with three views:</p>
<pre class="out">PC2&gt; curl 198.51.100.10:443
&lt;html&gt;&lt;body&gt;&lt;h1&gt;SOCIAL&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
PC2&gt; ping 198.51.100.10
198.51.100.10 icmp_seq=1 timeout
PC1&gt; curl 198.51.100.10:443
curl: (28) Failed to connect to 198.51.100.10 port 443 after 2001 ms: Timeout was reached
FGT1 # diagnose firewall iprope show 100004 3
idx=3 pkts/bytes=5/600 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:1</span> first:2026-10-02 03:40:04 last:2026-10-02 03:40:04
established session count:1</pre>
<p>PC2 gets the page over HTTPS, PC2 cannot ping the site (only HTTPS was allowed), and PC1 is still blocked. Policy 3 now has a hit. Everyone else still reaches 8.8.8.8 through policy 2.</p>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Lookup says 0</td><td>no policy, wrong interface, service not listed</td><td>service group, srcintf, dstintf</td></tr>
<tr><td>New policy blocks</td><td>missing <code>action accept</code></td><td><code>get firewall policy &lt;id&gt;</code></td></tr>
<tr><td>Policy has zero hits</td><td>shadowed above, wrong ingress, disabled</td><td>list order, status</td></tr>
<tr><td>Lookup OK, app fails</td><td>NAT, DNS, server or return path</td><td>session table, NAT module</td></tr>
<tr><td>Works for new users only</td><td>old session kept after change</td><td>session list, clear session</td></tr></table>

<div class="warn"><p><b>Common beginner mistakes.</b> Fixing by editing five things at once; changing a policy to "all" to test; reading the GUI log without the filter, so the line you want is lost; forgetting to repeat the lookup after the fix.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a policy has zero hits, the answer is rarely "the policy is wrong". It is usually that something earlier matches first, or the traffic never enters the interface named in <code>srcintf</code>.</p></div>

<div class="scn"><h4>Friday 6 pm: "internet is down"</h4><p>Every user in a branch lost the internet right after a security change. The engineer did not edit anything first. She ran the lookup for a LAN host, saw policy 1 (a deny), compared the two counters and found the new block rule at the top with source and destination left on "all". Narrowing one field and adding one exception took four minutes. The change record then included the lookup outputs as proof.</p><p><b>Lesson:</b> evidence first, edit second, proof at the end.</p></div>

<div class="iv"><p class="q">"Users cannot reach a site after a policy change. Walk me through your troubleshooting."</p><p>Define the exact flow and ingress interface, confirm routing, run the policy lookup, then check hit counters, logs and the session table. Identify the policy that decided and why (order, objects, action). Apply the smallest fix, repeat the lookup, test with real traffic and record the evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Six steps: define, route, lookup, evidence, smallest fix, verify.</li>
<li>Policy 0 in a lookup means no policy matched.</li>
<li>Hit counters of two policies side by side reveal shadowing.</li>
<li>Verify with the lookup, a real test and the counters or logs.</li>
<li>Never widen a policy to "all" just to make the symptom disappear.</li>
</ul></div>
`,hi:`
<p>Doctor andaza nahi lagata. Woh sawal ek fixed order mein poochta hai, naapta hai, aur tab hi ilaaj karta hai. Firewall troubleshooting bhi aise hi chalti hai. Yeh chapter chhe-step workflow deta hai aur use is module ke do labs par chalata hai: <b>Lab 1, objects ke saath LAN se internet</b> aur <b>Lab 2, deny policy sab kuch shadow karti hai</b>.</p>

<h3>Chhe steps</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Six-step workflow">
<rect x="8" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="56" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Define</text><text x="56" y="84" text-anchor="middle" class="svg-muted" font-size="11">flow tay karo</text>
<rect x="112" y="40" width="96" height="60" rx="8" fill="#bae6fd"/><text x="160" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Route</text><text x="160" y="84" text-anchor="middle" class="svg-muted" font-size="11">egress sahi?</text>
<rect x="216" y="40" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="264" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Lookup</text><text x="264" y="84" text-anchor="middle" class="svg-muted" font-size="11">policy id</text>
<rect x="320" y="40" width="96" height="60" rx="8" fill="#ddd6fe"/><text x="368" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Evidence</text><text x="368" y="84" text-anchor="middle" class="svg-muted" font-size="11">hits, logs</text>
<rect x="424" y="40" width="96" height="60" rx="8" fill="#fde68a"/><text x="472" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Fix</text><text x="472" y="84" text-anchor="middle" class="svg-muted" font-size="11">sabse chhota change</text>
<rect x="528" y="40" width="96" height="60" rx="8" fill="#bbf7d0"/><text x="576" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Verify</text><text x="576" y="84" text-anchor="middle" class="svg-muted" font-size="11">lookup + test</text>
</svg><p class="cap">Seedha step 5 par mat kudo. Steps 1 se 4 batate hain kya fix karna hai.</p></div>
<ol>
<li><b>Flow define karo.</b> Source IP aur port, destination IP aur port, protocol, aur woh interface jahan pehla packet enter karta hai. Iske bina aage kuch kaam nahi karta.</li>
<li><b>Route check karo.</b> Egress interface wahi hona chahiye jo aap expect karte ho (<code>get router info routing-table all</code> ya lookup). Galat route badal deta hai ki kaunsi policy match kar sakti hai.</li>
<li><b>Lookup chalao.</b> Kaunsi policy ID, ya 0?</li>
<li><b>Evidence jama karo.</b> Hit counters, traffic logs aur session table. Yeh dikhate hain ki traffic sach mein aa raha hai ya nahi aur kaunsi policy hit karta hai.</li>
<li><b>Sabse chhota fix karo.</b> Object edit karo, action set karo, policy move karo. Problem hatane ke liye "all" tak widen mat karo.</li>
<li><b>Verify karo.</b> Lookup dobara chalao, phir real traffic se test, phir counters ya logs padho.</li>
</ol>

<h3>Lab 1: LAN se kuch nahi nikalta</h3>
<p>Step 1: PC1 10.0.1.10 se 8.8.8.8, ICMP, port2 par enter. Step 2: default route maujood hai. Step 3: lookup.</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 10.0.1.10 1 8.8.8.8 0 icmp port2
&lt;src [10.0.1.10-1] dst [8.8.8.8-0] proto icmp dev port2&gt; <span class="hl">matches policy id: 0</span></pre>
<p>Policy 0 ka matlab koi policy nahi hai. Fix objects ki chhoti chain aur ek policy hai. Uske baad web aur SSH ke liye lookup dobara chalao:</p>
<pre class="out">FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 80 tcp port2
&lt;src [10.0.1.10-50000] dst [8.8.8.8-80] proto tcp dev port2&gt; <span class="hl">matches policy id: 1</span>
FGT1 # diagnose firewall iprope lookup 10.0.1.10 50000 8.8.8.8 22 tcp port2
&lt;src [10.0.1.10-50000] dst [8.8.8.8-22] proto tcp dev port2&gt; <span class="hl">matches policy id: 0</span>
PC1&gt; curl 8.8.8.8:22
curl: (28) Failed to connect to 8.8.8.8 port 22 after 2001 ms: Timeout was reached</pre>
<p>Web path khula hai aur SSH band hai, bilkul jo management ne maanga. Aakhri saboot log hai: web session ke liye <code>accept</code> entry aur, <code>fwpolicy-implicit-log enable</code> ke saath, SSH ke liye <code>policyid=0</code> wali <code>deny</code> entry.</p>

<h3>Lab 2: woh deny jo sab kuch shadow karta hai</h3>
<p>Shikayat: HR ke change ke baad Pune mein koi internet reach nahi kar pa raha. Step 1: PC1 se 8.8.8.8, ICMP. Ping sirf timeouts dikhati hai. Step 3 aur 4 saath: dono policies ke hit counters dekho.</p>
<pre class="out">PC1&gt; ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
...
FGT1 # diagnose firewall iprope show 100004 1
idx=1 pkts/bytes=0/0 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:10</span> first:2026-10-02 03:40:04 last:2026-10-02 03:40:04
established session count:0
FGT1 # diagnose firewall iprope show 100004 2
idx=2 pkts/bytes=0/0 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:0</span></pre>
<p>Policy 1 (BLOCK-SOCIAL) sab kuch decide karti hai. Uska action deny (default), source "all" aur destination "all" hai. Step 5, sabse chhota fix: 198.51.100.10/32 ke liye SOCIAL_SITE banao aur policy 1 par <code>dstaddr SOCIAL_SITE</code> set karo. Phir MKT-SOCIAL (10.0.1.20 ke liye HTTPS) add karo aur use policy 1 se pehle move karo. Step 6, teen views se verify karo:</p>
<pre class="out">PC2&gt; curl 198.51.100.10:443
&lt;html&gt;&lt;body&gt;&lt;h1&gt;SOCIAL&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
PC2&gt; ping 198.51.100.10
198.51.100.10 icmp_seq=1 timeout
PC1&gt; curl 198.51.100.10:443
curl: (28) Failed to connect to 198.51.100.10 port 443 after 2001 ms: Timeout was reached
FGT1 # diagnose firewall iprope show 100004 3
idx=3 pkts/bytes=5/600 asic_pkts/asic_bytes=0/0 nturbo_pkts/nturbo_bytes=0/0 flag=0x0 <span class="hl">hit count:1</span> first:2026-10-02 03:40:04 last:2026-10-02 03:40:04
established session count:1</pre>
<p>PC2 ko HTTPS par page milta hai, PC2 site ko ping nahi kar sakta (sirf HTTPS allow tha), aur PC1 ab bhi blocked hai. Policy 3 ka ab ek hit hai. Baaki sab policy 2 se 8.8.8.8 tak pahunchte hain.</p>

<h3>Symptom se cause ki table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Lookup 0 kehta hai</td><td>policy nahi, galat interface, service listed nahi</td><td>service group, srcintf, dstintf</td></tr>
<tr><td>Nayi policy block karti hai</td><td><code>action accept</code> missing</td><td><code>get firewall policy &lt;id&gt;</code></td></tr>
<tr><td>Policy ke zero hits</td><td>upar shadowed, galat ingress, disabled</td><td>list order, status</td></tr>
<tr><td>Lookup OK, app fail</td><td>NAT, DNS, server ya return path</td><td>session table, NAT module</td></tr>
<tr><td>Sirf naye users ke liye chalta hai</td><td>change ke baad purana session bacha</td><td>session list, clear session</td></tr></table>

<div class="warn"><p><b>Common beginner mistakes.</b> Ek saath paanch cheezein edit karke fix karna; test ke liye policy ko "all" bana dena; filter ke bina GUI log padhna, jisse chahiye wali line kho jaati hai; fix ke baad lookup dobara chalana bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy ke zero hits hon to jawab shayad hi "policy galat hai" hota hai. Aksar kuch pehle wala match kar leta hai, ya traffic <code>srcintf</code> mein likhe interface par aata hi nahi.</p></div>

<div class="scn"><h4>Friday 6 baje: "internet down hai"</h4><p>Security change ke turant baad ek branch ke har user ka internet chala gaya. Engineer ne pehle kuch edit nahi kiya. Usne LAN host ke liye lookup chalaya, policy 1 (deny) dekhi, dono counters compare kiye aur sabse upar nayi block rule pai jisme source aur destination "all" chhoote the. Ek field narrow karna aur ek exception add karna chaar minute mein ho gaya. Change record mein lookup outputs saboot ke roop mein jude.</p><p><b>Lesson:</b> pehle evidence, phir edit, aakhir mein proof.</p></div>

<div class="iv"><p class="q">"Policy change ke baad users ek site reach nahi kar paa rahe. Apna troubleshooting batao."</p><p>Exact flow aur ingress interface define karo, routing confirm karo, policy lookup chalao, phir hit counters, logs aur session table dekho. Pata karo ki kaunsi policy ne decide kiya aur kyun (order, objects, action). Sabse chhota fix lagao, lookup dobara chalao, real traffic se test karo aur evidence record karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe steps: define, route, lookup, evidence, sabse chhota fix, verify.</li>
<li>Lookup mein policy 0 ka matlab koi policy match nahi hui.</li>
<li>Do policies ke hit counters saath dekhne se shadowing dikhti hai.</li>
<li>Lookup, real test aur counters ya logs se verify karo.</li>
<li>Symptom hatane ke liye policy ko kabhi "all" tak widen mat karo.</li>
</ul></div>
`}};export{e as default};