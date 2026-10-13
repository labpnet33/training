var e={id:`overview`,h:{en:`Roles: packaging automation so teams can reuse it`,hi:`Roles: automation ko package karna taaki teams reuse kar sakein`},body:{en:`
<p><b>What you will learn in this module.</b> You will turn one long playbook into a <b>role</b>: a folder with a standard layout that holds tasks, default values, templates and handlers. You will learn what each folder is for, how variables from different places compete, how handlers and tags work, how to reuse a role in other playbooks, how to organise a whole network automation repository, and how to keep device passwords out of plain text with Ansible Vault.</p>
<p><b>Prerequisites.</b> You have run a playbook with <code>cisco.ios.ios_config</code> (module <i>auto-ansible</i> and the first modules of this track) and you know what a variable is. Rendering templates with Jinja2 (module 4) helps for chapter 3 but is not required. We explain every line.</p>

<h3>Analogy: the recipe card binder</h3>
<p>A busy restaurant does not keep one handwritten page with every recipe mixed together. It keeps a binder of <b>recipe cards</b>. Every card has the same sections: ingredients, steps, notes. A new cook finds a card by its name, and the head chef only says "make the base sauce for tables one to forty". A role is a recipe card. The playbook is the head chef's order.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="One long playbook versus a short playbook plus roles">
<rect x="20" y="20" width="250" height="150" rx="12" fill="#fed7aa"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="14">Before: baseline.yml</text><text x="145" y="75" text-anchor="middle" class="svg-muted" font-size="12">values typed inside tasks</text><text x="145" y="95" text-anchor="middle" class="svg-muted" font-size="12">save runs every time</text><text x="145" y="115" text-anchor="middle" class="svg-muted" font-size="12">copy-pasted to other projects</text>
<rect x="370" y="20" width="250" height="60" rx="12" fill="#fde68a"/><text x="495" y="45" text-anchor="middle" class="svg-ink" font-size="14">After: site.yml</text><text x="495" y="65" text-anchor="middle" class="svg-muted" font-size="12">roles: [ nk_base ]</text>
<rect x="370" y="105" width="250" height="65" rx="12" fill="#bbf7d0"/><text x="495" y="130" text-anchor="middle" class="svg-ink" font-size="14">roles/nk_base/</text><text x="495" y="150" text-anchor="middle" class="svg-muted" font-size="12">defaults, tasks, handlers, templates</text>
<line x1="270" y1="95" x2="370" y2="50" stroke="#64748b" stroke-width="2"/><line x1="270" y1="95" x2="370" y2="135" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The what stays in the playbook; the how moves into the role.</p></div>

<h3>The problem a role solves</h3>
<p>This is the team's current <code>baseline.yml</code> on the control node AUTO01, project <code>~/netauto</code>. It works, but look at the weaknesses:</p>
<pre class="out">netadmin@auto01:~/netauto$ cat baseline.yml
---
# One long playbook, values typed into the tasks. Being replaced by the nk_base role.
- name: Base config
  hosts: all
  gather_facts: false
  tasks:
    - name: NTP
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.60
    - name: Syslog
      cisco.ios.ios_config:
        lines:
          - logging host 10.99.0.60
    - name: Login banner
      cisco.ios.ios_banner:
        banner: login
        text: Authorised access only. Disconnect now if you are not.
        state: present
    - name: Save
      cisco.ios.ios_config:
        save_when: always</pre>
<ul>
<li>The addresses and the banner are typed inside the tasks. To give one site another syslog host you must edit the playbook.</li>
<li>The last task saves on <i>every</i> run, even when nothing changed.</li>
<li>Another team that wants the same baseline copies the whole file, and the two copies slowly drift apart.</li>
</ul>

<h3>The idea of a role</h3>
<p>A role is simply a folder with agreed sub-folders. Ansible knows the names, so you never write paths: it loads <code>tasks/main.yml</code>, <code>defaults/main.yml</code>, <code>handlers/main.yml</code> by itself. The command <code>ansible-galaxy role init</code> creates the empty skeleton:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-galaxy role init --init-path roles nk_base
- Role nk_base was created successfully
netadmin@auto01:~/netauto$ ls -R roles
roles:
nk_base

roles/nk_base:
defaults  files  handlers  meta  README.md  tasks  templates  tests  vars

roles/nk_base/defaults:
main.yml
...</pre>
<p><code>--init-path roles</code> says "create it inside the roles folder". <code>nk_base</code> is the role name. We use a short lowercase name with underscores: dashes and dots can confuse Ansible. A team prefix (<code>nk_</code>) avoids clashes with roles from other places.</p>

<h3>The plan for this module</h3>
<ol>
<li>Chapter 2: what every folder in the role is for.</li>
<li>Chapter 3: templates inside a role.</li>
<li>Chapter 4: defaults, vars and who wins when values collide.</li>
<li>Chapter 5: handlers and tags.</li>
<li>Chapter 6: using, combining and reusing roles.</li>
<li>Chapter 7: the layout of a whole automation repository.</li>
<li>Chapter 8: secrets with Vault, and a troubleshooting workflow.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Creating a role for every three-line task. A role earns its place when the work is reusable (every device needs it) or when it has its own variables, templates or handlers. A single one-off task can stay in the playbook.</p></div>
<div class="exam"><p><b>Exam trap.</b> A role has no <code>hosts:</code> line. The <i>playbook</i> says which hosts; the role only says what to do. A role is not run directly: it is called from a play.</p></div>

<div class="scn"><h4>Two sites, two copies, two behaviours</h4><p>Two engineers each kept a private copy of the base playbook. One copy saved the config after every task, the other never saved, and nobody knew which routers would lose their NTP lines at the next reload. The team moved the logic into one role with a save handler, and both engineers called the same role from their own playbooks.</p><p><b>Lesson:</b> one reviewed role beats many private copies.</p></div>

<div class="iv"><p class="q">"What is an Ansible role and why would you use one?"</p><p>A role is a standard folder layout (tasks, defaults, vars, handlers, templates, files, meta) that packages reusable automation. It lets you share and version the work, keep values in variables so sites can override them, and keep playbooks short. Mention that a play calls roles and that ansible-galaxy role init creates the skeleton.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A role is a folder with a fixed layout that Ansible loads by name.</li>
<li>Playbooks say what and where; roles hold how.</li>
<li>ansible-galaxy role init --init-path roles NAME creates the skeleton.</li>
<li>Roles stop copy-paste drift between playbooks and teams.</li>
<li>Do not wrap trivial one-off tasks in a role.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap ek lambe playbook ko <b>role</b> mein badloge: standard layout wala folder jisme tasks, default values, templates aur handlers hote hain. Aap seekhoge ki har folder kis kaam ka hai, alag-alag jagah ke variables kaise compete karte hain, handlers aur tags kaise kaam karte hain, role ko doosre playbooks mein kaise reuse karte hain, poori network automation repository kaise organise karte hain, aur device passwords ko Ansible Vault se plain text se kaise bahar rakhte hain.</p>
<p><b>Prerequisites.</b> Aapne <code>cisco.ios.ios_config</code> ke saath playbook chalaya ho (module <i>auto-ansible</i> aur is track ke pehle modules) aur aap jaante ho variable kya hota hai. Jinja2 se templates render karna (module 4) chapter 3 mein madad karta hai lekin zaroori nahi. Hum har line samjhayenge.</p>

<h3>Analogy: recipe card ka binder</h3>
<p>Vyast restaurant mein har recipe ek haath se likhe page par mix karke nahi rakhi jaati. Wahan <b>recipe cards</b> ka binder hota hai. Har card ke sections same hote hain: ingredients, steps, notes. Naya cook card ko naam se dhoondhta hai, aur head chef bas kehta hai "table ek se chalis ke liye base sauce banao". Role recipe card hai. Playbook head chef ka order hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Ek lamba playbook versus chhota playbook aur roles">
<rect x="20" y="20" width="250" height="150" rx="12" fill="#fed7aa"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="14">Pehle: baseline.yml</text><text x="145" y="75" text-anchor="middle" class="svg-muted" font-size="12">tasks ke andar values type</text><text x="145" y="95" text-anchor="middle" class="svg-muted" font-size="12">save har baar chalta hai</text><text x="145" y="115" text-anchor="middle" class="svg-muted" font-size="12">doosre projects mein copy-paste</text>
<rect x="370" y="20" width="250" height="60" rx="12" fill="#fde68a"/><text x="495" y="45" text-anchor="middle" class="svg-ink" font-size="14">Baad mein: site.yml</text><text x="495" y="65" text-anchor="middle" class="svg-muted" font-size="12">roles: [ nk_base ]</text>
<rect x="370" y="105" width="250" height="65" rx="12" fill="#bbf7d0"/><text x="495" y="130" text-anchor="middle" class="svg-ink" font-size="14">roles/nk_base/</text><text x="495" y="150" text-anchor="middle" class="svg-muted" font-size="12">defaults, tasks, handlers, templates</text>
<line x1="270" y1="95" x2="370" y2="50" stroke="#64748b" stroke-width="2"/><line x1="270" y1="95" x2="370" y2="135" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Kya playbook mein rehta hai; kaise role mein chala jaata hai.</p></div>

<h3>Role kis problem ko solve karta hai</h3>
<p>Yeh control node AUTO01, project <code>~/netauto</code> par team ka abhi ka <code>baseline.yml</code> hai. Kaam karta hai, lekin kamzoriyan dekho:</p>
<pre class="out">netadmin@auto01:~/netauto$ cat baseline.yml
---
# One long playbook, values typed into the tasks. Being replaced by the nk_base role.
- name: Base config
  hosts: all
  gather_facts: false
  tasks:
    - name: NTP
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.60
    - name: Syslog
      cisco.ios.ios_config:
        lines:
          - logging host 10.99.0.60
    - name: Login banner
      cisco.ios.ios_banner:
        banner: login
        text: Authorised access only. Disconnect now if you are not.
        state: present
    - name: Save
      cisco.ios.ios_config:
        save_when: always</pre>
<ul>
<li>Addresses aur banner tasks ke andar type hain. Ek site ko doosra syslog host dena ho to playbook edit karna padega.</li>
<li>Aakhri task <i>har</i> run mein save karta hai, chahe kuch na badla ho.</li>
<li>Doosri team ko wahi baseline chahiye to poori file copy karti hai, aur dono copies dheere-dheere alag ho jaati hain.</li>
</ul>

<h3>Role ka idea</h3>
<p>Role bas ek folder hai jisme tay kiye hue sub-folders hote hain. Ansible naam jaanta hai, isliye aap kabhi path nahi likhte: woh <code>tasks/main.yml</code>, <code>defaults/main.yml</code>, <code>handlers/main.yml</code> khud load karta hai. Command <code>ansible-galaxy role init</code> khaali skeleton banata hai:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-galaxy role init --init-path roles nk_base
- Role nk_base was created successfully
netadmin@auto01:~/netauto$ ls -R roles
roles:
nk_base

roles/nk_base:
defaults  files  handlers  meta  README.md  tasks  templates  tests  vars

roles/nk_base/defaults:
main.yml
...</pre>
<p><code>--init-path roles</code> kehta hai "ise roles folder ke andar banao". <code>nk_base</code> role ka naam hai. Hum chhota lowercase naam underscores ke saath use karte hain: dash aur dot Ansible ko confuse kar sakte hain. Team prefix (<code>nk_</code>) doosri jagah ke roles se takrao rokta hai.</p>

<h3>Is module ka plan</h3>
<ol>
<li>Chapter 2: role ka har folder kis kaam ka hai.</li>
<li>Chapter 3: role ke andar templates.</li>
<li>Chapter 4: defaults, vars aur takrao mein kaun jeetta hai.</li>
<li>Chapter 5: handlers aur tags.</li>
<li>Chapter 6: roles ko use, combine aur reuse karna.</li>
<li>Chapter 7: poori automation repository ka layout.</li>
<li>Chapter 8: Vault se secrets, aur troubleshooting workflow.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Har teen line ke task ke liye role bana dena. Role tab apni jagah banata hai jab kaam reusable ho (har device ko chahiye) ya jab uske apne variables, templates ya handlers hon. Akela one-off task playbook mein reh sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Role mein <code>hosts:</code> line nahi hoti. <i>Playbook</i> batata hai kaunse hosts; role sirf batata hai kya karna hai. Role seedha nahi chalta: woh play se call hota hai.</p></div>

<div class="scn"><h4>Do sites, do copies, do behaviours</h4><p>Do engineers ne base playbook ki apni-apni private copy rakhi. Ek copy har task ke baad config save karti thi, doosri kabhi nahi, aur kisi ko nahi pata tha ki agle reload par kaun se routers ki NTP lines udengi. Team ne logic ko ek role mein save handler ke saath daal diya, aur dono engineers ne apne playbooks se wahi role call kiya.</p><p><b>Lesson:</b> ek reviewed role, kai private copies se behtar.</p></div>

<div class="iv"><p class="q">"Ansible role kya hai aur use kyun karoge?"</p><p>Role standard folder layout hai (tasks, defaults, vars, handlers, templates, files, meta) jo reusable automation ko package karta hai. Isse kaam share aur version ho sakta hai, values variables mein rehti hain jise sites override kar sakte hain, aur playbooks chhote rehte hain. Yeh batao ki play roles ko call karta hai aur ansible-galaxy role init skeleton banata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Role tay layout wala folder hai jise Ansible naam se load karta hai.</li>
<li>Playbooks kya aur kahan batate hain; roles mein kaise rehta hai.</li>
<li>ansible-galaxy role init --init-path roles NAME skeleton banata hai.</li>
<li>Roles playbooks aur teams ke beech copy-paste drift rokte hain.</li>
<li>Chhote one-off tasks ko role mein mat lapeto.</li>
</ul></div>
`}};export{e as default};