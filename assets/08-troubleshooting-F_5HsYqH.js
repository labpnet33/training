var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow for BFD, restart and bundle problems`,hi:`BFD, restart aur bundle problems ka troubleshooting workflow`},body:{en:`
<p>A good doctor does not start with surgery. She asks where it hurts, checks the vital signs, forms a theory, and tests it. High availability problems need the same discipline, because the symptoms (a flapping adjacency, a short outage, a bundle with missing members) can come from the physical layer, the configuration or the software. Work from the bottom up and compare both ends.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Bottom-up workflow. Stop at the first layer that is not healthy."><rect x="20" y="30" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Layer 1</text><text x="71" y="80" text-anchor="middle" class="svg-muted" font-size="12">optics, LOS, errors</text><line x1="122" y1="65" x2="144" y2="65" stroke="#64748b" stroke-width="2"/><rect x="144" y="30" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Layer 2</text><text x="195" y="80" text-anchor="middle" class="svg-muted" font-size="12">LACP, member state</text><line x1="246" y1="65" x2="268" y2="65" stroke="#64748b" stroke-width="2"/><rect x="268" y="30" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. BFD</text><text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">session and timers</text><line x1="370" y1="65" x2="392" y2="65" stroke="#64748b" stroke-width="2"/><rect x="392" y="30" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Protocol</text><text x="443" y="80" text-anchor="middle" class="svg-muted" font-size="12">IGP, BGP, LDP</text><line x1="494" y1="65" x2="516" y2="65" stroke="#64748b" stroke-width="2"/><rect x="516" y="30" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="58" text-anchor="middle" class="svg-ink" font-size="13">5. HA state</text><text x="567" y="80" text-anchor="middle" class="svg-muted" font-size="12">redundancy, NSR</text></svg><p class="cap">Bottom-up workflow. Stop at the first layer that is not healthy.</p></div>
<div class="note"><p>This module has no lab, so this chapter lists the <b>commands to run and what to look for</b>. It deliberately shows no sample output. When you practise the same workflow in <code>spcor-isis</code>, <code>spcor-mpls-ldp</code>, <code>jncis-ha</code> and <code>encor-l2</code>, you will see real output for adjacencies, LACP and BFD-style detection.</p></div>
<h3>Problem 1: BFD session will not come Up</h3>
<ol>
<li>Check both ends: <code>show bfd neighbors details</code> (XE) or <code>show bfd session detail</code> (XR). A state of Down with no remote discriminator means the neighbour is not answering.</li>
<li>Is BFD enabled on <b>both</b> routers and on the correct interface? Compare timers.</li>
<li>For single-hop BFD, check that no device in the path rewrites TTL; the packet must arrive with TTL 255. A router in the middle makes a session multihop.</li>
<li>For multihop BFD, confirm the matching map or template and that both routers have a route to the other end's loopback.</li>
<li>Check an ACL or control-plane policer. Permit UDP 3784, 4784 and 3785 between the peers, and make sure CoPP is not dropping BFD.</li>
</ol>
<h3>Problem 2: BFD flaps and takes the IGP with it</h3>
<ul>
<li>Look at the BFD logs for the reason (detect timer expired, echo failed, administratively down).</li>
<li>Check interface errors and optical power: a marginal fibre drops three packets in a row at 50 ms intervals.</li>
<li>Check CPU and control-plane load; on software BFD platforms, heavy load delays packets.</li>
<li>Relax to 150 ms by 3 and see if the flapping stops. If so, the transport is noisy; fix the circuit and return to tighter timers later.</li>
<li>Remember that BFD flaps equal IGP flaps. Consider dampening so a bad link is held out of service until it is stable.</li>
</ul>
<h3>Problem 3: neighbours drop during a switchover</h3>
<ol>
<li>Was the redundancy state SSO with the standby hot before the event? On IOS XE: <code>show redundancy</code>.</li>
<li>Is graceful restart or NSR enabled on <b>both</b> sides, with matching flavour for OSPF (cisco or ietf)?</li>
<li>Is BFD enabled with aggressive timers on the restarting router? If BFD sessions fail during the switchover, the neighbours remove routes immediately and defeat the grace period. Check whether your platform keeps BFD alive in hardware during RP switchover.</li>
<li>Check BGP capabilities: <code>show bgp neighbors</code> lists graceful restart capability negotiated in OPEN. A change requires a session reset.</li>
<li>Look at logs for the reason of the adjacency loss after the switchover.</li>
</ol>
<h3>Problem 4: a bundle is down or has missing members</h3>
<ul>
<li>Check the members: speed, duplex, MTU, VLAN or encapsulation must be identical on all members and on both ends.</li>
<li>Check the LACP state on both ends: <code>show lacp neighbor</code> or <code>show bundle Bundle-Ether1</code> on XR; <code>show etherchannel summary</code> on XE. Look for a member reported as Standby, Down, or Waiting.</li>
<li>LACP mode: at least one end must be active. Two passive ends never form.</li>
<li>System ID mismatch: a member connected to a different device than the others is not allowed to join. Check cabling.</li>
<li>Check minimum-links: a bundle may be down because fewer members are up than the minimum, not because of a misconfiguration.</li>
</ul>
<h3>Problem 5: a bundle is up but traffic is lost or unbalanced</h3>
<ul>
<li>Compare member counters. One member at 90 percent while others idle means a large flow or a poor hash; adjust the hash fields or use entropy labels.</li>
<li>A member that is up but not forwarding: use per-member BFD, and compare per-member input and output counters on both ends.</li>
<li>Metric: a degraded bundle with unchanged IGP metric keeps attracting traffic; apply minimum-links.</li>
</ul>
<table class="cmp"><tr><th>Symptom</th><th>First command</th><th>Likely cause</th></tr><tr><td>BFD Down, no remote discriminator</td><td>show bfd neighbors details</td><td>Other end not configured, ACL or TTL issue</td></tr><tr><td>IGP flaps every few minutes</td><td>BFD log and interface errors</td><td>Aggressive timers on noisy circuit</td></tr><tr><td>Adjacency lost on RP switchover</td><td>show redundancy</td><td>No SSO, mismatched GR flavour, BFD fail</td></tr><tr><td>Bundle member Waiting or Standby</td><td>show lacp neighbor / etherchannel summary</td><td>Mode, system ID or parameter mismatch</td></tr><tr><td>Bundle up, partial loss</td><td>Per-member counters</td><td>Silent member, no per-member BFD</td></tr></table>
<div class="eg"><p><b>Worked example.</b> After a maintenance, IS-IS between P3 and P4 flaps every 20 minutes. Layer 1 is clean. BFD shows detect timer expired. The link crosses a transport provider. You raise the interval from 50 ms to 150 ms with multiplier 3, the flapping stops, and the provider later finds a micro-outage during their own protection switch. You agree a profile that survives their 50 ms protection switch, the usual SDH-style target.</p></div>
<div class="warn"><p><b>Common mistake.</b> Tuning timers before looking at the physical layer, or clearing sessions on a production core while the real fault is an optic. Always check errors, optical levels and the logs of both ends before changing configuration.</p></div>
<div class="exam"><p><b>Exam trap.</b> The troubleshooting questions give a symptom and ask for the <i>first</i> thing to check. Prefer the lowest healthy-layer check, and check both ends. For BFD down, "is it enabled on both ends with compatible timers" and "TTL or ACL in the path" are the favourite answers.</p></div>
<div class="scn"><h4>Switchover that was not seamless</h4><p>A planned RP switchover on PE7 dropped the OSPF adjacency to its P router for 30 seconds. The engineer found nsf cisco on PE7 and nsf ietf on the P router. A second finding: BFD was on at 50 ms by 3 and failed during the switchover. After the fix (both ietf, BFD timers relaxed on the restarting PE, and a test in the lab first) the next switchover was invisible.</p><p><b>Lesson:</b> check both flavours and the BFD interaction before blaming the hardware.</p></div>
<div class="iv"><p class="q">"A core link flaps intermittently and BFD shows detect time expired. How do you troubleshoot?"</p><p>Start at the physical layer: interface errors, optical power and logs on both ends. Then check for CPU spikes or control-plane policing that delays BFD packets, compare timers, and see if the path crosses a transport network. Relax the timers temporarily to confirm a noisy transport, and use dampening so a flapping link does not destabilise the IGP.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot bottom-up: physical, LACP, BFD, protocol, HA state; compare both ends.</li>
<li>BFD Down usually means one end is not configured, timers or templates differ, or UDP 3784 or 4784 is filtered.</li>
<li>Switchover drops come from missing SSO, mismatched GR flavour or BFD failing during the restart.</li>
<li>Bundle problems: mode, parameters, system ID, minimum-links, per-member counters.</li>
<li>Never tune before checking the physical layer.</li>
</ul></div>
`,hi:`
<p>Achha doctor operation se shuru nahi karta. Woh poochhta hai dard kahan hai, vital signs dekhta hai, theory banata hai aur use test karta hai. High availability problems mein bhi yahi discipline chahiye, kyunki symptoms (flapping adjacency, chhota outage, kam members wala bundle) physical layer, configuration ya software se aa sakte hain. Neeche se upar kaam karo aur dono ends compare karo.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Bottom-up workflow. Pehli unhealthy layer par ruk jao."><rect x="20" y="30" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Layer 1</text><text x="71" y="80" text-anchor="middle" class="svg-muted" font-size="12">optics, LOS, errors</text><line x1="122" y1="65" x2="144" y2="65" stroke="#64748b" stroke-width="2"/><rect x="144" y="30" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. Layer 2</text><text x="195" y="80" text-anchor="middle" class="svg-muted" font-size="12">LACP, member state</text><line x1="246" y1="65" x2="268" y2="65" stroke="#64748b" stroke-width="2"/><rect x="268" y="30" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. BFD</text><text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">session aur timers</text><line x1="370" y1="65" x2="392" y2="65" stroke="#64748b" stroke-width="2"/><rect x="392" y="30" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. Protocol</text><text x="443" y="80" text-anchor="middle" class="svg-muted" font-size="12">IGP, BGP, LDP</text><line x1="494" y1="65" x2="516" y2="65" stroke="#64748b" stroke-width="2"/><rect x="516" y="30" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="58" text-anchor="middle" class="svg-ink" font-size="13">5. HA state</text><text x="567" y="80" text-anchor="middle" class="svg-muted" font-size="12">redundancy, NSR</text></svg><p class="cap">Bottom-up workflow. Pehli unhealthy layer par ruk jao.</p></div>
<div class="note"><p>Is module ka lab nahi hai, isliye yeh chapter <b>chalane ke commands aur kya dekhna hai</b> yeh batata hai. Jaanbujhkar koi sample output nahi dikhaya. Jab aap yahi workflow <code>spcor-isis</code>, <code>spcor-mpls-ldp</code>, <code>jncis-ha</code> aur <code>encor-l2</code> mein practise karoge, adjacencies, LACP aur BFD-style detection ka real output dikhega.</p></div>
<h3>Problem 1: BFD session Up nahi aata</h3>
<ol>
<li>Dono ends check karo: <code>show bfd neighbors details</code> (XE) ya <code>show bfd session detail</code> (XR). Remote discriminator ke bina Down state matlab neighbour jawab nahi de raha.</li>
<li>Kya BFD <b>dono</b> routers aur sahi interface par enable hai? Timers compare karo.</li>
<li>Single-hop BFD ke liye check karo ki path mein koi device TTL rewrite na kare; packet TTL 255 ke saath pahunchna chahiye. Beech ka router session ko multihop bana deta hai.</li>
<li>Multihop BFD ke liye matching map ya template confirm karo aur dono routers ke paas doosre end ke loopback ka route ho.</li>
<li>ACL ya control-plane policer check karo. Peers ke beech UDP 3784, 4784 aur 3785 permit karo, aur dekho CoPP BFD drop to nahi kar raha.</li>
</ol>
<h3>Problem 2: BFD flap karta hai aur IGP ko saath le jaata hai</h3>
<ul>
<li>BFD logs mein wajah dekho (detect timer expired, echo failed, administratively down).</li>
<li>Interface errors aur optical power check karo: marginal fibre 50 ms intervals par lagatar teen packets gira deta hai.</li>
<li>CPU aur control-plane load check karo; software BFD platforms par heavy load packets delay karta hai.</li>
<li>150 ms guna 3 par relax karke dekho flapping rukti hai ya nahi. Ruk gayi to transport noisy hai; circuit theek karo aur baad mein tight timers par lautna.</li>
<li>Yaad rakho BFD flaps matlab IGP flaps. Dampening socho taaki kharab link stable hone tak service se bahar rahe.</li>
</ul>
<h3>Problem 3: switchover ke dauran neighbours gir jaate hain</h3>
<ol>
<li>Kya event se pehle redundancy state SSO thi aur standby hot tha? IOS XE par: <code>show redundancy</code>.</li>
<li>Kya graceful restart ya NSR <b>dono</b> sides par enabled hai, aur OSPF mein matching flavour (cisco ya ietf)?</li>
<li>Kya restarting router par aggressive timers ke saath BFD enabled hai? Switchover mein BFD sessions fail ho jaayein to neighbours routes turant hata dete hain aur grace period ko haraa dete hain. Check karo ki aapka platform RP switchover ke dauran BFD ko hardware mein zinda rakhta hai ya nahi.</li>
<li>BGP capabilities check karo: <code>show bgp neighbors</code> OPEN mein negotiate hui graceful restart capability dikhata hai. Badalne ke liye session reset chahiye.</li>
<li>Switchover ke baad adjacency loss ki wajah ke liye logs dekho.</li>
</ol>
<h3>Problem 4: bundle down hai ya members kam hain</h3>
<ul>
<li>Members check karo: speed, duplex, MTU, VLAN ya encapsulation sab members par aur dono ends par identical hona chahiye.</li>
<li>Dono ends par LACP state check karo: XR par <code>show lacp neighbor</code> ya <code>show bundle Bundle-Ether1</code>; XE par <code>show etherchannel summary</code>. Standby, Down ya Waiting member dhoondo.</li>
<li>LACP mode: kam se kam ek end active ho. Do passive ends kabhi form nahi hote.</li>
<li>System ID mismatch: jo member doosre device se juda hai use join karne nahi diya jaata. Cabling check karo.</li>
<li>Minimum-links check karo: bundle minimum se kam members up hone ki wajah se down ho sakta hai, misconfiguration ki wajah se nahi.</li>
</ul>
<h3>Problem 5: bundle up hai lekin traffic loss ya unbalanced</h3>
<ul>
<li>Member counters compare karo. Ek member 90 percent aur baaki idle matlab bada flow ya kharab hash; hash fields adjust karo ya entropy labels use karo.</li>
<li>Member jo up hai lekin forward nahi kar raha: per-member BFD use karo, aur dono ends par per-member input aur output counters compare karo.</li>
<li>Metric: degraded bundle jiska IGP metric nahi badla traffic attract karta rehta hai; minimum-links lagao.</li>
</ul>
<table class="cmp"><tr><th>Symptom</th><th>Pehla command</th><th>Likely cause</th></tr><tr><td>BFD Down, remote discriminator nahi</td><td>show bfd neighbors details</td><td>Doosra end configured nahi, ACL ya TTL issue</td></tr><tr><td>IGP har kuch minute mein flap</td><td>BFD log aur interface errors</td><td>Noisy circuit par aggressive timers</td></tr><tr><td>RP switchover par adjacency gayi</td><td>show redundancy</td><td>SSO nahi, GR flavour mismatch, BFD fail</td></tr><tr><td>Bundle member Waiting ya Standby</td><td>show lacp neighbor / etherchannel summary</td><td>Mode, system ID ya parameter mismatch</td></tr><tr><td>Bundle up, partial loss</td><td>Per-member counters</td><td>Silent member, per-member BFD nahi</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Maintenance ke baad P3 aur P4 ke beech IS-IS har 20 minute mein flap karta hai. Layer 1 clean hai. BFD detect timer expired dikhata hai. Link transport provider se guzarta hai. Aap interval 50 ms se 150 ms (multiplier 3) karte ho, flapping ruk jaati hai, aur provider ko baad mein apne protection switch mein micro-outage milta hai. Aap aisa profile agree karte ho jo unke 50 ms protection switch ko jhel sake, jo SDH-style ka usual target hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Physical layer dekhe bina timers tune karna, ya production core par sessions clear karna jabki asli fault optic hai. Configuration badalne se pehle errors, optical levels aur dono ends ke logs check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Troubleshooting questions symptom dete hain aur poochte hain ki <i>pehle</i> kya check karoge. Sabse neeche ki healthy-layer check chuno, aur dono ends check karo. BFD down ke liye "kya dono ends par compatible timers ke saath enabled hai" aur "path mein TTL ya ACL" favourite answers hain.</p></div>
<div class="scn"><h4>Switchover jo seamless nahi tha</h4><p>PE7 par planned RP switchover ne P router ke saath OSPF adjacency 30 second ke liye gira di. Engineer ne PE7 par nsf cisco aur P router par nsf ietf paya. Doosri finding: BFD 50 ms guna 3 par on tha aur switchover mein fail hua. Fix ke baad (dono ietf, restarting PE par BFD timers relax, aur pehle lab mein test) agla switchover invisible raha.</p><p><b>Lesson:</b> hardware ko blame karne se pehle dono flavours aur BFD interaction check karo.</p></div>
<div class="iv"><p class="q">"Core link intermittently flap karta hai aur BFD detect time expired dikhata hai. Troubleshoot kaise karoge?"</p><p>Physical layer se shuru karo: dono ends par interface errors, optical power aur logs. Phir CPU spikes ya control-plane policing check karo jo BFD packets delay kare, timers compare karo, aur dekho path transport network se to nahi guzarta. Noisy transport confirm karne ke liye timers temporarily relax karo, aur dampening use karo taaki flapping link IGP ko unstable na kare.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bottom-up troubleshoot: physical, LACP, BFD, protocol, HA state; dono ends compare karo.</li>
<li>BFD Down aksar matlab ek end configured nahi, timers ya templates alag, ya UDP 3784 ya 4784 filtered.</li>
<li>Switchover drops SSO na hone, GR flavour mismatch ya restart mein BFD fail hone se aate hain.</li>
<li>Bundle problems: mode, parameters, system ID, minimum-links, per-member counters.</li>
<li>Physical layer dekhe bina kabhi tune mat karo.</li>
</ul></div>
`}};export{e as default};