var e={id:`overview`,h:{en:`IPsec site-to-site VPN: what you will learn and the big picture`,hi:`IPsec site-to-site VPN: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a FortiGate builds a <b>route-based IPsec site-to-site VPN</b>: what IKE phase 1 and phase 2 do, how proposals and selectors must match, how to send traffic into the tunnel with routes and policies, how NAT traversal and dead peer detection keep it healthy, and how to troubleshoot the classic mismatches. It covers the IPsec VPN objectives of the Fortinet NSE 4 / FortiOS Administrator 7.6 exam.</p>
<p><b>Prerequisites.</b> You should know the FortiGate basics from <b>nse4-setup</b>, address objects and policies from <b>nse4-policy</b>, and static routes from <b>nse4-routing</b>. Knowing basic encryption words (key, hash, certificate) helps; if you have built tunnels on another platform, <b>sec-asa-vpn</b> and <b>sec-ftd-vpn</b> are good comparisons and <b>sec-crypto</b> explains the maths.</p>
<div class="note"><p><b>Honest note about practice.</b> The simulator does not yet have an IPsec lab on the FortiGate. Configuration in this module is labelled <b>Reference configuration (not run in the simulator)</b>, and I do not print command output I have not captured. Practise the surrounding skills in nse4-setup, nse4-policy and nse4-routing.</p></div>

<h3>Analogy: an armoured courier between two offices</h3>
<p>Two offices need to exchange confidential files over the public road. They agree on a courier company, a sealed box, a code book and a password check at the door. First the couriers meet and prove who they are (this is <b>phase 1</b>). Then they agree which boxes go from which office to which (this is <b>phase 2</b>). After that, every parcel travels sealed on the public road. Anyone watching sees only a sealed box going between two street addresses.</p>
<p>IPsec works the same way. The two public IP addresses are the street addresses. The inner private packets, such as 10.10.0.0/24 to 10.20.0.0/24, are the files inside the box.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Site-to-site IPsec between two FortiGates">
<rect x="20" y="50" width="120" height="70" rx="10" fill="#bae6fd"/><text x="80" y="82" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="80" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24</text>
<rect x="170" y="50" width="100" height="70" rx="10" fill="#bbf7d0"/><text x="220" y="82" text-anchor="middle" class="svg-ink" font-size="13">FGT-HQ</text><text x="220" y="102" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<rect x="370" y="50" width="100" height="70" rx="10" fill="#bbf7d0"/><text x="420" y="82" text-anchor="middle" class="svg-ink" font-size="13">FGT-BR</text><text x="420" y="102" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<rect x="500" y="50" width="120" height="70" rx="10" fill="#bae6fd"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="13">Branch LAN</text><text x="560" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/24</text>
<line x1="140" y1="85" x2="170" y2="85" stroke="#64748b" stroke-width="2"/><line x1="470" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="72" width="100" height="26" rx="13" fill="#fde68a"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="12">IPsec tunnel</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Internet between the two public addresses</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Phase 1 = peers authenticate; phase 2 = traffic is protected</text>
</svg><p class="cap">Two FortiGates join two private LANs across the internet.</p></div>

<h3>The pieces of IPsec</h3>
<ul>
<li><b>IKE (Internet Key Exchange).</b> The control protocol that authenticates the peers and negotiates keys. It uses UDP port 500, and UDP port 4500 when NAT traversal is in play. FortiGate supports <b>IKEv1</b> and <b>IKEv2</b>; IKEv2 is the modern choice.</li>
<li><b>ESP (Encapsulating Security Payload).</b> IP protocol 50. It carries the encrypted user data. This is the part that protects your packets.</li>
<li><b>SA (security association).</b> A one-way agreement of keys and algorithms. There is an <b>IKE SA</b> (phase 1) and, per direction, <b>IPsec SAs</b> (phase 2, called child SAs in IKEv2).</li>
<li><b>Tunnel mode.</b> The whole original packet is encrypted and wrapped in a new IP header. This is what site-to-site VPNs use.</li>
</ul>

<h3>Route-based versus policy-based</h3>
<p>FortiGate can build a tunnel as a <b>virtual interface</b>. You then send traffic into the tunnel the same way as into any interface: with a <b>route</b> and a <b>policy</b>. This is the <b>route-based</b> (interface-mode) design, and it is the one you will use and be tested on. The older <b>policy-based</b> design, where the policy itself selected encryption, is a legacy option and is not the focus of the current exam. Route-based is more flexible: you can run dynamic routing over it, use several tunnels for the same destination, and troubleshoot with the normal routing and policy tools.</p>

<div class="eg"><p><b>Worked example.</b> HQ (10.10.0.0/24, public 203.0.113.10) must reach the Pune branch (10.20.0.0/24, public 198.51.100.10). The plan has four parts: a phase 1 interface called <code>to-BRANCH</code>, a phase 2 for the two subnets, a static route <code>10.20.0.0/24 via to-BRANCH</code>, and two policies, one for each direction. The following chapters build exactly that.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking a VPN is "up" because the tunnel icon is green. Traffic also needs a route and a policy that allow it. Green tunnel and no traffic is usually a routing or policy problem, not an encryption problem.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 authenticates the peers and builds the secure control channel; phase 2 negotiates the IPsec SAs that protect the data. If a question asks where the pre-shared key or certificate is used, the answer is phase 1.</p></div>

<div class="scn"><h4>The branch that needed a private link without a private-link bill</h4><p>A training centre in a second city needed access to the HQ student database and a file server, but a leased line was too expensive. The network team built a route-based IPsec tunnel across two ordinary internet connections. Monthly cost fell sharply and the link was ready in a day. The only delays were a mismatched proposal and a missing return policy, both of which this module teaches you to spot.</p><p><b>Lesson:</b> IPsec gives private connectivity over public links, but only if both sides agree on every parameter.</p></div>

<div class="iv"><p class="q">"What is the difference between phase 1 and phase 2?"</p><p>Phase 1 builds the IKE security association: peers authenticate with a pre-shared key or certificate and agree on how to protect their negotiation. Phase 2 negotiates the IPsec SAs that encrypt the user traffic, based on selectors. In IKEv2 phase 2 is called the child SA. I would add that the tunnel also needs a route and a policy before traffic flows.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPsec protects traffic between two sites over an untrusted network.</li>
<li>IKE (UDP 500 and 4500) negotiates keys; ESP (protocol 50) carries the data.</li>
<li>Phase 1 authenticates peers; phase 2 protects the data.</li>
<li>Route-based VPNs use a tunnel interface plus routes and policies.</li>
<li>A working tunnel still needs routing and firewall policy.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki FortiGate <b>route-based IPsec site-to-site VPN</b> kaise banata hai: IKE phase 1 aur phase 2 kya karte hain, proposals aur selectors kaise match hone chahiye, routes aur policies se traffic tunnel mein kaise bhejte hain, NAT traversal aur dead peer detection tunnel ko healthy kaise rakhte hain, aur classic mismatches ko troubleshoot kaise karte hain. Yeh Fortinet NSE 4 / FortiOS Administrator 7.6 exam ke IPsec VPN objectives cover karta hai.</p>
<p><b>Prerequisites.</b> Aapko <b>nse4-setup</b> ke FortiGate basics, <b>nse4-policy</b> ke address objects aur policies, aur <b>nse4-routing</b> ke static routes aane chahiye. Basic encryption words (key, hash, certificate) pata hon to madad milti hai; kisi aur platform par tunnels banaye hain to <b>sec-asa-vpn</b> aur <b>sec-ftd-vpn</b> achhe comparisons hain aur <b>sec-crypto</b> maths samjhata hai.</p>
<div class="note"><p><b>Practice ke baare mein seedhi baat.</b> Simulator mein abhi FortiGate par IPsec lab nahi hai. Is module ki configuration ko <b>Reference configuration (not run in the simulator)</b> likha gaya hai, aur jo command output maine capture nahi kiya woh print nahi karta. Aas-paas ke skills nse4-setup, nse4-policy aur nse4-routing mein practise karo.</p></div>

<h3>Analogy: do offices ke beech armoured courier</h3>
<p>Do offices ko public sadak par confidential files bhejni hain. Woh ek courier company, sealed box, code book aur darwaze par password check par agree karte hain. Pehle couriers milte hain aur apni pehchaan prove karte hain (yeh <b>phase 1</b> hai). Phir woh tay karte hain ki kaun se boxes kis office se kis office tak jaayenge (yeh <b>phase 2</b> hai). Uske baad har parcel public sadak par sealed safar karta hai. Dekhne wale ko sirf do street addresses ke beech jaata sealed box dikhta hai.</p>
<p>IPsec bilkul aise hi kaam karta hai. Do public IP addresses street addresses hain. Andar ke private packets, jaise 10.10.0.0/24 se 10.20.0.0/24, box ke andar ki files hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Do FortiGates ke beech site-to-site IPsec">
<rect x="20" y="50" width="120" height="70" rx="10" fill="#bae6fd"/><text x="80" y="82" text-anchor="middle" class="svg-ink" font-size="13">HQ LAN</text><text x="80" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24</text>
<rect x="170" y="50" width="100" height="70" rx="10" fill="#bbf7d0"/><text x="220" y="82" text-anchor="middle" class="svg-ink" font-size="13">FGT-HQ</text><text x="220" y="102" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.10</text>
<rect x="370" y="50" width="100" height="70" rx="10" fill="#bbf7d0"/><text x="420" y="82" text-anchor="middle" class="svg-ink" font-size="13">FGT-BR</text><text x="420" y="102" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<rect x="500" y="50" width="120" height="70" rx="10" fill="#bae6fd"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="13">Branch LAN</text><text x="560" y="102" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/24</text>
<line x1="140" y1="85" x2="170" y2="85" stroke="#64748b" stroke-width="2"/><line x1="470" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="72" width="100" height="26" rx="13" fill="#fde68a"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="12">IPsec tunnel</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Dono public addresses ke beech internet</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Phase 1 = peers authenticate; phase 2 = traffic protect hota hai</text>
</svg><p class="cap">Do FortiGates internet ke upar do private LANs ko jodte hain.</p></div>

<h3>IPsec ke pieces</h3>
<ul>
<li><b>IKE (Internet Key Exchange).</b> Control protocol jo peers ko authenticate karta hai aur keys negotiate karta hai. Yeh UDP port 500 use karta hai, aur NAT traversal ho to UDP port 4500. FortiGate <b>IKEv1</b> aur <b>IKEv2</b> dono support karta hai; IKEv2 modern choice hai.</li>
<li><b>ESP (Encapsulating Security Payload).</b> IP protocol 50. Yeh encrypted user data le jaata hai. Yahi hissa aapke packets ko protect karta hai.</li>
<li><b>SA (security association).</b> Keys aur algorithms ka one-way agreement. Ek <b>IKE SA</b> (phase 1) hota hai aur har direction ke liye <b>IPsec SAs</b> (phase 2, IKEv2 mein child SAs).</li>
<li><b>Tunnel mode.</b> Poora original packet encrypt hokar naye IP header mein wrap hota hai. Site-to-site VPNs yahi use karte hain.</li>
</ul>

<h3>Route-based aur policy-based</h3>
<p>FortiGate tunnel ko <b>virtual interface</b> ki tarah bana sakta hai. Phir aap traffic ko tunnel mein waise hi bhejte ho jaise kisi bhi interface mein: ek <b>route</b> aur ek <b>policy</b> se. Yeh <b>route-based</b> (interface-mode) design hai, aur yahi aap use karoge aur isi par test hoge. Purana <b>policy-based</b> design, jisme policy khud encryption select karti thi, legacy option hai aur current exam ka focus nahi. Route-based zyada flexible hai: aap uspar dynamic routing chala sakte ho, same destination ke liye kai tunnels use kar sakte ho, aur normal routing aur policy tools se troubleshoot kar sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> HQ (10.10.0.0/24, public 203.0.113.10) ko Pune branch (10.20.0.0/24, public 198.51.100.10) tak pahunchna hai. Plan ke chaar hisse hain: <code>to-BRANCH</code> naam ka phase 1 interface, do subnets ke liye phase 2, static route <code>10.20.0.0/24 via to-BRANCH</code>, aur do policies, har direction ke liye ek. Agle chapters yahi build karte hain.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Tunnel icon green hai isliye VPN "up" maan lena. Traffic ko allow karne wala route aur policy bhi chahiye. Green tunnel aur traffic nahi, aam taur par routing ya policy problem hai, encryption problem nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 peers ko authenticate karta hai aur secure control channel banata hai; phase 2 woh IPsec SAs negotiate karta hai jo data protect karte hain. Question poochhe ki pre-shared key ya certificate kahan use hota hai to jawab phase 1 hai.</p></div>

<div class="scn"><h4>Branch jise private link chahiye tha, private-link ke bill ke bina</h4><p>Doosre shehar ke training centre ko HQ student database aur file server tak access chahiye tha, lekin leased line bahut mahngi thi. Network team ne do aam internet connections ke upar route-based IPsec tunnel banaya. Monthly cost kaafi gir gayi aur link ek din mein ready ho gaya. Sirf do delays aaye: mismatched proposal aur missing return policy, jinhe pakadna yeh module sikhata hai.</p><p><b>Lesson:</b> IPsec public links par private connectivity deta hai, lekin tabhi jab dono sides har parameter par agree hon.</p></div>

<div class="iv"><p class="q">"Phase 1 aur phase 2 mein kya difference hai?"</p><p>Phase 1 IKE security association banata hai: peers pre-shared key ya certificate se authenticate karte hain aur apni negotiation ko protect karne ka tareeka agree karte hain. Phase 2 woh IPsec SAs negotiate karta hai jo selectors ke aadhar par user traffic encrypt karte hain. IKEv2 mein phase 2 ko child SA kehte hain. Main yeh bhi jodunga ki traffic flow hone se pehle tunnel ko route aur policy bhi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPsec untrusted network par do sites ke beech traffic protect karta hai.</li>
<li>IKE (UDP 500 aur 4500) keys negotiate karta hai; ESP (protocol 50) data le jaata hai.</li>
<li>Phase 1 peers authenticate karta hai; phase 2 data protect karta hai.</li>
<li>Route-based VPN tunnel interface plus routes aur policies use karta hai.</li>
<li>Working tunnel ko phir bhi routing aur firewall policy chahiye.</li>
</ul></div>
`}};export{e as default};