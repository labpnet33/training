var e={36:`#bae6fd`,52:`#fde68a`,100:`#bbf7d0`,149:`#ddd6fe`,116:`#fed7aa`},t=(t,n,r)=>`<circle cx="`+t+`" cy="`+n+`" r="52" fill="`+e[r]+`" fill-opacity="0.75" stroke="#64748b"/><circle cx="`+t+`" cy="`+n+`" r="5" fill="#0ea5e9"/><text x="`+t+`" y="`+(n+22)+`" text-anchor="middle" class="svg-ink" font-size="12">`+r+`</text>`,n=e=>`<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="`+e.aria+`"><rect x="10" y="10" width="620" height="240" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>`+t(80,70,36)+t(185,70,100)+t(290,70,149)+t(395,70,52)+t(500,70,36)+t(132,165,52)+t(237,165,36)+t(342,165,100)+t(447,165,149)+t(552,165,52)+`<polygon points="585,40 600,40 592,55" fill="#ef4444"/><text x="560" y="30" text-anchor="middle" class="svg-accent" font-size="12">`+e.radar+`</text><rect x="335" y="205" width="34" height="22" fill="#fca5a5" stroke="#64748b"/><text x="352" y="242" text-anchor="middle" class="svg-ink" font-size="12">`+e.oven+`</text><rect x="14" y="262" width="14" height="14" fill="#fde68a"/><text x="34" y="274" class="svg-ink" font-size="12">`+e.l1+`</text><circle cx="270" cy="269" r="5" fill="#0ea5e9"/><text x="282" y="274" class="svg-ink" font-size="12">`+e.l2+`</text><text x="14" y="294" class="svg-muted" font-size="12">`+e.l3+`</text></svg><p class="cap">`+e.cap+`</p></div>`,r=n({aria:`Channel reuse plan`,radar:`Radar`,oven:`Microwave`,l1:`Channel colour (DFS = amber/orange)`,l2:`AP, channel number`,l3:`No two touching cells share a channel; neighbours keep a gap.`,cap:`A 5 GHz reuse pattern for the Atlas Components shop floor. DFS channels (52 and above) are used, with a plan for radar events. A microwave in the canteen is a non-Wi-Fi source.`}),i=n({aria:`Channel reuse plan`,radar:`Radar`,oven:`Microwave`,l1:`Channel colour (DFS = amber/orange)`,l2:`AP, channel number`,l3:`Touching cells kabhi same channel nahi; padosiyon mein gap.`,cap:`Atlas Components shop floor ke liye 5 GHz reuse pattern. DFS channels (52 aur upar) use hue hain, radar events ke plan ke saath. Canteen ka microwave non-Wi-Fi source hai.`}),a={id:`channel-power-dfs-6ghz`,h:{en:`Channel and power planning, DFS, 6 GHz and spectrum analysis`,hi:`Channel aur power planning, DFS, 6 GHz aur spectrum analysis`},body:{en:`
<p>With AP positions chosen, you decide which channel each AP uses and how loud it speaks. Cisco's Radio Resource Management (RRM) can do this automatically, but a designer must know the rules to set constraints and to explain what RRM is doing. This chapter also covers DFS, the 6 GHz rules and how to find non-Wi-Fi interference.</p>

<h3>Case: Atlas Components, factory and office campus</h3>
<p>Atlas Components (fictional) has a 20,000 square metre factory hall with welding robots, a canteen, offices, and a loading yard. Requirements: reliable connectivity for handheld inspection tablets and automated guided vehicles (AGVs) that roam all day; a staff voice service in offices; guest access in the canteen. Constraints: some 5 GHz channels are near a nearby airport's weather radar, the factory has electrical noise, and the production line cannot stop for troubleshooting.</p>

<h3>Channel planning rules</h3>
<ul>
<li><b>2.4 GHz.</b> Use only channels 1, 6 and 11, 20 MHz wide. Consider turning 2.4 GHz off on some APs if it is not needed (Cisco's design guidance allows 2.4 GHz radios to be disabled on some APs in high-density cells, leaving enough coverage).</li>
<li><b>5 GHz.</b> Use 20 or 40 MHz in dense designs. Plan a reuse pattern where cells on the same channel are separated by enough distance and attenuation. Use as many channels as you can, including DFS.</li>
<li><b>6 GHz.</b> Use 20, 40, 80 or more depending on density; with more channels you can afford wider widths, but the same reuse logic applies.</li>
<li><b>Transmit power.</b> Set power so the cell edge meets the target signal and neighbours are heard at a lower level. Lower power in dense deployments; match client capability, because most client radios transmit at lower power than APs.</li>
</ul>
`+r+`
<h3>RRM in a design: DCA, TPC and coverage hole detection</h3>
<dl class="terms"><dt>Dynamic Channel Assignment (DCA)</dt><dd>RRM algorithm that picks channels per AP based on interference, load and noise. It can be limited to a channel list and width you choose.</dd>
<dt>Transmit Power Control (TPC)</dt><dd>Adjusts AP power to keep neighbours at a target level. You can set a minimum and maximum power.</dd>
<dt>Coverage Hole Detection and Mitigation (CHD)</dt><dd>Raises power when many clients see a weak signal.</dd>
<dt>Flexible Radio Assignment, Dynamic Bandwidth Selection</dt><dd>Features that change radio roles or channel width automatically, used where supported.</dd></dl>
<p>The design decision is not "auto or manual" in general, but <b>where to constrain RRM</b>. For example, in a high-density lecture hall you may set a fixed lower power range and a channel list; in a factory with AGVs you may avoid channel changes during production hours. Static channel assignment is sometimes used for point-to-point links, mesh backhaul and sensitive devices.</p>

<h3>DFS and radar</h3>
<p>Some 5 GHz channels are shared with weather and military radar. To use them an AP must perform <b>Dynamic Frequency Selection (DFS)</b>: listen for radar before using a channel (a channel availability check, usually about 60 seconds; some weather-radar channels need longer), and leave immediately if radar is detected, then stay off the channel for a period (typically 30 minutes). Clients may be disconnected during the switch.</p>
<table class="cmp"><tr><th>Option</th><th>Benefit</th><th>Trade-off</th></tr>
<tr><td>Non-DFS 5 GHz channels only</td><td>No radar events</td><td>Very few channels; heavy reuse and interference</td></tr>
<tr><td>Use DFS channels, remove ones that show repeated radar hits</td><td>Many more channels</td><td>Occasional brief disconnects</td></tr>
<tr><td>Add 6 GHz for new devices</td><td>No DFS in most designs, clean spectrum</td><td>Only newer clients; shorter range</td></tr>
</table>
<p>For Atlas, the engineer uses DFS channels in office areas but keeps AGV corridors on non-DFS channels in 5 GHz and adds 6 GHz where clients support it, because an AGV that loses a connection stops the line. Logs from the controller show where radar events happen, and any channel with repeated hits is removed from the DCA list.</p>

<h3>6 GHz design considerations</h3>
<ul>
<li><b>Power classes.</b> Low Power Indoor (LPI) is the usual indoor class, with limited power and no coordination service. Standard Power outdoors and indoors in some regions needs an <b>Automated Frequency Coordination (AFC)</b> service that tells the AP which channels and power levels are allowed at its location, protecting incumbent microwave links. Very Low Power is for short-range devices. Rules differ by country, so always confirm the regulatory domain.</li>
<li><b>Security.</b> WPA3 (or Enhanced Open) is required; there is no legacy open network or WPA2 on 6 GHz.</li>
<li><b>Discovery.</b> Clients do not scan every 6 GHz channel. They use preferred scanning channels, probes only from specific channels, and information announced by APs in other bands (reduced neighbour reports). Design the 2.4 and 5 GHz SSIDs so 6 GHz-capable clients can find the 6 GHz network.</li>
<li><b>Range.</b> Expect slightly less range than 5 GHz, so the AP count may rise for coverage-limited sites.</li>
</ul>

<h3>Non-Wi-Fi interference and spectrum analysis</h3>
<p>Wi-Fi tools see only Wi-Fi. A <b>spectrum analyser</b> (a dedicated device, an AP with a built-in spectrum feature such as Cisco CleanAir, or a survey tool's analyser) shows all energy in the band. Typical non-Wi-Fi sources: microwave ovens (2.4 GHz, bursts), Bluetooth and cordless phones (2.4 GHz hopping), video cameras and baby monitors (2.4 and 5 GHz), wireless HDMI, welding equipment, motors and radar (5 GHz DFS). The analyser identifies the type, the channels hit, the duty cycle (how often it transmits) and the severity.</p>
<div class="eg"><p><b>Worked example.</b> In the Atlas canteen, spectrum analysis shows a wide burst across channels 6 to 11 that lasts 2 seconds out of every 10 and peaks at -55 dBm. That matches a microwave oven. Options: move the guest SSID to 5 GHz and turn off 2.4 GHz on the canteen AP, relocate the oven away from the AP, or accept the interference at lunchtime only. The engineer does the first two.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using the same channel on adjacent APs because "RRM will fix it"; leaving DFS channels in the list after radar hits; leaving 6 GHz without a plan for client discovery; assuming one survey in the morning shows interference that appears at lunchtime or at night; setting power to maximum "to be safe".</p></div>
<div class="exam"><p><b>Exam trap.</b> Know that DFS requires radar detection and a channel availability check, that 6 GHz needs WPA3, and that standard power in 6 GHz relies on AFC while LPI does not. Spectrum analysis finds non-Wi-Fi sources; Wi-Fi survey tools cannot.</p></div>

<div class="scn"><h4>The robots that stopped at noon</h4><p>Atlas AGVs stopped every day around midday. The Wi-Fi survey showed good signal. A spectrum capture during lunch showed a continuous 2.4 GHz source from a wireless camera in the yard, which pushed noise to -70 dBm. The camera was moved to 5 GHz on a non-DFS channel, and AGVs were pinned to 5 GHz.</p><p><b>Lesson:</b> survey at the times the problem occurs, with a spectrum analyser.</p></div>
<div class="iv"><p class="q">"What is DFS and how does it affect design?"</p><p>Strong answer: DFS lets Wi-Fi share certain 5 GHz channels with radar. The AP checks for radar before using the channel and leaves it if radar appears, which can briefly disconnect clients. In design I use DFS channels to get more channel reuse, but keep critical mobile devices on non-DFS channels and remove channels with repeated radar events.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan channels so neighbouring cells never share a channel: 1, 6, 11 in 2.4 GHz, 20 or 40 MHz widths in dense 5 GHz.</li>
<li>RRM uses DCA, TPC and CHD; the designer constrains channel lists, widths and power ranges.</li>
<li>DFS needs radar detection; critical devices should avoid channels with repeated radar events.</li>
<li>6 GHz: LPI versus standard power with AFC, mandatory WPA3, discovery through other bands.</li>
<li>Only a spectrum analyser finds non-Wi-Fi interference, so survey at the times issues appear.</li>
</ul></div>
`,hi:`
<p>AP positions tay hone ke baad aap tay karte ho ki har AP kaunsa channel use kare aur kitni awaaz (power) se bole. Cisco ka Radio Resource Management (RRM) yeh automatically kar sakta hai, lekin designer ko rules aane chahiye taaki constraints set kar sake aur samjha sake ki RRM kya kar raha hai. Yeh chapter DFS, 6 GHz rules aur non-Wi-Fi interference dhundhna bhi cover karta hai.</p>

<h3>Case: Atlas Components, factory aur office campus</h3>
<p>Atlas Components (fictional) ke paas 20,000 square metre ka factory hall hai jisme welding robots, canteen, offices aur loading yard hain. Requirements: handheld inspection tablets aur automated guided vehicles (AGVs) ke liye reliable connectivity jo poora din roam karte hain; offices mein staff voice service; canteen mein guest access. Constraints: kuch 5 GHz channels paas ke airport ke weather radar ke qareeb hain, factory mein electrical noise hai, aur production line troubleshooting ke liye ruk nahi sakti.</p>

<h3>Channel planning rules</h3>
<ul>
<li><b>2.4 GHz.</b> Sirf channels 1, 6 aur 11, 20 MHz wide. Agar zaroorat nahi to kuch APs par 2.4 GHz band karne par vichaar karo (Cisco design guidance high-density cells mein kuch APs par 2.4 GHz radios disable karne deta hai, kaafi coverage chhod kar).</li>
<li><b>5 GHz.</b> Dense designs mein 20 ya 40 MHz. Aisa reuse pattern plan karo jisme same channel ke cells ke beech kaafi distance aur attenuation ho. Jitne ho sake channels use karo, DFS bhi.</li>
<li><b>6 GHz.</b> Density ke hisaab se 20, 40, 80 ya zyada; zyada channels ke saath wider width afford kar sakte ho, par reuse logic wahi rehta hai.</li>
<li><b>Transmit power.</b> Power aisa set karo ki cell edge target signal meet kare aur padosi lower level par sunai dein. Dense deployments mein lower power; client capability se match karo, kyunki zyadatar client radios AP se kam power par transmit karte hain.</li>
</ul>
`+i+`
<h3>Design mein RRM: DCA, TPC aur coverage hole detection</h3>
<dl class="terms"><dt>Dynamic Channel Assignment (DCA)</dt><dd>RRM algorithm jo interference, load aur noise ke basis par har AP ke liye channel chunta hai. Aapke chune channel list aur width tak limit kiya ja sakta hai.</dd>
<dt>Transmit Power Control (TPC)</dt><dd>AP power adjust karta hai taaki padosi target level par rahein. Minimum aur maximum power set kar sakte ho.</dd>
<dt>Coverage Hole Detection and Mitigation (CHD)</dt><dd>Jab kai clients weak signal dekhte hain to power badhata hai.</dd>
<dt>Flexible Radio Assignment, Dynamic Bandwidth Selection</dt><dd>Features jo radio roles ya channel width automatically badalte hain, jahan supported ho.</dd></dl>
<p>Design decision general "auto ya manual" nahi hai, balki <b>RRM ko kahan constrain karna hai</b>. Jaise high-density lecture hall mein fixed lower power range aur channel list set kar sakte ho; AGVs wali factory mein production hours ke dauraan channel changes avoid kar sakte ho. Static channel assignment kabhi-kabhi point-to-point links, mesh backhaul aur sensitive devices ke liye use hota hai.</p>

<h3>DFS aur radar</h3>
<p>Kuch 5 GHz channels weather aur military radar ke saath shared hain. Unhe use karne ke liye AP ko <b>Dynamic Frequency Selection (DFS)</b> karna padta hai: channel use karne se pehle radar ke liye sunna (channel availability check, aam taur par lagbhag 60 second; kuch weather-radar channels ko zyada), aur radar detect hote hi turant channel chhod dena, phir kuch der (aam taur par 30 minute) us channel par na aana. Switch ke dauraan clients disconnect ho sakte hain.</p>
<table class="cmp"><tr><th>Option</th><th>Fayda</th><th>Trade-off</th></tr>
<tr><td>Sirf non-DFS 5 GHz channels</td><td>Radar events nahi</td><td>Bahut kam channels; heavy reuse aur interference</td></tr>
<tr><td>DFS channels use karo, jo baar-baar radar hits dikhayein unhe hata do</td><td>Bahut zyada channels</td><td>Kabhi-kabhi chhote disconnects</td></tr>
<tr><td>Naye devices ke liye 6 GHz jodo</td><td>Zyadatar designs mein DFS nahi, clean spectrum</td><td>Sirf naye clients; chhota range</td></tr>
</table>
<p>Atlas ke liye engineer office areas mein DFS channels use karta hai lekin AGV corridors ko 5 GHz mein non-DFS channels par rakhta hai aur jahan clients support karein wahan 6 GHz jodta hai, kyunki connection khone par AGV line rok deta hai. Controller logs dikhate hain radar events kahan hote hain, aur baar-baar hit wala channel DCA list se hata diya jata hai.</p>

<h3>6 GHz design considerations</h3>
<ul>
<li><b>Power classes.</b> Low Power Indoor (LPI) aam indoor class hai, limited power ke saath aur coordination service ke bina. Standard Power (outdoor aur kuch regions mein indoor) ko <b>Automated Frequency Coordination (AFC)</b> service chahiye jo AP ko batati hai ki uski location par kaunse channels aur power levels allowed hain, taaki incumbent microwave links protect hon. Very Low Power chhote range ke devices ke liye hai. Rules country ke hisaab se badalte hain, isliye regulatory domain hamesha confirm karo.</li>
<li><b>Security.</b> WPA3 (ya Enhanced Open) required hai; 6 GHz par legacy open network ya WPA2 nahi.</li>
<li><b>Discovery.</b> Clients har 6 GHz channel scan nahi karte. Woh preferred scanning channels, specific channels se probes, aur doosre bands mein APs ke announce kiye information (reduced neighbour reports) use karte hain. 2.4 aur 5 GHz SSIDs aise design karo ki 6 GHz-capable clients 6 GHz network dhundh sakein.</li>
<li><b>Range.</b> 5 GHz se thoda kam range ki ummeed rakho, isliye coverage-limited sites par AP count badh sakta hai.</li>
</ul>

<h3>Non-Wi-Fi interference aur spectrum analysis</h3>
<p>Wi-Fi tools sirf Wi-Fi dekhte hain. <b>Spectrum analyser</b> (dedicated device, built-in spectrum feature wala AP jaise Cisco CleanAir, ya survey tool ka analyser) band ki saari energy dikhata hai. Typical non-Wi-Fi sources: microwave ovens (2.4 GHz, bursts), Bluetooth aur cordless phones (2.4 GHz hopping), video cameras aur baby monitors (2.4 aur 5 GHz), wireless HDMI, welding equipment, motors aur radar (5 GHz DFS). Analyser type, hit hue channels, duty cycle (kitni baar transmit karta hai) aur severity batata hai.</p>
<div class="eg"><p><b>Worked example.</b> Atlas canteen mein spectrum analysis har 10 second mein 2 second chalne wala channels 6 se 11 par wide burst dikhata hai jo -55 dBm par peak karta hai. Yeh microwave oven se match karta hai. Options: guest SSID ko 5 GHz par le jao aur canteen AP par 2.4 GHz band karo, oven ko AP se door rakho, ya sirf lunchtime ka interference accept karo. Engineer pehle do karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Adjacent APs par same channel "RRM theek kar dega" soch kar; radar hits ke baad bhi DFS channels list mein chhod dena; client discovery ke plan ke bina 6 GHz chhod dena; yeh maan lena ki subah ka ek survey woh interference dikha dega jo lunch ya raat ko aata hai; "safe side" ke liye power maximum karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho ki DFS ko radar detection aur channel availability check chahiye, 6 GHz ko WPA3 chahiye, aur 6 GHz mein standard power AFC par depend karta hai jabki LPI nahi. Spectrum analysis non-Wi-Fi sources dhundhta hai; Wi-Fi survey tools nahi.</p></div>

<div class="scn"><h4>Jo robots dopahar ko ruk jate the</h4><p>Atlas ke AGVs roz dopahar ke aas-paas ruk jate the. Wi-Fi survey mein signal achha tha. Lunch ke dauraan spectrum capture ne yard ke wireless camera se continuous 2.4 GHz source dikhaya jo noise ko -70 dBm tak le jaa raha tha. Camera ko 5 GHz ke non-DFS channel par shift kiya gaya, aur AGVs ko 5 GHz par pin kiya gaya.</p><p><b>Lesson:</b> jab problem hoti hai us waqt spectrum analyser ke saath survey karo.</p></div>
<div class="iv"><p class="q">"DFS kya hai aur design par kaise asar daalta hai?"</p><p>Strong answer: DFS Wi-Fi ko kuch 5 GHz channels radar ke saath share karne deta hai. AP channel use karne se pehle radar check karta hai aur radar aate hi channel chhod deta hai, jisse clients thodi der ke liye disconnect ho sakte hain. Design mein main zyada channel reuse ke liye DFS channels use karta hoon, lekin critical mobile devices ko non-DFS channels par rakhta hoon aur baar-baar radar events wale channels hata deta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Channels aise plan karo ki padosi cells kabhi channel share na karein: 2.4 GHz mein 1, 6, 11; dense 5 GHz mein 20 ya 40 MHz width.</li>
<li>RRM DCA, TPC aur CHD use karta hai; designer channel lists, widths aur power ranges ko constrain karta hai.</li>
<li>DFS ko radar detection chahiye; critical devices ko baar-baar radar events wale channels se bachana chahiye.</li>
<li>6 GHz: LPI versus AFC ke saath standard power, mandatory WPA3, doosre bands ke through discovery.</li>
<li>Non-Wi-Fi interference sirf spectrum analyser dhundhta hai, isliye issues aane ke time par survey karo.</li>
</ul></div>
`}};export{a as default};