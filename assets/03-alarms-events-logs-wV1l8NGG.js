var e={id:`alarms-events-logs`,h:{en:`Alarms, events, audit logs, syslog and SNMP`,hi:`Alarms, events, audit logs, syslog aur SNMP`},body:{en:`
<p>A car has a dashboard with warning lights. When the oil light comes on you do not need the full engine log; you know to stop. Behind the lights, the car records many small readings (temperature crossed a limit, door opened). A mechanic reads those records later. The Manager works the same way. <b>Events</b> are the raw readings. <b>Alarms</b> are the warning lights that the Manager builds from related events. The <b>audit log</b> is the record of who touched the car.</p>

<h3>Events and alarms</h3>
<ul>
<li><b>Events</b> are notifications that devices send to the Manager: a control connection changed state, a BFD session went down, an interface changed state, a user logged in. They can also be forwarded as <b>SNMP traps</b> and <b>syslog messages</b>. Typical event names include <code>control-connection-state-change</code>, <code>bfd-state-change</code>, <code>interface-state-change</code> and <code>system-login-change</code>.</li>
<li><b>Alarms</b> are produced when the Manager <b>filters and correlates</b> events. Several related events become one alarm, and redundant ones are suppressed, so the NOC sees one entry for a link failure instead of twenty. The <i>Related Event</i> column links an alarm back to its events.</li>
</ul>
<p>Alarms have four <b>severities</b> in the Manager:</p>
<table class="cmp"><tr><th>Severity</th><th>Colour</th><th>Meaning</th><th>Example</th></tr>
<tr><td>Critical</td><td>Red</td><td>Impairs or shuts down an overlay network function</td><td>All control connections of a controller down</td></tr>
<tr><td>Major</td><td>Yellow</td><td>Serious, affects but does not shut down a function</td><td>A site lost one WAN circuit</td></tr>
<tr><td>Medium</td><td>Blue</td><td>Might impair performance of a function</td><td>High CPU on an edge</td></tr>
<tr><td>Minor</td><td>Green</td><td>Might diminish performance</td><td>A single interface flap</td></tr></table>
<p>An alarm can be <b>acknowledged</b> (marked viewed) so that the team knows someone is on it, and it is cleared when the underlying condition resolves. The REST API can also mark alarms as viewed.</p>

<h3>Where to look in the Manager</h3>
<ul>
<li><b>Monitor &gt; Logs &gt; Alarms</b>: the live list, with filters for severity, device and time.</li>
<li><b>Monitor &gt; Logs &gt; Events</b>: all raw event notifications.</li>
<li><b>Monitor &gt; Logs &gt; Audit Log</b>: every administrative action in the Manager, such as logins, template attachments, policy activations and certificate changes, with the user and time. It answers "who changed it, when?".</li>
<li><b>Monitor &gt; Logs &gt; ACL Log</b>: log entries from access lists configured with logging.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Events, alarms and notifications flow">
<rect x="10" y="80" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="12">events</text>
<rect x="160" y="60" width="150" height="110" rx="8" fill="#bae6fd"/><text x="235" y="86" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN Manager</text><text x="235" y="108" text-anchor="middle" class="svg-muted" font-size="12">filter, correlate</text><text x="235" y="126" text-anchor="middle" class="svg-muted" font-size="12">events to alarms</text><text x="235" y="144" text-anchor="middle" class="svg-muted" font-size="12">audit log</text>
<rect x="360" y="10" width="140" height="44" rx="8" fill="#fde68a"/><text x="430" y="37" text-anchor="middle" class="svg-ink" font-size="13">Email, throttled</text>
<rect x="360" y="64" width="140" height="44" rx="8" fill="#fde68a"/><text x="430" y="91" text-anchor="middle" class="svg-ink" font-size="13">Webhook</text>
<rect x="360" y="118" width="140" height="44" rx="8" fill="#fde68a"/><text x="430" y="145" text-anchor="middle" class="svg-ink" font-size="13">Syslog server</text>
<rect x="360" y="172" width="140" height="44" rx="8" fill="#fde68a"/><text x="430" y="199" text-anchor="middle" class="svg-ink" font-size="13">SNMP trap receiver</text>
<rect x="540" y="80" width="90" height="70" rx="8" fill="#ddd6fe"/><text x="585" y="112" text-anchor="middle" class="svg-ink" font-size="13">NOC</text><text x="585" y="130" text-anchor="middle" class="svg-muted" font-size="12">people, tools</text>
<line x1="120" y1="115" x2="160" y2="115" stroke="#64748b" stroke-width="2"/><line x1="310" y1="100" x2="360" y2="32" stroke="#64748b" stroke-width="2"/><line x1="310" y1="110" x2="360" y2="86" stroke="#64748b" stroke-width="2"/><line x1="310" y1="125" x2="360" y2="140" stroke="#64748b" stroke-width="2"/><line x1="310" y1="140" x2="360" y2="194" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="32" x2="540" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="500" y1="86" x2="540" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="500" y1="140" x2="540" y2="125" stroke="#64748b" stroke-width="1.5"/><line x1="500" y1="194" x2="540" y2="140" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Devices send events; the Manager turns them into alarms and fans them out to people and tools.</p></div>

<h3>Notifications: email and webhooks</h3>
<p>Nobody stares at the alarm list all day, so push notifications to where people already are:</p>
<ul>
<li><b>Email.</b> Configure the SMTP server in <b>Administration &gt; Settings</b>, then create an alarm notification choosing the severities, the alarm types and the recipients. Set <b>throttling</b> (a limit of 1 to 30 emails per minute) so an outage with hundreds of alarms does not flood the mailbox.</li>
<li><b>Webhooks.</b> The Manager can post to Slack, Webex or any custom endpoint, with authentication, and you choose the VPN used to reach it: the transport VPN 0 or the management VPN 512. Use this for the NOC channel or an ITSM tool.</li>
</ul>
<p>Good practice: send Critical and Major to the on-call channel, Medium and Minor to a daily digest.</p>

<h3>Syslog</h3>
<p>There are two logging stories. <b>Device syslog</b>: each device writes logs locally (on a Linux-based controller these are files in <code>/var/log</code> such as <code>auth.log</code>, <code>messages</code> and <code>vsyslog</code>, with a default disk logging priority of <i>error</i>) and can forward to a central syslog server, configured with the <b>Cisco Logging</b> feature template (or the equivalent configuration group item). <b>Manager audit log</b>: stored under <code>/var/log/nms</code> in files of 16 MB by default, rotated daily and kept as 10 files. For compliance, forward syslog to a central collector or SIEM; local logs rotate away.</p>

<h3>SNMP</h3>
<p>SNMP lets an existing monitoring system (an NMS) poll devices and receive traps. Catalyst SD-WAN supports <b>SNMPv1, v2c and v3</b>; <b>v3 is recommended</b> because it authenticates and encrypts. Facts to remember:</p>
<ul>
<li>It is configured with the <b>Cisco SNMP</b> feature template (Configuration &gt; Templates &gt; Additional Templates) or with the standard <code>snmp-server</code> commands on IOS XE devices. A device template can hold only one SNMP template (v2 or v3).</li>
<li>Access is <b>read-only</b>; write operations are not permitted.</li>
<li>Traps include <b>certificate expiry</b> notifications, <b>health monitoring</b> (CPU, memory, disk) and, on IOS XE devices from release 17.11.1a, <b>application-route SLA change</b> traps.</li>
<li>The trap target is reached through a service VPN (not 512), because SNMP is a service-side function.</li>
<li>MD5 authentication is deprecated; use SHA.</li>
</ul>
<pre class="code"><span class="c">! IOS XE: SNMPv3 read-only access and traps to the NMS (secrets are placeholders)</span>
snmp-server view NK-VIEW iso included
snmp-server group NK-GRP v3 priv read NK-VIEW
snmp-server user nk-mon NK-GRP v3 auth sha AUTH_SECRET priv aes 128 PRIV_SECRET
snmp-server host 198.51.100.60 version 3 priv nk-mon</pre>

<div class="eg"><p><b>Worked example.</b> At 03:12 the Pune edge loses its MPLS circuit. Events: interface-state-change (GigabitEthernet2 down), bfd-state-change (three sessions down), control connection unaffected. The Manager correlates them into one Major alarm "BFD sessions down" for site 300. Email throttling sends one mail to the on-call group; the webhook posts to the NOC channel; the SNMP trap lands in the existing NMS. The on-call engineer acknowledges the alarm at 03:15. At 04:40 the provider restores the circuit, the BFD sessions come up, and the alarm clears. The audit log shows nothing, because nobody changed anything; that fact helps the incident review.</p></div>

<div class="warn"><p><b>Common mistake.</b> Alarm email without throttling or filtering. During a large outage the NOC mailbox gets thousands of messages and people filter them all away. Another common mistake is relying on local logs, which rotate, instead of a central syslog collector.</p></div>

<div class="exam"><p><b>Exam trap.</b> Alarms come from correlated events and have four severities (Critical, Major, Medium, Minor). Webhooks reach Slack, Webex or custom endpoints through VPN 0 or VPN 512. SNMP is read-only and v3 is recommended. The audit log records administrative actions.</p></div>

<div class="scn"><h4>Who changed the policy?</h4><p>On a Tuesday afternoon, voice traffic at several sites began using the internet instead of MPLS. The engineer opened Monitor &gt; Logs &gt; Audit Log and found that user "noc-trainee" had activated a new centralized policy at 14:02. The audit entry showed the policy name and the time. The previous policy was re-activated and the paths returned to normal within minutes. A custom user group without policy write permission was then created for trainees.</p><p><b>Lesson:</b> the audit log answers "who and when"; RBAC prevents the next one.</p></div>

<div class="iv"><p class="q">"What is the difference between an event and an alarm in the Manager?"</p><p>Events are the raw notifications that devices send, such as a BFD state change; they can also become syslog messages and SNMP traps. Alarms are created by the Manager from filtered and correlated events, so that related events form one entry with a severity of Critical, Major, Medium or Minor. I send alarms by email with throttling, by webhook to the NOC channel and by syslog or SNMP to the central tools, and I use the audit log to see who made changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Events are raw; alarms are correlated and have four severities.</li>
<li>Monitor &gt; Logs holds Alarms, Events, Audit Log and ACL Log.</li>
<li>Notify by email (with throttling) and webhooks (Slack, Webex, custom).</li>
<li>Send syslog to a central collector; the Manager audit log is in <code>/var/log/nms</code>.</li>
<li>SNMP v1, v2c, v3 (v3 recommended), read-only; traps include certificate expiry and health.</li>
</ul></div>
`,hi:`
<p>Car ke dashboard mein warning lights hoti hain. Jab oil light jalti hai to aapko poora engine log nahi chahiye; aap jaante ho ki rukna hai. Lights ke peeche car kai chhote readings record karti hai (temperature limit paar hua, door khula). Mechanic baad mein woh records padhta hai. Manager bhi aise hi kaam karta hai. <b>Events</b> raw readings hain. <b>Alarms</b> warning lights hain jo Manager related events se banata hai. <b>Audit log</b> record hai ki car ko kisne chhua.</p>

<h3>Events aur alarms</h3>
<ul>
<li><b>Events</b> woh notifications hain jo devices Manager ko bhejte hain: control connection ka state badla, BFD session down hua, interface ka state badla, user login hua. Inhe <b>SNMP traps</b> aur <b>syslog messages</b> ke roop mein bhi forward kiya ja sakta hai. Typical event names: <code>control-connection-state-change</code>, <code>bfd-state-change</code>, <code>interface-state-change</code> aur <code>system-login-change</code>.</li>
<li><b>Alarms</b> tab bante hain jab Manager events ko <b>filter aur correlate</b> karta hai. Kai related events ek alarm ban jaate hain, aur redundant suppress ho jaate hain, isliye NOC ko link failure ke liye bees ki jagah ek entry dikhti hai. <i>Related Event</i> column alarm ko uske events se jodta hai.</li>
</ul>
<p>Manager mein alarms ki chaar <b>severities</b> hain:</p>
<table class="cmp"><tr><th>Severity</th><th>Rang</th><th>Matlab</th><th>Example</th></tr>
<tr><td>Critical</td><td>Laal</td><td>Overlay network function ko impair ya shut down karta hai</td><td>Controller ke saare control connections down</td></tr>
<tr><td>Major</td><td>Peela</td><td>Serious, function ko affect karta hai lekin band nahi</td><td>Site ne ek WAN circuit kho diya</td></tr>
<tr><td>Medium</td><td>Neela</td><td>Function ki performance impair kar sakta hai</td><td>Edge par high CPU</td></tr>
<tr><td>Minor</td><td>Hara</td><td>Performance kam kar sakta hai</td><td>Ek interface flap</td></tr></table>
<p>Alarm ko <b>acknowledge</b> (viewed mark) kiya ja sakta hai taaki team ko pata ho koi us par hai, aur underlying condition theek hone par woh clear ho jaata hai. REST API bhi alarms ko viewed mark kar sakta hai.</p>

<h3>Manager mein kahan dekhein</h3>
<ul>
<li><b>Monitor &gt; Logs &gt; Alarms</b>: live list, severity, device aur time ke filters ke saath.</li>
<li><b>Monitor &gt; Logs &gt; Events</b>: saare raw event notifications.</li>
<li><b>Monitor &gt; Logs &gt; Audit Log</b>: Manager mein har administrative action, jaise logins, template attachments, policy activations aur certificate changes, user aur time ke saath. Yeh jawab deta hai "kisne badla, kab?"</li>
<li><b>Monitor &gt; Logs &gt; ACL Log</b>: logging ke saath configured access lists ki log entries.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Events, alarms aur notifications ka flow">
<rect x="10" y="80" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="65" y="108" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="65" y="126" text-anchor="middle" class="svg-muted" font-size="12">events</text>
<rect x="160" y="60" width="150" height="110" rx="8" fill="#bae6fd"/><text x="235" y="86" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN Manager</text><text x="235" y="108" text-anchor="middle" class="svg-muted" font-size="12">filter, correlate</text><text x="235" y="126" text-anchor="middle" class="svg-muted" font-size="12">events se alarms</text><text x="235" y="144" text-anchor="middle" class="svg-muted" font-size="12">audit log</text>
<rect x="360" y="10" width="140" height="44" rx="8" fill="#fde68a"/><text x="430" y="37" text-anchor="middle" class="svg-ink" font-size="13">Email, throttled</text>
<rect x="360" y="64" width="140" height="44" rx="8" fill="#fde68a"/><text x="430" y="91" text-anchor="middle" class="svg-ink" font-size="13">Webhook</text>
<rect x="360" y="118" width="140" height="44" rx="8" fill="#fde68a"/><text x="430" y="145" text-anchor="middle" class="svg-ink" font-size="13">Syslog server</text>
<rect x="360" y="172" width="140" height="44" rx="8" fill="#fde68a"/><text x="430" y="199" text-anchor="middle" class="svg-ink" font-size="13">SNMP trap receiver</text>
<rect x="540" y="80" width="90" height="70" rx="8" fill="#ddd6fe"/><text x="585" y="112" text-anchor="middle" class="svg-ink" font-size="13">NOC</text><text x="585" y="130" text-anchor="middle" class="svg-muted" font-size="12">log, tools</text>
<line x1="120" y1="115" x2="160" y2="115" stroke="#64748b" stroke-width="2"/><line x1="310" y1="100" x2="360" y2="32" stroke="#64748b" stroke-width="2"/><line x1="310" y1="110" x2="360" y2="86" stroke="#64748b" stroke-width="2"/><line x1="310" y1="125" x2="360" y2="140" stroke="#64748b" stroke-width="2"/><line x1="310" y1="140" x2="360" y2="194" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="32" x2="540" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="500" y1="86" x2="540" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="500" y1="140" x2="540" y2="125" stroke="#64748b" stroke-width="1.5"/><line x1="500" y1="194" x2="540" y2="140" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Devices events bhejte hain; Manager unhe alarms mein badalta hai aur logon aur tools tak pahunchata hai.</p></div>

<h3>Notifications: email aur webhooks</h3>
<p>Alarm list ko koi din bhar nahi ghurta, isliye notifications wahan bhejo jahan log pehle se hain:</p>
<ul>
<li><b>Email.</b> <b>Administration &gt; Settings</b> mein SMTP server configure karo, phir alarm notification banao jisme severities, alarm types aur recipients chuno. <b>Throttling</b> set karo (1 se 30 emails per minute ki limit) taaki saikdon alarms wale outage mein mailbox na bhar jaaye.</li>
<li><b>Webhooks.</b> Manager Slack, Webex ya kisi bhi custom endpoint par post kar sakta hai, authentication ke saath, aur aap tay karte ho ki use pahunchne ke liye kaunsa VPN: transport VPN 0 ya management VPN 512. NOC channel ya ITSM tool ke liye use karo.</li>
</ul>
<p>Achhi practice: Critical aur Major on-call channel ko, Medium aur Minor daily digest ko.</p>

<h3>Syslog</h3>
<p>Logging ki do kahaniyan hain. <b>Device syslog</b>: har device logs local likhta hai (Linux-based controller par yeh <code>/var/log</code> ki files hain jaise <code>auth.log</code>, <code>messages</code> aur <code>vsyslog</code>, disk logging ki default priority <i>error</i> ke saath) aur central syslog server ko forward kar sakta hai, jo <b>Cisco Logging</b> feature template (ya configuration group ke equivalent item) se configure hota hai. <b>Manager audit log</b>: <code>/var/log/nms</code> ke neeche, default 16 MB ki files mein, roz rotate hota hai aur 10 files rakhta hai. Compliance ke liye syslog ko central collector ya SIEM ko forward karo; local logs rotate hoke chale jaate hain.</p>

<h3>SNMP</h3>
<p>SNMP se maujooda monitoring system (NMS) devices ko poll kar sakta hai aur traps receive kar sakta hai. Catalyst SD-WAN <b>SNMPv1, v2c aur v3</b> support karta hai; <b>v3 recommended hai</b> kyunki woh authenticate aur encrypt karta hai. Yaad rakhne wali baatein:</p>
<ul>
<li>Yeh <b>Cisco SNMP</b> feature template (Configuration &gt; Templates &gt; Additional Templates) se ya IOS XE devices par standard <code>snmp-server</code> commands se configure hota hai. Ek device template mein sirf ek SNMP template ho sakta hai (v2 ya v3).</li>
<li>Access <b>read-only</b> hai; write operations allowed nahi.</li>
<li>Traps mein <b>certificate expiry</b> notifications, <b>health monitoring</b> (CPU, memory, disk) aur IOS XE devices par release 17.11.1a se <b>application-route SLA change</b> traps shamil hain.</li>
<li>Trap target service VPN (512 nahi) se pahuncha jaata hai, kyunki SNMP service-side function hai.</li>
<li>MD5 authentication deprecated hai; SHA use karo.</li>
</ul>
<pre class="code"><span class="c">! IOS XE: SNMPv3 read-only access aur NMS ko traps (secrets placeholders hain)</span>
snmp-server view NK-VIEW iso included
snmp-server group NK-GRP v3 priv read NK-VIEW
snmp-server user nk-mon NK-GRP v3 auth sha AUTH_SECRET priv aes 128 PRIV_SECRET
snmp-server host 198.51.100.60 version 3 priv nk-mon</pre>

<div class="eg"><p><b>Worked example.</b> 03:12 baje Pune edge apna MPLS circuit kho deta hai. Events: interface-state-change (GigabitEthernet2 down), bfd-state-change (teen sessions down), control connection prabhavit nahi. Manager unhe site 300 ke liye ek Major alarm "BFD sessions down" mein correlate karta hai. Email throttling on-call group ko ek mail bhejti hai; webhook NOC channel mein post karta hai; SNMP trap maujooda NMS mein pahunchta hai. On-call engineer 03:15 par alarm acknowledge karta hai. 04:40 par provider circuit restore karta hai, BFD sessions up ho jaate hain, aur alarm clear ho jaata hai. Audit log kuch nahi dikhata, kyunki kisi ne kuch badla nahi; yeh fact incident review mein madad karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Bina throttling ya filtering ke alarm email. Bade outage mein NOC mailbox mein hazaron messages aate hain aur log sabko filter karke hata dete hain. Ek aur aam galti hai central syslog collector ki jagah local logs par nirbhar rehna, jo rotate ho jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Alarms correlated events se aate hain aur chaar severities (Critical, Major, Medium, Minor) rakhte hain. Webhooks Slack, Webex ya custom endpoints tak VPN 0 ya VPN 512 se pahunchte hain. SNMP read-only hai aur v3 recommended hai. Audit log administrative actions record karta hai.</p></div>

<div class="scn"><h4>Policy kisne badli?</h4><p>Ek Tuesday dopahar kai sites par voice traffic MPLS ki jagah internet use karne laga. Engineer ne Monitor &gt; Logs &gt; Audit Log kholaa aur dekha ki user "noc-trainee" ne 14:02 par ek naya centralized policy activate kiya. Audit entry ne policy ka naam aur time dikhaya. Pehli policy dobara activate ki gayi aur paths kuch minute mein normal ho gaye. Phir trainees ke liye ek custom user group banaya gaya jisme policy write permission nahi thi.</p><p><b>Lesson:</b> audit log jawab deta hai "kisne aur kab"; RBAC agla rokta hai.</p></div>

<div class="iv"><p class="q">"Manager mein event aur alarm mein kya fark hai?"</p><p>Events woh raw notifications hain jo devices bhejte hain, jaise BFD state change; inhe syslog messages aur SNMP traps bhi banaya ja sakta hai. Alarms Manager filtered aur correlated events se banata hai, taaki related events ek entry banein jiski severity Critical, Major, Medium ya Minor ho. Main alarms ko throttling ke saath email se, NOC channel ko webhook se aur central tools ko syslog ya SNMP se bhejta hoon, aur audit log se dekhta hoon ki changes kisne kiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Events raw hain; alarms correlated hain aur unki chaar severities hain.</li>
<li>Monitor &gt; Logs mein Alarms, Events, Audit Log aur ACL Log hain.</li>
<li>Email (throttling ke saath) aur webhooks (Slack, Webex, custom) se notify karo.</li>
<li>Syslog central collector ko bhejo; Manager audit log <code>/var/log/nms</code> mein hai.</li>
<li>SNMP v1, v2c, v3 (v3 recommended), read-only; traps mein certificate expiry aur health shamil.</li>
</ul></div>
`}};export{e as default};