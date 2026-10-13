var e={id:`template-module`,h:{en:`The template module: rendering on the controller`,hi:`template module: controller par rendering`},body:{en:`
<p><b>One idea in this chapter:</b> the <code>ansible.builtin.template</code> module takes a template and a destination file, fills in the variables of one host, and writes the result. It never talks to the router.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The template module runs on the control node">
<rect x="20" y="20" width="400" height="110" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="40" y="44" class="svg-ink" font-size="13">AUTO01 (control node)</text>
<rect x="40" y="58" width="110" height="52" rx="8" fill="#fde68a"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="12">templates/</text><text x="95" y="96" text-anchor="middle" class="svg-ink" font-size="12">base.j2</text>
<rect x="190" y="58" width="100" height="52" rx="8" fill="#ddd6fe"/><text x="240" y="88" text-anchor="middle" class="svg-ink" font-size="12">template</text>
<rect x="320" y="58" width="90" height="52" rx="8" fill="#bbf7d0"/><text x="365" y="80" text-anchor="middle" class="svg-ink" font-size="12">configs/</text><text x="365" y="96" text-anchor="middle" class="svg-ink" font-size="12">R1.cfg</text>
<line x1="150" y1="84" x2="190" y2="84" stroke="#64748b" stroke-width="2"/><line x1="290" y1="84" x2="320" y2="84" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="45" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="560" y="72" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">not involved</text>
</svg><p class="cap">Files are written on the control node. The router is not involved yet.</p></div>

<h3>Why delegate_to: localhost</h3>
<p>Ansible normally runs each task <i>on</i> the host named in the play. A Cisco router has no folder Ansible can write a file into, and the connection type for routers (<code>network_cli</code>) only knows how to type CLI commands. So a task that writes a file must run on the control node itself. The keyword <code>delegate_to: localhost</code> means "do this task here, but still use this host's variables". The output shows it as <code>pun-core-r1 -&gt; localhost</code>.</p>
<p>The helper playbook from chapter 2 shows the whole pattern. Read it line by line:</p>
<pre class="code"><span class="c"># preview.yml</span>
---
- name: Render one template for every router
  hosts: routers                 <span class="c"># the group from inventory.yml</span>
  gather_facts: false            <span class="c"># routers cannot answer the Linux fact scan</span>
  tasks:
    - name: Folder for the rendered configs
      ansible.builtin.file:
        path: configs
        state: directory         <span class="c"># make the folder if it is missing</span>
      delegate_to: localhost
      run_once: true             <span class="c"># once, not once per router</span>

    - name: Render the template
      ansible.builtin.template:
        src: "{{ tpl }}"         <span class="c"># looked up in templates/</span>
        dest: "configs/{{ inventory_hostname }}.cfg"
      delegate_to: localhost</pre>
<ul>
<li><code>src</code> is the template. Ansible looks in the <code>templates/</code> folder next to the playbook first, then next to the playbook itself.</li>
<li><code>dest</code> contains <code>{{ inventory_hostname }}</code>, so each router gets its own file name.</li>
<li><code>run_once: true</code> creates the folder one time. Without it the same folder task runs for every router.</li>
</ul>

<h3>Idempotent by default</h3>
<p>The module compares the new text with the file on disk. Same text means <code>ok</code> and no write. Different text means <code>changed</code>. Run the playbook twice:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook render.yml        <span class="c">(first run)</span>
TASK [Render the config] ******************************************************
changed: [pun-core-r1 -&gt; localhost]
changed: [blr-edge-r2 -&gt; localhost]

netadmin@auto01:~/netauto$ ansible-playbook render.yml        <span class="c">(second run)</span>
TASK [Folder for the rendered configs] ****************************************
ok: [pun-core-r1 -&gt; localhost]

TASK [Render the config] ******************************************************
<span class="hl">ok: [pun-core-r1 -&gt; localhost]
ok: [blr-edge-r2 -&gt; localhost]</span></pre>

<h3>The three errors every beginner meets</h3>
<p><b>1. Forgetting delegate_to.</b> Ansible tries to run the file module over the router connection:</p>
<pre class="out">fatal: [pun-core-r1]: FAILED! =&gt; {"changed": false, "msg": <span class="hl">"Connection type network_cli is not valid for this module"</span>}</pre>
<p><b>2. The destination folder does not exist.</b> The template module writes a file; it does not create parent folders. The fix is the <code>file</code> task shown above.</p>
<pre class="out">fatal: [pun-core-r1 -&gt; localhost]: FAILED! =&gt; {"changed": false, "checksum": "4697dbe41d91c41d", "msg": <span class="hl">"Destination directory /home/netadmin/netauto/configs does not exist"</span>}</pre>
<p><b>3. Wrong template name.</b> The message lists exactly where Ansible looked:</p>
<pre class="out">fatal: [pun-core-r1 -&gt; localhost]: FAILED! =&gt; {"changed": false, "msg": <span class="hl">"Could not find or access 'basee.j2'
Searched in:
	/home/netadmin/netauto/templates/basee.j2
	/home/netadmin/netauto/basee.j2 on the Ansible Controller.</span>
If you are using a module and expect the file to exist on the remote, see the remote_src option"}</pre>

<h3>Preview before writing</h3>
<p>With <code>--check --diff</code> the module reports what <i>would</i> change in the file, line by line. Here the NTP list gained a second server:</p>
<pre class="out">TASK [Render the config] ******************************************************
--- before: /home/netadmin/netauto/configs/pun-core-r1.cfg
+++ after: /home/netadmin/netauto/templates/base.j2
@@ -1,6 +1,7 @@
 hostname PUN-CORE-R1
 ip domain name nk.lab
 ntp server 10.99.0.60
<span class="hl">+ntp server 10.99.0.61</span>
 logging host 10.99.0.60
 !
 interface Loopback0
changed: [pun-core-r1 -&gt; localhost]</pre>

<div class="warn"><p><b>Common mistakes.</b> Putting the rendered files inside <code>templates/</code> (keep generated output in its own folder such as <code>configs/</code>); committing generated files by hand-editing them (edit the template or the variables, never the output); using the older short module name in new work (write <code>ansible.builtin.template</code>).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>copy</code> sends a file unchanged; <code>template</code> renders variables first. Both are file modules and need <code>delegate_to: localhost</code> when the target is a network device.</p></div>

<div class="scn"><h4>Playbook works on a laptop, fails on the build server</h4><p>An engineer's render playbook worked locally but failed on the shared control node with <i>Destination directory ... does not exist</i>. On the laptop the folder had been made by hand months before. Adding the <code>file: state: directory</code> task made the playbook self-sufficient on any fresh machine.</p><p><b>Lesson:</b> a playbook should create everything it needs.</p></div>

<div class="iv"><p class="q">"Why does a template task for a router need delegate_to: localhost?"</p><p>The template module writes a file, which the network_cli connection cannot do on a router. delegate_to runs the task on the control node while keeping the router's variables. Mention run_once for the folder task.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>template renders one host's variables into a file on the control node.</li>
<li>Use delegate_to: localhost for file modules aimed at network hosts.</li>
<li>Create the destination folder first; use run_once so it runs once.</li>
<li>The module is idempotent: same text, no change.</li>
<li>--check --diff shows the exact line changes before any file is written.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> <code>ansible.builtin.template</code> module ek template aur destination file leta hai, ek host ke variables bharta hai, aur nateeja likh deta hai. Yeh router se kabhi baat nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="template module control node par chalta hai">
<rect x="20" y="20" width="400" height="110" rx="12" fill="#f1f5f9" stroke="#cbd5e1"/><text x="40" y="44" class="svg-ink" font-size="13">AUTO01 (control node)</text>
<rect x="40" y="58" width="110" height="52" rx="8" fill="#fde68a"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="12">templates/</text><text x="95" y="96" text-anchor="middle" class="svg-ink" font-size="12">base.j2</text>
<rect x="190" y="58" width="100" height="52" rx="8" fill="#ddd6fe"/><text x="240" y="88" text-anchor="middle" class="svg-ink" font-size="12">template</text>
<rect x="320" y="58" width="90" height="52" rx="8" fill="#bbf7d0"/><text x="365" y="80" text-anchor="middle" class="svg-ink" font-size="12">configs/</text><text x="365" y="96" text-anchor="middle" class="svg-ink" font-size="12">R1.cfg</text>
<line x1="150" y1="84" x2="190" y2="84" stroke="#64748b" stroke-width="2"/><line x1="290" y1="84" x2="320" y2="84" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="45" width="120" height="60" rx="10" fill="#e2e8f0"/><text x="560" y="72" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">abhi shaamil nahi</text>
</svg><p class="cap">Files control node par likhi jaati hain. Router abhi shaamil nahi hai.</p></div>

<h3>delegate_to: localhost kyun</h3>
<p>Ansible normally har task us host <i>par</i> chalata hai jiska naam play mein hai. Cisco router mein aisa folder nahi jisme Ansible file likh sake, aur routers ka connection type (<code>network_cli</code>) sirf CLI commands type karna jaanta hai. Isliye file likhne wala task control node par hi chalna chahiye. <code>delegate_to: localhost</code> ka matlab hai "yeh task yahan chalao, lekin is host ke variables use karo". Output mein yeh <code>pun-core-r1 -&gt; localhost</code> dikhta hai.</p>
<p>Chapter 2 ka helper playbook poora pattern dikhata hai. Line by line padho:</p>
<pre class="code"><span class="c"># preview.yml</span>
---
- name: Render one template for every router
  hosts: routers                 <span class="c"># inventory.yml ka group</span>
  gather_facts: false            <span class="c"># routers Linux fact scan ka jawab nahi de sakte</span>
  tasks:
    - name: Folder for the rendered configs
      ansible.builtin.file:
        path: configs
        state: directory         <span class="c"># folder na ho to bana do</span>
      delegate_to: localhost
      run_once: true             <span class="c"># ek baar, har router ke liye nahi</span>

    - name: Render the template
      ansible.builtin.template:
        src: "{{ tpl }}"         <span class="c"># templates/ mein dhoondha jaata hai</span>
        dest: "configs/{{ inventory_hostname }}.cfg"
      delegate_to: localhost</pre>
<ul>
<li><code>src</code> template hai. Ansible pehle playbook ke paas ke <code>templates/</code> folder mein dekhta hai, phir playbook ke paas.</li>
<li><code>dest</code> mein <code>{{ inventory_hostname }}</code> hai, isliye har router ki apni file ban jaati hai.</li>
<li><code>run_once: true</code> folder ek baar banata hai. Iske bina folder task har router ke liye chalta.</li>
</ul>

<h3>Default se idempotent</h3>
<p>Module naye text ko disk ki file se milata hai. Same text ka matlab <code>ok</code> aur koi write nahi. Alag text ka matlab <code>changed</code>. Playbook do baar chalao:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook render.yml        <span class="c">(pehla run)</span>
TASK [Render the config] ******************************************************
changed: [pun-core-r1 -&gt; localhost]
changed: [blr-edge-r2 -&gt; localhost]

netadmin@auto01:~/netauto$ ansible-playbook render.yml        <span class="c">(doosra run)</span>
TASK [Folder for the rendered configs] ****************************************
ok: [pun-core-r1 -&gt; localhost]

TASK [Render the config] ******************************************************
<span class="hl">ok: [pun-core-r1 -&gt; localhost]
ok: [blr-edge-r2 -&gt; localhost]</span></pre>

<h3>Teen errors jo har beginner ko milte hain</h3>
<p><b>1. delegate_to bhool gaye.</b> Ansible file module ko router connection par chalane ki koshish karta hai:</p>
<pre class="out">fatal: [pun-core-r1]: FAILED! =&gt; {"changed": false, "msg": <span class="hl">"Connection type network_cli is not valid for this module"</span>}</pre>
<p><b>2. Destination folder nahi hai.</b> Template module file likhta hai; parent folders nahi banata. Fix upar dikhaya hua <code>file</code> task hai.</p>
<pre class="out">fatal: [pun-core-r1 -&gt; localhost]: FAILED! =&gt; {"changed": false, "checksum": "4697dbe41d91c41d", "msg": <span class="hl">"Destination directory /home/netadmin/netauto/configs does not exist"</span>}</pre>
<p><b>3. Template ka naam galat.</b> Message bilkul batata hai Ansible ne kahan dhoondha:</p>
<pre class="out">fatal: [pun-core-r1 -&gt; localhost]: FAILED! =&gt; {"changed": false, "msg": <span class="hl">"Could not find or access 'basee.j2'
Searched in:
	/home/netadmin/netauto/templates/basee.j2
	/home/netadmin/netauto/basee.j2 on the Ansible Controller.</span>
If you are using a module and expect the file to exist on the remote, see the remote_src option"}</pre>

<h3>Likhne se pehle preview</h3>
<p><code>--check --diff</code> ke saath module file mein jo <i>badlega</i> woh line by line batata hai. Yahan NTP list mein doosra server judaa:</p>
<pre class="out">TASK [Render the config] ******************************************************
--- before: /home/netadmin/netauto/configs/pun-core-r1.cfg
+++ after: /home/netadmin/netauto/templates/base.j2
@@ -1,6 +1,7 @@
 hostname PUN-CORE-R1
 ip domain name nk.lab
 ntp server 10.99.0.60
<span class="hl">+ntp server 10.99.0.61</span>
 logging host 10.99.0.60
 !
 interface Loopback0
changed: [pun-core-r1 -&gt; localhost]</pre>

<div class="warn"><p><b>Common mistakes.</b> Rendered files ko <code>templates/</code> ke andar rakhna (generated output alag folder jaise <code>configs/</code> mein rakho); generated files ko haath se edit karna (template ya variables edit karo, output kabhi nahi); naye kaam mein purana chhota module naam use karna (<code>ansible.builtin.template</code> likho).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>copy</code> file jaisi hai waisi bhejta hai; <code>template</code> pehle variables render karta hai. Dono file modules hain aur network device ke target par <code>delegate_to: localhost</code> chahiye.</p></div>

<div class="scn"><h4>Laptop par chalta hai, build server par fail</h4><p>Ek engineer ka render playbook local par chalta tha lekin shared control node par <i>Destination directory ... does not exist</i> se fail hua. Laptop par folder mahino pehle haath se bana tha. <code>file: state: directory</code> task jodne se playbook kisi bhi nayi machine par apne aap chalne laga.</p><p><b>Lesson:</b> playbook ko zaroorat ki har cheez khud banani chahiye.</p></div>

<div class="iv"><p class="q">"Router ke template task ko delegate_to: localhost kyun chahiye?"</p><p>Template module file likhta hai, jo network_cli connection router par nahi kar sakta. delegate_to task ko control node par chalata hai aur router ke variables rakhta hai. Folder task ke liye run_once ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>template ek host ke variables ko control node par file mein render karta hai.</li>
<li>Network hosts ke file modules ke liye delegate_to: localhost use karo.</li>
<li>Destination folder pehle banao; run_once se ek baar chalao.</li>
<li>Module idempotent hai: same text, koi change nahi.</li>
<li>--check --diff koi file likhne se pehle exact line changes dikhata hai.</li>
</ul></div>
`}};export{e as default};