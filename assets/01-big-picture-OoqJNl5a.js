var e={id:`big-picture`,h:{en:`What you will learn: roaming, tags and segmentation`,hi:`Aap kya seekhoge: roaming, tags aur segmentation`},body:{en:`
<h3>What you will learn</h3>
<p>In this module you learn why a person walking down a corridor with a laptop should not notice that the laptop changed access points, and what must be true in the controller for that to work. You will learn how roaming works at Layer 2 and Layer 3, how fast roaming (802.11r, 802.11k, 802.11v) helps, and how the Catalyst 9800 tag model (policy tag, site tag, RF tag) decides what every AP serves. Then you will build a separate guest network with its own VLAN and ACL, and fix the classic fault where a policy VLAN is missing from the controller.</p>
<ul>
<li>Roaming types: intra-controller, inter-controller, Layer 2 and Layer 3 (concept).</li>
<li>802.11r, 802.11k and 802.11v, sticky clients and what the controller can and cannot force.</li>
<li>The tag model: policy tag, site tag, RF tag, and why neighbouring APs must carry matching policy tags.</li>
<li>Policy profile, the controller VLAN database, central switching versus local switching.</li>
<li>Guest segmentation with VLAN 50 and the R1 ACL GUEST-IN.</li>
<li>Three labs: <b>wl-roam-tag-mismatch</b>, <b>wl-guest-vlan</b>, <b>wl-vlan-missing</b>.</li>
</ul>
<div class="note"><p><b>Prerequisites.</b> You should already know the 9800 building blocks from the earlier modules: WLAN profile, policy profile, policy tag, the wireless management interface, CAPWAP join, and basic RF (channels, RSSI). We refer back to them but do not re-teach them in depth. Security (802.1X, RADIUS) was covered before; here we only use it as an example of a second SSID.</p></div>

<h3>Analogy: a hotel with room keys and floors</h3>
<p>Imagine a large hotel. Every floor has a reception desk (an access point). A guest (your client) walks from floor 1 to floor 2. The guest keeps the same room number, the same bill and the same Wi-Fi password. The guest should not need to check in again. That only works if both reception desks read from the <b>same guest register</b>. If floor 2 has a different register, the guest is suddenly "a new person" in a different wing of the hotel.</p>
<p>In the 9800, the guest register is the <b>policy tag</b>: it says which SSID belongs to which policy profile, and the policy profile says which VLAN the client lands in. Floor 1 and floor 2 must use the same register, or the walking user gets a different IP subnet and loses sessions. The hotel also has a <b>VIP wing</b> for visitors only (guest VLAN) with a locked door to the staff offices (ACL). And if the register says "room in wing 20" but wing 20 does not exist on the hotel map (VLAN database), nobody can be placed at all.</p>

<h3>The big picture of this module</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module big picture">
<rect x="250" y="10" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">WLC1 (9800 model)</text>
<rect x="30" y="110" width="130" height="50" rx="8" fill="#bae6fd"/><text x="95" y="140" text-anchor="middle" class="svg-ink" font-size="13">AP1 (floor 1)</text>
<rect x="480" y="110" width="130" height="50" rx="8" fill="#bae6fd"/><text x="545" y="140" text-anchor="middle" class="svg-ink" font-size="13">AP2 (floor 2)</text>
<rect x="250" y="110" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 walks</text>
<line x1="290" y1="60" x2="95" y2="110" stroke="#64748b"/><line x1="350" y1="60" x2="545" y2="110" stroke="#64748b"/>
<line x1="250" y1="135" x2="160" y2="135" stroke="#64748b" stroke-dasharray="4 3"/><line x1="390" y1="135" x2="480" y2="135" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">same policy tag = same VLAN</text>
<rect x="30" y="195" width="170" height="40" rx="8" fill="#fde68a"/><text x="115" y="220" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 staff 10.10.20.0/24</text>
<rect x="235" y="195" width="170" height="40" rx="8" fill="#fed7aa"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="12">VLAN 50 guest + ACL</text>
<rect x="440" y="195" width="170" height="40" rx="8" fill="#e2e8f0"/><text x="525" y="220" text-anchor="middle" class="svg-ink" font-size="12">VLAN database on WLC1</text>
</svg><p class="cap">The tag decides the VLAN, the VLAN must exist, and the guest VLAN is fenced by an ACL.</p></div>

<h3>The lab topology you will use</h3>
<p>All labs use the same small campus. R1 is the router that hosts DHCP for every VLAN and routes between them. SW1 is the switch. WLC1 is the 9800-style controller with its trunk on GigabitEthernet1. RAD1 (10.10.60.20) is the RADIUS server behind R1. AP1 and AP2 sit on SW1 access ports in VLAN 10. The clients are LAPTOP1, LAPTOP2, PHONE1 and GUEST1.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th><th>Use</th></tr>
<tr><td>10</td><td>AP-MGMT</td><td>10.10.10.0/24</td><td>APs</td></tr>
<tr><td>20</td><td>STAFF</td><td>10.10.20.0/24</td><td>staff Wi-Fi (NK-STAFF)</td></tr>
<tr><td>40</td><td>CORP</td><td>10.10.40.0/24</td><td>802.1X users</td></tr>
<tr><td>50</td><td>GUEST</td><td>10.10.50.0/24</td><td>guest Wi-Fi (NK-GUEST)</td></tr>
<tr><td>99</td><td>WLC-MGMT</td><td>10.10.99.0/24</td><td>controller</td></tr></table>

<div class="tip"><p><b>Honest labelling.</b> The lab models the 9800 style commands, tags, policy profiles and the VLAN database faithfully. It does <b>not</b> model mobility tunnels, anchoring, FlexConnect, real 802.11r/k/v frame exchanges or sticky-client behaviour. Coming up: wl-flex (FlexConnect) and wl-mobility (Mobility and high availability). We teach those as concepts and mark each one "not simulated in the lab" so you never confuse a concept with something you can click.</p></div>

<div class="scn"><h4>The walking manager</h4><p>A manager on a video call walks from the meeting room (AP1) to the floor 2 pantry (AP2). The call freezes and the laptop shows a new IP address in another subnet. Nothing is wrong with RF. The network team finds that AP2 was given a different policy tag, which maps the staff SSID to a different VLAN. The user was not roaming between two identical networks; he was moving between two different ones.</p><p><b>Lesson:</b> a successful roam needs the same SSID, the same security and the same VLAN on both sides. Check the tags first.</p></div>

<div class="iv"><p class="q">"What makes seamless roaming possible on a Catalyst 9800?"</p><p>A strong answer: matching WLAN and security settings, matching policy tags so the policy profile and VLAN are identical on both APs, good RF overlap, and optionally 802.11r/k/v for speed. Mention that the client always decides when to roam; the infrastructure only helps.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roaming quality depends on RF overlap, the client's decision and identical policy on both APs.</li>
<li>The policy tag maps WLAN to policy profile; the policy profile sets the VLAN.</li>
<li>The VLAN must exist in the controller VLAN database.</li>
<li>Guest traffic is segmented with its own VLAN plus an ACL on the gateway.</li>
<li>Concepts not simulated in the lab are labelled honestly.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Is module mein aap seekhoge ki corridor mein laptop lekar chalne wale insaan ko pata hi nahi chalna chahiye ki laptop ne access point badal liya, aur iske liye controller mein kya sahi hona zaroori hai. Aap seekhoge ki roaming Layer 2 aur Layer 3 par kaise kaam karti hai, fast roaming (802.11r, 802.11k, 802.11v) kaise madad karti hai, aur Catalyst 9800 ka tag model (policy tag, site tag, RF tag) kaise decide karta hai ki har AP kya serve karega. Phir aap apne VLAN aur ACL ke saath alag guest network banaoge, aur woh classic fault fix karoge jisme policy VLAN controller mein missing hota hai.</p>
<ul>
<li>Roaming types: intra-controller, inter-controller, Layer 2 aur Layer 3 (concept).</li>
<li>802.11r, 802.11k aur 802.11v, sticky clients, aur controller kya force kar sakta hai kya nahi.</li>
<li>Tag model: policy tag, site tag, RF tag, aur padosi APs ke policy tags match kyun hone chahiye.</li>
<li>Policy profile, controller VLAN database, central switching versus local switching.</li>
<li>VLAN 50 aur R1 ACL GUEST-IN ke saath guest segmentation.</li>
<li>Teen labs: <b>wl-roam-tag-mismatch</b>, <b>wl-guest-vlan</b>, <b>wl-vlan-missing</b>.</li>
</ul>
<div class="note"><p><b>Prerequisites.</b> Aapko pichhle modules se 9800 ke building blocks pata hone chahiye: WLAN profile, policy profile, policy tag, wireless management interface, CAPWAP join aur basic RF (channels, RSSI). Hum unhe refer karte hain, deep mein dobara nahi padhate. Security (802.1X, RADIUS) pehle cover ho chuki hai; yahan hum use sirf doosre SSID ke example ki tarah use karte hain.</p></div>

<h3>Analogy: room keys aur floors wala hotel</h3>
<p>Ek bade hotel ki kalpana karo. Har floor par reception desk hai (access point). Ek guest (aapka client) floor 1 se floor 2 jaata hai. Guest ka room number, bill aur Wi-Fi password same rehta hai. Use dobara check-in nahi karna padna chahiye. Yeh tabhi chalega jab dono reception desks <b>same guest register</b> se padh rahe hon. Agar floor 2 ka register alag hai, to guest achanak hotel ke doosre wing mein "naya insaan" ban jaata hai.</p>
<p>9800 mein guest register hai <b>policy tag</b>: yeh batata hai ki kaunsa SSID kaunse policy profile se jude hai, aur policy profile batata hai ki client kaunse VLAN mein jayega. Floor 1 aur floor 2 ko same register use karna hoga, nahi to chalne wale user ko alag IP subnet milta hai aur sessions toot jaate hain. Hotel mein sirf visitors ke liye <b>VIP wing</b> bhi hai (guest VLAN) jisse staff offices ka darwaza locked hai (ACL). Aur agar register kehta hai "wing 20 mein room" lekin wing 20 hotel ke map (VLAN database) mein hai hi nahi, to kisi ko place hi nahi kiya ja sakta.</p>

<h3>Is module ki big picture</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module big picture">
<rect x="250" y="10" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">WLC1 (9800 model)</text>
<rect x="30" y="110" width="130" height="50" rx="8" fill="#bae6fd"/><text x="95" y="140" text-anchor="middle" class="svg-ink" font-size="13">AP1 (floor 1)</text>
<rect x="480" y="110" width="130" height="50" rx="8" fill="#bae6fd"/><text x="545" y="140" text-anchor="middle" class="svg-ink" font-size="13">AP2 (floor 2)</text>
<rect x="250" y="110" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 chalta hai</text>
<line x1="290" y1="60" x2="95" y2="110" stroke="#64748b"/><line x1="350" y1="60" x2="545" y2="110" stroke="#64748b"/>
<line x1="250" y1="135" x2="160" y2="135" stroke="#64748b" stroke-dasharray="4 3"/><line x1="390" y1="135" x2="480" y2="135" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">same policy tag = same VLAN</text>
<rect x="30" y="195" width="170" height="40" rx="8" fill="#fde68a"/><text x="115" y="220" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 staff 10.10.20.0/24</text>
<rect x="235" y="195" width="170" height="40" rx="8" fill="#fed7aa"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="12">VLAN 50 guest + ACL</text>
<rect x="440" y="195" width="170" height="40" rx="8" fill="#e2e8f0"/><text x="525" y="220" text-anchor="middle" class="svg-ink" font-size="12">WLC1 par VLAN database</text>
</svg><p class="cap">Tag VLAN decide karta hai, VLAN exist karna chahiye, aur guest VLAN ko ACL se fence kiya jaata hai.</p></div>

<h3>Lab topology jo aap use karoge</h3>
<p>Saari labs same chhote campus par chalti hain. R1 router hai jo har VLAN ka DHCP host karta hai aur VLANs ke beech routing karta hai. SW1 switch hai. WLC1 9800-style controller hai jiska trunk GigabitEthernet1 par hai. RAD1 (10.10.60.20) R1 ke peeche RADIUS server hai. AP1 aur AP2 SW1 ke access ports par VLAN 10 mein hain. Clients hain LAPTOP1, LAPTOP2, PHONE1 aur GUEST1.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th><th>Use</th></tr>
<tr><td>10</td><td>AP-MGMT</td><td>10.10.10.0/24</td><td>APs</td></tr>
<tr><td>20</td><td>STAFF</td><td>10.10.20.0/24</td><td>staff Wi-Fi (NK-STAFF)</td></tr>
<tr><td>40</td><td>CORP</td><td>10.10.40.0/24</td><td>802.1X users</td></tr>
<tr><td>50</td><td>GUEST</td><td>10.10.50.0/24</td><td>guest Wi-Fi (NK-GUEST)</td></tr>
<tr><td>99</td><td>WLC-MGMT</td><td>10.10.99.0/24</td><td>controller</td></tr></table>

<div class="tip"><p><b>Honest labelling.</b> Lab 9800 style commands, tags, policy profiles aur VLAN database ko sahi tarah model karti hai. Yeh mobility tunnels, anchoring, FlexConnect, real 802.11r/k/v frame exchanges ya sticky-client behaviour ko model <b>nahi</b> karti. Aage aane wale: wl-flex (FlexConnect) aur wl-mobility (Mobility and high availability). Inhe hum concept ki tarah padhate hain aur har ek ko "not simulated in the lab" mark karte hain taaki aap concept aur clickable cheez mein confuse na ho.</p></div>

<div class="scn"><h4>Chalta hua manager</h4><p>Ek manager video call par meeting room (AP1) se floor 2 ki pantry (AP2) tak chalta hai. Call freeze ho jaati hai aur laptop ko doosre subnet ka naya IP milta hai. RF mein koi problem nahi thi. Network team ko pata chalta hai ki AP2 ko alag policy tag diya gaya tha, jo staff SSID ko alag VLAN se map karta hai. User do identical networks ke beech roam nahi kar raha tha; woh do alag networks ke beech ja raha tha.</p><p><b>Lesson:</b> successful roam ke liye dono taraf same SSID, same security aur same VLAN chahiye. Pehle tags check karo.</p></div>

<div class="iv"><p class="q">"Catalyst 9800 par seamless roaming kya possible banata hai?"</p><p>Strong answer: matching WLAN aur security settings, matching policy tags taaki dono APs par policy profile aur VLAN identical ho, achhi RF overlap, aur speed ke liye optional 802.11r/k/v. Batao ki roam ka decision hamesha client leta hai; infrastructure sirf madad karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roaming quality RF overlap, client ke decision aur dono APs par identical policy par depend karti hai.</li>
<li>Policy tag WLAN ko policy profile se map karta hai; policy profile VLAN set karta hai.</li>
<li>VLAN controller VLAN database mein exist karna chahiye.</li>
<li>Guest traffic ko alag VLAN aur gateway par ACL se segment kiya jaata hai.</li>
<li>Jo concepts lab mein simulate nahi hote unhe honestly label kiya gaya hai.</li>
</ul></div>
`}};export{e as default};