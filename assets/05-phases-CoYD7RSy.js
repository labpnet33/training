var e={id:`phases`,h:{en:`DMVPN phases 1, 2 and 3 compared`,hi:`DMVPN phases 1, 2 aur 3 ki tulna`},body:{en:`
<p>Back at the courier company, there are three ways to run the branches. In the first, every parcel goes through head office, always. In the second, each branch keeps the full list of every branch's delivery area and asks head office only for today's street address. In the third, branches know very little; head office forwards the first parcel and then calls the sender: "next time, drive straight to Kochi". These are DMVPN phases 1, 2 and 3.</p>

<p>A <b>phase</b> is not a software version. It is a design choice that decides <b>whether spoke-to-spoke tunnels exist</b> and <b>what the routing protocol must advertise</b> to make them happen.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Traffic path in the three DMVPN phases">
<text x="105" y="18" text-anchor="middle" class="svg-ink" font-size="13">Phase 1</text><text x="320" y="18" text-anchor="middle" class="svg-ink" font-size="13">Phase 2</text><text x="535" y="18" text-anchor="middle" class="svg-ink" font-size="13">Phase 3</text>
<rect x="75" y="30" width="60" height="30" rx="6" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="12">HUB</text>
<rect x="290" y="30" width="60" height="30" rx="6" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="12">HUB</text>
<rect x="505" y="30" width="60" height="30" rx="6" fill="#bae6fd"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="12">HUB</text>
<rect x="15" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="45" y="170" text-anchor="middle" class="svg-ink" font-size="12">S1</text>
<rect x="135" y="150" width="60" height="30" rx="6" fill="#fde68a"/><text x="165" y="170" text-anchor="middle" class="svg-ink" font-size="12">S2</text>
<rect x="230" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="260" y="170" text-anchor="middle" class="svg-ink" font-size="12">S1</text>
<rect x="350" y="150" width="60" height="30" rx="6" fill="#fde68a"/><text x="380" y="170" text-anchor="middle" class="svg-ink" font-size="12">S2</text>
<rect x="445" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="475" y="170" text-anchor="middle" class="svg-ink" font-size="12">S1</text>
<rect x="565" y="150" width="60" height="30" rx="6" fill="#fde68a"/><text x="595" y="170" text-anchor="middle" class="svg-ink" font-size="12">S2</text>
<line x1="45" y1="150" x2="95" y2="60" stroke="#64748b" stroke-width="2"/><line x1="115" y1="60" x2="165" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="150" x2="310" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="330" y1="60" x2="380" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="290" y1="172" x2="350" y2="172" stroke="#64748b" stroke-width="3"/>
<line x1="475" y1="150" x2="525" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="545" y1="60" x2="595" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="505" y1="172" x2="565" y2="172" stroke="#64748b" stroke-width="3"/>
<text x="105" y="205" text-anchor="middle" class="svg-muted" font-size="12">always via hub</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">next hop = far spoke</text>
<text x="535" y="205" text-anchor="middle" class="svg-muted" font-size="12">next hop = hub, then</text>
<text x="105" y="225" text-anchor="middle" class="svg-accent" font-size="12">summaries OK</text>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="12">no summaries</text>
<text x="535" y="225" text-anchor="middle" class="svg-accent" font-size="12">redirect + shortcut</text>
</svg><p class="cap">Thick line = data path after the spoke-to-spoke tunnel is built. Dashed = only the first packets or control traffic.</p></div>

<h3>Phase 1: hub-and-spoke only</h3>
<p>Spokes may use point-to-point GRE (<code>tunnel destination</code> = hub NBMA) or mGRE, but they never resolve each other. All spoke-to-spoke traffic is routed through the hub. The routing protocol only needs to give spokes a path to the hub, so the hub can send a <b>default route or a summary</b>. Phase 1 gives you zero-touch hub configuration but no direct paths. It is the simplest design and is still used where all traffic goes to the data centre anyway.</p>

<h3>Phase 2: spoke-initiated spoke-to-spoke</h3>
<p>All spokes use mGRE. When SPOKE1 has a route to 10.3.3.0/24 with next hop <b>172.16.100.3</b> (SPOKE2's tunnel address), it has no NBMA mapping for that next hop, so it sends a Resolution Request and builds a direct tunnel. The trigger is the <b>next hop in the routing table</b>. Therefore the IGP must <b>preserve the original next hop</b> when the hub re-advertises spoke routes, and the hub must <b>not summarise</b> (a summary would carry the hub as next hop). Every spoke carries every spoke prefix. That is the main scaling limit of phase 2.</p>

<h3>Phase 3: hub-initiated spoke-to-spoke</h3>
<p>All spokes use mGRE and the routing can point at the hub (summaries and default routes are allowed). The first packet goes SPOKE1 to HUB to SPOKE2. The hub notices the packet entered and left the <b>same</b> mGRE interface, so it sends an NHRP <b>Traffic Indication</b> (redirect) to SPOKE1. SPOKE1, with <code>ip nhrp shortcut</code>, resolves the destination and installs a shortcut: either an NHRP route (code H) or a next-hop override (%) on the existing route. Phase 3 combines direct paths with small routing tables, which is why it is Cisco's recommended design.</p>

<table class="cmp"><tr><th></th><th>Phase 1</th><th>Phase 2</th><th>Phase 3</th></tr>
<tr><td>Spoke tunnel type</td><td>GRE or mGRE</td><td>mGRE</td><td>mGRE</td></tr>
<tr><td>Spoke-to-spoke tunnel</td><td>No</td><td>Yes, spoke triggers</td><td>Yes, hub triggers</td></tr>
<tr><td>Trigger</td><td>none</td><td>next hop = far spoke tunnel IP</td><td>Traffic Indication from hub</td></tr>
<tr><td>Summary / default from hub</td><td>Yes</td><td>No</td><td>Yes</td></tr>
<tr><td>Key commands</td><td>basic NHRP</td><td>basic NHRP + IGP next-hop preservation</td><td><code>ip nhrp redirect</code> (hub), <code>ip nhrp shortcut</code> (spokes)</td></tr>
<tr><td>OSPF network type</td><td>point-to-multipoint</td><td>broadcast (hub DR) or non-broadcast</td><td>point-to-multipoint (or broadcast)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A bank has 500 branches, each with one /24 from 10.0.0.0/8. In phase 2 every branch router carries 500 branch prefixes (plus the DC), and one flapping branch triggers updates to all 499 others. In phase 3 the hub sends only 10.0.0.0/8 (EIGRP summary) or a default route: each branch holds a handful of routes plus an H route for each branch it is actively talking to, maybe 5 to 20. Both designs still give direct branch-to-branch voice paths.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling phase 2 but letting the IGP rewrite the next hop to the hub (OSPF point-to-multipoint, EIGRP next-hop-self, a summary on the hub). Everything works, pings succeed, but <code>traceroute</code> always shows the hub: you built a very complicated phase 1. Lab 3 starts in exactly this state.</p></div>

<div class="exam"><p><b>Exam trap.</b> Phase 3 does not need the spokes to have a specific route to the far spoke; phase 2 does. And summarisation on the hub <b>breaks</b> phase 2 but is the <b>normal</b> design in phase 3. If a question says "the hub advertises a default route and spoke-to-spoke tunnels still form", the answer is phase 3.</p></div>

<div class="scn"><h4>The summary that killed direct calls</h4><p>A retail chain ran phase 2 with EIGRP. To "clean up" routing tables, an engineer added <code>summary-address 10.0.0.0/8</code> on the hub tunnel. Voice quality between stores dropped immediately: every store now saw the summary via 172.16.100.1 and no store-to-store tunnel was ever triggered. The team migrated to phase 3 by adding <code>ip nhrp redirect</code> on the hub and <code>ip nhrp shortcut</code> on the stores; the summary stayed and direct tunnels returned.</p><p><b>Lesson:</b> in phase 2 the next hop is the trigger. If you want summaries, move to phase 3.</p></div>

<div class="iv"><p class="q">"Compare DMVPN phase 2 and phase 3."</p><p>Strong answer: both give spoke-to-spoke tunnels over mGRE. In phase 2 the spoke triggers resolution because its route's next hop is the far spoke, so the IGP must preserve next hops and the hub cannot summarise; every spoke needs every prefix. In phase 3 the hub sends a Traffic Indication when traffic hairpins, the spoke resolves the destination and installs an NHRP shortcut or next-hop override, so the hub can summarise or send a default. Phase 3 scales better and is the recommended design.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1: all via hub; summaries fine; spokes may be point-to-point GRE.</li>
<li>Phase 2: next hop = far spoke triggers resolution; no summaries; IGP must preserve next hop.</li>
<li>Phase 3: hub redirect + spoke shortcut; summaries and default allowed; best scaling.</li>
<li>Pings working proves nothing about the phase; a traceroute shows whether the hub is in the path.</li>
<li>Phase 3 adds only two commands: <code>ip nhrp redirect</code> on the hub and <code>ip nhrp shortcut</code> on spokes.</li>
</ul></div>
`,hi:`
<p>Wapas courier company par, branches chalane ke teen tarike hain. Pehle mein har parcel hamesha head office se jaata hai. Doosre mein har branch har branch ke delivery area ki poori list rakhti hai aur head office se sirf aaj ka street address poochti hai. Teesre mein branches ko bahut kam pata hota hai; head office pehla parcel forward karta hai aur phir sender ko call karta hai: "agli baar seedhe Kochi jaana". Yahi DMVPN phases 1, 2 aur 3 hain.</p>

<p><b>Phase</b> koi software version nahi hai. Yeh design choice hai jo decide karti hai ki <b>spoke-to-spoke tunnels bante hain ya nahi</b> aur unhe banane ke liye <b>routing protocol ko kya advertise karna hai</b>.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Teen DMVPN phases mein traffic path">
<text x="105" y="18" text-anchor="middle" class="svg-ink" font-size="13">Phase 1</text><text x="320" y="18" text-anchor="middle" class="svg-ink" font-size="13">Phase 2</text><text x="535" y="18" text-anchor="middle" class="svg-ink" font-size="13">Phase 3</text>
<rect x="75" y="30" width="60" height="30" rx="6" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="12">HUB</text>
<rect x="290" y="30" width="60" height="30" rx="6" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="12">HUB</text>
<rect x="505" y="30" width="60" height="30" rx="6" fill="#bae6fd"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="12">HUB</text>
<rect x="15" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="45" y="170" text-anchor="middle" class="svg-ink" font-size="12">S1</text>
<rect x="135" y="150" width="60" height="30" rx="6" fill="#fde68a"/><text x="165" y="170" text-anchor="middle" class="svg-ink" font-size="12">S2</text>
<rect x="230" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="260" y="170" text-anchor="middle" class="svg-ink" font-size="12">S1</text>
<rect x="350" y="150" width="60" height="30" rx="6" fill="#fde68a"/><text x="380" y="170" text-anchor="middle" class="svg-ink" font-size="12">S2</text>
<rect x="445" y="150" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="475" y="170" text-anchor="middle" class="svg-ink" font-size="12">S1</text>
<rect x="565" y="150" width="60" height="30" rx="6" fill="#fde68a"/><text x="595" y="170" text-anchor="middle" class="svg-ink" font-size="12">S2</text>
<line x1="45" y1="150" x2="95" y2="60" stroke="#64748b" stroke-width="2"/><line x1="115" y1="60" x2="165" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="150" x2="310" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="330" y1="60" x2="380" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="290" y1="172" x2="350" y2="172" stroke="#64748b" stroke-width="3"/>
<line x1="475" y1="150" x2="525" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="545" y1="60" x2="595" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="505" y1="172" x2="565" y2="172" stroke="#64748b" stroke-width="3"/>
<text x="105" y="205" text-anchor="middle" class="svg-muted" font-size="12">hamesha hub se</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">next hop = door wala spoke</text>
<text x="535" y="205" text-anchor="middle" class="svg-muted" font-size="12">next hop = hub, phir</text>
<text x="105" y="225" text-anchor="middle" class="svg-accent" font-size="12">summaries OK</text>
<text x="320" y="225" text-anchor="middle" class="svg-accent" font-size="12">summaries nahi</text>
<text x="535" y="225" text-anchor="middle" class="svg-accent" font-size="12">redirect + shortcut</text>
</svg><p class="cap">Moti line = spoke-to-spoke tunnel banne ke baad ka data path. Dashed = sirf pehle packets ya control traffic.</p></div>

<h3>Phase 1: sirf hub-and-spoke</h3>
<p>Spokes point-to-point GRE (<code>tunnel destination</code> = hub NBMA) ya mGRE use kar sakte hain, lekin woh kabhi ek doosre ko resolve nahi karte. Saara spoke-to-spoke traffic hub se route hota hai. Routing protocol ko spokes ko sirf hub tak ka path dena hai, isliye hub <b>default route ya summary</b> bhej sakta hai. Phase 1 zero-touch hub configuration deta hai lekin direct paths nahi. Yeh sabse simple design hai aur wahan ab bhi use hota hai jahan saara traffic waise bhi data centre jaata hai.</p>

<h3>Phase 2: spoke-initiated spoke-to-spoke</h3>
<p>Saare spokes mGRE use karte hain. Jab SPOKE1 ke paas 10.3.3.0/24 ka route next hop <b>172.16.100.3</b> (SPOKE2 ka tunnel address) ke saath hota hai, uske paas us next hop ki NBMA mapping nahi hoti, isliye woh Resolution Request bhejta hai aur seedha tunnel banata hai. Trigger <b>routing table ka next hop</b> hai. Isliye jab hub spoke routes re-advertise kare, IGP ko <b>original next hop preserve</b> karna hoga, aur hub ko <b>summarise nahi</b> karna chahiye (summary mein next hop hub hoga). Har spoke har spoke prefix rakhta hai. Yahi phase 2 ki main scaling limit hai.</p>

<h3>Phase 3: hub-initiated spoke-to-spoke</h3>
<p>Saare spokes mGRE use karte hain aur routing hub ki taraf point kar sakti hai (summaries aur default routes allowed). Pehla packet SPOKE1 se HUB se SPOKE2 jaata hai. Hub notice karta hai ki packet <b>same</b> mGRE interface se aaya aur gaya, isliye woh SPOKE1 ko NHRP <b>Traffic Indication</b> (redirect) bhejta hai. SPOKE1, <code>ip nhrp shortcut</code> ke saath, destination resolve karta hai aur shortcut install karta hai: ya to NHRP route (code H) ya existing route par next-hop override (%). Phase 3 direct paths aur chhoti routing tables dono deta hai, isiliye yeh Cisco ka recommended design hai.</p>

<table class="cmp"><tr><th></th><th>Phase 1</th><th>Phase 2</th><th>Phase 3</th></tr>
<tr><td>Spoke tunnel type</td><td>GRE ya mGRE</td><td>mGRE</td><td>mGRE</td></tr>
<tr><td>Spoke-to-spoke tunnel</td><td>Nahi</td><td>Haan, spoke trigger karta hai</td><td>Haan, hub trigger karta hai</td></tr>
<tr><td>Trigger</td><td>koi nahi</td><td>next hop = door wale spoke ka tunnel IP</td><td>hub se Traffic Indication</td></tr>
<tr><td>Hub se summary / default</td><td>Haan</td><td>Nahi</td><td>Haan</td></tr>
<tr><td>Key commands</td><td>basic NHRP</td><td>basic NHRP + IGP next-hop preservation</td><td><code>ip nhrp redirect</code> (hub), <code>ip nhrp shortcut</code> (spokes)</td></tr>
<tr><td>OSPF network type</td><td>point-to-multipoint</td><td>broadcast (hub DR) ya non-broadcast</td><td>point-to-multipoint (ya broadcast)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek bank ki 500 branches hain, har ek ke paas 10.0.0.0/8 se ek /24. Phase 2 mein har branch router 500 branch prefixes (plus DC) rakhta hai, aur ek flap hoti branch baaki 499 ko updates trigger karti hai. Phase 3 mein hub sirf 10.0.0.0/8 (EIGRP summary) ya default route bhejta hai: har branch kuch hi routes rakhti hai plus har us branch ka H route jisse woh abhi baat kar rahi hai, shayad 5 se 20. Dono designs phir bhi branch-to-branch direct voice paths dete hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Phase 2 enable karna lekin IGP ko next hop hub par rewrite karne dena (OSPF point-to-multipoint, EIGRP next-hop-self, hub par summary). Sab kaam karta hai, pings chalte hain, lekin <code>traceroute</code> hamesha hub dikhata hai: aapne ek bahut complicated phase 1 bana diya. Lab 3 bilkul isi state mein shuru hoti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Phase 3 mein spokes ko door wale spoke ka specific route nahi chahiye; phase 2 mein chahiye. Aur hub par summarisation phase 2 ko <b>tod deta</b> hai lekin phase 3 mein <b>normal</b> design hai. Agar question kahe "hub default route advertise karta hai aur phir bhi spoke-to-spoke tunnels bante hain", to jawab phase 3 hai.</p></div>

<div class="scn"><h4>Summary jisne direct calls khatam kar di</h4><p>Ek retail chain EIGRP ke saath phase 2 chala rahi thi. Routing tables "saaf" karne ke liye ek engineer ne hub tunnel par <code>summary-address 10.0.0.0/8</code> joda. Stores ke beech voice quality turant gir gayi: har store ab summary via 172.16.100.1 dekh raha tha aur koi store-to-store tunnel trigger hi nahi hua. Team ne hub par <code>ip nhrp redirect</code> aur stores par <code>ip nhrp shortcut</code> jod kar phase 3 par migrate kiya; summary rahi aur direct tunnels wapas aa gaye.</p><p><b>Seekh:</b> phase 2 mein next hop hi trigger hai. Summaries chahiye to phase 3 par jao.</p></div>

<div class="iv"><p class="q">"DMVPN phase 2 aur phase 3 compare karo."</p><p>Strong answer: dono mGRE par spoke-to-spoke tunnels dete hain. Phase 2 mein spoke resolution trigger karta hai kyunki uske route ka next hop door wala spoke hai, isliye IGP ko next hops preserve karne hain aur hub summarise nahi kar sakta; har spoke ko har prefix chahiye. Phase 3 mein traffic hairpin hone par hub Traffic Indication bhejta hai, spoke destination resolve karke NHRP shortcut ya next-hop override install karta hai, isliye hub summarise kar sakta ya default bhej sakta hai. Phase 3 behtar scale karta hai aur recommended design hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1: sab hub se; summaries theek; spokes point-to-point GRE ho sakte hain.</li>
<li>Phase 2: next hop = door wala spoke resolution trigger karta hai; summaries nahi; IGP ko next hop preserve karna hai.</li>
<li>Phase 3: hub redirect + spoke shortcut; summaries aur default allowed; sabse achha scaling.</li>
<li>Pings chalna phase ke baare mein kuch sabit nahi karta; traceroute batata hai ki hub path mein hai ya nahi.</li>
<li>Phase 3 sirf do commands jodta hai: hub par <code>ip nhrp redirect</code> aur spokes par <code>ip nhrp shortcut</code>.</li>
</ul></div>
`}};export{e as default};