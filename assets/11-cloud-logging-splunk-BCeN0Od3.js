var e={id:`logging-splunk`,h:{en:`Cloud logging and monitoring: audit logs into Splunk with HEC`,hi:`Cloud logging aur monitoring: HEC se audit logs Splunk mein`},body:{en:`
<p>A bank vault has a visitor register at the door: who came in, at what time, which locker they opened. If a thief can tear out the last page of the register, nobody can prove what happened. Cloud <b>audit logs</b> are that register for your cloud account, and an attacker's favourite move after getting in is to delete it. Your job is to copy every page, as it is written, to a place the attacker cannot reach: the SIEM.</p>

<h3>What to collect</h3>
<table class="cmp"><tr><th>Log type</th><th>Answers</th><th>Examples</th></tr>
<tr><td><b>Control-plane audit</b></td><td>Who changed what, from where, with which identity</td><td>CloudTrail-style trails, Azure Activity Log, Google Cloud Audit Logs</td></tr>
<tr><td><b>Data access</b></td><td>Who read or wrote which object</td><td>Storage data events, database audit</td></tr>
<tr><td><b>Network</b></td><td>Which IPs talked, on which ports, allowed or rejected</td><td>VPC/VNet flow logs, firewall and gateway logs</td></tr>
<tr><td><b>Identity</b></td><td>Sign-ins, MFA, risky logins</td><td>IdP and SSO logs, Duo</td></tr>
<tr><td><b>Application and edge</b></td><td>Requests, attacks blocked</td><td>Load balancer, WAF, API gateway logs</td></tr>
<tr><td><b>Platform</b></td><td>Cluster and SaaS activity</td><td>Kubernetes audit, SaaS audit, SSE logs from Secure Access</td></tr>
</table>
<p>Good practice: an <b>organisation-wide</b> trail for all accounts and regions; logs delivered to a separate, locked <b>log-archive account</b> with immutable (write-once) storage and integrity validation; retention that meets regulation; and an alert the moment logging is stopped or deleted.</p>

<h3>Ways into Splunk</h3>
<ul>
<li><b>Add-ons</b> that pull from provider APIs or storage queues and assign the right sourcetypes.</li>
<li><b>Universal Forwarder</b> on hosts, sending to indexers on <b>TCP 9997</b>.</li>
<li><b>HTTP Event Collector (HEC)</b>: senders <b>push</b> JSON over HTTPS to <b>TCP 8088</b>. Used by streaming services, serverless functions, log forwarders and Kubernetes collectors.</li>
<li><b>Syslog</b> (UDP/TCP 514), usually through a syslog collector.</li>
</ul>
<p>An HEC <b>token</b> authenticates the sender and fixes the default <b>index</b> and <b>sourcetype</b>. The sender posts to <code>/services/collector/event</code> with the header <code>Authorization: Splunk &lt;token&gt;</code>. Correct sourcetypes let add-ons map fields to the <b>Common Information Model (CIM)</b>, so the same detection works for every vendor.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Lab 2 topology">
<rect x="10" y="60" width="150" height="60" rx="8" fill="#fde68a"/><text x="85" y="85" text-anchor="middle" class="svg-ink" font-size="13">NK Cloud trail</text><text x="85" y="105" text-anchor="middle" class="svg-muted" font-size="12">account nk-prod</text>
<rect x="230" y="60" width="150" height="60" rx="8" fill="#bae6fd"/><text x="305" y="85" text-anchor="middle" class="svg-ink" font-size="13">FWD</text><text x="305" y="105" text-anchor="middle" class="svg-muted" font-size="12">10.50.1.30</text>
<rect x="460" y="60" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="13">SPLUNK</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="12">10.50.1.20 HEC 8088</text>
<line x1="160" y1="90" x2="230" y2="90" stroke="#64748b" stroke-width="2"/><line x1="380" y1="90" x2="460" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="420" y="80" text-anchor="middle" class="svg-accent" font-size="12">HTTPS POST</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">token nkcloud-audit: index cloud, sourcetype nkcloud:cloudtrail</text>
</svg><p class="cap">Lab 2: the forwarder pushes the account's audit trail to Splunk through HEC.</p></div>

<h3>Lab 2, step by step</h3>
<p><b>1. Enable HEC.</b> In SPLUNK go to <b>Settings &gt; Data inputs &gt; HTTP Event Collector &gt; Global Settings</b> and set <b>All Tokens</b> to Enabled (SSL on, port 8088). Until then TCP 8088 refuses connections.</p>
<p><b>2. Create the token.</b> <b>New Token</b>: name <code>nkcloud-audit</code>, source type <code>nkcloud:cloudtrail</code>, default index <code>cloud</code>, then <b>Review and Submit</b> and copy the token value.</p>
<p><b>3. Start the forwarder on FWD.</b></p>
<pre class="code">FWD&gt; forwarder set url h&#116;tps://10.50.1.20:8088
FWD&gt; forwarder set token &lt;token value&gt;
FWD&gt; forwarder status
FWD&gt; forwarder start</pre>
<pre class="out">cloud-log-forwarder 3.2 (NK Cloud audit trail → Splunk HEC)
  url   : h&#116;tps://10.50.1.20:8088
  token : 3fa1b2c4…
  queue : 6 audit events from account nk-prod waiting
  sent  : 0

Sent 6 events to h&#116;tps://10.50.1.20:8088/services/collector/event → <span class="hl">HTTP 200 {"text":"Success","code":0}</span></pre>
<p>You can test HEC by hand with curl from any host; the same header and JSON shape apply:</p>
<pre class="code">curl -k h&#116;tps://10.50.1.20:8088/services/collector/event -H "Authorization: Splunk &lt;token&gt;" -d '{"event": {"msg": "nk-sim test"}, "sourcetype": "nkcloud:cloudtrail"}'</pre>

<p><b>4. Hunt with SPL.</b> In <b>Search &amp; Reporting</b>, always name the index, because searches without <code>index=</code> look only in the default index.</p>
<pre class="code">index=cloud sourcetype=nkcloud:cloudtrail eventName=DeleteTrail
index=cloud sourceIPAddress=185.220.101.7 | stats count by eventName</pre>
<pre class="out">2026-09-29T03:45:37Z  eventName=DeleteTrail  eventSource=audit.nkcloud.example
  <span class="hl">userIdentity.userName=dev-ci-bot</span>  sourceIPAddress=185.220.101.7  requestParameters.name=org-audit-trail

eventName      count
ConsoleLogin   2
DeleteTrail    1
PutBucketAcl   1          <span class="hl">total from 185.220.101.7 = 4</span></pre>

<div class="eg"><p><b>Worked example: the timeline.</b> 03:42:19 failed console login for dev-ci-bot without MFA; 03:42:55 successful login; 03:44:02 PutBucketAcl makes nk-payroll-exports public-read; 03:45:37 DeleteTrail removes org-audit-trail. Six minutes from first attempt to covering tracks. Because the forwarder had already copied the events to Splunk, deleting the trail in the cloud did not delete the evidence. This is exactly the change Lab 1 fixed from the posture side.</p></div>

<h3>Detections worth building first</h3>
<ul>
<li>Audit logging stopped or deleted (DeleteTrail, StopLogging and equivalents).</li>
<li>Console login without MFA, or by a service identity.</li>
<li>Storage ACL or policy changed to public.</li>
<li>Security group opened to 0.0.0.0/0 on admin ports.</li>
<li>New access keys for privileged users; API calls from new countries or anonymising networks.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Searching without <code>index=cloud</code> and concluding "no data". Using one token for every source, so you cannot revoke one sender. Sending to port 9997 or 514 instead of 8088. Pasting the token name instead of the token value.</p></div>
<div class="exam"><p><b>Exam traps.</b> HEC = TCP 8088, HTTPS, token in the header <code>Authorization: Splunk &lt;token&gt;</code>. 9997 = forwarder to indexer. The token sets the default index and sourcetype. Control-plane audit logs answer "who did what"; flow logs answer "who talked to whom".</p></div>

<div class="scn"><h4>The trail that was deleted, and the copy that was not</h4><p>A SaaS start-up noticed a public bucket during a routine posture review. When they opened the cloud console to find who changed it, the audit trail had been deleted the same night. Fortunately, three months earlier, the SOC had connected the trail to Splunk through HEC with a dedicated token. One SPL search showed a service identity logging in from an anonymising network without MFA, changing the ACL and deleting the trail. They disabled the identity, rotated its keys, re-enabled logging with a guardrail that forbids deleting it, and added an alert on any future DeleteTrail.</p><p><b>Lesson:</b> logs that stay only in the account the attacker controls are not evidence. Ship them out continuously.</p></div>

<div class="iv"><p class="q">"How would you get cloud audit logs into Splunk, and what would you alert on first?"</p><p>Describe the path: org-wide audit trail, then either the provider add-on pulling from storage/queues or a push through HEC on 8088 with a dedicated token per source that sets index and sourcetype; CIM-compliant sourcetypes. Protect the logs in a separate archive account with immutable storage. First alerts: logging disabled, console login without MFA or by a bot, public storage changes, admin ports opened to the internet.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Collect control-plane audit, data access, flow, identity, edge and platform logs.</li>
<li>Org-wide trails into a separate immutable log archive; alert when logging stops.</li>
<li>HEC: HTTPS on TCP 8088, token in the Authorization: Splunk header, token sets index and sourcetype.</li>
<li>Always search with index=; use stats count by to summarise.</li>
<li>In Lab 2, dev-ci-bot deleted the trail and 185.220.101.7 produced 4 events.</li>
</ul></div>
`,hi:`
<p>Bank vault ke darwaze par visitor register hota hai: kaun aaya, kis time, kaunsa locker khola. Agar chor register ka aakhri page phaad de, to koi prove nahi kar sakta ki kya hua. Cloud <b>audit logs</b> aapke cloud account ka wahi register hain, aur andar aane ke baad attacker ka favourite move use delete karna hota hai. Aapka kaam har page ko, jaise hi likha jaaye, aisi jagah copy karna hai jahan attacker na pahunch sake: SIEM.</p>

<h3>Kya collect karna hai</h3>
<table class="cmp"><tr><th>Log type</th><th>Kis sawaal ka jawab</th><th>Examples</th></tr>
<tr><td><b>Control-plane audit</b></td><td>Kisne kya badla, kahan se, kis identity se</td><td>CloudTrail-style trails, Azure Activity Log, Google Cloud Audit Logs</td></tr>
<tr><td><b>Data access</b></td><td>Kisne kaunsa object padha ya likha</td><td>Storage data events, database audit</td></tr>
<tr><td><b>Network</b></td><td>Kaunse IPs ne kin ports par baat ki, allowed ya rejected</td><td>VPC/VNet flow logs, firewall aur gateway logs</td></tr>
<tr><td><b>Identity</b></td><td>Sign-ins, MFA, risky logins</td><td>IdP aur SSO logs, Duo</td></tr>
<tr><td><b>Application aur edge</b></td><td>Requests, block hue attacks</td><td>Load balancer, WAF, API gateway logs</td></tr>
<tr><td><b>Platform</b></td><td>Cluster aur SaaS activity</td><td>Kubernetes audit, SaaS audit, Secure Access ke SSE logs</td></tr>
</table>
<p>Achhi practice: saare accounts aur regions ke liye <b>organisation-wide</b> trail; logs ek alag, locked <b>log-archive account</b> mein immutable (write-once) storage aur integrity validation ke saath; regulation ke hisaab se retention; aur jaise hi logging roki ya delete ki jaaye, alert.</p>

<h3>Splunk mein aane ke raaste</h3>
<ul>
<li><b>Add-ons</b> jo provider APIs ya storage queues se pull karte hain aur sahi sourcetypes assign karte hain.</li>
<li>Hosts par <b>Universal Forwarder</b>, jo indexers ko <b>TCP 9997</b> par bhejta hai.</li>
<li><b>HTTP Event Collector (HEC)</b>: senders HTTPS par <b>TCP 8088</b> ko JSON <b>push</b> karte hain. Streaming services, serverless functions, log forwarders aur Kubernetes collectors ise use karte hain.</li>
<li><b>Syslog</b> (UDP/TCP 514), aam taur par syslog collector ke through.</li>
</ul>
<p>HEC <b>token</b> sender ko authenticate karta hai aur default <b>index</b> aur <b>sourcetype</b> tay karta hai. Sender <code>/services/collector/event</code> par header <code>Authorization: Splunk &lt;token&gt;</code> ke saath post karta hai. Sahi sourcetypes add-ons ko fields <b>Common Information Model (CIM)</b> se map karne dete hain, taaki wahi detection har vendor ke liye kaam kare.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Lab 2 topology">
<rect x="10" y="60" width="150" height="60" rx="8" fill="#fde68a"/><text x="85" y="85" text-anchor="middle" class="svg-ink" font-size="13">NK Cloud trail</text><text x="85" y="105" text-anchor="middle" class="svg-muted" font-size="12">account nk-prod</text>
<rect x="230" y="60" width="150" height="60" rx="8" fill="#bae6fd"/><text x="305" y="85" text-anchor="middle" class="svg-ink" font-size="13">FWD</text><text x="305" y="105" text-anchor="middle" class="svg-muted" font-size="12">10.50.1.30</text>
<rect x="460" y="60" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="13">SPLUNK</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="12">10.50.1.20 HEC 8088</text>
<line x1="160" y1="90" x2="230" y2="90" stroke="#64748b" stroke-width="2"/><line x1="380" y1="90" x2="460" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="420" y="80" text-anchor="middle" class="svg-accent" font-size="12">HTTPS POST</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">token nkcloud-audit: index cloud, sourcetype nkcloud:cloudtrail</text>
</svg><p class="cap">Lab 2: forwarder account ka audit trail HEC ke through Splunk ko push karta hai.</p></div>

<h3>Lab 2, step by step</h3>
<p><b>1. HEC enable karo.</b> SPLUNK mein <b>Settings &gt; Data inputs &gt; HTTP Event Collector &gt; Global Settings</b> par jao aur <b>All Tokens</b> ko Enabled karo (SSL on, port 8088). Tab tak TCP 8088 connections refuse karta hai.</p>
<p><b>2. Token banao.</b> <b>New Token</b>: name <code>nkcloud-audit</code>, source type <code>nkcloud:cloudtrail</code>, default index <code>cloud</code>, phir <b>Review and Submit</b> aur token value copy karo.</p>
<p><b>3. FWD par forwarder start karo.</b></p>
<pre class="code">FWD&gt; forwarder set url h&#116;tps://10.50.1.20:8088
FWD&gt; forwarder set token &lt;token value&gt;
FWD&gt; forwarder status
FWD&gt; forwarder start</pre>
<pre class="out">cloud-log-forwarder 3.2 (NK Cloud audit trail → Splunk HEC)
  url   : h&#116;tps://10.50.1.20:8088
  token : 3fa1b2c4…
  queue : 6 audit events from account nk-prod waiting
  sent  : 0

Sent 6 events to h&#116;tps://10.50.1.20:8088/services/collector/event → <span class="hl">HTTP 200 {"text":"Success","code":0}</span></pre>
<p>Aap kisi bhi host se curl se HEC haath se test kar sakte ho; wahi header aur JSON shape lagti hai:</p>
<pre class="code">curl -k h&#116;tps://10.50.1.20:8088/services/collector/event -H "Authorization: Splunk &lt;token&gt;" -d '{"event": {"msg": "nk-sim test"}, "sourcetype": "nkcloud:cloudtrail"}'</pre>

<p><b>4. SPL se hunt karo.</b> <b>Search &amp; Reporting</b> mein hamesha index ka naam do, kyunki bina <code>index=</code> ke searches sirf default index mein dekhti hain.</p>
<pre class="code">index=cloud sourcetype=nkcloud:cloudtrail eventName=DeleteTrail
index=cloud sourceIPAddress=185.220.101.7 | stats count by eventName</pre>
<pre class="out">2026-09-29T03:45:37Z  eventName=DeleteTrail  eventSource=audit.nkcloud.example
  <span class="hl">userIdentity.userName=dev-ci-bot</span>  sourceIPAddress=185.220.101.7  requestParameters.name=org-audit-trail

eventName      count
ConsoleLogin   2
DeleteTrail    1
PutBucketAcl   1          <span class="hl">185.220.101.7 se total = 4</span></pre>

<div class="eg"><p><b>Worked example: timeline.</b> 03:42:19 par dev-ci-bot ka bina MFA failed console login; 03:42:55 successful login; 03:44:02 PutBucketAcl nk-payroll-exports ko public-read banata hai; 03:45:37 DeleteTrail org-audit-trail hata deta hai. Pehli koshish se nishaan mitane tak chhe minute. Kyunki forwarder events pehle hi Splunk mein copy kar chuka tha, cloud mein trail delete karne se evidence delete nahi hua. Yahi woh change hai jo Lab 1 ne posture side se theek kiya.</p></div>

<h3>Pehle banane layak detections</h3>
<ul>
<li>Audit logging ruki ya delete hui (DeleteTrail, StopLogging aur equivalents).</li>
<li>Bina MFA console login, ya service identity ka console login.</li>
<li>Storage ACL ya policy public mein badli.</li>
<li>Admin ports par security group 0.0.0.0/0 ke liye khula.</li>
<li>Privileged users ke liye nayi access keys; naye countries ya anonymising networks se API calls.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> <code>index=cloud</code> ke bina search karna aur "no data" conclude kar dena. Har source ke liye ek hi token use karna, jisse ek sender ko revoke nahi kar sakte. 8088 ki jagah port 9997 ya 514 par bhejna. Token value ki jagah token name paste karna.</p></div>
<div class="exam"><p><b>Exam traps.</b> HEC = TCP 8088, HTTPS, header mein token <code>Authorization: Splunk &lt;token&gt;</code>. 9997 = forwarder se indexer. Token default index aur sourcetype set karta hai. Control-plane audit logs "kisne kya kiya" ka jawab dete hain; flow logs "kisne kis se baat ki" ka.</p></div>

<div class="scn"><h4>Delete hua trail, aur woh copy jo delete nahi hui</h4><p>Ek SaaS start-up ne routine posture review mein public bucket dekha. Jab unhone kisne badla yeh dekhne ke liye cloud console khola, to audit trail usi raat delete ho chuka tha. Kismat se teen mahine pehle SOC ne dedicated token ke saath HEC ke through trail ko Splunk se jod diya tha. Ek SPL search ne dikhaya ki ek service identity anonymising network se bina MFA login hui, ACL badla aur trail delete kiya. Unhone identity disable ki, uski keys rotate ki, logging dobara on ki aur aisa guardrail lagaya jo use delete karne se roke, aur aage ke kisi bhi DeleteTrail par alert joda.</p><p><b>Seekh:</b> jo logs sirf usi account mein rehte hain jise attacker control karta hai, woh evidence nahi hain. Unhe lagatar bahar bhejo.</p></div>

<div class="iv"><p class="q">"Cloud audit logs Splunk mein kaise laoge, aur sabse pehle kis par alert karoge?"</p><p>Path describe karo: org-wide audit trail, phir ya to storage/queues se pull karne wala provider add-on ya 8088 par HEC ke through push, har source ke liye dedicated token jo index aur sourcetype set kare; CIM-compliant sourcetypes. Logs ko alag archive account mein immutable storage ke saath protect karo. Pehle alerts: logging disabled, bina MFA ya bot ka console login, public storage changes, internet ke liye khule admin ports.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control-plane audit, data access, flow, identity, edge aur platform logs collect karo.</li>
<li>Org-wide trails alag immutable log archive mein; logging rukne par alert.</li>
<li>HEC: TCP 8088 par HTTPS, Authorization: Splunk header mein token, token index aur sourcetype set karta hai.</li>
<li>Hamesha index= ke saath search karo; summary ke liye stats count by use karo.</li>
<li>Lab 2 mein dev-ci-bot ne trail delete kiya aur 185.220.101.7 se 4 events aaye.</li>
</ul></div>
`}};export{e as default};