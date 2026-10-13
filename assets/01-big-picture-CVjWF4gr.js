var e={id:`big-picture`,h:{en:`One playbook, three vendors: the big picture`,hi:`Ek playbook, teen vendors: big picture`},body:{en:`
<p><b>What you will learn.</b> This module takes the Ansible you already know from IOS and makes it work on three vendors at once. By the end you can build one project that configures <b>IOS XE, Junos and EOS</b>, set <code>ansible_network_os</code> and choose the right <b>connection plugin</b> (<code>network_cli</code>, <code>netconf</code> or <code>httpapi</code>) for each platform, gather facts and run commands with the vendor collections, push a baseline with <code>ios_config</code>, <code>junos_config</code> and <code>eos_config</code>, preview it with <code>--check --diff</code>, prove it is idempotent, use a resource module for VLANs, and work out in minutes why Ansible cannot connect to a device.</p>
<p><b>Prerequisites.</b> The Config track <i>Ansible for Network Engineers</i> (<code>ans-start</code>, <code>ans-inventory</code>, <code>ans-logic</code>, <code>ans-templates</code>, <code>ans-roles</code>) taught inventories, playbooks, group_vars, Jinja2 templates, roles and Ansible Vault on IOS routers, and <code>auto-ansible</code> in the Cisco automation track repeated the ideas. I do not re-teach them; I refer back. You also need the NETCONF basics of <code>adv-netconf</code> (port 830, running and candidate, confirmed commit). The tool-choice table at the end uses <code>adv-nornir</code> and <code>adv-napalm</code>, which come just before this module.</p>

<h3>An analogy: interpreters at a summit</h3>
<p>Picture a summit where one chairperson (your playbook) must give the same instruction to three delegates who speak different languages. The chairperson does not learn three languages. Two things are decided per delegate: which <b>interpreter</b> to use, and which <b>phone line</b> to speak over. In Ansible the interpreter is the <b>module family</b>, chosen by <code>ansible_network_os</code>: <code>cisco.ios.ios</code>, <code>junipernetworks.junos.junos</code> or <code>arista.eos.eos</code>. The phone line is the <b>connection plugin</b>, chosen by <code>ansible_connection</code>: a CLI session over SSH, a NETCONF session on port 830, or an HTTPS call to the device API. The playbook says <i>what</i> you want (an NTP server); the collection knows <i>how</i> to say it in each dialect.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="One control node, three connection plugins, three vendors">
<rect x="8" y="80" width="112" height="70" rx="10" fill="#bae6fd"/><text x="64" y="108" text-anchor="middle" class="svg-ink" font-size="13">AUTO01</text><text x="64" y="127" text-anchor="middle" class="svg-muted" font-size="11">ansible-core</text><text x="64" y="142" text-anchor="middle" class="svg-muted" font-size="11">~/mvauto</text>
<rect x="215" y="14" width="170" height="52" rx="10" fill="#ddd6fe"/><text x="300" y="38" text-anchor="middle" class="svg-ink" font-size="13">network_cli</text><text x="300" y="55" text-anchor="middle" class="svg-muted" font-size="11">SSH, TCP 22, text CLI</text>
<rect x="215" y="89" width="170" height="52" rx="10" fill="#fde68a"/><text x="300" y="113" text-anchor="middle" class="svg-ink" font-size="13">netconf</text><text x="300" y="130" text-anchor="middle" class="svg-muted" font-size="11">SSH subsystem, TCP 830, XML</text>
<rect x="215" y="164" width="170" height="52" rx="10" fill="#bbf7d0"/><text x="300" y="188" text-anchor="middle" class="svg-ink" font-size="13">httpapi</text><text x="300" y="205" text-anchor="middle" class="svg-muted" font-size="11">eAPI, TCP 443, JSON</text>
<rect x="480" y="14" width="152" height="52" rx="10" fill="#fed7aa"/><text x="556" y="38" text-anchor="middle" class="svg-ink" font-size="12">R1 PUN-CORE-R1</text><text x="556" y="55" text-anchor="middle" class="svg-muted" font-size="11">IOS XE</text>
<rect x="480" y="89" width="152" height="52" rx="10" fill="#fed7aa"/><text x="556" y="113" text-anchor="middle" class="svg-ink" font-size="12">J1 BLR-EDGE-J1</text><text x="556" y="130" text-anchor="middle" class="svg-muted" font-size="11">Junos</text>
<rect x="480" y="164" width="152" height="52" rx="10" fill="#fed7aa"/><text x="556" y="188" text-anchor="middle" class="svg-ink" font-size="12">E1 HYD-LEAF-E1</text><text x="556" y="205" text-anchor="middle" class="svg-muted" font-size="11">EOS</text>
<line x1="120" y1="105" x2="215" y2="40" stroke="#64748b" stroke-width="2"/><line x1="120" y1="115" x2="215" y2="115" stroke="#64748b" stroke-width="2"/><line x1="120" y1="125" x2="215" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="385" y1="40" x2="480" y2="40" stroke="#64748b" stroke-width="2"/><line x1="385" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><line x1="385" y1="190" x2="480" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The control node can reach each device over any plugin that device supports. The diagram shows the pairing used first in Lab 1; you will change it later.</p></div>

<h3>What is new compared with the earlier Ansible modules</h3>
<table class="cmp"><tr><th>Earlier (ans-*, auto-ansible)</th><th>This module</th></tr>
<tr><td>One platform: <code>cisco.ios.ios</code></td><td>Three platforms in one inventory, one group per platform</td></tr>
<tr><td>Always <code>network_cli</code> over SSH</td><td>Also <code>netconf</code> (port 830) and <code>httpapi</code> (eAPI)</td></tr>
<tr><td><code>ios_config</code> and <code>ios_command</code></td><td>Plus <code>junos_config</code>, <code>eos_config</code>, <code>*_facts</code>, <code>*_command</code> and resource modules such as <code>eos_vlans</code></td></tr>
<tr><td>Errors about syntax and YAML</td><td>Errors about the <i>connection</i>: network OS, plugin, enable, certificate</td></tr></table>

<h3>The lab and its first look</h3>
<p>Everything runs on AUTO01 (netadmin / Deccan@123), in the folder <code>~/mvauto</code>. The three devices accept <b>netops / NK@2026</b>: R1 is an IOS XE router at 10.99.0.1, J1 a Junos router at 10.99.0.11, E1 an EOS switch at 10.99.0.21. In Lab 1 you write the inventory in a few minutes. This is what Ansible says about it:</p>
<pre class="out">AUTO01$ ansible-inventory --graph
@all:
  |--@network:
  |  |--@ios:
  |  |  |--R1
  |  |--@junos:
  |  |  |--J1
  |  |--@eos:
  |  |  |--E1</pre>
<p>The parent group <code>network</code> holds the three platform groups. A play on <code>network</code> reaches every vendor; a play on <code>junos</code> reaches only Junos. Variables attached to the group decide the language and the phone line.</p>

<div class="eg"><p><b>Worked example: ticket CHG-2058.</b> The NOC wants the same NTP server (192.0.2.123) and syslog host (192.0.2.50) on all edge devices. The IOS line is <code>ntp server 192.0.2.123</code>, the Junos line is <code>set system ntp server 192.0.2.123</code>, and EOS wants <code>ntp server 192.0.2.123</code> inside its own session. Three syntaxes, one intent. You will keep the two addresses once, in <code>group_vars/network.yml</code>, and let three small tasks translate.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating "network device" as one thing. Ansible does not run Python on a router. It runs the module on the control node and talks to the device through a connection plugin, and every platform needs its own <code>ansible_network_os</code>. Skip it and nothing works, however good the YAML is.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible_network_os</code> selects the <i>platform</i> (module family and prompt handling); <code>ansible_connection</code> selects the <i>transport</i>. They are two separate variables and they fail with two different messages.</p></div>

<div class="scn"><h4>Three vendors, three scripts</h4><p>A Pune team kept a netmiko script for IOS XE, an ncclient script for Junos and a requests script for Arista eAPI. Each was 150 lines, each had its own inventory, and a new NTP server meant three edits and three test runs. They moved the shared intent into one playbook of about 25 lines plus group_vars. A new server became a one-line change in <code>group_vars/network.yml</code>, and <code>--check --diff</code> showed all three diffs before anything changed.</p><p><b>Lesson:</b> when the task is the same intent on many vendors and the team prefers declarative files, Ansible's collections remove the per-vendor glue. When you need loops over data with heavy logic, Python (netmiko, Nornir) is still the better tool.</p></div>
<div class="iv"><p class="q">"Why would you use Ansible rather than a Python script for a multivendor change?"</p><p>Because the playbook states the intent once and the collections translate it. Group_vars carry the platform and transport, <code>--check --diff</code> gives a review step for free, and modules are idempotent. I would still choose Python when the logic is data-heavy.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One inventory, one group per platform, one parent group for the fleet.</li>
<li><code>ansible_network_os</code> picks the module family; <code>ansible_connection</code> picks the transport.</li>
<li>Three transports: <code>network_cli</code> (SSH 22), <code>netconf</code> (830), <code>httpapi</code> (eAPI).</li>
<li>Intent lives in variables; syntax lives in per-vendor tasks.</li>
<li>Most multivendor failures are connection failures, and Chapter 9 teaches you to read them.</li></ul></div>
`,hi:`
<p><b>Is chapter mein aap seekhoge.</b> Yeh module woh Ansible, jo aap IOS se jaante ho, ek saath teen vendors par chalana sikhata hai. Aakhir tak aap ek project bana sakoge jo <b>IOS XE, Junos aur EOS</b> teeno ko configure kare, <code>ansible_network_os</code> set karke har platform ke liye sahi <b>connection plugin</b> (<code>network_cli</code>, <code>netconf</code> ya <code>httpapi</code>) chun sakoge, vendor collections se facts aur commands chala sakoge, <code>ios_config</code>, <code>junos_config</code> aur <code>eos_config</code> se baseline push kar sakoge, <code>--check --diff</code> se pehle dekh sakoge, idempotent saabit kar sakoge, VLANs ke liye resource module use kar sakoge, aur minutes mein pakad sakoge ki Ansible device se connect kyon nahi ho raha.</p>
<p><b>Prerequisites.</b> Config track ka <i>Ansible for Network Engineers</i> (<code>ans-start</code>, <code>ans-inventory</code>, <code>ans-logic</code>, <code>ans-templates</code>, <code>ans-roles</code>) IOS routers par inventory, playbook, group_vars, Jinja2 templates, roles aur Ansible Vault sikha chuka hai, aur Cisco automation track ke <code>auto-ansible</code> ne yeh baatein dohrayi thi. Main inhe dobara nahi padhata, bas refer karta hoon. Aapko <code>adv-netconf</code> ke NETCONF basics bhi chahiye (port 830, running aur candidate, confirmed commit). Aakhir ki tool-choice table <code>adv-nornir</code> aur <code>adv-napalm</code> use karti hai, jo is module se theek pehle aate hain.</p>

<h3>Ek analogy: summit ke interpreters</h3>
<p>Ek summit sochiye jahan ek chairperson (aapki playbook) ko teen delegates ko wahi instruction dena hai jo alag alag bhasha bolte hain. Chairperson teen bhasha nahi seekhta. Har delegate ke liye do cheezein tay hoti hain: kaunsa <b>interpreter</b> lagana hai, aur kaunsi <b>phone line</b> par baat karni hai. Ansible mein interpreter <b>module family</b> hai, jo <code>ansible_network_os</code> se chunti hai: <code>cisco.ios.ios</code>, <code>junipernetworks.junos.junos</code> ya <code>arista.eos.eos</code>. Phone line <b>connection plugin</b> hai, jo <code>ansible_connection</code> se chunta hai: SSH par CLI session, port 830 par NETCONF session, ya device API par HTTPS call. Playbook batati hai <i>kya</i> chahiye (ek NTP server); collection jaanti hai har dialect mein <i>kaise</i> bolna hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ek control node, teen connection plugins, teen vendors">
<rect x="8" y="80" width="112" height="70" rx="10" fill="#bae6fd"/><text x="64" y="108" text-anchor="middle" class="svg-ink" font-size="13">AUTO01</text><text x="64" y="127" text-anchor="middle" class="svg-muted" font-size="11">ansible-core</text><text x="64" y="142" text-anchor="middle" class="svg-muted" font-size="11">~/mvauto</text>
<rect x="215" y="14" width="170" height="52" rx="10" fill="#ddd6fe"/><text x="300" y="38" text-anchor="middle" class="svg-ink" font-size="13">network_cli</text><text x="300" y="55" text-anchor="middle" class="svg-muted" font-size="11">SSH, TCP 22, text CLI</text>
<rect x="215" y="89" width="170" height="52" rx="10" fill="#fde68a"/><text x="300" y="113" text-anchor="middle" class="svg-ink" font-size="13">netconf</text><text x="300" y="130" text-anchor="middle" class="svg-muted" font-size="11">SSH subsystem, TCP 830, XML</text>
<rect x="215" y="164" width="170" height="52" rx="10" fill="#bbf7d0"/><text x="300" y="188" text-anchor="middle" class="svg-ink" font-size="13">httpapi</text><text x="300" y="205" text-anchor="middle" class="svg-muted" font-size="11">eAPI, TCP 443, JSON</text>
<rect x="480" y="14" width="152" height="52" rx="10" fill="#fed7aa"/><text x="556" y="38" text-anchor="middle" class="svg-ink" font-size="12">R1 PUN-CORE-R1</text><text x="556" y="55" text-anchor="middle" class="svg-muted" font-size="11">IOS XE</text>
<rect x="480" y="89" width="152" height="52" rx="10" fill="#fed7aa"/><text x="556" y="113" text-anchor="middle" class="svg-ink" font-size="12">J1 BLR-EDGE-J1</text><text x="556" y="130" text-anchor="middle" class="svg-muted" font-size="11">Junos</text>
<rect x="480" y="164" width="152" height="52" rx="10" fill="#fed7aa"/><text x="556" y="188" text-anchor="middle" class="svg-ink" font-size="12">E1 HYD-LEAF-E1</text><text x="556" y="205" text-anchor="middle" class="svg-muted" font-size="11">EOS</text>
<line x1="120" y1="105" x2="215" y2="40" stroke="#64748b" stroke-width="2"/><line x1="120" y1="115" x2="215" y2="115" stroke="#64748b" stroke-width="2"/><line x1="120" y1="125" x2="215" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="385" y1="40" x2="480" y2="40" stroke="#64748b" stroke-width="2"/><line x1="385" y1="115" x2="480" y2="115" stroke="#64748b" stroke-width="2"/><line x1="385" y1="190" x2="480" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Control node har device tak us plugin se pahunch sakta hai jo device support karta hai. Diagram woh pairing dikhata hai jo Lab 1 mein pehle use hoti hai; baad mein aap ise badloge.</p></div>

<h3>Pehle ke Ansible modules ke mukable naya kya hai</h3>
<table class="cmp"><tr><th>Pehle (ans-*, auto-ansible)</th><th>Yeh module</th></tr>
<tr><td>Ek platform: <code>cisco.ios.ios</code></td><td>Ek inventory mein teen platforms, har platform ka ek group</td></tr>
<tr><td>Hamesha SSH par <code>network_cli</code></td><td>Saath mein <code>netconf</code> (port 830) aur <code>httpapi</code> (eAPI)</td></tr>
<tr><td><code>ios_config</code> aur <code>ios_command</code></td><td>Saath mein <code>junos_config</code>, <code>eos_config</code>, <code>*_facts</code>, <code>*_command</code> aur <code>eos_vlans</code> jaise resource modules</td></tr>
<tr><td>Syntax aur YAML ke errors</td><td><i>Connection</i> ke errors: network OS, plugin, enable, certificate</td></tr></table>

<h3>Lab aur pehli jhalak</h3>
<p>Sab kuch AUTO01 (netadmin / Deccan@123) par, <code>~/mvauto</code> folder mein chalta hai. Teeno devices <b>netops / NK@2026</b> lete hain: R1 IOS XE router 10.99.0.1 par, J1 Junos router 10.99.0.11 par, E1 EOS switch 10.99.0.21 par. Lab 1 mein aap inventory kuch minutes mein likhoge. Ansible uske baare mein yeh kehta hai:</p>
<pre class="out">AUTO01$ ansible-inventory --graph
@all:
  |--@network:
  |  |--@ios:
  |  |  |--R1
  |  |--@junos:
  |  |  |--J1
  |  |--@eos:
  |  |  |--E1</pre>
<p>Parent group <code>network</code> teeno platform groups ko rakhta hai. <code>network</code> par play har vendor tak pahunchti hai; <code>junos</code> par play sirf Junos tak. Group se jude variables tay karte hain ki bhasha kaunsi hogi aur phone line kaunsi.</p>

<div class="eg"><p><b>Worked example: ticket CHG-2058.</b> NOC chahta hai ki sabhi edge devices par wahi NTP server (192.0.2.123) aur syslog host (192.0.2.50) ho. IOS ki line <code>ntp server 192.0.2.123</code> hai, Junos ki line <code>set system ntp server 192.0.2.123</code>, aur EOS ko <code>ntp server 192.0.2.123</code> apne session ke andar chahiye. Teen syntax, ek intent. Aap do addresses ek hi baar <code>group_vars/network.yml</code> mein rakhoge aur teen chhote tasks se translate karoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Network device" ko ek hi cheez maan lena. Ansible router par Python nahi chalata. Woh module control node par chalata hai aur device se connection plugin ke zariye baat karta hai, aur har platform ko apna <code>ansible_network_os</code> chahiye. Isse chhodo to kuch kaam nahi karta, YAML chahe kitni achhi ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible_network_os</code> <i>platform</i> chunta hai (module family aur prompt handling); <code>ansible_connection</code> <i>transport</i> chunta hai. Yeh do alag variables hain aur do alag messages ke saath fail hote hain.</p></div>

<div class="scn"><h4>Teen vendors, teen scripts</h4><p>Pune ki ek team IOS XE ke liye netmiko script, Junos ke liye ncclient script aur Arista eAPI ke liye requests script rakhti thi. Har ek 150 line ki, har ek ki apni inventory, aur naya NTP server matlab teen edits aur teen test runs. Unhone shared intent ko ek playbook (lagbhag 25 line) aur group_vars mein daal diya. Naya server <code>group_vars/network.yml</code> mein ek line ka change ban gaya, aur <code>--check --diff</code> ne kuch badalne se pehle teeno diffs dikha diye.</p><p><b>Lesson:</b> jab kaam ek hi intent kai vendors par hai aur team declarative files pasand karti hai, Ansible ke collections har vendor ka glue hata dete hain. Jab data par loops aur bhaari logic chahiye, Python (netmiko, Nornir) ab bhi behtar tool hai.</p></div>
<div class="iv"><p class="q">"Multivendor change ke liye Python script ki jagah Ansible kyon use karoge?"</p><p>Kyunki playbook intent ek baar likhti hai aur collections use translate karte hain. Group_vars platform aur transport rakhte hain, <code>--check --diff</code> review step muft deta hai, aur modules idempotent hote hain. Jab logic data-heavy ho to main phir bhi Python chunta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek inventory, har platform ka ek group, poore fleet ke liye ek parent group.</li>
<li><code>ansible_network_os</code> module family chunta hai; <code>ansible_connection</code> transport chunta hai.</li>
<li>Teen transports: <code>network_cli</code> (SSH 22), <code>netconf</code> (830), <code>httpapi</code> (eAPI).</li>
<li>Intent variables mein rehta hai; syntax har vendor ke chhote tasks mein.</li>
<li>Zyadatar multivendor failures connection failures hain, aur Chapter 9 unhe padhna sikhata hai.</li></ul></div>
`}};export{e as default};