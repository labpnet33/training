var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Back at the bank branch from chapter 1. The back office now has a proper guard. Every member of staff shows a personal badge that head office checks (TACACS+ authentication against ISE), the badge decides which drawers open (exec and command authorization), every drawer logs who opened it (accounting), the sealed master key is used only when the phone line to head office is dead (local fallback on ERROR), the CCTV recorder is locked and sends a copy off-site (SNMPv3 and exported syslog), the wall clock is set only from a trusted source (authenticated NTP), the staff door has one hardened lock reachable only from the staff corridor (SSHv2 with access-class, out-of-band management), and an auditor walks through with a checklist every quarter (the CIS benchmark).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="The secure management plane on one page">
<rect x="10" y="20" width="200" height="60" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Who: AAA</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">TACACS+ to ISE, local fallback</text>
<rect x="220" y="20" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">How: secure transport</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">SSHv2, SCP, NETCONF</text>
<rect x="430" y="20" width="200" height="60" rx="8" fill="#fde68a"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">From where: ACLs</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">access-class, OOB, MPP</text>
<rect x="10" y="110" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="135" text-anchor="middle" class="svg-ink" font-size="13">Watch: SNMPv3</text><text x="110" y="154" text-anchor="middle" class="svg-muted" font-size="12">authPriv, SHA + AES</text>
<rect x="220" y="110" width="200" height="60" rx="8" fill="#fed7aa"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">When: NTP auth</text><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="12">key + trusted-key</text>
<rect x="430" y="110" width="200" height="60" rx="8" fill="#e2e8f0"/><text x="530" y="135" text-anchor="middle" class="svg-ink" font-size="13">Record: syslog, NetFlow</text><text x="530" y="154" text-anchor="middle" class="svg-muted" font-size="12">export, TLS 6514</text>
<rect x="120" y="195" width="400" height="40" rx="8" fill="#bae6fd"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">Prove it: CIS benchmark audit, fix, re-run</text>
</svg><p class="cap">Six questions every management plane must answer, and the audit that proves the answers.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the data, control and management planes and the main protection for each (ACLs/uRPF, CoPP and routing authentication, the controls in this module).</li>
<li>Compare TACACS+ and RADIUS: ports, what is encrypted, separation of AAA, command authorization, device administration versus network access.</li>
<li>Configure <code>aaa new-model</code>, a TACACS+ server, and login, exec and command method lists with a local fallback, and apply them to the VTY lines (Lab 1).</li>
<li>Explain why fallback happens only on ERROR, and predict what a user sees on a FAIL.</li>
<li>Verify with <code>test aaa</code>, <code>show aaa servers</code>, <code>show privilege</code> and the ISE log; fix an unknown-NAS and a key mismatch without weakening the design (Lab 2).</li>
<li>Configure SNMPv3 view, group and user at authPriv and poll with <code>snmpget -v3 -l authPriv</code> (Lab 3).</li>
<li>Configure authenticated NTP and read <code>show ntp associations</code> and <code>show ntp status</code> (Lab 3).</li>
<li>Export syslog with the right trap level and timestamps, and explain syslog over TLS on TCP 6514 (Lab 4).</li>
<li>Harden SSH: version 2, 2048-bit RSA, strong algorithms, exec-timeout, access-class, login block-for (Lab 4).</li>
<li>Describe NetFlow as a security telemetry source, out-of-band management and Management Plane Protection.</li>
<li>Run a CIS-style audit, remediate every FAIL and complete a NOC turn-up (Labs 4 and 5).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAS</dt><dd>Network access server: the router, switch or firewall acting as the AAA client.</dd>
<dt>Method list</dt><dd>An ordered list of AAA methods; the next method is tried only on ERROR.</dd>
<dt>Command set / shell profile</dt><dd>ISE policy results for TACACS+: allowed commands and the privilege level.</dd>
<dt>Break-glass account</dt><dd>A local emergency account used only when AAA servers are unreachable; rotated after use.</dd>
<dt>authPriv</dt><dd>SNMPv3 security level with authentication (SHA) and encryption (AES).</dd>
<dt>Engine ID</dt><dd>The SNMPv3 identity of an agent; SNMPv3 user keys are localised to it.</dd>
<dt>Trusted key</dt><dd>An NTP key ID the device accepts for synchronisation.</dd>
<dt>MPP</dt><dd>Management Plane Protection: lets management protocols in only on named interfaces.</dd>
<dt>OOB</dt><dd>Out-of-band management: a separate network or console path used only for management.</dd>
<dt>CIS benchmark</dt><dd>A consensus hardening checklist per platform, with Level 1 and Level 2 profiles.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp">
<tr><th>Topic</th><th>Fact</th></tr>
<tr><td>TACACS+</td><td>TCP 49, whole body encrypted, AAA separated, per-command authorization</td></tr>
<tr><td>RADIUS</td><td>UDP 1812/1813 (legacy 1645/1646), only the password hidden, authn and authz combined</td></tr>
<tr><td>Fallback</td><td>next method on ERROR (no answer), never on FAIL (reject)</td></tr>
<tr><td>SNMP</td><td>UDP 161 polls, UDP 162 traps; v3 levels noAuthNoPriv, authNoPriv, authPriv</td></tr>
<tr><td>NTP</td><td>UDP 123; authenticate + authentication-key + trusted-key + server ... key</td></tr>
<tr><td>Syslog</td><td>UDP 514 by default, TLS on TCP 6514; severities 0 (emergencies) to 7 (debugging)</td></tr>
<tr><td>SSH</td><td>TCP 22; version 2; RSA key of at least 2048 bits recommended</td></tr>
<tr><td>Programmatic</td><td>NETCONF over SSH on TCP 830; RESTCONF over HTTPS</td></tr>
<tr><td>NetFlow</td><td>v9 and IPFIX export flow records to a collector such as Secure Network Analytics</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! AAA with TACACS+</span>
aaa new-model
tacacs server ISE
 address ipv4 10.10.10.100
 key NK-t4c-26
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa authorization commands 15 default group tacacs+ local
aaa accounting exec default start-stop group tacacs+
aaa accounting commands 15 default start-stop group tacacs+
<span class="c">! SNMPv3, NTP, syslog, SSH</span>
snmp-server group NKADMIN v3 priv read NKVIEW
snmp-server user nkadmin NKADMIN v3 auth sha AuthPass!26 priv aes 128 PrivPass!26
ntp authenticate
ntp authentication-key 1 md5 NK-Ntp-26
ntp trusted-key 1
ntp server 10.10.10.200 key 1
logging host 10.10.10.50
logging trap informational
ip ssh version 2
login block-for 60 attempts 3 within 30
no ip h&#116;tp server</pre>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
<span class="hl">User was successfully authenticated.</span>
R1# show ntp status
<span class="hl">Clock is synchronized, stratum 4, reference is 10.10.10.200</span></pre>

<div class="eg"><p><b>Worked example: a five-minute self-check.</b> Take any device and ask six questions. Who can log in? (<code>show running-config | include aaa</code>.) Over what? (<code>show ip ssh</code> shows version 2.0.) From where? (<code>show running-config | section line vty</code> shows an access-class.) Who watches it? (<code>show snmp user</code> shows authPriv users, <code>show snmp community</code> shows no RW.) What time is it? (<code>show ntp status</code> synchronised.) Where do records go? (<code>show logging</code> lists a host with lines logged.) Six yes answers is a good device; each no is a ticket.</p></div>

<div class="warn"><p><b>Common mistakes to avoid in the exam and in production.</b> Enabling <code>aaa new-model</code> without a login list or local user; putting <code>local</code> first; forgetting exec authorization so admins land at level 1; enabling command authorization without a working fallback; leaving an SNMP RW community; <code>ntp authenticate</code> without <code>ntp trusted-key</code>; <code>logging trap debugging</code> to the collector; and "fixing" an audit by switching a control off.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> TACACS+ for administrators, RADIUS for network access. Only TACACS+ does per-command authorization. RADIUS hides only the password. The next method is tried on ERROR only. authPriv is the only SNMPv3 level with encryption. A lower syslog number is more severe. MPP and access-class restrict where management comes from; they do not encrypt anything.</p></div>

<div class="scn"><h4>The first audit after the module</h4><p>A trainee engineer ran this module's checklist on twenty branch routers. Fourteen still had an SNMPv2c RW community from an old monitoring tool, nine had no NTP authentication, and six sent syslog nowhere. None of the routers had been attacked, yet none could have proved it either. Over two change windows the team moved monitoring to SNMPv3 authPriv, pointed NTP at an authenticated internal source and exported logs to the SIEM. The next CIS audit scored every router clean.</p><p><b>Lesson:</b> the management plane decays quietly; a repeatable checklist, run on a schedule, is what keeps it hard.</p></div>

<div class="iv"><p class="q">"You have inherited 200 network devices. What are your first management-plane actions?"</p><p>Get visibility first: inventory and a CIS-style audit. Then close the biggest doors: TACACS+ to ISE with personal accounts, command authorization and accounting, plus a vaulted break-glass account; SSHv2 only with access-class from the management subnets or an out-of-band network; SNMPv3 authPriv replacing v2c; authenticated NTP; syslog and NetFlow to the SIEM. Automate the audit so drift is caught, and roll changes out in waves with console access ready.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The management plane holds the master keys; protect who, how, from where, and record everything.</li>
<li>TACACS+ with ISE for device administration: per-user login, command authorization, accounting, local fallback on ERROR.</li>
<li>SNMPv3 authPriv, authenticated NTP and exported syslog make monitoring, time and records trustworthy.</li>
<li>SSHv2 with access-class, exec-timeout and login block-for; OOB and MPP narrow where management is allowed.</li>
<li>A CIS benchmark audit turns all of this into a score you can fix, re-run and hand to the NOC.</li>
</ul></div>
`,hi:`
<p>Chapter 1 wali bank branch par wapas chalte hain. Back office mein ab ek proper guard hai. Har staff member ek personal badge dikhata hai jise head office check karta hai (ISE ke against TACACS+ authentication), badge tay karta hai kaunse drawers khulenge (exec aur command authorization), har drawer log karta hai kisne use khola (accounting), sealed master key sirf tab use hoti hai jab head office ki phone line dead ho (ERROR par local fallback), CCTV recorder locked hai aur ek copy off-site bhejta hai (SNMPv3 aur exported syslog), deewar ki ghadi sirf trusted source se set hoti hai (authenticated NTP), staff door par ek hardened lock hai jo sirf staff corridor se pahunch mein hai (access-class ke saath SSHv2, out-of-band management), aur har quarter ek auditor checklist lekar ghoomta hai (CIS benchmark).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ek page par secure management plane">
<rect x="10" y="20" width="200" height="60" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Kaun: AAA</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">ISE ko TACACS+, local fallback</text>
<rect x="220" y="20" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Kaise: secure transport</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">SSHv2, SCP, NETCONF</text>
<rect x="430" y="20" width="200" height="60" rx="8" fill="#fde68a"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Kahan se: ACLs</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">access-class, OOB, MPP</text>
<rect x="10" y="110" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="135" text-anchor="middle" class="svg-ink" font-size="13">Nazar: SNMPv3</text><text x="110" y="154" text-anchor="middle" class="svg-muted" font-size="12">authPriv, SHA + AES</text>
<rect x="220" y="110" width="200" height="60" rx="8" fill="#fed7aa"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">Kab: NTP auth</text><text x="320" y="154" text-anchor="middle" class="svg-muted" font-size="12">key + trusted-key</text>
<rect x="430" y="110" width="200" height="60" rx="8" fill="#e2e8f0"/><text x="530" y="135" text-anchor="middle" class="svg-ink" font-size="13">Record: syslog, NetFlow</text><text x="530" y="154" text-anchor="middle" class="svg-muted" font-size="12">export, TLS 6514</text>
<rect x="120" y="195" width="400" height="40" rx="8" fill="#bae6fd"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">Sabit karo: CIS audit, fix, re-run</text>
</svg><p class="cap">Chhe sawaal jinka jawab har management plane ko dena chahiye, aur woh audit jo jawabon ko sabit karta hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Data, control aur management planes ke naam batao aur har ek ki main protection (ACLs/uRPF, CoPP aur routing authentication, is module ke controls).</li>
<li>TACACS+ aur RADIUS compare karo: ports, kya encrypt hota hai, AAA ka separation, command authorization, device administration vs network access.</li>
<li><code>aaa new-model</code>, ek TACACS+ server, aur local fallback ke saath login, exec aur command method lists configure karo, aur unhe VTY lines par apply karo (Lab 1).</li>
<li>Samjhao fallback sirf ERROR par kyun hota hai, aur predict karo FAIL par user kya dekhta hai.</li>
<li><code>test aaa</code>, <code>show aaa servers</code>, <code>show privilege</code> aur ISE log se verify karo; unknown-NAS aur key mismatch ko design kamzor kiye bina fix karo (Lab 2).</li>
<li>SNMPv3 view, group aur user authPriv par configure karo aur <code>snmpget -v3 -l authPriv</code> se poll karo (Lab 3).</li>
<li>Authenticated NTP configure karo aur <code>show ntp associations</code> aur <code>show ntp status</code> padho (Lab 3).</li>
<li>Sahi trap level aur timestamps ke saath syslog export karo, aur TCP 6514 par syslog over TLS samjhao (Lab 4).</li>
<li>SSH harden karo: version 2, 2048-bit RSA, strong algorithms, exec-timeout, access-class, login block-for (Lab 4).</li>
<li>NetFlow ko security telemetry source ke roop mein, out-of-band management aur Management Plane Protection ko describe karo.</li>
<li>CIS-style audit chalao, har FAIL remediate karo aur NOC turn-up poora karo (Labs 4 aur 5).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAS</dt><dd>Network access server: router, switch ya firewall jo AAA client ka kaam karta hai.</dd>
<dt>Method list</dt><dd>AAA methods ki ordered list; agla method sirf ERROR par try hota hai.</dd>
<dt>Command set / shell profile</dt><dd>TACACS+ ke liye ISE policy results: allowed commands aur privilege level.</dd>
<dt>Break-glass account</dt><dd>Local emergency account jo sirf AAA servers unreachable hone par use hota hai; use ke baad rotate hota hai.</dd>
<dt>authPriv</dt><dd>SNMPv3 security level jismein authentication (SHA) aur encryption (AES) dono hain.</dd>
<dt>Engine ID</dt><dd>Agent ki SNMPv3 identity; SNMPv3 user keys isi par localised hoti hain.</dd>
<dt>Trusted key</dt><dd>Woh NTP key ID jise device synchronisation ke liye accept karta hai.</dd>
<dt>MPP</dt><dd>Management Plane Protection: management protocols ko sirf named interfaces par andar aane deta hai.</dd>
<dt>OOB</dt><dd>Out-of-band management: ek alag network ya console path jo sirf management ke liye use hota hai.</dd>
<dt>CIS benchmark</dt><dd>Har platform ke liye consensus hardening checklist, Level 1 aur Level 2 profiles ke saath.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp">
<tr><th>Topic</th><th>Fact</th></tr>
<tr><td>TACACS+</td><td>TCP 49, poora body encrypted, AAA alag, per-command authorization</td></tr>
<tr><td>RADIUS</td><td>UDP 1812/1813 (legacy 1645/1646), sirf password chhupaata hai, authn aur authz combined</td></tr>
<tr><td>Fallback</td><td>agla method ERROR (koi jawab nahi) par, FAIL (reject) par kabhi nahi</td></tr>
<tr><td>SNMP</td><td>UDP 161 polls, UDP 162 traps; v3 levels noAuthNoPriv, authNoPriv, authPriv</td></tr>
<tr><td>NTP</td><td>UDP 123; authenticate + authentication-key + trusted-key + server ... key</td></tr>
<tr><td>Syslog</td><td>default UDP 514, TLS TCP 6514 par; severities 0 (emergencies) se 7 (debugging)</td></tr>
<tr><td>SSH</td><td>TCP 22; version 2; kam se kam 2048 bits ki RSA key recommended</td></tr>
<tr><td>Programmatic</td><td>NETCONF SSH par TCP 830; RESTCONF HTTPS par</td></tr>
<tr><td>NetFlow</td><td>v9 aur IPFIX flow records ko Secure Network Analytics jaise collector ko export karte hain</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! TACACS+ ke saath AAA</span>
aaa new-model
tacacs server ISE
 address ipv4 10.10.10.100
 key NK-t4c-26
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa authorization commands 15 default group tacacs+ local
aaa accounting exec default start-stop group tacacs+
aaa accounting commands 15 default start-stop group tacacs+
<span class="c">! SNMPv3, NTP, syslog, SSH</span>
snmp-server group NKADMIN v3 priv read NKVIEW
snmp-server user nkadmin NKADMIN v3 auth sha AuthPass!26 priv aes 128 PrivPass!26
ntp authenticate
ntp authentication-key 1 md5 NK-Ntp-26
ntp trusted-key 1
ntp server 10.10.10.200 key 1
logging host 10.10.10.50
logging trap informational
ip ssh version 2
login block-for 60 attempts 3 within 30
no ip h&#116;tp server</pre>
<pre class="out">R1# test aaa group tacacs+ netadmin Adm!n-26 legacy
<span class="hl">User was successfully authenticated.</span>
R1# show ntp status
<span class="hl">Clock is synchronized, stratum 4, reference is 10.10.10.200</span></pre>

<div class="eg"><p><b>Worked example: paanch minute ka self-check.</b> Koi bhi device lo aur chhe sawaal poocho. Kaun login kar sakta hai? (<code>show running-config | include aaa</code>.) Kis par? (<code>show ip ssh</code> version 2.0 dikhata hai.) Kahan se? (<code>show running-config | section line vty</code> ek access-class dikhata hai.) Use kaun dekhta hai? (<code>show snmp user</code> authPriv users dikhata hai, <code>show snmp community</code> koi RW nahi dikhata.) Time kya hai? (<code>show ntp status</code> synchronised.) Records kahan jaate hain? (<code>show logging</code> lines logged ke saath ek host list karta hai.) Chhe haan matlab achha device; har na ek ticket hai.</p></div>

<div class="warn"><p><b>Exam aur production mein bachne wali common galtiyan.</b> Bina login list ya local user ke <code>aaa new-model</code> enable karna; <code>local</code> ko pehle rakhna; exec authorization bhoolna jisse admins level 1 par aate hain; bina working fallback ke command authorization enable karna; SNMP RW community chhod dena; <code>ntp trusted-key</code> ke bina <code>ntp authenticate</code>; collector ko <code>logging trap debugging</code>; aur ek control band karke audit "fix" karna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Administrators ke liye TACACS+, network access ke liye RADIUS. Per-command authorization sirf TACACS+ karta hai. RADIUS sirf password chhupaata hai. Agla method sirf ERROR par try hota hai. authPriv hi ek SNMPv3 level hai jismein encryption hai. Syslog mein chhota number zyada severe hai. MPP aur access-class restrict karte hain management kahan se aaye; woh kuch encrypt nahi karte.</p></div>

<div class="scn"><h4>Module ke baad pehla audit</h4><p>Ek trainee engineer ne is module ki checklist bees branch routers par chalayi. Chaudah par ek purane monitoring tool ki SNMPv2c RW community abhi bhi thi, nau par koi NTP authentication nahi thi, aur chhe syslog kahin nahi bhej rahe the. Kisi bhi router par attack nahi hua tha, par koi bhi ise sabit bhi nahi kar sakta tha. Do change windows mein team ne monitoring ko SNMPv3 authPriv par shift kiya, NTP ko ek authenticated internal source par point kiya aur logs SIEM ko export kiye. Agle CIS audit mein har router ka score clean aaya.</p><p><b>Seekh:</b> management plane chupchaap kamzor hota jaata hai; schedule par chalne wali ek repeatable checklist hi use hard rakhti hai.</p></div>

<div class="iv"><p class="q">"Aapko 200 network devices viraasat mein mile hain. Aapke pehle management-plane actions kya honge?"</p><p>Pehle visibility lo: inventory aur ek CIS-style audit. Phir sabse bade darwaze band karo: personal accounts, command authorization aur accounting ke saath ISE ko TACACS+, plus ek vaulted break-glass account; management subnets ya out-of-band network se access-class ke saath sirf SSHv2; v2c ki jagah SNMPv3 authPriv; authenticated NTP; SIEM ko syslog aur NetFlow. Audit ko automate karo taaki drift pakda jaaye, aur console access tayyar rakhkar changes waves mein roll out karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management plane mein master keys hain; kaun, kaise, kahan se protect karo, aur sab kuch record karo.</li>
<li>Device administration ke liye ISE ke saath TACACS+: per-user login, command authorization, accounting, ERROR par local fallback.</li>
<li>SNMPv3 authPriv, authenticated NTP aur exported syslog monitoring, time aur records ko bharosemand banate hain.</li>
<li>access-class, exec-timeout aur login block-for ke saath SSHv2; OOB aur MPP seemit karte hain management kahan se allowed hai.</li>
<li>CIS benchmark audit is sab ko ek score mein badal deta hai jise aap fix, re-run aur NOC ko hand over kar sakte ho.</li>
</ul></div>
`}};export{e as default};