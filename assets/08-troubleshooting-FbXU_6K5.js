var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow for MPLS-TE tunnels`,hi:`MPLS-TE tunnels ka troubleshooting workflow`},body:{en:`
<p>A tunnel that will not come up is like a package that never arrives. You trace it step by step: was it posted (configured), does the route exist (TED and CSPF), did the depots accept it (RSVP), and does the receiver have the right address (labels and steering). Follow the order below and stop at the first failing step.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Five checks from configuration to traffic. The first failure is the cause."><rect x="20" y="30" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Enabled?</text><text x="71" y="80" text-anchor="middle" class="svg-muted" font-size="12">MPLS-TE, RSVP</text><line x1="122" y1="65" x2="144" y2="65" stroke="#64748b" stroke-width="2"/><rect x="144" y="30" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. TED</text><text x="195" y="80" text-anchor="middle" class="svg-muted" font-size="12">links known?</text><line x1="246" y1="65" x2="268" y2="65" stroke="#64748b" stroke-width="2"/><rect x="268" y="30" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. CSPF</text><text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">path found?</text><line x1="370" y1="65" x2="392" y2="65" stroke="#64748b" stroke-width="2"/><rect x="392" y="30" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. RSVP</text><text x="443" y="80" text-anchor="middle" class="svg-muted" font-size="12">PATH, RESV</text><line x1="494" y1="65" x2="516" y2="65" stroke="#64748b" stroke-width="2"/><rect x="516" y="30" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="58" text-anchor="middle" class="svg-ink" font-size="13">5. Steering</text><text x="567" y="80" text-anchor="middle" class="svg-muted" font-size="12">traffic uses it</text></svg><p class="cap">Five checks from configuration to traffic. The first failure is the cause.</p></div>
<div class="note"><p>This module has no lab, so below you find <b>what to run and what to look for</b>, with no sample output. To practise reading adjacencies, metrics and label forwarding, use <code>spcor-isis</code> and <code>spcor-mpls-ldp</code>.</p></div>
<h3>Step 1: is TE enabled everywhere?</h3>
<ul>
<li>Globally: <code>mpls traffic-eng tunnels</code> (XE) or <code>mpls traffic-eng</code> (XR).</li>
<li>On every core interface: TE and RSVP bandwidth. Without <code>ip rsvp bandwidth</code> (XE) or an <code>rsvp interface</code> entry (XR), the link has no reservable bandwidth.</li>
<li>In the IGP: <code>mpls traffic-eng router-id</code>, the right level or area, and <b>wide metrics</b> for IS-IS.</li>
</ul>
<h3>Step 2: does the TED contain the topology?</h3>
<p>Check the TED on the head end for the tail end and the expected links: <code>show mpls traffic-eng topology</code> (XE and XR) and, for IS-IS, whether the TE sub-TLVs are in the database with <code>show isis database verbose</code> (XR) or <code>show isis database detail</code> (XE). A missing link means the IGP did not flood TE information for it: check wide metrics, interface TE configuration and the level.</p>
<h3>Step 3: does CSPF find a path?</h3>
<ul>
<li><code>show mpls traffic-eng tunnels</code> on XE or <code>show mpls traffic-eng tunnels detail</code> on XR shows the tunnel state, path-options, and the reason a path-option failed (no path, insufficient bandwidth, affinity mismatch).</li>
<li>Typical causes: requested bandwidth larger than unreserved at the setup priority, affinity and mask excluding every path, an explicit path with a wrong or non-adjacent strict hop, destination not a TE router ID, or a node excluded by <code>exclude-address</code>.</li>
<li>Test by temporarily lowering bandwidth or switching to dynamic. If the tunnel then comes up, the constraint is the culprit.</li>
</ul>
<h3>Step 4: does RSVP signal and reserve?</h3>
<ol>
<li>Check that RSVP neighbours are up on each hop: <code>show ip rsvp neighbor</code> (XE) or <code>show rsvp neighbors</code> (XR).</li>
<li>Look at the LSP state: <code>show ip rsvp sender</code> and <code>show ip rsvp reservation</code> on XE; <code>show rsvp session</code> on XR. PATH state without matching RESV means the problem is downstream of the router that shows PATH only.</li>
<li>Check for filters: protocol 46 must be permitted between core addresses and not rate-limited by control-plane policing.</li>
<li>Admission control failure: look for a PathErr with the reason "admission control failure" and the router that sent it.</li>
<li>Verify MTU and the label stack depth, particularly with FRR where an extra label is pushed.</li>
</ol>
<h3>Step 5: is traffic using the tunnel?</h3>
<ul>
<li>Show the route: <code>show ip route 192.0.2.2</code> (or the destination) should list Tunnel1 as outgoing interface for autoroute. If not, check <code>autoroute announce</code>, tunnel metric, and whether the IGP path has a lower metric.</li>
<li>For static or PBR steering, check the route, ACL and that the tunnel interface is up.</li>
<li>Check forwarding with <code>show mpls forwarding-table</code> and tunnel counters.</li>
<li>Remember the reverse direction: a one-way tunnel only changes the path in one direction.</li>
</ul>
<table class="cmp"><tr><th>Symptom</th><th>First check</th><th>Likely cause</th></tr><tr><td>Tunnel down, "no path"</td><td>TED and tunnel detail</td><td>Narrow metrics, TE off on a link, constraint too strict</td></tr><tr><td>Path found, tunnel still down</td><td>RSVP neighbours, sender and reservation</td><td>Protocol 46 filtered, RSVP not on interface, MTU</td></tr><tr><td>Tunnel up, no traffic</td><td>Routing table</td><td>No autoroute, higher tunnel metric, wrong static route</td></tr><tr><td>Wrong path used</td><td>Tunnel detail: path-option</td><td>Fallback active, re-optimisation timer, explicit hop error</td></tr><tr><td>FRR not working</td><td>Tunnel detail: protection state</td><td>No backup on PLR, backup uses protected link, no fast detection</td></tr><tr><td>Congestion despite TE</td><td>Autoroute scope, bandwidth</td><td>All prefixes steered into one tunnel, reservation lower than traffic</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Tunnel1 from PE1 to PE2 is down. Step 1 passes. In the TED, PE1 sees P1 and P2 but no P3: the P3 interfaces have <code>metric-style narrow</code>. You fix P3, the TED gains the links, CSPF now finds the explicit path, RSVP signals it, and Tunnel1 comes up. The route to PE2 still uses the IGP because autoroute announce is missing; adding it moves the traffic into the tunnel.</p></div>
<div class="warn"><p><b>Common mistake.</b> Jumping to RSVP debugging before looking at the TED. Most "tunnel down" faults are TED or constraint problems that never reach RSVP. Another mistake is running debugs on a busy core router: use show commands first.</p></div>
<div class="exam"><p><b>Exam trap.</b> The questions describe a state and ask for the fix. "PATH but no RESV" points downstream and often to filtering or admission control. "No path" is a CSPF or TED problem. "Tunnel up but no traffic" is a steering problem. Match the symptom to the step.</p></div>
<div class="scn"><h4>The tunnel that carried nothing</h4><p>After a migration, Tunnel1 showed up and RSVP reservations were in place, yet utilisation on its path stayed at zero and the old link stayed congested. Step 5 of the workflow found no autoroute on the tunnel and no steering at all. Adding autoroute announce with an absolute metric moved the video traffic into the tunnel within a minute.</p><p><b>Lesson:</b> an up tunnel is only a path; traffic must be steered into it.</p></div>
<div class="iv"><p class="q">"A TE tunnel is down. How do you troubleshoot?"</p><p>I go in order: TE and RSVP enabled on all hops and in the IGP, then the TED to see if the links and tail end are known, then the tunnel detail to see why CSPF failed (bandwidth, affinity, explicit path), then RSVP neighbours and PATH and RESV state hop by hop including filters for protocol 46, and finally steering. I look at show commands before enabling any debug.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in order: enabled, TED, CSPF, RSVP, steering.</li>
<li>"No path" means TED or constraints; PATH without RESV points downstream, often filtering or admission control.</li>
<li>Check wide metrics, router ID, interface bandwidth and protocol 46.</li>
<li>An up tunnel needs steering to carry traffic.</li>
<li>Use show commands first, debugs only with care.</li>
</ul></div>
`,hi:`
<p>Jo tunnel up nahi aata woh us parcel jaisa hai jo kabhi pahunchta nahi. Aap use step by step trace karte ho: post hua (configured), route hai (TED aur CSPF), depots ne accept kiya (RSVP), aur receiver ka sahi address hai (labels aur steering). Neeche ka order follow karo aur pehle failing step par ruk jao.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Configuration se traffic tak paanch checks. Pehla failure hi wajah hai."><rect x="20" y="30" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="58" text-anchor="middle" class="svg-ink" font-size="13">1. Enabled?</text><text x="71" y="80" text-anchor="middle" class="svg-muted" font-size="12">MPLS-TE, RSVP</text><line x1="122" y1="65" x2="144" y2="65" stroke="#64748b" stroke-width="2"/><rect x="144" y="30" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="58" text-anchor="middle" class="svg-ink" font-size="13">2. TED</text><text x="195" y="80" text-anchor="middle" class="svg-muted" font-size="12">links pata hain?</text><line x1="246" y1="65" x2="268" y2="65" stroke="#64748b" stroke-width="2"/><rect x="268" y="30" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="13">3. CSPF</text><text x="319" y="80" text-anchor="middle" class="svg-muted" font-size="12">path mila?</text><line x1="370" y1="65" x2="392" y2="65" stroke="#64748b" stroke-width="2"/><rect x="392" y="30" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="58" text-anchor="middle" class="svg-ink" font-size="13">4. RSVP</text><text x="443" y="80" text-anchor="middle" class="svg-muted" font-size="12">PATH, RESV</text><line x1="494" y1="65" x2="516" y2="65" stroke="#64748b" stroke-width="2"/><rect x="516" y="30" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="58" text-anchor="middle" class="svg-ink" font-size="13">5. Steering</text><text x="567" y="80" text-anchor="middle" class="svg-muted" font-size="12">traffic use karta hai</text></svg><p class="cap">Configuration se traffic tak paanch checks. Pehla failure hi wajah hai.</p></div>
<div class="note"><p>Is module ka lab nahi hai, isliye neeche <b>kya chalana hai aur kya dekhna hai</b> diya hai, bina sample output ke. Adjacencies, metrics aur label forwarding padhna practise karne ke liye <code>spcor-isis</code> aur <code>spcor-mpls-ldp</code> use karo.</p></div>
<h3>Step 1: kya TE har jagah enabled hai?</h3>
<ul>
<li>Globally: <code>mpls traffic-eng tunnels</code> (XE) ya <code>mpls traffic-eng</code> (XR).</li>
<li>Har core interface par: TE aur RSVP bandwidth. <code>ip rsvp bandwidth</code> (XE) ya <code>rsvp interface</code> entry (XR) ke bina link ke paas reservable bandwidth nahi hoti.</li>
<li>IGP mein: <code>mpls traffic-eng router-id</code>, sahi level ya area, aur IS-IS ke liye <b>wide metrics</b>.</li>
</ul>
<h3>Step 2: kya TED mein topology hai?</h3>
<p>Head end par TED mein tail end aur expected links check karo: <code>show mpls traffic-eng topology</code> (XE aur XR) aur IS-IS mein dekho TE sub-TLVs database mein hain ya nahi, <code>show isis database verbose</code> (XR) ya <code>show isis database detail</code> (XE) se. Link missing ho to IGP ne uske liye TE information flood nahi ki: wide metrics, interface TE configuration aur level check karo.</p>
<h3>Step 3: kya CSPF ko path milta hai?</h3>
<ul>
<li>XE par <code>show mpls traffic-eng tunnels</code> ya XR par <code>show mpls traffic-eng tunnels detail</code> tunnel state, path-options, aur path-option fail hone ki wajah dikhata hai (no path, insufficient bandwidth, affinity mismatch).</li>
<li>Typical causes: requested bandwidth setup priority ki unreserved se zyada, affinity aur mask har path exclude kar rahe, explicit path mein galat ya non-adjacent strict hop, destination TE router ID nahi, ya <code>exclude-address</code> se node excluded.</li>
<li>Temporarily bandwidth kam karke ya dynamic par switch karke test karo. Tunnel up ho gaya to constraint hi doshi hai.</li>
</ul>
<h3>Step 4: kya RSVP signal aur reserve karta hai?</h3>
<ol>
<li>Har hop par RSVP neighbours up hain ya nahi: <code>show ip rsvp neighbor</code> (XE) ya <code>show rsvp neighbors</code> (XR).</li>
<li>LSP state dekho: XE par <code>show ip rsvp sender</code> aur <code>show ip rsvp reservation</code>; XR par <code>show rsvp session</code>. Matching RESV ke bina PATH state ka matlab problem us router ke downstream mein hai jo sirf PATH dikhata hai.</li>
<li>Filters check karo: protocol 46 core addresses ke beech permit hona chahiye aur control-plane policing se rate-limit nahi hona chahiye.</li>
<li>Admission control failure: "admission control failure" reason wala PathErr aur use bhejne wala router dhoondo.</li>
<li>MTU aur label stack depth verify karo, khaaskar FRR mein jahan extra label push hota hai.</li>
</ol>
<h3>Step 5: kya traffic tunnel use kar raha hai?</h3>
<ul>
<li>Route dekho: <code>show ip route 192.0.2.2</code> (ya destination) autoroute ke liye Tunnel1 ko outgoing interface dikhaye. Nahi to <code>autoroute announce</code>, tunnel metric aur dekho IGP path ka metric kam to nahi.</li>
<li>Static ya PBR steering ke liye route, ACL aur tunnel interface up hona check karo.</li>
<li>Forwarding <code>show mpls forwarding-table</code> aur tunnel counters se check karo.</li>
<li>Reverse direction yaad rakho: one-way tunnel sirf ek direction ka path badalta hai.</li>
</ul>
<table class="cmp"><tr><th>Symptom</th><th>Pehla check</th><th>Likely cause</th></tr><tr><td>Tunnel down, "no path"</td><td>TED aur tunnel detail</td><td>Narrow metrics, link par TE off, constraint bahut strict</td></tr><tr><td>Path mila, tunnel phir bhi down</td><td>RSVP neighbours, sender aur reservation</td><td>Protocol 46 filtered, interface par RSVP nahi, MTU</td></tr><tr><td>Tunnel up, traffic nahi</td><td>Routing table</td><td>Autoroute nahi, tunnel metric zyada, galat static route</td></tr><tr><td>Galat path use ho raha</td><td>Tunnel detail: path-option</td><td>Fallback active, re-optimisation timer, explicit hop error</td></tr><tr><td>FRR kaam nahi kar raha</td><td>Tunnel detail: protection state</td><td>PLR par backup nahi, backup protected link use karta hai, fast detection nahi</td></tr><tr><td>TE ke bawajood congestion</td><td>Autoroute scope, bandwidth</td><td>Saare prefixes ek tunnel mein, reservation traffic se kam</td></tr></table>
<div class="eg"><p><b>Worked example.</b> PE1 se PE2 ka Tunnel1 down hai. Step 1 pass. TED mein PE1 ko P1 aur P2 dikhte hain lekin P3 nahi: P3 interfaces par <code>metric-style narrow</code> hai. Aap P3 theek karte ho, TED mein links aa jaate hain, CSPF ab explicit path dhoondh leta hai, RSVP use signal karta hai, aur Tunnel1 up ho jaata hai. PE2 ka route abhi bhi IGP use karta hai kyunki autoroute announce missing hai; use jodne se traffic tunnel mein chala jaata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> TED dekhne se pehle RSVP debugging par kood jaana. Zyadatar "tunnel down" faults TED ya constraint problems hote hain jo RSVP tak pahunchte hi nahi. Ek aur galti busy core router par debugs chalana: pehle show commands use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions ek state batate hain aur fix poochte hain. "PATH lekin RESV nahi" downstream ki taraf aur aksar filtering ya admission control ki taraf ishara karta hai. "No path" CSPF ya TED problem hai. "Tunnel up lekin traffic nahi" steering problem hai. Symptom ko step se match karo.</p></div>
<div class="scn"><h4>Tunnel jo kuch carry nahi karta tha</h4><p>Migration ke baad Tunnel1 up dikha aur RSVP reservations maujood thi, phir bhi uske path par utilisation zero raha aur purana link congested raha. Workflow ke step 5 mein tunnel par koi autoroute nahi mila aur koi steering hi nahi thi. Absolute metric ke saath autoroute announce jodne se video traffic ek minute mein tunnel mein chala gaya.</p><p><b>Lesson:</b> up tunnel sirf ek path hai; traffic ko usme steer karna padta hai.</p></div>
<div class="iv"><p class="q">"TE tunnel down hai. Troubleshoot kaise karoge?"</p><p>Main order mein jaata hoon: sab hops aur IGP mein TE aur RSVP enabled, phir TED dekhta hoon ki links aur tail end pata hain ya nahi, phir tunnel detail se CSPF fail hone ki wajah (bandwidth, affinity, explicit path), phir RSVP neighbours aur hop by hop PATH aur RESV state, protocol 46 ke filters ke saath, aur aakhir mein steering. Koi bhi debug enable karne se pehle show commands dekhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein troubleshoot karo: enabled, TED, CSPF, RSVP, steering.</li>
<li>"No path" matlab TED ya constraints; RESV ke bina PATH downstream ki taraf, aksar filtering ya admission control.</li>
<li>Wide metrics, router ID, interface bandwidth aur protocol 46 check karo.</li>
<li>Up tunnel ko traffic carry karne ke liye steering chahiye.</li>
<li>Pehle show commands, debugs sirf dhyan se.</li>
</ul></div>
`}};export{e as default};