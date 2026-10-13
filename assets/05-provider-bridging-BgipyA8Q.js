var e={id:`provider-bridging`,h:{en:`802.1ad provider bridging (Q-in-Q) and PBB`,hi:`802.1ad provider bridging (Q-in-Q) aur PBB`},body:{en:`
<p>A single 802.1Q VLAN tag has a 12-bit VLAN ID: 4,094 usable VLANs. A provider with many customers, each using VLANs 1 to 4094 of their own, cannot share one VLAN space. The answer in the metro Ethernet access network is to <b>stack tags</b>. <b>IEEE 802.1ad provider bridging</b>, widely called <b>Q-in-Q</b>, adds a second VLAN tag so the provider can carry any customer VLAN design untouched.</p>

<h3>The two tags</h3>
<dl class="terms">
<dt>C-tag (customer tag)</dt><dd>The customer's 802.1Q tag, TPID 0x8100. Provider devices do not need to read it.</dd>
<dt>S-tag (service tag)</dt><dd>The provider's outer tag, TPID <b>0x88a8</b> in the standard. Its VLAN is the <b>S-VLAN</b>, which identifies the customer service across the provider network. It also carries the PCP (priority) and DEI (drop eligibility) bits.</dd>
<dt>Customer-facing port</dt><dd>Adds the S-tag on ingress and removes it on egress.</dd>
<dt>Provider (network) port</dt><dd>Trunks S-tagged frames between provider switches.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Q-in-Q frame">
<rect x="10" y="50" width="100" height="55" fill="#e2e8f0"/><text x="60" y="82" text-anchor="middle" class="svg-ink" font-size="12">Dest and Src MAC</text>
<rect x="110" y="50" width="105" height="55" fill="#fde68a"/><text x="162" y="75" text-anchor="middle" class="svg-ink" font-size="12">S-tag</text><text x="162" y="92" text-anchor="middle" class="svg-muted" font-size="11">TPID 0x88a8</text>
<rect x="215" y="50" width="105" height="55" fill="#bae6fd"/><text x="267" y="75" text-anchor="middle" class="svg-ink" font-size="12">C-tag</text><text x="267" y="92" text-anchor="middle" class="svg-muted" font-size="11">TPID 0x8100</text>
<rect x="320" y="50" width="180" height="55" fill="#bbf7d0"/><text x="410" y="82" text-anchor="middle" class="svg-ink" font-size="12">EtherType and payload</text>
<rect x="500" y="50" width="130" height="55" fill="#e2e8f0"/><text x="565" y="82" text-anchor="middle" class="svg-ink" font-size="12">FCS (recomputed)</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Frame grows by 4 bytes: raise MTU on every provider link</text>
</svg><p class="cap">An 802.1ad frame carries the provider S-tag outside the customer C-tag.</p></div>

<h3>Why it works</h3>
<p>The provider switches forward on the <b>S-VLAN</b> and the destination MAC. The customer's own VLANs are hidden inside. Up to 4,094 S-VLANs times 4,094 C-VLANs gives about 16 million combinations, and customers can use any VLAN numbers, including overlapping ones, because the S-tag keeps them apart.</p>
<div class="eg"><p><b>Worked example.</b> Customer A uses VLANs 10 and 20 at both sites. Customer B also uses VLANs 10 and 20. The provider assigns S-VLAN 1001 to A and S-VLAN 1002 to B. At the ingress port, A's frames get S-tag 1001 on top of C-tag 10 or 20. Across the metro, frames are switched using S-VLAN 1001. B's traffic uses 1002 and cannot mix with A's, although both use C-VLAN 10.</p></div>

<h3>Ways to attach a customer</h3>
<ul>
<li><b>Port-based Q-in-Q</b>: all frames from the port, tagged or untagged, receive one S-tag. On Cisco Catalyst this is <code>switchport mode dot1q-tunnel</code> with an access VLAN as the S-VLAN.</li>
<li><b>Selective Q-in-Q</b>: different C-VLAN ranges map to different S-VLANs on the same port, which is how EVPL services are sold.</li>
<li><b>Tag rewriting</b>: <b>push</b>, <b>pop</b> and <b>translate</b> tags, as with the IOS XE <code>rewrite ingress tag</code> command or the IOS XR <code>rewrite ingress tag push dot1q 1001 symmetric</code>.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Catalyst-style port-based Q-in-Q (feature support varies by platform)</span>
vlan 1001
 name CUST-A-SVLAN
interface GigabitEthernet1/0/1
 description Customer A UNI
 switchport access vlan 1001
 switchport mode dot1q-tunnel
 l2protocol-tunnel cdp
 l2protocol-tunnel stp
 l2protocol-tunnel vtp
<span class="c">! Provider trunks: raise MTU by at least 4 bytes (platform specific command)</span></pre>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR sub-interface that pushes an S-tag</span>
interface GigabitEthernet0/0/0/1.1001 l2transport
 encapsulation dot1q 10
 rewrite ingress tag push dot1q 1001 symmetric</pre>

<h3>Layer 2 control protocol handling</h3>
<p>The customer's switches send CDP, STP BPDUs and VTP frames to reserved multicast MACs. At the provider UNI there are three choices: <b>tunnel</b> them (they pass through the provider as data, so the customer's spanning tree spans both sites), <b>discard</b> them, or <b>peer</b> with them. Tunnelling is done with Layer 2 protocol tunnelling (L2PT) which rewrites the destination MAC so the provider does not process the frame. Always agree with the customer which is wanted: tunnelling STP between sites merges their failure domains.</p>

<h3>MAC scaling and PBB (802.1ah)</h3>
<p>With Q-in-Q the provider core switches learn every customer MAC address. That does not scale. <b>Provider Backbone Bridging (PBB, 802.1ah, MAC-in-MAC)</b> encapsulates the customer frame in a new frame with <b>backbone MAC addresses (B-MACs)</b> and a <b>24-bit I-SID</b> service identifier, so the core only learns B-MACs and supports about 16 million services. PBB is combined with EVPN as <b>PBB-EVPN</b> (RFC 7623) to reduce BGP MAC advertisements in large service-provider designs.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the 4-byte MTU increase on provider links, which silently drops full-size customer frames; running CDP or STP tunnelling without the customer's agreement; and mismatched TPIDs between vendors (0x88a8 versus 0x8100 on the outer tag).</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.1ad is Q-in-Q with S-tag and C-tag, TPID 0x88a8 for the S-tag. 802.1ah is PBB (MAC-in-MAC) with B-MACs and I-SID. They solve different scaling problems: VLAN space versus MAC space.</p></div>

<div class="scn"><h4>Full-size frames disappear after the Q-in-Q service goes live</h4><p>A customer reported that large file transfers hung while small pings worked. The metro switches had MTU 1500 on the provider trunks. The extra S-tag made a 1500-byte payload frame 4 bytes bigger than the limit. After raising the trunk MTU, transfers worked.</p><p><b>Lesson:</b> every tag you add costs 4 bytes, so plan MTU first.</p></div>

<div class="iv"><p class="q">"What is Q-in-Q and why do providers use it?"</p><p>802.1ad adds an outer S-tag so one provider VLAN carries all of a customer's VLANs. It solves VLAN-space exhaustion and overlap, hides customer VLAN design, and pairs with L2 protocol tunnelling. Add that PBB solves MAC-table scaling.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Q-in-Q stacks an S-tag (TPID 0x88a8 in 802.1ad) on the customer C-tag.</li>
<li>Port-based and selective Q-in-Q; tag push, pop and translate.</li>
<li>Raise MTU by 4 bytes per added tag.</li>
<li>Decide whether to tunnel, discard or peer Layer 2 control protocols.</li>
<li>PBB (802.1ah) uses B-MACs and I-SID to avoid learning customer MACs in the core.</li>
</ul></div>
`,hi:`
<p>Ek 802.1Q VLAN tag mein 12-bit VLAN ID hoti hai: 4,094 usable VLANs. Bahut customers wala provider, jinme se har ek VLAN 1 se 4094 apne tarah use karta hai, ek VLAN space share nahi kar sakta. Metro Ethernet access network mein jawab hai <b>tags stack karna</b>. <b>IEEE 802.1ad provider bridging</b>, jise aam taur par <b>Q-in-Q</b> kehte hain, doosra VLAN tag jodta hai taaki provider kisi bhi customer VLAN design ko untouched carry kar sake.</p>

<h3>Do tags</h3>
<dl class="terms">
<dt>C-tag (customer tag)</dt><dd>Customer ka 802.1Q tag, TPID 0x8100. Provider devices ko ise padhna zaroori nahi.</dd>
<dt>S-tag (service tag)</dt><dd>Provider ka outer tag, standard mein TPID <b>0x88a8</b>. Iski VLAN <b>S-VLAN</b> hai, jo provider network mein customer service identify karti hai. Ismein PCP (priority) aur DEI (drop eligibility) bits bhi hote hain.</dd>
<dt>Customer-facing port</dt><dd>Ingress par S-tag jodta hai aur egress par hata deta hai.</dd>
<dt>Provider (network) port</dt><dd>Provider switches ke beech S-tagged frames trunk karta hai.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Q-in-Q frame">
<rect x="10" y="50" width="100" height="55" fill="#e2e8f0"/><text x="60" y="82" text-anchor="middle" class="svg-ink" font-size="12">Dest aur Src MAC</text>
<rect x="110" y="50" width="105" height="55" fill="#fde68a"/><text x="162" y="75" text-anchor="middle" class="svg-ink" font-size="12">S-tag</text><text x="162" y="92" text-anchor="middle" class="svg-muted" font-size="11">TPID 0x88a8</text>
<rect x="215" y="50" width="105" height="55" fill="#bae6fd"/><text x="267" y="75" text-anchor="middle" class="svg-ink" font-size="12">C-tag</text><text x="267" y="92" text-anchor="middle" class="svg-muted" font-size="11">TPID 0x8100</text>
<rect x="320" y="50" width="180" height="55" fill="#bbf7d0"/><text x="410" y="82" text-anchor="middle" class="svg-ink" font-size="12">EtherType aur payload</text>
<rect x="500" y="50" width="130" height="55" fill="#e2e8f0"/><text x="565" y="82" text-anchor="middle" class="svg-ink" font-size="12">FCS (dobara compute)</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Frame 4 bytes bada hota hai: har provider link par MTU badhao</text>
</svg><p class="cap">802.1ad frame mein provider S-tag customer C-tag ke bahar hota hai.</p></div>

<h3>Yeh kaise kaam karta hai</h3>
<p>Provider switches <b>S-VLAN</b> aur destination MAC par forward karte hain. Customer ki apni VLANs andar chhupi rehti hain. 4,094 S-VLANs guna 4,094 C-VLANs lagbhag 16 million combinations deta hai, aur customers koi bhi VLAN numbers, overlapping bhi, use kar sakte hain kyunki S-tag unhe alag rakhta hai.</p>
<div class="eg"><p><b>Worked example.</b> Customer A dono sites par VLANs 10 aur 20 use karta hai. Customer B bhi VLANs 10 aur 20 use karta hai. Provider A ko S-VLAN 1001 aur B ko S-VLAN 1002 deta hai. Ingress port par A ke frames C-tag 10 ya 20 ke upar S-tag 1001 paate hain. Metro mein frames S-VLAN 1001 se switch hote hain. B ka traffic 1002 use karta hai aur A ke saath mix nahi ho sakta, halanki dono C-VLAN 10 use karte hain.</p></div>

<h3>Customer attach karne ke tareeke</h3>
<ul>
<li><b>Port-based Q-in-Q</b>: port ke saare frames, tagged ya untagged, ek S-tag paate hain. Cisco Catalyst par yeh <code>switchport mode dot1q-tunnel</code> hai, access VLAN S-VLAN ke roop mein.</li>
<li><b>Selective Q-in-Q</b>: ek hi port par alag C-VLAN ranges alag S-VLANs se map hoti hain, EVPL services isi tarah bechi jaati hain.</li>
<li><b>Tag rewriting</b>: tags <b>push</b>, <b>pop</b> aur <b>translate</b> karna, jaise IOS XE <code>rewrite ingress tag</code> command ya IOS XR <code>rewrite ingress tag push dot1q 1001 symmetric</code>.</li>
</ul>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Catalyst-style port-based Q-in-Q (feature support varies by platform)</span>
vlan 1001
 name CUST-A-SVLAN
interface GigabitEthernet1/0/1
 description Customer A UNI
 switchport access vlan 1001
 switchport mode dot1q-tunnel
 l2protocol-tunnel cdp
 l2protocol-tunnel stp
 l2protocol-tunnel vtp
<span class="c">! Provider trunks: raise MTU by at least 4 bytes (platform specific command)</span></pre>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR sub-interface that pushes an S-tag</span>
interface GigabitEthernet0/0/0/1.1001 l2transport
 encapsulation dot1q 10
 rewrite ingress tag push dot1q 1001 symmetric</pre>

<h3>Layer 2 control protocol handling</h3>
<p>Customer ke switches CDP, STP BPDUs aur VTP frames reserved multicast MACs par bhejte hain. Provider UNI par teen choices hain: unhe <b>tunnel</b> karo (woh data ki tarah provider se guzarte hain, isliye customer ka spanning tree dono sites par failta hai), <b>discard</b> karo, ya unse <b>peer</b> karo. Tunnelling Layer 2 protocol tunnelling (L2PT) se hoti hai jo destination MAC rewrite karti hai taaki provider frame ko process na kare. Customer se hamesha agree karo ki kya chahiye: sites ke beech STP tunnel karne se unke failure domains mil jaate hain.</p>

<h3>MAC scaling aur PBB (802.1ah)</h3>
<p>Q-in-Q ke saath provider core switches har customer MAC address learn karte hain. Yeh scale nahi karta. <b>Provider Backbone Bridging (PBB, 802.1ah, MAC-in-MAC)</b> customer frame ko <b>backbone MAC addresses (B-MACs)</b> aur <b>24-bit I-SID</b> service identifier wale naye frame mein encapsulate karta hai, isliye core sirf B-MACs learn karta hai aur lagbhag 16 million services support karta hai. PBB ko EVPN ke saath <b>PBB-EVPN</b> (RFC 7623) ke roop mein jodte hain taaki bade service-provider designs mein BGP MAC advertisements kam hon.</p>

<div class="warn"><p><b>Common mistakes.</b> Provider links par 4-byte MTU badhana bhoolna, jisse full-size customer frames chupchap drop hote hain; customer ki agreement ke bina CDP ya STP tunnelling chalana; aur vendors ke beech mismatched TPIDs (outer tag par 0x88a8 versus 0x8100).</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.1ad S-tag aur C-tag ke saath Q-in-Q hai, S-tag ka TPID 0x88a8. 802.1ah PBB (MAC-in-MAC) hai, B-MACs aur I-SID ke saath. Yeh alag scaling problems solve karte hain: VLAN space versus MAC space.</p></div>

<div class="scn"><h4>Q-in-Q service live hone ke baad full-size frames gayab</h4><p>Customer ne bataya ki badi file transfers hang hoti hain jabki chhote pings chalte hain. Metro switches ke provider trunks par MTU 1500 tha. Extra S-tag ne 1500-byte payload frame ko limit se 4 bytes bada kar diya. Trunk MTU badhane ke baad transfers chale.</p><p><b>Lesson:</b> har jodi gayi tag 4 bytes leti hai, isliye pehle MTU plan karo.</p></div>

<div class="iv"><p class="q">"Q-in-Q kya hai aur providers ise kyun use karte hain?"</p><p>802.1ad outer S-tag jodta hai taaki ek provider VLAN customer ki saari VLANs carry kare. Yeh VLAN-space exhaustion aur overlap solve karta hai, customer VLAN design chhupata hai, aur L2 protocol tunnelling ke saath chalta hai. Jodo ki PBB MAC-table scaling solve karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Q-in-Q customer C-tag par S-tag (802.1ad mein TPID 0x88a8) stack karta hai.</li>
<li>Port-based aur selective Q-in-Q; tag push, pop aur translate.</li>
<li>Har jodi gayi tag ke liye MTU 4 bytes badhao.</li>
<li>Tay karo ki Layer 2 control protocols tunnel, discard ya peer karne hain.</li>
<li>PBB (802.1ah) B-MACs aur I-SID se core mein customer MACs learn hone se bachata hai.</li>
</ul></div>
`}};export{e as default};