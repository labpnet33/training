var e={id:`networks-devices-tags`,h:{en:`Networks, devices, claiming and tags`,hi:`Networks, devices, claiming aur tags`},body:{en:`
<h3>A network is a unit of configuration</h3>
<p>In a cloud-managed dashboard a <b>network</b> is not a cable or a subnet. It is a <i>container of settings and devices</i>, normally one per physical site. Bharat Retail Co has three: <code>mum</code> (Mumbai HQ), <code>blr</code> (Bengaluru Branch) and <code>del</code> (Delhi Branch). Each network has its own VLAN subnets, firewall rules, SSIDs and device list. When you pick a network at the top of the page (the network picker), every page below it shows that site's settings.</p>
<p>Why one network per site? Because things like "the VLAN 10 subnet" or "the uplink" are different in each city, and the dashboard needs a clean boundary for them. The Overview and Networks pages give you the organization-wide view; the other pages work inside the network you picked.</p>

<h3>Claiming devices by serial number</h3>
<p>Every device has a unique <b>serial number</b> printed on the label. To add a device to your estate you <b>claim</b> it: you enter the serial (or order number) into the dashboard and choose the network it belongs to. The dashboard now knows "this serial is ours". When the device is powered on at the branch and finds the internet, it contacts the cloud, proves its serial, and downloads its configuration. This is why it is called zero-touch: nobody needs to log in to the box locally.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Claim by serial and first boot">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#fde68a"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">1. Claim serial</text><text x="105" y="63" text-anchor="middle" class="svg-muted" font-size="12">in organization inventory</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">2. Add to network</text><text x="320" y="63" text-anchor="middle" class="svg-muted" font-size="12">e.g. blr, set name and tags</text>
<rect x="450" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">3. Plug in at site</text><text x="535" y="63" text-anchor="middle" class="svg-muted" font-size="12">power and uplink</text>
<line x1="190" y1="50" x2="235" y2="50" stroke="#64748b" stroke-width="2"/><line x1="405" y1="50" x2="450" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="80" x2="535" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="130" width="420" height="70" rx="8" fill="#bbf7d0"/><text x="410" y="157" text-anchor="middle" class="svg-ink" font-size="13">4. Device reaches the dashboard, shows online,</text><text x="410" y="177" text-anchor="middle" class="svg-ink" font-size="13">downloads its configuration</text>
</svg><p class="cap">Claim first, plug in later. The serial number is the identity.</p></div>

<h3>Inventory: what do we own and where is it?</h3>
<p>The organization <b>inventory</b> lists every claimed device with its serial, model family, name, network and status. It answers audit questions ("how many switches do we own?") and loss questions ("which network is serial Q2XX-AAAA in?"). In the simulator you see the same facts on the Networks page and the Overview.</p>
<pre class="out">Inventory  (organization 1001)
Name       Serial          Type        Network   Tags            Status
MX-MUM     Q2MX-0001-MUM   appliance   mum       hub             online
SW-MUM     Q2SW-0001-MUM   switch      mum       core            online
AP-MUM     Q2AP-0001-MUM   wireless    mum       floor1          online
MX-BLR     Q2MX-0002-BLR   appliance   blr       spoke           online
AP-BLR     Q2AP-0002-BLR   wireless    blr       <span class="hl">store</span>           online
AP-DEL     Q2AP-0003-DEL   wireless    del       floor2          online</pre>
<p>Serial values above are made up for teaching. A real serial is on the device label.</p>

<h3>Tags: sticky notes you can search and target</h3>
<p>A <b>tag</b> is a short label you attach to a device (or a network). Tags carry no behaviour by themselves; they are a way to <i>group</i> things. Later modules use them for real work: the wireless module can make an SSID available only on access points tagged <code>store</code> or <code>floor1</code> (that is called availability by tag). Good tags describe a stable property: role (<code>core</code>, <code>spoke</code>), location inside the site (<code>floor1</code>), or purpose (<code>store</code>).</p>

<h3>Naming: make a name answer the question without a lookup</h3>
<p>A name like <code>AP-BLR</code> tells you device type, and city in six characters. Good naming rules are boring on purpose: <b>TYPE-CITY</b> (or <b>TYPE-CITY-NUMBER</b> when there are many), the same pattern everywhere, no personal names, no "new" or "temp". At 3 a.m. the alert says "SW-DEL offline" and you already know which city to call.</p>
<table class="cmp"><tr><th>Good</th><th>Poor</th><th>Why</th></tr>
<tr><td>SW-DEL</td><td>Atul-switch-new</td><td>Type and city are visible; personal names go stale</td></tr>
<tr><td>AP-MUM-02</td><td>AP2</td><td>Number tells which of several; city is not lost</td></tr>
<tr><td>floor1</td><td>FLOOR 1 (new)</td><td>Tags should be short, lower-case and stable</td></tr>
</table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Claiming, renaming and tagging change only the dashboard's records: they do not alter forwarding. The device downloads a new configuration only when a setting that affects it changes. Moving a device to a different network, however, changes which settings it receives, so treat that as a real change.</p></div>

<div class="warn"><p><b>Common mistake.</b> Claiming a device into the wrong network. It will show online but pull the wrong site's VLANs and subnets, and the branch ends up with Mumbai addressing. Always check the network picker before claiming.</p></div>
<div class="exam"><p><b>Exam trap.</b> The serial number, not the IP address, identifies a device to the cloud. A device that is claimed but never powered on shows as not yet seen, not as a fault.</p></div>

<div class="scn"><h4>A switch that went to the wrong city</h4><p>A courier delivered a switch meant for Delhi to Bengaluru. Because devices are claimed by serial, the team simply plugged it in at Bengaluru, saw it appear under the <code>del</code> network as online with Delhi VLANs, and realised the mistake from the name SW-DEL. They moved the claim to <code>blr</code> in the dashboard, renamed the device, and Delhi received a new unit. No one needed to log in to the box.</p><p><b>Lesson:</b> identity is the serial; the dashboard decides where a device belongs, so the network assignment is a deliberate act.</p></div>

<div class="iv"><p class="q">"How do you deploy 20 new access points across branches with nobody on site who knows networking?"</p><p>Strong answer: claim them by serial in the dashboard, assign each to the right network, set names and tags in advance, and ship them. On site, a non-technical person only mounts and plugs in; the device finds the dashboard and pulls its configuration. Mention verifying online status and tags afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A network is a container of settings and devices, usually one per site (mum, blr, del).</li>
<li>Devices are claimed by serial number and pull configuration when they first reach the cloud.</li>
<li>Inventory is the organization-wide list of devices and their networks.</li>
<li>Tags group devices for later targeting; names should follow TYPE-CITY.</li>
<li>Claiming, naming and tagging do not change forwarding; moving networks changes the config received.</li>
</ul></div>
`,hi:`
<h3>Network configuration ki ek unit hai</h3>
<p>Cloud-managed dashboard mein <b>network</b> koi cable ya subnet nahi hota. Yeh settings aur devices ka <i>container</i> hai, aam taur par ek physical site ke liye ek. Bharat Retail Co ke paas teen hain: <code>mum</code> (Mumbai HQ), <code>blr</code> (Bengaluru Branch) aur <code>del</code> (Delhi Branch). Har network ke apne VLAN subnets, firewall rules, SSIDs aur device list hoti hain. Jab aap page ke upar network picker se ek network chunte ho, to uske neeche ke har page par us site ki settings dikhti hain.</p>
<p>Har site ke liye ek network kyun? Kyunki "VLAN 10 ka subnet" ya "uplink" jaisi cheezein har sheher mein alag hoti hain, aur dashboard ko unke liye saaf boundary chahiye. Overview aur Networks page organization-wide view dete hain; baaki pages aapke chune hue network ke andar kaam karte hain.</p>

<h3>Serial number se devices claim karna</h3>
<p>Har device ka ek unique <b>serial number</b> label par chhapa hota hai. Device ko apne estate mein jodne ke liye aap use <b>claim</b> karte ho: serial (ya order number) dashboard mein daalte ho aur woh network chunte ho jisse woh belong karta hai. Ab dashboard ko pata hai "yeh serial humara hai". Jab device branch par power on hota hai aur internet milta hai, woh cloud se contact karta hai, apna serial prove karta hai aur apni configuration download kar leta hai. Isiliye ise zero-touch kehte hain: box mein locally login karne ki zaroorat nahi.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Serial se claim aur pehla boot">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#fde68a"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">1. Claim serial</text><text x="105" y="63" text-anchor="middle" class="svg-muted" font-size="12">organization inventory mein</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">2. Network mein add</text><text x="320" y="63" text-anchor="middle" class="svg-muted" font-size="12">jaise blr, name aur tags</text>
<rect x="450" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">3. Site par plug in</text><text x="535" y="63" text-anchor="middle" class="svg-muted" font-size="12">power aur uplink</text>
<line x1="190" y1="50" x2="235" y2="50" stroke="#64748b" stroke-width="2"/><line x1="405" y1="50" x2="450" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="535" y1="80" x2="535" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="130" width="420" height="70" rx="8" fill="#bbf7d0"/><text x="410" y="157" text-anchor="middle" class="svg-ink" font-size="13">4. Device dashboard tak pahunchta hai, online dikhta hai,</text><text x="410" y="177" text-anchor="middle" class="svg-ink" font-size="13">aur apni configuration download karta hai</text>
</svg><p class="cap">Pehle claim, baad mein plug in. Serial number hi identity hai.</p></div>

<h3>Inventory: humare paas kya hai aur kahan hai?</h3>
<p>Organization <b>inventory</b> har claimed device ko serial, model family, name, network aur status ke saath list karti hai. Yeh audit sawaalon ("humare paas kitne switches hain?") aur kho jaane ke sawaalon ("serial Q2XX-AAAA kis network mein hai?") ka jawab deti hai. Simulator mein yahi facts aap Networks page aur Overview par dekhte ho.</p>
<pre class="out">Inventory  (organization 1001)
Name       Serial          Type        Network   Tags            Status
MX-MUM     Q2MX-0001-MUM   appliance   mum       hub             online
SW-MUM     Q2SW-0001-MUM   switch      mum       core            online
AP-MUM     Q2AP-0001-MUM   wireless    mum       floor1          online
MX-BLR     Q2MX-0002-BLR   appliance   blr       spoke           online
AP-BLR     Q2AP-0002-BLR   wireless    blr       <span class="hl">store</span>           online
AP-DEL     Q2AP-0003-DEL   wireless    del       floor2          online</pre>
<p>Upar ki serial values sirf padhane ke liye banayi gayi hain. Real serial device ke label par hota hai.</p>

<h3>Tags: sticky notes jinhe search aur target kar sakte ho</h3>
<p><b>Tag</b> ek chhota label hai jo aap device (ya network) par lagate ho. Tags ka khud koi behaviour nahi hota; yeh cheezon ko <i>group</i> karne ka tareeka hain. Baad ke modules inhe asli kaam ke liye use karte hain: wireless module ek SSID ko sirf un access points par available bana sakta hai jinka tag <code>store</code> ya <code>floor1</code> hai (ise availability by tag kehte hain). Achhe tags stable property batate hain: role (<code>core</code>, <code>spoke</code>), site ke andar location (<code>floor1</code>), ya purpose (<code>store</code>).</p>

<h3>Naming: naam aisa ho ki bina lookup ke jawab de</h3>
<p><code>AP-BLR</code> jaisa naam chhe characters mein device type aur sheher bata deta hai. Achhe naming rules jaanboojh kar boring hote hain: <b>TYPE-CITY</b> (ya bahut devices hon to <b>TYPE-CITY-NUMBER</b>), har jagah same pattern, koi personal naam nahi, "new" ya "temp" nahi. Raat 3 baje alert bolta hai "SW-DEL offline" aur aapko pehle se pata hai kis sheher ko call karna hai.</p>
<table class="cmp"><tr><th>Achha</th><th>Kharab</th><th>Kyun</th></tr>
<tr><td>SW-DEL</td><td>Atul-switch-new</td><td>Type aur city dikhte hain; personal naam purane ho jaate hain</td></tr>
<tr><td>AP-MUM-02</td><td>AP2</td><td>Number batata hai kaunsa, aur city khoti nahi</td></tr>
<tr><td>floor1</td><td>FLOOR 1 (new)</td><td>Tags chhote, lower-case aur stable hone chahiye</td></tr>
</table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Claim, rename aur tag karna sirf dashboard ke records badalta hai: forwarding nahi badalti. Device nayi configuration tabhi download karta hai jab uski koi setting badalti hai. Lekin device ko dusre network mein move karne se woh settings badal jaati hain jo use milti hain, isliye ise real change maano.</p></div>

<div class="warn"><p><b>Common galti.</b> Device ko galat network mein claim kar dena. Woh online dikhega lekin galat site ke VLANs aur subnets kheench lega, aur branch ko Mumbai ka addressing mil jayega. Claim se pehle hamesha network picker check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Cloud ko device ki pehchaan serial number se hoti hai, IP address se nahi. Jo device claim ho gaya lekin kabhi power on nahi hua, woh "abhi tak dekha nahi gaya" dikhta hai, fault nahi.</p></div>

<div class="scn"><h4>Switch jo galat sheher chala gaya</h4><p>Courier ne Delhi ke liye bana switch Bengaluru deliver kar diya. Devices serial se claim hote hain, isliye team ne use Bengaluru mein plug in kar diya, dekha ki woh <code>del</code> network ke neeche Delhi VLANs ke saath online aaya, aur naam SW-DEL se galti samajh gayi. Unhone dashboard mein claim ko <code>blr</code> mein move kiya, device rename kiya, aur Delhi ko nayi unit mili. Box mein kisi ko login nahi karna pada.</p><p><b>Seekh:</b> identity serial hai; device kahan belong karta hai yeh dashboard decide karta hai, isliye network assignment soch samajh kar kiya jaane wala kaam hai.</p></div>

<div class="iv"><p class="q">"20 naye access points branches mein kaise deploy karoge jab site par koi networking jaanne wala nahi hai?"</p><p>Strong answer: unhe dashboard mein serial se claim karo, har ek ko sahi network mein assign karo, names aur tags pehle se set karo, aur ship kar do. Site par non-technical insaan sirf mount karke plug in karta hai; device dashboard dhoondh leta hai aur apni configuration kheench leta hai. Baad mein online status aur tags verify karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network settings aur devices ka container hai, aam taur par ek site ke liye ek (mum, blr, del).</li>
<li>Devices serial number se claim hote hain aur cloud tak pahunchte hi configuration kheench lete hain.</li>
<li>Inventory devices aur unke networks ki organization-wide list hai.</li>
<li>Tags devices ko baad mein target karne ke liye group karte hain; naam TYPE-CITY follow karein.</li>
<li>Claim, naming aur tagging forwarding nahi badalte; network badalne se milne wali config badalti hai.</li>
</ul></div>
`}};export{e as default};