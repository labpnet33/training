var e=(e,t,n,r)=>`<text x="`+e+`" y="`+t+`" text-anchor="middle" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,t=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,n=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="16" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+t+`H`+(e+9)+`M`+e+` `+(t-9)+`V`+(t+9)+`M`+(e-5)+` `+(t-5)+`L`+(e-9)+` `+t+`L`+(e-5)+` `+(t+5)+`M`+(e+5)+` `+(t-5)+`L`+(e+9)+` `+t+`L`+(e+5)+` `+(t+5)+`" fill="none" stroke="#334155" stroke-width="1.5"/>`,r=(e,t,n)=>`<g fill="`+n+`" stroke="none"><ellipse cx="`+e+`" cy="`+(t+4)+`" rx="28" ry="13"/><circle cx="`+(e-10)+`" cy="`+(t-4)+`" r="12"/><circle cx="`+(e+8)+`" cy="`+(t-7)+`" r="15"/></g>`,i=(e,t,n)=>`<rect x="`+(e-16)+`" y="`+(t-18)+`" width="32" height="36" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+(t-10)+`h5v5h-5zM`+(e+4)+` `+(t-10)+`h5v5h-5zM`+(e-9)+` `+(t+1)+`h5v5h-5zM`+(e+4)+` `+(t+1)+`h5v5h-5z" fill="#ffffff" stroke="none"/>`,a=(e,t,n,r)=>`<rect x="`+e+`" y="`+(t-9)+`" width="12" height="12" rx="2" fill="`+n+`" stroke="#475569"/><text x="`+(e+17)+`" y="`+(t+1)+`" class="svg-muted" font-size="11">`+r+`</text>`,o=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="`+t+`">`+n+`</svg><p class="cap">`+r+`</p></div>`,s=s=>{let c=(e,t,n,r)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+r+`" class="svg-ink" font-size="12">`+n+`</text>`,l=t(150,68,150,124)+t(490,68,490,124)+t(150,156,258,200)+t(150,156,358,204)+t(490,156,382,200)+t(490,156,282,204)+t(286,210,354,210,1)+t(270,226,90,272,1)+t(270,226,230,272,1)+t(370,226,410,272,1)+t(370,226,550,272,1)+r(150,46,`#e2e8f0`)+c(150,18,s[0],`middle`)+r(490,46,`#e2e8f0`)+c(490,18,s[1],`middle`)+e(206,100,s[2],`svg-accent`)+e(534,100,s[2],`svg-accent`)+n(150,140,`#ddd6fe`)+c(124,144,s[3],`end`)+n(490,140,`#ddd6fe`)+c(516,144,s[4],`start`)+n(270,210,`#bae6fd`)+c(246,214,s[5],`end`)+n(370,210,`#bae6fd`)+c(394,214,s[6],`start`)+i(90,290,`#bbf7d0`)+i(230,290,`#bbf7d0`)+i(410,290,`#bbf7d0`)+i(550,290,`#bbf7d0`)+e(90,322,s[7],`svg-muted`)+e(230,322,s[7],`svg-muted`)+e(410,322,s[7],`svg-muted`)+e(550,322,s[7],`svg-muted`)+e(320,262,s[8],`svg-accent`)+a(10,346,`#ddd6fe`,s[9])+a(150,346,`#bae6fd`,s[10])+a(300,346,`#bbf7d0`,s[7])+a(420,346,`#e2e8f0`,s[11]);return o(362,s[12],l,s[13])},c={id:`bgp-design`,h:{en:`BGP design: route reflectors, multihoming and policy`,hi:`BGP design: route reflectors, multihoming aur policy`},body:{en:`
<h3>Customer case: Orchid Pharma</h3>
<p>Orchid Pharma (AS 64500, private ASN used here as an example) has 14,000 employees, two data centers, nine regional offices and an e-commerce portal for hospitals. It owns two address blocks, 192.0.2.0/24 and 198.51.100.0/24, and buys internet from two providers: ISP A (AS 64496) and ISP B (AS 64497). The portal brings in revenue every minute; an internet outage costs roughly the equivalent of a day of salary per hour.</p>
<p><b>Requirements:</b> no single point of failure to the internet; prefer ISP A for outbound traffic (lower latency); spread inbound traffic across both providers; never carry other people's traffic; scale internal BGP to 40 routers. <b>Constraints:</b> edge routers have memory for about 300,000 routes, not a full table; small team; ISPs support standard communities.</p>

<h3>Two problems: inside the AS and at the edge</h3>
<p><b>Inside (iBGP).</b> iBGP does not re-advertise a route learned from an iBGP peer to another iBGP peer (split horizon), so a plain design needs a <b>full mesh</b> of n(n-1)/2 sessions. For 11 routers that is 55 sessions; for 40 routers it is 780, which is not operable. The two standard cures are <b>route reflectors</b> (RR) and <b>confederations</b>. An RR reflects routes between its clients and non-clients; loops are prevented with ORIGINATOR_ID and CLUSTER_LIST. Confederations split the AS into sub-ASes that run eBGP between themselves and appear as one AS to the outside; they suit very large networks or mergers.</p>
<p><b>At the edge (eBGP).</b> A multihomed customer chooses how much to take from each provider: <b>default routes only</b> (simplest, least control), <b>partial routes</b> (provider-customer routes plus a default) or the <b>full table</b> (best control, needs memory for a million-plus IPv4 routes).</p>

@@DIA@@

<h3>Trade-off comparison</h3>
<table class="cmp"><tr><th>Design choice</th><th>Scales</th><th>Control</th><th>Cost and risk</th></tr>
<tr><td>iBGP full mesh</td><td>No: sessions grow as n squared</td><td>Full</td><td>Operational pain beyond a few routers</td></tr>
<tr><td>Route reflectors</td><td>Yes: client sessions only to RRs</td><td>Good; RR placement affects best-path choice</td><td>RR is a critical box: deploy in pairs</td></tr>
<tr><td>Confederation</td><td>Yes</td><td>Very flexible</td><td>More complex; migration is hard</td></tr>
<tr><td>Default routes from both ISPs</td><td>Yes</td><td>Low: cannot steer by destination</td><td>Cheapest hardware</td></tr>
<tr><td>Partial routes + default</td><td>Yes</td><td>Medium</td><td>Fits 300,000-route memory</td></tr>
<tr><td>Full table</td><td>Needs big hardware</td><td>Highest</td><td>Cost; more convergence work</td></tr>
</table>

<h3>The chosen design</h3>
<p><b>Inside:</b> two route reflectors, one in each data center, with all other BGP routers as clients of both (same cluster ID on the pair when clients peer with both). Peer from loopbacks, use <code>next-hop-self</code> toward iBGP so the ISP link addresses never need to be in the IGP. <b>Edge:</b> partial routes plus default from both ISPs. <b>Outbound:</b> set a higher <b>local preference</b> (200) on routes learned from ISP A. <b>Inbound:</b> announce 192.0.2.0/24 without change to A and with <b>AS-path prepending</b> to B; do the reverse for 198.51.100.0/24, so traffic splits. <b>Safety:</b> an outbound policy that permits only Orchid's own prefixes, so it can never become a transit AS, a maximum-prefix limit on each session, and BFD for fast failure detection. Use the provider's documented <b>communities</b> for finer control (for example to lower local preference inside the ISP).</p>
<pre class="code">ip prefix-list PFX-A seq 5 permit 192.0.2.0/24
ip prefix-list PFX-B seq 5 permit 198.51.100.0/24
route-map ISPA-IN permit 10
 set local-preference 200
route-map ISPB-OUT permit 10
 match ip address prefix-list PFX-A
 set as-path prepend 64500 64500
route-map ISPB-OUT permit 20
 match ip address prefix-list PFX-B
router bgp 64500
 neighbor 203.0.113.1 remote-as 64496
 neighbor 203.0.113.1 fall-over bfd
 neighbor 203.0.113.1 route-map ISPA-IN in
 neighbor 203.0.113.1 send-community
 neighbor 203.0.113.1 maximum-prefix 300000 80
 neighbor 203.0.113.5 remote-as 64497
 neighbor 203.0.113.5 route-map ISPB-OUT out
<span class="c">! Route reflector</span>
router bgp 64500
 bgp cluster-id 10.0.0.100
 neighbor 10.0.0.31 remote-as 64500
 neighbor 10.0.0.31 update-source Loopback0
 neighbor 10.0.0.31 route-reflector-client</pre>
<pre class="out">EDGE1# show ip bgp 0.0.0.0
BGP routing table entry for 0.0.0.0/0, version 5
Paths: (2 available, best #1, table default)
  64496
    203.0.113.1 from 203.0.113.1 (198.51.100.254)
      Origin IGP, <span class="hl">localpref 200</span>, valid, external, best
  64497
    203.0.113.5 from 203.0.113.5 (198.51.100.253)
      Origin IGP, localpref 100, valid, external</pre>

<div class="eg"><p><b>Worked example.</b> Session count: full mesh of 40 routers needs 40 x 39 / 2 = 780 sessions. With two RRs and 38 clients, each client holds 2 sessions and the RRs also peer with each other: 38 x 2 + 1 = 77 sessions, about ten times fewer. BGP best-path order to remember: highest weight (Cisco), highest local preference, locally originated, shortest AS path, lowest origin, lowest MED, eBGP over iBGP, lowest IGP metric to next hop.</p></div>

<div class="scn"><h4>Post-mortem: the day Orchid became a transit AS</h4><p>The first ISP B configuration had no outbound filter. By default eBGP passes on every best path, including routes learned from ISP A, so Orchid told ISP B "reach ISP A's customers through me". Part of B's customer traffic started to flow across Orchid's 1 Gbps link, saturating it. The portal slowed down for hours until the team added the prefix-list route-map and a maximum-prefix limit, and the ISP cleared the leaked routes.</p><p><b>Lesson:</b> a multihomed enterprise must filter outbound to its own prefixes. Filters in both directions are part of the design, not an extra.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting RRs where their IGP view differs from the clients (the RR picks the best path from its own viewpoint). Using one RR with no backup. Forgetting <code>send-community</code>, so communities never leave the router. Expecting AS-path prepending to guarantee a split; it only influences providers who honour path length.</p></div>
<div class="exam"><p><b>Exam trap.</b> Local preference influences outbound traffic, inside the AS; AS-path prepend and MED influence inbound traffic from other ASes. iBGP full mesh is n(n-1)/2. Route reflector loop prevention uses ORIGINATOR_ID and CLUSTER_LIST. A confederation is invisible outside the AS.</p></div>

<div class="iv"><p class="q">"How do you control inbound and outbound traffic when you have two ISPs?"</p><p>Strong answer: outbound with local preference (and communities if needed), inbound with AS-path prepending, selective announcements of more-specific prefixes and provider communities. Add outbound prefix filters to avoid transit, max-prefix, and BFD. Mention that inbound control depends on how the other networks choose paths.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP needs a full mesh unless you use route reflectors or confederations.</li>
<li>Use RRs in pairs; place them with the IGP topology in mind.</li>
<li>Choose default, partial or full routes by hardware and control needs.</li>
<li>Local preference steers outbound; prepending, MED and communities steer inbound.</li>
<li>Always filter to your own prefixes outbound and limit received prefixes.</li>
</ul></div>
`.replace(`@@DIA@@`,s([`ISP A (AS 64496)`,`ISP B (AS 64497)`,`eBGP`,`EDGE1`,`EDGE2`,`RR1`,`RR2`,`Region`,`iBGP clients`,`Edge`,`Route reflector`,`ISP cloud`,`BGP multihoming with route reflectors`,`Two edge routers peer eBGP with two ISPs; two route reflectors replace the iBGP full mesh toward regional clients.`])),hi:`
<h3>Customer case: Orchid Pharma</h3>
<p>Orchid Pharma (AS 64500, yahan example ke roop mein private ASN) ke 14,000 employees, do data centers, nau regional offices aur hospitals ke liye ek e-commerce portal hai. Uske paas do address blocks hain, 192.0.2.0/24 aur 198.51.100.0/24, aur woh do providers se internet kharidta hai: ISP A (AS 64496) aur ISP B (AS 64497). Portal har minute revenue lata hai; internet outage ka kharcha lagbhag har ghante ek din ki salary ke barabar hai.</p>
<p><b>Requirements:</b> internet tak koi single point of failure nahi; outbound traffic ke liye ISP A prefer karo (kam latency); inbound traffic dono providers mein baanto; kabhi doosron ka traffic carry mat karo; internal BGP ko 40 routers tak scale karo. <b>Constraints:</b> edge routers ki memory lagbhag 300,000 routes ke liye hai, full table ke liye nahi; chhoti team; ISPs standard communities support karte hain.</p>

<h3>Do problems: AS ke andar aur edge par</h3>
<p><b>Andar (iBGP).</b> iBGP ek iBGP peer se seekha route doosre iBGP peer ko re-advertise nahi karta (split horizon), isliye plain design ko n(n-1)/2 sessions ka <b>full mesh</b> chahiye. 11 routers ke liye 55 sessions; 40 routers ke liye 780, jo operate karna mumkin nahi. Do standard ilaaj hain: <b>route reflectors</b> (RR) aur <b>confederations</b>. RR apne clients aur non-clients ke beech routes reflect karta hai; loops ORIGINATOR_ID aur CLUSTER_LIST se roke jaate hain. Confederation AS ko sub-ASes mein todta hai jo aapas mein eBGP chalate hain aur bahar se ek AS dikhte hain; yeh bahut bade networks ya mergers ke liye suitable hai.</p>
<p><b>Edge par (eBGP).</b> Multihomed customer tay karta hai ki har provider se kitna lena hai: <b>sirf default routes</b> (sabse simple, sabse kam control), <b>partial routes</b> (provider-customer routes aur ek default) ya <b>full table</b> (best control, million se zyada IPv4 routes ki memory chahiye).</p>

@@DIA@@

<h3>Trade-off comparison</h3>
<table class="cmp"><tr><th>Design choice</th><th>Scale</th><th>Control</th><th>Cost aur risk</th></tr>
<tr><td>iBGP full mesh</td><td>Nahi: sessions n squared ke hisaab se badhte hain</td><td>Poora</td><td>Kuch routers ke baad operational dard</td></tr>
<tr><td>Route reflectors</td><td>Haan: client sessions sirf RRs se</td><td>Achha; RR placement best-path choice badalta hai</td><td>RR critical box hai: pair mein lagao</td></tr>
<tr><td>Confederation</td><td>Haan</td><td>Bahut flexible</td><td>Zyada complex; migration mushkil</td></tr>
<tr><td>Dono ISPs se default routes</td><td>Haan</td><td>Kam: destination ke hisaab se steer nahi kar sakte</td><td>Sabse sasta hardware</td></tr>
<tr><td>Partial routes + default</td><td>Haan</td><td>Medium</td><td>300,000-route memory mein fit</td></tr>
<tr><td>Full table</td><td>Bada hardware chahiye</td><td>Sabse zyada</td><td>Cost; convergence ka zyada kaam</td></tr>
</table>

<h3>Chosen design</h3>
<p><b>Andar:</b> do route reflectors, har data center mein ek, baaki sab BGP routers dono ke clients (jab clients dono se peer karte hain to pair par same cluster ID). Loopbacks se peer karo, iBGP ki taraf <code>next-hop-self</code> use karo taaki ISP link addresses ko IGP mein kabhi na lana pade. <b>Edge:</b> dono ISPs se partial routes aur default. <b>Outbound:</b> ISP A se seekhe routes par zyada <b>local preference</b> (200) set karo. <b>Inbound:</b> 192.0.2.0/24 ko A ko bina badlav ke aur B ko <b>AS-path prepending</b> ke saath announce karo; 198.51.100.0/24 ke liye ulta karo, taaki traffic baante. <b>Safety:</b> outbound policy jo sirf Orchid ke apne prefixes allow kare, taaki woh kabhi transit AS na bane, har session par maximum-prefix limit, aur fast failure detection ke liye BFD. Finer control ke liye provider ke documented <b>communities</b> use karo (jaise ISP ke andar local preference kam karne ke liye).</p>
<pre class="code">ip prefix-list PFX-A seq 5 permit 192.0.2.0/24
ip prefix-list PFX-B seq 5 permit 198.51.100.0/24
route-map ISPA-IN permit 10
 set local-preference 200
route-map ISPB-OUT permit 10
 match ip address prefix-list PFX-A
 set as-path prepend 64500 64500
route-map ISPB-OUT permit 20
 match ip address prefix-list PFX-B
router bgp 64500
 neighbor 203.0.113.1 remote-as 64496
 neighbor 203.0.113.1 fall-over bfd
 neighbor 203.0.113.1 route-map ISPA-IN in
 neighbor 203.0.113.1 send-community
 neighbor 203.0.113.1 maximum-prefix 300000 80
 neighbor 203.0.113.5 remote-as 64497
 neighbor 203.0.113.5 route-map ISPB-OUT out
<span class="c">! Route reflector</span>
router bgp 64500
 bgp cluster-id 10.0.0.100
 neighbor 10.0.0.31 remote-as 64500
 neighbor 10.0.0.31 update-source Loopback0
 neighbor 10.0.0.31 route-reflector-client</pre>
<pre class="out">EDGE1# show ip bgp 0.0.0.0
BGP routing table entry for 0.0.0.0/0, version 5
Paths: (2 available, best #1, table default)
  64496
    203.0.113.1 from 203.0.113.1 (198.51.100.254)
      Origin IGP, <span class="hl">localpref 200</span>, valid, external, best
  64497
    203.0.113.5 from 203.0.113.5 (198.51.100.253)
      Origin IGP, localpref 100, valid, external</pre>

<div class="eg"><p><b>Worked example.</b> Session count: 40 routers ke full mesh ko 40 x 39 / 2 = 780 sessions chahiye. Do RRs aur 38 clients ke saath har client ke 2 sessions hote hain aur RRs aapas mein bhi peer karte hain: 38 x 2 + 1 = 77 sessions, lagbhag das guna kam. BGP best-path order yaad rakho: highest weight (Cisco), highest local preference, locally originated, shortest AS path, lowest origin, lowest MED, iBGP par eBGP, next hop tak lowest IGP metric.</p></div>

<div class="scn"><h4>Post-mortem: jis din Orchid transit AS ban gaya</h4><p>ISP B ke pehle configuration mein outbound filter nahi tha. Default mein eBGP har best path aage de deta hai, ISP A se seekhe routes bhi, isliye Orchid ne ISP B se keh diya "ISP A ke customers tak mere through pahucho". B ke customers ka kuch traffic Orchid ke 1 Gbps link se bahne laga aur use saturate kar diya. Portal kai ghante slow raha jab tak team ne prefix-list wala route-map aur maximum-prefix limit nahi lagayi aur ISP ne leaked routes saaf nahi kiye.</p><p><b>Lesson:</b> multihomed enterprise ko outbound mein sirf apne prefixes tak filter karna chahiye. Dono directions mein filters design ka hissa hain, extra nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> RRs ko aisi jagah rakhna jahan unka IGP view clients se alag hai (RR best path apne viewpoint se chunta hai). Backup ke bina ek hi RR. <code>send-community</code> bhool jana, jisse communities router se bahar jaati hi nahi. AS-path prepending se split ki guarantee maanna; yeh sirf un providers ko influence karta hai jo path length ka lihaaz karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Local preference AS ke andar outbound traffic ko influence karta hai; AS-path prepend aur MED doosre ASes se aane wale inbound traffic ko. iBGP full mesh n(n-1)/2 hai. Route reflector loop prevention ORIGINATOR_ID aur CLUSTER_LIST use karta hai. Confederation AS ke bahar se dikhti nahi.</p></div>

<div class="iv"><p class="q">"Do ISPs hone par inbound aur outbound traffic kaise control karte ho?"</p><p>Strong answer: outbound local preference se (zaroorat par communities bhi), inbound AS-path prepending, selective more-specific prefix announcements aur provider communities se. Transit se bachne ke liye outbound prefix filters, max-prefix aur BFD jodo. Yeh bhi bolo ki inbound control is par depend karta hai ki doosre networks paths kaise chunte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP ko full mesh chahiye jab tak route reflectors ya confederations na ho.</li>
<li>RRs pair mein use karo; unhe IGP topology ko dhyan mein rakhkar place karo.</li>
<li>Default, partial ya full routes hardware aur control ki zaroorat se chuno.</li>
<li>Local preference outbound steer karta hai; prepending, MED aur communities inbound.</li>
<li>Outbound mein hamesha apne prefixes tak filter karo aur received prefixes limit karo.</li>
</ul></div>
`.replace(`@@DIA@@`,s([`ISP A (AS 64496)`,`ISP B (AS 64497)`,`eBGP`,`EDGE1`,`EDGE2`,`RR1`,`RR2`,`Region`,`iBGP clients`,`Edge`,`Route reflector`,`ISP cloud`,`Route reflectors ke saath BGP multihoming`,`Do edge routers do ISPs se eBGP karte hain; do route reflectors regional clients ke liye iBGP full mesh ki jagah lete hain.`]))}};export{c as default};