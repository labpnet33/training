var e=(e,t)=>`<circle cx="`+e+`" cy="`+t+`" r="6" fill="#0ea5e9"/>`,t=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="`+n+`" fill="#0ea5e9" fill-opacity="0.12" stroke="#0ea5e9" stroke-dasharray="4 3"/>`,n=n=>`<div class="dia"><svg viewBox="0 0 640 310" role="img" aria-label="`+n.aria+`"><ellipse cx="320" cy="140" rx="300" ry="125" fill="#fde68a" stroke="#64748b" stroke-width="2"/><ellipse cx="320" cy="140" rx="215" ry="88" fill="#bbf7d0" stroke="#64748b"/><ellipse cx="320" cy="140" rx="120" ry="45" fill="#bae6fd" stroke="#64748b"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">`+n.pitch+`</text><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">`+n.upper+`</text><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="12">`+n.lower+`</text>`+t(90,140,40)+t(150,70,40)+t(150,210,40)+t(550,140,40)+t(490,70,40)+t(490,210,40)+t(320,250,30)+e(90,140)+e(150,70)+e(150,210)+e(550,140)+e(490,70)+e(490,210)+e(320,250)+`<circle cx="14" cy="296" r="6" fill="#0ea5e9"/><text x="26" y="300" class="svg-ink" font-size="12">`+n.l1+`</text><rect x="250" y="288" width="14" height="14" fill="#bae6fd"/><text x="270" y="300" class="svg-ink" font-size="12">`+n.l2+`</text><rect x="400" y="288" width="14" height="14" fill="#bbf7d0"/><text x="420" y="300" class="svg-ink" font-size="12">`+n.l3+`</text><rect x="520" y="288" width="14" height="14" fill="#fde68a"/><text x="540" y="300" class="svg-ink" font-size="12">`+n.l4+`</text></svg><p class="cap">`+n.cap+`</p></div>`,r=n({aria:`Stadium directional AP layout`,pitch:`Pitch`,upper:`Upper tier`,lower:`Lower tier`,l1:`Directional AP cell`,l2:`Pitch`,l3:`Lower seats`,l4:`Upper seats`,cap:`Simplified Meridian Arena plan: directional APs from the stand edges aim down at seat blocks so each cell serves one section. Each cell is small on purpose.`}),i=n({aria:`Stadium directional AP layout`,pitch:`Pitch`,upper:`Upper tier`,lower:`Lower tier`,l1:`Directional AP cell`,l2:`Pitch`,l3:`Lower seats`,l4:`Upper seats`,cap:`Simplified Meridian Arena plan: stand edges se directional APs seat blocks par neeche aim karte hain, taaki har cell ek section serve kare. Har cell jaanbujhkar chhota hai.`}),a={id:`placement-antennas-capacity`,h:{en:`AP placement, antennas and capacity: coverage versus capacity design`,hi:`AP placement, antennas aur capacity: coverage versus capacity design`},body:{en:`
<p>After requirements and survey comes the core design work: where to put APs, which antennas to use, and how many APs the user load needs. The key idea is that <b>coverage and capacity are different goals</b>. Covering a room means the signal is strong enough. Capacity means enough airtime for everyone in it.</p>

<h3>Case: Meridian Arena, 18,000 seats</h3>
<p>Meridian Arena (fictional) wants fans to upload photos and stream replays during matches, plus ticket scanning at gates and point-of-sale in the concourse. Peak assumption: 40 percent of fans connect, so about 7,200 devices, each averaging 1 Mbps during busy minutes. Constraints: steel roof trusses, concrete bowl, no mounting on the pitch, a safety requirement that all equipment be secured, and a short window between events for installation.</p>

<h3>Coverage design versus capacity design</h3>
<table class="cmp"><tr><th></th><th>Coverage design</th><th>Capacity design</th></tr>
<tr><td>Question</td><td>Is the signal strong enough everywhere?</td><td>Is there enough airtime for everyone at once?</td></tr>
<tr><td>Limiting factor</td><td>Range, walls, power</td><td>Clients per radio, channel reuse, data rate</td></tr>
<tr><td>Typical sites</td><td>Warehouses, corridors, outdoors</td><td>Auditoriums, lecture halls, stadiums, conference centres</td></tr>
<tr><td>Strategy</td><td>Fewer, higher-power APs</td><td>More, lower-power APs in small cells</td></tr>
</table>
<div class="eg"><p><b>Worked example.</b> Meridian needs 7,200 devices x 1 Mbps = 7.2 Gbps of busy-hour demand. If a well-planned radio delivers about 100 Mbps of real usable throughput at the planned data rates (a planning assumption you validate on site), you need roughly 72 radios on separate or well-reused channels. Because each AP has two or three radios, but only the 5 GHz and 6 GHz radios carry the load well, plan around 36 to 50 APs in the bowl, then add more where the seat density is highest. A count based on area alone would give only a handful of APs.</p></div>

<h3>Antenna choices</h3>
<dl class="terms"><dt>Omnidirectional</dt><dd>Spreads signal 360 degrees around the AP. Used for open ceilings in offices and classrooms. A ceiling omni's pattern is a donut: strong around, weak straight below.</dd>
<dt>Directional (patch, panel, sector, Yagi)</dt><dd>Focuses signal in one direction. Gives more reach and narrower beams. Used in aisles, stadium seat blocks, outdoor links and long halls.</dd>
<dt>Gain (dBi)</dt><dd>How much an antenna focuses energy relative to an ideal isotropic radiator. Higher gain means narrower beam, not more total power.</dd>
<dt>Beamwidth</dt><dd>The angle in which the antenna is effective. A 60 degree patch covers a smaller area than a 120 degree sector.</dd>
<dt>Down tilt</dt><dd>Aiming the main beam below horizontal so it lands on the intended floor area and not on the next building or the upper tier.</dd></dl>
<p>Internal-antenna ceiling APs suit most offices. External-antenna APs and directional antennas suit stadiums, warehouses, factories and outdoor areas, and allow antennas to be placed away from the AP housing.</p>

<h3>AP placement principles</h3>
<ul>
<li><b>Place for the client, not for the cable closet.</b> Put APs close to where devices are, ideally at the ceiling in the middle of the area.</li>
<li><b>Keep cells small in dense areas and use lower power.</b> Matching AP power to client power avoids "loud AP, quiet client" one-way links.</li>
<li><b>Overlap for roaming.</b> Voice and location need about 15 to 20 percent cell overlap (typical guidance), so a second AP is always audible.</li>
<li><b>Stagger channels.</b> Neighbours should never share a channel (next chapter).</li>
<li><b>Avoid obstructions.</b> Do not mount above metal ducts, behind signs, in elevator shafts or inside racks.</li>
<li><b>Respect height.</b> Typical ceiling mounting is 3 to 4 metres for omni; at 10 metres or more use directional antennas down-tilted to the floor.</li>
<li><b>Plan wired and PoE.</b> Cable length (100 metre copper limit), switch port speed (multigigabit for Wi-Fi 6/6E/7 APs) and PoE budget are design inputs.</li>
</ul>

<h3>Options and chosen design for Meridian</h3>
<table class="cmp"><tr><th>Option</th><th>Benefit</th><th>Trade-off</th></tr>
<tr><td>Overhead omni APs on roof trusses</td><td>Easy cabling</td><td>Cells overlap across sections; heavy co-channel interference</td></tr>
<tr><td>Under-seat or handrail APs, one per few rows</td><td>Very small cells, strong isolation by the crowd and concrete</td><td>Hundreds of devices, cabling in the bowl, cost and maintenance</td></tr>
<tr><td>Directional APs from stand edges and the roof, aimed at seat sections</td><td>Controlled cells with moderate cabling</td><td>Careful aiming and surveying; packed crowd absorbs signal</td></tr>
</table>
`+r+`
<p>The engineer chooses directional APs with narrow-beam antennas for the main bowl, with handrail APs only in the highest-density lower tier. In the concourse, ceiling APs with omni antennas serve vendors and scanners. The gates use a separate low-power cell for ticket scanners.</p>

<div class="warn"><p><b>Common mistakes.</b> Designing a stadium by area; using high-gain omnis expecting more range indoors; mounting an omni AP in a high bay (the signal is weak straight down where the users are); not accounting for a crowd absorbing roughly 3 to 5 dB (a typical range, depends on density); leaving a client weaker than the AP.</p></div>
<div class="exam"><p><b>Exam trap.</b> More power or more gain is not the fix for capacity. Capacity needs more radios in small cells. Down tilt aims the beam at the users. A high-gain antenna narrows the beam.</p></div>

<div class="scn"><h4>The match-day meltdown</h4><p>At the first sold-out match, the arena's roof-mounted APs showed full signal but fans could not upload a photo. Each AP carried 400 clients and shared the same three channels with neighbours. The fix, over the next two weeks, was to drop power, add directional handrail APs in the busiest sections, cap data rates by disabling low rates, and widen the channel plan to include 6 GHz.</p><p><b>Lesson:</b> signal bars are not capacity. Count clients and airtime, not just dBm.</p></div>
<div class="iv"><p class="q">"How do you decide AP count for a lecture hall of 300 students?"</p><p>Strong answer: I start from capacity, not area. 300 students with two devices each is 600 clients; at a planned maximum of about 25 to 30 active clients per radio, I need many radios on separate channels, so I use several APs with small cells, lower power, directional antennas or under-seat placement, and verify with a survey.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Coverage means signal strength; capacity means airtime. High-density sites are capacity-limited.</li>
<li>Omni antennas suit ceilings; directional antennas suit aisles, stands, halls and outdoors; down tilt aims the beam.</li>
<li>Gain narrows the beam; it does not create power.</li>
<li>Place APs near clients, with lower power and small cells in dense areas, and enough overlap for roaming.</li>
<li>Wired distance, multigigabit ports and PoE budget limit placement.</li>
</ul></div>
`,hi:`
<p>Requirements aur survey ke baad core design kaam aata hai: APs kahan lagane hain, kaunse antennas use karne hain, aur user load ke liye kitne APs chahiye. Key idea yeh hai ki <b>coverage aur capacity alag goals hain</b>. Room cover karne ka matlab signal kaafi strong hai. Capacity ka matlab hai usme sabke liye kaafi airtime hai.</p>

<h3>Case: Meridian Arena, 18,000 seats</h3>
<p>Meridian Arena (fictional) chahta hai ki fans matches ke dauraan photos upload karein aur replays stream karein, saath hi gates par ticket scanning aur concourse mein point-of-sale ho. Peak assumption: 40 percent fans connect karte hain, yani lagbhag 7,200 devices, busy minutes mein har ek average 1 Mbps. Constraints: steel roof trusses, concrete bowl, pitch par mounting nahi, safety requirement ki saara equipment secured ho, aur events ke beech installation ki chhoti window.</p>

<h3>Coverage design versus capacity design</h3>
<table class="cmp"><tr><th></th><th>Coverage design</th><th>Capacity design</th></tr>
<tr><td>Sawaal</td><td>Kya signal har jagah kaafi strong hai?</td><td>Kya sabke liye ek saath kaafi airtime hai?</td></tr>
<tr><td>Limiting factor</td><td>Range, walls, power</td><td>Clients per radio, channel reuse, data rate</td></tr>
<tr><td>Typical sites</td><td>Warehouses, corridors, outdoors</td><td>Auditoriums, lecture halls, stadiums, conference centres</td></tr>
<tr><td>Strategy</td><td>Kam, higher-power APs</td><td>Zyada, lower-power APs chhote cells mein</td></tr>
</table>
<div class="eg"><p><b>Worked example.</b> Meridian ko 7,200 devices x 1 Mbps = 7.2 Gbps busy-hour demand chahiye. Agar ek well-planned radio planned data rates par lagbhag 100 Mbps real usable throughput deta hai (planning assumption jo aap site par validate karte ho), to lagbhag 72 radios chahiye alag ya achhi tarah reuse hue channels par. Kyunki har AP mein do ya teen radios hote hain lekin load sirf 5 GHz aur 6 GHz radios achhe se uthate hain, bowl mein lagbhag 36 se 50 APs plan karo, phir jahan seat density sabse zyada hai wahan aur jodo. Sirf area se nikala count bas kuch APs deta.</p></div>

<h3>Antenna choices</h3>
<dl class="terms"><dt>Omnidirectional</dt><dd>Signal AP ke aas-paas 360 degree phailata hai. Offices aur classrooms ki open ceilings ke liye. Ceiling omni ka pattern donut jaisa hota hai: aas-paas strong, seedhe neeche weak.</dd>
<dt>Directional (patch, panel, sector, Yagi)</dt><dd>Signal ek direction mein focus karta hai. Zyada reach aur narrow beam deta hai. Aisles, stadium seat blocks, outdoor links aur lambe halls mein use hota hai.</dd>
<dt>Gain (dBi)</dt><dd>Antenna ideal isotropic radiator ke mukable energy kitni focus karta hai. Higher gain ka matlab narrow beam hai, zyada total power nahi.</dd>
<dt>Beamwidth</dt><dd>Woh angle jisme antenna effective hai. 60 degree patch 120 degree sector se chhota area cover karta hai.</dd>
<dt>Down tilt</dt><dd>Main beam ko horizontal se neeche aim karna taaki woh intended floor area par pade, agli building ya upper tier par nahi.</dd></dl>
<p>Internal-antenna ceiling APs zyadatar offices ke liye theek hain. External-antenna APs aur directional antennas stadiums, warehouses, factories aur outdoor areas ke liye hain, aur antennas ko AP housing se door lagane dete hain.</p>

<h3>AP placement principles</h3>
<ul>
<li><b>Client ke liye place karo, cable closet ke liye nahi.</b> APs wahan lagao jahan devices hain, ideally area ke beech ceiling par.</li>
<li><b>Dense areas mein cells chhote aur power low rakho.</b> AP power ko client power se match karne se "loud AP, quiet client" one-way links bachte hain.</li>
<li><b>Roaming ke liye overlap.</b> Voice aur location ko lagbhag 15 se 20 percent cell overlap chahiye (typical guidance), taaki doosra AP hamesha sunai de.</li>
<li><b>Channels stagger karo.</b> Padosi kabhi channel share na karein (agla chapter).</li>
<li><b>Obstructions se bacho.</b> Metal ducts ke upar, signs ke peeche, elevator shafts mein ya racks ke andar mount mat karo.</li>
<li><b>Height ka dhyaan.</b> Omni ke liye typical ceiling mounting 3 se 4 metre; 10 metre ya zyada par floor ki taraf down-tilted directional antennas use karo.</li>
<li><b>Wired aur PoE plan karo.</b> Cable length (copper limit 100 metre), switch port speed (Wi-Fi 6/6E/7 APs ke liye multigigabit) aur PoE budget design inputs hain.</li>
</ul>

<h3>Meridian ke options aur chosen design</h3>
<table class="cmp"><tr><th>Option</th><th>Fayda</th><th>Trade-off</th></tr>
<tr><td>Roof trusses par overhead omni APs</td><td>Cabling aasaan</td><td>Cells sections ke beech overlap karte hain; heavy co-channel interference</td></tr>
<tr><td>Under-seat ya handrail APs, kuch rows par ek</td><td>Bahut chhote cells, crowd aur concrete se strong isolation</td><td>Sau-do-sau devices, bowl mein cabling, cost aur maintenance</td></tr>
<tr><td>Stand edges aur roof se seat sections par aim kiye directional APs</td><td>Moderate cabling ke saath controlled cells</td><td>Dhyaan se aiming aur surveying; bhari crowd signal absorb karti hai</td></tr>
</table>
`+i+`
<p>Engineer main bowl ke liye narrow-beam antennas wale directional APs chunta hai, handrail APs sirf sabse dense lower tier mein. Concourse mein omni antennas wale ceiling APs vendors aur scanners ko serve karte hain. Gates par ticket scanners ke liye alag low-power cell hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Stadium ko area se design karna; indoors zyada range ki ummeed mein high-gain omnis use karna; high bay mein omni AP lagana (signal seedhe neeche, jahan users hain, weak hota hai); yeh na ginna ki crowd lagbhag 3 se 5 dB absorb karti hai (typical range, density par depend); client ko AP se kamzor chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Capacity ka fix zyada power ya zyada gain nahi hai. Capacity ko chhote cells mein zyada radios chahiye. Down tilt beam ko users par aim karta hai. High-gain antenna beam ko narrow karta hai.</p></div>

<div class="scn"><h4>Match-day meltdown</h4><p>Pehle sold-out match mein arena ke roof-mounted APs full signal dikha rahe the lekin fans photo upload nahi kar paye. Har AP par 400 clients the aur padosiyon ke saath wahi teen channels share ho rahe the. Agle do hafton mein fix: power kam, sabse busy sections mein directional handrail APs, low data rates disable karke rates cap, aur channel plan mein 6 GHz shamil.</p><p><b>Lesson:</b> signal bars capacity nahi hain. Clients aur airtime gino, sirf dBm nahi.</p></div>
<div class="iv"><p class="q">"300 students ke lecture hall ke liye AP count kaise tay karoge?"</p><p>Strong answer: Main capacity se shuru karta hoon, area se nahi. Har student ke do devices se 600 clients; planned maximum lagbhag 25 se 30 active clients per radio par mujhe alag channels par bahut saare radios chahiye, isliye main chhote cells, lower power, directional antennas ya under-seat placement ke saath kai APs use karta hoon, aur survey se verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Coverage ka matlab signal strength; capacity ka matlab airtime. High-density sites capacity-limited hoti hain.</li>
<li>Omni antennas ceilings ke liye; directional antennas aisles, stands, halls aur outdoors ke liye; down tilt beam aim karta hai.</li>
<li>Gain beam ko narrow karta hai; power nahi banata.</li>
<li>APs clients ke paas lagao, dense areas mein low power aur chhote cells, aur roaming ke liye kaafi overlap.</li>
<li>Wired distance, multigigabit ports aur PoE budget placement ko limit karte hain.</li>
</ul></div>
`}};export{a as default};