var e={id:`quality-distribution-profiles`,h:{en:`Path quality profiles and traffic distribution profiles`,hi:`Path quality profiles aur traffic distribution profiles`},body:{en:`
<p>Two profiles carry the intelligence of PAN-OS SD-WAN. The <b>path quality profile</b> answers "when is a path bad?". The <b>traffic distribution profile</b> answers "when a path is bad, or when there are several good ones, which link do I use?". Together they replace the question "which interface?" with "which kind of link, and how good must it be?".</p>
<h3>Analogy: the doctor and the dispatcher</h3>
<p>The path quality profile is a doctor with a thermometer: above a certain temperature the patient is ill. The traffic distribution profile is the dispatcher who decides, once a road is declared ill, which healthy road gets the trucks, and in what order of preference.</p>
<h3>Path quality profile</h3>
<table class="cmp"><tr><th>Parameter</th><th>Range</th><th>Default</th><th>Sensitivity</th></tr>
<tr><td><b>Latency</b> (round trip, ms)</td><td>10 to 2,000 (Strata Cloud Manager allows up to 3,000)</td><td>100</td><td>Low, Medium (default), High</td></tr>
<tr><td><b>Jitter</b> (ms)</td><td>10 to 1,000 (Strata Cloud Manager 10 to 2,000)</td><td>100</td><td>Low, Medium (default), High</td></tr>
<tr><td><b>Packet loss</b> (percent)</td><td>1 to 100</td><td>1</td><td>No effect; leave at the default</td></tr>
<tr><td><b>Bandwidth</b> (utilisation percent)</td><td>1 to 100</td><td>100</td><td>Low, Medium (default), High</td></tr></table>
<p>The documentation says that latency, jitter and packet loss are treated as OR conditions: exceeding any one threshold causes the firewall to replace the path. When sensitivities are equal (the usual Medium), the firewall evaluates packet loss first, then latency, then jitter.</p>
<h3>Traffic distribution profile: three methods</h3>
<table class="cmp"><tr><th>Method</th><th>Idea</th><th>Brownout failover?</th></tr>
<tr><td><b>Best Available Path</b></td><td>Put application experience first. The firewall uses path quality metrics and fails over to one of the links belonging to a tag in the list, picking the one that gives the best experience</td><td>Yes: affected sessions move to a better path when available</td></tr>
<tr><td><b>Top Down Priority</b></td><td>Put cost first. Link tags are listed in order, cheapest first. If no link in the top tag qualifies under the path quality profile, the firewall uses a link from the second tag, and so on. After a failover, evaluation restarts from the top of the list</td><td>Yes</td></tr>
<tr><td><b>Weighted Session Distribution</b></td><td>Manual load sharing. You give each tag a static percentage of new sessions</td><td>No: if a link has a brownout, matching traffic is not redirected; only a complete outage triggers failover</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three distribution methods">
<rect x="10" y="10" width="200" height="230" rx="12" fill="#e0f2fe"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="13">Best Available Path</text>
<rect x="30" y="55" width="160" height="35" rx="6" fill="#fff"/><text x="110" y="78" text-anchor="middle" class="svg-ink" font-size="11">Tag list: Broadband, Cellular</text>
<rect x="30" y="105" width="160" height="35" rx="6" fill="#fff"/><text x="110" y="128" text-anchor="middle" class="svg-ink" font-size="11">Measure quality</text>
<rect x="30" y="155" width="160" height="60" rx="6" fill="#bbf7d0"/><text x="110" y="180" text-anchor="middle" class="svg-ink" font-size="11">Pick the best link</text><text x="110" y="198" text-anchor="middle" class="svg-muted" font-size="10">moves on brownout</text>
<rect x="225" y="10" width="200" height="230" rx="12" fill="#fef9c3"/><text x="325" y="35" text-anchor="middle" class="svg-ink" font-size="13">Top Down Priority</text>
<rect x="245" y="55" width="160" height="35" rx="6" fill="#fff"/><text x="325" y="78" text-anchor="middle" class="svg-ink" font-size="11">1. MPLS tag (cheapest)</text>
<rect x="245" y="105" width="160" height="35" rx="6" fill="#fff"/><text x="325" y="128" text-anchor="middle" class="svg-ink" font-size="11">2. Broadband tag</text>
<rect x="245" y="155" width="160" height="60" rx="6" fill="#bbf7d0"/><text x="325" y="180" text-anchor="middle" class="svg-ink" font-size="11">First tag with a</text><text x="325" y="198" text-anchor="middle" class="svg-ink" font-size="11">qualified link</text>
<rect x="440" y="10" width="190" height="230" rx="12" fill="#fde2e2"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13">Weighted Session</text>
<rect x="460" y="55" width="150" height="35" rx="6" fill="#fff"/><text x="535" y="78" text-anchor="middle" class="svg-ink" font-size="11">Broadband 70 percent</text>
<rect x="460" y="105" width="150" height="35" rx="6" fill="#fff"/><text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="11">Cellular 30 percent</text>
<rect x="460" y="155" width="150" height="60" rx="6" fill="#fed7aa"/><text x="535" y="180" text-anchor="middle" class="svg-ink" font-size="11">Static split of new</text><text x="535" y="198" text-anchor="middle" class="svg-ink" font-size="11">sessions, no brownout move</text>
</svg><p class="cap">Best Available Path favours experience, Top Down Priority favours cost, Weighted Session Distribution is a static split.</p></div>
<h3>Brownout and blackout</h3>
<p>A <b>blackout</b> is a complete link failure. A <b>brownout</b> is a link that still passes traffic but badly (high latency, jitter or loss). Probing in the tunnel detects both. Best Available Path and Top Down Priority react to brownouts; Weighted Session Distribution reacts only to blackouts.</p>
<h3>Choosing a method</h3>
<ul>
<li>Voice and video over two broadband links: Best Available Path.</li>
<li>Expensive MPLS to be used only when internet is bad, or metered 5G as the last tier: Top Down Priority with the cheap tag first.</li>
<li>Bulk traffic that should simply be spread 70 to 30 over two circuits: Weighted Session Distribution.</li>
</ul>
<div class="eg"><p><b>Worked example: STORE-007 voice.</b> Path quality profile "voice-pq": latency 150 ms, jitter 30 ms, loss 1 percent (design values chosen for this story, not product defaults). Distribution profile "voice-best": Best Available Path over tags Broadband and Cellular. If broadband loss rises to 3 percent, loss alone breaks the OR condition, new and affected sessions move to the best link in the list, which may be the other broadband link, and cellular is used only if it is the best remaining.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Leaving every profile at the defaults and hoping. Expecting Weighted Session Distribution to move traffic away from a degraded link. Setting thresholds so tight that paths flap. Ordering Top Down Priority with the expensive link first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Which method does not redirect traffic on brownout? Weighted Session Distribution. Which is described as cost control with a hierarchy of link tags? Top Down Priority. Which parameter's sensitivity setting has no effect? Packet loss.</p></div>
<div class="scn"><h4>The 5G link that was never used</h4><p>A branch has broadband, MPLS and 5G. The team wants 5G only as a last resort, but sessions keep landing on it. Their profile is Weighted Session Distribution with 5G at 20 percent. Switching to Top Down Priority with tags in the order MPLS, Broadband, Cellular makes 5G used only when no link in the higher tags qualifies.</p></div>
<div class="iv"><p class="q">"Explain the difference between a path quality profile and a traffic distribution profile."</p><p>The path quality profile defines the thresholds (latency, jitter, loss, bandwidth) that decide whether a path is acceptable. The traffic distribution profile decides how to choose links, by link tag, when a path fails those thresholds or when load must be shared. Both are referenced from an SD-WAN policy rule.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path quality profile: latency, jitter, loss, bandwidth thresholds; any one breach is enough.</li>
<li>Distribution methods: Best Available Path, Top Down Priority, Weighted Session Distribution.</li>
<li>Weighted Session Distribution does not move traffic on brownout.</li>
<li>Match the method to the business goal: experience, cost or fixed share.</li>
</ul></div>
`,hi:`
<p>PAN-OS SD-WAN ki intelligence do profiles mein hai. <b>Path quality profile</b> jawab deta hai "path kab kharab hai?". <b>Traffic distribution profile</b> jawab deta hai "jab path kharab ho, ya kai achhe hon, to kaunsa link use karun?". Milkar yeh "kaunsa interface?" sawal ko "kaunsi kism ka link, aur kitna achha hona chahiye?" se badal dete hain.</p>
<h3>Analogy: doctor aur dispatcher</h3>
<p>Path quality profile thermometer wala doctor hai: ek temperature ke upar patient beemar hai. Traffic distribution profile woh dispatcher hai jo road beemar ghoshit hone ke baad decide karta hai ki kaunse healthy road ko trucks milenge, aur kis pasand ke order mein.</p>
<h3>Path quality profile</h3>
<table class="cmp"><tr><th>Parameter</th><th>Range</th><th>Default</th><th>Sensitivity</th></tr>
<tr><td><b>Latency</b> (round trip, ms)</td><td>10 se 2,000 (Strata Cloud Manager 3,000 tak allow karta hai)</td><td>100</td><td>Low, Medium (default), High</td></tr>
<tr><td><b>Jitter</b> (ms)</td><td>10 se 1,000 (Strata Cloud Manager 10 se 2,000)</td><td>100</td><td>Low, Medium (default), High</td></tr>
<tr><td><b>Packet loss</b> (percent)</td><td>1 se 100</td><td>1</td><td>Koi asar nahi; default par chhodo</td></tr>
<tr><td><b>Bandwidth</b> (utilisation percent)</td><td>1 se 100</td><td>100</td><td>Low, Medium (default), High</td></tr></table>
<p>Documentation kehti hai ki latency, jitter aur packet loss OR conditions ki tarah treat hote hain: koi bhi ek threshold cross hone par firewall path replace karta hai. Jab sensitivities barabar hon (aam taur par Medium), firewall pehle packet loss, phir latency, phir jitter evaluate karta hai.</p>
<h3>Traffic distribution profile: teen methods</h3>
<table class="cmp"><tr><th>Method</th><th>Idea</th><th>Brownout failover?</th></tr>
<tr><td><b>Best Available Path</b></td><td>Application experience pehle. Firewall path quality metrics use karta hai aur list ke kisi tag ke links mein se best experience dene wale par failover karta hai</td><td>Haan: affected sessions available hone par behtar path par move hote hain</td></tr>
<tr><td><b>Top Down Priority</b></td><td>Cost pehle. Link tags order mein listed hain, sabse sasta pehle. Agar top tag ka koi link path quality profile ke hisaab se qualify na kare to firewall dusre tag ka link use karta hai, aur aage. Failover ke baad evaluation list ke top se dobara shuru hota hai</td><td>Haan</td></tr>
<tr><td><b>Weighted Session Distribution</b></td><td>Manual load sharing. Aap har tag ko naye sessions ka static percentage dete ho</td><td>Nahi: agar link mein brownout ho to matching traffic redirect nahi hota; sirf poora outage failover trigger karta hai</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three distribution methods">
<rect x="10" y="10" width="200" height="230" rx="12" fill="#e0f2fe"/><text x="110" y="35" text-anchor="middle" class="svg-ink" font-size="13">Best Available Path</text>
<rect x="30" y="55" width="160" height="35" rx="6" fill="#fff"/><text x="110" y="78" text-anchor="middle" class="svg-ink" font-size="11">Tag list: Broadband, Cellular</text>
<rect x="30" y="105" width="160" height="35" rx="6" fill="#fff"/><text x="110" y="128" text-anchor="middle" class="svg-ink" font-size="11">Measure quality</text>
<rect x="30" y="155" width="160" height="60" rx="6" fill="#bbf7d0"/><text x="110" y="180" text-anchor="middle" class="svg-ink" font-size="11">Pick the best link</text><text x="110" y="198" text-anchor="middle" class="svg-muted" font-size="10">moves on brownout</text>
<rect x="225" y="10" width="200" height="230" rx="12" fill="#fef9c3"/><text x="325" y="35" text-anchor="middle" class="svg-ink" font-size="13">Top Down Priority</text>
<rect x="245" y="55" width="160" height="35" rx="6" fill="#fff"/><text x="325" y="78" text-anchor="middle" class="svg-ink" font-size="11">1. MPLS tag (cheapest)</text>
<rect x="245" y="105" width="160" height="35" rx="6" fill="#fff"/><text x="325" y="128" text-anchor="middle" class="svg-ink" font-size="11">2. Broadband tag</text>
<rect x="245" y="155" width="160" height="60" rx="6" fill="#bbf7d0"/><text x="325" y="180" text-anchor="middle" class="svg-ink" font-size="11">First tag with a</text><text x="325" y="198" text-anchor="middle" class="svg-ink" font-size="11">qualified link</text>
<rect x="440" y="10" width="190" height="230" rx="12" fill="#fde2e2"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="13">Weighted Session</text>
<rect x="460" y="55" width="150" height="35" rx="6" fill="#fff"/><text x="535" y="78" text-anchor="middle" class="svg-ink" font-size="11">Broadband 70 percent</text>
<rect x="460" y="105" width="150" height="35" rx="6" fill="#fff"/><text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="11">Cellular 30 percent</text>
<rect x="460" y="155" width="150" height="60" rx="6" fill="#fed7aa"/><text x="535" y="180" text-anchor="middle" class="svg-ink" font-size="11">Static split of new</text><text x="535" y="198" text-anchor="middle" class="svg-ink" font-size="11">sessions, no brownout move</text>
</svg><p class="cap">Best Available Path experience ko, Top Down Priority cost ko, Weighted Session Distribution static split ko prefer karta hai.</p></div>
<h3>Brownout aur blackout</h3>
<p><b>Blackout</b> poora link failure hai. <b>Brownout</b> woh link hai jo traffic pass karta hai par kharab tareeke se (high latency, jitter ya loss). Tunnel mein probing dono detect karti hai. Best Available Path aur Top Down Priority brownouts par react karte hain; Weighted Session Distribution sirf blackouts par.</p>
<h3>Method chunna</h3>
<ul>
<li>Do broadband links par voice aur video: Best Available Path.</li>
<li>Mehenga MPLS sirf internet kharab hone par, ya metered 5G aakhri tier: Top Down Priority, sasta tag pehle.</li>
<li>Bulk traffic jo bas do circuits par 70 se 30 mein baantna hai: Weighted Session Distribution.</li>
</ul>
<div class="eg"><p><b>Worked example: STORE-007 voice.</b> Path quality profile "voice-pq": latency 150 ms, jitter 30 ms, loss 1 percent (is kahani ke liye chune design values, product defaults nahi). Distribution profile "voice-best": tags Broadband aur Cellular par Best Available Path. Agar broadband loss 3 percent ho jaye to akela loss OR condition tod deta hai, naye aur affected sessions list ke best link par move hote hain, jo doosra broadband link ho sakta hai, aur cellular tabhi use hota hai jab woh bacha hua best ho.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Har profile default par chhodkar ummeed karna. Weighted Session Distribution se ummeed karna ki woh degraded link se traffic hata dega. Thresholds itne tight karna ki paths flap karein. Top Down Priority mein mehenga link pehle rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaunsa method brownout par traffic redirect nahi karta? Weighted Session Distribution. Link tags ke hierarchy ke saath cost control kise kehte hain? Top Down Priority. Kis parameter ki sensitivity setting ka koi asar nahi? Packet loss.</p></div>
<div class="scn"><h4>5G link jo kabhi use nahi hona tha</h4><p>Branch ke paas broadband, MPLS aur 5G hai. Team 5G sirf aakhri sahare ke roop mein chahti hai, par sessions usi par aate rehte hain. Unka profile Weighted Session Distribution hai jisme 5G 20 percent hai. Top Down Priority par jaana, tags ke order MPLS, Broadband, Cellular ke saath, 5G ko tabhi use karata hai jab upar ke tags ka koi link qualify na kare.</p></div>
<div class="iv"><p class="q">"Path quality profile aur traffic distribution profile mein farak samjhao."</p><p>Path quality profile thresholds (latency, jitter, loss, bandwidth) define karta hai jo decide karte hain ki path acceptable hai ya nahi. Traffic distribution profile decide karta hai ki link tag ke hisaab se links kaise chune jayein, jab path un thresholds mein fail ho ya load share karna ho. Dono SD-WAN policy rule se refer hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path quality profile: latency, jitter, loss, bandwidth thresholds; koi ek breach kaafi hai.</li>
<li>Distribution methods: Best Available Path, Top Down Priority, Weighted Session Distribution.</li>
<li>Weighted Session Distribution brownout par traffic move nahi karta.</li>
<li>Method ko business goal se milao: experience, cost ya fixed share.</li>
</ul></div>
`}};export{e as default};