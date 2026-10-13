var e={id:`filters`,h:{en:`Filters: reshaping data with the pipe`,hi:`Filters: pipe se data ka roop badalna`},body:{en:`
<p><b>One idea in this chapter:</b> a <b>filter</b> is a small tool that changes a value on its way into the output. You attach it with the pipe sign, <code>|</code>, exactly like a Linux pipe: the value on the left goes into the filter on the right.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Filters chained with pipes">
<rect x="20" y="35" width="130" height="50" rx="10" fill="#bae6fd"/><text x="85" y="58" text-anchor="middle" class="svg-ink" font-size="12">vlans</text><text x="85" y="74" text-anchor="middle" class="svg-muted" font-size="11">list of 3 dicts</text>
<rect x="190" y="35" width="130" height="50" rx="10" fill="#fde68a"/><text x="255" y="58" text-anchor="middle" class="svg-ink" font-size="12">map(attribute='id')</text><text x="255" y="74" text-anchor="middle" class="svg-muted" font-size="11">10, 20, 99</text>
<rect x="360" y="35" width="110" height="50" rx="10" fill="#fde68a"/><text x="415" y="58" text-anchor="middle" class="svg-ink" font-size="12">join(',')</text><text x="415" y="74" text-anchor="middle" class="svg-muted" font-size="11">one string</text>
<rect x="510" y="35" width="110" height="50" rx="10" fill="#bbf7d0"/><text x="565" y="58" text-anchor="middle" class="svg-ink" font-size="12">10,20,99</text>
<line x1="150" y1="60" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="360" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Filters can be chained left to right.</p></div>

<h3>The filters a network engineer uses every week</h3>
<table class="cmp"><tr><th>Filter</th><th>What it does</th><th>Example</th></tr>
<tr><td><code>upper</code>, <code>lower</code></td><td>change case</td><td><code>{{ hostname | lower }}</code></td></tr>
<tr><td><code>default(x)</code></td><td>fallback when the variable is missing</td><td><code>{{ site | default('UNKNOWN') }}</code></td></tr>
<tr><td><code>length</code></td><td>number of items</td><td><code>{{ vlans | length }}</code></td></tr>
<tr><td><code>join(sep)</code></td><td>glue a list into one string</td><td><code>{{ ids | join(',') }}</code></td></tr>
<tr><td><code>map(attribute='x')</code></td><td>pick one field from each dictionary</td><td><code>vlans | map(attribute='id')</code></td></tr>
<tr><td><code>sort(attribute='x')</code></td><td>sort a list</td><td><code>vlans | sort(attribute='id')</code></td></tr>
<tr><td><code>selectattr('x', 'defined')</code></td><td>keep items that have field x</td><td><code>interfaces | selectattr('ip', 'defined')</code></td></tr>
<tr><td><code>difference(list)</code></td><td>items not in another list</td><td><code>found | difference(standard)</code></td></tr>
<tr><td><code>ansible.utils.ipaddr(q)</code></td><td>IP maths: prefix, network, wildcard</td><td><code>'192.0.2.1/30' | ansible.utils.ipaddr('network')</code></td></tr></table>

<h3>One template that shows them</h3>
<pre class="code"><span class="c"># templates/filters.j2</span>
hostname {{ hostname | lower }}
! site {{ site | default('UNKNOWN') | upper }}
! {{ vlans | length }} VLANs: {{ vlans | map(attribute='id') | join(',') }}
! names: {{ vlans | map(attribute='name') | join(' ') }}
! biggest first: {{ vlans | sort(attribute='id', reverse=true) | map(attribute='id') | join(' ') }}
! routed ports: {{ interfaces | selectattr('ip', 'defined') | map(attribute='name') | join(' ') }}
! extra NTP: {{ ntp_servers | difference(['10.99.0.60']) | length }}
{% for i in interfaces | selectattr('ip', 'defined') %}
! {{ i.name }} {{ i.ip }}/{{ (i.ip ~ '/' ~ i.mask) | ansible.utils.ipaddr('prefix') }} net {{ (i.ip ~ '/' ~ i.mask) | ansible.utils.ipaddr('network') }} wildcard {{ (i.ip ~ '/' ~ i.mask) | ansible.utils.ipaddr('wildcard') }}
{% endfor %}
! mgmt vlan name: {{ (vlans | selectattr('id', 'equalto', 99) | first).name | default('none') }}</pre>
<p>The <code>~</code> sign joins pieces of text, so <code>192.0.2.1</code> and <code>255.255.255.252</code> become one string for the IP filter. Rendered for <code>pun-core-r1</code>:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=filters.j2 --limit pun-core-r1
...
netadmin@auto01:~/netauto$ cat configs/pun-core-r1.cfg
hostname <span class="hl">pun-core-r1</span>
! site <span class="hl">PUNE</span>
! <span class="hl">3 VLANs: 10,20,99</span>
! names: USERS VOICE MGMT
! biggest first: <span class="hl">99 20 10</span>
! routed ports: GigabitEthernet0/1 GigabitEthernet0/3
! extra NTP: 0
! GigabitEthernet0/1 192.0.2.1/30 net 192.0.2.0 wildcard 0.0.0.3
! GigabitEthernet0/3 192.0.2.5/30 net 192.0.2.4 wildcard 0.0.0.3
! mgmt vlan name: MGMT</pre>
<p>Read the VLAN line from the left. <code>vlans</code> is a list of three dictionaries. <code>map(attribute='id')</code> turns it into a list of three numbers. <code>join(',')</code> makes one string. You wrote no loop and no comma logic.</p>

<h3>default: the safety net</h3>
<p>Only <code>pun-core-r1</code> has <code>site: Pune</code>. For <code>blr-edge-r2</code> the same line prints <code>UNKNOWN</code> instead of stopping the run. Use <code>default</code> only when a fallback is truly acceptable. For a value that must exist (a loopback address), prefer the error: a missing router-ID should stop the render, not become a made-up value. You can also write <code>default(omit)</code> in task parameters, covered in the roles module.</p>

<h3>ipaddr needs a collection</h3>
<p>The IP filters live in the <code>ansible.utils</code> collection and need the Python library <code>netaddr</code> on the control node. In the lab they work as shown. On your own server install both first: <code>ansible-galaxy collection install ansible.utils</code> and <code>pip install netaddr</code>. Without them Ansible reports that it cannot load the filter.</p>
<p><b>Reference configuration (not run in the simulator):</b> two more filters you will meet: <code>{{ text | regex_replace('^Gi', 'GigabitEthernet') }}</code> rewrites text with a regular expression, and <code>{{ data | to_nice_json }}</code> prints a variable as indented JSON for debugging.</p>

<h3>Test with a one-line template</h3>
<p>When a filter chain misbehaves, shorten it. Render a small template that prints only that expression, look at the output, then add the next filter. This is the fastest way to learn what each step returns.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting the pipe inside the wrong brackets (<code>{{ vlans | length }}</code>, not <code>{{ vlans } | length }}</code>); using <code>default</code> to hide a required variable; forgetting that <code>map</code> and <code>selectattr</code> return a generator-like result in real Jinja2, so add <code>| list</code> if you need to count or print it directly; sorting numbers that are strings (the text "100" sorts before "20").</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>difference</code> keeps items that are in the first list and not in the second. The order matters: <code>found | difference(standard)</code> is the extras; <code>standard | difference(found)</code> is what is missing.</p></div>

<div class="scn"><h4>Wildcard masks by hand</h4><p>An engineer typed the OSPF wildcard mask for each point-to-point link by hand and swapped two digits on one router. The adjacency never formed and nobody saw why for an hour. After the template used the <code>wildcard</code> query of the IP filter, the mask always matched the interface address, and the typo class disappeared.</p><p><b>Lesson:</b> compute derived values; do not type them.</p></div>

<div class="iv"><p class="q">"What is a Jinja2 filter? Give network examples."</p><p>A filter transforms a value with the pipe sign. Examples: default for fallbacks, join and map to build a comma list of VLAN IDs, selectattr to keep only routed interfaces, difference to find extra NTP servers, and ipaddr to calculate a network or wildcard from an interface address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A filter changes a value: value | filter(arguments).</li>
<li>Chain filters from left to right to reshape lists of dictionaries.</li>
<li>default gives a safe fallback; do not use it for required data.</li>
<li>map, selectattr, sort, join and difference cover most list work.</li>
<li>ipaddr needs the ansible.utils collection and netaddr.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> <b>filter</b> ek chhota tool hai jo value ko output mein jaate waqt badal deta hai. Aap use pipe sign <code>|</code> se lagate ho, bilkul Linux pipe ki tarah: left ki value right ke filter mein jaati hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Pipes se chained filters">
<rect x="20" y="35" width="130" height="50" rx="10" fill="#bae6fd"/><text x="85" y="58" text-anchor="middle" class="svg-ink" font-size="12">vlans</text><text x="85" y="74" text-anchor="middle" class="svg-muted" font-size="11">3 dicts ki list</text>
<rect x="190" y="35" width="130" height="50" rx="10" fill="#fde68a"/><text x="255" y="58" text-anchor="middle" class="svg-ink" font-size="12">map(attribute='id')</text><text x="255" y="74" text-anchor="middle" class="svg-muted" font-size="11">10, 20, 99</text>
<rect x="360" y="35" width="110" height="50" rx="10" fill="#fde68a"/><text x="415" y="58" text-anchor="middle" class="svg-ink" font-size="12">join(',')</text><text x="415" y="74" text-anchor="middle" class="svg-muted" font-size="11">ek string</text>
<rect x="510" y="35" width="110" height="50" rx="10" fill="#bbf7d0"/><text x="565" y="58" text-anchor="middle" class="svg-ink" font-size="12">10,20,99</text>
<line x1="150" y1="60" x2="190" y2="60" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="360" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Filters ko left se right chain kar sakte ho.</p></div>

<h3>Woh filters jo network engineer har hafte use karta hai</h3>
<table class="cmp"><tr><th>Filter</th><th>Kya karta hai</th><th>Example</th></tr>
<tr><td><code>upper</code>, <code>lower</code></td><td>case badalta hai</td><td><code>{{ hostname | lower }}</code></td></tr>
<tr><td><code>default(x)</code></td><td>variable na ho to fallback</td><td><code>{{ site | default('UNKNOWN') }}</code></td></tr>
<tr><td><code>length</code></td><td>items ki sankhya</td><td><code>{{ vlans | length }}</code></td></tr>
<tr><td><code>join(sep)</code></td><td>list ko ek string mein jodta hai</td><td><code>{{ ids | join(',') }}</code></td></tr>
<tr><td><code>map(attribute='x')</code></td><td>har dictionary se ek field chunta hai</td><td><code>vlans | map(attribute='id')</code></td></tr>
<tr><td><code>sort(attribute='x')</code></td><td>list sort karta hai</td><td><code>vlans | sort(attribute='id')</code></td></tr>
<tr><td><code>selectattr('x', 'defined')</code></td><td>jin items mein field x hai unhe rakhta hai</td><td><code>interfaces | selectattr('ip', 'defined')</code></td></tr>
<tr><td><code>difference(list)</code></td><td>doosri list mein na hone wale items</td><td><code>found | difference(standard)</code></td></tr>
<tr><td><code>ansible.utils.ipaddr(q)</code></td><td>IP maths: prefix, network, wildcard</td><td><code>'192.0.2.1/30' | ansible.utils.ipaddr('network')</code></td></tr></table>

<h3>Ek template jo sab dikhata hai</h3>
<pre class="code"><span class="c"># templates/filters.j2</span>
hostname {{ hostname | lower }}
! site {{ site | default('UNKNOWN') | upper }}
! {{ vlans | length }} VLANs: {{ vlans | map(attribute='id') | join(',') }}
! names: {{ vlans | map(attribute='name') | join(' ') }}
! biggest first: {{ vlans | sort(attribute='id', reverse=true) | map(attribute='id') | join(' ') }}
! routed ports: {{ interfaces | selectattr('ip', 'defined') | map(attribute='name') | join(' ') }}
! extra NTP: {{ ntp_servers | difference(['10.99.0.60']) | length }}
{% for i in interfaces | selectattr('ip', 'defined') %}
! {{ i.name }} {{ i.ip }}/{{ (i.ip ~ '/' ~ i.mask) | ansible.utils.ipaddr('prefix') }} net {{ (i.ip ~ '/' ~ i.mask) | ansible.utils.ipaddr('network') }} wildcard {{ (i.ip ~ '/' ~ i.mask) | ansible.utils.ipaddr('wildcard') }}
{% endfor %}
! mgmt vlan name: {{ (vlans | selectattr('id', 'equalto', 99) | first).name | default('none') }}</pre>
<p><code>~</code> sign text ke tukde jodta hai, isliye <code>192.0.2.1</code> aur <code>255.255.255.252</code> IP filter ke liye ek string ban jaate hain. <code>pun-core-r1</code> ke liye render hone par:</p>
<pre class="out">netadmin@auto01:~/netauto$ ansible-playbook preview.yml -e tpl=filters.j2 --limit pun-core-r1
...
netadmin@auto01:~/netauto$ cat configs/pun-core-r1.cfg
hostname <span class="hl">pun-core-r1</span>
! site <span class="hl">PUNE</span>
! <span class="hl">3 VLANs: 10,20,99</span>
! names: USERS VOICE MGMT
! biggest first: <span class="hl">99 20 10</span>
! routed ports: GigabitEthernet0/1 GigabitEthernet0/3
! extra NTP: 0
! GigabitEthernet0/1 192.0.2.1/30 net 192.0.2.0 wildcard 0.0.0.3
! GigabitEthernet0/3 192.0.2.5/30 net 192.0.2.4 wildcard 0.0.0.3
! mgmt vlan name: MGMT</pre>
<p>VLAN line left se padho. <code>vlans</code> teen dictionaries ki list hai. <code>map(attribute='id')</code> use teen numbers ki list banata hai. <code>join(',')</code> ek string banata hai. Aapne koi loop ya comma logic nahi likha.</p>

<h3>default: safety net</h3>
<p>Sirf <code>pun-core-r1</code> ke paas <code>site: Pune</code> hai. <code>blr-edge-r2</code> ke liye wahi line run rokne ki jagah <code>UNKNOWN</code> print karti hai. <code>default</code> tabhi use karo jab fallback sach mein theek ho. Jo value zaroor honi chahiye (loopback address), uske liye error behtar hai: missing router-ID render rokna chahiye, banaayi hui value nahi banni chahiye. Task parameters mein <code>default(omit)</code> bhi likh sakte ho, jo roles module mein aayega.</p>

<h3>ipaddr ko collection chahiye</h3>
<p>IP filters <code>ansible.utils</code> collection mein hain aur control node par Python library <code>netaddr</code> chahiye. Lab mein yeh dikhaye jaise chalte hain. Apne server par pehle dono install karo: <code>ansible-galaxy collection install ansible.utils</code> aur <code>pip install netaddr</code>. Inke bina Ansible kehta hai ki filter load nahi ho sakta.</p>
<p><b>Reference configuration (not run in the simulator):</b> do aur filters jo milenge: <code>{{ text | regex_replace('^Gi', 'GigabitEthernet') }}</code> regular expression se text badalta hai, aur <code>{{ data | to_nice_json }}</code> debugging ke liye variable ko indented JSON mein print karta hai.</p>

<h3>Ek line ke template se test karo</h3>
<p>Filter chain galat chale to use chhota karo. Ek chhota template render karo jo sirf wahi expression print kare, output dekho, phir agla filter jodo. Har step kya return karta hai yeh seekhne ka sabse tez tareeka yahi hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Pipe ko galat brackets ke andar rakhna (<code>{{ vlans | length }}</code>, <code>{{ vlans } | length }}</code> nahi); required variable chhupane ke liye <code>default</code> use karna; yeh bhoolna ki asli Jinja2 mein <code>map</code> aur <code>selectattr</code> generator jaisa result dete hain, isliye seedha count ya print karna ho to <code>| list</code> jodo; strings bane numbers sort karna (text "100" "20" se pehle aata hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>difference</code> pehli list ke woh items rakhta hai jo doosri mein nahi hain. Order matter karta hai: <code>found | difference(standard)</code> extras hain; <code>standard | difference(found)</code> jo missing hai.</p></div>

<div class="scn"><h4>Haath se wildcard masks</h4><p>Ek engineer ne har point-to-point link ka OSPF wildcard mask haath se type kiya aur ek router par do digits ulat diye. Adjacency kabhi nahi bani aur ghante bhar kisi ko wajah nahi dikhi. Template ne IP filter ki <code>wildcard</code> query use karni shuru ki, to mask hamesha interface address se match karta tha, aur typo ka yeh prakaar khatam ho gaya.</p><p><b>Lesson:</b> derived values calculate karo; type mat karo.</p></div>

<div class="iv"><p class="q">"Jinja2 filter kya hai? Network examples do."</p><p>Filter pipe sign se value ko transform karta hai. Examples: fallback ke liye default, VLAN IDs ki comma list banane ke liye join aur map, sirf routed interfaces rakhne ke liye selectattr, extra NTP servers dhoondhne ke liye difference, aur interface address se network ya wildcard nikalne ke liye ipaddr.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filter value badalta hai: value | filter(arguments).</li>
<li>Dictionaries ki lists ka roop badalne ke liye filters ko left se right chain karo.</li>
<li>default safe fallback deta hai; required data ke liye use mat karo.</li>
<li>map, selectattr, sort, join aur difference zyadatar list ka kaam karte hain.</li>
<li>ipaddr ko ansible.utils collection aur netaddr chahiye.</li>
</ul></div>
`}};export{e as default};