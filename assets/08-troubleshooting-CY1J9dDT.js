var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: UNREACHABLE, FAILED and YAML errors`,hi:`Troubleshooting workflow: UNREACHABLE, FAILED aur YAML errors`},body:{en:`

<p><b>One idea in this chapter:</b> Ansible's error messages are specific. The first word tells you which layer broke: the file, the target list, the connection or the task. Fix layer by layer from the outside in.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Ansible troubleshooting loop: identify the error word, check the files, test the login, then fix and rerun on one host."><rect x="10" y="28" width="128" height="68" rx="10" fill="#bae6fd"/><text x="74" y="58" text-anchor="middle" class="svg-ink" font-size="14">1. Read error</text><text x="74" y="78" text-anchor="middle" class="svg-muted" font-size="12">which word?</text><line x1="138" y1="62" x2="168" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="168,57 174,62 168,67" fill="#64748b"/><rect x="174" y="28" width="128" height="68" rx="10" fill="#bbf7d0"/><text x="238" y="58" text-anchor="middle" class="svg-ink" font-size="14">2. Check files</text><text x="238" y="78" text-anchor="middle" class="svg-muted" font-size="12">syntax, hosts</text><line x1="302" y1="62" x2="332" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="332,57 338,62 332,67" fill="#64748b"/><rect x="338" y="28" width="128" height="68" rx="10" fill="#fde68a"/><text x="402" y="58" text-anchor="middle" class="svg-ink" font-size="14">3. Test login</text><text x="402" y="78" text-anchor="middle" class="svg-muted" font-size="12">ping module</text><line x1="466" y1="62" x2="496" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="496,57 502,62 496,67" fill="#64748b"/><rect x="502" y="28" width="128" height="68" rx="10" fill="#ddd6fe"/><text x="566" y="58" text-anchor="middle" class="svg-ink" font-size="14">4. Fix, rerun</text><text x="566" y="78" text-anchor="middle" class="svg-muted" font-size="12">one host first</text></svg><p class="cap">Ansible troubleshooting loop: identify the error word, check the files, test the login, then fix and rerun on one host.</p></div>

<h3>Which word are you looking at?</h3>
<table class="cmp"><tr><th>You see</th><th>Layer</th><th>Usual cause</th></tr><tr><td>ERROR! YAML syntax error</td><td>file</td><td>indentation or a missing space</td></tr><tr><td>ERROR! couldn't resolve module/action</td><td>file</td><td>misspelled module name</td></tr><tr><td>could not be found / WARNING: Could not match supplied host pattern</td><td>target list</td><td>wrong file name or group name</td></tr><tr><td>UNREACHABLE!</td><td>connection</td><td>wrong IP, no route, SSH off, firewall</td></tr><tr><td>FAILED! (login)</td><td>authentication</td><td>wrong username or password</td></tr><tr><td>FAILED! (task)</td><td>task</td><td>the device rejected the command, or bad parameters</td></tr></table>

<h3>Layer 1: the file does not load</h3>
<p>Ansible stops before it connects anywhere. Use the safe check first:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --syntax-check</pre>
<p>Case A, a YAML indentation slip (the line <code>ios_config:</code> was moved one space to the left):</p>
<pre class="out">ERROR! YAML syntax error while loading '/home/netops/t3.yml'
  bad indentation of a sequence entry (this line is indented more than the list item above it)

Error location: line 10, column 6 (the real mistake may be on this line or just above it)

The offending line:

    - name: Point NTP and syslog at the NOC server
     ios_config:
     ^ here</pre>
<p>Compare the leading spaces of the offending line with the line above it. Fix, run <code>yaml validate FILE</code> and syntax-check again.</p>
<p>Case B, a misspelled module (<code>ios_confg</code>):</p>
<pre class="out">ERROR! couldn't resolve module/action 'ios_confg'. This usually means the module name is misspelled or the collection is not installed

The error appears in '/home/netops/t2.yml' (line 9).</pre>
<p>The message names the bad word and the line. Check the spelling against <code>ansible-doc</code> or the module table in chapter 4.</p>

<h3>Layer 2: the target list is empty or wrong</h3>
<p>A playbook that matches no hosts does not fail loudly. It prints a warning and an empty recap. Here <code>hosts: router</code> was typed instead of <code>routers</code>:</p>
<pre class="out">[WARNING]: Could not match supplied host pattern, ignoring: router
PLAY [Standard time and logging] **********************************************
skipping: no hosts matched

PLAY RECAP ********************************************************************</pre>
<p>An empty PLAY RECAP means nothing ran. Always glance for hosts in the recap. <code>--list-hosts</code> shows the same problem before you run. A mistyped playbook file name gives:</p>
<pre class="out">ERROR! the playbook: bad.yml could not be found</pre>

<h3>Layer 3: the connection fails</h3>
<p>This is the Lab 1 ticket. The ping module is the quickest test, so use it before editing anything:</p>
<pre class="code">ansible routers -i inventory.ini -m ping</pre>
<pre class="out">R1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
R2 | <span class="hl">UNREACHABLE!</span> =&gt; {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}</pre>
<p>R1 works, R2 does not. Same credentials, same playbook, so the difference is R2's own line in the inventory. <code>ansible-inventory -i inventory.ini --host R2</code> shows <code>ansible_host</code> as 10.99.0.21, but the router is 10.99.0.2. A one-line fix:</p>
<pre class="code">sed -i 's/10.99.0.21/10.99.0.2/' inventory.ini
ansible routers -i inventory.ini -m ping</pre>
<p>Both routers answer pong. If the address had been right but a firewall or a missing route was the cause, you would test from the control node with an ordinary ping and ssh to the same address, which is how you separate network problems from Ansible problems.</p>

<h3>Layer 4: login or task fails</h3>
<p>When the connection opens but the login is refused, the word changes from UNREACHABLE to FAILED. The inventory password was altered to a wrong value for this example:</p>
<pre class="out">R1 | <span class="hl">FAILED!</span> =&gt; {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user netops"
}
R2 | <span class="hl">FAILED!</span> =&gt; {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user netops"
}</pre>
<p>"Authentication failed for user netops" means the username or the password is wrong, not the address. Check <code>ansible_user</code> and the password source (the vault, a prompt or a CI variable). Take care with repeated attempts: several wrong logins can lock an account or trigger a security alert on real devices. If login works and a task fails, run with <code>-v</code> to see the message, and compare the module parameters with <code>ansible-doc MODULE</code>.</p>

<h3>The loop, step by step</h3>
<ol>
<li>Read the first error word and the line number it gives.</li>
<li><code>--syntax-check</code> and <code>yaml validate</code> for file problems.</li>
<li><code>--list-hosts</code> for target problems.</li>
<li><code>ansible GROUP -m ping</code> for connection and login problems.</li>
<li>Fix one thing, rerun with <code>-l</code> on one host, read the recap, then run on everyone.</li>
<li>Confirm with a second run: <code>changed=0</code>.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A colleague says "the NTP playbook does nothing". You run it: the recap is empty and a warning says it could not match host pattern "router". The playbook has hosts: router, the group is routers. You fix the s, run --list-hosts (two hosts), run the playbook, and the recap shows changed=1 for each. The "failure" was a typo, found in under two minutes by reading the warning.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Changing several things at once, so you cannot tell which fix worked. Retrying a wrong password many times. Assuming a silent run means success when the recap is empty. Fixing the device by hand instead of fixing the playbook or data, so the next run undoes the fix.</p></div>
<div class="exam"><p><b>Exam trap.</b> UNREACHABLE is a connection failure (address, route, SSH). FAILED is a connection that worked but an authentication or task error. An empty recap with a host-pattern warning means the group name is wrong. A YAML error is reported before any device is contacted.</p></div>

<div class="scn"><h4>Twenty-nine pongs and one timeout</h4><p>On the morning of a change an engineer found one branch router UNREACHABLE while 29 others answered. He checked the inventory line first: the address had a stray digit from a copy-and-paste. Two minutes later, the ping was clean and the playbook ran. A teammate who had started to open a ticket with the carrier was glad the engineer had read the message "ssh connect failed: Connection timed out" together with the inventory.</p><p><b>Lesson:</b> a timeout on one host is usually an inventory or reachability issue, not a platform fault.</p></div>
<div class="iv"><p class="q">"A playbook run shows UNREACHABLE for one device. How do you troubleshoot?"</p><p>UNREACHABLE means Ansible could not open the SSH connection. I confirm the device name and ansible_host in the inventory with ansible-inventory --host, test from the control node with ping and ssh to separate network problems from Ansible ones, check that SSH is enabled and ACLs allow the control node, then rerun the ping module. If the message is FAILED with authentication failed, I check credentials instead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>The first error word identifies the layer: file, target list, connection or task.</li><li>YAML and module-name errors appear before any device is contacted; use --syntax-check and yaml validate.</li><li>An empty PLAY RECAP with a host-pattern warning means the group name is wrong.</li><li>UNREACHABLE is address or connectivity; FAILED with authentication is credentials.</li><li>Fix one thing at a time, pilot with -l, and confirm with a second run that shows changed=0.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> Ansible ke error messages specific hote hain. Pehla word batata hai ki kaun si layer tooti: file, target list, connection ya task. Bahar se andar ki taraf layer by layer fix karo.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Ansible troubleshooting loop: error word pehchano, files check karo, login test karo, phir fix karke ek host par dobara chalao."><rect x="10" y="28" width="128" height="68" rx="10" fill="#bae6fd"/><text x="74" y="58" text-anchor="middle" class="svg-ink" font-size="14">1. Error padho</text><text x="74" y="78" text-anchor="middle" class="svg-muted" font-size="12">kaun sa word?</text><line x1="138" y1="62" x2="168" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="168,57 174,62 168,67" fill="#64748b"/><rect x="174" y="28" width="128" height="68" rx="10" fill="#bbf7d0"/><text x="238" y="58" text-anchor="middle" class="svg-ink" font-size="14">2. Files check</text><text x="238" y="78" text-anchor="middle" class="svg-muted" font-size="12">syntax, hosts</text><line x1="302" y1="62" x2="332" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="332,57 338,62 332,67" fill="#64748b"/><rect x="338" y="28" width="128" height="68" rx="10" fill="#fde68a"/><text x="402" y="58" text-anchor="middle" class="svg-ink" font-size="14">3. Login test</text><text x="402" y="78" text-anchor="middle" class="svg-muted" font-size="12">ping module</text><line x1="466" y1="62" x2="496" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="496,57 502,62 496,67" fill="#64748b"/><rect x="502" y="28" width="128" height="68" rx="10" fill="#ddd6fe"/><text x="566" y="58" text-anchor="middle" class="svg-ink" font-size="14">4. Fix, dobara</text><text x="566" y="78" text-anchor="middle" class="svg-muted" font-size="12">pehle ek host</text></svg><p class="cap">Ansible troubleshooting loop: identify the error word, check the files, test the login, then fix and rerun on one host.</p></div>

<h3>Aap kaun sa word dekh rahe ho?</h3>
<table class="cmp"><tr><th>Aap dekhte ho</th><th>Layer</th><th>Aam wajah</th></tr><tr><td>ERROR! YAML syntax error</td><td>file</td><td>indentation ya missing space</td></tr><tr><td>ERROR! couldn't resolve module/action</td><td>file</td><td>module ka naam galat likha</td></tr><tr><td>could not be found / WARNING: Could not match supplied host pattern</td><td>target list</td><td>file ya group ka naam galat</td></tr><tr><td>UNREACHABLE!</td><td>connection</td><td>galat IP, route nahi, SSH off, firewall</td></tr><tr><td>FAILED! (login)</td><td>authentication</td><td>galat username ya password</td></tr><tr><td>FAILED! (task)</td><td>task</td><td>device ne command reject kiya, ya parameters galat</td></tr></table>

<h3>Layer 1: file load nahi hoti</h3>
<p>Ansible kahin connect karne se pehle hi ruk jaata hai. Pehle safe check use karo:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --syntax-check</pre>
<p>Case A, YAML indentation ki chook (<code>ios_config:</code> line ek space baayein khisak gayi):</p>
<pre class="out">ERROR! YAML syntax error while loading '/home/netops/t3.yml'
  bad indentation of a sequence entry (this line is indented more than the list item above it)

Error location: line 10, column 6 (the real mistake may be on this line or just above it)

The offending line:

    - name: Point NTP and syslog at the NOC server
     ios_config:
     ^ here</pre>
<p>Offending line ke shuru ke spaces ko upar wali line se compare karo. Fix karo, <code>yaml validate FILE</code> chalao aur dobara syntax-check.</p>
<p>Case B, galat likha module (<code>ios_confg</code>):</p>
<pre class="out">ERROR! couldn't resolve module/action 'ios_confg'. This usually means the module name is misspelled or the collection is not installed

The error appears in '/home/netops/t2.yml' (line 9).</pre>
<p>Message galat word aur line batata hai. Spelling ko <code>ansible-doc</code> ya chapter 4 ki module table se check karo.</p>

<h3>Layer 2: target list khaali ya galat</h3>
<p>Jo playbook kisi host ko match nahi karta woh zor se fail nahi hota. Woh warning aur khaali recap print karta hai. Yahan <code>routers</code> ke bajaye <code>hosts: router</code> type hua tha:</p>
<pre class="out">[WARNING]: Could not match supplied host pattern, ignoring: router
PLAY [Standard time and logging] **********************************************
skipping: no hosts matched

PLAY RECAP ********************************************************************</pre>
<p>Khaali PLAY RECAP matlab kuch chala hi nahi. Recap mein hosts dekhne ki aadat daalo. <code>--list-hosts</code> chalane se pehle hi wahi problem dikha deta hai. Playbook file ka naam galat type hone par:</p>
<pre class="out">ERROR! the playbook: bad.yml could not be found</pre>

<h3>Layer 3: connection fail</h3>
<p>Yeh Lab 1 ka ticket hai. Ping module sabse tez test hai, isliye kuch edit karne se pehle use chalao:</p>
<pre class="code">ansible routers -i inventory.ini -m ping</pre>
<pre class="out">R1 | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
R2 | <span class="hl">UNREACHABLE!</span> =&gt; {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}</pre>
<p>R1 chalta hai, R2 nahi. Credentials same, playbook same, isliye farq R2 ki apni inventory line mein hai. <code>ansible-inventory -i inventory.ini --host R2</code> <code>ansible_host</code> 10.99.0.21 dikhata hai, par router 10.99.0.2 hai. Ek line ka fix:</p>
<pre class="code">sed -i 's/10.99.0.21/10.99.0.2/' inventory.ini
ansible routers -i inventory.ini -m ping</pre>
<p>Dono routers pong dete hain. Agar address sahi hota aur wajah firewall ya missing route hoti, to aap control node se usi address par normal ping aur ssh se test karte, yahi tareeka hai network problems ko Ansible problems se alag karne ka.</p>

<h3>Layer 4: login ya task fail</h3>
<p>Jab connection khulta hai par login refuse hota hai, word UNREACHABLE se FAILED ho jaata hai. Is example ke liye inventory password galat value mein badla gaya tha:</p>
<pre class="out">R1 | <span class="hl">FAILED!</span> =&gt; {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user netops"
}
R2 | <span class="hl">FAILED!</span> =&gt; {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user netops"
}</pre>
<p>"Authentication failed for user netops" matlab username ya password galat hai, address nahi. <code>ansible_user</code> aur password ka source (vault, prompt ya CI variable) check karo. Baar-baar koshish se savdhan: asli devices par kai galat logins account lock kar sakte hain ya security alert la sakte hain. Agar login chalta hai aur task fail hota hai, to message dekhne ke liye <code>-v</code> se chalao, aur module parameters ko <code>ansible-doc MODULE</code> se compare karo.</p>

<h3>Loop, step by step</h3>
<ol>
<li>Pehla error word aur woh jo line number deta hai, padho.</li>
<li>File problems ke liye <code>--syntax-check</code> aur <code>yaml validate</code>.</li>
<li>Target problems ke liye <code>--list-hosts</code>.</li>
<li>Connection aur login problems ke liye <code>ansible GROUP -m ping</code>.</li>
<li>Ek cheez fix karo, ek host par <code>-l</code> se dobara chalao, recap padho, phir sabpar chalao.</li>
<li>Doosre run se confirm karo: <code>changed=0</code>.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek colleague kehta hai "NTP playbook kuch nahi karta". Aap chalate ho: recap khaali hai aur warning kehti hai host pattern "router" match nahi hua. Playbook mein hosts: router hai, group routers hai. Aap s theek karte ho, --list-hosts chalate ho (do hosts), playbook chalate ho, aur recap har ek ke liye changed=1 dikhata hai. "Failure" ek typo thi, warning padhkar do minute se kam mein mili.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Ek saath kai cheezein badalna, isliye pata nahi chalta kaun sa fix kaam kiya. Galat password baar-baar try karna. Khaali recap hone par bhi chup run ko success maan lena. Playbook ya data theek karne ke bajaye device par haath se fix karna, jisse agla run fix ko undo kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> UNREACHABLE connection failure hai (address, route, SSH). FAILED woh hai jisme connection chala par authentication ya task error aaya. Host-pattern warning ke saath khaali recap matlab group ka naam galat hai. YAML error kisi device se contact hone se pehle report hota hai.</p></div>

<div class="scn"><h4>Unnees pong aur ek timeout</h4><p>Change ki subah ek engineer ko ek branch router UNREACHABLE mila jabki 29 doosre jawab de rahe the. Usne pehle inventory line check ki: copy-paste se ek faltu digit aa gaya tha. Do minute baad ping saaf tha aur playbook chala. Ek teammate jo carrier ke saath ticket kholne wala tha, khush tha ki engineer ne "ssh connect failed: Connection timed out" message ko inventory ke saath padha.</p><p><b>Lesson:</b> ek host par timeout aam taur par inventory ya reachability issue hota hai, platform fault nahi.</p></div>
<div class="iv"><p class="q">"Playbook run mein ek device UNREACHABLE dikhata hai. Troubleshoot kaise karoge?"</p><p>UNREACHABLE matlab Ansible SSH connection nahi khol saka. Main ansible-inventory --host se inventory mein device naam aur ansible_host confirm karta hoon, control node se ping aur ssh se test karta hoon taaki network problems ko Ansible problems se alag kar sakoon, check karta hoon ki SSH enabled hai aur ACLs control node ko allow karti hain, phir ping module dobara chalata hoon. Agar message authentication failed ke saath FAILED ho, to credentials check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pehla error word layer batata hai: file, target list, connection ya task.</li><li>YAML aur module-name errors kisi device se contact hone se pehle aate hain; --syntax-check aur yaml validate use karo.</li><li>Host-pattern warning ke saath khaali PLAY RECAP matlab group ka naam galat.</li><li>UNREACHABLE address ya connectivity hai; authentication ke saath FAILED credentials hai.</li><li>Ek-ek cheez fix karo, -l se pilot karo, aur doosre run se changed=0 confirm karo.</li></ul></div>

`}};export{e as default};