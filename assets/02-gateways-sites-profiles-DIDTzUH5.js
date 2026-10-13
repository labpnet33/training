var e={id:`gateways-sites-profiles`,h:{en:`Gateways, sites (protected networks) and VPN profiles`,hi:`Gateways, sites (protected networks) aur VPN profiles`},body:{en:`
<p>A VPN definition in the SMC is built from three small ideas. Learn them separately and the lab becomes easy: the <b>gateway</b> says who the tunnel ends on, the <b>site</b> says which networks sit behind that gateway, and the <b>profile</b> says how the tunnel is encrypted.</p>

<h3>Analogy: a courier contract</h3>
<p>Two offices sign a courier contract. The contract names the <b>pickup door</b> at each office (the gateway), lists the <b>departments</b> allowed to send parcels (the site), and states the <b>lock type and key schedule</b> (the profile and key). If the two offices write different lock types, the van cannot even leave. If the department list is wrong, the van runs but stays empty.</p>

<h3>Gateway</h3>
<p>A <b>gateway</b> is the engine end of the tunnel. It has an address that the other side connects to. In this track the gateway address must be an address of the engine itself, normally the WAN address. For NK-PUNE-FW that is 203.0.113.2 on eth1, and for NK-HQ-FW it is 198.51.100.2. A common mistake is to type the ISP router address or the LAN address. The tunnel will never form, because the peer is sending packets to an address that is not the engine.</p>
<p>The peer gateway must also be <b>reachable</b>. If routing or the ISP link is broken, the two engines cannot exchange their negotiation packets. In the simulator the encapsulated traffic is modelled as UDP 4500 between the two gateway addresses, so a quick test of the internet path between the gateways is the first thing to do when a tunnel stays down.</p>

<h3>Site: the protected networks</h3>
<p>A <b>site</b> is the set of <b>protected networks</b> behind a gateway: the networks that may use the tunnel. Pune protects net-staff (10.1.1.0/24). HQ protects its LAN, for example 10.2.1.0/24 in our examples. The protected networks on one side are the allowed destinations on the other side. This is why a typing mistake in one list breaks traffic in both directions.</p>
<div class="warn"><p><b>Common mistake.</b> Listing the whole internet or the wrong subnet as protected. If Pune lists 10.1.2.0/24 instead of 10.1.1.0/24, STAFF-PC at 10.1.1.10 is outside the site and its traffic never enters the tunnel, even though the tunnel shows up. This is exactly the fault you will fix in lab fp-vpn-2.</p></div>
<p>Also avoid <b>overlapping</b> addresses. If both offices use 10.1.1.0/24, the engine cannot tell which side a packet belongs to. Plan different ranges for different sites before you build.</p>

<h3>VPN profile</h3>
<p>A <b>VPN profile</b> is a reusable bundle of security settings. In this model it holds the following fields:</p>
<table class="cmp"><tr><th>Field</th><th>What it means</th><th>Example idea</th></tr>
<tr><td>enc</td><td>Encryption algorithm that hides the data</td><td>AES with a strong key length</td></tr>
<tr><td>hash</td><td>Integrity check, proves the data was not changed</td><td>SHA-2 family</td></tr>
<tr><td>dh</td><td>Diffie-Hellman group, used to agree on fresh keys safely</td><td>A modern group, not a weak old one</td></tr>
<tr><td>auth</td><td>How the gateways prove who they are</td><td>Pre-shared key</td></tr>
<tr><td>life</td><td>How long keys live before they are replaced</td><td>Hours, not days</td></tr>
</table>
<p>Which algorithms are supported and recommended depends on the release, so check the documentation for your NGFW version. A good rule: choose current, strong settings, and never keep old algorithms only because they work.</p>
<p>The <b>pre-shared key</b> (PSK) is a long secret stored in the VPN definition. Both engines get it from the same SMC definition, so in the SMC it is entered once. Treat it like a password: long, random, never pasted into tickets or chat.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VPN element parts">
<rect x="180" y="10" width="280" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">VPN element: name, enabled, key</text>
<rect x="10" y="90" width="190" height="80" rx="8" fill="#bae6fd"/><text x="105" y="115" text-anchor="middle" class="svg-ink" font-size="13">Gateway A: NK-PUNE-FW</text><text x="105" y="135" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text><text x="105" y="155" text-anchor="middle" class="svg-muted" font-size="12">site: 10.1.1.0/24</text>
<rect x="225" y="90" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">VPN profile</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">enc, hash, dh, auth, life</text>
<rect x="440" y="90" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="535" y="115" text-anchor="middle" class="svg-ink" font-size="13">Gateway B: NK-HQ-FW</text><text x="535" y="135" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.2</text><text x="535" y="155" text-anchor="middle" class="svg-muted" font-size="12">site: 10.2.1.0/24</text>
<line x1="320" y1="50" x2="105" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="320" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="535" y2="90" stroke="#64748b"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="13">One definition, two engines, one profile</text>
</svg><p class="cap">One VPN element ties two gateways, their protected networks, the profile and the key together.</p></div>

<div class="eg"><p><b>Worked example.</b> Build the Pune to HQ definition on paper first. Gateway A: engine NK-PUNE-FW, address 203.0.113.2, protected net-staff 10.1.1.0/24. Gateway B: engine NK-HQ-FW, address 198.51.100.2, protected 10.2.1.0/24. Profile: strong AES, SHA-2, a modern DH group, pre-shared key, a lifetime of a few hours. Key: a long random string held only in the SMC. Check: the two protected lists do not overlap, and both gateway addresses belong to the engines. Only then create the objects.</p></div>

<div class="exam"><p><b>Exam trap.</b> The VPN definition lives in the SMC and is one object, but it is only active on an engine after Install Policy on that engine. Defining it does not start a tunnel.</p></div>

<div class="scn"><h4>Tunnel to the wrong address</h4><p>A new engineer built a Pune to HQ VPN and typed the HQ ISP router address as the HQ gateway. The Pune engine sent its negotiation packets to the router, which simply dropped them. The VPN status stayed down for two days while the team blamed the key. A colleague compared the gateway address with the engine interface list and saw the mismatch. After correcting it to 198.51.100.2 and installing both policies, the tunnel came up.</p><p><b>Lesson:</b> when a tunnel will not form, check the plain facts first: gateway addresses, reachability, then the key.</p></div>

<div class="iv"><p class="q">"What do you define before creating a site-to-site VPN?"</p><p>Strong answer: the two gateways and their addresses, the protected networks on each side without overlap, one profile with agreed algorithms, and a strong pre-shared key. Then add the rules with the VPN option and install the policy on both engines.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway = engine address that ends the tunnel; it must belong to the engine.</li>
<li>Site = protected networks behind a gateway; one side's list is the other side's allowed destinations.</li>
<li>Profile = enc, hash, dh, auth and life; use strong current settings.</li>
<li>Do not overlap protected networks between sites.</li>
<li>Defining a VPN changes nothing until Install Policy runs.</li>
</ul></div>
`,hi:`
<p>SMC mein VPN definition teen chhote ideas se banti hai. Inhe alag-alag seekho to lab aasaan ho jaata hai: <b>gateway</b> batata hai tunnel kis par end hota hai, <b>site</b> batata hai us gateway ke peeche kaun se networks hain, aur <b>profile</b> batata hai tunnel kaise encrypt hota hai.</p>

<h3>Analogy: courier contract</h3>
<p>Do offices ek courier contract sign karte hain. Contract mein har office ka <b>pickup door</b> (gateway) likha hota hai, parcel bhejne ke liye allowed <b>departments</b> ki list (site) hoti hai, aur <b>lock type aur key schedule</b> (profile aur key) likhe hote hain. Agar dono offices alag lock type likh dein to van nikal hi nahi sakti. Agar department list galat ho to van chalti hai lekin khaali rehti hai.</p>

<h3>Gateway</h3>
<p><b>Gateway</b> tunnel ka engine end hai. Uska ek address hota hai jis par doosri side connect karti hai. Is track mein gateway address engine ka apna address hona chahiye, aam taur par WAN address. NK-PUNE-FW ke liye yeh eth1 par 203.0.113.2 hai, aur NK-HQ-FW ke liye 198.51.100.2. Common galti hai ISP router ka address ya LAN address likh dena. Tunnel kabhi nahi banega, kyunki peer aise address par packets bhej raha hai jo engine ka nahi hai.</p>
<p>Peer gateway <b>reachable</b> bhi hona chahiye. Agar routing ya ISP link toot gaya hai to dono engines negotiation packets exchange nahi kar paate. Simulator mein encapsulated traffic dono gateway addresses ke beech UDP 4500 ki tarah model kiya gaya hai, isliye tunnel down rahe to sabse pehle gateways ke beech internet path ka quick test karo.</p>

<h3>Site: protected networks</h3>
<p><b>Site</b> ek gateway ke peeche ke <b>protected networks</b> ka set hai: woh networks jo tunnel use kar sakte hain. Pune net-staff (10.1.1.0/24) protect karta hai. HQ apna LAN protect karta hai, hamare examples mein 10.2.1.0/24. Ek side ke protected networks doosri side ke allowed destinations hote hain. Isliye ek list mein typing mistake dono directions ka traffic tod deti hai.</p>
<div class="warn"><p><b>Common mistake.</b> Poora internet ya galat subnet protected likh dena. Agar Pune 10.1.1.0/24 ki jagah 10.1.2.0/24 likhe, to 10.1.1.10 wala STAFF-PC site ke bahar hai aur uska traffic tunnel mein nahi jaata, bhale hi tunnel up dikhe. Lab fp-vpn-2 mein yahi fault aap theek karoge.</p></div>
<p><b>Overlapping</b> addresses se bhi bacho. Agar dono offices 10.1.1.0/24 use karein to engine nahi bata sakta packet kis side ka hai. Build karne se pehle alag sites ke liye alag ranges plan karo.</p>

<h3>VPN profile</h3>
<p><b>VPN profile</b> security settings ka reusable bundle hai. Is model mein ismein yeh fields hain:</p>
<table class="cmp"><tr><th>Field</th><th>Matlab</th><th>Example idea</th></tr>
<tr><td>enc</td><td>Encryption algorithm jo data chhupata hai</td><td>Strong key length ke saath AES</td></tr>
<tr><td>hash</td><td>Integrity check, saabit karta hai data badla nahi</td><td>SHA-2 family</td></tr>
<tr><td>dh</td><td>Diffie-Hellman group, nayi keys safely agree karne ke liye</td><td>Modern group, purana weak nahi</td></tr>
<tr><td>auth</td><td>Gateways apni pehchaan kaise saabit karte hain</td><td>Pre-shared key</td></tr>
<tr><td>life</td><td>Keys badalne se pehle kitni der chalti hain</td><td>Ghante, din nahi</td></tr>
</table>
<p>Kaun se algorithms supported aur recommended hain yeh release par depend karta hai, isliye check the documentation for your NGFW version. Achha rule: current, strong settings chuno, aur purane algorithms sirf isliye mat rakho ki woh chalte hain.</p>
<p><b>Pre-shared key</b> (PSK) VPN definition mein stored ek lamba secret hai. Dono engines ko yeh same SMC definition se milti hai, isliye SMC mein ek hi baar enter hoti hai. Ise password ki tarah treat karo: lambi, random, ticket ya chat mein kabhi paste mat karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VPN element ke parts">
<rect x="180" y="10" width="280" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">VPN element: name, enabled, key</text>
<rect x="10" y="90" width="190" height="80" rx="8" fill="#bae6fd"/><text x="105" y="115" text-anchor="middle" class="svg-ink" font-size="13">Gateway A: NK-PUNE-FW</text><text x="105" y="135" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text><text x="105" y="155" text-anchor="middle" class="svg-muted" font-size="12">site: 10.1.1.0/24</text>
<rect x="225" y="90" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">VPN profile</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">enc, hash, dh, auth, life</text>
<rect x="440" y="90" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="535" y="115" text-anchor="middle" class="svg-ink" font-size="13">Gateway B: NK-HQ-FW</text><text x="535" y="135" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.2</text><text x="535" y="155" text-anchor="middle" class="svg-muted" font-size="12">site: 10.2.1.0/24</text>
<line x1="320" y1="50" x2="105" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="320" y2="90" stroke="#64748b"/><line x1="320" y1="50" x2="535" y2="90" stroke="#64748b"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="13">Ek definition, do engines, ek profile</text>
</svg><p class="cap">Ek VPN element do gateways, unke protected networks, profile aur key ko jodta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Pune se HQ definition pehle kagaz par banao. Gateway A: engine NK-PUNE-FW, address 203.0.113.2, protected net-staff 10.1.1.0/24. Gateway B: engine NK-HQ-FW, address 198.51.100.2, protected 10.2.1.0/24. Profile: strong AES, SHA-2, modern DH group, pre-shared key, kuch ghante ki lifetime. Key: lambi random string jo sirf SMC mein hai. Check: dono protected lists overlap nahi karti, aur dono gateway addresses engines ke hain. Tabhi objects banao.</p></div>

<div class="exam"><p><b>Exam trap.</b> VPN definition SMC mein ek object hai, lekin woh engine par tabhi active hoti hai jab us engine par Install Policy ho. Sirf define karne se tunnel start nahi hota.</p></div>

<div class="scn"><h4>Galat address par tunnel</h4><p>Ek naye engineer ne Pune se HQ VPN banayi aur HQ gateway ke roop mein HQ ISP router ka address likh diya. Pune engine ke negotiation packets router tak gaye, jisne unhe drop kar diya. VPN status do din down raha jabki team key ko doshi maan rahi thi. Ek colleague ne gateway address ko engine interface list se milaya aur mismatch dekha. 198.51.100.2 sahi karke dono policies install karne par tunnel up ho gaya.</p><p><b>Lesson:</b> tunnel na bane to pehle seedhi baatein check karo: gateway addresses, reachability, phir key.</p></div>

<div class="iv"><p class="q">"Site-to-site VPN banane se pehle aap kya define karte ho?"</p><p>Strong answer: do gateways aur unke addresses, dono taraf ke protected networks bina overlap ke, agreed algorithms wala ek profile, aur strong pre-shared key. Phir VPN option wale rules add karo aur dono engines par policy install karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gateway = engine address jahan tunnel end hota hai; woh engine ka apna hona chahiye.</li>
<li>Site = gateway ke peeche ke protected networks; ek side ki list doosri side ke allowed destinations hain.</li>
<li>Profile = enc, hash, dh, auth aur life; strong current settings use karo.</li>
<li>Sites ke beech protected networks overlap mat karo.</li>
<li>Install Policy chalne tak VPN define karne se kuch nahi badalta.</li>
</ul></div>
`}};export{e as default};