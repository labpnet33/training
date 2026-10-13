var e={id:`aaa-method-lists`,h:{en:`AAA new-model and method lists`,hi:`AAA new-model aur method lists`},body:{en:`
<p>Think of an airport. At the entrance a guard checks your passport: <b>who are you?</b> At the gate your boarding pass decides <b>where you may go</b>: economy or the lounge. Cameras and the gate scanner record <b>what you did and when</b>. Airports never rely on one guard knowing every face; they rely on a central database. AAA gives network devices the same three steps and the same central database.</p>

<h3>The three A's</h3>
<dl class="terms">
<dt>Authentication</dt><dd>Proves identity: username and password, a certificate, a token. Answers "who are you?"</dd>
<dt>Authorization</dt><dd>Decides what an authenticated user may do: which privilege level, which commands, which network access. Answers "what may you do?"</dd>
<dt>Accounting</dt><dd>Records what happened: login and logout times, commands entered, bytes used. Answers "what did you do?"</dd>
</dl>

<h3>aaa new-model: the big switch</h3>
<p><code>aaa new-model</code> turns on the AAA subsystem. It changes behaviour <b>immediately</b>, which surprises many engineers:</p>
<ul>
<li>Line commands <code>login</code>, <code>login local</code> and the line <code>password</code> are no longer used for authentication.</li>
<li>If no <code>aaa authentication login default</code> list exists, every line uses the <b>local user database</b>. With no local user, nobody can log in remotely.</li>
<li>Once a default list exists, every line uses it unless a line names another list.</li>
<li>Exec authorization on the <b>console</b> is not performed unless you also configure <code>aaa authorization console</code>. This protects you from locking yourself out of the console by mistake.</li>
</ul>
<p>So the safe order is always: create a strong local user, keep an existing session open, then enable AAA.</p>

<h3>Method lists</h3>
<p>A <b>method list</b> is an ordered list of methods to try for one AAA service. The general form is:</p>
<pre class="code">aaa &lt;service&gt; &lt;type&gt; {default | LIST-NAME} method1 [method2 ...]
<span class="c">! examples</span>
aaa authentication login default group tacacs+ local
aaa authentication login CONSOLE local
aaa authentication enable default group tacacs+ enable
aaa authorization exec default group tacacs+ local
aaa accounting exec default start-stop group tacacs+</pre>
<p>The <b>service</b> is authentication, authorization or accounting. The <b>type</b> says what is being protected:</p>
<table class="cmp"><tr><th>Service</th><th>Common types</th></tr>
<tr><td>authentication</td><td><code>login</code> (line logins), <code>enable</code> (the enable command), <code>dot1x</code>, <code>ppp</code></td></tr>
<tr><td>authorization</td><td><code>exec</code> (starting a shell, privilege level), <code>commands N</code> (each command at level N), <code>network</code>, <code>config-commands</code></td></tr>
<tr><td>accounting</td><td><code>exec</code>, <code>commands N</code>, <code>connection</code>, <code>system</code>, <code>network</code></td></tr></table>
<p>The <b>methods</b> are:</p>
<dl class="terms">
<dt>group tacacs+ / group radius</dt><dd>All configured TACACS+ or RADIUS servers, in order.</dd>
<dt>group NAME</dt><dd>A named server group (chapter 6).</dd>
<dt>local / local-case</dt><dd>The local username database.</dd>
<dt>enable</dt><dd>The enable secret (for login or enable lists).</dd>
<dt>line</dt><dd>The line password.</dd>
<dt>none</dt><dd>Always succeed. Useful only in special cases; dangerous as a fallback.</dd>
<dt>if-authenticated</dt><dd>For authorization: allow if the user is authenticated.</dd>
</dl>

<h3>Default versus named lists</h3>
<p>The <code>default</code> list applies to every line and interface automatically. A <b>named list</b> applies only where you reference it. A common design: VTYs use the default list (TACACS+ then local) and the console uses a named list with local only, so a console user is never stuck waiting for server timeouts.</p>
<pre class="code">aaa authentication login default group tacacs+ local
aaa authentication login CONSOLE local
line console 0
 login authentication CONSOLE
line vty 0 15
 transport input ssh                  <span class="c">! uses the default list automatically</span></pre>
<p>Verify which list a line uses and what is configured:</p>
<pre class="out">R1# show running-config | section aaa
aaa new-model
<span class="hl">aaa authentication login default group tacacs+ local</span>
aaa authentication login CONSOLE local
aaa authorization exec default group tacacs+ local
aaa accounting exec default start-stop group tacacs+
aaa session-id common
R1# show aaa method-lists authentication
authen queue=AAA_ML_AUTHEN_LOGIN
<span class="hl">  name=default valid=TRUE id=0 :state=ALIVE : SERVER_GROUP tacacs+ LOCAL</span>
  name=CONSOLE valid=TRUE id=1 :state=ALIVE : LOCAL</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Method list evaluation">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">SSH login</text>
<rect x="190" y="70" width="140" height="50" rx="8" fill="#bae6fd"/><text x="260" y="93" text-anchor="middle" class="svg-ink" font-size="13">group tacacs+</text><text x="260" y="110" text-anchor="middle" class="svg-muted" font-size="12">method 1</text>
<rect x="400" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="460" y="93" text-anchor="middle" class="svg-ink" font-size="13">local</text><text x="460" y="110" text-anchor="middle" class="svg-muted" font-size="12">method 2</text>
<line x1="140" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="95" x2="400" y2="95" stroke="#64748b" stroke-width="2"/><text x="365" y="87" text-anchor="middle" class="svg-accent" font-size="12">ERROR</text>
<line x1="260" y1="70" x2="260" y2="30" stroke="#64748b" stroke-width="2"/><text x="260" y="22" text-anchor="middle" class="svg-accent" font-size="12">PASS or FAIL: stop here</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Only "no answer" moves to the next method (chapter 6).</text>
</svg><p class="cap">A method list is tried left to right, but only an error moves to the next method.</p></div>

<div class="eg"><p><b>Worked example.</b> In the TACACS+ lab, R1 starts with <code>username backup privilege 15 secret Backup#26</code> and <code>login local</code> on the VTYs. You type <code>aaa new-model</code>. With no list defined yet, VTYs now use the local database, so backup still works; <code>login local</code> simply has no effect any more. Next you add <code>aaa authentication login default group tacacs+ local</code>. Now netadmin, which exists only on ISE, can log in from PC-ADMIN, and backup works only when ISE is not answering.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>aaa new-model</code> on a remote device with no local user and no server configured. Your current session survives, but the next login fails. Always create the local user first and test from a second session before you close the first one.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ending a list with <code>none</code> "just in case". If the servers become unreachable, anyone who reaches the VTY gets in without a password.</p></div>

<div class="exam"><p><b>Exam trap.</b> A named list does nothing until it is applied to a line with <code>login authentication NAME</code> (or <code>authorization exec NAME</code>, <code>accounting exec NAME</code>). The default list needs no application. Also remember that console exec authorization needs <code>aaa authorization console</code>.</p></div>

<div class="scn"><h4>Locked out after one command</h4><p>A junior engineer enabled <code>aaa new-model</code> on a remote branch router over SSH, then logged out to "test it". The router had only a line password and no local users, so every new SSH login was refused. A technician had to drive to the site and use the console. The next week the team added a pre-check script: no <code>aaa new-model</code> unless a local user exists and a second session is open.</p><p><b>Lesson:</b> aaa new-model changes authentication instantly. Local user first, second session open, then enable and test.</p></div>

<div class="iv"><p class="q">"What happens when you type aaa new-model?"</p><p>A strong answer: AAA is enabled, line passwords and <code>login local</code> stop being used, lines use the default login list or, if none exists, the local database, and named lists apply only where referenced. Mention the lockout risk and the safe order, and that console authorization needs <code>aaa authorization console</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication = who, authorization = what you may do, accounting = what you did.</li>
<li><code>aaa new-model</code> takes effect immediately; with no default list the local database is used.</li>
<li>Method list form: <code>aaa service type {default|NAME} methods...</code>, tried left to right.</li>
<li>Default lists apply everywhere; named lists only where applied with <code>login authentication</code> and similar commands.</li>
<li>Avoid <code>none</code> as a fallback; create the local user before enabling AAA.</li>
</ul></div>
`,hi:`
<p>Ek airport socho. Entrance par guard aapka passport check karta hai: <b>aap kaun ho?</b> Gate par aapka boarding pass tay karta hai ki <b>aap kahan jaa sakte ho</b>: economy ya lounge. Cameras aur gate scanner record karte hain ki <b>aapne kya kiya aur kab</b>. Airports kabhi ek guard par bharosa nahi karte ki woh har chehra jaane; woh ek central database par bharosa karte hain. AAA network devices ko yahi teen steps aur yahi central database deta hai.</p>

<h3>Teen A</h3>
<dl class="terms">
<dt>Authentication</dt><dd>Pehchaan sabit karta hai: username aur password, certificate, token. Jawab deta hai "aap kaun ho?"</dd>
<dt>Authorization</dt><dd>Tay karta hai ki authenticated user kya kar sakta hai: kaunsa privilege level, kaunse commands, kaunsa network access. Jawab deta hai "aap kya kar sakte ho?"</dd>
<dt>Accounting</dt><dd>Record karta hai kya hua: login aur logout time, type kiye commands, use kiye bytes. Jawab deta hai "aapne kya kiya?"</dd>
</dl>

<h3>aaa new-model: bada switch</h3>
<p><code>aaa new-model</code> AAA subsystem chalu karta hai. Yeh behaviour <b>turant</b> badalta hai, jo kai engineers ko hairaan karta hai:</p>
<ul>
<li>Line commands <code>login</code>, <code>login local</code> aur line <code>password</code> ab authentication ke liye use nahi hote.</li>
<li>Agar koi <code>aaa authentication login default</code> list nahi hai, to har line <b>local user database</b> use karti hai. Koi local user na ho to koi remotely login nahi kar sakta.</li>
<li>Default list ban jaane ke baad har line use use karti hai, jab tak line kisi aur list ka naam na le.</li>
<li><b>Console</b> par exec authorization tab tak nahi hota jab tak aap <code>aaa authorization console</code> bhi configure na karo. Yeh aapko galti se console se lock out hone se bachata hai.</li>
</ul>
<p>Isliye safe kram hamesha yeh hai: strong local user banao, ek existing session khula rakho, phir AAA chalu karo.</p>

<h3>Method lists</h3>
<p><b>Method list</b> ek AAA service ke liye try karne wale methods ki ordered list hai. General form:</p>
<pre class="code">aaa &lt;service&gt; &lt;type&gt; {default | LIST-NAME} method1 [method2 ...]
<span class="c">! examples</span>
aaa authentication login default group tacacs+ local
aaa authentication login CONSOLE local
aaa authentication enable default group tacacs+ enable
aaa authorization exec default group tacacs+ local
aaa accounting exec default start-stop group tacacs+</pre>
<p><b>Service</b> authentication, authorization ya accounting hai. <b>Type</b> batata hai ki kya protect ho raha hai:</p>
<table class="cmp"><tr><th>Service</th><th>Aam types</th></tr>
<tr><td>authentication</td><td><code>login</code> (line logins), <code>enable</code> (enable command), <code>dot1x</code>, <code>ppp</code></td></tr>
<tr><td>authorization</td><td><code>exec</code> (shell shuru karna, privilege level), <code>commands N</code> (level N ka har command), <code>network</code>, <code>config-commands</code></td></tr>
<tr><td>accounting</td><td><code>exec</code>, <code>commands N</code>, <code>connection</code>, <code>system</code>, <code>network</code></td></tr></table>
<p><b>Methods</b> yeh hain:</p>
<dl class="terms">
<dt>group tacacs+ / group radius</dt><dd>Saare configured TACACS+ ya RADIUS servers, kram se.</dd>
<dt>group NAME</dt><dd>Ek named server group (chapter 6).</dd>
<dt>local / local-case</dt><dd>Local username database.</dd>
<dt>enable</dt><dd>Enable secret (login ya enable lists ke liye).</dd>
<dt>line</dt><dd>Line password.</dd>
<dt>none</dt><dd>Hamesha safal. Sirf khaas cases mein kaam ka; fallback ki tarah khatarnaak.</dd>
<dt>if-authenticated</dt><dd>Authorization ke liye: user authenticated ho to allow.</dd>
</dl>

<h3>Default vs named lists</h3>
<p><code>default</code> list har line aur interface par apne aap lagti hai. <b>Named list</b> sirf wahan lagti hai jahan aap use refer karo. Ek aam design: VTYs default list use karti hain (TACACS+ phir local) aur console sirf local wali named list use karta hai, taaki console user kabhi server timeouts ka intezaar na kare.</p>
<pre class="code">aaa authentication login default group tacacs+ local
aaa authentication login CONSOLE local
line console 0
 login authentication CONSOLE
line vty 0 15
 transport input ssh                  <span class="c">! default list apne aap use hoti hai</span></pre>
<p>Verify karo ki line kaunsi list use karti hai aur kya configured hai:</p>
<pre class="out">R1# show running-config | section aaa
aaa new-model
<span class="hl">aaa authentication login default group tacacs+ local</span>
aaa authentication login CONSOLE local
aaa authorization exec default group tacacs+ local
aaa accounting exec default start-stop group tacacs+
aaa session-id common
R1# show aaa method-lists authentication
authen queue=AAA_ML_AUTHEN_LOGIN
<span class="hl">  name=default valid=TRUE id=0 :state=ALIVE : SERVER_GROUP tacacs+ LOCAL</span>
  name=CONSOLE valid=TRUE id=1 :state=ALIVE : LOCAL</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Method list ka evaluation">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="100" text-anchor="middle" class="svg-ink" font-size="13">SSH login</text>
<rect x="190" y="70" width="140" height="50" rx="8" fill="#bae6fd"/><text x="260" y="93" text-anchor="middle" class="svg-ink" font-size="13">group tacacs+</text><text x="260" y="110" text-anchor="middle" class="svg-muted" font-size="12">method 1</text>
<rect x="400" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="460" y="93" text-anchor="middle" class="svg-ink" font-size="13">local</text><text x="460" y="110" text-anchor="middle" class="svg-muted" font-size="12">method 2</text>
<line x1="140" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="330" y1="95" x2="400" y2="95" stroke="#64748b" stroke-width="2"/><text x="365" y="87" text-anchor="middle" class="svg-accent" font-size="12">ERROR</text>
<line x1="260" y1="70" x2="260" y2="30" stroke="#64748b" stroke-width="2"/><text x="260" y="22" text-anchor="middle" class="svg-accent" font-size="12">PASS ya FAIL: yahin ruko</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Sirf "koi jawab nahi" agle method par le jaata hai (chapter 6).</text>
</svg><p class="cap">Method list baayein se daayein try hoti hai, lekin sirf error agle method par le jaata hai.</p></div>

<div class="eg"><p><b>Worked example.</b> TACACS+ lab mein R1 <code>username backup privilege 15 secret Backup#26</code> aur VTYs par <code>login local</code> ke saath shuru hota hai. Aap <code>aaa new-model</code> type karte ho. Abhi koi list nahi hai, isliye VTYs local database use karti hain, to backup ab bhi chalta hai; <code>login local</code> ka bas ab koi asar nahi. Phir aap <code>aaa authentication login default group tacacs+ local</code> jodte ho. Ab netadmin, jo sirf ISE par hai, PC-ADMIN se login kar sakta hai, aur backup sirf tab chalta hai jab ISE jawab na de raha ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Remote device par bina local user aur bina server ke <code>aaa new-model</code> chalu karna. Aapka current session bach jaata hai, lekin agla login fail hota hai. Hamesha pehle local user banao aur pehla session band karne se pehle doosre session se test karo.</p></div>

<div class="warn"><p><b>Common galti.</b> List ko "just in case" <code>none</code> se khatam karna. Agar servers unreachable ho jaayein, to VTY tak pahunchne wala koi bhi bina password andar aa jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Named list tab tak kuch nahi karti jab tak use line par <code>login authentication NAME</code> (ya <code>authorization exec NAME</code>, <code>accounting exec NAME</code>) se lagaya na jaaye. Default list ko lagane ki zaroorat nahi. Yeh bhi yaad rakho ki console exec authorization ke liye <code>aaa authorization console</code> chahiye.</p></div>

<div class="scn"><h4>Ek command ke baad lock out</h4><p>Ek junior engineer ne SSH par remote branch router par <code>aaa new-model</code> chalu kiya, phir "test karne" ke liye logout kiya. Router par sirf line password tha aur koi local user nahi, isliye har naya SSH login mana hua. Ek technician ko site tak drive karke console use karna pada. Agle hafte team ne ek pre-check script joda: jab tak local user na ho aur doosra session khula na ho, <code>aaa new-model</code> nahi.</p><p><b>Seekh:</b> aaa new-model authentication turant badalta hai. Pehle local user, doosra session khula, phir enable aur test.</p></div>

<div class="iv"><p class="q">"aaa new-model type karne par kya hota hai?"</p><p>Strong answer: AAA chalu hota hai, line passwords aur <code>login local</code> use hona band ho jaate hain, lines default login list use karti hain ya, agar woh nahi hai, to local database, aur named lists sirf wahan lagti hain jahan refer ki gayi hon. Lockout risk aur safe kram ka zikr karo, aur yeh ki console authorization ke liye <code>aaa authorization console</code> chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication = kaun, authorization = kya kar sakte ho, accounting = kya kiya.</li>
<li><code>aaa new-model</code> turant lagu hota hai; default list na ho to local database use hota hai.</li>
<li>Method list form: <code>aaa service type {default|NAME} methods...</code>, baayein se daayein try.</li>
<li>Default lists har jagah lagti hain; named lists sirf wahan jahan <code>login authentication</code> jaise commands se lagayi jaayein.</li>
<li><code>none</code> ko fallback mat banao; AAA chalu karne se pehle local user banao.</li>
</ul></div>
`}};export{e as default};