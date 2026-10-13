var e={id:`overview`,h:{en:`Templates: one pattern, many device configs`,hi:`Templates: ek pattern, kai device configs`},body:{en:`
<p><b>What you will learn in this module.</b> You will write a single text pattern, called a <b>template</b>, and let Ansible fill in the blanks for every router and switch. You will learn the template language (Jinja2), loops, conditions and filters, how to render the files, how to push them with <code>cisco.ios.ios_config</code>, how to preview a change with <code>--check --diff</code>, and how to find a device that has drifted from the standard.</p>
<p><b>Prerequisites.</b> You should have run a simple playbook before: an inventory, a playbook, one module, and the idea of a variable. The modules <i>auto-ansible</i>, <i>ans-start</i> and <i>ans-inventory</i> cover that. No Jinja2 or Python knowledge is needed. We explain every line.</p>

<h3>Analogy: the mail-merge letter</h3>
<p>Your bank sends the same letter to a million customers. The text is written once. A mail-merge program puts <i>Dear Atul</i>, <i>Dear Priya</i> and the right account number into the blanks. Nobody retypes the letter. A network team has the same problem: forty branch routers need the same NTP, logging and AAA lines, and each needs its own hostname and loopback address. A template is the letter. The variables are the customer list. Ansible is the mail-merge program.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Template plus variables gives one config per device">
<rect x="20" y="20" width="170" height="60" rx="10" fill="#fde68a"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="14">Template</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">templates/base.j2</text>
<rect x="20" y="95" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="122" text-anchor="middle" class="svg-ink" font-size="14">Variables</text><text x="105" y="141" text-anchor="middle" class="svg-muted" font-size="12">group_vars, host_vars</text>
<rect x="250" y="55" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">Ansible</text><text x="320" y="101" text-anchor="middle" class="svg-muted" font-size="12">template module</text>
<rect x="450" y="20" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="14">pun-core-r1.cfg</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">its own values</text>
<rect x="450" y="95" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="14">blr-edge-r2.cfg</text><text x="535" y="141" text-anchor="middle" class="svg-muted" font-size="12">its own values</text>
<line x1="190" y1="50" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="190" y1="125" x2="250" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="75" x2="450" y2="50" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="450" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One template and the variables of each host produce one config per device.</p></div>

<h3>The project you will use</h3>
<p>All examples run on the lab control node <b>AUTO01</b> (user <code>netadmin</code>), in the folder <code>~/netauto</code>. It manages two routers, <code>pun-core-r1</code> (10.99.0.1) and <code>blr-edge-r2</code> (10.99.0.2). The folder looks like this:</p>
<pre class="out">netadmin@auto01:~/netauto$ ls -R .
.:
ansible.cfg  group_vars  host_vars  inventory.yml  templates

./group_vars:
all.yml

./host_vars:
blr-edge-r2.yml  pun-core-r1.yml

./templates:
base.j2</pre>
<p><code>group_vars/all.yml</code> holds values shared by every device (domain name, NTP, syslog). Each file in <code>host_vars/</code> holds the values of one device (its hostname and loopback address). <code>templates/base.j2</code> is the pattern. The <code>.j2</code> ending only tells humans "this is a Jinja2 file".</p>

<h3>Your first template</h3>
<pre class="code"><span class="c"># templates/base.j2</span>
hostname {{ hostname }}
ip domain name {{ domain_name }}
{% for server in ntp_servers %}
ntp server {{ server }}
{% endfor %}
logging host {{ syslog_host }}
!
interface Loopback0
 description Router-ID of {{ inventory_hostname }}
 ip address {{ loopback_ip }} 255.255.255.255</pre>
<p>Three kinds of marker appear. <code>{{ name }}</code> prints a value. <code>{% ... %}</code> is a statement, here a loop. Everything else is plain text copied as it is. We study each kind in the next chapters. For now just see the result. The playbook <code>render.yml</code> (chapter 3 explains it) writes one file per router into a folder <code>configs</code>:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook render.yml

PLAY [Render and push the base config] ****************************************

TASK [Folder for the rendered configs] ****************************************
changed: [pun-core-r1 -&gt; localhost]

TASK [Render the config] ******************************************************
changed: [pun-core-r1 -&gt; localhost]
changed: [blr-edge-r2 -&gt; localhost]

netadmin@auto01:~/netauto$ cat configs/blr-edge-r2.cfg
hostname <span class="hl">BLR-EDGE-R2</span>
ip domain name nk.lab
ntp server 10.99.0.60
logging host 10.99.0.60
!
interface Loopback0
 description Router-ID of blr-edge-r2
 ip address <span class="hl">10.255.255.2</span> 255.255.255.255</pre>
<p>The highlighted values came from <code>host_vars/blr-edge-r2.yml</code>. The loop produced one <code>ntp server</code> line because the list had one entry. Add a second server to the list and a second line appears on every router, with no template edit.</p>

<div class="eg"><p><b>Worked example.</b> A company opens branch number 41. Without a template an engineer copies an old config, edits hostname, loopback, interface addresses, and hopes nothing was missed. With a template you add a file <code>host_vars/ccu-edge-r41.yml</code> with six lines of data, run one command, and read the generated config before anything touches a router.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the template as a script. A template has no knowledge of the device. It only turns text and variables into text. Sending that text to the router is a separate step, and a separate module.</p></div>
<div class="exam"><p><b>Exam trap.</b> Templates are rendered on the <b>control node</b>, not on the router. The router receives only the final text.</p></div>

<div class="scn"><h4>Forty routers, one wrong NTP address</h4><p>A team kept forty hand-edited config files. A new NTP server was announced and an engineer updated thirty-eight files. Two routers kept the old address and drifted for months. After moving the shared values into <code>group_vars/all.yml</code> and the pattern into one template, the NTP change became a one-line edit and a re-render. The two forgotten routers could no longer be forgotten.</p><p><b>Lesson:</b> shared values live in one place; per-device values live in small host files.</p></div>

<div class="iv"><p class="q">"Why use templates instead of copying config files?"</p><p>One pattern plus data removes copy-paste errors. Every device is built the same way, the diff of a change is one line in one place, and the generated files can be reviewed before use. Mention Jinja2, group_vars/host_vars and that rendering happens on the controller.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template is text with blanks; variables fill the blanks per device.</li>
<li>Jinja2 is the template language Ansible uses.</li>
<li>Shared values go in group_vars; device values go in host_vars.</li>
<li>Templates are rendered on the control node, then pushed as a separate step.</li>
<li>Review the rendered file before a router ever sees it.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap ek hi text pattern likhoge, jise <b>template</b> kehte hain, aur Ansible har router aur switch ke liye khaali jagah bhar dega. Aap template language (Jinja2), loops, conditions aur filters seekhoge, files render karna, unhe <code>cisco.ios.ios_config</code> se push karna, <code>--check --diff</code> se change pehle dekhna, aur woh device dhoondhna jo standard se bhatak gaya hai.</p>
<p><b>Prerequisites.</b> Aapne pehle koi simple playbook chalaya ho: inventory, playbook, ek module aur variable ka idea. <i>auto-ansible</i>, <i>ans-start</i> aur <i>ans-inventory</i> modules yeh cover karte hain. Jinja2 ya Python aana zaroori nahi. Hum har line samjhayenge.</p>

<h3>Analogy: mail-merge wala letter</h3>
<p>Bank ek hi letter dus lakh customers ko bhejta hai. Text ek baar likha jaata hai. Mail-merge program khaali jagah mein <i>Dear Atul</i>, <i>Dear Priya</i> aur sahi account number daal deta hai. Koi letter dobara type nahi karta. Network team ki yahi problem hai: chalis branch routers ko wahi NTP, logging aur AAA lines chahiye, aur har ek ko apna hostname aur loopback address. Template letter hai. Variables customer list hain. Ansible mail-merge program hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Template aur variables se har device ka config">
<rect x="20" y="20" width="170" height="60" rx="10" fill="#fde68a"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="14">Template</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">templates/base.j2</text>
<rect x="20" y="95" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="122" text-anchor="middle" class="svg-ink" font-size="14">Variables</text><text x="105" y="141" text-anchor="middle" class="svg-muted" font-size="12">group_vars, host_vars</text>
<rect x="250" y="55" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">Ansible</text><text x="320" y="101" text-anchor="middle" class="svg-muted" font-size="12">template module</text>
<rect x="450" y="20" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="14">pun-core-r1.cfg</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">apni values</text>
<rect x="450" y="95" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="14">blr-edge-r2.cfg</text><text x="535" y="141" text-anchor="middle" class="svg-muted" font-size="12">apni values</text>
<line x1="190" y1="50" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="190" y1="125" x2="250" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="75" x2="450" y2="50" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="450" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek template aur har host ke variables se har device ka ek config banta hai.</p></div>

<h3>Jo project aap use karoge</h3>
<p>Saare examples lab control node <b>AUTO01</b> (user <code>netadmin</code>) par, folder <code>~/netauto</code> mein chalte hain. Yeh do routers manage karta hai: <code>pun-core-r1</code> (10.99.0.1) aur <code>blr-edge-r2</code> (10.99.0.2). Folder aisa dikhta hai:</p>
<pre class="out">netadmin@auto01:~/netauto$ ls -R .
.:
ansible.cfg  group_vars  host_vars  inventory.yml  templates

./group_vars:
all.yml

./host_vars:
blr-edge-r2.yml  pun-core-r1.yml

./templates:
base.j2</pre>
<p><code>group_vars/all.yml</code> mein woh values hain jo har device ke liye same hain (domain name, NTP, syslog). <code>host_vars/</code> ki har file ek device ki values rakhti hai (uska hostname aur loopback address). <code>templates/base.j2</code> pattern hai. <code>.j2</code> ending sirf insaanon ko batati hai ki "yeh Jinja2 file hai".</p>

<h3>Aapka pehla template</h3>
<pre class="code"><span class="c"># templates/base.j2</span>
hostname {{ hostname }}
ip domain name {{ domain_name }}
{% for server in ntp_servers %}
ntp server {{ server }}
{% endfor %}
logging host {{ syslog_host }}
!
interface Loopback0
 description Router-ID of {{ inventory_hostname }}
 ip address {{ loopback_ip }} 255.255.255.255</pre>
<p>Teen tarah ke markers dikhte hain. <code>{{ name }}</code> ek value print karta hai. <code>{% ... %}</code> ek statement hai, yahan loop. Baaki sab plain text hai jo jaisa hai waisa copy hota hai. Har tarah ko agle chapters mein padhenge. Abhi bas nateeja dekho. Playbook <code>render.yml</code> (chapter 3 samjhata hai) har router ki ek file folder <code>configs</code> mein likhta hai:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook render.yml

PLAY [Render and push the base config] ****************************************

TASK [Folder for the rendered configs] ****************************************
changed: [pun-core-r1 -&gt; localhost]

TASK [Render the config] ******************************************************
changed: [pun-core-r1 -&gt; localhost]
changed: [blr-edge-r2 -&gt; localhost]

netadmin@auto01:~/netauto$ cat configs/blr-edge-r2.cfg
hostname <span class="hl">BLR-EDGE-R2</span>
ip domain name nk.lab
ntp server 10.99.0.60
logging host 10.99.0.60
!
interface Loopback0
 description Router-ID of blr-edge-r2
 ip address <span class="hl">10.255.255.2</span> 255.255.255.255</pre>
<p>Highlight ki hui values <code>host_vars/blr-edge-r2.yml</code> se aayi. List mein ek entry thi, isliye loop ne ek <code>ntp server</code> line banayi. List mein doosra server jodo to har router par doosri line aa jaati hai, template badle bina.</p>

<div class="eg"><p><b>Worked example.</b> Company ki branch number 41 khulti hai. Template ke bina engineer purana config copy karta hai, hostname, loopback, interface addresses badalta hai, aur umeed karta hai kuch chhoota nahi. Template ke saath aap <code>host_vars/ccu-edge-r41.yml</code> file mein chhah line ka data likhte ho, ek command chalate ho, aur router ko chhune se pehle generated config padh lete ho.</p></div>

<div class="warn"><p><b>Common mistake.</b> Template ko script samajhna. Template ko device ke baare mein kuch nahi pata. Woh sirf text aur variables ko text mein badalta hai. Us text ko router par bhejna alag step hai, aur alag module.</p></div>
<div class="exam"><p><b>Exam trap.</b> Templates <b>control node</b> par render hote hain, router par nahi. Router ko sirf final text milta hai.</p></div>

<div class="scn"><h4>Chalis routers, ek galat NTP address</h4><p>Ek team ke paas chalis hand-edited config files thi. Naya NTP server announce hua aur engineer ne adtees files update ki. Do routers purana address rakhe rahe aur mahino tak bhatke rahe. Shared values ko <code>group_vars/all.yml</code> mein aur pattern ko ek template mein daalne ke baad NTP change ek line ka edit aur re-render ban gaya. Do bhule hue routers ab bhoole nahi ja sakte.</p><p><b>Lesson:</b> shared values ek jagah rehti hain; per-device values chhoti host files mein.</p></div>

<div class="iv"><p class="q">"Config files copy karne ki jagah templates kyun use karte hain?"</p><p>Ek pattern aur data se copy-paste ki galtiyan hat jaati hain. Har device ek jaise banta hai, change ka diff ek jagah ki ek line hota hai, aur generated files use hone se pehle review ho sakti hain. Jinja2, group_vars/host_vars aur yeh ki rendering controller par hoti hai, zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template khaali jagah wala text hai; variables har device ke liye jagah bharte hain.</li>
<li>Jinja2 woh template language hai jo Ansible use karta hai.</li>
<li>Shared values group_vars mein; device values host_vars mein.</li>
<li>Templates control node par render hote hain, phir alag step mein push hote hain.</li>
<li>Router ko dikhane se pehle rendered file review karo.</li>
</ul></div>
`}};export{e as default};