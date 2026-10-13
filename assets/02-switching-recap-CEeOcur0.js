var e={id:`switching-recap`,h:{en:`Switching recap: learn, flood, forward, filter`,hi:`Switching recap: learn, flood, forward, filter`},body:{en:`
<p>Picture a new receptionist in a hotel who does not yet know which guest is in which room. Every time a guest walks out of a room, the receptionist writes down "Mr Rao, room 12". When a letter arrives for Mr Rao, she walks straight to room 12. When a letter arrives for someone she has never seen, she has no choice: she slips a copy under every door. And when there is a fire announcement, it goes to every room on purpose. That is exactly how an Ethernet switch works, and you must be completely sure of it before VLANs make sense.</p>

<h3>The four things a switch does with every frame</h3>
<ol>
<li><b>Learn.</b> When a frame arrives, the switch reads the <b>source MAC address</b> and records it in the <b>MAC address table</b> (also called the CAM table) together with the arrival port and, as you will soon see, the VLAN. If the entry already exists, the timer is refreshed. Entries age out after <b>300 seconds</b> of silence by default.</li>
<li><b>Forward.</b> The switch looks up the <b>destination MAC</b>. If it is in the table, the frame goes out of that one port only. This is called a <b>known unicast</b>.</li>
<li><b>Flood.</b> If the destination is a <b>broadcast</b> (ffff.ffff.ffff), a multicast the switch has no specific information about, or an <b>unknown unicast</b> (a MAC not yet in the table), the switch sends a copy out of every port except the one it arrived on.</li>
<li><b>Filter.</b> If the destination MAC is known on the <b>same port</b> the frame came in on, the switch drops it. It never sends a frame back out of its arrival port.</li>
</ol>
<p>Notice that a switch learns only from <b>source</b> addresses. It never learns from destinations. That is why the first frame to a silent host is always flooded.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="PC1 sends an ARP broadcast; the switch floods it to all other ports">
<rect x="250" y="20" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">SW1 (flat)</text>
<rect x="20" y="170" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="190" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="80" y="206" text-anchor="middle" class="svg-muted" font-size="12">sends ARP</text>
<rect x="180" y="170" width="120" height="44" rx="8" fill="#fde68a"/><text x="240" y="196" text-anchor="middle" class="svg-ink" font-size="13">PC2 gets copy</text>
<rect x="340" y="170" width="120" height="44" rx="8" fill="#fde68a"/><text x="400" y="196" text-anchor="middle" class="svg-ink" font-size="13">PC3 gets copy</text>
<rect x="500" y="170" width="120" height="44" rx="8" fill="#fde68a"/><text x="560" y="196" text-anchor="middle" class="svg-ink" font-size="13">PC4 gets copy</text>
<line x1="80" y1="170" x2="280" y2="66" stroke="#64748b" stroke-width="3"/>
<line x1="300" y1="66" x2="240" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="340" y1="66" x2="400" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="360" y1="66" x2="560" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="130" y="110" class="svg-accent" font-size="12">dst ffff.ffff.ffff</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">One broadcast domain: every port receives every broadcast</text>
</svg><p class="cap">In a flat switch every broadcast is flooded to every other port. The dashed lines are copies.</p></div>

<h3>Worked through with real addresses</h3>
<div class="eg"><p><b>Worked example.</b> SW1 has just booted, so its MAC table is empty. PC1 (0050.7966.6801, Gi0/1, 192.168.50.11) pings PC2 (0050.7966.6802, Gi0/2, 192.168.50.12).</p>
<ol>
<li>PC1 does not know PC2's MAC, so it sends an <b>ARP request</b> to ffff.ffff.ffff. SW1 learns <code>0050.7966.6801 → Gi0/1</code> and floods the broadcast out of Gi0/2, Gi0/3 and Gi0/4.</li>
<li>Only PC2 owns 192.168.50.12, so only PC2 answers with a <b>unicast ARP reply</b> to 0050.7966.6801. SW1 learns <code>0050.7966.6802 → Gi0/2</code> and, because PC1's MAC is already known, forwards the reply out of Gi0/1 only.</li>
<li>The ICMP echo request and echo reply are now known unicasts. PC3 and PC4 never see them.</li>
</ol>
<p>PC3 and PC4 still received and processed the ARP broadcast in step 1, even though it had nothing to do with them. Multiply that by hundreds of hosts and you see the problem.</p></div>

<h3>What the MAC table looks like</h3>
<pre class="out">SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

<span class="hl">Vlan    Mac Address       Type        Ports</span>
----    -----------       --------    -----
   1    0050.7966.6801    DYNAMIC     Gi0/1
   1    0050.7966.6802    DYNAMIC     Gi0/2
Total Mac Addresses for this criterion: 2</pre>
<p>Look closely at the first column: <b>Vlan</b>. Even on a switch where you never configured a VLAN, every entry belongs to one, VLAN 1. The switch always forwards inside a VLAN. That column is the doorway into the rest of this module.</p>

<h3>Collision domains and broadcast domains</h3>
<p>Two terms often confuse beginners:</p>
<ul>
<li>A <b>collision domain</b> is a segment where two devices transmitting at once would collide. With a hub, all ports share one. With a switch, <b>every port is its own collision domain</b>, and with full duplex collisions cannot happen at all.</li>
<li>A <b>broadcast domain</b> is the set of devices reached by a broadcast. A plain switch does <b>not</b> split broadcast domains: all its ports are one. Only a <b>router</b> (or a Layer 3 interface) or a <b>VLAN</b> creates a boundary.</li>
</ul>
<table class="cmp"><tr><th>Device</th><th>Collision domains</th><th>Broadcast domains</th></tr>
<tr><td>Hub, 8 ports</td><td>1</td><td>1</td></tr>
<tr><td>Switch, 8 ports, no VLANs</td><td>8</td><td>1</td></tr>
<tr><td>Switch, 8 ports, 3 VLANs in use</td><td>8</td><td>3</td></tr>
<tr><td>Router, 2 interfaces</td><td>2</td><td>2</td></tr>
</table>

<h3>Why a flat network hurts</h3>
<ul>
<li><b>Broadcast load.</b> ARP, DHCP, service discovery and many applications broadcast. Every host must receive each one and hand it to its CPU to check.</li>
<li><b>Unknown unicast flooding.</b> When a MAC ages out or a table fills up, traffic meant for one host is copied to all of them, which is also a privacy problem.</li>
<li><b>No security boundary.</b> Every device can ARP for every other device. A guest laptop, a camera and the payroll server are neighbours.</li>
<li><b>Large failure domain.</b> A Layer 2 loop or a misbehaving NIC affects everyone in the broadcast domain at once. Spanning Tree (a later module) prevents loops, but VLANs limit how far any problem spreads.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Saying a switch "learns the destination". It learns only source MACs. If a printer never sends anything, the switch never learns its port, and every frame to it is flooded until it speaks.</p></div>

<div class="exam"><p><b>Exam trap.</b> Counting domains. A switch with 24 ports and no VLANs is 24 collision domains and 1 broadcast domain. Add VLANs 10 and 20 with ports in each and it becomes 2 broadcast domains, even though nothing physical changed.</p></div>

<div class="scn"><h4>The unknown unicast flood</h4><p>At a logistics company, users on a flat network complained that a backup job made "the whole floor slow" every night. The backup server sent data to a NAS that almost never transmitted anything itself, so the NAS MAC kept aging out of the switch tables after 300 seconds. Every time it aged out, gigabits of backup traffic were flooded as unknown unicast to all 180 ports on the floor. The engineer confirmed it with <code>show mac address-table address</code> on the NAS MAC (often missing) and interface counters showing heavy output on user ports. The short-term fix was to move the backup server and NAS into their own VLAN; later they also tuned ARP and MAC aging to match.</p><p><b>Lesson:</b> flooding is normal behaviour, but in a flat network its cost is paid by every device.</p></div>

<div class="iv"><p class="q">"Walk me through what a switch does when it receives a frame."</p><p>Strong answer: learn the source MAC against the ingress port and VLAN, refresh its timer; look up the destination MAC in the same VLAN; known unicast goes out one port, broadcast, unknown unicast and unregistered multicast are flooded to all other ports in that VLAN; a frame whose destination is on the ingress port is filtered. Mention the default 300-second aging time and that a switch never learns from the destination address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switches learn from source MACs, forward known unicasts, flood broadcasts and unknown unicasts, and filter frames destined to the arrival port.</li>
<li>MAC entries age out after 300 seconds by default; every entry is tied to a VLAN.</li>
<li>Each switch port is a collision domain; a switch without VLANs is one broadcast domain.</li>
<li>Flat networks waste bandwidth and CPU, leak traffic and make failures spread.</li>
<li>Only routers and VLANs create broadcast domain boundaries.</li>
</ul></div>
`,hi:`
<p>Ek hotel ki nayi receptionist socho jise abhi pata nahi ki kaunsa guest kis room mein hai. Jab bhi koi guest room se bahar nikalta hai, receptionist likh leti hai "Mr Rao, room 12". Jab Mr Rao ke liye letter aata hai, woh seedha room 12 jaati hai. Jab kisi aise insaan ka letter aata hai jise usne kabhi nahi dekha, uske paas koi option nahi: woh har darwaze ke neeche ek copy daal deti hai. Aur jab fire announcement hota hai, woh jaan boojh kar har room mein jaata hai. Ethernet switch bilkul aise hi kaam karta hai, aur VLANs samajhne se pehle aapko is par poora bharosa hona chahiye.</p>

<h3>Har frame ke saath switch ki chaar cheezein</h3>
<ol>
<li><b>Learn.</b> Jab frame aata hai, switch <b>source MAC address</b> padhta hai aur use <b>MAC address table</b> (CAM table bhi kehte hain) mein arrival port aur, jaisa aap jaldi dekhoge, VLAN ke saath record karta hai. Agar entry pehle se hai, to timer refresh hota hai. Default mein <b>300 seconds</b> chup rehne ke baad entries age out ho jaati hain.</li>
<li><b>Forward.</b> Switch <b>destination MAC</b> dhoondhta hai. Agar woh table mein hai, to frame sirf usi ek port se jaata hai. Ise <b>known unicast</b> kehte hain.</li>
<li><b>Flood.</b> Agar destination <b>broadcast</b> (ffff.ffff.ffff) hai, aisa multicast hai jiske baare mein switch ke paas specific jaankari nahi, ya <b>unknown unicast</b> (aisa MAC jo abhi table mein nahi), to switch arrival port ko chhod kar har port se ek copy bhejta hai.</li>
<li><b>Filter.</b> Agar destination MAC usi <b>same port</b> par known hai jahan se frame aaya, to switch use drop kar deta hai. Woh kabhi frame ko uske arrival port se wapas nahi bhejta.</li>
</ol>
<p>Dhyan do ki switch sirf <b>source</b> addresses se seekhta hai. Destination se kabhi nahi seekhta. Isiliye chup baithe host ko jaane wala pehla frame hamesha flood hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="PC1 ARP broadcast bhejta hai; switch use saare doosre ports par flood karta hai">
<rect x="250" y="20" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">SW1 (flat)</text>
<rect x="20" y="170" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="190" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="80" y="206" text-anchor="middle" class="svg-muted" font-size="12">ARP bhejta hai</text>
<rect x="180" y="170" width="120" height="44" rx="8" fill="#fde68a"/><text x="240" y="196" text-anchor="middle" class="svg-ink" font-size="13">PC2 ko copy</text>
<rect x="340" y="170" width="120" height="44" rx="8" fill="#fde68a"/><text x="400" y="196" text-anchor="middle" class="svg-ink" font-size="13">PC3 ko copy</text>
<rect x="500" y="170" width="120" height="44" rx="8" fill="#fde68a"/><text x="560" y="196" text-anchor="middle" class="svg-ink" font-size="13">PC4 ko copy</text>
<line x1="80" y1="170" x2="280" y2="66" stroke="#64748b" stroke-width="3"/>
<line x1="300" y1="66" x2="240" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="340" y1="66" x2="400" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="360" y1="66" x2="560" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="130" y="110" class="svg-accent" font-size="12">dst ffff.ffff.ffff</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Ek broadcast domain: har port ko har broadcast milta hai</text>
</svg><p class="cap">Flat switch mein har broadcast har doosre port par flood hota hai. Dashed lines copies hain.</p></div>

<h3>Real addresses ke saath poora flow</h3>
<div class="eg"><p><b>Worked example.</b> SW1 abhi boot hua hai, isliye uski MAC table khaali hai. PC1 (0050.7966.6801, Gi0/1, 192.168.50.11) PC2 (0050.7966.6802, Gi0/2, 192.168.50.12) ko ping karta hai.</p>
<ol>
<li>PC1 ko PC2 ka MAC nahi pata, isliye woh ffff.ffff.ffff ko <b>ARP request</b> bhejta hai. SW1 <code>0050.7966.6801 → Gi0/1</code> seekhta hai aur broadcast ko Gi0/2, Gi0/3 aur Gi0/4 se flood karta hai.</li>
<li>192.168.50.12 sirf PC2 ka hai, isliye sirf PC2 0050.7966.6801 ko <b>unicast ARP reply</b> deta hai. SW1 <code>0050.7966.6802 → Gi0/2</code> seekhta hai aur, kyunki PC1 ka MAC pehle se known hai, reply sirf Gi0/1 se forward karta hai.</li>
<li>ICMP echo request aur echo reply ab known unicasts hain. PC3 aur PC4 unhe kabhi nahi dekhte.</li>
</ol>
<p>PC3 aur PC4 ne phir bhi step 1 ka ARP broadcast receive aur process kiya, jabki unka usse koi lena dena nahi tha. Ise sainkdon hosts se guna karo aur problem samajh aa jaati hai.</p></div>

<h3>MAC table kaisi dikhti hai</h3>
<pre class="out">SW1# show mac address-table dynamic
          Mac Address Table
-------------------------------------------

<span class="hl">Vlan    Mac Address       Type        Ports</span>
----    -----------       --------    -----
   1    0050.7966.6801    DYNAMIC     Gi0/1
   1    0050.7966.6802    DYNAMIC     Gi0/2
Total Mac Addresses for this criterion: 2</pre>
<p>Pehle column ko dhyan se dekho: <b>Vlan</b>. Us switch par bhi jahan aapne kabhi VLAN configure nahi kiya, har entry kisi ek VLAN ki hai, VLAN 1. Switch hamesha ek VLAN ke andar forward karta hai. Yahi column is module ke baaki hisse ka darwaza hai.</p>

<h3>Collision domains aur broadcast domains</h3>
<p>Do terms beginners ko aksar confuse karte hain:</p>
<ul>
<li><b>Collision domain</b> woh segment hai jahan do devices ek saath transmit karein to collision ho. Hub mein saare ports ek share karte hain. Switch mein <b>har port apna alag collision domain hai</b>, aur full duplex mein collisions ho hi nahi sakte.</li>
<li><b>Broadcast domain</b> un devices ka set hai jahan tak broadcast pahunchta hai. Plain switch broadcast domains ko <b>nahi</b> baant ta: uske saare ports ek hi hain. Sirf <b>router</b> (ya Layer 3 interface) ya <b>VLAN</b> boundary banata hai.</li>
</ul>
<table class="cmp"><tr><th>Device</th><th>Collision domains</th><th>Broadcast domains</th></tr>
<tr><td>Hub, 8 ports</td><td>1</td><td>1</td></tr>
<tr><td>Switch, 8 ports, koi VLAN nahi</td><td>8</td><td>1</td></tr>
<tr><td>Switch, 8 ports, 3 VLANs use mein</td><td>8</td><td>3</td></tr>
<tr><td>Router, 2 interfaces</td><td>2</td><td>2</td></tr>
</table>

<h3>Flat network kyun nuksaan karta hai</h3>
<ul>
<li><b>Broadcast load.</b> ARP, DHCP, service discovery aur kai applications broadcast karti hain. Har host ko har ek receive karke check karne ke liye CPU ko dena padta hai.</li>
<li><b>Unknown unicast flooding.</b> Jab MAC age out ho jaata hai ya table bhar jaati hai, to ek host ke liye bana traffic sab ko copy hota hai, jo privacy problem bhi hai.</li>
<li><b>Koi security boundary nahi.</b> Har device har doosre device ke liye ARP kar sakta hai. Guest laptop, camera aur payroll server padosi hain.</li>
<li><b>Bada failure domain.</b> Layer 2 loop ya kharab NIC broadcast domain ke sab logon par ek saath asar karta hai. Spanning Tree (aage ka module) loops rokta hai, par VLANs limit karte hain ki koi bhi problem kitni door tak phaile.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Kehna ki switch "destination seekhta hai". Woh sirf source MACs seekhta hai. Agar printer kabhi kuch nahi bhejta, to switch kabhi uska port nahi seekhta, aur uske liye har frame tab tak flood hota hai jab tak woh bolta nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Domains ginna. 24 ports wala switch jisme koi VLAN nahi, 24 collision domains aur 1 broadcast domain hai. VLAN 10 aur 20 add karo, dono mein ports daalo, to woh 2 broadcast domains ban jaata hai, jabki physically kuch nahi badla.</p></div>

<div class="scn"><h4>Unknown unicast ka flood</h4><p>Ek logistics company mein flat network ke users complain karte the ki raat ka backup job "poore floor ko slow" kar deta hai. Backup server ek NAS ko data bhejta tha jo khud lagbhag kabhi kuch transmit nahi karta tha, isliye NAS ka MAC 300 seconds baad switch tables se age out hota rehta tha. Har baar age out hone par gigabits ka backup traffic unknown unicast ki tarah floor ke saare 180 ports par flood hota tha. Engineer ne NAS MAC par <code>show mac address-table address</code> (aksar missing) aur user ports par heavy output dikhane wale interface counters se confirm kiya. Short-term fix tha backup server aur NAS ko unke apne VLAN mein daalna; baad mein unhone ARP aur MAC aging ko bhi match karne ke liye tune kiya.</p><p><b>Seekh:</b> flooding normal behaviour hai, par flat network mein iski keemat har device chukata hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki frame receive karne par switch kya karta hai."</p><p>Strong answer: source MAC ko ingress port aur VLAN ke against learn karo, uska timer refresh karo; usi VLAN mein destination MAC dhoondho; known unicast ek port se jaata hai, broadcast, unknown unicast aur unregistered multicast us VLAN ke saare doosre ports par flood hote hain; jis frame ka destination ingress port par hi hai woh filter hota hai. Default 300-second aging time mention karo aur yeh bhi ki switch kabhi destination address se nahi seekhta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switches source MACs se seekhte hain, known unicasts forward karte hain, broadcasts aur unknown unicasts flood karte hain, aur arrival port ke liye bane frames filter karte hain.</li>
<li>MAC entries default mein 300 seconds baad age out hoti hain; har entry ek VLAN se judi hoti hai.</li>
<li>Har switch port ek collision domain hai; bina VLANs ka switch ek broadcast domain hai.</li>
<li>Flat networks bandwidth aur CPU waste karte hain, traffic leak karte hain aur failures ko phailne dete hain.</li>
<li>Sirf routers aur VLANs broadcast domain boundaries banate hain.</li>
</ul></div>
`}};export{e as default};