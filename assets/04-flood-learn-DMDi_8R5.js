var e={id:`flood-learn`,h:{en:`Flood and learn with static ingress replication`,hi:`Static ingress replication ke saath flood and learn`},body:{en:`
<p>The earlier module <code>dc-vxlan</code> told the story of the new employee shouting in the corridors. Here we reuse that idea and look at it from the IOS XE side of the fabric. A VTEP that has no control plane behaves like a normal Ethernet switch with extra, far-away ports: it learns from what it hears and floods what it does not know.</p>

<h3>The two jobs of a VTEP without a control plane</h3>
<ul>
<li><b>Learning.</b> Local MACs are learned on the access port. Remote MACs are learned from VXLAN packets: inner source MAC is stored against the outer source IP (the sending VTEP).</li>
<li><b>Flooding (BUM).</b> Broadcast, Unknown unicast and Multicast frames must reach every VTEP that has the VNI.</li>
</ul>

<h3>How BUM reaches every VTEP</h3>
<table class="cmp"><tr><th>Method</th><th>How it works</th><th>Needs</th></tr>
<tr><td>Underlay multicast</td><td>Each VNI is bound to a multicast group; the network replicates.</td><td>PIM in the underlay</td></tr>
<tr><td>Ingress (head-end) replication</td><td>The source leaf sends one unicast VXLAN copy per remote VTEP.</td><td>Peer list (static or from BGP)</td></tr>
</table>
<p>We use <b>static ingress replication</b>: no multicast needed, the peer list for each VNI is typed in by the engineer. It is the simplest honest model, and it shows the pain that EVPN later removes.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ingress replication">
<rect x="20" y="70" width="110" height="46" rx="8" fill="#bae6fd"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="75" y="106" text-anchor="middle" class="svg-muted" font-size="12">ARP from H1</text>
<rect x="250" y="20" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="12">spines route</text>
<rect x="490" y="20" width="130" height="46" rx="8" fill="#bae6fd"/><text x="555" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="555" y="56" text-anchor="middle" class="svg-muted" font-size="12">copy 1 to .12</text>
<rect x="490" y="130" width="130" height="46" rx="8" fill="#bae6fd"/><text x="555" y="150" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="555" y="166" text-anchor="middle" class="svg-muted" font-size="12">copy 2 to .13</text>
<line x1="130" y1="85" x2="490" y2="45" stroke="#64748b" stroke-width="2"/><line x1="130" y1="100" x2="490" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="330" y="115" text-anchor="middle" class="svg-accent" font-size="12">1 broadcast in, 2 unicast copies out</text>
</svg><p class="cap">With N leaves, each BUM frame becomes N minus 1 copies on the source leaf's uplinks.</p></div>

<h3>Packet walk: H1 pings H2 for the first time</h3>
<ol>
<li>H1 (MAC 0050.56aa.0001) sends ARP "who has 10.10.10.12?" LEAF1 learns 0050.56aa.0001 on Gi1/0/5.</li>
<li>LEAF1 floods locally and sends unicast VXLAN copies (VNI 10010) to 10.255.1.12 and 10.255.1.13.</li>
<li>LEAF2 decapsulates, learns 0050.56aa.0001 behind <code>10.255.1.11</code>, and floods to H2.</li>
<li>H2 replies unicast. LEAF2 learns 0050.56aa.0002 on its local port and sends the reply as <b>one</b> VXLAN packet to 10.255.1.11.</li>
<li>LEAF1 learns 0050.56aa.0002 behind 10.255.1.12 and delivers the reply to H1.</li>
</ol>

<pre class="out">LEAF1# show mac address-table vlan 10
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.56aa.0001    DYNAMIC     Gi1/0/5
  10    0050.56aa.0002    DYNAMIC     <span class="hl">Nv1(10.255.1.12)</span>
Total Mac Addresses for this criterion: 2</pre>

<div class="eg"><p><b>Worked example: how many copies?</b> Suppose each of our 3 leaves has VNI 10010. One ARP broadcast from H1 makes 2 VXLAN copies. In a 40-leaf fabric the same ARP becomes 39 copies, and every one is dropped into the underlay. If each host ARPs once a minute, the head-end replication cost grows with the number of leaves, not with the number of hosts alone.</p></div>

<h3>Two things that surprise beginners</h3>
<ul>
<li><b>Split horizon.</b> A frame received from the overlay is never sent back into the overlay. This prevents loops without STP.</li>
<li><b>Silent hosts.</b> A remote MAC appears only after that host has sent something. An empty remote MAC list right after configuring is normal. Generate traffic.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Static peer lists must be symmetric. If LEAF1 lists LEAF2 but LEAF2 does not list LEAF1, ARP requests from H1 reach H2 and the reply is flooded back toward a leaf that is unknown to LEAF2, so H1 cannot learn H2: the ping fails in one direction only.</p></div>

<div class="exam"><p><b>Exam trap.</b> In flood-and-learn the peer type in <code>show nve peers</code> is data-plane learned; with EVPN it is control-plane. Remember the word: DP versus CP.</p></div>

<div class="scn"><h4>The ping that only worked one way</h4><p>A new leaf (LEAF3) was added to VNI 10010. H4 could ping H1, but H1 could not ping H4. The engineer had added LEAF1 to LEAF3's peer list but forgot to add LEAF3 to LEAF1's. H4's ARP reached H1 because LEAF3 knew LEAF1. H1's ARP never reached LEAF3, since LEAF1 had no entry for it.</p><p><b>Lesson:</b> every static peer list change is a change on N devices. EVPN removes this chore.</p></div>

<div class="iv"><p class="q">"What are the limits of flood-and-learn VXLAN?"</p><p>Strong answer: no control plane, so MACs are learned from traffic and aged; BUM and unknown unicast are flooded to every VTEP, which grows with fabric size; static peer lists mean touching every leaf for each change; and there is no ARP suppression or integrated routing. BGP EVPN fixes these.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote MAC = inner source MAC against outer source IP (data plane).</li>
<li>BUM goes to every VTEP by multicast or ingress replication.</li>
<li>Static ingress replication lists must be symmetric.</li>
<li>Frames from the overlay never go back into the overlay.</li>
<li>These limits motivate EVPN.</li>
</ul></div>
`,hi:`
<p>Pichhle module <code>dc-vxlan</code> mein naye employee ki kahani thi jo corridors mein chillata tha. Yahan hum wahi idea reuse karte hain aur fabric ko IOS XE side se dekhte hain. Jis VTEP ke paas control plane nahi hota woh ek normal Ethernet switch jaisa hota hai jiske kuch extra, door ke ports hain: jo sunta hai usse seekhta hai aur jo nahi jaanta use flood karta hai.</p>

<h3>Control plane ke bina VTEP ke do kaam</h3>
<ul>
<li><b>Learning.</b> Local MACs access port par learn hote hain. Remote MACs VXLAN packets se learn hote hain: inner source MAC ko outer source IP (bhejne wala VTEP) ke against store kiya jaata hai.</li>
<li><b>Flooding (BUM).</b> Broadcast, Unknown unicast aur Multicast frames ko har us VTEP tak pahunchna chahiye jiske paas woh VNI hai.</li>
</ul>

<h3>BUM har VTEP tak kaise pahunchta hai</h3>
<table class="cmp"><tr><th>Method</th><th>Kaise kaam karta hai</th><th>Kya chahiye</th></tr>
<tr><td>Underlay multicast</td><td>Har VNI ek multicast group se bound; network replicate karta hai.</td><td>Underlay mein PIM</td></tr>
<tr><td>Ingress (head-end) replication</td><td>Source leaf har remote VTEP ko ek unicast VXLAN copy bhejta hai.</td><td>Peer list (static ya BGP se)</td></tr>
</table>
<p>Hum <b>static ingress replication</b> use karte hain: multicast ki zaroorat nahi, har VNI ki peer list engineer khud type karta hai. Yeh sabse simple aur imaandaar model hai, aur yeh woh dard dikhata hai jo EVPN baad mein door karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ingress replication">
<rect x="20" y="70" width="110" height="46" rx="8" fill="#bae6fd"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text><text x="75" y="106" text-anchor="middle" class="svg-muted" font-size="12">H1 ka ARP</text>
<rect x="250" y="20" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="12">spines route</text>
<rect x="490" y="20" width="130" height="46" rx="8" fill="#bae6fd"/><text x="555" y="40" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text><text x="555" y="56" text-anchor="middle" class="svg-muted" font-size="12">copy 1 to .12</text>
<rect x="490" y="130" width="130" height="46" rx="8" fill="#bae6fd"/><text x="555" y="150" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text><text x="555" y="166" text-anchor="middle" class="svg-muted" font-size="12">copy 2 to .13</text>
<line x1="130" y1="85" x2="490" y2="45" stroke="#64748b" stroke-width="2"/><line x1="130" y1="100" x2="490" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="330" y="115" text-anchor="middle" class="svg-accent" font-size="12">1 broadcast andar, 2 unicast copies bahar</text>
</svg><p class="cap">N leaves ke saath har BUM frame source leaf ke uplinks par N minus 1 copies ban jaata hai.</p></div>

<h3>Packet walk: H1 pehli baar H2 ko ping karta hai</h3>
<ol>
<li>H1 (MAC 0050.56aa.0001) ARP "who has 10.10.10.12?" bhejta hai. LEAF1 0050.56aa.0001 ko Gi1/0/5 par learn karta hai.</li>
<li>LEAF1 locally flood karta hai aur 10.255.1.12 aur 10.255.1.13 ko unicast VXLAN copies (VNI 10010) bhejta hai.</li>
<li>LEAF2 decapsulate karta hai, 0050.56aa.0001 ko <code>10.255.1.11</code> ke peeche learn karta hai, aur H2 tak flood karta hai.</li>
<li>H2 unicast reply karta hai. LEAF2 0050.56aa.0002 ko apne local port par learn karta hai aur reply ko <b>ek</b> VXLAN packet mein 10.255.1.11 ko bhejta hai.</li>
<li>LEAF1 0050.56aa.0002 ko 10.255.1.12 ke peeche learn karta hai aur reply H1 ko deta hai.</li>
</ol>

<pre class="out">LEAF1# show mac address-table vlan 10
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
  10    0050.56aa.0001    DYNAMIC     Gi1/0/5
  10    0050.56aa.0002    DYNAMIC     <span class="hl">Nv1(10.255.1.12)</span>
Total Mac Addresses for this criterion: 2</pre>

<div class="eg"><p><b>Worked example: kitni copies?</b> Maano hamare 3 leaves mein VNI 10010 hai. H1 ka ek ARP broadcast 2 VXLAN copies banata hai. 40-leaf fabric mein wahi ARP 39 copies ban jaata hai, aur har copy underlay mein daali jaati hai. Agar har host minute mein ek baar ARP kare to head-end replication ka cost sirf hosts nahi, leaves ki sankhya ke saath bhi badhta hai.</p></div>

<h3>Do cheezein jo beginners ko hairaan karti hain</h3>
<ul>
<li><b>Split horizon.</b> Overlay se aaya frame kabhi wapas overlay mein nahi bheja jaata. Isse STP ke bina loops rukte hain.</li>
<li><b>Silent hosts.</b> Remote MAC tabhi dikhta hai jab us host ne kuch bheja ho. Configure karte hi remote MAC list khaali hona normal hai. Traffic generate karo.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Static peer lists symmetric honi chahiye. Agar LEAF1 LEAF2 ko list karta hai lekin LEAF2 LEAF1 ko nahi, to H1 ka ARP H2 tak pahunchta hai aur reply ek aise leaf ki taraf flood hota hai jo LEAF2 ke liye unknown hai, isliye H1 H2 ko learn nahi kar paata: ping sirf ek direction mein fail hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Flood-and-learn mein <code>show nve peers</code> ka peer type data-plane learned hota hai; EVPN ke saath control-plane. Shabd yaad rakho: DP versus CP.</p></div>

<div class="scn"><h4>Ping jo sirf ek taraf chali</h4><p>VNI 10010 mein naya leaf (LEAF3) joda gaya. H4 H1 ko ping kar sakta tha, lekin H1 H4 ko nahi. Engineer ne LEAF1 ko LEAF3 ki peer list mein daala tha lekin LEAF3 ko LEAF1 ki list mein daalna bhool gaya. H4 ka ARP H1 tak pahuncha kyunki LEAF3 LEAF1 ko jaanta tha. H1 ka ARP LEAF3 tak kabhi nahi pahuncha, kyunki LEAF1 ke paas uski entry nahi thi.</p><p><b>Seekh:</b> har static peer list change N devices par change hota hai. EVPN yeh chore khatam karta hai.</p></div>

<div class="iv"><p class="q">"Flood-and-learn VXLAN ki limits kya hain?"</p><p>Strong answer: control plane nahi hai, isliye MACs traffic se seekhe aur age out hote hain; BUM aur unknown unicast har VTEP ko flood hota hai jo fabric size ke saath badhta hai; static peer lists ka matlab har change par har leaf touch karna; aur ARP suppression ya integrated routing nahi. BGP EVPN yeh sab theek karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote MAC = inner source MAC, outer source IP ke against (data plane).</li>
<li>BUM multicast ya ingress replication se har VTEP tak jaata hai.</li>
<li>Static ingress replication lists symmetric honi chahiye.</li>
<li>Overlay se aaye frames wapas overlay mein nahi jaate.</li>
<li>Yahi limits EVPN ki zaroorat banati hain.</li>
</ul></div>
`}};export{e as default};