var e={id:`vlsm`,h:{en:`VLSM: largest first, no overlaps`,hi:`VLSM: sabse bada pehle, koi overlap nahi`},body:{en:`
<p>Think of a car park that must hold two buses, a few cars and some motorbikes. If you park the motorbikes first wherever they fit, you end up with gaps too small for a bus. If you park the buses first along the marked bus bays, then the cars in the next bays, then the bikes in the leftover corners, everything fits neatly. <b>VLSM</b> (Variable Length Subnet Masking) is that car park: different subnet sizes inside one address block, and the rule that makes it work is <b>largest first</b>.</p>

<h3>Why VLSM</h3>
<p>Equal subnetting gives every segment the size of the biggest one. With 100, 50, 20 and 2 hosts in a /24, four equal /26s cannot even hold the 100-host LAN. VLSM gives each segment the prefix it needs: /25, /26, /27 and /30. Modern routing protocols (OSPF, EIGRP, RIPv2) carry the mask with every route, so VLSM just works. Only classful protocols like RIPv1 could not handle it.</p>

<h3>The method that never overlaps</h3>
<ol>
<li>List every segment with its host count (include the gateway and growth).</li>
<li>Sort from <b>largest to smallest</b>.</li>
<li>Choose each prefix with 2<sup>h</sup> − 2 ≥ hosts.</li>
<li>Give the largest subnet the start of the block. Each next subnet starts at the previous broadcast + 1.</li>
<li>Write network, first usable, last usable and broadcast for each, and mark what is still free.</li>
</ol>
<p>Why largest first works: every subnet must start on a multiple of its own block size. Because sizes only shrink as you go, the next free address is always a multiple of the next, smaller block. You never have to skip or check boundaries.</p>

<h3>Lab 1, fully worked</h3>
<p>The branch received 192.168.50.0/24. LAN-A (R1 Gi0/1) needs 100 hosts, LAN-B (R2 Gi0/1) 50, LAN-C (R2 Gi0/2) 20, and the R1-R2 WAN link 2.</p>
<table class="cmp"><tr><th>Segment</th><th>Need</th><th>Prefix</th><th>Network</th><th>Router (first)</th><th>PC (last)</th><th>Broadcast</th></tr>
<tr><td>LAN-A</td><td>100</td><td>/25</td><td>192.168.50.0</td><td>.1</td><td>.126</td><td>.127</td></tr>
<tr><td>LAN-B</td><td>50</td><td>/26</td><td>192.168.50.128</td><td>.129</td><td>.190</td><td>.191</td></tr>
<tr><td>LAN-C</td><td>20</td><td>/27</td><td>192.168.50.192</td><td>.193</td><td>.222</td><td>.223</td></tr>
<tr><td>WAN</td><td>2</td><td>/30</td><td>192.168.50.224</td><td>R1 .225</td><td>R2 .226</td><td>.227</td></tr></table>
<p>Free for the future: 192.168.50.228 to 192.168.50.255.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="VLSM layout of 192.168.50.0/24">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">192.168.50.0/24, largest first</text>
<rect x="20" y="40" width="300" height="48" fill="#bae6fd"/><text x="170" y="62" text-anchor="middle" class="svg-ink" font-size="13">LAN-A /25</text><text x="170" y="79" text-anchor="middle" class="svg-muted" font-size="12">.0 to .127</text>
<rect x="320" y="40" width="150" height="48" fill="#bbf7d0"/><text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="13">LAN-B /26</text><text x="395" y="79" text-anchor="middle" class="svg-muted" font-size="12">.128 to .191</text>
<rect x="470" y="40" width="75" height="48" fill="#fde68a"/><text x="507" y="62" text-anchor="middle" class="svg-ink" font-size="12">LAN-C</text><text x="507" y="79" text-anchor="middle" class="svg-muted" font-size="12">/27</text>
<rect x="545" y="40" width="10" height="48" fill="#ddd6fe"/>
<rect x="555" y="40" width="65" height="48" fill="#e2e8f0"/><text x="587" y="68" text-anchor="middle" class="svg-muted" font-size="12">free</text>
<line x1="550" y1="92" x2="550" y2="118" stroke="#64748b" stroke-width="1.5"/><text x="550" y="134" text-anchor="middle" class="svg-accent" font-size="12">WAN /30 .224</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">every block starts on a multiple of its own size</text>
</svg><p class="cap">The Lab 1 plan drawn to scale. Each subnet begins right where the previous one ended.</p></div>

<p>The configuration that the lab checks:</p>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/1
 ip address 192.168.50.1 255.255.255.128
interface GigabitEthernet0/0
 ip address 192.168.50.225 255.255.255.252
<span class="c">! R2</span>
interface GigabitEthernet0/0
 ip address 192.168.50.226 255.255.255.252
interface GigabitEthernet0/1
 ip address 192.168.50.129 255.255.255.192
interface GigabitEthernet0/2
 ip address 192.168.50.193 255.255.255.224
<span class="c">! PCs: ip address/prefix gateway</span>
PCA&gt; ip 192.168.50.126/25 192.168.50.1
PCB&gt; ip 192.168.50.190/26 192.168.50.129
PCC&gt; ip 192.168.50.222/27 192.168.50.193</pre>
<p>OSPF is already running with <code>network 192.168.50.0 0.0.0.255 area 0</code>, so once the addresses are right, R1 learns R2's LANs with their own masks:</p>
<pre class="out">R1# show ip route ospf
      192.168.50.0/24 is variably subnetted, 6 subnets, 5 masks
<span class="hl">O        192.168.50.128/26 [110/2] via 192.168.50.226, 00:00:12, GigabitEthernet0/0</span>
O        192.168.50.192/27 [110/2] via 192.168.50.226, 00:00:12, GigabitEthernet0/0</pre>

<div class="eg"><p><b>Worked example 2: 172.16.8.0/22.</b> Needs: Sales 300, Engineering 120, Guest 60, Management 10, two WAN links. Sorted: 300 → /23 (510): <b>172.16.8.0/23</b> (8.0 to 9.255). 120 → /25: <b>172.16.10.0/25</b> (.0 to .127). 60 → /26: <b>172.16.10.128/26</b> (.128 to .191). 10 → /28: <b>172.16.10.192/28</b> (.192 to .207). WAN 1 → <b>172.16.10.208/30</b>, WAN 2 → <b>172.16.10.212/30</b>. Free: 172.16.10.216 to 172.16.11.255.</p></div>

<h3>What goes wrong with smallest first</h3>
<p>Suppose you give the WAN 192.168.50.0/30 first and then want LAN-C (/27) "right after" at .4. But .4 is not a multiple of 32; 192.168.50.4/27 really belongs to network .0, which overlaps the WAN. To be correct you must skip to .32, leaving a gap of 28 addresses. Smallest first either overlaps or fragments the space.</p>

<h3>Spotting overlaps</h3>
<p>Two subnets overlap if the network of one falls inside the range of the other. 192.168.50.160/27 and 192.168.50.128/26 overlap, because .160 is inside .128 to .191. On a single router IOS refuses overlapping interface subnets:</p>
<pre class="out">R2(config)# interface GigabitEthernet0/2
R2(config-if)# ip address 192.168.50.161 255.255.255.224
<span class="hl">% 192.168.50.160 overlaps with GigabitEthernet0/1</span></pre>
<p>Across different routers there is no such check, which is why overlaps between sites are so common.</p>

<h3>Practice drill (answer below)</h3>
<p>Carve 10.5.0.0/24 for segments of 60, 28, 12, 2 and 2 hosts.</p>
<div class="tip"><p><b>Answer.</b> 60 → 10.5.0.0/26 (.0 to .63). 28 → 10.5.0.64/27 (.64 to .95). 12 → 10.5.0.96/28 (.96 to .111). 2 → 10.5.0.112/30. 2 → 10.5.0.116/30. Free: 10.5.0.120 to 10.5.0.255.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sorting by segment name instead of size. Forgetting the gateway: 30 PCs plus a router is 31 hosts, still a /27, but 62 PCs plus a router needs a /25. Starting a subnet on an address that is not a multiple of its block size.</p></div>

<div class="exam"><p><b>Exam trap.</b> VLSM questions often show an existing plan and ask which subnet can be added "without overlapping and with minimum waste". List the free ranges, pick the smallest prefix that fits the hosts, and confirm its start is a multiple of its block size inside a free range.</p></div>

<div class="scn"><h4>The new VLAN that broke the printers</h4><p>An engineer needed a subnet for 25 new IoT devices at a site using 192.168.50.0/24 with the Lab 1 plan. Looking at a spreadsheet that listed only LAN-A and LAN-C, he picked 192.168.50.160/27 and configured it on a new switch SVI at a different router. Printers on LAN-B (192.168.50.128/26, .128 to .191) became unreachable from other sites because OSPF now carried a more specific /27 pointing to the wrong router. The fix was checking the real free space: only .228 to .255 was left, and no aligned /27 fits there (the only candidate, .224/27, contains the WAN link). The team gave the IoT VLAN 192.168.51.0/27 from a new block instead.</p><p><b>Lesson:</b> the address plan must be complete and authoritative. Check the whole block for overlaps before assigning, not just the rows you can see.</p></div>

<div class="iv"><p class="q">"What is VLSM, and why do we allocate the largest subnets first?"</p><p>Strong answer: VLSM uses different prefix lengths inside one address block so each segment gets only what it needs, which requires classless routing protocols that carry masks. Allocating largest first keeps every subnet aligned on a multiple of its block size, so each new subnet starts at the previous broadcast plus one with no gaps and no overlaps. Walk through a quick example like 100, 50, 20, 2 hosts in a /24.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLSM = different prefix lengths in one block; needs routing protocols that carry the mask.</li>
<li>Sort largest first; each subnet starts at the previous broadcast + 1.</li>
<li>A subnet must start on a multiple of its own block size.</li>
<li>Overlap = one subnet's network lies inside another's range; IOS catches it only on the same router.</li>
<li>Keep a complete address plan and record the free ranges.</li>
</ul></div>
`,hi:`
<p>Ek car park socho jismein do buses, kuch cars aur kuch motorbikes aani hain. Agar aap pehle motorbikes ko jahan jagah mile wahan park kar do, to aakhir mein aise gaps bachte hain jo bus ke liye bahut chhote hain. Agar aap pehle buses ko marked bus bays mein, phir cars ko agli bays mein, phir bikes ko bache hue kono mein park karo, to sab saaf fit ho jaata hai. <b>VLSM</b> (Variable Length Subnet Masking) wahi car park hai: ek address block ke andar alag alag subnet sizes, aur jo rule ise chalata hai woh hai <b>sabse bada pehle</b>.</p>

<h3>VLSM kyun</h3>
<p>Barabar subnetting har segment ko sabse bade segment jitna size deti hai. /24 mein 100, 50, 20 aur 2 hosts ke saath, chaar barabar /26s 100-host LAN ko bhi nahi rakh sakte. VLSM har segment ko utna prefix deta hai jitna chahiye: /25, /26, /27 aur /30. Modern routing protocols (OSPF, EIGRP, RIPv2) har route ke saath mask le jaate hain, isliye VLSM bas chal jaata hai. Sirf RIPv1 jaise classful protocols ise handle nahi kar paate the.</p>

<h3>Woh method jo kabhi overlap nahi karta</h3>
<ol>
<li>Har segment ko uske host count ke saath list karo (gateway aur growth shamil karo).</li>
<li><b>Sabse bade se sabse chhote</b> order mein lagao.</li>
<li>Har prefix aisa chuno jahan 2<sup>h</sup> − 2 ≥ hosts.</li>
<li>Sabse bade subnet ko block ki shuruaat do. Har agla subnet pichhle broadcast + 1 se shuru hota hai.</li>
<li>Har ek ke liye network, first usable, last usable aur broadcast likho, aur jo abhi free hai use mark karo.</li>
</ol>
<p>Sabse bada pehle kyun kaam karta hai: har subnet ko apne block size ke multiple par shuru hona chahiye. Kyunki aage badhte hue sizes sirf chhote hote hain, agla free address hamesha agle, chhote block ka multiple hota hai. Aapko kabhi skip ya boundaries check nahi karni padti.</p>

<h3>Lab 1, poora worked</h3>
<p>Branch ko 192.168.50.0/24 mila. LAN-A (R1 Gi0/1) ko 100 hosts chahiye, LAN-B (R2 Gi0/1) ko 50, LAN-C (R2 Gi0/2) ko 20, aur R1-R2 WAN link ko 2.</p>
<table class="cmp"><tr><th>Segment</th><th>Zaroorat</th><th>Prefix</th><th>Network</th><th>Router (first)</th><th>PC (last)</th><th>Broadcast</th></tr>
<tr><td>LAN-A</td><td>100</td><td>/25</td><td>192.168.50.0</td><td>.1</td><td>.126</td><td>.127</td></tr>
<tr><td>LAN-B</td><td>50</td><td>/26</td><td>192.168.50.128</td><td>.129</td><td>.190</td><td>.191</td></tr>
<tr><td>LAN-C</td><td>20</td><td>/27</td><td>192.168.50.192</td><td>.193</td><td>.222</td><td>.223</td></tr>
<tr><td>WAN</td><td>2</td><td>/30</td><td>192.168.50.224</td><td>R1 .225</td><td>R2 .226</td><td>.227</td></tr></table>
<p>Future ke liye free: 192.168.50.228 se 192.168.50.255.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="192.168.50.0/24 ka VLSM layout">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">192.168.50.0/24, sabse bada pehle</text>
<rect x="20" y="40" width="300" height="48" fill="#bae6fd"/><text x="170" y="62" text-anchor="middle" class="svg-ink" font-size="13">LAN-A /25</text><text x="170" y="79" text-anchor="middle" class="svg-muted" font-size="12">.0 se .127</text>
<rect x="320" y="40" width="150" height="48" fill="#bbf7d0"/><text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="13">LAN-B /26</text><text x="395" y="79" text-anchor="middle" class="svg-muted" font-size="12">.128 se .191</text>
<rect x="470" y="40" width="75" height="48" fill="#fde68a"/><text x="507" y="62" text-anchor="middle" class="svg-ink" font-size="12">LAN-C</text><text x="507" y="79" text-anchor="middle" class="svg-muted" font-size="12">/27</text>
<rect x="545" y="40" width="10" height="48" fill="#ddd6fe"/>
<rect x="555" y="40" width="65" height="48" fill="#e2e8f0"/><text x="587" y="68" text-anchor="middle" class="svg-muted" font-size="12">free</text>
<line x1="550" y1="92" x2="550" y2="118" stroke="#64748b" stroke-width="1.5"/><text x="550" y="134" text-anchor="middle" class="svg-accent" font-size="12">WAN /30 .224</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">har block apne size ke multiple par shuru hota hai</text>
</svg><p class="cap">Lab 1 ka plan scale par. Har subnet wahin se shuru hota hai jahan pichhla khatam hua.</p></div>

<p>Woh configuration jo lab check karta hai:</p>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/1
 ip address 192.168.50.1 255.255.255.128
interface GigabitEthernet0/0
 ip address 192.168.50.225 255.255.255.252
<span class="c">! R2</span>
interface GigabitEthernet0/0
 ip address 192.168.50.226 255.255.255.252
interface GigabitEthernet0/1
 ip address 192.168.50.129 255.255.255.192
interface GigabitEthernet0/2
 ip address 192.168.50.193 255.255.255.224
<span class="c">! PCs: ip address/prefix gateway</span>
PCA&gt; ip 192.168.50.126/25 192.168.50.1
PCB&gt; ip 192.168.50.190/26 192.168.50.129
PCC&gt; ip 192.168.50.222/27 192.168.50.193</pre>
<p>OSPF pehle se <code>network 192.168.50.0 0.0.0.255 area 0</code> ke saath chal raha hai, isliye addresses sahi hote hi R1, R2 ke LANs ko unke apne masks ke saath seekh leta hai:</p>
<pre class="out">R1# show ip route ospf
      192.168.50.0/24 is variably subnetted, 6 subnets, 5 masks
<span class="hl">O        192.168.50.128/26 [110/2] via 192.168.50.226, 00:00:12, GigabitEthernet0/0</span>
O        192.168.50.192/27 [110/2] via 192.168.50.226, 00:00:12, GigabitEthernet0/0</pre>

<div class="eg"><p><b>Worked example 2: 172.16.8.0/22.</b> Zaroorat: Sales 300, Engineering 120, Guest 60, Management 10, do WAN links. Sorted: 300 → /23 (510): <b>172.16.8.0/23</b> (8.0 se 9.255). 120 → /25: <b>172.16.10.0/25</b> (.0 se .127). 60 → /26: <b>172.16.10.128/26</b> (.128 se .191). 10 → /28: <b>172.16.10.192/28</b> (.192 se .207). WAN 1 → <b>172.16.10.208/30</b>, WAN 2 → <b>172.16.10.212/30</b>. Free: 172.16.10.216 se 172.16.11.255.</p></div>

<h3>Sabse chhota pehle mein kya galat hota hai</h3>
<p>Maan lo aap pehle WAN ko 192.168.50.0/30 dete ho aur phir LAN-C (/27) ko "turant baad" .4 par chahte ho. Par .4, 32 ka multiple nahi hai; 192.168.50.4/27 asal mein network .0 ka hai, jo WAN se overlap karta hai. Sahi hone ke liye aapko .32 par skip karna padega, 28 addresses ka gap chhod kar. Sabse chhota pehle ya to overlap karta hai ya space ko tukdon mein baant deta hai.</p>

<h3>Overlaps pakadna</h3>
<p>Do subnets overlap karte hain agar ek ka network doosre ki range ke andar aaye. 192.168.50.160/27 aur 192.168.50.128/26 overlap karte hain, kyunki .160, .128 se .191 ke andar hai. Ek hi router par IOS overlapping interface subnets mana kar deta hai:</p>
<pre class="out">R2(config)# interface GigabitEthernet0/2
R2(config-if)# ip address 192.168.50.161 255.255.255.224
<span class="hl">% 192.168.50.160 overlaps with GigabitEthernet0/1</span></pre>
<p>Alag routers ke beech aisa koi check nahi hota, isiliye sites ke beech overlaps itne common hain.</p>

<h3>Practice drill (answer neeche)</h3>
<p>10.5.0.0/24 ko 60, 28, 12, 2 aur 2 hosts ke segments ke liye kaato.</p>
<div class="tip"><p><b>Answer.</b> 60 → 10.5.0.0/26 (.0 se .63). 28 → 10.5.0.64/27 (.64 se .95). 12 → 10.5.0.96/28 (.96 se .111). 2 → 10.5.0.112/30. 2 → 10.5.0.116/30. Free: 10.5.0.120 se 10.5.0.255.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Size ki jagah segment ke naam se sort karna. Gateway bhool jaana: 30 PCs plus ek router 31 hosts hai, phir bhi /27, par 62 PCs plus ek router ko /25 chahiye. Subnet ko aise address par shuru karna jo uske block size ka multiple nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> VLSM sawaal aksar ek existing plan dikhate hain aur poochte hain ki "bina overlap aur kam se kam waste ke" kaunsa subnet joda ja sakta hai. Free ranges list karo, hosts ke liye fit hone wala sabse chhota prefix chuno, aur confirm karo ki uska start free range ke andar uske block size ka multiple hai.</p></div>

<div class="scn"><h4>Woh naya VLAN jisne printers tod diye</h4><p>Ek engineer ko Lab 1 plan wale 192.168.50.0/24 site par 25 naye IoT devices ke liye subnet chahiye tha. Ek spreadsheet dekh kar jismein sirf LAN-A aur LAN-C the, usne 192.168.50.160/27 chuna aur use ek alag router ke naye switch SVI par configure kar diya. LAN-B (192.168.50.128/26, .128 se .191) ke printers doosri sites se unreachable ho gaye kyunki ab OSPF galat router ki taraf ek zyada specific /27 le ja raha tha. Fix tha asli free space check karna: sirf .228 se .255 bacha tha, aur wahan koi aligned /27 fit nahi hota (akela candidate, .224/27, WAN link ko contain karta hai). Team ne IoT VLAN ko iske bajaye ek naye block se 192.168.51.0/27 diya.</p><p><b>Seekh:</b> address plan poora aur authoritative hona chahiye. Assign karne se pehle poore block mein overlaps check karo, sirf un rows mein nahi jo aapko dikh rahi hain.</p></div>

<div class="iv"><p class="q">"VLSM kya hai, aur hum sabse bade subnets pehle kyun allocate karte hain?"</p><p>Strong answer: VLSM ek address block ke andar alag prefix lengths use karta hai taaki har segment ko sirf utna mile jitna chahiye, jiske liye masks le jaane wale classless routing protocols chahiye. Sabse bada pehle allocate karne se har subnet apne block size ke multiple par aligned rehta hai, isliye har naya subnet pichhle broadcast plus one par bina gap aur bina overlap ke shuru hota hai. /24 mein 100, 50, 20, 2 hosts jaisa quick example samjhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLSM = ek block mein alag prefix lengths; mask le jaane wale routing protocols chahiye.</li>
<li>Sabse bada pehle sort karo; har subnet pichhle broadcast + 1 se shuru hota hai.</li>
<li>Subnet ko apne block size ke multiple par shuru hona chahiye.</li>
<li>Overlap = ek subnet ka network doosre ki range ke andar; IOS ise sirf same router par pakadta hai.</li>
<li>Poora address plan rakho aur free ranges record karo.</li>
</ul></div>
`}};export{e as default};