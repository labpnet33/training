var e={id:`bind-data`,h:{en:`Bind data: the device-specific values`,hi:`Bind data: device-specific values`},body:{en:`
<p>Back to the franchise shop. The recipe book is the same everywhere, but each shop has its own <b>address slip</b>: street, phone, shop number. Without the slip, the shop cannot open, however perfect the recipe. In Versa, the address slip is <b>bind data</b>: the values that differ per device and are bound to the template's variables when the configuration is generated.</p>

<h3>What belongs in bind data</h3>
<p>In the real Director, device-specific variables typically include things such as the site identifier, interface addresses, gateways and LAN prefixes; they are entered in the device wizard or imported from a CSV or API. In the course model the bind keys are fixed and you must know them:</p>
<table class="cmp"><tr><th>Bind key</th><th>Meaning</th><th>Kolkata value</th></tr>
<tr><td><code>site-id</code></td><td>unique site identity in the organization</td><td>103</td></tr>
<tr><td><code>lan-address</code></td><td>LAN interface address with prefix</td><td>10.1.3.1/24</td></tr>
<tr><td><code>wan1-address</code></td><td>first template WAN interface (vni-0/0)</td><td>203.0.113.14/30</td></tr>
<tr><td><code>wan1-gateway</code></td><td>next hop for WAN1 transport VR</td><td>203.0.113.13</td></tr>
<tr><td><code>wan2-address</code></td><td>second template WAN interface (vni-0/1)</td><td>172.31.3.2/30</td></tr>
<tr><td><code>wan2-gateway</code></td><td>next hop for WAN2 transport VR</td><td>172.31.3.1</td></tr></table>
<p><b>Important:</b> <code>wan1</code>, <code>wan2</code> and <code>wan3</code> mean the template's WAN interfaces in <b>VNI order</b>, not a transport name. With BR-DUAL, wan1 is vni-0/0 (Internet) and wan2 is vni-0/1 (MPLS). A third WAN in the template (for example vni-0/2 LTE) would need wan3-address and wan3-gateway.</p>

<h3>The Director device object</h3>
<pre class="code"><span class="c">! device identity</span>
admin@Director-1-cli% set director devices Branch3 serial VOS-BR3-0001
admin@Director-1-cli% set director devices Branch3 group BRANCHES
<span class="c">! bind data</span>
admin@Director-1-cli% set director devices Branch3 bind site-id 103
admin@Director-1-cli% set director devices Branch3 bind lan-address 10.1.3.1/24
admin@Director-1-cli% set director devices Branch3 bind wan1-address 203.0.113.14/30
admin@Director-1-cli% set director devices Branch3 bind wan1-gateway 203.0.113.13
admin@Director-1-cli% set director devices Branch3 bind wan2-address 172.31.3.2/30
admin@Director-1-cli% set director devices Branch3 bind wan2-gateway 172.31.3.1
admin@Director-1-cli% commit</pre>
<pre class="out">admin@Director-1-cli&gt; show devices device Branch3
Device: Branch3
Serial: VOS-BR3-0001
Group: BRANCHES  Template: BR-DUAL
Bind data:
  site-id          103
  lan-address      10.1.3.1/24
  wan1-address     203.0.113.14/30
  wan1-gateway     203.0.113.13
  wan2-address     172.31.3.2/30
  wan2-gateway     172.31.3.1
<span class="hl">Missing bind data: none</span></pre>
<p>The last line is your pre-flight check. It is computed from the template: the Director knows which variables the template needs and lists those that are empty. <b>Always read it before you deploy.</b></p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Bind data check">
<rect x="20" y="30" width="170" height="90" rx="8" fill="#bae6fd"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">Template needs</text><text x="105" y="78" text-anchor="middle" class="svg-muted" font-size="12">site-id, lan,</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="12">wan1 a+g, wan2 a+g</text>
<rect x="235" y="30" width="170" height="90" rx="8" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Device has</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">6 of 7 values</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">wan2-gateway empty</text>
<rect x="450" y="30" width="170" height="90" rx="8" fill="#fed7aa"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="13">Result</text><text x="535" y="78" text-anchor="middle" class="svg-muted" font-size="12">Post-staging failed</text><text x="535" y="96" text-anchor="middle" class="svg-muted" font-size="12">nothing is pushed</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">One empty required value blocks the whole push</text>
</svg><p class="cap">Missing bind data is detected when the Director tries to generate the configuration.</p></div>

<h3>What happens when bind data is missing</h3>
<p>The Director cannot build a complete configuration, so it pushes <b>nothing</b>; a half-configured branch is worse than none. In the course model the device state becomes <code>Post-staging failed</code> with a reason such as <code>Bind data incomplete for Branch3: wan2-gateway</code>. Fix the value, commit, and the next evaluation succeeds. You will see this exact message in the ticket lab.</p>

<div class="eg"><p><b>Worked example.</b> The expansion of bind data into configuration: <code>wan1-address 203.0.113.14/30</code> becomes <code>interfaces vni-0/0 unit 0 family inet address 203.0.113.14/30</code>; <code>wan1-gateway 203.0.113.13</code> becomes a default route in <code>Internet-Transport-VR</code>; <code>wan2-gateway 172.31.3.1</code> becomes a route for 172.31.0.0/16 in <code>MPLS-Transport-VR</code>. A missing wan2-gateway therefore means no MPLS route, and the push is refused before that can happen silently.</p></div>

<div class="warn"><p><b>Common mistakes:</b> gateway outside the WAN subnet; omitting the prefix length on addresses; thinking wan2 means the MPLS name rather than the second template interface; entering bind data for the right device name but the wrong group.</p></div>
<div class="exam"><p><b>Exam trap:</b> bind data is stored in the Director per device. Editing it does not change the branch until the workflow is deployed again.</p></div>

<div class="scn"><h4>One empty cell, one silent site</h4><p>An import from a spreadsheet loaded 25 sites. One row had no WAN2 gateway because the MPLS circuit was still being installed. The site staged correctly but never became Online. The Director listed the missing key. The team filled it after the carrier handoff and redeployed.</p><p><b>Lesson:</b> the staging tunnel working proves nothing about bind data. Check <code>Missing bind data</code> for every row before the weekend.</p></div>

<div class="iv"><p class="q">"What is the difference between a template variable and bind data?"</p><p>A variable is a named placeholder in the shared template. Bind data is the set of values for one specific device that fill those placeholders. Template = shape, bind data = values.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bind data holds everything that differs per device: site-id, LAN, WAN addresses and gateways.</li>
<li>wan1, wan2 and wan3 follow the template's WAN interfaces in VNI order.</li>
<li><code>show devices device &lt;name&gt;</code> lists bind data and Missing bind data.</li>
<li>Any missing required value blocks the push: Post-staging failed.</li>
<li>Editing bind data requires a redeploy to take effect on the branch.</li>
</ul></div>
`,hi:`
<p>Wapas franchise shop par. Recipe book har jagah same hai, lekin har shop ki apni <b>address slip</b> hoti hai: street, phone, shop number. Slip ke bina shop khul nahi sakta, chahe recipe kitni bhi perfect ho. Versa mein address slip hai <b>bind data</b>: wo values jo har device ke liye alag hoti hain aur configuration generate hote time template ke variables se bind hoti hain.</p>

<h3>Bind data mein kya aata hai</h3>
<p>Real Director mein device-specific variables mein aam taur par site identifier, interface addresses, gateways aur LAN prefixes aate hain; inhe device wizard mein enter karte hain ya CSV ya API se import karte hain. Course model mein bind keys fixed hain aur aapko inhe yaad rakhna hai:</p>
<table class="cmp"><tr><th>Bind key</th><th>Matlab</th><th>Kolkata value</th></tr>
<tr><td><code>site-id</code></td><td>organization mein unique site identity</td><td>103</td></tr>
<tr><td><code>lan-address</code></td><td>prefix ke saath LAN interface address</td><td>10.1.3.1/24</td></tr>
<tr><td><code>wan1-address</code></td><td>template ka pehla WAN interface (vni-0/0)</td><td>203.0.113.14/30</td></tr>
<tr><td><code>wan1-gateway</code></td><td>WAN1 transport VR ka next hop</td><td>203.0.113.13</td></tr>
<tr><td><code>wan2-address</code></td><td>template ka dusra WAN interface (vni-0/1)</td><td>172.31.3.2/30</td></tr>
<tr><td><code>wan2-gateway</code></td><td>WAN2 transport VR ka next hop</td><td>172.31.3.1</td></tr></table>
<p><b>Important:</b> <code>wan1</code>, <code>wan2</code> aur <code>wan3</code> ka matlab template ke WAN interfaces <b>VNI order</b> mein hai, transport ka naam nahi. BR-DUAL mein wan1 vni-0/0 (Internet) hai aur wan2 vni-0/1 (MPLS). Template mein teesra WAN (jaise vni-0/2 LTE) ho to wan3-address aur wan3-gateway chahiye.</p>

<h3>Director device object</h3>
<pre class="code"><span class="c">! device identity</span>
admin@Director-1-cli% set director devices Branch3 serial VOS-BR3-0001
admin@Director-1-cli% set director devices Branch3 group BRANCHES
<span class="c">! bind data</span>
admin@Director-1-cli% set director devices Branch3 bind site-id 103
admin@Director-1-cli% set director devices Branch3 bind lan-address 10.1.3.1/24
admin@Director-1-cli% set director devices Branch3 bind wan1-address 203.0.113.14/30
admin@Director-1-cli% set director devices Branch3 bind wan1-gateway 203.0.113.13
admin@Director-1-cli% set director devices Branch3 bind wan2-address 172.31.3.2/30
admin@Director-1-cli% set director devices Branch3 bind wan2-gateway 172.31.3.1
admin@Director-1-cli% commit</pre>
<pre class="out">admin@Director-1-cli&gt; show devices device Branch3
Device: Branch3
Serial: VOS-BR3-0001
Group: BRANCHES  Template: BR-DUAL
Bind data:
  site-id          103
  lan-address      10.1.3.1/24
  wan1-address     203.0.113.14/30
  wan1-gateway     203.0.113.13
  wan2-address     172.31.3.2/30
  wan2-gateway     172.31.3.1
<span class="hl">Missing bind data: none</span></pre>
<p>Aakhri line aapka pre-flight check hai. Ye template se compute hoti hai: Director jaanta hai template ko kaunse variables chahiye aur jo khali hain unhe list karta hai. <b>Deploy se pehle hamesha ise padho.</b></p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Bind data check">
<rect x="20" y="30" width="170" height="90" rx="8" fill="#bae6fd"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="13">Template ko chahiye</text><text x="105" y="78" text-anchor="middle" class="svg-muted" font-size="12">site-id, lan,</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="12">wan1 a+g, wan2 a+g</text>
<rect x="235" y="30" width="170" height="90" rx="8" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Device ke paas</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">7 mein se 6 values</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">wan2-gateway khali</text>
<rect x="450" y="30" width="170" height="90" rx="8" fill="#fed7aa"/><text x="535" y="55" text-anchor="middle" class="svg-ink" font-size="13">Result</text><text x="535" y="78" text-anchor="middle" class="svg-muted" font-size="12">Post-staging failed</text><text x="535" y="96" text-anchor="middle" class="svg-muted" font-size="12">kuch push nahi hota</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Ek bhi khali required value poora push rok deti hai</text>
</svg><p class="cap">Missing bind data tab pakda jata hai jab Director configuration generate karne ki koshish karta hai.</p></div>

<h3>Bind data missing ho to kya hota hai</h3>
<p>Director poori configuration nahi bana sakta, isliye wo <b>kuch bhi push nahi karta</b>; aadha-configured branch na hone se bhi bura hai. Course model mein device state <code>Post-staging failed</code> ho jati hai aur reason aisa hota hai: <code>Bind data incomplete for Branch3: wan2-gateway</code>. Value fix karo, commit karo, aur agla evaluation succeed hota hai. Ye exact message aap ticket lab mein dekhoge.</p>

<div class="eg"><p><b>Worked example.</b> Bind data ka configuration mein expansion: <code>wan1-address 203.0.113.14/30</code> banta hai <code>interfaces vni-0/0 unit 0 family inet address 203.0.113.14/30</code>; <code>wan1-gateway 203.0.113.13</code> banta hai <code>Internet-Transport-VR</code> mein default route; <code>wan2-gateway 172.31.3.1</code> banta hai <code>MPLS-Transport-VR</code> mein 172.31.0.0/16 ka route. To missing wan2-gateway ka matlab MPLS route nahi, aur push silently hone se pehle hi refuse ho jata hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> gateway WAN subnet ke bahar hona; addresses mein prefix length chhod dena; wan2 ko MPLS ka naam samajhna jabki wo dusra template interface hai; sahi device name ke liye bind data dena lekin galat group.</p></div>
<div class="exam"><p><b>Exam trap:</b> bind data Director mein per device store hota hai. Ise edit karne se branch tab tak nahi badalta jab tak workflow dobara deploy na ho.</p></div>

<div class="scn"><h4>Ek khali cell, ek chup site</h4><p>Spreadsheet import se 25 sites load hui. Ek row mein WAN2 gateway nahi tha kyunki MPLS circuit abhi install ho raha tha. Site sahi stage hui lekin kabhi Online nahi aayi. Director ne missing key list ki. Carrier handoff ke baad team ne fill kiya aur redeploy kiya.</p><p><b>Lesson:</b> staging tunnel chalna bind data ke baare mein kuch prove nahi karta. Weekend se pehle har row ka <code>Missing bind data</code> check karo.</p></div>

<div class="iv"><p class="q">"Template variable aur bind data mein kya fark hai?"</p><p>Variable shared template ka named placeholder hai. Bind data ek specific device ki values ka set hai jo un placeholders ko bharta hai. Template = shape, bind data = values.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bind data mein wo sab hai jo per device alag hai: site-id, LAN, WAN addresses aur gateways.</li>
<li>wan1, wan2, wan3 template ke WAN interfaces ko VNI order mein follow karte hain.</li>
<li><code>show devices device &lt;name&gt;</code> bind data aur Missing bind data dikhata hai.</li>
<li>Koi bhi missing required value push rok deti hai: Post-staging failed.</li>
<li>Bind data edit karne ke baad branch par effect ke liye redeploy chahiye.</li>
</ul></div>
`}};export{e as default};