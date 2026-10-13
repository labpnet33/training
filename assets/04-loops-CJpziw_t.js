var e={id:`loops`,h:{en:`Loops in templates: VLANs, interfaces and servers`,hi:`Templates mein loops: VLANs, interfaces aur servers`},body:{en:`
<p><b>One idea in this chapter:</b> a <code>{% for %}</code> loop repeats a block of text once for every item in a list. This is how one template can produce 3 VLANs on one switch and 30 on another.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="A for loop repeats a block once per list item">
<rect x="20" y="30" width="180" height="110" rx="10" fill="#bae6fd"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="13">vlans (a list)</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="12">10 USERS</text><text x="110" y="100" text-anchor="middle" class="svg-muted" font-size="12">20 VOICE</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="12">99 MGMT</text>
<rect x="250" y="55" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">for vlan in vlans</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">repeat the block</text>
<rect x="440" y="30" width="180" height="110" rx="10" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">config</text><text x="530" y="80" text-anchor="middle" class="svg-muted" font-size="12">vlan 10 / name USERS</text><text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">vlan 20 / name VOICE</text><text x="530" y="120" text-anchor="middle" class="svg-muted" font-size="12">vlan 99 / name MGMT</text>
<line x1="200" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="390" y1="85" x2="440" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One block of template text, repeated for each list item.</p></div>

<h3>The data: a list of dictionaries</h3>
<p>Network data is naturally a list of things that each have several fields. In YAML (the file format of host_vars) a VLAN list looks like this. Each line starting with a dash is one item, and the braces hold named fields:</p>
<pre class="code"><span class="c"># host_vars/pun-core-r1.yml (part)</span>
vlans:
  - {id: 10, name: USERS}
  - {id: 20, name: VOICE}
  - {id: 99, name: MGMT}
interfaces:
  - {name: GigabitEthernet0/1, desc: To-BLR-EDGE-R2, ip: 192.0.2.1, mask: 255.255.255.252}
  - {name: GigabitEthernet0/2, enabled: false}
  - {name: GigabitEthernet0/3, desc: To-DC-firewall, ip: 192.0.2.5, mask: 255.255.255.252}</pre>

<h3>The loop</h3>
<pre class="code"><span class="c"># templates/loops.j2</span>
{% for vlan in vlans %}
vlan {{ vlan.id }}
 name {{ vlan.name }}
{% endfor %}
{% for server in ntp_servers %}
! NTP {{ loop.index }} of {{ loop.length }}: {{ server }}{{ ' (last)' if loop.last }}
{% endfor %}
{% for iface in interfaces %}
interface {{ iface.name }}
{% if iface.ip is defined %}
 ip address {{ iface.ip }} {{ iface.mask }}
{% endif %}
{% endfor %}
switchport trunk allowed vlan {% for v in vlans %}{{ v.id }}{{ ',' if not loop.last }}{% endfor %}

{% for s in snmp_hosts | default([]) %}
snmp-server host {{ s }}
{% else %}
! no SNMP hosts defined
{% endfor %}</pre>
<p>Read the first loop in words: <i>for each item in vlans, call it vlan; print the text up to endfor.</i> Inside the loop, <code>vlan.id</code> and <code>vlan.name</code> reach the fields. Rendering it for <code>pun-core-r1</code> gives:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=loops.j2
...
netadmin@auto01:~/netauto$ cat configs/pun-core-r1.cfg
vlan 10
 name USERS
vlan 20
 name VOICE
vlan 99
 name MGMT
! NTP <span class="hl">1 of 1</span>: 10.99.0.60<span class="hl"> (last)</span>
interface GigabitEthernet0/1
 ip address 192.0.2.1 255.255.255.252
interface GigabitEthernet0/2
interface GigabitEthernet0/3
 ip address 192.0.2.5 255.255.255.252
switchport trunk allowed vlan <span class="hl">10,20,99</span>
<span class="hl">! no SNMP hosts defined</span></pre>

<h3>The loop variable</h3>
<p>Inside a loop Ansible gives you a helper called <code>loop</code>:</p>
<ul>
<li><code>loop.index</code> counts from 1, <code>loop.index0</code> from 0.</li>
<li><code>loop.first</code> and <code>loop.last</code> are true on the first and last pass.</li>
<li><code>loop.length</code> is the number of items.</li>
</ul>
<p>The trunk line uses <code>loop.last</code> to avoid a trailing comma: print a comma after every VLAN except the last. A filter can do the same in one expression (chapter 6): <code>{{ vlans | map(attribute='id') | join(',') }}</code>.</p>

<h3>for ... else, and looping over a dictionary</h3>
<p>An <code>{% else %}</code> inside a loop runs only when the list is empty. The last loop above found no <code>snmp_hosts</code> variable, so <code>default([])</code> gave an empty list and the else branch printed a comment. To loop over a dictionary use <code>.items()</code>, which hands you the name and the value of each entry. With <code>loopbacks: {lo0: 10.255.255.2, lo1: 10.255.254.2}</code> the line <code>! {{ loop.index }}/{{ loop.length }} {{ name }} {{ ip }}</code> inside <code>{% for name, ip in loopbacks.items() %}</code> prints:</p>
<pre class="out">! 1/2 lo0 10.255.255.2
! 2/2 lo1 10.255.254.2</pre>

<h3>Whitespace: why the output has no blank lines</h3>
<p>Ansible turns on a Jinja2 setting called <code>trim_blocks</code>. It removes the first newline after every <code>{% ... %}</code> tag, so the tag lines vanish from the output. That is why each loop above leaves no empty lines. You can also put a minus sign inside a tag, <code>{%- ... -%}</code>, to strip the spaces and newlines on that side. The trunk line shows a catch: because the newline after <code>{% endfor %}</code> is trimmed, the blank line in the template is what ends the <code>switchport</code> line.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>{% endfor %}</code> (the error says "Jinja was looking for the following tags: 'endfor' or 'else'"); reading a field that some items lack (<code>iface.ip</code> on the spare port; guard it with <code>is defined</code>, next chapter); looping over a string by accident, which gives single letters.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>loop.index</code> starts at 1, <code>loop.index0</code> at 0. Also remember the loop variable exists only inside the loop.</p></div>

<div class="scn"><h4>Thirty VLANs, no copy-paste</h4><p>A campus switch needed 30 VLANs and the old runbook had 30 hand-typed blocks. One block had <code>name VOCIE</code>. After the VLAN list moved into host_vars and a six-line loop replaced the blocks, the typo was fixed in one data line and every switch got the right name on the next run.</p><p><b>Lesson:</b> data in a list, logic in a loop, and typos live in one place only.</p></div>

<div class="iv"><p class="q">"How do you generate repeated config such as VLANs or interfaces from a template?"</p><p>Store them as a list of dictionaries in host_vars or group_vars and loop with a for tag. Use loop.first, loop.last and loop.index when position matters, an else branch for empty lists, and .items() for dictionaries.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>for ... endfor repeats text once per list item.</li>
<li>Lists of dictionaries match network data well; use item.field to read a field.</li>
<li>loop.index, loop.first, loop.last and loop.length help with position.</li>
<li>else runs for an empty list; .items() loops over dictionaries.</li>
<li>Ansible trims the newline after tag lines, so tag lines leave no blanks.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> <code>{% for %}</code> loop text ke ek block ko list ke har item ke liye ek baar repeat karta hai. Isi se ek template ek switch par 3 VLANs aur doosre par 30 bana sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="for loop list ke har item ke liye block repeat karta hai">
<rect x="20" y="30" width="180" height="110" rx="10" fill="#bae6fd"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="13">vlans (ek list)</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="12">10 USERS</text><text x="110" y="100" text-anchor="middle" class="svg-muted" font-size="12">20 VOICE</text><text x="110" y="120" text-anchor="middle" class="svg-muted" font-size="12">99 MGMT</text>
<rect x="250" y="55" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">for vlan in vlans</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">block repeat karo</text>
<rect x="440" y="30" width="180" height="110" rx="10" fill="#bbf7d0"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">config</text><text x="530" y="80" text-anchor="middle" class="svg-muted" font-size="12">vlan 10 / name USERS</text><text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">vlan 20 / name VOICE</text><text x="530" y="120" text-anchor="middle" class="svg-muted" font-size="12">vlan 99 / name MGMT</text>
<line x1="200" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="390" y1="85" x2="440" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Template text ka ek block, har list item ke liye repeat.</p></div>

<h3>Data: dictionaries ki list</h3>
<p>Network data aise cheezon ki list hota hai jinme har ek ke kai fields hote hain. YAML mein (host_vars ka file format) VLAN list aisi dikhti hai. Dash se shuru har line ek item hai, aur braces mein naam wale fields hain:</p>
<pre class="code"><span class="c"># host_vars/pun-core-r1.yml (hissa)</span>
vlans:
  - {id: 10, name: USERS}
  - {id: 20, name: VOICE}
  - {id: 99, name: MGMT}
interfaces:
  - {name: GigabitEthernet0/1, desc: To-BLR-EDGE-R2, ip: 192.0.2.1, mask: 255.255.255.252}
  - {name: GigabitEthernet0/2, enabled: false}
  - {name: GigabitEthernet0/3, desc: To-DC-firewall, ip: 192.0.2.5, mask: 255.255.255.252}</pre>

<h3>Loop</h3>
<pre class="code"><span class="c"># templates/loops.j2</span>
{% for vlan in vlans %}
vlan {{ vlan.id }}
 name {{ vlan.name }}
{% endfor %}
{% for server in ntp_servers %}
! NTP {{ loop.index }} of {{ loop.length }}: {{ server }}{{ ' (last)' if loop.last }}
{% endfor %}
{% for iface in interfaces %}
interface {{ iface.name }}
{% if iface.ip is defined %}
 ip address {{ iface.ip }} {{ iface.mask }}
{% endif %}
{% endfor %}
switchport trunk allowed vlan {% for v in vlans %}{{ v.id }}{{ ',' if not loop.last }}{% endfor %}

{% for s in snmp_hosts | default([]) %}
snmp-server host {{ s }}
{% else %}
! no SNMP hosts defined
{% endfor %}</pre>
<p>Pehla loop shabdon mein padho: <i>vlans ke har item ke liye, use vlan kaho; endfor tak ka text print karo.</i> Loop ke andar <code>vlan.id</code> aur <code>vlan.name</code> fields tak pahunchte hain. <code>pun-core-r1</code> ke liye render karne par:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=loops.j2
...
netadmin@auto01:~/netauto$ cat configs/pun-core-r1.cfg
vlan 10
 name USERS
vlan 20
 name VOICE
vlan 99
 name MGMT
! NTP <span class="hl">1 of 1</span>: 10.99.0.60<span class="hl"> (last)</span>
interface GigabitEthernet0/1
 ip address 192.0.2.1 255.255.255.252
interface GigabitEthernet0/2
interface GigabitEthernet0/3
 ip address 192.0.2.5 255.255.255.252
switchport trunk allowed vlan <span class="hl">10,20,99</span>
<span class="hl">! no SNMP hosts defined</span></pre>

<h3>Loop variable</h3>
<p>Loop ke andar Ansible <code>loop</code> naam ka helper deta hai:</p>
<ul>
<li><code>loop.index</code> 1 se ginta hai, <code>loop.index0</code> 0 se.</li>
<li><code>loop.first</code> aur <code>loop.last</code> pehle aur aakhri pass par true hote hain.</li>
<li><code>loop.length</code> items ki sankhya hai.</li>
</ul>
<p>Trunk line <code>loop.last</code> se aakhir mein extra comma rokti hai: aakhri VLAN ko chhodkar har VLAN ke baad comma print karo. Filter yehi ek expression mein kar sakta hai (chapter 6): <code>{{ vlans | map(attribute='id') | join(',') }}</code>.</p>

<h3>for ... else, aur dictionary par loop</h3>
<p>Loop ke andar <code>{% else %}</code> sirf tab chalta hai jab list khaali ho. Upar ke aakhri loop ko <code>snmp_hosts</code> variable mila hi nahi, isliye <code>default([])</code> ne khaali list di aur else branch ne comment print kiya. Dictionary par loop ke liye <code>.items()</code> use karo, jo har entry ka naam aur value deta hai. <code>loopbacks: {lo0: 10.255.255.2, lo1: 10.255.254.2}</code> ke saath <code>{% for name, ip in loopbacks.items() %}</code> ke andar line <code>! {{ loop.index }}/{{ loop.length }} {{ name }} {{ ip }}</code> yeh print karti hai:</p>
<pre class="out">! 1/2 lo0 10.255.255.2
! 2/2 lo1 10.255.254.2</pre>

<h3>Whitespace: output mein blank lines kyun nahi</h3>
<p>Ansible Jinja2 ki setting <code>trim_blocks</code> on rakhta hai. Yeh har <code>{% ... %}</code> tag ke baad ki pehli newline hata deta hai, isliye tag lines output se gayab ho jaati hain. Isi wajah se upar ke loops khaali lines nahi chhodte. Tag ke andar minus sign, <code>{%- ... -%}</code>, us taraf ke spaces aur newlines hata deta hai. Trunk line ek catch dikhati hai: <code>{% endfor %}</code> ke baad ki newline trim ho jaati hai, isliye template ki blank line hi <code>switchport</code> line ko khatam karti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>{% endfor %}</code> bhool jaana (error kehta hai "Jinja was looking for the following tags: 'endfor' or 'else'"); aisa field padhna jo kuch items mein nahi hai (spare port par <code>iface.ip</code>; <code>is defined</code> se guard karo, agla chapter); galti se string par loop karna, jisse single letters milte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>loop.index</code> 1 se shuru hota hai, <code>loop.index0</code> 0 se. Yeh bhi yaad rakho ki loop variable sirf loop ke andar hota hai.</p></div>

<div class="scn"><h4>Tees VLANs, copy-paste nahi</h4><p>Ek campus switch ko 30 VLANs chahiye the aur purane runbook mein 30 haath se type kiye blocks the. Ek block mein <code>name VOCIE</code> tha. VLAN list host_vars mein jaane aur chhah line ke loop ne blocks ki jagah lene ke baad, typo data ki ek line mein theek hua aur agle run par har switch ko sahi naam mila.</p><p><b>Lesson:</b> data list mein, logic loop mein, aur typos sirf ek jagah rehte hain.</p></div>

<div class="iv"><p class="q">"Template se VLANs ya interfaces jaisa repeated config kaise banate ho?"</p><p>Unhe host_vars ya group_vars mein dictionaries ki list ki tarah rakho aur for tag se loop karo. Position matter kare to loop.first, loop.last aur loop.index, khaali list ke liye else branch, aur dictionaries ke liye .items() use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>for ... endfor text ko list ke har item ke liye ek baar repeat karta hai.</li>
<li>Dictionaries ki list network data se match karti hai; field padhne ke liye item.field.</li>
<li>loop.index, loop.first, loop.last aur loop.length position mein madad karte hain.</li>
<li>else khaali list ke liye chalta hai; .items() dictionaries par loop karta hai.</li>
<li>Ansible tag lines ke baad ki newline trim karta hai, isliye tag lines blank nahi chhodti.</li>
</ul></div>
`}};export{e as default};