var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now know how to watch, test and maintain a Junos device. This chapter collects everything for a last review before the labs, interviews and the JN0-106 exam.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="10" width="190" height="70" rx="10" fill="#bae6fd"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="13">Observe</text><text x="105" y="55" text-anchor="middle" class="svg-muted" font-size="11">show, monitor, logs, pipes</text>
<rect x="225" y="10" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Test</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="11">ping, traceroute, ssh, telnet</text>
<rect x="440" y="10" width="190" height="70" rx="10" fill="#fde68a"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13">Maintain</text><text x="535" y="55" text-anchor="middle" class="svg-muted" font-size="11">snapshot, install, reboot</text>
<rect x="120" y="95" width="400" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Recover</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="11">root password recovery, console insecure</text>
</svg><p class="cap">The four areas of operational monitoring and maintenance.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain show versus monitor and use pipes (match, except, count, last, no-more, find).</li>
<li>I can read show interfaces terse: Admin, Link, Proto, Local.</li>
<li>I can spot a duplex mismatch from extensive counters and fix it.</li>
<li>I can follow a log live with monitor start messages and stop it.</li>
<li>I can use ping (count, rapid, source, size) and traceroute, and read !H and * * *.</li>
<li>I can reach another device with ssh and know telnet is clear text.</li>
<li>I can copy files and check system health: version, uptime, alarms, storage.</li>
<li>I can upgrade Junos with snapshot first, and choose between reboot, halt and power-off.</li>
<li>I can describe the root password recovery steps and the console insecure defence.</li>
<li>I can run a bottom-up troubleshooting workflow and solve the three lab tickets.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Admin / Link</dt><dd>Configured state / physical signal of an interface.</dd>
<dt>Unit</dt><dd>Logical interface, such as ge-0/0/0.0, that carries the address.</dd>
<dt>Duplex mismatch</dt><dd>One end full, one end half; link up but lossy.</dd>
<dt>TTL</dt><dd>Time to live; decremented by each router; traceroute uses it to discover hops.</dd>
<dt>!H / !N</dt><dd>Host / network unreachable reported in traceroute.</dd>
<dt>Snapshot</dt><dd>Copy of running software and configuration to alternate media.</dd>
<dt>Single-user mode</dt><dd>Minimal boot used for password recovery.</dd>
<dt>RE</dt><dd>Routing Engine, the control-plane brain that runs the CLI and protocols.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Live log view</td><td>monitor start messages (monitor stop to end)</td></tr>
<tr><td>Admin down, Link down</td><td>disable is configured</td></tr>
<tr><td>Late collisions plus runts</td><td>Duplex mismatch</td></tr>
<tr><td>Traceroute !H</td><td>The router at that address has no route</td></tr>
<tr><td>ssh port / telnet port</td><td>TCP 22 / TCP 23</td></tr>
<tr><td>Before upgrading</td><td>request system snapshot</td></tr>
<tr><td>Does software add activate?</td><td>No, a reboot is needed</td></tr>
<tr><td>Stop but keep power</td><td>request system halt</td></tr>
<tr><td>Stop and remove power</td><td>request system power-off</td></tr>
<tr><td>Recovery sequence</td><td>boot -s, then recovery, configure, set root password, commit</td></tr>
<tr><td>Block recovery</td><td>set system ports console insecure</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show interfaces terse
show interfaces ge-0/0/0 extensive
clear interfaces statistics all
show log messages | match RPD_OSPF
monitor start messages  /  monitor stop
monitor interface ge-0/0/0
ping 10.4.4.10 count 5 rapid source 10.255.1.1
traceroute 10.4.4.10
ssh 10.255.3.3
show version  /  show system uptime  /  show system storage
request system snapshot
request system software add /var/tmp/package.tgz
request system reboot  /  halt  /  power-off
request system software rollback</pre>
<div class="exam"><p><b>Exam trap.</b> Words matter: "as they occur" means monitor, "most specific" means longest match, "without rebooting" means the answer is not software add. Read the last line of the question twice.</p></div>
<div class="warn"><p><b>Common mistake.</b> Memorising commands without the order. In interviews, explain the order (observe, test, protect, act, verify) as much as the commands.</p></div>

<div class="scn"><h4>Putting it together on a Monday</h4><p>A branch reported "everything is slow and the ERP is down". The engineer checked interface state and errors on the uplink, found a duplex mismatch and removed the hard-set speed. A traceroute to the ERP then stopped at !H on a replaced router, where she restored the missing static route. Finally she watched the log for stable neighbours, took a snapshot of the good state, and scheduled the long-pending Junos upgrade for the weekend.</p><p><b>Lesson:</b> this module in one story: observe, test, fix, protect.</p></div>

<div class="iv"><p class="q">"Tell me five commands you use first when you log in to a router you have never seen."</p><p>Show version (what is it), show system uptime (when did it boot and last change), show interfaces terse (what is up), show system alarms (any active alarm), and show log messages | last 30 (recent events). Add that you read before you change anything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Observe, test, protect, act, verify: the operator loop.</li>
<li>Counters reveal what link lights hide.</li>
<li>Snapshot before upgrades; reboot activates; halt and power-off stop the device.</li>
<li>Recovery needs the console; console insecure blocks it.</li>
<li>Next module: jncia-routing explains how the routing tables you traced actually decide paths.</li>
</ul></div>
`,hi:`
<p>Ab aap Junos device ko watch, test aur maintain karna jaante ho. Yeh chapter labs, interviews aur JN0-106 exam se pehle aakhri review ke liye sab kuch ek jagah laata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="10" width="190" height="70" rx="10" fill="#bae6fd"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="13">Observe</text><text x="105" y="55" text-anchor="middle" class="svg-muted" font-size="11">show, monitor, logs, pipes</text>
<rect x="225" y="10" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Test</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="11">ping, traceroute, ssh, telnet</text>
<rect x="440" y="10" width="190" height="70" rx="10" fill="#fde68a"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13">Maintain</text><text x="535" y="55" text-anchor="middle" class="svg-muted" font-size="11">snapshot, install, reboot</text>
<rect x="120" y="95" width="400" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Recover</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="11">root password recovery, console insecure</text>
</svg><p class="cap">Operational monitoring and maintenance ke chaar areas.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main show vs monitor samjha sakta hoon aur pipes (match, except, count, last, no-more, find) use kar sakta hoon.</li>
<li>Main show interfaces terse padh sakta hoon: Admin, Link, Proto, Local.</li>
<li>Main extensive counters se duplex mismatch pehchan kar fix kar sakta hoon.</li>
<li>Main monitor start messages se log live follow karke band kar sakta hoon.</li>
<li>Main ping (count, rapid, source, size) aur traceroute use kar sakta hoon, aur !H aur * * * padh sakta hoon.</li>
<li>Main ssh se doosre device tak ja sakta hoon aur jaanta hoon telnet clear text hai.</li>
<li>Main files copy kar sakta hoon aur system health check kar sakta hoon: version, uptime, alarms, storage.</li>
<li>Main pehle snapshot lekar Junos upgrade kar sakta hoon, aur reboot, halt, power-off mein chun sakta hoon.</li>
<li>Main root password recovery ke steps aur console insecure ka bachaav bata sakta hoon.</li>
<li>Main bottom-up troubleshooting workflow chala sakta hoon aur teeno lab tickets solve kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Admin / Link</dt><dd>Interface ki configured state / physical signal.</dd>
<dt>Unit</dt><dd>Logical interface, jaise ge-0/0/0.0, jo address rakhta hai.</dd>
<dt>Duplex mismatch</dt><dd>Ek end full, ek end half; link up lekin lossy.</dd>
<dt>TTL</dt><dd>Time to live; har router ghatata hai; traceroute isse hops dhoondhta hai.</dd>
<dt>!H / !N</dt><dd>Traceroute mein host / network unreachable.</dd>
<dt>Snapshot</dt><dd>Chalte software aur configuration ki alternate media par copy.</dd>
<dt>Single-user mode</dt><dd>Password recovery ke liye minimal boot.</dd>
<dt>RE</dt><dd>Routing Engine, control-plane ka dimaag jo CLI aur protocols chalata hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Live log view</td><td>monitor start messages (khatam karne ke liye monitor stop)</td></tr>
<tr><td>Admin down, Link down</td><td>disable configured hai</td></tr>
<tr><td>Late collisions aur runts</td><td>Duplex mismatch</td></tr>
<tr><td>Traceroute !H</td><td>Us address wale router ke paas route nahi</td></tr>
<tr><td>ssh port / telnet port</td><td>TCP 22 / TCP 23</td></tr>
<tr><td>Upgrade se pehle</td><td>request system snapshot</td></tr>
<tr><td>Kya software add activate karta hai?</td><td>Nahi, reboot chahiye</td></tr>
<tr><td>Rokna lekin power rakhna</td><td>request system halt</td></tr>
<tr><td>Rokna aur power hatana</td><td>request system power-off</td></tr>
<tr><td>Recovery sequence</td><td>boot -s, phir recovery, configure, root password set, commit</td></tr>
<tr><td>Recovery rokna</td><td>set system ports console insecure</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show interfaces terse
show interfaces ge-0/0/0 extensive
clear interfaces statistics all
show log messages | match RPD_OSPF
monitor start messages  /  monitor stop
monitor interface ge-0/0/0
ping 10.4.4.10 count 5 rapid source 10.255.1.1
traceroute 10.4.4.10
ssh 10.255.3.3
show version  /  show system uptime  /  show system storage
request system snapshot
request system software add /var/tmp/package.tgz
request system reboot  /  halt  /  power-off
request system software rollback</pre>
<div class="exam"><p><b>Exam trap.</b> Shabd matter karte hain: "as they occur" matlab monitor, "most specific" matlab longest match, "without rebooting" matlab jawab software add nahi hai. Sawaal ki aakhri line do baar padho.</p></div>
<div class="warn"><p><b>Common mistake.</b> Order ke bina sirf commands ratna. Interviews mein commands jitna hi order (observe, test, protect, act, verify) samjhao.</p></div>

<div class="scn"><h4>Ek Monday par sab kuch saath</h4><p>Ek branch ne bataya "sab kuch slow hai aur ERP down hai". Engineer ne uplink par interface state aur errors check kiye, duplex mismatch mila aur hard-set speed hataya. Phir ERP ka traceroute badle hue router par !H par ruka, jahan usne missing static route wapas lagaya. Aakhir mein usne stable neighbours ke liye log dekha, achhi state ka snapshot liya, aur lambe samay se pending Junos upgrade weekend ke liye schedule kiya.</p><p><b>Lesson:</b> is module ki poori kahani: observe, test, fix, protect.</p></div>

<div class="iv"><p class="q">"Aisa router jo pehle kabhi nahi dekha, uspar login karke pehle paanch commands batao."</p><p>Show version (kya hai), show system uptime (kab boot hua aur last change), show interfaces terse (kya up hai), show system alarms (koi active alarm), aur show log messages | last 30 (recent events). Yeh bhi kaho ki kuch badalne se pehle padhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Observe, test, protect, act, verify: operator loop.</li>
<li>Counters woh dikhate hain jo link lights chhupati hain.</li>
<li>Upgrade se pehle snapshot; reboot activate karta hai; halt aur power-off device rokte hain.</li>
<li>Recovery ke liye console chahiye; console insecure use rokta hai.</li>
<li>Agla module: jncia-routing samjhata hai ki jo routing tables aapne trace ki woh asal mein paths kaise decide karti hain.</li>
</ul></div>
`}};export{e as default};