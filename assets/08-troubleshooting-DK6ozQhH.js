var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: policy mistakes`,hi:`Troubleshooting workflow: policy ki galtiyan`},body:{en:`
<p>Policy problems feel mysterious because the symptom appears on an edge while the cause sits on the Controller. A fixed order of questions removes the mystery.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Policy troubleshooting flow">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Is it active?</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="12">Manager and Controller</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">2 Applied right?</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="12">site list, direction</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">3 Sequences</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="12">order, default action</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">4 Lists</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">members, VPNs</text>
<rect x="90" y="120" width="140" height="60" rx="10" fill="#fde68a"/><text x="160" y="146" text-anchor="middle" class="svg-ink" font-size="13">5 OMP view</text><text x="160" y="164" text-anchor="middle" class="svg-muted" font-size="12">routes, TLOCs, status</text>
<rect x="250" y="120" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">6 Data plane</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">BFD, next hop</text>
<rect x="410" y="120" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="480" y="146" text-anchor="middle" class="svg-ink" font-size="13">7 Fix, pilot</text><text x="480" y="164" text-anchor="middle" class="svg-muted" font-size="12">then widen</text>
<path d="M150 50 L170 50 M310 50 L330 50 M470 50 L490 50 M230 150 L250 150 M390 150 L410 150" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Work from the Controller toward the edge</text>
</svg><p class="cap">Seven questions, always in this order.</p></div>

<h3>Symptom to cause</h3>
<table>
<tr><th>Symptom on the edge</th><th>Likely cause on the Controller</th></tr>
<tr><td>Policy had no effect at all</td><td>Not activated, wrong site list, or the site is in a different list than expected</td></tr>
<tr><td>Routes disappeared for a site</td><td>Default action reject with no sequence accepting them</td></tr>
<tr><td>Routes present but not installed (<code>Inv</code>, <code>U</code>)</td><td>Route accepted, TLOC sequence missing or TLOC list wrong</td></tr>
<tr><td>BFD sessions to unwanted sites still exist</td><td>Policy applied in the wrong direction or to the wrong site list</td></tr>
<tr><td>Service chain ignored</td><td>Service not advertised by the edge; wrong VPN; wrong service name</td></tr>
<tr><td>Site sees VPN it should not see</td><td>VPN membership policy missing or covers the wrong site list</td></tr>
<tr><td>Hub sees only half the routes</td><td>An <b>in</b> policy rejected a spoke's advertisements</td></tr>
</table>

<h3>Worked ticket 1: all branches lost the data-centre route</h3>
<pre class="out">E-MUM-1# show sdwan omp routes vpn 10 | include 10.1.10
(no output)

vsmart# show running-config policy control-policy HUB-SPOKE
 control-policy HUB-SPOKE
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   action accept
  default-action reject</pre>
<p>The policy accepts hub TLOCs but has no route sequence, so the default reject removed the data-centre routes. Add sequence 20 matching routes from the hub site list with action accept, then re-activate.</p>

<h3>Worked ticket 2: routes present, no traffic</h3>
<pre class="out">E-BLR-1# show sdwan omp routes vpn 10
VPN  PREFIX         FROM PEER      STATUS   TLOC IP       COLOR         ENCAP
10   10.1.10.0/24   10.255.255.2   Inv,U    10.255.0.11   biz-internet  ipsec</pre>
<p>The route is unresolved: its TLOC is not reachable. A TLOC sequence is missing or the TLOC list names the wrong color (for example a list with mpls only, while E-BLR-1 has only an internet color). Add the right color to the TLOC list, or add a sequence for the TLOC, and check BFD afterwards.</p>

<h3>Worked ticket 3: wrong direction</h3>
<p>A policy meant to limit what E-HYD-1 learns was applied <b>in</b> to site 400. The Controller then rejected updates received from Hyderabad, and the other sites lost Hyderabad's LAN. E-HYD-1 itself still saw everything. Change the direction to <b>out</b>, re-activate and confirm with the OMP tables on both sides.</p>

<h3>Worked ticket 4: the firewall is skipped</h3>
<pre class="out">vsmart# show omp services
(no entries)</pre>
<p>The Controller has no service route, so nothing can be chained. Check the service configuration on E-DEL-1: it must be in the right VPN, with the address of the firewall reachable in that VPN, and the service name must match what the policy uses. After the edge advertises the service, <code>show omp services</code> lists it.</p>

<h3>The rollback plan</h3>
<p>If the effect is worse than the problem, deactivate the policy from the Centralized Policy list (three dots, <b>Deactivate</b>). The overlay returns to the full mesh. Then fix the policy offline and pilot again. Keep deactivation in the change plan before you start.</p>

<div class="warn"><p><b>Common mistakes.</b> Debugging on the edge when the cause is on the Controller; changing several things at once; forgetting that a reject default silently removes routes and TLOCs; and not saving the "before" state.</p></div>
<div class="exam"><p><b>Exam trap.</b> Missing routes after a control policy usually point to default reject. Routes that exist but are not installed point to a missing or wrong TLOC. Unwanted sessions or wrong views point to direction or site list.</p></div>

<div class="scn"><h4>Half a hub</h4><p>After a change, E-DEL-1 could reach Hyderabad but not Mumbai. Mumbai's site 200 was missing from a list used in an in policy, and the policy's default action rejected its advertisements. The engineer compared <code>show omp routes</code> on the Controller (Mumbai LAN present) with the hub (absent), saw the route was being dropped on the way in, and then found the list mistake in minutes because he followed the seven questions.</p></div>

<div class="iv"><p class="q">"A branch lost routes right after a policy was activated. What are your first three steps?"</p><p>Strong answer: confirm the policy and apply-policy on the Controller (name, site list, direction); read the sequences and the default action for something that rejects the lost routes; compare OMP routes and TLOCs on the Controller and the edge. If it is urgent, deactivate to return to the mesh, then fix and pilot.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work from the Controller toward the edge, in a fixed order.</li>
<li>Default reject, wrong direction, missing TLOC sequence and wrong site list cause most failures.</li>
<li>Inv or U status means a route has no usable TLOC.</li>
<li>Always have a deactivation plan and a before-and-after capture.</li>
</ul></div>
`,hi:`
<p>Policy ki problems rahasyamayi lagti hain kyunki symptom edge par dikhta hai jabki karan Controller par hota hai. Sawalon ka fixed order yeh rahasya hata deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Policy troubleshooting flow">
<rect x="10" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Active hai?</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="12">Manager aur Controller</text>
<rect x="170" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="13">2 Sahi apply?</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="12">site list, direction</text>
<rect x="330" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">3 Sequences</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="12">order, default action</text>
<rect x="490" y="20" width="140" height="60" rx="10" fill="#bae6fd"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">4 Lists</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">members, VPNs</text>
<rect x="90" y="120" width="140" height="60" rx="10" fill="#fde68a"/><text x="160" y="146" text-anchor="middle" class="svg-ink" font-size="13">5 OMP view</text><text x="160" y="164" text-anchor="middle" class="svg-muted" font-size="12">routes, TLOCs, status</text>
<rect x="250" y="120" width="140" height="60" rx="10" fill="#fde68a"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">6 Data plane</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">BFD, next hop</text>
<rect x="410" y="120" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="480" y="146" text-anchor="middle" class="svg-ink" font-size="13">7 Fix, pilot</text><text x="480" y="164" text-anchor="middle" class="svg-muted" font-size="12">phir widen</text>
<path d="M150 50 L170 50 M310 50 L330 50 M470 50 L490 50 M230 150 L250 150 M390 150 L410 150" stroke="#64748b" stroke-width="2" fill="none"/>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Controller se edge ki taraf kaam karo</text>
</svg><p class="cap">Saat sawal, hamesha isi order mein.</p></div>

<h3>Symptom se karan tak</h3>
<table>
<tr><th>Edge par symptom</th><th>Controller par likely karan</th></tr>
<tr><td>Policy ka koi asar nahi</td><td>Activate nahi hui, galat site list, ya site expected se alag list mein hai</td></tr>
<tr><td>Site ke routes gayab</td><td>Default action reject aur koi sequence unhe accept nahi karti</td></tr>
<tr><td>Routes hain lekin installed nahi (<code>Inv</code>, <code>U</code>)</td><td>Route accept hua, TLOC sequence missing ya TLOC list galat</td></tr>
<tr><td>Unwanted sites ke BFD sessions ab bhi hain</td><td>Policy galat direction mein ya galat site list par apply hui</td></tr>
<tr><td>Service chain ignore ho gayi</td><td>Edge ne service advertise nahi ki; galat VPN; galat service name</td></tr>
<tr><td>Site woh VPN dekhti hai jo nahi dekhni chahiye</td><td>VPN membership policy missing ya galat site list cover karti hai</td></tr>
<tr><td>Hub ko aadhe routes dikhte hain</td><td>Ek <b>in</b> policy ne spoke ki advertisements reject kar di</td></tr>
</table>

<h3>Worked ticket 1: saari branches ne data-centre route kho diya</h3>
<pre class="out">E-MUM-1# show sdwan omp routes vpn 10 | include 10.1.10
(no output)

vsmart# show running-config policy control-policy HUB-SPOKE
 control-policy HUB-SPOKE
  sequence 10
   match tloc
    tloc-list HUB-TLOCS
   action accept
  default-action reject</pre>
<p>Policy hub TLOCs accept karti hai lekin route sequence nahi hai, isliye default reject ne data-centre routes hata diye. Hub site list ke routes match karne wali sequence 20 action accept ke saath jodo, phir re-activate karo.</p>

<h3>Worked ticket 2: routes hain, traffic nahi</h3>
<pre class="out">E-BLR-1# show sdwan omp routes vpn 10
VPN  PREFIX         FROM PEER      STATUS   TLOC IP       COLOR         ENCAP
10   10.1.10.0/24   10.255.255.2   Inv,U    10.255.0.11   biz-internet  ipsec</pre>
<p>Route unresolved hai: uska TLOC reachable nahi. TLOC sequence missing hai ya TLOC list mein galat color hai (jaise sirf mpls wali list, jabki E-BLR-1 ke paas sirf internet color hai). TLOC list mein sahi color jodo, ya TLOC ke liye sequence jodo, aur baad mein BFD check karo.</p>

<h3>Worked ticket 3: galat direction</h3>
<p>E-HYD-1 jo seekhe use limit karne ki policy site 400 par <b>in</b> apply ho gayi. Controller ne Hyderabad se aaye updates reject kar diye, aur baaki sites ne Hyderabad ka LAN kho diya. E-HYD-1 ko khud sab kuch dikhta raha. Direction <b>out</b> karo, re-activate karo aur dono taraf OMP tables se confirm karo.</p>

<h3>Worked ticket 4: firewall skip ho raha hai</h3>
<pre class="out">vsmart# show omp services
(no entries)</pre>
<p>Controller ke paas service route nahi, isliye kuch chain nahi ho sakta. E-DEL-1 par service configuration check karo: woh sahi VPN mein honi chahiye, firewall ka address us VPN mein reachable hona chahiye, aur service name policy ke naam se match karna chahiye. Edge ke service advertise karne ke baad <code>show omp services</code> use list karta hai.</p>

<h3>Rollback plan</h3>
<p>Agar asar problem se bura hai to Centralized Policy list se policy deactivate karo (three dots, <b>Deactivate</b>). Overlay full mesh par lautta hai. Phir policy offline theek karo aur dobara pilot karo. Shuru karne se pehle deactivation ko change plan mein rakho.</p>

<div class="warn"><p><b>Common mistakes.</b> Edge par debug karna jabki karan Controller par hai; ek saath kai cheezein badalna; bhoolna ki reject default chupke se routes aur TLOCs hata deta hai; aur "before" state save na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Control policy ke baad routes missing hon to aam taur par default reject. Routes hain par installed nahi, to missing ya galat TLOC. Unwanted sessions ya galat views, to direction ya site list.</p></div>

<div class="scn"><h4>Aadha hub</h4><p>Ek change ke baad E-DEL-1 Hyderabad tak pahunch sakta tha lekin Mumbai tak nahi. Mumbai ki site 200 ek in policy mein use hui list se missing thi, aur policy ke default action ne uski advertisements reject kar di. Engineer ne Controller par <code>show omp routes</code> (Mumbai LAN maujood) ko hub se (gayab) compare kiya, dekha ki route way in par drop ho raha hai, aur saat sawalon ko follow karke list ki galti minuton mein mil gayi.</p></div>

<div class="iv"><p class="q">"Policy activate hote hi branch ke routes chale gaye. Tumhare pehle teen steps kya hain?"</p><p>Strong answer: Controller par policy aur apply-policy confirm karo (naam, site list, direction); sequences aur default action padho ki kahin woh khoye hue routes reject to nahi kar raha; Controller aur edge par OMP routes aur TLOCs compare karo. Urgent ho to deactivate karke mesh par lautao, phir fix karo aur pilot karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller se edge ki taraf, fixed order mein kaam karo.</li>
<li>Default reject, galat direction, missing TLOC sequence aur galat site list zyadatar failures ke karan hain.</li>
<li>Inv ya U status ka matlab route ke paas usable TLOC nahi.</li>
<li>Deactivation plan aur before-and-after capture hamesha rakho.</li>
</ul></div>
`}};export{e as default};