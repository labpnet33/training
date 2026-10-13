var e=(e,t,n,r,i,a)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="6" fill="`+i+`" stroke="#64748b"/>`+(a?`<text x="`+(e+n/2)+`" y="`+(t+r/2+4)+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`:``),t=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(i||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,n=(e,t,n,r,i,a)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="`+i+`" stroke-width="2"`+(a?` stroke-dasharray="6 4"`:``)+`/>`,r=(e,t)=>`<circle cx="`+e+`" cy="`+t+`" r="8" fill="#0ea5e9" stroke="#0369a1"/>`,i=(e,t)=>`<circle cx="`+e+`" cy="`+t+`" r="6" fill="#22c55e" stroke="#15803d" stroke-width="2"/>`,a=(e,t)=>`<rect x="`+(e-7)+`" y="`+(t-7)+`" width="14" height="14" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>`,o=o=>`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="`+o.aria+`">`+e(20,50,420,180,`#f1f5f9`,``)+t(230,44,o.floor,`svg-muted`)+n(150,145,50,75,`#f97316`,!0)+n(150,145,230,75,`#f97316`,!0)+n(150,145,230,205,`#f97316`,!0)+n(340,150,410,75,`#7c3aed`,!0)+n(340,150,410,205,`#7c3aed`,!0)+n(340,150,230,140,`#7c3aed`,!0)+r(50,75)+r(230,75)+r(410,75)+r(50,205)+r(230,205)+r(410,205)+r(230,140)+i(150,145)+t(150,168,o.shop)+a(340,150)+t(340,172,o.tag)+`<ellipse cx="540" cy="70" rx="80" ry="30" fill="#ddd6fe" stroke="#64748b"/>`+t(540,74,o.cloud)+e(485,130,110,34,`#bbf7d0`,o.wlc)+n(540,100,540,130,`#64748b`)+n(440,147,485,147,`#64748b`)+t(540,200,o.api,`svg-muted`)+r(24,256)+t(38,260,o.k1,`svg-ink`,`start`)+i(100,256)+t(112,260,o.k2,`svg-ink`,`start`)+a(190,256)+t(204,260,o.k3,`svg-ink`,`start`)+n(20,278,50,278,`#f97316`,!0)+t(58,282,o.k4,`svg-ink`,`start`)+n(250,278,280,278,`#7c3aed`,!0)+t(288,282,o.k5,`svg-ink`,`start`)+n(400,278,430,278,`#64748b`)+t(438,282,o.k6,`svg-ink`,`start`)+`</svg><p class="cap">`+o.cap+`</p></div>`,s=o({aria:`Location-ready store with perimeter APs and a BLE tag`,floor:`Store floor: APs on the perimeter and one inside`,shop:`Shopper`,tag:`BLE tag`,cloud:`Cisco Spaces`,wlc:`Controller`,api:`Location and IoT data`,k1:`AP`,k2:`Client`,k3:`BLE tag`,k4:`Wi-Fi location, 3+ APs`,k5:`BLE path`,k6:`Link to cloud`,cap:`Marigold Stores: perimeter APs give the shopper geometry, and several APs hear the BLE tag.`}),c=o({aria:`Perimeter APs aur BLE tag wala location-ready store`,floor:`Store floor: perimeter par APs aur ek andar`,shop:`Shopper`,tag:`BLE tag`,cloud:`Cisco Spaces`,wlc:`Controller`,api:`Location aur IoT data`,k1:`AP`,k2:`Client`,k3:`BLE tag`,k4:`Wi-Fi location, 3+ APs`,k5:`BLE path`,k6:`Cloud tak link`,cap:`Marigold Stores: perimeter APs shopper ko geometry dete hain, aur kai APs BLE tag ko sunte hain.`}),l={id:`location-iot-ot`,h:{en:`Location, IoT and OT design with Cisco Spaces`,hi:`Cisco Spaces ke saath Location, IoT aur OT design`},body:{en:`
<h3>Case 5: Marigold Stores (fictional)</h3>
<p>Marigold is a three-floor department store. Marketing wants footfall and dwell-time analytics. Operations wants to find wheeled stock cages and staff duress badges. Facilities wants electronic shelf labels, thermostats and cameras on Wi-Fi without risking the payment network.</p>

<h3>Requirements</h3>
<ul>
<li>Show where shoppers are on a floor map with an accuracy good enough to tell departments apart (a few metres).</li>
<li>Track about 200 stock cages with battery tags for a year.</li>
<li>Guide opted-in shoppers to departments through the store app.</li>
<li>Onboard around 3,000 headless IoT devices with no keyboard and no 802.1X client.</li>
</ul>

<h3>Constraints</h3>
<p>Shopper privacy rules require consent. Many phones use randomised MAC addresses. The IoT devices include 2.4 GHz-only sensors. Ceiling heights vary from 3 to 6 metres, and the payment network must stay separate.</p>

<h3>Location technologies</h3>
<table class="cmp"><tr><th>Technology</th><th>How it works</th><th>Typical accuracy</th><th>Design need</th></tr>
<tr><td><b>Wi-Fi RSSI location</b></td><td>Several APs measure the client signal and the system estimates a position</td><td>About 5 to 10 m</td><td>3 or more APs hearing the client at about -75 dBm or better, APs on the perimeter</td></tr>
<tr><td><b>BLE beacons and tags</b></td><td>Low-power tags broadcast; APs with BLE radios act as gateways or readers</td><td>About 3 to 5 m (tags), proximity for beacons</td><td>BLE-capable APs, tag battery planning</td></tr>
<tr><td><b>Angle-of-arrival (Hyperlocation style)</b></td><td>An antenna array estimates direction</td><td>About 1 to 3 m</td><td>Supported AP models, tight spacing</td></tr>
</table>
<p>The accuracies above are typical ranges; real results depend on density, geometry and materials, which is why a location-ready design is validated by survey.</p>

<h3>Location-ready design rules</h3>
<ul>
<li>Put APs at the <b>perimeter</b> of the area as well as inside. A client in the middle of a ring of APs can be placed far better than one at the edge of a cluster.</li>
<li>Make sure at least three (preferably four) APs hear any point at about -75 dBm or better, with typical AP spacing around 15 m (50 ft) or less.</li>
<li>Avoid long thin AP lines (a corridor of APs gives poor geometry in one axis).</li>
<li>Tune transmit power evenly, because a very strong AP skews the estimate.</li>
</ul>
`+s+`
<h3>Cisco Spaces and the data path</h3>
<p><b>Cisco Spaces</b> is a cloud platform that takes location, presence and IoT data from the wireless network. The controller (or a Spaces connector) sends telemetry to the cloud, where location analytics, wayfinding, captive-portal engagement and IoT services are available. Design points: the controller needs outbound connectivity to the cloud service, a floor map with scale must be imported, and shopper data should only be linked to a person when consent is given. Analytics on connected, opted-in clients is more reliable than counting probing phones, because randomised MACs inflate counts.</p>

<h3>IoT onboarding and segmentation</h3>
<p>Headless devices cannot run 802.1X. Typical options are: a dedicated IoT SSID with a pre-shared key per group or per device (Identity PSK, with a RADIUS server such as ISE), MAC authentication bypass with device profiling, or a Layer 2-only isolated IoT VLAN. Each IoT class maps to its own VLAN or group policy, with an ACL that allows only the controller servers it needs. Keep 2.4 GHz available where sensors need it, and watch for BLE and Zigbee style radios that share the band. Wi-Fi 6 target wake time extends battery life for suitable devices.</p>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>A. One shared PSK for all IoT</b></td><td>Easy</td><td>One leaked key exposes everything</td></tr>
<tr><td><b>B. Identity PSK per group, profiled by ISE</b></td><td>Scoped, revocable, no supplicant</td><td>Needs ISE and key management</td></tr>
<tr><td><b>C. Separate IoT SSID with isolated VLAN and ACLs</b></td><td>Containment</td><td>Does not identify devices on its own</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A 3,000 square-metre floor of 50 by 60 m with a target spacing of about 15 m gives a grid of about 4 by 5, so roughly 20 APs, with the outer ring on the walls. The same APs act as BLE gateways for the tags, so no extra readers are bought. This is a typical sizing method and the survey confirms it.</p></div>

<h3>Chosen design</h3>
<p>Marigold picks Wi-Fi location plus BLE. Perimeter and interior APs meet the 3-AP rule. Stock cages carry BLE tags read by the APs. The store app uses opted-in location for wayfinding. IoT devices go on an Identity PSK SSID mapped to an IoT VLAN with ACLs, kept apart from the payment VLAN.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting every AP in the centre of the ceiling, trusting location without a validation walk, counting probe requests as visitors, using one PSK for all IoT, and forgetting PoE budget when BLE radios are active.</p></div>
<div class="exam"><p><b>Exam trap.</b> Location accuracy depends on AP geometry and density, not on the controller model. Questions often hide the answer in &quot;APs only on the corridor&quot; or &quot;fewer than three APs hear the client&quot;.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>The visitor count that tripled</h4><p>The first analytics report showed three times more visitors than the door counters. The cause was counting phones that merely probed from the street and from the mall corridor, many with randomised MAC addresses. The team filtered by signal threshold, used dwell-time rules, and based reports on connected, opted-in clients. The count then matched the door counters within a small margin.</p><p><b>Lesson:</b> location data needs filtering and consent, not only coverage.</p></div>

<div class="iv"><p class="q">"What makes a WLAN location-ready?"</p><p>Strong answer: three or more APs hearing each point at about -75 dBm, APs on the perimeter and good geometry, even power, a calibrated floor map, validation by survey, and a data path to Cisco Spaces with consent. Mention BLE for tags and angle-of-arrival for better accuracy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi location is typically a few metres; BLE and angle-of-arrival can improve it.</li>
<li>Perimeter APs and three or more hearing APs are the core rule.</li>
<li>Cisco Spaces consumes controller telemetry; privacy and consent are part of the design.</li>
<li>Headless IoT uses Identity PSK, MAB or isolated VLANs, never one shared key.</li>
<li>Keep IoT and payment networks separate.</li>
</ul></div>
`,hi:`
<h3>Case 5: Marigold Stores (fictional)</h3>
<p>Marigold teen floors ka department store hai. Marketing ko footfall aur dwell-time analytics chahiye. Operations ko wheeled stock cages aur staff duress badges dhundhne hain. Facilities ko electronic shelf labels, thermostats aur cameras Wi-Fi par chahiye, payment network ko risk mein daale bina.</p>

<h3>Requirements</h3>
<ul>
<li>Floor map par shoppers ki location itni accuracy se dikhao ki departments alag pehchane ja sakein (kuch metres).</li>
<li>Battery tags ke saath lagbhag 200 stock cages ko ek saal tak track karo.</li>
<li>Store app ke through opted-in shoppers ko departments tak guide karo.</li>
<li>Lagbhag 3,000 headless IoT devices onboard karo jinke paas keyboard aur 802.1X client nahi hai.</li>
</ul>

<h3>Constraints</h3>
<p>Shopper privacy rules consent maangte hain. Bahut se phones randomised MAC addresses use karte hain. IoT devices mein 2.4 GHz-only sensors hain. Ceiling height 3 se 6 metre tak badalti hai, aur payment network alag rehna chahiye.</p>

<h3>Location technologies</h3>
<table class="cmp"><tr><th>Technology</th><th>Kaise kaam karti hai</th><th>Typical accuracy</th><th>Design need</th></tr>
<tr><td><b>Wi-Fi RSSI location</b></td><td>Kai APs client signal naapte hain aur system position estimate karta hai</td><td>Lagbhag 5 se 10 m</td><td>3 ya zyada APs jo client ko lagbhag -75 dBm ya behtar par sunein, perimeter par APs</td></tr>
<tr><td><b>BLE beacons aur tags</b></td><td>Low-power tags broadcast karte hain; BLE radios wale APs gateway ya reader ban jate hain</td><td>Lagbhag 3 se 5 m (tags), beacons ke liye proximity</td><td>BLE-capable APs, tag battery planning</td></tr>
<tr><td><b>Angle-of-arrival (Hyperlocation style)</b></td><td>Antenna array direction estimate karta hai</td><td>Lagbhag 1 se 3 m</td><td>Supported AP models, tight spacing</td></tr>
</table>
<p>Upar ki accuracies typical ranges hain; asli results density, geometry aur materials par depend karte hain, isiliye location-ready design survey se validate hota hai.</p>

<h3>Location-ready design rules</h3>
<ul>
<li>Area ke <b>perimeter</b> par bhi APs lagao, sirf andar nahi. APs ke ring ke beech ka client cluster ke edge ke client se kahin better place hota hai.</li>
<li>Pakka karo ki har point ko kam se kam teen (behtar chaar) APs lagbhag -75 dBm ya behtar par sunein, typical AP spacing lagbhag 15 m (50 ft) ya kam.</li>
<li>Lambi patli AP lines avoid karo (APs ka corridor ek axis mein kharab geometry deta hai).</li>
<li>Transmit power barabar tune karo, kyunki bahut strong AP estimate ko skew karta hai.</li>
</ul>
`+c+`
<h3>Cisco Spaces aur data path</h3>
<p><b>Cisco Spaces</b> cloud platform hai jo wireless network se location, presence aur IoT data leta hai. Controller (ya Spaces connector) telemetry cloud ko bhejta hai, jahan location analytics, wayfinding, captive-portal engagement aur IoT services milti hain. Design points: controller ko cloud service tak outbound connectivity chahiye, scale ke saath floor map import karna padta hai, aur shopper data ko sirf consent milne par kisi person se link karna chahiye. Connected, opted-in clients par analytics probing phones ginne se zyada reliable hai, kyunki randomised MACs counts badha dete hain.</p>

<h3>IoT onboarding aur segmentation</h3>
<p>Headless devices 802.1X nahi chala sakte. Typical options: group ya device ke hisaab se pre-shared key wala dedicated IoT SSID (Identity PSK, ISE jaise RADIUS server ke saath), device profiling ke saath MAC authentication bypass, ya Layer 2-only isolated IoT VLAN. Har IoT class apne VLAN ya group policy se map hoti hai, ACL ke saath jo sirf zaroori servers allow karti hai. Jahan sensors ko 2.4 GHz chahiye wahan woh available rakho, aur BLE aur Zigbee jaise radios par nazar rakho jo band share karte hain. Wi-Fi 6 target wake time suitable devices ki battery life badhata hai.</p>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>A. Saare IoT ke liye ek shared PSK</b></td><td>Aasan</td><td>Ek key leak hui to sab expose</td></tr>
<tr><td><b>B. ISE se profiled, per group Identity PSK</b></td><td>Scoped, revocable, supplicant nahi chahiye</td><td>ISE aur key management chahiye</td></tr>
<tr><td><b>C. Isolated VLAN aur ACLs wala alag IoT SSID</b></td><td>Containment</td><td>Khud devices ko identify nahi karta</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> 50 gunaa 60 m ki 3,000 square-metre floor par lagbhag 15 m target spacing se lagbhag 4 gunaa 5 ka grid banta hai, yaani lagbhag 20 APs, outer ring walls par. Wahi APs tags ke liye BLE gateways ka kaam karte hain, isliye extra readers nahi kharidne padte. Yeh typical sizing method hai aur survey ise confirm karta hai.</p></div>

<h3>Chosen design</h3>
<p>Marigold Wi-Fi location plus BLE chunta hai. Perimeter aur interior APs 3-AP rule meet karte hain. Stock cages BLE tags rakhte hain jinhe APs padhte hain. Store app wayfinding ke liye opted-in location use karta hai. IoT devices Identity PSK SSID par jate hain jo IoT VLAN aur ACLs se map hai, payment VLAN se alag.</p>

<div class="warn"><p><b>Common mistakes.</b> Har AP ko ceiling ke beech mein lagana, validation walk ke bina location par bharosa karna, probe requests ko visitors ginna, saare IoT ke liye ek PSK use karna, aur BLE radios active hone par PoE budget bhool jana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Location accuracy AP geometry aur density par depend karti hai, controller model par nahi. Sawal aksar &quot;APs sirf corridor mein&quot; ya &quot;teen se kam APs client ko sunte hain&quot; mein jawab chhupate hain.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>Teen guna ho gaya visitor count</h4><p>Pehli analytics report ne door counters se teen guna zyada visitors dikhaye. Wajah thi un phones ko ginna jo sirf street aur mall corridor se probe kar rahe the, jinmein se kai randomised MAC addresses ke the. Team ne signal threshold se filter kiya, dwell-time rules use kiye, aur reports connected, opted-in clients par based ki. Phir count door counters se chhote margin ke andar match karne laga.</p><p><b>Seekh:</b> location data ko sirf coverage nahi, filtering aur consent bhi chahiye.</p></div>

<div class="iv"><p class="q">"WLAN ko location-ready kya banata hai?"</p><p>Strong answer: har point ko lagbhag -75 dBm par teen ya zyada APs sunein, perimeter par APs aur achhi geometry, barabar power, calibrated floor map, survey se validation, aur consent ke saath Cisco Spaces tak data path. Tags ke liye BLE aur behtar accuracy ke liye angle-of-arrival ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi location typically kuch metres hoti hai; BLE aur angle-of-arrival ise behtar kar sakte hain.</li>
<li>Perimeter APs aur teen ya zyada sunne wale APs core rule hain.</li>
<li>Cisco Spaces controller telemetry consume karta hai; privacy aur consent design ka hissa hain.</li>
<li>Headless IoT Identity PSK, MAB ya isolated VLANs use karta hai, kabhi ek shared key nahi.</li>
<li>IoT aur payment networks alag rakho.</li>
</ul></div>
`}};export{l as default};