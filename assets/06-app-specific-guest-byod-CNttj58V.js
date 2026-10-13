var e=(e,t,n,r,i,a)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="6" fill="`+i+`" stroke="#64748b"/>`+(a?`<text x="`+(e+n/2)+`" y="`+(t+r/2+4)+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`:``),t=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(i||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,n=(e,t,n,r,i,a)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="`+i+`" stroke-width="2"`+(a?` stroke-dasharray="6 4"`:``)+`/>`,r=(e,t)=>`<circle cx="`+e+`" cy="`+t+`" r="8" fill="#0ea5e9" stroke="#0369a1"/>`,i=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="6" fill="`+n+`" stroke="#334155" stroke-width="2"/>`,a=a=>`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="`+a.aria+`">`+i(30,60,`#22c55e`)+t(30,82,a.guest)+i(30,170,`#f97316`)+t(30,192,a.byod)+n(30,60,130,115,`#22c55e`,!0)+n(30,170,130,115,`#f97316`,!0)+r(130,115)+n(138,115,200,115,`#64748b`)+e(200,95,110,40,`#ddd6fe`,a.wlc)+e(400,20,120,40,`#ddd6fe`,a.anchor)+n(310,105,400,45,`#7c3aed`)+t(300,62,a.tun,`svg-accent`)+`<ellipse cx="580" cy="40" rx="42" ry="22" fill="#e2e8f0" stroke="#64748b"/>`+t(580,44,a.net)+n(520,40,538,40,`#64748b`)+e(400,150,120,40,`#fde68a`,a.ise)+n(310,125,400,165,`#64748b`)+t(355,206,a.rad,`svg-muted`)+e(540,150,80,40,`#bbf7d0`,a.corp)+`<polyline points="130,123 130,225 580,225 580,190" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>`+t(355,242,a.onb,`svg-ink`)+r(24,266)+t(38,270,a.k1,`svg-ink`,`start`)+e(88,258,22,16,`#ddd6fe`,``)+t(118,270,a.k2,`svg-ink`,`start`)+n(230,266,260,266,`#22c55e`,!0)+t(268,270,a.k3,`svg-ink`,`start`)+n(380,266,410,266,`#f97316`,!0)+t(418,270,a.k4,`svg-ink`,`start`)+n(20,284,50,284,`#7c3aed`)+t(58,288,a.k5,`svg-ink`,`start`)+`</svg><p class="cap">`+a.cap+`</p></div>`,o=a({aria:`Guest anchor tunnel and BYOD onboarding path`,guest:`Guest`,byod:`BYOD`,wlc:`Campus WLC`,anchor:`Guest anchor, DMZ`,tun:`Anchor tunnel`,net:`Internet`,ise:`ISE: portal, certs`,rad:`RADIUS and CoA`,corp:`Corp LAN`,onb:`Onboarded BYOD: EAP-TLS to corporate`,k1:`AP`,k2:`Controller`,k3:`Guest path`,k4:`BYOD path`,k5:`Anchor tunnel`,cap:`Redstone Industries: guests exit through the DMZ anchor, while onboarded employee devices join the secure SSID.`}),s=a({aria:`Guest anchor tunnel aur BYOD onboarding path`,guest:`Guest`,byod:`BYOD`,wlc:`Campus WLC`,anchor:`Guest anchor, DMZ`,tun:`Anchor tunnel`,net:`Internet`,ise:`ISE: portal, certs`,rad:`RADIUS aur CoA`,corp:`Corp LAN`,onb:`Onboarded BYOD: corporate tak EAP-TLS`,k1:`AP`,k2:`Controller`,k3:`Guest path`,k4:`BYOD path`,k5:`Anchor tunnel`,cap:`Redstone Industries: guests DMZ anchor se bahar jate hain, jabki onboarded employee devices secure SSID join karte hain.`}),c={id:`app-specific-guest-byod`,h:{en:`Industry designs, guest access and BYOD onboarding`,hi:`Industry designs, guest access aur BYOD onboarding`},body:{en:`
<h3>Case 6: Redstone Industries (fictional)</h3>
<p>Redstone runs a plant and an attached warehouse. In the warehouse, forklift-mounted scanners and handhelds roam fast between racking aisles. In the plant, automated guided vehicles (AGVs) move on set paths. The office wing hosts visitors every day, and employees want to use their own phones for e-mail.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>Scanners must keep their sessions while moving at forklift speed, with roams fast enough that the app does not time out.</li>
<li>Guests must reach the internet but never the internal network, and must accept terms first.</li>
<li>Employee phones must connect securely without the help desk touching each device.</li>
<li>Racking, metal and moving stock change the RF picture; the plant is dusty and hot in some areas.</li>
</ul>

<h3>Industry patterns</h3>
<table class="cmp"><tr><th>Industry</th><th>What drives the design</th><th>Typical choices</th></tr>
<tr><td><b>Healthcare</b></td><td>Voice badges and phones, medical devices, location, patient and guest Wi-Fi</td><td>Voice-grade design, 5 GHz first, device-specific SSIDs, tight RF to avoid interference with sensitive equipment</td></tr>
<tr><td><b>Retail</b></td><td>POS and scanners, guest Wi-Fi, footfall analytics, IoT labels</td><td>Separate payment VLAN, location-ready design, guest portal with consent</td></tr>
<tr><td><b>Warehouse</b></td><td>Scanners, forklifts, rack attenuation, aisle coverage</td><td>Directional antennas aimed down aisles, tested roaming, clean channels, rugged APs</td></tr>
<tr><td><b>Manufacturing</b></td><td>AGVs, OT devices, vibration, heat, dust, EMI</td><td>Industrial or IP-rated APs, fast-roaming validation, segmentation between IT and OT</td></tr>
</table>
<p>In warehouses the survey must be done with the real stock levels. A full pallet rack absorbs far more signal than an empty one, so a design that works on a Sunday can fail on a Monday.</p>

<h3>Guest access design</h3>
<p>A guest WLAN has four parts: an <b>isolated path</b>, <b>authentication</b>, <b>policy</b> and <b>limits</b>.</p>
<ul>
<li><b>Isolated path.</b> The campus controller tunnels guest traffic to a <b>guest anchor controller</b> in the DMZ. The anchor puts guests on a guest VLAN that the firewall allows only to the internet. This is a mobility anchor tunnel, as in chapter 1.</li>
<li><b>Authentication.</b> Central web authentication (CWA) with Cisco ISE: the client uses MAC filtering, is redirected to a portal, accepts a policy or registers (self-registration, sponsor approval or hotspot-style acceptance), and ISE sends a change of authorization (CoA) to the controller to open access.</li>
<li><b>Policy.</b> Client isolation (peer-to-peer blocking), an ACL, DNS rules and web filtering.</li>
<li><b>Limits.</b> A Bronze or equivalent QoS profile, per-client rate limit, session timeout and a short lifetime for sponsored accounts.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> 150 concurrent guests at peak and a 500 Mbps internet link. Without limits, ten heavy users could take most of it. A per-client limit of 2 Mbps caps the guest total near 300 Mbps (150 x 2) in the worst case, leaving headroom for corporate traffic on a separate link or QoS class.</p></div>
<p>Ports that matter: RADIUS authentication uses UDP 1812 and accounting UDP 1813, and CoA uses UDP 3799 (some Cisco platforms use 1700). If the firewall blocks CoA, the guest accepts the terms but stays on the portal page.</p>
`+o+`
<h3>BYOD onboarding</h3>
<table class="cmp"><tr><th>Model</th><th>How it works</th><th>Trade-off</th></tr>
<tr><td><b>Dual SSID</b></td><td>Employee joins an onboarding SSID, signs in on an ISE portal, receives a profile and certificate, then joins the secure 802.1X SSID</td><td>Clear separation, but the user switches SSID</td></tr>
<tr><td><b>Single SSID</b></td><td>The device joins the 802.1X SSID with a username and password, ISE restricts it, then provisions the certificate and reconnects with EAP-TLS</td><td>Better user experience, more ISE policy</td></tr>
<tr><td><b>MDM-assisted</b></td><td>The MDM pushes the profile and certificate and ISE trusts MDM status</td><td>Strong control, needs MDM enrolment</td></tr>
</table>
<p>The end state should be <b>EAP-TLS</b> with a device or user certificate, because certificates remove password risk. Policy then decides the VLAN or group tag by user, device type and compliance. Remember that the 6 GHz band requires WPA3.</p>

<h3>Chosen design</h3>
<p>Redstone uses a guest anchor in the DMZ with CWA and sponsor approval for contractors, a dual-SSID BYOD flow with EAP-TLS, rugged APs with directional antennas in the warehouse aisles, fast transition validated with the actual scanner models, and separate IT and OT segments.</p>

<div class="warn"><p><b>Common mistakes.</b> A different WLAN profile on the anchor and foreign controllers (the tunnel will not form a working path), forgetting the firewall rules for the mobility tunnel and for CoA, allowing guests to reach internal DNS, and enabling 802.11r for scanners that do not support it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Guest anchoring keeps guest traffic out of the campus VLANs. Questions ask which device terminates guest traffic (the anchor in the DMZ) and where the portal logic lives (ISE). Do not confuse the onboarding SSID with the secure SSID.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>Guests stuck on the portal</h4><p>On day one guests accepted the terms but could not browse. ISE logs showed a successful guest login, yet the controller still held the redirect ACL. The security team had not allowed CoA from ISE to the campus controller. After the firewall rule was added, access opened within seconds. They also added a health check for CoA to the go-live checklist.</p><p><b>Lesson:</b> a portal that looks fine can still fail on the return path. Test the whole flow, from client to CoA.</p></div>

<div class="iv"><p class="q">"How do you design guest Wi-Fi for a campus with a DMZ?"</p><p>Strong answer: guest WLAN anchored to a DMZ controller, central web authentication with ISE, redirect ACL and CoA, client isolation, rate limits and timeouts, and firewall rules that allow only the internet. Mention validating the mobility tunnel and the CoA path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest traffic is anchored in the DMZ and filtered by the firewall.</li>
<li>CWA uses MAB, a redirect, the portal and CoA.</li>
<li>BYOD can be dual SSID, single SSID or MDM-assisted, ending in EAP-TLS.</li>
<li>Warehouses and plants need survey with real stock and rugged, directional design.</li>
<li>Separate IT and OT, and guest and corporate, at every layer.</li>
</ul></div>
`,hi:`
<h3>Case 6: Redstone Industries (fictional)</h3>
<p>Redstone ek plant aur usse jura warehouse chalata hai. Warehouse mein forklift par lage scanners aur handhelds racking aisles ke beech tezi se roam karte hain. Plant mein automated guided vehicles (AGVs) tay paths par chalte hain. Office wing mein roz visitors aate hain, aur employees e-mail ke liye apne phones use karna chahte hain.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Scanners forklift speed se chalte hue bhi apne sessions rakhein, roams itne fast ho ki app time out na ho.</li>
<li>Guests internet tak pahunchein lekin internal network tak kabhi nahi, aur pehle terms accept karein.</li>
<li>Employee phones bina help desk ke har device ko chhue securely connect hon.</li>
<li>Racking, metal aur moving stock RF picture badalte hain; plant kuch jagah dusty aur garam hai.</li>
</ul>

<h3>Industry patterns</h3>
<table class="cmp"><tr><th>Industry</th><th>Design kya drive karta hai</th><th>Typical choices</th></tr>
<tr><td><b>Healthcare</b></td><td>Voice badges aur phones, medical devices, location, patient aur guest Wi-Fi</td><td>Voice-grade design, pehle 5 GHz, device-specific SSIDs, sensitive equipment se interference bachane ke liye tight RF</td></tr>
<tr><td><b>Retail</b></td><td>POS aur scanners, guest Wi-Fi, footfall analytics, IoT labels</td><td>Alag payment VLAN, location-ready design, consent ke saath guest portal</td></tr>
<tr><td><b>Warehouse</b></td><td>Scanners, forklifts, rack attenuation, aisle coverage</td><td>Aisles ki taraf aimed directional antennas, tested roaming, clean channels, rugged APs</td></tr>
<tr><td><b>Manufacturing</b></td><td>AGVs, OT devices, vibration, heat, dust, EMI</td><td>Industrial ya IP-rated APs, fast-roaming validation, IT aur OT ke beech segmentation</td></tr>
</table>
<p>Warehouses mein survey real stock levels ke saath karna chahiye. Bhara pallet rack khaali rack se kahin zyada signal absorb karta hai, isliye jo design Sunday ko chalta hai woh Monday ko fail ho sakta hai.</p>

<h3>Guest access design</h3>
<p>Guest WLAN ke chaar hisse hote hain: <b>isolated path</b>, <b>authentication</b>, <b>policy</b> aur <b>limits</b>.</p>
<ul>
<li><b>Isolated path.</b> Campus controller guest traffic ko DMZ ke <b>guest anchor controller</b> tak tunnel karta hai. Anchor guests ko guest VLAN par rakhta hai jise firewall sirf internet tak allow karta hai. Yeh chapter 1 jaisa mobility anchor tunnel hai.</li>
<li><b>Authentication.</b> Cisco ISE ke saath central web authentication (CWA): client MAC filtering use karta hai, portal par redirect hota hai, policy accept karta hai ya register karta hai (self-registration, sponsor approval ya hotspot-style acceptance), aur ISE access kholne ke liye controller ko change of authorization (CoA) bhejta hai.</li>
<li><b>Policy.</b> Client isolation (peer-to-peer blocking), ACL, DNS rules aur web filtering.</li>
<li><b>Limits.</b> Bronze ya equivalent QoS profile, per-client rate limit, session timeout aur sponsored accounts ki chhoti lifetime.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Peak par 150 concurrent guests aur 500 Mbps internet link. Limits ke bina das heavy users zyadatar link le sakte hain. 2 Mbps per-client limit worst case mein guest total ko lagbhag 300 Mbps (150 x 2) par cap karti hai, aur corporate traffic ke liye alag link ya QoS class ke saath headroom bachta hai.</p></div>
<p>Jo ports matter karte hain: RADIUS authentication UDP 1812 aur accounting UDP 1813 use karta hai, aur CoA UDP 3799 (kuch Cisco platforms 1700 use karte hain). Agar firewall CoA block kare, to guest terms accept kar leta hai lekin portal page par atka rehta hai.</p>
`+s+`
<h3>BYOD onboarding</h3>
<table class="cmp"><tr><th>Model</th><th>Kaise kaam karta hai</th><th>Trade-off</th></tr>
<tr><td><b>Dual SSID</b></td><td>Employee onboarding SSID join karta hai, ISE portal par sign in karta hai, profile aur certificate leta hai, phir secure 802.1X SSID join karta hai</td><td>Clear separation, lekin user ko SSID badalna padta hai</td></tr>
<tr><td><b>Single SSID</b></td><td>Device username aur password se 802.1X SSID join karta hai, ISE use restrict karta hai, phir certificate provision karke EAP-TLS se reconnect karta hai</td><td>Behtar user experience, zyada ISE policy</td></tr>
<tr><td><b>MDM-assisted</b></td><td>MDM profile aur certificate push karta hai aur ISE MDM status par trust karta hai</td><td>Strong control, MDM enrolment chahiye</td></tr>
</table>
<p>End state <b>EAP-TLS</b> device ya user certificate ke saath hona chahiye, kyunki certificates password ka risk hatate hain. Phir policy user, device type aur compliance ke hisaab se VLAN ya group tag decide karti hai. Yaad rakho ki 6 GHz band ko WPA3 chahiye.</p>

<h3>Chosen design</h3>
<p>Redstone DMZ mein guest anchor, CWA aur contractors ke liye sponsor approval, EAP-TLS ke saath dual-SSID BYOD flow, warehouse aisles mein directional antennas wale rugged APs, asli scanner models ke saath validated fast transition, aur alag IT aur OT segments use karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Anchor aur foreign controllers par alag WLAN profile (tunnel working path nahi banata), mobility tunnel aur CoA ke firewall rules bhool jana, guests ko internal DNS tak pahunchne dena, aur jo scanners 802.11r support nahi karte unke liye ise enable karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Guest anchoring guest traffic ko campus VLANs se bahar rakhta hai. Sawal poochte hain ki guest traffic kaun terminate karta hai (DMZ mein anchor) aur portal logic kahan rehta hai (ISE). Onboarding SSID aur secure SSID ko confuse mat karo.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>Portal par atke hue guests</h4><p>Day one par guests ne terms accept kiye lekin browse nahi kar sake. ISE logs mein guest login successful tha, phir bhi controller ne redirect ACL pakad rakhi thi. Security team ne ISE se campus controller tak CoA allow nahi kiya tha. Firewall rule add hone ke baad access kuch seconds mein khul gaya. Unhone go-live checklist mein CoA health check bhi jod diya.</p><p><b>Seekh:</b> jo portal theek dikhta hai woh bhi return path par fail ho sakta hai. Poora flow test karo, client se CoA tak.</p></div>

<div class="iv"><p class="q">"DMZ wale campus ke liye guest Wi-Fi kaise design karoge?"</p><p>Strong answer: guest WLAN DMZ controller par anchored, ISE ke saath central web authentication, redirect ACL aur CoA, client isolation, rate limits aur timeouts, aur firewall rules jo sirf internet allow karein. Mobility tunnel aur CoA path validate karne ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest traffic DMZ mein anchor hota hai aur firewall se filter hota hai.</li>
<li>CWA MAB, redirect, portal aur CoA use karta hai.</li>
<li>BYOD dual SSID, single SSID ya MDM-assisted ho sakta hai, aur EAP-TLS par khatam hota hai.</li>
<li>Warehouses aur plants ko real stock ke saath survey aur rugged, directional design chahiye.</li>
<li>IT aur OT, guest aur corporate ko har layer par alag rakho.</li>
</ul></div>
`}};export{c as default};