var e={id:`noc-troubleshooting`,h:{en:`A day in the NOC: troubleshooting workflow and both labs`,hi:`NOC mein ek din: troubleshooting workflow aur dono labs`},body:{en:`
<p>A good detective does not arrest the first suspect. They collect evidence, build a timeline, test one theory, and only then act, and they write down proof for the court. A NOC engineer with Catalyst Center works the same way: <b>health</b> shows that something is wrong, <b>issues</b> suggest what, <b>Path Trace</b> proves where, the <b>device CLI</b> confirms why, and health plus a completed trace prove the fix.</p>

<h3>A day in the life</h3>
<ul><li><b>08:30</b> — open the Dashboard: network health, client health, open P1/P2 issues. Anything red overnight gets looked at first.</li>
<li><b>09:15</b> — a ticket: "the finance app is slow on floor 3". Client 360 for the user, application health for the app, Path Trace with the app's TCP port.</li>
<li><b>11:00</b> — a new access switch arrives at a branch; PnP claims it, the Day-0 template and golden image go on, Provision pushes site settings.</li>
<li><b>14:00</b> — compliance report: two switches NON_COMPLIANT after a manual change; review with the change owner and redeploy the template.</li>
<li><b>17:30</b> — schedule tonight's SWIM activation for five switches that were distributed yesterday; the ITSM change record was created through the API.</li></ul>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Controller troubleshooting workflow">
<rect x="5" y="45" width="112" height="56" rx="10" fill="#fde68a"/><text x="61" y="69" text-anchor="middle" class="svg-ink" font-size="13">1 Onboard</text><text x="61" y="86" text-anchor="middle" class="svg-muted" font-size="12">discover</text>
<rect x="131" y="45" width="112" height="56" rx="10" fill="#fed7aa"/><text x="187" y="69" text-anchor="middle" class="svg-ink" font-size="13">2 Health</text><text x="187" y="86" text-anchor="middle" class="svg-muted" font-size="12">who is red?</text>
<rect x="257" y="45" width="112" height="56" rx="10" fill="#bae6fd"/><text x="313" y="69" text-anchor="middle" class="svg-ink" font-size="13">3 Issues</text><text x="313" y="86" text-anchor="middle" class="svg-muted" font-size="12">P1 first</text>
<rect x="383" y="45" width="112" height="56" rx="10" fill="#ddd6fe"/><text x="439" y="69" text-anchor="middle" class="svg-ink" font-size="13">4 Path Trace</text><text x="439" y="86" text-anchor="middle" class="svg-muted" font-size="12">real port</text>
<rect x="509" y="45" width="126" height="56" rx="10" fill="#bbf7d0"/><text x="572" y="69" text-anchor="middle" class="svg-ink" font-size="13">5 Fix + prove</text><text x="572" y="86" text-anchor="middle" class="svg-muted" font-size="12">CLI, re-trace</text>
<line x1="117" y1="73" x2="131" y2="73" stroke="#64748b" stroke-width="2"/><line x1="243" y1="73" x2="257" y2="73" stroke="#64748b" stroke-width="2"/><line x1="369" y1="73" x2="383" y2="73" stroke="#64748b" stroke-width="2"/><line x1="495" y1="73" x2="509" y2="73" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Then standardise with templates and confirm compliance</text>
</svg><p class="cap">Symptom → evidence → proof. Never skip step 5's proof.</p></div>

<h3>Lab 1: Find and fix the issues with Assurance</h3>
<p><b>Ticket:</b> PC1 is offline and staff in VLAN 20 cannot open anything in the data centre. CTRL is new and nothing is onboarded.</p>
<p><b>Step 1, onboard.</b> Inventory → Discovery with <code>10.99.0.0/24</code>, netadmin / NK@dmin1, community nkro (or <code>center discover 10.99.0.0/24 cli netadmin NK@dmin1 snmp nkro</code>). DSW1, ASW1 and ASW2 become Managed. R1 does not appear: its loopback is outside the range and, as you will see, unreachable.</p>
<p><b>Step 2, health.</b> The Dashboard shows network health 33% (DSW1 1/10, ASW1 3/10) and client health 0%.</p>
<p><b>Step 3, issues.</b> Issues lists P1 OSPF adjacency down on DSW1 Gi0/3 toward R1, P1 PC1 cannot reach its gateway, P2 ASW1 Gi0/3 err-disabled (psecure-violation), P3 PC2 cannot reach DNS 172.16.50.10, and P4 No NTP source on each switch. The answer the lab asks for is <b>Gi0/3</b>. Group them: the PC1 issues share one cause (the port), and the PC2 DNS issue is really the missing route to the data centre (the OSPF issue).</p>
<p><b>Step 4, fix the port.</b> Confirm on ASW1, then remove the wrong static secure MAC and bounce the port:</p>
<pre class="code">ASW1# show port-security interface GigabitEthernet0/3</pre>
<pre class="out">Port Status                : <span class="hl">Secure-shutdown</span>
Configured MAC Addresses   : 1
Last Source Address:Vlan   : 0050.7f06.6d01:10
Security Violation Count   : 1</pre>
<pre class="code">ASW1(config)# interface GigabitEthernet0/3
ASW1(config-if)# no switchport port-security mac-address 0050.7966.aaaa
ASW1(config-if)# shutdown
ASW1(config-if)# no shutdown
PC1&gt; ping 10.10.10.1</pre>
<p>The configured MAC 0050.7966.aaaa was not PC1's real MAC (0050.7f06.6d01), so PC1's first frame was a violation. After the fix PC1's client health returns to Good.</p>
<p><b>Step 5, fix routing.</b> The issue detail said "area mismatch: DSW1 uses area 0, hellos from R1 carry area 1", and the event timeline shows <code>%OSPF-4-ERRRCV: Received invalid packet: mismatched area ID 1 (local area 0) from 10.0.0.1</code>. The link must be in area 0, so R1 is the wrong side:</p>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# no network 10.0.0.0 0.0.0.3 area 1
R1(config-router)# network 10.0.0.0 0.0.0.3 area 0
DSW1# show ip ospf neighbor</pre>
<p>DSW1 now shows 1.1.1.1 FULL on Gi0/3 and learns 172.16.50.0/24. The P1 and the PC2 DNS issue resolve on their own.</p>
<p><b>Step 6, finish onboarding and prove.</b> Now that R1 is reachable, run <code>center discover 10.255.0.1 cli netadmin NK@dmin1 snmp nkro</code>. Then trace and check health:</p>
<pre class="code">CTRL&gt; center pathtrace PC1 SRV
CTRL&gt; center health</pre>
<pre class="out">Result: COMPLETED
<span class="hl">Overall network health : 100%  (4 of 4 devices healthy)</span>
Client health          : 100%  (2 of 2 clients healthy)
Open issues            : P1 0  P2 0  P3 0  P4 4</pre>

<h3>Lab 2: Path Trace an ACL, then push golden templates</h3>
<p><b>Ticket:</b> PC2 (VLAN 20) cannot load the intranet web app on SRV (TCP 80), yet ping works and the dashboard is almost green.</p>
<p><b>Step 1, trace the real port.</b> An ICMP Path Trace from PC2 to SRV completes, which is why nothing looks wrong. Switch the protocol to <b>TCP</b>, port <b>80</b>:</p>
<pre class="code">CTRL&gt; center pathtrace PC2 SRV tcp 80</pre>
<pre class="out">   4  R1        router     in Gi0/0   X DROPPED: Denied by access list WAN-IN (in on Gi0/0)
<span class="hl">Break point: R1 - Denied by access list WAN-IN (in on Gi0/0)</span></pre>
<p>The ACL name to type is <b>WAN-IN</b>.</p>
<p><b>Step 2, fix without removing security.</b> Keep WAN-IN applied inbound on Gi0/0 and delete only the bad entry:</p>
<pre class="code">R1# show access-lists WAN-IN
    10 deny tcp 10.20.20.0 0.0.0.255 host 172.16.50.10 eq www
    20 permit ip any any
R1(config)# ip access-list extended WAN-IN
R1(config-ext-nacl)# no 10</pre>
<p><b>Step 3, prove.</b> Re-run the TCP 80 trace: <code>Result: COMPLETED  (TCP 80 open - service answered)</code>, forward and return paths both complete.</p>
<p><b>Step 4, NTP standard.</b> Templates → NTP-Baseline, <code>ntp_server</code> = 10.255.0.1, targets DSW1, ASW1, ASW2, Preview, Deploy (or <code>center template apply NTP-Baseline switches ntp_server=10.255.0.1</code>). Check <code>show ntp status</code> on ASW1: synchronized, reference 10.255.0.1.</p>
<p><b>Step 5, banner and compliance.</b> Deploy Banner-Standard with <code>site=Pune_Campus</code>, then Run compliance / <code>center compliance</code>: all six rows COMPLIANT.</p>
<p><b>Step 6, health.</b> With every switch synced, the P4 NTP issues close and network health is 100% with scores of 10/10.</p>

<div class="eg"><p><b>Worked example: why the order matters in Lab 1.</b> If you try to discover 10.255.0.1 before fixing OSPF, ICMP fails and R1 is simply "no response", because DSW1 has no route to R1's loopback. Fixing the P1 routing issue first is what makes the rest of the network visible to the controller.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Removing port-security entirely instead of the one wrong MAC. Changing DSW1 to area 1 (the link must be area 0). Deleting the whole WAN-IN ACL or removing it from the interface. Declaring victory on "SUCCESS" from a template without checking NTP sync and compliance.</p></div>
<div class="exam"><p><b>Exam trap.</b> A green overall health score and a successful ICMP trace do not prove an application works. Scenario questions expect you to trace with the application's protocol and port.</p></div>

<div class="scn"><h4>The ticket that bounced three times</h4><p>A store reported "card terminal cannot connect". The NOC pinged it, got replies, and closed the ticket. It came back twice. A new engineer ran a Path Trace from the terminal to the payment gateway on TCP 443 with ACL trace: denied inbound on the store router by an old entry blocking the new gateway subnet. Removing that one line fixed it for good.</p><p><b>Lesson:</b> the controller only helps if you ask it the right question: the real source, destination, protocol and port.</p></div>

<div class="iv"><p class="q">"Describe how you would troubleshoot a user complaint using Catalyst Center."</p><p>Start with scope: one user, a floor or a site (Client 360, site health). Read issues from P1 down and correlate by time and topology. Run Path Trace from the client to the service with the real protocol and port. Confirm the cause on the device with show commands, fix it, then prove it: the issue resolves, the trace completes, health returns. Finish by making it stick with a template and compliance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: onboard, health, issues (P1 first), Path Trace, fix on the device, prove.</li>
<li>Lab 1: err-disabled port from a wrong static secure MAC, and an OSPF area mismatch on R1.</li>
<li>Lab 2: ICMP passes but TCP 80 is denied by WAN-IN sequence 10 on R1 Gi0/0 inbound.</li>
<li>Fix minimally: remove the bad entry, keep the security control in place.</li>
<li>Close with templates, compliance and health to make the fix permanent and visible.</li>
</ul></div>
`,hi:`
<p>Accha detective pehle suspect ko hi arrest nahi karta. Woh saboot jodta hai, timeline banata hai, ek theory test karta hai, tabhi action leta hai, aur court ke liye proof likhta hai. Catalyst Center ke saath NOC engineer bhi aise hi kaam karta hai: <b>health</b> dikhata hai ki kuch galat hai, <b>issues</b> batate hain kya, <b>Path Trace</b> prove karta hai kahan, <b>device CLI</b> confirm karta hai kyun, aur health plus completed trace fix prove karte hain.</p>

<h3>Ek din ki kahaani</h3>
<ul><li><b>08:30</b> — Dashboard kholo: network health, client health, khule P1/P2 issues. Raat bhar mein jo laal hua use pehle dekho.</li>
<li><b>09:15</b> — ek ticket: "floor 3 par finance app slow hai". User ka Client 360, app ki application health, app ke TCP port ke saath Path Trace.</li>
<li><b>11:00</b> — branch par naya access switch aata hai; PnP use claim karta hai, Day-0 template aur golden image lagti hai, Provision site settings push karta hai.</li>
<li><b>14:00</b> — compliance report: ek manual change ke baad do switches NON_COMPLIANT; change owner ke saath review karo aur template dobara deploy karo.</li>
<li><b>17:30</b> — kal distribute hue paanch switches ke liye aaj raat ka SWIM activation schedule karo; ITSM change record API se bana.</li></ul>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Controller troubleshooting workflow">
<rect x="5" y="45" width="112" height="56" rx="10" fill="#fde68a"/><text x="61" y="69" text-anchor="middle" class="svg-ink" font-size="13">1 Onboard</text><text x="61" y="86" text-anchor="middle" class="svg-muted" font-size="12">discover</text>
<rect x="131" y="45" width="112" height="56" rx="10" fill="#fed7aa"/><text x="187" y="69" text-anchor="middle" class="svg-ink" font-size="13">2 Health</text><text x="187" y="86" text-anchor="middle" class="svg-muted" font-size="12">kaun laal hai?</text>
<rect x="257" y="45" width="112" height="56" rx="10" fill="#bae6fd"/><text x="313" y="69" text-anchor="middle" class="svg-ink" font-size="13">3 Issues</text><text x="313" y="86" text-anchor="middle" class="svg-muted" font-size="12">P1 pehle</text>
<rect x="383" y="45" width="112" height="56" rx="10" fill="#ddd6fe"/><text x="439" y="69" text-anchor="middle" class="svg-ink" font-size="13">4 Path Trace</text><text x="439" y="86" text-anchor="middle" class="svg-muted" font-size="12">asli port</text>
<rect x="509" y="45" width="126" height="56" rx="10" fill="#bbf7d0"/><text x="572" y="69" text-anchor="middle" class="svg-ink" font-size="13">5 Fix + prove</text><text x="572" y="86" text-anchor="middle" class="svg-muted" font-size="12">CLI, re-trace</text>
<line x1="117" y1="73" x2="131" y2="73" stroke="#64748b" stroke-width="2"/><line x1="243" y1="73" x2="257" y2="73" stroke="#64748b" stroke-width="2"/><line x1="369" y1="73" x2="383" y2="73" stroke="#64748b" stroke-width="2"/><line x1="495" y1="73" x2="509" y2="73" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Phir templates se standardise karo aur compliance confirm karo</text>
</svg><p class="cap">Symptom → saboot → proof. Step 5 ka proof kabhi skip mat karo.</p></div>

<h3>Lab 1: Assurance se issues dhoondho aur fix karo</h3>
<p><b>Ticket:</b> PC1 offline hai aur VLAN 20 ka staff data centre mein kuch bhi nahi khol pa raha. CTRL naya hai aur kuch onboard nahi hua.</p>
<p><b>Step 1, onboard.</b> Inventory → Discovery mein <code>10.99.0.0/24</code>, netadmin / NK@dmin1, community nkro (ya <code>center discover 10.99.0.0/24 cli netadmin NK@dmin1 snmp nkro</code>). DSW1, ASW1 aur ASW2 Managed ho jaate hain. R1 nahi dikhta: uska loopback range ke bahar hai aur, jaisa aap dekhoge, unreachable hai.</p>
<p><b>Step 2, health.</b> Dashboard network health 33% (DSW1 1/10, ASW1 3/10) aur client health 0% dikhata hai.</p>
<p><b>Step 3, issues.</b> Issues mein hain P1 DSW1 Gi0/3 par R1 ki taraf OSPF adjacency down, P1 PC1 apne gateway tak nahi pahunch pa raha, P2 ASW1 Gi0/3 err-disabled (psecure-violation), P3 PC2 DNS 172.16.50.10 tak nahi pahunch pa raha, aur har switch par P4 No NTP source. Lab jo answer maangta hai woh hai <b>Gi0/3</b>. Inhe group karo: PC1 ke issues ka ek hi cause hai (port), aur PC2 ka DNS issue asal mein data centre ka missing route hai (OSPF issue).</p>
<p><b>Step 4, port theek karo.</b> ASW1 par confirm karo, phir galat static secure MAC hatao aur port bounce karo:</p>
<pre class="code">ASW1# show port-security interface GigabitEthernet0/3</pre>
<pre class="out">Port Status                : <span class="hl">Secure-shutdown</span>
Configured MAC Addresses   : 1
Last Source Address:Vlan   : 0050.7f06.6d01:10
Security Violation Count   : 1</pre>
<pre class="code">ASW1(config)# interface GigabitEthernet0/3
ASW1(config-if)# no switchport port-security mac-address 0050.7966.aaaa
ASW1(config-if)# shutdown
ASW1(config-if)# no shutdown
PC1&gt; ping 10.10.10.1</pre>
<p>Configured MAC 0050.7966.aaaa PC1 ka asli MAC (0050.7f06.6d01) nahi tha, isliye PC1 ka pehla frame hi violation tha. Fix ke baad PC1 ki client health wapas Good ho jaati hai.</p>
<p><b>Step 5, routing theek karo.</b> Issue detail ne kaha "area mismatch: DSW1 uses area 0, hellos from R1 carry area 1", aur event timeline <code>%OSPF-4-ERRRCV: Received invalid packet: mismatched area ID 1 (local area 0) from 10.0.0.1</code> dikhati hai. Link area 0 mein hona chahiye, isliye R1 galat side hai:</p>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# no network 10.0.0.0 0.0.0.3 area 1
R1(config-router)# network 10.0.0.0 0.0.0.3 area 0
DSW1# show ip ospf neighbor</pre>
<p>DSW1 ab Gi0/3 par 1.1.1.1 FULL dikhata hai aur 172.16.50.0/24 seekhta hai. P1 aur PC2 ka DNS issue apne aap resolve ho jaate hain.</p>
<p><b>Step 6, onboarding poora karo aur prove karo.</b> Ab R1 reachable hai, to <code>center discover 10.255.0.1 cli netadmin NK@dmin1 snmp nkro</code> chalao. Phir trace aur health check karo:</p>
<pre class="code">CTRL&gt; center pathtrace PC1 SRV
CTRL&gt; center health</pre>
<pre class="out">Result: COMPLETED
<span class="hl">Overall network health : 100%  (4 of 4 devices healthy)</span>
Client health          : 100%  (2 of 2 clients healthy)
Open issues            : P1 0  P2 0  P3 0  P4 4</pre>

<h3>Lab 2: ACL ko Path Trace karo, phir golden templates push karo</h3>
<p><b>Ticket:</b> PC2 (VLAN 20) SRV par intranet web app (TCP 80) load nahi kar pata, phir bhi ping chalta hai aur dashboard lagbhag green hai.</p>
<p><b>Step 1, asli port trace karo.</b> PC2 se SRV tak ICMP Path Trace complete hota hai, isiliye kuch galat nahi dikhta. Protocol ko <b>TCP</b>, port <b>80</b> par switch karo:</p>
<pre class="code">CTRL&gt; center pathtrace PC2 SRV tcp 80</pre>
<pre class="out">   4  R1        router     in Gi0/0   X DROPPED: Denied by access list WAN-IN (in on Gi0/0)
<span class="hl">Break point: R1 - Denied by access list WAN-IN (in on Gi0/0)</span></pre>
<p>Type karne wala ACL naam hai <b>WAN-IN</b>.</p>
<p><b>Step 2, security hataaye bina fix.</b> WAN-IN ko Gi0/0 par inbound laga rehne do aur sirf galat entry delete karo:</p>
<pre class="code">R1# show access-lists WAN-IN
    10 deny tcp 10.20.20.0 0.0.0.255 host 172.16.50.10 eq www
    20 permit ip any any
R1(config)# ip access-list extended WAN-IN
R1(config-ext-nacl)# no 10</pre>
<p><b>Step 3, prove karo.</b> TCP 80 trace dobara chalao: <code>Result: COMPLETED  (TCP 80 open - service answered)</code>, forward aur return dono paths complete.</p>
<p><b>Step 4, NTP standard.</b> Templates → NTP-Baseline, <code>ntp_server</code> = 10.255.0.1, targets DSW1, ASW1, ASW2, Preview, Deploy (ya <code>center template apply NTP-Baseline switches ntp_server=10.255.0.1</code>). ASW1 par <code>show ntp status</code> check karo: synchronized, reference 10.255.0.1.</p>
<p><b>Step 5, banner aur compliance.</b> Banner-Standard ko <code>site=Pune_Campus</code> ke saath deploy karo, phir Run compliance / <code>center compliance</code>: saari chhe rows COMPLIANT.</p>
<p><b>Step 6, health.</b> Har switch sync hone par P4 NTP issues band ho jaate hain aur network health 100% hota hai, scores 10/10 ke saath.</p>

<div class="eg"><p><b>Worked example: Lab 1 mein order kyun matter karta hai.</b> Agar aap OSPF fix karne se pehle 10.255.0.1 discover karne ki koshish karo, ICMP fail hota hai aur R1 bas "no response" hota hai, kyunki DSW1 ke paas R1 ke loopback ka route nahi hai. Pehle P1 routing issue fix karna hi baaki network ko controller ko dikhne layak banata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Ek galat MAC ki jagah poora port-security hata dena. DSW1 ko area 1 mein badal dena (link area 0 mein hona chahiye). Poora WAN-IN ACL delete kar dena ya interface se hata dena. Template ke "SUCCESS" par jeet ghoshit kar dena, NTP sync aur compliance check kiye bina.</p></div>
<div class="exam"><p><b>Exam trap.</b> Green overall health score aur successful ICMP trace prove nahi karte ki application kaam karti hai. Scenario questions expect karte hain ki aap application ke protocol aur port se trace karo.</p></div>

<div class="scn"><h4>Woh ticket jo teen baar wapas aaya</h4><p>Ek store ne report kiya "card terminal connect nahi ho raha". NOC ne use ping kiya, replies mile, aur ticket band kar diya. Woh do baar wapas aaya. Ek naye engineer ne terminal se payment gateway tak TCP 443 par ACL trace ke saath Path Trace chalaya: store router par inbound denied, ek purani entry naye gateway subnet ko block kar rahi thi. Woh ek line hatane se hamesha ke liye theek ho gaya.</p><p><b>Lesson:</b> controller tabhi madad karta hai jab aap use sahi sawaal poochho: asli source, destination, protocol aur port.</p></div>

<div class="iv"><p class="q">"Catalyst Center use karke user complaint kaise troubleshoot karoge?"</p><p>Scope se shuru karo: ek user, ek floor ya ek site (Client 360, site health). Issues P1 se neeche padho aur time aur topology se correlate karo. Client se service tak asli protocol aur port ke saath Path Trace chalao. Device par show commands se cause confirm karo, fix karo, phir prove karo: issue resolve ho, trace complete ho, health wapas aaye. Template aur compliance se fix ko pakka karke khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: onboard, health, issues (P1 pehle), Path Trace, device par fix, prove.</li>
<li>Lab 1: galat static secure MAC se err-disabled port, aur R1 par OSPF area mismatch.</li>
<li>Lab 2: ICMP pass hota hai par TCP 80 ko R1 Gi0/0 inbound par WAN-IN sequence 10 deny karta hai.</li>
<li>Minimal fix karo: galat entry hatao, security control ko jagah par rehne do.</li>
<li>Templates, compliance aur health ke saath khatam karo taaki fix permanent aur visible rahe.</li>
</ul></div>
`}};export{e as default};