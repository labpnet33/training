var e={id:`filtering`,h:{en:`Filtering routes: prefix-lists, distribute-lists and AS-path filter-lists`,hi:`Routes filter karna: prefix-lists, distribute-lists aur AS-path filter-lists`},body:{en:`
<p>Airport security checks a traveller in two different ways. One officer looks at the <b>passport</b>: who are you, exactly? Another looks at the <b>travel history</b>: which countries have you passed through? BGP filtering works the same. A <b>prefix-list</b> checks the route itself (the prefix and its length). An <b>AS-path filter-list</b> checks where the route has travelled (the AS_PATH). A <b>route-map</b> (chapter 8) can combine both and also change attributes.</p>

<h3>The four filtering tools per neighbor</h3>
<table class="cmp"><tr><th>Tool</th><th>Matches on</th><th>Applied with</th></tr>
<tr><td>Prefix-list</td><td>Prefix and prefix length</td><td><code>neighbor X prefix-list NAME in|out</code></td></tr>
<tr><td>Distribute-list</td><td>ACL (usually only the network address)</td><td><code>neighbor X distribute-list ACL in|out</code></td></tr>
<tr><td>Filter-list</td><td>AS_PATH, with a regular expression</td><td><code>neighbor X filter-list N in|out</code></td></tr>
<tr><td>Route-map</td><td>Any combination, plus set actions</td><td><code>neighbor X route-map NAME in|out</code></td></tr>
</table>
<p>A route must be permitted by <b>every</b> filter applied in that direction. You may apply a prefix-list <i>or</i> a distribute-list to a neighbor in one direction, not both. Prefix-lists are preferred over ACLs because they understand prefix length.</p>

<h3>Prefix-lists in BGP (quick recap)</h3>
<p>You met prefix-lists in the redistribution module. The key BGP patterns:</p>
<pre class="code">ip prefix-list DEFAULT-ONLY seq 5 permit 0.0.0.0/0          <span class="c">! exactly the default route</span>
ip prefix-list ANY seq 5 permit 0.0.0.0/0 le 32              <span class="c">! every prefix</span>
ip prefix-list CUST seq 5 permit 10.0.0.0/8 ge 16 le 24      <span class="c">! /16 to /24 inside 10/8</span>
ip prefix-list MON seq 5 permit 192.0.2.0/24                 <span class="c">! exactly this /24</span></pre>
<p>Without <code>ge</code> or <code>le</code> the length must match exactly, so <code>192.0.2.0/24</code> does not match 192.0.2.0/25. Every prefix-list ends with an implicit <b>deny</b>.</p>

<h3>AS-path regular expressions</h3>
<p>A filter-list uses <code>ip as-path access-list N permit|deny REGEX</code>. The regex runs against the AS_PATH as text, for example <code>64601 64602</code>. These characters are all you need for the exam:</p>
<table class="cmp"><tr><th>Char</th><th>Meaning</th></tr>
<tr><td><code>^</code></td><td>Start of the path</td></tr>
<tr><td><code>$</code></td><td>End of the path</td></tr>
<tr><td><code>_</code></td><td>Any delimiter: space, start, end, comma, brace</td></tr>
<tr><td><code>.</code></td><td>Any single character</td></tr>
<tr><td><code>*</code> <code>+</code> <code>?</code></td><td>Previous item zero or more, one or more, zero or one times</td></tr>
<tr><td><code>[ ]</code> <code>( )</code> <code>|</code></td><td>Character range, grouping, or</td></tr>
</table>

<h3>Regex drills</h3>
<p>Six sample paths: (A) empty, a route from your own AS; (B) <code>64601</code>; (C) <code>64601 64602</code>; (D) <code>64602</code>; (E) <code>64601 64602 64800</code>; (F) <code>64602 64602 64602</code>, a prepended path.</p>
<table class="cmp"><tr><th>Regex</th><th>Meaning</th><th>Matches</th></tr>
<tr><td><code>^$</code></td><td>Originated in my own AS</td><td>A</td></tr>
<tr><td><code>^64601_</code></td><td>Learned from neighbor AS 64601</td><td>B, C, E</td></tr>
<tr><td><code>_64602$</code></td><td>Originated by AS 64602</td><td>C, D, F</td></tr>
<tr><td><code>_64602_</code></td><td>Passed through AS 64602 anywhere</td><td>C, D, E, F</td></tr>
<tr><td><code>^[0-9]+$</code></td><td>Exactly one AS: the neighbor's own routes</td><td>B, D</td></tr>
<tr><td><code>^64602(_64602)*$</code></td><td>Originated by 64602, directly, even if prepended</td><td>D, F</td></tr>
<tr><td><code>^6460[12]_</code></td><td>Learned from 64601 or 64602</td><td>B, C, D, E, F</td></tr>
<tr><td><code>.*</code></td><td>Anything, including empty</td><td>All</td></tr>
</table>
<p>Test any regex live before applying it: <code>show ip bgp regexp ^64601_</code>.</p>
<pre class="out">E1# show ip bgp regexp ^64601_ | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *   192.0.2.0        100.64.1.1                             0 64601 64602 i</span>
 *   198.51.100.0     100.64.1.1                             0 64601 64602 i</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Transit leak prevented by an outbound filter-list">
<rect x="20" y="20" width="140" height="46" rx="8" fill="#fed7aa"/><text x="90" y="48" text-anchor="middle" class="svg-ink" font-size="13">ISP1 AS 64601</text>
<rect x="480" y="20" width="140" height="46" rx="8" fill="#fed7aa"/><text x="550" y="48" text-anchor="middle" class="svg-ink" font-size="13">ISP2 AS 64602</text>
<rect x="250" y="120" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">AS 65500</text>
<line x1="160" y1="60" x2="260" y2="120" stroke="#64748b" stroke-width="2"/><line x1="480" y1="60" x2="380" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="12">ISP2 routes in</text>
<text x="110" y="100" text-anchor="middle" class="svg-accent" font-size="12">out: only ^$</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Without the filter, AS 65500 offers itself as a path between its two providers</text>
</svg><p class="cap">An outbound filter-list permitting only <code>^$</code> stops a dual-homed customer from becoming transit.</p></div>

<h3>Configuration examples</h3>
<pre class="code"><span class="c">! Send only locally originated routes to each provider</span>
ip as-path access-list 1 permit ^$
router bgp 65500
 neighbor 100.64.1.1 filter-list 1 out
 neighbor 100.64.2.1 filter-list 1 out
<span class="c">! Accept from a partner only its own prefixes (possibly prepended)</span>
ip as-path access-list 20 permit ^64800(_64800)*$
router bgp 65000
 neighbor 172.30.1.1 filter-list 20 in
<span class="c">! Distribute-list with a standard ACL (network address only)</span>
access-list 10 deny 10.99.0.0 0.0.255.255
access-list 10 permit any
 neighbor 172.30.2.1 distribute-list 10 in</pre>

<div class="eg"><p><b>Worked example: the accidental transit.</b> In the Orbit Retail lab, E1 learns 198.51.100.0/24 from Lumen-X with path <code>64601 64602</code> and from E2 over iBGP with path <code>64602</code>. Before any policy, E1's best path is via E2 (shorter AS path). E1 therefore advertises 198.51.100.0/24 to Lumen-X with path <code>65500 64602</code>: Orbit Retail offers itself as a way into Vayu Net. With <code>filter-list 1 out</code> (<code>^$</code>) only 172.16.50.0/24, originated inside AS 65500, is sent. The lab does not require this filter, but every real dual-homed enterprise should have it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing <code>^64601</code> without the underscore, which also matches 646010 or 64601x when 4-byte ASNs appear. Writing <code>_1_</code> when you mean "through AS 1" versus <code>1</code>, which matches any AS containing the digit 1. Forgetting that an as-path access-list also ends with an implicit deny, so a list with only <code>deny</code> lines blocks everything. Applying a new filter and not refreshing the routes (chapter 8).</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>^$</code> = local routes only. <code>_X$</code> = originated by X; <code>^X_</code> = received from neighbor AS X. <code>^[0-9]+$</code> = one AS in the path. A prefix-list entry without ge/le is an exact length match. You cannot apply both a prefix-list and a distribute-list to the same neighbor and direction.</p></div>

<div class="scn"><h4>The enterprise that carried a provider's traffic</h4><p>A logistics company with two providers noticed its Internet links saturated at night, although its own traffic was low. <code>show ip bgp neighbors 100.64.1.1 advertised-routes</code> showed hundreds of prefixes learned from the other provider. Provider A preferred customer routes, so it sent traffic for provider B's customers through the enterprise. An outbound filter-list permitting only <code>^$</code> on both sessions stopped the leak within a minute of a soft outbound refresh.</p><p><b>Lesson:</b> a multihomed enterprise must filter outbound; never rely on providers to do it for you.</p></div>

<div class="iv"><p class="q">"How do you make sure your AS is not used as transit?"</p><p>Explain an outbound filter on every eBGP session that permits only locally originated routes: <code>ip as-path access-list 1 permit ^$</code> applied as <code>filter-list 1 out</code>, or a prefix-list of your registered prefixes. Mention verifying with <code>show ip bgp neighbors X advertised-routes</code>, and the no-export community as a complementary tool. A strong candidate also explains why providers prefer customer routes, which makes the leak attract traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prefix-list = the route; filter-list = the AS path; route-map = both plus set actions.</li>
<li>A route must pass every filter applied in that direction; prefix-list or distribute-list, not both.</li>
<li><code>^</code> start, <code>$</code> end, <code>_</code> delimiter; <code>^$</code> means local routes.</li>
<li>Always test regex with <code>show ip bgp regexp</code> before applying it.</li>
<li>Multihomed enterprises filter outbound with <code>^$</code> to avoid becoming transit.</li>
</ul></div>
`,hi:`
<p>Airport security ek traveller ko do alag tareekon se check karti hai. Ek officer <b>passport</b> dekhta hai: aap exactly kaun ho? Dusra <b>travel history</b> dekhta hai: aap kin deshon se guzre ho? BGP filtering bhi aisi hi hai. <b>Prefix-list</b> route ko khud check karti hai (prefix aur uski length). <b>AS-path filter-list</b> check karti hai ki route kahan kahan se guzra (AS_PATH). <b>Route-map</b> (chapter 8) dono ko mila sakta hai aur attributes bhi badal sakta hai.</p>

<h3>Har neighbor ke liye chaar filtering tools</h3>
<table class="cmp"><tr><th>Tool</th><th>Kis par match karta hai</th><th>Kaise lagta hai</th></tr>
<tr><td>Prefix-list</td><td>Prefix aur prefix length</td><td><code>neighbor X prefix-list NAME in|out</code></td></tr>
<tr><td>Distribute-list</td><td>ACL (aam taur par sirf network address)</td><td><code>neighbor X distribute-list ACL in|out</code></td></tr>
<tr><td>Filter-list</td><td>AS_PATH, regular expression se</td><td><code>neighbor X filter-list N in|out</code></td></tr>
<tr><td>Route-map</td><td>Koi bhi combination, plus set actions</td><td><code>neighbor X route-map NAME in|out</code></td></tr>
</table>
<p>Route ko us direction mein lage <b>har</b> filter se permit hona chahiye. Aap ek neighbor par ek direction mein prefix-list <i>ya</i> distribute-list laga sakte ho, dono nahi. Prefix-lists ACLs se behtar hain kyunki woh prefix length samajhti hain.</p>

<h3>BGP mein prefix-lists (jaldi recap)</h3>
<p>Prefix-lists aap redistribution module mein dekh chuke ho. Key BGP patterns:</p>
<pre class="code">ip prefix-list DEFAULT-ONLY seq 5 permit 0.0.0.0/0          <span class="c">! sirf default route</span>
ip prefix-list ANY seq 5 permit 0.0.0.0/0 le 32              <span class="c">! har prefix</span>
ip prefix-list CUST seq 5 permit 10.0.0.0/8 ge 16 le 24      <span class="c">! 10/8 ke andar /16 se /24</span>
ip prefix-list MON seq 5 permit 192.0.2.0/24                 <span class="c">! exactly yeh /24</span></pre>
<p><code>ge</code> ya <code>le</code> ke bina length exactly match honi chahiye, isliye <code>192.0.2.0/24</code> 192.0.2.0/25 ko match nahi karta. Har prefix-list ke end mein implicit <b>deny</b> hota hai.</p>

<h3>AS-path regular expressions</h3>
<p>Filter-list <code>ip as-path access-list N permit|deny REGEX</code> use karti hai. Regex AS_PATH par text ki tarah chalta hai, jaise <code>64601 64602</code>. Exam ke liye bas yeh characters chahiye:</p>
<table class="cmp"><tr><th>Char</th><th>Matlab</th></tr>
<tr><td><code>^</code></td><td>Path ki shuruaat</td></tr>
<tr><td><code>$</code></td><td>Path ka end</td></tr>
<tr><td><code>_</code></td><td>Koi bhi delimiter: space, start, end, comma, brace</td></tr>
<tr><td><code>.</code></td><td>Koi bhi ek character</td></tr>
<tr><td><code>*</code> <code>+</code> <code>?</code></td><td>Pichhla item zero ya zyada, ek ya zyada, zero ya ek baar</td></tr>
<tr><td><code>[ ]</code> <code>( )</code> <code>|</code></td><td>Character range, grouping, ya</td></tr>
</table>

<h3>Regex drills</h3>
<p>Chhe sample paths: (A) khaali, aapke apne AS ka route; (B) <code>64601</code>; (C) <code>64601 64602</code>; (D) <code>64602</code>; (E) <code>64601 64602 64800</code>; (F) <code>64602 64602 64602</code>, ek prepended path.</p>
<table class="cmp"><tr><th>Regex</th><th>Matlab</th><th>Matches</th></tr>
<tr><td><code>^$</code></td><td>Mere apne AS mein originate hua</td><td>A</td></tr>
<tr><td><code>^64601_</code></td><td>Neighbor AS 64601 se seekha</td><td>B, C, E</td></tr>
<tr><td><code>_64602$</code></td><td>AS 64602 ne originate kiya</td><td>C, D, F</td></tr>
<tr><td><code>_64602_</code></td><td>Kahin bhi AS 64602 se guzra</td><td>C, D, E, F</td></tr>
<tr><td><code>^[0-9]+$</code></td><td>Exactly ek AS: neighbor ke apne routes</td><td>B, D</td></tr>
<tr><td><code>^64602(_64602)*$</code></td><td>64602 ne originate kiya, seedha, prepend ho tab bhi</td><td>D, F</td></tr>
<tr><td><code>^6460[12]_</code></td><td>64601 ya 64602 se seekha</td><td>B, C, D, E, F</td></tr>
<tr><td><code>.*</code></td><td>Kuch bhi, khaali bhi</td><td>Sab</td></tr>
</table>
<p>Kisi bhi regex ko lagane se pehle live test karo: <code>show ip bgp regexp ^64601_</code>.</p>
<pre class="out">E1# show ip bgp regexp ^64601_ | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *   192.0.2.0        100.64.1.1                             0 64601 64602 i</span>
 *   198.51.100.0     100.64.1.1                             0 64601 64602 i</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Outbound filter-list se transit leak roka gaya">
<rect x="20" y="20" width="140" height="46" rx="8" fill="#fed7aa"/><text x="90" y="48" text-anchor="middle" class="svg-ink" font-size="13">ISP1 AS 64601</text>
<rect x="480" y="20" width="140" height="46" rx="8" fill="#fed7aa"/><text x="550" y="48" text-anchor="middle" class="svg-ink" font-size="13">ISP2 AS 64602</text>
<rect x="250" y="120" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">AS 65500</text>
<line x1="160" y1="60" x2="260" y2="120" stroke="#64748b" stroke-width="2"/><line x1="480" y1="60" x2="380" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="12">ISP2 routes andar</text>
<text x="110" y="100" text-anchor="middle" class="svg-accent" font-size="12">out: sirf ^$</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Filter ke bina AS 65500 apne do providers ke beech khud ko path bana deta hai</text>
</svg><p class="cap">Sirf <code>^$</code> permit karne wali outbound filter-list dual-homed customer ko transit banne se rokti hai.</p></div>

<h3>Configuration examples</h3>
<pre class="code"><span class="c">! Har provider ko sirf locally originated routes bhejo</span>
ip as-path access-list 1 permit ^$
router bgp 65500
 neighbor 100.64.1.1 filter-list 1 out
 neighbor 100.64.2.1 filter-list 1 out
<span class="c">! Partner se sirf uske apne prefixes accept karo (prepend ho sakte hain)</span>
ip as-path access-list 20 permit ^64800(_64800)*$
router bgp 65000
 neighbor 172.30.1.1 filter-list 20 in
<span class="c">! Standard ACL ke saath distribute-list (sirf network address)</span>
access-list 10 deny 10.99.0.0 0.0.255.255
access-list 10 permit any
 neighbor 172.30.2.1 distribute-list 10 in</pre>

<div class="eg"><p><b>Worked example: galti se bana transit.</b> Orbit Retail lab mein E1 198.51.100.0/24 ko Lumen-X se path <code>64601 64602</code> ke saath aur E2 se iBGP par path <code>64602</code> ke saath seekhta hai. Kisi policy se pehle E1 ka best path E2 ke through hai (chhota AS path). Isliye E1 198.51.100.0/24 ko Lumen-X ko path <code>65500 64602</code> ke saath advertise karta hai: Orbit Retail khud ko Vayu Net tak jaane ka raasta bana deta hai. <code>filter-list 1 out</code> (<code>^$</code>) ke saath sirf 172.16.50.0/24, jo AS 65500 ke andar originate hua, bheja jaata hai. Lab ko yeh filter nahi chahiye, par har real dual-homed enterprise ke paas yeh hona chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Underscore ke bina <code>^64601</code> likhna, jo 4-byte ASNs aane par 646010 ya 64601x ko bhi match karta hai. "AS 1 se guzra" ke liye <code>_1_</code> ki jagah <code>1</code> likhna, jo 1 digit wale kisi bhi AS ko match karta hai. Yeh bhoolna ki as-path access-list bhi implicit deny par khatam hoti hai, isliye sirf <code>deny</code> lines wali list sab block kar deti hai. Naya filter laga kar routes refresh na karna (chapter 8).</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>^$</code> = sirf local routes. <code>_X$</code> = X ne originate kiya; <code>^X_</code> = neighbor AS X se receive hua. <code>^[0-9]+$</code> = path mein ek AS. ge/le ke bina prefix-list entry exact length match hai. Same neighbor aur direction par prefix-list aur distribute-list dono nahi lag sakte.</p></div>

<div class="scn"><h4>Woh enterprise jo provider ka traffic dho raha tha</h4><p>Do providers wali ek logistics company ne dekha ki raat mein uske Internet links saturated hain, jabki uska apna traffic kam tha. <code>show ip bgp neighbors 100.64.1.1 advertised-routes</code> mein dusre provider se seekhe sainkdon prefixes dikhe. Provider A customer routes prefer karta tha, isliye woh provider B ke customers ka traffic enterprise ke through bhej raha tha. Dono sessions par sirf <code>^$</code> permit karne wali outbound filter-list ne soft outbound refresh ke ek minute ke andar leak rok diya.</p><p><b>Seekh:</b> multihomed enterprise ko outbound filter karna hi chahiye; providers ke bharose kabhi mat raho.</p></div>

<div class="iv"><p class="q">"Aap kaise ensure karoge ki aapka AS transit ki tarah use na ho?"</p><p>Har eBGP session par outbound filter samjhao jo sirf locally originated routes permit kare: <code>ip as-path access-list 1 permit ^$</code> ko <code>filter-list 1 out</code> ki tarah lagao, ya apne registered prefixes ki prefix-list. <code>show ip bgp neighbors X advertised-routes</code> se verify karna batao, aur complementary tool ke roop mein no-export community. Strong candidate yeh bhi samjhata hai ki providers customer routes prefer karte hain, jisse leak traffic kheenchta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prefix-list = route; filter-list = AS path; route-map = dono plus set actions.</li>
<li>Route ko us direction ke har filter se guzarna hota hai; prefix-list ya distribute-list, dono nahi.</li>
<li><code>^</code> start, <code>$</code> end, <code>_</code> delimiter; <code>^$</code> matlab local routes.</li>
<li>Regex lagane se pehle hamesha <code>show ip bgp regexp</code> se test karo.</li>
<li>Multihomed enterprises transit na banne ke liye <code>^$</code> se outbound filter karte hain.</li>
</ul></div>
`}};export{e as default};