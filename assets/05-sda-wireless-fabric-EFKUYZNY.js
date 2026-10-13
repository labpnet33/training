var e={id:`sda-wireless`,h:{en:`SD-Access wireless fabric: VXLAN, LISP and SGT (concept)`,hi:`SD-Access wireless fabric: VXLAN, LISP aur SGT (concept)`},body:{en:`
<p>Picture a big office campus where every visitor wears a coloured badge, and the badge, not the door they walked through, decides which rooms they may enter. Visitors can walk from building to building and keep the same badge. <b>Cisco SD-Access</b> is the network version of that idea: users and devices get a group tag, the rules follow the tag, and the physical network underneath is just a fast, simple road. This chapter is <b>concept only</b>: the lab has no fabric, no VXLAN and no LISP, and you must not claim to have configured one. You must still be able to explain it, because it is the standard answer to "how does wireless fit in SD-Access".</p>

<h3>The two layers</h3>
<ul>
<li><b>Underlay</b>: ordinary routed links between switches (typically IS-IS, built by Catalyst Center) that only need to move IP packets between fabric nodes.</li>
<li><b>Overlay</b>: the virtual network that users see. <b>VXLAN</b> carries user traffic across the underlay, and <b>LISP</b> is the control plane that records where every endpoint currently is.</li>
</ul>

<h3>The fabric roles</h3>
<dl class="terms">
<dt>Fabric edge node</dt><dd>The access switch where endpoints and fabric APs connect. It encapsulates traffic into VXLAN and hosts the <b>anycast gateway</b>, the same default-gateway IP on every edge, so a client keeps its address anywhere.</dd>
<dt>Control plane node</dt><dd>The LISP map-server and map-resolver: a database of "this MAC or IP lives behind that edge node".</dd>
<dt>Border node</dt><dd>The exit of the fabric toward the rest of the network, the data centre or the internet.</dd>
<dt>Fabric-enabled WLC</dt><dd>A 9800 that joins the fabric. It still runs CAPWAP control with the APs, but it does <b>not</b> carry client data. It registers each wireless client in the LISP control plane.</dd>
<dt>Fabric AP</dt><dd>An AP that connects to a fabric edge. It sends client data straight into VXLAN toward the edge, so data never goes through the WLC.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SD-Access wireless fabric">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Control plane node (LISP)</text>
<rect x="470" y="10" width="150" height="40" rx="8" fill="#fed7aa"/><text x="545" y="35" text-anchor="middle" class="svg-ink" font-size="13">Border node</text>
<rect x="20" y="10" width="170" height="40" rx="8" fill="#fde68a"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="13">Fabric WLC (9800)</text>
<rect x="60" y="120" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="145" text-anchor="middle" class="svg-ink" font-size="13">Edge node 1</text>
<rect x="400" y="120" width="140" height="40" rx="8" fill="#bae6fd"/><text x="470" y="145" text-anchor="middle" class="svg-ink" font-size="13">Edge node 2</text>
<rect x="60" y="210" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="130" y="235" text-anchor="middle" class="svg-ink" font-size="13">Fabric AP</text>
<rect x="400" y="210" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="470" y="235" text-anchor="middle" class="svg-ink" font-size="13">Fabric AP</text>
<line x1="200" y1="140" x2="400" y2="140" stroke="#64748b" stroke-width="3"/><text x="300" y="132" text-anchor="middle" class="svg-accent" font-size="12">VXLAN overlay</text>
<line x1="130" y1="160" x2="130" y2="210" stroke="#64748b" stroke-width="2"/><line x1="470" y1="160" x2="470" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="50" x2="130" y2="120" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="40" y="100" class="svg-muted" font-size="12">CAPWAP control</text>
<line x1="320" y1="50" x2="150" y2="120" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="450" y2="120" stroke="#64748b" stroke-width="1.5"/>
<line x1="545" y1="50" x2="500" y2="120" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="262" text-anchor="middle" class="svg-muted" font-size="12">client data: AP to edge in VXLAN, never through the WLC</text>
</svg><p class="cap">Fabric APs hand client data to the edge node; the WLC keeps control and registers clients in LISP.</p></div>

<h3>Virtual networks and SGT: macro and micro segments</h3>
<p>A <b>virtual network (VN)</b> is a VRF-like routing domain: guests and staff can live in different VNs with no route between them (macro-segmentation). Inside a VN, a <b>Scalable Group Tag (SGT)</b> labels the endpoint group (for example Employees, Contractors, Printers) and policy such as "Contractors may not reach Printers" is a group-to-group rule (micro-segmentation). The VXLAN header in the fabric carries the VN identifier and the SGT, so policy is enforced on the group, not on the IP address. In wireless, an SSID is mapped to an IP pool in a VN; the SGT usually comes from the authentication result (for example from the identity server) and is enforced where the traffic leaves the fabric or at the egress edge.</p>

<h3>Why fabric wireless is different from classic central switching</h3>
<ul>
<li><b>No tunnel to a central controller for data.</b> Classic CAPWAP central switching hairpins all client data through the WLC; fabric wireless does not.</li>
<li><b>Roaming is simple.</b> Because every edge has the same anycast gateway, a Layer 2 roam keeps the same IP; the controller updates the LISP entry to point at the new edge.</li>
<li><b>Same policy wired and wireless.</b> An employee gets the same VN and SGT on Wi-Fi and on a cable.</li>
</ul>
<p>Two alternatives exist. <b>Over-the-top (OTT)</b> wireless keeps ordinary CAPWAP on top of a fabric wired network, so the wireless side does not use fabric benefits. And the fabric-in-a-box or Embedded Wireless on a Catalyst switch puts the roles in a small site into one device; see chapter 7 for embedded controllers.</p>

<div class="eg"><p><b>Worked example.</b> A student with a phone on SSID CAMPUS-STUDENT joins at edge node 1 in building A. The WLC authenticates, assigns VN STUDENT and SGT 20, and registers the phone MAC and IP at the control plane. She walks to building B, associates through a fabric AP on edge node 2, and the WLC updates the LISP entry. The phone keeps IP 10.30.0.57 because both edges answer for the same gateway address. The Wi-Fi download continues without a new DHCP lease.</p></div>

<div class="warn"><p><b>Common mistake.</b> Saying "the WLC forwards the traffic" in a fabric. In SD-Access wireless the WLC is control plane only for clients; the fabric AP and edge node forward data.</p></div>

<div class="exam"><p><b>Exam trap.</b> LISP is the <i>control plane</i> (where is the endpoint), VXLAN is the <i>data plane</i> (how packets travel), SGT is the <i>policy label</i>. Do not swap them. The VN does macro-segmentation; the SGT does micro-segmentation.</p></div>

<div class="scn"><h4>Guests could see staff printers</h4><p>A hospital moved wireless to a fabric and kept staff and guests in one VN to save effort. Guests found printers on the staff VLAN. The design was changed: guests got their own VN with a route only to the internet through the border, and a group rule blocked guest SGTs from printer SGTs inside the staff VN. The ticket never repeated.</p><p><b>Lesson:</b> use VNs for hard separation and SGTs for finer group policy.</p></div>

<div class="iv"><p class="q">"How does a wireless client's traffic flow in SD-Access?"</p><p>The client associates with a fabric AP; CAPWAP control stays with the WLC, which registers the client in LISP. The AP encapsulates client data in VXLAN to the fabric edge, which applies the VN and SGT policy and uses the anycast gateway. State clearly that you know this as architecture and have not built it in a lab.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay moves IP; overlay uses VXLAN data plane and LISP control plane.</li>
<li>Fabric WLC is control only; fabric APs send data to the edge node.</li>
<li>VN gives macro-segmentation, SGT gives micro-segmentation.</li>
<li>Anycast gateway makes roaming simple.</li>
<li>Concept only: there is no fabric in the lab.</li>
</ul></div>
`,hi:`
<p>Ek bade office campus ki kalpana karo jahan har visitor ke paas rangeen badge hai, aur kaun se rooms mein ja sakta hai yeh badge decide karta hai, darwaza nahi jisse woh aaya. Visitor building se building ghoom sakta hai aur badge wahi rehta hai. <b>Cisco SD-Access</b> isi idea ka network version hai: users aur devices ko group tag milta hai, rules tag ke saath chalte hain, aur neeche ka physical network bas ek tez, simple sadak hai. Yeh chapter <b>sirf concept</b> hai: lab mein koi fabric, VXLAN ya LISP nahi hai, aur aapko kabhi nahi kehna chahiye ki aapne fabric configure kiya. Phir bhi aapko ise samjhana aana chahiye, kyunki "wireless SD-Access mein kaise fit hota hai" ka standard jawab yahi hai.</p>

<h3>Do layers</h3>
<ul>
<li><b>Underlay</b>: switches ke beech ordinary routed links (aam taur par IS-IS, jise Catalyst Center banata hai) jo sirf fabric nodes ke beech IP packets le jaate hain.</li>
<li><b>Overlay</b>: virtual network jo users ko dikhta hai. <b>VXLAN</b> user traffic ko underlay ke upar le jaata hai, aur <b>LISP</b> control plane hai jo record karta hai ki har endpoint abhi kahan hai.</li>
</ul>

<h3>Fabric roles</h3>
<dl class="terms">
<dt>Fabric edge node</dt><dd>Access switch jahan endpoints aur fabric APs judte hain. Woh traffic ko VXLAN mein encapsulate karta hai aur <b>anycast gateway</b> host karta hai, yani har edge par wahi default-gateway IP, taaki client ka address kahin bhi wahi rahe.</dd>
<dt>Control plane node</dt><dd>LISP map-server aur map-resolver: "yeh MAC ya IP us edge node ke peeche hai" ka database.</dd>
<dt>Border node</dt><dd>Fabric ka exit baaki network, data centre ya internet ki taraf.</dd>
<dt>Fabric-enabled WLC</dt><dd>Ek 9800 jo fabric join karta hai. Woh APs ke saath CAPWAP control chalata hai, lekin client data <b>nahi</b> le jaata. Woh har wireless client ko LISP control plane mein register karta hai.</dd>
<dt>Fabric AP</dt><dd>AP jo fabric edge se judta hai. Woh client data seedha VXLAN mein edge ki taraf bhejta hai, isliye data WLC se nahi guzarta.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="SD-Access wireless fabric">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Control plane node (LISP)</text>
<rect x="470" y="10" width="150" height="40" rx="8" fill="#fed7aa"/><text x="545" y="35" text-anchor="middle" class="svg-ink" font-size="13">Border node</text>
<rect x="20" y="10" width="170" height="40" rx="8" fill="#fde68a"/><text x="105" y="35" text-anchor="middle" class="svg-ink" font-size="13">Fabric WLC (9800)</text>
<rect x="60" y="120" width="140" height="40" rx="8" fill="#bae6fd"/><text x="130" y="145" text-anchor="middle" class="svg-ink" font-size="13">Edge node 1</text>
<rect x="400" y="120" width="140" height="40" rx="8" fill="#bae6fd"/><text x="470" y="145" text-anchor="middle" class="svg-ink" font-size="13">Edge node 2</text>
<rect x="60" y="210" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="130" y="235" text-anchor="middle" class="svg-ink" font-size="13">Fabric AP</text>
<rect x="400" y="210" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="470" y="235" text-anchor="middle" class="svg-ink" font-size="13">Fabric AP</text>
<line x1="200" y1="140" x2="400" y2="140" stroke="#64748b" stroke-width="3"/><text x="300" y="132" text-anchor="middle" class="svg-accent" font-size="12">VXLAN overlay</text>
<line x1="130" y1="160" x2="130" y2="210" stroke="#64748b" stroke-width="2"/><line x1="470" y1="160" x2="470" y2="210" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="50" x2="130" y2="120" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="40" y="100" class="svg-muted" font-size="12">CAPWAP control</text>
<line x1="320" y1="50" x2="150" y2="120" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="450" y2="120" stroke="#64748b" stroke-width="1.5"/>
<line x1="545" y1="50" x2="500" y2="120" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="262" text-anchor="middle" class="svg-muted" font-size="12">client data: AP se edge tak VXLAN mein, WLC se kabhi nahi</text>
</svg><p class="cap">Fabric APs client data edge node ko dete hain; WLC control rakhta hai aur clients ko LISP mein register karta hai.</p></div>

<h3>Virtual networks aur SGT: macro aur micro segments</h3>
<p><b>Virtual network (VN)</b> VRF jaisa routing domain hai: guests aur staff alag VNs mein reh sakte hain jinke beech koi route nahi (macro-segmentation). VN ke andar <b>Scalable Group Tag (SGT)</b> endpoint group ko label karta hai (jaise Employees, Contractors, Printers) aur "Contractors Printers tak nahi pahunch sakte" jaisi policy group-to-group rule hai (micro-segmentation). Fabric ka VXLAN header VN identifier aur SGT dono carry karta hai, isliye policy IP address par nahi, group par enforce hoti hai. Wireless mein SSID ko VN ke ek IP pool se map kiya jaata hai; SGT aam taur par authentication result se aata hai (jaise identity server se) aur jahan traffic fabric se nikalta hai ya egress edge par enforce hota hai.</p>

<h3>Fabric wireless classic central switching se alag kyun hai</h3>
<ul>
<li><b>Data ke liye central controller tak tunnel nahi.</b> Classic CAPWAP central switching sara client data WLC se ghumata hai; fabric wireless aisa nahi karta.</li>
<li><b>Roaming simple hai.</b> Har edge par same anycast gateway hai, isliye Layer 2 roam mein same IP rehta hai; controller LISP entry ko naye edge par point karta hai.</li>
<li><b>Wired aur wireless par same policy.</b> Employee ko Wi-Fi aur cable dono par same VN aur SGT milta hai.</li>
</ul>
<p>Do alternatives hain. <b>Over-the-top (OTT)</b> wireless fabric wired network ke upar ordinary CAPWAP rakhta hai, isliye wireless side fabric ke fayde nahi leta. Aur fabric-in-a-box ya Catalyst switch par Embedded Wireless chhoti site ke roles ek device mein rakhta hai; embedded controllers ke liye chapter 7 dekho.</p>

<div class="eg"><p><b>Worked example.</b> Ek student SSID CAMPUS-STUDENT par building A ke edge node 1 par judti hai. WLC authenticate karta hai, VN STUDENT aur SGT 20 assign karta hai, aur phone ka MAC aur IP control plane mein register karta hai. Woh building B jaati hai, edge node 2 ke fabric AP se associate hoti hai, aur WLC LISP entry update karta hai. Phone IP 10.30.0.57 rakhta hai kyunki dono edges same gateway address ka jawab dete hain. Wi-Fi download naye DHCP lease ke bina chalta rehta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fabric mein "WLC traffic forward karta hai" kehna. SD-Access wireless mein clients ke liye WLC sirf control plane hai; fabric AP aur edge node data forward karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> LISP <i>control plane</i> hai (endpoint kahan hai), VXLAN <i>data plane</i> hai (packets kaise jaate hain), SGT <i>policy label</i> hai. Inhe swap mat karo. VN macro-segmentation karta hai; SGT micro-segmentation.</p></div>

<div class="scn"><h4>Guests ko staff printers dikhe</h4><p>Ek hospital ne wireless fabric par move kiya aur mehnat bachane ke liye staff aur guests ko ek VN mein rakha. Guests ko staff VLAN ke printers mil gaye. Design badla gaya: guests ko apna VN mila jisme sirf border se internet ka route tha, aur staff VN ke andar group rule ne guest SGTs ko printer SGTs se block kiya. Ticket dobara nahi aaya.</p><p><b>Lesson:</b> hard separation ke liye VNs aur finer group policy ke liye SGTs use karo.</p></div>

<div class="iv"><p class="q">"SD-Access mein wireless client ka traffic kaise flow karta hai?"</p><p>Client fabric AP se associate hota hai; CAPWAP control WLC ke paas rehta hai, jo client ko LISP mein register karta hai. AP client data ko VXLAN mein fabric edge tak encapsulate karta hai, jo VN aur SGT policy lagata hai aur anycast gateway use karta hai. Saaf bolo ki aap ise architecture ke taur par jaante ho aur lab mein banaya nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay IP le jaata hai; overlay mein VXLAN data plane aur LISP control plane hai.</li>
<li>Fabric WLC sirf control hai; fabric APs data edge node ko bhejte hain.</li>
<li>VN macro-segmentation deta hai, SGT micro-segmentation.</li>
<li>Anycast gateway roaming ko simple banata hai.</li>
<li>Sirf concept: lab mein fabric nahi hai.</li>
</ul></div>
`}};export{e as default};