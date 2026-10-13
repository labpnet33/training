var e={id:`rollout-theory`,h:{en:`Rolling out a new floor: ports, join, tags, profiles and acceptance`,hi:`Naya floor roll out karna: ports, join, tags, profiles aur acceptance`},body:{en:`
<p>Opening a new branch of a shop means more than putting up a sign. You need electricity, a door that opens to the right street, staff who know the menu and a test order before the doors open. Adding an access point is the same: power and cable, the right switch port, a way to find the controller, the right tags and a real client test.</p>
<h3>The rollout recipe</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Rollout steps">
<rect x="8" y="25" width="95" height="60" rx="8" fill="#bae6fd"/><text x="55" y="50" text-anchor="middle" class="svg-ink" font-size="12">1. Plan</text><text x="55" y="68" text-anchor="middle" class="svg-muted" font-size="11">survey, names</text>
<rect x="115" y="25" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="162" y="50" text-anchor="middle" class="svg-ink" font-size="12">2. Port</text><text x="162" y="68" text-anchor="middle" class="svg-muted" font-size="11">access VLAN 10</text>
<rect x="222" y="25" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="269" y="50" text-anchor="middle" class="svg-ink" font-size="12">3. Join</text><text x="269" y="68" text-anchor="middle" class="svg-muted" font-size="11">DHCP, opt 43</text>
<rect x="329" y="25" width="95" height="60" rx="8" fill="#fde68a"/><text x="376" y="50" text-anchor="middle" class="svg-ink" font-size="12">4. Tags</text><text x="376" y="68" text-anchor="middle" class="svg-muted" font-size="11">policy, site, RF</text>
<rect x="436" y="25" width="95" height="60" rx="8" fill="#fed7aa"/><text x="483" y="50" text-anchor="middle" class="svg-ink" font-size="12">5. Radios</text><text x="483" y="68" text-anchor="middle" class="svg-muted" font-size="11">channel, power</text>
<rect x="543" y="25" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="588" y="50" text-anchor="middle" class="svg-ink" font-size="12">6. Accept</text><text x="588" y="68" text-anchor="middle" class="svg-muted" font-size="11">client test</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Each step has a show command that proves it before you move on.</text>
</svg><p class="cap">The six-step AP rollout recipe used in lab wl-floor-expansion.</p></div>
<h3>1. Plan</h3>
<p>A predictive or on-site survey decides how many APs and where, based on coverage, capacity (users per radio) and materials. Choose names that tell a story: <code>AP-FL2-EAST-01</code> is better than <code>AP3</code>. Record the AP Ethernet MAC, the switch port, the room and the planned tags in the design table. Check that the switch has free PoE budget: a Wi-Fi 6 AP may need roughly 15 to 30 W.</p>
<h3>2. Port</h3>
<p>In the lab, APs sit in VLAN 10 (AP-MGMT, 10.10.10.0/24) on <b>access ports</b> because the AP tunnels client traffic to the controller in CAPWAP; the client VLANs do not appear on the AP port. A port left in the default VLAN is the number one new-AP fault: the AP gets no address from the AP-POOL and stays in discovery.</p>
<pre class="code">SW1(config)# interface GigabitEthernet0/4
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# no shutdown</pre>
<h3>3. Join</h3>
<p>The AP boots, takes an address from R1 pool AP-POOL and reads DHCP option 43 (hex <code>f104.0a0a.630a</code>, which decodes to controller 10.10.99.10). It then sends CAPWAP discovery to the wireless management interface on VLAN 99 and joins. Confirm with <code>show ap summary</code>; the State should be Registered. Details of discovery were taught in the control-plane module; here we only verify.</p>
<h3>4. Tags</h3>
<p>A freshly joined AP is untagged, so it uses <code>default-policy-tag</code> and <code>default-site-tag</code> and <code>default-rf-tag</code>. It will be Registered but serve no SSID. Assign:</p>
<table class="cmp"><tr><th>Tag</th><th>Decides</th><th>Lab value</th></tr>
<tr><td>Policy tag</td><td>Which WLANs map to which policy profile (SSIDs and VLANs)</td><td>PT-CAMPUS</td></tr>
<tr><td>Site tag</td><td>AP profile, country, join behaviour</td><td>ST-CAMPUS with AP-PROF-US or the correct country profile</td></tr>
<tr><td>RF tag</td><td>2.4 and 5 GHz RF profiles (power, band)</td><td>RF-CAMPUS</td></tr>
</table>
<pre class="code">WLC1(config)# ap name AP3 policy-tag PT-CAMPUS</pre>
<p>This form works from privileged mode as <code>ap name AP3 policy-tag PT-CAMPUS</code> in the lab. Pre-staging by Ethernet MAC (<code>ap &lt;ethernet-mac&gt;</code> then <code>policy-tag</code>, <code>site-tag</code>, <code>rf-tag</code>) lets you give tags before the AP is even plugged in, which is how large rollouts avoid empty-tag windows.</p>
<h3>5. Radios</h3>
<p>The AP country (from its AP profile, otherwise the controller list) must be in the controller wireless country list or both radios stay off. An RF profile that is shut down turns off that band for every AP using its RF tag. In real RRM the controller picks channel and power; in the lab channels are assigned deterministically, so use <code>show ap dot11 24ghz summary</code> and <code>show ap dot11 5ghz summary</code> to read them and overlap rules from the RF module to judge. A new AP should not share a 2.4 GHz channel with a neighbour (use 1, 6, 11).</p>
<h3>6. Acceptance</h3>
<p>Never accept an AP because it shows Registered. Run a client test at the new location: associate to each SSID that should be offered, check the VLAN and IP, ping the gateway and a server, and check that the client's AP in <code>show wireless client summary</code> is the new AP. Negative tests apply too: the guest SSID must not reach servers.</p>
<div class="eg"><p><b>Worked example.</b> AP3 is cabled to SW1 Gi0/4, but the port is in the default VLAN. <code>show ap summary</code> lists only AP1 and AP2. After <code>switchport access vlan 10</code>, AP3 gets 10.10.10.x from AP-POOL, joins, shows Registered with Tag Source Default, then the policy tag is set. LAPTOP2 near AP3 associates to NK-STAFF in VLAN 20.</p></div>
<div class="warn"><p><b>Common mistakes.</b> (1) Trunk instead of access on an AP port in local mode, or the wrong access VLAN. (2) Forgetting that a new AP has no tags. (3) Putting the wrong country in a site profile, leaving radios off. (4) Marking the job done without a real client test.</p></div>
<div class="exam"><p><b>Exam trap.</b> The new AP joined but no SSID: think tags first. The new AP did not join: think port VLAN, DHCP option 43 and the management path first.</p></div>
<div class="scn"><h4>The warehouse wing</h4><p>A logistics firm added six APs to a new wing over a weekend. Four joined; two stayed in discovery. The installer had patched those two into ports left in the default VLAN. The tag step was scripted, so the four joined APs served staff Wi-Fi immediately. The fix for the others was one access-VLAN line per port.</p><p><b>Lesson:</b> a scripted tag step plus a verified port template makes rollouts boring, which is the goal.</p></div>
<div class="iv"><p class="q">"A new AP is plugged in and nothing happens. What do you check?"</p><p>Port and VLAN, PoE, DHCP address, option 43 or another discovery method, reachability of the management interface, registration in show ap summary, then tags, country and radios, and finally a client test.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Recipe: plan, port, join, tags, radios, acceptance.</li>
<li>AP ports are access ports in VLAN 10 in the lab.</li>
<li>New APs use default tags and serve no SSID until tagged.</li>
<li>Country and RF profile state decide whether radios serve.</li>
<li>Accept only after a real client test at the new location.</li>
</ul></div>
`,hi:`
<p>Dukaan ki nayi branch kholna sirf board lagana nahi hai. Bijli, sahi street par khulta darwaza, menu jaanne wala staff aur khulne se pehle ek test order chahiye. Access point jodna bhi aisa hi hai: power aur cable, sahi switch port, controller dhundhne ka tareeka, sahi tags aur ek real client test.</p>
<h3>Rollout recipe</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Rollout steps">
<rect x="8" y="25" width="95" height="60" rx="8" fill="#bae6fd"/><text x="55" y="50" text-anchor="middle" class="svg-ink" font-size="12">1. Plan</text><text x="55" y="68" text-anchor="middle" class="svg-muted" font-size="11">survey, names</text>
<rect x="115" y="25" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="162" y="50" text-anchor="middle" class="svg-ink" font-size="12">2. Port</text><text x="162" y="68" text-anchor="middle" class="svg-muted" font-size="11">access VLAN 10</text>
<rect x="222" y="25" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="269" y="50" text-anchor="middle" class="svg-ink" font-size="12">3. Join</text><text x="269" y="68" text-anchor="middle" class="svg-muted" font-size="11">DHCP, opt 43</text>
<rect x="329" y="25" width="95" height="60" rx="8" fill="#fde68a"/><text x="376" y="50" text-anchor="middle" class="svg-ink" font-size="12">4. Tags</text><text x="376" y="68" text-anchor="middle" class="svg-muted" font-size="11">policy, site, RF</text>
<rect x="436" y="25" width="95" height="60" rx="8" fill="#fed7aa"/><text x="483" y="50" text-anchor="middle" class="svg-ink" font-size="12">5. Radios</text><text x="483" y="68" text-anchor="middle" class="svg-muted" font-size="11">channel, power</text>
<rect x="543" y="25" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="588" y="50" text-anchor="middle" class="svg-ink" font-size="12">6. Accept</text><text x="588" y="68" text-anchor="middle" class="svg-muted" font-size="11">client test</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Aage badhne se pehle har step ka show command use prove karta hai.</text>
</svg><p class="cap">Lab wl-floor-expansion mein use hone wali chhe-step AP rollout recipe.</p></div>
<h3>1. Plan</h3>
<p>Predictive ya on-site survey decide karta hai kitne APs aur kahan, coverage, capacity (users per radio) aur materials ke basis par. Aise names chuno jo kahani batayein: <code>AP-FL2-EAST-01</code>, <code>AP3</code> se behtar hai. AP ka Ethernet MAC, switch port, room aur planned tags design table mein likho. Check karo switch ke paas free PoE budget hai: Wi-Fi 6 AP ko lagbhag 15 se 30 W chahiye ho sakta hai.</p>
<h3>2. Port</h3>
<p>Lab mein APs VLAN 10 (AP-MGMT, 10.10.10.0/24) mein <b>access ports</b> par hain kyunki AP client traffic ko CAPWAP mein controller tak tunnel karta hai; client VLANs AP port par nahi dikhte. Default VLAN mein chhoda gaya port naye AP ka number one fault hai: AP ko AP-POOL se address nahi milta aur woh discovery mein rehta hai.</p>
<pre class="code">SW1(config)# interface GigabitEthernet0/4
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# no shutdown</pre>
<h3>3. Join</h3>
<p>AP boot hota hai, R1 ke pool AP-POOL se address leta hai aur DHCP option 43 padhta hai (hex <code>f104.0a0a.630a</code>, jo controller 10.10.99.10 decode hota hai). Phir woh VLAN 99 ke wireless management interface par CAPWAP discovery bhejta hai aur join karta hai. <code>show ap summary</code> se confirm karo; State Registered hona chahiye. Discovery ki details control-plane module mein padhai thi; yahan sirf verify karte hain.</p>
<h3>4. Tags</h3>
<p>Naya join hua AP untagged hota hai, isliye <code>default-policy-tag</code>, <code>default-site-tag</code> aur <code>default-rf-tag</code> use karta hai. Woh Registered hoga lekin koi SSID serve nahi karega. Assign karo:</p>
<table class="cmp"><tr><th>Tag</th><th>Kya decide karta hai</th><th>Lab value</th></tr>
<tr><td>Policy tag</td><td>Kaunsa WLAN kaunsi policy profile se map hai (SSIDs aur VLANs)</td><td>PT-CAMPUS</td></tr>
<tr><td>Site tag</td><td>AP profile, country, join behaviour</td><td>ST-CAMPUS, AP-PROF-US ya sahi country profile ke saath</td></tr>
<tr><td>RF tag</td><td>2.4 aur 5 GHz RF profiles (power, band)</td><td>RF-CAMPUS</td></tr>
</table>
<pre class="code">WLC1(config)# ap name AP3 policy-tag PT-CAMPUS</pre>
<p>Lab mein yeh form privileged mode se <code>ap name AP3 policy-tag PT-CAMPUS</code> ki tarah chalta hai. Ethernet MAC se pre-staging (<code>ap &lt;ethernet-mac&gt;</code> phir <code>policy-tag</code>, <code>site-tag</code>, <code>rf-tag</code>) AP plug hone se pehle hi tags dene deta hai, jisse bade rollouts empty-tag window se bachte hain.</p>
<h3>5. Radios</h3>
<p>AP country (AP profile se, warna controller list se) controller wireless country list mein honi chahiye warna dono radios off rehte hain. Shut down RF profile us RF tag wale har AP ke liye woh band band kar deta hai. Real RRM mein controller channel aur power chunta hai; lab mein channels deterministically assign hote hain, isliye <code>show ap dot11 24ghz summary</code> aur <code>show ap dot11 5ghz summary</code> se padho aur RF module ke overlap rules se judge karo. Naya AP pados ke saath 2.4 GHz channel share na kare (1, 6, 11 use karo).</p>
<h3>6. Acceptance</h3>
<p>Sirf Registered dikhne par AP accept mat karo. Naye location par client test chalao: har SSID par associate karo jo offer hona chahiye, VLAN aur IP check karo, gateway aur server ping karo, aur <code>show wireless client summary</code> mein check karo ki client ka AP naya AP hai. Negative tests bhi lagte hain: guest SSID servers tak nahi pahunchna chahiye.</p>
<div class="eg"><p><b>Worked example.</b> AP3 SW1 Gi0/4 se cabled hai, lekin port default VLAN mein hai. <code>show ap summary</code> sirf AP1 aur AP2 dikhata hai. <code>switchport access vlan 10</code> ke baad AP3 ko AP-POOL se 10.10.10.x milta hai, join karta hai, Tag Source Default ke saath Registered dikhta hai, phir policy tag set hota hai. Naye hisse ke paas LAPTOP2 NK-STAFF par VLAN 20 mein associate hota hai.</p></div>
<div class="warn"><p><b>Common mistakes.</b> (1) Local mode AP port par trunk ya galat access VLAN. (2) Bhoolna ki naye AP ke paas koi tag nahi hota. (3) Site profile mein galat country, jisse radios off rehte hain. (4) Real client test ke bina kaam done maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Naya AP join hua lekin SSID nahi: pehle tags socho. Naya AP join nahi hua: pehle port VLAN, DHCP option 43 aur management path socho.</p></div>
<div class="scn"><h4>Warehouse wing</h4><p>Ek logistics firm ne weekend mein naye wing mein chhe APs jode. Chaar join hue; do discovery mein rahe. Installer ne un do ko default VLAN wale ports mein patch kiya tha. Tag step script se hota tha, isliye jo chaar join hue unhone turant staff Wi-Fi serve kiya. Baaki ka fix har port par ek access-VLAN line thi.</p><p><b>Seekh:</b> scripted tag step aur verified port template rollouts ko boring bana dete hain, aur yahi goal hai.</p></div>
<div class="iv"><p class="q">"Naya AP plug kiya aur kuch nahi hua. Kya check karte ho?"</p><p>Port aur VLAN, PoE, DHCP address, option 43 ya dusra discovery method, management interface ki reachability, show ap summary mein registration, phir tags, country aur radios, aur ant mein client test.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Recipe: plan, port, join, tags, radios, acceptance.</li>
<li>Lab mein AP ports VLAN 10 ke access ports hain.</li>
<li>Naye APs default tags use karte hain aur tag hone tak koi SSID serve nahi karte.</li>
<li>Country aur RF profile state decide karte hain ki radios serve karenge ya nahi.</li>
<li>Naye location par real client test ke baad hi accept karo.</li>
</ul></div>
`}};export{e as default};