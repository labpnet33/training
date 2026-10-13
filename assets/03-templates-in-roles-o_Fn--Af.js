var e={id:`templates-in-roles`,h:{en:`Templates inside a role: one role, one device feature`,hi:`Role ke andar templates: ek role, ek device feature`},body:{en:`
<p><b>One idea in this chapter:</b> a role can carry its own Jinja2 template in its <code>templates/</code> folder, so the pattern, its constants and its tasks travel together as one package. Module 4 taught templates; here we place one inside a role.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Role with template and variables from several places">
<rect x="20" y="20" width="300" height="160" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="40" y="45" class="svg-ink" font-size="13">roles/nk_loopback/</text>
<rect x="40" y="58" width="260" height="30" rx="6" fill="#bbf7d0"/><text x="170" y="78" text-anchor="middle" class="svg-ink" font-size="12">tasks/main.yml (src: loopback.j2)</text>
<rect x="40" y="95" width="260" height="30" rx="6" fill="#fde68a"/><text x="170" y="115" text-anchor="middle" class="svg-ink" font-size="12">templates/loopback.j2</text>
<rect x="40" y="132" width="260" height="30" rx="6" fill="#ddd6fe"/><text x="170" y="152" text-anchor="middle" class="svg-ink" font-size="12">vars/main.yml (loopback_mask)</text>
<rect x="400" y="60" width="220" height="60" rx="10" fill="#bae6fd"/><text x="510" y="86" text-anchor="middle" class="svg-ink" font-size="13">host_vars/pun-core-r1.yml</text><text x="510" y="106" text-anchor="middle" class="svg-muted" font-size="12">loopback_ip (per device)</text>
<line x1="400" y1="90" x2="300" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The role holds the pattern and constants; each host supplies its own address.</p></div>

<h3>Why put the template in the role</h3>
<p>If the template lives in the project's top-level <code>templates/</code> folder, anyone who copies the role must remember to copy the template too. Inside the role it cannot be forgotten. Ansible also searches the role's own <code>templates/</code> first, so you write only the file name, never a path.</p>

<h3>Building the role</h3>
<p>We create a second role, <code>nk_loopback</code>, for the router-ID interface. It has three small files:</p>
<pre class="code"><span class="c"># roles/nk_loopback/templates/loopback.j2</span>
interface Loopback0
 description Router-ID of {{ inventory_hostname }}
 ip address {{ loopback_ip }} {{ loopback_mask }}

<span class="c"># roles/nk_loopback/vars/main.yml     (a constant that belongs to the role)</span>
---
loopback_mask: 255.255.255.255

<span class="c"># roles/nk_loopback/tasks/main.yml</span>
---
- name: Render and push Loopback0
  cisco.ios.ios_config:
    src: loopback.j2            <span class="c"># found in this role's templates/ folder</span>
    save_when: modified
  tags: loopback</pre>
<p>Each router needs its own address. That is data about the <i>device</i>, so it lives in the project's host files, outside the role:</p>
<pre class="code"><span class="c"># host_vars/pun-core-r1.yml</span>
---
loopback_ip: 10.255.255.1

<span class="c"># host_vars/blr-edge-r2.yml</span>
---
loopback_ip: 10.255.255.2</pre>
<p>The rule of thumb: <b>constants of the feature</b> go in the role; <b>facts about a device</b> go in host_vars; <b>site choices</b> go in group_vars. The play that uses the role is short. Note the group <code>routers</code>, because switches do not get a loopback here:</p>
<pre class="code"><span class="c"># site.yml</span>
---
- name: Routers
  hosts: routers
  gather_facts: false
  roles:
    - nk_loopback</pre>
<p>The role <code>nk_loopback</code> also lists <code>nk_base</code> in its <code>meta/main.yml</code> as a dependency, which is why the base tasks run first in the output below. Chapter 6 shows how that works.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml

PLAY [Routers] ****************************************************************

TASK [nk_base : NTP servers] **************************************************
changed: [pun-core-r1] =&gt; (item=10.99.0.60)
changed: [blr-edge-r2] =&gt; (item=10.99.0.60)

TASK [nk_base : Syslog host] **************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]

TASK [nk_loopback : Render and push Loopback0] ********************************
<span class="hl">changed: [pun-core-r1]
changed: [blr-edge-r2]</span>

RUNNING HANDLER [nk_base : save config] ***************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]</pre>
<p>Verify on the device, then run again to prove the role is idempotent:</p>
<pre class="out">BLR-EDGE-R2# show running-config | section Loopback0
interface Loopback0
 description Router-ID of <span class="hl">blr-edge-r2</span>
 ip address <span class="hl">10.255.255.2</span> 255.255.255.255

netadmin@auto01:~/netauto$ ansible-playbook site.yml
TASK [nk_loopback : Render and push Loopback0] ********************************
<span class="hl">ok: [pun-core-r1]
ok: [blr-edge-r2]</span>

PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0 ...
blr-edge-r2                : ok=3    changed=0    unreachable=0    failed=0 ...</pre>
<p>The second run reports no changes anywhere and the save handler did not run at all. The role did only what was needed.</p>

<h3>What if a host has no address?</h3>
<p>If <code>loopback_ip</code> is missing for a host, the render fails for that host, exactly as in module 4, and no config is sent:</p>
<pre class="out">TASK [nk_loopback : Render and push Loopback0] ********************************
fatal: [pun-core-r1]: FAILED! =&gt; {"changed": false, "msg": <span class="hl">"AnsibleUndefinedVariable: 'loopback_ip' is undefined"</span>}
fatal: [blr-edge-r2]: FAILED! =&gt; {"changed": false, "msg": "AnsibleUndefinedVariable: 'loopback_ip' is undefined"}</pre>
<p>Good roles check their required inputs early. A simple way is an <code>ansible.builtin.assert</code> task at the top of <code>tasks/main.yml</code> with a clear message such as "loopback_ip must be set for every router". The error then tells the user what to do, not just what is undefined.</p>

<h3>Documenting inputs</h3>
<p>The <code>README.md</code> that <code>init</code> created is the place to list each variable the role expects, its default and an example. Treat the README as part of the role: a role nobody can understand will be copied and edited, which is the problem you started with.</p>

<div class="warn"><p><b>Common mistakes.</b> Hard-coding a device's own address inside the role; giving the template a path (<code>src: roles/nk_loopback/templates/loopback.j2</code>) instead of the bare name; keeping per-device data in <code>defaults/</code>, which makes every device look the same until someone notices.</p></div>
<div class="exam"><p><b>Exam trap.</b> For a task inside a role, relative paths for <code>template</code> and <code>copy</code> sources are searched in the role's <code>templates/</code> and <code>files/</code> folders first.</p></div>

<div class="scn"><h4>The role that carried its own address</h4><p>A contractor wrote a loopback role with the router-ID baked into the template for the first router. Two months later another router was added using the same role and quietly received the first router's address. OSPF reported duplicate router IDs. The fix was to move the address to host_vars and add an assert that fails if it is missing.</p><p><b>Lesson:</b> a role takes its device-specific values as inputs.</p></div>

<div class="iv"><p class="q">"Where do you keep templates and variables when you build a reusable role?"</p><p>The template goes in the role's templates folder and is referenced by name. Feature constants go in vars, tunable defaults in defaults, and per-device facts such as a loopback address in host_vars in the project. Add an assert and a README so missing inputs fail clearly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A role's templates/ folder travels with the role; refer to files by name.</li>
<li>Constants of the feature: vars. Tunable defaults: defaults. Device facts: host_vars.</li>
<li>A role is idempotent when its modules are: a second run changes nothing.</li>
<li>Missing inputs should fail early with a clear message (assert).</li>
<li>Document variables in the README.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> role apna Jinja2 template <code>templates/</code> folder mein rakh sakta hai, isliye pattern, uske constants aur uske tasks ek package ki tarah saath chalte hain. Module 4 ne templates seekhaye; yahan hum ek ko role ke andar rakhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Role, template aur kai jagah ke variables">
<rect x="20" y="20" width="300" height="160" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="40" y="45" class="svg-ink" font-size="13">roles/nk_loopback/</text>
<rect x="40" y="58" width="260" height="30" rx="6" fill="#bbf7d0"/><text x="170" y="78" text-anchor="middle" class="svg-ink" font-size="12">tasks/main.yml (src: loopback.j2)</text>
<rect x="40" y="95" width="260" height="30" rx="6" fill="#fde68a"/><text x="170" y="115" text-anchor="middle" class="svg-ink" font-size="12">templates/loopback.j2</text>
<rect x="40" y="132" width="260" height="30" rx="6" fill="#ddd6fe"/><text x="170" y="152" text-anchor="middle" class="svg-ink" font-size="12">vars/main.yml (loopback_mask)</text>
<rect x="400" y="60" width="220" height="60" rx="10" fill="#bae6fd"/><text x="510" y="86" text-anchor="middle" class="svg-ink" font-size="13">host_vars/pun-core-r1.yml</text><text x="510" y="106" text-anchor="middle" class="svg-muted" font-size="12">loopback_ip (har device ka)</text>
<line x1="400" y1="90" x2="300" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Role pattern aur constants rakhta hai; har host apna address deta hai.</p></div>

<h3>Template role mein kyun rakhein</h3>
<p>Template project ke top-level <code>templates/</code> folder mein ho to role copy karne wale ko template bhi copy karna yaad rakhna padta hai. Role ke andar yeh bhoola nahi ja sakta. Ansible pehle role ke apne <code>templates/</code> mein bhi dhoondhta hai, isliye aap sirf file ka naam likhte ho, path kabhi nahi.</p>

<h3>Role banana</h3>
<p>Hum router-ID interface ke liye doosra role <code>nk_loopback</code> banate hain. Isme teen chhoti files hain:</p>
<pre class="code"><span class="c"># roles/nk_loopback/templates/loopback.j2</span>
interface Loopback0
 description Router-ID of {{ inventory_hostname }}
 ip address {{ loopback_ip }} {{ loopback_mask }}

<span class="c"># roles/nk_loopback/vars/main.yml     (constant jo role ka apna hai)</span>
---
loopback_mask: 255.255.255.255

<span class="c"># roles/nk_loopback/tasks/main.yml</span>
---
- name: Render and push Loopback0
  cisco.ios.ios_config:
    src: loopback.j2            <span class="c"># is role ke templates/ folder mein milta hai</span>
    save_when: modified
  tags: loopback</pre>
<p>Har router ko apna address chahiye. Yeh <i>device</i> ke baare mein data hai, isliye project ki host files mein rehta hai, role ke bahar:</p>
<pre class="code"><span class="c"># host_vars/pun-core-r1.yml</span>
---
loopback_ip: 10.255.255.1

<span class="c"># host_vars/blr-edge-r2.yml</span>
---
loopback_ip: 10.255.255.2</pre>
<p>Thumb rule: <b>feature ke constants</b> role mein; <b>device ke facts</b> host_vars mein; <b>site ke choices</b> group_vars mein. Role use karne wala play chhota hai. Group <code>routers</code> dekho, kyunki yahan switches ko loopback nahi milta:</p>
<pre class="code"><span class="c"># site.yml</span>
---
- name: Routers
  hosts: routers
  gather_facts: false
  roles:
    - nk_loopback</pre>
<p>Role <code>nk_loopback</code> apne <code>meta/main.yml</code> mein <code>nk_base</code> ko dependency ki tarah bhi likhta hai, isliye neeche ke output mein base tasks pehle chalte hain. Chapter 6 dikhata hai yeh kaise kaam karta hai.</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook site.yml

PLAY [Routers] ****************************************************************

TASK [nk_base : NTP servers] **************************************************
changed: [pun-core-r1] =&gt; (item=10.99.0.60)
changed: [blr-edge-r2] =&gt; (item=10.99.0.60)

TASK [nk_base : Syslog host] **************************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]

TASK [nk_loopback : Render and push Loopback0] ********************************
<span class="hl">changed: [pun-core-r1]
changed: [blr-edge-r2]</span>

RUNNING HANDLER [nk_base : save config] ***************************************
changed: [pun-core-r1]
changed: [blr-edge-r2]</pre>
<p>Device par verify karo, phir dobara chalao taaki sabit ho ki role idempotent hai:</p>
<pre class="out">BLR-EDGE-R2# show running-config | section Loopback0
interface Loopback0
 description Router-ID of <span class="hl">blr-edge-r2</span>
 ip address <span class="hl">10.255.255.2</span> 255.255.255.255

netadmin@auto01:~/netauto$ ansible-playbook site.yml
TASK [nk_loopback : Render and push Loopback0] ********************************
<span class="hl">ok: [pun-core-r1]
ok: [blr-edge-r2]</span>

PLAY RECAP ********************************************************************
pun-core-r1                : ok=3    changed=0    unreachable=0    failed=0 ...
blr-edge-r2                : ok=3    changed=0    unreachable=0    failed=0 ...</pre>
<p>Doosra run kahin koi change nahi batata aur save handler chala hi nahi. Role ne sirf wahi kiya jo zaroori tha.</p>

<h3>Host ke paas address na ho to?</h3>
<p>Kisi host ke liye <code>loopback_ip</code> missing ho to us host ka render fail hota hai, bilkul module 4 ki tarah, aur koi config nahi bheji jaati:</p>
<pre class="out">TASK [nk_loopback : Render and push Loopback0] ********************************
fatal: [pun-core-r1]: FAILED! =&gt; {"changed": false, "msg": <span class="hl">"AnsibleUndefinedVariable: 'loopback_ip' is undefined"</span>}
fatal: [blr-edge-r2]: FAILED! =&gt; {"changed": false, "msg": "AnsibleUndefinedVariable: 'loopback_ip' is undefined"}</pre>
<p>Achhe roles apne required inputs jaldi check karte hain. Aasan tareeka <code>tasks/main.yml</code> ke upar <code>ansible.builtin.assert</code> task hai jisme saaf message ho jaise "loopback_ip must be set for every router". Tab error batata hai kya karna hai, sirf yeh nahi ki kya undefined hai.</p>

<h3>Inputs ko document karna</h3>
<p><code>init</code> ne jo <code>README.md</code> banayi woh role ke har expected variable, uske default aur example ki list ki jagah hai. README ko role ka hissa maano: jis role ko koi samajh na sake use copy karke edit kiya jaayega, jo wahi problem hai jisse aapne shuru kiya tha.</p>

<div class="warn"><p><b>Common mistakes.</b> Device ka apna address role ke andar hard-code karna; template ko path dena (<code>src: roles/nk_loopback/templates/loopback.j2</code>) bare naam ke bajaye; per-device data <code>defaults/</code> mein rakhna, jisse har device ek jaisa dikhta hai jab tak koi dekhe nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Role ke andar ke task ke liye <code>template</code> aur <code>copy</code> sources ke relative paths pehle role ke <code>templates/</code> aur <code>files/</code> folders mein dhoondhe jaate hain.</p></div>

<div class="scn"><h4>Role jo apna address saath le gaya</h4><p>Ek contractor ne loopback role likha jisme pehle router ka router-ID template mein baked tha. Do mahine baad ek aur router same role se joda gaya aur chupchaap pehle router ka address mil gaya. OSPF ne duplicate router IDs report kiye. Fix tha address ko host_vars mein le jaana aur ek assert jodna jo missing hone par fail kare.</p><p><b>Lesson:</b> role device-specific values ko inputs ki tarah leta hai.</p></div>

<div class="iv"><p class="q">"Reusable role banate waqt templates aur variables kahan rakhte ho?"</p><p>Template role ke templates folder mein aur naam se refer hota hai. Feature constants vars mein, tunable defaults defaults mein, aur loopback address jaise per-device facts project ke host_vars mein. Assert aur README jodo taaki missing inputs saaf tarah fail hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Role ka templates/ folder role ke saath chalta hai; files naam se refer karo.</li>
<li>Feature constants: vars. Tunable defaults: defaults. Device facts: host_vars.</li>
<li>Role tab idempotent hai jab uske modules hain: doosra run kuch nahi badalta.</li>
<li>Missing inputs saaf message ke saath jaldi fail hone chahiye (assert).</li>
<li>Variables README mein document karo.</li>
</ul></div>
`}};export{e as default};