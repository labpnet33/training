var e={id:`overview`,h:{en:`Deployment modes: what you will learn and the big picture`,hi:`Deployment modes: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> A Palo Alto Networks firewall can sit in a network in several ways. You will learn the main ones: Layer 3 with VLAN-tagged <b>subinterfaces</b>, <b>virtual wire</b> (bump in the wire), <b>Layer 2</b> with VLAN objects and VLAN interfaces, and <b>tap</b>. For each you will learn what it is, when to choose it, how it is configured, what it can and cannot do, and how to troubleshoot it. You will configure and verify Layer 3 subinterfaces end to end, because that is the part the simulator can run.</p>
<p><b>Prerequisites.</b> CCNA VLANs and trunking (see ccna-vlans), the pan-start vocabulary, and the pan-setup skills: Layer 3 interface, virtual router, zone, management profile, commit. This module extends those foundations.</p>

<h3>Analogy: how a security guard stands in a corridor</h3>
<p>A guard can be placed in four ways. As a <b>receptionist with several doors</b> (Layer 3): everyone goes through the reception desk, which knows each floor's door (subinterfaces are extra doors on one corridor). As a <b>guard who stands in the corridor and checks without changing it</b> (virtual wire): the corridor layout does not change, people just pass the guard. As a <b>corridor junction with a guard who also directs people to the right room</b> (Layer 2): the firewall switches and filters. And as a <b>camera</b> (tap): it watches but cannot stop anyone.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Four deployment modes">
<rect x="10" y="10" width="300" height="90" rx="10" fill="#bbf7d0"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="14">Layer 3 (routed)</text><text x="160" y="57" text-anchor="middle" class="svg-muted" font-size="12">IP on interface or subinterface</text><text x="160" y="77" text-anchor="middle" class="svg-muted" font-size="12">routing, NAT, zones per VLAN</text>
<rect x="330" y="10" width="300" height="90" rx="10" fill="#bae6fd"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="14">Virtual wire</text><text x="480" y="57" text-anchor="middle" class="svg-muted" font-size="12">two ports joined, no IP, no routing</text><text x="480" y="77" text-anchor="middle" class="svg-muted" font-size="12">transparent to neighbours</text>
<rect x="10" y="110" width="300" height="90" rx="10" fill="#ddd6fe"/><text x="160" y="135" text-anchor="middle" class="svg-ink" font-size="14">Layer 2 (switching)</text><text x="160" y="157" text-anchor="middle" class="svg-muted" font-size="12">VLAN object, switches frames</text><text x="160" y="177" text-anchor="middle" class="svg-muted" font-size="12">optional VLAN interface with IP</text>
<rect x="330" y="110" width="300" height="90" rx="10" fill="#fde68a"/><text x="480" y="135" text-anchor="middle" class="svg-ink" font-size="14">Tap</text><text x="480" y="157" text-anchor="middle" class="svg-muted" font-size="12">mirrored copy only</text><text x="480" y="177" text-anchor="middle" class="svg-muted" font-size="12">visibility, no blocking</text>
</svg><p class="cap">The deployment mode is chosen per interface, so one firewall can mix modes.</p></div>

<h3>What the simulator can and cannot run</h3>
<p>This module has <b>no labs of its own</b>. The NK-OS simulator supports Layer 3 interfaces and Layer 3 subinterfaces with an 802.1Q tag. It does not implement virtual wire, Layer 2 VLAN objects or tap. So:</p>
<ul>
<li>The subinterface chapters (2 to 5) show outputs <b>captured from the simulator</b> on a PA-VM trunked to a switch.</li>
<li>The virtual wire, Layer 2 and tap chapters (6 to 8) teach with configuration clearly labelled <b>Reference configuration (not run in the simulator)</b>. It follows PAN-OS syntax but you should verify exact syntax on the product or in the vendor documentation before using it on a real firewall.</li>
<li>To practise, use the pan-setup labs (the firewall there accepts the same subinterface commands), the ccna-vlans module for the switching side, and later pan-policy and nse4-zones for zone and policy work.</li>
</ul>

<h3>Chapter map</h3>
<ol>
<li>This overview.</li>
<li>Why subinterfaces: trunks, tags and router-on-a-stick.</li>
<li>Configuring Layer 3 subinterfaces.</li>
<li>The switch side and end-to-end testing.</li>
<li>Troubleshooting subinterfaces.</li>
<li>Virtual wire deployments.</li>
<li>Layer 2 interfaces and VLAN interfaces.</li>
<li>Tap, aggregate ethernet and choosing the mode.</li>
<li>Summary and exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A branch has one uplink from the access switch to the firewall carrying VLAN 10 (users) and VLAN 20 (servers). The simplest design is Layer 3 with two subinterfaces on that one physical port, each with its own IP, zone and rule set. A different site asks "put the firewall in without changing any IP addressing today". That is a virtual wire. A third site wants the firewall to replace a switch: Layer 2. Same product, three answers.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Choosing a mode by habit. The mode is a design decision with consequences for routing, NAT, VPN and high availability. Decide first what the firewall must do, then pick the mode.</p></div>
<div class="exam"><p><b>Exam trap.</b> The mode is selected per <b>interface</b>, not per firewall. Zone type must match the interface type. Tap, virtual wire, Layer 2 and Layer 3 zones are different zone types.</p></div>

<div class="scn"><h4>The "just drop it in" request</h4><p>A hospital wanted a firewall in front of a clinical network without renumbering a single device or changing the router's configuration. The team deployed it as a virtual wire between the router and the core switch. Policy and threat prevention started working that weekend, and the Layer 3 redesign was scheduled for a later maintenance window.</p><p><b>Lesson:</b> virtual wire is a migration tool as much as a deployment mode.</p></div>

<div class="iv"><p class="q">"What deployment modes does a PAN-OS firewall support?"</p><p>Layer 3 (routed, with subinterfaces for VLANs), Layer 2 (switching with VLAN objects and optional VLAN interfaces), virtual wire (two interfaces bound together with no addressing), tap (passive mirrored traffic), and aggregate ethernet for link bundling. Add that modes are set per interface and that you pick based on whether the firewall must route, switch, stay transparent, or only observe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modes: Layer 3, virtual wire, Layer 2, tap (plus aggregate ethernet for bundles).</li>
<li>The mode is chosen per interface; zone type must match.</li>
<li>The simulator runs Layer 3 subinterfaces only; other modes are taught with labelled reference configuration.</li>
<li>No labs here; practise in pan-setup and ccna-vlans, then pan-policy.</li>
<li>Pick the mode from requirements, not habit.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Palo Alto Networks firewall network mein kai tareeke se baith sakta hai. Aap mukhya tareeke seekhoge: VLAN-tagged <b>subinterfaces</b> ke saath Layer 3, <b>virtual wire</b> (bump in the wire), VLAN objects aur VLAN interfaces ke saath <b>Layer 2</b>, aur <b>tap</b>. Har ek ke liye aap seekhoge ki woh kya hai, kab chunna hai, kaise configure hota hai, kya kar sakta hai aur kya nahi, aur troubleshoot kaise karte hain. Aap Layer 3 subinterfaces ko end to end configure aur verify karoge, kyunki simulator wahi hissa chala sakta hai.</p>
<p><b>Prerequisites.</b> CCNA VLANs aur trunking (ccna-vlans dekho), pan-start ki vocabulary, aur pan-setup ki skills: Layer 3 interface, virtual router, zone, management profile, commit. Yeh module unhi foundations ko aage badhata hai.</p>

<h3>Analogy: guard corridor mein kaise khada hota hai</h3>
<p>Guard ko chaar tareeke se rakha ja sakta hai. <b>Kai darwaazon wale receptionist</b> ke roop mein (Layer 3): sab reception desk se guzarte hain, jo har floor ka darwaza jaanta hai (subinterfaces ek corridor par extra darwaaze hain). <b>Corridor mein khada guard jo bina badle check karta hai</b> (virtual wire): corridor ka layout nahi badalta, log bas guard ke paas se guzarte hain. <b>Corridor junction jahan guard logon ko sahi kamre tak bhi bhejta hai</b> (Layer 2): firewall switch bhi karta hai aur filter bhi. Aur <b>camera</b> (tap): woh dekhta hai lekin kisi ko rok nahi sakta.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Chaar deployment modes">
<rect x="10" y="10" width="300" height="90" rx="10" fill="#bbf7d0"/><text x="160" y="35" text-anchor="middle" class="svg-ink" font-size="14">Layer 3 (routed)</text><text x="160" y="57" text-anchor="middle" class="svg-muted" font-size="12">interface ya subinterface par IP</text><text x="160" y="77" text-anchor="middle" class="svg-muted" font-size="12">routing, NAT, har VLAN ka zone</text>
<rect x="330" y="10" width="300" height="90" rx="10" fill="#bae6fd"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="14">Virtual wire</text><text x="480" y="57" text-anchor="middle" class="svg-muted" font-size="12">do ports jude, na IP na routing</text><text x="480" y="77" text-anchor="middle" class="svg-muted" font-size="12">neighbours ke liye transparent</text>
<rect x="10" y="110" width="300" height="90" rx="10" fill="#ddd6fe"/><text x="160" y="135" text-anchor="middle" class="svg-ink" font-size="14">Layer 2 (switching)</text><text x="160" y="157" text-anchor="middle" class="svg-muted" font-size="12">VLAN object, frames switch karta hai</text><text x="160" y="177" text-anchor="middle" class="svg-muted" font-size="12">optional VLAN interface IP ke saath</text>
<rect x="330" y="110" width="300" height="90" rx="10" fill="#fde68a"/><text x="480" y="135" text-anchor="middle" class="svg-ink" font-size="14">Tap</text><text x="480" y="157" text-anchor="middle" class="svg-muted" font-size="12">sirf mirrored copy</text><text x="480" y="177" text-anchor="middle" class="svg-muted" font-size="12">visibility, blocking nahi</text>
</svg><p class="cap">Deployment mode interface ke hisaab se chuna jaata hai, isliye ek firewall mein modes mix ho sakte hain.</p></div>

<h3>Simulator kya chala sakta hai aur kya nahi</h3>
<p>Is module ke <b>apne koi labs nahi</b> hain. NK-OS simulator Layer 3 interfaces aur 802.1Q tag wale Layer 3 subinterfaces support karta hai. Woh virtual wire, Layer 2 VLAN objects ya tap implement nahi karta. Isliye:</p>
<ul>
<li>Subinterface chapters (2 se 5) <b>simulator se capture kiye</b> outputs dikhate hain, switch se trunked PA-VM par.</li>
<li>Virtual wire, Layer 2 aur tap chapters (6 se 8) configuration ke saath padhate hain jo saaf <b>Reference configuration (not run in the simulator)</b> likhi hai. Woh PAN-OS syntax follow karti hai lekin real firewall par use karne se pehle exact syntax product ya vendor documentation mein verify karo.</li>
<li>Practice ke liye pan-setup labs use karo (wahan ka firewall wahi subinterface commands accept karta hai), switching side ke liye ccna-vlans module, aur baad mein zone aur policy kaam ke liye pan-policy aur nse4-zones.</li>
</ul>

<h3>Chapter map</h3>
<ol>
<li>Yeh overview.</li>
<li>Subinterfaces kyun: trunks, tags aur router-on-a-stick.</li>
<li>Layer 3 subinterfaces configure karna.</li>
<li>Switch side aur end-to-end testing.</li>
<li>Subinterfaces troubleshoot karna.</li>
<li>Virtual wire deployments.</li>
<li>Layer 2 interfaces aur VLAN interfaces.</li>
<li>Tap, aggregate ethernet aur mode chunna.</li>
<li>Summary aur exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek branch mein access switch se firewall tak ek uplink hai jo VLAN 10 (users) aur VLAN 20 (servers) le jaata hai. Sabse simple design us ek physical port par do subinterfaces ke saath Layer 3 hai, har ek ka apna IP, zone aur rule set. Doosri site kehti hai "firewall ko aaj koi IP addressing badle bina lagao". Woh virtual wire hai. Teesri site chahti hai ki firewall switch ki jagah le: Layer 2. Ek product, teen jawab.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Aadat se mode chunna. Mode ek design decision hai jiska routing, NAT, VPN aur high availability par asar padta hai. Pehle tay karo ki firewall ko kya karna hai, phir mode chuno.</p></div>
<div class="exam"><p><b>Exam trap.</b> Mode <b>interface</b> ke hisaab se chuna jaata hai, firewall ke hisaab se nahi. Zone type interface type se match karna chahiye. Tap, virtual wire, Layer 2 aur Layer 3 zones alag zone types hain.</p></div>

<div class="scn"><h4>"Bas laga do" wali request</h4><p>Ek hospital ne clinical network ke saamne firewall chaha tha, bina ek bhi device renumber kiye ya router ki configuration badle. Team ne use router aur core switch ke beech virtual wire ke roop mein deploy kiya. Policy aur threat prevention usi weekend kaam karne lage, aur Layer 3 redesign baad ke maintenance window ke liye rakha gaya.</p><p><b>Lesson:</b> virtual wire deployment mode jitna hi migration tool bhi hai.</p></div>

<div class="iv"><p class="q">"PAN-OS firewall kaunse deployment modes support karta hai?"</p><p>Layer 3 (routed, VLANs ke liye subinterfaces ke saath), Layer 2 (VLAN objects aur optional VLAN interfaces ke saath switching), virtual wire (do interfaces bina addressing ke jude hue), tap (passive mirrored traffic), aur link bundling ke liye aggregate ethernet. Jodo ki modes interface ke hisaab se set hote hain aur aap is par chunte ho ki firewall ko route karna hai, switch karna hai, transparent rehna hai, ya sirf observe karna hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Modes: Layer 3, virtual wire, Layer 2, tap (plus bundles ke liye aggregate ethernet).</li>
<li>Mode interface ke hisaab se chuna jaata hai; zone type match karna chahiye.</li>
<li>Simulator sirf Layer 3 subinterfaces chalata hai; baaki modes labelled reference configuration se padhaye jaate hain.</li>
<li>Yahan labs nahi; pan-setup aur ccna-vlans mein practice karo, phir pan-policy.</li>
<li>Mode requirements se chuno, aadat se nahi.</li>
</ul></div>
`}};export{e as default};