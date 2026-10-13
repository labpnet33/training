var e={id:`big-picture`,h:{en:`What you will learn: roads, addresses and company mail`,hi:`Aap kya seekhoge: roads, addresses aur company mail`},body:{en:`
<h3>What you will learn</h3>
<p>In the previous modules you built the SD-WAN: the Director, the Controller, the branch CPEs and the tunnels between them. In this module you make the network <b>useful</b>. A tunnel that is up is only a road. Users need the LAN at Delhi to reach the LAN at Bengaluru, and that needs the right <b>routes</b> in the right places. By the end of this module you will be able to:</p>
<ul>
<li>explain connected, static and dynamic routes, longest-prefix match and administrative distance;</li>
<li>explain why Versa keeps <b>transport VRs</b> (underlay) separate from <b>LAN VRs</b> (overlay) and what lives in each;</li>
<li>configure static and backup default routes, and read a route table;</li>
<li>explain what MP-BGP carries between branches and the Controller, and why the Controller works like a route-reflector hub;</li>
<li>describe LAN-side routing (static, OSPF, BGP) and redistribution into the overlay;</li>
<li>explain tenants (organizations), VRF segmentation, route leaking and the main topologies;</li>
<li>complete the three labs: <b>vs-lan-advertise</b>, <b>vs-mpls-route</b> and <b>vs-tenant-mismatch</b>.</li>
</ul>
<div class="note"><p><b>Prerequisites.</b> You should know IP addressing and subnet masks, what a default gateway is, and the Versa architecture and onboarding from the earlier modules (Director, Controller, Analytics, VOS branch, organization Acme, site-id, transports Internet, MPLS and LTE). If tunnels and sites are new words, revisit those modules first.</p></div>

<h3>The big picture: roads, addresses and company mail</h3>
<p>Imagine a courier company with three offices in Delhi, Bengaluru and Kolkata. The courier trucks drive on <b>public roads</b> (the Internet), on a <b>private highway</b> rented from a telecom (MPLS) and on a <b>mobile-network lane</b> (LTE). Those roads have their own addresses and their own rules. This is the <b>underlay</b>.</p>
<p>Inside the trucks, sealed bags carry <b>company mail</b> addressed with the company's own room numbers such as 10.1.1.0/24. Nobody on the road reads the bag. This is the <b>overlay</b>. For mail to arrive, two things must be right: the truck must reach the other office's road address (underlay routing), and every office must know which room numbers live in which office (overlay routing).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Underlay and overlay">
<rect x="20" y="20" width="600" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Overlay: tenant Acme, LAN VR (company mail)</text>
<rect x="50" y="52" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="125" y="74" text-anchor="middle" class="svg-ink" font-size="12">Delhi 10.1.1.0/24</text>
<rect x="245" y="52" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="12">Bengaluru 10.1.2.0/24</text>
<rect x="440" y="52" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="515" y="74" text-anchor="middle" class="svg-ink" font-size="12">Kolkata 10.1.3.0/24</text>
<rect x="20" y="130" width="600" height="95" rx="10" fill="#bae6fd"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="14">Underlay: transport VRs (the roads)</text>
<rect x="50" y="168" width="150" height="40" rx="6" fill="#fde68a"/><text x="125" y="193" text-anchor="middle" class="svg-ink" font-size="12">Internet 203.0.113.x</text>
<rect x="245" y="168" width="150" height="40" rx="6" fill="#fed7aa"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="12">MPLS 172.31.x.x</text>
<rect x="440" y="168" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="515" y="193" text-anchor="middle" class="svg-ink" font-size="12">LTE 100.64.x.x</text>
<line x1="125" y1="86" x2="125" y2="168" stroke="#64748b" stroke-dasharray="4 4"/><line x1="320" y1="86" x2="320" y2="168" stroke="#64748b" stroke-dasharray="4 4"/><line x1="515" y1="86" x2="515" y2="168" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="242" text-anchor="middle" class="svg-muted" font-size="12">Tunnels carry overlay routes across underlay roads</text>
</svg><p class="cap">Two routing worlds: the underlay gets tunnels up, the overlay moves user traffic.</p></div>

<h3>The three labs in one minute</h3>
<table class="cmp"><tr><th>Lab</th><th>Symptom</th><th>Root idea</th></tr>
<tr><td>vs-lan-advertise</td><td>PC2 in Bengaluru cannot reach Delhi</td><td>LAN interface vni-0/3 was never configured, so no prefix to advertise</td></tr>
<tr><td>vs-mpls-route</td><td>MPLS interface is up, tunnel is down</td><td>Wrong next hop in the MPLS transport VR</td></tr>
<tr><td>vs-tenant-mismatch</td><td>Kolkata cannot join</td><td>Branch configured under organization Guest instead of Acme</td></tr></table>

<div class="note"><p><b>About the course CLI.</b> The lab CLI is a <b>simplified model</b> of the real Versa VOS and Director. Real VOS has far more options and a large GUI. The concepts, tables and troubleshooting logic are the same ones you use on the real platform, and we point out where the model simplifies.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking "tunnel up means everything works". A tunnel proves the underlay path and the control session. It does not prove that LAN prefixes are configured, advertised, imported or allowed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Underlay and overlay routing are different tables with different next hops. A question that shows an overlay prefix with a transport address as next hop is mixing them up.</p></div>

<div class="scn"><h4>Green tunnels, silent users</h4><p>After a rollout the NOC dashboard showed all tunnels green, yet Bengaluru users could not open Delhi servers. The engineer checked the WAN side first and found everything healthy, then looked at the LAN interface and found it unconfigured. One configuration line and a commit made the prefix appear at Delhi.</p><p><b>Lesson:</b> check the layer that matches the symptom: green tunnels say nothing about missing LAN prefixes.</p></div>
<div class="iv"><p class="q">"Explain underlay and overlay in SD-WAN."</p><p>Underlay: the transport circuits (Internet, MPLS, LTE) and the routes that make tunnel endpoints reachable. Overlay: encrypted tunnels between sites plus the tenant routes carried over them, learned through MP-BGP with the Controller. Mention that each has its own routing table, and troubleshooting starts at the lower layer.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = roads (transport circuits and their routes); overlay = company mail (tenant LAN routes).</li>
<li>A tunnel that is up does not prove LAN reachability.</li>
<li>This module covers LAN advertising, underlay routes and tenant consistency.</li>
<li>The lab CLI is a simplified model of real VOS.</li>
<li>Three labs: vs-lan-advertise, vs-mpls-route, vs-tenant-mismatch.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Pichhle modules mein aapne SD-WAN banaya: Director, Controller, branch CPEs aur unke beech tunnels. Is module mein aap network ko <b>useful</b> banate ho. Tunnel up hona sirf ek road hai. Users ko chahiye ki Delhi ka LAN Bengaluru ke LAN tak pahunche, aur uske liye sahi jagah par sahi <b>routes</b> chahiye. Module ke end tak aap yeh kar paoge:</p>
<ul>
<li>connected, static aur dynamic routes, longest-prefix match aur administrative distance explain karna;</li>
<li>explain karna ki Versa <b>transport VRs</b> (underlay) ko <b>LAN VRs</b> (overlay) se alag kyun rakhta hai aur har ek mein kya hota hai;</li>
<li>static aur backup default routes configure karna, aur route table padhna;</li>
<li>explain karna ki MP-BGP branches aur Controller ke beech kya carry karta hai, aur Controller route-reflector hub jaisa kaam kyun karta hai;</li>
<li>LAN-side routing (static, OSPF, BGP) aur overlay mein redistribution describe karna;</li>
<li>tenants (organizations), VRF segmentation, route leaking aur main topologies explain karna;</li>
<li>teeno labs complete karna: <b>vs-lan-advertise</b>, <b>vs-mpls-route</b> aur <b>vs-tenant-mismatch</b>.</li>
</ul>
<div class="note"><p><b>Prerequisites.</b> Aapko IP addressing aur subnet masks, default gateway kya hota hai, aur pichhle modules ka Versa architecture aur onboarding aana chahiye (Director, Controller, Analytics, VOS branch, organization Acme, site-id, transports Internet, MPLS aur LTE). Agar tunnels aur sites naye words lagte hain, pehle un modules ko dobara dekho.</p></div>

<h3>Big picture: roads, addresses aur company mail</h3>
<p>Ek courier company socho jiske Delhi, Bengaluru aur Kolkata mein teen offices hain. Courier trucks <b>public roads</b> (Internet) par chalte hain, telecom se kiraye par li <b>private highway</b> (MPLS) par, aur <b>mobile-network lane</b> (LTE) par. In roads ke apne addresses aur apne rules hain. Yeh <b>underlay</b> hai.</p>
<p>Trucks ke andar sealed bags mein <b>company mail</b> hai jo company ke apne room numbers jaise 10.1.1.0/24 se address hota hai. Road par koi bag nahi padhta. Yeh <b>overlay</b> hai. Mail pahunchne ke liye do cheezein sahi honi chahiye: truck doosre office ke road address tak pahunche (underlay routing), aur har office jaanta ho ki kaunsa room number kis office mein hai (overlay routing).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Underlay and overlay">
<rect x="20" y="20" width="600" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Overlay: tenant Acme, LAN VR (company mail)</text>
<rect x="50" y="52" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="125" y="74" text-anchor="middle" class="svg-ink" font-size="12">Delhi 10.1.1.0/24</text>
<rect x="245" y="52" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="12">Bengaluru 10.1.2.0/24</text>
<rect x="440" y="52" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="515" y="74" text-anchor="middle" class="svg-ink" font-size="12">Kolkata 10.1.3.0/24</text>
<rect x="20" y="130" width="600" height="95" rx="10" fill="#bae6fd"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="14">Underlay: transport VRs (roads)</text>
<rect x="50" y="168" width="150" height="40" rx="6" fill="#fde68a"/><text x="125" y="193" text-anchor="middle" class="svg-ink" font-size="12">Internet 203.0.113.x</text>
<rect x="245" y="168" width="150" height="40" rx="6" fill="#fed7aa"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="12">MPLS 172.31.x.x</text>
<rect x="440" y="168" width="150" height="40" rx="6" fill="#e2e8f0"/><text x="515" y="193" text-anchor="middle" class="svg-ink" font-size="12">LTE 100.64.x.x</text>
<line x1="125" y1="86" x2="125" y2="168" stroke="#64748b" stroke-dasharray="4 4"/><line x1="320" y1="86" x2="320" y2="168" stroke="#64748b" stroke-dasharray="4 4"/><line x1="515" y1="86" x2="515" y2="168" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="242" text-anchor="middle" class="svg-muted" font-size="12">Tunnels overlay routes ko underlay roads par le jaate hain</text>
</svg><p class="cap">Do routing worlds: underlay tunnels up karta hai, overlay user traffic chalata hai.</p></div>

<h3>Teeno labs ek minute mein</h3>
<table class="cmp"><tr><th>Lab</th><th>Symptom</th><th>Root idea</th></tr>
<tr><td>vs-lan-advertise</td><td>Bengaluru ka PC2 Delhi tak nahi pahunchta</td><td>LAN interface vni-0/3 kabhi configure nahi hua, isliye advertise karne ko prefix nahi</td></tr>
<tr><td>vs-mpls-route</td><td>MPLS interface up hai, tunnel down hai</td><td>MPLS transport VR mein galat next hop</td></tr>
<tr><td>vs-tenant-mismatch</td><td>Kolkata join nahi kar pa raha</td><td>Branch organization Acme ki jagah Guest ke under configure hua</td></tr></table>

<div class="note"><p><b>Course CLI ke baare mein.</b> Lab CLI real Versa VOS aur Director ka <b>simplified model</b> hai. Real VOS mein bahut zyada options aur bada GUI hota hai. Concepts, tables aur troubleshooting logic wahi hain jo real platform par use hote hain, aur jahan model simplify karta hai wahan hum bata dete hain.</p></div>

<div class="warn"><p><b>Common galti.</b> "Tunnel up matlab sab chal raha hai" maan lena. Tunnel sirf underlay path aur control session prove karta hai. Yeh prove nahi karta ki LAN prefixes configure, advertise, import ya allow hue hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Underlay aur overlay routing alag tables hain jinke next hops alag hain. Agar kisi question mein overlay prefix ka next hop transport address dikhe, to wahan dono ko mila diya gaya hai.</p></div>

<div class="scn"><h4>Tunnels green, users chup</h4><p>Rollout ke baad NOC dashboard par saare tunnels green the, phir bhi Bengaluru ke users Delhi ke servers nahi khol paa rahe the. Engineer ne pehle WAN side check ki aur sab healthy mila, phir LAN interface dekha to woh configure hi nahi tha. Ek configuration line aur commit se prefix Delhi par aa gaya.</p><p><b>Seekh:</b> symptom ke hisaab se sahi layer check karo: green tunnels missing LAN prefixes ke baare mein kuch nahi batate.</p></div>
<div class="iv"><p class="q">"SD-WAN mein underlay aur overlay explain karo."</p><p>Underlay: transport circuits (Internet, MPLS, LTE) aur woh routes jo tunnel endpoints ko reachable banate hain. Overlay: sites ke beech encrypted tunnels plus un par carry hone wale tenant routes, jo Controller ke saath MP-BGP se seekhe jaate hain. Batao ki dono ki apni routing table hai aur troubleshooting neeche ki layer se shuru hoti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Underlay = roads (transport circuits aur unke routes); overlay = company mail (tenant LAN routes).</li>
<li>Tunnel up hona LAN reachability prove nahi karta.</li>
<li>Yeh module LAN advertising, underlay routes aur tenant consistency cover karta hai.</li>
<li>Lab CLI real VOS ka simplified model hai.</li>
<li>Teen labs: vs-lan-advertise, vs-mpls-route, vs-tenant-mismatch.</li>
</ul></div>
`}};export{e as default};