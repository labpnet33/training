var e={id:`magic-variables`,h:{en:`Magic variables and quoting: what Ansible gives you for free`,hi:`Magic variables aur quoting: Ansible jo free deta hai`},body:{en:`
<p>Besides the variables you write, Ansible creates a few of its own for every run. They are called <b>magic variables</b> because you never define them, yet they are always there. They let a playbook ask questions such as "which host am I?", "which groups am I in?" and "what does another device have configured?". They are also the reason one generic playbook can behave differently on routers and switches.</p>

<h3>The four you will use most</h3>
<table class="cmp"><tr><th>Name</th><th>Holds</th><th>Example</th></tr>
<tr><td><code>inventory_hostname</code></td><td>The name of the host in the inventory</td><td>pun-core-r1</td></tr>
<tr><td><code>ansible_host</code></td><td>The address Ansible connects to</td><td>10.99.0.1</td></tr>
<tr><td><code>group_names</code></td><td>List of groups this host belongs to</td><td>['pune', 'routers']</td></tr>
<tr><td><code>groups</code></td><td>Every group with its hosts</td><td>groups['switches']</td></tr>
<tr><td><code>hostvars</code></td><td>The variables of any host</td><td>hostvars['blr-edge-r2'].snmp_location</td></tr></table>
<p>Strictly speaking <code>ansible_host</code> is one you set yourself in the inventory; it is listed here because it is used just as often.</p>

<h3>One playbook that uses them all</h3>
<pre class="code">---
- name: Magic variables
  hosts: all
  gather_facts: false
  tasks:
    - name: Who am I
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} at {{ ansible_host }} is in groups {{ group_names }}"

    - name: Switches in the inventory
      ansible.builtin.debug:
        var: groups['switches']
      run_once: true

    - name: Another host's variable
      ansible.builtin.debug:
        msg: "Bengaluru router is at {{ hostvars['blr-edge-r2'].snmp_location }}"
      run_once: true</pre>
<ul>
<li><code>hosts: all</code> and <code>gather_facts: false</code>: run on every device without collecting facts.</li>
<li>The first task builds one sentence from three variables. The whole value is in double quotes because it begins with a variable.</li>
<li>The second task uses <code>var:</code> instead of <code>msg:</code>. With <code>var:</code> you give the variable name without braces and Ansible prints the name and the value.</li>
<li><code>run_once: true</code> means "do this task on the first host only", so the answer is not repeated three times.</li>
<li>The third task reads a variable of a <i>different</i> host through <code>hostvars</code>, using the host's inventory name in quotes inside square brackets, then a dot and the variable name.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook magic.yml
PLAY [Magic variables] ********************************************************
TASK [Who am I] ***************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 at 10.99.0.1 is in groups ['pune', 'routers']"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 at 10.99.0.10 is in groups ['pune', 'switches']"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 at 10.99.0.2 is in groups ['bengaluru', 'routers']"
}
TASK [Switches in the inventory] **********************************************
ok: [pun-core-r1] => {
    "groups['switches']": [
        "pun-acc-sw1"
    ]
}
TASK [Another host's variable] ************************************************
ok: [pun-core-r1] => {
    "msg": "Bengaluru router is at Bengaluru DC rack B1"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Check the recap: <code>pun-core-r1</code> shows ok=3 because the two <code>run_once</code> tasks ran on it, while the other two hosts show ok=1.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Magic variables for one host">
<rect x="220" y="20" width="200" height="50" rx="10" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">pun-core-r1</text>
<rect x="20" y="140" width="180" height="55" rx="8" fill="#fde68a"/><text x="110" y="162" text-anchor="middle" class="svg-ink" font-size="12">inventory_hostname</text><text x="110" y="182" text-anchor="middle" class="svg-muted" font-size="11">pun-core-r1</text>
<rect x="230" y="140" width="180" height="55" rx="8" fill="#bbf7d0"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">group_names</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="11">pune, routers</text>
<rect x="440" y="140" width="180" height="55" rx="8" fill="#e2e8f0"/><text x="530" y="162" text-anchor="middle" class="svg-ink" font-size="12">hostvars of others</text><text x="530" y="182" text-anchor="middle" class="svg-muted" font-size="11">blr-edge-r2 ...</text>
<line x1="280" y1="70" x2="110" y2="140" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="70" x2="320" y2="140" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="70" x2="530" y2="140" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Every host automatically knows its own name, its groups and its neighbours' variables.</p></div>

<h3>Quote values that start with braces</h3>
<p>The most common YAML trap in this chapter is the missing quote. YAML sees a curly brace at the start of a value and thinks you are writing a dictionary:</p>
<pre class="code">---
- name: Unquoted brace
  hosts: all
  gather_facts: false
  tasks:
    - name: Where am I
      ansible.builtin.debug:
        msg: {{ site }}</pre>
<pre class="out">AUTO01$ ansible-playbook badq.yml --syntax-check
ERROR! We were unable to read either as JSON nor YAML, these are the errors we got from each:
JSON: Expecting value: line 1 column 1 (char 0)
Syntax Error while loading YAML.
  could not find expected ':' in flow mapping
The error appears to be in '/home/netadmin/netauto/badq.yml': line 8, column 14, but may
be elsewhere in the file depending on the exact syntax problem.
The offending line appears to be:
      ansible.builtin.debug:
        msg: {{ site }}
             ^ here
We could be wrong, but this one looks like it might be an issue with
missing quotes. Always quote template expression brackets when they
start a value. For instance:
    with_items:
      - {{ foo }}
Should be written as:
    with_items:
      - "{{ foo }}"</pre>
<p>The fix is <code>msg: "{{ site }}"</code>. A value that has text before the braces, such as <code>"{{ inventory_hostname }} is up"</code>, is quoted too, as a habit. Quote every value that contains a Jinja expression and you will rarely see this error. Use <code>--syntax-check</code> to catch it before any device is touched.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Using a variable that exists on one group only, such as <code>site</code>, in a play that runs on all hosts. A host without it fails with an "undefined variable" error. Either define it for everyone, or guard it with a default value, which the next module covers.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>group_names</code> is a list of the groups of the <i>current</i> host; <code>groups</code> is a dictionary of <i>all</i> groups. Do not mix them up in conditions such as <code>'routers' in group_names</code>.</p></div>

<div class="scn"><h4>The summary page across sites</h4><p>A NOC lead wanted one report line per site that included the Bengaluru router's location while the play ran on Pune devices. Reading it through <code>hostvars</code> with the router's inventory name gave the value without a second inventory or any copy-paste.</p></div>

<div class="iv"><p class="q">"What are magic variables in Ansible?"</p><p>They are variables Ansible creates itself, like <code>inventory_hostname</code>, <code>group_names</code>, <code>groups</code> and <code>hostvars</code>. They let one playbook adapt to the host it is running on, or read another host's values. I always quote a value that starts with a Jinja expression.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Magic variables exist without being defined: name, groups, hostvars.</li>
<li><code>group_names</code> is this host's groups; <code>groups</code> is every group.</li>
<li><code>hostvars['name'].var</code> reads another host's variable.</li>
<li><code>run_once: true</code> runs a task on the first host only.</li>
<li>Quote values that start with double curly braces; <code>--syntax-check</code> finds mistakes safely.</li>
</ul></div>
`,hi:`
<p>Jo variables aap likhte ho, unke alawa Ansible har run ke liye kuch variables khud banata hai. Inhe <b>magic variables</b> kehte hain kyunki aap inhe define nahi karte, phir bhi yeh hamesha maujood hote hain. Inki madad se playbook sawaal puchh sakta hai jaise "main kaun sa host hoon?", "main kin groups mein hoon?" aur "doosre device par kya configured hai?". Isi wajah se ek generic playbook routers aur switches par alag behave kar sakta hai.</p>

<h3>Chaar jo sabse zyada use honge</h3>
<table class="cmp"><tr><th>Naam</th><th>Kya rakhta hai</th><th>Example</th></tr>
<tr><td><code>inventory_hostname</code></td><td>Inventory mein host ka naam</td><td>pun-core-r1</td></tr>
<tr><td><code>ansible_host</code></td><td>Woh address jis par Ansible connect karta hai</td><td>10.99.0.1</td></tr>
<tr><td><code>group_names</code></td><td>Is host ke groups ki list</td><td>['pune', 'routers']</td></tr>
<tr><td><code>groups</code></td><td>Har group apne hosts ke saath</td><td>groups['switches']</td></tr>
<tr><td><code>hostvars</code></td><td>Kisi bhi host ke variables</td><td>hostvars['blr-edge-r2'].snmp_location</td></tr></table>
<p>Sahi kahein to <code>ansible_host</code> woh hai jo aap khud inventory mein set karte ho; yahan isliye hai kyunki yeh utna hi use hota hai.</p>

<h3>Ek playbook jo sab use karta hai</h3>
<pre class="code">---
- name: Magic variables
  hosts: all
  gather_facts: false
  tasks:
    - name: Who am I
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} at {{ ansible_host }} is in groups {{ group_names }}"

    - name: Switches in the inventory
      ansible.builtin.debug:
        var: groups['switches']
      run_once: true

    - name: Another host's variable
      ansible.builtin.debug:
        msg: "Bengaluru router is at {{ hostvars['blr-edge-r2'].snmp_location }}"
      run_once: true</pre>
<ul>
<li><code>hosts: all</code> aur <code>gather_facts: false</code>: facts collect kiye bina har device par chalao.</li>
<li>Pehla task teen variables se ek sentence banata hai. Poori value double quotes mein hai kyunki woh variable se shuru hoti hai.</li>
<li>Doosra task <code>msg:</code> ki jagah <code>var:</code> use karta hai. <code>var:</code> mein variable ka naam braces ke bina dete ho aur Ansible naam aur value dono print karta hai.</li>
<li><code>run_once: true</code> ka matlab "yeh task sirf pehle host par karo", taaki jawab teen baar repeat na ho.</li>
<li>Teesra task <i>doosre</i> host ka variable <code>hostvars</code> se padhta hai: host ka inventory naam quotes mein square brackets ke andar, phir dot aur variable ka naam.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook magic.yml
PLAY [Magic variables] ********************************************************
TASK [Who am I] ***************************************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 at 10.99.0.1 is in groups ['pune', 'routers']"
}
ok: [pun-acc-sw1] => {
    "msg": "pun-acc-sw1 at 10.99.0.10 is in groups ['pune', 'switches']"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 at 10.99.0.2 is in groups ['bengaluru', 'routers']"
}
TASK [Switches in the inventory] **********************************************
ok: [pun-core-r1] => {
    "groups['switches']": [
        "pun-acc-sw1"
    ]
}
TASK [Another host's variable] ************************************************
ok: [pun-core-r1] => {
    "msg": "Bengaluru router is at Bengaluru DC rack B1"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
pun-acc-sw1                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Recap dekho: <code>pun-core-r1</code> par ok=3 hai kyunki dono <code>run_once</code> tasks us par chale, jabki baaki do hosts par ok=1.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Ek host ke magic variables">
<rect x="220" y="20" width="200" height="50" rx="10" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">pun-core-r1</text>
<rect x="20" y="140" width="180" height="55" rx="8" fill="#fde68a"/><text x="110" y="162" text-anchor="middle" class="svg-ink" font-size="12">inventory_hostname</text><text x="110" y="182" text-anchor="middle" class="svg-muted" font-size="11">pun-core-r1</text>
<rect x="230" y="140" width="180" height="55" rx="8" fill="#bbf7d0"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="12">group_names</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="11">pune, routers</text>
<rect x="440" y="140" width="180" height="55" rx="8" fill="#e2e8f0"/><text x="530" y="162" text-anchor="middle" class="svg-ink" font-size="12">doosron ke hostvars</text><text x="530" y="182" text-anchor="middle" class="svg-muted" font-size="11">blr-edge-r2 ...</text>
<line x1="280" y1="70" x2="110" y2="140" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="70" x2="320" y2="140" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="70" x2="530" y2="140" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Har host apna naam, apne groups aur padosiyon ke variables apne aap jaanta hai.</p></div>

<h3>Braces se shuru hone wali value quote karo</h3>
<p>Is chapter ka sabse common YAML trap missing quote hai. YAML value ke shuru mein curly brace dekhkar sochta hai ki aap dictionary likh rahe ho:</p>
<pre class="code">---
- name: Unquoted brace
  hosts: all
  gather_facts: false
  tasks:
    - name: Where am I
      ansible.builtin.debug:
        msg: {{ site }}</pre>
<pre class="out">AUTO01$ ansible-playbook badq.yml --syntax-check
ERROR! We were unable to read either as JSON nor YAML, these are the errors we got from each:
JSON: Expecting value: line 1 column 1 (char 0)
Syntax Error while loading YAML.
  could not find expected ':' in flow mapping
The error appears to be in '/home/netadmin/netauto/badq.yml': line 8, column 14, but may
be elsewhere in the file depending on the exact syntax problem.
The offending line appears to be:
      ansible.builtin.debug:
        msg: {{ site }}
             ^ here
We could be wrong, but this one looks like it might be an issue with
missing quotes. Always quote template expression brackets when they
start a value. For instance:
    with_items:
      - {{ foo }}
Should be written as:
    with_items:
      - "{{ foo }}"</pre>
<p>Fix hai <code>msg: "{{ site }}"</code>. Braces se pehle text wali value, jaise <code>"{{ inventory_hostname }} is up"</code>, bhi aadat ke taur par quote karte hain. Jinn values mein Jinja expression ho sabko quote karo to yeh error shayad hi dikhega. Device ko chhue bina ise pakadne ke liye <code>--syntax-check</code> use karo.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Aisa variable use karna jo sirf ek group par hai, jaise <code>site</code>, aise play mein jo saare hosts par chalta hai. Jis host ke paas woh nahi, woh "undefined variable" error ke saath fail hota hai. Ya to sab ke liye define karo, ya default value se guard karo, jo agla module sikhata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>group_names</code> <i>current</i> host ke groups ki list hai; <code>groups</code> <i>saare</i> groups ki dictionary hai. <code>'routers' in group_names</code> jaisi conditions mein inhe mix mat karo.</p></div>

<div class="scn"><h4>Sites ke across summary page</h4><p>NOC lead ko har site ke liye ek report line chahiye thi jisme Bengaluru router ki location ho jabki play Pune devices par chal raha tha. Router ke inventory naam se <code>hostvars</code> ke through padhne par value mil gayi, bina doosri inventory ya copy-paste ke.</p></div>

<div class="iv"><p class="q">"Ansible mein magic variables kya hote hain?"</p><p>Yeh woh variables hain jo Ansible khud banata hai, jaise <code>inventory_hostname</code>, <code>group_names</code>, <code>groups</code> aur <code>hostvars</code>. Inse ek playbook us host ke hisaab se adapt hota hai jis par chal raha hai, ya doosre host ki values padhta hai. Jinja expression se shuru hone wali value ko main hamesha quote karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Magic variables bina define kiye maujood hote hain: naam, groups, hostvars.</li>
<li><code>group_names</code> is host ke groups; <code>groups</code> har group.</li>
<li><code>hostvars['name'].var</code> doosre host ka variable padhta hai.</li>
<li><code>run_once: true</code> task ko sirf pehle host par chalata hai.</li>
<li>Double curly braces se shuru hone wali values quote karo; <code>--syntax-check</code> galtiyan safely pakadta hai.</li>
</ul></div>
`}};export{e as default};