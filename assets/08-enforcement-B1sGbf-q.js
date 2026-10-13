var e={id:`enforcement`,h:{en:`Enforcement profiles and enforcement policies`,hi:`Enforcement profiles aur enforcement policies`},body:{en:`
<p>Authentication said who. Role mapping said what kind of user. Now ClearPass must decide what to <em>do</em> about it. That decision is made by an <b>enforcement policy</b>, and its result is one or more <b>enforcement profiles</b>. This is the station that finally changes what the switch does.</p>

<h3>Analogy: a menu and a waiter's order slip</h3>
<p>A restaurant has a menu of fixed dishes: Veg Thali, Non-Veg Thali, Kids Meal. These are <b>profiles</b>: ready-made packages. The waiter has a rule sheet: "if the customer is vegetarian, serve Veg Thali; if a child, Kids Meal; anyone else, the standard plate". That is the <b>policy</b>. The kitchen never invents a new dish for each customer; it picks from the menu using the rules.</p>

<h3>Enforcement profile: what to return</h3>
<p>A profile has a type and a list of attributes. For network access the type is <b>RADIUS</b> (a reply with attributes). Other types in the real product include accept, reject and drop, and session notification types such as sending a CoA. The built-in profiles are <b>[Allow Access Profile]</b>, <b>[Deny Access Profile]</b> (reject) and <b>[Drop Access Profile]</b> (drop silently).</p>
<p>The key attribute for Aruba switches is <code>Radius:Aruba:Aruba-User-Role</code>, whose value is the name of a role defined on the switch. The real GUI path is Configuration, Enforcement, Profiles, Add, where you choose the template "Aruba RADIUS Enforcement" and add the attribute in the Attributes tab.</p>
<pre class="code"><span class="c">! GUI: Configuration &gt; Enforcement &gt; Profiles &gt; Add</span>
configuration enforcement profile add EP-EMPLOYEE type radius
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE
configuration enforcement profile show</pre>
<pre class="out">Profile EP-EMPLOYEE  (type: RADIUS)
  Radius:Aruba:Aruba-User-Role  =  <span class="hl">EMPLOYEE</span></pre>

<h3>The other way: standard VLAN attributes</h3>
<p>Some sites do not use switch roles and send a VLAN directly with the standard RADIUS attributes. Then the profile must return <b>three</b> attributes together: <code>Tunnel-Type = VLAN (13)</code>, <code>Tunnel-Medium-Type = 802 (6)</code> and <code>Tunnel-Private-Group-Id = the VLAN ID</code>. Without all three the switch ignores the VLAN. The lab shell template adds all three:</p>
<pre class="code">configuration enforcement profile EP-CONTRACTOR template vlan 20
configuration enforcement profile EP-EMPLOYEE template aruba-role EMPLOYEE</pre>
<p>The lab model applies a RADIUS role first if its name exists on the switch; otherwise a tunnel VLAN if all three attributes are present; otherwise the port's own VLAN. Module 2 troubleshoots both styles in detail.</p>

<h3>Enforcement policy: when to return which profile</h3>
<p>An <b>enforcement policy</b> (Configuration, Enforcement, Policies) has a <b>default profile</b> and a list of <b>rules</b>. Each rule has conditions on attributes (for example <code>Tips:Role EQUALS ENGINEER</code> or <code>Authentication:Username EQUALS alice</code>) and one or more profiles to return. The <b>rule evaluation algorithm</b> is either <b>select first match</b> (the first matching rule wins) or <b>select all matches</b> (profiles of all matching rules are combined). If no rule matches, the default profile is used.</p>
<p>A very important design choice: set the default to <b>[Deny Access Profile]</b>. Then anyone who authenticated but is not covered by a rule gets nothing. This is the "default deny" principle. A default of [Allow Access Profile] quietly lets unknown users in.</p>
<pre class="code"><span class="c">! GUI: Configuration &gt; Enforcement &gt; Policies &gt; Add</span>
configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]"
configuration enforcement policy EPOL-WIRED rule add if Authentication:Username EQUALS alice then EP-EMPLOYEE
configuration enforcement policy show EPOL-WIRED</pre>
<pre class="out">Policy EPOL-WIRED  (algorithm: first match, default: [Deny Access Profile])
  1  Authentication:Username EQUALS alice  -&gt;  EP-EMPLOYEE</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Policy rule evaluation">
<rect x="20" y="20" width="270" height="50" rx="8" fill="#fde68a"/><text x="155" y="50" text-anchor="middle" class="svg-ink" font-size="12">Rule 1: Username EQUALS alice</text>
<rect x="20" y="85" width="270" height="50" rx="8" fill="#e2e8f0"/><text x="155" y="115" text-anchor="middle" class="svg-ink" font-size="12">Rule 2: (none yet)</text>
<rect x="20" y="150" width="270" height="40" rx="8" fill="#fecaca"/><text x="155" y="175" text-anchor="middle" class="svg-ink" font-size="12">Default: [Deny Access Profile]</text>
<rect x="400" y="20" width="220" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="50" text-anchor="middle" class="svg-ink" font-size="12">EP-EMPLOYEE (EMPLOYEE)</text>
<rect x="400" y="150" width="220" height="40" rx="8" fill="#fecaca"/><text x="510" y="175" text-anchor="middle" class="svg-ink" font-size="12">Access-Reject</text>
<line x1="290" y1="45" x2="400" y2="45" stroke="#16a34a" stroke-width="2"/><line x1="290" y1="170" x2="400" y2="170" stroke="#dc2626" stroke-width="2"/>
<text x="345" y="38" text-anchor="middle" class="svg-muted" font-size="11">match</text><text x="345" y="162" text-anchor="middle" class="svg-muted" font-size="11">no match</text>
</svg><p class="cap">Rules are tested in order; if none fit, the default decides.</p></div>

<div class="eg"><p><b>Worked example.</b> Alice authenticates, so rule 1 is true and EP-EMPLOYEE is returned: Access-Accept with Aruba-User-Role EMPLOYEE. Bob authenticates too. His username is not alice, so no rule matches and the default [Deny Access Profile] sends Access-Reject, even though his password was correct. That is not a bug; the policy simply has no rule for bob yet. In module 3 you add the Contractor rule.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting a catch-all rule such as <code>Tips:Role EQUALS [User Authenticated]</code> first, so every user matches it and later precise rules never run. Using a default that allows access. Returning a role name that has no matching role on the switch. Editing a profile and not forcing the user to authenticate again, because enforcement is only applied at login time.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Select first match" and "select all matches" give different results. With all matches several profiles can be combined, and the attribute lists are merged. Also remember that rule conditions can use roles (Tips:Role), but the role mapping must have produced them first.</p></div>

<div class="scn"><h4>Everyone lands in the guest VLAN</h4><p>After a clean-up, all staff began to land in the guest role. The service and the role mapping were correct. The enforcement policy used first match, and the first rule was a catch-all on [User Authenticated] that returned the guest profile. Removing the rule from the front restored the precise rules below it.</p><p><b>Lesson:</b> order inside a first-match policy is logic. Specific rules go first, general ones last.</p></div>

<div class="iv"><p class="q">"Why should an enforcement policy default be [Deny Access Profile]?"</p><p>Strong answer: because default deny follows least privilege. If a new user type appears and nobody wrote a rule, the safe outcome is no access rather than accidental access. You then add the rule deliberately. Mention that guests or fallback VLANs are a conscious policy, not an accidental default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A profile is a package of attributes; a policy chooses the profile by rules.</li>
<li>Aruba-User-Role names a switch role; VLAN assignment needs all three tunnel attributes.</li>
<li>Policies have first-match or all-matches, and a default profile when nothing fits.</li>
<li>Default deny is the safe default.</li>
<li>Policy changes apply at the next authentication, not instantly.</li>
</ul></div>
`,hi:`
<p>Authentication ne bataya kaun. Role mapping ne bataya kis type ka user. Ab ClearPass ko decide karna hai ki us par kya <em>karna</em> hai. Yeh decision <b>enforcement policy</b> leti hai, aur uska result ek ya zyada <b>enforcement profiles</b> hote hain. Yeh woh station hai jo aakhirkar switch ka behaviour badalta hai.</p>

<h3>Analogy: menu aur waiter ki order slip</h3>
<p>Restaurant ke paas fixed dishes ka menu hota hai: Veg Thali, Non-Veg Thali, Kids Meal. Yeh <b>profiles</b> hain: ready-made packages. Waiter ke paas rule sheet hoti hai: "customer vegetarian hai to Veg Thali; bachcha hai to Kids Meal; baaki sabko standard plate". Yeh <b>policy</b> hai. Kitchen har customer ke liye nayi dish nahi banata; woh rules se menu mein se chunta hai.</p>

<h3>Enforcement profile: kya return karna hai</h3>
<p>Profile ka ek type aur attributes ki list hoti hai. Network access ke liye type <b>RADIUS</b> hai (attributes wala reply). Real product mein aur types accept, reject aur drop hain, aur session notification types jaise CoA bhejna. Built-in profiles <b>[Allow Access Profile]</b>, <b>[Deny Access Profile]</b> (reject) aur <b>[Drop Access Profile]</b> (chupchap drop) hain.</p>
<p>Aruba switches ke liye key attribute <code>Radius:Aruba:Aruba-User-Role</code> hai, jiski value switch par defined role ka naam hai. Real GUI path Configuration, Enforcement, Profiles, Add hai, jahan aap template "Aruba RADIUS Enforcement" chunte ho aur Attributes tab mein attribute add karte ho.</p>
<pre class="code"><span class="c">! GUI: Configuration &gt; Enforcement &gt; Profiles &gt; Add</span>
configuration enforcement profile add EP-EMPLOYEE type radius
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE
configuration enforcement profile show</pre>
<pre class="out">Profile EP-EMPLOYEE  (type: RADIUS)
  Radius:Aruba:Aruba-User-Role  =  <span class="hl">EMPLOYEE</span></pre>

<h3>Doosra tareeka: standard VLAN attributes</h3>
<p>Kuch sites switch roles use nahi karti aur standard RADIUS attributes se seedha VLAN bhejti hain. Tab profile ko <b>teen</b> attributes saath return karne padte hain: <code>Tunnel-Type = VLAN (13)</code>, <code>Tunnel-Medium-Type = 802 (6)</code> aur <code>Tunnel-Private-Group-Id = VLAN ID</code>. Teeno ke bina switch VLAN ko ignore kar deta hai. Lab shell template teeno add karta hai:</p>
<pre class="code">configuration enforcement profile EP-CONTRACTOR template vlan 20
configuration enforcement profile EP-EMPLOYEE template aruba-role EMPLOYEE</pre>
<p>Lab model pehle RADIUS role apply karta hai agar uska naam switch par maujood hai; warna tunnel VLAN agar teeno attributes hain; warna port ka apna VLAN. Module 2 dono styles ko detail mein troubleshoot karta hai.</p>

<h3>Enforcement policy: kab kaunsa profile return karna hai</h3>
<p><b>Enforcement policy</b> (Configuration, Enforcement, Policies) ka ek <b>default profile</b> aur <b>rules</b> ki list hoti hai. Har rule mein attributes par conditions (jaise <code>Tips:Role EQUALS ENGINEER</code> ya <code>Authentication:Username EQUALS alice</code>) aur return karne ke liye ek ya zyada profiles hote hain. <b>Rule evaluation algorithm</b> ya to <b>select first match</b> hai (pehla matching rule jeetta hai) ya <b>select all matches</b> (saare matching rules ke profiles combine hote hain). Koi rule match na kare to default profile use hota hai.</p>
<p>Ek bahut important design choice: default ko <b>[Deny Access Profile]</b> rakho. Tab jo authenticate hua par kisi rule mein cover nahi hai use kuch nahi milta. Yeh "default deny" principle hai. [Allow Access Profile] ka default chupchap unknown users ko andar aane deta hai.</p>
<pre class="code"><span class="c">! GUI: Configuration &gt; Enforcement &gt; Policies &gt; Add</span>
configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]"
configuration enforcement policy EPOL-WIRED rule add if Authentication:Username EQUALS alice then EP-EMPLOYEE
configuration enforcement policy show EPOL-WIRED</pre>
<pre class="out">Policy EPOL-WIRED  (algorithm: first match, default: [Deny Access Profile])
  1  Authentication:Username EQUALS alice  -&gt;  EP-EMPLOYEE</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Policy rule evaluation">
<rect x="20" y="20" width="270" height="50" rx="8" fill="#fde68a"/><text x="155" y="50" text-anchor="middle" class="svg-ink" font-size="12">Rule 1: Username EQUALS alice</text>
<rect x="20" y="85" width="270" height="50" rx="8" fill="#e2e8f0"/><text x="155" y="115" text-anchor="middle" class="svg-ink" font-size="12">Rule 2: (abhi koi nahi)</text>
<rect x="20" y="150" width="270" height="40" rx="8" fill="#fecaca"/><text x="155" y="175" text-anchor="middle" class="svg-ink" font-size="12">Default: [Deny Access Profile]</text>
<rect x="400" y="20" width="220" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="50" text-anchor="middle" class="svg-ink" font-size="12">EP-EMPLOYEE (EMPLOYEE)</text>
<rect x="400" y="150" width="220" height="40" rx="8" fill="#fecaca"/><text x="510" y="175" text-anchor="middle" class="svg-ink" font-size="12">Access-Reject</text>
<line x1="290" y1="45" x2="400" y2="45" stroke="#16a34a" stroke-width="2"/><line x1="290" y1="170" x2="400" y2="170" stroke="#dc2626" stroke-width="2"/>
<text x="345" y="38" text-anchor="middle" class="svg-muted" font-size="11">match</text><text x="345" y="162" text-anchor="middle" class="svg-muted" font-size="11">no match</text>
</svg><p class="cap">Rules order mein test hote hain; koi fit na ho to default decide karta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Alice authenticate karti hai, to rule 1 true hai aur EP-EMPLOYEE return hota hai: Access-Accept with Aruba-User-Role EMPLOYEE. Bob bhi authenticate karta hai. Uska username alice nahi hai, to koi rule match nahi karta aur default [Deny Access Profile] Access-Reject bhejta hai, chahe uska password sahi tha. Yeh bug nahi hai; policy mein abhi bob ke liye rule hi nahi hai. Module 3 mein aap Contractor rule add karoge.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>Tips:Role EQUALS [User Authenticated]</code> jaisa catch-all rule pehle rakhna, jisse har user usse match karta hai aur baad ke precise rules kabhi nahi chalte. Aisa default use karna jo access deta hai. Aisa role naam return karna jiska switch par matching role nahi hai. Profile edit karke user ko dobara authenticate na karwana, kyunki enforcement sirf login time par lagta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Select first match" aur "select all matches" alag results dete hain. All matches mein kai profiles combine ho sakte hain, aur attribute lists merge hoti hain. Yeh bhi yaad rakho ki rule conditions roles (Tips:Role) use kar sakti hain, par role mapping ne unhe pehle banaya hona chahiye.</p></div>

<div class="scn"><h4>Sab guest VLAN mein</h4><p>Clean-up ke baad saare staff guest role mein jaane lage. Service aur role mapping sahi the. Enforcement policy first match use karti thi, aur pehla rule [User Authenticated] par catch-all tha jo guest profile return karta tha. Rule ko front se hatane par uske neeche ke precise rules wapas chalne lage.</p><p><b>Seekh:</b> first-match policy ke andar order logic hai. Specific rules pehle, general rules last.</p></div>

<div class="iv"><p class="q">"Enforcement policy ka default [Deny Access Profile] kyun hona chahiye?"</p><p>Strong answer: kyunki default deny least privilege follow karta hai. Agar naya user type aaye aur kisi ne rule nahi likha, to safe outcome accidental access nahi, no access hai. Phir aap rule jaanbujhkar add karte ho. Mention karo ki guests ya fallback VLANs conscious policy hain, accidental default nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Profile attributes ka package hai; policy rules se profile chunti hai.</li>
<li>Aruba-User-Role switch role ka naam hai; VLAN assignment ke liye teeno tunnel attributes chahiye.</li>
<li>Policies first-match ya all-matches hoti hain, aur kuch fit na ho to default profile.</li>
<li>Default deny safe default hai.</li>
<li>Policy changes agle authentication par lagte hain, turant nahi.</li>
</ul></div>
`}};export{e as default};