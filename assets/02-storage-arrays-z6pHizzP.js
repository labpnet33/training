var e={id:`arrays`,h:{en:`Inside a storage array: controllers, pools, LUNs, thin provisioning and replication`,hi:`Storage array ke andar: controllers, pools, LUNs, thin provisioning aur replication`},body:{en:`
<p>Before we build the network, look at what sits at the far end of it. A <b>storage array</b> is a specialised computer whose only job is to store blocks safely and serve them fast. Think of it as a bank vault with two managers on duty: customers (servers) never walk into the vault; they hand requests to a counter (front-end port), a manager (controller) fetches the item from the shelves (disks), and every item is kept in at least two places.</p>

<h3>Anatomy of an array</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Storage array anatomy">
<rect x="20" y="15" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Front-end ports: spa0, spa1 | spb0, spb1 (to fabric A and B)</text>
<rect x="20" y="70" width="290" height="70" rx="8" fill="#ddd6fe"/><text x="165" y="96" text-anchor="middle" class="svg-ink" font-size="13">Controller A (SPA)</text><text x="165" y="118" text-anchor="middle" class="svg-muted" font-size="12">CPU + mirrored write cache</text>
<rect x="330" y="70" width="290" height="70" rx="8" fill="#ddd6fe"/><text x="475" y="96" text-anchor="middle" class="svg-ink" font-size="13">Controller B (SPB)</text><text x="475" y="118" text-anchor="middle" class="svg-muted" font-size="12">CPU + mirrored write cache</text>
<line x1="310" y1="105" x2="330" y2="105" stroke="#64748b" stroke-width="3"/>
<rect x="20" y="155" width="600" height="40" rx="8" fill="#fde68a"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Storage pool (RAID groups of SSD / NVMe / HDD)</text>
<rect x="20" y="210" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="237" text-anchor="middle" class="svg-ink" font-size="12">LUN 0 DS-ESX01</text>
<rect x="175" y="210" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="245" y="237" text-anchor="middle" class="svg-ink" font-size="12">LUN 1 DS-ESX02</text>
<rect x="330" y="210" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="400" y="237" text-anchor="middle" class="svg-ink" font-size="12">LUN 2 DS-ESX03</text>
<rect x="485" y="210" width="135" height="44" rx="8" fill="#e2e8f0"/><text x="552" y="237" text-anchor="middle" class="svg-muted" font-size="12">free space</text>
</svg><p class="cap">Two controllers share one pool of disks. LUNs are carved from the pool and presented through the front-end ports.</p></div>
<dl class="terms">
<dt>Front-end ports</dt><dd>The Fibre Channel (or iSCSI) ports that face the SAN. Each has its own WWPN, for example ARRAY1 spa0 = 50:06:01:60:3e:a0:12:34. These are the <b>targets</b> you will zone to.</dd>
<dt>Controllers (storage processors)</dt><dd>Usually two, called SPA and SPB or node 1 and node 2. Each runs the array software, owns a share of the LUNs, and mirrors its write cache to the partner so a controller failure loses nothing.</dd>
<dt>Cache</dt><dd>Fast memory that absorbs writes. The array acknowledges a write once it is in two cache copies (protected by batteries or flash), then destages it to disk later. This is why arrays feel faster than their disks.</dd>
<dt>Back end, RAID groups and pools</dt><dd>Disks are grouped with RAID (you know RAID from the basics chapter) and the groups are combined into a <b>pool</b>. Capacity for LUNs comes from the pool, spread across many disks.</dd>
<dt>LUN</dt><dd>A block volume carved from the pool and presented to hosts. It has a small <b>LUN ID</b> (0, 1, 2) that the host sees on each path, and a globally unique <b>NAA ID</b> (naa.6…) that multipathing uses to recognise the same LUN on different paths.</dd>
</dl>

<h3>Controller models: who may serve a LUN</h3>
<p>In an <b>active/active symmetric</b> array, both controllers serve every LUN equally. In an <b>active/passive</b> array, only the owning controller serves a LUN; the other takes over after a failure. Most mid-range arrays today are <b>asymmetric active/active</b> and report path preference with <b>ALUA</b> (asymmetric logical unit access): paths through the owning controller are "active/optimized", paths through the partner are "active/non-optimized". Chapter 8 shows how host multipathing uses this.</p>

<h3>Thick and thin provisioning</h3>
<p>A <b>thick</b> LUN reserves all its capacity in the pool at creation time. A <b>thin</b> LUN only consumes pool space when the host actually writes data. Thin provisioning lets you promise more capacity than you physically have, which is efficient, but it must be monitored.</p>
<div class="eg"><p><b>Worked example: oversubscription.</b> A pool has 100 TB usable. The team creates ten thin LUNs of 15 TB each: provisioned capacity = 150 TB, so the pool is <b>150% subscribed</b>. Hosts have written 62 TB, so the pool is 62% used. If each host grows by 1 TB a month, when is the pool full? 100 − 62 = 38 TB are left, and 10 hosts × 1 TB = 10 TB per month, so in about <b>3.8 months</b>. Set alerts at 70% and 85% used, and order disks before the second alert.</p></div>
<p>Arrays also save space with <b>deduplication</b> (store identical blocks once) and <b>compression</b>. On all-flash arrays a data-reduction ratio of 3:1 or more for VM workloads is common, but databases that are already compressed or encrypted reduce much less.</p>

<h3>Snapshots, clones and replication (concept level)</h3>
<ul>
<li><b>Snapshot</b>: a point-in-time view of a LUN, created in seconds. Modern arrays use <i>redirect-on-write</i> (new writes go to new blocks; the snapshot keeps pointers to the old ones) or <i>copy-on-write</i> (old blocks are copied aside before being overwritten). Snapshots live on the same array, so they protect against mistakes and ransomware on the host, not against losing the array.</li>
<li><b>Clone</b>: a full, independent copy of a LUN, for example to give developers a copy of production data.</li>
<li><b>Synchronous replication</b>: every write is sent to a second array and acknowledged by both before the host gets its acknowledgement. <b>RPO</b> (how much data you can lose) is zero, but the latency grows with distance, so it is used over short distances (typically tens of kilometres, a few milliseconds).</li>
<li><b>Asynchronous replication</b>: writes are sent to the remote array in batches. Distance is unlimited, but the RPO is seconds to minutes.</li>
</ul>
<p>Replication traffic runs between arrays over FC ISLs or IP links. As a SAN engineer you will be asked to zone the replication ports, just like host ports.</p>

<h3>Recap: block, file and object in one table</h3>
<table class="cmp"><tr><th></th><th>Block (SAN)</th><th>File (NAS)</th><th>Object</th></tr>
<tr><td>Host sees</td><td>A disk (LUN or namespace)</td><td>A shared folder</td><td>Buckets and objects via API</td></tr>
<tr><td>File system owned by</td><td>The host (VMFS, NTFS, XFS)</td><td>The storage system</td><td>No file system; flat namespace</td></tr>
<tr><td>Protocols</td><td>FC, FCoE, iSCSI, NVMe-oF</td><td>NFS, SMB</td><td>S3-compatible REST</td></tr>
<tr><td>Access control</td><td>Zoning + LUN masking</td><td>Export rules, share permissions</td><td>Keys and bucket policies</td></tr>
<tr><td>Typical use</td><td>Databases, VM datastores, boot from SAN</td><td>Home folders, shared content, NFS datastores</td><td>Backups, media, data lakes</td></tr>
</table>

<h3>What the array shows</h3>
<p>In the labs ARRAY1 has a small CLI. These are the three views you will use most:</p>
<pre class="out">ARRAY1&gt; show luns
LUN  Name              Size     NAA ID                                 Masked to
---  ----------------  -------  -------------------------------------  ---------
0    DS-ESX01          500 GB   naa.600601603ea01234000000000000000    1 initiator(s)
<span class="hl">2    DS-ESX03          1000 GB  naa.600601603ea01234000000000000002    none</span></pre>
<p>The highlighted line is a LUN that exists but is masked to nobody: no host can see it yet, no matter how perfect the zoning is. <code>show masking</code> lists which initiator WWPN may see which LUN, and <code>show initiators</code> lists the host ports that are logged in to the array right now.</p>

<div class="warn"><p><b>Common mistakes.</b> Letting a thin pool fill up: when a thin pool reaches 100%, writes fail and many hypervisors pause every VM on those LUNs. Treating snapshots as backups: if the array or site is lost, its snapshots are lost too. Masking a LUN to only one HBA of a two-HBA host, which silently removes path redundancy.</p></div>
<div class="exam"><p><b>Exam tip.</b> Zoning controls which ports can talk; LUN masking controls which LUNs a port can see. Synchronous replication gives RPO zero but is distance-limited; asynchronous has no distance limit but a non-zero RPO.</p></div>

<div class="scn"><h4>Monday morning: every VM paused</h4><p>At 07:40 the monitoring wall turned red: 180 VMs on one cluster showed "paused, no space left". The hosts and the SAN fabric were healthy; every path was active. The storage engineer opened the array and saw the thin pool at 100% used: a weekend database load had written 9 TB more than planned, and the only pool alert had been sent to an old mailbox. She added a disk shelf, expanded the pool, and the VMs resumed. The follow-up actions were alerts at 70% and 85% to the team channel, and a monthly capacity review.</p><p><b>Lesson:</b> thin provisioning moves the risk from "wasted space" to "sudden outage"; it only works with monitoring.</p></div>

<div class="iv"><p class="q">"What is the difference between thin and thick provisioning, and what is the risk of thin?"</p><p>Strong answer: thick reserves all capacity at creation; thin consumes pool space only as data is written, so you can oversubscribe the pool. The risk is pool exhaustion: when the pool is full, writes fail for every thin LUN in it. Mention the mitigation: subscription and usage alerts, capacity trending, and space reclamation (UNMAP) so deleted data returns to the pool. Bonus: explain that a snapshot is not a backup because it lives on the same array.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An array has front-end target ports, two controllers with mirrored cache, and a back-end pool built from RAID groups.</li>
<li>A LUN has a small LUN ID seen by the host and a unique NAA ID used by multipathing.</li>
<li>Thin provisioning allows oversubscription; monitor pool usage or a full pool will stop every VM.</li>
<li>Snapshots are fast and local; replication copies data to another array, synchronously (RPO 0, short distance) or asynchronously.</li>
<li>Block, file and object differ in who owns the file system and how access is controlled.</li>
</ul></div>
`,hi:`
<p>Network banane se pehle dekho uske doosre sire par kya baitha hai. <b>Storage array</b> ek specialised computer hai jiska ek hi kaam hai: blocks ko safely store karna aur fast serve karna. Ise ek bank vault samjho jahan duty par do managers hain: customers (servers) kabhi vault mein nahi jaate; woh apni request counter (front-end port) par dete hain, manager (controller) shelves (disks) se item laata hai, aur har item kam se kam do jagah rakha jaata hai.</p>

<h3>Array ki anatomy</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Storage array ki anatomy">
<rect x="20" y="15" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Front-end ports: spa0, spa1 | spb0, spb1 (fabric A aur B tak)</text>
<rect x="20" y="70" width="290" height="70" rx="8" fill="#ddd6fe"/><text x="165" y="96" text-anchor="middle" class="svg-ink" font-size="13">Controller A (SPA)</text><text x="165" y="118" text-anchor="middle" class="svg-muted" font-size="12">CPU + mirrored write cache</text>
<rect x="330" y="70" width="290" height="70" rx="8" fill="#ddd6fe"/><text x="475" y="96" text-anchor="middle" class="svg-ink" font-size="13">Controller B (SPB)</text><text x="475" y="118" text-anchor="middle" class="svg-muted" font-size="12">CPU + mirrored write cache</text>
<line x1="310" y1="105" x2="330" y2="105" stroke="#64748b" stroke-width="3"/>
<rect x="20" y="155" width="600" height="40" rx="8" fill="#fde68a"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Storage pool (SSD / NVMe / HDD ke RAID groups)</text>
<rect x="20" y="210" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="237" text-anchor="middle" class="svg-ink" font-size="12">LUN 0 DS-ESX01</text>
<rect x="175" y="210" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="245" y="237" text-anchor="middle" class="svg-ink" font-size="12">LUN 1 DS-ESX02</text>
<rect x="330" y="210" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="400" y="237" text-anchor="middle" class="svg-ink" font-size="12">LUN 2 DS-ESX03</text>
<rect x="485" y="210" width="135" height="44" rx="8" fill="#e2e8f0"/><text x="552" y="237" text-anchor="middle" class="svg-muted" font-size="12">khaali space</text>
</svg><p class="cap">Do controllers disks ka ek pool share karte hain. LUNs pool se kaate jaate hain aur front-end ports se present hote hain.</p></div>
<dl class="terms">
<dt>Front-end ports</dt><dd>Fibre Channel (ya iSCSI) ports jo SAN ki taraf hain. Har ek ka apna WWPN hota hai, jaise ARRAY1 spa0 = 50:06:01:60:3e:a0:12:34. Yahi <b>targets</b> hain jinhe aap zone karoge.</dd>
<dt>Controllers (storage processors)</dt><dd>Aam taur par do, jinhe SPA aur SPB ya node 1 aur node 2 kehte hain. Har ek array software chalata hai, LUNs ka ek hissa own karta hai, aur apna write cache partner ko mirror karta hai taaki controller failure mein kuch na khoye.</dd>
<dt>Cache</dt><dd>Fast memory jo writes ko absorb karti hai. Array write ko tab acknowledge karta hai jab woh do cache copies mein ho (batteries ya flash se protected), phir baad mein use disk par destage karta hai. Isiliye arrays apni disks se tez lagte hain.</dd>
<dt>Back end, RAID groups aur pools</dt><dd>Disks RAID se group hoti hain (RAID aap basics chapter se jaante ho) aur groups ko milakar ek <b>pool</b> banta hai. LUNs ki capacity pool se aati hai, bahut saari disks par faili hui.</dd>
<dt>LUN</dt><dd>Pool se kaata gaya block volume jo hosts ko present hota hai. Iska ek chhota <b>LUN ID</b> (0, 1, 2) hota hai jo host har path par dekhta hai, aur ek globally unique <b>NAA ID</b> (naa.6…) jisse multipathing alag paths par same LUN pehchanti hai.</dd>
</dl>

<h3>Controller models: LUN kaun serve kar sakta hai</h3>
<p><b>Active/active symmetric</b> array mein dono controllers har LUN ko barabar serve karte hain. <b>Active/passive</b> array mein sirf owning controller LUN serve karta hai; doosra failure ke baad take over karta hai. Aaj zyada tar mid-range arrays <b>asymmetric active/active</b> hain aur path preference <b>ALUA</b> (asymmetric logical unit access) se report karte hain: owning controller ke through paths "active/optimized" hain, partner ke through paths "active/non-optimized". Chapter 8 dikhata hai host multipathing ise kaise use karti hai.</p>

<h3>Thick aur thin provisioning</h3>
<p><b>Thick</b> LUN create hote hi apni poori capacity pool mein reserve kar leta hai. <b>Thin</b> LUN pool space tabhi leta hai jab host sach mein data likhta hai. Thin provisioning aapko physically jitna hai usse zyada capacity promise karne deta hai, jo efficient hai, lekin iski monitoring zaroori hai.</p>
<div class="eg"><p><b>Worked example: oversubscription.</b> Ek pool mein 100 TB usable hai. Team 15 TB ke das thin LUNs banati hai: provisioned capacity = 150 TB, yaani pool <b>150% subscribed</b> hai. Hosts ne 62 TB likha hai, to pool 62% used hai. Agar har host mahine mein 1 TB badhta hai, to pool kab full hoga? 100 − 62 = 38 TB bacha hai, aur 10 hosts × 1 TB = 10 TB har mahina, to lagbhag <b>3.8 mahine</b> mein. 70% aur 85% used par alerts lagao, aur doosre alert se pehle disks order karo.</p></div>
<p>Arrays <b>deduplication</b> (same blocks ek hi baar store karna) aur <b>compression</b> se bhi space bachate hain. All-flash arrays par VM workloads ke liye 3:1 ya zyada ka data-reduction ratio common hai, lekin jo databases pehle se compressed ya encrypted hain woh bahut kam reduce hote hain.</p>

<h3>Snapshots, clones aur replication (concept level)</h3>
<ul>
<li><b>Snapshot</b>: LUN ka point-in-time view, seconds mein banta hai. Modern arrays <i>redirect-on-write</i> (nayi writes naye blocks par jaati hain; snapshot purane blocks ke pointers rakhta hai) ya <i>copy-on-write</i> (overwrite hone se pehle purane blocks side mein copy hote hain) use karte hain. Snapshots usi array par rehte hain, isliye woh host par galtiyon aur ransomware se bachate hain, array khone se nahi.</li>
<li><b>Clone</b>: LUN ki poori, independent copy, jaise developers ko production data ki copy dena.</li>
<li><b>Synchronous replication</b>: har write doosre array tak bheja jaata hai aur host ko acknowledgement milne se pehle dono acknowledge karte hain. <b>RPO</b> (kitna data kho sakte ho) zero hai, lekin distance ke saath latency badhti hai, isliye yeh chhoti doori par use hota hai (aam taur par kuch dasiyon kilometre, kuch milliseconds).</li>
<li><b>Asynchronous replication</b>: writes remote array tak batches mein jaati hain. Distance ki koi limit nahi, lekin RPO seconds se minutes hota hai.</li>
</ul>
<p>Replication traffic arrays ke beech FC ISLs ya IP links par chalta hai. SAN engineer ki tarah aapse replication ports ko bhi zone karne ko kaha jaayega, bilkul host ports ki tarah.</p>

<h3>Recap: block, file aur object ek table mein</h3>
<table class="cmp"><tr><th></th><th>Block (SAN)</th><th>File (NAS)</th><th>Object</th></tr>
<tr><td>Host ko dikhta hai</td><td>Ek disk (LUN ya namespace)</td><td>Ek shared folder</td><td>API se buckets aur objects</td></tr>
<tr><td>File system kiska</td><td>Host ka (VMFS, NTFS, XFS)</td><td>Storage system ka</td><td>Koi file system nahi; flat namespace</td></tr>
<tr><td>Protocols</td><td>FC, FCoE, iSCSI, NVMe-oF</td><td>NFS, SMB</td><td>S3-compatible REST</td></tr>
<tr><td>Access control</td><td>Zoning + LUN masking</td><td>Export rules, share permissions</td><td>Keys aur bucket policies</td></tr>
<tr><td>Typical use</td><td>Databases, VM datastores, boot from SAN</td><td>Home folders, shared content, NFS datastores</td><td>Backups, media, data lakes</td></tr>
</table>

<h3>Array kya dikhata hai</h3>
<p>Labs mein ARRAY1 ki ek chhoti CLI hai. Yeh teen views aap sabse zyada use karoge:</p>
<pre class="out">ARRAY1&gt; show luns
LUN  Name              Size     NAA ID                                 Masked to
---  ----------------  -------  -------------------------------------  ---------
0    DS-ESX01          500 GB   naa.600601603ea01234000000000000000    1 initiator(s)
<span class="hl">2    DS-ESX03          1000 GB  naa.600601603ea01234000000000000002    none</span></pre>
<p>Highlighted line ek aisa LUN hai jo exist karta hai lekin kisi ko masked nahi hai: koi host use abhi nahi dekh sakta, zoning chahe kitni bhi perfect ho. <code>show masking</code> batata hai kaunsa initiator WWPN kaunsa LUN dekh sakta hai, aur <code>show initiators</code> un host ports ki list deta hai jo abhi array mein logged in hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Thin pool ko full hone dena: jab thin pool 100% par pahunchta hai, writes fail hoti hain aur kai hypervisors un LUNs ki har VM ko pause kar dete hain. Snapshots ko backups samajhna: agar array ya site kho gayi, to uske snapshots bhi kho jaate hain. Do-HBA wale host ke sirf ek HBA ko LUN mask karna, jo chupchaap path redundancy khatam kar deta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Zoning control karti hai ki kaunse ports baat kar sakte hain; LUN masking control karti hai ki ek port kaunse LUNs dekh sakta hai. Synchronous replication RPO zero deta hai par distance-limited hai; asynchronous ki distance limit nahi par RPO non-zero hai.</p></div>

<div class="scn"><h4>Monday subah: har VM paused</h4><p>Subah 07:40 par monitoring wall laal ho gayi: ek cluster ki 180 VMs "paused, no space left" dikha rahi thi. Hosts aur SAN fabric healthy the; har path active tha. Storage engineer ne array khola aur thin pool 100% used paaya: weekend ke ek database load ne plan se 9 TB zyada likh diya tha, aur pool ka akela alert ek purane mailbox mein ja raha tha. Usne ek disk shelf jodi, pool expand kiya, aur VMs resume ho gayi. Follow-up actions the team channel par 70% aur 85% ke alerts, aur har mahine capacity review.</p><p><b>Seekh:</b> thin provisioning risk ko "wasted space" se "achanak outage" mein badal deta hai; yeh sirf monitoring ke saath kaam karta hai.</p></div>

<div class="iv"><p class="q">"Thin aur thick provisioning mein kya farak hai, aur thin ka risk kya hai?"</p><p>Strong answer: thick create hote hi poori capacity reserve karta hai; thin pool space sirf data likhe jaane par leta hai, isliye aap pool ko oversubscribe kar sakte ho. Risk pool exhaustion hai: pool full hone par us pool ke har thin LUN ki writes fail hoti hain. Mitigation batao: subscription aur usage alerts, capacity trending, aur space reclamation (UNMAP) taaki deleted data pool mein wapas aaye. Bonus: samjhao ki snapshot backup nahi hai kyunki woh usi array par rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Array mein front-end target ports, mirrored cache wale do controllers, aur RAID groups se bana back-end pool hota hai.</li>
<li>LUN ka ek chhota LUN ID hota hai jo host dekhta hai aur ek unique NAA ID jo multipathing use karti hai.</li>
<li>Thin provisioning oversubscription allow karta hai; pool usage monitor karo warna full pool har VM rok dega.</li>
<li>Snapshots fast aur local hain; replication data doosre array par copy karti hai, synchronously (RPO 0, chhoti doori) ya asynchronously.</li>
<li>Block, file aur object is baat mein alag hain ki file system kiska hai aur access kaise control hota hai.</li>
</ul></div>
`}};export{e as default};