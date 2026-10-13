var e={id:`rdrt`,h:{en:`Route distinguisher vs route target`,hi:`Route distinguisher vs route target`},body:{en:`
<p>Two schools in the same city can both have a student called "Riya Sharma, class 8". If the education board keeps one big list, it must add something to make each entry unique: "School 17, Riya Sharma, class 8". That extra prefix does not decide anything; it only prevents collisions. Separately, each school subscribes to the circulars it wants: "maths olympiad notices", "sports notices". A circular reaches a school only if the school subscribed to that topic. In EVPN the unique prefix is the <b>route distinguisher (RD)</b> and the subscription is the <b>route target (RT)</b>. Mixing them up is the most common conceptual mistake in EVPN interviews.</p>

<h3>Route distinguisher: makes a route unique</h3>
<p>The RD is an 8-byte value placed in front of every EVPN NLRI. Its only job is to make routes unique in the BGP table. Two tenants may use the same IP subnet, and a MAC address may, in rare cases, be present in two different VNIs. With different RDs, BGP treats them as different routes and does not choose one "best" and throw the other away. The RD does <b>not</b> control which VNI or VRF imports the route.</p>
<p>On NX-OS use <code>rd auto</code>. The automatic RD is built from the BGP router ID:</p>
<ul>
<li>For an <b>L2VNI</b> (MAC-VRF): <b>router-id:(32767 + VLAN ID)</b>. VLAN 10 on LEAF1 → <code>10.255.0.1:32777</code>. VLAN 20 on LEAF2 → <code>10.255.0.2:32787</code>.</li>
<li>For a <b>VRF</b> (IP-VRF, L3VNI): <b>router-id:VRF-ID</b>, for example <code>10.255.0.1:3</code>, where the VRF ID is the internal number NX-OS assigns (see <code>show vrf</code>).</li>
</ul>
<p>Because the router ID is in the RD, every leaf's routes for the same VNI have a different RD. That is good: when two leaves advertise the same anycast subnet as type 5, both routes survive at the route reflector and remote leaves can use both.</p>

<h3>Route target: decides who imports</h3>
<p>The RT is a BGP <b>extended community</b> attached to the route. Each VNI and VRF has an <b>export</b> list (RTs stamped on routes it originates) and an <b>import</b> list (RTs it accepts). A leaf imports a received route into a local VNI or VRF only if at least one RT on the route is in that VNI's or VRF's import list.</p>
<p>On NX-OS <code>route-target import auto</code> and <code>route-target export auto</code> (or <code>route-target both auto</code>) derive the RT as <b>ASN:VNI</b>. In AS 65001, VNI 10010 gets <code>65001:10010</code> and the L3VNI 50001 gets <code>65001:50001</code>. Because every leaf in an iBGP fabric has the same ASN, auto RTs match automatically across all leaves, which is the main reason people use them.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="RD and RT roles">
<rect x="10" y="20" width="250" height="60" rx="8" fill="#e2e8f0"/><text x="135" y="45" text-anchor="middle" class="svg-ink" font-size="13">RD 10.255.0.2:32777</text><text x="135" y="66" text-anchor="middle" class="svg-muted" font-size="12">makes the route unique</text>
<rect x="380" y="20" width="250" height="60" rx="8" fill="#fde68a"/><text x="505" y="45" text-anchor="middle" class="svg-ink" font-size="13">RT 65001:10010</text><text x="505" y="66" text-anchor="middle" class="svg-muted" font-size="12">decides who imports</text>
<rect x="60" y="140" width="220" height="44" rx="8" fill="#bbf7d0"/><text x="170" y="167" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 VNI 10010 import auto</text>
<rect x="360" y="140" width="220" height="44" rx="8" fill="#fed7aa"/><text x="470" y="167" text-anchor="middle" class="svg-ink" font-size="12">LEAF3 import 65001:10100</text>
<line x1="505" y1="80" x2="170" y2="140" stroke="#64748b" stroke-width="2"/><line x1="505" y1="80" x2="470" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="250" y="120" class="svg-accent" font-size="12">match: imported</text><text x="495" y="120" class="svg-accent" font-size="12">no match</text>
</svg><p class="cap">The RD only labels the route. The RT is compared with each local import list.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! L2VNI: MAC-VRF (lab 2)</span>
evpn
  vni 10010 l2
    rd auto
    route-target import auto
    route-target export auto
<span class="c">! IP-VRF with L3VNI (lab 3)</span>
vrf context TENANT-A
  vni 50001
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn</pre>
<p>Note the two lines under the VRF. <code>route-target both auto</code> is for classic MPLS VPN (VPNv4) import/export. <code>route-target both auto evpn</code> is the one EVPN uses to import and export type-2 host routes and type-5 prefixes into the VRF. Without the <b>evpn</b> keyword, the VRF imports no EVPN routes. Lab 5 contains exactly this fault.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show bgp l2vpn evpn
   Network            Next Hop            Metric     LocPrf     Weight Path
<span class="hl">Route Distinguisher: 10.255.0.1:32777    (L2VNI 10010)</span>
*>l[3]:[0]:[32]:[10.254.0.1]/88
                      10.254.0.1                        100      32768 i
*>i[3]:[0]:[32]:[10.254.0.2]/88
                      10.254.0.2                        100          0 i
Route Distinguisher: 10.255.0.2:32777
*>i[3]:[0]:[32]:[10.254.0.2]/88
                      10.254.0.2                        100          0 i
* i                   10.254.0.2                        100          0 i</pre>
<p>How to read it: LEAF2's route appears under LEAF2's own RD twice (one copy per spine) and once more under LEAF1's local RD tagged <b>(L2VNI 10010)</b>. That last copy is the proof that the RT matched and the route was <b>imported</b> into the local VNI. If the RT does not match, the route stays only under the remote RD and the local L2VNI section shows just your own route.</p>

<div class="eg"><p><b>Worked example: a one-digit typo.</b> LEAF3 was configured with <code>route-target import 65001:10100</code> for VNI 10010. LEAF4's type-3 route arrives with <code>RT:65001:10010</code>. 10100 is not 10010, so nothing is imported: LEAF3 has no flood-list entry for LEAF4, no remote MACs from LEAF4, and <code>show nve peers</code> stays empty although BGP is healthy and routes are visible in the table. Hosts in VLAN 10 on the two leaves cannot talk. The fix is <code>no route-target import 65001:10100</code> followed by <code>route-target import auto</code>. Lab 4 has the same fault with <code>65001:10099</code>.</p></div>

<h3>RTs in eBGP fabrics</h3>
<p>In an eBGP design each leaf has its own ASN, so auto RTs differ (65011:10010 on one leaf, 65012:10010 on another) and would never match. The options are manual RTs that are identical everywhere, or <code>rewrite-evpn-rt-asn</code> under the neighbor's <code>address-family l2vpn evpn</code>, which rewrites the ASN part of received RTs to the local ASN. With a 4-byte ASN the auto format also changes, so always verify the derived value in the BGP table.</p>

<div class="warn"><p><b>Common mistakes.</b> Changing the RD to "fix" an import problem (it cannot); typing a manual RT that differs by one digit; configuring <code>route-target both auto</code> in a VRF but forgetting <code>route-target both auto evpn</code>; mixing auto RTs on some leaves with manual RTs on others.</p></div>
<div class="exam"><p><b>Exam trap.</b> RD = uniqueness, RT = import/export policy. Auto RD for an L2VNI is router-id:(32767 + VLAN); auto RT is ASN:VNI. A question that asks "which value decides whether a route is installed in a VNI" wants the route target.</p></div>

<div class="scn"><h4>The migration that split a VLAN</h4><p>A team migrated VNI 20050 from a legacy template that used manual RTs (<code>65001:2050</code>) to the new template with <code>route-target both auto</code> (<code>65001:20050</code>). They changed eight leaves in the first night and planned the remaining eight for the next night. For a whole day, hosts on old leaves could not reach hosts on new leaves in the same VLAN, while BGP looked perfectly healthy. <code>show bgp l2vpn evpn</code> showed the remote type-3 routes present but not imported under the local L2VNI RD. As a bridge, they added <code>route-target import 65001:2050</code> alongside <code>auto</code> on the new leaves until the migration completed.</p><p><b>Lesson:</b> a VNI can import several RTs. During migrations, import both the old and the new RT.</p></div>

<div class="iv"><p class="q">"What is the difference between an RD and an RT in EVPN?"</p><p>Strong answer: the RD is prepended to the NLRI to make routes unique in the BGP table, so identical MACs or prefixes from different leaves or tenants do not collide; it does not affect import. The RT is an extended community that controls which VNI or VRF exports and imports a route. On NX-OS, rd auto gives router-id:(32767+VLAN) for L2VNIs and router-id:VRF-ID for VRFs, and route-target auto gives ASN:VNI. Give the typo example: a wrong import RT silently breaks a VNI while BGP stays Established.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RD makes a route unique; it never decides import.</li>
<li>RT is an extended community; import happens only when an RT matches the local import list.</li>
<li>Auto RD: router-id:(32767 + VLAN) for L2VNI, router-id:VRF-ID for a VRF. Auto RT: ASN:VNI.</li>
<li>A VRF needs route-target both auto evpn to import EVPN routes.</li>
<li>An import copy under your own RD tagged (L2VNI x) proves the RT matched.</li>
</ul></div>
`,hi:`
<p>Ek hi shehar ke do schools mein "Riya Sharma, class 8" naam ki student ho sakti hai. Agar education board ek badi list rakhta hai, to use har entry unique banane ke liye kuch jodna padega: "School 17, Riya Sharma, class 8". Woh extra prefix kuch tay nahi karta; sirf takraav rokta hai. Alag se, har school un circulars ko subscribe karta hai jo use chahiye: "maths olympiad notices", "sports notices". Circular school tak tabhi pahunchta hai jab school ne us topic ko subscribe kiya ho. EVPN mein unique prefix <b>route distinguisher (RD)</b> hai aur subscription <b>route target (RT)</b> hai. Inhe mix karna EVPN interviews ki sabse common conceptual galti hai.</p>

<h3>Route distinguisher: route ko unique banata hai</h3>
<p>RD ek 8-byte value hai jo har EVPN NLRI ke aage lagti hai. Iska sirf ek kaam hai: BGP table mein routes ko unique banana. Do tenants same IP subnet use kar sakte hain, aur kabhi kabhi ek MAC address do alag VNIs mein ho sakta hai. Alag RDs ke saath BGP unhe alag routes maanta hai aur ek "best" chun kar doosra phenk nahi deta. RD yeh control <b>nahi</b> karta ki route kaunsa VNI ya VRF import karega.</p>
<p>NX-OS par <code>rd auto</code> use karo. Automatic RD BGP router ID se banta hai:</p>
<ul>
<li><b>L2VNI</b> (MAC-VRF) ke liye: <b>router-id:(32767 + VLAN ID)</b>. LEAF1 par VLAN 10 → <code>10.255.0.1:32777</code>. LEAF2 par VLAN 20 → <code>10.255.0.2:32787</code>.</li>
<li><b>VRF</b> (IP-VRF, L3VNI) ke liye: <b>router-id:VRF-ID</b>, jaise <code>10.255.0.1:3</code>, jahan VRF ID woh internal number hai jo NX-OS assign karta hai (<code>show vrf</code> dekho).</li>
</ul>
<p>Kyunki RD mein router ID hai, same VNI ke liye har leaf ke routes ka RD alag hota hai. Yeh achha hai: jab do leaves same anycast subnet type 5 ki tarah advertise karte hain, to dono routes route reflector par bache rehte hain aur remote leaves dono use kar sakte hain.</p>

<h3>Route target: tay karta hai kaun import karega</h3>
<p>RT route par laga ek BGP <b>extended community</b> hai. Har VNI aur VRF ki ek <b>export</b> list (jo RTs uske originate kiye routes par lagte hain) aur ek <b>import</b> list (jo RTs woh accept karta hai) hoti hai. Leaf received route ko local VNI ya VRF mein tabhi import karta hai jab route ka kam se kam ek RT us VNI ya VRF ki import list mein ho.</p>
<p>NX-OS par <code>route-target import auto</code> aur <code>route-target export auto</code> (ya <code>route-target both auto</code>) RT ko <b>ASN:VNI</b> ki tarah banate hain. AS 65001 mein VNI 10010 ko <code>65001:10010</code> milta hai aur L3VNI 50001 ko <code>65001:50001</code>. Kyunki iBGP fabric mein har leaf ka ASN same hai, auto RTs saare leaves par apne aap match karte hain, aur log inhe isiliye use karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="RD aur RT ke roles">
<rect x="10" y="20" width="250" height="60" rx="8" fill="#e2e8f0"/><text x="135" y="45" text-anchor="middle" class="svg-ink" font-size="13">RD 10.255.0.2:32777</text><text x="135" y="66" text-anchor="middle" class="svg-muted" font-size="12">route ko unique banata hai</text>
<rect x="380" y="20" width="250" height="60" rx="8" fill="#fde68a"/><text x="505" y="45" text-anchor="middle" class="svg-ink" font-size="13">RT 65001:10010</text><text x="505" y="66" text-anchor="middle" class="svg-muted" font-size="12">import kaun kare, tay karta hai</text>
<rect x="60" y="140" width="220" height="44" rx="8" fill="#bbf7d0"/><text x="170" y="167" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 VNI 10010 import auto</text>
<rect x="360" y="140" width="220" height="44" rx="8" fill="#fed7aa"/><text x="470" y="167" text-anchor="middle" class="svg-ink" font-size="12">LEAF3 import 65001:10100</text>
<line x1="505" y1="80" x2="170" y2="140" stroke="#64748b" stroke-width="2"/><line x1="505" y1="80" x2="470" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="250" y="120" class="svg-accent" font-size="12">match: import hua</text><text x="495" y="120" class="svg-accent" font-size="12">match nahi</text>
</svg><p class="cap">RD sirf route ko label karta hai. RT har local import list se compare hota hai.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! L2VNI: MAC-VRF (lab 2)</span>
evpn
  vni 10010 l2
    rd auto
    route-target import auto
    route-target export auto
<span class="c">! L3VNI wala IP-VRF (lab 3)</span>
vrf context TENANT-A
  vni 50001
  rd auto
  address-family ipv4 unicast
    route-target both auto
    route-target both auto evpn</pre>
<p>VRF ke neeche do lines par dhyan do. <code>route-target both auto</code> classic MPLS VPN (VPNv4) import/export ke liye hai. <code>route-target both auto evpn</code> woh hai jo EVPN type-2 host routes aur type-5 prefixes ko VRF mein import aur export karne ke liye use karta hai. <b>evpn</b> keyword ke bina VRF koi EVPN route import nahi karta. Lab 5 mein bilkul yahi fault hai.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show bgp l2vpn evpn
   Network            Next Hop            Metric     LocPrf     Weight Path
<span class="hl">Route Distinguisher: 10.255.0.1:32777    (L2VNI 10010)</span>
*>l[3]:[0]:[32]:[10.254.0.1]/88
                      10.254.0.1                        100      32768 i
*>i[3]:[0]:[32]:[10.254.0.2]/88
                      10.254.0.2                        100          0 i
Route Distinguisher: 10.255.0.2:32777
*>i[3]:[0]:[32]:[10.254.0.2]/88
                      10.254.0.2                        100          0 i
* i                   10.254.0.2                        100          0 i</pre>
<p>Kaise padhein: LEAF2 ka route LEAF2 ke apne RD ke neeche do baar dikhta hai (har spine ki ek copy) aur ek baar LEAF1 ke local RD ke neeche jis par <b>(L2VNI 10010)</b> tag hai. Woh aakhri copy saboot hai ki RT match hua aur route local VNI mein <b>import</b> hua. Agar RT match nahi karta, to route sirf remote RD ke neeche rehta hai aur local L2VNI section mein sirf aapka apna route dikhta hai.</p>

<div class="eg"><p><b>Worked example: ek digit ka typo.</b> LEAF3 par VNI 10010 ke liye <code>route-target import 65001:10100</code> configure hua. LEAF4 ka type-3 route <code>RT:65001:10010</code> ke saath aata hai. 10100, 10010 nahi hai, isliye kuch import nahi hota: LEAF3 ki flood list mein LEAF4 nahi, LEAF4 se koi remote MAC nahi, aur <code>show nve peers</code> khaali rehta hai jabki BGP healthy hai aur routes table mein dikh rahe hain. Dono leaves ke VLAN 10 ke hosts baat nahi kar paate. Fix hai <code>no route-target import 65001:10100</code> aur phir <code>route-target import auto</code>. Lab 4 mein <code>65001:10099</code> ke saath yahi fault hai.</p></div>

<h3>eBGP fabrics mein RTs</h3>
<p>eBGP design mein har leaf ka apna ASN hota hai, isliye auto RTs alag hote hain (ek leaf par 65011:10010, doosre par 65012:10010) aur kabhi match nahi karenge. Options hain: har jagah same manual RTs, ya neighbor ke <code>address-family l2vpn evpn</code> ke neeche <code>rewrite-evpn-rt-asn</code>, jo received RTs ka ASN hissa local ASN se rewrite karta hai. 4-byte ASN ke saath auto format bhi badalta hai, isliye derived value hamesha BGP table mein verify karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Import problem "theek" karne ke liye RD badalna (yeh ho hi nahi sakta); ek digit alag wala manual RT type karna; VRF mein <code>route-target both auto</code> configure karna par <code>route-target both auto evpn</code> bhoolna; kuch leaves par auto RTs aur kuch par manual RTs mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> RD = uniqueness, RT = import/export policy. L2VNI ka auto RD router-id:(32767 + VLAN) hai; auto RT ASN:VNI hai. Jo sawaal pooche "kaunsi value tay karti hai ki route VNI mein install hoga", use route target chahiye.</p></div>

<div class="scn"><h4>Woh migration jisne ek VLAN tod diya</h4><p>Ek team ne VNI 20050 ko purane template se, jo manual RTs (<code>65001:2050</code>) use karta tha, naye template par migrate kiya jismein <code>route-target both auto</code> (<code>65001:20050</code>) tha. Pehli raat unhone aath leaves badle aur baaki aath agli raat ke liye rakhe. Poore din purane leaves ke hosts naye leaves ke same VLAN ke hosts tak nahi pahunch paaye, jabki BGP bilkul healthy dikh raha tha. <code>show bgp l2vpn evpn</code> mein remote type-3 routes the par local L2VNI RD ke neeche import nahi hue the. Bridge ki tarah unhone naye leaves par <code>auto</code> ke saath <code>route-target import 65001:2050</code> bhi joda jab tak migration poora nahi hua.</p><p><b>Seekh:</b> ek VNI kai RTs import kar sakta hai. Migrations ke dauraan purana aur naya dono RT import karo.</p></div>

<div class="iv"><p class="q">"EVPN mein RD aur RT mein kya farak hai?"</p><p>Strong answer: RD NLRI ke aage lagta hai taaki BGP table mein routes unique hon, aur alag leaves ya tenants ke same MACs ya prefixes takrayein nahi; yeh import ko affect nahi karta. RT ek extended community hai jo control karta hai ki route kaunsa VNI ya VRF export aur import karega. NX-OS par rd auto L2VNIs ke liye router-id:(32767+VLAN) aur VRFs ke liye router-id:VRF-ID deta hai, aur route-target auto ASN:VNI deta hai. Typo wala example do: galat import RT chup-chaap VNI tod deta hai jabki BGP Established rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RD route ko unique banata hai; import kabhi tay nahi karta.</li>
<li>RT extended community hai; import tabhi hota hai jab RT local import list se match kare.</li>
<li>Auto RD: L2VNI ke liye router-id:(32767 + VLAN), VRF ke liye router-id:VRF-ID. Auto RT: ASN:VNI.</li>
<li>VRF ko EVPN routes import karne ke liye route-target both auto evpn chahiye.</li>
<li>Apne RD ke neeche (L2VNI x) tag wali import copy saboot hai ki RT match hua.</li>
</ul></div>
`}};export{e as default};