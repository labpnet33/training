var e={id:`object-model`,h:{en:`The object model: MIT, managed objects, DNs and tenants`,hi:`Object model: MIT, managed objects, DNs aur tenants`},body:{en:`
<p>Think of a postal address: country, state, city, street, house number. Read from left to right, it narrows down to exactly one house, and no two houses share the full address. ACI stores every piece of configuration and state in a tree, and every item in the tree has an address like that. Once you can read these addresses, the GUI, the REST API and the CLI all become the same thing seen through different windows.</p>

<h3>The Management Information Tree (MIT)</h3>
<p>Everything in ACI is a <b>managed object (MO)</b>: a tenant, a VRF, an EPG, a static port binding, a fault, a learned endpoint, a switch. All MOs hang in one hierarchical database called the <b>Management Information Tree (MIT)</b>, stored on the APIC cluster. Each MO has:</p>
<ul>
<li>a <b>class</b>: its type, for example <code>fvTenant</code>, <code>fvAEPg</code> or <code>faultInst</code>;</li>
<li>a <b>relative name (RN)</b>: its name inside its parent, for example <code>tn-NK-PROD</code> or <code>epg-WEB</code>;</li>
<li>a <b>distinguished name (DN)</b>: the RNs of all ancestors joined with slashes, unique in the whole fabric, for example <code>uni/tn-NK-PROD/ap-ECOM/epg-WEB</code>;</li>
<li><b>properties</b> (attributes), for example <code>pcTag</code>, <code>descr</code>, <code>prefGrMemb</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Part of the Management Information Tree">
<rect x="270" y="8" width="100" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">topRoot</text>
<rect x="110" y="62" width="120" height="30" rx="6" fill="#ddd6fe"/><text x="170" y="82" text-anchor="middle" class="svg-ink" font-size="13">uni (policy)</text>
<rect x="410" y="62" width="150" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="82" text-anchor="middle" class="svg-ink" font-size="13">topology (runtime)</text>
<line x1="300" y1="38" x2="190" y2="62" stroke="#64748b" stroke-width="2"/><line x1="340" y1="38" x2="470" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="118" width="120" height="30" rx="6" fill="#fde68a"/><text x="80" y="138" text-anchor="middle" class="svg-ink" font-size="13">tn-NK-PROD</text>
<rect x="160" y="118" width="120" height="30" rx="6" fill="#fed7aa"/><text x="220" y="138" text-anchor="middle" class="svg-ink" font-size="13">infra (access)</text>
<line x1="150" y1="92" x2="90" y2="118" stroke="#64748b" stroke-width="2"/><line x1="190" y1="92" x2="215" y2="118" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="118" width="110" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="138" text-anchor="middle" class="svg-ink" font-size="13">pod-1</text>
<line x1="485" y1="92" x2="485" y2="118" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="172" width="110" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="192" text-anchor="middle" class="svg-ink" font-size="13">node-101</text>
<line x1="485" y1="148" x2="485" y2="172" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="172" width="80" height="30" rx="6" fill="#bae6fd"/><text x="50" y="192" text-anchor="middle" class="svg-ink" font-size="12">ctx-PROD</text>
<rect x="100" y="172" width="90" height="30" rx="6" fill="#bae6fd"/><text x="145" y="192" text-anchor="middle" class="svg-ink" font-size="12">BD-WEB-BD</text>
<rect x="200" y="172" width="80" height="30" rx="6" fill="#bae6fd"/><text x="240" y="192" text-anchor="middle" class="svg-ink" font-size="12">ap-ECOM</text>
<line x1="60" y1="148" x2="50" y2="172" stroke="#64748b" stroke-width="2"/><line x1="80" y1="148" x2="145" y2="172" stroke="#64748b" stroke-width="2"/><line x1="100" y1="148" x2="235" y2="172" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="222" width="80" height="30" rx="6" fill="#bae6fd"/><text x="240" y="242" text-anchor="middle" class="svg-ink" font-size="12">epg-WEB</text>
<line x1="240" y1="202" x2="240" y2="222" stroke="#64748b" stroke-width="2"/>
<text x="300" y="242" class="svg-accent" font-size="12">DN = uni/tn-NK-PROD/ap-ECOM/epg-WEB</text>
</svg><p class="cap">Policy you configure lives under uni; the state of the running fabric lives under topology.</p></div>

<h3>Class names you will meet</h3>
<p>A class name is a <b>package</b> prefix plus a name. <code>fv</code> (fabric virtualization) holds tenant objects, <code>vz</code> holds contracts, <code>infra</code> holds access policies, <code>l3ext</code> holds L3Outs, <code>fabric</code> holds nodes, <code>fault</code> holds faults. Relations between objects are themselves objects whose class starts with <code>Rs</code> ("relation source"), for example <code>fvRsBd</code> (EPG to bridge domain) and <code>fvRsPathAtt</code> (EPG static port).</p>
<table class="cmp"><tr><th>GUI name</th><th>Class</th><th>RN prefix</th></tr>
<tr><td>Tenant</td><td>fvTenant</td><td>tn-</td></tr>
<tr><td>VRF</td><td>fvCtx</td><td>ctx-</td></tr>
<tr><td>Bridge domain / subnet</td><td>fvBD / fvSubnet</td><td>BD- / subnet-[ ]</td></tr>
<tr><td>Application profile / EPG</td><td>fvAp / fvAEPg</td><td>ap- / epg-</td></tr>
<tr><td>Contract / filter</td><td>vzBrCP / vzFilter</td><td>brc- / flt-</td></tr>
<tr><td>Learned endpoint</td><td>fvCEp</td><td>cep-</td></tr>
<tr><td>Switch node</td><td>fabricNode</td><td>node-</td></tr>
</table>

<h3>Tenants: the top of the policy tree</h3>
<p>A <b>tenant</b> is a container for policy with its own administrators: a customer, a business unit or an environment. Under <b>uni</b> (the policy universe) there are three system tenants and any number of user tenants:</p>
<ul>
<li><b>common</b>: objects shared by all tenants (for example a shared VRF, the <i>default</i> filter or a shared L3Out). When a tenant references an object by name and it does not exist locally, ACI looks in common.</li>
<li><b>infra</b>: the fabric underlay; its VRF <b>overlay-1</b> carries IS-IS, COOP and MP-BGP between switches.</li>
<li><b>mgmt</b>: in-band and out-of-band management of the nodes.</li>
<li><b>User tenants</b>: yours, such as NK-PROD in the labs.</li>
</ul>
<p>Access policies (VLAN pools, domains, AAEPs) are not in a tenant; they live under <code>uni/infra</code> and are owned by the fabric administrator. Role-based access control (security domains plus roles such as tenant-admin and fabric-admin) decides who can change which part of the tree.</p>

<h3>One tree, three windows: GUI, REST API and CLI</h3>
<p>The GUI is a client of the REST API. When you click Submit, the browser sends a REST call that creates or modifies MOs. You can watch this with the <b>API Inspector</b> (in the GUI user menu) and copy the call into a script. The REST API uses predictable paths:</p>
<pre class="code"><span class="c">! read one object and everything below it</span>
GET  /api/node/mo/uni/tn-NK-PROD.json?query-target=subtree
<span class="c">! read every object of one class in the fabric</span>
GET  /api/node/class/fvAEPg.json
<span class="c">! create or modify: post a payload to the parent DN</span>
POST /api/node/mo/uni.json
{"fvTenant":{"attributes":{"name":"NK-PROD","descr":"Production e-commerce"}}}</pre>
<p>On the APIC CLI, <code>moquery</code> reads the same objects by class or DN, and Ansible, Terraform and Python SDKs all write the same MOs. The APIC also offers an NX-OS style configuration mode, which again just creates MOs. The switch CLI is different: it only shows how the policy was rendered on that one switch.</p>
<pre class="out">APIC1# moquery -c fvAEPg
Total Objects shown: 2

# fv.AEPg
name         : WEB
<span class="hl">dn           : uni/tn-NK-PROD/ap-ECOM/epg-WEB</span>
pcTag        : 32770
prefGrMemb   : exclude
fvRsBd.tnFvBDName: WEB-BD

# fv.AEPg
name         : APP
dn           : uni/tn-NK-PROD/ap-ECOM/epg-APP
pcTag        : 32771
prefGrMemb   : exclude
fvRsBd.tnFvBDName: APP-BD</pre>

<div class="eg"><p><b>Worked example: reading a static port DN.</b> <code>uni/tn-NK-PROD/ap-ECOM/epg-WEB/rspathAtt-[topology/pod-1/paths-101/pathep-[eth1/1]]</code> reads as: in tenant NK-PROD, application profile ECOM, EPG WEB, there is a relation (<code>fvRsPathAtt</code>) to the path "pod 1, node 101, port eth1/1". The part in square brackets is itself a DN, of an object in the topology tree. For a vPC the path would be <code>protpaths-101-102/pathep-[NK-VPC-PG]</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deleting and recreating an object to "rename" it. Most object names are part of the RN, so they cannot be changed; a new name is a new object with a new DN. Everything that pointed to the old name (relations) breaks until you update it. Plan names before you build.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the three system tenants and their roles: common = shared objects, infra = fabric underlay (overlay-1), mgmt = node management. Also know that the GUI, REST API and CLI all operate on the same MIT; there is no separate "CLI config" that could disagree with the GUI.</p></div>

<div class="scn"><h4>Forty EPGs before lunch</h4><p>A telecom team needed 40 new EPGs, each with a static port on a vPC, for a migration weekend. Clicking through the GUI would have taken a day and invited typos. The engineer created one EPG in the GUI with the API Inspector open, copied the JSON payload that the GUI posted to <code>/api/node/mo/uni.json</code>, turned the EPG name and VLAN into variables in a short Python script, and posted the other 39. Before the change window she ran <code>moquery -c fvRsPathAtt</code> to confirm all 40 bindings existed with the right encapsulation.</p><p><b>Lesson:</b> because everything is an MO, anything you can click you can automate, and anything you automate you can verify with the same object names.</p></div>

<div class="iv"><p class="q">"What is a DN in ACI, and how do the GUI, API and CLI relate to each other?"</p><p>Strong answer: every configuration and state item is a managed object in the Management Information Tree; its distinguished name is the path of relative names from the root, for example uni/tn-X/ap-Y/epg-Z, unique in the fabric. The GUI is a REST client, the API Inspector shows its calls, and moquery, Ansible or Terraform read and write the same objects, so all interfaces are equivalent. Bonus: mention the class naming (fvAEPg, vzBrCP) and relation objects (fvRsBd, fvRsPathAtt).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every item is a managed object in the MIT, with a class, an RN and a unique DN.</li>
<li>Policy lives under uni; runtime state (nodes, learned endpoints) lives under topology.</li>
<li>System tenants: common (shared), infra (underlay overlay-1), mgmt (management); plus user tenants.</li>
<li>Relations are objects too (fvRsBd, fvRsPathAtt).</li>
<li>GUI, REST API (/api/node/mo, /api/node/class), moquery and automation tools all edit the same objects.</li>
</ul></div>
`,hi:`
<p>Ek postal address ke baare mein socho: desh, rajya, shehar, gali, ghar number. Left se right padho to yeh ek hi ghar tak narrow ho jaata hai, aur do gharon ka poora address same nahi hota. ACI har configuration aur state ko ek tree mein store karta hai, aur tree ki har cheez ka aisa hi address hota hai. Jab aap yeh addresses padhna seekh jaate ho, to GUI, REST API aur CLI sab ek hi cheez lagte hain jo alag windows se dikh rahi hai.</p>

<h3>Management Information Tree (MIT)</h3>
<p>ACI mein sab kuch ek <b>managed object (MO)</b> hai: tenant, VRF, EPG, static port binding, fault, learned endpoint, switch. Saare MOs ek hierarchical database mein latakte hain jise <b>Management Information Tree (MIT)</b> kehte hain, jo APIC cluster par store hota hai. Har MO ke paas hota hai:</p>
<ul>
<li>ek <b>class</b>: uska type, jaise <code>fvTenant</code>, <code>fvAEPg</code> ya <code>faultInst</code>;</li>
<li>ek <b>relative name (RN)</b>: parent ke andar uska naam, jaise <code>tn-NK-PROD</code> ya <code>epg-WEB</code>;</li>
<li>ek <b>distinguished name (DN)</b>: saare ancestors ke RNs slashes se jude hue, poore fabric mein unique, jaise <code>uni/tn-NK-PROD/ap-ECOM/epg-WEB</code>;</li>
<li><b>properties</b> (attributes), jaise <code>pcTag</code>, <code>descr</code>, <code>prefGrMemb</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Management Information Tree ka hissa">
<rect x="270" y="8" width="100" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="28" text-anchor="middle" class="svg-ink" font-size="13">topRoot</text>
<rect x="110" y="62" width="120" height="30" rx="6" fill="#ddd6fe"/><text x="170" y="82" text-anchor="middle" class="svg-ink" font-size="13">uni (policy)</text>
<rect x="410" y="62" width="150" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="82" text-anchor="middle" class="svg-ink" font-size="13">topology (runtime)</text>
<line x1="300" y1="38" x2="190" y2="62" stroke="#64748b" stroke-width="2"/><line x1="340" y1="38" x2="470" y2="62" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="118" width="120" height="30" rx="6" fill="#fde68a"/><text x="80" y="138" text-anchor="middle" class="svg-ink" font-size="13">tn-NK-PROD</text>
<rect x="160" y="118" width="120" height="30" rx="6" fill="#fed7aa"/><text x="220" y="138" text-anchor="middle" class="svg-ink" font-size="13">infra (access)</text>
<line x1="150" y1="92" x2="90" y2="118" stroke="#64748b" stroke-width="2"/><line x1="190" y1="92" x2="215" y2="118" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="118" width="110" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="138" text-anchor="middle" class="svg-ink" font-size="13">pod-1</text>
<line x1="485" y1="92" x2="485" y2="118" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="172" width="110" height="30" rx="6" fill="#bbf7d0"/><text x="485" y="192" text-anchor="middle" class="svg-ink" font-size="13">node-101</text>
<line x1="485" y1="148" x2="485" y2="172" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="172" width="80" height="30" rx="6" fill="#bae6fd"/><text x="50" y="192" text-anchor="middle" class="svg-ink" font-size="12">ctx-PROD</text>
<rect x="100" y="172" width="90" height="30" rx="6" fill="#bae6fd"/><text x="145" y="192" text-anchor="middle" class="svg-ink" font-size="12">BD-WEB-BD</text>
<rect x="200" y="172" width="80" height="30" rx="6" fill="#bae6fd"/><text x="240" y="192" text-anchor="middle" class="svg-ink" font-size="12">ap-ECOM</text>
<line x1="60" y1="148" x2="50" y2="172" stroke="#64748b" stroke-width="2"/><line x1="80" y1="148" x2="145" y2="172" stroke="#64748b" stroke-width="2"/><line x1="100" y1="148" x2="235" y2="172" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="222" width="80" height="30" rx="6" fill="#bae6fd"/><text x="240" y="242" text-anchor="middle" class="svg-ink" font-size="12">epg-WEB</text>
<line x1="240" y1="202" x2="240" y2="222" stroke="#64748b" stroke-width="2"/>
<text x="300" y="242" class="svg-accent" font-size="12">DN = uni/tn-NK-PROD/ap-ECOM/epg-WEB</text>
</svg><p class="cap">Jo policy aap configure karte ho woh uni ke neeche rehti hai; chalte fabric ki state topology ke neeche.</p></div>

<h3>Class names jo aapko milenge</h3>
<p>Class name ek <b>package</b> prefix plus naam hota hai. <code>fv</code> (fabric virtualization) tenant objects rakhta hai, <code>vz</code> contracts, <code>infra</code> access policies, <code>l3ext</code> L3Outs, <code>fabric</code> nodes, <code>fault</code> faults. Objects ke beech relations bhi khud objects hain jinki class <code>Rs</code> ("relation source") se shuru hoti hai, jaise <code>fvRsBd</code> (EPG se bridge domain) aur <code>fvRsPathAtt</code> (EPG static port).</p>
<table class="cmp"><tr><th>GUI naam</th><th>Class</th><th>RN prefix</th></tr>
<tr><td>Tenant</td><td>fvTenant</td><td>tn-</td></tr>
<tr><td>VRF</td><td>fvCtx</td><td>ctx-</td></tr>
<tr><td>Bridge domain / subnet</td><td>fvBD / fvSubnet</td><td>BD- / subnet-[ ]</td></tr>
<tr><td>Application profile / EPG</td><td>fvAp / fvAEPg</td><td>ap- / epg-</td></tr>
<tr><td>Contract / filter</td><td>vzBrCP / vzFilter</td><td>brc- / flt-</td></tr>
<tr><td>Learned endpoint</td><td>fvCEp</td><td>cep-</td></tr>
<tr><td>Switch node</td><td>fabricNode</td><td>node-</td></tr>
</table>

<h3>Tenants: policy tree ka top</h3>
<p><b>Tenant</b> policy ka container hai jiske apne administrators hote hain: ek customer, business unit ya environment. <b>uni</b> (policy universe) ke neeche teen system tenants aur kitne bhi user tenants hote hain:</p>
<ul>
<li><b>common</b>: saare tenants ke shared objects (jaise shared VRF, <i>default</i> filter ya shared L3Out). Jab tenant kisi object ko naam se reference karta hai aur woh locally nahi hai, to ACI common mein dhoondta hai.</li>
<li><b>infra</b>: fabric underlay; iska VRF <b>overlay-1</b> switches ke beech IS-IS, COOP aur MP-BGP le jaata hai.</li>
<li><b>mgmt</b>: nodes ka in-band aur out-of-band management.</li>
<li><b>User tenants</b>: aapke, jaise labs mein NK-PROD.</li>
</ul>
<p>Access policies (VLAN pools, domains, AAEPs) kisi tenant mein nahi hoti; woh <code>uni/infra</code> ke neeche rehti hain aur fabric administrator ki hoti hain. Role-based access control (security domains plus tenant-admin aur fabric-admin jaise roles) decide karta hai ki tree ka kaunsa hissa kaun badal sakta hai.</p>

<h3>Ek tree, teen windows: GUI, REST API aur CLI</h3>
<p>GUI REST API ka ek client hai. Jab aap Submit click karte ho, browser ek REST call bhejta hai jo MOs banata ya modify karta hai. Ise aap <b>API Inspector</b> (GUI user menu mein) se dekh sakte ho aur call ko script mein copy kar sakte ho. REST API predictable paths use karta hai:</p>
<pre class="code"><span class="c">! ek object aur uske neeche ka sab padho</span>
GET  /api/node/mo/uni/tn-NK-PROD.json?query-target=subtree
<span class="c">! fabric mein ek class ke saare objects padho</span>
GET  /api/node/class/fvAEPg.json
<span class="c">! create ya modify: parent DN par payload post karo</span>
POST /api/node/mo/uni.json
{"fvTenant":{"attributes":{"name":"NK-PROD","descr":"Production e-commerce"}}}</pre>
<p>APIC CLI par <code>moquery</code> same objects class ya DN se padhta hai, aur Ansible, Terraform aur Python SDKs sab same MOs likhte hain. APIC ek NX-OS style configuration mode bhi deta hai, jo phir se bas MOs banata hai. Switch CLI alag hai: woh sirf dikhata hai ki us ek switch par policy kaise render hui.</p>
<pre class="out">APIC1# moquery -c fvAEPg
Total Objects shown: 2

# fv.AEPg
name         : WEB
<span class="hl">dn           : uni/tn-NK-PROD/ap-ECOM/epg-WEB</span>
pcTag        : 32770
prefGrMemb   : exclude
fvRsBd.tnFvBDName: WEB-BD

# fv.AEPg
name         : APP
dn           : uni/tn-NK-PROD/ap-ECOM/epg-APP
pcTag        : 32771
prefGrMemb   : exclude
fvRsBd.tnFvBDName: APP-BD</pre>

<div class="eg"><p><b>Worked example: static port DN padhna.</b> <code>uni/tn-NK-PROD/ap-ECOM/epg-WEB/rspathAtt-[topology/pod-1/paths-101/pathep-[eth1/1]]</code> aise padho: tenant NK-PROD, application profile ECOM, EPG WEB mein path "pod 1, node 101, port eth1/1" ke liye ek relation (<code>fvRsPathAtt</code>) hai. Square brackets wala hissa khud ek DN hai, topology tree ke ek object ka. vPC ke liye path hota <code>protpaths-101-102/pathep-[NK-VPC-PG]</code>.</p></div>

<div class="warn"><p><b>Common galti.</b> Object ko "rename" karne ke liye delete karke dobara banana. Zyada tar object names RN ka hissa hote hain, isliye badle nahi ja sakte; naya naam matlab naya object naye DN ke saath. Jo bhi purane naam ko point karta tha (relations) woh tab tak toot jaata hai jab tak aap use update na karo. Banane se pehle names plan karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teen system tenants aur unke roles jaano: common = shared objects, infra = fabric underlay (overlay-1), mgmt = node management. Yeh bhi jaano ki GUI, REST API aur CLI sab same MIT par kaam karte hain; koi alag "CLI config" nahi hai jo GUI se disagree kare.</p></div>

<div class="scn"><h4>Lunch se pehle chaalis EPGs</h4><p>Ek telecom team ko migration weekend ke liye 40 naye EPGs chahiye the, har ek vPC par static port ke saath. GUI mein click karte hue ek din lagta aur typos ka khatra hota. Engineer ne API Inspector khol kar GUI mein ek EPG banaya, GUI ne <code>/api/node/mo/uni.json</code> par jo JSON payload post kiya use copy kiya, EPG name aur VLAN ko ek chhoti Python script mein variables banaya, aur baaki 39 post kar diye. Change window se pehle usne <code>moquery -c fvRsPathAtt</code> chala kar confirm kiya ki saari 40 bindings sahi encapsulation ke saath maujood hain.</p><p><b>Seekh:</b> kyunki sab kuch MO hai, jo click kar sakte ho woh automate kar sakte ho, aur jo automate karte ho use same object names se verify kar sakte ho.</p></div>

<div class="iv"><p class="q">"ACI mein DN kya hai, aur GUI, API aur CLI aapas mein kaise related hain?"</p><p>Strong answer: har configuration aur state item Management Information Tree mein ek managed object hai; uska distinguished name root se relative names ka path hai, jaise uni/tn-X/ap-Y/epg-Z, jo fabric mein unique hai. GUI ek REST client hai, API Inspector uske calls dikhata hai, aur moquery, Ansible ya Terraform same objects padhte aur likhte hain, isliye saare interfaces equivalent hain. Bonus: class naming (fvAEPg, vzBrCP) aur relation objects (fvRsBd, fvRsPathAtt) ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har item MIT mein ek managed object hai, jiski class, RN aur unique DN hai.</li>
<li>Policy uni ke neeche rehti hai; runtime state (nodes, learned endpoints) topology ke neeche.</li>
<li>System tenants: common (shared), infra (underlay overlay-1), mgmt (management); plus user tenants.</li>
<li>Relations bhi objects hain (fvRsBd, fvRsPathAtt).</li>
<li>GUI, REST API (/api/node/mo, /api/node/class), moquery aur automation tools sab same objects edit karte hain.</li>
</ul></div>
`}};export{e as default};