var e={id:`lab-walkthroughs`,h:{en:`Lab walkthroughs: pn-tpl-build, pn-tpl-priority, pn-tpl-override`,hi:`Lab walkthroughs: pn-tpl-build, pn-tpl-priority, pn-tpl-override`},body:{en:`
<p>A driving instructor does not drive for you. She tells you what to look at in the mirror, when to check the road, and what a good result feels like. This chapter does the same for the three labs of the module. Try each lab yourself first, then use the checks below to prove that your result is real and not just a green tick.</p>

<h3>Lab 1: pn-tpl-build, a stack with per-site variables</h3>
<p><b>Goal.</b> Template NK-BRANCH-NET already exists. You build stack NK-STACK for Pune and Delhi, give each firewall its own variables, commit and push, and confirm the interfaces.</p>
<p><b>Plan.</b> First read the template and the variables it expects. Second, create the stack with the template and both firewalls (serial numbers come from <code>show system info</code> on each firewall). Third, give each firewall three values on its own device entry in the stack. Fourth, commit, push, and verify.</p>
<pre class="code">PANO&gt; show templates
PANO&gt; configure
PANO# set template-stack NK-STACK templates [ NK-BRANCH-NET ]
PANO# set template-stack NK-STACK devices &lt;serial&gt;
PANO# set template-stack NK-STACK devices &lt;serial&gt; variable $wan-ip type ip-netmask &lt;value&gt;
<span class="c">... repeat for $lan-ip and $wan-gw, then for the second firewall</span>
PANO# commit
PANO# exit
PANO&gt; commit-all template-stack name NK-STACK</pre>
<p><b>Proof.</b> On Panorama, <code>show devices all</code> should show the stack name and Template In Sync for both firewalls. On each firewall, <code>show interface all</code> should list ethernet1/1 in zone untrust and ethernet1/2 in zone trust with that site's own addresses, and <code>show config pushed-template</code> shows the resolved default route next hop.</p>

<h3>Lab 2: pn-tpl-priority, order decides the winner</h3>
<p><b>Goal.</b> Two templates set the MTU of ethernet1/1. The regional value must win.</p>
<p><b>Plan.</b> Do not touch the MTU values; the values are right, the order is the problem. Read the stack list first and note which template is on top. Use what chapter 4 taught you about priority, fix the order, commit, push, and read the effective value on the firewall.</p>
<pre class="code">PANO&gt; show template-stack
<span class="c">...change the order, commit...</span>
PANO&gt; commit-all template-stack name NK-STACK
NK-PUNE-PA&gt; show config pushed-template</pre>
<p><b>Proof.</b> The mtu line under ethernet1/1 in the pushed template holds the regional number on both firewalls. Before your fix the same command shows the global number: that is your evidence of the change.</p>

<h3>Lab 3: pn-tpl-override, a push that does not change the firewall</h3>
<p><b>Goal.</b> Chennai's first push failed, and Pune keeps an old hand-typed LAN address.</p>
<p><b>Plan.</b> Two separate problems, two fixes. For Chennai, push and read its result line; it names what is missing and where to set it. Add the values on its device entry in the stack, commit, push again. For Pune, remember the fingerprint: push says success, yet running disagrees with pushed-template. Choose the push option that removes local values the template defines, ideally limited to one device, and check the result.</p>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK
<span class="c">read the Chennai line, fix, commit</span>
PANO&gt; commit-all template-stack name NK-STACK validate-only yes
NK-PUNE-PA&gt; show config running</pre>
<p><b>Proof.</b> <code>show devices all</code> shows Template In Sync for all three; Chennai has its own LAN address; Pune's running LAN address equals the template's.</p>

<table class="tbl"><thead><tr><th>Lab</th><th>Concept</th><th>Chapter</th></tr></thead><tbody>
<tr><td>pn-tpl-build</td><td>Stack, variables, precedence, push, verify</td><td>3, 5, 8</td></tr>
<tr><td>pn-tpl-priority</td><td>Order in stack</td><td>4</td></tr>
<tr><td>pn-tpl-override</td><td>Unresolved variable, override, force-template-values</td><td>5, 9, 10</td></tr>
</tbody></table>

<div class="scn"><h4>Green tick versus proof</h4><p>A trainee finished a lab, saw all tasks green, and moved on. In the interview he was asked how he knew the firewall really used the regional value. He could not say. The next time he ran the same lab he read pushed-template before and after and wrote both numbers in his notes. That habit is what interviewers listen for.</p></div>

<div class="iv"><p class="q">"How do you prove a template change worked?"</p><p>I check the sync state on Panorama, read the pushed-template on the firewall, compare it with running, and confirm the operational result such as the interface address or a real traffic test. A job success alone is not proof.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build: stack, template, devices, per-firewall variables, commit, push, verify.</li>
<li>Priority: values were right, order was wrong; read the stack list.</li>
<li>Override: read the result line for a missing variable; force option for local values.</li>
<li>Always prove with before and after evidence.</li>
</ul></div>
`,hi:`
<p>Driving instructor tumhare liye gaadi nahi chalata. Wo batata hai mirror mein kya dekhna hai, road kab check karni hai, aur achha result kaisa lagta hai. Ye chapter module ke teen labs ke liye wahi karta hai. Pehle har lab khud try karo, phir neeche ke checks se prove karo ki tumhara result asli hai, sirf green tick nahi.</p>

<h3>Lab 1: pn-tpl-build, per-site variables wala stack</h3>
<p><b>Goal.</b> Template NK-BRANCH-NET pehle se hai. Tum Pune aur Delhi ke liye stack NK-STACK banate ho, har firewall ko apne variables dete ho, commit aur push karte ho, aur interfaces confirm karte ho.</p>
<p><b>Plan.</b> Pehle template aur uske expected variables padho. Doosra, template aur dono firewalls ke saath stack banao (serial numbers har firewall par <code>show system info</code> se). Teesra, har firewall ko stack mein uski apni device entry par teen values do. Chautha, commit, push aur verify.</p>
<pre class="code">PANO&gt; show templates
PANO&gt; configure
PANO# set template-stack NK-STACK templates [ NK-BRANCH-NET ]
PANO# set template-stack NK-STACK devices &lt;serial&gt;
PANO# set template-stack NK-STACK devices &lt;serial&gt; variable $wan-ip type ip-netmask &lt;value&gt;
<span class="c">... $lan-ip aur $wan-gw ke liye dohrao, phir doosre firewall ke liye</span>
PANO# commit
PANO# exit
PANO&gt; commit-all template-stack name NK-STACK</pre>
<p><b>Proof.</b> Panorama par <code>show devices all</code> dono firewalls ke liye stack ka naam aur Template In Sync dikhaye. Har firewall par <code>show interface all</code> ethernet1/1 ko zone untrust mein aur ethernet1/2 ko zone trust mein us site ke apne addresses ke saath dikhaye, aur <code>show config pushed-template</code> resolved default route next hop dikhaye.</p>

<h3>Lab 2: pn-tpl-priority, order winner decide karta hai</h3>
<p><b>Goal.</b> Do templates ethernet1/1 ka MTU set karte hain. Regional value jeetni chahiye.</p>
<p><b>Plan.</b> MTU values ko haath mat lagao; values sahi hain, order problem hai. Pehle stack list padho aur note karo ki top par kaunsa template hai. Chapter 4 ne priority ke baare mein jo sikhaya use lagao, order fix karo, commit, push karo, aur firewall par effective value padho.</p>
<pre class="code">PANO&gt; show template-stack
<span class="c">...order badlo, commit...</span>
PANO&gt; commit-all template-stack name NK-STACK
NK-PUNE-PA&gt; show config pushed-template</pre>
<p><b>Proof.</b> Pushed template mein ethernet1/1 ke neeche mtu line dono firewalls par regional number rakhe. Tumhare fix se pehle wahi command global number dikhata hai: wahi tumhare change ka evidence hai.</p>

<h3>Lab 3: pn-tpl-override, push jo firewall ko badalta nahi</h3>
<p><b>Goal.</b> Chennai ka pehla push fail hua, aur Pune ke paas purana haath se type kiya LAN address hai.</p>
<p><b>Plan.</b> Do alag problems, do fixes. Chennai ke liye push karo aur uski result line padho; wo batati hai kya missing hai aur kahan set karna hai. Stack mein uski device entry par values jodo, commit, dobara push. Pune ke liye fingerprint yaad rakho: push success kehta hai, phir bhi running pushed-template se disagree karta hai. Wo push option chuno jo template ki defined local values hata deta hai, behtar hai ek device tak seemit, aur result check karo.</p>
<pre class="code">PANO&gt; commit-all template-stack name NK-STACK
<span class="c">Chennai ki line padho, fix, commit</span>
PANO&gt; commit-all template-stack name NK-STACK validate-only yes
NK-PUNE-PA&gt; show config running</pre>
<p><b>Proof.</b> <code>show devices all</code> teeno ke liye Template In Sync dikhaye; Chennai ka apna LAN address ho; Pune ka running LAN address template ke barabar ho.</p>

<table class="tbl"><thead><tr><th>Lab</th><th>Concept</th><th>Chapter</th></tr></thead><tbody>
<tr><td>pn-tpl-build</td><td>Stack, variables, precedence, push, verify</td><td>3, 5, 8</td></tr>
<tr><td>pn-tpl-priority</td><td>Stack mein order</td><td>4</td></tr>
<tr><td>pn-tpl-override</td><td>Unresolved variable, override, force-template-values</td><td>5, 9, 10</td></tr>
</tbody></table>

<div class="scn"><h4>Green tick versus proof</h4><p>Ek trainee ne lab khatam kiya, saare tasks green dekhe aur aage badh gaya. Interview mein usse poocha gaya ki use kaise pata ki firewall ne sach mein regional value use ki. Wo bata nahi paya. Agli baar wahi lab chalaya to pushed-template pehle aur baad mein padha aur dono numbers notes mein likhe. Interviewers isi aadat ko sunte hain.</p></div>

<div class="iv"><p class="q">"Template change kaam kiya ye kaise prove karoge?"</p><p>Panorama par sync state, firewall par pushed-template, use running se compare, aur operational result jaise interface address ya real traffic test. Sirf job success proof nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build: stack, template, devices, per-firewall variables, commit, push, verify.</li>
<li>Priority: values sahi thi, order galat tha; stack list padho.</li>
<li>Override: missing variable ke liye result line padho; local values ke liye force option.</li>
<li>Hamesha before aur after evidence se prove karo.</li>
</ul></div>
`}};export{e as default};