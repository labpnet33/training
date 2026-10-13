var e={id:`service-sets`,h:{en:`SSID, BSSID, BSS, ESS, IBSS and roaming`,hi:`SSID, BSSID, BSS, ESS, IBSS aur roaming`},body:{en:`
<p>Think of a coffee chain called "NK Cafe". The brand name on every signboard is the same; that is the <b>SSID</b>. Each branch has its own unique street address; that is the <b>BSSID</b>. One branch with its customers inside is a <b>BSS</b>. All the branches in the city, supplied by the same head office so your loyalty card works everywhere, form an <b>ESS</b>. And two friends sharing a flask of coffee on a park bench, with no shop at all, are an <b>IBSS</b>. Walking from one branch to the next without losing your card is <b>roaming</b>.</p>

<h3>The vocabulary, one term at a time</h3>
<dl class="terms">
<dt>Station (STA)</dt><dd>Any device with an 802.11 radio: laptop, phone, and technically the AP too.</dd>
<dt>SSID</dt><dd>Service set identifier: the network name users see, such as <code>NK-STAFF</code>. Up to 32 characters (bytes), case-sensitive. Many APs share one SSID.</dd>
<dt>BSSID</dt><dd>Basic service set identifier: the 48-bit MAC address that identifies one AP radio serving one SSID. If an AP radio offers three SSIDs, it uses three BSSIDs (virtual APs), usually consecutive MAC addresses. Clients associate to a BSSID, not to a name.</dd>
<dt>BSS and BSA</dt><dd>A basic service set is one AP and its associated clients. The area where clients can reach it is the basic service area, the <b>cell</b>. In a BSS, clients talk only through the AP, never directly to each other.</dd>
<dt>Distribution system (DS)</dt><dd>The network that connects APs together and to the rest of the LAN, normally the wired Ethernet switches.</dd>
<dt>ESS</dt><dd>Extended service set: two or more BSSs with the <b>same SSID</b>, connected by a DS. To the client it looks like one large network, and it can move between cells.</dd>
<dt>IBSS</dt><dd>Independent BSS, or <b>ad hoc</b> mode: two or more clients talk directly without an AP. Useful for a quick file transfer, not for business networks, because it does not scale and is hard to secure.</dd>
</dl>
<p>Other AP roles build on these ideas. A <b>repeater</b> receives and retransmits on the same channel, extending coverage but roughly halving throughput. A <b>workgroup bridge (WGB)</b> acts as a wireless client for wired devices behind it, such as a machine on a factory floor. <b>Outdoor bridges</b> link buildings point-to-point or point-to-multipoint with directional antennas. <b>Mesh</b> APs (an MBSS, mesh basic service set) connect to each other wirelessly where cabling is impossible, with only some APs cabled to the network.</p>

<div class="dia"><svg viewBox="0 0 640 275" role="img" aria-label="ESS with two BSSs">
<circle cx="210" cy="110" r="115" fill="#bae6fd" fill-opacity="0.5" stroke="#0284c7" stroke-width="1.5"/>
<circle cx="430" cy="110" r="115" fill="#bbf7d0" fill-opacity="0.5" stroke="#16a34a" stroke-width="1.5"/>
<rect x="180" y="60" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="210" y="80" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="400" y="60" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="430" y="80" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<text x="160" y="40" text-anchor="middle" class="svg-muted" font-size="12">BSSID ..11:10, ch 36</text>
<text x="480" y="40" text-anchor="middle" class="svg-muted" font-size="12">BSSID ..12:10, ch 40</text>
<text x="210" y="112" text-anchor="middle" class="svg-accent" font-size="12">SSID NK-STAFF</text>
<text x="430" y="112" text-anchor="middle" class="svg-accent" font-size="12">SSID NK-STAFF</text>
<line x1="150" y1="150" x2="480" y2="150" stroke="#64748b" stroke-width="2"/><polygon points="480,144 492,150 480,156" fill="#64748b"/>
<text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="12">client roams</text>
<rect x="280" y="235" width="80" height="30" rx="6" fill="#fde68a"/><text x="320" y="255" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="210" y1="90" x2="300" y2="235" stroke="#64748b" stroke-width="1.5"/><line x1="430" y1="90" x2="340" y2="235" stroke="#64748b" stroke-width="1.5"/>
<text x="470" y="255" class="svg-muted" font-size="12">distribution system</text>
</svg><p class="cap">An ESS: two BSSs with the same SSID, different BSSIDs and channels, joined by the wired distribution system. The overlap zone lets the client roam.</p></div>

<h3>Why it matters</h3>
<p>Every "which AP is the user on?" question is answered with the BSSID. Every design decision about SSIDs has a cost: each SSID sends its own <b>beacons</b> about ten times per second on every radio, at the lowest data rate, which burns airtime. Most designs keep to three or four SSIDs and separate users with VLANs and policies instead of more networks.</p>
<p>In the lab, LAPTOP1 can see the same SSID from every AP, on both bands, each with its own BSSID:</p>
<pre class="out">LAPTOP1&gt; wifi scan
SSID              BSSID              Band    Ch   Signal   Security              AP
<span class="hl">NK-STAFF          52:54:00:3a:12:10  5 GHz   40   -54 dBm  WPA2-Personal (PSK)   AP2</span>
NK-STAFF          52:54:00:3a:11:10  5 GHz   36   -63 dBm  WPA2-Personal (PSK)   AP1
NK-STAFF          52:54:00:3a:12:00  2.4 GHz 6    -49 dBm  WPA2-Personal (PSK)   AP2
NK-STAFF          52:54:00:3a:11:00  2.4 GHz 1    -58 dBm  WPA2-Personal (PSK)   AP1
NK-STAFF          52:54:00:3a:13:10  5 GHz   44   -71 dBm  WPA2-Personal (PSK)   AP3
NK-STAFF          52:54:00:3a:13:00  2.4 GHz 11   -66 dBm  WPA2-Personal (PSK)   AP3</pre>

<h3>Roaming basics</h3>
<p>In a cellular network the tower hands your phone over. In Wi-Fi, the <b>client decides</b> when to roam. When its signal drops below the driver's roaming threshold (often around −70 to −75 dBm), or it misses beacons and sees many retries, the client scans for other BSSIDs of the same SSID, picks a better one, and sends a <b>reassociation request</b> to the new AP. The steps:</p>
<ol>
<li>Client notices a weak signal on the current BSSID.</li>
<li>It scans: listens for beacons (passive) or sends probe requests (active).</li>
<li>It chooses a stronger BSSID with the same SSID and security.</li>
<li>It reauthenticates (fully, or quickly with fast-roaming features) and reassociates.</li>
<li>The controller updates its client table; because the WLAN maps to the same VLAN, the client <b>keeps its IP address</b>.</li>
</ol>
<p>Roaming between APs on the same controller is simple. Between controllers, a <b>mobility group</b> shares client state; if the client lands in a different subnet, the controllers tunnel its traffic back to the original (anchor) controller so the IP still works. Fast roaming amendments help clients choose and move quickly: <b>802.11k</b> (neighbour reports), <b>802.11v</b> (BSS transition management) and <b>802.11r</b> (fast BSS transition, fewer handshake messages). For smooth roaming, neighbouring cells should overlap by about 15 to 20 % at the design signal level, for example −67 dBm for voice.</p>

<pre class="out">(WLC1) &gt;show client detail 52:54:00:aa:00:01

Client MAC Address............................... 52:54:00:aa:00:01
AP Name.......................................... AP2
Client State..................................... Associated
Wireless LAN Network Name (SSID)................. NK-STAFF
<span class="hl">BSSID............................................ 52:54:00:3a:12:10</span>
Channel.......................................... 40
IP Address....................................... 10.10.20.11
Interface........................................ staff
VLAN............................................. 20
Radio Signal Strength Indicator.................. -54 dBm</pre>

<div class="eg"><p><b>Worked example.</b> Three APs each offer NK-STAFF and NK-GUEST on both radios. How many BSSIDs are on air? 3 APs × 2 radios × 2 SSIDs = <b>12 BSSIDs</b>, but still only 2 SSIDs. A client walking from AP1 to AP2 changes BSSID (and channel, 36 to 40) but keeps SSID NK-STAFF, VLAN 20 and its address 10.10.20.11.</p></div>

<div class="warn"><p><b>Common mistake.</b> Hiding the SSID (turning off broadcast) "for security". The SSID still appears in probe and association frames, so any sniffer reveals it within seconds, and hidden networks make clients probe more. Use strong authentication instead.</p></div>

<div class="exam"><p><b>Exam trap.</b> The BSSID is a <b>MAC address</b>, the SSID is a <b>name</b>. An ESS needs the same SSID plus a distribution system; an IBSS has no AP. The client, not the AP, makes the roaming decision.</p></div>

<div class="scn"><h4>Calls drop in the corridor</h4><p>After a second controller was added for the new wing, users' Wi-Fi calls dropped whenever they walked from the old wing into the new one. Both wings broadcast NK-STAFF. The engineer compared the WLANs: in the old wing NK-STAFF mapped to VLAN 20, in the new wing to VLAN 25, and the two controllers were not in the same mobility group. Each roam became a brand-new connection with a new DHCP address, breaking every active session. Joining the controllers in one mobility group and aligning the interface mapping fixed it.</p><p><b>Lesson:</b> an ESS must be consistent: same SSID, same security, and the same client VLAN or a mobility tunnel.</p></div>

<div class="iv"><p class="q">"What is the difference between an SSID and a BSSID?"</p><p>Strong answer: the SSID is the human-readable network name shared by many APs in an ESS; the BSSID is the MAC address of one AP radio for one SSID, so it uniquely identifies a cell. One AP broadcasting two SSIDs on two radios uses four BSSIDs. Add that clients associate and roam between BSSIDs, and that troubleshooting starts by finding which BSSID the client is on.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSID = network name; BSSID = AP radio MAC per SSID; BSS = one AP and its clients.</li>
<li>ESS = several BSSs with one SSID joined by a distribution system; IBSS = ad hoc, no AP.</li>
<li>Repeaters, workgroup bridges, outdoor bridges and mesh extend the basic model.</li>
<li>The client decides to roam and sends a reassociation request; on the same VLAN it keeps its IP.</li>
<li>Plan about 15 to 20 % cell overlap; 802.11k, v and r make roaming faster.</li>
</ul></div>
`,hi:`
<p>"NK Cafe" naam ki coffee chain socho. Har signboard par brand naam same hai; woh <b>SSID</b> hai. Har branch ka apna unique street address hai; woh <b>BSSID</b> hai. Ek branch apne andar ke customers ke saath ek <b>BSS</b> hai. Shehar ki saari branches, jinhe same head office supply karta hai taaki aapka loyalty card har jagah chale, ek <b>ESS</b> banati hain. Aur park bench par thermos ki coffee share karte do dost, bina kisi dukaan ke, ek <b>IBSS</b> hain. Card khoye bina ek branch se agli tak chalna <b>roaming</b> hai.</p>

<h3>Vocabulary, ek ek term karke</h3>
<dl class="terms">
<dt>Station (STA)</dt><dd>802.11 radio wala koi bhi device: laptop, phone, aur technically AP bhi.</dd>
<dt>SSID</dt><dd>Service set identifier: network ka naam jo users dekhte hain, jaise <code>NK-STAFF</code>. 32 characters (bytes) tak, case-sensitive. Kai APs ek SSID share karte hain.</dd>
<dt>BSSID</dt><dd>Basic service set identifier: 48-bit MAC address jo ek SSID serve karne wale ek AP radio ko identify karta hai. Agar AP radio teen SSIDs deta hai, to woh teen BSSIDs (virtual APs) use karta hai, aam taur par lagataar MAC addresses. Clients BSSID se associate karte hain, naam se nahi.</dd>
<dt>BSS aur BSA</dt><dd>Basic service set ek AP aur uske associated clients hain. Jis area mein clients use reach kar sakte hain woh basic service area hai, yaani <b>cell</b>. BSS mein clients sirf AP ke through baat karte hain, kabhi seedhe ek doosre se nahi.</dd>
<dt>Distribution system (DS)</dt><dd>Woh network jo APs ko aapas mein aur baaki LAN se jodta hai, normally wired Ethernet switches.</dd>
<dt>ESS</dt><dd>Extended service set: do ya zyada BSS jinka <b>SSID same</b> hai, DS se jude hue. Client ko yeh ek bada network lagta hai, aur woh cells ke beech move kar sakta hai.</dd>
<dt>IBSS</dt><dd>Independent BSS, ya <b>ad hoc</b> mode: do ya zyada clients bina AP ke seedhe baat karte hain. Jaldi file transfer ke liye useful, business networks ke liye nahi, kyunki yeh scale nahi karta aur secure karna mushkil hai.</dd>
</dl>
<p>Doosre AP roles inhi ideas par bante hain. <b>Repeater</b> same channel par receive karke dobara transmit karta hai, coverage badhata hai par throughput lagbhag aadha karta hai. <b>Workgroup bridge (WGB)</b> apne peeche ke wired devices ke liye wireless client ka kaam karta hai, jaise factory floor par ek machine. <b>Outdoor bridges</b> directional antennas se buildings ko point-to-point ya point-to-multipoint jodte hain. <b>Mesh</b> APs (MBSS, mesh basic service set) jahan cabling na ho sake wahan ek doosre se wirelessly judte hain, aur sirf kuch APs network se cabled hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 275" role="img" aria-label="Do BSS wala ESS">
<circle cx="210" cy="110" r="115" fill="#bae6fd" fill-opacity="0.5" stroke="#0284c7" stroke-width="1.5"/>
<circle cx="430" cy="110" r="115" fill="#bbf7d0" fill-opacity="0.5" stroke="#16a34a" stroke-width="1.5"/>
<rect x="180" y="60" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="210" y="80" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="400" y="60" width="60" height="30" rx="6" fill="#e2e8f0"/><text x="430" y="80" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<text x="160" y="40" text-anchor="middle" class="svg-muted" font-size="12">BSSID ..11:10, ch 36</text>
<text x="480" y="40" text-anchor="middle" class="svg-muted" font-size="12">BSSID ..12:10, ch 40</text>
<text x="210" y="112" text-anchor="middle" class="svg-accent" font-size="12">SSID NK-STAFF</text>
<text x="430" y="112" text-anchor="middle" class="svg-accent" font-size="12">SSID NK-STAFF</text>
<line x1="150" y1="150" x2="480" y2="150" stroke="#64748b" stroke-width="2"/><polygon points="480,144 492,150 480,156" fill="#64748b"/>
<text x="320" y="143" text-anchor="middle" class="svg-ink" font-size="12">client roam karta hai</text>
<rect x="280" y="235" width="80" height="30" rx="6" fill="#fde68a"/><text x="320" y="255" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="210" y1="90" x2="300" y2="235" stroke="#64748b" stroke-width="1.5"/><line x1="430" y1="90" x2="340" y2="235" stroke="#64748b" stroke-width="1.5"/>
<text x="470" y="255" class="svg-muted" font-size="12">distribution system</text>
</svg><p class="cap">Ek ESS: same SSID wale do BSS, alag BSSIDs aur channels, wired distribution system se jude. Overlap zone client ko roam karne deta hai.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Har "user kis AP par hai?" sawaal ka jawab BSSID se milta hai. SSIDs ke baare mein har design decision ki keemat hai: har SSID har radio par second mein lagbhag das baar apne <b>beacons</b> bhejta hai, sabse neeche ke data rate par, jo airtime jalata hai. Zyada tar designs teen ya chaar SSIDs tak rehte hain aur zyada networks ki jagah VLANs aur policies se users ko alag karte hain.</p>
<p>Lab mein LAPTOP1 har AP se, dono bands par, same SSID dekh sakta hai, har ek ka apna BSSID:</p>
<pre class="out">LAPTOP1&gt; wifi scan
SSID              BSSID              Band    Ch   Signal   Security              AP
<span class="hl">NK-STAFF          52:54:00:3a:12:10  5 GHz   40   -54 dBm  WPA2-Personal (PSK)   AP2</span>
NK-STAFF          52:54:00:3a:11:10  5 GHz   36   -63 dBm  WPA2-Personal (PSK)   AP1
NK-STAFF          52:54:00:3a:12:00  2.4 GHz 6    -49 dBm  WPA2-Personal (PSK)   AP2
NK-STAFF          52:54:00:3a:11:00  2.4 GHz 1    -58 dBm  WPA2-Personal (PSK)   AP1
NK-STAFF          52:54:00:3a:13:10  5 GHz   44   -71 dBm  WPA2-Personal (PSK)   AP3
NK-STAFF          52:54:00:3a:13:00  2.4 GHz 11   -66 dBm  WPA2-Personal (PSK)   AP3</pre>

<h3>Roaming basics</h3>
<p>Cellular network mein tower aapka phone hand over karta hai. Wi-Fi mein <b>client tay karta hai</b> ki kab roam karna hai. Jab uska signal driver ke roaming threshold se neeche girta hai (aksar lagbhag −70 se −75 dBm), ya woh beacons miss karta hai aur bahut retries dekhta hai, to client same SSID ke doosre BSSIDs scan karta hai, behtar ek chunta hai, aur naye AP ko <b>reassociation request</b> bhejta hai. Steps:</p>
<ol>
<li>Client current BSSID par kamzor signal notice karta hai.</li>
<li>Woh scan karta hai: beacons sunta hai (passive) ya probe requests bhejta hai (active).</li>
<li>Woh same SSID aur security wala strong BSSID chunta hai.</li>
<li>Woh reauthenticate karta hai (poora, ya fast-roaming features se jaldi) aur reassociate karta hai.</li>
<li>Controller apni client table update karta hai; kyunki WLAN same VLAN se mapped hai, client <b>apna IP address rakhta hai</b>.</li>
</ol>
<p>Same controller ke APs ke beech roaming simple hai. Controllers ke beech, ek <b>mobility group</b> client state share karta hai; agar client alag subnet mein pahunchta hai, to controllers uska traffic original (anchor) controller tak tunnel karte hain taaki IP chalta rahe. Fast roaming amendments clients ko jaldi chunne aur move karne mein madad karte hain: <b>802.11k</b> (neighbour reports), <b>802.11v</b> (BSS transition management) aur <b>802.11r</b> (fast BSS transition, kam handshake messages). Smooth roaming ke liye padosi cells design signal level par lagbhag 15 se 20 % overlap hone chahiye, jaise voice ke liye −67 dBm.</p>

<pre class="out">(WLC1) &gt;show client detail 52:54:00:aa:00:01

Client MAC Address............................... 52:54:00:aa:00:01
AP Name.......................................... AP2
Client State..................................... Associated
Wireless LAN Network Name (SSID)................. NK-STAFF
<span class="hl">BSSID............................................ 52:54:00:3a:12:10</span>
Channel.......................................... 40
IP Address....................................... 10.10.20.11
Interface........................................ staff
VLAN............................................. 20
Radio Signal Strength Indicator.................. -54 dBm</pre>

<div class="eg"><p><b>Worked example.</b> Teen APs mein se har ek dono radios par NK-STAFF aur NK-GUEST deta hai. Hawa mein kitne BSSIDs hain? 3 APs × 2 radios × 2 SSIDs = <b>12 BSSIDs</b>, par SSIDs abhi bhi sirf 2. AP1 se AP2 tak chalta client BSSID (aur channel, 36 se 40) badalta hai par SSID NK-STAFF, VLAN 20 aur apna address 10.10.20.11 rakhta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> "Security ke liye" SSID chhupana (broadcast band karna). SSID phir bhi probe aur association frames mein dikhta hai, isliye koi bhi sniffer seconds mein use bata deta hai, aur hidden networks clients se zyada probe karwate hain. Iski jagah strong authentication use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> BSSID ek <b>MAC address</b> hai, SSID ek <b>naam</b>. ESS ko same SSID plus distribution system chahiye; IBSS mein AP nahi hota. Roaming ka faisla client karta hai, AP nahi.</p></div>

<div class="scn"><h4>Corridor mein calls drop</h4><p>Naye wing ke liye doosra controller jodne ke baad, jab bhi users purane wing se naye mein chalte, unki Wi-Fi calls drop ho jaati. Dono wings NK-STAFF broadcast karte the. Engineer ne WLANs compare kiye: purane wing mein NK-STAFF VLAN 20 se mapped tha, naye wing mein VLAN 25 se, aur dono controllers same mobility group mein nahi the. Har roam ek bilkul naya connection ban jaata tha naye DHCP address ke saath, jo har active session tod deta tha. Controllers ko ek mobility group mein jodne aur interface mapping align karne se yeh theek hua.</p><p><b>Seekh:</b> ESS consistent hona chahiye: same SSID, same security, aur same client VLAN ya mobility tunnel.</p></div>

<div class="iv"><p class="q">"SSID aur BSSID mein kya fark hai?"</p><p>Strong answer: SSID human-readable network naam hai jo ESS ke kai APs share karte hain; BSSID ek SSID ke liye ek AP radio ka MAC address hai, isliye yeh ek cell ko uniquely identify karta hai. Do radios par do SSIDs broadcast karne wala ek AP chaar BSSIDs use karta hai. Jodo ki clients BSSIDs se associate aur unke beech roam karte hain, aur troubleshooting yeh dhoondhne se shuru hoti hai ki client kis BSSID par hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSID = network naam; BSSID = har SSID ke liye AP radio MAC; BSS = ek AP aur uske clients.</li>
<li>ESS = ek SSID wale kai BSS jo distribution system se jude hain; IBSS = ad hoc, bina AP.</li>
<li>Repeaters, workgroup bridges, outdoor bridges aur mesh basic model ko aage badhate hain.</li>
<li>Roam ka faisla client karta hai aur reassociation request bhejta hai; same VLAN par woh apna IP rakhta hai.</li>
<li>Lagbhag 15 se 20 % cell overlap plan karo; 802.11k, v aur r roaming ko tez banate hain.</li>
</ul></div>
`}};export{e as default};