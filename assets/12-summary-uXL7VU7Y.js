var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs the same checklist before every flight, even after ten thousand hours, because the list catches what memory misses. This chapter is your site-to-site VPN checklist: what you must be able to do, the words you must know, the facts examiners love, and a command sheet for the ASA and IOS side by side.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module summary">
<rect x="10" y="20" width="115" height="60" rx="8" fill="#e2e8f0"/><text x="67" y="47" text-anchor="middle" class="svg-ink" font-size="12">Design</text><text x="67" y="65" text-anchor="middle" class="svg-muted" font-size="11">peers, ACL</text>
<rect x="137" y="20" width="115" height="60" rx="8" fill="#ddd6fe"/><text x="194" y="47" text-anchor="middle" class="svg-ink" font-size="12">IKE policy</text><text x="194" y="65" text-anchor="middle" class="svg-muted" font-size="11">v1 / v2</text>
<rect x="264" y="20" width="115" height="60" rx="8" fill="#bae6fd"/><text x="321" y="47" text-anchor="middle" class="svg-ink" font-size="12">Proposal</text><text x="321" y="65" text-anchor="middle" class="svg-muted" font-size="11">phase 2</text>
<rect x="391" y="20" width="115" height="60" rx="8" fill="#bbf7d0"/><text x="448" y="47" text-anchor="middle" class="svg-ink" font-size="12">Tunnel-group</text><text x="448" y="65" text-anchor="middle" class="svg-muted" font-size="11">PSK / cert</text>
<rect x="518" y="20" width="115" height="60" rx="8" fill="#fde68a"/><text x="575" y="47" text-anchor="middle" class="svg-ink" font-size="12">Map or VTI</text><text x="575" y="65" text-anchor="middle" class="svg-muted" font-size="11">bind</text>
<rect x="137" y="110" width="170" height="60" rx="8" fill="#fed7aa"/><text x="222" y="137" text-anchor="middle" class="svg-ink" font-size="12">NAT exemption</text><text x="222" y="155" text-anchor="middle" class="svg-muted" font-size="11">identity NAT</text>
<rect x="333" y="110" width="170" height="60" rx="8" fill="#e2e8f0"/><text x="418" y="137" text-anchor="middle" class="svg-ink" font-size="12">Verify / debug</text><text x="418" y="155" text-anchor="middle" class="svg-muted" font-size="11">SAs, counters</text>
</svg><p class="cap">Seven blocks: five to build the tunnel, two to make it work through a firewall and prove it.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Fill a VPN parameters sheet: peers, protected networks, IKE version, phase 1 and 2 algorithms, PFS, lifetimes, authentication.</li>
<li>Write mirrored crypto ACLs on an ASA (masks/objects) and an IOS router (wildcards).</li>
<li>Configure ASA IKEv1 (<code>crypto ikev1 policy</code>, transform-set) and IKEv2 (<code>crypto ikev2 policy</code>, ipsec-proposal) and enable them on outside.</li>
<li>Build an <code>ipsec-l2l</code> tunnel-group with PSK (IKEv1 key; IKEv2 local and remote keys) or certificates.</li>
<li>Build a crypto map entry with match address, set peer, set proposal, optional PFS, and apply it to the interface.</li>
<li>Write the identity NAT exemption and explain <code>sysopt connection permit-vpn</code> and vpn-filter.</li>
<li>Build a static VTI on the ASA and the router with an IPsec profile and routes.</li>
<li>Configure the IOS peer for IKEv1 (lab) and IKEv2 (proposal, policy, keyring, profile, set ikev2-profile).</li>
<li>Verify with IKE SA, IPsec SA counters, vpn-sessiondb and packet-tracer; troubleshoot the five classic faults.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Interesting traffic</dt><dd>Traffic that must be encrypted, defined by the crypto ACL (policy-based) or by routing (VTI).</dd>
<dt>Crypto ACL</dt><dd>ACL in a crypto map; permit = encrypt. Must mirror the peer's.</dd>
<dt>Proxy ID / traffic selector</dt><dd>Local and remote networks negotiated in phase 2 (IKEv1 / IKEv2 names).</dd>
<dt>IKE policy</dt><dd>Phase 1 algorithms: encryption, integrity/hash, DH group, PRF, lifetime, authentication.</dd>
<dt>Transform set / IPsec proposal</dt><dd>Phase 2 algorithms for ESP.</dd>
<dt>Tunnel-group</dt><dd>ASA connection profile for a peer: type, group-policy, authentication.</dd>
<dt>Crypto map</dt><dd>Ordered entries binding ACL, peer and proposal to one interface.</dd>
<dt>VTI</dt><dd>Virtual tunnel interface; route-based IPsec with any-to-any selectors.</dd>
<dt>NAT exemption</dt><dd>Identity NAT that keeps VPN traffic untranslated so it matches the crypto ACL.</dd>
<dt>PFS</dt><dd>Fresh DH exchange for every phase 2 key; must match on both sides.</dd>
<dt>vpn-filter</dt><dd>Per-tunnel ACL in a group-policy; remote network written as source.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>IKE uses UDP 500, NAT-T UDP 4500; ESP is IP protocol 50, AH 51.</li>
<li>Healthy states: ASA IKEv1 <code>MM_ACTIVE</code>, IOS IKEv1 <code>QM_IDLE</code>, IKEv2 <code>READY</code>.</li>
<li>Phase 1 up + phase 2 down = proposal, PFS or selector mismatch, not the key.</li>
<li>IKEv1 phase 1 stuck at <code>MM_KEY_EXCH</code> on IOS usually means a PSK mismatch.</li>
<li>One crypto map per interface; new peers get new sequence numbers; dynamic entries last.</li>
<li>NAT happens before the crypto ACL check; manual identity NAT must sit above PAT.</li>
<li><code>sysopt connection permit-vpn</code> is on by default; decrypted traffic bypasses the interface ACL.</li>
<li>VTIs use an IPsec profile and <code>tunnel protection</code>; both ends must be route-based.</li>
<li>On IOS, <code>set ikev2-profile</code> makes a crypto map entry use IKEv2.</li>
<li>Encaps up and decaps zero: the peer does not send back; check its NAT, routing and ACL.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Task</th><th>ASA</th><th>IOS</th></tr>
<tr><td>Phase 1</td><td><code>crypto ikev2 policy 10</code></td><td><code>crypto ikev2 proposal</code> + <code>policy</code> / <code>crypto isakmp policy 10</code></td></tr>
<tr><td>Phase 2</td><td><code>crypto ipsec ikev2 ipsec-proposal</code></td><td><code>crypto ipsec transform-set</code></td></tr>
<tr><td>Key</td><td><code>tunnel-group X ipsec-attributes</code></td><td><code>crypto ikev2 keyring</code> / <code>crypto isakmp key</code></td></tr>
<tr><td>Bind</td><td><code>crypto map M interface outside</code></td><td><code>crypto map M</code> under the interface</td></tr>
<tr><td>Enable IKE</td><td><code>crypto ikev2 enable outside</code></td><td>automatic</td></tr>
<tr><td>Phase 1 state</td><td><code>show crypto ikev2 sa</code> / <code>ikev1 sa</code></td><td><code>show crypto ikev2 sa</code> / <code>isakmp sa</code></td></tr>
<tr><td>Counters</td><td><code>show crypto ipsec sa peer X</code></td><td><code>show crypto ipsec sa</code></td></tr>
<tr><td>Summary</td><td><code>show vpn-sessiondb l2l</code></td><td><code>show crypto session</code></td></tr>
<tr><td>Path test</td><td><code>packet-tracer input inside ...</code></td><td><code>ping ... source Gi0/1</code></td></tr>
<tr><td>Debug</td><td><code>debug crypto condition peer</code>, <code>debug crypto ikev2 protocol 127</code></td><td><code>debug crypto condition peer ipv4</code>, <code>debug crypto ikev2</code></td></tr></table>

<div class="eg"><p><b>Worked example: a two-minute self-test.</b> Without notes, write the HQ ASA configuration for peer 100.64.52.2, LANs 10.30.0.0/24 and 10.40.0.0/24, IKEv2 AES-256/SHA-256/group 14, key NKvpn2026, including the NAT exemption. You should produce objects, crypto ACL, ikev2 policy, ipsec-proposal, group-policy, tunnel-group with local and remote keys, four crypto map lines, the interface binding, <code>crypto ikev2 enable outside</code> and one <code>nat</code> line. Compare with chapters 5 and 6.</p></div>

<div class="warn"><p><b>Common mistake at the end of a change.</b> Leaving debugs running or packet captures active. Always finish with <code>undebug all</code> and <code>no capture</code>, and save the configuration with <code>write memory</code> on both sides.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often show one output and ask for the next step. Identify which layer is proven by the output (IKE SA, IPsec SA, counters) and pick the answer that checks the next layer, not one that re-checks a layer already proven.</p></div>

<div class="scn"><h4>The handover note</h4><p>A senior engineer leaving for holiday wrote a handover for the night shift: "Branch tunnels are IKEv2 crypto map entries 10 to 40 on OUTSIDE_MAP; partner is IKEv1 entry 50; NAT exemptions are lines 1 to 5 in section 1; check with show vpn-sessiondb l2l, then show crypto ipsec sa peer." When a branch dropped that night, the junior engineer followed the note, found decaps stuck, traced a new PAT rule above the exemptions, and fixed it before the morning shift.</p><p><b>Lesson:</b> a clear structure (entries, NAT lines, verification order) makes VPNs supportable by the whole team.</p></div>

<div class="iv"><p class="q">"Configure a site-to-site VPN between an ASA and a router from scratch. What do you need on each side?"</p><p>Strong answer: agree the parameters, then on the ASA: crypto ACL, ikev2 policy, ipsec-proposal, ipsec-l2l tunnel-group with keys, crypto map entry (match, peer, proposal, PFS), bind to outside, enable IKEv2, and an identity NAT exemption above PAT. On the router: IKEv2 proposal and policy, keyring, profile, transform set, mirrored ACL, crypto map with set ikev2-profile on the WAN interface. Verify IKE SA, IPsec counters both ways, and vpn-sessiondb.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Agree the parameters sheet first; mirror ACLs, algorithms, PFS and keys exactly.</li>
<li>ASA build: policy, proposal, tunnel-group, crypto map or VTI, enable IKE, NAT exemption.</li>
<li>Verification order: IKE SA, IPsec counters both ways, vpn-sessiondb, packet-tracer.</li>
<li>Five faults explain nearly every outage: proposal, PSK, ACL, NAT, routing.</li>
<li>Next, sec-ftd-vpn applies the same ideas on Threat Defense and adds remote access with Secure Client.</li>
</ul></div>
`,hi:`
<p>Pilot har flight se pehle wahi checklist chalata hai, das hazaar ghante ke baad bhi, kyunki list woh pakadti hai jo yaaddasht se chhoot jaata hai. Yeh chapter aapki site-to-site VPN checklist hai: aapko kya karna aana chahiye, kaunse words pata hone chahiye, examiners ke favourite facts, aur ASA aur IOS ke liye side by side ek command sheet.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module summary">
<rect x="10" y="20" width="115" height="60" rx="8" fill="#e2e8f0"/><text x="67" y="47" text-anchor="middle" class="svg-ink" font-size="12">Design</text><text x="67" y="65" text-anchor="middle" class="svg-muted" font-size="11">peers, ACL</text>
<rect x="137" y="20" width="115" height="60" rx="8" fill="#ddd6fe"/><text x="194" y="47" text-anchor="middle" class="svg-ink" font-size="12">IKE policy</text><text x="194" y="65" text-anchor="middle" class="svg-muted" font-size="11">v1 / v2</text>
<rect x="264" y="20" width="115" height="60" rx="8" fill="#bae6fd"/><text x="321" y="47" text-anchor="middle" class="svg-ink" font-size="12">Proposal</text><text x="321" y="65" text-anchor="middle" class="svg-muted" font-size="11">phase 2</text>
<rect x="391" y="20" width="115" height="60" rx="8" fill="#bbf7d0"/><text x="448" y="47" text-anchor="middle" class="svg-ink" font-size="12">Tunnel-group</text><text x="448" y="65" text-anchor="middle" class="svg-muted" font-size="11">PSK / cert</text>
<rect x="518" y="20" width="115" height="60" rx="8" fill="#fde68a"/><text x="575" y="47" text-anchor="middle" class="svg-ink" font-size="12">Map ya VTI</text><text x="575" y="65" text-anchor="middle" class="svg-muted" font-size="11">bind</text>
<rect x="137" y="110" width="170" height="60" rx="8" fill="#fed7aa"/><text x="222" y="137" text-anchor="middle" class="svg-ink" font-size="12">NAT exemption</text><text x="222" y="155" text-anchor="middle" class="svg-muted" font-size="11">identity NAT</text>
<rect x="333" y="110" width="170" height="60" rx="8" fill="#e2e8f0"/><text x="418" y="137" text-anchor="middle" class="svg-ink" font-size="12">Verify / debug</text><text x="418" y="155" text-anchor="middle" class="svg-muted" font-size="11">SAs, counters</text>
</svg><p class="cap">Saat blocks: paanch tunnel banane ke liye, do use firewall se chalane aur saabit karne ke liye.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>VPN parameters sheet bharo: peers, protected networks, IKE version, phase 1 aur 2 algorithms, PFS, lifetimes, authentication.</li>
<li>ASA (masks/objects) aur IOS router (wildcards) par mirrored crypto ACLs likho.</li>
<li>ASA IKEv1 (<code>crypto ikev1 policy</code>, transform-set) aur IKEv2 (<code>crypto ikev2 policy</code>, ipsec-proposal) configure karo aur outside par enable karo.</li>
<li>PSK (IKEv1 key; IKEv2 local aur remote keys) ya certificates ke saath <code>ipsec-l2l</code> tunnel-group banao.</li>
<li>match address, set peer, set proposal, optional PFS wali crypto map entry banao, aur use interface par apply karo.</li>
<li>Identity NAT exemption likho aur <code>sysopt connection permit-vpn</code> aur vpn-filter samjhao.</li>
<li>ASA aur router par IPsec profile aur routes ke saath static VTI banao.</li>
<li>IOS peer ko IKEv1 (lab) aur IKEv2 (proposal, policy, keyring, profile, set ikev2-profile) ke liye configure karo.</li>
<li>IKE SA, IPsec SA counters, vpn-sessiondb aur packet-tracer se verify karo; paanch classic faults troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Interesting traffic</dt><dd>Woh traffic jo encrypt hona chahiye, crypto ACL (policy-based) ya routing (VTI) se defined.</dd>
<dt>Crypto ACL</dt><dd>Crypto map ki ACL; permit = encrypt. Peer wali ka mirror honi chahiye.</dd>
<dt>Proxy ID / traffic selector</dt><dd>Phase 2 mein negotiate hone wale local aur remote networks (IKEv1 / IKEv2 naam).</dd>
<dt>IKE policy</dt><dd>Phase 1 algorithms: encryption, integrity/hash, DH group, PRF, lifetime, authentication.</dd>
<dt>Transform set / IPsec proposal</dt><dd>ESP ke liye phase 2 algorithms.</dd>
<dt>Tunnel-group</dt><dd>Peer ke liye ASA connection profile: type, group-policy, authentication.</dd>
<dt>Crypto map</dt><dd>Ordered entries jo ACL, peer aur proposal ko ek interface se baandhti hain.</dd>
<dt>VTI</dt><dd>Virtual tunnel interface; any-to-any selectors wala route-based IPsec.</dd>
<dt>NAT exemption</dt><dd>Identity NAT jo VPN traffic ko untranslated rakhta hai taaki woh crypto ACL se match kare.</dd>
<dt>PFS</dt><dd>Har phase 2 key ke liye fresh DH exchange; dono sides par match hona chahiye.</dd>
<dt>vpn-filter</dt><dd>Group-policy mein per-tunnel ACL; remote network source ki tarah likha jaata hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>IKE UDP 500 use karta hai, NAT-T UDP 4500; ESP IP protocol 50 hai, AH 51.</li>
<li>Healthy states: ASA IKEv1 <code>MM_ACTIVE</code>, IOS IKEv1 <code>QM_IDLE</code>, IKEv2 <code>READY</code>.</li>
<li>Phase 1 up + phase 2 down = proposal, PFS ya selector mismatch, key nahi.</li>
<li>IOS par IKEv1 phase 1 <code>MM_KEY_EXCH</code> par atka ho to aam taur par PSK mismatch hai.</li>
<li>Har interface par ek crypto map; naye peers ko naye sequence numbers; dynamic entries last.</li>
<li>NAT crypto ACL check se pehle hota hai; manual identity NAT PAT ke upar hona chahiye.</li>
<li><code>sysopt connection permit-vpn</code> default se on hai; decrypted traffic interface ACL bypass karta hai.</li>
<li>VTIs IPsec profile aur <code>tunnel protection</code> use karte hain; dono ends route-based hone chahiye.</li>
<li>IOS par <code>set ikev2-profile</code> crypto map entry ko IKEv2 use karwata hai.</li>
<li>Encaps up aur decaps zero: peer wapas nahi bhejta; uska NAT, routing aur ACL check karo.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Task</th><th>ASA</th><th>IOS</th></tr>
<tr><td>Phase 1</td><td><code>crypto ikev2 policy 10</code></td><td><code>crypto ikev2 proposal</code> + <code>policy</code> / <code>crypto isakmp policy 10</code></td></tr>
<tr><td>Phase 2</td><td><code>crypto ipsec ikev2 ipsec-proposal</code></td><td><code>crypto ipsec transform-set</code></td></tr>
<tr><td>Key</td><td><code>tunnel-group X ipsec-attributes</code></td><td><code>crypto ikev2 keyring</code> / <code>crypto isakmp key</code></td></tr>
<tr><td>Bind</td><td><code>crypto map M interface outside</code></td><td>Interface ke neeche <code>crypto map M</code></td></tr>
<tr><td>IKE enable</td><td><code>crypto ikev2 enable outside</code></td><td>automatic</td></tr>
<tr><td>Phase 1 state</td><td><code>show crypto ikev2 sa</code> / <code>ikev1 sa</code></td><td><code>show crypto ikev2 sa</code> / <code>isakmp sa</code></td></tr>
<tr><td>Counters</td><td><code>show crypto ipsec sa peer X</code></td><td><code>show crypto ipsec sa</code></td></tr>
<tr><td>Summary</td><td><code>show vpn-sessiondb l2l</code></td><td><code>show crypto session</code></td></tr>
<tr><td>Path test</td><td><code>packet-tracer input inside ...</code></td><td><code>ping ... source Gi0/1</code></td></tr>
<tr><td>Debug</td><td><code>debug crypto condition peer</code>, <code>debug crypto ikev2 protocol 127</code></td><td><code>debug crypto condition peer ipv4</code>, <code>debug crypto ikev2</code></td></tr></table>

<div class="eg"><p><b>Worked example: do minute ka self-test.</b> Bina notes ke, peer 100.64.52.2, LANs 10.30.0.0/24 aur 10.40.0.0/24, IKEv2 AES-256/SHA-256/group 14, key NKvpn2026 ke liye HQ ASA configuration likho, NAT exemption samet. Aapko objects, crypto ACL, ikev2 policy, ipsec-proposal, group-policy, local aur remote keys wala tunnel-group, chaar crypto map lines, interface binding, <code>crypto ikev2 enable outside</code> aur ek <code>nat</code> line likhni chahiye. Chapter 5 aur 6 se compare karo.</p></div>

<div class="warn"><p><b>Change ke end ki common galti.</b> Debugs chalte chhod dena ya packet captures active rakhna. Hamesha <code>undebug all</code> aur <code>no capture</code> se khatam karo, aur dono sides par <code>write memory</code> se configuration save karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions aksar ek output dikhakar agla step poochte hain. Pehchano ki output se kaunsi layer saabit hui hai (IKE SA, IPsec SA, counters) aur woh answer chuno jo agli layer check kare, na ki pehle se saabit layer ko dobara check kare.</p></div>

<div class="scn"><h4>Handover note</h4><p>Chhutti par ja rahe ek senior engineer ne night shift ke liye handover likha: "Branch tunnels OUTSIDE_MAP par IKEv2 crypto map entries 10 se 40 hain; partner IKEv1 entry 50 hai; NAT exemptions section 1 mein lines 1 se 5 hain; show vpn-sessiondb l2l se check karo, phir show crypto ipsec sa peer." Us raat jab ek branch giri, junior engineer ne note follow kiya, decaps atke hue paaye, exemptions ke upar naya PAT rule trace kiya, aur morning shift se pehle fix kar diya.</p><p><b>Seekh:</b> clear structure (entries, NAT lines, verification order) VPNs ko poori team ke liye supportable banata hai.</p></div>

<div class="iv"><p class="q">"ASA aur router ke beech scratch se site-to-site VPN configure karo. Har side par kya chahiye?"</p><p>Strong answer: parameters par agree karo, phir ASA par: crypto ACL, ikev2 policy, ipsec-proposal, keys wala ipsec-l2l tunnel-group, crypto map entry (match, peer, proposal, PFS), outside se bind, IKEv2 enable, aur PAT ke upar identity NAT exemption. Router par: IKEv2 proposal aur policy, keyring, profile, transform set, mirrored ACL, WAN interface par set ikev2-profile wala crypto map. IKE SA, dono taraf IPsec counters, aur vpn-sessiondb verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle parameters sheet par agree karo; ACLs, algorithms, PFS aur keys exactly mirror karo.</li>
<li>ASA build: policy, proposal, tunnel-group, crypto map ya VTI, IKE enable, NAT exemption.</li>
<li>Verification order: IKE SA, dono taraf IPsec counters, vpn-sessiondb, packet-tracer.</li>
<li>Paanch faults lagbhag har outage samjhate hain: proposal, PSK, ACL, NAT, routing.</li>
<li>Aage sec-ftd-vpn yahi ideas Threat Defense par lagata hai aur Secure Client ke saath remote access jodta hai.</li>
</ul></div>
`}};export{e as default};