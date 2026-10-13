var e={id:`troubleshooting-workflow`,h:{en:`A troubleshooting workflow for the labs and tickets`,hi:`Labs aur tickets ke liye troubleshooting workflow`},body:{en:`
<p>A hospital has a triage desk, a set of standard tests, and a routine for each common illness. This chapter gives you the same for the L3VPN over SR: a fixed order of tests, a table that maps symptoms to causes, and a guide to how the course labs and tickets let you practise.</p>

<h3>The seven-step routine</h3>
<ol>
<li>Reproduce the symptom from the customer side (PC1 to PC2).</li>
<li>Interfaces and VRF membership on both PEs.</li>
<li>IS-IS adjacencies and a route to every loopback.</li>
<li>Labels: SRGB, SID map, forwarding table, "No Label" check.</li>
<li>BGP VPNv4: neighbor state, prefix counts, extended communities.</li>
<li>VRF import: RT lists on both PEs, remote routes in the VRF table.</li>
<li>PE-CE: eBGP state and customer routes.</li>
</ol>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>First suspect</th></tr>
<tr><td>Local CE route missing on PE</td><td>Interface not in VRF, or CE neighbor not in the VRF address family</td></tr>
<tr><td>VPNv4 up, zero prefixes received</td><td><code>send-community extended</code> missing on sender</td></tr>
<tr><td>Routes in BGP, not in VRF</td><td>Import RT mismatch</td></tr>
<tr><td>"No Label" for a loopback</td><td>SR off in IS-IS at the next hop</td></tr>
<tr><td>Labels missing for two routers</td><td>Duplicate SID index</td></tr>
<tr><td>Prefix SID missing, adjacency up</td><td>Narrow metrics, or SRGB too small for the index</td></tr>
<tr><td>BGP flaps, loopback gone</td><td>Loopback not in IS-IS</td></tr>
<tr><td>Loss on link failure</td><td>No TI-LFA</td></tr></table>

<h3>How the course maps to this</h3>
<ul>
<li><b>sre-sr-vpn-build</b>: build the VPN from nothing.</li>
<li><b>sre-sr-vpn-ts</b>: four typical faults; ask which router shows No Label.</li>
<li><b>sre-sr-vpn-cities</b>: three cities, a shared service, and a circuit drill.</li>
<li><b>spcor-sr-ts</b> and <b>spcor-sr-adj</b>: SR faults and explicit stacks.</li>
<li><b>Tickets INC270010 to INC270016, INC271010 to INC271012</b>: single-fault incidents of rising difficulty.</li>
<li><b>CHG271013 to CHG271015</b>: changes, including LDP migration, onboarding PE3 and a maintenance drill.</li>
</ul>
<pre class="out">PE1# show mpls forwarding-table 10.0.255.5
<span class="hl">16005  No Label  10.0.255.5/32  10.0.12.2</span>
P1# show segment-routing mpls
<span class="hl">% Segment routing is not enabled in IS-IS</span></pre>

<h3>Writing it down</h3>
<p>For a ticket, record what you saw, what you changed and how you proved it. A good note reads: "No Label for 10.0.255.5 at P1; added segment-routing mpls under IS-IS; label 16005 present; PC1 to PC2 ping passes."</p>

<div class="eg"><b>Worked example.</b> Symptom: PC1 cannot ping PC2. Step 2 is clean. Step 3 is clean. Step 4 shows "No Label". The fix belongs to step 4, so you do not touch BGP at all. The final proof: label back, ping passes.</div>

<div class="warn"><b>Common mistake.</b> Fixing two things at once. If the ping then works you cannot tell which change mattered, and if it fails you cannot tell which one broke it.</div>

<div class="exam"><b>Exam trap.</b> Ticket tasks often include a question item, for example "which router shows No Label". The answer is the device you should inspect, not the one displaying the symptom.</div>

<div class="scn"><h4>A shift handover</h4><p>An engineer leaving a shift left a note with the seven steps ticked up to step 4. The next engineer started at step 5 without repeating the earlier checks, trusted the note, and had the root cause, a missing import RT, within ten minutes.</p><p><b>Lesson:</b> a structured note is a gift to the next person.</p></div>

<div class="iv"><p class="q">"Describe a time you fixed a hard network fault."</p><p>Use a structure: symptom, layers checked, evidence, root cause, fix, proof, and a prevention step such as an index table or config template.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the seven steps in order.</li>
<li>Use the symptom table to pick your first suspect.</li>
<li>Practise on the labs, then on tickets of rising level.</li>
<li>Record evidence and proof for every change.</li>
</ul></div>
`,hi:`
<p>Hospital mein triage desk hota hai, standard tests ka set hota hai, aur har aam bimari ka routine hota hai. Yeh chapter SR par L3VPN ke liye wahi deta hai: tests ka fixed order, symptoms ko causes se jodne wali table, aur is baat ka guide ki course ke labs aur tickets aapko kaise practice karne dete hain.</p>

<h3>Saat-step routine</h3>
<ol>
<li>Customer side se symptom reproduce karo (PC1 se PC2).</li>
<li>Dono PEs par interfaces aur VRF membership.</li>
<li>IS-IS adjacencies aur har loopback ka route.</li>
<li>Labels: SRGB, SID map, forwarding table, "No Label" check.</li>
<li>BGP VPNv4: neighbor state, prefix counts, extended communities.</li>
<li>VRF import: dono PEs par RT lists, VRF table mein remote routes.</li>
<li>PE-CE: eBGP state aur customer routes.</li>
</ol>

<h3>Symptom se cause tak</h3>
<table class="cmp"><tr><th>Symptom</th><th>Pehla shak</th></tr>
<tr><td>PE par local CE route missing</td><td>Interface VRF mein nahi, ya CE neighbor VRF address family mein nahi</td></tr>
<tr><td>VPNv4 up, zero prefixes received</td><td>Sender par <code>send-community extended</code> missing</td></tr>
<tr><td>Routes BGP mein, VRF mein nahi</td><td>Import RT mismatch</td></tr>
<tr><td>Loopback ke liye "No Label"</td><td>Next hop par IS-IS mein SR off</td></tr>
<tr><td>Do routers ke labels missing</td><td>Duplicate SID index</td></tr>
<tr><td>Prefix SID missing, adjacency up</td><td>Narrow metrics, ya index ke liye SRGB bahut chhota</td></tr>
<tr><td>BGP flap, loopback gaya</td><td>Loopback IS-IS mein nahi</td></tr>
<tr><td>Link failure par loss</td><td>TI-LFA nahi</td></tr></table>

<h3>Course isse kaise judta hai</h3>
<ul>
<li><b>sre-sr-vpn-build</b>: VPN ko shuruaat se banao.</li>
<li><b>sre-sr-vpn-ts</b>: chaar aam faults; poocho kaunsa router No Label dikhata hai.</li>
<li><b>sre-sr-vpn-cities</b>: teen shehar, shared service, aur circuit drill.</li>
<li><b>spcor-sr-ts</b> aur <b>spcor-sr-adj</b>: SR faults aur explicit stacks.</li>
<li><b>Tickets INC270010 se INC270016, INC271010 se INC271012</b>: badhti difficulty ke single-fault incidents.</li>
<li><b>CHG271013 se CHG271015</b>: changes, LDP migration, PE3 onboarding aur maintenance drill samet.</li>
</ul>
<pre class="out">PE1# show mpls forwarding-table 10.0.255.5
<span class="hl">16005  No Label  10.0.255.5/32  10.0.12.2</span>
P1# show segment-routing mpls
<span class="hl">% Segment routing is not enabled in IS-IS</span></pre>

<h3>Likh kar rakhna</h3>
<p>Ticket ke liye likho kya dekha, kya badla aur kaise prove kiya. Achha note aisa padhta hai: "P1 par 10.0.255.5 ke liye No Label; IS-IS ke neeche segment-routing mpls joda; label 16005 aaya; PC1 se PC2 ping pass."</p>

<div class="eg"><b>Worked example.</b> Symptom: PC1 PC2 ko ping nahi kar sakta. Step 2 saaf. Step 3 saaf. Step 4 "No Label" dikhata hai. Fix step 4 ka hai, isliye BGP ko chhute hi nahi. Aakhri saboot: label wapas, ping pass.</div>

<div class="warn"><b>Common mistake.</b> Do cheezein ek saath theek karna. Phir ping chale to pata nahi chalta kaunsa change kaam aaya, aur fail ho to pata nahi chalta kaunsa tod gaya.</div>

<div class="exam"><b>Exam trap.</b> Ticket tasks mein aksar sawaal item hota hai, jaise "kaunsa router No Label dikhata hai". Jawab woh device hai jise inspect karna chahiye, woh nahi jo symptom dikha raha hai.</div>

<div class="scn"><h4>Shift handover</h4><p>Shift chhodte engineer ne saat steps ka note chhoda jisme step 4 tak tick tha. Agle engineer ne pehle ke checks dohraye bina step 5 se shuru kiya, note par bharosa kiya, aur das minute mein root cause, missing import RT, mil gaya.</p><p><b>Lesson:</b> structured note agle vyakti ke liye tohfa hai.</p></div>

<div class="iv"><p class="q">"Kisi mushkil network fault ko theek karne ka waqt batao."</p><p>Structure use karo: symptom, dekhi gayi layers, evidence, root cause, fix, proof, aur prevention step jaise index table ya config template.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saat steps order mein follow karo.</li>
<li>Pehla shak chunne ke liye symptom table use karo.</li>
<li>Pehle labs par, phir badhte level ke tickets par practice karo.</li>
<li>Har change ka evidence aur proof record karo.</li>
</ul></div>
`}};export{e as default};