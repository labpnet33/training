var e={id:`sr-te`,h:{en:`SR-TE: policies, candidate paths, ODN and automated steering`,hi:`SR-TE: policies, candidate paths, ODN aur automated steering`},body:{en:`
<p>An <b>SR policy</b> is a travel plan with three labels on the folder: who is travelling (the head end), where to (the endpoint) and why (a <b>color</b>, such as "low latency"). Inside the folder are one or more routes (candidate paths) with preferences, and the highest preference that works is used. Unlike an RSVP-TE tunnel, nothing is signalled hop by hop. The head end simply pushes a segment list.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="An SR policy picks the best valid candidate path, installs its segment list, and traffic with a matching color is steered into it."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">head end, color, endpoint</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Candidate paths</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">preference 200, 100</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Segment list</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">SIDs</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Steering</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">BGP color match</text></svg><p class="cap">An SR policy picks the best valid candidate path, installs its segment list, and traffic with a matching color is steered into it.</p></div>
<h3>Anatomy of an SR policy</h3>
<ul>
<li><b>Identity.</b> A policy is identified by head end, color and endpoint. Color is a 32 bit number that expresses intent, for example 100 for low latency and 200 for high bandwidth. Several policies may share an endpoint with different colors.</li>
<li><b>Candidate paths.</b> Each has a numeric <b>preference</b>. The valid path with the highest preference is the <b>active path</b>. If it becomes invalid, the next one takes over, a built-in fallback.</li>
<li><b>Segment list.</b> The ordered SIDs (prefix, adjacency or binding) the head end pushes. A candidate path can have several weighted segment lists for load sharing.</li>
<li><b>Binding-SID.</b> A local label that represents the whole policy. Other policies or domains can use one BSID instead of the whole list, a way to shorten stacks and to stitch domains.</li>
</ul>
<h3>Types of candidate path</h3>
<table class="cmp"><tr><th>Type</th><th>How the list is created</th><th>Notes</th></tr><tr><td>Explicit</td><td>Operator writes the segment list</td><td>Full control; must be updated if topology changes</td></tr><tr><td>Dynamic (head end)</td><td>Head end computes a path from the IGP database with a metric and constraints (IGP, TE or latency metric, affinity, disjointness)</td><td>Re-optimises automatically</td></tr><tr><td>Dynamic (PCE)</td><td>A PCE computes using a bigger view and returns segment lists over PCEP</td><td>Multi-domain, bandwidth-aware designs</td></tr><tr><td>BGP SR-TE</td><td>Policy is signalled from a controller in a BGP address family</td><td>Large automated deployments</td></tr></table>
<h3>Reference configuration (IOS XR style)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
segment-routing
 traffic-eng
  segment-list VIA-P3
   index 10 mpls label 16003
   index 20 mpls label 16002
<span class="c">  !</span>
  policy VIDEO-TO-PE2
   color 100 end-point ipv4 192.0.2.2
   candidate-paths
    preference 200
     explicit segment-list VIA-P3
<span class="c">    !</span>
    preference 100
     dynamic
      metric
       type te
<span class="c">      !</span>
<span class="c">     !</span>
<span class="c">    !</span>
<span class="c">   !</span>
<span class="c">  !</span>
<span class="c"> !</span>
<span class="c">!</span></pre>
<p>Here, the preferred path (200) uses the explicit list that goes first to P3 (label 16003) and then to PE2 (label 16002). If that list becomes invalid, for example because P3 leaves the topology, the policy falls back to preference 100, a dynamic path computed with the TE metric. The labels here are only examples from an SRGB of 16000 to 23999 with index numbers 3 and 2.</p>
<h3>How traffic gets into the policy: automated steering</h3>
<p>With RSVP-TE you steered with autoroute or static routes. With SR-TE, <b>automated steering (AS)</b> uses the BGP route itself. A BGP route that arrives with a <b>color extended community</b> and a next hop equal to a policy endpoint is installed with the policy as the next hop, as long as a policy with the matching color and endpoint is up. The service route chooses the path, and the operator controls it from the policy and route-policy, not from per-prefix static routes. If there is no matching policy, the route follows the normal IGP shortest path.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Mark the video VRF routes with color 100 on the egress PE</span>
extcommunity-set opaque COLOR100
 100
end-set
<span class="c">!</span>
route-policy SET-VIDEO-COLOR
 set extcommunity color COLOR100
end-policy</pre>
<h3>On-demand next hop (ODN)</h3>
<p><b>ODN</b> goes one step further: the policy does not have to exist in advance. When the head end receives a BGP route with color 100 and next hop PE2, and no policy exists, it <b>instantiates one automatically</b> from a template. The template, defined with <code>on-demand color 100</code>, says how to compute the path (for example dynamic with the delay metric, avoiding a certain affinity). With ODN, adding a new PE needs no tunnel configuration anywhere: the colour on the route and the template are enough, and unused policies are removed. This is the SR answer to the full tunnel mesh of the TE module.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
segment-routing
 traffic-eng
  on-demand color 100
   dynamic
    metric
     type te
<span class="c">    !</span>
<span class="c">   !</span>
<span class="c">  !</span>
<span class="c"> !</span>
<span class="c">!</span></pre>
<table class="cmp"><tr><th>Question</th><th>RSVP-TE</th><th>SR-TE</th></tr><tr><td>State in transit routers</td><td>Per tunnel</td><td>None per policy</td></tr><tr><td>Signalling</td><td>RSVP-TE PATH and RESV</td><td>None; the label stack is the path</td></tr><tr><td>Steering</td><td>Autoroute, static, PBR</td><td>Automated steering by color and endpoint; also static and PBR</td></tr><tr><td>Auto-creation</td><td>Auto-tunnel mesh</td><td>ODN driven by BGP color</td></tr><tr><td>Bandwidth awareness</td><td>Reservations in control plane</td><td>Needs a PCE or telemetry-based controller</td></tr><tr><td>ECMP</td><td>One path per tunnel</td><td>Prefix-SIDs use ECMP inside the list</td></tr></table>
<div class="eg"><p><b>Worked example.</b> PE2 advertises VPN routes for the video customer with color 100. PE1 has an ODN template for color 100 with a latency-based dynamic path. When the first route arrives, PE1 creates the policy PE1 to PE2 color 100, computes a segment list over the lowest-latency path, installs it and steers the video VRF into it. If a link on that path degrades, the head end re-computes and the stack changes, while the other VPNs without the color keep the IGP path.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using a color on the route that no policy or ODN template defines. The route then falls back silently to the normal path, and it looks as if SR-TE does nothing. Another mistake: a very long segment list that exceeds the MSD of the head end, so the policy goes down. Use fewer segments, a binding-SID or prefix-SIDs.</p></div>
<div class="exam"><p><b>Exam trap.</b> The policy key is head end, color and endpoint. Preference is per candidate path and the <i>highest</i> valid preference wins (the opposite of RSVP path-option numbers, where the lowest wins). Automated steering needs a matching color and endpoint; ODN creates the policy on demand from a template.</p></div>
<div class="scn"><h4>A new PE with no tunnel work</h4><p>A provider added PE12 in a new city. In the old design, adding a PE meant creating about 40 new TE tunnels and a night of change windows. In the SR design, the operations team gave PE12 a prefix-SID and attached the standard color to its VPN routes. ODN on every other PE created the policies when the first routes arrived, and the services came up the same afternoon.</p><p><b>Lesson:</b> ODN plus color turns traffic engineering into route policy instead of per-pair configuration.</p></div>
<div class="iv"><p class="q">"Explain SR policies, color, ODN and automated steering."</p><p>An SR policy is identified by head end, color and endpoint and holds candidate paths with preferences; the highest valid preference is active and its segment list is pushed on the packets. Color expresses intent. Automated steering installs a BGP route with a color extended community into the policy with matching color and endpoint. ODN creates that policy dynamically from a template when such a route arrives. Compared with RSVP-TE, there is no per-hop signalling and no transit state.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SR policy identity: head end, color, endpoint; candidate paths have preferences, highest valid wins.</li>
<li>Segment lists can be explicit, dynamic (head end) or computed by a PCE.</li>
<li>Automated steering uses the BGP color extended community and next hop.</li>
<li>ODN instantiates policies on demand from templates.</li>
<li>Binding-SID is a label that represents a whole policy.</li>
</ul></div>
`,hi:`
<p><b>SR policy</b> ek travel plan hai jiske folder par teen labels hain: kaun travel kar raha hai (head end), kahan jaana hai (endpoint) aur kyun (ek <b>color</b>, jaise "low latency"). Folder ke andar preferences ke saath ek ya zyada routes (candidate paths) hain, aur sabse high preference wala jo kaam kare use hota hai. RSVP-TE tunnel ke ulat, kuch bhi hop by hop signal nahi hota. Head end bas segment list push karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="SR policy sabse achha valid candidate path chunti hai, uski segment list install karti hai, aur matching color wala traffic usme steer hota hai."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">head end, color, endpoint</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Candidate paths</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">preference 200, 100</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Segment list</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">SIDs</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Steering</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">BGP color match</text></svg><p class="cap">SR policy sabse achha valid candidate path chunti hai, uski segment list install karti hai, aur matching color wala traffic usme steer hota hai.</p></div>
<h3>SR policy ki anatomy</h3>
<ul>
<li><b>Identity.</b> Policy head end, color aur endpoint se pehchani jaati hai. Color 32 bit number hai jo intent express karta hai, jaise 100 low latency aur 200 high bandwidth. Ek endpoint par alag colors ki kai policies ho sakti hain.</li>
<li><b>Candidate paths.</b> Har ek ki numeric <b>preference</b> hoti hai. Sabse high preference wala valid path <b>active path</b> hai. Woh invalid ho jaaye to agla takeover karta hai, built-in fallback.</li>
<li><b>Segment list.</b> Ordered SIDs (prefix, adjacency ya binding) jo head end push karta hai. Candidate path ki load sharing ke liye kai weighted segment lists ho sakti hain.</li>
<li><b>Binding-SID.</b> Local label jo poori policy ko represent karta hai. Doosri policies ya domains poori list ki jagah ek BSID use kar sakte hain, stacks chhote karne aur domains jodne ka tareeka.</li>
</ul>
<h3>Candidate path ke types</h3>
<table class="cmp"><tr><th>Type</th><th>List kaise banti hai</th><th>Notes</th></tr><tr><td>Explicit</td><td>Operator segment list likhta hai</td><td>Poora control; topology badle to update karni padti hai</td></tr><tr><td>Dynamic (head end)</td><td>Head end IGP database se metric aur constraints ke saath path compute karta hai (IGP, TE ya latency metric, affinity, disjointness)</td><td>Apne aap re-optimise hota hai</td></tr><tr><td>Dynamic (PCE)</td><td>PCE bade view se compute karta hai aur PCEP par segment lists wapas deta hai</td><td>Multi-domain, bandwidth-aware designs</td></tr><tr><td>BGP SR-TE</td><td>Policy controller se BGP address family mein signal hoti hai</td><td>Bade automated deployments</td></tr></table>
<h3>Reference configuration (IOS XR style)</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
segment-routing
 traffic-eng
  segment-list VIA-P3
   index 10 mpls label 16003
   index 20 mpls label 16002
<span class="c">  !</span>
  policy VIDEO-TO-PE2
   color 100 end-point ipv4 192.0.2.2
   candidate-paths
    preference 200
     explicit segment-list VIA-P3
<span class="c">    !</span>
    preference 100
     dynamic
      metric
       type te
<span class="c">      !</span>
<span class="c">     !</span>
<span class="c">    !</span>
<span class="c">   !</span>
<span class="c">  !</span>
<span class="c"> !</span>
<span class="c">!</span></pre>
<p>Yahan preferred path (200) explicit list use karta hai jo pehle P3 (label 16003) aur phir PE2 (label 16002) jaati hai. Woh list invalid ho jaaye, jaise P3 topology se chala jaaye, to policy preference 100 par fallback karti hai, jo TE metric se compute hua dynamic path hai. Yahan labels sirf examples hain, SRGB 16000 se 23999 aur index numbers 3 aur 2 se.</p>
<h3>Traffic policy mein kaise jaata hai: automated steering</h3>
<p>RSVP-TE mein aap autoroute ya static routes se steer karte the. SR-TE mein <b>automated steering (AS)</b> BGP route ko hi use karta hai. Jo BGP route <b>color extended community</b> aur policy endpoint ke barabar next hop ke saath aata hai woh policy ko next hop banakar install hota hai, bashart matching color aur endpoint wali policy up ho. Service route path chunta hai, aur operator ise policy aur route-policy se control karta hai, per-prefix static routes se nahi. Matching policy na ho to route normal IGP shortest path follow karta hai.</p>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! Egress PE par video VRF routes ko color 100 se mark karo</span>
extcommunity-set opaque COLOR100
 100
end-set
<span class="c">!</span>
route-policy SET-VIDEO-COLOR
 set extcommunity color COLOR100
end-policy</pre>
<h3>On-demand next hop (ODN)</h3>
<p><b>ODN</b> ek kadam aage jaata hai: policy ka pehle se hona zaroori nahi. Head end ko color 100 aur next hop PE2 wala BGP route mile aur koi policy na ho to woh template se <b>automatically ek instantiate</b> karta hai. <code>on-demand color 100</code> se define template batata hai ki path kaise compute ho (jaise delay metric ke saath dynamic, kisi affinity se bachkar). ODN ke saath naya PE jodne ke liye kahin tunnel configuration nahi chahiye: route par colour aur template kaafi hain, aur unused policies hat jaati hain. Yeh TE module ke full tunnel mesh ka SR jawab hai.</p>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
segment-routing
 traffic-eng
  on-demand color 100
   dynamic
    metric
     type te
<span class="c">    !</span>
<span class="c">   !</span>
<span class="c">  !</span>
<span class="c"> !</span>
<span class="c">!</span></pre>
<table class="cmp"><tr><th>Sawaal</th><th>RSVP-TE</th><th>SR-TE</th></tr><tr><td>Transit routers mein state</td><td>Per tunnel</td><td>Per policy kuch nahi</td></tr><tr><td>Signalling</td><td>RSVP-TE PATH aur RESV</td><td>Koi nahi; label stack hi path hai</td></tr><tr><td>Steering</td><td>Autoroute, static, PBR</td><td>Color aur endpoint se automated steering; static aur PBR bhi</td></tr><tr><td>Auto-creation</td><td>Auto-tunnel mesh</td><td>BGP color se chalne wala ODN</td></tr><tr><td>Bandwidth awareness</td><td>Control plane mein reservations</td><td>PCE ya telemetry-based controller chahiye</td></tr><tr><td>ECMP</td><td>Tunnel ka ek path</td><td>List ke andar prefix-SIDs ECMP use karte hain</td></tr></table>
<div class="eg"><p><b>Worked example.</b> PE2 video customer ke VPN routes color 100 ke saath advertise karta hai. PE1 ke paas color 100 ke liye latency-based dynamic path ka ODN template hai. Pehla route aate hi PE1 policy PE1 se PE2 color 100 banata hai, sabse kam latency wale path par segment list compute karta hai, install karta hai aur video VRF ko usme steer karta hai. Us path ka link degrade ho to head end dobara compute karta hai aur stack badal jaata hai, jabki color ke bina baaki VPNs IGP path par rehte hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Route par aisa color use karna jo kisi policy ya ODN template ne define nahi kiya. Route chupchaap normal path par fallback karta hai aur lagta hai SR-TE kuch nahi kar raha. Ek aur galti: bahut lambi segment list jo head end ke MSD se zyada ho, aur policy down ho jaati hai. Kam segments, binding-SID ya prefix-SIDs use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy key head end, color aur endpoint hai. Preference per candidate path hai aur <i>sabse high</i> valid preference jeetti hai (RSVP path-option numbers ke ulat, jahan sabse chhota jeetta hai). Automated steering ko matching color aur endpoint chahiye; ODN template se policy on demand banata hai.</p></div>
<div class="scn"><h4>Naya PE, tunnel ka kaam nahi</h4><p>Ek provider ne naye shehar mein PE12 jodha. Purane design mein PE jodne ka matlab tha lagbhag 40 naye TE tunnels aur ek raat ki change windows. SR design mein operations team ne PE12 ko prefix-SID diya aur uske VPN routes par standard color lagaya. Har doosre PE par ODN ne pehle routes aate hi policies bana di, aur services usi dopahar up ho gayi.</p><p><b>Lesson:</b> ODN plus color traffic engineering ko per-pair configuration ki jagah route policy bana deta hai.</p></div>
<div class="iv"><p class="q">"SR policies, color, ODN aur automated steering samjhao."</p><p>SR policy head end, color aur endpoint se pehchani jaati hai aur preferences ke saath candidate paths rakhti hai; sabse high valid preference active hoti hai aur uski segment list packets par push hoti hai. Color intent express karta hai. Automated steering color extended community wale BGP route ko matching color aur endpoint wali policy mein install karta hai. ODN aisa route aane par template se woh policy dynamically banata hai. RSVP-TE ke muqable per-hop signalling aur transit state nahi hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SR policy identity: head end, color, endpoint; candidate paths ki preferences, sabse high valid jeetti hai.</li>
<li>Segment lists explicit, dynamic (head end) ya PCE se compute ho sakti hain.</li>
<li>Automated steering BGP color extended community aur next hop use karta hai.</li>
<li>ODN templates se policies on demand instantiate karta hai.</li>
<li>Binding-SID poori policy ko represent karne wala label hai.</li>
</ul></div>
`}};export{e as default};