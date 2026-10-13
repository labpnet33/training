var e={id:`lan-side-routing`,h:{en:`LAN-side routing and redistribution into the overlay`,hi:`LAN-side routing aur overlay mein redistribution`},body:{en:`
<p>So far each branch LAN was a single subnet sitting directly on vni-0/3. Real offices are bigger: a core switch, several VLANs, a firewall, a server room. The branch router must learn those inner subnets and then tell the rest of the SD-WAN about them. Picture a mall with one main entrance (the SD-WAN branch). Shops inside have their own corridors. The entrance desk needs a map of the corridors so it can answer "where is shop 10.1.20.0/24?" for visitors from other malls.</p>

<h3>Three ways to learn LAN prefixes</h3>
<table class="cmp"><tr><th>Method</th><th>When to use</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Connected</td><td>One subnet directly on the LAN port</td><td>Zero effort, automatic</td><td>Only that one subnet</td></tr>
<tr><td>Static</td><td>A few stable subnets behind one L3 switch</td><td>Simple, predictable</td><td>Manual, no failure detection</td></tr>
<tr><td>OSPF or BGP with a LAN router or firewall</td><td>Many subnets, redundancy, changes often</td><td>Dynamic, scales</td><td>More to configure, risk of loops</td></tr></table>

<h3>Static routes in the LAN VR</h3>
<p>Suppose Bengaluru has a Layer 3 switch at 10.1.2.2 behind vni-0/3 and three VLAN subnets 10.1.20.0/24, 10.1.21.0/24 and 10.1.22.0/24 behind it. Without a route for them, the branch does not even know they exist. A static route teaches the branch:</p>
<pre class="code"><span class="c">! LAN VR (tenant side) of the branch; shown generically</span>
set routing-instances Acme-LAN-VR routing-options static route 10.1.20.0/22 next-hop 10.1.2.2</pre>
<p>This example summarises the three /24s into one /22 (10.1.20.0 to 10.1.23.255). A summary keeps the overlay table small. The course CLI limits you to the connected LAN prefix, and the routing-instances grammar targets the transport VRs, so the line above is real-platform style for illustration; the Director template normally creates the LAN VR for you.</p>

<h3>Dynamic routing with a LAN router or firewall</h3>
<p>When the LAN has its own router or firewall, run a routing protocol between the VOS LAN VR and that device:</p>
<ul>
<li><b>OSPF</b> (link-state, area-based, common in enterprise LANs): the LAN router and the VOS exchange routes, and VOS learns every inner subnet automatically. Both ends must agree on area, interface network type, authentication if used, and timers.</li>
<li><b>BGP</b> (path-vector, policy rich): often preferred when the neighbor is a firewall or a different team's network, because you can filter exactly what you accept and send. The VOS LAN VR peers with the LAN device, usually with a private AS.</li>
</ul>
<p>Both run <b>inside the tenant LAN VR</b>, never in the transport VR. VOS supports static, OSPF and BGP in VRs; the exact configuration hierarchy lives in the Director and is outside the lab model.</p>

<h3>Redistribution: telling the overlay</h3>
<p><b>Redistribution</b> means taking routes learned one way and advertising them another way. Here: routes learned by OSPF or static from the LAN are put into the SD-WAN overlay, so other sites learn them via the Controller. The reverse direction also exists: overlay routes are given to the LAN router so the LAN knows how to reach other branches.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Redistribution">
<rect x="20" y="85" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="112" text-anchor="middle" class="svg-ink" font-size="13">LAN switch/firewall</text><text x="90" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.0/22</text>
<rect x="250" y="85" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">Branch2 LAN VR</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">VOS</text>
<rect x="480" y="85" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="112" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="550" y="130" text-anchor="middle" class="svg-muted" font-size="12">to other sites</text>
<line x1="160" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><text x="205" y="98" text-anchor="middle" class="svg-accent" font-size="12">OSPF/BGP/static</text>
<line x1="390" y1="105" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><text x="435" y="98" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">redistribute / advertise LAN routes into the overlay</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">and send overlay routes back (or a default) to the LAN</text>
</svg><p class="cap">The branch is the translator between LAN routing and overlay routing.</p></div>

<h3>Worked example with loop danger</h3>
<div class="eg"><p>Delhi and Bengaluru each run OSPF to their own LAN firewall. A careless engineer redistributes OSPF into the overlay and also redistributes the overlay back into OSPF without filters. Delhi learns 10.1.2.0/24 from Bengaluru through the overlay, gives it to its OSPF, and the OSPF route returns to the overlay with a different origin. Now both sites may prefer wrong paths. The safe rules are: <b>filter by prefix</b> (advertise only your own LAN ranges), <b>tag</b> routes you inject and refuse them coming back, and prefer sending a <b>default route</b> or a summary to the LAN instead of every overlay prefix.</p></div>

<h3>What to verify</h3>
<pre class="out">admin@Branch2-cli&gt; show route
Codes: C - connected, S - static, O - OSPF
C    10.1.2.0/24    is directly connected, vni-0/3
<span class="hl">O    10.1.20.0/22   via 10.1.2.2</span>
admin@Branch1-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch2      102      10.1.2.0/24</pre>
<p>The first table proves the branch learned the inner subnets. The second proves what Delhi knows. In the lab model only the connected LAN prefix is shown per site; on real VOS, redistributed routes appear too.</p>

<div class="warn"><p><b>Common mistakes.</b> Running the LAN protocol in the transport VR; advertising a default route from the LAN into the overlay by accident, which attracts all traffic; forgetting the return route on the LAN device so replies never come back; an OSPF area or network-type mismatch.</p></div>
<div class="exam"><p><b>Exam trap.</b> Redistribution is not automatic between protocols. A route learned by OSPF is not in BGP or the overlay unless you configure it and the policy allows it.</p></div>

<div class="scn"><h4>Half-way reachability</h4><p>Delhi users reached the new Bengaluru server VLAN, but replies never came back. The server VLAN router had no route to the Delhi 10.1.1.0/24 range, because the overlay prefixes were not sent to the LAN. Adding a default route from the branch to the LAN router fixed the return path.</p><p><b>Lesson:</b> advertise outward and also give the LAN a way back.</p></div>
<div class="iv"><p class="q">"How do LAN subnets behind a branch become reachable from other sites?"</p><p>The branch learns them from the LAN with static routes, OSPF or BGP in the tenant LAN VR. They are then redistributed or advertised into the overlay, MP-BGP carries them through the Controller, and other branches import them in the same tenant. Mention filtering, summarisation and a return path for the LAN.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected, static, OSPF or BGP can supply LAN prefixes; routing protocols run in the LAN VR, not in the transport VR.</li>
<li>The branch redistributes LAN routes into the overlay and may send overlay routes or a default back.</li>
<li>Filter, summarise and tag to avoid loops and accidental defaults.</li>
<li>The lab model advertises the connected LAN interface prefix only.</li>
<li>Always plan the return path from the LAN.</li>
</ul></div>
`,hi:`
<p>Ab tak har branch LAN ek single subnet tha jo seedha vni-0/3 par baitha tha. Real offices bade hote hain: core switch, kai VLANs, ek firewall, server room. Branch router ko woh inner subnets seekhne padte hain aur phir baaki SD-WAN ko unke baare mein batana padta hai. Ek mall socho jiska ek main entrance hai (SD-WAN branch). Andar ki shops ke apne corridors hain. Entrance desk ko corridors ka map chahiye taaki doosre malls ke visitors ko jawab de sake "shop 10.1.20.0/24 kahan hai?".</p>

<h3>LAN prefixes seekhne ke teen tareeke</h3>
<table class="cmp"><tr><th>Method</th><th>Kab use karein</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Connected</td><td>LAN port par ek hi subnet seedha</td><td>Zero effort, automatic</td><td>Sirf wahi ek subnet</td></tr>
<tr><td>Static</td><td>Ek L3 switch ke peeche kuch stable subnets</td><td>Simple, predictable</td><td>Manual, failure detection nahi</td></tr>
<tr><td>LAN router ya firewall ke saath OSPF ya BGP</td><td>Bahut subnets, redundancy, baar baar changes</td><td>Dynamic, scale hota hai</td><td>Zyada configuration, loops ka risk</td></tr></table>

<h3>LAN VR mein static routes</h3>
<p>Maan lo Bengaluru mein vni-0/3 ke peeche 10.1.2.2 par ek Layer 3 switch hai aur uske peeche teen VLAN subnets 10.1.20.0/24, 10.1.21.0/24 aur 10.1.22.0/24. Unka route na ho to branch ko pata hi nahi ki woh exist karte hain. Static route branch ko sikhata hai:</p>
<pre class="code"><span class="c">! Branch ka LAN VR (tenant side); generic dikhaya gaya hai</span>
set routing-instances Acme-LAN-VR routing-options static route 10.1.20.0/22 next-hop 10.1.2.2</pre>
<p>Yeh example teen /24s ko ek /22 (10.1.20.0 se 10.1.23.255) mein summarise karta hai. Summary overlay table ko chhota rakhta hai. Course CLI aapko connected LAN prefix tak seemit rakhta hai, aur routing-instances grammar transport VRs ko target karta hai, isliye upar ki line illustration ke liye real-platform style hai; Director template normally LAN VR aapke liye banata hai.</p>

<h3>LAN router ya firewall ke saath dynamic routing</h3>
<p>Jab LAN ka apna router ya firewall ho, to VOS LAN VR aur us device ke beech routing protocol chalao:</p>
<ul>
<li><b>OSPF</b> (link-state, area-based, enterprise LANs mein common): LAN router aur VOS routes exchange karte hain, aur VOS har inner subnet automatically seekh leta hai. Dono ends ko area, interface network type, authentication (agar use ho) aur timers par agree karna hota hai.</li>
<li><b>BGP</b> (path-vector, policy mein rich): aksar tab pasand kiya jaata hai jab neighbor firewall ho ya kisi doosri team ka network, kyunki aap exactly filter kar sakte ho kya accept aur send karna hai. VOS LAN VR LAN device se peer karta hai, aam taur par private AS ke saath.</li>
</ul>
<p>Dono <b>tenant LAN VR ke andar</b> chalte hain, kabhi transport VR mein nahi. VOS VRs mein static, OSPF aur BGP support karta hai; exact configuration hierarchy Director mein hai aur lab model ke bahar.</p>

<h3>Redistribution: overlay ko batana</h3>
<p><b>Redistribution</b> ka matlab hai ek tareeke se seekhe routes ko doosre tareeke se advertise karna. Yahan: LAN se OSPF ya static se seekhe routes SD-WAN overlay mein daale jaate hain, taaki doosri sites Controller se unhe seekhein. Ulti direction bhi hoti hai: overlay routes LAN router ko diye jaate hain taaki LAN doosre branches tak pahunchna jaane.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Redistribution">
<rect x="20" y="85" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="112" text-anchor="middle" class="svg-ink" font-size="13">LAN switch/firewall</text><text x="90" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.0/22</text>
<rect x="250" y="85" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">Branch2 LAN VR</text><text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">VOS</text>
<rect x="480" y="85" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="112" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="550" y="130" text-anchor="middle" class="svg-muted" font-size="12">doosri sites ko</text>
<line x1="160" y1="105" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><text x="205" y="98" text-anchor="middle" class="svg-accent" font-size="12">OSPF/BGP/static</text>
<line x1="390" y1="105" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><text x="435" y="98" text-anchor="middle" class="svg-accent" font-size="12">MP-BGP</text>
<text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="12">LAN routes ko overlay mein redistribute / advertise karo</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">aur overlay routes (ya default) LAN ko wapas bhejo</text>
</svg><p class="cap">Branch LAN routing aur overlay routing ke beech translator hai.</p></div>

<h3>Loop ke khatre ke saath worked example</h3>
<div class="eg"><p>Delhi aur Bengaluru dono apne LAN firewall se OSPF chalate hain. Ek laparwah engineer OSPF ko overlay mein redistribute karta hai aur overlay ko bina filter ke wapas OSPF mein bhi. Delhi overlay se Bengaluru ka 10.1.2.0/24 seekhta hai, apne OSPF ko deta hai, aur OSPF route alag origin ke saath wapas overlay mein aa jaata hai. Ab dono sites galat paths prefer kar sakti hain. Safe rules: <b>prefix se filter karo</b> (sirf apni LAN ranges advertise karo), jo routes aap inject karte ho unhe <b>tag</b> karo aur wapas aane par refuse karo, aur LAN ko har overlay prefix dene ki jagah ek <b>default route</b> ya summary bhejna prefer karo.</p></div>

<h3>Kya verify karna hai</h3>
<pre class="out">admin@Branch2-cli&gt; show route
Codes: C - connected, S - static, O - OSPF
C    10.1.2.0/24    is directly connected, vni-0/3
<span class="hl">O    10.1.20.0/22   via 10.1.2.2</span>
admin@Branch1-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch2      102      10.1.2.0/24</pre>
<p>Pehli table prove karti hai ki branch ne inner subnets seekhe. Doosri prove karti hai ki Delhi ko kya pata hai. Lab model mein har site ka sirf connected LAN prefix dikhta hai; real VOS par redistributed routes bhi dikhte hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> LAN protocol ko transport VR mein chalana; LAN se overlay mein galti se default route advertise karna, jo saara traffic attract karta hai; LAN device par return route bhool jaana taaki replies wapas na aayein; OSPF area ya network-type mismatch.</p></div>
<div class="exam"><p><b>Exam trap.</b> Protocols ke beech redistribution automatic nahi hoti. OSPF se seekha route BGP ya overlay mein tab tak nahi hota jab tak aap configure na karo aur policy allow na kare.</p></div>

<div class="scn"><h4>Aadhi reachability</h4><p>Delhi users naye Bengaluru server VLAN tak pahunche, par replies kabhi wapas nahi aaye. Server VLAN router ke paas Delhi 10.1.1.0/24 range ka route nahi tha, kyunki overlay prefixes LAN ko bheje hi nahi gaye the. Branch se LAN router ko default route add karne se return path fix hua.</p><p><b>Seekh:</b> bahar advertise karo aur LAN ko wapas ka raasta bhi do.</p></div>
<div class="iv"><p class="q">"Branch ke peeche ke LAN subnets doosri sites se reachable kaise bante hain?"</p><p>Branch unhe tenant LAN VR mein static routes, OSPF ya BGP se LAN se seekhta hai. Phir unhe overlay mein redistribute ya advertise kiya jaata hai, MP-BGP Controller ke through unhe carry karta hai, aur doosre branches unhe same tenant mein import karte hain. Filtering, summarisation aur LAN ke return path ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected, static, OSPF ya BGP LAN prefixes de sakte hain; routing protocols LAN VR mein chalte hain, transport VR mein nahi.</li>
<li>Branch LAN routes ko overlay mein redistribute karta hai aur overlay routes ya default wapas bhej sakta hai.</li>
<li>Loops aur accidental defaults se bachne ke liye filter, summarise aur tag karo.</li>
<li>Lab model sirf connected LAN interface prefix advertise karta hai.</li>
<li>LAN ke return path ki planning hamesha karo.</li>
</ul></div>
`}};export{e as default};