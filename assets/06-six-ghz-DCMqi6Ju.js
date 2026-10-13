var e={id:`six-ghz`,h:{en:`The 6 GHz band: PSC, LPI, VLP, AFC and WPA3 (concept only)`,hi:`6 GHz band: PSC, LPI, VLP, AFC aur WPA3 (concept only)`},body:{en:`
<div class="note"><p><b>Concept only.</b> The simulator rejects <code>radio policy dot11 6ghz</code> with a concept-only message, and it has no 6 GHz radios. Everything here is for the exam, design work and interviews. Regulations change; treat power limits as typical values and check the current rules of the country where you deploy.</p></div>

<h3>Why 6 GHz exists</h3>
<p>2.4 GHz has 83 MHz of spectrum and 5 GHz is crowded and shared with radar. Regulators opened a new, large block above 5 GHz for unlicensed use. In the United States it is <b>5925 to 7125 MHz, 1200 MHz</b> wide, which is more than the whole 2.4 GHz and 5 GHz Wi-Fi spectrum combined. That space holds 59 channels of 20 MHz, 29 of 40 MHz, 14 of 80 MHz, 7 of 160 MHz and 3 of 320 MHz. Europe and the UK opened the lower part (about 5945 to 6425 MHz, 480 MHz). In India the Government delicensed the <b>lower 6 GHz (5925 to 6425 MHz)</b> for low-power indoor and very-low-power use in 2026; the upper part (6425 to 7125 MHz) was still not open to Wi-Fi when this module was written, so confirm the latest notification before you design. Because a client needs 6 GHz support, the clean air is a benefit only for Wi-Fi 6E and Wi-Fi 7 devices: there are no legacy clients in 6 GHz at all.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="6 GHz sub-bands">
<rect x="20" y="30" width="600" height="40" rx="6" fill="#e2e8f0"/>
<rect x="20" y="30" width="190" height="40" rx="6" fill="#ddd6fe"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="12">lower 6 GHz: 5925 to 6425</text>
<rect x="215" y="30" width="405" height="40" rx="6" fill="#fde68a"/><text x="418" y="55" text-anchor="middle" class="svg-ink" font-size="12">upper 6 GHz: 6425 to 7125 (region dependent)</text>
<text x="20" y="100" class="svg-muted" font-size="12">PSC channels (20 MHz): 5, 21, 37, 53, 69, 85, 101, 117, 133, 149, 165, 181, 197, 213, 229</text>
<text x="20" y="125" class="svg-muted" font-size="12">Every fourth 20 MHz channel is a Preferred Scanning Channel, 80 MHz apart</text>
<text x="20" y="160" class="svg-muted" font-size="12">India: lower 6 GHz delicensed (LPI and VLP); upper 6 GHz: check the latest rules</text>
</svg><p class="cap">Channel numbering in 6 GHz runs from 1 to 233 in steps of 4 for 20 MHz channels, starting at 5955 MHz for channel 1.</p></div>

<h3>Power classes: LPI, VLP and Standard Power</h3>
<table class="cmp"><tr><th>Class</th><th>Meaning</th><th>Typical limit (US style)</th><th>Needs AFC?</th></tr>
<tr><td><b>LPI</b>, Low Power Indoor</td><td>Indoor APs only, integrated antenna, not battery powered, no outdoor</td><td>30 dBm EIRP, 5 dBm per MHz</td><td>No</td></tr>
<tr><td><b>VLP</b>, Very Low Power</td><td>Portable and wearable, indoors or outdoors, short range</td><td>14 dBm EIRP</td><td>No</td></tr>
<tr><td><b>SP</b>, Standard Power</td><td>Outdoor and wide-area, higher power</td><td>36 dBm EIRP</td><td>Yes</td></tr></table>
<p>Enterprise indoor APs normally run as LPI. <b>AFC</b> (Automated Frequency Coordination) is an online database service. A standard-power AP sends its geographic location and antenna details, and the AFC system replies with the channels and maximum power that will not interfere with licensed incumbents (fixed microwave links, satellite uplinks, radio astronomy). The AP must ask again at least once every 24 hours. Without a valid AFC answer it must not use standard power. LPI has no AFC, which is why most deployments start there. Different regions define classes slightly differently (for example Europe has LPI and VLP only so far), and India's published rules cover LPI and VLP, so a design that needs an outdoor 6 GHz link must check whether Standard Power is allowed.</p>

<h3>Rules that make 6 GHz different</h3>
<ul>
<li><b>No legacy security.</b> Open networks and WPA2-PSK are not allowed. 6 GHz requires <b>WPA3</b> (SAE for personal, 802.1X with AES-CCMP/GCMP for enterprise) or <b>Enhanced Open</b> (OWE) for open guests. <b>Protected Management Frames (PMF)</b> is mandatory. TKIP and WEP do not exist.</li>
<li><b>No legacy rates and clients.</b> Only 802.11ax and 802.11be exist in 6 GHz. No 802.11b/g/n/ac, no protection mechanisms.</li>
<li><b>Fast discovery, because scanning 59 channels is slow.</b> A client does not scan all 6 GHz channels. It uses (1) the <b>Preferred Scanning Channels</b>, only the 15 PSC channels, (2) a <b>Reduced Neighbor Report (RNR)</b> inside beacons and probe responses on 2.4 and 5 GHz that lists 6 GHz APs nearby (called <b>out-of-band discovery</b>), and (3) <b>FILS discovery frames</b> or <b>unsolicited probe responses</b> that a 6 GHz AP sends every 20 TU (about 20 ms) on a PSC channel, so the client need not send probes. A 6 GHz-only SSID is rare for this reason; most designs advertise the SSID on 5 GHz with an RNR pointer to 6 GHz.</li>
<li><b>Wide channels are practical.</b> 80 and 160 MHz are common in homes; offices usually run 20 or 40 MHz for density. 320 MHz exists for Wi-Fi 7 only and is used on very few access points.</li>
<li><b>No DFS.</b> There is no radar sharing in 6 GHz, but incumbents are protected through power class and AFC instead.</li>
</ul>

<h3>What a controller does</h3>
<p>On a real Catalyst 9800, a 6 GHz radio has its own RF profile and radio policy, and a WLAN served in 6 GHz must have WPA3 and PMF. A common design is one SSID across 5 and 6 GHz where the 6 GHz band-specific security rules are applied. In the simulator, the 6 GHz command exists but only tells you it is concept only, so it can never silently change client state.</p>
<pre class="out">WLC1(config-wlan)# radio policy dot11 6ghz
<span class="hl">% 6 GHz is concept only in this model; use 24ghz or 5ghz</span></pre>
<p>Sample of the style of message; the exact wording in your lab may differ slightly. The point: do not expect a 6 GHz radio in the lab.</p>

<div class="eg"><p><b>Worked example.</b> Free-space path loss grows with 20 log of the frequency. Between 5.2 GHz and 6 GHz at the same distance the difference is 20 log(6000/5200) = 1.2 dB. Between 2.4 GHz and 5.2 GHz it is about 6.7 dB. So a 6 GHz cell is only slightly smaller than a 5 GHz cell in free space, although 6 GHz is absorbed a little more by walls. Because LPI allows a similar indoor power to 5 GHz, plan 6 GHz cells close to your 5 GHz cell layout and then verify with a survey.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating a WPA2-PSK SSID and expecting it to appear in 6 GHz. It will not: the AP refuses to bring it up there, or the client cannot join. A 6 GHz SSID needs WPA3 SAE, OWE or 802.1X with PMF.</p></div>
<div class="exam"><p><b>Exam trap.</b> LPI = indoor, no AFC. Standard Power = needs AFC. PSC = every fourth 20 MHz channel (5, 21, 37, ...). 6 GHz is not DFS. Wi-Fi 6E is 6 GHz with 802.11ax, so the first 6 GHz client is also a Wi-Fi 6 client.</p></div>

<div class="scn"><h4>The invisible 6 GHz SSID</h4><p>A new office had Wi-Fi 6E APs, but the laptops never showed the 6 GHz network. The SSID existed on 2.4 and 5 GHz with WPA2-PSK, and 6 GHz had been left off because WPA2 is not allowed there. The engineer created a WPA3-SAE SSID with PMF, enabled the 6 GHz radio policy and made sure the 5 GHz beacons carried the RNR, so clients found the 6 GHz AP quickly.</p><p><b>Lesson:</b> 6 GHz needs WPA3, PMF and a discovery plan. Check the security first when a 6E client cannot see the band.</p></div>

<div class="iv"><p class="q">"What is AFC and when do you need it?"</p><p>Strong answer: Automated Frequency Coordination is a cloud database service that tells a standard-power 6 GHz AP which channels and maximum power it may use at its exact location, so it does not harm licensed microwave and satellite links. APs ask at startup and again at least daily. Indoor Low Power Indoor APs do not need AFC because their power is limited, which is why most enterprise APs are LPI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>6 GHz adds up to 1200 MHz (US), 59 twenty-megahertz channels, and only Wi-Fi 6E and Wi-Fi 7 clients.</li>
<li>Power classes: LPI (indoor, no AFC), VLP (low power, portable), Standard Power (AFC needed).</li>
<li>PSC channels are every fourth channel (5, 21, 37, ...), and RNR, FILS and unsolicited probe responses speed up discovery.</li>
<li>WPA3 (SAE or 802.1X) or OWE with mandatory PMF; no WPA2-PSK, open, WEP or TKIP.</li>
<li>India delicensed lower 6 GHz; verify the current rules. In the lab, 6 GHz is concept only.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Concept only.</b> Simulator <code>radio policy dot11 6ghz</code> ko concept-only message ke saath reject karta hai, aur usme koi 6 GHz radio nahi hai. Yahan sab kuch exam, design work aur interviews ke liye hai. Regulations badalte rehte hain; power limits ko typical values samjho aur jis desh mein deploy kar rahe ho uske current rules check karo.</p></div>

<h3>6 GHz kyun hai</h3>
<p>2.4 GHz ke paas 83 MHz spectrum hai aur 5 GHz crowded hai aur radar ke saath shared. Regulators ne 5 GHz ke upar ek naya, bada block unlicensed use ke liye khola. United States mein yeh <b>5925 se 7125 MHz, 1200 MHz</b> chauda hai, jo poore 2.4 GHz aur 5 GHz Wi-Fi spectrum ko milakar bhi zyada hai. Is jagah mein 20 MHz ke 59, 40 MHz ke 29, 80 MHz ke 14, 160 MHz ke 7 aur 320 MHz ke 3 channels aate hain. Europe aur UK ne neeche ka hissa khola (lagbhag 5945 se 6425 MHz, 480 MHz). India mein Government ne 2026 mein <b>lower 6 GHz (5925 se 6425 MHz)</b> ko low-power indoor aur very-low-power use ke liye delicense kiya; upper hissa (6425 se 7125 MHz) is module ke likhe jaane tak Wi-Fi ke liye khula nahi tha, isliye design se pehle latest notification confirm karo. Kyunki client ko 6 GHz support chahiye, saaf hawa ka fayda sirf Wi-Fi 6E aur Wi-Fi 7 devices ko milta hai: 6 GHz mein koi legacy client hota hi nahi.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="6 GHz sub-bands">
<rect x="20" y="30" width="600" height="40" rx="6" fill="#e2e8f0"/>
<rect x="20" y="30" width="190" height="40" rx="6" fill="#ddd6fe"/><text x="115" y="55" text-anchor="middle" class="svg-ink" font-size="12">lower 6 GHz: 5925 se 6425</text>
<rect x="215" y="30" width="405" height="40" rx="6" fill="#fde68a"/><text x="418" y="55" text-anchor="middle" class="svg-ink" font-size="12">upper 6 GHz: 6425 se 7125 (region par depend)</text>
<text x="20" y="100" class="svg-muted" font-size="12">PSC channels (20 MHz): 5, 21, 37, 53, 69, 85, 101, 117, 133, 149, 165, 181, 197, 213, 229</text>
<text x="20" y="125" class="svg-muted" font-size="12">Har chautha 20 MHz channel Preferred Scanning Channel hai, 80 MHz ke fasle par</text>
<text x="20" y="160" class="svg-muted" font-size="12">India: lower 6 GHz delicensed (LPI aur VLP); upper 6 GHz: latest rules check karo</text>
</svg><p class="cap">6 GHz mein channel numbering 20 MHz channels ke liye 1 se 233 tak 4 ke steps mein chalti hai, channel 1 5955 MHz se shuru hota hai.</p></div>

<h3>Power classes: LPI, VLP aur Standard Power</h3>
<table class="cmp"><tr><th>Class</th><th>Matlab</th><th>Typical limit (US style)</th><th>AFC chahiye?</th></tr>
<tr><td><b>LPI</b>, Low Power Indoor</td><td>Sirf indoor APs, integrated antenna, battery se nahi, outdoor nahi</td><td>30 dBm EIRP, 5 dBm per MHz</td><td>Nahi</td></tr>
<tr><td><b>VLP</b>, Very Low Power</td><td>Portable aur wearable, indoors ya outdoors, short range</td><td>14 dBm EIRP</td><td>Nahi</td></tr>
<tr><td><b>SP</b>, Standard Power</td><td>Outdoor aur wide-area, zyada power</td><td>36 dBm EIRP</td><td>Haan</td></tr></table>
<p>Enterprise indoor APs aam taur par LPI chalte hain. <b>AFC</b> (Automated Frequency Coordination) ek online database service hai. Standard-power AP apni geographic location aur antenna details bhejta hai, aur AFC system un channels aur maximum power ke saath jawab deta hai jo licensed incumbents (fixed microwave links, satellite uplinks, radio astronomy) ko disturb na kare. AP ko kam se kam har 24 ghante mein dobara poochna padta hai. Valid AFC jawab ke bina woh standard power use nahi kar sakta. LPI mein AFC nahi hota, isliye zyada tar deployments wahin se shuru hote hain. Alag regions classes ko thoda alag define karte hain (jaise Europe mein abhi tak sirf LPI aur VLP hain), aur India ke published rules LPI aur VLP cover karte hain, isliye outdoor 6 GHz link wale design ko check karna hoga ki Standard Power allowed hai ya nahi.</p>

<h3>Woh rules jo 6 GHz ko alag banate hain</h3>
<ul>
<li><b>Legacy security nahi.</b> Open networks aur WPA2-PSK allowed nahi hain. 6 GHz ko <b>WPA3</b> (personal ke liye SAE, enterprise ke liye 802.1X with AES-CCMP/GCMP) ya open guests ke liye <b>Enhanced Open</b> (OWE) chahiye. <b>Protected Management Frames (PMF)</b> mandatory hai. TKIP aur WEP exist hi nahi karte.</li>
<li><b>Legacy rates aur clients nahi.</b> 6 GHz mein sirf 802.11ax aur 802.11be hain. 802.11b/g/n/ac nahi, protection mechanisms nahi.</li>
<li><b>Fast discovery, kyunki 59 channels scan karna slow hai.</b> Client saare 6 GHz channels scan nahi karta. Woh (1) <b>Preferred Scanning Channels</b>, sirf 15 PSC channels, (2) 2.4 aur 5 GHz ke beacons aur probe responses ke andar <b>Reduced Neighbor Report (RNR)</b> jo paas ke 6 GHz APs list karta hai (<b>out-of-band discovery</b>), aur (3) <b>FILS discovery frames</b> ya <b>unsolicited probe responses</b> jo 6 GHz AP PSC channel par har 20 TU (lagbhag 20 ms) bhejta hai, taaki client ko probe bhejna na pade, use karta hai. Isi wajah se 6 GHz-only SSID kam hota hai; zyada tar designs SSID 5 GHz par advertise karte hain aur 6 GHz ki taraf RNR pointer dete hain.</li>
<li><b>Wide channels practical hain.</b> 80 aur 160 MHz homes mein common hain; offices aam taur par density ke liye 20 ya 40 MHz chalate hain. 320 MHz sirf Wi-Fi 7 ke liye hai aur bahut kam access points par use hota hai.</li>
<li><b>DFS nahi.</b> 6 GHz mein radar sharing nahi hai, lekin incumbents ko power class aur AFC se protect kiya jaata hai.</li>
</ul>

<h3>Controller kya karta hai</h3>
<p>Real Catalyst 9800 par 6 GHz radio ka apna RF profile aur radio policy hota hai, aur 6 GHz mein serve hone wale WLAN ko WPA3 aur PMF chahiye. Ek common design 5 aur 6 GHz par ek SSID hai jahan 6 GHz band-specific security rules lagte hain. Simulator mein 6 GHz command maujood hai lekin sirf batata hai ki yeh concept only hai, taaki woh chupke se client state na badal sake.</p>
<pre class="out">WLC1(config-wlan)# radio policy dot11 6ghz
<span class="hl">% 6 GHz is concept only in this model; use 24ghz or 5ghz</span></pre>
<p>Message ke style ka sample; aapke lab mein exact wording thodi alag ho sakti hai. Point yeh hai: lab mein 6 GHz radio ki ummeed mat rakho.</p>

<div class="eg"><p><b>Worked example.</b> Free-space path loss frequency ke 20 log ke saath badhta hai. Same doori par 5.2 GHz aur 6 GHz ke beech farak 20 log(6000/5200) = 1.2 dB hai. 2.4 GHz aur 5.2 GHz ke beech lagbhag 6.7 dB. Isliye free space mein 6 GHz cell 5 GHz cell se sirf thoda chhota hota hai, halanki deewarein 6 GHz ko thoda zyada absorb karti hain. LPI 5 GHz jaisi indoor power deta hai, isliye 6 GHz cells ko apne 5 GHz cell layout ke kareeb plan karo aur phir survey se verify karo.</p></div>

<div class="warn"><p><b>Common galti.</b> WPA2-PSK SSID banakar ummeed karna ki woh 6 GHz mein dikhega. Nahi dikhega: AP use wahan up nahi karta, ya client join nahi kar pata. 6 GHz SSID ko WPA3 SAE, OWE ya PMF ke saath 802.1X chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> LPI = indoor, AFC nahi. Standard Power = AFC chahiye. PSC = har chautha 20 MHz channel (5, 21, 37, ...). 6 GHz DFS nahi hai. Wi-Fi 6E matlab 802.11ax ke saath 6 GHz, isliye pehla 6 GHz client Wi-Fi 6 client bhi hota hai.</p></div>

<div class="scn"><h4>Nazar na aane wala 6 GHz SSID</h4><p>Ek naye office mein Wi-Fi 6E APs the, lekin laptops ko 6 GHz network kabhi nahi dikha. SSID 2.4 aur 5 GHz par WPA2-PSK ke saath tha, aur 6 GHz ko chhod diya gaya tha kyunki wahan WPA2 allowed nahi hai. Engineer ne PMF ke saath WPA3-SAE SSID banaya, 6 GHz radio policy enable ki aur dhyan rakha ki 5 GHz beacons mein RNR ho, taaki clients 6 GHz AP jaldi dhoondh lein.</p><p><b>Seekh:</b> 6 GHz ko WPA3, PMF aur discovery plan chahiye. 6E client band nahi dekh pa raha to pehle security check karo.</p></div>

<div class="iv"><p class="q">"AFC kya hai aur kab chahiye?"</p><p>Strong answer: Automated Frequency Coordination ek cloud database service hai jo standard-power 6 GHz AP ko batati hai ki uski exact location par kaunse channels aur kitni maximum power use kar sakta hai, taaki licensed microwave aur satellite links ko nuksan na ho. APs startup par aur kam se kam roz dobara poochte hain. Low Power Indoor APs ko AFC nahi chahiye kyunki unki power limited hai, isliye zyada tar enterprise APs LPI hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>6 GHz 1200 MHz tak (US), 59 bees-megahertz channels, aur sirf Wi-Fi 6E aur Wi-Fi 7 clients jodta hai.</li>
<li>Power classes: LPI (indoor, AFC nahi), VLP (low power, portable), Standard Power (AFC chahiye).</li>
<li>PSC channels har chautha channel hain (5, 21, 37, ...), aur RNR, FILS aur unsolicited probe responses discovery tez karte hain.</li>
<li>WPA3 (SAE ya 802.1X) ya OWE mandatory PMF ke saath; WPA2-PSK, open, WEP ya TKIP nahi.</li>
<li>India ne lower 6 GHz delicense kiya; current rules verify karo. Lab mein 6 GHz concept only hai.</li>
</ul></div>
`}};export{e as default};