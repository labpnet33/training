var e={id:`eval-order`,h:{en:`The evaluation order on a firewall, from Shared pre to default rules`,hi:`Firewall par evaluation order, Shared pre se default rules tak`},body:{en:`
<p><b>Analogy.</b> Picture an airport. Before you reach the gate, you pass airline check-in, then national security, then the gate agent. The order matters: if a security officer stops you, the gate agent never sees you. A firewall reads its rulebase from the top, and the <b>first rule that matches the traffic decides</b>. The rule order is therefore the whole story of policy.</p>

<h3>One list, assembled from many places</h3>
<p>On the firewall, the policy you see with <code>show running security-policy</code> is a single numbered list. Panorama builds that list from pieces. The order the course lab teaches is:</p>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Evaluation order">
<rect x="150" y="6" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="26" text-anchor="middle" class="svg-ink" font-size="13">1  Shared pre-rules</text>
<rect x="150" y="42" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">2  Parent device group pre-rules</text>
<rect x="150" y="78" width="340" height="30" rx="6" fill="#bae6fd"/><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="13">3  Child device group pre-rules</text>
<rect x="150" y="114" width="340" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="13">4  Local rules (typed on the firewall)</text>
<rect x="150" y="150" width="340" height="30" rx="6" fill="#bae6fd"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">5  Child device group post-rules</text>
<rect x="150" y="186" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="13">6  Parent device group post-rules</text>
<rect x="150" y="222" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="242" text-anchor="middle" class="svg-ink" font-size="13">7  Shared post-rules</text>
<rect x="150" y="258" width="340" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="278" text-anchor="middle" class="svg-ink" font-size="13">8  Default rules (intrazone allow, interzone deny)</text>
<text x="320" y="316" text-anchor="middle" class="svg-muted" font-size="12">Top to bottom, first match wins. Pre-rules run outside-in, post-rules inside-out.</text>
</svg><p class="cap">The sandwich: Panorama's pre-rules on top, the firewall's own rules in the middle, Panorama's post-rules underneath.</p></div>
<p>Look at the shape. Pre-rules go from the widest scope (Shared) to the narrowest (child). Post-rules go the opposite way, from the narrowest to the widest. The local rules sit in the middle. Last come the predefined default rules: traffic inside one zone is allowed and traffic between zones is denied, unless a rule above caught it first.</p>

<h3>Why the order is built this way</h3>
<ul>
<li><b>Shared pre first</b> means a company-wide block cannot be overridden by any group below it. The top of the list belongs to headquarters.</li>
<li><b>Child pre after parent pre</b> lets a region add specific rules, but never ahead of the company's.</li>
<li><b>Local rules in the middle</b> let the site engineer handle local needs without disturbing the central rules on either side.</li>
<li><b>Post-rules at the bottom</b> are a safety net that applies only to traffic nobody above wanted to decide, typically a final deny with logging.</li>
</ul>

<h3>Seeing it on the firewall</h3>
<p>Here is how the assembled list looks in the lab (names are from this chapter, not from the lab you will solve). The index shows the position; the rule at index 1 was a Shared pre-rule:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
"Block-Torrent; index: 1" {
        from any;
        to any;
        application/service bit-torrent/application-default;
        action deny;
}
"Allow-Web-Out; index: 2" {
        from trust;
        to untrust;
        application/service [ dns web-browsing ssl ]/application-default;
        action allow;
}
"Deny-All-Log; index: 3" {
        from any;
        to any;
        application/service any/any;
        action deny;
}</pre>
<p>The output omits unchanged fields here for space; the lab prints all of them. You cannot tell from this list <i>where each rule came from</i>; that is why you also use <code>show config pushed-shared-policy</code> (the pushed part only) in a later chapter.</p>

<div class="eg"><p><b>Worked example.</b> A user in Pune opens a web page (web-browsing, trust to untrust). The firewall checks index 1: the application is not bit-torrent, so no match. Index 2: zones, application and action fit, so it is allowed and evaluation stops. Index 3 is never consulted for this session. Now a user tries bit-torrent: index 1 matches first and denies it, even though index 2 might also have matched by zone.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting a broad allow in a Shared pre-rule and wondering why every later deny is ignored; thinking a post-rule can override a local rule (it cannot; it is evaluated later); forgetting the predefined default rules exist, so "no rule matched" is a deny between zones, not an error.</p></div>
<div class="exam"><p><b>Exam trap.</b> Learn the sequence as a sandwich: <b>Shared pre, parent pre, child pre, local, child post, parent post, Shared post, defaults</b>. A question about which rule wins when a Shared post-rule and a local rule conflict has one answer: the local rule, because it is higher in the list.</p></div>

<div class="scn"><h4>The allow that came first</h4><p>A new engineer needed to open a port for one site and added a broad allow to the parent group pre-rules. Later the security team added a deny for a risky application at a lower level, and a regional manager complained that the deny "did nothing". Reading the final numbered list on the firewall showed the broad allow at a lower index than the deny, so it matched first every time. Moving the deny to a higher level fixed it within minutes.</p><p><b>Lesson:</b> read the final numbered list, not the individual group configs.</p></div>

<div class="iv"><p class="q">"Describe the order in which a firewall evaluates Panorama-pushed and local rules."</p><p>Shared pre-rules, then the parent group's pre-rules, then the child's, then the firewall's local rules, then post-rules in the reverse direction (child, parent, Shared), and finally the predefined default rules. First match wins, so higher scope pre-rules cannot be overridden by lower ones.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The firewall evaluates one numbered list, top to bottom; the first matching rule decides.</li>
<li>Order: Shared pre, parent pre, child pre, local, child post, parent post, Shared post, defaults.</li>
<li>Pre-rules go widest to narrowest; post-rules go narrowest to widest.</li>
<li>Default rules allow intrazone and deny interzone traffic when nothing else matches.</li>
<li>Always read the final assembled list on the firewall when troubleshooting.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Airport socho. Gate tak pahunchne se pehle aap airline check-in, phir national security, phir gate agent se guzarte ho. Order matter karta hai: agar security officer aapko rok de, to gate agent aapko kabhi dekhta hi nahi. Firewall apni rulebase ko upar se padhta hai, aur <b>pehli rule jo traffic se match kare wahi decide karti hai</b>. Isliye rule order hi policy ki poori kahani hai.</p>

<h3>Ek list, kai jagahon se bani</h3>
<p>Firewall par <code>show running security-policy</code> se jo policy dikhti hai wo ek numbered list hai. Panorama us list ko tukdon se banata hai. Course lab jo order sikhata hai:</p>
<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Evaluation order">
<rect x="150" y="6" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="26" text-anchor="middle" class="svg-ink" font-size="13">1  Shared pre-rules</text>
<rect x="150" y="42" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="13">2  Parent device group pre-rules</text>
<rect x="150" y="78" width="340" height="30" rx="6" fill="#bae6fd"/><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="13">3  Child device group pre-rules</text>
<rect x="150" y="114" width="340" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="13">4  Local rules (firewall par typed)</text>
<rect x="150" y="150" width="340" height="30" rx="6" fill="#bae6fd"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">5  Child device group post-rules</text>
<rect x="150" y="186" width="340" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="13">6  Parent device group post-rules</text>
<rect x="150" y="222" width="340" height="30" rx="6" fill="#fde68a"/><text x="320" y="242" text-anchor="middle" class="svg-ink" font-size="13">7  Shared post-rules</text>
<rect x="150" y="258" width="340" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="278" text-anchor="middle" class="svg-ink" font-size="13">8  Default rules (intrazone allow, interzone deny)</text>
<text x="320" y="316" text-anchor="middle" class="svg-muted" font-size="12">Upar se neeche, pehli match jeetti hai. Pre-rules bahar se andar, post-rules andar se bahar.</text>
</svg><p class="cap">Sandwich: upar Panorama ki pre-rules, beech mein firewall ki apni rules, neeche Panorama ki post-rules.</p></div>
<p>Shape dekho. Pre-rules sabse wide scope (Shared) se sabse narrow (child) tak jaati hain. Post-rules ulti disha mein, narrow se wide tak. Local rules beech mein hain. Aakhir mein predefined default rules: ek zone ke andar traffic allowed aur zones ke beech denied, jab tak upar ki koi rule use pehle na pakad le.</p>

<h3>Order aise kyun bana hai</h3>
<ul>
<li><b>Shared pre sabse pehle</b> ka matlab company-wide block ko neeche ka koi group override nahi kar sakta. List ka top headquarters ka hai.</li>
<li><b>Child pre, parent pre ke baad</b> region ko specific rules jodne deta hai, par company ki rules se aage kabhi nahi.</li>
<li><b>Beech mein local rules</b> site engineer ko local zarooraton ke liye dono taraf ki central rules ko disturb kiye bina kaam karne deti hain.</li>
<li><b>Neeche post-rules</b> safety net hain jo sirf us traffic par lagti hain jis par upar kisi ne decide nahi kiya, aam taur par logging ke saath aakhri deny.</li>
</ul>

<h3>Firewall par dekhna</h3>
<p>Assembled list lab mein aisi dikhti hai (naam is chapter ke hain, us lab ke nahi jo aap solve karoge). Index position batata hai; index 1 wali rule Shared pre-rule thi:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show running security-policy
"Block-Torrent; index: 1" {
        from any;
        to any;
        application/service bit-torrent/application-default;
        action deny;
}
"Allow-Web-Out; index: 2" {
        from trust;
        to untrust;
        application/service [ dns web-browsing ssl ]/application-default;
        action allow;
}
"Deny-All-Log; index: 3" {
        from any;
        to any;
        application/service any/any;
        action deny;
}</pre>
<p>Jagah bachane ke liye yahan unchanged fields hata diye hain; lab sab print karta hai. Is list se aap nahi bata sakte ki <i>har rule kahan se aayi</i>; isiliye aage ke chapter mein <code>show config pushed-shared-policy</code> (sirf pushed hissa) bhi use karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Pune ka user web page kholta hai (web-browsing, trust se untrust). Firewall index 1 dekhta hai: application bit-torrent nahi hai, match nahi. Index 2: zones, application aur action fit hote hain, to allow ho jata hai aur evaluation ruk jata hai. Is session ke liye index 3 kabhi consult nahi hoti. Ab user bit-torrent try kare: index 1 pehle match karti hai aur deny karti hai, chahe index 2 bhi zone se match kar sakti thi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Shared pre-rule mein broad allow daalna aur sochna ki baad ki har deny ignore kyun ho rahi hai; sochna ki post-rule local rule ko override kar sakti hai (nahi kar sakti; wo baad mein evaluate hoti hai); ye bhoolna ki predefined default rules hain, to "no rule matched" zones ke beech deny hai, error nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sequence ko sandwich ki tarah yaad karo: <b>Shared pre, parent pre, child pre, local, child post, parent post, Shared post, defaults</b>. Shared post-rule aur local rule conflict karein to kaun jeetega, iska ek hi jawab hai: local rule, kyunki wo list mein upar hai.</p></div>

<div class="scn"><h4>Wo allow jo pehle aa gayi</h4><p>Ek naye engineer ko ek site ke liye port kholna tha aur usne parent group ki pre-rules mein broad allow jod di. Baad mein security team ne neeche ke level par risky application ke liye deny jodi, aur ek regional manager ne shikayat ki ki deny "kuch nahi karti". Firewall par final numbered list padhne se dikha ki broad allow deny se kam index par hai, isliye wahi har baar pehle match karti thi. Deny ko upar ke level par le jaane se kuch minutes mein fix ho gaya.</p><p><b>Lesson:</b> individual group configs nahi, final numbered list padho.</p></div>

<div class="iv"><p class="q">"Firewall Panorama-pushed aur local rules ko kis order mein evaluate karta hai, batao."</p><p>Shared pre-rules, phir parent group ki pre-rules, phir child ki, phir firewall ki local rules, phir ulti disha mein post-rules (child, parent, Shared), aur aakhir mein predefined default rules. Pehli match jeetti hai, isliye higher scope ki pre-rules ko neeche wale override nahi kar sakte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Firewall ek numbered list upar se neeche evaluate karta hai; pehli matching rule decide karti hai.</li>
<li>Order: Shared pre, parent pre, child pre, local, child post, parent post, Shared post, defaults.</li>
<li>Pre-rules wide se narrow; post-rules narrow se wide.</li>
<li>Kuch aur match na kare to default rules intrazone allow aur interzone deny karti hain.</li>
<li>Troubleshoot karte waqt hamesha firewall par final assembled list padho.</li>
</ul></div>
`}};export{e as default};