var e={id:`site-surveys`,h:{en:`Site surveys: predictive, AP-on-a-stick, passive, active and Layer 1`,hi:`Site surveys: predictive, AP-on-a-stick, passive, active aur Layer 1`},body:{en:`
<p>A <b>site survey</b> is the process of finding out how radio behaves in a real building, so the design is based on measurements and not on hope. There is not one survey but several, used at different moments of the project. This chapter is mostly <b>concept only</b>: the lab engine has no survey tool, but it has AP positions in metres on a map and a client RSSI readout, which is exactly the evidence a survey produces.</p>

<h3>Analogy: buying a flat</h3>
<p>A <b>predictive</b> survey is reading the builder's floor plan and brochure. An <b>AP-on-a-stick</b> survey is visiting the show flat to see if the brochure was honest. A <b>post-deployment</b> survey is the final inspection with a checklist after you move in. A <b>Layer 1</b> survey is hiring someone to test noise, damp and traffic around the building.</p>

<h3>The survey types</h3>
<table class="cmp"><tr><th>Type</th><th>When</th><th>What you do</th><th>Output</th></tr>
<tr><td><b>Predictive</b></td><td>Design stage, building may not exist</td><td>Import a scaled floor plan, draw walls with materials, place virtual APs and let software model the RF</td><td>Heat maps, AP count, bill of materials</td></tr>
<tr><td><b>Pre-deployment (AP-on-a-stick)</b></td><td>Before installation</td><td>Mount a real AP on a pole or tripod at the planned height, power it by battery or PoE, walk the area and measure</td><td>Real attenuation values, confirmed AP positions</td></tr>
<tr><td><b>Post-deployment (validation)</b></td><td>After installation</td><td>Walk the finished network with a survey adapter and compare against the written targets</td><td>Pass or fail report, fixes list</td></tr>
<tr><td><b>Layer 1 (spectrum)</b></td><td>Before and after</td><td>Use a spectrum analyser to see non-Wi-Fi energy and the noise floor</td><td>Interferer list, air quality, channel advice</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Survey types compared">
<rect x="10" y="12" width="195" height="146" rx="8" fill="#ddd6fe"/><text x="107" y="34" text-anchor="middle" class="svg-ink" font-size="13">Predictive</text>
<text x="107" y="58" text-anchor="middle" class="svg-muted" font-size="12">floor plan + walls</text><text x="107" y="78" text-anchor="middle" class="svg-muted" font-size="12">software model</text><text x="107" y="98" text-anchor="middle" class="svg-muted" font-size="12">cheap, fast</text><text x="107" y="118" text-anchor="middle" class="svg-muted" font-size="12">accuracy depends on</text><text x="107" y="138" text-anchor="middle" class="svg-muted" font-size="12">material guesses</text>
<rect x="222" y="12" width="195" height="146" rx="8" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">AP-on-a-stick</text>
<text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">real AP on a pole</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">walk and measure</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">calibrates the model</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">needs site access</text>
<rect x="434" y="12" width="195" height="146" rx="8" fill="#fed7aa"/><text x="531" y="34" text-anchor="middle" class="svg-ink" font-size="13">Post-deployment</text>
<text x="531" y="58" text-anchor="middle" class="svg-muted" font-size="12">final network</text><text x="531" y="78" text-anchor="middle" class="svg-muted" font-size="12">passive + active</text><text x="531" y="98" text-anchor="middle" class="svg-muted" font-size="12">proves the targets</text><text x="531" y="118" text-anchor="middle" class="svg-muted" font-size="12">report for the customer</text>
</svg><p class="cap">Predictive proposes, AP-on-a-stick calibrates, post-deployment proves.</p></div>

<h3>Material attenuation</h3>
<p>Every obstacle takes some dB off the signal. The table gives typical orders of magnitude for 5 GHz; 2.4 GHz is a little lower, and 6 GHz a little higher. They are guides: the whole point of the AP-on-a-stick survey is to measure the real numbers.</p>
<table class="cmp"><tr><th>Material</th><th>Typical loss (dB)</th></tr>
<tr><td>Drywall or thin partition</td><td>3</td></tr>
<tr><td>Wooden door, office glass</td><td>3 to 4</td></tr>
<tr><td>Brick wall</td><td>6 to 8</td></tr>
<tr><td>Concrete wall or floor</td><td>10 to 15</td></tr>
<tr><td>Metal door, lift shaft, lead-lined room</td><td>20 or more</td></tr>
<tr><td>Coated or low-E glass, mirrors</td><td>8 or more</td></tr>
<tr><td>Crowd of people</td><td>varies, a full hall can take several dB</td></tr>
</table>
<div class="eg"><p><b>Worked example.</b> A laptop 20 m from an AP at 5 GHz with 17 dBm: the lab model gives RSSI = 17 - 46 - 35 x log10(distance in metres) = 17 - 46 - 35 x log10(20) = 17 - 46 - 45.5 = -74.5 dBm in open space. Add one drywall (3 dB) and one concrete wall (12 dB): -74.5 - 3 - 12 = -89.5 dBm, which is no longer usable. Walls matter more than distance.</p></div>

<h3>Passive and active surveys</h3>
<p>During a post-deployment (or AP-on-a-stick) walk you collect data in two ways.</p>
<ul>
<li><b>Passive survey:</b> the survey adapter listens on every channel and records every AP it hears, with RSSI, SNR, channel, noise and the number of APs on the same channel. It shows <b>coverage and interference</b>. It does not join the network.</li>
<li><b>Active survey:</b> the adapter associates to the real SSID, then measures throughput, retries, latency, packet loss and roaming time. It shows <b>the user experience</b> through the whole path to the network.</li>
</ul>
<p>Use both: passive shows whether the signal is there; active shows whether the service works. A passive pass with a failed active test usually means a back-end problem such as DHCP or RADIUS, not RF.</p>

<h3>How to run an AP-on-a-stick survey</h3>
<ol>
<li>Pick the planned model, antenna and height. Match the mounting height, because ceilings and shelving change the pattern.</li>
<li>Set transmit power and data rates as in the design (for example, 5 GHz at 14 dBm, 12 Mbps mandatory).</li>
<li>Place the AP at each planned position, walk concentric paths and record where RSSI reaches the target (for example -67 dBm).</li>
<li>Mark the real cell edge. Feed the measured loss back to the predictive model and adjust AP spacing.</li>
<li>Repeat on every floor type, in lift lobbies and in special rooms.</li>
</ol>

<h3>The Layer 1 survey</h3>
<p>A spectrum analyser reads raw energy, not Wi-Fi frames. It shows microwave ovens, Bluetooth, DECT phones, video bridges and jammers that Wi-Fi tools cannot see as frames. You read the <b>noise floor</b> (a quiet site sits near -95 dBm), the <b>duty cycle</b> (how much of the time a channel is busy with non-Wi-Fi energy) and per-channel air quality. Chapter 10 shows how CleanAir does this continuously on the APs.</p>

<h3>Planning tools and key metrics</h3>
<p>The exam also expects you to read the numbers: <b>RSSI</b> (signal), <b>noise floor</b>, <b>SNR</b> (= RSSI minus noise), <b>channel utilisation</b>, <b>retry rate</b>, <b>co-channel AP count</b> and <b>data rate</b>. A single AP heard at -60 dBm on a channel that 6 other APs also use is a capacity problem even though the signal is excellent.</p>

<div class="warn"><p><b>Common mistakes.</b> Surveying with a different power or height than the real design; surveying an empty building and forgetting that people absorb signal; trusting only the predictive map for a warehouse with metal racks; saving a heat map without the survey settings, so nobody can repeat it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Passive tests coverage and interference; active tests throughput and roaming. "Which survey needs the AP to join the SSID?" is active. "Which one needs no real hardware?" is predictive.</p></div>

<div class="scn"><h4>The glass-walled meeting rooms</h4><p>A predictive plan used 3 dB for all partitions. After a pre-deployment survey the engineer found the glass meeting rooms were coated and cost 9 dB. The planned corridor AP no longer covered the rooms behind the glass. Two extra APs were added before purchase order, not after complaints.</p><p><b>Lesson:</b> AP-on-a-stick turns material guesses into measured values at the cost of one afternoon.</p></div>

<div class="iv"><p class="q">"What is the difference between a predictive survey and an AP-on-a-stick survey?"</p><p>Predictive is software modelling on a floor plan with assumed materials, so it is fast and cheap but only as good as the assumptions. AP-on-a-stick uses a real AP at planned height to measure real attenuation and calibrate the model before purchase. Add that post-deployment surveys, passive and active, validate the finished network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Predictive designs, AP-on-a-stick calibrates, post-deployment validates, Layer 1 reveals non-Wi-Fi interference.</li>
<li>Passive listens (coverage, interference); active joins the SSID (throughput, retries, roaming).</li>
<li>Material loss matters more than distance: concrete 10 to 15 dB, drywall about 3 dB.</li>
<li>Survey with the same model, height, power and rates as the design.</li>
<li>Read RSSI, noise, SNR, utilisation, retries and co-channel AP count together.</li>
</ul></div>
`,hi:`
<p><b>Site survey</b> yeh pata lagane ki process hai ki asli building mein radio kaise behave karta hai, taaki design measurements par bane, umeed par nahi. Ek nahi, kai surveys hote hain jo project ke alag alag moments par use hote hain. Yeh chapter zyada tar <b>concept only</b> hai: lab engine mein survey tool nahi hai, lekin usme map par metres mein AP positions aur client RSSI readout hai, jo bilkul wahi evidence hai jo survey banata hai.</p>

<h3>Analogy: flat kharidna</h3>
<p><b>Predictive</b> survey builder ka floor plan aur brochure padhna hai. <b>AP-on-a-stick</b> survey show flat dekhne jaana hai ki brochure sach tha ya nahi. <b>Post-deployment</b> survey shift hone ke baad checklist ke saath final inspection hai. <b>Layer 1</b> survey kisi ko hire karna hai jo building ke aas paas noise, seelan aur traffic test kare.</p>

<h3>Survey types</h3>
<table class="cmp"><tr><th>Type</th><th>Kab</th><th>Kya karte hain</th><th>Output</th></tr>
<tr><td><b>Predictive</b></td><td>Design stage, building shayad bani hi nahi</td><td>Scaled floor plan import karo, materials ke saath deewarein draw karo, virtual APs lagao aur software RF model kare</td><td>Heat maps, AP count, bill of materials</td></tr>
<tr><td><b>Pre-deployment (AP-on-a-stick)</b></td><td>Installation se pehle</td><td>Real AP ko pole ya tripod par planned height par lagao, battery ya PoE se power do, area mein chalo aur naapo</td><td>Real attenuation values, confirmed AP positions</td></tr>
<tr><td><b>Post-deployment (validation)</b></td><td>Installation ke baad</td><td>Survey adapter ke saath taiyar network mein chalo aur likhe targets se compare karo</td><td>Pass ya fail report, fixes list</td></tr>
<tr><td><b>Layer 1 (spectrum)</b></td><td>Pehle aur baad mein</td><td>Spectrum analyser se non-Wi-Fi energy aur noise floor dekho</td><td>Interferer list, air quality, channel advice</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Survey types ki tulna">
<rect x="10" y="12" width="195" height="146" rx="8" fill="#ddd6fe"/><text x="107" y="34" text-anchor="middle" class="svg-ink" font-size="13">Predictive</text>
<text x="107" y="58" text-anchor="middle" class="svg-muted" font-size="12">floor plan + walls</text><text x="107" y="78" text-anchor="middle" class="svg-muted" font-size="12">software model</text><text x="107" y="98" text-anchor="middle" class="svg-muted" font-size="12">sasta, tez</text><text x="107" y="118" text-anchor="middle" class="svg-muted" font-size="12">accuracy material</text><text x="107" y="138" text-anchor="middle" class="svg-muted" font-size="12">ke andaze par</text>
<rect x="222" y="12" width="195" height="146" rx="8" fill="#bbf7d0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">AP-on-a-stick</text>
<text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">pole par real AP</text><text x="320" y="78" text-anchor="middle" class="svg-muted" font-size="12">chalo aur naapo</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">model calibrate karta hai</text><text x="320" y="118" text-anchor="middle" class="svg-muted" font-size="12">site access chahiye</text>
<rect x="434" y="12" width="195" height="146" rx="8" fill="#fed7aa"/><text x="531" y="34" text-anchor="middle" class="svg-ink" font-size="13">Post-deployment</text>
<text x="531" y="58" text-anchor="middle" class="svg-muted" font-size="12">final network</text><text x="531" y="78" text-anchor="middle" class="svg-muted" font-size="12">passive + active</text><text x="531" y="98" text-anchor="middle" class="svg-muted" font-size="12">targets prove karta hai</text><text x="531" y="118" text-anchor="middle" class="svg-muted" font-size="12">customer ke liye report</text>
</svg><p class="cap">Predictive propose karta hai, AP-on-a-stick calibrate karta hai, post-deployment prove karta hai.</p></div>

<h3>Material attenuation</h3>
<p>Har rukawat signal se kuch dB kam kar deti hai. Table 5 GHz ke typical orders of magnitude deti hai; 2.4 GHz thoda kam, 6 GHz thoda zyada hota hai. Yeh guides hain: AP-on-a-stick survey ka poora maqsad hi real numbers naapna hai.</p>
<table class="cmp"><tr><th>Material</th><th>Typical loss (dB)</th></tr>
<tr><td>Drywall ya patli partition</td><td>3</td></tr>
<tr><td>Wooden door, office glass</td><td>3 se 4</td></tr>
<tr><td>Brick wall</td><td>6 se 8</td></tr>
<tr><td>Concrete wall ya floor</td><td>10 se 15</td></tr>
<tr><td>Metal door, lift shaft, lead-lined room</td><td>20 ya zyada</td></tr>
<tr><td>Coated ya low-E glass, mirrors</td><td>8 ya zyada</td></tr>
<tr><td>Logon ki bheed</td><td>badalta hai, bhara hall kai dB kha sakta hai</td></tr>
</table>
<div class="eg"><p><b>Worked example.</b> AP se 20 m door laptop, 5 GHz, 17 dBm: lab model RSSI = 17 - 46 - 35 x log10(20) = 17 - 46 - 45.5 = -74.5 dBm free space mein. Ek drywall (3 dB) aur ek concrete wall (12 dB) jodo: -74.5 - 3 - 12 = -89.5 dBm, jo ab usable nahi. Deewarein distance se zyada matter karti hain.</p></div>

<h3>Passive aur active surveys</h3>
<p>Post-deployment (ya AP-on-a-stick) walk ke dauraan data do tareeqon se collect hota hai.</p>
<ul>
<li><b>Passive survey:</b> survey adapter har channel par sunta hai aur jitne APs sunai dein sabko RSSI, SNR, channel, noise aur same channel par APs ki ginti ke saath record karta hai. Yeh <b>coverage aur interference</b> dikhata hai. Yeh network join nahi karta.</li>
<li><b>Active survey:</b> adapter real SSID se associate karta hai, phir throughput, retries, latency, packet loss aur roaming time naapta hai. Yeh network tak poore path ke through <b>user experience</b> dikhata hai.</li>
</ul>
<p>Dono use karo: passive batata hai signal hai ya nahi; active batata hai service chal rahi hai ya nahi. Passive pass aur active fail ka matlab aam taur par back-end problem hota hai jaise DHCP ya RADIUS, RF nahi.</p>

<h3>AP-on-a-stick survey kaise chalate hain</h3>
<ol>
<li>Planned model, antenna aur height chuno. Mounting height match karo, kyunki ceilings aur shelving pattern badal dete hain.</li>
<li>Transmit power aur data rates design ke jaise set karo (jaise 5 GHz par 14 dBm, 12 Mbps mandatory).</li>
<li>AP ko har planned position par rakho, concentric paths mein chalo aur record karo jahan RSSI target (jaise -67 dBm) tak pahunchta hai.</li>
<li>Real cell edge mark karo. Naapi hui loss ko predictive model mein wapas do aur AP spacing adjust karo.</li>
<li>Har floor type, lift lobbies aur special rooms mein dohrao.</li>
</ol>

<h3>Layer 1 survey</h3>
<p>Spectrum analyser raw energy padhta hai, Wi-Fi frames nahi. Woh microwave ovens, Bluetooth, DECT phones, video bridges aur jammers dikhata hai jo Wi-Fi tools frames ki tarah nahi dekh paate. Aap <b>noise floor</b> padhte ho (shaant site lagbhag -95 dBm par hoti hai), <b>duty cycle</b> (channel kitni der non-Wi-Fi energy se busy rehta hai) aur per-channel air quality. Chapter 10 dikhata hai ki CleanAir yeh APs par continuously kaise karta hai.</p>

<h3>Planning tools aur key metrics</h3>
<p>Exam numbers padhna bhi expect karta hai: <b>RSSI</b> (signal), <b>noise floor</b>, <b>SNR</b> (= RSSI minus noise), <b>channel utilisation</b>, <b>retry rate</b>, <b>co-channel AP count</b> aur <b>data rate</b>. Ek AP -60 dBm par sunai de lekin us channel par 6 aur APs bhi hon, to signal shandar hone par bhi woh capacity problem hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Real design se alag power ya height se survey karna; khaali building survey karke yeh bhool jaana ki log signal absorb karte hain; metal racks wale warehouse mein sirf predictive map par bharosa; survey settings ke bina heat map save karna, jisse koi dohra nahi sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Passive coverage aur interference test karta hai; active throughput aur roaming test karta hai. "Kaunse survey mein AP ko SSID join karna padta hai?" active. "Kisme real hardware nahi chahiye?" predictive.</p></div>

<div class="scn"><h4>Glass wale meeting rooms</h4><p>Predictive plan ne har partition ke liye 3 dB liya. Pre-deployment survey ke baad engineer ko pata chala ki glass meeting rooms coated the aur 9 dB le rahe the. Planned corridor AP ab glass ke peeche rooms cover nahi karta tha. Purchase order se pehle do extra APs add hue, shikayat ke baad nahi.</p><p><b>Seekh:</b> AP-on-a-stick material guesses ko ek dopahar ki keemat par naapi hui values mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Predictive survey aur AP-on-a-stick survey mein kya farak hai?"</p><p>Predictive floor plan par assumed materials ke saath software modelling hai, isliye tez aur sasta hai lekin assumptions jitna hi achha. AP-on-a-stick planned height par real AP use karke real attenuation naapta hai aur purchase se pehle model calibrate karta hai. Add karo ki post-deployment surveys, passive aur active, taiyar network ko validate karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Predictive design karta hai, AP-on-a-stick calibrate karta hai, post-deployment validate karta hai, Layer 1 non-Wi-Fi interference dikhata hai.</li>
<li>Passive sunta hai (coverage, interference); active SSID join karta hai (throughput, retries, roaming).</li>
<li>Material loss distance se zyada matter karta hai: concrete 10 se 15 dB, drywall lagbhag 3 dB.</li>
<li>Design wale model, height, power aur rates ke saath survey karo.</li>
<li>RSSI, noise, SNR, utilisation, retries aur co-channel AP count ko saath padho.</li>
</ul></div>
`}};export{e as default};