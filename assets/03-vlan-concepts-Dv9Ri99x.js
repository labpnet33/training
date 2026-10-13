var e={id:`vlan-concepts`,h:{en:`VLAN concepts, types and number ranges`,hi:`VLAN concepts, types aur number ranges`},body:{en:`
<p>Think of a large apartment building with one lift. The lift is shared, but each resident's key card only opens the doors on their own floor. The building is physical and shared; the separation is created by rules. A VLAN is the same idea inside a switch: the hardware is shared, but the switch follows a strict rule that frames only move between ports of the <b>same VLAN</b>.</p>

<h3>What a VLAN really is</h3>
<p>A <b>VLAN</b> is a Layer 2 broadcast domain defined in software. Every switch port is assigned to a VLAN (VLAN 1 until you change it). When a frame arrives, the switch tags it internally with the port's VLAN and then applies the learn, forward, flood and filter rules from chapter 2 <b>only among ports of that VLAN</b>:</p>
<ul>
<li>MAC addresses are learned per VLAN. The MAC table is effectively one table per VLAN, keyed by VLAN plus MAC.</li>
<li>Broadcasts and unknown unicasts are flooded only to other ports in the same VLAN.</li>
<li>A frame is never switched from one VLAN into another. Crossing VLANs requires routing.</li>
</ul>
<p>The result: one physical switch behaves like several separate logical switches.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="One physical switch containing two logical switches, VLAN 10 and VLAN 20">
<rect x="60" y="20" width="520" height="140" rx="10" fill="#e2e8f0"/>
<text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">SW1: one physical switch</text>
<rect x="90" y="60" width="210" height="80" rx="8" fill="#bbf7d0"/><text x="195" y="92" text-anchor="middle" class="svg-ink" font-size="14">VLAN 10 SALES</text><text x="195" y="114" text-anchor="middle" class="svg-muted" font-size="12">own MAC table, own floods</text>
<rect x="340" y="60" width="210" height="80" rx="8" fill="#ddd6fe"/><text x="445" y="92" text-anchor="middle" class="svg-ink" font-size="14">VLAN 20 ACCOUNTS</text><text x="445" y="114" text-anchor="middle" class="svg-muted" font-size="12">own MAC table, own floods</text>
<text x="320" y="104" text-anchor="middle" class="svg-accent" font-size="18">X</text>
<rect x="60" y="190" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="110" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC1 Gi0/1</text>
<rect x="180" y="190" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="230" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC2 Gi0/2</text>
<rect x="360" y="190" width="100" height="36" rx="8" fill="#ddd6fe"/><text x="410" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC3 Gi0/3</text>
<rect x="480" y="190" width="100" height="36" rx="8" fill="#ddd6fe"/><text x="530" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC4 Gi0/4</text>
<line x1="110" y1="190" x2="160" y2="140" stroke="#64748b" stroke-width="2"/><line x1="230" y1="190" x2="220" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="190" x2="420" y2="140" stroke="#64748b" stroke-width="2"/><line x1="530" y1="190" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The lab-1 switch: one box, two logical switches. Nothing is switched across the X between them.</p></div>

<h3>One VLAN, one subnet</h3>
<p>The golden design rule is <b>one VLAN = one broadcast domain = one IP subnet</b>. Engineers often make the numbers easy to read, for example VLAN 10 uses 10.10.10.0/24 and VLAN 20 uses 10.20.20.0/24. The rule matters because hosts decide how to reach a destination by comparing subnets: same subnet means ARP for the host directly; different subnet means send to the default gateway.</p>
<div class="eg"><p><b>Worked example (lab 1, Kaveri Textiles).</b> PC1 192.168.50.11 and PC3 192.168.50.21 are both in 192.168.50.0/24, so PC1 thinks PC3 is local and sends an ARP request. But PC1 is in VLAN 10 and PC3 is in VLAN 20. The switch floods the ARP only inside VLAN 10, PC3 never hears it, and the ping fails. The lab uses one subnet on purpose to prove that the VLAN, not the IP address, decides who can hear whom. In a real design you would give each VLAN its own subnet and a gateway.</p></div>

<h3>VLAN types by purpose</h3>
<dl class="terms">
<dt>Default VLAN</dt><dd>VLAN 1. Every port starts in it. It cannot be deleted or renamed.</dd>
<dt>Data (user) VLAN</dt><dd>Carries traffic from PCs and servers, for example VLAN 10 SALES.</dd>
<dt>Voice VLAN</dt><dd>Carries IP phone traffic so it can be prioritised (chapter 5).</dd>
<dt>Management VLAN</dt><dd>The VLAN of the switch's own management IP address (an SVI such as <code>interface vlan 99</code>). It should not be VLAN 1 and should not contain users.</dd>
<dt>Native VLAN</dt><dd>The VLAN sent untagged on an 802.1Q trunk (chapter 8). Default 1.</dd>
<dt>Parking (black-hole) VLAN</dt><dd>An unused VLAN where unused ports are placed, shut down, so that plugging into a spare port gives no access.</dd>
</dl>

<h3>VLAN number ranges</h3>
<p>The 802.1Q VLAN ID field is 12 bits, so the values are 0 to 4095. Two are reserved, leaving 1 to 4094 usable.</p>
<table class="cmp"><tr><th>Range</th><th>Name</th><th>What to know</th></tr>
<tr><td>0 and 4095</td><td>Reserved</td><td>Never usable. VID 0 means "priority tag only, no VLAN".</td></tr>
<tr><td>1</td><td>Default</td><td>Every port starts here. Cannot be deleted or renamed. Many control protocols (CDP, DTP, VTP, PAgP) use it.</td></tr>
<tr><td>2 to 1001</td><td>Normal range</td><td>Your everyday VLANs. Stored in <code>flash:vlan.dat</code>. Advertised by VTP versions 1, 2 and 3.</td></tr>
<tr><td>1002 to 1005</td><td>Legacy reserved</td><td>Created automatically for FDDI and Token Ring (<code>act/unsup</code>). Cannot be deleted or used for Ethernet.</td></tr>
<tr><td>1006 to 4094</td><td>Extended range</td><td>Usable on modern switches. Only VTP version 3 can advertise them; with VTP 1 or 2 most Catalyst switches need VTP transparent (or off) mode to create them.</td></tr>
</table>

<h3>Where VLANs are stored</h3>
<p>This surprises many people. In VTP server or client mode, normal-range VLANs live in a separate file, <code>flash:vlan.dat</code>, <b>not</b> in the startup-config. In VTP transparent or off mode the switch also writes VLANs into the running-config. So <code>erase startup-config</code> followed by <code>reload</code> clears interface settings but can leave all the old VLANs in place. To wipe a lab switch completely, also run <code>delete flash:vlan.dat</code> before the reload.</p>

<h3>Static and dynamic membership</h3>
<p>In this module you assign VLANs <b>statically</b>: a port belongs to the VLAN you configure. Larger networks also use <b>dynamic</b> assignment, where an authentication server (802.1X with RADIUS) tells the switch which VLAN to place a user in after login. The switching behaviour is the same; only the way the VLAN is chosen changes.</p>

<div class="warn"><p><b>Common mistake.</b> Leaving everything in VLAN 1 and also using VLAN 1 for management. VLAN 1 exists on every port and every trunk by default, so it is the easiest VLAN for an attacker to reach. Move users and management out of it.</p></div>

<div class="exam"><p><b>Exam trap.</b> "VLAN 1 can be deleted after all ports are moved." False: VLAN 1 and VLANs 1002 to 1005 can never be deleted. Also remember that the usable range is 1 to 4094, not 1 to 4096.</p></div>

<div class="scn"><h4>Ghost VLANs on a reused switch</h4><p>An engineer took a switch from the lab rack for a new branch. He ran <code>erase startup-config</code>, reloaded, configured the branch VLANs 10 and 20 and shipped it. At the branch, <code>show vlan brief</code> also showed VLANs 300 to 320 from old lab exercises, and one of them had the same number as the branch's camera VLAN with a wrong name. The old VLANs had survived because they were in <code>flash:vlan.dat</code>. The fix was <code>delete flash:vlan.dat</code>, a reload and a clean rebuild; the team added that step to their switch-staging checklist.</p><p><b>Lesson:</b> the VLAN database is separate from the startup-config; clean both when you repurpose a switch.</p></div>

<div class="iv"><p class="q">"What is the difference between the default VLAN, the native VLAN and the management VLAN?"</p><p>Strong answer: the default VLAN is VLAN 1, where every port starts and which cannot be deleted. The native VLAN is the VLAN carried untagged on a particular 802.1Q trunk; it defaults to 1 but should be changed to an unused VLAN. The management VLAN is the VLAN of the switch's own SVI used for SSH and monitoring. They can all be the same number by default, which is exactly why best practice separates them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VLAN is a software broadcast domain; switching happens only among ports of the same VLAN.</li>
<li>Design rule: one VLAN, one subnet. Hosts in different VLANs need a router even if their IPs look alike.</li>
<li>Usable VLANs 1 to 4094; normal 1 to 1005 (1002 to 1005 reserved), extended 1006 to 4094.</li>
<li>VLAN 1 and 1002 to 1005 cannot be deleted; VLAN 1 cannot be renamed.</li>
<li>Normal-range VLANs are stored in flash:vlan.dat, not only in the startup-config.</li>
</ul></div>
`,hi:`
<p>Ek badi apartment building socho jisme ek lift hai. Lift shared hai, par har resident ka key card sirf uske apne floor ke darwaze kholta hai. Building physical aur shared hai; alag-pan rules se banta hai. Switch ke andar VLAN bhi yahi idea hai: hardware shared hai, par switch ek sakht rule follow karta hai ki frames sirf <b>same VLAN</b> ke ports ke beech chalte hain.</p>

<h3>VLAN asal mein kya hai</h3>
<p><b>VLAN</b> software mein define kiya gaya Layer 2 broadcast domain hai. Har switch port ek VLAN ko assign hota hai (jab tak aap na badlo, VLAN 1). Jab frame aata hai, switch use andar hi port ke VLAN se tag karta hai aur phir chapter 2 ke learn, forward, flood aur filter rules <b>sirf us VLAN ke ports ke beech</b> lagata hai:</p>
<ul>
<li>MAC addresses per VLAN seekhe jaate hain. MAC table asal mein har VLAN ke liye ek table hai, VLAN plus MAC se keyed.</li>
<li>Broadcasts aur unknown unicasts sirf usi VLAN ke doosre ports par flood hote hain.</li>
<li>Frame kabhi ek VLAN se doosre VLAN mein switch nahi hota. VLAN cross karne ke liye routing chahiye.</li>
</ul>
<p>Result: ek physical switch kai alag logical switches ki tarah behave karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Ek physical switch jiske andar do logical switches, VLAN 10 aur VLAN 20">
<rect x="60" y="20" width="520" height="140" rx="10" fill="#e2e8f0"/>
<text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">SW1: ek physical switch</text>
<rect x="90" y="60" width="210" height="80" rx="8" fill="#bbf7d0"/><text x="195" y="92" text-anchor="middle" class="svg-ink" font-size="14">VLAN 10 SALES</text><text x="195" y="114" text-anchor="middle" class="svg-muted" font-size="12">apni MAC table, apne floods</text>
<rect x="340" y="60" width="210" height="80" rx="8" fill="#ddd6fe"/><text x="445" y="92" text-anchor="middle" class="svg-ink" font-size="14">VLAN 20 ACCOUNTS</text><text x="445" y="114" text-anchor="middle" class="svg-muted" font-size="12">apni MAC table, apne floods</text>
<text x="320" y="104" text-anchor="middle" class="svg-accent" font-size="18">X</text>
<rect x="60" y="190" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="110" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC1 Gi0/1</text>
<rect x="180" y="190" width="100" height="36" rx="8" fill="#bbf7d0"/><text x="230" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC2 Gi0/2</text>
<rect x="360" y="190" width="100" height="36" rx="8" fill="#ddd6fe"/><text x="410" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC3 Gi0/3</text>
<rect x="480" y="190" width="100" height="36" rx="8" fill="#ddd6fe"/><text x="530" y="213" text-anchor="middle" class="svg-ink" font-size="12">PC4 Gi0/4</text>
<line x1="110" y1="190" x2="160" y2="140" stroke="#64748b" stroke-width="2"/><line x1="230" y1="190" x2="220" y2="140" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="190" x2="420" y2="140" stroke="#64748b" stroke-width="2"/><line x1="530" y1="190" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1 ka switch: ek box, do logical switches. Unke beech ke X ke paar kuch switch nahi hota.</p></div>

<h3>Ek VLAN, ek subnet</h3>
<p>Golden design rule hai <b>ek VLAN = ek broadcast domain = ek IP subnet</b>. Engineers aksar numbers ko padhne mein aasaan banate hain, jaise VLAN 10 10.10.10.0/24 use kare aur VLAN 20 10.20.20.0/24. Yeh rule isliye matter karta hai kyunki hosts subnets compare karke decide karte hain ki destination tak kaise pahunchein: same subnet matlab seedha host ke liye ARP; alag subnet matlab default gateway ko bhejo.</p>
<div class="eg"><p><b>Worked example (lab 1, Kaveri Textiles).</b> PC1 192.168.50.11 aur PC3 192.168.50.21 dono 192.168.50.0/24 mein hain, isliye PC1 sochta hai ki PC3 local hai aur ARP request bhejta hai. Par PC1 VLAN 10 mein hai aur PC3 VLAN 20 mein. Switch ARP ko sirf VLAN 10 ke andar flood karta hai, PC3 use kabhi nahi sunta, aur ping fail hota hai. Lab jaan boojh kar ek subnet use karta hai yeh prove karne ke liye ki kaun kise sun sakta hai yeh VLAN decide karta hai, IP address nahi. Real design mein aap har VLAN ko uska apna subnet aur gateway doge.</p></div>

<h3>Purpose ke hisaab se VLAN types</h3>
<dl class="terms">
<dt>Default VLAN</dt><dd>VLAN 1. Har port isi mein start hota hai. Ise delete ya rename nahi kar sakte.</dd>
<dt>Data (user) VLAN</dt><dd>PCs aur servers ka traffic carry karta hai, jaise VLAN 10 SALES.</dd>
<dt>Voice VLAN</dt><dd>IP phone ka traffic carry karta hai taaki use priority mil sake (chapter 5).</dd>
<dt>Management VLAN</dt><dd>Switch ke apne management IP address ka VLAN (ek SVI jaise <code>interface vlan 99</code>). Yeh VLAN 1 nahi hona chahiye aur isme users nahi hone chahiye.</dd>
<dt>Native VLAN</dt><dd>Woh VLAN jo 802.1Q trunk par untagged bheja jaata hai (chapter 8). Default 1.</dd>
<dt>Parking (black-hole) VLAN</dt><dd>Ek unused VLAN jahan unused ports shutdown karke rakhe jaate hain, taaki spare port mein plug karne se koi access na mile.</dd>
</dl>

<h3>VLAN number ranges</h3>
<p>802.1Q VLAN ID field 12 bits ka hai, isliye values 0 se 4095 hain. Do reserved hain, to 1 se 4094 usable bachte hain.</p>
<table class="cmp"><tr><th>Range</th><th>Naam</th><th>Kya jaanna hai</th></tr>
<tr><td>0 aur 4095</td><td>Reserved</td><td>Kabhi usable nahi. VID 0 ka matlab "sirf priority tag, koi VLAN nahi".</td></tr>
<tr><td>1</td><td>Default</td><td>Har port yahin start hota hai. Delete ya rename nahi hota. Kai control protocols (CDP, DTP, VTP, PAgP) ise use karte hain.</td></tr>
<tr><td>2 se 1001</td><td>Normal range</td><td>Aapke roz ke VLANs. <code>flash:vlan.dat</code> mein store hote hain. VTP versions 1, 2 aur 3 inhe advertise karte hain.</td></tr>
<tr><td>1002 se 1005</td><td>Legacy reserved</td><td>FDDI aur Token Ring ke liye automatically bante hain (<code>act/unsup</code>). Delete ya Ethernet ke liye use nahi ho sakte.</td></tr>
<tr><td>1006 se 4094</td><td>Extended range</td><td>Modern switches par usable. Sirf VTP version 3 inhe advertise kar sakta hai; VTP 1 ya 2 ke saath zyada tar Catalyst switches ko inhe banane ke liye VTP transparent (ya off) mode chahiye.</td></tr>
</table>

<h3>VLANs kahan store hote hain</h3>
<p>Yeh baat kai logon ko surprise karti hai. VTP server ya client mode mein normal-range VLANs ek alag file, <code>flash:vlan.dat</code>, mein rehte hain, startup-config mein <b>nahi</b>. VTP transparent ya off mode mein switch VLANs ko running-config mein bhi likhta hai. Isliye <code>erase startup-config</code> ke baad <code>reload</code> interface settings to saaf kar deta hai par saare purane VLANs waise hi chhod sakta hai. Lab switch ko poori tarah wipe karne ke liye reload se pehle <code>delete flash:vlan.dat</code> bhi chalao.</p>

<h3>Static aur dynamic membership</h3>
<p>Is module mein aap VLANs <b>statically</b> assign karte ho: port usi VLAN ka hota hai jo aap configure karte ho. Bade networks <b>dynamic</b> assignment bhi use karte hain, jahan authentication server (RADIUS ke saath 802.1X) login ke baad switch ko batata hai ki user ko kis VLAN mein daalna hai. Switching behaviour same rehta hai; sirf VLAN choose karne ka tareeka badalta hai.</p>

<div class="warn"><p><b>Common galti.</b> Sab kuch VLAN 1 mein chhodna aur management ke liye bhi VLAN 1 use karna. Default mein VLAN 1 har port aur har trunk par exist karta hai, isliye attacker ke liye yahi sabse aasaan VLAN hai. Users aur management ko isse bahar nikalo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Saare ports hatane ke baad VLAN 1 delete ho sakta hai." Galat: VLAN 1 aur VLANs 1002 se 1005 kabhi delete nahi ho sakte. Yeh bhi yaad rakho ki usable range 1 se 4094 hai, 1 se 4096 nahi.</p></div>

<div class="scn"><h4>Reused switch par ghost VLANs</h4><p>Ek engineer ne nayi branch ke liye lab rack se ek switch liya. Usne <code>erase startup-config</code> chalaya, reload kiya, branch VLANs 10 aur 20 configure kiye aur ship kar diya. Branch par <code>show vlan brief</code> mein purani lab exercises ke VLANs 300 se 320 bhi dikhe, aur unme se ek ka number branch ke camera VLAN jaisa tha par naam galat tha. Purane VLANs isliye bache the kyunki woh <code>flash:vlan.dat</code> mein the. Fix tha <code>delete flash:vlan.dat</code>, reload aur clean rebuild; team ne yeh step apni switch-staging checklist mein jod diya.</p><p><b>Seekh:</b> VLAN database startup-config se alag hai; switch ko dobara use karte waqt dono saaf karo.</p></div>

<div class="iv"><p class="q">"Default VLAN, native VLAN aur management VLAN mein kya fark hai?"</p><p>Strong answer: default VLAN VLAN 1 hai, jahan har port start hota hai aur jo delete nahi hota. Native VLAN woh VLAN hai jo kisi particular 802.1Q trunk par untagged carry hota hai; default 1 hai par ise kisi unused VLAN mein badalna chahiye. Management VLAN switch ke apne SVI ka VLAN hai jo SSH aur monitoring ke liye use hota hai. Default mein teeno same number ho sakte hain, aur isiliye best practice inhe alag karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLAN software broadcast domain hai; switching sirf same VLAN ke ports ke beech hoti hai.</li>
<li>Design rule: ek VLAN, ek subnet. Alag VLANs ke hosts ko router chahiye, chahe unke IPs ek jaise dikhein.</li>
<li>Usable VLANs 1 se 4094; normal 1 se 1005 (1002 se 1005 reserved), extended 1006 se 4094.</li>
<li>VLAN 1 aur 1002 se 1005 delete nahi hote; VLAN 1 rename nahi hota.</li>
<li>Normal-range VLANs flash:vlan.dat mein store hote hain, sirf startup-config mein nahi.</li>
</ul></div>
`}};export{e as default};