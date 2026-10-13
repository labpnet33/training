var e={id:`config-and-verification`,h:{en:`Configuration and verification playbook`,hi:`Configuration aur verification playbook`},body:{en:`
<p>A good engineer builds multicast the same way every time, in the same order, and verifies each layer before moving to the next. This chapter is your playbook: the build order, the full configuration of the first lab, the verification commands and what a healthy answer looks like, and the Junos equivalents.</p>

<h3>The build order</h3>
<ol>
<li><b>Unicast first.</b> Every router must reach the RP address, and every last-hop router must reach the source subnet. PIM uses the unicast table; without it nothing else works.</li>
<li><b>Enable multicast routing</b> globally: <code>ip multicast-routing</code>. Without it the router drops multicast routing and PIM commands have no effect.</li>
<li><b>Enable PIM sparse mode on every interface on the path</b>: router-to-router links, the source LAN, every receiver LAN, and the RP loopback. A single missing interface splits the tree.</li>
<li><b>Tell every router the RP</b> (static RP here) or define the SSM range. The RP address must be the same on every router.</li>
<li><b>Receiver edge:</b> IGMP version (v3 for SSM), and DR priority if you want to choose the entry path.</li>
<li><b>Tuning, last:</b> <code>ip pim spt-threshold infinity</code> if policy requires.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Build order">
<rect x="5" y="40" width="95" height="56" rx="8" fill="#e2e8f0"/><text x="52" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Unicast</text><text x="52" y="82" text-anchor="middle" class="svg-muted" font-size="11">reach RP, source</text>
<rect x="110" y="40" width="100" height="56" rx="8" fill="#bae6fd"/><text x="160" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 multicast-</text><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="12">routing</text>
<rect x="220" y="40" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="270" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 PIM on</text><text x="270" y="82" text-anchor="middle" class="svg-ink" font-size="12">every link</text>
<rect x="330" y="40" width="100" height="56" rx="8" fill="#fde68a"/><text x="380" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 RP or SSM</text><text x="380" y="82" text-anchor="middle" class="svg-muted" font-size="11">same on all</text>
<rect x="440" y="40" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="487" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Receiver</text><text x="487" y="82" text-anchor="middle" class="svg-muted" font-size="11">IGMP, DR</text>
<rect x="545" y="40" width="90" height="56" rx="8" fill="#fed7aa"/><text x="590" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Tuning</text><text x="590" y="82" text-anchor="middle" class="svg-muted" font-size="11">spt-threshold</text>
</svg><p class="cap">Verify at each step; do not move on while a layer is wrong.</p></div>

<h3>Full configuration of the first lab</h3>
<pre class="code"><span class="c">! R2 - the RP</span>
ip multicast-routing
interface Loopback0
 ip address 2.2.2.2 255.255.255.255
 ip pim sparse-mode
interface GigabitEthernet0/1
 ip address 10.0.12.2 255.255.255.0
 ip pim sparse-mode
interface GigabitEthernet0/2
 ip address 10.0.23.2 255.255.255.0
 ip pim sparse-mode
interface GigabitEthernet0/3
 ip address 10.0.24.2 255.255.255.0
 ip pim sparse-mode
ip pim rp-address 2.2.2.2
!
<span class="c">! R4 - a last-hop router with a direct link to the source router</span>
ip multicast-routing
interface GigabitEthernet0/0
 ip address 10.20.4.1 255.255.255.0
 ip pim sparse-mode
interface GigabitEthernet0/2
 ip address 10.0.14.4 255.255.255.0
 ip pim sparse-mode
interface GigabitEthernet0/3
 ip address 10.0.24.4 255.255.255.0
 ip pim sparse-mode
ip pim rp-address 2.2.2.2</pre>
<p>R1 and R3 follow the same pattern: <code>ip multicast-routing</code>, PIM on every interface that carries multicast, and the same <code>ip pim rp-address</code>. Notice that the RP itself is also configured with its own address; every router, the RP included, has the identical line.</p>

<h3>Verification commands, in the order you should run them</h3>
<table class="cmp"><tr><th>Question</th><th>Command</th><th>Healthy answer</th></tr>
<tr><td>Who are my PIM neighbours?</td><td><code>show ip pim neighbor</code></td><td>One line per neighbour, uptime growing</td></tr>
<tr><td>Which interfaces run PIM, in which mode, who is DR?</td><td><code>show ip pim interface</code></td><td>S on every path interface; expected DR</td></tr>
<tr><td>Which RP do I use?</td><td><code>show ip pim rp mapping</code></td><td>The same RP on every router</td></tr>
<tr><td>Is the receiver known?</td><td><code>show ip igmp groups</code></td><td>Group listed on the receiver LAN</td></tr>
<tr><td>Which IGMP version?</td><td><code>show ip igmp interface</code></td><td>Version matches the receiver (3 for SSM)</td></tr>
<tr><td>Where does the tree run?</td><td><code>show ip mroute &lt;group&gt;</code></td><td>Incoming interface set, OIL not empty</td></tr>
<tr><td>Which way is the source or RP?</td><td><code>show ip rpf &lt;address&gt;</code></td><td>An interface that has a PIM neighbour</td></tr>
<tr><td>Did the receiver get data?</td><td>On the host: <code>show mcast</code></td><td>Packets received increasing</td></tr></table>
<pre class="out">R2#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    RP: 2.2.2.2 (?)

R4#show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
  RPF interface: GigabitEthernet0/3
  RPF neighbor: ? (10.0.24.2)
  RPF route/mask: 2.2.2.2/32
  RPF type: unicast (ospf)

R3#show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
239.20.1.1       GigabitEthernet0/0       00:02:39  00:02:21  10.20.3.10</pre>
<p>Use the host shell to generate and receive traffic: on the source host <code>mcast 239.20.1.1 10</code> sends ten datagrams, on a receiver <code>join 239.20.1.1</code> subscribes and <code>show mcast</code> counts what arrived. Do not rely on a ping to the group address as a proof; a stream seen by the receiver is the proof.</p>

<div class="note"><p><b>Junos note.</b> The same design on Junos. PIM runs per interface and sparse mode is the default. On the RP:</p>
<pre class="code">set protocols pim interface all
set protocols pim rp local address 2.2.2.2</pre>
<p>On every other router:</p>
<pre class="code">set protocols pim interface all
set protocols pim rp static address 2.2.2.2</pre>
<p>DR priority is set per interface and the SPT threshold takes a policy that selects the groups; IGMPv3 and SSM ranges are configured like this:</p>
<pre class="code">set protocols pim interface ge-0/0/1.0 priority 200
set protocols pim spt-threshold infinity &lt;policy-name&gt;
set protocols igmp interface ge-0/0/2.0 version 3
set routing-options multicast ssm-groups 232.0.0.0/8</pre>
<p>Verify with <code>show pim neighbors</code>, <code>show pim interfaces</code>, <code>show pim rps</code>, <code>show igmp group</code>, <code>show pim join extensive</code> and <code>show multicast route</code>. Junos does not need a global multicast-routing switch.</p></div>

<div class="eg"><p><b>Worked example.</b> A router has 6 interfaces; 4 carry multicast. Configuration needs one global line, 4 interface lines and one RP line, 6 lines in total. The verification takes 3 commands: <code>show ip pim neighbor</code> should list a neighbour on each of the 3 router-facing interfaces, <code>show ip pim interface</code> should list 4 interfaces in mode S, and <code>show ip pim rp mapping</code> should show the one RP.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing <code>ip pim rp-address</code> on the other routers and forgetting the RP itself. (2) PIM enabled on router links but not on the RP loopback or on the receiver LAN. (3) Pasting configuration before <code>ip multicast-routing</code> exists on a platform that rejects interface commands without it.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip multicast-routing</code> is global and has no per-interface form. <code>ip pim sparse-mode</code> is per interface. Both must exist for the router to take part.</p></div>

<div class="scn"><h4>The migration that skipped the loopback</h4><p>A college moved its RP from R2 to a new router and copied the interface configuration but not the Loopback0 PIM line. Joins still reached the RP, but registers were rejected silently on that platform: the stream appeared on the RP and went no further. A <code>show ip pim interface</code> on the new RP showed no Loopback0. After adding <code>ip pim sparse-mode</code> on the loopback the tree formed.</p><p><b>Lesson:</b> a checklist beats memory. Compare <code>show ip pim interface</code> against your design table.</p></div>

<div class="iv"><p class="q">"You are given a new router and told to add it to a multicast network. What do you configure and what do you verify?"</p><p>Strong answer: confirm unicast reachability to the RP and the sources, enable multicast routing, PIM sparse mode on all path interfaces, the same RP, IGMP settings on receiver LANs. Verify neighbours, interface modes, RP mapping, then mroute and host-side counters. Mention doing it in that order and checking each layer before the next.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: unicast, multicast-routing, PIM on every path interface, RP or SSM, receiver edge, tuning.</li>
<li>The RP needs PIM on its loopback and the same RP line as everyone else.</li>
<li>Verify with neighbours, interfaces, RP mapping, IGMP, mroute, RPF and host counters.</li>
<li>Junos: <code>protocols pim interface all</code>, <code>rp local</code> or <code>rp static</code>, priority per interface, ssm-groups.</li>
<li>A stream received by the host is the final proof.</li>
</ul></div>
`,hi:`
<p>Achha engineer multicast hamesha ek hi tareeke se, ek hi order mein banata hai, aur agli layer par jaane se pehle har layer verify karta hai. Yeh chapter aapka playbook hai: build order, pehle lab ki poori configuration, verification commands aur healthy jawab kaisa dikhta hai, aur Junos equivalents.</p>

<h3>Build order</h3>
<ol>
<li><b>Pehle unicast.</b> Har router ko RP address tak pahunchna chahiye, aur har last-hop router ko source subnet tak. PIM unicast table use karta hai; uske bina kuch nahi chalta.</li>
<li>Global mein <b>multicast routing enable karo</b>: <code>ip multicast-routing</code>. Iske bina router multicast routing drop karta hai aur PIM commands ka koi asar nahi hota.</li>
<li><b>Path ke har interface par PIM sparse mode enable karo</b>: router-to-router links, source LAN, har receiver LAN, aur RP loopback. Ek bhi missing interface tree ko tod deta hai.</li>
<li><b>Har router ko RP batao</b> (yahan static RP) ya SSM range define karo. RP address har router par same hona chahiye.</li>
<li><b>Receiver edge:</b> IGMP version (SSM ke liye v3), aur DR priority agar entry path chunna chahte ho.</li>
<li><b>Tuning, aakhir mein:</b> policy maange to <code>ip pim spt-threshold infinity</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Build order">
<rect x="5" y="40" width="95" height="56" rx="8" fill="#e2e8f0"/><text x="52" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Unicast</text><text x="52" y="82" text-anchor="middle" class="svg-muted" font-size="11">RP, source tak</text>
<rect x="110" y="40" width="100" height="56" rx="8" fill="#bae6fd"/><text x="160" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 multicast-</text><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="12">routing</text>
<rect x="220" y="40" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="270" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 PIM har</text><text x="270" y="82" text-anchor="middle" class="svg-ink" font-size="12">link par</text>
<rect x="330" y="40" width="100" height="56" rx="8" fill="#fde68a"/><text x="380" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 RP ya SSM</text><text x="380" y="82" text-anchor="middle" class="svg-muted" font-size="11">sab par same</text>
<rect x="440" y="40" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="487" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Receiver</text><text x="487" y="82" text-anchor="middle" class="svg-muted" font-size="11">IGMP, DR</text>
<rect x="545" y="40" width="90" height="56" rx="8" fill="#fed7aa"/><text x="590" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Tuning</text><text x="590" y="82" text-anchor="middle" class="svg-muted" font-size="11">spt-threshold</text>
</svg><p class="cap">Har step par verify karo; jab tak koi layer galat hai aage mat badho.</p></div>

<h3>Pehle lab ki poori configuration</h3>
<pre class="code"><span class="c">! R2 - RP</span>
ip multicast-routing
interface Loopback0
 ip address 2.2.2.2 255.255.255.255
 ip pim sparse-mode
interface GigabitEthernet0/1
 ip address 10.0.12.2 255.255.255.0
 ip pim sparse-mode
interface GigabitEthernet0/2
 ip address 10.0.23.2 255.255.255.0
 ip pim sparse-mode
interface GigabitEthernet0/3
 ip address 10.0.24.2 255.255.255.0
 ip pim sparse-mode
ip pim rp-address 2.2.2.2
!
<span class="c">! R4 - last-hop router jiska source router se direct link hai</span>
ip multicast-routing
interface GigabitEthernet0/0
 ip address 10.20.4.1 255.255.255.0
 ip pim sparse-mode
interface GigabitEthernet0/2
 ip address 10.0.14.4 255.255.255.0
 ip pim sparse-mode
interface GigabitEthernet0/3
 ip address 10.0.24.4 255.255.255.0
 ip pim sparse-mode
ip pim rp-address 2.2.2.2</pre>
<p>R1 aur R3 isi pattern par chalte hain: <code>ip multicast-routing</code>, multicast carry karne wale har interface par PIM, aur wahi <code>ip pim rp-address</code>. Dhyan do ki RP khud bhi apne address ke saath configured hai; har router par, RP par bhi, wahi line hoti hai.</p>

<h3>Verification commands, us order mein jisme chalane chahiye</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Command</th><th>Healthy jawab</th></tr>
<tr><td>Mere PIM neighbours kaun hain?</td><td><code>show ip pim neighbor</code></td><td>Har neighbour ki ek line, uptime badhta hua</td></tr>
<tr><td>Kaunse interfaces PIM chalate hain, kaunse mode mein, DR kaun hai?</td><td><code>show ip pim interface</code></td><td>Har path interface par S; expected DR</td></tr>
<tr><td>Main kaunsa RP use karta hoon?</td><td><code>show ip pim rp mapping</code></td><td>Har router par same RP</td></tr>
<tr><td>Kya receiver pata hai?</td><td><code>show ip igmp groups</code></td><td>Receiver LAN par group listed</td></tr>
<tr><td>Kaunsa IGMP version?</td><td><code>show ip igmp interface</code></td><td>Version receiver se match (SSM ke liye 3)</td></tr>
<tr><td>Tree kahan chalta hai?</td><td><code>show ip mroute &lt;group&gt;</code></td><td>Incoming interface set, OIL khaali nahi</td></tr>
<tr><td>Source ya RP ki taraf kaunsa raasta?</td><td><code>show ip rpf &lt;address&gt;</code></td><td>Aisa interface jis par PIM neighbour hai</td></tr>
<tr><td>Kya receiver ko data mila?</td><td>Host par: <code>show mcast</code></td><td>Packets received badhte hue</td></tr></table>
<pre class="out">R2#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    RP: 2.2.2.2 (?)

R4#show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
  RPF interface: GigabitEthernet0/3
  RPF neighbor: ? (10.0.24.2)
  RPF route/mask: 2.2.2.2/32
  RPF type: unicast (ospf)

R3#show ip igmp groups
IGMP Connected Group Membership
Group Address    Interface                Uptime    Expires   Last Reporter   Group Accounted
239.20.1.1       GigabitEthernet0/0       00:02:39  00:02:21  10.20.3.10</pre>
<p>Traffic generate aur receive karne ke liye host shell use karo: source host par <code>mcast 239.20.1.1 10</code> dus datagrams bhejta hai, receiver par <code>join 239.20.1.1</code> subscribe karta hai aur <code>show mcast</code> gino ki kitna aaya. Group address par ping ko proof mat maano; receiver ne stream dekhi, yahi proof hai.</p>

<div class="note"><p><b>Junos note.</b> Wahi design Junos par. PIM per interface chalta hai aur sparse mode default hai. RP par:</p>
<pre class="code">set protocols pim interface all
set protocols pim rp local address 2.2.2.2</pre>
<p>Baaki har router par:</p>
<pre class="code">set protocols pim interface all
set protocols pim rp static address 2.2.2.2</pre>
<p>DR priority per interface set hoti hai aur SPT threshold ek policy leta hai jo groups chunti hai; IGMPv3 aur SSM ranges aise configure hote hain:</p>
<pre class="code">set protocols pim interface ge-0/0/1.0 priority 200
set protocols pim spt-threshold infinity &lt;policy-name&gt;
set protocols igmp interface ge-0/0/2.0 version 3
set routing-options multicast ssm-groups 232.0.0.0/8</pre>
<p><code>show pim neighbors</code>, <code>show pim interfaces</code>, <code>show pim rps</code>, <code>show igmp group</code>, <code>show pim join extensive</code> aur <code>show multicast route</code> se verify karo. Junos mein global multicast-routing switch ki zaroorat nahi.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek router ke 6 interfaces hain; 4 multicast carry karte hain. Configuration mein ek global line, 4 interface lines aur ek RP line chahiye, kul 6 lines. Verification 3 commands leta hai: <code>show ip pim neighbor</code> ko 3 router-facing interfaces mein har ek par neighbour dikhana chahiye, <code>show ip pim interface</code> ko mode S mein 4 interfaces dikhane chahiye, aur <code>show ip pim rp mapping</code> ko ek RP dikhana chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Baaki routers par <code>ip pim rp-address</code> likhna aur RP khud ko bhool jaana. (2) Router links par PIM enable karna par RP loopback ya receiver LAN par nahi. (3) Us platform par jo <code>ip multicast-routing</code> ke bina interface commands reject karta hai, configuration pehle paste kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip multicast-routing</code> global hai aur uska per-interface form nahi hota. <code>ip pim sparse-mode</code> per interface hai. Router ke hissa lene ke liye dono hone chahiye.</p></div>

<div class="scn"><h4>Migration jisme loopback chhoot gaya</h4><p>Ek college ne apna RP R2 se naye router par move kiya aur interface configuration copy ki par Loopback0 ki PIM line nahi. Joins RP tak pahunchte rahe, par us platform par registers chupchaap reject hue: stream RP par dikhi aur aage nahi gayi. Naye RP par <code>show ip pim interface</code> ne Loopback0 nahi dikhaya. Loopback par <code>ip pim sparse-mode</code> jodne ke baad tree ban gaya.</p><p><b>Seekh:</b> checklist yaadasht se behtar hai. <code>show ip pim interface</code> ko apni design table se compare karo.</p></div>

<div class="iv"><p class="q">"Aapko naya router diya gaya aur ek multicast network mein jodne ko kaha gaya. Kya configure karoge aur kya verify karoge?"</p><p>Strong answer: RP aur sources tak unicast reachability confirm karo, multicast routing enable karo, saare path interfaces par PIM sparse mode, same RP, receiver LANs par IGMP settings. Verify karo neighbours, interface modes, RP mapping, phir mroute aur host-side counters. Kaho ki aap isi order mein karoge aur agli layer se pehle har layer check karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: unicast, multicast-routing, har path interface par PIM, RP ya SSM, receiver edge, tuning.</li>
<li>RP ko apne loopback par PIM chahiye aur baaki sabki tarah wahi RP line.</li>
<li>Neighbours, interfaces, RP mapping, IGMP, mroute, RPF aur host counters se verify karo.</li>
<li>Junos: <code>protocols pim interface all</code>, <code>rp local</code> ya <code>rp static</code>, per-interface priority, ssm-groups.</li>
<li>Host ko mili hui stream hi final proof hai.</li>
</ul></div>
`}};export{e as default};