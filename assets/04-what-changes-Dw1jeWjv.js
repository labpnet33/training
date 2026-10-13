var e={id:`what-changes`,h:{en:`What SD-WAN changes: overlay, central policy, zero-touch and smart paths`,hi:`SD-WAN kya badalta hai: overlay, central policy, zero-touch aur smart paths`},body:{en:`
<p>The previous chapter listed six pains. SD-WAN answers them with a handful of simple ideas. Learn these ideas well; every later module in the track is a closer look at one of them.</p>

<h3>An analogy: a ride-hailing app for your packets</h3>
<p>Before ride-hailing apps, you phoned one taxi company, which sent whichever car it had. Now an app knows many drivers and many routes. It watches live traffic, picks the best car and route for <i>this</i> trip, and re-routes if a road jams. You do not care which company owns the car; you care that you arrive on time. SD-WAN does the same for application traffic: many carriers, many paths, one smart decision-maker, driven by what is happening <i>now</i>.</p>

<h3>Idea 1: an overlay over any transport</h3>
<p>Each branch router builds encrypted <b>tunnels</b> to the other sites. The tunnels ride on top of whatever lines exist: MPLS, broadband, a 4G/5G modem. Together the tunnels form the <b>overlay</b>. The lines underneath form the <b>underlay</b>. The underlay only has to deliver IP packets between the routers; it does not need to know anything about your company's networks or VPNs. That is why the transport becomes a replaceable commodity: you can change a carrier without touching the design.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Overlay and underlay">
<rect x="20" y="20" width="600" height="80" rx="10" fill="#bbf7d0" opacity="0.7"/>
<text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">OVERLAY: encrypted tunnels + central policy (what the business sees)</text>
<rect x="60" y="56" width="90" height="34" rx="8" fill="#fff"/><text x="105" y="77" text-anchor="middle" class="svg-ink" font-size="12">Branch A</text>
<rect x="275" y="56" width="90" height="34" rx="8" fill="#fff"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="12">Data centre</text>
<rect x="490" y="56" width="90" height="34" rx="8" fill="#fff"/><text x="535" y="77" text-anchor="middle" class="svg-ink" font-size="12">Branch B</text>
<line x1="150" y1="73" x2="275" y2="73" stroke="#16a34a" stroke-width="3"/><line x1="365" y1="73" x2="490" y2="73" stroke="#16a34a" stroke-width="3"/>
<rect x="20" y="130" width="600" height="100" rx="10" fill="#e2e8f0"/>
<text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">UNDERLAY: any carrier, any line (just delivers IP)</text>
<rect x="60" y="170" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="125" y="195" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text>
<rect x="255" y="170" width="130" height="40" rx="8" fill="#bae6fd"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Broadband internet</text>
<rect x="450" y="170" width="130" height="40" rx="8" fill="#fde68a"/><text x="515" y="195" text-anchor="middle" class="svg-ink" font-size="12">4G / 5G</text>
</svg><p class="cap">The overlay sits on top of the underlay. The business designs the overlay; the carriers only provide the underlay.</p></div>

<h3>Idea 2: central policy and a single point of management</h3>
<p>Instead of typing rules into each router, the administrator writes them once in a central <b>manager</b> (a web screen and an API). Configuration templates describe what a branch router should look like; policies describe how traffic should behave. A central <b>controller</b> distributes routes and policy to every router. Change the rule in one place and every site follows.</p>

<h3>Idea 3: zero-touch provisioning</h3>
<p>A new branch router is registered in the system before it leaves the warehouse. At the branch, someone only plugs in power and an internet cable. The router calls home, proves who it is with a certificate, downloads its configuration and joins the overlay. No engineer travels. Chapter 6 walks through this in detail.</p>

<h3>Idea 4: application-aware routing</h3>
<p>Each router continuously measures every tunnel for <b>loss</b> (percentage of packets lost), <b>latency</b> (delay) and <b>jitter</b> (variation in delay). The administrator defines what each application needs, for example voice needs loss under 1%, latency under 150 ms, jitter under 30 ms. The router sends voice over a path that meets this and moves it when the path stops meeting it, without waiting for a failure.</p>

<div class="eg"><p><b>Worked example.</b> A branch has MPLS and broadband. Measured values: MPLS loss 0.1%, latency 40 ms, jitter 5 ms. Broadband loss 0.2%, latency 30 ms, jitter 8 ms. Voice SLA: loss at most 1%, latency at most 150 ms, jitter at most 30 ms. Both qualify, so voice may use either. Ten minutes later broadband shows loss 6% and jitter 70 ms: it no longer qualifies, voice moves to MPLS automatically, while bulk file downloads (which tolerate loss) may stay on broadband. When broadband recovers, voice can return.</p></div>

<h3>Idea 5: direct access to the cloud</h3>
<p>With central security policy and encryption in place, a branch can send trusted internet traffic straight out of its local breakout (<b>Direct Internet Access, DIA</b>) while corporate traffic continues across the overlay. The system can even test the quality of a SaaS application over each possible exit and pick the best one (Cloud OnRamp). Cloud workloads in public cloud join the overlay like another site.</p>

<h3>Idea 6: security and segmentation built in</h3>
<p>Tunnels are encrypted with IPsec. Inside the overlay, traffic is separated into <b>segments</b> (VPNs), for example corporate, guest Wi-Fi, payment terminals. A device in the guest segment has no route to the corporate segment at all. Optional security features (firewall, intrusion prevention, DNS filtering) can run on the same branch router.</p>

<table class="cmp"><tr><th>Pain</th><th>SD-WAN idea that answers it</th></tr>
<tr><td>Cost per megabit</td><td>Overlay over any transport (use cheap broadband)</td></tr>
<tr><td>Lead time</td><td>Zero-touch provisioning</td></tr>
<tr><td>Cloud backhaul</td><td>Direct Internet Access and Cloud OnRamp</td></tr>
<tr><td>Blind path choice</td><td>Application-aware routing</td></tr>
<tr><td>Box-by-box work</td><td>Central manager, templates, policy</td></tr>
<tr><td>Weak security</td><td>IPsec everywhere and VPN segmentation</td></tr></table>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that SD-WAN replaces routing. It does not: routers still route. SD-WAN adds an overlay routing protocol (called OMP in Cisco's solution) and still talks to the normal LAN with OSPF, BGP or static routes.</p></div>

<div class="scn"><h4>Festival pop-up stores</h4><p>A fashion retailer opened 40 temporary stores for a festival season. Each store received a pre-registered router in a box and a 4G/5G modem plus a local broadband line. Shop staff plugged them in; within minutes each router joined the network, took its configuration and started carrying point-of-sale traffic over encrypted tunnels. When one store's broadband had a bad afternoon, the card terminals moved to the 5G link automatically. At the end of the season the routers were collected and reused.</p><p><b>Lesson:</b> overlay, zero-touch and measured paths turn "weeks to open a site" into "a day".</p></div>

<div class="iv"><p class="q">"What are the main benefits of SD-WAN over a traditional WAN?"</p><p>Answer in groups: cost and transport independence (any line, secure overlay); agility (zero-touch onboarding, central templates); performance (application-aware routing, direct cloud access); security (encryption, segmentation); and visibility (central monitoring). Give one example, such as moving voice off a degraded link automatically.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN builds an encrypted overlay on top of any underlay: MPLS, broadband, 4G/5G.</li>
<li>Rules and configuration are written once in a central manager and distributed automatically.</li>
<li>Zero-touch provisioning lets a new branch join without an engineer on site.</li>
<li>Application-aware routing steers each application using measured loss, latency and jitter.</li>
<li>Direct Internet Access, Cloud OnRamp, IPsec and VPN segmentation address cloud access and security.</li>
</ul></div>
`,hi:`
<p>Pichhle chapter mein chhe pains ginaye gaye. SD-WAN unka jawab kuch simple ideas se deta hai. In ideas ko achhe se seekho; track ka har baad ka module inhi mein se ek ko kareeb se dekhta hai.</p>

<h3>Ek analogy: aapke packets ke liye ride-hailing app</h3>
<p>Ride-hailing apps se pehle aap ek taxi company ko phone karte the, jo jo gaadi uske paas hoti woh bhej deti. Ab ek app bahut saare drivers aur bahut saare routes jaanta hai. Woh live traffic dekhta hai, <i>is</i> trip ke liye best gaadi aur route chunta hai, aur road jam ho to re-route kar deta hai. Aapko farak nahi padta ki gaadi kis company ki hai; aap bas samay par pahunchna chahte ho. SD-WAN application traffic ke liye wahi karta hai: bahut saare carriers, bahut saare paths, ek smart decision-maker, jo <i>abhi</i> kya ho raha hai uske hisaab se chalta hai.</p>

<h3>Idea 1: kisi bhi transport par overlay</h3>
<p>Har branch router baaki sites tak encrypted <b>tunnels</b> banata hai. Tunnels jo bhi lines maujood hain unke upar chalte hain: MPLS, broadband, 4G/5G modem. Saare tunnels milkar <b>overlay</b> banate hain. Neeche ki lines <b>underlay</b> banati hain. Underlay ko sirf routers ke beech IP packets pahunchane hote hain; use company ke networks ya VPNs ke baare mein kuch jaanne ki zaroorat nahi. Isiliye transport badla ja sakne wali commodity ban jaata hai: aap design ko chhue bina carrier badal sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Overlay aur underlay">
<rect x="20" y="20" width="600" height="80" rx="10" fill="#bbf7d0" opacity="0.7"/>
<text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">OVERLAY: encrypted tunnels + central policy (business kya dekhta hai)</text>
<rect x="60" y="56" width="90" height="34" rx="8" fill="#fff"/><text x="105" y="77" text-anchor="middle" class="svg-ink" font-size="12">Branch A</text>
<rect x="275" y="56" width="90" height="34" rx="8" fill="#fff"/><text x="320" y="77" text-anchor="middle" class="svg-ink" font-size="12">Data centre</text>
<rect x="490" y="56" width="90" height="34" rx="8" fill="#fff"/><text x="535" y="77" text-anchor="middle" class="svg-ink" font-size="12">Branch B</text>
<line x1="150" y1="73" x2="275" y2="73" stroke="#16a34a" stroke-width="3"/><line x1="365" y1="73" x2="490" y2="73" stroke="#16a34a" stroke-width="3"/>
<rect x="20" y="130" width="600" height="100" rx="10" fill="#e2e8f0"/>
<text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">UNDERLAY: koi bhi carrier, koi bhi line (bas IP pahunchata hai)</text>
<rect x="60" y="170" width="130" height="40" rx="8" fill="#ddd6fe"/><text x="125" y="195" text-anchor="middle" class="svg-ink" font-size="12">MPLS</text>
<rect x="255" y="170" width="130" height="40" rx="8" fill="#bae6fd"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Broadband internet</text>
<rect x="450" y="170" width="130" height="40" rx="8" fill="#fde68a"/><text x="515" y="195" text-anchor="middle" class="svg-ink" font-size="12">4G / 5G</text>
</svg><p class="cap">Overlay underlay ke upar baitha hai. Business overlay design karta hai; carriers sirf underlay dete hain.</p></div>

<h3>Idea 2: central policy aur management ka ek point</h3>
<p>Har router mein rules type karne ki jagah administrator unhe ek central <b>manager</b> (web screen aur API) mein ek baar likhta hai. Configuration templates batate hain ki branch router kaisa dikhna chahiye; policies batati hain ki traffic ko kaise behave karna hai. Ek central <b>controller</b> har router ko routes aur policy baant-ta hai. Rule ek jagah badlo aur har site follow karti hai.</p>

<h3>Idea 3: zero-touch provisioning</h3>
<p>Naya branch router warehouse se nikalne se pehle hi system mein register hota hai. Branch par koi sirf power aur internet cable lagata hai. Router "ghar phone" karta hai, certificate se apni pehchaan saabit karta hai, apni configuration download karta hai aur overlay join kar leta hai. Koi engineer travel nahi karta. Chapter 6 isko detail mein dikhata hai.</p>

<h3>Idea 4: application-aware routing</h3>
<p>Har router har tunnel ko lagataar <b>loss</b> (kitne percent packets khoye), <b>latency</b> (delay) aur <b>jitter</b> (delay mein variation) ke liye measure karta hai. Administrator batata hai ki har application ko kya chahiye, jaise voice ko loss 1% se kam, latency 150 ms se kam, jitter 30 ms se kam. Router voice ko aise path par bhejta hai jo yeh poora kare, aur jab path poora karna band kar de to use hata deta hai, failure ka wait kiye bina.</p>

<div class="eg"><p><b>Worked example.</b> Ek branch ke paas MPLS aur broadband hai. Measured values: MPLS loss 0.1%, latency 40 ms, jitter 5 ms. Broadband loss 0.2%, latency 30 ms, jitter 8 ms. Voice SLA: loss zyada se zyada 1%, latency zyada se zyada 150 ms, jitter zyada se zyada 30 ms. Dono qualify karte hain, isliye voice dono mein se kisi ek ko use kar sakta hai. Das minute baad broadband par loss 6% aur jitter 70 ms dikhta hai: ab woh qualify nahi karta, voice apne aap MPLS par chala jaata hai, jabki bulk file downloads (jo loss sah lete hain) broadband par reh sakte hain. Broadband theek hone par voice wapas aa sakta hai.</p></div>

<h3>Idea 5: cloud tak direct access</h3>
<p>Central security policy aur encryption lagne ke baad branch trusted internet traffic seedha apne local breakout se nikal sakti hai (<b>Direct Internet Access, DIA</b>) jabki corporate traffic overlay se jaata rehta hai. System SaaS application ki quality har possible exit par test karke best exit chun sakta hai (Cloud OnRamp). Public cloud ke workloads overlay mein ek aur site ki tarah judte hain.</p>

<h3>Idea 6: security aur segmentation built in</h3>
<p>Tunnels IPsec se encrypted hote hain. Overlay ke andar traffic <b>segments</b> (VPNs) mein baanta jaata hai, jaise corporate, guest Wi-Fi, payment terminals. Guest segment ke device ke paas corporate segment ka koi route hi nahi hota. Optional security features (firewall, intrusion prevention, DNS filtering) usi branch router par chal sakte hain.</p>

<table class="cmp"><tr><th>Pain</th><th>Kaunsa SD-WAN idea jawab deta hai</th></tr>
<tr><td>Cost per megabit</td><td>Kisi bhi transport par overlay (sasti broadband use karo)</td></tr>
<tr><td>Lead time</td><td>Zero-touch provisioning</td></tr>
<tr><td>Cloud backhaul</td><td>Direct Internet Access aur Cloud OnRamp</td></tr>
<tr><td>Andha path choice</td><td>Application-aware routing</td></tr>
<tr><td>Box-by-box kaam</td><td>Central manager, templates, policy</td></tr>
<tr><td>Kamzor security</td><td>Har jagah IPsec aur VPN segmentation</td></tr></table>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki SD-WAN routing ko replace karta hai. Nahi karta: routers ab bhi route karte hain. SD-WAN ek overlay routing protocol jodta hai (Cisco ke solution mein OMP kehte hain) aur normal LAN se ab bhi OSPF, BGP ya static routes se baat karta hai.</p></div>

<div class="scn"><h4>Festival pop-up stores</h4><p>Ek fashion retailer ne festival season ke liye 40 temporary stores kholi. Har store ko ek pre-registered router dabbe mein mila, saath mein 4G/5G modem aur ek local broadband line. Shop staff ne unhe plug kiya; kuch hi minutes mein har router network mein aa gaya, apni configuration le li aur point-of-sale traffic encrypted tunnels par le jaane laga. Jab ek store ki broadband ka din kharab gaya to card terminals apne aap 5G link par chale gaye. Season ke ant mein routers wapas liye gaye aur reuse hue.</p><p><b>Seekh:</b> overlay, zero-touch aur measured paths "site kholne mein hafte" ko "ek din" bana dete hain.</p></div>

<div class="iv"><p class="q">"Traditional WAN ke mukable SD-WAN ke main benefits kya hain?"</p><p>Groups mein jawab do: cost aur transport independence (koi bhi line, secure overlay); agility (zero-touch onboarding, central templates); performance (application-aware routing, direct cloud access); security (encryption, segmentation); aur visibility (central monitoring). Ek example do, jaise degraded link se voice ko apne aap hataana.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN kisi bhi underlay (MPLS, broadband, 4G/5G) ke upar encrypted overlay banata hai.</li>
<li>Rules aur configuration central manager mein ek baar likhe jaate hain aur apne aap distribute hote hain.</li>
<li>Zero-touch provisioning naye branch ko bina engineer ke join karne deta hai.</li>
<li>Application-aware routing har application ko naape gaye loss, latency aur jitter se steer karta hai.</li>
<li>Direct Internet Access, Cloud OnRamp, IPsec aur VPN segmentation cloud access aur security sambhalte hain.</li>
</ul></div>
`}};export{e as default};