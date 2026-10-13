var e={id:`cam-switching`,h:{en:`The CAM table and switching logic at CCNP depth`,hi:`CCNP depth par CAM table aur switching logic`},body:{en:`
<p>A hotel receptionist keeps a register: guest name, room number. When a parcel arrives, she looks up the name and sends it to the right room. If the name is not in the register, she announces it on every floor. When a guest checks out and nobody updates the register for a while, the entry is removed. A switch does exactly this, and the register is the <b>CAM table</b> (Content Addressable Memory), also called the MAC address table.</p>

<h3>The four decisions, per VLAN</h3>
<p>For every frame that arrives on a port in VLAN V, the switch does four things:</p>
<ol>
<li><b>Learn</b>: store the source MAC with key <b>(VLAN V, source MAC)</b> and the ingress port. If the MAC already exists on another port in the same VLAN, the entry <b>moves</b>.</li>
<li><b>Look up</b> the key (VLAN V, destination MAC).</li>
<li><b>Forward</b> out the one port found, or <b>filter</b> (drop) the frame if that port is the one it came in on.</li>
<li><b>Flood</b> out every forwarding port in VLAN V (except the ingress port) if the destination is broadcast, multicast without snooping state, or an <b>unknown unicast</b>.</li>
</ol>
<p>The key includes the VLAN. The same MAC can legally appear in two VLANs on two different ports, for example a router subinterface that uses one MAC in every VLAN. Spanning tree decides which ports take part: a port in the <b>discarding</b> state neither forwards nor learns; a port in <b>learning</b> state learns but does not forward.</p>

<h3>CAM versus TCAM</h3>
<dl class="terms">
<dt>CAM</dt><dd>Exact-match memory. You give it the full key (VLAN + MAC) and it returns the port in one hardware lookup. Perfect for MAC tables because a MAC either matches or it does not.</dd>
<dt>TCAM</dt><dd>Ternary CAM. Each bit can be 0, 1 or "don't care", so it can match prefixes and masks. It holds ACLs, QoS classifiers and longest-prefix routes. The <b>SDM template</b> on a Catalyst decides how the hardware tables are split between MAC, routes and ACL entries.</dd>
</dl>

<h3>Aging, static entries and counts</h3>
<p>Dynamic entries age out after <b>300 seconds</b> of silence by default. You can change it globally or per VLAN with <code>mac address-table aging-time</code>. Static entries never age.</p>
<pre class="code"><span class="c">! Pin a server MAC to a port and lengthen aging for VLAN 30</span>
SW1(config)# mac address-table static 0050.7966.6830 vlan 30 interface GigabitEthernet0/5
SW1(config)# mac address-table aging-time 600 vlan 30
<span class="c">! Log every MAC move (flapping) between ports</span>
SW1(config)# mac address-table notification mac-move</pre>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="CAM learning along the MST1 tree">
<rect x="60" y="30" width="130" height="46" rx="8" fill="#bae6fd"/><text x="125" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW1 (root MST1)</text>
<rect x="450" y="30" width="130" height="46" rx="8" fill="#bae6fd"/><text x="515" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<rect x="255" y="160" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="14">SW3</text>
<line x1="190" y1="53" x2="450" y2="53" stroke="#64748b" stroke-width="3"/>
<line x1="150" y1="76" x2="280" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="490" y1="76" x2="360" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">SW3 Gi0/2 BLK in MST1</text>
<text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="12">PC10 on SW3</text>
<text x="600" y="100" text-anchor="middle" class="svg-accent" font-size="12">SRV10</text>
<text x="320" y="44" text-anchor="middle" class="svg-muted" font-size="12">SW2 learns PC10 on Gi0/1</text>
</svg><p class="cap">VLAN 10 follows the MST1 tree: PC10 to SRV10 goes SW3, SW1, SW2, not across the direct SW3-SW2 cable.</p></div>

<h3>Reading the table to prove a path</h3>
<p>The CAM table is the best evidence of the <b>actual</b> Layer 2 path. In Lab 1 after the MST change, VLAN 10 (instance 1, root SW1) and VLAN 30 (instance 2, root SW2) take different uplinks from SW3. Ping from PC10 and PC30, then look at SW1:</p>
<pre class="out">SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">  10    0050.7966.6810    DYNAMIC     Gi0/2</span>
  10    0050.7966.6864    DYNAMIC     Gi0/1
<span class="hl">  30    0050.7966.6830    DYNAMIC     Gi0/1</span>
  30    0050.7966.6886    DYNAMIC     Gi0/5
Total Mac Addresses for this criterion: 4</pre>
<p>PC10 (0050.7966.6810) is learned on Gi0/2, the direct link to SW3. PC30 (0050.7966.6830) is learned on Gi0/1, the link to <b>SW2</b>, although SW3 is directly connected to SW1. That is proof that VLAN 30 frames travel SW3, SW2, SW1: the instance 2 tree.</p>

<div class="eg"><p><b>Worked example: asymmetric routing and unicast flooding.</b> Two distribution switches D1 and D2 route between VLAN 10 and VLAN 20. Hosts in VLAN 20 use D1 as gateway; return traffic toward VLAN 20 is routed by D2. D2 has an ARP entry for host 10.20.20.50 (ARP timeout <b>4 hours</b>) but never receives a frame <b>from</b> that host, because the host sends only to D1. After <b>300 seconds</b> D2's CAM entry for the host's MAC ages out. From then on D2 knows the MAC (from ARP) but not the port, so every frame toward the host is an unknown unicast and is <b>flooded</b> to every port in VLAN 20. A 1 Gbps backup stream now hits every access port in the VLAN. Fixes: align the timers (set the CAM aging to at least the ARP timeout, or lower the ARP timeout on the SVI to below 300 seconds), or make the gateway and the return path the same switch.</p></div>

<h3>MAC flapping: the loop fingerprint</h3>
<p>If the same MAC keeps moving between two ports, either the host really is moving (a VM migrating, a wireless client roaming) or frames are looping. With notifications enabled you see:</p>
<pre class="out">%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.6810 in vlan 10 is flapping between port Gi0/1 and port Gi0/2</pre>
<p>Dozens of MACs flapping between the same two uplinks means a loop. Check spanning tree on both ports at once.</p>

<h3>How spanning tree touches the CAM</h3>
<p>When the topology changes, old CAM entries point to the wrong port. Classic 802.1D shortens aging to the forward delay (15 seconds) for a while; RSTP and MST <b>flush</b> the affected entries immediately. You will see the details in chapter 7. Frequent topology changes therefore mean frequent flooding, which is why PortFast on host ports matters so much.</p>

<div class="warn"><p><b>Common mistake.</b> Reading <code>show mac address-table</code> on only one switch and concluding the path. A MAC on an uplink tells you only the next hop. Follow the MAC switch by switch until you reach the access port with the host.</p></div>

<div class="exam"><p><b>Exam trap.</b> Frames are flooded for three reasons: broadcast, unknown unicast and (without IGMP snooping state) multicast. A known unicast is <b>never</b> flooded. Also remember that a discarding port does not learn MACs, so a blocked port never appears in the CAM for traffic that arrives on it.</p></div>

<div class="scn"><h4>The printer that slowed a floor</h4><p>Users on floor 4 reported sluggish PCs every night during backups. Interface counters showed high output on every access port in VLAN 20, although only one server was receiving the backup. The engineer found the server's MAC missing from the CAM of the distribution switch that carried the return traffic, while its ARP entry was hours old: the asymmetric routing pattern above. Lowering the SVI ARP timeout to 270 seconds on both distribution switches forced regular ARP refreshes, which relearned the MAC, and the flooding stopped.</p><p><b>Lesson:</b> unexpected output on many ports in one VLAN is the signature of unknown unicast flooding; compare the ARP and CAM entries for the destination.</p></div>

<div class="iv"><p class="q">"Why can unicast traffic be flooded in a switched network, and how do you find it?"</p><p>Strong answer: a unicast frame is flooded when its destination MAC is not in the CAM for that VLAN. Causes include CAM aging shorter than ARP timeout with asymmetric routing, CAM table overflow, and frequent topology changes that flush entries. Find it with interface output counters rising on many ports, <code>show mac address-table address</code> for the destination, and <code>show spanning-tree detail</code> for topology-change counts. Mention the 300-second versus 4-hour timer mismatch; interviewers love it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The CAM key is (VLAN, MAC); learn from the source, forward, filter or flood by the destination.</li>
<li>CAM is exact match; TCAM supports masks and holds ACLs, QoS and routes.</li>
<li>Dynamic entries age after 300 seconds; ARP lasts 4 hours, which can cause unicast flooding.</li>
<li>Follow a MAC switch by switch to prove the real path of a VLAN.</li>
<li>Many MACs flapping between two uplinks is the fingerprint of a Layer 2 loop.</li>
</ul></div>
`,hi:`
<p>Ek hotel receptionist ek register rakhti hai: guest ka naam, room number. Jab parcel aata hai, woh naam dhoondti hai aur use sahi room mein bhejti hai. Agar naam register mein nahi hai, to woh har floor par announce karti hai. Jab guest check out kar deta hai aur kuch der tak koi register update nahi karta, to entry hata di jaati hai. Switch bilkul yahi karta hai, aur register hai <b>CAM table</b> (Content Addressable Memory), jise MAC address table bhi kehte hain.</p>

<h3>Chaar decisions, har VLAN ke liye</h3>
<p>VLAN V ke kisi port par aane wale har frame ke liye switch chaar kaam karta hai:</p>
<ol>
<li><b>Learn</b>: source MAC ko key <b>(VLAN V, source MAC)</b> aur ingress port ke saath store karo. Agar MAC same VLAN mein kisi doosre port par pehle se hai, to entry <b>move</b> ho jaati hai.</li>
<li>Key (VLAN V, destination MAC) <b>look up</b> karo.</li>
<li>Mile hue ek port se <b>forward</b> karo, ya frame ko <b>filter</b> (drop) karo agar woh port wahi hai jahan se frame aaya.</li>
<li>Agar destination broadcast hai, snooping state ke bina multicast hai, ya <b>unknown unicast</b> hai, to VLAN V ke har forwarding port se (ingress port chhod kar) <b>flood</b> karo.</li>
</ol>
<p>Key mein VLAN shamil hai. Same MAC do VLANs mein do alag ports par legally dikh sakta hai, jaise router subinterface jo har VLAN mein ek hi MAC use karta hai. Spanning tree decide karta hai ki kaunse ports hissa lenge: <b>discarding</b> state ka port na forward karta hai na learn; <b>learning</b> state ka port learn karta hai lekin forward nahi.</p>

<h3>CAM aur TCAM</h3>
<dl class="terms">
<dt>CAM</dt><dd>Exact-match memory. Aap poori key (VLAN + MAC) dete ho aur yeh ek hardware lookup mein port lauta deti hai. MAC tables ke liye perfect, kyunki MAC ya to match hota hai ya nahi.</dd>
<dt>TCAM</dt><dd>Ternary CAM. Har bit 0, 1 ya "don't care" ho sakta hai, isliye yeh prefixes aur masks match kar sakti hai. Isme ACLs, QoS classifiers aur longest-prefix routes rehte hain. Catalyst par <b>SDM template</b> decide karta hai ki hardware tables MAC, routes aur ACL entries mein kaise bante hain.</dd>
</dl>

<h3>Aging, static entries aur counts</h3>
<p>Dynamic entries default mein <b>300 second</b> ki khamoshi ke baad age out ho jaati hain. Aap ise globally ya per VLAN <code>mac address-table aging-time</code> se badal sakte ho. Static entries kabhi age nahi hoti.</p>
<pre class="code"><span class="c">! Server MAC ko ek port par pin karo aur VLAN 30 ke liye aging lamba karo</span>
SW1(config)# mac address-table static 0050.7966.6830 vlan 30 interface GigabitEthernet0/5
SW1(config)# mac address-table aging-time 600 vlan 30
<span class="c">! Ports ke beech har MAC move (flapping) log karo</span>
SW1(config)# mac address-table notification mac-move</pre>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="CAM learning along the MST1 tree">
<rect x="60" y="30" width="130" height="46" rx="8" fill="#bae6fd"/><text x="125" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW1 (root MST1)</text>
<rect x="450" y="30" width="130" height="46" rx="8" fill="#bae6fd"/><text x="515" y="58" text-anchor="middle" class="svg-ink" font-size="14">SW2</text>
<rect x="255" y="160" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="14">SW3</text>
<line x1="190" y1="53" x2="450" y2="53" stroke="#64748b" stroke-width="3"/>
<line x1="150" y1="76" x2="280" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="490" y1="76" x2="360" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="480" y="130" text-anchor="middle" class="svg-muted" font-size="12">MST1 mein SW3 Gi0/2 BLK</text>
<text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="12">SW3 par PC10</text>
<text x="600" y="100" text-anchor="middle" class="svg-accent" font-size="12">SRV10</text>
<text x="320" y="44" text-anchor="middle" class="svg-muted" font-size="12">SW2 PC10 ko Gi0/1 par seekhta hai</text>
</svg><p class="cap">VLAN 10 MST1 tree follow karta hai: PC10 se SRV10 SW3, SW1, SW2 se jaata hai, seedhi SW3-SW2 cable se nahi.</p></div>

<h3>Path prove karne ke liye table padhna</h3>
<p>CAM table <b>actual</b> Layer 2 path ka sabse accha saboot hai. Lab 1 mein MST change ke baad VLAN 10 (instance 1, root SW1) aur VLAN 30 (instance 2, root SW2) SW3 se alag uplinks lete hain. PC10 aur PC30 se ping karo, phir SW1 dekho:</p>
<pre class="out">SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">  10    0050.7966.6810    DYNAMIC     Gi0/2</span>
  10    0050.7966.6864    DYNAMIC     Gi0/1
<span class="hl">  30    0050.7966.6830    DYNAMIC     Gi0/1</span>
  30    0050.7966.6886    DYNAMIC     Gi0/5
Total Mac Addresses for this criterion: 4</pre>
<p>PC10 (0050.7966.6810) Gi0/2 par seekha gaya, jo SW3 ka direct link hai. PC30 (0050.7966.6830) Gi0/1 par seekha gaya, jo <b>SW2</b> ka link hai, jabki SW3 seedha SW1 se juda hai. Yeh saboot hai ki VLAN 30 ke frames SW3, SW2, SW1 se jaate hain: instance 2 ka tree.</p>

<div class="eg"><p><b>Worked example: asymmetric routing aur unicast flooding.</b> Do distribution switches D1 aur D2 VLAN 10 aur VLAN 20 ke beech route karte hain. VLAN 20 ke hosts D1 ko gateway use karte hain; VLAN 20 ki taraf return traffic D2 route karta hai. D2 ke paas host 10.20.20.50 ki ARP entry hai (ARP timeout <b>4 ghante</b>) lekin use us host <b>se</b> kabhi frame nahi milta, kyunki host sirf D1 ko bhejta hai. <b>300 second</b> baad D2 ki CAM entry us host ke MAC ke liye age out ho jaati hai. Ab D2 MAC jaanta hai (ARP se) lekin port nahi, isliye host ki taraf har frame unknown unicast hai aur VLAN 20 ke har port par <b>flood</b> hota hai. Ek 1 Gbps backup stream ab VLAN ke har access port ko hit karta hai. Fixes: timers align karo (CAM aging ko kam se kam ARP timeout jitna karo, ya SVI par ARP timeout 300 second se kam karo), ya gateway aur return path ek hi switch banao.</p></div>

<h3>MAC flapping: loop ka fingerprint</h3>
<p>Agar same MAC do ports ke beech baar baar move karta hai, to ya to host sach mein move ho raha hai (VM migrate ho raha, wireless client roam kar raha) ya frames loop kar rahe hain. Notifications on hone par aap dekhte ho:</p>
<pre class="out">%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.6810 in vlan 10 is flapping between port Gi0/1 and port Gi0/2</pre>
<p>Darjanon MACs agar same do uplinks ke beech flap kar rahe hain, to matlab loop hai. Dono ports par ek saath spanning tree check karo.</p>

<h3>Spanning tree CAM ko kaise chhoota hai</h3>
<p>Jab topology badalti hai, purani CAM entries galat port ki taraf point karti hain. Classic 802.1D kuch der ke liye aging ko forward delay (15 second) tak chhota kar deta hai; RSTP aur MST affected entries ko turant <b>flush</b> karte hain. Details aap chapter 7 mein dekhoge. Isliye baar baar topology change ka matlab baar baar flooding hai, aur yahi wajah hai ki host ports par PortFast itna zaroori hai.</p>

<div class="warn"><p><b>Common galti.</b> Sirf ek switch par <code>show mac address-table</code> padh kar path conclude kar lena. Uplink par MAC aapko sirf next hop batata hai. MAC ko switch dar switch follow karo jab tak host wala access port na mil jaaye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Frames teen wajahon se flood hote hain: broadcast, unknown unicast aur (IGMP snooping state ke bina) multicast. Known unicast <b>kabhi</b> flood nahi hota. Yeh bhi yaad rakho ki discarding port MACs learn nahi karta, isliye blocked port par aane wale traffic ke liye woh CAM mein kabhi nahi dikhta.</p></div>

<div class="scn"><h4>Printer jisne poora floor slow kar diya</h4><p>Floor 4 ke users ne har raat backups ke dauraan PCs slow hone ki shikayat ki. Interface counters VLAN 20 ke har access port par high output dikha rahe the, jabki backup sirf ek server ko mil raha tha. Engineer ko return traffic le jaane wale distribution switch ki CAM mein server ka MAC gayab mila, jabki uski ARP entry ghanton purani thi: upar wala asymmetric routing pattern. Dono distribution switches par SVI ARP timeout 270 second karne se ARP regular refresh hone laga, jisse MAC dobara seekha gaya, aur flooding ruk gayi.</p><p><b>Seekh:</b> ek VLAN ke kai ports par anjaana output unknown unicast flooding ka signature hai; destination ki ARP aur CAM entries compare karo.</p></div>

<div class="iv"><p class="q">"Switched network mein unicast traffic flood kyun ho sakta hai, aur aap ise kaise dhoondoge?"</p><p>Strong answer: unicast frame tab flood hota hai jab uska destination MAC us VLAN ki CAM mein nahi hota. Wajahein: asymmetric routing ke saath CAM aging ka ARP timeout se chhota hona, CAM table overflow, aur baar baar topology changes jo entries flush karte hain. Ise dhoondo kai ports par badhte interface output counters se, destination ke liye <code>show mac address-table address</code> se, aur topology-change counts ke liye <code>show spanning-tree detail</code> se. 300-second vs 4-hour timer mismatch zaroor bolo; interviewers ko yeh bahut pasand hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CAM key (VLAN, MAC) hai; source se learn karo, destination se forward, filter ya flood karo.</li>
<li>CAM exact match hai; TCAM masks support karti hai aur ACLs, QoS aur routes rakhti hai.</li>
<li>Dynamic entries 300 second baad age hoti hain; ARP 4 ghante chalta hai, jisse unicast flooding ho sakti hai.</li>
<li>Kisi VLAN ka real path prove karne ke liye MAC ko switch dar switch follow karo.</li>
<li>Do uplinks ke beech kai MACs ka flap karna Layer 2 loop ka fingerprint hai.</li>
</ul></div>
`}};export{e as default};