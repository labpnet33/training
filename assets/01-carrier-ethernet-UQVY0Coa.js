var e={id:`carrier-ethernet`,h:{en:`Layer 2 VPNs and Carrier Ethernet: what you will learn and the big picture`,hi:`Layer 2 VPNs aur Carrier Ethernet: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a service provider sells Ethernet as a service over an MPLS or IP core: point-to-point pseudowires (VPWS), multipoint VPLS, the modern EVPN services, 802.1ad provider bridging (Q-in-Q), and the OAM tools that keep Carrier Ethernet honest. This matches the Layer 2 VPN topics of the Cisco CCNP Service Provider core exam (SPCOR 350-501).</p>
<p><b>Prerequisites.</b> You should understand VLANs and trunking, MAC learning and basic MPLS and LDP (see spcor-mpls-ldp). Layer 3 VPN knowledge helps for contrast (see spcor-l3vpn).</p>
<p><b>Honest note about practice.</b> This module has no labs yet. The simulator does not implement IOS XE xconnect, VPLS or Q-in-Q. It does model EVPN on other platforms, so for hands-on EVPN control-plane practice use jncip-evpn and dc-evpn. Every configuration here is labelled <i>Reference configuration (not run in the simulator)</i>.</p>

<h3>Analogy: leasing a road versus renting a hall</h3>
<p>A company has offices in two cities. A <b>Layer 3 VPN</b> is like using the post office: the provider reads the address and delivers. A <b>Layer 2 VPN</b> is like leasing a private road between the offices: the provider does not read the customer's addresses, it only carries frames. A point-to-point line is a private road between two sites. A multipoint service is a big shared hall where all sites meet as if on one LAN. The customer keeps its own IP design and routing; the provider just offers a "wire" or a "switch".</p>

<h3>Key terms</h3>
<dl class="terms">
<dt>UNI (User Network Interface)</dt><dd>The demarcation port where the customer's Ethernet meets the provider.</dd>
<dt>EVC (Ethernet Virtual Connection)</dt><dd>The logical association of UNIs that defines who can talk to whom (MEF term).</dd>
<dt>AC (attachment circuit)</dt><dd>The provider-side port or VLAN that connects a customer to the VPN service.</dd>
<dt>PE and P</dt><dd>Provider edge (holds customer-facing ACs) and provider core router.</dd>
<dt>Pseudowire (PW)</dt><dd>An emulated point-to-point circuit carried across the packet network.</dd>
</dl>

<h3>MEF service types</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MEF service types">
<rect x="15" y="20" width="190" height="150" rx="10" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">E-Line</text><text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="12">point to point</text><text x="110" y="100" text-anchor="middle" class="svg-muted" font-size="12">VPWS / EPL / EVPL</text><text x="110" y="125" text-anchor="middle" class="svg-muted" font-size="12">like a leased line</text>
<rect x="225" y="20" width="190" height="150" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">E-LAN</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">multipoint to multipoint</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">VPLS / EVPN</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">like one big LAN</text>
<rect x="435" y="20" width="190" height="150" rx="10" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">E-Tree</text><text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">root and leaves</text><text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">leaves talk only to roots</text><text x="530" y="125" text-anchor="middle" class="svg-muted" font-size="12">hub-and-spoke L2</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Plus E-Access for wholesale between operators</text>
</svg><p class="cap">The MEF service families and the technology that usually implements them.</p></div>
<ul>
<li><b>E-Line</b>: point to point. <b>Private</b> (EPL) uses the whole port for one EVC. <b>Virtual private</b> (EVPL) multiplexes several EVCs by VLAN on one port.</li>
<li><b>E-LAN</b>: multipoint. <b>EP-LAN</b> uses the whole port; <b>EVP-LAN</b> multiplexes by VLAN.</li>
<li><b>E-Tree</b>: rooted multipoint. Leaves reach roots, not each other.</li>
</ul>

<h3>Bandwidth profiles and the service contract</h3>
<p>A Carrier Ethernet service is sold with a <b>bandwidth profile</b>: a committed information rate (<b>CIR</b>) guaranteed, and often an excess information rate (<b>EIR</b>) delivered when capacity exists. Frames are classified, policed at the UNI and coloured green or yellow. The service also states a maximum frame size, the supported VLANs, and whether Layer 2 control protocols are tunnelled or discarded.</p>

<h3>Where the technologies fit</h3>
<table class="cmp"><tr><th>Technology</th><th>Service</th><th>Core transport</th></tr>
<tr><td>VPWS (pseudowire)</td><td>E-Line</td><td>MPLS (LDP or BGP signalled)</td></tr>
<tr><td>VPLS</td><td>E-LAN</td><td>MPLS pseudowire mesh</td></tr>
<tr><td>EVPN</td><td>E-Line, E-LAN, E-Tree</td><td>BGP control plane over MPLS or other</td></tr>
<tr><td>802.1ad (Q-in-Q)</td><td>Metro access and EVCs</td><td>Ethernet switching</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A bank has branches in Pune and Mumbai and wants them in one subnet 10.50.0.0/16 with its own routers and VLAN numbers. The provider sells an EVPL E-Line with CIR 100 Mbps, EIR 100 Mbps. At each PE the customer VLAN 50 is the attachment circuit. The provider never sees the bank's IP addressing. The two sites behave as if connected by a cable.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking a Layer 2 VPN removes all routing from the provider. The core still runs IGP, MPLS and BGP; the customer sees only Ethernet.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the service to the technology: E-Line is VPWS, E-LAN is VPLS or EVPN, and Q-in-Q is a provider-bridging method rather than an MPLS pseudowire.</p></div>

<div class="scn"><h4>The customer wants the same subnet in two cities</h4><p>A hospital group wanted a clustered application that needed one broadcast domain between two data centres. A Layer 3 VPN could not provide that. The provider sold an EP-LAN over VPLS. The cluster worked, but a customer loop later flooded the service and the provider added MAC limits and storm control at the UNI.</p><p><b>Lesson:</b> E-LAN extends the customer's failure domain, so the provider must protect itself at the edge.</p></div>

<div class="iv"><p class="q">"What is the difference between a Layer 2 VPN and a Layer 3 VPN?"</p><p>In a Layer 3 VPN the provider routes customer IP prefixes (VRFs, MP-BGP). In a Layer 2 VPN the provider transports Ethernet frames and does not participate in customer routing. Give E-Line, E-LAN and E-Tree examples and the technology for each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L2VPN transports customer frames; L3VPN routes customer prefixes.</li>
<li>MEF services: E-Line, E-LAN, E-Tree (plus E-Access).</li>
<li>UNI, EVC and attachment circuit are core vocabulary.</li>
<li>VPWS, VPLS, EVPN and Q-in-Q implement the services.</li>
<li>No labs here; use jncip-evpn and dc-evpn for EVPN practice.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki service provider MPLS ya IP core par Ethernet ko service ke roop mein kaise bechta hai: point-to-point pseudowires (VPWS), multipoint VPLS, modern EVPN services, 802.1ad provider bridging (Q-in-Q), aur woh OAM tools jo Carrier Ethernet ko imandaar rakhte hain. Yeh Cisco CCNP Service Provider core exam (SPCOR 350-501) ke Layer 2 VPN topics se match karta hai.</p>
<p><b>Prerequisites.</b> Aapko VLANs aur trunking, MAC learning aur basic MPLS tatha LDP samajhna chahiye (spcor-mpls-ldp dekho). Contrast ke liye Layer 3 VPN ka knowledge madad karta hai (spcor-l3vpn dekho).</p>
<p><b>Practice ke baare mein honest note.</b> Is module mein abhi labs nahi hain. Simulator IOS XE xconnect, VPLS ya Q-in-Q implement nahi karta. Yeh doosre platforms par EVPN model karta hai, isliye hands-on EVPN control-plane practice ke liye jncip-evpn aur dc-evpn use karo. Yahan har configuration par <i>Reference configuration (not run in the simulator)</i> likha hai.</p>

<h3>Analogy: sadak lease par lena versus hall kiraye par lena</h3>
<p>Company ke do shehron mein offices hain. <b>Layer 3 VPN</b> post office jaisa hai: provider address padhta hai aur deliver karta hai. <b>Layer 2 VPN</b> offices ke beech private sadak lease par lene jaisa hai: provider customer ke addresses nahi padhta, sirf frames carry karta hai. Point-to-point line do sites ke beech private sadak hai. Multipoint service bada shared hall hai jahan saari sites ek LAN ki tarah milti hain. Customer apna IP design aur routing rakhta hai; provider sirf "wire" ya "switch" deta hai.</p>

<h3>Key terms</h3>
<dl class="terms">
<dt>UNI (User Network Interface)</dt><dd>Demarcation port jahan customer ka Ethernet provider se milta hai.</dd>
<dt>EVC (Ethernet Virtual Connection)</dt><dd>UNIs ka logical association jo tay karta hai kaun kisse baat kar sakta hai (MEF term).</dd>
<dt>AC (attachment circuit)</dt><dd>Provider-side port ya VLAN jo customer ko VPN service se jodta hai.</dd>
<dt>PE aur P</dt><dd>Provider edge (customer-facing ACs rakhta hai) aur provider core router.</dd>
<dt>Pseudowire (PW)</dt><dd>Packet network ke across carry hone wala emulated point-to-point circuit.</dd>
</dl>

<h3>MEF service types</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MEF service types">
<rect x="15" y="20" width="190" height="150" rx="10" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">E-Line</text><text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="12">point to point</text><text x="110" y="100" text-anchor="middle" class="svg-muted" font-size="12">VPWS / EPL / EVPL</text><text x="110" y="125" text-anchor="middle" class="svg-muted" font-size="12">leased line jaisa</text>
<rect x="225" y="20" width="190" height="150" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">E-LAN</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">multipoint to multipoint</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">VPLS / EVPN</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">ek bade LAN jaisa</text>
<rect x="435" y="20" width="190" height="150" rx="10" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="14">E-Tree</text><text x="530" y="75" text-anchor="middle" class="svg-muted" font-size="12">root aur leaves</text><text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">leaves sirf roots se baat karte hain</text><text x="530" y="125" text-anchor="middle" class="svg-muted" font-size="12">hub-and-spoke L2</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Plus operators ke beech wholesale ke liye E-Access</text>
</svg><p class="cap">MEF service families aur unhe aam taur par implement karne wali technology.</p></div>
<ul>
<li><b>E-Line</b>: point to point. <b>Private</b> (EPL) poora port ek EVC ke liye use karta hai. <b>Virtual private</b> (EVPL) ek port par VLAN se kai EVCs multiplex karta hai.</li>
<li><b>E-LAN</b>: multipoint. <b>EP-LAN</b> poora port use karta hai; <b>EVP-LAN</b> VLAN se multiplex karta hai.</li>
<li><b>E-Tree</b>: rooted multipoint. Leaves roots tak pahunchte hain, ek-doosre tak nahi.</li>
</ul>

<h3>Bandwidth profiles aur service contract</h3>
<p>Carrier Ethernet service <b>bandwidth profile</b> ke saath bikti hai: guaranteed committed information rate (<b>CIR</b>), aur aksar excess information rate (<b>EIR</b>) jo capacity hone par deliver hota hai. Frames classify hote hain, UNI par police hote hain aur green ya yellow colour paate hain. Service maximum frame size, supported VLANs, aur yeh bhi batati hai ki Layer 2 control protocols tunnel hote hain ya discard.</p>

<h3>Technologies kahan fit hoti hain</h3>
<table class="cmp"><tr><th>Technology</th><th>Service</th><th>Core transport</th></tr>
<tr><td>VPWS (pseudowire)</td><td>E-Line</td><td>MPLS (LDP ya BGP signalled)</td></tr>
<tr><td>VPLS</td><td>E-LAN</td><td>MPLS pseudowire mesh</td></tr>
<tr><td>EVPN</td><td>E-Line, E-LAN, E-Tree</td><td>MPLS ya doosre transport par BGP control plane</td></tr>
<tr><td>802.1ad (Q-in-Q)</td><td>Metro access aur EVCs</td><td>Ethernet switching</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Bank ki Pune aur Mumbai mein branches hain aur woh unhe ek subnet 10.50.0.0/16 mein chahta hai, apne routers aur VLAN numbers ke saath. Provider CIR 100 Mbps, EIR 100 Mbps wali EVPL E-Line bechta hai. Har PE par customer VLAN 50 attachment circuit hai. Provider kabhi bank ki IP addressing nahi dekhta. Dono sites aise behave karti hain jaise cable se judi hon.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki Layer 2 VPN provider se saari routing hata deta hai. Core abhi bhi IGP, MPLS aur BGP chalata hai; customer ko sirf Ethernet dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Service ko technology se match karo: E-Line VPWS hai, E-LAN VPLS ya EVPN hai, aur Q-in-Q provider-bridging method hai, MPLS pseudowire nahi.</p></div>

<div class="scn"><h4>Customer do shehron mein same subnet chahta hai</h4><p>Hospital group ko do data centres ke beech ek broadcast domain chahiye tha clustered application ke liye. Layer 3 VPN yeh nahi de sakta tha. Provider ne VPLS par EP-LAN becha. Cluster chala, lekin baad mein customer loop ne service ko flood kar diya aur provider ne UNI par MAC limits aur storm control jode.</p><p><b>Lesson:</b> E-LAN customer ke failure domain ko failaata hai, isliye provider ko edge par khud ko protect karna padta hai.</p></div>

<div class="iv"><p class="q">"Layer 2 VPN aur Layer 3 VPN mein kya difference hai?"</p><p>Layer 3 VPN mein provider customer IP prefixes route karta hai (VRFs, MP-BGP). Layer 2 VPN mein provider Ethernet frames transport karta hai aur customer routing mein hissa nahi leta. E-Line, E-LAN aur E-Tree ke examples aur har ek ki technology batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L2VPN customer frames transport karta hai; L3VPN customer prefixes route karta hai.</li>
<li>MEF services: E-Line, E-LAN, E-Tree (plus E-Access).</li>
<li>UNI, EVC aur attachment circuit core vocabulary hain.</li>
<li>VPWS, VPLS, EVPN aur Q-in-Q services implement karte hain.</li>
<li>Yahan labs nahi; EVPN practice ke liye jncip-evpn aur dc-evpn use karo.</li>
</ul></div>
`}};export{e as default};