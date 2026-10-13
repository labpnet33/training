var e={id:`using-reusing-roles`,h:{en:`Using, combining and reusing roles`,hi:`Roles ko use, combine aur reuse karna`},body:{en:`
<p><b>One idea in this chapter:</b> a role is useful only if you can call it from many places. You will call roles from a play, pass them values, run them on some hosts only, chain them with dependencies, and learn where Ansible looks for them.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Playbooks calling shared roles">
<rect x="20" y="20" width="150" height="45" rx="8" fill="#fde68a"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="12">site.yml (all devices)</text>
<rect x="20" y="75" width="150" height="45" rx="8" fill="#fde68a"/><text x="95" y="103" text-anchor="middle" class="svg-ink" font-size="12">routers.yml</text>
<rect x="20" y="130" width="150" height="45" rx="8" fill="#fde68a"/><text x="95" y="158" text-anchor="middle" class="svg-ink" font-size="12">branch-rollout.yml</text>
<rect x="300" y="35" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="370" y="65" text-anchor="middle" class="svg-ink" font-size="13">nk_base</text>
<rect x="300" y="110" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="370" y="140" text-anchor="middle" class="svg-ink" font-size="13">nk_loopback</text>
<line x1="170" y1="42" x2="300" y2="55" stroke="#64748b" stroke-width="2"/><line x1="170" y1="97" x2="300" y2="70" stroke="#64748b" stroke-width="2"/><line x1="170" y1="152" x2="300" y2="135" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="110" x2="370" y2="85" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><text x="500" y="100" class="svg-muted" font-size="12">nk_loopback depends on nk_base</text>
</svg><p class="cap">One role, many playbooks. A dependency pulls the base role in automatically.</p></div>

<h3>Calling roles from a play</h3>
<p>The simplest call is a list. Roles run in the order listed, and each one's tasks run on every host in the play before the play moves to the next role:</p>
<pre class="code">- hosts: routers
  gather_facts: false
  roles:
    - nk_base
    - nk_loopback</pre>
<p>When a role needs values or a condition, write it as a dictionary:</p>
<pre class="code">- hosts: all
  gather_facts: false
  roles:
    - role: nk_base
      vars:
        syslog_host: 10.99.0.88        <span class="c"># override a default for this use only</span>
    - role: nk_loopback
      when: "'routers' in group_names"  <span class="c"># only for hosts in the routers group</span></pre>
<p><code>vars:</code> beside a role sets variables for that role (the precedence ladder of chapter 4 still applies). <code>when:</code> is a condition: the role's tasks are skipped on hosts where it is false. <code>group_names</code> is a magic variable that lists the groups a host belongs to.</p>

<h3>Running a role on some hosts only</h3>
<p>This play targets all devices but gives the loopback role only to routers. The switch is skipped, not failed:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook all.yml

PLAY [Every device, loopback only on routers] *********************************

TASK [nk_base : NTP servers] **************************************************
changed: [pun-core-r1] =&gt; (item=10.99.0.60)
changed: [blr-edge-r2] =&gt; (item=10.99.0.60)
<span class="hl">skipping: [pun-acc-sw1]</span>

TASK [nk_loopback : Render and push Loopback0] ********************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
<span class="hl">skipping: [pun-acc-sw1]</span>

RUNNING HANDLER [nk_base : save config] ***************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=4    unreachable=0    failed=0 ...
blr-edge-r2                : ok=4    changed=4    unreachable=0    failed=0 ...
pun-acc-sw1                : ok=0    changed=0    unreachable=0    failed=0    skipped=3
</pre>
<p>Notice that even the <code>nk_base</code> tasks were skipped on the switch. That is because <code>nk_base</code> is a <b>dependency</b> of <code>nk_loopback</code>, and a dependency inherits the condition of the role that pulled it in. The switch shows <code>skipped=3</code> and no failures.</p>

<h3>Dependencies in meta/main.yml</h3>
<pre class="out">netadmin@auto01:~/netauto$ cat roles/nk_loopback/meta/main.yml
---
dependencies:
  - role: nk_base</pre>
<p>This says: before running <code>nk_loopback</code>, run <code>nk_base</code>. Ansible does it for you, so the play needs to name only the top role. Use dependencies for things that truly cannot work without another role (the loopback role needs the base config). Do not use them as a way to bundle unrelated things. Ansible runs a dependency once per play even if several roles list it, unless the dependency is called with different parameters.</p>

<h3>Where Ansible finds roles</h3>
<p>Ansible looks in a <code>roles/</code> folder next to the playbook, then in the places listed by <code>roles_path</code> (default includes <code>~/.ansible/roles</code>, <code>/usr/share/ansible/roles</code> and <code>/etc/ansible/roles</code>). List what it can see:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-galaxy role list
# /home/netadmin/netauto/roles
- nk_base, (unknown version)
- nk_loopback, (unknown version)</pre>
<p><code>(unknown version)</code> is normal for roles that you wrote yourself; roles installed from a shared source carry a version.</p>

<h3>Static or dynamic: import_role and include_role</h3>
<p>The <code>roles:</code> list is read when the playbook is loaded. Two task keywords let you call a role in the middle of a play instead:</p>
<ul>
<li><code>ansible.builtin.import_role</code> is <b>static</b>: its tasks are read up front, so <code>--list-tasks</code> and tags see them.</li>
<li><code>ansible.builtin.include_role</code> is <b>dynamic</b>: it is read when reached, so you can choose the role with a variable or inside a loop, but its tasks do not appear in <code>--list-tasks</code>.</li>
</ul>
<p><b>Reference configuration (not run in the simulator):</b></p>
<pre class="code">  tasks:
    - name: Apply the base role only on switches
      ansible.builtin.include_role:
        name: nk_base
      when: "'switches' in group_names"</pre>
<p>Start with the plain <code>roles:</code> list. Reach for include_role only when you need a decision at run time.</p>

<h3>Sharing roles with other teams</h3>
<p>A role is just a folder, so the standard way to share it is a Git repository. Teams then install it into their <code>roles/</code> folder or a shared <code>roles_path</code>, pinned to a tag so everybody uses the same version. Public roles can come from Ansible Galaxy, and bigger bundles of roles, modules and filters are shared as <b>collections</b> (for example <code>cisco.ios</code>, which the lab uses). Always read a third-party role before you run it on production devices.</p>

<div class="warn"><p><b>Common mistakes.</b> Giving a role a <code>hosts:</code> line; making a dependency on a role that does not need it; forgetting that a dependency inherits the parent's <code>when</code>; copying a role into five projects instead of sharing one source; running an unreviewed role from the internet on live routers.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>import_role</code> is static (parsed at load, visible to tags and list commands). <code>include_role</code> is dynamic (parsed when reached). Role <code>dependencies</code> live in <code>meta/main.yml</code> and run before the role.</p></div>

<div class="scn"><h4>The switch that got a router-only role</h4><p>A rollout play listed every role for <code>hosts: all</code>. The loopback role, meant for routers, tried to push a router-ID interface to an access switch that did not have the same configuration model. Adding <code>when: "'routers' in group_names"</code> to that role turned the switch's tasks into skips, and the recap showed <code>skipped</code> instead of <code>failed</code>.</p><p><b>Lesson:</b> scope a role to the hosts that need it, with groups or a condition.</p></div>

<div class="iv"><p class="q">"How do you reuse a role across projects and pass it different values?"</p><p>Keep the role in its own Git repository or shared roles_path, pinned to a version. In each playbook call it with roles: and pass values with vars, or better, override its defaults through group_vars. Use meta dependencies for roles that must run first, and when to scope it to the right group.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles run in the order listed; use role: with vars and when for control.</li>
<li>when skips the role on other hosts, and dependencies inherit it.</li>
<li>meta/main.yml dependencies run first, automatically.</li>
<li>Ansible searches roles/ next to the playbook, then roles_path.</li>
<li>import_role is static; include_role is dynamic.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> role tabhi kaam ka hai jab use kai jagah se call kar sako. Aap roles ko play se call karoge, unhe values doge, sirf kuch hosts par chalaoge, dependencies se chain karoge, aur seekhoge ki Ansible unhe kahan dhoondhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Playbooks shared roles ko call karte hain">
<rect x="20" y="20" width="150" height="45" rx="8" fill="#fde68a"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="12">site.yml (sab devices)</text>
<rect x="20" y="75" width="150" height="45" rx="8" fill="#fde68a"/><text x="95" y="103" text-anchor="middle" class="svg-ink" font-size="12">routers.yml</text>
<rect x="20" y="130" width="150" height="45" rx="8" fill="#fde68a"/><text x="95" y="158" text-anchor="middle" class="svg-ink" font-size="12">branch-rollout.yml</text>
<rect x="300" y="35" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="370" y="65" text-anchor="middle" class="svg-ink" font-size="13">nk_base</text>
<rect x="300" y="110" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="370" y="140" text-anchor="middle" class="svg-ink" font-size="13">nk_loopback</text>
<line x1="170" y1="42" x2="300" y2="55" stroke="#64748b" stroke-width="2"/><line x1="170" y1="97" x2="300" y2="70" stroke="#64748b" stroke-width="2"/><line x1="170" y1="152" x2="300" y2="135" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="110" x2="370" y2="85" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><text x="500" y="100" class="svg-muted" font-size="12">nk_loopback nk_base par nirbhar hai</text>
</svg><p class="cap">Ek role, kai playbooks. Dependency base role ko apne aap kheench leti hai.</p></div>

<h3>Play se roles call karna</h3>
<p>Sabse simple call ek list hai. Roles likhe hue order mein chalte hain, aur har role ke tasks play ke har host par chalte hain, tab play agle role par jaata hai:</p>
<pre class="code">- hosts: routers
  gather_facts: false
  roles:
    - nk_base
    - nk_loopback</pre>
<p>Role ko values ya condition chahiye to dictionary ki tarah likho:</p>
<pre class="code">- hosts: all
  gather_facts: false
  roles:
    - role: nk_base
      vars:
        syslog_host: 10.99.0.88        <span class="c"># sirf is use ke liye default override</span>
    - role: nk_loopback
      when: "'routers' in group_names"  <span class="c"># sirf routers group ke hosts ke liye</span></pre>
<p>Role ke bagal ka <code>vars:</code> us role ke liye variables set karta hai (chapter 4 ki precedence seedhi ab bhi lagu hai). <code>when:</code> condition hai: false hone par us host par role ke tasks skip hote hain. <code>group_names</code> magic variable hai jo batata hai host kin groups mein hai.</p>

<h3>Role ko sirf kuch hosts par chalana</h3>
<p>Yeh play sab devices ko target karta hai lekin loopback role sirf routers ko deta hai. Switch skip hota hai, fail nahi:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook all.yml

PLAY [Every device, loopback only on routers] *********************************

TASK [nk_base : NTP servers] **************************************************
changed: [pun-core-r1] =&gt; (item=10.99.0.60)
changed: [blr-edge-r2] =&gt; (item=10.99.0.60)
<span class="hl">skipping: [pun-acc-sw1]</span>

TASK [nk_loopback : Render and push Loopback0] ********************************
changed: [pun-core-r1]
changed: [blr-edge-r2]
<span class="hl">skipping: [pun-acc-sw1]</span>

RUNNING HANDLER [nk_base : save config] ***************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=4    unreachable=0    failed=0 ...
blr-edge-r2                : ok=4    changed=4    unreachable=0    failed=0 ...
pun-acc-sw1                : ok=0    changed=0    unreachable=0    failed=0    skipped=3
</pre>
<p>Dhyan do ki switch par <code>nk_base</code> ke tasks bhi skip hue. Kyunki <code>nk_base</code>, <code>nk_loopback</code> ki <b>dependency</b> hai, aur dependency use kheenchne wale role ki condition inherit karti hai. Switch <code>skipped=3</code> dikhata hai, koi failure nahi.</p>

<h3>meta/main.yml mein dependencies</h3>
<pre class="out">netadmin@auto01:~/netauto$ cat roles/nk_loopback/meta/main.yml
---
dependencies:
  - role: nk_base</pre>
<p>Matlab: <code>nk_loopback</code> chalane se pehle <code>nk_base</code> chalao. Ansible yeh aapke liye karta hai, isliye play ko sirf upar wala role naam dena padta hai. Dependencies un cheezon ke liye use karo jo doosre role ke bina sach mein kaam nahi kar sakti (loopback role ko base config chahiye). Unhe be-mel cheezon ko bundle karne ke tareeke ki tarah use mat karo. Ansible dependency ko play mein ek baar chalata hai chahe kai roles use list karein, jab tak dependency alag parameters ke saath call na ho.</p>

<h3>Ansible roles kahan dhoondhta hai</h3>
<p>Ansible playbook ke paas <code>roles/</code> folder mein dekhta hai, phir <code>roles_path</code> mein likhi jagahon mein (default mein <code>~/.ansible/roles</code>, <code>/usr/share/ansible/roles</code> aur <code>/etc/ansible/roles</code>). Jo dikhta hai woh list karo:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-galaxy role list
# /home/netadmin/netauto/roles
- nk_base, (unknown version)
- nk_loopback, (unknown version)</pre>
<p>Khud likhe roles ke liye <code>(unknown version)</code> normal hai; shared source se install hue roles ka version hota hai.</p>

<h3>Static ya dynamic: import_role aur include_role</h3>
<p><code>roles:</code> list playbook load hote hi padhi jaati hai. Do task keywords play ke beech mein role call karne dete hain:</p>
<ul>
<li><code>ansible.builtin.import_role</code> <b>static</b> hai: uske tasks pehle se padhe jaate hain, isliye <code>--list-tasks</code> aur tags unhe dekhte hain.</li>
<li><code>ansible.builtin.include_role</code> <b>dynamic</b> hai: jab pahunchta hai tab padha jaata hai, isliye aap role variable se ya loop mein chun sakte ho, lekin uske tasks <code>--list-tasks</code> mein nahi aate.</li>
</ul>
<p><b>Reference configuration (not run in the simulator):</b></p>
<pre class="code">  tasks:
    - name: Apply the base role only on switches
      ansible.builtin.include_role:
        name: nk_base
      when: "'switches' in group_names"</pre>
<p>Seedhi <code>roles:</code> list se shuru karo. include_role tab lo jab run time par faisla chahiye.</p>

<h3>Roles ko doosri teams ke saath share karna</h3>
<p>Role bas ek folder hai, isliye share karne ka standard tareeka Git repository hai. Teams use apne <code>roles/</code> folder ya shared <code>roles_path</code> mein install karti hain, ek tag par pin karke taaki sab ek hi version use karein. Public roles Ansible Galaxy se aa sakte hain, aur roles, modules aur filters ke bade bundles <b>collections</b> ki tarah share hote hain (jaise <code>cisco.ios</code>, jo lab use karta hai). Production devices par chalane se pehle third-party role hamesha padho.</p>

<div class="warn"><p><b>Common mistakes.</b> Role ko <code>hosts:</code> line dena; aise role par dependency banana jise zaroorat nahi; yeh bhoolna ki dependency parent ki <code>when</code> inherit karti hai; ek role ko paanch projects mein copy karna, ek source share karne ke bajaye; internet ka bina review ka role live routers par chalana.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>import_role</code> static hai (load par parse, tags aur list commands ko dikhta hai). <code>include_role</code> dynamic hai (pahunchne par parse). Role <code>dependencies</code> <code>meta/main.yml</code> mein hoti hain aur role se pehle chalti hain.</p></div>

<div class="scn"><h4>Switch jise router-only role mila</h4><p>Ek rollout play ne <code>hosts: all</code> ke liye har role list kar diya. Loopback role, jo routers ke liye tha, ek access switch par router-ID interface push karne laga jiska configuration model alag tha. Us role mein <code>when: "'routers' in group_names"</code> jodne se switch ke tasks skip ban gaye, aur recap ne <code>failed</code> ki jagah <code>skipped</code> dikhaya.</p><p><b>Lesson:</b> role ko groups ya condition se un hosts tak seemit karo jinhe zaroorat hai.</p></div>

<div class="iv"><p class="q">"Role ko projects mein reuse aur alag values kaise dete ho?"</p><p>Role ko uski apni Git repository ya shared roles_path mein rakho, version par pin karke. Har playbook mein roles: se call karo aur vars se values do, ya behtar, group_vars se uske defaults override karo. Jo roles pehle chalne chahiye unke liye meta dependencies, aur sahi group tak seemit karne ke liye when use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles likhe order mein chalte hain; control ke liye role: ke saath vars aur when.</li>
<li>when doosre hosts par role skip karta hai, aur dependencies use inherit karti hain.</li>
<li>meta/main.yml dependencies pehle, apne aap chalti hain.</li>
<li>Ansible playbook ke paas roles/ mein dhoondhta hai, phir roles_path mein.</li>
<li>import_role static hai; include_role dynamic.</li>
</ul></div>
`}};export{e as default};