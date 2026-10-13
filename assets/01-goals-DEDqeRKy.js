var e={id:`goals`,h:{en:`What you will learn: the SAN inside the data center`,hi:`Aap kya seekhoge: data center ke andar SAN`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to build a Fibre Channel SAN fabric on a Cisco MDS switch from an empty configuration, create VSANs, log hosts and arrays in, write single-initiator zones with device aliases, activate them safely in basic and enhanced zoning mode, design a dual-fabric SAN with correct multipathing, explain NPV, NPIV, FCoE, iSCSI, NFS and NVMe over Fabrics, and troubleshoot the classic ticket: <i>"the server is logged in, but it sees no disks"</i>. This is section 3.0 (Storage network) of the CCNP Data Center core exam, and it is also the daily work of a SAN or data center engineer.</p>

<p><b>Prerequisites.</b> You have read the storage basics chapter of the data center introduction, so you already know RAID, LUNs, block vs file vs object, and DAS vs NAS vs SAN. You should also be comfortable with a switch CLI (configure terminal, interfaces, show commands) and know what a VLAN is. You do not need any previous Fibre Channel experience; every FC term is defined the first time it appears.</p>

<h3>An analogy: the SAN is a private courier network for disks</h3>
<p>In the storage basics chapter we called storage the hotel luggage room. Now zoom in on how bags actually travel. Imagine the hotel has its own <b>private courier service</b> that only carries luggage: separate corridors, separate lifts, guards who check every tag, and two completely independent courier teams so that one strike never stops delivery. Guests never share these corridors with room service. That private courier network is the <b>SAN</b> (storage area network). The luggage room is the <b>storage array</b>. The courier corridors and guards are the <b>SAN switches</b>, and in this module those switches are <b>Cisco MDS</b>.</p>

<h3>Where the SAN sits in the data center</h3>
<p>A typical server in a modern data center has two kinds of network ports. Its Ethernet NICs connect to the <b>LAN</b> (leaf and spine switches) for application traffic. Its <b>HBAs</b> (host bus adapters, the Fibre Channel "network cards") connect to the <b>SAN</b>. The LAN carries users and APIs; the SAN carries disk reads and writes. They are built, operated and changed separately, because a mistake on the SAN freezes every database and virtual machine at the same time.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology used in this module">
<rect x="20" y="15" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="95" y="36" text-anchor="middle" class="svg-ink" font-size="13">ESX01</text><text x="95" y="53" text-anchor="middle" class="svg-muted" font-size="12">HBA1 + HBA2</text>
<rect x="245" y="15" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">ESX02</text><text x="320" y="53" text-anchor="middle" class="svg-muted" font-size="12">HBA1</text>
<rect x="470" y="15" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="36" text-anchor="middle" class="svg-ink" font-size="13">ESX03</text><text x="545" y="53" text-anchor="middle" class="svg-muted" font-size="12">HBA1</text>
<rect x="60" y="120" width="200" height="50" rx="8" fill="#bae6fd"/><text x="160" y="142" text-anchor="middle" class="svg-ink" font-size="13">MDS-A (fabric A)</text><text x="160" y="160" text-anchor="middle" class="svg-muted" font-size="12">VSAN 10, domain 0x0a</text>
<rect x="380" y="120" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="480" y="142" text-anchor="middle" class="svg-ink" font-size="13">MDS-B (fabric B)</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">VSAN 20, domain 0x14</text>
<line x1="95" y1="61" x2="140" y2="120" stroke="#64748b" stroke-width="2"/><line x1="120" y1="61" x2="440" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="320" y1="61" x2="190" y2="120" stroke="#64748b" stroke-width="2"/><line x1="545" y1="61" x2="230" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="225" width="240" height="56" rx="8" fill="#fde68a"/><text x="320" y="248" text-anchor="middle" class="svg-ink" font-size="13">ARRAY1</text><text x="320" y="266" text-anchor="middle" class="svg-muted" font-size="12">spa0 (fabric A) / spb0 (fabric B)</text>
<line x1="160" y1="170" x2="260" y2="225" stroke="#64748b" stroke-width="2"/><line x1="480" y1="170" x2="380" y2="225" stroke="#64748b" stroke-width="2"/>
<text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="12">A and B are never connected</text>
</svg><p class="cap">The lab network used in every chapter. Solid lines are fabric A; the dashed line is ESX01's second HBA going to fabric B.</p></div>

<h3>The lab world you will meet again and again</h3>
<p>All chapters use the same small data center, so you can connect theory directly to the five hands-on labs:</p>
<table class="cmp"><tr><th>Device</th><th>Role</th><th>Key facts</th></tr>
<tr><td><b>MDS-A</b></td><td>Fabric A switch</td><td>VSAN 10 "FABRIC-A", domain ID 0x0a, zoneset ZS-FABRIC-A</td></tr>
<tr><td><b>MDS-B</b></td><td>Fabric B switch</td><td>VSAN 20 "FABRIC-B", domain ID 0x14, zoneset ZS-FABRIC-B</td></tr>
<tr><td><b>ESX01</b></td><td>VMware host, two HBAs</td><td>vmhba1 20:00:00:25:b5:aa:00:01 (A), vmhba2 20:00:00:25:b5:bb:00:01 (B)</td></tr>
<tr><td><b>ESX02 / ESX03</b></td><td>Hosts added later</td><td>20:00:00:25:b5:aa:00:02 on fc1/2, 20:00:00:25:b5:aa:00:03 on fc1/3</td></tr>
<tr><td><b>ARRAY1</b></td><td>Storage array</td><td>spa0 50:06:01:60:3e:a0:12:34 on fc1/5, spb0 50:06:01:68:3e:a0:12:34; LUN 0, 1, 2</td></tr>
</table>

<h3>The six gates: the mental model for this whole module</h3>
<p>For a server to read a LUN, its I/O must pass six gates, in order. Every chapter explains one or more gates, and the troubleshooting chapter walks them top to bottom.</p>
<ol>
<li><b>Physical link</b>: cable, optics and speed; the switch port is up.</li>
<li><b>Fabric login (FLOGI)</b>: the HBA logs in and receives an address.</li>
<li><b>Right VSAN</b>: host and array port are in the same virtual fabric.</li>
<li><b>Zoning</b>: an active zone allows this initiator to talk to this target.</li>
<li><b>LUN masking</b>: the array presents this LUN to this initiator's WWPN.</li>
<li><b>Host rescan and multipathing</b>: the OS discovers the LUN on every path.</li>
</ol>

<div class="eg"><p><b>Worked example: counting the work for one new host.</b> A new host with two HBAs needs a 2 TB datastore. On the fabric side that is: 2 switch ports configured (one per fabric), 2 device aliases per fabric (host HBA and array port) = 4 aliases, 2 zones (one per fabric), 2 zoneset activations. On the array: 1 LUN created and masked to 2 WWPNs. On the host: 1 rescan, then check that the LUN shows 2 paths (or 4, if each HBA is zoned to two array ports). Ten small changes, and any one of them can be the reason the ticket fails.</p></div>

<h3>Module map</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Lab</th></tr>
<tr><td>2 to 4</td><td>Arrays, Fibre Channel basics, addressing and login</td><td>Lab 1 (fabric login)</td></tr>
<tr><td>5 to 7</td><td>VSANs, zoning, a complete MDS change</td><td>Labs 1 and 2</td></tr>
<tr><td>8 to 10</td><td>Dual-fabric design, NPV/NPIV, Ethernet storage</td><td>Lab 3 (fabric B)</td></tr>
<tr><td>11 to 12</td><td>Troubleshooting, summary and exam checklist</td><td>Labs 4 and 5 (tickets)</td></tr>
</table>

<div class="warn"><p><b>Common beginner mistake.</b> Treating the SAN like a LAN. On a LAN, a wrong VLAN usually affects a few users and you fix it in minutes. On a SAN, one wrong zoneset activation can remove the disks of hundreds of VMs at once. SAN engineers therefore work with change windows, pre-checks, and a verification step after every command that matters.</p></div>
<div class="exam"><p><b>Exam tip.</b> The CCNP Data Center core exam tests Fibre Channel concepts (addressing, login, port types), VSANs, zoning (including enhanced zoning and device aliases), NPV/NPIV, FCoE with DCB, and when to use FC, FCoE, iSCSI or NFS. Expect command-output questions: know what <code>show flogi database</code>, <code>show fcns database</code> and <code>show zoneset active</code> look like.</p></div>

<div class="scn"><h4>The first week on the SAN team</h4><p>A network engineer moved to the storage team and received a simple request: "give the new ESX07 host access to datastore DS-07". He zoned the host on fabric A, saw the host log in, and closed the ticket. Two days later a firmware upgrade on MDS-A caused a planned reload, and ESX07 lost every VM because fabric B had never been zoned and the array had only masked the LUN to one HBA. The senior engineer showed him the six gates and a checklist: both fabrics, both HBAs in masking, and proof of two active paths on the host before closing any ticket.</p><p><b>Lesson:</b> a SAN request is only done when every gate is passed on both fabrics and the host shows all expected paths.</p></div>

<div class="iv"><p class="q">"Walk me through what has to happen before a server can use a LUN on a Fibre Channel SAN."</p><p>Strong answer: follow the gates. The HBA link comes up and the port logs in to the fabric (FLOGI) and gets an FCID; the port must be in the same VSAN as the array; the host registers with the name server; an active zone must contain the host WWPN and the array port WWPN; the array must mask the LUN to the host WWPN; finally the host rescans and multipathing software sees the LUN on paths through both fabrics. Mentioning both fabric A and fabric B, and the difference between zoning (switch) and masking (array), shows real experience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The SAN is a dedicated storage network: servers connect with HBAs, arrays with target ports, and Cisco MDS switches form the fabric.</li>
<li>Production SANs are two independent fabrics, A and B; in our lab MDS-A uses VSAN 10 and MDS-B uses VSAN 20.</li>
<li>A host reaches a LUN only after six gates: link, FLOGI, VSAN, zoning, LUN masking, host rescan and multipathing.</li>
<li>Zoning is done on the switch; LUN masking is done on the array; you need both.</li>
<li>SAN changes affect many servers at once, so every change needs verification on both fabrics.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap ek khaali configuration se Cisco MDS switch par Fibre Channel SAN fabric bana paoge, VSANs create kar paoge, hosts aur arrays ko login karwa paoge, device aliases ke saath single-initiator zones likh paoge, unhe basic aur enhanced zoning mode mein safely activate kar paoge, sahi multipathing ke saath dual-fabric SAN design kar paoge, NPV, NPIV, FCoE, iSCSI, NFS aur NVMe over Fabrics samjha paoge, aur classic ticket troubleshoot kar paoge: <i>"server logged in hai, par use koi disk nahi dikh rahi"</i>. Yeh CCNP Data Center core exam ka section 3.0 (Storage network) hai, aur yahi ek SAN ya data center engineer ka roz ka kaam bhi hai.</p>

<p><b>Prerequisites.</b> Aap data center introduction ka storage basics chapter padh chuke ho, isliye aapko RAID, LUNs, block vs file vs object, aur DAS vs NAS vs SAN pehle se pata hai. Aapko switch CLI (configure terminal, interfaces, show commands) mein comfortable hona chahiye aur pata hona chahiye ki VLAN kya hota hai. Pehle ka koi Fibre Channel experience nahi chahiye; har FC term pehli baar aate hi define kiya gaya hai.</p>

<h3>Ek analogy: SAN disks ke liye private courier network hai</h3>
<p>Storage basics chapter mein humne storage ko hotel ka luggage room kaha tha. Ab zoom karo ki bags asal mein kaise travel karte hain. Socho hotel ki apni <b>private courier service</b> hai jo sirf luggage le jaati hai: alag corridors, alag lifts, guards jo har tag check karte hain, aur do bilkul independent courier teams taaki ek strike se delivery kabhi na ruke. Guests in corridors ko room service ke saath share nahi karte. Wahi private courier network <b>SAN</b> (storage area network) hai. Luggage room <b>storage array</b> hai. Courier corridors aur guards <b>SAN switches</b> hain, aur is module mein woh switches <b>Cisco MDS</b> hain.</p>

<h3>Data center mein SAN kahan baithta hai</h3>
<p>Modern data center ke ek typical server mein do tarah ke network ports hote hain. Uske Ethernet NICs application traffic ke liye <b>LAN</b> (leaf aur spine switches) se judte hain. Uske <b>HBAs</b> (host bus adapters, Fibre Channel ke "network cards") <b>SAN</b> se judte hain. LAN users aur APIs ka traffic le jaata hai; SAN disk reads aur writes le jaata hai. Dono alag se banaye, chalaye aur change kiye jaate hain, kyunki SAN par ek galti har database aur virtual machine ko ek saath freeze kar deti hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Is module ka lab topology">
<rect x="20" y="15" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="95" y="36" text-anchor="middle" class="svg-ink" font-size="13">ESX01</text><text x="95" y="53" text-anchor="middle" class="svg-muted" font-size="12">HBA1 + HBA2</text>
<rect x="245" y="15" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">ESX02</text><text x="320" y="53" text-anchor="middle" class="svg-muted" font-size="12">HBA1</text>
<rect x="470" y="15" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="36" text-anchor="middle" class="svg-ink" font-size="13">ESX03</text><text x="545" y="53" text-anchor="middle" class="svg-muted" font-size="12">HBA1</text>
<rect x="60" y="120" width="200" height="50" rx="8" fill="#bae6fd"/><text x="160" y="142" text-anchor="middle" class="svg-ink" font-size="13">MDS-A (fabric A)</text><text x="160" y="160" text-anchor="middle" class="svg-muted" font-size="12">VSAN 10, domain 0x0a</text>
<rect x="380" y="120" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="480" y="142" text-anchor="middle" class="svg-ink" font-size="13">MDS-B (fabric B)</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">VSAN 20, domain 0x14</text>
<line x1="95" y1="61" x2="140" y2="120" stroke="#64748b" stroke-width="2"/><line x1="120" y1="61" x2="440" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="320" y1="61" x2="190" y2="120" stroke="#64748b" stroke-width="2"/><line x1="545" y1="61" x2="230" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="225" width="240" height="56" rx="8" fill="#fde68a"/><text x="320" y="248" text-anchor="middle" class="svg-ink" font-size="13">ARRAY1</text><text x="320" y="266" text-anchor="middle" class="svg-muted" font-size="12">spa0 (fabric A) / spb0 (fabric B)</text>
<line x1="160" y1="170" x2="260" y2="225" stroke="#64748b" stroke-width="2"/><line x1="480" y1="170" x2="380" y2="225" stroke="#64748b" stroke-width="2"/>
<text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="12">A aur B kabhi jude nahi hote</text>
</svg><p class="cap">Har chapter mein use hone wala lab network. Solid lines fabric A hain; dashed line ESX01 ka doosra HBA hai jo fabric B par jaata hai.</p></div>

<h3>Lab ki duniya jo aapko baar baar milegi</h3>
<p>Saare chapters ek hi chhota data center use karte hain, taaki aap theory ko seedha paanch hands-on labs se jod sako:</p>
<table class="cmp"><tr><th>Device</th><th>Role</th><th>Key facts</th></tr>
<tr><td><b>MDS-A</b></td><td>Fabric A switch</td><td>VSAN 10 "FABRIC-A", domain ID 0x0a, zoneset ZS-FABRIC-A</td></tr>
<tr><td><b>MDS-B</b></td><td>Fabric B switch</td><td>VSAN 20 "FABRIC-B", domain ID 0x14, zoneset ZS-FABRIC-B</td></tr>
<tr><td><b>ESX01</b></td><td>VMware host, do HBAs</td><td>vmhba1 20:00:00:25:b5:aa:00:01 (A), vmhba2 20:00:00:25:b5:bb:00:01 (B)</td></tr>
<tr><td><b>ESX02 / ESX03</b></td><td>Baad mein jude hosts</td><td>20:00:00:25:b5:aa:00:02 fc1/2 par, 20:00:00:25:b5:aa:00:03 fc1/3 par</td></tr>
<tr><td><b>ARRAY1</b></td><td>Storage array</td><td>spa0 50:06:01:60:3e:a0:12:34 fc1/5 par, spb0 50:06:01:68:3e:a0:12:34; LUN 0, 1, 2</td></tr>
</table>

<h3>Chhe gates: poore module ka mental model</h3>
<p>Server ko ek LUN padhne ke liye uske I/O ko chhe gates, order mein, paar karne padte hain. Har chapter ek ya zyada gates samjhata hai, aur troubleshooting chapter unhe upar se neeche walk karta hai.</p>
<ol>
<li><b>Physical link</b>: cable, optics aur speed; switch port up hai.</li>
<li><b>Fabric login (FLOGI)</b>: HBA login karta hai aur use ek address milta hai.</li>
<li><b>Sahi VSAN</b>: host aur array port ek hi virtual fabric mein hain.</li>
<li><b>Zoning</b>: ek active zone is initiator ko is target se baat karne deti hai.</li>
<li><b>LUN masking</b>: array yeh LUN is initiator ke WWPN ko present karta hai.</li>
<li><b>Host rescan aur multipathing</b>: OS har path par LUN discover karta hai.</li>
</ol>

<div class="eg"><p><b>Worked example: ek naye host ka kaam ginna.</b> Do HBAs wale ek naye host ko 2 TB datastore chahiye. Fabric side par yeh hai: 2 switch ports configure (har fabric mein ek), har fabric mein 2 device aliases (host HBA aur array port) = 4 aliases, 2 zones (har fabric mein ek), 2 zoneset activations. Array par: 1 LUN create aur 2 WWPNs ko masked. Host par: 1 rescan, phir check karo ki LUN 2 paths dikhata hai (ya 4, agar har HBA do array ports se zoned hai). Das chhote changes, aur inmein se koi bhi ek ticket fail hone ki wajah ho sakta hai.</p></div>

<h3>Module map</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Lab</th></tr>
<tr><td>2 se 4</td><td>Arrays, Fibre Channel basics, addressing aur login</td><td>Lab 1 (fabric login)</td></tr>
<tr><td>5 se 7</td><td>VSANs, zoning, ek poora MDS change</td><td>Labs 1 aur 2</td></tr>
<tr><td>8 se 10</td><td>Dual-fabric design, NPV/NPIV, Ethernet storage</td><td>Lab 3 (fabric B)</td></tr>
<tr><td>11 se 12</td><td>Troubleshooting, summary aur exam checklist</td><td>Labs 4 aur 5 (tickets)</td></tr>
</table>

<div class="warn"><p><b>Beginners ki common galti.</b> SAN ko LAN ki tarah treat karna. LAN par galat VLAN aam taur par kuch users ko affect karta hai aur aap minutes mein fix kar lete ho. SAN par ek galat zoneset activation sainkdon VMs ki disks ek saath hata sakta hai. Isliye SAN engineers change windows, pre-checks, aur har important command ke baad verification step ke saath kaam karte hain.</p></div>
<div class="exam"><p><b>Exam tip.</b> CCNP Data Center core exam Fibre Channel concepts (addressing, login, port types), VSANs, zoning (enhanced zoning aur device aliases ke saath), NPV/NPIV, DCB ke saath FCoE, aur FC, FCoE, iSCSI ya NFS kab use karna hai, test karta hai. Command-output questions expect karo: pata hona chahiye ki <code>show flogi database</code>, <code>show fcns database</code> aur <code>show zoneset active</code> kaise dikhte hain.</p></div>

<div class="scn"><h4>SAN team par pehla hafta</h4><p>Ek network engineer storage team mein shift hua aur use ek simple request mili: "naye ESX07 host ko datastore DS-07 ka access do". Usne host ko fabric A par zone kiya, host ko login hote dekha, aur ticket close kar diya. Do din baad MDS-A par firmware upgrade ki wajah se planned reload hua, aur ESX07 ne har VM kho diya kyunki fabric B kabhi zone hi nahi hua tha aur array ne LUN sirf ek HBA ko mask kiya tha. Senior engineer ne use chhe gates aur ek checklist dikhayi: dono fabrics, masking mein dono HBAs, aur koi bhi ticket close karne se pehle host par do active paths ka proof.</p><p><b>Seekh:</b> SAN request tabhi done hai jab dono fabrics par har gate paar ho aur host saare expected paths dikhaye.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki Fibre Channel SAN par server LUN use kar sake, usse pehle kya kya hona chahiye."</p><p>Strong answer: gates follow karo. HBA link up hota hai aur port fabric mein login (FLOGI) karke FCID leta hai; port array wale VSAN mein hi hona chahiye; host name server mein register hota hai; ek active zone mein host WWPN aur array port WWPN dono hone chahiye; array ko LUN host WWPN ko mask karna chahiye; aakhir mein host rescan karta hai aur multipathing software dono fabrics ke paths par LUN dekhta hai. Fabric A aur fabric B dono ka zikr, aur zoning (switch) vs masking (array) ka farak batana real experience dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SAN ek dedicated storage network hai: servers HBAs se judte hain, arrays target ports se, aur Cisco MDS switches fabric banate hain.</li>
<li>Production SANs do independent fabrics, A aur B, hote hain; hamare lab mein MDS-A VSAN 10 aur MDS-B VSAN 20 use karta hai.</li>
<li>Host LUN tak tabhi pahunchta hai jab chhe gates paar hon: link, FLOGI, VSAN, zoning, LUN masking, host rescan aur multipathing.</li>
<li>Zoning switch par hoti hai; LUN masking array par hoti hai; dono chahiye.</li>
<li>SAN changes ek saath bahut servers ko affect karte hain, isliye har change ko dono fabrics par verify karna zaroori hai.</li>
</ul></div>
`}};export{e as default};