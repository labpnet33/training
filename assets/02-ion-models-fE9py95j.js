var e={id:`ion-models`,h:{en:`ION device families and how to size them`,hi:`ION device families aur unhe size kaise karein`},body:{en:`
<p>An <b>ION</b> (Instant-On Network) device is the Prisma SD-WAN box that sits at a site. It terminates the WAN circuits, builds the VPN tunnels of the fabric, enforces the policies and reports to the cloud. Choosing the right ION is the first design skill the exam tests under <b>device selection</b>.</p>
<h3>Analogy: vans, trucks and cargo planes</h3>
<p>A small shop does not need a cargo plane, and a regional warehouse cannot run on a scooter. ION models are the same: small desktop boxes for small branches, bigger rack units for large branches and data centers, and software versions for virtual environments. You choose by how much traffic must be encrypted and forwarded, how many ports you need, and what special features the site needs (hardware bypass, LTE, PoE, redundant power).</p>
<h3>The three families</h3>
<ul>
<li><b>Branch hardware.</b> Small fanless desktop or wall-mount units, and 1U rack units for large branches.</li>
<li><b>Data center hardware.</b> Higher-throughput rack units with SFP+ 10 gigabit ports. The Palo Alto Networks documentation lists ION 5200, ION 7000, ION 9000 and ION 9200 as suitable for a data center ION.</li>
<li><b>Virtual (software) ION.</b> The same software on a hypervisor or cloud: ESXi, Hyper-V, KVM, and public clouds (AWS, Azure, GCP are named in the compatibility documentation).</li>
</ul>
<h3>Current hardware at a glance</h3>
<p>The table below comes from the Prisma SD-WAN ION device specifications datasheet that I reviewed while preparing this module. Throughput figures are vendor datasheet numbers for the whole device with encryption; always re-check the current datasheet and the compatibility matrix, because models, supported software releases and end-of-life dates move.</p>
<table class="cmp"><tr><th>Model</th><th>Throughput (datasheet)</th><th>Notable ports and features</th><th>Typical use</th></tr>
<tr><td><b>ION 1200</b></td><td>700 Mbps</td><td>4 x 1GE RJ45; 4G LTE and 5G variants exist</td><td>Small branch, micro-site</td></tr>
<tr><td><b>ION 1200-S</b></td><td>700 Mbps</td><td>Embedded switch: 1GE ports, combo ports, 4 PoE++ ports; 1 bypass pair; cellular variants</td><td>Small branch that wants LAN ports on the box</td></tr>
<tr><td><b>ION 3200</b></td><td>1 Gbps branch, 1.4 Gbps data center</td><td>1GE ports, 2 combo, PoE++; 1 bypass pair</td><td>Typical branch (small data center)</td></tr>
<tr><td><b>ION 3200H</b></td><td>1 Gbps branch, 1.4 Gbps data center</td><td>Extended-temperature unit; 5G variant</td><td>Harsh environments</td></tr>
<tr><td><b>ION 5200</b></td><td>2 Gbps branch, 4 Gbps data center</td><td>Multigig and PoE++ ports, 10GE SFP+; 2 bypass pairs; dual hot-swap power</td><td>Large branch, data center</td></tr>
<tr><td><b>ION 9200</b></td><td>5 Gbps branch, 14 Gbps data center</td><td>10GE SFP+ ports; 4 bypass pairs</td><td>Large data center or hub</td></tr></table>
<p>Older generations still appear in networks and on the exam: ION 1000, 2000, 3000, 7000 and 9000. The compatibility matrix I reviewed notes that some of them are at or near end of life for new software releases, so in a new design you propose the current generation and in a migration design you plan their replacement.</p>
<h3>Virtual ION</h3>
<table class="cmp"><tr><th>Model</th><th>Throughput (datasheet)</th><th>vCPU / RAM / disk</th><th>Use</th></tr>
<tr><td>ION 3102V</td><td>up to 100 Mbps</td><td>2 / 8 GB / 40 GB</td><td>Remote office</td></tr>
<tr><td>ION 3104V</td><td>up to 200 Mbps</td><td>4 / 8 GB / 40 GB</td><td>Remote office</td></tr>
<tr><td>ION 3108V</td><td>up to 350 Mbps</td><td>8 / 8 GB / 40 GB</td><td>Remote office</td></tr>
<tr><td>ION 7108V</td><td>up to 3 Gbps</td><td>8 / 32 GB / 100 GB</td><td>Data center</td></tr></table>
<p>The compatibility matrix also lists larger virtual models (7116V and 7132V) for newer releases. A virtual data center ION is common when the hub sits in a public cloud or in a virtualised colocation.</p>
<div class="eg"><p><b>Worked example: sizing three Harbor Foods sites.</b></p>
<ul><li><b>Small shop SHOP-014:</b> 100 Mbps internet plus LTE backup, 20 users, no HA. Peak encrypted traffic about 60 Mbps. An ION 1200 with the LTE or 5G variant is far more than enough. Use the cellular variant so the backup circuit needs no extra router.</li>
<li><b>Store STORE-007:</b> 500 Mbps internet and 100 Mbps MPLS, payment terminals, HA required. Peak about 400 Mbps. Two ION 3200 (1 Gbps each) give headroom and the bypass pair support that HA topologies use.</li>
<li><b>DC-EAST hub:</b> all 40 branches connect, aggregate peak about 6 Gbps at the hub, and growth of 30 percent is planned. 6 x 1.3 = 7.8 Gbps, so one 9200 (14 Gbps datacenter figure) fits, and a second one gives redundancy.</li></ul></div>
<h3>Rules of thumb for selection</h3>
<ol>
<li>Size to the <b>sum of the encrypted traffic you really expect</b>, not to the circuit size. A 1 Gbps fibre line with 150 Mbps of real peak traffic does not need a 1 Gbps ION.</li>
<li>Add 30 to 50 percent headroom for growth and for services that cost CPU, such as the zone-based firewall and packet-level features.</li>
<li>Count ports: each circuit, each LAN, the HA link and the controller port consume interfaces.</li>
<li>Check special needs: hardware bypass for fail-to-wire, PoE for phones and access points, LTE or 5G, redundant power, extended temperature, virtual form factor.</li>
<li>Hub devices carry the sum of many branches, so size them on aggregate throughput and on how many tunnels they terminate.</li>
</ol>
<div class="warn"><p><b>Common mistake.</b> Sizing the branch ION to the interface speed. Gigabit ports do not mean gigabit of encrypted SD-WAN throughput. Another mistake is forgetting that the data center figure and the branch figure of the same model differ, because the data center role is tuned differently.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which ION supports hardware bypass?" The bypass pair is a feature of specific physical models (for example 3200, 5200 and 9200), not of the small ION 1200 and not of virtual IONs. A requirement of "fail-to-wire when power is lost" excludes software IONs. The bypass pair feature is documented as available exclusively for branch ION devices.</p></div>
<div class="scn"><h4>The virtual ION that was too small</h4><p>A customer put a data center ION in a public cloud on a small virtual model because the cloud team wanted a cheap instance. Branches reported slow cloud applications at the lunchtime peak. The hub was dropping traffic at about 350 Mbps. The team moved to a data center class virtual model and the problem vanished. The assessment had sized the hub for average traffic, not peak.</p><p><b>Lesson:</b> size hubs for peak and growth, and use the model made for the role.</p></div>
<div class="iv"><p class="q">"How do you choose between an ION 3200 and an ION 5200 for a branch?"</p><p>I look at the real encrypted peak throughput, the number and type of ports (10G, multigig, PoE), whether HA with bypass pairs is needed, redundant power requirements and growth. If the site is under about a gigabit with 1GE circuits, a 3200 is enough; if I need 10GE SFP+ uplinks, more bypass pairs, or hub-like aggregation, I choose the 5200. I always confirm the figures in the current datasheet.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ION families: branch hardware, data center hardware, virtual software IONs.</li>
<li>Branch models (1200, 1200-S, 3200, 3200H, 5200); data center models (5200, 9200 and legacy 7000/9000, virtual 7108V and larger).</li>
<li>Size on real encrypted peak plus 30 to 50 percent headroom, then check ports and special features.</li>
<li>Bypass pairs are physical-branch features; virtual IONs have none.</li>
<li>Throughput numbers come from vendor datasheets and change; verify before you quote them.</li>
</ul></div>
`,hi:`
<p><b>ION</b> (Instant-On Network) device woh Prisma SD-WAN box hai jo site par baithta hai. Yeh WAN circuits terminate karta hai, fabric ke VPN tunnels banata hai, policies enforce karta hai aur cloud ko report karta hai. Sahi ION chunna pehli design skill hai jo exam <b>device selection</b> ke under test karta hai.</p>
<h3>Analogy: vans, trucks aur cargo planes</h3>
<p>Chhoti shop ko cargo plane nahi chahiye, aur regional warehouse scooter par nahi chal sakta. ION models bhi aise hi hain: chhoti branches ke liye small desktop boxes, bade branches aur data centers ke liye bade rack units, aur virtual environments ke liye software versions. Aap chunte ho is hisaab se ki kitna traffic encrypt aur forward hona hai, kitne ports chahiye, aur site ko kaunse special features chahiye (hardware bypass, LTE, PoE, redundant power).</p>
<h3>Teen families</h3>
<ul>
<li><b>Branch hardware.</b> Chhote fanless desktop ya wall-mount units, aur bade branches ke liye 1U rack units.</li>
<li><b>Data center hardware.</b> Zyada throughput wale rack units jinme SFP+ 10 gigabit ports hote hain. Palo Alto Networks documentation ION 5200, ION 7000, ION 9000 aur ION 9200 ko data center ION ke liye suitable batati hai.</li>
<li><b>Virtual (software) ION.</b> Wahi software hypervisor ya cloud par: ESXi, Hyper-V, KVM, aur public clouds (compatibility documentation mein AWS, Azure, GCP ka naam hai).</li>
</ul>
<h3>Current hardware ek nazar mein</h3>
<p>Neeche ki table us Prisma SD-WAN ION device specifications datasheet se hai jo maine is module ki taiyari mein dekhi. Throughput figures vendor datasheet ke numbers hain, poore device ke liye encryption ke saath; current datasheet aur compatibility matrix hamesha dobara check karo, kyunki models, supported software releases aur end-of-life dates badalte rehte hain.</p>
<table class="cmp"><tr><th>Model</th><th>Throughput (datasheet)</th><th>Khaas ports aur features</th><th>Typical use</th></tr>
<tr><td><b>ION 1200</b></td><td>700 Mbps</td><td>4 x 1GE RJ45; 4G LTE aur 5G variants hain</td><td>Chhoti branch, micro-site</td></tr>
<tr><td><b>ION 1200-S</b></td><td>700 Mbps</td><td>Embedded switch: 1GE ports, combo ports, 4 PoE++ ports; 1 bypass pair; cellular variants</td><td>Chhoti branch jise box par LAN ports chahiye</td></tr>
<tr><td><b>ION 3200</b></td><td>1 Gbps branch, 1.4 Gbps data center</td><td>1GE ports, 2 combo, PoE++; 1 bypass pair</td><td>Typical branch (chhota data center)</td></tr>
<tr><td><b>ION 3200H</b></td><td>1 Gbps branch, 1.4 Gbps data center</td><td>Extended-temperature unit; 5G variant</td><td>Kathin environments</td></tr>
<tr><td><b>ION 5200</b></td><td>2 Gbps branch, 4 Gbps data center</td><td>Multigig aur PoE++ ports, 10GE SFP+; 2 bypass pairs; dual hot-swap power</td><td>Bada branch, data center</td></tr>
<tr><td><b>ION 9200</b></td><td>5 Gbps branch, 14 Gbps data center</td><td>10GE SFP+ ports; 4 bypass pairs</td><td>Bada data center ya hub</td></tr></table>
<p>Purani generations abhi bhi networks mein aur exam mein aati hain: ION 1000, 2000, 3000, 7000 aur 9000. Jo compatibility matrix maine dekhi usme likha hai ki inmein se kuch naye software releases ke liye end of life par ya uske kareeb hain, isliye naye design mein aap current generation propose karte ho aur migration design mein inke replacement ki planning karte ho.</p>
<h3>Virtual ION</h3>
<table class="cmp"><tr><th>Model</th><th>Throughput (datasheet)</th><th>vCPU / RAM / disk</th><th>Use</th></tr>
<tr><td>ION 3102V</td><td>up to 100 Mbps</td><td>2 / 8 GB / 40 GB</td><td>Remote office</td></tr>
<tr><td>ION 3104V</td><td>up to 200 Mbps</td><td>4 / 8 GB / 40 GB</td><td>Remote office</td></tr>
<tr><td>ION 3108V</td><td>up to 350 Mbps</td><td>8 / 8 GB / 40 GB</td><td>Remote office</td></tr>
<tr><td>ION 7108V</td><td>up to 3 Gbps</td><td>8 / 32 GB / 100 GB</td><td>Data center</td></tr></table>
<p>Compatibility matrix mein naye releases ke liye bade virtual models (7116V aur 7132V) bhi listed hain. Virtual data center ION tab common hai jab hub public cloud mein ya virtualised colocation mein ho.</p>
<div class="eg"><p><b>Worked example: Harbor Foods ki teen sites ka sizing.</b></p>
<ul><li><b>Chhoti shop SHOP-014:</b> 100 Mbps internet plus LTE backup, 20 users, HA nahi. Peak encrypted traffic lagbhag 60 Mbps. LTE ya 5G variant wala ION 1200 kaafi se zyada hai. Cellular variant isliye lo ki backup circuit ke liye alag router na lage.</li>
<li><b>Store STORE-007:</b> 500 Mbps internet aur 100 Mbps MPLS, payment terminals, HA zaroori. Peak lagbhag 400 Mbps. Do ION 3200 (har ek 1 Gbps) headroom dete hain aur wahi bypass pair support dete hain jo HA topologies use karti hain.</li>
<li><b>DC-EAST hub:</b> saare 40 branches jude hain, hub par aggregate peak lagbhag 6 Gbps, aur 30 percent growth planned hai. 6 x 1.3 = 7.8 Gbps, isliye ek 9200 (14 Gbps data center figure) fit hota hai, aur doosra redundancy deta hai.</li></ul></div>
<h3>Selection ke rules of thumb</h3>
<ol>
<li><b>Jo encrypted traffic aap sach mein expect karte ho uske sum</b> ke hisaab se size karo, circuit size ke hisaab se nahi. 1 Gbps fibre line jisme real peak 150 Mbps hai use 1 Gbps ION nahi chahiye.</li>
<li>Growth ke liye aur un services ke liye jo CPU khati hain (jaise zone-based firewall aur packet-level features) 30 se 50 percent headroom jodo.</li>
<li>Ports gino: har circuit, har LAN, HA link aur controller port interfaces use karte hain.</li>
<li>Special needs check karo: fail-to-wire ke liye hardware bypass, phones aur access points ke liye PoE, LTE ya 5G, redundant power, extended temperature, virtual form factor.</li>
<li>Hub devices bahut saare branches ka sum uthate hain, isliye unhe aggregate throughput aur kitne tunnels terminate karte hain us hisaab se size karo.</li>
</ol>
<div class="warn"><p><b>Common galti.</b> Branch ION ko interface speed ke hisaab se size karna. Gigabit ports ka matlab gigabit encrypted SD-WAN throughput nahi hota. Doosri galti: yeh bhool jaana ki ek hi model ka data center figure aur branch figure alag hote hain, kyunki data center role alag tune hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaun sa ION hardware bypass support karta hai?" Bypass pair specific physical models ka feature hai (jaise 3200, 5200 aur 9200), chhote ION 1200 ka nahi aur virtual IONs ka nahi. "Power jaane par fail-to-wire" ki requirement software IONs ko exclude kar deti hai. Documentation bypass pair ko sirf branch ION devices ke liye available batati hai.</p></div>
<div class="scn"><h4>Virtual ION jo chhota pad gaya</h4><p>Ek customer ne public cloud mein data center ION chhote virtual model par lagaya kyunki cloud team ko sasta instance chahiye tha. Lunchtime peak par branches ne cloud applications slow hone ki shikayat ki. Hub lagbhag 350 Mbps par traffic drop kar raha tha. Team ne data center class virtual model par move kiya aur problem khatam ho gayi. Assessment ne hub ko average traffic ke liye size kiya tha, peak ke liye nahi.</p><p><b>Seekh:</b> hubs ko peak aur growth ke liye size karo, aur role ke liye bana model use karo.</p></div>
<div class="iv"><p class="q">"Branch ke liye ION 3200 aur ION 5200 mein se kaise chunoge?"</p><p>Main real encrypted peak throughput dekhta hoon, ports ki sankhya aur type (10G, multigig, PoE), kya bypass pairs ke saath HA chahiye, redundant power requirements aur growth. Agar site lagbhag ek gigabit se kam hai aur 1GE circuits hain to 3200 kaafi hai; agar 10GE SFP+ uplinks, zyada bypass pairs ya hub jaisi aggregation chahiye to 5200 chunta hoon. Figures main hamesha current datasheet mein confirm karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ION families: branch hardware, data center hardware, virtual software IONs.</li>
<li>Branch models (1200, 1200-S, 3200, 3200H, 5200); data center models (5200, 9200 aur legacy 7000/9000, virtual 7108V aur bade).</li>
<li>Real encrypted peak plus 30 se 50 percent headroom ke hisaab se size karo, phir ports aur special features check karo.</li>
<li>Bypass pairs physical-branch features hain; virtual IONs mein nahi hote.</li>
<li>Throughput numbers vendor datasheets se aate hain aur badalte hain; quote karne se pehle verify karo.</li>
</ul></div>
`}};export{e as default};