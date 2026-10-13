var e={id:`auth`,h:{en:`Users and authentication rules`,hi:`Users aur authentication rules`},body:{en:`
<p>So far a rule asked "which address?". An address tells you which machine, not which person. Two engineers share the same laptop in a lab; an intern and a manager both use STAFF-PC at different hours. When a policy must depend on <b>who the person is</b>, the rule uses its <b>authentication</b> option.</p>

<h3>Analogy: the badge at the server-room door</h3>
<p>The corridor to the server room is open to everyone in the building, but the door itself needs a badge from the "Server admins" group. Standing at the door is not enough. You must have shown your badge and the reader must have accepted it. An authentication rule works like that door: the connection must come from a source that currently has a logged-in user of the named group.</p>

<h3>How an authentication rule behaves</h3>
<p>A rule can name a <b>user group</b> in its authentication option. The engine then applies one extra test on top of source, destination and service:</p>
<ul>
<li>The rule matches only if the source address has an <b>authenticated user</b> who belongs to that group.</li>
<li>If nobody has logged in from that address, the rule is skipped, exactly like a rule whose service does not fit.</li>
<li>If a user of another group is logged in, the rule is skipped too.</li>
</ul>
<p>Skipped means evaluation continues downwards. Whatever lies below, often a broad Discard or the implicit discard, decides the connection. The rule is not "denying" the user. It simply does not apply.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Authentication decides if a rule matches">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="105" y="63" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10</text>
<rect x="240" y="20" width="200" height="60" rx="8" fill="#fde68a"/><text x="340" y="42" text-anchor="middle" class="svg-ink" font-size="12">Rule: net-staff to srv-web</text><text x="340" y="60" text-anchor="middle" class="svg-ink" font-size="12">HTTPS Allow, auth: web-admins</text>
<rect x="480" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">srv-web</text>
<line x1="190" y1="50" x2="238" y2="50" stroke="#64748b" stroke-width="2"/><line x1="440" y1="50" x2="478" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="20" y="125" class="svg-ink" font-size="13">No user logged in</text><text x="250" y="125" class="svg-muted" font-size="12">rule skipped, falls through to the rules below</text>
<text x="20" y="155" class="svg-ink" font-size="13">User in other group</text><text x="250" y="155" class="svg-muted" font-size="12">rule skipped</text>
<text x="20" y="185" class="svg-ink" font-size="13">User in web-admins</text><text x="250" y="185" class="svg-accent" font-size="12">rule matches, Allow applies</text>
</svg><p class="cap">Authentication is one more condition. When it fails, the rule does not match and the engine reads on.</p></div>

<h3>The usual pattern</h3>
<p>Put the authenticated rule above a broader rule. For example, rule 4 allows <code>net-staff</code> to <code>srv-web</code> on SSH when the user is in the group <code>web-admins</code>. Below it, a Discard for SSH from staff catches everyone else. Admins get in after logging in; everybody else is dropped by the Discard, and the log shows which rule did it.</p>

<div class="eg"><p><b>Worked example.</b> Rule 4: source <code>net-staff</code>, destination <code>srv-web</code>, service <code>SSH</code>, Allow, authentication group <code>web-admins</code>. Rule 5: net-staff to srv-web SSH Discard. Priya, in web-admins, logs in from STAFF-PC (10.1.1.10) and opens SSH to 172.16.20.20: rule 4 matches and she gets in. Later, with nobody logged in, STAFF-PC opens SSH: rule 4 is skipped because no authenticated user exists, rule 5 matches, Discard. Same PC, same destination, same service. The only difference is who is logged in.</p></div>

<h3>Where users come from</h3>
<p>The element set includes users, each with a group, a password and optionally a multi-factor setting. In the console tool you can log a user in on a source address to test a rule. The simulator does not model a real user directory or the real login portal, so treat the login as a test step. In production, the engine learns users from an authentication method you configure; check the documentation for your NGFW version.</p>
<pre class="out">Policy match test  10.1.1.10 -&gt; 172.16.20.20 tcp/22
Logged-in users on 10.1.1.10: none
 4    no   (authentication: web-admins required)
<span class="hl"> 5    MATCH   net-staff -&gt; srv-web   SSH   Discard</span>
Result: Discard by rule 5

Logged-in users on 10.1.1.10: priya (web-admins)
<span class="hl"> 4    MATCH   net-staff -&gt; srv-web   SSH   Allow   auth web-admins</span>
Result: Allow by rule 4</pre>

<div class="warn"><p><b>Common mistake.</b> Placing the authenticated Allow below the Discard. The Discard catches the connection first, so even logged-in users are blocked. Order still applies: authenticated rule above, fallback below.</p></div>
<div class="exam"><p><b>Exam trap.</b> An authentication rule does not "challenge" a connection in the middle of evaluation. It matches only when an authenticated user of the right group is already known for that source. A missing group element is a validation error at install.</p></div>

<div class="scn"><h4>Admins locked out after a clean-up</h4><p>During a policy tidy-up, a junior engineer removed the login step from the SSH procedure because it looked redundant. Next morning the web admins could not SSH to the server. The rule was fine, but nobody was authenticated, so rule 4 was skipped and the Discard below it fired. The fix was to restore the login step, not to edit the rule. The team added the login step to the runbook.</p><p><b>Lesson:</b> a rule that depends on identity needs the identity to exist at the moment of the connection.</p></div>
<div class="iv"><p class="q">"How can a firewall rule be based on the user instead of the IP address?"</p><p>The rule has an authentication option naming a user group. It matches only if the source address has an authenticated user in that group. Explain that otherwise it is skipped and lower rules decide, and that you would place it above a fallback rule.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The authentication option names a user group.</li>
<li>The rule matches only for a source with an authenticated user of that group.</li>
<li>If not, the rule is skipped and evaluation continues below.</li>
<li>Place the authenticated rule above the fallback Discard.</li>
</ul></div>
`,hi:`
<p>Ab tak rule poochhta tha "kaunsa address?". Address machine batata hai, insaan nahi. Lab mein do engineers ek laptop share karte hain; ek intern aur ek manager alag ghanton mein STAFF-PC use karte hain. Jab policy ko <b>insaan kaun hai</b> us par depend karna ho, rule apna <b>authentication</b> option use karta hai.</p>

<h3>Analogy: server-room darwaze par badge</h3>
<p>Server room ka corridor building mein sabke liye khula hai, par darwaze ko "Server admins" group ka badge chahiye. Darwaze par khade hona kaafi nahi. Aapne badge dikhaya hona chahiye aur reader ne accept kiya hona chahiye. Authentication rule isi darwaze jaisa hai: connection aise source se aani chahiye jisme named group ka user abhi logged in ho.</p>

<h3>Authentication rule ka behaviour</h3>
<p>Rule apne authentication option mein ek <b>user group</b> naam de sakta hai. Tab engine source, destination aur service ke upar ek aur test lagata hai:</p>
<ul>
<li>Rule tabhi match karta hai jab source address par us group ka <b>authenticated user</b> ho.</li>
<li>Agar us address se kisi ne login nahi kiya, rule skip hota hai, bilkul us rule ki tarah jiski service fit nahi hoti.</li>
<li>Agar dusre group ka user logged in hai, tab bhi rule skip hota hai.</li>
</ul>
<p>Skip ka matlab evaluation neeche chalti hai. Neeche jo hai, aksar broad Discard ya implicit discard, woh connection decide karta hai. Rule user ko "deny" nahi kar raha. Woh bas apply nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Authentication tay karta hai rule match hoga ya nahi">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="105" y="63" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.10</text>
<rect x="240" y="20" width="200" height="60" rx="8" fill="#fde68a"/><text x="340" y="42" text-anchor="middle" class="svg-ink" font-size="12">Rule: net-staff to srv-web</text><text x="340" y="60" text-anchor="middle" class="svg-ink" font-size="12">HTTPS Allow, auth: web-admins</text>
<rect x="480" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="13">srv-web</text>
<line x1="190" y1="50" x2="238" y2="50" stroke="#64748b" stroke-width="2"/><line x1="440" y1="50" x2="478" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="20" y="125" class="svg-ink" font-size="13">Koi user logged in nahi</text><text x="250" y="125" class="svg-muted" font-size="12">rule skip, neeche ke rules par jaata hai</text>
<text x="20" y="155" class="svg-ink" font-size="13">Dusre group ka user</text><text x="250" y="155" class="svg-muted" font-size="12">rule skip</text>
<text x="20" y="185" class="svg-ink" font-size="13">web-admins ka user</text><text x="250" y="185" class="svg-accent" font-size="12">rule match, Allow lagta hai</text>
</svg><p class="cap">Authentication ek aur condition hai. Fail hone par rule match nahi karta aur engine aage padhta hai.</p></div>

<h3>Aam pattern</h3>
<p>Authenticated rule ko broad rule ke upar rakho. Jaise rule 4 <code>net-staff</code> ko <code>srv-web</code> par SSH allow karta hai jab user group <code>web-admins</code> mein ho. Uske neeche staff se SSH ka Discard baaki sabko pakad leta hai. Admins login ke baad andar aate hain; baaki sab Discard se drop hote hain, aur log batata hai kaunse rule ne kiya.</p>

<div class="eg"><p><b>Worked example.</b> Rule 4: source <code>net-staff</code>, destination <code>srv-web</code>, service <code>SSH</code>, Allow, authentication group <code>web-admins</code>. Rule 5: net-staff to srv-web SSH Discard. Priya, web-admins mein, STAFF-PC (10.1.1.10) se login karti hai aur 172.16.20.20 par SSH kholti hai: rule 4 match hota hai aur woh andar aa jati hai. Baad mein, jab koi logged in nahi, STAFF-PC SSH kholta hai: rule 4 skip hota hai kyunki authenticated user nahi, rule 5 match, Discard. Wahi PC, wahi destination, wahi service. Sirf fark yeh hai ki kaun logged in hai.</p></div>

<h3>Users kahan se aate hain</h3>
<p>Element set mein users hote hain, har ek ka group, password aur optional multi-factor setting. Console tool mein rule test karne ke liye aap kisi source address par user login karwa sakte ho. Simulator real user directory ya real login portal model nahi karta, isliye login ko test step maano. Production mein engine users ko aapke configure kiye authentication method se seekhta hai; apne NGFW version ki documentation check karo.</p>
<pre class="out">Policy match test  10.1.1.10 -&gt; 172.16.20.20 tcp/22
Logged-in users on 10.1.1.10: none
 4    no   (authentication: web-admins required)
<span class="hl"> 5    MATCH   net-staff -&gt; srv-web   SSH   Discard</span>
Result: Discard by rule 5

Logged-in users on 10.1.1.10: priya (web-admins)
<span class="hl"> 4    MATCH   net-staff -&gt; srv-web   SSH   Allow   auth web-admins</span>
Result: Allow by rule 4</pre>

<div class="warn"><p><b>Common mistake.</b> Authenticated Allow ko Discard ke neeche rakhna. Discard connection pehle pakad leta hai, to logged-in users bhi block ho jaate hain. Order yahan bhi lagta hai: authenticated rule upar, fallback neeche.</p></div>
<div class="exam"><p><b>Exam trap.</b> Authentication rule evaluation ke beech connection ko "challenge" nahi karta. Woh tabhi match karta hai jab us source ke liye sahi group ka authenticated user pehle se maloom ho. Missing group element install par validation error hai.</p></div>

<div class="scn"><h4>Clean-up ke baad admins locked out</h4><p>Policy tidy-up ke dauran ek junior engineer ne SSH procedure se login step hata diya kyunki woh redundant lag raha tha. Agli subah web admins server par SSH nahi kar paaye. Rule theek tha, par koi authenticated nahi tha, isliye rule 4 skip hua aur neeche ka Discard fire hua. Fix login step wapas laana tha, rule edit karna nahi. Team ne login step runbook mein add kiya.</p><p><b>Lesson:</b> jo rule identity par depend karta hai, use connection ke waqt identity ka maujood hona zaroori hai.</p></div>
<div class="iv"><p class="q">"Firewall rule IP address ki jagah user par kaise based ho sakta hai?"</p><p>Rule ke authentication option mein user group ka naam hota hai. Rule tabhi match karta hai jab source address par us group ka authenticated user ho. Samjhao ki warna rule skip hota hai aur neeche ke rules decide karte hain, aur aap use fallback rule ke upar rakhoge.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Authentication option ek user group ka naam deta hai.</li>
<li>Rule sirf us source ke liye match hota hai jis par us group ka authenticated user ho.</li>
<li>Nahi to rule skip hota hai aur evaluation neeche chalti hai.</li>
<li>Authenticated rule ko fallback Discard ke upar rakho.</li>
</ul></div>
`}};export{e as default};