var e={id:`templates-provisioning`,h:{en:`Templates and provisioning: day-0, day-N and the tag model`,hi:`Templates aur provisioning: day-0, day-N aur tag model`},body:{en:`
<p>A cake recipe has fixed steps and a few blanks: how many people, which flavour. You write the recipe once and fill the blanks for each party. A <b>configuration template</b> is the same idea: the fixed CLI lines are written once, and <b>variables</b> (site code, VLAN, IP address) are filled in per device or per site. This chapter is concept, plus one hands-on bridge: the RESTCONF PATCH of lab 1 is a template with one object.</p>

<h3>Day-0 and day-N</h3>
<ul>
<li><b>Day-0</b> is the first configuration of a new device: management IP, credentials, the base settings needed to be managed. In Catalyst Center this is done with <b>Plug and Play (PnP)</b>: a new device boots, finds the controller (through DHCP option 43, a DNS name or the cloud redirection service) and receives its day-0 template and software image without anyone at the site.</li>
<li><b>Day-N</b> is every change after that: a new SSID, a different VLAN, a new RADIUS server. Catalyst Center pushes day-N changes from its wireless design objects (SSIDs, wireless profiles, RF profiles) and, when the built-in objects are not enough, from <b>CLI templates</b>.</li>
</ul>

<h3>How a CLI template works</h3>
<p>Catalyst Center stores a template as text with placeholders and a templating language (Velocity, and Jinja in newer releases). When you provision, it asks for the variable values (or reads them from a bound source), renders the text into plain CLI, and pushes it. It can also add a pre-check and rollback, and it records the result. The engine itself is concept only here; what you can practise is the CLI a template would render.</p>
<pre class="code"><span class="c">! template text, variables start with a dollar sign (Velocity style)</span>
wireless profile policy PP-$siteCode
 shutdown
 vlan $guestVlan
 no shutdown
 exit</pre>
<pre class="code"><span class="c">! rendered for site MUM with guestVlan = 120</span>
wireless profile policy PP-MUM
 shutdown
 vlan 120
 no shutdown
 exit</pre>
<p>Notice the <code>shutdown</code> and <code>no shutdown</code>. A good template respects the controller's rule: a policy profile must be shut down before its VLAN changes. A template that forgets this fails on the device, exactly like a person typing it would.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Template rendering">
<rect x="20" y="20" width="170" height="70" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="12">fixed lines + $variables</text>
<rect x="20" y="110" width="170" height="70" rx="8" fill="#fde68a"/><text x="105" y="135" text-anchor="middle" class="svg-ink" font-size="13">Variables per site</text><text x="105" y="155" text-anchor="middle" class="svg-muted" font-size="12">siteCode, guestVlan</text>
<rect x="260" y="60" width="130" height="80" rx="8" fill="#ddd6fe"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="13">Render</text><text x="325" y="115" text-anchor="middle" class="svg-muted" font-size="12">Catalyst Center</text>
<rect x="460" y="60" width="160" height="80" rx="8" fill="#bbf7d0"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="13">Plain CLI on WLC</text><text x="540" y="115" text-anchor="middle" class="svg-muted" font-size="12">then verify</text>
<line x1="190" y1="55" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="145" x2="260" y2="112" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A template plus variables is rendered to ordinary CLI. The controller sees nothing special.</p></div>

<h3>Why the tag model suits automation</h3>
<p>On the 9800, a WLAN profile and a policy profile are joined by a <b>policy tag</b>, APs wear policy, site and RF tags, and one tag can sit on hundreds of APs. That is a natural fit for templates: define the objects once, bind them to tags, and move APs between behaviours by changing one tag instead of editing every AP. In the lab, WLAN <b>NK-STAFF</b> (id 1, PSK) and policy <b>PP-STAFF</b> (VLAN 20) are bound by tag <b>PT-CAMPUS</b> on AP1 and AP2. A site template would create the same three objects for a new branch with its own names.</p>

<h3>Provisioning in Catalyst Center (concept)</h3>
<ol>
<li>Design the SSID and a wireless profile in the network design area; map the profile to a site.</li>
<li>Assign the 9800 and its APs to a site in the site hierarchy.</li>
<li>Provision the controller: Catalyst Center builds the WLANs, policy profiles and tags and pushes them; it can also set the managed AP location, RF profile and AP group equivalent.</li>
<li>Provision the APs, or let them inherit from the controller.</li>
<li>Check the task result and the assurance page for the site.</li>
</ol>
<p>Catalyst Center keeps the intended state. If you change the controller by hand afterwards, the next provisioning run will overwrite or flag the difference, which is why a team should choose one place to make changes.</p>

<h3>The lab 1 PATCH as a one-object template</h3>
<p>Look at what the API change in lab 1 does. It sends one small JSON body naming the object and the leaves to change; the controller translates it into its own commands: shut the WLAN, edit, restore the state you asked for. That is a template with a fixed shape and variable values, aimed at a single WLAN. You will build it in chapter 8.</p>
<pre class="out">{"Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-entry":
  {"profile-name":"NK-STAFF","wlan-status":true,<span class="hl">"broadcast-ssid":false</span>}}</pre>

<div class="eg"><p><b>Worked example.</b> A bank opens 12 new branches. Each needs SSID BANK-STAFF on VLAN 20 and BANK-GUEST on VLAN 120. Variables per branch: site code and the two VLAN numbers if they differ. With a template the team enters 12 rows of variables once, provisions, and Catalyst Center reports 12 successes or the exact failing line. Without a template, an engineer repeats 30 or more commands 12 times.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting secrets such as a PSK in plain text in a shared template. Use the platform's secure variable type or keep the key out of the template, and rotate it if it leaked into a log.</p></div>

<div class="exam"><p><b>Exam trap.</b> Day-0 is not "the first day of the project". It is the zero-touch onboarding of a new device (PnP). A day-N template changes a device that is already managed.</p></div>

<div class="scn"><h4>The template that failed on one site</h4><p>A VLAN change template succeeded on 11 sites and failed on one with an error about the policy profile being enabled. That branch had a different default and the template did not shut the policy first. The engineer added the shutdown and no shutdown lines, re-ran only the failed site, and added a pre-check that reads the policy state.</p><p><b>Lesson:</b> templates are code. They need the same ordering rules as the CLI and a test on one site first.</p></div>

<div class="iv"><p class="q">"What is the difference between day-0 and day-N configuration?"</p><p>Day-0 onboards a new device with enough configuration to be managed (PnP, zero touch). Day-N is every later change, from design objects or templates. Add that templates render to plain CLI and must follow the device's ordering rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template is fixed CLI plus variables, rendered into ordinary commands.</li>
<li>Day-0 is zero-touch onboarding (PnP); day-N is every later change.</li>
<li>Tags let one object set drive hundreds of APs, ideal for templates.</li>
<li>Templates must obey device rules such as shutting a policy before editing.</li>
<li>The template engine and provisioning jobs are concept only; the lab 1 PATCH is a one-object example.</li>
</ul></div>
`,hi:`
<p>Cake ki recipe mein fixed steps hote hain aur kuch blanks: kitne log, kaun sa flavour. Recipe ek baar likhte ho aur har party ke liye blanks bharte ho. <b>Configuration template</b> bhi yahi idea hai: fixed CLI lines ek baar likhi jaati hain, aur <b>variables</b> (site code, VLAN, IP address) har device ya site ke liye bhare jaate hain. Yeh chapter concept hai, ek hands-on bridge ke saath: lab 1 ka RESTCONF PATCH ek object wala template hai.</p>

<h3>Day-0 aur day-N</h3>
<ul>
<li><b>Day-0</b> naye device ki pehli configuration hai: management IP, credentials, manage hone ke liye zaroori base settings. Catalyst Center mein yeh <b>Plug and Play (PnP)</b> se hota hai: naya device boot hota hai, controller ko dhoondhta hai (DHCP option 43, DNS name ya cloud redirection service se) aur site par kisi ke bina apna day-0 template aur software image paa leta hai.</li>
<li><b>Day-N</b> uske baad ka har change hai: naya SSID, alag VLAN, naya RADIUS server. Catalyst Center day-N changes apne wireless design objects (SSIDs, wireless profiles, RF profiles) se push karta hai aur jab built-in objects kaafi na hon to <b>CLI templates</b> se.</li>
</ul>

<h3>CLI template kaise kaam karta hai</h3>
<p>Catalyst Center template ko placeholders aur templating language (Velocity, aur naye releases mein Jinja) ke saath text ki tarah store karta hai. Provision karte waqt woh variable values maangta hai (ya bound source se padhta hai), text ko plain CLI mein render karta hai aur push karta hai. Woh pre-check aur rollback bhi jod sakta hai aur result record karta hai. Engine khud yahan sirf concept hai; jo aap practise kar sakte ho woh CLI hai jo template render karta.</p>
<pre class="code"><span class="c">! template text, variables dollar sign se shuru (Velocity style)</span>
wireless profile policy PP-$siteCode
 shutdown
 vlan $guestVlan
 no shutdown
 exit</pre>
<pre class="code"><span class="c">! site MUM ke liye render, guestVlan = 120</span>
wireless profile policy PP-MUM
 shutdown
 vlan 120
 no shutdown
 exit</pre>
<p><code>shutdown</code> aur <code>no shutdown</code> dhyan se dekho. Achha template controller ka rule maanta hai: VLAN badalne se pehle policy profile shut hona chahiye. Jo template yeh bhool jaaye woh device par fail hota hai, bilkul waise hi jaise insaan type karta to hota.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Template rendering">
<rect x="20" y="20" width="170" height="70" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="12">fixed lines + $variables</text>
<rect x="20" y="110" width="170" height="70" rx="8" fill="#fde68a"/><text x="105" y="135" text-anchor="middle" class="svg-ink" font-size="13">Har site ke variables</text><text x="105" y="155" text-anchor="middle" class="svg-muted" font-size="12">siteCode, guestVlan</text>
<rect x="260" y="60" width="130" height="80" rx="8" fill="#ddd6fe"/><text x="325" y="95" text-anchor="middle" class="svg-ink" font-size="13">Render</text><text x="325" y="115" text-anchor="middle" class="svg-muted" font-size="12">Catalyst Center</text>
<rect x="460" y="60" width="160" height="80" rx="8" fill="#bbf7d0"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="13">WLC par plain CLI</text><text x="540" y="115" text-anchor="middle" class="svg-muted" font-size="12">phir verify</text>
<line x1="190" y1="55" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="145" x2="260" y2="112" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="460" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Template plus variables ordinary CLI mein render hota hai. Controller ko kuch special nahi dikhta.</p></div>

<h3>Tag model automation ke liye kyun fit hai</h3>
<p>9800 par WLAN profile aur policy profile ko <b>policy tag</b> jodta hai, APs policy, site aur RF tags pehente hain, aur ek tag sainkdon APs par ho sakta hai. Yeh templates ke liye natural fit hai: objects ek baar define karo, tags se bind karo, aur har AP edit karne ki jagah ek tag badalkar APs ko ek behaviour se doosre mein le jao. Lab mein WLAN <b>NK-STAFF</b> (id 1, PSK) aur policy <b>PP-STAFF</b> (VLAN 20) ko AP1 aur AP2 par tag <b>PT-CAMPUS</b> bind karta hai. Site template naye branch ke liye apne naamon ke saath wahi teen objects banata.</p>

<h3>Catalyst Center mein provisioning (concept)</h3>
<ol>
<li>Network design area mein SSID aur wireless profile design karo; profile ko site se map karo.</li>
<li>Site hierarchy mein 9800 aur uske APs ko site se assign karo.</li>
<li>Controller provision karo: Catalyst Center WLANs, policy profiles aur tags banata aur push karta hai; woh managed AP location, RF profile aur AP group jaisi settings bhi set kar sakta hai.</li>
<li>APs provision karo, ya unhe controller se inherit karne do.</li>
<li>Task result aur site ka assurance page check karo.</li>
</ol>
<p>Catalyst Center intended state rakhta hai. Agar baad mein aap controller haath se badlo to agla provisioning run use overwrite karega ya difference flag karega, isliye team ko changes ke liye ek hi jagah chunni chahiye.</p>

<h3>Lab 1 ka PATCH, ek object wale template ki tarah</h3>
<p>Dekho lab 1 ka API change kya karta hai. Woh ek chhoti JSON body bhejta hai jo object aur badalne wale leaves ka naam batati hai; controller use apne commands mein translate karta hai: WLAN shut, edit, aapki maangi state wapas. Yeh fixed shape aur variable values wala template hai, ek WLAN par aimed. Aap ise chapter 8 mein banaoge.</p>
<pre class="out">{"Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-entry":
  {"profile-name":"NK-STAFF","wlan-status":true,<span class="hl">"broadcast-ssid":false</span>}}</pre>

<div class="eg"><p><b>Worked example.</b> Ek bank 12 naye branches kholta hai. Har ko VLAN 20 par SSID BANK-STAFF aur VLAN 120 par BANK-GUEST chahiye. Har branch ke variables: site code aur dono VLAN numbers agar alag hon. Template ke saath team 12 rows ke variables ek baar bharti hai, provision karti hai, aur Catalyst Center 12 success ya exact failing line report karta hai. Template ke bina engineer 30 ya zyada commands 12 baar repeat karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> PSK jaise secrets ko shared template mein plain text mein rakhna. Platform ka secure variable type use karo ya key ko template se bahar rakho, aur agar log mein leak ho gayi to rotate karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Day-0 "project ka pehla din" nahi hai. Yeh naye device ka zero-touch onboarding (PnP) hai. Day-N template pehle se managed device ko badalta hai.</p></div>

<div class="scn"><h4>Jo template ek site par fail hua</h4><p>VLAN change template 11 sites par succeed hua aur ek par fail hua, error tha ki policy profile enabled hai. Us branch ka default alag tha aur template ne policy pehle shut nahi ki. Engineer ne shutdown aur no shutdown lines jodi, sirf failed site dobara chalayi, aur policy state padhne wala pre-check jod diya.</p><p><b>Lesson:</b> templates code hain. Unhe CLI jaise hi ordering rules aur pehle ek site par test chahiye.</p></div>

<div class="iv"><p class="q">"Day-0 aur day-N configuration mein kya farq hai?"</p><p>Day-0 naye device ko itni configuration ke saath onboard karta hai ki woh manage ho sake (PnP, zero touch). Day-N baad ka har change hai, design objects ya templates se. Jodo ki templates plain CLI mein render hote hain aur device ke ordering rules follow karne padte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template fixed CLI plus variables hai, jo ordinary commands mein render hota hai.</li>
<li>Day-0 zero-touch onboarding (PnP) hai; day-N baad ka har change.</li>
<li>Tags ek object set se sainkdon APs chalate hain, templates ke liye ideal.</li>
<li>Templates ko device rules maanne padte hain, jaise edit se pehle policy shut karna.</li>
<li>Template engine aur provisioning jobs sirf concept hain; lab 1 ka PATCH ek-object example hai.</li>
</ul></div>
`}};export{e as default};