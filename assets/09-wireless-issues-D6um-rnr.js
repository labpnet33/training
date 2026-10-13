var e={id:`wireless-issues`,h:{en:`Wireless performance faults`,hi:`Wireless performance faults`},body:{en:`
<p>Wi-Fi is a shared radio medium, so it has every wired performance problem plus a few of its own. You planned channels in np-wireless; now you learn to diagnose a Wi-Fi network that looks fine on paper and feels terrible to users. Think of a large party. Everybody talks in the same room (the channel). If two groups stand too close they talk over each other (interference and channel overlap). The further you stand from someone, the harder you hear them (signal degradation). Some corners of the room are silent (coverage holes). And moving between groups is awkward if every group speaks a different language (roaming misconfiguration).</p>

<h3>Interference</h3>
<ul>
<li><b>Co-channel interference (CCI):</b> two APs on the <b>same</b> channel within hearing of each other. Wi-Fi is polite: only one radio on a channel may transmit at a time, so they share airtime. The result is contention and slowness, not corruption.</li>
<li><b>Adjacent-channel interference (ACI):</b> APs on <b>overlapping</b> channels, for example 2.4 GHz channels 1 and 3. They cannot hear each other's frames properly, so they talk over each other and corrupt frames. ACI is worse than CCI.</li>
<li><b>Non-Wi-Fi interference:</b> microwave ovens, Bluetooth, cordless phones, video senders and baby monitors in 2.4 GHz; radar on the <b>DFS</b> channels in 5 GHz, which forces an AP to leave the channel immediately and disconnects its clients.</li>
</ul>

<h3>Channel overlap</h3>
<p>In 2.4 GHz each 20 MHz channel spans several channel numbers, so only <b>1, 6 and 11</b> do not overlap (in most regions). In 5 GHz there are many non-overlapping 20 MHz channels, but bonding them into 40, 80 or 160 MHz channels uses them up quickly. 6 GHz (Wi-Fi 6E and Wi-Fi 7) adds many more clean channels.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="2.4 GHz channels 1 6 11 and overlap">
<path d="M40 130 Q 100 30 160 130" fill="#bbf7d0" stroke="#64748b"/><text x="100" y="150" text-anchor="middle" class="svg-ink" font-size="13">Ch 1</text>
<path d="M90 130 Q 150 50 210 130" fill="none" stroke="#64748b" stroke-dasharray="4 3"/><text x="150" y="44" text-anchor="middle" class="svg-accent" font-size="12">Ch 3 overlaps</text>
<path d="M240 130 Q 300 30 360 130" fill="#bae6fd" stroke="#64748b"/><text x="300" y="150" text-anchor="middle" class="svg-ink" font-size="13">Ch 6</text>
<path d="M440 130 Q 500 30 560 130" fill="#fde68a" stroke="#64748b"/><text x="500" y="150" text-anchor="middle" class="svg-ink" font-size="13">Ch 11</text>
<line x1="20" y1="130" x2="620" y2="130" stroke="#64748b"/>
</svg><p class="cap">Only 1, 6 and 11 are clean in 2.4 GHz. An AP on channel 3 overlaps both 1 and 6.</p></div>

<h3>Signal degradation</h3>
<p>Signal strength is measured as <b>RSSI</b> in dBm (negative numbers; closer to zero is stronger). What really matters is the <b>signal-to-noise ratio (SNR)</b>: signal minus the noise floor, in dB.</p>
<table class="cmp"><tr><th>RSSI</th><th>Quality</th></tr>
<tr><td>-30 to -50 dBm</td><td>Excellent</td></tr>
<tr><td>-67 dBm</td><td>Common minimum for voice and video</td></tr>
<tr><td>-70 dBm</td><td>Acceptable for web and email</td></tr>
<tr><td>-80 dBm and below</td><td>Poor, unreliable</td></tr>
</table>
<p>Signal degrades with <b>distance</b> (free-space path loss) and <b>obstacles</b>: concrete and brick walls, metal (lift shafts, filing cabinets), mirrored or coated glass, water (including people in a crowded hall). <b>Reflection</b> causes multipath, and <b>absorption</b> weakens the signal.</p>
<div class="eg"><p><b>Worked example: is -68 dBm good enough?</b> A user near a conference room sees RSSI -68 dBm. The Wi-Fi analyzer shows the noise floor there is -90 dBm, so SNR = -68 - (-90) = <b>22 dB</b>. For web browsing that is fine; for Wi-Fi calling, most designs aim for at least -67 dBm and about 25 dB SNR. In the room next door, a video sender pushes the noise floor to -78 dBm: SNR = 10 dB, and the connection becomes unusable even though the signal did not change. The fix is to remove the noise source, not to raise the AP power.</p></div>

<h3>Coverage</h3>
<p>Coverage problems cut both ways. <b>Too little</b>: dead zones in stairwells, warehouses or behind lift shafts, found with a site survey. <b>Too much</b>: APs at full power cover huge cells, so clients stay connected to a far AP (a "sticky client") at a low data rate, and the client's weaker transmitter cannot reach back as well as the AP can reach it. Good designs use moderate power, more APs, and disable the lowest data rates to encourage clients to move.</p>

<h3>Client disassociation</h3>
<p>Disassociation means the client drops off the AP. Causes to check: weak signal at the edge of a cell; the AP reaching its client limit; a DFS radar event moving the AP to another channel; aggressive power-save or old drivers on the client; authentication or key failures; and, on the security side, <b>deauthentication floods</b> from a malicious device. Defensively, wireless intrusion prevention (WIPS) detects them, and <b>Protected Management Frames (802.11w)</b>, mandatory with WPA3, stop forged deauthentication frames.</p>

<h3>Roaming misconfiguration</h3>
<p>Roaming is the client moving from one AP to another as the user walks. The <b>client</b> decides when to roam. It goes wrong when:</p>
<ul>
<li>The SSID is the same but the <b>security settings differ</b> between APs (one WPA2-Personal, one WPA3), so the client must fully re-authenticate or fails.</li>
<li>Different APs put the same SSID in <b>different VLANs/subnets</b>, so a roaming client gets a new IP address and every session drops.</li>
<li>Fast roaming features (<b>802.11r</b> fast transition, <b>802.11k</b> neighbour reports, <b>802.11v</b> transition management) are enabled on some APs only, or used with old clients that do not support them.</li>
<li>Minimum RSSI or band-steering thresholds are so aggressive that clients are kicked off before a better AP is available.</li>
</ul>
<pre class="out">Wi-Fi analyzer, conference wing
SSID        BSSID              Ch   Width  RSSI   Security
CORP        00:11:22:aa:01:10   1   20     -52    WPA3-Enterprise
CORP        00:11:22:aa:02:10  <span class="hl"> 3   20     -61    WPA2-Personal</span>
CORP        00:11:22:aa:03:10   6   20     -70    WPA3-Enterprise
CORP-5G     00:11:22:aa:01:20  36   80     -58    WPA3-Enterprise</pre>
<p>One scan shows two faults: AP 02 is on channel 3 (overlapping 1 and 6) and uses a different security mode from the others, which breaks roaming in that corridor.</p>

<div class="warn"><p><b>Common mistakes.</b> Turning every AP to maximum power "for better coverage". Using 40 MHz channels in 2.4 GHz. Judging Wi-Fi by signal bars alone without checking noise and SNR. Blaming the client first when one area has problems for every device.</p></div>

<div class="exam"><p><b>Exam traps.</b> Non-overlapping 2.4 GHz channels: 1, 6, 11. Overlapping channels cause adjacent-channel interference; the same channel causes co-channel contention. Microwaves interfere in 2.4 GHz. Clients drop when walking between APs = roaming misconfiguration (mismatched SSID settings or VLANs). SNR = signal minus noise.</p></div>

<div class="scn"><h4>The lunchtime Wi-Fi collapse</h4><p>Every day between 12:30 and 13:30, the office kitchen area lost Wi-Fi throughput, while the rest of the floor was fine. A Wi-Fi analyzer spectrum view showed a wide burst of energy across 2.4 GHz channels 6 to 11 whenever the microwave oven ran. Clients on the kitchen AP were on channel 11 in 2.4 GHz. The team enabled band steering so capable clients preferred 5 GHz, moved the kitchen AP's 2.4 GHz radio to channel 1, and asked facilities to replace a microwave with a damaged door seal.</p><p><b>Lesson:</b> a problem tied to a place and a time of day often points to a non-Wi-Fi interference source. A spectrum analyzer shows what a normal Wi-Fi scan cannot.</p></div>

<div class="iv"><p class="q">"Users say Wi-Fi drops every time they walk from one wing to another. How do you troubleshoot it?"</p><p>That is a roaming problem. Check that every AP broadcasts the SSID with identical security and authentication settings, maps it to the same VLAN (or supports layer 3 roaming), and has consistent 802.11r/k/v settings. Check overlap: there must be enough cell overlap (about -67 dBm at the edge) for the client to find the next AP before the old one fades. Then check the client drivers and minimum-RSSI settings. Mention using a Wi-Fi analyzer walk test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Co-channel interference shares airtime; adjacent-channel interference corrupts frames and is worse.</li>
<li>2.4 GHz non-overlapping channels are 1, 6, 11; wide channels in 5 GHz reduce independent channels.</li>
<li>Judge signal by RSSI and SNR: about -67 dBm and 25 dB SNR for voice.</li>
<li>Too much AP power causes sticky clients; too little causes dead zones.</li>
<li>Roaming breaks when SSID security, VLANs or 802.11r/k/v settings differ between APs; PMF (802.11w) blocks forged deauths.</li>
</ul></div>
`,hi:`
<p>Wi-Fi ek shared radio medium hai, isliye ismein wired ki har performance problem hai plus kuch apni. Aapne np-wireless mein channels plan kiye; ab aap aise Wi-Fi network ko diagnose karna seekhoge jo kaagaz par theek dikhta hai aur users ko bekaar lagta hai. Ek badi party socho. Sab log ek hi kamre (channel) mein baat karte hain. Agar do groups bahut paas khade hon to ek doosre ke upar bolte hain (interference aur channel overlap). Aap kisi se jitna door khade ho, use sunna utna mushkil (signal degradation). Kamre ke kuch kone chup hain (coverage holes). Aur groups ke beech jaana mushkil hai agar har group alag bhasha bole (roaming misconfiguration).</p>

<h3>Interference</h3>
<ul>
<li><b>Co-channel interference (CCI):</b> do APs <b>same</b> channel par ek doosre ki sunne ki doori mein. Wi-Fi polite hai: ek channel par ek time par sirf ek radio transmit kar sakta hai, isliye woh airtime share karte hain. Result contention aur slowness hai, corruption nahi.</li>
<li><b>Adjacent-channel interference (ACI):</b> APs <b>overlapping</b> channels par, jaise 2.4 GHz channels 1 aur 3. Woh ek doosre ke frames theek se nahi sun paate, isliye ek doosre ke upar bolte hain aur frames corrupt karte hain. ACI, CCI se bura hai.</li>
<li><b>Non-Wi-Fi interference:</b> 2.4 GHz mein microwave ovens, Bluetooth, cordless phones, video senders aur baby monitors; 5 GHz ke <b>DFS</b> channels par radar, jo AP ko turant channel chhodne par majboor karta hai aur uske clients disconnect karta hai.</li>
</ul>

<h3>Channel overlap</h3>
<p>2.4 GHz mein har 20 MHz channel kai channel numbers par phaila hota hai, isliye sirf <b>1, 6 aur 11</b> overlap nahi karte (zyada tar regions mein). 5 GHz mein kai non-overlapping 20 MHz channels hain, lekin unhe 40, 80 ya 160 MHz channels mein bond karne se woh jaldi khatam ho jaate hain. 6 GHz (Wi-Fi 6E aur Wi-Fi 7) kaafi aur saaf channels jodta hai.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="2.4 GHz channels 1 6 11 aur overlap">
<path d="M40 130 Q 100 30 160 130" fill="#bbf7d0" stroke="#64748b"/><text x="100" y="150" text-anchor="middle" class="svg-ink" font-size="13">Ch 1</text>
<path d="M90 130 Q 150 50 210 130" fill="none" stroke="#64748b" stroke-dasharray="4 3"/><text x="150" y="44" text-anchor="middle" class="svg-accent" font-size="12">Ch 3 overlap</text>
<path d="M240 130 Q 300 30 360 130" fill="#bae6fd" stroke="#64748b"/><text x="300" y="150" text-anchor="middle" class="svg-ink" font-size="13">Ch 6</text>
<path d="M440 130 Q 500 30 560 130" fill="#fde68a" stroke="#64748b"/><text x="500" y="150" text-anchor="middle" class="svg-ink" font-size="13">Ch 11</text>
<line x1="20" y1="130" x2="620" y2="130" stroke="#64748b"/>
</svg><p class="cap">2.4 GHz mein sirf 1, 6 aur 11 saaf hain. Channel 3 par AP, 1 aur 6 dono se overlap karta hai.</p></div>

<h3>Signal degradation</h3>
<p>Signal strength <b>RSSI</b> ke roop mein dBm mein naapi jaati hai (negative numbers; zero ke kareeb matlab zyada strong). Asal mein jo matter karta hai woh hai <b>signal-to-noise ratio (SNR)</b>: signal minus noise floor, dB mein.</p>
<table class="cmp"><tr><th>RSSI</th><th>Quality</th></tr>
<tr><td>-30 se -50 dBm</td><td>Excellent</td></tr>
<tr><td>-67 dBm</td><td>Voice aur video ke liye common minimum</td></tr>
<tr><td>-70 dBm</td><td>Web aur email ke liye acceptable</td></tr>
<tr><td>-80 dBm aur neeche</td><td>Kharab, unreliable</td></tr>
</table>
<p>Signal <b>distance</b> (free-space path loss) aur <b>obstacles</b> se kamzor hota hai: concrete aur brick walls, metal (lift shafts, filing cabinets), mirrored ya coated glass, paani (bhare hall mein log bhi). <b>Reflection</b> multipath paida karta hai, aur <b>absorption</b> signal kamzor karta hai.</p>
<div class="eg"><p><b>Worked example: kya -68 dBm kaafi hai?</b> Conference room ke paas ek user ko RSSI -68 dBm dikhta hai. Wi-Fi analyzer wahan noise floor -90 dBm dikhata hai, isliye SNR = -68 - (-90) = <b>22 dB</b>. Web browsing ke liye yeh theek hai; Wi-Fi calling ke liye zyada tar designs kam se kam -67 dBm aur lagbhag 25 dB SNR ka target rakhte hain. Bagal ke kamre mein ek video sender noise floor ko -78 dBm tak le jaata hai: SNR = 10 dB, aur connection bekaar ho jaata hai halaanki signal nahi badla. Fix noise source hatana hai, AP power badhana nahi.</p></div>

<h3>Coverage</h3>
<p>Coverage problems dono taraf kaat-ti hain. <b>Bahut kam</b>: stairwells, warehouses ya lift shafts ke peeche dead zones, site survey se milte hain. <b>Bahut zyada</b>: full power par APs bade cells cover karte hain, isliye clients door wale AP se low data rate par jude rehte hain ("sticky client"), aur client ka kamzor transmitter utni achhi tarah wapas nahi pahunch paata jitna AP use pahunchta hai. Achhe designs moderate power, zyada APs use karte hain, aur clients ko move karne ke liye sabse kam data rates disable karte hain.</p>

<h3>Client disassociation</h3>
<p>Disassociation matlab client AP se gir jaata hai. Check karne ke causes: cell ke edge par kamzor signal; AP ka client limit tak pahunchna; DFS radar event jo AP ko doosre channel par le jaaye; client par aggressive power-save ya purane drivers; authentication ya key failures; aur, security side par, kisi malicious device se <b>deauthentication floods</b>. Defensively, wireless intrusion prevention (WIPS) inhe detect karta hai, aur <b>Protected Management Frames (802.11w)</b>, jo WPA3 ke saath mandatory hai, forged deauthentication frames rokta hai.</p>

<h3>Roaming misconfiguration</h3>
<p>Roaming matlab user ke chalte waqt client ka ek AP se doosre AP par jaana. Kab roam karna hai yeh <b>client</b> decide karta hai. Yeh tab bigadta hai jab:</p>
<ul>
<li>SSID same hai lekin APs ke beech <b>security settings alag</b> hain (ek WPA2-Personal, ek WPA3), isliye client ko poora re-authenticate karna padta hai ya fail hota hai.</li>
<li>Alag APs same SSID ko <b>alag VLANs/subnets</b> mein daalte hain, isliye roam karne wale client ko naya IP address milta hai aur har session drop hota hai.</li>
<li>Fast roaming features (<b>802.11r</b> fast transition, <b>802.11k</b> neighbour reports, <b>802.11v</b> transition management) sirf kuch APs par enabled hain, ya purane clients ke saath use ho rahe hain jo inhe support nahi karte.</li>
<li>Minimum RSSI ya band-steering thresholds itne aggressive hain ki behtar AP milne se pehle clients nikaal diye jaate hain.</li>
</ul>
<pre class="out">Wi-Fi analyzer, conference wing
SSID        BSSID              Ch   Width  RSSI   Security
CORP        00:11:22:aa:01:10   1   20     -52    WPA3-Enterprise
CORP        00:11:22:aa:02:10  <span class="hl"> 3   20     -61    WPA2-Personal</span>
CORP        00:11:22:aa:03:10   6   20     -70    WPA3-Enterprise
CORP-5G     00:11:22:aa:01:20  36   80     -58    WPA3-Enterprise</pre>
<p>Ek scan do faults dikhata hai: AP 02 channel 3 par hai (1 aur 6 se overlap) aur baaki se alag security mode use karta hai, jo us corridor mein roaming tod deta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> "Behtar coverage" ke liye har AP ko maximum power par karna. 2.4 GHz mein 40 MHz channels use karna. Noise aur SNR check kiye bina sirf signal bars se Wi-Fi judge karna. Jab ek area mein har device ko problem ho tab pehle client ko blame karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Non-overlapping 2.4 GHz channels: 1, 6, 11. Overlapping channels adjacent-channel interference laate hain; same channel co-channel contention. Microwaves 2.4 GHz mein interfere karte hain. APs ke beech chalte hue clients drop = roaming misconfiguration (mismatched SSID settings ya VLANs). SNR = signal minus noise.</p></div>

<div class="scn"><h4>Lunchtime ka Wi-Fi collapse</h4><p>Roz 12:30 se 13:30 ke beech office kitchen area ka Wi-Fi throughput gir jaata tha, jabki baaki floor theek tha. Wi-Fi analyzer ke spectrum view ne microwave oven chalne par 2.4 GHz channels 6 se 11 tak energy ka chauda burst dikhaya. Kitchen AP ke clients 2.4 GHz mein channel 11 par the. Team ne band steering enable ki taaki capable clients 5 GHz pasand karein, kitchen AP ka 2.4 GHz radio channel 1 par le gaye, aur facilities se damaged door seal wala microwave badalne ko kaha.</p><p><b>Seekh:</b> jagah aur din ke time se judi problem aksar non-Wi-Fi interference source ki taraf ishara karti hai. Spectrum analyzer woh dikhata hai jo normal Wi-Fi scan nahi dikha sakta.</p></div>

<div class="iv"><p class="q">"Users kehte hain ek wing se doosre wing jaate waqt har baar Wi-Fi drop hota hai. Kaise troubleshoot karoge?"</p><p>Yeh roaming problem hai. Check karo ki har AP SSID ko identical security aur authentication settings ke saath broadcast karta hai, use same VLAN par map karta hai (ya layer 3 roaming support karta hai), aur consistent 802.11r/k/v settings rakhta hai. Overlap check karo: cell overlap itna hona chahiye (edge par lagbhag -67 dBm) ki client purane AP ke fade hone se pehle agla AP dhoondh le. Phir client drivers aur minimum-RSSI settings check karo. Wi-Fi analyzer walk test use karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Co-channel interference airtime share karta hai; adjacent-channel interference frames corrupt karta hai aur zyada bura hai.</li>
<li>2.4 GHz ke non-overlapping channels 1, 6, 11 hain; 5 GHz mein wide channels independent channels kam karte hain.</li>
<li>Signal ko RSSI aur SNR se judge karo: voice ke liye lagbhag -67 dBm aur 25 dB SNR.</li>
<li>Bahut zyada AP power sticky clients laati hai; bahut kam dead zones.</li>
<li>Roaming tab tootti hai jab APs ke beech SSID security, VLANs ya 802.11r/k/v settings alag hon; PMF (802.11w) forged deauths rokta hai.</li>
</ul></div>
`}};export{e as default};