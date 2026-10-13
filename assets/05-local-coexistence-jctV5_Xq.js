var e={id:`local-coexistence`,h:{en:`Coexisting with local policy and avoiding name clashes`,hi:`Local policy ke saath coexist karna aur name clashes se bachna`},body:{en:`
<p><b>Analogy.</b> Two teams share one whiteboard. If both write a task called "Order tea" the board gets confusing, and the cleaner might erase the wrong one. A firewall that holds both pushed rules and local rules has the same risk, so the rule is simple: <b>every rule name must be unique across pushed and local rules</b>.</p>

<h3>What coexistence means</h3>
<p>A managed firewall is not an empty box. It may already hold rules typed by the site team, rules left over from before Panorama, or rules added in an emergency. Panorama does not delete them when it pushes. It places its pre-rules above and its post-rules below, and leaves the local rules in the middle. That is why you can adopt Panorama on a firewall that already works without wiping its policy.</p>
<p>In the lab, the Pune firewall begins with a local rule that allows ping, DNS, web and TLS out. The Delhi firewall has the same plus a local vendor rule. Keep that picture in mind when you read the lab brief for <code>pn-local-vs-pushed</code>.</p>

<h3>Name clashes</h3>
<p>Panorama pushes each rule by name. If a pushed rule has the same name as an existing local rule, the push to that firewall <b>fails</b> and the firewall keeps its previous configuration. Other firewalls in the same push can still succeed, which is why the result says "completed with errors". The course lab reproduces this behaviour; the exact message is shown in the push output. Read the line for the failing firewall.</p>
<table class="tbl"><tr><th>Situation</th><th>Result</th><th>Fix</th></tr>
<tr><td>Pushed rule name is unique</td><td>Merged into the list</td><td>None needed</td></tr>
<tr><td>Same name as a local rule</td><td>Push fails for that firewall</td><td>Rename the central rule (or the local one)</td></tr>
<tr><td>Same name in two device group levels</td><td>Resolved at Panorama commit as a duplicate-name error in the same rulebase scope; check the documentation for your PAN-OS version for the exact scoping rules</td><td>Use a naming convention that includes the level</td></tr>
</table>

<h3>A naming convention that prevents clashes</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator): a convention</span>
SH-Block-Telnet-Out        <span class="c">! SH = Shared</span>
GL-Allow-Std-Out           <span class="c">! GL = global parent group</span>
BR-Deny-Rest-Log           <span class="c">! BR = branches child group</span>
LOC-Vendor-SSH-Out         <span class="c">! LOC = typed locally on a firewall</span></pre>
<p>With a prefix that tells you the origin, a clash is almost impossible and a rule name in a log or in <code>show running security-policy</code> immediately tells you which team to call.</p>

<h3>Seeing the mix</h3>
<p>Combining the two views gives the full story. <code>show running security-policy</code> shows the final order; <code>show config pushed-shared-policy</code> shows only what Panorama pushed. A rule present in the first but absent from the second is local:</p>
<pre class="out">admin@NK-DELHI-PA&gt; show running security-policy
"SH-Block-Telnet-Out; index: 1" { ... action deny; }
"Allow-Std-Out; index: 2" { ... action allow; }
"LOC-Vendor-SSH-Out; index: 3" { ... action allow; }
"BR-Deny-Rest-Log; index: 4" { ... action deny; }

admin@NK-DELHI-PA&gt; show config pushed-shared-policy
pre-rulebase { security { rules { SH-Block-Telnet-Out { ... } } } }
post-rulebase { security { rules { BR-Deny-Rest-Log { ... } } } }</pre>
<p>Here <code>Allow-Std-Out</code> and <code>LOC-Vendor-SSH-Out</code> do not appear in the pushed policy, so they are local.</p>

<div class="warn"><p><b>Common mistakes.</b> Reusing a generic name such as Allow-Web on both sides; deleting local rules during onboarding "to be clean" and breaking site-only access; changing a local rule when the real fix is a central pre-rule (or the opposite).</p></div>
<div class="exam"><p><b>Exam trap.</b> A name clash does not make the central rule win silently. It fails the push for that firewall. The other firewalls in the push may succeed.</p></div>

<div class="scn"><h4>Push completed with errors</h4><p>An engineer pushed a new device group rule called Allow-DNS. Pune and Chennai succeeded, Delhi failed. The Delhi site team had typed a local rule with the same name months earlier for a different purpose. Renaming the central rule with a prefix fixed Delhi without touching its local policy.</p><p><b>Lesson:</b> read the per-firewall result; one failure hides inside a mostly green push.</p></div>

<div class="iv"><p class="q">"A push failed for one firewall only. What do you check?"</p><p>The per-firewall line of the push result for the error text; common causes in policy pushes are a name clash with a local rule, a missing zone because the template has not been pushed, or a reference to an object that does not exist in that scope. I fix the cause and push again, then verify on the firewall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama pushes around the local rulebase; it does not delete local rules.</li>
<li>Rule names must be unique across pushed and local rules or the push fails for that firewall.</li>
<li>Use a prefix convention to show the origin of every rule.</li>
<li>A rule in the running policy but not in the pushed policy is local.</li>
<li>One failing firewall does not stop the others; always read per-firewall results.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Do teams ek whiteboard share karti hain. Agar dono "Order tea" naam ka task likhein to board confusing ho jata hai, aur safai wala galat wala mita sakta hai. Jis firewall par pushed rules aur local rules dono hon, uska risk wahi hai, isliye rule seedha hai: <b>har rule name pushed aur local rules ke beech unique hona chahiye</b>.</p>

<h3>Coexistence ka matlab</h3>
<p>Managed firewall khali box nahi hota. Usme site team ki type ki rules, Panorama se pehle ki bachi rules, ya emergency mein jodi rules ho sakti hain. Panorama push karte waqt unhe delete nahi karta. Wo apni pre-rules upar aur post-rules neeche rakhta hai, aur local rules beech mein chhodta hai. Isiliye jo firewall pehle se kaam kar raha hai us par policy wipe kiye bina Panorama adopt kar sakte ho.</p>
<p>Lab mein Pune firewall ek local rule se shuru hota hai jo ping, DNS, web aur TLS out allow karti hai. Delhi firewall mein wahi plus ek local vendor rule hai. <code>pn-local-vs-pushed</code> ka lab brief padhte waqt ye picture dimaag mein rakho.</p>

<h3>Name clashes</h3>
<p>Panorama har rule ko naam se push karta hai. Agar pushed rule ka naam kisi existing local rule jaisa ho, to us firewall ka push <b>fail</b> hota hai aur firewall apni pichhli configuration rakhta hai. Usi push ke doosre firewalls succeed kar sakte hain, isliye result "completed with errors" kehta hai. Course lab ye behaviour reproduce karta hai; exact message push output mein dikhta hai. Failing firewall ki line padho.</p>
<table class="tbl"><tr><th>Situation</th><th>Result</th><th>Fix</th></tr>
<tr><td>Pushed rule ka naam unique hai</td><td>List mein merge ho jati hai</td><td>Kuch nahi</td></tr>
<tr><td>Local rule jaisa hi naam</td><td>Us firewall ka push fail</td><td>Central rule (ya local) ka naam badlo</td></tr>
<tr><td>Do device group levels mein same naam</td><td>Panorama commit par duplicate-name error ban sakta hai; exact scoping rules ke liye apne PAN-OS version ki documentation check karo</td><td>Aisi naming convention jisme level ho</td></tr>
</table>

<h3>Naming convention jo clashes rokti hai</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator): ek convention</span>
SH-Block-Telnet-Out        <span class="c">! SH = Shared</span>
GL-Allow-Std-Out           <span class="c">! GL = global parent group</span>
BR-Deny-Rest-Log           <span class="c">! BR = branches child group</span>
LOC-Vendor-SSH-Out         <span class="c">! LOC = firewall par locally typed</span></pre>
<p>Origin batane wale prefix se clash lagbhag impossible ho jata hai, aur log ya <code>show running security-policy</code> mein rule ka naam dekhte hi pata chal jata hai ki kaunsi team ko call karna hai.</p>

<h3>Mix ko dekhna</h3>
<p>Dono views milakar poori kahani milti hai. <code>show running security-policy</code> final order dikhata hai; <code>show config pushed-shared-policy</code> sirf wo dikhata hai jo Panorama ne push kiya. Jo rule pehle mein hai par doosre mein nahi, wo local hai:</p>
<pre class="out">admin@NK-DELHI-PA&gt; show running security-policy
"SH-Block-Telnet-Out; index: 1" { ... action deny; }
"Allow-Std-Out; index: 2" { ... action allow; }
"LOC-Vendor-SSH-Out; index: 3" { ... action allow; }
"BR-Deny-Rest-Log; index: 4" { ... action deny; }

admin@NK-DELHI-PA&gt; show config pushed-shared-policy
pre-rulebase { security { rules { SH-Block-Telnet-Out { ... } } } }
post-rulebase { security { rules { BR-Deny-Rest-Log { ... } } } }</pre>
<p>Yahan <code>Allow-Std-Out</code> aur <code>LOC-Vendor-SSH-Out</code> pushed policy mein nahi dikhte, to wo local hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Dono taraf Allow-Web jaisa generic naam reuse karna; onboarding mein "clean" karne ke liye local rules delete karna aur site-only access tod dena; jab asli fix central pre-rule hai tab local rule badalna (ya ulta).</p></div>
<div class="exam"><p><b>Exam trap.</b> Name clash mein central rule chupchaap nahi jeet jati. Us firewall ka push fail hota hai. Push ke doosre firewalls succeed kar sakte hain.</p></div>

<div class="scn"><h4>Push completed with errors</h4><p>Ek engineer ne Allow-DNS naam ki nayi device group rule push ki. Pune aur Chennai succeed hue, Delhi fail. Delhi site team ne mahino pehle alag purpose se wahi naam ki local rule type ki thi. Central rule ko prefix ke saath rename karne se Delhi theek ho gaya, uski local policy chhue bina.</p><p><b>Lesson:</b> per-firewall result padho; ek failure zyadatar green push ke andar chhupi hoti hai.</p></div>

<div class="iv"><p class="q">"Push sirf ek firewall ke liye fail hua. Kya check karoge?"</p><p>Push result ki per-firewall line mein error text; policy pushes mein aam wajahein hain local rule ke saath name clash, template push na hone se missing zone, ya us scope mein na hone wale object ka reference. Wajah fix karke dobara push karta hoon, phir firewall par verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama local rulebase ke around push karta hai; local rules delete nahi karta.</li>
<li>Rule names pushed aur local ke beech unique hone chahiye warna us firewall ka push fail hota hai.</li>
<li>Har rule ka origin dikhane ke liye prefix convention use karo.</li>
<li>Running policy mein hai par pushed policy mein nahi, to wo rule local hai.</li>
<li>Ek failing firewall baaki ko nahi rokta; hamesha per-firewall results padho.</li>
</ul></div>
`}};export{e as default};