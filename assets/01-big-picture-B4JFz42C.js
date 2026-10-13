var e={id:`big-picture`,h:{en:`Wireless design: requirements and the design method`,hi:`Wireless design: requirements aur design method`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design a Wi-Fi network on paper before a single AP is mounted: gather requirements, choose a survey type, size coverage and capacity, plan channels, power and widths, handle voice, video and high density, do the dB maths for antennas and links, understand outdoor and mesh, and let RRM and CleanAir look after the plan afterwards. The five labs let you practise channel plans, power, width and data rates on an AP map and prove each result with client RSSI. <b>Prerequisites:</b> the <code>wl-rf</code> module (bands, channels, RSSI and SNR, RRM basics, RF profiles and RF tags). We refer back to it and do not repeat it in depth.</p>

<h3>Analogy: designing a Wi-Fi network is like planning street lighting for a campus</h3>
<p>A lighting engineer does not walk around hammering in poles and hoping. She asks who uses the paths and when, how bright it must be at the dark corners, where the walls and trees block light, how many poles the budget allows, and then checks the result at night. Wi-Fi design is the same: <b>requirements first, a model second, a measurement third, a night-time check at the end</b>. An AP is a light pole for radio. Walls are trees. Users are people on the path, and the more people, the more poles you need even if the path is already lit.</p>

<h3>The two questions every design answers</h3>
<ul>
<li><b>Coverage:</b> is there enough signal everywhere users go? Measured as RSSI and SNR at the cell edge.</li>
<li><b>Capacity:</b> can the airtime carry what users do at the busiest hour? Measured as clients, throughput per client and channel utilisation.</li>
</ul>
<p>Beginners design for coverage only and fail on Monday morning when 200 people connect. Good designs satisfy both, plus roaming, security, power and growth.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The wireless design lifecycle">
<rect x="8" y="40" width="98" height="52" rx="8" fill="#bae6fd"/><text x="57" y="62" text-anchor="middle" class="svg-ink" font-size="12">Require-</text><text x="57" y="78" text-anchor="middle" class="svg-ink" font-size="12">ments</text>
<rect x="118" y="40" width="98" height="52" rx="8" fill="#ddd6fe"/><text x="167" y="62" text-anchor="middle" class="svg-ink" font-size="12">Predictive</text><text x="167" y="78" text-anchor="middle" class="svg-ink" font-size="12">model</text>
<rect x="228" y="40" width="98" height="52" rx="8" fill="#bbf7d0"/><text x="277" y="62" text-anchor="middle" class="svg-ink" font-size="12">Pre-deploy</text><text x="277" y="78" text-anchor="middle" class="svg-ink" font-size="12">validation</text>
<rect x="338" y="40" width="98" height="52" rx="8" fill="#fde68a"/><text x="387" y="62" text-anchor="middle" class="svg-ink" font-size="12">Install and</text><text x="387" y="78" text-anchor="middle" class="svg-ink" font-size="12">configure</text>
<rect x="448" y="40" width="88" height="52" rx="8" fill="#fed7aa"/><text x="492" y="62" text-anchor="middle" class="svg-ink" font-size="12">Post-deploy</text><text x="492" y="78" text-anchor="middle" class="svg-ink" font-size="12">survey</text>
<rect x="548" y="40" width="84" height="52" rx="8" fill="#e2e8f0"/><text x="590" y="62" text-anchor="middle" class="svg-ink" font-size="12">Operate</text><text x="590" y="78" text-anchor="middle" class="svg-ink" font-size="12">and tune</text>
<path d="M106 66h12M216 66h12M326 66h12M436 66h12M536 66h12" stroke="#64748b" stroke-width="2"/>
<path d="M590 92v28H57V92" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">changes in the building or the users send you back to the start</text>
</svg><p class="cap">The design lifecycle. Each stage produces evidence for the next.</p></div>

<h3>Requirements gathering</h3>
<p>Before any tool opens, collect answers. The table is a working checklist.</p>
<table class="cmp"><tr><th>Topic</th><th>Questions to ask</th></tr>
<tr><td><b>Users and devices</b></td><td>How many, what types (laptops, phones, scanners, sensors), which Wi-Fi generation, which bands do they support, 2.4 GHz only devices?</td></tr>
<tr><td><b>Applications</b></td><td>Voice, video, cloud apps, large file sync, location tracking, real-time scanners. What is the target Mbps per client?</td></tr>
<tr><td><b>Areas</b></td><td>Floor plans with a scale, ceiling heights, materials, lifts, outdoors, high-density rooms, restricted zones.</td></tr>
<tr><td><b>Roaming</b></td><td>Do clients move while connected, how fast, across floors, between buildings?</td></tr>
<tr><td><b>Infrastructure</b></td><td>Switch ports, PoE budget, cable runs, controller model and AP licences, VLANs, DHCP, RADIUS.</td></tr>
<tr><td><b>Constraints</b></td><td>Budget, aesthetics, heritage walls, regulatory domain, install windows, growth in three years.</td></tr>
</table>
<p>The exam calls this "collect design requirements and evaluate constraints". Write the requirements as <b>measurable targets</b>, for example: <i>-67 dBm minimum on 5 GHz everywhere on floor 2, 25 dB SNR, 5 Mbps per client for 90 clients in room L1, voice roaming without a call drop.</i> A target you cannot measure cannot be validated later.</p>

<div class="eg"><p><b>Worked example.</b> Mumbai HQ floor 2: 120 staff, each with one laptop and one phone (240 devices), plus 20 voice handsets. Targets written down: 5 GHz RSSI of -67 dBm or better in all work areas, SNR 25 dB, 2.4 GHz kept only for 15 old sensors, 5 Mbps per active client, 40 percent of devices active at once, voice with 802.11k, r and v. Active clients = 0.40 x 240 = 96. Throughput demand = 96 x 5 = 480 Mbps. We will turn this into an AP count in chapter 3.</p></div>

<h3>Where this module sits in the blueprint</h3>
<p>The ENWLSD 300-425 design exam covers four areas: wireless site survey, wired and wireless infrastructure (including radio management, high density and mesh), mobility, and WLAN high availability. This module teaches the first two in depth. Mobility groups, roaming optimisation and controller and AP high availability are in <code>wl-mobility</code>, and we preview them where they touch design. Our labs practise skills on a learning model; the course does not claim to be an official certification course.</p>

<div class="note"><p><b>How the labs map.</b> Chapter 4 and the lab <code>wl-design-clean-5g-plan</code>; chapter 7 and <code>wl-design-high-density</code>; chapter 9 and <code>wl-design-rrm-model</code>; chapter 11 walks the two troubleshooting labs <code>wl-design-coverage-hole</code> and <code>wl-design-width-trap</code>. The calculators (FSPL, EIRP, link budget) are chapter 5 and the scenarios, not labs. Real survey tools, CleanAir hardware, real RRM algorithms, mesh and antenna patterns are <b>concept only</b>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Starting with a vendor tool or an AP count. An AP count without requirements is a guess dressed as a number.</p></div>

<div class="scn"><h4>The hospital wing that was "covered"</h4><p>A contractor delivered a ward with a perfect -60 dBm heat map. Nurses still complained of slow tablets. Nobody had asked about the 18 barcode scanners per ward, the voice badges, or the lead-lined X-ray rooms. After a requirements workshop the team added capacity APs in the corridor, moved two APs out of the X-ray rooms, and wrote target RSSI and per-device throughput into the acceptance test.</p><p><b>Lesson:</b> a heat map answers coverage only. Requirements decide the design.</p></div>

<div class="iv"><p class="q">"Walk me through how you start a wireless design."</p><p>Strong answer: requirements and constraints first (users, devices, apps, density, roaming, materials, budget), then a predictive model, then pre-deployment validation with a few real APs, then install, then a post-deployment survey against written targets. Mention that coverage and capacity are separate questions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design answers two questions: coverage (signal) and capacity (airtime).</li>
<li>Lifecycle: requirements, predictive, pre-deploy validation, install, post-deploy survey, operate and tune.</li>
<li>Write requirements as measurable targets such as RSSI, SNR and Mbps per client.</li>
<li>ENWLSD areas: site survey, infrastructure and radio management, mobility, high availability.</li>
<li>wl-rf is the prerequisite; mobility and HA live in wl-mobility.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap ek bhi AP mount kiye bina paper par Wi-Fi network design karna seekhoge: requirements collect karna, survey type chunna, coverage aur capacity size karna, channels, power aur widths plan karna, voice, video aur high density handle karna, antennas aur links ke liye dB maths karna, outdoor aur mesh samajhna, aur RRM aur CleanAir ko baad mein plan sambhalne dena. Paanch labs mein aap AP map par channel plans, power, width aur data rates practise karoge aur har result ko client RSSI se prove karoge. <b>Prerequisites:</b> <code>wl-rf</code> module (bands, channels, RSSI aur SNR, RRM basics, RF profiles aur RF tags). Hum usse refer karte hain, depth mein dobara nahi padhate.</p>

<h3>Analogy: Wi-Fi design campus ki street lighting plan karne jaisa hai</h3>
<p>Lighting engineer ghoom ghoom kar pole thokti nahi aur ummeed nahi karti. Woh poochti hai ki raste kaun aur kab use karta hai, andhere kone par kitni roshni chahiye, deewarein aur ped kahan roshni rokte hain, budget kitne pole deta hai, aur phir raat ko result check karti hai. Wi-Fi design bhi waisa hi hai: <b>pehle requirements, doosra model, teesra measurement, aur end mein raat wala check</b>. AP radio ka light pole hai. Deewarein ped hain. Users raste par log hain, aur jitne zyada log, utne zyada pole chahiye chahe raasta pehle se roshan ho.</p>

<h3>Do sawal jinka jawab har design deta hai</h3>
<ul>
<li><b>Coverage:</b> jahan users jaate hain wahan signal kaafi hai? RSSI aur SNR se cell edge par naapa jaata hai.</li>
<li><b>Capacity:</b> busiest hour mein airtime woh utha sakta hai jo users karte hain? Clients, throughput per client aur channel utilisation se naapa jaata hai.</li>
</ul>
<p>Beginners sirf coverage design karte hain aur Monday subah jab 200 log connect hote hain tab fail ho jaate hain. Achhe designs dono satisfy karte hain, saath mein roaming, security, power aur growth.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Wireless design lifecycle">
<rect x="8" y="40" width="98" height="52" rx="8" fill="#bae6fd"/><text x="57" y="62" text-anchor="middle" class="svg-ink" font-size="12">Require-</text><text x="57" y="78" text-anchor="middle" class="svg-ink" font-size="12">ments</text>
<rect x="118" y="40" width="98" height="52" rx="8" fill="#ddd6fe"/><text x="167" y="62" text-anchor="middle" class="svg-ink" font-size="12">Predictive</text><text x="167" y="78" text-anchor="middle" class="svg-ink" font-size="12">model</text>
<rect x="228" y="40" width="98" height="52" rx="8" fill="#bbf7d0"/><text x="277" y="62" text-anchor="middle" class="svg-ink" font-size="12">Pre-deploy</text><text x="277" y="78" text-anchor="middle" class="svg-ink" font-size="12">validation</text>
<rect x="338" y="40" width="98" height="52" rx="8" fill="#fde68a"/><text x="387" y="62" text-anchor="middle" class="svg-ink" font-size="12">Install aur</text><text x="387" y="78" text-anchor="middle" class="svg-ink" font-size="12">configure</text>
<rect x="448" y="40" width="88" height="52" rx="8" fill="#fed7aa"/><text x="492" y="62" text-anchor="middle" class="svg-ink" font-size="12">Post-deploy</text><text x="492" y="78" text-anchor="middle" class="svg-ink" font-size="12">survey</text>
<rect x="548" y="40" width="84" height="52" rx="8" fill="#e2e8f0"/><text x="590" y="62" text-anchor="middle" class="svg-ink" font-size="12">Operate aur</text><text x="590" y="78" text-anchor="middle" class="svg-ink" font-size="12">tune</text>
<path d="M106 66h12M216 66h12M326 66h12M436 66h12M536 66h12" stroke="#64748b" stroke-width="2"/>
<path d="M590 92v28H57V92" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">building ya users badlein to wapas start par jaao</text>
</svg><p class="cap">Design lifecycle. Har stage agle stage ke liye evidence banata hai.</p></div>

<h3>Requirements gathering</h3>
<p>Koi bhi tool kholne se pehle jawab collect karo. Table ek working checklist hai.</p>
<table class="cmp"><tr><th>Topic</th><th>Kaun se sawal poochne hain</th></tr>
<tr><td><b>Users aur devices</b></td><td>Kitne, kis type ke (laptops, phones, scanners, sensors), kaun si Wi-Fi generation, kaun se bands support karte hain, 2.4 GHz only devices?</td></tr>
<tr><td><b>Applications</b></td><td>Voice, video, cloud apps, bade file sync, location tracking, real-time scanners. Per client target Mbps kya hai?</td></tr>
<tr><td><b>Areas</b></td><td>Scale wale floor plans, ceiling heights, materials, lifts, outdoors, high-density rooms, restricted zones.</td></tr>
<tr><td><b>Roaming</b></td><td>Kya clients connected rehte hue move karte hain, kitni speed se, floors ke beech, buildings ke beech?</td></tr>
<tr><td><b>Infrastructure</b></td><td>Switch ports, PoE budget, cable runs, controller model aur AP licences, VLANs, DHCP, RADIUS.</td></tr>
<tr><td><b>Constraints</b></td><td>Budget, aesthetics, heritage walls, regulatory domain, install windows, teen saal mein growth.</td></tr>
</table>
<p>Exam ise "collect design requirements and evaluate constraints" kehta hai. Requirements ko <b>measurable targets</b> mein likho, jaise: <i>floor 2 par har jagah 5 GHz par minimum -67 dBm, 25 dB SNR, room L1 mein 90 clients ke liye 5 Mbps per client, voice roaming bina call drop ke.</i> Jo target aap naap nahi sakte use baad mein validate nahi kar sakte.</p>

<div class="eg"><p><b>Worked example.</b> Mumbai HQ floor 2: 120 staff, har ek ke paas ek laptop aur ek phone (240 devices), aur 20 voice handsets. Likhe gaye targets: saare work areas mein 5 GHz RSSI -67 dBm ya behtar, SNR 25 dB, 2.4 GHz sirf 15 purane sensors ke liye, 5 Mbps per active client, ek saath 40 percent devices active, voice ke liye 802.11k, r aur v. Active clients = 0.40 x 240 = 96. Throughput demand = 96 x 5 = 480 Mbps. Isse AP count chapter 3 mein banayenge.</p></div>

<h3>Yeh module blueprint mein kahan baithta hai</h3>
<p>ENWLSD 300-425 design exam chaar areas cover karta hai: wireless site survey, wired aur wireless infrastructure (radio management, high density aur mesh sahit), mobility, aur WLAN high availability. Yeh module pehle do ko depth mein sikhata hai. Mobility groups, roaming optimisation aur controller aur AP high availability <code>wl-mobility</code> mein hain, aur jahan woh design se milte hain wahan hum preview dete hain. Hamare labs learning model par skills practise karate hain; course official certification course hone ka claim nahi karta.</p>

<div class="note"><p><b>Labs ka mapping.</b> Chapter 4 aur lab <code>wl-design-clean-5g-plan</code>; chapter 7 aur <code>wl-design-high-density</code>; chapter 9 aur <code>wl-design-rrm-model</code>; chapter 11 dono troubleshooting labs <code>wl-design-coverage-hole</code> aur <code>wl-design-width-trap</code> walk karta hai. Calculators (FSPL, EIRP, link budget) chapter 5 aur scenarios mein hain, labs mein nahi. Real survey tools, CleanAir hardware, real RRM algorithms, mesh aur antenna patterns <b>concept only</b> hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Vendor tool ya AP count se shuru karna. Requirements ke bina AP count number ke kapde mein guess hai.</p></div>

<div class="scn"><h4>Hospital wing jo "covered" thi</h4><p>Contractor ne ek ward ko perfect -60 dBm heat map ke saath deliver kiya. Phir bhi nurses slow tablets ki shikayat karti rahin. Kisi ne har ward ke 18 barcode scanners, voice badges ya lead-lined X-ray rooms ke baare mein nahi poocha tha. Requirements workshop ke baad team ne corridor mein capacity APs add kiye, do APs ko X-ray rooms se bahar kiya, aur target RSSI aur per-device throughput ko acceptance test mein likha.</p><p><b>Seekh:</b> heat map sirf coverage ka jawab deta hai. Design requirements decide karti hain.</p></div>

<div class="iv"><p class="q">"Wireless design aap kaise shuru karte ho, batao."</p><p>Strong answer: pehle requirements aur constraints (users, devices, apps, density, roaming, materials, budget), phir predictive model, phir kuch real APs ke saath pre-deployment validation, phir install, phir likhe targets ke against post-deployment survey. Yeh bhi bolo ki coverage aur capacity alag sawal hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design do sawal answer karta hai: coverage (signal) aur capacity (airtime).</li>
<li>Lifecycle: requirements, predictive, pre-deploy validation, install, post-deploy survey, operate aur tune.</li>
<li>Requirements ko measurable targets jaise RSSI, SNR aur Mbps per client mein likho.</li>
<li>ENWLSD areas: site survey, infrastructure aur radio management, mobility, high availability.</li>
<li>wl-rf prerequisite hai; mobility aur HA wl-mobility mein hain.</li>
</ul></div>
`}};export{e as default};