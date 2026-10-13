var e={id:`conditionals`,h:{en:`Conditions: if, elif, else and "is defined"`,hi:`Conditions: if, elif, else aur "is defined"`},body:{en:`
<p><b>One idea in this chapter:</b> an <code>{% if %}</code> block prints its text only when a test is true. This lets one template give a core router, an edge router and a router with no OSPF the right lines each, without three separate files.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Decision by role">
<rect x="230" y="15" width="180" height="44" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">role == ?</text>
<rect x="20" y="105" width="170" height="52" rx="10" fill="#bbf7d0"/><text x="105" y="128" text-anchor="middle" class="svg-ink" font-size="12">core</text><text x="105" y="145" text-anchor="middle" class="svg-muted" font-size="12">comment only</text>
<rect x="235" y="105" width="170" height="52" rx="10" fill="#bbf7d0"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="12">edge</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">default route to ISP</text>
<rect x="450" y="105" width="170" height="52" rx="10" fill="#e2e8f0"/><text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="12">anything else</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">warning comment</text>
<line x1="290" y1="59" x2="105" y2="105" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="320" y2="105" stroke="#64748b" stroke-width="2"/><line x1="350" y1="59" x2="535" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">if / elif / else picks exactly one branch.</p></div>

<h3>The shape of a condition</h3>
<pre class="code">{% if role == 'core' %}
... printed only for core routers ...
{% elif role == 'edge' %}
... printed only for edge routers ...
{% else %}
... printed for every other value ...
{% endif %}</pre>
<p>The test after <code>if</code> can use: <code>==</code> and <code>!=</code> (equal, not equal), <code>&gt;</code> and <code>&lt;</code>, <code>and</code>, <code>or</code>, <code>not</code>, and <code>in</code> (<code>'10.99.0.60' in ntp_servers</code>). Strings need quotes; numbers do not. Only one branch runs. <code>elif</code> and <code>else</code> are optional.</p>

<h3>Tests for missing data: is defined</h3>
<p>Not every device has every variable. A spare port has no IP address; a branch router may not run OSPF. The test <code>is defined</code> asks "does this variable exist?" and avoids the undefined-variable error from chapter 2. <code>is not defined</code> is the opposite. A safer cousin is the <code>default</code> filter, which supplies a fallback value: <code>{% if iface.enabled | default(true) %}</code> means "treat a missing enabled flag as true".</p>

<h3>A full example: one template, two roles</h3>
<p>The host files set <code>role: core</code> on <code>pun-core-r1</code> (with <code>ospf_area: 0</code>) and <code>role: edge</code> on <code>blr-edge-r2</code> (no OSPF variable at all). The template:</p>
<pre class="code"><span class="c"># templates/cond.j2</span>
hostname {{ hostname }}
{% if role == 'core' %}
! CORE router: full routing table, no default route
{% elif role == 'edge' %}
! EDGE router: default route to the ISP
ip route 0.0.0.0 0.0.0.0 198.51.100.1
{% else %}
! unknown role {{ role }}
{% endif %}
{% for iface in interfaces if iface.enabled | default(true) %}
interface {{ iface.name }}
{% if iface.desc is defined %}
 description {{ iface.desc }}
{% endif %}
{% if iface.ip is defined %}
 ip address {{ iface.ip }} {{ iface.mask }}
 no shutdown
{% else %}
 shutdown
{% endif %}
{% endfor %}
{% if ospf_area is defined %}
router ospf 1
 router-id {{ loopback_ip }}
 network {{ loopback_ip }} 0.0.0.0 area {{ ospf_area }}
{% endif %}</pre>
<p>Notice two things. The loop has its own filter, <code>{% for iface in interfaces if iface.enabled | default(true) %}</code>, so ports marked <code>enabled: false</code> are skipped completely. And the OSPF block sits inside <code>is defined</code>, so a router without <code>ospf_area</code> simply gets no OSPF.</p>
<pre class="out">netadmin@auto01:~/netauto$ cat configs/pun-core-r1.cfg
hostname PUN-CORE-R1
<span class="hl">! CORE router: full routing table, no default route</span>
interface GigabitEthernet0/1
 description To-BLR-EDGE-R2
 ip address 192.0.2.1 255.255.255.252
 no shutdown
interface GigabitEthernet0/3
 description To-DC-firewall
 ip address 192.0.2.5 255.255.255.252
 no shutdown
<span class="hl">router ospf 1
 router-id 10.255.255.1
 network 10.255.255.1 0.0.0.0 area 0</span>

netadmin@auto01:~/netauto$ cat configs/blr-edge-r2.cfg
hostname BLR-EDGE-R2
<span class="hl">! EDGE router: default route to the ISP
ip route 0.0.0.0 0.0.0.0 198.51.100.1</span>
interface GigabitEthernet0/1
 description To-PUN-CORE-R1
 ip address 192.0.2.2 255.255.255.252
 no shutdown</pre>
<p>Port <code>GigabitEthernet0/2</code> (disabled) is missing from the core config, as intended. The edge router has no OSPF block because it has no <code>ospf_area</code>.</p>

<h3>Do not hide business decisions in templates</h3>
<p>A template with ten nested conditions is hard to read and hard to test. A good rule: let the <i>data</i> say what a device is (<code>role: edge</code>), and let the template contain a few simple branches. If a branch grows large, move it into its own template file or its own role (module 5).</p>

<div class="warn"><p><b>Common mistakes.</b> Using a single <code>=</code> instead of <code>==</code>; comparing a string without quotes (<code>role == core</code> looks for a variable called core); forgetting <code>endif</code>; printing <code>{{ iface.ip }}</code> for a port that has none, which stops the run with an undefined error.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a Jinja <code>if</code>, YAML true/false become booleans, but the text <code>"false"</code> in quotes is a non-empty string and counts as true. Write <code>enabled: false</code> without quotes.</p></div>

<div class="scn"><h4>The router that grew an OSPF process</h4><p>Four branch routers were meant to use static routes only, but the shared template always printed an OSPF block. One branch started forming neighbours with a lab switch. The fix was a condition on a variable: <code>{% if ospf_area is defined %}</code>. Only devices whose host file sets an area get OSPF, and the review of the rendered files showed it before any push.</p><p><b>Lesson:</b> make optional features opt-in through data.</p></div>

<div class="iv"><p class="q">"How do you handle optional settings that only some devices have?"</p><p>Use is defined or the default filter in the template so that missing variables do not break rendering, and keep the optional block inside an if. Say that the data decides, and that you check the rendered files for a device that should not have the block.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>if / elif / else / endif prints one branch.</li>
<li>Use == for comparing, quotes for strings, and in for membership tests.</li>
<li>is defined and default() make optional data safe.</li>
<li>A for loop can carry its own if to skip items.</li>
<li>Let data choose the behaviour; keep the template simple.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka ek idea:</b> <code>{% if %}</code> block apna text tabhi print karta hai jab test true ho. Isse ek hi template core router, edge router aur bina OSPF wale router ko sahi lines de sakta hai, teen alag files ke bina.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Role ke hisaab se faisla">
<rect x="230" y="15" width="180" height="44" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">role == ?</text>
<rect x="20" y="105" width="170" height="52" rx="10" fill="#bbf7d0"/><text x="105" y="128" text-anchor="middle" class="svg-ink" font-size="12">core</text><text x="105" y="145" text-anchor="middle" class="svg-muted" font-size="12">sirf comment</text>
<rect x="235" y="105" width="170" height="52" rx="10" fill="#bbf7d0"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="12">edge</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">ISP ko default route</text>
<rect x="450" y="105" width="170" height="52" rx="10" fill="#e2e8f0"/><text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="12">kuch aur</text><text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">warning comment</text>
<line x1="290" y1="59" x2="105" y2="105" stroke="#64748b" stroke-width="2"/><line x1="320" y1="59" x2="320" y2="105" stroke="#64748b" stroke-width="2"/><line x1="350" y1="59" x2="535" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">if / elif / else theek ek branch chunta hai.</p></div>

<h3>Condition ki shakal</h3>
<pre class="code">{% if role == 'core' %}
... sirf core routers ke liye print ...
{% elif role == 'edge' %}
... sirf edge routers ke liye print ...
{% else %}
... baaki har value ke liye print ...
{% endif %}</pre>
<p><code>if</code> ke baad ke test mein yeh use ho sakte hain: <code>==</code> aur <code>!=</code> (barabar, barabar nahi), <code>&gt;</code> aur <code>&lt;</code>, <code>and</code>, <code>or</code>, <code>not</code>, aur <code>in</code> (<code>'10.99.0.60' in ntp_servers</code>). Strings ko quotes chahiye; numbers ko nahi. Sirf ek branch chalti hai. <code>elif</code> aur <code>else</code> optional hain.</p>

<h3>Missing data ke tests: is defined</h3>
<p>Har device ke paas har variable nahi hota. Spare port ka IP address nahi hota; branch router OSPF na chalata ho. Test <code>is defined</code> poochta hai "kya yeh variable maujood hai?" aur chapter 2 ke undefined-variable error se bachata hai. <code>is not defined</code> ulta hai. Ek aur surakshit tareeka <code>default</code> filter hai jo fallback value deta hai: <code>{% if iface.enabled | default(true) %}</code> ka matlab hai "missing enabled flag ko true maano".</p>

<h3>Poora example: ek template, do roles</h3>
<p>Host files <code>pun-core-r1</code> par <code>role: core</code> (aur <code>ospf_area: 0</code>) aur <code>blr-edge-r2</code> par <code>role: edge</code> (OSPF variable bilkul nahi) set karti hain. Template:</p>
<pre class="code"><span class="c"># templates/cond.j2</span>
hostname {{ hostname }}
{% if role == 'core' %}
! CORE router: full routing table, no default route
{% elif role == 'edge' %}
! EDGE router: default route to the ISP
ip route 0.0.0.0 0.0.0.0 198.51.100.1
{% else %}
! unknown role {{ role }}
{% endif %}
{% for iface in interfaces if iface.enabled | default(true) %}
interface {{ iface.name }}
{% if iface.desc is defined %}
 description {{ iface.desc }}
{% endif %}
{% if iface.ip is defined %}
 ip address {{ iface.ip }} {{ iface.mask }}
 no shutdown
{% else %}
 shutdown
{% endif %}
{% endfor %}
{% if ospf_area is defined %}
router ospf 1
 router-id {{ loopback_ip }}
 network {{ loopback_ip }} 0.0.0.0 area {{ ospf_area }}
{% endif %}</pre>
<p>Do cheezein dekho. Loop ka apna filter hai, <code>{% for iface in interfaces if iface.enabled | default(true) %}</code>, isliye <code>enabled: false</code> wale ports poore skip ho jaate hain. Aur OSPF block <code>is defined</code> ke andar hai, isliye <code>ospf_area</code> ke bina router ko OSPF milta hi nahi.</p>
<pre class="out">netadmin@auto01:~/netauto$ cat configs/pun-core-r1.cfg
hostname PUN-CORE-R1
<span class="hl">! CORE router: full routing table, no default route</span>
interface GigabitEthernet0/1
 description To-BLR-EDGE-R2
 ip address 192.0.2.1 255.255.255.252
 no shutdown
interface GigabitEthernet0/3
 description To-DC-firewall
 ip address 192.0.2.5 255.255.255.252
 no shutdown
<span class="hl">router ospf 1
 router-id 10.255.255.1
 network 10.255.255.1 0.0.0.0 area 0</span>

netadmin@auto01:~/netauto$ cat configs/blr-edge-r2.cfg
hostname BLR-EDGE-R2
<span class="hl">! EDGE router: default route to the ISP
ip route 0.0.0.0 0.0.0.0 198.51.100.1</span>
interface GigabitEthernet0/1
 description To-PUN-CORE-R1
 ip address 192.0.2.2 255.255.255.252
 no shutdown</pre>
<p>Port <code>GigabitEthernet0/2</code> (disabled) core config se gayab hai, jaisa chaaha tha. Edge router ke paas <code>ospf_area</code> nahi, isliye OSPF block nahi.</p>

<h3>Business decisions template mein mat chhupao</h3>
<p>Das nested conditions wala template padhna aur test karna mushkil hota hai. Achha rule: <i>data</i> batae ki device kya hai (<code>role: edge</code>), aur template mein kuch simple branches ho. Branch bada ho jaaye to use alag template file ya alag role (module 5) mein le jao.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>==</code> ki jagah ek <code>=</code> likhna; string ko bina quotes compare karna (<code>role == core</code> core naam ka variable dhoondhta hai); <code>endif</code> bhoolna; aise port par <code>{{ iface.ip }}</code> print karna jiska IP nahi, jo run ko undefined error se rok deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jinja <code>if</code> mein YAML true/false boolean ban jaate hain, lekin quotes wala <code>"false"</code> text non-empty string hai aur true maana jaata hai. <code>enabled: false</code> bina quotes ke likho.</p></div>

<div class="scn"><h4>Woh router jisne OSPF process ugaa liya</h4><p>Chaar branch routers sirf static routes use karne the, lekin shared template hamesha OSPF block print karta tha. Ek branch lab switch ke saath neighbour banane laga. Fix variable par condition thi: <code>{% if ospf_area is defined %}</code>. Ab sirf woh devices OSPF paate hain jinki host file area set karti hai, aur rendered files ke review mein yeh push se pehle dikh gaya.</p><p><b>Lesson:</b> optional features ko data ke through opt-in banao.</p></div>

<div class="iv"><p class="q">"Jo settings sirf kuch devices ke paas hoti hain unhe kaise handle karte ho?"</p><p>Template mein is defined ya default filter use karo taaki missing variables rendering na todein, aur optional block if ke andar rakho. Batao ki data decide karta hai, aur jis device mein block nahi hona chahiye uski rendered files check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>if / elif / else / endif ek branch print karta hai.</li>
<li>Compare ke liye ==, strings ke liye quotes, membership ke liye in.</li>
<li>is defined aur default() optional data ko surakshit banate hain.</li>
<li>for loop ka apna if ho sakta hai items skip karne ke liye.</li>
<li>Behaviour data se chuno; template simple rakho.</li>
</ul></div>
`}};export{e as default};