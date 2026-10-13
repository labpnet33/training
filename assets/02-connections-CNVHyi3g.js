var e={id:`connections`,h:{en:`ansible_network_os and the three connection plugins`,hi:`ansible_network_os aur teen connection plugins`},body:{en:`
<p>Every network host in Ansible needs two answers: <b>what is it?</b> and <b>how do I reach it?</b> The first answer is <code>ansible_network_os</code>, the second is <code>ansible_connection</code>. This chapter teaches both, with the exact values and ports, because Chapter 9 shows that almost every "Ansible cannot connect" ticket is one of these two answers being wrong or missing.</p>

<h3>ansible_network_os: what is it?</h3>
<p>The value is the fully qualified name of the platform in its collection. Short names such as <code>ios</code>, <code>junos</code>, <code>eos</code> and <code>nxos</code> are also accepted, but always write the long name in real projects so it matches the module names you call.</p>
<table class="cmp"><tr><th>Platform</th><th>ansible_network_os</th><th>Collection</th></tr>
<tr><td>IOS XE</td><td><code>cisco.ios.ios</code></td><td><code>cisco.ios</code></td></tr>
<tr><td>Junos</td><td><code>junipernetworks.junos.junos</code></td><td><code>junipernetworks.junos</code></td></tr>
<tr><td>EOS</td><td><code>arista.eos.eos</code></td><td><code>arista.eos</code></td></tr>
<tr><td>NX-OS</td><td><code>cisco.nxos.nxos</code></td><td><code>cisco.nxos</code></td></tr></table>
<p>NX-OS follows exactly the same pattern, and its modules (<code>nxos_config</code>, <code>nxos_command</code>, <code>nxos_facts</code>) behave like the EOS ones. The labs of this module use the first three platforms only, so I keep NX-OS as a table row and a reminder that the skills transfer.</p>

<h3>ansible_connection: how do I reach it?</h3>
<table class="cmp"><tr><th>Plugin</th><th>Transport</th><th>Port</th><th>Language</th><th>Typical modules</th></tr>
<tr><td><code>ansible.netcommon.network_cli</code></td><td>SSH session, prompt handling</td><td>22</td><td>Text CLI</td><td><code>ios_*</code>, <code>eos_*</code>, <code>nxos_*</code>, <code>cli_command</code></td></tr>
<tr><td><code>ansible.netcommon.netconf</code></td><td>SSH subsystem</td><td>830</td><td>XML RPC</td><td><code>junos_*</code>, <code>netconf_get</code>, <code>netconf_config</code></td></tr>
<tr><td><code>ansible.netcommon.httpapi</code></td><td>Web API call</td><td>443 with SSL, 80 without</td><td>JSON (eAPI on EOS, NX-API on NX-OS)</td><td><code>eos_*</code>, <code>nxos_*</code></td></tr></table>
<p>Think of three phone lines into the same building. <code>network_cli</code> is a person at the reception desk who types what you say into a terminal and reads the screen back. <code>netconf</code> is a registered form with numbered requests (you met it in <code>adv-netconf</code>). <code>httpapi</code> is a clean web request and answer in JSON. The same device can offer more than one line: the EOS switch in this lab takes both <code>network_cli</code> and <code>httpapi</code>, and the Junos router takes <code>network_cli</code> and <code>netconf</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Choosing the transport per platform">
<rect x="8" y="14" width="150" height="46" rx="10" fill="#fed7aa"/><text x="83" y="42" text-anchor="middle" class="svg-ink" font-size="13">IOS XE (R1)</text>
<rect x="8" y="62" width="150" height="46" rx="10" fill="#bbf7d0"/><text x="83" y="90" text-anchor="middle" class="svg-ink" font-size="13">Junos (J1)</text>
<rect x="8" y="110" width="150" height="46" rx="10" fill="#bae6fd"/><text x="83" y="138" text-anchor="middle" class="svg-ink" font-size="13">EOS (E1)</text>
<rect x="250" y="14" width="190" height="46" rx="10" fill="#ddd6fe"/><text x="345" y="42" text-anchor="middle" class="svg-ink" font-size="12">network_cli (SSH 22)</text>
<rect x="250" y="62" width="190" height="46" rx="10" fill="#fde68a"/><text x="345" y="90" text-anchor="middle" class="svg-ink" font-size="12">netconf (830)</text>
<rect x="250" y="110" width="190" height="46" rx="10" fill="#bbf7d0"/><text x="345" y="138" text-anchor="middle" class="svg-ink" font-size="12">httpapi (443)</text>
<line x1="158" y1="37" x2="250" y2="37" stroke="#64748b" stroke-width="2"/><line x1="158" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="158" y1="133" x2="250" y2="133" stroke="#64748b" stroke-width="2"/>
<line x1="158" y1="100" x2="250" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="158" y1="146" x2="250" y2="55" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="540" y="40" text-anchor="middle" class="svg-muted" font-size="12">solid line: the choice used in Lab 1</text><text x="540" y="62" text-anchor="middle" class="svg-muted" font-size="12">dashed line: also possible</text>
</svg><p class="cap">Lab 1 starts everything on network_cli, then moves Junos to netconf and EOS to httpapi by editing group_vars only.</p></div>

<h3>The variables around the connection</h3>
<table class="cmp"><tr><th>Variable</th><th>Meaning</th></tr>
<tr><td><code>ansible_user</code>, <code>ansible_password</code></td><td>Real login on the device user database. Keep the password in Vault (<code>ans-roles</code>), not in plain group_vars.</td></tr>
<tr><td><code>ansible_become</code>, <code>ansible_become_method: enable</code>, <code>ansible_become_password</code></td><td>Enter enable mode when the account has a privilege level below 15 (IOS XE, EOS, NX-OS).</td></tr>
<tr><td><code>ansible_httpapi_use_ssl</code></td><td>Default false, so the plugin uses port 80. Set true for port 443.</td></tr>
<tr><td><code>ansible_httpapi_validate_certs</code></td><td>Default true. A self-signed certificate on the device fails verification.</td></tr>
<tr><td><code>ansible_httpapi_port</code></td><td>Override the port.</td></tr>
<tr><td><code>ansible_command_timeout</code>, <code>ansible_connect_timeout</code></td><td>How long to wait for a prompt or a connection.</td></tr></table>
<p>You do not have to remember these from memory. Ansible documents every connection plugin and the lab terminal shows it:</p>
<pre class="out">AUTO01$ ansible-doc -t connection -l
ansible.netcommon.network_cli     Use network_cli to run command on network appliances
ansible.netcommon.netconf         Provides a persistent connection using the netconf protocol
<span class="hl">ansible.netcommon.httpapi         Use httpapi to run command on network appliances</span>
ansible.netcommon.libssh          Run tasks using libssh for ssh connection
AUTO01$ ansible-galaxy collection list
Collection                    Version
----------------------------- -------
ansible.netcommon             5.3.0
ansible.utils                 2.12.0
arista.eos                    6.2.2
cisco.ios                     5.3.0
cisco.nxos                    5.3.0
community.general             8.3.0
junipernetworks.junos         5.3.0</pre>
<p>Run <code>ansible-doc -t connection ansible.netcommon.httpapi</code> and read the options: <code>use_ssl</code> has <i>default: false</i> and <code>validate_certs</code> has <i>default: true</i>. That one screen predicts the two errors you will meet in Lab 2.</p>

<div class="eg"><p><b>Worked example: choosing for the lab fleet.</b> R1 (IOS XE): <code>network_cli</code>, because the IOS modules speak CLI. J1 (Junos): start on <code>network_cli</code> to see it work, then <code>netconf</code> for the proper transactional behaviour of Chapter 7. E1 (EOS): <code>network_cli</code> first, then <code>httpapi</code> with <code>use_ssl: true</code> for structured JSON answers in Chapter 8.</p></div>
<div class="warn"><p><b>Common mistake.</b> Writing <code>ansible_connection: ssh</code>. That is the ordinary Ansible SSH plugin that expects Python on the target. For a router or switch it must be a network plugin. The message you get is <i>Connection type ssh is not valid for this module</i>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Port numbers: <code>network_cli</code> uses SSH 22, <code>netconf</code> uses 830, <code>httpapi</code> uses 80 by default and 443 only after <code>ansible_httpapi_use_ssl: true</code>.</p></div>

<div class="scn"><h4>It worked on SSH, then failed on httpapi</h4><p>An engineer changed the EOS group to <code>ansible_connection: ansible.netcommon.httpapi</code> and every EOS host went UNREACHABLE with <i>Connection refused</i> on port 80. The switch was healthy; eAPI listens on 443 only. She added <code>ansible_httpapi_use_ssl: true</code> and got a new error, a certificate failure, because the switch used a self-signed certificate.</p><p><b>Lesson:</b> a new transport brings new variables. Read the plugin documentation before you flip the switch.</p></div>
<div class="iv"><p class="q">"What is the difference between network_cli and netconf in Ansible?"</p><p><code>network_cli</code> drives a text CLI over SSH port 22 and parses prompts. <code>netconf</code> uses the NETCONF subsystem on port 830 with XML and gives the device a real transaction model. Junos prefers netconf; IOS XE modules use network_cli.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the long <code>ansible_network_os</code> names; they select the module family.</li>
<li>Connection plugin and ports: network_cli 22, netconf 830, httpapi 443 (80 until SSL is on).</li>
<li>httpapi defaults to no SSL and strict certificates: both need attention.</li>
<li><code>ansible-doc -t connection</code> lists the plugins and their options.</li>
<li>Credentials belong in Vault, not in a plain group_vars file.</li></ul></div>
`,hi:`
<p>Ansible mein har network host ko do jawab chahiye: <b>yeh kya hai?</b> aur <b>ise kaise pahunchein?</b> Pehla jawab <code>ansible_network_os</code> hai, doosra <code>ansible_connection</code>. Yeh chapter dono ko sahi values aur ports ke saath sikhata hai, kyunki Chapter 9 dikhata hai ki lagbhag har "Ansible connect nahi kar sakta" ticket in do jawabon mein se ek ke galat ya gayab hone se hota hai.</p>

<h3>ansible_network_os: yeh kya hai?</h3>
<p>Value platform ka fully qualified naam hota hai, collection ke saath. <code>ios</code>, <code>junos</code>, <code>eos</code> aur <code>nxos</code> jaise short naam bhi chalte hain, par real projects mein hamesha lamba naam likho taaki woh un module names se match kare jo aap bulate ho.</p>
<table class="cmp"><tr><th>Platform</th><th>ansible_network_os</th><th>Collection</th></tr>
<tr><td>IOS XE</td><td><code>cisco.ios.ios</code></td><td><code>cisco.ios</code></td></tr>
<tr><td>Junos</td><td><code>junipernetworks.junos.junos</code></td><td><code>junipernetworks.junos</code></td></tr>
<tr><td>EOS</td><td><code>arista.eos.eos</code></td><td><code>arista.eos</code></td></tr>
<tr><td>NX-OS</td><td><code>cisco.nxos.nxos</code></td><td><code>cisco.nxos</code></td></tr></table>
<p>NX-OS bilkul isi pattern par chalta hai, aur uske modules (<code>nxos_config</code>, <code>nxos_command</code>, <code>nxos_facts</code>) EOS wale modules jaise behave karte hain. Is module ke labs sirf pehle teen platforms use karte hain, isliye NX-OS ek table row hai aur yaad dilane ke liye ki skills transfer hoti hain.</p>

<h3>ansible_connection: ise kaise pahunchein?</h3>
<table class="cmp"><tr><th>Plugin</th><th>Transport</th><th>Port</th><th>Bhasha</th><th>Typical modules</th></tr>
<tr><td><code>ansible.netcommon.network_cli</code></td><td>SSH session, prompt handling</td><td>22</td><td>Text CLI</td><td><code>ios_*</code>, <code>eos_*</code>, <code>nxos_*</code>, <code>cli_command</code></td></tr>
<tr><td><code>ansible.netcommon.netconf</code></td><td>SSH subsystem</td><td>830</td><td>XML RPC</td><td><code>junos_*</code>, <code>netconf_get</code>, <code>netconf_config</code></td></tr>
<tr><td><code>ansible.netcommon.httpapi</code></td><td>Web API call</td><td>SSL ke saath 443, bina SSL 80</td><td>JSON (EOS par eAPI, NX-OS par NX-API)</td><td><code>eos_*</code>, <code>nxos_*</code></td></tr></table>
<p>Ek hi building mein teen phone lines sochiye. <code>network_cli</code> reception par baitha woh insaan hai jo aapki baat terminal mein type karta hai aur screen wapas padhta hai. <code>netconf</code> numbered requests wala registered form hai (aap <code>adv-netconf</code> mein mil chuke ho). <code>httpapi</code> JSON mein saaf web request aur answer hai. Ek hi device ek se zyada line de sakta hai: is lab ka EOS switch <code>network_cli</code> aur <code>httpapi</code> dono leta hai, aur Junos router <code>network_cli</code> aur <code>netconf</code>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Har platform ke liye transport chunna">
<rect x="8" y="14" width="150" height="46" rx="10" fill="#fed7aa"/><text x="83" y="42" text-anchor="middle" class="svg-ink" font-size="13">IOS XE (R1)</text>
<rect x="8" y="62" width="150" height="46" rx="10" fill="#bbf7d0"/><text x="83" y="90" text-anchor="middle" class="svg-ink" font-size="13">Junos (J1)</text>
<rect x="8" y="110" width="150" height="46" rx="10" fill="#bae6fd"/><text x="83" y="138" text-anchor="middle" class="svg-ink" font-size="13">EOS (E1)</text>
<rect x="250" y="14" width="190" height="46" rx="10" fill="#ddd6fe"/><text x="345" y="42" text-anchor="middle" class="svg-ink" font-size="12">network_cli (SSH 22)</text>
<rect x="250" y="62" width="190" height="46" rx="10" fill="#fde68a"/><text x="345" y="90" text-anchor="middle" class="svg-ink" font-size="12">netconf (830)</text>
<rect x="250" y="110" width="190" height="46" rx="10" fill="#bbf7d0"/><text x="345" y="138" text-anchor="middle" class="svg-ink" font-size="12">httpapi (443)</text>
<line x1="158" y1="37" x2="250" y2="37" stroke="#64748b" stroke-width="2"/><line x1="158" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="158" y1="133" x2="250" y2="133" stroke="#64748b" stroke-width="2"/>
<line x1="158" y1="100" x2="250" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="158" y1="146" x2="250" y2="55" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="540" y="40" text-anchor="middle" class="svg-muted" font-size="12">seedhi line: Lab 1 ka choice</text><text x="540" y="62" text-anchor="middle" class="svg-muted" font-size="12">toota line: yeh bhi possible</text>
</svg><p class="cap">Lab 1 sab kuch network_cli par shuru karta hai, phir sirf group_vars badalkar Junos ko netconf aur EOS ko httpapi par le jaata hai.</p></div>

<h3>Connection ke aas paas ke variables</h3>
<table class="cmp"><tr><th>Variable</th><th>Matlab</th></tr>
<tr><td><code>ansible_user</code>, <code>ansible_password</code></td><td>Device user database ka asli login. Password Vault mein rakho (<code>ans-roles</code>), plain group_vars mein nahi.</td></tr>
<tr><td><code>ansible_become</code>, <code>ansible_become_method: enable</code>, <code>ansible_become_password</code></td><td>Jab account ka privilege level 15 se kam ho to enable mode mein jao (IOS XE, EOS, NX-OS).</td></tr>
<tr><td><code>ansible_httpapi_use_ssl</code></td><td>Default false, isliye plugin port 80 use karta hai. Port 443 ke liye true karo.</td></tr>
<tr><td><code>ansible_httpapi_validate_certs</code></td><td>Default true. Device ka self-signed certificate verification mein fail hota hai.</td></tr>
<tr><td><code>ansible_httpapi_port</code></td><td>Port override karo.</td></tr>
<tr><td><code>ansible_command_timeout</code>, <code>ansible_connect_timeout</code></td><td>Prompt ya connection ke liye kitna intezaar karna hai.</td></tr></table>
<p>Yeh sab yaad rakhna zaroori nahi. Ansible har connection plugin document karta hai aur lab terminal dikhata hai:</p>
<pre class="out">AUTO01$ ansible-doc -t connection -l
ansible.netcommon.network_cli     Use network_cli to run command on network appliances
ansible.netcommon.netconf         Provides a persistent connection using the netconf protocol
<span class="hl">ansible.netcommon.httpapi         Use httpapi to run command on network appliances</span>
ansible.netcommon.libssh          Run tasks using libssh for ssh connection
AUTO01$ ansible-galaxy collection list
Collection                    Version
----------------------------- -------
ansible.netcommon             5.3.0
ansible.utils                 2.12.0
arista.eos                    6.2.2
cisco.ios                     5.3.0
cisco.nxos                    5.3.0
community.general             8.3.0
junipernetworks.junos         5.3.0</pre>
<p><code>ansible-doc -t connection ansible.netcommon.httpapi</code> chalao aur options padho: <code>use_ssl</code> ka <i>default: false</i> hai aur <code>validate_certs</code> ka <i>default: true</i>. Yeh ek screen woh do errors pehle se bata deti hai jo aap Lab 2 mein dekhoge.</p>

<div class="eg"><p><b>Worked example: lab fleet ke liye chunav.</b> R1 (IOS XE): <code>network_cli</code>, kyunki IOS modules CLI bolte hain. J1 (Junos): pehle <code>network_cli</code> par chalakar dekho, phir Chapter 7 ke proper transactional behaviour ke liye <code>netconf</code>. E1 (EOS): pehle <code>network_cli</code>, phir Chapter 8 mein structured JSON answers ke liye <code>use_ssl: true</code> ke saath <code>httpapi</code>.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>ansible_connection: ssh</code> likhna. Yeh aam Ansible SSH plugin hai jo target par Python maanta hai. Router ya switch ke liye network plugin hona chahiye. Message milta hai <i>Connection type ssh is not valid for this module</i>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Port numbers: <code>network_cli</code> SSH 22, <code>netconf</code> 830, <code>httpapi</code> default mein 80 aur 443 sirf <code>ansible_httpapi_use_ssl: true</code> ke baad.</p></div>

<div class="scn"><h4>SSH par chala, httpapi par fail</h4><p>Ek engineer ne EOS group ko <code>ansible_connection: ansible.netcommon.httpapi</code> kiya aur har EOS host port 80 par <i>Connection refused</i> ke saath UNREACHABLE ho gaya. Switch theek tha; eAPI sirf 443 par sunta hai. Usne <code>ansible_httpapi_use_ssl: true</code> joda to naya error mila, certificate failure, kyunki switch ka certificate self-signed tha.</p><p><b>Lesson:</b> naya transport naye variables laata hai. Switch dabane se pehle plugin documentation padho.</p></div>
<div class="iv"><p class="q">"Ansible mein network_cli aur netconf mein kya fark hai?"</p><p><code>network_cli</code> SSH port 22 par text CLI chalata hai aur prompts parse karta hai. <code>netconf</code> port 830 par NETCONF subsystem ke saath XML use karta hai aur device ko asli transaction model deta hai. Junos netconf pasand karta hai; IOS XE modules network_cli use karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lambe <code>ansible_network_os</code> naam use karo; woh module family chunte hain.</li>
<li>Connection plugin aur ports: network_cli 22, netconf 830, httpapi 443 (SSL on hone tak 80).</li>
<li>httpapi default mein bina SSL aur strict certificates ke chalta hai: dono par dhyan do.</li>
<li><code>ansible-doc -t connection</code> plugins aur unke options dikhata hai.</li>
<li>Credentials Vault mein rakho, plain group_vars file mein nahi.</li></ul></div>
`}};export{e as default};