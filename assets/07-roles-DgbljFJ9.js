var e={id:`roles`,h:{en:`Roles: ClearPass roles, switch roles and role mapping`,hi:`Roles: ClearPass roles, switch roles aur role mapping`},body:{en:`
<p>The word <b>role</b> appears everywhere in this track, and it means two different things depending on where you stand. If you mix them up, you will fix the wrong device. This chapter separates them clearly, and previews role mapping, which module 3 develops in depth.</p>

<h3>Analogy: job title versus building pass</h3>
<p>In a company, HR gives you a <b>job title</b>: Engineer, Contractor, Printer-Operator. That is an internal label used in HR decisions. Separately, the security office gives you a <b>building pass</b> with a colour, "Blue pass: floors 1 to 3". The job title decides which pass you get. The pass is what the door readers actually check. ClearPass roles are job titles. Switch roles are building passes.</p>

<h3>Two kinds of role</h3>
<table class="cmp"><tr><th></th><th>ClearPass role</th><th>Switch (AOS-CX) role</th></tr>
<tr><td>Lives on</td><td>ClearPass Policy Manager</td><td>The access switch</td></tr>
<tr><td>Lab names</td><td>ENGINEER, CONTRACTOR, PRINTER, CAMERA</td><td>EMPLOYEE, CONTRACTOR, IOT, GUEST, QUARANTINE (and CRITICAL)</td></tr>
<tr><td>Purpose</td><td>A label for decisions inside ClearPass</td><td>A bundle of port behaviour: VLAN, and in real switches also policies</td></tr>
<tr><td>Created at</td><td>Configuration, Identity, Roles</td><td>port-access role NAME</td></tr>
<tr><td>Reaches the switch?</td><td>No, never sent as such</td><td>Named in the RADIUS attribute Aruba-User-Role</td></tr></table>
<p>The bridge between the two worlds is the <b>enforcement profile</b> (next chapter): it returns the attribute <code>Radius:Aruba:Aruba-User-Role</code> with the <b>switch</b> role name. The ClearPass role ENGINEER never travels to the switch. The switch only ever hears "EMPLOYEE".</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Role chain">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="12">Attribute</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="11">Department=Engineering</text>
<rect x="165" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="230" y="66" text-anchor="middle" class="svg-ink" font-size="12">Role mapping</text><text x="230" y="84" text-anchor="middle" class="svg-muted" font-size="11">RM-WIRED</text>
<rect x="340" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="12">CP role</text><text x="395" y="84" text-anchor="middle" class="svg-muted" font-size="11">ENGINEER</text>
<rect x="495" y="40" width="135" height="60" rx="8" fill="#fed7aa"/><text x="562" y="66" text-anchor="middle" class="svg-ink" font-size="12">Enforcement</text><text x="562" y="84" text-anchor="middle" class="svg-muted" font-size="11">EP-EMPLOYEE</text>
<line x1="120" y1="70" x2="165" y2="70" stroke="#64748b" stroke-width="2"/><line x1="295" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="450" y1="70" x2="495" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="395" y="140" width="235" height="50" rx="8" fill="#bbf7d0"/><text x="512" y="160" text-anchor="middle" class="svg-ink" font-size="12">Switch role EMPLOYEE</text><text x="512" y="178" text-anchor="middle" class="svg-muted" font-size="11">VLAN 10 on ACCESS</text>
<line x1="562" y1="100" x2="562" y2="140" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="170" class="svg-accent" font-size="12">ClearPass world</text>
</svg><p class="cap">ClearPass role is an internal label; the switch role is what the port actually uses.</p></div>

<h3>What role mapping does</h3>
<p>A <b>role-mapping policy</b> (Configuration, Identity, Role Mappings) is a list of rules. Each rule checks attributes and, when true, adds a ClearPass role. Attributes can come from the request (Radius), from the authentication source (Local:Department for a local user, Endpoint:Category for an endpoint, or AD attributes in a real company) and from the date and time. The policy has an <b>algorithm</b>: <b>first match</b> stops at the first rule that fits; <b>all matches</b> collects every role that fits. It also has a <b>default role</b> for when no rule matches.</p>
<p>The lab has two policies: RM-WIRED for people (Department decides the role) and RM-MAC for devices (Endpoint:Category decides). Lab shell:</p>
<pre class="code"><span class="c">! GUI: Configuration &gt; Identity &gt; Roles / Role Mappings</span>
configuration identity role add ENGINEER
configuration identity role-mapping add RM-WIRED default "[Other]" algorithm first
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Engineering then ENGINEER
configuration identity role-mapping show</pre>
<pre class="out">Role mapping RM-WIRED  (algorithm: first match, default: [Other])
  1  Local:Department EQUALS Engineering  -&gt;  ENGINEER</pre>

<h3>Built-in roles worth knowing</h3>
<ul>
<li><b>[Other]</b>: assigned when no mapping rule matched.</li>
<li><b>[User Authenticated]</b>: given to every user that passed authentication. It is a catch-all, so using it first in an enforcement policy makes everyone equal. You will meet that trap in module 3.</li>
<li><b>[MAC Caching]</b> and others exist for specific features such as caching MAC authentication results.</li>
</ul>

<h3>Do you need role mapping for the first service?</h3>
<p>No. For your first service in this module the enforcement policy tests the username directly (Authentication:Username EQUALS alice). That is simple and works for a lab, but it does not scale: you cannot write one rule per person. Real designs map attributes to roles first and write enforcement rules per role. Module 3 (services and policies) turns the first service into that design.</p>

<div class="eg"><p><b>Worked example.</b> Bob authenticates. His Local User record carries Department=Contractor. RM-WIRED rule 1 (Department EQUALS Engineering) is false; rule 2 (Department EQUALS Contractor) is true, so ClearPass assigns the role CONTRACTOR. The enforcement policy then sees <code>Tips:Role EQUALS CONTRACTOR</code> and picks EP-CONTRACTOR, which returns the switch role CONTRACTOR (VLAN 20). Note that the two roles share a name here by choice, but they are different objects on different devices.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming a ClearPass role automatically exists on the switch. Naming roles with different capital letters on the two sides: the switch compares names exactly, including case. Forgetting that a role mapping is only used if the service points at it.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ClearPass role" and "Aruba-User-Role" are not the same. The attribute carries the name of a role defined on the NAD. The Tips:Role attribute holds ClearPass roles inside the policy engine.</p></div>

<div class="scn"><h4>The Employee that did not exist</h4><p>An engineer built a perfect ClearPass chain and the Access Tracker showed Accept with Aruba-User-Role Employee. The port still did not open. On the switch only the role EMPLOYEE existed. Names are compared exactly, so "Employee" matched nothing and the port stayed unauthorized. Correcting the profile value fixed it at once.</p><p><b>Lesson:</b> a role name returned by ClearPass is only a promise until the switch defines the same name.</p></div>

<div class="iv"><p class="q">"What is the difference between a ClearPass role and the Aruba-User-Role attribute?"</p><p>Strong answer: a ClearPass role is an internal label produced by role mapping and used in enforcement conditions. Aruba-User-Role is a RADIUS attribute in the reply that names a role configured on the switch, which carries the VLAN and other port behaviour. The enforcement profile is the bridge, and the names must match the switch exactly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass roles are labels for decisions; switch roles are what the port applies.</li>
<li>Role mapping turns attributes into ClearPass roles; first match or all matches, plus a default.</li>
<li>Aruba-User-Role carries the switch role name, compared exactly.</li>
<li>[User Authenticated] is a catch-all; [Other] is the default when nothing matches.</li>
<li>The first service uses a username rule; scalable designs map attributes to roles.</li>
</ul></div>
`,hi:`
<p><b>Role</b> shabd is track mein har jagah aata hai, aur aap kahan khade ho uske hisaab se iske do alag matlab hain. Agar inhe mix kar diya to aap galat device fix karoge. Yeh chapter dono ko saaf alag karta hai, aur role mapping ka preview deta hai, jise module 3 gehrai se develop karta hai.</p>

<h3>Analogy: job title versus building pass</h3>
<p>Company mein HR aapko <b>job title</b> deta hai: Engineer, Contractor, Printer-Operator. Yeh HR decisions mein use hone wala internal label hai. Alag se, security office aapko rang wala <b>building pass</b> deta hai, "Blue pass: floors 1 se 3". Job title decide karta hai ki aapko kaunsa pass milega. Door readers asal mein pass check karte hain. ClearPass roles job titles hain. Switch roles building passes hain.</p>

<h3>Role ke do prakaar</h3>
<table class="cmp"><tr><th></th><th>ClearPass role</th><th>Switch (AOS-CX) role</th></tr>
<tr><td>Kahan rehta hai</td><td>ClearPass Policy Manager par</td><td>Access switch par</td></tr>
<tr><td>Lab names</td><td>ENGINEER, CONTRACTOR, PRINTER, CAMERA</td><td>EMPLOYEE, CONTRACTOR, IOT, GUEST, QUARANTINE (aur CRITICAL)</td></tr>
<tr><td>Purpose</td><td>ClearPass ke andar decisions ke liye label</td><td>Port behaviour ka bundle: VLAN, aur real switches mein policies bhi</td></tr>
<tr><td>Kahan banta hai</td><td>Configuration, Identity, Roles</td><td>port-access role NAME</td></tr>
<tr><td>Switch tak pahunchta hai?</td><td>Nahi, kabhi is roop mein nahi bheja jaata</td><td>RADIUS attribute Aruba-User-Role mein naam se</td></tr></table>
<p>Dono duniyaon ke beech ka bridge <b>enforcement profile</b> hai (agla chapter): woh attribute <code>Radius:Aruba:Aruba-User-Role</code> <b>switch</b> role ke naam ke saath return karta hai. ClearPass role ENGINEER kabhi switch tak nahi jaata. Switch sirf "EMPLOYEE" sunta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Role chain">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="12">Attribute</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="11">Department=Engineering</text>
<rect x="165" y="40" width="130" height="60" rx="8" fill="#fde68a"/><text x="230" y="66" text-anchor="middle" class="svg-ink" font-size="12">Role mapping</text><text x="230" y="84" text-anchor="middle" class="svg-muted" font-size="11">RM-WIRED</text>
<rect x="340" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="12">CP role</text><text x="395" y="84" text-anchor="middle" class="svg-muted" font-size="11">ENGINEER</text>
<rect x="495" y="40" width="135" height="60" rx="8" fill="#fed7aa"/><text x="562" y="66" text-anchor="middle" class="svg-ink" font-size="12">Enforcement</text><text x="562" y="84" text-anchor="middle" class="svg-muted" font-size="11">EP-EMPLOYEE</text>
<line x1="120" y1="70" x2="165" y2="70" stroke="#64748b" stroke-width="2"/><line x1="295" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="450" y1="70" x2="495" y2="70" stroke="#64748b" stroke-width="2"/>
<rect x="395" y="140" width="235" height="50" rx="8" fill="#bbf7d0"/><text x="512" y="160" text-anchor="middle" class="svg-ink" font-size="12">Switch role EMPLOYEE</text><text x="512" y="178" text-anchor="middle" class="svg-muted" font-size="11">ACCESS par VLAN 10</text>
<line x1="562" y1="100" x2="562" y2="140" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="170" class="svg-accent" font-size="12">ClearPass duniya</text>
</svg><p class="cap">ClearPass role internal label hai; switch role woh hai jo port asal mein use karta hai.</p></div>

<h3>Role mapping kya karta hai</h3>
<p><b>Role-mapping policy</b> (Configuration, Identity, Role Mappings) rules ki list hai. Har rule attributes check karta hai aur true hone par ek ClearPass role add karta hai. Attributes request se (Radius), authentication source se (local user ke liye Local:Department, endpoint ke liye Endpoint:Category, ya real company mein AD attributes) aur date-time se aa sakte hain. Policy ka ek <b>algorithm</b> hota hai: <b>first match</b> pehle fit hone wale rule par ruk jata hai; <b>all matches</b> jitne roles fit hon sab collect karta hai. Ek <b>default role</b> bhi hota hai jab koi rule match na kare.</p>
<p>Lab mein do policies hain: RM-WIRED logon ke liye (Department role decide karta hai) aur RM-MAC devices ke liye (Endpoint:Category decide karta hai). Lab shell:</p>
<pre class="code"><span class="c">! GUI: Configuration &gt; Identity &gt; Roles / Role Mappings</span>
configuration identity role add ENGINEER
configuration identity role-mapping add RM-WIRED default "[Other]" algorithm first
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Engineering then ENGINEER
configuration identity role-mapping show</pre>
<pre class="out">Role mapping RM-WIRED  (algorithm: first match, default: [Other])
  1  Local:Department EQUALS Engineering  -&gt;  ENGINEER</pre>

<h3>Built-in roles jo jaanne layak hain</h3>
<ul>
<li><b>[Other]</b>: tab milta hai jab koi mapping rule match nahi karta.</li>
<li><b>[User Authenticated]</b>: har us user ko milta hai jo authentication pass kare. Yeh catch-all hai, isliye enforcement policy mein ise pehle rakhne se sab barabar ho jaate hain. Yeh trap module 3 mein milega.</li>
<li><b>[MAC Caching]</b> aur aur bhi specific features ke liye hain, jaise MAC authentication results ko cache karna.</li>
</ul>

<h3>Kya pehli service ke liye role mapping chahiye?</h3>
<p>Nahi. Is module ki pehli service ke liye enforcement policy username ko seedha test karti hai (Authentication:Username EQUALS alice). Yeh simple hai aur lab ke liye chalta hai, par scale nahi karta: har insaan ke liye ek rule nahi likh sakte. Real designs pehle attributes ko roles mein map karte hain aur phir har role ke liye enforcement rules likhte hain. Module 3 (services aur policies) pehli service ko us design mein badalta hai.</p>

<div class="eg"><p><b>Worked example.</b> Bob authenticate karta hai. Uske Local User record mein Department=Contractor hai. RM-WIRED rule 1 (Department EQUALS Engineering) false hai; rule 2 (Department EQUALS Contractor) true hai, to ClearPass role CONTRACTOR assign karta hai. Enforcement policy phir <code>Tips:Role EQUALS CONTRACTOR</code> dekhti hai aur EP-CONTRACTOR chunti hai, jo switch role CONTRACTOR (VLAN 20) return karta hai. Dhyan do ki yahan dono roles ka naam choice se same hai, par woh alag devices par alag objects hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Yeh maan lena ki ClearPass role automatically switch par maujood hai. Dono sides par roles ke naam alag capital letters ke saath likhna: switch naam ko exactly compare karta hai, case samet. Yeh bhoolna ki role mapping tabhi use hoti hai jab service use point kare.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ClearPass role" aur "Aruba-User-Role" ek cheez nahi hain. Attribute NAD par defined role ka naam carry karta hai. Tips:Role attribute policy engine ke andar ClearPass roles rakhta hai.</p></div>

<div class="scn"><h4>Employee jo exist hi nahi karta tha</h4><p>Ek engineer ne perfect ClearPass chain banayi aur Access Tracker mein Accept dikha, Aruba-User-Role Employee ke saath. Phir bhi port nahi khula. Switch par sirf role EMPLOYEE tha. Naam exactly compare hote hain, isliye "Employee" kisi se match nahi hua aur port unauthorized raha. Profile value sahi karte hi fix ho gaya.</p><p><b>Seekh:</b> ClearPass ka return kiya role naam tab tak sirf wada hai jab tak switch wahi naam define na kare.</p></div>

<div class="iv"><p class="q">"ClearPass role aur Aruba-User-Role attribute mein kya farak hai?"</p><p>Strong answer: ClearPass role role mapping se bana internal label hai jo enforcement conditions mein use hota hai. Aruba-User-Role reply ka RADIUS attribute hai jo switch par configured role ka naam batata hai, jo VLAN aur dusra port behaviour carry karta hai. Enforcement profile bridge hai, aur naam switch se exactly match hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass roles decisions ke labels hain; switch roles woh hain jo port apply karta hai.</li>
<li>Role mapping attributes ko ClearPass roles mein badalta hai; first match ya all matches, plus default.</li>
<li>Aruba-User-Role switch role ka naam carry karta hai, exactly compare hota hai.</li>
<li>[User Authenticated] catch-all hai; [Other] default hai jab kuch match na ho.</li>
<li>Pehli service username rule use karti hai; scalable designs attributes ko roles mein map karte hain.</li>
</ul></div>
`}};export{e as default};