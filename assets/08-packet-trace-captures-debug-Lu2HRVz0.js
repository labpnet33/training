var e={id:`packet-trace-captures-debug`,h:{en:`The deep tools: packet trace, captures, controller logs, debugs and admin-tech`,hi:`Gehre tools: packet trace, captures, controller logs, debugs aur admin-tech`},body:{en:`
<p>Show commands are like looking at a building's visitor register: they tell you how many people came and went. Sometimes you need to follow one visitor with a camera and see exactly which door stopped him. Packet trace and captures are that camera. They are powerful and expensive, so you use them last, on one flow, for a short time. This chapter teaches the tools, the safe way to use them and how to read their results.</p>

<h3>The ladder of tools</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Ladder of troubleshooting tools">
<rect x="20" y="170" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="13">1 Show commands and counters: free, safe, always first</text>
<rect x="70" y="124" width="500" height="38" rx="6" fill="#bae6fd"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">2 Logs and history: connection-history, syslog, controller logs</text>
<rect x="120" y="78" width="400" height="38" rx="6" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">3 Packet trace on one flow: which feature dropped it</text>
<rect x="170" y="32" width="300" height="38" rx="6" fill="#fed7aa"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">4 Packet capture: the packet on the wire</text>
<rect x="220" y="2" width="200" height="26" rx="6" fill="#fbcfe8"/><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="12">5 Admin-tech for TAC</text>
</svg><p class="cap">Climb only as far as you need; each step costs more CPU and care.</p></div>

<h3>Packet trace on a Catalyst SD-WAN edge</h3>
<p>Packet trace records what the forwarding engine did to selected packets: which interface they came in on, which features touched them, whether they were forwarded, punted to the control processor or dropped, and why. The workflow is: define the condition (which packets), start, generate the traffic, read the summary, look at the packet in detail, stop.</p>
<pre class="code">E-DEL-1# debug platform packet-trace packet 2048 fia-trace data-size 4096
E-DEL-1# debug platform condition ipv4 10.2.10.10/32 both
E-DEL-1# debug platform condition start
<span class="c">! generate the traffic: ping or application test from Mumbai</span>
E-DEL-1# show platform packet-trace summary
E-DEL-1# show platform packet-trace summary | include DROP
E-DEL-1# show platform packet-trace packet 0 decode
E-DEL-1# debug platform condition stop</pre>
<p>The condition limits what is traced to one host (here the Mumbai host 10.2.10.10, in either direction); you may also match on an interface and direction (ingress or egress, and bidirectional). The two numbers in the first line are the number of packets kept and the amount of data recorded per packet. Start small. A trace with no condition on a busy edge uses memory and processor and can slow the device you are trying to fix.</p>
<pre class="out">E-DEL-1# show platform packet-trace summary
Pkt   Input                     Output                    State  Reason
0     Gi1                       Gi2                       FWD
1     Gi1                       Gi2                       FWD
<span class="hl">2     Gi1                       internal0/0/rp:0          DROP   (Ipv4Acl)</span>  (reason text illustrative)</pre>
<p>Read each column. <b>Input</b> and <b>Output</b> tell the path inside the router. <b>State</b> is FWD (forwarded), PUNT (sent up to the control processor, for example a protocol message to the router itself) or DROP. The <b>Reason</b> names the feature that dropped it. In this example packets 0 and 1 are forwarded and packet 2 is dropped by an access list; <code>show platform packet-trace packet 2 decode</code> shows every feature the packet passed, in order, down to the one that made the decision. With the FIA trace you also see the order of the features, which separates "dropped by an ACL" from "dropped by the firewall" from "no route".</p>
<p>Packet trace is run from the CLI. After you finish, stop the condition and clear it (for example with <code>clear platform condition all</code>) so that the router does not keep tracing. From release 17.11.1a, <code>show platform packet-trace fia-statistics</code> also gives feature-by-feature statistics.</p>

<h3>Embedded packet capture</h3>
<p>Packet trace tells you what the router did; a capture shows what was on the wire, byte for byte. Use it to prove DSCP markings, to check that a packet really arrives from a provider, or to see NAT and port behaviour.</p>
<pre class="code">E-BLR-1(config)# ip access-list extended TAC
E-BLR-1(config-ext-nacl)# 10 permit ip host 203.0.113.14 host 198.51.100.30
E-BLR-1(config-ext-nacl)# 20 permit ip host 198.51.100.30 host 203.0.113.14
E-BLR-1(config-ext-nacl)# end
E-BLR-1# monitor capture CAP access-list TAC bidirectional
E-BLR-1# monitor capture CAP interface GigabitEthernet1 both
E-BLR-1# monitor capture CAP start
<span class="c">! reproduce the problem for a short time</span>
E-BLR-1# monitor capture CAP stop
E-BLR-1# show monitor capture CAP buffer brief
E-BLR-1# monitor capture CAP export bootflash:cap.pcap</pre>
<p>The access list is the filter (here the control traffic between E-BLR-1 and the Validator, in both directions). Capture for seconds, not minutes, and export the file to an analysis tool. The addresses in the capture are the <b>outer</b> ones for tunnel traffic: inside the tunnel the content is encrypted, so to inspect a user flow you capture on the service-side interface instead. For a QoS check (sdw-qos) the DSCP in the outer header is what matters, and it is visible on the WAN interface.</p>
<p>Take captures on <b>both ends</b> of a path with synchronized clocks. If the packet leaves A and does not arrive at B, the fault is between them (the provider or a firewall); if it arrives at B and B does not answer, the fault is on B.</p>

<h3>Controller logs and captures</h3>
<p>The Controllers and the Manager are Linux machines with their own tools. A control connection problem often needs the controller side of the story.</p>
<pre class="code">VSMART# show control connections-history
VSMART# vshell
VSMART:~$ cd /var/log/tmplog/
VSMART:/var/log/tmplog$ tail -f vdebug
VSMART:~$ exit
VSMART# tcpdump vpn 0 interface ge0/0 options "host 203.0.113.14 -vv"</pre>
<p>The vdebug log on a controller records connection events (certificate verification and challenge steps) in more detail than the history; <code>tcpdump</code> in VPN 0 shows whether the edge's packets arrive at all. Both are read-only observation, but remember that the Manager and Controllers carry the whole network: do not leave a capture running.</p>

<h3>Debugs and logs on the edge</h3>
<p>Debug commands print events as they happen. On a production edge they are the most dangerous tool, because a debug that prints per packet can overload the processor. Rules: use conditional debugging so that only your flow is affected, run it for seconds, keep your session on the console or a management path that does not depend on what you are debugging, and turn it off at once with <code>undebug all</code>. Before debugging, try the syslog (<code>show logging</code>), the connection history, and the alarms in the Manager: they often already contain the answer.</p>

<h3>Admin-tech: when to call the vendor</h3>
<p>The admin-tech is a bundle of state, logs and configuration from a device. On the edge it is created with <code>request admin-tech</code>, and the Manager can also generate and download it from the device's menu. Collect it <b>while the problem is present</b>, record the time, and attach it to the TAC case together with your description, the commands you ran and the timeline. Without that, the first response from support will be a request for it.</p>

<h3>The safe-use checklist</h3>
<ol>
<li>State the question: what do I want to learn from this tool?</li>
<li>Filter to one host or one flow; keep counts small.</li>
<li>Choose a safe path to the device and know how to stop the tool.</li>
<li>Run it for a short time while reproducing the issue; note the time.</li>
<li>Stop, clear conditions, and save the output.</li>
<li>Record the conclusion in the ticket.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Mumbai users can reach 10.1.10.0/24 servers but not 10.1.10.50 (the ERP). Show commands look healthy: OMP, BFD, policy all fine. On E-DEL-1 the engineer sets a condition for host 10.2.10.10 and pings the ERP. The summary shows packet 2 as DROP with the reason Ipv4Acl. The packet decode shows an outbound localized ACL on GigabitEthernet2 that has a deny for host 10.1.10.50, added last week by the security team as a temporary rule. Two commands and a decode named the feature, the interface and the direction: ten minutes of work that would take hours by trial.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Starting with packet trace instead of show commands. (2) No condition, so the edge overloads. (3) Leaving a capture or condition running. (4) Capturing on the wrong interface (inside versus outside the tunnel). (5) Debugging over the path you are breaking. (6) Collecting admin-tech after the problem has gone.</p></div>

<div class="exam"><p><b>Exam trap.</b> Packet trace reports the path and the action (forward, punt, drop) inside the router; an embedded capture shows packets on an interface and uses an access list as filter; tcpdump on the controllers runs in a VPN. Tunnel traffic is encrypted, so capture on the service interface to see user data.</p></div>

<div class="scn"><h4>The packet that vanished at Delhi</h4><p>A new application at Bengaluru could not talk to a Delhi server. The network team captured on E-BLR-1 and on E-DEL-1 at the same time. The packet left Bengaluru with DSCP 34 and arrived at Delhi but the reply never left. A packet trace on Delhi showed a drop in the zone-based firewall: the new application's port had not been added to the policy. The security team added the rule and the application worked.</p><p><b>Lesson:</b> captures on both ends say which side owns the problem; packet trace names the feature.</p></div>

<div class="iv"><p class="q">"You have checked everything and still cannot find why a flow fails. What next?"</p><p>I use packet trace on the edge with a condition for that one flow to see whether it is forwarded, punted or dropped and by which feature. If I need to prove what is on the wire I run an embedded capture with an access-list filter on both ends for a short time. For control connections I use the controller logs. If it still points to a product issue I collect an admin-tech while the problem exists and open a TAC case with the timeline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Climb the ladder: show commands, logs, packet trace, capture, admin-tech.</li>
<li>Packet trace with a condition shows forward, punt or drop and the feature.</li>
<li>Embedded capture uses an access list filter; capture briefly, on both ends.</li>
<li>Controller vdebug logs and tcpdump help with control connection faults.</li>
<li>Debug sparingly; collect admin-tech while the problem exists.</li>
</ul></div>
`,hi:`
<p>Show commands building ke visitor register dekhne jaise hain: woh batate hain kitne log aaye aur gaye. Kabhi-kabhi ek visitor ko camera se follow karna padta hai aur dekhna padta hai ki kaunsa darwaza usse rok gaya. Packet trace aur captures wahi camera hain. Woh powerful aur mehnge hain, isliye aap unhe aakhir mein, ek flow par, thode samay ke liye use karte ho. Yeh chapter tools, unke safe use aur results padhna sikhata hai.</p>

<h3>Tools ki seedhi</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Ladder of troubleshooting tools">
<rect x="20" y="170" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="320" y="194" text-anchor="middle" class="svg-ink" font-size="13">1 Show commands aur counters: free, safe, hamesha pehle</text>
<rect x="70" y="124" width="500" height="38" rx="6" fill="#bae6fd"/><text x="320" y="148" text-anchor="middle" class="svg-ink" font-size="13">2 Logs aur history: connection-history, syslog, controller logs</text>
<rect x="120" y="78" width="400" height="38" rx="6" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">3 Ek flow par packet trace: kaunse feature ne drop kiya</text>
<rect x="170" y="32" width="300" height="38" rx="6" fill="#fed7aa"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">4 Packet capture: wire par packet</text>
<rect x="220" y="2" width="200" height="26" rx="6" fill="#fbcfe8"/><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="12">5 TAC ke liye admin-tech</text>
</svg><p class="cap">Sirf utna chadho jitna zaroori ho; har step zyada CPU aur dhyan maangta hai.</p></div>

<h3>Catalyst SD-WAN edge par packet trace</h3>
<p>Packet trace record karta hai ki forwarding engine ne chuney hue packets ke saath kya kiya: kaunse interface par aaye, kaunse features ne unhe chhua, forward hue, control processor ko punt hue ya drop hue, aur kyun. Workflow: condition tay karo (kaunse packets), start karo, traffic banao, summary padho, packet ko detail mein dekho, stop karo.</p>
<pre class="code">E-DEL-1# debug platform packet-trace packet 2048 fia-trace data-size 4096
E-DEL-1# debug platform condition ipv4 10.2.10.10/32 both
E-DEL-1# debug platform condition start
<span class="c">! traffic banao: Mumbai se ping ya application test</span>
E-DEL-1# show platform packet-trace summary
E-DEL-1# show platform packet-trace summary | include DROP
E-DEL-1# show platform packet-trace packet 0 decode
E-DEL-1# debug platform condition stop</pre>
<p>Condition trace ko ek host tak seemit karti hai (yahan Mumbai host 10.2.10.10, dono directions mein); aap interface aur direction (ingress ya egress, aur bidirectional) par bhi match kar sakte ho. Pehli line ke do numbers rakhe gaye packets ki ginti aur har packet ke liye record data ki matra hain. Chhote se shuru karo. Busy edge par bina condition ka trace memory aur processor khata hai aur jis device ko theek karna hai use hi slow kar sakta hai.</p>
<pre class="out">E-DEL-1# show platform packet-trace summary
Pkt   Input                     Output                    State  Reason
0     Gi1                       Gi2                       FWD
1     Gi1                       Gi2                       FWD
<span class="hl">2     Gi1                       internal0/0/rp:0          DROP   (Ipv4Acl)</span>  (reason text sirf udaharan)</pre>
<p>Har column padho. <b>Input</b> aur <b>Output</b> router ke andar ka path batate hain. <b>State</b> FWD (forward hua), PUNT (control processor ko bheja gaya, jaise router ko hi aaya protocol message) ya DROP hai. <b>Reason</b> us feature ka naam batata hai jisne drop kiya. Is udaharan mein packets 0 aur 1 forward hue aur packet 2 ko access list ne drop kiya; <code>show platform packet-trace packet 2 decode</code> packet ke guzre har feature ko order mein dikhata hai, us feature tak jisne faisla liya. FIA trace se features ka order bhi dikhta hai, jo "ACL ne drop kiya" ko "firewall ne drop kiya" aur "route nahi" se alag karta hai.</p>
<p>Packet trace CLI se chalta hai. Khatam karne ke baad condition ko stop aur clear karo (jaise <code>clear platform condition all</code> se) taaki router trace karta na rahe. Release 17.11.1a se <code>show platform packet-trace fia-statistics</code> feature-dar-feature statistics bhi deta hai.</p>

<h3>Embedded packet capture</h3>
<p>Packet trace batata hai ki router ne kya kiya; capture dikhata hai ki wire par kya tha, byte-by-byte. Ise DSCP markings sabit karne, yeh dekhne ki packet sach mein provider se aata hai, ya NAT aur port behaviour dekhne ke liye use karo.</p>
<pre class="code">E-BLR-1(config)# ip access-list extended TAC
E-BLR-1(config-ext-nacl)# 10 permit ip host 203.0.113.14 host 198.51.100.30
E-BLR-1(config-ext-nacl)# 20 permit ip host 198.51.100.30 host 203.0.113.14
E-BLR-1(config-ext-nacl)# end
E-BLR-1# monitor capture CAP access-list TAC bidirectional
E-BLR-1# monitor capture CAP interface GigabitEthernet1 both
E-BLR-1# monitor capture CAP start
<span class="c">! thode samay ke liye problem reproduce karo</span>
E-BLR-1# monitor capture CAP stop
E-BLR-1# show monitor capture CAP buffer brief
E-BLR-1# monitor capture CAP export bootflash:cap.pcap</pre>
<p>Access list filter hai (yahan E-BLR-1 aur Validator ke beech control traffic, dono directions mein). Seconds ke liye capture karo, minutes ke liye nahi, aur file ko analysis tool mein export karo. Tunnel traffic ke liye capture ke addresses <b>outer</b> wale hote hain: tunnel ke andar content encrypted hai, isliye user flow dekhne ke liye service-side interface par capture karo. QoS check (sdw-qos) ke liye outer header ka DSCP matter karta hai, aur woh WAN interface par dikhta hai.</p>
<p>Path ke <b>dono ends</b> par synchronized clocks ke saath capture lo. Packet A se nikla aur B par nahi pahuncha to fault beech mein hai (provider ya firewall); B par pahuncha aur B ne jawab nahi diya to fault B par hai.</p>

<h3>Controller logs aur captures</h3>
<p>Controllers aur Manager Linux machines hain jinke apne tools hain. Control connection problem ko aksar controller side ki kahani chahiye.</p>
<pre class="code">VSMART# show control connections-history
VSMART# vshell
VSMART:~$ cd /var/log/tmplog/
VSMART:/var/log/tmplog$ tail -f vdebug
VSMART:~$ exit
VSMART# tcpdump vpn 0 interface ge0/0 options "host 203.0.113.14 -vv"</pre>
<p>Controller par vdebug log connection events (certificate verification aur challenge steps) history se zyada detail mein record karta hai; VPN 0 mein <code>tcpdump</code> dikhata hai ki edge ke packets pahunchte bhi hain ya nahi. Dono sirf observation hain, lekin yaad rakho ki Manager aur Controllers poora network sambhalte hain: capture chalta mat chhodo.</p>

<h3>Edge par debugs aur logs</h3>
<p>Debug commands events ko hote hue print karte hain. Production edge par yeh sabse khatarnak tool hai, kyunki per-packet print karne wala debug processor overload kar sakta hai. Niyam: conditional debugging use karo taaki sirf aapka flow prabhavit ho, seconds ke liye chalao, apna session console ya aise management path par rakho jo us cheez par nirbhar na ho jise debug kar rahe ho, aur <code>undebug all</code> se turant band karo. Debug se pehle syslog (<code>show logging</code>), connection history aur Manager ke alarms dekho: unmein aksar jawab pehle se hota hai.</p>

<h3>Admin-tech: vendor ko kab bulayein</h3>
<p>Admin-tech device ke state, logs aur configuration ka bundle hai. Edge par yeh <code>request admin-tech</code> se banta hai, aur Manager bhi device ke menu se ise generate aur download kar sakta hai. Ise <b>problem maujood rehte hue</b> collect karo, waqt note karo, aur apne description, chalaye hue commands aur timeline ke saath TAC case mein lagao. Uske bina support ka pehla jawab usi ki maang hoga.</p>

<h3>Safe-use checklist</h3>
<ol>
<li>Sawal likho: is tool se mujhe kya seekhna hai?</li>
<li>Ek host ya ek flow tak filter karo; counts chhote rakho.</li>
<li>Device tak safe path chuno aur tool band karna jaano.</li>
<li>Problem reproduce karte hue thode samay chalao; waqt note karo.</li>
<li>Stop karo, conditions clear karo, aur output save karo.</li>
<li>Nishkarsh ticket mein record karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Mumbai users 10.1.10.0/24 servers tak pahunch sakte hain lekin 10.1.10.50 (ERP) tak nahi. Show commands healthy hain: OMP, BFD, policy sab theek. E-DEL-1 par engineer host 10.2.10.10 ke liye condition set karta hai aur ERP ko ping karta hai. Summary packet 2 ko DROP dikhata hai, reason Ipv4Acl. Packet decode GigabitEthernet2 par outbound localized ACL dikhata hai jismein host 10.1.10.50 ke liye deny hai, jo pichhle hafte security team ne temporary rule ke roop mein jodi thi. Do commands aur ek decode ne feature, interface aur direction ka naam bataya: das minute ka kaam jo trial se ghanton leta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Show commands ki jagah packet trace se shuru karna. (2) Condition nahi, to edge overload. (3) Capture ya condition chalta chhod dena. (4) Galat interface par capture (tunnel ke andar versus bahar). (5) Jis path ko tod rahe ho usi par debug karna. (6) Problem jaane ke baad admin-tech collect karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Packet trace router ke andar path aur action (forward, punt, drop) batata hai; embedded capture interface par packets dikhata hai aur access list ko filter banata hai; controllers par tcpdump VPN mein chalta hai. Tunnel traffic encrypted hai, isliye user data dekhne ke liye service interface par capture karo.</p></div>

<div class="scn"><h4>Delhi par gayab hua packet</h4><p>Bengaluru ki nayi application Delhi server se baat nahi kar paa rahi thi. Network team ne E-BLR-1 aur E-DEL-1 par ek saath capture liya. Packet Bengaluru se DSCP 34 ke saath nikla aur Delhi pahuncha lekin reply kabhi nahi nikla. Delhi par packet trace ne zone-based firewall mein drop dikhaya: nayi application ka port policy mein nahi jodha gaya tha. Security team ne rule jodi aur application chal padi.</p><p><b>Lesson:</b> dono ends ke captures batate hain problem kis side ki hai; packet trace feature ka naam batata hai.</p></div>

<div class="iv"><p class="q">"Sab kuch check kar liya aur phir bhi flow fail kyun hota hai pata nahi. Ab?"</p><p>Main edge par us ek flow ki condition ke saath packet trace use karta hoon ki woh forward, punt ya drop hota hai aur kis feature se. Wire par kya hai yeh sabit karna ho to dono ends par access-list filter ke saath thode samay ke liye embedded capture chalata hoon. Control connections ke liye controller logs. Phir bhi product issue lage to problem rehte hue admin-tech collect karta hoon aur timeline ke saath TAC case kholta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seedhi chadho: show commands, logs, packet trace, capture, admin-tech.</li>
<li>Condition ke saath packet trace forward, punt ya drop aur feature dikhata hai.</li>
<li>Embedded capture access list filter use karta hai; thoda samay, dono ends par.</li>
<li>Controller vdebug logs aur tcpdump control connection faults mein madad karte hain.</li>
<li>Debug kam use karo; problem rehte hue admin-tech collect karo.</li>
</ul></div>
`}};export{e as default};