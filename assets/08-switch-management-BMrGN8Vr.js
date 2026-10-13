var e={id:`switch-mgmt`,h:{en:`Switch management: the VLAN 1 SVI and ip default-gateway`,hi:`Switch management: VLAN 1 SVI aur ip default-gateway`},body:{en:`
<p>A Layer 2 switch is like a postal sorting room: it reads the address on each envelope (the destination MAC) and pushes it to the right pigeonhole, without ever needing a postal address of its own. So why do we give a switch an IP address at all? Because the <b>people who run the sorting room</b> need to phone it. The IP address is not for forwarding user traffic; it is for managing the switch.</p>

<h3>What the management IP is for</h3>
<p>Without an IP address a switch forwards frames perfectly, but you can only manage it from the console. With an IP address you can:</p>
<ul>
<li>log in remotely with <b>SSH</b> (or Telnet in a lab) from your desk,</li>
<li>send its logs to a <b>syslog</b> server and its alarms and counters to an <b>SNMP</b> monitoring system,</li>
<li>synchronise its clock with <b>NTP</b>, back up its configuration and upgrade its IOS over the network,</li>
<li><b>ping</b> from the switch itself when troubleshooting.</li>
</ul>

<h3>Where the address goes: the SVI</h3>
<p>Switch ports are Layer 2 ports, so you cannot put an IP address on <code>FastEthernet0/1</code> of a Layer 2 switch. Instead, the switch has a virtual Layer 3 interface for a VLAN, called a <b>switch virtual interface (SVI)</b>. By default every port is in <b>VLAN 1</b>, so on a new switch the SVI to use is <code>interface Vlan1</code>. You will learn VLANs properly in the VLAN module; for now, think of VLAN 1 as "the one LAN every port starts in".</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch SVI and default gateway">
<rect x="200" y="20" width="240" height="150" rx="12" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">SW1 (Layer 2 switch)</text>
<rect x="250" y="60" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">interface Vlan1</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.2/24</text>
<rect x="220" y="125" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="260" y="145" text-anchor="middle" class="svg-ink" font-size="12">Fa0/1</text>
<rect x="340" y="125" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="380" y="145" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1</text>
<line x1="320" y1="104" x2="260" y2="125" stroke="#64748b" stroke-width="2"/><line x1="320" y1="104" x2="380" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="140" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="90" y="156" text-anchor="middle" class="svg-muted" font-size="12">.10</text>
<rect x="490" y="120" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0</text><text x="555" y="156" text-anchor="middle" class="svg-muted" font-size="12">.1 = gateway</text>
<line x1="150" y1="140" x2="220" y2="140" stroke="#64748b" stroke-width="2"/><line x1="420" y1="140" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="13">ip default-gateway 192.168.10.1: how SW1 answers admins on other subnets</text>
</svg><p class="cap">The SVI is the switch's own "host" inside VLAN 1. The default gateway lets it reply beyond its subnet.</p></div>

<h3>Configuration</h3>
<pre class="code">Switch(config)# hostname SW1
SW1(config)# interface vlan 1
SW1(config-if)# ip address 192.168.10.2 255.255.255.0
SW1(config-if)# no shutdown          <span class="c">! the SVI can be shut by default</span>
SW1(config-if)# exit
SW1(config)# ip default-gateway 192.168.10.1
SW1(config)# interface FastEthernet0/1
SW1(config-if)# description PC1
SW1(config-if)# interface GigabitEthernet0/1
SW1(config-if)# description Uplink-R1
SW1(config-if)# end</pre>

<h3>Why the switch needs ip default-gateway</h3>
<p>A Layer 2 switch does not route. Its IP stack behaves like a PC: it can talk directly to hosts in its own subnet, and for everything else it must send traffic to a gateway. If your admin laptop is on 10.50.0.0/24 and the switch is on 192.168.10.0/24, the switch receives your SSH request fine, but its reply has nowhere to go without <code>ip default-gateway</code>. The session simply times out.</p>
<p>A <b>Layer 3 switch</b> with <code>ip routing</code> enabled ignores <code>ip default-gateway</code>; it uses its routing table, so you give it a default route (<code>ip route 0.0.0.0 0.0.0.0 192.168.10.1</code>) instead. You will meet that in the routing modules.</p>

<h3>SVI states</h3>
<p>An SVI comes up only when two things are true: it is not shut down, and at least one port in that VLAN is up (in a forwarding state). An SVI whose VLAN has no active port shows <code>up down</code>. In lab 2 Fa0/1 (PC1) and Gi0/1 (R1) are in VLAN 1 and up, so Vlan1 reaches <code>up up</code> after <code>no shutdown</code>.</p>

<pre class="out">SW1# show ip interface brief | include Vlan|up
FastEthernet0/1        unassigned      YES unset  up                    up
GigabitEthernet0/1     unassigned      YES unset  up                    up
<span class="hl">Vlan1                  192.168.10.2    YES manual up                    up</span>

SW1# ping 192.168.10.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.10.1, timeout is 2 seconds:
<span class="hl">.!!!!</span>
Success rate is 80 percent (4/5), round-trip min/avg/max = 1/1/2 ms</pre>
<p>The first dot is normal: the first echo was dropped while the switch resolved R1's MAC address with ARP. A second ping shows <code>!!!!!</code>.</p>

<div class="eg"><p><b>Worked example.</b> An admin on 10.50.0.20 tries to SSH to SW1 at 192.168.10.2 and times out. On the console, <code>show running-config | include default-gateway</code> returns nothing. After <code>ip default-gateway 192.168.10.1</code> the session connects immediately. The request always reached the switch; only the reply was lost.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Trying <code>ip address</code> on a physical port of a Layer 2 switch (it is not accepted). Forgetting <code>no shutdown</code> on the SVI. Setting a default gateway that is not in the SVI's subnet. Using <code>ip default-gateway</code> on a Layer 3 switch with routing enabled and wondering why it has no effect.</p></div>

<div class="exam"><p><b>Exam traps.</b> A Layer 2 switch needs an IP address only for management, placed on an SVI. <code>ip default-gateway</code> is used when IP routing is disabled; with <code>ip routing</code> use a default route. An SVI is up/up only when it is not shut and at least one port in its VLAN is up. Best practice is a dedicated management VLAN instead of VLAN 1.</p></div>

<div class="scn"><h4>The switch that could be pinged but never managed</h4><p>After a floor move, the monitoring system showed an access switch as "up" (ping from the same subnet worked) but backups and SSH from the NOC failed every night. The switch's SVI had been re-addressed into the new floor subnet, but the old <code>ip default-gateway</code> pointing at the previous floor's router remained. Replies to the NOC went to a gateway that no longer existed on that subnet. Updating the default gateway fixed SSH, SNMP and backups at once.</p><p><b>Lesson:</b> when a switch answers local pings but not remote management, check <code>ip default-gateway</code> first.</p></div>

<div class="iv"><p class="q">"Why does a Layer 2 switch need an IP address, and where do you configure it?"</p><p>Strong answer: it does not need one to forward frames; the IP is for management: SSH, SNMP, syslog, NTP, backups and ping. It goes on an SVI such as <code>interface Vlan1</code> (ideally a dedicated management VLAN) with <code>no shutdown</code>, plus <code>ip default-gateway</code> so the switch can reply to hosts in other subnets. On a Layer 3 switch with routing enabled you use a default route instead.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A Layer 2 switch forwards frames without an IP; the IP address is only for managing it.</li>
<li>The management address goes on an SVI (<code>interface Vlan1</code> on a new switch) with <code>no shutdown</code>.</li>
<li><code>ip default-gateway</code> lets the switch reply to admins and servers in other subnets.</li>
<li>An SVI is up/up only if it is not shut and a port in its VLAN is up.</li>
<li>Layer 3 switches with <code>ip routing</code> use a default route, not <code>ip default-gateway</code>.</li>
</ul></div>
`,hi:`
<p>Layer 2 switch ek postal sorting room jaisa hai: yeh har lifaafe par likha address (destination MAC) padhta hai aur use sahi khaane mein daal deta hai, bina kabhi apna postal address chahe. To hum switch ko IP address dete hi kyun hain? Kyunki <b>sorting room chalane wale logon</b> ko use phone karna padta hai. IP address user traffic forward karne ke liye nahi hai; yeh switch manage karne ke liye hai.</p>

<h3>Management IP kis kaam ka hai</h3>
<p>IP address ke bina switch frames perfectly forward karta hai, lekin aap use sirf console se manage kar sakte ho. IP address ke saath aap:</p>
<ul>
<li>apni desk se <b>SSH</b> (ya lab mein Telnet) se remotely login kar sakte ho,</li>
<li>uske logs <b>syslog</b> server par aur uske alarms aur counters <b>SNMP</b> monitoring system par bhej sakte ho,</li>
<li>uski clock <b>NTP</b> se sync kar sakte ho, network par uski configuration ka backup le sakte ho aur uska IOS upgrade kar sakte ho,</li>
<li>troubleshooting ke waqt khud switch se <b>ping</b> kar sakte ho.</li>
</ul>

<h3>Address kahan jaata hai: SVI</h3>
<p>Switch ports Layer 2 ports hain, isliye aap Layer 2 switch ke <code>FastEthernet0/1</code> par IP address nahi laga sakte. Iski jagah switch ke paas ek VLAN ke liye virtual Layer 3 interface hota hai, jise <b>switch virtual interface (SVI)</b> kehte hain. Default mein har port <b>VLAN 1</b> mein hota hai, isliye naye switch par use karne wala SVI <code>interface Vlan1</code> hai. VLANs aap VLAN module mein theek se seekhoge; abhi ke liye VLAN 1 ko "woh ek LAN jismein har port shuru hota hai" samjho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch SVI aur default gateway">
<rect x="200" y="20" width="240" height="150" rx="12" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">SW1 (Layer 2 switch)</text>
<rect x="250" y="60" width="140" height="44" rx="8" fill="#fde68a"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">interface Vlan1</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.2/24</text>
<rect x="220" y="125" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="260" y="145" text-anchor="middle" class="svg-ink" font-size="12">Fa0/1</text>
<rect x="340" y="125" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="380" y="145" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1</text>
<line x1="320" y1="104" x2="260" y2="125" stroke="#64748b" stroke-width="2"/><line x1="320" y1="104" x2="380" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="120" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="140" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="90" y="156" text-anchor="middle" class="svg-muted" font-size="12">.10</text>
<rect x="490" y="120" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="555" y="140" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0</text><text x="555" y="156" text-anchor="middle" class="svg-muted" font-size="12">.1 = gateway</text>
<line x1="150" y1="140" x2="220" y2="140" stroke="#64748b" stroke-width="2"/><line x1="420" y1="140" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="13">ip default-gateway 192.168.10.1: dusre subnets ke admins ko SW1 aise jawab deta hai</text>
</svg><p class="cap">SVI VLAN 1 ke andar switch ka apna "host" hai. Default gateway use subnet ke bahar reply karne deta hai.</p></div>

<h3>Configuration</h3>
<pre class="code">Switch(config)# hostname SW1
SW1(config)# interface vlan 1
SW1(config-if)# ip address 192.168.10.2 255.255.255.0
SW1(config-if)# no shutdown          <span class="c">! SVI default mein shut ho sakta hai</span>
SW1(config-if)# exit
SW1(config)# ip default-gateway 192.168.10.1
SW1(config)# interface FastEthernet0/1
SW1(config-if)# description PC1
SW1(config-if)# interface GigabitEthernet0/1
SW1(config-if)# description Uplink-R1
SW1(config-if)# end</pre>

<h3>Switch ko ip default-gateway kyun chahiye</h3>
<p>Layer 2 switch route nahi karta. Uska IP stack PC jaisa behave karta hai: yeh apne subnet ke hosts se seedhe baat kar sakta hai, aur baaki sab ke liye use traffic gateway ko bhejna padta hai. Agar aapka admin laptop 10.50.0.0/24 par hai aur switch 192.168.10.0/24 par, to switch ko aapki SSH request theek se mil jaati hai, lekin <code>ip default-gateway</code> ke bina uske reply ke paas jaane ki koi jagah nahi hoti. Session bas time out ho jaata hai.</p>
<p><code>ip routing</code> enabled wala <b>Layer 3 switch</b> <code>ip default-gateway</code> ko ignore karta hai; woh apni routing table use karta hai, isliye use aap default route dete ho (<code>ip route 0.0.0.0 0.0.0.0 192.168.10.1</code>). Yeh aap routing modules mein dekhoge.</p>

<h3>SVI states</h3>
<p>SVI tabhi up hota hai jab do cheezein sach hon: woh shut down na ho, aur us VLAN ka kam se kam ek port up ho (forwarding state mein). Jis SVI ke VLAN mein koi active port na ho woh <code>up down</code> dikhata hai. Lab 2 mein Fa0/1 (PC1) aur Gi0/1 (R1) VLAN 1 mein hain aur up hain, isliye <code>no shutdown</code> ke baad Vlan1 <code>up up</code> ho jaata hai.</p>

<pre class="out">SW1# show ip interface brief | include Vlan|up
FastEthernet0/1        unassigned      YES unset  up                    up
GigabitEthernet0/1     unassigned      YES unset  up                    up
<span class="hl">Vlan1                  192.168.10.2    YES manual up                    up</span>

SW1# ping 192.168.10.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.10.1, timeout is 2 seconds:
<span class="hl">.!!!!</span>
Success rate is 80 percent (4/5), round-trip min/avg/max = 1/1/2 ms</pre>
<p>Pehla dot normal hai: jab switch ARP se R1 ka MAC address resolve kar raha tha tab pehla echo drop hua. Dusri ping <code>!!!!!</code> dikhati hai.</p>

<div class="eg"><p><b>Worked example.</b> 10.50.0.20 par baitha admin 192.168.10.2 par SW1 mein SSH karne ki koshish karta hai aur time out hota hai. Console par <code>show running-config | include default-gateway</code> kuch nahi deta. <code>ip default-gateway 192.168.10.1</code> ke baad session turant connect ho jaata hai. Request hamesha switch tak pahunch rahi thi; sirf reply kho raha tha.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Layer 2 switch ke physical port par <code>ip address</code> try karna (accept nahi hota). SVI par <code>no shutdown</code> bhool jaana. Aisa default gateway set karna jo SVI ke subnet mein nahi hai. Routing enabled Layer 3 switch par <code>ip default-gateway</code> use karna aur sochna ki iska koi effect kyun nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Layer 2 switch ko IP address sirf management ke liye chahiye, jo SVI par lagta hai. <code>ip default-gateway</code> tab use hota hai jab IP routing disabled ho; <code>ip routing</code> ke saath default route use karo. SVI tabhi up/up hota hai jab woh shut na ho aur uske VLAN ka kam se kam ek port up ho. Best practice VLAN 1 ki jagah dedicated management VLAN hai.</p></div>

<div class="scn"><h4>Woh switch jo ping hota tha par kabhi manage nahi hota tha</h4><p>Floor move ke baad monitoring system ek access switch ko "up" dikhata tha (same subnet se ping chalta tha) lekin NOC se backups aur SSH har raat fail hote the. Switch ka SVI naye floor subnet mein re-address hua tha, lekin pichle floor ke router ki taraf point karta purana <code>ip default-gateway</code> reh gaya tha. NOC ko jaane wale replies aise gateway par jaa rahe the jo us subnet par ab tha hi nahi. Default gateway update karne se SSH, SNMP aur backups ek saath theek ho gaye.</p><p><b>Seekh:</b> jab switch local pings ka jawab de lekin remote management ka nahi, to sabse pehle <code>ip default-gateway</code> check karo.</p></div>

<div class="iv"><p class="q">"Layer 2 switch ko IP address kyun chahiye, aur aap use kahan configure karte ho?"</p><p>Strong answer: frames forward karne ke liye use IP nahi chahiye; IP management ke liye hai: SSH, SNMP, syslog, NTP, backups aur ping. Yeh <code>interface Vlan1</code> jaise SVI par lagta hai (behtar hai dedicated management VLAN) <code>no shutdown</code> ke saath, plus <code>ip default-gateway</code> taaki switch dusre subnets ke hosts ko reply kar sake. Routing enabled Layer 3 switch par iski jagah default route use hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 2 switch bina IP ke frames forward karta hai; IP address sirf use manage karne ke liye hai.</li>
<li>Management address SVI par jaata hai (naye switch par <code>interface Vlan1</code>) <code>no shutdown</code> ke saath.</li>
<li><code>ip default-gateway</code> switch ko dusre subnets ke admins aur servers ko reply karne deta hai.</li>
<li>SVI tabhi up/up hota hai jab woh shut na ho aur uske VLAN ka koi port up ho.</li>
<li><code>ip routing</code> wale Layer 3 switches default route use karte hain, <code>ip default-gateway</code> nahi.</li>
</ul></div>
`}};export{e as default};