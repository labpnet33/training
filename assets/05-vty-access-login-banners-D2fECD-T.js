var e={id:`vty-restrict`,h:{en:`Restricting VTY access: access-class, login block-for and banners`,hi:`VTY access seemit karna: access-class, login block-for aur banners`},body:{en:`
<p>A good staff entrance has three layers. The gate only opens for cars from the company car park (source restriction). If someone swipes a wrong card three times, the reader locks for a few minutes (brute-force protection). And a sign on the door warns that the area is private and monitored (legal banner). In this chapter you add the same three layers to the VTY lines.</p>

<h3>Layer 1: access-class, who may even try</h3>
<p><b>access-class</b> applies a standard ACL to the VTY lines. It is checked when the TCP connection arrives, before any banner or login prompt. A source that is not permitted gets <code>% Connection refused by remote host</code>: it never sees a password prompt, so it cannot guess passwords at all.</p>
<pre class="code">EDGE(config)# access-list 15 remark NOC management subnet only
EDGE(config)# access-list 15 permit 10.99.99.0 0.0.0.255
EDGE(config)# access-list 15 deny any log        <span class="c">! optional: log refused sources</span>
EDGE(config)# line vty 0 4
EDGE(config-line)# access-class 15 in
EDGE(config-line)# exec-timeout 5 0</pre>
<ul>
<li>A <b>standard</b> ACL is used because only the source address matters; the destination is the router itself.</li>
<li>A named standard ACL works the same way: <code>ip access-list standard NOC-MGMT</code> then <code>access-class NOC-MGMT in</code>.</li>
<li><code>access-class ... out</code> is different: it limits where users on the router may Telnet or SSH <i>to</i>.</li>
<li>For IPv6 management use <code>ipv6 access-class NAME in</code>.</li>
<li>Apply it to <b>every</b> VTY range, including <code>line vty 5 15</code> on switches.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Checks on an incoming VTY connection">
<rect x="10" y="80" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="60" y="102" text-anchor="middle" class="svg-ink" font-size="13">SSH from</text><text x="60" y="119" text-anchor="middle" class="svg-muted" font-size="12">any host</text>
<rect x="135" y="80" width="110" height="50" rx="8" fill="#fde68a"/><text x="190" y="102" text-anchor="middle" class="svg-ink" font-size="13">access-class</text><text x="190" y="119" text-anchor="middle" class="svg-muted" font-size="12">source OK?</text>
<rect x="270" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="325" y="102" text-anchor="middle" class="svg-ink" font-size="13">quiet mode?</text><text x="325" y="119" text-anchor="middle" class="svg-muted" font-size="12">block-for</text>
<rect x="405" y="80" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="455" y="102" text-anchor="middle" class="svg-ink" font-size="13">banner +</text><text x="455" y="119" text-anchor="middle" class="svg-muted" font-size="12">login local</text>
<rect x="530" y="80" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="580" y="102" text-anchor="middle" class="svg-ink" font-size="13">EDGE#</text><text x="580" y="119" text-anchor="middle" class="svg-muted" font-size="12">exec-timeout</text>
<line x1="110" y1="105" x2="135" y2="105" stroke="#64748b" stroke-width="2"/><line x1="245" y1="105" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><line x1="380" y1="105" x2="405" y2="105" stroke="#64748b" stroke-width="2"/><line x1="505" y1="105" x2="530" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="190" y="165" text-anchor="middle" class="svg-accent" font-size="12">no: Connection refused</text>
<text x="325" y="190" text-anchor="middle" class="svg-accent" font-size="12">yes: refused for N seconds</text>
<text x="455" y="165" text-anchor="middle" class="svg-accent" font-size="12">wrong: Login invalid</text>
</svg><p class="cap">Each check stops a different attacker. Source filtering happens first, so outsiders never reach the password prompt.</p></div>

<h3>Layer 2: slowing down password guessing</h3>
<pre class="code">EDGE(config)# login block-for 120 attempts 3 within 60
EDGE(config)# login quiet-mode access-class 15    <span class="c">! NOC can still log in during quiet mode</span>
EDGE(config)# login delay 2                        <span class="c">! 2 s between login attempts</span>
EDGE(config)# login on-failure log
EDGE(config)# login on-success log</pre>
<p><b>login block-for 120 attempts 3 within 60</b> means: if 3 logins fail within 60 seconds, refuse all new Telnet/SSH logins for 120 seconds. This period is called <b>quiet mode</b>. Without an exception, quiet mode would also lock out your own NOC during an attack, so <b>login quiet-mode access-class</b> names an ACL whose sources are still allowed. <code>login delay</code> adds a pause between attempts, and the <code>on-failure</code>/<code>on-success</code> keywords send syslog messages you can alert on.</p>

<pre class="out">EDGE# show login
     A login delay of 2 seconds is applied.
     Quiet-Mode access list 15 is applied.
     All successful login is logged.
     All failed login is logged.

     Router enabled to watch for login Attacks.
     If more than 3 login failures occur in 60 seconds or less,
     logins will be disabled for 120 seconds.

     <span class="hl">Router presently in Quiet-Mode.</span>
     <span class="hl">Will remain in Quiet-Mode for 94 seconds.</span>
     Restricted logins filtered by applied ACL 15.

*Sep 29 10:31:07: %SEC_LOGIN-1-QUIET_MODE_ON: Still timeleft for watching failures is 41 secs, [user: admin] [Source: 10.10.10.10] [localport: 22] [Reason: Login Authentication Failed] [ACL: 15] at 10:31:07 UTC Tue Sep 29 2026</pre>

<h3>Layer 3: banners and the legal notice</h3>
<table class="cmp"><tr><th>Banner</th><th>When it appears</th><th>Typical use</th></tr>
<tr><td><code>banner motd</code></td><td>On connection, to everyone (on many releases, after authentication for SSH)</td><td>Legal warning, maintenance notices</td></tr>
<tr><td><code>banner login</code></td><td>Before the username/password prompt, including for SSH</td><td>Legal warning that must be seen before login</td></tr>
<tr><td><code>banner exec</code></td><td>After a successful login, when the EXEC session starts</td><td>Internal notes for authorised staff</td></tr>
</table>
<pre class="code">EDGE(config)# banner motd #Authorised access only. Activity is logged.#
EDGE(config)# banner login ^
WARNING: This device belongs to NK Networks. Access is limited to
authorised personnel. All activity is monitored and recorded.
Disconnect now if you are not authorised.
^</pre>
<p>The first character after the keyword is the <b>delimiter</b>; the banner ends at the next copy of it, so it must not appear in the text. A legal notice should say the system is private, access is for authorised users only, activity is monitored, and unauthorised use may be prosecuted. It should never say "Welcome": in some legal systems an invitation weakens a prosecution. Keep device details (model, IOS version, site address) out of banners; they help attackers.</p>

<div class="eg"><p><b>Worked example.</b> Lab task 4 creates <code>access-list 15 permit 10.99.99.0 0.0.0.255</code> and applies <code>access-class 15 in</code> under <code>line vty 0 4</code>. Task 5 adds <code>banner motd #Authorised access only. Activity is logged.#</code>. From PC-USER (10.10.10.10), <code>ssh -l netadmin 10.0.12.2</code> now fails immediately with <code>% Connection refused by remote host</code>, and <code>show access-lists 15</code> on EDGE shows the matches:</p>
<pre class="out">EDGE# show access-lists 15
Standard IP access list 15
    10 permit 10.99.99.0, wildcard bits 0.0.0.255 (4 matches)
    <span class="hl">20 deny   any log (2 matches)</span></pre></div>

<div class="warn"><p><b>Common mistakes.</b> Writing the ACL with a subnet mask (255.255.255.0) instead of a wildcard (0.0.0.255). Applying the ACL with <code>ip access-group</code> on an interface instead of <code>access-class</code> on the lines. Applying <code>access-class</code> before checking that your own PC's source address is permitted, and locking yourself out. Forgetting vty 5 15. Using a delimiter that appears inside the banner text.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>access-class</code> is for lines, <code>ip access-group</code> is for interfaces. VTY filtering uses a standard ACL matching the source. A refused source sees "Connection refused", not a password prompt. <code>login block-for</code> triggers quiet mode; <code>login quiet-mode access-class</code> defines who is exempt. MOTD, login and exec banners appear in that order.</p></div>

<div class="scn"><h4>Ten thousand login attempts a day</h4><p>A small ISP noticed that syslog on its border router was full of failed SSH logins from addresses all over the internet. The management interface had a public address and no VTY restriction. The team applied an <code>access-class</code> permitting only the NOC and a jump host, added <code>login block-for 300 attempts 5 within 60</code> with a quiet-mode exception for the NOC, and replaced the "Welcome to BR1" MOTD with a legal login banner. Failed logins dropped to zero because outsiders were refused before authentication.</p><p><b>Lesson:</b> the best password is one the attacker never gets the chance to try. Filter the source first.</p></div>

<div class="iv"><p class="q">"How do you restrict SSH access to a router to your management subnet only?"</p><p>Strong answer: create a standard ACL permitting the management subnet (with wildcard mask) and apply it inbound to all VTY lines with <code>access-class N in</code>. Explain that it is checked before authentication, so other sources get "connection refused". Add <code>login block-for</code> with a <code>quiet-mode access-class</code> exception, exec-timeout and a legal login banner. For bonus points mention <code>ipv6 access-class</code> and control-plane policing or infrastructure ACLs at a higher level.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>access-class ACL in</code> on the VTY lines limits which sources can reach the login prompt.</li>
<li>Use a standard ACL with wildcard masks; add <code>deny any log</code> to record refused sources.</li>
<li><code>login block-for S attempts N within T</code> triggers quiet mode; exempt the NOC with <code>login quiet-mode access-class</code>.</li>
<li><code>show login</code> and <code>show access-lists</code> verify the protection.</li>
<li>Banners: motd, login, exec. The legal notice warns; it never welcomes.</li>
</ul></div>
`,hi:`
<p>Achhe staff entrance mein teen layers hoti hain. Gate sirf company car park ki gaadiyon ke liye khulta hai (source restriction). Agar koi teen baar galat card swipe kare, to reader kuch minute ke liye lock ho jaata hai (brute-force protection). Aur darwaze par board warning deta hai ki area private hai aur monitored hai (legal banner). Is chapter mein aap VTY lines par yahi teen layers lagaoge.</p>

<h3>Layer 1: access-class, kaun koshish bhi kar sakta hai</h3>
<p><b>access-class</b> VTY lines par standard ACL lagata hai. Yeh tab check hota hai jab TCP connection aata hai, kisi bhi banner ya login prompt se pehle. Jo source permit nahi hai use <code>% Connection refused by remote host</code> milta hai: use kabhi password prompt dikhta hi nahi, isliye woh password guess kar hi nahi sakta.</p>
<pre class="code">EDGE(config)# access-list 15 remark NOC management subnet only
EDGE(config)# access-list 15 permit 10.99.99.0 0.0.0.255
EDGE(config)# access-list 15 deny any log        <span class="c">! optional: refuse hue sources log karo</span>
EDGE(config)# line vty 0 4
EDGE(config-line)# access-class 15 in
EDGE(config-line)# exec-timeout 5 0</pre>
<ul>
<li><b>Standard</b> ACL use hota hai kyunki sirf source address matter karta hai; destination router khud hai.</li>
<li>Named standard ACL bhi aise hi chalta hai: <code>ip access-list standard NOC-MGMT</code> phir <code>access-class NOC-MGMT in</code>.</li>
<li><code>access-class ... out</code> alag hai: yeh limit karta hai ki router par baithe users kahan <i>tak</i> Telnet ya SSH kar sakte hain.</li>
<li>IPv6 management ke liye <code>ipv6 access-class NAME in</code> use karo.</li>
<li>Ise <b>har</b> VTY range par lagao, switches par <code>line vty 5 15</code> samet.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Aane wale VTY connection par checks">
<rect x="10" y="80" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="60" y="102" text-anchor="middle" class="svg-ink" font-size="13">SSH kisi</text><text x="60" y="119" text-anchor="middle" class="svg-muted" font-size="12">bhi host se</text>
<rect x="135" y="80" width="110" height="50" rx="8" fill="#fde68a"/><text x="190" y="102" text-anchor="middle" class="svg-ink" font-size="13">access-class</text><text x="190" y="119" text-anchor="middle" class="svg-muted" font-size="12">source OK?</text>
<rect x="270" y="80" width="110" height="50" rx="8" fill="#fed7aa"/><text x="325" y="102" text-anchor="middle" class="svg-ink" font-size="13">quiet mode?</text><text x="325" y="119" text-anchor="middle" class="svg-muted" font-size="12">block-for</text>
<rect x="405" y="80" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="455" y="102" text-anchor="middle" class="svg-ink" font-size="13">banner +</text><text x="455" y="119" text-anchor="middle" class="svg-muted" font-size="12">login local</text>
<rect x="530" y="80" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="580" y="102" text-anchor="middle" class="svg-ink" font-size="13">EDGE#</text><text x="580" y="119" text-anchor="middle" class="svg-muted" font-size="12">exec-timeout</text>
<line x1="110" y1="105" x2="135" y2="105" stroke="#64748b" stroke-width="2"/><line x1="245" y1="105" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><line x1="380" y1="105" x2="405" y2="105" stroke="#64748b" stroke-width="2"/><line x1="505" y1="105" x2="530" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="190" y="165" text-anchor="middle" class="svg-accent" font-size="12">nahi: Connection refused</text>
<text x="325" y="190" text-anchor="middle" class="svg-accent" font-size="12">haan: N seconds tak refused</text>
<text x="455" y="165" text-anchor="middle" class="svg-accent" font-size="12">galat: Login invalid</text>
</svg><p class="cap">Har check ek alag attacker ko rokta hai. Source filtering sabse pehle hoti hai, isliye bahar wale kabhi password prompt tak nahi pahunchte.</p></div>

<h3>Layer 2: password guessing ko dheema karna</h3>
<pre class="code">EDGE(config)# login block-for 120 attempts 3 within 60
EDGE(config)# login quiet-mode access-class 15    <span class="c">! quiet mode mein bhi NOC login kar sake</span>
EDGE(config)# login delay 2                        <span class="c">! login attempts ke beech 2 s</span>
EDGE(config)# login on-failure log
EDGE(config)# login on-success log</pre>
<p><b>login block-for 120 attempts 3 within 60</b> ka matlab: agar 60 second mein 3 logins fail hon, to 120 second tak saare naye Telnet/SSH logins refuse karo. Is period ko <b>quiet mode</b> kehte hain. Exception ke bina, attack ke dauraan quiet mode aapke apne NOC ko bhi lock out kar dega, isliye <b>login quiet-mode access-class</b> ek ACL batata hai jiske sources ko phir bhi allow kiya jaata hai. <code>login delay</code> attempts ke beech pause daalta hai, aur <code>on-failure</code>/<code>on-success</code> keywords syslog messages bhejte hain jin par aap alert laga sakte ho.</p>

<pre class="out">EDGE# show login
     A login delay of 2 seconds is applied.
     Quiet-Mode access list 15 is applied.
     All successful login is logged.
     All failed login is logged.

     Router enabled to watch for login Attacks.
     If more than 3 login failures occur in 60 seconds or less,
     logins will be disabled for 120 seconds.

     <span class="hl">Router presently in Quiet-Mode.</span>
     <span class="hl">Will remain in Quiet-Mode for 94 seconds.</span>
     Restricted logins filtered by applied ACL 15.

*Sep 29 10:31:07: %SEC_LOGIN-1-QUIET_MODE_ON: Still timeleft for watching failures is 41 secs, [user: admin] [Source: 10.10.10.10] [localport: 22] [Reason: Login Authentication Failed] [ACL: 15] at 10:31:07 UTC Tue Sep 29 2026</pre>

<h3>Layer 3: banners aur legal notice</h3>
<table class="cmp"><tr><th>Banner</th><th>Kab dikhta hai</th><th>Typical use</th></tr>
<tr><td><code>banner motd</code></td><td>Connection par, sabko (kai releases par SSH ke liye authentication ke baad)</td><td>Legal warning, maintenance notices</td></tr>
<tr><td><code>banner login</code></td><td>Username/password prompt se pehle, SSH ke liye bhi</td><td>Legal warning jo login se pehle dikhni hi chahiye</td></tr>
<tr><td><code>banner exec</code></td><td>Successful login ke baad, jab EXEC session shuru hota hai</td><td>Authorised staff ke liye internal notes</td></tr>
</table>
<pre class="code">EDGE(config)# banner motd #Authorised access only. Activity is logged.#
EDGE(config)# banner login ^
WARNING: This device belongs to NK Networks. Access is limited to
authorised personnel. All activity is monitored and recorded.
Disconnect now if you are not authorised.
^</pre>
<p>Keyword ke baad ka pehla character <b>delimiter</b> hai; banner uski agli copy par khatam hota hai, isliye woh text mein nahi aana chahiye. Legal notice mein likha hona chahiye ki system private hai, access sirf authorised users ke liye hai, activity monitor hoti hai, aur unauthorised use par case ho sakta hai. Usmein kabhi "Welcome" nahi hona chahiye: kuch legal systems mein invitation prosecution ko kamzor karta hai. Device details (model, IOS version, site address) banners se bahar rakho; woh attackers ki madad karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Lab task 4 <code>access-list 15 permit 10.99.99.0 0.0.0.255</code> banata hai aur <code>line vty 0 4</code> ke neeche <code>access-class 15 in</code> lagata hai. Task 5 <code>banner motd #Authorised access only. Activity is logged.#</code> add karta hai. PC-USER (10.10.10.10) se <code>ssh -l netadmin 10.0.12.2</code> ab turant <code>% Connection refused by remote host</code> ke saath fail hota hai, aur EDGE par <code>show access-lists 15</code> matches dikhata hai:</p>
<pre class="out">EDGE# show access-lists 15
Standard IP access list 15
    10 permit 10.99.99.0, wildcard bits 0.0.0.255 (4 matches)
    <span class="hl">20 deny   any log (2 matches)</span></pre></div>

<div class="warn"><p><b>Common galtiyan.</b> ACL mein wildcard (0.0.0.255) ki jagah subnet mask (255.255.255.0) likhna. ACL ko lines par <code>access-class</code> ki jagah interface par <code>ip access-group</code> se lagana. Yeh check kiye bina <code>access-class</code> lagana ki aapke apne PC ka source address permitted hai, aur khud ko lock out kar lena. vty 5 15 bhool jaana. Aisa delimiter use karna jo banner text ke andar bhi aata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>access-class</code> lines ke liye hai, <code>ip access-group</code> interfaces ke liye. VTY filtering source match karne wala standard ACL use karta hai. Refused source ko "Connection refused" dikhta hai, password prompt nahi. <code>login block-for</code> quiet mode trigger karta hai; <code>login quiet-mode access-class</code> batata hai ki kaun exempt hai. MOTD, login aur exec banners isi order mein aate hain.</p></div>

<div class="scn"><h4>Din mein das hazaar login attempts</h4><p>Ek chhote ISP ne dekha ki uske border router ka syslog internet bhar ke addresses se aaye failed SSH logins se bhara tha. Management interface ka public address tha aur koi VTY restriction nahi thi. Team ne sirf NOC aur ek jump host ko permit karne wala <code>access-class</code> lagaya, NOC ke liye quiet-mode exception ke saath <code>login block-for 300 attempts 5 within 60</code> add kiya, aur "Welcome to BR1" MOTD ko legal login banner se badla. Failed logins zero ho gaye kyunki bahar walon ko authentication se pehle hi refuse kar diya gaya.</p><p><b>Seekh:</b> sabse achha password woh hai jise attacker ko try karne ka mauka hi na mile. Pehle source filter karo.</p></div>

<div class="iv"><p class="q">"Router par SSH access sirf apne management subnet tak kaise seemit karoge?"</p><p>Strong answer: management subnet ko permit karne wala standard ACL banao (wildcard mask ke saath) aur use saari VTY lines par inbound <code>access-class N in</code> se lagao. Samjhao ki yeh authentication se pehle check hota hai, isliye doosre sources ko "connection refused" milta hai. <code>quiet-mode access-class</code> exception ke saath <code>login block-for</code>, exec-timeout aur legal login banner add karo. Bonus points ke liye <code>ipv6 access-class</code> aur upar ke level par control-plane policing ya infrastructure ACLs ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VTY lines par <code>access-class ACL in</code> limit karta hai ki kaunse sources login prompt tak pahunch sakte hain.</li>
<li>Wildcard masks wala standard ACL use karo; refuse hue sources record karne ke liye <code>deny any log</code> add karo.</li>
<li><code>login block-for S attempts N within T</code> quiet mode trigger karta hai; NOC ko <code>login quiet-mode access-class</code> se exempt karo.</li>
<li><code>show login</code> aur <code>show access-lists</code> protection verify karte hain.</li>
<li>Banners: motd, login, exec. Legal notice warning deta hai; kabhi welcome nahi karta.</li>
</ul></div>
`}};export{e as default};