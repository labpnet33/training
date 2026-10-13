var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long journey you walk through a packing list: tickets, charger, keys, water. You do not re-learn travelling; you confirm nothing is forgotten. This last chapter is that list for templates, stacks and variables. If you can explain each line in your own words and show it in the lab, you are ready for the module exam and for interviews.</p>

<h3>The whole module on one page</h3>
<table class="tbl"><thead><tr><th>Topic</th><th>Remember</th></tr></thead><tbody>
<tr><td>Template</td><td>Network and device configuration: interfaces, zones, routes, server profiles. Policy and objects live in device groups.</td></tr>
<tr><td>Stack</td><td>Ordered template list plus firewalls plus variable values.</td></tr>
<tr><td>Priority</td><td>First template listed has highest priority and wins identical settings; the rest merge.</td></tr>
<tr><td>Variables</td><td>Definition (name, type) lives on the template; values on stack or device entry. Device entry beats stack value beats template default. None means no default.</td></tr>
<tr><td>Types</td><td>Checked at commit to Panorama; wrong type fails early.</td></tr>
<tr><td>Commit and push</td><td>Commit changes Panorama only. Push sends the committed configuration. Out of Sync appears between them.</td></tr>
<tr><td>Per-firewall results</td><td>Each firewall is validated separately; a failing one keeps its old configuration.</td></tr>
<tr><td>Evidence</td><td>show devices all, show config pushed-template, show config running, show interface all, show jobs all.</td></tr>
<tr><td>Override</td><td>A local value beats the template and survives a normal push. force-template-values removes local values the template defines.</td></tr>
<tr><td>Change safely</td><td>Blast radius, test stack, validate-only, one device first, verify, record.</td></tr>
</tbody></table>

<h3>Commands you must be able to type</h3>
<pre class="code">set template-stack NK-STACK templates [ NK-BRANCH-NET ]
set template-stack NK-STACK devices &lt;serial&gt;
set template-stack NK-STACK variable $name type ip-netmask &lt;value&gt;
set template-stack NK-STACK devices &lt;serial&gt; variable $name type ip-netmask &lt;value&gt;
commit-all template-stack name NK-STACK [validate-only yes] [device &lt;serial&gt;] [force-template-values yes]
show templates | show template-stack | show devices all
show config pushed-template | show config running | show interface all</pre>

<h3>Exam checklist</h3>
<ul>
<li>I can say which settings belong in a template and which in a device group.</li>
<li>I can read a stack list and say which template wins.</li>
<li>I can name the three places a variable value can live and their precedence.</li>
<li>I can explain why a push to one firewall fails while another succeeds.</li>
<li>I can tell the difference between commit and push, and say why a forgotten commit explains "nothing changed".</li>
<li>I can show an override with pushed-template versus running and remove it.</li>
<li>I can plan a staged rollout with validate-only and a test device.</li>
<li>I can state the simulator's boundaries and say "check the documentation for your PAN-OS version" for version facts.</li>
</ul>

<div class="warn"><p><b>Common mistakes in the exam.</b> Reading stack order backwards; thinking In Sync proves the effective value; putting policy in a template; forgetting that a missing variable only fails the firewall that lacks it; pushing without committing.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often give two true-looking answers. Ask yourself: is this about what Panorama stores (candidate or running), what it sent (pushed-template), or what the firewall uses (running)? The right answer is usually the one aimed at the correct view.</p></div>

<div class="scn"><h4>A twenty-minute whiteboard answer</h4><p>In a final interview a candidate was asked to design templates for a company with three regions. He drew four layers, named a few variables, explained the order in the stack, described how a push is validated per firewall, and finished with how he would catch override drift every month. He did not know every command by heart, but his structure was clear, and he said where the documentation would be checked. He got the offer.</p></div>

<div class="iv"><p class="q">"Summarise how templates, stacks and variables work in Panorama."</p><p>Templates hold network and device configuration. A stack orders templates, assigns them to firewalls and holds variable values, with the first template winning on conflicts and device values beating stack values beating template defaults. I commit on Panorama, validate, push to one device then more, and prove the result by comparing pushed-template with running.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template equals network and device config; device group equals policy and objects.</li>
<li>Stack equals ordered templates plus firewalls plus variable values.</li>
<li>Commit changes Panorama; push delivers; evidence comes from the firewall.</li>
<li>Overrides win until deleted or forced; govern the process.</li>
<li>Do the three labs again until you can explain each result without notes.</li>
</ul></div>
`,hi:`
<p>Lambi journey se pehle tum packing list dekhte ho: tickets, charger, chaabi, paani. Tum travelling dobara nahi seekhte; confirm karte ho ki kuch bhoola nahi. Ye aakhri chapter templates, stacks aur variables ke liye wahi list hai. Agar tum har line apne shabdon mein samjha sako aur lab mein dikha sako to tum module exam aur interviews ke liye taiyaar ho.</p>

<h3>Poora module ek page par</h3>
<table class="tbl"><thead><tr><th>Topic</th><th>Yaad rakho</th></tr></thead><tbody>
<tr><td>Template</td><td>Network aur device configuration: interfaces, zones, routes, server profiles. Policy aur objects device groups mein.</td></tr>
<tr><td>Stack</td><td>Ordered template list plus firewalls plus variable values.</td></tr>
<tr><td>Priority</td><td>Pehla listed template highest priority rakhta hai aur identical settings par jeetta hai; baaki merge hote hain.</td></tr>
<tr><td>Variables</td><td>Definition (naam, type) template par; values stack ya device entry par. Device entry stack value ko, stack value template default ko haraati hai. None matlab default nahi.</td></tr>
<tr><td>Types</td><td>Panorama par commit mein check hote hain; galat type jaldi fail.</td></tr>
<tr><td>Commit aur push</td><td>Commit sirf Panorama badalta hai. Push committed configuration bhejta hai. Beech mein Out of Sync dikhta hai.</td></tr>
<tr><td>Per-firewall results</td><td>Har firewall alag validate hota hai; failing wala purani configuration rakhta hai.</td></tr>
<tr><td>Evidence</td><td>show devices all, show config pushed-template, show config running, show interface all, show jobs all.</td></tr>
<tr><td>Override</td><td>Local value template ko haraati hai aur normal push se bachti hai. force-template-values template ki defined local values hata deta hai.</td></tr>
<tr><td>Safely change</td><td>Blast radius, test stack, validate-only, pehle ek device, verify, record.</td></tr>
</tbody></table>

<h3>Wo commands jo tumhe type karni aani chahiye</h3>
<pre class="code">set template-stack NK-STACK templates [ NK-BRANCH-NET ]
set template-stack NK-STACK devices &lt;serial&gt;
set template-stack NK-STACK variable $name type ip-netmask &lt;value&gt;
set template-stack NK-STACK devices &lt;serial&gt; variable $name type ip-netmask &lt;value&gt;
commit-all template-stack name NK-STACK [validate-only yes] [device &lt;serial&gt;] [force-template-values yes]
show templates | show template-stack | show devices all
show config pushed-template | show config running | show interface all</pre>

<h3>Exam checklist</h3>
<ul>
<li>Main bata sakta hoon ki kaunsi settings template mein aur kaunsi device group mein.</li>
<li>Main stack list padhkar bata sakta hoon ki kaunsa template jeetta hai.</li>
<li>Main variable value ki teen jagah aur unki precedence bata sakta hoon.</li>
<li>Main samjha sakta hoon ki ek firewall ka push fail aur doosre ka succeed kyun hota hai.</li>
<li>Main commit aur push ka fark bata sakta hoon, aur ye ki bhoola hua commit "kuch nahi badla" kyun samjhata hai.</li>
<li>Main pushed-template versus running se override dikha aur hata sakta hoon.</li>
<li>Main validate-only aur test device ke saath staged rollout plan kar sakta hoon.</li>
<li>Main simulator ki boundaries bata sakta hoon aur version facts ke liye "apne PAN-OS version ki documentation check karo" keh sakta hoon.</li>
</ul>

<div class="warn"><p><b>Exam mein common mistakes.</b> Stack order ulta padhna; In Sync ko effective value ka proof samajhna; policy ko template mein rakhna; ye bhoolna ki missing variable sirf usi firewall ko fail karta hai jisme wo nahi; commit ke bina push.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal aksar do sahi dikhne wale jawab dete hain. Khud se puchho: ye Panorama kya store karta hai (candidate ya running), kya bheja (pushed-template), ya firewall kya use karta hai (running) ke baare mein hai? Sahi jawab aksar wahi hai jo sahi view ko target kare.</p></div>

<div class="scn"><h4>Bees minute ka whiteboard jawab</h4><p>Final interview mein candidate se teen regions ki company ke liye templates design karne ko kaha gaya. Usne chaar layers draw ki, kuch variables ke naam rakhe, stack mein order samjhaya, batata gaya ki push har firewall par kaise validate hota hai, aur ant mein bataya ki wo har mahine override drift kaise pakdega. Use har command ratta hua nahi tha, par structure clear tha, aur usne bataya ki documentation kahan check hogi. Use offer mila.</p></div>

<div class="iv"><p class="q">"Panorama mein templates, stacks aur variables ka summary do."</p><p>Templates network aur device configuration rakhte hain. Stack templates ko order karta hai, firewalls ko assign karta hai aur variable values rakhta hai, conflicts par pehla template jeetta hai aur device values stack values ko, stack values template defaults ko haraati hain. Panorama par commit, validate, pehle ek device phir zyada ko push, aur pushed-template ko running se compare karke result prove karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template = network aur device config; device group = policy aur objects.</li>
<li>Stack = ordered templates plus firewalls plus variable values.</li>
<li>Commit Panorama badalta hai; push deliver karta hai; evidence firewall se aata hai.</li>
<li>Overrides tab tak jeette hain jab tak delete ya force na ho; process govern karo.</li>
<li>Teeno labs tab tak dohrao jab tak har result bina notes ke samjha sako.</li>
</ul></div>
`}};export{e as default};