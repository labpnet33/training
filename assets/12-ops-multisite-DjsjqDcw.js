var e={id:`ops-multisite`,h:{en:`Operating ACI: faults, health, audit, troubleshooting tools, rollback and Multi-Pod vs Multi-Site`,hi:`ACI operate karna: faults, health, audit, troubleshooting tools, rollback aur Multi-Pod vs Multi-Site`},body:{en:`
<p>A modern car does not wait for the engine to die. The dashboard shows warning lights with a clear meaning, a service score, and a log of every repair. ACI gives the same to network operators: <b>faults</b> are the warning lights, <b>health scores</b> summarise how bad things are, the <b>audit log</b> records every change, and a set of built-in tools shows exactly where a packet is dropped.</p>

<h3>Faults</h3>
<p>A <b>fault</b> (class faultInst) is attached to the object it concerns, so its DN tells you exactly where the problem is. Each fault has a <b>code</b> (for example F0467), a <b>severity</b> (critical, major, minor, warning), a <b>cause</b> and a description. Faults move through a lifecycle so that short blips do not raise alarms:</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Fault lifecycle">
<rect x="10" y="60" width="110" height="44" rx="8" fill="#fde68a"/><text x="65" y="80" text-anchor="middle" class="svg-ink" font-size="13">Soaking</text><text x="65" y="96" text-anchor="middle" class="svg-muted" font-size="12">condition seen</text>
<rect x="165" y="60" width="110" height="44" rx="8" fill="#fed7aa"/><text x="220" y="80" text-anchor="middle" class="svg-ink" font-size="13">Raised</text><text x="220" y="96" text-anchor="middle" class="svg-muted" font-size="12">still present</text>
<rect x="320" y="60" width="140" height="44" rx="8" fill="#bae6fd"/><text x="390" y="80" text-anchor="middle" class="svg-ink" font-size="13">Raised-Clearing</text><text x="390" y="96" text-anchor="middle" class="svg-muted" font-size="12">condition gone</text>
<rect x="505" y="60" width="125" height="44" rx="8" fill="#bbf7d0"/><text x="567" y="80" text-anchor="middle" class="svg-ink" font-size="13">Retaining</text><text x="567" y="96" text-anchor="middle" class="svg-muted" font-size="12">kept, then history</text>
<line x1="120" y1="82" x2="165" y2="82" stroke="#64748b" stroke-width="2"/><line x1="275" y1="82" x2="320" y2="82" stroke="#64748b" stroke-width="2"/><line x1="460" y1="82" x2="505" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="142" y="130" text-anchor="middle" class="svg-accent" font-size="12">soak timer</text><text x="297" y="130" text-anchor="middle" class="svg-accent" font-size="12">cleared</text><text x="482" y="130" text-anchor="middle" class="svg-accent" font-size="12">clear timer</text>
</svg><p class="cap">Soaking filters flapping conditions; retaining keeps a cleared fault visible for a while so you can still see what happened.</p></div>

<pre class="out">APIC1# show faults
 Code              : F0532
 Severity          : major
 Lifecycle         : Raised
 DN                : topology/pod-1/node-102/sys/phys-[eth1/2]/phys
 Cause             : interface-physical-down
 Description       : <span class="hl">Port is down, reason:link-failure(connected), used by:EPG</span></pre>
<p>Start every ticket at <b>System → Faults</b>, or the Faults tab of the tenant, EPG or node. Sort by severity, read the DN, and the object to fix is usually obvious.</p>

<h3>Health scores</h3>
<p>Every object has a <b>health score</b> from 0 to 100 (100 = perfect), computed from its own faults (weighted by severity) and those of its children. Scores roll up: EPG → application profile → tenant; interface → leaf → pod → fabric. The dashboards (System → Dashboard, Tenants → tenant → Dashboard) let you see "the payments application dropped to 62" before users call. Health is a pointer, not a diagnosis: always drill down to the faults behind it.</p>

<h3>Audit logs and events</h3>
<ul>
<li><b>Audit log</b> (class aaaModLR): every creation, modification and deletion, with user, time and the DN changed. System → History → Audit Log, or the History tab of any object.</li>
<li><b>Events</b> (class eventRecord): things that happened, such as a link going up or down or an endpoint moving. System → History → Events.</li>
</ul>
<pre class="out">APIC1# moquery -c aaaModLR -f 'aaa.ModLR.affected*"APP-BD"'
# aaa.ModLR
affected     : uni/tn-NK-PROD/BD-APP-BD/subnet-[10.1.2.1/24]
created      : 2026-09-28T23:41:07.112+05:30
descr        : Subnet 10.1.2.1/24 deleted
ind          : deletion
<span class="hl">user         : ops-contractor</span></pre>

<h3>Troubleshooting tools</h3>
<table class="cmp"><tr><th>Tool</th><th>Where</th><th>Answers</th></tr>
<tr><td>EP Tracker</td><td>Operations → EP Tracker</td><td>Where is this IP or MAC now, and where was it before?</td></tr>
<tr><td>Visibility &amp; Troubleshooting</td><td>Operations → Visibility &amp; Troubleshooting</td><td>For a source and destination endpoint: the path, faults, drops, contracts and a traceroute on one page</td></tr>
<tr><td>Atomic counters</td><td>Tenant troubleshooting policies</td><td>Are packets between two endpoints or EPGs lost inside the fabric?</td></tr>
<tr><td>SPAN / ERSPAN</td><td>Access, fabric or tenant SPAN policies</td><td>Copy traffic to an analyser</td></tr>
<tr><td>Capacity Dashboard</td><td>Operations → Capacity Dashboard</td><td>Are TCAM, endpoints or VLANs close to the limit?</td></tr>
<tr><td>Leaf CLI</td><td>SSH to the leaf</td><td>show endpoint, show zoning-rule, packet-loss log</td></tr>
</table>

<h3>Configuration snapshots and rollback</h3>
<p>Before any change, take a <b>snapshot</b>: Admin → Config Rollbacks → Create a snapshot now (or schedule them with a configuration export policy that has <i>Snapshot</i> enabled). The same page can <b>compare</b> two snapshots and show every object added, changed or removed, and can <b>roll back</b> the fabric to a snapshot. Rollback restores the whole policy to that point in time, so any valid change made since then is undone too; for a small mistake, a targeted fix is usually safer.</p>

<h3>Multi-Pod versus Multi-Site (concept level)</h3>
<table class="cmp"><tr><th></th><th>Multi-Pod</th><th>Multi-Site</th></tr>
<tr><td>APIC clusters</td><td>One cluster for all pods</td><td>One cluster per site (independent fabrics)</td></tr>
<tr><td>Management</td><td>Single APIC, one policy</td><td>Nexus Dashboard Orchestrator (NDO) pushes templates to each site's APIC</td></tr>
<tr><td>Inter-connect</td><td>IPN: OSPF to spines, PIM Bidir for BUM, DHCP relay, larger MTU</td><td>ISN: OSPF to spines and larger MTU; no multicast needed (headend replication)</td></tr>
<tr><td>Fault domain</td><td>One availability zone (one change domain)</td><td>Separate availability zones; a bad change stays local unless pushed everywhere</td></tr>
<tr><td>Typical use</td><td>Rooms or buildings of one DC, metro campus</td><td>Different data centers, disaster recovery, regions</td></tr>
</table>
<p>In Multi-Site the spines translate VNIDs and pcTags between sites (namespace normalisation), because each site allocates its own. <b>Remote leaf</b> is a third option: a single leaf pair at a small location, managed by the main pod over a routed network.</p>

<div class="eg"><p><b>Worked example.</b> Tenant NK-PROD health drops from 100 to 72 at 23:45. Drill-down: application profile ECOM 72, EPG APP 72, one major fault F0532 on node 102 eth1/2 (used by EPG). EP Tracker shows APP1's last activity at 23:44. The audit log shows no changes in 24 hours. Conclusion: a physical problem, not a configuration one. The DC technician reseats the cable, the fault goes Raised-Clearing, and health returns to 100.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ignoring warning-level faults for months until nobody notices a new one. Rolling back a whole fabric to fix one object. Treating Multi-Pod as a disaster-recovery design: one APIC cluster means one change domain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Fault lifecycle states: soaking, raised, raised-clearing, retaining. Health scores run 0-100 and roll up. Multi-Pod = one APIC cluster with an IPN that needs multicast (PIM Bidir); Multi-Site = several APIC clusters coordinated by NDO over an ISN without multicast.</p></div>

<div class="scn"><h4>The midnight subnet deletion</h4><p>In the Lab 5 story, CHG-2210 "cleaned up" tenant NK-PROD at night and the shop went down without a single fault. The next morning the engineer opened the History tab of APP-BD: the audit log showed that user ops-contractor had deleted subnet 10.1.2.1/24 and created 10.1.20.1/24 at 23:41, and had removed the consumed contract from EPG WEB. A full rollback to the 22:00 snapshot would also have undone two valid changes made later for another tenant, so the engineer used the snapshot comparison only as a checklist, restored the subnet and the consumed contract by hand, and verified with curl and show zoning-rule.</p><p><b>Lesson:</b> the audit log tells you who changed what; snapshots tell you what it looked like before; choose targeted repair over blind rollback.</p></div>

<div class="iv"><p class="q">"How do you troubleshoot a connectivity problem between two endpoints in ACI?"</p><p>Strong answer: start with faults and health on the tenant and EPGs; check the audit log for recent changes; locate both endpoints with EP Tracker or show endpoint (learned? right EPG, leaf and VLAN?); check forwarding (BD subnet, gateway, pervasive route); check policy (contract provider and consumer, show zoning-rule, packet-loss log); and use Visibility &amp; Troubleshooting or atomic counters for drops inside the fabric. Mention snapshots before changes and targeted fixes over full rollback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Faults sit on the affected object, have a code, severity and lifecycle (soaking, raised, raised-clearing, retaining).</li>
<li>Health scores (0-100) roll up from objects to tenants and the fabric; drill down to faults.</li>
<li>The audit log (aaaModLR) records every change; events record what happened.</li>
<li>Tools: EP Tracker, Visibility &amp; Troubleshooting, atomic counters, SPAN, capacity dashboard; snapshots allow compare and rollback.</li>
<li>Multi-Pod: one APIC cluster, IPN with multicast. Multi-Site: many clusters, NDO, ISN without multicast.</li>
</ul></div>
`,hi:`
<p>Modern car engine ke marne ka intezaar nahi karti. Dashboard par saaf matlab wali warning lights, ek service score, aur har repair ka log dikhta hai. ACI network operators ko yahi deta hai: <b>faults</b> warning lights hain, <b>health scores</b> batate hain ki haalat kitni kharab hai, <b>audit log</b> har change record karta hai, aur built-in tools ka ek set bilkul dikhata hai ki packet kahan drop hota hai.</p>

<h3>Faults</h3>
<p><b>Fault</b> (class faultInst) us object se juda hota hai jiske baare mein hai, isliye uska DN bilkul batata hai ki problem kahan hai. Har fault ka ek <b>code</b> (jaise F0467), ek <b>severity</b> (critical, major, minor, warning), ek <b>cause</b> aur description hota hai. Faults ek lifecycle se guzarte hain taaki chhote blips alarm na banayein:</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Fault lifecycle">
<rect x="10" y="60" width="110" height="44" rx="8" fill="#fde68a"/><text x="65" y="80" text-anchor="middle" class="svg-ink" font-size="13">Soaking</text><text x="65" y="96" text-anchor="middle" class="svg-muted" font-size="12">condition dikhi</text>
<rect x="165" y="60" width="110" height="44" rx="8" fill="#fed7aa"/><text x="220" y="80" text-anchor="middle" class="svg-ink" font-size="13">Raised</text><text x="220" y="96" text-anchor="middle" class="svg-muted" font-size="12">abhi bhi hai</text>
<rect x="320" y="60" width="140" height="44" rx="8" fill="#bae6fd"/><text x="390" y="80" text-anchor="middle" class="svg-ink" font-size="13">Raised-Clearing</text><text x="390" y="96" text-anchor="middle" class="svg-muted" font-size="12">condition gayi</text>
<rect x="505" y="60" width="125" height="44" rx="8" fill="#bbf7d0"/><text x="567" y="80" text-anchor="middle" class="svg-ink" font-size="13">Retaining</text><text x="567" y="96" text-anchor="middle" class="svg-muted" font-size="12">rakha, phir history</text>
<line x1="120" y1="82" x2="165" y2="82" stroke="#64748b" stroke-width="2"/><line x1="275" y1="82" x2="320" y2="82" stroke="#64748b" stroke-width="2"/><line x1="460" y1="82" x2="505" y2="82" stroke="#64748b" stroke-width="2"/>
<text x="142" y="130" text-anchor="middle" class="svg-accent" font-size="12">soak timer</text><text x="297" y="130" text-anchor="middle" class="svg-accent" font-size="12">cleared</text><text x="482" y="130" text-anchor="middle" class="svg-accent" font-size="12">clear timer</text>
</svg><p class="cap">Soaking flap karti conditions ko filter karta hai; retaining clear hue fault ko kuch der dikhata hai taaki aap dekh sako kya hua tha.</p></div>

<pre class="out">APIC1# show faults
 Code              : F0532
 Severity          : major
 Lifecycle         : Raised
 DN                : topology/pod-1/node-102/sys/phys-[eth1/2]/phys
 Cause             : interface-physical-down
 Description       : <span class="hl">Port is down, reason:link-failure(connected), used by:EPG</span></pre>
<p>Har ticket <b>System → Faults</b> se shuru karo, ya tenant, EPG ya node ke Faults tab se. Severity se sort karo, DN padho, aur theek karne wala object aam taur par saaf dikh jaata hai.</p>

<h3>Health scores</h3>
<p>Har object ka 0 se 100 tak ka <b>health score</b> hota hai (100 = perfect), jo uske apne faults (severity se weighted) aur uske children ke faults se banta hai. Scores upar roll hote hain: EPG → application profile → tenant; interface → leaf → pod → fabric. Dashboards (System → Dashboard, Tenants → tenant → Dashboard) aapko users ke call karne se pehle dikhate hain ki "payments application 62 par gir gayi". Health ek pointer hai, diagnosis nahi: hamesha uske peeche ke faults tak drill down karo.</p>

<h3>Audit logs aur events</h3>
<ul>
<li><b>Audit log</b> (class aaaModLR): har creation, modification aur deletion, user, time aur badle gaye DN ke saath. System → History → Audit Log, ya kisi bhi object ka History tab.</li>
<li><b>Events</b> (class eventRecord): jo cheezein hui, jaise link up ya down hona ya endpoint ka move karna. System → History → Events.</li>
</ul>
<pre class="out">APIC1# moquery -c aaaModLR -f 'aaa.ModLR.affected*"APP-BD"'
# aaa.ModLR
affected     : uni/tn-NK-PROD/BD-APP-BD/subnet-[10.1.2.1/24]
created      : 2026-09-28T23:41:07.112+05:30
descr        : Subnet 10.1.2.1/24 deleted
ind          : deletion
<span class="hl">user         : ops-contractor</span></pre>

<h3>Troubleshooting tools</h3>
<table class="cmp"><tr><th>Tool</th><th>Kahan</th><th>Kya batata hai</th></tr>
<tr><td>EP Tracker</td><td>Operations → EP Tracker</td><td>Yeh IP ya MAC abhi kahan hai, aur pehle kahan tha?</td></tr>
<tr><td>Visibility &amp; Troubleshooting</td><td>Operations → Visibility &amp; Troubleshooting</td><td>Source aur destination endpoint ke liye: path, faults, drops, contracts aur traceroute ek page par</td></tr>
<tr><td>Atomic counters</td><td>Tenant troubleshooting policies</td><td>Kya do endpoints ya EPGs ke beech packets fabric ke andar lost ho rahe hain?</td></tr>
<tr><td>SPAN / ERSPAN</td><td>Access, fabric ya tenant SPAN policies</td><td>Traffic ko analyser tak copy karo</td></tr>
<tr><td>Capacity Dashboard</td><td>Operations → Capacity Dashboard</td><td>Kya TCAM, endpoints ya VLANs limit ke paas hain?</td></tr>
<tr><td>Leaf CLI</td><td>Leaf par SSH</td><td>show endpoint, show zoning-rule, packet-loss log</td></tr>
</table>

<h3>Configuration snapshots aur rollback</h3>
<p>Kisi bhi change se pehle <b>snapshot</b> lo: Admin → Config Rollbacks → Create a snapshot now (ya <i>Snapshot</i> enabled wali configuration export policy se schedule karo). Wahi page do snapshots <b>compare</b> karke har added, changed ya removed object dikha sakta hai, aur fabric ko kisi snapshot par <b>roll back</b> kar sakta hai. Rollback poori policy ko us point in time par restore karta hai, isliye uske baad ka har valid change bhi undo ho jaata hai; chhoti galti ke liye targeted fix aam taur par zyada safe hai.</p>

<h3>Multi-Pod vs Multi-Site (concept level)</h3>
<table class="cmp"><tr><th></th><th>Multi-Pod</th><th>Multi-Site</th></tr>
<tr><td>APIC clusters</td><td>Saare pods ke liye ek cluster</td><td>Har site ka ek cluster (independent fabrics)</td></tr>
<tr><td>Management</td><td>Single APIC, ek policy</td><td>Nexus Dashboard Orchestrator (NDO) har site ke APIC par templates push karta hai</td></tr>
<tr><td>Inter-connect</td><td>IPN: spines tak OSPF, BUM ke liye PIM Bidir, DHCP relay, bada MTU</td><td>ISN: spines tak OSPF aur bada MTU; multicast ki zaroorat nahi (headend replication)</td></tr>
<tr><td>Fault domain</td><td>Ek availability zone (ek change domain)</td><td>Alag availability zones; bura change local rehta hai jab tak har jagah push na ho</td></tr>
<tr><td>Typical use</td><td>Ek DC ke rooms ya buildings, metro campus</td><td>Alag data centers, disaster recovery, regions</td></tr>
</table>
<p>Multi-Site mein spines sites ke beech VNIDs aur pcTags translate karte hain (namespace normalisation), kyunki har site apne allocate karti hai. <b>Remote leaf</b> teesra option hai: chhoti location par ek single leaf pair, routed network par main pod se managed.</p>

<div class="eg"><p><b>Worked example.</b> Tenant NK-PROD ki health 23:45 par 100 se 72 par girti hai. Drill-down: application profile ECOM 72, EPG APP 72, node 102 eth1/2 par ek major fault F0532 (EPG dwara used). EP Tracker APP1 ki aakhri activity 23:44 dikhata hai. Audit log 24 ghante mein koi change nahi dikhata. Conclusion: physical problem, configuration wali nahi. DC technician cable reseat karta hai, fault Raised-Clearing mein jaata hai, aur health 100 par wapas aati hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Warning-level faults ko mahino ignore karna jab tak naya fault kisi ko dikhe hi nahi. Ek object theek karne ke liye poore fabric ko roll back karna. Multi-Pod ko disaster-recovery design samajhna: ek APIC cluster matlab ek change domain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Fault lifecycle states: soaking, raised, raised-clearing, retaining. Health scores 0-100 chalte hain aur roll up hote hain. Multi-Pod = ek APIC cluster aur IPN jise multicast (PIM Bidir) chahiye; Multi-Site = kai APIC clusters jinhe NDO coordinate karta hai, bina multicast wale ISN par.</p></div>

<div class="scn"><h4>Aadhi raat ka subnet deletion</h4><p>Lab 5 ki kahani mein, CHG-2210 ne raat ko tenant NK-PROD ka "cleanup" kiya aur shop bina ek bhi fault ke down ho gayi. Agli subah engineer ne APP-BD ka History tab khola: audit log ne dikhaya ki user ops-contractor ne 23:41 par subnet 10.1.2.1/24 delete karke 10.1.20.1/24 banaya tha, aur EPG WEB se consumed contract hata diya tha. 22:00 ke snapshot par full rollback baad mein doosre tenant ke liye kiye gaye do valid changes bhi undo kar deta, isliye engineer ne snapshot comparison ko sirf checklist ki tarah use kiya, subnet aur consumed contract haath se restore kiye, aur curl aur show zoning-rule se verify kiya.</p><p><b>Seekh:</b> audit log batata hai kisne kya badla; snapshots batate hain pehle kaisa dikhta tha; blind rollback ki jagah targeted repair chuno.</p></div>

<div class="iv"><p class="q">"ACI mein do endpoints ke beech connectivity problem kaise troubleshoot karte ho?"</p><p>Strong answer: tenant aur EPGs par faults aur health se shuru karo; recent changes ke liye audit log check karo; dono endpoints ko EP Tracker ya show endpoint se locate karo (learned? sahi EPG, leaf aur VLAN?); forwarding check karo (BD subnet, gateway, pervasive route); policy check karo (contract provider aur consumer, show zoning-rule, packet-loss log); aur fabric ke andar drops ke liye Visibility &amp; Troubleshooting ya atomic counters use karo. Changes se pehle snapshots aur full rollback ki jagah targeted fixes ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Faults affected object par hote hain, unka code, severity aur lifecycle hota hai (soaking, raised, raised-clearing, retaining).</li>
<li>Health scores (0-100) objects se tenants aur fabric tak roll up hote hain; faults tak drill down karo.</li>
<li>Audit log (aaaModLR) har change record karta hai; events record karte hain kya hua.</li>
<li>Tools: EP Tracker, Visibility &amp; Troubleshooting, atomic counters, SPAN, capacity dashboard; snapshots compare aur rollback allow karte hain.</li>
<li>Multi-Pod: ek APIC cluster, multicast wala IPN. Multi-Site: kai clusters, NDO, bina multicast ka ISN.</li>
</ul></div>
`}};export{e as default};