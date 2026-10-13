var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: why Ansible cannot connect (Lab 2)`,hi:`Troubleshooting workflow: Ansible connect kyon nahi kar pa raha (Lab 2)`},body:{en:`
<p>When a multivendor run fails, the YAML is rarely the problem. The connection is. Lab 2 hands you ticket CHG-2058: the baseline <code>site.yml</code> must reach four inventory entries, R1, J1, E1cli (the EOS switch over SSH, account <code>ops1</code> with privilege 1) and E1api (the same switch over eAPI), and the first run fails on three of them. You will fix four faults, one at a time, the way you would on a real change window.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Connection triage order">
<rect x="8" y="30" width="110" height="52" rx="10" fill="#bae6fd"/><text x="63" y="52" text-anchor="middle" class="svg-ink" font-size="12">1. Read the</text><text x="63" y="68" text-anchor="middle" class="svg-ink" font-size="12">message</text>
<rect x="136" y="30" width="110" height="52" rx="10" fill="#ddd6fe"/><text x="191" y="52" text-anchor="middle" class="svg-ink" font-size="12">2. inventory</text><text x="191" y="68" text-anchor="middle" class="svg-ink" font-size="12">--host</text>
<rect x="264" y="30" width="110" height="52" rx="10" fill="#fde68a"/><text x="319" y="52" text-anchor="middle" class="svg-ink" font-size="12">3. ansible-doc</text><text x="319" y="68" text-anchor="middle" class="svg-ink" font-size="12">the plugin</text>
<rect x="392" y="30" width="110" height="52" rx="10" fill="#bbf7d0"/><text x="447" y="52" text-anchor="middle" class="svg-ink" font-size="12">4. Fix one</text><text x="447" y="68" text-anchor="middle" class="svg-ink" font-size="12">variable</text>
<rect x="520" y="30" width="112" height="52" rx="10" fill="#fed7aa"/><text x="576" y="52" text-anchor="middle" class="svg-ink" font-size="12">5. Run again</text><text x="576" y="68" text-anchor="middle" class="svg-ink" font-size="12">(one host)</text>
<line x1="118" y1="56" x2="136" y2="56" stroke="#64748b" stroke-width="2"/><line x1="246" y1="56" x2="264" y2="56" stroke="#64748b" stroke-width="2"/><line x1="374" y1="56" x2="392" y2="56" stroke="#64748b" stroke-width="2"/><line x1="502" y1="56" x2="520" y2="56" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Change one thing per run. Several fixes at once hide which one worked.</p></div>

<h3>Run it and read it</h3>
<pre class="out">AUTO01$ cd ~/mvauto
AUTO01$ ansible-playbook site.yml
PLAY [Baseline on IOS XE] *****************************************************
TASK [NTP and syslog on IOS XE] ***********************************************
changed: [R1]
PLAY [Baseline on Junos] ******************************************************
TASK [NTP and syslog on Junos] ************************************************
<span class="hl">fatal: [J1]: FAILED! =&gt; {"changed": false, "msg": "Unable to automatically determine host network os. Please manually configure ansible_network_os value for this host"}</span>
NO MORE HOSTS LEFT ************************************************************
PLAY [Baseline on EOS] ********************************************************
TASK [NTP and syslog on EOS] **************************************************
<span class="hl">fatal: [E1cli]: FAILED! =&gt; {"changed": false, "msg": "Connection type ssh is not valid for this module"}</span>
<span class="hl">fatal: [E1api]: UNREACHABLE! =&gt; {"changed": false, "msg": "Could not connect to h&#116;tp://10.99.0.21:80/command-api: [Errno 111] Connection refused", "unreachable": true}</span>
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
J1                         : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0
E1cli                      : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0
E1api                      : ok=0    changed=0    unreachable=1    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Notice two words: <b>FAILED</b> means Ansible reached the device or its plugin and something was wrong; <b>UNREACHABLE</b> means it could not open the connection. And a failed host drops out of the run (<i>NO MORE HOSTS LEFT</i> when none remain in a play) while the others carry on: R1 is already done.</p>

<h3>Fault 1: the network OS is missing (J1)</h3>
<p>The Junos group file has the connection but not the platform. Ansible cannot choose a module family. Fix it where the platform belongs:</p>
<pre class="code">AUTO01$ echo 'ansible_network_os: junipernetworks.junos.junos' &gt;&gt; group_vars/junos.yml
AUTO01$ ansible-playbook site.yml</pre>
<pre class="out">TASK [NTP and syslog on Junos] ************************************************
<span class="hl">changed: [J1]</span></pre>
<p>A relative of this error appears when you guard a task with <code>when: ansible_network_os == ...</code> on a host that has no network OS: the message is <i>The conditional check ... failed ... 'ansible_network_os' is undefined</i>. Same root cause, different symptom.</p>

<h3>Fault 2: the wrong connection type (E1cli)</h3>
<p><code>ansible_connection: ssh</code> is the plain Ansible plugin. Replace it with the CLI plugin for network devices:</p>
<pre class="code">AUTO01$ sed -i 's/ansible_connection: ssh/ansible_connection: ansible.netcommon.network_cli/' group_vars/eos.yml
AUTO01$ ansible-playbook site.yml</pre>
<p>The answer to the lab question is <code>network_cli</code>. The next run reveals the next problem, as it often does.</p>

<h3>Fault 3: the enable password (E1cli)</h3>
<pre class="out"><span class="hl">fatal: [E1cli]: FAILED! =&gt; {"changed": false, "msg": "failed to elevate privilege to enable mode, still at prompt [HYD-LEAF-E1&gt;]. See h&#116;tps://docs.ansible.com/ansible/latest/network/user_guide/platform_eos.html"}</span></pre>
<p>The account <code>ops1</code> has privilege 1, so it lands at the user prompt <code>HYD-LEAF-E1&gt;</code>. Configuration needs privilege 15, so the group uses <code>ansible_become: true</code> and <code>ansible_become_method: enable</code>, but <code>ansible_become_password</code> holds the login password, not the enable password. Without any become settings, a low-privilege account stops earlier with a message that says configuration mode needs privilege level 15. The ticket gives the enable password:</p>
<pre class="code">AUTO01$ sed -i 's/ansible_become_password: NK@2026/ansible_become_password: NKen@2026/' group_vars/eos.yml
AUTO01$ ansible-playbook site.yml</pre>
<pre class="out"><span class="hl">changed: [E1cli]</span>
fatal: [E1api]: UNREACHABLE! =&gt; ...</pre>

<h3>Fault 4: eAPI over SSL (E1api)</h3>
<p>The first error said <i>Connection refused</i> on port <b>80</b>: <code>httpapi</code> defaults to no SSL, but the switch listens for eAPI on 443. Turn SSL on and run again:</p>
<pre class="code">AUTO01$ echo 'ansible_httpapi_use_ssl: true' &gt;&gt; group_vars/eosapi.yml
AUTO01$ ansible-playbook site.yml</pre>
<pre class="out">fatal: [E1api]: UNREACHABLE! =&gt; {"changed": false, "msg": "Could not connect to h&#116;tps://10.99.0.21:443/command-api: &lt;urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: <span class="hl">self-signed certificate</span> (_ssl.c:1007)&gt;", "unreachable": true}</pre>
<p>Progress: the port is right and TLS now starts, but the switch certificate is <b>self-signed</b> and the default is to verify. In the lab we accept it; on real equipment you install the authority that signed it on AUTO01:</p>
<pre class="code">AUTO01$ echo 'ansible_httpapi_validate_certs: false' &gt;&gt; group_vars/eosapi.yml
AUTO01$ ansible-playbook site.yml</pre>
<pre class="out">TASK [NTP and syslog on EOS] **************************************************
ok: [E1cli]
ok: [E1api]
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
J1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
E1cli                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
E1api                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Run it once more: all four stay <code>changed=0</code>. Both EOS entries reach the same switch by different transports and agree.</p>

<h3>The message-to-cause table</h3>
<table class="cmp"><tr><th>Message</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Unable to automatically determine host network os</td><td><code>ansible_network_os</code> missing</td><td>Add it to the platform group</td></tr>
<tr><td>Connection type ssh is not valid for this module</td><td>Plain SSH plugin on a network module</td><td>network_cli, netconf or httpapi</td></tr>
<tr><td>failed to elevate privilege to enable mode</td><td>Wrong or missing enable password</td><td>Fix <code>ansible_become_password</code></td></tr>
<tr><td>Could not connect to ...:80 ... Connection refused</td><td>httpapi without SSL</td><td><code>ansible_httpapi_use_ssl: true</code></td></tr>
<tr><td>CERTIFICATE_VERIFY_FAILED ... self-signed certificate</td><td>Untrusted device certificate</td><td>Trust the CA, or (lab) <code>validate_certs: false</code></td></tr>
<tr><td>Could not connect to ... Unauthorized</td><td>Wrong eAPI user or password</td><td>Fix <code>ansible_user</code> and <code>ansible_password</code></td></tr>
<tr><td>Authentication failed (UNREACHABLE)</td><td>Wrong NETCONF login</td><td>Fix the credentials</td></tr>
<tr><td>Unable to connect to port 830</td><td>NETCONF service not enabled on Junos</td><td><code>set system services netconf ssh</code></td></tr></table>

<div class="note"><p><b>In the lab vs on real gear.</b> A dead host or a wrong password on <code>network_cli</code> prints <i>unable to open shell. Please see: ...#category-unable-to-open-shell</i> as FAILED in this lab. Real ansible-core often reports a wrong password as UNREACHABLE with <i>Authentication failed.</i>, so the recap column can differ. Also <code>-vvv</code> prints only the version and the config file here; on real gear it prints the full connection trace, which is the most useful debugging tool you have.</p></div>
<div class="warn"><p><b>Common mistake.</b> Fixing the symptom of the last host in the output and stopping. A single fix often just moves you one layer further (port, then TLS, then credentials). Re-run after every change and read the new first error.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible_connection: ssh</code> and <code>ansible_connection: local</code> are not network connections. Network modules need <code>network_cli</code>, <code>netconf</code> or <code>httpapi</code>.</p></div>

<div class="scn"><h4>Four hosts, four different reasons</h4><p>After a migration the weekend job failed on Monday for 12 devices. The engineer grouped the failures by message instead of by name: 7 were <i>Unable to automatically determine host network os</i> (a new group without the variable), 3 were <i>Connection refused</i> on port 80 (httpapi without SSL), 2 were <i>Authentication failed</i> (a rotated NETCONF password). Three variable edits fixed twelve hosts.</p><p><b>Lesson:</b> group failures by message. The message names the layer.</p></div>
<div class="iv"><p class="q">"An Ansible job cannot connect to some switches. How do you start?"</p><p>I read the exact message and note whether it is FAILED or UNREACHABLE, check the merged variables with <code>ansible-inventory --host</code>, read the connection plugin docs for the option that matches the message, change one variable and re-run on one host with <code>-l</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FAILED means the module or plugin complained; UNREACHABLE means no connection.</li>
<li>Missing network OS, wrong plugin, enable password and certificate are the four classic causes.</li>
<li>httpapi needs <code>use_ssl: true</code> and a trusted (or, in the lab, unchecked) certificate.</li>
<li>Fix one variable per run; read the new first error each time.</li>
<li>Group failures by message to find the shared cause.</li></ul></div>
`,hi:`
<p>Multivendor run fail ho to YAML shayad hi problem hoti hai. Connection hoti hai. Lab 2 aapko ticket CHG-2058 deta hai: baseline <code>site.yml</code> chaar inventory entries tak pahunchni chahiye, R1, J1, E1cli (EOS switch SSH par, account <code>ops1</code> privilege 1 ke saath) aur E1api (wahi switch eAPI par), aur pehla run teen par fail hota hai. Aap chaar faults ek ek karke theek karoge, jaise real change window mein karte.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Connection triage ka order">
<rect x="8" y="30" width="110" height="52" rx="10" fill="#bae6fd"/><text x="63" y="52" text-anchor="middle" class="svg-ink" font-size="12">1. Message</text><text x="63" y="68" text-anchor="middle" class="svg-ink" font-size="12">padho</text>
<rect x="136" y="30" width="110" height="52" rx="10" fill="#ddd6fe"/><text x="191" y="52" text-anchor="middle" class="svg-ink" font-size="12">2. inventory</text><text x="191" y="68" text-anchor="middle" class="svg-ink" font-size="12">--host</text>
<rect x="264" y="30" width="110" height="52" rx="10" fill="#fde68a"/><text x="319" y="52" text-anchor="middle" class="svg-ink" font-size="12">3. ansible-doc</text><text x="319" y="68" text-anchor="middle" class="svg-ink" font-size="12">plugin ka</text>
<rect x="392" y="30" width="110" height="52" rx="10" fill="#bbf7d0"/><text x="447" y="52" text-anchor="middle" class="svg-ink" font-size="12">4. Ek variable</text><text x="447" y="68" text-anchor="middle" class="svg-ink" font-size="12">theek karo</text>
<rect x="520" y="30" width="112" height="52" rx="10" fill="#fed7aa"/><text x="576" y="52" text-anchor="middle" class="svg-ink" font-size="12">5. Phir chalao</text><text x="576" y="68" text-anchor="middle" class="svg-ink" font-size="12">(ek host)</text>
<line x1="118" y1="56" x2="136" y2="56" stroke="#64748b" stroke-width="2"/><line x1="246" y1="56" x2="264" y2="56" stroke="#64748b" stroke-width="2"/><line x1="374" y1="56" x2="392" y2="56" stroke="#64748b" stroke-width="2"/><line x1="502" y1="56" x2="520" y2="56" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har run mein ek cheez badlo. Kai fixes ek saath karne se pata nahi chalta kaunsa kaam aaya.</p></div>

<h3>Chalao aur padho</h3>
<pre class="out">AUTO01$ cd ~/mvauto
AUTO01$ ansible-playbook site.yml
PLAY [Baseline on IOS XE] *****************************************************
TASK [NTP and syslog on IOS XE] ***********************************************
changed: [R1]
PLAY [Baseline on Junos] ******************************************************
TASK [NTP and syslog on Junos] ************************************************
<span class="hl">fatal: [J1]: FAILED! =&gt; {"changed": false, "msg": "Unable to automatically determine host network os. Please manually configure ansible_network_os value for this host"}</span>
NO MORE HOSTS LEFT ************************************************************
PLAY [Baseline on EOS] ********************************************************
TASK [NTP and syslog on EOS] **************************************************
<span class="hl">fatal: [E1cli]: FAILED! =&gt; {"changed": false, "msg": "Connection type ssh is not valid for this module"}</span>
<span class="hl">fatal: [E1api]: UNREACHABLE! =&gt; {"changed": false, "msg": "Could not connect to h&#116;tp://10.99.0.21:80/command-api: [Errno 111] Connection refused", "unreachable": true}</span>
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
J1                         : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0
E1cli                      : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0
E1api                      : ok=0    changed=0    unreachable=1    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Do shabd dhyan se: <b>FAILED</b> matlab Ansible device ya uske plugin tak pahuncha aur kuch galat tha; <b>UNREACHABLE</b> matlab connection khul hi nahi saka. Aur fail hua host run se bahar ho jaata hai (play mein koi na bache to <i>NO MORE HOSTS LEFT</i>) jabki baaki chalte rehte hain: R1 ka kaam ho chuka.</p>

<h3>Fault 1: network OS gayab hai (J1)</h3>
<p>Junos group file mein connection hai par platform nahi. Ansible module family chun nahi sakta. Use wahan theek karo jahan platform ka ghar hai:</p>
<pre class="code">AUTO01$ echo 'ansible_network_os: junipernetworks.junos.junos' &gt;&gt; group_vars/junos.yml
AUTO01$ ansible-playbook site.yml</pre>
<pre class="out">TASK [NTP and syslog on Junos] ************************************************
<span class="hl">changed: [J1]</span></pre>
<p>Is error ka rishtedar tab aata hai jab aap <code>when: ansible_network_os == ...</code> se task guard karte ho aur host ke paas network OS nahi: message hota hai <i>The conditional check ... failed ... 'ansible_network_os' is undefined</i>. Wajah wahi, symptom alag.</p>

<h3>Fault 2: galat connection type (E1cli)</h3>
<p><code>ansible_connection: ssh</code> plain Ansible plugin hai. Use network devices ke CLI plugin se badlo:</p>
<pre class="code">AUTO01$ sed -i 's/ansible_connection: ssh/ansible_connection: ansible.netcommon.network_cli/' group_vars/eos.yml
AUTO01$ ansible-playbook site.yml</pre>
<p>Lab ke sawal ka jawab <code>network_cli</code> hai. Agla run agli problem dikhata hai, jaisa aksar hota hai.</p>

<h3>Fault 3: enable password (E1cli)</h3>
<pre class="out"><span class="hl">fatal: [E1cli]: FAILED! =&gt; {"changed": false, "msg": "failed to elevate privilege to enable mode, still at prompt [HYD-LEAF-E1&gt;]. See h&#116;tps://docs.ansible.com/ansible/latest/network/user_guide/platform_eos.html"}</span></pre>
<p>Account <code>ops1</code> ka privilege 1 hai, isliye woh user prompt <code>HYD-LEAF-E1&gt;</code> par utarta hai. Configuration ko privilege 15 chahiye, isliye group <code>ansible_become: true</code> aur <code>ansible_become_method: enable</code> use karta hai, par <code>ansible_become_password</code> mein login password hai, enable password nahi. Kisi bhi become setting ke bina low-privilege account pehle ruk jaata hai aise message ke saath jo kehta hai ki configuration mode ko privilege level 15 chahiye. Ticket enable password deta hai:</p>
<pre class="code">AUTO01$ sed -i 's/ansible_become_password: NK@2026/ansible_become_password: NKen@2026/' group_vars/eos.yml
AUTO01$ ansible-playbook site.yml</pre>
<pre class="out"><span class="hl">changed: [E1cli]</span>
fatal: [E1api]: UNREACHABLE! =&gt; ...</pre>

<h3>Fault 4: SSL par eAPI (E1api)</h3>
<p>Pehla error port <b>80</b> par <i>Connection refused</i> tha: <code>httpapi</code> default mein SSL nahi use karta, par switch eAPI 443 par sunta hai. SSL on karo aur dobara chalao:</p>
<pre class="code">AUTO01$ echo 'ansible_httpapi_use_ssl: true' &gt;&gt; group_vars/eosapi.yml
AUTO01$ ansible-playbook site.yml</pre>
<pre class="out">fatal: [E1api]: UNREACHABLE! =&gt; {"changed": false, "msg": "Could not connect to h&#116;tps://10.99.0.21:443/command-api: &lt;urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: <span class="hl">self-signed certificate</span> (_ssl.c:1007)&gt;", "unreachable": true}</pre>
<p>Progress: port sahi hai aur TLS ab shuru hota hai, par switch certificate <b>self-signed</b> hai aur default verify karna hai. Lab mein hum use accept karte hain; real equipment par woh authority AUTO01 par install karte ho jisne use sign kiya:</p>
<pre class="code">AUTO01$ echo 'ansible_httpapi_validate_certs: false' &gt;&gt; group_vars/eosapi.yml
AUTO01$ ansible-playbook site.yml</pre>
<pre class="out">TASK [NTP and syslog on EOS] **************************************************
ok: [E1cli]
ok: [E1api]
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
J1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
E1cli                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
E1api                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>
<p>Ek baar aur chalao: chaaron <code>changed=0</code> rehte hain. Dono EOS entries alag transports se ek hi switch tak pahunchti hain aur sehmat hain.</p>

<h3>Message se cause ki table</h3>
<table class="cmp"><tr><th>Message</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Unable to automatically determine host network os</td><td><code>ansible_network_os</code> gayab</td><td>Platform group mein jodo</td></tr>
<tr><td>Connection type ssh is not valid for this module</td><td>Network module par plain SSH plugin</td><td>network_cli, netconf ya httpapi</td></tr>
<tr><td>failed to elevate privilege to enable mode</td><td>Galat ya gayab enable password</td><td><code>ansible_become_password</code> theek karo</td></tr>
<tr><td>Could not connect to ...:80 ... Connection refused</td><td>SSL ke bina httpapi</td><td><code>ansible_httpapi_use_ssl: true</code></td></tr>
<tr><td>CERTIFICATE_VERIFY_FAILED ... self-signed certificate</td><td>Untrusted device certificate</td><td>CA par bharosa karo, ya (lab) <code>validate_certs: false</code></td></tr>
<tr><td>Could not connect to ... Unauthorized</td><td>Galat eAPI user ya password</td><td><code>ansible_user</code> aur <code>ansible_password</code> theek karo</td></tr>
<tr><td>Authentication failed (UNREACHABLE)</td><td>Galat NETCONF login</td><td>Credentials theek karo</td></tr>
<tr><td>Unable to connect to port 830</td><td>Junos par NETCONF service on nahi</td><td><code>set system services netconf ssh</code></td></tr></table>

<div class="note"><p><b>In the lab vs on real gear.</b> Is lab mein <code>network_cli</code> par dead host ya galat password <i>unable to open shell. Please see: ...#category-unable-to-open-shell</i> FAILED ki tarah print hota hai. Real ansible-core aksar galat password ko UNREACHABLE aur <i>Authentication failed.</i> ke saath batata hai, isliye recap column alag ho sakta hai. Aur yahan <code>-vvv</code> sirf version aur config file print karta hai; real gear par woh poora connection trace print karta hai, jo aapka sabse kaam ka debugging tool hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Output ke aakhri host ka symptom theek karke ruk jaana. Ek fix aksar bas ek layer aage le jaata hai (port, phir TLS, phir credentials). Har change ke baad dobara chalao aur naya pehla error padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible_connection: ssh</code> aur <code>ansible_connection: local</code> network connections nahi hain. Network modules ko <code>network_cli</code>, <code>netconf</code> ya <code>httpapi</code> chahiye.</p></div>

<div class="scn"><h4>Chaar hosts, chaar alag wajah</h4><p>Migration ke baad weekend job Monday ko 12 devices par fail hui. Engineer ne failures ko naam se nahi, message se group kiya: 7 the <i>Unable to automatically determine host network os</i> (naya group bina variable ke), 3 the port 80 par <i>Connection refused</i> (SSL ke bina httpapi), 2 the <i>Authentication failed</i> (NETCONF password rotate hua tha). Teen variable edits ne baarah hosts theek kiye.</p><p><b>Lesson:</b> failures ko message se group karo. Message layer ka naam batata hai.</p></div>
<div class="iv"><p class="q">"Ansible job kuch switches se connect nahi kar paati. Shuru kaise karoge?"</p><p>Main exact message padhta hoon aur dekhta hoon FAILED hai ya UNREACHABLE, <code>ansible-inventory --host</code> se merged variables check karta hoon, message se match karte option ke liye connection plugin docs padhta hoon, ek variable badalta hoon aur <code>-l</code> se ek host par dobara chalata hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FAILED matlab module ya plugin ne shikayat ki; UNREACHABLE matlab connection nahi bana.</li>
<li>Network OS gayab, galat plugin, enable password aur certificate chaar classic wajah hain.</li>
<li>httpapi ko <code>use_ssl: true</code> aur trusted (ya lab mein unchecked) certificate chahiye.</li>
<li>Har run mein ek variable theek karo; har baar naya pehla error padho.</li>
<li>Shared cause dhoondhne ke liye failures ko message se group karo.</li></ul></div>
`}};export{e as default};