var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have covered the Layer 2 VPN toolbox for the SPCOR exam: services, pseudowires, VPLS, EVPN, provider bridging, OAM and design. This chapter is your review sheet. There are no labs for this module; to keep your hands-on skills sharp, practise the underlay and signalling prerequisites in spcor-mpls-ldp and spcor-l3vpn, and EVPN control-plane behaviour in jncip-evpn and dc-evpn.</p>

<h3>Technology comparison</h3>
<table class="cmp"><tr><th></th><th>VPWS</th><th>VPLS</th><th>EVPN</th><th>Q-in-Q</th></tr>
<tr><td>Service</td><td>E-Line</td><td>E-LAN</td><td>E-Line, E-LAN, E-Tree</td><td>Metro access EVCs</td></tr>
<tr><td>MAC learning</td><td>None on PE</td><td>Data plane, flooding</td><td>BGP control plane</td><td>Data plane</td></tr>
<tr><td>Signalling</td><td>LDP or BGP</td><td>LDP or BGP</td><td>BGP</td><td>None (VLAN tags)</td></tr>
<tr><td>Loop prevention</td><td>Not needed</td><td>Split horizon</td><td>DF, split horizon</td><td>Spanning tree or ring protocols</td></tr>
<tr><td>Multihoming</td><td>PW redundancy</td><td>Limited</td><td>All-active via ESI</td><td>STP, REP, G.8032</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>Define UNI, EVC, AC, PE, pseudowire and the three MEF service types.</li>
<li>Draw the packet of an Ethernet pseudowire with transport label, PW label and control word.</li>
<li>Explain LDP signalling with PW ID, type and MTU, and PW types 4 and 5.</li>
<li>Describe VPLS with VSI, full mesh, split horizon, MAC learning and flooding.</li>
<li>Explain H-VPLS and why it reduces pseudowires.</li>
<li>Name the five EVPN route types and the purpose of ESI and DF.</li>
<li>Describe 802.1ad S-tag and C-tag, TPID 0x88a8, L2 protocol tunnelling, and PBB I-SID.</li>
<li>Explain CFM domains, MEPs, MIPs, CCM, loopback and linktrace, plus Y.1731 and 802.3ah.</li>
<li>Calculate an MTU budget and set up UNI protections.</li>
<li>Troubleshoot with the layered workflow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VFI / VSI</dt><dd>Virtual forwarding or switching instance of a VPLS.</dd>
<dt>ESI</dt><dd>Ethernet Segment Identifier for multihoming in EVPN.</dd>
<dt>DF</dt><dd>Designated forwarder, elected per ES and VLAN for BUM traffic.</dd>
<dt>S-VLAN / C-VLAN</dt><dd>Provider and customer VLANs in Q-in-Q.</dd>
<dt>I-SID</dt><dd>24-bit service identifier in PBB.</dd>
<dt>MEP / MIP</dt><dd>CFM end point and intermediate point.</dd>
<dt>CIR / EIR</dt><dd>Committed and excess information rate.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>VPWS is point-to-point; PEs do not learn customer MACs.</li>
<li>PW signalling with LDP uses a targeted session; PW ID, type and MTU must match.</li>
<li>PW type 5 is Ethernet and type 4 is Ethernet VLAN.</li>
<li>VPLS loop prevention is split horizon, not STP.</li>
<li>EVPN route types: 1 A-D, 2 MAC/IP, 3 inclusive multicast, 4 Ethernet segment, 5 IP prefix.</li>
<li>802.1ad uses TPID 0x88a8 for the S-tag; each added tag costs 4 bytes.</li>
<li>802.1ag is per service, 802.3ah per link, Y.1731 adds delay and loss measurement.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Count pseudowires: a full-mesh VPLS of 12 PEs has 12 x 11 / 2 = 66 pseudowires. Adding two more PEs gives 14 x 13 / 2 = 91. This growth is why H-VPLS and EVPN are preferred at scale.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating Q-in-Q, VPLS and EVPN as interchangeable. They solve different problems: tag stacking, multipoint pseudowire bridging and BGP-based MAC distribution.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pay attention to words such as all-active, point-to-point and MAC scaling: they point to EVPN, VPWS and PBB respectively.</p></div>

<div class="scn"><h4>Migration plan from VPLS to EVPN</h4><p>An operator planned a gradual migration. They ran EVPN and VPLS in parallel for a customer during a maintenance window, using a service-level cutover per customer, with CFM at the service level to verify end-to-end continuity before and after each switch. Rollback was a single change per customer.</p><p><b>Lesson:</b> migrate per service, verify with OAM, and keep a clean rollback.</p></div>

<div class="iv"><p class="q">"Summarise when you would use VPWS, VPLS, EVPN and Q-in-Q."</p><p>VPWS for point-to-point wires, VPLS for legacy multipoint over an LDP core, EVPN for modern multipoint, E-Line and E-Tree with all-active multihoming, and Q-in-Q at the metro edge to carry customer VLANs inside a provider S-VLAN. Mention the MTU and MAC-limit design checks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pick technology by service: VPWS, VPLS, EVPN, Q-in-Q.</li>
<li>Know the labels, tags and route types by heart.</li>
<li>Budget MTU for every header.</li>
<li>Protect the provider at the UNI.</li>
<li>Use OAM and a layered workflow to troubleshoot.</li>
</ul></div>
`,hi:`
<p>Aapne SPCOR exam ka Layer 2 VPN toolbox cover kar liya: services, pseudowires, VPLS, EVPN, provider bridging, OAM aur design. Yeh chapter aapki review sheet hai. Is module ke liye labs nahi hain; hands-on skills tez rakhne ke liye underlay aur signalling prerequisites spcor-mpls-ldp tatha spcor-l3vpn mein, aur EVPN control-plane behaviour jncip-evpn tatha dc-evpn mein practise karo.</p>

<h3>Technology comparison</h3>
<table class="cmp"><tr><th></th><th>VPWS</th><th>VPLS</th><th>EVPN</th><th>Q-in-Q</th></tr>
<tr><td>Service</td><td>E-Line</td><td>E-LAN</td><td>E-Line, E-LAN, E-Tree</td><td>Metro access EVCs</td></tr>
<tr><td>MAC learning</td><td>PE par nahi</td><td>Data plane, flooding</td><td>BGP control plane</td><td>Data plane</td></tr>
<tr><td>Signalling</td><td>LDP ya BGP</td><td>LDP ya BGP</td><td>BGP</td><td>Koi nahi (VLAN tags)</td></tr>
<tr><td>Loop prevention</td><td>Zaroorat nahi</td><td>Split horizon</td><td>DF, split horizon</td><td>Spanning tree ya ring protocols</td></tr>
<tr><td>Multihoming</td><td>PW redundancy</td><td>Limited</td><td>ESI se all-active</td><td>STP, REP, G.8032</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>UNI, EVC, AC, PE, pseudowire aur teen MEF service types define karo.</li>
<li>Transport label, PW label aur control word ke saath Ethernet pseudowire ka packet draw karo.</li>
<li>PW ID, type aur MTU ke saath LDP signalling, aur PW types 4 tatha 5 samjhao.</li>
<li>VSI, full mesh, split horizon, MAC learning aur flooding ke saath VPLS describe karo.</li>
<li>H-VPLS samjhao aur batao yeh pseudowires kyun kam karta hai.</li>
<li>Paanch EVPN route types aur ESI tatha DF ka purpose batao.</li>
<li>802.1ad S-tag aur C-tag, TPID 0x88a8, L2 protocol tunnelling aur PBB I-SID describe karo.</li>
<li>CFM domains, MEPs, MIPs, CCM, loopback aur linktrace, plus Y.1731 aur 802.3ah samjhao.</li>
<li>MTU budget calculate karo aur UNI protections set up karo.</li>
<li>Layered workflow se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VFI / VSI</dt><dd>VPLS ka virtual forwarding ya switching instance.</dd>
<dt>ESI</dt><dd>EVPN mein multihoming ke liye Ethernet Segment Identifier.</dd>
<dt>DF</dt><dd>Designated forwarder, BUM traffic ke liye har ES aur VLAN par elect hota hai.</dd>
<dt>S-VLAN / C-VLAN</dt><dd>Q-in-Q mein provider aur customer VLANs.</dd>
<dt>I-SID</dt><dd>PBB mein 24-bit service identifier.</dd>
<dt>MEP / MIP</dt><dd>CFM end point aur intermediate point.</dd>
<dt>CIR / EIR</dt><dd>Committed aur excess information rate.</dd>
</dl>

<h3>Sabse zyaada tested facts</h3>
<ul>
<li>VPWS point-to-point hai; PEs customer MACs learn nahi karte.</li>
<li>LDP se PW signalling targeted session use karti hai; PW ID, type aur MTU match hone chahiye.</li>
<li>PW type 5 Ethernet hai aur type 4 Ethernet VLAN.</li>
<li>VPLS loop prevention split horizon hai, STP nahi.</li>
<li>EVPN route types: 1 A-D, 2 MAC/IP, 3 inclusive multicast, 4 Ethernet segment, 5 IP prefix.</li>
<li>802.1ad S-tag ke liye TPID 0x88a8 use karta hai; har jodi gayi tag 4 bytes leti hai.</li>
<li>802.1ag per service hai, 802.3ah per link, Y.1731 delay aur loss measurement jodta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pseudowires gino: 12 PEs ke full-mesh VPLS mein 12 x 11 / 2 = 66 pseudowires hote hain. Do aur PEs jodne par 14 x 13 / 2 = 91. Isi growth ki wajah se scale par H-VPLS aur EVPN preferred hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Q-in-Q, VPLS aur EVPN ko interchangeable samajhna. Yeh alag problems solve karte hain: tag stacking, multipoint pseudowire bridging aur BGP-based MAC distribution.</p></div>
<div class="exam"><p><b>Exam trap.</b> All-active, point-to-point aur MAC scaling jaise words par dhyan do: yeh kramshah EVPN, VPWS aur PBB ki taraf ishara karte hain.</p></div>

<div class="scn"><h4>VPLS se EVPN migration plan</h4><p>Operator ne gradual migration plan kiya. Unhone maintenance window mein ek customer ke liye EVPN aur VPLS parallel chalaye, per customer service-level cutover ke saath, aur har switch se pehle aur baad end-to-end continuity verify karne ke liye service level par CFM use kiya. Rollback har customer ke liye ek hi change tha.</p><p><b>Lesson:</b> per service migrate karo, OAM se verify karo, aur saaf rollback rakho.</p></div>

<div class="iv"><p class="q">"VPWS, VPLS, EVPN aur Q-in-Q kab use karoge, summarise karo."</p><p>Point-to-point wires ke liye VPWS, LDP core par legacy multipoint ke liye VPLS, all-active multihoming ke saath modern multipoint, E-Line aur E-Tree ke liye EVPN, aur metro edge par customer VLANs ko provider S-VLAN ke andar carry karne ke liye Q-in-Q. MTU aur MAC-limit design checks ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Technology service se chuno: VPWS, VPLS, EVPN, Q-in-Q.</li>
<li>Labels, tags aur route types dil se yaad rakho.</li>
<li>Har header ke liye MTU budget banao.</li>
<li>UNI par provider ko protect karo.</li>
<li>Troubleshoot karne ke liye OAM aur layered workflow use karo.</li>
</ul></div>
`}};export{e as default};