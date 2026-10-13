var e={id:`dg-basics`,h:{en:`What a device group is: policy, objects and the Shared location`,hi:`Device group kya hota hai: policy, objects aur Shared location`},body:{en:`
<p><b>What you will learn in this module.</b> A single firewall is easy to manage: you log in, type a rule, commit. With three firewalls, or thirty, typing the same rule on every box is slow and error-prone. Panorama solves the <i>policy</i> half of this problem with <b>device groups</b>. In this module you will learn what a device group holds, how groups form a hierarchy, the exact order in which rules are evaluated on a firewall, how objects are inherited and shadowed, how to aim a rule at some firewalls only, and how to prove on the firewall what really arrived. You should already know what a security rule, a zone and an address object are, and you should have finished the first Panorama module (architecture and onboarding).</p>

<p><b>Analogy.</b> Think of a company with head-office circulars and branch-level notice boards. The head office sends one circular to every branch ("no personal USB drives"). Each branch also keeps its own notice board for local matters ("canteen closes at 4 pm"). A device group is the <i>circular</i>: a named bundle of rules and objects that Panorama sends to a set of firewalls. The firewall's own local rulebase is the branch notice board.</p>

<h3>What a device group contains</h3>
<p>A device group is a named container. Firewalls are members of a group, and the group holds these kinds of things:</p>
<table class="tbl"><tr><th>Content</th><th>Examples in the course lab</th><th>Where it ends up</th></tr>
<tr><td><b>Policy</b></td><td>Security pre-rules, security post-rules, NAT pre- and post-rules</td><td>Merged into each member firewall's rulebase</td></tr>
<tr><td><b>Objects</b></td><td>address, address-group, service, service-group</td><td>Pushed so rules on the firewall can use the names</td></tr>
<tr><td><b>Log forwarding profiles</b></td><td>profiles that rules reference by name</td><td>Pushed together with the policy (the logging module covers them)</td></tr>
</table>
<p>Notice what is <b>not</b> in a device group: interfaces, zones, virtual routers and server profiles. Those belong to templates. A simple memory aid: <b>device group = what traffic is allowed; template = how the box is wired</b>. The two meet at one point: rules refer to zone names, and zones come from the template.</p>

<h3>The Shared location</h3>
<p><b>Shared</b> is the top of every hierarchy. Anything you create in Shared is visible to every device group. It is the right home for things that are true for the whole company: a rule that blocks a dangerous application everywhere, or an address object for the corporate DNS server.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Shared above device groups above firewalls">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Shared (every group sees it)</text>
<rect x="60" y="80" width="220" height="40" rx="8" fill="#bae6fd"/><text x="170" y="105" text-anchor="middle" class="svg-ink" font-size="13">Device group NK-BRANCHES</text>
<rect x="360" y="80" width="220" height="40" rx="8" fill="#bbf7d0"/><text x="470" y="105" text-anchor="middle" class="svg-ink" font-size="13">Device group NK-SOUTH</text>
<rect x="20" y="145" width="120" height="34" rx="8" fill="#e2e8f0"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="12">NK-PUNE-PA</text>
<rect x="160" y="145" width="130" height="34" rx="8" fill="#e2e8f0"/><text x="225" y="167" text-anchor="middle" class="svg-ink" font-size="12">NK-DELHI-PA</text>
<rect x="400" y="145" width="150" height="34" rx="8" fill="#e2e8f0"/><text x="475" y="167" text-anchor="middle" class="svg-ink" font-size="12">NK-CHENNAI-PA</text>
<line x1="290" y1="50" x2="190" y2="80" stroke="#64748b"/><line x1="350" y1="50" x2="450" y2="80" stroke="#64748b"/>
<line x1="130" y1="120" x2="80" y2="145" stroke="#64748b"/><line x1="210" y1="120" x2="225" y2="145" stroke="#64748b"/><line x1="470" y1="120" x2="475" y2="145" stroke="#64748b"/>
</svg><p class="cap">Shared sits at the top. Each firewall belongs to one device group.</p></div>

<h3>Building a group in the lab</h3>
<p>Panorama commands are typed on Panorama only. Firewalls reject <code>device-group</code> commands. A group and its membership look like this (the serial number comes from <code>show system info</code> on the firewall):</p>
<pre class="code">admin@NK-PANORAMA&gt; configure
admin@NK-PANORAMA# set device-group NK-BRANCHES description branch-firewalls
admin@NK-PANORAMA# set device-group NK-BRANCHES devices 0079185321121
admin@NK-PANORAMA# set shared address CORP-DNS ip-netmask 10.0.0.53/32
admin@NK-PANORAMA# commit</pre>
<p>Remember the rule from the commit module: <code>commit</code> changes Panorama only. Nothing reaches the firewall until you <b>push</b> with <code>commit-all shared-policy device-group NK-BRANCHES</code>, and a push sends the <i>committed</i> configuration, not your pending edits.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting everything in Shared "because it is easier" (you lose the ability to treat regions differently); forgetting that a firewall can sit in only one device group; expecting a commit on Panorama to change the firewall.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zones are not device-group objects. If a pushed rule says <code>from trust</code> and the template that creates zone trust was never pushed, the push fails for that firewall with an invalid-reference error.</p></div>

<div class="scn"><h4>One circular instead of thirty typed rules</h4><p>A company added a firewall in a new city and an engineer typed the standard rules by hand. He missed one deny rule, and for a week that site allowed an application the others blocked. After the company moved the standard rules into a device group, a new firewall only needed to be added to the group and pushed; the rules arrived identical to every other site.</p><p><b>Lesson:</b> a device group turns "copy the rules" into "join the group".</p></div>

<div class="iv"><p class="q">"What is the difference between a device group and a template?"</p><p>A device group carries policy and objects (what traffic is allowed and what names mean). A template carries network and device settings such as interfaces, zones and server profiles (how the firewall is built). Rules reference zones, so the template must reach the firewall first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A device group is a named container of policy, objects and log forwarding profiles sent to member firewalls.</li>
<li>Shared is the top location; everything there is visible to all device groups.</li>
<li>Interfaces and zones come from templates, not device groups.</li>
<li>Commit changes Panorama; a push sends the committed configuration to the firewalls.</li>
<li>Panorama-only commands such as device-group are rejected on a firewall.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Ek firewall manage karna aasaan hai: login karo, rule type karo, commit karo. Teen firewalls ya tees firewalls par har box par wahi rule type karna slow aur galti-prone hai. Panorama is problem ka <i>policy</i> wala hissa <b>device groups</b> se solve karta hai. Is module mein aap seekhoge ki device group mein kya hota hai, groups ki hierarchy kaise banti hai, firewall par rules kis exact order mein evaluate hote hain, objects kaise inherit aur shadow hote hain, rule ko sirf kuch firewalls par kaise lagayein, aur firewall par prove kaise karein ki asal mein kya pahuncha. Aapko security rule, zone aur address object pata hona chahiye, aur pehla Panorama module (architecture aur onboarding) khatam hona chahiye.</p>

<p><b>Analogy.</b> Ek company socho jisme head-office ke circulars aur branch ke notice boards hain. Head office har branch ko ek circular bhejta hai ("personal USB drives nahi"). Har branch apna notice board bhi rakhti hai local baaton ke liye ("canteen 4 baje band"). Device group wo <i>circular</i> hai: rules aur objects ka naam wala bundle jo Panorama firewalls ke set ko bhejta hai. Firewall ki apni local rulebase branch ka notice board hai.</p>

<h3>Device group mein kya hota hai</h3>
<p>Device group ek named container hai. Firewalls group ke member hote hain, aur group ye cheezein rakhta hai:</p>
<table class="tbl"><tr><th>Content</th><th>Course lab ke examples</th><th>Kahan pahunchta hai</th></tr>
<tr><td><b>Policy</b></td><td>Security pre-rules, security post-rules, NAT pre- aur post-rules</td><td>Har member firewall ki rulebase mein merge hoti hai</td></tr>
<tr><td><b>Objects</b></td><td>address, address-group, service, service-group</td><td>Push hote hain taaki firewall ki rules naam use kar sakein</td></tr>
<tr><td><b>Log forwarding profiles</b></td><td>profiles jinhe rules naam se refer karti hain</td><td>Policy ke saath push hote hain (logging module inhe cover karta hai)</td></tr>
</table>
<p>Dhyan do ki device group mein kya <b>nahi</b> hai: interfaces, zones, virtual routers aur server profiles. Ye templates ke hain. Yaad rakhne ka tareeka: <b>device group = kaunsa traffic allowed hai; template = box kaise wired hai</b>. Dono ek jagah milte hain: rules zone names refer karti hain, aur zones template se aate hain.</p>

<h3>Shared location</h3>
<p><b>Shared</b> har hierarchy ka top hai. Shared mein jo bhi banate ho wo har device group ko dikhta hai. Ye un cheezon ke liye sahi jagah hai jo poori company ke liye sach hain: ek rule jo khatarnak application ko har jagah block kare, ya corporate DNS server ka address object.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Shared above device groups above firewalls">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Shared (har group dekhta hai)</text>
<rect x="60" y="80" width="220" height="40" rx="8" fill="#bae6fd"/><text x="170" y="105" text-anchor="middle" class="svg-ink" font-size="13">Device group NK-BRANCHES</text>
<rect x="360" y="80" width="220" height="40" rx="8" fill="#bbf7d0"/><text x="470" y="105" text-anchor="middle" class="svg-ink" font-size="13">Device group NK-SOUTH</text>
<rect x="20" y="145" width="120" height="34" rx="8" fill="#e2e8f0"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="12">NK-PUNE-PA</text>
<rect x="160" y="145" width="130" height="34" rx="8" fill="#e2e8f0"/><text x="225" y="167" text-anchor="middle" class="svg-ink" font-size="12">NK-DELHI-PA</text>
<rect x="400" y="145" width="150" height="34" rx="8" fill="#e2e8f0"/><text x="475" y="167" text-anchor="middle" class="svg-ink" font-size="12">NK-CHENNAI-PA</text>
<line x1="290" y1="50" x2="190" y2="80" stroke="#64748b"/><line x1="350" y1="50" x2="450" y2="80" stroke="#64748b"/>
<line x1="130" y1="120" x2="80" y2="145" stroke="#64748b"/><line x1="210" y1="120" x2="225" y2="145" stroke="#64748b"/><line x1="470" y1="120" x2="475" y2="145" stroke="#64748b"/>
</svg><p class="cap">Shared sabse upar hai. Har firewall ek device group ka member hota hai.</p></div>

<h3>Lab mein group banana</h3>
<p>Panorama commands sirf Panorama par type hote hain. Firewalls <code>device-group</code> commands reject karte hain. Group aur membership aise dikhte hain (serial number firewall ke <code>show system info</code> se milta hai):</p>
<pre class="code">admin@NK-PANORAMA&gt; configure
admin@NK-PANORAMA# set device-group NK-BRANCHES description branch-firewalls
admin@NK-PANORAMA# set device-group NK-BRANCHES devices 0079185321121
admin@NK-PANORAMA# set shared address CORP-DNS ip-netmask 10.0.0.53/32
admin@NK-PANORAMA# commit</pre>
<p>Commit module ka rule yaad rakho: <code>commit</code> sirf Panorama ko badalta hai. Firewall tak kuch tab tak nahi pahunchta jab tak aap <code>commit-all shared-policy device-group NK-BRANCHES</code> se <b>push</b> na karo, aur push <i>committed</i> configuration bhejta hai, aapke pending edits nahi.</p>

<div class="warn"><p><b>Common mistakes.</b> "Aasaan hai" soch kar sab kuch Shared mein daal dena (phir regions ko alag treat nahi kar sakte); ye bhoolna ki firewall sirf ek device group mein ho sakta hai; Panorama par commit se firewall badalne ki ummeed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zones device-group objects nahi hain. Agar pushed rule <code>from trust</code> kehti hai aur zone trust banane wala template kabhi push hi nahi hua, to us firewall ka push invalid-reference error se fail hota hai.</p></div>

<div class="scn"><h4>Tees typed rules ki jagah ek circular</h4><p>Ek company ne nayi city mein firewall lagaya aur engineer ne standard rules haath se type kiye. Usse ek deny rule chhoot gayi, aur ek hafte tak us site par wo application allowed raha jo baaki sites par block tha. Standard rules device group mein le jaane ke baad naye firewall ko sirf group mein add karke push karna padta tha; rules har doosri site jaisi hi pahunchti thi.</p><p><b>Lesson:</b> device group "rules copy karo" ko "group join karo" bana deta hai.</p></div>

<div class="iv"><p class="q">"Device group aur template mein kya fark hai?"</p><p>Device group policy aur objects rakhta hai (kaunsa traffic allowed hai aur naamon ka matlab kya hai). Template network aur device settings rakhta hai jaise interfaces, zones aur server profiles (firewall kaise bana hai). Rules zones refer karti hain, isliye template pehle firewall tak pahunchna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device group named container hai jo policy, objects aur log forwarding profiles member firewalls ko bhejta hai.</li>
<li>Shared top location hai; wahan jo hai wo saare device groups ko dikhta hai.</li>
<li>Interfaces aur zones templates se aate hain, device groups se nahi.</li>
<li>Commit Panorama ko badalta hai; push committed configuration firewalls ko bhejta hai.</li>
<li>device-group jaise Panorama-only commands firewall par reject hote hain.</li>
</ul></div>
`}};export{e as default};