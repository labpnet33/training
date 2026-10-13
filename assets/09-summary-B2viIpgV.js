var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the full picture of how the SD-WAN Manager turns a design into device configuration. This chapter is your revision sheet for the interview and for blueprint items 3.5 (CLI and feature templates, including VRRP, OSPF, BGP and EIGRP) and 3.7 (configuration and policy groups, feature profiles and workflows).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Templates summary">
<rect x="10" y="10" width="300" height="130" rx="10" fill="#bae6fd"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Legacy model</text><text x="160" y="58" text-anchor="middle" class="svg-muted" font-size="12">Feature template (one feature)</text><text x="160" y="78" text-anchor="middle" class="svg-muted" font-size="12">Device template (assembly)</text><text x="160" y="98" text-anchor="middle" class="svg-muted" font-size="12">CLI template / CLI add-on</text><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="12">variables: {{name}}, CSV</text>
<rect x="330" y="10" width="300" height="130" rx="10" fill="#bbf7d0"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">Modern model</text><text x="480" y="58" text-anchor="middle" class="svg-muted" font-size="12">Configuration group</text><text x="480" y="78" text-anchor="middle" class="svg-muted" font-size="12">Profiles: system, transport and mgmt,</text><text x="480" y="96" text-anchor="middle" class="svg-muted" font-size="12">service, CLI add-on, policy object</text><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="12">scopes: Global, Device Specific, Default</text>
<rect x="10" y="155" width="620" height="65" rx="10" fill="#f1f5f9"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Push: validate, generate, diff, NETCONF over the control connection, commit, status</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Policy groups (20.12 / 17.12) are deployed through configuration groups</text>
</svg><p class="cap">Two models, one push mechanism.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why templates exist and describe what the Manager does at push time.</li>
<li>List feature template categories (system, VPN, VPN interface, BFD, OMP, AAA, security) and the four sections of a device template.</li>
<li>Explain the three scopes: Global, Device Specific and Default; fill variables by hand and by CSV.</li>
<li>Write a CLI template and a CLI add-on with <code>{{variables}}</code>, and state the conflict rule for add-ons.</li>
<li>Walk through attach, preview, config diff and deploy, with the click paths.</li>
<li>Explain NETCONF, the rollback timer, Manager mode versus CLI mode and Out of Sync.</li>
<li>Describe configuration groups, profiles (mandatory and optional), feature profiles, site types and tag rules.</li>
<li>Explain policy groups, their components and that they deploy through configuration groups.</li>
<li>Name the Workflow Library and what guided workflows do.</li>
<li>Troubleshoot a failed push in four stages.</li>
</ul>

<h3>Blueprint 3.5: VRRP, OSPF, BGP and EIGRP in templates</h3>
<p>The blueprint asks you to configure these with CLI and feature templates. In the legacy model, the service VPN section of a device template can take extra feature templates for <b>OSPF</b>, <b>BGP</b> and <b>EIGRP</b>, and the <b>VPN Interface Ethernet</b> template has a VRRP section (group ID, virtual IP, priority, track OMP or a prefix list). In a CLI template you use the normal IOS XE commands inside the VRF:</p>
<pre class="code">router ospf 10 vrf 10
 network 10.1.10.0 0.0.0.255 area 0
!
router bgp 65010
 address-family ipv4 vrf 10
  neighbor 10.1.10.2 remote-as 65020
  neighbor 10.1.10.2 activate
!
interface GigabitEthernet3
 vrrp 10 address-family ipv4
  address 10.1.10.1 primary
  priority 110</pre>
<p>Remember from the edge module: a learned prefix is advertised into OMP only if you enable it (for example <code>advertise ospf</code>), and OMP routes reach the LAN only if you redistribute them into the LAN protocol.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Feature template</dt><dd>Legacy template for one feature of one device model.</dd>
<dt>Device template</dt><dd>Legacy assembly of feature templates, or a full CLI template.</dd>
<dt>CLI add-on template</dt><dd>Extra CLI lines attached to a feature-template device template.</dd>
<dt>Variable</dt><dd>A Device Specific value; <code>{{name}}</code> in CLI text.</dd>
<dt>Config preview / diff</dt><dd>The full generated configuration and the lines that will change.</dd>
<dt>NETCONF</dt><dd>Protocol the Manager uses to push configuration, carried in the control connection.</dd>
<dt>Out of Sync</dt><dd>Device configuration differs from the last pushed configuration.</dd>
<dt>Configuration group</dt><dd>Modern deployable unit made of feature profiles; model agnostic.</dd>
<dt>Feature profile</dt><dd>Reusable bundle of features: System, Transport and Management, Service, CLI add-on, others.</dd>
<dt>Site type</dt><dd>Single Router or Dual Router, chosen when creating a configuration group.</dd>
<dt>Policy group</dt><dd>Guided, reusable policy set (since 20.12 / 17.12), deployed through configuration groups.</dd>
<dt>Workflow Library</dt><dd>Menu of guided workflows under Workflows.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>Legacy: Configuration &gt; Templates. Modern: Configuration &gt; Configuration Groups. Policy: Configuration &gt; Policy Groups. Wizards: Workflows &gt; Workflow Library.</li>
<li>A device uses one model at a time.</li>
<li>Mandatory profiles: System and Transport and Management.</li>
<li>Scopes: Global, Device Specific, Default.</li>
<li>CLI variable syntax: <code>{{name}}</code>; device-configuration-based CLI templates since Release 17.2.1r.</li>
<li>The Manager pushes only the difference, by NETCONF, through the control connection.</li>
<li>A failed commit keeps the old configuration.</li>
<li>Policy groups need a configuration group.</li>
<li>System IP must be unique; keep identifiers Device Specific.</li>
</ol>

<h3>Cheat-sheet</h3>
<pre class="code">Configuration &gt; Templates &gt; Feature Templates &gt; Add Template
Configuration &gt; Templates &gt; Device Templates &gt; Create Template &gt; From Feature Template | CLI Template
  ... &gt; (row menu) Attach Devices &gt; variables &gt; Config Preview / Config Diff &gt; Configure Devices
Configuration &gt; Configuration Groups &gt; Add Configuration Group &gt; Associated Devices &gt; Deploy
Configuration &gt; Policy Groups &gt; Add Policy Group
Workflows &gt; Workflow Library

show sdwan running-config
show sdwan control connections
show ip route vrf 10</pre>

<div class="warn"><p><b>Common mistakes to revise.</b> Global identifiers; add-on lines that duplicate generated config; no diff or pilot; local CLI edits that put a device Out of Sync; deploying a policy group to a device without a configuration group.</p></div>
<div class="exam"><p><b>Exam trap to revise.</b> Questions that mention "feature profile", "configuration group" or "workflow" are about the modern model; "device template", "feature template" or "CLI add-on" are about the legacy model. Read the nouns first.</p></div>

<div class="scn"><h4>The migration week</h4><p>A retailer with 150 device-template branches planned a migration. Monday: inventory and conversion tool. Tuesday: review the generated groups and fix two features the tool had mapped imperfectly. Wednesday: pilot on one branch, diff showed only a banner difference. Thursday and Friday: batches of 40 with tag rules. A policy group for application SLA followed the next week, because policy groups need configuration groups first.</p><p><b>Lesson:</b> migrate in a planned order: groups, pilot, batches, then policy groups.</p></div>

<div class="iv"><p class="q">"Give me a two-minute overview of how you manage branch configuration in Catalyst SD-WAN."</p><p>Strong answer: design once, push many. In the legacy model I build feature templates, assemble a device template, add a CLI add-on for gaps and fill variables per device. In the modern model I build a configuration group from system, transport and management and service profiles, associate devices by tags, fill Device Specific values and deploy. In both I read the config diff, pilot first, and the Manager pushes the difference by NETCONF through the control connection. Policy groups are deployed through configuration groups. I troubleshoot in four stages: validation, reachability, device commit, after-push state.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two models: templates (legacy) and configuration groups (modern), one push mechanism.</li>
<li>Variables and scopes make one design fit many devices.</li>
<li>Preview, diff and pilot before every mass push.</li>
<li>Policy groups sit on top of configuration groups.</li>
<li>Troubleshoot in four stages and use the diff to decide who wins in an Out of Sync case.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas poori picture hai ki SD-WAN Manager design ko device configuration mein kaise badalta hai. Yeh chapter interview aur blueprint items 3.5 (CLI aur feature templates, jismein VRRP, OSPF, BGP aur EIGRP shamil hain) aur 3.7 (configuration aur policy groups, feature profiles aur workflows) ke liye aapki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Templates summary">
<rect x="10" y="10" width="300" height="130" rx="10" fill="#bae6fd"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Legacy model</text><text x="160" y="58" text-anchor="middle" class="svg-muted" font-size="12">Feature template (ek feature)</text><text x="160" y="78" text-anchor="middle" class="svg-muted" font-size="12">Device template (assembly)</text><text x="160" y="98" text-anchor="middle" class="svg-muted" font-size="12">CLI template / CLI add-on</text><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="12">variables: {{name}}, CSV</text>
<rect x="330" y="10" width="300" height="130" rx="10" fill="#bbf7d0"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">Modern model</text><text x="480" y="58" text-anchor="middle" class="svg-muted" font-size="12">Configuration group</text><text x="480" y="78" text-anchor="middle" class="svg-muted" font-size="12">Profiles: system, transport and mgmt,</text><text x="480" y="96" text-anchor="middle" class="svg-muted" font-size="12">service, CLI add-on, policy object</text><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="12">scopes: Global, Device Specific, Default</text>
<rect x="10" y="155" width="620" height="65" rx="10" fill="#f1f5f9"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Push: validate, generate, diff, control connection par NETCONF, commit, status</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Policy groups (20.12 / 17.12) configuration groups ke zariye deploy hote hain</text>
</svg><p class="cap">Do models, ek push mechanism.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki templates kyun hote hain aur push time par Manager kya karta hai.</li>
<li>Feature template categories (system, VPN, VPN interface, BFD, OMP, AAA, security) aur device template ke chaar sections list karo.</li>
<li>Teen scopes samjhao: Global, Device Specific aur Default; variables haath se aur CSV se bharo.</li>
<li><code>{{variables}}</code> ke saath CLI template aur CLI add-on likho, aur add-ons ka conflict rule batao.</li>
<li>Click paths ke saath attach, preview, config diff aur deploy walk through karo.</li>
<li>NETCONF, rollback timer, Manager mode versus CLI mode aur Out of Sync samjhao.</li>
<li>Configuration groups, profiles (mandatory aur optional), feature profiles, site types aur tag rules describe karo.</li>
<li>Policy groups, unke components aur yeh ki woh configuration groups ke zariye deploy hote hain samjhao.</li>
<li>Workflow Library ka naam lo aur batao guided workflows kya karte hain.</li>
<li>Failed push ko chaar stages mein troubleshoot karo.</li>
</ul>

<h3>Blueprint 3.5: templates mein VRRP, OSPF, BGP aur EIGRP</h3>
<p>Blueprint kehta hai ki inhe CLI aur feature templates se configure karo. Legacy model mein device template ke service VPN section mein <b>OSPF</b>, <b>BGP</b> aur <b>EIGRP</b> ke extra feature templates ja sakte hain, aur <b>VPN Interface Ethernet</b> template mein VRRP section hota hai (group ID, virtual IP, priority, track OMP ya prefix list). CLI template mein aap VRF ke andar normal IOS XE commands use karte ho:</p>
<pre class="code">router ospf 10 vrf 10
 network 10.1.10.0 0.0.0.255 area 0
!
router bgp 65010
 address-family ipv4 vrf 10
  neighbor 10.1.10.2 remote-as 65020
  neighbor 10.1.10.2 activate
!
interface GigabitEthernet3
 vrrp 10 address-family ipv4
  address 10.1.10.1 primary
  priority 110</pre>
<p>Edge module se yaad rakho: learned prefix OMP mein tabhi advertise hota hai jab aap use enable karo (jaise <code>advertise ospf</code>), aur OMP routes LAN tak tabhi pahunchte hain jab aap unhe LAN protocol mein redistribute karo.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Feature template</dt><dd>Ek device model ke ek feature ka legacy template.</dd>
<dt>Device template</dt><dd>Feature templates ka legacy assembly, ya poora CLI template.</dd>
<dt>CLI add-on template</dt><dd>Feature-template device template se attached extra CLI lines.</dd>
<dt>Variable</dt><dd>Device Specific value; CLI text mein <code>{{name}}</code>.</dd>
<dt>Config preview / diff</dt><dd>Poori generated configuration aur woh lines jo badlengi.</dd>
<dt>NETCONF</dt><dd>Protocol jo Manager configuration push karne ke liye use karta hai, control connection mein chalta hai.</dd>
<dt>Out of Sync</dt><dd>Device configuration aakhri pushed configuration se alag hai.</dd>
<dt>Configuration group</dt><dd>Feature profiles se bana modern deployable unit; model agnostic.</dd>
<dt>Feature profile</dt><dd>Features ka reusable bundle: System, Transport and Management, Service, CLI add-on, anya.</dd>
<dt>Site type</dt><dd>Single Router ya Dual Router, configuration group banate waqt chuna jaata hai.</dd>
<dt>Policy group</dt><dd>Guided, reusable policy set (20.12 / 17.12 se), configuration groups ke zariye deploy.</dd>
<dt>Workflow Library</dt><dd>Workflows ke neeche guided workflows ka menu.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ol>
<li>Legacy: Configuration &gt; Templates. Modern: Configuration &gt; Configuration Groups. Policy: Configuration &gt; Policy Groups. Wizards: Workflows &gt; Workflow Library.</li>
<li>Device ek waqt mein ek model use karta hai.</li>
<li>Mandatory profiles: System aur Transport and Management.</li>
<li>Scopes: Global, Device Specific, Default.</li>
<li>CLI variable syntax: <code>{{name}}</code>; device-configuration-based CLI templates Release 17.2.1r se.</li>
<li>Manager sirf difference push karta hai, NETCONF se, control connection ke zariye.</li>
<li>Failed commit purani configuration rakhta hai.</li>
<li>Policy groups ko configuration group chahiye.</li>
<li>System IP unique hona chahiye; identifiers ko Device Specific rakho.</li>
</ol>

<h3>Cheat-sheet</h3>
<pre class="code">Configuration &gt; Templates &gt; Feature Templates &gt; Add Template
Configuration &gt; Templates &gt; Device Templates &gt; Create Template &gt; From Feature Template | CLI Template
  ... &gt; (row menu) Attach Devices &gt; variables &gt; Config Preview / Config Diff &gt; Configure Devices
Configuration &gt; Configuration Groups &gt; Add Configuration Group &gt; Associated Devices &gt; Deploy
Configuration &gt; Policy Groups &gt; Add Policy Group
Workflows &gt; Workflow Library

show sdwan running-config
show sdwan control connections
show ip route vrf 10</pre>

<div class="warn"><p><b>Revise karne wali common mistakes.</b> Global identifiers; add-on lines jo generated config duplicate karti hain; diff ya pilot nahi; local CLI edits jo device ko Out of Sync karte hain; configuration group ke bina device par policy group deploy karna.</p></div>
<div class="exam"><p><b>Revise karne wala exam trap.</b> Jo sawal "feature profile", "configuration group" ya "workflow" mention karte hain woh modern model ke baare mein hain; "device template", "feature template" ya "CLI add-on" legacy model ke baare mein. Pehle nouns padho.</p></div>

<div class="scn"><h4>Migration ka hafta</h4><p>150 device-template branches wali ek retailer ne migration plan kiya. Monday: inventory aur conversion tool. Tuesday: generated groups review aur do features theek karna jo tool ne theek se map nahi kiye the. Wednesday: ek branch par pilot, diff ne sirf banner ka farak dikhaya. Thursday aur Friday: tag rules ke saath 40-40 ke batches. Application SLA ka policy group agle hafte aaya, kyunki policy groups ko pehle configuration groups chahiye.</p><p><b>Seekh:</b> planned order mein migrate karo: groups, pilot, batches, phir policy groups.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN mein branch configuration kaise manage karte ho, do minute mein overview do."</p><p>Strong answer: ek baar design, kai baar push. Legacy model mein feature templates banata hoon, device template assemble karta hoon, gaps ke liye CLI add-on jodta hoon aur per device variables bharta hoon. Modern model mein system, transport and management aur service profiles se configuration group banata hoon, tags se devices associate karta hoon, Device Specific values bharta hoon aur deploy karta hoon. Dono mein config diff padhta hoon, pehle pilot karta hoon, aur Manager difference ko NETCONF se control connection ke zariye push karta hai. Policy groups configuration groups ke zariye deploy hote hain. Main chaar stages mein troubleshoot karta hoon: validation, reachability, device commit, push ke baad ki state.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do models: templates (legacy) aur configuration groups (modern), ek push mechanism.</li>
<li>Variables aur scopes ek design ko kai devices par fit karte hain.</li>
<li>Har mass push se pehle preview, diff aur pilot.</li>
<li>Policy groups configuration groups ke upar baithte hain.</li>
<li>Chaar stages mein troubleshoot karo aur Out of Sync mein diff se tay karo kaun jeete.</li>
</ul></div>
`}};export{e as default};