var e={id:`eos-resource`,h:{en:`EOS over eAPI (httpapi) and resource modules (Lab 1, step 7)`,hi:`EOS eAPI (httpapi) par aur resource modules (Lab 1, step 7)`},body:{en:`
<p>Arista EOS offers a clean API called <b>eAPI</b>: you send commands to a web address on the switch and get JSON back. The <code>httpapi</code> connection plugin speaks it, so the EOS modules receive structured data instead of screens of text. You will switch E1 to it, and then use a <b>resource module</b>, the modern way to say "these VLANs must exist" without writing CLI.</p>

<h3>Switch E1 to httpapi</h3>
<pre class="code"><span class="c"># group_vars/eos.yml</span>
ansible_network_os: arista.eos.eos
ansible_connection: ansible.netcommon.httpapi
ansible_httpapi_use_ssl: true
ansible_httpapi_validate_certs: false</pre>
<p>Three lines matter. The connection is <code>httpapi</code>. <code>use_ssl: true</code> moves the plugin from port 80 to port 443, because the switch listens for eAPI on its HTTPS port only (<code>management api h&#116;tp-commands</code> with <code>protocol https</code>). <code>validate_certs: false</code> accepts the switch's self-signed certificate. That last line is a <b>lab shortcut</b>: on real equipment you install the certificate authority that signed the switch certificate on the control node and leave validation on. Chapter 9 shows what happens when either line is missing.</p>
<p>The facts module confirms which API it used:</p>
<pre class="out">TASK [What did we learn] ******************************************************
ok: [E1] =&gt; {
    "msg": "eapi HYD-LEAF-E1 4.31.4M"
}</pre>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="A resource module compares wanted and current state">
<rect x="8" y="14" width="150" height="50" rx="10" fill="#bae6fd"/><text x="83" y="38" text-anchor="middle" class="svg-ink" font-size="12">config: (wanted)</text><text x="83" y="54" text-anchor="middle" class="svg-muted" font-size="11">VLAN 110 USERS</text>
<rect x="8" y="94" width="150" height="50" rx="10" fill="#fde68a"/><text x="83" y="118" text-anchor="middle" class="svg-ink" font-size="12">gathered (current)</text><text x="83" y="134" text-anchor="middle" class="svg-muted" font-size="11">read from E1</text>
<rect x="230" y="54" width="170" height="52" rx="10" fill="#ddd6fe"/><text x="315" y="84" text-anchor="middle" class="svg-ink" font-size="13">eos_vlans: state</text>
<rect x="470" y="14" width="162" height="40" rx="10" fill="#bbf7d0"/><text x="551" y="39" text-anchor="middle" class="svg-ink" font-size="12">commands (the diff)</text>
<rect x="470" y="60" width="162" height="40" rx="10" fill="#e2e8f0"/><text x="551" y="85" text-anchor="middle" class="svg-ink" font-size="12">before</text>
<rect x="470" y="106" width="162" height="40" rx="10" fill="#e2e8f0"/><text x="551" y="131" text-anchor="middle" class="svg-ink" font-size="12">after</text>
<line x1="158" y1="40" x2="230" y2="72" stroke="#64748b" stroke-width="2"/><line x1="158" y1="118" x2="230" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="72" x2="470" y2="34" stroke="#64748b" stroke-width="2"/><line x1="400" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="88" x2="470" y2="126" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A resource module reads the current state, compares it with your data, and returns the commands needed to close the gap.</p></div>

<h3>A resource module: eos_vlans</h3>
<p>Instead of lines of CLI you give <b>data</b>: a list of VLANs, each with an ID and a name.</p>
<pre class="code"><span class="c"># vlans.yml</span>
---
- name: VLANs on EOS over eAPI
  hosts: eos
  gather_facts: false
  tasks:
    - name: Merge the access VLANs
      arista.eos.eos_vlans:
        config:
          - vlan_id: 110
            name: USERS
          - vlan_id: 120
            name: VOICE
        state: merged
      register: v

    - name: Commands sent
      ansible.builtin.debug:
        var: v.commands</pre>
<pre class="out">AUTO01$ ansible-playbook vlans.yml
TASK [Merge the access VLANs] *************************************************
changed: [E1]
TASK [Commands sent] **********************************************************
ok: [E1] =&gt; {
    "v.commands": [
        <span class="hl">"vlan 110",
        "name USERS",
        "vlan 120",
        "name VOICE"</span>
    ]
}
AUTO01$ ansible-playbook vlans.yml
TASK [Merge the access VLANs] *************************************************
ok: [E1]
TASK [Commands sent] **********************************************************
ok: [E1] =&gt; {
    "v.commands": []
}</pre>
<p>Four commands on the first run, an empty list on the second: the module is idempotent by construction, because it compares data with the device before it sends anything. Every resource module returns <code>before</code> (state when it started), <code>commands</code> (what it sends or would send) and <code>after</code> (state at the end; not returned in check mode).</p>

<h3>The states</h3>
<table class="cmp"><tr><th>state</th><th>What it does</th></tr>
<tr><td><code>merged</code></td><td>Add or update what you list; leave everything else alone (default).</td></tr>
<tr><td><code>replaced</code></td><td>For each item you list, make the device match exactly; items you do not list stay.</td></tr>
<tr><td><code>overridden</code></td><td>The device ends up with exactly your list; anything else is removed.</td></tr>
<tr><td><code>deleted</code></td><td>Remove the listed items.</td></tr>
<tr><td><code>gathered</code></td><td>Read the device and return the data; changes nothing.</td></tr>
<tr><td><code>rendered</code></td><td>Turn your data into commands; needs no device state.</td></tr>
<tr><td><code>parsed</code></td><td>Turn configuration text (<code>running_config</code>) into data.</td></tr></table>
<pre class="out">TASK [replaced commands] ******************************************************
ok: [E1] =&gt; {
    "rp.commands": [
        "vlan 120",
        "name VOICE-PHONES"
    ]
}
TASK [gathered] ***************************************************************
ok: [E1] =&gt; {
    "g.gathered": [
        {
            "name": "USERS",
            "state": "active",
            "vlan_id": 110
        },
        {
            "name": "VOICE-PHONES",
            "state": "active",
            "vlan_id": 120
        }
    ]
}
TASK [rendered] ***************************************************************
ok: [E1] =&gt; {
    "rd.rendered": [
        "vlan 130",
        "name GUEST"
    ]
}
TASK [Overridden commands] ****************************************************
ok: [E1] =&gt; {
    <span class="hl">"ov.commands": [
        "no vlan 120"
    ]</span>
}</pre>
<p>The last result is the dangerous one: <code>overridden</code> with only VLAN 110 in the list removed VLAN 120. Use <code>overridden</code> only when your data is the complete truth. <code>gathered</code> turns a live switch into data you can compare with your intent, and <code>rendered</code> lets you test your data without a device.</p>

<h3>Which resource modules exist here</h3>
<table class="cmp"><tr><th>Platform</th><th>Modules in the lab</th></tr>
<tr><td>Junos</td><td><code>junos_hostname</code>, <code>junos_ntp_global</code>, <code>junos_logging_global</code>, <code>junos_interfaces</code>, <code>junos_vlans</code>, <code>junos_ospfv2</code></td></tr>
<tr><td>EOS</td><td><code>eos_vlans</code>, <code>eos_interfaces</code>, <code>eos_hostname</code>, <code>eos_ntp_global</code></td></tr>
<tr><td>IOS XE</td><td><code>ios_ntp_global</code>, <code>ios_hostname</code>, <code>ios_interfaces</code>, <code>ios_l3_interfaces</code>, <code>ios_ospfv2</code>, <code>ios_logging_global</code></td></tr>
<tr><td>NX-OS</td><td><code>nxos_vlans</code>, <code>nxos_hostname</code>, <code>nxos_ntp_global</code></td></tr></table>
<p>The data keys are close across vendors but not identical, so read <code>ansible-doc</code> for each module. Real collections have many more resource modules and option keys than the lab implements.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab implements a subset of each module's option tree. Keys the lab does not implement are ignored without error, so always check <code>ansible-doc</code> and run on real gear before trusting a rarely used key. A wrong state gives <i>value of state must be one of: merged, replaced, overridden, deleted, gathered, rendered, parsed, got: foo</i>, and merged without config gives <i>state is merged but all of the following are missing: config</i>.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using <code>state: overridden</code> (or <code>replaced</code>) with a partial list on a production device. Run it first with <code>--check</code> and read <code>commands</code>: if you see <code>no vlan ...</code> lines you did not expect, your data is incomplete.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>merged</code> adds, <code>replaced</code> fixes the items you list, <code>overridden</code> makes the device equal to your list. <code>gathered</code>, <code>rendered</code> and <code>parsed</code> never change the device.</p></div>

<div class="scn"><h4>Inventory of VLANs, as data</h4><p>A campus team kept 150 VLANs in a YAML file. They ran <code>eos_vlans</code> with <code>state: gathered</code> on each switch, compared the result with the file and found three switches carrying VLANs that were not in the file. They fixed the file or the switch case by case, then ran <code>merged</code> in check mode weekly as a drift report.</p><p><b>Lesson:</b> resource modules turn configuration into data you can diff, review and keep in Git.</p></div>
<div class="iv"><p class="q">"What is an Ansible resource module and why use one?"</p><p>A module that manages one feature, for example VLANs, from structured data with a state such as merged or overridden. It reads the device, computes the difference and sends only that, so it is idempotent and works the same across <code>--check</code>, <code>gathered</code> and <code>rendered</code>. It avoids hand-written CLI lines.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>httpapi needs <code>use_ssl: true</code> for port 443 and either a trusted certificate or (lab only) <code>validate_certs: false</code>.</li>
<li>Resource modules take data and a <code>state</code>, and return <code>before</code>, <code>commands</code>, <code>after</code>.</li>
<li><code>overridden</code> removes anything not in your list: use it only with complete data.</li>
<li><code>gathered</code>, <code>rendered</code> and <code>parsed</code> are read-only helpers.</li>
<li>Read <code>ansible-doc</code> for each platform's keys; they are similar, not identical.</li></ul></div>
`,hi:`
<p>Arista EOS ek saaf API deta hai jise <b>eAPI</b> kehte hain: aap switch ke web address par commands bhejte ho aur JSON wapas milta hai. <code>httpapi</code> connection plugin use bolta hai, isliye EOS modules ko text ki screens ki jagah structured data milta hai. Aap E1 ko isi par le jaoge, phir ek <b>resource module</b> use karoge, jo "yeh VLANs honi chahiye" kehne ka modern tareeka hai bina CLI likhe.</p>

<h3>E1 ko httpapi par switch karo</h3>
<pre class="code"><span class="c"># group_vars/eos.yml</span>
ansible_network_os: arista.eos.eos
ansible_connection: ansible.netcommon.httpapi
ansible_httpapi_use_ssl: true
ansible_httpapi_validate_certs: false</pre>
<p>Teen lines maayne rakhti hain. Connection <code>httpapi</code> hai. <code>use_ssl: true</code> plugin ko port 80 se port 443 par le jaata hai, kyunki switch eAPI sirf apne HTTPS port par sunta hai (<code>management api h&#116;tp-commands</code> aur <code>protocol https</code>). <code>validate_certs: false</code> switch ka self-signed certificate accept karta hai. Aakhri line ek <b>lab shortcut</b> hai: real equipment par aap woh certificate authority control node par install karte ho jisne switch certificate sign kiya aur validation on rakhte ho. Chapter 9 dikhata hai ki in mein se koi ek line na ho to kya hota hai.</p>
<p>Facts module confirm karta hai ki kaunsi API use hui:</p>
<pre class="out">TASK [What did we learn] ******************************************************
ok: [E1] =&gt; {
    "msg": "eapi HYD-LEAF-E1 4.31.4M"
}</pre>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Resource module wanted aur current state compare karta hai">
<rect x="8" y="14" width="150" height="50" rx="10" fill="#bae6fd"/><text x="83" y="38" text-anchor="middle" class="svg-ink" font-size="12">config: (wanted)</text><text x="83" y="54" text-anchor="middle" class="svg-muted" font-size="11">VLAN 110 USERS</text>
<rect x="8" y="94" width="150" height="50" rx="10" fill="#fde68a"/><text x="83" y="118" text-anchor="middle" class="svg-ink" font-size="12">gathered (current)</text><text x="83" y="134" text-anchor="middle" class="svg-muted" font-size="11">E1 se padha</text>
<rect x="230" y="54" width="170" height="52" rx="10" fill="#ddd6fe"/><text x="315" y="84" text-anchor="middle" class="svg-ink" font-size="13">eos_vlans: state</text>
<rect x="470" y="14" width="162" height="40" rx="10" fill="#bbf7d0"/><text x="551" y="39" text-anchor="middle" class="svg-ink" font-size="12">commands (the diff)</text>
<rect x="470" y="60" width="162" height="40" rx="10" fill="#e2e8f0"/><text x="551" y="85" text-anchor="middle" class="svg-ink" font-size="12">before</text>
<rect x="470" y="106" width="162" height="40" rx="10" fill="#e2e8f0"/><text x="551" y="131" text-anchor="middle" class="svg-ink" font-size="12">after</text>
<line x1="158" y1="40" x2="230" y2="72" stroke="#64748b" stroke-width="2"/><line x1="158" y1="118" x2="230" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="72" x2="470" y2="34" stroke="#64748b" stroke-width="2"/><line x1="400" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="88" x2="470" y2="126" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Resource module current state padhta hai, use aapke data se compare karta hai, aur gap band karne wale commands lautata hai.</p></div>

<h3>Resource module: eos_vlans</h3>
<p>CLI ki lines ki jagah aap <b>data</b> dete ho: VLANs ki list, har ek ka ID aur naam.</p>
<pre class="code"><span class="c"># vlans.yml</span>
---
- name: VLANs on EOS over eAPI
  hosts: eos
  gather_facts: false
  tasks:
    - name: Merge the access VLANs
      arista.eos.eos_vlans:
        config:
          - vlan_id: 110
            name: USERS
          - vlan_id: 120
            name: VOICE
        state: merged
      register: v

    - name: Commands sent
      ansible.builtin.debug:
        var: v.commands</pre>
<pre class="out">AUTO01$ ansible-playbook vlans.yml
TASK [Merge the access VLANs] *************************************************
changed: [E1]
TASK [Commands sent] **********************************************************
ok: [E1] =&gt; {
    "v.commands": [
        <span class="hl">"vlan 110",
        "name USERS",
        "vlan 120",
        "name VOICE"</span>
    ]
}
AUTO01$ ansible-playbook vlans.yml
TASK [Merge the access VLANs] *************************************************
ok: [E1]
TASK [Commands sent] **********************************************************
ok: [E1] =&gt; {
    "v.commands": []
}</pre>
<p>Pehle run mein chaar commands, doosre mein khaali list: module design se idempotent hai, kyunki kuch bhejne se pehle woh data ko device se compare karta hai. Har resource module <code>before</code> (shuru mein state), <code>commands</code> (jo bheje ya bhejta) aur <code>after</code> (aakhir ki state; check mode mein nahi milti) lautata hai.</p>

<h3>States</h3>
<table class="cmp"><tr><th>state</th><th>Kya karta hai</th></tr>
<tr><td><code>merged</code></td><td>Jo list karo woh jodo ya update karo; baaki ko chhedo mat (default).</td></tr>
<tr><td><code>replaced</code></td><td>Jo item list karo uske liye device ko bilkul match karao; jo list nahi kiye woh rehte hain.</td></tr>
<tr><td><code>overridden</code></td><td>Device ke paas bilkul aapki list hogi; baaki sab hat jaata hai.</td></tr>
<tr><td><code>deleted</code></td><td>List kiye items hatao.</td></tr>
<tr><td><code>gathered</code></td><td>Device padho aur data lautao; kuch nahi badalta.</td></tr>
<tr><td><code>rendered</code></td><td>Aapke data ko commands mein badlo; device state nahi chahiye.</td></tr>
<tr><td><code>parsed</code></td><td>Configuration text (<code>running_config</code>) ko data mein badlo.</td></tr></table>
<pre class="out">TASK [replaced commands] ******************************************************
ok: [E1] =&gt; {
    "rp.commands": [
        "vlan 120",
        "name VOICE-PHONES"
    ]
}
TASK [gathered] ***************************************************************
ok: [E1] =&gt; {
    "g.gathered": [
        {
            "name": "USERS",
            "state": "active",
            "vlan_id": 110
        },
        {
            "name": "VOICE-PHONES",
            "state": "active",
            "vlan_id": 120
        }
    ]
}
TASK [rendered] ***************************************************************
ok: [E1] =&gt; {
    "rd.rendered": [
        "vlan 130",
        "name GUEST"
    ]
}
TASK [Overridden commands] ****************************************************
ok: [E1] =&gt; {
    <span class="hl">"ov.commands": [
        "no vlan 120"
    ]</span>
}</pre>
<p>Aakhri result khatarnak wala hai: list mein sirf VLAN 110 ke saath <code>overridden</code> ne VLAN 120 hata di. <code>overridden</code> tabhi use karo jab aapka data poori sachchai ho. <code>gathered</code> live switch ko aise data mein badalta hai jise aap apne intent se compare kar sako, aur <code>rendered</code> bina device ke data test karne deta hai.</p>

<h3>Yahan kaunse resource modules hain</h3>
<table class="cmp"><tr><th>Platform</th><th>Lab ke modules</th></tr>
<tr><td>Junos</td><td><code>junos_hostname</code>, <code>junos_ntp_global</code>, <code>junos_logging_global</code>, <code>junos_interfaces</code>, <code>junos_vlans</code>, <code>junos_ospfv2</code></td></tr>
<tr><td>EOS</td><td><code>eos_vlans</code>, <code>eos_interfaces</code>, <code>eos_hostname</code>, <code>eos_ntp_global</code></td></tr>
<tr><td>IOS XE</td><td><code>ios_ntp_global</code>, <code>ios_hostname</code>, <code>ios_interfaces</code>, <code>ios_l3_interfaces</code>, <code>ios_ospfv2</code>, <code>ios_logging_global</code></td></tr>
<tr><td>NX-OS</td><td><code>nxos_vlans</code>, <code>nxos_hostname</code>, <code>nxos_ntp_global</code></td></tr></table>
<p>Data keys vendors mein kareeb hain par ek jaise nahi, isliye har module ke liye <code>ansible-doc</code> padho. Real collections mein lab se kahin zyada resource modules aur option keys hain.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> Lab har module ke option tree ka ek subset implement karta hai. Jo keys lab implement nahi karta unhe bina error ke ignore kiya jaata hai, isliye kam use hone wali key par bharosa karne se pehle <code>ansible-doc</code> dekho aur real gear par chalao. Galat state par <i>value of state must be one of: merged, replaced, overridden, deleted, gathered, rendered, parsed, got: foo</i> milta hai, aur config ke bina merged par <i>state is merged but all of the following are missing: config</i>.</p></div>
<div class="warn"><p><b>Common mistake.</b> Production device par adhoori list ke saath <code>state: overridden</code> (ya <code>replaced</code>) use karna. Pehle <code>--check</code> se chalao aur <code>commands</code> padho: agar aise <code>no vlan ...</code> lines dikhein jinki aapko umeed nahi thi, to aapka data adhoora hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>merged</code> jodta hai, <code>replaced</code> aapke list kiye items theek karta hai, <code>overridden</code> device ko aapki list ke barabar banata hai. <code>gathered</code>, <code>rendered</code> aur <code>parsed</code> device ko kabhi nahi badalte.</p></div>

<div class="scn"><h4>VLANs ki inventory, data ki tarah</h4><p>Ek campus team ne 150 VLANs ek YAML file mein rakhi thi. Unhone har switch par <code>eos_vlans</code> ko <code>state: gathered</code> se chalaya, result file se compare kiya aur teen switches par aisi VLANs mili jo file mein nahi thi. Case by case unhone file ya switch theek kiya, phir har hafte <code>merged</code> ko check mode mein drift report ki tarah chalaya.</p><p><b>Lesson:</b> resource modules configuration ko aise data mein badalte hain jise aap diff, review aur Git mein rakh sakte ho.</p></div>
<div class="iv"><p class="q">"Ansible resource module kya hai aur ise kyon use karte hain?"</p><p>Aisa module jo ek feature, jaise VLANs, ko structured data aur state (merged ya overridden) se manage karta hai. Woh device padhta hai, farq nikalta hai aur sirf wahi bhejta hai, isliye idempotent hai aur <code>--check</code>, <code>gathered</code> aur <code>rendered</code> ke saath ek jaisa chalta hai. Haath se CLI lines likhne se bachata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>httpapi ko port 443 ke liye <code>use_ssl: true</code> chahiye aur ya trusted certificate ya (sirf lab mein) <code>validate_certs: false</code>.</li>
<li>Resource modules data aur <code>state</code> lete hain, aur <code>before</code>, <code>commands</code>, <code>after</code> lautate hain.</li>
<li><code>overridden</code> woh sab hata deta hai jo aapki list mein nahi: sirf poore data ke saath use karo.</li>
<li><code>gathered</code>, <code>rendered</code> aur <code>parsed</code> read-only helpers hain.</li>
<li>Har platform ki keys ke liye <code>ansible-doc</code> padho; woh milti-julti hain, ek jaisi nahi.</li></ul></div>
`}};export{e as default};