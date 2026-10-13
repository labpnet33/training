var e={id:`authz-accounting`,h:{en:`Authorization and accounting: privilege levels, command authorization and audit trails`,hi:`Authorization aur accounting: privilege levels, command authorization aur audit trails`},body:{en:`
<p>In a hospital, a visitor badge opens the lobby, a nurse badge opens the wards, and only a pharmacist badge opens the medicine store. Every door also logs which badge opened it and when. Authentication proved who you are; <b>authorization</b> decides which doors open for you, and <b>accounting</b> is the door log. This chapter finishes Lab 1.</p>

<h3>Exec authorization: which privilege level do you land at?</h3>
<p>IOS has privilege levels 0 to 15. Level 1 is user EXEC (the <code>&gt;</code> prompt, mostly show commands); level 15 is privileged EXEC (the <code>#</code> prompt, everything). When a user logs in through TACACS+, the level they get comes from the server, but only if the router asks for it:</p>
<pre class="code">aaa authorization exec default group tacacs+ local if-authenticated</pre>
<p>This sends an authorization request for the "shell" service after login. ISE answers with the shell profile, for example <code>priv-lvl=15</code> for netadmin. Without this line, every TACACS+ user lands at level 1 and must know the enable secret to go further, which defeats the point of personal accounts. The optional <code>if-authenticated</code> method says "if the servers are down and the user is already authenticated, allow the shell"; it prevents a lockout during an outage, but use it consciously.</p>

<h3>Command authorization: check every command</h3>
<pre class="code"><span class="c">! ask ISE before running any level-15 command</span>
aaa authorization commands 15 default group tacacs+ local
<span class="c">! optionally also level-1 commands (show, ping ...)</span>
aaa authorization commands 1 default group tacacs+ local
<span class="c">! apply the same checks on the console (off by default)</span>
aaa authorization console</pre>
<p>With <code>commands 15</code>, every command that belongs to level 15 (such as <code>configure terminal</code>, <code>reload</code>, <code>debug</code>) is sent to ISE with its arguments before it runs. ISE evaluates the user's <b>command set</b> and answers PASS or FAIL. Configuration-mode commands are authorized too once command authorization is configured. Commands at level 1 are checked only if you also configure <code>commands 1</code>. Authorization on the console line is skipped unless you add <code>aaa authorization console</code>, which protects you from locking yourself out of the console by accident.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Command authorization decisions">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">netadmin (priv 15)</text><text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">configure terminal</text>
<rect x="20" y="140" width="170" height="50" rx="8" fill="#fed7aa"/><text x="105" y="162" text-anchor="middle" class="svg-ink" font-size="13">helpdesk (priv 1)</text><text x="105" y="180" text-anchor="middle" class="svg-muted" font-size="12">configure terminal</text>
<rect x="250" y="80" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">R1 asks ISE</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">AUTHOR cmd=...</text>
<rect x="450" y="80" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="102" text-anchor="middle" class="svg-ink" font-size="13">ISE command sets</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="12">PermitAll / ShowOnly</text>
<line x1="190" y1="45" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="190" y1="165" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">netadmin: PASS</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">helpdesk: FAIL</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">every decision is also written to accounting</text>
</svg><p class="cap">The same command gets different answers because ISE returns different command sets per group.</p></div>

<h3>Accounting: the audit trail</h3>
<pre class="code">aaa accounting exec default start-stop group tacacs+
aaa accounting commands 1 default start-stop group tacacs+
aaa accounting commands 15 default start-stop group tacacs+</pre>
<p><b>Exec accounting</b> records a START when the session begins (user, source address, line) and a STOP when it ends (with elapsed time). <b>Command accounting</b> records each command with the username and timestamp. <code>start-stop</code> sends both records; <code>stop-only</code> sends only the STOP; <code>none</code> disables it. In ISE these land in the TACACS accounting report, where you can search "who ran <code>no router ospf</code> on R1 last night". Accounting has no local fallback: if ISE is down the records are simply lost, which is one reason to also send syslog to a collector.</p>

<h3>Verification</h3>
<pre class="out">PC-ADMIN&gt; ssh -l netadmin 10.10.10.1
Password:
R1# show privilege
<span class="hl">Current privilege level is 15</span>

! logged in as helpdesk
R1&gt; show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.10.10.1      YES manual up                    up
R1&gt; enable
Password:
R1# configure terminal
<span class="hl">Command authorization failed.</span></pre>
<p>In the lab, <code>aaa-server show accounting</code> on ISE lists the START and STOP records for netadmin's session, the same information the real ISE shows in its TACACS accounting report.</p>

<div class="eg"><p><b>Worked example (Lab 1, tasks 3 and 4).</b> You add <code>aaa authorization commands 15 default group tacacs+ local</code> and <code>aaa accounting commands 15 default start-stop group tacacs+</code>. From PC-ADMIN you run <code>ssh -l netadmin 10.10.10.1</code> with password Adm!n-26, land at <code>R1#</code>, and <code>show privilege</code> answers 15. Configure terminal works. The checker then asks ISE on behalf of helpdesk: <code>show ip interface brief</code> is permitted, <code>configure terminal</code> is denied. On ISE, the accounting list shows a START record for netadmin from 10.10.11.9. The answer to the task question is 15.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>aaa authorization commands 15</code> with only <code>group tacacs+</code> and no fallback, then losing the path to ISE. Every level-15 command now returns ERROR with nowhere to go, so you can log in but cannot even type <code>configure terminal</code>. Always end command authorization with <code>local</code> or <code>if-authenticated</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Without <code>aaa authorization exec</code>, the privilege level returned by the server is ignored and users start at level 1. Command authorization is per level (<code>commands 1</code>, <code>commands 15</code>) and does not apply to the console unless <code>aaa authorization console</code> is configured.</p></div>

<div class="scn"><h4>The junior who reloaded the core</h4><p>A new NOC analyst, meant to be read-only, typed <code>reload</code> on a distribution switch while copying commands from a wiki page. The switch used RADIUS with privilege 15 for everybody in the NOC group. After the incident the team moved to TACACS+: NOC analysts received a shell profile with privilege 15 but a command set that permits only show, ping, traceroute and clear counters. The same mistake a month later returned "Command authorization failed" and appeared in the accounting report.</p><p><b>Lesson:</b> privilege level alone is too coarse; command sets give least privilege with an audit trail.</p></div>

<div class="iv"><p class="q">"What is the difference between exec authorization and command authorization?"</p><p>Exec authorization happens once at login and decides whether the user gets a shell and at which privilege level (the server returns priv-lvl). Command authorization happens for every command at the configured levels and checks it against the user's command set. Mention the fallback method, the console exception and that accounting records both sessions and commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>aaa authorization exec</code> applies the server's privilege level; without it users land at level 1.</li>
<li><code>aaa authorization commands 15</code> checks every level-15 command against ISE command sets.</li>
<li>Console authorization needs <code>aaa authorization console</code>; always keep a fallback method.</li>
<li>Exec and command accounting with start-stop give a searchable, per-user audit trail on ISE.</li>
<li>Least privilege = right shell profile plus a tight command set, not everybody at level 15.</li>
</ul></div>
`,hi:`
<p>Hospital mein visitor badge lobby kholta hai, nurse badge wards kholta hai, aur sirf pharmacist badge medicine store kholta hai. Har darwaza yeh bhi log karta hai ki kis badge ne use kab khola. Authentication ne sabit kiya aap kaun ho; <b>authorization</b> tay karta hai aapke liye kaunse darwaze khulenge, aur <b>accounting</b> darwaze ka log hai. Yeh chapter Lab 1 poora karta hai.</p>

<h3>Exec authorization: aap kis privilege level par pahunchte ho?</h3>
<p>IOS mein privilege levels 0 se 15 hain. Level 1 user EXEC hai (<code>&gt;</code> prompt, zyada tar show commands); level 15 privileged EXEC hai (<code>#</code> prompt, sab kuch). Jab user TACACS+ se login karta hai, to use milne wala level server se aata hai, par sirf tab jab router use maange:</p>
<pre class="code">aaa authorization exec default group tacacs+ local if-authenticated</pre>
<p>Yeh login ke baad "shell" service ke liye authorization request bhejta hai. ISE shell profile ke saath jawab deta hai, jaise netadmin ke liye <code>priv-lvl=15</code>. Is line ke bina, har TACACS+ user level 1 par aata hai aur aage jaane ke liye use enable secret pata hona chahiye, jo personal accounts ka poora maksad khatam kar deta hai. Optional <code>if-authenticated</code> method kehta hai "agar servers down hain aur user pehle se authenticated hai, to shell allow karo"; yeh outage mein lockout rokta hai, par ise soch-samajh kar use karo.</p>

<h3>Command authorization: har command check karo</h3>
<pre class="code"><span class="c">! koi bhi level-15 command chalane se pehle ISE se poocho</span>
aaa authorization commands 15 default group tacacs+ local
<span class="c">! optionally level-1 commands bhi (show, ping ...)</span>
aaa authorization commands 1 default group tacacs+ local
<span class="c">! console par bhi same checks lagao (default mein off)</span>
aaa authorization console</pre>
<p><code>commands 15</code> ke saath, level 15 ka har command (jaise <code>configure terminal</code>, <code>reload</code>, <code>debug</code>) chalne se pehle apne arguments ke saath ISE ko bheja jaata hai. ISE user ka <b>command set</b> evaluate karta hai aur PASS ya FAIL jawab deta hai. Command authorization configure hone par configuration-mode commands bhi authorize hote hain. Level 1 ke commands tabhi check hote hain jab aap <code>commands 1</code> bhi configure karo. Console line par authorization skip hota hai jab tak aap <code>aaa authorization console</code> na jodo, jo aapko galti se console se lock out hone se bachata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Command authorization decisions">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">netadmin (priv 15)</text><text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">configure terminal</text>
<rect x="20" y="140" width="170" height="50" rx="8" fill="#fed7aa"/><text x="105" y="162" text-anchor="middle" class="svg-ink" font-size="13">helpdesk (priv 1)</text><text x="105" y="180" text-anchor="middle" class="svg-muted" font-size="12">configure terminal</text>
<rect x="250" y="80" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">R1 ISE se poochta hai</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">AUTHOR cmd=...</text>
<rect x="450" y="80" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="102" text-anchor="middle" class="svg-ink" font-size="13">ISE command sets</text><text x="535" y="120" text-anchor="middle" class="svg-muted" font-size="12">PermitAll / ShowOnly</text>
<line x1="190" y1="45" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="190" y1="165" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="105" x2="450" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">netadmin: PASS</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">helpdesk: FAIL</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">har decision accounting mein bhi likha jaata hai</text>
</svg><p class="cap">Ek hi command ko alag jawab milte hain kyunki ISE har group ke liye alag command sets lautata hai.</p></div>

<h3>Accounting: audit trail</h3>
<pre class="code">aaa accounting exec default start-stop group tacacs+
aaa accounting commands 1 default start-stop group tacacs+
aaa accounting commands 15 default start-stop group tacacs+</pre>
<p><b>Exec accounting</b> session shuru hone par START (user, source address, line) aur khatam hone par STOP (elapsed time ke saath) record karta hai. <b>Command accounting</b> har command ko username aur timestamp ke saath record karta hai. <code>start-stop</code> dono records bhejta hai; <code>stop-only</code> sirf STOP bhejta hai; <code>none</code> ise band karta hai. ISE mein yeh TACACS accounting report mein aate hain, jahan aap search kar sakte ho "kal raat R1 par <code>no router ospf</code> kisne chalaya". Accounting ka koi local fallback nahi hai: agar ISE down hai to records bas kho jaate hain, jo collector ko syslog bhi bhejne ki ek wajah hai.</p>

<h3>Verification</h3>
<pre class="out">PC-ADMIN&gt; ssh -l netadmin 10.10.10.1
Password:
R1# show privilege
<span class="hl">Current privilege level is 15</span>

! helpdesk ke roop mein logged in
R1&gt; show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.10.10.1      YES manual up                    up
R1&gt; enable
Password:
R1# configure terminal
<span class="hl">Command authorization failed.</span></pre>
<p>Lab mein, ISE par <code>aaa-server show accounting</code> netadmin ke session ke START aur STOP records list karta hai, wahi jaankari jo asli ISE apni TACACS accounting report mein dikhata hai.</p>

<div class="eg"><p><b>Worked example (Lab 1, tasks 3 aur 4).</b> Aap <code>aaa authorization commands 15 default group tacacs+ local</code> aur <code>aaa accounting commands 15 default start-stop group tacacs+</code> jodte ho. PC-ADMIN se aap password Adm!n-26 ke saath <code>ssh -l netadmin 10.10.10.1</code> chalate ho, <code>R1#</code> par pahunchte ho, aur <code>show privilege</code> 15 jawab deta hai. Configure terminal chalta hai. Phir checker helpdesk ki taraf se ISE se poochta hai: <code>show ip interface brief</code> permit hai, <code>configure terminal</code> deny hai. ISE par accounting list 10.10.11.9 se netadmin ka START record dikhati hai. Task question ka jawab 15 hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>aaa authorization commands 15</code> ko sirf <code>group tacacs+</code> ke saath bina fallback enable karna, phir ISE tak ka path kho dena. Ab har level-15 command ERROR lautata hai aur kahin jaane ki jagah nahi, isliye aap login to kar sakte ho par <code>configure terminal</code> bhi type nahi kar sakte. Command authorization ko hamesha <code>local</code> ya <code>if-authenticated</code> par khatam karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>aaa authorization exec</code> ke bina, server ka lautaya privilege level ignore hota hai aur users level 1 se shuru karte hain. Command authorization per level hai (<code>commands 1</code>, <code>commands 15</code>) aur console par tab tak apply nahi hota jab tak <code>aaa authorization console</code> configure na ho.</p></div>

<div class="scn"><h4>Junior jisne core reload kar diya</h4><p>Ek naye NOC analyst ne, jise read-only hona tha, wiki page se commands copy karte hue distribution switch par <code>reload</code> type kar diya. Switch NOC group mein sabke liye privilege 15 ke saath RADIUS use karta tha. Incident ke baad team TACACS+ par gayi: NOC analysts ko privilege 15 wala shell profile mila par aisa command set jo sirf show, ping, traceroute aur clear counters permit karta hai. Ek mahine baad wahi galti "Command authorization failed" lautai aur accounting report mein dikhi.</p><p><b>Seekh:</b> sirf privilege level bahut mota hai; command sets audit trail ke saath least privilege dete hain.</p></div>

<div class="iv"><p class="q">"Exec authorization aur command authorization mein kya fark hai?"</p><p>Exec authorization login par ek baar hota hai aur tay karta hai ki user ko shell milega ya nahi aur kis privilege level par (server priv-lvl lautata hai). Command authorization configured levels par har command ke liye hota hai aur use user ke command set ke against check karta hai. Fallback method, console exception, aur yeh ki accounting sessions aur commands dono record karta hai, zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>aaa authorization exec</code> server ka privilege level apply karta hai; iske bina users level 1 par aate hain.</li>
<li><code>aaa authorization commands 15</code> har level-15 command ko ISE command sets ke against check karta hai.</li>
<li>Console authorization ke liye <code>aaa authorization console</code> chahiye; hamesha ek fallback method rakho.</li>
<li>start-stop ke saath exec aur command accounting ISE par searchable, per-user audit trail deta hai.</li>
<li>Least privilege = sahi shell profile plus tight command set, sab ko level 15 nahi.</li>
</ul></div>
`}};export{e as default};