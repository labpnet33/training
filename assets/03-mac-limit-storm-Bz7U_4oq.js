var e={id:`mac-limit-storm`,h:{en:`MAC limiting, persistent learning and storm control`,hi:`MAC limiting, persistent learning aur storm control`},body:{en:`
<p><b>How a switch learns.</b> Every time a frame arrives, the switch records the source MAC address and the port in its <b>Ethernet switching table</b> (the MAC table). When a frame arrives for a destination that is in the table, it goes out of one port only. When the destination is unknown, the switch <b>floods</b> the frame out of every port in the VLAN. This is efficient, but the table is finite. On an EX4300 it holds hundreds of thousands of entries, yet a simple tool can generate that many fake source addresses in minutes.</p>
<p><b>MAC flooding attack.</b> The attacker sends frames with random source MACs. The table fills, old entries are pushed out, and legitimate hosts are no longer found. The switch begins flooding user traffic to all ports, and anyone on the VLAN can capture it. Even without malice, a loop or a noisy device creates a similar effect. The defence is to decide how many addresses a port is allowed to learn.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="MAC limit on a port">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#fed7aa"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">Flooder</text>
<rect x="260" y="50" width="130" height="90" rx="10" fill="#bae6fd"/><text x="325" y="82" text-anchor="middle" class="svg-ink" font-size="13">Switch port</text><text x="325" y="104" text-anchor="middle" class="svg-muted" font-size="12">limit = 3</text><text x="325" y="124" text-anchor="middle" class="svg-muted" font-size="12">learned: 3</text>
<rect x="510" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="100" text-anchor="middle" class="svg-ink" font-size="13">MAC table</text>
<line x1="130" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="195" y="85" text-anchor="middle" class="svg-accent" font-size="12">MAC 4, 5, 6 ...</text><text x="450" y="85" text-anchor="middle" class="svg-muted" font-size="12">only 3 kept</text>
<text x="325" y="170" text-anchor="middle" class="svg-accent" font-size="12">packet-action decides what happens to the extra frames</text>
</svg><p class="cap">The port learns up to its limit; the action applies to the rest.</p></div>

<h3>Configuring a limit</h3>
<pre class="code">set switch-options interface ge-0/0/3 interface-mac-limit 3 packet-action drop
set vlans GUEST switch-options interface-mac-limit 2 packet-action log
set switch-options interface ge-0/0/5 persistent-learning
set interfaces ge-0/0/3 unit 0 family ethernet-switching recovery-timeout 120</pre>
<table class="cmp"><tr><th>packet-action</th><th>New MAC above the limit</th></tr>
<tr><td>none (default)</td><td>not learned, frame still forwarded</td></tr>
<tr><td>log</td><td>not learned, forwarded, syslog message</td></tr>
<tr><td>drop / drop-and-log</td><td>frame dropped (and logged)</td></tr>
<tr><td>shutdown</td><td>port disabled until the recovery timer or a manual clear</td></tr></table>
<p>Choose the limit from reality. A single PC needs 1; an IP phone with a PC behind it needs 2; a small desk switch with two trainees needs 3 (the switch itself does not appear as a source, only the hosts do, but leave a little margin).</p>
<pre class="out">lab@ACC&gt; show ethernet-switching interface ge-0/0/4 detail
Logical Interface          : ge-0/0/4.0
  State                    : up
  Interface mode           : access
  <span class="hl">MAC limit                : 2 (packet action shutdown)</span>
  MAC addresses learned    : 1
  MAC limit hit            : no
  Persistent learning      : enabled (0 persistent)
  Recovery timeout         : none (manual recovery)</pre>
<p>In the summary view <code>show ethernet-switching interface</code> a port that exceeded the limit carries the flag <b>LH</b> (limit hit), and <b>AD</b> when the action is drop. In the lab you will see <code>LH,AD</code> on ge-0/0/3.0 when the limit is 1 and two trainees sit behind it.</p>
<p><b>Persistent learning</b> keeps dynamically learned addresses across a reboot as static entries. It is useful for fixed devices such as a camera or a printer and also protects against a new device replacing an old MAC. <b>Recovery</b> after <code>shutdown</code> is manual with <code>clear ethernet-switching recovery-timeout</code> or automatic with a configured recovery timeout.</p>

<h3>Storm control</h3>
<p>A <b>broadcast storm</b> happens when broadcast, unknown-unicast or multicast (BUM) frames multiply, usually from a loop. Storm control limits BUM traffic per port with a profile. When the level is reached, extra BUM frames are dropped (default) or the port is shut down.</p>
<pre class="code">set forwarding-options storm-control-profiles SC-USERS all bandwidth-percentage 5
set forwarding-options storm-control-profiles SC-USERS all no-multicast
set interfaces ge-0/0/4 unit 0 family ethernet-switching storm-control SC-USERS
<span class="c">! optional: disable the port instead of dropping</span>
set forwarding-options storm-control-profiles SC-USERS action-shutdown</pre>
<pre class="out">lab@ACC&gt; show ethernet-switching storm-control
Interface       Profile         Level               Traffic types                     Action    State
ge-0/0/4.0      SC-USERS        <span class="hl">5%</span>                  broadcast,unknown-unicast         drop      monitoring</pre>
<p><code>no-multicast</code> tells the profile to ignore multicast, which is why the output lists only broadcast and unknown-unicast. Leave multicast out when you carry video or routing protocols that use it.</p>

<div class="eg"><p><b>Worked example.</b> A 1 Gbps user port and a 5 percent storm level: BUM traffic above about 50 Mbps is dropped on that port. A PC never legitimately sends that much broadcast, so normal users notice nothing. A looped hub that sends everything it hears back would hit the level within a second and stop harming the VLAN.</p></div>

<div class="warn"><p><b>Common mistake.</b> A MAC limit of 1 on a port that has a small switch or an IP phone with a PC attached. The second MAC is dropped and the user complains that "the PC does not work, but the phone does". Count the real devices behind the port.</p></div>
<div class="exam"><p><b>Exam trap.</b> With <code>packet-action none</code>, traffic from the extra MAC is still forwarded; it is just not learned (so it is flooded when it is a destination). Only drop, drop-and-log and shutdown stop it.</p></div>

<div class="scn"><h4>The printer that learned fifty MACs</h4><p>A hospital floor reported random slowness. The monitoring system showed the access uplink full of unicast traffic. A visitor's laptop ran a network tool that generated thousands of source addresses. With <code>interface-mac-limit 3 packet-action shutdown</code> on every user port, the offending port would have gone down at the fourth address and a syslog message would have named it. The team deployed that baseline and added <code>recovery-timeout</code> so ports come back after a few minutes.</p><p><b>Lesson:</b> a MAC limit costs nothing and turns table exhaustion into a single port event.</p></div>
<div class="iv"><p class="q">"How do you stop MAC flooding on an access switch?"</p><p>Apply <code>interface-mac-limit</code> with a packet action (drop or shutdown) on every user port, based on the number of devices expected. Mention persistent learning for fixed devices, the LH flag in <code>show ethernet-switching interface</code>, and storm control for the BUM traffic that follows.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A full MAC table makes a switch flood; limit learning per port or per VLAN with <code>interface-mac-limit</code>.</li>
<li>Actions: none, log, drop, drop-and-log, shutdown.</li>
<li>Check with <code>show ethernet-switching interface ... detail</code>; flag LH means limit hit.</li>
<li>Persistent learning keeps MACs across reboot; recovery-timeout re-enables shutdown ports.</li>
<li>Storm control caps BUM traffic with a profile on the port; the action is drop or shutdown.</li>
</ul></div>
`,hi:`
<p><b>Switch kaise learn karta hai.</b> Jab bhi frame aata hai, switch source MAC address aur port ko apne <b>Ethernet switching table</b> (MAC table) mein note karta hai. Jis destination ka entry table mein ho uska frame sirf ek port se nikalta hai. Destination unknown ho to switch frame ko VLAN ke har port par <b>flood</b> karta hai. Yeh efficient hai lekin table limited hai. EX4300 mein lakhon entries aati hain, phir bhi ek simple tool utne fake source addresses minutes mein bana sakta hai.</p>
<p><b>MAC flooding attack.</b> Attacker random source MACs wale frames bhejta hai. Table bhar jaata hai, purani entries bahar nikal jaati hain, aur asli hosts mil nahi paate. Switch user traffic har port par flood karne lagta hai, aur VLAN mein koi bhi use capture kar sakta hai. Bina nafrat ke bhi loop ya noisy device aisa hi asar karta hai. Defence yeh hai ki tay karo port kitne addresses learn kar sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Port par MAC limit">
<rect x="20" y="70" width="110" height="50" rx="8" fill="#fed7aa"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="13">Flooder</text>
<rect x="260" y="50" width="130" height="90" rx="10" fill="#bae6fd"/><text x="325" y="82" text-anchor="middle" class="svg-ink" font-size="13">Switch port</text><text x="325" y="104" text-anchor="middle" class="svg-muted" font-size="12">limit = 3</text><text x="325" y="124" text-anchor="middle" class="svg-muted" font-size="12">learned: 3</text>
<rect x="510" y="70" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="100" text-anchor="middle" class="svg-ink" font-size="13">MAC table</text>
<line x1="130" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="510" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="195" y="85" text-anchor="middle" class="svg-accent" font-size="12">MAC 4, 5, 6 ...</text><text x="450" y="85" text-anchor="middle" class="svg-muted" font-size="12">sirf 3 rakhe</text>
<text x="325" y="170" text-anchor="middle" class="svg-accent" font-size="12">extra frames ka kya hoga, packet-action tay karta hai</text>
</svg><p class="cap">Port limit tak learn karta hai; baaki par action lagta hai.</p></div>

<h3>Limit configure karna</h3>
<pre class="code">set switch-options interface ge-0/0/3 interface-mac-limit 3 packet-action drop
set vlans GUEST switch-options interface-mac-limit 2 packet-action log
set switch-options interface ge-0/0/5 persistent-learning
set interfaces ge-0/0/3 unit 0 family ethernet-switching recovery-timeout 120</pre>
<table class="cmp"><tr><th>packet-action</th><th>Limit ke upar naya MAC</th></tr>
<tr><td>none (default)</td><td>learn nahi hota, frame phir bhi forward</td></tr>
<tr><td>log</td><td>learn nahi, forward, syslog message</td></tr>
<tr><td>drop / drop-and-log</td><td>frame drop (aur log)</td></tr>
<tr><td>shutdown</td><td>port recovery timer ya manual clear tak disable</td></tr></table>
<p>Limit hakikat se chuno. Ek PC ke liye 1; PC wale IP phone ke liye 2; do trainees wale chhote desk switch ke liye 3 (MAC learning mein sirf hosts dikhte hain, phir bhi thoda margin rakho).</p>
<pre class="out">lab@ACC&gt; show ethernet-switching interface ge-0/0/4 detail
Logical Interface          : ge-0/0/4.0
  State                    : up
  Interface mode           : access
  <span class="hl">MAC limit                : 2 (packet action shutdown)</span>
  MAC addresses learned    : 1
  MAC limit hit            : no
  Persistent learning      : enabled (0 persistent)
  Recovery timeout         : none (manual recovery)</pre>
<p>Summary view <code>show ethernet-switching interface</code> mein jis port ne limit paar ki us par flag <b>LH</b> (limit hit) dikhta hai, aur action drop ho to <b>AD</b>. Lab mein limit 1 hone par aur do trainees peeche hone par ge-0/0/3.0 par <code>LH,AD</code> dikhega.</p>
<p><b>Persistent learning</b> dynamically learn kiye addresses ko reboot ke baad static entries ki tarah rakhti hai. Camera ya printer jaise fixed devices ke liye kaam ki hai aur naye device ko purane MAC ki jagah lene se bhi bachati hai. <code>shutdown</code> ke baad <b>recovery</b> <code>clear ethernet-switching recovery-timeout</code> se manual, ya configured recovery timeout se automatic hoti hai.</p>

<h3>Storm control</h3>
<p><b>Broadcast storm</b> tab hota hai jab broadcast, unknown-unicast ya multicast (BUM) frames multiply ho jaate hain, aam taur par loop se. Storm control profile se har port par BUM traffic limit karta hai. Level pahunchte hi extra BUM frames drop hote hain (default) ya port shut ho jaata hai.</p>
<pre class="code">set forwarding-options storm-control-profiles SC-USERS all bandwidth-percentage 5
set forwarding-options storm-control-profiles SC-USERS all no-multicast
set interfaces ge-0/0/4 unit 0 family ethernet-switching storm-control SC-USERS
<span class="c">! optional: drop ki jagah port disable</span>
set forwarding-options storm-control-profiles SC-USERS action-shutdown</pre>
<pre class="out">lab@ACC&gt; show ethernet-switching storm-control
Interface       Profile         Level               Traffic types                     Action    State
ge-0/0/4.0      SC-USERS        <span class="hl">5%</span>                  broadcast,unknown-unicast         drop      monitoring</pre>
<p><code>no-multicast</code> profile ko multicast ignore karne ko kehta hai, isliye output mein sirf broadcast aur unknown-unicast dikhte hain. Jab video ya multicast use karne wale routing protocols chal rahe hon to multicast ko bahar rakho.</p>

<div class="eg"><p><b>Worked example.</b> 1 Gbps user port aur 5 percent storm level: lagbhag 50 Mbps se upar BUM traffic us port par drop hota hai. PC kabhi itna broadcast nahi bhejta, isliye normal users ko kuch pata nahi chalta. Looped hub jo jo sunta hai wahi wapas bhejta hai, ek second mein level par pahunch kar VLAN ko nuksaan karna band kar deta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Chhote switch ya PC wale IP phone ke port par MAC limit 1 lagana. Doosra MAC drop ho jaata hai aur user kehta hai "PC nahi chal raha, phone chal raha hai". Port ke peeche ke asli devices gino.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>packet-action none</code> mein extra MAC ka traffic phir bhi forward hota hai; bas learn nahi hota (isliye destination hone par flood hota hai). Sirf drop, drop-and-log aur shutdown ise rokte hain.</p></div>

<div class="scn"><h4>Printer jisne pachaas MACs learn kiye</h4><p>Ek hospital floor ne random slowness batayi. Monitoring mein access uplink unicast traffic se bhara dikha. Ek visitor ke laptop par chal rahe network tool ne hazaaron source addresses bana diye the. Har user port par <code>interface-mac-limit 3 packet-action shutdown</code> hota to chauthe address par woh port band ho jaata aur syslog message uska naam batata. Team ne yeh baseline lagaya aur <code>recovery-timeout</code> jodi taaki ports kuch minute baad wapas aa jaayein.</p><p><b>Lesson:</b> MAC limit ki koi keemat nahi aur table exhaustion ko ek port ki ghatna bana deti hai.</p></div>
<div class="iv"><p class="q">"Access switch par MAC flooding kaise rokte ho?"</p><p>Har user port par expected devices ke hisaab se <code>interface-mac-limit</code> aur packet action (drop ya shutdown) lagao. Fixed devices ke liye persistent learning, <code>show ethernet-switching interface</code> mein LH flag, aur uske baad aane wale BUM traffic ke liye storm control ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC table bharne par switch flood karta hai; <code>interface-mac-limit</code> se port ya VLAN par learning limit karo.</li>
<li>Actions: none, log, drop, drop-and-log, shutdown.</li>
<li><code>show ethernet-switching interface ... detail</code> se check karo; flag LH matlab limit hit.</li>
<li>Persistent learning MACs reboot ke baad rakhti hai; recovery-timeout shutdown ports ko wapas laata hai.</li>
<li>Storm control port par profile se BUM traffic cap karta hai; action drop ya shutdown.</li>
</ul></div>
`}};export{e as default};