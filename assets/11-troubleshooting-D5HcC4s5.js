var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: fix the playbook`,hi:`Troubleshooting workflow: playbook theek karo`},body:{en:`
<p>When a car will not start, a good mechanic does not replace the engine first. He checks, in order: is it the right key, does the car accept the key, are the parts compatible, then he drives it, and finally takes a second test drive to be sure. Automation failures deserve the same calm order. Each check takes a minute and rules out a whole class of problems. This chapter walks through Lab 2, <b>Fix the playbook</b>, using that order.</p>

<h3>The ticket</h3>
<p>A teammate wrote <code>site.yml</code> on the controller CTRL to push VLAN 10 SALES, VLAN 20 ENGINEERING, <code>ntp server 10.30.0.100</code> and a login banner to SW1 and SW2, then went on leave. It does not run. The switches were built with user <b>ansible</b> and password <b>NkAuto26</b>. There are three faults: a YAML mistake, wrong inventory credentials and a wrong module parameter.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Six-step Ansible troubleshooting workflow">
<rect x="10" y="20" width="95" height="70" rx="8" fill="#bbf7d0"/><text x="57" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 syntax</text><text x="57" y="70" text-anchor="middle" class="svg-muted" font-size="12">YAML</text>
<rect x="115" y="20" width="95" height="70" rx="8" fill="#bbf7d0"/><text x="162" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 inventory</text><text x="162" y="70" text-anchor="middle" class="svg-muted" font-size="12">variables</text>
<rect x="220" y="20" width="95" height="70" rx="8" fill="#bae6fd"/><text x="267" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 login</text><text x="267" y="70" text-anchor="middle" class="svg-muted" font-size="12">-m ping</text>
<rect x="325" y="20" width="95" height="70" rx="8" fill="#bae6fd"/><text x="372" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 modules</text><text x="372" y="70" text-anchor="middle" class="svg-muted" font-size="12">ansible-doc</text>
<rect x="430" y="20" width="95" height="70" rx="8" fill="#ddd6fe"/><text x="477" y="50" text-anchor="middle" class="svg-ink" font-size="12">5 run</text><text x="477" y="70" text-anchor="middle" class="svg-muted" font-size="12">--check, recap</text>
<rect x="535" y="20" width="95" height="70" rx="8" fill="#fde68a"/><text x="582" y="50" text-anchor="middle" class="svg-ink" font-size="12">6 run again</text><text x="582" y="70" text-anchor="middle" class="svg-muted" font-size="12">changed=0</text>
<line x1="105" y1="55" x2="115" y2="55" stroke="#64748b" stroke-width="2"/><line x1="210" y1="55" x2="220" y2="55" stroke="#64748b" stroke-width="2"/><line x1="315" y1="55" x2="325" y2="55" stroke="#64748b" stroke-width="2"/><line x1="420" y1="55" x2="430" y2="55" stroke="#64748b" stroke-width="2"/><line x1="525" y1="55" x2="535" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="162" y="125" text-anchor="middle" class="svg-muted" font-size="12">on CTRL, no device touched</text>
<text x="372" y="125" text-anchor="middle" class="svg-muted" font-size="12">touches devices, read only</text>
<text x="530" y="125" text-anchor="middle" class="svg-muted" font-size="12">changes and proof</text>
<text x="320" y="158" text-anchor="middle" class="svg-accent" font-size="13">cheapest checks first, one fault at a time</text>
</svg><p class="cap">Work left to right. Each step either passes or points at exactly one kind of fault.</p></div>

<h3>Step 1: syntax check (the YAML fault)</h3>
<pre class="out">CTRL$ ansible-playbook -i hosts site.yml --syntax-check
ERROR! YAML syntax error while loading '/home/netops/site.yml'
<span class="hl">  mapping values are not allowed in this context (this line is indented deeper than the key above it, which already has a value)</span>

Error location: line 13, column 18 (the real mistake may be on this line or just above it)

The offending line:

          - vlan_id: 20
             name: ENGINEERING
                 ^ here</pre>
<p><code>cat -n site.yml</code> shows line 13 has <b>13</b> spaces before <code>name:</code>, while <code>vlan_id:</code> on line 12 starts after 12 (10 spaces, a dash and a space). Keys of the same mapping must start in exactly the same column. Remove one space:</p>
<pre class="code">CTRL$ sed -i '13s/ name/name/' site.yml
CTRL$ ansible-playbook -i hosts site.yml --syntax-check

playbook: site.yml</pre>
<p>"playbook: site.yml" with no error is the pass message. Remember what it does <b>not</b> prove: it never logs in to a device and does not check module parameters.</p>

<h3>Steps 2 and 3: inventory and login (the credentials fault)</h3>
<pre class="out">CTRL$ ansible access -i hosts -m ping
<span class="hl">SW1 | FAILED! =&gt; {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user ansible"
}</span>
SW2 | FAILED! =&gt; {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user ansible"
}</pre>
<p>Both switches reject the same user, so suspect a shared variable rather than the switches. See what SW1 really receives:</p>
<pre class="out">CTRL$ ansible-inventory -i hosts --host SW1
{
    "ansible_connection": "network_cli",
    "ansible_host": "10.30.0.11",
    "ansible_network_os": "ios",
<span class="hl">    "ansible_password": "NkAuto62",</span>
    "ansible_user": "ansible"
}</pre>
<p>The group variable says <b>NkAuto62</b>; the switches expect <b>NkAuto26</b> (two digits swapped). The ticket says fix the inventory, not the switches:</p>
<pre class="code">CTRL$ sed -i 's/NkAuto62/NkAuto26/' hosts
CTRL$ ansible access -i hosts -m ping</pre>
<p>Now both return <code>SUCCESS</code> with <code>"ping": "pong"</code>. If you saw <code>UNREACHABLE!</code> instead, the problem would be IP reachability or SSH not enabled, a different branch of the tree.</p>

<h3>Step 4: module parameters (the parameter fault)</h3>
<pre class="out">TASK [Use the lab NTP server] *************************************************
<span class="hl">fatal: [SW1]: FAILED! =&gt; {"changed": false, "msg": "Unsupported parameters for (ios_config) module: line. Supported parameters include: after, backup, before, commands, defaults, diff_against, intended_config, lines, match, multiline_delimiter, parents, replace, running_config, save_when."}</span></pre>
<p>The message names the bad parameter (<code>line</code>) and lists the valid ones. <code>ansible-doc ios_config</code> shows the same list with descriptions. The option that holds configuration lines is <b>lines</b>, plural:</p>
<pre class="code">CTRL$ sed -i 's/        line:/        lines:/' site.yml</pre>

<h3>Steps 5 and 6: run, read, run again</h3>
<pre class="code">CTRL$ ansible-playbook -i hosts site.yml --check     <span class="c"># optional dry run</span>
CTRL$ ansible-playbook -i hosts site.yml
CTRL$ ansible-playbook -i hosts site.yml             <span class="c"># idempotency proof</span></pre>
<pre class="out">PLAY RECAP ********************************************************************
<span class="hl">SW1                        : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
SW2                        : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</span></pre>
<p>The first real run shows <code>changed</code> for each task; the second shows <code>changed=0</code> and <code>failed=0</code> for both switches. Finish with a device check such as <code>show vlan brief</code> on SW1 to see VLAN 10 SALES and VLAN 20 ENGINEERING.</p>

<h3>The same idea for REST calls</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>Check</th></tr>
<tr><td>Connection refused / timeout</td><td>Reachability or service</td><td>ping, <code>ip h&#116;tp secure-server</code>, <code>restconf</code></td></tr>
<tr><td>401</td><td>Authentication</td><td>User, password, <code>ip h&#116;tp authentication local</code></td></tr>
<tr><td>403</td><td>Authorization</td><td>Privilege 15</td></tr>
<tr><td>404</td><td>URI</td><td>Path spelling, list key, %2F</td></tr>
<tr><td>400</td><td>Body</td><td><code>json validate</code>, then <code>json types</code> against the model</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once, so you never learn which fix worked; "fixing" credentials on the switches when the ticket says the inventory is wrong; stopping after the first green run without the second idempotency run; ignoring warnings at the top of the output.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>--syntax-check</code> validates YAML and playbook structure only. <code>--check</code> is a dry run that connects to devices but changes nothing. <code>UNREACHABLE</code> points at connectivity or SSH; <code>FAILED</code> with an authentication message points at credentials; "Unsupported parameters" points at the playbook.</p></div>

<div class="scn"><h4>Friday change, Monday surprise</h4><p>An engineer pushed a new ACL playbook to 60 switches on Friday; the recap showed <code>failed=0</code>, so he went home. On Monday a manager reported that 12 switches still had the old ACL. The recap had actually listed only 48 hosts: 12 switches were in a group named <code>access_old</code> that the play did not target. A second run against the right pattern, followed by a run showing <code>changed=0</code> on all 60, closed the ticket.</p><p><b>Lesson:</b> a clean recap proves nothing about hosts that are not in it. Count the hosts.</p></div>

<div class="iv"><p class="q">"A playbook fails against all switches. How do you troubleshoot it?"</p><p>Strong answer: work in layers and change one thing at a time. First <code>--syntax-check</code> for YAML and structure. Then <code>ansible-inventory --host</code> to see the variables each host gets, and an ad-hoc <code>-m ping</code> to prove reachability and login. Then check module parameters with <code>ansible-doc</code>, do a <code>--check</code> dry run, run for real with <code>-v</code>, read the PLAY RECAP, and run once more to confirm <code>changed=0</code>. Finish with a <code>show</code> command on a device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: syntax, inventory variables, login, module parameters, dry run, real run, second run.</li>
<li>YAML errors: check the reported line and the one above; keys of one mapping share a column.</li>
<li>Authentication failed on every host usually means a shared group variable is wrong.</li>
<li>"Unsupported parameters" names the bad option; <code>ansible-doc</code> lists the good ones.</li>
<li>Done means failed=0, unreachable=0, every expected host listed, and changed=0 on the rerun.</li>
</ul></div>
`,hi:`
<p>Jab gaadi start nahi hoti, achha mechanic pehle engine nahi badalta. Woh order mein check karta hai: kya chaabi sahi hai, kya gaadi chaabi accept karti hai, kya parts compatible hain, phir gaadi chalata hai, aur aakhir mein pakka karne ke liye doosri test drive leta hai. Automation failures ko bhi yahi shaant order chahiye. Har check ek minute leta hai aur problems ki ek poori class ko rule out karta hai. Yeh chapter isi order se Lab 2, <b>Fix the playbook</b>, chalata hai.</p>

<h3>Ticket</h3>
<p>Ek teammate ne controller CTRL par <code>site.yml</code> likha tha jo SW1 aur SW2 par VLAN 10 SALES, VLAN 20 ENGINEERING, <code>ntp server 10.30.0.100</code> aur ek login banner push kare, aur phir chhutti par chala gaya. Yeh chalta nahi. Switches user <b>ansible</b> aur password <b>NkAuto26</b> ke saath bane the. Teen faults hain: ek YAML galti, galat inventory credentials aur ek galat module parameter.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Chhe step ka Ansible troubleshooting workflow">
<rect x="10" y="20" width="95" height="70" rx="8" fill="#bbf7d0"/><text x="57" y="50" text-anchor="middle" class="svg-ink" font-size="12">1 syntax</text><text x="57" y="70" text-anchor="middle" class="svg-muted" font-size="12">YAML</text>
<rect x="115" y="20" width="95" height="70" rx="8" fill="#bbf7d0"/><text x="162" y="50" text-anchor="middle" class="svg-ink" font-size="12">2 inventory</text><text x="162" y="70" text-anchor="middle" class="svg-muted" font-size="12">variables</text>
<rect x="220" y="20" width="95" height="70" rx="8" fill="#bae6fd"/><text x="267" y="50" text-anchor="middle" class="svg-ink" font-size="12">3 login</text><text x="267" y="70" text-anchor="middle" class="svg-muted" font-size="12">-m ping</text>
<rect x="325" y="20" width="95" height="70" rx="8" fill="#bae6fd"/><text x="372" y="50" text-anchor="middle" class="svg-ink" font-size="12">4 modules</text><text x="372" y="70" text-anchor="middle" class="svg-muted" font-size="12">ansible-doc</text>
<rect x="430" y="20" width="95" height="70" rx="8" fill="#ddd6fe"/><text x="477" y="50" text-anchor="middle" class="svg-ink" font-size="12">5 run</text><text x="477" y="70" text-anchor="middle" class="svg-muted" font-size="12">--check, recap</text>
<rect x="535" y="20" width="95" height="70" rx="8" fill="#fde68a"/><text x="582" y="50" text-anchor="middle" class="svg-ink" font-size="12">6 phir chalao</text><text x="582" y="70" text-anchor="middle" class="svg-muted" font-size="12">changed=0</text>
<line x1="105" y1="55" x2="115" y2="55" stroke="#64748b" stroke-width="2"/><line x1="210" y1="55" x2="220" y2="55" stroke="#64748b" stroke-width="2"/><line x1="315" y1="55" x2="325" y2="55" stroke="#64748b" stroke-width="2"/><line x1="420" y1="55" x2="430" y2="55" stroke="#64748b" stroke-width="2"/><line x1="525" y1="55" x2="535" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="162" y="125" text-anchor="middle" class="svg-muted" font-size="12">CTRL par, device nahi chhua</text>
<text x="372" y="125" text-anchor="middle" class="svg-muted" font-size="12">devices chhuta hai, read only</text>
<text x="530" y="125" text-anchor="middle" class="svg-muted" font-size="12">changes aur saboot</text>
<text x="320" y="158" text-anchor="middle" class="svg-accent" font-size="13">saste checks pehle, ek time par ek fault</text>
</svg><p class="cap">Left se right kaam karo. Har step ya to pass hota hai ya exactly ek tarah ke fault ki taraf ishaara karta hai.</p></div>

<h3>Step 1: syntax check (YAML fault)</h3>
<pre class="out">CTRL$ ansible-playbook -i hosts site.yml --syntax-check
ERROR! YAML syntax error while loading '/home/netops/site.yml'
<span class="hl">  mapping values are not allowed in this context (this line is indented deeper than the key above it, which already has a value)</span>

Error location: line 13, column 18 (the real mistake may be on this line or just above it)

The offending line:

          - vlan_id: 20
             name: ENGINEERING
                 ^ here</pre>
<p><code>cat -n site.yml</code> dikhata hai ki line 13 par <code>name:</code> se pehle <b>13</b> spaces hain, jabki line 12 par <code>vlan_id:</code> 12 ke baad shuru hota hai (10 spaces, ek dash aur ek space). Ek hi mapping ki keys bilkul same column se shuru honi chahiye. Ek space hatao:</p>
<pre class="code">CTRL$ sed -i '13s/ name/name/' site.yml
CTRL$ ansible-playbook -i hosts site.yml --syntax-check

playbook: site.yml</pre>
<p>Bina error ke "playbook: site.yml" pass message hai. Yaad rakho yeh kya saabit <b>nahi</b> karta: yeh kabhi device mein login nahi karta aur module parameters check nahi karta.</p>

<h3>Steps 2 aur 3: inventory aur login (credentials fault)</h3>
<pre class="out">CTRL$ ansible access -i hosts -m ping
<span class="hl">SW1 | FAILED! =&gt; {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user ansible"
}</span>
SW2 | FAILED! =&gt; {
    "changed": false,
    "msg": "ssh connection failed: Authentication failed for user ansible"
}</pre>
<p>Dono switches same user ko reject karte hain, isliye switches ki jagah ek shared variable par shak karo. Dekho SW1 ko asal mein kya milta hai:</p>
<pre class="out">CTRL$ ansible-inventory -i hosts --host SW1
{
    "ansible_connection": "network_cli",
    "ansible_host": "10.30.0.11",
    "ansible_network_os": "ios",
<span class="hl">    "ansible_password": "NkAuto62",</span>
    "ansible_user": "ansible"
}</pre>
<p>Group variable <b>NkAuto62</b> kehta hai; switches <b>NkAuto26</b> expect karte hain (do digits ulte). Ticket kehta hai inventory theek karo, switches nahi:</p>
<pre class="code">CTRL$ sed -i 's/NkAuto62/NkAuto26/' hosts
CTRL$ ansible access -i hosts -m ping</pre>
<p>Ab dono <code>"ping": "pong"</code> ke saath <code>SUCCESS</code> dete hain. Agar iski jagah <code>UNREACHABLE!</code> dikhta, to problem IP reachability ya SSH enabled na hona hoti, tree ki ek alag branch.</p>

<h3>Step 4: module parameters (parameter fault)</h3>
<pre class="out">TASK [Use the lab NTP server] *************************************************
<span class="hl">fatal: [SW1]: FAILED! =&gt; {"changed": false, "msg": "Unsupported parameters for (ios_config) module: line. Supported parameters include: after, backup, before, commands, defaults, diff_against, intended_config, lines, match, multiline_delimiter, parents, replace, running_config, save_when."}</span></pre>
<p>Message galat parameter (<code>line</code>) ka naam leta hai aur valid parameters ki list deta hai. <code>ansible-doc ios_config</code> wahi list descriptions ke saath dikhata hai. Configuration lines rakhne wala option <b>lines</b> hai, plural:</p>
<pre class="code">CTRL$ sed -i 's/        line:/        lines:/' site.yml</pre>

<h3>Steps 5 aur 6: chalao, padho, phir chalao</h3>
<pre class="code">CTRL$ ansible-playbook -i hosts site.yml --check     <span class="c"># optional dry run</span>
CTRL$ ansible-playbook -i hosts site.yml
CTRL$ ansible-playbook -i hosts site.yml             <span class="c"># idempotency ka saboot</span></pre>
<pre class="out">PLAY RECAP ********************************************************************
<span class="hl">SW1                        : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
SW2                        : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</span></pre>
<p>Pehla real run har task ke liye <code>changed</code> dikhata hai; doosra dono switches ke liye <code>changed=0</code> aur <code>failed=0</code> dikhata hai. End mein SW1 par <code>show vlan brief</code> jaisa device check karo taaki VLAN 10 SALES aur VLAN 20 ENGINEERING dikhein.</p>

<h3>REST calls ke liye yahi idea</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>Check</th></tr>
<tr><td>Connection refused / timeout</td><td>Reachability ya service</td><td>ping, <code>ip h&#116;tp secure-server</code>, <code>restconf</code></td></tr>
<tr><td>401</td><td>Authentication</td><td>User, password, <code>ip h&#116;tp authentication local</code></td></tr>
<tr><td>403</td><td>Authorization</td><td>Privilege 15</td></tr>
<tr><td>404</td><td>URI</td><td>Path spelling, list key, %2F</td></tr>
<tr><td>400</td><td>Body</td><td><code>json validate</code>, phir model ke against <code>json types</code></td></tr></table>

<div class="warn"><p><b>Common galtiyaan.</b> Ek saath kai cheezein badalna, jisse pata hi nahi chalta kaunsa fix kaam aaya; ticket kehta hai inventory galat hai par credentials switches par "theek" karna; pehle green run ke baad doosre idempotency run ke bina ruk jaana; output ke upar ki warnings ignore karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>--syntax-check</code> sirf YAML aur playbook structure validate karta hai. <code>--check</code> ek dry run hai jo devices se connect hota hai par kuch nahi badalta. <code>UNREACHABLE</code> connectivity ya SSH ki taraf ishaara karta hai; authentication message wala <code>FAILED</code> credentials ki taraf; "Unsupported parameters" playbook ki taraf.</p></div>

<div class="scn"><h4>Friday ka change, Monday ka surprise</h4><p>Ek engineer ne Friday ko 60 switches par naya ACL playbook push kiya; recap mein <code>failed=0</code> tha, to woh ghar chala gaya. Monday ko ek manager ne report kiya ki 12 switches par abhi bhi purana ACL hai. Recap mein asal mein sirf 48 hosts the: 12 switches <code>access_old</code> naam ke group mein the jise play target nahi karta tha. Sahi pattern ke against doosra run, aur uske baad saare 60 par <code>changed=0</code> dikhane wale run ne ticket band kiya.</p><p><b>Seekh:</b> saaf recap un hosts ke baare mein kuch saabit nahi karta jo usmein hain hi nahi. Hosts gino.</p></div>

<div class="iv"><p class="q">"Ek playbook saare switches par fail hota hai. Aap troubleshoot kaise karoge?"</p><p>Strong answer: layers mein kaam karo aur ek time par ek cheez badlo. Pehle YAML aur structure ke liye <code>--syntax-check</code>. Phir har host ko milne wale variables dekhne ke liye <code>ansible-inventory --host</code>, aur reachability aur login saabit karne ke liye ad-hoc <code>-m ping</code>. Phir <code>ansible-doc</code> se module parameters check karo, <code>--check</code> dry run karo, <code>-v</code> ke saath asli run karo, PLAY RECAP padho, aur <code>changed=0</code> confirm karne ke liye ek baar aur chalao. End mein device par <code>show</code> command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: syntax, inventory variables, login, module parameters, dry run, real run, doosra run.</li>
<li>YAML errors: reported line aur uske upar wali line check karo; ek mapping ki keys ek column share karti hain.</li>
<li>Har host par authentication fail ka matlab aksar ek shared group variable galat hai.</li>
<li>"Unsupported parameters" galat option ka naam leta hai; <code>ansible-doc</code> sahi options list karta hai.</li>
<li>Done ka matlab: failed=0, unreachable=0, har expected host listed, aur rerun par changed=0.</li>
</ul></div>
`}};export{e as default};