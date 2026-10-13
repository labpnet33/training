var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot's pre-flight checklist is short, but every line on it exists because something once went wrong. This chapter is your checklist for firewall high availability: what you must be able to do, the words you must know, the facts the exam loves, and the commands you will type again and again.</p>

<h3>The module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Map of the HA module">
<rect x="20" y="20" width="180" height="80" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Models</text><text x="110" y="65" text-anchor="middle" class="svg-muted" font-size="12">A/S, A/A, cluster</text><text x="110" y="85" text-anchor="middle" class="svg-muted" font-size="12">requirements</text>
<rect x="230" y="20" width="180" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Build</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">links, standby IPs</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">virtual MAC, sync</text>
<rect x="440" y="20" width="180" height="80" rx="8" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Protect state</text><text x="530" y="65" text-anchor="middle" class="svg-muted" font-size="12">conn, xlate, VPN</text><text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="12">state link</text>
<rect x="20" y="130" width="180" height="80" rx="8" fill="#fde68a"/><text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="13">Monitor</text><text x="110" y="175" text-anchor="middle" class="svg-muted" font-size="12">poll, hold, policy</text><text x="110" y="195" text-anchor="middle" class="svg-muted" font-size="12">triggers</text>
<rect x="230" y="130" width="180" height="80" rx="8" fill="#fed7aa"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Operate</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">failover active</text><text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">upgrades, FTD HA</text>
<rect x="440" y="130" width="180" height="80" rx="8" fill="#e2e8f0"/><text x="530" y="155" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot</text><text x="530" y="175" text-anchor="middle" class="svg-muted" font-size="12">show failover</text><text x="530" y="195" text-anchor="middle" class="svg-muted" font-size="12">5-question workflow</text>
</svg><p class="cap">Six blocks: choose the model, build it, protect state, monitor, operate, troubleshoot.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why a single firewall is a single point of failure, and which HA model fixes which problem.</li>
<li>Compare active/standby, active/active (multiple context mode, failover groups) and clustering.</li>
<li>List what must match on both units: model, interfaces, software version, licence, firewall mode and context mode.</li>
<li>Build an active/standby pair: standby addresses, failover LAN link, state link, key, roles (lab 1).</li>
<li>Explain virtual (active) MAC behaviour and gratuitous ARP after a switchover.</li>
<li>Prove stateful failover by keeping an SSH session alive while the active unit reloads (lab 2).</li>
<li>Read every block of <code>show failover</code>, <code>show failover state</code> and <code>show failover history</code>.</li>
<li>Tune unit and interface poll/hold times and the interface policy; exclude an interface from monitoring.</li>
<li>Trigger and explain an interface-check failover, then fail back by hand (lab 4).</li>
<li>Fix a pair that never forms: wrong interface and wrong key (lab 3).</li>
<li>Describe FTD HA in the Management Center and clustering roles at concept level.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Primary / Secondary</dt><dd>Fixed unit roles set by <code>failover lan unit</code>; they never change.</dd>
<dt>Active / Standby Ready</dt><dd>Current states; they move with every failover.</dd>
<dt>Failover LAN link</dt><dd>Carries hellos and configuration replication; no nameif.</dd>
<dt>State link</dt><dd>Carries connections, xlates and other state; may share the failover link.</dd>
<dt>Standby address</dt><dd>The address the standby unit uses on a data interface; needed for interface testing.</dd>
<dt>Active MAC</dt><dd>MAC owned by whichever unit is active; the primary's burned-in MAC unless a virtual MAC is set.</dd>
<dt>Interface policy</dt><dd>How many (or what percentage of) monitored interfaces must fail to trigger failover; default 1.</dd>
<dt>Failover group</dt><dd>Active/active unit of failover: a set of contexts that is active on one unit.</dd>
<dt>CCL</dt><dd>Cluster control link: control traffic and redirected packets between cluster members.</dd>
<dt>Owner / Director / Forwarder</dt><dd>Cluster flow roles: holds the connection / knows the owner / redirects packets to the owner.</dd>
<dt>Split brain</dt><dd>Both units active because they cannot hear each other.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Value</th></tr>
<tr><td>Unit poll / holdtime (default)</td><td>1 s / 15 s</td></tr>
<tr><td>Interface poll / holdtime (default)</td><td>5 s / 25 s</td></tr>
<tr><td>Interface policy (default)</td><td>1 failed interface</td></tr>
<tr><td>Preemption in active/standby</td><td>None; only failover groups in active/active</td></tr>
<tr><td>Replicated by default</td><td>TCP/UDP conns, xlates, ARP, routes, VPN SAs, user identity</td></tr>
<tr><td>Not replicated by default</td><td>HTTP connections</td></tr>
<tr><td>Where to configure</td><td>Active unit only; <code>write memory</code> saves on both</td></tr>
<tr><td>Active/active needs</td><td>Multiple context mode, two failover groups</td></tr>
<tr><td>Cluster size</td><td>Up to 16 units, platform and version dependent</td></tr>
<tr><td>FTD HA built in</td><td>Management Center: Devices, Add High Availability</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! build (primary; the secondary needs only the failover lines)</span>
interface GigabitEthernet0/1
 ip address 10.0.1.1 255.255.255.0 standby 10.0.1.2
failover lan unit primary
failover lan interface FOLINK GigabitEthernet0/5
failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2
failover link STATELINK GigabitEthernet0/4
failover interface ip STATELINK 192.168.254.1 255.255.255.252 standby 192.168.254.2
failover key NKfo2026
failover
<span class="c">! tune and operate</span>
failover polltime unit msec 200 holdtime 1
failover polltime interface 5 holdtime 25
failover interface-policy 1
no monitor-interface LABNET
failover active              <span class="c">! on the standby</span>
no failover active           <span class="c">! on the active</span>
failover reload-standby
write standby
prompt hostname priority state
<span class="c">! verify</span>
show failover
show failover state
show failover history
show failover interface
show monitor-interface
failover exec mate show conn</pre>

<div class="warn"><p><b>Common mistakes to avoid in the exam and at work.</b> Forgetting standby addresses; configuring the standby; one switch carrying both failover and state links; expecting the primary to take the active role back automatically; upgrading the active unit first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Watch for questions that mix <i>role</i> and <i>state</i>. "Primary" answers "which unit?"; "Active" answers "who is forwarding?". After a failover the correct description can be "Secondary - Active".</p></div>

<div class="scn"><h4>The HA audit before go-live</h4><p>Before a new branch went live, the lead engineer ran the checklist on its ASA pair. <code>show failover</code> showed Failover On and Standby Ready, but <code>show monitor-interface</code> listed the new guest interface as <i>Waiting</i> and the state link shared a single switch with the failover link. She added the standby address, moved the state link to a direct cable, and ran a planned <code>no failover active</code> test with an SSH session open. The session survived and the site went live on time.</p><p><b>Lesson:</b> a pair is only highly available after you have tested a failover, not when the configuration looks right.</p></div>

<div class="iv"><p class="q">"Summarise how you would design, verify and operate an ASA HA pair."</p><p>Strong answer: identical units; active/standby unless contexts or throughput call for active/active or clustering; dedicated failover and state links on separate paths; standby addresses on every data interface; a failover key; configure only the active. Verify with <code>show failover</code> and a planned switchover test. Operate with manual failover for maintenance, remember there is no preemption, and troubleshoot with the five-question workflow on both units.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Role (primary/secondary) is fixed; state (active/standby) moves.</li>
<li>Standby addresses, a state link and a key are the three things most often forgotten.</li>
<li>Defaults: unit 1 s / 15 s, interface 5 s / 25 s, policy 1, no preemption.</li>
<li>Clustering adds throughput; failover adds redundancy only.</li>
<li>Test a failover before trusting a pair.</li>
</ul></div>
`,hi:`
<p>Pilot ki pre-flight checklist chhoti hoti hai, lekin uski har line isliye hai kyunki kabhi kuch galat hua tha. Yeh chapter firewall high availability ki aapki checklist hai: aapko kya kar paana chahiye, kaunse shabd aane chahiye, exam ko kaunse facts pasand hain, aur kaunse commands aap baar-baar type karoge.</p>

<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Map of the HA module">
<rect x="20" y="20" width="180" height="80" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Models</text><text x="110" y="65" text-anchor="middle" class="svg-muted" font-size="12">A/S, A/A, cluster</text><text x="110" y="85" text-anchor="middle" class="svg-muted" font-size="12">requirements</text>
<rect x="230" y="20" width="180" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Build</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">links, standby IPs</text><text x="320" y="85" text-anchor="middle" class="svg-muted" font-size="12">virtual MAC, sync</text>
<rect x="440" y="20" width="180" height="80" rx="8" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">State bachao</text><text x="530" y="65" text-anchor="middle" class="svg-muted" font-size="12">conn, xlate, VPN</text><text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="12">state link</text>
<rect x="20" y="130" width="180" height="80" rx="8" fill="#fde68a"/><text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="13">Monitor</text><text x="110" y="175" text-anchor="middle" class="svg-muted" font-size="12">poll, hold, policy</text><text x="110" y="195" text-anchor="middle" class="svg-muted" font-size="12">triggers</text>
<rect x="230" y="130" width="180" height="80" rx="8" fill="#fed7aa"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">Operate</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">failover active</text><text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">upgrades, FTD HA</text>
<rect x="440" y="130" width="180" height="80" rx="8" fill="#e2e8f0"/><text x="530" y="155" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot</text><text x="530" y="175" text-anchor="middle" class="svg-muted" font-size="12">show failover</text><text x="530" y="195" text-anchor="middle" class="svg-muted" font-size="12">5-sawaal workflow</text>
</svg><p class="cap">Chhe blocks: model chuno, build karo, state bachao, monitor karo, operate karo, troubleshoot karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki ek firewall single point of failure kyun hai, aur kaunsa HA model kaunsi problem theek karta hai.</li>
<li>Active/standby, active/active (multiple context mode, failover groups) aur clustering compare karo.</li>
<li>Dono units par kya match hona chahiye: model, interfaces, software version, licence, firewall mode aur context mode.</li>
<li>Active/standby pair banao: standby addresses, failover LAN link, state link, key, roles (lab 1).</li>
<li>Virtual (active) MAC behaviour aur switchover ke baad gratuitous ARP samjhao.</li>
<li>Active unit reload hote waqt SSH session zinda rakh kar stateful failover saabit karo (lab 2).</li>
<li><code>show failover</code>, <code>show failover state</code> aur <code>show failover history</code> ka har block padho.</li>
<li>Unit aur interface poll/hold times aur interface policy tune karo; kisi interface ko monitoring se bahar rakho.</li>
<li>Interface-check failover trigger karo aur samjhao, phir haath se fail back karo (lab 4).</li>
<li>Kabhi na banne wala pair theek karo: galat interface aur galat key (lab 3).</li>
<li>Management Center mein FTD HA aur clustering roles concept level par batao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Primary / Secondary</dt><dd><code>failover lan unit</code> se set hone wale fixed unit roles; kabhi nahi badalte.</dd>
<dt>Active / Standby Ready</dt><dd>Current states; har failover ke saath move hoti hain.</dd>
<dt>Failover LAN link</dt><dd>Hellos aur configuration replication le jaata hai; koi nameif nahi.</dd>
<dt>State link</dt><dd>Connections, xlates aur baaki state le jaata hai; failover link share kar sakta hai.</dd>
<dt>Standby address</dt><dd>Woh address jo standby unit data interface par use karta hai; interface testing ke liye zaroori.</dd>
<dt>Active MAC</dt><dd>Jo bhi unit active ho uska MAC; primary ka burned-in MAC, jab tak virtual MAC set na ho.</dd>
<dt>Interface policy</dt><dd>Failover trigger karne ke liye kitne (ya kitne percent) monitored interfaces fail hone chahiye; default 1.</dd>
<dt>Failover group</dt><dd>Active/active ki failover unit: contexts ka set jo ek unit par active hota hai.</dd>
<dt>CCL</dt><dd>Cluster control link: cluster members ke beech control traffic aur redirect hue packets.</dd>
<dt>Owner / Director / Forwarder</dt><dd>Cluster flow roles: connection rakhta hai / owner ko jaanta hai / packets owner ko redirect karta hai.</dd>
<dt>Split brain</dt><dd>Dono units active kyunki ek doosre ko sun nahi paate.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp">
<tr><th>Fact</th><th>Value</th></tr>
<tr><td>Unit poll / holdtime (default)</td><td>1 s / 15 s</td></tr>
<tr><td>Interface poll / holdtime (default)</td><td>5 s / 25 s</td></tr>
<tr><td>Interface policy (default)</td><td>1 failed interface</td></tr>
<tr><td>Active/standby mein preemption</td><td>Nahi; sirf active/active ke failover groups mein</td></tr>
<tr><td>Default se replicate hota hai</td><td>TCP/UDP conns, xlates, ARP, routes, VPN SAs, user identity</td></tr>
<tr><td>Default se replicate nahi hota</td><td>HTTP connections</td></tr>
<tr><td>Configure kahan karein</td><td>Sirf active unit par; <code>write memory</code> dono par save karta hai</td></tr>
<tr><td>Active/active ko chahiye</td><td>Multiple context mode, do failover groups</td></tr>
<tr><td>Cluster size</td><td>16 units tak, platform aur version par nirbhar</td></tr>
<tr><td>FTD HA kahan banta hai</td><td>Management Center: Devices, Add High Availability</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! build (primary; secondary ko sirf failover lines chahiye)</span>
interface GigabitEthernet0/1
 ip address 10.0.1.1 255.255.255.0 standby 10.0.1.2
failover lan unit primary
failover lan interface FOLINK GigabitEthernet0/5
failover interface ip FOLINK 192.168.255.1 255.255.255.252 standby 192.168.255.2
failover link STATELINK GigabitEthernet0/4
failover interface ip STATELINK 192.168.254.1 255.255.255.252 standby 192.168.254.2
failover key NKfo2026
failover
<span class="c">! tune aur operate</span>
failover polltime unit msec 200 holdtime 1
failover polltime interface 5 holdtime 25
failover interface-policy 1
no monitor-interface LABNET
failover active              <span class="c">! standby par</span>
no failover active           <span class="c">! active par</span>
failover reload-standby
write standby
prompt hostname priority state
<span class="c">! verify</span>
show failover
show failover state
show failover history
show failover interface
show monitor-interface
failover exec mate show conn</pre>

<div class="warn"><p><b>Exam aur kaam dono mein bachne wali common galtiyan.</b> Standby addresses bhoolna; standby ko configure karna; ek hi switch par failover aur state dono links; umeed karna ki primary apne aap active role wapas le lega; pehle active unit upgrade karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Un sawaalon par dhyaan do jo <i>role</i> aur <i>state</i> ko mix karte hain. "Primary" jawab deta hai "kaunsa unit?"; "Active" jawab deta hai "kaun forward kar raha hai?". Failover ke baad sahi description "Secondary - Active" ho sakta hai.</p></div>

<div class="scn"><h4>Go-live se pehle HA audit</h4><p>Ek nayi branch live hone se pehle lead engineer ne uske ASA pair par checklist chalayi. <code>show failover</code> ne Failover On aur Standby Ready dikhaya, lekin <code>show monitor-interface</code> ne naye guest interface ko <i>Waiting</i> dikhaya aur state link failover link ke saath ek hi switch share kar raha tha. Usne standby address joda, state link ko direct cable par shift kiya, aur SSH session khula rakh kar planned <code>no failover active</code> test chalaya. Session bacha raha aur site time par live hui.</p><p><b>Seekh:</b> pair tabhi highly available hai jab aapne failover test kar liya ho, sirf configuration sahi dikhne se nahi.</p></div>

<div class="iv"><p class="q">"ASA HA pair ko design, verify aur operate kaise karoge, summary mein batao."</p><p>Strong answer: identical units; active/standby, jab tak contexts ya throughput active/active ya clustering na maangein; alag paths par dedicated failover aur state links; har data interface par standby addresses; failover key; sirf active configure karo. <code>show failover</code> aur planned switchover test se verify karo. Maintenance ke liye manual failover se operate karo, yaad rakho ki preemption nahi hai, aur dono units par paanch-sawaal workflow se troubleshoot karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Role (primary/secondary) fixed hai; state (active/standby) move hoti hai.</li>
<li>Standby addresses, state link aur key — yeh teen cheezein sabse zyada bhooli jaati hain.</li>
<li>Defaults: unit 1 s / 15 s, interface 5 s / 25 s, policy 1, koi preemption nahi.</li>
<li>Clustering throughput badhati hai; failover sirf redundancy deta hai.</li>
<li>Pair par bharosa karne se pehle failover test karo.</li>
</ul></div>
`}};export{e as default};