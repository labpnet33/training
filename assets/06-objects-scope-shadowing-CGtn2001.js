var e={id:`objects-shadowing`,h:{en:`Objects: scope, inheritance, shadowing and what a rule may reference`,hi:`Objects: scope, inheritance, shadowing aur rule kya reference kar sakti hai`},body:{en:`
<p><b>Analogy.</b> In a company directory the name "Reception" points to one phone number at head office. The Chennai office has its own reception with a different number. Staff in Chennai who dial "Reception" reach their local desk; everyone else reaches head office. The name is the same, the meaning depends on <i>where you are</i>. Objects in device groups behave like this.</p>

<h3>What an object is, and why names matter</h3>
<p>An <b>address object</b> gives a name to an IP network (for example a partner range). A <b>service object</b> names a protocol and port. Groups combine several objects. Rules refer to the <i>names</i>, so when a range changes you edit the object once instead of every rule. In the lab Panorama manages four kinds: address, address-group, service and service-group.</p>

<h3>Scope and inheritance</h3>
<p>An object lives in a location: Shared, a parent group or a child group. A rule can use an object only if the object is <b>visible from the rule's own group</b>: Shared, then the parent chain, then the group itself. This gives two consequences:</p>
<ul>
<li>A rule in Shared can use only Shared objects. If it names an object that exists only in a child group, the commit on Panorama fails with a reference error. A Shared rule cannot see downwards.</li>
<li>A rule in a child group can use objects from its own group, its parent and Shared.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Object visibility">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">Shared</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">sees: Shared only</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Parent group</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">sees: parent + Shared</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">Child group</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">sees: child + parent + Shared</text>
<text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">A rule can use only what its own group can see</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Visibility grows as you go down; it never grows upwards.</text>
</svg><p class="cap">Where you create the rule decides which object names it may use.</p></div>

<h3>Shadowing (override)</h3>
<p>If a child group creates an object with the <b>same name</b> as a Shared or parent object, the child's object <b>shadows</b> (overrides) the higher one for firewalls in that child group. The rule itself does not change; only the value behind its name does. Panorama pushes the right value to each firewall according to its group.</p>
<pre class="code"><span class="c">! The same name, two meanings (illustration with a different object than the lab)</span>
admin@NK-PANORAMA# set shared address SERVER-NET ip-netmask 10.50.0.0/24
admin@NK-PANORAMA# set device-group NK-SOUTH address SERVER-NET ip-netmask 10.60.0.0/24
admin@NK-PANORAMA# commit</pre>
<p>Firewalls in NK-SOUTH resolve <code>SERVER-NET</code> to 10.60.0.0/24; every other group keeps 10.50.0.0/24. A rule written once in Shared works correctly for both. You can see the resolved value on a firewall with <code>show config pushed-shared-policy</code>, which prints the address block that firewall actually received.</p>

<h3>Local objects</h3>
<p>A firewall can also have a local object with the same name as a pushed one. In the course lab the local one wins on that firewall (a simplification; check the documentation for your PAN-OS version for the real precedence rules). Treat this as a warning sign rather than a feature: the central rule is now using a value Panorama did not choose.</p>

<table class="tbl"><tr><th>Goal</th><th>Technique</th></tr>
<tr><td>Same value everywhere</td><td>One object in Shared</td></tr>
<tr><td>Different value for one region</td><td>Same name in that region's device group (shadow)</td></tr>
<tr><td>A new name only that region uses</td><td>A new object in that region's group</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A Shared rule allows traffic to SERVER-NET. Pune (group A) uses 10.50.0.0/24. Chennai (group B) reaches the same service at 10.60.0.0/24. Instead of cloning the rule, you create SERVER-NET in group B. After pushes to both groups, <code>show config pushed-shared-policy</code> on Chennai shows 10.60.0.0/24; on Pune 10.50.0.0/24. The rule is identical on both.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating the shadow object but forgetting to push that group; creating an object in a child group and then referring to it from a Shared rule (reference error at commit); shadowing without telling anyone, so the next engineer reads Shared and misses Chennai's different value.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shadowing changes <b>the value behind a name</b>, not the rule. And a rule can reference only objects visible in its own device group's scope.</p></div>

<div class="scn"><h4>Same rule, different partner range</h4><p>A bank branch network reached a payment partner through two different ranges, one per region. The first design copied the Shared rule into a regional group with a hard-coded range. A year later the partner changed the northern range and only one rule was updated. The second design used one rule and a shadowed object; a range change became one object edit in one group.</p><p><b>Lesson:</b> shadow objects, do not clone rules.</p></div>

<div class="iv"><p class="q">"How do you apply one policy across regions when a destination range differs by region?"</p><p>I keep one rule in Shared that uses an address object name, define the object in Shared, and create a same-named object in the device group of the region that differs. The child's object shadows the Shared one for its firewalls. I document the override and verify the resolved value on a firewall in each region.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects live in Shared, a parent or a child; a rule sees only objects visible from its own group.</li>
<li>A same-named object in a child shadows the higher one for that child's firewalls.</li>
<li>Shadowing changes the value behind the name; the rule stays identical.</li>
<li>A Shared rule cannot reference a child-only object; Panorama commit rejects it.</li>
<li>Verify the resolved value on the firewall, and document every override.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Company directory mein "Reception" naam head office ke ek phone number ko point karta hai. Chennai office ki apni reception hai jiska number alag hai. Chennai ka staff "Reception" dial kare to apne local desk par pahunchta hai; baaki sab head office. Naam same hai, matlab is par depend karta hai ki <i>aap kahan ho</i>. Device groups ke objects aise hi behave karte hain.</p>

<h3>Object kya hai, aur naam kyun matter karte hain</h3>
<p><b>Address object</b> IP network ko naam deta hai (jaise partner range). <b>Service object</b> protocol aur port ko naam deta hai. Groups kai objects ko jodte hain. Rules <i>naam</i> refer karti hain, isliye range badle to har rule ki jagah object ek baar edit karte ho. Lab mein Panorama chaar kinds manage karta hai: address, address-group, service aur service-group.</p>

<h3>Scope aur inheritance</h3>
<p>Object ek location mein rehta hai: Shared, parent group ya child group. Rule object tabhi use kar sakti hai jab object <b>rule ke apne group se visible</b> ho: Shared, phir parent chain, phir group khud. Iske do natije hain:</p>
<ul>
<li>Shared ki rule sirf Shared objects use kar sakti hai. Agar wo aise object ka naam le jo sirf child group mein hai, to Panorama par commit reference error se fail hota hai. Shared rule neeche nahi dekh sakti.</li>
<li>Child group ki rule apne group, parent aur Shared ke objects use kar sakti hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Object visibility">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">Shared</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">dekhta hai: sirf Shared</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Parent group</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">dekhta hai: parent + Shared</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">Child group</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">dekhta hai: child + parent + Shared</text>
<text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">Rule sirf wahi use kar sakti hai jo uska group dekh sakta hai</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Visibility neeche jaate badhti hai; upar ki taraf kabhi nahi.</text>
</svg><p class="cap">Rule jahan banate ho wahi decide karta hai ki wo kaunse object names use kar sakti hai.</p></div>

<h3>Shadowing (override)</h3>
<p>Agar child group Shared ya parent object ke <b>same naam</b> ka object banata hai, to child ka object us child group ke firewalls ke liye upar wale ko <b>shadow</b> (override) karta hai. Rule khud nahi badalti; sirf naam ke peeche ki value badalti hai. Panorama har firewall ko uske group ke hisaab se sahi value push karta hai.</p>
<pre class="code"><span class="c">! Same naam, do matlab (lab se alag object ka illustration)</span>
admin@NK-PANORAMA# set shared address SERVER-NET ip-netmask 10.50.0.0/24
admin@NK-PANORAMA# set device-group NK-SOUTH address SERVER-NET ip-netmask 10.60.0.0/24
admin@NK-PANORAMA# commit</pre>
<p>NK-SOUTH ke firewalls <code>SERVER-NET</code> ko 10.60.0.0/24 resolve karte hain; baaki har group 10.50.0.0/24 rakhta hai. Shared mein ek baar likhi rule dono ke liye sahi chalti hai. Firewall par resolved value <code>show config pushed-shared-policy</code> se dekh sakte ho, jo us firewall ko mila address block print karta hai.</p>

<h3>Local objects</h3>
<p>Firewall par bhi pushed object ke same naam ka local object ho sakta hai. Course lab mein us firewall par local wala jeetta hai (simplification; asli precedence rules ke liye apne PAN-OS version ki documentation check karo). Ise feature nahi, warning sign samjho: central rule ab wo value use kar rahi hai jo Panorama ne choose nahi ki.</p>

<table class="tbl"><tr><th>Goal</th><th>Technique</th></tr>
<tr><td>Har jagah same value</td><td>Shared mein ek object</td></tr>
<tr><td>Ek region ke liye alag value</td><td>Us region ke device group mein same naam (shadow)</td></tr>
<tr><td>Sirf us region ka naya naam</td><td>Us region ke group mein naya object</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Shared rule SERVER-NET tak traffic allow karti hai. Pune (group A) 10.50.0.0/24 use karta hai. Chennai (group B) wahi service 10.60.0.0/24 par pahunchta hai. Rule clone karne ki jagah aap group B mein SERVER-NET banate ho. Dono groups push karne ke baad Chennai par <code>show config pushed-shared-policy</code> 10.60.0.0/24 dikhata hai; Pune par 10.50.0.0/24. Rule dono par identical hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Shadow object bana kar us group ko push karna bhool jana; child group mein object bana kar Shared rule se refer karna (commit par reference error); kisi ko bataye bina shadow karna, taaki agla engineer Shared padhe aur Chennai ki alag value miss kar de.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shadowing <b>naam ke peeche ki value</b> badalti hai, rule nahi. Aur rule sirf wahi objects reference kar sakti hai jo uske apne device group ke scope mein visible hon.</p></div>

<div class="scn"><h4>Same rule, alag partner range</h4><p>Ek bank branch network payment partner tak do alag ranges se pahunchta tha, har region ke liye ek. Pehle design ne Shared rule ko regional group mein hard-coded range ke saath copy kiya. Saal baad partner ne northern range badli aur sirf ek rule update hui. Doosre design mein ek rule aur shadowed object tha; range change ek group mein ek object edit ban gaya.</p><p><b>Lesson:</b> objects shadow karo, rules clone mat karo.</p></div>

<div class="iv"><p class="q">"Jab destination range region ke hisaab se alag ho tab ek policy regions mein kaise lagaoge?"</p><p>Shared mein ek rule jo address object ka naam use kare, Shared mein object define karta hoon, aur jis region ka alag hai uske device group mein same-named object banata hoon. Child ka object uske firewalls ke liye Shared wale ko shadow karta hai. Override document karta hoon aur har region ke ek firewall par resolved value verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects Shared, parent ya child mein rehte hain; rule sirf apne group se visible objects dekhti hai.</li>
<li>Child mein same-named object us child ke firewalls ke liye upar wale ko shadow karta hai.</li>
<li>Shadowing naam ke peeche ki value badalti hai; rule identical rehti hai.</li>
<li>Shared rule child-only object reference nahi kar sakti; Panorama commit reject karta hai.</li>
<li>Firewall par resolved value verify karo, aur har override document karo.</li>
</ul></div>
`}};export{e as default};