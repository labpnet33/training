var e={id:`dia-security`,h:{en:`Direct internet access and security basics`,hi:`Direct internet access aur security basics`},body:{en:`
<p>In the old hub-and-spoke WAN, a branch employee opening a public web page sent the traffic over MPLS to the data center, through the central firewall, out to the Internet and all the way back. That is like posting a letter to your head office so that they can post it on your behalf. It works, but it wastes expensive MPLS bandwidth and adds delay. <b>Direct internet access (DIA)</b>, also called local internet breakout, lets the branch send Internet-bound traffic straight out of its own Internet circuit. Because the traffic no longer passes through the central firewall, the branch itself must provide security.</p>

<h3>Two kinds of traffic at a branch</h3>
<ul>
<li><b>Overlay (site-to-site) traffic</b>: Delhi PC to a Bengaluru server, encrypted in IPsec tunnels over Internet, MPLS or LTE. This is the traffic our steering policy chooses a transport for.</li>
<li><b>Internet-bound traffic</b>: Delhi PC to a public SaaS or website, sent out natively through the local Internet circuit and translated by NAT (source NAT to the branch public address).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Overlay versus direct internet access">
<rect x="20" y="95" width="130" height="70" rx="8" fill="#bae6fd"/><text x="85" y="125" text-anchor="middle" class="svg-ink" font-size="14">Branch1</text><text x="85" y="145" text-anchor="middle" class="svg-muted" font-size="12">VOS CPE</text>
<rect x="260" y="15" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="335" y="43" text-anchor="middle" class="svg-ink" font-size="13">Overlay tunnels</text>
<rect x="260" y="105" width="150" height="46" rx="8" fill="#fde68a"/><text x="335" y="133" text-anchor="middle" class="svg-ink" font-size="13">Local Internet exit</text>
<rect x="260" y="195" width="150" height="46" rx="8" fill="#e2e8f0"/><text x="335" y="223" text-anchor="middle" class="svg-ink" font-size="13">Central DC exit</text>
<rect x="500" y="15" width="120" height="46" rx="8" fill="#ddd6fe"/><text x="560" y="43" text-anchor="middle" class="svg-ink" font-size="13">Other sites</text>
<rect x="500" y="105" width="120" height="46" rx="8" fill="#ddd6fe"/><text x="560" y="133" text-anchor="middle" class="svg-ink" font-size="13">SaaS / web</text>
<rect x="500" y="195" width="120" height="46" rx="8" fill="#ddd6fe"/><text x="560" y="223" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="150" y1="115" x2="260" y2="38" stroke="#64748b" stroke-width="2"/><line x1="150" y1="130" x2="260" y2="128" stroke="#64748b" stroke-width="2"/><line x1="150" y1="145" x2="260" y2="218" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="410" y1="38" x2="500" y2="38" stroke="#64748b" stroke-width="2"/><line x1="410" y1="128" x2="500" y2="128" stroke="#64748b" stroke-width="2"/><line x1="410" y1="218" x2="500" y2="218" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="560" y="255" text-anchor="middle" class="svg-muted" font-size="12">dashed = old backhaul design</text>
</svg><p class="cap">DIA breaks out locally; overlay traffic uses steered tunnels.</p></div>

<h3>Security building blocks (foundation level)</h3>
<dl class="terms">
<dt>Zone</dt><dd>A named group of interfaces with the same trust level, such as <code>Trust</code> (LAN), <code>Untrust</code> (Internet) and perhaps <code>Overlay</code>. Rules are written between zones: from Trust to Untrust.</dd>
<dt>Next-generation firewall (NGFW) rule</dt><dd>A rule that matches source zone, destination zone, addresses, <b>application</b> and users, and then allows or denies. Because it knows the application, it can allow "web browsing" and deny "peer-to-peer" even when both use port 443.</dd>
<dt>Stateful inspection</dt><dd>The firewall remembers outbound sessions and allows the returning replies automatically, while unsolicited inbound traffic is denied by default.</dd>
<dt>NAT</dt><dd>Translates private LAN addresses (10.1.1.0/24) to the branch public address for Internet-bound traffic.</dd>
<dt>URL filtering</dt><dd>Blocks or allows web sites by category (for example gambling or malware sites) using a categorisation database.</dd>
<dt>IDP/IPS, antivirus, TLS decryption</dt><dd>Optional profiles that inspect allowed traffic for known attacks and malware. Decryption (SSL/TLS inspection) lets the device see inside encrypted sessions and needs certificate planning and a privacy policy.</dd>
</dl>
<p>VOS is a single-pass, multi-tenant platform: SD-WAN, routing and these security functions run in one pass through the same engine for each organization. You can therefore combine a security rule and a steering rule on the same application.</p>

<h3>How DIA interacts with steering</h3>
<ul>
<li><b>Different decision.</b> Steering picks one of several overlay transports. For DIA the question is "which Internet exit": the local Internet circuit, or backhaul over the overlay to a central gateway or cloud security service.</li>
<li><b>Application-based breakout.</b> A common design sends trusted SaaS locally, but backhauls other Internet traffic to a central inspection point. The same application match drives both.</li>
<li><b>Failover.</b> If the local Internet circuit fails, DIA traffic needs another exit (LTE, or via the overlay). Plan this on purpose; do not discover it during an outage.</li>
<li><b>Capacity.</b> Internet circuit is shared by DIA and the Internet overlay tunnel. A large download can hurt tunnel probes, which makes the SLA monitor report a poor Internet transport. QoS (chapter 8) helps here.</li>
<li><b>Security first.</b> A rule that matches and allows traffic does not decide the path, and a steering rule does not permit traffic. Both layers must agree: the firewall must allow the flow, then steering selects its transport.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Delhi design: a rule sends Microsoft 365 and web traffic out locally with source NAT 203.0.113.6 (the Branch1 Internet address in the lab); URL filtering blocks the "malware" category; ERP goes through the overlay to the Mumbai headend over MPLS first; voice follows VOICE-FP. The Trust-to-Untrust firewall rule allows web, the Trust-to-Overlay rule allows ERP and voice. Three separate decisions, one engine.</p></div>

<div class="note"><p><b>Scope.</b> The course CLI does not model zones, NAT or URL filtering; the labs focus on overlay steering. The lab address 203.0.113.6 is just the Delhi Internet circuit address used for the tunnel. Real Versa provides zones, access policies, NAT, URL filtering, IDP, antivirus, TLS decryption and cloud-security integrations, configured from the Director templates; check your release for exact object names.</p></div>

<div class="warn"><p><b>Common mistakes:</b> enabling DIA without any firewall rules ("it just works" until it is breached); forgetting NAT; decrypting traffic without a privacy review; assuming the central firewall still protects traffic that now breaks out locally; blocking the tunnel's own control traffic with an over-strict Untrust rule.</p></div>
<div class="exam"><p><b>Exam trap:</b> DIA is Internet-bound traffic leaving locally, not the Internet transport used by the overlay. A packet inside an IPsec tunnel over the Internet circuit is overlay traffic, not DIA.</p></div>

<div class="scn"><h4>Backhaul bill shock</h4><p>A retailer with 200 stores sent all Internet traffic through two data centers over MPLS. Video streaming from the stores' tablets doubled the MPLS bill. The team enabled DIA for web and SaaS with a branch firewall, URL filtering and NAT, and kept ERP and voice on the overlay. MPLS usage fell by 40 percent and web response times halved.</p><p><b>Lesson:</b> DIA saves money and delay, but only when security moves to the branch with it.</p></div>

<div class="iv"><p class="q">"What is DIA, and what do you need to put in place before you enable it?"</p><p>DIA sends Internet-bound traffic out of the branch locally instead of backhauling it. You need zones and NGFW rules, NAT, URL filtering and threat profiles, logging to Analytics, and a failover plan for the local circuit. Say that steering and security are separate decisions on the same engine.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA = local breakout of Internet-bound traffic; overlay traffic is a different thing.</li>
<li>Zones, NGFW rules, NAT, URL filtering, IDP and decryption are the basic security tools.</li>
<li>Firewall allows the flow; steering picks its transport.</li>
<li>The lab CLI models overlay steering only.</li>
</ul></div>
`,hi:`
<p>Purane hub-and-spoke WAN mein branch employee jab koi public web page kholta tha, traffic MPLS se data center jaata, central firewall se guzarta, Internet par nikalta aur poora wapas aata. Yeh waisa hai jaise aap head office ko letter bhejte ho taaki woh aapki taraf se post kar de. Kaam karta hai, lekin mehngi MPLS bandwidth waste karta hai aur delay badhata hai. <b>Direct internet access (DIA)</b>, jise local internet breakout bhi kehte hain, branch ko Internet-bound traffic seedha apne Internet circuit se bhejne deta hai. Kyunki traffic ab central firewall se nahi guzarta, security branch ko khud deni padti hai.</p>

<h3>Branch par do tarah ki traffic</h3>
<ul>
<li><b>Overlay (site-to-site) traffic</b>: Delhi PC se Bengaluru server, Internet, MPLS ya LTE par IPsec tunnels mein encrypted. Yahi woh traffic hai jiska transport hamari steering policy chunti hai.</li>
<li><b>Internet-bound traffic</b>: Delhi PC se public SaaS ya website, local Internet circuit se natively bahar bheji jaati hai aur NAT se translate hoti hai (source NAT branch ke public address par).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Overlay versus direct internet access">
<rect x="20" y="95" width="130" height="70" rx="8" fill="#bae6fd"/><text x="85" y="125" text-anchor="middle" class="svg-ink" font-size="14">Branch1</text><text x="85" y="145" text-anchor="middle" class="svg-muted" font-size="12">VOS CPE</text>
<rect x="260" y="15" width="150" height="46" rx="8" fill="#bbf7d0"/><text x="335" y="43" text-anchor="middle" class="svg-ink" font-size="13">Overlay tunnels</text>
<rect x="260" y="105" width="150" height="46" rx="8" fill="#fde68a"/><text x="335" y="133" text-anchor="middle" class="svg-ink" font-size="13">Local Internet exit</text>
<rect x="260" y="195" width="150" height="46" rx="8" fill="#e2e8f0"/><text x="335" y="223" text-anchor="middle" class="svg-ink" font-size="13">Central DC exit</text>
<rect x="500" y="15" width="120" height="46" rx="8" fill="#ddd6fe"/><text x="560" y="43" text-anchor="middle" class="svg-ink" font-size="13">Doosri sites</text>
<rect x="500" y="105" width="120" height="46" rx="8" fill="#ddd6fe"/><text x="560" y="133" text-anchor="middle" class="svg-ink" font-size="13">SaaS / web</text>
<rect x="500" y="195" width="120" height="46" rx="8" fill="#ddd6fe"/><text x="560" y="223" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="150" y1="115" x2="260" y2="38" stroke="#64748b" stroke-width="2"/><line x1="150" y1="130" x2="260" y2="128" stroke="#64748b" stroke-width="2"/><line x1="150" y1="145" x2="260" y2="218" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="410" y1="38" x2="500" y2="38" stroke="#64748b" stroke-width="2"/><line x1="410" y1="128" x2="500" y2="128" stroke="#64748b" stroke-width="2"/><line x1="410" y1="218" x2="500" y2="218" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="560" y="255" text-anchor="middle" class="svg-muted" font-size="12">dashed = purana backhaul design</text>
</svg><p class="cap">DIA locally break out karta hai; overlay traffic steered tunnels use karti hai.</p></div>

<h3>Security building blocks (foundation level)</h3>
<dl class="terms">
<dt>Zone</dt><dd>Same trust level wale interfaces ka named group, jaise <code>Trust</code> (LAN), <code>Untrust</code> (Internet) aur shayad <code>Overlay</code>. Rules zones ke beech likhe jaate hain: Trust se Untrust.</dd>
<dt>Next-generation firewall (NGFW) rule</dt><dd>Aisa rule jo source zone, destination zone, addresses, <b>application</b> aur users match karta hai, phir allow ya deny karta hai. Kyunki use application pata hoti hai, woh "web browsing" allow aur "peer-to-peer" deny kar sakta hai, chahe dono port 443 use karein.</dd>
<dt>Stateful inspection</dt><dd>Firewall outbound sessions yaad rakhta hai aur lautne wale replies automatically allow karta hai, jabki unsolicited inbound traffic default mein deny hoti hai.</dd>
<dt>NAT</dt><dd>Internet-bound traffic ke liye private LAN addresses (10.1.1.0/24) ko branch ke public address mein translate karta hai.</dd>
<dt>URL filtering</dt><dd>Categorisation database se web sites ko category ke hisaab se block ya allow karta hai (jaise gambling ya malware sites).</dd>
<dt>IDP/IPS, antivirus, TLS decryption</dt><dd>Optional profiles jo allowed traffic mein known attacks aur malware inspect karte hain. Decryption (SSL/TLS inspection) device ko encrypted sessions ke andar dekhne deta hai aur certificate planning aur privacy policy maangta hai.</dd>
</dl>
<p>VOS single-pass, multi-tenant platform hai: SD-WAN, routing aur yeh security functions har organization ke liye same engine se ek hi pass mein chalte hain. Isliye aap same application par security rule aur steering rule combine kar sakte ho.</p>

<h3>DIA steering se kaise interact karta hai</h3>
<ul>
<li><b>Alag decision.</b> Steering kai overlay transports mein se ek chunti hai. DIA mein sawal hai "kaunsa Internet exit": local Internet circuit, ya overlay se central gateway ya cloud security service tak backhaul.</li>
<li><b>Application-based breakout.</b> Ek common design trusted SaaS ko locally bhejta hai, lekin baaki Internet traffic ko central inspection point par backhaul karta hai. Same application match dono ko drive karta hai.</li>
<li><b>Failover.</b> Agar local Internet circuit fail ho jaye to DIA traffic ko doosra exit chahiye (LTE, ya overlay se). Ise jaanbujhkar plan karo; outage ke dauran discover mat karo.</li>
<li><b>Capacity.</b> Internet circuit DIA aur Internet overlay tunnel share karte hain. Bada download tunnel probes ko hurt kar sakta hai, jisse SLA monitor Internet transport ko poor report karta hai. QoS (chapter 8) yahan madad karta hai.</li>
<li><b>Pehle security.</b> Jo rule traffic match karke allow karta hai woh path decide nahi karta, aur steering rule traffic ko permit nahi karta. Dono layers agree honi chahiye: firewall flow allow kare, phir steering uska transport chune.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Delhi design: ek rule Microsoft 365 aur web traffic ko locally source NAT 203.0.113.6 (lab mein Branch1 ka Internet address) ke saath bahar bhejta hai; URL filtering "malware" category block karti hai; ERP overlay se Mumbai headend ko pehle MPLS se jaata hai; voice VOICE-FP follow karti hai. Trust-to-Untrust firewall rule web allow karta hai, Trust-to-Overlay rule ERP aur voice allow karta hai. Teen alag decisions, ek engine.</p></div>

<div class="note"><p><b>Scope.</b> Course CLI zones, NAT ya URL filtering model nahi karta; labs overlay steering par focus karte hain. Lab address 203.0.113.6 bas Delhi Internet circuit ka address hai jo tunnel ke liye use hota hai. Real Versa zones, access policies, NAT, URL filtering, IDP, antivirus, TLS decryption aur cloud-security integrations deta hai, Director templates se configure hote hain; exact object names ke liye apni release dekho.</p></div>

<div class="warn"><p><b>Common mistakes:</b> bina firewall rules ke DIA enable karna ("bas chal jaata hai" jab tak breach na ho); NAT bhool jaana; privacy review ke bina traffic decrypt karna; yeh maan lena ki central firewall abhi bhi us traffic ko protect karta hai jo ab locally break out hoti hai; over-strict Untrust rule se tunnel ki apni control traffic block kar dena.</p></div>
<div class="exam"><p><b>Exam trap:</b> DIA woh Internet-bound traffic hai jo locally nikalti hai, woh Internet transport nahi jo overlay use karta hai. Internet circuit par IPsec tunnel ke andar ka packet overlay traffic hai, DIA nahi.</p></div>

<div class="scn"><h4>Backhaul ka bill shock</h4><p>200 stores wale ek retailer ne saari Internet traffic MPLS se do data centers ke through bheji. Stores ke tablets ki video streaming ne MPLS bill double kar diya. Team ne web aur SaaS ke liye branch firewall, URL filtering aur NAT ke saath DIA enable kiya, aur ERP aur voice overlay par rakhe. MPLS usage 40 percent gira aur web response times aadhe ho gaye.</p><p><b>Lesson:</b> DIA paisa aur delay bachata hai, lekin tabhi jab security bhi uske saath branch par aaye.</p></div>

<div class="iv"><p class="q">"DIA kya hai, aur use enable karne se pehle kya lagana padega?"</p><p>DIA Internet-bound traffic ko backhaul karne ke bajay branch se locally nikalta hai. Aapko zones aur NGFW rules, NAT, URL filtering aur threat profiles, Analytics mein logging, aur local circuit ka failover plan chahiye. Kaho ki steering aur security same engine par alag decisions hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA = Internet-bound traffic ka local breakout; overlay traffic alag cheez hai.</li>
<li>Zones, NGFW rules, NAT, URL filtering, IDP aur decryption basic security tools hain.</li>
<li>Firewall flow allow karta hai; steering uska transport chunti hai.</li>
<li>Lab CLI sirf overlay steering model karta hai.</li>
</ul></div>
`}};export{e as default};