var e={id:`ordering`,h:{en:`Order matters: service order and policy order`,hi:`Order matter karta hai: service order aur policy order`},body:{en:`
<p>A queue at a bank has one rule: whoever stands first at the counter is served first. If a person with a small query stands in front and the counter staff say "I can help you", the person behind with a big cheque waits, even though the second counter was built for exactly that cheque. ClearPass has three queues like this, and each one is "first match wins": the <b>service list</b>, the <b>role mapping rules</b> and the <b>enforcement policy rules</b>. Most "mysterious" ClearPass tickets are simply one of these three queues in the wrong order.</p>

<h3>The three places where order decides</h3>
<table class="cmp"><tr><th>Where</th><th>What is ordered</th><th>What first match means</th><th>Typical fault</th></tr>
<tr><td>Service list</td><td>Services</td><td>The first service whose classification rules match handles the request</td><td>A loose test service above the production one</td></tr>
<tr><td>Role mapping (algorithm first)</td><td>Rules</td><td>The first true rule gives the only mapped role</td><td>A broad rule hiding a specific one</td></tr>
<tr><td>Enforcement policy (algorithm first)</td><td>Rules</td><td>The first true rule gives the profile; later rules are not read</td><td>A catch-all on [User Authenticated] at the top</td></tr></table>
<p>In the "all matches" algorithm the order matters less for which rules apply, but profiles are still collected in order, and conflicting attributes (for example two different Aruba-User-Role values) can make results unpredictable. For wired access, design for first match and for a single answer.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Wrong order versus right order">
<text x="150" y="20" text-anchor="middle" class="svg-accent" font-size="13">Wrong order</text><text x="490" y="20" text-anchor="middle" class="svg-accent" font-size="13">Right order</text>
<rect x="20" y="32" width="260" height="38" rx="8" fill="#fed7aa"/><text x="150" y="56" text-anchor="middle" class="svg-ink" font-size="13">1  catch-all: [User Authenticated] then EP-GUEST</text>
<rect x="20" y="78" width="260" height="38" rx="8" fill="#e2e8f0"/><text x="150" y="102" text-anchor="middle" class="svg-ink" font-size="13">2  ENGINEER then EP-EMPLOYEE</text>
<rect x="20" y="124" width="260" height="38" rx="8" fill="#e2e8f0"/><text x="150" y="148" text-anchor="middle" class="svg-ink" font-size="13">3  CONTRACTOR then EP-CONTRACTOR</text>
<rect x="360" y="32" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="490" y="56" text-anchor="middle" class="svg-ink" font-size="13">1  ENGINEER then EP-EMPLOYEE</text>
<rect x="360" y="78" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="490" y="102" text-anchor="middle" class="svg-ink" font-size="13">2  CONTRACTOR then EP-CONTRACTOR</text>
<rect x="360" y="124" width="260" height="38" rx="8" fill="#bae6fd"/><text x="490" y="148" text-anchor="middle" class="svg-ink" font-size="13">default: [Deny Access Profile]</text>
<text x="150" y="186" text-anchor="middle" class="svg-muted" font-size="12">rules 2 and 3 are never read</text><text x="490" y="186" text-anchor="middle" class="svg-muted" font-size="12">specific first, catch-all via default</text>
</svg><p class="cap">The same three rules. In the left list the first one is true for everybody, so the other two are dead code.</p></div>

<h3>Lab cp-service-order: a test service steals the requests</h3>
<p>After a pilot, somebody left the service <b>Wired Allow-All Test</b> above <b>Wired 802.1X</b>. Both were made from the wired 802.1X template, so their classification rules are identical. Every wired login matches the test service first, runs its policy (default profile EP-GUEST) and lands in GUEST. Production roles are never evaluated.</p>
<p><b>Step 1, find the service that actually ran.</b> GUI: Access Tracker, open the record, Summary tab, field Service. Lab shell:</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
monitoring access-tracker detail latest summary
configuration service show</pre>
<pre class="out">Summary
-------
  Username                  : alice
  Service                   : <span class="hl">Wired Allow-All Test</span>
  Roles                     : [User Authenticated]
  Enforcement Profiles      : EP-GUEST

Configuration &gt; Services (evaluated in this order; first match wins)
#  Name                  Status   Rules
-  --------------------  -------  -----------------------------------------------
1  <span class="hl">Wired Allow-All Test</span>  Enabled  Radius:IETF:NAS-Port-Type EQUALS 15 ; Radius:IETF:Service-Type BELONGS_TO 1,2,8
2  Wired 802.1X          Enabled  Radius:IETF:NAS-Port-Type EQUALS 15 ; Radius:IETF:Service-Type BELONGS_TO 1,2,8</pre>
<p>Lab output, representative of the layout (built-in services follow below in the real list). Identical rules, wrong order.</p>
<p><b>Step 2, fix the order.</b> GUI: Configuration &gt; Services, Reorder, move Wired 802.1X to position 1; or disable or delete the test service, which is the cleaner answer once the pilot is over. Lab shell: <code>configuration service "Wired 802.1X" order 1</code> (or <code>configuration service "Wired Allow-All Test" disable</code>).</p>
<p><b>Step 3, force a new authentication.</b> The users are already connected in GUEST. Changing the order does nothing to a live session. Bounce the client ports on the switch with <code>interface 1/1/3-1/1/4</code> then <code>shutdown</code>, then <code>no shutdown</code>, and prove with <code>show port-access clients</code> that alice is EMPLOYEE and bob CONTRACTOR.</p>

<h3>Lab cp-policy-order: everyone gets the guest profile</h3>
<p>Service, role mapping and roles are right, yet every authenticated user lands in GUEST. Read the policy.</p>
<pre class="out">Policy: EPOL-WIRED   Evaluation: select first match   Default profile: [Deny Access Profile]
  1. if Tips:Role EQUALS <span class="hl">[User Authenticated]</span> then <span class="hl">EP-GUEST</span>
  2. if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
  3. if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR</pre>
<p>Rule 1 is true for every authenticated user, so evaluation stops there. The Output tab of a record confirms it: profile EP-GUEST, role attribute GUEST. The fix is to remove the catch-all from the front: <code>configuration enforcement policy EPOL-WIRED rule remove 1</code>. After the removal, the former rules 2 and 3 become 1 and 2: rule numbers change when you delete, so always show the policy again before removing another rule. Then bounce the ports and prove EMPLOYEE in VLAN 10 and CONTRACTOR in VLAN 20.</p>
<p>If you really want a guest fallback for authenticated users who match no role, express it with the policy default (set to the guest profile) or place the catch-all <b>last</b>, never first. A deny default is still the safer choice for most sites.</p>

<h3>Design rules that prevent order bugs</h3>
<ol>
<li>Specific before general, in every list.</li>
<li>Use the default instead of a trailing catch-all.</li>
<li>Give test services names that say test, narrow rules (one NAD address), and an owner. Disable them after the pilot.</li>
<li>After any edit, re-read the whole list, not only the line you changed.</li>
<li>After any enforcement change, make the client authenticate again before you judge the result.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Fixing the order but not re-authenticating. Removing "rule 1" twice and deleting a good rule because the numbers shifted. Disabling the production service instead of the test one. Believing a first-match rule list is read as a whole.</p></div>
<div class="exam"><p><b>Exam trap.</b> A catch-all condition such as Tips:Role EQUALS [User Authenticated] is true for every authenticated user. In a first-match policy it must never come before specific rules. Also, a change to order or rules does not affect a session that is already authorized.</p></div>

<div class="scn"><h4>Friday pilot, Monday outage</h4><p>On Friday a colleague tested a new wired flow with a copy of the production service and left it at the top of the list "for the weekend". On Monday morning every employee landed in the guest VLAN and could not reach the application server. The Access Tracker summary showed the service name for every request. Disabling the test service and bouncing the access ports restored all users in minutes.</p><p><b>Lesson:</b> test objects live below production or are disabled the same day, and the Summary tab tells you which service ran.</p></div>

<div class="iv"><p class="q">"Every user suddenly lands in the guest profile. Where do you look?"</p><p>Strong answer: Summary tab to see which service handled the request, then Roles and Profiles lines, then the enforcement policy order for a catch-all rule above the specific ones, then the Output tab for the attributes sent. Fix the order, make clients authenticate again, verify on the switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three lists use first match: services, role mapping rules and enforcement rules.</li>
<li>A loose service or catch-all rule placed first hides everything below it.</li>
<li>Read the Summary tab to see which service ran; read the policy to see rule order.</li>
<li>Rule numbers shift after a removal; re-show before the next one.</li>
<li>Changes apply at the next authentication; bounce or reauthorize to test.</li>
</ul></div>
`,hi:`
<p>Bank ki queue ka ek hi rule hota hai: jo counter par pehle khada hai usse pehle serve kiya jaata hai. Agar chhoti query wala aadmi aage khada ho aur counter staff bole "main aapki madad kar sakta hoon", to peeche bade cheque wala wait karta rehta hai, chahe doosra counter usi cheque ke liye bana ho. ClearPass mein aisi teen queues hain, aur har ek "first match wins" hai: <b>service list</b>, <b>role mapping rules</b> aur <b>enforcement policy rules</b>. Zyada tar "mysterious" ClearPass tickets in teen queues mein se ek ka galat order hote hain.</p>

<h3>Teen jagah jahan order decide karta hai</h3>
<table class="cmp"><tr><th>Kahan</th><th>Kya ordered hai</th><th>First match ka matlab</th><th>Typical fault</th></tr>
<tr><td>Service list</td><td>Services</td><td>Pehli service jiske classification rules match karein request handle karti hai</td><td>Production se upar loose test service</td></tr>
<tr><td>Role mapping (algorithm first)</td><td>Rules</td><td>Pehla true rule akela mapped role deta hai</td><td>Broad rule jo specific ko chhupa de</td></tr>
<tr><td>Enforcement policy (algorithm first)</td><td>Rules</td><td>Pehla true rule profile deta hai; baad ke rules padhe nahi jaate</td><td>Sabse upar [User Authenticated] par catch-all</td></tr></table>
<p>"All matches" algorithm mein kaunse rules lagu hon is par order kam matter karta hai, lekin profiles phir bhi order mein collect hote hain, aur conflicting attributes (jaise do alag Aruba-User-Role values) result ko unpredictable bana sakte hain. Wired access ke liye first match aur ek hi jawab ke hisaab se design karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Galat order versus sahi order">
<text x="150" y="20" text-anchor="middle" class="svg-accent" font-size="13">Galat order</text><text x="490" y="20" text-anchor="middle" class="svg-accent" font-size="13">Sahi order</text>
<rect x="20" y="32" width="260" height="38" rx="8" fill="#fed7aa"/><text x="150" y="56" text-anchor="middle" class="svg-ink" font-size="13">1  catch-all: [User Authenticated] then EP-GUEST</text>
<rect x="20" y="78" width="260" height="38" rx="8" fill="#e2e8f0"/><text x="150" y="102" text-anchor="middle" class="svg-ink" font-size="13">2  ENGINEER then EP-EMPLOYEE</text>
<rect x="20" y="124" width="260" height="38" rx="8" fill="#e2e8f0"/><text x="150" y="148" text-anchor="middle" class="svg-ink" font-size="13">3  CONTRACTOR then EP-CONTRACTOR</text>
<rect x="360" y="32" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="490" y="56" text-anchor="middle" class="svg-ink" font-size="13">1  ENGINEER then EP-EMPLOYEE</text>
<rect x="360" y="78" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="490" y="102" text-anchor="middle" class="svg-ink" font-size="13">2  CONTRACTOR then EP-CONTRACTOR</text>
<rect x="360" y="124" width="260" height="38" rx="8" fill="#bae6fd"/><text x="490" y="148" text-anchor="middle" class="svg-ink" font-size="13">default: [Deny Access Profile]</text>
<text x="150" y="186" text-anchor="middle" class="svg-muted" font-size="12">rules 2 aur 3 kabhi padhe nahi jaate</text><text x="490" y="186" text-anchor="middle" class="svg-muted" font-size="12">specific pehle, catch-all default se</text>
</svg><p class="cap">Wahi teen rules. Left list mein pehla rule sabke liye true hai, isliye baaki do dead code hain.</p></div>

<h3>Lab cp-service-order: test service requests chura leti hai</h3>
<p>Pilot ke baad kisi ne service <b>Wired Allow-All Test</b> ko <b>Wired 802.1X</b> ke upar chhod diya. Dono wired 802.1X template se bani thi, isliye unke classification rules identical hain. Har wired login pehle test service se match hota hai, uski policy (default profile EP-GUEST) chalata hai aur GUEST mein land karta hai. Production roles kabhi evaluate hi nahi hote.</p>
<p><b>Step 1, jo service asal mein chali use dhundo.</b> GUI: Access Tracker, record kholo, Summary tab, field Service. Lab shell:</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
monitoring access-tracker detail latest summary
configuration service show</pre>
<pre class="out">Summary
-------
  Username                  : alice
  Service                   : <span class="hl">Wired Allow-All Test</span>
  Roles                     : [User Authenticated]
  Enforcement Profiles      : EP-GUEST

Configuration &gt; Services (evaluated in this order; first match wins)
#  Name                  Status   Rules
-  --------------------  -------  -----------------------------------------------
1  <span class="hl">Wired Allow-All Test</span>  Enabled  Radius:IETF:NAS-Port-Type EQUALS 15 ; Radius:IETF:Service-Type BELONGS_TO 1,2,8
2  Wired 802.1X          Enabled  Radius:IETF:NAS-Port-Type EQUALS 15 ; Radius:IETF:Service-Type BELONGS_TO 1,2,8</pre>
<p>Lab output, layout representative hai (asli list mein built-in services neeche aate hain). Rules identical, order galat.</p>
<p><b>Step 2, order theek karo.</b> GUI: Configuration &gt; Services, Reorder, Wired 802.1X ko position 1 par lao; ya test service ko disable ya delete karo, jo pilot khatam hone par saaf jawab hai. Lab shell: <code>configuration service "Wired 802.1X" order 1</code> (ya <code>configuration service "Wired Allow-All Test" disable</code>).</p>
<p><b>Step 3, nayi authentication force karo.</b> Users already GUEST mein connected hain. Order badalne se live session par kuch asar nahi padta. Switch par client ports bounce karo: <code>interface 1/1/3-1/1/4</code> phir <code>shutdown</code>, phir <code>no shutdown</code>, aur <code>show port-access clients</code> se prove karo ki alice EMPLOYEE aur bob CONTRACTOR hai.</p>

<h3>Lab cp-policy-order: sabko guest profile mil raha hai</h3>
<p>Service, role mapping aur roles sahi hain, phir bhi har authenticated user GUEST mein land karta hai. Policy padho.</p>
<pre class="out">Policy: EPOL-WIRED   Evaluation: select first match   Default profile: [Deny Access Profile]
  1. if Tips:Role EQUALS <span class="hl">[User Authenticated]</span> then <span class="hl">EP-GUEST</span>
  2. if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
  3. if Tips:Role EQUALS CONTRACTOR then EP-CONTRACTOR</pre>
<p>Rule 1 har authenticated user ke liye true hai, isliye evaluation wahin ruk jaata hai. Record ka Output tab confirm karta hai: profile EP-GUEST, role attribute GUEST. Fix hai catch-all ko aage se hatana: <code>configuration enforcement policy EPOL-WIRED rule remove 1</code>. Hatane ke baad purane rules 2 aur 3 ab 1 aur 2 ban jaate hain: delete karne par rule numbers badal jaate hain, isliye doosra rule remove karne se pehle policy dobara show karo. Phir ports bounce karo aur prove karo EMPLOYEE VLAN 10 mein aur CONTRACTOR VLAN 20 mein.</p>
<p>Agar aap sach mein un authenticated users ke liye guest fallback chahte ho jo kisi role se match nahi karte, to use policy default (guest profile par set) se express karo ya catch-all ko <b>aakhir</b> mein rakho, kabhi pehle nahi. Zyada tar sites ke liye deny default phir bhi safer hai.</p>

<h3>Design rules jo order bugs rokte hain</h3>
<ol>
<li>Har list mein specific pehle, general baad mein.</li>
<li>Trailing catch-all ke bajaye default use karo.</li>
<li>Test services ke naam mein test likho, rules narrow rakho (ek NAD address), aur ek owner do. Pilot ke baad disable karo.</li>
<li>Har edit ke baad poori list dobara padho, sirf badli hui line nahi.</li>
<li>Har enforcement change ke baad result judge karne se pehle client ko dobara authenticate karwao.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Order theek karna lekin re-authenticate na karna. "Rule 1" do baar remove karke ek achha rule delete kar dena kyunki numbers shift ho gaye. Test ke bajaye production service ko disable kar dena. Yeh maan lena ki first-match rule list poori padhi jaati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tips:Role EQUALS [User Authenticated] jaisi catch-all condition har authenticated user ke liye true hai. First-match policy mein woh specific rules se pehle kabhi nahi aani chahiye. Saath hi, order ya rules ka change us session ko affect nahi karta jo pehle se authorized hai.</p></div>

<div class="scn"><h4>Friday ka pilot, Monday ka outage</h4><p>Friday ko ek colleague ne production service ki copy se naya wired flow test kiya aur use "weekend ke liye" list ke sabse upar chhod diya. Monday subah har employee guest VLAN mein land hua aur application server tak nahi pahunch paaya. Access Tracker summary ne har request par service ka naam dikhaya. Test service disable karne aur access ports bounce karne se kuch minute mein saare users restore ho gaye.</p><p><b>Seekh:</b> test objects production ke neeche rehte hain ya usi din disable ho jaate hain, aur Summary tab batata hai kaunsi service chali.</p></div>

<div class="iv"><p class="q">"Achanak har user guest profile mein land kar raha hai. Aap kahan dekhoge?"</p><p>Strong answer: Summary tab se dekho request kaunsi service ne handle ki, phir Roles aur Profiles lines, phir enforcement policy ka order dekho ki specific rules ke upar catch-all to nahi, phir bheje gaye attributes ke liye Output tab. Order fix karo, clients ko dobara authenticate karwao, switch par verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen lists first match use karti hain: services, role mapping rules aur enforcement rules.</li>
<li>Pehle rakhi loose service ya catch-all rule apne neeche sab kuch chhupa deti hai.</li>
<li>Kaunsi service chali yeh Summary tab se padho; rule order policy se padho.</li>
<li>Removal ke baad rule numbers shift hote hain; agle se pehle dobara show karo.</li>
<li>Changes agli authentication par lagte hain; test ke liye bounce ya reauthorize karo.</li>
</ul></div>
`}};export{e as default};