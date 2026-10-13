var e={id:`summary`,h:{en:`Summary: a clean inventory project and a checklist`,hi:`Summary: saaf inventory project aur checklist`},body:{en:`
<p>You started this module with one INI file and a handful of devices. You now have a project where the inventory says who the devices are, folders hold the values that make them different, a vault guards the password, and a short method finds the cause when a value is wrong. This chapter pulls the module together into one picture, one checklist and a few habits to carry into the next modules.</p>

<h3>The project layout you built</h3>
<pre class="code">netauto/
  ansible.cfg              inventory = inventory.yml, vault_password_file
  inventory.yml            groups: pune, bengaluru, routers, switches
  .vault_pass              passphrase file, never in Git
  group_vars/
    all/vars.yml           connection variables and a password pointer
    all/vault.yml          encrypted secret
    pune.yml               site values
    bengaluru.yml          site values
  host_vars/
    pun-core-r1.yml        one exception
  snmp.yml                 a generic playbook</pre>
<p>Read it from the top. The config file tells Ansible where the inventory is. The inventory defines groups. Each variable file is named after a group or host. The playbook at the bottom contains no device-specific values at all, only variable names.</p>

<h3>What each chapter gave you</h3>
<table class="cmp"><tr><th>Chapter</th><th>Idea</th><th>Command or file</th></tr>
<tr><td>1</td><td>Layers: inventory, variables, playbook</td><td>Hard-coded versus variables</td></tr>
<tr><td>2</td><td>YAML inventory with site and role groups</td><td><code>ansible-inventory --graph</code></td></tr>
<tr><td>3</td><td>Host patterns and limits</td><td><code>--list-hosts -l 'pune:&amp;routers'</code></td></tr>
<tr><td>4</td><td>group_vars and host_vars</td><td>File name equals group or host name</td></tr>
<tr><td>5</td><td>Connection variables and vault</td><td><code>ansible-vault encrypt</code></td></tr>
<tr><td>6</td><td>Precedence ladder</td><td>all, group, host, play vars, <code>-e</code></td></tr>
<tr><td>7</td><td>Magic variables and quoting</td><td><code>group_names</code>, <code>hostvars</code></td></tr>
<tr><td>8</td><td>Troubleshooting method</td><td><code>--host</code>, <code>grep -rn</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module workflow from inventory to verified run">
<rect x="15" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="70" y="95" text-anchor="middle" class="svg-ink" font-size="12">Inventory</text>
<rect x="145" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="200" y="95" text-anchor="middle" class="svg-ink" font-size="12">Variables</text>
<rect x="275" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="330" y="95" text-anchor="middle" class="svg-ink" font-size="12">Vault</text>
<rect x="405" y="60" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="460" y="95" text-anchor="middle" class="svg-ink" font-size="12">Limit</text>
<rect x="535" y="60" width="90" height="60" rx="8" fill="#fca5a5"/><text x="580" y="95" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<line x1="125" y1="90" x2="145" y2="90" stroke="#64748b" stroke-width="2"/><line x1="255" y1="90" x2="275" y2="90" stroke="#64748b" stroke-width="2"/><line x1="385" y1="90" x2="405" y2="90" stroke="#64748b" stroke-width="2"/><line x1="515" y1="90" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Define who, give values, protect secrets, narrow the target, then verify.</p></div>

<h3>Pre-change checklist</h3>
<ol>
<li><code>ansible-inventory --graph</code>: do the groups look right?</li>
<li><code>ansible-inventory --host NAME</code>: are the values what I expect, and is any secret exposed?</li>
<li><code>ansible-playbook PLAY --list-hosts -l PATTERN</code>: exactly which devices will be touched?</li>
<li>Check the playbook for <code>vars:</code> that could override inventory values.</li>
<li>Run on one device first, then widen the limit.</li>
<li>Run twice; the second run must show changed=0.</li>
</ol>

<h3>Habits to keep</h3>
<ul>
<li>One home per variable, at the lowest level that is true for everyone.</li>
<li>Never store a real password in plain text; use a pointer and a vault.</li>
<li>Quote every value that contains double curly braces.</li>
<li>Prefer <code>--list-hosts</code> and <code>--syntax-check</code>, which touch no device.</li>
<li>Fix faults at the file that is wrong, not with a command-line override.</li>
</ul>
<p>The next modules build on this structure: loops, conditions and handlers use these same variables, and templates and roles will read them too.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Treating the lab values as real. <code>NK@2026</code> and the <code>.example</code> addresses belong to the simulator. In production use your own secrets, stored in a vault, and rotate them on a schedule.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the four pairs: group_vars file name equals group name; host pattern <code>:&amp;</code> is intersection; the <code>vault_</code> prefix is a convention, not a rule; and <code>-e</code> is the strongest variable source.</p></div>

<div class="scn"><h4>Onboarding a third site</h4><p>The company opens a Chennai office. The engineer adds a <code>chennai</code> group with its router, creates <code>group_vars/chennai.yml</code> with the site name and location, and runs the existing playbook with <code>-l chennai</code>. No playbook line was edited.</p></div>

<div class="iv"><p class="q">"Walk me through how you would set up an Ansible inventory for a new network."</p><p>I make a YAML inventory with site and role groups, put shared connection values in <code>group_vars/all</code> and the password in a vault, give each site its own group_vars file, and keep exceptions in host_vars. Then I check with <code>--graph</code> and <code>--host</code>, preview targets with <code>--list-hosts</code>, and prove idempotency with a second run.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory says who; variable files say what is different; the playbook stays generic.</li>
<li>Patterns and <code>--limit</code> choose targets; <code>--list-hosts</code> previews them.</li>
<li>Vault protects secrets; the passphrase stays out of Git.</li>
<li>Precedence: all, group, host, play vars, <code>-e</code>.</li>
<li>Debug with <code>--graph</code>, <code>--host</code>, <code>grep</code>, then the playbook.</li>
</ul></div>
`,hi:`
<p>Is module ko aapne ek INI file aur kuch devices se shuru kiya tha. Ab aapke paas aisa project hai jisme inventory batati hai devices kaun hain, folders mein woh values hain jo unhe alag banati hain, vault password ki hifazat karta hai, aur ek chhota method value galat hone par wajah dhoondh leta hai. Yeh chapter module ko ek tasveer, ek checklist aur agle modules ke liye kuch aadaton mein jodta hai.</p>

<h3>Jo project layout aapne banaya</h3>
<pre class="code">netauto/
  ansible.cfg              inventory = inventory.yml, vault_password_file
  inventory.yml            groups: pune, bengaluru, routers, switches
  .vault_pass              passphrase file, Git mein kabhi nahi
  group_vars/
    all/vars.yml           connection variables aur password pointer
    all/vault.yml          encrypted secret
    pune.yml               site values
    bengaluru.yml          site values
  host_vars/
    pun-core-r1.yml        ek exception
  snmp.yml                 ek generic playbook</pre>
<p>Ise upar se padho. Config file Ansible ko batati hai inventory kahan hai. Inventory groups define karti hai. Har variable file ka naam kisi group ya host ke naam par hai. Sabse neeche ke playbook mein device-specific values bilkul nahi hain, sirf variable names hain.</p>

<h3>Har chapter ne kya diya</h3>
<table class="cmp"><tr><th>Chapter</th><th>Idea</th><th>Command ya file</th></tr>
<tr><td>1</td><td>Layers: inventory, variables, playbook</td><td>Hard-coded versus variables</td></tr>
<tr><td>2</td><td>Site aur role groups wali YAML inventory</td><td><code>ansible-inventory --graph</code></td></tr>
<tr><td>3</td><td>Host patterns aur limits</td><td><code>--list-hosts -l 'pune:&amp;routers'</code></td></tr>
<tr><td>4</td><td>group_vars aur host_vars</td><td>File name barabar group ya host naam</td></tr>
<tr><td>5</td><td>Connection variables aur vault</td><td><code>ansible-vault encrypt</code></td></tr>
<tr><td>6</td><td>Precedence ladder</td><td>all, group, host, play vars, <code>-e</code></td></tr>
<tr><td>7</td><td>Magic variables aur quoting</td><td><code>group_names</code>, <code>hostvars</code></td></tr>
<tr><td>8</td><td>Troubleshooting method</td><td><code>--host</code>, <code>grep -rn</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Inventory se verified run tak module workflow">
<rect x="15" y="60" width="110" height="60" rx="8" fill="#fde68a"/><text x="70" y="95" text-anchor="middle" class="svg-ink" font-size="12">Inventory</text>
<rect x="145" y="60" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="200" y="95" text-anchor="middle" class="svg-ink" font-size="12">Variables</text>
<rect x="275" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="330" y="95" text-anchor="middle" class="svg-ink" font-size="12">Vault</text>
<rect x="405" y="60" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="460" y="95" text-anchor="middle" class="svg-ink" font-size="12">Limit</text>
<rect x="535" y="60" width="90" height="60" rx="8" fill="#fca5a5"/><text x="580" y="95" text-anchor="middle" class="svg-ink" font-size="12">Verify</text>
<line x1="125" y1="90" x2="145" y2="90" stroke="#64748b" stroke-width="2"/><line x1="255" y1="90" x2="275" y2="90" stroke="#64748b" stroke-width="2"/><line x1="385" y1="90" x2="405" y2="90" stroke="#64748b" stroke-width="2"/><line x1="515" y1="90" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Define karo kaun, values do, secrets bachao, target chhota karo, phir verify karo.</p></div>

<h3>Change se pehle checklist</h3>
<ol>
<li><code>ansible-inventory --graph</code>: groups sahi dikhte hain?</li>
<li><code>ansible-inventory --host NAME</code>: values meri ummeed jaisi hain, aur koi secret expose to nahi?</li>
<li><code>ansible-playbook PLAY --list-hosts -l PATTERN</code>: exactly kaun se devices chhue jaayenge?</li>
<li>Playbook mein <code>vars:</code> dekho jo inventory values override kar sakte hain.</li>
<li>Pehle ek device par chalao, phir limit badhao.</li>
<li>Do baar chalao; doosre run mein changed=0 aana chahiye.</li>
</ol>

<h3>Rakhne wali aadatein</h3>
<ul>
<li>Har variable ka ek ghar, us sabse neeche ke level par jo sab ke liye sach hai.</li>
<li>Asli password kabhi plain text mein nahi; pointer aur vault use karo.</li>
<li>Double curly braces wali har value ko quote karo.</li>
<li><code>--list-hosts</code> aur <code>--syntax-check</code> ko prefer karo, jo kisi device ko nahi chhute.</li>
<li>Fault ko us file mein theek karo jo galat hai, command-line override se nahi.</li>
</ul>
<p>Agle modules is structure par bante hain: loops, conditions aur handlers yahi variables use karte hain, aur templates aur roles bhi inhe padhenge.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Lab values ko asli maan lena. <code>NK@2026</code> aur <code>.example</code> addresses simulator ke hain. Production mein apne secrets use karo, vault mein rakho, aur schedule par rotate karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Chaar baatein yaad rakho: group_vars file name barabar group name; host pattern <code>:&amp;</code> intersection hai; <code>vault_</code> prefix convention hai, rule nahi; aur <code>-e</code> sabse taakatwar variable source hai.</p></div>

<div class="scn"><h4>Teesra site onboard karna</h4><p>Company Chennai office kholti hai. Engineer <code>chennai</code> group apne router ke saath jodta hai, site name aur location ke saath <code>group_vars/chennai.yml</code> banata hai, aur maujooda playbook <code>-l chennai</code> ke saath chalata hai. Playbook ki ek line edit nahi hui.</p></div>

<div class="iv"><p class="q">"Naye network ke liye Ansible inventory kaise set up karoge, samjhao."</p><p>Main site aur role groups wali YAML inventory banata hoon, shared connection values <code>group_vars/all</code> mein aur password vault mein rakhta hoon, har site ko uski group_vars file deta hoon, aur exceptions host_vars mein. Phir <code>--graph</code> aur <code>--host</code> se check karta hoon, <code>--list-hosts</code> se targets preview karta hoon, aur doosre run se idempotency sabit karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory batati hai kaun; variable files batati hain kya alag hai; playbook generic rehta hai.</li>
<li>Patterns aur <code>--limit</code> targets chunte hain; <code>--list-hosts</code> preview deta hai.</li>
<li>Vault secrets bachata hai; passphrase Git se bahar.</li>
<li>Precedence: all, group, host, play vars, <code>-e</code>.</li>
<li>Debug: <code>--graph</code>, <code>--host</code>, <code>grep</code>, phir playbook.</li>
</ul></div>
`}};export{e as default};