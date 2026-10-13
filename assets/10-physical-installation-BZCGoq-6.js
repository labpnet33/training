var e={id:`physical-installation`,h:{en:`Physical installation: MDF, IDF, racks, power and environment`,hi:`Physical installation: MDF, IDF, racks, power aur environment`},body:{en:`
<h3>The analogy: a building's plumbing</h3>
<p>Every building has one main water room where the city supply enters, with the big pumps and meters. From there, pipes run up a riser to a small utility cupboard on each floor, and from each cupboard, thin pipes reach every tap. If the main room floods or the pumps lose power, the whole building is dry. Network cabling is organised the same way, and exam objective 2.4 asks you to know that layout, plus the racks, power and environment that keep it running.</p>

<h3>Locations: MDF and IDF</h3>
<p>The <b>main distribution frame (MDF)</b> is the building's main wiring room. It usually holds the service provider's handoff (the demarcation point), the edge routers and firewalls, the core switches, and often the server racks. An <b>intermediate distribution frame (IDF)</b> is a smaller wiring closet, typically one per floor or wing, holding the access switches that the desks plug into. IDFs connect back to the MDF over <b>backbone</b> (vertical) cabling, usually fibre and often in pairs for redundancy. From each IDF, <b>horizontal</b> copper cabling runs to wall outlets, limited to 100 m end to end (90 m permanent link plus patch cords).</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MDF and IDF layout">
<rect x="220" y="160" width="200" height="56" rx="8" fill="#fde68a"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="14">MDF (ground floor)</text><text x="320" y="202" text-anchor="middle" class="svg-muted" font-size="12">ISP demarc · core · firewall</text>
<rect x="40" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">IDF floor 3</text><text x="120" y="60" text-anchor="middle" class="svg-muted" font-size="12">access switches</text>
<rect x="240" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">IDF floor 2</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">access switches</text>
<rect x="440" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">IDF floor 1</text><text x="520" y="60" text-anchor="middle" class="svg-muted" font-size="12">access switches</text>
<line x1="120" y1="70" x2="270" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="520" y1="70" x2="370" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="40" y="120" class="svg-accent" font-size="12">backbone fibre</text><text x="470" y="120" class="svg-muted" font-size="12">horizontal copper to desks</text>
</svg><p class="cap">One MDF, one IDF per floor, fibre backbone between them, copper to the desks.</p></div>

<h3>Racks: size, airflow and locks</h3>
<p>Equipment mounts in standard <b>19-inch racks</b>. Height is counted in <b>rack units (U)</b>: 1U = 1.75 inches (44.45 mm). A full-height rack is typically <b>42U</b>; small IDFs may use a wall-mount 6U to 12U rack. Choose <b>depth</b> to fit the deepest device (servers need deep four-post cabinets; patch panels fit two-post open frames), check the <b>weight</b> rating, mount heavy items like UPS units at the bottom, and leave space for cable managers and growth.</p>
<p><b>Airflow</b> matters as much as space. Data rooms use <b>hot aisle / cold aisle</b> layouts: device fronts face a cold aisle, rears exhaust into a hot aisle. Servers have their network ports at the rear, so a top-of-rack switch is usually mounted with its ports facing the server ports, in the hot aisle. That switch must pull cool air in at its power-supply side and blow it out at its port side: <b>port-side exhaust</b>. A switch mounted with its ports facing the cold aisle needs <b>port-side intake</b> (air enters at the ports, exits at the power supplies). Many switches offer both options as orderable fan and PSU modules; order the wrong one and the switch breathes its own hot air.</p>
<p><b>Lockable</b> racks, cabinet doors and wiring rooms are part of physical security: an unlocked IDF lets anyone plug a laptop into a switch, unplug an uplink, or read the console.</p>

<h3>Cabling: patch panels and fibre distribution panels</h3>
<p>Permanent cables are never plugged straight into switches. Horizontal copper runs are punched down on the back of a <b>patch panel</b> (110-style IDC blocks) that presents labelled RJ45 ports on the front; short patch cords then connect panel ports to switch ports. Backbone fibre terminates in a <b>fibre distribution panel (FDP)</b>, a tray that holds splices or pre-terminated connectors, protects bend radius, and presents LC or SC adapters for fibre patch cords. Both panels mean moves and changes are done with a short patch cord rather than by touching the permanent cabling.</p>

<h3>Power: UPS, PDU, load and voltage</h3>
<ul>
<li><b>UPS (uninterruptible power supply)</b>: batteries that carry equipment through outages and clean up sags, spikes and noise. Types: <i>standby</i> (switches to battery when power fails), <i>line-interactive</i> (regulates voltage), and <i>online / double conversion</i> (always runs from the inverter, best protection). A UPS bridges the gap until a generator starts, or gives time for a clean shutdown.</li>
<li><b>PDU (power distribution unit)</b>: the rack power strip that feeds devices. Basic PDUs just distribute; metered and monitored PDUs report current draw; switched PDUs let you power-cycle an outlet remotely. Devices with two power supplies plug into A and B PDUs on separate circuits.</li>
<li><b>Power load</b>: the total watts drawn. Rate equipment by watts, remember UPS units are rated in VA and watts (W = VA x power factor), and keep a circuit's continuous load at or below about <b>80%</b> of its breaker rating. PoE switches add the power of every phone, camera and access point.</li>
<li><b>Voltage</b>: typically 230 V at 50 Hz in India and Europe, 120 V at 60 Hz in North America, and 208 V or 230 V in many data centers. Most network power supplies are auto-ranging (100 to 240 V), but check before plugging in, and match connectors (C13/C14 for most switches, C19/C20 for high-power chassis).</li>
</ul>
<pre class="out">IDF2-SW1#show power inline
Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
<span class="hl">1           740.0      412.6       327.4</span></pre>

<div class="eg"><p><b>Worked example: sizing an IDF.</b> Two 48-port PoE switches each draw about 120 W for themselves plus up to 300 W of PoE, and a small firewall draws 60 W: 2 x 420 + 60 = 900 W. A UPS rated 1500 VA with power factor 0.9 gives 1350 W, so the load is 67%, leaving room for growth and a reasonable runtime. The rack circuit is 230 V x 16 A = 3680 W; 80% of that is 2944 W, comfortably above 900 W.</p></div>

<h3>Environmental factors</h3>
<ul>
<li><b>Temperature</b>: electronics fail faster when hot. A common target is the ASHRAE recommended inlet range of 18 to 27 °C. Monitor intake temperature, use blanking panels so hot air cannot recirculate, and never let IDFs double as storage rooms with no ventilation.</li>
<li><b>Humidity</b>: too dry encourages static discharge (ESD) that damages components; too humid causes condensation and corrosion. Keep relative humidity moderate, roughly 40 to 60%, and monitor it with the temperature.</li>
<li><b>Fire suppression</b>: ordinary wet-pipe sprinklers destroy electronics. Equipment rooms use <b>pre-action</b> (dry-pipe) sprinklers that fill with water only after detection, or <b>clean-agent</b> gas systems that extinguish fire without residue. Pair them with early smoke detection and suitable extinguishers.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Buying switches with the wrong airflow direction; loading one PDU circuit past 80%; plugging both power supplies into the same PDU; leaving IDF doors unlocked; running copper past 100 m; ignoring PoE when sizing the UPS.</p></div>

<div class="exam"><p><b>Exam traps.</b> MDF = main room with the demarc and core; IDF = floor closet with access switches. 1U = 1.75 in; common rack 42U, 19 in wide. Port-side exhaust vs intake is about matching hot and cold aisles. UPS = battery backup and conditioning; PDU = distribution. Low humidity = static; high humidity = condensation. Clean agent or pre-action suppression protects equipment.</p></div>

<div class="scn"><h4>The IDF that shut down every afternoon</h4><p>Staff on the third floor lost the network around 3 p.m. on hot days. Logs on the access switch showed temperature alarms followed by a shutdown. The IDF was a converted store room with no cooling, the door was kept shut for security, and the new switch had been ordered with port-side intake while mounted with ports facing the wall, so it was breathing its own exhaust. The fix was to add a ventilation fan and temperature sensor, re-mount the switch to match its airflow, and add blanking panels.</p><p><b>Lesson:</b> environment and airflow are part of the network design, not a facilities afterthought.</p></div>

<div class="iv"><p class="q">"What would you check before installing new switches in an IDF?"</p><p>Strong answer: rack space and depth in U, weight, airflow direction versus the room's hot and cold sides, power (circuit rating, voltage, connector type, UPS capacity including PoE load, A and B feeds), cabling (patch panel ports, fibre panel and optics for the backbone, 100 m copper limit), environment (temperature, humidity, fire suppression) and physical security (lockable rack and room). Mention labelling and documentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MDF holds the demarc and core; IDFs on each floor hold access switches, linked by fibre backbone.</li>
<li>Racks are 19 in wide and measured in U (1U = 1.75 in); plan depth, weight and airflow direction.</li>
<li>Patch panels (copper) and fibre distribution panels protect permanent cabling; racks and rooms should lock.</li>
<li>UPS protects against outages; PDUs distribute power; keep circuits at or below 80% and check voltage.</li>
<li>Control temperature and humidity, and use equipment-safe fire suppression.</li>
</ul></div>
`,hi:`
<h3>Analogy: building ki plumbing</h3>
<p>Har building mein ek main water room hota hai jahan city supply andar aati hai, bade pumps aur meters ke saath. Wahan se pipes riser se har floor ki chhoti utility almari tak jaate hain, aur har almari se patle pipes har nal tak pahunchte hain. Agar main room mein paani bhar jaaye ya pumps ki bijli chali jaaye, to poori building sookh jaati hai. Network cabling bhi isi tarah organise hoti hai, aur exam objective 2.4 aapse yeh layout jaanne ko kehta hai, saath hi racks, power aur environment jo ise chalate rehte hain.</p>

<h3>Locations: MDF aur IDF</h3>
<p><b>Main distribution frame (MDF)</b> building ka main wiring room hai. Ismein aam taur par service provider ka handoff (demarcation point), edge routers aur firewalls, core switches, aur aksar server racks hote hain. <b>Intermediate distribution frame (IDF)</b> ek chhota wiring closet hai, aam taur par har floor ya wing ka ek, jismein woh access switches hote hain jinmein desks lagte hain. IDFs MDF se <b>backbone</b> (vertical) cabling par judte hain, aam taur par fibre aur aksar redundancy ke liye pairs mein. Har IDF se <b>horizontal</b> copper cabling wall outlets tak jaati hai, end to end 100 m tak limited (90 m permanent link plus patch cords).</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="MDF aur IDF layout">
<rect x="220" y="160" width="200" height="56" rx="8" fill="#fde68a"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="14">MDF (ground floor)</text><text x="320" y="202" text-anchor="middle" class="svg-muted" font-size="12">ISP demarc · core · firewall</text>
<rect x="40" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="120" y="42" text-anchor="middle" class="svg-ink" font-size="13">IDF floor 3</text><text x="120" y="60" text-anchor="middle" class="svg-muted" font-size="12">access switches</text>
<rect x="240" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">IDF floor 2</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">access switches</text>
<rect x="440" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="13">IDF floor 1</text><text x="520" y="60" text-anchor="middle" class="svg-muted" font-size="12">access switches</text>
<line x1="120" y1="70" x2="270" y2="160" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="160" stroke="#64748b" stroke-width="2"/><line x1="520" y1="70" x2="370" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="40" y="120" class="svg-accent" font-size="12">backbone fibre</text><text x="470" y="120" class="svg-muted" font-size="12">desks tak horizontal copper</text>
</svg><p class="cap">Ek MDF, har floor par ek IDF, unke beech fibre backbone, desks tak copper.</p></div>

<h3>Racks: size, airflow aur locks</h3>
<p>Equipment standard <b>19-inch racks</b> mein mount hota hai. Height <b>rack units (U)</b> mein ginte hain: 1U = 1.75 inches (44.45 mm). Full-height rack aam taur par <b>42U</b> hota hai; chhote IDFs 6U se 12U ka wall-mount rack use kar sakte hain. Sabse gehre device ke hisaab se <b>depth</b> chuno (servers ko gehre four-post cabinets chahiye; patch panels two-post open frames mein fit hote hain), <b>weight</b> rating check karo, UPS jaise bhaari items neeche mount karo, aur cable managers aur growth ke liye jagah chhodo.</p>
<p><b>Airflow</b> utna hi zaroori hai jitni jagah. Data rooms <b>hot aisle / cold aisle</b> layouts use karte hain: device ke fronts cold aisle ki taraf, rears hot aisle mein exhaust karte hain. Servers ke network ports peeche hote hain, isliye top-of-rack switch aam taur par apne ports server ports ki taraf, yaani hot aisle mein, rakh kar mount hota hai. Us switch ko apni power-supply side se thandi hawa kheenchni chahiye aur port side se bahar phenkni chahiye: <b>port-side exhaust</b>. Jo switch apne ports cold aisle ki taraf rakh kar mount ho, use <b>port-side intake</b> chahiye (hawa ports se andar, power supplies se bahar). Kai switches dono options orderable fan aur PSU modules ki tarah dete hain; galat order karo to switch apni hi garam hawa saans mein leta hai.</p>
<p><b>Lockable</b> racks, cabinet doors aur wiring rooms physical security ka hissa hain: unlocked IDF mein koi bhi switch mein laptop laga sakta hai, uplink nikaal sakta hai, ya console padh sakta hai.</p>

<h3>Cabling: patch panels aur fibre distribution panels</h3>
<p>Permanent cables kabhi seedhe switches mein nahi lagti. Horizontal copper runs <b>patch panel</b> ke peeche punch down hote hain (110-style IDC blocks), jo aage labelled RJ45 ports dikhata hai; phir chhoti patch cords panel ports ko switch ports se jodti hain. Backbone fibre <b>fibre distribution panel (FDP)</b> mein terminate hota hai, ek tray jo splices ya pre-terminated connectors rakhti hai, bend radius bachati hai, aur fibre patch cords ke liye LC ya SC adapters deti hai. Dono panels ka matlab hai moves aur changes chhoti patch cord se hote hain, permanent cabling ko chhue bina.</p>

<h3>Power: UPS, PDU, load aur voltage</h3>
<ul>
<li><b>UPS (uninterruptible power supply)</b>: batteries jo outages mein equipment ko chalati hain aur sags, spikes aur noise saaf karti hain. Types: <i>standby</i> (power jaane par battery par switch karta hai), <i>line-interactive</i> (voltage regulate karta hai), aur <i>online / double conversion</i> (hamesha inverter se chalta hai, best protection). UPS generator start hone tak gap bharta hai, ya clean shutdown ka time deta hai.</li>
<li><b>PDU (power distribution unit)</b>: rack ki power strip jo devices ko feed karti hai. Basic PDUs sirf distribute karte hain; metered aur monitored PDUs current draw report karte hain; switched PDUs aapko outlet ko remotely power-cycle karne dete hain. Do power supplies wale devices alag circuits par A aur B PDUs mein lagte hain.</li>
<li><b>Power load</b>: total watts jo kheenche jaate hain. Equipment ko watts se rate karo, yaad rakho ki UPS units VA aur watts mein rated hote hain (W = VA x power factor), aur circuit ka continuous load uski breaker rating ke lagbhag <b>80%</b> ya usse kam rakho. PoE switches har phone, camera aur access point ki power jodte hain.</li>
<li><b>Voltage</b>: India aur Europe mein aam taur par 230 V 50 Hz par, North America mein 120 V 60 Hz par, aur kai data centers mein 208 V ya 230 V. Zyada tar network power supplies auto-ranging (100 se 240 V) hoti hain, lekin plug karne se pehle check karo, aur connectors match karo (zyada tar switches ke liye C13/C14, high-power chassis ke liye C19/C20).</li>
</ul>
<pre class="out">IDF2-SW1#show power inline
Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
<span class="hl">1           740.0      412.6       327.4</span></pre>

<div class="eg"><p><b>Worked example: IDF ka sizing.</b> Do 48-port PoE switches mein se har ek khud ke liye lagbhag 120 W aur 300 W tak PoE kheenchta hai, aur ek chhota firewall 60 W: 2 x 420 + 60 = 900 W. 1500 VA rated UPS power factor 0.9 ke saath 1350 W deta hai, isliye load 67% hai, growth aur theek-thaak runtime ke liye jagah bachti hai. Rack circuit 230 V x 16 A = 3680 W hai; uska 80% 2944 W hai, jo 900 W se aaram se upar hai.</p></div>

<h3>Environmental factors</h3>
<ul>
<li><b>Temperature</b>: garam hone par electronics jaldi fail hote hain. Common target ASHRAE ki recommended inlet range 18 se 27 °C hai. Intake temperature monitor karo, blanking panels lagao taaki garam hawa wapas na ghoome, aur IDFs ko kabhi bina ventilation ke store room mat banne do.</li>
<li><b>Humidity</b>: bahut sookha static discharge (ESD) badhata hai jo components kharab karta hai; bahut nam condensation aur corrosion laata hai. Relative humidity moderate rakho, lagbhag 40 se 60%, aur temperature ke saath ise monitor karo.</li>
<li><b>Fire suppression</b>: normal wet-pipe sprinklers electronics barbaad kar dete hain. Equipment rooms <b>pre-action</b> (dry-pipe) sprinklers use karte hain jo detection ke baad hi paani se bharte hain, ya <b>clean-agent</b> gas systems jo bina residue aag bujhate hain. Inke saath early smoke detection aur suitable extinguishers rakho.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Galat airflow direction wale switches khareedna; ek PDU circuit ko 80% se zyada load karna; dono power supplies ek hi PDU mein lagana; IDF darwaze unlocked chhodna; copper ko 100 m se aage chalana; UPS size karte waqt PoE ko ignore karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> MDF = demarc aur core wala main room; IDF = access switches wala floor closet. 1U = 1.75 in; common rack 42U, 19 in chauda. Port-side exhaust vs intake hot aur cold aisles ko match karne ke baare mein hai. UPS = battery backup aur conditioning; PDU = distribution. Kam humidity = static; zyada humidity = condensation. Clean agent ya pre-action suppression equipment ko bachata hai.</p></div>

<div class="scn"><h4>IDF jo har dopahar band ho jaata tha</h4><p>Teesre floor ke staff ka network garam dinon mein dopahar 3 baje ke aas-paas chala jaata tha. Access switch ke logs mein temperature alarms aur phir shutdown dikha. IDF ek badla hua store room tha jismein koi cooling nahi thi, security ke liye darwaza band rakha jaata tha, aur naya switch port-side intake ke saath order hua tha jabki use ports deewar ki taraf rakh kar mount kiya gaya tha, isliye woh apna hi exhaust saans mein le raha tha. Fix tha ventilation fan aur temperature sensor lagana, switch ko uske airflow ke hisaab se dobara mount karna, aur blanking panels lagana.</p><p><b>Seekh:</b> environment aur airflow network design ka hissa hain, facilities ka baad ka khayal nahi.</p></div>

<div class="iv"><p class="q">"IDF mein naye switches lagane se pehle aap kya check karoge?"</p><p>Strong answer: U mein rack space aur depth, weight, room ki hot aur cold sides ke against airflow direction, power (circuit rating, voltage, connector type, PoE load samet UPS capacity, A aur B feeds), cabling (patch panel ports, backbone ke liye fibre panel aur optics, 100 m copper limit), environment (temperature, humidity, fire suppression) aur physical security (lockable rack aur room). Labelling aur documentation mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MDF mein demarc aur core hote hain; har floor ke IDFs mein access switches, fibre backbone se jude.</li>
<li>Racks 19 in chaude hote hain aur U mein naape jaate hain (1U = 1.75 in); depth, weight aur airflow direction plan karo.</li>
<li>Patch panels (copper) aur fibre distribution panels permanent cabling bachate hain; racks aur rooms lock hone chahiye.</li>
<li>UPS outages se bachata hai; PDUs power distribute karte hain; circuits 80% ya kam rakho aur voltage check karo.</li>
<li>Temperature aur humidity control karo, aur equipment-safe fire suppression use karo.</li>
</ul></div>
`}};export{e as default};