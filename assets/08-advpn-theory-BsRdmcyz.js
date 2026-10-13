var e={id:`advpn-theory`,h:{en:`ADVPN theory: sender, receiver, offers and shortcuts`,hi:`ADVPN theory: sender, receiver, offers aur shortcuts`},body:{en:`
<p>In a hub-and-spoke network every file that Madurai sends to Trichy first travels to Chennai and back, using the hub's Internet link twice and adding delay. A full mesh would fix that but needs a tunnel between every pair of branches, which is a maintenance nightmare. <b>ADVPN</b> (Auto-Discovery VPN) gives the best of both: the design stays hub-and-spoke, but when two spokes actually talk, they build a <b>direct shortcut tunnel</b> on demand. This chapter prepares <b>n7-ipsec-advpn</b>.</p>

<h3>The roles</h3>
<ul>
<li><b>Hub with auto-discovery-sender</b>: watches traffic that enters through one spoke tunnel and leaves through another tunnel of the same dial-up template. It then tells the sender spoke "there is a better path to that network" with a <b>shortcut offer</b>.</li>
<li><b>Spoke with auto-discovery-receiver</b>: accepts offers and initiates a new IKE negotiation straight to the other spoke. <b>Both</b> spokes need the receiver option, because the second spoke must accept the new tunnel.</li>
</ul>
<p>The hub still has its normal job: it is the route reflector, the first path for packets, and the place where the shortcuts are arranged. The spokes keep their tunnel to the hub all the time. The shortcut is an <i>extra</i> tunnel.</p>

<div class="dia"><svg viewBox="0 0 660 260" role="img" aria-label="ADVPN shortcut flow">
<rect x="250" y="15" width="160" height="60" rx="10" fill="#bae6fd"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT sender</text><text x="330" y="60" text-anchor="middle" class="svg-muted" font-size="12">hairpin policy needed</text>
<rect x="20" y="160" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="105" y="185" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT receiver</text><text x="105" y="205" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/24</text>
<rect x="470" y="160" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="555" y="185" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT receiver</text><text x="555" y="205" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24</text>
<line x1="260" y1="75" x2="120" y2="160" stroke="#64748b" stroke-width="3"/><line x1="400" y1="75" x2="540" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="190" y1="190" x2="470" y2="190" stroke="#22c55e" stroke-width="4" stroke-dasharray="8 5"/><text x="330" y="182" text-anchor="middle" class="svg-accent" font-size="12">shortcut TO-HQ_0</text>
<text x="330" y="125" text-anchor="middle" class="svg-muted" font-size="12">1 first packets via hub   2 offer   3 direct IKE</text>
<text x="330" y="245" text-anchor="middle" class="svg-ink" font-size="12">Control stays at the hub, data goes straight between the branches</text>
</svg><p class="cap">The hub notices the hairpin and arranges the shortcut; the spokes then talk directly.</p></div>

<h3>Step by step in the lab</h3>
<ol>
<li>PC-MDU pings PC-TRY. MDU-FGT routes 10.30.0.0/24 to next hop 10.255.1.3, which is reachable through the overlay, so the packet goes to the hub.</li>
<li>The hub receives it on instance KR-ADVPN_1 and must send it out of KR-ADVPN_0 (same template). It needs a <b>firewall policy from KR-ADVPN to KR-ADVPN</b>, the "hairpin" (SPOKE-TO-SPOKE). Without it the packet is dropped; this is task 1 of the lab.</li>
<li>With auto-discovery-sender, the hub sends a shortcut offer to MDU-FGT after the first packets (about half a second of lab time).</li>
<li>MDU-FGT negotiates a tunnel to TRY-FGT. A new interface appears, named <b>phase1name_index</b>, so <code>TO-HQ_0</code>.</li>
<li>A /32 route for the other spoke's tunnel IP (10.255.1.3) appears through the shortcut. The unchanged BGP route now resolves through it.</li>
</ol>
<pre class="out">MDU-FGT # get router info routing-table all
<span class="hl">B       10.30.0.0/24 [200/0] via 10.255.1.3 (recursive is directly connected, TO-HQ_0)</span>
<span class="hl">C       10.255.1.3/32 is directly connected, TO-HQ_0</span>
C       10.255.1.0/24 is directly connected, TO-HQ
MDU-FGT # get vpn ipsec tunnel summary
'TO-HQ' 203.0.113.1:0  selectors(total,up): 1/1
<span class="hl">'TO-HQ_0' 203.0.113.12:0  selectors(total,up): 1/1</span></pre>
<p>The lab's own tip: pings in one run are sent at the same moment, so the first run still travels via the hub (TTL 61), and the next run uses the shortcut (TTL 62; traceroute shows two hops, not three).</p>

<h3>Why the unchanged next hop matters</h3>
<p>The /32 route to 10.255.1.3 is more specific than the overlay /24, so it wins. Recall chapter 7: if the hub rewrote the next hop (<code>next-hop-self-rr</code>), MDU's route would point to 10.255.1.1 and never use the /32 for Trichy. The shortcut would exist and carry nothing.</p>
<div class="warn"><p><b>Common mistake.</b> Enabling only the sender. Without receivers on both spokes the offer is made, then refused: "shortcut negotiation failed: peer does not accept shortcuts". That is the first fault of ticket KR-2377.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shortcuts are triggered by <i>hairpinned traffic</i> on the hub, not by routing protocol events. Also, ADVPN needs the network-id/IKEv2 capabilities of the phase 1 on newer releases; in the lab the options auto-discovery-sender, auto-discovery-receiver and the hairpin policy are what you must remember.</p></div>

<div class="scn"><h4>Stock files at night</h4><p>Madurai and Trichy exchange nightly stock files of 20 GB. Over the hub path the Chennai link ran at 90 per cent for two hours and the head-office VoIP calls broke up. After ADVPN the first minute of the transfer went through Chennai, then a shortcut took the rest straight between the branches. The Chennai link dropped to 5 per cent.</p><p><b>Lesson:</b> ADVPN moves bulk spoke-to-spoke data off the hub without changing the design.</p></div>

<div class="iv"><p class="q">"Explain ADVPN in one minute."</p><p>Spokes keep tunnels only to the hub, which is also the route reflector. When the hub sees traffic from one spoke being forwarded to another, with auto-discovery-sender it offers a shortcut; spokes with auto-discovery-receiver then negotiate a tunnel directly. The BGP route is unchanged; a /32 to the peer tunnel IP makes it resolve through the shortcut.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sender on the hub, receiver on both spokes.</li>
<li>The hub needs a hairpin policy KR-ADVPN to KR-ADVPN.</li>
<li>First packets go via the hub; the shortcut appears after the offer.</li>
<li>Shortcut name = phase1 name + index (TO-HQ_0).</li>
<li>Unchanged BGP next hop lets the /32 route redirect traffic.</li>
</ul></div>
`,hi:`
<p>Hub-and-spoke network mein Madurai jo bhi file Trichy ko bhejta hai woh pehle Chennai jaati hai aur phir wapas, hub ka Internet link do baar use hota hai aur delay badhta hai. Full mesh ise theek karta, par har pair ke beech tunnel chahiye, jo maintenance ka sir-dard hai. <b>ADVPN</b> (Auto-Discovery VPN) dono ka fayda deta hai: design hub-and-spoke hi rehta hai, par jab do spokes sach mein baat karte hain, woh zaroorat par ek <b>direct shortcut tunnel</b> bana lete hain. Yeh chapter <b>n7-ipsec-advpn</b> ki taiyari karata hai.</p>

<h3>Roles</h3>
<ul>
<li><b>auto-discovery-sender wala hub</b>: woh traffic dekhta hai jo ek spoke tunnel se aata hai aur usi dial-up template ke doosre tunnel se nikalta hai. Phir sender spoke ko <b>shortcut offer</b> se batata hai "us network ke liye behtar path hai".</li>
<li><b>auto-discovery-receiver wala spoke</b>: offers accept karta hai aur seedha doosre spoke se naya IKE negotiation shuru karta hai. <b>Dono</b> spokes ko receiver option chahiye, kyunki doosre spoke ko naya tunnel accept karna hota hai.</li>
</ul>
<p>Hub ka normal kaam wahi rehta hai: route reflector, packets ka pehla path, aur jahan shortcuts arrange hote hain. Spokes hub ka tunnel hamesha rakhte hain. Shortcut ek <i>extra</i> tunnel hai.</p>

<div class="dia"><svg viewBox="0 0 660 260" role="img" aria-label="ADVPN shortcut flow">
<rect x="250" y="15" width="160" height="60" rx="10" fill="#bae6fd"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="14">HQ-FGT sender</text><text x="330" y="60" text-anchor="middle" class="svg-muted" font-size="12">hairpin policy chahiye</text>
<rect x="20" y="160" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="105" y="185" text-anchor="middle" class="svg-ink" font-size="14">MDU-FGT receiver</text><text x="105" y="205" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/24</text>
<rect x="470" y="160" width="170" height="60" rx="10" fill="#ddd6fe"/><text x="555" y="185" text-anchor="middle" class="svg-ink" font-size="14">TRY-FGT receiver</text><text x="555" y="205" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.0/24</text>
<line x1="260" y1="75" x2="120" y2="160" stroke="#64748b" stroke-width="3"/><line x1="400" y1="75" x2="540" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="190" y1="190" x2="470" y2="190" stroke="#22c55e" stroke-width="4" stroke-dasharray="8 5"/><text x="330" y="182" text-anchor="middle" class="svg-accent" font-size="12">shortcut TO-HQ_0</text>
<text x="330" y="125" text-anchor="middle" class="svg-muted" font-size="12">1 pehle packets hub se   2 offer   3 direct IKE</text>
<text x="330" y="245" text-anchor="middle" class="svg-ink" font-size="12">Control hub par rehta hai, data seedha branches ke beech jata hai</text>
</svg><p class="cap">Hub hairpin dekhta hai aur shortcut arrange karta hai; phir spokes seedhe baat karte hain.</p></div>

<h3>Lab mein step by step</h3>
<ol>
<li>PC-MDU, PC-TRY ko ping karta hai. MDU-FGT 10.30.0.0/24 ko next hop 10.255.1.3 par route karta hai, jo overlay se reachable hai, isliye packet hub ke paas jata hai.</li>
<li>Hub use instance KR-ADVPN_1 par receive karta hai aur KR-ADVPN_0 (same template) se bhejna hai. Iske liye <b>KR-ADVPN se KR-ADVPN tak firewall policy</b> chahiye, "hairpin" (SPOKE-TO-SPOKE). Iske bina packet drop hota hai; yeh lab ka task 1 hai.</li>
<li>auto-discovery-sender ke saath, hub pehle kuch packets ke baad MDU-FGT ko shortcut offer bhejta hai (lab time mein lagbhag aadha second).</li>
<li>MDU-FGT, TRY-FGT se tunnel negotiate karta hai. Ek naya interface dikhta hai, jiska naam <b>phase1name_index</b> hota hai, yaani <code>TO-HQ_0</code>.</li>
<li>Doosre spoke ke tunnel IP (10.255.1.3) ka /32 route shortcut se aa jata hai. Unchanged BGP route ab usi se resolve hota hai.</li>
</ol>
<pre class="out">MDU-FGT # get router info routing-table all
<span class="hl">B       10.30.0.0/24 [200/0] via 10.255.1.3 (recursive is directly connected, TO-HQ_0)</span>
<span class="hl">C       10.255.1.3/32 is directly connected, TO-HQ_0</span>
C       10.255.1.0/24 is directly connected, TO-HQ
MDU-FGT # get vpn ipsec tunnel summary
'TO-HQ' 203.0.113.1:0  selectors(total,up): 1/1
<span class="hl">'TO-HQ_0' 203.0.113.12:0  selectors(total,up): 1/1</span></pre>
<p>Lab ka apna tip: ek run ke pings ek hi pal mein jaate hain, isliye pehla run abhi hub se jata hai (TTL 61), aur agla run shortcut use karta hai (TTL 62; traceroute do hop dikhata hai, teen nahi).</p>

<h3>Unchanged next hop kyun zaroori hai</h3>
<p>10.255.1.3 ka /32 route overlay /24 se zyada specific hai, isliye jeet jata hai. Chapter 7 yaad karo: agar hub next hop badal deta (<code>next-hop-self-rr</code>), to MDU ka route 10.255.1.1 par point karta aur Trichy ke liye /32 kabhi use nahi hota. Shortcut bana rehta par kuch carry nahi karta.</p>
<div class="warn"><p><b>Common mistake.</b> Sirf sender enable karna. Dono spokes par receiver ke bina offer bheja jata hai, phir refuse hota hai: "shortcut negotiation failed: peer does not accept shortcuts". Yahi ticket KR-2377 ka pehla fault hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shortcuts hub par <i>hairpinned traffic</i> se trigger hote hain, routing protocol events se nahi. Naye releases mein phase 1 ki network-id/IKEv2 capabilities bhi kaam aati hain; lab mein aapko auto-discovery-sender, auto-discovery-receiver aur hairpin policy yaad rakhni hai.</p></div>

<div class="scn"><h4>Raat ko stock files</h4><p>Madurai aur Trichy raat ko 20 GB stock files exchange karte hain. Hub path par Chennai link do ghante 90 percent par chala aur head-office ki VoIP calls toot-ti rahin. ADVPN ke baad transfer ka pehla minute Chennai se gaya, phir shortcut ne baaki seedha branches ke beech le liya. Chennai link 5 percent par aa gaya.</p><p><b>Lesson:</b> ADVPN design badle bina bulk spoke-to-spoke data ko hub se hata deta hai.</p></div>

<div class="iv"><p class="q">"ADVPN ek minute mein samjhao."</p><p>Spokes ke tunnels sirf hub tak hote hain, jo route reflector bhi hai. Hub ek spoke ka traffic doosre spoke ko forward hota dekhe to auto-discovery-sender se shortcut offer karta hai; auto-discovery-receiver wale spokes phir seedhe tunnel negotiate karte hain. BGP route unchanged rehta hai; peer tunnel IP ka /32 use shortcut se resolve karwa deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub par sender, dono spokes par receiver.</li>
<li>Hub ko hairpin policy KR-ADVPN se KR-ADVPN chahiye.</li>
<li>Pehle packets hub se jaate hain; offer ke baad shortcut aata hai.</li>
<li>Shortcut ka naam = phase1 naam + index (TO-HQ_0).</li>
<li>Unchanged BGP next hop /32 route ko traffic redirect karne deta hai.</li>
</ul></div>
`}};export{e as default};