var e={id:`syslog`,h:{en:`System logging (syslog): files, hosts, facilities and severities`,hi:`System logging (syslog): files, hosts, facilities aur severities`},body:{en:`
<p>Think of a newspaper office. Reporters from different departments (sport, politics, business) send stories. The editor decides which stories go in the local edition (a file), which are posted to the head office (a remote host), and which go on the front page screen that everyone sees (user terminals). Syslog works the same way: each message has a <b>facility</b> (which department) and a <b>severity</b> (how serious), and the configuration says where each combination is sent.</p>

<h3>Facility and severity</h3>
<p><b>Facilities</b> are categories of events. Common ones: <code>any</code> (all), <code>authorization</code> (logins), <code>change-log</code> (configuration changes), <code>interactive-commands</code> (commands typed in the CLI), <code>daemon</code> (system processes), <code>kernel</code>, <code>firewall</code>, <code>pfe</code>.</p>
<p><b>Severities</b>, from most to least serious:</p>
<table class="cmp"><tr><th>#</th><th>Severity</th><th>Meaning</th></tr>
<tr><td>0</td><td><code>emergency</code></td><td>system unusable</td></tr>
<tr><td>1</td><td><code>alert</code></td><td>act immediately</td></tr>
<tr><td>2</td><td><code>critical</code></td><td>critical condition</td></tr>
<tr><td>3</td><td><code>error</code></td><td>error</td></tr>
<tr><td>4</td><td><code>warning</code></td><td>warning</td></tr>
<tr><td>5</td><td><code>notice</code></td><td>normal but significant (commits, link changes)</td></tr>
<tr><td>6</td><td><code>info</code></td><td>informational</td></tr></table>
<p>A destination configured with severity <b>notice</b> receives notice and everything <i>more serious</i> (warning, error, critical, alert, emergency). The level is a minimum.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Syslog destinations">
<rect x="10" y="70" width="140" height="60" rx="8" fill="#fde68a"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">Events</text><text x="80" y="113" text-anchor="middle" class="svg-muted" font-size="11">facility + severity</text>
<rect x="260" y="10" width="170" height="40" rx="8" fill="#bae6fd"/><text x="345" y="35" text-anchor="middle" class="svg-ink" font-size="12">file messages (/var/log)</text>
<rect x="260" y="60" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="345" y="85" text-anchor="middle" class="svg-ink" font-size="12">host 10.70.1.50 (UDP 514)</text>
<rect x="260" y="110" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="345" y="135" text-anchor="middle" class="svg-ink" font-size="12">user * (logged-in CLIs)</text>
<rect x="260" y="160" width="170" height="36" rx="8" fill="#fed7aa"/><text x="345" y="183" text-anchor="middle" class="svg-ink" font-size="12">console</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="150" y1="100" x2="260" y2="30"/><line x1="150" y1="100" x2="260" y2="80"/><line x1="150" y1="100" x2="260" y2="130"/><line x1="150" y1="100" x2="260" y2="178"/></g>
<text x="540" y="100" text-anchor="middle" class="svg-muted" font-size="12">each destination has</text><text x="540" y="118" text-anchor="middle" class="svg-muted" font-size="12">its own filters</text>
</svg><p class="cap">One event stream, several destinations, each with its own facility and severity filter.</p></div>

<h3>Configuring destinations</h3>
<pre class="code">set system syslog file messages any notice
set system syslog file messages authorization info
set system syslog file config-changes change-log info
set system syslog file interactive-commands interactive-commands any
set system syslog host 10.70.1.50 any notice
set system syslog host 10.70.1.50 authorization info
set system syslog user * any emergency
set system syslog console any critical</pre>
<table class="cmp"><tr><th>Destination</th><th>Where it goes</th><th>How to read</th></tr>
<tr><td><code>file NAME</code></td><td>/var/log/NAME on the router</td><td><code>show log NAME</code></td></tr>
<tr><td><code>host IP</code></td><td>remote syslog server, UDP 514</td><td>on the server</td></tr>
<tr><td><code>user NAME</code> or <code>*</code></td><td>terminals of logged-in users</td><td>on screen</td></tr>
<tr><td><code>console</code></td><td>serial console</td><td>console cable</td></tr></table>
<p>Useful options: <code>archive size 1m files 5</code> controls rotation of a file, <code>source-address 10.255.70.1</code> sets the address used to reach a remote host (the server must accept it), and <code>match "UI_COMMIT"</code> filters messages by regular expression.</p>

<h3>Reading logs</h3>
<pre class="code">lab@NK-CHN-EDGE&gt; show log messages | last 5
Oct  1 10:02:11 NK-CHN-EDGE mgd[1203]: UI_COMMIT: User 'lab' requested 'commit' operation
Oct  1 10:02:12 NK-CHN-EDGE mgd[1203]: UI_COMMIT_COMPLETED: commit complete
lab@NK-CHN-EDGE&gt; show log config-changes
Oct  1 10:02:11 NK-CHN-EDGE mgd[1203]: UI_CFG_AUDIT_OTHER: User 'lab' set: [system ntp server 10.70.1.50]
lab@NK-CHN-EDGE&gt; show log messages | match UI_COMMIT
lab@NK-CHN-EDGE&gt; monitor start messages
lab@NK-CHN-EDGE&gt; monitor stop</pre>
<p>Every commit generates a <code>UI_COMMIT</code> message at <b>notice</b> level, so it appears in <code>messages</code> and is sent to a remote host configured at notice or lower severity. This is how you prove a commit reached the server.</p>

<h3>Lab walkthrough: Chennai edge, syslog half</h3>
<p>NK-CHN-EDGE (10.70.1.1/24 on ge-0/0/0, via switch SW to OPS 10.70.1.50) logs only to its disk. Required: send any-facility notice messages and authorization info messages to 10.70.1.50, keep a local change log, and prove it works.</p>
<pre class="code">lab@NK-CHN-EDGE# set system syslog host 10.70.1.50 any notice
lab@NK-CHN-EDGE# set system syslog host 10.70.1.50 authorization info
lab@NK-CHN-EDGE# set system syslog file config-changes change-log info
lab@NK-CHN-EDGE# commit
lab@NK-CHN-EDGE# run show log config-changes</pre>
<p>Then on NK-OPS the command <code>show syslog</code> lists received messages, including a line such as <code>NK-CHN-EDGE ... UI_COMMIT</code>. That one line proves the whole path: commit, notice level, network reachability, UDP 514 and the server.</p>

<div class="eg"><p><b>Worked example.</b> A link flaps at 02:14. With <code>messages any notice</code> the line <code>SNMP_TRAP_LINK_DOWN</code> and <code>ge-0/0/1: link down</code> appear on the router and on the syslog host. <code>show log messages | match ge-0/0/1</code> shows the full timeline: down at 02:14:07, up at 02:14:31.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting severity <code>info</code> or <code>any any</code> everywhere, which fills the disk and floods the server; forgetting that syslog to a host is UDP, so lost packets are not retransmitted; sending logs to a host that has no route back or that filters UDP 514; using the wrong facility name (<code>change-log</code> is not <code>config</code>).</p></div>
<div class="exam"><p><b>Exam trap.</b> The severity is a <b>minimum</b>: notice includes warning, error and more serious. Remote logging is <code>syslog host</code>; local file is <code>syslog file</code>. Logs are read with <code>show log NAME</code>.</p></div>

<div class="scn"><h4>The commit nobody admitted to</h4><p>A branch lost a VLAN at 15:40. The syslog server held <code>UI_COMMIT: User 'ravi' requested 'commit' operation (comment: tidy up)</code> at 15:39:58 and a <code>config-changes</code> file recording the deleted VLAN. Ravi had forgotten; the log did not. The VLAN was restored in two minutes with <code>rollback 1</code>.</p><p><b>Lesson:</b> change-log and commit messages turn blame into facts and speed up recovery.</p></div>

<div class="iv"><p class="q">"How do you send logs to a remote server on Junos, and which levels?"</p><p><code>set system syslog host 10.70.1.50 any notice</code> sends all facilities at notice and above to the server over UDP 514, and I add <code>authorization info</code> for login events. I keep local files such as <code>messages</code> and <code>config-changes</code> as well, and verify arrival on the server rather than assuming.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each message has a facility and a severity; the configured severity is a minimum.</li>
<li>Destinations: <code>file</code>, <code>host</code>, <code>user</code> and <code>console</code>.</li>
<li>Remote syslog uses UDP 514; read local logs with <code>show log NAME</code>.</li>
<li>Commits log <code>UI_COMMIT</code> at notice level; <code>change-log</code> records configuration changes.</li>
<li>Prove remote logging by finding the message on the server.</li>
</ul></div>
`,hi:`
<p>Ek newspaper office socho. Alag departments (sport, politics, business) ke reporters stories bhejte hain. Editor tay karta hai kaunsi stories local edition mein (file), kaunsi head office ko (remote host), aur kaunsi front page screen par jaayein jo sabko dikhti hai (user terminals). Syslog bhi aise hi kaam karta hai: har message ka ek <b>facility</b> (kaunsa department) aur ek <b>severity</b> (kitna serious) hota hai, aur configuration batati hai har combination kahan jaata hai.</p>

<h3>Facility aur severity</h3>
<p><b>Facilities</b> events ki categories hain. Common: <code>any</code> (sab), <code>authorization</code> (logins), <code>change-log</code> (configuration changes), <code>interactive-commands</code> (CLI mein type kiye commands), <code>daemon</code> (system processes), <code>kernel</code>, <code>firewall</code>, <code>pfe</code>.</p>
<p><b>Severities</b>, sabse serious se kam tak:</p>
<table class="cmp"><tr><th>#</th><th>Severity</th><th>Matlab</th></tr>
<tr><td>0</td><td><code>emergency</code></td><td>system unusable</td></tr>
<tr><td>1</td><td><code>alert</code></td><td>turant action lo</td></tr>
<tr><td>2</td><td><code>critical</code></td><td>critical condition</td></tr>
<tr><td>3</td><td><code>error</code></td><td>error</td></tr>
<tr><td>4</td><td><code>warning</code></td><td>warning</td></tr>
<tr><td>5</td><td><code>notice</code></td><td>normal lekin significant (commits, link changes)</td></tr>
<tr><td>6</td><td><code>info</code></td><td>informational</td></tr></table>
<p><b>notice</b> severity wali destination notice aur usse <i>zyada serious</i> sab kuch (warning, error, critical, alert, emergency) receive karti hai. Level ek minimum hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Syslog destinations">
<rect x="10" y="70" width="140" height="60" rx="8" fill="#fde68a"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">Events</text><text x="80" y="113" text-anchor="middle" class="svg-muted" font-size="11">facility + severity</text>
<rect x="260" y="10" width="170" height="40" rx="8" fill="#bae6fd"/><text x="345" y="35" text-anchor="middle" class="svg-ink" font-size="12">file messages (/var/log)</text>
<rect x="260" y="60" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="345" y="85" text-anchor="middle" class="svg-ink" font-size="12">host 10.70.1.50 (UDP 514)</text>
<rect x="260" y="110" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="345" y="135" text-anchor="middle" class="svg-ink" font-size="12">user * (logged-in CLIs)</text>
<rect x="260" y="160" width="170" height="36" rx="8" fill="#fed7aa"/><text x="345" y="183" text-anchor="middle" class="svg-ink" font-size="12">console</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="150" y1="100" x2="260" y2="30"/><line x1="150" y1="100" x2="260" y2="80"/><line x1="150" y1="100" x2="260" y2="130"/><line x1="150" y1="100" x2="260" y2="178"/></g>
<text x="540" y="100" text-anchor="middle" class="svg-muted" font-size="12">har destination ke</text><text x="540" y="118" text-anchor="middle" class="svg-muted" font-size="12">apne filters hain</text>
</svg><p class="cap">Ek event stream, kai destinations, har ek ka apna facility aur severity filter.</p></div>

<h3>Destinations configure karna</h3>
<pre class="code">set system syslog file messages any notice
set system syslog file messages authorization info
set system syslog file config-changes change-log info
set system syslog file interactive-commands interactive-commands any
set system syslog host 10.70.1.50 any notice
set system syslog host 10.70.1.50 authorization info
set system syslog user * any emergency
set system syslog console any critical</pre>
<table class="cmp"><tr><th>Destination</th><th>Kahan jaata hai</th><th>Kaise padhein</th></tr>
<tr><td><code>file NAME</code></td><td>router par /var/log/NAME</td><td><code>show log NAME</code></td></tr>
<tr><td><code>host IP</code></td><td>remote syslog server, UDP 514</td><td>server par</td></tr>
<tr><td><code>user NAME</code> ya <code>*</code></td><td>logged-in users ke terminals</td><td>screen par</td></tr>
<tr><td><code>console</code></td><td>serial console</td><td>console cable</td></tr></table>
<p>Useful options: <code>archive size 1m files 5</code> file ki rotation control karta hai, <code>source-address 10.255.70.1</code> remote host tak pahunchne ka address tay karta hai (server ko accept karna hoga), aur <code>match "UI_COMMIT"</code> regular expression se messages filter karta hai.</p>

<h3>Logs padhna</h3>
<pre class="code">lab@NK-CHN-EDGE&gt; show log messages | last 5
Oct  1 10:02:11 NK-CHN-EDGE mgd[1203]: UI_COMMIT: User 'lab' requested 'commit' operation
Oct  1 10:02:12 NK-CHN-EDGE mgd[1203]: UI_COMMIT_COMPLETED: commit complete
lab@NK-CHN-EDGE&gt; show log config-changes
Oct  1 10:02:11 NK-CHN-EDGE mgd[1203]: UI_CFG_AUDIT_OTHER: User 'lab' set: [system ntp server 10.70.1.50]
lab@NK-CHN-EDGE&gt; show log messages | match UI_COMMIT
lab@NK-CHN-EDGE&gt; monitor start messages
lab@NK-CHN-EDGE&gt; monitor stop</pre>
<p>Har commit <b>notice</b> level par <code>UI_COMMIT</code> message banata hai, isliye woh <code>messages</code> mein dikhta hai aur notice ya usse kam severity wale remote host ko bheja jaata hai. Aise aap saabit karte ho ki commit server tak pahuncha.</p>

<h3>Lab walkthrough: Chennai edge, syslog wala hissa</h3>
<p>NK-CHN-EDGE (ge-0/0/0 par 10.70.1.1/24, switch SW ke through OPS 10.70.1.50) sirf apni disk par log karta hai. Zaroori: any-facility notice messages aur authorization info messages 10.70.1.50 ko bhejo, local change log rakho, aur saabit karo ki chal raha hai.</p>
<pre class="code">lab@NK-CHN-EDGE# set system syslog host 10.70.1.50 any notice
lab@NK-CHN-EDGE# set system syslog host 10.70.1.50 authorization info
lab@NK-CHN-EDGE# set system syslog file config-changes change-log info
lab@NK-CHN-EDGE# commit
lab@NK-CHN-EDGE# run show log config-changes</pre>
<p>Phir NK-OPS par <code>show syslog</code> receive hue messages list karta hai, jisme <code>NK-CHN-EDGE ... UI_COMMIT</code> jaisi line hogi. Yeh ek line poora path saabit karti hai: commit, notice level, network reachability, UDP 514 aur server.</p>

<div class="eg"><p><b>Worked example.</b> 02:14 par link flap hota hai. <code>messages any notice</code> ke saath <code>SNMP_TRAP_LINK_DOWN</code> aur <code>ge-0/0/1: link down</code> router par aur syslog host par dikhte hain. <code>show log messages | match ge-0/0/1</code> poori timeline dikhata hai: 02:14:07 par down, 02:14:31 par up.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Har jagah severity <code>info</code> ya <code>any any</code> rakhna, jo disk bhar deta hai aur server par flood karta hai; yeh bhool jaana ki host ko syslog UDP hai, isliye lost packets retransmit nahi hote; aise host ko logs bhejna jiske paas route wapas nahi ya jo UDP 514 filter karta hai; galat facility naam (<code>change-log</code> aur <code>config</code> alag hain).</p></div>
<div class="exam"><p><b>Exam trap.</b> Severity ek <b>minimum</b> hai: notice mein warning, error aur zyada serious shamil hain. Remote logging <code>syslog host</code> hai; local file <code>syslog file</code>. Logs <code>show log NAME</code> se padhe jaate hain.</p></div>

<div class="scn"><h4>Woh commit jo kisi ne maana nahi</h4><p>Ek branch ne 15:40 par ek VLAN kho diya. Syslog server mein 15:39:58 par <code>UI_COMMIT: User 'ravi' requested 'commit' operation (comment: tidy up)</code> aur <code>config-changes</code> file mein delete hua VLAN record tha. Ravi bhool gaya tha; log nahi bhoola. VLAN <code>rollback 1</code> se do minute mein wapas aa gaya.</p><p><b>Lesson:</b> change-log aur commit messages blame ko facts mein badalte hain aur recovery tez karte hain.</p></div>

<div class="iv"><p class="q">"Junos par remote server ko logs kaise bhejte ho, aur kaunse levels?"</p><p><code>set system syslog host 10.70.1.50 any notice</code> saari facilities ko notice aur usse upar UDP 514 par server ko bhejta hai, aur login events ke liye <code>authorization info</code> jodta hoon. Local files jaise <code>messages</code> aur <code>config-changes</code> bhi rakhta hoon, aur assume karne ki jagah server par arrival verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har message ka facility aur severity hota hai; configured severity minimum hai.</li>
<li>Destinations: <code>file</code>, <code>host</code>, <code>user</code> aur <code>console</code>.</li>
<li>Remote syslog UDP 514; local logs <code>show log NAME</code> se.</li>
<li>Commits notice level par <code>UI_COMMIT</code> log karte hain; <code>change-log</code> configuration changes record karta hai.</li>
<li>Remote logging saabit karne ke liye server par message dhoondho.</li>
</ul></div>
`}};export{e as default};