var e={id:`lab-floating-static`,h:{en:`Lab walkthrough: watching the forwarding table change`,hi:`Lab walkthrough: forwarding table ko badalte dekhna`},body:{en:`
<p>This chapter walks through the lab "Routing table vs forwarding table" step by step, with the output you should expect. Do it in the simulator while you read. The goal is to <i>see</i> the difference between what the RE knows and what the PFE uses.</p>

<h3>The scenario</h3>
<p>R1 reaches the billing server LAN 172.16.30.0/24 (server SRV at 172.16.30.10, behind R2) through OSPF via R2. A backup leased line from R1 to R3 has just been connected (10.0.13.0/30). That line does not run OSPF. You will add a floating static route over it, compare the two tables, then simulate a failure of the primary link and watch the forwarding table change.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Lab topology with primary and backup path">
<rect x="30" y="100" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="270" y="20" width="100" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="270" y="190" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="500" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="12">SRV</text><text x="555" y="58" text-anchor="middle" class="svg-muted" font-size="11">172.16.30.10</text>
<line x1="130" y1="115" x2="270" y2="50" stroke="#16a34a" stroke-width="4"/><text x="150" y="70" class="svg-ink" font-size="12">primary, OSPF (10)</text><text x="150" y="86" class="svg-muted" font-size="11">10.0.12.0/30</text>
<line x1="130" y1="135" x2="270" y2="210" stroke="#dc2626" stroke-width="3" stroke-dasharray="7 5"/><text x="120" y="205" class="svg-ink" font-size="12">backup, static (200)</text><text x="120" y="221" class="svg-muted" font-size="11">10.0.13.0/30</text>
<line x1="320" y1="70" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><text x="332" y="135" class="svg-muted" font-size="11">10.0.23.0/30 OSPF</text>
<line x1="370" y1="45" x2="500" y2="45" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Normal path: R1 to R2 to SRV. Backup path: R1 to R3, then R3 learns 172.16.30.0/24 from R2 by OSPF.</p></div>

<h3>Step 1: add the floating static route</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# set routing-options static route 172.16.30.0/24 next-hop 10.0.13.2
lab@R1# set routing-options static route 172.16.30.0/24 preference 200
lab@R1# commit and-quit
lab@R1&gt; show route 172.16.30.0/24</pre>
<p>OSPF (preference 10) is better than 200, so OSPF stays active. The static route is listed but has no asterisk.</p>

<h3>Step 2: read the routing table</h3>
<pre class="out">lab@R1&gt; show route 172.16.30.0/24
inet.0: 10 destinations, 11 routes (10 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.30.0/24     <span class="hl">*[OSPF/10]</span> 00:04:10, metric 2
                    &gt;  to 10.0.12.2 via ge-0/0/0.0
                    <span class="hl">[Static/200]</span> 00:00:25
                    &gt;  to 10.0.13.2 via ge-0/0/1.0</pre>
<p>Question from the lab: how many routes does inet.0 hold for this prefix? <b>Two</b>: one OSPF, one static (active or not).</p>

<h3>Step 3: read the forwarding table</h3>
<pre class="out">lab@R1&gt; show route forwarding-table destination 172.16.30.10
Routing table: default.inet
Internet:
Destination        Type RtRef Next hop           Type Index    NhRef Netif
172.16.30.0/24     user     0 <span class="hl">10.0.12.2</span>          ucst   622     2 ge-0/0/0.0</pre>
<p>The PFE uses <b>10.0.12.2</b> only. The inactive static route is not in the forwarding table at all.</p>

<h3>Step 4: simulate the failure</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# set interfaces ge-0/0/0 disable
lab@R1# commit and-quit</pre>
<p>Disabling the interface takes the primary link down. R1 loses its OSPF neighbour R2 and withdraws the OSPF route. Wait for OSPF to converge (in the simulator, up to about 45 seconds), then check again:</p>
<pre class="out">lab@R1&gt; show route 172.16.30.0/24
172.16.30.0/24     <span class="hl">*[Static/200]</span> 00:01:10
                    &gt;  to 10.0.13.2 via ge-0/0/1.0

lab@R1&gt; ping 172.16.30.10 count 3
PING 172.16.30.10 (172.16.30.10): 56 data bytes
64 bytes from 172.16.30.10: icmp_seq=0 ttl=62 time=1.8 ms
3 packets transmitted, 3 packets received, 0% packet loss

lab@R1&gt; show route forwarding-table destination 172.16.30.10
172.16.30.0/24     user     0 <span class="hl">10.0.13.2</span>          ucst   633     2 ge-0/0/1.0</pre>
<p>The static route became active and the forwarding table now points to 10.0.13.2. Traffic reaches SRV through R3 and R2. After the lab, <code>delete interfaces ge-0/0/0 disable</code> and commit to restore the primary path; OSPF returns and takes over again because its preference is better.</p>

<div class="eg"><p><b>What to notice.</b> Nothing changed in the static route during the failure. Only the OSPF competitor vanished. The routing table's active choice changed, and the RE pushed the new next hop to the PFE. This is the control plane updating the forwarding plane.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing the preference line and forgetting to commit, so the check never sees it. Forgetting to wait for OSPF to withdraw the route before expecting the switch. Leaving ge-0/0/0 disabled after the exercise.</p></div>

<div class="scn"><h4>Fibre cut at the provider</h4><p>A company's primary leased line failed at 2 am after a roadworks accident. The monitoring system raised an alarm, but the on-call engineer saw that applications still worked. The floating static route over the 4G backup had taken over automatically, and <code>show route forwarding-table</code> already showed the backup next hop. Users noticed only slightly slower response. The provider repaired the fibre in the morning and OSPF took the traffic back.</p><p><b>Lesson:</b> a well-chosen preference turns a static route into an automatic backup.</p></div>

<div class="iv"><p class="q">"How do you build a simple backup path in Junos without a dynamic protocol on the backup link?"</p><p>Configure a static route to the same prefix over the backup link with a higher preference than the primary protocol, for example 200. It stays inactive while the primary route exists and becomes active when the primary withdraws. Verify with show route and show route forwarding-table, and test by disabling the primary interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Floating static route: same prefix, higher preference (200) than OSPF (10).</li>
<li>Routing table shows two routes; the forwarding table shows only the active next hop.</li>
<li>When the primary route withdraws, the RE activates the static route and updates the PFE.</li>
<li>Verify with show route, show route forwarding-table destination and ping.</li>
<li>Remove the disable statement afterwards so the primary returns.</li>
</ul></div>
`,hi:`
<p>Yeh chapter lab "Routing table vs forwarding table" ko step by step chalata hai, jo output expected hai uske saath. Padhte hue simulator mein karo. Maqsad hai <i>dekhna</i> ki RE kya jaanta hai aur PFE kya use karta hai, usme fark.</p>

<h3>Scenario</h3>
<p>R1 billing server LAN 172.16.30.0/24 (server SRV 172.16.30.10, R2 ke peeche) tak OSPF se R2 ke through pahunchta hai. R1 se R3 tak ek backup leased line abhi judi hai (10.0.13.0/30). Us line par OSPF nahi chalta. Aap uske upar floating static route jodoge, dono tables compare karoge, phir primary link ka failure simulate karoge aur forwarding table ko badalte dekhoge.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Primary aur backup path wali lab topology">
<rect x="30" y="100" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="270" y="20" width="100" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="270" y="190" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="220" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="500" y="20" width="110" height="50" rx="8" fill="#fde68a"/><text x="555" y="42" text-anchor="middle" class="svg-ink" font-size="12">SRV</text><text x="555" y="58" text-anchor="middle" class="svg-muted" font-size="11">172.16.30.10</text>
<line x1="130" y1="115" x2="270" y2="50" stroke="#16a34a" stroke-width="4"/><text x="150" y="70" class="svg-ink" font-size="12">primary, OSPF (10)</text><text x="150" y="86" class="svg-muted" font-size="11">10.0.12.0/30</text>
<line x1="130" y1="135" x2="270" y2="210" stroke="#dc2626" stroke-width="3" stroke-dasharray="7 5"/><text x="120" y="205" class="svg-ink" font-size="12">backup, static (200)</text><text x="120" y="221" class="svg-muted" font-size="11">10.0.13.0/30</text>
<line x1="320" y1="70" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><text x="332" y="135" class="svg-muted" font-size="11">10.0.23.0/30 OSPF</text>
<line x1="370" y1="45" x2="500" y2="45" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Normal path: R1, R2, SRV. Backup path: R1 se R3, phir R3 OSPF se R2 se 172.16.30.0/24 seekhta hai.</p></div>

<h3>Step 1: floating static route jodo</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# set routing-options static route 172.16.30.0/24 next-hop 10.0.13.2
lab@R1# set routing-options static route 172.16.30.0/24 preference 200
lab@R1# commit and-quit
lab@R1&gt; show route 172.16.30.0/24</pre>
<p>OSPF (preference 10) 200 se behtar hai, isliye OSPF active rehta hai. Static route list mein hai lekin uske aage asterisk nahi.</p>

<h3>Step 2: routing table padho</h3>
<pre class="out">lab@R1&gt; show route 172.16.30.0/24
inet.0: 10 destinations, 11 routes (10 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.30.0/24     <span class="hl">*[OSPF/10]</span> 00:04:10, metric 2
                    &gt;  to 10.0.12.2 via ge-0/0/0.0
                    <span class="hl">[Static/200]</span> 00:00:25
                    &gt;  to 10.0.13.2 via ge-0/0/1.0</pre>
<p>Lab ka sawal: is prefix ke liye inet.0 mein kitne routes hain? <b>Do</b>: ek OSPF, ek static (active ho ya nahi).</p>

<h3>Step 3: forwarding table padho</h3>
<pre class="out">lab@R1&gt; show route forwarding-table destination 172.16.30.10
Routing table: default.inet
Internet:
Destination        Type RtRef Next hop           Type Index    NhRef Netif
172.16.30.0/24     user     0 <span class="hl">10.0.12.2</span>          ucst   622     2 ge-0/0/0.0</pre>
<p>PFE sirf <b>10.0.12.2</b> use karta hai. Inactive static route forwarding table mein hai hi nahi.</p>

<h3>Step 4: failure simulate karo</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# set interfaces ge-0/0/0 disable
lab@R1# commit and-quit</pre>
<p>Interface disable karne se primary link down hota hai. R1 apna OSPF neighbour R2 kho deta hai aur OSPF route hata deta hai. OSPF ke converge hone ka intezaar karo (simulator mein lagbhag 45 second tak), phir dobara check karo:</p>
<pre class="out">lab@R1&gt; show route 172.16.30.0/24
172.16.30.0/24     <span class="hl">*[Static/200]</span> 00:01:10
                    &gt;  to 10.0.13.2 via ge-0/0/1.0

lab@R1&gt; ping 172.16.30.10 count 3
PING 172.16.30.10 (172.16.30.10): 56 data bytes
64 bytes from 172.16.30.10: icmp_seq=0 ttl=62 time=1.8 ms
3 packets transmitted, 3 packets received, 0% packet loss

lab@R1&gt; show route forwarding-table destination 172.16.30.10
172.16.30.0/24     user     0 <span class="hl">10.0.13.2</span>          ucst   633     2 ge-0/0/1.0</pre>
<p>Static route active ho gaya aur forwarding table ab 10.0.13.2 ko point karti hai. Traffic SRV tak R3 aur R2 ke through pahunchta hai. Lab ke baad primary path wapas laane ke liye <code>delete interfaces ge-0/0/0 disable</code> karke commit karo; OSPF wapas aata hai aur phir control le leta hai kyunki uski preference behtar hai.</p>

<div class="eg"><p><b>Kya notice karna hai.</b> Failure ke dauran static route mein kuch nahi badla. Sirf OSPF competitor gayab hua. Routing table ka active choice badla, aur RE ne naya next hop PFE ko push kiya. Yeh control plane forwarding plane ko update kar raha hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Preference line type karke commit bhool jaana, to check use dekh hi nahi paata. Switch ki ummeed se pehle OSPF ke route hataane tak intezaar na karna. Exercise ke baad ge-0/0/0 ko disabled chhod dena.</p></div>

<div class="scn"><h4>Provider ke yahan fibre cut</h4><p>Ek company ki primary leased line subah 2 baje roadworks accident ke baad fail hui. Monitoring system ne alarm diya, lekin on-call engineer ne dekha ki applications chal rahi hain. 4G backup ke upar floating static route khud sambhal chuka tha, aur <code>show route forwarding-table</code> mein pehle se backup next hop dikh raha tha. Users ne sirf thoda dheema response mehsoos kiya. Provider ne subah fibre theek ki aur OSPF ne traffic wapas le liya.</p><p><b>Lesson:</b> sahi chuni hui preference static route ko automatic backup bana deti hai.</p></div>

<div class="iv"><p class="q">"Backup link par dynamic protocol ke bina Junos mein simple backup path kaise banate ho?"</p><p>Backup link ke upar same prefix ke liye static route configure karo jiski preference primary protocol se zyada ho, jaise 200. Primary route ke rehte woh inactive rehta hai aur primary hatne par active ho jaata hai. show route aur show route forwarding-table se verify karo, aur primary interface disable karke test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Floating static route: same prefix, OSPF (10) se zyada preference (200).</li>
<li>Routing table mein do routes dikhte hain; forwarding table mein sirf active next hop.</li>
<li>Primary route hatne par RE static route ko active karta hai aur PFE ko update karta hai.</li>
<li>show route, show route forwarding-table destination aur ping se verify karo.</li>
<li>Baad mein disable statement hatao taaki primary wapas aaye.</li>
</ul></div>
`}};export{e as default};