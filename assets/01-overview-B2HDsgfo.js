var e={id:`overview`,h:{en:`Inventories and variables: what you will learn and why they matter at scale`,hi:`Inventories aur variables: kya seekhoge aur scale par yeh kyun zaroori hain`},body:{en:`
<p><b>What you will learn in this module.</b> In Ansible 1 you wrote an inventory with three devices and a playbook with the values typed inside it. That works for a demo. It breaks the day your company has twelve sites, five device roles and one router that must be "different". This module teaches you to keep <b>what you manage</b> (the inventory) and <b>the values that differ</b> (the variables) outside the playbook, so the same playbook serves every site.</p>
<ul>
<li>A YAML inventory with site groups and role groups.</li>
<li>Host patterns and <code>--limit</code>: choosing exactly which devices a run touches.</li>
<li><code>group_vars</code> and <code>host_vars</code>: shared values and exceptions.</li>
<li>Network connection variables and how to keep the password out of plain text.</li>
<li>Variable precedence: which value wins when two places disagree.</li>
<li>Magic variables such as <code>inventory_hostname</code> and <code>group_names</code>.</li>
<li>A troubleshooting workflow for "this device got the wrong value".</li>
</ul>
<p><b>Prerequisites.</b> Finish <b>Ansible 1</b>. You should be able to write a simple inventory, run ad-hoc commands, and run a playbook with <code>--check</code>. No new tools are needed: the same control node AUTO01 and the same devices R1 (PUN-CORE-R1), R2 (BLR-EDGE-R2) and SW1 (PUN-ACC-SW1).</p>

<h3>Analogy: an office address book with layers</h3>
<p>Imagine a company directory. Everyone gets the same <b>company</b> details (the NOC email). Each <b>city office</b> adds its own address. Each <b>department</b> adds a phone extension. A few individuals have a personal note: "works from the core room". You never retype the company email for every person; you write it once and each person inherits it. Ansible variables work exactly like this: a value defined for <code>all</code> reaches every device, a value defined for a site reaches that site, and a value defined for one host affects only that host. The most specific place wins.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layers of variables from all to one host">
<rect x="20" y="15" width="600" height="46" rx="8" fill="#e2e8f0"/><text x="35" y="43" class="svg-ink" font-size="13">all: login details, snmp_contact (everyone)</text>
<rect x="60" y="71" width="520" height="46" rx="8" fill="#fde68a"/><text x="75" y="99" class="svg-ink" font-size="13">site group (pune, bengaluru): site, snmp_location</text>
<rect x="100" y="127" width="440" height="46" rx="8" fill="#bbf7d0"/><text x="115" y="155" class="svg-ink" font-size="13">role group (routers, switches): role specific values</text>
<rect x="140" y="183" width="360" height="40" rx="8" fill="#bae6fd"/><text x="155" y="208" class="svg-ink" font-size="13">host: pun-core-r1 exceptions (wins)</text>
</svg><p class="cap">General values at the top, specific values at the bottom; the more specific value wins.</p></div>

<h3>The problem in one picture</h3>
<p>Here is what many beginners write. The SNMP location is typed into the playbook:</p>
<pre class="code"><span class="c"># works for one site only, and must be copied for every other site</span>
- name: SNMP identity
  hosts: all
  gather_facts: false
  tasks:
    - name: Location and contact
      cisco.ios.ios_config:
        lines:
          - snmp-server location Pune DC rack A2
          - snmp-server contact noc@nk.lab</pre>
<p>Every device would get "Pune DC rack A2", including Bengaluru. To fix it you would copy the playbook once per site, and then maintain twelve copies. The better design is one playbook with <b>placeholders</b>, and the values stored per site:</p>
<pre class="code">- name: SNMP identity
  hosts: all
  gather_facts: false
  tasks:
    - name: Location and contact
      cisco.ios.ios_config:
        lines:
          - "snmp-server location {{ snmp_location }}"
          - "snmp-server contact {{ snmp_contact }}"</pre>
<p>The double curly braces <code>{{ snmp_location }}</code> are a <b>Jinja2</b> placeholder: Ansible replaces it with the value of the variable <code>snmp_location</code> for the device it is working on. Note the quotes around the whole line; a value that starts with <code>{{</code> must be quoted in YAML. Where does the value come from? From the inventory, <code>group_vars</code> and <code>host_vars</code>, which is the subject of this module.</p>

<div class="eg"><p><b>Worked example.</b> The lab project has three devices. <code>group_vars/all.yml</code> sets <code>snmp_contact: noc@nk.lab</code> once. <code>group_vars/pune.yml</code> sets the Pune location. <code>group_vars/bengaluru.yml</code> sets the Bengaluru location. <code>host_vars/pun-core-r1.yml</code> overrides the location for the core router alone. One playbook, four small data files, three correct devices.</p></div>

<h3>Inventory is data, playbooks are logic</h3>
<p>This separation is the most important habit in Ansible. Playbooks say <b>what to do</b>; inventory and variables say <b>to whom, and with which values</b>. When a requirement changes ("the Bengaluru rack moved") you edit one line of data. The playbook, which was reviewed and tested, stays untouched.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Hard-coding addresses, site names or VLAN lists inside tasks "just for now". Months later nobody knows which of ten playbooks holds the real value. Decide early: anything that can differ between devices is a variable.</p></div>
<div class="exam"><p><b>Exam trap.</b> The question "which value wins?" is a classic. Remember the rule of thumb: the more specific the source, the stronger it is, and extra vars given with <code>-e</code> beat everything.</p></div>

<div class="scn"><h4>Twelve copies of one playbook</h4><p>An enterprise kept one NTP playbook per site, each with its own hard-coded server. When the NTP address changed, nine of twelve copies were updated; three sites silently kept the old server for a month. After the team moved the address into <code>group_vars/all.yml</code>, one edit updated every site and the recap showed any device that already matched.</p><p><b>Lesson:</b> repeated values are future inconsistencies. Store each value once, at the widest level where it is true.</p></div>

<div class="iv"><p class="q">"Why do you keep variables out of the playbook?"</p><p>So the playbook stays generic and reusable across sites and environments, while the data that differs lives in the inventory, <code>group_vars</code> and <code>host_vars</code>. Changes then become small data edits rather than logic edits, are easier to review, and avoid copy-paste drift. I would also mention that secrets are kept in encrypted files, not in tasks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Playbooks hold logic; the inventory and variables hold the data that differs.</li>
<li>Variables are inherited from <code>all</code>, then site or role groups, then the host; the most specific wins.</li>
<li><code>{{ name }}</code> is a Jinja2 placeholder and must be quoted when a YAML value starts with it.</li>
<li>One playbook plus small data files replaces many copies.</li>
<li>This module builds the YAML inventory, the variable files and the debugging skills.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Ansible 1 mein aapne teen devices wali inventory aur ek playbook likha tha jisme values andar type thin. Demo ke liye yeh chalta hai. Jis din company ke barah sites, paanch device roles aur ek router "alag" hoga, yeh toot jaata hai. Yeh module sikhata hai ki <b>aap kya manage karte ho</b> (inventory) aur <b>kaunsi values alag hain</b> (variables) ko playbook ke bahar rakho, taaki wahi playbook har site ke kaam aaye.</p>
<ul>
<li>Site groups aur role groups wali YAML inventory.</li>
<li>Host patterns aur <code>--limit</code>: bilkul tay karna ki run kin devices ko chhuega.</li>
<li><code>group_vars</code> aur <code>host_vars</code>: shared values aur exceptions.</li>
<li>Network connection variables aur password ko plain text se bahar rakhna.</li>
<li>Variable precedence: do jagah alag value ho to kaunsi jeet-ti hai.</li>
<li><code>inventory_hostname</code> aur <code>group_names</code> jaise magic variables.</li>
<li>"Is device ko galat value mili" ke liye troubleshooting workflow.</li>
</ul>
<p><b>Prerequisites.</b> <b>Ansible 1</b> poora karo. Aapko simple inventory likhna, ad-hoc commands chalana, aur <code>--check</code> ke saath playbook chalana aana chahiye. Koi naya tool nahi chahiye: wahi control node AUTO01 aur wahi devices R1 (PUN-CORE-R1), R2 (BLR-EDGE-R2) aur SW1 (PUN-ACC-SW1).</p>

<h3>Analogy: layers wali office address book</h3>
<p>Company directory socho. Sabko wahi <b>company</b> details milte hain (NOC email). Har <b>city office</b> apna address jodta hai. Har <b>department</b> phone extension jodta hai. Kuch logon ka personal note hota hai: "core room se kaam karta hai". Aap har insaan ke liye company email dobara type nahi karte; ek baar likhte ho aur har insaan use inherit karta hai. Ansible variables bilkul aise hi kaam karte hain: <code>all</code> ke liye define value har device tak pahunchti hai, site ke liye define value us site tak, aur ek host ke liye define value sirf usi host par asar karti hai. Sabse specific jagah jeet-ti hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="all se ek host tak variables ki layers">
<rect x="20" y="15" width="600" height="46" rx="8" fill="#e2e8f0"/><text x="35" y="43" class="svg-ink" font-size="13">all: login details, snmp_contact (sabke liye)</text>
<rect x="60" y="71" width="520" height="46" rx="8" fill="#fde68a"/><text x="75" y="99" class="svg-ink" font-size="13">site group (pune, bengaluru): site, snmp_location</text>
<rect x="100" y="127" width="440" height="46" rx="8" fill="#bbf7d0"/><text x="115" y="155" class="svg-ink" font-size="13">role group (routers, switches): role ki values</text>
<rect x="140" y="183" width="360" height="40" rx="8" fill="#bae6fd"/><text x="155" y="208" class="svg-ink" font-size="13">host: pun-core-r1 ke exceptions (jeet-ta hai)</text>
</svg><p class="cap">Upar general values, neeche specific values; jo value zyada specific hai woh jeet-ti hai.</p></div>

<h3>Problem ek tasveer mein</h3>
<p>Yeh woh hai jo bahut se beginners likhte hain. SNMP location playbook ke andar type hai:</p>
<pre class="code"><span class="c"># sirf ek site ke liye chalta hai, aur har doosri site ke liye copy karna padta hai</span>
- name: SNMP identity
  hosts: all
  gather_facts: false
  tasks:
    - name: Location and contact
      cisco.ios.ios_config:
        lines:
          - snmp-server location Pune DC rack A2
          - snmp-server contact noc@nk.lab</pre>
<p>Har device ko "Pune DC rack A2" milega, Bengaluru bhi. Theek karne ke liye aap har site ka playbook copy karoge, phir barah copies maintain karoge. Behtar design: ek playbook <b>placeholders</b> ke saath, aur values har site ke hisaab se alag store:</p>
<pre class="code">- name: SNMP identity
  hosts: all
  gather_facts: false
  tasks:
    - name: Location and contact
      cisco.ios.ios_config:
        lines:
          - "snmp-server location {{ snmp_location }}"
          - "snmp-server contact {{ snmp_contact }}"</pre>
<p>Double curly braces <code>{{ snmp_location }}</code> ek <b>Jinja2</b> placeholder hain: Ansible ise us device ke liye <code>snmp_location</code> variable ki value se replace kar deta hai jis par woh kaam kar raha hai. Poori line ke quotes dhyan se dekho; jo value <code>{{</code> se shuru ho use YAML mein quote karna padta hai. Value kahan se aati hai? Inventory, <code>group_vars</code> aur <code>host_vars</code> se, jo is module ka vishay hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab project mein teen devices hain. <code>group_vars/all.yml</code> <code>snmp_contact: noc@nk.lab</code> ek baar set karta hai. <code>group_vars/pune.yml</code> Pune ki location set karta hai. <code>group_vars/bengaluru.yml</code> Bengaluru ki location. <code>host_vars/pun-core-r1.yml</code> akele core router ki location override karta hai. Ek playbook, chaar chhoti data files, teen sahi devices.</p></div>

<h3>Inventory data hai, playbooks logic hain</h3>
<p>Yeh separation Ansible ki sabse zaroori aadat hai. Playbooks batate hain <b>kya karna hai</b>; inventory aur variables batate hain <b>kisko, aur kaunsi values ke saath</b>. Requirement badle ("Bengaluru ka rack shift hua") to aap data ki ek line edit karte ho. Playbook, jo reviewed aur tested tha, jaisa tha waisa rehta hai.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Addresses, site names ya VLAN lists ko "abhi ke liye" tasks ke andar hard-code karna. Mahino baad kisi ko pata nahi hota ki das playbooks mein se asli value kahan hai. Pehle hi tay karo: jo cheez devices mein alag ho sakti hai woh variable hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsi value jeet-ti hai?" classic sawaal hai. Rule of thumb yaad rakho: source jitna specific, utna mazboot, aur <code>-e</code> se diye extra vars sabko harate hain.</p></div>

<div class="scn"><h4>Ek playbook ki barah copies</h4><p>Ek enterprise har site ke liye alag NTP playbook rakhta tha, har ek mein apna hard-coded server. NTP address badla to barah mein se nau copies update hui; teen sites ek mahine tak chupchaap purana server use karti rahin. Team ne address <code>group_vars/all.yml</code> mein daala to ek edit se har site update ho gayi aur recap ne dikhaya ki kaun sa device pehle se match karta tha.</p><p><b>Lesson:</b> repeat hui values future ki inconsistencies hain. Har value ek baar store karo, sabse wide level par jahan woh sach hai.</p></div>

<div class="iv"><p class="q">"Variables ko playbook se bahar kyun rakhte ho?"</p><p>Taaki playbook generic aur sites aur environments mein reusable rahe, aur jo data alag hai woh inventory, <code>group_vars</code> aur <code>host_vars</code> mein rahe. Tab changes logic edits ki jagah chhote data edits ban jaate hain, review aasaan hota hai, aur copy-paste drift nahi hota. Main yeh bhi kahunga ki secrets encrypted files mein rakhte hain, tasks mein nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Playbooks logic rakhte hain; inventory aur variables woh data jo alag hota hai.</li>
<li>Variables <code>all</code> se, phir site ya role groups, phir host se inherit hote hain; sabse specific jeet-ta hai.</li>
<li><code>{{ name }}</code> Jinja2 placeholder hai aur YAML value is se shuru ho to quote karna padta hai.</li>
<li>Ek playbook plus chhoti data files bahut si copies ki jagah leti hain.</li>
<li>Yeh module YAML inventory, variable files aur debugging skills banata hai.</li>
</ul></div>
`}};export{e as default};