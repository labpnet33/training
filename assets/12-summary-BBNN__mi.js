var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long trip a pilot walks around the aircraft with a checklist, even after thousands of flights. Not because he forgot how to fly, but because a checklist catches the one small thing that memory skips. Use this chapter the same way before your exam and before your first automation change at work.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="10" y="15" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">Planes</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">management, control, data</text>
<rect x="220" y="15" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Controllers and SDN</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">NBI, SBI, fabric</text>
<rect x="430" y="15" width="200" height="60" rx="8" fill="#fde68a"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">Cisco examples</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">Catalyst Center, SDA, SD-WAN</text>
<rect x="10" y="95" width="200" height="60" rx="8" fill="#bae6fd"/><text x="110" y="120" text-anchor="middle" class="svg-ink" font-size="13">REST</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">CRUD, verbs, codes, auth</text>
<rect x="220" y="95" width="200" height="60" rx="8" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Data formats</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">JSON, XML, YAML</text>
<rect x="430" y="95" width="200" height="60" rx="8" fill="#fed7aa"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="13">Config management</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">Ansible, Terraform, Puppet, Chef</text>
<rect x="120" y="175" width="400" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="13">Labs: RESTCONF on R1, Fix the playbook on SW1/SW2</text>
</svg><p class="cap">Everything in this module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can list at least five ways automation changes network management, and one risk.</li>
<li>I can place any protocol or function in the data, control or management plane.</li>
<li>I can compare traditional and controller-based networking and name the three SDN layers.</li>
<li>I can explain northbound versus southbound APIs and give examples of each.</li>
<li>I can define underlay, overlay and fabric, and describe Catalyst Center, SD-Access and SD-WAN at concept level.</li>
<li>I can describe REST (client-server, stateless, cacheable, URIs), map CRUD to HTTP verbs and read status codes.</li>
<li>I can enable RESTCONF on IOS XE, GET interface data and PATCH one leaf.</li>
<li>I can read, write and fix JSON, and name the type of every value.</li>
<li>I can recognise JSON, XML and YAML, and follow the basic YAML rules.</li>
<li>I can compare Ansible, Puppet, Chef and Terraform, and run, troubleshoot and verify an Ansible playbook.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>API</dt><dd>A defined way for programs to exchange data and requests.</dd>
<dt>Northbound / southbound API</dt><dd>Controller to applications above / controller to devices below.</dd>
<dt>REST</dt><dd>Stateless, client-server API style over HTTP using URIs and verbs.</dd>
<dt>RESTCONF / NETCONF</dt><dd>Device APIs using YANG models; HTTPS with JSON or XML / SSH port 830 with XML.</dd>
<dt>YANG</dt><dd>Data modelling language that defines names and types of configuration and state data.</dd>
<dt>Underlay / overlay / fabric</dt><dd>Physical routed network / tunnels on top / both managed as one.</dd>
<dt>Idempotency</dt><dd>Repeating an operation gives the same result; a second run changes nothing.</dd>
<dt>IaC</dt><dd>Infrastructure as Code: configuration kept as reviewed code in version control.</dd>
<dt>Inventory / playbook / module</dt><dd>Ansible's host list / YAML list of plays and tasks / code a task runs.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Planes</td><td>OSPF, STP, ARP = control; FIB forwarding, ACL = data; SSH, SNMP, syslog = management</td></tr>
<tr><td>SDN layers</td><td>Application, control, infrastructure</td></tr>
<tr><td>APIs</td><td>NBI = REST + JSON; SBI = NETCONF, RESTCONF, OpenFlow, OpFlex</td></tr>
<tr><td>CRUD</td><td>POST create, GET read, PUT replace / PATCH modify, DELETE delete</td></tr>
<tr><td>Codes</td><td>200 OK, 201 Created, 204 No Content, 400, 401 authn, 403 authz, 404, 500</td></tr>
<tr><td>Auth</td><td>Basic (base64, needs HTTPS), token, API key, OAuth</td></tr>
<tr><td>JSON</td><td>Objects <code>{ }</code>, arrays <code>[ ]</code>, double quotes, lowercase true/false, no trailing comma</td></tr>
<tr><td>Tools</td><td>Ansible agentless push YAML SSH; Puppet agent pull TCP 8140; Chef agent pull Ruby; Terraform HCL state file</td></tr>
<tr><td>SD-Access</td><td>IS-IS underlay, VXLAN data, LISP control, SGT policy</td></tr>
<tr><td>SD-WAN</td><td>Manager, Controller (OMP), Validator, WAN Edge</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! IOS XE: enable RESTCONF</span>
username netadmin privilege 15 secret Rest@123
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf

<span class="c">! NMS (type the HTTPS scheme before the address in the lab)</span>
rest GET   10.20.0.1/restconf/data/ietf-interfaces:interfaces -u netadmin:Rest@123
rest PATCH 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description -u netadmin:Rest@123 -d @desc.json
json validate FILE   |   json types FILE   |   json get FILE '.path[0].key'

<span class="c">! Ansible controller</span>
ansible-playbook -i hosts site.yml --syntax-check
ansible-inventory -i hosts --host SW1
ansible access -i hosts -m ping
ansible-doc ios_config
ansible-playbook -i hosts site.yml --check
ansible-playbook -i hosts site.yml</pre>

<div class="eg"><p><b>Worked example: a mixed exam item.</b> "A script sends PATCH with <code>{"enabled": "false"}</code> to a device API and receives 400." Walk it: PATCH = partial update (U in CRUD); 400 = the client sent something wrong; the JSON is valid, but <code>"false"</code> is a string and the model expects a boolean. Correct body: <code>{"enabled": false}</code>. One sentence touches REST, status codes, JSON types and data models.</p></div>

<div class="warn"><p><b>Last-minute mistakes.</b> Swapping 401 and 403; calling RESTCONF northbound; forgetting that JSON array indexes start at 0; thinking Ansible needs an agent; saying the overlay works without the underlay.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read every word: "creates" (POST) versus "replaces" (PUT) versus "modifies part of" (PATCH); "pull" (Puppet, Chef) versus "push" (Ansible); "agentless" (Ansible, Terraform). In JSON questions, count brackets carefully and remember quotes decide the type.</p></div>

<div class="scn"><h4>The first automation change at a new job</h4><p>A fresher who had done these two labs joined a NOC. Her first task was to add an NTP server to 40 switches. She checked the inventory with <code>ansible-inventory --graph</code>, ran <code>--syntax-check</code>, a <code>-m ping</code>, a <code>--check</code> dry run on two switches with <code>--limit</code>, then the full run, and finally a second run showing <code>changed=0</code> on all 40. Her lead approved every future change she proposed without re-checking, because her evidence was complete.</p><p><b>Lesson:</b> the workflow you practised in the labs is exactly the workflow teams trust in production.</p></div>

<div class="iv"><p class="q">"In two minutes, tell me what network automation and programmability mean for a network engineer."</p><p>Strong answer: networks are moving from box-by-box CLI to controllers and APIs. Devices have management, control and data planes; controllers centralise control and management and expose northbound REST APIs, while talking southbound with NETCONF, RESTCONF or OpenFlow. REST uses HTTP verbs for CRUD and status codes for results, carrying JSON. Tools like Ansible (agentless, push, YAML) and Terraform (declarative, state file) keep configuration as code, idempotent and verifiable. Close with how you verify: status codes, PLAY RECAP, and a second run with no changes. The next module adds AI assistants to this toolbox.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation brings speed, consistency and data, and needs verification habits to stay safe.</li>
<li>Planes, SDN layers and API directions are the vocabulary of every controller question.</li>
<li>REST = verbs + URIs + status codes + JSON; RESTCONF brings it to the device.</li>
<li>JSON rules are strict; YAML is indentation; XML is tags.</li>
<li>Ansible, Terraform, Puppet and Chef differ by agent, push/pull and language; idempotency is the shared goal.</li>
</ul></div>
`,hi:`
<p>Lambe safar se pehle pilot checklist ke saath aircraft ke chaaron taraf ghoomta hai, hazaaron flights ke baad bhi. Isliye nahi ki woh udaana bhool gaya, balki isliye ki checklist woh ek chhoti cheez pakad leti hai jo memory chhod deti hai. Is chapter ko exam se pehle aur kaam par apne pehle automation change se pehle isi tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module map">
<rect x="10" y="15" width="200" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="13">Planes</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">management, control, data</text>
<rect x="220" y="15" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Controllers aur SDN</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">NBI, SBI, fabric</text>
<rect x="430" y="15" width="200" height="60" rx="8" fill="#fde68a"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="13">Cisco examples</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">Catalyst Center, SDA, SD-WAN</text>
<rect x="10" y="95" width="200" height="60" rx="8" fill="#bae6fd"/><text x="110" y="120" text-anchor="middle" class="svg-ink" font-size="13">REST</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">CRUD, verbs, codes, auth</text>
<rect x="220" y="95" width="200" height="60" rx="8" fill="#bae6fd"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Data formats</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">JSON, XML, YAML</text>
<rect x="430" y="95" width="200" height="60" rx="8" fill="#fed7aa"/><text x="530" y="120" text-anchor="middle" class="svg-ink" font-size="13">Config management</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">Ansible, Terraform, Puppet, Chef</text>
<rect x="120" y="175" width="400" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="13">Labs: R1 par RESTCONF, SW1/SW2 par Fix the playbook</text>
</svg><p class="cap">Is module ki har cheez ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main automation network management ko kaise badalta hai iske kam se kam paanch tareeke aur ek risk bata sakta hoon.</li>
<li>Main kisi bhi protocol ya function ko data, control ya management plane mein rakh sakta hoon.</li>
<li>Main traditional aur controller-based networking compare kar sakta hoon aur teen SDN layers ke naam le sakta hoon.</li>
<li>Main northbound vs southbound APIs samjha sakta hoon aur dono ke examples de sakta hoon.</li>
<li>Main underlay, overlay aur fabric define kar sakta hoon, aur Catalyst Center, SD-Access aur SD-WAN ko concept level par describe kar sakta hoon.</li>
<li>Main REST (client-server, stateless, cacheable, URIs) describe kar sakta hoon, CRUD ko HTTP verbs se map kar sakta hoon aur status codes padh sakta hoon.</li>
<li>Main IOS XE par RESTCONF enable kar sakta hoon, interface data GET kar sakta hoon aur ek leaf PATCH kar sakta hoon.</li>
<li>Main JSON padh, likh aur theek kar sakta hoon, aur har value ka type bata sakta hoon.</li>
<li>Main JSON, XML aur YAML pehchaan sakta hoon, aur YAML ke basic rules follow kar sakta hoon.</li>
<li>Main Ansible, Puppet, Chef aur Terraform compare kar sakta hoon, aur ek Ansible playbook chala, troubleshoot aur verify kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>API</dt><dd>Programs ke beech data aur requests exchange karne ka ek defined tareeka.</dd>
<dt>Northbound / southbound API</dt><dd>Controller se upar ke applications / controller se neeche ke devices.</dd>
<dt>REST</dt><dd>HTTP par stateless, client-server API style jo URIs aur verbs use karta hai.</dd>
<dt>RESTCONF / NETCONF</dt><dd>YANG models use karne wali device APIs; JSON ya XML ke saath HTTPS / XML ke saath SSH port 830.</dd>
<dt>YANG</dt><dd>Data modelling language jo configuration aur state data ke naam aur types define karti hai.</dd>
<dt>Underlay / overlay / fabric</dt><dd>Physical routed network / upar ke tunnels / dono ek saath managed.</dd>
<dt>Idempotency</dt><dd>Operation dohrao to result same; doosra run kuch nahi badalta.</dd>
<dt>IaC</dt><dd>Infrastructure as Code: configuration version control mein reviewed code ki tarah rakhna.</dd>
<dt>Inventory / playbook / module</dt><dd>Ansible ki host list / plays aur tasks ki YAML list / woh code jo task chalata hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Planes</td><td>OSPF, STP, ARP = control; FIB forwarding, ACL = data; SSH, SNMP, syslog = management</td></tr>
<tr><td>SDN layers</td><td>Application, control, infrastructure</td></tr>
<tr><td>APIs</td><td>NBI = REST + JSON; SBI = NETCONF, RESTCONF, OpenFlow, OpFlex</td></tr>
<tr><td>CRUD</td><td>POST create, GET read, PUT replace / PATCH modify, DELETE delete</td></tr>
<tr><td>Codes</td><td>200 OK, 201 Created, 204 No Content, 400, 401 authn, 403 authz, 404, 500</td></tr>
<tr><td>Auth</td><td>Basic (base64, HTTPS chahiye), token, API key, OAuth</td></tr>
<tr><td>JSON</td><td>Objects <code>{ }</code>, arrays <code>[ ]</code>, double quotes, lowercase true/false, trailing comma nahi</td></tr>
<tr><td>Tools</td><td>Ansible agentless push YAML SSH; Puppet agent pull TCP 8140; Chef agent pull Ruby; Terraform HCL state file</td></tr>
<tr><td>SD-Access</td><td>IS-IS underlay, VXLAN data, LISP control, SGT policy</td></tr>
<tr><td>SD-WAN</td><td>Manager, Controller (OMP), Validator, WAN Edge</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! IOS XE: RESTCONF enable karo</span>
username netadmin privilege 15 secret Rest@123
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf

<span class="c">! NMS (lab mein address se pehle HTTPS scheme type karo)</span>
rest GET   10.20.0.1/restconf/data/ietf-interfaces:interfaces -u netadmin:Rest@123
rest PATCH 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description -u netadmin:Rest@123 -d @desc.json
json validate FILE   |   json types FILE   |   json get FILE '.path[0].key'

<span class="c">! Ansible controller</span>
ansible-playbook -i hosts site.yml --syntax-check
ansible-inventory -i hosts --host SW1
ansible access -i hosts -m ping
ansible-doc ios_config
ansible-playbook -i hosts site.yml --check
ansible-playbook -i hosts site.yml</pre>

<div class="eg"><p><b>Worked example: ek mixed exam item.</b> "Ek script device API ko <code>{"enabled": "false"}</code> ke saath PATCH bhejti hai aur 400 milta hai." Ise chalo: PATCH = partial update (CRUD ka U); 400 = client ne kuch galat bheja; JSON valid hai, par <code>"false"</code> string hai aur model boolean expect karta hai. Sahi body: <code>{"enabled": false}</code>. Ek sentence REST, status codes, JSON types aur data models sabko chhoota hai.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyaan.</b> 401 aur 403 ko ulat dena; RESTCONF ko northbound kehna; bhool jaana ki JSON array indexes 0 se shuru hote hain; sochna ki Ansible ko agent chahiye; kehna ki overlay underlay ke bina kaam karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Har shabd padho: "creates" (POST) vs "replaces" (PUT) vs "modifies part of" (PATCH); "pull" (Puppet, Chef) vs "push" (Ansible); "agentless" (Ansible, Terraform). JSON questions mein brackets dhyaan se gino aur yaad rakho quotes type decide karte hain.</p></div>

<div class="scn"><h4>Nayi job par pehla automation change</h4><p>Ek fresher jisne yeh dono labs kiye the, ek NOC mein join hui. Uska pehla task 40 switches par ek NTP server jodna tha. Usne <code>ansible-inventory --graph</code> se inventory check ki, <code>--syntax-check</code> chalaya, ek <code>-m ping</code>, <code>--limit</code> ke saath do switches par <code>--check</code> dry run, phir poora run, aur aakhir mein ek doosra run jo saare 40 par <code>changed=0</code> dikhata tha. Uske lead ne uske har aage ke proposed change ko bina dobara check kiye approve kiya, kyunki uska saboot poora tha.</p><p><b>Seekh:</b> jo workflow aapne labs mein practise kiya, wahi workflow teams production mein trust karti hain.</p></div>

<div class="iv"><p class="q">"Do minute mein batao ki network automation aur programmability ka network engineer ke liye kya matlab hai."</p><p>Strong answer: networks box-by-box CLI se controllers aur APIs ki taraf ja rahe hain. Devices ke management, control aur data planes hote hain; controllers control aur management ko centralise karte hain aur northbound REST APIs dete hain, jabki southbound NETCONF, RESTCONF ya OpenFlow se baat karte hain. REST CRUD ke liye HTTP verbs aur results ke liye status codes use karta hai, JSON le jaata hai. Ansible (agentless, push, YAML) aur Terraform (declarative, state file) jaise tools configuration ko code ki tarah, idempotent aur verifiable rakhte hain. End mein batao aap kaise verify karte ho: status codes, PLAY RECAP, aur bina changes wala doosra run. Agla module is toolbox mein AI assistants jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation speed, consistency aur data laata hai, aur safe rehne ke liye verification ki aadatein chahiye.</li>
<li>Planes, SDN layers aur API directions har controller question ki vocabulary hain.</li>
<li>REST = verbs + URIs + status codes + JSON; RESTCONF ise device tak laata hai.</li>
<li>JSON ke rules strict hain; YAML indentation hai; XML tags hai.</li>
<li>Ansible, Terraform, Puppet aur Chef agent, push/pull aur language se alag hain; idempotency sabka common goal hai.</li>
</ul></div>
`}};export{e as default};