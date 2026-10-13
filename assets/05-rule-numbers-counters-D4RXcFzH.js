var e={id:`counters`,h:{en:`Rule tags, numbers and hit counters`,hi:`Rule tags, numbers aur hit counters`},body:{en:`
<p>Reading a policy by eye works for four rules. It fails for forty. The console gives you two ways to <b>prove</b> which rule handled a connection instead of guessing: <b>hit counters</b> and the <b>Policy match test</b>. This chapter teaches you to use both, and to read the rule tag that links a log line back to the rule.</p>

<h3>Analogy: the stamp on the register</h3>
<p>Imagine the guard stamps a small tick next to the register line each time he follows it. At the end of the day you see line 3 has 120 ticks and line 5 has none. You now know line 5 never fired. That is a hit counter. The match test is different: you hand the guard a pretend visitor and ask "which line would you follow?" without letting anyone in.</p>

<h3>Rule tags and numbers</h3>
<p>Every rule in the compiled policy has a <b>rule number</b> and a <b>rule tag</b> (its identifier). The number tells you the position: <code>T1</code> for a template rule, <code>2</code> for your own rule, <code>3.1</code> for the first rule in the sub-policy called at position 3. Numbers can change when you insert or move a rule. The tag stays with the rule, so it is the stable way to follow one rule across edits. Logs record the rule that matched, so a log line can be traced back to the exact row.</p>
<table class="cmp"><tr><th>Item</th><th>Changes when you reorder?</th><th>Use it for</th></tr>
<tr><td>Rule number (1, T2, 3.1)</td><td>Yes</td><td>Reading order, talking to colleagues</td></tr>
<tr><td>Rule tag</td><td>No</td><td>Following one rule through edits and logs</td></tr>
<tr><td>Rule name</td><td>Only if you rename it</td><td>Human description</td></tr>
</table>

<h3>Hit counters</h3>
<p>The Policies page can show how many times each rule has matched since the policy was installed. In the simulator, counters reflect connections handled by the installed policy, and installing clears the simulated connections. Counters answer three questions:</p>
<ul>
<li><b>Is this rule used at all?</b> Zero hits after a busy day suggests a shadowed or unneeded rule.</li>
<li><b>Which rule handled my test?</b> Send one test connection and see which counter moved by one.</li>
<li><b>Did my change take effect?</b> Compare counters before and after install.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Counters before and after a test">
<text x="20" y="22" class="svg-ink" font-size="13">Before the test</text>
<rect x="20" y="30" width="270" height="28" rx="5" fill="#e2e8f0"/><text x="30" y="49" class="svg-ink" font-size="12">1  net-staff to srv-web HTTPS  Allow     hits 14</text>
<rect x="20" y="62" width="270" height="28" rx="5" fill="#e2e8f0"/><text x="30" y="81" class="svg-ink" font-size="12">2  any to any  any  Discard              hits 3</text>
<text x="350" y="22" class="svg-ink" font-size="13">After one HTTPS test from STAFF-PC</text>
<rect x="350" y="30" width="270" height="28" rx="5" fill="#bbf7d0"/><text x="360" y="49" class="svg-ink" font-size="12">1  net-staff to srv-web HTTPS  Allow     hits 15</text>
<rect x="350" y="62" width="270" height="28" rx="5" fill="#e2e8f0"/><text x="360" y="81" class="svg-ink" font-size="12">2  any to any  any  Discard              hits 3</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">Counter 1 moved by one: rule 1 handled the test</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">If counter 2 had moved instead, a Discard caught it and rule 1 did not fit</text>
</svg><p class="cap">Comparing counters before and after a single test proves which rule matched.</p></div>

<h3>The Policy match test</h3>
<p>On the Tools page, the Policy match test takes a source, destination and service and tells you which rule would match in the installed policy, without sending real traffic. Use it when you cannot test live, or when you want the full walk through every earlier rule.</p>
<pre class="out">Policy match test  engine NK-PUNE-FW  (installed policy)
Source 10.1.1.10  Destination 172.16.20.20  Service tcp/443
 T1   no   (destination)
 T2   no   (service)
 1    no   (service)
<span class="hl"> 2    MATCH   net-staff -&gt; srv-web   HTTPS   Allow   log Stored</span>
Result: Allow by rule 2</pre>
<p>Because it uses the <b>installed</b> snapshot, a rule you saved but did not install will not appear in the result. That is a feature: it shows what the engine really does.</p>

<div class="eg"><p><b>Worked example.</b> Lab <b>fp-policy-4</b>: prove which rule hit. Note the counters. From STAFF-PC send one HTTPS request to srv-web. Open the counters again: exactly one rule moved by one. Write its number and tag. Then send DNS to the internet and see a different rule move. You now have evidence for your answer, not an opinion.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading counters after a policy change without installing. Counters belong to the installed policy, so an uninstalled edit changes nothing. Another mistake is reading a total of "hits" over days and concluding a rule is dead when the policy was reinstalled this morning.</p></div>
<div class="exam"><p><b>Exam trap.</b> A rule number is a position, not an identity. After you insert a rule, the numbers below it shift. Do not write "rule 5" in a change ticket; write the name or tag too.</p></div>

<div class="scn"><h4>Which rule is letting this in?</h4><p>A security reviewer asked why the web server was reachable from the staff LAN on port 8080. Nobody remembered making such a rule. The admin ran the Policy match test for 10.1.1.10 to 172.16.20.20 on tcp/8080 and it matched rule 7, a broad "staff to DMZ any" Allow from an old project. The counters on rule 7 showed hundreds of hits. The team replaced it with a narrow HTTPS rule and kept the evidence in the change ticket.</p><p><b>Lesson:</b> counters and the match test turn "I think" into "rule 7, tag and name, this many hits".</p></div>
<div class="iv"><p class="q">"How do you find out which firewall rule allowed a given connection?"</p><p>Say you run the Policy match test for that source, destination and service, and confirm with the hit counter or the log entry, which names the rule. Mention that the test reads the installed policy and that rule numbers shift when you reorder.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule numbers show position; the rule tag follows the rule through edits.</li>
<li>Hit counters show which rules are used; a counter that moves by one proves the match.</li>
<li>The Policy match test walks the installed rules and names the match.</li>
<li>Both read the installed policy, so install before you measure.</li>
</ul></div>
`,hi:`
<p>Chaar rules wali policy aankh se padhna chal jata hai. Chalis rules par nahi chalta. Console aapko do tareeke deta hai jinse aap anuman ki jagah <b>prove</b> kar sako ki kaunsa rule connection handle kar raha hai: <b>hit counters</b> aur <b>Policy match test</b>. Yeh chapter dono use karna sikhata hai, aur rule tag padhna bhi, jo log line ko rule se jodta hai.</p>

<h3>Analogy: register par stamp</h3>
<p>Socho guard har baar register ki line follow karne par uske saamne chhota tick lagata hai. Din ke end mein dikhta hai ki line 3 par 120 ticks hain aur line 5 par koi nahi. Ab aapko pata hai ki line 5 kabhi fire nahi hui. Yeh hit counter hai. Match test alag hai: aap guard ko ek pretend visitor dete ho aur poochte ho "kaunsi line follow karoge?", kisi ko andar jaane diye bina.</p>

<h3>Rule tags aur numbers</h3>
<p>Compiled policy ke har rule ka ek <b>rule number</b> aur ek <b>rule tag</b> (identifier) hota hai. Number position batata hai: template rule ke liye <code>T1</code>, apne rule ke liye <code>2</code>, position 3 par bulaye gaye sub-policy ke pehle rule ke liye <code>3.1</code>. Rule insert ya move karne par numbers badal sakte hain. Tag rule ke saath rehta hai, isliye edits ke across ek rule ko follow karne ka stable tareeka wahi hai. Logs match hue rule ko record karte hain, to log line se exact row tak wapas ja sakte ho.</p>
<table class="cmp"><tr><th>Item</th><th>Reorder par badalta hai?</th><th>Kis liye</th></tr>
<tr><td>Rule number (1, T2, 3.1)</td><td>Haan</td><td>Order padhna, colleagues se baat</td></tr>
<tr><td>Rule tag</td><td>Nahi</td><td>Edits aur logs mein ek rule follow karna</td></tr>
<tr><td>Rule name</td><td>Sirf rename karne par</td><td>Human description</td></tr>
</table>

<h3>Hit counters</h3>
<p>Policies page dikha sakta hai ki policy install hone ke baad har rule kitni baar match hua. Simulator mein counters installed policy ki handle ki hui connections dikhate hain, aur install simulated connections clear kar deta hai. Counters teen sawaal solve karte hain:</p>
<ul>
<li><b>Yeh rule use hota bhi hai?</b> Busy din ke baad zero hits ka matlab shadowed ya zaroorat se zyada rule ho sakta hai.</li>
<li><b>Mere test ko kaunse rule ne handle kiya?</b> Ek test connection bhejo aur dekho kaunsa counter ek se badha.</li>
<li><b>Mera change effect mein aaya?</b> Install se pehle aur baad counters compare karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Test se pehle aur baad counters">
<text x="20" y="22" class="svg-ink" font-size="13">Test se pehle</text>
<rect x="20" y="30" width="270" height="28" rx="5" fill="#e2e8f0"/><text x="30" y="49" class="svg-ink" font-size="12">1  net-staff to srv-web HTTPS  Allow     hits 14</text>
<rect x="20" y="62" width="270" height="28" rx="5" fill="#e2e8f0"/><text x="30" y="81" class="svg-ink" font-size="12">2  any to any  any  Discard              hits 3</text>
<text x="350" y="22" class="svg-ink" font-size="13">STAFF-PC se ek HTTPS test ke baad</text>
<rect x="350" y="30" width="270" height="28" rx="5" fill="#bbf7d0"/><text x="360" y="49" class="svg-ink" font-size="12">1  net-staff to srv-web HTTPS  Allow     hits 15</text>
<rect x="350" y="62" width="270" height="28" rx="5" fill="#e2e8f0"/><text x="360" y="81" class="svg-ink" font-size="12">2  any to any  any  Discard              hits 3</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">Counter 1 ek se badha: rule 1 ne test handle kiya</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Agar counter 2 badhta, to Discard ne pakda aur rule 1 fit nahi hua</text>
</svg><p class="cap">Ek test se pehle aur baad counters compare karne se prove hota hai ki kaunsa rule match hua.</p></div>

<h3>Policy match test</h3>
<p>Tools page par Policy match test source, destination aur service leta hai aur batata hai ki installed policy mein kaunsa rule match karega, real traffic bhejne ke bina. Jab live test nahi kar sakte, ya har pehle rule ka poora walk chahiye, tab use karo.</p>
<pre class="out">Policy match test  engine NK-PUNE-FW  (installed policy)
Source 10.1.1.10  Destination 172.16.20.20  Service tcp/443
 T1   no   (destination)
 T2   no   (service)
 1    no   (service)
<span class="hl"> 2    MATCH   net-staff -&gt; srv-web   HTTPS   Allow   log Stored</span>
Result: Allow by rule 2</pre>
<p>Kyunki yeh <b>installed</b> snapshot use karta hai, jo rule aapne save kiya par install nahi kiya woh result mein nahi dikhega. Yeh feature hai: yeh dikhata hai ki engine sach mein kya karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab <b>fp-policy-4</b>: prove karo kaunsa rule hit hua. Counters note karo. STAFF-PC se srv-web par ek HTTPS request bhejo. Counters dubara kholo: bilkul ek rule ek se badha. Uska number aur tag likho. Phir internet par DNS bhejo aur dekho koi aur rule badhta hai. Ab aapke jawab ke paas evidence hai, opinion nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Policy change ke baad bina install kiye counters padhna. Counters installed policy ke hain, to uninstalled edit kuch nahi badalta. Doosri galti: kai din ke total "hits" dekh kar rule ko dead maan lena jabki policy aaj subah reinstall hui thi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Rule number position hai, identity nahi. Rule insert karne ke baad neeche ke numbers shift ho jaate hain. Change ticket mein sirf "rule 5" mat likho; naam ya tag bhi likho.</p></div>

<div class="scn"><h4>Kaunsa rule yeh andar aane de raha hai?</h4><p>Security reviewer ne poochha ki staff LAN se web server port 8080 par kyun reachable hai. Kisi ko aisa rule banana yaad nahi tha. Admin ne 10.1.1.10 se 172.16.20.20 tcp/8080 ke liye Policy match test chalaya aur woh rule 7 se match hua, purane project ka broad "staff to DMZ any" Allow. Rule 7 ke counters par sainkdon hits the. Team ne use narrow HTTPS rule se replace kiya aur evidence change ticket mein rakha.</p><p><b>Lesson:</b> counters aur match test "mujhe lagta hai" ko "rule 7, tag aur naam, itne hits" bana dete hain.</p></div>
<div class="iv"><p class="q">"Kaise pata karoge ki kisi connection ko kaunse firewall rule ne allow kiya?"</p><p>Bolo ki us source, destination aur service ke liye Policy match test chalate ho, aur hit counter ya log entry se confirm karte ho jo rule ka naam batati hai. Yeh bhi bolo ki test installed policy padhta hai aur reorder par rule numbers shift hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule number position dikhata hai; rule tag edits ke across rule ke saath rehta hai.</li>
<li>Hit counters dikhate hain kaunse rules use hote hain; ek se badhta counter match prove karta hai.</li>
<li>Policy match test installed rules walk karke match ka naam batata hai.</li>
<li>Dono installed policy padhte hain, isliye measure karne se pehle install karo.</li>
</ul></div>
`}};export{e as default};