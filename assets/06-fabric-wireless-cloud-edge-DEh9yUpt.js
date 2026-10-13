var e={id:`policy-edge`,h:{en:`SD-Access and SD-WAN policy, wireless integration and Internet edge`,hi:`SD-Access aur SD-WAN policy, wireless integration aur Internet edge`},body:{en:`
<h3>Customer case: Orchid Retail</h3>
<div class="eg"><p><b>Company:</b> Orchid Retail, a fashion chain with 220 stores, a head office of 1,200 staff and cloud-hosted e-commerce and payment systems. <b>Drivers:</b> store traffic is backhauled over MPLS to a head-office firewall, so cloud apps and video training are slow; card payment terminals must be isolated for PCI DSS; stores have Wi-Fi for handheld scanners and a guest network. Head office is replacing its campus network. <b>Constraints:</b> each store has two cheap Internet circuits and one MPLS, a 5-person network team, and a 3-year budget cycle. Mapped to the exam: <b>SD-Access</b> for head office, <b>SD-WAN</b> for stores, <b>wireless integration</b> and <b>Internet edge/cloud services</b> in between.</p></div>

<h3>SD-Access: macro and micro segmentation</h3>
<p>An SD-Access fabric has <b>edge nodes</b> (connect endpoints), <b>border nodes</b> (connect to outside), and <b>control-plane nodes</b> (LISP map server that knows where each endpoint is). Traffic is carried in VXLAN with a Group Policy Option, which carries both the VN and the SGT. Two policy layers:</p>
<ul>
<li><b>Macro-segmentation:</b> virtual networks (VNs, VRFs) separate big groups, such as Corporate, Guests and IoT. Nothing crosses VNs unless the border leaks routes through a firewall.</li>
<li><b>Micro-segmentation:</b> SGTs and group-based policy inside a VN, authored in Catalyst Center (formerly DNA Center) and ISE.</li>
</ul>
<p>Design rules: put the fabric edge close to users (routed access), use at least two border nodes and two control-plane nodes, connect the border to a fusion firewall or router for shared services (DHCP, DNS, ISE), and place ISE where all fabric sites can reach it. Use <b>SD-Access Transit</b> (or IP transit) between fabric sites, and keep each site's control plane local so a WAN failure does not blind it.</p>

<h3>SD-WAN: policy and security</h3>
<p>Cisco SD-WAN separates the control plane (SD-WAN Manager, Controller, Validator) from WAN edge routers that form IPsec tunnels over any transport (called TLOCs, identified by system IP and colour such as mpls and biz-internet). Policies:</p>
<ul>
<li><b>Centralised control policy:</b> influences routing and topology (hub-and-spoke or full-mesh by VPN).</li>
<li><b>Centralised data policy and application-aware routing:</b> steer traffic by application and by measured loss, latency and jitter (for example, voice prefers MPLS, falls to Internet if MPLS loses over 2 percent).</li>
<li><b>Localised policy:</b> QoS on the device. SD-WAN edges have up to 8 queues, with queue 0 as the low-latency queue.</li>
<li><b>Segmentation:</b> service-side VPNs are separate routing instances (VPN 0 is transport, VPN 512 is management). Put the card terminals in their own VPN to isolate PCI.</li>
<li><b>Security:</b> on-box zone-based firewall, IPS, URL filtering, advanced malware protection, plus cloud security (Umbrella SIG) for DNS and web.</li>
</ul>

<h3>Wireless integration: which mode where</h3>
<table class="cmp"><tr><th>Mode</th><th>How</th><th>Fit</th></tr>
<tr><td><b>Centralised (local mode)</b></td><td>APs build CAPWAP tunnels to a WLC; all client data tunnels to the controller</td><td>Campus with fast LAN; central policy; needs reliable low-latency path (guideline: round trip under 100 ms)</td></tr>
<tr><td><b>FlexConnect</b></td><td>Control to central WLC; client data switched locally at the branch; survives WAN loss</td><td>Stores and small branches</td></tr>
<tr><td><b>Fabric-enabled wireless</b></td><td>AP joins the fabric edge; VXLAN from AP to edge switch; WLC for control plane only</td><td>SD-Access campus with the same policy for wired and wireless</td></tr>
<tr><td><b>Embedded wireless controller</b></td><td>Controller runs on a Catalyst 9000 switch</td><td>Small sites without a dedicated WLC</td></tr></table>
<p>Design for WLC redundancy: an SSO HA pair or N+1, with APs holding primary and secondary controller preferences. Wireless QoS uses WMM access categories (voice, video, best effort, background), mapped from DSCP at the AP, so trust and marking must be consistent end to end.</p>

<h3>Internet edge and cloud-hosted services</h3>
<p>A classic Internet edge has dual ISPs (BGP, with your own provider-independent prefix or provider prefixes), edge routers, a pair of firewalls with a DMZ for public servers, NAT, and DDoS scrubbing options. Decide <b>where Internet traffic exits</b>:</p>
<table class="cmp"><tr><th>Model</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Centralised breakout at head office</td><td>One security stack, easy audit</td><td>Backhaul latency, expensive MPLS bandwidth, single choke point</td></tr>
<tr><td>Regional breakout (data center or colocation)</td><td>Shorter paths, shared security</td><td>Needs regional hubs</td></tr>
<tr><td>Direct Internet access (DIA) at each store with local security and cloud security</td><td>Best cloud performance, cheap bandwidth</td><td>Security must move to the edge; more places to manage</td></tr></table>
<p>For SaaS and IaaS, Cisco SD-WAN <b>Cloud OnRamp</b> measures the path quality to the application and picks the best exit. For cloud-hosted network services (ISE or DNS in the cloud), keep latency, certificate trust and a local fallback in mind.</p>

<h3>Chosen design for Orchid</h3>
<p>Head office: SD-Access with VNs for Corporate, Guest and IoT; SGTs for departments; fabric-enabled wireless; two borders to a firewall pair that is the Internet edge. Stores: SD-WAN with MPLS and two Internet circuits; DIA for SaaS with on-box security and cloud DNS and web security; a separate VPN for payment terminals reachable only to the payment processor; FlexConnect APs so local switching continues if the WAN is down; application-aware routing prefers MPLS for voice and any circuit for bulk.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Orchid Retail design">
<rect x="10" y="20" width="170" height="130" rx="10" fill="#bae6fd"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="13">Head office fabric</text>
<rect x="25" y="55" width="62" height="34" rx="6" fill="#ddd6fe"/><text x="56" y="77" text-anchor="middle" class="svg-ink" font-size="12">Border</text>
<rect x="103" y="55" width="62" height="34" rx="6" fill="#bbf7d0"/><text x="134" y="77" text-anchor="middle" class="svg-ink" font-size="12">Edge</text>
<rect x="25" y="100" width="140" height="34" rx="6" fill="#fed7aa"/><text x="95" y="122" text-anchor="middle" class="svg-ink" font-size="12">VNs and SGTs</text>
<rect x="250" y="40" width="130" height="90" rx="10" fill="#fde68a"/><text x="315" y="75" text-anchor="middle" class="svg-ink" font-size="13">Internet edge</text><text x="315" y="95" text-anchor="middle" class="svg-muted" font-size="12">firewalls, 2 ISPs</text>
<rect x="450" y="20" width="180" height="130" rx="10" fill="#bbf7d0"/><text x="540" y="42" text-anchor="middle" class="svg-ink" font-size="13">Store (SD-WAN)</text>
<rect x="465" y="55" width="70" height="34" rx="6" fill="#ddd6fe"/><text x="500" y="77" text-anchor="middle" class="svg-ink" font-size="12">WAN edge</text>
<rect x="545" y="55" width="70" height="34" rx="6" fill="#fed7aa"/><text x="580" y="77" text-anchor="middle" class="svg-ink" font-size="12">Payment VPN</text>
<rect x="465" y="100" width="150" height="34" rx="6" fill="#e2e8f0"/><text x="540" y="122" text-anchor="middle" class="svg-ink" font-size="12">FlexConnect APs</text>
<line x1="180" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="175" width="130" height="50" rx="10" fill="#e2e8f0"/><text x="315" y="205" text-anchor="middle" class="svg-ink" font-size="13">Cloud / SaaS</text>
<line x1="315" y1="130" x2="315" y2="175" stroke="#64748b" stroke-width="2"/><line x1="500" y1="89" x2="380" y2="200" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="470" y="180" class="svg-accent" font-size="12">DIA</text>
<rect x="10" y="245" width="14" height="14" fill="#ddd6fe"/><text x="30" y="257" class="svg-ink" font-size="12">fabric/WAN node</text>
<rect x="150" y="245" width="14" height="14" fill="#fed7aa"/><text x="170" y="257" class="svg-ink" font-size="12">segment</text>
<rect x="250" y="245" width="14" height="14" fill="#fde68a"/><text x="270" y="257" class="svg-ink" font-size="12">edge security</text>
</svg><p class="cap">Fabric at head office, SD-WAN with direct Internet access at stores, and one security edge for the data center.</p></div>

<pre class="out">Router# show sdwan app-route stats
tunnel stats 203.0.113.5 198.51.100.7 ipsec 12346 12346
  app-route statistics:
    mean-latency  <span class="hl">38 ms</span>   mean-loss  0.2 %   mean-jitter  4 ms</pre>

<div class="warn"><p><b>Common mistakes.</b> Using one VN for everything and relying on SGTs alone for PCI; running centrally switched wireless over a high-latency WAN; opening DIA without moving security to the edge; no break-glass path when the controller is unreachable.</p></div>
<div class="exam"><p><b>Exam trap.</b> VN is macro, SGT is micro. FlexConnect survives WAN loss; local mode needs the controller path. Centralised data policy steers by application, localised policy handles QoS.</p></div>

<div class="scn"><h4>Post-mortem: stores that stopped taking cards</h4><p>When a store's WAN edge lost both Internet circuits, tills fell back to MPLS but the payment VPN policy only listed the Internet colour, so card payments failed even though MPLS was healthy. The team added both colours to the payment policy and tested a double-circuit failure in the pilot store.</p><p><b>Lesson:</b> test every failure combination of transports against each policy.</p></div>

<div class="iv"><p class="q">"Compare backhauling Internet traffic versus direct Internet access for branches."</p><p>Backhaul gives a single security stack but adds latency and uses costly WAN bandwidth. DIA improves SaaS performance and saves cost but needs security at the branch or in the cloud. A hybrid approach is common: DIA for trusted SaaS, backhaul or cloud security for the rest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-Access: VNs for macro, SGTs for micro; redundant borders and control planes.</li>
<li>SD-WAN: control and data policy steer traffic, VPNs segment, built-in security.</li>
<li>Wireless mode follows the site: local mode in campus, FlexConnect at branches, fabric wireless in SD-Access.</li>
<li>Internet edge: dual ISP, firewalls, DMZ; choose breakout model by latency and security.</li>
<li>Test every combination of failures.</li>
</ul></div>
`,hi:`
<h3>Customer case: Orchid Retail</h3>
<div class="eg"><p><b>Company:</b> Orchid Retail, 220 stores wali fashion chain, 1,200 staff ka head office aur cloud-hosted e-commerce aur payment systems. <b>Drivers:</b> store traffic MPLS par head-office firewall tak backhaul hota hai, isliye cloud apps aur video training slow hain; card payment terminals PCI DSS ke liye isolated hone chahiye; stores mein handheld scanners ke liye Wi-Fi aur guest network hai. Head office apna campus network replace kar raha hai. <b>Constraints:</b> har store mein do sasti Internet circuits aur ek MPLS, 5 logon ki network team, aur 3 saal ka budget cycle. Exam se mapping: head office ke liye <b>SD-Access</b>, stores ke liye <b>SD-WAN</b>, beech mein <b>wireless integration</b> aur <b>Internet edge/cloud services</b>.</p></div>

<h3>SD-Access: macro aur micro segmentation</h3>
<p>SD-Access fabric mein <b>edge nodes</b> (endpoints connect karte hain), <b>border nodes</b> (bahar se connect), aur <b>control-plane nodes</b> (LISP map server jo jaanta hai ki har endpoint kahan hai) hote hain. Traffic Group Policy Option ke saath VXLAN mein jaata hai, jo VN aur SGT dono carry karta hai. Do policy layers:</p>
<ul>
<li><b>Macro-segmentation:</b> virtual networks (VNs, VRFs) bade groups alag karte hain, jaise Corporate, Guests aur IoT. Border firewall ke through routes leak na kare to VNs ke beech kuch cross nahi hota.</li>
<li><b>Micro-segmentation:</b> VN ke andar SGTs aur group-based policy, jo Catalyst Center (pehle DNA Center) aur ISE mein author hoti hai.</li>
</ul>
<p>Design rules: fabric edge users ke paas rakho (routed access), kam se kam do border nodes aur do control-plane nodes, border ko shared services (DHCP, DNS, ISE) ke liye fusion firewall ya router se jodo, aur ISE wahan rakho jahan saari fabric sites pahunch sakein. Fabric sites ke beech <b>SD-Access Transit</b> (ya IP transit) use karo, aur har site ka control plane local rakho taaki WAN failure use andha na kar de.</p>

<h3>SD-WAN: policy aur security</h3>
<p>Cisco SD-WAN control plane (SD-WAN Manager, Controller, Validator) ko WAN edge routers se alag karta hai jo kisi bhi transport par IPsec tunnels banate hain (TLOCs, jo system IP aur colour jaise mpls aur biz-internet se pehchaane jaate hain). Policies:</p>
<ul>
<li><b>Centralised control policy:</b> routing aur topology ko influence karti hai (VPN ke hisaab se hub-and-spoke ya full-mesh).</li>
<li><b>Centralised data policy aur application-aware routing:</b> application aur measured loss, latency, jitter se traffic steer karti hai (jaise voice MPLS prefer kare, MPLS 2 percent se zyada loss kare to Internet par aa jaye).</li>
<li><b>Localised policy:</b> device par QoS. SD-WAN edges mein 8 tak queues hoti hain, queue 0 low-latency queue hai.</li>
<li><b>Segmentation:</b> service-side VPNs alag routing instances hain (VPN 0 transport, VPN 512 management). PCI isolate karne ke liye card terminals ko apne VPN mein rakho.</li>
<li><b>Security:</b> on-box zone-based firewall, IPS, URL filtering, advanced malware protection, aur DNS aur web ke liye cloud security (Umbrella SIG).</li>
</ul>

<h3>Wireless integration: kahan kaunsa mode</h3>
<table class="cmp"><tr><th>Mode</th><th>Kaise</th><th>Fit</th></tr>
<tr><td><b>Centralised (local mode)</b></td><td>APs WLC tak CAPWAP tunnels banate hain; saara client data controller tak tunnel hota hai</td><td>Fast LAN wala campus; central policy; reliable low-latency path chahiye (guideline: round trip 100 ms se kam)</td></tr>
<tr><td><b>FlexConnect</b></td><td>Control central WLC par; client data branch mein locally switch; WAN loss survive karta hai</td><td>Stores aur chhoti branches</td></tr>
<tr><td><b>Fabric-enabled wireless</b></td><td>AP fabric edge join karta hai; AP se edge switch tak VXLAN; WLC sirf control plane ke liye</td><td>SD-Access campus jahan wired aur wireless ki same policy chahiye</td></tr>
<tr><td><b>Embedded wireless controller</b></td><td>Controller Catalyst 9000 switch par chalta hai</td><td>Bina dedicated WLC wali chhoti sites</td></tr></table>
<p>WLC redundancy ke liye design karo: SSO HA pair ya N+1, APs primary aur secondary controller preference ke saath. Wireless QoS WMM access categories (voice, video, best effort, background) use karta hai, jo AP par DSCP se map hoti hain, isliye trust aur marking end to end consistent honi chahiye.</p>

<h3>Internet edge aur cloud-hosted services</h3>
<p>Classic Internet edge mein dual ISPs (BGP, apne provider-independent prefix ya provider prefixes ke saath), edge routers, public servers ke liye DMZ wali firewalls ki pair, NAT, aur DDoS scrubbing options hote hain. Tay karo ki <b>Internet traffic kahan se niklega</b>:</p>
<table class="cmp"><tr><th>Model</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Head office par centralised breakout</td><td>Ek security stack, audit aasaan</td><td>Backhaul latency, mehengi MPLS bandwidth, single choke point</td></tr>
<tr><td>Regional breakout (data center ya colocation)</td><td>Chhote paths, shared security</td><td>Regional hubs chahiye</td></tr>
<tr><td>Har store par local security aur cloud security ke saath direct Internet access (DIA)</td><td>Cloud ke liye best performance, sasti bandwidth</td><td>Security edge par jaani chahiye; manage karne ki zyada jagah</td></tr></table>
<p>SaaS aur IaaS ke liye Cisco SD-WAN <b>Cloud OnRamp</b> application tak path quality measure karta hai aur best exit chunta hai. Cloud-hosted network services (cloud mein ISE ya DNS) ke liye latency, certificate trust aur local fallback dhyan mein rakho.</p>

<h3>Orchid ka chosen design</h3>
<p>Head office: Corporate, Guest aur IoT ke VNs, departments ke SGTs, fabric-enabled wireless wala SD-Access; do borders ek firewall pair tak jo Internet edge hai. Stores: MPLS aur do Internet circuits wala SD-WAN; SaaS ke liye on-box security aur cloud DNS aur web security ke saath DIA; payment terminals ke liye alag VPN jo sirf payment processor tak reachable; FlexConnect APs taaki WAN down ho to local switching chalti rahe; application-aware routing voice ke liye MPLS prefer kare aur bulk ke liye koi bhi circuit.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Orchid Retail design">
<rect x="10" y="20" width="170" height="130" rx="10" fill="#bae6fd"/><text x="95" y="42" text-anchor="middle" class="svg-ink" font-size="13">Head office fabric</text>
<rect x="25" y="55" width="62" height="34" rx="6" fill="#ddd6fe"/><text x="56" y="77" text-anchor="middle" class="svg-ink" font-size="12">Border</text>
<rect x="103" y="55" width="62" height="34" rx="6" fill="#bbf7d0"/><text x="134" y="77" text-anchor="middle" class="svg-ink" font-size="12">Edge</text>
<rect x="25" y="100" width="140" height="34" rx="6" fill="#fed7aa"/><text x="95" y="122" text-anchor="middle" class="svg-ink" font-size="12">VNs aur SGTs</text>
<rect x="250" y="40" width="130" height="90" rx="10" fill="#fde68a"/><text x="315" y="75" text-anchor="middle" class="svg-ink" font-size="13">Internet edge</text><text x="315" y="95" text-anchor="middle" class="svg-muted" font-size="12">firewalls, 2 ISPs</text>
<rect x="450" y="20" width="180" height="130" rx="10" fill="#bbf7d0"/><text x="540" y="42" text-anchor="middle" class="svg-ink" font-size="13">Store (SD-WAN)</text>
<rect x="465" y="55" width="70" height="34" rx="6" fill="#ddd6fe"/><text x="500" y="77" text-anchor="middle" class="svg-ink" font-size="12">WAN edge</text>
<rect x="545" y="55" width="70" height="34" rx="6" fill="#fed7aa"/><text x="580" y="77" text-anchor="middle" class="svg-ink" font-size="12">Payment VPN</text>
<rect x="465" y="100" width="150" height="34" rx="6" fill="#e2e8f0"/><text x="540" y="122" text-anchor="middle" class="svg-ink" font-size="12">FlexConnect APs</text>
<line x1="180" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="175" width="130" height="50" rx="10" fill="#e2e8f0"/><text x="315" y="205" text-anchor="middle" class="svg-ink" font-size="13">Cloud / SaaS</text>
<line x1="315" y1="130" x2="315" y2="175" stroke="#64748b" stroke-width="2"/><line x1="500" y1="89" x2="380" y2="200" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="470" y="180" class="svg-accent" font-size="12">DIA</text>
<rect x="10" y="245" width="14" height="14" fill="#ddd6fe"/><text x="30" y="257" class="svg-ink" font-size="12">fabric/WAN node</text>
<rect x="150" y="245" width="14" height="14" fill="#fed7aa"/><text x="170" y="257" class="svg-ink" font-size="12">segment</text>
<rect x="250" y="245" width="14" height="14" fill="#fde68a"/><text x="270" y="257" class="svg-ink" font-size="12">edge security</text>
</svg><p class="cap">Head office mein fabric, stores mein direct Internet access wala SD-WAN, aur data center ke liye ek security edge.</p></div>

<pre class="out">Router# show sdwan app-route stats
tunnel stats 203.0.113.5 198.51.100.7 ipsec 12346 12346
  app-route statistics:
    mean-latency  <span class="hl">38 ms</span>   mean-loss  0.2 %   mean-jitter  4 ms</pre>

<div class="warn"><p><b>Common galtiyan.</b> Sab kuch ke liye ek VN use karna aur PCI ke liye sirf SGTs par rely karna; high-latency WAN par centrally switched wireless chalana; security edge par le jaaye bina DIA kholna; controller unreachable ho to break-glass path na hona.</p></div>
<div class="exam"><p><b>Exam trap.</b> VN macro hai, SGT micro. FlexConnect WAN loss survive karta hai; local mode ko controller path chahiye. Centralised data policy application se steer karti hai, localised policy QoS handle karti hai.</p></div>

<div class="scn"><h4>Post-mortem: stores jinhone cards lena band kar diya</h4><p>Jab ek store ke WAN edge ne dono Internet circuits kho diye, tills MPLS par aa gaye lekin payment VPN policy mein sirf Internet colour list tha, isliye MPLS healthy hone par bhi card payments fail hue. Team ne payment policy mein dono colours jode aur pilot store mein double-circuit failure test kiya.</p><p><b>Seekh:</b> har policy ke against transports ke har failure combination ko test karo.</p></div>

<div class="iv"><p class="q">"Branches ke liye Internet traffic backhaul karna versus direct Internet access, compare karo."</p><p>Backhaul ek security stack deta hai lekin latency badhata hai aur mehengi WAN bandwidth use karta hai. DIA SaaS performance behtar karta hai aur cost bachata hai lekin branch par ya cloud mein security chahiye. Hybrid common hai: trusted SaaS ke liye DIA, baaki ke liye backhaul ya cloud security.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-Access: macro ke liye VNs, micro ke liye SGTs; redundant borders aur control planes.</li>
<li>SD-WAN: control aur data policy traffic steer karti hain, VPNs segment karte hain, built-in security.</li>
<li>Wireless mode site ke hisaab se: campus mein local mode, branches mein FlexConnect, SD-Access mein fabric wireless.</li>
<li>Internet edge: dual ISP, firewalls, DMZ; breakout model latency aur security se chuno.</li>
<li>Failures ke har combination ko test karo.</li>
</ul></div>
`}};export{e as default};