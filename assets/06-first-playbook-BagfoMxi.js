var e={id:`first-playbook`,h:{en:`YAML and your first playbook, line by line`,hi:`YAML aur aapka pehla playbook, line by line`},body:{en:`
<p>Ad-hoc commands are conversations. A <b>playbook</b> is a written plan. It is a text file that says "on these devices, do these things", and because it is a file you can read it, review it, store it in Git and run it again next month. Playbooks are written in <b>YAML</b>, a format designed to be easy for people to read. If you can read a shopping list with sub-items, you can read YAML.</p>

<h3>YAML in five rules</h3>
<ol>
<li><b>Key and value.</b> <code>hosts: all</code> is a key (<code>hosts</code>), a colon, a space, and a value (<code>all</code>). The space after the colon is required.</li>
<li><b>Indentation means structure.</b> Lines indented under a key belong to that key. Use <b>spaces only, never tabs</b>, and keep the same number of spaces for items at the same level (two is the convention).</li>
<li><b>Lists use a dash.</b> Each item starts with <code>- </code> (dash and space). A list under <code>lines:</code> holds the configuration lines.</li>
<li><b>Comments start with #.</b> Ansible ignores everything after it on that line.</li>
<li><b>Three dashes</b> <code>---</code> at the top mark the start of the document. Optional, but a good habit.</li>
</ol>

<h3>Your first playbook</h3>
<p>Our goal: every device uses <code>10.99.0.60</code> (the control node) as NTP and syslog server. Create <code>ntp.yml</code> in <code>~/netauto</code>:</p>
<pre class="code">AUTO01$ cat &gt; ntp.yml &lt;&lt;'EOF'
---
- name: NTP and syslog baseline
  hosts: all
  gather_facts: false
  tasks:
    - name: NTP server
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.60

    - name: Syslog server
      cisco.ios.ios_config:
        lines:
          - logging host 10.99.0.60
          - logging trap informational
EOF</pre>

<h3>Reading it line by line</h3>
<table class="cmp"><tr><th>Line</th><th>What it means</th></tr>
<tr><td><code>---</code></td><td>Start of the YAML document.</td></tr>
<tr><td><code>- name: NTP and syslog baseline</code></td><td>The dash starts one <b>play</b>. <code>name</code> is a human label printed when the play runs.</td></tr>
<tr><td><code>hosts: all</code></td><td>Which inventory hosts or groups this play targets. Try <code>routers</code> to touch only routers.</td></tr>
<tr><td><code>gather_facts: false</code></td><td>Ansible normally collects facts about a Linux host first using Python on that host. Network devices cannot do that, so we turn it off. (To collect device facts, use the <code>ios_facts</code> module as a task.)</td></tr>
<tr><td><code>tasks:</code></td><td>The list of jobs, run top to bottom, on every host, before moving to the next task.</td></tr>
<tr><td><code>- name: NTP server</code></td><td>One <b>task</b>. A descriptive name is shown in the output, so write names you will understand at 2 AM.</td></tr>
<tr><td><code>cisco.ios.ios_config:</code></td><td>The <b>module</b> the task calls. Everything indented below it is the module's <b>arguments</b>.</td></tr>
<tr><td><code>lines:</code></td><td>An argument that takes a list of configuration lines.</td></tr>
<tr><td><code>- ntp server 10.99.0.60</code></td><td>One configuration line, typed in global configuration mode exactly as you would on the router.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Playbook structure: play contains tasks, tasks call modules">
<rect x="10" y="10" width="620" height="240" rx="12" fill="#e2e8f0"/><text x="30" y="34" class="svg-ink" font-size="14">Playbook file: ntp.yml</text>
<rect x="30" y="48" width="580" height="190" rx="10" fill="#fde68a"/><text x="48" y="70" class="svg-ink" font-size="13">Play: hosts: all, gather_facts: false</text>
<rect x="50" y="82" width="260" height="140" rx="8" fill="#bbf7d0"/><text x="65" y="104" class="svg-ink" font-size="13">Task 1: NTP server</text><rect x="65" y="116" width="230" height="46" rx="6" fill="#bae6fd"/><text x="180" y="136" text-anchor="middle" class="svg-ink" font-size="12">module cisco.ios.ios_config</text><text x="180" y="153" text-anchor="middle" class="svg-muted" font-size="12">lines: ntp server ...</text>
<rect x="330" y="82" width="260" height="140" rx="8" fill="#bbf7d0"/><text x="345" y="104" class="svg-ink" font-size="13">Task 2: Syslog server</text><rect x="345" y="116" width="230" height="46" rx="6" fill="#bae6fd"/><text x="460" y="136" text-anchor="middle" class="svg-ink" font-size="12">module cisco.ios.ios_config</text><text x="460" y="153" text-anchor="middle" class="svg-muted" font-size="12">lines: logging host ...</text>
<text x="180" y="196" text-anchor="middle" class="svg-muted" font-size="12">runs on R1, R2, SW1</text><text x="460" y="196" text-anchor="middle" class="svg-muted" font-size="12">then on R1, R2, SW1</text>
</svg><p class="cap">A playbook holds plays; a play targets hosts and lists tasks; each task calls one module with arguments.</p></div>

<h3>Check the file before you trust it</h3>
<p>Three read-only commands tell you what Ansible understood, without touching a device.</p>
<pre class="out">AUTO01$ ansible-playbook ntp.yml --syntax-check

playbook: ntp.yml

AUTO01$ ansible-playbook ntp.yml --list-tasks

playbook: ntp.yml

  play #1 (all): NTP and syslog baseline	TAGS: []
    tasks:
      NTP server	TAGS: []
      Syslog server	TAGS: []

AUTO01$ ansible-playbook ntp.yml --list-hosts

playbook: ntp.yml

  play #1 (all): NTP and syslog baseline	TAGS: []
    pattern: ['all']
    <span class="hl">hosts (3):</span>
      pun-core-r1
      blr-edge-r2
      pun-acc-sw1</pre>
<p><code>--syntax-check</code> only proves that the YAML and the structure are valid; it prints the playbook name when all is well. <code>--list-tasks</code> shows the plan, and <code>--list-hosts</code> shows exactly which devices would be touched. Get into the habit of reading <code>--list-hosts</code> before every real run; it would have stopped many outages.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Wrong indentation. If <code>lines:</code> is aligned with the module name instead of indented below it, Ansible reads it as a separate key of the task and the playbook fails. Another classic: forgetting that <code>- </code> needs a space, or writing <code>hosts all</code> without the colon. The troubleshooting chapter shows the exact error text for these.</p></div>
<div class="exam"><p><b>Exam trap.</b> A playbook is a <b>list of plays</b> (the top-level dash), each play has <code>hosts</code> and <code>tasks</code>, and tasks run in order on all hosts before the next task starts (the default "linear" strategy). Also note YAML forbids tab characters for indentation.</p></div>

<div class="scn"><h4>The playbook that touched everything</h4><p>A junior wrote a playbook meant for the Pune site and left <code>hosts: all</code> in it. Before the first run, a reviewer asked him to attach the output of <code>--list-hosts</code> to the change ticket. It listed 41 hosts including the Bengaluru edge. He changed the play to target the <code>pune</code> group, the list shrank to 12 and the change went ahead without surprises.</p><p><b>Lesson:</b> <code>hosts:</code> is the blast radius. Check it with <code>--list-hosts</code>.</p></div>

<div class="iv"><p class="q">"Explain the structure of an Ansible playbook."</p><p>A playbook is a YAML list of plays. A play has a name, a <code>hosts</code> target and a list of <code>tasks</code>. Each task calls one module with arguments, for example <code>cisco.ios.ios_config</code> with <code>lines</code>. Tasks run in order on all targeted hosts. I also say that I validate with <code>--syntax-check</code> and confirm the target with <code>--list-hosts</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YAML: <code>key: value</code>, indentation with spaces, <code>- </code> for lists, <code>#</code> for comments.</li>
<li>Play = <code>hosts</code> + <code>tasks</code>; task = one module + its arguments.</li>
<li>Set <code>gather_facts: false</code> for network devices; use <code>ios_facts</code> when you need facts.</li>
<li><code>ios_config</code> with <code>lines</code> sends configuration lines exactly as typed on the CLI.</li>
<li><code>--syntax-check</code>, <code>--list-tasks</code>, <code>--list-hosts</code> inspect a playbook safely.</li>
</ul></div>
`,hi:`
<p>Ad-hoc commands baatcheet hain. <b>Playbook</b> likhi hui plan hai. Yeh ek text file hai jo kehti hai "in devices par yeh kaam karo", aur kyunki yeh file hai aap ise padh sakte ho, review kar sakte ho, Git mein rakh sakte ho aur agle mahine dobara chala sakte ho. Playbooks <b>YAML</b> mein likhe jaate hain, jo logon ke liye padhna aasaan banane ke liye design hua format hai. Agar aap sub-items wali shopping list padh sakte ho, to YAML padh sakte ho.</p>

<h3>YAML paanch rules mein</h3>
<ol>
<li><b>Key aur value.</b> <code>hosts: all</code> mein key (<code>hosts</code>), colon, space aur value (<code>all</code>) hai. Colon ke baad space zaroori hai.</li>
<li><b>Indentation matlab structure.</b> Key ke neeche indent ki hui lines us key ki hoti hain. <b>Sirf spaces, tabs kabhi nahi</b>, aur same level ke items ke liye same number of spaces (do convention hai).</li>
<li><b>Lists mein dash.</b> Har item <code>- </code> (dash aur space) se shuru hota hai. <code>lines:</code> ke neeche ki list mein configuration lines hoti hain.</li>
<li><b>Comments # se shuru.</b> Ansible us line par uske baad sab ignore karta hai.</li>
<li><b>Teen dashes</b> <code>---</code> upar document ki shuruaat batate hain. Optional, par achhi aadat.</li>
</ol>

<h3>Aapka pehla playbook</h3>
<p>Lakshya: har device <code>10.99.0.60</code> (control node) ko NTP aur syslog server ki tarah use kare. <code>~/netauto</code> mein <code>ntp.yml</code> banao:</p>
<pre class="code">AUTO01$ cat &gt; ntp.yml &lt;&lt;'EOF'
---
- name: NTP and syslog baseline
  hosts: all
  gather_facts: false
  tasks:
    - name: NTP server
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.60

    - name: Syslog server
      cisco.ios.ios_config:
        lines:
          - logging host 10.99.0.60
          - logging trap informational
EOF</pre>

<h3>Line by line padhna</h3>
<table class="cmp"><tr><th>Line</th><th>Matlab</th></tr>
<tr><td><code>---</code></td><td>YAML document ki shuruaat.</td></tr>
<tr><td><code>- name: NTP and syslog baseline</code></td><td>Dash ek <b>play</b> shuru karta hai. <code>name</code> insaani label hai jo play chalte waqt print hota hai.</td></tr>
<tr><td><code>hosts: all</code></td><td>Yeh play inventory ke kaunse hosts ya groups ko target karta hai. Sirf routers ke liye <code>routers</code> try karo.</td></tr>
<tr><td><code>gather_facts: false</code></td><td>Ansible normally pehle Linux host ke facts us host ke Python se jama karta hai. Network devices yeh nahi kar sakte, isliye hum ise band karte hain. (Device facts ke liye <code>ios_facts</code> module ko task ki tarah use karo.)</td></tr>
<tr><td><code>tasks:</code></td><td>Kaamon ki list, upar se neeche, har host par, agle task se pehle.</td></tr>
<tr><td><code>- name: NTP server</code></td><td>Ek <b>task</b>. Descriptive naam output mein dikhta hai, isliye aise naam likho jo raat 2 baje bhi samajh aayein.</td></tr>
<tr><td><code>cisco.ios.ios_config:</code></td><td>Task jo <b>module</b> bulata hai. Iske neeche indent ki hui har cheez module ke <b>arguments</b> hain.</td></tr>
<tr><td><code>lines:</code></td><td>Argument jo configuration lines ki list leta hai.</td></tr>
<tr><td><code>- ntp server 10.99.0.60</code></td><td>Ek configuration line, global configuration mode mein bilkul waise type ki hui jaise router par karte.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Playbook structure: play mein tasks, tasks modules bulate hain">
<rect x="10" y="10" width="620" height="240" rx="12" fill="#e2e8f0"/><text x="30" y="34" class="svg-ink" font-size="14">Playbook file: ntp.yml</text>
<rect x="30" y="48" width="580" height="190" rx="10" fill="#fde68a"/><text x="48" y="70" class="svg-ink" font-size="13">Play: hosts: all, gather_facts: false</text>
<rect x="50" y="82" width="260" height="140" rx="8" fill="#bbf7d0"/><text x="65" y="104" class="svg-ink" font-size="13">Task 1: NTP server</text><rect x="65" y="116" width="230" height="46" rx="6" fill="#bae6fd"/><text x="180" y="136" text-anchor="middle" class="svg-ink" font-size="12">module cisco.ios.ios_config</text><text x="180" y="153" text-anchor="middle" class="svg-muted" font-size="12">lines: ntp server ...</text>
<rect x="330" y="82" width="260" height="140" rx="8" fill="#bbf7d0"/><text x="345" y="104" class="svg-ink" font-size="13">Task 2: Syslog server</text><rect x="345" y="116" width="230" height="46" rx="6" fill="#bae6fd"/><text x="460" y="136" text-anchor="middle" class="svg-ink" font-size="12">module cisco.ios.ios_config</text><text x="460" y="153" text-anchor="middle" class="svg-muted" font-size="12">lines: logging host ...</text>
<text x="180" y="196" text-anchor="middle" class="svg-muted" font-size="12">R1, R2, SW1 par chalta hai</text><text x="460" y="196" text-anchor="middle" class="svg-muted" font-size="12">phir R1, R2, SW1 par</text>
</svg><p class="cap">Playbook mein plays hote hain; play hosts ko target karta hai aur tasks list karta hai; har task arguments ke saath ek module bulata hai.</p></div>

<h3>File par bharosa karne se pehle check karo</h3>
<p>Teen read-only commands batate hain ki Ansible ne kya samjha, bina kisi device ko chhue.</p>
<pre class="out">AUTO01$ ansible-playbook ntp.yml --syntax-check

playbook: ntp.yml

AUTO01$ ansible-playbook ntp.yml --list-tasks

playbook: ntp.yml

  play #1 (all): NTP and syslog baseline	TAGS: []
    tasks:
      NTP server	TAGS: []
      Syslog server	TAGS: []

AUTO01$ ansible-playbook ntp.yml --list-hosts

playbook: ntp.yml

  play #1 (all): NTP and syslog baseline	TAGS: []
    pattern: ['all']
    <span class="hl">hosts (3):</span>
      pun-core-r1
      blr-edge-r2
      pun-acc-sw1</pre>
<p><code>--syntax-check</code> sirf sabit karta hai ki YAML aur structure valid hain; sab theek ho to playbook ka naam print karta hai. <code>--list-tasks</code> plan dikhata hai, aur <code>--list-hosts</code> bilkul dikhata hai ki kaunse devices chhue jaayenge. Har asli run se pehle <code>--list-hosts</code> padhne ki aadat daalo; isne bahut outages roke hote.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Galat indentation. Agar <code>lines:</code> module name ke neeche indent hone ki jagah usi ke barabar hai, to Ansible ise task ki alag key samajhta hai aur playbook fail hota hai. Ek aur classic: yaad na rakhna ki <code>- </code> ko space chahiye, ya <code>hosts all</code> bina colon ke likhna. Troubleshooting chapter in dono ka exact error text dikhata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Playbook <b>plays ki list</b> hai (sabse upar ka dash), har play mein <code>hosts</code> aur <code>tasks</code> hote hain, aur tasks order mein sab hosts par chalte hain tab agla task shuru hota hai (default "linear" strategy). YAML indentation mein tab characters mana hain.</p></div>

<div class="scn"><h4>Jis playbook ne sab kuch chhu liya</h4><p>Ek junior ne Pune site ke liye playbook likha aur usme <code>hosts: all</code> chhod diya. Pehle run se pehle reviewer ne usse change ticket mein <code>--list-hosts</code> ka output lagane ko kaha. Usme ikatalis hosts the, Bengaluru edge bhi. Usne play ko <code>pune</code> group par kiya, list barah ki ho gayi aur change bina surprise ke chala.</p><p><b>Lesson:</b> <code>hosts:</code> hi blast radius hai. Ise <code>--list-hosts</code> se check karo.</p></div>

<div class="iv"><p class="q">"Ansible playbook ka structure samjhao."</p><p>Playbook plays ki YAML list hai. Play mein naam, <code>hosts</code> target aur <code>tasks</code> ki list hoti hai. Har task ek module ko arguments ke saath bulata hai, jaise <code>cisco.ios.ios_config</code> aur <code>lines</code>. Tasks order mein sab targeted hosts par chalte hain. Main yeh bhi kehta hoon ki <code>--syntax-check</code> se validate karta hoon aur <code>--list-hosts</code> se target confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YAML: <code>key: value</code>, spaces se indentation, lists ke liye <code>- </code>, comments ke liye <code>#</code>.</li>
<li>Play = <code>hosts</code> + <code>tasks</code>; task = ek module + uske arguments.</li>
<li>Network devices ke liye <code>gather_facts: false</code>; facts chahiye to <code>ios_facts</code>.</li>
<li><code>ios_config</code> ka <code>lines</code> configuration lines ko bilkul CLI jaisa bhejta hai.</li>
<li><code>--syntax-check</code>, <code>--list-tasks</code>, <code>--list-hosts</code> playbook ko safely inspect karte hain.</li>
</ul></div>
`}};export{e as default};