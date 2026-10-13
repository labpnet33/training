var e={id:`static-backup-default`,h:{en:`Static routes, default routes and LTE as backup`,hi:`Static routes, default routes aur backup ke roop mein LTE`},body:{en:`
<p>A static route is a signpost you plant yourself: "to reach that town, go through this gate". It never moves, never complains and never learns. For the underlay of a branch this is usually exactly what you want: a few stable signposts toward the provider, and no routing protocol to attack or misconfigure.</p>

<h3>Syntax and meaning</h3>
<pre class="code"><span class="c">! prefix, then next hop, inside the transport VR of that circuit</span>
set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.5
set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.1
set routing-instances LTE-Transport-VR routing-options static route 0.0.0.0/0 next-hop 100.64.1.1</pre>
<p>These are the lines of Branch1 (Delhi). Read the first one aloud: "In the Internet transport VR, for anything not otherwise known (0.0.0.0/0), send it to 203.0.113.5, the carrier gateway". The address pattern is fixed in this course: Internet 203.0.113.(4k)/30 with carrier .(4k+1) and branch .(4k+2); MPLS 172.31.k.0/30 with PE .1 and CE .2; LTE 100.64.k.0/30 with carrier .1 and CPE .2, where k is the branch number.</p>

<h3>Default route versus specific route</h3>
<ul>
<li><b>Default route 0.0.0.0/0</b>: "everything else". Right for Internet and LTE, because the Controller and remote tunnel endpoints are public-side addresses you cannot list one by one.</li>
<li><b>Specific route</b> such as 172.31.0.0/16: right for MPLS, because a private MPLS network contains only a known range, and you do not want the MPLS gateway to receive random Internet traffic.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Branch2 (k=2) MPLS CE address is 172.31.2.2/30 and the PE is 172.31.2.1. The MPLS route is <code>172.31.0.0/16 next-hop 172.31.2.1</code>. The Controller MPLS address 172.31.100.2 falls inside 172.31.0.0/16, so one /16 covers every branch PE and the Controller. The next hop must lie in the connected /30: 172.31.2.1 is in 172.31.2.0/30, good; 172.31.2.5 would not be.</p></div>

<h3>Floating static routes and backup default</h3>
<p>Imagine two signposts to the same town: the main highway and a mountain road. You want the mountain road only when the highway is closed. A <b>floating static route</b> is the mountain road: a static route given a <b>worse (higher) preference or administrative distance</b>, so it sits unused in the background and floats into the routing table only when the better route disappears. On Versa this is a static route with a higher preference value in the same VR. The exact keyword differs by release, and the course CLI does not expose it, so treat it as a concept here.</p>
<p>The weak point of any static route is that it disappears only when the <b>interface goes down</b>. If the carrier fails further away while your interface stays up, the route stays and traffic is black-holed. Real designs therefore add <b>route tracking</b> (a monitor such as ICMP or an IP-SLA-style probe) or rely on SD-WAN SLA monitoring, which is the whole point of the next paragraph.</p>

<h3>LTE as backup in SD-WAN</h3>
<p>In SD-WAN the "backup" decision is usually taken one layer up. Each circuit has its own transport VR with its own default route, so Internet and LTE default routes do not compete: they live in different VRs. Both tunnels can exist at the same time, and the <b>forwarding profile</b> decides which one carries traffic (for example <code>transport-priority MPLS,Internet,LTE</code>, covered in the policy module). LTE is last in the list, so it is used only when the others are down or fail the SLA. LTE is expensive and slower (default quality 60 ms latency, 15 ms jitter, 1 percent loss), so it should stay a backup.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Backup default">
<rect x="20" y="75" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="102" text-anchor="middle" class="svg-ink" font-size="14">Branch1</text><text x="85" y="120" text-anchor="middle" class="svg-muted" font-size="12">three transport VRs</text>
<rect x="260" y="20" width="150" height="40" rx="8" fill="#fde68a"/><text x="335" y="45" text-anchor="middle" class="svg-ink" font-size="13">Internet (primary)</text>
<rect x="260" y="90" width="150" height="40" rx="8" fill="#fed7aa"/><text x="335" y="115" text-anchor="middle" class="svg-ink" font-size="13">MPLS (primary)</text>
<rect x="260" y="160" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="335" y="185" text-anchor="middle" class="svg-ink" font-size="13">LTE (backup)</text>
<rect x="500" y="75" width="120" height="60" rx="8" fill="#bae6fd"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="14">Controller</text>
<line x1="150" y1="95" x2="260" y2="40" stroke="#64748b" stroke-width="2"/><line x1="150" y1="105" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="150" y1="115" x2="260" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="410" y1="40" x2="500" y2="95" stroke="#64748b" stroke-width="2"/><line x1="410" y1="110" x2="500" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="180" x2="500" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Three underlay paths, three tunnels; the dashed LTE path is last in the transport priority list.</p></div>

<h3>Verifying static routes</h3>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.6/30
<span class="hl">vni-0/1     up      up      172.31.1.2/30</span>
vni-0/2     up      up      100.64.1.2/30
vni-0/3     up      up      10.1.1.1/24
admin@Branch1-cli&gt; ping 198.51.100.20
64 bytes from 198.51.100.20: icmp_seq=1 ttl=63 time=1.5 ms
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Check order: interface up with address, then route, then ping the far end of the underlay (the Controller), and only then look at tunnels.</p>

<div class="warn"><p><b>Common mistakes.</b> Next hop outside the connected subnet; a default route in the MPLS VR that sends Internet traffic to the MPLS PE; forgetting to <code>commit</code>; typing the CE address instead of the PE as the next hop.</p></div>
<div class="exam"><p><b>Exam trap.</b> A static route with a next hop on the wrong interface or a down interface is not installed. A floating static route has a <b>higher</b> distance, not a lower one.</p></div>

<div class="scn"><h4>The backup that never took over</h4><p>A branch had a floating default via LTE. The Internet carrier failed upstream while the router port stayed up, so the primary default route stayed active and the branch lost the Internet for 40 minutes. After adding SLA monitoring and a transport priority list, the SD-WAN moved traffic to LTE within seconds of the loss threshold being exceeded.</p><p><b>Lesson:</b> a static route alone only detects local interface failure; SD-WAN probes detect path failure.</p></div>
<div class="iv"><p class="q">"What is a floating static route and what is its weakness?"</p><p>A static route with a worse administrative distance or preference that stays hidden until the primary route is withdrawn. Weakness: the primary is withdrawn only on local interface or tracked-object failure, so you add tracking or SD-WAN SLA monitoring to detect remote failures.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static routes are prefix plus next hop, placed inside the right transport VR.</li>
<li>Internet and LTE use a 0.0.0.0/0 default; the course MPLS VR uses 172.31.0.0/16 via the PE.</li>
<li>The next hop must be inside a connected subnet.</li>
<li>Floating static means higher distance; in SD-WAN the backup decision is made by transport priority and SLA.</li>
<li>Verify in order: interface, route, underlay ping, tunnels.</li>
</ul></div>
`,hi:`
<p>Static route ek signpost hai jo aap khud lagate ho: "us town tak jaane ke liye is gate se jao". Yeh kabhi hilta nahi, shikayat nahi karta aur kuch seekhta nahi. Branch ke underlay ke liye aam taur par yahi chahiye: provider ki taraf kuch stable signposts, aur koi routing protocol nahi jise attack kiya jaaye ya misconfigure kiya jaaye.</p>

<h3>Syntax aur matlab</h3>
<pre class="code"><span class="c">! prefix, phir next hop, us circuit ke transport VR ke andar</span>
set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.5
set routing-instances MPLS-Transport-VR routing-options static route 172.31.0.0/16 next-hop 172.31.1.1
set routing-instances LTE-Transport-VR routing-options static route 0.0.0.0/0 next-hop 100.64.1.1</pre>
<p>Yeh Branch1 (Delhi) ki lines hain. Pehli line zor se padho: "Internet transport VR mein, jo kuch aur nahi pata (0.0.0.0/0), use 203.0.113.5, carrier gateway, ko bhejo". Is course mein address pattern fixed hai: Internet 203.0.113.(4k)/30 jismein carrier .(4k+1) aur branch .(4k+2); MPLS 172.31.k.0/30 jismein PE .1 aur CE .2; LTE 100.64.k.0/30 jismein carrier .1 aur CPE .2, jahan k branch number hai.</p>

<h3>Default route versus specific route</h3>
<ul>
<li><b>Default route 0.0.0.0/0</b>: "baaki sab". Internet aur LTE ke liye sahi, kyunki Controller aur remote tunnel endpoints public-side addresses hain jinhe aap ek ek karke list nahi kar sakte.</li>
<li><b>Specific route</b> jaise 172.31.0.0/16: MPLS ke liye sahi, kyunki private MPLS network mein sirf ek known range hoti hai, aur aap nahi chahte ki MPLS gateway ko random Internet traffic mile.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Branch2 (k=2) ka MPLS CE address 172.31.2.2/30 hai aur PE 172.31.2.1. MPLS route hai <code>172.31.0.0/16 next-hop 172.31.2.1</code>. Controller MPLS address 172.31.100.2 172.31.0.0/16 ke andar aata hai, isliye ek /16 har branch PE aur Controller ko cover karta hai. Next hop connected /30 ke andar hona chahiye: 172.31.2.1 172.31.2.0/30 mein hai, theek; 172.31.2.5 nahi hota.</p></div>

<h3>Floating static routes aur backup default</h3>
<p>Ek hi town ke do signposts socho: main highway aur pahadi road. Pahadi road tabhi chahiye jab highway band ho. <b>Floating static route</b> woh pahadi road hai: ek static route jisko <b>kharab (zyada) preference ya administrative distance</b> di jaati hai, isliye woh background mein unused rehta hai aur routing table mein tabhi aata hai jab behtar route gayab ho jaaye. Versa par yeh same VR mein higher preference value wala static route hota hai. Exact keyword release ke hisaab se badalta hai, aur course CLI use expose nahi karta, isliye yahan ise concept maano.</p>
<p>Kisi bhi static route ki kamzori yeh hai ki woh tabhi gayab hota hai jab <b>interface down</b> ho. Agar carrier door kahin fail ho aur aapka interface up rahe, to route rehta hai aur traffic black-hole ho jaata hai. Isliye real designs mein <b>route tracking</b> (ICMP ya IP-SLA-style probe jaisa monitor) jodte hain, ya SD-WAN SLA monitoring par depend karte hain, jo agle paragraph ka main point hai.</p>

<h3>SD-WAN mein backup ke roop mein LTE</h3>
<p>SD-WAN mein "backup" ka faisla aam taur par ek layer upar hota hai. Har circuit ka apna transport VR aur apni default route hai, isliye Internet aur LTE default routes compete nahi karte: woh alag VRs mein hain. Dono tunnels ek saath ho sakte hain, aur <b>forwarding profile</b> decide karta hai ki kaunsa traffic le jaaye (jaise <code>transport-priority MPLS,Internet,LTE</code>, jo policy module mein cover hua). LTE list mein aakhri hai, isliye sirf tab use hota hai jab baaki down ho ya SLA fail karein. LTE mehenga aur slow hai (default quality 60 ms latency, 15 ms jitter, 1 percent loss), isliye use backup hi rehna chahiye.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Backup default">
<rect x="20" y="75" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="102" text-anchor="middle" class="svg-ink" font-size="14">Branch1</text><text x="85" y="120" text-anchor="middle" class="svg-muted" font-size="12">teen transport VRs</text>
<rect x="260" y="20" width="150" height="40" rx="8" fill="#fde68a"/><text x="335" y="45" text-anchor="middle" class="svg-ink" font-size="13">Internet (primary)</text>
<rect x="260" y="90" width="150" height="40" rx="8" fill="#fed7aa"/><text x="335" y="115" text-anchor="middle" class="svg-ink" font-size="13">MPLS (primary)</text>
<rect x="260" y="160" width="150" height="40" rx="8" fill="#e2e8f0"/><text x="335" y="185" text-anchor="middle" class="svg-ink" font-size="13">LTE (backup)</text>
<rect x="500" y="75" width="120" height="60" rx="8" fill="#bae6fd"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="14">Controller</text>
<line x1="150" y1="95" x2="260" y2="40" stroke="#64748b" stroke-width="2"/><line x1="150" y1="105" x2="260" y2="110" stroke="#64748b" stroke-width="2"/><line x1="150" y1="115" x2="260" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="410" y1="40" x2="500" y2="95" stroke="#64748b" stroke-width="2"/><line x1="410" y1="110" x2="500" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="180" x2="500" y2="115" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Teen underlay paths, teen tunnels; dashed LTE path transport priority list mein aakhri hai.</p></div>

<h3>Static routes verify karna</h3>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.6/30
<span class="hl">vni-0/1     up      up      172.31.1.2/30</span>
vni-0/2     up      up      100.64.1.2/30
vni-0/3     up      up      10.1.1.1/24
admin@Branch1-cli&gt; ping 198.51.100.20
64 bytes from 198.51.100.20: icmp_seq=1 ttl=63 time=1.5 ms
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Check ka order: address wala up interface, phir route, phir underlay ke doosre end (Controller) ko ping, aur tabhi tunnels dekho.</p>

<div class="warn"><p><b>Common galtiyan.</b> Next hop connected subnet ke bahar; MPLS VR mein default route jo Internet traffic ko MPLS PE ko bhej de; <code>commit</code> bhool jaana; next hop mein PE ki jagah CE address type karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Galat interface ya down interface par next hop wala static route install nahi hota. Floating static route ki distance <b>zyada</b> hoti hai, kam nahi.</p></div>

<div class="scn"><h4>Backup jo kabhi takeover nahi hua</h4><p>Ek branch ke paas LTE ke through floating default tha. Internet carrier upstream mein fail hua jabki router port up raha, isliye primary default route active rahi aur branch 40 minute Internet se kata raha. SLA monitoring aur transport priority list jodne ke baad SD-WAN ne loss threshold cross hone ke seconds ke andar traffic LTE par move kar diya.</p><p><b>Seekh:</b> sirf static route local interface failure detect karta hai; SD-WAN probes path failure detect karte hain.</p></div>
<div class="iv"><p class="q">"Floating static route kya hai aur uski kamzori kya hai?"</p><p>Kharab administrative distance ya preference wala static route jo primary route hatne tak chhupa rehta hai. Kamzori: primary tabhi hatta hai jab local interface ya tracked object fail ho, isliye remote failures detect karne ke liye tracking ya SD-WAN SLA monitoring jodte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static routes prefix plus next hop hain, sahi transport VR ke andar.</li>
<li>Internet aur LTE 0.0.0.0/0 default use karte hain; course MPLS VR PE ke through 172.31.0.0/16 use karta hai.</li>
<li>Next hop connected subnet ke andar hona chahiye.</li>
<li>Floating static matlab zyada distance; SD-WAN mein backup ka faisla transport priority aur SLA karte hain.</li>
<li>Verify order: interface, route, underlay ping, tunnels.</li>
</ul></div>
`}};export{e as default};