var e={id:`heartbeat-links`,h:{en:`Heartbeat links, monitored interfaces and cabling the cluster`,hi:`Heartbeat links, monitored interfaces aur cluster ki cabling`},body:{en:`
<p>A cluster only works if the units can talk to each other quickly and reliably, and if each unit knows when its own network connections are healthy. Two features do this: <b>heartbeat interfaces</b> and <b>monitored interfaces</b>. Getting them right prevents most real-world HA incidents.</p>

<h3>What heartbeat does</h3>
<p>A <b>heartbeat interface</b> (set with <code>hbdev</code>) is a physical port dedicated to cluster traffic. Over it each unit sends small keep-alive frames to the other. The same links also carry three other things: the <b>configuration synchronisation</b> from primary to secondary, the <b>session synchronisation</b> if you enable it, and, in active-active mode, the <b>load-balanced traffic</b>. Heartbeat packets are Layer 2 frames with Fortinet-specific Ethernet types, not normal IP traffic, so they do not need routing. They are also meant to stay on a private cable or an isolated VLAN, away from user traffic.</p>
<ul>
<li>You list heartbeat ports with a priority, for example <code>set hbdev "port3" 50 "port4" 50</code>. Higher priority is preferred for sync traffic.</li>
<li>Use <b>at least two</b> heartbeat interfaces. One cable fault must not make both units believe the other has died.</li>
<li>Where possible connect them directly, unit to unit, with no switch in between.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Heartbeat and monitored interfaces">
<rect x="60" y="50" width="150" height="110" rx="10" fill="#bbf7d0"/><text x="135" y="80" text-anchor="middle" class="svg-ink" font-size="13">FGT-A (primary)</text><text x="135" y="105" text-anchor="middle" class="svg-muted" font-size="12">port1 WAN monitored</text><text x="135" y="125" text-anchor="middle" class="svg-muted" font-size="12">port2 LAN monitored</text><text x="135" y="145" text-anchor="middle" class="svg-muted" font-size="12">port3 port4 heartbeat</text>
<rect x="430" y="50" width="150" height="110" rx="10" fill="#fde68a"/><text x="505" y="80" text-anchor="middle" class="svg-ink" font-size="13">FGT-B (secondary)</text><text x="505" y="105" text-anchor="middle" class="svg-muted" font-size="12">port1 WAN monitored</text><text x="505" y="125" text-anchor="middle" class="svg-muted" font-size="12">port2 LAN monitored</text><text x="505" y="145" text-anchor="middle" class="svg-muted" font-size="12">port3 port4 heartbeat</text>
<line x1="210" y1="95" x2="430" y2="95" stroke="#64748b" stroke-width="3"/><line x1="210" y1="125" x2="430" y2="125" stroke="#64748b" stroke-width="3"/>
<text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">port3 heartbeat</text><text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="12">port4 heartbeat</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">Two direct cables: losing one does not split the cluster</text>
</svg><p class="cap">Two dedicated heartbeat cables between the units.</p></div>

<h3>Heartbeat timers</h3>
<p>Two settings control how quickly a lost peer is detected. <code>hb-interval</code> is how often heartbeats are sent, in units of 100 milliseconds. <code>hb-lost-threshold</code> is how many heartbeats can be missed before the peer is declared failed. Together they set the failure-detection time. The defaults are a good balance for most networks. Making the threshold very short speeds up failover but increases the chance of a false failover during a brief CPU spike or a flapping cable. Change them only with a reason, and test.</p>
<p>The heartbeat can also be <b>authenticated and encrypted</b> (<code>authentication</code> and <code>encryption</code> options). This matters when the heartbeat crosses a shared switch, because a rogue device could otherwise attempt to join or disturb the cluster. On a direct cable it is optional, but encryption is a sensible default when the link leaves the rack. On virtual machines, where there is no Layer 2 path for these frames, you use <b>unicast heartbeat</b> (<code>unicast-hb</code> with the peer address) instead.</p>

<h3>Monitored interfaces</h3>
<p>A <b>monitored interface</b> (<code>set monitor "port1" "port2"</code>) is a data interface whose link state the cluster watches. If a monitored interface goes down on the primary, the cluster counts it and may fail over to the unit that has more working monitored interfaces. This is how a dead uplink or a bad switch port triggers failover even though the unit itself is healthy. Without monitoring, the primary would stay primary while its WAN cable was unplugged, and the network would be down with a perfectly good standby beside it.</p>
<p>For links that are up but not useful, <b>remote link monitoring</b> (<code>pingserver-monitor-interface</code> with <code>pingserver-failover-threshold</code>) pings a remote address through an interface and treats repeated ping failure as an interface fault. This catches an ISP outage that leaves the local port lit.</p>

<h3>The management interface</h3>
<p>In a cluster, an administrator normally connects to the primary through any data interface, but you also need a way to reach the <b>secondary</b>. A <b>reserved management interface</b> (<code>ha-mgmt-status enable</code> and <code>ha-mgmt-interfaces</code>) gives each unit its own management IP that stays reachable regardless of role. It is excluded from forwarding and from configuration sync. From the primary you can also jump to the secondary with <code>execute ha manage</code> followed by the member index and an admin name.</p>

<div class="eg"><p><b>Worked example.</b> HQ plan: port1 to the ISP switch (monitored), port2 to the core (monitored), port3 and port4 direct cables between FGT-A and FGT-B (heartbeat, priority 50 each), port8 as reserved management with 192.168.100.11 on FGT-A and 192.168.100.12 on FGT-B. The team documents the cable colours and labels both ends, because a swapped heartbeat cable is a classic cause of a cluster that never forms.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A single heartbeat link. Heartbeat through a busy VLAN shared with users. Forgetting to monitor the WAN and LAN ports, so the cluster never fails over on a link fault. Putting an IP address on a heartbeat port as if it were a normal interface; heartbeat ports are used for cluster traffic only.</p></div>
<div class="exam"><p><b>Exam trap.</b> Heartbeat loss and monitored-interface failure are different triggers. Heartbeat loss means the peer is unreachable. A monitored interface failure means the unit is alive but a data link is down. The exam may ask which one a failing uplink triggers.</p></div>

<div class="scn"><h4>A cluster that stayed primary with no internet</h4><p>The primary's WAN cable was pulled loose during cleaning. The unit was healthy, heartbeat was fine, and the secondary had a working WAN link, but no failover happened because port1 was not in the monitor list. After the incident the team added <code>monitor "port1" "port2"</code> and tested by unplugging each port in turn.</p><p><b>Lesson:</b> HA watches only what you tell it to watch.</p></div>

<div class="iv"><p class="q">"How many heartbeat interfaces should a cluster have and why?"</p><p>At least two, on separate cables. If there is only one, a single cable or port fault makes each unit think the other is dead, which can cause both to become primary. I would use direct cables where possible, keep heartbeat away from user VLANs, and consider enabling heartbeat encryption if it crosses a switch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Heartbeat ports carry keep-alives, config sync, session sync and active-active traffic.</li>
<li>Use two or more heartbeat interfaces, ideally direct cables.</li>
<li>Monitored interfaces trigger failover on data-link faults; heartbeat loss triggers it when the peer vanishes.</li>
<li>A reserved management interface gives each unit its own reachable IP.</li>
<li>On virtual machines use unicast heartbeat.</li>
</ul></div>
`,hi:`
<p>Cluster tabhi kaam karta hai jab units ek-doosre se tezi aur reliably baat kar sakein, aur har unit ko pata ho ki uske apne network connections healthy hain ya nahi. Yeh do features karte hain: <b>heartbeat interfaces</b> aur <b>monitored interfaces</b>. Inhe sahi karne se zyadatar real-world HA incidents rukte hain.</p>

<h3>Heartbeat kya karta hai</h3>
<p><b>Heartbeat interface</b> (<code>hbdev</code> se set hota hai) ek physical port hai jo sirf cluster traffic ke liye hota hai. Is par har unit doosre ko chhote keep-alive frames bhejta hai. Yahi links teen aur cheezein bhi le jaate hain: primary se secondary tak <b>configuration synchronisation</b>, agar enable karo to <b>session synchronisation</b>, aur active-active mode mein <b>load-balanced traffic</b>. Heartbeat packets Layer 2 frames hote hain jinke Fortinet-specific Ethernet types hote hain, normal IP traffic nahi, isliye routing ki zaroorat nahi. Inhe private cable ya isolated VLAN par rakhna chahiye, user traffic se door.</p>
<ul>
<li>Heartbeat ports ko priority ke saath list karte ho, jaise <code>set hbdev "port3" 50 "port4" 50</code>. Zyada priority sync traffic ke liye prefer hoti hai.</li>
<li><b>Kam se kam do</b> heartbeat interfaces use karo. Ek cable fault se dono units ko yeh nahi lagna chahiye ki doosra mar gaya.</li>
<li>Jahan ho sake unhe seedhe, unit se unit, bina beech mein switch ke connect karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Heartbeat aur monitored interfaces">
<rect x="60" y="50" width="150" height="110" rx="10" fill="#bbf7d0"/><text x="135" y="80" text-anchor="middle" class="svg-ink" font-size="13">FGT-A (primary)</text><text x="135" y="105" text-anchor="middle" class="svg-muted" font-size="12">port1 WAN monitored</text><text x="135" y="125" text-anchor="middle" class="svg-muted" font-size="12">port2 LAN monitored</text><text x="135" y="145" text-anchor="middle" class="svg-muted" font-size="12">port3 port4 heartbeat</text>
<rect x="430" y="50" width="150" height="110" rx="10" fill="#fde68a"/><text x="505" y="80" text-anchor="middle" class="svg-ink" font-size="13">FGT-B (secondary)</text><text x="505" y="105" text-anchor="middle" class="svg-muted" font-size="12">port1 WAN monitored</text><text x="505" y="125" text-anchor="middle" class="svg-muted" font-size="12">port2 LAN monitored</text><text x="505" y="145" text-anchor="middle" class="svg-muted" font-size="12">port3 port4 heartbeat</text>
<line x1="210" y1="95" x2="430" y2="95" stroke="#64748b" stroke-width="3"/><line x1="210" y1="125" x2="430" y2="125" stroke="#64748b" stroke-width="3"/>
<text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">port3 heartbeat</text><text x="320" y="142" text-anchor="middle" class="svg-accent" font-size="12">port4 heartbeat</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">Do direct cables: ek jaane se cluster split nahi hota</text>
</svg><p class="cap">Units ke beech do dedicated heartbeat cables.</p></div>

<h3>Heartbeat timers</h3>
<p>Do settings control karti hain ki gaya hua peer kitni jaldi detect hota hai. <code>hb-interval</code> batata hai ki heartbeats kitni der mein bheje jaate hain, 100 milliseconds ki units mein. <code>hb-lost-threshold</code> batata hai ki peer ko failed declare karne se pehle kitne heartbeats miss ho sakte hain. Dono milkar failure-detection time tay karte hain. Defaults zyadatar networks ke liye achha balance hain. Threshold bahut chhota karoge to failover tez hoga lekin brief CPU spike ya flapping cable par galat failover ka chance badh jaata hai. Sirf wajah ke saath badlo, aur test karo.</p>
<p>Heartbeat ko <b>authenticated aur encrypted</b> bhi kiya ja sakta hai (<code>authentication</code> aur <code>encryption</code> options). Yeh tab matter karta hai jab heartbeat shared switch se guzarta hai, kyunki warna koi rogue device cluster mein judne ya use disturb karne ki koshish kar sakta hai. Direct cable par yeh optional hai, lekin link rack se bahar jaaye to encryption sensible default hai. Virtual machines par, jahan in frames ke liye Layer 2 path nahi hota, aap <b>unicast heartbeat</b> (<code>unicast-hb</code> peer address ke saath) use karte ho.</p>

<h3>Monitored interfaces</h3>
<p><b>Monitored interface</b> (<code>set monitor "port1" "port2"</code>) woh data interface hai jiski link state cluster dekhta hai. Primary par monitored interface down ho jaaye to cluster use count karta hai aur us unit par failover kar sakta hai jiske zyada monitored interfaces working hain. Isi tarah dead uplink ya kharab switch port failover trigger karta hai, bhale unit khud healthy ho. Monitoring ke bina primary tab bhi primary rehta jab uska WAN cable nikla hota, aur network down hota jabki bagal mein bilkul theek standby padha hota.</p>
<p>Un links ke liye jo up hain lekin kaam ke nahi, <b>remote link monitoring</b> (<code>pingserver-monitor-interface</code> aur <code>pingserver-failover-threshold</code>) interface ke through remote address ko ping karta hai aur baar-baar ping fail hone ko interface fault maanta hai. Yeh ISP outage pakadta hai jisme local port jalta rehta hai.</p>

<h3>Management interface</h3>
<p>Cluster mein administrator normally kisi bhi data interface se primary se connect hota hai, lekin <b>secondary</b> tak pahunchne ka tareeka bhi chahiye. <b>Reserved management interface</b> (<code>ha-mgmt-status enable</code> aur <code>ha-mgmt-interfaces</code>) har unit ko apna management IP deta hai jo role se bina matlab reachable rehta hai. Yeh forwarding aur configuration sync dono se bahar hota hai. Primary se aap <code>execute ha manage</code> ke baad member index aur admin name dekar secondary par bhi ja sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> HQ plan: port1 ISP switch ko (monitored), port2 core ko (monitored), port3 aur port4 FGT-A aur FGT-B ke beech direct cables (heartbeat, har ek priority 50), port8 reserved management jisme FGT-A par 192.168.100.11 aur FGT-B par 192.168.100.12. Team cable ke colours document karti hai aur dono sire label karti hai, kyunki heartbeat cable ka adla-badli hona aise cluster ka classic karan hai jo kabhi banta hi nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf ek heartbeat link. Users ke saath shared busy VLAN par heartbeat. WAN aur LAN ports monitor karna bhool jaana, jisse link fault par cluster kabhi failover nahi karta. Heartbeat port par normal interface ki tarah IP address daalna; heartbeat ports sirf cluster traffic ke liye hote hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Heartbeat loss aur monitored-interface failure alag triggers hain. Heartbeat loss ka matlab peer unreachable hai. Monitored interface failure ka matlab unit zinda hai lekin ek data link down hai. Exam poochh sakta hai ki fail hota uplink kaunsa trigger karta hai.</p></div>

<div class="scn"><h4>Cluster jo bina internet ke primary bana raha</h4><p>Safai ke dauran primary ka WAN cable dheela ho gaya. Unit healthy tha, heartbeat theek tha, aur secondary ka WAN link kaam kar raha tha, lekin failover nahi hua kyunki port1 monitor list mein nahi tha. Incident ke baad team ne <code>monitor "port1" "port2"</code> add kiya aur har port ko baari-baari se nikaalkar test kiya.</p><p><b>Lesson:</b> HA sirf wahi dekhta hai jo aap use dekhne ko bolte ho.</p></div>

<div class="iv"><p class="q">"Cluster mein kitne heartbeat interfaces hone chahiye aur kyun?"</p><p>Kam se kam do, alag cables par. Sirf ek ho to ek cable ya port fault se har unit sochta hai ki doosra mar gaya, jisse dono primary ban sakte hain. Main jahan ho sake direct cables, heartbeat ko user VLANs se door, aur agar switch se guzare to heartbeat encryption on karne par vichar karoonga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Heartbeat ports keep-alives, config sync, session sync aur active-active traffic le jaate hain.</li>
<li>Do ya zyada heartbeat interfaces use karo, behtar hai direct cables.</li>
<li>Monitored interfaces data-link fault par failover karate hain; peer gayab hone par heartbeat loss karata hai.</li>
<li>Reserved management interface har unit ko apna reachable IP deta hai.</li>
<li>Virtual machines par unicast heartbeat use karo.</li>
</ul></div>
`}};export{e as default};