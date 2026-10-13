var e={id:`underlay-route-problem`,h:{en:`The underlay route problem: healthy interface, dead tunnel (vs-mpls-route)`,hi:`Underlay route problem: interface healthy, tunnel dead (vs-mpls-route)`},body:{en:`
<p>A highway can be perfectly paved and still useless if the signboard at your exit points the wrong way. The carrier says "your MPLS link is up, we see light and the PE answers". They are right. The branch is simply driving in the wrong direction. This chapter explains how a healthy interface can still carry a dead tunnel, using the Delhi ticket in vs-mpls-route.</p>

<h3>What a tunnel needs from the underlay</h3>
<p>An SD-WAN tunnel is a packet whose outer header goes from the branch WAN address to the remote tunnel endpoint. To send it the branch performs a normal route lookup in the <b>transport VR</b> of that circuit:</p>
<ol>
<li>The WAN interface is up with an address (connected route).</li>
<li>A route covers the remote endpoint, and its <b>next hop is reachable</b> in a connected subnet.</li>
<li>The carrier delivers it (circuit not down).</li>
<li>The Controller (or remote site) has the matching transport configured and answers.</li>
</ol>
<p>The Controller has two reachable addresses: 198.51.100.20 on the Internet and 172.31.100.2 on MPLS. The branch tunnel over MPLS targets 172.31.100.2. It must reach it through <code>MPLS-Transport-VR</code>, which holds the static route 172.31.0.0/16 via the PE.</p>

<h3>The ticket</h3>
<p>"The MPLS provider says the Delhi circuit is healthy and the interface is up, yet the MPLS tunnel never forms." Branch1 is Delhi (site-id 101); its MPLS addressing is 172.31.1.0/30, PE 172.31.1.1, CE 172.31.1.2.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MPLS route fault">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">Branch1</text><text x="85" y="113" text-anchor="middle" class="svg-muted" font-size="11">vni-0/1 172.31.1.2/30</text>
<rect x="260" y="70" width="110" height="60" rx="8" fill="#fed7aa"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="13">PE</text><text x="315" y="113" text-anchor="middle" class="svg-muted" font-size="11">172.31.1.1</text>
<rect x="480" y="70" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="13">Controller-1</text><text x="550" y="113" text-anchor="middle" class="svg-muted" font-size="11">MPLS 172.31.100.2</text>
<line x1="150" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="205" y="60" text-anchor="middle" class="svg-accent" font-size="12">next hop typed: 172.31.1.5 (wrong)</text>
<text x="205" y="150" text-anchor="middle" class="svg-muted" font-size="12">should be 172.31.1.1</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Interface up, provider happy, tunnel down</text>
</svg><p class="cap">The route to the Controller MPLS address points at an address that does not exist in the connected /30.</p></div>

<h3>Step 1: collect evidence</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): Established
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    <span class="hl">down    Controller MPLS address 172.31.100.2 is unreachable</span>
LTE        vni-0/2    up      -

admin@Branch1-cli&gt; show orgs org Acme sd-wan wan-interfaces
Interface  Transport  Oper  Address         Circuit (latency/jitter/loss)
vni-0/0    Internet   up    203.0.113.6/30  30 ms / 6 ms / 0.3 %
vni-0/1    MPLS       up    172.31.1.2/30   20 ms / 2 ms / 0.05 %
vni-0/2    LTE        up    100.64.1.2/30   60 ms / 15 ms / 1 %</pre>
<p>Read it like a detective. The overlay is Established because Internet and LTE tunnels carry it, so users are still fine through those paths. The MPLS interface is up with the right address and the circuit shows normal quality, which proves the physical circuit is healthy. The Reason column names the real problem: the Controller MPLS address is <b>unreachable from the branch</b>. That is a routing problem, not a carrier problem.</p>

<h3>Step 2: find the bad route</h3>
<pre class="out">admin@Branch1-cli&gt; show configuration
<span class="hl">routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.5</span></pre>
<p>The next hop 172.31.1.5 is not inside the connected subnet 172.31.1.0/30 (which holds only .1 and .2). The branch has no way to resolve it, so the route is unusable and 172.31.100.2 stays unreachable. The correct next hop is the PE, 172.31.1.1.</p>
<div class="eg"><p><b>Check the arithmetic.</b> A /30 has four addresses: .0 network, .1, .2, .3 broadcast. Hosts: .1 (PE) and .2 (CE). So 172.31.1.5 belongs to the <b>next</b> /30 (172.31.1.4/30). It is a classic typo for .1.</p></div>

<h3>Step 3: fix and verify</h3>
<pre class="code">admin@Branch1-cli&gt; configure
admin@Branch1-cli% delete routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16
admin@Branch1-cli% set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.1
admin@Branch1-cli% commit
Commit complete.
admin@Branch1-cli% exit</pre>
<p>If the same prefix is set again with a new next hop, the course CLI replaces the value. Deleting first is the careful habit, because it shows you exactly what you removed.</p>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   -
MPLS       <span class="hl">up</span>     20 ms     2 ms     0.05 %  -
LTE        up     60 ms     15 ms    1 %     -</pre>
<p>All three tunnels are up and the SLA monitor shows measured values per transport, which also proves the MPLS path carries probes. The last column is empty because no SLA profile is attached to this branch in this lab.</p>

<h3>Per-transport address spaces</h3>
<p>Each transport has its own address space and its own VR: Internet 203.0.113.x, MPLS 172.31.x.x, LTE 100.64.x.x. A route that belongs to one must not be placed in another. A typical mistake is copying the Internet default route into the MPLS VR. Because of longest-prefix rules, a default there would also catch the Controller Internet address and break the separation. Also notice that LTE tunnels target the Controller <b>Internet</b> address (the carrier delivers LTE traffic to the Internet), so an LTE problem often shows as an Internet-side reason.</p>

<div class="warn"><p><b>Common mistakes.</b> Blaming the carrier because the interface is up; changing the wrong VR; fixing the route but not committing; leaving the overlay "Established" in the report and calling it done while one transport is still down.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Interface up" proves Layer 1 and 2 only. Tunnel up needs an underlay route to the remote endpoint with a reachable next hop.</p></div>

<div class="scn"><h4>Provider says all green</h4><p>A bank branch lost MPLS redundancy and the provider insisted the circuit was perfect. The engineer found that a template push had changed the PE next hop for the whole region. The per-VR route table showed a next hop one /30 away. After correcting the template and re-pushing, the tunnels re-formed.</p><p><b>Lesson:</b> prove where the break is with show output before escalating, and compare against the working branch.</p></div>
<div class="iv"><p class="q">"The MPLS interface is up and the carrier says healthy, but the tunnel is down. Why?"</p><p>The tunnel needs an underlay route from the branch to the Controller MPLS address. A wrong next hop or missing route in the MPLS transport VR leaves the endpoint unreachable even though the link is fine. I read the tunnel reason, check the transport VR route, verify the next hop sits inside the connected /30, fix, commit and confirm with the SLA monitor.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A tunnel needs a route to the remote endpoint in the transport VR, and a reachable next hop.</li>
<li>The Reason column in show orgs org Acme sd-wan brief names the failing step.</li>
<li>Next hop must sit inside the connected subnet: for Delhi MPLS it is 172.31.1.1.</li>
<li>The overlay can stay Established through other transports while one tunnel is down.</li>
<li>Verify with the SLA monitor after the commit.</li>
</ul></div>
`,hi:`
<p>Highway bilkul pakka bana ho phir bhi bekaar ho sakta hai agar aapke exit ka signboard galat disha mein point kare. Carrier kehta hai "aapka MPLS link up hai, hum light dekhte hain aur PE jawab deta hai". Woh sahi hain. Branch bas galat disha mein gaadi chala rahi hai. Yeh chapter explain karta hai ki healthy interface par bhi dead tunnel kaise ho sakta hai, vs-mpls-route ke Delhi ticket ke saath.</p>

<h3>Tunnel ko underlay se kya chahiye</h3>
<p>SD-WAN tunnel ek packet hai jiska outer header branch WAN address se remote tunnel endpoint tak jaata hai. Ise bhejne ke liye branch us circuit ke <b>transport VR</b> mein normal route lookup karti hai:</p>
<ol>
<li>WAN interface address ke saath up hai (connected route).</li>
<li>Koi route remote endpoint ko cover karta hai, aur uska <b>next hop connected subnet mein reachable</b> hai.</li>
<li>Carrier deliver karta hai (circuit down nahi).</li>
<li>Controller (ya remote site) ke paas matching transport configured hai aur woh jawab deta hai.</li>
</ol>
<p>Controller ke do reachable addresses hain: Internet par 198.51.100.20 aur MPLS par 172.31.100.2. MPLS par branch tunnel 172.31.100.2 ko target karta hai. Use <code>MPLS-Transport-VR</code> ke through pahunchna hai, jisme PE ke through static route 172.31.0.0/16 hota hai.</p>

<h3>Ticket</h3>
<p>"MPLS provider kehta hai Delhi circuit healthy hai aur interface up hai, phir bhi MPLS tunnel nahi banta." Branch1 Delhi hai (site-id 101); uski MPLS addressing 172.31.1.0/30, PE 172.31.1.1, CE 172.31.1.2 hai.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="MPLS route fault">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">Branch1</text><text x="85" y="113" text-anchor="middle" class="svg-muted" font-size="11">vni-0/1 172.31.1.2/30</text>
<rect x="260" y="70" width="110" height="60" rx="8" fill="#fed7aa"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="13">PE</text><text x="315" y="113" text-anchor="middle" class="svg-muted" font-size="11">172.31.1.1</text>
<rect x="480" y="70" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="13">Controller-1</text><text x="550" y="113" text-anchor="middle" class="svg-muted" font-size="11">MPLS 172.31.100.2</text>
<line x1="150" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="2"/><line x1="370" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="205" y="60" text-anchor="middle" class="svg-accent" font-size="12">next hop typed: 172.31.1.5 (galat)</text>
<text x="205" y="150" text-anchor="middle" class="svg-muted" font-size="12">hona chahiye 172.31.1.1</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Interface up, provider khush, tunnel down</text>
</svg><p class="cap">Controller MPLS address ka route aise address ki taraf point karta hai jo connected /30 mein hai hi nahi.</p></div>

<h3>Step 1: evidence collect karo</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): Established
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    <span class="hl">down    Controller MPLS address 172.31.100.2 is unreachable</span>
LTE        vni-0/2    up      -

admin@Branch1-cli&gt; show orgs org Acme sd-wan wan-interfaces
Interface  Transport  Oper  Address         Circuit (latency/jitter/loss)
vni-0/0    Internet   up    203.0.113.6/30  30 ms / 6 ms / 0.3 %
vni-0/1    MPLS       up    172.31.1.2/30   20 ms / 2 ms / 0.05 %
vni-0/2    LTE        up    100.64.1.2/30   60 ms / 15 ms / 1 %</pre>
<p>Detective ki tarah padho. Overlay Established hai kyunki Internet aur LTE tunnels use carry karte hain, isliye users un paths se abhi theek hain. MPLS interface sahi address ke saath up hai aur circuit normal quality dikhata hai, jo prove karta hai ki physical circuit healthy hai. Reason column asli problem batata hai: Controller MPLS address <b>branch se unreachable</b> hai. Yeh routing problem hai, carrier problem nahi.</p>

<h3>Step 2: bad route dhundo</h3>
<pre class="out">admin@Branch1-cli&gt; show configuration
<span class="hl">routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.5</span></pre>
<p>Next hop 172.31.1.5 connected subnet 172.31.1.0/30 ke andar nahi hai (jisme sirf .1 aur .2 hain). Branch ise resolve nahi kar sakti, isliye route unusable hai aur 172.31.100.2 unreachable rehta hai. Sahi next hop PE hai, 172.31.1.1.</p>
<div class="eg"><p><b>Arithmetic check karo.</b> /30 mein chaar addresses hote hain: .0 network, .1, .2, .3 broadcast. Hosts: .1 (PE) aur .2 (CE). Isliye 172.31.1.5 <b>agle</b> /30 (172.31.1.4/30) ka hai. Yeh .1 ka classic typo hai.</p></div>

<h3>Step 3: fix aur verify</h3>
<pre class="code">admin@Branch1-cli&gt; configure
admin@Branch1-cli% delete routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16
admin@Branch1-cli% set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.1
admin@Branch1-cli% commit
Commit complete.
admin@Branch1-cli% exit</pre>
<p>Agar same prefix naye next hop ke saath dobara set karo to course CLI value replace kar deta hai. Pehle delete karna careful aadat hai, kyunki isse aap exactly dekhte ho kya hataya.</p>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   -
MPLS       <span class="hl">up</span>     20 ms     2 ms     0.05 %  -
LTE        up     60 ms     15 ms    1 %     -</pre>
<p>Teeno tunnels up hain aur SLA monitor har transport ki measured values dikhata hai, jo yeh bhi prove karta hai ki MPLS path probes carry karta hai. Aakhri column khali hai kyunki is lab mein is branch par koi SLA profile attached nahi.</p>

<h3>Per-transport address spaces</h3>
<p>Har transport ka apna address space aur apna VR hai: Internet 203.0.113.x, MPLS 172.31.x.x, LTE 100.64.x.x. Jo route ek ka hai use doosre mein nahi rakhna. Typical galti Internet default route ko MPLS VR mein copy karna hai. Longest-prefix rules ke kaaran wahan ka default Controller ke Internet address ko bhi pakad lega aur separation tod dega. Yeh bhi dhyaan do ki LTE tunnels Controller ke <b>Internet</b> address ko target karte hain (carrier LTE traffic ko Internet tak deliver karta hai), isliye LTE problem aksar Internet-side reason ke roop mein dikhti hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Interface up hone par carrier ko blame karna; galat VR badalna; route fix karke commit na karna; report mein overlay "Established" likh kar kaam khatam maan lena jabki ek transport abhi bhi down hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Interface up" sirf Layer 1 aur 2 prove karta hai. Tunnel up ke liye remote endpoint ka underlay route reachable next hop ke saath chahiye.</p></div>

<div class="scn"><h4>Provider kehta hai sab green</h4><p>Ek bank branch ki MPLS redundancy chali gayi aur provider ne kaha circuit perfect hai. Engineer ko mila ki ek template push ne poore region ka PE next hop badal diya tha. Per-VR route table mein next hop ek /30 door dikha. Template sahi karke dobara push karne par tunnels wapas ban gaye.</p><p><b>Seekh:</b> escalate karne se pehle show output se prove karo ki break kahan hai, aur working branch se compare karo.</p></div>
<div class="iv"><p class="q">"MPLS interface up hai aur carrier kehta hai healthy, phir bhi tunnel down hai. Kyun?"</p><p>Tunnel ko branch se Controller MPLS address tak underlay route chahiye. MPLS transport VR mein galat next hop ya missing route endpoint ko unreachable bana deta hai bhale hi link theek ho. Main tunnel reason padhta hoon, transport VR route check karta hoon, verify karta hoon ki next hop connected /30 ke andar hai, fix, commit karta hoon aur SLA monitor se confirm karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel ko transport VR mein remote endpoint ka route aur reachable next hop chahiye.</li>
<li>show orgs org Acme sd-wan brief ka Reason column failing step batata hai.</li>
<li>Next hop connected subnet ke andar hona chahiye: Delhi MPLS ke liye 172.31.1.1.</li>
<li>Ek tunnel down hone par bhi overlay doosre transports se Established reh sakta hai.</li>
<li>Commit ke baad SLA monitor se verify karo.</li>
</ul></div>
`}};export{e as default};