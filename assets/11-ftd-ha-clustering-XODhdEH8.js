var e={id:`ftd-cluster`,h:{en:`Threat Defense HA in the Management Center, and clustering concepts`,hi:`Management Center mein Threat Defense HA, aur clustering concepts`},body:{en:`
<p>A restaurant with two chefs works like a failover pair: one cooks, one stands ready. A food court with ten kitchens behind one counter works like a cluster: every kitchen cooks, and a runner carries an order to the kitchen that already started it. This chapter covers both at concept level: how Secure Firewall Threat Defense (FTD) builds the same active/standby pair you configured on the ASA, but from the Management Center (FMC), and how clustering spreads one firewall over many units. The next track modules go deeper into FTD itself.</p>

<h3>Threat Defense HA: same engine, different steering wheel</h3>
<p>FTD runs the same failover engine as the ASA underneath: failover link, state link, active and standby addresses, unit polls, interface monitoring, no preemption. What changes is <b>how you configure it</b>. You do not type <code>failover</code> commands on each device. Both devices are registered to the same FMC, and you create the pair there:</p>
<ol>
<li><b>Devices &gt; Device Management &gt; Add &gt; High Availability.</b> Give the pair a name and pick the <b>primary peer</b> and the <b>secondary peer</b>. The secondary's configuration will be replaced by the primary's.</li>
<li><b>High availability link</b>: choose the interface, a logical name, the primary IP, the secondary IP and the mask (the equivalent of FOLINK).</li>
<li><b>State link</b>: tick "same as LAN failover link" or choose a dedicated interface (the equivalent of STATELINK).</li>
<li><b>Encryption</b>: enable IPsec encryption of the failover link with an automatically generated or a preshared key.</li>
<li>After the pair forms, the pair's <b>High Availability</b> tab lets you set <b>standby IP addresses</b> and monitoring per interface, the <b>failover trigger criteria</b> (interface failure threshold, peer and interface poll and hold times) and <b>virtual MAC addresses</b>.</li>
</ol>
<p>From then on the FMC treats the pair as one device: you edit and <b>deploy</b> policies once and they apply to the active unit, which replicates to the standby. The FMC offers <b>Switch Active Peer</b> (the equivalent of <code>no failover active</code>), <b>Break</b> (split the pair) and, on recent versions, <b>Suspend / Resume</b> HA. On the FTD command line, <code>show failover</code> still works and reads exactly as in chapter 9.</p>
<p>Requirements mirror the ASA: same model, same number and type of interfaces, same software version, same firewall mode, both managed by the same FMC and in the same domain, matching licences, and no DHCP or PPPoE addressing on data interfaces. Besides unit and interface failures, FTD can fail over on <b>health</b> conditions such as the Snort inspection engine being down on the active unit or a full disk. FMC upgrades of an HA pair are automatic and sequential: standby first, switch, then the other unit. Active/active is <b>not</b> supported on FTD.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FMC manages an FTD HA pair">
<rect x="240" y="15" width="160" height="45" rx="8" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text>
<line x1="280" y1="60" x2="170" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="60" x2="470" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">one device in the GUI, one deploy</text>
<rect x="80" y="120" width="180" height="55" rx="8" fill="#bae6fd"/><text x="170" y="143" text-anchor="middle" class="svg-ink" font-size="13">FTD-1 primary</text><text x="170" y="162" text-anchor="middle" class="svg-accent" font-size="12">Active</text>
<rect x="380" y="120" width="180" height="55" rx="8" fill="#ddd6fe"/><text x="470" y="143" text-anchor="middle" class="svg-ink" font-size="13">FTD-2 secondary</text><text x="470" y="162" text-anchor="middle" class="svg-muted" font-size="12">Standby</text>
<line x1="260" y1="148" x2="380" y2="148" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">HA link + state link, IPsec protected</text>
</svg><p class="cap">Threat Defense HA: the FMC builds and manages the pair; the failover mechanics are the ASA's.</p></div>

<h3>Clustering: many units, one firewall</h3>
<p>Failover gives redundancy but never more throughput than one unit. A <b>cluster</b> joins several units (up to 16 on supported platforms such as the Firepower 4100/9300 and Secure Firewall 3100/4200) into one logical firewall with one configuration. Total throughput grows with each member, roughly 80 % of each added unit's capacity, and any member can fail without taking the service down.</p>
<dl class="terms">
<dt>Control node and data nodes</dt><dd>One member is elected <b>control node</b> (formerly "master") by priority (1 is highest); the others are <b>data nodes</b> (formerly "slaves"). You configure the cluster only on the control node and the configuration is replicated. The main cluster management IP always lives on the control node. The election is not preemptive: a new member with a better priority does not take over automatically.</dd>
<dt>Cluster control link (CCL)</dt><dd>A dedicated link (ideally an EtherChannel from each unit to a switch) that carries <b>control traffic</b> (heartbeats, configuration replication, state and flow ownership messages) and <b>data traffic</b> redirected between members. Size it for each member's throughput and set its MTU at least 100 bytes larger than the data interfaces, for example 1600 when the data MTU is 1500. If the CCL fails, the unit leaves the cluster.</dd>
</dl>

<h3>Two ways to connect a cluster to the network</h3>
<table class="cmp"><tr><th></th><th>Spanned EtherChannel</th><th>Individual interfaces</th></tr>
<tr><td>Layer</td><td>Layer 2: one EtherChannel spans all members (cluster LACP)</td><td>Layer 3: each member has its own IP on each data interface</td></tr>
<tr><td>Addresses</td><td>One IP and one MAC per logical interface for the whole cluster</td><td>An address pool; the control node also owns the main cluster IP</td></tr>
<tr><td>Load balancing</td><td>The switch hashes flows across the members</td><td>Neighbour routers use ECMP or policy-based routing</td></tr>
<tr><td>Firewall mode</td><td>Routed or transparent</td><td>Routed only</td></tr>
<tr><td>Typical use</td><td>Most hardware clusters, and the normal choice for Threat Defense</td><td>ASA designs with routers on each side, some virtual deployments</td></tr></table>

<h3>Flow roles: owner, director, forwarder</h3>
<p>The switch hashes each packet to some member, and the two directions of a connection can land on different members. The cluster keeps one member in charge of each connection:</p>
<ul>
<li><b>Owner</b>: the member that received the first packet; it holds the connection and inspects it. There is exactly one owner per connection.</li>
<li><b>Backup owner</b>: a member that stores a copy of the state so the connection survives if the owner fails.</li>
<li><b>Director</b>: the member chosen by a hash of the connection's addresses and ports; it knows who the owner is and answers lookups. Often the director is also the backup owner.</li>
<li><b>Forwarder</b>: any member that receives a packet of a connection it does not own. It asks the director (or, for TCP, reads the owner from the SYN cookie) and sends the packet to the owner over the CCL.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A 4-unit spanned cluster. A client's SYN is hashed to unit 2, which becomes the <b>owner</b>. The server's SYN-ACK is hashed to unit 4. Unit 4 is a <b>forwarder</b>: it decodes the owner from the SYN cookie and sends the packet over the CCL to unit 2. Unit 3 is the <b>director</b> for this flow and keeps a backup of its state. If unit 2 then fails, the next packet reaches, say, unit 1, which asks the director, learns the state and becomes the new owner. To keep CCL traffic low, the switch should use a symmetric hash (for example source and destination IP) so both directions usually land on the same member.</p></div>

<pre class="code"><span class="c">! ASA cluster bootstrap (concept): identical on every member except name and CCL IP</span>
cluster interface-mode spanned force
cluster group NK-CL
 local-unit unit-1
 cluster-interface Port-channel1 ip 10.255.0.1 255.255.255.0
 priority 1
 key NKcl2026
 enable</pre>

<div class="warn"><p><b>Common mistake.</b> Undersizing the CCL or leaving it at the default MTU. Forwarded packets carry an extra header, so large packets are dropped or fragmented, and asymmetric traffic saturates a thin CCL long before the data interfaces are busy.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the vocabulary: control node / data nodes; CCL; spanned EtherChannel (Layer 2, one IP per interface, routed or transparent) vs individual interfaces (Layer 3, IP pools, routed only); owner, director, forwarder. And FTD HA is created in the FMC, not with <code>failover</code> commands on the device.</p></div>

<div class="scn"><h4>The data centre that outgrew its pair</h4><p>A payment processor's FTD pair hit 90 % CPU at month-end peaks. A bigger pair would only postpone the problem, so the team moved to a four-unit Threat Defense cluster in spanned EtherChannel mode behind a vPC pair. During testing, throughput was lower than expected; <code>show cluster info</code> and the interface counters showed heavy CCL traffic. The switches were hashing on source and destination ports, splitting the two directions of many flows. Changing the port-channel hash to source and destination IP made most flows symmetric and throughput scaled as planned.</p><p><b>Lesson:</b> clustering scales only if most packets land on the owner; symmetric load balancing matters.</p></div>

<div class="iv"><p class="q">"How is Threat Defense HA configured, and when would you choose clustering instead?"</p><p>Strong answer: FTD HA is created in the Management Center (Devices, Add High Availability), choosing primary and secondary peers, the HA link and state link with their addresses and IPsec encryption; standby IPs, monitoring, trigger criteria and virtual MACs are set on the pair's HA tab; deploys go to the pair as one device, and it is active/standby only. Choose clustering when one unit's throughput is not enough: up to 16 members, a control node and data nodes, a CCL, spanned EtherChannel or individual interfaces, and owner/director/forwarder roles for each connection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FTD HA uses the ASA failover engine but is built and managed in the FMC.</li>
<li>FTD supports active/standby and clustering, not active/active; health issues like Snort down can trigger failover.</li>
<li>Clusters: up to 16 units, control node plus data nodes, configuration on the control node.</li>
<li>CCL carries control and redirected data; size it and raise its MTU by at least 100 bytes.</li>
<li>Spanned EtherChannel (L2) vs individual interfaces (L3); owner, backup owner, director, forwarder.</li>
</ul></div>
`,hi:`
<p>Do chefs wala restaurant failover pair ki tarah kaam karta hai: ek khaana banata hai, ek taiyaar khada hai. Ek counter ke peeche das kitchens wala food court cluster ki tarah kaam karta hai: har kitchen khaana banata hai, aur ek runner order ko us kitchen tak le jaata hai jisne use pehle hi shuru kiya. Yeh chapter dono ko concept level par cover karta hai: Secure Firewall Threat Defense (FTD) wahi active/standby pair kaise banata hai jo aapne ASA par configure kiya, lekin Management Center (FMC) se, aur clustering ek firewall ko kai units par kaise failati hai. Track ke agle modules FTD mein aur gehraai se jaate hain.</p>

<h3>Threat Defense HA: wahi engine, alag steering wheel</h3>
<p>FTD andar se ASA wala hi failover engine chalata hai: failover link, state link, active aur standby addresses, unit polls, interface monitoring, koi preemption nahi. Jo badalta hai woh hai <b>aap ise kaise configure karte ho</b>. Aap har device par <code>failover</code> commands type nahi karte. Dono devices same FMC par registered hote hain, aur aap pair wahin banate ho:</p>
<ol>
<li><b>Devices &gt; Device Management &gt; Add &gt; High Availability.</b> Pair ko naam do aur <b>primary peer</b> aur <b>secondary peer</b> chuno. Secondary ki configuration primary ki configuration se replace ho jaayegi.</li>
<li><b>High availability link</b>: interface, ek logical name, primary IP, secondary IP aur mask chuno (FOLINK ke barabar).</li>
<li><b>State link</b>: "same as LAN failover link" tick karo ya dedicated interface chuno (STATELINK ke barabar).</li>
<li><b>Encryption</b>: failover link ka IPsec encryption automatically generated ya preshared key ke saath enable karo.</li>
<li>Pair banne ke baad, pair ka <b>High Availability</b> tab aapko har interface ke liye <b>standby IP addresses</b> aur monitoring, <b>failover trigger criteria</b> (interface failure threshold, peer aur interface poll aur hold times) aur <b>virtual MAC addresses</b> set karne deta hai.</li>
</ol>
<p>Uske baad FMC pair ko ek device ki tarah treat karta hai: aap policies ek baar edit aur <b>deploy</b> karte ho aur woh active unit par lagti hain, jo standby ko replicate karta hai. FMC <b>Switch Active Peer</b> (<code>no failover active</code> ke barabar), <b>Break</b> (pair todna) aur, naye versions par, HA <b>Suspend / Resume</b> deta hai. FTD command line par <code>show failover</code> ab bhi chalta hai aur bilkul chapter 9 jaisa padha jaata hai.</p>
<p>Requirements ASA jaisi hain: same model, same number aur type ke interfaces, same software version, same firewall mode, dono same FMC se managed aur same domain mein, matching licences, aur data interfaces par DHCP ya PPPoE addressing nahi. Unit aur interface failures ke alawa FTD <b>health</b> conditions par bhi fail over kar sakta hai, jaise active unit par Snort inspection engine ka down hona ya disk full hona. HA pair ke FMC upgrades automatic aur sequential hote hain: pehle standby, switch, phir doosra unit. FTD par active/active <b>supported nahi</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FMC manages an FTD HA pair">
<rect x="240" y="15" width="160" height="45" rx="8" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text>
<line x1="280" y1="60" x2="170" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="60" x2="470" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">GUI mein ek device, ek deploy</text>
<rect x="80" y="120" width="180" height="55" rx="8" fill="#bae6fd"/><text x="170" y="143" text-anchor="middle" class="svg-ink" font-size="13">FTD-1 primary</text><text x="170" y="162" text-anchor="middle" class="svg-accent" font-size="12">Active</text>
<rect x="380" y="120" width="180" height="55" rx="8" fill="#ddd6fe"/><text x="470" y="143" text-anchor="middle" class="svg-ink" font-size="13">FTD-2 secondary</text><text x="470" y="162" text-anchor="middle" class="svg-muted" font-size="12">Standby</text>
<line x1="260" y1="148" x2="380" y2="148" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">HA link + state link, IPsec se protected</text>
</svg><p class="cap">Threat Defense HA: FMC pair banata aur manage karta hai; failover mechanics ASA wale hain.</p></div>

<h3>Clustering: kai units, ek firewall</h3>
<p>Failover redundancy deta hai lekin kabhi ek unit se zyada throughput nahi. <b>Cluster</b> kai units ko (Firepower 4100/9300 aur Secure Firewall 3100/4200 jaise supported platforms par 16 tak) ek configuration wale ek logical firewall mein jodta hai. Total throughput har member ke saath badhta hai, har naye unit ki capacity ka lagbhag 80 %, aur koi bhi member bina service giraaye fail ho sakta hai.</p>
<dl class="terms">
<dt>Control node aur data nodes</dt><dd>Ek member priority se <b>control node</b> (pehle "master") elect hota hai (1 sabse upar); baaki <b>data nodes</b> (pehle "slaves") hain. Aap cluster sirf control node par configure karte ho aur configuration replicate hoti hai. Main cluster management IP hamesha control node par rehta hai. Election preemptive nahi hai: behtar priority wala naya member apne aap take over nahi karta.</dd>
<dt>Cluster control link (CCL)</dt><dd>Ek dedicated link (ideally har unit se switch tak EtherChannel) jo <b>control traffic</b> (heartbeats, configuration replication, state aur flow ownership messages) aur members ke beech redirect hua <b>data traffic</b> le jaata hai. Ise har member ke throughput ke hisaab se size karo aur iska MTU data interfaces se kam se kam 100 bytes bada rakho, jaise data MTU 1500 ho to 1600. Agar CCL fail ho, unit cluster chhod deta hai.</dd>
</dl>

<h3>Cluster ko network se jodne ke do tareeke</h3>
<table class="cmp"><tr><th></th><th>Spanned EtherChannel</th><th>Individual interfaces</th></tr>
<tr><td>Layer</td><td>Layer 2: ek EtherChannel saare members par failta hai (cluster LACP)</td><td>Layer 3: har member ka har data interface par apna IP</td></tr>
<tr><td>Addresses</td><td>Poore cluster ke liye har logical interface par ek IP aur ek MAC</td><td>Ek address pool; control node main cluster IP bhi rakhta hai</td></tr>
<tr><td>Load balancing</td><td>Switch flows ko members mein hash karta hai</td><td>Neighbour routers ECMP ya policy-based routing use karte hain</td></tr>
<tr><td>Firewall mode</td><td>Routed ya transparent</td><td>Sirf routed</td></tr>
<tr><td>Typical use</td><td>Zyada tar hardware clusters, aur Threat Defense ke liye normal choice</td><td>Dono taraf routers wale ASA designs, kuch virtual deployments</td></tr></table>

<h3>Flow roles: owner, director, forwarder</h3>
<p>Switch har packet ko kisi member par hash karta hai, aur connection ki dono directions alag members par pahunch sakti hain. Cluster har connection ke liye ek member ko zimmedaar rakhta hai:</p>
<ul>
<li><b>Owner</b>: woh member jisne pehla packet receive kiya; woh connection rakhta hai aur inspect karta hai. Har connection ka bilkul ek owner hota hai.</li>
<li><b>Backup owner</b>: woh member jo state ki copy rakhta hai taaki owner fail ho to connection bache.</li>
<li><b>Director</b>: connection ke addresses aur ports ke hash se chuna gaya member; use pata hai owner kaun hai aur woh lookups ka jawab deta hai. Aksar director hi backup owner hota hai.</li>
<li><b>Forwarder</b>: koi bhi member jo aise connection ka packet receive kare jiska woh owner nahi. Woh director se poochta hai (ya, TCP ke liye, SYN cookie se owner padhta hai) aur packet CCL par owner ko bhejta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek 4-unit spanned cluster. Client ka SYN unit 2 par hash hota hai, jo <b>owner</b> banta hai. Server ka SYN-ACK unit 4 par hash hota hai. Unit 4 <b>forwarder</b> hai: woh SYN cookie se owner decode karta hai aur packet CCL par unit 2 ko bhejta hai. Unit 3 is flow ka <b>director</b> hai aur iski state ka backup rakhta hai. Agar phir unit 2 fail ho, to agla packet, maan lo, unit 1 par pahunchta hai, jo director se poochta hai, state seekhta hai aur naya owner banta hai. CCL traffic kam rakhne ke liye switch ko symmetric hash (jaise source aur destination IP) use karna chahiye taaki dono directions aam taur par same member par pahunchein.</p></div>

<pre class="code"><span class="c">! ASA cluster bootstrap (concept): har member par same, bas naam aur CCL IP alag</span>
cluster interface-mode spanned force
cluster group NK-CL
 local-unit unit-1
 cluster-interface Port-channel1 ip 10.255.0.1 255.255.255.0
 priority 1
 key NKcl2026
 enable</pre>

<div class="warn"><p><b>Common galti.</b> CCL ko undersize karna ya default MTU par chhodna. Forward hue packets ek extra header le jaate hain, isliye bade packets drop ya fragment hote hain, aur asymmetric traffic data interfaces busy hone se bahut pehle patle CCL ko bhar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Vocabulary jaano: control node / data nodes; CCL; spanned EtherChannel (Layer 2, har interface par ek IP, routed ya transparent) vs individual interfaces (Layer 3, IP pools, sirf routed); owner, director, forwarder. Aur FTD HA FMC mein banta hai, device par <code>failover</code> commands se nahi.</p></div>

<div class="scn"><h4>Woh data centre jo apne pair se bada ho gaya</h4><p>Ek payment processor ka FTD pair month-end peaks par 90 % CPU tak pahunchta tha. Bada pair problem ko sirf aage khiskaata, isliye team ek vPC pair ke peeche spanned EtherChannel mode mein chaar-unit Threat Defense cluster par gayi. Testing mein throughput umeed se kam tha; <code>show cluster info</code> aur interface counters ne bhaari CCL traffic dikhaya. Switches source aur destination ports par hash kar rahe the, jisse kai flows ki dono directions bant rahi thi. Port-channel hash ko source aur destination IP par badalne se zyada tar flows symmetric hue aur throughput plan ke hisaab se scale hua.</p><p><b>Seekh:</b> clustering tabhi scale karti hai jab zyada tar packets owner par pahunchein; symmetric load balancing zaroori hai.</p></div>

<div class="iv"><p class="q">"Threat Defense HA kaise configure hota hai, aur aap iski jagah clustering kab chunoge?"</p><p>Strong answer: FTD HA Management Center mein banta hai (Devices, Add High Availability), primary aur secondary peers, HA link aur state link unke addresses aur IPsec encryption ke saath chunkar; standby IPs, monitoring, trigger criteria aur virtual MACs pair ke HA tab par set hote hain; deploys pair par ek device ki tarah jaate hain, aur yeh sirf active/standby hai. Clustering tab chuno jab ek unit ka throughput kaafi na ho: 16 tak members, ek control node aur data nodes, ek CCL, spanned EtherChannel ya individual interfaces, aur har connection ke liye owner/director/forwarder roles.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FTD HA ASA ka failover engine use karta hai lekin FMC mein banta aur manage hota hai.</li>
<li>FTD active/standby aur clustering support karta hai, active/active nahi; Snort down jaisi health issues failover trigger kar sakti hain.</li>
<li>Clusters: 16 tak units, control node plus data nodes, configuration control node par.</li>
<li>CCL control aur redirect hua data le jaata hai; ise size karo aur MTU kam se kam 100 bytes badhao.</li>
<li>Spanned EtherChannel (L2) vs individual interfaces (L3); owner, backup owner, director, forwarder.</li>
</ul></div>
`}};export{e as default};