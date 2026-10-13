var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`

<p><b>Module complete.</b> You can now explain and design identity-based security on a Palo Alto Networks firewall, from the first mapping to remote access. Use this chapter as the final review.</p>

<h3>Analogy: the named badge system, end to end</h3>
<p>Mapping is the badge scanner, group mapping is the staff list, the zone setting is the door watching badges, the rule is the door policy, and GlobalProtect is the shuttle that brings remote staff inside the compound with a badge already on.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why identity beats addresses and where User-ID fits in the packet path.</li>
<li>I can list the mapping sources and say what each is best for.</li>
<li>I can describe the configuration order: service account, server monitor, include and exclude lists, zone, interface profile.</li>
<li>I can explain LDAP group mapping, the include list, update interval and name formats.</li>
<li>I can write a rule with a source user or group and place it correctly in the rulebase.</li>
<li>I can describe the GlobalProtect portal, gateway, agent, tunnel and connect methods.</li>
<li>I can explain split tunnel, full tunnel and HIP.</li>
<li>I can troubleshoot in order: mapping, group, zone, rule, tunnel.</li>
</ul>

<h3>Command reference</h3>
<p>Commands you can run in the simulator (verified there):</p>
<pre class="code">set zone trust enable-user-identification yes
set network profiles interface-management-profile MGMT-UID userid-service yes
set rulebase security rules RULE source-user DOMAIN-USER-OR-GROUP
show session id N
test security-policy-match from Z to Z source S destination D protocol P destination-port N</pre>
<p>Reference commands for a real firewall (not run in the simulator):</p>
<pre class="code">show user ip-user-mapping all
show user ip-user-mapping ip A.B.C.D
show user user-id-agent state all
show user server-monitor state all
show user group list
show user group-mapping state all
show global-protect-gateway current-user
show global-protect-portal statistics</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>User-ID</dt><dd>Feature that maps IP addresses to users and groups</dd>
<dt>IP-user mapping</dt><dd>The table of which user is on which IP</dd>
<dt>Group mapping</dt><dd>User-to-group membership read from the directory by LDAP</dd>
<dt>Server monitor</dt><dd>Reading domain controller security logs for logon events</dd>
<dt>Include / exclude list</dt><dd>Networks that are, or are never, mapped</dd>
<dt>Captive portal</dt><dd>Web login for unknown users</dd>
<dt>Portal</dt><dd>GlobalProtect component that authenticates and sends agent configuration</dd>
<dt>Gateway</dt><dd>GlobalProtect tunnel endpoint that assigns IPs and enforces policy</dd>
<dt>HIP</dt><dd>Host information profile: device posture checks</dd>
<dt>Split tunnel</dt><dd>Only listed traffic goes through the tunnel</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Where is User-ID enabled?</td><td>On the source zone</td></tr>
<tr><td>What allows agents to connect to the firewall?</td><td>User-ID service in the interface management profile</td></tr>
<tr><td>Group mapping default update</td><td>60 seconds</td></tr>
<tr><td>Source user values</td><td>any, known-user, unknown, pre-logon, user or group</td></tr>
<tr><td>Unknown user and a user rule</td><td>Does not match</td></tr>
<tr><td>LDAP secure port</td><td>636 (LDAPS)</td></tr>
<tr><td>GlobalProtect transports</td><td>IPsec preferred, SSL/TLS fallback on TCP 443</td></tr>
<tr><td>Portal vs gateway</td><td>Portal = config, gateway = tunnel and policy</td></tr>
<tr><td>Best source for remote users</td><td>GlobalProtect login</td></tr>
</table>

<h3>Where to practise next</h3>
<p>This module has no labs because the simulator has no identity source. Practise the surrounding skills in <b>pan-policy</b> (rules and zones), <b>pan-diag</b> (sessions, test commands, counters and logs), <b>sec-aaa-mgmt</b> (directory and authentication concepts) and <b>sec-ise</b> (identity services).</p>

<div class="warn"><p><b>Common mistake.</b> Memorising GUI paths only. Interviewers ask why: why the rule does not match, why the mapping is missing. Practise the order of checks.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question mixes the interface profile User-ID service and the zone Enable User Identification, remember: the first lets agents connect, the second lets sessions use mappings.</p></div>

<div class="scn"><h4>The checklist that found it in two minutes</h4><p>An operations engineer received "VPN user cannot reach the build server". She asked: is the user mapped, is the group right, is the zone enabled, which rule matches? The gateway showed the user connected, the policy test hit the deny because the user was not in the group after a reorganisation. HR fixed the group, and the ticket closed.</p><p><b>Lesson:</b> A fixed order of checks turns a vague complaint into a two-minute diagnosis.</p></div>

<div class="iv"><p class="q">"Summarise how identity-based policy works on a Palo Alto firewall."</p><p>Mapping sources give IP-to-user, LDAP group mapping gives user-to-group, User-ID is enabled on the source zone, and rules use source user or group together with applications. Remote users come through GlobalProtect, where the gateway authenticates the user and creates the mapping. I troubleshoot in the order mapping, group, zone, rule, tunnel.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity chain: mapping, group mapping, zone enablement, rule, log.</li>
<li>GlobalProtect brings remote users into the same model.</li>
<li>Source user conditions do not match unknown users.</li>
<li>Troubleshoot in order and verify identity before editing rules.</li>
<li>Practise surrounding skills in pan-policy and pan-diag.</li>
</ul></div>

`,hi:`

<p><b>Module poora.</b> Ab aap Palo Alto Networks firewall par identity-based security samjha aur design kar sakte ho, pehle mapping se remote access tak. Is chapter ko final review ki tarah use karo.</p>

<h3>Analogy: naam waala badge system, shuru se aakhir tak</h3>
<p>Mapping badge scanner hai, group mapping staff list hai, zone setting woh darwaza hai jo badges dekhta hai, rule darwaze ki policy hai, aur GlobalProtect woh shuttle hai jo remote staff ko badge pehne hue compound ke andar laati hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki identity addresses se behtar kyun hai aur User-ID packet path mein kahan aata hai.</li>
<li>Main mapping sources list kar sakta hoon aur bata sakta hoon har ek kiske liye best hai.</li>
<li>Main configuration order bata sakta hoon: service account, server monitor, include aur exclude lists, zone, interface profile.</li>
<li>Main LDAP group mapping, include list, update interval aur name formats samjha sakta hoon.</li>
<li>Main source user ya group waali rule likh sakta hoon aur use rulebase mein sahi jagah rakh sakta hoon.</li>
<li>Main GlobalProtect portal, gateway, agent, tunnel aur connect methods describe kar sakta hoon.</li>
<li>Main split tunnel, full tunnel aur HIP samjha sakta hoon.</li>
<li>Main order mein troubleshoot kar sakta hoon: mapping, group, zone, rule, tunnel.</li>
</ul>

<h3>Command reference</h3>
<p>Jo commands simulator mein chal sakte hain (wahan verify kiye gaye):</p>
<pre class="code">set zone trust enable-user-identification yes
set network profiles interface-management-profile MGMT-UID userid-service yes
set rulebase security rules RULE source-user DOMAIN-USER-OR-GROUP
show session id N
test security-policy-match from Z to Z source S destination D protocol P destination-port N</pre>
<p>Real firewall ke reference commands (not run in the simulator):</p>
<pre class="code">show user ip-user-mapping all
show user ip-user-mapping ip A.B.C.D
show user user-id-agent state all
show user server-monitor state all
show user group list
show user group-mapping state all
show global-protect-gateway current-user
show global-protect-portal statistics</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>User-ID</dt><dd>Feature jo IP addresses ko users aur groups se map karta hai</dd>
<dt>IP-user mapping</dt><dd>Table ki kaunsa user kaunse IP par hai</dd>
<dt>Group mapping</dt><dd>LDAP se directory se padhi gayi user-to-group membership</dd>
<dt>Server monitor</dt><dd>Logon events ke liye domain controller security logs padhna</dd>
<dt>Include / exclude list</dt><dd>Woh networks jo map hote hain, ya kabhi map nahi hote</dd>
<dt>Captive portal</dt><dd>Unknown users ke liye web login</dd>
<dt>Portal</dt><dd>GlobalProtect component jo authenticate karta hai aur agent configuration bhejta hai</dd>
<dt>Gateway</dt><dd>GlobalProtect tunnel endpoint jo IPs assign karta hai aur policy enforce karta hai</dd>
<dt>HIP</dt><dd>Host information profile: device posture checks</dd>
<dt>Split tunnel</dt><dd>Sirf listed traffic tunnel se jaata hai</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>User-ID kahan enable hota hai?</td><td>Source zone par</td></tr>
<tr><td>Agents ko firewall se connect kya karne deta hai?</td><td>Interface management profile mein User-ID service</td></tr>
<tr><td>Group mapping default update</td><td>60 seconds</td></tr>
<tr><td>Source user values</td><td>any, known-user, unknown, pre-logon, user ya group</td></tr>
<tr><td>Unknown user aur user rule</td><td>Match nahi hoti</td></tr>
<tr><td>LDAP secure port</td><td>636 (LDAPS)</td></tr>
<tr><td>GlobalProtect transports</td><td>IPsec preferred, TCP 443 par SSL/TLS fallback</td></tr>
<tr><td>Portal vs gateway</td><td>Portal = config, gateway = tunnel aur policy</td></tr>
<tr><td>Remote users ka best source</td><td>GlobalProtect login</td></tr>
</table>

<h3>Aage kahan practise karein</h3>
<p>Is module mein labs nahi hain kyunki simulator mein identity source nahi hai. Aas-paas ki skills <b>pan-policy</b> (rules aur zones), <b>pan-diag</b> (sessions, test commands, counters aur logs), <b>sec-aaa-mgmt</b> (directory aur authentication concepts) aur <b>sec-ise</b> (identity services) mein practise karo.</p>

<div class="warn"><p><b>Common mistake.</b> Sirf GUI paths ratna. Interviewers "kyun" poochte hain: rule match kyun nahi hoti, mapping missing kyun hai. Checks ka order practise karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal interface profile ki User-ID service aur zone ke Enable User Identification ko mix kare to yaad rakho: pehla agents ko connect karne deta hai, doosra sessions ko mappings use karne deta hai.</p></div>

<div class="scn"><h4>Checklist jisne do minute mein pakda</h4><p>Operations engineer ko "VPN user build server tak nahi pahunch pa raha" ticket mila. Usne poocha: user mapped hai, group sahi hai, zone enabled hai, kaunsi rule match hoti hai? Gateway ne user ko connected dikhaya, policy test deny par gira kyunki reorganisation ke baad user group mein nahi tha. HR ne group theek kiya, aur ticket band hua.</p><p><b>Lesson:</b> Checks ka fixed order dhundhli shikayat ko do minute ke diagnosis mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Palo Alto firewall par identity-based policy kaise kaam karti hai, summarise karo."</p><p>Mapping sources IP-to-user dete hain, LDAP group mapping user-to-group, source zone par User-ID enabled hota hai, aur rules applications ke saath source user ya group use karti hain. Remote users GlobalProtect se aate hain, jahan gateway user ko authenticate karke mapping banata hai. Main mapping, group, zone, rule, tunnel ke order mein troubleshoot karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity chain: mapping, group mapping, zone enablement, rule, log.</li>
<li>GlobalProtect remote users ko isi model mein laata hai.</li>
<li>Source user conditions unknown users ko match nahi karti.</li>
<li>Order mein troubleshoot karo aur rules edit karne se pehle identity verify karo.</li>
<li>Aas-paas ki skills pan-policy aur pan-diag mein practise karo.</li>
</ul></div>

`}};export{e as default};