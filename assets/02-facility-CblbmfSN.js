var e={id:`facility`,h:{en:`The facility: power, cooling, fire safety and physical security`,hi:`Facility: power, cooling, fire safety aur physical security`},body:{en:`
<p>Before a single switch is configured, a data center must answer two boring but vital questions: <b>where does the electricity come from, and where does the heat go?</b> Every watt a server draws becomes heat in the room. If power stops, everything stops. If cooling stops, servers shut themselves down within minutes to protect their chips. A network engineer who understands the facility plans racks correctly, reads alarms calmly and earns the trust of the facilities team.</p>

<h3>The power chain, from the grid to the server</h3>
<p>Follow the electricity from outside to inside:</p>
<ol>
<li><b>Utility feeds.</b> The power company delivers medium-voltage electricity. Good sites take two feeds from different substations, so one fault on the grid does not kill both.</li>
<li><b>ATS and generators.</b> An <b>automatic transfer switch (ATS)</b> watches the utility. If it fails, diesel <b>generators</b> start and the ATS moves the load to them, usually within seconds. Sites keep fuel on site for many hours and have refuelling contracts.</li>
<li><b>UPS.</b> An <b>uninterruptible power supply</b> sits between the source and the IT load. Its batteries (or a flywheel) carry the load for the few seconds to minutes until generators take over. An online double-conversion UPS also cleans spikes and dips from the grid.</li>
<li><b>PDUs.</b> <b>Power distribution units</b> split the power into circuits. The big floor PDUs feed <b>rack PDUs</b>, the vertical power strips inside each rack. Metered rack PDUs show the load; switched ones let you power-cycle a single outlet remotely.</li>
<li><b>Dual power supplies.</b> Servers and switches have two power supply units (PSUs). One plugs into the <b>A feed</b>, the other into the <b>B feed</b>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="A and B power paths">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#fed7aa"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">Utility A + gen</text>
<rect x="10" y="150" width="110" height="40" rx="8" fill="#fed7aa"/><text x="65" y="175" text-anchor="middle" class="svg-ink" font-size="13">Utility B + gen</text>
<rect x="160" y="20" width="90" height="40" rx="8" fill="#fde68a"/><text x="205" y="45" text-anchor="middle" class="svg-ink" font-size="13">UPS A</text>
<rect x="160" y="150" width="90" height="40" rx="8" fill="#fde68a"/><text x="205" y="175" text-anchor="middle" class="svg-ink" font-size="13">UPS B</text>
<rect x="290" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="13">Rack PDU A</text>
<rect x="290" y="150" width="110" height="40" rx="8" fill="#bae6fd"/><text x="345" y="175" text-anchor="middle" class="svg-ink" font-size="13">Rack PDU B</text>
<rect x="460" y="75" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="13">Server</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">PSU1 (A)  PSU2 (B)</text>
<line x1="120" y1="40" x2="160" y2="40" stroke="#64748b" stroke-width="2"/><line x1="250" y1="40" x2="290" y2="40" stroke="#64748b" stroke-width="2"/><line x1="400" y1="40" x2="460" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="170" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><line x1="250" y1="170" x2="290" y2="170" stroke="#64748b" stroke-width="2"/><line x1="400" y1="170" x2="460" y2="118" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="13">Two independent paths</text>
</svg><p class="cap">A/B power: every component on the A side can fail and the server keeps running on B.</p></div>

<h3>Redundancy words: N, N+1 and 2N</h3>
<p><b>N</b> is the amount of equipment you need to carry the load. <b>N+1</b> adds one spare (five UPS modules where four are enough). <b>2N</b> duplicates the whole system: a complete A side and a complete B side. 2N costs more but survives the loss of an entire path, including maintenance on it.</p>

<h3>Power budgets per rack</h3>
<p>Every rack gets a <b>power budget</b> in kilowatts (kW). Typical enterprise racks are about 5 to 10 kW, dense virtualisation racks 15 to 30 kW, and GPU racks for AI training can go far beyond 40 kW and often need liquid cooling. The budget limits how many servers you can install, often long before you run out of space.</p>
<div class="eg"><p><b>Worked example.</b> A rack has an 8 kW budget. Each server's nameplate says two 1100 W PSUs, but its measured peak draw is about 450 W. Two leaf switches draw about 400 W each.</p>
<p>Switches: 2 × 400 W = 800 W. Remaining: 8000 − 800 = 7200 W. Servers: 7200 ÷ 450 = <b>16 servers</b>.</p>
<p>Important: with A/B power, <b>each</b> rack PDU must be able to carry the whole 8 kW alone, because when feed A fails all load moves to B. Heat check: 1 kW ≈ 3412 BTU/hr, so 8 kW ≈ 27,300 BTU/hr of heat the cooling must remove.</p></div>

<h3>Cooling: hot aisle and cold aisle</h3>
<p>Servers pull cool air in at the <b>front</b> and blow hot air out of the <b>back</b>. So racks are placed in rows facing each other: fronts face fronts across a <b>cold aisle</b>, backs face backs across a <b>hot aisle</b>. Cold air is supplied to the cold aisle (through perforated floor tiles or from overhead), and hot air returns to the cooling units.</p>
<p><b>Containment</b> puts doors and a roof over one aisle so hot and cold air cannot mix: <b>cold aisle containment</b> or <b>hot aisle containment</b>. <b>Blanking panels</b> close empty rack units so hot air cannot loop back to the front.</p>
<p>The cooling units themselves: a <b>CRAC</b> (computer room air conditioner) has its own refrigerant compressor, like a big split AC. A <b>CRAH</b> (computer room air handler) has fans and a coil fed with chilled water from a central chiller plant. Industry guidance (ASHRAE) recommends server inlet air of about 18 to 27 °C.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Hot aisle and cold aisle">
<rect x="40" y="40" width="160" height="90" rx="6" fill="#e2e8f0"/><text x="120" y="90" text-anchor="middle" class="svg-ink" font-size="13">Rack row 1</text>
<rect x="240" y="40" width="160" height="90" rx="6" fill="#bae6fd"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="14">Cold aisle</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">fronts face here</text>
<rect x="440" y="40" width="160" height="90" rx="6" fill="#e2e8f0"/><text x="520" y="90" text-anchor="middle" class="svg-ink" font-size="13">Rack row 2</text>
<rect x="10" y="40" width="28" height="90" fill="#fed7aa"/><rect x="602" y="40" width="28" height="90" fill="#fed7aa"/>
<text x="24" y="155" text-anchor="middle" class="svg-muted" font-size="12">Hot</text><text x="616" y="155" text-anchor="middle" class="svg-muted" font-size="12">Hot</text>
<text x="320" y="25" text-anchor="middle" class="svg-accent" font-size="13">Cool air in at the front, hot air out at the back</text>
</svg><p class="cap">Rows face each other across the cold aisle; exhausts meet in the hot aisles.</p></div>

<h3>PUE: how efficient is the building?</h3>
<p><b>Power Usage Effectiveness</b> = total facility power ÷ IT equipment power. A perfect building would score 1.0 (every watt goes to IT). Cooling, UPS losses and lighting push it higher.</p>
<div class="eg"><p><b>Worked example.</b> The utility meter shows 1,500 kW for the whole site. The UPS outputs to IT equipment total 1,000 kW. PUE = 1500 ÷ 1000 = <b>1.5</b>. So 500 kW, one third of the bill, is overhead. Improving containment cut cooling by 200 kW: new PUE = 1300 ÷ 1000 = <b>1.3</b>.</p></div>

<h3>Uptime Institute Tiers</h3>
<table class="cmp"><tr><th>Tier</th><th>Meaning</th><th>Commonly quoted availability</th></tr>
<tr><td>I</td><td>Basic capacity, single path, no redundancy</td><td>99.671%</td></tr>
<tr><td>II</td><td>Redundant components (N+1), still a single path</td><td>99.741%</td></tr>
<tr><td>III</td><td><b>Concurrently maintainable</b>: any component can be taken down for maintenance without stopping IT</td><td>99.982%</td></tr>
<tr><td>IV</td><td><b>Fault tolerant</b>: survives any single unplanned failure, fully independent paths (typically 2N)</td><td>99.995%</td></tr>
</table>

<h3>Fire suppression and physical security</h3>
<p>Detection comes first: <b>VESDA</b> (very early smoke detection apparatus) sucks air through pipes and detects smoke long before a normal detector. Suppression is often a <b>clean agent gas</b> (such as FM-200 or inert gas blends) that puts out fire without damaging electronics, or <b>pre-action sprinklers</b> whose pipes stay dry until detection confirms a fire. An <b>EPO</b> (emergency power off) button cuts power for safety and is always guarded against accidental presses.</p>
<p>Physical security is layered like an onion: perimeter fence and guards, reception with ID check, <b>mantrap</b> (a two-door airlock that lets one person through at a time), badge plus biometric at the data hall, CCTV everywhere, locked cages and locked racks, and visitor escort logs.</p>

<div class="warn"><p><b>Common mistakes.</b> Plugging both PSUs into the same PDU "because the cable was short". Loading A and B PDUs above 50% each, so a single-feed failure overloads the survivor and trips it too. Leaving empty rack units open without blanking panels.</p></div>
<div class="exam"><p><b>Exam and interview trap.</b> Tier III means <i>concurrently maintainable</i>; Tier IV means <i>fault tolerant</i>. PUE is total facility power divided by IT power, never the other way round.</p></div>

<div class="scn"><h4>The PDU that tripped twice</h4><p>During a planned UPS-A maintenance, three racks went completely dark. The facilities team had checked that every server had two PSUs. The network engineer pulled the PDU readings: rack PDU B in each dark rack had been running at 62% of its breaker rating, and PDU A at 58%. When A was switched off, B tried to carry 120% and its breaker tripped. The fix was to move four servers to a new rack, keep each side under 40% of its rating, and add a monitoring alert at 40%.</p><p><b>Lesson:</b> A/B power only works if each side can carry the full load alone. Check the numbers, not just the cables.</p></div>

<div class="iv"><p class="q">"What is PUE, and what does a PUE of 1.5 mean?"</p><p>Strong answer: PUE is total facility power divided by IT equipment power. 1.5 means for every 1 kW used by servers and switches, another 0.5 kW goes to cooling, UPS losses and lighting. Mention that lower is better, 1.0 is the theoretical ideal, and that containment, higher inlet temperatures within ASHRAE limits and free cooling are the usual ways to reduce it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Power path: utility, ATS and generators, UPS, floor PDU, rack PDU, dual PSUs on A and B feeds.</li>
<li>Each feed must carry the full rack load alone; the power budget in kW usually limits a rack before space does.</li>
<li>Hot aisle/cold aisle plus containment and blanking panels keep cooling efficient; CRAC uses refrigerant, CRAH uses chilled water.</li>
<li>PUE = total facility power ÷ IT power; 1.0 is ideal.</li>
<li>Tier III = concurrently maintainable, Tier IV = fault tolerant; security and fire protection are layered.</li>
</ul></div>
`,hi:`
<p>Ek bhi switch configure hone se pehle, data center ko do boring lekin bahut zaroori sawaalon ka jawab dena padta hai: <b>bijli kahan se aati hai, aur garmi kahan jaati hai?</b> Server jo bhi watt leta hai, woh room mein garmi ban jaata hai. Agar power ruki, to sab ruk jaata hai. Agar cooling ruki, to servers apne chips bachane ke liye kuch hi minute mein khud shut down ho jaate hain. Jo network engineer facility samajhta hai, woh racks sahi plan karta hai, alarms shaanti se padhta hai aur facilities team ka bharosa jeet leta hai.</p>

<h3>Power chain, grid se server tak</h3>
<p>Bijli ko bahar se andar tak follow karo:</p>
<ol>
<li><b>Utility feeds.</b> Power company medium-voltage bijli deti hai. Achhi sites alag alag substations se do feeds leti hain, taaki grid ka ek fault dono ko band na kare.</li>
<li><b>ATS aur generators.</b> <b>Automatic transfer switch (ATS)</b> utility ko watch karta hai. Agar woh fail ho, to diesel <b>generators</b> start hote hain aur ATS load ko un par shift kar deta hai, aam taur par kuch seconds mein. Sites kai ghanton ka fuel site par rakhti hain aur refuelling contracts rakhti hain.</li>
<li><b>UPS.</b> <b>Uninterruptible power supply</b> source aur IT load ke beech baitha hota hai. Uski batteries (ya flywheel) load ko kuch seconds se kuch minute tak sambhaalti hain, jab tak generators kaam na sambhaal lein. Online double-conversion UPS grid ke spikes aur dips ko bhi saaf karta hai.</li>
<li><b>PDUs.</b> <b>Power distribution units</b> power ko circuits mein baant-te hain. Bade floor PDUs <b>rack PDUs</b> ko feed karte hain, jo har rack ke andar vertical power strips hote hain. Metered rack PDUs load dikhate hain; switched PDUs se aap ek single outlet ko remotely power-cycle kar sakte ho.</li>
<li><b>Dual power supplies.</b> Servers aur switches mein do power supply units (PSUs) hote hain. Ek <b>A feed</b> mein lagta hai, dusra <b>B feed</b> mein.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="A aur B power paths">
<rect x="10" y="20" width="110" height="40" rx="8" fill="#fed7aa"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">Utility A + gen</text>
<rect x="10" y="150" width="110" height="40" rx="8" fill="#fed7aa"/><text x="65" y="175" text-anchor="middle" class="svg-ink" font-size="13">Utility B + gen</text>
<rect x="160" y="20" width="90" height="40" rx="8" fill="#fde68a"/><text x="205" y="45" text-anchor="middle" class="svg-ink" font-size="13">UPS A</text>
<rect x="160" y="150" width="90" height="40" rx="8" fill="#fde68a"/><text x="205" y="175" text-anchor="middle" class="svg-ink" font-size="13">UPS B</text>
<rect x="290" y="20" width="110" height="40" rx="8" fill="#bae6fd"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="13">Rack PDU A</text>
<rect x="290" y="150" width="110" height="40" rx="8" fill="#bae6fd"/><text x="345" y="175" text-anchor="middle" class="svg-ink" font-size="13">Rack PDU B</text>
<rect x="460" y="75" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="13">Server</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">PSU1 (A)  PSU2 (B)</text>
<line x1="120" y1="40" x2="160" y2="40" stroke="#64748b" stroke-width="2"/><line x1="250" y1="40" x2="290" y2="40" stroke="#64748b" stroke-width="2"/><line x1="400" y1="40" x2="460" y2="95" stroke="#64748b" stroke-width="2"/>
<line x1="120" y1="170" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><line x1="250" y1="170" x2="290" y2="170" stroke="#64748b" stroke-width="2"/><line x1="400" y1="170" x2="460" y2="118" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="13">Do independent raaste</text>
</svg><p class="cap">A/B power: A side ka har component fail ho sakta hai aur server B par chalta rehta hai.</p></div>

<h3>Redundancy ke shabd: N, N+1 aur 2N</h3>
<p><b>N</b> utna equipment hai jitna load uthane ke liye chahiye. <b>N+1</b> ek spare jodta hai (paanch UPS modules jahan chaar kaafi hain). <b>2N</b> poore system ko double karta hai: ek complete A side aur ek complete B side. 2N mehenga hai lekin poora ek path khone par bhi chalta hai, us path par maintenance ke dauraan bhi.</p>

<h3>Har rack ka power budget</h3>
<p>Har rack ko kilowatts (kW) mein ek <b>power budget</b> milta hai. Typical enterprise racks lagbhag 5 se 10 kW ke hote hain, dense virtualisation racks 15 se 30 kW, aur AI training ke GPU racks 40 kW se bhi kaafi upar jaa sakte hain aur aksar liquid cooling maangte hain. Budget yeh limit karta hai ki aap kitne servers laga sakte ho, aksar jagah khatam hone se kaafi pehle.</p>
<div class="eg"><p><b>Worked example.</b> Ek rack ka budget 8 kW hai. Har server ki nameplate par do 1100 W PSUs likhe hain, lekin uska measured peak draw lagbhag 450 W hai. Do leaf switches har ek lagbhag 400 W lete hain.</p>
<p>Switches: 2 × 400 W = 800 W. Bacha: 8000 − 800 = 7200 W. Servers: 7200 ÷ 450 = <b>16 servers</b>.</p>
<p>Zaroori baat: A/B power mein <b>har</b> rack PDU ko poora 8 kW akele uthana aana chahiye, kyunki feed A fail hote hi saara load B par aa jaata hai. Heat check: 1 kW ≈ 3412 BTU/hr, to 8 kW ≈ 27,300 BTU/hr garmi jo cooling ko nikaalni hai.</p></div>

<h3>Cooling: hot aisle aur cold aisle</h3>
<p>Servers <b>aage</b> se thandi hawa kheenchte hain aur <b>peeche</b> se garam hawa phenkte hain. Isliye racks rows mein ek dusre ke aamne-saamne rakhe jaate hain: fronts ek <b>cold aisle</b> ke paar fronts ko dekhte hain, backs ek <b>hot aisle</b> ke paar backs ko. Thandi hawa cold aisle mein di jaati hai (perforated floor tiles se ya upar se), aur garam hawa cooling units tak wapas jaati hai.</p>
<p><b>Containment</b> ek aisle par darwaze aur chhat laga deta hai taaki garam aur thandi hawa mix na ho: <b>cold aisle containment</b> ya <b>hot aisle containment</b>. <b>Blanking panels</b> khaali rack units ko band karte hain taaki garam hawa ghoom kar aage na aa jaaye.</p>
<p>Khud cooling units: <b>CRAC</b> (computer room air conditioner) ka apna refrigerant compressor hota hai, ek bade split AC jaisa. <b>CRAH</b> (computer room air handler) mein fans aur ek coil hota hai jise central chiller plant se chilled water milta hai. Industry guidance (ASHRAE) server inlet hawa lagbhag 18 se 27 °C recommend karti hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Hot aisle aur cold aisle">
<rect x="40" y="40" width="160" height="90" rx="6" fill="#e2e8f0"/><text x="120" y="90" text-anchor="middle" class="svg-ink" font-size="13">Rack row 1</text>
<rect x="240" y="40" width="160" height="90" rx="6" fill="#bae6fd"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="14">Cold aisle</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">fronts idhar dekhte hain</text>
<rect x="440" y="40" width="160" height="90" rx="6" fill="#e2e8f0"/><text x="520" y="90" text-anchor="middle" class="svg-ink" font-size="13">Rack row 2</text>
<rect x="10" y="40" width="28" height="90" fill="#fed7aa"/><rect x="602" y="40" width="28" height="90" fill="#fed7aa"/>
<text x="24" y="155" text-anchor="middle" class="svg-muted" font-size="12">Hot</text><text x="616" y="155" text-anchor="middle" class="svg-muted" font-size="12">Hot</text>
<text x="320" y="25" text-anchor="middle" class="svg-accent" font-size="13">Thandi hawa aage se andar, garam hawa peeche se bahar</text>
</svg><p class="cap">Rows cold aisle ke paar ek dusre ko dekhti hain; exhausts hot aisles mein milte hain.</p></div>

<h3>PUE: building kitni efficient hai?</h3>
<p><b>Power Usage Effectiveness</b> = total facility power ÷ IT equipment power. Ek perfect building ka score 1.0 hoga (har watt IT ko jaaye). Cooling, UPS losses aur lighting ise upar le jaate hain.</p>
<div class="eg"><p><b>Worked example.</b> Utility meter poori site ke liye 1,500 kW dikhata hai. IT equipment ko UPS outputs ka total 1,000 kW hai. PUE = 1500 ÷ 1000 = <b>1.5</b>. Yaani 500 kW, bill ka ek-tihaai, overhead hai. Containment sudhaarne se cooling 200 kW kam hui: naya PUE = 1300 ÷ 1000 = <b>1.3</b>.</p></div>

<h3>Uptime Institute Tiers</h3>
<table class="cmp"><tr><th>Tier</th><th>Matlab</th><th>Aam taur par quote ki jaane wali availability</th></tr>
<tr><td>I</td><td>Basic capacity, single path, koi redundancy nahi</td><td>99.671%</td></tr>
<tr><td>II</td><td>Redundant components (N+1), lekin path abhi bhi ek</td><td>99.741%</td></tr>
<tr><td>III</td><td><b>Concurrently maintainable</b>: koi bhi component maintenance ke liye band kiya ja sakta hai bina IT roke</td><td>99.982%</td></tr>
<tr><td>IV</td><td><b>Fault tolerant</b>: koi bhi single unplanned failure jhel leta hai, poori tarah independent paths (aam taur par 2N)</td><td>99.995%</td></tr>
</table>

<h3>Fire suppression aur physical security</h3>
<p>Pehle detection aata hai: <b>VESDA</b> (very early smoke detection apparatus) pipes ke through hawa kheenchta hai aur normal detector se kaafi pehle dhuan pakad leta hai. Suppression aksar ek <b>clean agent gas</b> hoti hai (jaise FM-200 ya inert gas blends) jo electronics ko nuksaan pahunchaye bina aag bujhati hai, ya <b>pre-action sprinklers</b> jinke pipes tab tak sookhe rehte hain jab tak detection aag confirm na kare. <b>EPO</b> (emergency power off) button safety ke liye power kaat deta hai aur galti se dabne se hamesha guard kiya jaata hai.</p>
<p>Physical security pyaaz ki tarah layers mein hoti hai: perimeter fence aur guards, reception par ID check, <b>mantrap</b> (do darwazon wala airlock jo ek baar mein ek hi insaan ko jaane deta hai), data hall par badge plus biometric, har jagah CCTV, locked cages aur locked racks, aur visitor escort logs.</p>

<div class="warn"><p><b>Common galtiyan.</b> Dono PSUs ek hi PDU mein laga dena "kyunki cable chhoti thi". A aur B PDUs ko 50% se zyada load karna, jisse ek feed fail hone par bacha hua PDU overload ho kar woh bhi trip ho jaata hai. Khaali rack units ko blanking panels ke bina khula chhod dena.</p></div>
<div class="exam"><p><b>Exam aur interview trap.</b> Tier III ka matlab <i>concurrently maintainable</i>; Tier IV ka matlab <i>fault tolerant</i>. PUE total facility power ko IT power se divide karna hai, ulta kabhi nahi.</p></div>

<div class="scn"><h4>Woh PDU jo do baar trip hua</h4><p>Planned UPS-A maintenance ke dauraan teen racks poori tarah band ho gaye. Facilities team ne check kiya tha ki har server mein do PSUs hain. Network engineer ne PDU readings nikaali: har band rack mein rack PDU B apni breaker rating ke 62% par chal raha tha, aur PDU A 58% par. Jab A band hua, to B ne 120% uthane ki koshish ki aur uska breaker trip ho gaya. Fix yeh tha ki chaar servers ko naye rack mein shift kiya, har side ko uski rating ke 40% se neeche rakha, aur 40% par ek monitoring alert lagaya.</p><p><b>Seekh:</b> A/B power tabhi kaam karta hai jab har side poora load akele utha sake. Sirf cables nahi, numbers check karo.</p></div>

<div class="iv"><p class="q">"PUE kya hai, aur PUE 1.5 ka kya matlab hai?"</p><p>Strong answer: PUE total facility power ko IT equipment power se divide karna hai. 1.5 ka matlab hai ki servers aur switches jo har 1 kW use karte hain, uske upar 0.5 kW aur cooling, UPS losses aur lighting mein jaata hai. Batao ki kam behtar hai, 1.0 theoretical ideal hai, aur containment, ASHRAE limits ke andar zyada inlet temperature aur free cooling ise kam karne ke aam tareeke hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Power path: utility, ATS aur generators, UPS, floor PDU, rack PDU, A aur B feeds par dual PSUs.</li>
<li>Har feed ko poora rack load akele uthana aana chahiye; kW wala power budget aksar jagah se pehle rack ko limit karta hai.</li>
<li>Hot aisle/cold aisle plus containment aur blanking panels cooling ko efficient rakhte hain; CRAC refrigerant use karta hai, CRAH chilled water.</li>
<li>PUE = total facility power ÷ IT power; 1.0 ideal hai.</li>
<li>Tier III = concurrently maintainable, Tier IV = fault tolerant; security aur fire protection layers mein hote hain.</li>
</ul></div>
`}};export{e as default};