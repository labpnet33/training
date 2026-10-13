var e={id:`groups`,h:{en:`Groups: dynamic, static, match ALL or ANY`,hi:`Groups: dynamic, static, match ALL ya ANY`},body:{en:`
<h3>Why this chapter matters</h3>
<p>Chapter 1 said a rule should name a role, not a machine. The object that turns tags into a role is the <b>group</b>. After this chapter you can:</p>
<ul>
<li>define a group and say where groups are used in a rule;</li>
<li>build a dynamic group from tag criteria or VM name criteria, and choose match ALL or match ANY;</li>
<li>build a static group and say when it is the right choice;</li>
<li>predict the member list of a group from the inventory, including the edge cases.</li>
</ul>

<h3>An analogy: two ways to make a class WhatsApp group</h3>
<p>A school can make a class group in two ways. Way one: "everyone whose class is 10-A is added automatically". When a new student joins 10-A, they appear in the group without anyone lifting a finger. Way two: the teacher types a list of phone numbers by hand. It is exact and under control, but when a new student joins, someone must remember to add the number.</p>
<p>The first way is a <b>dynamic group</b>. The second is a <b>static group</b>.</p>

<h3>What a group is</h3>
<p>A <b>group</b> is a named set of VMs. A rule uses a group in three places: as the <b>source</b>, as the <b>destination</b>, and in <b>Applied To</b> (chapter 3). The keyword <code>any</code> is not a group; it simply means every VM. You manage groups on the <b>Groups</b> page, which also shows the current members of each group.</p>

<h3>Dynamic groups</h3>
<p>A dynamic group has <b>criteria</b>, and the console re-checks every VM against them. Two kinds of criterion exist in the simulator:</p>
<ul>
<li><b>Tag criterion</b>: tag name equals value, for example app = web. The comparison is on <b>exact text</b>. The value <code>Web</code> with a capital W is not the same as <code>web</code>, and a value with a trailing space is not the same either.</li>
<li><b>Name criterion</b>: the VM name starts with, contains or equals some text, for example starts with <code>WEB-</code>. Name comparison ignores upper and lower case.</li>
</ul>
<p>With more than one criterion you choose how to combine them:</p>
<table class="cmp">
<tr><th>Match</th><th>Meaning</th><th>Narmada example</th></tr>
<tr><td>ALL</td><td>A VM must satisfy every criterion (AND)</td><td>app = web AND env = dev gives WEB-D</td></tr>
<tr><td>ANY</td><td>A VM needs to satisfy at least one (OR)</td><td>app = web OR env = dev gives WEB-P, WEB-D, APP-D, DB-D</td></tr>
</table>
<p>The numbers above come from running the engine on the Narmada inventory. Notice how ANY grows the group quickly. Beginners pick ANY when they wanted ALL and end up with a group far too large.</p>
<div class="warn"><p><b>A dynamic group with no criteria has no members.</b> It does not mean "everything". An empty criteria list matches nothing, so a half-finished group does not accidentally cover the whole data center.</p></div>

<h3>Static groups</h3>
<p>A static group is a fixed list of VMs that you tick by hand. Names that are not in the inventory are ignored. Use a static group when the membership is a deliberate decision and not a property that can be described by a tag, for example "the three VMs the auditor asked us to watch". The price is maintenance: nothing updates the list for you.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Dynamic group follows criteria, static group follows a list">
<rect x="20" y="20" width="280" height="170" rx="10" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">Dynamic: g-web-all</text>
<text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">rule: name starts with WEB-</text>
<rect x="40" y="80" width="70" height="30" rx="8" fill="#bbf7d0"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="12">WEB-P</text>
<rect x="125" y="80" width="70" height="30" rx="8" fill="#bbf7d0"/><text x="160" y="100" text-anchor="middle" class="svg-ink" font-size="12">WEB-D</text>
<rect x="210" y="80" width="70" height="30" rx="8" fill="#fde68a"/><text x="245" y="100" text-anchor="middle" class="svg-ink" font-size="12">WEB-X</text>
<text x="160" y="140" text-anchor="middle" class="svg-ink" font-size="12">New VM WEB-X joins by itself</text>
<rect x="340" y="20" width="280" height="170" rx="10" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">Static: g-db-all</text>
<text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">list typed by hand</text>
<rect x="380" y="80" width="80" height="30" rx="8" fill="#ddd6fe"/><text x="420" y="100" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<rect x="500" y="80" width="80" height="30" rx="8" fill="#ddd6fe"/><text x="540" y="100" text-anchor="middle" class="svg-ink" font-size="12">DB-D</text>
<text x="480" y="140" text-anchor="middle" class="svg-ink" font-size="12">A new DB VM stays out until edited in</text>
</svg><p class="cap">The dynamic group follows its rule. The static group follows its list.</p></div>

<h3>Worked example: the two helper groups (Lab 3)</h3>
<p>Operations asks for g-web-all (dynamic, name starts with WEB-) and g-db-all (static, DB-P and DB-D). After you publish them, the groups view reads like this (real engine output):</p>
<pre class="out">g-web-prod (dynamic): WEB-P
g-app-prod (dynamic): APP-P
g-db-prod (dynamic): DB-P
g-web-dev (dynamic): WEB-D
g-app-dev (dynamic): APP-D
g-db-dev (dynamic): DB-D
g-all-prod (dynamic): WEB-P, APP-P, DB-P
g-all-dev (dynamic): WEB-D, APP-D, DB-D
g-quarantine (dynamic): (no members)
<span class="hl">g-web-all (dynamic): WEB-P, WEB-D</span>
<span class="hl">g-db-all (static): DB-P, DB-D</span></pre>
<p>Now a new VM named WEB-X is added to the inventory. Re-running the same check gives g-web-all = WEB-P, WEB-D, WEB-X and g-db-all = DB-P, DB-D. The dynamic group picked up the new VM on its own. The static group did not change. Also note <code>g-quarantine</code>: it has no members because no VM carries the tag quarantine = true. Chapter 4 uses it for incident response.</p>

<h3>Choosing between them</h3>
<table class="cmp">
<tr><th>Question</th><th>Choose</th></tr>
<tr><td>Membership follows a property (role, environment)?</td><td>Dynamic by tag</td></tr>
<tr><td>VM names follow a reliable naming standard?</td><td>Dynamic by name (use with care)</td></tr>
<tr><td>Membership is a fixed, deliberate list?</td><td>Static</td></tr>
</table>
<p>Tags are usually better than names for identity, because a name carries one fact while tags can carry many, and people change names more casually than they edit a controlled tag.</p>

<div class="exam"><p><b>Exam trap.</b> "Which group type updates itself when a VM is added?" is dynamic. "Which comparison is case-sensitive?" is the tag value in this model. VM name criteria ignore case.</p></div>

<div class="scn"><h4>The group that swallowed dev</h4><p>An engineer built a group "prod web" with two criteria: app = web and env = prod, but left the match on ANY. Within minutes the group contained every web VM in dev as well as every prod VM. A deny rule intended for prod web servers started blocking dev tools. Switching the match to ALL restored the intended members at once, and the engineer added a check to the change checklist: read the member list on the Groups page before publishing.</p><p><b>Lesson:</b> ALL narrows, ANY widens. Always read the members.</p></div>

<div class="iv"><p class="q">"What is the difference between a static and a dynamic group, and when would you use each?"</p><p>Strong answer: a dynamic group evaluates criteria such as tags or names and updates its members automatically, so it suits roles and environments that change often. A static group is an explicit list, suited to small, deliberate sets where you want full control. Mention match ALL versus ANY and that an empty criteria list gives an empty group.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A group is a named set of VMs used as source, destination or Applied To.</li>
<li>Dynamic groups follow criteria (tag equals value, or VM name starts with, contains, equals).</li>
<li>Tag values are compared as exact text; VM names ignore case.</li>
<li>Match ALL means every criterion, ANY means at least one; ANY gives larger groups.</li>
<li>A dynamic group with no criteria is empty; a static group is a list you maintain.</li>
</ul></div>
`,hi:`
<h3>Yeh chapter kyun zaroori hai</h3>
<p>Chapter 1 ne kaha ki rule ko role ka naam lena chahiye, machine ka nahi. Tags ko role mein badalne wala object <b>group</b> hai. Is chapter ke baad aap yeh kar sakoge:</p>
<ul>
<li>group define kar sakoge aur bata sakoge ki rule mein group kahan use hota hai;</li>
<li>tag criteria ya VM name criteria se dynamic group bana sakoge, aur match ALL ya match ANY chun sakoge;</li>
<li>static group bana sakoge aur bata sakoge ki woh kab sahi choice hai;</li>
<li>inventory dekh kar group ki member list predict kar sakoge, edge cases ke saath.</li>
</ul>

<h3>Ek analogy: class ka WhatsApp group banane ke do tareeke</h3>
<p>School class group do tareeke se bana sakta hai. Pehla: "jiski class 10-A hai woh sab automatically add ho jaayein". Jab naya student 10-A mein aata hai, woh kisi ke kuch kiye bina group mein aa jaata hai. Doosra: teacher haath se phone numbers ki list type karti hai. Yeh exact hai aur control mein hai, lekin naya student aaye to kisi ko number add karna yaad rakhna padta hai.</p>
<p>Pehla tareeka <b>dynamic group</b> hai. Doosra <b>static group</b> hai.</p>

<h3>Group kya hai</h3>
<p><b>Group</b> VMs ka ek named set hai. Rule group ko teen jagah use karta hai: <b>source</b> mein, <b>destination</b> mein, aur <b>Applied To</b> mein (chapter 3). Keyword <code>any</code> group nahi hai; uska matlab bas har VM hai. Groups aap <b>Groups</b> page par manage karte ho, jo har group ke current members bhi dikhata hai.</p>

<h3>Dynamic groups</h3>
<p>Dynamic group ke paas <b>criteria</b> hote hain, aur console har VM ko unke against dobara check karta hai. Simulator mein do tarah ke criterion hain:</p>
<ul>
<li><b>Tag criterion</b>: tag name value ke barabar, jaise app = web. Comparison <b>exact text</b> par hota hai. Capital W wala <code>Web</code>, <code>web</code> ke barabar nahi hai, aur aakhir mein space wali value bhi barabar nahi hai.</li>
<li><b>Name criterion</b>: VM name kisi text se shuru hota hai, usmein hai ya uske barabar hai, jaise <code>WEB-</code> se shuru. Name comparison upper aur lower case ignore karta hai.</li>
</ul>
<p>Ek se zyada criteria hon to aap chunte ho unhe kaise milana hai:</p>
<table class="cmp">
<tr><th>Match</th><th>Matlab</th><th>Narmada example</th></tr>
<tr><td>ALL</td><td>VM ko har criterion satisfy karna hoga (AND)</td><td>app = web AND env = dev se WEB-D milta hai</td></tr>
<tr><td>ANY</td><td>VM ko kam se kam ek satisfy karna hoga (OR)</td><td>app = web OR env = dev se WEB-P, WEB-D, APP-D, DB-D milte hain</td></tr>
</table>
<p>Upar ke numbers Narmada inventory par engine chala kar aaye hain. Dekho ANY group ko kitni jaldi bada kar deta hai. Beginners ALL ki jagah ANY chun lete hain aur group bahut bada ho jaata hai.</p>
<div class="warn"><p><b>Bina criteria wale dynamic group mein koi member nahi hota.</b> Iska matlab "sab kuch" nahi hai. Khaali criteria list kuch match nahi karti, isliye adhura group galti se poore data center ko cover nahi kar leta.</p></div>

<h3>Static groups</h3>
<p>Static group VMs ki fixed list hai jo aap haath se tick karte ho. Jo names inventory mein nahi hain unhe ignore kiya jaata hai. Static group tab use karo jab membership ek soch-samajh kar liya faisla ho aur tag se describe na ho sake, jaise "woh teen VMs jinhe auditor ne watch karne ko kaha". Keemat maintenance hai: list ko koi khud update nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Dynamic group criteria follow karta hai, static group list follow karta hai">
<rect x="20" y="20" width="280" height="170" rx="10" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">Dynamic: g-web-all</text>
<text x="160" y="62" text-anchor="middle" class="svg-muted" font-size="12">rule: name WEB- se shuru</text>
<rect x="40" y="80" width="70" height="30" rx="8" fill="#bbf7d0"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="12">WEB-P</text>
<rect x="125" y="80" width="70" height="30" rx="8" fill="#bbf7d0"/><text x="160" y="100" text-anchor="middle" class="svg-ink" font-size="12">WEB-D</text>
<rect x="210" y="80" width="70" height="30" rx="8" fill="#fde68a"/><text x="245" y="100" text-anchor="middle" class="svg-ink" font-size="12">WEB-X</text>
<text x="160" y="140" text-anchor="middle" class="svg-ink" font-size="12">Naya VM WEB-X khud join hota hai</text>
<rect x="340" y="20" width="280" height="170" rx="10" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">Static: g-db-all</text>
<text x="480" y="62" text-anchor="middle" class="svg-muted" font-size="12">list haath se type ki</text>
<rect x="380" y="80" width="80" height="30" rx="8" fill="#ddd6fe"/><text x="420" y="100" text-anchor="middle" class="svg-ink" font-size="12">DB-P</text>
<rect x="500" y="80" width="80" height="30" rx="8" fill="#ddd6fe"/><text x="540" y="100" text-anchor="middle" class="svg-ink" font-size="12">DB-D</text>
<text x="480" y="140" text-anchor="middle" class="svg-ink" font-size="12">Naya DB VM edit kiye bina bahar rehta hai</text>
</svg><p class="cap">Dynamic group apne rule ko follow karta hai. Static group apni list ko.</p></div>

<h3>Worked example: do helper groups (Lab 3)</h3>
<p>Operations g-web-all (dynamic, name WEB- se shuru) aur g-db-all (static, DB-P aur DB-D) maangti hai. Publish karne ke baad groups view aisa dikhta hai (real engine output):</p>
<pre class="out">g-web-prod (dynamic): WEB-P
g-app-prod (dynamic): APP-P
g-db-prod (dynamic): DB-P
g-web-dev (dynamic): WEB-D
g-app-dev (dynamic): APP-D
g-db-dev (dynamic): DB-D
g-all-prod (dynamic): WEB-P, APP-P, DB-P
g-all-dev (dynamic): WEB-D, APP-D, DB-D
g-quarantine (dynamic): (no members)
<span class="hl">g-web-all (dynamic): WEB-P, WEB-D</span>
<span class="hl">g-db-all (static): DB-P, DB-D</span></pre>
<p>Ab inventory mein WEB-X naam ka naya VM jodte hain. Wahi check dobara chalane par g-web-all = WEB-P, WEB-D, WEB-X aur g-db-all = DB-P, DB-D milta hai. Dynamic group ne naya VM khud utha liya. Static group nahi badla. <code>g-quarantine</code> ko bhi dekho: usmein koi member nahi hai kyunki kisi VM par tag quarantine = true nahi hai. Chapter 4 ise incident response ke liye use karta hai.</p>

<h3>Dono mein se chunna</h3>
<table class="cmp">
<tr><th>Sawal</th><th>Chuno</th></tr>
<tr><td>Membership kisi property (role, environment) ke peeche chalti hai?</td><td>Tag se dynamic</td></tr>
<tr><td>VM names ek bharosemand naming standard follow karte hain?</td><td>Name se dynamic (dhyan se use karo)</td></tr>
<tr><td>Membership fixed, soch-samajh kar banayi list hai?</td><td>Static</td></tr>
</table>
<p>Identity ke liye tags aam taur par names se behtar hain, kyunki name ek fact rakhta hai jabki tags kai facts rakh sakte hain, aur log names ko controlled tag ke mukable zyada aasani se badal dete hain.</p>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa group type VM jodne par khud update hota hai?" dynamic hai. "Kaunsa comparison case-sensitive hai?" is model mein tag value hai. VM name criteria case ignore karte hain.</p></div>

<div class="scn"><h4>Woh group jo dev ko bhi nigal gaya</h4><p>Ek engineer ne "prod web" group do criteria se banaya: app = web aur env = prod, lekin match ANY par chhod diya. Kuch hi minute mein group mein dev ke saare web VMs bhi aa gaye aur saare prod VMs bhi. Prod web servers ke liye bana deny rule dev tools ko block karne laga. Match ko ALL karte hi intended members wapas aa gaye, aur engineer ne change checklist mein ek check jodha: publish se pehle Groups page par member list padho.</p><p><b>Seekh:</b> ALL chhota karta hai, ANY bada. Hamesha members padho.</p></div>

<div class="iv"><p class="q">"Static aur dynamic group mein kya fark hai, aur kab kaunsa use karoge?"</p><p>Strong answer: dynamic group tags ya names jaise criteria evaluate karta hai aur members automatically update karta hai, isliye woh un roles aur environments ke liye theek hai jo aksar badalte hain. Static group explicit list hai, chhote aur soch-samajh kar bane sets ke liye jahan poora control chahiye. Match ALL versus ANY aur yeh bhi bolo ki khaali criteria list se khaali group banta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Group VMs ka named set hai jo source, destination ya Applied To mein use hota hai.</li>
<li>Dynamic groups criteria follow karte hain (tag value ke barabar, ya VM name starts with, contains, equals).</li>
<li>Tag values exact text se compare hote hain; VM names case ignore karte hain.</li>
<li>Match ALL ka matlab har criterion, ANY ka matlab kam se kam ek; ANY bade groups deta hai.</li>
<li>Bina criteria wala dynamic group khaali hota hai; static group aisi list hai jo aap maintain karte ho.</li>
</ul></div>
`}};export{e as default};