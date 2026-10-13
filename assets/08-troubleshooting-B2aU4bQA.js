var e={id:`troubleshooting`,h:{en:`Troubleshooting your first runs: a workflow for red text`,hi:`Pehle runs ki troubleshooting: laal text ke liye workflow`},body:{en:`
<p>Every beginner sees red error text within the first hour. That is normal, and it is also useful: Ansible errors are usually precise if you know where to look. The trick is to <b>ask the right question in the right order</b>, from the cheapest check to the most expensive. A doctor takes your temperature before ordering an MRI; do the same.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Troubleshooting ladder from syntax to device">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="35" y="34" class="svg-ink" font-size="13">1  Read the FIRST error line (not the last). What kind is it?</text>
<rect x="20" y="58" width="600" height="38" rx="8" fill="#fde68a"/><text x="35" y="82" class="svg-ink" font-size="13">2  Syntax: ansible-playbook file.yml --syntax-check</text>
<rect x="20" y="106" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="35" y="130" class="svg-ink" font-size="13">3  Inventory: ansible-inventory --graph  (is the host there? right folder?)</text>
<rect x="20" y="154" width="600" height="38" rx="8" fill="#bae6fd"/><text x="35" y="178" class="svg-ink" font-size="13">4  Connection: ansible HOST -m ping  (SUCCESS / FAILED / UNREACHABLE)</text>
<rect x="20" y="202" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="35" y="226" class="svg-ink" font-size="13">5  Module and device: read msg, run the CLI command by hand, add -v</text>
<text x="320" y="260" text-anchor="middle" class="svg-muted" font-size="12">stop at the first rung that explains the problem</text>
</svg><p class="cap">Work down the ladder; most problems are solved on rung 2, 3 or 4.</p></div>

<h3>Rung 2: syntax and structure errors (before anything runs)</h3>
<p>These appear instantly, before any device is contacted, and always name a file, a line and a column. Three samples from the lab:</p>
<pre class="out">AUTO01$ ansible-playbook bad2.yml --syntax-check
ERROR! We were unable to read either as JSON nor YAML, these are the errors we got from each:
JSON: Expecting value: line 1 column 1 (char 0)

Syntax Error while loading YAML.
  could not find expected ':' (every line in a mapping needs 'key: value')

The error appears to be in '/home/netadmin/netauto/bad2.yml': line 3, column 12, but may
be elsewhere in the file depending on the exact syntax problem.

The offending line appears to be:

- name: Missing colon
  hosts all
           <span class="hl">^ here</span>

AUTO01$ ansible-playbook bad1.yml --syntax-check
<span class="hl">ERROR! conflicting action statements: cisco.ios.ios_config, lines</span>

AUTO01$ ansible-playbook bad3.yml --syntax-check
<span class="hl">ERROR! couldn't resolve module/action 'cisco.ios.ios_conf'.</span> This often indicates a misspelling, missing collection, or incorrect module path.</pre>
<p>(Each message continues with the file name, line, column and an excerpt.) The first is a missing colon after <code>hosts</code>. The second means <code>lines:</code> was indented at the same level as the module name, so Ansible saw two actions in one task: indent it under the module. The third is a typo in the module name. The caret <code>^ here</code> marks where the parser gave up; the real mistake is often on that line or the one above.</p>

<h3>Rung 3: inventory problems</h3>
<pre class="out">AUTO01$ ansible all -m ping
[WARNING]: provided hosts list is empty, only localhost is available. Note that the implicit localhost does not match 'all'
[WARNING]: No hosts matched, nothing to do</pre>
<p>This means Ansible found no inventory: wrong folder (so <code>ansible.cfg</code> was not read), wrong path in <code>inventory =</code>, or a pattern that names a group that does not exist. Run <code>ansible --version</code> to see the active config file and <code>ansible-inventory --graph</code> to see the hosts.</p>

<h3>Rung 4: connection problems</h3>
<p>Here the exact word matters.</p>
<table class="cmp"><tr><th>What you see</th><th>Likely cause</th><th>Fix</th></tr>
<tr><td><code>not found in known_hosts</code></td><td>First SSH connection not trusted</td><td>Add keys with ssh-keyscan; lab: <code>host_key_checking = False</code></td></tr>
<tr><td><code>Authentication failed for user netops</code></td><td>Wrong <code>ansible_user</code> or <code>ansible_password</code>, or the account does not exist</td><td>Fix the variable; test the login by hand with SSH</td></tr>
<tr><td><code>UNREACHABLE ... Connection timed out</code></td><td>Wrong <code>ansible_host</code>, routing or firewall</td><td>Check the address, ping and SSH from the control node</td></tr>
<tr><td><code>Unable to automatically determine the network OS</code></td><td><code>ansible_network_os</code> missing</td><td>Add <code>ansible_network_os=cisco.ios.ios</code></td></tr></table>
<pre class="out">AUTO01$ ansible all -m ping
pun-core-r1 | FAILED! =&gt; {
    "changed": false,
    <span class="hl">"msg": "ssh connection failed: Authentication failed for user netops"</span>
}
...

AUTO01$ ansible all -m ping
pun-core-r1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
blr-edge-r2 | <span class="hl">UNREACHABLE!</span> =&gt; {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}
pun-acc-sw1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<p>(First block: every device failed because the password in the inventory was wrong. Second block: only one device failed, because its <code>ansible_host</code> was a wrong address.) The wording of these messages differs between Ansible versions and connection types, so always read the <code>msg</code> text rather than relying on whether the word UNREACHABLE or FAILED appears.</p>

<h3>Rung 5: module and device errors</h3>
<p>When login works but a task fails, the message comes from the module or from the device CLI.</p>
<pre class="out">fatal: [pun-core-r1]: FAILED! =&gt; {"changed": false, "msg": "<span class="hl">Unsupported parameters for (cisco.ios.ios_config) module: line.</span> Supported parameters include: after, backup, backup_options, before, defaults, diff_against, diff_ignore_lines, intended_config, lines, match, multiline_delimiter, parents, replace, running_config, save_when, src."}
...
NO MORE HOSTS LEFT ************************************************************

PLAY RECAP ********************************************************************
pun-core-r1                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0</pre>
<p>(Output shortened.) The option was spelled <code>line</code> instead of <code>lines</code>, and the module politely lists every valid option. When the message comes from the router, such as <code>% Invalid input detected at '^' marker</code>, type that command on the device by hand: the CLI is the final judge. <code>ansible-doc -s cisco.ios.ios_config</code> prints a snippet with the valid options, and adding <code>-v</code> to a run shows the full module result, including the commands that were sent.</p>

<div class="eg"><p><b>Worked ticket.</b> "Ansible cannot reach the Bengaluru router." You run <code>ansible all -m ping</code>: Pune answers, <code>blr-edge-r2</code> is UNREACHABLE with a timeout. Rung 3: <code>ansible-inventory --host blr-edge-r2</code> shows <code>ansible_host: 10.99.0.99</code>, but the router is 10.99.0.2. Someone mistyped the address. You correct the inventory, ping again and get pong. Total time: two minutes, no guessing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading only the bottom of the output. The recap tells you <i>which</i> host failed, but the real reason is in the first <code>fatal:</code> line above it. Another: changing three things at once, then not knowing which one helped. Change one thing, re-run.</p></div>
<div class="exam"><p><b>Exam trap.</b> UNREACHABLE means Ansible could not establish the connection at all; FAILED means it connected and the task failed. Do not mix them when you describe a fault. And remember the order: syntax, inventory, connection, then module.</p></div>

<div class="scn"><h4>Works for Pune, silent for Bengaluru</h4><p>On a Monday, a scheduled playbook skipped one router. The recap listed <code>unreachable=1</code> for the edge router. The engineer followed the ladder: syntax was fine, the inventory listed the host, but a ping timed out. A manual SSH from the control node also hung. The cause was a firewall change on the WAN link, not Ansible. Once the network team restored the rule, the same playbook ran clean.</p><p><b>Lesson:</b> if SSH by hand fails, Ansible will fail too. Test the lowest layer first.</p></div>

<div class="iv"><p class="q">"A playbook fails with UNREACHABLE. How do you troubleshoot?"</p><p>I confirm the inventory address with <code>ansible-inventory --host</code>, ping the device from the control node, and try SSH by hand to see whether it is routing, a firewall, or credentials. Only then do I look at Ansible variables such as <code>ansible_host</code>, <code>ansible_user</code>, <code>ansible_network_os</code>, and add <code>-vvv</code> for connection detail. Mention that unreachable and failed are different states.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work from cheap to expensive: first error line, syntax, inventory, connection, module and device.</li>
<li>Syntax errors name file, line and column; the real mistake is often one line above the caret.</li>
<li>"No hosts matched" means wrong folder, wrong inventory path or wrong pattern.</li>
<li>known_hosts, authentication and timeout errors are three different connection problems.</li>
<li>If SSH by hand fails, fix that first; change one thing at a time.</li>
</ul></div>
`,hi:`
<p>Har beginner ko pehle ghante mein laal error text dikhta hai. Yeh normal hai, aur kaam ka bhi: Ansible ke errors aam taur par precise hote hain agar aapko pata ho kahan dekhna hai. Trick hai <b>sahi sawaal sahi order mein poochna</b>, sabse sasti jaanch se sabse mehngi tak. Doctor MRI se pehle temperature naapta hai; aap bhi aisa hi karo.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Syntax se device tak troubleshooting seedhi">
<rect x="20" y="10" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="35" y="34" class="svg-ink" font-size="13">1  PEHLI error line padho (aakhri nahi). Kis type ka error hai?</text>
<rect x="20" y="58" width="600" height="38" rx="8" fill="#fde68a"/><text x="35" y="82" class="svg-ink" font-size="13">2  Syntax: ansible-playbook file.yml --syntax-check</text>
<rect x="20" y="106" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="35" y="130" class="svg-ink" font-size="13">3  Inventory: ansible-inventory --graph  (host hai? sahi folder?)</text>
<rect x="20" y="154" width="600" height="38" rx="8" fill="#bae6fd"/><text x="35" y="178" class="svg-ink" font-size="13">4  Connection: ansible HOST -m ping  (SUCCESS / FAILED / UNREACHABLE)</text>
<rect x="20" y="202" width="600" height="38" rx="8" fill="#ddd6fe"/><text x="35" y="226" class="svg-ink" font-size="13">5  Module aur device: msg padho, CLI command haath se chalao, -v lagao</text>
<text x="320" y="260" text-anchor="middle" class="svg-muted" font-size="12">pehle us rung par ruko jo problem samjha de</text>
</svg><p class="cap">Seedhi se neeche utro; zyadatar problems rung 2, 3 ya 4 par solve ho jaati hain.</p></div>

<h3>Rung 2: syntax aur structure errors (kuch chalne se pehle)</h3>
<p>Yeh turant aate hain, kisi device ko contact karne se pehle, aur hamesha file, line aur column ka naam dete hain. Lab ke teen namune:</p>
<pre class="out">AUTO01$ ansible-playbook bad2.yml --syntax-check
ERROR! We were unable to read either as JSON nor YAML, these are the errors we got from each:
JSON: Expecting value: line 1 column 1 (char 0)

Syntax Error while loading YAML.
  could not find expected ':' (every line in a mapping needs 'key: value')

The error appears to be in '/home/netadmin/netauto/bad2.yml': line 3, column 12, but may
be elsewhere in the file depending on the exact syntax problem.

The offending line appears to be:

- name: Missing colon
  hosts all
           <span class="hl">^ here</span>

AUTO01$ ansible-playbook bad1.yml --syntax-check
<span class="hl">ERROR! conflicting action statements: cisco.ios.ios_config, lines</span>

AUTO01$ ansible-playbook bad3.yml --syntax-check
<span class="hl">ERROR! couldn't resolve module/action 'cisco.ios.ios_conf'.</span> This often indicates a misspelling, missing collection, or incorrect module path.</pre>
<p>(Har message aage file name, line, column aur excerpt ke saath jaata hai.) Pehla <code>hosts</code> ke baad colon missing hai. Doosre ka matlab <code>lines:</code> module name ke barabar level par indent tha, to Ansible ko ek task mein do actions dikhe: use module ke neeche indent karo. Teesra module name mein typo hai. Caret <code>^ here</code> woh jagah batata hai jahan parser ne haath khade kiye; asli galti aksar usi line ya uske upar wali line mein hoti hai.</p>

<h3>Rung 3: inventory problems</h3>
<pre class="out">AUTO01$ ansible all -m ping
[WARNING]: provided hosts list is empty, only localhost is available. Note that the implicit localhost does not match 'all'
[WARNING]: No hosts matched, nothing to do</pre>
<p>Matlab Ansible ko koi inventory nahi mili: galat folder (to <code>ansible.cfg</code> padhi hi nahi gayi), <code>inventory =</code> mein galat path, ya aisa pattern jo exist na karne wale group ka naam leta hai. Active config file dekhne ke liye <code>ansible --version</code> aur hosts dekhne ke liye <code>ansible-inventory --graph</code> chalao.</p>

<h3>Rung 4: connection problems</h3>
<p>Yahan exact shabd matter karta hai.</p>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Mumkin wajah</th><th>Fix</th></tr>
<tr><td><code>not found in known_hosts</code></td><td>Pehla SSH connection trusted nahi</td><td>ssh-keyscan se keys jodo; lab: <code>host_key_checking = False</code></td></tr>
<tr><td><code>Authentication failed for user netops</code></td><td>Galat <code>ansible_user</code> ya <code>ansible_password</code>, ya account hai hi nahi</td><td>Variable theek karo; SSH se haath se login test karo</td></tr>
<tr><td><code>UNREACHABLE ... Connection timed out</code></td><td>Galat <code>ansible_host</code>, routing ya firewall</td><td>Address check karo, control node se ping aur SSH karo</td></tr>
<tr><td><code>Unable to automatically determine the network OS</code></td><td><code>ansible_network_os</code> missing</td><td><code>ansible_network_os=cisco.ios.ios</code> jodo</td></tr></table>
<pre class="out">AUTO01$ ansible all -m ping
pun-core-r1 | FAILED! =&gt; {
    "changed": false,
    <span class="hl">"msg": "ssh connection failed: Authentication failed for user netops"</span>
}
...

AUTO01$ ansible all -m ping
pun-core-r1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
blr-edge-r2 | <span class="hl">UNREACHABLE!</span> =&gt; {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}
pun-acc-sw1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}</pre>
<p>(Pehla block: har device fail hua kyunki inventory ka password galat tha. Doosra block: sirf ek device fail hua, kyunki uska <code>ansible_host</code> galat address tha.) In messages ke shabd Ansible versions aur connection types ke beech alag hote hain, isliye UNREACHABLE ya FAILED shabd par nirbhar hone ki jagah hamesha <code>msg</code> text padho.</p>

<h3>Rung 5: module aur device errors</h3>
<p>Login chalta ho par task fail ho to message module ya device CLI se aata hai.</p>
<pre class="out">fatal: [pun-core-r1]: FAILED! =&gt; {"changed": false, "msg": "<span class="hl">Unsupported parameters for (cisco.ios.ios_config) module: line.</span> Supported parameters include: after, backup, backup_options, before, defaults, diff_against, diff_ignore_lines, intended_config, lines, match, multiline_delimiter, parents, replace, running_config, save_when, src."}
...
NO MORE HOSTS LEFT ************************************************************

PLAY RECAP ********************************************************************
pun-core-r1                : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0</pre>
<p>(Output chhota kiya gaya.) Option <code>lines</code> ki jagah <code>line</code> likha gaya tha, aur module tameez se saare valid options list karta hai. Jab message router se aaye, jaise <code>% Invalid input detected at '^' marker</code>, woh command device par haath se type karo: CLI aakhri faisla karta hai. <code>ansible-doc -s cisco.ios.ios_config</code> valid options ka snippet print karta hai, aur run mein <code>-v</code> lagane se poora module result dikhta hai, bheji gayi commands samet.</p>

<div class="eg"><p><b>Worked ticket.</b> "Ansible Bengaluru router tak nahi pahunch raha." Aap <code>ansible all -m ping</code> chalate ho: Pune jawab deta hai, <code>blr-edge-r2</code> timeout ke saath UNREACHABLE hai. Rung 3: <code>ansible-inventory --host blr-edge-r2</code> <code>ansible_host: 10.99.0.99</code> dikhata hai, jabki router 10.99.0.2 hai. Kisi ne address galat type kiya. Aap inventory theek karte ho, dobara ping karte ho aur pong milta hai. Total time: do minute, koi andaza nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf output ka neeche wala hissa padhna. Recap batata hai <i>kaunsa</i> host fail hua, par asli wajah uske upar pehli <code>fatal:</code> line mein hoti hai. Ek aur: teen cheezein ek saath badalna, phir pata na hona kisne madad ki. Ek cheez badlo, dobara chalao.</p></div>
<div class="exam"><p><b>Exam trap.</b> UNREACHABLE matlab Ansible connection hi establish nahi kar paya; FAILED matlab connect hua aur task fail hua. Fault batate waqt inhe mix mat karo. Aur order yaad rakho: syntax, inventory, connection, phir module.</p></div>

<div class="scn"><h4>Pune ke liye chalta hai, Bengaluru chup hai</h4><p>Ek Monday ko scheduled playbook ek router chhod gaya. Recap ne edge router ke liye <code>unreachable=1</code> dikhaya. Engineer ne seedhi follow ki: syntax theek tha, inventory mein host tha, par ping timeout hua. Control node se manual SSH bhi atak gaya. Wajah WAN link par firewall change thi, Ansible nahi. Network team ne rule wapas kiya to wahi playbook saaf chala.</p><p><b>Lesson:</b> haath se SSH fail ho to Ansible bhi fail hoga. Sabse neeche ki layer pehle test karo.</p></div>

<div class="iv"><p class="q">"Playbook UNREACHABLE se fail hota hai. Troubleshoot kaise karoge?"</p><p>Main <code>ansible-inventory --host</code> se inventory address confirm karta hoon, control node se device ko ping karta hoon, aur haath se SSH try karta hoon ki routing, firewall ya credentials mein se kya hai. Tabhi <code>ansible_host</code>, <code>ansible_user</code>, <code>ansible_network_os</code> jaise Ansible variables dekhta hoon aur connection detail ke liye <code>-vvv</code> lagata hoon. Batao ki unreachable aur failed alag states hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sasti se mehngi jaanch tak: pehli error line, syntax, inventory, connection, module aur device.</li>
<li>Syntax errors file, line aur column batate hain; asli galti aksar caret se ek line upar hoti hai.</li>
<li>"No hosts matched" matlab galat folder, galat inventory path ya galat pattern.</li>
<li>known_hosts, authentication aur timeout errors teen alag connection problems hain.</li>
<li>Haath se SSH fail ho to pehle wahi theek karo; ek baar mein ek cheez badlo.</li>
</ul></div>
`}};export{e as default};