var e={id:`flexconnect-wan-failure`,h:{en:`WAN failure and FlexConnect: designing branches that survive`,hi:`WAN failure aur FlexConnect: aise branches design karna jo bach jaayein`},body:{en:`
<h3>The case: Brightway Retail</h3>
<p>Brightway Retail has 140 stores, each with 4 to 8 APs. The two data centres hold a Catalyst 9800 SSO pair. Each store reaches them over one broadband circuit with an LTE backup. Handheld scanners and the point-of-sale (POS) tablets use an 802.1X SSID authenticated against central RADIUS servers. Guests use a central-switched guest SSID.</p>
<p>On the busiest Saturday of the year, an ISP cut took out 31 stores' primary circuits for three hours. The devices that were already connected stayed up, but any scanner that rebooted or roamed could not log back in, the guest Wi-Fi vanished, and some stores were forced to take card payments by phone. The cause was not the WAN. It was a design that assumed the WAN would always be there.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>POS and scanner Wi-Fi must work for new and existing devices during a WAN outage.</li>
<li>Guests may lose the internet when the WAN is down, but staff traffic to store servers should not.</li>
<li>One configuration for 140 stores; no per-store engineering.</li>
<li>Cost: no controller in each store. Only one extra RADIUS path is allowed.</li>
</ul>

<h3>How FlexConnect behaves when the WAN fails</h3>
<p>A <b>FlexConnect</b> AP has two modes. In <b>connected mode</b> it keeps a CAPWAP control tunnel to the controller. In <b>standalone mode</b>, which starts when it can no longer reach any controller, the AP keeps serving clients by itself using its cached configuration. What continues depends on how each WLAN was designed:</p>
<table class="cmp"><tr><th>WLAN design</th><th>Existing clients</th><th>New clients in standalone mode</th></tr>
<tr><td>Central switching, central auth</td><td>Dropped (data path is the tunnel)</td><td>Cannot join</td></tr>
<tr><td>Local switching, PSK or open</td><td>Keep working</td><td>Can join</td></tr>
<tr><td>Local switching, 802.1X, central RADIUS only</td><td>Keep working</td><td>Cannot authenticate</td></tr>
<tr><td>Local switching, 802.1X, backup RADIUS or local authentication</td><td>Keep working</td><td>Can authenticate if the backup is reachable</td></tr>
</table>
<p>Two tools help the 802.1X case. A <b>FlexConnect group</b> (a Flex profile on the 9800, with a policy that maps VLANs to the WLANs) groups the APs of one store so they share keys. With <b>OKC or CCKM fast roaming</b> the controller distributes the cached keys to the group while connected, so clients roam inside the store without going back to RADIUS. For new logins, the group can hold <b>primary and secondary backup RADIUS servers</b> that the AP contacts directly, and some platforms support <b>local authentication</b> on the AP for specific EAP methods. Check the supported methods for your release before relying on it.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Store in standalone mode">
<rect x="20" y="40" width="270" height="190" rx="12" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/><text x="155" y="30" text-anchor="middle" class="svg-ink" font-size="13">Store 118 (Flex group)</text>
<rect x="40" y="60" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="85" y="83" text-anchor="middle" class="svg-ink" font-size="13">Flex AP</text>
<rect x="40" y="115" width="90" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="138" text-anchor="middle" class="svg-ink" font-size="13">Store switch</text>
<rect x="160" y="60" width="110" height="36" rx="8" fill="#ddd6fe"/><text x="215" y="83" text-anchor="middle" class="svg-ink" font-size="13">Store servers</text>
<rect x="160" y="115" width="110" height="36" rx="8" fill="#fde68a"/><text x="215" y="138" text-anchor="middle" class="svg-ink" font-size="13">Backup RADIUS</text>
<rect x="40" y="170" width="90" height="36" rx="8" fill="#fed7aa"/><text x="85" y="193" text-anchor="middle" class="svg-ink" font-size="13">Scanner</text>
<line x1="85" y1="96" x2="85" y2="115" stroke="#64748b" stroke-width="2"/><line x1="130" y1="133" x2="160" y2="133" stroke="#64748b" stroke-width="2"/><line x1="130" y1="78" x2="160" y2="78" stroke="#64748b" stroke-width="2"/><line x1="85" y1="170" x2="85" y2="151" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="290" y1="110" x2="400" y2="110" stroke="#ef4444" stroke-width="3"/><line x1="332" y1="96" x2="358" y2="124" stroke="#ef4444" stroke-width="3"/><line x1="358" y1="96" x2="332" y2="124" stroke="#ef4444" stroke-width="3"/><text x="345" y="150" text-anchor="middle" class="svg-ink" font-size="12">WAN down</text>
<rect x="400" y="60" width="220" height="100" rx="12" fill="#bae6fd"/><text x="510" y="100" text-anchor="middle" class="svg-ink" font-size="13">Data centres</text><text x="510" y="122" text-anchor="middle" class="svg-muted" font-size="12">9800 SSO pair + central RADIUS</text>
<rect x="20" y="248" width="14" height="14" fill="#bbf7d0"/><text x="40" y="260" class="svg-muted" font-size="12">AP</text>
<rect x="90" y="248" width="14" height="14" fill="#ddd6fe"/><text x="110" y="260" class="svg-muted" font-size="12">Local service</text>
<rect x="210" y="248" width="14" height="14" fill="#fde68a"/><text x="230" y="260" class="svg-muted" font-size="12">Backup auth</text>
<rect x="320" y="248" width="14" height="14" fill="#bae6fd"/><text x="340" y="260" class="svg-muted" font-size="12">Central</text>
</svg><p class="cap">With local switching and a reachable backup RADIUS, the store keeps working when the WAN is cut.</p></div>

<h3>Options considered</h3>
<table class="cmp"><tr><th>Option</th><th>WAN outage result</th><th>Cost and risk</th></tr>
<tr><td>A. Local mode APs over WAN</td><td>Whole store dark</td><td>Cheap; fails the brief</td></tr>
<tr><td>B. FlexConnect, central switching</td><td>Existing clients drop</td><td>Simple, but no survival</td></tr>
<tr><td>C. FlexConnect, local switching, central auth only</td><td>Data works, new logins fail</td><td>This was the original design</td></tr>
<tr><td>D. FlexConnect, local switching, backup RADIUS or local auth, central-switched guest</td><td>Staff works, guests pause</td><td>Needs one extra RADIUS path</td></tr>
</table>

<h3>The chosen design</h3>
<p>Brightway picks option D. Staff, POS and scanner WLANs are <b>locally switched</b> in store VLANs, so traffic goes to store servers and the payment gateway without hairpinning through a data centre. Each store's Flex group lists a <b>secondary RADIUS server</b> reachable over the LTE path through the VPN and, where the EAP method allows it, local authentication for the scanner profile. Fast roaming keys are distributed inside the group. The guest WLAN stays centrally switched, because guests are anchored for policy, and it is accepted that guest access pauses during an outage. One AP-side requirement is added: the VLAN IDs for each WLAN must exist on the store switch trunk, because a missing VLAN is the most common standalone failure.</p>
<div class="eg"><p><b>WAN sizing.</b> Control traffic between a Flex AP and the controller is light, but Cisco design guidance asks for a round-trip time of up to about 100 ms when voice is used and about 300 ms for data only, with a bare minimum on the order of 12.8 kbps per AP. A store with 8 APs therefore needs roughly 100 kbps for control, plus whatever the staff and guest traffic needs. Size the LTE backup for the same.</p></div>
<pre class="out">STANDALONE TEST SHEET - Store 118 (WAN cable pulled)
Existing scanner, staff SSID, local switching ...... stays connected   PASS
New scanner joins staff SSID (backup RADIUS) ....... authenticates     <span class="hl">PASS</span>
Guest SSID (central switching) ..................... unavailable      EXPECTED
AP reboot while WAN down ........................... returns to service PASS
WAN restored: AP returns to connected mode ......... no client drop    PASS</pre>

<div class="warn"><p><b>Post-mortem lessons.</b> (1) Local switching fixes the data path, not authentication; test both. (2) The backup RADIUS server must itself be reachable when the WAN is down, so it must be inside the store or on the LTE VPN path, not behind the cut link. (3) A Flex group that is too large increases key distribution load; keep groups to a store or a cluster of stores.</p></div>
<div class="exam"><p><b>Exam traps.</b> Standalone mode keeps local-switched WLANs but drops central-switched ones. Central-auth clients cannot join in standalone mode unless backup RADIUS or local auth exists. Fast roaming in a Flex group relies on keys distributed while connected.</p></div>

<div class="scn"><h4>The missing VLAN</h4><p>After a planned WAN test at a pilot store, staff Wi-Fi associated but received no IP address. The AP was in standalone mode and tagged traffic into VLAN 120, but the store switch trunk only carried VLAN 10. In connected mode the controller had hidden the issue because everything tunnelled. The fix was to add the VLAN to the trunk and to make the VLAN check part of the store build checklist.</p><p><b>Lesson:</b> a Flex deployment must be tested with the WAN cable pulled, not only with the controller up.</p></div>

<div class="iv"><p class="q">"A WAN link to a branch fails. What happens to wireless there?"</p><p>Strong answer: it depends on the WLAN design. Local-switched WLANs keep existing clients working in standalone mode; central-switched WLANs drop. New 802.1X clients need a reachable backup RADIUS server or local authentication. Mention testing with the WAN pulled and the VLAN trunk requirement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FlexConnect standalone mode keeps locally switched WLANs alive when the controller is unreachable.</li>
<li>Central switching and central-only authentication do not survive a WAN outage.</li>
<li>Use Flex groups for key distribution and backup RADIUS or local authentication for new logins.</li>
<li>Backup services must sit on the store side of the failure, or on a different path.</li>
<li>Test with the WAN pulled; check VLANs on the store trunk.</li>
</ul></div>
`,hi:`
<h3>Case: Brightway Retail</h3>
<p>Brightway Retail ke 140 stores hain, har store mein 4 se 8 APs. Do data centres mein Catalyst 9800 SSO pair hai. Har store ek broadband circuit aur LTE backup se unse judta hai. Handheld scanners aur point-of-sale (POS) tablets 802.1X SSID use karte hain jo central RADIUS servers se authenticate hota hai. Guests central-switched guest SSID use karte hain.</p>
<p>Saal ke sabse busy Saturday ko ek ISP cut ne 31 stores ke primary circuits teen ghante ke liye gira diye. Jo devices pehle se connected the woh chalte rahe, lekin jo scanner reboot hua ya roam hua woh dobara login nahi kar paya, guest Wi-Fi gayab ho gaya, aur kuch stores ko card payments phone par lene pade. Wajah WAN nahi thi. Wajah woh design thi jo maan ke chalti thi ki WAN hamesha rahega.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>WAN outage mein POS aur scanner Wi-Fi naye aur existing dono devices ke liye chalna chahiye.</li>
<li>WAN down hone par guests ka internet ja sakta hai, lekin staff ka store servers tak traffic nahi jaana chahiye.</li>
<li>140 stores ke liye ek configuration; per-store engineering nahi.</li>
<li>Cost: har store mein controller nahi. Sirf ek extra RADIUS path allowed hai.</li>
</ul>

<h3>WAN fail hone par FlexConnect kaise behave karta hai</h3>
<p><b>FlexConnect</b> AP ke do modes hote hain. <b>Connected mode</b> mein woh controller se CAPWAP control tunnel rakhta hai. <b>Standalone mode</b> tab shuru hota hai jab woh kisi controller tak pahunch nahi paata; tab AP apni cached configuration se khud clients ko serve karta rehta hai. Kya chalta hai yeh har WLAN ke design par depend karta hai:</p>
<table class="cmp"><tr><th>WLAN design</th><th>Existing clients</th><th>Standalone mode mein naye clients</th></tr>
<tr><td>Central switching, central auth</td><td>Drop (data path tunnel hai)</td><td>Join nahi kar sakte</td></tr>
<tr><td>Local switching, PSK ya open</td><td>Chalte rehte hain</td><td>Join kar sakte hain</td></tr>
<tr><td>Local switching, 802.1X, sirf central RADIUS</td><td>Chalte rehte hain</td><td>Authenticate nahi kar sakte</td></tr>
<tr><td>Local switching, 802.1X, backup RADIUS ya local authentication</td><td>Chalte rehte hain</td><td>Backup reachable ho to authenticate kar sakte hain</td></tr>
</table>
<p>802.1X case mein do tools madad karte hain. <b>FlexConnect group</b> (9800 par Flex profile, VLANs ko WLANs se map karne wali policy ke saath) ek store ke APs ko group karta hai taaki woh keys share karein. <b>OKC ya CCKM fast roaming</b> ke saath controller connected rehte hue cached keys group ko distribute karta hai, isliye clients store ke andar RADIUS tak wapas gaye bina roam karte hain. Naye logins ke liye group mein <b>primary aur secondary backup RADIUS servers</b> ho sakte hain jinse AP seedha baat karta hai, aur kuch platforms par specific EAP methods ke liye AP par <b>local authentication</b> bhi support hota hai. Bharosa karne se pehle apne release ke supported methods check karo.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Standalone mode mein store">
<rect x="20" y="40" width="270" height="190" rx="12" fill="#f1f5f9" stroke="#64748b" stroke-width="2"/><text x="155" y="30" text-anchor="middle" class="svg-ink" font-size="13">Store 118 (Flex group)</text>
<rect x="40" y="60" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="85" y="83" text-anchor="middle" class="svg-ink" font-size="13">Flex AP</text>
<rect x="40" y="115" width="90" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="138" text-anchor="middle" class="svg-ink" font-size="13">Store switch</text>
<rect x="160" y="60" width="110" height="36" rx="8" fill="#ddd6fe"/><text x="215" y="83" text-anchor="middle" class="svg-ink" font-size="13">Store servers</text>
<rect x="160" y="115" width="110" height="36" rx="8" fill="#fde68a"/><text x="215" y="138" text-anchor="middle" class="svg-ink" font-size="13">Backup RADIUS</text>
<rect x="40" y="170" width="90" height="36" rx="8" fill="#fed7aa"/><text x="85" y="193" text-anchor="middle" class="svg-ink" font-size="13">Scanner</text>
<line x1="85" y1="96" x2="85" y2="115" stroke="#64748b" stroke-width="2"/><line x1="130" y1="133" x2="160" y2="133" stroke="#64748b" stroke-width="2"/><line x1="130" y1="78" x2="160" y2="78" stroke="#64748b" stroke-width="2"/><line x1="85" y1="170" x2="85" y2="151" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="290" y1="110" x2="400" y2="110" stroke="#ef4444" stroke-width="3"/><line x1="332" y1="96" x2="358" y2="124" stroke="#ef4444" stroke-width="3"/><line x1="358" y1="96" x2="332" y2="124" stroke="#ef4444" stroke-width="3"/><text x="345" y="150" text-anchor="middle" class="svg-ink" font-size="12">WAN down</text>
<rect x="400" y="60" width="220" height="100" rx="12" fill="#bae6fd"/><text x="510" y="100" text-anchor="middle" class="svg-ink" font-size="13">Data centres</text><text x="510" y="122" text-anchor="middle" class="svg-muted" font-size="12">9800 SSO pair + central RADIUS</text>
<rect x="20" y="248" width="14" height="14" fill="#bbf7d0"/><text x="40" y="260" class="svg-muted" font-size="12">AP</text>
<rect x="90" y="248" width="14" height="14" fill="#ddd6fe"/><text x="110" y="260" class="svg-muted" font-size="12">Local service</text>
<rect x="210" y="248" width="14" height="14" fill="#fde68a"/><text x="230" y="260" class="svg-muted" font-size="12">Backup auth</text>
<rect x="320" y="248" width="14" height="14" fill="#bae6fd"/><text x="340" y="260" class="svg-muted" font-size="12">Central</text>
</svg><p class="cap">Local switching aur reachable backup RADIUS ke saath WAN cut hone par bhi store chalta rehta hai.</p></div>

<h3>Options jo consider kiye</h3>
<table class="cmp"><tr><th>Option</th><th>WAN outage ka result</th><th>Cost aur risk</th></tr>
<tr><td>A. Local mode APs WAN ke upar</td><td>Poora store andhera</td><td>Sasta; brief fail karta hai</td></tr>
<tr><td>B. FlexConnect, central switching</td><td>Existing clients drop</td><td>Simple, par survival nahi</td></tr>
<tr><td>C. FlexConnect, local switching, sirf central auth</td><td>Data chalta hai, naye logins fail</td><td>Yeh original design thi</td></tr>
<tr><td>D. FlexConnect, local switching, backup RADIUS ya local auth, central-switched guest</td><td>Staff chalta hai, guests pause</td><td>Ek extra RADIUS path chahiye</td></tr>
</table>

<h3>Chosen design</h3>
<p>Brightway option D chunta hai. Staff, POS aur scanner WLANs store VLANs mein <b>locally switched</b> hain, isliye traffic data centre ka chakkar lagaye bina store servers aur payment gateway tak jaata hai. Har store ka Flex group VPN ke through LTE path par reachable <b>secondary RADIUS server</b> list karta hai, aur jahan EAP method allow kare wahan scanner profile ke liye local authentication. Fast roaming keys group ke andar distribute hoti hain. Guest WLAN centrally switched rehta hai, kyunki guests policy ke liye anchor hote hain, aur manaa jaata hai ki outage mein guest access pause hoga. Ek AP-side requirement judti hai: har WLAN ki VLAN IDs store switch trunk par maujood honi chahiye, kyunki missing VLAN standalone failure ki sabse aam wajah hai.</p>
<div class="eg"><p><b>WAN sizing.</b> Flex AP aur controller ke beech control traffic halka hota hai, lekin Cisco design guidance voice ke saath lagbhag 100 ms tak aur sirf data ke liye lagbhag 300 ms tak round-trip time maangti hai, aur minimum lagbhag 12.8 kbps per AP. 8 APs wale store ko control ke liye isliye lagbhag 100 kbps chahiye, plus staff aur guest traffic ki zaroorat. LTE backup ko bhi utna hi size karo.</p></div>
<pre class="out">STANDALONE TEST SHEET - Store 118 (WAN cable pulled)
Existing scanner, staff SSID, local switching ...... stays connected   PASS
New scanner joins staff SSID (backup RADIUS) ....... authenticates     <span class="hl">PASS</span>
Guest SSID (central switching) ..................... unavailable      EXPECTED
AP reboot while WAN down ........................... returns to service PASS
WAN restored: AP returns to connected mode ......... no client drop    PASS</pre>

<div class="warn"><p><b>Post-mortem lessons.</b> (1) Local switching data path fix karta hai, authentication nahi; dono test karo. (2) Backup RADIUS server khud WAN down hone par reachable hona chahiye, isliye woh store ke andar ya LTE VPN path par ho, cut hui link ke peeche nahi. (3) Bahut bada Flex group key distribution load badhata hai; groups ko ek store ya stores ke cluster tak rakho.</p></div>
<div class="exam"><p><b>Exam traps.</b> Standalone mode local-switched WLANs rakhta hai par central-switched ko drop karta hai. Central-auth clients standalone mode mein tabhi join karte hain jab backup RADIUS ya local auth ho. Flex group mein fast roaming un keys par depend karti hai jo connected rehte hue distribute hui thi.</p></div>

<div class="scn"><h4>Gayab VLAN</h4><p>Pilot store par planned WAN test ke baad staff Wi-Fi associate hua par IP address nahi mila. AP standalone mode mein tha aur traffic VLAN 120 mein tag kar raha tha, lekin store switch trunk sirf VLAN 10 le ja raha tha. Connected mode mein controller ne issue chhupa diya tha kyunki sab kuch tunnel mein jaata hai. Fix: trunk par VLAN add karna aur VLAN check ko store build checklist ka hissa banana.</p><p><b>Seekh:</b> Flex deployment ko WAN cable nikaal ke test karo, sirf controller up rakhke nahi.</p></div>

<div class="iv"><p class="q">"Branch ka WAN link fail ho jaaye to wahan wireless ka kya hota hai?"</p><p>Strong answer: yeh WLAN design par depend karta hai. Local-switched WLANs standalone mode mein existing clients ko chalte rakhte hain; central-switched WLANs drop ho jaate hain. Naye 802.1X clients ko reachable backup RADIUS server ya local authentication chahiye. WAN pull karke testing aur VLAN trunk requirement ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FlexConnect standalone mode controller unreachable hone par locally switched WLANs ko zinda rakhta hai.</li>
<li>Central switching aur sirf central authentication WAN outage survive nahi karte.</li>
<li>Key distribution ke liye Flex groups aur naye logins ke liye backup RADIUS ya local authentication use karo.</li>
<li>Backup services failure ke store-side par ya alag path par hone chahiye.</li>
<li>WAN pull karke test karo; store trunk par VLANs check karo.</li>
</ul></div>
`}};export{e as default};