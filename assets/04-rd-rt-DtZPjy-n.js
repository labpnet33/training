var e={id:`rd-rt`,h:{en:`Route distinguishers and route targets in the EVPN fabric`,hi:`EVPN fabric mein route distinguishers aur route targets`},body:{en:`
<p>Picture two companies that both have an employee called "Rahul, desk 14". If the post office filed letters only by name and desk, the mail would be mixed up. The post office adds a company code in front: "A-Rahul-14" and "B-Rahul-14". That code is the <b>route distinguisher (RD)</b>: it makes similar-looking routes unique. A second thing is also needed: a rule that says which company reads which mail. That is the <b>route target (RT)</b>, a tag on the route that tells a device "import me" or "ignore me".</p>

<h3>Two different jobs</h3>
<table class="cmp"><tr><th></th><th>RD</th><th>RT</th></tr>
<tr><td>Purpose</td><td>Make a route unique in BGP</td><td>Control who imports the route</td></tr>
<tr><td>Where it lives</td><td>Part of the route key</td><td>Extended community on the route</td></tr>
<tr><td>Must match across devices?</td><td>No (usually different per leaf)</td><td>Export on one side must equal import on the other</td></tr>
<tr><td>If wrong</td><td>Routes overwrite or duplicate; troubleshooting is confusing</td><td>Route is received but never installed</td></tr>
</table>

<h3>The values in our fabric</h3>
<ul>
<li><b>L2 EVI (MAC-VRF):</b> RD <code>65001:10</code> for VLAN 10 and <code>65001:20</code> for VLAN 20, RT <code>65001:10</code> and <code>65001:20</code>. They can also be left automatic (derived from the AS and the EVI), which gives the same shape.</li>
<li><b>Tenant VRF TENANT-A (IP-VRF):</b> RD <code>65001:&lt;leaf number&gt;</code>, so LEAF1 uses 65001:1, LEAF2 65001:2, LEAF3 65001:3. All leaves share the same RT <code>65001:50901</code> for import and export.</li>
</ul>
<p>The RD differs per leaf on purpose. If every leaf used the same RD, a type-5 route for the same prefix from two leaves would look like the same route, and a route reflector would keep only one (best path) instead of advertising both. A distinct RD per leaf lets the RR carry both so receivers can load-share.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="RT import decision">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 exports</text><text x="105" y="60" text-anchor="middle" class="svg-accent" font-size="12">RT 65001:50901</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">RR reflects</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">no RT check needed</text>
<rect x="450" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 imports</text><text x="535" y="60" text-anchor="middle" class="svg-accent" font-size="12">RT 65001:50901 = match</text>
<rect x="450" y="100" width="170" height="60" rx="8" fill="#fed7aa"/><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="12">LEAF3 imports</text><text x="535" y="140" text-anchor="middle" class="svg-accent" font-size="12">RT 65001:50999 = drop</text>
<g stroke="#64748b" stroke-width="2"><line x1="190" y1="50" x2="235" y2="50"/><line x1="405" y1="50" x2="450" y2="50"/><line x1="405" y1="62" x2="450" y2="125"/></g>
</svg><p class="cap">Same route, two receivers: one installs it, the other keeps it in the BGP table but does not use it.</p></div>

<h3>Configuration</h3>
<pre class="code">l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
 rd 65001:10
 route-target export 65001:10
 route-target import 65001:10
vrf definition TENANT-A
 rd 65001:1
 address-family ipv4
  route-target export 65001:50901
  route-target import 65001:50901
  route-target export 65001:50901 stitching
  route-target import 65001:50901 stitching
 exit-address-family</pre>
<p>When <code>rd</code> or <code>route-target</code> is omitted in the EVI, the platform derives automatic values; in our labs both styles are valid, but a router with automatic values on one side and manual on the other must be checked carefully. Always compare what you <b>see</b> in <code>show l2vpn evpn evi detail</code>, not what you remember configuring.</p>

<pre class="out">LEAF2# show l2vpn evpn evi 10 detail
EVPN instance:       10 (VLAN Based)
  RD:                65001:10 (manual)
  Import-RTs:        <span class="hl">65001:10</span>
  Export-RTs:        <span class="hl">65001:10</span>
  Per-EVI Label:     none
  State:             Established
  Encapsulation:     vxlan
  Vlan:              10
  VNI:               10010</pre>

<div class="eg"><p><b>Worked example: finding an RT mismatch.</b> H2's MAC never appears on LEAF1. On LEAF1, <code>show bgp l2vpn evpn route-type 2</code> shows the route from LEAF2 with RT 65001:11, while LEAF1's EVI 10 imports only 65001:10. The route is in the BGP table (visible with <code>show bgp l2vpn evpn</code>) but not in the EVI. Fix the export on LEAF2 or the import on LEAF1 so they are equal.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the RD like the tag that "connects" two leaves. Two leaves with different RDs but matching RTs interoperate perfectly. Two leaves with matching RDs but different RTs do not.</p></div>

<div class="exam"><p><b>Exam trap.</b> The same RT can import both L2 and L3 routes if you reuse it; but the best practice in this track keeps L2 RTs (per VLAN) and the L3 RT (per VRF) different. The stitching RTs on the VRF are for routes that enter or leave the EVPN domain via the L3VNI.</p></div>

<div class="scn"><h4>The route that was everywhere but nowhere</h4><p>A new tenant VLAN worked on LEAF1 and LEAF2 but not LEAF3. LEAF3 saw the type-2 route in <code>show bgp l2vpn evpn</code> but nothing in the MAC table. Its EVI had been created from a template with automatic RT, while the other two had manual RT 65001:30. Aligning LEAF3 to 65001:30 made the MAC appear instantly.</p><p><b>Lesson:</b> "route is in BGP" is not "route is installed"; import policy sits between them.</p></div>

<div class="iv"><p class="q">"What is the difference between an RD and an RT, and why do leaves use different RDs?"</p><p>Strong answer: the RD makes the route key unique across instances and devices; the RT controls import and export between instances. Leaves use different RDs so route reflectors treat identical prefixes from two leaves as distinct routes and advertise both, enabling multipath and avoiding best-path hiding.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RD = uniqueness; RT = import/export control.</li>
<li>Export RT on one leaf must equal import RT on the other.</li>
<li>Per-leaf RD in the VRF (65001:1, :2, :3) keeps routes distinct at the RR.</li>
<li>If the route is in BGP but not installed, check RT first.</li>
</ul></div>
`,hi:`
<p>Do companies socho jinke paas "Rahul, desk 14" naam ka employee hai. Agar post office letters sirf naam aur desk se file kare to mail mix ho jaayegi. Post office aage company code jodta hai: "A-Rahul-14" aur "B-Rahul-14". Yeh code <b>route distinguisher (RD)</b> hai: yeh milte-julte routes ko unique banata hai. Ek doosri cheez bhi chahiye: ek rule jo bataye kaunsi company kaunsi mail padhe. Yeh <b>route target (RT)</b> hai, route par ek tag jo device ko batata hai "mujhe import karo" ya "mujhe ignore karo".</p>

<h3>Do alag kaam</h3>
<table class="cmp"><tr><th></th><th>RD</th><th>RT</th></tr>
<tr><td>Purpose</td><td>BGP mein route ko unique banana</td><td>Kaun route import kare yeh control karna</td></tr>
<tr><td>Kahan rehta hai</td><td>Route key ka hissa</td><td>Route par extended community</td></tr>
<tr><td>Devices ke beech match zaroori?</td><td>Nahi (aam taur par har leaf par alag)</td><td>Ek side ka export doosri side ke import ke barabar hona chahiye</td></tr>
<tr><td>Galat ho to</td><td>Routes overwrite ya duplicate; troubleshooting confusing</td><td>Route receive hota hai lekin install nahi hota</td></tr>
</table>

<h3>Hamare fabric ki values</h3>
<ul>
<li><b>L2 EVI (MAC-VRF):</b> VLAN 10 ke liye RD <code>65001:10</code> aur VLAN 20 ke liye <code>65001:20</code>, RT <code>65001:10</code> aur <code>65001:20</code>. Inhe automatic bhi chhoda ja sakta hai (AS aur EVI se derive), jo wahi shape deta hai.</li>
<li><b>Tenant VRF TENANT-A (IP-VRF):</b> RD <code>65001:&lt;leaf number&gt;</code>, yaani LEAF1 65001:1, LEAF2 65001:2, LEAF3 65001:3. Saare leaves import aur export ke liye same RT <code>65001:50901</code> use karte hain.</li>
</ul>
<p>RD jaan-boojh kar har leaf par alag hai. Agar har leaf same RD use kare, to do leaves ka same prefix ka type-5 route ek hi route lagega, aur route reflector dono advertise karne ki jagah sirf ek (best path) rakhega. Har leaf ka alag RD RR ko dono carry karne deta hai taaki receivers load-share kar saken.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="RT import decision">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 export</text><text x="105" y="60" text-anchor="middle" class="svg-accent" font-size="12">RT 65001:50901</text>
<rect x="235" y="20" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">RR reflect karta hai</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">RT check nahi</text>
<rect x="450" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 import</text><text x="535" y="60" text-anchor="middle" class="svg-accent" font-size="12">RT 65001:50901 = match</text>
<rect x="450" y="100" width="170" height="60" rx="8" fill="#fed7aa"/><text x="535" y="122" text-anchor="middle" class="svg-ink" font-size="12">LEAF3 import</text><text x="535" y="140" text-anchor="middle" class="svg-accent" font-size="12">RT 65001:50999 = drop</text>
<g stroke="#64748b" stroke-width="2"><line x1="190" y1="50" x2="235" y2="50"/><line x1="405" y1="50" x2="450" y2="50"/><line x1="405" y1="62" x2="450" y2="125"/></g>
</svg><p class="cap">Ek hi route, do receivers: ek install karta hai, doosra BGP table mein rakhta hai lekin use nahi karta.</p></div>

<h3>Configuration</h3>
<pre class="code">l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
 rd 65001:10
 route-target export 65001:10
 route-target import 65001:10
vrf definition TENANT-A
 rd 65001:1
 address-family ipv4
  route-target export 65001:50901
  route-target import 65001:50901
  route-target export 65001:50901 stitching
  route-target import 65001:50901 stitching
 exit-address-family</pre>
<p>EVI mein <code>rd</code> ya <code>route-target</code> omit karne par platform automatic values derive karta hai; hamare labs mein dono styles valid hain, lekin ek side automatic aur doosri manual ho to dhyan se check karna padta hai. Hamesha woh compare karo jo <b>dikh raha hai</b> <code>show l2vpn evpn evi detail</code> mein, woh nahi jo aapko configure karna yaad hai.</p>

<pre class="out">LEAF2# show l2vpn evpn evi 10 detail
EVPN instance:       10 (VLAN Based)
  RD:                65001:10 (manual)
  Import-RTs:        <span class="hl">65001:10</span>
  Export-RTs:        <span class="hl">65001:10</span>
  Per-EVI Label:     none
  State:             Established
  Encapsulation:     vxlan
  Vlan:              10
  VNI:               10010</pre>

<div class="eg"><p><b>Worked example: RT mismatch dhoondhna.</b> H2 ka MAC LEAF1 par kabhi nahi aata. LEAF1 par <code>show bgp l2vpn evpn route-type 2</code> LEAF2 ka route RT 65001:11 ke saath dikhata hai, jabki LEAF1 ka EVI 10 sirf 65001:10 import karta hai. Route BGP table mein hai (<code>show bgp l2vpn evpn</code> se dikhta hai) lekin EVI mein nahi. LEAF2 par export ya LEAF1 par import theek karo taaki barabar hon.</p></div>

<div class="warn"><p><b>Common galti.</b> RD ko woh tag samajhna jo do leaves ko "connect" karta hai. Alag RDs lekin matching RTs wale do leaves perfect interoperate karte hain. Matching RDs lekin alag RTs wale nahi karte.</p></div>

<div class="exam"><p><b>Exam trap.</b> Same RT reuse karo to woh L2 aur L3 dono routes import kar sakta hai; lekin is track ka best practice L2 RTs (per VLAN) aur L3 RT (per VRF) ko alag rakhta hai. VRF par stitching RTs un routes ke liye hain jo L3VNI se EVPN domain mein aate ya jaate hain.</p></div>

<div class="scn"><h4>Route jo har jagah tha aur kahin nahi</h4><p>Naya tenant VLAN LEAF1 aur LEAF2 par chala lekin LEAF3 par nahi. LEAF3 ne <code>show bgp l2vpn evpn</code> mein type-2 route dekha lekin MAC table mein kuch nahi. Uska EVI automatic RT wale template se bana tha, jabki baaki do ke paas manual RT 65001:30 tha. LEAF3 ko 65001:30 par align karte hi MAC turant aa gaya.</p><p><b>Seekh:</b> "route BGP mein hai" ka matlab "route installed hai" nahi; import policy dono ke beech hoti hai.</p></div>

<div class="iv"><p class="q">"RD aur RT mein kya fark hai, aur leaves alag RDs kyun use karte hain?"</p><p>Strong answer: RD route key ko instances aur devices ke beech unique banata hai; RT instances ke beech import aur export control karta hai. Leaves alag RDs use karte hain taaki route reflectors do leaves ke identical prefixes ko alag routes maanein aur dono advertise karein, jisse multipath milta hai aur best-path hiding se bachte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RD = uniqueness; RT = import/export control.</li>
<li>Ek leaf ka export RT doosre leaf ke import RT ke barabar hona chahiye.</li>
<li>VRF mein per-leaf RD (65001:1, :2, :3) RR par routes ko alag rakhta hai.</li>
<li>Route BGP mein hai lekin installed nahi, to pehle RT check karo.</li>
</ul></div>
`}};export{e as default};