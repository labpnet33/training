var e={id:`rule-containers`,h:{en:`Where rules live: device groups, templates, folders and snippets`,hi:`Rules kahan rehte hain: device groups, templates, folders aur snippets`},body:{en:`
<p>Imagine a company with a head office rulebook and a local notice board in each branch. The head office rules apply everywhere; each branch can add its own notices, but must not hide the head office pages. In Prisma Access, the same idea exists in two shapes: <b>Panorama</b> uses device groups and templates, and <b>Strata Cloud Manager (SCM)</b> uses folders and snippets. Before you write a single rule you must know which container you are in, because that decides who inherits it.</p>

<h3>Two management paths, one product</h3>
<table class="cmp">
<tr><th>Idea</th><th>Panorama path</th><th>SCM path</th></tr>
<tr><td>Where security rules live</td><td>Policies, Security, inside a <b>device group</b></td><td>Configuration, Security Services, inside a <b>folder</b></td></tr>
<tr><td>Where network settings live</td><td><b>Templates</b> (zones, tunnels, GlobalProtect)</td><td>Folder-level settings and Prisma Access infrastructure screens</td></tr>
<tr><td>Reusable blocks</td><td>Shared device group, parent device group</td><td><b>Snippets</b> (reusable configuration blocks) and parent folders</td></tr>
<tr><td>Inheritance</td><td>Child device group inherits from parent or Shared</td><td>Child folder inherits from parent folder</td></tr>
</table>

<h3>Panorama: device groups and templates</h3>
<p>When you install the Cloud Services plugin, it creates three templates for network settings: <code>Mobile_User_Template</code>, <code>Remote_Network_Template</code> and <code>Service_Conn_Template</code>. For policy, Prisma Access uses device groups. The documentation names <code>Remote_Network_Device_Group</code> and, in the push dialog, the device groups <code>GlobalProtect</code> and <code>Explicit Proxy</code>. Device groups sit under a parent device group (or Shared), so a rule or object defined in the parent is visible in every child.</p>
<div class="note"><p><b>Be careful with names.</b> Only the names above are confirmed in the documentation used for this course. Other device group names, and template stack names, can differ in your tenant. Read them from your own Panorama, do not guess.</p></div>

<h3>SCM: folders and snippets</h3>
<p>SCM organises configuration in a folder tree. Settings in a parent folder are inherited by its children. The predefined Prisma Access folders for mobile users, remote networks and service connections <b>cannot be edited</b>; you put your rules in folders you control and let inheritance do the work. Firewall (NGFW) folders and Prisma Access folders are separate trees. Folders are managed under System Settings, Folder Management. A <b>snippet</b> is a reusable block of configuration, such as "our standard URL filtering profile and its rules", that you can attach where needed instead of copying it again and again.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Inheritance">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Parent: Shared / Global</text>
<rect x="60" y="110" width="160" height="44" rx="8" fill="#bae6fd"/><text x="140" y="137" text-anchor="middle" class="svg-ink" font-size="13">Child: Mobile users</text>
<rect x="240" y="110" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">Child: Remote networks</text>
<rect x="420" y="110" width="160" height="44" rx="8" fill="#bae6fd"/><text x="500" y="137" text-anchor="middle" class="svg-ink" font-size="13">Child: Service conn.</text>
<rect x="240" y="185" width="160" height="34" rx="8" fill="#fde68a"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="12">Snippet: std profiles</text>
<line x1="320" y1="59" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="185" x2="320" y2="154" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Settings flow down from parent to children. A snippet is attached to reuse a standard block without copying.</p></div>

<h3>Choosing a home for each rule</h3>
<ol>
<li><b>Company-wide rules</b> (block known bad categories, always apply the standard profile group) go in the parent, so every child inherits them.</li>
<li><b>Population-specific rules</b> (only mobile users may reach the finance app) go in the child for that population.</li>
<li><b>Repeated building blocks</b> (profile groups, URL categories, address groups) go in a snippet or in the shared parent, once.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> The company wants three things: block malware domains for everybody, let mobile users reach 10.10.0.50, let the branch reach 10.10.0.50 too. One parent rule blocks malware categories for all. Two child rules allow mobile users and branch users to 10.10.0.50 with application ssl. A snippet holds the profile group. When the security team updates the profile group once, every rule using it benefits. Changes are saved, then pushed: in SCM with Push Config, in Panorama with Commit and Push.</p></div>

<h3>What the course will not claim</h3>
<p>Standard Panorama has <b>pre rules</b> and <b>post rules</b> (evaluated before and after the local rules of a device). The Prisma Access pages used for this course do not spell out how those apply to Prisma Access device groups, and they do not state the exact order in which rules from folders and snippets are evaluated in SCM. So do not memorise an order. In practice you read the effective rulebase your console shows and test with traffic logs. If an exam question gives you an explicit statement of order, follow the question; otherwise remember only "parent settings are inherited by children".</p>

<pre class="out">Folder tree (teaching view)
Shared
  Mobile Users            (predefined, read only)
  Remote Networks         (predefined, read only)
  Service Connections     (predefined, read only)
  <span class="hl">Corp-Policy</span>             (your folder, rules inherited by children)</pre>

<div class="warn"><p><b>Common mistakes.</b> Trying to edit a predefined Prisma Access folder; copying the same profile settings into ten rules instead of using a snippet or parent; putting a population-specific rule in the parent, so everybody inherits it; mixing up NGFW folders with Prisma Access folders.</p></div>
<div class="exam"><p><b>Exam trap.</b> Panorama uses templates for network settings and device groups for policy. SCM uses folders. Questions often swap the words. Also, a plain commit to Panorama does not change Prisma Access; the push does.</p></div>

<div class="scn"><h4>The rule that reached the branch by accident</h4><p>An engineer created an "allow finance app" rule in the parent container so that mobile users could use it. The branch team then noticed that branch PCs could also open the finance app, which was not approved. The traffic log showed the same rule name for both populations. The rule was moved down into the mobile users child container and the branch got its own, reviewed rule.</p><p><b>Lesson:</b> inheritance is powerful. Anything in the parent reaches every child.</p></div>

<div class="iv"><p class="q">"How do you organise policy for mobile users, branches and data centre in Prisma Access?"</p><p>Put shared guardrails and reusable profile groups in a parent or snippet, population-specific access in the child container. Name Panorama device groups and templates, or SCM folders and snippets, depending on the tool. Say you verify with the effective rule list and traffic logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama: device groups for rules, templates for network settings. SCM: folders and snippets.</li>
<li>Children inherit from parents; anything in the parent reaches everyone below.</li>
<li>Predefined Prisma Access folders in SCM cannot be edited.</li>
<li>Use snippets or shared objects instead of copying profile settings.</li>
<li>Do not assume pre/post rule or folder order beyond what your console shows; test with logs.</li>
</ul></div>
`,hi:`
<p>Ek company socho jahan head office ki rulebook hai aur har branch mein local notice board. Head office ke rules sab jagah lagte hain; har branch apne notices jod sakti hai, lekin head office ke pages chhupa nahi sakti. Prisma Access mein yahi idea do shakal mein hai: <b>Panorama</b> device groups aur templates use karta hai, aur <b>Strata Cloud Manager (SCM)</b> folders aur snippets. Ek bhi rule likhne se pehle aapko pata hona chahiye ki aap kaunse container mein ho, kyunki wahi decide karta hai ki kaun inherit karega.</p>

<h3>Do management paths, ek product</h3>
<table class="cmp">
<tr><th>Idea</th><th>Panorama path</th><th>SCM path</th></tr>
<tr><td>Security rules kahan rehte hain</td><td>Policies, Security, ek <b>device group</b> ke andar</td><td>Configuration, Security Services, ek <b>folder</b> ke andar</td></tr>
<tr><td>Network settings kahan rehti hain</td><td><b>Templates</b> (zones, tunnels, GlobalProtect)</td><td>Folder-level settings aur Prisma Access infrastructure screens</td></tr>
<tr><td>Reusable blocks</td><td>Shared device group, parent device group</td><td><b>Snippets</b> (reusable configuration blocks) aur parent folders</td></tr>
<tr><td>Inheritance</td><td>Child device group parent ya Shared se inherit karta hai</td><td>Child folder parent folder se inherit karta hai</td></tr>
</table>

<h3>Panorama: device groups aur templates</h3>
<p>Cloud Services plugin install karne par wo network settings ke liye teen templates banata hai: <code>Mobile_User_Template</code>, <code>Remote_Network_Template</code> aur <code>Service_Conn_Template</code>. Policy ke liye Prisma Access device groups use karta hai. Documentation <code>Remote_Network_Device_Group</code> ka naam leti hai aur push dialog mein device groups <code>GlobalProtect</code> aur <code>Explicit Proxy</code> ka. Device groups ek parent device group (ya Shared) ke neeche hote hain, isliye parent mein define kiya rule ya object har child mein visible hota hai.</p>
<div class="note"><p><b>Names mein savdhan.</b> Is course ke liye use ki gayi documentation mein sirf upar ke names confirmed hain. Baaki device group names aur template stack names aapke tenant mein alag ho sakte hain. Apne Panorama se padho, andaza mat lagao.</p></div>

<h3>SCM: folders aur snippets</h3>
<p>SCM configuration ko folder tree mein organise karta hai. Parent folder ki settings children inherit karte hain. Mobile users, remote networks aur service connections ke predefined Prisma Access folders <b>edit nahi ho sakte</b>; aap apne control wale folders mein rules rakhte ho aur inheritance kaam karti hai. Firewall (NGFW) folders aur Prisma Access folders alag trees hain. Folders System Settings, Folder Management mein manage hote hain. <b>Snippet</b> reusable configuration block hai, jaise "hamara standard URL filtering profile aur uske rules", jise bar bar copy karne ke bajay jahan chahiye wahan attach karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Inheritance">
<rect x="230" y="15" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Parent: Shared / Global</text>
<rect x="60" y="110" width="160" height="44" rx="8" fill="#bae6fd"/><text x="140" y="137" text-anchor="middle" class="svg-ink" font-size="13">Child: Mobile users</text>
<rect x="240" y="110" width="160" height="44" rx="8" fill="#bae6fd"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">Child: Remote networks</text>
<rect x="420" y="110" width="160" height="44" rx="8" fill="#bae6fd"/><text x="500" y="137" text-anchor="middle" class="svg-ink" font-size="13">Child: Service conn.</text>
<rect x="240" y="185" width="160" height="34" rx="8" fill="#fde68a"/><text x="320" y="207" text-anchor="middle" class="svg-ink" font-size="12">Snippet: std profiles</text>
<line x1="320" y1="59" x2="140" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="320" y2="110" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="500" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="185" x2="320" y2="154" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Settings parent se children tak flow karti hain. Snippet attach karke standard block bina copy kiye reuse hota hai.</p></div>

<h3>Har rule ke liye ghar chunna</h3>
<ol>
<li><b>Company-wide rules</b> (known bad categories block karo, standard profile group hamesha lagao) parent mein jaate hain, taaki har child inherit kare.</li>
<li><b>Population-specific rules</b> (sirf mobile users finance app tak jaayein) us population ke child mein jaate hain.</li>
<li><b>Repeated building blocks</b> (profile groups, URL categories, address groups) ek baar snippet ya shared parent mein jaate hain.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Company ko teen cheezein chahiye: sab ke liye malware domains block, mobile users ko 10.10.0.50 tak access, branch ko bhi 10.10.0.50 tak access. Ek parent rule sab ke liye malware categories block karta hai. Do child rules mobile users aur branch users ko application ssl ke saath 10.10.0.50 tak allow karte hain. Ek snippet profile group rakhta hai. Security team profile group ek baar update kare to use karne wale har rule ko fayda hota hai. Changes save hote hain, phir push hote hain: SCM mein Push Config se, Panorama mein Commit and Push se.</p></div>

<h3>Course kya claim nahi karega</h3>
<p>Standard Panorama mein <b>pre rules</b> aur <b>post rules</b> hote hain (device ke local rules se pehle aur baad evaluate hote hain). Is course ke liye padhe Prisma Access pages ye nahi batate ki ye Prisma Access device groups par kaise lagte hain, aur ye bhi nahi batate ki SCM mein folders aur snippets ke rules kis exact order mein evaluate hote hain. Isliye order ratta mat maaro. Practice mein aap apne console ki effective rulebase padhte ho aur traffic logs se test karte ho. Exam question mein order ka explicit statement ho to question follow karo; warna sirf yaad rakho "parent settings children inherit karte hain".</p>

<pre class="out">Folder tree (teaching view)
Shared
  Mobile Users            (predefined, read only)
  Remote Networks         (predefined, read only)
  Service Connections     (predefined, read only)
  <span class="hl">Corp-Policy</span>             (your folder, rules inherited by children)</pre>

<div class="warn"><p><b>Common mistakes.</b> Predefined Prisma Access folder edit karne ki koshish; snippet ya parent ke bajay wahi profile settings das rules mein copy karna; population-specific rule parent mein rakhna jisse sab inherit karein; NGFW folders aur Prisma Access folders ko mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Panorama network settings ke liye templates aur policy ke liye device groups use karta hai. SCM folders use karta hai. Questions aksar words swap kar dete hain. Aur plain commit to Panorama Prisma Access ko nahi badalta; push badalta hai.</p></div>

<div class="scn"><h4>Wo rule jo galti se branch tak pahunch gaya</h4><p>Ek engineer ne "allow finance app" rule parent container mein banaya taaki mobile users use kar sakein. Branch team ne dekha ki branch PCs bhi finance app khol pa rahe hain, jo approved nahi tha. Traffic log mein dono populations ke liye same rule name tha. Rule ko mobile users ke child container mein neeche le jaya gaya aur branch ko apna reviewed rule mila.</p><p><b>Lesson:</b> inheritance powerful hai. Parent mein jo bhi hai wo har child tak pahunchta hai.</p></div>

<div class="iv"><p class="q">"Prisma Access mein mobile users, branches aur data centre ki policy kaise organise karoge?"</p><p>Shared guardrails aur reusable profile groups parent ya snippet mein, population-specific access child container mein. Tool ke hisaab se Panorama device groups aur templates, ya SCM folders aur snippets ka naam lo. Batao ki effective rule list aur traffic logs se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama: rules ke liye device groups, network settings ke liye templates. SCM: folders aur snippets.</li>
<li>Children parents se inherit karte hain; parent mein jo hai wo neeche sab tak pahunchta hai.</li>
<li>SCM ke predefined Prisma Access folders edit nahi hote.</li>
<li>Profile settings copy karne ke bajay snippets ya shared objects use karo.</li>
<li>Pre/post rule ya folder order assume mat karo; console jo dikhaye uske aage logs se test karo.</li>
</ul></div>
`}};export{e as default};