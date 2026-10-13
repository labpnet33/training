var e={id:`big-picture`,h:{en:`The big picture: why templates, and the two models (templates and configuration groups)`,hi:`Big picture: templates kyun, aur do models (templates aur configuration groups)`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how the SD-WAN Manager turns one design into the configuration of hundreds of WAN edges. You will build and read device templates made of feature templates, write CLI templates and CLI add-on templates, use variables, attach templates and understand what the Manager does during a push (configuration preview, config diff, NETCONF), then move to the modern model: configuration groups, profiles, feature profiles, policy groups and the workflow library. You will also learn to roll back, to fix "out of sync" devices and to troubleshoot failed pushes. It covers blueprint items 3.5 (CLI and feature templates) and 3.7 (configuration and policy groups, feature profiles, workflows).</p>
<p><b>Prerequisites.</b> You should know the WAN edge basics from the previous module: system IP, site ID, VPN 0, TLOCs, colors and the service VPN. You should also have a working Manager, Controller and Validator from the controller module. No prior template knowledge is needed.</p>

<h3>Start with an analogy: a franchise recipe book</h3>
<p>Bharat Retail runs 300 branches. If the head office phoned every branch manager and dictated how to set up the shop, the shops would end up different. Instead, the head office writes <b>one recipe book</b>: the layout, the signage, the opening hours. Each branch receives the same book, with a few blanks to fill in: the shop name, the street address, the phone number. The recipe book is a <b>template</b>. The blanks are <b>variables</b>. Pressing "send" to a shop is a <b>push</b>.</p>
<p>Without templates, an SD-WAN engineer types the same fifty lines on 300 routers and makes slightly different mistakes on each. With templates, you fix the recipe once and every router follows it.</p>

<h3>Where the Manager sits</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Manager pushes configuration">
<rect x="20" y="20" width="200" height="90" rx="10" fill="#ddd6fe"/><text x="120" y="45" text-anchor="middle" class="svg-ink" font-size="13">VMANAGE 198.51.100.10</text><text x="120" y="68" text-anchor="middle" class="svg-muted" font-size="12">templates, variables,</text><text x="120" y="86" text-anchor="middle" class="svg-muted" font-size="12">config groups, policy groups</text>
<rect x="420" y="20" width="200" height="40" rx="8" fill="#bae6fd"/><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1 (site 100)</text>
<rect x="420" y="70" width="200" height="40" rx="8" fill="#bae6fd"/><text x="520" y="95" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1 (site 200)</text>
<rect x="420" y="120" width="200" height="40" rx="8" fill="#bae6fd"/><text x="520" y="145" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1 (site 300)</text>
<line x1="220" y1="65" x2="420" y2="40" stroke="#16a34a" stroke-width="2"/><line x1="220" y1="65" x2="420" y2="90" stroke="#16a34a" stroke-width="2"/><line x1="220" y1="65" x2="420" y2="140" stroke="#16a34a" stroke-width="2"/>
<text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">NETCONF over the</text><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">control connection</text>
<rect x="20" y="180" width="600" height="50" rx="8" fill="#f1f5f9"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">The Manager builds the full device configuration, compares it, and pushes the difference.</text>
</svg><p class="cap">The Manager reaches each edge through the control connection that is already up. No separate management path is needed.</p></div>

<h3>Two models side by side</h3>
<p>Catalyst SD-WAN has two configuration models. Both are on the exam, and real networks contain both.</p>
<table class="cmp"><tr><th></th><th>Legacy template model</th><th>Configuration groups</th></tr>
<tr><td>Building blocks</td><td>Feature templates assembled into a <b>device template</b>; or a full <b>CLI template</b></td><td>Reusable <b>feature profiles</b> (system, transport and management, service, CLI add-on) assembled into a <b>configuration group</b></td></tr>
<tr><td>Device model</td><td>Templates are tied to a device model</td><td>Model agnostic; one group can serve different platforms</td></tr>
<tr><td>Variables</td><td>Filled per device in the attach wizard or by CSV</td><td>Filled per device at deployment; parameter scopes: global, device specific, default</td></tr>
<tr><td>Guided creation</td><td>Mostly manual in the template editor</td><td>Guided workflows from the Workflow Library</td></tr>
<tr><td>Policy</td><td>Centralized policy built separately</td><td>Policy groups (recent releases), deployed through configuration groups</td></tr>
<tr><td>Menu</td><td><b>Configuration</b> &gt; <b>Templates</b></td><td><b>Configuration</b> &gt; <b>Configuration Groups</b>, <b>Configuration</b> &gt; <b>Policy Groups</b>, <b>Workflows</b> &gt; <b>Workflow Library</b></td></tr></table>
<p>Cisco is moving customers to configuration groups, with a recommended migration point around Release 20.12, and newer releases keep adding features to groups. However, many production networks still use device templates and you must be able to read and troubleshoot them. A device is managed by <b>one</b> model at a time: either a device template or a configuration group.</p>
<p>Exact menu names move slightly between releases. This module uses the click paths of the current Manager releases (the 20.x line and the newer 26.x line). If your screen differs, search the menu for the same words.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail has three branches that differ in four things: hostname, system IP, site ID and LAN subnet. A device template or configuration group holds everything else the same: OMP, BFD, NTP, AAA, VPN 0 with a default route and a biz-internet tunnel, and VPN 10 with a LAN interface. You fill four variables per branch. A fourth branch takes five minutes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Editing the router by CLI after a template is attached (the device then drifts from the template); building one template per branch instead of using variables; mixing the two models on the same device; and forgetting that feature templates are model specific.</p></div>
<div class="exam"><p><b>Exam trap.</b> The answer is often about the model: "device template" belongs to the legacy model; "feature profile" and "configuration group" belong to the new one; "policy group" is deployed through a configuration group and is available from Release 20.12 and 17.12.</p></div>

<div class="scn"><h4>Three hundred routers, one typo</h4><p>Before using templates, a retailer changed the NTP server on 300 routers by CLI. Twelve routers got a typo in the address and silently kept the wrong time. Certificates started to fail after a reboot on two of them. After moving to a template, the same change was one edit in one feature template, one push, and a diff that showed exactly what changed on each device.</p><p><b>Lesson:</b> templates give you consistency, a preview and an audit trail.</p></div>

<div class="iv"><p class="q">"Why do we use templates or configuration groups in SD-WAN?"</p><p>Strong answer: consistency and scale. You define the design once, use variables for what differs, and the Manager pushes it over NETCONF through the control connection. You get a preview, change history and one place to fix. Mention that configuration groups are the newer, model-agnostic, workflow-driven model and that device templates are the legacy model.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template is a reusable recipe; variables are the blanks; a push sends it to the device.</li>
<li>The Manager pushes configuration over NETCONF through the existing control connection.</li>
<li>Legacy model: feature templates, device templates and CLI templates (Configuration &gt; Templates).</li>
<li>New model: feature profiles in configuration groups, plus policy groups and workflows.</li>
<li>One device is managed by one model at a time.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki SD-WAN Manager ek design ko sainkdon WAN edges ki configuration mein kaise badalta hai. Aap feature templates se bane device templates banaoge aur padhoge, CLI templates aur CLI add-on templates likhoge, variables use karoge, templates attach karoge aur samjhoge ki push ke dauraan Manager kya karta hai (configuration preview, config diff, NETCONF), phir modern model par jaoge: configuration groups, profiles, feature profiles, policy groups aur workflow library. Aap rollback karna, "out of sync" devices theek karna aur failed pushes troubleshoot karna bhi seekhoge. Yeh blueprint items 3.5 (CLI aur feature templates) aur 3.7 (configuration aur policy groups, feature profiles, workflows) cover karta hai.</p>
<p><b>Prerequisites.</b> Pichhle module se WAN edge basics aane chahiye: system IP, site ID, VPN 0, TLOCs, colors aur service VPN. Controller module se working Manager, Controller aur Validator bhi hone chahiye. Pehle se template knowledge ki zaroorat nahi.</p>

<h3>Ek analogy se shuru karo: franchise ki recipe book</h3>
<p>Bharat Retail 300 branches chalata hai. Agar head office har branch manager ko phone karke dictate kare ki shop kaise set up karni hai, to shops alag-alag ban jayengi. Iski jagah head office <b>ek recipe book</b> likhta hai: layout, signage, opening hours. Har branch ko wahi book milti hai, kuch blanks ke saath jo bharne hote hain: shop ka naam, street address, phone number. Recipe book ek <b>template</b> hai. Blanks <b>variables</b> hain. Shop ko "send" dabana ek <b>push</b> hai.</p>
<p>Templates ke bina SD-WAN engineer wahi pachaas lines 300 routers par type karta hai aur har ek par thodi alag galtiyan karta hai. Templates ke saath aap recipe ek baar theek karte ho aur har router uska follow karta hai.</p>

<h3>Manager kahan baithta hai</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Manager configuration push karta hai">
<rect x="20" y="20" width="200" height="90" rx="10" fill="#ddd6fe"/><text x="120" y="45" text-anchor="middle" class="svg-ink" font-size="13">VMANAGE 198.51.100.10</text><text x="120" y="68" text-anchor="middle" class="svg-muted" font-size="12">templates, variables,</text><text x="120" y="86" text-anchor="middle" class="svg-muted" font-size="12">config groups, policy groups</text>
<rect x="420" y="20" width="200" height="40" rx="8" fill="#bae6fd"/><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1 (site 100)</text>
<rect x="420" y="70" width="200" height="40" rx="8" fill="#bae6fd"/><text x="520" y="95" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1 (site 200)</text>
<rect x="420" y="120" width="200" height="40" rx="8" fill="#bae6fd"/><text x="520" y="145" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1 (site 300)</text>
<line x1="220" y1="65" x2="420" y2="40" stroke="#16a34a" stroke-width="2"/><line x1="220" y1="65" x2="420" y2="90" stroke="#16a34a" stroke-width="2"/><line x1="220" y1="65" x2="420" y2="140" stroke="#16a34a" stroke-width="2"/>
<text x="320" y="55" text-anchor="middle" class="svg-accent" font-size="12">control connection par</text><text x="320" y="72" text-anchor="middle" class="svg-accent" font-size="12">NETCONF</text>
<rect x="20" y="180" width="600" height="50" rx="8" fill="#f1f5f9"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="13">Manager poori device configuration banata hai, compare karta hai, aur difference push karta hai.</text>
</svg><p class="cap">Manager har edge tak us control connection se pahunchta hai jo pehle se up hai. Alag management path ki zaroorat nahi.</p></div>

<h3>Do models side by side</h3>
<p>Catalyst SD-WAN ke do configuration models hain. Dono exam mein aate hain, aur real networks mein dono milte hain.</p>
<table class="cmp"><tr><th></th><th>Legacy template model</th><th>Configuration groups</th></tr>
<tr><td>Building blocks</td><td>Feature templates jo <b>device template</b> mein jode jaate hain; ya poora <b>CLI template</b></td><td>Reusable <b>feature profiles</b> (system, transport and management, service, CLI add-on) jo <b>configuration group</b> mein jode jaate hain</td></tr>
<tr><td>Device model</td><td>Templates device model se bandhe hote hain</td><td>Model agnostic; ek group alag platforms ko serve kar sakta hai</td></tr>
<tr><td>Variables</td><td>Attach wizard mein ya CSV se per device bhare jaate hain</td><td>Deployment par per device bhare jaate hain; parameter scopes: global, device specific, default</td></tr>
<tr><td>Guided creation</td><td>Zyada tar template editor mein manual</td><td>Workflow Library ke guided workflows</td></tr>
<tr><td>Policy</td><td>Centralized policy alag se banti hai</td><td>Policy groups (recent releases), configuration groups ke zariye deploy</td></tr>
<tr><td>Menu</td><td><b>Configuration</b> &gt; <b>Templates</b></td><td><b>Configuration</b> &gt; <b>Configuration Groups</b>, <b>Configuration</b> &gt; <b>Policy Groups</b>, <b>Workflows</b> &gt; <b>Workflow Library</b></td></tr></table>
<p>Cisco customers ko configuration groups ki taraf le ja raha hai, Release 20.12 ke aaspaas recommended migration point ke saath, aur nayi releases groups mein features jodti rehti hain. Lekin kai production networks abhi bhi device templates use karte hain aur aapko unhe padhna aur troubleshoot karna aana chahiye. Ek device ek waqt mein <b>ek</b> model se manage hota hai: ya device template ya configuration group.</p>
<p>Exact menu names releases ke beech thode badalte hain. Yeh module current Manager releases (20.x line aur nayi 26.x line) ke click paths use karta hai. Agar aapki screen alag ho to menu mein wahi words search karo.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ke teen branches chaar cheezon mein alag hain: hostname, system IP, site ID aur LAN subnet. Device template ya configuration group baaki sab same rakhta hai: OMP, BFD, NTP, AAA, default route aur biz-internet tunnel ke saath VPN 0, aur LAN interface ke saath VPN 10. Aap har branch ke liye chaar variables bharte ho. Chautha branch paanch minute mein ho jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Template attach hone ke baad router ko CLI se edit karna (device template se drift ho jaata hai); variables ke bajaye har branch ke liye ek template banana; ek hi device par dono models mix karna; aur yeh bhool jaana ki feature templates model specific hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jawab aksar model ke baare mein hota hai: "device template" legacy model ka hai; "feature profile" aur "configuration group" naye model ke hain; "policy group" configuration group ke zariye deploy hota hai aur Release 20.12 aur 17.12 se available hai.</p></div>

<div class="scn"><h4>Teen sau routers, ek typo</h4><p>Templates use karne se pehle ek retailer ne 300 routers par NTP server CLI se badla. Barah routers mein address mein typo ho gayi aur woh chupchap galat time rakhte rahe. Do par reboot ke baad certificates fail hone lage. Template par move karne ke baad wahi change ek feature template mein ek edit, ek push, aur ek diff tha jisne dikhaya ki har device par kya badla.</p><p><b>Seekh:</b> templates consistency, preview aur audit trail dete hain.</p></div>

<div class="iv"><p class="q">"SD-WAN mein templates ya configuration groups kyun use karte hain?"</p><p>Strong answer: consistency aur scale. Aap design ek baar define karte ho, jo alag hai uske liye variables use karte ho, aur Manager use NETCONF se control connection ke zariye push karta hai. Aapko preview, change history aur theek karne ki ek hi jagah milti hai. Batao ki configuration groups naya, model-agnostic, workflow-driven model hai aur device templates legacy model.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template reusable recipe hai; variables blanks hain; push use device tak bhejta hai.</li>
<li>Manager configuration ko NETCONF se, existing control connection ke zariye push karta hai.</li>
<li>Legacy model: feature templates, device templates aur CLI templates (Configuration &gt; Templates).</li>
<li>Naya model: configuration groups mein feature profiles, plus policy groups aur workflows.</li>
<li>Ek device ek waqt mein ek model se manage hota hai.</li>
</ul></div>
`}};export{e as default};