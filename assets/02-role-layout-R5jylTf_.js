var e={id:`role-layout`,h:{en:`Inside a role: what every folder is for`,hi:`Role ke andar: har folder kis kaam ka hai`},body:{en:`
<p><b>One idea in this chapter:</b> each folder in a role has one job, and Ansible finds the file called <code>main.yml</code> inside it automatically. Learn the job of each folder and you can read any role in the world.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Role folders and their jobs">
<rect x="20" y="15" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">tasks/main.yml</text><text x="185" y="40" class="svg-muted" font-size="12">the work, in order</text>
<rect x="20" y="62" width="150" height="40" rx="8" fill="#bae6fd"/><text x="95" y="87" text-anchor="middle" class="svg-ink" font-size="13">defaults/main.yml</text><text x="185" y="87" class="svg-muted" font-size="12">gentle default values (weakest)</text>
<rect x="20" y="109" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="95" y="134" text-anchor="middle" class="svg-ink" font-size="13">vars/main.yml</text><text x="185" y="134" class="svg-muted" font-size="12">fixed values (hard to override)</text>
<rect x="20" y="156" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="181" text-anchor="middle" class="svg-ink" font-size="13">handlers/main.yml</text><text x="185" y="181" class="svg-muted" font-size="12">run once at the end when notified</text>
<rect x="400" y="15" width="220" height="40" rx="8" fill="#fed7aa"/><text x="510" y="40" text-anchor="middle" class="svg-ink" font-size="13">templates/  files/</text>
<text x="400" y="75" class="svg-muted" font-size="12">Jinja2 templates and static files,</text><text x="400" y="92" class="svg-muted" font-size="12">found by name, no path needed</text>
<rect x="400" y="109" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="510" y="134" text-anchor="middle" class="svg-ink" font-size="13">meta/main.yml</text>
<text x="400" y="169" class="svg-muted" font-size="12">author, and dependencies on</text><text x="400" y="186" class="svg-muted" font-size="12">other roles</text>
<text x="20" y="220" class="svg-muted" font-size="12">Also created by init: README.md and tests/ (documentation and a sample test playbook)</text>
</svg><p class="cap">The standard role layout created by ansible-galaxy role init.</p></div>

<h3>tasks/main.yml: the work</h3>
<p>This file is a plain list of tasks. It has <b>no</b> play header: no <code>hosts:</code>, no <code>gather_facts</code>, no <code>tasks:</code> line. The play that calls the role supplies those. Here is the task file of our role <code>nk_base</code>, line by line:</p>
<pre class="code"><span class="c"># roles/nk_base/tasks/main.yml</span>
---
- name: NTP servers
  cisco.ios.ios_config:
    lines:
      - "ntp server {{ item }}"      <span class="c"># one line per list entry</span>
  loop: "{{ ntp_servers }}"          <span class="c"># repeat the task for each entry</span>
  notify: save config                <span class="c"># ask the handler to run if this changed</span>
  tags: ntp                          <span class="c"># label, see chapter 5</span>

- name: Syslog host
  cisco.ios.ios_config:
    lines:
      - "logging host {{ syslog_host }}"
  notify: save config
  tags: logging

- name: Login banner
  cisco.ios.ios_banner:
    banner: login
    text: "{{ login_banner }}"
    state: present
  notify: save config
  tags: banner</pre>
<p>Compare with the old playbook: the same three tasks, but the addresses and the banner text are now variables, and the <code>Save</code> task has become a handler. <code>loop</code> repeats a task for every item of a list; inside it the current item is called <code>item</code>.</p>

<h3>defaults/main.yml: values you may override</h3>
<pre class="code"><span class="c"># roles/nk_base/defaults/main.yml</span>
---
ntp_servers:
  - 10.99.0.60
syslog_host: 10.99.0.60
login_banner: "Authorised access only. Disconnect now if you are not."</pre>
<p>These are the role's sensible standard values. They have the <b>lowest priority</b> of any variable: a file in group_vars, a host file, or the command line can replace them without touching the role. Chapter 4 explains the priority order. Put every value a user might want to change in <code>defaults/</code>, and document it in the README.</p>

<h3>vars/main.yml: values that should stay fixed</h3>
<p>Values here have high priority and are hard to override on purpose. Use them for constants that belong to the role itself (for example a template's fixed mask) and not for anything a site may want to tune. If in doubt, use defaults.</p>

<h3>handlers/main.yml: the end-of-play actions</h3>
<pre class="code"><span class="c"># roles/nk_base/handlers/main.yml</span>
---
- name: save config
  cisco.ios.ios_config:
    save_when: always</pre>
<p>A handler is a task that runs only when another task <i>notifies</i> it and reported <code>changed</code>. Chapter 5 covers this.</p>

<h3>templates/, files/, meta/</h3>
<p><code>templates/</code> holds Jinja2 files used by the <code>template</code> module or by <code>ios_config src</code>. <code>files/</code> holds static files for the <code>copy</code> module. In both cases you write only the file name. <code>meta/main.yml</code> records the author and any <b>dependencies</b>: roles that must run before this one (chapter 6).</p>

<h3>Calling the role</h3>
<pre class="code"><span class="c"># site.yml</span>
---
- name: Base config for every device
  hosts: all
  gather_facts: false
  roles:
    - nk_base</pre>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml

PLAY [Base config for every device] *******************************************

TASK [nk_base : NTP servers] **************************************************
changed: [pun-core-r1] =&gt; (item=10.99.0.60)
changed: [blr-edge-r2] =&gt; (item=10.99.0.60)
changed: [pun-acc-sw1] =&gt; (item=10.99.0.60)

TASK [nk_base : Syslog host] **************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]

TASK [nk_base : Login banner] *************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]

<span class="hl">RUNNING HANDLER [nk_base : save config]</span> ***************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=4    unreachable=0    failed=0 ...
blr-edge-r2                : ok=4    changed=4    unreachable=0    failed=0 ...
pun-acc-sw1                : ok=4    changed=4    unreachable=0    failed=0 ...</pre>
<p>Notice the task names start with the role name, <code>nk_base : NTP servers</code>. When a run involves many roles, that prefix tells you where a task lives. The handler ran once per device, at the end, after three tasks changed something.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting <code>hosts:</code> or <code>tasks:</code> inside <code>tasks/main.yml</code> (it must be a bare list); naming the file <code>main.yaml</code> or <code>Main.yml</code> (Ansible looks for main.yml, main.yaml or main); putting site-specific values in <code>vars/</code> where nobody can override them; leaving empty sample folders without a README note.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>defaults/</code> is the lowest priority, <code>vars/</code> is higher. Remember it as "defaults are gentle, vars are firm".</p></div>

<div class="scn"><h4>The banner nobody could change</h4><p>A role author put the login banner in <code>vars/main.yml</code>. When the Bengaluru site needed its own wording, group_vars had no effect and the team resorted to editing the role. Moving the banner to <code>defaults/main.yml</code> let each site override it from its own host or group file, and the role stayed identical for everyone.</p><p><b>Lesson:</b> anything a site may tune belongs in defaults.</p></div>

<div class="iv"><p class="q">"What is the difference between defaults and vars in a role?"</p><p>Both hold variables. defaults has the lowest precedence, so inventory, play and command-line values override it; it is the place for tunable settings. vars has high precedence and is for constants the role depends on. Say that you put anything configurable in defaults.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>tasks/main.yml is a bare list of tasks with no play header.</li>
<li>defaults/ holds overridable values; vars/ holds firm values.</li>
<li>handlers/ runs at the end, only for notified changes.</li>
<li>templates/ and files/ are found by file name alone.</li>
<li>meta/ lists role dependencies.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> role ke har folder ka ek kaam hai, aur Ansible uske andar <code>main.yml</code> naam ki file apne aap dhoondh leta hai. Har folder ka kaam seekh lo to aap duniya ka koi bhi role padh sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Role folders aur unka kaam">
<rect x="20" y="15" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">tasks/main.yml</text><text x="185" y="40" class="svg-muted" font-size="12">kaam, order mein</text>
<rect x="20" y="62" width="150" height="40" rx="8" fill="#bae6fd"/><text x="95" y="87" text-anchor="middle" class="svg-ink" font-size="13">defaults/main.yml</text><text x="185" y="87" class="svg-muted" font-size="12">naram default values (sabse kamzor)</text>
<rect x="20" y="109" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="95" y="134" text-anchor="middle" class="svg-ink" font-size="13">vars/main.yml</text><text x="185" y="134" class="svg-muted" font-size="12">pakki values (override mushkil)</text>
<rect x="20" y="156" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="181" text-anchor="middle" class="svg-ink" font-size="13">handlers/main.yml</text><text x="185" y="181" class="svg-muted" font-size="12">notify hone par end mein ek baar</text>
<rect x="400" y="15" width="220" height="40" rx="8" fill="#fed7aa"/><text x="510" y="40" text-anchor="middle" class="svg-ink" font-size="13">templates/  files/</text>
<text x="400" y="75" class="svg-muted" font-size="12">Jinja2 templates aur static files,</text><text x="400" y="92" class="svg-muted" font-size="12">naam se milte hain, path nahi chahiye</text>
<rect x="400" y="109" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="510" y="134" text-anchor="middle" class="svg-ink" font-size="13">meta/main.yml</text>
<text x="400" y="169" class="svg-muted" font-size="12">author, aur doosre roles par</text><text x="400" y="186" class="svg-muted" font-size="12">dependencies</text>
<text x="20" y="220" class="svg-muted" font-size="12">init yeh bhi banata hai: README.md aur tests/ (documentation aur sample test playbook)</text>
</svg><p class="cap">ansible-galaxy role init ka banaya standard role layout.</p></div>

<h3>tasks/main.yml: kaam</h3>
<p>Yeh file tasks ki seedhi list hai. Isme play header <b>nahi</b> hota: na <code>hosts:</code>, na <code>gather_facts</code>, na <code>tasks:</code> line. Role ko call karne wala play yeh deta hai. Hamare role <code>nk_base</code> ki task file line by line:</p>
<pre class="code"><span class="c"># roles/nk_base/tasks/main.yml</span>
---
- name: NTP servers
  cisco.ios.ios_config:
    lines:
      - "ntp server {{ item }}"      <span class="c"># list ki har entry ke liye ek line</span>
  loop: "{{ ntp_servers }}"          <span class="c"># task har entry ke liye repeat karo</span>
  notify: save config                <span class="c"># change hua to handler ko chalne ko kaho</span>
  tags: ntp                          <span class="c"># label, chapter 5 dekho</span>

- name: Syslog host
  cisco.ios.ios_config:
    lines:
      - "logging host {{ syslog_host }}"
  notify: save config
  tags: logging

- name: Login banner
  cisco.ios.ios_banner:
    banner: login
    text: "{{ login_banner }}"
    state: present
  notify: save config
  tags: banner</pre>
<p>Purane playbook se compare karo: wahi teen tasks, lekin addresses aur banner text ab variables hain, aur <code>Save</code> task handler ban gaya hai. <code>loop</code> task ko list ke har item ke liye repeat karta hai; andar current item ka naam <code>item</code> hai.</p>

<h3>defaults/main.yml: jo values aap override kar sakte ho</h3>
<pre class="code"><span class="c"># roles/nk_base/defaults/main.yml</span>
---
ntp_servers:
  - 10.99.0.60
syslog_host: 10.99.0.60
login_banner: "Authorised access only. Disconnect now if you are not."</pre>
<p>Yeh role ki samajhdar standard values hain. Inki <b>priority kisi bhi variable se sabse kam</b> hai: group_vars ki file, host file ya command line role ko chhue bina inhe badal sakte hain. Chapter 4 priority order samjhata hai. Jo bhi value user badalna chahe use <code>defaults/</code> mein rakho, aur README mein likho.</p>

<h3>vars/main.yml: jo values fixed rehni chahiye</h3>
<p>Yahan ki values ki priority zyada hai aur jaan-boojhkar override karna mushkil hai. Unhe aise constants ke liye use karo jo role ke apne hain (jaise template ka fixed mask), un cheezon ke liye nahi jo site tune karna chahe. Shak ho to defaults use karo.</p>

<h3>handlers/main.yml: play ke end ke actions</h3>
<pre class="code"><span class="c"># roles/nk_base/handlers/main.yml</span>
---
- name: save config
  cisco.ios.ios_config:
    save_when: always</pre>
<p>Handler aisa task hai jo tabhi chalta hai jab koi doosra task use <i>notify</i> kare aur <code>changed</code> report kare. Chapter 5 isse cover karta hai.</p>

<h3>templates/, files/, meta/</h3>
<p><code>templates/</code> mein Jinja2 files hoti hain jo <code>template</code> module ya <code>ios_config src</code> use karta hai. <code>files/</code> mein <code>copy</code> module ke static files. Dono mein sirf file ka naam likhte ho. <code>meta/main.yml</code> author aur <b>dependencies</b> darj karta hai: woh roles jo is se pehle chalne chahiye (chapter 6).</p>

<h3>Role ko call karna</h3>
<pre class="code"><span class="c"># site.yml</span>
---
- name: Base config for every device
  hosts: all
  gather_facts: false
  roles:
    - nk_base</pre>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml

PLAY [Base config for every device] *******************************************

TASK [nk_base : NTP servers] **************************************************
changed: [pun-core-r1] =&gt; (item=10.99.0.60)
changed: [blr-edge-r2] =&gt; (item=10.99.0.60)
changed: [pun-acc-sw1] =&gt; (item=10.99.0.60)

TASK [nk_base : Syslog host] **************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]

TASK [nk_base : Login banner] *************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]

<span class="hl">RUNNING HANDLER [nk_base : save config]</span> ***************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
changed: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=4    unreachable=0    failed=0 ...
blr-edge-r2                : ok=4    changed=4    unreachable=0    failed=0 ...
pun-acc-sw1                : ok=4    changed=4    unreachable=0    failed=0 ...</pre>
<p>Dhyan do task names role ke naam se shuru hote hain, <code>nk_base : NTP servers</code>. Run mein kai roles hon to yeh prefix batata hai task kahan rehta hai. Handler har device par ek baar, end mein chala, jab teen tasks ne kuch badla tha.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>tasks/main.yml</code> ke andar <code>hosts:</code> ya <code>tasks:</code> likhna (yeh seedhi list honi chahiye); file ka naam <code>main.yaml</code> ya <code>Main.yml</code> rakhna (Ansible main.yml, main.yaml ya main dhoondhta hai); site-specific values <code>vars/</code> mein rakhna jahan koi override nahi kar sakta; README note ke bina khaali sample folders chhodna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>defaults/</code> sabse kam priority, <code>vars/</code> usse zyada. Yaad rakho: "defaults naram, vars pakke".</p></div>

<div class="scn"><h4>Woh banner jo koi badal nahi sakta tha</h4><p>Role author ne login banner <code>vars/main.yml</code> mein rakha. Bengaluru site ko apna wording chahiye tha to group_vars ka koi asar nahi hua aur team ko role edit karna pada. Banner ko <code>defaults/main.yml</code> mein le jaane se har site apni host ya group file se override kar saka, aur role sab ke liye same raha.</p><p><b>Lesson:</b> jo kuch site tune kar sakti hai woh defaults mein.</p></div>

<div class="iv"><p class="q">"Role mein defaults aur vars ka kya difference hai?"</p><p>Dono variables rakhte hain. defaults ki precedence sabse kam hai, isliye inventory, play aur command-line values use override karti hain; yeh tunable settings ki jagah hai. vars ki precedence zyada hai aur role jin constants par nirbhar hai unke liye hai. Kaho ki jo bhi configurable ho woh defaults mein rakhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>tasks/main.yml tasks ki bare list hai, play header ke bina.</li>
<li>defaults/ overridable values rakhta hai; vars/ pakki values.</li>
<li>handlers/ end mein chalte hain, sirf notified changes ke liye.</li>
<li>templates/ aur files/ sirf file naam se milte hain.</li>
<li>meta/ role dependencies likhta hai.</li>
</ul></div>
`}};export{e as default};