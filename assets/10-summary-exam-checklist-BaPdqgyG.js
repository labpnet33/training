var e={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have followed one flow from the laptop to the log entry. Before the exam or an interview, use this chapter as a flight checklist: a pilot does not rely on memory for the important items, and neither should you. Read each line and ask: can I do this, and can I explain it in two sentences?</p>

<h3>Can-do checklist</h3>
<ul>
<li>Name the three zones Prisma Access creates and say which one cannot be changed.</li>
<li>Explain why mapped zones default to untrust, and move the data-centre zone to trusted.</li>
<li>Describe where rules live on Panorama (device groups, templates) and on SCM (folders, snippets) and how inheritance works.</li>
<li>Write an App-ID rule with zones, named address, application, application-default and a profile group.</li>
<li>Build a profile group and a URL filtering profile with categories and a custom category.</li>
<li>Write a user-based rule and list the two identity mappings it needs.</li>
<li>Explain HIP objects, HIP profiles and the HIP Match log.</li>
<li>Separate internet (untrust) and private application (trust) rules.</li>
<li>Create a log forwarding profile and attach it to rules.</li>
<li>Find shadowed rules and explain first match.</li>
<li>Troubleshoot a policy deny from the traffic log in five questions.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Memory line">
<rect x="10" y="40" width="95" height="60" rx="8" fill="#bae6fd"/><text x="57" y="75" text-anchor="middle" class="svg-ink" font-size="13">Zones</text>
<rect x="125" y="40" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="172" y="75" text-anchor="middle" class="svg-ink" font-size="13">Container</text>
<rect x="240" y="40" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="287" y="75" text-anchor="middle" class="svg-ink" font-size="13">Rule</text>
<rect x="355" y="40" width="95" height="60" rx="8" fill="#fde68a"/><text x="402" y="75" text-anchor="middle" class="svg-ink" font-size="13">Profiles</text>
<rect x="470" y="40" width="75" height="60" rx="8" fill="#fed7aa"/><text x="507" y="75" text-anchor="middle" class="svg-ink" font-size="13">Order</text>
<rect x="560" y="40" width="70" height="60" rx="8" fill="#e2e8f0"/><text x="595" y="75" text-anchor="middle" class="svg-ink" font-size="13">Log</text>
<line x1="105" y1="70" x2="125" y2="70" stroke="#64748b" stroke-width="2"/><line x1="220" y1="70" x2="240" y2="70" stroke="#64748b" stroke-width="2"/><line x1="335" y1="70" x2="355" y2="70" stroke="#64748b" stroke-width="2"/><line x1="450" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/><line x1="545" y1="70" x2="560" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Zones, container, rule, profiles, order, log: the order of thinking</text>
</svg><p class="cap">The six words that cover the module. Say them in order when you plan or troubleshoot.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Trust, Untrust, Clientless VPN</dt><dd>The three zones created by Prisma Access.</dd>
<dt>Mapped zone</dt><dd>A zone from your own network brought into Prisma Access; untrust by default.</dd>
<dt>Device group, template</dt><dd>Panorama containers for policy and network settings.</dd>
<dt>Folder, snippet</dt><dd>SCM container tree and reusable configuration block.</dd>
<dt>App-ID</dt><dd>Identification of the real application, independent of port.</dd>
<dt>Profile group</dt><dd>A named bundle of security profiles attached to rules.</dd>
<dt>User-ID, Cloud Identity Engine</dt><dd>IP-to-user and user-to-group mapping and its cloud source.</dd>
<dt>HIP</dt><dd>Host information profile reported by the GlobalProtect app.</dd>
<dt>Log forwarding profile</dt><dd>Object that sends logs to Panorama or the Strata Logging Service.</dd>
<dt>Shadowing</dt><dd>A later rule never hit because an earlier one catches its traffic.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>Mapped zones default to untrust; move zones that reach internal or data-centre resources to Trusted Zones.</li>
<li>Clientless VPN maps to trust and cannot be changed. Reserved names: trust, untrust, inter-fw and remote network names.</li>
<li>Do not write any-to-any rules. Use zones.</li>
<li>Panorama templates created: Mobile_User_Template, Remote_Network_Template, Service_Conn_Template.</li>
<li>SCM predefined Prisma Access folders cannot be edited; child folders inherit from parents.</li>
<li>User-based policy needs IP-to-user and user-to-group mapping (Cloud Identity Engine or User-ID master device).</li>
<li>Log forwarding profile log types: Traffic, Threat Prevention, WildFire Submission, URL Filtering, Data Filtering, Authentication.</li>
<li>SCM default mobile user rules enforce URL blocking, malware and threat prevention; verify after about 15 minutes.</li>
<li>A URL block shows in the URL log, not as a deny rule. First match wins.</li>
</ol>

<h3>What the course does not claim</h3>
<p>Pre/post rule behaviour on Prisma Access device groups, the exact order of rule evaluation across SCM folders and snippets, and some menu names are not stated in the documentation used here. If an exam item depends on them, answer from what the question states and from the principle that parents are inherited by children.</p>

<div class="warn"><p><b>Common mistakes to remember.</b> Writing rules before mapping zones; editing before reading the log; forgetting to attach profiles and log forwarding; leaving broad temporary rules; testing without waiting for the push.</p></div>
<div class="exam"><p><b>Last exam trap.</b> Prisma Browser is part of the real exam blueprint but is not part of this simulator track. Do not spend lab time on it; read the vendor blueprint separately. Policy and user-based policy are in the Prisma Access Services domain; traffic enforcement troubleshooting is in the Troubleshooting domain.</p></div>

<div class="scn"><h4>The ten-minute handover</h4><p>A new engineer joined the team and had to take over the policy for the lab tenant. Using this checklist, she opened the zone mapping, read the rule list top to bottom, checked profile groups, opened the last day of traffic logs, and listed rules with zero hits. In ten minutes she had a short report: two shadowed rules, one rule without logs and one zone left untrust. All four items were fixed the same afternoon.</p><p><b>Lesson:</b> a repeatable checklist beats talent when time is short.</p></div>

<div class="iv"><p class="q">"Summarise how you would secure traffic for a new site in Prisma Access."</p><p>Map zones first, put rules in the right container, write named App-ID rules with profile groups and logging, add user and HIP conditions where needed, keep specific above general and no any-to-any, push and verify in-sync, then validate with traffic logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Think in order: zones, container, rule, profiles, order, log.</li>
<li>The traffic log is the truth about which rule decided.</li>
<li>Identity needs two mappings; HIP adds device posture.</li>
<li>Profile groups and log forwarding profiles belong on every rule.</li>
<li>Use the checklist before every exam answer and every change.</li>
</ul></div>
`,hi:`
<p>Aapne ek flow ko laptop se log entry tak follow kiya. Exam ya interview se pehle is chapter ko flight checklist ki tarah use karo: pilot important items ke liye yaadasht par bharosa nahi karta, aur aapko bhi nahi karna chahiye. Har line padho aur poochho: kya main ye kar sakta hoon, aur do sentences mein explain kar sakta hoon?</p>

<h3>Can-do checklist</h3>
<ul>
<li>Prisma Access ke banaye teen zones ke naam batao aur batao kaunsa change nahi ho sakta.</li>
<li>Samjhao mapped zones default mein untrust kyun hain, aur data-centre zone ko trusted mein move karo.</li>
<li>Batao rules Panorama par (device groups, templates) aur SCM par (folders, snippets) kahan rehte hain aur inheritance kaise kaam karti hai.</li>
<li>Zones, named address, application, application-default aur profile group ke saath App-ID rule likho.</li>
<li>Profile group aur categories tatha custom category ke saath URL filtering profile banao.</li>
<li>User-based rule likho aur uski do identity mappings batao.</li>
<li>HIP objects, HIP profiles aur HIP Match log samjhao.</li>
<li>Internet (untrust) aur private application (trust) rules alag karo.</li>
<li>Log forwarding profile banao aur rules se attach karo.</li>
<li>Shadowed rules dhundo aur first match samjhao.</li>
<li>Paanch sawalon se traffic log se policy deny troubleshoot karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Memory line">
<rect x="10" y="40" width="95" height="60" rx="8" fill="#bae6fd"/><text x="57" y="75" text-anchor="middle" class="svg-ink" font-size="13">Zones</text>
<rect x="125" y="40" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="172" y="75" text-anchor="middle" class="svg-ink" font-size="13">Container</text>
<rect x="240" y="40" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="287" y="75" text-anchor="middle" class="svg-ink" font-size="13">Rule</text>
<rect x="355" y="40" width="95" height="60" rx="8" fill="#fde68a"/><text x="402" y="75" text-anchor="middle" class="svg-ink" font-size="13">Profiles</text>
<rect x="470" y="40" width="75" height="60" rx="8" fill="#fed7aa"/><text x="507" y="75" text-anchor="middle" class="svg-ink" font-size="13">Order</text>
<rect x="560" y="40" width="70" height="60" rx="8" fill="#e2e8f0"/><text x="595" y="75" text-anchor="middle" class="svg-ink" font-size="13">Log</text>
<line x1="105" y1="70" x2="125" y2="70" stroke="#64748b" stroke-width="2"/><line x1="220" y1="70" x2="240" y2="70" stroke="#64748b" stroke-width="2"/><line x1="335" y1="70" x2="355" y2="70" stroke="#64748b" stroke-width="2"/><line x1="450" y1="70" x2="470" y2="70" stroke="#64748b" stroke-width="2"/><line x1="545" y1="70" x2="560" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Zones, container, rule, profiles, order, log: sochne ka order</text>
</svg><p class="cap">Wo chhe words jo poora module cover karte hain. Plan ya troubleshoot karte waqt inhe order mein bolo.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Trust, Untrust, Clientless VPN</dt><dd>Prisma Access ke banaye teen zones.</dd>
<dt>Mapped zone</dt><dd>Aapke apne network ka zone jo Prisma Access mein aaya; default mein untrust.</dd>
<dt>Device group, template</dt><dd>Policy aur network settings ke Panorama containers.</dd>
<dt>Folder, snippet</dt><dd>SCM container tree aur reusable configuration block.</dd>
<dt>App-ID</dt><dd>Port se alag, asli application ki pehchaan.</dd>
<dt>Profile group</dt><dd>Security profiles ka named bundle jo rules se attach hota hai.</dd>
<dt>User-ID, Cloud Identity Engine</dt><dd>IP-to-user aur user-to-group mapping aur uska cloud source.</dd>
<dt>HIP</dt><dd>GlobalProtect app ka report kiya host information profile.</dd>
<dt>Log forwarding profile</dt><dd>Object jo logs Panorama ya Strata Logging Service ko bhejta hai.</dd>
<dt>Shadowing</dt><dd>Baad ka rule kabhi hit nahi hota kyunki pehla rule uska traffic pakad leta hai.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>Mapped zones default mein untrust; internal ya data-centre resources tak le jaane wale zones ko Trusted Zones mein move karo.</li>
<li>Clientless VPN trust se map hota hai aur badla nahi ja sakta. Reserved names: trust, untrust, inter-fw aur remote network names.</li>
<li>Any-to-any rules mat likho. Zones use karo.</li>
<li>Panorama templates jo bante hain: Mobile_User_Template, Remote_Network_Template, Service_Conn_Template.</li>
<li>SCM ke predefined Prisma Access folders edit nahi hote; child folders parents se inherit karte hain.</li>
<li>User-based policy ko IP-to-user aur user-to-group mapping chahiye (Cloud Identity Engine ya User-ID master device).</li>
<li>Log forwarding profile ke log types: Traffic, Threat Prevention, WildFire Submission, URL Filtering, Data Filtering, Authentication.</li>
<li>SCM default mobile user rules URL blocking, malware aur threat prevention enforce karte hain; lagbhag 15 minute baad verify karo.</li>
<li>URL block URL log mein dikhta hai, deny rule ke roop mein nahi. First match wins.</li>
</ol>

<h3>Course kya claim nahi karta</h3>
<p>Prisma Access device groups par pre/post rule behaviour, SCM folders aur snippets mein rule evaluation ka exact order, aur kuch menu names yahan use ki gayi documentation mein stated nahi hain. Exam item in par depend kare to question jo kehta hai uske aur is principle ke hisaab se jawab do ki parents children ko inherit hote hain.</p>

<div class="warn"><p><b>Yaad rakhne wali common mistakes.</b> Zones map kiye bina rules likhna; log padhe bina edit karna; profiles aur log forwarding attach karna bhool jana; broad temporary rules chhod dena; push ka wait kiye bina test karna.</p></div>
<div class="exam"><p><b>Aakhri exam trap.</b> Prisma Browser real exam blueprint ka hissa hai lekin is simulator track ka nahi. Us par lab time mat lagao; vendor blueprint alag se padho. Policy aur user-based policy Prisma Access Services domain mein hain; traffic enforcement troubleshooting Troubleshooting domain mein hai.</p></div>

<div class="scn"><h4>Das minute ka handover</h4><p>Naya engineer team mein aayi aur use lab tenant ki policy sambhalni thi. Is checklist se usne zone mapping kholi, rule list upar se neeche padhi, profile groups check kiye, pichhle din ke traffic logs khole, aur zero-hit rules ki list banayi. Das minute mein uske paas chhoti report thi: do shadowed rules, ek rule bina logs ke aur ek zone untrust mein chhoota hua. Chaaron items usi dopahar fix ho gaye.</p><p><b>Lesson:</b> waqt kam ho to repeatable checklist talent se behtar hai.</p></div>

<div class="iv"><p class="q">"Prisma Access mein naye site ka traffic secure karne ka summary do."</p><p>Pehle zones map karo, rules sahi container mein rakho, profile groups aur logging ke saath named App-ID rules likho, zaroorat ho to user aur HIP conditions jodo, specific upar rakho aur any-to-any nahi, push karke in-sync verify karo, phir traffic logs se validate karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein socho: zones, container, rule, profiles, order, log.</li>
<li>Traffic log sach hai ki kaunse rule ne decide kiya.</li>
<li>Identity ko do mappings chahiye; HIP device posture jodta hai.</li>
<li>Profile groups aur log forwarding profiles har rule par hone chahiye.</li>
<li>Har exam answer aur har change se pehle checklist use karo.</li>
</ul></div>
`}};export{e as default};