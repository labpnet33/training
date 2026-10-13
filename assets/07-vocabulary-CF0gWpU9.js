var e={id:`vocabulary`,h:{en:`The SD-WAN vocabulary: TLOC, colour, VPN, OMP, BFD, templates and policies`,hi:`SD-WAN vocabulary: TLOC, colour, VPN, OMP, BFD, templates aur policies`},body:{en:`
<p>Every field has its own language. SD-WAN has about a dozen words that appear in almost every sentence of a design review. This chapter explains them in simple terms with small examples. You do not need to memorise them in one sitting: you will meet each word again with commands in later modules, and the glossary in the last chapter repeats them for revision.</p>

<h3>Identity words: who is this device?</h3>
<dl class="terms">
<dt>Organization name</dt><dd>A text label shared by every device of one company (for example BHARAT-RETAIL). It must be spelled exactly the same everywhere, including capital letters. It appears in the certificates, so a mismatch means a device is rejected.</dd>
<dt>System IP</dt><dd>A permanent, unique identifier for each device, written like an IPv4 address (for example 10.255.0.11). It behaves like a router ID. It does not have to be reachable on the network; it just names the device in the overlay.</dd>
<dt>Site ID</dt><dd>A number for a physical location. All routers in one branch share the same site ID. Different sites must have different site IDs. Routers with the same site ID do not build tunnels to each other.</dd>
<dt>Chassis number and serial number</dt><dd>The hardware identity of a WAN edge. The Manager keeps a list of the authorised ones. A device not on the list cannot join.</dd>
<dt>Certificate</dt><dd>A digital passport issued by a trusted authority. Devices show it to each other during connection set-up to prove who they are.</dd>
</dl>

<h3>Transport words: how does this device reach the world?</h3>
<dl class="terms">
<dt>Transport / WAN interface</dt><dd>The router port that connects to a carrier line (MPLS, broadband, LTE). In SD-WAN these ports belong to the <b>transport VPN</b>, called VPN 0.</dd>
<dt>TLOC (Transport Locator)</dt><dd>One attachment of a router to a transport. It is identified by three items: the router's system IP, a colour, and the encapsulation (IPsec). A router with MPLS and broadband has two TLOCs. Think of a TLOC as "a door of this router onto the outside world".</dd>
<dt>Colour</dt><dd>A label for the type of transport on a TLOC, such as mpls, biz-internet, public-internet, lte. Colours are either private (like mpls) or public (like biz-internet). The colour tells routers how to build tunnels and lets policies refer to "the MPLS path" or "the internet path".</dd>
<dt>Tunnel</dt><dd>An encrypted connection (IPsec) between two TLOCs. Tunnels form the overlay.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="A router with two TLOCs">
<rect x="250" y="60" width="140" height="90" rx="12" fill="#bbf7d0"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">WAN edge</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">system IP 10.255.0.11</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="11">site ID 100</text>
<rect x="20" y="30" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">TLOC: colour mpls</text>
<rect x="20" y="140" width="190" height="40" rx="8" fill="#bae6fd"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="12">TLOC: colour biz-internet</text>
<line x1="170" y1="50" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="210" y1="160" x2="250" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="30" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="12">Service VPN 10 (LAN)</text>
<rect x="480" y="140" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="550" y="165" text-anchor="middle" class="svg-ink" font-size="12">Service VPN 20 (guest)</text>
<line x1="390" y1="85" x2="480" y2="50" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="480" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="11">Transports on the left (VPN 0), user segments on the right (service VPNs)</text>
</svg><p class="cap">One edge, two TLOCs facing the WAN, two service VPNs facing the users.</p></div>

<h3>Segmentation words: how is traffic separated?</h3>
<dl class="terms">
<dt>VPN (segment)</dt><dd>In Cisco SD-WAN, a VPN is a separate routing domain, like a private virtual network inside the router. On IOS XE routers each VPN is a <b>VRF</b>. Traffic in one VPN cannot reach another unless a policy allows it. Special numbers: <b>VPN 0</b> carries the transport side and control connections; <b>VPN 512</b> is for out-of-band management; the others (for example VPN 10 corporate, VPN 20 guest) are <b>service VPNs</b> for users.</dd>
</dl>

<h3>Protocol words: how do devices talk?</h3>
<dl class="terms">
<dt>DTLS / TLS</dt><dd>The secure protocols used for the control connections between devices and the controllers. DTLS runs over UDP (the default); TLS runs over TCP.</dd>
<dt>OMP (Overlay Management Protocol)</dt><dd>The routing protocol of the overlay. Edges tell the Controller about their networks, TLOCs and services; the Controller redistributes them, applying policy. It is similar to BGP with a route reflector, but designed for SD-WAN.</dd>
<dt>IPsec</dt><dd>The encryption standard that protects the tunnels between edges.</dd>
<dt>BFD (Bidirectional Forwarding Detection)</dt><dd>A very light "are you there?" exchange that runs inside every tunnel. It tells an edge whether a tunnel is alive and measures loss, latency and jitter. These measurements drive application-aware routing.</dd>
</dl>

<h3>Management words: how is it controlled?</h3>
<dl class="terms">
<dt>Template</dt><dd>A reusable description of device configuration stored in the Manager. A <b>device template</b> is built from <b>feature templates</b> (pieces such as an interface or a routing section). Newer designs use <b>configuration groups</b>, which serve the same goal with a simpler workflow.</dd>
<dt>Policy</dt><dd>A rule that controls the overlay. <b>Control policy</b> shapes routing (which sites can talk to which, hub-and-spoke or full mesh). <b>Data policy</b> acts on user traffic (steer, mark, drop). <b>Application-aware routing policy</b> chooses paths by measured quality. A <b>centralized policy</b> lives on the Controller; a <b>localized policy</b> applies on the device.</dd>
<dt>WAN edge list</dt><dd>The Manager's list of authorised routers, built from the serial file or the Smart Account.</dd>
</dl>

<table class="cmp"><tr><th>Word</th><th>One-line meaning</th><th>Analogy</th></tr>
<tr><td>System IP</td><td>Device name in the overlay</td><td>Employee ID</td></tr>
<tr><td>Site ID</td><td>Location number</td><td>Office code</td></tr>
<tr><td>TLOC</td><td>Router + transport attachment</td><td>A door of the building</td></tr>
<tr><td>Colour</td><td>Type of transport</td><td>Road type: highway or lane</td></tr>
<tr><td>VPN</td><td>Separate routing domain</td><td>A separate floor with its own lift</td></tr>
<tr><td>OMP</td><td>Overlay routing protocol</td><td>The shared address book</td></tr>
<tr><td>BFD</td><td>Tunnel health check</td><td>A heartbeat monitor</td></tr>
<tr><td>Template</td><td>Reusable configuration</td><td>A form with blanks</td></tr>
<tr><td>Policy</td><td>Rule for routing or traffic</td><td>Traffic rules for the city</td></tr></table>

<div class="eg"><p><b>Worked example: decode a sentence.</b> "Site 300 has one TLOC, colour biz-internet, and runs only VPN 10." Decoded: the Bengaluru location (site ID 300) has a single transport attachment, broadband internet, so its router has one tunnel path to every other site. Only corporate users exist there; there is no guest segment, so guest routes are never sent to it.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Mixing up VPN in SD-WAN with an IPsec remote-access VPN. In SD-WAN a "VPN" is a segment (a VRF), not an encrypted connection. The encrypted connections are the IPsec tunnels.</p></div>

<div class="scn"><h4>Two sites, one site ID</h4><p>An engineer cloned a store's configuration to a new store and forgot to change the site ID. The two routers were in different cities but shared site ID 220. They refused to build tunnels with each other, and some traffic between the stores failed, while both reached the data centre perfectly. The fix was a one-line change of the site ID to a unique number.</p><p><b>Lesson:</b> small identity words are not decoration. A duplicated site ID, system IP or a mistyped organization name behaves like a hidden fault; check identities first.</p></div>

<div class="iv"><p class="q">"What is a TLOC and how is it different from a system IP?"</p><p>A TLOC is a transport attachment of a router, identified by system IP plus colour plus encapsulation. The system IP is only the device identity (like a router ID); one device has one system IP but may have several TLOCs, one per transport. Add that OMP advertises TLOCs so other edges know where to build tunnels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity: organization name, system IP, site ID, chassis and serial numbers, certificate.</li>
<li>A TLOC = system IP + colour + encapsulation; the colour describes the transport type.</li>
<li>A VPN is a segment (VRF); VPN 0 is transport, VPN 512 is management, the rest are service VPNs.</li>
<li>OMP distributes routes through the Controller; BFD measures each tunnel; IPsec encrypts it.</li>
<li>Templates or configuration groups define devices; policies define behaviour of routing and traffic.</li>
</ul></div>
`,hi:`
<p>Har field ki apni zubaan hoti hai. SD-WAN mein lagbhag ek darjan words hain jo design review ke lagbhag har sentence mein aate hain. Yeh chapter unhe simple terms mein chhote examples ke saath samjhata hai. Aapko ek baithak mein sab yaad karne ki zaroorat nahi: har word baad ke modules mein commands ke saath phir milega, aur aakhri chapter ki glossary revision ke liye unhe dohrati hai.</p>

<h3>Identity words: yeh device kaun hai?</h3>
<dl class="terms">
<dt>Organization name</dt><dd>Ek company ke har device dwara share kiya gaya text label (jaise BHARAT-RETAIL). Yeh har jagah bilkul ek jaisa likha hona chahiye, capital letters samet. Yeh certificates mein aata hai, isliye mismatch ka matlab device reject ho jaata hai.</dd>
<dt>System IP</dt><dd>Har device ka permanent, unique identifier, jo IPv4 address jaisa likha jaata hai (jaise 10.255.0.11). Yeh router ID jaisa behave karta hai. Network par reachable hona zaroori nahi; woh bas overlay mein device ka naam hai.</dd>
<dt>Site ID</dt><dd>Ek physical location ka number. Ek branch ke saare routers same site ID share karte hain. Alag sites ke site IDs alag hone chahiye. Same site ID wale routers aapas mein tunnel nahi banate.</dd>
<dt>Chassis number aur serial number</dt><dd>WAN edge ki hardware identity. Manager authorised wale numbers ki list rakhta hai. List mein na hone wala device join nahi kar sakta.</dd>
<dt>Certificate</dt><dd>Trusted authority ka diya digital passport. Devices connection set-up ke dauraan ek doosre ko yeh dikhate hain taaki saabit karein ki woh kaun hain.</dd>
</dl>

<h3>Transport words: yeh device duniya tak kaise pahunchta hai?</h3>
<dl class="terms">
<dt>Transport / WAN interface</dt><dd>Router ka woh port jo carrier line (MPLS, broadband, LTE) se judta hai. SD-WAN mein yeh ports <b>transport VPN</b> ke hain, jise VPN 0 kehte hain.</dd>
<dt>TLOC (Transport Locator)</dt><dd>Router ka ek transport se ek attachment. Iski pehchaan teen cheezon se hoti hai: router ka system IP, ek colour, aur encapsulation (IPsec). MPLS aur broadband wale router ke do TLOCs hote hain. TLOC ko "is router ka bahar ki duniya ki taraf ek darwaza" samjho.</dd>
<dt>Colour</dt><dd>TLOC par transport ke type ka label, jaise mpls, biz-internet, public-internet, lte. Colours ya to private (jaise mpls) hote hain ya public (jaise biz-internet). Colour routers ko batata hai ki tunnels kaise banane hain aur policies ko "MPLS path" ya "internet path" ka zikr karne deta hai.</dd>
<dt>Tunnel</dt><dd>Do TLOCs ke beech encrypted connection (IPsec). Tunnels overlay banate hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Do TLOCs wala router">
<rect x="250" y="60" width="140" height="90" rx="12" fill="#bbf7d0"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">WAN edge</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">system IP 10.255.0.11</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="11">site ID 100</text>
<rect x="20" y="30" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">TLOC: colour mpls</text>
<rect x="20" y="140" width="190" height="40" rx="8" fill="#bae6fd"/><text x="115" y="165" text-anchor="middle" class="svg-ink" font-size="12">TLOC: colour biz-internet</text>
<line x1="170" y1="50" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="210" y1="160" x2="250" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="30" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="550" y="55" text-anchor="middle" class="svg-ink" font-size="12">Service VPN 10 (LAN)</text>
<rect x="480" y="140" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="550" y="165" text-anchor="middle" class="svg-ink" font-size="12">Service VPN 20 (guest)</text>
<line x1="390" y1="85" x2="480" y2="50" stroke="#64748b" stroke-width="2"/><line x1="390" y1="130" x2="480" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="11">Left mein transports (VPN 0), right mein user segments (service VPNs)</text>
</svg><p class="cap">Ek edge, WAN ki taraf do TLOCs, users ki taraf do service VPNs.</p></div>

<h3>Segmentation words: traffic kaise alag hota hai?</h3>
<dl class="terms">
<dt>VPN (segment)</dt><dd>Cisco SD-WAN mein VPN ek alag routing domain hai, router ke andar ek private virtual network jaisa. IOS XE routers par har VPN ek <b>VRF</b> hai. Ek VPN ka traffic doosre tak nahi pahunch sakta jab tak koi policy allow na kare. Khaas numbers: <b>VPN 0</b> transport side aur control connections ko carry karta hai; <b>VPN 512</b> out-of-band management ke liye hai; baaki (jaise VPN 10 corporate, VPN 20 guest) users ke liye <b>service VPNs</b> hain.</dd>
</dl>

<h3>Protocol words: devices kaise baat karte hain?</h3>
<dl class="terms">
<dt>DTLS / TLS</dt><dd>Devices aur controllers ke beech control connections ke liye use hone wale secure protocols. DTLS UDP par chalta hai (default); TLS TCP par chalta hai.</dd>
<dt>OMP (Overlay Management Protocol)</dt><dd>Overlay ka routing protocol. Edges Controller ko apne networks, TLOCs aur services batate hain; Controller policy lagakar unhe redistribute karta hai. Yeh route reflector wale BGP jaisa hai, par SD-WAN ke liye design kiya gaya.</dd>
<dt>IPsec</dt><dd>Edges ke beech tunnels ko protect karne wala encryption standard.</dd>
<dt>BFD (Bidirectional Forwarding Detection)</dt><dd>Har tunnel ke andar chalne wala bahut halka "kya aap wahan ho?" exchange. Yeh edge ko batata hai ki tunnel zinda hai ya nahi aur loss, latency aur jitter measure karta hai. Yeh measurements application-aware routing ko chalate hain.</dd>
</dl>

<h3>Management words: yeh kaise control hota hai?</h3>
<dl class="terms">
<dt>Template</dt><dd>Manager mein stored device configuration ka reusable description. <b>Device template</b> <b>feature templates</b> (jaise interface ya routing section ke tukde) se banta hai. Naye designs <b>configuration groups</b> use karte hain, jo simple workflow ke saath wahi goal poora karte hain.</dd>
<dt>Policy</dt><dd>Overlay ko control karne wala rule. <b>Control policy</b> routing ko shape karti hai (kaunsi sites kis se baat kar sakti hain, hub-and-spoke ya full mesh). <b>Data policy</b> user traffic par kaam karti hai (steer, mark, drop). <b>Application-aware routing policy</b> measured quality se paths chunti hai. <b>Centralized policy</b> Controller par rehti hai; <b>localized policy</b> device par lagu hoti hai.</dd>
<dt>WAN edge list</dt><dd>Manager ki authorised routers ki list, jo serial file ya Smart Account se banti hai.</dd>
</dl>

<table class="cmp"><tr><th>Word</th><th>Ek line mein matlab</th><th>Analogy</th></tr>
<tr><td>System IP</td><td>Overlay mein device ka naam</td><td>Employee ID</td></tr>
<tr><td>Site ID</td><td>Location number</td><td>Office code</td></tr>
<tr><td>TLOC</td><td>Router + transport attachment</td><td>Building ka ek darwaza</td></tr>
<tr><td>Colour</td><td>Transport ka type</td><td>Road type: highway ya lane</td></tr>
<tr><td>VPN</td><td>Alag routing domain</td><td>Apni lift wala alag floor</td></tr>
<tr><td>OMP</td><td>Overlay routing protocol</td><td>Shared address book</td></tr>
<tr><td>BFD</td><td>Tunnel health check</td><td>Heartbeat monitor</td></tr>
<tr><td>Template</td><td>Reusable configuration</td><td>Khaali jagah wala form</td></tr>
<tr><td>Policy</td><td>Routing ya traffic ka rule</td><td>Shehar ke traffic rules</td></tr></table>

<div class="eg"><p><b>Worked example: ek sentence decode karo.</b> "Site 300 has one TLOC, colour biz-internet, and runs only VPN 10." Decode: Bengaluru location (site ID 300) ka ek hi transport attachment hai, broadband internet, isliye uske router ka har doosri site tak ek hi tunnel path hai. Wahan sirf corporate users hain; koi guest segment nahi, isliye guest routes use kabhi bheje hi nahi jaate.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> SD-WAN ke VPN ko IPsec remote-access VPN ke saath mix kar dena. SD-WAN mein "VPN" ek segment (VRF) hai, encrypted connection nahi. Encrypted connections IPsec tunnels hain.</p></div>

<div class="scn"><h4>Do sites, ek site ID</h4><p>Ek engineer ne ek store ki configuration naye store par clone kar di aur site ID badalna bhool gaya. Dono routers alag shehron mein the par site ID 220 share kar rahe the. Unhone aapas mein tunnel banane se inkaar kar diya, aur dono stores ke beech kuch traffic fail hua, jabki dono data centre tak bilkul theek pahunch rahe the. Fix site ID ko ek unique number mein badalne ki ek line thi.</p><p><b>Seekh:</b> chhote identity words sajawat nahi hain. Duplicate site ID, system IP ya galat likha organization name chhupe hue fault ki tarah behave karta hai; pehle identities check karo.</p></div>

<div class="iv"><p class="q">"TLOC kya hai aur system IP se kaise alag hai?"</p><p>TLOC router ka ek transport attachment hai, jise system IP plus colour plus encapsulation se pehchana jaata hai. System IP sirf device identity hai (router ID jaisa); ek device ka ek system IP hota hai par kai TLOCs ho sakte hain, har transport ke liye ek. Yeh jodo ki OMP TLOCs ko advertise karta hai taaki doosre edges ko pata chale ki tunnels kahan banane hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity: organization name, system IP, site ID, chassis aur serial numbers, certificate.</li>
<li>TLOC = system IP + colour + encapsulation; colour transport type batata hai.</li>
<li>VPN ek segment (VRF) hai; VPN 0 transport, VPN 512 management, baaki service VPNs.</li>
<li>OMP Controller ke through routes baant-ta hai; BFD har tunnel measure karta hai; IPsec use encrypt karta hai.</li>
<li>Templates ya configuration groups devices define karte hain; policies routing aur traffic ka behaviour define karti hain.</li>
</ul></div>
`}};export{e as default};