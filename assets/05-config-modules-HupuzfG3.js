var e={id:`config-modules`,h:{en:`ios_config, junos_config and eos_config (Lab 1, step 3)`,hi:`ios_config, junos_config aur eos_config (Lab 1, step 3)`},body:{en:`
<p>The three <code>*_config</code> modules look alike and behave differently under the hood. All of them take a list of <code>lines</code>, compare it with what the device already has, send only the difference and report <i>changed</i> or <i>ok</i>. What differs is how the device accepts the change, and that decides how safe a failed run is.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="How each config module delivers a change">
<rect x="8" y="76" width="120" height="48" rx="10" fill="#bae6fd"/><text x="68" y="105" text-anchor="middle" class="svg-ink" font-size="13">lines: [...]</text>
<rect x="170" y="14" width="190" height="48" rx="10" fill="#fed7aa"/><text x="265" y="43" text-anchor="middle" class="svg-ink" font-size="12">ios_config: diff vs running</text>
<rect x="170" y="76" width="190" height="48" rx="10" fill="#bbf7d0"/><text x="265" y="105" text-anchor="middle" class="svg-ink" font-size="12">junos_config: candidate</text>
<rect x="170" y="138" width="190" height="48" rx="10" fill="#ddd6fe"/><text x="265" y="167" text-anchor="middle" class="svg-ink" font-size="12">eos_config: config session</text>
<rect x="410" y="14" width="222" height="48" rx="10" fill="#e2e8f0"/><text x="521" y="43" text-anchor="middle" class="svg-ink" font-size="12">send missing lines to running</text>
<rect x="410" y="76" width="222" height="48" rx="10" fill="#e2e8f0"/><text x="521" y="105" text-anchor="middle" class="svg-ink" font-size="12">compare, then commit</text>
<rect x="410" y="138" width="222" height="48" rx="10" fill="#e2e8f0"/><text x="521" y="167" text-anchor="middle" class="svg-ink" font-size="12">session diff, then commit</text>
<line x1="128" y1="100" x2="170" y2="38" stroke="#64748b" stroke-width="2"/><line x1="128" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="128" y1="100" x2="170" y2="162" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="38" x2="410" y2="38" stroke="#64748b" stroke-width="2"/><line x1="360" y1="100" x2="410" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="162" x2="410" y2="162" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same input, three delivery methods. On Junos and EOS a rejected line leaves the device unchanged; on IOS XE earlier lines have already been applied.</p></div>

<h3>The Lab 1 baseline playbook</h3>
<p>The ticket (CHG-2058) asks for the NTP server and the syslog host on every device. The values come from <code>group_vars/network.yml</code>; each platform gets its own syntax and its own module:</p>
<pre class="code"><span class="c"># baseline.yml</span>
---
- name: Baseline NTP and syslog on IOS XE, Junos and EOS
  hosts: network
  gather_facts: false
  tasks:
    - name: IOS XE baseline
      cisco.ios.ios_config:
        lines:
          - "ntp server {{ ntp_server }}"
          - "logging host {{ syslog_server }}"
      when: ansible_network_os == 'cisco.ios.ios'

    - name: Junos baseline
      junipernetworks.junos.junos_config:
        lines:
          - "set system ntp server {{ ntp_server }}"
          - "set system syslog host {{ syslog_server }} any notice"
        comment: "ansible baseline"
      when: ansible_network_os == 'junipernetworks.junos.junos'

    - name: EOS baseline
      arista.eos.eos_config:
        lines:
          - "ntp server {{ ntp_server }}"
          - "logging host {{ syslog_server }}"
      when: ansible_network_os == 'arista.eos.eos'</pre>
<p>Compare the three tasks. IOS XE and EOS take plain configuration-mode lines. Junos takes <b>set</b> commands (and <code>delete</code> commands) from configuration mode, and a <code>comment</code> that lands in the commit log. The values are variables, so a new NTP server is a one-line change in one file.</p>

<h3>Options you will use every week</h3>
<table class="cmp"><tr><th>Option</th><th>What it does</th><th>Platforms</th></tr>
<tr><td><code>lines</code></td><td>The configuration lines to ensure</td><td>all</td></tr>
<tr><td><code>parents</code></td><td>The section the lines live in, for example <code>interface Ethernet1</code></td><td>IOS XE, EOS (Junos puts the path in each set line)</td></tr>
<tr><td><code>src</code></td><td>A file or Jinja2 template with the whole config text</td><td>all (see <code>ans-templates</code>)</td></tr>
<tr><td><code>match</code>, <code>replace</code></td><td>How strictly to compare lines, and whether to replace a whole block</td><td>IOS XE, EOS</td></tr>
<tr><td><code>save_when: modified</code></td><td>Save to startup only if something changed</td><td>IOS XE, EOS</td></tr>
<tr><td><code>backup</code>, <code>backup_options</code></td><td>Save the running config to a file first</td><td>all</td></tr>
<tr><td><code>comment</code>, <code>confirm</code></td><td>Commit comment, commit confirmed minutes</td><td>Junos (Chapter 7)</td></tr></table>

<h3>parents on IOS XE and EOS</h3>
<p>A line like <code>description LINK-TO-SW1</code> only makes sense inside an interface, so you name the section with <code>parents</code>. This is the IOS XE task from the lab with the verification output:</p>
<pre class="out">AUTO01$ ansible-playbook ex_ios.yml --diff
TASK [Interface description with parents] *************************************
--- before: running-config
+++ after: running-config
@@ -18,6 +18,7 @@
 username netops privilege 15 secret 9 $9$2foue0cr7twi1r$ue0cr7twi1rgdher2foue0cr7twi1rgdher
 !
 interface GigabitEthernet0/0
<span class="hl">+ description LINK-TO-SW1</span>
  ip address 10.99.0.1 255.255.255.0
  negotiation auto
 !
changed: [R1]
TASK [Commands sent] **********************************************************
ok: [R1] =&gt; {
    "r.updates": [
        "interface GigabitEthernet0/0",
        "description LINK-TO-SW1"
    ]
}</pre>
<p>The same idea on EOS, with the result key that tells you what was sent (<code>commands</code> on EOS, <code>updates</code> on IOS XE), and a second run that proves idempotency:</p>
<pre class="out">TASK [Commands sent] **********************************************************
ok: [E1] =&gt; {
    "r.commands": [
        "interface Ethernet1",
        "description uplink to core",
        "mtu 9000"
    ]
}
TASK [Same task again] ********************************************************
ok: [E1]
TASK [Idempotent?] ************************************************************
ok: [E1] =&gt; {
    "changed": false,
    "msg": "All assertions passed"
}</pre>

<div class="note"><p><b>NX-OS.</b> <code>cisco.nxos.nxos_config</code> works the same way: <code>lines</code>, <code>parents</code>, <code>save_when</code>. In the lab it applies lines directly in configuration mode. Everything you learn here transfers; the labs of this module do not use an NX-OS device.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using a <code>no</code> line (for example <code>no ntp server ...</code>) in <code>lines</code>. A negated line is never in the running config, so the module sends it on every run and reports <i>changed</i> each time. Read the device first and remove only what exists, as <code>ans-templates</code> showed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos lines are <code>set</code> or <code>delete</code> statements; IOS XE and EOS lines are the text you would type in configuration mode. Mixing them is the quickest way to a syntax error.</p></div>

<div class="scn"><h4>The line that did not belong</h4><p>A shared baseline contained one line that EOS did not know. The EOS task ended with <i>Commit rejected: % invalid: ...</i> and the switch kept its old configuration, because <code>eos_config</code> builds the change in a session and only commits when the whole session is valid. On an IOS XE router the same mistake would have applied the lines before the bad one.</p><p><b>Lesson:</b> know whether your platform is all-or-nothing. EOS and Junos are; IOS XE sends line by line.</p></div>
<div class="iv"><p class="q">"How does a config module stay idempotent?"</p><p>It reads the current configuration, compares it with the lines you asked for, sends only what is missing and returns <i>ok</i> when nothing differs. That is why a second run reports <code>changed=0</code>, and why lines that never appear in the running config, such as <code>no</code> commands, break idempotency.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three modules, one idea: ensure these lines exist, send only the difference.</li>
<li>Junos uses set and delete lines and a commit comment; IOS XE and EOS use mode lines with <code>parents</code>.</li>
<li>Keep intent in variables and syntax in the per-platform task.</li>
<li><code>updates</code> (IOS XE) and <code>commands</code> (EOS) show what was sent.</li>
<li>Negated <code>no</code> lines are never idempotent; read first, then remove.</li></ul></div>
`,hi:`
<p>Teeno <code>*_config</code> modules ek jaise dikhte hain aur andar se alag behave karte hain. Sab <code>lines</code> ki list lete hain, use device ke maujooda config se compare karte hain, sirf farq bhejte hain aur <i>changed</i> ya <i>ok</i> batate hain. Fark is mein hai ki device change ko kaise leta hai, aur wahi tay karta hai ki fail hue run ke baad kitna safe hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Har config module change kaise deliver karta hai">
<rect x="8" y="76" width="120" height="48" rx="10" fill="#bae6fd"/><text x="68" y="105" text-anchor="middle" class="svg-ink" font-size="13">lines: [...]</text>
<rect x="170" y="14" width="190" height="48" rx="10" fill="#fed7aa"/><text x="265" y="43" text-anchor="middle" class="svg-ink" font-size="12">ios_config: diff vs running</text>
<rect x="170" y="76" width="190" height="48" rx="10" fill="#bbf7d0"/><text x="265" y="105" text-anchor="middle" class="svg-ink" font-size="12">junos_config: candidate</text>
<rect x="170" y="138" width="190" height="48" rx="10" fill="#ddd6fe"/><text x="265" y="167" text-anchor="middle" class="svg-ink" font-size="12">eos_config: config session</text>
<rect x="410" y="14" width="222" height="48" rx="10" fill="#e2e8f0"/><text x="521" y="43" text-anchor="middle" class="svg-ink" font-size="12">missing lines running mein bhejo</text>
<rect x="410" y="76" width="222" height="48" rx="10" fill="#e2e8f0"/><text x="521" y="105" text-anchor="middle" class="svg-ink" font-size="12">compare, phir commit</text>
<rect x="410" y="138" width="222" height="48" rx="10" fill="#e2e8f0"/><text x="521" y="167" text-anchor="middle" class="svg-ink" font-size="12">session diff, phir commit</text>
<line x1="128" y1="100" x2="170" y2="38" stroke="#64748b" stroke-width="2"/><line x1="128" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="128" y1="100" x2="170" y2="162" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="38" x2="410" y2="38" stroke="#64748b" stroke-width="2"/><line x1="360" y1="100" x2="410" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="162" x2="410" y2="162" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Input ek, delivery ke teen tareeke. Junos aur EOS par rejected line device ko badalta nahi; IOS XE par pehle ki lines apply ho chuki hoti hain.</p></div>

<h3>Lab 1 ki baseline playbook</h3>
<p>Ticket (CHG-2058) har device par NTP server aur syslog host maangta hai. Values <code>group_vars/network.yml</code> se aati hain; har platform ko apna syntax aur apna module milta hai:</p>
<pre class="code"><span class="c"># baseline.yml</span>
---
- name: Baseline NTP and syslog on IOS XE, Junos and EOS
  hosts: network
  gather_facts: false
  tasks:
    - name: IOS XE baseline
      cisco.ios.ios_config:
        lines:
          - "ntp server {{ ntp_server }}"
          - "logging host {{ syslog_server }}"
      when: ansible_network_os == 'cisco.ios.ios'

    - name: Junos baseline
      junipernetworks.junos.junos_config:
        lines:
          - "set system ntp server {{ ntp_server }}"
          - "set system syslog host {{ syslog_server }} any notice"
        comment: "ansible baseline"
      when: ansible_network_os == 'junipernetworks.junos.junos'

    - name: EOS baseline
      arista.eos.eos_config:
        lines:
          - "ntp server {{ ntp_server }}"
          - "logging host {{ syslog_server }}"
      when: ansible_network_os == 'arista.eos.eos'</pre>
<p>Teeno tasks compare karo. IOS XE aur EOS plain configuration-mode lines lete hain. Junos configuration mode ke <b>set</b> commands (aur <code>delete</code> commands) leta hai, aur <code>comment</code> jo commit log mein jaata hai. Values variables hain, isliye naya NTP server ek file mein ek line ka change hai.</p>

<h3>Options jo har hafte use honge</h3>
<table class="cmp"><tr><th>Option</th><th>Kya karta hai</th><th>Platforms</th></tr>
<tr><td><code>lines</code></td><td>Woh configuration lines jo honi chahiye</td><td>sab</td></tr>
<tr><td><code>parents</code></td><td>Woh section jisme lines rehti hain, jaise <code>interface Ethernet1</code></td><td>IOS XE, EOS (Junos har set line mein path rakhta hai)</td></tr>
<tr><td><code>src</code></td><td>Poora config text wali file ya Jinja2 template</td><td>sab (<code>ans-templates</code> dekho)</td></tr>
<tr><td><code>match</code>, <code>replace</code></td><td>Lines kitni sakhti se compare hon, aur poora block replace ho ya nahi</td><td>IOS XE, EOS</td></tr>
<tr><td><code>save_when: modified</code></td><td>Kuch badla ho tabhi startup mein save karo</td><td>IOS XE, EOS</td></tr>
<tr><td><code>backup</code>, <code>backup_options</code></td><td>Pehle running config file mein save karo</td><td>sab</td></tr>
<tr><td><code>comment</code>, <code>confirm</code></td><td>Commit comment, commit confirmed ke minutes</td><td>Junos (Chapter 7)</td></tr></table>

<h3>IOS XE aur EOS par parents</h3>
<p><code>description LINK-TO-SW1</code> jaisi line sirf interface ke andar samajh aati hai, isliye section ka naam <code>parents</code> se dete ho. Yeh lab ka IOS XE task hai verification output ke saath:</p>
<pre class="out">AUTO01$ ansible-playbook ex_ios.yml --diff
TASK [Interface description with parents] *************************************
--- before: running-config
+++ after: running-config
@@ -18,6 +18,7 @@
 username netops privilege 15 secret 9 $9$2foue0cr7twi1r$ue0cr7twi1rgdher2foue0cr7twi1rgdher
 !
 interface GigabitEthernet0/0
<span class="hl">+ description LINK-TO-SW1</span>
  ip address 10.99.0.1 255.255.255.0
  negotiation auto
 !
changed: [R1]
TASK [Commands sent] **********************************************************
ok: [R1] =&gt; {
    "r.updates": [
        "interface GigabitEthernet0/0",
        "description LINK-TO-SW1"
    ]
}</pre>
<p>EOS par wahi idea, us result key ke saath jo batati hai kya bheja gaya (EOS par <code>commands</code>, IOS XE par <code>updates</code>), aur doosra run jo idempotency saabit karta hai:</p>
<pre class="out">TASK [Commands sent] **********************************************************
ok: [E1] =&gt; {
    "r.commands": [
        "interface Ethernet1",
        "description uplink to core",
        "mtu 9000"
    ]
}
TASK [Same task again] ********************************************************
ok: [E1]
TASK [Idempotent?] ************************************************************
ok: [E1] =&gt; {
    "changed": false,
    "msg": "All assertions passed"
}</pre>

<div class="note"><p><b>NX-OS.</b> <code>cisco.nxos.nxos_config</code> isi tarah chalta hai: <code>lines</code>, <code>parents</code>, <code>save_when</code>. Lab mein woh lines seedha configuration mode mein apply karta hai. Jo aap yahan seekhte ho sab transfer hota hai; is module ke labs mein NX-OS device nahi hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>lines</code> mein <code>no</code> line (jaise <code>no ntp server ...</code>) use karna. Negated line running config mein kabhi nahi hoti, isliye module use har run par bhejta hai aur har baar <i>changed</i> batata hai. Pehle device padho aur sirf wahi hatao jo maujood hai, jaisa <code>ans-templates</code> ne dikhaya tha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos ki lines <code>set</code> ya <code>delete</code> statements hain; IOS XE aur EOS ki lines woh text hain jo aap configuration mode mein type karte. Inhe milana syntax error ka sabse tez raasta hai.</p></div>

<div class="scn"><h4>Woh line jo wahan thi hi nahi</h4><p>Ek shared baseline mein ek line thi jo EOS nahi jaanta tha. EOS task <i>Commit rejected: % invalid: ...</i> ke saath khatam hua aur switch ne purana configuration rakha, kyunki <code>eos_config</code> change session mein banata hai aur poora session valid ho tabhi commit karta hai. IOS XE router par yahi galti bad line se pehle ki lines apply kar chuki hoti.</p><p><b>Lesson:</b> jaano ki aapka platform all-or-nothing hai ya nahi. EOS aur Junos hain; IOS XE line by line bhejta hai.</p></div>
<div class="iv"><p class="q">"Config module idempotent kaise rehta hai?"</p><p>Woh maujooda configuration padhta hai, use maangi hui lines se compare karta hai, sirf jo missing hai woh bhejta hai aur kuch alag na ho to <i>ok</i> lautata hai. Isliye doosra run <code>changed=0</code> batata hai, aur isliye woh lines jo running config mein kabhi nahi aati, jaise <code>no</code> commands, idempotency tod deti hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen modules, ek idea: yeh lines maujood honi chahiye, sirf farq bhejo.</li>
<li>Junos set aur delete lines aur commit comment use karta hai; IOS XE aur EOS <code>parents</code> ke saath mode lines.</li>
<li>Intent variables mein rakho aur syntax per-platform task mein.</li>
<li><code>updates</code> (IOS XE) aur <code>commands</code> (EOS) dikhate hain kya bheja gaya.</li>
<li>Negated <code>no</code> lines kabhi idempotent nahi hoti; pehle padho, phir hatao.</li></ul></div>
`}};export{e as default};