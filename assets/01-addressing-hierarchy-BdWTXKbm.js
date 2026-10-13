var e=(e,t,n,r)=>`<text x="`+(e+24)+`" y="`+(t-1)+`" class="svg-ink" font-size="12">`+n+`</text>`+(r?`<text x="`+(e+24)+`" y="`+(t+13)+`" class="svg-muted" font-size="11">`+r+`</text>`:``),t=(e,t,n,r,i)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`,n=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="16" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+t+`H`+(e+9)+`M`+e+` `+(t-9)+`V`+(t+9)+`M`+(e-5)+` `+(t-5)+`L`+(e-9)+` `+t+`L`+(e-5)+` `+(t+5)+`M`+(e+5)+` `+(t-5)+`L`+(e+9)+` `+t+`L`+(e+5)+` `+(t+5)+`" fill="none" stroke="#334155" stroke-width="1.5"/>`,r=(e,t,n)=>`<g fill="`+n+`" stroke="none"><ellipse cx="`+e+`" cy="`+(t+4)+`" rx="28" ry="13"/><circle cx="`+(e-10)+`" cy="`+(t-4)+`" r="12"/><circle cx="`+(e+8)+`" cy="`+(t-7)+`" r="15"/></g>`,i=(e,t,n)=>`<rect x="`+(e-16)+`" y="`+(t-18)+`" width="32" height="36" rx="3" fill="`+n+`" stroke="#475569" stroke-width="1.5"/><path d="M`+(e-9)+` `+(t-10)+`h5v5h-5zM`+(e+4)+` `+(t-10)+`h5v5h-5zM`+(e-9)+` `+(t+1)+`h5v5h-5zM`+(e+4)+` `+(t+1)+`h5v5h-5z" fill="#ffffff" stroke="none"/>`,a=(e,t,n,r)=>`<rect x="`+e+`" y="`+(t-9)+`" width="12" height="12" rx="2" fill="`+n+`" stroke="#475569"/><text x="`+(e+17)+`" y="`+(t+1)+`" class="svg-muted" font-size="11">`+r+`</text>`,o=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="`+t+`">`+n+`</svg><p class="cap">`+r+`</p></div>`,s=s=>{let c=(t,r,i,a,o)=>n(t,r,`#ddd6fe`)+e(t,r-6,i,a)+`<text x="`+(t+24)+`" y="`+(r+21)+`" class="svg-muted" font-size="11">`+o+`</text>`,l=r(60,40,`#e2e8f0`)+e(60,40,s[0],``)+t(86,44,306,96)+t(320,116,60,174)+t(320,116,250,174)+t(320,116,450,174)+n(320,100,`#bae6fd`)+e(320,100,s[1],`10.0.0.0/8`)+c(60,190,s[2],`10.4.0.0/14`,`2001:db8:100::/40`)+c(250,190,s[3],`10.8.0.0/14`,`2001:db8:200::/40`)+c(450,190,s[4],`10.12.0.0/14`,`2001:db8:300::/40`)+t(60,206,60,252)+t(250,206,250,252)+t(450,206,450,252)+i(60,270,`#bbf7d0`)+e(60,270,s[5],`10.4.80.0/20`)+i(250,270,`#bbf7d0`)+e(250,270,s[5],`10.8.80.0/20`)+i(450,270,`#bbf7d0`)+e(450,270,s[5],`10.12.80.0/20`)+a(10,322,`#bae6fd`,s[6])+a(170,322,`#ddd6fe`,s[7])+a(340,322,`#bbf7d0`,s[8])+a(500,322,`#e2e8f0`,s[9]);return o(340,s[10],l,s[11])},c={id:`addressing-hierarchy`,h:{en:`Addressing hierarchy, summarisation and IPv6 migration`,hi:`Addressing hierarchy, summarisation aur IPv6 migration`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to design the routing layer of an enterprise network the way the CCNP ENSLD 300-420 exam expects: start from the business requirements, list the constraints, compare the candidate options, and justify one design. This module covers structured IPv4 and IPv6 addressing, OSPF, EIGRP, IS-IS and BGP design, redistribution and filtering, fast convergence, and IPv6 migration options. Each chapter begins with a customer case. <b>Prerequisites:</b> ENCOR-level knowledge of subnetting, OSPF, EIGRP and BGP basics. We do not re-teach configuration from zero; we ask <i>why this design and not another</i>.</p>

<h3>Customer case: Harbourline Logistics</h3>
<p>Harbourline Logistics has 6,500 staff, three campuses (Northbridge, Eastport, Westfield), 42 branch depots and two data centers. Last year it bought a smaller company, Tidewater Freight, which also uses 10.0.0.0/8. Harbourline won a government contract that requires IPv6 within 18 months. The network team has one more problem: branch routers have limited memory and no budget for replacement this year.</p>
<p><b>Requirements:</b> every region must be summarised so that the WAN routing table stays small; there must be room for 5 years of growth; IPv6 must follow the same logic as IPv4; Tidewater must be merged without a long outage. <b>Constraints:</b> branch router memory, 18-month IPv6 deadline, overlapping address space, a small team.</p>

<h3>Why hierarchy comes first</h3>
<p>Routing protocols cannot summarise what the address plan did not group. A <b>hierarchical addressing plan</b> gives each region one contiguous block, each site a sub-block of it, and each VLAN a subnet of that. The region router then advertises <b>one summary route</b> instead of hundreds of subnets. This gives three design benefits the exam tests: <b>scalability</b> (smaller tables, smaller link-state databases), <b>stability</b> (a flapping subnet inside a site is hidden behind the summary, so the failure domain shrinks and the <b>blast radius</b> of a change is small) and <b>faster convergence</b> (fewer routes to recompute).</p>

@@DIA@@

<h3>Candidate options</h3>
<table class="cmp"><tr><th>Option</th><th>How it works</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>A. Allocate on request</b></td><td>Next free subnet to whoever asks</td><td>Zero planning effort</td><td>No summarisation; table grows with every site</td></tr>
<tr><td><b>B. Geographic hierarchy</b></td><td>Region block, then site block, then function subnet</td><td>Summaries at region and site boundaries</td><td>Needs up-front planning and reserved growth space</td></tr>
<tr><td><b>C. Function-based blocks</b></td><td>One block for all voice, one for all Wi-Fi, one for all servers</td><td>Easy to write ACLs and QoS policy</td><td>A site is spread over many blocks; summarisation by location is impossible</td></tr>
</table>
<p><b>Decision: option B</b>, with a small amount of function logic <i>inside</i> each site block (the third octet, or the /24 index, identifies data, voice, Wi-Fi, guest, management). Policy by function is then done with ACLs on a regular pattern, while routing follows geography.</p>

<h3>The chosen IPv4 plan</h3>
<div class="eg"><p><b>Worked example.</b> From 10.0.0.0/8: infrastructure 10.0.0.0/14 (loopbacks as /32 from 10.0.0.0/20, point-to-point links as /31 from 10.0.16.0/20), Region North 10.4.0.0/14, Region East 10.8.0.0/14, Region West 10.12.0.0/14, data centers 10.16.0.0/14 and renumbered Tidewater 10.20.0.0/14. A /14 split into /20 sites gives 2^(20-14) = 64 sites per region, and each /20 holds 16 subnets of /24. Harbourline needs 14 depots per region today, so the plan keeps more than 4 times spare capacity. Every boundary falls on a bit boundary, so each region and each site is one summary.</p></div>
<p>Point-to-point links use <b>/31</b> (RFC 3021), saving half the addresses; loopbacks are <b>/32</b>. Leave unused blocks unallocated and written down: reserve, do not fill.</p>

<h3>The IPv6 plan follows the same logic</h3>
<p>IPv6 removes the shortage, so the goal is a clean hierarchy, not saving addresses. Assume the provider gives Harbourline <code>2001:db8::/32</code> (a documentation prefix, used here as the example). Give each region a <b>/40</b> (256 regions possible), each site a <b>/48</b> (256 sites per region) and each VLAN a <b>/64</b> (65,536 per site). Align on nibble boundaries so summaries are readable: Region North is <code>2001:db8:100::/40</code>, and site 5 in North is <code>2001:db8:105::/48</code>, matching IPv4 site 10.4.80.0/20. Always use <b>/64</b> on host subnets (SLAAC needs it); use <b>/127</b> on point-to-point links (RFC 6164) and <b>/128</b> for loopbacks.</p>
<pre class="code"><span class="c">! Dual-stack core link: /31 and /127</span>
ipv6 unicast-routing
interface TenGigabitEthernet0/0/1
 description P2P to Core1
 ip address 10.0.16.0 255.255.255.254
 ipv6 address 2001:DB8:0:1::/127
<span class="c">! Region router: advertise one IPv4 summary toward the core (OSPF area range)</span>
router ospf 1
 area 10 range 10.4.0.0 255.252.0.0</pre>
<pre class="out">Core1# show ip route 10.4.0.0 255.252.0.0
<span class="hl">O IA  10.4.0.0/14 [110/21] via 10.0.16.2, 00:04:12, TenGigabitEthernet0/0/1</span>
RegionN# show ip route 10.4.0.0 255.252.0.0
<span class="hl">O        10.4.0.0/14 is a summary, 00:04:12, Null0</span></pre>

<h3>IPv6 migration options</h3>
<p>The blueprint groups migration into three families. <b>Native (dual stack):</b> run IPv4 and IPv6 side by side on every device; simplest to operate and the preferred end state, but it doubles routing tables, security policy and monitoring. <b>Overlay (tunnelling):</b> carry IPv6 across an IPv4-only core using manual tunnels, GRE, or ISATAP-style methods; useful for a quick start but adds MTU and troubleshooting overhead. <b>Boundary (translation):</b> NAT64 with DNS64 lets IPv6-only clients reach IPv4-only servers; it suits an IPv6-only edge or data center. Harbourline chooses <b>dual stack</b> in campuses and branches (the hardware supports it), and a short-lived tunnel only for one branch whose provider cannot yet carry IPv6.</p>
<table class="cmp"><tr><th>Method</th><th>Use when</th><th>Main risk</th></tr>
<tr><td>Dual stack</td><td>Devices and carriers support both</td><td>Twice the policy and tables</td></tr>
<tr><td>Tunnelling</td><td>Core or provider is IPv4 only</td><td>MTU, extra hops, hard to debug</td></tr>
<tr><td>NAT64 + DNS64</td><td>IPv6-only clients need IPv4 content</td><td>Breaks apps with embedded IPv4 literals</td></tr>
</table>

<div class="scn"><h4>Post-mortem: the plan that was never written</h4><p>Before this project, Harbourline allocated /24s on request. After eight years the WAN routing table held 1,900 routes. When the Eastport depot link flapped, every branch router re-ran SPF and two small routers ran out of memory and reloaded. Because nothing could be summarised, the failure domain was the whole company. The hierarchical plan reduced each branch's table to about 12 routes (regional summaries plus a default) and the same flap now stays inside Eastport.</p><p><b>Lesson:</b> address planning is a routing design decision. You cannot fix a missing hierarchy later with configuration alone.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Summarising a block that has holes: traffic for the missing part is attracted to the summary and dropped (a black hole). Using /64 not at all on LANs, or /126 where /127 is intended. Planning IPv6 as a separate project with a different structure from IPv4, which doubles the operational effort.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions describe a flat or random plan and ask what limits scalability: the answer is the lack of contiguous, bit-aligned blocks that can be summarised. Summarisation reduces table size, query or SPF scope and the blast radius of a failure. Remember the three migration families: native, overlay, boundary.</p></div>

<div class="iv"><p class="q">"How would you design the addressing for a company with 40 branches that must add IPv6 next year?"</p><p>Strong answer: give each region a contiguous block, each site a sub-block, each VLAN a subnet, aligned on bit boundaries so each level is a single summary; reserve growth; use /31 or /127 on links and /32 or /128 on loopbacks; mirror the same hierarchy in IPv6 with /40 per region, /48 per site, /64 per VLAN; choose dual stack and use tunnels or NAT64 only where a boundary requires it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design addressing before routing: summarisation needs contiguous, bit-aligned blocks.</li>
<li>Hierarchy gives scalability, stability and smaller failure domains.</li>
<li>Use geographic blocks for routing and a regular pattern inside a site for policy.</li>
<li>IPv6 plan: /48 per site, /64 per subnet, /127 on links, aligned on nibbles.</li>
<li>Migration families: native dual stack, overlay tunnels, boundary translation (NAT64).</li>
</ul></div>
`.replace(`@@DIA@@`,s([`Internet, WAN`,`Core`,`Region North`,`Region East`,`Region West`,`Site 5`,`Core`,`Region`,`Site`,`WAN cloud`,`Hierarchical address plan with regions and sites`,`One block per region and per site: the region router advertises a single summary to the core.`])),hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap enterprise network ka routing layer us tarah design karna seekhoge jaisa CCNP ENSLD 300-420 exam expect karta hai: business requirements se shuru karo, constraints likho, candidate options compare karo, aur ek design ko justify karo. Is module mein structured IPv4 aur IPv6 addressing, OSPF, EIGRP, IS-IS aur BGP design, redistribution aur filtering, fast convergence aur IPv6 migration options aate hain. Har chapter ek customer case se shuru hota hai. <b>Prerequisites:</b> subnetting, OSPF, EIGRP aur BGP basics ka ENCOR-level knowledge. Hum configuration zero se nahi sikhate; hum poochte hain ki <i>yeh design kyun, doosra kyun nahi</i>.</p>

<h3>Customer case: Harbourline Logistics</h3>
<p>Harbourline Logistics ke 6,500 staff hain, teen campuses (Northbridge, Eastport, Westfield), 42 branch depots aur do data centers. Pichle saal usne ek chhoti company Tidewater Freight kharidi, jo bhi 10.0.0.0/8 use karti hai. Harbourline ko ek government contract mila hai jisme 18 mahine mein IPv6 chahiye. Network team ki ek aur problem hai: branch routers ki memory kam hai aur is saal replacement ka budget nahi hai.</p>
<p><b>Requirements:</b> har region summarise hona chahiye taaki WAN routing table chhoti rahe; 5 saal ke growth ke liye jagah ho; IPv6 ka logic IPv4 jaisa ho; Tidewater ko bina lambe outage ke merge karna hai. <b>Constraints:</b> branch router memory, 18 mahine ki IPv6 deadline, overlapping address space, chhoti team.</p>

<h3>Hierarchy pehle kyun aati hai</h3>
<p>Routing protocol woh summarise nahi kar sakta jo address plan ne group hi nahi kiya. <b>Hierarchical addressing plan</b> mein har region ko ek contiguous block milta hai, har site ko uska sub-block, aur har VLAN ko uska subnet. Tab region router sau subnets ki jagah <b>ek summary route</b> advertise karta hai. Exam mein yeh teen design benefits poochhe jaate hain: <b>scalability</b> (chhoti tables, chhota link-state database), <b>stability</b> (site ke andar flap hone wala subnet summary ke peeche chhup jata hai, isliye failure domain chhota hota hai aur change ka <b>blast radius</b> kam rehta hai) aur <b>faster convergence</b> (recompute karne ke liye kam routes).</p>

@@DIA@@

<h3>Candidate options</h3>
<table class="cmp"><tr><th>Option</th><th>Kaise kaam karta hai</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>A. Maango to do</b></td><td>Jo bhi maange use next free subnet</td><td>Planning ki zero mehnat</td><td>Summarisation nahi; har site ke saath table badhti hai</td></tr>
<tr><td><b>B. Geographic hierarchy</b></td><td>Region block, phir site block, phir function subnet</td><td>Region aur site boundary par summaries</td><td>Pehle se planning aur reserved growth space chahiye</td></tr>
<tr><td><b>C. Function-based blocks</b></td><td>Saari voice ka ek block, saare Wi-Fi ka ek, saare servers ka ek</td><td>ACL aur QoS policy likhna aasaan</td><td>Ek site kai blocks mein bikhra hota hai; location ke hisaab se summarisation impossible</td></tr>
</table>
<p><b>Decision: option B</b>, aur har site block ke <i>andar</i> thoda function logic (third octet ya /24 index se data, voice, Wi-Fi, guest, management pehchane jaate hain). Is tarah function-wise policy ek regular pattern par ACL se hoti hai, aur routing geography follow karti hai.</p>

<h3>Chosen IPv4 plan</h3>
<div class="eg"><p><b>Worked example.</b> 10.0.0.0/8 se: infrastructure 10.0.0.0/14 (loopbacks /32 ke roop mein 10.0.0.0/20 se, point-to-point links /31 ke roop mein 10.0.16.0/20 se), Region North 10.4.0.0/14, Region East 10.8.0.0/14, Region West 10.12.0.0/14, data centers 10.16.0.0/14 aur renumber hua Tidewater 10.20.0.0/14. /14 ko /20 sites mein todo to 2^(20-14) = 64 sites per region milte hain, aur har /20 mein 16 subnets of /24 aate hain. Harbourline ko aaj har region mein 14 depots chahiye, matlab plan mein 4 guna se zyada spare capacity hai. Har boundary bit boundary par hai, isliye har region aur har site ek summary hai.</p></div>
<p>Point-to-point links par <b>/31</b> (RFC 3021) use hota hai, jisse aadhe addresses bachte hain; loopbacks <b>/32</b> hote hain. Unused blocks ko unallocated rakho aur likhkar rakho: reserve karo, bharo mat.</p>

<h3>IPv6 plan wahi logic follow karta hai</h3>
<p>IPv6 mein addresses ki kami nahi hoti, isliye goal clean hierarchy hai, addresses bachana nahi. Maan lo provider ne Harbourline ko <code>2001:db8::/32</code> diya (yeh documentation prefix example ke liye hai). Har region ko <b>/40</b> do (256 regions possible), har site ko <b>/48</b> (256 sites per region) aur har VLAN ko <b>/64</b> (65,536 per site). Nibble boundary par align karo taaki summaries padhne mein aasaan rahein: Region North <code>2001:db8:100::/40</code> hai, aur North ka site 5 <code>2001:db8:105::/48</code> hai, jo IPv4 site 10.4.80.0/20 se match karta hai. Host subnets par hamesha <b>/64</b> (SLAAC ko yahi chahiye); point-to-point links par <b>/127</b> (RFC 6164) aur loopbacks par <b>/128</b>.</p>
<pre class="code"><span class="c">! Dual-stack core link: /31 and /127</span>
ipv6 unicast-routing
interface TenGigabitEthernet0/0/1
 description P2P to Core1
 ip address 10.0.16.0 255.255.255.254
 ipv6 address 2001:DB8:0:1::/127
<span class="c">! Region router: advertise one IPv4 summary toward the core (OSPF area range)</span>
router ospf 1
 area 10 range 10.4.0.0 255.252.0.0</pre>
<pre class="out">Core1# show ip route 10.4.0.0 255.252.0.0
<span class="hl">O IA  10.4.0.0/14 [110/21] via 10.0.16.2, 00:04:12, TenGigabitEthernet0/0/1</span>
RegionN# show ip route 10.4.0.0 255.252.0.0
<span class="hl">O        10.4.0.0/14 is a summary, 00:04:12, Null0</span></pre>

<h3>IPv6 migration options</h3>
<p>Blueprint migration ko teen families mein baantta hai. <b>Native (dual stack):</b> har device par IPv4 aur IPv6 saath-saath chalao; operate karna sabse aasaan aur preferred end state, lekin routing tables, security policy aur monitoring double ho jaate hain. <b>Overlay (tunnelling):</b> IPv4-only core ke upar manual tunnels, GRE ya ISATAP-style methods se IPv6 le jao; jaldi shuru karne ke liye achha, lekin MTU aur troubleshooting overhead badhta hai. <b>Boundary (translation):</b> NAT64 ke saath DNS64 se IPv6-only clients IPv4-only servers tak pahunchte hain; IPv6-only edge ya data center ke liye suitable. Harbourline campuses aur branches mein <b>dual stack</b> chunta hai (hardware support karta hai), aur sirf ek branch ke liye short-lived tunnel, jiska provider abhi IPv6 carry nahi kar sakta.</p>
<table class="cmp"><tr><th>Method</th><th>Kab use karein</th><th>Main risk</th></tr>
<tr><td>Dual stack</td><td>Devices aur carriers dono support karte hain</td><td>Policy aur tables double</td></tr>
<tr><td>Tunnelling</td><td>Core ya provider sirf IPv4 hai</td><td>MTU, extra hops, debug mushkil</td></tr>
<tr><td>NAT64 + DNS64</td><td>IPv6-only clients ko IPv4 content chahiye</td><td>Embedded IPv4 literals wale apps toot jaate hain</td></tr>
</table>

<div class="scn"><h4>Post-mortem: woh plan jo kabhi likha hi nahi gaya</h4><p>Is project se pehle Harbourline request par /24 allocate karta tha. Aath saal baad WAN routing table mein 1,900 routes the. Eastport depot ka link flap hua to har branch router ne SPF dobara chalaya aur do chhote routers ki memory khatam ho gayi aur woh reload ho gaye. Kuch bhi summarise nahi ho sakta tha, isliye failure domain poori company thi. Hierarchical plan ne har branch ki table ko lagbhag 12 routes (regional summaries aur ek default) tak ghata diya aur ab wahi flap Eastport ke andar hi rehta hai.</p><p><b>Lesson:</b> address planning ek routing design decision hai. Missing hierarchy ko baad mein sirf configuration se theek nahi kar sakte.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Aise block ko summarise karna jisme holes hain: missing hisse ka traffic summary kheench leta hai aur drop ho jata hai (black hole). LAN par /64 na use karna, ya jahan /127 chahiye wahan /126. IPv6 ko alag project ki tarah IPv4 se alag structure ke saath plan karna, jisse operational effort double ho jata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions flat ya random plan describe karte hain aur poochte hain ki scalability kya limit karta hai: jawab hai contiguous, bit-aligned blocks ka na hona jo summarise ho sakein. Summarisation table size, query ya SPF scope aur failure ke blast radius ko kam karta hai. Teen migration families yaad rakho: native, overlay, boundary.</p></div>

<div class="iv"><p class="q">"40 branches wali company ke liye addressing kaise design karoge jise agle saal IPv6 add karna hai?"</p><p>Strong answer: har region ko contiguous block, har site ko sub-block, har VLAN ko subnet do, bit boundaries par align karke taaki har level ek summary bane; growth reserve karo; links par /31 ya /127 aur loopbacks par /32 ya /128 use karo; IPv6 mein wahi hierarchy rakho: /40 per region, /48 per site, /64 per VLAN; dual stack chuno aur tunnels ya NAT64 sirf wahan jahan boundary ki zaroorat ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routing se pehle addressing design karo: summarisation ke liye contiguous, bit-aligned blocks chahiye.</li>
<li>Hierarchy se scalability, stability aur chhote failure domains milte hain.</li>
<li>Routing ke liye geographic blocks, aur site ke andar policy ke liye regular pattern.</li>
<li>IPv6 plan: /48 per site, /64 per subnet, links par /127, nibble par aligned.</li>
<li>Migration families: native dual stack, overlay tunnels, boundary translation (NAT64).</li>
</ul></div>
`.replace(`@@DIA@@`,s([`Internet, WAN`,`Core`,`Region North`,`Region East`,`Region West`,`Site 5`,`Core`,`Region`,`Site`,`WAN cloud`,`Regions aur sites ke saath hierarchical address plan`,`Har region aur har site ka ek block: region router core ko ek hi summary advertise karta hai.`]))}};export{c as default};