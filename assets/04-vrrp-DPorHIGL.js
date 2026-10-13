var e={id:`vrrp`,h:{en:`VRRP on Junos: a shared gateway for the LAN`,hi:`Junos par VRRP: LAN ke liye shared gateway`},body:{en:`
<p>Every host on a LAN is configured with one default gateway address. If that single router dies, every host loses the network, even when a second router is sitting right next to it. We cannot ask hundreds of PCs to change their gateway at 3 a.m. VRRP, the Virtual Router Redundancy Protocol, solves this: two or more routers share one <b>virtual</b> gateway address, and if the active one fails another takes over the same address.</p>

<h3>The analogy: one phone number, two receptionists</h3>
<p>The clinic publishes a single phone number. Whichever receptionist is on duty answers. When she goes home, the second one picks up the same number. Patients never learn a new number. The phone number is the <b>virtual IP (VIP)</b>; the receptionists are the routers.</p>

<h3>Key terms</h3>
<dl class="terms">
<dt>VRRP group</dt><dd>A set of routers sharing one virtual router, identified by a group number (10 in our lab).</dd>
<dt>Virtual IP (VIP)</dt><dd>The gateway address the hosts use, 172.16.10.1 in the lab. It is not tied to one router.</dd>
<dt>Virtual MAC</dt><dd>The MAC the master answers ARP with: <code>00:00:5e:00:01:XX</code>, where XX is the group number in hexadecimal (group 10 = 0a).</dd>
<dt>Master</dt><dd>The router currently owning the VIP and forwarding for it.</dd>
<dt>Backup</dt><dd>A standby that listens to the master's advertisements and takes over if they stop.</dd>
<dt>Priority</dt><dd>0-255. Highest wins. Default 100. 255 is reserved for the router that <i>owns</i> the VIP as its own interface address.</dd>
<dt>Preempt</dt><dd>A higher-priority router takes the master role back from a lower one. On by default in Junos.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VRRP group with two routers">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">R3-WAN  198.51.100.1</text>
<rect x="90" y="85" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">R1  priority 200</text><text x="175" y="130" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.2  MASTER</text>
<rect x="380" y="85" width="170" height="60" rx="10" fill="#bae6fd"/><text x="465" y="110" text-anchor="middle" class="svg-ink" font-size="13">R2  priority 100</text><text x="465" y="130" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.3  BACKUP</text>
<line x1="175" y1="85" x2="290" y2="50" stroke="#64748b" stroke-width="2"/><line x1="465" y1="85" x2="350" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="180" width="520" height="36" rx="8" fill="#fde68a"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="13">LAN 172.16.10.0/24   hosts use VIP 172.16.10.1</text>
<line x1="175" y1="145" x2="175" y2="180" stroke="#64748b" stroke-width="2"/><line x1="465" y1="145" x2="465" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">advertisements every 1 s</text>
</svg><p class="cap">Hosts talk to the VIP. R1 answers as master; R2 waits and listens.</p></div>

<h3>How it works</h3>
<ol>
<li>The master sends a VRRP advertisement every second (advertise interval 1 s) to the multicast address 224.0.0.18, IP protocol 112.</li>
<li>Backups listen. If they hear nothing for the <b>master-down interval</b> (about three advertisement intervals, a little over 3 seconds), they assume the master failed.</li>
<li>The highest-priority backup becomes master and starts answering ARP for the VIP with the virtual MAC. Hosts keep their ARP entry and gateway: only the router behind the MAC changes.</li>
<li>When the old master returns with a higher priority, preemption hands the role back.</li>
</ol>

<h3>Configuration (the Kochi clinic lab)</h3>
<p>On Junos, VRRP is configured under the interface <b>address</b>, not under the interface alone:</p>
<pre class="code"><span class="c">! R1: preferred master</span>
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 virtual-address 172.16.10.1
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 priority 200
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 accept-data

<span class="c">! R2: backup, default priority 100</span>
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.3/24 vrrp-group 10 virtual-address 172.16.10.1
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.3/24 vrrp-group 10 accept-data
commit</pre>

<h3>Verification</h3>
<pre class="out">lab@R1&gt; show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   <span class="hl">master</span>   Active    A 1.000  lcl    172.16.10.2
                                                              vip    172.16.10.1

lab@R2&gt; show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   <span class="hl">backup</span>   Active    D 3.609  lcl    172.16.10.3
                                                              vip    172.16.10.1
                                                              mas    172.16.10.2</pre>
<p>Read it: R1 is master and its timer is the <b>A</b>dvertisement timer (1.000 s). R2 is backup and its timer is the <b>D</b>own timer (3.609 s), the time it waits before taking over. The <code>lcl</code> row is the local address, <code>vip</code> the virtual address, and <code>mas</code> shows the master's real address as seen by the backup.</p>
<pre class="out">lab@R1&gt; show vrrp detail
Physical interface: ge-0/0/1, Unit: 0, Address: 172.16.10.2/24
  Interface state: up, Group: 10, State: master, VRRP Mode: Active
  Priority: 200, Advertisement interval: 1, Authentication type: none
  Preempt: yes, Accept-data mode: <span class="hl">yes</span>, VIP count: 1, VIP: 172.16.10.1
  Virtual Mac: 00:00:5e:00:01:0a</pre>

<h3>accept-data: why the gateway does not answer pings</h3>
<p>This catches nearly everyone. By default a Junos master that does <b>not</b> own the VIP as its own interface address <b>drops packets sent to the VIP</b>, though it still forwards transit traffic. Without <code>accept-data</code>, a host can reach the Internet through the gateway but cannot ping the gateway. Real output from the lab before accept-data is added, then after:</p>
<pre class="out">PC1&gt; ping 172.16.10.1
172.16.10.1 icmp_seq=1 timeout
172.16.10.1 icmp_seq=2 timeout

PC1&gt; ping 198.51.100.1
84 bytes from 198.51.100.1 icmp_seq=1 ttl=63 time=0.500 ms

<span class="c">! after: set ... vrrp-group 10 accept-data on R1 and commit</span>
PC1&gt; ping 172.16.10.1
84 bytes from 172.16.10.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>Note <code>Accept-data mode: no</code> in <code>show vrrp detail</code> in the first case. The behaviour exists so that a spoofed ping to the VIP is not answered by the wrong device; enable it when you want the VIP pingable (monitoring, troubleshooting).</p>

<div class="eg"><p><b>Worked example.</b> R1 has priority 200 and R2 has 100. R1 powers off. R2 hears nothing for about 3.6 seconds, becomes master, and starts answering for 172.16.10.1 with MAC 00:00:5e:00:01:0a. PC1 loses a few packets and then continues with the same gateway setting. When R1 returns, its higher priority makes it preempt, and the role moves back.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Different group numbers on the two routers (they never see each other as one group); different virtual addresses; a VIP outside the interface subnet; forgetting accept-data and then believing the gateway is down; same priority on both (the higher IP address wins, which is rarely what you intended).</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos defaults: priority 100, preempt on, advertise-interval 1 second, accept-data off. Priority 255 is for the VIP owner only. VRRP uses protocol 112 to 224.0.0.18.</p></div>

<div class="scn"><h4>The gateway that would not ping</h4><p>A new clinic switch went live and the monitoring system reported the gateway as down, while users browsed normally. VRRP was fine. The monitoring tool pinged the VIP, which the master discarded because accept-data was off. Adding <code>accept-data</code> on both routers turned the check green without touching the users.</p><p><b>Lesson:</b> "ping the gateway fails" and "gateway is down" are different statements.</p></div>

<div class="iv"><p class="q">"How does VRRP election work and how fast is failover?"</p><p>The highest priority wins mastership; the master advertises every second to 224.0.0.18. Backups take over when advertisements stop for about three intervals, so failover is roughly 3 to 4 seconds with defaults, and hosts keep the same gateway IP and virtual MAC. Preempt returns the role to the higher-priority router when it recovers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRRP gives hosts one virtual gateway shared by several routers.</li>
<li>Highest priority is master; defaults: priority 100, preempt on, 1-second advertisements.</li>
<li>Configure it under the interface address: <code>vrrp-group N virtual-address ...</code>.</li>
<li>Virtual MAC is 00:00:5e:00:01:XX with XX = group in hex.</li>
<li>Without accept-data a non-owner master drops packets addressed to the VIP.</li>
</ul></div>
`,hi:`
<p>LAN ke har host mein ek default gateway address configured hota hai. Woh akela router mar jaaye to har host network kho deta hai, chahe bagal mein doosra router baitha ho. Hum subah 3 baje sau PCs se gateway badalne ko nahi keh sakte. VRRP, Virtual Router Redundancy Protocol, yeh solve karta hai: do ya zyada routers ek <b>virtual</b> gateway address share karte hain, aur active fail ho to doosra wahi address sambhal leta hai.</p>

<h3>Analogy: ek phone number, do receptionists</h3>
<p>Clinic ek hi phone number publish karti hai. Jo receptionist duty par hai woh uthati hai. Woh ghar chali jaaye to doosri wahi number uthati hai. Patients ko naya number kabhi nahi seekhna padta. Phone number <b>virtual IP (VIP)</b> hai; receptionists routers hain.</p>

<h3>Key terms</h3>
<dl class="terms">
<dt>VRRP group</dt><dd>Ek virtual router share karne wale routers ka set, group number se pehchana jaata hai (hamare lab mein 10).</dd>
<dt>Virtual IP (VIP)</dt><dd>Hosts jo gateway address use karte hain, lab mein 172.16.10.1. Yeh ek router se bandha nahi.</dd>
<dt>Virtual MAC</dt><dd>Master ARP ka jawab is MAC se deta hai: <code>00:00:5e:00:01:XX</code>, jahan XX group number hexadecimal mein hai (group 10 = 0a).</dd>
<dt>Master</dt><dd>Jo router abhi VIP ka malik hai aur uske liye forward karta hai.</dd>
<dt>Backup</dt><dd>Standby jo master ki advertisements sunta hai aur band hone par kaam sambhalta hai.</dd>
<dt>Priority</dt><dd>0-255. Sabse zyada jeetta hai. Default 100. 255 us router ke liye reserved hai jo VIP ko apne interface address ke roop mein <i>own</i> karta hai.</dd>
<dt>Preempt</dt><dd>Zyada priority wala router kam wale se master role wapas le leta hai. Junos mein default on.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Do routers ke saath VRRP group">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">R3-WAN  198.51.100.1</text>
<rect x="90" y="85" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">R1  priority 200</text><text x="175" y="130" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.2  MASTER</text>
<rect x="380" y="85" width="170" height="60" rx="10" fill="#bae6fd"/><text x="465" y="110" text-anchor="middle" class="svg-ink" font-size="13">R2  priority 100</text><text x="465" y="130" text-anchor="middle" class="svg-muted" font-size="12">172.16.10.3  BACKUP</text>
<line x1="175" y1="85" x2="290" y2="50" stroke="#64748b" stroke-width="2"/><line x1="465" y1="85" x2="350" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="180" width="520" height="36" rx="8" fill="#fde68a"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="13">LAN 172.16.10.0/24   hosts VIP 172.16.10.1 use karte hain</text>
<line x1="175" y1="145" x2="175" y2="180" stroke="#64748b" stroke-width="2"/><line x1="465" y1="145" x2="465" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">advertisements har 1 s</text>
</svg><p class="cap">Hosts VIP se baat karte hain. R1 master ke roop mein jawab deta hai; R2 sunta hai aur intezaar karta hai.</p></div>

<h3>Kaise kaam karta hai</h3>
<ol>
<li>Master har second (advertise interval 1 s) multicast address 224.0.0.18 par, IP protocol 112, VRRP advertisement bhejta hai.</li>
<li>Backups sunte hain. <b>Master-down interval</b> (lagbhag teen advertisement intervals, 3 second se thoda zyada) tak kuch na sunayi de to maan lete hain ki master fail ho gaya.</li>
<li>Sabse zyada priority wala backup master ban jaata hai aur virtual MAC se VIP ke ARP ka jawab dene lagta hai. Hosts ki ARP entry aur gateway wahi rehte hain: sirf MAC ke peeche ka router badalta hai.</li>
<li>Purana master zyada priority ke saath wapas aaye to preemption role lauta deta hai.</li>
</ol>

<h3>Configuration (Kochi clinic lab)</h3>
<p>Junos mein VRRP interface ke <b>address</b> ke neeche configure hota hai, akele interface ke neeche nahi:</p>
<pre class="code"><span class="c">! R1: preferred master</span>
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 virtual-address 172.16.10.1
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 priority 200
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 accept-data

<span class="c">! R2: backup, default priority 100</span>
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.3/24 vrrp-group 10 virtual-address 172.16.10.1
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.3/24 vrrp-group 10 accept-data
commit</pre>

<h3>Verification</h3>
<pre class="out">lab@R1&gt; show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   <span class="hl">master</span>   Active    A 1.000  lcl    172.16.10.2
                                                              vip    172.16.10.1

lab@R2&gt; show vrrp
Interface     State       Group   VR state VR Mode   Timer    Type   Address
ge-0/0/1.0    up             10   <span class="hl">backup</span>   Active    D 3.609  lcl    172.16.10.3
                                                              vip    172.16.10.1
                                                              mas    172.16.10.2</pre>
<p>Padho: R1 master hai aur uska timer <b>A</b>dvertisement timer hai (1.000 s). R2 backup hai aur uska timer <b>D</b>own timer hai (3.609 s), jitna woh takeover se pehle intezaar karta hai. <code>lcl</code> row local address hai, <code>vip</code> virtual address, aur <code>mas</code> backup ko dikhta master ka asli address.</p>
<pre class="out">lab@R1&gt; show vrrp detail
Physical interface: ge-0/0/1, Unit: 0, Address: 172.16.10.2/24
  Interface state: up, Group: 10, State: master, VRRP Mode: Active
  Priority: 200, Advertisement interval: 1, Authentication type: none
  Preempt: yes, Accept-data mode: <span class="hl">yes</span>, VIP count: 1, VIP: 172.16.10.1
  Virtual Mac: 00:00:5e:00:01:0a</pre>

<h3>accept-data: gateway ping ka jawab kyun nahi deta</h3>
<p>Yeh lagbhag sabko pakadta hai. Default mein Junos master jo VIP ka <b>owner nahi</b> hai, VIP par bheje gaye <b>packets drop</b> karta hai, jabki transit traffic forward karta rehta hai. <code>accept-data</code> ke bina host Internet tak gateway se pahunch sakta hai lekin gateway ko ping nahi kar sakta. accept-data jodne se pehle aur baad ka lab ka real output:</p>
<pre class="out">PC1&gt; ping 172.16.10.1
172.16.10.1 icmp_seq=1 timeout
172.16.10.1 icmp_seq=2 timeout

PC1&gt; ping 198.51.100.1
84 bytes from 198.51.100.1 icmp_seq=1 ttl=63 time=0.500 ms

<span class="c">! baad mein: R1 par set ... vrrp-group 10 accept-data aur commit</span>
PC1&gt; ping 172.16.10.1
84 bytes from 172.16.10.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>Pehle case mein <code>show vrrp detail</code> mein <code>Accept-data mode: no</code> dekho. Yeh behaviour isliye hai ki VIP par spoofed ping ka jawab galat device na de; jab VIP pingable chahiye (monitoring, troubleshooting) tab enable karo.</p>

<div class="eg"><p><b>Worked example.</b> R1 ki priority 200 aur R2 ki 100 hai. R1 band hota hai. R2 lagbhag 3.6 second kuch nahi sunta, master ban jaata hai, aur MAC 00:00:5e:00:01:0a ke saath 172.16.10.1 ka jawab dene lagta hai. PC1 kuch packets kho deta hai aur phir wahi gateway setting ke saath chalta hai. R1 wapas aaye to uski zyada priority use preempt karwati hai aur role wapas chala jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Dono routers par alag group numbers (woh kabhi ek group nahi dekhte); alag virtual addresses; interface subnet ke bahar VIP; accept-data bhoolna aur phir gateway ko down maan lena; dono par same priority (zyada IP address jeetta hai, jo shayad hi aapka iraada ho).</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos defaults: priority 100, preempt on, advertise-interval 1 second, accept-data off. Priority 255 sirf VIP owner ke liye. VRRP protocol 112 se 224.0.0.18 par chalta hai.</p></div>

<div class="scn"><h4>Gateway jo ping nahi karta tha</h4><p>Naya clinic switch live hua aur monitoring system ne gateway ko down bataya, jabki users normal browse kar rahe the. VRRP theek tha. Monitoring tool VIP ko ping karta tha, jise master discard karta tha kyunki accept-data off tha. Dono routers par <code>accept-data</code> lagane se check hara ho gaya aur users ko chhua bhi nahi.</p><p><b>Lesson:</b> "gateway ka ping fail hota hai" aur "gateway down hai" alag baatein hain.</p></div>

<div class="iv"><p class="q">"VRRP election kaise kaam karta hai aur failover kitna tez hai?"</p><p>Sabse zyada priority mastership jeetti hai; master har second 224.0.0.18 par advertise karta hai. Advertisements lagbhag teen intervals band rahein to backups takeover karte hain, isliye defaults ke saath failover lagbhag 3 se 4 second ka hai, aur hosts same gateway IP aur virtual MAC rakhte hain. Preempt recover hone par role zyada priority wale router ko lauta deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRRP hosts ko kai routers dwara share kiya hua ek virtual gateway deta hai.</li>
<li>Sabse zyada priority master hai; defaults: priority 100, preempt on, 1-second advertisements.</li>
<li>Interface address ke neeche configure karo: <code>vrrp-group N virtual-address ...</code>.</li>
<li>Virtual MAC 00:00:5e:00:01:XX hai, XX = hex mein group.</li>
<li>accept-data ke bina non-owner master VIP par aaye packets drop karta hai.</li>
</ul></div>
`}};export{e as default};