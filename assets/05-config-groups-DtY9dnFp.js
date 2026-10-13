var e={id:`config-groups`,h:{en:`Configuration groups, profiles and feature profiles (the modern model)`,hi:`Configuration groups, profiles aur feature profiles (modern model)`},body:{en:`
<p>Remember the recipe book from chapter 1? The legacy template model made a separate recipe book for every kind of kitchen (every device model). Configuration groups reorganise the same idea like a modern cookbook: <b>chapters</b> (profiles) such as "system", "transport", "service", and inside each chapter many <b>recipes</b> (features). A chapter can be reused in many cookbooks, and one cookbook works in different kitchens because it is not tied to one device model.</p>

<h3>The hierarchy</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Configuration group hierarchy">
<rect x="10" y="10" width="620" height="250" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Configuration group: BR-BRANCH</text>
<rect x="25" y="45" width="190" height="200" rx="8" fill="#bae6fd"/><text x="120" y="66" text-anchor="middle" class="svg-ink" font-size="13">System profile</text><text x="120" y="92" text-anchor="middle" class="svg-muted" font-size="12">Basic (hostname,</text><text x="120" y="108" text-anchor="middle" class="svg-muted" font-size="12">system IP, site ID)</text><text x="120" y="130" text-anchor="middle" class="svg-muted" font-size="12">OMP, BFD</text><text x="120" y="152" text-anchor="middle" class="svg-muted" font-size="12">AAA, NTP, Logging</text><text x="120" y="230" text-anchor="middle" class="svg-ink" font-size="11">mandatory</text>
<rect x="225" y="45" width="190" height="200" rx="8" fill="#ddd6fe"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">Transport and Management</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">WAN VPN (VPN 0)</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">WAN interface</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">(biz-internet tunnel)</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Management VPN 512</text><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="11">mandatory</text>
<rect x="425" y="45" width="190" height="95" rx="8" fill="#bbf7d0"/><text x="520" y="66" text-anchor="middle" class="svg-ink" font-size="13">Service profile</text><text x="520" y="92" text-anchor="middle" class="svg-muted" font-size="12">LAN VPN 10</text><text x="520" y="110" text-anchor="middle" class="svg-muted" font-size="12">LAN interface, routing</text><text x="520" y="132" text-anchor="middle" class="svg-ink" font-size="11">optional</text>
<rect x="425" y="150" width="190" height="95" rx="8" fill="#fde68a"/><text x="520" y="171" text-anchor="middle" class="svg-ink" font-size="13">CLI add-on profile</text><text x="520" y="197" text-anchor="middle" class="svg-muted" font-size="12">extra CLI lines</text><text x="520" y="237" text-anchor="middle" class="svg-ink" font-size="11">optional</text>
</svg><p class="cap">A configuration group contains profiles; a profile contains features; a feature has parameters.</p></div>
<ul>
<li><b>Configuration group</b>: the unit you deploy to devices. It contains profiles.</li>
<li><b>Feature profile</b> (often just "profile"): a reusable bundle of features of one kind.</li>
<li><b>Feature</b>: one configurable item inside a profile, for example an OMP feature or a WAN interface feature.</li>
<li><b>Parameter</b>: a field of the feature, with a <b>scope</b>.</li>
</ul>

<h3>Profile types</h3>
<table class="cmp"><tr><th>Profile</th><th>Required?</th><th>What it holds (examples)</th></tr>
<tr><td>System</td><td>Mandatory</td><td>Basic settings (hostname, system IP, site ID), global settings, AAA, logging, NTP, OMP, BFD</td></tr>
<tr><td>Transport and Management</td><td>Mandatory</td><td>WAN VPN (VPN 0), WAN interface with tunnel settings and color, management VPN 512, static or dynamic routing in the underlay</td></tr>
<tr><td>Service</td><td>Optional</td><td>LAN VPNs, LAN interfaces, routing protocols (OSPF, BGP, EIGRP), DHCP server, VRRP</td></tr>
<tr><td>CLI add-on</td><td>Optional</td><td>Extra CLI lines for features the GUI does not cover</td></tr>
<tr><td>Other</td><td>Optional</td><td>Features such as a Switchport profile or others that depend on the platform and release</td></tr>
<tr><td>Policy object</td><td>Optional</td><td>Lists and objects that policy groups refer to</td></tr></table>
<p>The names of individual features vary by release. The structure is stable: system, transport and management, service, CLI add-on, plus the optional ones.</p>

<h3>From the old model to the new</h3>
<table class="cmp"><tr><th>Legacy</th><th>Configuration group</th></tr>
<tr><td>System, OMP, BFD, AAA, Logging feature templates</td><td>Features in the <b>System</b> profile</td></tr>
<tr><td>VPN 0 + VPN Interface Ethernet (WAN)</td><td>Features in the <b>Transport and Management</b> profile</td></tr>
<tr><td>Service VPN + LAN interface + routing</td><td>Features in the <b>Service</b> profile</td></tr>
<tr><td>CLI add-on template</td><td><b>CLI add-on</b> profile</td></tr>
<tr><td>Device template</td><td>Configuration group</td></tr>
<tr><td>Device-specific variable</td><td>Parameter with scope <b>Device Specific</b></td></tr></table>

<h3>Parameter scopes</h3>
<p>As in feature templates, every parameter has a scope:</p>
<ul>
<li><b>Global</b>: one value for every device in the group.</li>
<li><b>Device Specific</b>: a variable, asked at deployment time. You can set a default value, which helps when most devices share it.</li>
<li><b>Default</b>: the platform's built-in value.</li>
</ul>

<h3>Site type: single router or dual router</h3>
<p>When you create a configuration group you choose the <b>site type</b>. <b>Single Router</b> is the default. <b>Dual Router</b> creates the profile structure for a site with two WAN edges, such as the Delhi data center with E-DEL-1 and E-DEL-2, so each router gets its own transport settings while sharing the rest.</p>

<h3>Click path: create a configuration group</h3>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Configuration Groups</b>.</li>
<li>Click <b>Add Configuration Group</b>.</li>
<li>Select the solution (SD-WAN), the <b>site type</b> (Single Router or Dual Router), enter a <b>name</b> and <b>description</b>.</li>
<li>The Manager creates the mandatory profiles. Open each profile and add features, setting parameter scopes.</li>
<li>Click <b>Save</b>. Then associate devices and deploy (next chapter).</li>
</ol>
<p>You can also start from a guided workflow in <b>Workflows</b> &gt; <b>Workflow Library</b>, which proposes Cisco-recommended defaults.</p>

<h3>Why Cisco prefers this model</h3>
<ul>
<li><b>Model agnostic</b>: one group for different platforms.</li>
<li><b>Reuse</b>: a profile (for example your standard System profile) can serve many groups.</li>
<li><b>Guided and safer</b>: workflows apply recommended settings and check dependencies.</li>
<li><b>Policy integration</b>: policy groups plug into configuration groups.</li>
<li><b>Tags and rules</b>: devices can join a group automatically when their tags match a rule.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Bharat Retail creates the group <code>BR-BRANCH</code> (Single Router). System profile: Basic (hostname, system IP, site ID Device Specific), OMP and BFD (Global), NTP (Global). Transport profile: WAN VPN with a default route to the Device Specific gateway, a WAN interface with color biz-internet. Service profile: LAN VPN 10 with a LAN interface whose IP is Device Specific. E-BLR-1, E-MUM-1 and E-DEL-1 can all use it; only six values differ.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Treating a feature profile as a device template (it is reusable and not tied to a model); forgetting that System and Transport and Management are mandatory; leaving identifying parameters as Global; and expecting every legacy feature to have an identical named feature in the new model.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the mandatory profiles (System, Transport and Management) and the optional ones (Service, CLI add-on, and others). Know the three scopes. Know that site type can be Single Router or Dual Router.</p></div>

<div class="scn"><h4>One group for two platforms</h4><p>Bharat Retail bought Catalyst 8200s for the big branches and Catalyst 8300s for hubs. With device templates they maintained two families of feature templates, one per model, and drifted apart over time. After migrating to configuration groups they kept one System profile and one Service profile for both platforms and only the Transport profile differed in the interface names.</p><p><b>Lesson:</b> reusable, model-agnostic profiles remove duplicate maintenance.</p></div>

<div class="iv"><p class="q">"What are the main differences between device templates and configuration groups?"</p><p>Strong answer: device templates are built from model-specific feature templates; configuration groups are built from reusable feature profiles (system, transport and management, service, CLI add-on) and are model agnostic. Groups use guided workflows, parameter scopes, tags and tag rules, and integrate with policy groups. A device is managed by one model at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration group, profile, feature, parameter: the hierarchy of the modern model.</li>
<li>Mandatory profiles: System and Transport and Management; others are optional.</li>
<li>Scopes: Global, Device Specific (with optional default), Default.</li>
<li>Site type Single Router or Dual Router at creation time.</li>
<li>Click path: Configuration &gt; Configuration Groups &gt; Add Configuration Group.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ki recipe book yaad hai? Legacy template model har tarah ke kitchen (har device model) ke liye alag recipe book banata tha. Configuration groups wahi idea modern cookbook ki tarah reorganise karte hain: <b>chapters</b> (profiles) jaise "system", "transport", "service", aur har chapter ke andar kai <b>recipes</b> (features). Ek chapter kai cookbooks mein reuse ho sakta hai, aur ek cookbook alag kitchens mein chalta hai kyunki woh ek device model se bandha nahi hai.</p>

<h3>Hierarchy</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Configuration group hierarchy">
<rect x="10" y="10" width="620" height="250" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Configuration group: BR-BRANCH</text>
<rect x="25" y="45" width="190" height="200" rx="8" fill="#bae6fd"/><text x="120" y="66" text-anchor="middle" class="svg-ink" font-size="13">System profile</text><text x="120" y="92" text-anchor="middle" class="svg-muted" font-size="12">Basic (hostname,</text><text x="120" y="108" text-anchor="middle" class="svg-muted" font-size="12">system IP, site ID)</text><text x="120" y="130" text-anchor="middle" class="svg-muted" font-size="12">OMP, BFD</text><text x="120" y="152" text-anchor="middle" class="svg-muted" font-size="12">AAA, NTP, Logging</text><text x="120" y="230" text-anchor="middle" class="svg-ink" font-size="11">mandatory</text>
<rect x="225" y="45" width="190" height="200" rx="8" fill="#ddd6fe"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="13">Transport and Management</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">WAN VPN (VPN 0)</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">WAN interface</text><text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">(biz-internet tunnel)</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Management VPN 512</text><text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="11">mandatory</text>
<rect x="425" y="45" width="190" height="95" rx="8" fill="#bbf7d0"/><text x="520" y="66" text-anchor="middle" class="svg-ink" font-size="13">Service profile</text><text x="520" y="92" text-anchor="middle" class="svg-muted" font-size="12">LAN VPN 10</text><text x="520" y="110" text-anchor="middle" class="svg-muted" font-size="12">LAN interface, routing</text><text x="520" y="132" text-anchor="middle" class="svg-ink" font-size="11">optional</text>
<rect x="425" y="150" width="190" height="95" rx="8" fill="#fde68a"/><text x="520" y="171" text-anchor="middle" class="svg-ink" font-size="13">CLI add-on profile</text><text x="520" y="197" text-anchor="middle" class="svg-muted" font-size="12">extra CLI lines</text><text x="520" y="237" text-anchor="middle" class="svg-ink" font-size="11">optional</text>
</svg><p class="cap">Configuration group mein profiles hote hain; profile mein features; feature mein parameters.</p></div>
<ul>
<li><b>Configuration group</b>: woh unit jo aap devices par deploy karte ho. Isme profiles hote hain.</li>
<li><b>Feature profile</b> (aksar sirf "profile"): ek tarah ke features ka reusable bundle.</li>
<li><b>Feature</b>: profile ke andar ek configurable item, jaise OMP feature ya WAN interface feature.</li>
<li><b>Parameter</b>: feature ka field, ek <b>scope</b> ke saath.</li>
</ul>

<h3>Profile types</h3>
<table class="cmp"><tr><th>Profile</th><th>Required?</th><th>Kya rakhta hai (examples)</th></tr>
<tr><td>System</td><td>Mandatory</td><td>Basic settings (hostname, system IP, site ID), global settings, AAA, logging, NTP, OMP, BFD</td></tr>
<tr><td>Transport and Management</td><td>Mandatory</td><td>WAN VPN (VPN 0), tunnel settings aur color wala WAN interface, management VPN 512, underlay mein static ya dynamic routing</td></tr>
<tr><td>Service</td><td>Optional</td><td>LAN VPNs, LAN interfaces, routing protocols (OSPF, BGP, EIGRP), DHCP server, VRRP</td></tr>
<tr><td>CLI add-on</td><td>Optional</td><td>Un features ke liye extra CLI lines jo GUI cover nahi karta</td></tr>
<tr><td>Other</td><td>Optional</td><td>Platform aur release par depend karne wale features</td></tr>
<tr><td>Policy object</td><td>Optional</td><td>Lists aur objects jinka policy groups reference dete hain</td></tr></table>
<p>Individual features ke naam release ke hisaab se badalte hain. Structure stable hai: system, transport and management, service, CLI add-on, plus optional wale.</p>

<h3>Purane model se naye model tak</h3>
<table class="cmp"><tr><th>Legacy</th><th>Configuration group</th></tr>
<tr><td>System, OMP, BFD, AAA, Logging feature templates</td><td><b>System</b> profile ke features</td></tr>
<tr><td>VPN 0 + VPN Interface Ethernet (WAN)</td><td><b>Transport and Management</b> profile ke features</td></tr>
<tr><td>Service VPN + LAN interface + routing</td><td><b>Service</b> profile ke features</td></tr>
<tr><td>CLI add-on template</td><td><b>CLI add-on</b> profile</td></tr>
<tr><td>Device template</td><td>Configuration group</td></tr>
<tr><td>Device-specific variable</td><td><b>Device Specific</b> scope wala parameter</td></tr></table>

<h3>Parameter scopes</h3>
<p>Feature templates ki tarah har parameter ka ek scope hota hai:</p>
<ul>
<li><b>Global</b>: group ke har device ke liye ek value.</li>
<li><b>Device Specific</b>: ek variable, jo deployment time par poocha jaata hai. Aap default value set kar sakte ho, jo tab madad karta hai jab zyada tar devices share karte hain.</li>
<li><b>Default</b>: platform ki built-in value.</li>
</ul>

<h3>Site type: single router ya dual router</h3>
<p>Configuration group banate waqt aap <b>site type</b> chunte ho. <b>Single Router</b> default hai. <b>Dual Router</b> do WAN edges wali site ke liye profile structure banata hai, jaise Delhi data center jahan E-DEL-1 aur E-DEL-2 hain, taaki har router ko apni transport settings milein aur baaki share hon.</p>

<h3>Click path: configuration group banao</h3>
<ol>
<li><b>Configuration</b> &gt; <b>Configuration Groups</b> kholo.</li>
<li><b>Add Configuration Group</b> click karo.</li>
<li>Solution (SD-WAN), <b>site type</b> (Single Router ya Dual Router) chuno, <b>name</b> aur <b>description</b> likho.</li>
<li>Manager mandatory profiles bana deta hai. Har profile kholo aur features jodo, parameter scopes set karte hue.</li>
<li><b>Save</b> click karo. Phir devices associate karo aur deploy karo (agla chapter).</li>
</ol>
<p>Aap <b>Workflows</b> &gt; <b>Workflow Library</b> mein guided workflow se bhi shuru kar sakte ho, jo Cisco-recommended defaults suggest karta hai.</p>

<h3>Cisco is model ko kyun prefer karta hai</h3>
<ul>
<li><b>Model agnostic</b>: alag platforms ke liye ek group.</li>
<li><b>Reuse</b>: ek profile (jaise aapka standard System profile) kai groups ko serve kar sakta hai.</li>
<li><b>Guided aur safer</b>: workflows recommended settings lagate hain aur dependencies check karte hain.</li>
<li><b>Policy integration</b>: policy groups configuration groups mein plug hote hain.</li>
<li><b>Tags aur rules</b>: jab devices ke tags rule se match karein to woh group mein automatically aa sakte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Bharat Retail group <code>BR-BRANCH</code> (Single Router) banata hai. System profile: Basic (hostname, system IP, site ID Device Specific), OMP aur BFD (Global), NTP (Global). Transport profile: Device Specific gateway ke default route wala WAN VPN, color biz-internet wala WAN interface. Service profile: LAN VPN 10 jiske LAN interface ka IP Device Specific hai. E-BLR-1, E-MUM-1 aur E-DEL-1 sab ise use kar sakte hain; sirf chhe values alag hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Feature profile ko device template samajhna (yeh reusable hai aur model se bandha nahi); yeh bhool jaana ki System aur Transport and Management mandatory hain; identify karne wale parameters ko Global chhodna; aur yeh umeed karna ki har legacy feature ka naye model mein identical naam wala feature hoga.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mandatory profiles (System, Transport and Management) aur optional wale (Service, CLI add-on, aur anya) jaano. Teen scopes jaano. Yeh jaano ki site type Single Router ya Dual Router ho sakta hai.</p></div>

<div class="scn"><h4>Do platforms ke liye ek group</h4><p>Bharat Retail ne bade branches ke liye Catalyst 8200 aur hubs ke liye Catalyst 8300 kharide. Device templates ke saath unhone do families ke feature templates maintain kiye, har model ke liye ek, aur samay ke saath woh alag-alag ho gaye. Configuration groups par migrate hone ke baad unhone dono platforms ke liye ek System profile aur ek Service profile rakha aur sirf Transport profile interface names mein alag tha.</p><p><b>Seekh:</b> reusable, model-agnostic profiles duplicate maintenance hata dete hain.</p></div>

<div class="iv"><p class="q">"Device templates aur configuration groups mein main differences kya hain?"</p><p>Strong answer: device templates model-specific feature templates se bante hain; configuration groups reusable feature profiles (system, transport and management, service, CLI add-on) se bante hain aur model agnostic hain. Groups guided workflows, parameter scopes, tags aur tag rules use karte hain, aur policy groups se integrate hote hain. Ek device ek waqt mein ek model se manage hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Configuration group, profile, feature, parameter: modern model ki hierarchy.</li>
<li>Mandatory profiles: System aur Transport and Management; baaki optional.</li>
<li>Scopes: Global, Device Specific (optional default ke saath), Default.</li>
<li>Creation time par site type Single Router ya Dual Router.</li>
<li>Click path: Configuration &gt; Configuration Groups &gt; Add Configuration Group.</li>
</ul></div>
`}};export{e as default};