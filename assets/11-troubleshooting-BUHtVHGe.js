var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: bridges, IPS modes and route tracking`,hi:`Troubleshooting workflow: bridges, IPS modes aur route tracking`},body:{en:`
<p>A good doctor does not start with surgery. She checks pulse and breathing, then organs, then tests, in the same order every time, so nothing is skipped. Deployment problems deserve the same discipline. Work from the bottom up: <b>mode and interfaces</b>, then <b>layer 2</b>, then <b>policy</b>, then <b>routing and tracking</b>, then <b>inspection engines</b>. Each layer has two or three commands that answer its question.</p>

<table class="cmp"><tr><th>Layer</th><th>Question</th><th>Commands</th></tr>
<tr><td>1. Mode and interfaces</td><td>Is the box in the mode I think, and are the right ports up with the right names?</td><td><code>show firewall</code>, <code>show nameif</code>, <code>show interface ip brief</code>, <code>show bridge-group</code>, <code>show port-channel summary</code></td></tr>
<tr><td>2. Layer 2 (transparent)</td><td>Does the bridge know where the hosts are?</td><td><code>show mac-address-table</code>, <code>show arp</code>, <code>show arp-inspection</code></td></tr>
<tr><td>3. Policy</td><td>Is the traffic allowed and inspected?</td><td><code>show logging</code> (106001, 106014, 106023), <code>show access-list</code> hit counts, <code>capture</code>, <code>show asp drop</code></td></tr>
<tr><td>4. Routing and tracking</td><td>Which exit is used and why?</td><td><code>show route</code>, <code>show track</code>, <code>show sla monitor configuration</code>, <code>show sla monitor operational-state</code>, <code>show zone</code>, syslog 622001</td></tr>
<tr><td>5. Inspection engines</td><td>Is Snort inline, tapping or down?</td><td><code>show inline-set</code>, intrusion events ("would have dropped")</td></tr></table>

<h3>Transparent firewall symptoms</h3>
<ul>
<li><b>Nothing passes, not even ARP</b>: <code>show bridge-group</code> shows <i>Management System IP Address: 0.0.0.0</i>. The BVI has no address. Add it.</li>
<li><b>One side cannot reach the other</b>: members in different bridge groups, or a member shut down. Check <code>show bridge-group</code> and <code>show interface ip brief</code>.</li>
<li><b>Outbound works, inbound fails</b>: syslog 106001 or 106023 on outside; the lower-to-higher ACL is missing.</li>
<li><b>Web works, ping fails</b>: 106014 for echo replies; add <code>inspect icmp</code>.</li>
<li><b>OSPF, DHCP or IS-IS stops at the firewall</b>: multicast or broadcast IP needs an extended ACL in both directions; non-IP needs an EtherType ACL.</li>
<li><b>Loops after a failover test</b>: BPDUs not permitted.</li>
<li><b>A host loses connectivity after ARP inspection was enabled</b>: no static entry and <code>no-flood</code>; look for 322002 or 322003.</li>
</ul>
<pre class="out">NK-TFW# show logging | include 106001
%ASA-2-106001: Inbound TCP connection denied from 10.0.1.250/51022 to 10.0.1.20/80 flags SYN  on interface outside</pre>

<h3>IPS-mode symptoms</h3>
<ul>
<li><b>Attacks are logged but never blocked</b>: the inline set is in tap mode, or the interfaces are passive. <code>show inline-set</code> shows <i>Tap mode is on</i>.</li>
<li><b>Traffic stops during every deploy</b>: Snort fail-open for "down" is off and no bypass is configured.</li>
<li><b>One side of an inline pair went down but neighbours did not reroute</b>: propagate link state is off.</li>
<li><b>Sessions reset after enabling strict TCP enforcement</b>: asymmetric paths where the device sees only one direction of a flow.</li>
</ul>

<h3>Walkthrough: INC-9021, route tracking that never tracks (lab 3)</h3>
<p>Finance reports two things: since last night every flow leaves via the metered ISP2, and last month an ISP1 upstream outage caused 40 minutes of downtime although a backup exists. The design: probe 4.2.2.2 via outside every 5 s, tracked default via ISP1, floating route via ISP2 with distance 254.</p>
<p><b>Step 1, confirm the symptom.</b></p>
<pre class="out">NK-ASA# show route | include Gateway|0.0.0.0
<span class="hl">Gateway of last resort is 198.51.100.1 to network 0.0.0.0</span>
S*       0.0.0.0 0.0.0.0 [254/0] via 198.51.100.1, backup</pre>
<p>ISP1 is healthy, yet the floating route is active. So the tracked route is not installed: look at the track.</p>
<p><b>Step 2, the track and the SLA.</b></p>
<pre class="out">NK-ASA# show track 1
Track 1
  Response Time Reporter 1 reachability
<span class="hl">  Reachability is Down</span>
  0 changes, last change never
  Latest operation return code: Unknown

NK-ASA# show sla monitor configuration 1
Entry number: 1
Type of operation to perform: echo
<span class="hl">Target address: 203.0.113.1</span>
Interface: outside
Operation timeout (milliseconds): 5000
Operation frequency (seconds): 5
<span class="hl">Next Scheduled Start Time: Pending trigger</span>
Life (seconds): Forever
<span class="hl">Status of entry (SNMP RowStatus): Not in service</span></pre>
<p>Two faults: "0 changes, last change never" and "Pending trigger" mean the SLA was <b>never scheduled</b>, so the track has never been Up and the tracked route was never installed. That explains complaint one. The target 203.0.113.1 is ISP1's own gateway, which still answers when ISP1's upstream fails. That explains complaint two.</p>
<p><b>Step 3, fix both.</b> Because the entry is not running, it can still be edited; once it runs, you would have to delete and recreate it.</p>
<pre class="code">NK-ASA(config)# sla monitor 1
NK-ASA(config-sla-monitor)# type echo protocol ipIcmpEcho 4.2.2.2 interface outside
NK-ASA(config-sla-monitor-echo)# frequency 5
NK-ASA(config-sla-monitor-echo)# exit
NK-ASA(config)# sla monitor schedule 1 life forever start-time now</pre>
<pre class="out">%ASA-6-622001: Adding tracked route 0.0.0.0 0.0.0.0 203.0.113.1, distance 1, table default, on interface outside</pre>
<p><b>Step 4, prove it.</b> Shut ISP1's Gi0/1 to repeat last month's outage. Within about ten seconds syslog shows <i>Removing tracked route ... 203.0.113.1</i>, <code>show route</code> shows 198.51.100.1, and PC1 still reaches 8.8.8.8. Bring Gi0/1 back: the track goes Up, the route fails back, and PC1 is translated to 203.0.113.2 again. Close the ticket with the evidence.</p>

<h3>Useful extra tools for tracking</h3>
<ul>
<li><code>debug sla monitor trace</code> shows each probe and its result (use briefly).</li>
<li><code>capture SLA interface outside match icmp host 203.0.113.2 host 4.2.2.2</code> proves whether probes leave and replies return.</li>
<li>If the reply never comes back, check the upstream: the provider may filter ICMP to that target; choose another target.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Route tracking decision chain">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">show route</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="12">which exit?</text>
<rect x="140" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="13">show track</text><text x="195" y="94" text-anchor="middle" class="svg-muted" font-size="12">Up / Down?</text>
<rect x="270" y="50" width="120" height="60" rx="8" fill="#fde68a"/><text x="330" y="76" text-anchor="middle" class="svg-ink" font-size="13">sla config</text><text x="330" y="94" text-anchor="middle" class="svg-muted" font-size="12">scheduled? target?</text>
<rect x="410" y="50" width="110" height="60" rx="8" fill="#fed7aa"/><text x="465" y="76" text-anchor="middle" class="svg-ink" font-size="13">operational</text><text x="465" y="94" text-anchor="middle" class="svg-muted" font-size="12">OK / Timeout</text>
<rect x="540" y="50" width="90" height="60" rx="8" fill="#bbf7d0"/><text x="585" y="76" text-anchor="middle" class="svg-ink" font-size="13">capture</text><text x="585" y="94" text-anchor="middle" class="svg-muted" font-size="12">probe path</text>
<line x1="120" y1="80" x2="140" y2="80" stroke="#64748b" stroke-width="2"/><line x1="250" y1="80" x2="270" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="80" x2="410" y2="80" stroke="#64748b" stroke-width="2"/><line x1="520" y1="80" x2="540" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">route, then track, then SLA configuration, then the probe itself</text>
</svg><p class="cap">Follow the chain from the symptom back to the probe.</p></div>

<div class="eg"><p><b>Worked example.</b> An ECMP ticket: "half the users have no internet". <code>show route</code> shows two equal defaults, <code>show zone</code> shows both interfaces in ISPS, but <code>show nat</code> has a rule only for <code>(inside,outside)</code>. Flows hashed to backup leave untranslated. Adding <code>nat (inside,backup) dynamic interface</code> in a second object fixes it; <code>show xlate</code> then shows translations to both 203.0.113.2 and 198.51.100.2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deleting and re-adding the tracked route when the real fault is the SLA. The route is only a consumer; if the track is Down, the route will never appear, however many times you type it.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Latest operation return code: Unknown" with "Pending trigger" means not scheduled. "Timeout" means the probe runs but gets no reply. They lead to different fixes: schedule it, or fix the target or path.</p></div>

<div class="scn"><h4>The IPS that never blocked</h4><p>An audit found that a Threat Defense sensor had logged 300 exploit attempts against a web server in a month but blocked none. <code>show inline-set</code> showed <i>Tap mode is on</i>: the pilot configuration had never been switched to enforcing. After a change request, tap mode was turned off, and the next attempts were dropped with "Inline Result: Dropped".</p><p><b>Lesson:</b> after a tap-mode pilot, schedule the switch to inline, and verify it.</p></div>

<div class="iv"><p class="q">"Route tracking is configured but traffic always uses the backup ISP. How do you troubleshoot?"</p><p>Confirm with <code>show route</code> which next hop is active. Check <code>show track</code>: if it is Down with no changes, check <code>show sla monitor configuration</code> for "Pending trigger", which means the schedule is missing. If it is scheduled, <code>show sla monitor operational-state</code> shows OK or Timeout; on Timeout, capture the probe on the outside interface and check the target and ICMP filtering. Also check the target is beyond the ISP, NAT exists for both exits, and syslog 622001 records changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work bottom-up: mode and interfaces, layer 2, policy, routing and tracking, inspection engines.</li>
<li>Transparent: BVI missing, wrong bridge group, missing inbound ACL, ICMP not inspected, non-IP needing EtherType ACLs.</li>
<li>IPS: tap mode left on, fail-open settings, propagate link state, strict TCP with asymmetric paths.</li>
<li>Tracking: route, then track, then SLA configuration ("Pending trigger", target), then operational state and captures.</li>
<li>Close tickets with proof: failover and fail-back tested, syslog 622001 in both directions.</li>
</ul></div>
`,hi:`
<p>Achhi doctor surgery se shuru nahi karti. Woh pulse aur saans check karti hai, phir organs, phir tests, har baar same order mein, taaki kuch chhoot na jaaye. Deployment problems ko bhi yahi discipline chahiye. Neeche se upar kaam karo: <b>mode aur interfaces</b>, phir <b>layer 2</b>, phir <b>policy</b>, phir <b>routing aur tracking</b>, phir <b>inspection engines</b>. Har layer ke do-teen commands hain jo uske sawaal ka jawab dete hain.</p>

<table class="cmp"><tr><th>Layer</th><th>Sawaal</th><th>Commands</th></tr>
<tr><td>1. Mode aur interfaces</td><td>Kya box usi mode mein hai jo main soch raha hoon, aur sahi ports sahi naamon ke saath up hain?</td><td><code>show firewall</code>, <code>show nameif</code>, <code>show interface ip brief</code>, <code>show bridge-group</code>, <code>show port-channel summary</code></td></tr>
<tr><td>2. Layer 2 (transparent)</td><td>Kya bridge jaanta hai ki hosts kahan hain?</td><td><code>show mac-address-table</code>, <code>show arp</code>, <code>show arp-inspection</code></td></tr>
<tr><td>3. Policy</td><td>Kya traffic allowed aur inspected hai?</td><td><code>show logging</code> (106001, 106014, 106023), <code>show access-list</code> hit counts, <code>capture</code>, <code>show asp drop</code></td></tr>
<tr><td>4. Routing aur tracking</td><td>Kaunsa exit use ho raha hai aur kyun?</td><td><code>show route</code>, <code>show track</code>, <code>show sla monitor configuration</code>, <code>show sla monitor operational-state</code>, <code>show zone</code>, syslog 622001</td></tr>
<tr><td>5. Inspection engines</td><td>Snort inline hai, tap kar raha hai ya down hai?</td><td><code>show inline-set</code>, intrusion events ("would have dropped")</td></tr></table>

<h3>Transparent firewall ke symptoms</h3>
<ul>
<li><b>Kuch pass nahi hota, ARP bhi nahi</b>: <code>show bridge-group</code> <i>Management System IP Address: 0.0.0.0</i> dikhata hai. BVI ka address nahi hai. Jodo.</li>
<li><b>Ek taraf doosri taraf nahi pahunchti</b>: members alag bridge groups mein, ya ek member shut. <code>show bridge-group</code> aur <code>show interface ip brief</code> check karo.</li>
<li><b>Outbound chalta hai, inbound fail</b>: outside par syslog 106001 ya 106023; lower-to-higher ACL missing hai.</li>
<li><b>Web chalta hai, ping fail</b>: echo replies ke liye 106014; <code>inspect icmp</code> jodo.</li>
<li><b>OSPF, DHCP ya IS-IS firewall par ruk jaata hai</b>: multicast ya broadcast IP ko dono directions mein extended ACL chahiye; non-IP ko EtherType ACL.</li>
<li><b>Failover test ke baad loops</b>: BPDUs permitted nahi.</li>
<li><b>ARP inspection enable hone ke baad ek host ki connectivity gayi</b>: static entry nahi aur <code>no-flood</code>; 322002 ya 322003 dhoondho.</li>
</ul>
<pre class="out">NK-TFW# show logging | include 106001
%ASA-2-106001: Inbound TCP connection denied from 10.0.1.250/51022 to 10.0.1.20/80 flags SYN  on interface outside</pre>

<h3>IPS-mode ke symptoms</h3>
<ul>
<li><b>Attacks log hote hain lekin kabhi block nahi hote</b>: inline set tap mode mein hai, ya interfaces passive hain. <code>show inline-set</code> <i>Tap mode is on</i> dikhata hai.</li>
<li><b>Har deploy ke dauraan traffic rukta hai</b>: "down" ke liye Snort fail-open off hai aur koi bypass configured nahi.</li>
<li><b>Inline pair ki ek taraf down hui lekin neighbours ne reroute nahi kiya</b>: propagate link state off hai.</li>
<li><b>Strict TCP enforcement enable karne ke baad sessions reset</b>: asymmetric paths jahan device flow ki sirf ek direction dekhta hai.</li>
</ul>

<h3>Walkthrough: INC-9021, route tracking jo kabhi track nahi karti (lab 3)</h3>
<p>Finance do cheezein report karta hai: kal raat se har flow metered ISP2 se nikalta hai, aur pichhle mahine ISP1 upstream outage ne 40 minute downtime diya jabki backup hai. Design: outside se har 5 s 4.2.2.2 probe, ISP1 ke through tracked default, ISP2 ke through distance 254 wala floating route.</p>
<p><b>Step 1, symptom confirm karo.</b></p>
<pre class="out">NK-ASA# show route | include Gateway|0.0.0.0
<span class="hl">Gateway of last resort is 198.51.100.1 to network 0.0.0.0</span>
S*       0.0.0.0 0.0.0.0 [254/0] via 198.51.100.1, backup</pre>
<p>ISP1 healthy hai, phir bhi floating route active hai. Matlab tracked route install nahi hai: track dekho.</p>
<p><b>Step 2, track aur SLA.</b></p>
<pre class="out">NK-ASA# show track 1
Track 1
  Response Time Reporter 1 reachability
<span class="hl">  Reachability is Down</span>
  0 changes, last change never
  Latest operation return code: Unknown

NK-ASA# show sla monitor configuration 1
Entry number: 1
Type of operation to perform: echo
<span class="hl">Target address: 203.0.113.1</span>
Interface: outside
Operation timeout (milliseconds): 5000
Operation frequency (seconds): 5
<span class="hl">Next Scheduled Start Time: Pending trigger</span>
Life (seconds): Forever
<span class="hl">Status of entry (SNMP RowStatus): Not in service</span></pre>
<p>Do faults: "0 changes, last change never" aur "Pending trigger" ka matlab SLA <b>kabhi schedule nahi hua</b>, isliye track kabhi Up nahi hua aur tracked route kabhi install nahi hua. Yeh pehli shikayat samjhata hai. Target 203.0.113.1 ISP1 ka apna gateway hai, jo ISP1 ka upstream fail hone par bhi jawab deta hai. Yeh doosri shikayat samjhata hai.</p>
<p><b>Step 3, dono theek karo.</b> Kyunki entry chal nahi rahi, ise abhi edit kiya ja sakta hai; chalne ke baad aapko delete karke dobara banana padta.</p>
<pre class="code">NK-ASA(config)# sla monitor 1
NK-ASA(config-sla-monitor)# type echo protocol ipIcmpEcho 4.2.2.2 interface outside
NK-ASA(config-sla-monitor-echo)# frequency 5
NK-ASA(config-sla-monitor-echo)# exit
NK-ASA(config)# sla monitor schedule 1 life forever start-time now</pre>
<pre class="out">%ASA-6-622001: Adding tracked route 0.0.0.0 0.0.0.0 203.0.113.1, distance 1, table default, on interface outside</pre>
<p><b>Step 4, saabit karo.</b> Pichhle mahine ka outage dohraane ke liye ISP1 ka Gi0/1 shut karo. Lagbhag das second mein syslog <i>Removing tracked route ... 203.0.113.1</i> dikhata hai, <code>show route</code> 198.51.100.1 dikhata hai, aur PC1 ab bhi 8.8.8.8 tak pahunchta hai. Gi0/1 wapas lao: track Up hota hai, route fail back hota hai, aur PC1 phir 203.0.113.2 mein translate hota hai. Evidence ke saath ticket band karo.</p>

<h3>Tracking ke liye extra tools</h3>
<ul>
<li><code>debug sla monitor trace</code> har probe aur uska result dikhata hai (thodi der ke liye use karo).</li>
<li><code>capture SLA interface outside match icmp host 203.0.113.2 host 4.2.2.2</code> saabit karta hai ki probes nikalte hain aur replies wapas aate hain ya nahi.</li>
<li>Agar reply kabhi wapas nahi aata, upstream check karo: provider us target ka ICMP filter kar sakta hai; doosra target chuno.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Route tracking decision chain">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="76" text-anchor="middle" class="svg-ink" font-size="13">show route</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="12">kaunsa exit?</text>
<rect x="140" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="195" y="76" text-anchor="middle" class="svg-ink" font-size="13">show track</text><text x="195" y="94" text-anchor="middle" class="svg-muted" font-size="12">Up / Down?</text>
<rect x="270" y="50" width="120" height="60" rx="8" fill="#fde68a"/><text x="330" y="76" text-anchor="middle" class="svg-ink" font-size="13">sla config</text><text x="330" y="94" text-anchor="middle" class="svg-muted" font-size="12">scheduled? target?</text>
<rect x="410" y="50" width="110" height="60" rx="8" fill="#fed7aa"/><text x="465" y="76" text-anchor="middle" class="svg-ink" font-size="13">operational</text><text x="465" y="94" text-anchor="middle" class="svg-muted" font-size="12">OK / Timeout</text>
<rect x="540" y="50" width="90" height="60" rx="8" fill="#bbf7d0"/><text x="585" y="76" text-anchor="middle" class="svg-ink" font-size="13">capture</text><text x="585" y="94" text-anchor="middle" class="svg-muted" font-size="12">probe path</text>
<line x1="120" y1="80" x2="140" y2="80" stroke="#64748b" stroke-width="2"/><line x1="250" y1="80" x2="270" y2="80" stroke="#64748b" stroke-width="2"/><line x1="390" y1="80" x2="410" y2="80" stroke="#64748b" stroke-width="2"/><line x1="520" y1="80" x2="540" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">route, phir track, phir SLA configuration, phir khud probe</text>
</svg><p class="cap">Symptom se probe tak chain follow karo.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek ECMP ticket: "aadhe users ka internet nahi hai". <code>show route</code> do equal defaults dikhata hai, <code>show zone</code> dono interfaces ISPS mein dikhata hai, lekin <code>show nat</code> mein sirf <code>(inside,outside)</code> ka rule hai. Backup par hash hue flows bina translate hue nikalte hain. Doosre object mein <code>nat (inside,backup) dynamic interface</code> jodne se theek hota hai; phir <code>show xlate</code> 203.0.113.2 aur 198.51.100.2 dono ke translations dikhata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Jab asli fault SLA mein ho tab tracked route delete karke dobara jodna. Route sirf consumer hai; agar track Down hai, route kabhi nahi aayega, chahe aap use kitni baar bhi type karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Latest operation return code: Unknown" ke saath "Pending trigger" ka matlab schedule nahi hua. "Timeout" ka matlab probe chalta hai lekin reply nahi milta. Dono ke fixes alag hain: schedule karo, ya target ya path theek karo.</p></div>

<div class="scn"><h4>IPS jo kabhi block nahi karta tha</h4><p>Ek audit mein pata chala ki ek Threat Defense sensor ne ek mahine mein web server ke khilaaf 300 exploit attempts log kiye lekin ek bhi block nahi kiya. <code>show inline-set</code> ne <i>Tap mode is on</i> dikhaya: pilot configuration kabhi enforcing par switch nahi hui thi. Change request ke baad tap mode band hua, aur agle attempts "Inline Result: Dropped" ke saath drop hue.</p><p><b>Seekh:</b> tap-mode pilot ke baad inline par switch schedule karo, aur verify karo.</p></div>

<div class="iv"><p class="q">"Route tracking configured hai lekin traffic hamesha backup ISP use karta hai. Kaise troubleshoot karoge?"</p><p><code>show route</code> se confirm karo ki kaunsa next hop active hai. <code>show track</code> check karo: agar bina changes ke Down hai, to <code>show sla monitor configuration</code> mein "Pending trigger" dekho, jiska matlab schedule missing hai. Agar scheduled hai, <code>show sla monitor operational-state</code> OK ya Timeout dikhata hai; Timeout par outside interface par probe capture karo aur target aur ICMP filtering check karo. Yeh bhi check karo ki target ISP ke aage hai, dono exits ka NAT hai, aur syslog 622001 changes record karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar kaam karo: mode aur interfaces, layer 2, policy, routing aur tracking, inspection engines.</li>
<li>Transparent: BVI missing, galat bridge group, missing inbound ACL, ICMP inspect nahi, non-IP ko EtherType ACLs chahiye.</li>
<li>IPS: tap mode chhoot gaya, fail-open settings, propagate link state, asymmetric paths ke saath strict TCP.</li>
<li>Tracking: route, phir track, phir SLA configuration ("Pending trigger", target), phir operational state aur captures.</li>
<li>Proof ke saath tickets band karo: failover aur fail-back test, dono directions mein syslog 622001.</li>
</ul></div>
`}};export{e as default};