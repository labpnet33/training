var e=(e,t,n,r)=>`<rect x="10" y="`+e+`" width="150" height="40" rx="6" fill="`+t+`" stroke="#64748b"/><text x="85" y="`+(e+25)+`" text-anchor="middle" class="svg-ink" font-size="12">`+n+`</text><line x1="160" y1="`+(e+20)+`" x2="185" y2="`+(e+20)+`" stroke="#64748b" stroke-width="2"/><text x="195" y="`+(e+25)+`" class="svg-ink" font-size="12">`+r+`</text>`,t=t=>`<div class="dia"><svg viewBox="0 0 640 310" role="img" aria-label="`+t.aria+`">`+e(10,`#bae6fd`,t.a1,t.b1)+e(60,`#ddd6fe`,t.a2,t.b2)+e(110,`#bbf7d0`,t.a3,t.b3)+e(160,`#fde68a`,t.a4,t.b4)+e(210,`#fed7aa`,t.a5,t.b5)+e(260,`#e2e8f0`,t.a6,t.b6)+`</svg><p class="cap">`+t.cap+`</p></div>`,n=t({aria:`Design decision map`,a1:`Requirements`,b1:`Clients, apps, density, mobility, constraints`,a2:`Environment`,b2:`Attenuation, materials, stock, machines`,a3:`Survey method`,b3:`Predictive, AP-on-a-stick, post-deployment`,a4:`Placement`,b4:`Antenna, height, cell size, capacity`,a5:`Channel and power`,b5:`Reuse, RRM limits, DFS, 6 GHz`,a6:`Validation`,b6:`Spectrum, heat maps, report, baseline`,cap:`The decision chain of this module. A change at the top changes everything below it.`}),r=t({aria:`Design decision map`,a1:`Requirements`,b1:`Clients, apps, density, mobility, constraints`,a2:`Environment`,b2:`Attenuation, materials, stock, machines`,a3:`Survey method`,b3:`Predictive, AP-on-a-stick, post-deployment`,a4:`Placement`,b4:`Antenna, height, cell size, capacity`,a5:`Channel aur power`,b5:`Reuse, RRM limits, DFS, 6 GHz`,a6:`Validation`,b6:`Spectrum, heat maps, report, baseline`,cap:`Is module ki decision chain. Upar ka ek change neeche sab kuch badal deta hai.`}),i={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter ties the module together with one more full case, a can-do checklist, a mini glossary and the most-tested facts for the Wireless site survey domain of ENWLSD 300-425.</p>

<h3>Final case: Harbourview Convention Hotel</h3>
<p>Harbourview (fictional) combines hotel rooms, a 1,500-seat ballroom, back-of-house kitchens and an outdoor terrace. The owner says: "Guests complain in the ballroom during conferences and on the terrace at night. Fix it." Apply the whole chain:</p>
<ol>
<li><b>Requirements.</b> Conference attendees (two devices each, video calls), registration tablets, staff voice in kitchens, terrace guests. Peak load in the ballroom is 3,000 devices. Constraints: heritage ceiling that forbids mounting in the ballroom ceiling, moveable partition walls, no ceiling access on the terrace.</li>
<li><b>Environment.</b> Partition walls open and closed change attenuation; kitchens have steel walls, microwave ovens and extraction fans; the terrace is outdoors with line of sight to the harbour.</li>
<li><b>Survey method.</b> Predictive model for all areas (ballroom partitions in both states), AP-on-a-stick in the ballroom and kitchens, post-deployment validation with a spectrum capture on the terrace at night.</li>
<li><b>Placement and antennas.</b> Ballroom: directional APs on side walls and under stage edges, small cells; kitchens: APs outside the steel walls with a door-side AP; terrace: outdoor-rated APs with directional antennas aimed down along the terrace.</li>
<li><b>Channel and power.</b> 5 GHz at 20 MHz with careful reuse, 6 GHz at 20 or 40 MHz for new devices, 2.4 GHz at 20 MHz and low power only where IoT needs it; DFS used in the ballroom but not for terrace staff devices; RRM constrained to a channel list and a power range.</li>
<li><b>Validation.</b> Heat maps for each band, partition wall open and closed, an active test with video calls, spectrum capture, an as-built baseline report.</li>
</ol>
`+n+`
<h3>Can-do checklist</h3>
<ul>
<li>List the discovery questions and turn answers into measurable targets (RSSI, SNR, capacity, roaming).</li>
<li>Separate requirements from constraints.</li>
<li>Explain the three bands, Wi-Fi 4 to 7 differences and why wider channels reduce reuse.</li>
<li>Calculate SNR and use the 3 dB, 10 dB and 6 dB-per-doubling rules.</li>
<li>Rank materials by attenuation and explain why heavy walls must be measured.</li>
<li>Choose predictive, on-site pre-deployment or post-deployment surveys for a given case, and describe active, passive and spectrum measurement.</li>
<li>Choose omni or directional antennas and explain down tilt and gain.</li>
<li>Estimate AP count by capacity, not just area.</li>
<li>Plan channels for 2.4, 5 and 6 GHz and constrain RRM (DCA, TPC, CHD).</li>
<li>Explain DFS, LPI versus standard power with AFC, and WPA3 on 6 GHz.</li>
<li>Describe the content of a validation report.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms"><dt>AFC</dt><dd>Automated Frequency Coordination: service that authorises 6 GHz standard-power channels and power at a location.</dd>
<dt>AP-on-a-stick</dt><dd>Pre-deployment survey using a real AP on a pole at the planned position.</dd>
<dt>Attenuation</dt><dd>Signal loss in dB when passing through or reflecting off material.</dd>
<dt>CCI / ACI</dt><dd>Co-channel interference (shared airtime) / adjacent-channel interference (corruption).</dd>
<dt>DCA / TPC / CHD</dt><dd>RRM algorithms for channels, power and coverage holes.</dd>
<dt>DFS</dt><dd>Dynamic Frequency Selection: radar avoidance on some 5 GHz channels.</dd>
<dt>LPI</dt><dd>Low Power Indoor class in 6 GHz.</dd>
<dt>RSSI / SNR</dt><dd>Signal strength in dBm / signal minus noise in dB.</dd>
<dt>Predictive survey</dt><dd>Modelled survey from a floor plan and material data.</dd>
<dt>Spectrum analysis</dt><dd>Measuring all RF energy, including non-Wi-Fi sources.</dd></dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Voice target (typical)</td><td>About -67 dBm, SNR 25 dB or better, second AP audible</td></tr>
<tr><td>Data target (typical)</td><td>About -70 dBm, SNR 20 dB</td></tr>
<tr><td>2.4 GHz channels</td><td>1, 6 and 11 at 20 MHz</td></tr>
<tr><td>dB rules</td><td>+3 dB doubles, +10 dB is 10x, 6 dB per distance doubling</td></tr>
<tr><td>Predictive</td><td>Planning, budgeting, buildings that do not exist yet</td></tr>
<tr><td>AP-on-a-stick</td><td>Real propagation before install; calibrates models</td></tr>
<tr><td>Post-deployment</td><td>Proves the installed network and creates the baseline</td></tr>
<tr><td>Capacity</td><td>Small cells, lower power, more radios, not more gain</td></tr>
<tr><td>DFS</td><td>Radar detection, channel availability check, leave on radar</td></tr>
<tr><td>6 GHz</td><td>WPA3 required; LPI versus standard power with AFC</td></tr>
<tr><td>Non-Wi-Fi interference</td><td>Needs a spectrum analyser</td></tr>
</table>

<div class="warn"><p><b>Common exam mistakes.</b> Picking a stronger AP when the case is capacity-limited; choosing a predictive survey when the question asks for proof of performance; forgetting the survey device must represent client radios; assuming one number target for all applications.</p></div>
<div class="exam"><p><b>Exam trap.</b> Cases in the exam read like these chapters. Identify the client type and application, decide whether coverage or capacity limits the design, then choose the survey, antenna and channel answer that fits. If two answers look right, pick the one that follows the stated constraints.</p></div>

<div class="scn"><h4>Harbourview result</h4><p>After the redesign the ballroom handled 2,900 devices during a conference with active video calls. The post-deployment survey found one gap behind the partition when closed; a single AP was added. The terrace night complaints turned out to be a wireless camera on 2.4 GHz that the spectrum capture exposed.</p><p><b>Lesson:</b> the chain works when every step uses the answer from the step before it.</p></div>
<div class="iv"><p class="q">"Walk me through how you would design Wi-Fi for a new site."</p><p>Strong answer: I start with customer discovery and measurable requirements, then study the environment and materials, pick predictive, on-site and post-deployment surveys to fit the risk, place APs and choose antennas for coverage and for capacity, plan channels and power with RRM limits, handle DFS and 6 GHz rules, find non-Wi-Fi interference with spectrum analysis, and finish with a validation report and baseline.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design is a chain: requirements, environment, survey method, placement, channel and power, validation.</li>
<li>Targets depend on the application; measure SNR as well as RSSI.</li>
<li>Capacity needs small cells and more radios; coverage needs signal strength.</li>
<li>Use predictive for planning, AP-on-a-stick for reality, post-deployment for proof.</li>
<li>Use a spectrum analyser for non-Wi-Fi noise and survey at the times problems happen.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko ek aur full case, can-do checklist, mini glossary aur ENWLSD 300-425 ke Wireless site survey domain ke sabse zyada test hone wale facts ke saath jodta hai.</p>

<h3>Final case: Harbourview Convention Hotel</h3>
<p>Harbourview (fictional) mein hotel rooms, 1,500-seat ballroom, back-of-house kitchens aur outdoor terrace hain. Owner kehta hai: "Conferences ke dauraan ballroom mein aur raat ko terrace par guests shikayat karte hain. Fix karo." Poori chain lagao:</p>
<ol>
<li><b>Requirements.</b> Conference attendees (do-do devices, video calls), registration tablets, kitchens mein staff voice, terrace guests. Ballroom mein peak load 3,000 devices. Constraints: heritage ceiling jo ballroom ceiling mein mounting mana karti hai, moveable partition walls, terrace par ceiling access nahi.</li>
<li><b>Environment.</b> Partition walls khuli ya band hone par attenuation badalti hai; kitchens mein steel walls, microwave ovens aur extraction fans hain; terrace outdoor hai aur harbour ki taraf line of sight hai.</li>
<li><b>Survey method.</b> Sab areas ke liye predictive model (ballroom partitions dono states mein), ballroom aur kitchens mein AP-on-a-stick, raat ko terrace par spectrum capture ke saath post-deployment validation.</li>
<li><b>Placement aur antennas.</b> Ballroom: side walls aur stage edges par directional APs, chhote cells; kitchens: steel walls ke bahar APs aur door-side AP; terrace: terrace ke saath neeche aim kiye outdoor-rated APs directional antennas ke saath.</li>
<li><b>Channel aur power.</b> 5 GHz 20 MHz par careful reuse ke saath, naye devices ke liye 6 GHz 20 ya 40 MHz par, 2.4 GHz 20 MHz par aur low power sirf jahan IoT ko chahiye; DFS ballroom mein use, terrace staff devices ke liye nahi; RRM ko channel list aur power range tak constrain kiya gaya.</li>
<li><b>Validation.</b> Har band ke heat maps, partition wall khuli aur band dono, video calls ke saath active test, spectrum capture, as-built baseline report.</li>
</ol>
`+r+`
<h3>Can-do checklist</h3>
<ul>
<li>Discovery questions ki list banao aur jawabon ko measurable targets (RSSI, SNR, capacity, roaming) mein badlo.</li>
<li>Requirements ko constraints se alag karo.</li>
<li>Teen bands, Wi-Fi 4 se 7 ke differences, aur wider channels reuse kyun ghatate hain, yeh samjhao.</li>
<li>SNR calculate karo aur 3 dB, 10 dB aur 6 dB-per-doubling rules use karo.</li>
<li>Materials ko attenuation se rank karo aur batao heavy walls ko measure kyun karna chahiye.</li>
<li>Diye gaye case ke liye predictive, on-site pre-deployment ya post-deployment survey chuno, aur active, passive aur spectrum measurement describe karo.</li>
<li>Omni ya directional antennas chuno aur down tilt aur gain samjhao.</li>
<li>AP count capacity se estimate karo, sirf area se nahi.</li>
<li>2.4, 5 aur 6 GHz ke liye channels plan karo aur RRM (DCA, TPC, CHD) ko constrain karo.</li>
<li>DFS, LPI versus AFC ke saath standard power, aur 6 GHz par WPA3 samjhao.</li>
<li>Validation report ka content describe karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms"><dt>AFC</dt><dd>Automated Frequency Coordination: service jo kisi location par 6 GHz standard-power channels aur power authorise karti hai.</dd>
<dt>AP-on-a-stick</dt><dd>Planned position par pole par real AP ke saath pre-deployment survey.</dd>
<dt>Attenuation</dt><dd>Material se guzarne ya reflect hone par dB mein signal loss.</dd>
<dt>CCI / ACI</dt><dd>Co-channel interference (shared airtime) / adjacent-channel interference (corruption).</dd>
<dt>DCA / TPC / CHD</dt><dd>Channels, power aur coverage holes ke liye RRM algorithms.</dd>
<dt>DFS</dt><dd>Dynamic Frequency Selection: kuch 5 GHz channels par radar avoidance.</dd>
<dt>LPI</dt><dd>6 GHz mein Low Power Indoor class.</dd>
<dt>RSSI / SNR</dt><dd>dBm mein signal strength / dB mein signal minus noise.</dd>
<dt>Predictive survey</dt><dd>Floor plan aur material data se modelled survey.</dd>
<dt>Spectrum analysis</dt><dd>Non-Wi-Fi sources samet saari RF energy naapna.</dd></dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Voice target (typical)</td><td>Lagbhag -67 dBm, SNR 25 dB ya behtar, doosra AP sunai de</td></tr>
<tr><td>Data target (typical)</td><td>Lagbhag -70 dBm, SNR 20 dB</td></tr>
<tr><td>2.4 GHz channels</td><td>20 MHz par 1, 6 aur 11</td></tr>
<tr><td>dB rules</td><td>+3 dB double, +10 dB 10x, distance doubling par 6 dB</td></tr>
<tr><td>Predictive</td><td>Planning, budgeting, jo buildings abhi exist nahi karti</td></tr>
<tr><td>AP-on-a-stick</td><td>Install se pehle real propagation; models calibrate karta hai</td></tr>
<tr><td>Post-deployment</td><td>Installed network prove karta hai aur baseline banata hai</td></tr>
<tr><td>Capacity</td><td>Chhote cells, lower power, zyada radios, zyada gain nahi</td></tr>
<tr><td>DFS</td><td>Radar detection, channel availability check, radar par channel chhodo</td></tr>
<tr><td>6 GHz</td><td>WPA3 required; LPI versus AFC ke saath standard power</td></tr>
<tr><td>Non-Wi-Fi interference</td><td>Spectrum analyser chahiye</td></tr>
</table>

<div class="warn"><p><b>Common exam mistakes.</b> Capacity-limited case mein stronger AP chunna; jab question performance ka proof maange tab predictive survey chunna; yeh bhool jana ki survey device ko client radios represent karne chahiye; sab applications ke liye ek number target maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam ke cases in chapters jaise padhte hain. Client type aur application pehchano, tay karo ki coverage ya capacity design ko limit karti hai, phir survey, antenna aur channel ka jawab chuno jo fit baithe. Agar do answers sahi lagein, to woh chuno jo stated constraints follow karta hai.</p></div>

<div class="scn"><h4>Harbourview ka result</h4><p>Redesign ke baad ballroom ne conference ke dauraan active video calls ke saath 2,900 devices sambhale. Post-deployment survey ne band partition ke peeche ek gap paya; ek AP add kiya gaya. Terrace ki raat ki shikayatein 2.4 GHz ka wireless camera nikla jo spectrum capture ne expose kiya.</p><p><b>Lesson:</b> chain tab kaam karti hai jab har step pichhle step ka jawab use kare.</p></div>
<div class="iv"><p class="q">"Naye site ke liye Wi-Fi design kaise karoge, samjhao."</p><p>Strong answer: Main customer discovery aur measurable requirements se shuru karta hoon, phir environment aur materials study karta hoon, risk ke hisaab se predictive, on-site aur post-deployment surveys chunta hoon, coverage aur capacity ke liye APs place karta hoon aur antennas chunta hoon, RRM limits ke saath channels aur power plan karta hoon, DFS aur 6 GHz rules handle karta hoon, spectrum analysis se non-Wi-Fi interference dhundhta hoon, aur validation report aur baseline se khatam karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design ek chain hai: requirements, environment, survey method, placement, channel aur power, validation.</li>
<li>Targets application par depend karte hain; RSSI ke saath SNR bhi naapo.</li>
<li>Capacity ko chhote cells aur zyada radios chahiye; coverage ko signal strength.</li>
<li>Planning ke liye predictive, reality ke liye AP-on-a-stick, proof ke liye post-deployment.</li>
<li>Non-Wi-Fi noise ke liye spectrum analyser use karo aur problems ke time par survey karo.</li>
</ul></div>
`}};export{i as default};