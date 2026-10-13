var e={id:`policy-chain`,h:{en:`The ClearPass decision chain for wired logins`,hi:`Wired logins ke liye ClearPass ki decision chain`},body:{en:`
<p>Picture an airport. First the officer checks that your <b>flight is real</b> (is this a known network device?). Then you are sent to the right <b>counter</b> (service). The counter checks your <b>passport</b> (authentication), looks up your <b>status</b> (role mapping), and finally prints a <b>boarding pass with a gate</b> (enforcement profile). ClearPass handles every wired request in exactly this order.</p>

<h3>The six stages</h3>
<ol>
<li><b>Network device check.</b> The RADIUS packet source IP must match a configured network device, and the shared secret is checked for that device. Unknown device or wrong secret: the packet is silently dropped. You see it in the Event Viewer, not in the Access Tracker.</li>
<li><b>Service classification.</b> Services are evaluated top to bottom, first match wins, using rules on attributes such as <code>Radius:IETF:NAS-Port-Type</code> and <code>Radius:IETF:Service-Type</code>. No match is error 9002 "Failed to classify request to service".</li>
<li><b>Authentication.</b> The service lists methods ([EAP PEAP], [MAC AUTH]) and sources ([Local User Repository], [Endpoints Repository]). Wrong password is alert 215, unknown user or endpoint 216, disabled account 217.</li>
<li><b>Authorization and role mapping.</b> A role-mapping policy converts attributes such as <code>Local:Department</code> or <code>Endpoint:Category</code> into ClearPass roles, first match or all matches, with a default role.</li>
<li><b>Enforcement.</b> The enforcement policy chooses one or more enforcement profiles using conditions such as <code>Tips:Role</code> or <code>Authentication:Username</code>. If no rule matches, the default profile applies; [Deny Access Profile] rejects.</li>
<li><b>Response.</b> The RADIUS enforcement profile returns attributes to the switch.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ClearPass six stages">
<rect x="8" y="30" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Network</text><text x="55" y="72" text-anchor="middle" class="svg-ink" font-size="12">device</text>
<rect x="112" y="30" width="95" height="60" rx="8" fill="#bae6fd"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Service</text><text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">first match</text>
<rect x="216" y="30" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="264" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Authen-</text><text x="264" y="72" text-anchor="middle" class="svg-ink" font-size="12">tication</text>
<rect x="320" y="30" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="368" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Role</text><text x="368" y="72" text-anchor="middle" class="svg-ink" font-size="12">mapping</text>
<rect x="424" y="30" width="95" height="60" rx="8" fill="#fde68a"/><text x="472" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Enforce-</text><text x="472" y="72" text-anchor="middle" class="svg-ink" font-size="12">ment</text>
<rect x="528" y="30" width="95" height="60" rx="8" fill="#fed7aa"/><text x="576" y="55" text-anchor="middle" class="svg-ink" font-size="12">6 Response</text><text x="576" y="72" text-anchor="middle" class="svg-muted" font-size="12">attributes</text>
<text x="55" y="115" text-anchor="middle" class="svg-muted" font-size="12">dropped</text><text x="160" y="115" text-anchor="middle" class="svg-muted" font-size="12">9002</text><text x="264" y="115" text-anchor="middle" class="svg-muted" font-size="12">215 216 217</text><text x="368" y="115" text-anchor="middle" class="svg-muted" font-size="12">default role</text><text x="472" y="115" text-anchor="middle" class="svg-muted" font-size="12">default profile</text><text x="576" y="115" text-anchor="middle" class="svg-muted" font-size="12">Role or VLAN</text>
<text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">Under each stage: how it fails</text>
</svg><p class="cap">Every wired request walks these six stages in order; each has its own failure signature.</p></div>

<h3>Where it lives in the GUI</h3>
<table class="cmp"><tr><th>Object</th><th>Real GUI path (Policy Manager)</th></tr>
<tr><td>Network device</td><td>Configuration &gt; Network &gt; Devices</td></tr>
<tr><td>Local user, endpoint, role, role mapping</td><td>Configuration &gt; Identity &gt; ...</td></tr>
<tr><td>Enforcement profile and policy</td><td>Configuration &gt; Enforcement &gt; Profiles / Policies</td></tr>
<tr><td>Service</td><td>Configuration &gt; Services</td></tr>
<tr><td>Access Tracker, Event Viewer</td><td>Monitoring &gt; Live Monitoring / Event Viewer</td></tr></table>
<p>The web GUI and its publisher and subscriber cluster are <b>not simulated in the lab</b>; the shell below uses the same words as the menu path.</p>

<h3>Building the chain (Lab shell)</h3>
<p>The ClearPass objects must be built from the bottom up, because each one refers to the one below it. A role-mapping policy that exists but is not bound to the service does nothing. Here is the wired chain from the lab, bottom-up:</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration identity role add ENGINEER
configuration identity role-mapping add RM-WIRED default "[Other]"
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Engineering then ENGINEER
configuration enforcement profile add EP-EMPLOYEE type radius
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE
configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]"
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
configuration service "Wired 802.1X" role-mapping RM-WIRED
configuration service "Wired 802.1X" enforcement-policy EPOL-WIRED</pre>
<p>In the real GUI you would add the same rules in the Role Mapping and Enforcement Policy editors. The pieces you click are named identically.</p>

<h3>Reading the record</h3>
<p>Every request leaves a record in the Access Tracker with four tabs: Summary, Input, Output and Alerts.</p>
<pre class="out">Access Tracker  record 1
Summary
  Service           : Wired 802.1X
  Auth method       : EAP PEAP
  Auth source       : Local User Repository
  Roles             : ENGINEER, [User Authenticated]
  Enforcement       : EP-EMPLOYEE
  Result            : ACCEPT
Output
  <span class="hl">Radius:Aruba:Aruba-User-Role = EMPLOYEE</span></pre>
<p>Read it left to right like the chain: service, method, roles, profile, attribute. A wrong value tells you which stage went wrong.</p>

<div class="eg"><p><b>Worked example.</b> Alice has Department Engineering. RM-WIRED rule maps Engineering to ENGINEER. EPOL-WIRED rule says role ENGINEER gets EP-EMPLOYEE. EP-EMPLOYEE returns Aruba-User-Role EMPLOYEE. Bob has Department Contractor; no rule matches, the role is the default, and the policy falls to its default, which is deny. Bob is rejected even though his password is right. That is correct behaviour: authentication succeeded, authorization did not.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting a catch-all rule such as role [User Authenticated] first in a first-match policy. Everything matches it and falls to one profile. Specific rules first, general rules last.</p></div>

<div class="exam"><p><b>Exam trap.</b> Role mapping and enforcement are two separate steps. The role is a ClearPass internal label; the Aruba-User-Role value is a switch-side name. They can be spelled alike by habit, but they are not the same object.</p></div>

<div class="scn"><h4>Test service above production</h4><p>After a pilot, a test service named Allow-All was left above the real wired service. Because the first match wins, every wired login hit the test service and landed in a guest role. Access Tracker Summary showed the wrong service name immediately. Moving the production service to the top and bouncing the ports fixed it.</p><p><b>Lesson:</b> check which service ran before checking anything else.</p></div>

<div class="iv"><p class="q">"What is the difference between a role and an enforcement profile in ClearPass?"</p><p>Strong answer: a role is a classification of the identity, derived from attributes by role mapping. An enforcement profile is the action: the attributes returned to the NAD. The enforcement policy connects them with conditions such as Tips:Role. This lets you change what a group receives without touching how people are classified.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Six stages: device, service, authentication, role mapping, enforcement, response.</li>
<li>Services are first match; policies can be first match or all matches.</li>
<li>Alerts 215, 216 and 217 are password, unknown, disabled; 9002 is no service.</li>
<li>Build bottom-up and bind objects to the service.</li>
<li>Read Summary then Output to see which stage decided.</li>
</ul></div>
`,hi:`
<p>Ek airport socho. Pehle officer check karta hai ki aapki <b>flight real hai</b> (kya yeh known network device hai?). Phir aapko sahi <b>counter</b> (service) par bheja jaata hai. Counter aapka <b>passport</b> (authentication) check karta hai, aapka <b>status</b> (role mapping) dekhta hai, aur aakhir mein <b>gate ke saath boarding pass</b> (enforcement profile) print karta hai. ClearPass har wired request ko isi order mein handle karta hai.</p>

<h3>Chhe stages</h3>
<ol>
<li><b>Network device check.</b> RADIUS packet ka source IP configured network device se match hona chahiye, aur us device ke liye shared secret check hota hai. Unknown device ya galat secret: packet silently drop hota hai. Aap use Event Viewer mein dekhte ho, Access Tracker mein nahi.</li>
<li><b>Service classification.</b> Services upar se neeche evaluate hoti hain, first match jeetta hai, <code>Radius:IETF:NAS-Port-Type</code> aur <code>Radius:IETF:Service-Type</code> jaise attributes ke rules se. Match na hone par error 9002 "Failed to classify request to service" aata hai.</li>
<li><b>Authentication.</b> Service methods ([EAP PEAP], [MAC AUTH]) aur sources ([Local User Repository], [Endpoints Repository]) list karti hai. Galat password alert 215, unknown user ya endpoint 216, disabled account 217.</li>
<li><b>Authorization aur role mapping.</b> Role-mapping policy <code>Local:Department</code> ya <code>Endpoint:Category</code> jaise attributes ko ClearPass roles mein badalti hai, first match ya all matches, default role ke saath.</li>
<li><b>Enforcement.</b> Enforcement policy <code>Tips:Role</code> ya <code>Authentication:Username</code> jaisi conditions se ek ya zyada enforcement profiles chunti hai. Koi rule match na kare to default profile lagta hai; [Deny Access Profile] reject karta hai.</li>
<li><b>Response.</b> RADIUS enforcement profile attributes switch ko wapas bhejta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ClearPass six stages">
<rect x="8" y="30" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Network</text><text x="55" y="72" text-anchor="middle" class="svg-ink" font-size="12">device</text>
<rect x="112" y="30" width="95" height="60" rx="8" fill="#bae6fd"/><text x="160" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Service</text><text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">first match</text>
<rect x="216" y="30" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="264" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Authen-</text><text x="264" y="72" text-anchor="middle" class="svg-ink" font-size="12">tication</text>
<rect x="320" y="30" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="368" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Role</text><text x="368" y="72" text-anchor="middle" class="svg-ink" font-size="12">mapping</text>
<rect x="424" y="30" width="95" height="60" rx="8" fill="#fde68a"/><text x="472" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Enforce-</text><text x="472" y="72" text-anchor="middle" class="svg-ink" font-size="12">ment</text>
<rect x="528" y="30" width="95" height="60" rx="8" fill="#fed7aa"/><text x="576" y="55" text-anchor="middle" class="svg-ink" font-size="12">6 Response</text><text x="576" y="72" text-anchor="middle" class="svg-muted" font-size="12">attributes</text>
<text x="55" y="115" text-anchor="middle" class="svg-muted" font-size="12">dropped</text><text x="160" y="115" text-anchor="middle" class="svg-muted" font-size="12">9002</text><text x="264" y="115" text-anchor="middle" class="svg-muted" font-size="12">215 216 217</text><text x="368" y="115" text-anchor="middle" class="svg-muted" font-size="12">default role</text><text x="472" y="115" text-anchor="middle" class="svg-muted" font-size="12">default profile</text><text x="576" y="115" text-anchor="middle" class="svg-muted" font-size="12">Role ya VLAN</text>
<text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">Har stage ke neeche: woh kaise fail hota hai</text>
</svg><p class="cap">Har wired request in chhe stages se order mein guzarti hai; har ek ka apna failure signature hai.</p></div>

<h3>GUI mein kahan hai</h3>
<table class="cmp"><tr><th>Object</th><th>Real GUI path (Policy Manager)</th></tr>
<tr><td>Network device</td><td>Configuration &gt; Network &gt; Devices</td></tr>
<tr><td>Local user, endpoint, role, role mapping</td><td>Configuration &gt; Identity &gt; ...</td></tr>
<tr><td>Enforcement profile aur policy</td><td>Configuration &gt; Enforcement &gt; Profiles / Policies</td></tr>
<tr><td>Service</td><td>Configuration &gt; Services</td></tr>
<tr><td>Access Tracker, Event Viewer</td><td>Monitoring &gt; Live Monitoring / Event Viewer</td></tr></table>
<p>Web GUI aur uska publisher aur subscriber cluster <b>not simulated in the lab</b> hain; neeche ka shell menu path ke wahi shabd use karta hai.</p>

<h3>Chain banana (Lab shell)</h3>
<p>ClearPass objects neeche se upar banane chahiye, kyunki har ek neeche wale ko refer karta hai. Role-mapping policy jo exist karti hai par service se bound nahi hai, kuch nahi karti. Wired side ka pattern yeh hai:</p>
<pre class="code"><span class="c">! Lab shell on CPPM</span>
configuration identity role add ENGINEER
configuration identity role-mapping add RM-WIRED default "[Other]"
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Engineering then ENGINEER
configuration enforcement profile add EP-EMPLOYEE type radius
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE
configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]"
configuration enforcement policy EPOL-WIRED rule add if Tips:Role EQUALS ENGINEER then EP-EMPLOYEE
configuration service "Wired 802.1X" role-mapping RM-WIRED
configuration service "Wired 802.1X" enforcement-policy EPOL-WIRED</pre>
<p>Real GUI mein aap yehi rules Role Mapping aur Enforcement Policy editors mein add karoge. Jo pieces aap click karte ho unke naam bilkul same hain.</p>

<h3>Record padhna</h3>
<p>Har request Access Tracker mein record chhodti hai jisme chaar tabs hain: Summary, Input, Output aur Alerts.</p>
<pre class="out">Access Tracker  record 1
Summary
  Service           : Wired 802.1X
  Auth method       : EAP PEAP
  Auth source       : Local User Repository
  Roles             : ENGINEER, [User Authenticated]
  Enforcement       : EP-EMPLOYEE
  Result            : ACCEPT
Output
  <span class="hl">Radius:Aruba:Aruba-User-Role = EMPLOYEE</span></pre>
<p>Ise chain ki tarah left to right padho: service, method, roles, profile, attribute. Galat value batati hai ki kaunsa stage galat gaya.</p>

<div class="eg"><p><b>Worked example.</b> Alice ka Department Engineering hai. RM-WIRED rule Engineering ko ENGINEER se map karta hai. EPOL-WIRED rule kehta hai role ENGINEER ko EP-EMPLOYEE milega. EP-EMPLOYEE Aruba-User-Role EMPLOYEE return karta hai. Bob ka Department Contractor hai; koi rule match nahi hota, role default rehta hai, aur policy apne default par girti hai jo deny hai. Bob ka password sahi hone par bhi woh reject hota hai. Yeh sahi behaviour hai: authentication succeed hua, authorization nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> First-match policy mein [User Authenticated] role jaisa catch-all rule sabse pehle rakhna. Sab kuch use match karta hai aur ek hi profile par jaata hai. Specific rules pehle, general rules aakhir mein.</p></div>

<div class="exam"><p><b>Exam trap.</b> Role mapping aur enforcement do alag steps hain. Role ClearPass ka internal label hai; Aruba-User-Role value switch-side naam hai. Aadat se dono ki spelling same rakhi ja sakti hai, par yeh same object nahi hain.</p></div>

<div class="scn"><h4>Production ke upar test service</h4><p>Pilot ke baad Allow-All naam ki test service real wired service ke upar chhod di gayi. First match jeetta hai, isliye har wired login test service par gaya aur guest role mein pahunchi Access Tracker Summary ne turant galat service ka naam dikha diya. Production service ko upar le jaakar ports bounce karne se theek hua.</p><p><b>Seekh:</b> kuch bhi check karne se pehle dekho ki kaunsi service chali.</p></div>

<div class="iv"><p class="q">"ClearPass mein role aur enforcement profile ka fark kya hai?"</p><p>Strong answer: role identity ki classification hai, jo role mapping attributes se nikalti hai. Enforcement profile action hai: NAD ko wapas bheje gaye attributes. Enforcement policy dono ko Tips:Role jaisi conditions se jodti hai. Isse aap kisi group ko kya milta hai badal sakte ho bina classification chhue.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe stages: device, service, authentication, role mapping, enforcement, response.</li>
<li>Services first match hoti hain; policies first match ya all matches ho sakti hain.</li>
<li>Alerts 215, 216, 217 matlab password, unknown, disabled; 9002 matlab koi service nahi.</li>
<li>Bottom-up build karo aur objects ko service se bind karo.</li>
<li>Summary phir Output padho taaki dikhe kaunsa stage decide kiya.</li>
</ul></div>
`}};export{e as default};