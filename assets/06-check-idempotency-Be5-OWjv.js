var e={id:`check-idempotency`,h:{en:`Dry runs with --check and idempotency`,hi:`--check se dry run aur idempotency`},body:{en:`

<p><b>One idea in this chapter:</b> you should be able to run a playbook as many times as you like and trust it. Two features give you that trust: <b>check mode</b> (a rehearsal) and <b>idempotency</b> (running again changes nothing that is already correct).</p>

<h3>What idempotency means</h3>
<p>The word sounds frightening but the idea is plain. An operation is <b>idempotent</b> if doing it twice gives the same result as doing it once. Pressing the "lift down" button ten times still calls one lift. In the same way, a good Ansible task describes the <i>end state</i> ("this router has NTP server 10.99.0.100"), not the <i>action</i> ("type the NTP command"). Before it changes anything, the module compares the wish with the device, and acts only if they differ.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="An idempotent task compares first. The same playbook changes the device once and then reports nothing to do."><rect x="30" y="20" width="270" height="150" rx="12" fill="#fde68a"/><text x="165" y="48" text-anchor="middle" class="svg-ink" font-size="14">Run 1 (device differs)</text><text x="165" y="80" text-anchor="middle" class="svg-muted" font-size="12">file: ntp server 10.99.0.100</text><text x="165" y="100" text-anchor="middle" class="svg-muted" font-size="12">router: nothing yet</text><text x="165" y="135" text-anchor="middle" class="svg-accent" font-size="14">changed=1</text><rect x="340" y="20" width="270" height="150" rx="12" fill="#bbf7d0"/><text x="475" y="48" text-anchor="middle" class="svg-ink" font-size="14">Run 2 (device matches)</text><text x="475" y="80" text-anchor="middle" class="svg-muted" font-size="12">file: ntp server 10.99.0.100</text><text x="475" y="100" text-anchor="middle" class="svg-muted" font-size="12">router: ntp server 10.99.0.100</text><text x="475" y="135" text-anchor="middle" class="svg-accent" font-size="14">changed=0</text><line x1="300" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="2"/><polygon points="334,90 340,95 334,100" fill="#64748b"/></svg><p class="cap">An idempotent task compares first. The same playbook changes the device once and then reports nothing to do.</p></div>
<p>This is a big step up from a script that blindly types the same lines each time. A script can duplicate entries, restart processes or log noisy changes; an idempotent playbook leaves a correct device untouched.</p>

<h3>Proving it with the lab</h3>
<p>Run <code>ntp.yml</code> for real (as in the last chapter), then run it again:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml
ansible-playbook -i inventory.ini ntp.yml</pre>
<pre class="out">TASK [Point NTP and syslog at the NOC server] *********************************
changed: [R1]
changed: [R2]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

TASK [Point NTP and syslog at the NOC server] *********************************
<span class="hl">ok: [R1</span>]
<span class="hl">ok: [R2</span>]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>First run: <b>changed=1</b> on each router, because the lines were missing. Second run: <b>changed=0</b>, and the task word is <b>ok</b>. Ansible compared the two lines with the running-config, found them already there, and skipped them. A clean second run is your proof that the network matches the file. Lab 1 asks you to check exactly this.</p>
<p>It also works one task at a time. In Lab 2 you add a new VLAN to a data list that already built two VLANs and a port description. The VLAN task changes, the port task does not:</p>
<pre class="out">TASK [Create every VLAN listed in vlans] **************************************
changed: [SW1]
changed: [SW2]

TASK [Describe every port listed in ports] ************************************
ok: [SW1] =&gt; (item={"port": "GigabitEthernet0/2", "desc": "PRINTER-FLOOR1"})
ok: [SW2] =&gt; (item={"port": "GigabitEthernet0/2", "desc": "PRINTER-FLOOR1"})

PLAY RECAP ********************************************************************
SW1                        : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
SW2                        : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The recap says <code>changed=1</code> out of two tasks: exactly the one that had something new to do.</p>

<h3>Check mode: the rehearsal</h3>
<p>Add <code>--check</code> and Ansible logs in to the devices, compares, and reports what <i>would</i> change, but sends no configuration.</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --check</pre>
<pre class="out">[NOTE] check mode (--check): nothing will be changed on the devices; "changed" means "would change".

PLAY [Standard time and logging] **********************************************

TASK [Point NTP and syslog at the NOC server] *********************************
changed: [R1]
changed: [R2]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The note at the top is the key: in check mode, <b>changed</b> means "would change". The routers are untouched. In Lab 2, the second question asks you to prove it. After the dry run, look at the switch:</p>
<pre class="code">SW1# show vlan brief</pre>
<pre class="out">VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/2, Gi0/3, Gi0/4
                                                Gi0/5, Gi0/6, Gi0/7, Gi1/0
                                                Gi1/1, Gi1/2, Gi1/3, Gi1/4
                                                Gi1/5, Gi1/6, Gi1/7
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>There is no VLAN 10 or VLAN 20: the dry run created nothing. The answer to "was VLAN 10 created by the dry run?" is <b>no</b>.</p>
<p>A useful routine for every change: <code>--syntax-check</code>, <code>--check</code> to see the plan, review the list of hosts and the changed lines, then the real run, then a second real run (or <code>--check</code> again) that must show changed=0.</p>

<h3>Limits of check mode and idempotency</h3>
<ul><li>Check mode predicts changes; it cannot catch every real-world failure, such as a device that rejects a command.</li><li>Modules built for configuration (such as <code>ios_config</code> and <code>ios_vlans</code>) are idempotent. A task that only fires raw commands is not necessarily so. Reference configuration (not run in the simulator): the generic command or raw modules in real Ansible report "changed" every time, which would show changed=1 on every run and hide real drift.</li><li>Idempotency is a property of the whole playbook, so test it by running twice.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 1, tasks 4 and 5. You run ntp.yml with --check: changed=1 for each router, and the routers are still unconfigured. You run it for real: changed=1 again, now meaning "changed". You run it a third time: ok and changed=0 for both. The three recaps tell the whole story: plan, action, confirmation.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Reading changed=1 in check mode as "it was changed". Not running the playbook a second time, so never proving idempotency. Using raw command tasks to change configuration, which makes every run look like a change.</p></div>
<div class="exam"><p><b>Exam trap.</b> Idempotent means the same playbook run again produces no further change. Check mode (--check) changes nothing and reports what would change. A second run that shows changed=0 proves the device matches.</p></div>

<div class="scn"><h4>The rollout that was safe to retry</h4><p>During a Saturday change, a playbook updating 60 branch routers stopped halfway when the WAN link of the control node dropped for a minute. The engineer did not worry about which routers were done. She re-ran the same playbook: the 31 finished routers reported ok, the 29 remaining were changed, and the recap ended with failed=0. Because the tasks were idempotent, retrying was safe.</p><p><b>Lesson:</b> idempotency turns "where did it stop?" into "just run it again".</p></div>
<div class="iv"><p class="q">"What is idempotency in Ansible and why does it matter?"</p><p>It means running a playbook repeatedly gives the same end state, and tasks make changes only when the device differs from the desired state. Modules like ios_config compare with the running-config first. It matters because you can re-run after a failure, run on a schedule to correct drift, and prove compliance when a run shows changed=0. I also use --check for a dry run before the real change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Idempotent tasks describe an end state and change the device only if it differs.</li><li>First run: changed. Second run: ok and changed=0, which proves the network matches the file.</li><li>--check is a rehearsal: it compares and reports "would change" but sends nothing.</li><li>In check mode, changed means "would change".</li><li>Routine: syntax-check, check, review, real run, second run.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> aap jitni baar chaho playbook chala sako aur uspar bharosa kar sako. Do features yeh bharosa dete hain: <b>check mode</b> (rehearsal) aur <b>idempotency</b> (dobara chalane par jo pehle se sahi hai use na badalna).</p>

<h3>Idempotency ka matlab</h3>
<p>Shabd darawna lagta hai par idea saaf hai. Koi operation <b>idempotent</b> hai agar use do baar karna wahi result de jo ek baar karna deta hai. Lift ka "neeche" button das baar dabane se bhi ek hi lift aati hai. Isi tarah achha Ansible task <i>end state</i> batata hai ("is router par NTP server 10.99.0.100 hai"), <i>action</i> nahi ("NTP command type karo"). Kuch badalne se pehle module wish ko device se compare karta hai, aur sirf tab act karta hai jab dono alag hon.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Idempotent task pehle compare karta hai. Wahi playbook device ko ek baar badalta hai aur phir batata hai karne ko kuch nahi."><rect x="30" y="20" width="270" height="150" rx="12" fill="#fde68a"/><text x="165" y="48" text-anchor="middle" class="svg-ink" font-size="14">Run 1 (device alag hai)</text><text x="165" y="80" text-anchor="middle" class="svg-muted" font-size="12">file: ntp server 10.99.0.100</text><text x="165" y="100" text-anchor="middle" class="svg-muted" font-size="12">router: abhi kuch nahi</text><text x="165" y="135" text-anchor="middle" class="svg-accent" font-size="14">changed=1</text><rect x="340" y="20" width="270" height="150" rx="12" fill="#bbf7d0"/><text x="475" y="48" text-anchor="middle" class="svg-ink" font-size="14">Run 2 (device match karta hai)</text><text x="475" y="80" text-anchor="middle" class="svg-muted" font-size="12">file: ntp server 10.99.0.100</text><text x="475" y="100" text-anchor="middle" class="svg-muted" font-size="12">router: ntp server 10.99.0.100</text><text x="475" y="135" text-anchor="middle" class="svg-accent" font-size="14">changed=0</text><line x1="300" y1="95" x2="340" y2="95" stroke="#64748b" stroke-width="2"/><polygon points="334,90 340,95 334,100" fill="#64748b"/></svg><p class="cap">An idempotent task compares first. The same playbook changes the device once and then reports nothing to do.</p></div>
<p>Yeh us script se bada kadam hai jo har baar andhadhund wahi lines type karti hai. Script entries duplicate kar sakti hai, processes restart kar sakti hai ya shor wale changes log kar sakti hai; idempotent playbook sahi device ko chhoota nahi.</p>

<h3>Lab se saabit karna</h3>
<p><code>ntp.yml</code> ko asli chalao (pichhle chapter jaisa), phir dobara chalao:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml
ansible-playbook -i inventory.ini ntp.yml</pre>
<pre class="out">TASK [Point NTP and syslog at the NOC server] *********************************
changed: [R1]
changed: [R2]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   

TASK [Point NTP and syslog at the NOC server] *********************************
<span class="hl">ok: [R1</span>]
<span class="hl">ok: [R2</span>]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Pehla run: har router par <b>changed=1</b>, kyunki lines missing thi. Doosra run: <b>changed=0</b>, aur task ka word <b>ok</b>. Ansible ne dono lines ko running-config se compare kiya, unhe pehle se paya, aur skip kar diya. Saaf doosra run saboot hai ki network file se match karta hai. Lab 1 exactly yahi check karwata hai.</p>
<p>Yeh ek-ek task par bhi kaam karta hai. Lab 2 mein aap ek aise data list mein naya VLAN jodte ho jisne pehle hi do VLANs aur ek port description bana diya tha. VLAN task badalta hai, port task nahi:</p>
<pre class="out">TASK [Create every VLAN listed in vlans] **************************************
changed: [SW1]
changed: [SW2]

TASK [Describe every port listed in ports] ************************************
ok: [SW1] =&gt; (item={"port": "GigabitEthernet0/2", "desc": "PRINTER-FLOOR1"})
ok: [SW2] =&gt; (item={"port": "GigabitEthernet0/2", "desc": "PRINTER-FLOOR1"})

PLAY RECAP ********************************************************************
SW1                        : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
SW2                        : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Recap kehta hai do tasks mein se <code>changed=1</code>: exactly woh jisme kuch naya karna tha.</p>

<h3>Check mode: rehearsal</h3>
<p><code>--check</code> jodo aur Ansible devices mein login karta hai, compare karta hai, aur batata hai ki kya <i>badlega</i>, par koi configuration nahi bhejta.</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --check</pre>
<pre class="out">[NOTE] check mode (--check): nothing will be changed on the devices; "changed" means "would change".

PLAY [Standard time and logging] **********************************************

TASK [Point NTP and syslog at the NOC server] *********************************
changed: [R1]
changed: [R2]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Upar ka note key hai: check mode mein <b>changed</b> ka matlab "badlega". Routers touched nahi hain. Lab 2 mein doosra sawaal ise saabit karwata hai. Dry run ke baad switch dekho:</p>
<pre class="code">SW1# show vlan brief</pre>
<pre class="out">VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/2, Gi0/3, Gi0/4
                                                Gi0/5, Gi0/6, Gi0/7, Gi1/0
                                                Gi1/1, Gi1/2, Gi1/3, Gi1/4
                                                Gi1/5, Gi1/6, Gi1/7
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>VLAN 10 ya VLAN 20 nahi hai: dry run ne kuch nahi banaya. "Kya dry run ne VLAN 10 bana diya?" ka jawab <b>no</b> hai.</p>
<p>Har change ke liye kaam ki routine: <code>--syntax-check</code>, plan dekhne ke liye <code>--check</code>, hosts ki list aur changed lines review karo, phir asli run, phir doosra asli run (ya dobara <code>--check</code>) jo changed=0 dikhaye.</p>

<h3>Check mode aur idempotency ki seemayein</h3>
<ul><li>Check mode changes predict karta hai; yeh har real-world failure nahi pakad sakta, jaise device ka command reject karna.</li><li>Configuration ke liye bane modules (jaise <code>ios_config</code> aur <code>ios_vlans</code>) idempotent hain. Jo task sirf raw commands chalata hai woh zaroori nahi ki ho. Reference configuration (not run in the simulator): asli Ansible ke generic command ya raw modules har baar "changed" report karte hain, jisse har run par changed=1 dikhega aur asli drift chhup jaayega.</li><li>Idempotency poore playbook ki property hai, isliye use do baar chalakar test karo.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 1, tasks 4 aur 5. Aap ntp.yml ko --check ke saath chalate ho: har router ke liye changed=1, aur routers abhi bhi unconfigured. Asli chalate ho: phir changed=1, ab matlab "badla". Teesri baar chalate ho: dono ke liye ok aur changed=0. Teenon recaps poori kahani batate hain: plan, action, confirmation.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Check mode mein changed=1 ko "badal diya gaya" padhna. Playbook doosri baar na chalana, isliye idempotency kabhi saabit na karna. Configuration badalne ke liye raw command tasks use karna, jisse har run change jaisa dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Idempotent ka matlab wahi playbook dobara chalane par koi aur change nahi. Check mode (--check) kuch nahi badalta aur batata hai kya badlega. changed=0 wala doosra run saabit karta hai ki device match karta hai.</p></div>

<div class="scn"><h4>Jis rollout ko retry karna safe tha</h4><p>Saturday change ke dauran 60 branch routers update karne wala playbook beech mein ruk gaya jab control node ka WAN link ek minute ke liye gir gaya. Engineer ko is baat ki chinta nahi thi ki kaun se routers ho chuke hain. Usne wahi playbook dobara chalaya: 31 finished routers ne ok report kiya, bache 29 changed hue, aur recap failed=0 par khatam hua. Tasks idempotent the, isliye retry safe tha.</p><p><b>Lesson:</b> idempotency "kahan ruka tha?" ko "bas dobara chalao" mein badal deti hai.</p></div>
<div class="iv"><p class="q">"Ansible mein idempotency kya hai aur kyun matter karti hai?"</p><p>Matlab playbook baar-baar chalane par same end state milta hai, aur tasks tabhi changes karte hain jab device desired state se alag ho. ios_config jaise modules pehle running-config se compare karte hain. Matter isliye karta hai ki failure ke baad dobara chala sakte ho, drift sudharne ke liye schedule par chala sakte ho, aur changed=0 wala run compliance saabit karta hai. Main real change se pehle dry run ke liye --check bhi use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Idempotent tasks end state batate hain aur device tabhi badalte hain jab woh alag ho.</li><li>Pehla run: changed. Doosra run: ok aur changed=0, jo saabit karta hai ki network file se match karta hai.</li><li>--check rehearsal hai: compare karta hai aur "badlega" batata hai par kuch bhejta nahi.</li><li>Check mode mein changed ka matlab "badlega".</li><li>Routine: syntax-check, check, review, asli run, doosra run.</li></ul></div>

`}};export{e as default};