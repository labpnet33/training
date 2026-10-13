var e={id:`endpoints`,h:{en:`Endpoints and protected networks: building the branch tunnel`,hi:`Endpoints aur protected networks: branch tunnel banana`},body:{en:`
<p>A courier contract names two things for each office: the <b>loading dock</b> where boxes are handed over (the endpoint: an interface and its public IP) and the <b>departments</b> whose documents may travel (the protected networks). Get either wrong and the courier either goes to the wrong address or refuses the box. This chapter builds the first lab tunnel, HQ-BR1, and shows how to prove it works.</p>

<h3>Endpoints</h3>
<p><b>Node A</b> is the device you are configuring, NK-FTD. Its <b>Interface</b> is the one that faces the peer, almost always <code>outside</code>; the wizard shows the resulting "Endpoint IP: 203.0.113.2". <b>Node B</b> is the peer. For BR1 choose <b>Device: Extranet (other vendor / IOS)</b>, Device Name <code>BR1</code> and Endpoint IP Address <code>198.51.100.2</code>. If Node B were another managed Threat Defense, choosing it from the Device list fills the IP from its outside interface.</p>

<h3>Protected networks are the crypto ACL</h3>
<p>Node A's <b>Protected Networks</b> are your networks behind NK-FTD (object INSIDE-NET, 10.0.1.0/24). Node B's are the networks behind the peer (object BR1-LAN, 10.20.0.0/24). The Management Center turns every pair into a line of the crypto ACL:</p>
<pre class="code">access-list CSM_IPSEC_ACL_1 extended permit ip 10.0.1.0 255.255.255.0 10.20.0.0 255.255.255.0</pre>
<p>The peer must describe the same flows as a <b>mirror image</b>: BR1's <code>access-list 110 permit ip 10.20.0.0 0.0.0.255 10.0.1.0 0.0.0.255</code> is exactly that. During IKE_AUTH each side proposes its selectors (TSi and TSr); if the responder finds no matching entry it answers <code>TS_UNACCEPTABLE</code> and you get an IKE SA without a child SA.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Mirror image protected networks">
<rect x="10" y="30" width="270" height="110" rx="8" fill="#fed7aa"/><text x="145" y="55" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD (Node A)</text>
<text x="145" y="82" text-anchor="middle" class="svg-muted" font-size="12">local: 10.0.1.0/24 (INSIDE-NET)</text><text x="145" y="104" text-anchor="middle" class="svg-muted" font-size="12">remote: 10.20.0.0/24 (BR1-LAN)</text><text x="145" y="126" text-anchor="middle" class="svg-muted" font-size="12">peer 198.51.100.2</text>
<rect x="360" y="30" width="270" height="110" rx="8" fill="#bae6fd"/><text x="495" y="55" text-anchor="middle" class="svg-ink" font-size="13">BR1 (Node B)</text>
<text x="495" y="82" text-anchor="middle" class="svg-muted" font-size="12">local: 10.20.0.0/24 (ACL 110)</text><text x="495" y="104" text-anchor="middle" class="svg-muted" font-size="12">remote: 10.0.1.0/24</text><text x="495" y="126" text-anchor="middle" class="svg-muted" font-size="12">peer 203.0.113.2</text>
<line x1="280" y1="85" x2="360" y2="85" stroke="#0284c7" stroke-width="2"/><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="13">local and remote swap = mirror image</text>
</svg><p class="cap">Each side's "local" is the other side's "remote". Anything else risks TS_UNACCEPTABLE.</p></div>

<h3>Lab walkthrough: Threat Defense to a branch router</h3>
<ol><li>Read the peer: <code>BR1&gt; show crypto ikev2 proposal</code> shows AES-CBC-256, SHA-256, DH group 14.</li>
<li>In NK-FTD's Management Center go to <b>Devices → VPN · Site To Site → Add</b>. In <b>1 · Endpoints</b>: Topology Name <code>HQ-BR1</code>, Network Topology <b>Point to Point</b>, IKE Version <b>IKEv2</b>; Node A Interface <code>outside</code>, Protected Networks <code>INSIDE-NET</code>; Node B Extranet, Device Name <code>BR1</code>, Endpoint IP <code>198.51.100.2</code>, Protected Networks <code>BR1-LAN</code>.</li>
<li><b>2 · IKE</b>: Pre-shared Manual Key, Key and Confirm Key <code>NKs2s-2026</code>, IKEv2 Policies <code>AES-SHA-SHA-LATEST</code>.</li>
<li><b>3 · IPsec</b>: IKEv2 IPsec Proposals <code>AES-SHA</code>; leave PFS off because BR1 does not use it.</li>
<li><b>4 · Advanced</b>: tick <b>Exempt VPN traffic from network address translation</b> with inside zone <code>INSIDE</code> (chapter 6 explains why), then add the access control rule <code>VPN-From-BR1</code> (chapter 7) and <b>Deploy</b>.</li>
<li>Generate traffic both ways: <code>ping 10.20.0.10</code> on PC1 and <code>ping 10.0.1.20</code> on PC-BR. The first ping can time out while IKE negotiates; that is normal.</li></ol>

<h3>Verifying the tunnel</h3>
<pre class="out">&gt; show crypto ipsec sa
interface: outside
    Crypto map tag: CSM_outside_map, seq num: 1, local addr: 203.0.113.2

      access-list CSM_IPSEC_ACL_1 extended permit ip 10.0.1.0 255.255.255.0 10.20.0.0 255.255.255.0
      local ident (addr/mask/prot/port): (10.0.1.0/255.255.255.0/0/0)
      remote ident (addr/mask/prot/port): (10.20.0.0/255.255.255.0/0/0)
      current_peer: 198.51.100.2

      <span class="hl">#pkts encaps: 9, #pkts encrypt: 9, #pkts digest: 9</span>
      <span class="hl">#pkts decaps: 9, #pkts decrypt: 9, #pkts verify: 9</span>
      #send errors: 0, #recv errors: 0

      local crypto endpt.: 203.0.113.2/500, remote crypto endpt.: 198.51.100.2/500</pre>
<p>Encaps and decaps both rising means traffic flows in both directions. Encaps rising with decaps stuck at 0 means you send but the peer does not send back (usually NAT exemption, routing or access control on the far side); the reverse means the peer sends but your replies do not enter the tunnel. <code>show vpn-sessiondb l2l</code> gives a one-screen summary with the negotiated algorithms, and in the GUI <b>Analysis → VPN Monitoring</b> shows the tunnel as Up with an Encaps / Decaps column.</p>

<h3>Managed peers: the mirror topology</h3>
<p>In the Threat Defense to Threat Defense lab, Node B is the managed NK-FTD-BR. When you choose it, the option <b>Also create the mirror-image topology on the managed Node B device</b> appears. Keep it ticked: the Management Center creates the same topology on NK-FTD-BR with local and remote swapped, the same key, policies and PFS. You must still <b>Deploy</b> to both devices.</p>

<div class="warn"><p><b>Common mistakes.</b> Selecting the peer's LAN on Node A; using a summary (10.0.0.0/8) on one side and a /24 on the other, so the selectors are not mirror images; typing the peer's inside address as the endpoint; deploying only one of two managed devices.</p></div>

<div class="exam"><p><b>Exam trap.</b> A policy-based tunnel is built on demand: no interesting traffic, no tunnel. "The tunnel is down" right after deploy may only mean nobody has sent matching traffic yet. Packet-tracer from the inside interface also triggers the negotiation.</p></div>

<div class="scn"><h4>The /16 that broke the partner tunnel</h4><p>A partner tunnel had worked for years with 10.0.1.0/24 behind HQ. A colleague "simplified" the HQ protected networks to 10.0.0.0/16 to cover a new subnet. Next morning the tunnel showed IKE up, child SA zero, and <code>Create child SA negotiation failed (received TS_UNACCEPTABLE notify)</code>. The partner's crypto ACL still listed only 10.0.1.0/24. The fix was to list the two /24 networks as separate objects and ask the partner to add the new one to their ACL.</p><p><b>Lesson:</b> protected networks are a contract with the peer; change them on both sides together.</p></div>

<div class="iv"><p class="q">"The IKE SA is up but there is no IPsec SA. What do you check?"</p><p>Say that authentication already succeeded, so the problem is in the child SA: compare the protected networks (they must be mirror images, same masks), the IPsec proposal and PFS. Look for TS_UNACCEPTABLE or NO_PROPOSAL_CHOSEN in <code>show logging</code> or <code>debug crypto ikev2 protocol 127</code>, and compare <code>show running-config crypto</code> with the peer's crypto ACL.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Endpoint = interface plus public IP; Node A is you, Node B the peer (managed or extranet).</li>
<li>Protected networks become CSM_IPSEC_ACL lines and must mirror the peer's crypto ACL exactly.</li>
<li>Verify with show crypto ikev2 sa, show crypto ipsec sa (encaps and decaps) and show vpn-sessiondb l2l.</li>
<li>Managed peers can get an automatic mirror topology, but both devices need a deploy.</li>
<li>Policy-based tunnels come up only when interesting traffic or packet-tracer triggers them.</li>
</ul></div>
`,hi:`
<p>Courier contract har office ke liye do cheezein naam deta hai: <b>loading dock</b> jahan boxes diye jaate hain (endpoint: ek interface aur uska public IP) aur woh <b>departments</b> jinke documents travel kar sakte hain (protected networks). Inmein se koi bhi galat ho to courier ya to galat address par jaata hai ya box lene se mana kar deta hai. Yeh chapter pehla lab tunnel HQ-BR1 banata hai aur dikhata hai ki woh kaam kar raha hai yeh kaise prove karein.</p>

<h3>Endpoints</h3>
<p><b>Node A</b> woh device hai jise aap configure kar rahe ho, NK-FTD. Uska <b>Interface</b> woh hai jo peer ki taraf hai, lagbhag hamesha <code>outside</code>; wizard result dikhata hai "Endpoint IP: 203.0.113.2". <b>Node B</b> peer hai. BR1 ke liye <b>Device: Extranet (other vendor / IOS)</b>, Device Name <code>BR1</code> aur Endpoint IP Address <code>198.51.100.2</code> chuno. Agar Node B doosra managed Threat Defense hota, to Device list se use chunne par IP uske outside interface se bhar jaata.</p>

<h3>Protected networks hi crypto ACL hain</h3>
<p>Node A ke <b>Protected Networks</b> NK-FTD ke peeche aapke networks hain (object INSIDE-NET, 10.0.1.0/24). Node B ke peer ke peeche ke networks hain (object BR1-LAN, 10.20.0.0/24). Management Center har pair ko crypto ACL ki ek line mein badalta hai:</p>
<pre class="code">access-list CSM_IPSEC_ACL_1 extended permit ip 10.0.1.0 255.255.255.0 10.20.0.0 255.255.255.0</pre>
<p>Peer ko same flows <b>mirror image</b> ki tarah describe karne chahiye: BR1 ka <code>access-list 110 permit ip 10.20.0.0 0.0.0.255 10.0.1.0 0.0.0.255</code> bilkul wahi hai. IKE_AUTH ke dauraan har side apne selectors (TSi aur TSr) propose karti hai; agar responder ko koi matching entry nahi milti to woh <code>TS_UNACCEPTABLE</code> jawab deta hai aur aapko child SA ke bina ek IKE SA milta hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Mirror image protected networks">
<rect x="10" y="30" width="270" height="110" rx="8" fill="#fed7aa"/><text x="145" y="55" text-anchor="middle" class="svg-ink" font-size="13">NK-FTD (Node A)</text>
<text x="145" y="82" text-anchor="middle" class="svg-muted" font-size="12">local: 10.0.1.0/24 (INSIDE-NET)</text><text x="145" y="104" text-anchor="middle" class="svg-muted" font-size="12">remote: 10.20.0.0/24 (BR1-LAN)</text><text x="145" y="126" text-anchor="middle" class="svg-muted" font-size="12">peer 198.51.100.2</text>
<rect x="360" y="30" width="270" height="110" rx="8" fill="#bae6fd"/><text x="495" y="55" text-anchor="middle" class="svg-ink" font-size="13">BR1 (Node B)</text>
<text x="495" y="82" text-anchor="middle" class="svg-muted" font-size="12">local: 10.20.0.0/24 (ACL 110)</text><text x="495" y="104" text-anchor="middle" class="svg-muted" font-size="12">remote: 10.0.1.0/24</text><text x="495" y="126" text-anchor="middle" class="svg-muted" font-size="12">peer 203.0.113.2</text>
<line x1="280" y1="85" x2="360" y2="85" stroke="#0284c7" stroke-width="2"/><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="13">local aur remote swap = mirror image</text>
</svg><p class="cap">Har side ka "local" doosri side ka "remote" hai. Kuch aur ho to TS_UNACCEPTABLE ka risk hai.</p></div>

<h3>Lab walkthrough: Threat Defense se branch router</h3>
<ol><li>Peer padho: <code>BR1&gt; show crypto ikev2 proposal</code> AES-CBC-256, SHA-256, DH group 14 dikhata hai.</li>
<li>NK-FTD ke Management Center mein <b>Devices → VPN · Site To Site → Add</b> par jao. <b>1 · Endpoints</b> mein: Topology Name <code>HQ-BR1</code>, Network Topology <b>Point to Point</b>, IKE Version <b>IKEv2</b>; Node A Interface <code>outside</code>, Protected Networks <code>INSIDE-NET</code>; Node B Extranet, Device Name <code>BR1</code>, Endpoint IP <code>198.51.100.2</code>, Protected Networks <code>BR1-LAN</code>.</li>
<li><b>2 · IKE</b>: Pre-shared Manual Key, Key aur Confirm Key <code>NKs2s-2026</code>, IKEv2 Policies <code>AES-SHA-SHA-LATEST</code>.</li>
<li><b>3 · IPsec</b>: IKEv2 IPsec Proposals <code>AES-SHA</code>; PFS off chhodo kyunki BR1 use use nahi karta.</li>
<li><b>4 · Advanced</b>: inside zone <code>INSIDE</code> ke saath <b>Exempt VPN traffic from network address translation</b> tick karo (chapter 6 batata hai kyun), phir access control rule <code>VPN-From-BR1</code> jodo (chapter 7) aur <b>Deploy</b> karo.</li>
<li>Dono taraf traffic generate karo: PC1 par <code>ping 10.20.0.10</code> aur PC-BR par <code>ping 10.0.1.20</code>. IKE negotiate hote waqt pehla ping time out ho sakta hai; yeh normal hai.</li></ol>

<h3>Tunnel verify karna</h3>
<pre class="out">&gt; show crypto ipsec sa
interface: outside
    Crypto map tag: CSM_outside_map, seq num: 1, local addr: 203.0.113.2

      access-list CSM_IPSEC_ACL_1 extended permit ip 10.0.1.0 255.255.255.0 10.20.0.0 255.255.255.0
      local ident (addr/mask/prot/port): (10.0.1.0/255.255.255.0/0/0)
      remote ident (addr/mask/prot/port): (10.20.0.0/255.255.255.0/0/0)
      current_peer: 198.51.100.2

      <span class="hl">#pkts encaps: 9, #pkts encrypt: 9, #pkts digest: 9</span>
      <span class="hl">#pkts decaps: 9, #pkts decrypt: 9, #pkts verify: 9</span>
      #send errors: 0, #recv errors: 0

      local crypto endpt.: 203.0.113.2/500, remote crypto endpt.: 198.51.100.2/500</pre>
<p>Encaps aur decaps dono badh rahe hain matlab traffic dono directions mein chal raha hai. Encaps badh raha aur decaps 0 par atka matlab aap bhej rahe ho par peer wapas nahi bhejta (aam taur par far side par NAT exemption, routing ya access control); ulta matlab peer bhejta hai par aapke replies tunnel mein nahi jaate. <code>show vpn-sessiondb l2l</code> negotiated algorithms ke saath ek-screen summary deta hai, aur GUI mein <b>Analysis → VPN Monitoring</b> tunnel ko Encaps / Decaps column ke saath Up dikhata hai.</p>

<h3>Managed peers: mirror topology</h3>
<p>Threat Defense se Threat Defense lab mein Node B managed NK-FTD-BR hai. Use chunne par option <b>Also create the mirror-image topology on the managed Node B device</b> dikhta hai. Ise ticked rakho: Management Center NK-FTD-BR par local aur remote swap karke wahi topology banata hai, same key, policies aur PFS ke saath. Aapko phir bhi dono devices par <b>Deploy</b> karna hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Node A par peer ka LAN select karna; ek side par summary (10.0.0.0/8) aur doosri par /24 use karna, jisse selectors mirror image nahi rehte; peer ka inside address endpoint ki tarah type karna; do managed devices mein se sirf ek par deploy karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Policy-based tunnel demand par banta hai: interesting traffic nahi, to tunnel nahi. Deploy ke turant baad "tunnel down hai" ka matlab sirf itna ho sakta hai ki kisi ne abhi matching traffic nahi bheja. Inside interface se packet-tracer bhi negotiation trigger karta hai.</p></div>

<div class="scn"><h4>Woh /16 jisne partner tunnel toda</h4><p>Ek partner tunnel saalon se HQ ke peeche 10.0.1.0/24 ke saath chal raha tha. Ek colleague ne naye subnet ko cover karne ke liye HQ protected networks ko 10.0.0.0/16 mein "simplify" kar diya. Agli subah tunnel ne IKE up, child SA zero, aur <code>Create child SA negotiation failed (received TS_UNACCEPTABLE notify)</code> dikhaya. Partner ki crypto ACL abhi bhi sirf 10.0.1.0/24 list karti thi. Fix tha do /24 networks ko alag objects ki tarah list karna aur partner se naya wala apni ACL mein jodne ko kehna.</p><p><b>Lesson:</b> protected networks peer ke saath ek contract hain; unhe dono sides par saath mein badlo.</p></div>

<div class="iv"><p class="q">"IKE SA up hai par IPsec SA nahi hai. Kya check karoge?"</p><p>Batao ki authentication pehle hi succeed ho chuka, isliye problem child SA mein hai: protected networks compare karo (mirror image, same masks hone chahiye), IPsec proposal aur PFS. <code>show logging</code> ya <code>debug crypto ikev2 protocol 127</code> mein TS_UNACCEPTABLE ya NO_PROPOSAL_CHOSEN dhoondo, aur <code>show running-config crypto</code> ko peer ki crypto ACL se compare karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Endpoint = interface plus public IP; Node A aap ho, Node B peer (managed ya extranet).</li>
<li>Protected networks CSM_IPSEC_ACL lines bante hain aur peer ki crypto ACL ka exact mirror hone chahiye.</li>
<li>show crypto ikev2 sa, show crypto ipsec sa (encaps aur decaps) aur show vpn-sessiondb l2l se verify karo.</li>
<li>Managed peers ko automatic mirror topology mil sakti hai, par dono devices ko deploy chahiye.</li>
<li>Policy-based tunnels tabhi up hote hain jab interesting traffic ya packet-tracer unhe trigger kare.</li>
</ul></div>
`}};export{e as default};