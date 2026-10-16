var e={id:`why-templates-exist`,h:{en:`Why templates exist: one design, many sites`,hi:`Templates kyun hain: ek design, bahut sites`},body:{en:`
<p>Imagine a bakery chain with thirty shops. If the owner writes the recipe on a sticky note in each shop, thirty notes will slowly become thirty slightly different recipes. One shop uses less sugar, another forgot the salt, a third has a note nobody can read. Customers get a different cake everywhere. Managing firewalls one by one produces exactly this drift. A template is the central recipe card: change it once, and every shop that uses it gets the new recipe at the next delivery.</p>

<h3>The cost of doing it box by box</h3>
<p>MyPnetLab has three firewalls in the lab: NK-PUNE-PA, NK-DELHI-PA and NK-CHENNAI-PA. With three, hand configuration is annoying. With thirty it is a risk. Every manual step is a chance for a typo in an IP address, a forgotten zone, or a route that points to the wrong gateway. Worse, after six months nobody can say whether branch 17 follows the standard, because the standard only exists in people's heads.</p>
<table class="tbl"><thead><tr><th>Concern</th><th>Box by box</th><th>With templates</th></tr></thead><tbody>
<tr><td>New branch</td><td>Retype everything, hope nothing is missed</td><td>Add the firewall to a stack, fill in a few variables</td></tr>
<tr><td>Standard change (for example a new NTP server)</td><td>Log in to every firewall</td><td>Edit one template, commit, push</td></tr>
<tr><td>Audit question: is Delhi like Pune?</td><td>Compare configurations by hand</td><td>Both use the same stack; differences are only variables</td></tr>
<tr><td>Typo risk</td><td>Per box, per setting</td><td>Once in the template, caught once</td></tr>
</tbody></table>

<h3>What stays different: variables</h3>
<p>Sites are not identical. Pune and Delhi have different WAN addresses, LAN subnets and ISP gateways. A template solves this with variables: the design is shared, the facts are per site. In the lab design, Pune has WAN 203.0.113.2/30 and LAN 10.1.1.1/24, and Delhi has WAN 203.0.113.6/30 and LAN 10.2.1.1/24, yet both firewalls receive the same template.</p>

<h3>What Panorama does for you</h3>
<p>Panorama stores the template on its own, you edit it in the candidate configuration, a <code>commit</code> makes it Panorama's running configuration, and a separate <b>push</b> sends the result to the firewalls. That two-step flow matters, and the next chapters build on it. Here is the loop in the lab language:</p>
<pre class="code">PANO&gt; configure
PANO# set template NK-BRANCH-NET config network interface ethernet ethernet1/1 layer3 mtu 1500
PANO# commit
PANO# exit
PANO&gt; commit-all template-stack name NK-STACK</pre>
<p>The first <code>commit</code> changes only Panorama. The <code>commit-all</code> is what reaches the firewalls. If you forget the second step, the inventory shows the template as Out of Sync.</p>

<h3>Limits of the idea</h3>
<p>A template is not magic. It cannot make two sites different if you hide the difference nowhere; it needs variables or a second template for that. It also does not stop someone typing a local change on a firewall (chapter 9). And a badly designed template spreads a mistake to every site very quickly. Central power cuts both ways, which is why chapter 11 is about change management.</p>

<div class="scn"><h4>The NTP change that took one minute</h4><p>A company moved to a new NTP server. With box-by-box management that meant thirty logins over two days, and two sites were forgotten. With one shared template the engineer changed one line, validated, committed and pushed to a small test group first and then to all sites. The audit later showed every firewall used the same server, with no exceptions to explain.</p></div>

<div class="iv"><p class="q">"Why use templates instead of configuring each firewall?"</p><p>Consistency, speed and auditability. One design is maintained in one place, site differences are isolated in variables, a standard change is one edit and one push, and new branches onboard by joining a stack. The trade-off is that a mistake also spreads fast, so changes need testing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates stop configuration drift between sites.</li>
<li>Shared design plus per-site variables is the core pattern.</li>
<li>Commit changes only Panorama; the push is what updates the firewalls.</li>
<li>Central power also spreads mistakes quickly, so change carefully.</li>
</ul></div>
`,hi:`
<p>Socho ek bakery chain ki tees shops hain. Agar owner har shop mein recipe sticky note par likh de to tees notes dheere dheere tees thodi alag recipes ban jaate hain. Kisi shop mein cheeni kam, kisi mein namak bhool gaye, teesre ka note koi padh nahi sakta. Customers ko har jagah alag cake milta hai. Firewalls ko ek-ek karke manage karne se bilkul yahi drift hota hai. Template central recipe card hai: ek baar badlo aur har shop ko agle delivery par nayi recipe mil jaati hai.</p>

<h3>Box by box karne ki keemat</h3>
<p>Lab mein MyPnetLab ke teen firewalls hain: NK-PUNE-PA, NK-DELHI-PA aur NK-CHENNAI-PA. Teen ke saath hand configuration annoying hai. Tees ke saath risk hai. Har manual step IP address mein typo, bhoola hua zone ya galat gateway par jaata route ka mauka hai. Aur chhe mahine baad koi nahi bata sakta ki branch 17 standard follow karti hai ya nahi, kyunki standard sirf logon ke dimaag mein hai.</p>
<table class="tbl"><thead><tr><th>Concern</th><th>Box by box</th><th>Templates ke saath</th></tr></thead><tbody>
<tr><td>Naya branch</td><td>Sab dobara type karo, umeed karo kuch miss na ho</td><td>Firewall ko stack mein jodo, kuch variables bharo</td></tr>
<tr><td>Standard change (jaise naya NTP server)</td><td>Har firewall mein login</td><td>Ek template edit, commit, push</td></tr>
<tr><td>Audit sawal: Delhi Pune jaisa hai?</td><td>Configurations haath se compare karo</td><td>Dono same stack use karte hain; fark sirf variables mein</td></tr>
<tr><td>Typo risk</td><td>Har box, har setting</td><td>Template mein ek baar, ek baar pakda gaya</td></tr>
</tbody></table>

<h3>Kya alag rehta hai: variables</h3>
<p>Sites bilkul same nahi hoti. Pune aur Delhi ke WAN addresses, LAN subnets aur ISP gateways alag hain. Template ise variables se solve karta hai: design shared, facts per site. Lab design mein Pune ka WAN 203.0.113.2/30 aur LAN 10.1.1.1/24 hai, Delhi ka WAN 203.0.113.6/30 aur LAN 10.2.1.1/24, phir bhi dono firewalls ko same template milta hai.</p>

<h3>Panorama aapke liye kya karta hai</h3>
<p>Panorama template apne paas rakhta hai, aap use candidate configuration mein edit karte ho, <code>commit</code> use Panorama ki running configuration banata hai, aur alag <b>push</b> result firewalls ko bhejta hai. Ye do-step flow zaroori hai aur agle chapters isi par bante hain. Lab ki bhasha mein loop ye hai:</p>
<pre class="code">PANO&gt; configure
PANO# set template NK-BRANCH-NET config network interface ethernet ethernet1/1 layer3 mtu 1500
PANO# commit
PANO# exit
PANO&gt; commit-all template-stack name NK-STACK</pre>
<p>Pehla <code>commit</code> sirf Panorama ko badalta hai. <code>commit-all</code> firewalls tak pahunchta hai. Doosra step bhool gaye to inventory template ko Out of Sync dikhata hai.</p>

<h3>Idea ki limits</h3>
<p>Template jaadu nahi hai. Agar fark kahin chhupaya nahi to wo do sites ko alag nahi bana sakta; uske liye variables ya doosra template chahiye. Wo kisi ko firewall par local change type karne se bhi nahi rokta (chapter 9). Aur kharab design ka template ek galti ko bahut tezi se har site tak phaila deta hai. Central power dono taraf kaatti hai, isliye chapter 11 change management par hai.</p>

<div class="scn"><h4>NTP change jo ek minute mein hua</h4><p>Ek company naye NTP server par gayi. Box-by-box management mein ye do din mein tees logins hote aur do sites chhoot jaati. Ek shared template ke saath engineer ne ek line badli, validate, commit kiya aur pehle chhote test group ko phir sab sites ko push kiya. Baad ke audit mein har firewall same server use kar raha tha, koi exception samjhane ko nahi.</p></div>

<div class="iv"><p class="q">"Har firewall configure karne ke bajay templates kyun?"</p><p>Consistency, speed aur auditability. Ek design ek jagah maintain hota hai, site ke farq variables mein alag rehte hain, standard change ek edit aur ek push hai, aur naye branches stack join karke onboard hote hain. Trade-off ye hai ki galti bhi tezi se phailti hai, isliye changes ko testing chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates sites ke beech configuration drift rokte hain.</li>
<li>Shared design plus per-site variables core pattern hai.</li>
<li>Commit sirf Panorama ko badalta hai; push firewalls ko update karta hai.</li>
<li>Central power galtiyan bhi tezi se phailati hai, isliye dhyan se change karo.</li>
</ul></div>
`}};export{e as default};