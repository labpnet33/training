var e={id:`troubleshooting-snmp`,h:{en:`Troubleshooting SNMP: reading the error and fixing the right layer`,hi:`SNMP troubleshooting: error padhna aur sahi layer fix karna`},body:{en:`
<h3>An analogy: the locked office door</h3>
<p>Imagine you cannot get into an office. The reasons differ: the building is closed (no network path), the guard does not know your name (unknown user), your badge is the wrong one (authentication failure), your badge works but not for this floor (access denied), or the badge reader is simply off (no agent). Each reason gives a different message at the door. SNMP is the same: the <b>exact error text</b> tells you which layer to fix. Reading it carefully saves hours.</p>

<h3>The five failure messages</h3>
<table class="cmp"><tr><th>What you see</th><th>Meaning</th><th>Where to look</th></tr>
<tr><td>Timeout: No Response</td><td>no answer at all</td><td>wrong v2c community, ACL or firewall, agent off, no route, or wrong v3 privacy password (in the simulator)</td></tr>
<tr><td>Unknown user name</td><td>agent has no such user</td><td>user name typo, user not created, wrong device</td></tr>
<tr><td>Authentication failure</td><td>user exists, signature wrong</td><td>authentication password or protocol (SHA versus MD5) mismatch</td></tr>
<tr><td>Decryption error</td><td>user and auth fine, privacy fails</td><td>privacy password or protocol (AES versus DES) mismatch</td></tr>
<tr><td>authorizationError / noAccess</td><td>identity fine, access not allowed</td><td>requested level lower than the group needs, view too narrow, or writing with a read-only credential</td></tr></table>
<p><b>A note on the simulator.</b> A real net-snmp client prints "Decryption error" for a wrong privacy password. In this simulator a wrong privacy password shows as a timeout, so when v3 shows Timeout, always compare the privacy settings too. The unknown-user, authentication and authorization messages match the real ones.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SNMP troubleshooting ladder">
<rect x="200" y="10" width="240" height="34" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">1 Reachable? ping the agent address</text>
<rect x="200" y="54" width="240" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="12">2 ACL / firewall allow UDP 161?</text>
<rect x="200" y="98" width="240" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">3 Right user / community name?</text>
<rect x="200" y="142" width="240" height="34" rx="8" fill="#fde68a"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="12">4 Passwords and protocols match?</text>
<rect x="200" y="186" width="240" height="34" rx="8" fill="#fed7aa"/><text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="12">5 Level and view allowed? verify</text>
<line x1="320" y1="44" x2="320" y2="54" stroke="#64748b" stroke-width="2"/><line x1="320" y1="88" x2="320" y2="98" stroke="#64748b" stroke-width="2"/><line x1="320" y1="132" x2="320" y2="142" stroke="#64748b" stroke-width="2"/><line x1="320" y1="176" x2="320" y2="186" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Work down the ladder: stop at the first rung that fails.</p></div>

<h3>Evidence commands</h3>
<p>On the agent (router) use these to see what it believes:</p>
<pre class="code">show snmp
show snmp user
show snmp group
show snmp community
show snmp host
show access-lists 20</pre>
<p>On the NMS repeat the poll with explicit options, so you can see exactly what you sent. The counters in <code>show snmp</code> help: "Unknown community name" rising means requests arrive but with a wrong or ACL-blocked community; if nothing rises, packets never reach the agent.</p>
<pre class="out">HYD-CORE-R1# show snmp
Chassis: FTX1234ABCD
7 SNMP packets input
    <span class="hl">3 Unknown community name</span>
    0 Illegal operation for community name supplied
    4 Number of requested variables
...
7 SNMP packets output
    4 Response PDUs</pre>

<h3>Lab walkthrough: SNMPv3 authentication failure (obs-snmp-3)</h3>
<p>Scenario: the team hardened HYD-CORE-R1 and the NMS can no longer poll over v3. A ticket asks you to restore monitoring without lowering security. Work the ladder.</p>
<pre class="out">NMS&gt; ping 10.255.0.1
Reply from 10.255.0.1: bytes=64 time=2ms

NMS&gt; snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
<span class="hl">snmpget: Authentication failure (incorrect password, community or key)</span></pre>
<ol>
<li><b>Reachable:</b> ping works, so the path is fine.</li>
<li><b>ACL and port:</b> the agent answered with a specific message, so the packet got through; ACL 20 is not the problem.</li>
<li><b>User:</b> the message is not "Unknown user name", so nmsadmin exists. The user is known.</li>
<li><b>Passwords:</b> authentication failed, so the authentication password or protocol differs. Compare what was sent (Auth#key26) with the standard (Auth#Key26). The case of K was wrong.</li>
</ol>
<p>Fix the poll first, because the router is the reference. If the router really was changed (for example a hardening script set a new password), recreate the user to match the agreed standard:</p>
<pre class="code">HYD-CORE-R1(config)# no snmp-server user nmsadmin GF-MON v3
HYD-CORE-R1(config)# snmp-server user nmsadmin GF-MON v3 auth sha Auth#Key26 priv aes 128 Priv#Key26</pre>
<pre class="out">NMS&gt; snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1</span></pre>
<p>Verify with the same command that failed. Never "fix" an authentication failure by dropping to noAuthNoPriv; that removes the protection the hardening added.</p>

<h3>Other quick diagnoses</h3>
<pre class="out">NMS&gt; snmpget -v3 -u nmsadmim -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
snmpget: Unknown user name

NMS&gt; snmpget -v3 -u nmsadmin -l authNoPriv -a SHA -A Auth#Key26 10.255.0.1 sysName.0
Error in packet
Reason: authorizationError (access denied to that object)

NMS&gt; snmpget -c GF-R0 10.255.0.1 sysName.0
Timeout: No Response from 10.255.0.1.</pre>
<p>First: a typo in the user name (m for n). Second: the group requires priv but the request was at authNoPriv. Third: v2c with a mistyped community times out because the agent silently drops it.</p>

<div class="eg"><p><b>Worked example.</b> Three symptoms, three answers. Symptom A: "Unknown user name", fix: correct the user name on the NMS or create the user on the router. Symptom B: "Authentication failure", fix: align the authentication password and the SHA or MD5 choice. Symptom C: Timeout with v3 and correct auth, fix: compare the privacy password and AES or DES. Count how many changes each fix needs: one. If you change two things at once and it works, you will not know which one mattered.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Resetting every setting at once instead of reading the error. (2) Lowering the security level to "get it working". (3) Forgetting that a poll and a trap may use different credentials. (4) Testing from the router itself, which does not prove the NMS can reach it. (5) Ignoring case: Auth#Key26 and Auth#key26 are different passwords.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Authentication failure" and "Unknown user name" are different problems: the second means the user is not on the agent at all. A timeout in v2c can be a wrong community or an ACL; an authentication failure cannot be an ACL, because the agent answered. Wrong privacy gives a decryption error on real clients.</p></div>

<div class="scn"><h4>Friday hardening, Monday blind</h4><p>On Friday evening Ravi ran a hardening script on the Hyderabad router. On Monday morning all HQ graphs showed gaps and the NOC saw "Authentication failure" in the poll log. Kabir Shah did not touch the router: he ran the same snmpget by hand, saw the exact message, compared the password in the NMS with the standard and found a lowercase k. After correcting the NMS entry the graphs resumed. He added the check to the post-change list.</p><p><b>Lesson:</b> the error text pointed to the password in one minute; guessing would have cost hours.</p></div>

<div class="iv"><p class="q">"SNMPv3 polling started failing after a change. How do you troubleshoot?"</p><p>Strong answer: confirm reachability, then read the exact error. Unknown user means the user name; authentication failure means the auth password or protocol; decryption error means the privacy password or protocol; authorization error means the level or view. Check show snmp user and show snmp group on the agent, change one thing, verify with the same command, and never drop to a lower security level.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The exact error text identifies the layer: timeout, unknown user, authentication failure, decryption error, authorization error.</li>
<li>Work a ladder: reachability, ACL and UDP 161, user or community, passwords and protocols, level and view.</li>
<li>show snmp counters, show snmp user and show snmp group are the evidence on the agent.</li>
<li>In this simulator a wrong v3 privacy password appears as a timeout; real clients show a decryption error.</li>
<li>Fix one thing, verify with the failing command, and never lower security to get unstuck.</li>
</ul></div>
`,hi:`
<h3>Ek analogy: office ka locked darwaza</h3>
<p>Socho aap office mein ghus nahi pa rahe. Wajahein alag hain: building band hai (network path nahi), guard aapka naam nahi jaanta (unknown user), aapka badge galat hai (authentication failure), badge chalta hai par is floor ke liye nahi (access denied), ya badge reader hi off hai (agent nahi). Har wajah darwaze par alag message deti hai. SNMP bhi aisa hi hai: <b>exact error text</b> batata hai ki kaunsi layer fix karni hai. Ise dhyaan se padhne se ghante bachte hain.</p>

<h3>Paanch failure messages</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Matlab</th><th>Kahan dekhein</th></tr>
<tr><td>Timeout: No Response</td><td>koi jawab hi nahi</td><td>galat v2c community, ACL ya firewall, agent off, route nahi, ya galat v3 privacy password (simulator mein)</td></tr>
<tr><td>Unknown user name</td><td>agent ke paas aisa user nahi</td><td>user name typo, user bana nahi, galat device</td></tr>
<tr><td>Authentication failure</td><td>user hai, signature galat</td><td>authentication password ya protocol (SHA versus MD5) mismatch</td></tr>
<tr><td>Decryption error</td><td>user aur auth theek, privacy fail</td><td>privacy password ya protocol (AES versus DES) mismatch</td></tr>
<tr><td>authorizationError / noAccess</td><td>identity theek, access allowed nahi</td><td>maanga gaya level group ki zaroorat se kam, view bahut chhota, ya read-only credential se write</td></tr></table>
<p><b>Simulator ke baare mein note.</b> Real net-snmp client galat privacy password par "Decryption error" print karta hai. Is simulator mein galat privacy password timeout ki tarah dikhta hai, isliye v3 Timeout dikhaye to hamesha privacy settings bhi compare karo. Unknown-user, authentication aur authorization messages real wale se match karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SNMP troubleshooting ladder">
<rect x="200" y="10" width="240" height="34" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">1 Reachable? agent address ping karo</text>
<rect x="200" y="54" width="240" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="12">2 ACL / firewall UDP 161 allow?</text>
<rect x="200" y="98" width="240" height="34" rx="8" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="12">3 Sahi user / community naam?</text>
<rect x="200" y="142" width="240" height="34" rx="8" fill="#fde68a"/><text x="320" y="164" text-anchor="middle" class="svg-ink" font-size="12">4 Passwords aur protocols match?</text>
<rect x="200" y="186" width="240" height="34" rx="8" fill="#fed7aa"/><text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="12">5 Level aur view allowed? verify</text>
<line x1="320" y1="44" x2="320" y2="54" stroke="#64748b" stroke-width="2"/><line x1="320" y1="88" x2="320" y2="98" stroke="#64748b" stroke-width="2"/><line x1="320" y1="132" x2="320" y2="142" stroke="#64748b" stroke-width="2"/><line x1="320" y1="176" x2="320" y2="186" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ladder par neeche jao: pehli fail hone wali rung par ruk jao.</p></div>

<h3>Evidence commands</h3>
<p>Agent (router) par yeh use karo dekhne ke liye ki woh kya maanta hai:</p>
<pre class="code">show snmp
show snmp user
show snmp group
show snmp community
show snmp host
show access-lists 20</pre>
<p>NMS par poll explicit options ke saath dobara karo, taaki aap dekh sako ki aapne exactly kya bheja. <code>show snmp</code> ke counters madad karte hain: "Unknown community name" badh raha hai to requests pahunch rahi hain lekin galat ya ACL-blocked community ke saath; agar kuch nahi badhta to packets agent tak pahunche hi nahi.</p>
<pre class="out">HYD-CORE-R1# show snmp
Chassis: FTX1234ABCD
7 SNMP packets input
    <span class="hl">3 Unknown community name</span>
    0 Illegal operation for community name supplied
    4 Number of requested variables
...
7 SNMP packets output
    4 Response PDUs</pre>

<h3>Lab walkthrough: SNMPv3 authentication failure (obs-snmp-3)</h3>
<p>Scenario: team ne HYD-CORE-R1 ko harden kiya aur NMS ab v3 par poll nahi kar pa raha. Ticket kehta hai security kam kiye bina monitoring wapas laao. Ladder par kaam karo.</p>
<pre class="out">NMS&gt; ping 10.255.0.1
Reply from 10.255.0.1: bytes=64 time=2ms

NMS&gt; snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
<span class="hl">snmpget: Authentication failure (incorrect password, community or key)</span></pre>
<ol>
<li><b>Reachable:</b> ping chalta hai, to path theek hai.</li>
<li><b>ACL aur port:</b> agent ne specific message se jawab diya, to packet pahuncha; ACL 20 problem nahi hai.</li>
<li><b>User:</b> message "Unknown user name" nahi hai, to nmsadmin exist karta hai. User known hai.</li>
<li><b>Passwords:</b> authentication fail hui, to authentication password ya protocol alag hai. Jo bheja (Auth#key26) usse standard (Auth#Key26) se compare karo. K ka case galat tha.</li>
</ol>
<p>Pehle poll theek karo, kyunki router reference hai. Agar router sach mein badla gaya tha (jaise hardening script ne naya password set kiya), to user ko agreed standard ke hisaab se dobara banao:</p>
<pre class="code">HYD-CORE-R1(config)# no snmp-server user nmsadmin GF-MON v3
HYD-CORE-R1(config)# snmp-server user nmsadmin GF-MON v3 auth sha Auth#Key26 priv aes 128 Priv#Key26</pre>
<pre class="out">NMS&gt; snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1</span></pre>
<p>Usi command se verify karo jo fail hua tha. Authentication failure ko noAuthNoPriv par girakar kabhi "fix" mat karo; yeh hardening ne jo protection jodi thi woh hata deta hai.</p>

<h3>Doosre quick diagnoses</h3>
<pre class="out">NMS&gt; snmpget -v3 -u nmsadmim -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
snmpget: Unknown user name

NMS&gt; snmpget -v3 -u nmsadmin -l authNoPriv -a SHA -A Auth#Key26 10.255.0.1 sysName.0
Error in packet
Reason: authorizationError (access denied to that object)

NMS&gt; snmpget -c GF-R0 10.255.0.1 sysName.0
Timeout: No Response from 10.255.0.1.</pre>
<p>Pehla: user name mein typo (n ki jagah m). Doosra: group priv maangta hai lekin request authNoPriv par thi. Teesra: galat likhi community ke saath v2c time out hota hai kyunki agent use chupchaap drop kar deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Teen symptoms, teen jawab. Symptom A: "Unknown user name", fix: NMS par user name theek karo ya router par user banao. Symptom B: "Authentication failure", fix: authentication password aur SHA ya MD5 ka choice align karo. Symptom C: v3 ke saath Timeout aur auth sahi, fix: privacy password aur AES ya DES compare karo. Gino ki har fix mein kitne changes lagte hain: ek. Agar aap do cheezein ek saath badlo aur kaam kar jaye, to pata nahi chalega kaunsi ne fark dala.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Error padhne ki jagah har setting ek saath reset karna. (2) "Chalane" ke liye security level kam karna. (3) Yeh bhoolna ki poll aur trap alag credentials use kar sakte hain. (4) Router se hi test karna, jo prove nahi karta ki NMS use reach kar sakta hai. (5) Case ignore karna: Auth#Key26 aur Auth#key26 alag passwords hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Authentication failure" aur "Unknown user name" alag problems hain: doosra matlab user agent par hai hi nahi. v2c mein timeout galat community ya ACL ho sakta hai; authentication failure ACL nahi ho sakta, kyunki agent ne jawab diya. Galat privacy real clients par decryption error deti hai.</p></div>

<div class="scn"><h4>Friday hardening, Monday blind</h4><p>Friday shaam Ravi ne Hyderabad router par hardening script chalayi. Monday subah saare HQ graphs mein gaps the aur NOC ko poll log mein "Authentication failure" dikha. Kabir Shah ne router ko chhua nahi: usne wahi snmpget haath se chalaya, exact message dekha, NMS ka password standard se compare kiya aur ek lowercase k mila. NMS entry theek karne par graphs wapas aa gaye. Usne yeh check post-change list mein jod diya.</p><p><b>Seekh:</b> error text ne ek minute mein password ki taraf ishara kar diya; andaza lagane mein ghante lagte.</p></div>

<div class="iv"><p class="q">"Change ke baad SNMPv3 polling fail hone lagi. Troubleshoot kaise karoge?"</p><p>Strong answer: reachability confirm karo, phir exact error padho. Unknown user matlab user name; authentication failure matlab auth password ya protocol; decryption error matlab privacy password ya protocol; authorization error matlab level ya view. Agent par show snmp user aur show snmp group check karo, ek cheez badlo, usi command se verify karo, aur kabhi lower security level par mat jao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exact error text layer batata hai: timeout, unknown user, authentication failure, decryption error, authorization error.</li>
<li>Ladder par kaam karo: reachability, ACL aur UDP 161, user ya community, passwords aur protocols, level aur view.</li>
<li>show snmp counters, show snmp user aur show snmp group agent par evidence hain.</li>
<li>Is simulator mein galat v3 privacy password timeout ki tarah dikhta hai; real clients decryption error dikhate hain.</li>
<li>Ek cheez fix karo, failing command se verify karo, aur atakne par security kabhi kam mat karo.</li>
</ul></div>
`}};export{e as default};