var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking both labs end to end`,hi:`Troubleshooting workflow: dono labs end to end`},body:{en:`
<p>A good doctor does not prescribe medicine the moment you say "my stomach hurts". She confirms the symptom, checks the likely causes in order, treats the cause rather than the pain, and asks you to come back to confirm you are better. Cloud security troubleshooting follows the same rhythm: <b>confirm, scope, contain, fix the root cause, verify, prevent</b>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Six step workflow">
<rect x="5" y="40" width="95" height="55" rx="8" fill="#e2e8f0"/><text x="52" y="72" text-anchor="middle" class="svg-ink" font-size="13">Confirm</text>
<rect x="111" y="40" width="95" height="55" rx="8" fill="#bae6fd"/><text x="158" y="72" text-anchor="middle" class="svg-ink" font-size="13">Scope</text>
<rect x="217" y="40" width="95" height="55" rx="8" fill="#fed7aa"/><text x="264" y="72" text-anchor="middle" class="svg-ink" font-size="13">Contain</text>
<rect x="323" y="40" width="95" height="55" rx="8" fill="#ddd6fe"/><text x="370" y="72" text-anchor="middle" class="svg-ink" font-size="13">Root cause</text>
<rect x="429" y="40" width="95" height="55" rx="8" fill="#bbf7d0"/><text x="476" y="72" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="535" y="40" width="100" height="55" rx="8" fill="#fde68a"/><text x="585" y="72" text-anchor="middle" class="svg-ink" font-size="13">Prevent</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">outside view, owner, console fix, IaC and identity, outside view again, guardrail and alert</text>
</svg><p class="cap">The same six steps work for posture findings and for broken log pipelines.</p></div>

<h3>Lab 1 walk-through: Cloud posture triage</h3>
<p><b>Confirm (task 1).</b> From EXT-PC, which sits outside the cloud, run <code>curl nk-payroll-exports.storage.example/payroll-2026-09.csv</code>. Data comes back with the header <code>employee_id,name,pan,aadhaar,corporate_card</code>: the report is real and the impact is high. Run <code>nmap -p 22,443 52.66.10.20</code> as well: both ports show <code>open</code>.</p>
<p><b>Scope and triage.</b> In <b>CLOUD &gt; Findings</b> read the Owner column. CSP-101, 102 and 103 are open customer findings to fix now. CSP-104 (<code>nk-web-assets</code>) is a public static website with an accepted risk, RISK-104: leave it alone. <b>CSP-105</b> (hypervisor host firmware, maintenance window 2026-10-03) is owned by the provider; that is the answer to task 1.</p>
<p><b>Contain (tasks 2 and 3).</b> <b>Storage &gt; nk-payroll-exports</b>: ACL <code>private</code>, Block public access <code>On</code>, Encryption <code>KMS (customer-managed)</code>; CSP-101 and CSP-103 close. <b>Security Groups &gt; sg-web</b>: edit the tcp/22 rule source to <code>10.99.0.0/24</code>, keep tcp/443 from 0.0.0.0/0; CSP-102 closes.</p>
<p><b>Root cause (task 4).</b> The Terraform still says <code>acl = "public-read"</code>, has the encryption block commented out and allows port 22 from 0.0.0.0/0. Scan, read the rule IDs (CKV_NK_20 critical, CKV_NK_24 high, CKV_NK_19 medium), edit, scan again until 0 failed checks and the pipeline shows <code>passed</code>. In a real incident the root cause also includes <b>identity</b>: the audit log from Lab 2 shows that <code>dev-ci-bot</code> made the ACL change, so that identity must be disabled and its credentials rotated.</p>
<p><b>Verify (task 5).</b> From EXT-PC again:</p>
<pre class="out">&lt;Error&gt;&lt;Code&gt;<span class="hl">AccessDenied</span>&lt;/Code&gt;&lt;Message&gt;Access Denied&lt;/Message&gt;...&lt;/Error&gt;
PORT     STATE    SERVICE
<span class="hl">22/tcp   filtered ssh</span>
443/tcp  open     h&#116;tps</pre>
<p>Port 22 is <b>filtered</b>, not closed, because the security group drops the probe silently.</p>

<h3>Lab 2 walk-through: Cloud logs into Splunk with HEC</h3>
<p>Work from the sender towards the search, one layer at a time:</p>
<table class="cmp"><tr><th>Symptom on FWD or curl</th><th>Meaning</th><th>Fix</th></tr>
<tr><td><code>Failed to connect ... port 8088: Connection refused</code></td><td>HEC is disabled (All Tokens off) or wrong port</td><td>Global Settings: All Tokens Enabled, port 8088</td></tr>
<tr><td><code>{"text":"Token is required","code":2}</code></td><td>No Authorization header</td><td>Add <code>Authorization: Splunk &lt;token&gt;</code></td></tr>
<tr><td><code>{"text":"Invalid token","code":4}</code> (HTTP 403)</td><td>Token value wrong, or the token name was pasted</td><td>Copy the token value again</td></tr>
<tr><td><code>{"text":"Token disabled","code":1}</code></td><td>The token exists but is disabled</td><td>Enable the token</td></tr>
<tr><td><code>{"text":"No data","code":5}</code></td><td>Empty body or no <code>event</code> field</td><td>Send <code>{"event": ...}</code></td></tr>
<tr><td><code>error: set url h&#116;tps://&lt;splunk-ip&gt;:8088 first</code></td><td>Forwarder URL not set</td><td><code>forwarder set url</code></td></tr>
<tr><td>Success, but search shows nothing</td><td>Searching the wrong index</td><td>Add <code>index=cloud</code></td></tr>
</table>
<pre class="code">FWD&gt; forwarder status
FWD&gt; forwarder start</pre>
<pre class="out">error: HEC answered 403 <span class="hl">{"text":"Invalid token","code":4}</span>
... after pasting the token value, not the name ...
Sent 6 events to h&#116;tps://10.50.1.20:8088/services/collector/event → <span class="hl">HTTP 200 {"text":"Success","code":0}</span></pre>
<p>Then hunt: <code>index=cloud sourcetype=nkcloud:cloudtrail eventName=DeleteTrail</code> returns user <b>dev-ci-bot</b>; <code>index=cloud sourceIPAddress=185.220.101.7 | stats count by eventName</code> returns ConsoleLogin 2, PutBucketAcl 1, DeleteTrail 1, a total of <b>4</b>.</p>

<div class="eg"><p><b>Worked example: joining the two labs.</b> Lab 1 told you <i>what</i> was wrong (a public bucket). Lab 2 told you <i>who</i> did it and <i>how</i> (dev-ci-bot, no MFA, from 185.220.101.7, followed by DeleteTrail). A complete incident report needs both: the posture fix, the IaC fix, the identity revocation, and the new detections (logging deleted, console login without MFA, public ACL change).</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing nk-web-assets because it is "also public" and breaking the website. Deleting the SSH rule. Restarting the forwarder host when HEC answered code 4, which never fixes a token problem. Counting events without <code>index=cloud</code> and getting 0.</p></div>
<div class="exam"><p><b>Exam traps.</b> Connection refused on 8088 means HEC is off, not a bad token. A 403 with code 4 means the token is invalid. Filtered means a silent drop by a security group or firewall; closed means the host replied with a reset.</p></div>

<div class="scn"><h4>The fix that lasted one night</h4><p>An on-call engineer closed a critical CSPM finding at 2 a.m. by making a bucket private in the console. At 9 a.m. the nightly pipeline ran Terraform, which still declared the bucket public, and the finding reopened. The next day a senior engineer followed the full workflow: confirmed from outside, fixed the console, fixed the Terraform with an IaC scan gate, checked the audit log in Splunk to see who had originally changed it, and added an organisation guardrail. The finding stayed closed.</p><p><b>Lesson:</b> a console fix contains the incident; only the IaC fix, the identity fix and a guardrail end it.</p></div>

<div class="iv"><p class="q">"A forwarder cannot send logs to Splunk HEC. How do you troubleshoot it?"</p><p>Work layer by layer: network reachability to TCP 8088 (connection refused usually means HEC is disabled globally); TLS (SSL on, use HTTPS); the URL path <code>/services/collector/event</code>; the header <code>Authorization: Splunk &lt;token&gt;</code>; the HEC response code (2 missing token, 4 invalid token, 1 disabled token, 5 no data); then confirm the token's index and search with that index named.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: confirm, scope, contain, root cause, verify, prevent.</li>
<li>Lab 1: CSP-105 is the provider's; fix bucket and sg-web; fix IaC to 0 failed; port 22 ends filtered.</li>
<li>Lab 2: enable HEC, token nkcloud-audit (index cloud), forwarder start, then SPL.</li>
<li>HEC codes: refused = disabled, 2 = no token, 4 = invalid token, 1 = token disabled, 5 = no data.</li>
<li>Join posture and logs: what was wrong, who did it, and how to stop it next time.</li>
</ul></div>
`,hi:`
<p>Achhi doctor aapke "pet dard ho raha hai" kehte hi dawai nahi likhti. Woh symptom confirm karti hai, likely causes ko order mein check karti hai, dard ki jagah cause ka ilaaj karti hai, aur aapko dobara bulati hai yeh confirm karne ke liye ki aap theek ho. Cloud security troubleshooting bhi isi rhythm par chalti hai: <b>confirm, scope, contain, root cause fix, verify, prevent</b>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Chhe step workflow">
<rect x="5" y="40" width="95" height="55" rx="8" fill="#e2e8f0"/><text x="52" y="72" text-anchor="middle" class="svg-ink" font-size="13">Confirm</text>
<rect x="111" y="40" width="95" height="55" rx="8" fill="#bae6fd"/><text x="158" y="72" text-anchor="middle" class="svg-ink" font-size="13">Scope</text>
<rect x="217" y="40" width="95" height="55" rx="8" fill="#fed7aa"/><text x="264" y="72" text-anchor="middle" class="svg-ink" font-size="13">Contain</text>
<rect x="323" y="40" width="95" height="55" rx="8" fill="#ddd6fe"/><text x="370" y="72" text-anchor="middle" class="svg-ink" font-size="13">Root cause</text>
<rect x="429" y="40" width="95" height="55" rx="8" fill="#bbf7d0"/><text x="476" y="72" text-anchor="middle" class="svg-ink" font-size="13">Verify</text>
<rect x="535" y="40" width="100" height="55" rx="8" fill="#fde68a"/><text x="585" y="72" text-anchor="middle" class="svg-ink" font-size="13">Prevent</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">bahar ka view, owner, console fix, IaC aur identity, dobara bahar ka view, guardrail aur alert</text>
</svg><p class="cap">Wahi chhe steps posture findings aur toote log pipelines dono ke liye kaam karte hain.</p></div>

<h3>Lab 1 walk-through: Cloud posture triage</h3>
<p><b>Confirm (task 1).</b> EXT-PC se, jo cloud ke bahar hai, <code>curl nk-payroll-exports.storage.example/payroll-2026-09.csv</code> chalao. Header <code>employee_id,name,pan,aadhaar,corporate_card</code> ke saath data wapas aata hai: report sach hai aur impact high hai. <code>nmap -p 22,443 52.66.10.20</code> bhi chalao: dono ports <code>open</code> dikhate hain.</p>
<p><b>Scope aur triage.</b> <b>CLOUD &gt; Findings</b> mein Owner column padho. CSP-101, 102 aur 103 open customer findings hain jo abhi theek karni hain. CSP-104 (<code>nk-web-assets</code>) accepted risk RISK-104 ke saath public static website hai: use mat chhuo. <b>CSP-105</b> (hypervisor host firmware, maintenance window 2026-10-03) provider ka hai; task 1 ka jawab yahi hai.</p>
<p><b>Contain (tasks 2 aur 3).</b> <b>Storage &gt; nk-payroll-exports</b>: ACL <code>private</code>, Block public access <code>On</code>, Encryption <code>KMS (customer-managed)</code>; CSP-101 aur CSP-103 band. <b>Security Groups &gt; sg-web</b>: tcp/22 rule ka source <code>10.99.0.0/24</code> karo, tcp/443 0.0.0.0/0 se rehne do; CSP-102 band.</p>
<p><b>Root cause (task 4).</b> Terraform ab bhi <code>acl = "public-read"</code> kehta hai, encryption block commented out hai aur port 22 0.0.0.0/0 se allowed hai. Scan karo, rule IDs padho (CKV_NK_20 critical, CKV_NK_24 high, CKV_NK_19 medium), edit karo, dobara scan karo jab tak 0 failed checks na hon aur pipeline <code>passed</code> na dikhaye. Real incident mein root cause mein <b>identity</b> bhi aati hai: Lab 2 ka audit log dikhata hai ki ACL change <code>dev-ci-bot</code> ne kiya, isliye us identity ko disable karna aur uske credentials rotate karne honge.</p>
<p><b>Verify (task 5).</b> EXT-PC se dobara:</p>
<pre class="out">&lt;Error&gt;&lt;Code&gt;<span class="hl">AccessDenied</span>&lt;/Code&gt;&lt;Message&gt;Access Denied&lt;/Message&gt;...&lt;/Error&gt;
PORT     STATE    SERVICE
<span class="hl">22/tcp   filtered ssh</span>
443/tcp  open     h&#116;tps</pre>
<p>Port 22 <b>filtered</b> hai, closed nahi, kyunki security group probe ko chupchaap drop karta hai.</p>

<h3>Lab 2 walk-through: HEC se cloud logs Splunk mein</h3>
<p>Sender se search ki taraf kaam karo, ek time par ek layer:</p>
<table class="cmp"><tr><th>FWD ya curl par symptom</th><th>Matlab</th><th>Fix</th></tr>
<tr><td><code>Failed to connect ... port 8088: Connection refused</code></td><td>HEC disabled hai (All Tokens off) ya galat port</td><td>Global Settings: All Tokens Enabled, port 8088</td></tr>
<tr><td><code>{"text":"Token is required","code":2}</code></td><td>Authorization header nahi hai</td><td><code>Authorization: Splunk &lt;token&gt;</code> jodo</td></tr>
<tr><td><code>{"text":"Invalid token","code":4}</code> (HTTP 403)</td><td>Token value galat, ya token ka naam paste kiya</td><td>Token value dobara copy karo</td></tr>
<tr><td><code>{"text":"Token disabled","code":1}</code></td><td>Token hai lekin disabled hai</td><td>Token enable karo</td></tr>
<tr><td><code>{"text":"No data","code":5}</code></td><td>Khaali body ya <code>event</code> field nahi</td><td><code>{"event": ...}</code> bhejo</td></tr>
<tr><td><code>error: set url h&#116;tps://&lt;splunk-ip&gt;:8088 first</code></td><td>Forwarder URL set nahi</td><td><code>forwarder set url</code></td></tr>
<tr><td>Success, lekin search kuch nahi dikhata</td><td>Galat index mein search</td><td><code>index=cloud</code> jodo</td></tr>
</table>
<pre class="code">FWD&gt; forwarder status
FWD&gt; forwarder start</pre>
<pre class="out">error: HEC answered 403 <span class="hl">{"text":"Invalid token","code":4}</span>
... token ka naam nahi, value paste karne ke baad ...
Sent 6 events to h&#116;tps://10.50.1.20:8088/services/collector/event → <span class="hl">HTTP 200 {"text":"Success","code":0}</span></pre>
<p>Phir hunt karo: <code>index=cloud sourcetype=nkcloud:cloudtrail eventName=DeleteTrail</code> user <b>dev-ci-bot</b> deta hai; <code>index=cloud sourceIPAddress=185.220.101.7 | stats count by eventName</code> ConsoleLogin 2, PutBucketAcl 1, DeleteTrail 1 deta hai, total <b>4</b>.</p>

<div class="eg"><p><b>Worked example: dono labs ko jodna.</b> Lab 1 ne bataya <i>kya</i> galat tha (public bucket). Lab 2 ne bataya <i>kisne</i> kiya aur <i>kaise</i> (dev-ci-bot, bina MFA, 185.220.101.7 se, uske baad DeleteTrail). Poori incident report ko dono chahiye: posture fix, IaC fix, identity revocation, aur nayi detections (logging deleted, bina MFA console login, public ACL change).</p></div>

<div class="warn"><p><b>Common galtiyan.</b> nk-web-assets ko "woh bhi public hai" soch kar theek karna aur website tod dena. SSH rule delete kar dena. HEC ke code 4 dene par forwarder host restart karna, jo token problem kabhi theek nahi karta. <code>index=cloud</code> ke bina events ginna aur 0 paana.</p></div>
<div class="exam"><p><b>Exam traps.</b> 8088 par connection refused ka matlab HEC off hai, bad token nahi. Code 4 ke saath 403 ka matlab token invalid hai. Filtered ka matlab security group ya firewall ka silent drop; closed ka matlab host ne reset se jawab diya.</p></div>

<div class="scn"><h4>Woh fix jo ek raat chala</h4><p>Ek on-call engineer ne raat 2 baje console mein bucket private karke ek critical CSPM finding band kar di. Subah 9 baje nightly pipeline ne Terraform chalaya, jo ab bhi bucket ko public declare karta tha, aur finding dobara khul gayi. Agle din ek senior engineer ne poora workflow follow kiya: bahar se confirm kiya, console theek kiya, IaC scan gate ke saath Terraform theek kiya, Splunk mein audit log check kiya ki asal mein kisne badla tha, aur ek organisation guardrail joda. Finding band rahi.</p><p><b>Seekh:</b> console fix incident ko contain karta hai; sirf IaC fix, identity fix aur guardrail use khatam karte hain.</p></div>

<div class="iv"><p class="q">"Ek forwarder Splunk HEC ko logs nahi bhej pa raha. Kaise troubleshoot karoge?"</p><p>Layer by layer chalo: TCP 8088 tak network reachability (connection refused aam taur par HEC globally disabled ka matlab hai); TLS (SSL on, HTTPS use karo); URL path <code>/services/collector/event</code>; header <code>Authorization: Splunk &lt;token&gt;</code>; HEC response code (2 token missing, 4 invalid token, 1 disabled token, 5 no data); phir token ka index confirm karo aur us index ka naam le kar search karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: confirm, scope, contain, root cause, verify, prevent.</li>
<li>Lab 1: CSP-105 provider ka hai; bucket aur sg-web theek karo; IaC ko 0 failed tak theek karo; port 22 filtered ho jaata hai.</li>
<li>Lab 2: HEC enable, token nkcloud-audit (index cloud), forwarder start, phir SPL.</li>
<li>HEC codes: refused = disabled, 2 = token nahi, 4 = invalid token, 1 = token disabled, 5 = no data.</li>
<li>Posture aur logs jodo: kya galat tha, kisne kiya, aur agli baar kaise rokna hai.</li>
</ul></div>
`}};export{e as default};