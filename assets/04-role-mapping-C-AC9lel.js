var e={id:`role-mapping`,h:{en:`Roles and role mapping: from attributes to labels`,hi:`Roles aur role mapping: attributes se labels tak`},body:{en:`
<p>In a school, the office keeps a register. Every student record has many facts: class, house, bus route, fee status. The principal does not write a separate rule for each student. The principal says "prefects may enter the staff corridor" and "bus students leave at 3 pm". Prefect and bus student are <b>labels</b> that the office derives from the facts. ClearPass does the same. A <b>role</b> is a label that ClearPass derives from attributes. The <b>role mapping policy</b> is the set of rules that derives it.</p>

<h3>Two kinds of "role" that beginners confuse</h3>
<p>This is the most important idea of the module, so read it twice.</p>
<ul>
<li>A <b>ClearPass role</b> (ENGINEER, CONTRACTOR, PRINTER, CAMERA) exists only inside ClearPass. It is a label used by the enforcement policy. It is created under <b>Configuration &gt; Identity &gt; Roles</b>.</li>
<li>A <b>switch role</b> (EMPLOYEE, CONTRACTOR, IOT, GUEST, QUARANTINE) exists on the Aruba switch, for example <code>port-access role EMPLOYEE</code> with its VLAN. ClearPass only returns its name in the Aruba-User-Role attribute.</li>
</ul>
<p>They are different objects that sometimes share a name by choice. In our lab ENGINEER (ClearPass) leads to EP-EMPLOYEE, which returns the switch role EMPLOYEE. Using the same word for both is allowed, but it hides the two-layer design, so learn to say "ClearPass role" or "switch role" every time.</p>

<h3>Built-in roles</h3>
<p>ClearPass supplies a few roles by itself: <b>[Other]</b> (the fallback), <b>[User Authenticated]</b> (added when a user authenticated successfully) and <b>[MAC Caching]</b> (for devices recognised by MAC). In the lab model every successfully authenticated 802.1X user carries [User Authenticated] before any rule runs. That is why it must never be used as the only condition in an Accept rule: it is true for everyone.</p>

<h3>Role mapping policy: structure</h3>
<p>A role mapping policy (GUI: Configuration &gt; Identity &gt; Role Mappings) has:</p>
<ol>
<li>A <b>rules evaluation algorithm</b>: select the first match, or select all matches.</li>
<li>A list of <b>rules</b>. Each rule has one or more conditions on attributes and a resulting role.</li>
<li>A <b>default role</b> used when no rule matches.</li>
</ol>
<p>With <b>first match</b>, evaluation stops at the first rule that is true, so the user gets one role. With <b>all matches</b>, every true rule adds its role, so a user can hold several roles at once, for example ENGINEER and VPN-USER. In an enterprise with Active Directory the conditions usually read the group list, for example "memberOf CONTAINS Engineering". That source is <b>not simulated</b> in the lab, but the logic is identical to our Department attribute.</p>
<p>The role mapping policy is attached to a service. Different services can use different role mappings: our RM-WIRED belongs to Wired 802.1X, and RM-MAC to Wired MAC Auth.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Role mapping rules turn attributes into roles">
<rect x="14" y="16" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="114" y="41" text-anchor="middle" class="svg-ink" font-size="13">Department = Engineering</text>
<rect x="14" y="68" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="114" y="93" text-anchor="middle" class="svg-ink" font-size="13">Department = Contractor</text>
<rect x="14" y="120" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="114" y="145" text-anchor="middle" class="svg-ink" font-size="13">Department = (not listed)</text>
<rect x="260" y="68" width="150" height="40" rx="8" fill="#fde68a"/><text x="335" y="93" text-anchor="middle" class="svg-ink" font-size="13">RM-WIRED rules</text>
<rect x="456" y="16" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="541" y="41" text-anchor="middle" class="svg-ink" font-size="13">role ENGINEER</text>
<rect x="456" y="68" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="541" y="93" text-anchor="middle" class="svg-ink" font-size="13">role CONTRACTOR</text>
<rect x="456" y="120" width="170" height="40" rx="8" fill="#fed7aa"/><text x="541" y="145" text-anchor="middle" class="svg-ink" font-size="13">default role or none</text>
<g stroke="#64748b" stroke-width="2"><line x1="214" y1="36" x2="260" y2="82"/><line x1="214" y1="88" x2="260" y2="88"/><line x1="214" y1="140" x2="260" y2="96"/><line x1="410" y1="82" x2="456" y2="36"/><line x1="410" y1="88" x2="456" y2="88"/><line x1="410" y1="96" x2="456" y2="140"/></g>
<text x="320" y="188" text-anchor="middle" class="svg-accent" font-size="13">Every role is always on the ClearPass side</text>
</svg><p class="cap">Role mapping works on facts about the user and produces labels. It never touches the switch.</p></div>

<h3>Why not let the policy read Department directly?</h3>
<p>You can write enforcement rules on raw attributes, but you lose reuse. Suppose Department=Engineering, a group "Engineers" in the directory and a certificate with OU=Engineering all mean "an engineer". The role mapping converts all of them into one role ENGINEER, and the enforcement policy needs just one rule. When a second directory is added next year you edit the mapping, not the policy.</p>

<h3>Lab shell: reading and extending RM-WIRED</h3>
<pre class="code"><span class="c">! Configuration &gt; Identity &gt; Roles and Role Mappings (Lab shell on CPPM)</span>
configuration identity role add CONTRACTOR
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Contractor then CONTRACTOR
configuration identity role-mapping show RM-WIRED</pre>
<pre class="out">Configuration &gt; Identity &gt; Role Mappings
Role mapping: RM-WIRED   Rules evaluation: select first match   Default role: (none)
  1. if Local:Department EQUALS Engineering then ENGINEER
  2. if Local:Department EQUALS <span class="hl">Contractor</span> then <span class="hl">CONTRACTOR</span></pre>
<p>Lab output, representative of the layout. A rule can combine several conditions with <code>and</code>, and <code>rule remove N</code> deletes a rule by its number. A role must exist (<code>configuration identity role add</code>) before a rule can name it, and a mapping can be created with <code>default ROLE</code> and <code>algorithm first|all</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Naming a role in a rule that was never created. Using a default role that is too powerful, so unknown users inherit access. Assuming the roles also exist on the switch. Comparing the wrong spelling or case of the attribute value.</p></div>
<div class="exam"><p><b>Exam trap.</b> With "select first match" a user gets one role from the mapping. With "select all matches" a user gets every matching role. The built-in [User Authenticated] is in addition to what the mapping returns, so a user with a mapped role usually shows two roles in the Access Tracker.</p></div>

<div class="scn"><h4>One department, two spellings</h4><p>A company merged two directories. Staff from the old one had Department=Engineering, the new one used Department=Engineering Team. Half the engineers fell into the deny default after the merge. Instead of editing the policy, the engineer added a second role mapping rule: Department EQUALS Engineering Team then ENGINEER. The enforcement policy did not change at all and the fix took one minute.</p><p><b>Lesson:</b> roles make new data sources cheap, because the policy only knows labels.</p></div>

<div class="iv"><p class="q">"Why does ClearPass have roles at all, when policy could read attributes directly?"</p><p>Strong answer: roles are an abstraction layer. Many different attributes and sources map to few roles, policies are written once against roles, and adding a source or changing a rule does not rewrite policy. Add that roles are ClearPass-side labels, distinct from switch roles returned in Aruba-User-Role.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A ClearPass role is a label derived from attributes; a switch role is a different object on the switch.</li>
<li>Role mapping has rules, an algorithm (first or all) and an optional default role.</li>
<li>[User Authenticated] is true for every authenticated user, so it is never a safe Accept condition.</li>
<li>AD groups are the usual real input; they are concept-only in the lab.</li>
<li>The mapping is attached to a service, so each service can have its own.</li>
</ul></div>
`,hi:`
<p>School mein office ek register rakhta hai. Har student record mein bahut facts hote hain: class, house, bus route, fee status. Principal har student ke liye alag rule nahi likhta. Principal kehta hai "prefects staff corridor mein ja sakte hain" aur "bus students 3 baje nikalte hain". Prefect aur bus student <b>labels</b> hain jo office facts se nikalta hai. ClearPass bhi yahi karta hai. <b>Role</b> ek label hai jo ClearPass attributes se nikalta hai. <b>Role mapping policy</b> un rules ka set hai jo use nikalta hai.</p>

<h3>Do tarah ke "role" jo beginners mix kar dete hain</h3>
<p>Yeh module ki sabse zaroori idea hai, isliye do baar padho.</p>
<ul>
<li><b>ClearPass role</b> (ENGINEER, CONTRACTOR, PRINTER, CAMERA) sirf ClearPass ke andar hota hai. Yeh enforcement policy ke liye label hai. Ise <b>Configuration &gt; Identity &gt; Roles</b> mein banate hain.</li>
<li><b>Switch role</b> (EMPLOYEE, CONTRACTOR, IOT, GUEST, QUARANTINE) Aruba switch par hota hai, jaise <code>port-access role EMPLOYEE</code> apne VLAN ke saath. ClearPass sirf uska naam Aruba-User-Role attribute mein return karta hai.</li>
</ul>
<p>Yeh alag objects hain jo kabhi kabhi choice se same naam share karte hain. Hamari lab mein ENGINEER (ClearPass) EP-EMPLOYEE tak le jaata hai, jo switch role EMPLOYEE return karta hai. Dono ke liye ek hi shabd allowed hai, lekin isse do-layer design chhup jaata hai, isliye har baar "ClearPass role" ya "switch role" bolna seekho.</p>

<h3>Built-in roles</h3>
<p>ClearPass khud kuch roles deta hai: <b>[Other]</b> (fallback), <b>[User Authenticated]</b> (user successfully authenticate ho to judta hai) aur <b>[MAC Caching]</b> (MAC se pehchane devices ke liye). Lab model mein har successfully authenticated 802.1X user ke paas koi rule chalne se pehle hi [User Authenticated] hota hai. Isiliye ise kabhi Accept rule ki akeli condition nahi banana chahiye: yeh sab ke liye true hai.</p>

<h3>Role mapping policy: structure</h3>
<p>Role mapping policy (GUI: Configuration &gt; Identity &gt; Role Mappings) mein hota hai:</p>
<ol>
<li>Ek <b>rules evaluation algorithm</b>: pehla match chuno, ya sab matches chuno.</li>
<li><b>Rules</b> ki list. Har rule mein attributes par ek ya zyada conditions aur ek resulting role hota hai.</li>
<li>Ek <b>default role</b> jo tab lagta hai jab koi rule match na kare.</li>
</ol>
<p><b>First match</b> mein pehle true rule par evaluation ruk jaata hai, isliye user ko ek role milta hai. <b>All matches</b> mein har true rule apna role jodta hai, to user ke paas ek saath kai roles ho sakte hain, jaise ENGINEER aur VPN-USER. Active Directory wale enterprise mein conditions aksar group list padhti hain, jaise "memberOf CONTAINS Engineering". Woh source lab mein <b>simulate nahi</b> hota, lekin logic hamare Department attribute jaisa hi hai.</p>
<p>Role mapping policy service se attach hoti hai. Alag services alag role mappings use kar sakti hain: hamari RM-WIRED Wired 802.1X ki hai, aur RM-MAC Wired MAC Auth ki.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Role mapping rules attributes ko roles mein badalte hain">
<rect x="14" y="16" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="114" y="41" text-anchor="middle" class="svg-ink" font-size="13">Department = Engineering</text>
<rect x="14" y="68" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="114" y="93" text-anchor="middle" class="svg-ink" font-size="13">Department = Contractor</text>
<rect x="14" y="120" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="114" y="145" text-anchor="middle" class="svg-ink" font-size="13">Department = (list mein nahi)</text>
<rect x="260" y="68" width="150" height="40" rx="8" fill="#fde68a"/><text x="335" y="93" text-anchor="middle" class="svg-ink" font-size="13">RM-WIRED rules</text>
<rect x="456" y="16" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="541" y="41" text-anchor="middle" class="svg-ink" font-size="13">role ENGINEER</text>
<rect x="456" y="68" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="541" y="93" text-anchor="middle" class="svg-ink" font-size="13">role CONTRACTOR</text>
<rect x="456" y="120" width="170" height="40" rx="8" fill="#fed7aa"/><text x="541" y="145" text-anchor="middle" class="svg-ink" font-size="13">default role ya none</text>
<g stroke="#64748b" stroke-width="2"><line x1="214" y1="36" x2="260" y2="82"/><line x1="214" y1="88" x2="260" y2="88"/><line x1="214" y1="140" x2="260" y2="96"/><line x1="410" y1="82" x2="456" y2="36"/><line x1="410" y1="88" x2="456" y2="88"/><line x1="410" y1="96" x2="456" y2="140"/></g>
<text x="320" y="188" text-anchor="middle" class="svg-accent" font-size="13">Har role hamesha ClearPass side par hota hai</text>
</svg><p class="cap">Role mapping user ke facts par kaam karta hai aur labels banata hai. Woh switch ko kabhi nahi chhuta.</p></div>

<h3>Policy seedha Department kyun nahi padhti?</h3>
<p>Aap enforcement rules raw attributes par bhi likh sakte ho, lekin reuse chala jaata hai. Maan lo Department=Engineering, directory ka group "Engineers" aur certificate ka OU=Engineering teeno ka matlab "engineer" hai. Role mapping teeno ko ek role ENGINEER bana deti hai, aur enforcement policy ko sirf ek rule chahiye. Agle saal doosri directory judti hai to aap mapping edit karte ho, policy nahi.</p>

<h3>Lab shell: RM-WIRED padhna aur badhana</h3>
<pre class="code"><span class="c">! Configuration &gt; Identity &gt; Roles aur Role Mappings (Lab shell on CPPM)</span>
configuration identity role add CONTRACTOR
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Contractor then CONTRACTOR
configuration identity role-mapping show RM-WIRED</pre>
<pre class="out">Configuration &gt; Identity &gt; Role Mappings
Role mapping: RM-WIRED   Rules evaluation: select first match   Default role: (none)
  1. if Local:Department EQUALS Engineering then ENGINEER
  2. if Local:Department EQUALS <span class="hl">Contractor</span> then <span class="hl">CONTRACTOR</span></pre>
<p>Lab output, layout representative hai. Rule mein kai conditions <code>and</code> se jod sakte ho, aur <code>rule remove N</code> rule ko number se hata deta hai. Rule mein role ka naam aane se pehle role exist karna chahiye (<code>configuration identity role add</code>), aur mapping <code>default ROLE</code> aur <code>algorithm first|all</code> ke saath ban sakti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Rule mein aisa role likhna jo kabhi banaya hi nahi. Bahut powerful default role rakhna, jisse unknown users ko access mil jaaye. Yeh maan lena ki roles switch par bhi exist karte hain. Attribute value ki galat spelling ya case compare karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Select first match" mein user ko mapping se ek role milta hai. "Select all matches" mein har matching role milta hai. Built-in [User Authenticated] mapping ke return ke upar se judta hai, isliye mapped role wale user ko Access Tracker mein aam taur par do roles dikhte hain.</p></div>

<div class="scn"><h4>Ek department, do spellings</h4><p>Ek company ne do directories merge ki. Purani wali ke staff ka Department=Engineering tha, nayi wali Department=Engineering Team use karti thi. Merge ke baad aadhe engineers deny default mein gir gaye. Policy edit karne ke bajaye engineer ne role mapping mein doosra rule jodha: Department EQUALS Engineering Team then ENGINEER. Enforcement policy bilkul nahi badli aur fix ek minute mein ho gaya.</p><p><b>Seekh:</b> roles naye data sources ko sasta bana dete hain, kyunki policy sirf labels jaanti hai.</p></div>

<div class="iv"><p class="q">"Jab policy attributes seedha padh sakti hai, to ClearPass mein roles hote hi kyun hain?"</p><p>Strong answer: roles ek abstraction layer hain. Bahut saare attributes aur sources kam roles mein map hote hain, policies roles ke against ek baar likhi jaati hain, aur source jodne ya rule badalne se policy dobara nahi likhni padti. Jodo ki roles ClearPass-side labels hain, jo Aruba-User-Role mein return hone wale switch roles se alag hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass role attributes se nikala hua label hai; switch role switch par alag object hai.</li>
<li>Role mapping mein rules, algorithm (first ya all) aur optional default role hota hai.</li>
<li>[User Authenticated] har authenticated user ke liye true hai, isliye woh safe Accept condition nahi.</li>
<li>AD groups real input hain; lab mein concept-only.</li>
<li>Mapping service se attach hoti hai, isliye har service ki apni ho sakti hai.</li>
</ul></div>
`}};export{e as default};