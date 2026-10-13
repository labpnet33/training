var e={id:`junos-netconf`,h:{en:`Junos over NETCONF: netconf_get, junos_config and commit confirmed (Lab 1, step 6)`,hi:`NETCONF par Junos: netconf_get, junos_config aur commit confirmed (Lab 1, step 6)`},body:{en:`
<p>Junos is built around a candidate configuration and a commit. The <code>netconf</code> connection plugin fits that model: it opens the NETCONF subsystem on port 830, the same session you drove from Python in <code>adv-netconf</code>, and the Junos modules use it to load, compare and commit. Moving J1 from <code>network_cli</code> to <code>netconf</code> is a two-line change in one file.</p>

<h3>Switch the transport, keep the playbooks</h3>
<pre class="code"><span class="c"># group_vars/junos.yml</span>
ansible_network_os: junipernetworks.junos.junos
ansible_connection: ansible.netcommon.netconf</pre>
<p>The device must offer the service (<code>set system services netconf ssh</code> in the lab startup). Without it the task fails with <i>Unable to connect to port 830 on 10.99.0.11</i> and the host is UNREACHABLE. Run the unchanged <code>baseline.yml</code> again and the Junos task still says <code>ok</code>: the platform file changed, the playbook did not. That is the payoff of keeping the transport in group_vars.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Commit confirmed timeline">
<line x1="30" y1="75" x2="610" y2="75" stroke="#64748b" stroke-width="2"/>
<circle cx="80" cy="75" r="9" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="12">t0</text><text x="80" y="105" text-anchor="middle" class="svg-muted" font-size="11">junos_config</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="11">confirm: 1</text>
<circle cx="300" cy="75" r="9" fill="#bbf7d0"/><text x="300" y="55" text-anchor="middle" class="svg-ink" font-size="12">before t0 + 1 min</text><text x="300" y="105" text-anchor="middle" class="svg-muted" font-size="11">junos_config</text><text x="300" y="120" text-anchor="middle" class="svg-muted" font-size="11">confirm_commit: true</text>
<circle cx="520" cy="75" r="9" fill="#fed7aa"/><text x="520" y="55" text-anchor="middle" class="svg-ink" font-size="12">t0 + 1 min</text><text x="520" y="105" text-anchor="middle" class="svg-muted" font-size="11">no confirmation:</text><text x="520" y="120" text-anchor="middle" class="svg-muted" font-size="11">automatic rollback</text>
</svg><p class="cap">A confirmed commit is a timer. Confirm in time and the change stays; stay silent and Junos rolls it back by itself.</p></div>

<h3>netconf_get and junos_config in one playbook</h3>
<pre class="code"><span class="c"># junos_nc.yml</span>
---
- name: Junos over NETCONF
  hosts: junos
  gather_facts: false
  tasks:
    - name: Read the host name with netconf_get
      ansible.netcommon.netconf_get:
        source: running
        filter: "&lt;configuration&gt;&lt;system&gt;&lt;host-name/&gt;&lt;/system&gt;&lt;/configuration&gt;"
        display: json
      register: hn

    - name: Show it
      ansible.builtin.debug:
        msg: "{{ hn.output.data.configuration.system['host-name'] }}"

    - name: Change a setting with junos_config
      junipernetworks.junos.junos_config:
        lines:
          - set system domain-name nk.lab
        comment: "ansible over netconf"</pre>
<p><code>netconf_get</code> sends a <code>get-config</code> for the <code>source</code> datastore with a subtree <code>filter</code>, exactly the XML you wrote by hand in <code>adv-netconf</code>. With <code>display: json</code> the reply is converted and stored in <code>output</code> as a dictionary, so you walk it with ordinary Jinja2.</p>
<pre class="out">AUTO01$ ansible-playbook junos_nc.yml --diff
TASK [Read the host name with netconf_get] ************************************
ok: [J1]
TASK [Show it] ****************************************************************
ok: [J1] =&gt; {
    <span class="hl">"msg": "BLR-EDGE-J1"</span>
}
TASK [Change a setting with junos_config] *************************************
[edit system]
+   domain-name nk.lab;
changed: [J1]
PLAY RECAP ********************************************************************
J1                         : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>

<h3>The safe-change options of junos_config</h3>
<p>These are the options that make Junos changes safe, and each maps to something you know from NETCONF:</p>
<table class="cmp"><tr><th>Option</th><th>Effect</th></tr>
<tr><td><code>check_commit: true</code></td><td>Validate the candidate with a commit check, then do not commit. Returns <code>changed: false</code>.</td></tr>
<tr><td><code>confirm: N</code></td><td>Commit confirmed with a rollback timer of N minutes.</td></tr>
<tr><td><code>confirm_commit: true</code></td><td>Send the confirming commit.</td></tr>
<tr><td><code>comment</code></td><td>Text shown in <code>show system commit</code>.</td></tr>
<tr><td><code>rollback: N</code></td><td>Load rollback N (0 to 49) and commit.</td></tr>
<tr><td><code>src</code>, <code>src_format</code>, <code>update</code></td><td>Load a file or template in set, text, XML or JSON format, and choose merge, override, replace or update.</td></tr></table>
<pre class="out">TASK [Commit confirmed (rolls back by itself in 1 minute)] ********************
changed: [J1]
TASK [Confirm it] *************************************************************
changed: [J1]
TASK [A bad line] *************************************************************
<span class="hl">fatal: [J1]: FAILED! =&gt; {"changed": false, "msg": "syntax error: bogus-thing"}</span>
...ignoring
J1&gt; show system commit
0   2026-10-11 14:54:27 UTC by netops via netconf
1   2026-10-11 14:54:27 UTC by netops via netconf commit confirmed, rollback in 1mins
    CHG-2058 confirmed
2   2026-10-11 14:52:39 UTC by netops via netconf
    ansible over netconf</pre>
<p>Entry 1 is the confirmed commit with its comment, entry 0 is the confirming commit. If the second task had not run, Junos would have rolled entry 1 back after one minute.</p>

<h3>Raw NETCONF modules</h3>
<p>Three modules work on any NETCONF device, Junos or IOS XE: <code>netconf_get</code>, <code>netconf_config</code> (send XML with <code>content</code>) and <code>netconf_rpc</code> (call an RPC such as <code>get-software-information</code>). A <code>src</code> file also works with <code>junos_config</code>; this set-format file sits next to the playbook and is rendered by Jinja2:</p>
<pre class="out">AUTO01$ cat login.set
set system login message "Authorized use only - {{ inventory_hostname }}"
TASK [A set-format file next to the playbook] *********************************
[edit system login]
+   message "Authorized use only - J1";
changed: [J1]</pre>

<div class="note"><p><b>In the lab vs on real gear.</b> <code>netconf_config</code> reports <i>changed</i> from a real before and after comparison in the lab; the real module reports <i>changed: true</i> almost every time, so do not depend on it for idempotency on real gear. On IOS XE a <code>--check</code> run cannot dry-run a NETCONF edit and reports <i>changed: true</i>. A configuration lock held by someone else on Junos cannot be demonstrated through Ansible in the lab.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using <code>confirm: 1</code> and never sending <code>confirm_commit</code>. The change vanishes a minute later and the playbook looked successful. A confirmed commit needs a second step, ideally after a test that the management path still works.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>check_commit</code> validates and stops (nothing committed). <code>confirm</code> commits with a timer. <code>confirm_commit</code> only confirms; on its own it does not load lines.</p></div>

<div class="scn"><h4>The management change that undid itself</h4><p>A playbook moved the management address of a Junos router with <code>confirm: 2</code>. The new address was wrong, Ansible lost the router, and the confirming task could not connect, so it never ran. Two minutes later Junos rolled back to the old address and the router reappeared in the inventory.</p><p><b>Lesson:</b> for changes that can cut your own session, a confirmed commit is the safety net, and the confirming task must open a fresh connection.</p></div>
<div class="iv"><p class="q">"How would you make a risky Junos change safe with Ansible?"</p><p>Dry run with <code>--check --diff</code>, validate with <code>check_commit</code>, apply with <code>confirm: N</code> and a ticket comment, test reachability, then <code>confirm_commit</code>. If anything fails, the timer rolls the change back.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Set <code>ansible_connection: ansible.netcommon.netconf</code> in the Junos group; the device needs the netconf service on port 830.</li>
<li>The playbooks stay the same; only the group file changes.</li>
<li><code>netconf_get</code> reads with a subtree filter and <code>display: json</code> gives a dictionary.</li>
<li><code>check_commit</code>, <code>confirm</code>, <code>confirm_commit</code>, <code>comment</code> and <code>rollback</code> are the safety options.</li>
<li>Do not rely on <code>netconf_config</code> for idempotency on real gear.</li></ul></div>
`,hi:`
<p>Junos candidate configuration aur commit ke around bana hai. <code>netconf</code> connection plugin is model se fit baithta hai: woh port 830 par NETCONF subsystem kholta hai, wahi session jo aapne <code>adv-netconf</code> mein Python se chalaya tha, aur Junos modules use load, compare aur commit ke liye use karte hain. J1 ko <code>network_cli</code> se <code>netconf</code> par le jaana ek file mein do line ka change hai.</p>

<h3>Transport badlo, playbooks wahi rakho</h3>
<pre class="code"><span class="c"># group_vars/junos.yml</span>
ansible_network_os: junipernetworks.junos.junos
ansible_connection: ansible.netcommon.netconf</pre>
<p>Device ko service deni hogi (lab startup mein <code>set system services netconf ssh</code>). Uske bina task <i>Unable to connect to port 830 on 10.99.0.11</i> ke saath fail hota hai aur host UNREACHABLE hota hai. Bina badli <code>baseline.yml</code> dobara chalao aur Junos task ab bhi <code>ok</code> kehta hai: platform file badli, playbook nahi. Transport ko group_vars mein rakhne ka yahi fayda hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Commit confirmed timeline">
<line x1="30" y1="75" x2="610" y2="75" stroke="#64748b" stroke-width="2"/>
<circle cx="80" cy="75" r="9" fill="#bae6fd"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="12">t0</text><text x="80" y="105" text-anchor="middle" class="svg-muted" font-size="11">junos_config</text><text x="80" y="120" text-anchor="middle" class="svg-muted" font-size="11">confirm: 1</text>
<circle cx="300" cy="75" r="9" fill="#bbf7d0"/><text x="300" y="55" text-anchor="middle" class="svg-ink" font-size="12">t0 + 1 min se pehle</text><text x="300" y="105" text-anchor="middle" class="svg-muted" font-size="11">junos_config</text><text x="300" y="120" text-anchor="middle" class="svg-muted" font-size="11">confirm_commit: true</text>
<circle cx="520" cy="75" r="9" fill="#fed7aa"/><text x="520" y="55" text-anchor="middle" class="svg-ink" font-size="12">t0 + 1 min</text><text x="520" y="105" text-anchor="middle" class="svg-muted" font-size="11">confirm nahi kiya:</text><text x="520" y="120" text-anchor="middle" class="svg-muted" font-size="11">automatic rollback</text>
</svg><p class="cap">Confirmed commit ek timer hai. Waqt par confirm karo to change rehta hai; chup raho to Junos khud rollback kar deta hai.</p></div>

<h3>Ek playbook mein netconf_get aur junos_config</h3>
<pre class="code"><span class="c"># junos_nc.yml</span>
---
- name: Junos over NETCONF
  hosts: junos
  gather_facts: false
  tasks:
    - name: Read the host name with netconf_get
      ansible.netcommon.netconf_get:
        source: running
        filter: "&lt;configuration&gt;&lt;system&gt;&lt;host-name/&gt;&lt;/system&gt;&lt;/configuration&gt;"
        display: json
      register: hn

    - name: Show it
      ansible.builtin.debug:
        msg: "{{ hn.output.data.configuration.system['host-name'] }}"

    - name: Change a setting with junos_config
      junipernetworks.junos.junos_config:
        lines:
          - set system domain-name nk.lab
        comment: "ansible over netconf"</pre>
<p><code>netconf_get</code> <code>source</code> datastore ke liye subtree <code>filter</code> ke saath <code>get-config</code> bhejta hai, bilkul wahi XML jo aapne <code>adv-netconf</code> mein haath se likha tha. <code>display: json</code> ke saath reply convert hokar <code>output</code> mein dictionary ki tarah store hota hai, isliye aap use aam Jinja2 se walk karte ho.</p>
<pre class="out">AUTO01$ ansible-playbook junos_nc.yml --diff
TASK [Read the host name with netconf_get] ************************************
ok: [J1]
TASK [Show it] ****************************************************************
ok: [J1] =&gt; {
    <span class="hl">"msg": "BLR-EDGE-J1"</span>
}
TASK [Change a setting with junos_config] *************************************
[edit system]
+   domain-name nk.lab;
changed: [J1]
PLAY RECAP ********************************************************************
J1                         : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0</pre>

<h3>junos_config ke safe-change options</h3>
<p>Yeh options Junos changes ko safe banate hain, aur har ek NETCONF ki kisi jaani-pehchani cheez se juda hai:</p>
<table class="cmp"><tr><th>Option</th><th>Asar</th></tr>
<tr><td><code>check_commit: true</code></td><td>Candidate ko commit check se validate karo, phir commit mat karo. <code>changed: false</code> lautata hai.</td></tr>
<tr><td><code>confirm: N</code></td><td>N minute ke rollback timer ke saath commit confirmed.</td></tr>
<tr><td><code>confirm_commit: true</code></td><td>Confirm karne wala commit bhejo.</td></tr>
<tr><td><code>comment</code></td><td>Woh text jo <code>show system commit</code> mein dikhta hai.</td></tr>
<tr><td><code>rollback: N</code></td><td>Rollback N (0 se 49) load karo aur commit karo.</td></tr>
<tr><td><code>src</code>, <code>src_format</code>, <code>update</code></td><td>Set, text, XML ya JSON format mein file ya template load karo, aur merge, override, replace ya update chuno.</td></tr></table>
<pre class="out">TASK [Commit confirmed (rolls back by itself in 1 minute)] ********************
changed: [J1]
TASK [Confirm it] *************************************************************
changed: [J1]
TASK [A bad line] *************************************************************
<span class="hl">fatal: [J1]: FAILED! =&gt; {"changed": false, "msg": "syntax error: bogus-thing"}</span>
...ignoring
J1&gt; show system commit
0   2026-10-11 14:54:27 UTC by netops via netconf
1   2026-10-11 14:54:27 UTC by netops via netconf commit confirmed, rollback in 1mins
    CHG-2058 confirmed
2   2026-10-11 14:52:39 UTC by netops via netconf
    ansible over netconf</pre>
<p>Entry 1 comment ke saath confirmed commit hai, entry 0 confirm karne wala commit. Agar doosra task na chalta, to Junos entry 1 ko ek minute baad rollback kar deta.</p>

<h3>Raw NETCONF modules</h3>
<p>Teen modules kisi bhi NETCONF device par chalte hain, Junos ho ya IOS XE: <code>netconf_get</code>, <code>netconf_config</code> (<code>content</code> se XML bhejo) aur <code>netconf_rpc</code> (<code>get-software-information</code> jaisa RPC bulao). <code>src</code> file <code>junos_config</code> ke saath bhi chalti hai; yeh set-format file playbook ke paas rehti hai aur Jinja2 se render hoti hai:</p>
<pre class="out">AUTO01$ cat login.set
set system login message "Authorized use only - {{ inventory_hostname }}"
TASK [A set-format file next to the playbook] *********************************
[edit system login]
+   message "Authorized use only - J1";
changed: [J1]</pre>

<div class="note"><p><b>In the lab vs on real gear.</b> Lab mein <code>netconf_config</code> <i>changed</i> asli before aur after comparison se batata hai; real module lagbhag har baar <i>changed: true</i> batata hai, isliye real gear par idempotency ke liye us par depend mat karo. IOS XE par <code>--check</code> run NETCONF edit ko dry-run nahi kar sakta aur <i>changed: true</i> batata hai. Junos par kisi aur ka rakha configuration lock lab mein Ansible ke through dikhaya nahi ja sakta.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>confirm: 1</code> use karna aur <code>confirm_commit</code> kabhi na bhejna. Change ek minute baad gayab ho jaata hai aur playbook successful dikhti thi. Confirmed commit ko doosra step chahiye, behtar hai ki us test ke baad jo dekhe ki management path ab bhi chal raha hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>check_commit</code> validate karke ruk jaata hai (kuch commit nahi). <code>confirm</code> timer ke saath commit karta hai. <code>confirm_commit</code> sirf confirm karta hai; akela woh lines load nahi karta.</p></div>

<div class="scn"><h4>Management change jisne khud ko undo kiya</h4><p>Ek playbook ne <code>confirm: 2</code> ke saath Junos router ka management address badla. Naya address galat tha, Ansible router kho baitha, aur confirm karne wala task connect nahi kar paya isliye chala hi nahi. Do minute baad Junos purane address par rollback ho gaya aur router inventory mein wapas aa gaya.</p><p><b>Lesson:</b> jis change se aapka apna session kat sakta hai, uske liye confirmed commit safety net hai, aur confirm karne wala task naya connection kholna chahiye.</p></div>
<div class="iv"><p class="q">"Ansible se risky Junos change ko safe kaise banaoge?"</p><p><code>--check --diff</code> se dry run, <code>check_commit</code> se validate, <code>confirm: N</code> aur ticket comment ke saath apply, reachability test, phir <code>confirm_commit</code>. Kuch bhi fail ho to timer change ko rollback kar deta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos group mein <code>ansible_connection: ansible.netcommon.netconf</code> set karo; device ko port 830 par netconf service chahiye.</li>
<li>Playbooks wahi rehte hain; sirf group file badalti hai.</li>
<li><code>netconf_get</code> subtree filter se padhta hai aur <code>display: json</code> dictionary deta hai.</li>
<li><code>check_commit</code>, <code>confirm</code>, <code>confirm_commit</code>, <code>comment</code> aur <code>rollback</code> safety options hain.</li>
<li>Real gear par idempotency ke liye <code>netconf_config</code> par depend mat karo.</li></ul></div>
`}};export{e as default};