var e={id:`route-filters`,h:{en:`Route-filter match types and the longest-match rule`,hi:`Route-filter match types aur longest-match rule`},body:{en:`
<p>The <code>route-filter</code> is the most powerful match condition, and the one candidates get wrong most often. It has two parts: a prefix and a <b>match type</b>. The match type says how much of the address space under that prefix is covered.</p>

<h3>Analogy: a street and its houses</h3>
<p>Think of 10.8.0.0/16 as a whole street. You can mean "only the street itself" (exact), "only the houses on it" (longer), "the street and all its houses" (orlonger), or "houses up to a certain size" (upto). The match type is how you say which one you mean.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Route-filter match types as prefix lengths">
<text x="20" y="22" class="svg-muted" font-size="12">prefix length  /16</text><text x="190" y="22" class="svg-muted" font-size="12">/20</text><text x="330" y="22" class="svg-muted" font-size="12">/24</text><text x="470" y="22" class="svg-muted" font-size="12">/32</text>
<rect x="20" y="35" width="600" height="26" rx="4" fill="#e2e8f0"/><text x="30" y="53" class="svg-ink" font-size="12">route-filter 10.8.0.0/16 ...</text>
<rect x="20" y="70" width="20" height="26" rx="4" fill="#bbf7d0"/><text x="50" y="88" class="svg-ink" font-size="12">exact: only /16</text>
<rect x="40" y="105" width="580" height="26" rx="4" fill="#bae6fd"/><text x="50" y="123" class="svg-ink" font-size="12">longer: /17 to /32, not the /16 itself</text>
<rect x="20" y="140" width="600" height="26" rx="4" fill="#ddd6fe"/><text x="30" y="158" class="svg-ink" font-size="12">orlonger: /16 to /32</text>
<rect x="20" y="175" width="310" height="26" rx="4" fill="#fde68a"/><text x="30" y="193" class="svg-ink" font-size="12">upto /24: /16 to /24</text>
<rect x="190" y="210" width="140" height="26" rx="4" fill="#fed7aa"/><text x="200" y="228" class="svg-ink" font-size="12">prefix-length-range /20-/24</text>
</svg><p class="cap">Each bar shows which prefix lengths inside 10.8.0.0/16 the match type accepts.</p></div>

<h3>The match types</h3>
<table class="cmp"><tr><th>route-filter 10.8.0.0/16 ...</th><th>Matches</th><th>Example that matches</th></tr>
<tr><td><code>exact</code></td><td>only 10.8.0.0/16 itself</td><td>10.8.0.0/16</td></tr>
<tr><td><code>longer</code></td><td>more specific prefixes only (/17 to /32)</td><td>10.8.4.0/24</td></tr>
<tr><td><code>orlonger</code></td><td>itself and everything more specific</td><td>10.8.0.0/16 and 10.8.4.0/24</td></tr>
<tr><td><code>upto /24</code></td><td>itself down to length /24</td><td>10.8.4.0/24 but not 10.8.4.0/25</td></tr>
<tr><td><code>prefix-length-range /20-/24</code></td><td>prefixes inside, with length between 20 and 24</td><td>10.8.16.0/20</td></tr>
<tr><td><code>through 10.8.4.0/24</code></td><td>the chain of prefixes from the /16 down to that /24</td><td>10.8.4.0/22</td></tr></table>
<p>Write them like this:</p>
<pre class="code">set policy-options policy-statement DC-OUT term DC from route-filter 10.60.0.0/16 orlonger
set policy-options policy-statement DC-OUT term LABS from route-filter 10.70.0.0/16 exact
set policy-options policy-statement X term T from route-filter 10.8.0.0/16 upto /24
set policy-options policy-statement X term T from route-filter 10.8.0.0/16 prefix-length-range /20-/24</pre>

<h3>The longest-match rule (read this twice)</h3>
<p>When one term has several route-filters, Junos does <b>not</b> test every one and accept if any matches. Instead, for a given route it first finds the route-filter whose <b>prefix is the longest one that still covers the route</b>. Only that entry's match type is checked. If it does not match, the term does not match, and Junos does <b>not</b> fall back to a shorter route-filter.</p>
<div class="eg"><p><b>Worked example.</b> Term DC has two entries:</p>
<pre class="code">route-filter 10.60.0.0/16 orlonger
route-filter 10.60.128.0/17 exact</pre>
<p>The route 10.60.5.0/24 is covered by the /16 only (it is below 10.60.128.0), so the /16 entry is used. orlonger matches. Accepted.</p>
<p>The route 10.60.200.0/24 is covered by both. The longest covering prefix is the /17, so its match type decides. exact means only 10.60.128.0/17 itself. 10.60.200.0/24 is a /24, so it fails, and the term does not match. The /16 orlonger is never consulted. The route is rejected by a later term or by the default.</p></div>
<p>This is exactly the first lab ticket: "the new analytics subnet 10.60.200.0/24 is missing". A leftover <code>route-filter 10.60.128.0/17 exact</code> silently blocked it.</p>

<h3>Which match type is the right one?</h3>
<ul>
<li><b>Advertise a summary only:</b> use <code>exact</code>. The /16 passes, the individual /24s do not.</li>
<li><b>Advertise a whole range including specifics:</b> use <code>orlonger</code>.</li>
<li><b>Block everything too specific:</b> use <code>upto /24</code> so /25 to /32 are not leaked.</li>
<li><b>Match only the more specific routes:</b> use <code>longer</code>.</li>
</ul>
<pre class="out">lab@R1&gt; test policy DC-OUT 10.0.0.0/8

inet.0: 14 destinations, 14 routes (14 active, 0 holddown, 0 hidden)
10.60.5.0/24       *[Static/5] 00:20:15
                    &gt; to 10.99.0.2 via ge-0/0/1.0
<span class="hl">10.70.1.0/24       *[Static/5] 00:20:15</span>
                    &gt; to 10.99.0.2 via ge-0/0/1.0
Policy DC-OUT: 4 prefix accepted, 7 prefix rejected</pre>
<p>The highlighted route proves a second ticket: 10.70.1.0/24 is accepted because term LABS used <code>orlonger</code> where only the /16 summary was intended. Changing the entry to <code>exact</code> fixes it.</p>

<div class="warn"><p><b>Common mistake.</b> Writing a route-filter without a match type. A bare <code>route-filter 10.8.0.0/16;</code> is not valid: Junos needs a type such as exact or orlonger. Another mistake is leaving an old, narrower route-filter behind after an edit. Always run <code>show policy-options policy-statement NAME</code> and read every entry.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may show two route-filters and ask whether a route matches. Find the longest covering prefix first, check only its match type, and ignore the rest. Also remember <code>orlonger</code> includes the prefix itself, while <code>longer</code> does not.</p></div>

<div class="scn"><h4>The summary that exploded into 400 routes</h4><p>A data centre team promised the campus network a single summary, 10.70.0.0/16, but the export policy used <code>orlonger</code>. The campus routers received the summary and 380 lab /24s, which filled a small branch router's table and slowed convergence. The engineer ran <code>test policy</code> with the summary prefix, saw hundreds of accepts, changed the filter to <code>exact</code>, and the table dropped back to one route.</p><p><b>Lesson:</b> orlonger leaks specifics. When the design says "summary only", use exact.</p></div>

<div class="iv"><p class="q">"What is the difference between orlonger and upto /24?"</p><p>Strong answer: both include the prefix itself. orlonger accepts any more specific prefix down to /32; upto /24 stops at /24, so longer routes such as /25 are not matched. Mention the longest-match rule: with several route-filters in one term, only the entry with the longest covering prefix is evaluated for a given route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A route-filter is a prefix plus a match type: exact, longer, orlonger, upto, prefix-length-range, through.</li>
<li>exact is for summaries; orlonger includes all specifics; upto /N sets a maximum length.</li>
<li>Longest-match rule: the longest covering route-filter alone decides whether the term matches.</li>
<li>A leftover narrow entry can silently block routes you meant to accept.</li>
<li>Use test policy to see exactly which prefixes a route-filter set accepts.</li>
</ul></div>
`,hi:`
<p><code>route-filter</code> sabse powerful match condition hai, aur wahi jisme candidates sabse zyada galti karte hain. Iske do hisse hain: ek prefix aur ek <b>match type</b>. Match type batata hai ki us prefix ke neeche kitna address space cover hota hai.</p>

<h3>Analogy: ek street aur uske ghar</h3>
<p>10.8.0.0/16 ko poori street samjho. Aap keh sakte ho "sirf street khud" (exact), "sirf us par ke ghar" (longer), "street aur uske saare ghar" (orlonger), ya "ek size tak ke ghar" (upto). Match type se aap batate ho ki aapka matlab kaunsa hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Route-filter match types as prefix lengths">
<text x="20" y="22" class="svg-muted" font-size="12">prefix length  /16</text><text x="190" y="22" class="svg-muted" font-size="12">/20</text><text x="330" y="22" class="svg-muted" font-size="12">/24</text><text x="470" y="22" class="svg-muted" font-size="12">/32</text>
<rect x="20" y="35" width="600" height="26" rx="4" fill="#e2e8f0"/><text x="30" y="53" class="svg-ink" font-size="12">route-filter 10.8.0.0/16 ...</text>
<rect x="20" y="70" width="20" height="26" rx="4" fill="#bbf7d0"/><text x="50" y="88" class="svg-ink" font-size="12">exact: sirf /16</text>
<rect x="40" y="105" width="580" height="26" rx="4" fill="#bae6fd"/><text x="50" y="123" class="svg-ink" font-size="12">longer: /17 se /32, /16 khud nahi</text>
<rect x="20" y="140" width="600" height="26" rx="4" fill="#ddd6fe"/><text x="30" y="158" class="svg-ink" font-size="12">orlonger: /16 se /32</text>
<rect x="20" y="175" width="310" height="26" rx="4" fill="#fde68a"/><text x="30" y="193" class="svg-ink" font-size="12">upto /24: /16 se /24</text>
<rect x="190" y="210" width="140" height="26" rx="4" fill="#fed7aa"/><text x="200" y="228" class="svg-ink" font-size="12">prefix-length-range /20-/24</text>
</svg><p class="cap">Har bar dikhata hai ki 10.8.0.0/16 ke andar kaunsi prefix lengths match type accept karta hai.</p></div>

<h3>Match types</h3>
<table class="cmp"><tr><th>route-filter 10.8.0.0/16 ...</th><th>Kya match hota hai</th><th>Match hone wala example</th></tr>
<tr><td><code>exact</code></td><td>sirf 10.8.0.0/16 khud</td><td>10.8.0.0/16</td></tr>
<tr><td><code>longer</code></td><td>sirf zyada specific prefixes (/17 se /32)</td><td>10.8.4.0/24</td></tr>
<tr><td><code>orlonger</code></td><td>khud aur usse zyada specific sab</td><td>10.8.0.0/16 aur 10.8.4.0/24</td></tr>
<tr><td><code>upto /24</code></td><td>khud se lekar /24 length tak</td><td>10.8.4.0/24 lekin 10.8.4.0/25 nahi</td></tr>
<tr><td><code>prefix-length-range /20-/24</code></td><td>andar ke prefixes, length 20 se 24 ke beech</td><td>10.8.16.0/20</td></tr>
<tr><td><code>through 10.8.4.0/24</code></td><td>/16 se us /24 tak ki prefixes ki chain</td><td>10.8.4.0/22</td></tr></table>
<p>Aise likhte hain:</p>
<pre class="code">set policy-options policy-statement DC-OUT term DC from route-filter 10.60.0.0/16 orlonger
set policy-options policy-statement DC-OUT term LABS from route-filter 10.70.0.0/16 exact
set policy-options policy-statement X term T from route-filter 10.8.0.0/16 upto /24
set policy-options policy-statement X term T from route-filter 10.8.0.0/16 prefix-length-range /20-/24</pre>

<h3>Longest-match rule (do baar padho)</h3>
<p>Jab ek term mein kai route-filters hon, Junos har ek ko test karke "koi bhi match kare to accept" <b>nahi</b> karta. Balki kisi route ke liye woh pehle woh route-filter dhoondta hai jiska <b>prefix route ko cover karne wala sabse lamba</b> ho. Sirf us entry ka match type check hota hai. Agar woh match nahi karta to term match nahi karta, aur Junos chhote route-filter par wapas <b>nahi</b> jaata.</p>
<div class="eg"><p><b>Worked example.</b> Term DC mein do entries hain:</p>
<pre class="code">route-filter 10.60.0.0/16 orlonger
route-filter 10.60.128.0/17 exact</pre>
<p>Route 10.60.5.0/24 sirf /16 se cover hota hai (yeh 10.60.128.0 ke neeche hai), isliye /16 entry use hoti hai. orlonger match karta hai. Accept.</p>
<p>Route 10.60.200.0/24 dono se cover hota hai. Sabse lamba covering prefix /17 hai, isliye uska match type decide karta hai. exact ka matlab sirf 10.60.128.0/17 khud. 10.60.200.0/24 /24 hai, isliye fail, aur term match nahi karta. /16 orlonger se kabhi poocha hi nahi jaata. Route ko baad ka term ya default reject kar deta hai.</p></div>
<p>Yahi pehla lab ticket hai: "naya analytics subnet 10.60.200.0/24 gayab hai". Bacha hua <code>route-filter 10.60.128.0/17 exact</code> ne use chupchap block kiya.</p>

<h3>Sahi match type kaunsa hai?</h3>
<ul>
<li><b>Sirf summary advertise karni hai:</b> <code>exact</code> use karo. /16 jaata hai, alag /24s nahi.</li>
<li><b>Poori range specifics ke saath advertise karni hai:</b> <code>orlonger</code>.</li>
<li><b>Bahut specific sab block karna hai:</b> <code>upto /24</code> taaki /25 se /32 leak na hon.</li>
<li><b>Sirf more specific routes match karne hain:</b> <code>longer</code>.</li>
</ul>
<pre class="out">lab@R1&gt; test policy DC-OUT 10.0.0.0/8

inet.0: 14 destinations, 14 routes (14 active, 0 holddown, 0 hidden)
10.60.5.0/24       *[Static/5] 00:20:15
                    &gt; to 10.99.0.2 via ge-0/0/1.0
<span class="hl">10.70.1.0/24       *[Static/5] 00:20:15</span>
                    &gt; to 10.99.0.2 via ge-0/0/1.0
Policy DC-OUT: 4 prefix accepted, 7 prefix rejected</pre>
<p>Highlighted route doosre ticket ko prove karta hai: 10.70.1.0/24 accept ho raha hai kyunki term LABS ne <code>orlonger</code> use kiya jabki sirf /16 summary chahiye thi. Entry ko <code>exact</code> karne se fix ho jaata hai.</p>

<div class="warn"><p><b>Common mistake.</b> Match type ke bina route-filter likhna. Bare <code>route-filter 10.8.0.0/16;</code> valid nahi hai: Junos ko exact ya orlonger jaisa type chahiye. Doosri galti: edit ke baad purani, narrow route-filter chhod dena. Hamesha <code>show policy-options policy-statement NAME</code> chalao aur har entry padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam mein do route-filters dikha kar poochh sakte hain ki route match hoga ya nahi. Pehle sabse lamba covering prefix dhoondo, sirf uska match type check karo, baaki ignore karo. Yeh bhi yaad rakho ki <code>orlonger</code> mein prefix khud shamil hai, <code>longer</code> mein nahi.</p></div>

<div class="scn"><h4>Summary jo 400 routes ban gayi</h4><p>Ek data centre team ne campus network ko ek hi summary, 10.70.0.0/16, ka vaada kiya, lekin export policy mein <code>orlonger</code> tha. Campus routers ko summary aur 380 lab /24s mil gaye, jisse ek chhote branch router ki table bhar gayi aur convergence slow ho gaya. Engineer ne summary prefix ke saath <code>test policy</code> chalaya, sainkdon accepts dekhe, filter ko <code>exact</code> kiya, aur table wapas ek route par aa gayi.</p><p><b>Lesson:</b> orlonger specifics leak karta hai. Jab design kahe "sirf summary", to exact use karo.</p></div>

<div class="iv"><p class="q">"orlonger aur upto /24 mein kya farak hai?"</p><p>Strong answer: dono mein prefix khud shamil hai. orlonger /32 tak har more specific prefix accept karta hai; upto /24 /24 par ruk jaata hai, isliye /25 jaise lambe routes match nahi hote. Longest-match rule bhi bolo: ek term mein kai route-filters hon to kisi route ke liye sirf sabse lambe covering prefix wali entry evaluate hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-filter = prefix plus match type: exact, longer, orlonger, upto, prefix-length-range, through.</li>
<li>exact summaries ke liye; orlonger saare specifics ke saath; upto /N maximum length set karta hai.</li>
<li>Longest-match rule: sabse lamba covering route-filter akela decide karta hai ki term match hoga ya nahi.</li>
<li>Bacha hua narrow entry un routes ko chupchap block kar sakta hai jo aap accept karna chahte the.</li>
<li>test policy se dekho ki route-filter set kaunse prefixes accept karta hai.</li>
</ul></div>
`}};export{e as default};