var e={id:`ssids-auth-and-vlans`,h:{en:`SSIDs: authentication, forwarding mode and VLANs`,hi:`SSIDs: authentication, forwarding mode aur VLANs`},body:{en:`
<h3>An SSID is a bundle of settings</h3>
<p>On the <b>SSIDs</b> page every SSID is a row with a number and a set of choices. Four choices decide almost everything: <b>who may join</b> (authentication), <b>where the traffic goes</b> (forwarding mode and VLAN), <b>which APs broadcast it</b> (availability) and <b>whether the name is shown</b> (broadcast on or off). This chapter walks through each one using the two Bharat Retail Co SSIDs.</p>

<h3>Authentication at concept level</h3>
<dl class="terms">
<dt>Open</dt><dd>Anyone can join with no password. Used for guest Wi-Fi, usually with a splash page (next chapters). The radio link is not encrypted by the network itself.</dd>
<dt>PSK (pre-shared key)</dt><dd>Everyone types the same passphrase. WPA2 PSK is simple and fine for a small staff group, but one leaked passphrase exposes the network.</dd>
<dt>802.1X</dt><dd>Each user logs in with their own identity, checked by a separate authentication server. It is the enterprise choice because you can remove one person without changing a shared password. This simulator teaches the idea only; the server setup is outside the scope.</dd>
</dl>
<p>For Bharat Retail Co: <code>BharatRetail-Staff</code> uses WPA2 PSK and <code>BharatRetail-Guest</code> is open with a click-through splash page.</p>

<h3>Forwarding mode: where does the client traffic go?</h3>
<table class="cmp"><tr><th>Mode</th><th>What happens</th><th>Typical use</th></tr>
<tr><td>NAT mode</td><td>The AP gives the client its own private address and translates it to the AP's address. The client does not join your VLANs.</td><td>Simple isolated guest Wi-Fi</td></tr>
<tr><td>Bridge mode</td><td>Client traffic is placed on the AP's own wired VLAN, untagged, so the client sits in the same network as the AP port.</td><td>Small sites, one network</td></tr>
<tr><td>VLAN tagging</td><td>Client traffic is tagged with the VLAN number you choose (10 or 30) and sent on the AP's uplink.</td><td>Staff and guest on one AP</td></tr></table>
<p>Bharat Retail Co uses <b>VLAN tagging</b>: staff clients go to VLAN 10 and guests to VLAN 30. The MX then serves DHCP for those VLANs and applies the firewall rules.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two SSIDs mapped to two VLANs over one trunk">
<rect x="20" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Staff-SSID PSK</text>
<rect x="20" y="90" width="150" height="40" rx="8" fill="#fed7aa"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="13">Guest-SSID open</text>
<rect x="250" y="50" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="305" y="90" text-anchor="middle" class="svg-ink" font-size="13">AP-BLR</text>
<line x1="170" y1="40" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><line x1="170" y1="110" x2="250" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="50" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">SW-BLR trunk port</text><text x="535" y="102" text-anchor="middle" class="svg-muted" font-size="12">native 99, allow 10,30,99</text>
<line x1="360" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="3"/>
<text x="405" y="72" text-anchor="middle" class="svg-muted" font-size="12">tags 10, 30</text>
<rect x="20" y="165" width="600" height="45" rx="6" fill="#fde68a"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">If VLAN 30 is not allowed on the trunk, Guest joins but gets no address</text>
</svg><p class="cap">Each SSID is tagged with its VLAN; the switch port must carry those VLANs.</p></div>

<h3>The AP switch port must trunk the VLANs</h3>
<p>This is the number one wireless mistake. Tagged traffic can only travel if the wired port carries it. The AP port on the switch must be a <b>trunk</b> with <b>native VLAN 99</b> (the AP's own management, untagged) and an <b>allowed VLAN list</b> that includes 10 and 30. If the port is an access port in VLAN 99, tagged client traffic is dropped: the client joins the SSID but never gets an IP address.</p>
<pre class="out">Switch ports  (network: Bengaluru Branch)
Port  Device   Type    Native  Allowed        PoE
7     AP-BLR   trunk   99      <span class="hl">10,99</span>          on
Check: SSID BharatRetail-Guest uses VLAN 30, not in allowed list 10,99</pre>

<h3>Availability by AP tag and broadcast on/off</h3>
<p>An SSID can be limited to APs with certain <b>tags</b>. If Guest is available only on tag <code>store</code>, then AP-DEL broadcasts it but AP-MUM (floor1) and AP-BLR (floor2) do not. <b>Broadcast</b> controls whether the beacon carries the name. A hidden SSID is still active, but users must type the name manually. Hiding is not real security; it only makes the list shorter.</p>
<pre class="out">SSIDs  (network: Bengaluru Branch)
#  Name                 Enabled  Auth      Mode      VLAN  Broadcast  Available on
1  BharatRetail-Staff   yes      WPA2 PSK  tagged    10    yes        all APs
2  BharatRetail-Guest   yes      open+splash tagged   30    yes        <span class="hl">tag: floor2</span></pre>

<div class="eg"><p><b>Worked example.</b> A Bengaluru phone joins BharatRetail-Staff. The AP tags the frame VLAN 10 and sends it up the trunk. SW-BLR forwards VLAN 10 to MX-BLR, which answers DHCP from 10.2.10.0/24 and the phone gets, for example, 10.2.10.120 with gateway 10.2.10.1. Had the allowed list lacked VLAN 10, no DHCP offer would return.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Changing auth changes how the radio link is secured. Changing mode or VLAN changes the tag on client frames and therefore which subnet and DHCP scope the client lands in. Changing availability or broadcast changes which APs send beacons for the name. Nothing changes until you press Save changes.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Leaving the AP port as an access port; forgetting to allow VLAN 10 or 30 on the trunk; setting the wrong VLAN on the SSID; assuming "hidden" means secure; sharing one PSK too widely.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Client connects to the SSID but gets no IP." Think VLAN path and DHCP, not the passphrase: a wrong passphrase would stop the join, not the address.</p></div>

<div class="scn"><h4>Connected but no internet</h4><p>After a new SSID for visiting auditors was created on VLAN 30, phones showed "connected, no internet". The SSID looked right. The AP trunk port allowed only VLAN 10 and 99. The engineer added 30 to the allowed list; phones received addresses from the 10.2.30.0/24 scope within seconds.</p><p><b>Lesson:</b> a new tagged SSID needs a matching trunk allowed list on the AP port.</p></div>

<div class="iv"><p class="q">"What is the difference between NAT, bridge and VLAN-tagged SSIDs?"</p><p>Strong answer: NAT mode hides clients behind the AP with its own addressing; bridge puts clients in the AP's own VLAN untagged; tagged mode maps each SSID to a chosen VLAN, which needs a trunk with that VLAN allowed. Mention that tagging is the way to run staff and guest on one AP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An SSID combines authentication, forwarding mode and VLAN, availability and broadcast.</li>
<li>Open, PSK and 802.1X trade ease for control; 802.1X gives per-user identity.</li>
<li>Tagged SSIDs need the AP switch port to trunk those VLANs with native 99.</li>
<li>Tag availability decides which APs broadcast an SSID.</li>
<li>Connected but no IP usually points to the VLAN path or DHCP, not the password.</li>
</ul></div>
`,hi:`
<h3>SSID settings ka ek bundle hai</h3>
<p><b>SSIDs</b> page par har SSID ek row hai jisme ek number aur kuch choices hote hain. Chaar choices lagbhag sab kuch decide karte hain: <b>kaun join kar sakta hai</b> (authentication), <b>traffic kahan jaata hai</b> (forwarding mode aur VLAN), <b>kaun se APs use broadcast karte hain</b> (availability) aur <b>naam dikhta hai ya nahi</b> (broadcast on ya off). Yeh chapter Bharat Retail Co ke do SSIDs ke saath har ek ko samjhata hai.</p>

<h3>Authentication concept level par</h3>
<dl class="terms">
<dt>Open</dt><dd>Koi bhi bina password ke join kar sakta hai. Guest Wi-Fi ke liye use hota hai, aam taur par splash page ke saath (agle chapters). Radio link network ki taraf se khud encrypt nahi hota.</dd>
<dt>PSK (pre-shared key)</dt><dd>Sab wahi ek passphrase type karte hain. WPA2 PSK simple hai aur chhote staff group ke liye theek hai, lekin ek leak hui passphrase poora network expose kar deti hai.</dd>
<dt>802.1X</dt><dd>Har user apni identity se login karta hai, jise alag authentication server check karta hai. Yeh enterprise choice hai kyunki shared password badle bina ek insaan ko hata sakte ho. Yeh simulator sirf idea sikhata hai; server setup scope ke bahar hai.</dd>
</dl>
<p>Bharat Retail Co ke liye: <code>BharatRetail-Staff</code> WPA2 PSK use karta hai aur <code>BharatRetail-Guest</code> open hai click-through splash page ke saath.</p>

<h3>Forwarding mode: client ka traffic kahan jaata hai?</h3>
<table class="cmp"><tr><th>Mode</th><th>Kya hota hai</th><th>Typical use</th></tr>
<tr><td>NAT mode</td><td>AP client ko apna private address deta hai aur use AP ke address mein translate karta hai. Client aapke VLANs mein join nahi karta.</td><td>Simple isolated guest Wi-Fi</td></tr>
<tr><td>Bridge mode</td><td>Client traffic AP ke apne wired VLAN par untagged jaata hai, to client AP port ke wahi network mein baithta hai.</td><td>Chhote sites, ek network</td></tr>
<tr><td>VLAN tagging</td><td>Client traffic par aapka chuna hua VLAN number (10 ya 30) tag hota hai aur AP uplink par jaata hai.</td><td>Ek AP par staff aur guest</td></tr></table>
<p>Bharat Retail Co <b>VLAN tagging</b> use karta hai: staff clients VLAN 10 mein aur guests VLAN 30 mein. Phir MX un VLANs ke liye DHCP deta hai aur firewall rules lagata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Do SSIDs do VLANs se map, ek trunk par">
<rect x="20" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Staff-SSID PSK</text>
<rect x="20" y="90" width="150" height="40" rx="8" fill="#fed7aa"/><text x="95" y="115" text-anchor="middle" class="svg-ink" font-size="13">Guest-SSID open</text>
<rect x="250" y="50" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="305" y="90" text-anchor="middle" class="svg-ink" font-size="13">AP-BLR</text>
<line x1="170" y1="40" x2="250" y2="70" stroke="#64748b" stroke-width="2"/><line x1="170" y1="110" x2="250" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="50" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">SW-BLR trunk port</text><text x="535" y="102" text-anchor="middle" class="svg-muted" font-size="12">native 99, allow 10,30,99</text>
<line x1="360" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="3"/>
<text x="405" y="72" text-anchor="middle" class="svg-muted" font-size="12">tags 10, 30</text>
<rect x="20" y="165" width="600" height="45" rx="6" fill="#fde68a"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Agar VLAN 30 trunk par allowed nahi, Guest join hota hai lekin address nahi milta</text>
</svg><p class="cap">Har SSID apne VLAN se tag hota hai; switch port ko wo VLANs carry karne chahiye.</p></div>

<h3>AP switch port ko VLANs trunk karne hi padte hain</h3>
<p>Yeh wireless ki number one galti hai. Tagged traffic tabhi chal sakta hai jab wired port use carry kare. Switch par AP port <b>trunk</b> hona chahiye jisme <b>native VLAN 99</b> (AP ka apna management, untagged) ho aur <b>allowed VLAN list</b> mein 10 aur 30 shaamil hon. Agar port VLAN 99 ka access port hai to tagged client traffic drop ho jaata hai: client SSID se join ho jaata hai lekin use kabhi IP address nahi milta.</p>
<pre class="out">Switch ports  (network: Bengaluru Branch)
Port  Device   Type    Native  Allowed        PoE
7     AP-BLR   trunk   99      <span class="hl">10,99</span>          on
Check: SSID BharatRetail-Guest uses VLAN 30, not in allowed list 10,99</pre>

<h3>Tag se availability aur broadcast on/off</h3>
<p>SSID ko kuch <b>tags</b> wale APs tak limit kiya ja sakta hai. Agar Guest sirf tag <code>store</code> par available hai, to AP-DEL use broadcast karta hai lekin AP-MUM (floor1) aur AP-BLR (floor2) nahi. <b>Broadcast</b> control karta hai ki beacon mein naam jaata hai ya nahi. Hidden SSID phir bhi active rehta hai, lekin users ko naam haath se type karna padta hai. Hide karna asli security nahi hai; yeh sirf list chhoti karta hai.</p>
<pre class="out">SSIDs  (network: Bengaluru Branch)
#  Name                 Enabled  Auth      Mode      VLAN  Broadcast  Available on
1  BharatRetail-Staff   yes      WPA2 PSK  tagged    10    yes        all APs
2  BharatRetail-Guest   yes      open+splash tagged   30    yes        <span class="hl">tag: floor2</span></pre>

<div class="eg"><p><b>Worked example.</b> Bengaluru ka ek phone BharatRetail-Staff join karta hai. AP frame par VLAN 10 tag lagata hai aur trunk par bhejta hai. SW-BLR VLAN 10 ko MX-BLR tak forward karta hai, jo 10.2.10.0/24 se DHCP jawab deta hai aur phone ko, jaise, 10.2.10.120 aur gateway 10.2.10.1 milta hai. Agar allowed list mein VLAN 10 na hota to koi DHCP offer wapas nahi aata.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Auth badalne se radio link ki security badalti hai. Mode ya VLAN badalne se client frames ka tag badalta hai, isliye client kaun se subnet aur DHCP scope mein land karta hai woh badalta hai. Availability ya broadcast badalne se badalta hai ki kaun se APs naam ke beacons bhejte hain. Save changes dabane tak kuch nahi badalta.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> AP port ko access port chhod dena; trunk par VLAN 10 ya 30 allow karna bhool jaana; SSID par galat VLAN set karna; "hidden" ko secure samajhna; ek PSK ko bahut logon mein share karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Client SSID se connect hota hai lekin IP nahi milta." VLAN path aur DHCP sochो, password nahi: galat passphrase join rokta hai, address nahi.</p></div>

<div class="scn"><h4>Connected lekin internet nahi</h4><p>Visiting auditors ke liye VLAN 30 par naya SSID banane ke baad phones par "connected, no internet" dikha. SSID sahi lag raha tha. AP trunk port sirf VLAN 10 aur 99 allow karta tha. Engineer ne allowed list mein 30 add kiya; phones ko kuch seconds mein 10.2.30.0/24 scope se address mil gaye.</p><p><b>Seekh:</b> naye tagged SSID ko AP port par matching trunk allowed list chahiye.</p></div>

<div class="iv"><p class="q">"NAT, bridge aur VLAN-tagged SSIDs mein kya fark hai?"</p><p>Strong answer: NAT mode clients ko AP ke peeche apni addressing ke saath chhupata hai; bridge clients ko AP ke apne VLAN mein untagged rakhta hai; tagged mode har SSID ko chune hue VLAN se map karta hai, jiske liye us VLAN wala trunk allowed chahiye. Batao ki ek AP par staff aur guest chalane ka tareeka tagging hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSID mein authentication, forwarding mode aur VLAN, availability aur broadcast ka combination hota hai.</li>
<li>Open, PSK aur 802.1X mein aasaani aur control ka trade-off hai; 802.1X per-user identity deta hai.</li>
<li>Tagged SSIDs ko AP switch port par un VLANs ka trunk chahiye, native 99 ke saath.</li>
<li>Tag availability decide karti hai ki kaun se APs SSID broadcast karte hain.</li>
<li>Connected lekin IP nahi aam taur par VLAN path ya DHCP ki taraf ishara karta hai, password ki taraf nahi.</li>
</ul></div>
`}};export{e as default};