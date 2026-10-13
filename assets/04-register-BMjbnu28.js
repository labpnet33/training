var e={id:`register`,h:{en:`register: keep what the device said and use it`,hi:`register: device ne jo kaha use rakho aur kaam mein lo`},body:{en:`
<p>So far Ansible has acted without listening. A network engineer does the opposite all day: type <code>show ip interface brief</code>, read the answer, decide. The keyword <b>register</b> gives a playbook the same ability. It saves the full result of a task into a variable of your choice, and later tasks can read it in a <code>when</code>, a message or an assert.</p>

<h3>Capture a show command</h3>
<pre class="code">---
- name: Register
  hosts: pun-core-r1
  gather_facts: false
  tasks:
    - name: Read the interfaces
      cisco.ios.ios_command:
        commands: show ip interface brief
      register: ifaces

    - name: Whole result
      ansible.builtin.debug:
        var: ifaces</pre>
<ul>
<li><code>cisco.ios.ios_command</code> sends show commands and returns the text. It never changes the configuration.</li>
<li><code>commands:</code> is the command to send.</li>
<li><code>register: ifaces</code> stores the entire result under the name <code>ifaces</code>. You choose the name; keep it short and meaningful.</li>
<li>The debug task with <code>var: ifaces</code> prints the variable so you can see what it contains. This is the standard first step whenever you register something new.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook reg1.yml
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
TASK [Whole result] ***********************************************************
ok: [pun-core-r1] => {
    "ifaces": {
        "changed": false,
        "stdout": [
            "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1       YES manual up                    up\\nGigabitEthernet0/1     10.255.0.1      YES manual up                    up\\nGigabitEthernet0/2     unassigned      YES unset  administratively down down\\nGigabitEthernet0/3     unassigned      YES unset  administratively down down"
        ],
        "stdout_lines": [
            [
                "Interface              IP-Address      OK? Method Status                Protocol",
                "GigabitEthernet0/0     10.99.0.1       YES manual up                    up",
                "GigabitEthernet0/1     10.255.0.1      YES manual up                    up",
                "GigabitEthernet0/2     unassigned      YES unset  administratively down down",
                "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
            ]
        ]
    }
}</pre>
<p>(Only these two tasks of the run are shown; the PLAY header and recap are left out.) The result is a dictionary with useful keys:</p>
<table class="cmp"><tr><th>Key</th><th>Meaning</th></tr>
<tr><td><code>changed</code></td><td>Did the task change anything (false for show commands)</td></tr>
<tr><td><code>stdout</code></td><td>A list with one long text per command sent</td></tr>
<tr><td><code>stdout_lines</code></td><td>The same, with each output split into lines</td></tr></table>
<p>Because you sent one command, the output is element number 0: <code>ifaces.stdout[0]</code> is the text and <code>ifaces.stdout_lines[0]</code> is the list of lines. Programmers count from zero; Ansible does too.</p>

<h3>Make a decision from the output</h3>
<p>Use the <code>search</code> test inside a <code>when</code> to look for a pattern in the text. The regular expression below uses <code>[.]</code> to mean a literal dot:</p>
<pre class="code">    - name: Is Gi0/0 up
      ansible.builtin.debug:
        msg: "Gi0/0 is up and up"
      when: ifaces.stdout[0] is search('GigabitEthernet0/0 +10[.]99[.]0[.]1 +YES manual up +up')

    - name: Is Gi0/2 up
      ansible.builtin.debug:
        msg: "Gi0/2 is up"
      when: ifaces.stdout[0] is search('GigabitEthernet0/2 +unassigned +YES unset +up')</pre>
<p>Each pattern spells out one table row: the interface name, spaces (<code> +</code> means "one or more spaces"), the address, and the status words. The second pattern looks for Gi0/2 being <i>up</i>.</p>
<pre class="out">AUTO01$ ansible-playbook reg1.yml
PLAY [Register] ***************************************************************
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
TASK [Is Gi0/0 up] ************************************************************
ok: [pun-core-r1] => {
    "msg": "Gi0/0 is up and up"
}
TASK [Is Gi0/2 up] ************************************************************
skipping: [pun-core-r1]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   </pre>
<p>Gi0/0 matched, so its message ran. Gi0/2 is administratively down in this lab, so its pattern found nothing and the task was skipped.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="register stores a result for later tasks">
<rect x="20" y="60" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="13">ios_command</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="11">show ip interface brief</text>
<rect x="235" y="60" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">variable ifaces</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="11">changed, stdout, lines</text>
<rect x="450" y="60" width="170" height="80" rx="10" fill="#bae6fd"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="13">later tasks</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="11">when, assert, debug</text>
<line x1="190" y1="100" x2="235" y2="100" stroke="#64748b" stroke-width="2"/><line x1="405" y1="100" x2="450" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">register turns a command's answer into data the playbook can reason about.</p></div>

<h3>React to whether a change happened</h3>
<p>Registering a configuration task tells you if it changed anything and which commands it sent:</p>
<pre class="code">    - name: Config task result
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.60
      register: ntp_task

    - name: React to a change
      ansible.builtin.debug:
        msg: "NTP changed={{ ntp_task.changed }}, commands sent: {{ ntp_task.commands }}"</pre>
<pre class="out">AUTO01$ ansible-playbook reg1.yml
TASK [Config task result] *****************************************************
changed: [pun-core-r1]
TASK [React to a change] ******************************************************
ok: [pun-core-r1] => {
    "msg": "NTP changed=True, commands sent: ['ntp server 10.99.0.60']"
}
AUTO01$ ansible-playbook reg1.yml
TASK [Config task result] *****************************************************
ok: [pun-core-r1]
TASK [React to a change] ******************************************************
ok: [pun-core-r1] => {
    "msg": "NTP changed=False, commands sent: []"
}</pre>
<p>(Each run is shortened to these two tasks.) On the first run the router did not have the line, so the result says <code>changed=True</code> and lists the command. On the second run nothing was needed: <code>changed=False</code> and an empty list. This is idempotency made visible.</p>

<h3>Register inside a loop</h3>
<p>When the task has a loop, the registered variable has a list called <code>results</code>, with one entry per item. Each entry also remembers its <code>item</code>:</p>
<pre class="out">AUTO01$ ansible-playbook reg2.yml
PLAY [Register in a loop] *****************************************************
TASK [Two show commands] ******************************************************
ok: [pun-core-r1] => (item=show clock)
ok: [pun-core-r1] => (item=show ip interface brief)
TASK [How many results] *******************************************************
ok: [pun-core-r1] => {
    "msg": "2 results; first command was show clock"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The message used <code>shows.results | length</code> to count entries and <code>shows.results[0].item</code> to read which command was first.</p>

<h3>A typo gives a silent trap</h3>
<p>Here the task registered <code>clock_out</code> but the debug asked for <code>clok_out</code>:</p>
<pre class="out">AUTO01$ ansible-playbook reg3.yml
PLAY [Register typo] **********************************************************
TASK [Read] *******************************************************************
ok: [pun-core-r1]
TASK [Use] ********************************************************************
ok: [pun-core-r1] => {
    "clok_out.stdout": "VARIABLE IS NOT DEFINED!"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The debug module with <code>var:</code> does not fail on an undefined name; it prints a loud message instead. The task is green, which makes this easy to miss. Always read what debug prints.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Registering one name in a task and reading a different spelling later. The playbook may not fail, but every decision based on it is wrong. Debug the registered variable first, and copy the name rather than retyping it.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ios_command</code> returns <code>stdout</code> as a <i>list</i>, one element per command. You need <code>stdout[0]</code> for the first, not <code>stdout</code> alone.</p></div>

<div class="scn"><h4>Check before you change</h4><p>Before moving a link, an engineer registered the interface table and used <code>search</code> to confirm that the uplink was up. If the pattern did not match, the following tasks were skipped. A bad run no longer made things worse.</p></div>

<div class="iv"><p class="q">"What does register do and what does the result contain?"</p><p>It saves a task's result in a variable. For command modules the result has <code>changed</code>, <code>stdout</code> and <code>stdout_lines</code>, one entry per command. In a loop it has a <code>results</code> list. I print it with debug first, then use it in <code>when</code> or <code>assert</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>register: name</code> keeps the result of a task for later use.</li>
<li>Show command text is in <code>name.stdout[0]</code>; lines are in <code>name.stdout_lines[0]</code>.</li>
<li>Use <code>is search('regex')</code> in <code>when</code> to react to output.</li>
<li>A registered config task tells you <code>changed</code> and the commands it sent.</li>
<li>With a loop, read <code>name.results</code>.</li>
</ul></div>
`,hi:`
<p>Ab tak Ansible ne bina sune kaam kiya hai. Network engineer poora din ulta karta hai: <code>show ip interface brief</code> type karo, jawab padho, faisla lo. Keyword <b>register</b> playbook ko wahi ability deta hai. Yeh task ka poora result aapke chune hue naam ke variable mein save karta hai, aur baad ke tasks use <code>when</code>, message ya assert mein padh sakte hain.</p>

<h3>Show command capture karo</h3>
<pre class="code">---
- name: Register
  hosts: pun-core-r1
  gather_facts: false
  tasks:
    - name: Read the interfaces
      cisco.ios.ios_command:
        commands: show ip interface brief
      register: ifaces

    - name: Whole result
      ansible.builtin.debug:
        var: ifaces</pre>
<ul>
<li><code>cisco.ios.ios_command</code> show commands bhejta hai aur text return karta hai. Yeh configuration kabhi nahi badalta.</li>
<li><code>commands:</code> bhejne wala command hai.</li>
<li><code>register: ifaces</code> poora result <code>ifaces</code> naam se store karta hai. Naam aap chunte ho; chhota aur meaningful rakho.</li>
<li><code>var: ifaces</code> wala debug task variable print karta hai taaki aap dekh sako usme kya hai. Kuch naya register karte hi yeh standard pehla step hai.</li>
</ul>
<pre class="out">AUTO01$ ansible-playbook reg1.yml
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
TASK [Whole result] ***********************************************************
ok: [pun-core-r1] => {
    "ifaces": {
        "changed": false,
        "stdout": [
            "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1       YES manual up                    up\\nGigabitEthernet0/1     10.255.0.1      YES manual up                    up\\nGigabitEthernet0/2     unassigned      YES unset  administratively down down\\nGigabitEthernet0/3     unassigned      YES unset  administratively down down"
        ],
        "stdout_lines": [
            [
                "Interface              IP-Address      OK? Method Status                Protocol",
                "GigabitEthernet0/0     10.99.0.1       YES manual up                    up",
                "GigabitEthernet0/1     10.255.0.1      YES manual up                    up",
                "GigabitEthernet0/2     unassigned      YES unset  administratively down down",
                "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
            ]
        ]
    }
}</pre>
<p>(Run ke sirf yeh do tasks dikhaye hain; PLAY header aur recap hata diye gaye.) Result ek dictionary hai jisme kaam ki keys hain:</p>
<table class="cmp"><tr><th>Key</th><th>Matlab</th></tr>
<tr><td><code>changed</code></td><td>Task ne kuch badla ya nahi (show commands ke liye false)</td></tr>
<tr><td><code>stdout</code></td><td>Bheje gaye har command ke liye ek lamba text wali list</td></tr>
<tr><td><code>stdout_lines</code></td><td>Wahi, har output lines mein split</td></tr></table>
<p>Kyunki aapne ek command bheja, output element number 0 hai: <code>ifaces.stdout[0]</code> text hai aur <code>ifaces.stdout_lines[0]</code> lines ki list. Programmers zero se ginte hain; Ansible bhi.</p>

<h3>Output se faisla lo</h3>
<p>Text mein pattern dhoondhne ke liye <code>when</code> ke andar <code>search</code> test use karo. Neeche ka regular expression <code>[.]</code> ka matlab literal dot lete hain:</p>
<pre class="code">    - name: Is Gi0/0 up
      ansible.builtin.debug:
        msg: "Gi0/0 is up and up"
      when: ifaces.stdout[0] is search('GigabitEthernet0/0 +10[.]99[.]0[.]1 +YES manual up +up')

    - name: Is Gi0/2 up
      ansible.builtin.debug:
        msg: "Gi0/2 is up"
      when: ifaces.stdout[0] is search('GigabitEthernet0/2 +unassigned +YES unset +up')</pre>
<p>Har pattern table ki ek row likhta hai: interface ka naam, spaces (<code> +</code> ka matlab "ek ya zyada spaces"), address, aur status shabd. Doosra pattern Gi0/2 ke <i>up</i> hone ko dhoondhta hai.</p>
<pre class="out">AUTO01$ ansible-playbook reg1.yml
PLAY [Register] ***************************************************************
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
TASK [Is Gi0/0 up] ************************************************************
ok: [pun-core-r1] => {
    "msg": "Gi0/0 is up and up"
}
TASK [Is Gi0/2 up] ************************************************************
skipping: [pun-core-r1]
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   </pre>
<p>Gi0/0 match hua, isliye uska message chala. Is lab mein Gi0/2 administratively down hai, isliye uska pattern kuch nahi mila aur task skip hua.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="register result ko baad ke tasks ke liye store karta hai">
<rect x="20" y="60" width="170" height="80" rx="10" fill="#fde68a"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="13">ios_command</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="11">show ip interface brief</text>
<rect x="235" y="60" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">variable ifaces</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="11">changed, stdout, lines</text>
<rect x="450" y="60" width="170" height="80" rx="10" fill="#bae6fd"/><text x="535" y="90" text-anchor="middle" class="svg-ink" font-size="13">baad ke tasks</text><text x="535" y="112" text-anchor="middle" class="svg-muted" font-size="11">when, assert, debug</text>
<line x1="190" y1="100" x2="235" y2="100" stroke="#64748b" stroke-width="2"/><line x1="405" y1="100" x2="450" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">register command ke jawab ko aisa data banata hai jis par playbook soch sake.</p></div>

<h3>Dekho change hua ya nahi</h3>
<p>Configuration task ko register karne se pata chalta hai ki usne kuch badla ya nahi aur kaunse commands bheje:</p>
<pre class="code">    - name: Config task result
      cisco.ios.ios_config:
        lines:
          - ntp server 10.99.0.60
      register: ntp_task

    - name: React to a change
      ansible.builtin.debug:
        msg: "NTP changed={{ ntp_task.changed }}, commands sent: {{ ntp_task.commands }}"</pre>
<pre class="out">AUTO01$ ansible-playbook reg1.yml
TASK [Config task result] *****************************************************
changed: [pun-core-r1]
TASK [React to a change] ******************************************************
ok: [pun-core-r1] => {
    "msg": "NTP changed=True, commands sent: ['ntp server 10.99.0.60']"
}
AUTO01$ ansible-playbook reg1.yml
TASK [Config task result] *****************************************************
ok: [pun-core-r1]
TASK [React to a change] ******************************************************
ok: [pun-core-r1] => {
    "msg": "NTP changed=False, commands sent: []"
}</pre>
<p>(Har run in do tasks tak chhota kiya gaya hai.) Pehle run mein router ke paas line nahi thi, isliye result <code>changed=True</code> kehta hai aur command list karta hai. Doosre run mein kuch chahiye nahi tha: <code>changed=False</code> aur khaali list. Yeh idempotency ko dikhne wala banata hai.</p>

<h3>Loop ke andar register</h3>
<p>Jab task mein loop ho, registered variable mein <code>results</code> naam ki list hoti hai, har item ke liye ek entry. Har entry apna <code>item</code> bhi yaad rakhti hai:</p>
<pre class="out">AUTO01$ ansible-playbook reg2.yml
PLAY [Register in a loop] *****************************************************
TASK [Two show commands] ******************************************************
ok: [pun-core-r1] => (item=show clock)
ok: [pun-core-r1] => (item=show ip interface brief)
TASK [How many results] *******************************************************
ok: [pun-core-r1] => {
    "msg": "2 results; first command was show clock"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Message ne entries ginne ke liye <code>shows.results | length</code> aur pehla command padhne ke liye <code>shows.results[0].item</code> use kiya.</p>

<h3>Typo se chup-chaap trap</h3>
<p>Yahan task ne <code>clock_out</code> register kiya par debug ne <code>clok_out</code> maanga:</p>
<pre class="out">AUTO01$ ansible-playbook reg3.yml
PLAY [Register typo] **********************************************************
TASK [Read] *******************************************************************
ok: [pun-core-r1]
TASK [Use] ********************************************************************
ok: [pun-core-r1] => {
    "clok_out.stdout": "VARIABLE IS NOT DEFINED!"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p><code>var:</code> wala debug module undefined naam par fail nahi hota; woh zor ka message print karta hai. Task green hai, isliye ise miss karna aasaan hai. Debug jo print kare use hamesha padho.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Ek task mein ek naam register karna aur baad mein alag spelling padhna. Playbook fail na ho, par us par based har faisla galat hota hai. Pehle registered variable ko debug karo, aur naam dobara type karne ki jagah copy karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ios_command</code> <code>stdout</code> ko <i>list</i> ki tarah return karta hai, har command ke liye ek element. Pehle ke liye <code>stdout[0]</code> chahiye, sirf <code>stdout</code> nahi.</p></div>

<div class="scn"><h4>Badalne se pehle check</h4><p>Link move karne se pehle engineer ne interface table register ki aur <code>search</code> se confirm kiya ki uplink up hai. Pattern match nahi hota to aage ke tasks skip ho jaate. Kharab run ne ab halat aur kharab nahi ki.</p></div>

<div class="iv"><p class="q">"register kya karta hai aur result mein kya hota hai?"</p><p>Yeh task ka result variable mein save karta hai. Command modules ke result mein <code>changed</code>, <code>stdout</code> aur <code>stdout_lines</code> hote hain, har command ke liye ek entry. Loop mein <code>results</code> list hoti hai. Main pehle debug se print karta hoon, phir <code>when</code> ya <code>assert</code> mein use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>register: name</code> task ka result baad ke liye rakhta hai.</li>
<li>Show command ka text <code>name.stdout[0]</code> mein; lines <code>name.stdout_lines[0]</code> mein.</li>
<li>Output par react karne ke liye <code>when</code> mein <code>is search('regex')</code> use karo.</li>
<li>Registered config task <code>changed</code> aur bheje gaye commands batata hai.</li>
<li>Loop ke saath <code>name.results</code> padho.</li>
</ul></div>
`}};export{e as default};