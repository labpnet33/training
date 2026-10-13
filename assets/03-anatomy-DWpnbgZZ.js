var e={id:`anatomy`,h:{en:`Anatomy of a policy-statement: terms, from, then`,hi:`Policy-statement ki banawat: terms, from, then`},body:{en:`
<p>A <b>policy-statement</b> is the unit you write. Inside it you write <b>terms</b>. Each term is a small rule with two parts: a condition and an action. This chapter teaches you to read and write one without guessing.</p>

<h3>Analogy: a checklist at the security gate</h3>
<p>A guard has a checklist. Item 1: "If the visitor carries a delivery slip, send them to the loading dock." Item 2: "If the visitor has a staff badge, let them in." Item 3: "Everyone else, turn away." The guard reads the items from top to bottom and stops at the first item that gives a final answer. A policy-statement is that checklist, and each term is one item.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Terms evaluated top to bottom">
<rect x="20" y="20" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Route arrives</text>
<line x1="170" y1="40" x2="220" y2="40" stroke="#64748b" stroke-width="2"/><polygon points="220,40 210,35 210,45" fill="#64748b"/>
<rect x="220" y="15" width="200" height="50" rx="6" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Term 1: from matches?</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">yes: run then</text>
<rect x="470" y="15" width="150" height="50" rx="6" fill="#bbf7d0"/><text x="545" y="36" text-anchor="middle" class="svg-ink" font-size="13">accept / reject</text><text x="545" y="54" text-anchor="middle" class="svg-muted" font-size="12">evaluation stops</text>
<line x1="420" y1="40" x2="470" y2="40" stroke="#64748b" stroke-width="2"/><polygon points="470,40 460,35 460,45" fill="#64748b"/>
<line x1="320" y1="65" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="320,100 315,90 325,90" fill="#64748b"/><text x="335" y="88" class="svg-muted" font-size="12">no match</text>
<rect x="220" y="100" width="200" height="50" rx="6" fill="#ddd6fe"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">Term 2: from matches?</text><text x="320" y="139" text-anchor="middle" class="svg-muted" font-size="12">yes: run then</text>
<line x1="320" y1="150" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><polygon points="320,185 315,175 325,175" fill="#64748b"/><text x="335" y="173" class="svg-muted" font-size="12">no match</text>
<rect x="220" y="185" width="200" height="50" rx="6" fill="#fde68a"/><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="13">Next policy or default</text><text x="320" y="224" text-anchor="middle" class="svg-muted" font-size="12">protocol decides</text>
</svg><p class="cap">The first term that makes a final decision ends the evaluation of that route.</p></div>

<h3>The three parts of a term</h3>
<dl class="terms">
<dt>from</dt><dd>Match conditions. All listed conditions must be true (logical AND). Optional. A term without <code>from</code> matches every route.</dd>
<dt>to</dt><dd>Optional match on where the route is going (for example a specific OSPF area or BGP neighbour). Less common at JNCIA level.</dd>
<dt>then</dt><dd>Actions to take when the term matches.</dd>
</dl>
<pre class="code">policy-options {
    policy-statement BRANCH-OUT {
        term STATICS {
            from {
                protocol static;
                route-filter 172.31.0.0/16 orlonger;
            }
            then {
                metric 30;
                tag 410;
                accept;               <i>terminating action</i>
            }
        }
        term NOTHING-ELSE {
            then reject;
        }
    }
}</pre>
<p>In set-style the same policy is one line per statement:</p>
<pre class="code">set policy-options policy-statement BRANCH-OUT term STATICS from protocol static
set policy-options policy-statement BRANCH-OUT term STATICS from route-filter 172.31.0.0/16 orlonger
set policy-options policy-statement BRANCH-OUT term STATICS then metric 30
set policy-options policy-statement BRANCH-OUT term STATICS then tag 410
set policy-options policy-statement BRANCH-OUT term STATICS then accept
set policy-options policy-statement BRANCH-OUT term NOTHING-ELSE then reject</pre>

<h3>Terminating and non-terminating actions</h3>
<table class="cmp"><tr><th>Kind</th><th>Actions</th><th>Effect</th></tr>
<tr><td>Terminating</td><td><code>accept</code>, <code>reject</code>, <code>next policy</code></td><td>Ends evaluation of this policy for the route. <code>next policy</code> hands the route to the next policy in the chain.</td></tr>
<tr><td>Modifying</td><td><code>metric</code>, <code>tag</code>, <code>preference</code>, <code>external type 1</code>, <code>community add</code></td><td>Changes a route attribute, then evaluation carries on</td></tr>
<tr><td>Flow control</td><td><code>next term</code></td><td>Skip to the following term in the same policy</td></tr></table>
<p>A term that matches but contains only modifying actions has no decision. The route drops down to the next term, then the next policy, then the protocol default. This is how a policy can tag routes without deciding whether they are advertised. The chain chapter uses that trick.</p>

<h3>Order of terms is order of decisions</h3>
<p>Because the first deciding term wins, always put <b>specific</b> terms above <b>general</b> ones. A final catch-all such as <code>term LAST then reject</code> is good practice for export policies, so you do not rely on the protocol default by accident.</p>

<div class="warn"><p><b>Common mistake.</b> Writing <code>then metric 30;</code> and expecting the route to be accepted. Without an <code>accept</code> the route is not accepted by this term. For OSPF export the protocol default (reject) then applies and nothing is advertised.</p></div>
<div class="exam"><p><b>Exam trap.</b> Several lines inside one <code>from</code> are ANDed. To match "static OR direct" you write two separate terms, or list both protocols in one statement as <code>protocol [ static direct ]</code>. Multiple values of the <b>same</b> match type are ORed.</p></div>

<div class="eg"><p><b>Worked example.</b> Policy PARTNER-OUT has one term, PARTNERS: <code>from protocol static</code>, <code>from route-filter 172.20.0.0/16 orlonger</code>, <code>then accept</code>. A route 172.20.8.0/22 from protocol static matches both conditions, so it is accepted. A static route 192.168.99.0/24 fails the route-filter, so the term does not match. No later term exists, so the protocol default (OSPF export: reject) decides, and 192.168.99.0/24 is not advertised.</p></div>

<div class="scn"><h4>The accidental accept-everything</h4><p>An engineer wrote a policy to add tag 100 to all static routes. A colleague approved it. After commit, R2 suddenly saw eight routes more than expected, including a lab subnet. Investigation showed that the first term had <code>then { tag 100; accept; }</code> with no <code>from</code>. The missing <code>from</code> made it match every route in the table, and accept let all of them out. The fix was to add <code>from protocol static</code> and a route-filter, and to finish with an explicit reject term.</p><p><b>Lesson:</b> a term with no from clause is a wildcard. Read each term as "if this, then that" and be sure the "if" is not empty.</p></div>

<div class="iv"><p class="q">"How does Junos evaluate a policy-statement with several terms?"</p><p>Strong answer: top to bottom. For each term, if every from condition is true, the then actions run. A terminating action (accept, reject, next policy) ends evaluation. Modifying actions change the route and evaluation continues. If no term decides, the next policy in the chain runs and finally the protocol default policy. Mention that a term without from matches everything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A policy-statement is a list of terms evaluated top to bottom.</li>
<li>A term has optional from and to conditions plus then actions.</li>
<li>accept, reject and next policy terminate; metric, tag and preference only modify.</li>
<li>A term without from matches every route; put specific terms first.</li>
<li>End export policies with an explicit reject so the result does not depend on a default.</li>
</ul></div>
`,hi:`
<p><b>Policy-statement</b> woh unit hai jo aap likhte ho. Uske andar aap <b>terms</b> likhte ho. Har term ek chhota rule hai jiske do hisse hain: condition aur action. Yeh chapter aapko bina andaaza lagaye ek term padhna aur likhna sikhata hai.</p>

<h3>Analogy: security gate ki checklist</h3>
<p>Guard ke paas checklist hoti hai. Item 1: "Agar visitor ke paas delivery slip hai to loading dock bhejo." Item 2: "Agar visitor ke paas staff badge hai to andar jaane do." Item 3: "Baaki sabko wapas karo." Guard items upar se neeche padhta hai aur pehle us item par ruk jaata hai jo final jawab de. Policy-statement wahi checklist hai, aur har term ek item.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Terms evaluated top to bottom">
<rect x="20" y="20" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Route aaya</text>
<line x1="170" y1="40" x2="220" y2="40" stroke="#64748b" stroke-width="2"/><polygon points="220,40 210,35 210,45" fill="#64748b"/>
<rect x="220" y="15" width="200" height="50" rx="6" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Term 1: from match?</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="12">haan: then chalao</text>
<rect x="470" y="15" width="150" height="50" rx="6" fill="#bbf7d0"/><text x="545" y="36" text-anchor="middle" class="svg-ink" font-size="13">accept / reject</text><text x="545" y="54" text-anchor="middle" class="svg-muted" font-size="12">evaluation ruk gaya</text>
<line x1="420" y1="40" x2="470" y2="40" stroke="#64748b" stroke-width="2"/><polygon points="470,40 460,35 460,45" fill="#64748b"/>
<line x1="320" y1="65" x2="320" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="320,100 315,90 325,90" fill="#64748b"/><text x="335" y="88" class="svg-muted" font-size="12">match nahi</text>
<rect x="220" y="100" width="200" height="50" rx="6" fill="#ddd6fe"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">Term 2: from match?</text><text x="320" y="139" text-anchor="middle" class="svg-muted" font-size="12">haan: then chalao</text>
<line x1="320" y1="150" x2="320" y2="185" stroke="#64748b" stroke-width="2"/><polygon points="320,185 315,175 325,175" fill="#64748b"/><text x="335" y="173" class="svg-muted" font-size="12">match nahi</text>
<rect x="220" y="185" width="200" height="50" rx="6" fill="#fde68a"/><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="13">Next policy ya default</text><text x="320" y="224" text-anchor="middle" class="svg-muted" font-size="12">protocol decide karta hai</text>
</svg><p class="cap">Jo pehla term final decision le, woh us route ka evaluation khatam kar deta hai.</p></div>

<h3>Term ke teen hisse</h3>
<dl class="terms">
<dt>from</dt><dd>Match conditions. Likhi hui sab conditions true honi chahiye (logical AND). Optional. Bina <code>from</code> wala term har route ko match karta hai.</dd>
<dt>to</dt><dd>Optional match, route kahan ja raha hai (jaise koi OSPF area ya BGP neighbour). JNCIA level par kam use hota hai.</dd>
<dt>then</dt><dd>Term match hone par kaunse actions lene hain.</dd>
</dl>
<pre class="code">policy-options {
    policy-statement BRANCH-OUT {
        term STATICS {
            from {
                protocol static;
                route-filter 172.31.0.0/16 orlonger;
            }
            then {
                metric 30;
                tag 410;
                accept;               <i>terminating action</i>
            }
        }
        term NOTHING-ELSE {
            then reject;
        }
    }
}</pre>
<p>Set-style mein wahi policy ek statement per line hoti hai:</p>
<pre class="code">set policy-options policy-statement BRANCH-OUT term STATICS from protocol static
set policy-options policy-statement BRANCH-OUT term STATICS from route-filter 172.31.0.0/16 orlonger
set policy-options policy-statement BRANCH-OUT term STATICS then metric 30
set policy-options policy-statement BRANCH-OUT term STATICS then tag 410
set policy-options policy-statement BRANCH-OUT term STATICS then accept
set policy-options policy-statement BRANCH-OUT term NOTHING-ELSE then reject</pre>

<h3>Terminating aur non-terminating actions</h3>
<table class="cmp"><tr><th>Kind</th><th>Actions</th><th>Asar</th></tr>
<tr><td>Terminating</td><td><code>accept</code>, <code>reject</code>, <code>next policy</code></td><td>Is route ke liye is policy ka evaluation khatam. <code>next policy</code> route ko chain ki agli policy ko de deta hai.</td></tr>
<tr><td>Modifying</td><td><code>metric</code>, <code>tag</code>, <code>preference</code>, <code>external type 1</code>, <code>community add</code></td><td>Route ka attribute badalta hai, phir evaluation chalta rehta hai</td></tr>
<tr><td>Flow control</td><td><code>next term</code></td><td>Usi policy ke agle term par jao</td></tr></table>
<p>Jo term match kare par sirf modifying actions rakhe, usne koi decision nahi liya. Route agle term par, phir agli policy par, phir protocol default par gir jaata hai. Isi tarah ek policy routes ko tag kar sakti hai bina yeh decide kiye ki woh advertise honge ya nahi. Chain wala chapter yahi trick use karta hai.</p>

<h3>Terms ka order matlab decisions ka order</h3>
<p>Kyunki pehla deciding term jeet-ta hai, <b>specific</b> terms hamesha <b>general</b> terms ke upar rakho. Export policies ke end mein <code>term LAST then reject</code> jaisa catch-all achhi practice hai, taaki aap galti se default par depend na karo.</p>

<div class="warn"><p><b>Common mistake.</b> <code>then metric 30;</code> likhkar yeh umeed karna ki route accept ho jaayega. <code>accept</code> ke bina yeh term route accept nahi karta. OSPF export mein phir protocol default (reject) lagta hai aur kuch advertise nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek <code>from</code> ke andar kai lines AND hoti hain. "static YA direct" match karne ke liye do alag terms likho, ya ek statement mein <code>protocol [ static direct ]</code>. <b>Same</b> match type ki kai values OR hoti hain.</p></div>

<div class="eg"><p><b>Worked example.</b> Policy PARTNER-OUT mein ek term hai, PARTNERS: <code>from protocol static</code>, <code>from route-filter 172.20.0.0/16 orlonger</code>, <code>then accept</code>. Protocol static ka route 172.20.8.0/22 dono conditions match karta hai, isliye accept hota hai. Static route 192.168.99.0/24 route-filter fail karta hai, isliye term match nahi karta. Koi aur term nahi hai, to protocol default (OSPF export: reject) decide karta hai, aur 192.168.99.0/24 advertise nahi hota.</p></div>

<div class="scn"><h4>Galti se sab accept</h4><p>Ek engineer ne policy likhi jo saare static routes par tag 100 lagaye. Colleague ne approve kar di. Commit ke baad R2 ko achanak aath routes zyada dikhne lage, ek lab subnet bhi. Jaanch mein pata chala ki pehle term mein <code>then { tag 100; accept; }</code> tha aur <code>from</code> nahi tha. Missing <code>from</code> ne use table ke har route par match kara diya, aur accept ne sab ko bahar jaane diya. Fix: <code>from protocol static</code> aur route-filter jodna, aur end mein explicit reject term.</p><p><b>Lesson:</b> from clause ke bina term wildcard hai. Har term ko "agar yeh, to woh" padho aur dekho ki "agar" khaali to nahi.</p></div>

<div class="iv"><p class="q">"Junos kai terms wale policy-statement ko kaise evaluate karta hai?"</p><p>Strong answer: upar se neeche. Har term mein agar saari from conditions true hon to then actions chalte hain. Terminating action (accept, reject, next policy) evaluation khatam karta hai. Modifying actions route badalte hain aur evaluation chalta rehta hai. Agar koi term decide na kare to chain ki agli policy chalti hai aur aakhir mein protocol ki default policy. Yeh bhi bolo ki from ke bina term sab match karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy-statement terms ki list hai jo upar se neeche evaluate hoti hai.</li>
<li>Term mein optional from aur to conditions aur then actions hote hain.</li>
<li>accept, reject aur next policy terminate karte hain; metric, tag aur preference sirf modify karte hain.</li>
<li>from ke bina term har route match karta hai; specific terms pehle rakho.</li>
<li>Export policies ko explicit reject par khatam karo taaki result default par depend na kare.</li>
</ul></div>
`}};export{e as default};