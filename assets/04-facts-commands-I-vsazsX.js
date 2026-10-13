var e={id:`facts-commands`,h:{en:`Collections, facts and read-only commands (Lab 1, step 2)`,hi:`Collections, facts aur read-only commands (Lab 1, step 2)`},body:{en:`
<p>Before you change anything, learn to <b>read</b>. Ansible reads a device in two ways: <b>facts</b> (structured data the platform collection collects for you) and <b>command</b> modules (the output of a show command). This chapter also explains the long module names, because on three vendors you can no longer get away with writing <code>ios_config</code> alone.</p>

<h3>Collections and fully qualified names</h3>
<p>Modules for network devices ship in <b>collections</b>. A module's full name has three parts: <code>namespace.collection.module</code>, for example <code>junipernetworks.junos.junos_config</code>. This is the FQCN (fully qualified collection name). Short names such as <code>eos_config</code> still work in many cases, but the FQCN is unambiguous, survives collection changes and tells the reader which vendor a task targets. The lab has the collections of <code>ansible-galaxy collection list</code> from Chapter 2, and <code>ansible-doc</code> lists the modules of any of them:</p>
<pre class="out">AUTO01$ ansible-doc -l junipernetworks
junipernetworks.junos.junos_command        Run arbitrary commands on remote devices running Junos
<span class="hl">junipernetworks.junos.junos_config         Manage configuration on devices running Juniper JUNOS</span>
junipernetworks.junos.junos_facts          Collect facts from remote devices running Juniper Junos
junipernetworks.junos.junos_hostname       Manage Hostname on devices running Junos
junipernetworks.junos.junos_interfaces     Manages interface attributes of Junos network devices
junipernetworks.junos.junos_logging_global Manage syslog configuration on devices running Junos
junipernetworks.junos.junos_ntp_global     Manages NTP configuration on devices running Junos
junipernetworks.junos.junos_ospfv2         OSPFv2 resource module (Junos)
junipernetworks.junos.junos_vlans          Manage VLANs on Junos devices</pre>
<p>Notice the families: <code>*_command</code>, <code>*_config</code>, <code>*_facts</code> exist on every platform, and the rest (<code>junos_vlans</code>, <code>junos_ntp_global</code>) are <b>resource modules</b> that you meet in Chapter 8. <code>ansible-doc -s arista.eos.eos_vlans</code> prints a compact snippet of the options when you only need to remember the key names.</p>

<h3>Facts: ios_facts, junos_facts, eos_facts</h3>
<p>You set <code>gather_facts: false</code> in these plays. The default fact gathering runs a module that needs Python on the target, which a router does not have. The network collections give you a platform-specific fact module instead, which you call yourself and which fills variables that all start with <code>ansible_net_</code>. Lab 1 step 2 asks all three at once, each guarded by the platform:</p>
<pre class="code"><span class="c"># facts.yml</span>
---
- name: Facts from three vendors
  hosts: network
  gather_facts: false
  tasks:
    - name: IOS XE facts
      cisco.ios.ios_facts:
        gather_subset: min
      when: ansible_network_os == 'cisco.ios.ios'

    - name: Junos facts
      junipernetworks.junos.junos_facts:
        gather_subset: min
      when: ansible_network_os == 'junipernetworks.junos.junos'

    - name: EOS facts
      arista.eos.eos_facts:
        gather_subset: min
      when: ansible_network_os == 'arista.eos.eos'

    - name: One line per device
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} {{ ansible_net_hostname }} {{ ansible_net_version }}"</pre>
<p><code>gather_subset: min</code> asks for the basics only (hostname, version, model, serial number); larger subsets add interfaces and the configuration, and take longer. The last task prints the same two variable names for three vendors, which is the point: the collections normalise the names.</p>
<pre class="out">AUTO01$ ansible-playbook facts.yml
PLAY [Facts from three vendors] ***********************************************
TASK [IOS XE facts] ***********************************************************
ok: [R1]
skipping: [J1]
skipping: [E1]
TASK [Junos facts] ************************************************************
skipping: [R1]
ok: [J1]
skipping: [E1]
TASK [EOS facts] **************************************************************
skipping: [R1]
skipping: [J1]
ok: [E1]
TASK [One line per device] ****************************************************
ok: [R1] =&gt; {
    "msg": "R1 PUN-CORE-R1 2.0"
}
ok: [J1] =&gt; {
    <span class="hl">"msg": "J1 BLR-EDGE-J1 23.4R1.10"</span>
}
ok: [E1] =&gt; {
    "msg": "E1 HYD-LEAF-E1 4.31.4M"
}
PLAY RECAP ********************************************************************
R1                         : ok=2    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1                         : ok=2    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
E1                         : ok=2    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0</pre>
<p>Facts never change a device, so <code>changed=0</code> is always right. The recap column <code>skipped</code> counts the <code>when</code> guards that said no.</p>

<h3>Command modules: read a show output</h3>
<p>For anything facts do not cover, use <code>ios_command</code>, <code>junos_command</code>, <code>eos_command</code> or the platform-neutral <code>ansible.netcommon.cli_command</code>. They return <code>stdout</code> (one string per command) and <code>stdout_lines</code> (a list of lines). <code>wait_for</code> turns a command into a test:</p>
<pre class="code">    - name: Read a show command
      arista.eos.eos_command:
        commands:
          - show version
        wait_for:
          - result[0] contains Arista
      register: sv

    - name: Software line
      ansible.builtin.debug:
        msg: "{{ sv.stdout_lines[0][6] }}"</pre>
<pre class="out">TASK [Software line] **********************************************************
ok: [E1] =&gt; {
    "msg": "Software image version: 4.31.4M"
}</pre>
<p>If the condition is false after the retries, the task fails with <i>One or more conditional statements have not been satisfied</i>; this is how a playbook checks a state before it goes on. Command modules are for <b>show</b> commands. Use the config modules (Chapter 5) for changes, because only they know how to compare, check and stay idempotent.</p>

<div class="eg"><p><b>Worked example: a version gate.</b> Before a change, assert that each device runs an approved software version. Gather facts, then <code>ansible.builtin.assert: that: ansible_net_version in approved_versions</code>. The playbook stops on any host that is not ready, and the others continue.</p></div>
<div class="warn"><p><b>Common mistake.</b> Leaving <code>gather_facts</code> on (the default) in a network play. The setup module needs Python on the target, so the first task fails before your work begins. Always write <code>gather_facts: false</code> and call the platform's facts module on purpose.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>*_command</code> returns the raw text of a show command. It is not idempotent by design and it never reports <i>changed</i> for a show. Do not use it to configure.</p></div>

<div class="scn"><h4>The pre-check that saved a window</h4><p>Before a Saturday upgrade the team ran a 12-line facts playbook against 60 switches and printed <code>ansible_net_version</code> and <code>ansible_net_model</code>. Four switches reported a model that the new image did not support. They were pulled from the plan on Friday instead of failing at 2 a.m.</p><p><b>Lesson:</b> facts turn the inventory into evidence. Read first, change second.</p></div>
<div class="iv"><p class="q">"Why do network playbooks set gather_facts: false?"</p><p>Because the default fact gathering needs Python on the target and network operating systems do not run it. I call <code>ios_facts</code>, <code>junos_facts</code> or <code>eos_facts</code> explicitly; they populate the <code>ansible_net_</code> variables over the same connection.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FQCN means <code>namespace.collection.module</code>; use it in real projects.</li>
<li><code>ansible-doc -l NAMESPACE</code> lists modules; <code>ansible-doc -s MODULE</code> shows a short option snippet.</li>
<li>Every platform has a facts module that fills <code>ansible_net_*</code> variables.</li>
<li><code>*_command</code> reads show output and <code>wait_for</code> can test it; it is not a way to configure.</li>
<li>Always <code>gather_facts: false</code> on network plays.</li></ul></div>
`,hi:`
<p>Kuch badalne se pehle <b>padhna</b> seekho. Ansible device ko do tareeke se padhta hai: <b>facts</b> (structured data jo platform collection aapke liye ikattha karti hai) aur <b>command</b> modules (show command ka output). Yeh chapter lambe module names bhi samjhata hai, kyunki teen vendors par akela <code>ios_config</code> likhne se kaam nahi chalta.</p>

<h3>Collections aur fully qualified names</h3>
<p>Network devices ke modules <b>collections</b> mein aate hain. Module ke poore naam ke teen hisse hote hain: <code>namespace.collection.module</code>, jaise <code>junipernetworks.junos.junos_config</code>. Yeh FQCN (fully qualified collection name) hai. <code>eos_config</code> jaise short naam kai jagah ab bhi chalte hain, par FQCN saaf hai, collection badalne par bhi tikta hai aur padhne wale ko batata hai ki task kaunsa vendor target karta hai. Lab mein Chapter 2 ke <code>ansible-galaxy collection list</code> wale collections hain, aur <code>ansible-doc</code> kisi bhi collection ke modules list karta hai:</p>
<pre class="out">AUTO01$ ansible-doc -l junipernetworks
junipernetworks.junos.junos_command        Run arbitrary commands on remote devices running Junos
<span class="hl">junipernetworks.junos.junos_config         Manage configuration on devices running Juniper JUNOS</span>
junipernetworks.junos.junos_facts          Collect facts from remote devices running Juniper Junos
junipernetworks.junos.junos_hostname       Manage Hostname on devices running Junos
junipernetworks.junos.junos_interfaces     Manages interface attributes of Junos network devices
junipernetworks.junos.junos_logging_global Manage syslog configuration on devices running Junos
junipernetworks.junos.junos_ntp_global     Manages NTP configuration on devices running Junos
junipernetworks.junos.junos_ospfv2         OSPFv2 resource module (Junos)
junipernetworks.junos.junos_vlans          Manage VLANs on Junos devices</pre>
<p>Families dekho: <code>*_command</code>, <code>*_config</code>, <code>*_facts</code> har platform par hote hain, aur baaki (<code>junos_vlans</code>, <code>junos_ntp_global</code>) <b>resource modules</b> hain jinse aap Chapter 8 mein milte ho. Jab sirf option ke key names yaad karne hon to <code>ansible-doc -s arista.eos.eos_vlans</code> options ka chhota snippet print karta hai.</p>

<h3>Facts: ios_facts, junos_facts, eos_facts</h3>
<p>In plays mein aapne <code>gather_facts: false</code> likha tha. Default fact gathering aisa module chalati hai jise target par Python chahiye, jo router ke paas nahi hota. Network collections aapko platform-specific fact module deti hain, jise aap khud bulate ho aur jo aise variables bharta hai jinke naam <code>ansible_net_</code> se shuru hote hain. Lab 1 step 2 teeno se ek saath poochta hai, har ek platform se guarded:</p>
<pre class="code"><span class="c"># facts.yml</span>
---
- name: Facts from three vendors
  hosts: network
  gather_facts: false
  tasks:
    - name: IOS XE facts
      cisco.ios.ios_facts:
        gather_subset: min
      when: ansible_network_os == 'cisco.ios.ios'

    - name: Junos facts
      junipernetworks.junos.junos_facts:
        gather_subset: min
      when: ansible_network_os == 'junipernetworks.junos.junos'

    - name: EOS facts
      arista.eos.eos_facts:
        gather_subset: min
      when: ansible_network_os == 'arista.eos.eos'

    - name: One line per device
      ansible.builtin.debug:
        msg: "{{ inventory_hostname }} {{ ansible_net_hostname }} {{ ansible_net_version }}"</pre>
<p><code>gather_subset: min</code> sirf basics maangta hai (hostname, version, model, serial number); bade subsets interfaces aur configuration jodte hain aur zyada time lete hain. Aakhri task teen vendors ke liye wahi do variable names print karta hai, aur yahi point hai: collections names ko normalise karti hain.</p>
<pre class="out">AUTO01$ ansible-playbook facts.yml
PLAY [Facts from three vendors] ***********************************************
TASK [IOS XE facts] ***********************************************************
ok: [R1]
skipping: [J1]
skipping: [E1]
TASK [Junos facts] ************************************************************
skipping: [R1]
ok: [J1]
skipping: [E1]
TASK [EOS facts] **************************************************************
skipping: [R1]
skipping: [J1]
ok: [E1]
TASK [One line per device] ****************************************************
ok: [R1] =&gt; {
    "msg": "R1 PUN-CORE-R1 2.0"
}
ok: [J1] =&gt; {
    <span class="hl">"msg": "J1 BLR-EDGE-J1 23.4R1.10"</span>
}
ok: [E1] =&gt; {
    "msg": "E1 HYD-LEAF-E1 4.31.4M"
}
PLAY RECAP ********************************************************************
R1                         : ok=2    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1                         : ok=2    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
E1                         : ok=2    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0</pre>
<p>Facts device ko kabhi nahi badalte, isliye <code>changed=0</code> hamesha sahi hai. Recap ka <code>skipped</code> column un <code>when</code> guards ko ginta hai jinhone no kaha.</p>

<h3>Command modules: show output padho</h3>
<p>Jo facts cover nahi karte uske liye <code>ios_command</code>, <code>junos_command</code>, <code>eos_command</code> ya platform-neutral <code>ansible.netcommon.cli_command</code> use karo. Yeh <code>stdout</code> (har command ka ek string) aur <code>stdout_lines</code> (lines ki list) lautate hain. <code>wait_for</code> command ko test bana deta hai:</p>
<pre class="code">    - name: Read a show command
      arista.eos.eos_command:
        commands:
          - show version
        wait_for:
          - result[0] contains Arista
      register: sv

    - name: Software line
      ansible.builtin.debug:
        msg: "{{ sv.stdout_lines[0][6] }}"</pre>
<pre class="out">TASK [Software line] **********************************************************
ok: [E1] =&gt; {
    "msg": "Software image version: 4.31.4M"
}</pre>
<p>Retries ke baad bhi condition false rahe to task <i>One or more conditional statements have not been satisfied</i> ke saath fail hota hai; playbook aage badhne se pehle state aise hi check karti hai. Command modules <b>show</b> commands ke liye hain. Changes ke liye config modules (Chapter 5) use karo, kyunki sirf wahi compare, check aur idempotent rehna jaante hain.</p>

<div class="eg"><p><b>Worked example: version gate.</b> Change se pehle assert karo ki har device approved software version chalata hai. Facts ikattha karo, phir <code>ansible.builtin.assert: that: ansible_net_version in approved_versions</code>. Jo host ready nahi hai us par playbook ruk jaati hai, baaki chalte rehte hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Network play mein <code>gather_facts</code> ko on (default) chhod dena. Setup module ko target par Python chahiye, isliye aapka kaam shuru hone se pehle pehla task fail ho jaata hai. Hamesha <code>gather_facts: false</code> likho aur platform ka facts module jaan boojhkar bulao.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>*_command</code> show command ka raw text lautata hai. Yeh design se idempotent nahi hai aur show ke liye kabhi <i>changed</i> nahi batata. Configure karne ke liye use mat karo.</p></div>

<div class="scn"><h4>Pre-check jisne window bachayi</h4><p>Saturday upgrade se pehle team ne 60 switches par 12 line ki facts playbook chalayi aur <code>ansible_net_version</code> aur <code>ansible_net_model</code> print kiye. Chaar switches ka model aisa tha jo naya image support nahi karta tha. Unhe raat 2 baje fail hone ki jagah Friday ko plan se hata liya gaya.</p><p><b>Lesson:</b> facts inventory ko saboot bana dete hain. Pehle padho, phir badlo.</p></div>
<div class="iv"><p class="q">"Network playbooks gather_facts: false kyon rakhti hain?"</p><p>Kyunki default fact gathering ko target par Python chahiye aur network operating systems use nahi chalate. Main <code>ios_facts</code>, <code>junos_facts</code> ya <code>eos_facts</code> khud bulata hoon; yeh usi connection par <code>ansible_net_</code> variables bharte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FQCN matlab <code>namespace.collection.module</code>; real projects mein use karo.</li>
<li><code>ansible-doc -l NAMESPACE</code> modules list karta hai; <code>ansible-doc -s MODULE</code> chhota option snippet dikhata hai.</li>
<li>Har platform ka ek facts module hota hai jo <code>ansible_net_*</code> variables bharta hai.</li>
<li><code>*_command</code> show output padhta hai aur <code>wait_for</code> use test kar sakta hai; configure karne ka tareeka nahi.</li>
<li>Network plays par hamesha <code>gather_facts: false</code>.</li></ul></div>
`}};export{e as default};