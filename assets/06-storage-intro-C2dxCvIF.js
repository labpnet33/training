var e={id:`storage-intro`,h:{en:`Storage basics: disks, RAID, LUNs, and DAS vs NAS vs SAN`,hi:`Storage basics: disks, RAID, LUNs, aur DAS vs NAS vs SAN`},body:{en:`
<p>Go back to the hotel analogy. Guests do not keep their suitcases in their rooms forever; the hotel has a secure luggage room, and staff bring bags to whichever room the guest moves to. In a data center, <b>storage</b> is that luggage room. Servers and VMs come and go, move between hosts and fail, but the data must stay safe and reachable from anywhere. That is why most important data lives on shared storage systems, not inside one server.</p>

<h3>Why storage is separate from the server</h3>
<ul>
<li><b>Mobility.</b> vMotion can move a VM in seconds only because its disk sits on shared storage that both hosts can reach.</li>
<li><b>Protection.</b> A storage array has redundant controllers, many disks, snapshots and replication, far more than one server can offer.</li>
<li><b>Efficiency.</b> Capacity is pooled and given to whoever needs it, instead of sitting unused inside hundreds of servers.</li>
</ul>

<h3>The media: HDD, SSD and NVMe</h3>
<table class="cmp"><tr><th>Media</th><th>How it works</th><th>Typical random IOPS per drive</th><th>Used for</th></tr>
<tr><td><b>HDD</b></td><td>Spinning platters and a moving head (7,200 to 15,000 RPM)</td><td>About 100 to 200</td><td>Cheap bulk capacity, backups, archives</td></tr>
<tr><td><b>SATA/SAS SSD</b></td><td>Flash memory behind an older disk interface</td><td>Tens of thousands</td><td>General performance storage</td></tr>
<tr><td><b>NVMe SSD</b></td><td>Flash connected directly over PCIe with a protocol built for flash</td><td>Hundreds of thousands or more</td><td>Databases, all-flash arrays, low latency</td></tr>
</table>
<p>Storage is judged by four numbers: <b>capacity</b> (TB), <b>IOPS</b> (input/output operations per second), <b>throughput</b> (MB/s or GB/s) and <b>latency</b> (how long one operation takes, in milliseconds or microseconds).</p>

<h3>RAID: surviving a disk failure</h3>
<p><b>RAID</b> (redundant array of independent disks) combines several disks so data survives a disk failure, and often runs faster.</p>
<table class="cmp"><tr><th>Level</th><th>Method</th><th>Usable capacity</th><th>Survives</th><th>Minimum disks</th></tr>
<tr><td>RAID 0</td><td>Striping, no protection</td><td>N × disk</td><td>Nothing</td><td>2</td></tr>
<tr><td>RAID 1</td><td>Mirroring</td><td>50%</td><td>1 disk of the pair</td><td>2</td></tr>
<tr><td>RAID 5</td><td>Striping with single parity</td><td>(N − 1) × disk</td><td>1 disk</td><td>3</td></tr>
<tr><td>RAID 6</td><td>Striping with double parity</td><td>(N − 2) × disk</td><td>Any 2 disks</td><td>4</td></tr>
<tr><td>RAID 10</td><td>Mirrored pairs, then striped</td><td>50%</td><td>1 disk per mirror pair</td><td>4</td></tr>
</table>
<div class="eg"><p><b>Worked example: eight 4 TB disks.</b> Raw capacity = 8 × 4 = 32 TB.</p>
<ul><li>RAID 0: 32 TB usable, no protection.</li><li>RAID 5: (8 − 1) × 4 = <b>28 TB</b>, survives one failure.</li><li>RAID 6: (8 − 2) × 4 = <b>24 TB</b>, survives two failures.</li><li>RAID 10: 32 ÷ 2 = <b>16 TB</b>, best write performance.</li></ul>
<p>Why not always RAID 5? Rebuilding a large disk can take many hours, and a second failure during the rebuild loses everything. With big drives, RAID 6 or RAID 10 is the safer choice. And remember: <b>RAID is not a backup</b>. If someone deletes a file, RAID faithfully deletes it on every disk.</p></div>

<h3>LUNs: slicing the storage</h3>
<p>A storage array pools hundreds of disks and then carves out volumes. A <b>LUN</b> (logical unit number) is one such volume presented to a server. The server sees it as a local disk, formats it and uses it. The array uses <b>LUN masking</b> so only the right servers can see each LUN, and in a Fibre Channel SAN the switches add <b>zoning</b> so only the right devices can talk at all.</p>

<h3>Block, file and object</h3>
<dl class="terms">
<dt>Block storage</dt><dd>The server gets raw blocks (a LUN) and puts its own file system on it. Fast and low-level; used for databases and VM datastores. Protocols: Fibre Channel, iSCSI, NVMe over Fabrics.</dd>
<dt>File storage</dt><dd>The storage system owns the file system and shares folders over the network. Many clients can open the same files. Protocols: <b>NFS</b> (common with Linux and VMware) and <b>SMB</b> (Windows shares).</dd>
<dt>Object storage</dt><dd>Data is stored as objects with an ID and rich metadata in a flat namespace, accessed through web-style REST APIs (S3-compatible APIs are the common standard). Scales to billions of objects; used for backups, media, logs and data lakes.</dd>
</dl>

<h3>DAS, NAS and SAN</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DAS NAS SAN comparison">
<rect x="10" y="10" width="190" height="180" rx="8" fill="#fde68a"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="14">DAS</text>
<rect x="45" y="50" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="105" y="73" text-anchor="middle" class="svg-ink" font-size="12">Server</text>
<line x1="105" y1="86" x2="105" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="45" y="120" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="105" y="143" text-anchor="middle" class="svg-ink" font-size="12">Its own disks</text>
<text x="105" y="178" text-anchor="middle" class="svg-muted" font-size="12">not shared</text>
<rect x="225" y="10" width="190" height="180" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">NAS</text>
<rect x="240" y="50" width="75" height="30" rx="6" fill="#bbf7d0"/><text x="277" y="70" text-anchor="middle" class="svg-ink" font-size="12">Srv 1</text>
<rect x="325" y="50" width="75" height="30" rx="6" fill="#bbf7d0"/><text x="362" y="70" text-anchor="middle" class="svg-ink" font-size="12">Srv 2</text>
<line x1="277" y1="80" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="362" y1="80" x2="320" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="120" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="12">NAS filer</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">files over Ethernet</text>
<rect x="440" y="10" width="190" height="180" rx="8" fill="#ddd6fe"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="14">SAN</text>
<rect x="455" y="50" width="75" height="30" rx="6" fill="#bbf7d0"/><text x="492" y="70" text-anchor="middle" class="svg-ink" font-size="12">Srv 1</text>
<rect x="540" y="50" width="75" height="30" rx="6" fill="#bbf7d0"/><text x="577" y="70" text-anchor="middle" class="svg-ink" font-size="12">Srv 2</text>
<line x1="492" y1="80" x2="535" y2="120" stroke="#64748b" stroke-width="2"/><line x1="577" y1="80" x2="535" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="475" y="120" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="535" y="143" text-anchor="middle" class="svg-ink" font-size="12">Array (LUNs)</text>
<text x="535" y="178" text-anchor="middle" class="svg-muted" font-size="12">blocks over FC/iSCSI</text>
</svg><p class="cap">DAS is private to one server; NAS shares files; SAN shares blocks over a dedicated storage network.</p></div>
<ul>
<li><b>DAS</b> (direct-attached storage): disks inside or cabled directly to one server. Simple and fast, but not shared.</li>
<li><b>NAS</b> (network-attached storage): a file server (filer) that shares file systems over normal Ethernet with NFS or SMB.</li>
<li><b>SAN</b> (storage area network): a dedicated network that gives servers block access to LUNs on shared arrays, using Fibre Channel or iSCSI. Built as two separate fabrics, <b>A and B</b>, and servers use <b>multipathing</b> software to use both.</li>
</ul>

<h3>Why storage needs a lossless or very reliable network</h3>
<p>Storage traffic carries disk reads and writes. If a frame is lost, the host must wait for a timeout and retry, and applications freeze. <b>Fibre Channel</b> is designed to be <b>lossless</b>: a sender only transmits when the receiver has buffer space (buffer-to-buffer credits). <b>iSCSI</b> and <b>NFS</b> run over TCP, which recovers lost packets, but drops still cause latency spikes. <b>FCoE</b> carries Fibre Channel over Ethernet and therefore needs lossless Ethernet features (<b>DCB</b>: Priority Flow Control and Enhanced Transmission Selection).</p>
<p>Preview of the storage module: FC with WWNs, VSANs and zoning on Cisco MDS; iSCSI (TCP port 3260) with IQN names; NFS (TCP port 2049).</p>

<div class="warn"><p><b>Common mistakes.</b> Believing RAID replaces backups. Connecting both SAN paths of a server to the same fabric, which removes the A/B redundancy. Putting iSCSI traffic in a busy user VLAN with no QoS or dedicated links.</p></div>
<div class="exam"><p><b>Exam tip.</b> Block = SAN (FC, iSCSI, FCoE, NVMe-oF); file = NAS (NFS, SMB). RAID 5 loses one disk of capacity, RAID 6 loses two, RAID 10 loses half. FC is lossless by design using buffer credits.</p></div>

<div class="scn"><h4>The database that froze every afternoon</h4><p>A database on iSCSI storage froze for a few seconds every afternoon. The DBA blamed the array; the array showed healthy latency. The network engineer looked at the leaf interface counters and saw output discards on the iSCSI ports at exactly those times: a backup job that normally ran at night had been moved to 3 p.m. and was flooding the same uplinks. TCP recovered every drop, but each retransmission timeout froze the database. The fix was to move iSCSI to dedicated links (and a separate VLAN), and schedule the backup back to the night.</p><p><b>Lesson:</b> storage traffic tolerates loss far worse than web traffic; give it its own capacity.</p></div>

<div class="iv"><p class="q">"What is the difference between SAN and NAS?"</p><p>Strong answer: a SAN provides block-level access; the server sees a LUN as its own disk and puts its file system on it, over Fibre Channel, iSCSI or FCoE, usually with dual fabrics and multipathing. A NAS provides file-level access; the filer owns the file system and shares it over NFS or SMB. Give examples: VM datastores and databases on SAN, shared home folders on NAS. Bonus: mention that object storage is a third model for backups and data lakes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shared storage enables VM mobility, protection and efficient capacity use.</li>
<li>HDD for cheap capacity, SSD for speed, NVMe for the lowest latency; judge by capacity, IOPS, throughput and latency.</li>
<li>RAID 5 = N − 1, RAID 6 = N − 2, RAID 10 = 50%; RAID is not backup.</li>
<li>Block (SAN), file (NAS) and object storage serve different needs; a LUN is a block volume presented to a host.</li>
<li>Storage networks must be lossless or very reliable, with A/B fabrics and multipathing.</li>
</ul></div>
`,hi:`
<p>Hotel wali analogy par wapas chalo. Guests apne suitcases hamesha apne room mein nahi rakhte; hotel mein ek secure luggage room hota hai, aur staff bags us room tak le aata hai jahan bhi guest shift hota hai. Data center mein <b>storage</b> wahi luggage room hai. Servers aur VMs aate-jaate hain, hosts ke beech move hote hain aur fail hote hain, lekin data safe aur har jagah se reachable rehna chahiye. Isiliye zyada tar zaroori data ek server ke andar nahi, balki shared storage systems par rehta hai.</p>

<h3>Storage server se alag kyun hai</h3>
<ul>
<li><b>Mobility.</b> vMotion VM ko seconds mein isliye move kar paata hai kyunki uski disk shared storage par hai jahan dono hosts pahunch sakte hain.</li>
<li><b>Protection.</b> Storage array mein redundant controllers, bahut saari disks, snapshots aur replication hote hain, jo ek server se kahin zyada hai.</li>
<li><b>Efficiency.</b> Capacity pool hoti hai aur jise chahiye use di jaati hai, sainkdon servers ke andar bekaar padi rehne ke bajaye.</li>
</ul>

<h3>Media: HDD, SSD aur NVMe</h3>
<table class="cmp"><tr><th>Media</th><th>Kaise kaam karta hai</th><th>Har drive ke typical random IOPS</th><th>Kahan use hota hai</th></tr>
<tr><td><b>HDD</b></td><td>Ghoomte platters aur chalta hua head (7,200 se 15,000 RPM)</td><td>Lagbhag 100 se 200</td><td>Sasti bulk capacity, backups, archives</td></tr>
<tr><td><b>SATA/SAS SSD</b></td><td>Purane disk interface ke peeche flash memory</td><td>Dasiyon hazaar</td><td>General performance storage</td></tr>
<tr><td><b>NVMe SSD</b></td><td>Flash jo seedha PCIe par juda hai, flash ke liye bane protocol ke saath</td><td>Laakhon ya usse zyada</td><td>Databases, all-flash arrays, low latency</td></tr>
</table>
<p>Storage ko chaar numbers se parakhte hain: <b>capacity</b> (TB), <b>IOPS</b> (input/output operations per second), <b>throughput</b> (MB/s ya GB/s) aur <b>latency</b> (ek operation mein kitna time lagta hai, milliseconds ya microseconds mein).</p>

<h3>RAID: disk failure jhelna</h3>
<p><b>RAID</b> (redundant array of independent disks) kai disks ko jodta hai taaki disk fail hone par bhi data bacha rahe, aur aksar speed bhi badhti hai.</p>
<table class="cmp"><tr><th>Level</th><th>Tareeka</th><th>Usable capacity</th><th>Kya jhelta hai</th><th>Minimum disks</th></tr>
<tr><td>RAID 0</td><td>Striping, koi protection nahi</td><td>N × disk</td><td>Kuch nahi</td><td>2</td></tr>
<tr><td>RAID 1</td><td>Mirroring</td><td>50%</td><td>Pair ki 1 disk</td><td>2</td></tr>
<tr><td>RAID 5</td><td>Single parity ke saath striping</td><td>(N − 1) × disk</td><td>1 disk</td><td>3</td></tr>
<tr><td>RAID 6</td><td>Double parity ke saath striping</td><td>(N − 2) × disk</td><td>Koi bhi 2 disks</td><td>4</td></tr>
<tr><td>RAID 10</td><td>Mirrored pairs, phir striped</td><td>50%</td><td>Har mirror pair ki 1 disk</td><td>4</td></tr>
</table>
<div class="eg"><p><b>Worked example: aath 4 TB disks.</b> Raw capacity = 8 × 4 = 32 TB.</p>
<ul><li>RAID 0: 32 TB usable, koi protection nahi.</li><li>RAID 5: (8 − 1) × 4 = <b>28 TB</b>, ek failure jhelta hai.</li><li>RAID 6: (8 − 2) × 4 = <b>24 TB</b>, do failures jhelta hai.</li><li>RAID 10: 32 ÷ 2 = <b>16 TB</b>, sabse achhi write performance.</li></ul>
<p>Hamesha RAID 5 kyun nahi? Badi disk rebuild karne mein kai ghante lag sakte hain, aur rebuild ke dauraan dusra failure sab kuch khatam kar deta hai. Badi drives ke saath RAID 6 ya RAID 10 safe choice hai. Aur yaad rakho: <b>RAID backup nahi hai</b>. Agar koi file delete kar de, to RAID imaandaari se use har disk par delete kar deta hai.</p></div>

<h3>LUNs: storage ke tukde</h3>
<p>Storage array sainkdon disks ko pool karta hai aur phir volumes kaat-ta hai. <b>LUN</b> (logical unit number) aisa ek volume hai jo server ko diya jaata hai. Server use local disk ki tarah dekhta hai, format karta hai aur use karta hai. Array <b>LUN masking</b> use karta hai taaki har LUN sirf sahi servers ko dikhe, aur Fibre Channel SAN mein switches <b>zoning</b> jodte hain taaki sirf sahi devices hi aapas mein baat kar sakein.</p>

<h3>Block, file aur object</h3>
<dl class="terms">
<dt>Block storage</dt><dd>Server ko raw blocks (ek LUN) milte hain aur woh us par apna file system daalta hai. Fast aur low-level; databases aur VM datastores ke liye use hota hai. Protocols: Fibre Channel, iSCSI, NVMe over Fabrics.</dd>
<dt>File storage</dt><dd>Storage system file system ka maalik hota hai aur network par folders share karta hai. Kai clients same files khol sakte hain. Protocols: <b>NFS</b> (Linux aur VMware ke saath common) aur <b>SMB</b> (Windows shares).</dd>
<dt>Object storage</dt><dd>Data ek flat namespace mein ID aur rich metadata wale objects ki tarah store hota hai, web-style REST APIs se access hota hai (S3-compatible APIs common standard hain). Arabon objects tak scale karta hai; backups, media, logs aur data lakes ke liye use hota hai.</dd>
</dl>

<h3>DAS, NAS aur SAN</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DAS NAS SAN ki tulna">
<rect x="10" y="10" width="190" height="180" rx="8" fill="#fde68a"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="14">DAS</text>
<rect x="45" y="50" width="120" height="36" rx="6" fill="#bbf7d0"/><text x="105" y="73" text-anchor="middle" class="svg-ink" font-size="12">Server</text>
<line x1="105" y1="86" x2="105" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="45" y="120" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="105" y="143" text-anchor="middle" class="svg-ink" font-size="12">Apni disks</text>
<text x="105" y="178" text-anchor="middle" class="svg-muted" font-size="12">shared nahi</text>
<rect x="225" y="10" width="190" height="180" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">NAS</text>
<rect x="240" y="50" width="75" height="30" rx="6" fill="#bbf7d0"/><text x="277" y="70" text-anchor="middle" class="svg-ink" font-size="12">Srv 1</text>
<rect x="325" y="50" width="75" height="30" rx="6" fill="#bbf7d0"/><text x="362" y="70" text-anchor="middle" class="svg-ink" font-size="12">Srv 2</text>
<line x1="277" y1="80" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="362" y1="80" x2="320" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="120" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="12">NAS filer</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Ethernet par files</text>
<rect x="440" y="10" width="190" height="180" rx="8" fill="#ddd6fe"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="14">SAN</text>
<rect x="455" y="50" width="75" height="30" rx="6" fill="#bbf7d0"/><text x="492" y="70" text-anchor="middle" class="svg-ink" font-size="12">Srv 1</text>
<rect x="540" y="50" width="75" height="30" rx="6" fill="#bbf7d0"/><text x="577" y="70" text-anchor="middle" class="svg-ink" font-size="12">Srv 2</text>
<line x1="492" y1="80" x2="535" y2="120" stroke="#64748b" stroke-width="2"/><line x1="577" y1="80" x2="535" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="475" y="120" width="120" height="36" rx="6" fill="#e2e8f0"/><text x="535" y="143" text-anchor="middle" class="svg-ink" font-size="12">Array (LUNs)</text>
<text x="535" y="178" text-anchor="middle" class="svg-muted" font-size="12">FC/iSCSI par blocks</text>
</svg><p class="cap">DAS ek server ka private hai; NAS files share karta hai; SAN dedicated storage network par blocks share karta hai.</p></div>
<ul>
<li><b>DAS</b> (direct-attached storage): disks jo ek server ke andar hain ya seedhe usse cabled hain. Simple aur fast, lekin shared nahi.</li>
<li><b>NAS</b> (network-attached storage): ek file server (filer) jo normal Ethernet par NFS ya SMB se file systems share karta hai.</li>
<li><b>SAN</b> (storage area network): ek dedicated network jo servers ko shared arrays ke LUNs par block access deta hai, Fibre Channel ya iSCSI use karke. Do alag fabrics, <b>A aur B</b>, ki tarah banta hai, aur servers dono ko use karne ke liye <b>multipathing</b> software chalate hain.</li>
</ul>

<h3>Storage ko lossless ya bahut reliable network kyun chahiye</h3>
<p>Storage traffic disk reads aur writes le jaata hai. Agar ek frame kho jaaye, to host ko timeout ka wait karke retry karna padta hai, aur applications freeze ho jaati hain. <b>Fibre Channel</b> <b>lossless</b> hone ke liye design hua hai: sender tabhi bhejta hai jab receiver ke paas buffer space ho (buffer-to-buffer credits). <b>iSCSI</b> aur <b>NFS</b> TCP par chalte hain, jo khoye packets recover kar leta hai, lekin drops phir bhi latency spikes paida karte hain. <b>FCoE</b> Fibre Channel ko Ethernet par le jaata hai aur isliye lossless Ethernet features chahiye (<b>DCB</b>: Priority Flow Control aur Enhanced Transmission Selection).</p>
<p>Storage module ka preview: Cisco MDS par WWNs, VSANs aur zoning ke saath FC; IQN names ke saath iSCSI (TCP port 3260); NFS (TCP port 2049).</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maanna ki RAID backups ki jagah le leta hai. Server ke dono SAN paths ko same fabric mein jod dena, jisse A/B redundancy khatam ho jaati hai. iSCSI traffic ko bina QoS ya dedicated links ke busy user VLAN mein daal dena.</p></div>
<div class="exam"><p><b>Exam tip.</b> Block = SAN (FC, iSCSI, FCoE, NVMe-oF); file = NAS (NFS, SMB). RAID 5 ek disk ki capacity khota hai, RAID 6 do, RAID 10 aadhi. FC buffer credits se design se hi lossless hai.</p></div>

<div class="scn"><h4>Woh database jo har dopahar freeze hota tha</h4><p>iSCSI storage par ek database har dopahar kuch seconds ke liye freeze hota tha. DBA ne array ko blame kiya; array healthy latency dikha raha tha. Network engineer ne leaf interface counters dekhe aur theek unhi times par iSCSI ports par output discards paaye: ek backup job jo normally raat mein chalta tha, 3 baje dopahar par shift ho gaya tha aur same uplinks ko flood kar raha tha. TCP ne har drop recover kiya, lekin har retransmission timeout database ko freeze kar deta tha. Fix yeh tha ki iSCSI ko dedicated links (aur alag VLAN) par shift kiya, aur backup ko wapas raat mein schedule kiya.</p><p><b>Seekh:</b> storage traffic web traffic se kahin kam loss jhel paata hai; use apni alag capacity do.</p></div>

<div class="iv"><p class="q">"SAN aur NAS mein kya farak hai?"</p><p>Strong answer: SAN block-level access deta hai; server LUN ko apni disk ki tarah dekhta hai aur us par apna file system daalta hai, Fibre Channel, iSCSI ya FCoE par, aam taur par dual fabrics aur multipathing ke saath. NAS file-level access deta hai; filer file system ka maalik hai aur use NFS ya SMB par share karta hai. Examples do: VM datastores aur databases SAN par, shared home folders NAS par. Bonus: batao ki object storage backups aur data lakes ke liye teesra model hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shared storage VM mobility, protection aur capacity ka efficient use possible banata hai.</li>
<li>Sasti capacity ke liye HDD, speed ke liye SSD, sabse kam latency ke liye NVMe; capacity, IOPS, throughput aur latency se parakho.</li>
<li>RAID 5 = N − 1, RAID 6 = N − 2, RAID 10 = 50%; RAID backup nahi hai.</li>
<li>Block (SAN), file (NAS) aur object storage alag zaroorat poori karte hain; LUN host ko diya gaya block volume hai.</li>
<li>Storage networks lossless ya bahut reliable hone chahiye, A/B fabrics aur multipathing ke saath.</li>
</ul></div>
`}};export{e as default};