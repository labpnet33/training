var e={id:`ha-troubleshooting`,h:{en:`Troubleshooting HA: one workflow, four labs`,hi:`HA troubleshooting: ek workflow, chaar labs`},body:{en:`
<p>A doctor does not start with surgery. She checks the pulse, then the temperature, then asks questions, always in the same order. Troubleshooting an FGCP cluster works the same way. If you always walk the same six steps, you find the fault in minutes, and you do not blame the wrong thing.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="HA troubleshooting workflow">
<rect x="10" y="40" width="92" height="60" rx="8" fill="#bae6fd"/><text x="56" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 Roles</text><text x="56" y="86" text-anchor="middle" class="svg-muted" font-size="11">who is primary</text>
<rect x="115" y="40" width="92" height="60" rx="8" fill="#bbf7d0"/><text x="161" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Peers</text><text x="161" y="86" text-anchor="middle" class="svg-muted" font-size="11">two members?</text>
<rect x="220" y="40" width="92" height="60" rx="8" fill="#ddd6fe"/><text x="266" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Heartbeat</text><text x="266" y="86" text-anchor="middle" class="svg-muted" font-size="11">hbdev up</text>
<rect x="325" y="40" width="92" height="60" rx="8" fill="#fde68a"/><text x="371" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Election</text><text x="371" y="86" text-anchor="middle" class="svg-muted" font-size="11">why this unit</text>
<rect x="430" y="40" width="92" height="60" rx="8" fill="#fed7aa"/><text x="476" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Sync</text><text x="476" y="86" text-anchor="middle" class="svg-muted" font-size="11">in-sync?</text>
<rect x="535" y="40" width="92" height="60" rx="8" fill="#e2e8f0"/><text x="581" y="66" text-anchor="middle" class="svg-ink" font-size="13">6 Sessions</text><text x="581" y="86" text-anchor="middle" class="svg-muted" font-size="11">pickup works</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Do not skip ahead: a wrong answer at step 2 explains everything after it.</text>
</svg><p class="cap">Six questions, always in this order.</p></div>
<ol>
<li><b>Roles.</b> <code>get system status</code> shows <code>Current HA mode: a-p, primary</code> or <code>secondary</code>. Run it on both units. Two primaries mean split brain.</li>
<li><b>Peers.</b> <code>get system ha status</code>: are both serials listed? A lone unit prints <code>HA Health Status: WARNING: only one member is present, the heartbeat finds no peer</code>.</li>
<li><b>Heartbeat.</b> In the same output the <code>HBDEV stats</code> block shows port3 and port4 up or down. Check cables, hbdev names and the group settings (mode, group-id, group-name, password).</li>
<li><b>Election reason.</b> <code>diagnose sys ha history read</code> prints the reason in words. Remember the order: fewer failures, then age (difference above 300 s), then priority, then the higher serial. Override puts priority before age.</li>
<li><b>Sync.</b> <code>Configuration Status</code> says in-sync or out-of-sync. <code>diagnose sys ha checksum cluster</code> compares the units; <code>checksum show</code> names the table.</li>
<li><b>Sessions.</b> <code>diagnose sys session list</code> on the secondary: is there a <code>synced</code> flag? Is pickup (and connectionless) enabled?</li>
</ol>

<h3>The common faults and their fingerprints</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Both units primary, WARNING line</td><td>Password, group-id or group-name mismatch; hbdev on the wrong port; heartbeat cable missing</td></tr>
<tr><td>No failover although the WAN is dead</td><td>Port stays up behind the switch; port not in <code>monitor</code>; no ping server</td></tr>
<tr><td>Old primary does not come back</td><td>Its age was reset; override disabled (by design)</td></tr>
<tr><td>Primary changes after a reboot</td><td>Override enabled on one unit only</td></tr>
<tr><td>out-of-sync</td><td><code>sync-config disable</code>, firmware mismatch, a stopped synchronisation</td></tr>
<tr><td>Sessions drop at failover</td><td>Pickup off, UDP or ICMP without connectionless, proxy-based inspection</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Changing priority to "fix" the primary while override is disabled. Nothing happens, because a running cluster only renegotiates when something changes, and priority is not looked at before age.</p></div>

<h3>Lab 1: n7-ha-build</h3>
<p>You built the cluster. Your checks: <code>get system ha status</code> shows two members and <code>in-sync</code>; <code>show firewall policy</code> on FGT-B lists policy 1 that you never typed; PC-NOC pings 10.99.0.11 and 10.99.0.12. For the last task, <code>diagnose sys ha checksum cluster</code> prints a block per serial. The block with <code>is_manage_primary()=1</code> belongs to the primary. The serial is not a host name, so run <code>get system status</code> and match <code>Serial-Number: FGVMEV1NU41WS000</code> with <code>Hostname: FGT-A</code>.</p>

<h3>Lab 2: n7-ha-election, ticket NT-4471</h3>
<p>The uplink behind SW-WAN-A failed, FGT-A's port1 stayed up, and nothing failed over. The fix is remote link monitoring:</p>
<pre class="code">config system interface
    edit port1
        set gwdetect enable
        set detectserver 198.51.100.1
        set ha-priority 10
    next
end
config system ha
    set pingserver-monitor-interface "port1"
    set pingserver-failover-threshold 5
    set pingserver-flip-timeout 6
end</pre>
<p>Now the history on FGT-B shows why it won:</p>
<pre class="out">FGT-B # diagnose sys ha history read
&lt;2026/10/04 21:13:31&gt; vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because <span class="hl">the value of link-failure + pingsvr-failure is less than peer member</span> FGVMEV1NU41WS000.
&lt;2026/10/04 21:13:31&gt; remote link monitoring failed, HA uptime of FGVMEV1NU41WS000 is reset
&lt;2026/10/04 21:13:31&gt; ping server 198.51.100.1 of port1 is not reachable
&lt;2026/10/04 21:13:00&gt; vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its priority is larger than peer member FGVMEV1OO2UZP000.</pre>
<p>After the repair FGT-B stays primary, because its age is larger. Enabling <code>override</code> on both units brings FGT-A back by priority (200 against 100).</p>

<h3>Lab 3: n7-ha-sync, ticket NT-4502</h3>
<p>Status shows <code>out-of-sync</code>. <code>diagnose sys ha checksum show</code> on both units differs in one line only:</p>
<pre class="out">FGT-A # diagnose sys ha checksum show
firewall.address: a9 3f 30 4d d2 37 12 7a 5c a8 05 86 02 e1 3a 18
<span class="hl">firewall.policy: 0a 18 eb 8d 87 c8 f0 dd 39 a5 e8 4b 9b c4 f2 ea</span>
system.global: 5b 3b 6e 2c 36 b4 9c ed af b3 df f8 4f 34 db 51</pre>
<p>The cause is <code>sync-config disable</code> in <code>show system ha</code>. Run <code>set sync-config enable</code> on the primary. FGT-B gets policy 2 VOIP-OUT and <b>loses</b> its own policy 99 TEMP-TEST. The primary always wins, so read and record local changes on a secondary first. Host name and priority 100 remain per unit.</p>

<h3>Lab 4: n7-ha-session</h3>
<p>With pickup off, <code>diagnose sys session list</code> on FGT-B ends with <code>total session 0</code>. After <code>set session-pickup enable</code> and a <code>curl 8.8.8.8</code> from PC-LAN, FGT-B holds the TCP session:</p>
<pre class="out">FGT-B # diagnose sys session list
session info: proto=6 proto_state=01 duration=11 expire=3589 timeout=3600 ...
<span class="hl">state=may_dirty synced</span>
hook=post dir=org act=snat 10.10.1.10:64251-&gt;8.8.8.8:80(198.51.100.2:60002)
total session 1</pre>
<p>Only proto 6 is there. <code>execute ha failover set 1</code> on FGT-A makes FGT-B primary and the session lives on, now without the flag. After <code>execute ha failover unset 1</code>, enable <code>session-pickup-connectionless</code> on the new primary FGT-B: ICMP and UDP are now copied to FGT-A too.</p>
<div class="note"><p>Honest scope. In the lab each unit has its own console and the cluster fails over at once. Real FortiOS offers <code>execute ha manage</code> and needs about 1.2 s to declare a heartbeat lost (6 missed heartbeats of 200 ms).</p></div>

<div class="scn"><h4>Friday night, two primaries</h4><p>After a maintenance window both units showed <code>primary</code> and users saw random drops, because two devices answered with the same virtual MAC. The engineer followed the workflow: step 2 showed the WARNING line, step 3 showed hbdev set to "port3" and "port5" on FGT-B. A typo. One corrected hbdev line, then the cluster re-formed and FGT-B resynchronised.</p><p><b>Lesson:</b> check peers and heartbeat before touching priorities.</p></div>
<div class="iv"><p class="q">"Users report an outage, the cluster is HA. What do you do first?"</p><p>Roles on both units, then peers and heartbeat, then the election reason in the history, then sync and sessions. Say that you read the history for the reason instead of guessing.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: roles, peers, heartbeat, election reason, sync, sessions.</li>
<li>Two primaries plus WARNING means split brain: look at group settings and hbdev.</li>
<li>History text gives the election reason word for word.</li>
<li><code>checksum cluster</code> says "different", <code>checksum show</code> says which table.</li>
<li>The primary always wins when sync resumes; record secondary changes first.</li>
</ul></div>
`,hi:`
<p>Doctor operation se shuru nahi karta. Woh pehle pulse dekhta hai, phir temperature, phir sawal puchta hai, hamesha isi order mein. FGCP cluster ki troubleshooting bhi aisi hi hai. Agar aap hamesha wahi chhe steps chalo, to fault minutes mein mil jaata hai, aur aap galat cheez ko blame nahi karte.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="HA troubleshooting workflow">
<rect x="10" y="40" width="92" height="60" rx="8" fill="#bae6fd"/><text x="56" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 Roles</text><text x="56" y="86" text-anchor="middle" class="svg-muted" font-size="11">primary kaun</text>
<rect x="115" y="40" width="92" height="60" rx="8" fill="#bbf7d0"/><text x="161" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Peers</text><text x="161" y="86" text-anchor="middle" class="svg-muted" font-size="11">do members?</text>
<rect x="220" y="40" width="92" height="60" rx="8" fill="#ddd6fe"/><text x="266" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Heartbeat</text><text x="266" y="86" text-anchor="middle" class="svg-muted" font-size="11">hbdev up</text>
<rect x="325" y="40" width="92" height="60" rx="8" fill="#fde68a"/><text x="371" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Election</text><text x="371" y="86" text-anchor="middle" class="svg-muted" font-size="11">yeh unit kyun</text>
<rect x="430" y="40" width="92" height="60" rx="8" fill="#fed7aa"/><text x="476" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Sync</text><text x="476" y="86" text-anchor="middle" class="svg-muted" font-size="11">in-sync?</text>
<rect x="535" y="40" width="92" height="60" rx="8" fill="#e2e8f0"/><text x="581" y="66" text-anchor="middle" class="svg-ink" font-size="13">6 Sessions</text><text x="581" y="86" text-anchor="middle" class="svg-muted" font-size="11">pickup chalta hai</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Aage mat kudo: step 2 ka galat jawab uske baad ki har cheez samjha deta hai.</text>
</svg><p class="cap">Chhe sawal, hamesha isi order mein.</p></div>
<ol>
<li><b>Roles.</b> <code>get system status</code> mein <code>Current HA mode: a-p, primary</code> ya <code>secondary</code> dikhta hai. Dono units par chalao. Do primaries ka matlab split brain.</li>
<li><b>Peers.</b> <code>get system ha status</code>: kya dono serials listed hain? Akela unit <code>HA Health Status: WARNING: only one member is present, the heartbeat finds no peer</code> print karta hai.</li>
<li><b>Heartbeat.</b> Isi output ka <code>HBDEV stats</code> block port3 aur port4 up ya down dikhata hai. Cables, hbdev names aur group settings (mode, group-id, group-name, password) check karo.</li>
<li><b>Election reason.</b> <code>diagnose sys ha history read</code> reason shabdon mein print karta hai. Order yaad rakho: kam failures, phir age (difference 300 s se zyada), phir priority, phir higher serial. Override priority ko age se pehle rakhta hai.</li>
<li><b>Sync.</b> <code>Configuration Status</code> in-sync ya out-of-sync batata hai. <code>diagnose sys ha checksum cluster</code> units ko compare karta hai; <code>checksum show</code> table ka naam batata hai.</li>
<li><b>Sessions.</b> Secondary par <code>diagnose sys session list</code>: kya <code>synced</code> flag hai? Kya pickup (aur connectionless) enabled hai?</li>
</ol>

<h3>Common faults aur unki pehchaan</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Dono units primary, WARNING line</td><td>Password, group-id ya group-name mismatch; hbdev galat port par; heartbeat cable missing</td></tr>
<tr><td>WAN dead hai phir bhi failover nahi</td><td>Port switch ke peeche up rehta hai; port <code>monitor</code> mein nahi; ping server nahi</td></tr>
<tr><td>Purana primary wapas nahi aata</td><td>Uski age reset hui; override disabled (by design)</td></tr>
<tr><td>Reboot ke baad primary badal gaya</td><td>Override sirf ek unit par enabled</td></tr>
<tr><td>out-of-sync</td><td><code>sync-config disable</code>, firmware mismatch, ruki hui synchronisation</td></tr>
<tr><td>Failover par sessions girte hain</td><td>Pickup off, UDP ya ICMP bina connectionless, proxy-based inspection</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Override disabled hote hue primary "theek" karne ke liye priority badalna. Kuch nahi hota, kyunki running cluster tabhi renegotiate karta hai jab kuch badalta hai, aur priority age se pehle dekhi nahi jaati.</p></div>

<h3>Lab 1: n7-ha-build</h3>
<p>Aapne cluster banaya. Checks: <code>get system ha status</code> do members aur <code>in-sync</code> dikhata hai; FGT-B par <code>show firewall policy</code> policy 1 list karta hai jo aapne type nahi ki; PC-NOC 10.99.0.11 aur 10.99.0.12 ko ping karta hai. Aakhri task ke liye <code>diagnose sys ha checksum cluster</code> har serial ka ek block print karta hai. Jis block mein <code>is_manage_primary()=1</code> hai woh primary ka hai. Serial host name nahi hai, isliye <code>get system status</code> chalao aur <code>Serial-Number: FGVMEV1NU41WS000</code> ko <code>Hostname: FGT-A</code> se match karo.</p>

<h3>Lab 2: n7-ha-election, ticket NT-4471</h3>
<p>SW-WAN-A ke peeche uplink fail hua, FGT-A ka port1 up raha, aur kuch fail over nahi hua. Fix remote link monitoring hai:</p>
<pre class="code">config system interface
    edit port1
        set gwdetect enable
        set detectserver 198.51.100.1
        set ha-priority 10
    next
end
config system ha
    set pingserver-monitor-interface "port1"
    set pingserver-failover-threshold 5
    set pingserver-flip-timeout 6
end</pre>
<p>Ab FGT-B ki history dikhati hai ki woh kyun jeeta:</p>
<pre class="out">FGT-B # diagnose sys ha history read
&lt;2026/10/04 21:13:31&gt; vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because <span class="hl">the value of link-failure + pingsvr-failure is less than peer member</span> FGVMEV1NU41WS000.
&lt;2026/10/04 21:13:31&gt; remote link monitoring failed, HA uptime of FGVMEV1NU41WS000 is reset
&lt;2026/10/04 21:13:31&gt; ping server 198.51.100.1 of port1 is not reachable
&lt;2026/10/04 21:13:00&gt; vcluster-1: FGVMEV1NU41WS000 is selected as the primary because its priority is larger than peer member FGVMEV1OO2UZP000.</pre>
<p>Repair ke baad FGT-B primary rehta hai, kyunki uski age zyada hai. Dono units par <code>override</code> enable karne se FGT-A priority se wapas aata hai (200 banam 100).</p>

<h3>Lab 3: n7-ha-sync, ticket NT-4502</h3>
<p>Status <code>out-of-sync</code> dikhata hai. Dono units par <code>diagnose sys ha checksum show</code> sirf ek line mein alag hai:</p>
<pre class="out">FGT-A # diagnose sys ha checksum show
firewall.address: a9 3f 30 4d d2 37 12 7a 5c a8 05 86 02 e1 3a 18
<span class="hl">firewall.policy: 0a 18 eb 8d 87 c8 f0 dd 39 a5 e8 4b 9b c4 f2 ea</span>
system.global: 5b 3b 6e 2c 36 b4 9c ed af b3 df f8 4f 34 db 51</pre>
<p>Wajah <code>show system ha</code> mein <code>sync-config disable</code> hai. Primary par <code>set sync-config enable</code> chalao. FGT-B ko policy 2 VOIP-OUT milti hai aur uski apni policy 99 TEMP-TEST <b>chali jaati hai</b>. Primary hamesha jeetta hai, isliye secondary ke local changes pehle padho aur record karo. Host name aur priority 100 per unit rehte hain.</p>

<h3>Lab 4: n7-ha-session</h3>
<p>Pickup off ho to FGT-B par <code>diagnose sys session list</code> <code>total session 0</code> par khatam hota hai. <code>set session-pickup enable</code> aur PC-LAN se <code>curl 8.8.8.8</code> ke baad FGT-B ke paas TCP session aa jaata hai:</p>
<pre class="out">FGT-B # diagnose sys session list
session info: proto=6 proto_state=01 duration=11 expire=3589 timeout=3600 ...
<span class="hl">state=may_dirty synced</span>
hook=post dir=org act=snat 10.10.1.10:64251-&gt;8.8.8.8:80(198.51.100.2:60002)
total session 1</pre>
<p>Sirf proto 6 hai. FGT-A par <code>execute ha failover set 1</code> FGT-B ko primary banata hai aur session zinda rehta hai, ab flag ke bina. <code>execute ha failover unset 1</code> ke baad naye primary FGT-B par <code>session-pickup-connectionless</code> enable karo: ICMP aur UDP bhi FGT-A par copy hone lagte hain.</p>
<div class="note"><p>Honest scope. Lab mein har unit ka apna console hai aur cluster turant fail over karta hai. Real FortiOS mein <code>execute ha manage</code> milta hai aur heartbeat lost declare karne mein lagbhag 1.2 s lagta hai (200 ms ke 6 missed heartbeats).</p></div>

<div class="scn"><h4>Friday raat, do primaries</h4><p>Maintenance window ke baad dono units <code>primary</code> dikha rahe the aur users ko random drops mile, kyunki do devices same virtual MAC se jawab de rahe the. Engineer ne workflow follow kiya: step 2 mein WARNING line dikhi, step 3 mein FGT-B par hbdev "port3" aur "port5" nikla. Ek typo. Ek hbdev line theek ki, cluster dobara bana aur FGT-B resynchronise ho gaya.</p><p><b>Lesson:</b> priorities chhedne se pehle peers aur heartbeat check karo.</p></div>
<div class="iv"><p class="q">"Users outage report karte hain, cluster HA hai. Sabse pehle kya karte ho?"</p><p>Dono units par roles, phir peers aur heartbeat, phir history mein election reason, phir sync aur sessions. Kaho ki aap andaza lagane ke bajay history padhkar reason nikalte ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: roles, peers, heartbeat, election reason, sync, sessions.</li>
<li>Do primaries aur WARNING ka matlab split brain: group settings aur hbdev dekho.</li>
<li>History text election reason word-for-word deta hai.</li>
<li><code>checksum cluster</code> "alag hai" batata hai, <code>checksum show</code> batata hai kaunsi table.</li>
<li>Sync resume hone par primary hamesha jeetta hai; secondary ke changes pehle record karo.</li>
</ul></div>
`}};export{e as default};