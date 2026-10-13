var e={id:`deploy-groups`,h:{en:`Deploying configuration groups: workflows, association, tags and migration`,hi:`Configuration groups deploy karna: workflows, association, tags aur migration`},body:{en:`
<p>Building a configuration group is like designing a flat-pack furniture kit. Deploying it is like handing a kit to each customer with the right screws and a personalised label. In this chapter you will see how a configuration group reaches real edges: guided workflows, associating devices, entering device-specific values, previewing and deploying, and then how to move from the legacy template model.</p>

<h3>Workflows: guided building</h3>
<p>The Manager has a menu named <b>Workflows</b>. Under <b>Workflows</b> &gt; <b>Workflow Library</b> you find guided workflows for common tasks, such as creating a configuration group and deploying it. A workflow is a wizard: it asks for information step by step, proposes Cisco-recommended defaults, and validates dependencies, so a beginner builds a correct configuration without knowing every field. You can also do the same work directly from <b>Configuration</b> &gt; <b>Configuration Groups</b> when you want full control. The exam expects you to know that workflows exist and what they do, not every screen of each wizard.</p>

<h3>Step 1: associate devices</h3>
<p>A configuration group applies only to devices <b>associated</b> with it. A device must first be onboarded to the Manager (it is in the WAN edge list). Two ways to associate:</p>
<ul>
<li><b>Manually.</b> Open <b>Configuration</b> &gt; <b>Configuration Groups</b>, select the group, and choose <b>Associated Devices</b> (add devices). Pick the edges, for example E-DEL-1, E-MUM-1 and E-BLR-1.</li>
<li><b>By tags and rules.</b> In <b>Configuration</b> &gt; <b>Devices</b> you give devices <b>tags</b> (for example <code>region = west</code> or <code>type = branch</code>). A <b>rule</b> in the configuration group then matches devices by tag, with operators such as Equals, Not equals, Contains, Not contains, Starts with and Ends with, combined with Match All or Match Any. In recent releases (26.1 and later) rule-based association is built into the Associated Devices page; earlier releases of the modern model offered tag rules for the same purpose. A new router with the right tag joins the group automatically.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Tag rules and association">
<rect x="10" y="20" width="150" height="190" rx="8" fill="#e2e8f0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Devices + tags</text><text x="85" y="70" text-anchor="middle" class="svg-muted" font-size="12">E-DEL-1  type=hub</text><text x="85" y="95" text-anchor="middle" class="svg-muted" font-size="12">E-MUM-1  type=branch</text><text x="85" y="120" text-anchor="middle" class="svg-muted" font-size="12">E-BLR-1  type=branch</text><text x="85" y="145" text-anchor="middle" class="svg-muted" font-size="12">E-HYD-1  type=branch</text>
<rect x="200" y="70" width="170" height="90" rx="8" fill="#ddd6fe"/><text x="285" y="95" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="285" y="118" text-anchor="middle" class="svg-muted" font-size="12">type Equals branch</text><text x="285" y="138" text-anchor="middle" class="svg-muted" font-size="12">Match All</text>
<rect x="410" y="20" width="220" height="190" rx="8" fill="#bbf7d0"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">Group BR-BRANCH</text><text x="520" y="75" text-anchor="middle" class="svg-muted" font-size="12">E-MUM-1</text><text x="520" y="100" text-anchor="middle" class="svg-muted" font-size="12">E-BLR-1</text><text x="520" y="125" text-anchor="middle" class="svg-muted" font-size="12">E-HYD-1</text><text x="520" y="185" text-anchor="middle" class="svg-ink" font-size="12">E-DEL-1 (hub) stays out</text>
<line x1="160" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/><line x1="370" y1="115" x2="410" y2="115" stroke="#16a34a" stroke-width="2"/>
</svg><p class="cap">A rule matches devices by tag, so group membership grows without clicking each router.</p></div>

<h3>Step 2: deploy</h3>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Configuration Groups</b>, select the group and start the <b>Deploy</b> action (the Deploy Configuration Group workflow).</li>
<li>Select the associated devices to deploy to.</li>
<li>In <b>Add/Review Device Configuration</b>, enter the <b>Device Specific</b> values for each device (hostname, system IP, site ID, WAN IP and gateway, LAN IP). You can type them or upload a CSV file. Defaults you set earlier are already filled.</li>
<li><b>Preview</b> the configuration and read the <b>Config Diff</b> exactly as you did with templates.</li>
<li>Click <b>Deploy</b> and watch the status for each device.</li>
</ol>
<pre class="out">Task: Deploy configuration group BR-BRANCH     Device: E-MUM-1 (10.255.0.12)
[10:02:11] Validating configuration group ......... Success
[10:02:12] Generating device configuration ........ Success
[10:02:14] Pushing configuration to device ........ Success
[10:02:19] <span class="hl">Configuration group deployed to device</span></pre>
<p>Behind the scenes it is the same mechanism you studied in the last chapter: the Manager generates the complete configuration, compares it with the device and pushes the difference with NETCONF through the control connection, and the device commits it.</p>

<h3>The value of variables in groups</h3>
<p>A good practice is to keep as few Device Specific parameters as possible. Choose Global for the design you want to be the same everywhere (BFD timers, OMP settings, AAA, NTP) and Device Specific only for what truly differs. Where one value is common to most sites, give it a default. This keeps your CSV files small and mistakes few.</p>
<pre class="out">hostname,system_ip,site_id,wan_ip,wan_gw,lan_ip
E-MUM-1,10.255.0.12,200,203.0.113.10/30,203.0.113.9,10.2.10.1/24
E-BLR-1,10.255.0.13,300,203.0.113.14/30,203.0.113.13,10.3.10.1/24
E-HYD-1,10.255.0.14,400,198.51.100.74/30,198.51.100.73,10.4.10.1/24</pre>

<h3>Migrating from device templates</h3>
<p>Many networks have years of device templates. Cisco provides a <b>conversion tool</b> that reads templates and builds configuration groups, documented for the 20.12 and 20.13 releases, and recommends Release 20.12 or later as the starting point. A safe migration plan:</p>
<ol>
<li>Inventory the templates and note which devices use each one.</li>
<li>Convert, then <b>review</b> the generated groups. The conversion is a starting point; check feature by feature.</li>
<li>Deploy to one <b>pilot</b> device and read the Config Diff. A clean migration shows almost no diff.</li>
<li>Move devices in batches, then retire the old templates.</li>
</ol>
<p>Remember that a device uses <b>one</b> model. Moving it to a configuration group means it leaves the device template.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to onboard the device before associating it; wrong tags that put a hub into the branch group; too many Device Specific parameters; and migrating all devices at once without a pilot and a diff.</p></div>
<div class="exam"><p><b>Exam trap.</b> Association comes before deployment. Tags and rules automate association. The Deploy workflow has a step to add or review device configuration (the variables), then preview, then deploy. Workflow Library is under Workflows.</p></div>

<div class="scn"><h4>The hub that got a branch configuration</h4><p>Bharat Retail used the tag <code>type = branch</code> and a rule on the BR-BRANCH group. During a data entry session someone typed <code>type = branch</code> on E-DEL-1 instead of <code>hub</code>. The Deploy preview showed the hub's interface descriptions being replaced and the BGP routing feature missing. The engineer noticed in the Config Diff, corrected the tag, and the hub was never pushed.</p><p><b>Lesson:</b> rules are powerful and need clean tags. The diff is your last safety check.</p></div>

<div class="iv"><p class="q">"How do you deploy a configuration to 200 branches with configuration groups?"</p><p>Strong answer: build the configuration group (system, transport and management, service profiles), tag the devices and use a rule or associate them manually, fill Device Specific values by CSV, preview the Config Diff, deploy to a pilot first, then to the rest in batches. Mention the Workflow Library for guided creation and that the push uses NETCONF through the control connection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflows &gt; Workflow Library offers guided workflows; the Deploy workflow reviews device configuration then deploys.</li>
<li>Devices must be associated with the group, manually or by tags and rules.</li>
<li>Device Specific values are entered by hand or CSV; defaults reduce work.</li>
<li>Always preview the Config Diff and pilot on one device.</li>
<li>Migrate templates with the conversion tool, then review and pilot; a device uses one model.</li>
</ul></div>
`,hi:`
<p>Configuration group banana flat-pack furniture kit design karne jaisa hai. Use deploy karna har customer ko sahi screws aur personalised label ke saath kit dene jaisa hai. Is chapter mein aap dekhoge ki configuration group asli edges tak kaise pahunchta hai: guided workflows, devices associate karna, device-specific values daalna, preview aur deploy, aur phir legacy template model se kaise move karein.</p>

<h3>Workflows: guided building</h3>
<p>Manager mein <b>Workflows</b> naam ka menu hai. <b>Workflows</b> &gt; <b>Workflow Library</b> ke neeche aapko common tasks ke guided workflows milte hain, jaise configuration group banana aur use deploy karna. Workflow ek wizard hai: yeh step by step information maangta hai, Cisco-recommended defaults suggest karta hai, aur dependencies validate karta hai, isliye beginner har field jaane bina sahi configuration bana leta hai. Jab aapko poora control chahiye to wahi kaam aap seedha <b>Configuration</b> &gt; <b>Configuration Groups</b> se bhi kar sakte ho. Exam expect karta hai ki aap jaano ki workflows hote hain aur kya karte hain, har wizard ki har screen nahi.</p>

<h3>Step 1: devices associate karo</h3>
<p>Configuration group sirf un devices par lagta hai jo us se <b>associated</b> hain. Device pehle Manager mein onboard hona chahiye (WAN edge list mein ho). Associate karne ke do tareeke:</p>
<ul>
<li><b>Manually.</b> <b>Configuration</b> &gt; <b>Configuration Groups</b> kholo, group select karo, aur <b>Associated Devices</b> (devices add karo) chuno. Edges chuno, jaise E-DEL-1, E-MUM-1 aur E-BLR-1.</li>
<li><b>Tags aur rules se.</b> <b>Configuration</b> &gt; <b>Devices</b> mein aap devices ko <b>tags</b> dete ho (jaise <code>region = west</code> ya <code>type = branch</code>). Configuration group ka <b>rule</b> phir devices ko tag se match karta hai, Equals, Not equals, Contains, Not contains, Starts with aur Ends with jaise operators ke saath, Match All ya Match Any se joda hua. Recent releases (26.1 aur baad) mein rule-based association Associated Devices page mein built-in hai; modern model ki pehle ki releases mein isi kaam ke liye tag rules the. Sahi tag wala naya router group mein apne aap aa jaata hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Tag rules aur association">
<rect x="10" y="20" width="150" height="190" rx="8" fill="#e2e8f0"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">Devices + tags</text><text x="85" y="70" text-anchor="middle" class="svg-muted" font-size="12">E-DEL-1  type=hub</text><text x="85" y="95" text-anchor="middle" class="svg-muted" font-size="12">E-MUM-1  type=branch</text><text x="85" y="120" text-anchor="middle" class="svg-muted" font-size="12">E-BLR-1  type=branch</text><text x="85" y="145" text-anchor="middle" class="svg-muted" font-size="12">E-HYD-1  type=branch</text>
<rect x="200" y="70" width="170" height="90" rx="8" fill="#ddd6fe"/><text x="285" y="95" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="285" y="118" text-anchor="middle" class="svg-muted" font-size="12">type Equals branch</text><text x="285" y="138" text-anchor="middle" class="svg-muted" font-size="12">Match All</text>
<rect x="410" y="20" width="220" height="190" rx="8" fill="#bbf7d0"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">Group BR-BRANCH</text><text x="520" y="75" text-anchor="middle" class="svg-muted" font-size="12">E-MUM-1</text><text x="520" y="100" text-anchor="middle" class="svg-muted" font-size="12">E-BLR-1</text><text x="520" y="125" text-anchor="middle" class="svg-muted" font-size="12">E-HYD-1</text><text x="520" y="185" text-anchor="middle" class="svg-ink" font-size="12">E-DEL-1 (hub) bahar rehta hai</text>
<line x1="160" y1="115" x2="200" y2="115" stroke="#64748b" stroke-width="2"/><line x1="370" y1="115" x2="410" y2="115" stroke="#16a34a" stroke-width="2"/>
</svg><p class="cap">Rule devices ko tag se match karta hai, isliye har router click kiye bina group membership badhti hai.</p></div>

<h3>Step 2: deploy</h3>
<ol>
<li><b>Configuration</b> &gt; <b>Configuration Groups</b> kholo, group select karo aur <b>Deploy</b> action shuru karo (Deploy Configuration Group workflow).</li>
<li>Jin associated devices par deploy karna hai unhe select karo.</li>
<li><b>Add/Review Device Configuration</b> mein har device ke <b>Device Specific</b> values bharo (hostname, system IP, site ID, WAN IP aur gateway, LAN IP). Aap unhe type kar sakte ho ya CSV file upload kar sakte ho. Jo defaults aapne pehle set kiye woh pehle se bhare hote hain.</li>
<li>Configuration <b>Preview</b> karo aur <b>Config Diff</b> bilkul waise padho jaise templates ke saath padha tha.</li>
<li><b>Deploy</b> click karo aur har device ka status dekho.</li>
</ol>
<pre class="out">Task: Deploy configuration group BR-BRANCH     Device: E-MUM-1 (10.255.0.12)
[10:02:11] Validating configuration group ......... Success
[10:02:12] Generating device configuration ........ Success
[10:02:14] Pushing configuration to device ........ Success
[10:02:19] <span class="hl">Configuration group deployed to device</span></pre>
<p>Parde ke peeche wahi mechanism hai jo aapne pichhle chapter mein padha: Manager poori configuration generate karta hai, use device se compare karta hai aur difference ko NETCONF se control connection ke zariye push karta hai, aur device use commit karta hai.</p>

<h3>Groups mein variables ki value</h3>
<p>Achhi practice yeh hai ki Device Specific parameters jitne ho sake kam rakho. Jo design har jagah same chahiye (BFD timers, OMP settings, AAA, NTP) uske liye Global chuno aur Device Specific sirf us cheez ke liye jo sach mein alag hai. Jahan ek value zyada tar sites mein common ho, use default do. Isse aapki CSV files chhoti rehti hain aur galtiyan kam.</p>
<pre class="out">hostname,system_ip,site_id,wan_ip,wan_gw,lan_ip
E-MUM-1,10.255.0.12,200,203.0.113.10/30,203.0.113.9,10.2.10.1/24
E-BLR-1,10.255.0.13,300,203.0.113.14/30,203.0.113.13,10.3.10.1/24
E-HYD-1,10.255.0.14,400,198.51.100.74/30,198.51.100.73,10.4.10.1/24</pre>

<h3>Device templates se migrate karna</h3>
<p>Kai networks ke paas saalon ke device templates hain. Cisco ek <b>conversion tool</b> deta hai jo templates padhkar configuration groups banata hai, jo 20.12 aur 20.13 releases ke liye documented hai, aur Release 20.12 ya baad ko starting point recommend karta hai. Safe migration plan:</p>
<ol>
<li>Templates ka inventory lo aur note karo kaunse devices har ek ko use karte hain.</li>
<li>Convert karo, phir generated groups ko <b>review</b> karo. Conversion ek starting point hai; feature by feature check karo.</li>
<li>Ek <b>pilot</b> device par deploy karo aur Config Diff padho. Clean migration mein lagbhag koi diff nahi dikhta.</li>
<li>Devices ko batches mein move karo, phir purane templates retire karo.</li>
</ol>
<p>Yaad rakho ki device <b>ek</b> model use karta hai. Use configuration group mein le jaane ka matlab hai ki woh device template chhod deta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Associate karne se pehle device onboard karna bhool jaana; galat tags jo hub ko branch group mein daal dein; bahut zyada Device Specific parameters; aur pilot aur diff ke bina saare devices ek saath migrate karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Association deployment se pehle aata hai. Tags aur rules association ko automate karte hain. Deploy workflow mein device configuration add ya review karne ka step (variables) hota hai, phir preview, phir deploy. Workflow Library Workflows ke neeche hai.</p></div>

<div class="scn"><h4>Hub ko branch configuration mil gayi</h4><p>Bharat Retail ne tag <code>type = branch</code> aur BR-BRANCH group par rule use kiya. Data entry session ke dauraan kisi ne E-DEL-1 par <code>hub</code> ki jagah <code>type = branch</code> type kar diya. Deploy preview ne hub ke interface descriptions replace hote aur BGP routing feature missing dikhaya. Engineer ne Config Diff mein dekha, tag theek kiya, aur hub par kabhi push nahi hua.</p><p><b>Seekh:</b> rules powerful hain aur clean tags maangte hain. Diff aapka aakhri safety check hai.</p></div>

<div class="iv"><p class="q">"Configuration groups se 200 branches par configuration kaise deploy karoge?"</p><p>Strong answer: configuration group banao (system, transport and management, service profiles), devices ko tag karo aur rule use karo ya manually associate karo, Device Specific values CSV se bharo, Config Diff preview karo, pehle pilot par deploy karo, phir baaki par batches mein. Guided creation ke liye Workflow Library batao aur yeh bhi ki push NETCONF se control connection ke zariye hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflows &gt; Workflow Library guided workflows deta hai; Deploy workflow device configuration review karta hai phir deploy.</li>
<li>Devices group se associated hone chahiye, manually ya tags aur rules se.</li>
<li>Device Specific values haath se ya CSV se bharte hain; defaults kaam kam karte hain.</li>
<li>Hamesha Config Diff preview karo aur ek device par pilot karo.</li>
<li>Conversion tool se templates migrate karo, phir review aur pilot; device ek model use karta hai.</li>
</ul></div>
`}};export{e as default};