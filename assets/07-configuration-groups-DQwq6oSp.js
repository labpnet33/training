var e={id:`configuration-groups`,h:{en:`Configuration groups: write a standard once`,hi:`Configuration groups: standard ek baar likho`},body:{en:`
<p>A school has one rule book: "all students wear a uniform". The principal does not write that rule on every student's forehead; each class simply <b>inherits</b> the rule book, and a student with a medical note gets an exception. <b>Configuration groups</b> are Junos's rule book. You write a standard once, apply it where you want it, and let individual statements override it.</p>

<h3>Creating and applying a group</h3>
<pre class="code">set groups GE-STANDARD interfaces &lt;ge-*&gt; mtu 9000
set groups GLOBAL system services ssh
set groups GLOBAL system login message "NK network - authorised staff only"
set apply-groups [ GE-STANDARD GLOBAL ]</pre>
<ul>
<li><code>set groups NAME ...</code> defines a block of configuration. A group by itself does nothing.</li>
<li><code>set apply-groups NAME</code> at a hierarchy level makes that level inherit the group. At the top it applies to the whole configuration.</li>
<li>Several groups go in a list inside square brackets. Order matters: the <b>first</b> group wins if two set the same statement.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Group inheritance">
<rect x="20" y="20" width="250" height="60" rx="8" fill="#ddd6fe"/><text x="145" y="46" text-anchor="middle" class="svg-ink" font-size="13">group GE-STANDARD</text><text x="145" y="64" text-anchor="middle" class="svg-muted" font-size="11">interfaces &lt;ge-*&gt; mtu 9000</text>
<rect x="20" y="105" width="250" height="60" rx="8" fill="#ddd6fe"/><text x="145" y="131" text-anchor="middle" class="svg-ink" font-size="13">group GLOBAL</text><text x="145" y="149" text-anchor="middle" class="svg-muted" font-size="11">ssh + login message</text>
<rect x="400" y="20" width="220" height="150" rx="10" fill="#bbf7d0"/><text x="510" y="42" text-anchor="middle" class="svg-ink" font-size="13">Effective configuration</text>
<text x="510" y="70" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/0 mtu 9000</text><text x="510" y="92" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/1 mtu 9000</text><text x="510" y="114" text-anchor="middle" class="svg-accent" font-size="12">ge-0/0/2 mtu 1500 (local wins)</text><text x="510" y="146" text-anchor="middle" class="svg-ink" font-size="12">ssh on, login banner</text>
<g stroke="#64748b" stroke-width="2"><line x1="270" y1="50" x2="400" y2="80"/><line x1="270" y1="135" x2="400" y2="135"/></g>
<text x="330" y="190" text-anchor="middle" class="svg-muted" font-size="11">apply-groups [ GE-STANDARD GLOBAL ]</text>
</svg><p class="cap">Groups are merged into the effective configuration; local statements win.</p></div>

<h3>Wildcards</h3>
<p>Names in angle brackets are <b>wildcards</b>: <code>&lt;ge-*&gt;</code> matches every interface name starting with <code>ge-</code>, <code>&lt;*&gt;</code> matches anything. Important rule: wildcards match only statements that <b>already exist</b> in the configuration. If <code>ge-0/0/5</code> is not configured, it inherits nothing, because inheritance fills in missing values on existing objects; it does not create objects.</p>

<h3>Local configuration wins</h3>
<p>A statement written in the normal configuration beats the group. If <code>ge-0/0/2</code> has its own <code>mtu 1500</code>, the group's 9000 is ignored for that port. This is how you make exceptions without editing the group.</p>
<pre class="code">set interfaces ge-0/0/2 mtu 1500        <span class="c">! local statement overrides GE-STANDARD</span></pre>

<h3>Seeing what is inherited</h3>
<p>A normal <code>show</code> hides inherited statements, so the interface appears to have no MTU even though it is 9000. Use <code>display inheritance</code>:</p>
<pre class="code">lab@NK-BLR-DIST# show interfaces ge-0/0/1 | display inheritance
##
## 'mtu' was inherited from group 'GE-STANDARD'
##
<span class="hl">mtu 9000;</span>
unit 0 {
    family inet {
        address 10.50.1.1/24;
    }
}

lab@NK-BLR-DIST&gt; show interfaces ge-0/0/1 | match MTU
  Link-level type: Ethernet, MTU: 9000, Speed: 1000mbps</pre>
<p><code>show | display inheritance no-comments</code> removes the ## notes; <code>show | display set | display inheritance</code> prints effective set commands. <code>apply-groups-except NAME</code> stops one group from applying below a given level.</p>

<h3>Lab walkthrough: Bengaluru distribution router</h3>
<p>Standard: every routed <code>ge-</code> port runs MTU 9000, except the port to the legacy file server (ge-0/0/2, SRV at 10.50.2.20) which stays at 1500; every box shows the same banner and runs SSH. R1 has ge-0/0/0 (10.50.12.1/30 to R2), ge-0/0/1 (10.50.1.1/24, PC1) and ge-0/0/2 (10.50.2.1/24).</p>
<pre class="code">lab@NK-BLR-DIST# set groups GE-STANDARD interfaces &lt;ge-*&gt; mtu 9000
lab@NK-BLR-DIST# set apply-groups GE-STANDARD
lab@NK-BLR-DIST# set interfaces ge-0/0/2 mtu 1500
lab@NK-BLR-DIST# set groups GLOBAL system login message "NK network - authorised staff only"
lab@NK-BLR-DIST# set groups GLOBAL system services ssh
lab@NK-BLR-DIST# set apply-groups GLOBAL
lab@NK-BLR-DIST# commit
lab@NK-BLR-DIST# show interfaces | display inheritance</pre>
<p>Checks: <code>show interfaces ge-0/0/1</code> reports MTU 9000, <code>show interfaces ge-0/0/2</code> reports MTU 1500, and SSH is listening because it came from GLOBAL. The question "how many interfaces inherit 9000?" has the answer <b>2</b>: ge-0/0/0 and ge-0/0/1. ge-0/0/2 is overridden locally, and unconfigured ports inherit nothing.</p>

<h3>Useful built-in groups</h3>
<p>Junos reserves group names <code>re0</code> and <code>re1</code> for per-Routing-Engine settings on dual-RE devices (each RE can have its own host name and management address), and <code>junos-defaults</code> holds the system's own default statements, such as predefined applications and login classes.</p>

<div class="eg"><p><b>Worked example.</b> A company has 40 branch routers. Instead of typing NTP, syslog, SNMP and banner statements on each, the team keeps them in one group <code>NK-BASE</code> and runs <code>set apply-groups NK-BASE</code> on every router. When the NTP server changes, they edit one group and push it to all devices.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating a group and forgetting <code>apply-groups</code>; expecting a wildcard to create interfaces that are not configured; being surprised that a plain <code>show</code> does not display inherited values; putting groups in the wrong order, so a more general group overrides a specific one.</p></div>
<div class="exam"><p><b>Exam trap.</b> Groups need <code>apply-groups</code>. Local configuration beats group values. Wildcards apply only to existing statements. <code>show | display inheritance</code> reveals inherited statements and names the source group.</p></div>

<div class="scn"><h4>Jumbo frames and the file server</h4><p>After a platform upgrade, the file server on ge-0/0/2 started dropping large transfers. Investigation showed that the new global group applied MTU 9000 to all ge- ports, but the server's NIC supports only 1500. The engineer added a local <code>set interfaces ge-0/0/2 mtu 1500</code> and the problem vanished, without touching the group used by 39 other routers.</p><p><b>Lesson:</b> make exceptions locally; keep standards in groups.</p></div>

<div class="iv"><p class="q">"What are configuration groups and why use them?"</p><p>A group is a reusable block of configuration that is applied with <code>apply-groups</code>. With wildcards such as <code>&lt;ge-*&gt;</code> one statement can configure many interfaces. They enforce standards, reduce typing errors and keep exceptions simple because local configuration overrides group values. I check the result with <code>show | display inheritance</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Define with <code>set groups NAME</code>; activate with <code>set apply-groups NAME</code>.</li>
<li>Wildcards in angle brackets match only existing statements.</li>
<li>Local configuration beats group configuration; the first group in the list wins ties.</li>
<li><code>show | display inheritance</code> shows effective configuration and its source.</li>
<li><code>apply-groups-except</code> excludes a group below a level; re0 and re1 are per-RE groups.</li>
</ul></div>
`,hi:`
<p>School mein ek rule book hoti hai: "sab students uniform pehnenge". Principal yeh rule har student ke maathe par nahi likhta; har class bas rule book <b>inherit</b> karti hai, aur medical note wale student ko exception milta hai. <b>Configuration groups</b> Junos ki rule book hain. Aap standard ek baar likhte ho, jahan chaho wahan apply karte ho, aur individual statements use override kar sakte hain.</p>

<h3>Group banana aur apply karna</h3>
<pre class="code">set groups GE-STANDARD interfaces &lt;ge-*&gt; mtu 9000
set groups GLOBAL system services ssh
set groups GLOBAL system login message "NK network - authorised staff only"
set apply-groups [ GE-STANDARD GLOBAL ]</pre>
<ul>
<li><code>set groups NAME ...</code> configuration ka ek block define karta hai. Group akela kuch nahi karta.</li>
<li>Hierarchy level par <code>set apply-groups NAME</code> us level ko group inherit karwata hai. Top par lagao to poori configuration par apply hota hai.</li>
<li>Kai groups square brackets ki list mein jaate hain. Order matter karta hai: do groups same statement set karein to <b>pehla</b> group jeetta hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Group inheritance">
<rect x="20" y="20" width="250" height="60" rx="8" fill="#ddd6fe"/><text x="145" y="46" text-anchor="middle" class="svg-ink" font-size="13">group GE-STANDARD</text><text x="145" y="64" text-anchor="middle" class="svg-muted" font-size="11">interfaces &lt;ge-*&gt; mtu 9000</text>
<rect x="20" y="105" width="250" height="60" rx="8" fill="#ddd6fe"/><text x="145" y="131" text-anchor="middle" class="svg-ink" font-size="13">group GLOBAL</text><text x="145" y="149" text-anchor="middle" class="svg-muted" font-size="11">ssh + login message</text>
<rect x="400" y="20" width="220" height="150" rx="10" fill="#bbf7d0"/><text x="510" y="42" text-anchor="middle" class="svg-ink" font-size="13">Effective configuration</text>
<text x="510" y="70" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/0 mtu 9000</text><text x="510" y="92" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/1 mtu 9000</text><text x="510" y="114" text-anchor="middle" class="svg-accent" font-size="12">ge-0/0/2 mtu 1500 (local jeetta)</text><text x="510" y="146" text-anchor="middle" class="svg-ink" font-size="12">ssh on, login banner</text>
<g stroke="#64748b" stroke-width="2"><line x1="270" y1="50" x2="400" y2="80"/><line x1="270" y1="135" x2="400" y2="135"/></g>
<text x="330" y="190" text-anchor="middle" class="svg-muted" font-size="11">apply-groups [ GE-STANDARD GLOBAL ]</text>
</svg><p class="cap">Groups effective configuration mein merge hote hain; local statements jeette hain.</p></div>

<h3>Wildcards</h3>
<p>Angle brackets mein naam <b>wildcards</b> hain: <code>&lt;ge-*&gt;</code> <code>ge-</code> se shuru hone wale har interface naam ko match karta hai, <code>&lt;*&gt;</code> kuch bhi match karta hai. Zaroori rule: wildcards sirf un statements ko match karte hain jo configuration mein <b>pehle se maujood</b> hain. Agar <code>ge-0/0/5</code> configure nahi hai to use kuch inherit nahi hota, kyunki inheritance maujooda objects ki missing values bharti hai; objects banati nahi.</p>

<h3>Local configuration jeetti hai</h3>
<p>Normal configuration mein likha statement group par bhaari padta hai. Agar <code>ge-0/0/2</code> ka apna <code>mtu 1500</code> hai to us port ke liye group ka 9000 ignore hota hai. Group edit kiye bina exceptions aise banate hain.</p>
<pre class="code">set interfaces ge-0/0/2 mtu 1500        <span class="c">! local statement GE-STANDARD ko override karta hai</span></pre>

<h3>Kya inherit hua yeh dekhna</h3>
<p>Normal <code>show</code> inherited statements chhupata hai, isliye interface par MTU nahi dikhta chahe woh 9000 ho. <code>display inheritance</code> use karo:</p>
<pre class="code">lab@NK-BLR-DIST# show interfaces ge-0/0/1 | display inheritance
##
## 'mtu' was inherited from group 'GE-STANDARD'
##
<span class="hl">mtu 9000;</span>
unit 0 {
    family inet {
        address 10.50.1.1/24;
    }
}

lab@NK-BLR-DIST&gt; show interfaces ge-0/0/1 | match MTU
  Link-level type: Ethernet, MTU: 9000, Speed: 1000mbps</pre>
<p><code>show | display inheritance no-comments</code> ## notes hata deta hai; <code>show | display set | display inheritance</code> effective set commands print karta hai. <code>apply-groups-except NAME</code> ek group ko diye gaye level ke neeche apply hone se rokta hai.</p>

<h3>Lab walkthrough: Bengaluru distribution router</h3>
<p>Standard: har routed <code>ge-</code> port MTU 9000 par chale, sirf legacy file server wala port (ge-0/0/2, SRV 10.50.2.20) 1500 par rahe; har box ek hi banner dikhaye aur SSH chalaye. R1 ke paas ge-0/0/0 (10.50.12.1/30, R2 ki taraf), ge-0/0/1 (10.50.1.1/24, PC1) aur ge-0/0/2 (10.50.2.1/24) hain.</p>
<pre class="code">lab@NK-BLR-DIST# set groups GE-STANDARD interfaces &lt;ge-*&gt; mtu 9000
lab@NK-BLR-DIST# set apply-groups GE-STANDARD
lab@NK-BLR-DIST# set interfaces ge-0/0/2 mtu 1500
lab@NK-BLR-DIST# set groups GLOBAL system login message "NK network - authorised staff only"
lab@NK-BLR-DIST# set groups GLOBAL system services ssh
lab@NK-BLR-DIST# set apply-groups GLOBAL
lab@NK-BLR-DIST# commit
lab@NK-BLR-DIST# show interfaces | display inheritance</pre>
<p>Checks: <code>show interfaces ge-0/0/1</code> MTU 9000 batata hai, <code>show interfaces ge-0/0/2</code> MTU 1500, aur SSH sun raha hai kyunki woh GLOBAL se aaya. Sawaal "kitne interfaces 9000 inherit karte hain?" ka jawab hai <b>2</b>: ge-0/0/0 aur ge-0/0/1. ge-0/0/2 locally override hai, aur unconfigured ports kuch inherit nahi karte.</p>

<h3>Kaam ke built-in groups</h3>
<p>Junos <code>re0</code> aur <code>re1</code> group names ko dual-RE devices par per-Routing-Engine settings ke liye reserve karta hai (har RE ka apna host name aur management address ho sakta hai), aur <code>junos-defaults</code> system ke apne default statements rakhta hai, jaise predefined applications aur login classes.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke 40 branch routers hain. Har ek par NTP, syslog, SNMP aur banner statements type karne ki jagah team unhe ek group <code>NK-BASE</code> mein rakhti hai aur har router par <code>set apply-groups NK-BASE</code> chalati hai. NTP server badle to ek group edit karke sab devices par push kar dete hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Group banakar <code>apply-groups</code> bhool jaana; umeed karna ki wildcard unconfigured interfaces bana dega; is par hairan hona ki plain <code>show</code> inherited values nahi dikhata; groups ka galat order, jisse general group specific group ko override kar de.</p></div>
<div class="exam"><p><b>Exam trap.</b> Groups ko <code>apply-groups</code> chahiye. Local configuration group values se jeetti hai. Wildcards sirf maujooda statements par lagte hain. <code>show | display inheritance</code> inherited statements dikhata hai aur source group ka naam batata hai.</p></div>

<div class="scn"><h4>Jumbo frames aur file server</h4><p>Platform upgrade ke baad ge-0/0/2 par file server bade transfers drop karne laga. Jaanch mein pata chala ki naye global group ne saare ge- ports par MTU 9000 lagaya tha, lekin server ka NIC sirf 1500 support karta hai. Engineer ne local <code>set interfaces ge-0/0/2 mtu 1500</code> jod diya aur problem gayab, bina us group ko chhue jo 39 aur routers use karte hain.</p><p><b>Lesson:</b> exceptions locally banao; standards groups mein rakho.</p></div>

<div class="iv"><p class="q">"Configuration groups kya hain aur kyun use karte hain?"</p><p>Group configuration ka reusable block hai jo <code>apply-groups</code> se apply hota hai. <code>&lt;ge-*&gt;</code> jaise wildcards ke saath ek statement kai interfaces configure kar sakta hai. Yeh standards enforce karte hain, typing errors kam karte hain aur exceptions simple rakhte hain kyunki local configuration group values ko override karti hai. Result ko <code>show | display inheritance</code> se check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>set groups NAME</code> se define; <code>set apply-groups NAME</code> se activate.</li>
<li>Angle brackets ke wildcards sirf maujooda statements ko match karte hain.</li>
<li>Local configuration group configuration se jeetti hai; list mein pehla group ties jeetta hai.</li>
<li><code>show | display inheritance</code> effective configuration aur uska source dikhata hai.</li>
<li><code>apply-groups-except</code> level ke neeche group exclude karta hai; re0 aur re1 per-RE groups hain.</li>
</ul></div>
`}};export{e as default};