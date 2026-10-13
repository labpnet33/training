var e={id:`troubleshooting`,h:{en:`Troubleshooting authentication: a method that works`,hi:`Authentication troubleshooting: ek kaam karne wala method`},body:{en:`
<p>Authentication faults feel mysterious because three things must work together: the network path to the identity source, the credentials or login events, and the policy that uses the group. A good engineer splits the problem into those three layers and tests one at a time, instead of changing settings at random.</p>
<div class="note"><p><b>Reference only.</b> The simulator cannot run any of the authentication commands below, so this chapter shows <b>no output</b>. The commands are real FortiOS tools, listed as a <b>Reference configuration (not run in the simulator)</b> checklist. Output formats and available options differ between releases, so run each with <code>?</code> first. The policy-side checks (lookup, session list, logs) are practised in <b>nse4-policy</b> and <b>nse4-nat</b>.</p></div>

<h3>Three layers</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three troubleshooting layers">
<rect x="10" y="60" width="180" height="70" rx="10" fill="#bae6fd"/><text x="100" y="88" text-anchor="middle" class="svg-ink" font-size="13">1. Reach the source</text><text x="100" y="108" text-anchor="middle" class="svg-muted" font-size="12">route, port, secret, time</text>
<rect x="230" y="60" width="180" height="70" rx="10" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">2. Prove the login</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">credentials, groups</text>
<rect x="450" y="60" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="88" text-anchor="middle" class="svg-ink" font-size="13">3. Match the policy</text><text x="540" y="108" text-anchor="middle" class="svg-muted" font-size="12">group, order, session</text>
<line x1="190" y1="95" x2="230" y2="95" stroke="#64748b" stroke-width="2"/><line x1="410" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Test the layers in order; a fault in an early layer hides the later ones.</p></div>

<h3>Layer 1: can the firewall reach the source?</h3>
<ul>
<li>Is there a route and a policy for the traffic from the FortiGate to the LDAP, RADIUS or collector address? Check the correct port (LDAP 389 or 636 for LDAPS, RADIUS 1812, collector 8000 by default).</li>
<li>Do the shared secret (RADIUS) and password (FSSO) match on both sides?</li>
<li>Do the clocks agree? Large time differences break tickets and some MFA codes.</li>
<li>Is the firewall registered as a client on the RADIUS server, with the same source address?</li>
</ul>

<h3>Layer 2: does the login itself succeed?</h3>
<p>Useful real FortiOS commands, to be run on a unit that has these features:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
diagnose test authserver ldap CORP-AD anita.sharma
diagnose test authserver radius CORP-RADIUS auto anita.sharma
diagnose debug application fnbamd -1
diagnose debug enable</pre>
<ul>
<li><code>diagnose test authserver</code> sends a test login to the server object. The prompt for the password follows. Never put real passwords in tickets.</li>
<li><code>diagnose debug application fnbamd -1</code> shows the authentication daemon's steps, such as the bind and the result. Turn debugging off afterwards with <code>diagnose debug disable</code> and reset the level.</li>
<li>For FSSO, <code>diagnose debug authd fsso server-status</code> and <code>diagnose debug authd fsso list</code> show the collector connection and learned users.</li>
</ul>

<h3>Layer 3: does the policy match the user?</h3>
<ul>
<li><code>diagnose firewall auth list</code> lists authenticated users and their addresses, so you can see whether the person has an identity at all.</li>
<li>Check the group name used in the policy and the groups the user really has.</li>
<li>Check policy order: a broad policy above the group policy may take the traffic first.</li>
<li>Use a fresh connection after any change; old sessions keep their earlier decision. This is the same rule you saw with NAT and policy changes.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Rohit says he cannot reach the payroll server. Layer 1: the firewall reaches the directory. Layer 2: a test login for Rohit succeeds. Layer 3: the authenticated user list shows him, but his groups do not include FINANCE-USERS, so policy 20 skips him. Conclusion: no fault, no change; Rohit simply is not entitled. The helpdesk answers with the access request process rather than a firewall edit.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Leaving debug on, which floods the console and slows the unit; testing with an admin account whose rights differ from the user's; changing the policy before proving the login; reading "timeout" as "firewall bug" when the secret is wrong; sharing screenshots that include passwords or secrets.</p></div>
<div class="exam"><p><b>Exam trap.</b> A user who authenticates successfully is still denied if no policy lists a group they belong to. "Login works" and "access works" are separate results; check both.</p></div>

<div class="scn"><h4>Works in the morning, fails in the afternoon</h4><p>Users at one branch lost access every afternoon. The authenticated list showed mappings expiring while the collector link flapped on a slow line. Layer 1 was the cause: the link, not the policy or the accounts. Stabilising the link, and raising the user timeout a little, ended the afternoon outages.</p><p><b>Lesson:</b> time-patterned failures point to a timeout or a flapping link, not to configuration.</p></div>

<div class="iv"><p class="q">"Users cannot authenticate to the FortiGate. How do you troubleshoot?"</p><p>I split it into three layers. First, can the firewall reach the LDAP, RADIUS or FSSO collector (route, port, secret, time)? Second, does a test login succeed and what do the authentication debug messages say? Third, is the user in the authenticated list, in the right group, and is the group policy above any broad policy? I change one thing at a time and re-test with a new connection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in three layers: reach the source, prove the login, match the policy.</li>
<li>Real tools: <code>diagnose test authserver</code>, <code>diagnose debug application fnbamd</code>, <code>diagnose firewall auth list</code>.</li>
<li>These commands are not run in the simulator; use <code>?</code> on a real unit.</li>
<li>Always turn debugging off and re-test with a fresh session.</li>
</ul></div>
`,hi:`
<p>Authentication ki faults mysterious lagti hain kyunki teen cheezon ko saath kaam karna padta hai: identity source tak network path, credentials ya login events, aur woh policy jo group use karti hai. Achha engineer problem ko in teen layers mein baantta hai aur ek-ek karke test karta hai, random settings badalne ki jagah.</p>
<div class="note"><p><b>Reference only.</b> Simulator neeche ke koi authentication commands nahi chala sakta, isliye is chapter mein <b>koi output nahi</b> hai. Commands real FortiOS tools hain, jo <b>Reference configuration (not run in the simulator)</b> checklist ke roop mein listed hain. Output formats aur options releases ke beech alag hote hain, isliye har ek ko pehle <code>?</code> ke saath chalao. Policy-side checks (lookup, session list, logs) <b>nse4-policy</b> aur <b>nse4-nat</b> mein practise hote hain.</p></div>

<h3>Teen layers</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three troubleshooting layers">
<rect x="10" y="60" width="180" height="70" rx="10" fill="#bae6fd"/><text x="100" y="88" text-anchor="middle" class="svg-ink" font-size="13">1. Source tak pahuncho</text><text x="100" y="108" text-anchor="middle" class="svg-muted" font-size="12">route, port, secret, time</text>
<rect x="230" y="60" width="180" height="70" rx="10" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">2. Login saabit karo</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">credentials, groups</text>
<rect x="450" y="60" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="88" text-anchor="middle" class="svg-ink" font-size="13">3. Policy match karo</text><text x="540" y="108" text-anchor="middle" class="svg-muted" font-size="12">group, order, session</text>
<line x1="190" y1="95" x2="230" y2="95" stroke="#64748b" stroke-width="2"/><line x1="410" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Layers ko order mein test karo; pehli layer ki fault baad wali ko chhupa deti hai.</p></div>

<h3>Layer 1: kya firewall source tak pahunch sakta hai?</h3>
<ul>
<li>Kya FortiGate se LDAP, RADIUS ya collector address tak traffic ke liye route aur policy hai? Sahi port check karo (LDAP 389 ya LDAPS ke liye 636, RADIUS 1812, collector default 8000).</li>
<li>Kya shared secret (RADIUS) aur password (FSSO) dono side match karte hain?</li>
<li>Kya clocks agree karti hain? Bade time differences tickets aur kuch MFA codes tod dete hain.</li>
<li>Kya firewall RADIUS server par client ke roop mein register hai, usi source address ke saath?</li>
</ul>

<h3>Layer 2: kya login khud succeed hota hai?</h3>
<p>Kaam ke real FortiOS commands, aise unit par chalane ke liye jisme yeh features hon:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
diagnose test authserver ldap CORP-AD anita.sharma
diagnose test authserver radius CORP-RADIUS auto anita.sharma
diagnose debug application fnbamd -1
diagnose debug enable</pre>
<ul>
<li><code>diagnose test authserver</code> server object ko test login bhejta hai. Uske baad password ka prompt aata hai. Asli passwords tickets mein kabhi mat daalo.</li>
<li><code>diagnose debug application fnbamd -1</code> authentication daemon ke steps dikhata hai, jaise bind aur result. Baad mein <code>diagnose debug disable</code> se debugging band karo aur level reset karo.</li>
<li>FSSO ke liye <code>diagnose debug authd fsso server-status</code> aur <code>diagnose debug authd fsso list</code> collector connection aur seekhe hue users dikhate hain.</li>
</ul>

<h3>Layer 3: kya policy user se match karti hai?</h3>
<ul>
<li><code>diagnose firewall auth list</code> authenticated users aur unke addresses list karta hai, taaki dikhe ki insaan ki identity hai bhi ya nahi.</li>
<li>Policy mein use hone wala group naam aur user ke asli groups check karo.</li>
<li>Policy order check karo: group policy ke upar ki broad policy traffic pehle le sakti hai.</li>
<li>Har change ke baad fresh connection use karo; purane sessions apna pehla decision rakhte hain. Yahi rule aapne NAT aur policy changes mein dekha.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Rohit kehta hai ki woh payroll server tak nahi pahunch pa raha. Layer 1: firewall directory tak pahunchta hai. Layer 2: Rohit ka test login succeed hota hai. Layer 3: authenticated user list mein woh dikhta hai, lekin uske groups mein FINANCE-USERS nahi hai, isliye policy 20 use skip karti hai. Nateeja: koi fault nahi, koi change nahi; Rohit ka bas entitlement nahi hai. Helpdesk firewall edit ki jagah access request process ka jawab deta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Debug on chhod dena, jo console flood karta hai aur unit slow karta hai; admin account se test karna jiske rights user se alag hain; login saabit karne se pehle policy badalna; secret galat ho to "timeout" ko "firewall bug" samajhna; aise screenshots share karna jisme passwords ya secrets hon.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jo user successfully authenticate ho jaye use bhi deny milta hai agar koi policy uska group list nahi karti. "Login kaam karta hai" aur "access kaam karta hai" alag results hain; dono check karo.</p></div>

<div class="scn"><h4>Subah chalta hai, dopahar ko fail</h4><p>Ek branch ke users har dopahar access kho dete the. Authenticated list ne dikhaya ki mappings expire ho rahe the jabki slow line par collector link flap kar raha tha. Layer 1 wajah thi: link, na ki policy ya accounts. Link ko stable karne aur user timeout thoda badhane se dopahar ke outages khatam hue.</p><p><b>Lesson:</b> time-pattern wali failures timeout ya flapping link ki taraf ishara karti hain, configuration ki taraf nahi.</p></div>

<div class="iv"><p class="q">"Users FortiGate par authenticate nahi kar paate. Troubleshoot kaise karoge?"</p><p>Main use teen layers mein baantta hoon. Pehle, kya firewall LDAP, RADIUS ya FSSO collector tak pahunch sakta hai (route, port, secret, time)? Doosra, kya test login succeed hota hai aur authentication debug messages kya kehte hain? Teesra, kya user authenticated list mein hai, sahi group mein hai, aur kya group policy kisi broad policy ke upar hai? Main ek waqt mein ek cheez badalta hoon aur naye connection se re-test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen layers mein troubleshoot karo: source tak pahuncho, login saabit karo, policy match karo.</li>
<li>Real tools: <code>diagnose test authserver</code>, <code>diagnose debug application fnbamd</code>, <code>diagnose firewall auth list</code>.</li>
<li>Yeh commands simulator mein nahi chalte; real unit par <code>?</code> use karo.</li>
<li>Debugging hamesha band karo aur fresh session se re-test karo.</li>
</ul></div>
`}};export{e as default};