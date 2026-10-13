var e={id:`lab-floor-expansion`,h:{en:`Lab walkthrough: bring a third AP online (wl-floor-expansion)`,hi:`Lab walkthrough: teesra AP online laana (wl-floor-expansion)`},body:{en:`
<p>This lab is a rollout, not a fault hunt, but the same discipline applies: evidence, small change, proof. You will use the recipe from the previous chapter on real commands.</p>
<div class="eg"><p><b>Task.</b> A third AP, AP3, was installed in the new wing and cabled to SW1 GigabitEthernet0/4, but the port was never configured and AP3 sits in the default VLAN. Bring AP3 into VLAN 10, make it join, give it the staff policy tag and prove LAPTOP2 in the new wing associates through AP3.</p></div>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Floor expansion">
<rect x="10" y="70" width="70" height="40" rx="6" fill="#bae6fd"/><text x="45" y="95" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="120" y="70" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="155" y="95" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="250" y="10" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="290" y="35" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<rect x="250" y="75" width="80" height="30" rx="6" fill="#fde68a"/><text x="290" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP1 and AP2</text>
<rect x="250" y="130" width="80" height="40" rx="6" fill="#fed7aa"/><text x="290" y="155" text-anchor="middle" class="svg-ink" font-size="13">AP3 new</text>
<rect x="430" y="130" width="120" height="40" rx="6" fill="#e2e8f0"/><text x="490" y="155" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP2 new wing</text>
<line x1="80" y1="90" x2="120" y2="90" stroke="#64748b"/><line x1="190" y1="80" x2="250" y2="30" stroke="#64748b"/><line x1="190" y1="90" x2="250" y2="90" stroke="#64748b"/><line x1="190" y1="100" x2="250" y2="150" stroke="#64748b"/><line x1="330" y1="150" x2="430" y2="150" stroke="#64748b" stroke-dasharray="4"/>
<text x="215" y="170" text-anchor="middle" class="svg-accent" font-size="11">Gi0/4</text>
</svg><p class="cap">AP3 reaches the network through SW1 Gi0/4. Until that port is in VLAN 10 it cannot find the controller.</p></div>
<h3>Step 1: evidence</h3>
<pre class="code">WLC1# show ap summary
SW1# show vlan brief</pre>
<pre class="out">WLC1# show ap summary
Number of APs: 3

AP Name             Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
AP1                 2      C9120AXI-D    0050.42a6.9801  0050.42a6.9800  IN  10.10.10.11     Registered
AP2                 2      C9120AXI-D    0050.43a6.9a01  0050.43a6.9a00  IN  10.10.10.12     Registered
AP3                 2      C9120AXI-D    0050.44a6.9b01  0050.44a6.9b00  IN  -               <span class="hl">Down</span>

SW1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    <span class="hl">Gi0/4</span>, Gi0/5, Gi0/6, Gi0/7
10   AP-MGMT                          active    Gi0/2, Gi0/3</pre>
<p>AP3 is listed but Down with no IP address, and Gi0/4 is in VLAN 1 (default). AP3 gets no address from the AP-POOL, so it never learns the controller. The IP and port details of your lab will differ in the last digits; the pattern is what matters.</p>
<h3>Step 2: fix the port on SW1</h3>
<pre class="code">SW1# configure terminal
SW1(config)# interface GigabitEthernet0/4
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# end
SW1# write memory</pre>
<p>Wait a few seconds for the AP to renew DHCP and complete CAPWAP discovery, then repeat the verify command.</p>
<pre class="out">WLC1# show ap summary
Number of APs: 3

AP Name             Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
AP3                 2      C9120AXI-D    0050.44a6.9b01  0050.44a6.9b00  IN  10.10.10.13     Registered

WLC1# show ap tag summary
AP Name             AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
AP3                 0050.44a6.9b01  default-site-tag      <span class="hl">default-policy-tag</span>    default-rf-tag      No             <span class="hl">Default</span></pre>
<p>AP3 is Registered, which proves the port, DHCP, option 43 and the VLAN 99 path. It is not serving yet: its tag source is Default. <b>Registered is not the finish line.</b></p>
<h3>Step 3: give AP3 the policy tag</h3>
<pre class="code">WLC1# ap name AP3 policy-tag PT-CAMPUS
WLC1# show ap tag summary</pre>
<pre class="out">AP Name             AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
AP3                 0050.44a6.9b01  default-site-tag      <span class="hl">PT-CAMPUS</span>             default-rf-tag      No             Static</pre>
<p>PT-CAMPUS already maps NK-STAFF to PP-STAFF (VLAN 20), NK-GUEST to PP-GUEST and so on, so AP3 immediately offers the same SSIDs and VLANs as AP1 and AP2. This is the design benefit of tags: one object defines service for every AP that carries it, so users get the same subnet wherever they roam.</p>
<h3>Step 4: acceptance test</h3>
<pre class="code">LAPTOP2&gt; wifi connect NK-STAFF psk NkStaff2024
LAPTOP2&gt; wifi status
WLC1# show wireless client summary</pre>
<pre class="out">LAPTOP2&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:44:a6:9b:10
AP          : <span class="hl">AP3</span>
Band/channel: 5 GHz / 44
Signal      : -43 dBm
Security    : WPA2-Personal (PSK)
IP address  : 10.10.20.<span class="hl">11</span>/24 (DHCP)

WLC1# show wireless client summary
MAC Address     AP Name           WLAN  State             Protocol  Method
0050.32e9.9f01  AP3               1     Run               11ac      PSK</pre>
<p>The AP name in the client table is <b>AP3</b>, the VLAN is 20, the state is Run. That is proof tied to the new AP, which is stronger than "some AP serves the client". Also ping RAD1 (10.10.60.20) from LAPTOP2 to prove routing, and check that LAPTOP1 near AP1 still works (regression).</p>
<h3>Optional hardening for a real rollout</h3>
<ul>
<li>Assign the site tag and RF tag that match the other APs so country and RF policy are consistent.</li>
<li>Check <code>show ap dot11 24ghz summary</code>: if AP3 sits on the same 2.4 GHz channel as a neighbour, set non-overlapping channels with <code>ap name AP3 dot11 24ghz channel 11</code>.</li>
<li>Save the configuration and add AP3 (MAC, port, room, tags) to the design table and baseline.</li>
</ul>
<table class="cmp"><tr><th>Symptom after cabling</th><th>First check</th><th>Likely cause</th></tr>
<tr><td>AP3 not in show ap summary</td><td>SW1 show vlan brief, show interfaces trunk</td><td>Port in wrong VLAN, shut or not powered</td></tr>
<tr><td>AP3 Registered, no SSID</td><td>show ap tag summary</td><td>Tag Source Default</td></tr>
<tr><td>AP3 Registered, radios off</td><td>show ap summary CC column, country list</td><td>Country not allowed</td></tr>
<tr><td>Client on AP3 has wrong subnet</td><td>show ap tag summary</td><td>Different policy tag than AP1</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> (1) Configuring <code>switchport mode trunk</code> for an AP in local mode; use access. (2) Skipping the tag step. (3) Testing with a client that happens to be closer to AP1 and calling it success. (4) Not saving SW1 and WLC1.</p></div>
<div class="exam"><p><b>Exam trap.</b> The shortest fix list is port VLAN, then tag. Do not create a new WLAN or a new policy profile for a new AP; reuse the tag.</p></div>
<div class="scn"><h4>The invisible third AP</h4><p>A clinic added an AP in a new consulting room. The installer reported it "green" because the link LED lit. The controller never listed it. The switch port was in VLAN 1, where no DHCP server answered. After the access VLAN was set and the tag assigned, the staff laptop in that room moved off a weak signal from the corridor AP and the helpdesk complaints stopped.</p><p><b>Lesson:</b> a green LED proves the cable, not the service.</p></div>
<div class="iv"><p class="q">"Walk me through adding an AP to an existing 9800 deployment."</p><p>Cable and PoE, access port in the AP VLAN, DHCP with option 43, verify registration, apply policy, site and RF tags, check country and radios, test with a client in that area and save the configuration and documentation.</p></div>
<div class="tip"><p><b>Doing it in the web UI.</b> The SW1 access port is CLI work. On WLC1 give AP3 its tag in <b>Configuration &gt; Wireless &gt; Access Points</b>, select AP3, tab <b>Tags</b>, then prove LAPTOP2 in <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lab: Gi0/4 access VLAN 10, then AP3 policy tag PT-CAMPUS.</li>
<li>Registered proves the path; tags make it serve.</li>
<li>Reusing PT-CAMPUS gives the same SSIDs and VLANs everywhere.</li>
<li>Acceptance = client table shows AP3, VLAN 20, State Run.</li>
<li>Run a regression test and save and document the change.</li>
</ul></div>
`,hi:`
<p>Yeh lab fault hunt nahi, rollout hai, lekin wahi discipline lagta hai: evidence, chhota change, proof. Aap pichhle chapter ki recipe real commands par use karoge.</p>
<div class="eg"><p><b>Task.</b> Naye wing mein teesra AP, AP3, laga aur SW1 GigabitEthernet0/4 se cabled hai, lekin port configure nahi hua aur AP3 default VLAN mein hai. AP3 ko VLAN 10 mein laao, join karao, staff policy tag do aur prove karo ki naye wing mein LAPTOP2 AP3 ke through associate hota hai.</p></div>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Floor expansion">
<rect x="10" y="70" width="70" height="40" rx="6" fill="#bae6fd"/><text x="45" y="95" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="120" y="70" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="155" y="95" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="250" y="10" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="290" y="35" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<rect x="250" y="75" width="80" height="30" rx="6" fill="#fde68a"/><text x="290" y="95" text-anchor="middle" class="svg-ink" font-size="12">AP1 aur AP2</text>
<rect x="250" y="130" width="80" height="40" rx="6" fill="#fed7aa"/><text x="290" y="155" text-anchor="middle" class="svg-ink" font-size="13">AP3 naya</text>
<rect x="430" y="130" width="120" height="40" rx="6" fill="#e2e8f0"/><text x="490" y="155" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP2 naya wing</text>
<line x1="80" y1="90" x2="120" y2="90" stroke="#64748b"/><line x1="190" y1="80" x2="250" y2="30" stroke="#64748b"/><line x1="190" y1="90" x2="250" y2="90" stroke="#64748b"/><line x1="190" y1="100" x2="250" y2="150" stroke="#64748b"/><line x1="330" y1="150" x2="430" y2="150" stroke="#64748b" stroke-dasharray="4"/>
<text x="215" y="170" text-anchor="middle" class="svg-accent" font-size="11">Gi0/4</text>
</svg><p class="cap">AP3 SW1 Gi0/4 ke through network tak pahunchta hai. Jab tak port VLAN 10 mein nahi, woh controller nahi dhundh sakta.</p></div>
<h3>Step 1: evidence</h3>
<pre class="code">WLC1# show ap summary
SW1# show vlan brief</pre>
<pre class="out">WLC1# show ap summary
Number of APs: 3

AP Name             Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
AP1                 2      C9120AXI-D    0050.42a6.9801  0050.42a6.9800  IN  10.10.10.11     Registered
AP2                 2      C9120AXI-D    0050.43a6.9a01  0050.43a6.9a00  IN  10.10.10.12     Registered
AP3                 2      C9120AXI-D    0050.44a6.9b01  0050.44a6.9b00  IN  -               <span class="hl">Down</span>

SW1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    <span class="hl">Gi0/4</span>, Gi0/5, Gi0/6, Gi0/7
10   AP-MGMT                          active    Gi0/2, Gi0/3</pre>
<p>AP3 list mein hai lekin Down hai aur uska IP address nahi hai, aur Gi0/4 VLAN 1 (default) mein hai. AP3 ko AP-POOL se address nahi milta, isliye woh controller kabhi nahi seekhta. Aapke lab mein IP aur port details ke aakhri digits alag honge; pattern zaroori hai.</p>
<h3>Step 2: SW1 par port fix karo</h3>
<pre class="code">SW1# configure terminal
SW1(config)# interface GigabitEthernet0/4
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# end
SW1# write memory</pre>
<p>AP ko DHCP renew aur CAPWAP discovery complete karne ke liye kuch second ruko, phir verify command dobara chalao.</p>
<pre class="out">WLC1# show ap summary
Number of APs: 3

AP Name             Slots  AP Model      Ethernet MAC    Radio MAC       CC  IP Address      State
AP3                 2      C9120AXI-D    0050.44a6.9b01  0050.44a6.9b00  IN  10.10.10.13     Registered

WLC1# show ap tag summary
AP Name             AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
AP3                 0050.44a6.9b01  default-site-tag      <span class="hl">default-policy-tag</span>    default-rf-tag      No             <span class="hl">Default</span></pre>
<p>AP3 Registered hai, jo port, DHCP, option 43 aur VLAN 99 path prove karta hai. Woh abhi serve nahi kar raha: uska tag source Default hai. <b>Registered finish line nahi hai.</b></p>
<h3>Step 3: AP3 ko policy tag do</h3>
<pre class="code">WLC1# ap name AP3 policy-tag PT-CAMPUS
WLC1# show ap tag summary</pre>
<pre class="out">AP Name             AP Mac          Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
AP3                 0050.44a6.9b01  default-site-tag      <span class="hl">PT-CAMPUS</span>             default-rf-tag      No             Static</pre>
<p>PT-CAMPUS pehle se NK-STAFF ko PP-STAFF (VLAN 20), NK-GUEST ko PP-GUEST aur aise hi map karta hai, isliye AP3 turant AP1 aur AP2 jaise hi SSIDs aur VLANs offer karta hai. Tags ka design benefit yahi hai: ek object us tag wale har AP ke liye service define karta hai, to users jahan bhi roam karein unhe wahi subnet milta hai.</p>
<h3>Step 4: acceptance test</h3>
<pre class="code">LAPTOP2&gt; wifi connect NK-STAFF psk NkStaff2024
LAPTOP2&gt; wifi status
WLC1# show wireless client summary</pre>
<pre class="out">LAPTOP2&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:44:a6:9b:10
AP          : <span class="hl">AP3</span>
Band/channel: 5 GHz / 44
Signal      : -43 dBm
Security    : WPA2-Personal (PSK)
IP address  : 10.10.20.<span class="hl">11</span>/24 (DHCP)

WLC1# show wireless client summary
MAC Address     AP Name           WLAN  State             Protocol  Method
0050.32e9.9f01  AP3               1     Run               11ac      PSK</pre>
<p>Client table mein AP name <b>AP3</b> hai, VLAN 20 hai, state Run hai. Yeh naye AP se bandha proof hai, jo "koi AP client ko serve karta hai" se zyada mazboot hai. LAPTOP2 se RAD1 (10.10.60.20) bhi ping karo taaki routing prove ho, aur check karo ki AP1 ke paas LAPTOP1 abhi bhi chalta hai (regression).</p>
<h3>Real rollout ke liye optional hardening</h3>
<ul>
<li>Baaki APs jaise site tag aur RF tag assign karo taaki country aur RF policy consistent rahe.</li>
<li><code>show ap dot11 24ghz summary</code> check karo: agar AP3 pados ke same 2.4 GHz channel par hai to <code>ap name AP3 dot11 24ghz channel 11</code> se non-overlapping channels set karo.</li>
<li>Configuration save karo aur AP3 (MAC, port, room, tags) ko design table aur baseline mein jodo.</li>
</ul>
<table class="cmp"><tr><th>Cabling ke baad symptom</th><th>Pehla check</th><th>Sambhavit cause</th></tr>
<tr><td>AP3 show ap summary mein nahi</td><td>SW1 show vlan brief, show interfaces trunk</td><td>Port galat VLAN mein, shut ya unpowered</td></tr>
<tr><td>AP3 Registered, SSID nahi</td><td>show ap tag summary</td><td>Tag Source Default</td></tr>
<tr><td>AP3 Registered, radios off</td><td>show ap summary CC column, country list</td><td>Country allowed nahi</td></tr>
<tr><td>AP3 par client ka subnet galat</td><td>show ap tag summary</td><td>AP1 se alag policy tag</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> (1) Local mode AP ke liye <code>switchport mode trunk</code> configure karna; access use karo. (2) Tag step chhod dena. (3) AP1 ke paas wale client se test karke success kehna. (4) SW1 aur WLC1 save na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sabse chhoti fix list hai port VLAN, phir tag. Naye AP ke liye naya WLAN ya naya policy profile mat banao; tag reuse karo.</p></div>
<div class="scn"><h4>Invisible teesra AP</h4><p>Ek clinic ne nayi consulting room mein AP jodha. Installer ne "green" report kiya kyunki link LED jali thi. Controller ne use kabhi list nahi kiya. Switch port VLAN 1 mein tha, jahan koi DHCP server jawab nahi deta tha. Access VLAN set karne aur tag assign karne ke baad us room ka staff laptop corridor AP ke kamzor signal se hata aur helpdesk complaints ruk gayi.</p><p><b>Seekh:</b> green LED cable prove karti hai, service nahi.</p></div>
<div class="iv"><p class="q">"Existing 9800 deployment mein AP kaise add karte ho, samjhao."</p><p>Cable aur PoE, AP VLAN ka access port, option 43 ke saath DHCP, registration verify, policy, site aur RF tags, country aur radios check, us area mein client se test, aur configuration aur documentation save.</p></div>
<div class="tip"><p><b>Web UI mein kaise karein.</b> SW1 access port CLI ka kaam hai. WLC1 par AP3 ka tag <b>Configuration &gt; Wireless &gt; Access Points</b> mein do, AP3 select karo, tab <b>Tags</b>, phir LAPTOP2 ko <b>Monitoring &gt; Wireless &gt; Clients</b> mein prove karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lab: Gi0/4 access VLAN 10, phir AP3 policy tag PT-CAMPUS.</li>
<li>Registered path prove karta hai; tags use serve karate hain.</li>
<li>PT-CAMPUS reuse karne se har jagah same SSIDs aur VLANs milte hain.</li>
<li>Acceptance = client table mein AP3, VLAN 20, State Run.</li>
<li>Regression test chalao aur change ko save aur document karo.</li>
</ul></div>
`}};export{e as default};