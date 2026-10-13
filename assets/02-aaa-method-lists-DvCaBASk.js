var e={id:`aaa-method-lists`,h:{en:`AAA troubleshooting 1: method lists, PASS, FAIL and ERROR`,hi:`AAA troubleshooting 1: method lists, PASS, FAIL aur ERROR`},body:{en:`
<p>Go back to the reception desk of the office tower. The receptionist follows a small printed card: "1. Phone head office. 2. If the line is dead, check the local visitor book." Two different things can happen on that phone call. Head office can say "this person is not on our list", and then the visitor is turned away; the local book is never opened. Or the phone can ring and ring with no answer, and only then does the receptionist move to step 2. Almost every AAA ticket comes down to which of those two things really happened.</p>

<h3>How IOS chooses the method list</h3>
<p>A <b>method list</b> is an ordered list of ways to check a user, for one service such as <code>login</code> (VTY and console), <code>enable</code> or <code>dot1x</code>. The router picks the list like this:</p>
<ol>
<li><code>aaa new-model</code> must be on. From that moment the old line-level <code>login</code> and <code>password</code> commands are no longer used; method lists decide.</li>
<li>If the line has <code>login authentication NAME</code>, the named list is used. If that named list does not exist, IOS warns you when you type the command, and logins on that line fail. It does <b>not</b> quietly fall back to the default list.</li>
<li>Otherwise the <code>default</code> list is used, on every line including the console.</li>
<li>With <code>aaa new-model</code> and no default login list at all, VTY logins are checked against the <b>local database</b>.</li>
</ol>

<h3>The three answers: PASS, FAIL, ERROR</h3>
<table class="cmp"><tr><th>Result</th><th>What caused it</th><th>What the router does next</th></tr>
<tr><td><b>PASS</b></td><td>Server or local database accepted the credentials</td><td>User is logged in</td></tr>
<tr><td><b>FAIL</b></td><td>Server answered and rejected: wrong password, unknown user (TACACS+ FAIL, RADIUS Access-Reject)</td><td>Login denied. The next method is <b>not</b> tried</td></tr>
<tr><td><b>ERROR</b></td><td>No usable answer: server unreachable, timeout, key mismatch, TCP reset</td><td>Try the next method in the list</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Method list decision flow">
<rect x="10" y="90" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="13">Login on VTY</text><text x="70" y="129" text-anchor="middle" class="svg-muted" font-size="12">list VTY-AUTH</text>
<rect x="170" y="90" width="140" height="50" rx="8" fill="#bae6fd"/><text x="240" y="112" text-anchor="middle" class="svg-ink" font-size="13">group NK-TAC</text><text x="240" y="129" text-anchor="middle" class="svg-muted" font-size="12">method 1</text>
<rect x="360" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="420" y="47" text-anchor="middle" class="svg-ink" font-size="13">PASS: login</text>
<rect x="360" y="93" width="120" height="44" rx="8" fill="#fed7aa"/><text x="420" y="120" text-anchor="middle" class="svg-ink" font-size="13">FAIL: denied</text>
<rect x="360" y="166" width="120" height="44" rx="8" fill="#fde68a"/><text x="420" y="193" text-anchor="middle" class="svg-ink" font-size="13">ERROR</text>
<rect x="510" y="166" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="570" y="186" text-anchor="middle" class="svg-ink" font-size="13">local</text><text x="570" y="202" text-anchor="middle" class="svg-muted" font-size="12">method 2</text>
<line x1="130" y1="115" x2="170" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="105" x2="360" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="115" x2="360" y2="115" stroke="#64748b" stroke-width="2"/><line x1="310" y1="125" x2="360" y2="188" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="188" x2="510" y2="188" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Only ERROR moves to the next method. FAIL is final.</p></div>

<h3>A safe baseline configuration</h3>
<pre class="code"><span class="c">! local break-glass account first, before aaa new-model</span>
username breakglass privilege 15 algorithm-type scrypt secret Br3ak-Gl4ss-26
aaa new-model
<span class="c">! named list for remote logins, separate list for the console</span>
aaa authentication login VTY-AUTH group NK-TAC local
aaa authentication login CON-AUTH local
aaa authorization exec VTY-AUTHZ group NK-TAC local
aaa accounting exec default start-stop group NK-TAC
line console 0
 login authentication CON-AUTH
line vty 0 15
 login authentication VTY-AUTH
 authorization exec VTY-AUTHZ
 transport input ssh</pre>
<p>Note that the VTY lines reference <b>both</b> the authentication and the authorization list. A named exec authorization list does nothing until a line points to it with <code>authorization exec</code>. With the default list (<code>aaa authorization exec default ...</code>) no line command is needed.</p>

<h3>Watching the decision happen</h3>
<pre class="out">R1# debug aaa authentication
AAA/BIND(0000001E): Bind i/f
AAA/AUTHEN/LOGIN (0000001E): <span class="hl">Pick method list 'VTY-AUTH'</span>
AAA/AUTHEN/LOGIN (0000001E): Method=NK-TAC (tacacs+)
TAC+: send AUTHEN/START packet ver=192 id=2918304551
TAC+: Opening TCP/IP to 10.10.10.50/49 timeout=5
TAC+: TCP/IP open to 10.10.10.50/49 failed -- Connection timed out
AAA/AUTHEN(0000001E): <span class="hl">Status=ERROR</span>
AAA/AUTHEN/LOGIN (0000001E): <span class="hl">Method=LOCAL</span>
AAA/AUTHEN(0000001E): Status=GETUSER
AAA/AUTHEN(0000001E): Status=GETPASS
AAA/AUTHEN(0000001E): <span class="hl">Status=PASS</span></pre>
<p>Read it like a story: the named list was chosen, TACACS+ could not open TCP 49, the result was ERROR, so the router moved on to LOCAL, and the break-glass account passed. If the debug had shown <code>Status=FAIL</code> after the TACACS+ step, the local database would never appear.</p>

<h3>Authorization: logged in, but powerless</h3>
<p>A frequent ticket is "I log in with my TACACS+ account but I only get the <code>&gt;</code> prompt". Authentication worked; <b>exec authorization</b> is missing or failed. Without <code>aaa authorization exec</code>, the privilege level sent by the server (TACACS+ <code>priv-lvl=15</code>, or RADIUS <code>shell:priv-lvl=15</code>) is ignored and the user lands at level 1. The console is special: exec and command authorization are not applied to the console unless you add <code>aaa authorization console</code>, which protects you from locking yourself out there.</p>

<div class="eg"><p><b>Worked example.</b> List <code>aaa authentication login default group radius local</code>. User asha types the wrong password. RADIUS answers Access-Reject: FAIL, login denied, even though asha also exists locally with that exact password. Now the RADIUS server is powered off and she tries again: three retransmissions time out (ERROR), the router tries local, and the same local password now works. Same user, same password, opposite result, because FAIL and ERROR are different.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>aaa authentication login default group tacacs+</code> with no <code>local</code> while the server is unreachable: the console is locked too, because the default list applies there. Adding the keyword <code>none</code> at the end "to be safe", which lets anyone in whenever the server is down. Creating a named list and forgetting <code>login authentication NAME</code> on the lines.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The server rejects the user, so the router tries the local database" is always wrong. Fallback happens only on ERROR. Also: <code>local-case</code> makes the local username check case-sensitive; plain <code>local</code> does not for the username, while passwords are always case-sensitive.</p></div>

<div class="scn"><h4>The admin who could only log in when the server was broken</h4><p>A network admin reported that his personal account worked only on days when the TACACS+ server was down. The engineer ran <code>debug aaa authentication</code>: on good days the result was <code>Status=FAIL</code> from TACACS+, on bad days <code>Status=ERROR</code> followed by LOCAL and PASS. His TACACS+ password had expired months earlier, but his old local account still existed on the router.</p><p><b>Lesson:</b> FAIL stops, ERROR falls through. Clean up stale local accounts and keep only one break-glass user.</p></div>

<div class="iv"><p class="q">"Explain the difference between a FAIL and an ERROR in AAA and why it matters."</p><p>Strong answer: FAIL means a server answered and rejected the credentials, so the router stops and denies access. ERROR means no valid answer arrived, for example a timeout, an unreachable server or a key mismatch, and only then does the router try the next method. It matters because a local fallback account works only during ERROR, and because a key mismatch looks like a dead server, so users silently end up on the local account.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A line uses its named list if configured, otherwise the default list; a missing named list is not replaced by default.</li>
<li>FAIL is final; only ERROR moves to the next method.</li>
<li>Always create a local break-glass user and give the console its own <code>local</code> list.</li>
<li>Exec authorization decides the privilege level; without it users land at level 1.</li>
<li><code>debug aaa authentication</code> shows the list picked, each method tried and the Status of each.</li>
</ul></div>
`,hi:`
<p>Office tower ke reception desk par wapas chalo. Receptionist ek chhote printed card ko follow karta hai: "1. Head office ko phone karo. 2. Agar line dead hai, to local visitor book check karo." Us phone call par do alag cheezein ho sakti hain. Head office keh sakta hai "yeh insaan hamari list mein nahi hai", aur tab visitor ko wapas bhej diya jaata hai; local book kabhi khulti hi nahi. Ya phone bajta rehta hai aur koi jawab nahi aata, aur tabhi receptionist step 2 par jaata hai. Lagbhag har AAA ticket isi par aakar rukta hai ki in dono mein se asal mein kya hua.</p>

<h3>IOS method list kaise chunta hai</h3>
<p><b>Method list</b> user ko check karne ke tariko ki ek ordered list hai, ek service ke liye jaise <code>login</code> (VTY aur console), <code>enable</code> ya <code>dot1x</code>. Router list aise chunta hai:</p>
<ol>
<li><code>aaa new-model</code> on hona chahiye. Us pal se purane line-level <code>login</code> aur <code>password</code> commands use nahi hote; method lists tay karti hain.</li>
<li>Agar line par <code>login authentication NAME</code> hai, to named list use hoti hai. Agar woh named list exist nahi karti, to command type karte waqt IOS warning deta hai, aur us line par logins fail hote hain. Yeh chupchaap default list par <b>nahi</b> jaata.</li>
<li>Warna <code>default</code> list use hoti hai, console samet har line par.</li>
<li><code>aaa new-model</code> ho aur koi default login list na ho, to VTY logins <b>local database</b> se check hote hain.</li>
</ol>

<h3>Teen jawab: PASS, FAIL, ERROR</h3>
<table class="cmp"><tr><th>Result</th><th>Kis wajah se</th><th>Router aage kya karta hai</th></tr>
<tr><td><b>PASS</b></td><td>Server ya local database ne credentials accept kiye</td><td>User login ho jaata hai</td></tr>
<tr><td><b>FAIL</b></td><td>Server ne jawab diya aur reject kiya: galat password, anjaan user (TACACS+ FAIL, RADIUS Access-Reject)</td><td>Login deny. Agla method try <b>nahi</b> hota</td></tr>
<tr><td><b>ERROR</b></td><td>Koi kaam ka jawab nahi: server unreachable, timeout, key mismatch, TCP reset</td><td>List ka agla method try hota hai</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Method list decision flow">
<rect x="10" y="90" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="13">VTY par login</text><text x="70" y="129" text-anchor="middle" class="svg-muted" font-size="12">list VTY-AUTH</text>
<rect x="170" y="90" width="140" height="50" rx="8" fill="#bae6fd"/><text x="240" y="112" text-anchor="middle" class="svg-ink" font-size="13">group NK-TAC</text><text x="240" y="129" text-anchor="middle" class="svg-muted" font-size="12">method 1</text>
<rect x="360" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="420" y="47" text-anchor="middle" class="svg-ink" font-size="13">PASS: login</text>
<rect x="360" y="93" width="120" height="44" rx="8" fill="#fed7aa"/><text x="420" y="120" text-anchor="middle" class="svg-ink" font-size="13">FAIL: deny</text>
<rect x="360" y="166" width="120" height="44" rx="8" fill="#fde68a"/><text x="420" y="193" text-anchor="middle" class="svg-ink" font-size="13">ERROR</text>
<rect x="510" y="166" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="570" y="186" text-anchor="middle" class="svg-ink" font-size="13">local</text><text x="570" y="202" text-anchor="middle" class="svg-muted" font-size="12">method 2</text>
<line x1="130" y1="115" x2="170" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="105" x2="360" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="115" x2="360" y2="115" stroke="#64748b" stroke-width="2"/><line x1="310" y1="125" x2="360" y2="188" stroke="#64748b" stroke-width="2"/>
<line x1="480" y1="188" x2="510" y2="188" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Sirf ERROR agle method par jaata hai. FAIL aakhri hai.</p></div>

<h3>Ek safe baseline configuration</h3>
<pre class="code"><span class="c">! local break-glass account first, before aaa new-model</span>
username breakglass privilege 15 algorithm-type scrypt secret Br3ak-Gl4ss-26
aaa new-model
<span class="c">! named list for remote logins, separate list for the console</span>
aaa authentication login VTY-AUTH group NK-TAC local
aaa authentication login CON-AUTH local
aaa authorization exec VTY-AUTHZ group NK-TAC local
aaa accounting exec default start-stop group NK-TAC
line console 0
 login authentication CON-AUTH
line vty 0 15
 login authentication VTY-AUTH
 authorization exec VTY-AUTHZ
 transport input ssh</pre>
<p>Dhyan do ki VTY lines authentication aur authorization <b>dono</b> lists ko reference karti hain. Named exec authorization list tab tak kuch nahi karti jab tak koi line <code>authorization exec</code> se uski taraf point na kare. Default list (<code>aaa authorization exec default ...</code>) ke saath koi line command nahi chahiye.</p>

<h3>Decision hote hue dekhna</h3>
<pre class="out">R1# debug aaa authentication
AAA/BIND(0000001E): Bind i/f
AAA/AUTHEN/LOGIN (0000001E): <span class="hl">Pick method list 'VTY-AUTH'</span>
AAA/AUTHEN/LOGIN (0000001E): Method=NK-TAC (tacacs+)
TAC+: send AUTHEN/START packet ver=192 id=2918304551
TAC+: Opening TCP/IP to 10.10.10.50/49 timeout=5
TAC+: TCP/IP open to 10.10.10.50/49 failed -- Connection timed out
AAA/AUTHEN(0000001E): <span class="hl">Status=ERROR</span>
AAA/AUTHEN/LOGIN (0000001E): <span class="hl">Method=LOCAL</span>
AAA/AUTHEN(0000001E): Status=GETUSER
AAA/AUTHEN(0000001E): Status=GETPASS
AAA/AUTHEN(0000001E): <span class="hl">Status=PASS</span></pre>
<p>Ise kahani ki tarah padho: named list chuni gayi, TACACS+ TCP 49 nahi khol paya, result ERROR aaya, isliye router LOCAL par gaya, aur break-glass account pass ho gaya. Agar debug TACACS+ step ke baad <code>Status=FAIL</code> dikhata, to local database kabhi dikhta hi nahi.</p>

<h3>Authorization: login ho gaye, par taakat nahi</h3>
<p>Ek aam ticket hai "main apne TACACS+ account se login karta hoon lekin mujhe sirf <code>&gt;</code> prompt milta hai". Authentication chal gaya; <b>exec authorization</b> missing hai ya fail hua. <code>aaa authorization exec</code> ke bina server ka bheja privilege level (TACACS+ <code>priv-lvl=15</code>, ya RADIUS <code>shell:priv-lvl=15</code>) ignore hota hai aur user level 1 par aata hai. Console special hai: exec aur command authorization console par tab tak apply nahi hote jab tak aap <code>aaa authorization console</code> na jodo, jo aapko wahan khud ko lock out karne se bachata hai.</p>

<div class="eg"><p><b>Worked example.</b> List <code>aaa authentication login default group radius local</code>. User asha galat password type karti hai. RADIUS Access-Reject deta hai: FAIL, login deny, bhale hi asha locally bhi bilkul usi password ke saath exist karti ho. Ab RADIUS server band hai aur woh phir try karti hai: teen retransmissions time out hote hain (ERROR), router local try karta hai, aur wahi local password ab chal jaata hai. Same user, same password, ulta result, kyunki FAIL aur ERROR alag hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Server unreachable hote hue bina <code>local</code> ke <code>aaa authentication login default group tacacs+</code> type karna: console bhi lock ho jaata hai, kyunki default list wahan bhi lagti hai. "Safe rehne ke liye" aakhir mein keyword <code>none</code> jodna, jisse server down hote hi koi bhi andar aa sakta hai. Named list banana aur lines par <code>login authentication NAME</code> bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Server user ko reject karta hai, isliye router local database try karta hai" hamesha galat hai. Fallback sirf ERROR par hota hai. Aur: <code>local-case</code> local username check ko case-sensitive banata hai; plain <code>local</code> username ke liye nahi karta, jabki passwords hamesha case-sensitive hote hain.</p></div>

<div class="scn"><h4>Woh admin jo sirf server tootne par login kar pata tha</h4><p>Ek network admin ne report kiya ki uska personal account sirf un dino chalta hai jab TACACS+ server down hota hai. Engineer ne <code>debug aaa authentication</code> chalaya: achhe dino mein TACACS+ se result <code>Status=FAIL</code> tha, bure dino mein <code>Status=ERROR</code> phir LOCAL aur PASS. Uska TACACS+ password mahino pehle expire ho chuka tha, lekin router par uska purana local account abhi bhi tha.</p><p><b>Seekh:</b> FAIL rok deta hai, ERROR aage badhta hai. Purane local accounts saaf karo aur sirf ek break-glass user rakho.</p></div>

<div class="iv"><p class="q">"AAA mein FAIL aur ERROR ka fark samjhao aur yeh kyun matter karta hai."</p><p>Strong answer: FAIL ka matlab server ne jawab diya aur credentials reject kiye, isliye router ruk jaata hai aur access deny karta hai. ERROR ka matlab koi valid jawab nahi aaya, jaise timeout, unreachable server ya key mismatch, aur tabhi router agla method try karta hai. Yeh isliye matter karta hai kyunki local fallback account sirf ERROR ke dauraan chalta hai, aur kyunki key mismatch dead server jaisa dikhta hai, isliye users chupchaap local account par pahunch jaate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Line configured ho to apni named list use karti hai, warna default list; missing named list ki jagah default nahi aata.</li>
<li>FAIL aakhri hai; sirf ERROR agle method par jaata hai.</li>
<li>Hamesha local break-glass user banao aur console ko apni <code>local</code> list do.</li>
<li>Exec authorization privilege level tay karta hai; iske bina users level 1 par aate hain.</li>
<li><code>debug aaa authentication</code> chuni gayi list, try kiya gaya har method aur har ek ka Status dikhata hai.</li>
</ul></div>
`}};export{e as default};