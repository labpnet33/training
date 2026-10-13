var e={id:`enforcement-policy`,h:{en:`Enforcement policies: rules, operators and the default profile`,hi:`Enforcement policies: rules, operators aur default profile`},body:{en:`
<p>Picture a security rulebook pinned in the guard room: "If the visitor is an engineer, give card type A. If the visitor is a contractor, give card type B. Anybody else: no card." The guard reads the lines from the top, stops at the first line that fits, and does what it says. If no line fits, the last sentence (the default) applies. An <b>enforcement policy</b> in ClearPass is this rulebook. Its job is to choose one or more <b>enforcement profiles</b> from the context of the request.</p>

<h3>Anatomy of a policy</h3>
<p>In the GUI you build it under <b>Configuration &gt; Enforcement &gt; Policies</b>. Three parts matter:</p>
<ul>
<li>The <b>enforcement type</b>. For wired and wireless network access it is RADIUS. Other types (TACACS+, application, web authentication, events) belong to other services and are <b>not simulated in the lab</b>.</li>
<li>The <b>default profile</b>, which applies when no rule matches. The safe default for access control is <b>[Deny Access Profile]</b>.</li>
<li>An ordered list of <b>rules</b>. Each rule has conditions (a set joined by AND) and one or more profiles to apply.</li>
</ul>
<p>The policy also has an evaluation algorithm. <b>Select first match</b> stops at the first rule that is true. <b>Select all matches</b> keeps going and collects the profiles of every true rule. Wired access normally uses first match, because a switch port needs one clear answer.</p>

<h3>What conditions can look at</h3>
<p>A condition is attribute, operator, value, just like a service rule, but the attribute namespaces are richer. The ones you will use:</p>
<table class="cmp"><tr><th>Attribute</th><th>Meaning</th><th>Example</th></tr>
<tr><td>Tips:Role</td><td>The roles assigned by role mapping</td><td>Tips:Role EQUALS CONTRACTOR</td></tr>
<tr><td>Authentication:Username</td><td>The name that authenticated</td><td>Authentication:Username EQUALS alice</td></tr>
<tr><td>Authentication:Source</td><td>Which source proved the identity</td><td>Authentication:Source EQUALS [Local User Repository]</td></tr>
<tr><td>Endpoint:Category</td><td>Attribute from the Endpoints Repository</td><td>Endpoint:Category EQUALS Printer</td></tr>
<tr><td>Connection:NAD-IP-Address</td><td>Which switch asked</td><td>Connection:NAD-IP-Address EQUALS 10.20.99.2</td></tr></table>
<p>The real product adds more namespaces, including date and time, and posture or health results from OnGuard. <b>Posture and profiling are not simulated.</b> The operators available in the lab are EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, BELONGS_TO, NOT_BELONGS_TO, EXISTS, NOT_EXISTS and MATCHES. Note that a user can have several roles at once, so Tips:Role EQUALS CONTRACTOR is true when CONTRACTOR is among the roles, even if [User Authenticated] is also present.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Policy rules evaluated top to bottom with a default">
<rect x="20" y="14" width="400" height="40" rx="8" fill="#bbf7d0"/><text x="220" y="39" text-anchor="middle" class="svg-ink" font-size="13">1  if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE</text>
<rect x="20" y="62" width="400" height="40" rx="8" fill="#bbf7d0"/><text x="220" y="87" text-anchor="middle" class="svg-ink" font-size="13">2  if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR</text>
<rect x="20" y="110" width="400" height="40" rx="8" fill="#fed7aa"/><text x="220" y="135" text-anchor="middle" class="svg-ink" font-size="13">default: [Deny Access Profile]</text>
<line x1="450" y1="30" x2="450" y2="130" stroke="#64748b" stroke-width="2"/><polygon points="450,140 444,128 456,128" fill="#64748b"/>
<text x="470" y="40" class="svg-ink" font-size="13">read top down</text><text x="470" y="70" class="svg-ink" font-size="13">first true rule</text><text x="470" y="88" class="svg-accent" font-size="13">wins and stops</text><text x="470" y="125" class="svg-ink" font-size="13">no rule: default</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">A safe default is deny. A permissive default silently admits every unknown user.</text>
</svg><p class="cap">Select first match: the order of rules is part of the logic.</p></div>

<h3>Lab shell: building EPOL-WIRED</h3>
<pre class="code"><span class="c">! Configuration &gt; Enforcement &gt; Policies (Lab shell on CPPM)</span>
configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]" algorithm first
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR
configuration enforcement policy show EPOL-WIRED</pre>
<pre class="out">Configuration &gt; Enforcement &gt; Policies
Policy: EPOL-WIRED   Evaluation: select first match   Default profile: <span class="hl">[Deny Access Profile]</span>
  1. if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
  2. if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR</pre>
<p>Lab output, representative of the layout. A rule may carry two profiles separated by a comma, for example <code>then EP-EMPLOYEE,EP-LOGGING</code>. Rules are appended at the end, numbered from 1, and <code>rule remove N</code> deletes one. A profile named in a rule or as default must already exist, so create profiles before the policy.</p>

<h3>The default is a security decision</h3>
<p>The default profile is what happens to every user your rules did not predict: a new department, a mistyped attribute, a missing directory group. [Deny Access Profile] turns these into visible rejects that the Access Tracker explains with an enforcement alert (code 9010 in the lab, "No enforcement rule matched"). A default that grants access turns the same mistakes into silent over-access. Some designs use a restricted guest or quarantine profile as default; that is a conscious choice, and it must be a profile that cannot reach internal systems.</p>

<h3>How to write a good rule</h3>
<ol>
<li>Prefer <b>Tips:Role</b> over raw attributes. The role mapping already did the translation.</li>
<li>Be specific. Add a second condition, such as the NAD address or the source, if the rule should apply only in one place.</li>
<li>Put narrow rules before broad ones.</li>
<li>Never put a catch-all (a rule that is true for everyone) above anything else. Use the default for "everyone else".</li>
<li>Test with one user of each role, plus one unknown user.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Using [User Authenticated] in an Accept rule at the top. Naming a role in a rule that the mapping never produces. Forgetting that a rule referencing a deleted profile raises an error (code 9009 in the lab). Leaving a permissive default after testing.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default profile is used when <i>no rule</i> matched. It is not a rule of its own and it has no position in the list. Also: in the first-match algorithm only the first matching rule's profiles are applied, even if later rules would also match.</p></div>

<div class="scn"><h4>The default that let the cleaner in</h4><p>During a pilot, an engineer set the policy default to a profile that placed users in the employee role "so nobody gets stuck". Months later an audit found that a user from a decommissioned directory group still got employee access. The group no longer mapped to any role, so no rule matched and the default quietly granted employee access. The default was changed to deny, with a separate guest rule for visitors.</p><p><b>Lesson:</b> a default is policy for the unknown. Choose it deliberately.</p></div>

<div class="iv"><p class="q">"Your enforcement policy has no matching rule for a user. What happens?"</p><p>Strong answer: the default profile is applied. If it is Deny Access the request is rejected and the Access Tracker shows that no enforcement rule matched. Explain that this is why default deny is the safe design, and that you would add the correct role mapping and rule rather than loosen the default.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An enforcement policy selects profiles from rules, evaluated in order, plus a default profile.</li>
<li>Conditions usually read Tips:Role; other attributes (username, source, endpoint) are available.</li>
<li>First match stops at the first true rule; all matches collects every true rule.</li>
<li>Default deny turns unknown cases into visible rejects.</li>
<li>Profiles must exist before the policy can name them.</li>
</ul></div>
`,hi:`
<p>Guard room mein pinned security rulebook ko socho: "Agar visitor engineer hai to card type A do. Agar contractor hai to card type B. Baaki koi bhi: card nahi." Guard lines upar se padhta hai, pehli fit hone wali line par ruk jaata hai aur wahi karta hai jo likha hai. Koi line fit na ho to aakhri vakya (default) lagta hai. ClearPass mein <b>enforcement policy</b> yahi rulebook hai. Iska kaam request ke context se ek ya zyada <b>enforcement profiles</b> chunna hai.</p>

<h3>Policy ki anatomy</h3>
<p>GUI mein ise <b>Configuration &gt; Enforcement &gt; Policies</b> mein banate hain. Teen hisse matter karte hain:</p>
<ul>
<li><b>Enforcement type</b>. Wired aur wireless network access ke liye yeh RADIUS hai. Doosre types (TACACS+, application, web authentication, events) doosri services ke hain aur lab mein <b>simulate nahi</b> hote.</li>
<li><b>Default profile</b>, jo tab lagta hai jab koi rule match na kare. Access control ke liye safe default <b>[Deny Access Profile]</b> hai.</li>
<li>Ordered <b>rules</b> ki list. Har rule mein conditions (AND se jude set) aur apply karne ke liye ek ya zyada profiles hote hain.</li>
</ul>
<p>Policy ka ek evaluation algorithm bhi hota hai. <b>Select first match</b> pehle true rule par ruk jaata hai. <b>Select all matches</b> aage badhta rehta hai aur har true rule ke profiles collect karta hai. Wired access aam taur par first match use karta hai, kyunki switch port ko ek saaf jawab chahiye.</p>

<h3>Conditions kya dekh sakti hain</h3>
<p>Condition attribute, operator, value hoti hai, bilkul service rule ki tarah, lekin attribute namespaces zyada rich hote hain. Jo aap use karoge:</p>
<table class="cmp"><tr><th>Attribute</th><th>Matlab</th><th>Example</th></tr>
<tr><td>Tips:Role</td><td>Role mapping ne jo roles diye</td><td>Tips:Role EQUALS CONTRACTOR</td></tr>
<tr><td>Authentication:Username</td><td>Jis naam ne authenticate kiya</td><td>Authentication:Username EQUALS alice</td></tr>
<tr><td>Authentication:Source</td><td>Kaunse source ne identity prove ki</td><td>Authentication:Source EQUALS [Local User Repository]</td></tr>
<tr><td>Endpoint:Category</td><td>Endpoints Repository ka attribute</td><td>Endpoint:Category EQUALS Printer</td></tr>
<tr><td>Connection:NAD-IP-Address</td><td>Kaunse switch ne poocha</td><td>Connection:NAD-IP-Address EQUALS 10.20.99.2</td></tr></table>
<p>Asli product mein aur namespaces hain, jaise date aur time, aur OnGuard ke posture ya health results. <b>Posture aur profiling simulate nahi hote.</b> Lab mein operators hain EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, BELONGS_TO, NOT_BELONGS_TO, EXISTS, NOT_EXISTS aur MATCHES. Dhyan rakho ki user ke paas ek saath kai roles ho sakte hain, isliye Tips:Role EQUALS CONTRACTOR tab true hota hai jab CONTRACTOR roles mein ho, chahe [User Authenticated] bhi maujood ho.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Policy rules upar se neeche, default ke saath">
<rect x="20" y="14" width="400" height="40" rx="8" fill="#bbf7d0"/><text x="220" y="39" text-anchor="middle" class="svg-ink" font-size="13">1  if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE</text>
<rect x="20" y="62" width="400" height="40" rx="8" fill="#bbf7d0"/><text x="220" y="87" text-anchor="middle" class="svg-ink" font-size="13">2  if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR</text>
<rect x="20" y="110" width="400" height="40" rx="8" fill="#fed7aa"/><text x="220" y="135" text-anchor="middle" class="svg-ink" font-size="13">default: [Deny Access Profile]</text>
<line x1="450" y1="30" x2="450" y2="130" stroke="#64748b" stroke-width="2"/><polygon points="450,140 444,128 456,128" fill="#64748b"/>
<text x="470" y="40" class="svg-ink" font-size="13">upar se neeche padho</text><text x="470" y="70" class="svg-ink" font-size="13">pehla true rule</text><text x="470" y="88" class="svg-accent" font-size="13">jeetta hai aur ruk jaata hai</text><text x="470" y="125" class="svg-ink" font-size="13">rule nahi: default</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">Safe default deny hai. Permissive default har unknown user ko chupke se andar aane deta hai.</text>
</svg><p class="cap">Select first match: rules ka order logic ka hissa hai.</p></div>

<h3>Lab shell: EPOL-WIRED banana</h3>
<pre class="code"><span class="c">! Configuration &gt; Enforcement &gt; Policies (Lab shell on CPPM)</span>
configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]" algorithm first
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR
configuration enforcement policy show EPOL-WIRED</pre>
<pre class="out">Configuration &gt; Enforcement &gt; Policies
Policy: EPOL-WIRED   Evaluation: select first match   Default profile: <span class="hl">[Deny Access Profile]</span>
  1. if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
  2. if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR</pre>
<p>Lab output, layout representative hai. Rule mein do profiles comma se alag karke de sakte ho, jaise <code>then EP-EMPLOYEE,EP-LOGGING</code>. Rules end mein jodte hain, 1 se number hote hain, aur <code>rule remove N</code> ek ko hata deta hai. Rule ya default mein jo profile naam aaye woh pehle se exist karna chahiye, isliye policy se pehle profiles banao.</p>

<h3>Default ek security decision hai</h3>
<p>Default profile un sab users ke saath hota hai jinhe aapke rules ne predict nahi kiya: naya department, galat type hua attribute, missing directory group. [Deny Access Profile] inhe visible rejects bana deta hai jinhe Access Tracker enforcement alert se samjhata hai (lab mein code 9010, "No enforcement rule matched"). Jo default access de deta hai woh wahi galtiyan chupke se over-access bana deta hai. Kuch designs default mein restricted guest ya quarantine profile rakhte hain; yeh soch-samajh kar chuna gaya choice hai, aur woh aisa profile hona chahiye jo internal systems tak na pahunche.</p>

<h3>Achha rule kaise likhein</h3>
<ol>
<li>Raw attributes ke bajaye <b>Tips:Role</b> ko prefer karo. Translation role mapping pehle hi kar chuki hai.</li>
<li>Specific raho. Rule sirf ek jagah lagu ho to doosri condition jodo, jaise NAD address ya source.</li>
<li>Narrow rules ko broad rules se pehle rakho.</li>
<li>Catch-all (jo sabke liye true ho) ko kabhi kisi cheez ke upar mat rakho. "Baaki sab" ke liye default use karo.</li>
<li>Har role ke ek user se test karo, aur ek unknown user se bhi.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Upar [User Authenticated] ko Accept rule mein use karna. Rule mein aisa role likhna jo mapping kabhi produce nahi karti. Yeh bhoolna ki deleted profile ko refer karne wala rule error deta hai (lab mein code 9009). Testing ke baad permissive default chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default profile tab lagta hai jab <i>koi rule</i> match na ho. Yeh khud ek rule nahi hai aur list mein iski position nahi hoti. Saath hi: first-match algorithm mein sirf pehle matching rule ke profiles lagte hain, chahe baad ke rules bhi match karte ho.</p></div>

<div class="scn"><h4>Default jisne cleaner ko andar aane diya</h4><p>Pilot ke dauraan ek engineer ne policy default aisa profile rakha jo users ko employee role mein daal deta tha, "taaki koi atke nahi". Mahino baad audit mein pata chala ki band ho chuke directory group ke ek user ko ab bhi employee access mil raha tha. Group ab kisi role se map nahi hota tha, isliye koi rule match nahi hua aur default ne chupke se employee access de diya. Default ko deny kiya gaya, aur visitors ke liye alag guest rule banaya gaya.</p><p><b>Seekh:</b> default unknown ke liye policy hai. Use soch kar chuno.</p></div>

<div class="iv"><p class="q">"Aapki enforcement policy mein kisi user ke liye koi matching rule nahi hai. Kya hoga?"</p><p>Strong answer: default profile lagta hai. Agar woh Deny Access hai to request reject hoti hai aur Access Tracker dikhata hai ki koi enforcement rule match nahi hua. Samjhao ki isi wajah se default deny safe design hai, aur aap default dheela karne ke bajaye sahi role mapping aur rule jodoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enforcement policy order mein evaluate hone wale rules aur ek default profile se profiles chunti hai.</li>
<li>Conditions aam taur par Tips:Role padhti hain; username, source, endpoint jaise attributes bhi available hain.</li>
<li>First match pehle true rule par rukta hai; all matches har true rule collect karta hai.</li>
<li>Default deny unknown cases ko visible rejects bana deta hai.</li>
<li>Policy jin profiles ka naam le, woh pehle exist karne chahiye.</li>
</ul></div>
`}};export{e as default};