var e={id:`backups-drift-troubleshooting`,h:{en:`Backups, drift detection and a troubleshooting workflow`,hi:`Backups, drift detection aur troubleshooting workflow`},body:{en:`
<p><b>One idea in this chapter:</b> templates describe how devices <i>should</i> look. Backups record how they <i>are</i>, and check mode tells you where the two disagree. That disagreement is called <b>drift</b>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Standard versus device, drift found by check mode">
<rect x="20" y="20" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="13">Standard (baseline.yml)</text><text x="115" y="75" text-anchor="middle" class="svg-muted" font-size="12">ntp server 10.99.0.60</text><text x="115" y="95" text-anchor="middle" class="svg-muted" font-size="12">logging host 10.99.0.60</text>
<rect x="250" y="45" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">--check --diff</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">compare only</text>
<rect x="430" y="20" width="190" height="110" rx="10" fill="#fed7aa"/><text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="13">blr-edge-r2 (device)</text><text x="525" y="75" text-anchor="middle" class="svg-muted" font-size="12">ntp server 10.99.0.99</text><text x="525" y="95" text-anchor="middle" class="svg-muted" font-size="12">standard NTP missing</text>
<line x1="210" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="390" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A host that reports changed in check mode has drifted.</p></div>

<h3>Dated backups</h3>
<p>Before any mass change, save what the devices look like now. The <code>backup: true</code> option of ios_config writes the running-config to a file on the control node. We choose the folder and a name with the date:</p>
<pre class="code"><span class="c"># backup.yml</span>
---
- name: Back up the running configs
  hosts: all
  gather_facts: false
  tasks:
    - name: Backup
      cisco.ios.ios_config:
        backup: true
        backup_options:
          dir_path: /home/netadmin/backups
          filename: "{{ inventory_hostname }}_{{ now().strftime('%Y-%m-%d') }}.cfg"</pre>
<p><code>now()</code> returns the current date and time; <code>strftime('%Y-%m-%d')</code> formats it as year-month-day. Without <code>backup_options</code> the file goes into a <code>backup/</code> folder next to the playbook with a timestamp in its name.</p>
<pre class="out">netadmin@auto01:~$ ls ~/backups
blr-edge-r2_2026-09-29.cfg  pun-acc-sw1_2026-09-29.cfg  pun-core-r1_2026-09-29.cfg</pre>
<p>One file per device and day. Keep them in Git or on a protected share: configs contain secrets such as hashed passwords and SNMP strings.</p>

<h3>Finding drift without changing anything</h3>
<p><code>baseline.yml</code> holds the standard lines for all three devices. Run it in check mode with diff:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook baseline.yml --check --diff
TASK [Standard NTP and syslog] ************************************************
ok: [pun-core-r1]
--- before: running-config
+++ after: running-config
@@ -51,4 +51,5 @@
  login local
  transport input ssh
 !
<span class="hl">+ntp server 10.99.0.60</span>
 end
<span class="hl">changed: [blr-edge-r2]</span>
ok: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0 ...
<span class="hl">blr-edge-r2                : ok=1    changed=1</span> ...
pun-acc-sw1                : ok=1    changed=0 ...</pre>
<p>Two devices say ok. <code>blr-edge-r2</code> says changed: it lacks the standard NTP server. Reading its backup shows why: it still points at an old server, <code>10.99.0.99</code>.</p>

<h3>The trap with "no" commands</h3>
<p>The obvious fix is a task with <code>lines: [no ntp server 10.99.0.99]</code>. Do not. A "no" line never appears in a running-config, so ios_config always thinks it is missing, sends it every run, and reports <b>changed</b> every time. Your drift report becomes useless because it always shows changes. <b>Note:</b> the lab simulator does not reproduce this particular trap (its second run reports ok); on real IOS devices with the real module it does. The pattern below is safe in both places. The correct pattern is <b>read first, remove only what exists</b>:</p>
<pre class="code">    - name: Read the NTP servers
      cisco.ios.ios_command:
        commands: show running-config | include ^ntp server
      register: ntp_now

    - name: Remove NTP servers that are not standard
      cisco.ios.ios_config:
        lines:
          - "no ntp server {{ item }}"
        save_when: modified
      loop: "{{ ntp_now.stdout[0] | regex_findall('ntp server ([0-9.]+)') | difference(['10.99.0.60']) }}"</pre>
<p>Step by step: <code>ios_command</code> runs a show command and <code>register</code> stores its answer in a variable. <code>ntp_now.stdout[0]</code> is the text of the first command. <code>regex_findall</code> extracts every IP address that follows "ntp server". <code>difference</code> removes the standard one, leaving only the extras. <code>loop</code> runs the removal once per extra. Run it, then run it again:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook baseline.yml
TASK [Remove NTP servers that are not standard] *******************************
skipping: [pun-core-r1]
<span class="hl">changed: [blr-edge-r2] =&gt; (item=10.99.0.99)</span>
skipping: [pun-acc-sw1]

netadmin@auto01:~/netauto$ ansible-playbook baseline.yml
TASK [Remove NTP servers that are not standard] *******************************
<span class="hl">skipping: [pun-core-r1]
skipping: [blr-edge-r2]
skipping: [pun-acc-sw1]</span></pre>
<p>The second run has an empty loop list, so every host is skipped and nothing changes. The playbook is idempotent again, and a fresh backup of <code>blr-edge-r2</code> now holds exactly one <code>ntp server</code> line.</p>

<h3>Troubleshooting workflow for template playbooks</h3>
<ol>
<li><b>Read the failing line.</b> It names the task and host. Is it the render task or the push task?</li>
<li><b>Classify the message</b> with the table below.</li>
<li><b>Reproduce small:</b> <code>--limit</code> one host and render only; read the file in <code>configs/</code>.</li>
<li><b>Inspect data:</b> <code>ansible-inventory --host NAME</code> shows the variables the template really sees.</li>
<li><b>Preview:</b> <code>--check --diff</code> before the real run.</li>
<li><b>Verify</b> on the device and with a second run that reports no change.</li>
</ol>
<table class="cmp"><tr><th>Message from the run</th><th>Meaning and fix</th></tr>
<tr><td><code>AnsibleUndefinedVariable: 'site_code' is undefined</code></td><td>Variable missing for this host. Define it, fix the spelling, or use default() if a fallback is safe.</td></tr>
<tr><td><code>Unexpected end of template. Jinja was looking for the following tags: 'endfor' or 'else'</code></td><td>A block was not closed. Add the endfor or endif. Note: <code>--syntax-check</code> does <b>not</b> catch this; only rendering does.</td></tr>
<tr><td><code>Connection type network_cli is not valid for this module</code></td><td>A file module ran on the router. Add <code>delegate_to: localhost</code>.</td></tr>
<tr><td><code>Destination directory ... does not exist</code></td><td>Create the folder first with the file module.</td></tr>
<tr><td><code>Could not find or access 'basee.j2'</code></td><td>Wrong template name; the message lists the folders searched.</td></tr>
<tr><td><code>sending configuration line '...' failed: % Invalid input detected</code></td><td>The router rejected a rendered line (bad syntax or a typo in the data). Read the rendered file for that line.</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Using <code>no ...</code> lines directly in lines (always changed); trusting the drift report from a task that is never idempotent; storing backups without access control; running mass changes without a same-day backup.</p></div>
<div class="exam"><p><b>Exam trap.</b> Check mode on the standard playbook <i>is</i> the drift report: changed means the host differs from the standard. It does not fix anything.</p></div>

<div class="scn"><h4>The Bengaluru router that kept the old NTP server</h4><p>Auditors noticed one router syncing time to a decommissioned server. The nightly check run listed it as changed for weeks, but nobody read the report. After adding the read-then-remove tasks and a backup before each run, one run fixed it, a second run showed zero changes, and the backup proved the single standard server.</p><p><b>Lesson:</b> drift reports only help if someone reads them, and fixes must be idempotent so the report stays clean.</p></div>

<div class="iv"><p class="q">"How would you detect configuration drift with Ansible?"</p><p>Keep the standard as a playbook or template, run it with --check --diff on a schedule, and treat any host reporting changed as drifted. Take dated backups for evidence. Mention that removal tasks must read the device first because "no" lines are never in the running-config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>backup: true with backup_options saves dated configs on the control node.</li>
<li>--check --diff against your standard is a drift report.</li>
<li>Never put no lines straight into ios_config lines; read, filter, loop.</li>
<li>An empty loop list means skipped tasks and a clean second run.</li>
<li>Troubleshoot in order: message, small render, variables, preview, verify.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> templates batate hain ki devices <i>kaise hone chahiye</i>. Backups batate hain ki woh <i>kaise hain</i>, aur check mode batata hai ki dono kahan alag hain. Is antar ko <b>drift</b> kehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Standard bana device, check mode se drift milta hai">
<rect x="20" y="20" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="13">Standard (baseline.yml)</text><text x="115" y="75" text-anchor="middle" class="svg-muted" font-size="12">ntp server 10.99.0.60</text><text x="115" y="95" text-anchor="middle" class="svg-muted" font-size="12">logging host 10.99.0.60</text>
<rect x="250" y="45" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">--check --diff</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">sirf compare</text>
<rect x="430" y="20" width="190" height="110" rx="10" fill="#fed7aa"/><text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="13">blr-edge-r2 (device)</text><text x="525" y="75" text-anchor="middle" class="svg-muted" font-size="12">ntp server 10.99.0.99</text><text x="525" y="95" text-anchor="middle" class="svg-muted" font-size="12">standard NTP gaayab</text>
<line x1="210" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="390" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Jo host check mode mein changed bataye woh drift ho chuka hai.</p></div>

<h3>Date wale backups</h3>
<p>Kisi bhi mass change se pehle devices ki abhi ki halat save karo. ios_config ka <code>backup: true</code> option running-config ko control node par file mein likhta hai. Hum folder aur date wala naam chunte hain:</p>
<pre class="code"><span class="c"># backup.yml</span>
---
- name: Back up the running configs
  hosts: all
  gather_facts: false
  tasks:
    - name: Backup
      cisco.ios.ios_config:
        backup: true
        backup_options:
          dir_path: /home/netadmin/backups
          filename: "{{ inventory_hostname }}_{{ now().strftime('%Y-%m-%d') }}.cfg"</pre>
<p><code>now()</code> abhi ki date aur time deta hai; <code>strftime('%Y-%m-%d')</code> use saal-mahina-din mein format karta hai. <code>backup_options</code> ke bina file playbook ke paas <code>backup/</code> folder mein timestamp wale naam se jaati hai.</p>
<pre class="out">netadmin@auto01:~$ ls ~/backups
blr-edge-r2_2026-09-29.cfg  pun-acc-sw1_2026-09-29.cfg  pun-core-r1_2026-09-29.cfg</pre>
<p>Har device aur din ki ek file. Unhe Git ya protected share mein rakho: configs mein secrets hote hain jaise hashed passwords aur SNMP strings.</p>

<h3>Kuch badle bina drift dhoondhna</h3>
<p><code>baseline.yml</code> mein teeno devices ki standard lines hain. Ise check mode aur diff ke saath chalao:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook baseline.yml --check --diff
TASK [Standard NTP and syslog] ************************************************
ok: [pun-core-r1]
--- before: running-config
+++ after: running-config
@@ -51,4 +51,5 @@
  login local
  transport input ssh
 !
<span class="hl">+ntp server 10.99.0.60</span>
 end
<span class="hl">changed: [blr-edge-r2]</span>
ok: [pun-acc-sw1]

PLAY RECAP ********************************************************************
pun-core-r1                : ok=1    changed=0 ...
<span class="hl">blr-edge-r2                : ok=1    changed=1</span> ...
pun-acc-sw1                : ok=1    changed=0 ...</pre>
<p>Do devices ok kehte hain. <code>blr-edge-r2</code> changed kehta hai: usme standard NTP server nahi hai. Uska backup padhne par wajah dikhti hai: woh abhi bhi purane server <code>10.99.0.99</code> ko point karta hai.</p>

<h3>"no" commands ka jaal</h3>
<p>Seedha fix hai <code>lines: [no ntp server 10.99.0.99]</code> wala task. Mat karo. "no" line running-config mein kabhi nahi dikhti, isliye ios_config use hamesha gaayab maanta hai, har run mein bhejta hai, aur har baar <b>changed</b> batata hai. Aapki drift report bekaar ho jaati hai kyunki woh hamesha changes dikhati hai. <b>Dhyan:</b> lab simulator yeh khaas jaal reproduce nahi karta (uska doosra run ok batata hai); asli IOS devices par asli module ke saath yeh hota hai. Neeche ka pattern dono jagah surakshit hai. Sahi pattern hai <b>pehle padho, sirf wahi hatao jo hai</b>:</p>
<pre class="code">    - name: Read the NTP servers
      cisco.ios.ios_command:
        commands: show running-config | include ^ntp server
      register: ntp_now

    - name: Remove NTP servers that are not standard
      cisco.ios.ios_config:
        lines:
          - "no ntp server {{ item }}"
        save_when: modified
      loop: "{{ ntp_now.stdout[0] | regex_findall('ntp server ([0-9.]+)') | difference(['10.99.0.60']) }}"</pre>
<p>Step by step: <code>ios_command</code> show command chalata hai aur <code>register</code> uska jawab variable mein rakhta hai. <code>ntp_now.stdout[0]</code> pehle command ka text hai. <code>regex_findall</code> "ntp server" ke baad aane wala har IP address nikalta hai. <code>difference</code> standard wala hata deta hai, sirf extras bachte hain. <code>loop</code> har extra ke liye removal chalata hai. Chalao, phir dobara chalao:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook baseline.yml
TASK [Remove NTP servers that are not standard] *******************************
skipping: [pun-core-r1]
<span class="hl">changed: [blr-edge-r2] =&gt; (item=10.99.0.99)</span>
skipping: [pun-acc-sw1]

netadmin@auto01:~/netauto$ ansible-playbook baseline.yml
TASK [Remove NTP servers that are not standard] *******************************
<span class="hl">skipping: [pun-core-r1]
skipping: [blr-edge-r2]
skipping: [pun-acc-sw1]</span></pre>
<p>Doosre run mein loop list khaali hai, isliye har host skip hota hai aur kuch nahi badalta. Playbook phir se idempotent hai, aur <code>blr-edge-r2</code> ke naye backup mein ab theek ek <code>ntp server</code> line hai.</p>

<h3>Template playbooks ke liye troubleshooting workflow</h3>
<ol>
<li><b>Fail hone wali line padho.</b> Woh task aur host batati hai. Render task fail hua ya push task?</li>
<li><b>Message ko classify karo</b> neeche ki table se.</li>
<li><b>Chhota reproduce karo:</b> ek host par <code>--limit</code> lagao aur sirf render karo; <code>configs/</code> ki file padho.</li>
<li><b>Data dekho:</b> <code>ansible-inventory --host NAME</code> woh variables dikhata hai jo template sach mein dekhta hai.</li>
<li><b>Preview:</b> asli run se pehle <code>--check --diff</code>.</li>
<li><b>Verify</b> device par aur doosre run se jo no change batae.</li>
</ol>
<table class="cmp"><tr><th>Run ka message</th><th>Matlab aur fix</th></tr>
<tr><td><code>AnsibleUndefinedVariable: 'site_code' is undefined</code></td><td>Is host ke liye variable missing hai. Define karo, spelling theek karo, ya fallback surakshit ho to default() use karo.</td></tr>
<tr><td><code>Unexpected end of template. Jinja was looking for the following tags: 'endfor' or 'else'</code></td><td>Block band nahi kiya. endfor ya endif jodo. Dhyan: <code>--syntax-check</code> ise nahi pakadta; sirf rendering pakadti hai.</td></tr>
<tr><td><code>Connection type network_cli is not valid for this module</code></td><td>File module router par chala. <code>delegate_to: localhost</code> jodo.</td></tr>
<tr><td><code>Destination directory ... does not exist</code></td><td>Pehle file module se folder banao.</td></tr>
<tr><td><code>Could not find or access 'basee.j2'</code></td><td>Template ka naam galat; message dhoondhe gaye folders ki list deta hai.</td></tr>
<tr><td><code>sending configuration line '...' failed: % Invalid input detected</code></td><td>Router ne rendered line reject ki (galat syntax ya data mein typo). Us line ke liye rendered file padho.</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> <code>no ...</code> lines ko seedha lines mein daalna (hamesha changed); aise task ki drift report par bharosa karna jo kabhi idempotent nahi; backups ko bina access control rakhna; same-day backup ke bina mass changes chalana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Standard playbook par check mode <i>hi</i> drift report hai: changed ka matlab host standard se alag hai. Yeh kuch theek nahi karta.</p></div>

<div class="scn"><h4>Bengaluru router jisne purana NTP server rakha</h4><p>Auditors ne dekha ki ek router decommissioned server se time sync kar raha hai. Nightly check run ne use hafton tak changed dikhaya, lekin kisi ne report nahi padhi. Read-then-remove tasks aur har run se pehle backup jodne ke baad, ek run ne theek kiya, doosre run ne zero changes dikhaye, aur backup ne ek hi standard server sabit kiya.</p><p><b>Lesson:</b> drift reports tabhi kaam aati hain jab koi unhe padhe, aur fixes idempotent hone chahiye taaki report saaf rahe.</p></div>

<div class="iv"><p class="q">"Ansible se configuration drift kaise detect karoge?"</p><p>Standard ko playbook ya template mein rakho, use schedule par --check --diff ke saath chalao, aur jo host changed bataye use drifted maano. Saboot ke liye date wale backups lo. Yeh batao ki removal tasks ko pehle device padhna chahiye kyunki "no" lines running-config mein kabhi nahi hoti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>backup_options ke saath backup: true control node par date wale configs save karta hai.</li>
<li>Apne standard par --check --diff drift report hai.</li>
<li>no lines seedha ios_config lines mein mat daalo; padho, filter karo, loop karo.</li>
<li>Khaali loop list ka matlab skipped tasks aur saaf doosra run.</li>
<li>Troubleshoot order mein: message, chhota render, variables, preview, verify.</li>
</ul></div>
`}};export{e as default};