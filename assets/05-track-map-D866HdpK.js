var e={id:`track-map`,h:{en:`The track map: where each module and lab fits`,hi:`Track ka map: har module aur lab kahan fit hota hai`},body:{en:`
<p>Before you start the labs, spend five minutes with the map of the whole sr-evpn track. Knowing why a lab exists makes it far easier to remember.</p>

<h3>Two halves, one story</h3>
<p>The track follows a service provider that wants to sell private connectivity. First it needs a fast, protected transport (segment routing). Then it needs services on top (L3VPN). The same company also runs a data centre, which needs its own overlay (VXLAN with EVPN). This module, <b>sre-start</b>, is the shared on-ramp for both halves.</p>
<table class="cmp"><tr><th>Module</th><th>What you learn</th><th>What you build</th></tr>
<tr><td>sre-start</td><td>Vocabulary, labels, the shape of the track</td><td>One light lab: switch SR on for PE2</td></tr>
<tr><td>spcor-sr</td><td>Prefix and adjacency SIDs, TI-LFA, explicit stacks</td><td>Labs on the same ring, including troubleshooting</td></tr>
<tr><td>sre-sr-vpn</td><td>L3VPN over SR with no LDP</td><td>Build, troubleshoot, and a three-city design</td></tr>
<tr><td>EVPN modules</td><td>VXLAN underlay, EVPN type 2 and 5 routes, multihoming</td><td>Data-centre fabrics</td></tr></table>

<h3>The topology you will meet again and again</h3>
<p>Every SR lab uses the same five routers, so you never spend time learning a new drawing. Customer sites hang off the edges.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Customer sites around the SR core">
<rect x="10" y="60" width="60" height="40" rx="8" fill="#fde68a"/><text x="40" y="85" text-anchor="middle" class="svg-ink" font-size="12">CE1</text>
<rect x="110" y="60" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="145" y="85" text-anchor="middle" class="svg-ink" font-size="12">PE1</text>
<rect x="230" y="60" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">P1  P2  P3 (SR core)</text>
<rect x="460" y="60" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="495" y="85" text-anchor="middle" class="svg-ink" font-size="12">PE2</text>
<rect x="570" y="60" width="60" height="40" rx="8" fill="#fde68a"/><text x="600" y="85" text-anchor="middle" class="svg-ink" font-size="12">CE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="70" y1="80" x2="110" y2="80"/><line x1="180" y1="80" x2="230" y2="80"/><line x1="410" y1="80" x2="460" y2="80"/><line x1="530" y1="80" x2="570" y2="80"/></g>
<text x="40" y="125" text-anchor="middle" class="svg-ink" font-size="11">AS 65101</text><text x="600" y="125" text-anchor="middle" class="svg-ink" font-size="11">AS 65102</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="11">IS-IS L2, AS 65000, no LDP</text>
</svg><p class="cap">CE1 and CE2 are the customer routers, each in its own AS; the provider core is AS 65000.</p></div>

<h3>Addressing cheat sheet</h3>
<ul>
<li>Loopbacks: 10.0.255.1 (PE1), .2 (P1), .3 (P2), .4 (P3), .5 (PE2).</li>
<li>Customer LANs: 172.16.1.0/24 behind CE1 and 172.16.2.0/24 behind CE2, PCs at .10.</li>
<li>VRF name CUST_A; RD and RT 65000:1.</li>
</ul>

<div class="eg"><b>Worked example.</b> You are asked "which label does PE1 push to reach PE2?" You do not search for it. PE2 is the fifth router, so its index is 5 and the label is 16005. The map has already answered the question.</div>

<div class="warn"><b>Common mistake.</b> Jumping to the EVPN labs first because they look newer. The route-target and underlay ideas in them assume you did the L3VPN labs; the order in the map is deliberate.</div>

<div class="scn"><h4>The new joiner</h4><p>A new engineer is given PE3 to onboard on day two. Because every lab used the same numbering plan, she picked index 6, used 10.0.255.6, and the neighbours agreed on the first try.</p><p><b>Lesson:</b> a predictable plan turns onboarding into routine work.</p></div>

<div class="iv"><p class="q">"Describe the network design you have worked with."</p><p>Give the shape first: a five-router IS-IS ring with segment routing, loopback indexes equal to the router number, and an L3VPN carried over SR labels without LDP. Then mention the failure modes you practised.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One ring, one numbering plan, reused across labs.</li>
<li>Modules go transport first, services second, data centre third.</li>
<li>Learn the address cheat sheet; it saves time in every lab.</li>
</ul></div>
`,hi:`
<p>Labs shuru karne se pehle paanch minute poore sr-evpn track ke map ko do. Lab kyun hai yeh pata ho to yaad rakhna bahut aasaan ho jaata hai.</p>

<h3>Do halves, ek kahani</h3>
<p>Track ek service provider ko follow karta hai jo private connectivity bechna chahta hai. Pehle use tez, protected transport chahiye (segment routing). Phir uspar services (L3VPN). Wahi company ek data centre bhi chalati hai, jise apna overlay (EVPN ke saath VXLAN) chahiye. Yeh module, <b>sre-start</b>, dono halves ka shared on-ramp hai.</p>
<table class="cmp"><tr><th>Module</th><th>Kya seekhoge</th><th>Kya banaoge</th></tr>
<tr><td>sre-start</td><td>Vocabulary, labels, track ka shape</td><td>Ek halka lab: PE2 par SR on karo</td></tr>
<tr><td>spcor-sr</td><td>Prefix aur adjacency SIDs, TI-LFA, explicit stacks</td><td>Usi ring par labs, troubleshooting samet</td></tr>
<tr><td>sre-sr-vpn</td><td>LDP ke bina SR par L3VPN</td><td>Build, troubleshoot, aur teen-city design</td></tr>
<tr><td>EVPN modules</td><td>VXLAN underlay, EVPN type 2 aur 5 routes, multihoming</td><td>Data-centre fabrics</td></tr></table>

<h3>Woh topology jo baar baar milegi</h3>
<p>Har SR lab mein wahi paanch routers hain, isliye nayi drawing seekhne mein time nahi jaata. Customer sites edges par lagi hain.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Customer sites around the SR core">
<rect x="10" y="60" width="60" height="40" rx="8" fill="#fde68a"/><text x="40" y="85" text-anchor="middle" class="svg-ink" font-size="12">CE1</text>
<rect x="110" y="60" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="145" y="85" text-anchor="middle" class="svg-ink" font-size="12">PE1</text>
<rect x="230" y="60" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="12">P1  P2  P3 (SR core)</text>
<rect x="460" y="60" width="70" height="40" rx="8" fill="#bbf7d0"/><text x="495" y="85" text-anchor="middle" class="svg-ink" font-size="12">PE2</text>
<rect x="570" y="60" width="60" height="40" rx="8" fill="#fde68a"/><text x="600" y="85" text-anchor="middle" class="svg-ink" font-size="12">CE2</text>
<g stroke="#64748b" stroke-width="2"><line x1="70" y1="80" x2="110" y2="80"/><line x1="180" y1="80" x2="230" y2="80"/><line x1="410" y1="80" x2="460" y2="80"/><line x1="530" y1="80" x2="570" y2="80"/></g>
<text x="40" y="125" text-anchor="middle" class="svg-ink" font-size="11">AS 65101</text><text x="600" y="125" text-anchor="middle" class="svg-ink" font-size="11">AS 65102</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="11">IS-IS L2, AS 65000, no LDP</text>
</svg><p class="cap">CE1 aur CE2 customer routers hain, har ek apne AS mein; provider core AS 65000 hai.</p></div>

<h3>Addressing cheat sheet</h3>
<ul>
<li>Loopbacks: 10.0.255.1 (PE1), .2 (P1), .3 (P2), .4 (P3), .5 (PE2).</li>
<li>Customer LANs: CE1 ke peeche 172.16.1.0/24 aur CE2 ke peeche 172.16.2.0/24, PCs .10 par.</li>
<li>VRF naam CUST_A; RD aur RT 65000:1.</li>
</ul>

<div class="eg"><b>Worked example.</b> Poocha gaya "PE1 PE2 tak pahunchne ke liye kaunsa label push karta hai?" Aap search nahi karte. PE2 paanchva router hai, isliye index 5 aur label 16005. Map ne sawaal ka jawab pehle hi de diya.</div>

<div class="warn"><b>Common mistake.</b> EVPN labs pehle shuru kar dena kyunki woh naye lagte hain. Unke route-target aur underlay ideas L3VPN labs maan kar chalte hain; map ka order jaanbujhkar hai.</div>

<div class="scn"><h4>Naya joiner</h4><p>Ek naye engineer ko doosre din PE3 onboard karna diya gaya. Har lab mein wahi numbering plan tha, isliye usne index 6, 10.0.255.6 chuna aur neighbours pehli koshish mein maan gaye.</p><p><b>Lesson:</b> predictable plan onboarding ko routine kaam bana deta hai.</p></div>

<div class="iv"><p class="q">"Aapne jis network design par kaam kiya usse describe karo."</p><p>Pehle shape batao: paanch-router IS-IS ring segment routing ke saath, loopback index router number ke barabar, aur LDP ke bina SR labels par L3VPN. Phir woh failure modes batao jinki aapne practice ki.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek ring, ek numbering plan, labs mein dobara use.</li>
<li>Modules ka order: pehle transport, phir services, phir data centre.</li>
<li>Address cheat sheet yaad rakho; har lab mein time bachata hai.</li>
</ul></div>
`}};export{e as default};