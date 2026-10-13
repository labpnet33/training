var e=e=>`<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="`+e.aria+`"><rect x="10" y="10" width="620" height="230" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><rect x="20" y="20" width="150" height="100" fill="#e2e8f0"/><text x="95" y="100" text-anchor="middle" class="svg-ink" font-size="12">`+e.office+`</text><rect x="20" y="130" width="150" height="100" fill="#bbf7d0"/><text x="95" y="215" text-anchor="middle" class="svg-ink" font-size="12">`+e.dock+`</text><rect x="180" y="20" width="440" height="210" fill="#fde68a"/><rect x="230" y="40" width="30" height="170" fill="#94a3b8"/><rect x="300" y="40" width="30" height="170" fill="#94a3b8"/><rect x="370" y="40" width="30" height="170" fill="#94a3b8"/><rect x="440" y="40" width="30" height="170" fill="#94a3b8"/><rect x="510" y="40" width="30" height="170" fill="#94a3b8"/><rect x="570" y="40" width="30" height="170" fill="#94a3b8"/><text x="400" y="34" text-anchor="middle" class="svg-ink" font-size="12">`+e.rack+`</text><line x1="175" y1="10" x2="175" y2="240" stroke="#475569" stroke-width="8"/><circle cx="95" cy="60" r="45" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="95" cy="60" r="7" fill="#0ea5e9"/><circle cx="245" cy="120" r="40" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="315" cy="195" r="40" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="385" cy="120" r="40" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="455" cy="195" r="40" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="525" cy="120" r="40" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="245" cy="120" r="6" fill="#0ea5e9"/><circle cx="315" cy="195" r="6" fill="#0ea5e9"/><circle cx="385" cy="120" r="6" fill="#0ea5e9"/><circle cx="455" cy="195" r="6" fill="#0ea5e9"/><circle cx="525" cy="120" r="6" fill="#0ea5e9"/><text x="182" y="257" class="svg-ink" font-size="12">`+e.w1+`</text><circle cx="14" cy="280" r="6" fill="#0ea5e9"/><text x="26" y="284" class="svg-ink" font-size="12">`+e.l1+`</text><rect x="230" y="274" width="14" height="14" fill="#94a3b8"/><text x="250" y="285" class="svg-ink" font-size="12">`+e.l2+`</text><rect x="430" y="274" width="14" height="14" fill="#fde68a"/><text x="450" y="285" class="svg-ink" font-size="12">`+e.l3+`</text></svg><p class="cap">`+e.cap+`</p></div>`,t=e({aria:`Warehouse floor plan with racks and heavy wall`,office:`Office (drywall)`,dock:`Dock office`,rack:`Steel racking, 9 m high, 6 aisles`,w1:`Heavy block wall (thick line)`,l1:`AP and its coverage`,l2:`Steel racks`,l3:`Open aisles`,cap:`Racks and the block wall cut every AP cell short. An AP in the office barely reaches the aisles; aisle APs are staggered so each cell sees a clear lane.`}),n=e({aria:`Warehouse floor plan with racks and heavy wall`,office:`Office (drywall)`,dock:`Dock office`,rack:`Steel racking, 9 m high, 6 aisles`,w1:`Heavy block wall (moti line)`,l1:`AP aur uski coverage`,l2:`Steel racks`,l3:`Open aisles`,cap:`Racks aur block wall har AP cell ko chhota kar dete hain. Office ka AP aisles tak mushkil se pahunchta hai; aisle APs staggered hain taaki har cell ko clear lane dikhe.`}),r={id:`attenuation-environments`,h:{en:`Attenuation and environments: walls, racks, hospitals and outdoors`,hi:`Attenuation aur environments: walls, racks, hospitals aur outdoors`},body:{en:`
<p>Radio waves lose energy when they pass through things. This loss is called <b>attenuation</b>, measured in dB. A design that ignores building materials is a guess. In this chapter you learn the typical values, how to use them, and how different environments (warehouse, hospital, factory, outdoor) change the design.</p>

<h3>Case: Northgate Distribution Centre</h3>
<p>Northgate (fictional) runs a 12,000 square metre warehouse. Handheld scanners and forklift tablets must work in six long aisles between 9 metre steel racks, plus an office and a dock office. The requirement: no scan failures while walking or driving, 24 hours a day. Constraints: ceiling at 10 metres, roof steel beams for mounting, no mounting inside the racks, and a heavy block wall between the office and the warehouse. A previous contractor placed APs in the office and "shot through the wall"; scanners dropped in aisles 4 to 6.</p>

<h3>Typical attenuation values</h3>
<p>The numbers below are <b>typical published ranges</b> used for planning. Real values vary with thickness, moisture, reinforcement and angle. That is exactly why an on-site test measurement is valuable: you can measure the real wall instead of trusting a table.</p>
<table class="cmp"><tr><th>Material</th><th>Typical loss at 2.4 GHz</th><th>Typical loss at 5 GHz</th><th>Note</th></tr>
<tr><td>Drywall / plasterboard</td><td>about 2 to 3 dB</td><td>about 3 to 4 dB</td><td>Light interior wall</td></tr>
<tr><td>Wood door, hollow</td><td>about 3 dB</td><td>about 4 dB</td><td>Solid doors lose more</td></tr>
<tr><td>Glass window</td><td>about 2 to 4 dB</td><td>about 3 to 5 dB</td><td>Coated or Low-E glass can lose 10 dB or more</td></tr>
<tr><td>Brick wall</td><td>about 5 to 8 dB</td><td>about 8 to 12 dB</td><td>Depends on thickness</td></tr>
<tr><td>Concrete / block wall</td><td>about 10 to 15 dB</td><td>about 12 to 20 dB</td><td>Reinforced concrete is worse</td></tr>
<tr><td>Concrete floor</td><td>about 12 to 20 dB</td><td>about 15 to 25 dB</td><td>Cell edges seldom cross floors usefully</td></tr>
<tr><td>Metal door, elevator shaft</td><td>about 10 to 25 dB or more</td><td>similar or more</td><td>Treat as near-blocking</td></tr>
<tr><td>Lead-lined wall (imaging)</td><td>very high</td><td>very high</td><td>Plan an AP inside the room</td></tr>
</table>
`+t+`
<div class="note"><p><b>How to use the table.</b> Count the walls on the straight line between an AP and a client, add the typical loss for each, and subtract it from the link budget. Two heavy walls (about 12 dB each) cost roughly 24 dB, which is more than the loss from a 16 times distance increase. Higher frequencies lose a little more in every material.</p></div>

<h3>Worked example for Northgate</h3>
<div class="eg"><p><b>Worked example.</b> An office AP transmits at 14 dBm with a 3 dBi antenna. Suppose free-space loss to aisle 5 at 5 GHz (about 35 m) is about 77 dB, and the block wall costs about 15 dB. The racks shadow the signal by a further 8 to 10 dB. Received signal is about 14 + 3 - 77 - 15 - 9 = -84 dBm. The scanner needs about -70 dBm. The shortfall is 14 dB, so no change in power can fix this sensibly. The AP must move into the aisles.</p></div>

<h3>Options and trade-offs for the warehouse</h3>
<table class="cmp"><tr><th>Option</th><th>Benefit</th><th>Trade-off</th></tr>
<tr><td>Raise power on the office AP</td><td>No new cabling</td><td>Client uplink is still weak, so the link stays one-sided; adds interference elsewhere</td></tr>
<tr><td>Ceiling APs with omni antennas at 10 m</td><td>Easy mounting</td><td>Racks shadow the signal; cell is cut into aisle segments</td></tr>
<tr><td>Directional (patch or narrow) antennas aimed down the aisles from rack ends or beams</td><td>Signal follows the aisle; fewer cells reach neighbouring aisles</td><td>Careful aiming; more cabling and mounting hardware</td></tr>
</table>
<p>Chosen: directional antennas along the aisles, staggered so neighbouring aisles use different channels, with the office on its own AP. A predictive model gave the layout and an on-site test with a real scanner at the far end of one aisle confirmed the numbers (chapter 4).</p>

<h3>Environment profiles you must recognise</h3>
<ul>
<li><b>Healthcare.</b> Mixed walls, lead and shielded rooms, elevators, many roaming voice users, 2.4 GHz-only medical devices, strict RF safety rules, and equipment that may be sensitive to interference. Use lower power, more cells, and verify with biomedical engineering.</li>
<li><b>Warehouse and retail.</b> High ceilings, racks and stock that change (full racks absorb more than empty ones). Survey with representative stock levels. Use directional antennas for aisles.</li>
<li><b>Manufacturing.</b> Machines, welders, motors and reflective metal produce noise and heavy multipath. Plan for survey with machines running, use shielded or enclosed mounts, and verify non-Wi-Fi interference with a spectrum analyser (chapter 6).</li>
<li><b>Outdoor.</b> Line of sight, weather, foliage, vehicles and ground reflections. Use outdoor-rated APs and antennas, check regulatory power limits, and remember that leaves and rain attenuate, especially at higher frequencies.</li>
<li><b>Offices and education.</b> Light walls, high client count, open areas. Capacity matters more than coverage.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Using table values as exact numbers; surveying an empty warehouse and deploying into a full one; ignoring doors that are normally closed; forgetting that glass can be metallised; designing through elevators and stairwells.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam questions rank materials by attenuation (drywall low, brick medium, concrete and metal high) and ask which environment needs directional antennas or an on-site survey. Remember that stock, machinery and people change attenuation after the survey.</p></div>

<div class="scn"><h4>The racks that filled up</h4><p>A retailer's predictive plan assumed empty racks. After the peak-season stock arrived, scanners in the middle aisles lost connection. A post-deployment survey with full racks showed 10 dB more loss than modelled. The fix added three APs with directional antennas in the affected aisles.</p><p><b>Lesson:</b> survey, or at least model, the environment as it will be at its worst, not at its emptiest.</p></div>
<div class="iv"><p class="q">"How do you account for walls in a design?"</p><p>Strong answer: I identify the materials from floor plans and a site walk, apply typical attenuation figures in the predictive tool, and verify the worst walls with real measurements in an on-site survey because values vary with thickness and reinforcement. I treat elevators, lead rooms and metal doors as boundaries and give them their own coverage.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attenuation is loss in dB; light walls lose a few dB, brick more, concrete and metal the most.</li>
<li>Table values are typical planning ranges; measure heavy walls on site.</li>
<li>Higher frequency means slightly higher loss in each material.</li>
<li>Environment decides antenna choice and survey method: warehouse, hospital, factory, outdoor and office all differ.</li>
<li>Survey with the environment in its real, operating state: stock, machines and people.</li>
</ul></div>
`,hi:`
<p>Radio waves cheezon se guzarte waqt energy kho deti hain. Is loss ko <b>attenuation</b> kehte hain, jo dB mein naapa jata hai. Jo design building materials ko ignore kare woh andaza hai. Is chapter mein aap typical values, unhe kaise use karna hai, aur alag environments (warehouse, hospital, factory, outdoor) design ko kaise badalte hain, yeh seekhoge.</p>

<h3>Case: Northgate Distribution Centre</h3>
<p>Northgate (fictional) 12,000 square metre ka warehouse chalata hai. Handheld scanners aur forklift tablets ko 9 metre steel racks ke beech chhe lambe aisles mein, ek office aur ek dock office mein kaam karna hai. Requirement: chalte ya drive karte waqt koi scan failure nahi, 24 ghante. Constraints: 10 metre ki ceiling, mounting ke liye roof steel beams, racks ke andar mounting nahi, aur office aur warehouse ke beech heavy block wall. Pichle contractor ne APs office mein lagaye aur wall ke paar "signal maara"; aisle 4 se 6 mein scanners drop hote the.</p>

<h3>Typical attenuation values</h3>
<p>Neeche ke numbers planning mein use hone wali <b>typical published ranges</b> hain. Asli values thickness, moisture, reinforcement aur angle ke saath badalti hain. Isiliye on-site test measurement kaam ki hai: table par bharosa karne ke bajay aap asli wall measure kar sakte ho.</p>
<table class="cmp"><tr><th>Material</th><th>2.4 GHz par typical loss</th><th>5 GHz par typical loss</th><th>Note</th></tr>
<tr><td>Drywall / plasterboard</td><td>lagbhag 2 se 3 dB</td><td>lagbhag 3 se 4 dB</td><td>Halki interior wall</td></tr>
<tr><td>Wood door, hollow</td><td>lagbhag 3 dB</td><td>lagbhag 4 dB</td><td>Solid doors zyada loss karte hain</td></tr>
<tr><td>Glass window</td><td>lagbhag 2 se 4 dB</td><td>lagbhag 3 se 5 dB</td><td>Coated ya Low-E glass 10 dB ya zyada loss kar sakta hai</td></tr>
<tr><td>Brick wall</td><td>lagbhag 5 se 8 dB</td><td>lagbhag 8 se 12 dB</td><td>Thickness par depend</td></tr>
<tr><td>Concrete / block wall</td><td>lagbhag 10 se 15 dB</td><td>lagbhag 12 se 20 dB</td><td>Reinforced concrete aur kharab</td></tr>
<tr><td>Concrete floor</td><td>lagbhag 12 se 20 dB</td><td>lagbhag 15 se 25 dB</td><td>Cell edges floors ke paar kam kaam ke hote hain</td></tr>
<tr><td>Metal door, elevator shaft</td><td>lagbhag 10 se 25 dB ya zyada</td><td>similar ya zyada</td><td>Lagbhag blocking maano</td></tr>
<tr><td>Lead-lined wall (imaging)</td><td>bahut high</td><td>bahut high</td><td>Room ke andar AP plan karo</td></tr>
</table>
`+n+`
<div class="note"><p><b>Table kaise use karein.</b> AP aur client ke beech seedhi line par walls gino, har ek ka typical loss jodo, aur link budget se ghatao. Do heavy walls (har ek lagbhag 12 dB) lagbhag 24 dB ka loss karti hain, jo distance 16 guna badhne ke loss se zyada hai. Higher frequencies har material mein thoda zyada loss karti hain.</p></div>

<h3>Northgate ka worked example</h3>
<div class="eg"><p><b>Worked example.</b> Office AP 14 dBm par transmit karta hai, 3 dBi antenna ke saath. Maano aisle 5 tak (lagbhag 35 m) 5 GHz par free-space loss lagbhag 77 dB hai, aur block wall lagbhag 15 dB leti hai. Racks signal par 8 se 10 dB ka aur shadow dalte hain. Received signal lagbhag 14 + 3 - 77 - 15 - 9 = -84 dBm. Scanner ko lagbhag -70 dBm chahiye. Kami 14 dB hai, isliye power badalne se sensible tareeke se fix nahi hoga. AP ko aisles ke andar jaana padega.</p></div>

<h3>Warehouse ke options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Fayda</th><th>Trade-off</th></tr>
<tr><td>Office AP ka power badhao</td><td>Naya cabling nahi</td><td>Client uplink phir bhi weak, link ek-tarfa rehta hai; aur jagah interference badhta hai</td></tr>
<tr><td>10 m par omni antennas wale ceiling APs</td><td>Mounting aasaan</td><td>Racks signal par shadow dalte hain; cell aisle segments mein kat jaata hai</td></tr>
<tr><td>Rack ends ya beams se aisles ki taraf aim kiye directional (patch ya narrow) antennas</td><td>Signal aisle follow karta hai; kam cells padosi aisles tak pahunchte hain</td><td>Dhyaan se aiming; zyada cabling aur mounting hardware</td></tr>
</table>
<p>Chosen: aisles ke saath directional antennas, staggered taaki padosi aisles alag channels use karein, aur office ka apna AP. Predictive model ne layout diya aur ek aisle ke far end par asli scanner se on-site test ne numbers confirm kiye (chapter 4).</p>

<h3>Environment profiles jo pehchanne hain</h3>
<ul>
<li><b>Healthcare.</b> Mixed walls, lead aur shielded rooms, elevators, bahut saare roaming voice users, 2.4 GHz-only medical devices, strict RF safety rules, aur equipment jo interference ke prati sensitive ho sakta hai. Lower power, zyada cells, aur biomedical engineering ke saath verify karo.</li>
<li><b>Warehouse aur retail.</b> High ceilings, racks aur stock jo badalta rehta hai (bhare racks khaali se zyada absorb karte hain). Representative stock levels ke saath survey karo. Aisles ke liye directional antennas use karo.</li>
<li><b>Manufacturing.</b> Machines, welders, motors aur reflective metal noise aur heavy multipath paida karte hain. Machines chalte hue survey plan karo, shielded ya enclosed mounts use karo, aur spectrum analyser se non-Wi-Fi interference verify karo (chapter 6).</li>
<li><b>Outdoor.</b> Line of sight, weather, foliage, vehicles aur ground reflections. Outdoor-rated APs aur antennas use karo, regulatory power limits check karo, aur yaad rakho ki patte aur baarish higher frequencies par zyada attenuate karte hain.</li>
<li><b>Offices aur education.</b> Halki walls, zyada clients, open areas. Coverage se zyada capacity matter karti hai.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Table values ko exact numbers maan lena; khaali warehouse ka survey karke bhare warehouse mein deploy karna; normally band rehne wale doors ignore karna; yeh bhool jana ki glass metallised ho sakta hai; elevators aur stairwells ke through design karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam questions materials ko attenuation se rank karte hain (drywall low, brick medium, concrete aur metal high) aur poochte hain ki kis environment ko directional antennas ya on-site survey chahiye. Yaad rakho ki stock, machinery aur log survey ke baad attenuation badal dete hain.</p></div>

<div class="scn"><h4>Jo racks bhar gaye</h4><p>Ek retailer ke predictive plan ne khaali racks maane the. Peak-season stock aane ke baad beech ke aisles ke scanners ka connection toot gaya. Full racks ke saath post-deployment survey ne dikhaya ki model se 10 dB zyada loss tha. Fix: affected aisles mein directional antennas ke saath teen aur APs.</p><p><b>Lesson:</b> environment ko uski worst state mein survey karo ya kam se kam model karo, sabse khaali state mein nahi.</p></div>
<div class="iv"><p class="q">"Design mein walls ko kaise account karte ho?"</p><p>Strong answer: Main floor plans aur site walk se materials identify karta hoon, predictive tool mein typical attenuation figures lagata hoon, aur sabse heavy walls ko on-site survey mein real measurements se verify karta hoon kyunki values thickness aur reinforcement ke saath badalti hain. Elevators, lead rooms aur metal doors ko main boundaries maanta hoon aur unhe apni coverage deta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attenuation dB mein loss hai; halki walls kuch dB, brick zyada, concrete aur metal sabse zyada loss karte hain.</li>
<li>Table values typical planning ranges hain; heavy walls on site measure karo.</li>
<li>Higher frequency matlab har material mein thoda zyada loss.</li>
<li>Environment antenna choice aur survey method tay karta hai: warehouse, hospital, factory, outdoor aur office sab alag hain.</li>
<li>Environment ko uski real operating state mein survey karo: stock, machines aur log.</li>
</ul></div>
`}};export{r as default};