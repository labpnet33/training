var e={id:`apply-activate`,h:{en:`Applying and activating policy: direction and workflow`,hi:`Policy apply aur activate karna: direction aur workflow`},body:{en:`
<p>Writing a policy changes nothing until it is <b>applied</b> to a site list and <b>activated</b>. This chapter is the workflow and the most common source of mistakes: the direction.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Workflow from create to activate">
<rect x="10" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">1 Lists</text><text x="65" y="110" text-anchor="middle" class="svg-muted" font-size="12">groups of interest</text>
<rect x="140" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="195" y="90" text-anchor="middle" class="svg-ink" font-size="13">2 Topology</text><text x="195" y="110" text-anchor="middle" class="svg-muted" font-size="12">control, VPN</text>
<rect x="270" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="325" y="90" text-anchor="middle" class="svg-ink" font-size="13">3 Rules</text><text x="325" y="110" text-anchor="middle" class="svg-muted" font-size="12">data, app-route</text>
<rect x="400" y="60" width="110" height="70" rx="10" fill="#fde68a"/><text x="455" y="90" text-anchor="middle" class="svg-ink" font-size="13">4 Apply</text><text x="455" y="110" text-anchor="middle" class="svg-muted" font-size="12">site list, direction</text>
<rect x="530" y="60" width="100" height="70" rx="10" fill="#bbf7d0"/><text x="580" y="90" text-anchor="middle" class="svg-ink" font-size="13">5 Activate</text><text x="580" y="110" text-anchor="middle" class="svg-muted" font-size="12">to Controller</text>
<path d="M120 95 L140 95 M250 95 L270 95 M380 95 L400 95 M510 95 L530 95" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Only one centralized policy can be active at a time</text>
</svg><p class="cap">The wizard follows the same order as the CLI.</p></div>

<h3>Click path: build, apply and activate</h3>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Policies</b> and select the <b>Centralized Policy</b> tab.</li>
<li>Click <b>Add Policy</b>. In <b>Create Groups of Interest</b>, create your lists and click <b>Next</b>.</li>
<li>In <b>Configure Topology and VPN Membership</b>, add the topology (Hub-and-Spoke, Mesh, Custom Control or VPN Membership) and click <b>Next</b>.</li>
<li>In <b>Configure Traffic Rules</b>, add application-aware routing or data rules if you need them, or click <b>Next</b> to skip.</li>
<li>In <b>Apply Policies to Sites and VPNs</b>, open the matching tab (for example <b>Topology</b>), click <b>New Site List</b> or <b>New Site/Region List and VPN List</b>, choose the site list, choose the <b>direction</b> (Inbound or Outbound where offered), and click <b>Add</b>.</li>
<li>Enter a <b>Policy Name</b> and a <b>Description</b>, then click <b>Save Policy</b>.</li>
<li>On the list of policies, find the row, click the <b>three dots</b> at the right and choose <b>Activate</b>. Confirm the dialog.</li>
<li>Watch the task: the Manager sends the policy to the Controller over NETCONF, and the task shows success.</li>
</ol>
<p>The menu layout shifts slightly between releases. The policy-group experience in newer releases covers topology and other policy types as well. This module uses the classic centralized policy flow because the exam objectives follow it.</p>

<h3>The direction in apply-policy</h3>
<p>For a <b>control policy</b> the direction is from the Controller's point of view:</p>
<table>
<tr><th>Direction</th><th>What is filtered</th><th>Typical use</th></tr>
<tr><td><b>in</b></td><td>Updates the Controller <b>receives from</b> the edges of the site list, before they are stored</td><td>Stop a site from advertising a prefix; tag routes on arrival</td></tr>
<tr><td><b>out</b></td><td>Updates the Controller <b>sends to</b> the edges of the site list</td><td>Limit what a site learns; hub-and-spoke; service chaining</td></tr>
</table>
<p>The site list in apply-policy is the site whose edges are on the other end of the update. If you want Delhi's routes to look different to Mumbai, you apply an <b>out</b> policy to Mumbai's site list. If you want Mumbai's routes to be changed for everyone, you apply an <b>in</b> policy to Mumbai's site list. Many hub-and-spoke designs use <b>out</b>.</p>
<pre class="code">apply-policy
 site-list SPOKES
  control-policy HUB-SPOKE out
 !
 site-list BRANCH-GROUP
  control-policy TAG-ARRIVAL in
 !
!</pre>
<p>One site list can have one policy per direction of the same type. VPN membership is applied inside the site list in the same section, without an in or out keyword.</p>

<h3>Activation rules</h3>
<ul>
<li>Only <b>one</b> centralized policy is active. Activating another one replaces the first.</li>
<li>Activation sends the whole policy to the Controllers. If you have more than one Controller, the Manager sends it to all of them.</li>
<li>Edges that receive a changed control plane may see short route changes. Do activations in a change window.</li>
<li>You can <b>deactivate</b> a policy from the same menu. When you deactivate, the Controller goes back to its default behaviour: the full mesh returns.</li>
</ul>

<h3>Safe change practice</h3>
<ol>
<li>Pilot with a small site list that holds one non-critical site.</li>
<li>Preview with the CLI or the policy preview of the Manager before activating.</li>
<li>Activate, then verify with the commands in the next chapter.</li>
<li>Widen the site list step by step.</li>
<li>Keep a copy of the policy and a clear way to deactivate.</li>
</ol>
<pre class="out">Manager task view
Activate Policy BHARAT-HUB-SPOKE
  vsmart 10.255.255.2   Validation Success
  vsmart 10.255.255.2   Done - Push vSmart Policy
  Status: Success</pre>

<div class="warn"><p><b>Common mistakes.</b> Wrong direction; applying to a site list that contains the hub; activating during business hours; assuming that saving equals active; and trying to keep two centralized policies active.</p></div>
<div class="exam"><p><b>Exam trap.</b> Direction is relative to the Controller. <b>in</b> means from edges toward the Controller; <b>out</b> means from the Controller toward edges. Policy is not active until you activate it.</p></div>

<div class="scn"><h4>The Friday activation</h4><p>An engineer activated a hub-and-spoke policy at 5 pm on a Friday for all 80 stores. Within minutes several stores lost the voice path to the Mumbai call centre because spoke-to-spoke traffic now crossed an under-sized hub link. The team deactivated the policy and the mesh returned. The retry two weeks later started with ten stores and a larger hub circuit.</p></div>

<div class="iv"><p class="q">"What does direction mean in apply-policy for a control policy?"</p><p>Strong answer: it is relative to the Controller. In is what the Controller receives from the edges of the site list; out is what it sends to them. I use out to shape what a site learns, for example hub-and-spoke or service chaining, and in to filter or change what a site advertises.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create, apply, then activate; saved does not mean active.</li>
<li>Direction is Controller-relative: in from edges, out to edges.</li>
<li>One centralized policy is active at a time; deactivate returns to full mesh.</li>
<li>Pilot first, verify, then widen the site list.</li>
</ul></div>
`,hi:`
<p>Policy likhne se kuch nahi badalta jab tak use site list par <b>apply</b> aur <b>activate</b> na kiya jaye. Yeh chapter workflow aur sabse aam galti, direction, ke baare mein hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Create se activate tak workflow">
<rect x="10" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="65" y="90" text-anchor="middle" class="svg-ink" font-size="13">1 Lists</text><text x="65" y="110" text-anchor="middle" class="svg-muted" font-size="12">groups of interest</text>
<rect x="140" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="195" y="90" text-anchor="middle" class="svg-ink" font-size="13">2 Topology</text><text x="195" y="110" text-anchor="middle" class="svg-muted" font-size="12">control, VPN</text>
<rect x="270" y="60" width="110" height="70" rx="10" fill="#bae6fd"/><text x="325" y="90" text-anchor="middle" class="svg-ink" font-size="13">3 Rules</text><text x="325" y="110" text-anchor="middle" class="svg-muted" font-size="12">data, app-route</text>
<rect x="400" y="60" width="110" height="70" rx="10" fill="#fde68a"/><text x="455" y="90" text-anchor="middle" class="svg-ink" font-size="13">4 Apply</text><text x="455" y="110" text-anchor="middle" class="svg-muted" font-size="12">site list, direction</text>
<rect x="530" y="60" width="100" height="70" rx="10" fill="#bbf7d0"/><text x="580" y="90" text-anchor="middle" class="svg-ink" font-size="13">5 Activate</text><text x="580" y="110" text-anchor="middle" class="svg-muted" font-size="12">Controller ko</text>
<path d="M120 95 L140 95 M250 95 L270 95 M380 95 L400 95 M510 95 L530 95" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Ek waqt mein sirf ek centralized policy active ho sakti hai</text>
</svg><p class="cap">Wizard CLI jaise hi order mein chalta hai.</p></div>

<h3>Click path: banao, apply karo aur activate karo</h3>
<ol>
<li><b>Configuration</b> &gt; <b>Policies</b> kholo aur <b>Centralized Policy</b> tab chuno.</li>
<li><b>Add Policy</b> click karo. <b>Create Groups of Interest</b> mein lists banao aur <b>Next</b> click karo.</li>
<li><b>Configure Topology and VPN Membership</b> mein topology jodo (Hub-and-Spoke, Mesh, Custom Control ya VPN Membership) aur <b>Next</b> click karo.</li>
<li><b>Configure Traffic Rules</b> mein zarurat ho to application-aware routing ya data rules jodo, ya skip karne ke liye <b>Next</b> click karo.</li>
<li><b>Apply Policies to Sites and VPNs</b> mein matching tab kholo (jaise <b>Topology</b>), <b>New Site List</b> ya <b>New Site/Region List and VPN List</b> click karo, site list chuno, <b>direction</b> chuno (jahan offer ho wahan Inbound ya Outbound), aur <b>Add</b> click karo.</li>
<li><b>Policy Name</b> aur <b>Description</b> likho, phir <b>Save Policy</b> click karo.</li>
<li>Policies ki list mein row dhundo, right side ke <b>three dots</b> click karo aur <b>Activate</b> chuno. Dialog confirm karo.</li>
<li>Task dekho: Manager policy ko NETCONF se Controller ko bhejta hai, aur task success dikhata hai.</li>
</ol>
<p>Menu layout releases ke beech thoda badalta hai. Newer releases ka policy-group experience topology aur anya policy types bhi cover karta hai. Yeh module classic centralized policy flow use karta hai kyunki exam objectives usi ko follow karte hain.</p>

<h3>apply-policy mein direction</h3>
<p><b>Control policy</b> ke liye direction Controller ke point of view se hoti hai:</p>
<table>
<tr><th>Direction</th><th>Kya filter hota hai</th><th>Aam use</th></tr>
<tr><td><b>in</b></td><td>Woh updates jo Controller site list ke edges se <b>receive karta hai</b>, store hone se pehle</td><td>Site ko prefix advertise karne se rokna; aate waqt routes tag karna</td></tr>
<tr><td><b>out</b></td><td>Woh updates jo Controller site list ke edges ko <b>bhejta hai</b></td><td>Site kya seekhe use limit karna; hub-and-spoke; service chaining</td></tr>
</table>
<p>apply-policy mein site list woh site hai jiske edges update ke doosre sire par hain. Agar aap chahte ho ki Delhi ke routes Mumbai ko alag dikhein, to Mumbai ki site list par <b>out</b> policy lagate ho. Agar chahte ho ki Mumbai ke routes sab ke liye badal jaayein, to Mumbai ki site list par <b>in</b> policy lagate ho. Kai hub-and-spoke designs <b>out</b> use karte hain.</p>
<pre class="code">apply-policy
 site-list SPOKES
  control-policy HUB-SPOKE out
 !
 site-list BRANCH-GROUP
  control-policy TAG-ARRIVAL in
 !
!</pre>
<p>Ek site list par ek hi type ki ek policy har direction ke liye ho sakti hai. VPN membership usi section mein site list ke andar apply hoti hai, in ya out keyword ke bina.</p>

<h3>Activation ke rules</h3>
<ul>
<li>Sirf <b>ek</b> centralized policy active hoti hai. Doosri activate karne se pehli replace ho jaati hai.</li>
<li>Activation poori policy Controllers ko bhejta hai. Ek se zyada Controller ho to Manager sabko bhejta hai.</li>
<li>Jin edges ko control plane badla milta hai unhe chhote route changes dikh sakte hain. Activations change window mein karo.</li>
<li>Usi menu se policy <b>deactivate</b> kar sakte ho. Deactivate karne par Controller default behaviour par lautta hai: full mesh wapas aa jaata hai.</li>
</ul>

<h3>Safe change practice</h3>
<ol>
<li>Chhoti site list se pilot karo jisme ek non-critical site ho.</li>
<li>Activate se pehle CLI ya Manager ke policy preview se dekho.</li>
<li>Activate karo, phir agle chapter ke commands se verify karo.</li>
<li>Site list ko step by step badhao.</li>
<li>Policy ki copy rakho aur deactivate karne ka saaf tareeka rakho.</li>
</ol>
<pre class="out">Manager task view
Activate Policy BHARAT-HUB-SPOKE
  vsmart 10.255.255.2   Validation Success
  vsmart 10.255.255.2   Done - Push vSmart Policy
  Status: Success</pre>

<div class="warn"><p><b>Common mistakes.</b> Galat direction; hub wali site list par apply karna; business hours mein activate karna; yeh maan lena ki save matlab active; aur do centralized policies active rakhne ki koshish.</p></div>
<div class="exam"><p><b>Exam trap.</b> Direction Controller ke relative hai. <b>in</b> matlab edges se Controller ki taraf; <b>out</b> matlab Controller se edges ki taraf. Activate kiye bina policy active nahi hoti.</p></div>

<div class="scn"><h4>Friday ki activation</h4><p>Ek engineer ne Friday shaam 5 baje saare 80 stores ke liye hub-and-spoke policy activate kar di. Kuch minute mein kai stores ka Mumbai call centre ka voice path toot gaya kyunki spoke-to-spoke traffic ab chhote hub link se guzar rahi thi. Team ne policy deactivate ki aur mesh wapas aa gaya. Do hafte baad retry dus stores aur bade hub circuit ke saath shuru hua.</p></div>

<div class="iv"><p class="q">"Control policy ke liye apply-policy mein direction ka kya matlab hai?"</p><p>Strong answer: yeh Controller ke relative hai. In woh hai jo Controller site list ke edges se receive karta hai; out woh jo woh unhe bhejta hai. Main out ka use karta hoon ki site kya seekhe (jaise hub-and-spoke ya service chaining), aur in ka use karta hoon ki site kya advertise kare use filter ya change karne ke liye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Create, apply, phir activate; saved matlab active nahi.</li>
<li>Direction Controller-relative hai: in edges se, out edges ko.</li>
<li>Ek centralized policy active hoti hai; deactivate se full mesh wapas.</li>
<li>Pehle pilot, verify, phir site list badhao.</li>
</ul></div>
`}};export{e as default};