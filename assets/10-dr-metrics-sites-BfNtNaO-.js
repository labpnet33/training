var e={id:`dr-metrics`,h:{en:`Disaster recovery: RPO, RTO, MTTR, MTBF and DR sites`,hi:`Disaster recovery: RPO, RTO, MTTR, MTBF aur DR sites`},body:{en:`
<p>Imagine you are writing a long essay and the laptop dies. Two questions matter immediately: <b>how much work have I lost</b> since the last save, and <b>how long until I can write again</b>? If you save every 10 minutes and have a spare laptop on the shelf, you lose at most 10 minutes of text and are back in 15 minutes. Businesses ask exactly these two questions about their networks and data, and give them names: <b>RPO</b> and <b>RTO</b>.</p>

<h3>The four DR metrics</h3>
<dl class="terms">
<dt>Recovery point objective (RPO)</dt><dd>The maximum amount of data, measured in time, the business can afford to lose. An RPO of 1 hour means backups or replication must capture data at least every hour. It looks <b>backwards</b> from the disaster.</dd>
<dt>Recovery time objective (RTO)</dt><dd>The maximum time allowed to restore a service after a disruption. An RTO of 4 hours means the service must be running again within 4 hours. It looks <b>forwards</b> from the disaster.</dd>
<dt>Mean time to repair (MTTR)</dt><dd>The average time it takes to repair a failed component and return it to service. Total repair time ÷ number of repairs.</dd>
<dt>Mean time between failures (MTBF)</dt><dd>The average operating time between failures of a repairable component. Total operating time ÷ number of failures. Higher is better.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="RPO and RTO on a timeline">
<line x1="30" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="80" width="14" height="40" fill="#bbf7d0"/><text x="67" y="140" text-anchor="middle" class="svg-muted" font-size="12">last backup</text>
<rect x="300" y="70" width="16" height="60" fill="#fed7aa"/><text x="308" y="60" text-anchor="middle" class="svg-ink" font-size="13">Disaster</text>
<rect x="540" y="80" width="14" height="40" fill="#bae6fd"/><text x="547" y="140" text-anchor="middle" class="svg-muted" font-size="12">service restored</text>
<line x1="74" y1="160" x2="300" y2="160" stroke="#64748b"/><text x="187" y="180" text-anchor="middle" class="svg-accent" font-size="13">RPO: data lost (time)</text>
<line x1="316" y1="160" x2="540" y2="160" stroke="#64748b"/><text x="428" y="180" text-anchor="middle" class="svg-accent" font-size="13">RTO: downtime allowed</text>
</svg><p class="cap">RPO measures back to the last good copy of the data; RTO measures forward to the moment the service is running again.</p></div>

<div class="eg"><p><b>Worked example: MTBF, MTTR and availability.</b> A WAN router ran for one year (8,760 hours). It failed 3 times, and the repairs took 1, 2 and 3 hours (6 hours total).</p>
<ul><li>MTTR = 6 ÷ 3 = <b>2 hours</b>.</li>
<li>MTBF = (8,760 - 6) ÷ 3 = <b>2,918 hours</b>.</li>
<li>Availability = MTBF ÷ (MTBF + MTTR) = 2,918 ÷ 2,920 = <b>99.93%</b>.</li></ul>
<p>If the SLA from chapter 3 promises 99.95%, this router misses it. You can improve availability two ways: fail less often (higher MTBF, better hardware, redundancy) or repair faster (lower MTTR: spares on site, good documentation, monitoring that alerts instantly).</p></div>

<h3>How the metrics drive design</h3>
<p>RPO and RTO are business decisions, set by the service owners after a business impact analysis; engineering then builds to meet them. A tight RPO (seconds) needs continuous replication; a loose RPO (24 hours) can use nightly backups. A tight RTO (minutes) needs standby equipment already running; a loose RTO (days) can rely on buying or shipping equipment. Every step tighter costs more money, so different services get different targets: the payment system might have RPO 0 and RTO 15 minutes, while the intranet wiki has RPO 24 hours and RTO 3 days.</p>

<h3>DR sites: cold, warm and hot</h3>
<table class="cmp"><tr><th>Site</th><th>What is there</th><th>Recovery time</th><th>Cost</th></tr>
<tr><td><b>Cold site</b></td><td>Space, power, cooling and maybe connectivity; no configured equipment or current data</td><td>Days to weeks: equipment must be bought or shipped, installed and restored</td><td>Lowest</td></tr>
<tr><td><b>Warm site</b></td><td>Equipment installed and connected, but data is not current (restored from recent backups) and systems may need configuration</td><td>Hours to days</td><td>Medium</td></tr>
<tr><td><b>Hot site</b></td><td>Fully equipped, running, with near real-time replicated data; can take over almost immediately</td><td>Minutes to hours</td><td>Highest</td></tr>
</table>
<p>Many organisations now use a cloud region as the DR site: servers are defined as templates and started only during a disaster (behaving like a warm site at cold-site cost), or kept running with replicated data (a hot site). The DR site must be far enough away that one flood, fire or power grid failure does not affect both sites, and the network design must include how users and partners reach it: DNS changes, VPNs, routing and firewall rules.</p>

<div class="warn"><p><b>Common mistakes.</b> Mixing up RPO and RTO. Choosing a cold site for a service with a 1-hour RTO. Replicating data to the DR site but not network configurations, firewall rules and DNS. Placing the DR site in the same building or flood zone. Setting one RPO/RTO for everything instead of per service.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>RPO = data loss tolerance</b> (how old the restored data may be); <b>RTO = downtime tolerance</b> (how quickly service must return). <b>MTBF</b> is about reliability (bigger is better), <b>MTTR</b> is about repair speed (smaller is better). The <b>hot</b> site is the fastest and most expensive; the <b>cold</b> site is the cheapest and slowest.</p></div>

<div class="scn"><h4>The backup that was too old</h4><p>A small manufacturer's file server was hit by ransomware on Thursday afternoon. The IT team had a warm site with a standby server and restored the latest backup within 3 hours, meeting their 4-hour RTO. But the backup ran only on Sunday nights, so four days of production orders were lost; the business owner had assumed the RPO was "one day". After the incident, the team switched to hourly snapshots with an offline copy, and wrote the agreed RPO (1 hour) and RTO (4 hours) into the DR plan with the owner's signature.</p><p><b>Lesson:</b> meeting RTO is not enough; the backup frequency must match the RPO the business actually needs.</p></div>

<div class="iv"><p class="q">"Explain RPO and RTO with an example, and how they affect your design."</p><p>Strong answer: RPO is how much data, in time, we can lose; RTO is how long the service can be down. For an order system with RPO 15 minutes and RTO 1 hour, I need replication or backups at least every 15 minutes and a warm or hot standby that can take over in under an hour, with network failover planned (DNS, routing, VPNs). Add MTBF and MTTR to show you know reliability versus repair speed, and the cold/warm/hot trade-off.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPO = maximum data loss (time back to last good copy); RTO = maximum downtime.</li>
<li>MTTR = average repair time; MTBF = average time between failures; availability = MTBF ÷ (MTBF + MTTR).</li>
<li>Cold site: space and power only; warm: equipment, older data; hot: fully running with current data.</li>
<li>Tighter RPO and RTO cost more; set them per service with the business.</li>
<li>A DR site must be geographically separate and include network failover (DNS, routing, VPN, firewalls).</li>
</ul></div>
`,hi:`
<p>Socho aap ek lamba essay likh rahe ho aur laptop band ho jaata hai. Turant do sawaal matter karte hain: aakhri save ke baad <b>kitna kaam gaya</b>, aur <b>kitni der mein dobara likh paunga</b>? Agar aap har 10 minute save karte ho aur shelf par ek spare laptop hai, to aap zyada se zyada 10 minute ka text khote ho aur 15 minute mein wapas aa jaate ho. Businesses apne networks aur data ke baare mein bilkul yahi do sawaal poochte hain, aur unhe naam dete hain: <b>RPO</b> aur <b>RTO</b>.</p>

<h3>Chaar DR metrics</h3>
<dl class="terms">
<dt>Recovery point objective (RPO)</dt><dd>Kitna data, time mein naapa hua, business kho sakta hai uski maximum limit. 1 ghante ke RPO ka matlab backups ya replication kam se kam har ghante data capture karein. Yeh disaster se <b>peeche</b> dekhta hai.</dd>
<dt>Recovery time objective (RTO)</dt><dd>Disruption ke baad service restore karne ka maximum allowed time. 4 ghante ke RTO ka matlab service 4 ghante ke andar dobara chalni chahiye. Yeh disaster se <b>aage</b> dekhta hai.</dd>
<dt>Mean time to repair (MTTR)</dt><dd>Fail hue component ko repair karke service mein wapas laane ka average time. Total repair time ÷ repairs ki sankhya.</dd>
<dt>Mean time between failures (MTBF)</dt><dd>Repairable component ke failures ke beech average operating time. Total operating time ÷ failures ki sankhya. Zyada behtar hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Timeline par RPO aur RTO">
<line x1="30" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="80" width="14" height="40" fill="#bbf7d0"/><text x="67" y="140" text-anchor="middle" class="svg-muted" font-size="12">aakhri backup</text>
<rect x="300" y="70" width="16" height="60" fill="#fed7aa"/><text x="308" y="60" text-anchor="middle" class="svg-ink" font-size="13">Disaster</text>
<rect x="540" y="80" width="14" height="40" fill="#bae6fd"/><text x="547" y="140" text-anchor="middle" class="svg-muted" font-size="12">service restore</text>
<line x1="74" y1="160" x2="300" y2="160" stroke="#64748b"/><text x="187" y="180" text-anchor="middle" class="svg-accent" font-size="13">RPO: khoya data (time)</text>
<line x1="316" y1="160" x2="540" y2="160" stroke="#64748b"/><text x="428" y="180" text-anchor="middle" class="svg-accent" font-size="13">RTO: allowed downtime</text>
</svg><p class="cap">RPO data ki aakhri achhi copy tak peeche naapta hai; RTO us pal tak aage naapta hai jab service dobara chalti hai.</p></div>

<div class="eg"><p><b>Worked example: MTBF, MTTR aur availability.</b> Ek WAN router ek saal (8,760 ghante) chala. Woh 3 baar fail hua, aur repairs mein 1, 2 aur 3 ghante lage (total 6 ghante).</p>
<ul><li>MTTR = 6 ÷ 3 = <b>2 ghante</b>.</li>
<li>MTBF = (8,760 - 6) ÷ 3 = <b>2,918 ghante</b>.</li>
<li>Availability = MTBF ÷ (MTBF + MTTR) = 2,918 ÷ 2,920 = <b>99.93%</b>.</li></ul>
<p>Agar chapter 3 ka SLA 99.95% ka wada karta hai, to yeh router use miss karta hai. Availability do tareekon se badha sakte ho: kam fail ho (zyada MTBF, behtar hardware, redundancy) ya jaldi repair ho (kam MTTR: site par spares, achhi documentation, turant alert karne wali monitoring).</p></div>

<h3>Metrics design ko kaise chalate hain</h3>
<p>RPO aur RTO business decisions hain, jo business impact analysis ke baad service owners tay karte hain; phir engineering unhe meet karne ke liye banati hai. Tight RPO (seconds) ke liye continuous replication chahiye; loose RPO (24 ghante) nightly backups use kar sakta hai. Tight RTO (minutes) ke liye pehle se chal raha standby equipment chahiye; loose RTO (din) equipment khareedne ya ship karne par bharosa kar sakta hai. Har step tight karne mein zyada paisa lagta hai, isliye alag services ke alag targets hote hain: payment system ka RPO 0 aur RTO 15 minute ho sakta hai, jabki intranet wiki ka RPO 24 ghante aur RTO 3 din.</p>

<h3>DR sites: cold, warm aur hot</h3>
<table class="cmp"><tr><th>Site</th><th>Wahan kya hai</th><th>Recovery time</th><th>Cost</th></tr>
<tr><td><b>Cold site</b></td><td>Space, power, cooling aur shayad connectivity; koi configured equipment ya current data nahi</td><td>Din se hafte: equipment khareedna ya ship karna, install aur restore karna padta hai</td><td>Sabse kam</td></tr>
<tr><td><b>Warm site</b></td><td>Equipment installed aur connected, lekin data current nahi (recent backups se restore hota hai) aur systems ko configuration chahiye ho sakti hai</td><td>Ghante se din</td><td>Medium</td></tr>
<tr><td><b>Hot site</b></td><td>Poori tarah equipped, chalu, lagbhag real-time replicated data ke saath; lagbhag turant take over kar sakti hai</td><td>Minutes se ghante</td><td>Sabse zyada</td></tr>
</table>
<p>Bahut saari organisations ab cloud region ko DR site ki tarah use karti hain: servers templates ke roop mein define hote hain aur sirf disaster ke dauraan start hote hain (cold-site cost par warm site jaisa behaviour), ya replicated data ke saath chalu rakhe jaate hain (hot site). DR site itni door honi chahiye ki ek baadh, aag ya power grid failure dono sites ko affect na kare, aur network design mein yeh shamil hona chahiye ki users aur partners us tak kaise pahunchenge: DNS changes, VPNs, routing aur firewall rules.</p>

<div class="warn"><p><b>Common galtiyan.</b> RPO aur RTO ko mix karna. 1 ghante RTO wali service ke liye cold site chunna. Data DR site par replicate karna lekin network configurations, firewall rules aur DNS nahi. DR site ko usi building ya flood zone mein rakhna. Har service ke liye alag ki jagah sab ke liye ek RPO/RTO set karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>RPO = data loss tolerance</b> (restored data kitna purana ho sakta hai); <b>RTO = downtime tolerance</b> (service kitni jaldi wapas aani chahiye). <b>MTBF</b> reliability ke baare mein hai (bada behtar), <b>MTTR</b> repair speed ke baare mein (chhota behtar). <b>Hot</b> site sabse tez aur mehngi hai; <b>cold</b> site sabse sasti aur dheemi.</p></div>

<div class="scn"><h4>Backup jo bahut purana tha</h4><p>Ek chhote manufacturer ke file server par Thursday dopahar ransomware attack hua. IT team ke paas standby server wali warm site thi aur unhone 3 ghante mein latest backup restore kar diya, apna 4 ghante ka RTO meet karte hue. Lekin backup sirf Sunday raat chalta tha, isliye chaar din ke production orders kho gaye; business owner ne maan rakha tha ki RPO "ek din" hai. Incident ke baad team ne offline copy ke saath hourly snapshots shuru kiye, aur agreed RPO (1 ghanta) aur RTO (4 ghante) owner ke signature ke saath DR plan mein likh diye.</p><p><b>Seekh:</b> RTO meet karna kaafi nahi; backup frequency us RPO se match honi chahiye jo business ko sach mein chahiye.</p></div>

<div class="iv"><p class="q">"RPO aur RTO ek example ke saath samjhao, aur yeh aapke design ko kaise affect karte hain."</p><p>Strong answer: RPO yeh hai ki hum time mein kitna data kho sakte hain; RTO yeh ki service kitni der down reh sakti hai. RPO 15 minute aur RTO 1 ghante wale order system ke liye mujhe kam se kam har 15 minute replication ya backups chahiye aur ek warm ya hot standby jo ek ghante se kam mein take over kar sake, network failover planned ke saath (DNS, routing, VPNs). MTBF aur MTTR jodo taaki dikhe ki aap reliability vs repair speed samajhte ho, aur cold/warm/hot trade-off bhi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPO = maximum data loss (aakhri achhi copy tak ka time); RTO = maximum downtime.</li>
<li>MTTR = average repair time; MTBF = failures ke beech average time; availability = MTBF ÷ (MTBF + MTTR).</li>
<li>Cold site: sirf space aur power; warm: equipment, purana data; hot: current data ke saath poori tarah chalu.</li>
<li>Tight RPO aur RTO mehnge hote hain; inhe business ke saath har service ke liye set karo.</li>
<li>DR site geographically alag honi chahiye aur usmein network failover (DNS, routing, VPN, firewalls) shamil hona chahiye.</li>
</ul></div>
`}};export{e as default};