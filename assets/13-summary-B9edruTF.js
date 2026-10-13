var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Back at the border post from chapter 1. The officer now knows whom to trust (AD), how to convert currency (seed metrics), which goods may cross (prefix lists, route maps, distribute-lists) and how to stamp passports so nobody sneaks back in (tags). This chapter is your revision sheet: what you must be able to do, the words you must know, the facts the exam loves, and the commands in one place.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Module map">
<rect x="240" y="95" width="160" height="50" rx="10" fill="#fde68a"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="14">boundary router</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">BR1, BR2</text>
<rect x="20" y="20" width="180" height="50" rx="10" fill="#bae6fd"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">1.1 trust: AD</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">distance commands</text>
<rect x="440" y="20" width="180" height="50" rx="10" fill="#bbf7d0"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">1.4 convert: seed</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">redistribute rules</text>
<rect x="20" y="170" width="180" height="50" rx="10" fill="#ddd6fe"/><text x="110" y="192" text-anchor="middle" class="svg-ink" font-size="13">1.2 filter: maps</text><text x="110" y="210" text-anchor="middle" class="svg-muted" font-size="12">prefix lists, route maps</text>
<rect x="440" y="170" width="180" height="50" rx="10" fill="#fed7aa"/><text x="530" y="192" text-anchor="middle" class="svg-ink" font-size="13">1.3 stamp: tags</text><text x="530" y="210" text-anchor="middle" class="svg-muted" font-size="12">split horizon, poisoning</text>
<line x1="200" y1="45" x2="240" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="45" x2="400" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="195" x2="240" y2="140" stroke="#64748b" stroke-width="2"/><line x1="440" y1="195" x2="400" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The four blueprint items meet at every boundary router.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>State the default AD of every source and explain why EIGRP external is 170 and iBGP 200.</li>
<li>Separate metric (inside a protocol), AD (between sources for the same prefix) and longest match (per packet).</li>
<li>Change AD with <code>distance eigrp</code>, <code>distance ospf</code>, <code>distance bgp</code>, per source and per prefix with an ACL; know that OSPF per-source uses originating router IDs.</li>
<li>Write and read prefix lists with ge and le without hesitation, including permit-any and default-only entries.</li>
<li>Explain how standard and extended ACLs match routes and why prefix lists are preferred.</li>
<li>Trace any route through a route map: sequence order, AND/OR, implicit deny, set actions, continue.</li>
<li>Apply distribute-lists in EIGRP and OSPF and predict exactly what neighbours see.</li>
<li>Redistribute between EIGRP, OSPF, BGP, RIP, connected and static with the correct seed metrics and keywords.</li>
<li>Build lab 1 (mutual redistribution with tags) and fix lab 2 (AD and prefix-list tickets) from memory.</li>
<li>Recognise feedback, suboptimal routing, lost metrics and oscillation, and choose the right fix for each.</li>
<li>Explain split horizon, poison reverse, route poisoning and the EIGRP originating router ID check.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Administrative distance</dt><dd>Local trust value (0 to 255) used to choose between sources offering the same prefix; lower wins; never advertised.</dd>
<dt>Seed metric</dt><dd>The starting metric a redistributed route receives in the target protocol.</dd>
<dt>Redistribution</dt><dd>Copying routes installed by one source into another protocol on one router, in one direction.</dd>
<dt>Mutual redistribution</dt><dd>Redistribution in both directions between two domains.</dd>
<dt>Route feedback</dt><dd>A route re-entering the domain it came from through another redistribution point.</dd>
<dt>Route tag</dt><dd>32-bit label on EIGRP external and OSPF external routes, used by route maps to recognise origin.</dd>
<dt>Prefix list</dt><dd>Ordered filter matching network bits and prefix length (ge, le).</dd>
<dt>Route map</dt><dd>Ordered permit/deny entries with match conditions and set actions.</dd>
<dt>Distribute-list</dt><dd>Filter applied to a routing process inbound or outbound, per interface or per redistributed protocol.</dd>
<dt>Split horizon</dt><dd>Never advertise a route out of the interface used to reach it.</dd>
<dt>Route poisoning</dt><dd>Advertising a failed route with an infinite metric so neighbours drop it at once.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>AD</td><td>0 connected, 1 static, 5 EIGRP summary, 20 eBGP, 90 EIGRP, 110 OSPF, 115 IS-IS, 120 RIP, 170 EIGRP external, 200 iBGP, 255 unusable</td></tr>
<tr><td>Into OSPF</td><td>E2, metric 20 (1 from BGP); <code>subnets</code> needed on old IOS</td></tr>
<tr><td>Into EIGRP</td><td>Seed metric required from other routing protocols; five values BW DLY REL LOAD MTU</td></tr>
<tr><td>Into BGP</td><td>MED = IGP metric; OSPF internal routes only by default</td></tr>
<tr><td>Out of BGP</td><td>eBGP routes only unless <code>bgp redistribute-internal</code></td></tr>
<tr><td>Prefix list</td><td>LEN &lt; ge &le; le &le; 32; implicit deny; <code>0.0.0.0/0 le 32</code> = any</td></tr>
<tr><td>Route map</td><td>Different match types AND, values OR, no match = all, implicit deny at end</td></tr>
<tr><td>OSPF distribute-list in</td><td>Filters local RIB only; LSAs still flood</td></tr>
<tr><td>Multi-point</td><td>Tags stop feedback; AD fixes suboptimal paths; apply to every boundary router</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">router eigrp 100
 redistribute ospf 1 metric 100000 100 255 1 1500 route-map OSPF-TO-EIGRP
 distance eigrp 90 170
 distribute-list prefix NAME {in | out} [interface]
router ospf 1
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
 distance ospf intra-area 110 inter-area 110 external 171
 distance 171 2.2.2.2 0.0.0.0 50
 default-information originate
ip prefix-list OSPF-LANS seq 10 permit 10.200.0.0/16 le 24
route-map OSPF-TO-EIGRP deny 10
 match tag 90
route-map OSPF-TO-EIGRP permit 20
 match ip address prefix-list OSPF-LANS
 set tag 110</pre>
<pre class="out">show ip route PREFIX                      <span class="hl">! Known via, distance, Tag, Advertised by</span>
show ip protocols                         <span class="hl">! Redistributing, filters, Distance</span>
show ip eigrp topology PREFIX             <span class="hl">! External data: protocol, originator, tag</span>
show ip ospf database external PREFIX     <span class="hl">! Advertising Router, Metric Type, Tag</span>
show route-map NAME
show ip prefix-list detail NAME           <span class="hl">! hit counts</span>
debug ip routing                          <span class="hl">! RIB add/delete, AD fights</span></pre>

<div class="eg"><p><b>Worked example: a 60-second exam drill.</b> Output: BR2 shows 10.99.1.0/24 as "Known via ospf 1, distance 110, Tag 90". Reasoning: tag 90 means born in EIGRP; OSPF won on AD; if BR2's OSPF-TO-EIGRP map lacks <code>deny tag 90</code>, feedback follows; if the EIGRP original was external, BR2 is taking a suboptimal path. Two checks, <code>show route-map</code> and <code>show ip eigrp topology 10.99.1.0/24</code>, confirm which.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the rules. The exam rarely asks "type the command"; it shows output with one wrong value. Know why each default exists and you will spot the wrong line quickly.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch for answers that fix only one boundary router, lower EIGRP external AD without considering OSPF internals, or use an OSPF distribute-list to "stop advertisement". Each is a classic wrong option.</p></div>

<div class="scn"><h4>Handover checklist after the merger</h4><p>When the Delhi and Bengaluru networks from our labs went into production, the senior engineer left a five-line handover note: seed metric 100000 100 255 1 1500 on both boundary routers; tags 90 (EIGRP-born) and 110 (OSPF-born) with deny entries; <code>distance ospf external 171</code> on both; OSPF-LANS prefix list covers 10.200.0.0/16 up to /24; any new boundary router must copy all four. Six months later a third boundary router was added in a day without incident.</p><p><b>Lesson:</b> a redistribution design is a policy; write it down and apply it identically everywhere.</p></div>

<div class="iv"><p class="q">"Design mutual redistribution between an EIGRP and an OSPF domain with two boundary routers. What goes into your checklist?"</p><p>Strong answer: seed metrics that are worse than internal paths; <code>subnets</code> into OSPF; prefix lists limiting what each side exports; tags on exit and tag denies on entry; AD adjustment such as <code>distance ospf external 171</code>, or inbound tag filters, so EIGRP externals are not replaced by their OSPF copies; identical policy on both routers; and a verification plan with <code>show ip route</code>, topology and LSDB checks, traceroutes from both domains, and a failure test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four jobs at every boundary: trust (AD), convert (seed), filter (maps and lists), stamp (tags).</li>
<li>Know the defaults: AD table, OSPF 20 E2, EIGRP needs a seed, BGP MED and eBGP-only rules.</li>
<li>Prefix lists and route maps are logic puzzles: practise until matching is automatic.</li>
<li>Two or more redistribution points need tags and AD planning on every boundary router.</li>
<li>Troubleshoot by following the prefix from birth to where it is missing.</li>
</ul></div>
`,hi:`
<p>Wapas chapter 1 ke border post par. Officer ko ab pata hai kiska bharosa karna hai (AD), currency kaise convert karni hai (seed metrics), kaunsa saaman cross kar sakta hai (prefix lists, route maps, distribute-lists) aur passports par stamp kaise lagana hai taaki koi chupke se wapas na ghuse (tags). Yeh chapter aapki revision sheet hai: aapko kya kar paana chahiye, kaunse shabd aane chahiye, exam ko kaunse facts pasand hain, aur commands ek jagah.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Module map">
<rect x="240" y="95" width="160" height="50" rx="10" fill="#fde68a"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="14">boundary router</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">BR1, BR2</text>
<rect x="20" y="20" width="180" height="50" rx="10" fill="#bae6fd"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">1.1 bharosa: AD</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">distance commands</text>
<rect x="440" y="20" width="180" height="50" rx="10" fill="#bbf7d0"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">1.4 convert: seed</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">redistribute rules</text>
<rect x="20" y="170" width="180" height="50" rx="10" fill="#ddd6fe"/><text x="110" y="192" text-anchor="middle" class="svg-ink" font-size="13">1.2 filter: maps</text><text x="110" y="210" text-anchor="middle" class="svg-muted" font-size="12">prefix lists, route maps</text>
<rect x="440" y="170" width="180" height="50" rx="10" fill="#fed7aa"/><text x="530" y="192" text-anchor="middle" class="svg-ink" font-size="13">1.3 stamp: tags</text><text x="530" y="210" text-anchor="middle" class="svg-muted" font-size="12">split horizon, poisoning</text>
<line x1="200" y1="45" x2="240" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="45" x2="400" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="200" y1="195" x2="240" y2="140" stroke="#64748b" stroke-width="2"/><line x1="440" y1="195" x2="400" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chaaron blueprint items har boundary router par milte hain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Har source ka default AD bata sako aur samjha sako ki EIGRP external 170 aur iBGP 200 kyun hai.</li>
<li>Metric (protocol ke andar), AD (same prefix ke liye sources ke beech) aur longest match (har packet par) ko alag kar sako.</li>
<li><code>distance eigrp</code>, <code>distance ospf</code>, <code>distance bgp</code> se, per source aur ACL ke saath per prefix AD badal sako; jaano ki OSPF per-source originating router IDs use karta hai.</li>
<li>ge aur le wali prefix lists bina hichkichahat likh aur padh sako, permit-any aur default-only entries samet.</li>
<li>Samjha sako ki standard aur extended ACLs routes kaise match karti hain aur prefix lists kyun preferred hain.</li>
<li>Kisi bhi route ko route map ke through trace kar sako: sequence order, AND/OR, implicit deny, set actions, continue.</li>
<li>EIGRP aur OSPF mein distribute-lists laga sako aur exact predict kar sako ki neighbours kya dekhte hain.</li>
<li>EIGRP, OSPF, BGP, RIP, connected aur static ke beech sahi seed metrics aur keywords ke saath redistribute kar sako.</li>
<li>Lab 1 (tags ke saath mutual redistribution) bana sako aur lab 2 (AD aur prefix-list tickets) yaaddasht se theek kar sako.</li>
<li>Feedback, suboptimal routing, khoye metrics aur oscillation pehchan sako, aur har ek ka sahi fix chun sako.</li>
<li>Split horizon, poison reverse, route poisoning aur EIGRP originating router ID check samjha sako.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Administrative distance</dt><dd>Local trust value (0 se 255) jo same prefix dene wale sources ke beech chunne ke liye use hoti hai; kam jeetta hai; kabhi advertise nahi hoti.</dd>
<dt>Seed metric</dt><dd>Woh shuruaati metric jo redistributed route ko target protocol mein milta hai.</dd>
<dt>Redistribution</dt><dd>Ek source dwara installed routes ko ek router par, ek direction mein, doosre protocol mein copy karna.</dd>
<dt>Mutual redistribution</dt><dd>Do domains ke beech dono directions mein redistribution.</dd>
<dt>Route feedback</dt><dd>Route ka kisi doosre redistribution point ke through usi domain mein wapas ghusna jahan se woh aaya tha.</dd>
<dt>Route tag</dt><dd>EIGRP external aur OSPF external routes par 32-bit label, jise route maps origin pehchanne ke liye use karte hain.</dd>
<dt>Prefix list</dt><dd>Ordered filter jo network bits aur prefix length (ge, le) match karta hai.</dd>
<dt>Route map</dt><dd>Match conditions aur set actions wali ordered permit/deny entries.</dd>
<dt>Distribute-list</dt><dd>Routing process par inbound ya outbound laga filter, har interface ya har redistributed protocol ke liye.</dd>
<dt>Split horizon</dt><dd>Route ko kabhi us interface se advertise mat karo jisse us tak pahuncha jaata hai.</dd>
<dt>Route poisoning</dt><dd>Fail hue route ko infinite metric ke saath advertise karna taaki neighbours use turant drop karein.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>AD</td><td>0 connected, 1 static, 5 EIGRP summary, 20 eBGP, 90 EIGRP, 110 OSPF, 115 IS-IS, 120 RIP, 170 EIGRP external, 200 iBGP, 255 unusable</td></tr>
<tr><td>OSPF mein</td><td>E2, metric 20 (BGP se 1); purane IOS par <code>subnets</code> zaroori</td></tr>
<tr><td>EIGRP mein</td><td>Doosre routing protocols se seed metric zaroori; paanch values BW DLY REL LOAD MTU</td></tr>
<tr><td>BGP mein</td><td>MED = IGP metric; default mein sirf OSPF internal routes</td></tr>
<tr><td>BGP se bahar</td><td>Sirf eBGP routes jab tak <code>bgp redistribute-internal</code> na ho</td></tr>
<tr><td>Prefix list</td><td>LEN &lt; ge &le; le &le; 32; implicit deny; <code>0.0.0.0/0 le 32</code> = any</td></tr>
<tr><td>Route map</td><td>Alag match types AND, values OR, no match = sab, end mein implicit deny</td></tr>
<tr><td>OSPF distribute-list in</td><td>Sirf local RIB filter karta hai; LSAs flood hote rehte hain</td></tr>
<tr><td>Multi-point</td><td>Tags feedback rokte hain; AD suboptimal paths theek karta hai; har boundary router par lagao</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">router eigrp 100
 redistribute ospf 1 metric 100000 100 255 1 1500 route-map OSPF-TO-EIGRP
 distance eigrp 90 170
 distribute-list prefix NAME {in | out} [interface]
router ospf 1
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
 distance ospf intra-area 110 inter-area 110 external 171
 distance 171 2.2.2.2 0.0.0.0 50
 default-information originate
ip prefix-list OSPF-LANS seq 10 permit 10.200.0.0/16 le 24
route-map OSPF-TO-EIGRP deny 10
 match tag 90
route-map OSPF-TO-EIGRP permit 20
 match ip address prefix-list OSPF-LANS
 set tag 110</pre>
<pre class="out">show ip route PREFIX                      <span class="hl">! Known via, distance, Tag, Advertised by</span>
show ip protocols                         <span class="hl">! Redistributing, filters, Distance</span>
show ip eigrp topology PREFIX             <span class="hl">! External data: protocol, originator, tag</span>
show ip ospf database external PREFIX     <span class="hl">! Advertising Router, Metric Type, Tag</span>
show route-map NAME
show ip prefix-list detail NAME           <span class="hl">! hit counts</span>
debug ip routing                          <span class="hl">! RIB add/delete, AD ki ladaiyan</span></pre>

<div class="eg"><p><b>Worked example: 60 second ki exam drill.</b> Output: BR2 10.99.1.0/24 ko "Known via ospf 1, distance 110, Tag 90" dikhata hai. Reasoning: tag 90 ka matlab EIGRP mein paida; OSPF AD par jeeta; agar BR2 ke OSPF-TO-EIGRP map mein <code>deny tag 90</code> nahi hai, to feedback hoga; agar EIGRP original external tha, to BR2 suboptimal path le raha hai. Do checks, <code>show route-map</code> aur <code>show ip eigrp topology 10.99.1.0/24</code>, confirm karte hain ki kaunsa.</p></div>

<div class="warn"><p><b>Common galti.</b> Rules ke bina commands ratna. Exam kam hi kehta hai "command type karo"; woh ek galat value wala output dikhata hai. Jaano ki har default kyun hai aur aap galat line jaldi pakad loge.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aise answers se saavdhaan jo sirf ek boundary router theek karte hain, OSPF internals soche bina EIGRP external AD ghatate hain, ya "advertisement rokne" ke liye OSPF distribute-list use karte hain. Har ek classic galat option hai.</p></div>

<div class="scn"><h4>Merger ke baad handover checklist</h4><p>Jab hamari labs ke Delhi aur Bengaluru networks production mein gaye, senior engineer ne paanch line ka handover note chhoda: dono boundary routers par seed metric 100000 100 255 1 1500; deny entries ke saath tags 90 (EIGRP-born) aur 110 (OSPF-born); dono par <code>distance ospf external 171</code>; OSPF-LANS prefix list 10.200.0.0/16 ko /24 tak cover karti hai; koi bhi naya boundary router chaaron copy kare. Chhe mahine baad teesra boundary router ek din mein bina kisi incident ke jud gaya.</p><p><b>Seekh:</b> redistribution design ek policy hai; ise likho aur har jagah identical lagao.</p></div>

<div class="iv"><p class="q">"Do boundary routers ke saath EIGRP aur OSPF domain ke beech mutual redistribution design karo. Aapki checklist mein kya hoga?"</p><p>Strong answer: internal paths se kharab seed metrics; OSPF mein <code>subnets</code>; prefix lists jo seemit karein ki har side kya export kare; exit par tags aur entry par tag denies; AD adjustment jaise <code>distance ospf external 171</code>, ya inbound tag filters, taaki EIGRP externals apni OSPF copies se replace na hon; dono routers par identical policy; aur <code>show ip route</code>, topology aur LSDB checks, dono domains se traceroutes, aur failure test ke saath verification plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har boundary par chaar kaam: bharosa (AD), convert (seed), filter (maps aur lists), stamp (tags).</li>
<li>Defaults jaano: AD table, OSPF 20 E2, EIGRP ko seed chahiye, BGP MED aur eBGP-only rules.</li>
<li>Prefix lists aur route maps logic puzzles hain: tab tak practice karo jab tak matching automatic na ho.</li>
<li>Do ya zyada redistribution points ko har boundary router par tags aur AD planning chahiye.</li>
<li>Prefix ko janam se wahan tak follow karke troubleshoot karo jahan woh missing hai.</li>
</ul></div>
`}};export{e as default};