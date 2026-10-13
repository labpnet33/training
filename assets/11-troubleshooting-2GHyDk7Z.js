var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: walking the three labs`,hi:`Troubleshooting workflow: teeno labs ko walk karna`},body:{en:`
<p>A good doctor does not start with a brain scan. She checks pulse and breathing first, then moves to specialised tests. Overlay troubleshooting is the same: check the underlay pulse first, then the control plane, then the data plane. Skipping steps is how engineers lose an afternoon to a missing OSPF network statement.</p>

<h3>The four-layer workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Overlay troubleshooting workflow">
<rect x="20" y="20" width="140" height="80" rx="8" fill="#e2e8f0"/><text x="90" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Underlay</text><text x="90" y="66" text-anchor="middle" class="svg-muted" font-size="12">ping RLOC / VTEP</text><text x="90" y="84" text-anchor="middle" class="svg-muted" font-size="12">loopback to loopback</text>
<rect x="175" y="20" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="245" y="46" text-anchor="middle" class="svg-ink" font-size="13">2 Register / peers</text><text x="245" y="66" text-anchor="middle" class="svg-muted" font-size="12">show lisp site</text><text x="245" y="84" text-anchor="middle" class="svg-muted" font-size="12">show nve peers</text>
<rect x="330" y="20" width="140" height="80" rx="8" fill="#bae6fd"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">3 Resolve / learn</text><text x="400" y="66" text-anchor="middle" class="svg-muted" font-size="12">map-cache</text><text x="400" y="84" text-anchor="middle" class="svg-muted" font-size="12">MAC on nve1</text>
<rect x="485" y="20" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="555" y="46" text-anchor="middle" class="svg-ink" font-size="13">4 Data plane</text><text x="555" y="66" text-anchor="middle" class="svg-muted" font-size="12">capture 4341 / 4789</text><text x="555" y="84" text-anchor="middle" class="svg-muted" font-size="12">MTU, DF-bit ping</text>
<line x1="160" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><line x1="315" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Stop at the first layer that fails and fix it there.</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">LISP: key, eid-prefix, site-self locator, itr/etr enabled</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">VXLAN: nve up, source loopback routed, VNI match, symmetric peers</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Both: EIDs must NOT appear in the core routing table</text>
</svg><p class="cap">Work left to right. Most overlay tickets die at step 1 or step 2.</p></div>

<h3>Lab 1 walk: LISP map-server and two xTRs</h3>
<ol>
<li><b>Underlay.</b> On XTR1: <code>ping 100.64.3.2</code> and <code>ping 100.64.2.2</code>. Both must work. On CORE: <code>show ip route 10.2.2.0</code> must say "Subnet not in table"; that is correct, not a bug.</li>
<li><b>MS config.</b> Sites SITE-A and SITE-B with key NK-LISP and one eid-prefix each; <code>map-server</code> and <code>map-resolver</code> under <code>service ipv4</code>.</li>
<li><b>xTRs.</b> <code>show ip lisp</code> shows ITR and ETR enabled; <code>show ip lisp database</code> shows site-self; <code>show lisp site</code> on MSMR shows both sites "yes".</li>
<li><b>Resolve.</b> Ping PC2 from PC1 twice; the first attempts time out while the Map-Request and Map-Reply run. Then <code>show ip lisp map-cache</code> on XTR1 shows 10.2.2.0/24 → 100.64.2.2 and XTR2 shows 10.1.1.0/24 → 100.64.1.2.</li>
<li><b>Data plane.</b> Capture on CORE–XTR2: outer IP 100.64.1.2 → 100.64.2.2, UDP destination <b>4341</b>, 8-byte LISP header, inner ICMP 10.1.1.10 → 10.2.2.10. Overhead 20 + 8 + 8 = <b>36</b> bytes.</li>
</ol>

<h3>Lab 2 walk: Troubleshoot · Sites that will not register</h3>
<p>Symptom: PC1 cannot reach PC2 and both sites show "never" on MSMR.</p>
<pre class="out">MSMR# show lisp site
Site Name      Last      Up     Who Last             Inst     EID Prefix
               Register         Registered           ID
<span class="hl">SITE-A         never     no     --                            10.1.1.0/24
SITE-B         never     no     --                            10.2.2.0/24</span>

MSMR# show lisp site name SITE-B
Site name: SITE-B
Allowed configured locators: any
Allowed EID-prefixes:
  EID-prefix: 10.2.2.0/24
    ...
    Registration errors:
<span class="hl">      Authentication failures:   7</span>
      Allowed locators mismatch: 0</pre>
<p><b>Fault 1, SITE-B.</b> Registrations arrive but fail authentication, and the MS logs it. Compare keys: <code>show running-config | section lisp</code> on XTR2 shows <code>etr map-server 100.64.3.2 key NK-L1SP</code> (a digit one instead of the letter I). The task says fix the xTR, not the MS:</p>
<pre class="code">XTR2(config)# router lisp
XTR2(config-router-lisp)# service ipv4
XTR2(config-lisp-srv-ipv4)#  etr map-server 100.64.3.2 key NK-LISP</pre>
<p><b>Fault 2, SITE-A.</b> No error counter increases on the MS: the ETR is not even trying. <code>show ip lisp database</code> on XTR1 tells why:</p>
<pre class="out">XTR1# show ip lisp database
LISP ETR IPv4 Mapping Database for EID-table default (IID 0), LSBs: 0x0, 1 entries

10.1.1.0/24
  Locator       Pri/Wgt  Source     State
<span class="hl">  100.64.1.20     1/100  cfg-addr   site-other, report-reachable</span></pre>
<p>100.64.1.20 is not an address on XTR1 ("site-other"), so the ETR has no local locator to register. Replace the mapping:</p>
<pre class="code">XTR1(config)# router lisp
XTR1(config-router-lisp)# service ipv4
XTR1(config-lisp-srv-ipv4)#  no database-mapping 10.1.1.0/24 100.64.1.20
XTR1(config-lisp-srv-ipv4)#  database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100</pre>
<p>Within a minute <code>show lisp site</code> shows both sites "yes" with Who Last Registered = 100.64.1.2 and 100.64.2.2. Ping twice from PC1 and confirm map-cache entries on both xTRs.</p>

<h3>Lab 3 walk: VXLAN between two VTEPs (flood and learn)</h3>
<ol>
<li><b>Underlay.</b> <code>ping 2.2.2.2 source 1.1.1.1</code> on VTEP1. If it fails, OSPF is not advertising a loopback.</li>
<li><b>Mapping.</b> <code>show nve vni</code> on both: VNI 10010, State Up, mapped to VLAN 10. A different VNI on one side = two separate segments.</li>
<li><b>NVE.</b> <code>show nve peers</code> must list the other VTEP Up on <b>both</b> switches. Empty? Check <code>no shutdown</code> on nve1, <code>source-interface loopback0</code>, and that each side lists the other in <code>ingress-replication</code>.</li>
<li><b>Learning.</b> Ping PC2 from PC1 (same subnet, no gateway). <code>show mac address-table</code> on VTEP1 must show PC2's MAC on <code>nve1(2.2.2.2)</code>.</li>
<li><b>Data plane.</b> Capture on a SPINE link: UDP destination <b>4789</b>, VNI 10010, inner Ethernet PC1 → PC2. Overhead 14 + 20 + 8 + 8 = <b>50</b> bytes; test large packets with a DF-bit ping between loopbacks.</li>
</ol>

<div class="eg"><p><b>Worked example: reading the symptom pattern.</b> "Ping works, large transfers hang" → MTU. "Works one way only" → asymmetric peer list or replication mode. "Nothing works, peers empty" → underlay or nve down. "LISP site never registers, auth failures rising" → key. "Never registers, no errors" → ETR not sending: role disabled or locator not site-self.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing a LISP registration problem by changing the map-server key to match one broken xTR. Now every other site using the correct key fails. Fix the outlier, not the reference.</p></div>

<div class="exam"><p><b>Exam trap.</b> A site with an unknown EID prefix is rejected silently by the MS (no site matches). A wrong key shows as authentication failures. A non-local locator means the ETR never sends. Know which symptom goes with which cause.</p></div>

<div class="scn"><h4>Friday night change, Monday morning outage</h4><p>A change on Friday rotated LISP keys on the map-server for security compliance. By Monday, 40 of 60 branches were unreachable: their registrations had expired three minutes after the change, and map-caches in the hubs had been slowly aging out all weekend. The runbook had listed the MS change but only 20 xTR updates. <code>show lisp site</code> showed 40 sites "no" with authentication failures climbing. The team pushed the new key to the remaining xTRs with automation and all sites registered within a minute.</p><p><b>Lesson:</b> the MS key and every ETR key are one change. Verify with <code>show lisp site</code> before closing the window.</p></div>

<div class="iv"><p class="q">"A LISP site is not registering. How do you troubleshoot it?"</p><p>Strong answer: first check underlay reachability from the ETR's RLOC to the map-server. Then on the MS run show lisp site and the site detail: if authentication failures are increasing, the key differs; if nothing arrives, go to the ETR. On the ETR check show ip lisp for ETR enabled and the map-server address, and show ip lisp database for a site-self locator. Also confirm the EID prefix is inside an eid-prefix of the site. After fixing, confirm "yes" and a Last Register under a minute.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay → registration/peers → resolution/learning → data plane and MTU.</li>
<li>LISP registration failures: wrong key (auth failures), prefix outside the site, non-local locator, role disabled.</li>
<li>VXLAN failures: nve shut, source loopback not routed, VNI mismatch, asymmetric peer list, MTU.</li>
<li>Key tools: show lisp site, show ip lisp database, show ip lisp map-cache, show nve peers, show nve vni, show mac address-table.</li>
<li>Fix the broken device, not the reference configuration.</li>
</ul></div>
`,hi:`
<p>Achha doctor brain scan se shuru nahi karti. Pehle nabz aur saans check karti hai, phir specialised tests par jaati hai. Overlay troubleshooting bhi aisi hi hai: pehle underlay ki nabz check karo, phir control plane, phir data plane. Steps chhodne se hi engineers ek missing OSPF network statement par poori dopahar gawa dete hain.</p>

<h3>Chaar-layer workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Overlay troubleshooting workflow">
<rect x="20" y="20" width="140" height="80" rx="8" fill="#e2e8f0"/><text x="90" y="46" text-anchor="middle" class="svg-ink" font-size="13">1 Underlay</text><text x="90" y="66" text-anchor="middle" class="svg-muted" font-size="12">ping RLOC / VTEP</text><text x="90" y="84" text-anchor="middle" class="svg-muted" font-size="12">loopback se loopback</text>
<rect x="175" y="20" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="245" y="46" text-anchor="middle" class="svg-ink" font-size="13">2 Register / peers</text><text x="245" y="66" text-anchor="middle" class="svg-muted" font-size="12">show lisp site</text><text x="245" y="84" text-anchor="middle" class="svg-muted" font-size="12">show nve peers</text>
<rect x="330" y="20" width="140" height="80" rx="8" fill="#bae6fd"/><text x="400" y="46" text-anchor="middle" class="svg-ink" font-size="13">3 Resolve / learn</text><text x="400" y="66" text-anchor="middle" class="svg-muted" font-size="12">map-cache</text><text x="400" y="84" text-anchor="middle" class="svg-muted" font-size="12">nve1 par MAC</text>
<rect x="485" y="20" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="555" y="46" text-anchor="middle" class="svg-ink" font-size="13">4 Data plane</text><text x="555" y="66" text-anchor="middle" class="svg-muted" font-size="12">capture 4341 / 4789</text><text x="555" y="84" text-anchor="middle" class="svg-muted" font-size="12">MTU, DF-bit ping</text>
<line x1="160" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><line x1="315" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="470" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Jo pehli layer fail ho wahin ruko aur wahin theek karo.</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">LISP: key, eid-prefix, site-self locator, itr/etr enabled</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">VXLAN: nve up, source loopback routed, VNI match, symmetric peers</text>
<text x="320" y="214" text-anchor="middle" class="svg-muted" font-size="12">Dono: EIDs core routing table mein NAHI dikhne chahiye</text>
</svg><p class="cap">Baayein se daayein chalo. Zyada tar overlay tickets step 1 ya step 2 par hi khatam ho jaate hain.</p></div>

<h3>Lab 1 walk: LISP map-server aur do xTRs</h3>
<ol>
<li><b>Underlay.</b> XTR1 par: <code>ping 100.64.3.2</code> aur <code>ping 100.64.2.2</code>. Dono chalne chahiye. CORE par: <code>show ip route 10.2.2.0</code> ko "Subnet not in table" kehna chahiye; yeh sahi hai, bug nahi.</li>
<li><b>MS config.</b> Sites SITE-A aur SITE-B key NK-LISP aur ek-ek eid-prefix ke saath; <code>service ipv4</code> ke neeche <code>map-server</code> aur <code>map-resolver</code>.</li>
<li><b>xTRs.</b> <code>show ip lisp</code> ITR aur ETR enabled dikhata hai; <code>show ip lisp database</code> site-self dikhata hai; MSMR par <code>show lisp site</code> dono sites "yes" dikhata hai.</li>
<li><b>Resolve.</b> PC1 se PC2 ko do baar ping karo; pehli koshishen time out hoti hain jab tak Map-Request aur Map-Reply chalte hain. Phir XTR1 par <code>show ip lisp map-cache</code> 10.2.2.0/24 → 100.64.2.2 dikhata hai aur XTR2 10.1.1.0/24 → 100.64.1.2.</li>
<li><b>Data plane.</b> CORE–XTR2 par capture: outer IP 100.64.1.2 → 100.64.2.2, UDP destination <b>4341</b>, 8-byte LISP header, inner ICMP 10.1.1.10 → 10.2.2.10. Overhead 20 + 8 + 8 = <b>36</b> bytes.</li>
</ol>

<h3>Lab 2 walk: Troubleshoot · Sites jo register nahi ho rahi</h3>
<p>Symptom: PC1 PC2 tak nahi pahunch pata aur MSMR par dono sites "never" dikhti hain.</p>
<pre class="out">MSMR# show lisp site
Site Name      Last      Up     Who Last             Inst     EID Prefix
               Register         Registered           ID
<span class="hl">SITE-A         never     no     --                            10.1.1.0/24
SITE-B         never     no     --                            10.2.2.0/24</span>

MSMR# show lisp site name SITE-B
Site name: SITE-B
Allowed configured locators: any
Allowed EID-prefixes:
  EID-prefix: 10.2.2.0/24
    ...
    Registration errors:
<span class="hl">      Authentication failures:   7</span>
      Allowed locators mismatch: 0</pre>
<p><b>Fault 1, SITE-B.</b> Registrations aa rahe hain lekin authentication fail ho raha hai, aur MS ise log karta hai. Keys milao: XTR2 par <code>show running-config | section lisp</code> <code>etr map-server 100.64.3.2 key NK-L1SP</code> dikhata hai (letter I ki jagah digit one). Task kehta hai xTR theek karo, MS nahi:</p>
<pre class="code">XTR2(config)# router lisp
XTR2(config-router-lisp)# service ipv4
XTR2(config-lisp-srv-ipv4)#  etr map-server 100.64.3.2 key NK-LISP</pre>
<p><b>Fault 2, SITE-A.</b> MS par koi error counter nahi badhta: ETR koshish bhi nahi kar raha. XTR1 par <code>show ip lisp database</code> wajah batata hai:</p>
<pre class="out">XTR1# show ip lisp database
LISP ETR IPv4 Mapping Database for EID-table default (IID 0), LSBs: 0x0, 1 entries

10.1.1.0/24
  Locator       Pri/Wgt  Source     State
<span class="hl">  100.64.1.20     1/100  cfg-addr   site-other, report-reachable</span></pre>
<p>100.64.1.20 XTR1 ka address nahi hai ("site-other"), isliye ETR ke paas register karne ko koi local locator nahi hai. Mapping badlo:</p>
<pre class="code">XTR1(config)# router lisp
XTR1(config-router-lisp)# service ipv4
XTR1(config-lisp-srv-ipv4)#  no database-mapping 10.1.1.0/24 100.64.1.20
XTR1(config-lisp-srv-ipv4)#  database-mapping 10.1.1.0/24 100.64.1.2 priority 1 weight 100</pre>
<p>Ek minute ke andar <code>show lisp site</code> dono sites ko "yes" dikhata hai, Who Last Registered = 100.64.1.2 aur 100.64.2.2. PC1 se do baar ping karo aur dono xTRs par map-cache entries confirm karo.</p>

<h3>Lab 3 walk: do VTEPs ke beech VXLAN (flood and learn)</h3>
<ol>
<li><b>Underlay.</b> VTEP1 par <code>ping 2.2.2.2 source 1.1.1.1</code>. Fail ho to OSPF koi loopback advertise nahi kar raha.</li>
<li><b>Mapping.</b> Dono par <code>show nve vni</code>: VNI 10010, State Up, VLAN 10 se mapped. Ek side alag VNI = do alag segments.</li>
<li><b>NVE.</b> <code>show nve peers</code> ko <b>dono</b> switches par doosra VTEP Up dikhana chahiye. Khaali? nve1 par <code>no shutdown</code>, <code>source-interface loopback0</code>, aur har side ki <code>ingress-replication</code> mein doosra listed hai, yeh check karo.</li>
<li><b>Learning.</b> PC1 se PC2 ping karo (same subnet, gateway nahi). VTEP1 par <code>show mac address-table</code> mein PC2 ka MAC <code>nve1(2.2.2.2)</code> par dikhna chahiye.</li>
<li><b>Data plane.</b> SPINE link par capture: UDP destination <b>4789</b>, VNI 10010, inner Ethernet PC1 → PC2. Overhead 14 + 20 + 8 + 8 = <b>50</b> bytes; loopbacks ke beech DF-bit ping se bade packets test karo.</li>
</ol>

<div class="eg"><p><b>Worked example: symptom pattern padhna.</b> "Ping chalti hai, bade transfers hang" → MTU. "Sirf ek taraf chalta hai" → asymmetric peer list ya replication mode. "Kuch nahi chalta, peers khaali" → underlay ya nve down. "LISP site kabhi register nahi hoti, auth failures badh rahe" → key. "Kabhi register nahi, koi error nahi" → ETR bhej hi nahi raha: role disabled ya locator site-self nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> LISP registration problem ko map-server ki key ek toote xTR se match karne ke liye badal kar theek karna. Ab sahi key use karne wali har doosri site fail hoti hai. Outlier theek karo, reference nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Unknown EID prefix wali site ko MS chupchaap reject karta hai (koi site match nahi). Galat key authentication failures ki tarah dikhti hai. Non-local locator ka matlab ETR kabhi bhejta hi nahi. Kaunsa symptom kis cause ke saath jaata hai, yeh jaano.</p></div>

<div class="scn"><h4>Friday raat ka change, Monday subah ka outage</h4><p>Friday ko security compliance ke liye map-server par LISP keys rotate ki gayi. Monday tak 60 mein se 40 branches unreachable thi: unke registrations change ke teen minute baad expire ho gaye the, aur hubs ke map-caches poore weekend dheere dheere age out ho rahe the. Runbook mein MS change tha lekin sirf 20 xTR updates. <code>show lisp site</code> ne 40 sites "no" dikhayi authentication failures badhte hue. Team ne automation se baaki xTRs par nayi key push ki aur ek minute mein saari sites register ho gayi.</p><p><b>Seekh:</b> MS key aur har ETR key ek hi change hai. Window band karne se pehle <code>show lisp site</code> se verify karo.</p></div>

<div class="iv"><p class="q">"Ek LISP site register nahi ho rahi. Kaise troubleshoot karoge?"</p><p>Strong answer: pehle ETR ke RLOC se map-server tak underlay reachability check karo. Phir MS par show lisp site aur site detail chalao: agar authentication failures badh rahe hain, key alag hai; agar kuch nahi aa raha, ETR par jao. ETR par show ip lisp se ETR enabled aur map-server address, aur show ip lisp database se site-self locator check karo. Yeh bhi confirm karo ki EID prefix site ke kisi eid-prefix ke andar hai. Fix ke baad "yes" aur ek minute se kam Last Register confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay → registration/peers → resolution/learning → data plane aur MTU.</li>
<li>LISP registration failures: galat key (auth failures), site ke bahar prefix, non-local locator, role disabled.</li>
<li>VXLAN failures: nve shut, source loopback routed nahi, VNI mismatch, asymmetric peer list, MTU.</li>
<li>Key tools: show lisp site, show ip lisp database, show ip lisp map-cache, show nve peers, show nve vni, show mac address-table.</li>
<li>Toota device theek karo, reference configuration nahi.</li>
</ul></div>
`}};export{e as default};