var e={id:`fast-roaming-rkv`,h:{en:`Fast roaming in depth: 802.11r, 802.11k, 802.11v, OKC and PMK caching`,hi:`Fast roaming gehraai se: 802.11r, 802.11k, 802.11v, OKC aur PMK caching`},body:{en:`
<div class="note"><p><b>Concept only.</b> The simulator never sends Fast Transition, neighbour report or BSS transition frames, and a roam in the simulator does not authenticate differently. Everything here is real Catalyst 9800 behaviour for the exam and for production, taught with configuration and reading material but no lab. The wl-roaming module introduced the three amendments; here we look at the keys, the frames and the controller settings.</p></div>

<h3>The problem: the security handshake is the slow part</h3>
<p>Moving between two APs takes a few milliseconds of radio time. What takes long is proving to the new AP who you are. With WPA2 or WPA3 Personal the client and AP run the four-way handshake only; with 802.1X Enterprise the client first runs EAP against RADIUS and obtains a <b>PMK</b> (pairwise master key), and only then does the four-way handshake. A full EAP exchange often needs 100 to 500 ms or more. Fast roaming means <b>re-using key material</b> so that the new AP does not need the full EAP.</p>

<h3>802.11r: Fast BSS Transition (FT)</h3>
<p>802.11r builds a small <b>key hierarchy</b> so that the keys for the next AP can be derived <i>before</i> the client moves.</p>
<ul>
<li><b>PMK-R0</b> is derived once, after the first full authentication, and held by the <b>R0 key holder (R0KH)</b>. On a 9800 network this is the controller (and, inside a mobility group, the controllers that share it).</li>
<li><b>PMK-R1</b> is derived from PMK-R0 for each AP and handed to the <b>R1 key holder (R1KH)</b>, the AP the client may move to.</li>
<li><b>PTK</b>, the traffic key, comes from PMK-R1 during a two-message or four-message FT exchange, so the roam needs only the authentication and reassociation frames you already had.</li>
</ul>
<p>The clients and APs that form one fast-roaming area share a <b>Mobility Domain Identifier (MDID)</b> in the beacon. A client sees the MDID and knows it may use FT between those APs.</p>
<table class="cmp"><tr><th>FT mode</th><th>How the client reaches the target AP</th><th>Notes</th></tr>
<tr><td>Over-the-air</td><td>Directly: authentication frame to the target AP, then reassociation</td><td>Default, widely supported</td></tr>
<tr><td>Over-the-DS</td><td>Through the current AP and the controller, then reassociation</td><td>Rarely better; some clients mishandle it</td></tr>
</table>
<p>The two big design choices are the WLAN <b>AKM</b> (authentication and key management) and who must support FT. Enabling FT as <b>mandatory</b> lets only FT-capable clients join. Many older clients and some IoT devices fail. The 9800 therefore offers an <b>adaptive</b> mode, which advertises FT only to clients known to handle it (it was designed for Apple devices) while leaving other clients on normal AKMs. Cisco recommends mixed or adaptive deployment unless every client is FT capable.</p>

<h3>The 9800 WLAN settings (reading material)</h3>
<pre class="code"><span class="c">! 11r on a WLAN: the WLAN must be shut down for security edits</span>
wlan NK-STAFF 1 NK-STAFF
 shutdown
 security ft adaptive
 security wpa akm ft psk
 <span class="c">! or, for enterprise: security wpa akm ft dot1x</span>
 no shutdown
<span class="c">! 11k and 11v on the same WLAN</span>
 assisted-roaming neighbor-list
 assisted-roaming prediction
 bss-transition</pre>
<p>Command names are as in the Catalyst 9800 configuration guide; check the guide for your release because options such as <code>over-the-ds</code> and the reassociation timer differ between versions. In the web UI the same options live under <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b>, in the WLAN's Security and Advanced tabs.</p>

<h3>802.11k: radio resource management (neighbour reports)</h3>
<p>A scanning client leaves its channel, listens for beacons and loses traffic while it does so. With 802.11k the client sends a <b>neighbour report request</b> and the AP replies with a list of nearby APs: BSSID, channel, and sometimes a preference. The client scans only those channels, so it finds the next AP faster and wastes less battery. The 9800 builds the list from RRM data. <b>Prediction</b> lists restrict the answer to APs the client is likely to reach, based on its location.</p>

<h3>802.11v: BSS Transition Management</h3>
<p>802.11v lets the AP send the client a <b>BSS transition management request</b>: a suggestion, with candidate APs, to move now. A <b>disassociation imminent</b> flag says the AP will kick the client soon. The client may follow or ignore it. 802.11v is the standard way to move sticky clients and to balance load, with no forced deauthentication.</p>

<h3>PMK caching, OKC and CCKM</h3>
<ul>
<li><b>PMK caching</b>: a client that returns to an AP it has already authenticated with reuses the stored PMK. This helps only when it comes back.</li>
<li><b>OKC (opportunistic key caching)</b>: the controller shares the PMK with the other APs it manages, so a client moving to any AP on that controller skips EAP. It works inside one controller and across controllers in one mobility group, but only for clients that support it.</li>
<li><b>CCKM</b>: a Cisco key scheme older than 802.11r, supported by older Cisco clients and phones, still seen in legacy designs.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="FT key hierarchy">
<rect x="20" y="10" width="190" height="34" rx="6" fill="#fde68a"/><text x="115" y="32" text-anchor="middle" class="svg-ink" font-size="13">Full 802.1X or SAE: PMK</text>
<rect x="225" y="10" width="190" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">PMK-R0 at controller (R0KH)</text>
<rect x="430" y="10" width="190" height="34" rx="6" fill="#bae6fd"/><text x="525" y="32" text-anchor="middle" class="svg-ink" font-size="13">PMK-R1 per AP (R1KH)</text>
<line x1="210" y1="27" x2="225" y2="27" stroke="#64748b"/><line x1="415" y1="27" x2="430" y2="27" stroke="#64748b"/>
<rect x="430" y="90" width="190" height="34" rx="6" fill="#bbf7d0"/><text x="525" y="112" text-anchor="middle" class="svg-ink" font-size="13">PTK for the new AP</text>
<line x1="525" y1="44" x2="525" y2="90" stroke="#64748b"/>
<text x="20" y="160" class="svg-muted" font-size="12">One full authentication, then every roam inside the mobility domain only needs the FT exchange.</text>
</svg><p class="cap">Simplified FT key chain. The R0 keys must be reachable by every controller a client may roam to, which is why the controllers belong in one mobility group.</p></div>

<div class="eg"><p><b>Worked example.</b> A hospital voice WLAN uses 802.1X with FT. Full authentication on the first AP takes 280 ms. After that, each roam between any of 40 APs on two controllers in one mobility group takes about 20 to 40 ms because the target AP derives PMK-R1 locally. The same design with the controllers in <i>different</i> mobility groups made the keys unreachable: roams between controllers fell back to a full EAP exchange.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling mandatory FT on an SSID used by older scanners or IoT devices (they stop joining). Forgetting that FT needs the WLAN shut down while you change security. Assuming FT helps a hard roam: it cannot, because without a mobility peer there is no key sharing.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.11k provides <i>information</i> (neighbour list), 802.11v provides a <i>suggestion</i> (transition request), 802.11r provides a <i>faster key exchange</i>. None of them forces a roam and none of them replaces the client decision.</p></div>

<div class="scn"><h4>Phones fine, scanners dead</h4><p>After enabling mandatory 802.11r on the warehouse SSID to fix choppy voice, barcode scanners stopped associating. The scanners were four years old and did not support FT AKMs. The engineer switched the WLAN to adaptive FT with the normal PSK AKM still enabled. Phones kept fast roams and the scanners came back.</p><p><b>Lesson:</b> check the client list before making a security feature mandatory.</p></div>

<div class="iv"><p class="q">"What do 802.11r, k and v each do, and which one would you enable first for sticky clients?"</p><p>r speeds the key exchange; k gives the client a neighbour list so it scans less; v lets the AP suggest a better AP. For sticky clients start with v (BSS transition) and k, because they influence the decision and the scan; add r when the problem is the authentication delay, and enable it in adaptive or mixed mode unless every client supports it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The slow part of a roam is the security handshake; fast roaming re-uses keys.</li>
<li>802.11r has PMK-R0 and PMK-R1 and shares an MDID; over-the-air is the usual mode.</li>
<li>802.11k = neighbour list, 802.11v = transition suggestion; neither forces a roam.</li>
<li>OKC and PMK caching share keys inside a controller or mobility group; CCKM is legacy.</li>
<li>Use adaptive or mixed FT unless all clients are FT capable.</li>
<li>All of this is concept only in the simulator.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Concept only.</b> Simulator kabhi Fast Transition, neighbour report ya BSS transition frames nahi bhejta, aur simulator mein roam alag tareeke se authenticate nahi karta. Yahan jo kuch hai woh asli Catalyst 9800 behaviour hai, exam aur production ke liye, configuration aur reading material ke saath, lab ke bina. wl-roaming module ne teen amendments introduce kiye the; yahan hum keys, frames aur controller settings dekhte hain.</p></div>

<h3>Problem: security handshake slow hissa hai</h3>
<p>Do APs ke beech move karne mein radio time sirf kuch milliseconds ka hota hai. Jo der lagata hai woh naye AP ko yeh sabit karna ki aap kaun ho. WPA2 ya WPA3 Personal mein client aur AP sirf four-way handshake chalate hain; 802.1X Enterprise mein client pehle RADIUS ke against EAP chalata hai aur ek <b>PMK</b> (pairwise master key) paata hai, aur uske baad four-way handshake. Poora EAP exchange aksar 100 se 500 ms ya zyada leta hai. Fast roaming ka matlab hai <b>key material dobara use karna</b> taaki naye AP ko poora EAP na chalana pade.</p>

<h3>802.11r: Fast BSS Transition (FT)</h3>
<p>802.11r ek chhota <b>key hierarchy</b> banata hai taaki agle AP ki keys client ke move karne <i>se pehle</i> derive ho sakein.</p>
<ul>
<li><b>PMK-R0</b> pehli full authentication ke baad ek baar derive hota hai aur <b>R0 key holder (R0KH)</b> ke paas rehta hai. 9800 network mein yeh controller hai (aur mobility group ke andar woh controllers jo ise share karte hain).</li>
<li><b>PMK-R1</b> har AP ke liye PMK-R0 se derive hota hai aur <b>R1 key holder (R1KH)</b> ko diya jata hai, yaani us AP ko jahan client move kar sakta hai.</li>
<li><b>PTK</b>, traffic key, PMK-R1 se FT exchange ke dauran aati hai, isliye roam ko sirf wahi authentication aur reassociation frames chahiye jo pehle se the.</li>
</ul>
<p>Ek fast-roaming area ke clients aur APs beacon mein ek <b>Mobility Domain Identifier (MDID)</b> share karte hain. Client MDID dekh kar jaan leta hai ki in APs ke beech FT use kar sakta hai.</p>
<table class="cmp"><tr><th>FT mode</th><th>Client target AP tak kaise pahunchta hai</th><th>Notes</th></tr>
<tr><td>Over-the-air</td><td>Seedha: target AP ko authentication frame, phir reassociation</td><td>Default, widely supported</td></tr>
<tr><td>Over-the-DS</td><td>Current AP aur controller ke through, phir reassociation</td><td>Kam hi behtar; kuch clients galat handle karte hain</td></tr>
</table>
<p>Do bade design choices hain: WLAN ka <b>AKM</b> (authentication and key management) aur kis ko FT support karna zaroori hai. FT ko <b>mandatory</b> karne par sirf FT-capable clients join kar sakte hain. Kai purane clients aur kuch IoT devices fail ho jaate hain. Isiliye 9800 <b>adaptive</b> mode deta hai, jo FT sirf un clients ko advertise karta hai jo use handle karne ke liye jaane jaate hain (yeh Apple devices ke liye design hua tha) aur baaki clients ko normal AKMs par rehne deta hai. Cisco mixed ya adaptive deployment recommend karta hai jab tak har client FT capable na ho.</p>

<h3>9800 WLAN settings (reading material)</h3>
<pre class="code"><span class="c">! WLAN par 11r: security edit ke liye WLAN shut hona chahiye</span>
wlan NK-STAFF 1 NK-STAFF
 shutdown
 security ft adaptive
 security wpa akm ft psk
 <span class="c">! ya enterprise ke liye: security wpa akm ft dot1x</span>
 no shutdown
<span class="c">! usi WLAN par 11k aur 11v</span>
 assisted-roaming neighbor-list
 assisted-roaming prediction
 bss-transition</pre>
<p>Command names Catalyst 9800 configuration guide ke hisaab se hain; apni release ke liye guide check karo kyunki <code>over-the-ds</code> aur reassociation timer jaise options versions ke beech alag hote hain. Web UI mein yahi options <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b> mein WLAN ke Security aur Advanced tabs mein hain.</p>

<h3>802.11k: radio resource management (neighbour reports)</h3>
<p>Scan karne wala client apna channel chhodta hai, beacons sunta hai aur is dauran traffic kho deta hai. 802.11k mein client <b>neighbour report request</b> bhejta hai aur AP paas ke APs ki list se jawab deta hai: BSSID, channel, aur kabhi kabhi preference. Client sirf unhi channels ko scan karta hai, isliye agla AP jaldi dhundta hai aur battery kam kharch hoti hai. 9800 yeh list RRM data se banata hai. <b>Prediction</b> lists jawab ko un APs tak limit karti hain jinhe client apni location ke hisaab se paane ki sambhavna rakhta hai.</p>

<h3>802.11v: BSS Transition Management</h3>
<p>802.11v AP ko client ko <b>BSS transition management request</b> bhejne deta hai: candidate APs ke saath ek suggestion ki abhi move karo. <b>Disassociation imminent</b> flag batata hai ki AP jaldi client ko kick karega. Client follow kar sakta hai ya ignore. Sticky clients ko move karne aur load balance karne ka standard tareeka 802.11v hai, bina forced deauthentication ke.</p>

<h3>PMK caching, OKC aur CCKM</h3>
<ul>
<li><b>PMK caching</b>: jo client us AP par wapas aata hai jiske saath woh pehle authenticate ho chuka hai woh stored PMK dobara use karta hai. Yeh sirf tab madad karta hai jab woh wapas aaye.</li>
<li><b>OKC (opportunistic key caching)</b>: controller PMK ko apne baaki APs ke saath share karta hai, isliye us controller ke kisi bhi AP par move karne wala client EAP skip karta hai. Yeh ek controller ke andar aur ek mobility group ke controllers ke beech kaam karta hai, lekin sirf un clients ke liye jo support karte hain.</li>
<li><b>CCKM</b>: 802.11r se purani Cisco key scheme, purane Cisco clients aur phones support karte hain, legacy designs mein abhi bhi dikhti hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="FT key hierarchy">
<rect x="20" y="10" width="190" height="34" rx="6" fill="#fde68a"/><text x="115" y="32" text-anchor="middle" class="svg-ink" font-size="13">Full 802.1X ya SAE: PMK</text>
<rect x="225" y="10" width="190" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">PMK-R0 controller par (R0KH)</text>
<rect x="430" y="10" width="190" height="34" rx="6" fill="#bae6fd"/><text x="525" y="32" text-anchor="middle" class="svg-ink" font-size="13">PMK-R1 har AP par (R1KH)</text>
<line x1="210" y1="27" x2="225" y2="27" stroke="#64748b"/><line x1="415" y1="27" x2="430" y2="27" stroke="#64748b"/>
<rect x="430" y="90" width="190" height="34" rx="6" fill="#bbf7d0"/><text x="525" y="112" text-anchor="middle" class="svg-ink" font-size="13">Naye AP ke liye PTK</text>
<line x1="525" y1="44" x2="525" y2="90" stroke="#64748b"/>
<text x="20" y="160" class="svg-muted" font-size="12">Ek full authentication, phir mobility domain ke andar har roam ko sirf FT exchange chahiye.</text>
</svg><p class="cap">Simplified FT key chain. R0 keys un sab controllers tak pahunchni chahiye jahan client roam kar sakta hai, isiliye controllers ek mobility group mein hote hain.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek hospital ka voice WLAN FT ke saath 802.1X use karta hai. Pehle AP par full authentication 280 ms leta hai. Uske baad ek mobility group ke do controllers ke 40 APs ke beech har roam lagbhag 20 se 40 ms leta hai kyunki target AP PMK-R1 locally derive karta hai. Wahi design jab controllers <i>alag</i> mobility groups mein the to keys pahunch se bahar thi: controllers ke beech roams wapas full EAP exchange par gir gaye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Purane scanners ya IoT devices wale SSID par mandatory FT enable karna (woh join karna band kar dete hain). Yeh bhoolna ki security badalte waqt WLAN shut hona chahiye. Yeh maan lena ki FT hard roam mein madad karta hai: nahi karta, kyunki mobility peer ke bina key sharing nahi hoti.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.11k <i>information</i> deta hai (neighbour list), 802.11v <i>suggestion</i> deta hai (transition request), 802.11r <i>tez key exchange</i> deta hai. Inme se koi roam force nahi karta aur koi client ke decision ki jagah nahi leta.</p></div>

<div class="scn"><h4>Phones theek, scanners band</h4><p>Choppy voice theek karne ke liye warehouse SSID par mandatory 802.11r enable karne ke baad barcode scanners associate hona band ho gaye. Scanners chaar saal purane the aur FT AKMs support nahi karte the. Engineer ne WLAN ko adaptive FT par switch kiya aur normal PSK AKM bhi enabled rakha. Phones ko fast roams mile aur scanners wapas aa gaye.</p><p><b>Lesson:</b> koi security feature mandatory karne se pehle client list check karo.</p></div>

<div class="iv"><p class="q">"802.11r, k aur v har ek kya karta hai, aur sticky clients ke liye aap pehle kaunsa enable karoge?"</p><p>r key exchange tez karta hai; k client ko neighbour list deta hai taaki woh kam scan kare; v AP ko behtar AP suggest karne deta hai. Sticky clients ke liye v (BSS transition) aur k se shuru karo, kyunki woh decision aur scan ko influence karte hain; r tab jodo jab problem authentication delay ho, aur use adaptive ya mixed mode mein enable karo jab tak har client support na kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roam ka slow hissa security handshake hai; fast roaming keys dobara use karta hai.</li>
<li>802.11r mein PMK-R0 aur PMK-R1 hain aur MDID share hota hai; over-the-air usual mode hai.</li>
<li>802.11k = neighbour list, 802.11v = transition suggestion; koi roam force nahi karta.</li>
<li>OKC aur PMK caching ek controller ya mobility group ke andar keys share karte hain; CCKM legacy hai.</li>
<li>Jab tak sab clients FT capable na hon, adaptive ya mixed FT use karo.</li>
<li>Yeh sab simulator mein concept only hai.</li>
</ul></div>
`}};export{e as default};