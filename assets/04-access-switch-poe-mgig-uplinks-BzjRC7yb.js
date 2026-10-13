var e={id:`wired`,h:{en:`The wired side: PoE, multigig, uplinks and VLANs`,hi:`Wired side: PoE, multigig, uplinks aur VLANs`},body:{en:`
<p><b>Analogy.</b> Wi-Fi is the last 30 metres of the journey; the wired network is the motorway that feeds it. A brilliant radio design collapses if the cable cannot carry power, or the uplink is a single-lane road.</p>

<h3>The case: Northwind University library</h3>
<p>Northwind University, a fictional campus, is refreshing the library from Wi-Fi 5 to Wi-Fi 6E. The library has 4 floors, 96 APs planned, and 2,800 students at exam time. Each floor closet has two 48-port access switches in a stack. The old switches give 15.4 W per port, the old cabling is Category 5e, and each closet has a single 1 Gbps uplink. The IT director wants to reuse everything possible to save money. Your job is to decide what can stay and what must change.</p>

<h3>PoE: how much power does an AP really need?</h3>
<p><b>Power over Ethernet (PoE)</b> sends electricity over the same twisted pair as data. The standards you must know:</p>
<table class="cmp"><tr><th>Standard</th><th>Common name</th><th>Power at switch port (PSE)</th><th>Power at device (PD)</th></tr>
<tr><td>IEEE 802.3af</td><td>PoE</td><td>15.4 W</td><td>12.95 W</td></tr>
<tr><td>IEEE 802.3at</td><td>PoE+</td><td>30 W</td><td>25.5 W</td></tr>
<tr><td>IEEE 802.3bt Type 3</td><td>PoE++ / 4PPoE</td><td>60 W</td><td>51 W</td></tr>
<tr><td>IEEE 802.3bt Type 4</td><td>PoE++</td><td>90 W</td><td>71.3 W</td></tr>
</table>
<p>Cisco also has the older proprietary <b>UPOE</b> (60 W) and <b>UPOE+</b> (90 W) on some Catalyst switches. Modern Wi-Fi 6E and Wi-Fi 7 APs, with several radios and multigig ports, often need <b>802.3at or 802.3bt</b> to run all their radios. On a lower power class, an AP may boot but disable a radio, reduce spatial streams or turn off USB or the second Ethernet port. The AP datasheet lists exactly what is lost, so read it before you design.</p>

<div class="eg"><p><b>PoE budget worked example.</b> A switch has a total PoE budget of 740 W. If 22 APs each reserve 30 W (802.3at), you need 660 W, which fits with 80 W spare for phones and cameras. If the new APs need 802.3bt at 60 W each, 22 x 60 = 1,320 W, which does <b>not</b> fit. You must lower the number of APs per switch to 12 (720 W), or buy switches with a bigger power supply. Always plan <b>worst-case allocated</b> power, not the typical measured draw, and keep 10 to 20 percent spare.</p></div>
<pre class="out">Switch# show power inline
Available:740.0(w)  Used:660.0(w)  Remaining:80.0(w)
Interface Admin  Oper       Power   Device              Class Max
          (Watts)
Gi1/0/1   auto   on         30.0    AP-LIB-F1-01        4     30.0
<span class="hl">Gi1/0/23  auto   power-deny 0.0     n/a                 n/a   30.0</span></pre>
<p>The highlighted line is what a budget overrun looks like: the port is up as a link but the AP gets no power.</p>

<h3>Multigig (mGig) and cabling</h3>
<p>Wi-Fi 6, 6E and 7 APs can deliver real throughput above 1 Gbps. A 1 Gbps uplink would then be the bottleneck, so Cisco builds APs with <b>2.5 Gbps or 5 Gbps multigig</b> ports (Cisco calls the switch ports mGig, standardised as 2.5GBASE-T and 5GBASE-T). Distance and cable matter: 2.5 and 5 Gbps run to 100 m on Category 5e or better, while 10GBASE-T needs Category 6a for the full 100 m. Cabling rule of thumb: install Category 6a for new runs so that the cable survives two Wi-Fi generations. Do not exceed 90 m of permanent link plus patch cords.</p>

<h3>The chosen design for Northwind</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Northwind library wired design">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Distribution pair</text>
<rect x="60" y="100" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="12">Closet switch A</text><text x="160" y="142" text-anchor="middle" class="svg-ink" font-size="11">mGig, 740 W PoE</text>
<rect x="380" y="100" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="12">Closet switch B</text><text x="480" y="142" text-anchor="middle" class="svg-ink" font-size="11">mGig, 740 W PoE</text>
<line x1="280" y1="50" x2="160" y2="100" stroke="#16a34a" stroke-width="3"/><line x1="300" y1="50" x2="480" y2="100" stroke="#16a34a" stroke-width="3"/>
<line x1="340" y1="50" x2="160" y2="100" stroke="#16a34a" stroke-width="3"/><line x1="360" y1="50" x2="480" y2="100" stroke="#16a34a" stroke-width="3"/>
<circle cx="90" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="90" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="160" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="160" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="230" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="230" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="410" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="410" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="480" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="550" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="550" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<line x1="90" y1="160" x2="90" y2="197" stroke="#f59e0b" stroke-width="2"/><line x1="160" y1="160" x2="160" y2="197" stroke="#f59e0b" stroke-width="2"/><line x1="230" y1="160" x2="230" y2="197" stroke="#f59e0b" stroke-width="2"/>
<line x1="410" y1="160" x2="410" y2="197" stroke="#f59e0b" stroke-width="2"/><line x1="480" y1="160" x2="480" y2="197" stroke="#f59e0b" stroke-width="2"/><line x1="550" y1="160" x2="550" y2="197" stroke="#f59e0b" stroke-width="2"/>
<text x="250" y="86" text-anchor="middle" class="svg-muted" font-size="11">2 x 10G</text>
<text x="10" y="252" class="svg-muted" font-size="11">Green = uplink port-channel. Orange = PoE plus data, mGig, Cat 6a.</text>
</svg><p class="cap">Each closet switch has two 10G uplinks to a redundant distribution pair, and powers the APs over 802.3bt-capable mGig ports.</p></div>
<table class="cmp"><tr><th>Item</th><th>Keep or change</th><th>Reason</th></tr>
<tr><td>15.4 W switches</td><td>Change</td><td>6E APs need 802.3at or bt power</td></tr>
<tr><td>Category 5e</td><td>Keep only where runs are under 90 m and 2.5 G is enough</td><td>Cheap; replace on runs to 5 GbE APs</td></tr>
<tr><td>1 Gbps uplink</td><td>Change to 2 x 10 Gbps</td><td>24 APs at about 1 Gbps peak each = 24 Gbps; 2 x 10 G gives about 1.2 : 1 oversubscription</td></tr>
</table>
<h3>Uplinks and VLANs</h3>
<p>Use a port-channel (LACP) of two or more links to two distribution switches so that no single link or switch outage drops a floor. Prefer a <b>routed access layer</b> or small VLANs: do not stretch one client VLAN across the whole campus, because broadcast traffic wastes airtime. Put <b>AP management</b> on its own VLAN per closet or floor, keep it separate from client VLANs, and trunk client VLANs only where needed (all closets for central switching terminate on the controller, not on the AP switch).</p>

<div class="warn"><p><b>Common mistakes.</b> Budgeting PoE from the AP's average draw rather than the class reservation. Reusing 15.4 W ports for 6E APs and wondering why one radio is off. Forgetting the power supply on the switch: the port count is not the budget.</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.3at gives 30 W at the switch but only 25.5 W at the device. Questions use both numbers; read which end they ask about.</p></div>

<div class="scn"><h4>The half-working 6E rollout</h4><p>A university installed 6E APs on old 802.3at switches with 24 APs per stack. Everything booted, but the 6 GHz radio stayed off on a third of APs and some APs rebooted at night. The power log showed the stack hitting its PoE budget when cleaning crews switched on floor equipment. The fix was to move to switches with larger power supplies, cap APs per switch, and add 10 percent spare budget.</p><p><b>Lesson:</b> a PoE budget is a hard ceiling. Calculate it before purchase.</p></div>

<div class="iv"><p class="q">"What do you check on the access switch before installing Wi-Fi 6E APs?"</p><p>Strong answer: PoE class and total budget per stack, mGig port speed, cabling category and length, uplink size and redundancy, AP management VLAN with DHCP option 43, and QoS trust. Show the arithmetic for budget and uplink oversubscription.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PoE: 802.3af 15.4 W, 802.3at 30 W, 802.3bt 60 W and 90 W at the switch port.</li>
<li>Budget by total supply, worst-case allocation, with 10 to 20 percent spare.</li>
<li>Wi-Fi 6, 6E and 7 APs use 2.5 or 5 Gbps mGig; use Category 6a for new runs.</li>
<li>Use redundant, port-channelled uplinks; size them from peak AP throughput.</li>
<li>Separate AP management VLAN; avoid stretching client VLANs widely.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Wi-Fi safar ke aakhri 30 metre hai; wired network wo motorway hai jo use feed karta hai. Radio design kitna bhi shaandar ho, agar cable power nahi de sakta ya uplink single-lane road hai, to sab dhah jata hai.</p>

<h3>Case: Northwind University library</h3>
<p>Northwind University, ek fictional campus, library ko Wi-Fi 5 se Wi-Fi 6E par refresh kar rahi hai. Library mein 4 floors hain, 96 APs planned hain, aur exam time par 2,800 students hote hain. Har floor closet mein stack mein do 48-port access switches hain. Purane switches har port par 15.4 W dete hain, purani cabling Category 5e hai, aur har closet mein ek hi 1 Gbps uplink hai. IT director paisa bachane ke liye jitna ho sake utna reuse karna chahta hai. Aapka kaam hai decide karna ki kya rahega aur kya badalna padega.</p>

<h3>PoE: AP ko sach mein kitni power chahiye?</h3>
<p><b>Power over Ethernet (PoE)</b> bijli ko data wali hi twisted pair par bhejta hai. Jo standards aapko aane chahiye:</p>
<table class="cmp"><tr><th>Standard</th><th>Common name</th><th>Switch port par power (PSE)</th><th>Device par power (PD)</th></tr>
<tr><td>IEEE 802.3af</td><td>PoE</td><td>15.4 W</td><td>12.95 W</td></tr>
<tr><td>IEEE 802.3at</td><td>PoE+</td><td>30 W</td><td>25.5 W</td></tr>
<tr><td>IEEE 802.3bt Type 3</td><td>PoE++ / 4PPoE</td><td>60 W</td><td>51 W</td></tr>
<tr><td>IEEE 802.3bt Type 4</td><td>PoE++</td><td>90 W</td><td>71.3 W</td></tr>
</table>
<p>Cisco ke paas kuch Catalyst switches par purana proprietary <b>UPOE</b> (60 W) aur <b>UPOE+</b> (90 W) bhi hai. Modern Wi-Fi 6E aur Wi-Fi 7 APs, jinmein kai radios aur multigig ports hote hain, sab radios chalane ke liye aksar <b>802.3at ya 802.3bt</b> maangte hain. Kam power class par AP boot ho sakta hai par ek radio disable kar de, spatial streams kam kar de, ya USB ya doosra Ethernet port band kar de. AP datasheet batata hai ki exactly kya chala jata hai, isliye design se pehle padho.</p>

<div class="eg"><p><b>PoE budget worked example.</b> Ek switch ka total PoE budget 740 W hai. Agar 22 APs har ek 30 W reserve karein (802.3at), to 660 W chahiye, jo 80 W bacha ke phones aur cameras ke liye fit hota hai. Agar naye APs ko 802.3bt par 60 W chahiye, to 22 x 60 = 1,320 W, jo <b>fit nahi</b> hota. Aapko har switch par APs 12 (720 W) tak kam karne padenge, ya bade power supply wale switches kharidne padenge. Hamesha <b>worst-case allocated</b> power plan karo, typical measured draw nahi, aur 10 se 20 percent spare rakho.</p></div>
<pre class="out">Switch# show power inline
Available:740.0(w)  Used:660.0(w)  Remaining:80.0(w)
Interface Admin  Oper       Power   Device              Class Max
          (Watts)
Gi1/0/1   auto   on         30.0    AP-LIB-F1-01        4     30.0
<span class="hl">Gi1/0/23  auto   power-deny 0.0     n/a                 n/a   30.0</span></pre>
<p>Highlighted line dikhati hai ki budget overrun kaisa dikhta hai: port link ke roop mein up hai par AP ko power nahi milti.</p>

<h3>Multigig (mGig) aur cabling</h3>
<p>Wi-Fi 6, 6E aur 7 APs real throughput 1 Gbps se upar de sakte hain. Tab 1 Gbps uplink bottleneck ban jata hai, isliye Cisco APs mein <b>2.5 Gbps ya 5 Gbps multigig</b> ports lagata hai (switch ports ko Cisco mGig kehta hai, standard hai 2.5GBASE-T aur 5GBASE-T). Distance aur cable maayne rakhte hain: 2.5 aur 5 Gbps Category 5e ya behtar par 100 m tak chalte hain, jabki 10GBASE-T ko poore 100 m ke liye Category 6a chahiye. Cabling ka rule of thumb: nayi runs ke liye Category 6a lagao taaki cable do Wi-Fi generations tak chale. Permanent link plus patch cords ko 90 m se zyada mat karo.</p>

<h3>Northwind ka chosen design</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Northwind library ka wired design">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Distribution pair</text>
<rect x="60" y="100" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="12">Closet switch A</text><text x="160" y="142" text-anchor="middle" class="svg-ink" font-size="11">mGig, 740 W PoE</text>
<rect x="380" y="100" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="12">Closet switch B</text><text x="480" y="142" text-anchor="middle" class="svg-ink" font-size="11">mGig, 740 W PoE</text>
<line x1="280" y1="50" x2="160" y2="100" stroke="#16a34a" stroke-width="3"/><line x1="300" y1="50" x2="480" y2="100" stroke="#16a34a" stroke-width="3"/>
<line x1="340" y1="50" x2="160" y2="100" stroke="#16a34a" stroke-width="3"/><line x1="360" y1="50" x2="480" y2="100" stroke="#16a34a" stroke-width="3"/>
<circle cx="90" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="90" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="160" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="160" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="230" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="230" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="410" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="410" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="480" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<circle cx="550" cy="215" r="18" fill="#bbf7d0" stroke="#64748b"/><text x="550" y="219" text-anchor="middle" class="svg-ink" font-size="11">AP</text>
<line x1="90" y1="160" x2="90" y2="197" stroke="#f59e0b" stroke-width="2"/><line x1="160" y1="160" x2="160" y2="197" stroke="#f59e0b" stroke-width="2"/><line x1="230" y1="160" x2="230" y2="197" stroke="#f59e0b" stroke-width="2"/>
<line x1="410" y1="160" x2="410" y2="197" stroke="#f59e0b" stroke-width="2"/><line x1="480" y1="160" x2="480" y2="197" stroke="#f59e0b" stroke-width="2"/><line x1="550" y1="160" x2="550" y2="197" stroke="#f59e0b" stroke-width="2"/>
<text x="250" y="86" text-anchor="middle" class="svg-muted" font-size="11">2 x 10G</text>
<text x="10" y="252" class="svg-muted" font-size="11">Green = uplink port-channel. Orange = PoE plus data, mGig, Cat 6a.</text>
</svg><p class="cap">Har closet switch ke do 10G uplinks redundant distribution pair tak jaate hain, aur 802.3bt-capable mGig ports se APs ko power dete hain.</p></div>
<table class="cmp"><tr><th>Item</th><th>Rakho ya badlo</th><th>Wajah</th></tr>
<tr><td>15.4 W switches</td><td>Badlo</td><td>6E APs ko 802.3at ya bt power chahiye</td></tr>
<tr><td>Category 5e</td><td>Sirf wahan rakho jahan runs 90 m se kam hain aur 2.5 G kaafi hai</td><td>Sasta hai; 5 GbE APs ki runs par badlo</td></tr>
<tr><td>1 Gbps uplink</td><td>2 x 10 Gbps karo</td><td>24 APs, har ek peak par lagbhag 1 Gbps = 24 Gbps; 2 x 10 G se lagbhag 1.2 : 1 oversubscription</td></tr>
</table>
<h3>Uplinks aur VLANs</h3>
<p>Do ya zyada links ka port-channel (LACP) do distribution switches tak use karo taaki koi single link ya switch outage floor ko na girae. <b>Routed access layer</b> ya chhoti VLANs prefer karo: ek client VLAN ko poore campus mein stretch mat karo, kyunki broadcast traffic airtime waste karta hai. <b>AP management</b> ko har closet ya floor ke liye apni VLAN mein rakho, client VLANs se alag, aur client VLANs ko sirf wahin trunk karo jahan zaroori ho (central switching ke liye saari closets controller par terminate hoti hain, AP switch par nahi).</p>

<div class="warn"><p><b>Common mistakes.</b> PoE ko class reservation ki jagah AP ke average draw se budget karna. 6E APs ke liye 15.4 W ports reuse karna aur sochna ki ek radio off kyun hai. Switch ke power supply ko bhool jana: port count budget nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.3at switch par 30 W deta hai par device par sirf 25.5 W. Questions dono numbers use karte hain; padho ki kis end ke baare mein pooch rahe hain.</p></div>

<div class="scn"><h4>Aadha-chalta 6E rollout</h4><p>Ek university ne purane 802.3at switches par 6E APs lagaye, har stack mein 24 APs. Sab boot hua, par ek-tihai APs par 6 GHz radio off raha aur kuch APs raat ko reboot hue. Power log mein dikha ki jab cleaning crew floor equipment on karti thi tab stack PoE budget par pahunch jata tha. Fix tha bade power supplies wale switches par jana, har switch par APs ki limit lagana, aur 10 percent spare budget jodna.</p><p><b>Lesson:</b> PoE budget ek hard ceiling hai. Khareedne se pehle calculate karo.</p></div>

<div class="iv"><p class="q">"Wi-Fi 6E APs lagane se pehle access switch par kya check karte ho?"</p><p>Strong answer: har stack ka PoE class aur total budget, mGig port speed, cabling category aur length, uplink size aur redundancy, AP management VLAN with DHCP option 43, aur QoS trust. Budget aur uplink oversubscription ka arithmetic dikhao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PoE: 802.3af 15.4 W, 802.3at 30 W, 802.3bt 60 W aur 90 W switch port par.</li>
<li>Total supply se budget karo, worst-case allocation ke saath, 10 se 20 percent spare.</li>
<li>Wi-Fi 6, 6E aur 7 APs 2.5 ya 5 Gbps mGig use karte hain; nayi runs ke liye Category 6a.</li>
<li>Redundant, port-channel uplinks use karo; peak AP throughput se size karo.</li>
<li>AP management VLAN alag; client VLANs ko widely stretch mat karo.</li>
</ul></div>
`}};export{e as default};