var e=(e,t)=>`<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="L3VPN lab topology"><rect x="10" y="85" width="60" height="40" rx="8" fill="#fde68a"/><text x="40" y="109" text-anchor="middle" class="svg-ink" font-size="12">PC1</text><rect x="90" y="75" width="70" height="60" rx="8" fill="#fde68a"/><text x="125" y="102" text-anchor="middle" class="svg-ink" font-size="13">CE1</text><text x="125" y="120" text-anchor="middle" class="svg-muted" font-size="11">AS 65101</text><rect x="195" y="75" width="70" height="60" rx="8" fill="#bae6fd"/><text x="230" y="110" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><rect x="285" y="75" width="70" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">P</text><rect x="375" y="75" width="70" height="60" rx="8" fill="#bae6fd"/><text x="410" y="110" text-anchor="middle" class="svg-ink" font-size="14">PE2</text><rect x="480" y="75" width="70" height="60" rx="8" fill="#fde68a"/><text x="515" y="102" text-anchor="middle" class="svg-ink" font-size="13">CE2</text><text x="515" y="120" text-anchor="middle" class="svg-muted" font-size="11">AS 65102</text><rect x="570" y="85" width="60" height="40" rx="8" fill="#fde68a"/><text x="600" y="109" text-anchor="middle" class="svg-ink" font-size="12">PC2</text><line x1="70" y1="105" x2="90" y2="105" stroke="#64748b" stroke-width="2"/><line x1="160" y1="105" x2="195" y2="105" stroke="#64748b" stroke-width="2"/><line x1="265" y1="105" x2="285" y2="105" stroke="#64748b" stroke-width="2"/><line x1="355" y1="105" x2="375" y2="105" stroke="#64748b" stroke-width="2"/><line x1="445" y1="105" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><line x1="550" y1="105" x2="570" y2="105" stroke="#64748b" stroke-width="2"/><rect x="190" y="150" width="260" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">`+t+`</text><text x="230" y="60" text-anchor="middle" class="svg-muted" font-size="11">10.0.255.1</text><text x="410" y="60" text-anchor="middle" class="svg-muted" font-size="11">10.0.255.3</text><text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">CE-PE links 192.168.1.0/24 and 192.168.2.0/24; LANs 172.16.1.0/24 and 172.16.2.0/24</text></svg><p class="cap">`+e+`</p></div>`,t={id:`l3vpn-big-picture`,h:{en:`MPLS Layer 3 VPN: what you will learn and the big picture`,hi:`MPLS Layer 3 VPN: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will build a complete MPLS Layer 3 VPN: VRFs, route distinguishers (RD) and route targets (RT), MP-BGP VPNv4 between PEs, PE-CE routing with eBGP, the two-label forwarding path, and a troubleshooting order that separates control-plane from data-plane faults. This is the L3VPN part of SPCOR 350-501, and it builds on the BGP and LDP modules before it.</p>
<p><b>Prerequisites.</b> iBGP between loopbacks (BGP in the SP core module) and an MPLS LDP core with IS-IS (MPLS LDP module). You must be comfortable reading <code>show mpls forwarding-table</code> and <code>show ip bgp</code>.</p>

<h3>Analogy: one building, many private offices</h3>
<p>A service provider is like a large office building rented to many companies. The building (the provider core) has shared corridors, lifts and a front desk. Each company has its own locked suite (a <b>VRF</b>): their rooms are numbered 101, 102, like every other company's, but nobody enters another suite by mistake. The front desk has a rule list saying which suites may exchange mail: that is the <b>route target</b>. The lifts carry mail between floors using a floor tag (the <b>label</b>), and only the receptionist on the destination floor reads the suite number (the <b>VPN label</b>).</p>

@@D@@

<h3>The problem a provider solves</h3>
<ul>
<li>Many customers, often using the <b>same private addresses</b> (172.16.1.0/24 at ten different customers).</li>
<li>Customers must be fully isolated, yet each should feel it has its own private WAN with its own routing.</li>
<li>The provider must scale: adding a customer must not add state to the core. The P routers carry only IGP loopbacks and labels.</li>
</ul>
<p>MPLS L3VPN (RFC 4364, "BGP/MPLS IP VPN") solves this with four ingredients:</p>
<ol>
<li><b>VRFs</b> on PEs separate customer routing tables.</li>
<li><b>RD + RT</b> make customer routes unique and control who imports what.</li>
<li><b>MP-BGP VPNv4</b> carries customer routes between PEs, with a VPN label.</li>
<li><b>MPLS (LDP)</b> carries the packets across the BGP-free core using a transport label.</li>
</ol>

<h3>The lab</h3>
<p>Deccan Net's core is ready: IS-IS, LDP and an iBGP session between PE loopbacks (PE1 10.0.255.1, PE2 10.0.255.3, with P 10.0.255.2 in between). CUST_A has two sites. CE1 (AS 65101, 192.168.1.2, LAN 172.16.1.0/24) connects to PE1 at 192.168.1.1, and CE2 (AS 65102, 192.168.2.2, LAN 172.16.2.0/24) connects to PE2 at 192.168.2.1. Your task is to build the VPN so PC1 (172.16.1.10) reaches PC2 (172.16.2.10) and the P router never learns a customer route.</p>

<div class="eg"><p><b>Worked example: the finished picture.</b> After the lab, PE1 holds a separate table for CUST_A. The same prefix 172.16.2.0/24 appears there, learned via BGP from PE2's loopback:</p>
<pre class="out">PE1# show ip route vrf CUST_A
B        172.16.1.0 [20/0] via 192.168.1.2, 00:00:35
B        172.16.2.0 [200/0] via 10.0.255.3, 00:00:35
C        192.168.1.0/24 is directly connected, GigabitEthernet0/1

P# show ip bgp
% BGP not active</pre>
<p>Note two things: the second route is iBGP (distance 200) with next hop PE2's loopback, and the P router does not even run BGP. This is the BGP-free core in action.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking the P router needs the customer routes. It does not: it forwards on the outer transport label to the PE loopback. Putting customer routes into the IGP defeats the purpose.</p></div>
<div class="exam"><p><b>Exam trap.</b> RD does not control route distribution; RT does. A VRF without a matching import RT never receives the route even if the RD is identical.</p></div>

<div class="scn"><h4>Two customers, same address, no conflict</h4><p>A carrier onboarded two retail chains that both used 10.1.1.0/24 for shops. With one VRF per customer, each PE had two separate tables and the overlap was invisible. Customers never saw each other's routes, and the P routers never saw either.</p><p><b>Lesson:</b> a VRF is a private routing table per customer; overlap is normal.</p></div>

<div class="iv"><p class="q">"Explain MPLS L3VPN in two minutes."</p><p>Each customer gets a VRF on the PE. Customer routes get an RD to be unique and an RT to control import and export. PEs exchange the routes in MP-BGP VPNv4 with a VPN label. Across the core packets carry two labels: the outer LDP label to the egress PE loopback and the inner VPN label that selects the VRF. P routers only swap the outer label, so the core is BGP-free.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VPN = VRF + RD/RT + MP-BGP VPNv4 + MPLS transport.</li>
<li>Same customer addresses can overlap without conflict.</li>
<li>P routers hold no customer routes; they swap the outer label.</li>
<li>RT controls who imports routes; RD only makes them unique.</li>
<li>Lab: CUST_A, PE1, P, PE2, CE1, CE2 in AS 65000, 65101 and 65102.</li>
</ul></div>
`.replace(`@@D@@`,e(`Deccan Net lab: CUST_A has two sites across a BGP-free MPLS core.`,`MPLS core: IS-IS + LDP + iBGP between PE loopbacks`)),hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap poora MPLS Layer 3 VPN banaoge: VRFs, route distinguishers (RD) aur route targets (RT), PEs ke beech MP-BGP VPNv4, eBGP ke saath PE-CE routing, do-label forwarding path, aur troubleshooting ka woh order jo control-plane aur data-plane faults ko alag karta hai. Yeh SPCOR 350-501 ka L3VPN hissa hai, aur isse pehle ke BGP aur LDP modules par bana hai.</p>
<p><b>Prerequisites.</b> Loopbacks ke beech iBGP (BGP in the SP core module) aur IS-IS ke saath MPLS LDP core (MPLS LDP module). Aapko <code>show mpls forwarding-table</code> aur <code>show ip bgp</code> padhna aana chahiye.</p>

<h3>Analogy: ek building, kai private offices</h3>
<p>Service provider ek bade office building jaisa hai jo kai companies ko kiraye par diya gaya hai. Building (provider core) mein shared corridors, lifts aur front desk hain. Har company ka apna locked suite (<b>VRF</b>) hai: unke rooms 101, 102 number ke hain, har doosri company ki tarah, par koi galti se doosre suite mein nahi jaata. Front desk ke paas rule list hai ki kaunse suites aapas mein mail exchange kar sakte hain: yeh <b>route target</b> hai. Lifts floors ke beech mail floor tag (<b>label</b>) se le jaate hain, aur sirf destination floor ka receptionist suite number (<b>VPN label</b>) padhta hai.</p>

@@D@@

<h3>Jo problem provider solve karta hai</h3>
<ul>
<li>Kai customers, aksar <b>same private addresses</b> use karte hain (dus alag customers par 172.16.1.0/24).</li>
<li>Customers poori tarah isolated hon, phir bhi har ek ko lage ki uska apna private WAN apni routing ke saath hai.</li>
<li>Provider scale kare: customer jodne se core par state nahi badhna chahiye. P routers sirf IGP loopbacks aur labels rakhte hain.</li>
</ul>
<p>MPLS L3VPN (RFC 4364, "BGP/MPLS IP VPN") yeh chaar ingredients se solve karta hai:</p>
<ol>
<li>PEs par <b>VRFs</b> customer routing tables alag karte hain.</li>
<li><b>RD + RT</b> customer routes ko unique banate hain aur control karte hain ki kaun kya import kare.</li>
<li><b>MP-BGP VPNv4</b> PEs ke beech customer routes VPN label ke saath le jaata hai.</li>
<li><b>MPLS (LDP)</b> packets ko BGP-free core ke paar transport label se le jaata hai.</li>
</ol>

<h3>Lab</h3>
<p>Deccan Net ka core tayyar hai: IS-IS, LDP aur PE loopbacks ke beech iBGP session (PE1 10.0.255.1, PE2 10.0.255.3, beech mein P 10.0.255.2). CUST_A ki do sites hain. CE1 (AS 65101, 192.168.1.2, LAN 172.16.1.0/24) PE1 se 192.168.1.1 par jur-ta hai, aur CE2 (AS 65102, 192.168.2.2, LAN 172.16.2.0/24) PE2 se 192.168.2.1 par. Aapka task VPN banana hai taaki PC1 (172.16.1.10) PC2 (172.16.2.10) tak pahunche aur P router ko kabhi koi customer route na mile.</p>

<div class="eg"><p><b>Worked example: poori tasveer.</b> Lab ke baad PE1 ke paas CUST_A ki alag table hai. Wahi prefix 172.16.2.0/24 wahan dikhta hai, BGP se PE2 ke loopback se seekha:</p>
<pre class="out">PE1# show ip route vrf CUST_A
B        172.16.1.0 [20/0] via 192.168.1.2, 00:00:35
B        172.16.2.0 [200/0] via 10.0.255.3, 00:00:35
C        192.168.1.0/24 is directly connected, GigabitEthernet0/1

P# show ip bgp
% BGP not active</pre>
<p>Do cheezein dekho: doosra route iBGP hai (distance 200) PE2 ke loopback ke next hop ke saath, aur P router BGP chalata hi nahi. Yahi BGP-free core hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sochna ki P router ko customer routes chahiye. Nahi chahiye: woh PE loopback ki taraf bahar wale transport label par forward karta hai. Customer routes ko IGP mein daalna maqsad hi khatam kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> RD route distribution control nahi karta; RT karta hai. Matching import RT ke bina VRF ko route kabhi nahi milta, bhale hi RD wahi ho.</p></div>

<div class="scn"><h4>Do customers, same address, koi conflict nahi</h4><p>Ek carrier ne do retail chains onboard kiye jo dono shops ke liye 10.1.1.0/24 use karte the. Har customer ke liye ek VRF ke saath har PE par do alag tables thi aur overlap dikha hi nahi. Customers ne ek doosre ke routes kabhi nahi dekhe, aur P routers ne kisi ko nahi dekha.</p><p><b>Lesson:</b> VRF har customer ki private routing table hai; overlap normal hai.</p></div>

<div class="iv"><p class="q">"MPLS L3VPN do minute mein samjhao."</p><p>Har customer ko PE par VRF milta hai. Customer routes ko unique hone ke liye RD aur import/export control ke liye RT milta hai. PEs routes ko VPN label ke saath MP-BGP VPNv4 mein badalte hain. Core ke paar packets do labels le jaate hain: egress PE loopback ka bahar wala LDP label aur VRF chunne wala andar wala VPN label. P routers sirf bahar wala label swap karte hain, isliye core BGP-free hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L3VPN = VRF + RD/RT + MP-BGP VPNv4 + MPLS transport.</li>
<li>Same customer addresses bina conflict ke overlap kar sakte hain.</li>
<li>P routers customer routes nahi rakhte; woh bahar wala label swap karte hain.</li>
<li>RT tay karta hai kaun routes import kare; RD sirf unique banata hai.</li>
<li>Lab: AS 65000, 65101 aur 65102 mein CUST_A, PE1, P, PE2, CE1, CE2.</li>
</ul></div>
`.replace(`@@D@@`,e(`Deccan Net lab: CUST_A ki do sites BGP-free MPLS core ke paar.`,`MPLS core: IS-IS + LDP + PE loopbacks ke beech iBGP`))}};export{t as default};