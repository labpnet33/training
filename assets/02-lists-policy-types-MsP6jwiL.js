var e={id:`lists-policy-types`,h:{en:`Lists and policy types: the building blocks`,hi:`Lists aur policy types: building blocks`},body:{en:`
<p>Every policy is built from <b>lists</b> (groups of interest) and then <b>sequences</b> that use them. You define a list once and reuse it in many policies, so the policy text stays short and readable.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lists feed policy sequences which are applied to sites">
<rect x="10" y="15" width="170" height="190" rx="10" fill="#bae6fd"/><text x="95" y="38" text-anchor="middle" class="svg-ink" font-size="14">Lists</text>
<text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">site-list HUB, SPOKES</text><text x="95" y="92" text-anchor="middle" class="svg-muted" font-size="12">vpn-list CORP (10)</text><text x="95" y="116" text-anchor="middle" class="svg-muted" font-size="12">prefix-list DC-NETS</text><text x="95" y="140" text-anchor="middle" class="svg-muted" font-size="12">tloc-list HUB-TLOCS</text>
<rect x="235" y="15" width="170" height="190" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Policy</text>
<text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">sequence 10 match / action</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">sequence 20 match / action</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">default-action</text>
<rect x="460" y="15" width="170" height="190" rx="10" fill="#bbf7d0"/><text x="545" y="38" text-anchor="middle" class="svg-ink" font-size="14">apply-policy</text>
<text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="12">site-list SPOKES</text><text x="545" y="92" text-anchor="middle" class="svg-muted" font-size="12">control-policy NAME</text><text x="545" y="116" text-anchor="middle" class="svg-muted" font-size="12">direction in or out</text>
<path d="M180 110 L235 110 M405 110 L460 110" stroke="#64748b" stroke-width="2" fill="none"/>
</svg><p class="cap">Lists, then policy, then apply.</p></div>

<h3>The four list types you need now</h3>
<ul>
<li><b>Site list</b>: one or more site IDs or ranges. This is how a policy is targeted at sites, for example HUB = site 100 and SPOKES = sites 200 to 400.</li>
<li><b>VPN list</b>: one or more service VPN numbers, such as VPN 10 for corporate traffic. VPN 0 and VPN 512 are not used in these lists.</li>
<li><b>Prefix list</b>: IP prefixes, used to match routes, for example the data-centre networks.</li>
<li><b>TLOC list</b>: TLOC entries, each with a system IP, a color and an encapsulation, and optionally a preference.</li>
</ul>
<p>There are other lists (application, color, data prefix, policer, SLA class and more), used by data and application-aware policies. They are covered in later modules.</p>

<h3>Click path: create the lists</h3>
<ol>
<li>In the Manager, open <b>Configuration</b> and choose <b>Policies</b>.</li>
<li>Choose the <b>Centralized Policy</b> tab and click <b>Add Policy</b>. The wizard starts at <b>Create Groups of Interest</b>.</li>
<li>Pick a list type on the left, for example <b>Site</b>, and click <b>New Site List</b>.</li>
<li>Type a list name such as <b>SPOKES</b>, type the sites <b>200-400</b>, click <b>Add</b>.</li>
<li>Repeat for <b>HUB</b> (site 100), a <b>VPN</b> list called CORP (VPN 10), and a <b>TLOC</b> list called HUB-TLOCS.</li>
<li>Click <b>Next</b> to go to the topology step.</li>
</ol>
<p>The same lists as CLI on the Controller:</p>
<pre class="code">policy
 lists
  site-list HUB
   site-id 100
  !
  site-list SPOKES
   site-id 200-400
  !
  vpn-list CORP
   vpn 10
  !
  prefix-list DC-NETS
   ip-prefix 10.1.10.0/24
  !
  tloc-list HUB-TLOCS
   tloc 10.255.0.11 color mpls encap ipsec
   tloc 10.255.0.11 color biz-internet encap ipsec preference 200
  !
 !
!</pre>
<p>A TLOC list entry names the system IP, the color and the encapsulation. The optional <code>preference</code> value lets a policy rank several TLOCs; a higher value is preferred.</p>

<h3>Policy types and where they are applied</h3>
<table>
<tr><th>Policy</th><th>Applied with</th><th>Runs on</th></tr>
<tr><td>Centralized control</td><td>apply-policy site-list, direction in or out</td><td>Controller</td></tr>
<tr><td>VPN membership</td><td>apply-policy site-list, vpn-membership</td><td>Controller</td></tr>
<tr><td>Centralized data</td><td>apply-policy site-list with from-service, from-tunnel or all</td><td>Edges</td></tr>
<tr><td>Application-aware routing</td><td>apply-policy site-list</td><td>Edges</td></tr>
<tr><td>Localized (ACL, QoS, route policy)</td><td>Device template or feature profile</td><td>The edge only</td></tr>
</table>
<p>Control, VPN membership, data and application-aware policies all live in one <b>centralized policy</b> object that you activate on the Controller. Localized policy is separate: it belongs to one edge and is pushed with that edge's template.</p>

<h3>The match and action idea</h3>
<p>A policy is an ordered set of <b>sequences</b>. Each sequence has a number, a type (route or tloc for control policy), match conditions and an action (accept or reject, and optionally <code>set</code> statements). The Controller walks the sequences in order for every OMP update and stops at the first match. If nothing matches, the <b>default action</b> applies. For a control policy the default action is <b>reject</b>, so an update that is not explicitly accepted is dropped. Keep that in mind: a very short control policy can remove far more than you expect.</p>
<pre class="code">policy
 control-policy EXAMPLE
  sequence 10
   match route
    prefix-list DC-NETS
   !
   action accept
   !
  !
  default-action reject
 !
!</pre>

<div class="warn"><p><b>Common mistakes.</b> Putting a site in two overlapping lists that the same policy applies in conflicting ways; typing a site range with a space; using a VPN list that contains VPN 0; and forgetting the default action rejects everything unmatched.</p></div>
<div class="exam"><p><b>Exam trap.</b> The questions ask which list type targets sites (site list), which matches routes by prefix (prefix list) and which holds system IP, color and encapsulation (TLOC list).</p></div>

<div class="scn"><h4>The site range that swallowed a hub</h4><p>An engineer defined SPOKES as 100-400 instead of 200-400 and applied a spoke policy. The hub, site 100, got the spoke rules and lost its own routes. The fix was one character in the list, but the outage showed why list names should be reviewed with a colleague and why small pilots matter.</p></div>

<div class="iv"><p class="q">"What list types would you create for a hub-and-spoke control policy?"</p><p>Strong answer: a site list for the hub, a site list for the spokes, a VPN list for the service VPNs in scope, and a TLOC list for the hub TLOCs (system IP, color, encapsulation). A prefix list if the policy matches data-centre prefixes. Then I apply the policy to the spoke site list.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lists are defined once and reused; site, VPN, prefix and TLOC lists are the core four here.</li>
<li>A TLOC list entry has system IP, color and encapsulation.</li>
<li>Sequences are evaluated in order, first match wins, and the control policy default action is reject.</li>
<li>Control and VPN membership policy run on the Controller; data and application-aware policy run on edges; localized policy runs on the edge itself.</li>
</ul></div>
`,hi:`
<p>Har policy <b>lists</b> (groups of interest) se banti hai aur phir <b>sequences</b> unhe use karte hain. List ek baar define karo aur kai policies mein reuse karo, isliye policy text chhota aur padhne layak rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lists policy sequences ko feed karti hain jo sites par apply hoti hain">
<rect x="10" y="15" width="170" height="190" rx="10" fill="#bae6fd"/><text x="95" y="38" text-anchor="middle" class="svg-ink" font-size="14">Lists</text>
<text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">site-list HUB, SPOKES</text><text x="95" y="92" text-anchor="middle" class="svg-muted" font-size="12">vpn-list CORP (10)</text><text x="95" y="116" text-anchor="middle" class="svg-muted" font-size="12">prefix-list DC-NETS</text><text x="95" y="140" text-anchor="middle" class="svg-muted" font-size="12">tloc-list HUB-TLOCS</text>
<rect x="235" y="15" width="170" height="190" rx="10" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Policy</text>
<text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">sequence 10 match / action</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">sequence 20 match / action</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">default-action</text>
<rect x="460" y="15" width="170" height="190" rx="10" fill="#bbf7d0"/><text x="545" y="38" text-anchor="middle" class="svg-ink" font-size="14">apply-policy</text>
<text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="12">site-list SPOKES</text><text x="545" y="92" text-anchor="middle" class="svg-muted" font-size="12">control-policy NAME</text><text x="545" y="116" text-anchor="middle" class="svg-muted" font-size="12">direction in ya out</text>
<path d="M180 110 L235 110 M405 110 L460 110" stroke="#64748b" stroke-width="2" fill="none"/>
</svg><p class="cap">Lists, phir policy, phir apply.</p></div>

<h3>Abhi ke liye chaar list types</h3>
<ul>
<li><b>Site list</b>: ek ya zyada site IDs ya ranges. Isi se policy sites par target hoti hai, jaise HUB = site 100 aur SPOKES = sites 200 se 400.</li>
<li><b>VPN list</b>: ek ya zyada service VPN numbers, jaise corporate traffic ke liye VPN 10. In lists mein VPN 0 aur VPN 512 use nahi hote.</li>
<li><b>Prefix list</b>: IP prefixes, routes match karne ke liye, jaise data-centre networks.</li>
<li><b>TLOC list</b>: TLOC entries, har ek mein system IP, color aur encapsulation, aur optional preference.</li>
</ul>
<p>Aur bhi lists hain (application, color, data prefix, policer, SLA class aur zyada), jo data aur application-aware policies mein use hoti hain. Unka zikr agle modules mein hai.</p>

<h3>Click path: lists banao</h3>
<ol>
<li>Manager mein <b>Configuration</b> kholo aur <b>Policies</b> chuno.</li>
<li><b>Centralized Policy</b> tab chuno aur <b>Add Policy</b> par click karo. Wizard <b>Create Groups of Interest</b> se shuru hota hai.</li>
<li>Left side par list type chuno, jaise <b>Site</b>, aur <b>New Site List</b> par click karo.</li>
<li>List name likho jaise <b>SPOKES</b>, sites <b>200-400</b> likho, <b>Add</b> par click karo.</li>
<li><b>HUB</b> (site 100), CORP naam ki <b>VPN</b> list (VPN 10), aur HUB-TLOCS naam ki <b>TLOC</b> list ke liye dohrao.</li>
<li>Topology step par jaane ke liye <b>Next</b> click karo.</li>
</ol>
<p>Controller par wahi lists CLI mein:</p>
<pre class="code">policy
 lists
  site-list HUB
   site-id 100
  !
  site-list SPOKES
   site-id 200-400
  !
  vpn-list CORP
   vpn 10
  !
  prefix-list DC-NETS
   ip-prefix 10.1.10.0/24
  !
  tloc-list HUB-TLOCS
   tloc 10.255.0.11 color mpls encap ipsec
   tloc 10.255.0.11 color biz-internet encap ipsec preference 200
  !
 !
!</pre>
<p>TLOC list entry mein system IP, color aur encapsulation hota hai. Optional <code>preference</code> value policy ko kai TLOCs rank karne deti hai; zyada value preferred hoti hai.</p>

<h3>Policy types aur kahan apply hoti hain</h3>
<table>
<tr><th>Policy</th><th>Kaise apply</th><th>Kahan chalti hai</th></tr>
<tr><td>Centralized control</td><td>apply-policy site-list, direction in ya out</td><td>Controller</td></tr>
<tr><td>VPN membership</td><td>apply-policy site-list, vpn-membership</td><td>Controller</td></tr>
<tr><td>Centralized data</td><td>apply-policy site-list, from-service, from-tunnel ya all ke saath</td><td>Edges</td></tr>
<tr><td>Application-aware routing</td><td>apply-policy site-list</td><td>Edges</td></tr>
<tr><td>Localized (ACL, QoS, route policy)</td><td>Device template ya feature profile</td><td>Sirf edge</td></tr>
</table>
<p>Control, VPN membership, data aur application-aware policies ek hi <b>centralized policy</b> object mein rehti hain jise aap Controller par activate karte ho. Localized policy alag hai: woh ek edge ki hoti hai aur us edge ke template ke saath push hoti hai.</p>

<h3>Match aur action ka idea</h3>
<p>Policy <b>sequences</b> ka ordered set hai. Har sequence ka ek number, ek type (control policy ke liye route ya tloc), match conditions aur ek action (accept ya reject, aur optional <code>set</code> statements) hota hai. Controller har OMP update ke liye sequences order mein dekhta hai aur pehle match par ruk jaata hai. Kuch match na ho to <b>default action</b> lagta hai. Control policy ke liye default action <b>reject</b> hai, isliye jo update explicitly accept na ho woh drop ho jaata hai. Yaad rakho: bahut chhoti control policy aapki ummeed se kaafi zyada hata sakti hai.</p>
<pre class="code">policy
 control-policy EXAMPLE
  sequence 10
   match route
    prefix-list DC-NETS
   !
   action accept
   !
  !
  default-action reject
 !
!</pre>

<div class="warn"><p><b>Common mistakes.</b> Ek site ko do overlapping lists mein rakhna jinhe ek hi policy conflicting tareeke se lagaye; site range mein space type karna; VPN list mein VPN 0 daalna; aur bhoolna ki default action unmatched sab reject karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal poochte hain ki sites ko kaun si list target karti hai (site list), routes ko prefix se kaun match karti hai (prefix list) aur system IP, color aur encapsulation kaun rakhti hai (TLOC list).</p></div>

<div class="scn"><h4>Site range jisne hub ko nigal liya</h4><p>Ek engineer ne SPOKES ko 200-400 ki jagah 100-400 define kiya aur spoke policy apply ki. Hub, site 100, ko spoke rules mil gaye aur uske apne routes chale gaye. Fix list mein ek character tha, lekin outage ne dikhaya ki list names colleague ke saath review karne chahiye aur chhote pilots kyun zaroori hain.</p></div>

<div class="iv"><p class="q">"Hub-and-spoke control policy ke liye kaun si list types banaoge?"</p><p>Strong answer: hub ke liye site list, spokes ke liye site list, scope ke service VPNs ke liye VPN list, aur hub TLOCs ke liye TLOC list (system IP, color, encapsulation). Agar policy data-centre prefixes match kare to prefix list. Phir policy ko spoke site list par apply karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lists ek baar define hoti hain aur reuse hoti hain; site, VPN, prefix aur TLOC lists yahan ke core four hain.</li>
<li>TLOC list entry mein system IP, color aur encapsulation hota hai.</li>
<li>Sequences order mein evaluate hote hain, pehla match jeetta hai, aur control policy ka default action reject hai.</li>
<li>Control aur VPN membership policy Controller par; data aur application-aware policy edges par; localized policy khud edge par.</li>
</ul></div>
`}};export{e as default};