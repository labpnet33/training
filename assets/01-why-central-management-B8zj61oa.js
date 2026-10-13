var e={id:`why-central-management`,h:{en:`Why central management exists`,hi:`Central management kyun zaroori hai`},body:{en:`
<div class="note"><p><b>What you will learn.</b> Why managing firewalls one by one stops working, what problems a central manager solves, and how this module is organised. <b>Prerequisites:</b> you know what a firewall does (it allows or denies traffic between zones) and you can read a simple IP address and subnet mask. Nothing else is assumed.</p></div>

<p>Imagine a school group with three campuses. Each campus has its own principal who writes the school rules on a notice board. When the group wants one new rule, such as "no mobile phones in class", someone must walk to every campus and change every notice board. Sooner or later one principal forgets, another writes the rule slightly differently, and a parent complains that the rule applies in Pune but not in Delhi. A head office that publishes the rule once and sends it to every campus removes all of that. Central firewall management is that head office.</p>

<h3>The problem with one-by-one management</h3>
<p>Network Kings (our invented company throughout this module) has branch firewalls in Pune, Delhi and Chennai. Each firewall has its own configuration: interfaces, zones, routes, security rules, address objects, logging settings. With three firewalls, an engineer can log in to each one. With thirty, or three hundred, the same method creates four recurring problems.</p>
<table class="tbl"><tr><th>Problem</th><th>What it looks like</th></tr>
<tr><td>Drift</td><td>Rule names, object values or log settings differ slightly between sites, so behaviour differs and nobody knows why.</td></tr>
<tr><td>Slow change</td><td>One new rule means logging in to every firewall; a security fix takes days to reach all sites.</td></tr>
<tr><td>No single view</td><td>To answer "which firewalls are up and what is their state" you must check each device separately.</td></tr>
<tr><td>Weak audit</td><td>Nobody can easily show who changed what, where and when across the estate.</td></tr>
</table>

<h3>What a central manager gives you</h3>
<p>A central manager keeps the intended configuration in one place and sends it to the devices that should have it. In the Palo Alto Networks world this product is called <b>Panorama</b>. It does not replace the firewalls; they still inspect and forward traffic on their own. Panorama is the head office, not a traffic cop. If Panorama is switched off, branches keep forwarding traffic with the last configuration they received; you only lose the ability to change them centrally and to see them in one place.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Head office and branches">
<rect x="250" y="15" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">NK-PANORAMA</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.50</text>
<rect x="30" y="140" width="150" height="56" rx="8" fill="#bae6fd"/><text x="105" y="165" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-PA</text><text x="105" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.11</text>
<rect x="245" y="140" width="150" height="56" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">NK-DELHI-PA</text><text x="320" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<rect x="460" y="140" width="150" height="56" rx="8" fill="#bae6fd"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">NK-CHENNAI-PA</text><text x="535" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="290" y1="71" x2="105" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="71" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="71" x2="535" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One manager, many firewalls. The management network (192.0.2.0/24) is out of band and is not drawn in the labs.</p></div>

<h3>What Panorama is not</h3>
<p>Be careful with two common beliefs. First, Panorama is not in the traffic path: user traffic never passes through it. Second, central management does not mean every setting must be central. Some settings are naturally local to a device, and we will draw that line in chapter 4.</p>

<h3>How this module is organised</h3>
<p>Chapters 2 to 4 explain what Panorama is and how it is built. Chapters 5 to 7 cover onboarding a firewall, reading its state, and fixing one that will not connect. Chapters 8 and 9 touch administrators and design choices. Chapters 10 to 12 walk through the three labs (<b>pn-connect</b>, <b>pn-connect-ts</b>, <b>pn-inventory</b>) and a capstone, and chapter 13 is the exam checklist.</p>

<div class="warn"><p><b>Honest boundaries.</b> The labs run a simulator, not real Palo Alto Networks software. There is no web GUI, no licensing and no certificates. Where real behaviour depends on the PAN-OS version, this text says so; check the documentation for your PAN-OS version before you rely on a detail in production.</p></div>

<div class="scn"><h4>The rule that reached only two of five sites</h4><p>A retail company added a rule to block an unsafe application. An engineer added it by hand on five firewalls over two days. Two firewalls got a typo in the application name and silently ignored the rule. An audit three months later found it. With a central manager the rule is written once, validated once, and sent to all five, and the inventory shows which sites have received it.</p><p><b>Lesson:</b> central management reduces mistakes by reducing the number of times a human types the same thing.</p></div>

<div class="iv"><p class="q">"Why would a company use Panorama instead of managing each firewall separately?"</p><p>Consistency (one definition of policy and objects), speed (change once, push to many), visibility (one inventory and one place for logs) and auditability. Add that Panorama is a management plane only; firewalls keep forwarding if it is unreachable.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Managing many firewalls one by one causes drift, slow change, poor visibility and weak audit.</li>
<li>Panorama is the central manager; it is not in the traffic path.</li>
<li>Firewalls keep working with their last configuration if Panorama is unreachable.</li>
<li>Central does not mean everything: some settings stay local.</li>
<li>The labs are a simulator; check your PAN-OS version documentation for real-world details.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> Firewalls ko ek-ek karke manage karna kyun fail hone lagta hai, central manager kaun si problems solve karta hai, aur ye module kaise organised hai. <b>Prerequisites:</b> aapko pata ho ki firewall zones ke beech traffic allow ya deny karta hai aur simple IP address aur subnet mask padh sakte ho. Isse zyada kuch assume nahi kiya gaya.</p></div>

<p>Socho ek school group ke teen campus hain. Har campus ka apna principal school rules notice board par likhta hai. Group ko ek naya rule chahiye, jaise "class mein mobile phone nahi", to kisi ko har campus jaakar har notice board badalna padega. Kabhi na kabhi ek principal bhool jayega, doosra rule thoda alag likh dega, aur koi parent shikayat karega ki rule Pune mein lagta hai par Delhi mein nahi. Head office jo rule ek baar publish karke har campus ko bhej de, wo ye sab khatam kar deta hai. Central firewall management wahi head office hai.</p>

<h3>Ek-ek karke management ki problem</h3>
<p>Network Kings (is module ki invented company) ke Pune, Delhi aur Chennai mein branch firewalls hain. Har firewall ki apni configuration hai: interfaces, zones, routes, security rules, address objects, logging settings. Teen firewalls ho to engineer har ek mein login kar sakta hai. Tees ya teen sau ho to wahi tarika chaar problems paida karta hai.</p>
<table class="tbl"><tr><th>Problem</th><th>Kaisi dikhti hai</th></tr>
<tr><td>Drift</td><td>Rule names, object values ya log settings sites ke beech thode alag ho jate hain, behaviour alag ho jata hai aur kisi ko wajah nahi pata.</td></tr>
<tr><td>Slow change</td><td>Ek naya rule matlab har firewall mein login; security fix sab sites tak pahunchne mein din lag jate hain.</td></tr>
<tr><td>Single view nahi</td><td>"Kaun se firewalls up hain aur unki state kya hai" jaanne ke liye har device alag check karna padta hai.</td></tr>
<tr><td>Weak audit</td><td>Poore estate mein kisne kya, kahan aur kab badla, ye dikhana mushkil hai.</td></tr>
</table>

<h3>Central manager kya deta hai</h3>
<p>Central manager intended configuration ek jagah rakhta hai aur use un devices ko bhejta hai jinhe wo chahiye. Palo Alto Networks ki duniya mein is product ka naam <b>Panorama</b> hai. Ye firewalls ko replace nahi karta; wo apne aap traffic inspect aur forward karte rehte hain. Panorama head office hai, traffic cop nahi. Panorama band ho jaye to branches last mili configuration ke saath traffic forward karte rehte hain; bas aap centrally change nahi kar paoge aur sabko ek jagah nahi dekh paoge.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Head office aur branches">
<rect x="250" y="15" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">NK-PANORAMA</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.50</text>
<rect x="30" y="140" width="150" height="56" rx="8" fill="#bae6fd"/><text x="105" y="165" text-anchor="middle" class="svg-ink" font-size="13">NK-PUNE-PA</text><text x="105" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.11</text>
<rect x="245" y="140" width="150" height="56" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">NK-DELHI-PA</text><text x="320" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.12</text>
<rect x="460" y="140" width="150" height="56" rx="8" fill="#bae6fd"/><text x="535" y="165" text-anchor="middle" class="svg-ink" font-size="13">NK-CHENNAI-PA</text><text x="535" y="183" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="290" y1="71" x2="105" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="71" x2="320" y2="140" stroke="#64748b" stroke-width="2"/><line x1="350" y1="71" x2="535" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek manager, kai firewalls. Management network (192.0.2.0/24) out of band hai aur labs ke diagram mein nahi dikhaya gaya.</p></div>

<h3>Panorama kya nahi hai</h3>
<p>Do common galatfehmiyon se bacho. Pehli, Panorama traffic path mein nahi hota: user traffic kabhi uske through nahi jata. Doosri, central management ka matlab ye nahi ki har setting central ho. Kuch settings naturally device-local hoti hain, aur ye line hum chapter 4 mein kheenchenge.</p>

<h3>Ye module kaise organised hai</h3>
<p>Chapters 2 se 4 batate hain Panorama kya hai aur kaise bana hai. Chapters 5 se 7 firewall ko onboard karna, uski state padhna aur na jurne wale firewall ko fix karna cover karte hain. Chapters 8 aur 9 administrators aur design choices ko chhute hain. Chapters 10 se 12 teen labs (<b>pn-connect</b>, <b>pn-connect-ts</b>, <b>pn-inventory</b>) aur capstone walk through karte hain, aur chapter 13 exam checklist hai.</p>

<div class="warn"><p><b>Honest boundaries.</b> Labs simulator chalate hain, real Palo Alto Networks software nahi. Web GUI, licensing aur certificates nahi hain. Jahan real behaviour PAN-OS version par depend karta hai, ye text wahi bata deta hai; production mein kisi detail par bharosa karne se pehle apne PAN-OS version ki documentation check karo.</p></div>

<div class="scn"><h4>Wo rule jo paanch mein se sirf do sites tak pahunchi</h4><p>Ek retail company ne unsafe application block karne ka rule jodna tha. Engineer ne do din mein paanch firewalls par haath se jodha. Do firewalls mein application ke naam mein typo thi aur unhone rule chupchaap ignore kar diya. Teen mahine baad audit mein pakda gaya. Central manager ke saath rule ek baar likha jata, ek baar validate hota, aur paanchon ko bheja jata, aur inventory dikhati ki kin sites ko mila.</p><p><b>Lesson:</b> central management insaan ke wahi cheez baar-baar type karne ki sankhya kam karke galtiyan kam karta hai.</p></div>

<div class="iv"><p class="q">"Company har firewall alag manage karne ke bajay Panorama kyun use karegi?"</p><p>Consistency (policy aur objects ki ek definition), speed (ek baar change, kai ko push), visibility (ek inventory aur logs ke liye ek jagah) aur auditability. Ye bhi jodo ki Panorama sirf management plane hai; unreachable ho to firewalls forward karte rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kai firewalls ko ek-ek karke manage karne se drift, slow change, poor visibility aur weak audit hota hai.</li>
<li>Panorama central manager hai; wo traffic path mein nahi hota.</li>
<li>Panorama unreachable ho to firewalls last configuration par chalte rehte hain.</li>
<li>Central ka matlab sab kuch nahi: kuch settings local rehti hain.</li>
<li>Labs simulator hain; real-world details ke liye apne PAN-OS version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};