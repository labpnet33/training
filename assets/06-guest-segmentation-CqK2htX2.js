var e={id:`guest-segmentation`,h:{en:`Guest segmentation: VLAN, ACL and guest design`,hi:`Guest segmentation: VLAN, ACL aur guest design`},body:{en:`
<h3>Why guests need their own network</h3>
<p>Visitors, contractors and personal phones should reach the Internet and nothing else. If they share the staff VLAN, a stranger on the same subnet can see file servers, printers and cameras, and one infected phone can spread to company PCs. <b>Segmentation</b> means putting different trust levels in different networks and controlling what crosses between them. Think of a hotel lobby with free tea: visitors may use the lobby, but the door to the staff kitchen is locked.</p>
<p>Wireless guest segmentation uses three layers working together:</p>
<ol>
<li><b>A separate SSID</b> (NK-GUEST) so guests are never on the staff WLAN.</li>
<li><b>A separate VLAN and subnet</b> (VLAN 50, 10.10.50.0/24) set in a dedicated policy profile (PP-GUEST).</li>
<li><b>An ACL</b> on the Layer 3 gateway (R1) that blocks VLAN 50 from internal networks while allowing DHCP, DNS and Internet.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Guest segmentation path">
<rect x="10" y="85" width="100" height="50" rx="8" fill="#fed7aa"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="12">GUEST1</text>
<rect x="140" y="85" width="110" height="50" rx="8" fill="#bae6fd"/><text x="195" y="107" text-anchor="middle" class="svg-ink" font-size="12">AP + WLC1</text><text x="195" y="123" text-anchor="middle" class="svg-muted" font-size="11">PP-GUEST VLAN 50</text>
<rect x="280" y="85" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="330" y="115" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="410" y="85" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="460" y="107" text-anchor="middle" class="svg-ink" font-size="12">R1</text><text x="460" y="123" text-anchor="middle" class="svg-muted" font-size="11">ACL GUEST-IN</text>
<rect x="540" y="30" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="585" y="56" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="540" y="150" width="90" height="44" rx="8" fill="#fde68a"/><text x="585" y="176" text-anchor="middle" class="svg-ink" font-size="12">RAD1 servers</text>
<line x1="110" y1="110" x2="140" y2="110" stroke="#64748b" stroke-dasharray="4 3"/><line x1="250" y1="110" x2="280" y2="110" stroke="#64748b"/><line x1="380" y1="110" x2="410" y2="110" stroke="#64748b"/>
<line x1="510" y1="100" x2="540" y2="55" stroke="#64748b"/><line x1="510" y1="120" x2="540" y2="170" stroke="#dc2626" stroke-dasharray="4 3"/>
<text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="11">blocked</text>
</svg><p class="cap">Guests reach the gateway and the Internet; the ACL on R1 blocks servers, staff and corp VLANs.</p></div>

<h3>Where the segmentation is enforced</h3>
<p>This is a very common interview point. The WLAN and the policy profile only <b>place</b> the client in VLAN 50. They do not, by themselves, block anything. The blocking happens on the device that routes between VLANs: here R1, with the ACL <b>GUEST-IN</b> applied inward on the VLAN 50 interface. The controller could also apply an ACL in the policy profile (concept), but in this lab the ACL is already on R1.</p>
<p>A typical guest ACL, in plain words:</p>
<pre class="code"><span class="c">! on R1, already in place in the lab (shown for understanding)</span>
ip access-list extended GUEST-IN
 permit udp any eq bootpc any eq bootps
 permit udp 10.10.50.0 0.0.0.255 host 10.10.50.1 eq domain
 deny   ip 10.10.50.0 0.0.0.255 10.10.10.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.20.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.30.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.40.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.60.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.99.0 0.0.0.255
 permit ip 10.10.50.0 0.0.0.255 any</pre>
<p>The order matters: first allow what guests need (DHCP, DNS), then deny every internal range, then permit the rest, which is the Internet. If you put the final permit first, the denies never run. Do not memorise this exact ACL for the lab; learn the pattern.</p>
<div class="note"><p><b>Lab detail.</b> The facts file says R1 ACL GUEST-IN blocks VLAN 50 to servers, staff and corp. You do not write the ACL in this lab; you prove its effect from the client: gateway reachable, RAD1 not reachable.</p></div>

<h3>Open SSID, and what that means</h3>
<p>NK-GUEST is an <b>open</b> WLAN (no encryption): configured with <code>no security wpa</code>. Real guest networks often use a web portal for acceptance of terms: <b>CWA</b> (central web authentication via ISE) or <b>LWA</b> (local web authentication on the WLC). Those are concepts here and are not simulated in the lab. Coming up: module wl-secure (Advanced security). Other options are OWE (Opportunistic Wireless Encryption, Enhanced Open), which encrypts an open network without a password, or a shared PSK printed at reception. Whatever you choose, remember that <b>open means anyone nearby can see unencrypted traffic</b>; guests must use HTTPS and VPN for protection.</p>
<table class="cmp"><tr><th>Guest option</th><th>Security</th><th>In the lab?</th></tr>
<tr><td>Open, no portal</td><td>None, only segmentation</td><td>Yes (NK-GUEST)</td></tr>
<tr><td>Open plus web portal (LWA or CWA)</td><td>Accept terms or login</td><td>Concept only</td></tr>
<tr><td>OWE</td><td>Encrypted, no auth</td><td>Concept only</td></tr>
<tr><td>Guest PSK</td><td>WPA2/3-PSK shared key</td><td>Possible (as NK-STAFF)</td></tr></table>

<h3>Guest anchor (concept)</h3>
<p>In bigger networks guest traffic from every campus controller is tunnelled to a single <b>guest anchor controller</b> in the DMZ, behind the firewall. The foreign controllers keep the client's association but the DHCP and Internet exit happen at the anchor. That way guests never touch the internal VLANs at all, not even as a tagged frame. This uses the mobility tunnel idea from chapter 2. It is not simulated in the lab.</p>

<h3>Mapping in the policy tag</h3>
<p>Guests only appear on an AP if the AP policy tag contains the map. After you add NK-GUEST to PT-CAMPUS, both AP1 and AP2 broadcast both SSIDs, because both use PT-CAMPUS. No per-AP change is needed. This is the power of tags: one edit, whole campus.</p>
<pre class="out">WLC1# show wlan summary

Number of WLANs: 2

ID   Profile Name                     SSID                             Status  Security
1    NK-STAFF                         NK-STAFF                         UP      [WPA2][PSK][AES]
3    NK-GUEST                         NK-GUEST                         UP      [Open]</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Putting guests in the staff VLAN "temporarily". (2) Believing the WLAN or policy profile blocks internal access. It is the ACL or firewall. (3) Writing the ACL with the permit-all line first. (4) Forgetting DHCP and DNS in the ACL, so guests associate but cannot get an address or resolve names. (5) Using a guest SSID without client isolation or rate limits; note them as improvement items.</p></div>
<div class="exam"><p><b>Exam trap.</b> Segmentation needs both VLAN separation and Layer 3 filtering. A VLAN alone only separates broadcast domains; the router will happily route between VLANs unless an ACL or firewall stops it.</p></div>

<div class="scn"><h4>The cafe printer</h4><p>A guest SSID was mapped to the same VLAN as the printers "because the guests wanted to print". A visitor's laptop ran a port scan and found open services on every printer and a camera. The team moved the guests to VLAN 50 with an ACL, and published a printer-by-QR-code workflow through a separate guest print server in the guest VLAN.</p><p><b>Lesson:</b> give guests a purpose-built service in their own VLAN instead of access to internal devices.</p></div>

<div class="iv"><p class="q">"How do you securely provide guest Wi-Fi on a 9800?"</p><p>Separate SSID, separate policy profile and VLAN, ACL or firewall at the gateway that blocks internal ranges and permits DHCP, DNS and Internet, plus a web portal or OWE if needed. At scale, anchor guests to a DMZ controller. Mention rate limiting and client isolation as additions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest isolation = separate SSID + separate VLAN + Layer 3 filtering.</li>
<li>The WLAN and policy profile only place the client; the ACL on R1 blocks internal access.</li>
<li>ACL order: allow DHCP and DNS, deny internal ranges, permit the rest.</li>
<li>Web portals, OWE and guest anchoring are concepts only in the lab.</li>
<li>One edit to the policy tag publishes the SSID on every AP using it.</li>
</ul></div>
`,hi:`
<h3>Guests ko apna network kyun chahiye</h3>
<p>Visitors, contractors aur personal phones ko sirf Internet milna chahiye, aur kuch nahi. Agar woh staff VLAN share karte hain, to same subnet par ek ajnabi file servers, printers aur cameras dekh sakta hai, aur ek infected phone company PCs tak phail sakta hai. <b>Segmentation</b> matlab alag trust levels ko alag networks mein rakhna aur control karna ki beech mein kya cross kar sakta hai. Hotel lobby ki tarah socho jahan free chai hai: visitors lobby use kar sakte hain, lekin staff kitchen ka darwaza locked hai.</p>
<p>Wireless guest segmentation teen layers ek saath use karti hai:</p>
<ol>
<li><b>Alag SSID</b> (NK-GUEST) taaki guests kabhi staff WLAN par na hon.</li>
<li><b>Alag VLAN aur subnet</b> (VLAN 50, 10.10.50.0/24) jo dedicated policy profile (PP-GUEST) mein set hota hai.</li>
<li>Layer 3 gateway (R1) par <b>ACL</b> jo VLAN 50 ko internal networks se block karti hai aur DHCP, DNS aur Internet allow karti hai.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Guest segmentation path">
<rect x="10" y="85" width="100" height="50" rx="8" fill="#fed7aa"/><text x="60" y="115" text-anchor="middle" class="svg-ink" font-size="12">GUEST1</text>
<rect x="140" y="85" width="110" height="50" rx="8" fill="#bae6fd"/><text x="195" y="107" text-anchor="middle" class="svg-ink" font-size="12">AP + WLC1</text><text x="195" y="123" text-anchor="middle" class="svg-muted" font-size="11">PP-GUEST VLAN 50</text>
<rect x="280" y="85" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="330" y="115" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="410" y="85" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="460" y="107" text-anchor="middle" class="svg-ink" font-size="12">R1</text><text x="460" y="123" text-anchor="middle" class="svg-muted" font-size="11">ACL GUEST-IN</text>
<rect x="540" y="30" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="585" y="56" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="540" y="150" width="90" height="44" rx="8" fill="#fde68a"/><text x="585" y="176" text-anchor="middle" class="svg-ink" font-size="12">RAD1 servers</text>
<line x1="110" y1="110" x2="140" y2="110" stroke="#64748b" stroke-dasharray="4 3"/><line x1="250" y1="110" x2="280" y2="110" stroke="#64748b"/><line x1="380" y1="110" x2="410" y2="110" stroke="#64748b"/>
<line x1="510" y1="100" x2="540" y2="55" stroke="#64748b"/><line x1="510" y1="120" x2="540" y2="170" stroke="#dc2626" stroke-dasharray="4 3"/>
<text x="560" y="130" text-anchor="middle" class="svg-muted" font-size="11">blocked</text>
</svg><p class="cap">Guests gateway aur Internet tak pahunchte hain; R1 par ACL servers, staff aur corp VLANs ko block karti hai.</p></div>

<h3>Segmentation kahan enforce hoti hai</h3>
<p>Yeh interview ka bahut common point hai. WLAN aur policy profile sirf client ko VLAN 50 mein <b>place</b> karte hain. Woh khud kuch block nahi karte. Blocking us device par hoti hai jo VLANs ke beech routing karta hai: yahan R1, jis par ACL <b>GUEST-IN</b> VLAN 50 interface par inward lagi hai. Controller bhi policy profile mein ACL laga sakta hai (concept), lekin is lab mein ACL R1 par pehle se hai.</p>
<p>Ek typical guest ACL, seedhe shabdon mein:</p>
<pre class="code"><span class="c">! on R1, already in place in the lab (shown for understanding)</span>
ip access-list extended GUEST-IN
 permit udp any eq bootpc any eq bootps
 permit udp 10.10.50.0 0.0.0.255 host 10.10.50.1 eq domain
 deny   ip 10.10.50.0 0.0.0.255 10.10.10.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.20.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.30.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.40.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.60.0 0.0.0.255
 deny   ip 10.10.50.0 0.0.0.255 10.10.99.0 0.0.0.255
 permit ip 10.10.50.0 0.0.0.255 any</pre>
<p>Order matter karta hai: pehle woh allow karo jo guests ko chahiye (DHCP, DNS), phir har internal range deny karo, phir baaki permit karo, jo Internet hai. Agar aap aakhri permit pehle rakh do, to denies kabhi chalte hi nahi. Lab ke liye exact ACL yaad mat karo; pattern seekho.</p>
<div class="note"><p><b>Lab detail.</b> Facts file kehti hai ki R1 ACL GUEST-IN VLAN 50 ko servers, staff aur corp se block karti hai. Is lab mein aap ACL nahi likhte; aap client se uska effect prove karte ho: gateway reachable, RAD1 not reachable.</p></div>

<h3>Open SSID, aur uska matlab</h3>
<p>NK-GUEST ek <b>open</b> WLAN hai (koi encryption nahi): <code>no security wpa</code> se configure hota hai. Real guest networks aksar terms accept karne ke liye web portal use karte hain: <b>CWA</b> (ISE ke through central web authentication) ya <b>LWA</b> (WLC par local web authentication). Yeh yahan concepts hain aur lab mein simulate nahi hote. Aage aane wala module: wl-secure (Advanced security). Doosre options hain OWE (Opportunistic Wireless Encryption, Enhanced Open), jo bina password ke open network ko encrypt karta hai, ya reception par print kiya shared PSK. Jo bhi chuno, yaad rakho ki <b>open ka matlab paas ka koi bhi unencrypted traffic dekh sakta hai</b>; guests ko protection ke liye HTTPS aur VPN use karna chahiye.</p>
<table class="cmp"><tr><th>Guest option</th><th>Security</th><th>Lab mein?</th></tr>
<tr><td>Open, no portal</td><td>Kuch nahi, sirf segmentation</td><td>Haan (NK-GUEST)</td></tr>
<tr><td>Open plus web portal (LWA ya CWA)</td><td>Terms accept ya login</td><td>Sirf concept</td></tr>
<tr><td>OWE</td><td>Encrypted, no auth</td><td>Sirf concept</td></tr>
<tr><td>Guest PSK</td><td>WPA2/3-PSK shared key</td><td>Possible (NK-STAFF ki tarah)</td></tr></table>

<h3>Guest anchor (concept)</h3>
<p>Bade networks mein har campus controller ka guest traffic ek hi <b>guest anchor controller</b> tak tunnel hota hai, jo firewall ke peeche DMZ mein hota hai. Foreign controllers client ka association rakhte hain lekin DHCP aur Internet exit anchor par hota hai. Is tarah guests internal VLANs ko kabhi touch nahi karte, tagged frame ke roop mein bhi nahi. Yeh chapter 2 ke mobility tunnel idea ko use karta hai. Lab mein simulate nahi hota.</p>

<h3>Policy tag mein mapping</h3>
<p>Guests AP par tabhi dikhte hain jab AP ke policy tag mein map ho. PT-CAMPUS mein NK-GUEST add karne ke baad AP1 aur AP2 dono dono SSIDs broadcast karte hain, kyunki dono PT-CAMPUS use karte hain. Per-AP koi change nahi chahiye. Tags ki yahi taakat hai: ek edit, poora campus.</p>
<pre class="out">WLC1# show wlan summary

Number of WLANs: 2

ID   Profile Name                     SSID                             Status  Security
1    NK-STAFF                         NK-STAFF                         UP      [WPA2][PSK][AES]
3    NK-GUEST                         NK-GUEST                         UP      [Open]</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Guests ko "temporarily" staff VLAN mein daalna. (2) Maan lena ki WLAN ya policy profile internal access block karta hai. Woh ACL ya firewall karta hai. (3) ACL ko permit-all line pehle likh kar banana. (4) ACL mein DHCP aur DNS bhool jaana, jisse guests associate to hote hain lekin address nahi milta ya names resolve nahi hote. (5) Client isolation ya rate limits ke bina guest SSID use karna; inhe improvement items ki tarah note karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Segmentation ke liye VLAN separation aur Layer 3 filtering dono chahiye. Sirf VLAN broadcast domains alag karta hai; router VLANs ke beech khushi se route karega jab tak ACL ya firewall use na roke.</p></div>

<div class="scn"><h4>Cafe printer</h4><p>Guest SSID ko printers wale VLAN se map kar diya gaya tha "kyunki guests print karna chahte the". Ek visitor ke laptop ne port scan chalaya aur har printer aur ek camera par open services mil gayi. Team ne guests ko ACL ke saath VLAN 50 mein move kiya, aur guest VLAN mein alag guest print server ke through printer-by-QR-code workflow publish kiya.</p><p><b>Lesson:</b> guests ko internal devices ka access dene ki jagah unke apne VLAN mein purpose-built service do.</p></div>

<div class="iv"><p class="q">"9800 par guest Wi-Fi securely kaise dete ho?"</p><p>Alag SSID, alag policy profile aur VLAN, gateway par ACL ya firewall jo internal ranges block kare aur DHCP, DNS aur Internet permit kare, plus zaroorat ho to web portal ya OWE. Bade scale par guests ko DMZ controller par anchor karo. Rate limiting aur client isolation additions ki tarah batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Guest isolation = alag SSID + alag VLAN + Layer 3 filtering.</li>
<li>WLAN aur policy profile sirf client ko place karte hain; R1 par ACL internal access block karti hai.</li>
<li>ACL order: DHCP aur DNS allow, internal ranges deny, baaki permit.</li>
<li>Web portals, OWE aur guest anchoring lab mein sirf concepts hain.</li>
<li>Policy tag mein ek edit se SSID har us AP par publish ho jaata hai jo use use karta hai.</li>
</ul></div>
`}};export{e as default};