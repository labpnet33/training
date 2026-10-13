var e={id:`lab-toolkit`,h:{en:`The ENCOR lab toolkit: IOS XE CLI habits and reading real outputs`,hi:`ENCOR lab toolkit: IOS XE CLI habits aur real outputs padhna`},body:{en:`
<p>A good mechanic is not the one who knows the most about engines; it is the one who reaches for the right spanner first time and never leaves a bolt loose. On a production network the CLI is your toolbox. Engineers who filter output well find the fault in one command instead of scrolling for five minutes, and engineers who change configuration safely never need a site visit to recover a router they locked themselves out of. The labs in this track assume these habits.</p>

<h3>Filtering output</h3>
<p>Every <code>show</code> command can be piped through a filter. The pattern after the filter is a regular expression, and it is case-sensitive.</p>
<table class="cmp"><tr><th>Filter</th><th>What it does</th><th>Example</th></tr>
<tr><td><code>| include</code></td><td>Only lines that match</td><td><code>show ip interface brief | include up</code></td></tr>
<tr><td><code>| exclude</code></td><td>Hide lines that match</td><td><code>show ip interface brief | exclude unassigned</code></td></tr>
<tr><td><code>| begin</code></td><td>Start at the first match</td><td><code>show ip route | begin Gateway</code></td></tr>
<tr><td><code>| section</code></td><td>Show a config block with its indented children</td><td><code>show running-config | section router ospf</code></td></tr>
<tr><td><code>| count</code></td><td>Count matching lines</td><td><code>show interfaces status | count notconnect</code></td></tr>
</table>
<p>Useful regex pieces: <code>^</code> start of line, <code>$</code> end of line, <code>.</code> any character, and <code>|</code> inside the pattern for "or" (for example <code>| include line protocol|CRC</code>). Other habits: <code>show running-config interface Vlan10</code> for one interface, <code>terminal length 0</code> before copying long output, and <code>do</code> to run exec commands from configuration mode (<code>do show ip interface brief</code>).</p>

<div class="eg"><p><b>Worked example.</b> You need the number of unused ports on ACC1 for a capacity report.</p>
<pre class="out">ACC1# show interfaces status | count notconnect
<span class="hl">Number of lines which match regexp = 17</span></pre>
<p>Seventeen of the 48 access ports are free. One command, no scrolling.</p></div>

<h3>Reading real outputs</h3>
<p><code>show ip interface brief</code> gives two columns: Status (Layer 1) and Protocol (Layer 2). <b>administratively down / down</b> means someone typed <code>shutdown</code>. <b>down / down</b> means no physical link: cable, optic, or far end. <b>up / down</b> means Layer 1 is fine but Layer 2 is not: encapsulation or keepalive mismatch, err-disabled logic on some platforms, or a channel member problem. For errors, go to <code>show interfaces</code>:</p>
<pre class="out">ACC2# show interfaces GigabitEthernet1/0/20 | include line protocol|duplex|CRC|drops
GigabitEthernet1/0/20 is up, line protocol is up (connected)
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
  Input queue: 0/2000/0/0 (size/max/drops/flushes); Total output drops: 0
<span class="hl">     2317 input errors, 2291 CRC, 0 frame, 0 overrun, 0 ignored</span></pre>
<p>Rising <b>CRC</b> errors mean damaged frames arriving: suspect the cable, patch panel, optic or a duplex mismatch at the other end. <b>Output drops</b> mean congestion, a QoS or capacity question. Always clear counters (<code>clear counters</code>) and check again to see whether errors are still increasing.</p>

<h3>Debugging without killing the box</h3>
<p>Debugs run on the CPU. On a busy device an unfiltered debug can make it unresponsive. Rules:</p>
<ul>
<li>Send logs to the buffer, not the console: <code>no logging console</code>, <code>logging buffered 64000</code>, then read with <code>show logging</code>. On SSH, use <code>terminal monitor</code> to see messages live.</li>
<li>Limit the scope with <b>conditional debugging</b>: <code>debug condition interface GigabitEthernet0/0/1</code> restricts supported debugs to that interface.</li>
<li>Prefer specific debugs (<code>debug ip ospf adj</code>) to broad ones, check them with <code>show debugging</code>, and stop with <code>undebug all</code>.</li>
</ul>

<h3>Changing configuration safely</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Safe change workflow">
<rect x="10" y="30" width="112" height="50" rx="8" fill="#e2e8f0"/><text x="66" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Archive</text><text x="66" y="69" text-anchor="middle" class="svg-muted" font-size="12">backup config</text>
<rect x="137" y="30" width="112" height="50" rx="8" fill="#fde68a"/><text x="193" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 Revert timer</text><text x="193" y="69" text-anchor="middle" class="svg-muted" font-size="12">10 minutes</text>
<rect x="264" y="30" width="112" height="50" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Change</text><text x="320" y="69" text-anchor="middle" class="svg-muted" font-size="12">apply config</text>
<rect x="391" y="30" width="112" height="50" rx="8" fill="#ddd6fe"/><text x="447" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 Verify</text><text x="447" y="69" text-anchor="middle" class="svg-muted" font-size="12">show, ping</text>
<rect x="518" y="30" width="112" height="50" rx="8" fill="#bbf7d0"/><text x="574" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Confirm</text><text x="574" y="69" text-anchor="middle" class="svg-muted" font-size="12">keep change</text>
<line x1="122" y1="55" x2="137" y2="55" stroke="#64748b" stroke-width="2"/><line x1="249" y1="55" x2="264" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="376" y1="55" x2="391" y2="55" stroke="#64748b" stroke-width="2"/><line x1="503" y1="55" x2="518" y2="55" stroke="#64748b" stroke-width="2"/>
<path d="M447 80 L447 140 L193 140 L193 80" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Locked out or broken? No confirm, so the device rolls back by itself</text>
</svg><p class="cap">The revert timer turns "I hope this works" into a change that undoes itself if you lose access.</p></div>
<pre class="code"><span class="c">! one-time setup: keep archive copies of the config</span>
WAN1(config)# archive
WAN1(config-archive)# path bootflash:$h-cfg
WAN1(config-archive)# maximum 10
WAN1(config-archive)# write-memory
WAN1(config-archive)# end
<span class="c">! each risky change: enter config mode with an automatic rollback timer</span>
WAN1# configure terminal revert timer 10
WAN1(config)# <span class="c">! ... make the change, then verify from a second session ...</span>
WAN1(config)# end
WAN1# configure confirm
<span class="c">! manual rollback to an earlier archive if needed</span>
WAN1# configure replace bootflash:WAN1-cfg-2 list</pre>
<pre class="out">WAN1# show archive
The maximum archive configurations allowed is 10.
The next archive file will be named bootflash:WAN1-cfg-4
 Archive #  Name
   1        bootflash:WAN1-cfg-1
   2        bootflash:WAN1-cfg-2
<span class="hl">   3        bootflash:WAN1-cfg-3 &lt;- Most Recent</span></pre>
<p>The classic alternative on any Cisco device is <code>reload in 10</code> before the change and <code>reload cancel</code> after verifying it. It works, but a reload causes an outage, while <code>configure replace</code> only changes the lines that differ.</p>

<h3>Ping and traceroute like a CCNP</h3>
<p>Always choose the source: <code>ping 10.10.20.10 source Vlan10</code> tests the return path to the user subnet, not just to the router's outgoing interface. Add <code>repeat 100</code> to spot intermittent loss, and <code>size 1500 df-bit</code> to find MTU problems on tunnels. <code>traceroute 10.10.20.10 source Vlan10</code> shows where the path stops. In the output, <code>!</code> is a reply, <code>.</code> a timeout, <code>U</code> unreachable.</p>

<div class="warn"><p><b>Common mistake.</b> Running <code>debug ip packet</code> without an ACL on a production router, or leaving debugs running after the session ends. On a busy device that can push the CPU to 100% and drop routing adjacencies. Filter, scope, and always finish with <code>undebug all</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Output filters are case-sensitive: <code>| include Ospf</code> finds nothing. <code>| section</code> shows a block and its indented lines; <code>| begin</code> shows everything after the first match. In <code>show ip interface brief</code>, "administratively down" is a configured shutdown, not a fault.</p></div>

<div class="scn"><h4>The ACL that locked everyone out</h4><p>An engineer tightened SSH access on WAN1 by applying a new access-class to the VTY lines, but typed the jump-host subnet wrong. His session dropped immediately and nobody could log in. Because he had started with <code>configure terminal revert timer 10</code>, WAN1 rolled back to the previous configuration ten minutes later, SSH came back, and he fixed the ACL in a second attempt. Without the timer, the fix would have needed someone on site with a console cable.</p><p><b>Lesson:</b> any change that could cut your own access (VTY ACLs, AAA, management interface, routing to the management network) deserves a revert timer.</p></div>

<div class="iv"><p class="q">"How do you make a risky change on a remote router safely?"</p><p>Strong answer: take a backup (archive or copy to a server), write the change and the rollback steps in advance, start with <code>configure terminal revert timer</code> (or <code>reload in</code> on older platforms), keep a second session open, verify with specific show commands and sourced pings, then <code>configure confirm</code>. If anything goes wrong, the device rolls back automatically, or you use <code>configure replace</code> to return to the archived config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters: include, exclude, begin, section, count; patterns are case-sensitive regular expressions.</li>
<li>Status/protocol: admin down = shutdown, down/down = physical, up/down = Layer 2; CRC = physical damage, output drops = congestion.</li>
<li>Debug safely: log to buffer, conditional debug, specific debugs, <code>undebug all</code>.</li>
<li>Safe change: archive, <code>configure terminal revert timer</code>, verify, <code>configure confirm</code>; roll back with <code>configure replace</code>.</li>
<li>Ping and traceroute with a source interface, repeat count and DF bit when testing MTU.</li>
</ul></div>
`,hi:`
<p>Achha mechanic woh nahi jo engines ke baare mein sabse zyada jaanta hai; woh hai jo pehli baar mein sahi spanner uthata hai aur kabhi bolt dheela nahi chhodta. Production network par CLI aapka toolbox hai. Jo engineers output achhe se filter karte hain woh paanch minute scroll karne ki jagah ek command mein fault dhoondh lete hain, aur jo engineers configuration safely badalte hain unhe kabhi khud ko lock out karne ke baad router recover karne ke liye site visit ki zaroorat nahi padti. Is track ki labs yeh habits assume karti hain.</p>

<h3>Output filter karna</h3>
<p>Har <code>show</code> command ko ek filter se pipe kiya ja sakta hai. Filter ke baad ka pattern ek regular expression hai, aur yeh case-sensitive hai.</p>
<table class="cmp"><tr><th>Filter</th><th>Kya karta hai</th><th>Example</th></tr>
<tr><td><code>| include</code></td><td>Sirf match hone wali lines</td><td><code>show ip interface brief | include up</code></td></tr>
<tr><td><code>| exclude</code></td><td>Match hone wali lines chhupao</td><td><code>show ip interface brief | exclude unassigned</code></td></tr>
<tr><td><code>| begin</code></td><td>Pehle match se shuru karo</td><td><code>show ip route | begin Gateway</code></td></tr>
<tr><td><code>| section</code></td><td>Config block ko uske indented children ke saath dikhao</td><td><code>show running-config | section router ospf</code></td></tr>
<tr><td><code>| count</code></td><td>Match hone wali lines gino</td><td><code>show interfaces status | count notconnect</code></td></tr>
</table>
<p>Kaam ke regex pieces: <code>^</code> line ki shuruaat, <code>$</code> line ka end, <code>.</code> koi bhi character, aur pattern ke andar "or" ke liye <code>|</code> (jaise <code>| include line protocol|CRC</code>). Doosri habits: ek interface ke liye <code>show running-config interface Vlan10</code>, lamba output copy karne se pehle <code>terminal length 0</code>, aur configuration mode se exec commands chalane ke liye <code>do</code> (<code>do show ip interface brief</code>).</p>

<div class="eg"><p><b>Worked example.</b> Capacity report ke liye aapko ACC1 par unused ports ki sankhya chahiye.</p>
<pre class="out">ACC1# show interfaces status | count notconnect
<span class="hl">Number of lines which match regexp = 17</span></pre>
<p>48 access ports mein se satrah free hain. Ek command, koi scrolling nahi.</p></div>

<h3>Real outputs padhna</h3>
<p><code>show ip interface brief</code> do columns deta hai: Status (Layer 1) aur Protocol (Layer 2). <b>administratively down / down</b> ka matlab kisi ne <code>shutdown</code> type kiya. <b>down / down</b> ka matlab physical link nahi hai: cable, optic, ya door ka end. <b>up / down</b> ka matlab Layer 1 theek hai par Layer 2 nahi: encapsulation ya keepalive mismatch, kuch platforms par err-disabled logic, ya channel member problem. Errors ke liye <code>show interfaces</code> par jaao:</p>
<pre class="out">ACC2# show interfaces GigabitEthernet1/0/20 | include line protocol|duplex|CRC|drops
GigabitEthernet1/0/20 is up, line protocol is up (connected)
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
  Input queue: 0/2000/0/0 (size/max/drops/flushes); Total output drops: 0
<span class="hl">     2317 input errors, 2291 CRC, 0 frame, 0 overrun, 0 ignored</span></pre>
<p>Badhte <b>CRC</b> errors ka matlab damaged frames aa rahe hain: cable, patch panel, optic ya doosre end par duplex mismatch par shak karo. <b>Output drops</b> ka matlab congestion hai, QoS ya capacity ka sawaal. Hamesha counters clear karo (<code>clear counters</code>) aur dobara check karo ki errors abhi bhi badh rahe hain ya nahi.</p>

<h3>Box ko maare bina debugging</h3>
<p>Debugs CPU par chalte hain. Busy device par bina filter ka debug use unresponsive bana sakta hai. Rules:</p>
<ul>
<li>Logs ko console ki jagah buffer mein bhejo: <code>no logging console</code>, <code>logging buffered 64000</code>, phir <code>show logging</code> se padho. SSH par messages live dekhne ke liye <code>terminal monitor</code> use karo.</li>
<li><b>Conditional debugging</b> se scope limit karo: <code>debug condition interface GigabitEthernet0/0/1</code> supported debugs ko us interface tak seemit karta hai.</li>
<li>Broad debugs ki jagah specific debugs (<code>debug ip ospf adj</code>) prefer karo, <code>show debugging</code> se check karo, aur <code>undebug all</code> se band karo.</li>
</ul>

<h3>Configuration safely badalna</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Safe change workflow">
<rect x="10" y="30" width="112" height="50" rx="8" fill="#e2e8f0"/><text x="66" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Archive</text><text x="66" y="69" text-anchor="middle" class="svg-muted" font-size="12">config backup</text>
<rect x="137" y="30" width="112" height="50" rx="8" fill="#fde68a"/><text x="193" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 Revert timer</text><text x="193" y="69" text-anchor="middle" class="svg-muted" font-size="12">10 minute</text>
<rect x="264" y="30" width="112" height="50" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Change</text><text x="320" y="69" text-anchor="middle" class="svg-muted" font-size="12">config lagao</text>
<rect x="391" y="30" width="112" height="50" rx="8" fill="#ddd6fe"/><text x="447" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 Verify</text><text x="447" y="69" text-anchor="middle" class="svg-muted" font-size="12">show, ping</text>
<rect x="518" y="30" width="112" height="50" rx="8" fill="#bbf7d0"/><text x="574" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Confirm</text><text x="574" y="69" text-anchor="middle" class="svg-muted" font-size="12">change rakho</text>
<line x1="122" y1="55" x2="137" y2="55" stroke="#64748b" stroke-width="2"/><line x1="249" y1="55" x2="264" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="376" y1="55" x2="391" y2="55" stroke="#64748b" stroke-width="2"/><line x1="503" y1="55" x2="518" y2="55" stroke="#64748b" stroke-width="2"/>
<path d="M447 80 L447 140 L193 140 L193 80" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">Lock out ya kuch toota? Confirm nahi hua, to device khud rollback karta hai</text>
</svg><p class="cap">Revert timer "umeed hai yeh chalega" ko aise change mein badal deta hai jo access khone par khud undo ho jaata hai.</p></div>
<pre class="code"><span class="c">! one-time setup: config ki archive copies rakho</span>
WAN1(config)# archive
WAN1(config-archive)# path bootflash:$h-cfg
WAN1(config-archive)# maximum 10
WAN1(config-archive)# write-memory
WAN1(config-archive)# end
<span class="c">! har risky change: automatic rollback timer ke saath config mode mein jaao</span>
WAN1# configure terminal revert timer 10
WAN1(config)# <span class="c">! ... change karo, phir doosre session se verify karo ...</span>
WAN1(config)# end
WAN1# configure confirm
<span class="c">! zaroorat ho to pichle archive par manual rollback</span>
WAN1# configure replace bootflash:WAN1-cfg-2 list</pre>
<pre class="out">WAN1# show archive
The maximum archive configurations allowed is 10.
The next archive file will be named bootflash:WAN1-cfg-4
 Archive #  Name
   1        bootflash:WAN1-cfg-1
   2        bootflash:WAN1-cfg-2
<span class="hl">   3        bootflash:WAN1-cfg-3 &lt;- Most Recent</span></pre>
<p>Kisi bhi Cisco device par classic alternative hai change se pehle <code>reload in 10</code> aur verify karne ke baad <code>reload cancel</code>. Yeh kaam karta hai, par reload outage karta hai, jabki <code>configure replace</code> sirf alag lines badalta hai.</p>

<h3>CCNP ki tarah ping aur traceroute</h3>
<p>Hamesha source chuno: <code>ping 10.10.20.10 source Vlan10</code> user subnet tak return path test karta hai, sirf router ke outgoing interface tak nahi. Intermittent loss pakadne ke liye <code>repeat 100</code> jodo, aur tunnels par MTU problems dhoondhne ke liye <code>size 1500 df-bit</code>. <code>traceroute 10.10.20.10 source Vlan10</code> dikhata hai ki path kahan rukta hai. Output mein <code>!</code> reply hai, <code>.</code> timeout, <code>U</code> unreachable.</p>

<div class="warn"><p><b>Common galti.</b> Production router par bina ACL ke <code>debug ip packet</code> chalana, ya session khatam hone ke baad debugs chalte chhod dena. Busy device par yeh CPU ko 100% tak le jaa sakta hai aur routing adjacencies gira sakta hai. Filter karo, scope karo, aur hamesha <code>undebug all</code> se khatam karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Output filters case-sensitive hain: <code>| include Ospf</code> kuch nahi dhoondhta. <code>| section</code> ek block aur uski indented lines dikhata hai; <code>| begin</code> pehle match ke baad sab kuch dikhata hai. <code>show ip interface brief</code> mein "administratively down" configured shutdown hai, fault nahi.</p></div>

<div class="scn"><h4>ACL jisne sabko lock out kar diya</h4><p>Ek engineer ne VTY lines par naya access-class lagakar WAN1 par SSH access tight kiya, par jump-host subnet galat type kar diya. Uska session turant gir gaya aur koi login nahi kar paaya. Kyunki usne <code>configure terminal revert timer 10</code> se shuru kiya tha, WAN1 das minute baad pichli configuration par rollback ho gaya, SSH wapas aaya, aur usne doosri koshish mein ACL theek kiya. Timer ke bina, fix ke liye kisi ko console cable ke saath site par jaana padta.</p><p><b>Seekh:</b> jo bhi change aapka khud ka access kaat sakta hai (VTY ACLs, AAA, management interface, management network tak routing), use revert timer milna chahiye.</p></div>

<div class="iv"><p class="q">"Remote router par risky change safely kaise karte ho?"</p><p>Strong answer: backup lo (archive ya server par copy), change aur rollback steps pehle se likho, <code>configure terminal revert timer</code> se shuru karo (ya purane platforms par <code>reload in</code>), ek doosra session khula rakho, specific show commands aur sourced pings se verify karo, phir <code>configure confirm</code>. Agar kuch galat ho, device automatically rollback karta hai, ya aap archived config par wapas jaane ke liye <code>configure replace</code> use karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters: include, exclude, begin, section, count; patterns case-sensitive regular expressions hain.</li>
<li>Status/protocol: admin down = shutdown, down/down = physical, up/down = Layer 2; CRC = physical damage, output drops = congestion.</li>
<li>Safely debug karo: buffer mein log, conditional debug, specific debugs, <code>undebug all</code>.</li>
<li>Safe change: archive, <code>configure terminal revert timer</code>, verify, <code>configure confirm</code>; <code>configure replace</code> se rollback.</li>
<li>Source interface, repeat count aur MTU test karte waqt DF bit ke saath ping aur traceroute karo.</li>
</ul></div>
`}};export{e as default};