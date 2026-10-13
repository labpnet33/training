var e={id:`operational-commands`,h:{en:`Operational mode toolbox: show, ping, monitor and logs`,hi:`Operational mode toolbox: show, ping, monitor aur logs`},body:{en:`
<p>A doctor first listens and measures: pulse, temperature, blood pressure. A network engineer does the same with <b>show commands</b> before changing anything. This chapter gives you the operational commands you will use every day on R1 and R2.</p>

<h3>The first five commands on any device</h3>
<pre class="code">lab@R1&gt; show version
Hostname: R1-PUNE
Model: vSRX
Junos: 23.2R1.13

lab@R1&gt; show system uptime
lab@R1&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.20.1.1/30
lo0                     up    up
lo0.0                   up    up   inet     192.0.2.1  --&gt; 0/0

lab@R1&gt; show route
lab@R1&gt; show configuration</pre>
<table class="cmp"><tr><th>Command</th><th>Answers the question</th></tr>
<tr><td><code>show version</code></td><td>Which model and Junos release?</td></tr>
<tr><td><code>show system uptime</code></td><td>When did it boot, when was the last commit?</td></tr>
<tr><td><code>show interfaces terse</code></td><td>Which interfaces are up, with which addresses?</td></tr>
<tr><td><code>show route</code></td><td>What does the routing table contain?</td></tr>
<tr><td><code>show configuration</code></td><td>What is the <b>active</b> configuration?</td></tr>
<tr><td><code>show system alarms</code> / <code>show chassis alarms</code></td><td>Are there warnings?</td></tr></table>
<p>In the <code>terse</code> output the <b>Admin</b> column says whether you enabled the port and <b>Link</b> says whether the cable carries a signal. <code>up down</code> means "enabled but no link", the classic cabling or far-end problem. <code>down down</code> usually means somebody wrote <code>disable</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Show command layers">
<rect x="20" y="20" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">1. Physical: show interfaces terse (Admin / Link)</text>
<rect x="20" y="58" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">2. Address and neighbours: show arp, ping</text>
<rect x="20" y="96" width="600" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">3. Routing: show route, show ospf neighbor</text>
<rect x="20" y="134" width="600" height="30" rx="6" fill="#fde68a"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">4. History: show system commit, show log messages</text>
</svg><p class="cap">Work bottom-up: cable, address, route, then history.</p></div>

<h3>Showing the configuration in useful ways</h3>
<ul>
<li><code>show configuration interfaces ge-0/0/0</code> prints just one branch of the active configuration, from operational mode.</li>
<li><code>show configuration | display set</code> prints it as set commands, handy for tickets.</li>
<li><code>show configuration | display inheritance</code> includes statements from configuration groups (covered in the Initial setup module).</li>
<li><code>show | compare</code> in configuration mode shows only differences.</li>
</ul>

<h3>ping and traceroute</h3>
<p>Junos <code>ping</code> never stops by itself, so always give <code>count</code>. Useful options:</p>
<pre class="code">lab@R1&gt; ping 10.20.1.2 count 3
lab@R1&gt; ping 10.20.1.2 count 3 source 192.0.2.1
lab@R1&gt; ping 10.20.1.2 size 1472 do-not-fragment count 2
lab@R1&gt; traceroute 172.16.50.1 no-resolve</pre>
<p><code>source</code> chooses the source address, which matters for routing tests. <code>no-resolve</code> skips DNS and makes traceroute faster.</p>

<h3>Logs and live monitoring</h3>
<pre class="code">lab@R1&gt; show log messages | last 10
lab@R1&gt; show log messages | match UI_COMMIT
Oct  1 09:58:02 R1-PUNE mgd[1203]: UI_COMMIT: User 'lab' requested 'commit' operation (comment: Pune uplink)
lab@R1&gt; monitor start messages
lab@R1&gt; monitor stop
lab@R1&gt; monitor traffic interface ge-0/0/0 no-resolve size 1500 count 5</pre>
<p><code>monitor start</code> streams new log lines to your terminal. <code>monitor traffic</code> is a built-in packet capture of traffic that goes to or from the Routing Engine, not of transit traffic.</p>

<h3>request, clear and file commands</h3>
<ul>
<li><code>request</code> performs an action: <code>request system reboot</code>, <code>request system software add</code>, <code>request system configuration rescue save</code>.</li>
<li><code>clear</code> resets state: <code>clear interfaces statistics all</code>, <code>clear ospf neighbor</code>.</li>
<li><code>file list /var/log</code> and <code>file show /var/log/messages</code> browse the file system. <code>start shell</code> opens the FreeBSD shell; <code>exit</code> returns.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Running <code>ping</code> without <code>count</code> and leaving it running; typing <code>request system reboot</code> on the wrong window; reading the candidate (<code>show</code> in configuration mode) when you needed the active one.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show configuration</code> in operational mode shows the <b>active</b> configuration, while <code>show</code> in configuration mode shows the <b>candidate</b>. And <code>monitor traffic</code> captures only traffic to or from the Routing Engine.</p></div>

<div class="scn"><h4>Admin up, link down</h4><p>After the Pune rack job, R1's uplink showed <code>ge-0/0/0 up down</code>. The engineer did not touch the configuration. He checked the patch panel and found a fibre plugged into the wrong port. After he moved it, <code>show interfaces terse</code> read <code>up up</code> and <code>ping</code> worked.</p><p><b>Lesson:</b> read Admin and Link separately. Admin up/Link down is physical, not configuration.</p></div>

<div class="iv"><p class="q">"A user says the branch is down. What are your first three Junos commands?"</p><p>First <code>show interfaces terse</code> to see physical and logical state, then <code>ping</code> to the neighbour with <code>count</code>, then <code>show route</code> or <code>show ospf neighbor</code> for the path. If these do not explain it, <code>show system commit</code> and <code>show log messages</code> tell me what changed recently.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show interfaces terse</code> gives Admin and Link state plus addresses at a glance.</li>
<li>Always use <code>count</code> with <code>ping</code>; use <code>source</code> to test from a chosen address.</li>
<li><code>show log messages</code> and <code>monitor start</code> reveal events as they happen.</li>
<li><code>show configuration</code> (operational) is active; <code>show</code> (configuration mode) is candidate.</li>
<li><code>request</code> acts, <code>clear</code> resets state, <code>file</code> browses storage.</li>
</ul></div>
`,hi:`
<p>Doctor pehle sunta aur naapta hai: pulse, temperature, blood pressure. Network engineer kuch badalne se pehle <b>show commands</b> se wahi karta hai. Yeh chapter aapko woh operational commands deta hai jo aap R1 aur R2 par roz use karoge.</p>

<h3>Kisi bhi device par pehle paanch commands</h3>
<pre class="code">lab@R1&gt; show version
Hostname: R1-PUNE
Model: vSRX
Junos: 23.2R1.13

lab@R1&gt; show system uptime
lab@R1&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.20.1.1/30
lo0                     up    up
lo0.0                   up    up   inet     192.0.2.1  --&gt; 0/0

lab@R1&gt; show route
lab@R1&gt; show configuration</pre>
<table class="cmp"><tr><th>Command</th><th>Kis sawaal ka jawab</th></tr>
<tr><td><code>show version</code></td><td>Kaunsa model aur Junos release?</td></tr>
<tr><td><code>show system uptime</code></td><td>Kab boot hua, aakhri commit kab hua?</td></tr>
<tr><td><code>show interfaces terse</code></td><td>Kaunse interfaces up hain, kaunse addresses ke saath?</td></tr>
<tr><td><code>show route</code></td><td>Routing table mein kya hai?</td></tr>
<tr><td><code>show configuration</code></td><td><b>Active</b> configuration kya hai?</td></tr>
<tr><td><code>show system alarms</code> / <code>show chassis alarms</code></td><td>Koi warning hai?</td></tr></table>
<p><code>terse</code> output mein <b>Admin</b> column batata hai ki aapne port enable kiya ya nahi, aur <b>Link</b> batata hai ki cable par signal hai ya nahi. <code>up down</code> ka matlab "enabled lekin link nahi", yani classic cabling ya far-end problem. <code>down down</code> aam taur par kisi ne <code>disable</code> likha hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Show command layers">
<rect x="20" y="20" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">1. Physical: show interfaces terse (Admin / Link)</text>
<rect x="20" y="58" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">2. Address aur neighbours: show arp, ping</text>
<rect x="20" y="96" width="600" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">3. Routing: show route, show ospf neighbor</text>
<rect x="20" y="134" width="600" height="30" rx="6" fill="#fde68a"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">4. History: show system commit, show log messages</text>
</svg><p class="cap">Neeche se upar kaam karo: cable, address, route, phir history.</p></div>

<h3>Configuration ko kaam ke tareeke se dikhana</h3>
<ul>
<li><code>show configuration interfaces ge-0/0/0</code> operational mode se active configuration ki sirf ek branch print karta hai.</li>
<li><code>show configuration | display set</code> set commands ki tarah print karta hai, tickets ke liye handy.</li>
<li><code>show configuration | display inheritance</code> configuration groups ke statements bhi dikhata hai (Initial setup module mein aayega).</li>
<li>Configuration mode mein <code>show | compare</code> sirf differences dikhata hai.</li>
</ul>

<h3>ping aur traceroute</h3>
<p>Junos <code>ping</code> apne aap kabhi nahi rukta, isliye hamesha <code>count</code> do. Kaam ke options:</p>
<pre class="code">lab@R1&gt; ping 10.20.1.2 count 3
lab@R1&gt; ping 10.20.1.2 count 3 source 192.0.2.1
lab@R1&gt; ping 10.20.1.2 size 1472 do-not-fragment count 2
lab@R1&gt; traceroute 172.16.50.1 no-resolve</pre>
<p><code>source</code> source address chunta hai, jo routing tests mein matter karta hai. <code>no-resolve</code> DNS skip karta hai aur traceroute tez karta hai.</p>

<h3>Logs aur live monitoring</h3>
<pre class="code">lab@R1&gt; show log messages | last 10
lab@R1&gt; show log messages | match UI_COMMIT
Oct  1 09:58:02 R1-PUNE mgd[1203]: UI_COMMIT: User 'lab' requested 'commit' operation (comment: Pune uplink)
lab@R1&gt; monitor start messages
lab@R1&gt; monitor stop
lab@R1&gt; monitor traffic interface ge-0/0/0 no-resolve size 1500 count 5</pre>
<p><code>monitor start</code> nayi log lines aapke terminal par stream karta hai. <code>monitor traffic</code> built-in packet capture hai, lekin sirf Routing Engine se aane-jaane wale traffic ka, transit traffic ka nahi.</p>

<h3>request, clear aur file commands</h3>
<ul>
<li><code>request</code> action karta hai: <code>request system reboot</code>, <code>request system software add</code>, <code>request system configuration rescue save</code>.</li>
<li><code>clear</code> state reset karta hai: <code>clear interfaces statistics all</code>, <code>clear ospf neighbor</code>.</li>
<li><code>file list /var/log</code> aur <code>file show /var/log/messages</code> file system browse karte hain. <code>start shell</code> FreeBSD shell kholta hai; <code>exit</code> se wapas.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> <code>count</code> ke bina <code>ping</code> chalakar chhod dena; galat window mein <code>request system reboot</code> type kar dena; jab active chahiye tha tab candidate padhna (configuration mode mein <code>show</code>).</p></div>
<div class="exam"><p><b>Exam trap.</b> Operational mode mein <code>show configuration</code> <b>active</b> configuration dikhata hai, jabki configuration mode mein <code>show</code> <b>candidate</b> dikhata hai. Aur <code>monitor traffic</code> sirf Routing Engine ke traffic ko capture karta hai.</p></div>

<div class="scn"><h4>Admin up, link down</h4><p>Pune rack job ke baad R1 ka uplink <code>ge-0/0/0 up down</code> dikha raha tha. Engineer ne configuration ko haath nahi lagaya. Usne patch panel check kiya aur fibre galat port mein laga mila. Use hatane ke baad <code>show interfaces terse</code> mein <code>up up</code> aaya aur <code>ping</code> chala.</p><p><b>Lesson:</b> Admin aur Link ko alag padho. Admin up/Link down physical hai, configuration nahi.</p></div>

<div class="iv"><p class="q">"User kehta hai branch down hai. Aapke pehle teen Junos commands kaunse hain?"</p><p>Pehle <code>show interfaces terse</code> physical aur logical state ke liye, phir neighbour ko <code>count</code> ke saath <code>ping</code>, phir path ke liye <code>show route</code> ya <code>show ospf neighbor</code>. Agar yeh samjha na paaye to <code>show system commit</code> aur <code>show log messages</code> batate hain haal mein kya badla.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show interfaces terse</code> ek nazar mein Admin aur Link state aur addresses deta hai.</li>
<li><code>ping</code> ke saath hamesha <code>count</code>; chune hue address se test ke liye <code>source</code>.</li>
<li><code>show log messages</code> aur <code>monitor start</code> events ko hote hue dikhate hain.</li>
<li><code>show configuration</code> (operational) active hai; <code>show</code> (configuration mode) candidate hai.</li>
<li><code>request</code> action karta hai, <code>clear</code> state reset karta hai, <code>file</code> storage browse karta hai.</li>
</ul></div>
`}};export{e as default};