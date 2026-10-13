var e={id:`trunks-allowed`,h:{en:`Trunks and the allowed VLAN list`,hi:`Trunks aur allowed VLAN list`},body:{en:`
<p>A trunk is like the security gate between two buildings of a campus. The gate can carry people from every department, but the guard holds a list: "only badges for floors 10, 20 and 99 may pass". Anyone else is turned back, silently. Configuring a trunk is easy; managing that list correctly is where real outages happen. This chapter covers both, using lab 2 (Sahyadri Health).</p>

<h3>Where trunks are used</h3>
<ul>
<li>Between switches, so a VLAN can span several access switches and reach the distribution or core layer.</li>
<li>From a switch to a router doing <b>router-on-a-stick</b> (next module) or to a Layer 3 switch.</li>
<li>From a switch to a virtualisation host, so VMs in many VLANs share the host's uplinks.</li>
<li>From a switch to a wireless controller or access point that maps SSIDs to VLANs.</li>
</ul>

<h3>Configuring a static trunk</h3>
<pre class="code"><span class="c">! Lab 2: do this on SW1 and on SW2</span>
SW1(config)# interface GigabitEthernet0/0
<span class="c">! Only needed on switches that also support ISL</span>
SW1(config-if)# switchport trunk encapsulation dot1q
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport nonegotiate
SW1(config-if)# switchport trunk native vlan 99
SW1(config-if)# switchport trunk allowed vlan 10,20,99</pre>
<p><code>switchport mode trunk</code> forces the port to trunk. On a switch that supports both ISL and 802.1Q, the encapsulation defaults to negotiate, and the switch refuses with <code>Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.</code> Set <code>switchport trunk encapsulation dot1q</code> first. Switches that support only 802.1Q do not even have the command. <code>nonegotiate</code> is explained in chapter 9 and the native VLAN in chapter 8.</p>

<h3>The allowed VLAN list</h3>
<p>By default a trunk allows <b>every VLAN, 1 to 4094</b>. That is convenient but wasteful and less secure: broadcasts and unknown unicasts for every VLAN are flooded over every trunk, even to switches that have no ports in that VLAN. Best practice is to allow only the VLANs that need to cross. You have five forms, and you must know exactly what each does:</p>
<table class="cmp"><tr><th>Command</th><th>Effect on the existing list</th></tr>
<tr><td><code>switchport trunk allowed vlan 10,20</code></td><td><b>Replaces</b> the whole list with 10 and 20</td></tr>
<tr><td><code>switchport trunk allowed vlan add 30</code></td><td>Adds 30, keeps everything else</td></tr>
<tr><td><code>switchport trunk allowed vlan remove 20</code></td><td>Removes 20, keeps everything else</td></tr>
<tr><td><code>switchport trunk allowed vlan except 50</code></td><td>Allows all VLANs except 50 (replaces the list)</td></tr>
<tr><td><code>switchport trunk allowed vlan all</code> or <code>none</code></td><td>Everything, or nothing</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Allowed list on the trunk passes VLAN 10 and 20 and drops VLAN 30">
<rect x="20" y="70" width="120" height="70" rx="8" fill="#bae6fd"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="500" y="70" width="120" height="70" rx="8" fill="#bae6fd"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<rect x="270" y="50" width="100" height="110" rx="8" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">allowed</text><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="12">10,20,99</text>
<line x1="140" y1="85" x2="270" y2="85" stroke="#64748b" stroke-width="3"/><line x1="370" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="3"/>
<text x="205" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text><text x="435" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<line x1="140" y1="110" x2="270" y2="110" stroke="#64748b" stroke-width="3"/><line x1="370" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="3"/>
<text x="205" y="104" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text><text x="435" y="104" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<line x1="140" y1="135" x2="270" y2="135" stroke="#64748b" stroke-width="3" stroke-dasharray="5 4"/>
<text x="205" y="152" text-anchor="middle" class="svg-accent" font-size="12">VLAN 30</text><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="16">X</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">The trunk stays up; VLAN 30 is simply not carried</text>
</svg><p class="cap">The allowed list is a filter per VLAN. A VLAN missing from it is dropped with no error and no log message.</p></div>

<h3>The classic outage: forgetting <code>add</code></h3>
<p>A trunk carries 10, 20 and 99. A new VLAN 30 must cross it. The engineer types <code>switchport trunk allowed vlan 30</code>. IOS accepts it without any warning, and the list is now <b>only</b> 30. VLANs 10, 20 and 99 stop crossing instantly. The trunk itself stays up/up, so interface monitoring shows green. Only <code>show interfaces trunk</code> or <code>show running-config interface</code> reveals the damage. This exact mistake is the NOC ticket you solve in chapter 11.</p>

<h3>Reading <code>show interfaces trunk</code></h3>
<p>In lab 2 a colleague pre-staged SW2 last night. Before you touch it, look:</p>
<pre class="out">SW2# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      99

Port        Vlans allowed on trunk
<span class="hl">Gi0/0       10,99</span>

Port        Vlans allowed and active in management domain
Gi0/0       10,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       10,99</pre>
<p>The output has four blocks, and each is a filter on top of the previous one:</p>
<ol>
<li><b>Mode, encapsulation, status, native VLAN.</b> Is it actually trunking, and with which native VLAN?</li>
<li><b>Vlans allowed on trunk.</b> The configured allowed list.</li>
<li><b>Allowed and active in management domain.</b> Allowed VLANs that also <b>exist</b> on this switch. A VLAN that is allowed but not created locally disappears here.</li>
<li><b>Forwarding state and not pruned.</b> VLANs that spanning tree is forwarding on this port and that VTP pruning has not removed. This is what really crosses.</li>
</ol>
<p>VLAN 20 is missing from SW2's list, so PC3 (10.20.20.11) cannot reach PC4 (10.20.20.12) even after SW1 is perfect. The fix keeps the colleague's list and appends the missing VLAN:</p>
<pre class="code">SW2(config)# interface GigabitEthernet0/0
SW2(config-if)# switchport trunk allowed vlan add 20</pre>

<div class="eg"><p><b>Worked example.</b> A trunk shows allowed <code>1-4094</code>. Security asks you to carry only 10, 20, 30 and 99. Type <code>switchport trunk allowed vlan 10,20,30,99</code> once (a replacement is exactly what you want here). A month later VLAN 40 is added: <code>switchport trunk allowed vlan add 40</code>. Later VLAN 30 is retired: <code>switchport trunk allowed vlan remove 30</code>. Final list: 10,20,40,99. Do the same on the other end of the trunk, because the list is configured separately on each side.</p></div>

<div class="note"><p><b>Senior detail.</b> Removing VLAN 1 from a trunk's allowed list stops user traffic in VLAN 1, but the switch still sends and receives control protocols such as CDP, DTP, VTP, PAgP and LACP in VLAN 1 on that trunk.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing a list without <code>add</code>; updating only one end of the trunk; allowing a VLAN that has not been created on the transit switch (it never becomes active); and checking only <code>show interfaces status</code>, which says "connected" even when half the VLANs are gone.</p></div>

<div class="exam"><p><b>Exam trap.</b> The allowed list is per interface and per side. A VLAN allowed on SW1 but not on SW2 is dropped when it arrives at SW2. And <code>show vlan brief</code> never shows trunk ports; use <code>show interfaces trunk</code>.</p></div>

<div class="scn"><h4>The VM that lost its network after migration</h4><p>A virtualisation team created a new port group for VLAN 70 and moved an application VM to it. It worked. The next night an automatic load-balancing job moved the VM to another host in the cluster, and the application went offline. Both hosts were connected to the same pair of switches, so the network team initially blamed the hypervisor. <code>show interfaces trunk</code> on the port facing the second host showed allowed VLANs 10-60,99: VLAN 70 had only been added on the first host's trunk. After <code>switchport trunk allowed vlan add 70</code> on every host-facing trunk in the cluster, migrations worked in both directions.</p><p><b>Lesson:</b> a VLAN must be allowed on every trunk in every possible path, including paths that are only used after a failover or migration.</p></div>

<div class="iv"><p class="q">"What is the difference between switchport trunk allowed vlan 30 and switchport trunk allowed vlan add 30?"</p><p>Strong answer: the first replaces the entire allowed list with VLAN 30 only, silently removing every other VLAN from the trunk; the second appends 30 to the existing list. Mention that the trunk stays up so monitoring may not notice, that you verify with <code>show interfaces trunk</code>, and that you always check the current list with <code>show running-config interface</code> before changing it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunks carry many VLANs using 802.1Q tags; configure with <code>switchport mode trunk</code> (plus <code>encapsulation dot1q</code> on ISL-capable switches).</li>
<li>Default allowed list is 1 to 4094; prune it to only the VLANs that need to cross.</li>
<li>A bare list replaces; use <code>add</code> and <code>remove</code> to change an existing list.</li>
<li><code>show interfaces trunk</code> has four blocks: status, allowed, allowed and active, forwarding and not pruned.</li>
<li>Configure the list on both ends, and create the VLAN on every switch the traffic passes through.</li>
</ul></div>
`,hi:`
<p>Trunk campus ki do buildings ke beech ke security gate jaisa hai. Gate har department ke logon ko le ja sakta hai, par guard ke paas ek list hai: "sirf floors 10, 20 aur 99 ke badges jaa sakte hain". Baaki sab ko chupchaap wapas bhej diya jaata hai. Trunk configure karna aasaan hai; us list ko sahi manage karna wahi jagah hai jahan real outages hote hain. Yeh chapter dono cover karta hai, lab 2 (Sahyadri Health) use karke.</p>

<h3>Trunks kahan use hote hain</h3>
<ul>
<li>Switches ke beech, taaki ek VLAN kai access switches par phail sake aur distribution ya core layer tak pahunche.</li>
<li>Switch se <b>router-on-a-stick</b> karne wale router (agla module) ya Layer 3 switch tak.</li>
<li>Switch se virtualisation host tak, taaki kai VLANs ke VMs host ke uplinks share kar sakein.</li>
<li>Switch se wireless controller ya access point tak jo SSIDs ko VLANs se map karta hai.</li>
</ul>

<h3>Static trunk configure karna</h3>
<pre class="code"><span class="c">! Lab 2: yeh SW1 aur SW2 dono par karo</span>
SW1(config)# interface GigabitEthernet0/0
<span class="c">! Sirf un switches par zaroori jo ISL bhi support karte hain</span>
SW1(config-if)# switchport trunk encapsulation dot1q
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport nonegotiate
SW1(config-if)# switchport trunk native vlan 99
SW1(config-if)# switchport trunk allowed vlan 10,20,99</pre>
<p><code>switchport mode trunk</code> port ko trunk hone par majboor karta hai. Jo switch ISL aur 802.1Q dono support karta hai, usme encapsulation default mein negotiate hota hai, aur switch mana kar deta hai: <code>Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.</code> Pehle <code>switchport trunk encapsulation dot1q</code> set karo. Jo switches sirf 802.1Q support karte hain unme yeh command hoti hi nahi. <code>nonegotiate</code> chapter 9 mein aur native VLAN chapter 8 mein samjhaya gaya hai.</p>

<h3>Allowed VLAN list</h3>
<p>Default mein trunk <b>har VLAN, 1 se 4094</b>, allow karta hai. Yeh convenient hai par wasteful aur kam secure: har VLAN ke broadcasts aur unknown unicasts har trunk par flood hote hain, un switches tak bhi jinka us VLAN mein koi port nahi. Best practice hai sirf un VLANs ko allow karna jinhe cross karna hai. Aapke paas paanch forms hain, aur aapko exactly pata hona chahiye ki har ek kya karta hai:</p>
<table class="cmp"><tr><th>Command</th><th>Existing list par asar</th></tr>
<tr><td><code>switchport trunk allowed vlan 10,20</code></td><td>Poori list ko 10 aur 20 se <b>replace</b> karta hai</td></tr>
<tr><td><code>switchport trunk allowed vlan add 30</code></td><td>30 jodta hai, baaki sab rakhta hai</td></tr>
<tr><td><code>switchport trunk allowed vlan remove 20</code></td><td>20 hataata hai, baaki sab rakhta hai</td></tr>
<tr><td><code>switchport trunk allowed vlan except 50</code></td><td>50 ke alawa saare VLANs allow (list replace karta hai)</td></tr>
<tr><td><code>switchport trunk allowed vlan all</code> ya <code>none</code></td><td>Sab kuch, ya kuch nahi</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Trunk ki allowed list VLAN 10 aur 20 ko jaane deti hai aur VLAN 30 drop karti hai">
<rect x="20" y="70" width="120" height="70" rx="8" fill="#bae6fd"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="500" y="70" width="120" height="70" rx="8" fill="#bae6fd"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<rect x="270" y="50" width="100" height="110" rx="8" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="12">allowed</text><text x="320" y="98" text-anchor="middle" class="svg-ink" font-size="12">10,20,99</text>
<line x1="140" y1="85" x2="270" y2="85" stroke="#64748b" stroke-width="3"/><line x1="370" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="3"/>
<text x="205" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text><text x="435" y="78" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<line x1="140" y1="110" x2="270" y2="110" stroke="#64748b" stroke-width="3"/><line x1="370" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="3"/>
<text x="205" y="104" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text><text x="435" y="104" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
<line x1="140" y1="135" x2="270" y2="135" stroke="#64748b" stroke-width="3" stroke-dasharray="5 4"/>
<text x="205" y="152" text-anchor="middle" class="svg-accent" font-size="12">VLAN 30</text><text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="16">X</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Trunk up rehta hai; VLAN 30 bas carry nahi hota</text>
</svg><p class="cap">Allowed list har VLAN ke liye ek filter hai. Jo VLAN isme nahi, woh bina error aur bina log message ke drop hota hai.</p></div>

<h3>Classic outage: <code>add</code> bhool jaana</h3>
<p>Trunk 10, 20 aur 99 carry karta hai. Naye VLAN 30 ko ise cross karna hai. Engineer <code>switchport trunk allowed vlan 30</code> type karta hai. IOS bina kisi warning ke accept kar leta hai, aur list ab <b>sirf</b> 30 hai. VLANs 10, 20 aur 99 turant cross karna band kar dete hain. Trunk khud up/up rehta hai, isliye interface monitoring green dikhata hai. Sirf <code>show interfaces trunk</code> ya <code>show running-config interface</code> nuksaan dikhata hai. Yahi exact galti woh NOC ticket hai jo aap chapter 11 mein solve karoge.</p>

<h3><code>show interfaces trunk</code> padhna</h3>
<p>Lab 2 mein ek colleague ne kal raat SW2 pre-stage kiya tha. Chhoone se pehle dekho:</p>
<pre class="out">SW2# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      99

Port        Vlans allowed on trunk
<span class="hl">Gi0/0       10,99</span>

Port        Vlans allowed and active in management domain
Gi0/0       10,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       10,99</pre>
<p>Output ke chaar blocks hain, aur har ek pichle wale ke upar ek filter hai:</p>
<ol>
<li><b>Mode, encapsulation, status, native VLAN.</b> Kya yeh sach mein trunking kar raha hai, aur kis native VLAN ke saath?</li>
<li><b>Vlans allowed on trunk.</b> Configured allowed list.</li>
<li><b>Allowed and active in management domain.</b> Allowed VLANs jo is switch par <b>exist</b> bhi karte hain. Jo VLAN allowed hai par locally bana nahi, woh yahan gayab ho jaata hai.</li>
<li><b>Forwarding state and not pruned.</b> VLANs jinhe spanning tree is port par forward kar raha hai aur jinhe VTP pruning ne nahi hataya. Yahi asal mein cross karta hai.</li>
</ol>
<p>SW2 ki list mein VLAN 20 missing hai, isliye SW1 perfect hone ke baad bhi PC3 (10.20.20.11) PC4 (10.20.20.12) tak nahi pahunch sakta. Fix colleague ki list rakhta hai aur missing VLAN jodta hai:</p>
<pre class="code">SW2(config)# interface GigabitEthernet0/0
SW2(config-if)# switchport trunk allowed vlan add 20</pre>

<div class="eg"><p><b>Worked example.</b> Ek trunk allowed <code>1-4094</code> dikhata hai. Security kehti hai sirf 10, 20, 30 aur 99 carry karo. Ek baar <code>switchport trunk allowed vlan 10,20,30,99</code> type karo (yahan replacement hi to chahiye). Ek mahine baad VLAN 40 add hota hai: <code>switchport trunk allowed vlan add 40</code>. Baad mein VLAN 30 retire hota hai: <code>switchport trunk allowed vlan remove 30</code>. Final list: 10,20,40,99. Trunk ke doosre end par bhi yahi karo, kyunki list har side par alag configure hoti hai.</p></div>

<div class="note"><p><b>Senior detail.</b> Trunk ki allowed list se VLAN 1 hataane se VLAN 1 ka user traffic ruk jaata hai, par switch us trunk par VLAN 1 mein CDP, DTP, VTP, PAgP aur LACP jaise control protocols bhejta aur receive karta rehta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>add</code> ke bina list type karna; trunk ka sirf ek end update karna; aisa VLAN allow karna jo transit switch par bana hi nahi (woh kabhi active nahi hota); aur sirf <code>show interfaces status</code> check karna, jo "connected" dikhata hai jabki aadhe VLANs gayab hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Allowed list per interface aur per side hoti hai. Jo VLAN SW1 par allowed hai par SW2 par nahi, woh SW2 par pahunchte hi drop hota hai. Aur <code>show vlan brief</code> trunk ports kabhi nahi dikhata; <code>show interfaces trunk</code> use karo.</p></div>

<div class="scn"><h4>Migration ke baad VM ka network gaya</h4><p>Virtualisation team ne VLAN 70 ke liye naya port group banaya aur ek application VM usme move kiya. Chal gaya. Agli raat ek automatic load-balancing job ne VM ko cluster ke doosre host par move kiya, aur application offline ho gayi. Dono hosts switches ke same pair se jude the, isliye network team ne pehle hypervisor ko blame kiya. Doosre host ki taraf wale port par <code>show interfaces trunk</code> ne allowed VLANs 10-60,99 dikhaye: VLAN 70 sirf pehle host ke trunk par add hua tha. Cluster ke har host-facing trunk par <code>switchport trunk allowed vlan add 70</code> ke baad migrations dono taraf chalne lagi.</p><p><b>Seekh:</b> VLAN har possible path ke har trunk par allowed hona chahiye, un paths par bhi jo sirf failover ya migration ke baad use hote hain.</p></div>

<div class="iv"><p class="q">"switchport trunk allowed vlan 30 aur switchport trunk allowed vlan add 30 mein kya fark hai?"</p><p>Strong answer: pehli command poori allowed list ko sirf VLAN 30 se replace kar deti hai, chupchaap har doosre VLAN ko trunk se hata deti hai; doosri existing list mein 30 jodti hai. Mention karo ki trunk up rehta hai isliye monitoring shayad notice na kare, ki aap <code>show interfaces trunk</code> se verify karte ho, aur badalne se pehle hamesha <code>show running-config interface</code> se current list check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunks 802.1Q tags use karke kai VLANs carry karte hain; <code>switchport mode trunk</code> se configure karo (ISL-capable switches par <code>encapsulation dot1q</code> bhi).</li>
<li>Default allowed list 1 se 4094 hai; ise sirf un VLANs tak chhota karo jinhe cross karna hai.</li>
<li>Bare list replace karti hai; existing list badalne ke liye <code>add</code> aur <code>remove</code> use karo.</li>
<li><code>show interfaces trunk</code> ke chaar blocks: status, allowed, allowed and active, forwarding and not pruned.</li>
<li>List dono ends par configure karo, aur VLAN ko har us switch par banao jisse traffic guzarta hai.</li>
</ul></div>
`}};export{e as default};