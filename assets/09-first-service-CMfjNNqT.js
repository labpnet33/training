var e={id:`first-service`,h:{en:`Build your first complete service (lab cp-first-service)`,hi:`Apni pehli complete service banao (lab cp-first-service)`},body:{en:`
<p>You now know every part. In this chapter you put them together in the right order and test the result. This is the lab <b>cp-first-service</b>. The trust from chapter 4 already exists: ACCESS is a registered network device and the request reaches ClearPass, but there is no policy, so alice is rejected with error 9002.</p>

<h3>Analogy: opening a new office counter</h3>
<p>To open a new service counter you first hire the clerk (the user), print the standard form (the profile), write the rule sheet (the policy), and finally put up the sign above the counter (the service). If you put up the sign first, customers arrive and find an empty counter. Build from the bottom up: ingredients first, service last.</p>

<h3>The build order</h3>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Build order">
<rect x="10" y="40" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="68" text-anchor="middle" class="svg-ink" font-size="13">1 User</text><text x="70" y="88" text-anchor="middle" class="svg-muted" font-size="11">alice</text>
<rect x="150" y="40" width="120" height="70" rx="8" fill="#fde68a"/><text x="210" y="68" text-anchor="middle" class="svg-ink" font-size="13">2 Profile</text><text x="210" y="88" text-anchor="middle" class="svg-muted" font-size="11">EP-EMPLOYEE</text>
<rect x="290" y="40" width="120" height="70" rx="8" fill="#fed7aa"/><text x="350" y="68" text-anchor="middle" class="svg-ink" font-size="13">3 Policy</text><text x="350" y="88" text-anchor="middle" class="svg-muted" font-size="11">EPOL-WIRED</text>
<rect x="430" y="40" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="490" y="68" text-anchor="middle" class="svg-ink" font-size="13">4 Service</text><text x="490" y="88" text-anchor="middle" class="svg-muted" font-size="11">Wired 802.1X</text>
<rect x="570" y="40" width="64" height="70" rx="8" fill="#bbf7d0"/><text x="602" y="68" text-anchor="middle" class="svg-ink" font-size="13">5 Role</text><text x="602" y="88" text-anchor="middle" class="svg-muted" font-size="11">switch</text>
<line x1="130" y1="75" x2="150" y2="75" stroke="#64748b" stroke-width="2"/><line x1="270" y1="75" x2="290" y2="75" stroke="#64748b" stroke-width="2"/><line x1="410" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/><line x1="550" y1="75" x2="570" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Then test: LAPTOP1 authenticates and reaches APP1</text>
</svg><p class="cap">Create the pieces first, then the service that uses them, then the matching switch role.</p></div>

<h3>Step 1: the user (Lab shell)</h3>
<p>Real GUI: Configuration, Identity, Local Users, Add. Enter User ID alice, a password, and an attribute Department with value Engineering.</p>
<pre class="code">configuration identity local-user add alice password Pass@2024 attr Department=Engineering</pre>

<h3>Step 2: the enforcement profile</h3>
<p>Real GUI: Configuration, Enforcement, Profiles, Add, template Aruba RADIUS Enforcement, attribute Radius:Aruba:Aruba-User-Role = EMPLOYEE.</p>
<pre class="code">configuration enforcement profile add EP-EMPLOYEE type radius
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE</pre>

<h3>Step 3: the enforcement policy</h3>
<p>Real GUI: Configuration, Enforcement, Policies, Add; default profile [Deny Access Profile]; one rule on Authentication:Username.</p>
<pre class="code">configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]"
configuration enforcement policy EPOL-WIRED rule add if Authentication:Username EQUALS alice then EP-EMPLOYEE</pre>

<h3>Step 4: the service</h3>
<p>Real GUI: Configuration, Services, Add, type Aruba 802.1X Wired. On the Enforcement tab choose the policy EPOL-WIRED.</p>
<pre class="code">configuration service add "Wired 802.1X" template wired-802.1x
configuration service "Wired 802.1X" enforcement-policy EPOL-WIRED
configuration service "Wired 802.1X" show</pre>
<pre class="out">Service: Wired 802.1X   enabled   order 1
  Rules (match ALL):
    Radius:IETF:NAS-Port-Type   EQUALS      15
    Radius:IETF:Service-Type    BELONGS_TO  1,2,8
  Auth methods : [EAP PEAP]
  Auth sources : [Local User Repository]
  Enforcement  : <span class="hl">EPOL-WIRED</span></pre>

<h3>Step 5: the role on the switch</h3>
<p>A role name returned by ClearPass is only a promise. The switch must define it. On ACCESS (real AOS-CX style syntax):</p>
<pre class="code">port-access role EMPLOYEE
    vlan access 10
    exit</pre>
<p>The VLAN must exist and be allowed on the uplink trunk, otherwise DHCP fails later. In the lab VLAN 10 and the trunk are already prepared.</p>

<h3>Step 6: prove it</h3>
<p>On LAPTOP1 renew the address and test the application server (<code>ip dhcp</code>, then <code>ping 10.20.70.20</code>), and read the switch:</p>
<pre class="out">ACCESS# show port-access clients detail

Port Access Client Status Details
  Client alice, 00:50:2f:e9:9a:01
  =================================
    Session Details
    ---------------
    Port        : 1/1/3
    Session Time: 41s
    IPv4 Address: 10.20.10.11
    <span class="hl">Authentication Details</span>
    ----------------------
    Status      : <span class="hl">dot1x Authenticated</span>
    Auth Precedence : dot1x - Authenticated, mac-auth - Not attempted
    Role Information
    ----------------
    Name        : <span class="hl">EMPLOYEE</span>
    Type        : radius
    Access VLAN : <span class="hl">10</span></pre>
<p>Three proofs: status authenticated, the role EMPLOYEE came from RADIUS, and the VLAN is 10 with an address in 10.20.10.0/24. The ClearPass side shows the same story in the Access Tracker, which the next chapter explains.</p>

<div class="eg"><p><b>Worked example.</b> The engineer built steps 1 to 4 but forgot step 5. The Access Tracker showed Accept with Aruba-User-Role EMPLOYEE, yet LAPTOP1 had no address. The switch had no role EMPLOYEE, so it could not apply the answer. After defining the role with VLAN 10, a port bounce authenticated alice again and she received 10.20.10.11.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Building the service before its policy exists. Forgetting to bind the policy to the service. Typing the role in lower case on one side. Defining the switch role but pointing it at a VLAN that does not exist. Testing without forcing a new authentication after a change.</p></div>

<div class="exam"><p><b>Exam trap.</b> Two objects can have the same name but live on different devices. A successful Accept in ClearPass proves ClearPass is satisfied, not that the switch applied the role. Always verify on both sides.</p></div>

<div class="scn"><h4>Go-live on a Friday</h4><p>A site team enabled 802.1X on one floor. The ClearPass chain looked perfect and Accept appeared in the tracker. Users still reported no network. The switch showed the clients as authenticated with a role named Employee while the real role was EMPLOYEE, and the switch had fallen back to the port VLAN. A one-word fix on the profile resolved it, and the team added a post-change checklist: tracker, switch status, address, application ping.</p><p><b>Lesson:</b> verify on both sides; an Accept is not the finish line.</p></div>

<div class="iv"><p class="q">"Describe the steps to onboard a new user group to wired 802.1X with ClearPass."</p><p>Strong answer: make sure the NAD is registered; create the identity source entries; create the enforcement profile with the switch role; write the policy with a default deny and a rule for the group; attach it to the service; define the same role and VLAN on the switch; then test with a real laptop and verify the tracker, switch status, address and application reachability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build bottom up: user, profile, policy, service, then the switch role.</li>
<li>The service links classification rules, methods, sources and the policy.</li>
<li>The switch must define the role and VLAN named in Aruba-User-Role.</li>
<li>Verify with show port-access clients detail and a ping to APP1.</li>
<li>Enforcement applies at login, so re-authenticate after changes.</li>
</ul></div>
`,hi:`
<p>Ab aap har part jaante ho. Is chapter mein aap unhe sahi order mein jodte ho aur result test karte ho. Yeh lab <b>cp-first-service</b> hai. Chapter 4 ka trust pehle se maujood hai: ACCESS registered network device hai aur request ClearPass tak pahunchti hai, par koi policy nahi hai, isliye alice error 9002 ke saath reject hoti hai.</p>

<h3>Analogy: naya office counter kholna</h3>
<p>Naya service counter kholne ke liye pehle clerk hire karte ho (user), standard form print karte ho (profile), rule sheet likhte ho (policy), aur aakhir mein counter ke upar sign lagate ho (service). Agar sign pehle laga diya to customers aate hain aur khaali counter dekhte hain. Neeche se upar banao: pehle ingredients, service last.</p>

<h3>Build order</h3>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Build order">
<rect x="10" y="40" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="68" text-anchor="middle" class="svg-ink" font-size="13">1 User</text><text x="70" y="88" text-anchor="middle" class="svg-muted" font-size="11">alice</text>
<rect x="150" y="40" width="120" height="70" rx="8" fill="#fde68a"/><text x="210" y="68" text-anchor="middle" class="svg-ink" font-size="13">2 Profile</text><text x="210" y="88" text-anchor="middle" class="svg-muted" font-size="11">EP-EMPLOYEE</text>
<rect x="290" y="40" width="120" height="70" rx="8" fill="#fed7aa"/><text x="350" y="68" text-anchor="middle" class="svg-ink" font-size="13">3 Policy</text><text x="350" y="88" text-anchor="middle" class="svg-muted" font-size="11">EPOL-WIRED</text>
<rect x="430" y="40" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="490" y="68" text-anchor="middle" class="svg-ink" font-size="13">4 Service</text><text x="490" y="88" text-anchor="middle" class="svg-muted" font-size="11">Wired 802.1X</text>
<rect x="570" y="40" width="64" height="70" rx="8" fill="#bbf7d0"/><text x="602" y="68" text-anchor="middle" class="svg-ink" font-size="13">5 Role</text><text x="602" y="88" text-anchor="middle" class="svg-muted" font-size="11">switch</text>
<line x1="130" y1="75" x2="150" y2="75" stroke="#64748b" stroke-width="2"/><line x1="270" y1="75" x2="290" y2="75" stroke="#64748b" stroke-width="2"/><line x1="410" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/><line x1="550" y1="75" x2="570" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Phir test: LAPTOP1 authenticate hota hai aur APP1 tak pahunchta hai</text>
</svg><p class="cap">Pehle pieces banao, phir unhe use karne wali service, phir matching switch role.</p></div>

<h3>Step 1: user (Lab shell)</h3>
<p>Real GUI: Configuration, Identity, Local Users, Add. User ID alice, password, aur attribute Department value Engineering daalo.</p>
<pre class="code">configuration identity local-user add alice password Pass@2024 attr Department=Engineering</pre>

<h3>Step 2: enforcement profile</h3>
<p>Real GUI: Configuration, Enforcement, Profiles, Add, template Aruba RADIUS Enforcement, attribute Radius:Aruba:Aruba-User-Role = EMPLOYEE.</p>
<pre class="code">configuration enforcement profile add EP-EMPLOYEE type radius
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE</pre>

<h3>Step 3: enforcement policy</h3>
<p>Real GUI: Configuration, Enforcement, Policies, Add; default profile [Deny Access Profile]; Authentication:Username par ek rule.</p>
<pre class="code">configuration enforcement policy add EPOL-WIRED default "[Deny Access Profile]"
configuration enforcement policy EPOL-WIRED rule add if Authentication:Username EQUALS alice then EP-EMPLOYEE</pre>

<h3>Step 4: service</h3>
<p>Real GUI: Configuration, Services, Add, type Aruba 802.1X Wired. Enforcement tab par policy EPOL-WIRED chuno.</p>
<pre class="code">configuration service add "Wired 802.1X" template wired-802.1x
configuration service "Wired 802.1X" enforcement-policy EPOL-WIRED
configuration service "Wired 802.1X" show</pre>
<pre class="out">Service: Wired 802.1X   enabled   order 1
  Rules (match ALL):
    Radius:IETF:NAS-Port-Type   EQUALS      15
    Radius:IETF:Service-Type    BELONGS_TO  1,2,8
  Auth methods : [EAP PEAP]
  Auth sources : [Local User Repository]
  Enforcement  : <span class="hl">EPOL-WIRED</span></pre>

<h3>Step 5: switch par role</h3>
<p>ClearPass ka return kiya role naam sirf wada hai. Switch ko use define karna padta hai. ACCESS par (real AOS-CX style syntax):</p>
<pre class="code">port-access role EMPLOYEE
    vlan access 10
    exit</pre>
<p>VLAN maujood hona chahiye aur uplink trunk par allowed hona chahiye, warna baad mein DHCP fail hoga. Lab mein VLAN 10 aur trunk pehle se ready hain.</p>

<h3>Step 6: prove karo</h3>
<p>LAPTOP1 par address renew karo aur application server test karo (<code>ip dhcp</code>, phir <code>ping 10.20.70.20</code>), aur switch padho:</p>
<pre class="out">ACCESS# show port-access clients detail

Port Access Client Status Details
  Client alice, 00:50:2f:e9:9a:01
  =================================
    Session Details
    ---------------
    Port        : 1/1/3
    Session Time: 41s
    IPv4 Address: 10.20.10.11
    <span class="hl">Authentication Details</span>
    ----------------------
    Status      : <span class="hl">dot1x Authenticated</span>
    Auth Precedence : dot1x - Authenticated, mac-auth - Not attempted
    Role Information
    ----------------
    Name        : <span class="hl">EMPLOYEE</span>
    Type        : radius
    Access VLAN : <span class="hl">10</span></pre>
<p>Teen proofs: status authenticated, role EMPLOYEE RADIUS se aaya, aur VLAN 10 hai jisme 10.20.10.0/24 ka address hai. ClearPass side Access Tracker mein wahi kahani dikhati hai, jo agla chapter samjhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Engineer ne steps 1 se 4 banaye par step 5 bhool gaya. Access Tracker mein Accept dikha Aruba-User-Role EMPLOYEE ke saath, phir bhi LAPTOP1 ko address nahi mila. Switch par role EMPLOYEE tha hi nahi, isliye woh jawab apply nahi kar paya. VLAN 10 ke saath role define karne ke baad port bounce se alice dobara authenticate hui aur use 10.20.10.11 mila.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Policy ke exist hone se pehle service banana. Policy ko service se bind karna bhool jana. Role ko ek side par lower case mein type karna. Switch role define karna par aise VLAN ko point karna jo exist nahi karta. Change ke baad naya authentication force kiye bina test karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Do objects ka naam same ho sakta hai par woh alag devices par rehte hain. ClearPass mein successful Accept sirf yeh prove karta hai ki ClearPass satisfied hai, yeh nahi ki switch ne role apply kiya. Hamesha dono sides verify karo.</p></div>

<div class="scn"><h4>Friday ko go-live</h4><p>Ek site team ne ek floor par 802.1X enable kiya. ClearPass chain perfect dikhti thi aur tracker mein Accept aaya. Phir bhi users ne bataya ki network nahi hai. Switch ne clients ko authenticated dikhaya, role naam Employee ke saath jabki real role EMPLOYEE tha, aur switch port VLAN par fall back kar gaya tha. Profile par ek shabd ke fix se resolve hua, aur team ne post-change checklist jodi: tracker, switch status, address, application ping.</p><p><b>Seekh:</b> dono sides verify karo; Accept finish line nahi hai.</p></div>

<div class="iv"><p class="q">"ClearPass ke saath naye user group ko wired 802.1X par onboard karne ke steps batao."</p><p>Strong answer: pehle NAD registered ho; identity source entries banao; switch role ke saath enforcement profile banao; default deny aur group ke rule ke saath policy likho; use service se attach karo; switch par wahi role aur VLAN define karo; phir real laptop se test karo aur tracker, switch status, address aur application reachability verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se banao: user, profile, policy, service, phir switch role.</li>
<li>Service classification rules, methods, sources aur policy ko jodti hai.</li>
<li>Switch ko Aruba-User-Role mein diya role aur VLAN define karna padta hai.</li>
<li>show port-access clients detail aur APP1 ping se verify karo.</li>
<li>Enforcement login par lagta hai, isliye change ke baad re-authenticate karo.</li>
</ul></div>
`}};export{e as default};