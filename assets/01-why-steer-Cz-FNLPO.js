var e={id:`why-steer`,h:{en:`Why steer traffic by path quality: the big picture`,hi:`Path quality ke hisaab se traffic steer karna kyun zaroori hai: big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a Catalyst SD-WAN WAN Edge decides which tunnel a packet takes, and how you tell it to do better than "any tunnel will do". You will write centralized data policies (match, action, direction), build SLA classes, write application-aware routing (AAR) policies with preferred and backup colors, understand how the edge measures loss, latency and jitter with BFD, and then verify and troubleshoot the result from the CLI. <b>Prerequisites:</b> you should know the planes and components (Manager, Controller, Validator, WAN Edge), what a TLOC and a color are, and that OMP carries the routes. Those are in the architecture and WAN edge modules. Centralized <i>control</i> policy (which routes and TLOCs are advertised) is in the previous module; here we steer the <i>data</i>.</p>

<h3>Start with an analogy: a navigation app with live traffic</h3>
<p>An old paper map gives you one fixed route to Mumbai. A modern navigation app knows the road is blocked at Lonavala right now, and quietly moves you to the expressway if the old road is slow. The destination did not change. Only the <b>path</b> changed, because the app measures the roads continuously.</p>
<p>Classic routing is the paper map. A link is "up" or "down", and an up link that drops 8% of packets is still "up". Application-aware routing is the navigation app: the edge <b>measures every tunnel</b> and moves each application to a tunnel that is good enough for it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Pune branch with two transports to the Mumbai data center">
<rect x="20" y="85" width="120" height="60" rx="10" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="80" y="132" text-anchor="middle" class="svg-muted" font-size="12">Pune, site 200</text>
<rect x="500" y="85" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-DC</text><text x="560" y="132" text-anchor="middle" class="svg-muted" font-size="12">Mumbai, site 100</text>
<line x1="140" y1="100" x2="500" y2="60" stroke="#64748b" stroke-width="3"/>
<line x1="140" y1="130" x2="500" y2="170" stroke="#64748b" stroke-width="3"/>
<rect x="215" y="28" width="210" height="50" rx="8" fill="#fed7aa"/><text x="320" y="49" text-anchor="middle" class="svg-ink" font-size="13">biz-internet (203.0.113.x)</text><text x="320" y="67" text-anchor="middle" class="svg-ink" font-size="12">loss 4%, latency 180 ms</text>
<rect x="215" y="152" width="210" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">mpls (172.16.x)</text><text x="320" y="191" text-anchor="middle" class="svg-ink" font-size="12">loss 0.2%, latency 40 ms</text>
<text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="13">Both tunnels are "up"</text>
<text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">Only one is good for voice</text>
</svg><p class="cap">The routing table sees two working paths. AAR sees that one of them is unfit for a voice call.</p></div>

<h3>Four kinds of policy, one clear job each</h3>
<p>Catalyst SD-WAN has several policy types. Mixing them up is the number one exam mistake, so fix the picture now.</p>
<table class="cmp"><tr><th>Policy</th><th>Where it is written / enforced</th><th>What it changes</th></tr>
<tr><td><b>Centralized control policy</b></td><td>Written on Manager, runs on the <b>Controller</b></td><td>The OMP routes and TLOCs the Controller advertises (topology, VPN membership, service chaining)</td></tr>
<tr><td><b>Centralized data policy</b></td><td>Written on Manager, sent by the Controller, <b>enforced on the WAN Edge</b></td><td>How matching packets are forwarded: accept, drop, mark, pick a TLOC, NAT, FEC</td></tr>
<tr><td><b>Application-aware routing (app-route) policy</b></td><td>Same path: Manager, Controller, WAN Edge</td><td>Which tunnel is used, based on loss, latency and jitter measured against an <b>SLA class</b></td></tr>
<tr><td><b>Localized policy</b></td><td>Written on Manager, pushed with the device configuration, enforced locally</td><td>ACLs, QoS, route policy on <b>one device</b></td></tr></table>
<p>This module is about the second and third rows. Notice a subtle point: data policy and app-route policy are <i>centralized</i> because you write them once and the Controller distributes them, but they act on <b>data-plane</b> traffic at the edge. The Controller never sees your packets.</p>

<h3>Why this matters</h3>
<p>Companies buy a second transport, often MPLS plus business internet, for resilience and cost. If both are used blindly (ECMP), the voice call suffers whenever the cheaper link has a bad hour. If only MPLS is used for everything, the expensive circuit is congested by backups while the internet link sits idle. AAR gives you the middle path: <b>voice and video use whichever tunnel meets their SLA; bulk traffic uses the cheap one; and when a tunnel degrades, traffic moves in seconds to minutes without a human.</b></p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail's Pune branch E-BR1 (system-ip 10.255.0.21) has two colors in this module's examples: <code>biz-internet</code> on GigabitEthernet1 (203.0.113.10) and <code>mpls</code> on GigabitEthernet2 (172.16.1.2). The Mumbai hub E-DC (10.255.0.1) has both too. Staff in 10.1.10.0/24 call the DC with voice, run billing sessions and nightly backups. We want: voice on any tunnel with loss under 1%, latency under 150 ms and jitter under 30 ms; billing preferably on MPLS; backups on the internet tunnel. One centralized policy set delivers this to every branch in a site-list, and each branch measures its own tunnels.</p></div>

<div class="note"><p><b>Lab note.</b> The lab topologies in this track often have only a <code>biz-internet</code> transport on the branch. The two-color examples in this module are illustrative: the commands and outputs are exactly what you would see with two colors present.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking AAR creates paths. It does not. AAR only chooses <b>between paths OMP has already given you</b>: if the Controller advertises only one TLOC for the DC prefix, there is nothing to choose from. Design the topology first (control policy and TLOCs), then steer.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which policy measures loss, latency and jitter?" None of the policies measure anything. The <b>BFD</b> sessions inside each IPsec tunnel measure. The app-route policy only <i>compares</i> those measurements to an SLA class.</p></div>

<div class="scn"><h4>The voice calls that broke at 11 am</h4><p>Every day around 11 am the Pune help desk reported choppy voice calls to Mumbai. The WAN team saw both tunnels up and no alarms. Looking at the tunnel statistics, the internet tunnel showed 4% loss and 180 ms latency during that hour because a local ISP was congested, while MPLS was clean. The voice traffic was being load-shared across both tunnels, so half of every call took the bad path. After they added an SLA class and an app-route policy for voice, the edge stopped using the internet tunnel for voice whenever it failed the SLA, and the complaints ended without touching the ISP.</p><p><b>Lesson:</b> "up" is not the same as "good". Measure the path, then decide.</p></div>

<div class="iv"><p class="q">"What problem does application-aware routing solve that normal routing and ECMP cannot?"</p><p>A strong answer: routing protocols only know if a path exists, not whether it is healthy. AAR continuously measures loss, latency and jitter per tunnel using BFD, compares them to SLA classes, and steers each application to a tunnel that meets its SLA, so brownouts are handled automatically. Add that AAR only chooses among OMP-advertised paths and that it is enforced on the WAN Edge, not on the Controller.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tunnel can be "up" and still be unusable for voice; AAR exists to catch that.</li>
<li>Control policy shapes routes on the Controller; data and app-route policy shape forwarding on the WAN Edge.</li>
<li>BFD measures the tunnels; the SLA class defines "good enough"; the app-route policy maps applications to tunnels.</li>
<li>AAR can only choose among paths that OMP already advertises.</li>
<li>One policy is written once on Manager and applied to many sites through site-lists.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Catalyst SD-WAN WAN Edge kaise decide karta hai ki packet kaunsa tunnel lega, aur use "koi bhi tunnel chalega" se behtar kaise bataya jaata hai. Aap centralized data policies likhoge (match, action, direction), SLA classes banaoge, preferred aur backup colors ke saath application-aware routing (AAR) policies likhoge, samjhoge ki edge BFD se loss, latency aur jitter kaise naapta hai, aur phir CLI se result verify aur troubleshoot karoge. <b>Prerequisites:</b> aapko planes aur components (Manager, Controller, Validator, WAN Edge) pata hone chahiye, TLOC aur color kya hota hai, aur OMP routes carry karta hai. Yeh sab architecture aur WAN edge modules mein hai. Centralized <i>control</i> policy (kaunse routes aur TLOCs advertise hote hain) pichhle module mein hai; yahan hum <i>data</i> steer karte hain.</p>

<h3>Ek analogy se shuru karo: live traffic wala navigation app</h3>
<p>Purana paper map aapko Mumbai ke liye ek fixed route deta hai. Modern navigation app ko pata hota hai ki Lonavala par road abhi band hai, aur agar purani road slow ho to woh chupchaap aapko expressway par le jaata hai. Destination nahi badla. Sirf <b>path</b> badla, kyunki app roads ko lagatar measure karta hai.</p>
<p>Classic routing paper map hai. Link ya to "up" hota hai ya "down", aur 8% packets drop karne wala up link bhi "up" hi hai. Application-aware routing navigation app hai: edge <b>har tunnel ko measure</b> karta hai aur har application ko aise tunnel par le jaata hai jo uske liye kaafi accha ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Pune branch ke do transports Mumbai data center tak">
<rect x="20" y="85" width="120" height="60" rx="10" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="80" y="132" text-anchor="middle" class="svg-muted" font-size="12">Pune, site 200</text>
<rect x="500" y="85" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="112" text-anchor="middle" class="svg-ink" font-size="14">E-DC</text><text x="560" y="132" text-anchor="middle" class="svg-muted" font-size="12">Mumbai, site 100</text>
<line x1="140" y1="100" x2="500" y2="60" stroke="#64748b" stroke-width="3"/>
<line x1="140" y1="130" x2="500" y2="170" stroke="#64748b" stroke-width="3"/>
<rect x="215" y="28" width="210" height="50" rx="8" fill="#fed7aa"/><text x="320" y="49" text-anchor="middle" class="svg-ink" font-size="13">biz-internet (203.0.113.x)</text><text x="320" y="67" text-anchor="middle" class="svg-ink" font-size="12">loss 4%, latency 180 ms</text>
<rect x="215" y="152" width="210" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">mpls (172.16.x)</text><text x="320" y="191" text-anchor="middle" class="svg-ink" font-size="12">loss 0.2%, latency 40 ms</text>
<text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="13">Dono tunnels "up" hain</text>
<text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">Voice ke liye sirf ek theek hai</text>
</svg><p class="cap">Routing table ko do working paths dikhte hain. AAR ko dikhta hai ki ek path voice call ke liye unfit hai.</p></div>

<h3>Chaar tarah ki policy, har ek ka saaf kaam</h3>
<p>Catalyst SD-WAN mein kai policy types hain. Inhe mix kar dena exam ki number one galti hai, isliye picture abhi pakki kar lo.</p>
<table class="cmp"><tr><th>Policy</th><th>Kahan likhi / enforce hoti hai</th><th>Kya badalti hai</th></tr>
<tr><td><b>Centralized control policy</b></td><td>Manager par likhi, <b>Controller</b> par chalti hai</td><td>Controller jo OMP routes aur TLOCs advertise karta hai (topology, VPN membership, service chaining)</td></tr>
<tr><td><b>Centralized data policy</b></td><td>Manager par likhi, Controller bhejta hai, <b>WAN Edge par enforce</b></td><td>Matching packets kaise forward hon: accept, drop, mark, TLOC chunna, NAT, FEC</td></tr>
<tr><td><b>Application-aware routing (app-route) policy</b></td><td>Wahi raasta: Manager, Controller, WAN Edge</td><td>Kaunsa tunnel use ho, <b>SLA class</b> ke against measure kiye gaye loss, latency aur jitter ke basis par</td></tr>
<tr><td><b>Localized policy</b></td><td>Manager par likhi, device configuration ke saath push hoti hai, local enforce</td><td>ACLs, QoS, route policy <b>ek device</b> par</td></tr></table>
<p>Yeh module doosri aur teesri row ke baare mein hai. Ek subtle baat dhyan do: data policy aur app-route policy <i>centralized</i> isliye hain kyunki aap unhe ek baar likhte ho aur Controller distribute karta hai, lekin woh edge par <b>data-plane</b> traffic par kaam karti hain. Controller aapke packets kabhi nahi dekhta.</p>

<h3>Yeh kyun zaroori hai</h3>
<p>Companies resilience aur cost ke liye doosra transport leti hain, aksar MPLS plus business internet. Agar dono ko andhaadhund (ECMP) use karo to jab sasta link kharab ghanta guzaarta hai tab voice call suffer karti hai. Agar sab kuch sirf MPLS par bhejo to mehenga circuit backups se bhar jaata hai aur internet link khaali padi rehti hai. AAR beech ka raasta deta hai: <b>voice aur video woh tunnel use karte hain jo unki SLA meet kare; bulk traffic sasta wala use karta hai; aur jab koi tunnel degrade hota hai to traffic bina insaan ke seconds se minutes mein shift ho jaata hai.</b></p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail ki Pune branch E-BR1 (system-ip 10.255.0.21) ke is module ke examples mein do colors hain: GigabitEthernet1 par <code>biz-internet</code> (203.0.113.10) aur GigabitEthernet2 par <code>mpls</code> (172.16.1.2). Mumbai hub E-DC (10.255.0.1) ke paas bhi dono hain. 10.1.10.0/24 ka staff DC ko voice call karta hai, billing sessions chalata hai aur raat ko backups. Humein chahiye: voice kisi bhi tunnel par jahan loss 1% se kam, latency 150 ms se kam aur jitter 30 ms se kam ho; billing preferably MPLS par; backups internet tunnel par. Ek centralized policy set yeh site-list ke har branch ko deta hai, aur har branch apne tunnels khud measure karti hai.</p></div>

<div class="note"><p><b>Lab note.</b> Is track ki lab topologies mein branch par aksar sirf <code>biz-internet</code> transport hota hai. Is module ke do-color examples illustrative hain: commands aur outputs bilkul waise hi hain jaise do colors hone par dikhte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki AAR paths banata hai. Nahi banata. AAR sirf <b>un paths ke beech chunta hai jo OMP ne pehle se diye hain</b>: agar Controller DC prefix ke liye sirf ek TLOC advertise kare to chunne ko kuch nahi bachta. Pehle topology design karo (control policy aur TLOCs), phir steer karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsi policy loss, latency aur jitter measure karti hai?" Koi policy kuch measure nahi karti. Har IPsec tunnel ke andar chalne wale <b>BFD</b> sessions measure karte hain. App-route policy sirf un measurements ko SLA class se <i>compare</i> karti hai.</p></div>

<div class="scn"><h4>Subah 11 baje toot-ti voice calls</h4><p>Roz subah 11 baje ke aaspaas Pune help desk ne Mumbai ko choppy voice calls report kiye. WAN team ko dono tunnels up dikhe aur koi alarm nahi tha. Tunnel statistics dekhne par internet tunnel us ghante mein 4% loss aur 180 ms latency dikha raha tha kyunki local ISP congested tha, jabki MPLS saaf tha. Voice traffic dono tunnels mein load-share ho raha tha, isliye har call ka aadha hissa kharab path par jaata tha. SLA class aur voice ke liye app-route policy lagane ke baad edge ne internet tunnel SLA fail hone par voice ke liye use karna band kar diya, aur ISP ko chhue bina complaints khatam ho gaye.</p><p><b>Lesson:</b> "up" ka matlab "good" nahi hota. Pehle path measure karo, phir decide karo.</p></div>

<div class="iv"><p class="q">"Application-aware routing kaunsi problem solve karta hai jo normal routing aur ECMP nahi kar sakte?"</p><p>Strong answer: routing protocols sirf yeh jaante hain ki path exist karta hai ya nahi, yeh nahi ki woh healthy hai ya nahi. AAR BFD se har tunnel ka loss, latency aur jitter lagatar measure karta hai, SLA classes se compare karta hai, aur har application ko aise tunnel par steer karta hai jo uski SLA meet kare, isliye brownouts automatically handle ho jaate hain. Yeh bhi jodo ki AAR sirf OMP-advertised paths ke beech chunta hai aur WAN Edge par enforce hota hai, Controller par nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel "up" hote hue bhi voice ke liye unusable ho sakta hai; AAR isi ko pakadne ke liye hai.</li>
<li>Control policy Controller par routes banati hai; data aur app-route policy WAN Edge par forwarding banati hain.</li>
<li>BFD tunnels measure karta hai; SLA class "kaafi accha" define karti hai; app-route policy applications ko tunnels se map karti hai.</li>
<li>AAR sirf un paths ke beech chun sakta hai jo OMP pehle se advertise karta hai.</li>
<li>Ek policy Manager par ek baar likhi jaati hai aur site-lists se kai sites par lagti hai.</li>
</ul></div>
`}};export{e as default};