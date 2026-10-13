var e={id:`nsf-graceful-restart`,h:{en:`Graceful restart and NSF: keep forwarding while the control plane restarts`,hi:`Graceful restart aur NSF: control plane restart ho tab bhi forwarding chalti rahe`},body:{en:`
<p>Imagine a train driver who needs a short toilet break. The train keeps rolling on its tracks (forwarding), while a substitute takes the controls (control plane). The signal staff along the line (neighbours) must agree not to declare an emergency and stop all trains. <b>Non-Stop Forwarding (NSF)</b> is the train that keeps rolling. <b>Graceful restart (GR)</b> is the agreement with the signal staff that lets it happen.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="During graceful restart the helper keeps using the old routes while the restarting router rebuilds its state."><rect x="20" y="30" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Restarting router</text><text x="112.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">RP reloads, line cards keep FIB</text><line x1="205" y1="65" x2="227" y2="65" stroke="#64748b" stroke-width="2"/><rect x="227" y="30" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Helper neighbour</text><text x="319.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">keeps routes, marks them stale</text><line x1="412" y1="65" x2="434" y2="65" stroke="#64748b" stroke-width="2"/><rect x="434" y="30" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Restarting router</text><text x="526.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">re-forms adjacency, refreshes</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Packets keep flowing on the old FIB the whole time</text></svg><p class="cap">During graceful restart the helper keeps using the old routes while the restarting router rebuilds its state.</p></div>
<h3>The four roles and phases</h3>
<ul>
<li><b>Restarting router.</b> The router whose route processor fails or is deliberately switched over. Its line cards keep the FIB because the forwarding plane is separate.</li>
<li><b>Helper (receiving) router.</b> The neighbour that cooperates by keeping the routes learned from the restarting router instead of flushing them.</li>
<li><b>Restart signalling.</b> The restarting router tells the neighbours "I am restarting, do not tear down" and gives a <b>grace period</b> (a time limit).</li>
<li><b>Resynchronisation.</b> The restarting router relearns the topology and routes, then sends everything to the FIB again, and the helper removes anything still marked stale.</li>
</ul>
<h3>How each protocol does it</h3>
<table class="cmp"><tr><th>Protocol</th><th>Mechanism</th><th>Key point</th></tr><tr><td>OSPF</td><td>Cisco NSF (proprietary, uses link-local signalling) or IETF graceful restart, RFC 3623 (grace LSA, opaque type 9)</td><td>Neighbours must agree on the style; Cisco and IETF flavours do not interoperate</td></tr><tr><td>IS-IS</td><td>Cisco NSF, or IETF NSF with the restart TLV in IIH (RFC 5306)</td><td>The restart TLV carries the remaining time; T1, T2 and T3 timers control the process</td></tr><tr><td>BGP</td><td>Graceful restart capability (RFC 4724), plus the stalepath-time and restart-time</td><td>Helper keeps routes marked stale until End-of-RIB arrives</td></tr><tr><td>LDP</td><td>LDP graceful restart (RFC 3478), reconnect timeout and recovery time</td><td>Labels learned from the restarting peer are kept stale</td></tr><tr><td>RSVP-TE</td><td>RSVP hello based graceful restart, RFC 5495</td><td>Keeps TE LSP state while the node restarts</td></tr></table>
<h3>Configuration (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE</span>
router ospf 1
 nsf ietf
<span class="c"> ! or: nsf cisco</span>
router isis CORE
 nsf ietf
<span class="c"> ! or: nsf cisco</span>
router bgp 64512
 bgp graceful-restart
 bgp graceful-restart restart-time 120
 bgp graceful-restart stalepath-time 360
mpls ldp graceful-restart
<span class="c">!</span>
<span class="c">! IOS XR</span>
router ospf 1
 nsf ietf
router isis CORE
 nsf ietf
router bgp 64512
 bgp graceful-restart
 bgp graceful-restart restart-time 120
mpls ldp
 graceful-restart</pre>
<p>On the helper side, the helper capability is usually on by default for IETF GR. For OSPF, the neighbour must support the same type and you may need <code>nsf ietf helper</code> on routers that are not themselves NSF capable. For BGP, GR is negotiated per neighbour by a capability in the OPEN message, so changing it resets the session; plan it in a maintenance window.</p>
<h3>The hardware side: SSO and RPR</h3>
<p>NSF assumes the chassis has two route processors. In <b>Stateful Switchover (SSO)</b> mode, the standby processor stays hot: the running configuration and the Layer 2 state are synchronised, so a switchover takes seconds. The older <b>Route Processor Redundancy (RPR)</b> modes are slower because the standby must reload parts of its software. IOS XE configures <code>redundancy / mode sso</code>. IOS XR chassis run active and standby route processors as part of the platform design.</p>
<div class="eg"><p><b>Worked example.</b> PE1 runs BGP graceful restart with restart-time 120 and stalepath-time 360. Its route processor crashes. The line cards keep forwarding for the customer VPN. The BGP session to the route reflector drops. The reflector, as helper, marks all routes from PE1 as stale but keeps using them. The standby processor takes over and re-opens the session within 120 seconds, sends its routes and an End-of-RIB marker, and the reflector replaces the stale routes. Customers see nothing, as long as the network does not change during that window.</p></div>
<h3>Limits of graceful restart</h3>
<ul>
<li><b>Neighbours must be GR aware.</b> One non-supporting neighbour tears down the session as usual, and that part is not protected.</li>
<li><b>Topology changes during the grace period are not seen.</b> The restarting router has no fresh information, so if another link fails at the same time, traffic may follow stale routes.</li>
<li><b>The restart is visible to the neighbours.</b> The adjacency is re-formed, so there is signalling. This is the main contrast with NSR in the next chapter.</li>
<li><b>BFD can defeat it.</b> If BFD runs on the restarting processor and goes Down, the neighbour will not wait for the grace period.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Enabling GR on one side and calling it done. Both ends need the capability, and for OSPF both ends must use the same flavour (cisco or ietf). Also, setting a very long restart-time hides real node failures: traffic is sent to a dead router until the timer ends.</p></div>
<div class="exam"><p><b>Exam trap.</b> NSF is a forwarding behaviour; graceful restart is the protocol extension that enables it. IS-IS IETF NSF uses the restart TLV, OSPF IETF uses grace LSAs, BGP uses the graceful-restart capability and End-of-RIB. The helper keeps routes stale; it does not recompute anything.</p></div>
<div class="scn"><h4>The upgrade window that dropped a VPN</h4><p>During a software upgrade, PE2 switched route processors. OSPF used nsf cisco on PE2 while its upstream P router had nsf ietf only. The neighbour did not recognise the Cisco signalling, tore down the adjacency, and customer traffic dropped for about 40 seconds. After the review both routers were set to nsf ietf, the upgrade was repeated in the next window, and the switchover was invisible to customers.</p><p><b>Lesson:</b> GR flavours must match on both sides, and a switchover test must precede the real change.</p></div>
<div class="iv"><p class="q">"What is the difference between NSF and graceful restart?"</p><p>NSF is the capability of a router to keep forwarding packets using its existing FIB while its control plane restarts or switches over. Graceful restart is the protocol extension, for example for OSPF, IS-IS, BGP and LDP, that tells neighbours not to tear down state during the restart. NSF needs a redundant processor and helper neighbours. Add that topology changes during the grace period are not noticed and that this is the main weakness compared with NSR.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSF keeps forwarding on the old FIB; graceful restart tells neighbours to keep routes stale.</li>
<li>OSPF uses Cisco NSF or IETF (RFC 3623); IS-IS has Cisco and IETF (RFC 5306); BGP uses the GR capability and End-of-RIB; LDP uses RFC 3478.</li>
<li>Both ends must support the same flavour.</li>
<li>SSO keeps the standby hot; RPR is slower.</li>
<li>GR is visible to neighbours and blind to topology changes during the grace period.</li>
</ul></div>
`,hi:`
<p>Ek train driver ki socho jise chhota break chahiye. Train apni track par chalti rehti hai (forwarding), jabki substitute controls sambhalta hai (control plane). Line ke signal staff (neighbours) ko agree karna padta hai ki emergency declare karke saari trains na roken. <b>Non-Stop Forwarding (NSF)</b> woh train hai jo chalti rehti hai. <b>Graceful restart (GR)</b> signal staff ke saath woh agreement hai jo yeh hone deta hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Graceful restart ke dauran helper purane routes use karta rehta hai jabki restarting router apni state dobara banata hai."><rect x="20" y="30" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Restarting router</text><text x="112.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">RP reload, line cards FIB rakhte hain</text><line x1="205" y1="65" x2="227" y2="65" stroke="#64748b" stroke-width="2"/><rect x="227" y="30" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Helper neighbour</text><text x="319.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">routes rakhta hai, stale mark karta hai</text><line x1="412" y1="65" x2="434" y2="65" stroke="#64748b" stroke-width="2"/><rect x="434" y="30" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Restarting router</text><text x="526.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">adjacency dobara banata hai, refresh</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Packets poore time purane FIB par chalte rehte hain</text></svg><p class="cap">Graceful restart ke dauran helper purane routes use karta rehta hai jabki restarting router apni state dobara banata hai.</p></div>
<h3>Chaar roles aur phases</h3>
<ul>
<li><b>Restarting router.</b> Woh router jiska route processor fail hota hai ya jaanbujhkar switch hota hai. Uske line cards FIB rakhte hain kyunki forwarding plane alag hai.</li>
<li><b>Helper (receiving) router.</b> Woh neighbour jo restarting router se seekhe routes flush karne ki jagah rakh kar cooperate karta hai.</li>
<li><b>Restart signalling.</b> Restarting router neighbours ko batata hai "main restart ho raha hoon, girana mat" aur ek <b>grace period</b> (time limit) deta hai.</li>
<li><b>Resynchronisation.</b> Restarting router topology aur routes dobara seekhta hai, phir sab kuch FIB mein bhejta hai, aur helper jo abhi bhi stale mark hai use hata deta hai.</li>
</ul>
<h3>Har protocol yeh kaise karta hai</h3>
<table class="cmp"><tr><th>Protocol</th><th>Mechanism</th><th>Key point</th></tr><tr><td>OSPF</td><td>Cisco NSF (proprietary, link-local signalling) ya IETF graceful restart, RFC 3623 (grace LSA, opaque type 9)</td><td>Neighbours ko same style par agree karna padta hai; Cisco aur IETF flavours interoperate nahi karte</td></tr><tr><td>IS-IS</td><td>Cisco NSF, ya IIH mein restart TLV ke saath IETF NSF (RFC 5306)</td><td>Restart TLV bacha hua time carry karta hai; T1, T2, T3 timers process control karte hain</td></tr><tr><td>BGP</td><td>Graceful restart capability (RFC 4724), saath mein stalepath-time aur restart-time</td><td>Helper End-of-RIB aane tak routes stale rakhta hai</td></tr><tr><td>LDP</td><td>LDP graceful restart (RFC 3478), reconnect timeout aur recovery time</td><td>Restarting peer se seekhe labels stale rakhe jaate hain</td></tr><tr><td>RSVP-TE</td><td>RSVP hello based graceful restart, RFC 5495</td><td>Node restart hone par TE LSP state rakhta hai</td></tr></table>
<h3>Configuration (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE</span>
router ospf 1
 nsf ietf
<span class="c"> ! ya: nsf cisco</span>
router isis CORE
 nsf ietf
<span class="c"> ! ya: nsf cisco</span>
router bgp 64512
 bgp graceful-restart
 bgp graceful-restart restart-time 120
 bgp graceful-restart stalepath-time 360
mpls ldp graceful-restart
<span class="c">!</span>
<span class="c">! IOS XR</span>
router ospf 1
 nsf ietf
router isis CORE
 nsf ietf
router bgp 64512
 bgp graceful-restart
 bgp graceful-restart restart-time 120
mpls ldp
 graceful-restart</pre>
<p>Helper side par IETF GR ke liye helper capability aksar default on hoti hai. OSPF mein neighbour ko same type support karna padta hai aur jo routers khud NSF capable nahi hain unpar <code>nsf ietf helper</code> lagana pad sakta hai. BGP mein GR har neighbour par OPEN message ki capability se negotiate hota hai, isliye ise badalne se session reset hota hai; maintenance window mein plan karo.</p>
<h3>Hardware side: SSO aur RPR</h3>
<p>NSF maan kar chalta hai ki chassis mein do route processors hain. <b>Stateful Switchover (SSO)</b> mode mein standby processor hot rehta hai: running configuration aur Layer 2 state synchronised hoti hai, isliye switchover seconds mein hota hai. Purane <b>Route Processor Redundancy (RPR)</b> modes slow hain kyunki standby ko apne software ke kuch hisse reload karne padte hain. IOS XE par <code>redundancy / mode sso</code> configure hota hai. IOS XR chassis par active aur standby route processors platform design ka hissa hain.</p>
<div class="eg"><p><b>Worked example.</b> PE1 par BGP graceful restart restart-time 120 aur stalepath-time 360 ke saath chal raha hai. Uska route processor crash hota hai. Line cards customer VPN ke liye forwarding karte rehte hain. Route reflector ke saath BGP session gir jaata hai. Reflector, helper ke roop mein, PE1 ke saare routes stale mark karta hai lekin use karta rehta hai. Standby processor takeover karke 120 second ke andar session dobara kholta hai, routes aur End-of-RIB marker bhejta hai, aur reflector stale routes ko replace kar deta hai. Customers ko kuch nahi dikhta, bas us window mein network mein koi change nahi hona chahiye.</p></div>
<h3>Graceful restart ki limits</h3>
<ul>
<li><b>Neighbours GR aware hone chahiye.</b> Ek non-supporting neighbour session normal tarah girata hai, aur woh hissa protected nahi hota.</li>
<li><b>Grace period mein topology changes nahi dikhte.</b> Restarting router ke paas fresh information nahi hoti, isliye usi samay koi doosra link fail ho to traffic stale routes follow kar sakta hai.</li>
<li><b>Restart neighbours ko dikhta hai.</b> Adjacency dobara banti hai, isliye signalling hoti hai. Agle chapter ke NSR se yahi main contrast hai.</li>
<li><b>BFD ise haraa sakta hai.</b> Agar BFD restarting processor par chalta hai aur Down ho jaaye to neighbour grace period ka intezaar nahi karega.</li>
</ul>
<div class="warn"><p><b>Common mistake.</b> Ek side par GR enable karke kaam khatam maan lena. Dono ends ko capability chahiye, aur OSPF mein dono ends ko same flavour (cisco ya ietf) chahiye. Bahut lamba restart-time asli node failure chhupa deta hai: timer khatam hone tak traffic dead router ko bheja jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> NSF forwarding behaviour hai; graceful restart woh protocol extension hai jo use enable karta hai. IS-IS IETF NSF restart TLV use karta hai, OSPF IETF grace LSAs, BGP graceful-restart capability aur End-of-RIB. Helper routes stale rakhta hai; kuch recompute nahi karta.</p></div>
<div class="scn"><h4>Upgrade window jisne VPN gira diya</h4><p>Software upgrade ke dauran PE2 ne route processors switch kiye. PE2 par OSPF nsf cisco use kar raha tha jabki upstream P router sirf nsf ietf par tha. Neighbour ne Cisco signalling pehchani nahi, adjacency gira di, aur customer traffic lagbhag 40 second drop hua. Review ke baad dono routers nsf ietf par set kiye gaye, agli window mein upgrade dobara hua, aur switchover customers ko dikha hi nahi.</p><p><b>Lesson:</b> GR flavours dono sides par match karne chahiye, aur asli change se pehle switchover test hona chahiye.</p></div>
<div class="iv"><p class="q">"NSF aur graceful restart mein kya difference hai?"</p><p>NSF router ki woh capability hai ki uska control plane restart ya switchover ho tab bhi woh apne existing FIB se packets forward karta rahe. Graceful restart protocol extension hai, jaise OSPF, IS-IS, BGP aur LDP ke liye, jo neighbours ko restart ke dauran state na girane ko kehta hai. NSF ko redundant processor aur helper neighbours chahiye. Jodo ki grace period mein topology changes notice nahi hote aur NSR ke muqable yahi main weakness hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NSF purane FIB par forwarding rakhta hai; graceful restart neighbours ko routes stale rakhne ko kehta hai.</li>
<li>OSPF Cisco NSF ya IETF (RFC 3623); IS-IS Cisco aur IETF (RFC 5306); BGP GR capability aur End-of-RIB; LDP RFC 3478.</li>
<li>Dono ends ko same flavour support karna chahiye.</li>
<li>SSO standby ko hot rakhta hai; RPR slow hai.</li>
<li>GR neighbours ko dikhta hai aur grace period mein topology changes ke liye andha hai.</li>
</ul></div>
`}};export{e as default};