var e={id:`capstone`,h:{en:`Capstone walkthrough: three layers, three tools (wl-diag-capstone)`,hi:`Capstone walkthrough: teen layers, teen tools (wl-diag-capstone)`},body:{en:`
<p>A good detective does not stop at the first clue. After a weekend change, two users complain and three independent defects hide behind them. This is the final exam of the module: use a trace, a capture and show commands, repair each defect on the device that owns it, and prove both users. You have already met each tool alone; here you combine them. The module wl-ops also has a capstone (wl-capstone-incident) built on show commands and policy; this one is built on evidence tools.</p>

<h3>The ticket</h3>
<p>The corporate laptop LAPTOP2 (NK-CORP, user alice) cannot authenticate. The staff laptop LAPTOP1 (NK-STAFF) joins but has no address. The RAD1 shared secret is NkRadius1. The brief names symptoms only. Remember: fixing one layer can reveal the next.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Capstone map">
<rect x="10" y="20" width="190" height="70" rx="8" fill="#ddd6fe"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP2, NK-CORP</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="12">Layer 1: RADIUS</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">Layer 2: VLAN 40</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1, NK-STAFF</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">Layer 3: DHCP path</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">R1 Gi0/0.20 shut</text>
<rect x="440" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Tools</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="12">trace for LAPTOP2</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">capture for LAPTOP1</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Evidence, owner, one change, proof, repeat</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Three defects, three owners: WLC1 (key), WLC1 (VLAN), R1 (interface)</text>
</svg><p class="cap">Two clients, three defects. The tool follows the stage, not the other way round.</p></div>

<h3>Round 1: trace LAPTOP2 and find the first failing layer</h3>
<pre class="code">WLC1# debug wireless mac 0050.32e9.9f01
LAPTOP2# wifi connect NK-CORP user alice password NkWifi@2024
WLC1# show logging profile wireless filter mac 0050.32e9.9f01</pre>
<pre class="out">... [dot1x] (info): MAC: 0050.32e9.9f01 Received EAP-Response/Identity: alice
... [radius] (info): RADIUS: Send Access-Request to 10.10.60.20:1812 ...
... [radius] (info): RADIUS: Retransmit to (10.10.60.20:1812,1813) ...
... [radius] (warn): %RADIUS-4-RADIUS_DEAD: RADIUS server 10.10.60.20:1812,1813 is not responding.
... [dot1x] (<span class="hl">ERR</span>): MAC: 0050.32e9.9f01 AAA server did not answer: 802.1X authentication timed out</pre>
<p>Stage 3, <b>timeout</b>, not reject (chapter 10). The server did not answer: address, route or key. The user and password are not the problem. In the same time window start the capture for LAPTOP1 as well (<code>CAP-STAFF</code>, chapter 6).</p>

<h3>Round 2: repair the RADIUS layer and re-trace</h3>
<pre class="code">WLC1(config)# radius server RAD1
WLC1(config-radius-server)# key 0 NkRadius1
LAPTOP2# wifi connect NK-CORP user alice password NkWifi@2024
WLC1# show logging profile wireless filter mac 0050.32e9.9f01</pre>
<pre class="out">... [radius] (info): RADIUS: Received from id 1812/87 10.10.60.20:0, Access-Accept ...
... [dot1x] (info): MAC: 0050.32e9.9f01 Received EAP-Success; authentication succeeded for user alice
... [client-keymgmt] (note): ... EAP Key management successful. AKM:802.1x ...
... [client-orch-sm] (<span class="hl">ERR</span>): MAC: 0050.32e9.9f01 Policy profile PP-CORP: VLAN 40 is not in the VLAN database; client cannot be placed</pre>
<p>The first layer is gone and the next appeared: authentication now succeeds (Access-Accept) and the failure moved to stage 4. This is the lesson of the loop in chapter 1. GUI: <b>Configuration &gt; Security &gt; AAA &gt; Servers</b> for the key; <b>Configuration &gt; Layer2 &gt; VLAN</b> for the next step.</p>

<h3>Round 3: capture CAP-STAFF for LAPTOP1</h3>
<pre class="code">WLC1# monitor capture CAP-STAFF interface GigabitEthernet1 both
WLC1# monitor capture CAP-STAFF start
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# monitor capture CAP-STAFF stop
WLC1# show monitor capture CAP-STAFF buffer brief</pre>
<p>The buffer must show DHCP Discover rows and no Offer: the same picture as the capture lab, with the same owner, R1.</p>

<h3>Round 4: repair the remaining two on the owners and prove</h3>
<pre class="code">WLC1(config)# vlan 40
WLC1(config-vlan)# name CORP
R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# no shutdown
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
LAPTOP2# wifi connect NK-CORP user alice password NkWifi@2024
LAPTOP1# ping 10.10.60.20
LAPTOP2# ping 10.10.60.20</pre>
<p>The check wants LAPTOP1 in 10.10.20.x and LAPTOP2 in 10.10.40.x, both able to reach RAD1.</p>

<div class="eg"><p><b>Worked example (evidence pack).</b> Defect 1: owner WLC1, evidence Access-Request with retransmits and RADIUS_DEAD, change <code>key 0 NkRadius1</code>, proof Access-Accept. Defect 2: owner WLC1, evidence ERR VLAN 40 not in database, change <code>vlan 40</code> and <code>name CORP</code>, proof LAPTOP2 in 10.10.40.x. Defect 3: owner R1, evidence Discovers without Offer, change <code>no shutdown</code> on R1 GigabitEthernet0/0.20, proof LAPTOP1 in 10.10.20.x. Three lines of a table, each with evidence and proof, is a ticket closure a manager can read.</p></div>

<div class="warn"><p><b>Common mistake.</b> Declaring victory after the first Accept. Re-test every user after every change, and re-trace until the client reaches S_CO_RUN with an address.</p></div>
<div class="exam"><p><b>Exam trap.</b> In multi-fault tickets the order of evidence matters. A later-stage error can be invisible until an earlier-stage error is fixed, so a failing client may show a different line after each repair. That is normal, not a new problem.</p></div>

<div class="scn"><h4>Monday after the migration</h4><p>After a weekend migration a hospital reported "corporate Wi-Fi down". The engineer traced one nurse laptop: RADIUS timeout; the key on the controller was from the old server. After the fix the next trace showed the VLAN missing because the migration script created the policy profile but not VLAN 40. A third report, no addresses on the staff VLAN, came from a shut sub-interface on the router. Total fix time: 25 minutes, with trace files attached to the ticket.</p><p><b>Lesson:</b> big changes break several layers; evidence and a loop beat guesswork.</p></div>

<div class="iv"><p class="q">"Corporate and staff Wi-Fi both broke after a change. How do you approach it?"</p><p>Scope per SSID: they use different layers (802.1X path and VLAN for corporate, DHCP path for staff). I trace a corporate client, capture a staff client, read the first failing stage for each, fix one object on its owner, re-test and repeat until both reach run state with an address. I keep the traces and captures as an evidence pack.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the tool that matches the stage: trace for AAA and VLAN, capture for DHCP.</li>
<li>Fix one defect, re-trace: the next layer appears.</li>
<li>Owners differ: WLC1 for key and VLAN, R1 for the interface.</li>
<li>Prove each user with status and ping after the last change.</li>
<li>Write the evidence, change and proof for each defect.</li>
</ul></div>
`,hi:`
<p>Achha detective pehli clue par nahi rukta. Weekend change ke baad do users complain karte hain aur unke peeche teen independent defects chhupe hain. Yeh module ka final exam hai: trace, capture aur show commands use karo, har defect us device par repair karo jo use own karta hai, aur dono users prove karo. Har tool aap pehle akela dekh chuke ho; yahan unhe jodte ho. Module wl-ops ka bhi ek capstone (wl-capstone-incident) hai jo show commands aur policy par bana hai; yeh evidence tools par bana hai.</p>

<h3>Ticket</h3>
<p>Corporate laptop LAPTOP2 (NK-CORP, user alice) authenticate nahi kar paata. Staff laptop LAPTOP1 (NK-STAFF) join karta hai lekin address nahi milta. RAD1 shared secret NkRadius1 hai. Brief sirf symptoms batata hai. Yaad rakho: ek layer fix karne se agli dikh sakti hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Capstone map">
<rect x="10" y="20" width="190" height="70" rx="8" fill="#ddd6fe"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP2, NK-CORP</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="12">Layer 1: RADIUS</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">Layer 2: VLAN 40</text>
<rect x="225" y="20" width="190" height="70" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1, NK-STAFF</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="12">Layer 3: DHCP path</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">R1 Gi0/0.20 shut</text>
<rect x="440" y="20" width="190" height="70" rx="8" fill="#bbf7d0"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Tools</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="12">LAPTOP2 ke liye trace</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">LAPTOP1 ke liye capture</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Evidence, owner, ek change, proof, dohrao</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Teen defects, teen owners: WLC1 (key), WLC1 (VLAN), R1 (interface)</text>
</svg><p class="cap">Do clients, teen defects. Tool stage ko follow karta hai, ulta nahi.</p></div>

<h3>Round 1: LAPTOP2 ko trace karo aur pehli failing layer dhundo</h3>
<pre class="code">WLC1# debug wireless mac 0050.32e9.9f01
LAPTOP2# wifi connect NK-CORP user alice password NkWifi@2024
WLC1# show logging profile wireless filter mac 0050.32e9.9f01</pre>
<pre class="out">... [dot1x] (info): MAC: 0050.32e9.9f01 Received EAP-Response/Identity: alice
... [radius] (info): RADIUS: Send Access-Request to 10.10.60.20:1812 ...
... [radius] (info): RADIUS: Retransmit to (10.10.60.20:1812,1813) ...
... [radius] (warn): %RADIUS-4-RADIUS_DEAD: RADIUS server 10.10.60.20:1812,1813 is not responding.
... [dot1x] (<span class="hl">ERR</span>): MAC: 0050.32e9.9f01 AAA server did not answer: 802.1X authentication timed out</pre>
<p>Stage 3, <b>timeout</b>, reject nahi (chapter 10). Server ne jawab nahi diya: address, route ya key. User aur password problem nahi hain. Usi time window mein LAPTOP1 ke liye capture bhi start karo (<code>CAP-STAFF</code>, chapter 6).</p>

<h3>Round 2: RADIUS layer repair karo aur dubara trace karo</h3>
<pre class="code">WLC1(config)# radius server RAD1
WLC1(config-radius-server)# key 0 NkRadius1
LAPTOP2# wifi connect NK-CORP user alice password NkWifi@2024
WLC1# show logging profile wireless filter mac 0050.32e9.9f01</pre>
<pre class="out">... [radius] (info): RADIUS: Received from id 1812/87 10.10.60.20:0, Access-Accept ...
... [dot1x] (info): MAC: 0050.32e9.9f01 Received EAP-Success; authentication succeeded for user alice
... [client-keymgmt] (note): ... EAP Key management successful. AKM:802.1x ...
... [client-orch-sm] (<span class="hl">ERR</span>): MAC: 0050.32e9.9f01 Policy profile PP-CORP: VLAN 40 is not in the VLAN database; client cannot be placed</pre>
<p>Pehli layer gayi aur agli aayi: authentication ab succeed hota hai (Access-Accept) aur failure stage 4 par chala gaya. Yeh chapter 1 ke loop ka lesson hai. GUI: key ke liye <b>Configuration &gt; Security &gt; AAA &gt; Servers</b>; agle step ke liye <b>Configuration &gt; Layer2 &gt; VLAN</b>.</p>

<h3>Round 3: LAPTOP1 ke liye capture CAP-STAFF</h3>
<pre class="code">WLC1# monitor capture CAP-STAFF interface GigabitEthernet1 both
WLC1# monitor capture CAP-STAFF start
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
WLC1# monitor capture CAP-STAFF stop
WLC1# show monitor capture CAP-STAFF buffer brief</pre>
<p>Buffer mein DHCP Discover rows aur Offer nahi dikhna chahiye: capture lab wali hi tasveer, wahi owner, R1.</p>

<h3>Round 4: bache do owners par repair karo aur prove karo</h3>
<pre class="code">WLC1(config)# vlan 40
WLC1(config-vlan)# name CORP
R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# no shutdown
LAPTOP1# wifi connect NK-STAFF psk NkStaff2024
LAPTOP2# wifi connect NK-CORP user alice password NkWifi@2024
LAPTOP1# ping 10.10.60.20
LAPTOP2# ping 10.10.60.20</pre>
<p>Check maangta hai LAPTOP1 10.10.20.x mein aur LAPTOP2 10.10.40.x mein, dono RAD1 tak pahunchein.</p>

<div class="eg"><p><b>Worked example (evidence pack).</b> Defect 1: owner WLC1, evidence retransmits ke saath Access-Request aur RADIUS_DEAD, change <code>key 0 NkRadius1</code>, proof Access-Accept. Defect 2: owner WLC1, evidence ERR VLAN 40 database mein nahi, change <code>vlan 40</code> aur <code>name CORP</code>, proof LAPTOP2 10.10.40.x mein. Defect 3: owner R1, evidence Offer ke bina Discovers, change R1 GigabitEthernet0/0.20 par <code>no shutdown</code>, proof LAPTOP1 10.10.20.x mein. Table ki teen lines, har ek evidence aur proof ke saath, aisi ticket closure hai jo manager padh sake.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle Accept ke baad jeet ghoshit kar dena. Har change ke baad har user dubara test karo, aur client ke address ke saath S_CO_RUN tak pahunchne tak re-trace karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Multi-fault tickets mein evidence ka order matter karta hai. Baad ke stage ka error tab tak invisible ho sakta hai jab tak pehle stage ka error fix na ho, isliye failing client har repair ke baad alag line dikha sakta hai. Yeh normal hai, nayi problem nahi.</p></div>

<div class="scn"><h4>Migration ke baad Monday</h4><p>Weekend migration ke baad hospital ne "corporate Wi-Fi down" report kiya. Engineer ne ek nurse laptop trace kiya: RADIUS timeout; controller par key purane server ki thi. Fix ke baad agle trace ne VLAN missing dikhaya kyunki migration script ne policy profile banaya lekin VLAN 40 nahi. Teesri report, staff VLAN par address nahi, router ke shut sub-interface se aayi. Total fix time: 25 minutes, ticket ke saath trace files attached.</p><p><b>Lesson:</b> bade changes kai layers todte hain; evidence aur loop andaze se behtar hain.</p></div>

<div class="iv"><p class="q">"Change ke baad corporate aur staff Wi-Fi dono toote. Aap kaise approach karoge?"</p><p>Per-SSID scope: dono alag layers use karte hain (corporate ke liye 802.1X path aur VLAN, staff ke liye DHCP path). Corporate client trace karta hoon, staff client capture karta hoon, har ek ka pehla failing stage padhta hoon, ek object us ke owner par fix karta hoon, re-test aur dohrata hoon jab tak dono address ke saath run state tak na pahunchein. Traces aur captures evidence pack ke roop mein rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stage se match karta tool use karo: AAA aur VLAN ke liye trace, DHCP ke liye capture.</li>
<li>Ek defect fix karo, re-trace: agli layer dikhti hai.</li>
<li>Owners alag hain: key aur VLAN ke liye WLC1, interface ke liye R1.</li>
<li>Aakhri change ke baad status aur ping se har user prove karo.</li>
<li>Har defect ka evidence, change aur proof likho.</li>
</ul></div>
`}};export{e as default};