var e={id:`poe-basics`,h:{en:`PoE fundamentals: standards, detection, classes and budget`,hi:`PoE fundamentals: standards, detection, classes aur budget`},body:{en:`
<p><b>Power over Ethernet</b> sends DC power over the same twisted pairs that carry data. The switch is the <b>PSE</b> (Power Sourcing Equipment) and the phone is the <b>PD</b> (Powered Device). Because the PSE could damage a device that does not expect power, PoE starts with a polite negotiation.</p>

<h3>The standards</h3>
<table class="cmp"><tr><th>Standard</th><th>Name</th><th>Power at the PSE port</th><th>Typical devices</th></tr>
<tr><td>IEEE 802.3af</td><td>PoE (Type 1)</td><td>15.4 W</td><td>basic phones, small APs</td></tr>
<tr><td>IEEE 802.3at</td><td>PoE+ (Type 2)</td><td>30 W</td><td>video phones, APs, cameras</td></tr>
<tr><td>IEEE 802.3bt</td><td>PoE++ (Type 3 and 4)</td><td>60 W and 90 W</td><td>PTZ cameras, thin clients, wall displays</td></tr></table>
<p>The power <i>available at the device</i> is lower than at the port, because the cable loses some: for example 12.95 W at the device for 802.3af. Supported standards and per-port limits depend on the EX model; the datasheet gives the total PoE budget.</p>

<h3>Four steps of powering a device</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="PoE negotiation steps">
<rect x="10" y="50" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="13">1 Detection</text><text x="80" y="95" text-anchor="middle" class="svg-muted" font-size="11">is it a valid PD?</text>
<rect x="170" y="50" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="13">2 Classification</text><text x="240" y="95" text-anchor="middle" class="svg-muted" font-size="11">class 0 to 4</text>
<rect x="330" y="50" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="13">3 Power-up</text><text x="400" y="95" text-anchor="middle" class="svg-muted" font-size="11">budget permitting</text>
<rect x="490" y="50" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="13">4 Monitoring</text><text x="560" y="95" text-anchor="middle" class="svg-muted" font-size="11">overload, removal</text>
<line x1="150" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/><line x1="310" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A port with nothing valid attached stays at "Searching" and carries no voltage.</p></div>
<ol>
<li><b>Detection.</b> The PSE applies a small voltage and looks for a signature resistance of about 25 kilo-ohm. A normal PC does not have it, so a PC never receives power.</li>
<li><b>Classification.</b> The PD indicates how much power it needs by class.</li>
<li><b>Power-up.</b> If the budget allows, the PSE applies the full voltage.</li>
<li><b>Monitoring.</b> The PSE watches for overload, short circuit and removal, and turns the power off safely.</li>
</ol>

<h3>PoE classes</h3>
<table class="cmp"><tr><th>Class</th><th>PSE reserves (class mode)</th><th>Typical device</th></tr>
<tr><td>0</td><td>15.4 W</td><td>unclassified device (default)</td></tr>
<tr><td>1</td><td>4.0 W</td><td>very low-power sensor</td></tr>
<tr><td>2</td><td>7.0 W</td><td>basic desk phone</td></tr>
<tr><td>3</td><td>15.4 W</td><td>video phone</td></tr>
<tr><td>4</td><td>30 W</td><td>PoE+ device: AP, camera</td></tr></table>
<p>Classes 5 to 8 belong to 802.3bt and go up to 90 W. The class is the <i>maximum</i> the device may ask for; the real consumption is usually lower. In our lab a class-2 phone draws 5.4 W while its class reserves 7 W.</p>

<h3>The budget: a fuel tank</h3>
<p>Each switch has a <b>total PoE budget</b>, the sum of what its power supply may deliver, for example 124 W on the lab's EX2300-24P and only 32 W on the compact EX2300-C. The switch must always keep <b>reserved power less than or equal to the budget</b>. Whether it reserves the class maximum, a port maximum, or the real consumption is the allocation method, which we configure in the next chapter. A <b>guard band</b> keeps a few watts free for spikes and for a late arrival.</p>

<div class="eg"><p><b>Worked example.</b> A 32 W switch has three class-2 phones. With a reservation of 15.4 W per port: 15.4 + 15.4 = 30.8 W, the third phone does not fit and stays OFF. If the switch reserves the class value (7 W): 3 x 7 = 21 W, so all three power up and 11 W stay free. The phones draw only about 5.4 W each (16.2 W real total), but the reservation decides who may start.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adding up datasheet maximums and ignoring cable loss. Buying a switch by port count instead of PoE budget. Plugging high-power cameras (class 4, 30 W) into a budget sized for phones. Assuming PoE harms a PC: detection protects it, a PC stays unpowered.</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.3af = 15.4 W per port; 802.3at = 30 W. Class 0 and class 3 both reserve 15.4 W. Detection must succeed before classification, and a normal PC fails detection by design.</p></div>

<div class="scn"><h4>The camera that took the budget</h4><p>A branch added two 30 W PTZ cameras to a 124 W switch that also powered 12 phones. The next morning three phones were dark: the cameras and 15.4 W static reservation per phone exceeded the budget. After moving the cameras to a separate PoE injector and switching the phones to class-based management, everything powered with 20 W spare.</p><p><b>Lesson:</b> count watts per device type, and keep high-power devices on their own budget.</p></div>

<div class="iv"><p class="q">"How does a PoE switch know a device wants power?"</p><p>The switch first runs detection with a low voltage looking for the PD signature resistance; a normal PC does not present it and gets no power. Then it classifies the device by class, and only if the budget allows does it apply full power. It keeps monitoring for overload and removal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PSE is the switch; PD is the phone. PoE starts with detection.</li>
<li>802.3af 15.4 W, 802.3at 30 W, 802.3bt up to 90 W.</li>
<li>Classes: 1 = 4 W, 2 = 7 W, 3 and 0 = 15.4 W, 4 = 30 W.</li>
<li>The switch has a finite budget; reserved power must not exceed it.</li>
<li>Class reservation differs from real consumption.</li>
</ul></div>
`,hi:`
<p><b>Power over Ethernet</b> data ke saath usi twisted pairs par DC power bhejta hai. Switch <b>PSE</b> (Power Sourcing Equipment) hai aur phone <b>PD</b> (Powered Device). Kyunki PSE power na expect karne wale device ko nuksan pahuncha sakta hai, PoE ek tameezdaar negotiation se shuru hota hai.</p>

<h3>Standards</h3>
<table class="cmp"><tr><th>Standard</th><th>Naam</th><th>PSE port par power</th><th>Typical devices</th></tr>
<tr><td>IEEE 802.3af</td><td>PoE (Type 1)</td><td>15.4 W</td><td>basic phones, chhote APs</td></tr>
<tr><td>IEEE 802.3at</td><td>PoE+ (Type 2)</td><td>30 W</td><td>video phones, APs, cameras</td></tr>
<tr><td>IEEE 802.3bt</td><td>PoE++ (Type 3 aur 4)</td><td>60 W aur 90 W</td><td>PTZ cameras, thin clients, wall displays</td></tr></table>
<p><i>Device par</i> milne wali power port se kam hoti hai, kyunki cable kuch kho deta hai: jaise 802.3af ke liye device par 12.95 W. Supported standards aur per-port limits EX model par depend karti hain; datasheet total PoE budget deta hai.</p>

<h3>Device ko power dene ke chaar steps</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="PoE negotiation steps">
<rect x="10" y="50" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="13">1 Detection</text><text x="80" y="95" text-anchor="middle" class="svg-muted" font-size="11">valid PD hai?</text>
<rect x="170" y="50" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="13">2 Classification</text><text x="240" y="95" text-anchor="middle" class="svg-muted" font-size="11">class 0 se 4</text>
<rect x="330" y="50" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="13">3 Power-up</text><text x="400" y="95" text-anchor="middle" class="svg-muted" font-size="11">budget ho to</text>
<rect x="490" y="50" width="140" height="60" rx="10" fill="#fde68a"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="13">4 Monitoring</text><text x="560" y="95" text-anchor="middle" class="svg-muted" font-size="11">overload, removal</text>
<line x1="150" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/><line x1="310" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Jis port par koi valid device nahi hota woh "Searching" rehta hai aur voltage nahi deta.</p></div>
<ol>
<li><b>Detection.</b> PSE chhota voltage lagata hai aur kareeb 25 kilo-ohm ka signature resistance dhoondta hai. Normal PC mein yeh nahi hota, isliye PC ko kabhi power nahi milti.</li>
<li><b>Classification.</b> PD class se batata hai ki use kitni power chahiye.</li>
<li><b>Power-up.</b> Budget allow kare to PSE poora voltage lagata hai.</li>
<li><b>Monitoring.</b> PSE overload, short circuit aur removal par nazar rakhta hai aur power safely band karta hai.</li>
</ol>

<h3>PoE classes</h3>
<table class="cmp"><tr><th>Class</th><th>PSE reserve karta hai (class mode)</th><th>Typical device</th></tr>
<tr><td>0</td><td>15.4 W</td><td>unclassified device (default)</td></tr>
<tr><td>1</td><td>4.0 W</td><td>bahut kam power wala sensor</td></tr>
<tr><td>2</td><td>7.0 W</td><td>basic desk phone</td></tr>
<tr><td>3</td><td>15.4 W</td><td>video phone</td></tr>
<tr><td>4</td><td>30 W</td><td>PoE+ device: AP, camera</td></tr></table>
<p>Class 5 se 8 802.3bt ke hain aur 90 W tak jaate hain. Class woh <i>maximum</i> hai jo device maang sakta hai; asli consumption aam taur par kam hoti hai. Hamare lab mein class-2 phone 5.4 W leta hai jabki uski class 7 W reserve karti hai.</p>

<h3>Budget: ek fuel tank</h3>
<p>Har switch ka ek <b>total PoE budget</b> hota hai, jo uski power supply deliver kar sakti hai, jaise lab ke EX2300-24P par 124 W aur compact EX2300-C par sirf 32 W. Switch ko hamesha <b>reserved power budget se kam ya barabar</b> rakhni hoti hai. Class maximum, port maximum ya asli consumption reserve karna allocation method hai, jo agle chapter mein configure karte hain. <b>Guard band</b> spikes aur der se aane wale device ke liye kuch watts khaali rakhta hai.</p>

<div class="eg"><p><b>Worked example.</b> 32 W switch par teen class-2 phones. Har port par 15.4 W reservation: 15.4 + 15.4 = 30.8 W, teesra phone fit nahi hota aur OFF rehta hai. Switch class value (7 W) reserve kare to: 3 x 7 = 21 W, teeno power ho jaate hain aur 11 W bachte hain. Phones sirf 5.4 W har ek lete hain (asli total 16.2 W), par reservation tay karta hai ki kaun start ho sakta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Datasheet maximums jodna aur cable loss ignore karna. Switch port count se kharidna, PoE budget se nahi. Phones ke liye bane budget mein high-power cameras (class 4, 30 W) lagana. Yeh sochna ki PoE PC ko nuksan karta hai: detection bachata hai, PC unpowered rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.3af = 15.4 W per port; 802.3at = 30 W. Class 0 aur class 3 dono 15.4 W reserve karte hain. Classification se pehle detection succeed hona chahiye, aur normal PC design se detection fail karta hai.</p></div>

<div class="scn"><h4>Camera ne budget le liya</h4><p>Ek branch ne 124 W switch mein do 30 W PTZ cameras jode jo 12 phones bhi power karta tha. Agli subah teen phones dark the: cameras aur har phone par 15.4 W static reservation budget se zyada ho gayi. Cameras ko alag PoE injector par aur phones ko class-based management par karne ke baad sab 20 W spare ke saath power hue.</p><p><b>Lesson:</b> device type ke hisaab se watts gino, aur high-power devices ko alag budget par rakho.</p></div>

<div class="iv"><p class="q">"PoE switch ko kaise pata chalta hai ki device ko power chahiye?"</p><p>Switch pehle low voltage se detection chalata hai aur PD signature resistance dhoondta hai; normal PC yeh nahi dikhata aur power nahi paata. Phir device ko class se classify karta hai, aur budget allow kare tabhi full power lagata hai. Overload aur removal ke liye monitoring chalti rehti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PSE switch hai; PD phone hai. PoE detection se shuru hota hai.</li>
<li>802.3af 15.4 W, 802.3at 30 W, 802.3bt 90 W tak.</li>
<li>Classes: 1 = 4 W, 2 = 7 W, 3 aur 0 = 15.4 W, 4 = 30 W.</li>
<li>Switch ka budget finite hai; reserved power budget se zyada nahi ho sakti.</li>
<li>Class reservation asli consumption se alag hai.</li>
</ul></div>
`}};export{e as default};