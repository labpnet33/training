var e={id:`overview`,h:{en:`Site-to-site IPsec: what you will learn and the big picture`,hi:`Site-to-site IPsec: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to build, read and troubleshoot a route-based site-to-site IPsec VPN on a Palo Alto Networks firewall: IKE gateways and crypto profiles, the IPsec tunnel object, the tunnel interface, routing and policy for traffic that enters the tunnel, NAT exemption, interoperability points such as proxy IDs, verification commands and a repeatable troubleshooting order. This matches the NAT and Networking skills of the PAN-OS NGFW Engineer track.</p>
<p><b>Prerequisites.</b> Interfaces, zones and virtual routers (pan-setup), security policy (pan-policy) and basic CLI habits (pan-diag). You should know what a public IP address and a private subnet are. A note on practice: the simulator does not model IKE or tunnels, so every configuration here is labelled <b>Reference configuration (not run in the simulator)</b>, and there is no lab in this module. For related practice, use pan-setup, pan-policy and pan-diag, then compare the same ideas in nse4-ipsec (FortiGate) and sec-asa-vpn (Cisco ASA).</p>

<h3>Analogy: an armoured van between two offices</h3>
<p>Two offices want to send documents across a busy public road. They agree on a locked armoured van. First the drivers meet and prove who they are, then agree on the lock type and keys. That meeting is <b>IKE phase 1</b> (also called the IKE SA). Then they agree the exact cargo rules and cut working keys for each trip. That is <b>IKE phase 2</b> (the IPsec SA, also called the child SA in IKEv2). The van itself is the <b>tunnel</b>; the road is the Internet. Traffic inside is encrypted and authenticated with <b>ESP</b>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Site to site tunnel">
<rect x="10" y="60" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="14">HQ LAN</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="170" y="60" width="110" height="80" rx="10" fill="#bae6fd"/><text x="225" y="92" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW</text><text x="225" y="112" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.1</text>
<rect x="360" y="60" width="110" height="80" rx="10" fill="#bae6fd"/><text x="415" y="92" text-anchor="middle" class="svg-ink" font-size="14">BR-FW</text><text x="415" y="112" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="500" y="60" width="130" height="80" rx="10" fill="#fde68a"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="14">Branch LAN</text><text x="565" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16</text>
<line x1="140" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="470" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="280" y="86" width="80" height="28" rx="14" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">IPsec ESP</text>
<line x1="280" y1="100" x2="360" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">tunnel.11 10.255.11.1/30 to tunnel.11 10.255.11.2/30</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">Internet (untrusted road) in the middle</text>
</svg><p class="cap">The example used in this module. All addresses are documentation or private ranges.</p></div>

<h3>Route-based versus policy-based</h3>
<p>In a <b>policy-based</b> VPN, an access list decides which traffic is encrypted. In a <b>route-based</b> VPN, the tunnel is a virtual interface; anything that the routing table sends out that interface gets encrypted. Palo Alto Networks firewalls are route-based: you create a tunnel interface, point routes at it, and write ordinary security policy for the tunnel zone. Proxy IDs (chapter 6) exist so you can interoperate with policy-based peers.</p>

<h3>The five objects you will build</h3>
<ol>
<li><b>IKE crypto profile</b>: algorithms and lifetime for phase 1.</li>
<li><b>IKE gateway</b>: who the peer is, how you authenticate, which local interface to use.</li>
<li><b>IPsec crypto profile</b>: algorithms and lifetime for phase 2.</li>
<li><b>Tunnel interface</b>: a virtual interface in a zone and virtual router.</li>
<li><b>IPsec tunnel</b>: ties the gateway, the crypto profile and the tunnel interface together.</li>
</ol>
<p>After these you add a <b>route</b> to the remote subnet and a <b>security policy</b> (and a NAT exemption). Forget either and the tunnel can be up while no traffic flows.</p>

<h3>Course map</h3>
<ol>
<li>Big picture (this chapter).</li>
<li>IKE: versions, gateways and the IKE crypto profile.</li>
<li>IPsec crypto profile, tunnel interface and tunnel object.</li>
<li>Building both ends.</li>
<li>Routing, policy and NAT for tunnel traffic.</li>
<li>Proxy IDs, NAT traversal, MTU and monitoring.</li>
<li>Verification commands and logs.</li>
<li>Troubleshooting workflow.</li>
<li>Summary and exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A user at HQ (10.10.4.20) opens a file share at the branch (10.20.1.5). HQ-FW looks up 10.20.1.5 in its routing table. A static route says 10.20.0.0/16 is reachable via tunnel.11. HQ-FW checks the security policy from the trust zone to the VPN zone, encrypts the packet with the IPsec SA and sends it to 203.0.113.1. BR-FW decrypts, checks the policy from the VPN zone to its trust zone and delivers it.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking "tunnel up" means "traffic works". Up only means the negotiation succeeded. Routing, policy and NAT decide whether packets actually use it.</p></div>
<div class="exam"><p><b>Exam trap.</b> PAN-OS tunnels are route-based. The tunnel interface must be in a zone and a virtual router to carry policy-controlled traffic.</p></div>

<div class="scn"><h4>The tunnel that was green for a week</h4><p>A new branch showed a green tunnel on the dashboard, yet nobody could reach HQ. The engineer had built every VPN object correctly but never added a route to HQ's subnet or a policy rule from the branch trust zone to the VPN zone. Ten minutes after adding both, the file shares opened.</p><p><b>Lesson:</b> the tunnel is only the pipe; routing and policy decide who may use it.</p></div>

<div class="iv"><p class="q">"What is the difference between IKE phase 1 and phase 2?"</p><p>Phase 1 builds a secure, authenticated control channel between the two gateways (the IKE SA). Phase 2 uses that channel to negotiate the IPsec SAs that actually encrypt user traffic with ESP. In IKEv2 these are called the IKE SA and the child SA. Mention that on PAN-OS the VPN is route-based.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1 (IKE SA) authenticates the peers; phase 2 (IPsec SA) protects traffic with ESP.</li>
<li>PAN-OS is route-based: tunnel interface plus routes plus policy.</li>
<li>Five objects: IKE crypto profile, IKE gateway, IPsec crypto profile, tunnel interface, IPsec tunnel.</li>
<li>Up is not working: add routing, security policy and NAT exemption.</li>
<li>No lab here; practise surrounding skills in pan-setup, pan-policy and pan-diag.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Palo Alto Networks firewall par route-based site-to-site IPsec VPN banana, padhna aur troubleshoot karna seekhoge: IKE gateways aur crypto profiles, IPsec tunnel object, tunnel interface, tunnel mein jaane wale traffic ke liye routing aur policy, NAT exemption, interoperability points jaise proxy IDs, verification commands aur ek repeatable troubleshooting order. Yeh PAN-OS NGFW Engineer track ke NAT and Networking skills se match karta hai.</p>
<p><b>Prerequisites.</b> Interfaces, zones aur virtual routers (pan-setup), security policy (pan-policy) aur basic CLI habits (pan-diag). Aapko pata hona chahiye ki public IP address aur private subnet kya hote hain. Practice ke baare mein ek baat: simulator IKE ya tunnels ko model nahi karta, isliye yahan har configuration par <b>Reference configuration (not run in the simulator)</b> likha hai, aur is module mein koi lab nahi hai. Related practice ke liye pan-setup, pan-policy aur pan-diag use karo, phir wahi ideas nse4-ipsec (FortiGate) aur sec-asa-vpn (Cisco ASA) mein compare karo.</p>

<h3>Analogy: do offices ke beech armoured van</h3>
<p>Do offices ek vyast public sadak par documents bhejna chahte hain. Woh ek locked armoured van par agree karte hain. Pehle drivers milte hain aur apni pehchaan prove karte hain, phir lock ke type aur keys par agree karte hain. Yeh meeting <b>IKE phase 1</b> hai (jise IKE SA bhi kehte hain). Phir woh exact cargo rules par agree karte hain aur har trip ke liye working keys banate hain. Yeh <b>IKE phase 2</b> hai (IPsec SA, IKEv2 mein child SA). Van khud <b>tunnel</b> hai; sadak Internet hai. Andar ka traffic <b>ESP</b> se encrypted aur authenticated hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Site to site tunnel">
<rect x="10" y="60" width="130" height="80" rx="10" fill="#bbf7d0"/><text x="75" y="95" text-anchor="middle" class="svg-ink" font-size="14">HQ LAN</text><text x="75" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/16</text>
<rect x="170" y="60" width="110" height="80" rx="10" fill="#bae6fd"/><text x="225" y="92" text-anchor="middle" class="svg-ink" font-size="14">HQ-FW</text><text x="225" y="112" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.1</text>
<rect x="360" y="60" width="110" height="80" rx="10" fill="#bae6fd"/><text x="415" y="92" text-anchor="middle" class="svg-ink" font-size="14">BR-FW</text><text x="415" y="112" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="500" y="60" width="130" height="80" rx="10" fill="#fde68a"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="14">Branch LAN</text><text x="565" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/16</text>
<line x1="140" y1="100" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="470" y1="100" x2="500" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="280" y="86" width="80" height="28" rx="14" fill="#ddd6fe"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">IPsec ESP</text>
<line x1="280" y1="100" x2="360" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">tunnel.11 10.255.11.1/30 se tunnel.11 10.255.11.2/30</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">Beech mein Internet (untrusted sadak)</text>
</svg><p class="cap">Is module mein use hone wala example. Saare addresses documentation ya private ranges hain.</p></div>

<h3>Route-based versus policy-based</h3>
<p><b>Policy-based</b> VPN mein ek access list tay karti hai ki kaun sa traffic encrypt hoga. <b>Route-based</b> VPN mein tunnel ek virtual interface hai; routing table jo bhi traffic us interface se bhejti hai woh encrypt ho jaata hai. Palo Alto Networks firewalls route-based hain: aap tunnel interface banate ho, routes uski taraf point karte ho, aur tunnel zone ke liye normal security policy likhte ho. Proxy IDs (chapter 6) policy-based peers ke saath interoperate karne ke liye hote hain.</p>

<h3>Paanch objects jo aap banaoge</h3>
<ol>
<li><b>IKE crypto profile</b>: phase 1 ke algorithms aur lifetime.</li>
<li><b>IKE gateway</b>: peer kaun hai, authentication kaise, kaun sa local interface.</li>
<li><b>IPsec crypto profile</b>: phase 2 ke algorithms aur lifetime.</li>
<li><b>Tunnel interface</b>: zone aur virtual router mein ek virtual interface.</li>
<li><b>IPsec tunnel</b>: gateway, crypto profile aur tunnel interface ko jodta hai.</li>
</ol>
<p>Inke baad aap remote subnet ke liye <b>route</b> aur ek <b>security policy</b> (aur NAT exemption) jodte ho. Inme se kuch bhi bhoola to tunnel up ho sakta hai aur traffic phir bhi nahi chalega.</p>

<h3>Course map</h3>
<ol>
<li>Big picture (yeh chapter).</li>
<li>IKE: versions, gateways aur IKE crypto profile.</li>
<li>IPsec crypto profile, tunnel interface aur tunnel object.</li>
<li>Dono ends banana.</li>
<li>Tunnel traffic ke liye routing, policy aur NAT.</li>
<li>Proxy IDs, NAT traversal, MTU aur monitoring.</li>
<li>Verification commands aur logs.</li>
<li>Troubleshooting workflow.</li>
<li>Summary aur exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> HQ ka ek user (10.10.4.20) branch (10.20.1.5) ka file share kholta hai. HQ-FW routing table mein 10.20.1.5 dekhta hai. Ek static route kehta hai ki 10.20.0.0/16 tunnel.11 ke through reachable hai. HQ-FW trust zone se VPN zone ki security policy check karta hai, packet ko IPsec SA se encrypt karta hai aur 203.0.113.1 ko bhejta hai. BR-FW decrypt karta hai, VPN zone se apne trust zone ki policy check karta hai aur deliver karta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> "Tunnel up" ka matlab "traffic chal raha hai" samajhna. Up ka matlab sirf negotiation safal hui. Packets asal mein use karte hain ya nahi, yeh routing, policy aur NAT tay karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> PAN-OS tunnels route-based hain. Policy-controlled traffic ke liye tunnel interface zone aur virtual router mein hona chahiye.</p></div>

<div class="scn"><h4>Woh tunnel jo ek hafte tak green raha</h4><p>Ek naye branch mein dashboard par tunnel green tha, phir bhi koi HQ tak nahi pahunch pa raha tha. Engineer ne saare VPN objects sahi banaye the lekin HQ ke subnet ka route ya branch trust zone se VPN zone ka policy rule kabhi nahi joda tha. Dono jodne ke das minute baad file shares khul gaye.</p><p><b>Lesson:</b> tunnel sirf pipe hai; kaun use kar sakta hai yeh routing aur policy tay karti hain.</p></div>

<div class="iv"><p class="q">"IKE phase 1 aur phase 2 mein kya difference hai?"</p><p>Phase 1 do gateways ke beech secure, authenticated control channel banata hai (IKE SA). Phase 2 us channel ko use karke IPsec SAs negotiate karta hai jo asal mein user traffic ko ESP se encrypt karte hain. IKEv2 mein inhe IKE SA aur child SA kehte hain. Yeh batao ki PAN-OS par VPN route-based hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1 (IKE SA) peers ko authenticate karta hai; phase 2 (IPsec SA) traffic ko ESP se protect karta hai.</li>
<li>PAN-OS route-based hai: tunnel interface plus routes plus policy.</li>
<li>Paanch objects: IKE crypto profile, IKE gateway, IPsec crypto profile, tunnel interface, IPsec tunnel.</li>
<li>Up matlab working nahi: routing, security policy aur NAT exemption jodo.</li>
<li>Yahan lab nahi; aas-paas ki skills pan-setup, pan-policy aur pan-diag mein practise karo.</li>
</ul></div>
`}};export{e as default};