var e={id:`authorization-accounting`,h:{en:`Authorization and accounting: privilege, commands and audit`,hi:`Authorization aur accounting: privilege, commands aur audit`},body:{en:`
<p>Getting through the office front door is only the start. Your badge also decides which floors the lift will take you to, and the building keeps a log of every door you opened. A network device works the same way. Authentication let the user in; <b>authorization</b> decides the privilege level and which commands they may run, and <b>accounting</b> writes the diary.</p>

<h3>Exec authorization: landing at the right level</h3>
<p>When a user starts a shell (the "exec" session), the router can ask the AAA server "may this user have a shell, and at which level?" That is <code>aaa authorization exec</code>. Task 3 of the TACACS+ lab:</p>
<pre class="code">aaa authorization exec default group tacacs+ local</pre>
<p>ISE returns <code>priv-lvl=15</code> for netadmin and <code>priv-lvl=1</code> for helpdesk, and the router applies it:</p>
<pre class="out">PC-ADMIN&gt; ssh -l netadmin 10.10.10.1
Password:
<span class="hl">R1#</span>show privilege
<span class="hl">Current privilege level is 15</span>

PC-ADMIN&gt; ssh -l helpdesk 10.10.10.1
Password:
<span class="hl">R1&gt;</span>show privilege
Current privilege level is 1</pre>
<p>Without exec authorization, the level stored on the server is ignored and every AAA user starts at level 1, even netadmin. The same is true for local users: with AAA on, <code>username backup privilege 15</code> lands at 15 only if exec authorization includes <code>local</code>. Remember also that exec authorization is not applied on the console unless <code>aaa authorization console</code> is configured.</p>

<h3>Command authorization</h3>
<p>TACACS+ can check <b>every command</b> before the router executes it. You configure it per privilege level:</p>
<pre class="code">aaa authorization commands 1 default group tacacs+ if-authenticated
aaa authorization commands 15 default group tacacs+ if-authenticated</pre>
<p>Now when helpdesk types a command, R1 sends an authorization request such as <code>service=shell cmd=show cmd-arg=running-config</code>; ISE checks its command set for that user and answers PASS or FAIL. A FAIL looks like this:</p>
<pre class="out">R1&gt;show running-config
<span class="hl">Command authorization failed.</span></pre>
<p>Important details:</p>
<ul>
<li>Commands in configuration mode are also authorized when command authorization is on (this is controlled by <code>aaa authorization config-commands</code>, which is effectively on; <code>no aaa authorization config-commands</code> turns it off).</li>
<li><code>if-authenticated</code> as the last method means "if the server cannot be reached, allow commands for authenticated users". That keeps the break-glass user usable during an outage. Using <code>local</code> instead checks local command privilege levels.</li>
<li>Configure command authorization carefully: if the server policy has no command set for your group, even <code>exit</code> can be refused. Keep a second session open while you enable it.</li>
</ul>

<h3>Accounting</h3>
<p>Accounting sends records to the server. The record types are:</p>
<dl class="terms">
<dt>start-stop</dt><dd>A record when the event starts and another when it ends (for a session: login and logout, with duration).</dd>
<dt>stop-only</dt><dd>Only the end record.</dd>
<dt>none</dt><dd>Disables accounting on a line or interface that uses this list.</dd>
</dl>
<p>And the accounting types most used for device administration:</p>
<pre class="code">aaa accounting exec default start-stop group tacacs+          <span class="c">! shell sessions</span>
aaa accounting commands 1 default start-stop group tacacs+    <span class="c">! every level-1 command</span>
aaa accounting commands 15 default start-stop group tacacs+   <span class="c">! every level-15 command</span>
aaa accounting connection default start-stop group tacacs+    <span class="c">! outbound ssh/telnet from the router</span>
aaa accounting system default start-stop group tacacs+        <span class="c">! reloads, accounting on/off</span></pre>
<p>Task 4 of the lab turns on exec accounting and then asks you to log in and out as netadmin; ISE then holds a start record and a stop record for that session, which you view on ISE with <code>aaa-server show accounting</code>. On a real ISE you would look at the TACACS live log.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Authorization and accounting during a session">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">login</text>
<rect x="160" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="225" y="45" text-anchor="middle" class="svg-ink" font-size="13">exec author</text>
<rect x="320" y="20" width="140" height="40" rx="8" fill="#bae6fd"/><text x="390" y="45" text-anchor="middle" class="svg-ink" font-size="13">command author</text>
<rect x="490" y="20" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="13">logout</text>
<line x1="130" y1="40" x2="160" y2="40" stroke="#64748b" stroke-width="2"/><line x1="290" y1="40" x2="320" y2="40" stroke="#64748b" stroke-width="2"/><line x1="460" y1="40" x2="490" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="225" y="80" text-anchor="middle" class="svg-muted" font-size="12">priv-lvl=15</text>
<text x="390" y="80" text-anchor="middle" class="svg-muted" font-size="12">PASS / FAIL per command</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">accounting: exec START ... command records ... exec STOP</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Authorization decides; accounting remembers.</text>
</svg><p class="cap">During one session the router asks for exec authorization once, command authorization for each command, and sends accounting records throughout.</p></div>

<div class="eg"><p><b>Worked example.</b> A company wants helpdesk to run <code>show</code> commands and <code>clear counters</code> only, on 500 devices. Option 1: custom privilege level 5 on every device (chapter 2), 500 configs to keep consistent. Option 2: helpdesk at level 15 with TACACS+ command authorization, and on ISE a command set that permits <code>show *</code> and <code>clear counters</code> and denies everything else. Option 2 is one policy on one server, plus command accounting for the audit trail.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>aaa authorization exec default group tacacs+</code> with no fallback. When the server is unreachable, even the break-glass user authenticates locally but is then refused a shell, because exec authorization returns ERROR with no next method. Add <code>local</code> (or <code>if-authenticated</code>).</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling command authorization for level 15 only. Users at level 1 are then unrestricted by the server; configure the levels you use.</p></div>

<div class="exam"><p><b>Exam trap.</b> "A TACACS+ user has priv-lvl 15 on the server but lands at level 1." The missing piece is <code>aaa authorization exec</code>, not accounting and not the source interface. And "which A records the commands a user typed?" is accounting (<code>aaa accounting commands</code>), not authorization.</p></div>

<div class="scn"><h4>The shell that closed instantly</h4><p>During a TACACS+ outage, engineers used the break-glass account on a core router. The password was accepted, then the session closed immediately with "% Authorization failed." The configuration had <code>aaa authentication login default group tacacs+ local</code> but <code>aaa authorization exec default group tacacs+</code> with no second method. Authentication fell back to local, authorization had nowhere to fall back to. Luckily the console used a named list without exec authorization, and the team fixed it there.</p><p><b>Lesson:</b> every AAA list you configure needs a sensible fallback, not only the authentication list.</p></div>

<div class="iv"><p class="q">"How would you give helpdesk read-only access on hundreds of routers and prove what they did?"</p><p>Use TACACS+: exec authorization returning a privilege level, command authorization with a command set that permits show commands only, and command accounting start-stop so every command is logged with the username. Keep <code>local</code> or <code>if-authenticated</code> as fallback so break-glass access still works, and mention testing with a second session open.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>aaa authorization exec</code> applies the privilege level from the server or the local user; without it users start at level 1.</li>
<li><code>aaa authorization commands N</code> lets TACACS+ approve each command at level N; config-mode commands are included.</li>
<li>Console exec authorization needs <code>aaa authorization console</code>.</li>
<li>Accounting types: exec, commands N, connection, system; record types start-stop, stop-only, none.</li>
<li>Every list needs a fallback (<code>local</code> or <code>if-authenticated</code>) so break-glass access works.</li>
</ul></div>
`,hi:`
<p>Office ke front door se andar aana sirf shuruaat hai. Aapka badge yeh bhi tay karta hai ki lift aapko kaunsi floors par le jaayegi, aur building har khole darwaze ka log rakhti hai. Network device bhi aise hi kaam karta hai. Authentication ne user ko andar aane diya; <b>authorization</b> privilege level aur chalaye jaa sakne wale commands tay karta hai, aur <b>accounting</b> diary likhta hai.</p>

<h3>Exec authorization: sahi level par pahunchna</h3>
<p>Jab user shell ("exec" session) shuru karta hai, router AAA server se poochh sakta hai "kya is user ko shell mil sakta hai, aur kis level par?" Yeh <code>aaa authorization exec</code> hai. TACACS+ lab ka task 3:</p>
<pre class="code">aaa authorization exec default group tacacs+ local</pre>
<p>ISE netadmin ke liye <code>priv-lvl=15</code> aur helpdesk ke liye <code>priv-lvl=1</code> lautata hai, aur router use lagu karta hai:</p>
<pre class="out">PC-ADMIN&gt; ssh -l netadmin 10.10.10.1
Password:
<span class="hl">R1#</span>show privilege
<span class="hl">Current privilege level is 15</span>

PC-ADMIN&gt; ssh -l helpdesk 10.10.10.1
Password:
<span class="hl">R1&gt;</span>show privilege
Current privilege level is 1</pre>
<p>Exec authorization ke bina server par rakha level ignore hota hai aur har AAA user level 1 se shuru karta hai, netadmin bhi. Local users ke liye bhi yahi sach hai: AAA on hone par <code>username backup privilege 15</code> 15 par tabhi aata hai jab exec authorization mein <code>local</code> ho. Yeh bhi yaad rakho ki console par exec authorization tab tak lagu nahi hota jab tak <code>aaa authorization console</code> configure na ho.</p>

<h3>Command authorization</h3>
<p>TACACS+ router ke chalane se pehle <b>har command</b> check kar sakta hai. Aap ise har privilege level ke liye configure karte ho:</p>
<pre class="code">aaa authorization commands 1 default group tacacs+ if-authenticated
aaa authorization commands 15 default group tacacs+ if-authenticated</pre>
<p>Ab jab helpdesk koi command type karta hai, R1 authorization request bhejta hai jaise <code>service=shell cmd=show cmd-arg=running-config</code>; ISE us user ka command set check karta hai aur PASS ya FAIL jawab deta hai. FAIL aisa dikhta hai:</p>
<pre class="out">R1&gt;show running-config
<span class="hl">Command authorization failed.</span></pre>
<p>Zaroori details:</p>
<ul>
<li>Command authorization on hone par configuration mode ke commands bhi authorize hote hain (ise <code>aaa authorization config-commands</code> control karta hai, jo asal mein on rehta hai; <code>no aaa authorization config-commands</code> ise band karta hai).</li>
<li>Aakhri method <code>if-authenticated</code> ka matlab hai "agar server tak nahi pahunch sakte, to authenticated users ke commands allow karo". Isse outage mein break-glass user kaam ka rehta hai. Iski jagah <code>local</code> use karne se local command privilege levels check hote hain.</li>
<li>Command authorization dhyaan se configure karo: agar server policy mein aapke group ka koi command set nahi hai, to <code>exit</code> bhi mana ho sakta hai. Chalu karte waqt doosra session khula rakho.</li>
</ul>

<h3>Accounting</h3>
<p>Accounting server ko records bhejta hai. Record types yeh hain:</p>
<dl class="terms">
<dt>start-stop</dt><dd>Event shuru hone par ek record aur khatam hone par doosra (session ke liye: login aur logout, duration ke saath).</dd>
<dt>stop-only</dt><dd>Sirf end record.</dd>
<dt>none</dt><dd>Is list ko use karne wali line ya interface par accounting band.</dd>
</dl>
<p>Aur device administration mein sabse zyada use hone wale accounting types:</p>
<pre class="code">aaa accounting exec default start-stop group tacacs+          <span class="c">! shell sessions</span>
aaa accounting commands 1 default start-stop group tacacs+    <span class="c">! har level-1 command</span>
aaa accounting commands 15 default start-stop group tacacs+   <span class="c">! har level-15 command</span>
aaa accounting connection default start-stop group tacacs+    <span class="c">! router se bahar ssh/telnet</span>
aaa accounting system default start-stop group tacacs+        <span class="c">! reloads, accounting on/off</span></pre>
<p>Lab ka task 4 exec accounting chalu karta hai aur phir aapse netadmin ban kar login aur logout karwata hai; tab ISE par us session ka ek start record aur ek stop record hota hai, jise aap ISE par <code>aaa-server show accounting</code> se dekhte ho. Asli ISE par aap TACACS live log dekhoge.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Session ke dauraan authorization aur accounting">
<rect x="20" y="20" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="75" y="45" text-anchor="middle" class="svg-ink" font-size="13">login</text>
<rect x="160" y="20" width="130" height="40" rx="8" fill="#bae6fd"/><text x="225" y="45" text-anchor="middle" class="svg-ink" font-size="13">exec author</text>
<rect x="320" y="20" width="140" height="40" rx="8" fill="#bae6fd"/><text x="390" y="45" text-anchor="middle" class="svg-ink" font-size="13">command author</text>
<rect x="490" y="20" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="13">logout</text>
<line x1="130" y1="40" x2="160" y2="40" stroke="#64748b" stroke-width="2"/><line x1="290" y1="40" x2="320" y2="40" stroke="#64748b" stroke-width="2"/><line x1="460" y1="40" x2="490" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="225" y="80" text-anchor="middle" class="svg-muted" font-size="12">priv-lvl=15</text>
<text x="390" y="80" text-anchor="middle" class="svg-muted" font-size="12">har command par PASS / FAIL</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">accounting: exec START ... command records ... exec STOP</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Authorization faisla karta hai; accounting yaad rakhta hai.</text>
</svg><p class="cap">Ek session mein router ek baar exec authorization, har command ke liye command authorization maangta hai, aur poore samay accounting records bhejta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek company chahti hai ki helpdesk 500 devices par sirf <code>show</code> commands aur <code>clear counters</code> chalaye. Option 1: har device par custom privilege level 5 (chapter 2), 500 configs ko ek jaisa rakhna. Option 2: helpdesk level 15 par TACACS+ command authorization ke saath, aur ISE par ek command set jo <code>show *</code> aur <code>clear counters</code> permit kare aur baaki sab deny. Option 2 ek server par ek policy hai, plus audit trail ke liye command accounting.</p></div>

<div class="warn"><p><b>Common galti.</b> Bina fallback ke <code>aaa authorization exec default group tacacs+</code> configure karna. Server unreachable hone par break-glass user bhi locally authenticate to ho jaata hai lekin phir shell mana ho jaata hai, kyunki exec authorization ERROR deta hai aur koi agla method nahi. <code>local</code> (ya <code>if-authenticated</code>) jodo.</p></div>

<div class="warn"><p><b>Common galti.</b> Command authorization sirf level 15 ke liye chalu karna. Tab level 1 ke users server se unrestricted rehte hain; jo levels aap use karte ho woh configure karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "TACACS+ user ka server par priv-lvl 15 hai lekin woh level 1 par aata hai." Missing cheez <code>aaa authorization exec</code> hai, accounting nahi aur source interface nahi. Aur "kaunsa A user ke type kiye commands record karta hai?" accounting hai (<code>aaa accounting commands</code>), authorization nahi.</p></div>

<div class="scn"><h4>Woh shell jo turant band ho gaya</h4><p>TACACS+ outage ke dauraan engineers ne core router par break-glass account use kiya. Password accept hua, phir session turant "% Authorization failed." ke saath band ho gaya. Configuration mein <code>aaa authentication login default group tacacs+ local</code> tha lekin <code>aaa authorization exec default group tacacs+</code> bina doosre method ke. Authentication local par fallback ho gaya, authorization ke paas fallback ki koi jagah nahi thi. Kismat se console ek named list use karta tha jisme exec authorization nahi thi, aur team ne wahan se fix kiya.</p><p><b>Seekh:</b> aapki configure ki har AAA list ko samajhdaar fallback chahiye, sirf authentication list ko nahi.</p></div>

<div class="iv"><p class="q">"Saikdon routers par helpdesk ko read-only access kaise doge aur kaise sabit karoge ki unhone kya kiya?"</p><p>TACACS+ use karo: privilege level lautane wala exec authorization, sirf show commands permit karne wale command set ke saath command authorization, aur command accounting start-stop taaki har command username ke saath log ho. Fallback ke liye <code>local</code> ya <code>if-authenticated</code> rakho taaki break-glass access chalta rahe, aur doosra session khula rakh kar testing ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>aaa authorization exec</code> server ya local user ka privilege level lagu karta hai; iske bina users level 1 se shuru karte hain.</li>
<li><code>aaa authorization commands N</code> TACACS+ ko level N ka har command approve karne deta hai; config-mode commands shaamil hain.</li>
<li>Console exec authorization ke liye <code>aaa authorization console</code> chahiye.</li>
<li>Accounting types: exec, commands N, connection, system; record types start-stop, stop-only, none.</li>
<li>Har list ko fallback (<code>local</code> ya <code>if-authenticated</code>) chahiye taaki break-glass access chale.</li>
</ul></div>
`}};export{e as default};