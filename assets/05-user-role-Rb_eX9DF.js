var e={id:`user-role`,h:{en:`Aruba-User-Role: names must match exactly`,hi:`Aruba-User-Role: names bilkul match hone chahiye`},body:{en:`
<p>A role name is like a cloakroom ticket. ClearPass hands the switch a ticket that says "EMPLOYEE". The switch walks to its own cloakroom and looks for a coat with that exact label. If the label says "Employee" or "EMPLOYEE " with a trailing space, the attendant shrugs: no such coat. The ticket was valid, the coat was there, yet nothing is handed over.</p>

<h3>What the attribute is</h3>
<p><code>Aruba-User-Role</code> is a vendor-specific RADIUS attribute in the Aruba dictionary. In the ClearPass GUI you add it to a RADIUS enforcement profile as <code>Radius:Aruba:Aruba-User-Role</code> with a string value. The value is only a <b>name</b>. All meaning (VLAN, and in the real product ACLs and more) lives on the switch in the role of that name. So two objects must agree: the enforcement profile on ClearPass and the port-access role on ACCESS.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Role name match">
<rect x="20" y="30" width="250" height="110" rx="8" fill="#ddd6fe"/><text x="145" y="55" text-anchor="middle" class="svg-ink" font-size="14">CPPM profile EP-EMPLOYEE</text><text x="145" y="85" text-anchor="middle" class="svg-accent" font-size="13">Aruba-User-Role =</text><text x="145" y="110" text-anchor="middle" class="svg-ink" font-size="14">Employee</text>
<rect x="370" y="30" width="250" height="110" rx="8" fill="#bae6fd"/><text x="495" y="55" text-anchor="middle" class="svg-ink" font-size="14">ACCESS port-access role</text><text x="495" y="85" text-anchor="middle" class="svg-accent" font-size="13">role name =</text><text x="495" y="110" text-anchor="middle" class="svg-ink" font-size="14">EMPLOYEE (vlan 10)</text>
<line x1="270" y1="85" x2="370" y2="85" stroke="#64748b" stroke-width="3"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="20">?</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">"Employee" is not "EMPLOYEE": no match, role not applied</text>
</svg><p class="cap">The comparison is exact, upper and lower case included.</p></div>

<h3>The symptom pair</h3>
<p>This is the lab <b>cp-role-case</b>. ClearPass accepts alice and returns a role, yet the port stays unauthorized. You read both sides and compare the evidence. Always do it in this order.</p>
<p><b>Step 1: switch client status.</b></p>
<pre class="out">ACCESS# show port-access clients detail

Port Access Client Status Details

Client 00:50:2f:e9:9a:01, alice
  Port            : 1/1/3
  Status          : <span class="hl">unauthorized</span>
  Auth method     : dot1x
  Role            : (none)
  Reason          : <span class="hl">RADIUS-returned role "Employee" is not defined on this switch</span></pre>
<p><b>Step 2: ClearPass record, Output tab.</b></p>
<pre class="out">CPPM Access Tracker  detail latest output
  Radius:Aruba:Aruba-User-Role = <span class="hl">Employee</span>

CPPM Access Tracker  detail latest summary
  Result      : ACCEPT
  Enforcement : EP-EMPLOYEE</pre>
<p>Accept on one side and "not defined" on the other is the signature. Now look at which object is wrong. The switch role EMPLOYEE is also referenced by other devices and other profiles, and it is the one defined by the network team. The profile is the wrong object. Repair the thing that is out of line, not the thing that is shared.</p>

<h3>The fix (Lab shell)</h3>
<pre class="code"><span class="c">! on CPPM: set the attribute value to match the switch exactly</span>
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE
<span class="c">! on LAPTOP1: renew</span>
ip dhcp
ping 10.20.70.20</pre>
<p>In the real GUI you open Configuration &gt; Enforcement &gt; Profiles, edit EP-EMPLOYEE, go to the Attributes tab and correct the value. Then reauthenticate the client (a CoA reauthenticate, or bouncing the port). The lab bounces with <code>shutdown</code> and <code>no shutdown</code>.</p>
<pre class="out">ACCESS# show port-access clients detail

Client 00:50:2f:e9:9a:01, alice
  Port            : 1/1/3
  Status          : <span class="hl">authorized</span>
  Role            : <span class="hl">EMPLOYEE</span>
  VLAN            : 10
  IPv4 address    : 10.20.10.50</pre>

<div class="eg"><p><b>Worked example.</b> Five spellings of one intention: <code>EMPLOYEE</code> matches. <code>Employee</code> fails (case). <code>EMPLOYEE </code> with a trailing space fails. <code>EMPLOYEES</code> fails. <code>Employe</code> fails. Anyone who copies role names from a spreadsheet by hand makes at least one of these in a year. The cure is a naming convention (for example all capitals, no spaces, no punctuation), written down and shared by the switch and ClearPass teams.</p></div>

<h3>What the switch does with the answer</h3>
<ol>
<li>If Aruba-User-Role names an existing role, apply it.</li>
<li>If not, and Tunnel-Type, Tunnel-Medium-Type and Tunnel-Private-Group-Id are all present, apply that VLAN (chapter 6).</li>
<li>Otherwise the port stays in its own VLAN.</li>
</ol>
<p>The role is also not applied if its VLAN does not exist on the switch. That is covered in the troubleshooting chapter.</p>

<div class="note"><p><b>Real platform note.</b> A real AOS-CX switch can also download a role definition from ClearPass at login (downloadable user roles) so that names and contents cannot drift apart. That feature is <b>not simulated in the lab</b>. In the lab, and in many production networks, roles are defined locally on the switch and ClearPass sends only the name.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Fixing" the wrong object. If you change the switch role to "Employee" to match one profile, you break every other profile and device that uses EMPLOYEE. Compare, decide which side is the standard, change only the other side.</p></div>

<div class="exam"><p><b>Exam trap.</b> The ClearPass role (ENGINEER) and the switch role (EMPLOYEE) are different things with different names on purpose. Only the Aruba-User-Role value must equal the switch role name. Do not "fix" a role mapping when the problem is an attribute value.</p></div>

<div class="scn"><h4>Capital letters on a Friday</h4><p>A contractor onboarding script created the profile value "Contractor" while the switches defined CONTRACTOR. Six people were accepted on Friday afternoon and none got network. The Access Tracker looked perfect. The switch client table, three lines below, said the role was unknown. Rewriting one attribute value fixed all six after a reauthentication.</p><p><b>Lesson:</b> a healthy Access Tracker proves ClearPass is right, not that the user is online.</p></div>

<div class="iv"><p class="q">"A user is accepted by ClearPass but has no network. What do you check?"</p><p>Strong answer: the switch client status, to see whether the role or VLAN was applied; the Output tab for the exact attribute values; role name spelling and case against the switch role; that the role's VLAN exists and is allowed on the uplink; and then DHCP. Mention that you fix the object that is out of line and then reauthenticate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aruba-User-Role carries only a name; the meaning lives on the switch.</li>
<li>Names are compared exactly, case and spaces included.</li>
<li>ACCEPT in the Access Tracker and "role not defined" on the switch means a name mismatch.</li>
<li>Read both sides, then change only the object that is out of line.</li>
<li>Reauthenticate (bounce the port or CoA) after fixing, then prove VLAN and address.</li>
</ul></div>
`,hi:`
<p>Role name cloakroom ke ticket jaisa hai. ClearPass switch ko "EMPLOYEE" likha ticket deta hai. Switch apni cloakroom mein jaakar bilkul wahi label wala coat dhoondhta hai. Agar label "Employee" hai ya "EMPLOYEE " (peeche space ke saath), to attendant kandha uchkaata hai: aisa koi coat nahi. Ticket valid tha, coat wahan tha, phir bhi kuch nahi mila.</p>

<h3>Attribute kya hai</h3>
<p><code>Aruba-User-Role</code> Aruba dictionary ka vendor-specific RADIUS attribute hai. ClearPass GUI mein aap ise RADIUS enforcement profile mein <code>Radius:Aruba:Aruba-User-Role</code> ke roop mein string value ke saath add karte ho. Value sirf ek <b>naam</b> hai. Poora matlab (VLAN, aur real product mein ACLs aur bahut kuch) switch par us naam ke role mein rehta hai. Isliye do objects agree hone chahiye: ClearPass par enforcement profile aur ACCESS par port-access role.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Role name match">
<rect x="20" y="30" width="250" height="110" rx="8" fill="#ddd6fe"/><text x="145" y="55" text-anchor="middle" class="svg-ink" font-size="14">CPPM profile EP-EMPLOYEE</text><text x="145" y="85" text-anchor="middle" class="svg-accent" font-size="13">Aruba-User-Role =</text><text x="145" y="110" text-anchor="middle" class="svg-ink" font-size="14">Employee</text>
<rect x="370" y="30" width="250" height="110" rx="8" fill="#bae6fd"/><text x="495" y="55" text-anchor="middle" class="svg-ink" font-size="14">ACCESS port-access role</text><text x="495" y="85" text-anchor="middle" class="svg-accent" font-size="13">role name =</text><text x="495" y="110" text-anchor="middle" class="svg-ink" font-size="14">EMPLOYEE (vlan 10)</text>
<line x1="270" y1="85" x2="370" y2="85" stroke="#64748b" stroke-width="3"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="20">?</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">"Employee" aur "EMPLOYEE" alag: match nahi, role apply nahi</text>
</svg><p class="cap">Comparison exact hai, upper aur lower case samet.</p></div>

<h3>Symptom ki jodi</h3>
<p>Yeh lab <b>cp-role-case</b> hai. ClearPass alice ko accept karta hai aur role return karta hai, phir bhi port unauthorized rehta hai. Aap dono sides padhte ho aur evidence compare karte ho. Hamesha isi order mein karo.</p>
<p><b>Step 1: switch client status.</b></p>
<pre class="out">ACCESS# show port-access clients detail

Port Access Client Status Details

Client 00:50:2f:e9:9a:01, alice
  Port            : 1/1/3
  Status          : <span class="hl">unauthorized</span>
  Auth method     : dot1x
  Role            : (none)
  Reason          : <span class="hl">RADIUS-returned role "Employee" is not defined on this switch</span></pre>
<p><b>Step 2: ClearPass record, Output tab.</b></p>
<pre class="out">CPPM Access Tracker  detail latest output
  Radius:Aruba:Aruba-User-Role = <span class="hl">Employee</span>

CPPM Access Tracker  detail latest summary
  Result      : ACCEPT
  Enforcement : EP-EMPLOYEE</pre>
<p>Ek side par Accept aur doosri par "not defined" iska signature hai. Ab dekho kaunsa object galat hai. Switch role EMPLOYEE doosre devices aur doosre profiles bhi refer karte hain, aur woh network team ne define kiya hai. Profile galat object hai. Jo cheez line se bahar hai use repair karo, jo shared hai use nahi.</p>

<h3>Fix (Lab shell)</h3>
<pre class="code"><span class="c">! on CPPM: set the attribute value to match the switch exactly</span>
configuration enforcement profile EP-EMPLOYEE attribute add Radius:Aruba:Aruba-User-Role EMPLOYEE
<span class="c">! on LAPTOP1: renew</span>
ip dhcp
ping 10.20.70.20</pre>
<p>Real GUI mein aap Configuration &gt; Enforcement &gt; Profiles kholte ho, EP-EMPLOYEE edit karte ho, Attributes tab mein jaakar value theek karte ho. Phir client ko reauthenticate karte ho (CoA reauthenticate, ya port bounce). Lab <code>shutdown</code> aur <code>no shutdown</code> se bounce karta hai.</p>
<pre class="out">ACCESS# show port-access clients detail

Client 00:50:2f:e9:9a:01, alice
  Port            : 1/1/3
  Status          : <span class="hl">authorized</span>
  Role            : <span class="hl">EMPLOYEE</span>
  VLAN            : 10
  IPv4 address    : 10.20.10.50</pre>

<div class="eg"><p><b>Worked example.</b> Ek hi irade ki paanch spellings: <code>EMPLOYEE</code> match karta hai. <code>Employee</code> fail (case). <code>EMPLOYEE </code> peeche space ke saath fail. <code>EMPLOYEES</code> fail. <code>Employe</code> fail. Jo bhi role names spreadsheet se haath se copy karta hai woh saal mein kam se kam ek aisi galti karta hai. Ilaaj hai naming convention (jaise sab capitals, koi space nahi, koi punctuation nahi), jo likhi hui ho aur switch aur ClearPass teams share karein.</p></div>

<h3>Switch answer ka kya karta hai</h3>
<ol>
<li>Agar Aruba-User-Role kisi existing role ka naam hai, use apply karo.</li>
<li>Nahi, aur Tunnel-Type, Tunnel-Medium-Type aur Tunnel-Private-Group-Id teeno present hain, to woh VLAN apply karo (chapter 6).</li>
<li>Warna port apne VLAN mein rehta hai.</li>
</ol>
<p>Agar role ka VLAN switch par exist nahi karta to role bhi apply nahi hota. Yeh troubleshooting chapter mein cover hai.</p>

<div class="note"><p><b>Real platform note.</b> Real AOS-CX switch login par ClearPass se role definition download bhi kar sakta hai (downloadable user roles) taaki names aur contents alag na ho jayein. Yeh feature lab mein <b>not simulated in the lab</b> hai. Lab mein, aur kai production networks mein, roles switch par locally define hote hain aur ClearPass sirf naam bhejta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Galat object ko "fix" karna. Agar aap ek profile ke liye switch role ko "Employee" kar do, to EMPLOYEE use karne wale har doosre profile aur device ko tod doge. Compare karo, decide karo kaunsi side standard hai, sirf doosri side badlo.</p></div>

<div class="exam"><p><b>Exam trap.</b> ClearPass role (ENGINEER) aur switch role (EMPLOYEE) alag cheezein hain, jaan boojh kar alag naamon ke saath. Sirf Aruba-User-Role value switch role name ke barabar honi chahiye. Jab problem attribute value mein ho tab role mapping ko "fix" mat karo.</p></div>

<div class="scn"><h4>Friday ko capital letters</h4><p>Ek contractor onboarding script ne profile value "Contractor" banayi jabki switches ne CONTRACTOR define kiya tha. Friday dopahar chhe log accept hue aur kisi ko network nahi mila. Access Tracker bilkul perfect dikh raha tha. Switch client table, teen line neeche, keh rahi thi ki role unknown hai. Ek attribute value dobara likhne se reauthentication ke baad chhe ke chhe theek ho gaye.</p><p><b>Seekh:</b> healthy Access Tracker sirf yeh prove karta hai ki ClearPass sahi hai, yeh nahi ki user online hai.</p></div>

<div class="iv"><p class="q">"User ClearPass se accept ho gaya par network nahi hai. Aap kya check karoge?"</p><p>Strong answer: switch client status, taaki dikhe role ya VLAN apply hua ya nahi; exact attribute values ke liye Output tab; switch role ke saath role name spelling aur case; role ka VLAN exist karta hai aur uplink par allowed hai; phir DHCP. Bolo ki jo object line se bahar hai use fix karte ho aur phir reauthenticate karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aruba-User-Role sirf naam le jaata hai; matlab switch par hota hai.</li>
<li>Names exact compare hote hain, case aur spaces samet.</li>
<li>Access Tracker mein ACCEPT aur switch par "role not defined" matlab name mismatch.</li>
<li>Dono sides padho, phir sirf line se bahar wala object badlo.</li>
<li>Fix ke baad reauthenticate (port bounce ya CoA) karo, phir VLAN aur address prove karo.</li>
</ul></div>
`}};export{e as default};