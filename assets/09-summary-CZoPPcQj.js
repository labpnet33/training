var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>You have now covered the SP security objectives of SPCOR 350-501.</b> Use the checklist below to find your weak spots, then revisit that chapter. Remember that no simulator labs exist for this module: to practise the underlying skills use enarsi-security, enarsi-bgp, encor-device-security and sec-infra.</p>
<h3>Can-do checklist</h3>
<ul><li>Explain the three planes and which control protects which.</li>
<li>Describe CoPP (IOS XE) and LPTS (IOS XR) and why monitoring comes first.</li>
<li>Explain GTSM with the TTL 255 rule and configure it on both ends.</li>
<li>Authenticate BGP, IS-IS, OSPF and LDP and plan key rollover with key chains.</li>
<li>Choose strict, loose or feasible-path uRPF for a given edge.</li>
<li>Explain destination-based and source-based RTBH and customer-triggered RTBH with 65535:666.</li>
<li>Describe flowspec match fields, actions, validation and when to prefer it over RTBH.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Punt</dt><dd>Sending a packet to the route processor CPU.</dd><dt>CoPP</dt><dd>Control Plane Policing: QoS on the control-plane interface.</dd><dt>LPTS</dt><dd>Local Packet Transport Services on IOS XR, with the pIFIB table.</dd><dt>GTSM</dt><dd>Generalized TTL Security Mechanism, RFC 5082.</dd><dt>uRPF</dt><dd>Unicast Reverse Path Forwarding: checks the return path of the source.</dd><dt>RTBH</dt><dd>Remotely triggered black hole: discard a victim address network-wide.</dd><dt>Flowspec</dt><dd>BGP address family that distributes flow match and action rules.</dd></dl>
<h3>Most tested facts</h3>
<ul><li>GTSM: peers send TTL 255; accept 255 minus hops; hops is 1 for a directly connected peer; both ends must enable it.</li>
<li>BGP MD5 is RFC 2385; TCP-AO is RFC 5925; LDP password is per neighbor LDP ID.</li>
<li>uRPF strict for single-homed; loose for multi-homed, peering, transit and source-based RTBH.</li>
<li>RTBH needs a Null0 route for the discard next-hop on every edge; BLACKHOLE community is 65535:666 (RFC 7999).</li>
<li>Flowspec: AFI 1 SAFI 133 (IPv4), SAFI 134 (VPNv4), RFC 8955; actions are extended communities; traffic-rate 0 discards.</li></ul>
<h3>Command cheat sheet (reference, check your release)</h3>
<pre class="code">show policy-map control-plane          <span class="c">! IOS XE CoPP counters</span>
show lpts pifib hardware police location 0/0/CPU0   <span class="c">! IOS XR LPTS</span>
show ip bgp summary
show mpls ldp neighbor
show ip route 192.0.2.1                <span class="c">! RTBH discard next-hop check</span>
show flowspec ipv4                     <span class="c">! IOS XR flowspec</span></pre>
<div class="eg"><p><b>Worked example.</b> Exam-style question: "Which action makes a directly connected eBGP session resistant to forged packets from the Internet without using keys?" The answer is GTSM (ttl-security hops 1) on both ends, because a remote packet cannot arrive with TTL 254 or more.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not mix up RTBH and flowspec: RTBH is next-hop trick (Null0), flowspec is a separate address family with match fields. Do not mix up uRPF strict and loose either.</p></div>
<div class="scn"><h4>The quarterly security drill</h4><p>A provider ran a drill each quarter: confirm GTSM on every BGP edge session, test one customer-triggered RTBH with a documentation prefix, review CoPP or LPTS drop counters, and check uRPF mode on new customer ports. The checklist found one new port without uRPF and one session without a key, both fixed in the same week.</p><p><b>Lesson:</b> Security is a routine, not a project.</p></div>
<div class="iv"><p class="q">"Summarise how you would defend a customer under DDoS."</p><p>First scope the traffic. If it can be described by headers I use flowspec to drop or rate-limit just that flow. If volume threatens the network I use RTBH to discard traffic to the victim address, using the customer-triggered community with prefix checks. Meanwhile uRPF, iACLs and CoPP or LPTS keep the rest of the network stable.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>You can map each feature to a plane and an attack.</li>
<li>Layer GTSM, authentication, filters and CoPP or LPTS on sessions.</li>
<li>uRPF mode follows topology.</li>
<li>RTBH is the blunt brake; flowspec the scalpel.</li>
<li>Practise with related modules; this one has no labs.</li></ul></div>
`,hi:`
<p><b>Ab aapne SPCOR 350-501 ke SP security objectives cover kar liye.</b> Apne kamzor points dhoondne ke liye neeche ki checklist use karo, phir us chapter ko dobara padho. Yaad rakho ki is module ke liye simulator labs nahi hain: neeche ki skills practise karne ke liye enarsi-security, enarsi-bgp, encor-device-security aur sec-infra use karo.</p>
<h3>Can-do checklist</h3>
<ul><li>Teen planes explain karo aur kaunsa control kisko protect karta hai.</li>
<li>CoPP (IOS XE) aur LPTS (IOS XR) describe karo aur monitoring pehle kyun aati hai.</li>
<li>GTSM ko TTL 255 rule ke saath explain karo aur dono ends par configure karo.</li>
<li>BGP, IS-IS, OSPF aur LDP authenticate karo aur key chains se key rollover plan karo.</li>
<li>Diye gaye edge ke liye strict, loose ya feasible-path uRPF chuno.</li>
<li>Destination-based aur source-based RTBH aur 65535:666 ke saath customer-triggered RTBH explain karo.</li>
<li>Flowspec match fields, actions, validation aur RTBH ke bajay kab prefer karna hai describe karo.</li></ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Punt</dt><dd>Packet ko route processor CPU ko bhejna.</dd><dt>CoPP</dt><dd>Control Plane Policing: control-plane interface par QoS.</dd><dt>LPTS</dt><dd>IOS XR par Local Packet Transport Services, pIFIB table ke saath.</dd><dt>GTSM</dt><dd>Generalized TTL Security Mechanism, RFC 5082.</dd><dt>uRPF</dt><dd>Unicast Reverse Path Forwarding: source ka return path check karta hai.</dd><dt>RTBH</dt><dd>Remotely triggered black hole: victim address ko poore network mein discard karo.</dd><dt>Flowspec</dt><dd>BGP address family jo flow match aur action rules distribute karti hai.</dd></dl>
<h3>Sabse zyada tested facts</h3>
<ul><li>GTSM: peers TTL 255 bhejte hain; 255 minus hops accept; directly connected peer ke liye hops 1; dono ends enable karne hain.</li>
<li>BGP MD5 RFC 2385 hai; TCP-AO RFC 5925; LDP password per neighbor LDP ID.</li>
<li>uRPF strict single-homed ke liye; loose multi-homed, peering, transit aur source-based RTBH ke liye.</li>
<li>RTBH ko har edge par discard next-hop ka Null0 route chahiye; BLACKHOLE community 65535:666 (RFC 7999).</li>
<li>Flowspec: AFI 1 SAFI 133 (IPv4), SAFI 134 (VPNv4), RFC 8955; actions extended communities hain; traffic-rate 0 discard karta hai.</li></ul>
<h3>Command cheat sheet (reference, apni release check karo)</h3>
<pre class="code">show policy-map control-plane          <span class="c">! IOS XE CoPP counters</span>
show lpts pifib hardware police location 0/0/CPU0   <span class="c">! IOS XR LPTS</span>
show ip bgp summary
show mpls ldp neighbor
show ip route 192.0.2.1                <span class="c">! RTBH discard next-hop check</span>
show flowspec ipv4                     <span class="c">! IOS XR flowspec</span></pre>
<div class="eg"><p><b>Worked example.</b> Exam-style sawaal: "Kaunsa action directly connected eBGP session ko bina keys ke Internet se forged packets ke khilaf resistant banata hai?" Jawab hai dono ends par GTSM (ttl-security hops 1), kyunki remote packet TTL 254 ya zyada ke saath nahi pahunch sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> RTBH aur flowspec mat milao: RTBH next-hop trick (Null0) hai, flowspec match fields wali alag address family. uRPF strict aur loose bhi mat milao.</p></div>
<div class="scn"><h4>Quarterly security drill</h4><p>Ek provider har quarter drill chalata tha: har BGP edge session par GTSM confirm karo, documentation prefix ke saath ek customer-triggered RTBH test karo, CoPP ya LPTS drop counters review karo, aur naye customer ports par uRPF mode check karo. Checklist ne ek naya port bina uRPF aur ek session bina key ke dhoondha, dono usi hafte fix hue.</p><p><b>Lesson:</b> Security routine hai, project nahi.</p></div>
<div class="iv"><p class="q">"Attack mein phase customer ko kaise defend karoge, summarise karo."</p><p>Pehle traffic scope karta hoon. Agar headers se describe ho sake to flowspec se sirf woh flow drop ya rate-limit karta hoon. Volume network ko khatre mein daale to RTBH se victim address ka traffic discard karta hoon, customer-triggered community aur prefix checks ke saath. Is beech uRPF, iACLs aur CoPP ya LPTS baaki network ko stable rakhte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Aap har feature ko ek plane aur attack se map kar sakte ho.</li>
<li>Sessions par GTSM, authentication, filters aur CoPP ya LPTS layer karo.</li>
<li>uRPF mode topology follow karta hai.</li>
<li>RTBH blunt brake hai; flowspec scalpel.</li>
<li>Related modules se practise karo; is module mein labs nahi hain.</li></ul></div>
`}};export{e as default};