var e={id:`priority-and-order`,h:{en:`Priority and order inside a stack`,hi:`Stack ke andar priority aur order`},body:{en:`
<p>When several people give you instructions about the same task, you need a rule for whose word counts. In a family, the head of the house wins over a cousin. In a template stack the rule is just as simple: when two templates in the same stack set the <i>same</i> value, one of them must win. In the lab, <b>the template listed first, at the top of the stack, has the highest priority and wins</b>. The ones below it only supply values that the higher ones do not set.</p>

<h3>Only conflicts matter</h3>
<p>Most settings are not in conflict. If NK-GLOBAL sets a management profile and NK-BRANCH-NET sets interfaces, both are simply merged. Priority only decides when the same setting, in the same place, appears in more than one template with different values. Think of two painters coloring the same wall. If they paint different walls, nothing is lost. If they paint the same wall, the colour that is applied last is visible; Panorama's order decides which painter that is.</p>
<table class="tbl"><thead><tr><th>Stack order (top first)</th><th>NK-GLOBAL says</th><th>NK-REGION says</th><th>Result for ethernet1/1 MTU</th></tr></thead><tbody>
<tr><td>NK-GLOBAL, NK-REGION</td><td>1500</td><td>1400</td><td>1500</td></tr>
<tr><td>NK-REGION, NK-GLOBAL</td><td>1500</td><td>1400</td><td>1400</td></tr>
<tr><td>Either order, only one sets MTU</td><td>1500</td><td>(not set)</td><td>1500</td></tr>
</tbody></table>

<h3>Reading the order in the lab</h3>
<p>The stack command shows the order with the highest priority first. In the second lab, <code>pn-tpl-priority</code>, you will see a stack where the global template is listed above the regional one.</p>
<pre class="code">PANO&gt; show template-stack

Stack NK-STACK:
    Templates (highest priority first): NK-GLOBAL, NK-REGION, NK-BRANCH-NET
    0079185321121     NK-PUNE-PA          Template: Out of Sync
    0079134988264     NK-DELHI-PA         Template: Out of Sync</pre>
<p>Read it carefully. If both NK-GLOBAL and NK-REGION set the same value, the line above tells you which one the firewall will receive. You do not need to guess; you read the line.</p>

<h3>Changing the order</h3>
<p>The templates list in the lab is a list with a position. To move a template, you remove it and add it again; the lab then places the re-added one according to its order rule, and you verify the result with <code>show template-stack</code>. Never assume; always read the list after the change. The lab brief gives the logic (the template higher in the list has priority); your job is to prove the outcome on the firewall, not to trust the command.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator): the pattern, with a placeholder name</span>
delete template-stack NK-STACK templates &lt;template&gt;
set    template-stack NK-STACK templates &lt;template&gt;
commit
<span class="c">then push, then read the effective value on the firewall</span></pre>

<h3>Order versus layering</h3>
<p>A good habit is to put the most specific template on top and the most general at the bottom. Specific means "closer to the site": a region overrides the global default, a site overrides a region. This is a design choice, not a law; what the product enforces is only the order. The documentation for your PAN-OS version describes exactly how merging is evaluated for each setting type.</p>

<div class="warn"><p><b>Common mistake.</b> Reading the list backwards. In this lab the first name is the strongest. If you expect the last name to win, you will fix the wrong template.</p></div>
<div class="exam"><p><b>Exam trap.</b> A higher priority does not delete the lower template's other settings. Only the identical setting is overridden; everything else is merged.</p></div>

<div class="scn"><h4>The tunnel MTU that went wrong</h4><p>A region's ISP carried traffic in a tunnel, so the region needed MTU 1400 while the global default was 1500. The regional template was correct, yet the firewalls kept 1500 and users saw slow web pages. The cause was not the regional template at all: it sat below the global one in the stack. Moving it up, committing and pushing fixed the effective value, which the engineer then proved by reading the firewall's pushed configuration.</p></div>

<div class="iv"><p class="q">"Two templates in one stack set different values for the same setting. Which one does the firewall get?"</p><p>The one from the template higher in the stack order, where the first listed is highest priority in this course lab. Non-conflicting settings from both templates are merged. I would confirm by reading the stack list and the firewall's pushed template.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>First template in the list has the highest priority and wins on conflicts.</li>
<li>Only identical settings conflict; everything else is merged.</li>
<li>Read show template-stack to see the order, then prove the result on the firewall.</li>
<li>Put specific templates above general ones as a design habit.</li>
</ul></div>
`,hi:`
<p>Jab kai log ek hi kaam par instructions dete hain to batana padta hai ki kiski baat chalegi. Parivar mein ghar ke mukhiya ki baat cousin se upar hoti hai. Template stack mein rule utna hi simple hai: jab ek hi stack ke do templates <i>same</i> value set karte hain to ek ko jeetna padta hai. Lab mein <b>jo template list mein sabse pehle, stack ke top par hai, uski priority sabse zyada hai aur wahi jeetta hai</b>. Uske neeche wale sirf wo values dete hain jo upar wale set nahi karte.</p>

<h3>Sirf conflicts matter karte hain</h3>
<p>Zyada tar settings conflict mein nahi hoti. NK-GLOBAL management profile set kare aur NK-BRANCH-NET interfaces, to dono bas merge ho jaate hain. Priority tab decide karti hai jab wahi setting, wahi jagah, kai templates mein alag values ke saath aaye. Do painters ek hi deewar rang rahe hon: alag deewarein to kuch nahi khota. Ek hi deewar to jo rang aakhir mein lagta hai wo dikhta hai; Panorama ka order decide karta hai wo painter kaun hai.</p>
<table class="tbl"><thead><tr><th>Stack order (top pehle)</th><th>NK-GLOBAL kehta hai</th><th>NK-REGION kehta hai</th><th>ethernet1/1 MTU ka result</th></tr></thead><tbody>
<tr><td>NK-GLOBAL, NK-REGION</td><td>1500</td><td>1400</td><td>1500</td></tr>
<tr><td>NK-REGION, NK-GLOBAL</td><td>1500</td><td>1400</td><td>1400</td></tr>
<tr><td>Koi bhi order, sirf ek MTU set kare</td><td>1500</td><td>(set nahi)</td><td>1500</td></tr>
</tbody></table>

<h3>Lab mein order padhna</h3>
<p>Stack command order dikhata hai, highest priority pehle. Doosre lab <code>pn-tpl-priority</code> mein tumhe aisa stack dikhega jisme global template regional se upar listed hai.</p>
<pre class="code">PANO&gt; show template-stack

Stack NK-STACK:
    Templates (highest priority first): NK-GLOBAL, NK-REGION, NK-BRANCH-NET
    0079185321121     NK-PUNE-PA          Template: Out of Sync
    0079134988264     NK-DELHI-PA         Template: Out of Sync</pre>
<p>Dhyan se padho. Agar NK-GLOBAL aur NK-REGION dono same value set karte hain to upar ki line batati hai ki firewall ko kaunsi milegi. Andaza nahi lagana padta; line padhni hoti hai.</p>

<h3>Order badalna</h3>
<p>Lab mein templates list ek position wali list hai. Template ko hilane ke liye use remove karke dubara add karte ho; lab dubara add kiye gaye ko apne order rule ke hisaab se rakhta hai, aur result <code>show template-stack</code> se verify karte ho. Kabhi assume mat karo; change ke baad hamesha list padho. Lab brief logic deta hai (list mein upar wale template ki priority); tumhara kaam firewall par outcome prove karna hai, command par bharosa karna nahi.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator): pattern, placeholder naam ke saath</span>
delete template-stack NK-STACK templates &lt;template&gt;
set    template-stack NK-STACK templates &lt;template&gt;
commit
<span class="c">phir push, phir firewall par effective value padho</span></pre>

<h3>Order versus layering</h3>
<p>Achhi aadat: sabse specific template upar aur sabse general neeche. Specific matlab "site ke kareeb": region global default ko override kare, site region ko. Ye design choice hai, kanoon nahi; product sirf order enforce karta hai. Har setting type ke liye merging kaise evaluate hoti hai, uski exact detail apne PAN-OS version ki documentation mein hai.</p>

<div class="warn"><p><b>Common mistake.</b> List ulti padhna. Is lab mein pehla naam sabse strong hai. Agar tum maante ho ki aakhri naam jeetega to galat template fix karoge.</p></div>
<div class="exam"><p><b>Exam trap.</b> Higher priority neeche wale template ki baaki settings delete nahi karti. Sirf identical setting override hoti hai; baaki sab merge hota hai.</p></div>

<div class="scn"><h4>Tunnel MTU jo galat gaya</h4><p>Ek region ka ISP traffic tunnel mein le jaata tha, isliye region ko MTU 1400 chahiye tha jabki global default 1500 tha. Regional template sahi tha, phir bhi firewalls 1500 par rahe aur users ko slow web pages dikhe. Cause regional template nahi tha: wo stack mein global ke neeche tha. Use upar karke, commit aur push karne se effective value theek hui, jo engineer ne firewall ki pushed configuration padhkar prove ki.</p></div>

<div class="iv"><p class="q">"Ek stack ke do templates same setting par alag values set karte hain. Firewall ko kaunsi milegi?"</p><p>Jo template stack order mein upar hai uski, aur is course lab mein pehla listed highest priority hai. Non-conflicting settings dono templates se merge hoti hain. Main stack list aur firewall ka pushed template padhkar confirm karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List ka pehla template highest priority rakhta hai aur conflicts par jeetta hai.</li>
<li>Sirf identical settings conflict karti hain; baaki sab merge hota hai.</li>
<li>Order dekhne ke liye show template-stack padho, phir firewall par result prove karo.</li>
<li>Design aadat: specific templates general ke upar rakho.</li>
</ul></div>
`}};export{e as default};