var e={id:`check-troubleshooting`,h:{en:`Check mode, and fixing a broken pre-change playbook`,hi:`Check mode, aur kharab pre-change playbook ko theek karna`},body:{en:`
<p>Before a change window you want a rehearsal: what would this playbook do, without doing it? Ansible offers <b>check mode</b> for that. After the rehearsal, we apply everything from this module to a realistic fault: a pre-change check that is itself broken in three places.</p>

<h3>Check mode and diff</h3>
<p>Add <code>--check</code> and Ansible asks each module "would you change anything?" but does not apply. Add <code>--diff</code> and modules that can show a before-and-after comparison print it. We use the VLAN playbook plus two extra tasks: one runs a local command, one prints the variable <code>ansible_check_mode</code>.</p>
<pre class="out">AUTO01$ ansible-playbook vl.yml --check --diff
PLAY [VLAN rollout] ***********************************************************
TASK [Standard VLANs] *********************************************************
changed: [pun-acc-sw1] => (item=10 USERS)
changed: [pun-acc-sw1] => (item=20 VOICE)
changed: [pun-acc-sw1] => (item=99 MGMT)
changed: [blr-acc-sw2] => (item=10 USERS)
changed: [blr-acc-sw2] => (item=20 VOICE)
changed: [blr-acc-sw2] => (item=99 MGMT)
TASK [BPDU guard in Pune only] ************************************************
--- before: running-config
+++ after: running-config
@@ -66,4 +66,5 @@
  login local
  transport input ssh
 !
+spanning-tree portfast bpduguard default
 end
changed: [pun-acc-sw1]
skipping: [blr-acc-sw2]
TASK [Local note] *************************************************************
skipping: [pun-acc-sw1 -> localhost]
skipping: [blr-acc-sw2 -> localhost]
TASK [Is this a dry run] ******************************************************
ok: [pun-acc-sw1] => {
    "msg": "check mode is True"
}
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=3    changed=2    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   </pre>
<ul>
<li>The VLAN task reports <code>changed</code> for every item, meaning "these would be created". In this simulator no diff text is printed for the VLAN task.</li>
<li>The BPDU guard task prints a diff: lines starting with <code>+</code> would be added to the running configuration.</li>
<li>The plain <code>command</code> task is <b>skipped</b>. Ansible cannot predict what an arbitrary command does, so it does not run it in check mode.</li>
<li>The <code>ansible_check_mode</code> variable is <code>True</code>, which you can use in your own conditions.</li>
</ul>
<p>Prove that nothing was applied by looking at the switch:</p>
<pre class="out">PUN-ACC-SW1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/1, Gi0/2, Gi0/3
                                                Gi0/4, Gi0/5, Gi0/6, Gi0/7
                                                Gi1/0, Gi1/1, Gi1/2, Gi1/3
                                                Gi1/4, Gi1/5, Gi1/6, Gi1/7
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>No VLAN 10, 20 or 99. After a real run, the same check-mode command shows the end state is already reached:</p>
<pre class="out">AUTO01$ ansible-playbook vl.yml --check --diff
PLAY [VLAN rollout] ***********************************************************
TASK [Standard VLANs] *********************************************************
ok: [pun-acc-sw1] => (item=10 USERS)
ok: [pun-acc-sw1] => (item=20 VOICE)
ok: [pun-acc-sw1] => (item=99 MGMT)
ok: [blr-acc-sw2] => (item=10 USERS)
ok: [blr-acc-sw2] => (item=20 VOICE)
ok: [blr-acc-sw2] => (item=99 MGMT)
TASK [BPDU guard in Pune only] ************************************************
ok: [pun-acc-sw1]
skipping: [blr-acc-sw2]
TASK [Local note] *************************************************************
skipping: [pun-acc-sw1 -> localhost]
skipping: [blr-acc-sw2 -> localhost]
TASK [Is this a dry run] ******************************************************
ok: [pun-acc-sw1] => {
    "msg": "check mode is True"
}
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=3    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   </pre>
<p>This is your change-window opener: <code>--check --diff</code> returning <code>changed=0</code> means the network already matches the playbook.</p>

<h3>Read-only tasks that must run in check mode</h3>
<p>A read-only task, such as a show command whose output a later task needs, can be forced to run with <code>check_mode: false</code>. A later change task still obeys check mode. Run on <code>pun-acc-sw1</code> with a task that would add VLAN 77 GUEST, the playbook reports it would change, and the switch table afterwards shows the VLAN was not created:</p>
<pre class="out">AUTO01$ ansible-playbook chk.yml --check --diff
PLAY [Read-only task inside check mode] ***************************************
TASK [Read VLANs even in check mode] ******************************************
ok: [pun-acc-sw1]
TASK [Add a VLAN] *************************************************************
changed: [pun-acc-sw1]
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Rehearse with check mode then apply">
<rect x="15" y="65" width="140" height="80" rx="10" fill="#fde68a"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">--check --diff</text><text x="85" y="117" text-anchor="middle" class="svg-muted" font-size="11">rehearse</text>
<rect x="185" y="65" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="255" y="95" text-anchor="middle" class="svg-ink" font-size="13">review</text><text x="255" y="117" text-anchor="middle" class="svg-muted" font-size="11">changed, diff</text>
<rect x="355" y="65" width="140" height="80" rx="10" fill="#bae6fd"/><text x="425" y="95" text-anchor="middle" class="svg-ink" font-size="13">apply</text><text x="425" y="117" text-anchor="middle" class="svg-muted" font-size="11">real run</text>
<rect x="525" y="65" width="100" height="80" rx="10" fill="#e2e8f0"/><text x="575" y="95" text-anchor="middle" class="svg-ink" font-size="13">repeat</text><text x="575" y="117" text-anchor="middle" class="svg-muted" font-size="11">changed=0</text>
<line x1="155" y1="105" x2="185" y2="105" stroke="#64748b" stroke-width="2"/><line x1="325" y1="105" x2="355" y2="105" stroke="#64748b" stroke-width="2"/><line x1="495" y1="105" x2="525" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Rehearse, review, apply, then prove the second run is clean.</p></div>

<h3>The case: a pre-change check that does not work</h3>
<p>The team wrote <code>precheck.yml</code> to verify the WAN link between the Pune and Bengaluru routers before a migration. It reads facts, reads the interface table, asserts that the WAN link Gi0/1 is up and up, and prints the software version if it is new enough. It does not run. Start from the top.</p>
<pre class="out">AUTO01$ ansible-playbook precheck.yml
PLAY [Pre-change checks for the WAN migration] ********************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up/up] *************************************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "The conditional check 'ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')' failed. The error was: error while evaluating conditional (ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')): 'ifaces' is undefined"}
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "The conditional check 'ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')' failed. The error was: error while evaluating conditional (ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')): 'ifaces' is undefined"}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<h3>Fault 1: the registered name does not match</h3>
<p>The error says <code>'ifaces' is undefined</code>. The interface task in the file said <code>register: iface</code> (singular) while the assert used <code>ifaces</code>. This is the register typo from chapter 4, now with a failing assert instead of a silent debug. Fix the task so both use <code>ifaces</code>:</p>
<pre class="out">AUTO01$ sed -i 's/register: iface$/register: ifaces/' precheck.yml
AUTO01$ ansible-playbook precheck.yml
PLAY [Pre-change checks for the WAN migration] ********************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up/up] *************************************************
fatal: [pun-core-r1]: FAILED! => {"assertion": "ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')", "changed": false, "evaluated_to": false, "msg": "pun-core-r1: WAN link Gi0/1 is not up/up"}
fatal: [blr-edge-r2]: FAILED! => {"assertion": "ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')", "changed": false, "evaluated_to": false, "msg": "blr-edge-r2: WAN link Gi0/1 is not up/up"}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Now the check works, and it does its job: the message says the WAN link is not up/up on both routers. This failure is real, not a typo. Do not edit the assert to make it pass. Ask the devices what is wrong.</p>

<h3>Fault 2: a real network problem the check found</h3>
<pre class="out">AUTO01$ ansible routers -m cisco.ios.ios_command -a "commands='show ip interface brief'"
pun-core-r1 | SUCCESS => {
    "changed": false,
    "stdout": [
        "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1       YES manual up                    up\\nGigabitEthernet0/1     10.255.0.1      YES manual down                  down\\nGigabitEthernet0/2     unassigned      YES unset  administratively down down\\nGigabitEthernet0/3     unassigned      YES unset  administratively down down"
    ],
    "stdout_lines": [
        [
            "Interface              IP-Address      OK? Method Status                Protocol",
            "GigabitEthernet0/0     10.99.0.1       YES manual up                    up",
            "GigabitEthernet0/1     10.255.0.1      YES manual down                  down",
            "GigabitEthernet0/2     unassigned      YES unset  administratively down down",
            "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
        ]
    ]
}
blr-edge-r2 | SUCCESS => {
    "changed": false,
    "stdout": [
        "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.2       YES manual up                    up\\nGigabitEthernet0/1     10.255.0.2      YES manual administratively down down\\nGigabitEthernet0/2     unassigned      YES unset  administratively down down\\nGigabitEthernet0/3     unassigned      YES unset  administratively down down"
    ],
    "stdout_lines": [
        [
            "Interface              IP-Address      OK? Method Status                Protocol",
            "GigabitEthernet0/0     10.99.0.2       YES manual up                    up",
            "GigabitEthernet0/1     10.255.0.2      YES manual administratively down down",
            "GigabitEthernet0/2     unassigned      YES unset  administratively down down",
            "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
        ]
    ]
}</pre>
<p>Read the two Gi0/1 lines. On Bengaluru, the status is <i>administratively down</i>: somebody left the WAN port shut. On Pune the line says plain <code>down</code> because its far end is shut. So only one fix is needed, on <code>blr-edge-r2</code>. The ad-hoc command applies it, with <code>parents</code> naming the interface mode and <code>lines</code> the command to enter there:</p>
<pre class="out">AUTO01$ ansible blr-edge-r2 -m cisco.ios.ios_config -a "parents='interface GigabitEthernet0/1' lines='no shutdown'"
blr-edge-r2 | CHANGED => {
    "banners": {},
    "changed": true,
    "commands": [
        "interface GigabitEthernet0/1",
        "no shutdown"
    ],
    "updates": [
        "interface GigabitEthernet0/1",
        "no shutdown"
    ]
}</pre>

<h3>Fault 3: braces in the when condition</h3>
<p>Run the check again. It now passes, but a warning appears on the version task:</p>
<pre class="out">AUTO01$ ansible-playbook precheck.yml
PLAY [Pre-change checks for the WAN migration] ********************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up/up] *************************************************
ok: [pun-core-r1] => {
    "changed": false,
    "msg": "pun-core-r1: WAN link is up"
}
ok: [blr-edge-r2] => {
    "changed": false,
    "msg": "blr-edge-r2: WAN link is up"
}
TASK [Software version is supported] ******************************************
[WARNING]: conditional statements should not include jinja2 templating delimiters such as {{ }} or {% %}. Found: {{ ansible_net_version is version(min_version, '>=') }}
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 runs 2.0"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 runs 2.0"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The warning is chapter 3 again: the <code>when</code> line is wrapped in double curly braces. Edit line 27 of <code>precheck.yml</code> so the condition reads <code>when: ansible_net_version is version(min_version, '&gt;=')</code> with no braces. The final run is silent and green:</p>
<pre class="out">AUTO01$ ansible-playbook precheck.yml
PLAY [Pre-change checks for the WAN migration] ********************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up/up] *************************************************
ok: [pun-core-r1] => {
    "changed": false,
    "msg": "pun-core-r1: WAN link is up"
}
ok: [blr-edge-r2] => {
    "changed": false,
    "msg": "blr-edge-r2: WAN link is up"
}
TASK [Software version is supported] ******************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 runs 2.0"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 runs 2.0"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<div class="warn"><p><b>Common beginner mistake.</b> Treating a failing pre-check as a bug in the check and loosening it until it passes. Two of the three faults were in the playbook; the third was a real shut port. Always read the device state before you touch the assert.</p></div>
<div class="exam"><p><b>Exam trap.</b> Check mode is a prediction, not a guarantee. Modules that cannot predict, such as <code>command</code>, are skipped. <code>check_mode: false</code> forces a task to run for real even in a check run, so use it only on read-only tasks.</p></div>

<div class="scn"><h4>Green on paper, red on the day</h4><p>A team skipped the rehearsal and applied a playbook on the night. The pre-check had a typo in a register name and the assert never ran properly. A later team made check mode with diff part of every window, and a pre-check that fails loudly is now the first step of the runbook.</p></div>

<div class="iv"><p class="q">"How do you safely test a playbook before the change window?"</p><p>I run it with <code>--check --diff</code> against one device, and review which tasks would change. A pre-check play asserts the state I rely on. After the real run I repeat check mode and expect changed=0.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>--check</code> predicts changes and <code>--diff</code> shows the configuration lines that would change.</li>
<li>Arbitrary <code>command</code> tasks are skipped in check mode; <code>check_mode: false</code> forces a read-only task to run.</li>
<li>Check mode returning <code>changed=0</code> means the network already matches the playbook.</li>
<li>Debug order: fix the playbook faults, then read the real device state, then fix the device.</li>
<li>Never weaken an assert just to make it pass.</li>
</ul></div>
`,hi:`
<p>Change window se pehle aap rehearsal chahte ho: yeh playbook kya karega, bina kiye? Ansible iske liye <b>check mode</b> deta hai. Rehearsal ke baad hum is module ki har cheez ek realistic fault par lagate hain: ek pre-change check jo khud teen jagah se toota hua hai.</p>

<h3>Check mode aur diff</h3>
<p><code>--check</code> jodo to Ansible har module se poochta hai "kya tum kuch badloge?" par apply nahi karta. <code>--diff</code> jodo to jo modules before-after comparison dikha sakte hain woh print karte hain. Hum VLAN playbook ke saath do extra tasks use karte hain: ek local command chalata hai, ek <code>ansible_check_mode</code> variable print karta hai.</p>
<pre class="out">AUTO01$ ansible-playbook vl.yml --check --diff
PLAY [VLAN rollout] ***********************************************************
TASK [Standard VLANs] *********************************************************
changed: [pun-acc-sw1] => (item=10 USERS)
changed: [pun-acc-sw1] => (item=20 VOICE)
changed: [pun-acc-sw1] => (item=99 MGMT)
changed: [blr-acc-sw2] => (item=10 USERS)
changed: [blr-acc-sw2] => (item=20 VOICE)
changed: [blr-acc-sw2] => (item=99 MGMT)
TASK [BPDU guard in Pune only] ************************************************
--- before: running-config
+++ after: running-config
@@ -66,4 +66,5 @@
  login local
  transport input ssh
 !
+spanning-tree portfast bpduguard default
 end
changed: [pun-acc-sw1]
skipping: [blr-acc-sw2]
TASK [Local note] *************************************************************
skipping: [pun-acc-sw1 -> localhost]
skipping: [blr-acc-sw2 -> localhost]
TASK [Is this a dry run] ******************************************************
ok: [pun-acc-sw1] => {
    "msg": "check mode is True"
}
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=3    changed=2    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   </pre>
<ul>
<li>VLAN task har item ke liye <code>changed</code> report karta hai, matlab "yeh create honge". Is simulator mein VLAN task ke liye diff text print nahi hota.</li>
<li>BPDU guard task diff print karta hai: <code>+</code> se shuru lines running configuration mein add hongi.</li>
<li>Plain <code>command</code> task <b>skip</b> hota hai. Ansible arbitrary command ka asar predict nahi kar sakta, isliye check mode mein use nahi chalata.</li>
<li><code>ansible_check_mode</code> variable <code>True</code> hai, jise aap apni conditions mein use kar sakte ho.</li>
</ul>
<p>Switch dekhkar sabit karo ki kuch apply nahi hua:</p>
<pre class="out">PUN-ACC-SW1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/1, Gi0/2, Gi0/3
                                                Gi0/4, Gi0/5, Gi0/6, Gi0/7
                                                Gi1/0, Gi1/1, Gi1/2, Gi1/3
                                                Gi1/4, Gi1/5, Gi1/6, Gi1/7
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>VLAN 10, 20 ya 99 nahi hai. Asli run ke baad wahi check-mode command dikhata hai ki end state pehle se paa liya gaya hai:</p>
<pre class="out">AUTO01$ ansible-playbook vl.yml --check --diff
PLAY [VLAN rollout] ***********************************************************
TASK [Standard VLANs] *********************************************************
ok: [pun-acc-sw1] => (item=10 USERS)
ok: [pun-acc-sw1] => (item=20 VOICE)
ok: [pun-acc-sw1] => (item=99 MGMT)
ok: [blr-acc-sw2] => (item=10 USERS)
ok: [blr-acc-sw2] => (item=20 VOICE)
ok: [blr-acc-sw2] => (item=99 MGMT)
TASK [BPDU guard in Pune only] ************************************************
ok: [pun-acc-sw1]
skipping: [blr-acc-sw2]
TASK [Local note] *************************************************************
skipping: [pun-acc-sw1 -> localhost]
skipping: [blr-acc-sw2 -> localhost]
TASK [Is this a dry run] ******************************************************
ok: [pun-acc-sw1] => {
    "msg": "check mode is True"
}
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=3    changed=0    unreachable=0    failed=0    skipped=1    rescued=0    ignored=0   
blr-acc-sw2                : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0   </pre>
<p>Yeh aapka change-window opener hai: <code>--check --diff</code> ka <code>changed=0</code> dena matlab network pehle se playbook se match karta hai.</p>

<h3>Read-only tasks jo check mode mein bhi chalne chahiye</h3>
<p>Read-only task, jaise show command jiska output baad ka task use kare, <code>check_mode: false</code> se asli mein chalaya ja sakta hai. Baad ka change task phir bhi check mode maanta hai. <code>pun-acc-sw1</code> par aise task ke saath jo VLAN 77 GUEST add karta, playbook report karta hai ki woh badalta, aur baad mein switch table dikhati hai ki VLAN banaya nahi gaya:</p>
<pre class="out">AUTO01$ ansible-playbook chk.yml --check --diff
PLAY [Read-only task inside check mode] ***************************************
TASK [Read VLANs even in check mode] ******************************************
ok: [pun-acc-sw1]
TASK [Add a VLAN] *************************************************************
changed: [pun-acc-sw1]
PLAY RECAP ********************************************************************
pun-acc-sw1                : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Check mode se rehearse karke apply karo">
<rect x="15" y="65" width="140" height="80" rx="10" fill="#fde68a"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">--check --diff</text><text x="85" y="117" text-anchor="middle" class="svg-muted" font-size="11">rehearse</text>
<rect x="185" y="65" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="255" y="95" text-anchor="middle" class="svg-ink" font-size="13">review</text><text x="255" y="117" text-anchor="middle" class="svg-muted" font-size="11">changed, diff</text>
<rect x="355" y="65" width="140" height="80" rx="10" fill="#bae6fd"/><text x="425" y="95" text-anchor="middle" class="svg-ink" font-size="13">apply</text><text x="425" y="117" text-anchor="middle" class="svg-muted" font-size="11">asli run</text>
<rect x="525" y="65" width="100" height="80" rx="10" fill="#e2e8f0"/><text x="575" y="95" text-anchor="middle" class="svg-ink" font-size="13">repeat</text><text x="575" y="117" text-anchor="middle" class="svg-muted" font-size="11">changed=0</text>
<line x1="155" y1="105" x2="185" y2="105" stroke="#64748b" stroke-width="2"/><line x1="325" y1="105" x2="355" y2="105" stroke="#64748b" stroke-width="2"/><line x1="495" y1="105" x2="525" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Rehearse, review, apply, phir sabit karo ki doosra run saaf hai.</p></div>

<h3>Case: pre-change check jo kaam nahi karta</h3>
<p>Team ne Pune aur Bengaluru routers ke beech WAN link migration se pehle verify karne ke liye <code>precheck.yml</code> likha. Yeh facts padhta hai, interface table padhta hai, assert karta hai ki WAN link Gi0/1 up aur up hai, aur software version naya ho to print karta hai. Yeh chalta nahi. Upar se shuru karo.</p>
<pre class="out">AUTO01$ ansible-playbook precheck.yml
PLAY [Pre-change checks for the WAN migration] ********************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up/up] *************************************************
fatal: [pun-core-r1]: FAILED! => {"changed": false, "msg": "The conditional check 'ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')' failed. The error was: error while evaluating conditional (ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')): 'ifaces' is undefined"}
fatal: [blr-edge-r2]: FAILED! => {"changed": false, "msg": "The conditional check 'ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')' failed. The error was: error while evaluating conditional (ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')): 'ifaces' is undefined"}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<h3>Fault 1: registered naam match nahi karta</h3>
<p>Error kehta hai <code>'ifaces' is undefined</code>. File mein interface task ne <code>register: iface</code> (singular) likha tha jabki assert ne <code>ifaces</code> use kiya. Yeh chapter 4 ka register typo hai, ab chup debug ki jagah failing assert ke saath. Task theek karo taaki dono <code>ifaces</code> use karein:</p>
<pre class="out">AUTO01$ sed -i 's/register: iface$/register: ifaces/' precheck.yml
AUTO01$ ansible-playbook precheck.yml
PLAY [Pre-change checks for the WAN migration] ********************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up/up] *************************************************
fatal: [pun-core-r1]: FAILED! => {"assertion": "ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')", "changed": false, "evaluated_to": false, "msg": "pun-core-r1: WAN link Gi0/1 is not up/up"}
fatal: [blr-edge-r2]: FAILED! => {"assertion": "ifaces.stdout[0] is search('GigabitEthernet0/1 +\\\\S+ +YES \\\\w+ +up +up')", "changed": false, "evaluated_to": false, "msg": "blr-edge-r2: WAN link Gi0/1 is not up/up"}
NO MORE HOSTS LEFT ************************************************************
PLAY RECAP ********************************************************************
pun-core-r1                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=2    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   </pre>
<p>Ab check kaam karta hai, aur apna kaam karta hai: message kehta hai dono routers par WAN link up/up nahi hai. Yeh failure asli hai, typo nahi. Assert ko edit karke pass mat karao. Devices se poocho kya galat hai.</p>

<h3>Fault 2: asli network problem jo check ne pakdi</h3>
<pre class="out">AUTO01$ ansible routers -m cisco.ios.ios_command -a "commands='show ip interface brief'"
pun-core-r1 | SUCCESS => {
    "changed": false,
    "stdout": [
        "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1       YES manual up                    up\\nGigabitEthernet0/1     10.255.0.1      YES manual down                  down\\nGigabitEthernet0/2     unassigned      YES unset  administratively down down\\nGigabitEthernet0/3     unassigned      YES unset  administratively down down"
    ],
    "stdout_lines": [
        [
            "Interface              IP-Address      OK? Method Status                Protocol",
            "GigabitEthernet0/0     10.99.0.1       YES manual up                    up",
            "GigabitEthernet0/1     10.255.0.1      YES manual down                  down",
            "GigabitEthernet0/2     unassigned      YES unset  administratively down down",
            "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
        ]
    ]
}
blr-edge-r2 | SUCCESS => {
    "changed": false,
    "stdout": [
        "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.2       YES manual up                    up\\nGigabitEthernet0/1     10.255.0.2      YES manual administratively down down\\nGigabitEthernet0/2     unassigned      YES unset  administratively down down\\nGigabitEthernet0/3     unassigned      YES unset  administratively down down"
    ],
    "stdout_lines": [
        [
            "Interface              IP-Address      OK? Method Status                Protocol",
            "GigabitEthernet0/0     10.99.0.2       YES manual up                    up",
            "GigabitEthernet0/1     10.255.0.2      YES manual administratively down down",
            "GigabitEthernet0/2     unassigned      YES unset  administratively down down",
            "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
        ]
    ]
}</pre>
<p>Gi0/1 ki do lines padho. Bengaluru par status <i>administratively down</i> hai: kisi ne WAN port shut chhod diya. Pune par line mein sirf <code>down</code> hai kyunki uska far end shut hai. Isliye fix sirf <code>blr-edge-r2</code> par chahiye. Ad-hoc command ise apply karta hai, <code>parents</code> interface mode ka naam deta hai aur <code>lines</code> us mode mein enter hone wala command:</p>
<pre class="out">AUTO01$ ansible blr-edge-r2 -m cisco.ios.ios_config -a "parents='interface GigabitEthernet0/1' lines='no shutdown'"
blr-edge-r2 | CHANGED => {
    "banners": {},
    "changed": true,
    "commands": [
        "interface GigabitEthernet0/1",
        "no shutdown"
    ],
    "updates": [
        "interface GigabitEthernet0/1",
        "no shutdown"
    ]
}</pre>

<h3>Fault 3: when condition mein braces</h3>
<p>Check dobara chalao. Ab pass hota hai, par version task par warning aati hai:</p>
<pre class="out">AUTO01$ ansible-playbook precheck.yml
PLAY [Pre-change checks for the WAN migration] ********************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up/up] *************************************************
ok: [pun-core-r1] => {
    "changed": false,
    "msg": "pun-core-r1: WAN link is up"
}
ok: [blr-edge-r2] => {
    "changed": false,
    "msg": "blr-edge-r2: WAN link is up"
}
TASK [Software version is supported] ******************************************
[WARNING]: conditional statements should not include jinja2 templating delimiters such as {{ }} or {% %}. Found: {{ ansible_net_version is version(min_version, '>=') }}
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 runs 2.0"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 runs 2.0"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Warning chapter 3 hi hai: <code>when</code> line double curly braces mein lapeti hui hai. <code>precheck.yml</code> ki line 27 edit karo taaki condition <code>when: ansible_net_version is version(min_version, '&gt;=')</code> ho, braces ke bina. Aakhri run shaant aur hara hai:</p>
<pre class="out">AUTO01$ ansible-playbook precheck.yml
PLAY [Pre-change checks for the WAN migration] ********************************
TASK [Collect facts] **********************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [Read the interfaces] ****************************************************
ok: [pun-core-r1]
ok: [blr-edge-r2]
TASK [WAN link must be up/up] *************************************************
ok: [pun-core-r1] => {
    "changed": false,
    "msg": "pun-core-r1: WAN link is up"
}
ok: [blr-edge-r2] => {
    "changed": false,
    "msg": "blr-edge-r2: WAN link is up"
}
TASK [Software version is supported] ******************************************
ok: [pun-core-r1] => {
    "msg": "pun-core-r1 runs 2.0"
}
ok: [blr-edge-r2] => {
    "msg": "blr-edge-r2 runs 2.0"
}
PLAY RECAP ********************************************************************
pun-core-r1                : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
blr-edge-r2                : ok=4    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>

<div class="warn"><p><b>Common beginner mistake.</b> Failing pre-check ko check ka bug maanna aur use dheela karte jaana jab tak pass na ho. Teen mein se do faults playbook mein the; teesra asli shut port tha. Assert chhune se pehle hamesha device state padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Check mode prediction hai, guarantee nahi. Jo modules predict nahi kar sakte, jaise <code>command</code>, skip hote hain. <code>check_mode: false</code> task ko check run mein bhi asli mein chalata hai, isliye sirf read-only tasks par use karo.</p></div>

<div class="scn"><h4>Kagaz par hara, din par laal</h4><p>Ek team ne rehearsal chhodkar raat ko playbook apply kiya. Pre-check mein register naam ka typo tha aur assert theek se chala hi nahi. Baad mein team ne check mode with diff ko har window ka hissa banaya, aur zor se fail hone wala pre-check ab runbook ka pehla step hai.</p></div>

<div class="iv"><p class="q">"Change window se pehle playbook ko safely kaise test karte ho?"</p><p>Main use ek device par <code>--check --diff</code> ke saath chalata hoon, aur dekhta hoon kaunse tasks badlenge. Pre-check play us state ko assert karta hai jis par main depend karta hoon. Asli run ke baad check mode dobara chalata hoon aur changed=0 expect karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>--check</code> changes predict karta hai aur <code>--diff</code> badalne wali configuration lines dikhata hai.</li>
<li>Arbitrary <code>command</code> tasks check mode mein skip hote hain; <code>check_mode: false</code> read-only task ko chalata hai.</li>
<li>Check mode ka <code>changed=0</code> matlab network pehle se playbook se match karta hai.</li>
<li>Debug order: playbook ke faults theek karo, phir asli device state padho, phir device theek karo.</li>
<li>Assert ko pass karane ke liye kabhi dheela mat karo.</li>
</ul></div>
`}};export{e as default};