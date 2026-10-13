var e={id:`app-id-policy`,h:{en:`App-ID and security policy in plain words`,hi:`App-ID aur security policy saral shabdon mein`},body:{en:`
<p><b>Analogy: a visitor form.</b> At a reception desk you fill a form: where you come from, where you are going, who you meet, why you came. The guard reads the form from top to bottom and the first line that fits decides what happens. A PAN-OS <b>security rule</b> is that form, and the <b>rulebase</b> is the list of forms checked in order.</p>

<h3>Anatomy of a security rule</h3>
<p>A rule has <b>match conditions</b> and an <b>action</b>. The main match fields:</p>
<table class="cmp"><tr><th>Field</th><th>Meaning</th><th>Example</th></tr>
<tr><td>from / to</td><td>source zone and destination zone</td><td>from trust to untrust</td></tr>
<tr><td>source / destination</td><td>IP addresses or address objects (or any)</td><td>any</td></tr>
<tr><td>user</td><td>User-ID user or group (optional)</td><td>any</td></tr>
<tr><td>application</td><td>App-ID application names</td><td>dns, ssl, web-browsing</td></tr>
<tr><td>service</td><td>ports; <code>application-default</code> means the application's usual ports</td><td>application-default</td></tr>
<tr><td>action</td><td>allow, deny, drop, reset (client, server, both)</td><td>allow</td></tr></table>
<p>Here is a real rule from the simulator, shown the way PAN-OS prints the running policy:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
"Allow-Out; index: 1" {
        from trust;
        source any;
        to untrust;
        destination any;
        user any;
        category any;
        <span class="hl">application/service [ ping dns web-browsing ssl ]/application-default;</span>
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>Read it aloud: "From trust to untrust, from any source to any destination, for these four applications on their default ports, allow." Four applications cover a basic browsing user: ping for tests, dns to resolve names, <code>web-browsing</code> for clear web traffic and <code>ssl</code> for encrypted sessions that the firewall cannot name more specifically without decryption.</p>

<h3>Rules are checked top to bottom, first match wins</h3>
<p>The firewall evaluates the rulebase from the top. The first rule that matches the session decides everything, and checking stops. Later rules are not looked at. If no rule matches, the predefined intrazone or interzone default applies (previous chapter). This is why <b>rule order</b> is a classic exam topic: a broad allow above a narrow deny makes the deny useless. You will practise this in pan-policy.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="First match wins">
<rect x="20" y="15" width="400" height="34" rx="6" fill="#bbf7d0"/><text x="30" y="37" class="svg-ink" font-size="13">1  Allow-Out    trust to untrust   ping dns web-browsing ssl</text>
<rect x="20" y="57" width="400" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="79" class="svg-ink" font-size="13">2  LAN-to-DMZ   trust to dmz       ping web-browsing</text>
<rect x="20" y="99" width="400" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="121" class="svg-ink" font-size="13">3  (more rules)</text>
<rect x="20" y="141" width="400" height="34" rx="6" fill="#fde68a"/><text x="30" y="163" class="svg-ink" font-size="13">intrazone-default allow / interzone-default deny</text>
<path d="M440 32 L520 32" stroke="#64748b" stroke-width="2" fill="none"/><text x="530" y="36" class="svg-accent" font-size="13">match: stop</text>
<path d="M440 158 L520 158" stroke="#64748b" stroke-width="2" fill="none"/><text x="530" y="162" class="svg-muted" font-size="13">no match</text>
</svg><p class="cap">Top to bottom; the first matching rule decides; the predefined defaults sit at the end.</p></div>

<h3>App-ID and "application-default"</h3>
<p>Each application in the App-ID database has default ports. For <code>web-browsing</code> it is TCP 80, for <code>ssl</code> it is TCP 443, for <code>dns</code> UDP and TCP 53. When the rule's service is <code>application-default</code>, the firewall allows the application <b>only on its default ports</b>. If someone runs web-browsing on TCP 8080, the session does not match that rule. This closes the old problem of "allow TCP 8080" being used for anything.</p>
<p>Other service choices exist: <code>any</code> (all ports, usually too wide), or a specific port or service object (for an application you really do run on a custom port). Prefer application-default, and when you must use a custom port, name it explicitly.</p>

<h3>Testing before you trust</h3>
<p>You can ask the firewall which rule a hypothetical session would hit, with no real traffic:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
"Allow-Out; index: 1" {
        from trust;
        to untrust;
        <span class="hl">application/service [ ping dns web-browsing ssl ]/application-default;</span>
        action allow;
}</pre>
<p>This test uses protocol and port, not an application. It is a quick sanity check that the right rule is selected.</p>

<div class="eg"><p><b>Worked example.</b> You want users in trust to browse the web and nothing else. Rule 1: from trust to untrust, applications <code>dns web-browsing ssl</code>, service <code>application-default</code>, action allow. A user's SSH session to a public server matches no rule, so the interzone-default denies it. You did not write a deny. The default did it, and the session never appears as allowed in the log.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using application <code>any</code> with service <code>any</code> "to get it working" and never tightening it. Forgetting that an application like <code>ssl</code> is a placeholder for encrypted traffic the firewall cannot decode, and that some websites need extra dependent applications to be allowed.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which service setting restricts an application to its standard ports?" Answer: <code>application-default</code>. "Which action silently discards and which sends a reset?" <code>drop</code> versus <code>reset-client</code>, <code>reset-server</code>, <code>reset-both</code>. Know that <code>deny</code> uses the application's default deny behaviour.</p></div>

<div class="scn"><h4>The admin exception that never matched</h4><p>An admin group needed SSH to a server, so an engineer added "Allow-Admin-SSH" at the bottom of the rulebase. It never matched. A broad rule above it ("trust to dmz, application any, deny") matched first, so the admin rule below it was shadowed. Moving the specific rule above the broad one fixed it. (This is the pan-policy lab "The admin exception never matches".)</p><p><b>Lesson:</b> specific rules go above general rules.</p></div>

<div class="iv"><p class="q">"What does application-default do in a Palo Alto security rule?"</p><p>It tells the firewall to permit the chosen applications only on their standard ports. Traffic of that application on a non-standard port does not match the rule. It is more secure than a hand-written port list because it ties port and application together, and you do not have to maintain the ports yourself.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule matches on zones, addresses, user, application and service, then applies an action.</li>
<li>The rulebase is read top to bottom; the first match wins.</li>
<li>application-default permits an application only on its standard ports.</li>
<li>No match means the predefined intrazone or interzone default applies.</li>
<li>test security-policy-match shows which rule a flow would hit.</li>
</ul></div>
`,hi:`
<p><b>Analogy: visitor form.</b> Reception desk par aap form bharte ho: kahan se aaye, kahan ja rahe, kisse milna hai, kyun aaye. Guard form ko upar se neeche padhta hai aur jo pehli line fit baithti hai wahi tay karti hai ki kya hoga. PAN-OS <b>security rule</b> wahi form hai, aur <b>rulebase</b> un forms ki list hai jo order mein check hoti hai.</p>

<h3>Security rule ki anatomy</h3>
<p>Rule mein <b>match conditions</b> aur ek <b>action</b> hota hai. Mukhya match fields:</p>
<table class="cmp"><tr><th>Field</th><th>Matlab</th><th>Example</th></tr>
<tr><td>from / to</td><td>source zone aur destination zone</td><td>from trust to untrust</td></tr>
<tr><td>source / destination</td><td>IP addresses ya address objects (ya any)</td><td>any</td></tr>
<tr><td>user</td><td>User-ID user ya group (optional)</td><td>any</td></tr>
<tr><td>application</td><td>App-ID application names</td><td>dns, ssl, web-browsing</td></tr>
<tr><td>service</td><td>ports; <code>application-default</code> ka matlab application ke usual ports</td><td>application-default</td></tr>
<tr><td>action</td><td>allow, deny, drop, reset (client, server, both)</td><td>allow</td></tr></table>
<p>Simulator ka ek asli rule, waise hi jaise PAN-OS running policy print karta hai:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
"Allow-Out; index: 1" {
        from trust;
        source any;
        to untrust;
        destination any;
        user any;
        category any;
        <span class="hl">application/service [ ping dns web-browsing ssl ]/application-default;</span>
        action allow;
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>Ise zor se padho: "Trust se untrust, kisi bhi source se kisi bhi destination tak, in chaar applications ke liye unke default ports par, allow." Chaar applications ek basic browsing user ko cover karti hain: test ke liye ping, naam resolve karne ke liye dns, clear web traffic ke liye <code>web-browsing</code> aur encrypted sessions ke liye <code>ssl</code> jinhe firewall decryption ke bina aur specific naam nahi de sakta.</p>

<h3>Rules upar se neeche check hote hain, pehla match jeetta hai</h3>
<p>Firewall rulebase ko upar se evaluate karta hai. Jo pehla rule session se match karta hai wahi sab tay karta hai aur checking ruk jaati hai. Baad ke rules dekhe hi nahi jaate. Koi rule match na ho to predefined intrazone ya interzone default lagu hota hai (pichla chapter). Isiliye <b>rule order</b> exam ka classic topic hai: narrow deny ke upar broad allow deny ko bekaar bana deta hai. Yeh aap pan-policy mein practise karoge.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Pehla match jeetta hai">
<rect x="20" y="15" width="400" height="34" rx="6" fill="#bbf7d0"/><text x="30" y="37" class="svg-ink" font-size="13">1  Allow-Out    trust to untrust   ping dns web-browsing ssl</text>
<rect x="20" y="57" width="400" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="79" class="svg-ink" font-size="13">2  LAN-to-DMZ   trust to dmz       ping web-browsing</text>
<rect x="20" y="99" width="400" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="121" class="svg-ink" font-size="13">3  (aur rules)</text>
<rect x="20" y="141" width="400" height="34" rx="6" fill="#fde68a"/><text x="30" y="163" class="svg-ink" font-size="13">intrazone-default allow / interzone-default deny</text>
<path d="M440 32 L520 32" stroke="#64748b" stroke-width="2" fill="none"/><text x="530" y="36" class="svg-accent" font-size="13">match: ruk jao</text>
<path d="M440 158 L520 158" stroke="#64748b" stroke-width="2" fill="none"/><text x="530" y="162" class="svg-muted" font-size="13">koi match nahi</text>
</svg><p class="cap">Upar se neeche; pehla matching rule decide karta hai; predefined defaults aakhir mein hain.</p></div>

<h3>App-ID aur "application-default"</h3>
<p>App-ID database ki har application ke default ports hote hain. <code>web-browsing</code> ke liye TCP 80, <code>ssl</code> ke liye TCP 443, <code>dns</code> ke liye UDP aur TCP 53. Jab rule ka service <code>application-default</code> ho, firewall application ko <b>sirf uske default ports par</b> allow karta hai. Koi web-browsing TCP 8080 par chalaye to session us rule se match nahi karta. Isse "allow TCP 8080" ka kisi bhi cheez ke liye use hone wala purana problem band hota hai.</p>
<p>Service ke doosre options bhi hain: <code>any</code> (saare ports, aksar bahut wide), ya specific port ya service object (jab application sach mein custom port par chalti ho). Application-default prefer karo, aur custom port zaroori ho to use explicitly naam do.</p>

<h3>Bharosa karne se pehle test karo</h3>
<p>Aap firewall se pooch sakte ho ki hypothetical session kaunsa rule hit karega, real traffic ke bina:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
"Allow-Out; index: 1" {
        from trust;
        to untrust;
        <span class="hl">application/service [ ping dns web-browsing ssl ]/application-default;</span>
        action allow;
}</pre>
<p>Yeh test protocol aur port use karta hai, application nahi. Yeh ek quick sanity check hai ki sahi rule select ho raha hai.</p>

<div class="eg"><p><b>Worked example.</b> Aap chahte ho ki trust ke users web browse karein aur kuch nahi. Rule 1: from trust to untrust, applications <code>dns web-browsing ssl</code>, service <code>application-default</code>, action allow. User ka public server par SSH session kisi rule se match nahi karta, isliye interzone-default use deny kar deta hai. Aapne deny likha nahi. Default ne kiya, aur session log mein allowed ke roop mein kabhi nahi aata.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "Chalane ke liye" application <code>any</code> aur service <code>any</code> use karna aur use kabhi tight na karna. Yeh bhool jaana ki <code>ssl</code> jaisi application woh encrypted traffic ka placeholder hai jise firewall decode nahi kar sakta, aur kuch websites ko extra dependent applications allow karni padti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsi service setting application ko uske standard ports tak restrict karti hai?" Jawab: <code>application-default</code>. "Kaunsa action chupchap discard karta hai aur kaunsa reset bhejta hai?" <code>drop</code> versus <code>reset-client</code>, <code>reset-server</code>, <code>reset-both</code>. Yaad rakho ki <code>deny</code> application ka default deny behaviour use karta hai.</p></div>

<div class="scn"><h4>Admin exception jo kabhi match nahi hua</h4><p>Ek admin group ko server par SSH chahiye tha, to engineer ne rulebase ke neeche "Allow-Admin-SSH" jodi. Woh kabhi match nahi hui. Uske upar ek broad rule ("trust to dmz, application any, deny") pehle match ho jaata tha, isliye neeche wali admin rule shadow ho gayi. Specific rule ko broad rule ke upar le jaane se fix hua. (Yeh pan-policy lab "The admin exception never matches" hai.)</p><p><b>Lesson:</b> specific rules general rules ke upar jaate hain.</p></div>

<div class="iv"><p class="q">"Palo Alto security rule mein application-default kya karta hai?"</p><p>Yeh firewall ko batata hai ki chuni hui applications ko sirf unke standard ports par permit karo. Us application ka non-standard port wala traffic rule se match nahi karta. Yeh hand-written port list se zyada secure hai kyunki port aur application ko saath bandhta hai, aur aapko ports khud maintain nahi karne padte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule zones, addresses, user, application aur service par match karta hai, phir action lagata hai.</li>
<li>Rulebase upar se neeche padha jaata hai; pehla match jeetta hai.</li>
<li>application-default application ko sirf uske standard ports par permit karta hai.</li>
<li>Koi match nahi to predefined intrazone ya interzone default lagu hota hai.</li>
<li>test security-policy-match dikhata hai ki flow kaunsa rule hit karega.</li>
</ul></div>
`}};export{e as default};