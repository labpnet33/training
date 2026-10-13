var e={id:`hierarchies`,h:{en:`Why hierarchies: a global baseline with regional exceptions`,hi:`Hierarchies kyun: global baseline aur regional exceptions`},body:{en:`
<p><b>Analogy.</b> A national company has a code of conduct that applies in every office. The Pune office adds a rule about its own lab, the Delhi office adds a rule about its visitors. Nobody rewrites the code of conduct in each office; they add local pages on top. A device group hierarchy works the same way: <b>a child group inherits everything from its parent</b> and adds its own rules and objects.</p>

<h3>How the hierarchy is built</h3>
<p>Every device group has one parent. By default the parent is Shared. You can make another device group the parent, and the child then inherits from that group and, through it, from Shared. Inherited policy is not copied by hand; Panorama resolves it at push time. In the lab you set the relationship with a command under <code>readonly</code> (in the web interface this is the "Parent Device Group" field). The depth limit differs by release, so check the documentation for your PAN-OS version.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three level hierarchy">
<rect x="230" y="8" width="180" height="36" rx="8" fill="#fde68a"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Shared: company baseline</text>
<rect x="230" y="68" width="180" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="91" text-anchor="middle" class="svg-ink" font-size="13">NK-GLOBAL (parent)</text>
<rect x="60" y="136" width="200" height="40" rx="8" fill="#bae6fd"/><text x="160" y="160" text-anchor="middle" class="svg-ink" font-size="13">Child: north-west branches</text>
<rect x="380" y="136" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="160" text-anchor="middle" class="svg-ink" font-size="13">Child: south branches</text>
<line x1="320" y1="44" x2="320" y2="68" stroke="#64748b"/><line x1="290" y1="104" x2="180" y2="136" stroke="#64748b"/><line x1="350" y1="104" x2="460" y2="136" stroke="#64748b"/>
</svg><p class="cap">Rules flow down. Firewalls sit in the child groups; the parent usually has no firewalls of its own.</p></div>

<h3>Designing: the three questions</h3>
<p>Before you create a group, ask three questions about each rule or object:</p>
<table class="tbl"><tr><th>Question</th><th>If the answer is "yes"</th><th>Put it in</th></tr>
<tr><td>Is it true for every firewall in the company?</td><td>Baseline</td><td>Shared</td></tr>
<tr><td>Is it true for a family of sites (a region, a type of site)?</td><td>Regional standard</td><td>Parent or child group of that family</td></tr>
<tr><td>Is it true for one group of firewalls only?</td><td>Exception</td><td>The child group (or a target, see later)</td></tr>
</table>
<p>The common design is two or three levels: Shared for the non-negotiable company baseline, a middle level for a standard that most sites share, and child groups for the exceptions. Keep it shallow. Every extra level is another place a rule might hide when you troubleshoot.</p>

<h3>One group per firewall or one group for many?</h3>
<p>Many firewalls can share one device group, and they will all receive identical policy. That is the whole point. Create a new group when a set of firewalls needs <i>different</i> policy or a different object value, not simply because the sites are in different buildings.</p>
<p>In the course topology the three branches are Pune, Delhi and Chennai. A natural design is the group NK-BRANCHES for Pune and Delhi and a group NK-SOUTH for Chennai, because Chennai reaches a partner over a different address range. Both inherit the Shared baseline; the labs in this module use exactly this kind of shape.</p>

<pre class="code"><span class="c">! Reference configuration (not run in the simulator):  a design on paper</span>
Shared                 pre-rule  Deny-Dangerous-Apps
 NK-GLOBAL (parent)    pre-rule  Allow-Standard-Out
  NK-BRANCHES (child)  post-rule Deny-All-Log
  NK-SOUTH   (child)   post-rule Deny-All-Log</pre>

<div class="eg"><p><b>Worked example.</b> Rule A: "block bit-torrent" is true everywhere, so it goes to Shared. Rule B: "allow web, DNS and ping from trust to untrust" is the same for every branch, so it goes to the parent. Rule C: "the partner network is reachable on this range" differs for Chennai, so the <i>object</i> is overridden in Chennai's child group (the next chapters explain how), while the rule stays in Shared.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Making a deep tree "for future flexibility" that nobody understands; creating one group per firewall and copying rules between them (this defeats the purpose); putting exceptions in the parent so every child must work around them.</p></div>
<div class="exam"><p><b>Exam trap.</b> Inheritance flows <b>downwards</b> only. A rule created in a child group never appears in its parent or in a sibling group.</p></div>

<div class="scn"><h4>The region that wanted its own copy</h4><p>A team cloned the whole policy into a second device group for the south region "to make changes safely". Six months later the two copies had drifted: a security fix reached only one of them. The redesign moved the shared rules into a parent group and left only the three genuinely regional rules in the child.</p><p><b>Lesson:</b> inherit what is common, override only what is different.</p></div>

<div class="iv"><p class="q">"How would you structure device groups for a company with branches in three regions?"</p><p>A Shared baseline for company-wide rules and objects, one parent group for the standard branch policy, and one child group per region only where policy or object values truly differ. I keep the tree shallow, document what each level is for, and check the depth limit in the documentation for the PAN-OS version in use.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A child group inherits from its parent and from Shared; inheritance only flows downwards.</li>
<li>Ask for each item: whole company, a family of sites, or one group only.</li>
<li>Create a new group for different policy or object values, not for different buildings.</li>
<li>Keep the tree shallow; extra levels make troubleshooting harder.</li>
<li>Check the documentation for your PAN-OS version for hierarchy depth limits.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Ek national company ka code of conduct har office par lagu hota hai. Pune office apni lab ke liye ek rule jodta hai, Delhi office apne visitors ke liye. Koi har office mein code of conduct dobara nahi likhta; local pages upar jodte hain. Device group hierarchy bhi aise hi kaam karti hai: <b>child group apne parent se sab kuch inherit karta hai</b> aur apni rules aur objects jodta hai.</p>

<h3>Hierarchy kaise banti hai</h3>
<p>Har device group ka ek parent hota hai. Default parent Shared hota hai. Aap kisi doosre device group ko parent bana sakte ho, aur tab child us group se aur uske through Shared se inherit karta hai. Inherited policy haath se copy nahi hoti; Panorama push time par resolve karta hai. Lab mein relationship <code>readonly</code> ke neeche ek command se set hoti hai (web interface mein ye "Parent Device Group" field hai). Depth limit release ke hisaab se alag hai, isliye apne PAN-OS version ki documentation check karo.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three level hierarchy">
<rect x="230" y="8" width="180" height="36" rx="8" fill="#fde68a"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Shared: company baseline</text>
<rect x="230" y="68" width="180" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="91" text-anchor="middle" class="svg-ink" font-size="13">NK-GLOBAL (parent)</text>
<rect x="60" y="136" width="200" height="40" rx="8" fill="#bae6fd"/><text x="160" y="160" text-anchor="middle" class="svg-ink" font-size="13">Child: north-west branches</text>
<rect x="380" y="136" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="160" text-anchor="middle" class="svg-ink" font-size="13">Child: south branches</text>
<line x1="320" y1="44" x2="320" y2="68" stroke="#64748b"/><line x1="290" y1="104" x2="180" y2="136" stroke="#64748b"/><line x1="350" y1="104" x2="460" y2="136" stroke="#64748b"/>
</svg><p class="cap">Rules neeche ki taraf behti hain. Firewalls child groups mein hote hain; parent mein aam taur par apne firewalls nahi hote.</p></div>

<h3>Design: teen sawal</h3>
<p>Group banane se pehle har rule ya object ke baare mein teen sawal pucho:</p>
<table class="tbl"><tr><th>Sawal</th><th>Jawab "haan" ho to</th><th>Kahan rakho</th></tr>
<tr><td>Kya ye company ke har firewall ke liye sach hai?</td><td>Baseline</td><td>Shared</td></tr>
<tr><td>Kya ye sites ke ek family (region, site type) ke liye sach hai?</td><td>Regional standard</td><td>Us family ka parent ya child group</td></tr>
<tr><td>Kya ye sirf ek firewalls ke group ke liye sach hai?</td><td>Exception</td><td>Child group (ya target, aage dekhenge)</td></tr>
</table>
<p>Common design do ya teen levels ka hota hai: Shared non-negotiable company baseline ke liye, beech ka level us standard ke liye jo zyadatar sites share karti hain, aur child groups exceptions ke liye. Shallow rakho. Har extra level ek aur jagah hai jahan troubleshoot karte waqt rule chhup sakti hai.</p>

<h3>Har firewall ka ek group ya kai firewalls ka ek group?</h3>
<p>Kai firewalls ek device group share kar sakte hain, aur sabko identical policy milti hai. Yahi poora point hai. Naya group tab banao jab firewalls ke set ko <i>alag</i> policy ya alag object value chahiye, sirf isliye nahi ki sites alag buildings mein hain.</p>
<p>Course topology mein teen branches Pune, Delhi aur Chennai hain. Natural design hai NK-BRANCHES group Pune aur Delhi ke liye aur NK-SOUTH group Chennai ke liye, kyunki Chennai partner tak alag address range se pahunchta hai. Dono Shared baseline inherit karte hain; is module ke labs bilkul aisi hi shape use karte hain.</p>

<pre class="code"><span class="c">! Reference configuration (not run in the simulator):  paper par ek design</span>
Shared                 pre-rule  Deny-Dangerous-Apps
 NK-GLOBAL (parent)    pre-rule  Allow-Standard-Out
  NK-BRANCHES (child)  post-rule Deny-All-Log
  NK-SOUTH   (child)   post-rule Deny-All-Log</pre>

<div class="eg"><p><b>Worked example.</b> Rule A: "bit-torrent block karo" har jagah sach hai, to Shared mein jaati hai. Rule B: "trust se untrust web, DNS aur ping allow" har branch ke liye same hai, to parent mein. Rule C: "partner network is range par reachable hai" Chennai ke liye alag hai, to <i>object</i> Chennai ke child group mein override hota hai (agle chapters batate hain kaise), jabki rule Shared mein rehti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "Future flexibility" ke liye gehra tree banana jise koi samajhta nahi; har firewall ka ek group banakar rules copy karna (ye purpose hi khatam kar deta hai); exceptions parent mein daalna taaki har child ko unke around kaam karna pade.</p></div>
<div class="exam"><p><b>Exam trap.</b> Inheritance sirf <b>neeche ki taraf</b> behti hai. Child group mein banayi rule kabhi parent ya sibling group mein nahi dikhti.</p></div>

<div class="scn"><h4>Wo region jo apni copy chahta tha</h4><p>Ek team ne poori policy ko south region ke liye "safely changes karne ke liye" doosre device group mein clone kar diya. Chhe mahine baad dono copies drift ho gayi: ek security fix sirf ek tak pahuncha. Redesign ne shared rules parent group mein daali aur child mein sirf teen asli regional rules chhodi.</p><p><b>Lesson:</b> jo common hai wo inherit karo, sirf jo alag hai use override karo.</p></div>

<div class="iv"><p class="q">"Teen regions mein branches wali company ke liye device groups kaise structure karoge?"</p><p>Company-wide rules aur objects ke liye Shared baseline, standard branch policy ke liye ek parent group, aur har region ke liye ek child group sirf wahan jahan policy ya object values sach mein alag hon. Main tree shallow rakhta hoon, har level ka purpose document karta hoon, aur use ho rahe PAN-OS version ki documentation mein depth limit check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Child group parent aur Shared se inherit karta hai; inheritance sirf neeche ki taraf behti hai.</li>
<li>Har item ke liye pucho: poori company, sites ki family, ya sirf ek group.</li>
<li>Naya group alag policy ya object values ke liye banao, alag buildings ke liye nahi.</li>
<li>Tree shallow rakho; extra levels troubleshooting mushkil karte hain.</li>
<li>Hierarchy depth limits ke liye apne PAN-OS version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};