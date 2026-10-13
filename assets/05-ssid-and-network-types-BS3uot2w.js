var e={id:`ssid-types`,h:{en:`SSID, BSSID, ESSID and wireless network types`,hi:`SSID, BSSID, ESSID aur wireless network types`},body:{en:`
<p>Think of a chain of coffee shops called "Bean There". The <b>brand name</b> on every door is the same, but each branch has its own <b>street address</b>. The whole chain together is one <b>franchise</b>. A customer with a loyalty card can walk into any branch and be served. In Wi-Fi, the brand name is the SSID, each branch's address is a BSSID, and the chain is the ESS.</p>

<h3>The identifiers</h3>
<dl class="terms">
<dt>SSID (service set identifier)</dt><dd>The network name users see, up to 32 characters, for example <code>CORP-OFFICE</code>. One AP can advertise several SSIDs (staff, guest, IoT), each usually mapped to a different VLAN. Hiding the SSID (turning off broadcast) does not secure anything: the name still appears in probe and association frames.</dd>
<dt>BSS (basic service set)</dt><dd>One AP radio and the clients associated to it: one cell.</dd>
<dt>BSSID (basic service set identifier)</dt><dd>The MAC address that identifies one BSS: in practice, one radio of one AP for one SSID. If an AP has two radios (2.4 and 5 GHz) and three SSIDs, it advertises six BSSIDs. The client's frames carry the BSSID so it knows exactly which AP radio it is talking to.</dd>
<dt>ESS (extended service set) and ESSID</dt><dd>Several BSSs with the same SSID and security, joined by a wired distribution system (the switched LAN), so a client can move between them. The ESSID is simply the SSID used across that ESS. When people say "extend the network with another AP", they mean adding a BSS to the ESS.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SSID, BSSID and ESS">
<rect x="20" y="16" width="600" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">Distribution system: switches and VLAN 20</text>
<rect x="60" y="90" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="135" y="110" text-anchor="middle" class="svg-ink" font-size="13">AP1 (BSS 1)</text><text x="135" y="127" text-anchor="middle" class="svg-muted" font-size="12">BSSID ...98:00</text>
<rect x="245" y="90" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">AP2 (BSS 2)</text><text x="320" y="127" text-anchor="middle" class="svg-muted" font-size="12">BSSID ...9a:00</text>
<rect x="430" y="90" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="505" y="110" text-anchor="middle" class="svg-ink" font-size="13">AP3 (BSS 3)</text><text x="505" y="127" text-anchor="middle" class="svg-muted" font-size="12">BSSID ...9b:00</text>
<line x1="135" y1="52" x2="135" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="52" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="505" y1="52" x2="505" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="160" width="520" height="34" rx="8" fill="none" stroke="#64748b" stroke-dasharray="5 4"/><text x="320" y="182" text-anchor="middle" class="svg-accent" font-size="13">ESS: SSID CORP-OFFICE on every AP, same security</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Client roams AP1 to AP2: same SSID and VLAN, new BSSID, same IP address</text>
</svg><p class="cap">One SSID, three BSSIDs, one ESS. Roaming happens between BSSs inside the ESS.</p></div>
<p>A client's own tools show all of this. On a Windows laptop, <code>netsh wlan show networks mode=bssid</code> lists each SSID with its BSSIDs:</p>
<pre class="out">SSID 1 : CORP-OFFICE
    Network type            : Infrastructure
    Authentication          : WPA2-Personal
    Encryption              : CCMP
    <span class="hl">BSSID 1                 : 00:50:42:a6:98:10</span>
         Signal             : 88%
         Radio type         : 802.11ax
         Band               : 5 GHz
         Channel            : 36
    <span class="hl">BSSID 2                 : 00:50:43:a6:9a:10</span>
         Signal             : 61%
         Radio type         : 802.11ax
         Band               : 5 GHz
         Channel            : 40</pre>

<h3>Roaming in one paragraph</h3>
<p>The <b>client</b>, not the AP, decides when to roam. When its signal from the current AP drops (many clients start looking below about -70 to -75 dBm), it scans, picks a better BSSID in the same ESS and re-associates. For a seamless roam, every AP must use the same SSID, security and VLAN, and cells must overlap by about 15 to 20 percent. Standards that help: <b>802.11k</b> (the AP gives a neighbour list so the client scans less), <b>802.11v</b> (the AP can suggest a better AP) and <b>802.11r</b> (fast BSS transition: keys are prepared in advance so voice calls survive the move).</p>

<h3>Wireless network types</h3>
<table class="cmp"><tr><th>Type</th><th>How it works</th><th>Typical use</th></tr>
<tr><td><b>Infrastructure</b></td><td>Clients talk only through an AP (a BSS or ESS). The AP bridges to the wired LAN.</td><td>Almost every business and home WLAN</td></tr>
<tr><td><b>Ad hoc (IBSS)</b></td><td>Independent BSS: clients talk directly to each other with no AP. No central control, no wired uplink.</td><td>Quick file sharing, some printers and cameras in setup mode; Wi-Fi Direct is a modern peer-to-peer variant</td></tr>
<tr><td><b>Mesh</b></td><td>APs connect to each other wirelessly. Only one or a few <b>root</b> or gateway APs have a cable; others relay traffic over a wireless backhaul and can re-route if one fails.</td><td>Large homes, campuses, outdoor areas, places where cabling is hard</td></tr>
<tr><td><b>Point-to-point (PtP)</b></td><td>Two radios with directional antennas form a wireless bridge between two sites.</td><td>Linking two buildings across a road or car park</td></tr>
<tr><td><b>Point-to-multipoint (PtMP)</b></td><td>One central radio links to several remote radios.</td><td>Campus distribution, wireless ISPs</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A school has a main block and a sports hall 150 m away across a field, with no conduit for fibre. A point-to-point link with two directional antennas on the roofs bridges the hall's switch to the main block. Inside the hall, three APs form an ESS with the same SSID as the main block, so students roam from the main building into the hall without reconnecting. In the playground, where no cable reaches, two mesh APs relay through a rooftop root AP.</p></div>

<div class="warn"><p><b>Common mistake.</b> Every mesh hop shares the same air as the clients, unless the AP has a dedicated backhaul radio. Throughput can roughly halve with each hop. Keep mesh to one or two hops and cable APs wherever possible.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSID = name; BSSID = MAC of an AP radio for that SSID; ESSID = the SSID used across several APs of an ESS. An ad hoc network is an IBSS and has no AP. A question describing APs that connect to each other wirelessly with only one wired AP is describing <b>mesh</b>.</p></div>

<div class="scn"><h4>Roaming that dropped every call</h4><p>A retailer added two APs in its stockroom. Staff phones dropped calls when walking from the shop floor into the stockroom. The engineer found the new APs advertised the same SSID name but with WPA2-Personal instead of WPA2-Enterprise, and put users in VLAN 30 instead of VLAN 20. To the phone this was a different network, so it had to fully re-authenticate and get a new IP address. After matching security and VLAN, roams took milliseconds.</p><p><b>Lesson:</b> an ESS needs the same SSID, the same security and the same VLAN on every AP.</p></div>

<div class="iv"><p class="q">"What is the difference between an SSID and a BSSID?"</p><p>Strong answer: the SSID is the human-readable network name shared by many APs; the BSSID is the MAC address of one AP radio serving that SSID, so it uniquely identifies one cell. One AP with two radios and three SSIDs has six BSSIDs. Several BSSs with the same SSID form an ESS, and clients roam between BSSIDs inside it. Mention that hiding the SSID is not a security control.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSID = network name (max 32 characters); BSSID = MAC of one AP radio for one SSID; ESS/ESSID = one SSID over many APs.</li>
<li>Clients decide when to roam; same SSID, security and VLAN plus 15 to 20 percent overlap make roaming smooth.</li>
<li>802.11k, 802.11v and 802.11r speed up and guide roaming.</li>
<li>Network types: infrastructure, ad hoc (IBSS), mesh, point-to-point and point-to-multipoint.</li>
<li>Hiding the SSID is not security.</li>
</ul></div>
`,hi:`
<p>"Bean There" naam ki coffee shops ki ek chain socho. Har darwaze par <b>brand naam</b> same hai, par har branch ka apna <b>street address</b> hai. Poori chain milkar ek <b>franchise</b> hai. Loyalty card wala customer kisi bhi branch mein jaakar serve ho sakta hai. Wi-Fi mein brand naam SSID hai, har branch ka address BSSID hai, aur chain ESS hai.</p>

<h3>Identifiers</h3>
<dl class="terms">
<dt>SSID (service set identifier)</dt><dd>Network ka naam jo users dekhte hain, 32 characters tak, jaise <code>CORP-OFFICE</code>. Ek AP kai SSIDs advertise kar sakta hai (staff, guest, IoT), har ek aam taur par alag VLAN se mapped. SSID chhupana (broadcast off karna) kuch secure nahi karta: naam phir bhi probe aur association frames mein dikhta hai.</dd>
<dt>BSS (basic service set)</dt><dd>Ek AP radio aur usse associated clients: ek cell.</dd>
<dt>BSSID (basic service set identifier)</dt><dd>Woh MAC address jo ek BSS ko identify karta hai: practice mein, ek SSID ke liye ek AP ka ek radio. Agar AP ke do radios (2.4 aur 5 GHz) aur teen SSIDs hain, to woh chhe BSSIDs advertise karta hai. Client ke frames mein BSSID hota hai taaki use bilkul pata ho ki woh kis AP radio se baat kar raha hai.</dd>
<dt>ESS (extended service set) aur ESSID</dt><dd>Same SSID aur security wale kai BSS, jo wired distribution system (switched LAN) se jude hain, taaki client unke beech move kar sake. ESSID bas us ESS mein use hone wala SSID hai. Jab log kehte hain "ek aur AP se network badhao", unka matlab hai ESS mein ek BSS jodna.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SSID, BSSID aur ESS">
<rect x="20" y="16" width="600" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">Distribution system: switches aur VLAN 20</text>
<rect x="60" y="90" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="135" y="110" text-anchor="middle" class="svg-ink" font-size="13">AP1 (BSS 1)</text><text x="135" y="127" text-anchor="middle" class="svg-muted" font-size="12">BSSID ...98:00</text>
<rect x="245" y="90" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">AP2 (BSS 2)</text><text x="320" y="127" text-anchor="middle" class="svg-muted" font-size="12">BSSID ...9a:00</text>
<rect x="430" y="90" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="505" y="110" text-anchor="middle" class="svg-ink" font-size="13">AP3 (BSS 3)</text><text x="505" y="127" text-anchor="middle" class="svg-muted" font-size="12">BSSID ...9b:00</text>
<line x1="135" y1="52" x2="135" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="52" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="505" y1="52" x2="505" y2="90" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="160" width="520" height="34" rx="8" fill="none" stroke="#64748b" stroke-dasharray="5 4"/><text x="320" y="182" text-anchor="middle" class="svg-accent" font-size="13">ESS: har AP par SSID CORP-OFFICE, same security</text>
<text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">Client AP1 se AP2 roam karta hai: same SSID aur VLAN, naya BSSID, same IP address</text>
</svg><p class="cap">Ek SSID, teen BSSIDs, ek ESS. Roaming ESS ke andar BSSs ke beech hoti hai.</p></div>
<p>Client ke apne tools yeh sab dikhate hain. Windows laptop par <code>netsh wlan show networks mode=bssid</code> har SSID ko uske BSSIDs ke saath list karta hai:</p>
<pre class="out">SSID 1 : CORP-OFFICE
    Network type            : Infrastructure
    Authentication          : WPA2-Personal
    Encryption              : CCMP
    <span class="hl">BSSID 1                 : 00:50:42:a6:98:10</span>
         Signal             : 88%
         Radio type         : 802.11ax
         Band               : 5 GHz
         Channel            : 36
    <span class="hl">BSSID 2                 : 00:50:43:a6:9a:10</span>
         Signal             : 61%
         Radio type         : 802.11ax
         Band               : 5 GHz
         Channel            : 40</pre>

<h3>Roaming ek paragraph mein</h3>
<p>Roam kab karna hai yeh <b>client</b> tay karta hai, AP nahi. Jab current AP se uska signal girta hai (kai clients lagbhag -70 se -75 dBm ke neeche dhoondhna shuru karte hain), woh scan karta hai, same ESS mein behtar BSSID chunta hai aur re-associate karta hai. Seamless roam ke liye har AP ko same SSID, security aur VLAN use karna chahiye, aur cells lagbhag 15 se 20 percent overlap hone chahiye. Madad karne wale standards: <b>802.11k</b> (AP neighbour list deta hai taaki client kam scan kare), <b>802.11v</b> (AP behtar AP suggest kar sakta hai) aur <b>802.11r</b> (fast BSS transition: keys pehle se taiyaar hoti hain taaki voice calls move mein bach jaayein).</p>

<h3>Wireless network types</h3>
<table class="cmp"><tr><th>Type</th><th>Kaise kaam karta hai</th><th>Typical use</th></tr>
<tr><td><b>Infrastructure</b></td><td>Clients sirf AP ke through baat karte hain (ek BSS ya ESS). AP wired LAN se bridge karta hai.</td><td>Lagbhag har business aur ghar ka WLAN</td></tr>
<tr><td><b>Ad hoc (IBSS)</b></td><td>Independent BSS: clients bina AP ke seedhe ek doosre se baat karte hain. Koi central control nahi, koi wired uplink nahi.</td><td>Jaldi file sharing, setup mode mein kuch printers aur cameras; Wi-Fi Direct ek modern peer-to-peer variant hai</td></tr>
<tr><td><b>Mesh</b></td><td>APs ek doosre se wirelessly judte hain. Sirf ek ya kuch <b>root</b> ya gateway APs ke paas cable hoti hai; baaki wireless backhaul par traffic relay karte hain aur ek fail ho to re-route kar sakte hain.</td><td>Bade ghar, campuses, outdoor areas, jahan cabling mushkil ho</td></tr>
<tr><td><b>Point-to-point (PtP)</b></td><td>Directional antennas wale do radios do sites ke beech wireless bridge banate hain.</td><td>Sadak ya car park ke paar do buildings jodna</td></tr>
<tr><td><b>Point-to-multipoint (PtMP)</b></td><td>Ek central radio kai remote radios se judta hai.</td><td>Campus distribution, wireless ISPs</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek school ka main block hai aur 150 m door maidan ke paar ek sports hall, fibre ke liye koi conduit nahi. Roofs par do directional antennas wala point-to-point link hall ke switch ko main block se bridge karta hai. Hall ke andar teen APs main block wale same SSID ke saath ek ESS banate hain, isliye students bina reconnect kiye main building se hall mein roam karte hain. Playground mein, jahan koi cable nahi pahunchti, do mesh APs rooftop root AP ke through relay karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Har mesh hop clients wali same hawa share karta hai, jab tak AP ke paas dedicated backhaul radio na ho. Har hop ke saath throughput lagbhag aadha ho sakta hai. Mesh ko ek ya do hops tak rakho aur jahan ho sake APs ko cable karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> SSID = naam; BSSID = us SSID ke liye AP radio ka MAC; ESSID = ESS ke kai APs par use hone wala SSID. Ad hoc network ek IBSS hai aur usmein koi AP nahi hota. Jo sawaal aise APs describe kare jo sirf ek wired AP ke saath ek doosre se wirelessly judte hain, woh <b>mesh</b> describe kar raha hai.</p></div>

<div class="scn"><h4>Roaming jo har call drop kar deti thi</h4><p>Ek retailer ne apne stockroom mein do APs jode. Shop floor se stockroom mein jaate hue staff phones calls drop karte the. Engineer ne paaya ki naye APs same SSID naam advertise kar rahe the par WPA2-Enterprise ki jagah WPA2-Personal ke saath, aur users ko VLAN 20 ki jagah VLAN 30 mein daal rahe the. Phone ke liye yeh alag network tha, isliye use poora re-authenticate karna aur naya IP address lena padta tha. Security aur VLAN match karne ke baad roams milliseconds mein hone lage.</p><p><b>Seekh:</b> ESS ko har AP par same SSID, same security aur same VLAN chahiye.</p></div>

<div class="iv"><p class="q">"SSID aur BSSID mein kya fark hai?"</p><p>Strong answer: SSID human-readable network naam hai jo kai APs share karte hain; BSSID us SSID ko serve karne wale ek AP radio ka MAC address hai, isliye yeh ek cell ko uniquely identify karta hai. Do radios aur teen SSIDs wale ek AP ke chhe BSSIDs hote hain. Same SSID wale kai BSS ek ESS banate hain, aur clients uske andar BSSIDs ke beech roam karte hain. Batao ki SSID chhupana security control nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SSID = network naam (max 32 characters); BSSID = ek SSID ke liye ek AP radio ka MAC; ESS/ESSID = kai APs par ek SSID.</li>
<li>Roam kab karna hai client tay karta hai; same SSID, security aur VLAN plus 15 se 20 percent overlap roaming smooth banate hain.</li>
<li>802.11k, 802.11v aur 802.11r roaming ko tez aur guide karte hain.</li>
<li>Network types: infrastructure, ad hoc (IBSS), mesh, point-to-point aur point-to-multipoint.</li>
<li>SSID chhupana security nahi hai.</li>
</ul></div>
`}};export{e as default};