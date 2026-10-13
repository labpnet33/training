var e={id:`secure-sd-wan`,h:{en:`Secure SD-WAN and application-aware paths (concept)`,hi:`Secure SD-WAN aur application-aware paths (concept)`},body:{en:`
<p>You now know two building blocks: a VPN that protects traffic between sites, and Multi-Link that gives an engine several internet lines. <b>SD-WAN</b> (software-defined wide area network) combines them and adds a brain that chooses a path for each kind of traffic. This chapter is a concept chapter.</p>
<div class="note"><p><b>Concept, built on the labs.</b> The simulator models VPN and Multi-Link only. Application-aware steering, quality measurement and central path policy are described here as ideas. Product features differ by release, so check the documentation for your NGFW version.</p></div>

<h3>Analogy: a delivery company with many routes</h3>
<p>A courier firm has a motorway, a city road and a rail option. Urgent medicines go by the fastest route that is currently clear. Heavy catalogues go by the cheapest route. When the motorway is jammed, the dispatcher notices and reroutes the medicines. SD-WAN is that dispatcher. The routes are your links (broadband, leased line, mobile). The parcels are your applications.</p>

<h3>Why branches moved to SD-WAN</h3>
<p>Older branches sent all traffic over one expensive private circuit to HQ. Today most traffic is cloud and web based. Backhauling it through HQ wastes money and adds delay. Cheap internet links are plentiful, but they vary in quality. SD-WAN lets a branch use several links at once, protect the traffic with VPN tunnels, and pick the best link for each application.</p>

<h3>The building blocks</h3>
<table class="cmp"><tr><th>Block</th><th>Job</th><th>You already met it as</th></tr>
<tr><td>Underlay</td><td>The real internet lines from the ISPs</td><td>Multi-Link links</td></tr>
<tr><td>Overlay</td><td>Encrypted tunnels between sites on top of the lines</td><td>Policy-based VPN</td></tr>
<tr><td>Health measurement</td><td>Latency, loss and jitter per path, checked continuously</td><td>Probes (in the model: alive or not)</td></tr>
<tr><td>Path policy</td><td>Rules saying which application uses which path</td><td>Access rules with a VPN option; a richer form is concept only</td></tr>
<tr><td>Central management</td><td>One place to define and roll out all of it</td><td>The SMC and Install Policy</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="SD-WAN layers">
<rect x="10" y="10" width="620" height="44" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Path policy: voice via best quality, backup via cheap line</text>
<rect x="10" y="64" width="620" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">Health measurement: latency, loss, jitter, alive or dead</text>
<rect x="10" y="118" width="620" height="44" rx="8" fill="#bae6fd"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="14">Overlay: encrypted VPN tunnels between sites</text>
<rect x="10" y="172" width="300" height="44" rx="8" fill="#bbf7d0"/><text x="160" y="200" text-anchor="middle" class="svg-ink" font-size="14">Underlay link 1: fibre ISP1</text>
<rect x="330" y="172" width="300" height="44" rx="8" fill="#fed7aa"/><text x="480" y="200" text-anchor="middle" class="svg-ink" font-size="14">Underlay link 2: broadband ISP2</text>
</svg><p class="cap">SD-WAN is layers. The labs teach the two bottom layers and a simple form of the health layer.</p></div>

<h3>Application-aware path selection</h3>
<p>Different applications need different things. A voice call hates delay and jitter but needs little bandwidth. A file backup needs bandwidth but tolerates delay. An application-aware design identifies the application and sends it over the path that best fits its needs, while the path stays within a set quality target (for example latency under 80 ms and loss under 1 percent). When the path breaks the target, new sessions move to another path. Some designs also keep working sessions where they are, to avoid breaking them. How an engine recognises applications and the exact options depend on the release.</p>

<div class="eg"><p><b>Worked example.</b> Pune has fibre (ISP1, 12 ms, almost no loss) and broadband (ISP2, 35 ms, 0.5 percent loss). Policy: video calls prefer the path with lowest jitter, bulk backup prefers ISP2, all traffic to HQ travels inside VPN tunnels over either line. At 14:00 ISP1 starts dropping 6 percent of packets. Health measurement marks ISP1 poor for video, so new calls use ISP2, while backups already on ISP2 are unchanged. In the lab model you would see something simpler: ISP1 alive or not, decided by a probe.</p></div>

<h3>Security is part of the design</h3>
<p>An SD-WAN with direct internet access at every branch needs a firewall at every branch. That is why a next generation firewall is a natural SD-WAN device: the same engine inspects traffic, builds the VPN tunnels and selects links. Keep the access rules tight and keep inspection on for internet traffic. Do not let "optimisation" skip security.</p>

<div class="warn"><p><b>Common mistakes.</b> Treating SD-WAN as a magic product that replaces design. Building the overlay but forgetting the NAT exception, so tunnels stay empty. Choosing health targets that are unreliable. Using the same ISP for both links, so one failure removes both.</p></div>
<div class="exam"><p><b>Exam trap.</b> SD-WAN is not one protocol. It is a design built from an underlay of links, an overlay of tunnels, health measurement and path policy.</p></div>

<div class="scn"><h4>Video calls that stuttered every afternoon</h4><p>Every afternoon Pune video calls broke up. Both links were up, so nothing alarmed. Measurements showed the main fibre line had heavy loss during business hours because of a shared local segment. The team changed the design: calls prefer the cleaner path whenever loss exceeds a limit, backups stay on the cheap line. Calls stopped stuttering without buying more bandwidth.</p><p><b>Lesson:</b> a link can be up and still be bad. Measure quality, not just alive or dead.</p></div>

<div class="iv"><p class="q">"What is SD-WAN and how does it relate to VPN and Multi-Link?"</p><p>Strong answer: SD-WAN uses several underlay links, builds encrypted overlay tunnels over them, measures path quality, and steers applications by policy under central management. Multi-Link supplies the multiple links and failover; VPN supplies the secure overlay; the extra layer is quality-based, application-aware selection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN = underlay links + VPN overlay + health measurement + path policy + central management.</li>
<li>Multi-Link and VPN from earlier chapters are its foundation.</li>
<li>Application-aware selection matches traffic needs with path quality.</li>
<li>Alive is not the same as good; measure latency, loss and jitter.</li>
<li>This chapter is a concept; the simulator models only VPN and Multi-Link.</li>
</ul></div>
`,hi:`
<p>Ab aap do building blocks jaante ho: ek VPN jo sites ke beech traffic protect karta hai, aur Multi-Link jo engine ko kai internet lines deta hai. <b>SD-WAN</b> (software-defined wide area network) dono ko jodta hai aur ek dimaag add karta hai jo har tarah ke traffic ke liye path chunta hai. Yeh ek concept chapter hai.</p>
<div class="note"><p><b>Concept, labs par based.</b> Simulator sirf VPN aur Multi-Link model karta hai. Application-aware steering, quality measurement aur central path policy yahan ideas ke roop mein samjhayi gayi hain. Product features release ke hisaab se alag hote hain, isliye check the documentation for your NGFW version.</p></div>

<h3>Analogy: kai routes wali delivery company</h3>
<p>Ek courier firm ke paas motorway, city road aur rail option hai. Urgent dawaiyan sabse tez clear route se jaati hain. Bhaari catalogues sabse sasti route se. Motorway mein jam ho to dispatcher dekhta hai aur dawaiyon ko reroute karta hai. SD-WAN wahi dispatcher hai. Routes aapke links hain (broadband, leased line, mobile). Parcels aapki applications hain.</p>

<h3>Branches SD-WAN par kyun gaye</h3>
<p>Purane branches saara traffic ek mehenge private circuit se HQ bhejte the. Aaj zyada tar traffic cloud aur web based hai. Use HQ se ghumana paisa waste karta hai aur delay badhata hai. Sasti internet links bahut hain, lekin unki quality alag-alag hoti hai. SD-WAN branch ko ek saath kai links use karne deta hai, traffic ko VPN tunnels se protect karta hai, aur har application ke liye best link chunta hai.</p>

<h3>Building blocks</h3>
<table class="cmp"><tr><th>Block</th><th>Kaam</th><th>Aap ise pehle kya jaante the</th></tr>
<tr><td>Underlay</td><td>ISPs ki asli internet lines</td><td>Multi-Link links</td></tr>
<tr><td>Overlay</td><td>Lines ke upar sites ke beech encrypted tunnels</td><td>Policy-based VPN</td></tr>
<tr><td>Health measurement</td><td>Har path ka latency, loss aur jitter, lagataar check</td><td>Probes (model mein: alive ya nahi)</td></tr>
<tr><td>Path policy</td><td>Rules jo batate hain kaun si application kaun sa path use kare</td><td>VPN option wale Access rules; richer form sirf concept</td></tr>
<tr><td>Central management</td><td>Sab kuch define aur roll out karne ki ek jagah</td><td>SMC aur Install Policy</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="SD-WAN layers">
<rect x="10" y="10" width="620" height="44" rx="8" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Path policy: voice best quality se, backup sasti line se</text>
<rect x="10" y="64" width="620" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">Health measurement: latency, loss, jitter, alive ya dead</text>
<rect x="10" y="118" width="620" height="44" rx="8" fill="#bae6fd"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="14">Overlay: sites ke beech encrypted VPN tunnels</text>
<rect x="10" y="172" width="300" height="44" rx="8" fill="#bbf7d0"/><text x="160" y="200" text-anchor="middle" class="svg-ink" font-size="14">Underlay link 1: fibre ISP1</text>
<rect x="330" y="172" width="300" height="44" rx="8" fill="#fed7aa"/><text x="480" y="200" text-anchor="middle" class="svg-ink" font-size="14">Underlay link 2: broadband ISP2</text>
</svg><p class="cap">SD-WAN layers ka naam hai. Labs neeche ki do layers aur health layer ka simple form sikhati hain.</p></div>

<h3>Application-aware path selection</h3>
<p>Alag applications ko alag cheezein chahiye. Voice call ko delay aur jitter se nafrat hai lekin bandwidth kam chahiye. File backup ko bandwidth chahiye lekin delay chalta hai. Application-aware design application ko pehchanta hai aur use us path par bhejta hai jo uski zaroorat se best match kare, jab tak path ek set quality target ke andar hai (jaise latency 80 ms se kam aur loss 1 percent se kam). Path target tod de to naye sessions doosre path par jaate hain. Kuch designs chalte sessions ko wahin rakhte hain taaki woh na toote. Engine applications kaise pehchanta hai aur exact options release par depend karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Pune ke paas fibre (ISP1, 12 ms, lagbhag koi loss nahi) aur broadband (ISP2, 35 ms, 0.5 percent loss) hai. Policy: video calls sabse kam jitter wala path prefer karein, bulk backup ISP2 prefer kare, HQ ka saara traffic kisi bhi line par VPN tunnels ke andar jaaye. 14:00 par ISP1 6 percent packets drop karne lagta hai. Health measurement ISP1 ko video ke liye poor mark karta hai, isliye naye calls ISP2 use karte hain, jabki ISP2 par pehle se chalte backups waise hi rehte hain. Lab model mein aapko kuch simple dikhega: ISP1 alive ya nahi, probe se decide.</p></div>

<h3>Security design ka hissa hai</h3>
<p>Har branch par direct internet access wale SD-WAN mein har branch par firewall chahiye. Isliye next generation firewall SD-WAN device ke liye natural hai: wahi engine traffic inspect karta hai, VPN tunnels banata hai aur links chunta hai. Access rules tight rakho aur internet traffic ke liye inspection on rakho. "Optimisation" ke naam par security skip mat karo.</p>

<div class="warn"><p><b>Common mistakes.</b> SD-WAN ko aisa magic product maanna jo design ki jagah le leta hai. Overlay banana lekin NAT exception bhool jaana, jisse tunnels khaali rehte hain. Unreliable health targets chunna. Dono links ke liye same ISP lena, jisse ek failure dono hata deti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> SD-WAN koi ek protocol nahi hai. Yeh links ke underlay, tunnels ke overlay, health measurement aur path policy se bana design hai.</p></div>

<div class="scn"><h4>Video calls jo har dopahar atakti thin</h4><p>Har dopahar Pune ke video calls toot-toot kar chalte the. Dono links up the, isliye koi alarm nahi bajta tha. Measurements ne dikhaya ki main fibre line par business hours mein shared local segment ki wajah se heavy loss tha. Team ne design badla: loss limit se upar jaane par calls cleaner path prefer karein, backups sasti line par rahein. Zyada bandwidth kharide bina calls atakna band ho gaye.</p><p><b>Lesson:</b> link up hote hue bhi kharab ho sakta hai. Sirf alive ya dead nahi, quality measure karo.</p></div>

<div class="iv"><p class="q">"SD-WAN kya hai aur VPN aur Multi-Link se kaise juda hai?"</p><p>Strong answer: SD-WAN kai underlay links use karta hai, unke upar encrypted overlay tunnels banata hai, path quality measure karta hai, aur central management ke tahat policy se applications ko steer karta hai. Multi-Link kai links aur failover deta hai; VPN secure overlay deta hai; extra layer quality-based, application-aware selection hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN = underlay links + VPN overlay + health measurement + path policy + central management.</li>
<li>Pichhle chapters ka Multi-Link aur VPN uski buniyaad hain.</li>
<li>Application-aware selection traffic ki zaroorat ko path quality se match karta hai.</li>
<li>Alive aur good ek jaise nahi; latency, loss aur jitter measure karo.</li>
<li>Yeh chapter concept hai; simulator sirf VPN aur Multi-Link model karta hai.</li>
</ul></div>
`}};export{e as default};