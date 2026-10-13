var e={id:`tools`,h:{en:`Python, Ansible and Terraform for Nexus and ACI`,hi:`Nexus aur ACI ke liye Python, Ansible aur Terraform`},body:{en:`
<p>Think of three ways to get a house painted. You can hire a handyman and tell him every brush stroke (Python: total control, you write every step). You can give a painting company a checklist, "these walls, this colour", and they only repaint walls that are not already right (Ansible: tasks that check before they change). Or you can hand an architect a drawing of the finished house, and the builder works out what to add, change or remove to match it, keeping a record of what exists (Terraform: declarative, with a state file). All three are useful; the skill is knowing which to pick.</p>

<h3>Python on the switch (on-box)</h3>
<p>Nexus switches ship with a Python interpreter. Type <code>python3</code> at the exec prompt for an interactive shell, or store scripts on bootflash and run them. The built-in <code>cli</code> module gives three functions: <code>cli()</code> returns text, <code>clid()</code> returns JSON as a string, and <code>clip()</code> prints the output.</p>
<pre class="code">LEAF1# python3
&gt;&gt;&gt; import json
&gt;&gt;&gt; from cli import clid
&gt;&gt;&gt; data = json.loads(clid('show interface brief'))
&gt;&gt;&gt; rows = data['TABLE_interface']['ROW_interface']
&gt;&gt;&gt; print([r['interface'] for r in rows if r['state'] == 'down'])</pre>
<pre class="out"><span class="hl">['Ethernet1/3', 'Ethernet1/9', 'Ethernet1/48']</span></pre>
<p>On-box scripts are ideal for local tasks: a check triggered by the Embedded Event Manager (EEM) when an interface goes down, or a script run at boot. For heavier tools, the <b>Guest Shell</b> is a Linux container on the switch where you can install packages without touching NX-OS itself.</p>

<h3>Python from a server (off-box)</h3>
<p>Most automation runs on a server or a laptop and talks to many switches. Common Python libraries are <b>requests</b> (NX-API and REST APIs, as in the previous chapter), <b>ncclient</b> (NETCONF), <b>Netmiko</b> (SSH with CLI when no API is available) and Cisco's <b>pyATS/Genie</b> (test framework with parsers that turn show output into structured data). Python gives maximum freedom, but you must handle errors, retries, concurrency and idempotency yourself.</p>

<h3>Ansible: agentless and idempotent</h3>
<p><b>Ansible</b> runs from a control node and connects to devices over SSH (connection <code>ansible.netcommon.network_cli</code>) or NX-API (connection <code>ansible.netcommon.h&#116;tpapi</code>). Nothing is installed on the switch, which is what <b>agentless</b> means. You write <b>playbooks</b> in YAML; each task calls a <b>module</b>. For NX-OS the modules come from the <b>cisco.nxos</b> collection; for ACI from <b>cisco.aci</b>.</p>
<p>The <b>inventory</b> says which devices exist and how to reach them:</p>
<pre class="code">all:
  children:
    leaves:
      hosts:
        leaf1:
          ansible_host: 10.10.10.1
        leaf2:
          ansible_host: 10.10.10.2
  vars:
    ansible_network_os: cisco.nxos.nxos
    ansible_connection: ansible.netcommon.network_cli
    ansible_user: automation</pre>
<p>The <b>playbook</b> describes the wanted result:</p>
<pre class="code">- name: Standard VLANs on all leaves
  hosts: leaves
  gather_facts: false
  tasks:
    - name: Ensure VLANs exist with the right names
      cisco.nxos.nxos_vlans:
        config:
          - vlan_id: 10
            name: WEB
          - vlan_id: 20
            name: DB
          - vlan_id: 30
            name: APP
        state: merged

    - name: Save only if something changed
      cisco.nxos.nxos_config:
        save_when: modified</pre>
<pre class="out">TASK [Ensure VLANs exist with the right names] *****************
changed: [leaf1]
ok: [leaf2]
PLAY RECAP *****************************************************
<span class="hl">leaf1 : ok=2  changed=2  unreachable=0  failed=0</span>
leaf2 : ok=2  changed=0  unreachable=0  failed=0</pre>
<p>leaf1 was missing VLAN 30, so it changed; leaf2 was already correct, so Ansible touched nothing. Run the playbook again and both report <code>changed=0</code>. That is <b>idempotency</b>: the play describes a state, not a list of keystrokes. Use <code>--check --diff</code> to see what would change without changing it.</p>

<table class="cmp"><tr><th>Module (cisco.nxos)</th><th>Use</th></tr>
<tr><td><code>nxos_command</code></td><td>Run show commands and collect output (read-only checks)</td></tr>
<tr><td><code>nxos_config</code></td><td>Push configuration lines; compares with running config first</td></tr>
<tr><td><code>nxos_facts</code></td><td>Gather version, interfaces, hardware and more</td></tr>
<tr><td><code>nxos_vlans</code>, <code>nxos_interfaces</code>, <code>nxos_l2_interfaces</code>, <code>nxos_l3_interfaces</code>, <code>nxos_bgp_global</code>, <code>nxos_acls</code></td><td><b>Resource modules</b>: structured data in, with states such as merged, replaced, overridden, deleted and gathered</td></tr>
</table>
<p>The resource module <b>state</b> matters: <code>merged</code> adds or updates what you list; <code>replaced</code> makes each listed item exactly match; <code>overridden</code> makes the whole device match your list and <b>removes everything not listed</b>; <code>deleted</code> removes; <code>gathered</code> reads the current state as structured data.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ansible, Terraform and Python compared">
<rect x="10" y="20" width="195" height="110" rx="8" fill="#bae6fd"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="14">Python</text><text x="107" y="70" text-anchor="middle" class="svg-muted" font-size="12">imperative: every step</text><text x="107" y="92" text-anchor="middle" class="svg-muted" font-size="12">full control</text><text x="107" y="114" text-anchor="middle" class="svg-muted" font-size="12">you handle errors</text>
<rect x="222" y="20" width="195" height="110" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Ansible</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">YAML tasks, agentless</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">idempotent modules</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">no state file</text>
<rect x="435" y="20" width="195" height="110" rx="8" fill="#ddd6fe"/><text x="532" y="45" text-anchor="middle" class="svg-ink" font-size="14">Terraform</text><text x="532" y="70" text-anchor="middle" class="svg-muted" font-size="12">declarative HCL</text><text x="532" y="92" text-anchor="middle" class="svg-muted" font-size="12">plan, then apply</text><text x="532" y="114" text-anchor="middle" class="svg-muted" font-size="12">keeps a state file</text>
</svg><p class="cap">Three tools, three styles. Many teams use Terraform or Ansible for configuration and Python for checks and glue.</p></div>

<h3>Terraform for ACI and NDFC, at concept level</h3>
<p><b>Terraform</b> describes infrastructure in <b>HCL</b> (HashiCorp Configuration Language). <b>Providers</b> translate resources into API calls; Cisco publishes providers for ACI, NX-OS (using NX-API REST), NDFC and Intersight. The workflow is <code>terraform init</code> (download providers), <code>terraform plan</code> (show what will be created, changed or destroyed), <code>terraform apply</code> (do it) and, if needed, <code>terraform destroy</code>. Terraform records what it manages in a <b>state file</b>; comparing that state with reality lets it detect drift and delete objects you removed from the code.</p>
<pre class="code">resource "aci_tenant" "prod" {
  name = "PROD"
}

resource "aci_vrf" "prod_vrf" {
  tenant_dn = aci_tenant.prod.id
  name      = "PROD-VRF"
}</pre>
<p>The VRF refers to the tenant's ID, so Terraform knows to create the tenant first. Delete the VRF block, run plan, and Terraform shows "1 to destroy".</p>

<div class="eg"><p><b>Worked example: picking a tool.</b> Task 1: every night, check 120 leaves for interfaces with rising CRC errors and post a report. That is read-only data collection and logic, so Python with NX-API (or an Ansible <code>nxos_command</code> play feeding a script) fits. Task 2: keep VLANs and SVIs on 120 leaves in line with a YAML file in Git. Ansible resource modules with <code>merged</code> fit. Task 3: create 30 ACI tenants with VRFs, BDs and EPGs, and be able to remove one cleanly later. Terraform with the ACI provider fits, because its state file knows exactly what it created.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>nxos_command</code> to push configuration (it is not idempotent). Choosing <code>overridden</code> when you meant <code>merged</code>, and deleting VLANs that were not in your list. Storing passwords in plain text in inventories instead of Ansible Vault or a secrets store. Editing ACI by hand after Terraform built it, so the next apply "fixes" your manual change back.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ansible is <b>agentless</b> and uses YAML playbooks; network modules usually run on the control node. Terraform is <b>declarative</b> with a <b>state file</b> and a plan/apply workflow. On-box NX-OS Python uses the <code>cli</code> module (<code>cli</code>, <code>clid</code>, <code>clip</code>).</p></div>

<div class="scn"><h4>The playbook that deleted the storage VLANs</h4><p>A team maintained VLANs with an Ansible play using <code>state: overridden</code>, and its YAML file listed only the application VLANs. A storage engineer had added VLANs 900 and 901 by hand for iSCSI. The next scheduled run removed them from all leaves, and two ESXi clusters lost their datastores. The on-call engineer saw the removal in the play's diff output and in the switch accounting log, restored the VLANs from a checkpoint, and paused the job. The fix was process: all VLANs, including storage, moved into the source-of-truth file, and the state changed to <code>merged</code> for daily runs, with <code>overridden</code> used only in reviewed clean-up changes.</p><p><b>Lesson:</b> declarative tools enforce exactly what you declare; anything outside the source of truth is at risk.</p></div>

<div class="iv"><p class="q">"What does idempotent mean in Ansible, and how would you prove a playbook is idempotent?"</p><p>Strong answer: running the playbook repeatedly converges to the same state; the second run should report <code>changed=0</code>. Prove it by running twice (or with <code>--check --diff</code>) and showing no changes. Mention that resource modules such as <code>nxos_vlans</code> are idempotent while <code>nxos_command</code> is not, and explain the difference between merged, replaced and overridden.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>On-box Python uses the <code>cli</code> module; off-box Python uses requests, ncclient, Netmiko or pyATS.</li>
<li>Ansible is agentless, uses YAML inventories and playbooks, and cisco.nxos / cisco.aci collections.</li>
<li>Resource modules are idempotent; know merged, replaced, overridden, deleted and gathered.</li>
<li>Terraform is declarative HCL with providers, a plan/apply workflow and a state file.</li>
<li>Pick the tool by the job: checks and glue in Python, device config in Ansible, object lifecycles in Terraform.</li>
</ul></div>
`,hi:`
<p>Ghar paint karwane ke teen tareeke socho. Aap ek handyman rakh kar use har brush stroke bata sakte ho (Python: poora control, har step aap likhte ho). Aap ek painting company ko checklist de sakte ho, "yeh deewarein, yeh rang", aur woh sirf woh deewarein dobara paint karti hai jo pehle se sahi nahi hain (Ansible: tasks jo badalne se pehle check karte hain). Ya aap architect ko tayyar ghar ki drawing de sakte ho, aur builder khud nikaalta hai ki match karne ke liye kya jodna, badalna ya hatana hai, aur jo exist karta hai uska record rakhta hai (Terraform: declarative, state file ke saath). Teeno kaam ke hain; skill yeh jaanna hai ki kab kaunsa chuno.</p>

<h3>Switch par Python (on-box)</h3>
<p>Nexus switches Python interpreter ke saath aate hain. Interactive shell ke liye exec prompt par <code>python3</code> type karo, ya scripts bootflash par rakh kar chalao. Built-in <code>cli</code> module teen functions deta hai: <code>cli()</code> text deta hai, <code>clid()</code> JSON string ki tarah deta hai, aur <code>clip()</code> output print karta hai.</p>
<pre class="code">LEAF1# python3
&gt;&gt;&gt; import json
&gt;&gt;&gt; from cli import clid
&gt;&gt;&gt; data = json.loads(clid('show interface brief'))
&gt;&gt;&gt; rows = data['TABLE_interface']['ROW_interface']
&gt;&gt;&gt; print([r['interface'] for r in rows if r['state'] == 'down'])</pre>
<pre class="out"><span class="hl">['Ethernet1/3', 'Ethernet1/9', 'Ethernet1/48']</span></pre>
<p>On-box scripts local kaamon ke liye ideal hain: Embedded Event Manager (EEM) se trigger hone wala check jab interface down ho, ya boot par chalne wali script. Bhaari tools ke liye <b>Guest Shell</b> switch par ek Linux container hai jahan aap NX-OS ko chhuye bina packages install kar sakte ho.</p>

<h3>Server se Python (off-box)</h3>
<p>Zyada tar automation server ya laptop par chalta hai aur bahut saare switches se baat karta hai. Common Python libraries hain <b>requests</b> (NX-API aur REST APIs, pichhle chapter jaisa), <b>ncclient</b> (NETCONF), <b>Netmiko</b> (SSH ke saath CLI jab API na ho) aur Cisco ka <b>pyATS/Genie</b> (test framework jiske parsers show output ko structured data mein badalte hain). Python maximum aazadi deta hai, lekin errors, retries, concurrency aur idempotency aapko khud handle karne padte hain.</p>

<h3>Ansible: agentless aur idempotent</h3>
<p><b>Ansible</b> ek control node se chalta hai aur devices se SSH (connection <code>ansible.netcommon.network_cli</code>) ya NX-API (connection <code>ansible.netcommon.h&#116;tpapi</code>) par connect karta hai. Switch par kuch install nahi hota, isi ko <b>agentless</b> kehte hain. Aap YAML mein <b>playbooks</b> likhte ho; har task ek <b>module</b> call karta hai. NX-OS ke modules <b>cisco.nxos</b> collection se aate hain; ACI ke <b>cisco.aci</b> se.</p>
<p><b>Inventory</b> batati hai ki kaunse devices hain aur unhe kaise reach karna hai:</p>
<pre class="code">all:
  children:
    leaves:
      hosts:
        leaf1:
          ansible_host: 10.10.10.1
        leaf2:
          ansible_host: 10.10.10.2
  vars:
    ansible_network_os: cisco.nxos.nxos
    ansible_connection: ansible.netcommon.network_cli
    ansible_user: automation</pre>
<p><b>Playbook</b> chahiya hua result describe karti hai:</p>
<pre class="code">- name: Standard VLANs on all leaves
  hosts: leaves
  gather_facts: false
  tasks:
    - name: Ensure VLANs exist with the right names
      cisco.nxos.nxos_vlans:
        config:
          - vlan_id: 10
            name: WEB
          - vlan_id: 20
            name: DB
          - vlan_id: 30
            name: APP
        state: merged

    - name: Save only if something changed
      cisco.nxos.nxos_config:
        save_when: modified</pre>
<pre class="out">TASK [Ensure VLANs exist with the right names] *****************
changed: [leaf1]
ok: [leaf2]
PLAY RECAP *****************************************************
<span class="hl">leaf1 : ok=2  changed=2  unreachable=0  failed=0</span>
leaf2 : ok=2  changed=0  unreachable=0  failed=0</pre>
<p>leaf1 par VLAN 30 missing tha, isliye woh badla; leaf2 pehle se sahi tha, isliye Ansible ne kuch nahi chhua. Playbook dobara chalao aur dono <code>changed=0</code> report karte hain. Yahi <b>idempotency</b> hai: play ek state describe karta hai, keystrokes ki list nahi. Bina badle yeh dekhne ke liye ki kya badlega, <code>--check --diff</code> use karo.</p>

<table class="cmp"><tr><th>Module (cisco.nxos)</th><th>Use</th></tr>
<tr><td><code>nxos_command</code></td><td>Show commands chalao aur output collect karo (read-only checks)</td></tr>
<tr><td><code>nxos_config</code></td><td>Configuration lines push karo; pehle running config se compare karta hai</td></tr>
<tr><td><code>nxos_facts</code></td><td>Version, interfaces, hardware aur bahut kuch gather karo</td></tr>
<tr><td><code>nxos_vlans</code>, <code>nxos_interfaces</code>, <code>nxos_l2_interfaces</code>, <code>nxos_l3_interfaces</code>, <code>nxos_bgp_global</code>, <code>nxos_acls</code></td><td><b>Resource modules</b>: structured data andar, merged, replaced, overridden, deleted aur gathered jaisi states ke saath</td></tr>
</table>
<p>Resource module ki <b>state</b> matter karti hai: <code>merged</code> jo aap list karte ho use add ya update karta hai; <code>replaced</code> har listed item ko bilkul match karata hai; <code>overridden</code> poore device ko aapki list se match karata hai aur <b>jo listed nahi hai sab hata deta hai</b>; <code>deleted</code> hatata hai; <code>gathered</code> current state ko structured data ki tarah padhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ansible, Terraform aur Python ki tulna">
<rect x="10" y="20" width="195" height="110" rx="8" fill="#bae6fd"/><text x="107" y="45" text-anchor="middle" class="svg-ink" font-size="14">Python</text><text x="107" y="70" text-anchor="middle" class="svg-muted" font-size="12">imperative: har step</text><text x="107" y="92" text-anchor="middle" class="svg-muted" font-size="12">poora control</text><text x="107" y="114" text-anchor="middle" class="svg-muted" font-size="12">errors aap sambhalo</text>
<rect x="222" y="20" width="195" height="110" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Ansible</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">YAML tasks, agentless</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">idempotent modules</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">state file nahi</text>
<rect x="435" y="20" width="195" height="110" rx="8" fill="#ddd6fe"/><text x="532" y="45" text-anchor="middle" class="svg-ink" font-size="14">Terraform</text><text x="532" y="70" text-anchor="middle" class="svg-muted" font-size="12">declarative HCL</text><text x="532" y="92" text-anchor="middle" class="svg-muted" font-size="12">pehle plan, phir apply</text><text x="532" y="114" text-anchor="middle" class="svg-muted" font-size="12">state file rakhta hai</text>
</svg><p class="cap">Teen tools, teen styles. Kai teams configuration ke liye Terraform ya Ansible aur checks aur glue ke liye Python use karti hain.</p></div>

<h3>ACI aur NDFC ke liye Terraform, concept level par</h3>
<p><b>Terraform</b> infrastructure ko <b>HCL</b> (HashiCorp Configuration Language) mein describe karta hai. <b>Providers</b> resources ko API calls mein translate karte hain; Cisco ACI, NX-OS (NX-API REST use karke), NDFC aur Intersight ke providers publish karta hai. Workflow hai <code>terraform init</code> (providers download), <code>terraform plan</code> (dikhao kya create, change ya destroy hoga), <code>terraform apply</code> (kar do) aur zaroorat ho to <code>terraform destroy</code>. Terraform jo manage karta hai use <b>state file</b> mein record karta hai; us state ko reality se compare karke woh drift pakadta hai aur code se hataye gaye objects delete karta hai.</p>
<pre class="code">resource "aci_tenant" "prod" {
  name = "PROD"
}

resource "aci_vrf" "prod_vrf" {
  tenant_dn = aci_tenant.prod.id
  name      = "PROD-VRF"
}</pre>
<p>VRF tenant ki ID ko refer karta hai, isliye Terraform jaanta hai ki pehle tenant banana hai. VRF block delete karo, plan chalao, aur Terraform "1 to destroy" dikhata hai.</p>

<div class="eg"><p><b>Worked example: tool chunna.</b> Task 1: har raat 120 leaves par badhte CRC errors wale interfaces check karo aur report post karo. Yeh read-only data collection aur logic hai, isliye NX-API ke saath Python (ya script ko feed karta Ansible <code>nxos_command</code> play) fit hai. Task 2: 120 leaves par VLANs aur SVIs ko Git ki YAML file ke hisaab se rakho. <code>merged</code> ke saath Ansible resource modules fit hain. Task 3: VRFs, BDs aur EPGs ke saath 30 ACI tenants banao, aur baad mein ek ko saaf tarah hata sako. ACI provider ke saath Terraform fit hai, kyunki uski state file bilkul jaanti hai ki usne kya banaya.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Configuration push karne ke liye <code>nxos_command</code> use karna (yeh idempotent nahi hai). <code>merged</code> matlab hote hue <code>overridden</code> chunna, aur list mein na hone wale VLANs delete kar dena. Passwords ko Ansible Vault ya secrets store ki jagah inventories mein plain text mein rakhna. Terraform ke banaye ACI ko haath se edit karna, taaki agla apply aapka manual change wapas "theek" kar de.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ansible <b>agentless</b> hai aur YAML playbooks use karta hai; network modules aam taur par control node par chalte hain. Terraform <b>declarative</b> hai, <b>state file</b> aur plan/apply workflow ke saath. On-box NX-OS Python <code>cli</code> module (<code>cli</code>, <code>clid</code>, <code>clip</code>) use karta hai.</p></div>

<div class="scn"><h4>Woh playbook jisne storage VLANs delete kar diye</h4><p>Ek team <code>state: overridden</code> wale Ansible play se VLANs maintain karti thi, aur uski YAML file mein sirf application VLANs the. Ek storage engineer ne iSCSI ke liye haath se VLANs 900 aur 901 jode the. Agli scheduled run ne unhe saare leaves se hata diya, aur do ESXi clusters ke datastores chale gaye. On-call engineer ne play ke diff output aur switch accounting log mein removal dekha, checkpoint se VLANs restore kiye, aur job pause kiya. Fix process ka tha: storage samet saare VLANs source-of-truth file mein aaye, aur daily runs ke liye state <code>merged</code> ki gayi, <code>overridden</code> sirf reviewed clean-up changes mein.</p><p><b>Seekh:</b> declarative tools bilkul wahi enforce karte hain jo aap declare karte ho; source of truth ke bahar ki har cheez khatre mein hai.</p></div>

<div class="iv"><p class="q">"Ansible mein idempotent ka kya matlab hai, aur aap kaise saabit karoge ki playbook idempotent hai?"</p><p>Strong answer: playbook baar baar chalane par same state par converge karti hai; dusri run <code>changed=0</code> report kare. Do baar chala kar (ya <code>--check --diff</code> ke saath) aur koi change na dikha kar saabit karo. Batao ki <code>nxos_vlans</code> jaise resource modules idempotent hain jabki <code>nxos_command</code> nahi, aur merged, replaced aur overridden ka farak samjhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>On-box Python <code>cli</code> module use karta hai; off-box Python requests, ncclient, Netmiko ya pyATS.</li>
<li>Ansible agentless hai, YAML inventories aur playbooks, aur cisco.nxos / cisco.aci collections use karta hai.</li>
<li>Resource modules idempotent hain; merged, replaced, overridden, deleted aur gathered jaano.</li>
<li>Terraform providers, plan/apply workflow aur state file ke saath declarative HCL hai.</li>
<li>Kaam ke hisaab se tool chuno: checks aur glue Python mein, device config Ansible mein, object lifecycles Terraform mein.</li>
</ul></div>
`}};export{e as default};