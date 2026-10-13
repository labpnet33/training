var e={id:`racks-cabling`,h:{en:`Racks, cabling, optics and speeds`,hi:`Racks, cabling, optics aur speeds`},body:{en:`
<p>Think of a rack as a bookshelf for computers and the cabling as the roads between the shelves. A data center with messy roads is like a city with no street names: things still move, but every repair takes hours. In this chapter you learn how equipment is mounted, how switches are placed in a row, which cables and optics carry which speeds, and how to label everything so the next engineer can find it at 3 a.m.</p>

<h3>Racks and rack units</h3>
<p>A standard data center rack is <b>19 inches</b> wide between its mounting rails. Height is counted in <b>rack units (RU or U)</b>: <b>1U = 1.75 inches = 44.45 mm</b>. A 1U switch is thin; a 2U server is twice as tall. The most common rack is <b>42U</b> (about 2 m tall), with 45U to 48U racks also popular. Racks for network gear are often 800 mm wide to leave room for cable managers, and 1000 to 1200 mm deep for long servers.</p>
<p>A <b>rack elevation</b> is a drawing that shows what sits in every U of a rack. It is one of the most important documents in a data center.</p>

<div class="eg"><p><b>Worked example.</b> A 42U rack holds two 1U leaf switches, one 1U management switch and one 1U patch panel: 4U used, 38U free. With 2U servers you could fit 19 servers by space. But if the rack power budget is 8 kW and each server peaks at 450 W, power allows only 16. The rack is <b>power-bound</b>, not space-bound, so you install 16 and fill the gaps with blanking panels.</p></div>

<h3>Where do the switches go? ToR, EoR and MoR</h3>
<table class="cmp"><tr><th>Design</th><th>How it works</th><th>Good</th><th>Watch out</th></tr>
<tr><td><b>Top of rack (ToR)</b></td><td>One or two switches in every rack; servers connect with short cables</td><td>Very short server cables, rack is a self-contained unit, only a few fibre uplinks leave the rack</td><td>Many more switches to manage and power</td></tr>
<tr><td><b>End of row (EoR)</b></td><td>Switches sit in a network rack at the end of each row; servers reach them through structured cabling</td><td>Fewer, larger switches</td><td>Long cable runs and heavy cable bundles</td></tr>
<tr><td><b>Middle of row (MoR)</b></td><td>Like EoR, but the network rack is in the middle</td><td>Roughly halves the longest cable run</td><td>Still lots of horizontal cabling</td></tr>
</table>
<p>Modern spine-leaf fabrics almost always use <b>ToR leaf switches</b>, usually a pair per rack for redundancy.</p>

<h3>Structured cabling and patch panels</h3>
<p><b>Structured cabling</b> means permanent, tested cable runs between fixed points, ending on <b>patch panels</b>. You never run a long cable straight from a server to a far switch. Instead, short <b>patch cords</b> connect the device to the local panel, the permanent trunk runs to the far panel, and another patch cord finishes the path. The TIA-942 standard names the areas: the <b>MDA</b> (main distribution area, where core gear lives), the <b>HDA</b> (horizontal distribution area) and the <b>EDA</b> (equipment distribution area, the server racks).</p>

<h3>Copper versus fibre</h3>
<p><b>Copper twisted pair</b> (RJ45) is cheap and familiar. Cat6A carries 10GBASE-T up to 100 m, but 10GBASE-T uses more power and adds more latency than optical or DAC links, so it is mostly used for management and older servers.</p>
<p><b>Fibre</b> carries light and comes in two families:</p>
<ul>
<li><b>Multimode (MMF)</b>: wider 50 µm core, cheap 850 nm short-reach optics. Grades OM3, OM4 (aqua jacket) and OM5 (lime green). Reach is short: for example 10GBASE-SR about 300 m on OM3 and 400 m on OM4, but 25GBASE-SR and 100GBASE-SR4 only about 70 m on OM3 and 100 m on OM4.</li>
<li><b>Single-mode (SMF)</b>: thin 9 µm core (OS2, usually a yellow jacket), 1310/1550 nm optics, reach from 500 m to 10 km and beyond. Used between buildings, and increasingly inside large DCs for 100G/400G.</li>
</ul>
<p>Connectors: <b>LC duplex</b> (two fibres, one transmit and one receive) and <b>MPO/MTP</b> (12 or 16 fibres in one connector) for parallel optics such as 100GBASE-SR4.</p>

<h3>Optics, DAC and AOC</h3>
<table class="cmp"><tr><th>Form factor</th><th>Typical speed</th><th>Lanes</th></tr>
<tr><td>SFP</td><td>1G</td><td>1 × 1G</td></tr>
<tr><td>SFP+</td><td>10G</td><td>1 × 10G</td></tr>
<tr><td>SFP28</td><td>25G</td><td>1 × 25G</td></tr>
<tr><td>QSFP+</td><td>40G</td><td>4 × 10G</td></tr>
<tr><td>QSFP28</td><td>100G</td><td>4 × 25G</td></tr>
<tr><td>QSFP-DD</td><td>400G</td><td>8 × 50G (PAM4)</td></tr>
</table>
<p>A <b>transceiver</b> (optic) plugs into a switch port and converts electrical signals to light. A <b>DAC</b> (direct attach copper) is a twinax cable with the modules fixed on both ends: cheapest and lowest power, but passive DACs are only a few metres long, so they suit server-to-ToR links inside one rack. An <b>AOC</b> (active optical cable) is fibre with fixed optics on both ends: longer reach (tens of metres), lighter and thinner than DAC.</p>
<p>Speeds you will meet: 1G and 10G (older servers), <b>25G</b> (today's common server speed, one lane in the same small SFP form factor), 40G (legacy uplinks), <b>100G</b> (common leaf-to-spine uplink) and <b>400G</b> (spines and new fabrics).</p>

<h3>Breakout: one fast port into four slower ones</h3>
<p>Because a QSFP28 port is really four 25G lanes, you can split one 100G port into <b>4 × 25G</b> with a breakout DAC/AOC or an SR4 optic with an MPO-to-4×LC cable. Similarly 40G breaks out to 4 × 10G and some 400G ports to 4 × 100G. On a Nexus 9000:</p>
<pre class="code"><span class="c">! split port 1/49 into four 25G interfaces</span>
interface breakout module 1 port 49 map 25g-4x
<span class="c">! the new interfaces are Ethernet1/49/1 to Ethernet1/49/4</span>
interface Ethernet1/49/1
  description SRV-DB01-NIC1
  no shutdown</pre>
<pre class="out">LEAF-01# show interface brief | include Eth1/49
<span class="hl">Eth1/49/1     1       eth  access up      none                       25G(D) --</span>
Eth1/49/2     1       eth  access down    Link not connected         auto(D) --
Eth1/49/3     1       eth  access down    Link not connected         auto(D) --
Eth1/49/4     1       eth  access down    Link not connected         auto(D) --</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="100G breakout to 4 x 25G">
<rect x="20" y="60" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="82" text-anchor="middle" class="svg-ink" font-size="13">Leaf port 1/49</text><text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="12">QSFP28 100G</text>
<line x1="160" y1="85" x2="260" y2="85" stroke="#64748b" stroke-width="4"/><text x="210" y="75" text-anchor="middle" class="svg-accent" font-size="12">breakout</text>
<line x1="260" y1="85" x2="420" y2="25" stroke="#64748b" stroke-width="2"/><line x1="260" y1="85" x2="420" y2="65" stroke="#64748b" stroke-width="2"/><line x1="260" y1="85" x2="420" y2="105" stroke="#64748b" stroke-width="2"/><line x1="260" y1="85" x2="420" y2="145" stroke="#64748b" stroke-width="2"/>
<rect x="420" y="10" width="200" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="29" text-anchor="middle" class="svg-ink" font-size="12">Eth1/49/1 25G server A</text>
<rect x="420" y="50" width="200" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="69" text-anchor="middle" class="svg-ink" font-size="12">Eth1/49/2 25G server B</text>
<rect x="420" y="90" width="200" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="109" text-anchor="middle" class="svg-ink" font-size="12">Eth1/49/3 25G server C</text>
<rect x="420" y="130" width="200" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="149" text-anchor="middle" class="svg-ink" font-size="12">Eth1/49/4 25G server D</text>
</svg><p class="cap">One QSFP28 port = four 25G lanes, so it can feed four SFP28 servers.</p></div>

<h3>Labelling and documentation</h3>
<p>Label <b>both ends</b> of every cable with a unique ID and where it goes, for example <code>R12-U42-P03 to R01-SPINE1-E1/12</code>. Put the same information in the switch <code>description</code>, in the cable schedule (a spreadsheet or DCIM tool) and on the rack elevation. Use colour conventions agreed by the site (for example one colour for A-side, another for B-side, another for management).</p>

<div class="warn"><p><b>Common mistakes.</b> Mixing multimode optics with single-mode fibre (the link stays down or flaps). Assuming every port can break out: many switches only allow breakout on certain ports. Bending fibre too tightly. Forgetting that the two ends of a link must use matching optic types (SR with SR, LR with LR).</p></div>
<div class="exam"><p><b>Exam trap.</b> QSFP28 = 100G built from 4 × 25G lanes; that is why 100G breaks out to 4 × 25G, and 40G (QSFP+, 4 × 10G) breaks out to 4 × 10G. 1U = 1.75 inches.</p></div>

<div class="scn"><h4>The new server that would not link up</h4><p>A new database server in rack R12 showed "Link not connected" on its 25G port. The server team swore the cable was plugged in. The network engineer checked <code>show interface transceiver</code>: the switch had a 25GBASE-SR multimode optic, but the patch cord in the tray was yellow single-mode, pulled from a different project's box. The light was so weak the receiver saw nothing. Swapping in an aqua OM4 patch cord brought the link up at 25G immediately.</p><p><b>Lesson:</b> match optic, fibre type and connector on both ends, and check the physical layer first.</p></div>

<div class="iv"><p class="q">"Top of rack or end of row: which would you choose for a new fabric, and why?"</p><p>Strong answer: for spine-leaf, ToR, usually a redundant pair per rack. Server cables stay short and cheap (DAC inside the rack), only a few fibre uplinks leave the rack, and each rack becomes a repeatable building block. Mention the trade-off (more switches to manage, which automation and a controller such as NDFC or ACI solve) and when EoR still makes sense (low-density rooms or chassis switches).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Racks are 19 inches wide; 1U = 1.75 inches; 42U is the common height; power often limits a rack before space.</li>
<li>ToR is the norm for spine-leaf; EoR/MoR use structured cabling to switches in a network rack.</li>
<li>Multimode = short reach, 850 nm, OM3/OM4/OM5; single-mode = long reach, OS2, yellow.</li>
<li>SFP+ 10G, SFP28 25G, QSFP28 100G (4 × 25G), QSFP-DD 400G; DAC for short in-rack links, AOC or optics for longer ones.</li>
<li>Label both ends, keep descriptions and cable schedules in sync.</li>
</ul></div>
`,hi:`
<p>Rack ko computers ki bookshelf samjho aur cabling ko shelves ke beech ki sadkein. Gande raaston wala data center ek aise shehar jaisa hai jahan galiyon ke naam hi nahi: cheezein chalti to hain, lekin har repair mein ghante lagte hain. Is chapter mein aap seekhoge ki equipment kaise mount hota hai, row mein switches kahan rakhe jaate hain, kaunsi cables aur optics kaunsi speed le jaati hain, aur sab kuch kaise label karein taaki agla engineer raat 3 baje bhi use dhoondh sake.</p>

<h3>Racks aur rack units</h3>
<p>Standard data center rack apni mounting rails ke beech <b>19 inch</b> chauda hota hai. Height <b>rack units (RU ya U)</b> mein ginte hain: <b>1U = 1.75 inch = 44.45 mm</b>. 1U switch patla hota hai; 2U server usse double lamba. Sabse common rack <b>42U</b> hai (lagbhag 2 m lamba), aur 45U se 48U racks bhi popular hain. Network gear ke racks aksar 800 mm chaude hote hain taaki cable managers ke liye jagah rahe, aur lambe servers ke liye 1000 se 1200 mm gehre.</p>
<p><b>Rack elevation</b> ek drawing hai jo dikhati hai ki rack ke har U mein kya rakha hai. Yeh data center ke sabse zaroori documents mein se ek hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek 42U rack mein do 1U leaf switches, ek 1U management switch aur ek 1U patch panel hain: 4U use hue, 38U khaali. 2U servers se jagah ke hisaab se 19 servers aa sakte hain. Lekin agar rack ka power budget 8 kW hai aur har server peak par 450 W leta hai, to power sirf 16 allow karta hai. Rack <b>power-bound</b> hai, space-bound nahi, isliye aap 16 lagate ho aur gaps ko blanking panels se bharte ho.</p></div>

<h3>Switches kahan jaate hain? ToR, EoR aur MoR</h3>
<table class="cmp"><tr><th>Design</th><th>Kaise kaam karta hai</th><th>Achha</th><th>Dhyan rakho</th></tr>
<tr><td><b>Top of rack (ToR)</b></td><td>Har rack mein ek ya do switches; servers chhoti cables se judte hain</td><td>Bahut chhoti server cables, rack ek self-contained unit, rack se sirf kuch fibre uplinks bahar jaate hain</td><td>Manage aur power karne ke liye kaafi zyada switches</td></tr>
<tr><td><b>End of row (EoR)</b></td><td>Switches har row ke end mein ek network rack mein baithte hain; servers structured cabling se un tak pahunchte hain</td><td>Kam, bade switches</td><td>Lambe cable runs aur bhaari cable bundles</td></tr>
<tr><td><b>Middle of row (MoR)</b></td><td>EoR jaisa, lekin network rack beech mein</td><td>Sabse lamba cable run lagbhag aadha</td><td>Phir bhi bahut horizontal cabling</td></tr>
</table>
<p>Modern spine-leaf fabrics lagbhag hamesha <b>ToR leaf switches</b> use karte hain, aam taur par redundancy ke liye har rack mein ek pair.</p>

<h3>Structured cabling aur patch panels</h3>
<p><b>Structured cabling</b> ka matlab hai fixed points ke beech permanent, tested cable runs, jo <b>patch panels</b> par khatam hote hain. Aap kabhi server se door ke switch tak seedhi lambi cable nahi chalate. Uske bajaye chhote <b>patch cords</b> device ko local panel se jodte hain, permanent trunk door ke panel tak jaata hai, aur ek aur patch cord path poora karta hai. TIA-942 standard areas ke naam deta hai: <b>MDA</b> (main distribution area, jahan core gear rehta hai), <b>HDA</b> (horizontal distribution area) aur <b>EDA</b> (equipment distribution area, yaani server racks).</p>

<h3>Copper vs fibre</h3>
<p><b>Copper twisted pair</b> (RJ45) sasta aur jaana-pehchaana hai. Cat6A 10GBASE-T ko 100 m tak le jaata hai, lekin 10GBASE-T optical ya DAC links se zyada power leta hai aur zyada latency jodta hai, isliye yeh zyada tar management aur purane servers ke liye use hota hai.</p>
<p><b>Fibre</b> light le jaata hai aur do families mein aata hai:</p>
<ul>
<li><b>Multimode (MMF)</b>: chauda 50 µm core, saste 850 nm short-reach optics. Grades OM3, OM4 (aqua jacket) aur OM5 (lime green). Reach chhoti hai: jaise 10GBASE-SR OM3 par lagbhag 300 m aur OM4 par 400 m, lekin 25GBASE-SR aur 100GBASE-SR4 OM3 par sirf lagbhag 70 m aur OM4 par 100 m.</li>
<li><b>Single-mode (SMF)</b>: patla 9 µm core (OS2, aam taur par yellow jacket), 1310/1550 nm optics, reach 500 m se 10 km aur usse aage. Buildings ke beech use hota hai, aur bade DCs ke andar bhi 100G/400G ke liye badhta ja raha hai.</li>
</ul>
<p>Connectors: <b>LC duplex</b> (do fibres, ek transmit aur ek receive) aur <b>MPO/MTP</b> (ek connector mein 12 ya 16 fibres) parallel optics jaise 100GBASE-SR4 ke liye.</p>

<h3>Optics, DAC aur AOC</h3>
<table class="cmp"><tr><th>Form factor</th><th>Typical speed</th><th>Lanes</th></tr>
<tr><td>SFP</td><td>1G</td><td>1 × 1G</td></tr>
<tr><td>SFP+</td><td>10G</td><td>1 × 10G</td></tr>
<tr><td>SFP28</td><td>25G</td><td>1 × 25G</td></tr>
<tr><td>QSFP+</td><td>40G</td><td>4 × 10G</td></tr>
<tr><td>QSFP28</td><td>100G</td><td>4 × 25G</td></tr>
<tr><td>QSFP-DD</td><td>400G</td><td>8 × 50G (PAM4)</td></tr>
</table>
<p><b>Transceiver</b> (optic) switch port mein lagta hai aur electrical signals ko light mein badalta hai. <b>DAC</b> (direct attach copper) ek twinax cable hai jiske dono ends par modules fixed hote hain: sabse sasta aur sabse kam power, lekin passive DACs sirf kuch metre lambe hote hain, isliye ek rack ke andar server-to-ToR links ke liye theek hain. <b>AOC</b> (active optical cable) fibre hai jiske dono ends par fixed optics hote hain: lambi reach (dasiyon metre), DAC se halka aur patla.</p>
<p>Jo speeds aapko milengi: 1G aur 10G (purane servers), <b>25G</b> (aaj ki common server speed, usi chhote SFP form factor mein ek lane), 40G (legacy uplinks), <b>100G</b> (common leaf-to-spine uplink) aur <b>400G</b> (spines aur naye fabrics).</p>

<h3>Breakout: ek fast port ko chaar slow ports mein todna</h3>
<p>Kyunki QSFP28 port asal mein chaar 25G lanes hai, aap ek 100G port ko breakout DAC/AOC se ya MPO-to-4×LC cable wale SR4 optic se <b>4 × 25G</b> mein baant sakte ho. Isi tarah 40G 4 × 10G mein aur kuch 400G ports 4 × 100G mein break out hote hain. Nexus 9000 par:</p>
<pre class="code"><span class="c">! port 1/49 ko chaar 25G interfaces mein baanto</span>
interface breakout module 1 port 49 map 25g-4x
<span class="c">! naye interfaces Ethernet1/49/1 se Ethernet1/49/4 hain</span>
interface Ethernet1/49/1
  description SRV-DB01-NIC1
  no shutdown</pre>
<pre class="out">LEAF-01# show interface brief | include Eth1/49
<span class="hl">Eth1/49/1     1       eth  access up      none                       25G(D) --</span>
Eth1/49/2     1       eth  access down    Link not connected         auto(D) --
Eth1/49/3     1       eth  access down    Link not connected         auto(D) --
Eth1/49/4     1       eth  access down    Link not connected         auto(D) --</pre>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="100G breakout se 4 x 25G">
<rect x="20" y="60" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="82" text-anchor="middle" class="svg-ink" font-size="13">Leaf port 1/49</text><text x="90" y="100" text-anchor="middle" class="svg-muted" font-size="12">QSFP28 100G</text>
<line x1="160" y1="85" x2="260" y2="85" stroke="#64748b" stroke-width="4"/><text x="210" y="75" text-anchor="middle" class="svg-accent" font-size="12">breakout</text>
<line x1="260" y1="85" x2="420" y2="25" stroke="#64748b" stroke-width="2"/><line x1="260" y1="85" x2="420" y2="65" stroke="#64748b" stroke-width="2"/><line x1="260" y1="85" x2="420" y2="105" stroke="#64748b" stroke-width="2"/><line x1="260" y1="85" x2="420" y2="145" stroke="#64748b" stroke-width="2"/>
<rect x="420" y="10" width="200" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="29" text-anchor="middle" class="svg-ink" font-size="12">Eth1/49/1 25G server A</text>
<rect x="420" y="50" width="200" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="69" text-anchor="middle" class="svg-ink" font-size="12">Eth1/49/2 25G server B</text>
<rect x="420" y="90" width="200" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="109" text-anchor="middle" class="svg-ink" font-size="12">Eth1/49/3 25G server C</text>
<rect x="420" y="130" width="200" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="149" text-anchor="middle" class="svg-ink" font-size="12">Eth1/49/4 25G server D</text>
</svg><p class="cap">Ek QSFP28 port = chaar 25G lanes, isliye yeh chaar SFP28 servers ko feed kar sakta hai.</p></div>

<h3>Labelling aur documentation</h3>
<p>Har cable ke <b>dono ends</b> par ek unique ID aur woh kahan jaati hai, label karo, jaise <code>R12-U42-P03 to R01-SPINE1-E1/12</code>. Yahi jaankari switch ke <code>description</code> mein, cable schedule (spreadsheet ya DCIM tool) mein aur rack elevation par daalo. Site ke agreed colour conventions use karo (jaise A-side ke liye ek colour, B-side ke liye dusra, management ke liye teesra).</p>

<div class="warn"><p><b>Common galtiyan.</b> Multimode optics ko single-mode fibre ke saath mix karna (link down rehta hai ya flap karta hai). Yeh maan lena ki har port break out ho sakta hai: kai switches sirf kuch ports par breakout allow karte hain. Fibre ko bahut tight mod dena. Yeh bhool jaana ki link ke dono ends par matching optic types chahiye (SR ke saath SR, LR ke saath LR).</p></div>
<div class="exam"><p><b>Exam trap.</b> QSFP28 = 100G jo 4 × 25G lanes se bana hai; isiliye 100G 4 × 25G mein break out hota hai, aur 40G (QSFP+, 4 × 10G) 4 × 10G mein. 1U = 1.75 inch.</p></div>

<div class="scn"><h4>Naya server jiska link up nahi hua</h4><p>Rack R12 ke ek naye database server ke 25G port par "Link not connected" dikh raha tha. Server team kasam kha rahi thi ki cable lagi hai. Network engineer ne <code>show interface transceiver</code> check kiya: switch mein 25GBASE-SR multimode optic tha, lekin tray mein jo patch cord tha woh yellow single-mode tha, kisi aur project ke box se nikala hua. Light itni kamzor thi ki receiver ko kuch dikha hi nahi. Aqua OM4 patch cord lagate hi link turant 25G par up ho gaya.</p><p><b>Seekh:</b> dono ends par optic, fibre type aur connector match karo, aur pehle physical layer check karo.</p></div>

<div class="iv"><p class="q">"Naye fabric ke liye top of rack ya end of row: aap kya choose karoge, aur kyun?"</p><p>Strong answer: spine-leaf ke liye ToR, aam taur par har rack mein ek redundant pair. Server cables chhoti aur sasti rehti hain (rack ke andar DAC), rack se sirf kuch fibre uplinks bahar jaate hain, aur har rack ek repeatable building block ban jaata hai. Trade-off batao (manage karne ke liye zyada switches, jise automation aur NDFC ya ACI jaisa controller solve karta hai) aur EoR kab abhi bhi sense banata hai (low-density rooms ya chassis switches).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Racks 19 inch chaude hote hain; 1U = 1.75 inch; 42U common height hai; power aksar space se pehle rack ko limit karta hai.</li>
<li>Spine-leaf ke liye ToR norm hai; EoR/MoR network rack ke switches tak structured cabling use karte hain.</li>
<li>Multimode = short reach, 850 nm, OM3/OM4/OM5; single-mode = long reach, OS2, yellow.</li>
<li>SFP+ 10G, SFP28 25G, QSFP28 100G (4 × 25G), QSFP-DD 400G; chhote in-rack links ke liye DAC, lambe ke liye AOC ya optics.</li>
<li>Dono ends label karo, descriptions aur cable schedules ko sync mein rakho.</li>
</ul></div>
`}};export{e as default};