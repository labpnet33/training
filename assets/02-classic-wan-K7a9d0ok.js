var e={id:`classic-wan`,h:{en:`The classic WAN: MPLS, branch routers and the hub`,hi:`Classic WAN: MPLS, branch routers aur hub`},body:{en:`
<p>To understand why SD-WAN was invented, you first need a clear picture of the WAN it replaces. This chapter builds that picture from the ground up, with no assumptions beyond "a router forwards packets".</p>

<h3>A branch, a data centre and the gap between them</h3>
<p>A company has a <b>head office or data centre (DC)</b> where its applications run: billing, ERP, email, databases. It also has dozens or thousands of <b>branches</b>: shops, bank branches, factories, clinics. Every user in a branch needs to reach the applications in the DC, and often needs to reach other branches too. The branches are in different cities, so the company cannot lay its own cable. It rents the connection from a <b>service provider</b> (an ISP or telecom carrier). That rented network between sites is the <b>WAN</b>.</p>

<h3>What is MPLS, in plain words</h3>
<p><b>MPLS</b> (Multiprotocol Label Switching) is a private service sold by carriers. Think of it as a private motorway inside the carrier's own road network. Your branch router connects to the carrier's edge router; the carrier carries your traffic across its network separately from the public internet and from other customers, guarantees a certain bandwidth, and can honour traffic priority (QoS) markings. Because it is private and managed, MPLS is predictable and has a service-level agreement (SLA) with a promised availability and latency.</p>
<p>What you get for the money: reliability, a managed service and the carrier's support. What you pay for: a high price per megabit, a long installation time, and a contract that is hard to change.</p>

<h3>Hub-and-spoke through the data centre</h3>
<p>In most classic WANs the topology is <b>hub-and-spoke</b>. The DC is the hub; every branch (a spoke) has one link to the carrier cloud. Branch-to-branch traffic often has to go to the hub first, because the routing is built around the DC. Internet traffic is also usually sent to the DC and out through the central firewall: this is called <b>backhauling</b>, and it exists because the company wants one controlled, secured place where internet access happens.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Classic hub and spoke WAN">
<rect x="250" y="20" width="140" height="50" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Data centre</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">servers + firewall</text>
<ellipse cx="320" cy="120" rx="130" ry="26" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Carrier MPLS cloud</text>
<line x1="320" y1="70" x2="320" y2="94" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="180" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="85" y="205" text-anchor="middle" class="svg-ink" font-size="12">Branch Delhi</text>
<rect x="265" y="180" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">Branch Pune</text>
<rect x="500" y="180" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="555" y="205" text-anchor="middle" class="svg-ink" font-size="12">Branch Chennai</text>
<line x1="85" y1="180" x2="230" y2="138" stroke="#64748b" stroke-width="2"/><line x1="320" y1="180" x2="320" y2="146" stroke="#64748b" stroke-width="2"/><line x1="555" y1="180" x2="410" y2="138" stroke="#64748b" stroke-width="2"/>
<text x="590" y="60" text-anchor="end" class="svg-muted" font-size="12">Internet</text>
<path d="M390 45 L540 45" stroke="#f97316" stroke-width="2" stroke-dasharray="5 3"/>
</svg><p class="cap">Each branch has one MPLS link into the carrier cloud, which leads to the DC. Internet access (dashed, orange) leaves only from the DC.</p></div>

<h3>The branch router and its configuration</h3>
<p>Each branch has a router that connects the local LAN to the MPLS service. It runs a routing protocol (usually BGP with the carrier, and OSPF or EIGRP inside the site) and holds access lists, QoS and sometimes a VPN. Every one of those settings is typed into <b>that router's own command line</b>, or pushed by a script or a management tool. The network is therefore a collection of hundreds of separate devices, each with its own copy of the configuration. That is what people mean by <b>box-by-box</b> or <b>per-router CLI</b> management.</p>
<pre class="code"><span class="c">! A tiny part of a classic branch router (IOS style)</span>
interface GigabitEthernet0/0
 description MPLS-to-carrier
 ip address 203.0.113.2 255.255.255.252
!
router bgp 65010
 neighbor 203.0.113.1 remote-as 64512
 network 10.20.30.0 mask 255.255.255.0
!
ip access-list extended BRANCH-IN
 permit tcp any 10.20.30.0 0.0.0.255 eq 443
 deny ip any any log</pre>
<p>Now multiply those few lines by 300 routers, by different hardware models and by years of small differences, and you can see why the network team spends so much time keeping everything consistent.</p>

<div class="eg"><p><b>Worked example.</b> A bank has 400 branches in hub-and-spoke on MPLS. Each branch has 4 Mbps. Branch staff open a SaaS tool on the public internet. The packet leaves the branch, crosses MPLS to the DC in Mumbai, passes the firewall, goes out to the internet, and the reply travels the same way back. A branch in Guwahati, about 2,000 km from Mumbai, pays a round-trip of roughly 80 ms just to reach a tool whose server is 10 ms away from the branch. Meanwhile the 4 Mbps MPLS link is shared between business transactions and staff browsing, because there is no other path.</p></div>

<h3>What classic WAN does well</h3>
<p>Be fair to the old design. It is simple to understand, the carrier takes responsibility for the path, and MPLS gives stable latency and QoS. Many regulated companies still keep MPLS for critical systems. SD-WAN does not say MPLS is bad; it says MPLS should no longer be the <i>only</i> option.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Treating "WAN" and "internet" as the same thing. The internet is one possible WAN transport, but a company WAN can also run over MPLS, leased lines, metro Ethernet or mobile data. SD-WAN is interesting precisely because it can use all of them together.</p></div>

<div class="scn"><h4>The slow billing screen</h4><p>A pharmacy chain's store in Bhubaneswar complained that the cloud billing portal was "slow every afternoon". The NOC found the store's 4 Mbps MPLS saturated by software updates that every store downloaded through the DC firewall at the same time, so billing traffic queued behind them. There was no second path, and QoS rules had to be updated on 250 stores by hand. The quick fix was a QoS change that took two weeks to roll out across the estate.</p><p><b>Lesson:</b> with one transport and per-router configuration, even a simple priority change is slow, and the whole branch suffers when the single link is busy.</p></div>

<div class="iv"><p class="q">"Describe a traditional enterprise WAN and its main limitations."</p><p>Strong answer: branches connect over private MPLS circuits to a hub (the DC), routing protocols distribute reachability, internet traffic is backhauled to a central breakout, and each router is configured individually. Limitations: high bandwidth cost, long provisioning times, a single transport per site, inefficient paths for cloud and branch-to-branch traffic, and operational overhead and inconsistency from box-by-box configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The WAN is the carrier-provided network between a company's sites; MPLS is a private, managed, SLA-backed service.</li>
<li>Classic designs are hub-and-spoke, with branch-to-branch and internet traffic often passing the DC.</li>
<li>Each branch router is configured individually through its own CLI (box-by-box).</li>
<li>MPLS is reliable and predictable but expensive, slow to order and hard to change.</li>
<li>SD-WAN does not remove MPLS; it stops depending on it as the only path.</li>
</ul></div>
`,hi:`
<p>SD-WAN kyun invent hua yeh samajhne ke liye pehle us WAN ki saaf tasveer chahiye jise woh replace karta hai. Yeh chapter woh tasveer zero se banata hai, bina kisi assumption ke, siway iske ki "router packets forward karta hai".</p>

<h3>Ek branch, ek data centre aur dono ke beech ka gap</h3>
<p>Ek company ka <b>head office ya data centre (DC)</b> hota hai jahan uski applications chalti hain: billing, ERP, email, databases. Uske paas darjanon ya hazaaron <b>branches</b> bhi hoti hain: dukaanein, bank branches, factories, clinics. Branch ke har user ko DC ki applications tak pahunchna hota hai, aur aksar doosri branches tak bhi. Branches alag alag shehron mein hain, isliye company apni cable nahi bichha sakti. Woh connection <b>service provider</b> (ISP ya telecom carrier) se kiraye par leti hai. Sites ke beech yeh kiraye ka network hi <b>WAN</b> hai.</p>

<h3>MPLS kya hai, saaf shabdon mein</h3>
<p><b>MPLS</b> (Multiprotocol Label Switching) carriers ki bechi jaane wali ek private service hai. Ise carrier ke apne road network ke andar ek private motorway samjho. Aapka branch router carrier ke edge router se judta hai; carrier aapka traffic apne network mein public internet aur doosre customers se alag le jaata hai, ek tay bandwidth guarantee karta hai, aur traffic priority (QoS) markings ka dhyaan rakh sakta hai. Private aur managed hone ki wajah se MPLS predictable hai aur uska ek service-level agreement (SLA) hota hai jisme availability aur latency ka wada hota hai.</p>
<p>Paise ke badle aapko milta hai: reliability, managed service aur carrier ka support. Aap kiske liye paise dete ho: har megabit ka high price, lamba installation time, aur ek contract jise badalna mushkil hai.</p>

<h3>Data centre ke through hub-and-spoke</h3>
<p>Zyada tar classic WANs mein topology <b>hub-and-spoke</b> hoti hai. DC hub hai; har branch (spoke) ka carrier cloud tak ek link hota hai. Branch-to-branch traffic ko aksar pehle hub jaana padta hai, kyunki routing DC ke around bani hai. Internet traffic bhi aam taur par DC ko bheja jaata hai aur central firewall se bahar nikalta hai: ise <b>backhauling</b> kehte hain, aur yeh isliye hota hai kyunki company chahti hai ki internet access ek controlled, secured jagah par ho.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Classic hub and spoke WAN">
<rect x="250" y="20" width="140" height="50" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Data centre</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">servers + firewall</text>
<ellipse cx="320" cy="120" rx="130" ry="26" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Carrier MPLS cloud</text>
<line x1="320" y1="70" x2="320" y2="94" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="180" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="85" y="205" text-anchor="middle" class="svg-ink" font-size="12">Branch Delhi</text>
<rect x="265" y="180" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">Branch Pune</text>
<rect x="500" y="180" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="555" y="205" text-anchor="middle" class="svg-ink" font-size="12">Branch Chennai</text>
<line x1="85" y1="180" x2="230" y2="138" stroke="#64748b" stroke-width="2"/><line x1="320" y1="180" x2="320" y2="146" stroke="#64748b" stroke-width="2"/><line x1="555" y1="180" x2="410" y2="138" stroke="#64748b" stroke-width="2"/>
<text x="590" y="60" text-anchor="end" class="svg-muted" font-size="12">Internet</text>
<path d="M390 45 L540 45" stroke="#f97316" stroke-width="2" stroke-dasharray="5 3"/>
</svg><p class="cap">Har branch ka carrier cloud mein ek MPLS link hai, jo DC tak jaata hai. Internet access (dashed, orange) sirf DC se nikalta hai.</p></div>

<h3>Branch router aur uski configuration</h3>
<p>Har branch mein ek router hota hai jo local LAN ko MPLS service se jodta hai. Woh ek routing protocol chalata hai (aam taur par carrier ke saath BGP, aur site ke andar OSPF ya EIGRP) aur access lists, QoS aur kabhi kabhi VPN rakhta hai. In mein se har setting <b>us router ki apni command line</b> mein type hoti hai, ya script ya management tool se push hoti hai. Isliye network saikdon alag alag devices ka collection hai, har ek ki configuration ki apni copy ke saath. Log isi ko <b>box-by-box</b> ya <b>per-router CLI</b> management kehte hain.</p>
<pre class="code"><span class="c">! A tiny part of a classic branch router (IOS style)</span>
interface GigabitEthernet0/0
 description MPLS-to-carrier
 ip address 203.0.113.2 255.255.255.252
!
router bgp 65010
 neighbor 203.0.113.1 remote-as 64512
 network 10.20.30.0 mask 255.255.255.0
!
ip access-list extended BRANCH-IN
 permit tcp any 10.20.30.0 0.0.0.255 eq 443
 deny ip any any log</pre>
<p>Ab in kuch lines ko 300 routers se, alag alag hardware models se aur saalon ke chhote chhote farak se multiply karo, aur aap dekh sakte ho ki network team sab kuch consistent rakhne mein itna time kyun lagati hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek bank ki 400 branches MPLS par hub-and-spoke mein hain. Har branch ke paas 4 Mbps hai. Branch staff public internet par ek SaaS tool kholta hai. Packet branch se nikalta hai, MPLS se Mumbai ke DC jaata hai, firewall se guzarta hai, internet par nikalta hai, aur reply usi raaste se wapas aata hai. Guwahati ki branch, jo Mumbai se lagbhag 2,000 km door hai, ek aise tool tak pahunchne ke liye lagbhag 80 ms round-trip bharti hai jiska server branch se sirf 10 ms door hai. Isi beech 4 Mbps MPLS link business transactions aur staff browsing ke beech share hota hai, kyunki koi doosra path hai hi nahi.</p></div>

<h3>Classic WAN kya achha karta hai</h3>
<p>Purane design ke saath insaaf karo. Yeh samajhna aasan hai, carrier path ki zimmedari leta hai, aur MPLS stable latency aur QoS deta hai. Kai regulated companies abhi bhi critical systems ke liye MPLS rakhti hain. SD-WAN yeh nahi kehta ki MPLS bura hai; woh kehta hai ki MPLS ab <i>akela</i> option nahi hona chahiye.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> "WAN" aur "internet" ko ek hi samajhna. Internet ek possible WAN transport hai, lekin company WAN MPLS, leased lines, metro Ethernet ya mobile data par bhi chal sakta hai. SD-WAN isiliye interesting hai kyunki woh un sab ko ek saath use kar sakta hai.</p></div>

<div class="scn"><h4>Dheemi billing screen</h4><p>Ek pharmacy chain ke Bhubaneswar store ne shikayat ki ki cloud billing portal "har dopahar slow" hota hai. NOC ko pata chala ki store ka 4 Mbps MPLS un software updates se bhar jaata tha jo har store DC firewall se ek hi samay par download karta tha, isliye billing traffic unke peeche queue mein fas jaata tha. Doosra path tha nahi, aur 250 stores par QoS rules haath se update karne the. Quick fix ek QoS change tha jise poore estate mein roll out karne mein do hafte lage.</p><p><b>Seekh:</b> ek transport aur per-router configuration ke saath ek simple priority change bhi slow hota hai, aur single link busy hone par poori branch bhugatti hai.</p></div>

<div class="iv"><p class="q">"Traditional enterprise WAN aur uski main limitations describe kijiye."</p><p>Strong answer: branches private MPLS circuits se hub (DC) se judti hain, routing protocols reachability distribute karte hain, internet traffic ek central breakout par backhaul hota hai, aur har router individually configure hota hai. Limitations: high bandwidth cost, lamba provisioning time, har site par ek hi transport, cloud aur branch-to-branch traffic ke liye inefficient paths, aur box-by-box configuration se operational overhead aur inconsistency.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WAN company ki sites ke beech carrier ka diya network hai; MPLS ek private, managed, SLA-backed service hai.</li>
<li>Classic designs hub-and-spoke hote hain, jahan branch-to-branch aur internet traffic aksar DC se guzarta hai.</li>
<li>Har branch router apni CLI se individually configure hota hai (box-by-box).</li>
<li>MPLS reliable aur predictable hai par mehenga, order mein slow aur badalne mein mushkil.</li>
<li>SD-WAN MPLS ko hatata nahi; woh use akela path maanna band karta hai.</li>
</ul></div>
`}};export{e as default};