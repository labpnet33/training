var e=e=>`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="`+e.aria+`"><rect x="10" y="10" width="620" height="210" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><rect x="20" y="20" width="110" height="70" fill="#bae6fd" stroke="#64748b"/><text x="75" y="60" text-anchor="middle" class="svg-ink" font-size="12">`+e.r1+`</text><rect x="140" y="20" width="110" height="70" fill="#bae6fd" stroke="#64748b"/><text x="195" y="60" text-anchor="middle" class="svg-ink" font-size="12">`+e.r2+`</text><rect x="260" y="20" width="110" height="70" fill="#bae6fd" stroke="#64748b"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="12">`+e.r3+`</text><rect x="380" y="20" width="110" height="70" fill="#fed7aa" stroke="#64748b" stroke-width="4"/><text x="435" y="60" text-anchor="middle" class="svg-ink" font-size="12">`+e.img+`</text><rect x="500" y="20" width="120" height="70" fill="#ddd6fe" stroke="#64748b"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="12">`+e.guest+`</text><rect x="20" y="100" width="600" height="30" fill="#e2e8f0"/><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">`+e.cor+`</text><rect x="20" y="140" width="170" height="70" fill="#bbf7d0" stroke="#64748b"/><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="12">`+e.nurse+`</text><rect x="200" y="140" width="200" height="70" fill="#fde68a" stroke="#64748b"/><text x="300" y="180" text-anchor="middle" class="svg-ink" font-size="12">`+e.ward+`</text><rect x="410" y="140" width="210" height="70" fill="#bae6fd" stroke="#64748b"/><text x="515" y="180" text-anchor="middle" class="svg-ink" font-size="12">`+e.r4+`</text><circle cx="75" cy="115" r="30" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="75" cy="115" r="7" fill="#0ea5e9"/><circle cx="250" cy="115" r="30" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="250" cy="115" r="7" fill="#0ea5e9"/><circle cx="400" cy="115" r="30" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="400" cy="115" r="7" fill="#0ea5e9"/><circle cx="560" cy="115" r="30" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/><circle cx="560" cy="115" r="7" fill="#0ea5e9"/><circle cx="14" cy="248" r="7" fill="#0ea5e9"/><text x="28" y="252" class="svg-ink" font-size="12">`+e.l1+`</text><rect x="170" y="241" width="14" height="14" fill="#fed7aa" stroke="#64748b" stroke-width="3"/><text x="190" y="252" class="svg-ink" font-size="12">`+e.l2+`</text><rect x="380" y="241" width="14" height="14" fill="#bae6fd"/><text x="400" y="252" class="svg-ink" font-size="12">`+e.l3+`</text><rect x="14" y="264" width="14" height="14" fill="#bbf7d0"/><text x="34" y="276" class="svg-ink" font-size="12">`+e.l4+`</text><rect x="330" y="264" width="14" height="14" fill="#ddd6fe"/><text x="350" y="276" class="svg-ink" font-size="12">`+e.l5+`</text></svg><p class="cap">`+e.cap+`</p></div>`,t=e({aria:`Hospital ward requirement zones`,r1:`Patient 1`,r2:`Patient 2`,r3:`Patient 3`,img:`Imaging (lead)`,guest:`Guest lounge`,cor:`Corridor: badges and carts`,nurse:`Nurse station`,ward:`Ward: infusion pumps`,r4:`Patient 4`,l1:`AP and cell (first idea)`,l2:`Heavy wall`,l3:`Patient rooms`,l4:`Staff work area`,l5:`Guest`,cap:`First sketch of Ward 4: four APs in the corridor. Notice the lead-lined imaging room and the guest lounge: the requirements already question this layout.`}),n=e({aria:`Hospital ward requirement zones`,r1:`Patient 1`,r2:`Patient 2`,r3:`Patient 3`,img:`Imaging (lead)`,guest:`Guest lounge`,cor:`Corridor: badge aur carts`,nurse:`Nurse station`,ward:`Ward: infusion pumps`,r4:`Patient 4`,l1:`AP aur cell (pehla idea)`,l2:`Heavy wall`,l3:`Patient rooms`,l4:`Staff work area`,l5:`Guest`,cap:`Ward 4 ka pehla sketch: corridor mein chaar APs. Lead-lined imaging room aur guest lounge dekho: requirements already is layout par sawaal uthati hain.`}),r={id:`requirements`,h:{en:`Requirements and customer discovery: design starts with questions`,hi:`Requirements aur customer discovery: design sawaalon se shuru hota hai`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design a Wi-Fi network the way a Cisco design engineer does for the 300-425 ENWLSD exam: start from the customer's needs, understand the radio environment, choose a survey method, place and configure access points (APs), plan channels and power, and prove the result with a validation survey. Every chapter opens with a realistic site, such as a hospital, hotel, warehouse, stadium or factory, and walks through requirements, constraints, options, trade-offs, the chosen design and, where useful, what went wrong afterwards.</p>
<p><b>Prerequisites.</b> You should know what an access point, a wireless LAN controller (WLC) and an SSID are, and that Wi-Fi uses radio waves in the 2.4 and 5 GHz bands. You do not need survey experience. We explain every design term when it first appears.</p>

<h3>An analogy: the architect and the family</h3>
<p>Before an architect draws a house, she asks the family how many people live there, whether someone works from home, whether grandparents need ground-floor rooms, and what the budget is. A beautiful house that ignores those answers is a failure. A Wi-Fi design is the same. The most common cause of a bad wireless network is not a wrong command. It is a design that answered the wrong questions.</p>

<h3>Case: St. Aurelia Regional Hospital, Ward 4</h3>
<p>The IT manager of St. Aurelia (a fictional hospital) tells you: "Ward 4 Wi-Fi is poor. Please add more access points." That sentence is a <b>symptom and a proposed solution</b>, not a requirement. A design engineer answers with discovery questions. After a workshop with nursing, biomedical engineering and security, the real requirements appear:</p>
<ul>
<li><b>Client types:</b> 40 nurse smartphones running push-to-talk voice, 12 medication carts with laptops, 30 infusion pumps (older 2.4 GHz-only devices), 60 patient and guest phones, and a few IoT bed sensors.</li>
<li><b>Applications:</b> real-time voice (very sensitive to delay and roaming gaps), electronic health records (small transactions, must never drop), guest streaming and web (best effort).</li>
<li><b>Density:</b> about 90 staff and patient devices per 1,000 square metres, with a peak at shift change when carts and phones concentrate at the nurse station.</li>
<li><b>Roaming:</b> nurses walk the whole ward while on a call, so handoffs must be fast and secure.</li>
<li><b>Security and compliance:</b> clinical devices on a separate SSID and VLAN, guests isolated, WPA2 or WPA3 as supported by each device.</li>
<li><b>Environment:</b> an imaging room with lead-lined walls, patient rooms with solid doors, and corridors that fill with beds and equipment.</li>
</ul>

`+t+`
<h3>The discovery checklist</h3>
<p>Good design engineers ask the same families of questions on every project. Memorise this list; the exam tests it as <b>design requirements</b>.</p>
<table class="cmp"><tr><th>Area</th><th>Ask</th><th>Why it changes the design</th></tr>
<tr><td><b>Clients</b></td><td>Which devices, which radios (2.4 only? 5 GHz? 6 GHz?), which Wi-Fi generation, how many spatial streams?</td><td>Legacy 2.4 GHz-only clients force you to keep that band alive. Single-stream phones set the real data rates.</td></tr>
<tr><td><b>Applications</b></td><td>Voice, video, location, real-time control, large downloads, cloud apps?</td><td>Each sets a minimum signal level, SNR, latency and roaming target.</td></tr>
<tr><td><b>Density</b></td><td>Devices per area, peak times, device per person?</td><td>Capacity, not coverage, decides AP count in dense areas.</td></tr>
<tr><td><b>Mobility</b></td><td>Do clients move while connected? How fast?</td><td>Cell overlap, roaming protocol choices and AP spacing.</td></tr>
<tr><td><b>Coverage areas</b></td><td>Which rooms, floors, outdoor zones? Which are excluded?</td><td>Saves cost and avoids leaking signal to places you do not want it.</td></tr>
<tr><td><b>Environment</b></td><td>Wall and ceiling materials, ceiling height, racks, machinery, future renovation?</td><td>Attenuation and mounting options (next chapters).</td></tr>
<tr><td><b>Security and policy</b></td><td>Guest, BYOD, IoT, regulatory rules, certified devices?</td><td>SSID count, VLANs, and restrictions on bands or power.</td></tr>
<tr><td><b>Wired and power</b></td><td>Cable runs, switch ports, PoE budget, closets?</td><td>An AP that cannot be powered or cabled cannot be placed.</td></tr>
<tr><td><b>Budget and schedule</b></td><td>Capital limit, install windows, downtime allowed?</td><td>Trade-offs between ideal and practical.</td></tr>
</table>

<div class="note"><p><b>Requirement versus constraint.</b> A <b>requirement</b> is what the network must do (voice roaming under 150 ms across the ward). A <b>constraint</b> is what limits how you do it (no ceiling access in patient rooms, a fixed budget, infection-control rules that forbid opening ceilings). Write them in two separate lists.</p></div>

<h3>Turning answers into design targets</h3>
<p>The workshop answers become measurable targets. For St. Aurelia the engineer writes:</p>
<div class="eg"><p><b>Worked example.</b> Voice phones: minimum primary signal about -67 dBm, with a second AP audible at about -72 dBm or better, and SNR of at least 25 dB (typical Cisco guidance for voice; always check the phone vendor's own guide). Data and EHR carts: about -70 dBm. Guest: best effort at about -70 dBm. Pumps: 2.4 GHz coverage at a lower power, as the devices are weak transmitters. Capacity: at most 25 to 30 active clients per radio during the shift-change peak, so 90 devices in the nurse-station area need at least 3 to 4 radios to share that load.</p></div>
<p>These are typical planning figures. The exam expects you to know that the target depends on the application, and that your numbers come from the vendor guides and customer needs, not from a single universal value.</p>

<h3>Options and the chosen direction</h3>
<table class="cmp"><tr><th>Option</th><th>Benefit</th><th>Trade-off</th></tr>
<tr><td>Add 4 more corridor APs (customer's idea)</td><td>Cheap, quick</td><td>More co-channel interference in a corridor; patient rooms behind solid doors still weak</td></tr>
<tr><td>Predictive survey, then APs in or near every 2 to 3 patient rooms</td><td>Strong signal where devices actually are, lower power per AP</td><td>More cabling and ceiling access work</td></tr>
<tr><td>Full on-site survey first</td><td>Real measurements, finds hidden issues</td><td>Needs nursing cooperation and infection-control permits</td></tr>
</table>
<p>The engineer recommends a predictive model first, validated by a short on-site survey in the imaging room and two sample patient rooms, then a post-deployment validation. Chapter 4 explains why.</p>

<div class="warn"><p><b>Common mistakes.</b> Accepting "add more APs" as a requirement; forgetting 2.4 GHz-only medical devices; not asking about future changes; assuming one signal target for every application; skipping the wired/PoE check.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions describe a client type or application and ask which design input changes. Voice and location need stronger, more even coverage with overlap; high density needs smaller cells and capacity planning; legacy clients limit your data rates and band choices.</p></div>

<div class="scn"><h4>The ward that wanted more APs</h4><p>A hospital added six APs to a corridor after nurses complained about dropped calls. Calls got worse. A discovery review found the complaints came from patient rooms with solid doors and from a lead-lined imaging room where nobody had planned coverage. The extra corridor APs raised the noise floor for everyone and did nothing for the rooms. The redesign placed APs near room clusters at lower power, added a dedicated AP for imaging, and calls stabilised.</p><p><b>Lesson:</b> interview first. A symptom is not a requirement.</p></div>
<div class="iv"><p class="q">"A customer says Wi-Fi is slow and asks for more APs. What do you do?"</p><p>Strong answer: I do not add APs yet. I run discovery: which clients and apps, where the complaints are, how many devices at peak, what the environment is, and what the current survey and RF data show. I convert that into measurable requirements (signal, SNR, capacity, roaming), then choose a predictive or on-site survey. More APs can make co-channel interference worse.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design starts with customer discovery: clients, applications, density, mobility, coverage areas, environment, security, wired/PoE, budget.</li>
<li>Separate requirements (what) from constraints (limits).</li>
<li>Each application sets its own signal, SNR and roaming targets.</li>
<li>Legacy 2.4 GHz-only devices and dense areas change the design more than raw floor area.</li>
<li>A symptom such as "slow Wi-Fi" is not a requirement.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Cisco 300-425 ENWLSD exam ke design engineer ki tarah Wi-Fi network design karna seekhoge: customer ki zaroorat se shuru karo, radio environment samjho, survey method chuno, access points (APs) place aur configure karo, channels aur power plan karo, aur validation survey se result prove karo. Har chapter ek realistic site se shuru hota hai, jaise hospital, hotel, warehouse, stadium ya factory, aur requirements, constraints, options, trade-offs, chosen design aur zarurat ho to baad mein kya galat hua woh sab cover karta hai.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki access point, wireless LAN controller (WLC) aur SSID kya hote hain, aur Wi-Fi 2.4 aur 5 GHz bands mein radio waves use karta hai. Survey ka experience zaroori nahi. Har design term pehli baar aane par hum samjhate hain.</p>

<h3>Analogy: architect aur family</h3>
<p>Ghar draw karne se pehle architect family se poochti hai ki kitne log rehte hain, koi ghar se kaam karta hai kya, grandparents ko ground floor chahiye kya, aur budget kya hai. Jo khoobsurat ghar in jawabon ko ignore kare woh fail hai. Wi-Fi design bhi aisa hi hai. Kharab wireless network ki sabse common wajah galat command nahi hoti. Woh aisa design hota hai jisne galat sawaalon ke jawab diye.</p>

<h3>Case: St. Aurelia Regional Hospital, Ward 4</h3>
<p>St. Aurelia (ek fictional hospital) ka IT manager kehta hai: "Ward 4 ka Wi-Fi poor hai. Please aur access points add karo." Yeh sentence ek <b>symptom aur ek proposed solution</b> hai, requirement nahi. Design engineer discovery sawaalon se jawab deta hai. Nursing, biomedical engineering aur security ke saath workshop ke baad asli requirements saamne aati hain:</p>
<ul>
<li><b>Client types:</b> push-to-talk voice chalane wale 40 nurse smartphones, laptops wali 12 medication carts, 30 infusion pumps (purane 2.4 GHz-only devices), 60 patient aur guest phones, aur kuch IoT bed sensors.</li>
<li><b>Applications:</b> real-time voice (delay aur roaming gaps ke prati bahut sensitive), electronic health records (chhote transactions, kabhi drop nahi hone chahiye), guest streaming aur web (best effort).</li>
<li><b>Density:</b> har 1,000 square metres mein lagbhag 90 staff aur patient devices, shift change par peak jab carts aur phones nurse station ke paas jama ho jate hain.</li>
<li><b>Roaming:</b> nurses call ke dauraan poore ward mein chalti hain, isliye handoff fast aur secure hona chahiye.</li>
<li><b>Security aur compliance:</b> clinical devices alag SSID aur VLAN par, guests isolated, har device ke support ke hisaab se WPA2 ya WPA3.</li>
<li><b>Environment:</b> lead-lined walls wala imaging room, solid doors wale patient rooms, aur corridors jo beds aur equipment se bhar jate hain.</li>
</ul>

`+n+`
<h3>Discovery checklist</h3>
<p>Achhe design engineers har project par same families ke sawaal poochte hain. Yeh list yaad kar lo; exam ise <b>design requirements</b> ke roop mein test karta hai.</p>
<table class="cmp"><tr><th>Area</th><th>Poocho</th><th>Design kyun badalta hai</th></tr>
<tr><td><b>Clients</b></td><td>Kaunse devices, kaunse radios (sirf 2.4? 5 GHz? 6 GHz?), kaunsi Wi-Fi generation, kitni spatial streams?</td><td>Legacy 2.4 GHz-only clients ki wajah se woh band chalani padti hai. Single-stream phones asli data rates tay karte hain.</td></tr>
<tr><td><b>Applications</b></td><td>Voice, video, location, real-time control, bade downloads, cloud apps?</td><td>Har ek ka apna minimum signal level, SNR, latency aur roaming target hota hai.</td></tr>
<tr><td><b>Density</b></td><td>Per area devices, peak times, per person kitne devices?</td><td>Dense areas mein AP count coverage nahi, capacity tay karti hai.</td></tr>
<tr><td><b>Mobility</b></td><td>Kya clients connected rehkar chalte hain? Kitni speed se?</td><td>Cell overlap, roaming protocol choices aur AP spacing.</td></tr>
<tr><td><b>Coverage areas</b></td><td>Kaunse rooms, floors, outdoor zones? Kaunse exclude hain?</td><td>Cost bachta hai aur signal unwanted jagah leak nahi hota.</td></tr>
<tr><td><b>Environment</b></td><td>Wall aur ceiling materials, ceiling height, racks, machinery, future renovation?</td><td>Attenuation aur mounting options (agle chapters).</td></tr>
<tr><td><b>Security aur policy</b></td><td>Guest, BYOD, IoT, regulatory rules, certified devices?</td><td>SSID count, VLANs, aur bands ya power par restrictions.</td></tr>
<tr><td><b>Wired aur power</b></td><td>Cable runs, switch ports, PoE budget, closets?</td><td>Jis AP ko power ya cable nahi mil sakti use place nahi kar sakte.</td></tr>
<tr><td><b>Budget aur schedule</b></td><td>Capital limit, install windows, kitna downtime allowed?</td><td>Ideal aur practical ke beech trade-offs.</td></tr>
</table>

<div class="note"><p><b>Requirement versus constraint.</b> <b>Requirement</b> woh hai jo network ko karna hai (ward mein voice roaming 150 ms se kam). <b>Constraint</b> woh hai jo batata hai kaise karna hai us par limit kya hai (patient rooms mein ceiling access nahi, fixed budget, infection-control rules jo ceilings kholne se rokte hain). Dono ko alag lists mein likho.</p></div>

<h3>Jawabon ko design targets mein badalna</h3>
<p>Workshop ke jawab measurable targets ban jate hain. St. Aurelia ke liye engineer likhta hai:</p>
<div class="eg"><p><b>Worked example.</b> Voice phones: minimum primary signal lagbhag -67 dBm, doosra AP lagbhag -72 dBm ya behtar par sunai de, aur SNR kam se kam 25 dB (voice ke liye typical Cisco guidance; hamesha phone vendor ki apni guide check karo). Data aur EHR carts: lagbhag -70 dBm. Guest: best effort lagbhag -70 dBm. Pumps: 2.4 GHz coverage lower power par, kyunki yeh devices weak transmitters hain. Capacity: shift-change peak mein har radio par zyada se zyada 25 se 30 active clients, isliye nurse-station area ke 90 devices ka load baantne ke liye kam se kam 3 se 4 radios chahiye.</p></div>
<p>Yeh typical planning figures hain. Exam expect karta hai ki aap jaano ki target application par depend karta hai, aur aapke numbers vendor guides aur customer needs se aate hain, kisi ek universal value se nahi.</p>

<h3>Options aur chosen direction</h3>
<table class="cmp"><tr><th>Option</th><th>Fayda</th><th>Trade-off</th></tr>
<tr><td>4 aur corridor APs add karo (customer ka idea)</td><td>Sasta, jaldi</td><td>Corridor mein zyada co-channel interference; solid doors ke peeche patient rooms phir bhi weak</td></tr>
<tr><td>Predictive survey, phir har 2 se 3 patient rooms ke paas AP</td><td>Jahan devices asal mein hain wahan strong signal, har AP ka power kam</td><td>Zyada cabling aur ceiling access ka kaam</td></tr>
<tr><td>Pehle full on-site survey</td><td>Real measurements, hidden issues milte hain</td><td>Nursing cooperation aur infection-control permits chahiye</td></tr>
</table>
<p>Engineer pehle predictive model recommend karta hai, jise imaging room aur do sample patient rooms mein chhote on-site survey se validate kiya jata hai, phir post-deployment validation. Chapter 4 batata hai kyun.</p>

<div class="warn"><p><b>Common mistakes.</b> "Aur APs add karo" ko requirement maan lena; 2.4 GHz-only medical devices bhool jana; future changes ke bare mein na poochna; har application ke liye ek hi signal target maan lena; wired/PoE check skip karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions ek client type ya application batate hain aur poochte hain ki kaunsa design input badalta hai. Voice aur location ko overlap ke saath strong, even coverage chahiye; high density ko chhote cells aur capacity planning chahiye; legacy clients aapke data rates aur band choices ko limit karte hain.</p></div>

<div class="scn"><h4>Jis ward ko aur APs chahiye the</h4><p>Nurses ki dropped calls ki shikayat par ek hospital ne corridor mein chhe APs add kar diye. Calls aur kharab ho gayi. Discovery review mein pata chala ki shikayatein solid doors wale patient rooms aur lead-lined imaging room se aa rahi thi jahan kisi ne coverage plan hi nahi ki thi. Extra corridor APs ne sabke liye noise floor badha diya aur rooms ke liye kuch nahi kiya. Redesign mein APs room clusters ke paas lower power par lage, imaging ke liye dedicated AP aaya, aur calls stable ho gayi.</p><p><b>Lesson:</b> pehle interview karo. Symptom requirement nahi hota.</p></div>
<div class="iv"><p class="q">"Customer kehta hai Wi-Fi slow hai aur aur APs maangta hai. Aap kya karoge?"</p><p>Strong answer: Main abhi APs add nahi karta. Main discovery chalata hoon: kaunse clients aur apps, shikayatein kahan hain, peak par kitne devices, environment kaisa hai, aur current survey aur RF data kya dikhate hain. Main ise measurable requirements (signal, SNR, capacity, roaming) mein badalta hoon, phir predictive ya on-site survey chunta hoon. Zyada APs co-channel interference ko aur kharab kar sakte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design customer discovery se shuru hota hai: clients, applications, density, mobility, coverage areas, environment, security, wired/PoE, budget.</li>
<li>Requirements (kya) aur constraints (limits) ko alag rakho.</li>
<li>Har application ke apne signal, SNR aur roaming targets hote hain.</li>
<li>Legacy 2.4 GHz-only devices aur dense areas raw floor area se zyada design badalte hain.</li>
<li>"Slow Wi-Fi" jaisa symptom requirement nahi hota.</li>
</ul></div>
`}};export{r as default};