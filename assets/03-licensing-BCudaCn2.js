var e={id:`licensing`,h:{en:`Licensing: data center, per-device, per-site and aggregate bandwidth`,hi:`Licensing: data center, per-device, per-site aur aggregate bandwidth`},body:{en:`
<p>An ION device is not useful until it has a <b>subscription</b>. Licensing is a design topic because the model you choose changes the cost, the flexibility and what features are included. The exam lists <b>licensing options and tiers</b> under Planning and Design, so you must know the structure well.</p>
<h3>Analogy: a mobile phone plan</h3>
<p>You can buy a plan per phone with a data limit (per-device), a family plan for all phones in one house (per-site), or a company pool of data that anyone in the company can draw from (aggregate). Prisma SD-WAN licensing works the same way, and the unit you are metering is <b>bandwidth in Mbps</b>.</p>
<h3>The structure, as documented</h3>
<p>The Palo Alto Networks activation guide (<i>Your Prisma SD-WAN License</i>) describes two groups of subscriptions. All of them have a minimum term of one year and a maximum term of five years, and they apply equally to physical and virtual ION devices.</p>
<table class="cmp"><tr><th>Licence</th><th>Where it applies</th><th>How the bandwidth is counted</th><th>Included</th></tr>
<tr><td><b>Data center subscription</b></td><td>Each ION (physical or virtual) assigned to a <b>data center site</b></td><td>One licence per DC device</td><td>The DC role</td></tr>
<tr><td><b>Branch per-device</b></td><td>Each branch ION</td><td>Tier per device: Small (S) up to 25 Mbps, Medium (M) up to 250 Mbps, Large (L) up to 2,500 Mbps; finer tiers also exist (25, 50, 150, 250, 500 Mbps, 1 Gbps, 2.5 Gbps)</td><td>Zone-based firewall (ZBFW) always included in the list price; WAN Clarity Reporting (WCR) and Clarity Network DVR are optional add-ons</td></tr>
<tr><td><b>Branch per-site</b></td><td>A branch site, whatever number of IONs it has</td><td>Tier shared by all IONs at the site (S, M, L)</td><td>ZBFW, DVR and WCR included</td></tr>
<tr><td><b>Branch aggregate bandwidth</b></td><td>All branch sites together</td><td>One pool in Mbps, shared across all branch sites, including HA scenarios</td><td>ZBFW, WCR and DVR included</td></tr></table>
<div class="note"><p><b>Note.</b> Names and tiers change as Palo Alto Networks updates its licensing (for example enterprise agreements and Prisma Access bundles). Treat this table as the structure to understand, and confirm the current names in the Palo Alto Networks licensing documentation before you write a bill of materials.</p></div>
<h3>What the licence meters</h3>
<p>The tier is a <b>licensed bandwidth ceiling for the site or device</b>, not the speed of the circuit. The hardware model has its own physical limit (chapter 2), the licence has a commercial limit, and the effective limit is the lower of the two. A site with a 3200 (1 Gbps hardware) and an S licence (25 Mbps) is licensed far below what the box can do.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Licence models">
<rect x="10" y="10" width="200" height="200" rx="10" fill="#bae6fd"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="14">Per-device</text>
<rect x="30" y="50" width="70" height="40" rx="6" fill="#e2e8f0"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="11">ION A 250M</text>
<rect x="120" y="50" width="70" height="40" rx="6" fill="#e2e8f0"/><text x="155" y="75" text-anchor="middle" class="svg-ink" font-size="11">ION B 250M</text>
<text x="110" y="125" text-anchor="middle" class="svg-muted" font-size="12">Each box has its own tier</text>
<text x="110" y="145" text-anchor="middle" class="svg-muted" font-size="12">HA pair = two licences</text>
<rect x="225" y="10" width="200" height="200" rx="10" fill="#bbf7d0"/><text x="325" y="34" text-anchor="middle" class="svg-ink" font-size="14">Per-site</text>
<rect x="245" y="50" width="160" height="40" rx="6" fill="#e2e8f0"/><text x="325" y="75" text-anchor="middle" class="svg-ink" font-size="11">Site tier 250M (shared)</text>
<text x="325" y="125" text-anchor="middle" class="svg-muted" font-size="12">All IONs at the site share</text>
<text x="325" y="145" text-anchor="middle" class="svg-muted" font-size="12">one tier</text>
<rect x="440" y="10" width="190" height="200" rx="10" fill="#ddd6fe"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="14">Aggregate</text>
<rect x="460" y="50" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="535" y="75" text-anchor="middle" class="svg-ink" font-size="11">Pool 5,000 Mbps</text>
<text x="535" y="125" text-anchor="middle" class="svg-muted" font-size="12">Shared by all branch sites,</text>
<text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">including HA</text>
</svg><p class="cap">The three branch models: tier per box, tier per site, or one shared pool. The per-device picture for HA shows the typical design question: how many boxes must you licence?</p></div>
<h3>Worked example: three ways to license Harbor Foods</h3>
<p>The assessment gives these branch peak needs: 25 small shops at 40 Mbps each, 12 stores at 200 Mbps each (6 of them have two devices in HA), and 3 regional offices at 400 Mbps each.</p>
<ul>
<li><b>Peak sum:</b> 25 x 40 = 1,000 Mbps; 12 x 200 = 2,400 Mbps; 3 x 400 = 1,200 Mbps. Total 4,600 Mbps of peaks.</li>
<li><b>Aggregate approach:</b> peaks do not happen at the same moment, so a pool of, for example, 3,000 Mbps might cover real simultaneous use. The company must still understand whether the pool is enforced per site by hardware limits.</li>
<li><b>Per-site approach:</b> shops fit tier S (25 Mbps) only if 25 Mbps is enough; 40 Mbps is not, so they need the M tier (up to 250 Mbps). Stores at 200 Mbps fit M; regional offices at 400 Mbps need L (up to 2,500 Mbps). The HA stores pay one site tier no matter how many IONs they hold.</li>
<li><b>Per-device approach:</b> the 6 HA stores need a licence for each device, so 18 devices at stores, not 12. Finer tiers (for example 50 or 500 Mbps) avoid paying for an oversized M or L.</li></ul>
<p>The numbers show the design logic: per-site is cheap for HA sites, per-device gives fine granularity for single-box sites, and aggregate is best when many sites share peaks or when you add and remove bandwidth often.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>Licences are claimed and assigned through the Palo Alto Networks activation and the management portal; the documentation for your tenant describes the exact steps. In the design phase you do not click anything: you produce a table that maps every site to a licence type and tier, and compare it with the entitlement the customer owns. Include the data center subscriptions as a separate column so no data center ION is forgotten.</p>
<div class="warn"><p><b>Common mistake.</b> Licensing only the primary ION of an HA pair under a per-device model. The documentation says a DC subscription is required for <b>each</b> ION assigned to a data center site, and per-device licences follow devices. Ask explicitly how the standby is covered.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember what is included. ZBFW is part of the per-device list price, and per-site and aggregate licences include ZBFW, DVR and WCR. WCR and Clarity Network DVR are optional add-ons only for the per-device model. Also remember min 1 year and max 5 years, and that physical and virtual IONs both need subscriptions.</p></div>
<div class="scn"><h4>The data center that nobody licensed</h4><p>A project team licensed all 60 branch devices carefully and ordered two ION 9200 for the data center, but nobody ordered the data center subscriptions. On the cut-over weekend the data center devices could not be assigned to the DC role and the branches had no hub. The licence order took two days to expedite.</p><p><b>Lesson:</b> the bill of materials needs three lines: branch licences, data center subscriptions and optional reporting add-ons.</p></div>
<div class="iv"><p class="q">"A customer has 200 branches, many with HA pairs. Which licensing model do you recommend?"</p><p>I compare the options against the HA count and traffic pattern. Per-site is attractive for HA sites because the pair shares one tier; aggregate bandwidth is flexible when peaks differ across sites and it explicitly covers HA scenarios and includes ZBFW, WCR and DVR; per-device suits single-box sites that need fine tiers. I model the three on the assessment numbers and choose the cheapest that still covers every site's peak.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DC subscription: one per ION (physical or virtual) at a data center site.</li>
<li>Branch models: per-device, per-site, aggregate bandwidth; terms 1 to 5 years.</li>
<li>Tiers S, M, L (25, 250, 2,500 Mbps) and finer steps; ZBFW is included in all.</li>
<li>WCR and DVR are add-ons for per-device and included for per-site and aggregate.</li>
<li>The effective limit is the lower of hardware throughput and licensed bandwidth.</li>
</ul></div>
`,hi:`
<p>ION device tab tak kaam ka nahi jab tak uske paas <b>subscription</b> na ho. Licensing design topic isliye hai kyunki jo model aap chunte ho woh cost, flexibility aur included features badal deta hai. Exam Planning and Design ke under <b>licensing options and tiers</b> list karta hai, isliye aapko structure achhe se aana chahiye.</p>
<h3>Analogy: mobile phone plan</h3>
<p>Aap har phone ke liye data limit wala plan le sakte ho (per-device), ghar ke sab phones ke liye family plan (per-site), ya company ka data pool jisme se koi bhi use kar sake (aggregate). Prisma SD-WAN licensing bhi aise hi kaam karti hai, aur jo cheez naapi jaati hai woh hai <b>Mbps mein bandwidth</b>.</p>
<h3>Structure, jaisa documented hai</h3>
<p>Palo Alto Networks activation guide (<i>Your Prisma SD-WAN License</i>) subscriptions ke do groups batati hai. Sabka minimum term ek saal aur maximum term paanch saal hai, aur yeh physical aur virtual ION devices dono par equally lagu hota hai.</p>
<table class="cmp"><tr><th>Licence</th><th>Kahan lagta hai</th><th>Bandwidth kaise ginti hai</th><th>Included</th></tr>
<tr><td><b>Data center subscription</b></td><td><b>Data center site</b> par assigned har ION (physical ya virtual)</td><td>Har DC device ke liye ek licence</td><td>DC role</td></tr>
<tr><td><b>Branch per-device</b></td><td>Har branch ION</td><td>Har device ka tier: Small (S) 25 Mbps tak, Medium (M) 250 Mbps tak, Large (L) 2,500 Mbps tak; finer tiers bhi hain (25, 50, 150, 250, 500 Mbps, 1 Gbps, 2.5 Gbps)</td><td>Zone-based firewall (ZBFW) list price mein hamesha included; WAN Clarity Reporting (WCR) aur Clarity Network DVR optional add-ons</td></tr>
<tr><td><b>Branch per-site</b></td><td>Branch site, chahe uspar kitne bhi ION ho</td><td>Site ke saare IONs ke beech shared tier (S, M, L)</td><td>ZBFW, DVR aur WCR included</td></tr>
<tr><td><b>Branch aggregate bandwidth</b></td><td>Saare branch sites ek saath</td><td>Mbps mein ek pool, saare branch sites mein shared, HA scenarios sahit</td><td>ZBFW, WCR aur DVR included</td></tr></table>
<div class="note"><p><b>Note.</b> Palo Alto Networks licensing update karta rehta hai (jaise enterprise agreements aur Prisma Access bundles) to naam aur tiers badalte hain. Is table ko samajhne wale structure ki tarah lo, aur bill of materials likhne se pehle current naam Palo Alto Networks licensing documentation se confirm karo.</p></div>
<h3>Licence kya naapta hai</h3>
<p>Tier site ya device ke liye <b>licensed bandwidth ceiling</b> hai, circuit ki speed nahi. Hardware model ki apni physical limit hai (chapter 2), licence ki commercial limit hai, aur effective limit dono mein se kam wali hai. 3200 (1 Gbps hardware) aur S licence (25 Mbps) wali site box ki capability se bahut kam par licensed hai.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Licence models">
<rect x="10" y="10" width="200" height="200" rx="10" fill="#bae6fd"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="14">Per-device</text>
<rect x="30" y="50" width="70" height="40" rx="6" fill="#e2e8f0"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="11">ION A 250M</text>
<rect x="120" y="50" width="70" height="40" rx="6" fill="#e2e8f0"/><text x="155" y="75" text-anchor="middle" class="svg-ink" font-size="11">ION B 250M</text>
<text x="110" y="125" text-anchor="middle" class="svg-muted" font-size="12">Har box ka apna tier</text>
<text x="110" y="145" text-anchor="middle" class="svg-muted" font-size="12">HA pair = do licences</text>
<rect x="225" y="10" width="200" height="200" rx="10" fill="#bbf7d0"/><text x="325" y="34" text-anchor="middle" class="svg-ink" font-size="14">Per-site</text>
<rect x="245" y="50" width="160" height="40" rx="6" fill="#e2e8f0"/><text x="325" y="75" text-anchor="middle" class="svg-ink" font-size="11">Site tier 250M (shared)</text>
<text x="325" y="125" text-anchor="middle" class="svg-muted" font-size="12">Site ke saare IONs</text>
<text x="325" y="145" text-anchor="middle" class="svg-muted" font-size="12">ek tier share karte hain</text>
<rect x="440" y="10" width="190" height="200" rx="10" fill="#ddd6fe"/><text x="535" y="34" text-anchor="middle" class="svg-ink" font-size="14">Aggregate</text>
<rect x="460" y="50" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="535" y="75" text-anchor="middle" class="svg-ink" font-size="11">Pool 5,000 Mbps</text>
<text x="535" y="125" text-anchor="middle" class="svg-muted" font-size="12">Saare branch sites mein shared,</text>
<text x="535" y="145" text-anchor="middle" class="svg-muted" font-size="12">HA sahit</text>
</svg><p class="cap">Teen branch models: har box ka tier, har site ka tier, ya ek shared pool. HA ke liye per-device picture typical design sawal dikhati hai: kitne boxes ko licence karna hai?</p></div>
<h3>Worked example: Harbor Foods ko teen tareeke se license karna</h3>
<p>Assessment se branch peak needs aise aaye: 25 chhoti shops har ek 40 Mbps, 12 stores har ek 200 Mbps (inmein se 6 par HA mein do devices), aur 3 regional offices har ek 400 Mbps.</p>
<ul>
<li><b>Peak sum:</b> 25 x 40 = 1,000 Mbps; 12 x 200 = 2,400 Mbps; 3 x 400 = 1,200 Mbps. Peaks ka total 4,600 Mbps.</li>
<li><b>Aggregate approach:</b> peaks ek hi waqt par nahi hote, isliye jaise 3,000 Mbps ka pool real simultaneous use cover kar sakta hai. Company ko phir bhi samajhna hoga ki kya pool ko hardware limits per site enforce karti hain.</li>
<li><b>Per-site approach:</b> shops tier S (25 Mbps) mein tabhi fit hoti hain jab 25 Mbps kaafi ho; 40 Mbps nahi hai, isliye unhe M tier (250 Mbps tak) chahiye. 200 Mbps wale stores M mein fit hote hain; 400 Mbps wale regional offices ko L (2,500 Mbps tak) chahiye. HA stores ek hi site tier dete hain chahe kitne bhi IONs hon.</li>
<li><b>Per-device approach:</b> 6 HA stores ko har device ke liye licence chahiye, yani stores par 12 nahi 18 devices. Finer tiers (jaise 50 ya 500 Mbps) oversized M ya L ka paisa bachate hain.</li></ul>
<p>Numbers design logic dikhate hain: HA sites ke liye per-site sasta hai, single-box sites ke liye per-device fine granularity deta hai, aur aggregate tab best hai jab kai sites peaks share karein ya aap bandwidth baar baar add-remove karte ho.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>Licences Palo Alto Networks activation aur management portal ke through claim aur assign hote hain; aapke tenant ki documentation exact steps batati hai. Design phase mein aap kuch click nahi karte: aap ek table banate ho jo har site ko licence type aur tier se map kare, aur use customer ke owned entitlement se compare karte ho. Data center subscriptions ko alag column mein rakho taaki koi data center ION chhoot na jaaye.</p>
<div class="warn"><p><b>Common galti.</b> Per-device model mein HA pair ke sirf primary ION ko licence karna. Documentation kehti hai ki data center site par assigned <b>har</b> ION ke liye DC subscription chahiye, aur per-device licences devices ko follow karte hain. Seedha poochho ki standby kaise cover hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho kya included hai. Per-device list price mein ZBFW hota hai, aur per-site aur aggregate licences mein ZBFW, DVR aur WCR included hain. WCR aur Clarity Network DVR sirf per-device model mein optional add-ons hain. Yeh bhi yaad rakho: min 1 saal, max 5 saal, aur physical aur virtual dono IONs ko subscriptions chahiye.</p></div>
<div class="scn"><h4>Data center jise kisi ne license nahi kiya</h4><p>Ek project team ne 60 branch devices ko dhyaan se license kiya aur data center ke liye do ION 9200 order kiye, par kisi ne data center subscriptions order nahi ki. Cut-over weekend par data center devices DC role mein assign nahi ho sake aur branches ke paas hub nahi tha. Licence order ko expedite karne mein do din lage.</p><p><b>Seekh:</b> bill of materials mein teen lines chahiye: branch licences, data center subscriptions aur optional reporting add-ons.</p></div>
<div class="iv"><p class="q">"Customer ke 200 branches hain, bahut se HA pairs ke saath. Kaunsa licensing model recommend karoge?"</p><p>Main options ko HA count aur traffic pattern se compare karta hoon. HA sites ke liye per-site attractive hai kyunki pair ek tier share karta hai; aggregate bandwidth tab flexible hai jab sites ke peaks alag hon aur yeh HA scenarios ko explicitly cover karta hai aur ZBFW, WCR, DVR include karta hai; per-device single-box sites ke liye fine tiers deta hai. Main teeno ko assessment numbers par model karta hoon aur sabse sasta chunta hoon jo har site ka peak cover kare.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DC subscription: data center site par har ION (physical ya virtual) ke liye ek.</li>
<li>Branch models: per-device, per-site, aggregate bandwidth; terms 1 se 5 saal.</li>
<li>Tiers S, M, L (25, 250, 2,500 Mbps) aur finer steps; ZBFW sab mein included hai.</li>
<li>WCR aur DVR per-device ke liye add-ons hain, per-site aur aggregate mein included.</li>
<li>Effective limit hardware throughput aur licensed bandwidth mein se kam wali hoti hai.</li>
</ul></div>
`}};export{e as default};