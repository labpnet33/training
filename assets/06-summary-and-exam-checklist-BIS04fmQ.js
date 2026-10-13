var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The wireless story in one page</h3>
<p>An AP turns radio into cable. It must be powered, on management VLAN 99 and able to reach the dashboard. Each SSID carries its own authentication, forwarding mode and VLAN. The AP switch port must trunk those VLANs. The RF profile decides which bands send beacons and how clients are guided. Guests get a separate SSID, VLAN 30, a click-through splash, client isolation and firewall denies to VLAN 10 and 20. When an SSID is missing, you walk five checks in order.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wireless module map">
<rect x="20" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Basics</text>
<rect x="180" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 SSID + VLAN</text>
<rect x="340" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="410" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 RF profile</text>
<rect x="500" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 Splash</text>
<line x1="160" y1="45" x2="180" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="45" x2="340" y2="45" stroke="#64748b" stroke-width="2"/><line x1="480" y1="45" x2="500" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="100" width="600" height="45" rx="8" fill="#fed7aa"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="13">5 Troubleshoot: enabled, broadcast, tag, AP online, band</text>
<rect x="20" y="165" width="600" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="13">Plan: Staff VLAN 10 PSK; Guest VLAN 30 splash; AP on VLAN 99</text>
</svg><p class="cap">The module in one picture.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain radio, band, SSID and beacon to a beginner.</li>
<li>List what makes an AP show online: port, PoE, VLAN 99, path to the MX.</li>
<li>Describe open, PSK and 802.1X at concept level.</li>
<li>Compare NAT, bridge and VLAN-tagged SSIDs.</li>
<li>Configure an AP switch port as a trunk with native 99 and allowed 10, 30, 99.</li>
<li>Limit an SSID by AP tag and toggle broadcast.</li>
<li>Choose an RF profile band and explain why 5 GHz only hides SSIDs from 2.4 GHz clients.</li>
<li>Explain band steering and minimum bitrate.</li>
<li>Build a guest SSID with click-through splash, client isolation and firewall denies.</li>
<li>Troubleshoot "SSID not showing" with the five checks.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AP</dt><dd>Access point; the device that offers Wi-Fi and connects to the wire.</dd>
<dt>Band</dt><dd>Range of radio frequencies, 2.4 GHz or 5 GHz here.</dd>
<dt>SSID</dt><dd>The visible Wi-Fi network name.</dd>
<dt>Beacon</dt><dd>Frame that announces an SSID.</dd>
<dt>PSK</dt><dd>Pre-shared key, one shared passphrase.</dd>
<dt>802.1X</dt><dd>Per-user login checked by an authentication server.</dd>
<dt>Tagged SSID</dt><dd>SSID whose traffic is tagged with a VLAN number.</dd>
<dt>RF profile</dt><dd>Reusable radio rules assigned to APs.</dd>
<dt>Band steering</dt><dd>Guiding dual-band clients to 5 GHz.</dd>
<dt>Splash page</dt><dd>Captive page shown before access; click-through means accept to continue.</dd>
<dt>Client isolation</dt><dd>Blocks client-to-client traffic on the same SSID.</dd>
<dt>PoE</dt><dd>Power over Ethernet, power on the network cable.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>AP management</td><td>VLAN 99, port VLAN or native must be 99</td></tr>
<tr><td>Staff SSID</td><td>BharatRetail-Staff, WPA2 PSK, VLAN 10, visible</td></tr>
<tr><td>Guest SSID</td><td>BharatRetail-Guest, open + click-through, VLAN 30, isolation on</td></tr>
<tr><td>AP tags</td><td>floor1, floor2, store</td></tr>
<tr><td>Joins but no IP</td><td>Trunk allowed list or DHCP, not password</td></tr>
<tr><td>Missing for some clients</td><td>RF band</td></tr>
<tr><td>Splash pending</td><td>Client has not accepted the page yet</td></tr></table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Revision only. For every change you make in the labs, say aloud what changes: beacons, VLAN tags, band, or firewall order.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not mix up: guest isolation (firewall, VLAN 30 to 10 and 20) versus client isolation (same SSID). Do not blame the passphrase when a client joins but has no address.</p></div>

<div class="scn"><h4>Opening day in Delhi</h4><p>A new store opened. The checklist: AP-DEL on port with PoE and VLAN 99, trunk allowing 10, 30 and 99, both SSIDs available on tag store, dual-band profile for old scanners, guest deny rules above allow. The team verified with a staff phone, a guest phone and a scanner, and opened on time.</p><p><b>Lesson:</b> a short pre-opening checklist prevents most wireless tickets.</p></div>

<div class="iv"><p class="q">"Walk me through a complete wireless setup for a branch."</p><p>Strong answer: AP on VLAN 99 with PoE; trunk port with native 99 and allowed 10, 30; Staff SSID PSK on VLAN 10; Guest SSID open with splash on VLAN 30 with client isolation; RF profile suited to the client mix; firewall denies from guest to staff and servers; test with each client type.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP online needs power, VLAN 99 and a path to the dashboard.</li>
<li>Tagged SSIDs need trunk ports that allow their VLANs.</li>
<li>RF band can hide an SSID from some clients.</li>
<li>Guest safety is layered: SSID, VLAN, splash, isolation, firewall.</li>
<li>Troubleshoot with five ordered checks and one change at a time.</li>
</ul></div>
`,hi:`
<h3>Wireless ki kahani ek page mein</h3>
<p>AP radio ko cable mein badalta hai. Use powered hona chahiye, management VLAN 99 par aur dashboard tak pahunch sakta ho. Har SSID apni authentication, forwarding mode aur VLAN carry karta hai. AP switch port ko un VLANs ko trunk karna padta hai. RF profile decide karta hai ki kaun se bands beacons bhejte hain aur clients ko kaise guide kiya jaata hai. Guests ko alag SSID, VLAN 30, click-through splash, client isolation aur VLAN 10 aur 20 ke firewall denies milte hain. Jab SSID missing ho, to paanch checks order mein chalate hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wireless module ka map">
<rect x="20" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Basics</text>
<rect x="180" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 SSID + VLAN</text>
<rect x="340" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="410" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 RF profile</text>
<rect x="500" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="560" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 Splash</text>
<line x1="160" y1="45" x2="180" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="45" x2="340" y2="45" stroke="#64748b" stroke-width="2"/><line x1="480" y1="45" x2="500" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="100" width="600" height="45" rx="8" fill="#fed7aa"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="13">5 Troubleshoot: enabled, broadcast, tag, AP online, band</text>
<rect x="20" y="165" width="600" height="45" rx="8" fill="#e2e8f0"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="13">Plan: Staff VLAN 10 PSK; Guest VLAN 30 splash; AP VLAN 99 par</text>
</svg><p class="cap">Module ek picture mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Beginner ko radio, band, SSID aur beacon samjhana.</li>
<li>Batana ki AP online kab dikhta hai: port, PoE, VLAN 99, MX tak path.</li>
<li>Open, PSK aur 802.1X ko concept level par describe karna.</li>
<li>NAT, bridge aur VLAN-tagged SSIDs ki tulna karna.</li>
<li>AP switch port ko trunk ke roop mein configure karna, native 99 aur allowed 10, 30, 99.</li>
<li>SSID ko AP tag se limit karna aur broadcast toggle karna.</li>
<li>RF profile band chunna aur batana ki 5 GHz only SSIDs ko 2.4 GHz clients se kyun chhupata hai.</li>
<li>Band steering aur minimum bitrate samjhana.</li>
<li>Click-through splash, client isolation aur firewall denies ke saath guest SSID banana.</li>
<li>"SSID not showing" ko paanch checks se troubleshoot karna.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AP</dt><dd>Access point; woh device jo Wi-Fi deta hai aur wire se jodta hai.</dd>
<dt>Band</dt><dd>Radio frequencies ki range, yahan 2.4 GHz ya 5 GHz.</dd>
<dt>SSID</dt><dd>Dikhne wala Wi-Fi network naam.</dd>
<dt>Beacon</dt><dd>Frame jo SSID announce karta hai.</dd>
<dt>PSK</dt><dd>Pre-shared key, ek shared passphrase.</dd>
<dt>802.1X</dt><dd>Per-user login jise authentication server check karta hai.</dd>
<dt>Tagged SSID</dt><dd>SSID jiska traffic VLAN number se tag hota hai.</dd>
<dt>RF profile</dt><dd>APs ko assign hone wale reusable radio rules.</dd>
<dt>Band steering</dt><dd>Dual-band clients ko 5 GHz ki taraf guide karna.</dd>
<dt>Splash page</dt><dd>Access se pehle dikhne wala captive page; click-through ka matlab continue karne ke liye accept karo.</dd>
<dt>Client isolation</dt><dd>Ek hi SSID par client-to-client traffic block karta hai.</dd>
<dt>PoE</dt><dd>Power over Ethernet, network cable par power.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>AP management</td><td>VLAN 99, port VLAN ya native 99 hona chahiye</td></tr>
<tr><td>Staff SSID</td><td>BharatRetail-Staff, WPA2 PSK, VLAN 10, visible</td></tr>
<tr><td>Guest SSID</td><td>BharatRetail-Guest, open + click-through, VLAN 30, isolation on</td></tr>
<tr><td>AP tags</td><td>floor1, floor2, store</td></tr>
<tr><td>Join hota hai lekin IP nahi</td><td>Trunk allowed list ya DHCP, password nahi</td></tr>
<tr><td>Kuch clients ko missing</td><td>RF band</td></tr>
<tr><td>Splash pending</td><td>Client ne page abhi accept nahi kiya</td></tr></table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Sirf revision. Labs mein jo bhi change karo, zor se bolo ki kya badalta hai: beacons, VLAN tags, band ya firewall order.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mix mat karo: guest isolation (firewall, VLAN 30 se 10 aur 20) aur client isolation (same SSID). Jab client join ho jaye lekin address na mile to passphrase ko blame mat karo.</p></div>

<div class="scn"><h4>Delhi mein opening day</h4><p>Naya store khula. Checklist: AP-DEL PoE aur VLAN 99 wale port par, trunk jo 10, 30 aur 99 allow kare, dono SSIDs tag store par available, purane scanners ke liye dual-band profile, guest deny rules allow ke upar. Team ne staff phone, guest phone aur scanner se verify kiya aur time par open hua.</p><p><b>Seekh:</b> chhoti pre-opening checklist zyadatar wireless tickets rok deti hai.</p></div>

<div class="iv"><p class="q">"Branch ke liye complete wireless setup samjhao."</p><p>Strong answer: AP VLAN 99 par PoE ke saath; trunk port native 99 aur allowed 10, 30 ke saath; Staff SSID PSK VLAN 10 par; Guest SSID open splash ke saath VLAN 30 par client isolation ke saath; client mix ke hisaab se RF profile; guest se staff aur servers ke firewall denies; har client type se test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP online ke liye power, VLAN 99 aur dashboard tak path chahiye.</li>
<li>Tagged SSIDs ko aise trunk ports chahiye jo unke VLANs allow karein.</li>
<li>RF band kuch clients se SSID chhupa sakta hai.</li>
<li>Guest safety layered hai: SSID, VLAN, splash, isolation, firewall.</li>
<li>Paanch ordered checks aur ek baar mein ek change se troubleshoot karo.</li>
</ul></div>
`}};export{e as default};