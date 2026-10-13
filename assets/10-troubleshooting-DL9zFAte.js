var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and the four labs, step by step`,hi:`Troubleshooting workflow aur chaaron labs, step by step`},body:{en:`
<p>A doctor does not guess; she follows the same order of checks every time. FlexConnect faults have four homes: the AP's state, its tags, the controller profiles, and what lies outside the controller (switch, DHCP, RADIUS). Walk from the AP outwards.</p>

<h3>The workflow</h3>
<ol>
<li><b>Is the AP on the controller?</b> <code>show ap summary</code>. Missing with the WAN up and Wi-Fi alive is a native VLAN mismatch or a standalone AP. Remember that standalone APs are hidden.</li>
<li><b>What is its mode and state?</b> <code>show ap name &lt;ap&gt; config general</code>: AP Mode, Flex Native VLAN versus Switch Port Native, FlexConnect State.</li>
<li><b>Which tags?</b> <code>show ap tag summary</code>, <code>show wireless tag site detailed &lt;tag&gt;</code>: is it <code>Local-site : No</code> and does it name the right flex profile?</li>
<li><b>Which policy and VLAN?</b> <code>show wireless profile policy detailed &lt;pp&gt;</code> and <code>show wireless client mac-address &lt;mac&gt; detail</code>: switching mode, VLAN placement.</li>
<li><b>The flex profile:</b> <code>show wireless profile flex detailed &lt;name&gt;</code>: native VLAN, VLAN name and id.</li>
<li><b>Outside the controller:</b> the switch port (trunk, native, allowed list), the DHCP pool, the RADIUS client list and key.</li>
<li><b>Fix one thing, retest, read the log:</b> <code>show logging</code>.</li>
</ol>
<table class="cmp">
<tr><th>Symptom</th><th>Most likely cause</th><th>Where to confirm</th></tr>
<tr><td>Client has an address in the AP management subnet</td><td>policy VLAN not mapped (typo)</td><td>flex profile detailed</td></tr>
<tr><td>Client associates, no DHCP</td><td>port not a trunk or VLAN not allowed</td><td>switch port, client detail</td></tr>
<tr><td>AP vanished, WAN fine</td><td>native VLAN mismatch</td><td>log AP_LOST, config general</td></tr>
<tr><td>Client refused, CLIENT_ASSOC_FAIL</td><td>site tag still local-site</td><td>tag site detailed</td></tr>
<tr><td>802.1X users fail only in an outage</td><td>no local authentication or AP not a RADIUS client</td><td>RADIUS log, policy detailed</td></tr>
</table>

<h3>Lab 1: Bring the Pune branch online (config)</h3>
<p>Build, in order: the flex profile (<code>wireless profile flex FLEX-PUNE</code>, <code>native-vlan-id 210</code>, <code>vlan-name STAFF-PUN</code>, <code>vlan-id 220</code>); the site tag (<code>wireless tag site SITE-PUNE</code>, <code>flex-profile FLEX-PUNE</code>, <code>no local-site</code>); the policy profile PP-STAFF-PUN (<code>vlan 220</code>, <code>no central switching</code>, <code>no shutdown</code>) and policy tag PT-PUNE; then <code>site-tag</code> and <code>policy-tag</code> on both APs. Prove it: LAPTOP2 pings 10.30.60.20 and the client detail shows <code>Switching Mode : Local</code>.</p>

<h3>Lab 2: Wrong subnet or no address (troubleshoot)</h3>
<p>Evidence: LAPTOP2 has 10.30.10.x. The client detail says the VLAN is not mapped, and the flex profile shows the typo.</p>
<pre class="out">WLC1# show wireless profile flex detailed FLEX-PUNE
Native VLAN ID                    : 210
VLAN Name                         VLAN ID
<span class="hl">STAFF-PUN                         202</span>
WLC1# show wireless client mac-address 0050.32e9.9f01 detail
  Client VLAN placement         : native VLAN 210 (VLAN id 220 is not mapped in the flex profile)</pre>
<p>Fix 1, on WLC1: <code>wireless profile flex FLEX-PUNE</code>, <code>vlan-name STAFF-PUN</code>, <code>vlan-id 220</code>. LAPTOP2 now gets 10.30.20.x. Evidence 2: LAPTOP3 near AP-PUN2 still has no address, and SW2 shows Gi0/2 as an access port. Fix 2, on SW2: <code>interface GigabitEthernet0/2</code>, <code>switchport mode trunk</code>, <code>switchport trunk native vlan 210</code>, <code>switchport trunk allowed vlan 210,220</code>. Prove with pings from both laptops.</p>

<h3>Lab 3: AP vanished, other AP refuses staff (troubleshoot)</h3>
<p>Evidence: <code>show ap summary</code> lists only AP-PUN2; the log shows AP_LOST for AP-PUN1 with <i>native VLAN mismatch: flex profile FLEX-PUNE says 1</i>. Cause one: the flex profile never got <code>native-vlan-id 210</code>. Fix: <code>wireless profile flex FLEX-PUNE</code>, <code>native-vlan-id 210</code>. AP-PUN1 returns, and guests near it (central switching, which stopped in standalone mode) see NK-GUEST again: GUEST2 gets 10.10.50.x.</p>
<p>Cause two: AP-PUN2 wears the tag SITE-PUNE-B, which still has <code>local-site</code>. The log shows CLIENT_ASSOC_FAIL. Fix: <code>wireless tag site SITE-PUNE-B</code>, <code>no local-site</code>; then, because the refused laptop paused its auto-connect, run <code>wifi connect NK-STAFF psk NkStaff2024</code> on LAPTOP3. Prove with <code>show ap tag summary</code> and <code>show wireless tag site detailed SITE-PUNE-B</code>.</p>

<h3>Lab 4: Keep the branch alive when the WAN drops (config)</h3>
<p>Build local authentication: the radius server and group RG-PUN exist already on WLC1; add <code>local-auth radius-server-group RG-PUN</code> to FLEX-PUNE and <code>no central authentication</code> to PP-CORP-PUN (shut first, enable after). On RAD-PUN register the APs from <code>show ap summary</code>: <code>aaa-server client 10.30.10.11 key NkRadius1</code> and the same for .12. Cut R2 Gi0/2 (<code>shutdown</code>). Then prove: both APs standalone, LAPTOP2 kept its address, GUEST2 is gone, and <code>wifi connect NK-CORP user alice password NkWifi@2024</code> on LAPTOP3 succeeds. Show the evidence on WLC1: <code>show logging</code> and <code>show ap summary</code>. Restore the WAN afterwards with <code>no shutdown</code>; the log then says the AP is back from FlexConnect standalone mode.</p>

<div class="eg"><p><b>Worked example.</b> A ticket says "Pune staff in the wrong subnet". Step 1: AP is listed. Step 2: FlexConnect, Connected. Step 3: tag is a flex site. Step 4: client detail says native VLAN 210. Step 5: flex profile maps STAFF-PUN to 202. Fix the id, retest. Five commands, one root cause.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing three things at once. After the first fix in lab 2, one laptop still fails. If you changed the switch too early, you would not know which change repaired which client.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read the order of the symptoms: "AP missing from the controller, but clients still work" points to standalone, not to a dead AP. Do not swap the radio.</p></div>

<div class="scn"><h4>Two faults, one ticket</h4><p>A branch ticket reported "Wi-Fi broken after the tag change". The engineer found the first AP missing (native VLAN) and fixed it, and the ticket was almost closed. A user complained the next hour: the second AP refused association. A tag still said local-site. Checking <code>show ap tag summary</code> after every fix, not only the first symptom, showed the second AP.</p><p><b>Lesson:</b> after each repair, rerun the whole workflow before you close the ticket.</p></div>

<div class="iv"><p class="q">"An AP disappeared from the controller but the branch users say Wi-Fi works. What do you check?"</p><p>That it is in standalone mode: WAN or native VLAN mismatch. Read the AP_LOST reason in the log, compare the flex profile native VLAN with the switch trunk native, ping the AP address, and check what survives: only locally switched WLANs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot from the AP outwards: summary, config general, tags, policy, flex profile, switch, RADIUS.</li>
<li>Read AP Mode, native VLAN lines and FlexConnect State first.</li>
<li>Lab 2: VLAN id typo and an access port; lab 3: native VLAN mismatch and local-site tag.</li>
<li>Lab 4: local authentication needs the group, the policy setting and RADIUS client entries.</li>
<li>Fix one thing at a time and recheck everything.</li>
</ul></div>
`,hi:`
<p>Doctor andaza nahi lagati; woh har baar checks ka wahi order follow karti hai. FlexConnect faults ke chaar ghar hain: AP ki state, uske tags, controller profiles, aur controller ke bahar ki cheezein (switch, DHCP, RADIUS). AP se bahar ki taraf chalo.</p>

<h3>Workflow</h3>
<ol>
<li><b>Kya AP controller par hai?</b> <code>show ap summary</code>. WAN up aur Wi-Fi zinda hone par gayab hona matlab native VLAN mismatch ya standalone AP. Yaad rakho standalone APs chhupe rehte hain.</li>
<li><b>Uska mode aur state kya hai?</b> <code>show ap name &lt;ap&gt; config general</code>: AP Mode, Flex Native VLAN versus Switch Port Native, FlexConnect State.</li>
<li><b>Kaunse tags?</b> <code>show ap tag summary</code>, <code>show wireless tag site detailed &lt;tag&gt;</code>: kya <code>Local-site : No</code> hai aur kya sahi flex profile ka naam hai?</li>
<li><b>Kaunsi policy aur VLAN?</b> <code>show wireless profile policy detailed &lt;pp&gt;</code> aur <code>show wireless client mac-address &lt;mac&gt; detail</code>: switching mode, VLAN placement.</li>
<li><b>Flex profile:</b> <code>show wireless profile flex detailed &lt;name&gt;</code>: native VLAN, VLAN name aur id.</li>
<li><b>Controller ke bahar:</b> switch port (trunk, native, allowed list), DHCP pool, RADIUS client list aur key.</li>
<li><b>Ek cheez fix karo, retest karo, log padho:</b> <code>show logging</code>.</li>
</ol>
<table class="cmp">
<tr><th>Symptom</th><th>Sabse likely cause</th><th>Kahan confirm karein</th></tr>
<tr><td>Client ko AP management subnet ka address</td><td>policy VLAN mapped nahi (typo)</td><td>flex profile detailed</td></tr>
<tr><td>Client associate hota hai, DHCP nahi</td><td>port trunk nahi ya VLAN allowed nahi</td><td>switch port, client detail</td></tr>
<tr><td>AP gayab, WAN theek</td><td>native VLAN mismatch</td><td>log AP_LOST, config general</td></tr>
<tr><td>Client refused, CLIENT_ASSOC_FAIL</td><td>site tag abhi bhi local-site</td><td>tag site detailed</td></tr>
<tr><td>802.1X users sirf outage mein fail</td><td>local authentication nahi ya AP RADIUS client nahi</td><td>RADIUS log, policy detailed</td></tr>
</table>

<h3>Lab 1: Pune branch ko online lao (config)</h3>
<p>Order mein banao: flex profile (<code>wireless profile flex FLEX-PUNE</code>, <code>native-vlan-id 210</code>, <code>vlan-name STAFF-PUN</code>, <code>vlan-id 220</code>); site tag (<code>wireless tag site SITE-PUNE</code>, <code>flex-profile FLEX-PUNE</code>, <code>no local-site</code>); policy profile PP-STAFF-PUN (<code>vlan 220</code>, <code>no central switching</code>, <code>no shutdown</code>) aur policy tag PT-PUNE; phir dono APs par <code>site-tag</code> aur <code>policy-tag</code>. Prove karo: LAPTOP2 10.30.60.20 ko ping kare aur client detail <code>Switching Mode : Local</code> dikhaye.</p>

<h3>Lab 2: Galat subnet ya address nahi (troubleshoot)</h3>
<p>Evidence: LAPTOP2 ko 10.30.10.x. Client detail kehta hai VLAN mapped nahi, aur flex profile typo dikhata hai.</p>
<pre class="out">WLC1# show wireless profile flex detailed FLEX-PUNE
Native VLAN ID                    : 210
VLAN Name                         VLAN ID
<span class="hl">STAFF-PUN                         202</span>
WLC1# show wireless client mac-address 0050.32e9.9f01 detail
  Client VLAN placement         : native VLAN 210 (VLAN id 220 is not mapped in the flex profile)</pre>
<p>Fix 1, WLC1 par: <code>wireless profile flex FLEX-PUNE</code>, <code>vlan-name STAFF-PUN</code>, <code>vlan-id 220</code>. LAPTOP2 ko ab 10.30.20.x milta hai. Evidence 2: AP-PUN2 ke paas LAPTOP3 ko abhi bhi address nahi, aur SW2 Gi0/2 ko access port dikhata hai. Fix 2, SW2 par: <code>interface GigabitEthernet0/2</code>, <code>switchport mode trunk</code>, <code>switchport trunk native vlan 210</code>, <code>switchport trunk allowed vlan 210,220</code>. Dono laptops se ping karke prove karo.</p>

<h3>Lab 3: AP gayab, doosra AP staff ko mana karta hai (troubleshoot)</h3>
<p>Evidence: <code>show ap summary</code> sirf AP-PUN2 dikhata hai; log mein AP-PUN1 ke liye AP_LOST hai <i>native VLAN mismatch: flex profile FLEX-PUNE says 1</i> ke saath. Cause ek: flex profile ko kabhi <code>native-vlan-id 210</code> nahi mila. Fix: <code>wireless profile flex FLEX-PUNE</code>, <code>native-vlan-id 210</code>. AP-PUN1 wapas aata hai, aur uske paas guests (central switching, jo standalone mode mein ruk gayi thi) ko NK-GUEST phir dikhta hai: GUEST2 ko 10.10.50.x milta hai.</p>
<p>Cause do: AP-PUN2 SITE-PUNE-B tag pehente hai jisme abhi bhi <code>local-site</code> hai. Log mein CLIENT_ASSOC_FAIL hai. Fix: <code>wireless tag site SITE-PUNE-B</code>, <code>no local-site</code>; phir, kyunki refuse hue laptop ka auto-connect pause ho gaya tha, LAPTOP3 par <code>wifi connect NK-STAFF psk NkStaff2024</code> chalao. <code>show ap tag summary</code> aur <code>show wireless tag site detailed SITE-PUNE-B</code> se prove karo.</p>

<h3>Lab 4: WAN girne par bhi branch ko zinda rakho (config)</h3>
<p>Local authentication banao: radius server aur group RG-PUN WLC1 par pehle se hain; FLEX-PUNE mein <code>local-auth radius-server-group RG-PUN</code> aur PP-CORP-PUN mein <code>no central authentication</code> jodo (pehle shut, baad mein enable). RAD-PUN par <code>show ap summary</code> ke APs register karo: <code>aaa-server client 10.30.10.11 key NkRadius1</code> aur .12 ke liye wahi. R2 Gi0/2 kaato (<code>shutdown</code>). Phir prove karo: dono APs standalone, LAPTOP2 ka address kept, GUEST2 gayab, aur LAPTOP3 par <code>wifi connect NK-CORP user alice password NkWifi@2024</code> succeed kare. WLC1 par evidence dikhao: <code>show logging</code> aur <code>show ap summary</code>. Baad mein <code>no shutdown</code> se WAN restore karo; log tab kehta hai ki AP FlexConnect standalone mode se wapas aa gaya.</p>

<div class="eg"><p><b>Worked example.</b> Ticket kehta hai "Pune staff galat subnet mein". Step 1: AP listed hai. Step 2: FlexConnect, Connected. Step 3: tag flex site hai. Step 4: client detail kehta hai native VLAN 210. Step 5: flex profile STAFF-PUN ko 202 se map karta hai. Id fix karo, retest karo. Paanch commands, ek root cause.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ek saath teen cheezein badalna. Lab 2 mein pehle fix ke baad ek laptop abhi bhi fail hota hai. Switch ko jaldi badal dete to pata nahi chalta kaunsa change kis client ko theek kiya.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symptoms ka order padho: "AP controller se gayab, lekin clients abhi bhi chal rahe hain" standalone ki taraf ishara karta hai, mare hue AP ki taraf nahi. Radio mat badlo.</p></div>

<div class="scn"><h4>Do faults, ek ticket</h4><p>Ek branch ticket mein likha tha "tag change ke baad Wi-Fi toota". Engineer ne pehla AP gayab paaya (native VLAN) aur fix kiya, aur ticket lagbhag close ho gaya. Agle ghante ek user ne complain kiya: doosra AP association refuse kar raha tha. Ek tag abhi bhi local-site tha. Har fix ke baad <code>show ap tag summary</code> check karne se, sirf pehle symptom par nahi, doosra AP dikh gaya.</p><p><b>Lesson:</b> har repair ke baad ticket close karne se pehle poora workflow dobara chalao.</p></div>

<div class="iv"><p class="q">"AP controller se gayab ho gaya lekin branch users kehte hain Wi-Fi chal raha hai. Kya check karte ho?"</p><p>Ki woh standalone mode mein hai: WAN ya native VLAN mismatch. Log mein AP_LOST ki reason padho, flex profile native VLAN ko switch trunk native se compare karo, AP address ping karo, aur check karo kya bachta hai: sirf locally switched WLANs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP se bahar ki taraf troubleshoot karo: summary, config general, tags, policy, flex profile, switch, RADIUS.</li>
<li>Pehle AP Mode, native VLAN lines aur FlexConnect State padho.</li>
<li>Lab 2: VLAN id typo aur access port; lab 3: native VLAN mismatch aur local-site tag.</li>
<li>Lab 4: local authentication ko group, policy setting aur RADIUS client entries chahiye.</li>
<li>Ek ek cheez fix karo aur sab kuch dobara check karo.</li>
</ul></div>
`}};export{e as default};