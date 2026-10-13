var e={id:`cis-audit`,h:{en:`CIS benchmarks, hardening audits and the NOC turn-up checklist`,hi:`CIS benchmarks, hardening audits aur NOC turn-up checklist`},body:{en:`
<p>Before every flight, pilots run a printed checklist even though they have flown thousands of times. The checklist is not about intelligence; it is about never forgetting one small item under time pressure. A <b>CIS benchmark</b> is the pilot's checklist for a device platform, and an audit is running it and writing down the result.</p>

<h3>What a CIS benchmark is</h3>
<p>The Center for Internet Security publishes consensus hardening guides for operating systems, cloud platforms and network devices, including Cisco IOS XE and firewalls. Each <b>recommendation</b> has a title, a rationale, an audit procedure (the <code>show</code> command and what to look for), a remediation (the configuration), and its impact. Recommendations are grouped into two <b>profiles</b>: <b>Level 1</b> is the practical baseline with little operational impact, and <b>Level 2</b> adds defence-in-depth items for high-security environments that may affect function. The network-device benchmarks follow the three planes you already know: management plane (AAA, access rules, banners, passwords, SNMP), control plane (global services, logging, NTP, loopback), and data plane (routing authentication, source routing, uRPF, ACLs).</p>

<h3>The audit loop</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Audit loop">
<rect x="20" y="85" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">Baseline</text><text x="75" y="125" text-anchor="middle" class="svg-muted" font-size="12">choose L1 / L2</text>
<rect x="150" y="85" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="205" y="108" text-anchor="middle" class="svg-ink" font-size="13">Scan</text><text x="205" y="125" text-anchor="middle" class="svg-muted" font-size="12">PASS / FAIL</text>
<rect x="280" y="85" width="110" height="50" rx="8" fill="#fed7aa"/><text x="335" y="108" text-anchor="middle" class="svg-ink" font-size="13">Remediate</text><text x="335" y="125" text-anchor="middle" class="svg-muted" font-size="12">change window</text>
<rect x="410" y="85" width="110" height="50" rx="8" fill="#fde68a"/><text x="465" y="108" text-anchor="middle" class="svg-ink" font-size="13">Exceptions</text><text x="465" y="125" text-anchor="middle" class="svg-muted" font-size="12">documented</text>
<rect x="530" y="85" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="108" text-anchor="middle" class="svg-ink" font-size="13">Re-scan</text><text x="575" y="125" text-anchor="middle" class="svg-muted" font-size="12">drift</text>
<line x1="130" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="260" y1="110" x2="280" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="410" y2="110" stroke="#64748b" stroke-width="2"/><line x1="520" y1="110" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<path d="M575 135 L575 185 L205 185 L205 135" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="205" text-anchor="middle" class="svg-accent" font-size="12">repeat on every change and on a schedule</text>
</svg><p class="cap">An audit is a loop, not an event: scan, fix, document exceptions, and re-scan to catch drift.</p></div>
<p>In production, the scan is done by a tool: CIS's own assessment tool, the configuration compliance features of controllers such as Catalyst Center, or a script that parses running configurations. Every FAIL is either fixed or recorded as an <b>exception</b> with a reason, an owner and an expiry date. Configuration <b>drift</b> (someone adds <code>transport input telnet</code> during an outage and forgets it) is caught by re-scanning after every change and on a schedule.</p>

<h3>The lab audit: show hardening</h3>
<p>The labs include a built-in audit command, <code>show hardening</code>. It is a simulator feature that behaves like a small CIS scanner; real IOS XE has no such command. It checks ten Level 1 style items:</p>
<table class="cmp">
<tr><th>Check</th><th>Remediation</th></tr>
<tr><td>AAA is enabled</td><td><code>aaa new-model</code></td></tr>
<tr><td>enable secret is set</td><td><code>enable secret ...</code></td></tr>
<tr><td>password encryption on</td><td><code>service password-encryption</code></td></tr>
<tr><td>SSH forced to version 2</td><td><code>ip ssh version 2</code></td></tr>
<tr><td>VTY accepts SSH only</td><td><code>transport input ssh</code></td></tr>
<tr><td>brute-force protection</td><td><code>login block-for ...</code></td></tr>
<tr><td>web server disabled</td><td><code>no ip h&#116;tp server</code></td></tr>
<tr><td>no writable SNMP community</td><td>remove any <code>community ... RW</code>; use SNMPv3</td></tr>
<tr><td>syslog exported</td><td><code>logging host ...</code></td></tr>
<tr><td>NTP authenticated (if NTP used)</td><td><code>ntp authenticate</code> + key</td></tr>
</table>

<pre class="out">R1# show hardening

NK-OS device hardening audit (CIS-style baseline) - R1
================================================================
<span class="hl">[ FAIL ] AAA is enabled (aaa new-model)</span>
[ FAIL ] enable secret is set (not just enable password)
[ FAIL ] service password-encryption enabled
[ FAIL ] SSH forced to version 2
[ FAIL ] VTY lines accept ssh only (no telnet)
[ FAIL ] login block-for brute-force protection
[ FAIL ] HTTP server disabled (no ip h&#116;tp server)
[ PASS ] No writable SNMP community (RW) / prefer SNMPv3
[ FAIL ] Syslog exported to a logging host
[ PASS ] NTP authentication (if NTP configured)
================================================================
<span class="hl">Score: 2/10   Remediate: aaa-new-model, enable-secret, ...</span></pre>

<div class="eg"><p><b>Worked example (Lab 4, tasks 1 and 4).</b> Task 1 closes three items: <code>aaa new-model</code>, <code>username admin privilege 15 secret NK-Adm-26</code> with <code>aaa authentication login default local</code> (so you are never locked out), <code>enable secret NK-En-26</code> and <code>service password-encryption</code>. Chapter 9 closed SSHv2, VTY SSH-only, block-for and the web server; chapter 8 closed syslog. Running <code>show hardening</code> now reports <code>Score: 10/10   Fully hardened.</code> Note that <code>service password-encryption</code> only applies weak, reversible type 7 to leftover plain passwords; the real protection comes from <code>secret</code> hashes.</p></div>

<h3>The NOC turn-up checklist (Lab 5)</h3>
<p>A new device is not "in production" until the NOC can manage, monitor and audit it. In Lab 5, CORE arrives partly hardened (local user, enable secret, SSHv2, block-for, no web server). Work through the list in order, testing each step before moving on:</p>
<ol>
<li><b>AAA</b>: <code>aaa new-model</code>, <code>tacacs server ISE</code> (10.10.10.100, key NK-t4c-26), login authentication <code>group tacacs+ local</code>, exec authorization. Test: <code>test aaa group tacacs+ netadmin Adm!n-26 legacy</code>.</li>
<li><b>Monitoring</b>: view, group at <code>v3 priv</code>, user <code>nocmon</code> with SHA NocAuth!26 and AES 128 PrivMon!26. Test: <code>snmpget -v3 ... 10.10.10.1 sysName.0</code> from NMS.</li>
<li><b>Time</b>: <code>ntp authenticate</code>, key 1 NK-Ntp-26, trusted-key 1, <code>ntp server 10.10.10.200 key 1</code>. Test: <code>show ntp status</code> synchronized.</li>
<li><b>Logging</b>: <code>logging host 10.10.10.50</code>, <code>logging trap informational</code>. Test: messages visible on LOG.</li>
<li><b>Audit</b>: <code>show hardening</code> must show 0 fails before the NOC accepts the device.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> "Fixing" an audit by weakening something else, such as disabling NTP entirely to pass the NTP check, or turning off a security feature because it blocked traffic. The goal is a secure device, not a green score. Never disable a control just to make a check pass.</p></div>

<div class="exam"><p><b>Exam trap.</b> CIS Level 1 = practical baseline with minimal impact; Level 2 = stricter defence in depth that may affect operations. Type 7 (service password-encryption) is reversible obfuscation, not a hash; secrets use types 5, 8 or 9.</p></div>

<div class="scn"><h4>The audit that found a forgotten router</h4><p>A company ran its first CIS-style scan across 300 devices. 297 scored above 90 percent, but three old WAN routers scored 20 percent: Telnet on, SNMP community "private" RW, no logging host. They had been installed before the templates existed and never updated. The team remediated them in a change window, added the three to the monthly scan, and made "audit passes" a formal step in the NOC turn-up process.</p><p><b>Lesson:</b> audits find the forgotten devices that attackers find first; turn-up checklists stop new ones appearing.</p></div>

<div class="iv"><p class="q">"How would you prove that 500 network devices are hardened to a standard?"</p><p>Choose a baseline (CIS Level 1 for IOS XE, adapted to the organisation), automate the audit with a compliance tool or script against running configurations, fix failures in change windows, record exceptions with owner and expiry, re-scan on every change and on a schedule to detect drift, and report the score over time. Mention a turn-up checklist so new devices start compliant.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A CIS benchmark gives audit and remediation steps per recommendation, in Level 1 and Level 2 profiles.</li>
<li>Network benchmarks are organised by management, control and data plane.</li>
<li>Audit is a loop: baseline, scan, remediate, document exceptions, re-scan for drift.</li>
<li>The lab's <code>show hardening</code> checks ten items; Lab 4 and Lab 5 finish at 10/10.</li>
<li>A NOC turn-up checklist (AAA, SNMPv3, NTP, syslog, audit) makes every new device compliant from day one.</li>
</ul></div>
`,hi:`
<p>Har flight se pehle pilots ek printed checklist chalate hain bhale hi unhone hazaron baar udaan bhari ho. Checklist intelligence ke baare mein nahi hai; yeh time pressure mein ek bhi chhota item kabhi na bhoolne ke baare mein hai. <b>CIS benchmark</b> ek device platform ke liye pilot ki checklist hai, aur audit use chalana aur result likhna hai.</p>

<h3>CIS benchmark kya hai</h3>
<p>Center for Internet Security operating systems, cloud platforms aur network devices ke liye consensus hardening guides publish karta hai, jismein Cisco IOS XE aur firewalls bhi hain. Har <b>recommendation</b> mein ek title, ek rationale, ek audit procedure (<code>show</code> command aur kya dekhna hai), ek remediation (configuration), aur uska impact hota hai. Recommendations do <b>profiles</b> mein group hoti hain: <b>Level 1</b> kam operational impact wali practical baseline hai, aur <b>Level 2</b> high-security environments ke liye defence-in-depth items jodta hai jo function par asar daal sakte hain. Network-device benchmarks unhi teen planes ko follow karte hain jo aap jaante ho: management plane (AAA, access rules, banners, passwords, SNMP), control plane (global services, logging, NTP, loopback), aur data plane (routing authentication, source routing, uRPF, ACLs).</p>

<h3>Audit loop</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Audit loop">
<rect x="20" y="85" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">Baseline</text><text x="75" y="125" text-anchor="middle" class="svg-muted" font-size="12">L1 / L2 chuno</text>
<rect x="150" y="85" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="205" y="108" text-anchor="middle" class="svg-ink" font-size="13">Scan</text><text x="205" y="125" text-anchor="middle" class="svg-muted" font-size="12">PASS / FAIL</text>
<rect x="280" y="85" width="110" height="50" rx="8" fill="#fed7aa"/><text x="335" y="108" text-anchor="middle" class="svg-ink" font-size="13">Remediate</text><text x="335" y="125" text-anchor="middle" class="svg-muted" font-size="12">change window</text>
<rect x="410" y="85" width="110" height="50" rx="8" fill="#fde68a"/><text x="465" y="108" text-anchor="middle" class="svg-ink" font-size="13">Exceptions</text><text x="465" y="125" text-anchor="middle" class="svg-muted" font-size="12">documented</text>
<rect x="530" y="85" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="575" y="108" text-anchor="middle" class="svg-ink" font-size="13">Re-scan</text><text x="575" y="125" text-anchor="middle" class="svg-muted" font-size="12">drift</text>
<line x1="130" y1="110" x2="150" y2="110" stroke="#64748b" stroke-width="2"/><line x1="260" y1="110" x2="280" y2="110" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="410" y2="110" stroke="#64748b" stroke-width="2"/><line x1="520" y1="110" x2="530" y2="110" stroke="#64748b" stroke-width="2"/>
<path d="M575 135 L575 185 L205 185 L205 135" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="390" y="205" text-anchor="middle" class="svg-accent" font-size="12">har change par aur schedule par repeat</text>
</svg><p class="cap">Audit ek loop hai, event nahi: scan, fix, exceptions document, aur drift pakadne ke liye re-scan.</p></div>
<p>Production mein scan ek tool karta hai: CIS ka apna assessment tool, Catalyst Center jaise controllers ke configuration compliance features, ya running configurations parse karne wali script. Har FAIL ya to fix hota hai ya ek <b>exception</b> ke roop mein reason, owner aur expiry date ke saath record hota hai. Configuration <b>drift</b> (koi outage ke dauraan <code>transport input telnet</code> jodta hai aur bhool jaata hai) har change ke baad aur schedule par re-scan karke pakda jaata hai.</p>

<h3>Lab audit: show hardening</h3>
<p>Labs mein ek built-in audit command hai, <code>show hardening</code>. Yeh ek simulator feature hai jo chhote CIS scanner ki tarah behave karta hai; asli IOS XE mein aisa koi command nahi hai. Yeh das Level 1 style items check karta hai:</p>
<table class="cmp">
<tr><th>Check</th><th>Remediation</th></tr>
<tr><td>AAA enabled hai</td><td><code>aaa new-model</code></td></tr>
<tr><td>enable secret set hai</td><td><code>enable secret ...</code></td></tr>
<tr><td>password encryption on</td><td><code>service password-encryption</code></td></tr>
<tr><td>SSH version 2 par forced</td><td><code>ip ssh version 2</code></td></tr>
<tr><td>VTY sirf SSH accept karti hai</td><td><code>transport input ssh</code></td></tr>
<tr><td>brute-force protection</td><td><code>login block-for ...</code></td></tr>
<tr><td>web server disabled</td><td><code>no ip h&#116;tp server</code></td></tr>
<tr><td>koi writable SNMP community nahi</td><td>koi bhi <code>community ... RW</code> hatao; SNMPv3 use karo</td></tr>
<tr><td>syslog exported</td><td><code>logging host ...</code></td></tr>
<tr><td>NTP authenticated (agar NTP use ho)</td><td><code>ntp authenticate</code> + key</td></tr>
</table>

<pre class="out">R1# show hardening

NK-OS device hardening audit (CIS-style baseline) - R1
================================================================
<span class="hl">[ FAIL ] AAA is enabled (aaa new-model)</span>
[ FAIL ] enable secret is set (not just enable password)
[ FAIL ] service password-encryption enabled
[ FAIL ] SSH forced to version 2
[ FAIL ] VTY lines accept ssh only (no telnet)
[ FAIL ] login block-for brute-force protection
[ FAIL ] HTTP server disabled (no ip h&#116;tp server)
[ PASS ] No writable SNMP community (RW) / prefer SNMPv3
[ FAIL ] Syslog exported to a logging host
[ PASS ] NTP authentication (if NTP configured)
================================================================
<span class="hl">Score: 2/10   Remediate: aaa-new-model, enable-secret, ...</span></pre>

<div class="eg"><p><b>Worked example (Lab 4, tasks 1 aur 4).</b> Task 1 teen items band karta hai: <code>aaa new-model</code>, <code>aaa authentication login default local</code> ke saath <code>username admin privilege 15 secret NK-Adm-26</code> (taaki aap kabhi lock out na ho), <code>enable secret NK-En-26</code> aur <code>service password-encryption</code>. Chapter 9 ne SSHv2, VTY SSH-only, block-for aur web server band kiye; chapter 8 ne syslog band kiya. Ab <code>show hardening</code> chalane par <code>Score: 10/10   Fully hardened.</code> report hota hai. Dhyan do ki <code>service password-encryption</code> bache hue plain passwords par sirf kamzor, reversible type 7 lagata hai; asli protection <code>secret</code> hashes se aati hai.</p></div>

<h3>NOC turn-up checklist (Lab 5)</h3>
<p>Naya device tab tak "production mein" nahi hai jab tak NOC use manage, monitor aur audit na kar sake. Lab 5 mein CORE partly hardened aata hai (local user, enable secret, SSHv2, block-for, koi web server nahi). List ko order mein poora karo, har step ko aage badhne se pehle test karte hue:</p>
<ol>
<li><b>AAA</b>: <code>aaa new-model</code>, <code>tacacs server ISE</code> (10.10.10.100, key NK-t4c-26), login authentication <code>group tacacs+ local</code>, exec authorization. Test: <code>test aaa group tacacs+ netadmin Adm!n-26 legacy</code>.</li>
<li><b>Monitoring</b>: view, <code>v3 priv</code> par group, SHA NocAuth!26 aur AES 128 PrivMon!26 ke saath user <code>nocmon</code>. Test: NMS se <code>snmpget -v3 ... 10.10.10.1 sysName.0</code>.</li>
<li><b>Time</b>: <code>ntp authenticate</code>, key 1 NK-Ntp-26, trusted-key 1, <code>ntp server 10.10.10.200 key 1</code>. Test: <code>show ntp status</code> synchronized.</li>
<li><b>Logging</b>: <code>logging host 10.10.10.50</code>, <code>logging trap informational</code>. Test: LOG par messages dikhein.</li>
<li><b>Audit</b>: NOC device accept kare usse pehle <code>show hardening</code> 0 fails dikhaye.</li>
</ol>

<div class="warn"><p><b>Common galti.</b> Audit ko kuch aur kamzor karke "fix" karna, jaise NTP check pass karne ke liye NTP poori tarah band kar dena, ya ek security feature band karna kyunki usne traffic block kiya. Lakshya secure device hai, green score nahi. Sirf check pass karane ke liye kabhi control disable mat karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> CIS Level 1 = minimal impact wali practical baseline; Level 2 = stricter defence in depth jo operations par asar daal sakta hai. Type 7 (service password-encryption) reversible obfuscation hai, hash nahi; secrets types 5, 8 ya 9 use karte hain.</p></div>

<div class="scn"><h4>Audit jisne ek bhoola hua router dhoondha</h4><p>Ek company ne 300 devices par apna pehla CIS-style scan chalaya. 297 ne 90 percent se upar score kiya, par teen purane WAN routers ne 20 percent: Telnet on, SNMP community "private" RW, koi logging host nahi. Woh templates banne se pehle install hue the aur kabhi update nahi hue. Team ne unhe change window mein remediate kiya, teeno ko monthly scan mein joda, aur "audit passes" ko NOC turn-up process ka formal step bana diya.</p><p><b>Seekh:</b> audits woh bhoole hue devices dhoondhte hain jo attackers pehle dhoondhte hain; turn-up checklists naye aise devices aane se rokti hain.</p></div>

<div class="iv"><p class="q">"Aap kaise sabit karoge ki 500 network devices ek standard tak hardened hain?"</p><p>Ek baseline chuno (IOS XE ke liye CIS Level 1, organisation ke hisaab se adapt), running configurations ke against compliance tool ya script se audit automate karo, failures change windows mein fix karo, exceptions owner aur expiry ke saath record karo, drift pakadne ke liye har change par aur schedule par re-scan karo, aur samay ke saath score report karo. Turn-up checklist ka zikr karo taaki naye devices compliant shuru hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CIS benchmark har recommendation ke liye audit aur remediation steps deta hai, Level 1 aur Level 2 profiles mein.</li>
<li>Network benchmarks management, control aur data plane ke hisaab se organised hain.</li>
<li>Audit ek loop hai: baseline, scan, remediate, exceptions document, drift ke liye re-scan.</li>
<li>Lab ka <code>show hardening</code> das items check karta hai; Lab 4 aur Lab 5 10/10 par khatam hote hain.</li>
<li>NOC turn-up checklist (AAA, SNMPv3, NTP, syslog, audit) har naye device ko pehle din se compliant banati hai.</li>
</ul></div>
`}};export{e as default};