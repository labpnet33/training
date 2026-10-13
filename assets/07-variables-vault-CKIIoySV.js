var e={id:`variables-vault`,h:{en:`Variables, loops and a source of truth (and keeping secrets safe)`,hi:`Variables, loops aur source of truth (aur secrets ko safe rakhna)`},body:{en:`

<p><b>One idea in this chapter:</b> keep the <b>data</b> (which VLANs, which servers) apart from the <b>tasks</b> (how to apply them). Then a new VLAN is two new lines of data, and the tasks never change.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Change the data, not the tasks. The same tasks build whatever the data describes."><rect x="10" y="28" width="182" height="68" rx="10" fill="#bae6fd"/><text x="101" y="58" text-anchor="middle" class="svg-ink" font-size="14">Data</text><text x="101" y="78" text-anchor="middle" class="svg-muted" font-size="12">vars: vlans, ports</text><line x1="192" y1="62" x2="222" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="222,57 228,62 222,67" fill="#64748b"/><text x="210" y="50" text-anchor="middle" class="svg-accent" font-size="11">fills</text><rect x="228" y="28" width="182" height="68" rx="10" fill="#bbf7d0"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="14">Tasks</text><text x="319" y="78" text-anchor="middle" class="svg-muted" font-size="12">same text always</text><line x1="410" y1="62" x2="440" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="440,57 446,62 440,67" fill="#64748b"/><text x="428" y="50" text-anchor="middle" class="svg-accent" font-size="11">push</text><rect x="446" y="28" width="182" height="68" rx="10" fill="#fde68a"/><text x="537" y="58" text-anchor="middle" class="svg-ink" font-size="14">Devices</text><text x="537" y="78" text-anchor="middle" class="svg-muted" font-size="12">SW1, SW2</text></svg><p class="cap">Change the data, not the tasks. The same tasks build whatever the data describes.</p></div>

<h3>Variables and the double curly braces</h3>
<p>A <b>variable</b> is a named value. Defined once under <code>vars:</code>, it can be used anywhere in the play by writing its name inside double curly braces. In <code>ntp.yml</code> we saw <code>noc_server: 10.99.0.100</code> used twice as <code>{{ noc_server }}</code>. Change the address in one place and both lines follow. Hard-coding the same value in many tasks means editing many places and missing one.</p>
<p>A rule worth remembering: if a value <i>starts</i> with <code>{{</code>, put the whole value in quotes (<code>config: "{{ vlans }}"</code>), otherwise YAML thinks the braces are the start of a dictionary. When the braces are in the middle of a line, as in <code>interface {{ item.port }}</code>, no quotes are needed.</p>

<h3>Lists of data and the loop keyword</h3>
<p>Data can be a list of items, each with several fields. Here is the real <code>vlans.yml</code> from Lab 2:</p>
<pre class="code">---
<span class="c"># vlans.yml - the DATA under vars is the source of truth; the TASKS never change</span>
- name: Build VLANs and port descriptions from data
  hosts: switches
  gather_facts: no

  vars:
    <span class="c"># ---- source of truth: edit ONLY this part ----</span>
    vlans:
      - vlan_id: 10
        name: SALES
      - vlan_id: 20
        name: ACCOUNTS
    ports:
      - port: GigabitEthernet0/2
        desc: PRINTER-FLOOR1
    <span class="c"># ---- end of data ----</span>

  tasks:
    - name: Create every VLAN listed in vlans
      ios_vlans:
        config: "{{ vlans }}"
        state: merged

    - name: Describe every port listed in ports
      ios_config:
        parents: interface {{ item.port }}
        lines:
          - description {{ item.desc }}
      loop: "{{ ports }}"</pre>
<p>Read it from the middle. Under <code>vars:</code> the list <code>vlans</code> has two items (id and name each), and the list <code>ports</code> has one. This part is the <b>source of truth</b>: the one place that says how the switches should look. The two tasks below it never mention a number.</p>
<ul>
<li>The task <code>ios_vlans</code> is given the whole list at once: <code>config: "{{ vlans }}"</code>. <code>state: merged</code> means "add or update these, remove nothing else". The module doc lists other states: <code>replaced</code>, <code>overridden</code> (removes VLANs not listed, careful), <code>deleted</code> and <code>gathered</code>.</li>
<li>The task <code>ios_config</code> must act once per port, so it uses <b><code>loop:</code></b>. In the loop, <code>item</code> is the current entry, so <code>{{ item.port }}</code> and <code>{{ item.desc }}</code> pick its two fields. It behaves like "interface range", doing one port at a time. The answer to Lab 2's first question is the keyword <code>loop</code>.</li>
</ul>
<p>The <code>parents:</code> parameter puts the line under an interface, exactly as you would type <code>interface GigabitEthernet0/2</code> then <code>description PRINTER-FLOOR1</code>.</p>

<h3>Adding a VLAN by editing only the data</h3>
<p>Management asks for VLAN 30 named VOICE. In the lab the line numbers matter: the data list ends at line 13, so the new item goes after it. Use the line-insert command of the lab host (a real editor does the same job):</p>
<pre class="code">insert vlans.yml 14 '      - vlan_id: 30'
insert vlans.yml 15 '        name: VOICE'
yaml validate vlans.yml
ansible-playbook -i inventory.ini vlans.yml --check
ansible-playbook -i inventory.ini vlans.yml</pre>
<pre class="out">    14        - vlan_id: 30
    15          name: VOICE
vlans.yml: valid YAML (list with 1 item(s))
[NOTE] check mode (--check): nothing will be changed on the devices; "changed" means "would change".

PLAY [Build VLANs and port descriptions from data] ****************************

TASK [Create every VLAN listed in vlans] **************************************
changed: [SW1]
changed: [SW2]

TASK [Describe every port listed in ports] ************************************
ok: [SW1] =&gt; (item={"port": "GigabitEthernet0/2", "desc": "PRINTER-FLOOR1"})
ok: [SW2] =&gt; (item={"port": "GigabitEthernet0/2", "desc": "PRINTER-FLOOR1"})

PLAY RECAP ********************************************************************
SW1                        : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
SW2                        : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>(The real run prints the same recap without the NOTE line.) The six-space dash lines up with the other VLAN dashes, and the eight-space <code>name</code> lines up with <code>vlan_id</code>. The plan is as small as it should be: only the VLAN task changes; the port description is already right. The final run of the whole playbook then reports <code>changed=0</code> for SW1 and SW2: the network now equals the data.</p>

<h3>Where variables live in real projects</h3>
<p>Reference configuration (not run in the simulator). A real project does not keep data inside the playbook. A folder layout such as this is common:</p>
<pre class="code">inventory.ini
playbooks/vlans.yml
group_vars/switches.yml      <span class="c"># variables for the group "switches"</span>
host_vars/SW1.yml            <span class="c"># variables for one host</span>
<span class="c"># group_vars/switches.yml</span>
vlans:
  - vlan_id: 10
    name: SALES</pre>
<p>Ansible picks these files up automatically by their names. The Ansible track teaches the layout and the order in which Ansible merges variables (precedence). For this exam you need the idea: data is separate from tasks, and the data file is what you review in a pull request.</p>

<h3>Secrets: never in plain text</h3>
<p>Reference configuration (not run in the simulator). Variables sometimes hold passwords and tokens. A plain-text secret in Git is a leak waiting to happen (chapter 7 of the Git module). <b>Ansible Vault</b> encrypts a value or a whole file with a password, so the encrypted text can be committed safely and decrypted only at run time. The commands are, in outline:</p>
<pre class="code">ansible-vault encrypt_string 'PLACEHOLDER-SECRET' --name 'ansible_password'
ansible-playbook -i inventory.ini site.yml --ask-vault-pass</pre>
<p>The first command prints a block that starts with <code>!vault |</code> which you paste into a variable file. The second asks for the vault password when the playbook runs. In an automated pipeline the vault password itself is stored as a masked, protected CI variable, never in the repository. The lab inventory contains a simple lab-only password so exercises can run, but you should never copy that habit to a real network.</p>

<div class="eg"><p><b>Worked example.</b> Lab 2, tasks 4 and 5. You insert the two VLAN 30 lines, run --check (changed=1 per switch), then the real run, then one more run: all tasks ok, changed=0. The check at the end of the lab also confirms that the task lines were not touched: there is still exactly one ios_vlans task and no hard-coded vlan 30.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Hard-coding values in tasks. Forgetting quotes around a value that starts with {{. Using the wrong indentation when adding a list item (the dash must line up with the others). Choosing state overridden by accident and removing VLANs that were not in the list. Committing a password in plain text.</p></div>
<div class="exam"><p><b>Exam trap.</b> Variables are used with {{ name }}. A loop repeats a task per item and exposes item. The data file is the source of truth. Ansible Vault encrypts secrets; the vault password must be kept out of the repository.</p></div>

<div class="scn"><h4>Fifty switches, one data file</h4><p>A university needed the same twelve VLANs on fifty access switches, and a new lecture-hall VLAN every term. The first year, the VLAN commands were copied inside the playbook and every term someone forgot a switch. The second year the VLAN list moved to one data file and the tasks stayed fixed. Adding a VLAN became a two-line pull request, reviewed by a second person, applied to all fifty switches, and verified with a second run that showed changed=0.</p><p><b>Lesson:</b> a single data file is easier to review than fifty configurations.</p></div>
<div class="iv"><p class="q">"Why separate data from tasks in Ansible, and how do you protect secrets?"</p><p>Tasks say how to apply configuration and the data says what the configuration is. With variables and loops, a change is a small edit to the data and the tasks never change, so reviews and Git history are clear and the same tasks serve every site. Secrets are not stored in plain text in Git; they are encrypted with Ansible Vault, or injected from masked CI variables or a secrets manager at run time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Variables hold data; use them as {{ name }} and quote values that start with {{.</li><li>loop repeats a task for each list item and gives you item.</li><li>The data section is the source of truth; tasks stay the same when the data changes.</li><li>In real projects data lives in group_vars and host_vars files.</li><li>Never keep plain-text secrets in Git: use Ansible Vault or masked CI variables.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> <b>data</b> (kaun se VLANs, kaun se servers) ko <b>tasks</b> (unhe kaise apply karna hai) se alag rakho. Phir naya VLAN data ki do nayi lines hai, aur tasks kabhi nahi badalte.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Data badlo, tasks nahi. Wahi tasks wo sab bana dete hain jo data batata hai."><rect x="10" y="28" width="182" height="68" rx="10" fill="#bae6fd"/><text x="101" y="58" text-anchor="middle" class="svg-ink" font-size="14">Data</text><text x="101" y="78" text-anchor="middle" class="svg-muted" font-size="12">vars: vlans, ports</text><line x1="192" y1="62" x2="222" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="222,57 228,62 222,67" fill="#64748b"/><text x="210" y="50" text-anchor="middle" class="svg-accent" font-size="11">fills</text><rect x="228" y="28" width="182" height="68" rx="10" fill="#bbf7d0"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="14">Tasks</text><text x="319" y="78" text-anchor="middle" class="svg-muted" font-size="12">hamesha same text</text><line x1="410" y1="62" x2="440" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="440,57 446,62 440,67" fill="#64748b"/><text x="428" y="50" text-anchor="middle" class="svg-accent" font-size="11">push</text><rect x="446" y="28" width="182" height="68" rx="10" fill="#fde68a"/><text x="537" y="58" text-anchor="middle" class="svg-ink" font-size="14">Devices</text><text x="537" y="78" text-anchor="middle" class="svg-muted" font-size="12">SW1, SW2</text></svg><p class="cap">Change the data, not the tasks. The same tasks build whatever the data describes.</p></div>

<h3>Variables aur double curly braces</h3>
<p><b>Variable</b> ek naam wali value hai. <code>vars:</code> ke neeche ek baar define karo, phir play mein kahin bhi uska naam double curly braces ke andar likhkar use kar sakte ho. <code>ntp.yml</code> mein humne <code>noc_server: 10.99.0.100</code> ko do baar <code>{{ noc_server }}</code> ki tarah use hote dekha. Address ek jagah badlo aur dono lines follow karti hain. Wahi value kai tasks mein hard-code karne ka matlab kai jagah edit karna aur ek chhoot jaana.</p>
<p>Yaad rakhne wala rule: agar value <code>{{</code> se <i>shuru</i> ho, to poori value quotes mein rakho (<code>config: "{{ vlans }}"</code>), warna YAML braces ko dictionary ki shuruaat samajhta hai. Jab braces line ke beech mein hon, jaise <code>interface {{ item.port }}</code>, to quotes ki zaroorat nahi.</p>

<h3>Data ki lists aur loop keyword</h3>
<p>Data items ki list ho sakta hai, har item mein kai fields. Yeh Lab 2 ki asli <code>vlans.yml</code> hai:</p>
<pre class="code">---
<span class="c"># vlans.yml - the DATA under vars is the source of truth; the TASKS never change</span>
- name: Build VLANs and port descriptions from data
  hosts: switches
  gather_facts: no

  vars:
    <span class="c"># ---- source of truth: edit ONLY this part ----</span>
    vlans:
      - vlan_id: 10
        name: SALES
      - vlan_id: 20
        name: ACCOUNTS
    ports:
      - port: GigabitEthernet0/2
        desc: PRINTER-FLOOR1
    <span class="c"># ---- end of data ----</span>

  tasks:
    - name: Create every VLAN listed in vlans
      ios_vlans:
        config: "{{ vlans }}"
        state: merged

    - name: Describe every port listed in ports
      ios_config:
        parents: interface {{ item.port }}
        lines:
          - description {{ item.desc }}
      loop: "{{ ports }}"</pre>
<p>Ise beech se padho. <code>vars:</code> ke neeche list <code>vlans</code> mein do items hain (har ek mein id aur name), aur list <code>ports</code> mein ek. Yeh hissa <b>source of truth</b> hai: woh ek jagah jo batati hai ki switches kaise dikhne chahiye. Uske neeche ke do tasks mein koi number nahi aata.</p>
<ul>
<li>Task <code>ios_vlans</code> ko poori list ek saath di jaati hai: <code>config: "{{ vlans }}"</code>. <code>state: merged</code> ka matlab "yeh add ya update karo, aur kuch mat hatao". Module doc doosre states bhi list karta hai: <code>replaced</code>, <code>overridden</code> (jo VLANs list mein nahi unhe hata deta hai, savdhan), <code>deleted</code> aur <code>gathered</code>.</li>
<li>Task <code>ios_config</code> ko har port par ek baar chalna hai, isliye woh <b><code>loop:</code></b> use karta hai. Loop ke andar <code>item</code> current entry hai, isliye <code>{{ item.port }}</code> aur <code>{{ item.desc }}</code> uske do fields uthate hain. Yeh "interface range" jaisa hai, ek-ek port karta hua. Lab 2 ke pehle sawaal ka jawab keyword <code>loop</code> hai.</li>
</ul>
<p><code>parents:</code> parameter line ko interface ke andar rakhta hai, bilkul jaise aap <code>interface GigabitEthernet0/2</code> aur phir <code>description PRINTER-FLOOR1</code> type karte.</p>

<h3>Sirf data edit karke VLAN jodna</h3>
<p>Management VLAN 30 naam VOICE maangta hai. Lab mein line numbers matter karte hain: data list line 13 par khatam hoti hai, isliye naya item uske baad jaata hai. Lab host ka line-insert command use karo (asli editor wahi kaam karta hai):</p>
<pre class="code">insert vlans.yml 14 '      - vlan_id: 30'
insert vlans.yml 15 '        name: VOICE'
yaml validate vlans.yml
ansible-playbook -i inventory.ini vlans.yml --check
ansible-playbook -i inventory.ini vlans.yml</pre>
<pre class="out">    14        - vlan_id: 30
    15          name: VOICE
vlans.yml: valid YAML (list with 1 item(s))
[NOTE] check mode (--check): nothing will be changed on the devices; "changed" means "would change".

PLAY [Build VLANs and port descriptions from data] ****************************

TASK [Create every VLAN listed in vlans] **************************************
changed: [SW1]
changed: [SW2]

TASK [Describe every port listed in ports] ************************************
ok: [SW1] =&gt; (item={"port": "GigabitEthernet0/2", "desc": "PRINTER-FLOOR1"})
ok: [SW2] =&gt; (item={"port": "GigabitEthernet0/2", "desc": "PRINTER-FLOOR1"})

PLAY RECAP ********************************************************************
SW1                        : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
SW2                        : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>(Asli run NOTE line ke bina wahi recap print karta hai.) Chhe-space wala dash baaki VLAN dashes ke saath line mein hai, aur aath-space wala <code>name</code> <code>vlan_id</code> ke saath. Plan utna hi chhota hai jitna hona chahiye: sirf VLAN task badlega; port description pehle se sahi hai. Poore playbook ka aakhri run phir SW1 aur SW2 ke liye <code>changed=0</code> report karta hai: network ab data ke barabar hai.</p>

<h3>Asli projects mein variables kahan rehte hain</h3>
<p>Reference configuration (not run in the simulator). Asli project data ko playbook ke andar nahi rakhta. Aisa folder layout aam hai:</p>
<pre class="code">inventory.ini
playbooks/vlans.yml
group_vars/switches.yml      <span class="c"># group "switches" ke variables</span>
host_vars/SW1.yml            <span class="c"># ek host ke variables</span>
<span class="c"># group_vars/switches.yml</span>
vlans:
  - vlan_id: 10
    name: SALES</pre>
<p>Ansible in files ko unke naam se apne aap utha leta hai. Ansible track layout aur woh order sikhata hai jisme Ansible variables merge karta hai (precedence). Is exam ke liye idea chahiye: data tasks se alag hai, aur data file woh hai jise aap pull request mein review karte ho.</p>

<h3>Secrets: kabhi plain text mein nahi</h3>
<p>Reference configuration (not run in the simulator). Variables kabhi passwords aur tokens rakhte hain. Git mein plain-text secret leak hone ka intezaar hai (Git module ka chapter 7). <b>Ansible Vault</b> ek value ya poori file ko password se encrypt karta hai, isliye encrypted text safely commit ho sakta hai aur sirf run time par decrypt hota hai. Commands, outline mein:</p>
<pre class="code">ansible-vault encrypt_string 'PLACEHOLDER-SECRET' --name 'ansible_password'
ansible-playbook -i inventory.ini site.yml --ask-vault-pass</pre>
<p>Pehla command ek block print karta hai jo <code>!vault |</code> se shuru hota hai jise aap variable file mein paste karte ho. Doosra playbook chalte waqt vault password maangta hai. Automated pipeline mein vault password khud masked, protected CI variable mein store hota hai, repository mein kabhi nahi. Lab inventory mein ek simple lab-only password hai taaki exercises chal sakein, par yeh aadat asli network par kabhi mat apnao.</p>

<div class="eg"><p><b>Worked example.</b> Lab 2, tasks 4 aur 5. Aap VLAN 30 ki do lines insert karte ho, --check chalate ho (har switch par changed=1), phir asli run, phir ek aur run: saare tasks ok, changed=0. Lab ke end ka check yeh bhi confirm karta hai ki task lines ko chhua nahi gaya: ab bhi exactly ek ios_vlans task hai aur koi hard-coded vlan 30 nahi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Tasks mein values hard-code karna. {{ se shuru hone wali value ke aas-paas quotes bhool jaana. List item jodte waqt galat indentation (dash baakiyon ke saath line mein hona chahiye). Galti se state overridden chun lena aur woh VLANs hata dena jo list mein nahi the. Password plain text mein commit karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Variables {{ name }} se use hote hain. Loop har item ke liye task repeat karta hai aur item deta hai. Data file source of truth hai. Ansible Vault secrets encrypt karta hai; vault password repository se bahar rakhna hai.</p></div>

<div class="scn"><h4>Pachas switches, ek data file</h4><p>Ek university ko pachas access switches par wahi barah VLANs chahiye the, aur har term mein ek naya lecture-hall VLAN. Pehle saal VLAN commands playbook ke andar copy the aur har term koi na koi switch bhool jaata tha. Doosre saal VLAN list ek data file mein gayi aur tasks fixed rahe. VLAN jodna do-line ka pull request ban gaya, jise doosra insaan review karta, pachas switches par apply hota, aur doosre run se verify hota jo changed=0 dikhata.</p><p><b>Lesson:</b> ek data file pachas configurations se review karna aasan hai.</p></div>
<div class="iv"><p class="q">"Ansible mein data ko tasks se alag kyun karte hain, aur secrets ko kaise protect karte ho?"</p><p>Tasks batate hain configuration kaise apply karni hai aur data batata hai configuration kya hai. Variables aur loops ke saath change data ka chhota edit hota hai aur tasks nahi badalte, isliye reviews aur Git history saaf rehte hain aur wahi tasks har site ko serve karte hain. Secrets Git mein plain text mein nahi rakhte; unhe Ansible Vault se encrypt karte hain, ya run time par masked CI variables ya secrets manager se inject karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Variables data rakhte hain; {{ name }} se use karo aur {{ se shuru hone wali values ko quote karo.</li><li>loop har list item ke liye task repeat karta hai aur item deta hai.</li><li>Data section source of truth hai; data badalne par tasks wahi rehte hain.</li><li>Asli projects mein data group_vars aur host_vars files mein rehta hai.</li><li>Plain-text secrets Git mein kabhi nahi: Ansible Vault ya masked CI variables use karo.</li></ul></div>

`}};export{e as default};