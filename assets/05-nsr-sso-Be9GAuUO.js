var e={id:`nsr-sso`,h:{en:`NSR, SSO and ISSU: invisible control-plane recovery`,hi:`NSR, SSO aur ISSU: invisible control-plane recovery`},body:{en:`
<p>Graceful restart is like telling every customer "our cashier is changing, please wait". <b>Non-Stop Routing (NSR)</b> is a second cashier who watches every transaction on a shared screen, so when the first one leaves the second continues mid-sentence and nobody queues. The neighbours never see a restart. That is the big difference: NSR needs <b>no cooperation</b> from other routers.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="With NSR the active processor continuously copies protocol state to the standby. After a switchover the standby continues the same sessions."><rect x="20" y="30" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Active RP</text><text x="112.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">runs IS-IS, BGP, LDP</text><line x1="205" y1="65" x2="227" y2="65" stroke="#64748b" stroke-width="2"/><rect x="227" y="30" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Checkpoint</text><text x="319.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">state sync over backplane</text><line x1="412" y1="65" x2="434" y2="65" stroke="#64748b" stroke-width="2"/><rect x="434" y="30" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Standby RP</text><text x="526.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">hot copy of protocol state</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">TCP sessions and adjacencies survive the switchover</text></svg><p class="cap">With NSR the active processor continuously copies protocol state to the standby. After a switchover the standby continues the same sessions.</p></div>
<h3>What exactly is synchronised</h3>
<p>With SSO, the standby processor boots to the same software image and receives the configuration and platform state. NSR adds protocol state on top: the BGP table and TCP session state, the IS-IS or OSPF link-state database and adjacency information, LDP bindings and sessions. Because the standby already holds the neighbour state, after a switchover it carries on with the existing TCP connection or adjacency. No GR capability is exchanged, so a neighbour that does not support graceful restart is still protected.</p>
<table class="cmp"><tr><th>Feature</th><th>NSF with graceful restart</th><th>NSR</th></tr><tr><td>Neighbour support needed</td><td>Yes, helper role</td><td>No</td></tr><tr><td>Neighbour sees the restart</td><td>Yes, session or adjacency flaps</td><td>No, hidden from the neighbour</td></tr><tr><td>Topology changes during switchover</td><td>Not noticed during grace period</td><td>Handled, state stays up to date</td></tr><tr><td>Resource cost</td><td>Low</td><td>Higher: memory and CPU for state sync</td></tr><tr><td>Typical use</td><td>Mixed vendor networks</td><td>Homogeneous SP core and PE routers</td></tr></table>
<h3>Configuration (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE</span>
redundancy
 mode sso
<span class="c">!</span>
router bgp 64512
 bgp graceful-restart
 neighbor 192.0.2.2 ha-mode graceful-restart
<span class="c">!</span>
router isis CORE
 nsr
<span class="c">!</span>
router ospf 1
 nsr
<span class="c">!</span>
mpls ldp nsr
<span class="c">!</span>
<span class="c">! IOS XR</span>
router isis CORE
 nsr
router ospf 1
 nsr
router bgp 64512
 nsr
mpls ldp
 nsr</pre>
<p>On IOS XR, <code>nsr</code> is a single command under each protocol, and most XR platforms with dual route processors support it for IS-IS, OSPF, BGP and LDP. On IOS XE, support depends on platform and release; BGP NSR is enabled per neighbour with <code>ha-mode graceful-restart</code> in some trains and with <code>nsr</code> in others. Always check the feature support for your platform in the release notes.</p>
<h3>NSF and NSR together</h3>
<p>Many designs enable both. NSR is the first line: if the switchover is clean the neighbours never notice. If NSR cannot recover a session for any reason, graceful restart is the fallback, and the neighbour keeps the stale routes for the grace period. The two mechanisms do not conflict. The important rule is that a given session uses one or the other at a time, as the protocol implementation decides.</p>
<h3>ISSU and in-service upgrades</h3>
<p><b>In-Service Software Upgrade (ISSU)</b> takes the idea further: upgrade the standby, switch over, upgrade the former active, all without a traffic outage. It depends on SSO, NSF or NSR, and a supported version pair. ISSU is platform specific and has strict version compatibility tables, so SP engineers prefer to practise it in a lab first and plan an upgrade path rather than assume the feature always works.</p>
<div class="eg"><p><b>Worked example.</b> PE1 has 800 VPNv4 routes learned from a route reflector and 40 eBGP sessions towards customers. A line card fault triggers an RP switchover. With BGP NSR the standby already holds the TCP session state and table, so after the switchover (a few seconds) the sessions to the reflector and customers continue without a reset, and no customer sees a withdrawal. With only graceful restart, the sessions would drop and re-form, and the customers needed to support GR to avoid any loss.</p></div>
<ul>
<li><b>Check state before the window.</b> Verify that the standby is ready (on IOS XE, <code>show redundancy</code> reports standby hot) and that NSR shows as synchronised per protocol.</li>
<li><b>Test a manual switchover</b> during a quiet window with <code>redundancy force-switchover</code> on IOS XE or <code>redundancy switchover</code> on IOS XR.</li>
<li><b>Watch the resources.</b> NSR doubles some memory and uses CPU for checkpointing on large BGP tables.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Assuming NSR is on because the chassis has two route processors. NSR is configured per protocol, and some features such as certain BGP address families or unusual configuration may not be supported by NSR. Also, a software bug that crashes the active processor may crash the standby with the same state.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which feature requires no help from neighbours?" is NSR. "Which feature is described by RFC 4724 and an End-of-RIB marker?" is BGP graceful restart. SSO is the hardware redundancy state; NSF and NSR are both built on it. Do not say NSR replaces SSO.</p></div>
<div class="scn"><h4>Route processor crash at the peak hour</h4><p>At 20:00 an active RP on PE5 crashed. The team had enabled SSO and NSR for BGP, IS-IS and LDP on all PE routers the previous quarter. The standby took over in seconds, forwarding continued and the monitoring system recorded no BGP session reset towards the reflectors. In a test a year earlier, only graceful restart was enabled, and two customer sessions that did not support GR dropped.</p><p><b>Lesson:</b> NSR hides the failure from every neighbour, including those without graceful restart support.</p></div>
<div class="iv"><p class="q">"When would you choose NSR over graceful restart, and can you run both?"</p><p>NSR when the platform and software support it, because it requires no cooperation from neighbours and keeps topology changes consistent. Graceful restart when you need interoperability with neighbours or platforms that do not support NSR. You can configure both: NSR is the first line and graceful restart is the fallback. Mention the extra resource cost of NSR and the need for SSO hardware.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSR copies protocol state to a standby processor so neighbours see no restart.</li>
<li>NSF with graceful restart needs helper neighbours; NSR does not.</li>
<li>SSO is the redundancy mode both depend on; RPR is slower.</li>
<li>IOS XR: nsr under IS-IS, OSPF, BGP and LDP. IOS XE support varies by platform.</li>
<li>ISSU upgrades without outage but needs supported version pairs.</li>
</ul></div>
`,hi:`
<p>Graceful restart aisa hai jaise har customer ko bolna "hamara cashier badal raha hai, kripya ruko". <b>Non-Stop Routing (NSR)</b> doosra cashier hai jo shared screen par har transaction dekhta rehta hai, isliye pehla jaata hai to doosra beech ke sentence se aage badhta hai aur koi queue mein nahi lagta. Neighbours ko restart dikhta hi nahi. Yahi bada fark hai: NSR ko doosre routers ka <b>koi cooperation</b> nahi chahiye.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="NSR mein active processor lagatar protocol state standby ko copy karta hai. Switchover ke baad standby wahi sessions jaari rakhta hai."><rect x="20" y="30" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Active RP</text><text x="112.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">IS-IS, BGP, LDP chalata hai</text><line x1="205" y1="65" x2="227" y2="65" stroke="#64748b" stroke-width="2"/><rect x="227" y="30" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Checkpoint</text><text x="319.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">backplane par state sync</text><line x1="412" y1="65" x2="434" y2="65" stroke="#64748b" stroke-width="2"/><rect x="434" y="30" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Standby RP</text><text x="526.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">protocol state ki hot copy</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">TCP sessions aur adjacencies switchover mein bach jaate hain</text></svg><p class="cap">NSR mein active processor lagatar protocol state standby ko copy karta hai. Switchover ke baad standby wahi sessions jaari rakhta hai.</p></div>
<h3>Exactly kya synchronise hota hai</h3>
<p>SSO mein standby processor wahi software image boot karta hai aur configuration aur platform state paata hai. NSR upar se protocol state jodta hai: BGP table aur TCP session state, IS-IS ya OSPF link-state database aur adjacency information, LDP bindings aur sessions. Standby ke paas neighbour state pehle se hoti hai, isliye switchover ke baad woh existing TCP connection ya adjacency ke saath aage badhta hai. GR capability exchange nahi hoti, isliye jo neighbour graceful restart support nahi karta woh bhi protected rehta hai.</p>
<table class="cmp"><tr><th>Feature</th><th>NSF with graceful restart</th><th>NSR</th></tr><tr><td>Neighbour support chahiye</td><td>Haan, helper role</td><td>Nahi</td></tr><tr><td>Neighbour ko restart dikhta hai</td><td>Haan, session ya adjacency flap hoti hai</td><td>Nahi, neighbour se chhupa rehta hai</td></tr><tr><td>Switchover ke dauran topology changes</td><td>Grace period mein notice nahi hote</td><td>Handle hote hain, state up to date rehti hai</td></tr><tr><td>Resource cost</td><td>Kam</td><td>Zyada: state sync ke liye memory aur CPU</td></tr><tr><td>Typical use</td><td>Mixed vendor networks</td><td>Homogeneous SP core aur PE routers</td></tr></table>
<h3>Configuration (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE</span>
redundancy
 mode sso
<span class="c">!</span>
router bgp 64512
 bgp graceful-restart
 neighbor 192.0.2.2 ha-mode graceful-restart
<span class="c">!</span>
router isis CORE
 nsr
<span class="c">!</span>
router ospf 1
 nsr
<span class="c">!</span>
mpls ldp nsr
<span class="c">!</span>
<span class="c">! IOS XR</span>
router isis CORE
 nsr
router ospf 1
 nsr
router bgp 64512
 nsr
mpls ldp
 nsr</pre>
<p>IOS XR par <code>nsr</code> har protocol ke neeche ek single command hai, aur dual route processors wale zyadatar XR platforms IS-IS, OSPF, BGP aur LDP ke liye ise support karte hain. IOS XE par support platform aur release par depend karta hai; BGP NSR kuch trains mein neighbour par <code>ha-mode graceful-restart</code> se aur kuch mein <code>nsr</code> se enable hota hai. Apne platform ka feature support release notes mein hamesha check karo.</p>
<h3>NSF aur NSR saath mein</h3>
<p>Kai designs dono enable karte hain. NSR pehli line hai: switchover clean ho to neighbours ko pata hi nahi chalta. Agar NSR kisi wajah se session recover na kar sake to graceful restart fallback hai, aur neighbour grace period tak stale routes rakhta hai. Dono mechanisms conflict nahi karte. Zaroori rule yeh hai ki ek session ek samay mein ek hi use karta hai, jo protocol implementation tay karti hai.</p>
<h3>ISSU aur in-service upgrades</h3>
<p><b>In-Service Software Upgrade (ISSU)</b> idea ko aage le jaata hai: standby upgrade karo, switchover karo, purane active ko upgrade karo, aur traffic outage na ho. Yeh SSO, NSF ya NSR, aur supported version pair par depend karta hai. ISSU platform specific hai aur uski version compatibility tables strict hoti hain, isliye SP engineers pehle lab mein practise karte hain aur upgrade path plan karte hain, yeh nahi maante ki feature hamesha chalega.</p>
<div class="eg"><p><b>Worked example.</b> PE1 ke paas route reflector se seekhe 800 VPNv4 routes aur customers ki taraf 40 eBGP sessions hain. Line card fault RP switchover trigger karta hai. BGP NSR ke saath standby ke paas TCP session state aur table pehle se hai, isliye switchover (kuch seconds) ke baad reflector aur customers ke sessions bina reset ke chalte rehte hain, aur kisi customer ko withdrawal nahi dikhta. Sirf graceful restart ke saath sessions gir kar dobara bante, aur customers ko loss se bachne ke liye GR support karna padta.</p></div>
<ul>
<li><b>Window se pehle state check karo.</b> Verify karo ki standby ready hai (IOS XE par <code>show redundancy</code> standby hot batata hai) aur NSR har protocol ke liye synchronised dikhta hai.</li>
<li><b>Manual switchover test karo</b> shaant window mein IOS XE par <code>redundancy force-switchover</code> ya IOS XR par <code>redundancy switchover</code> se.</li>
<li><b>Resources dekho.</b> Bade BGP tables par NSR kuch memory double karta hai aur checkpointing ke liye CPU use karta hai.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki NSR on hai kyunki chassis mein do route processors hain. NSR har protocol ke liye configure hota hai, aur kuch features jaise kuch BGP address families ya unusual configuration NSR support nahi karte. Ek aur baat: software bug jo active processor crash kare, wahi state ke saath standby ko bhi crash kar sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kaunsa feature neighbours ki madad ke bina kaam karta hai?" jawab NSR. "Kaunsa feature RFC 4724 aur End-of-RIB marker se describe hota hai?" BGP graceful restart. SSO hardware redundancy state hai; NSF aur NSR dono ispar bane hain. Yeh mat kaho ki NSR SSO ko replace karta hai.</p></div>
<div class="scn"><h4>Peak hour par route processor crash</h4><p>Raat 20:00 par PE5 ka active RP crash hua. Team ne pichhli quarter mein saare PE routers par BGP, IS-IS aur LDP ke liye SSO aur NSR enable kiya tha. Standby seconds mein takeover kar gaya, forwarding chalti rahi aur monitoring system ne reflectors ki taraf koi BGP session reset record nahi kiya. Ek saal pehle ke test mein sirf graceful restart enabled tha, aur do customer sessions jo GR support nahi karte the gir gaye the.</p><p><b>Lesson:</b> NSR failure ko har neighbour se chhupata hai, unse bhi jo graceful restart support nahi karte.</p></div>
<div class="iv"><p class="q">"NSR ko graceful restart par kab chunoge, aur kya dono chala sakte ho?"</p><p>NSR tab jab platform aur software support karein, kyunki ise neighbours ka cooperation nahi chahiye aur topology changes consistent rehte hain. Graceful restart tab jab neighbours ya platforms se interoperability chahiye jo NSR support nahi karte. Dono configure kar sakte ho: NSR pehli line hai aur graceful restart fallback. NSR ka extra resource cost aur SSO hardware ki zarurat batao.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSR protocol state standby processor ko copy karta hai, isliye neighbours ko restart nahi dikhta.</li>
<li>NSF with graceful restart ko helper neighbours chahiye; NSR ko nahi.</li>
<li>SSO woh redundancy mode hai jispar dono depend karte hain; RPR slow hai.</li>
<li>IOS XR: IS-IS, OSPF, BGP, LDP ke neeche nsr. IOS XE support platform par depend karta hai.</li>
<li>ISSU bina outage upgrade karta hai lekin supported version pairs chahiye.</li>
</ul></div>
`}};export{e as default};