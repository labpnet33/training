var e=(e,t,n,r,i,a)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="64" rx="8" fill="`+r+`" stroke="#64748b"/><text x="`+(e+n/2)+`" y="`+(t+28)+`" text-anchor="middle" class="svg-ink" font-size="12">`+i+`</text><text x="`+(e+n/2)+`" y="`+(t+46)+`" text-anchor="middle" class="svg-muted" font-size="12">`+a+`</text>`,t=t=>`<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="`+t.aria+`">`+e(10,20,190,`#bae6fd`,t.a1,t.a2)+e(225,20,190,`#ddd6fe`,t.b1,t.b2)+e(440,20,190,`#fde68a`,t.c1,t.c2)+`<line x1="200" y1="52" x2="225" y2="52" stroke="#64748b" stroke-width="2"/><line x1="415" y1="52" x2="440" y2="52" stroke="#64748b" stroke-width="2"/>`+e(10,120,190,`#fed7aa`,t.d1,t.d2)+e(225,120,190,`#bbf7d0`,t.e1,t.e2)+e(440,120,190,`#e2e8f0`,t.f1,t.f2)+`<line x1="200" y1="152" x2="225" y2="152" stroke="#64748b" stroke-width="2"/><line x1="415" y1="152" x2="440" y2="152" stroke="#64748b" stroke-width="2"/><line x1="535" y1="84" x2="535" y2="120" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><text x="320" y="228" text-anchor="middle" class="svg-accent" font-size="13">`+t.loop+`</text></svg><p class="cap">`+t.cap+`</p></div>`,n=t({aria:`Survey lifecycle`,a1:`1 Requirements`,a2:`targets and constraints`,b1:`2 Predictive survey`,b2:`model, AP count, BoM`,c1:`3 On-site pre-deployment`,c2:`AP-on-a-stick, samples`,d1:`4 Install and configure`,d2:`channels, power, SSIDs`,e1:`5 Post-deployment`,e2:`validate against targets`,f1:`6 Report and operate`,f2:`baseline, re-survey`,loop:`Re-survey after renovation, new apps or complaints`,cap:`Each survey type answers a different question. Skipping one means you carry its risk into production.`}),r=t({aria:`Survey lifecycle`,a1:`1 Requirements`,a2:`targets aur constraints`,b1:`2 Predictive survey`,b2:`model, AP count, BoM`,c1:`3 On-site pre-deployment`,c2:`AP-on-a-stick, samples`,d1:`4 Install aur configure`,d2:`channels, power, SSIDs`,e1:`5 Post-deployment`,e2:`targets se validate`,f1:`6 Report aur operate`,f2:`baseline, re-survey`,loop:`Renovation, naye apps ya complaints ke baad re-survey`,cap:`Har survey type ek alag sawaal ka jawab deta hai. Ek skip karoge to uska risk production mein jayega.`}),i={id:`survey-types-validation`,h:{en:`Survey types and validation: predictive, pre-deployment and post-deployment`,hi:`Survey types aur validation: predictive, pre-deployment aur post-deployment`},body:{en:`
<p>A <b>site survey</b> is the structured study of a location's radio environment and requirements. The 300-425 exam expects you to know the three main survey types, when each is the right choice, what tools they use, and how to validate and report the result.</p>

<h3>Case: Riverside Academy, three buildings, 1,400 students</h3>
<p>Riverside Academy (fictional) is replacing an old Wi-Fi network before a one-device-per-student programme. The requirement: every classroom supports 30 students streaming and taking online tests at once; two sports halls need event coverage; the library needs high capacity. Constraints: new construction in Building C (drawings only), old brick buildings A and B with unknown wall types, school holidays as the only time for on-site work, and a fixed budget that must be approved before ordering hardware.</p>

<h3>The three survey types</h3>
<table class="cmp"><tr><th>Type</th><th>What it is</th><th>Best for</th><th>Limits</th></tr>
<tr><td><b>Predictive (virtual) survey</b></td><td>Import a floor plan, set scale, mark wall materials, place virtual APs and let software model coverage, SNR, capacity and overlap.</td><td>New buildings, budgeting, first-pass AP count, comparing options, buildings you cannot enter</td><td>Only as good as the wall and material data; cannot see real interference or surprises</td></tr>
<tr><td><b>On-site pre-deployment (AP-on-a-stick)</b></td><td>Mount a real AP on a pole or tripod at planned locations, with the planned power and antenna, and measure with a survey adapter or analyser device.</td><td>Validating the model, unusual environments (warehouses, hospitals, factories), measuring real attenuation and interference</td><td>Time-consuming and needs access; only samples the building</td></tr>
<tr><td><b>Post-deployment (validation) survey</b></td><td>After installation, walk the whole coverage area with the production APs and measure against the requirements.</td><td>Proving the network meets the design, finding gaps, handing over a baseline report</td><td>Problems are found after money is spent, so it must confirm, not discover</td></tr>
</table>
`+n+`
<h3>Active, passive and spectrum measurement</h3>
<ul>
<li><b>Passive survey.</b> The survey client listens only: it records signal strength, noise, channel and AP visibility without joining the network. Good for coverage, overlap and co-channel interference.</li>
<li><b>Active survey.</b> The client associates to the SSID and measures real throughput, packet loss, retries and roaming. Good for proving application performance.</li>
<li><b>Spectrum analysis.</b> A dedicated analyser shows non-Wi-Fi interference (chapter 6).</li>
</ul>
<p>Common tools are a survey application (Ekahau and similar tools) paired with a survey adapter or sensor, and Cisco planning features in its management platforms. The exam is concept-based: know what the tool does (import plan, define walls, place APs, display heat maps, generate reports), not button positions.</p>

<h3>Options and the chosen approach for Riverside</h3>
<table class="cmp"><tr><th>Option</th><th>Benefit</th><th>Trade-off</th></tr>
<tr><td>Predictive only, then install</td><td>Fast and cheap</td><td>Unknown brick walls in A and B; risk of holes</td></tr>
<tr><td>Full on-site survey of all buildings</td><td>Highest certainty</td><td>Expensive; Building C does not exist yet</td></tr>
<tr><td>Predictive for all buildings, AP-on-a-stick on sample rooms in A and B to calibrate walls, then post-deployment validation of everything</td><td>Cost-effective with measured walls</td><td>Needs holiday access for samples</td></tr>
</table>
<p>The engineer picks the third approach. Two classrooms and the library in Building A were measured with one real AP at the planned position. The model had assumed brick walls at 6 dB; measurements showed 11 dB, so the wall type in the model was changed for the entire building before the AP count was finalised. The count rose from 52 to 61.</p>

<div class="eg"><p><b>Worked example.</b> Calibration compares the predicted RSSI with a measured one. If the model predicts -62 dBm at a test point behind two walls and you measure -70 dBm, the walls are costing about 8 dB more than assumed. Update the material loss, re-run the model, and recheck AP count.</p></div>

<h3>What a validation survey checks and reports</h3>
<ul>
<li><b>Primary signal</b> above the target everywhere it must be (for example -67 dBm for voice areas).</li>
<li><b>Second AP</b> heard at an acceptable level for roaming.</li>
<li><b>SNR</b> and noise floor.</li>
<li><b>Co-channel overlap</b>: how many APs on the same channel are heard above a threshold.</li>
<li><b>Data rate and throughput</b> from an active survey; retries and packet loss.</li>
<li><b>Roaming</b> behaviour when walking test routes.</li>
<li><b>Channel and power</b> settings recorded as the as-built baseline.</li>
</ul>
<p>The report contains heat maps by band, an AP list with locations and settings, pass/fail against each requirement, the exceptions and the recommended fixes, plus the survey conditions (date, stock, occupancy, device used). That report is the handover baseline; re-survey after renovations, new applications or complaints.</p>

<div class="warn"><p><b>Common mistakes.</b> Surveying with a laptop radio that is weaker or more sensitive than the real clients (the survey device should represent the worst client); surveying only one band; ignoring the AP's planned power and antenna during AP-on-a-stick; no baseline report; skipping validation after "quick" changes.</p></div>
<div class="exam"><p><b>Exam trap.</b> Predictive is for planning and budgeting; AP-on-a-stick is pre-deployment measurement with real hardware; post-deployment validates the installed network. If the question says the building does not exist yet, the answer is predictive. If it asks for proof the network meets requirements, the answer is post-deployment.</p></div>

<div class="scn"><h4>The survey with the wrong laptop</h4><p>A contractor validated a school with a high-end laptop adapter that hears 6 to 8 dB better than student tablets. The report passed everything. Students with tablets still had weak signal in corners. A re-survey with a device that matched the tablets' sensitivity, and an offset applied for the difference, found the gaps. Three APs were added.</p><p><b>Lesson:</b> the survey device must represent the clients you are designing for, or you must apply a measured offset.</p></div>
<div class="iv"><p class="q">"When would you do a predictive survey only, and when would you add on-site work?"</p><p>Strong answer: Predictive alone suits new builds, budgeting, and simple office space with known materials. I add on-site AP-on-a-stick when the environment is difficult, materials are uncertain, or the cost of a miss is high, such as hospitals, warehouses and factories. In every case I finish with a post-deployment validation against the requirements.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Predictive survey models coverage from plans; it is the planning and budgeting tool.</li>
<li>On-site pre-deployment (AP-on-a-stick) measures real propagation with real APs at planned positions.</li>
<li>Post-deployment survey validates the installed network against requirements and creates the baseline.</li>
<li>Passive surveys measure signal; active surveys measure performance; spectrum analysis finds non-Wi-Fi noise.</li>
<li>Use a survey device that represents your worst client, and report conditions with the results.</li>
</ul></div>
`,hi:`
<p><b>Site survey</b> kisi location ke radio environment aur requirements ka structured study hai. 300-425 exam expect karta hai ki aap teen main survey types jaanein, har ek kab sahi choice hai, woh kaunse tools use karte hain, aur result ko validate aur report kaise karte hain.</p>

<h3>Case: Riverside Academy, teen buildings, 1,400 students</h3>
<p>Riverside Academy (fictional) one-device-per-student programme se pehle purana Wi-Fi network replace kar rahi hai. Requirement: har classroom 30 students ko ek saath streaming aur online tests support kare; do sports halls ko event coverage chahiye; library ko high capacity chahiye. Constraints: Building C naya construction hai (sirf drawings), purani brick buildings A aur B mein unknown wall types, school holidays hi on-site kaam ka ekmatra time, aur fixed budget jo hardware order se pehle approve hona chahiye.</p>

<h3>Teen survey types</h3>
<table class="cmp"><tr><th>Type</th><th>Kya hai</th><th>Best for</th><th>Limits</th></tr>
<tr><td><b>Predictive (virtual) survey</b></td><td>Floor plan import karo, scale set karo, wall materials mark karo, virtual APs rakho aur software coverage, SNR, capacity aur overlap model kare.</td><td>Nayi buildings, budgeting, pehla AP count, options compare karna, jin buildings mein ghus nahi sakte</td><td>Utna hi achha jitna wall aur material data; real interference ya surprises nahi dekh sakta</td></tr>
<tr><td><b>On-site pre-deployment (AP-on-a-stick)</b></td><td>Planned locations par pole ya tripod par real AP lagao, planned power aur antenna ke saath, aur survey adapter ya analyser device se measure karo.</td><td>Model validate karna, mushkil environments (warehouses, hospitals, factories), real attenuation aur interference measure karna</td><td>Time lagta hai aur access chahiye; building ka sirf sample milta hai</td></tr>
<tr><td><b>Post-deployment (validation) survey</b></td><td>Installation ke baad production APs ke saath poora coverage area chalo aur requirements ke against measure karo.</td><td>Prove karna ki network design meet karta hai, gaps dhundhna, baseline report handover karna</td><td>Problems paisa kharch hone ke baad milti hain, isliye ise confirm karna hai, discover nahi</td></tr>
</table>
`+r+`
<h3>Active, passive aur spectrum measurement</h3>
<ul>
<li><b>Passive survey.</b> Survey client sirf sunta hai: network join kiye bina signal strength, noise, channel aur AP visibility record karta hai. Coverage, overlap aur co-channel interference ke liye achha.</li>
<li><b>Active survey.</b> Client SSID se associate hota hai aur real throughput, packet loss, retries aur roaming measure karta hai. Application performance prove karne ke liye achha.</li>
<li><b>Spectrum analysis.</b> Dedicated analyser non-Wi-Fi interference dikhata hai (chapter 6).</li>
</ul>
<p>Common tools survey application (Ekahau jaise tools) hain jo survey adapter ya sensor ke saath chalte hain, aur Cisco ke management platforms ke planning features. Exam concept-based hai: jaano ki tool kya karta hai (plan import, walls define, APs place, heat maps, reports), button positions nahi.</p>

<h3>Riverside ke options aur chosen approach</h3>
<table class="cmp"><tr><th>Option</th><th>Fayda</th><th>Trade-off</th></tr>
<tr><td>Sirf predictive, phir install</td><td>Fast aur sasta</td><td>A aur B mein unknown brick walls; holes ka risk</td></tr>
<tr><td>Saari buildings ka full on-site survey</td><td>Sabse zyada certainty</td><td>Mehenga; Building C abhi exist hi nahi karti</td></tr>
<tr><td>Sab buildings ke liye predictive, A aur B ke sample rooms mein AP-on-a-stick se walls calibrate, phir sab ka post-deployment validation</td><td>Measured walls ke saath cost-effective</td><td>Samples ke liye holiday access chahiye</td></tr>
</table>
<p>Engineer teesra approach chunta hai. Building A ke do classrooms aur library planned position par ek real AP se measure kiye gaye. Model ne brick walls 6 dB maani thi; measurement ne 11 dB dikhaya, isliye AP count final hone se pehle poori building ke liye model mein wall type badal diya gaya. Count 52 se 61 ho gaya.</p>

<div class="eg"><p><b>Worked example.</b> Calibration predicted RSSI ko measured RSSI se compare karti hai. Agar model do walls ke peeche test point par -62 dBm predict karta hai aur aap -70 dBm measure karte ho, to walls assumed se lagbhag 8 dB zyada kha rahi hain. Material loss update karo, model dobara chalao, aur AP count dobara check karo.</p></div>

<h3>Validation survey kya check aur report karta hai</h3>
<ul>
<li><b>Primary signal</b> target se upar jahan zaroori ho (jaise voice areas ke liye -67 dBm).</li>
<li><b>Doosra AP</b> roaming ke liye acceptable level par sunai de.</li>
<li><b>SNR</b> aur noise floor.</li>
<li><b>Co-channel overlap</b>: threshold se upar kitne APs same channel par sunai dete hain.</li>
<li>Active survey se <b>data rate aur throughput</b>; retries aur packet loss.</li>
<li>Test routes par chalte hue <b>roaming</b> behaviour.</li>
<li>As-built baseline ke roop mein record kiye gaye <b>channel aur power</b> settings.</li>
</ul>
<p>Report mein band-wise heat maps, locations aur settings ke saath AP list, har requirement ke against pass/fail, exceptions aur recommended fixes, aur survey conditions (date, stock, occupancy, device) hote hain. Yeh report handover baseline hai; renovation, naye applications ya complaints ke baad re-survey karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Aise laptop radio se survey jo asli clients se kamzor ya zyada sensitive ho (survey device ko sabse kamzor client represent karna chahiye); sirf ek band survey karna; AP-on-a-stick mein AP ka planned power aur antenna ignore karna; baseline report na banana; "quick" changes ke baad validation skip karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Predictive planning aur budgeting ke liye; AP-on-a-stick real hardware se pre-deployment measurement; post-deployment installed network validate karta hai. Agar question kehta hai building abhi exist nahi karti, to jawab predictive. Agar proof maanga hai ki network requirements meet karta hai, to jawab post-deployment.</p></div>

<div class="scn"><h4>Galat laptop se survey</h4><p>Ek contractor ne school ko high-end laptop adapter se validate kiya jo student tablets se 6 se 8 dB behtar sunta hai. Report ne sab kuch pass kiya. Tablets wale students ko phir bhi corners mein weak signal mila. Tablets ki sensitivity se match karte device se re-survey aur difference ke liye offset lagaane par gaps mile. Teen APs add kiye gaye.</p><p><b>Lesson:</b> survey device un clients ko represent kare jinke liye design kar rahe ho, ya measured offset lagao.</p></div>
<div class="iv"><p class="q">"Sirf predictive survey kab karoge, aur on-site kaam kab jodoge?"</p><p>Strong answer: Sirf predictive naye builds, budgeting aur known materials wale simple office space ke liye theek hai. Jab environment mushkil ho, materials uncertain hon, ya miss ki cost zyada ho, jaise hospitals, warehouses aur factories, tab main on-site AP-on-a-stick jodta hoon. Har case mein main requirements ke against post-deployment validation se khatam karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Predictive survey plans se coverage model karta hai; yeh planning aur budgeting tool hai.</li>
<li>On-site pre-deployment (AP-on-a-stick) planned positions par real APs se real propagation measure karta hai.</li>
<li>Post-deployment survey installed network ko requirements ke against validate karta hai aur baseline banata hai.</li>
<li>Passive survey signal naapta hai; active survey performance; spectrum analysis non-Wi-Fi noise dhundhta hai.</li>
<li>Apne sabse kamzor client ko represent karne wala survey device use karo, aur results ke saath conditions report karo.</li>
</ul></div>
`}};export{i as default};