var e={id:`big-picture`,h:{en:`The control plane of Wi-Fi: why an AP must join a controller`,hi:`Wi-Fi ka control plane: AP ko controller se join kyun karna padta hai`},body:{en:`
<h3>What you will learn in this module</h3>
<p>In the previous module you built the controller first: a management interface, a trunk and the first WLAN. In this module you follow the other half of the story, the <b>access point (AP)</b> itself. By the end you will be able to explain how a lightweight AP finds a controller, how it joins, which ports and protocols are involved, why the AP management VLAN and the controller management VLAN are different things, and how the regulatory country decides whether a radio may transmit at all. You will also fix three realistic faults in the labs: <code>wl-ap-discovery</code>, <code>wl-mgmt-trunk</code> and <code>wl-country-profile</code>.</p>
<p><b>Prerequisites:</b> VLANs and trunks, DHCP and a default gateway (CCNA level), and the first wireless module (wireless management interface, WLAN profile, policy profile, policy tag). You do not need any CAPWAP knowledge. We start from zero.</p>

<h3>Analogy: a hotel with one central reception</h3>
<p>Imagine a large hotel. Every floor has a small desk with a staff member (the AP) who greets guests and carries their luggage. But the staff member has no authority of their own. Room rules, guest lists, tariffs and key cards are all decided by <b>one central reception</b> (the controller). When a new staff member arrives for the first shift, three things must happen before the first guest is served: they must <b>find</b> the reception (discovery), they must be <b>accepted</b> by it (join), and they must <b>receive the rules</b> for their floor (configuration). If any of the three fails, the desk stays dark even though the person is physically present. A wireless problem that looks like "no Wi-Fi on floor 2" is very often exactly this: a staff member who never reached reception.</p>

<h3>Autonomous versus lightweight APs</h3>
<p>Early Wi-Fi used <b>autonomous APs</b>: each AP held its own full configuration (SSIDs, security, VLANs, power). With 300 APs that means 300 configurations to keep identical. Enterprise networks moved to <b>lightweight APs</b>. A lightweight AP keeps almost no configuration of its own. It runs the radio and the real-time frame work, and it asks a <b>wireless LAN controller (WLC)</b> for everything else. The controller in our labs is a Catalyst 9800-style model, named WLC1.</p>
<dl class="terms">
<dt>AP</dt><dd>The device with the antennas. It sends and receives 802.11 frames.</dd>
<dt>WLC</dt><dd>The central brain: configuration, security decisions, radio management, client policy.</dd>
<dt>CAPWAP</dt><dd>Control And Provisioning of Wireless Access Points, the tunnel protocol between AP and WLC. Covered in the next chapter.</dd>
<dt>Discovery</dt><dd>The AP learning the IP address of one or more controllers.</dd>
<dt>Join</dt><dd>The AP and controller authenticate each other and build the CAPWAP tunnel.</dd>
</dl>

<h3>Why this matters</h3>
<p>Everything in wireless depends on the join. A WLAN profile, a policy tag and an RF profile are only instructions waiting on the controller. Until an AP joins, none of them reach a radio. Engineers who skip this layer spend hours editing WLAN settings while the real fault is a missing DHCP option, a trunk that lost a VLAN or a country code. In this module you learn to <b>follow the AP before the client</b>.</p>

<h3>The lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology">
<rect x="270" y="10" width="100" height="42" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">R1 (DHCP)</text>
<line x1="320" y1="52" x2="320" y2="92" stroke="#64748b"/>
<rect x="270" y="92" width="100" height="42" rx="8" fill="#e2e8f0"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="270" y1="113" x2="130" y2="113" stroke="#64748b"/>
<rect x="30" y="92" width="100" height="42" rx="8" fill="#ddd6fe"/><text x="80" y="118" text-anchor="middle" class="svg-ink" font-size="13">WLC1 (VLAN 99)</text>
<line x1="300" y1="134" x2="200" y2="190" stroke="#64748b"/><line x1="340" y1="134" x2="440" y2="190" stroke="#64748b"/>
<rect x="150" y="190" width="100" height="42" rx="8" fill="#bbf7d0"/><text x="200" y="216" text-anchor="middle" class="svg-ink" font-size="13">AP1 (VLAN 10)</text>
<rect x="390" y="190" width="100" height="42" rx="8" fill="#bbf7d0"/><text x="440" y="216" text-anchor="middle" class="svg-ink" font-size="13">AP2 (VLAN 10)</text>
<text x="200" y="85" text-anchor="middle" class="svg-muted" font-size="12">trunk Gi1 / Gi0/1</text>
<text x="520" y="40" text-anchor="start" class="svg-muted" font-size="12">APs: 10.10.10.0/24</text>
<text x="520" y="58" text-anchor="start" class="svg-muted" font-size="12">WLC1: 10.10.99.10</text>
</svg><p class="cap">The APs live in VLAN 10, the controller in VLAN 99. They are in different subnets, so the AP cannot simply broadcast and find the controller.</p></div>

<p>R1 gives out addresses for every VLAN and routes between them. SW1 connects everything. AP1 and AP2 sit on access ports in VLAN 10 (AP-MGMT, 10.10.10.0/24). WLC1 sits on a trunk and has its wireless management interface in VLAN 99 (WLC-MGMT, 10.10.99.0/24, address 10.10.99.10). Because the subnets differ, the AP needs another way to learn where the controller is. That "other way" is the heart of the first lab.</p>

<div class="eg"><p><b>Worked example: the three questions.</b> When AP1 shows as missing, ask in order: (1) Does it have power and an IP address in VLAN 10? (2) Does it know the controller address 10.10.99.10? (3) Can its packets actually reach 10.10.99.10 and be accepted? Each question maps to one lab: DHCP option 43 (question 2), the trunk carrying VLAN 99 (question 3) and the regulatory country (what happens after acceptance).</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating "AP is on the switch" as "AP is joined". A link light and a DHCP lease prove nothing about the controller relationship. Only <code>show ap summary</code> on the WLC tells you whether the AP is registered.</p></div>
<div class="exam"><p><b>Exam trap.</b> The AP management network (where the AP gets its own IP) and the client networks (where users get theirs) are different. Clients never use the AP address, and the AP never uses a client VLAN.</p></div>

<div class="scn"><h4>Floor 2 is dark but the switch is green</h4><p>On Monday a new floor opened. The cabling team confirmed green link lights and PoE. The wireless team opened the WLAN profile for the third time and found nothing wrong. A colleague ran <code>show ap summary</code> on the controller: zero APs. The cause was a DHCP scope without the controller hint, so the new APs had addresses but never learned where reception was.</p><p><b>Lesson:</b> check the join before you touch the WLAN.</p></div>

<div class="iv"><p class="q">"What is the difference between an autonomous AP and a lightweight AP?"</p><p>An autonomous AP carries its full configuration and is managed one by one. A lightweight AP holds almost no configuration, discovers a controller, joins it over a CAPWAP tunnel and receives its configuration and policy from there. Add that this gives central management, central security and coordinated radio management at scale.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A lightweight AP is useless until it discovers, joins and is configured by a controller.</li>
<li>CAPWAP is the tunnel protocol between the AP and the controller.</li>
<li>In the lab, APs are in VLAN 10 and the controller is in VLAN 99, so discovery cannot rely on a broadcast.</li>
<li>Always verify the join on the controller with show ap summary before touching WLAN settings.</li>
<li>Three labs follow: discovery, the management trunk and the country profile.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Pichhle module mein aapne controller pehle build kiya tha: management interface, trunk aur pehla WLAN. Is module mein aap kahani ka doosra half follow karoge, yaani khud <b>access point (AP)</b>. Ant tak aap samjha paoge ki lightweight AP controller kaise dhundta hai, kaise join karta hai, kaun se ports aur protocols involved hain, AP management VLAN aur controller management VLAN alag cheezein kyun hain, aur regulatory country kaise decide karti hai ki radio transmit kar sakta hai ya nahi. Labs mein aap teen realistic faults bhi fix karoge: <code>wl-ap-discovery</code>, <code>wl-mgmt-trunk</code> aur <code>wl-country-profile</code>.</p>
<p><b>Prerequisites:</b> VLANs aur trunks, DHCP aur default gateway (CCNA level), aur pehla wireless module (wireless management interface, WLAN profile, policy profile, policy tag). CAPWAP ki knowledge nahi chahiye. Hum zero se start karte hain.</p>

<h3>Analogy: ek central reception wala hotel</h3>
<p>Ek bade hotel ki kalpana karo. Har floor par ek chhota desk hai jahan ek staff member (AP) guests ko greet karta hai aur unka saaman uthata hai. Lekin us staff member ke paas apna koi authority nahi hai. Room rules, guest list, tariff aur key cards sab <b>ek central reception</b> (controller) decide karta hai. Naya staff member jab pehli shift par aata hai to pehle guest se pehle teen cheezein hona zaroori hai: use reception <b>dhundna</b> hai (discovery), reception se <b>accept</b> hona hai (join), aur apne floor ke <b>rules receive</b> karne hain (configuration). Teen mein se ek bhi fail ho to desk dark rehta hai chahe banda physically wahan ho. "Floor 2 par Wi-Fi nahi" jaisi problem aksar yahi hoti hai: staff member reception tak pahuncha hi nahi.</p>

<h3>Autonomous versus lightweight APs</h3>
<p>Shuruaati Wi-Fi mein <b>autonomous APs</b> the: har AP apni poori configuration (SSIDs, security, VLANs, power) khud rakhta tha. 300 APs ka matlab 300 configurations ko identical rakhna. Enterprise networks <b>lightweight APs</b> par shift ho gaye. Lightweight AP apni configuration lagbhag nahi rakhta. Woh radio aur real-time frame ka kaam karta hai aur baaki sab <b>wireless LAN controller (WLC)</b> se maangta hai. Hamare labs ka controller Catalyst 9800-style model hai, naam WLC1.</p>
<dl class="terms">
<dt>AP</dt><dd>Antennas wala device. Yeh 802.11 frames bhejta aur receive karta hai.</dd>
<dt>WLC</dt><dd>Central brain: configuration, security decisions, radio management, client policy.</dd>
<dt>CAPWAP</dt><dd>Control And Provisioning of Wireless Access Points, AP aur WLC ke beech ka tunnel protocol. Agle chapter mein.</dd>
<dt>Discovery</dt><dd>AP ka ek ya zyada controllers ka IP address seekhna.</dd>
<dt>Join</dt><dd>AP aur controller ek doosre ko authenticate karte hain aur CAPWAP tunnel banate hain.</dd>
</dl>

<h3>Yeh kyun zaroori hai</h3>
<p>Wireless ki har cheez join par depend karti hai. WLAN profile, policy tag aur RF profile sirf instructions hain jo controller par intezaar kar rahe hain. Jab tak AP join nahi karta, inme se koi bhi radio tak nahi pahunchta. Jo engineers is layer ko skip karte hain woh ghanton WLAN settings edit karte rehte hain jabki asli fault missing DHCP option, VLAN gira hua trunk ya country code hota hai. Is module mein aap <b>client se pehle AP ko follow karna</b> seekhoge.</p>

<h3>Lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology">
<rect x="270" y="10" width="100" height="42" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">R1 (DHCP)</text>
<line x1="320" y1="52" x2="320" y2="92" stroke="#64748b"/>
<rect x="270" y="92" width="100" height="42" rx="8" fill="#e2e8f0"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="270" y1="113" x2="130" y2="113" stroke="#64748b"/>
<rect x="30" y="92" width="100" height="42" rx="8" fill="#ddd6fe"/><text x="80" y="118" text-anchor="middle" class="svg-ink" font-size="13">WLC1 (VLAN 99)</text>
<line x1="300" y1="134" x2="200" y2="190" stroke="#64748b"/><line x1="340" y1="134" x2="440" y2="190" stroke="#64748b"/>
<rect x="150" y="190" width="100" height="42" rx="8" fill="#bbf7d0"/><text x="200" y="216" text-anchor="middle" class="svg-ink" font-size="13">AP1 (VLAN 10)</text>
<rect x="390" y="190" width="100" height="42" rx="8" fill="#bbf7d0"/><text x="440" y="216" text-anchor="middle" class="svg-ink" font-size="13">AP2 (VLAN 10)</text>
<text x="200" y="85" text-anchor="middle" class="svg-muted" font-size="12">trunk Gi1 / Gi0/1</text>
<text x="520" y="40" text-anchor="start" class="svg-muted" font-size="12">APs: 10.10.10.0/24</text>
<text x="520" y="58" text-anchor="start" class="svg-muted" font-size="12">WLC1: 10.10.99.10</text>
</svg><p class="cap">APs VLAN 10 mein hain, controller VLAN 99 mein. Dono alag subnets mein hain, isliye AP sirf broadcast karke controller nahi dhundh sakta.</p></div>

<p>R1 har VLAN ke liye addresses deta hai aur unke beech routing karta hai. SW1 sab ko connect karta hai. AP1 aur AP2 VLAN 10 (AP-MGMT, 10.10.10.0/24) ke access ports par hain. WLC1 trunk par hai aur uska wireless management interface VLAN 99 (WLC-MGMT, 10.10.99.0/24, address 10.10.99.10) mein hai. Subnets alag hain, isliye AP ko controller ka pata lagane ka koi aur tareeka chahiye. Yahi "aur tareeka" pehle lab ka dil hai.</p>

<div class="eg"><p><b>Worked example: teen sawaal.</b> Jab AP1 missing dikhe to is order mein poochho: (1) Kya use power aur VLAN 10 mein IP address mila? (2) Kya use controller address 10.10.99.10 pata hai? (3) Kya uske packets sach mein 10.10.99.10 tak pahunchte hain aur accept hote hain? Har sawaal ek lab se map hota hai: DHCP option 43 (sawaal 2), VLAN 99 carry karne wala trunk (sawaal 3) aur regulatory country (acceptance ke baad kya hota hai).</p></div>

<div class="warn"><p><b>Common mistake.</b> "AP switch par hai" ko "AP joined hai" maan lena. Link light aur DHCP lease controller relationship ka kuch prove nahi karte. Sirf WLC par <code>show ap summary</code> batata hai ki AP registered hai ya nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> AP management network (jahan AP ko apna IP milta hai) aur client networks (jahan users ko milta hai) alag hain. Clients kabhi AP address use nahi karte, aur AP kabhi client VLAN use nahi karta.</p></div>

<div class="scn"><h4>Floor 2 dark hai lekin switch green hai</h4><p>Monday ko naya floor khula. Cabling team ne green link lights aur PoE confirm kiya. Wireless team ne teesri baar WLAN profile kholi aur kuch galat nahi mila. Ek colleague ne controller par <code>show ap summary</code> chalaya: zero APs. Wajah thi controller hint ke bina DHCP scope, isliye naye APs ke paas address the lekin unhe pata nahi tha ki reception kahan hai.</p><p><b>Seekh:</b> WLAN ko chhune se pehle join check karo.</p></div>

<div class="iv"><p class="q">"Autonomous AP aur lightweight AP mein kya difference hai?"</p><p>Autonomous AP apni poori configuration rakhta hai aur ek ek karke manage hota hai. Lightweight AP lagbhag koi configuration nahi rakhta, controller discover karta hai, CAPWAP tunnel se join karta hai aur wahin se configuration aur policy leta hai. Add karo ki isse central management, central security aur scale par coordinated radio management milta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lightweight AP tab tak bekaar hai jab tak woh discover, join aur controller se configure na ho.</li>
<li>CAPWAP AP aur controller ke beech ka tunnel protocol hai.</li>
<li>Lab mein APs VLAN 10 mein hain aur controller VLAN 99 mein, isliye discovery broadcast par depend nahi kar sakti.</li>
<li>WLAN settings chhune se pehle controller par show ap summary se join verify karo.</li>
<li>Aage teen labs hain: discovery, management trunk aur country profile.</li>
</ul></div>
`}};export{e as default};