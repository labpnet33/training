var e={id:`wireless-basics`,h:{en:`Wireless basics: radios, bands, SSIDs and cloud-managed APs`,hi:`Wireless basics: radios, bands, SSIDs aur cloud-managed APs`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>How Wi-Fi works at a simple level: radio, band, SSID, beacon.</li>
<li>What an access point (AP) does and how a cloud-managed AP differs from a standalone one.</li>
<li>Why the AP lives on management VLAN 99 and what must be true for it to show online.</li>
<li>How the Bharat Retail Co wireless plan is laid out: AP-MUM, AP-BLR, AP-DEL, tags and two SSIDs.</li>
</ul>
<p><b>Prerequisites:</b> the earlier modules of this track (organization, networks, tags; MX VLANs and DHCP; switch trunks and native VLAN). If you know that a VLAN is a separate subnet and that a trunk carries many VLANs, you are ready. No wireless background is needed.</p>

<h3>The big picture: a radio station for your office</h3>
<p>Think of an AP as a small radio station inside a building. It broadcasts a name, and phones and laptops that "tune in" to that name get a wireless connection to the wired network. The AP is the doorway between the air and the cable. Everything after the doorway (DHCP, routing, firewall) is the same wired network you already know.</p>

<h3>Radio, band and SSID</h3>
<p>Wi-Fi uses <b>radio waves</b>. The AP has one or more <b>radios</b>, each working in a <b>band</b>, which is a range of radio frequencies. Two bands matter for this track: <b>2.4 GHz</b> and <b>5 GHz</b>. The 2.4 GHz band travels farther and passes through walls better, but it is crowded and slower. The 5 GHz band is faster and cleaner but covers a smaller area. Some clients (older or simple devices) have only a 2.4 GHz radio.</p>
<p>An <b>SSID</b> (Service Set Identifier) is the network name people see in their Wi-Fi list, such as <code>BharatRetail-Staff</code>. One AP can serve several SSIDs at once, each with its own security and VLAN. A <b>beacon</b> is a small frame the AP sends many times per second that announces "I am here, my SSID is X". A client scans for beacons, lists the SSIDs, and joins one. If the AP stops sending beacons for an SSID (hidden or disabled), the name disappears from the list.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Client, AP and wired network">
<rect x="20" y="70" width="110" height="60" rx="8" fill="#bae6fd"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="13">Client phone</text>
<rect x="260" y="60" width="120" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">AP-MUM</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">2 SSIDs</text>
<rect x="510" y="70" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="105" text-anchor="middle" class="svg-ink" font-size="13">SW-MUM</text>
<path d="M135 85 Q200 60 255 85" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="5 4"/><path d="M135 115 Q200 140 255 115" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="5 4"/>
<line x1="380" y1="100" x2="510" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="195" y="55" text-anchor="middle" class="svg-muted" font-size="12">radio (2.4 / 5 GHz)</text>
<text x="445" y="90" text-anchor="middle" class="svg-muted" font-size="12">cable + PoE</text>
<rect x="20" y="165" width="600" height="40" rx="6" fill="#fde68a"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">AP management VLAN 99 talks to the cloud dashboard through SW-MUM and MX-MUM</text>
</svg><p class="cap">The AP joins the air side (SSIDs) to the wired side (VLANs, switch, MX).</p></div>

<h3>Cloud-managed AP: no controller box</h3>
<p>A traditional AP is configured one by one, or through a controller appliance in a rack. In a <b>cloud-managed</b> design the AP gets its configuration from the dashboard over the internet. You set an SSID once on the <b>SSIDs</b> page of a network and every AP in that network applies it. The AP must therefore <b>reach the dashboard</b>. Its management traffic uses VLAN 99. The user traffic (staff and guest) uses VLAN 10 and VLAN 30. Keeping them apart means a guest can never reach the AP's own management address.</p>
<p>In this simulator an AP shows <b>online</b> only when all of this is true: its switch port is enabled, PoE (power over Ethernet, power delivered through the network cable) is on, the port's VLAN (the access VLAN, or the native VLAN of a trunk) equals the AP management VLAN 99, and the management VLAN reaches the MX. If any one is wrong the AP is offline and its SSIDs vanish. Real products have more detail; check the vendor documentation.</p>

<h3>Bharat Retail Co wireless plan</h3>
<table class="cmp"><tr><th>Site</th><th>AP</th><th>Tag</th><th>SSIDs</th></tr>
<tr><td>Mumbai HQ</td><td>AP-MUM</td><td>floor1</td><td>Staff, Guest</td></tr>
<tr><td>Bengaluru</td><td>AP-BLR</td><td>floor2</td><td>Staff, Guest</td></tr>
<tr><td>Delhi</td><td>AP-DEL</td><td>store</td><td>Staff, Guest</td></tr></table>
<p>Two SSIDs run in each network: <code>BharatRetail-Staff</code> (WPA2 PSK, VLAN 10, visible) and <code>BharatRetail-Guest</code> (open with click-through splash, VLAN 30, client isolation on). The next chapters build them step by step.</p>

<pre class="out">Devices  (network: Mumbai HQ)
Name     Type     Tag     Mgmt VLAN  Status
MX-MUM   MX       -       -          <span class="hl">online</span>
SW-MUM   MS       -       99         online
AP-MUM   MR       floor1  99          online</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> This chapter changes nothing. It only reads the Devices list. Later pages change what the AP broadcasts (SSID, band) and which VLAN a wireless client lands in.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Treating the AP as a router (it bridges; the MX still routes and does DHCP); forgetting PoE; putting the AP port in the wrong access VLAN; mixing up SSID (the name) with VLAN (the network behind it).</p></div>
<div class="exam"><p><b>Exam trap.</b> An AP that is offline broadcasts nothing, so every SSID disappears at once. If only one SSID is missing, the AP is fine and the problem is in that SSID's settings.</p></div>

<div class="scn"><h4>The new store AP</h4><p>Delhi opened a new counter and plugged AP-DEL into a spare switch port. Staff saw no Wi-Fi at all. The dashboard showed AP-DEL offline. The port was an access port in VLAN 10, not VLAN 99, so the AP could not reach the dashboard. The engineer set the port to VLAN 99 and PoE on; the AP came online in about a minute and both SSIDs appeared.</p><p><b>Lesson:</b> no SSID anywhere on one AP means check the AP's status first: port, PoE, VLAN 99.</p></div>

<div class="iv"><p class="q">"What is the difference between an SSID and a VLAN, and why does a cloud AP need a management VLAN?"</p><p>Strong answer: the SSID is the wireless name a user sees; the VLAN is the wired network (subnet) that user's traffic lands in. One AP can map different SSIDs to different VLANs. The AP also needs its own management path to reach the cloud, kept on a separate VLAN 99 so users cannot touch it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An AP bridges the radio side to the wired network; the MX still routes and runs DHCP.</li>
<li>Bands: 2.4 GHz reaches farther but is slower; 5 GHz is faster with less range.</li>
<li>An SSID is a name announced by beacons; one AP can carry several SSIDs.</li>
<li>Cloud-managed APs take their config from the dashboard and must reach it over management VLAN 99.</li>
<li>AP online needs: port enabled, PoE on, port VLAN equals 99, path to the MX.</li>
</ul></div>
`,hi:`
<h3>What you will learn</h3>
<ul>
<li>Wi-Fi simple level par kaise kaam karta hai: radio, band, SSID, beacon.</li>
<li>Access point (AP) kya karta hai aur cloud-managed AP standalone AP se kaise alag hai.</li>
<li>AP management VLAN 99 par kyun rehta hai aur online dikhne ke liye kya sach hona chahiye.</li>
<li>Bharat Retail Co ka wireless plan kaisa hai: AP-MUM, AP-BLR, AP-DEL, tags aur do SSIDs.</li>
</ul>
<p><b>Prerequisites:</b> is track ke pichhle modules (organization, networks, tags; MX VLANs aur DHCP; switch trunks aur native VLAN). Agar aapko pata hai ki VLAN alag subnet hai aur trunk kai VLANs carry karta hai, to aap ready ho. Wireless background ki zaroorat nahi.</p>

<h3>Big picture: office ke andar ek radio station</h3>
<p>AP ko building ke andar ek chhota radio station samjho. Woh ek naam broadcast karta hai, aur phones aur laptops jo us naam par "tune in" karte hain unhe wired network se wireless connection milta hai. AP hawa aur cable ke beech ka darwaza hai. Darwaze ke baad sab kuch (DHCP, routing, firewall) wahi wired network hai jo aap pehle se jaante ho.</p>

<h3>Radio, band aur SSID</h3>
<p>Wi-Fi <b>radio waves</b> use karta hai. AP mein ek ya zyada <b>radios</b> hote hain, har radio ek <b>band</b> mein kaam karta hai, yaani radio frequencies ki ek range. Is track mein do bands important hain: <b>2.4 GHz</b> aur <b>5 GHz</b>. 2.4 GHz band door tak jaata hai aur deewaron se behtar guzarta hai, lekin bheed wala aur slow hai. 5 GHz band tez aur saaf hai lekin chhota area cover karta hai. Kuch clients (purane ya simple devices) mein sirf 2.4 GHz radio hota hai.</p>
<p><b>SSID</b> (Service Set Identifier) woh network naam hai jo log Wi-Fi list mein dekhte hain, jaise <code>BharatRetail-Staff</code>. Ek AP ek saath kai SSIDs serve kar sakta hai, har ek ki apni security aur VLAN. <b>Beacon</b> ek chhota frame hai jo AP har second kai baar bhejta hai aur announce karta hai "main yahan hoon, mera SSID X hai". Client beacons scan karta hai, SSIDs ki list banata hai aur ek join karta hai. Agar AP kisi SSID ke beacons bhejna band kar de (hidden ya disabled), to woh naam list se gayab ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Client, AP aur wired network">
<rect x="20" y="70" width="110" height="60" rx="8" fill="#bae6fd"/><text x="75" y="105" text-anchor="middle" class="svg-ink" font-size="13">Client phone</text>
<rect x="260" y="60" width="120" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">AP-MUM</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">2 SSIDs</text>
<rect x="510" y="70" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="105" text-anchor="middle" class="svg-ink" font-size="13">SW-MUM</text>
<path d="M135 85 Q200 60 255 85" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="5 4"/><path d="M135 115 Q200 140 255 115" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="5 4"/>
<line x1="380" y1="100" x2="510" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="195" y="55" text-anchor="middle" class="svg-muted" font-size="12">radio (2.4 / 5 GHz)</text>
<text x="445" y="90" text-anchor="middle" class="svg-muted" font-size="12">cable + PoE</text>
<rect x="20" y="165" width="600" height="40" rx="6" fill="#fde68a"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">AP management VLAN 99 SW-MUM aur MX-MUM ke through cloud dashboard se baat karta hai</text>
</svg><p class="cap">AP air side (SSIDs) ko wired side (VLANs, switch, MX) se jodta hai.</p></div>

<h3>Cloud-managed AP: koi controller box nahi</h3>
<p>Traditional AP ya to ek ek karke configure hota hai, ya rack mein rakhe controller appliance se. <b>Cloud-managed</b> design mein AP apni configuration internet par dashboard se leta hai. Aap network ke <b>SSIDs</b> page par ek baar SSID set karte ho aur us network ke saare APs use apply kar lete hain. Isliye AP ko <b>dashboard tak pahunchna</b> zaroori hai. Uska management traffic VLAN 99 use karta hai. User traffic (staff aur guest) VLAN 10 aur VLAN 30 use karta hai. Dono ko alag rakhne ka matlab hai ki guest kabhi AP ke apne management address tak nahi pahunch sakta.</p>
<p>Is simulator mein AP tabhi <b>online</b> dikhta hai jab yeh sab sach ho: uska switch port enabled ho, PoE (power over Ethernet, network cable se power) on ho, port ka VLAN (access VLAN, ya trunk ka native VLAN) AP management VLAN 99 ke barabar ho, aur management VLAN MX tak pahunchta ho. Koi ek bhi galat ho to AP offline hai aur uske SSIDs gayab ho jaate hain. Real products mein aur detail hoti hai; vendor documentation check karo.</p>

<h3>Bharat Retail Co wireless plan</h3>
<table class="cmp"><tr><th>Site</th><th>AP</th><th>Tag</th><th>SSIDs</th></tr>
<tr><td>Mumbai HQ</td><td>AP-MUM</td><td>floor1</td><td>Staff, Guest</td></tr>
<tr><td>Bengaluru</td><td>AP-BLR</td><td>floor2</td><td>Staff, Guest</td></tr>
<tr><td>Delhi</td><td>AP-DEL</td><td>store</td><td>Staff, Guest</td></tr></table>
<p>Har network mein do SSIDs chalte hain: <code>BharatRetail-Staff</code> (WPA2 PSK, VLAN 10, visible) aur <code>BharatRetail-Guest</code> (open with click-through splash, VLAN 30, client isolation on). Agle chapters inhe step by step banate hain.</p>

<pre class="out">Devices  (network: Mumbai HQ)
Name     Type     Tag     Mgmt VLAN  Status
MX-MUM   MX       -       -          <span class="hl">online</span>
SW-MUM   MS       -       99         online
AP-MUM   MR       floor1  99          online</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Is chapter mein kuch nahi badalta. Yeh sirf Devices list padhta hai. Aage ke pages badalte hain ki AP kya broadcast karta hai (SSID, band) aur wireless client kis VLAN mein land karta hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> AP ko router samajhna (woh bridge karta hai; routing aur DHCP MX karta hai); PoE bhool jaana; AP port ko galat access VLAN mein rakhna; SSID (naam) aur VLAN (uske peeche ka network) ko mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Offline AP kuch broadcast nahi karta, isliye ek saath saare SSIDs gayab ho jaate hain. Agar sirf ek SSID missing hai to AP theek hai aur problem us SSID ki settings mein hai.</p></div>

<div class="scn"><h4>Naya store AP</h4><p>Delhi ne naya counter khola aur AP-DEL ko ek spare switch port mein laga diya. Staff ko Wi-Fi bilkul nahi dikha. Dashboard mein AP-DEL offline tha. Port VLAN 10 ka access port tha, VLAN 99 ka nahi, isliye AP dashboard tak nahi pahunch paya. Engineer ne port VLAN 99 aur PoE on kiya; AP lagbhag ek minute mein online aaya aur dono SSIDs dikhne lage.</p><p><b>Seekh:</b> ek AP par kahin bhi koi SSID nahi dikh raha to pehle AP ka status dekho: port, PoE, VLAN 99.</p></div>

<div class="iv"><p class="q">"SSID aur VLAN mein kya fark hai, aur cloud AP ko management VLAN kyun chahiye?"</p><p>Strong answer: SSID woh wireless naam hai jo user dekhta hai; VLAN woh wired network (subnet) hai jismein us user ka traffic land karta hai. Ek AP alag SSIDs ko alag VLANs se map kar sakta hai. AP ko cloud tak pahunchne ke liye apna management path bhi chahiye, jo alag VLAN 99 par rakha jaata hai taaki users use chhoo na sakein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP radio side ko wired network se bridge karta hai; routing aur DHCP MX hi karta hai.</li>
<li>Bands: 2.4 GHz door tak jaata hai par slow; 5 GHz tez lekin kam range.</li>
<li>SSID beacons se announce hone wala naam hai; ek AP kai SSIDs carry kar sakta hai.</li>
<li>Cloud-managed APs config dashboard se lete hain aur management VLAN 99 par use tak pahunchna zaroori hai.</li>
<li>AP online ke liye: port enabled, PoE on, port VLAN 99, MX tak path.</li>
</ul></div>
`}};export{e as default};