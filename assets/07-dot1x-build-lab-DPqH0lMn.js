var e={id:`dot1x-build-lab`,h:{en:`Lab walkthrough: building the 802.1X corporate WLAN (wl-dot1x-build)`,hi:`Lab walkthrough: 802.1X corporate WLAN build karna (wl-dot1x-build)`},body:{en:`
<p>Staff Wi-Fi (NK-STAFF) already works. Now you add the corporate WLAN <b>NK-CORP</b> (id 2) with WPA2-Enterprise. You will build the whole chain from chapter 6, add the WLAN, create a policy profile on VLAN 40, map them in the policy tag and prove two things: alice joins VLAN 40, and a wrong password is rejected. This is the lab <code>wl-dot1x-build</code>.</p>

<h3>The build order</h3>
<p>Build from the bottom of the dependency chain upwards. An object cannot refer to something that does not exist yet.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Build order">
<rect x="20" y="20" width="270" height="34" rx="8" fill="#ddd6fe"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="12">1. radius server RAD1 (address, key)</text>
<rect x="20" y="62" width="270" height="34" rx="8" fill="#bbf7d0"/><text x="155" y="84" text-anchor="middle" class="svg-ink" font-size="12">2. aaa new-model + group RG-NK</text>
<rect x="20" y="104" width="270" height="34" rx="8" fill="#bae6fd"/><text x="155" y="126" text-anchor="middle" class="svg-ink" font-size="12">3. method list NK-DOT1X</text>
<rect x="350" y="20" width="270" height="34" rx="8" fill="#fde68a"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="12">4. wlan NK-CORP 2 + authentication-list</text>
<rect x="350" y="62" width="270" height="34" rx="8" fill="#fed7aa"/><text x="485" y="84" text-anchor="middle" class="svg-ink" font-size="12">5. policy profile PP-CORP, VLAN 40</text>
<rect x="350" y="104" width="270" height="34" rx="8" fill="#e2e8f0"/><text x="485" y="126" text-anchor="middle" class="svg-ink" font-size="12">6. policy tag PT-CAMPUS map</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">AP1 and AP2 already carry PT-CAMPUS, so no AP change is needed</text>
<text x="320" y="202" text-anchor="middle" class="svg-muted" font-size="12">Prove: alice joins VLAN 40; wrong password is rejected</text>
</svg><p class="cap">Left column is AAA, right column is the WLAN side. The tag already reaches the APs.</p></div>

<h3>Part 1: AAA objects</h3>
<pre class="code">WLC1(config)# radius server RAD1
WLC1(config-radius-server)# address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
WLC1(config-radius-server)# key 0 NkRadius1
WLC1(config-radius-server)# exit
WLC1(config)# aaa new-model
WLC1(config)# aaa group server radius RG-NK
WLC1(config-sg-radius)# server name RAD1
WLC1(config-sg-radius)# exit
WLC1(config)# aaa authentication dot1x NK-DOT1X group RG-NK</pre>
<p>The controller sends RADIUS from its management address 10.10.99.10. R1 routes it to RAD1 at 10.10.60.20 in the server network. RAD1 is already prepared with the controller as a client and the secret NkRadius1.</p>

<h3>Part 2: the WLAN and the policy</h3>
<pre class="code">WLC1(config)# wlan NK-CORP 2 NK-CORP
WLC1(config-wlan)# security dot1x authentication-list NK-DOT1X
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# exit
WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# vlan 40
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-CORP policy PP-CORP
WLC1(config-policy-tag)# end
WLC1# write memory</pre>
<p>A new WLAN defaults to WPA2 with the 802.1X key management, so you do not retype the AKM. You need only point it to the method list. Both the WLAN and the policy profile start shut down, so each needs <code>no shutdown</code>. The policy VLAN 40 must exist in the controller VLAN database. The tag mapping is what makes AP1 and AP2 broadcast NK-CORP, because both already have PT-CAMPUS.</p>
<div class="note"><p>On a real 9800 you also choose <code>security wpa akm dot1x</code> explicitly in scripts for clarity, and add authorization and accounting lists. The shape of the configuration is the same.</p></div>

<h3>Part 3: verify the objects</h3>
<pre class="out">WLC1# show wlan summary
ID   Profile Name    SSID          Status   Security
1    NK-STAFF        NK-STAFF      UP       [WPA2][PSK][AES]
<span class="hl">2    NK-CORP         NK-CORP       UP       [WPA2][802.1X][AES]</span>

WLC1# show wireless tag policy detailed PT-CAMPUS
Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 2
WLAN Profile Name    Policy Name
NK-STAFF             PP-STAFF
<span class="hl">NK-CORP              PP-CORP</span></pre>

<h3>Part 4: prove it from the client</h3>
<pre class="code">LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024
LAPTOP1&gt; wifi status
LAPTOP1&gt; ping 10.10.60.20

LAPTOP2&gt; wifi connect NK-CORP user alice password WrongPass1</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID: NK-CORP   State: <span class="hl">Associated</span>   VLAN 40   Gateway: 10.10.40.1

LAPTOP2&gt; wifi connect NK-CORP user alice password WrongPass1
<span class="hl">Authentication failed: RADIUS Access-Reject for user alice.</span>

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, <span class="hl">requests 2</span>, timeouts 0</pre>
<p>The counters tell the whole story. Two requests reached RAD1 and RAD1 answered both (one Accept, one Reject), so there were no timeouts. A reject is the server saying "I received your request, I verified it and the credentials are wrong". That is very different from a timeout, which means the server did not answer at all.</p>

<h3>If it does not work: the order of checks</h3>
<table class="cmp"><tr><th>Check</th><th>Command</th><th>Typical finding</th></tr>
<tr><td>AAA enabled?</td><td>show running-config | include aaa</td><td>Missing aaa new-model</td></tr>
<tr><td>Method list name?</td><td>show running-config | section wlan NK-CORP</td><td>Wrong list name on the WLAN</td></tr>
<tr><td>Group has the server?</td><td>show radius server-group all</td><td>Server name missing from RG-NK</td></tr>
<tr><td>Server reachable?</td><td>ping 10.10.60.20</td><td>Routing or VLAN 99 issue</td></tr>
<tr><td>Policy VLAN exists?</td><td>show vlan brief</td><td>VLAN 40 missing</td></tr>
<tr><td>Policy mapped?</td><td>show wireless tag policy detailed PT-CAMPUS</td><td>NK-CORP not mapped</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Creating the WLAN with an authentication list before the list exists. The WLAN then has nobody to ask, and the client fails with a "no RADIUS server" message. Build the AAA chain first.</p></div>
<div class="exam"><p><b>Exam trap.</b> The WLAN is mapped to a policy profile through the <b>policy tag</b>. Creating PP-CORP alone does nothing: if the tag has no entry for NK-CORP, no AP broadcasts it.</p></div>

<div class="scn"><h4>NK-CORP exists but nobody can see it</h4><p>An engineer built the AAA chain, the WLAN and PP-CORP and saw the WLAN as UP. But the SSID did not appear. The policy tag PT-CAMPUS had no entry for NK-CORP, so AP1 and AP2 had no mapping to broadcast it. One line in the tag fixed it.</p><p><b>Lesson:</b> a WLAN is broadcast only when the tag maps it to an enabled policy profile.</p></div>
<div class="iv"><p class="q">"List the objects needed for an 802.1X WLAN on a 9800."</p><p>RADIUS server, AAA new-model, server group, authentication method list (dot1x), WLAN profile with the list, policy profile with a VLAN, policy tag mapping the WLAN to the policy, and AP tags. Bonus: authorization and accounting lists, CoA and a second server.</p></div>
<div class="tip"><p><b>Doing it in the web UI.</b> <b>Configuration &gt; Security &gt; AAA</b>, tabs <b>Servers</b> (RAD1), <b>Server Groups</b> (RG-NK) and <b>AAA Method List</b> (NK-DOT1X); then <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add</b> (NK-CORP with 802.1X), <b>Policy &gt; Add</b> (PP-CORP, VLAN 40) and <b>Tags &gt; Policy</b> (map them in PT-CAMPUS). Prove it in <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build the AAA chain first, then WLAN, policy profile and tag.</li>
<li>New WLANs and policy profiles start shut down: enable both.</li>
<li>PT-CAMPUS already reaches both APs, so only the mapping is added.</li>
<li>A wrong password gives Access-Reject; counters show requests with no timeouts.</li>
<li>Prove both: alice in VLAN 40 and the wrong password rejected.</li>
</ul></div>
`,hi:`
<p>Staff Wi-Fi (NK-STAFF) pehle se chal raha hai. Ab aap corporate WLAN <b>NK-CORP</b> (id 2) WPA2-Enterprise ke saath add karte ho. Chapter 6 ki poori chain build karoge, WLAN add karoge, VLAN 40 par policy profile banaoge, policy tag mein map karoge aur do cheezein prove karoge: alice VLAN 40 mein join hoti hai, aur galat password reject hota hai. Yeh lab <code>wl-dot1x-build</code> hai.</p>

<h3>Build order</h3>
<p>Dependency chain ke bottom se upar ki taraf build karo. Koi object aisi cheez ko refer nahi kar sakta jo abhi exist nahi karti.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Build order">
<rect x="20" y="20" width="270" height="34" rx="8" fill="#ddd6fe"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="12">1. radius server RAD1 (address, key)</text>
<rect x="20" y="62" width="270" height="34" rx="8" fill="#bbf7d0"/><text x="155" y="84" text-anchor="middle" class="svg-ink" font-size="12">2. aaa new-model + group RG-NK</text>
<rect x="20" y="104" width="270" height="34" rx="8" fill="#bae6fd"/><text x="155" y="126" text-anchor="middle" class="svg-ink" font-size="12">3. method list NK-DOT1X</text>
<rect x="350" y="20" width="270" height="34" rx="8" fill="#fde68a"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="12">4. wlan NK-CORP 2 + authentication-list</text>
<rect x="350" y="62" width="270" height="34" rx="8" fill="#fed7aa"/><text x="485" y="84" text-anchor="middle" class="svg-ink" font-size="12">5. policy profile PP-CORP, VLAN 40</text>
<rect x="350" y="104" width="270" height="34" rx="8" fill="#e2e8f0"/><text x="485" y="126" text-anchor="middle" class="svg-ink" font-size="12">6. policy tag PT-CAMPUS map</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">AP1 aur AP2 mein pehle se PT-CAMPUS hai, to AP change nahi chahiye</text>
<text x="320" y="202" text-anchor="middle" class="svg-muted" font-size="12">Prove: alice VLAN 40 mein join; galat password reject</text>
</svg><p class="cap">Left column AAA hai, right column WLAN side. Tag pehle se APs tak pahunchta hai.</p></div>

<h3>Part 1: AAA objects</h3>
<pre class="code">WLC1(config)# radius server RAD1
WLC1(config-radius-server)# address ipv4 10.10.60.20 auth-port 1812 acct-port 1813
WLC1(config-radius-server)# key 0 NkRadius1
WLC1(config-radius-server)# exit
WLC1(config)# aaa new-model
WLC1(config)# aaa group server radius RG-NK
WLC1(config-sg-radius)# server name RAD1
WLC1(config-sg-radius)# exit
WLC1(config)# aaa authentication dot1x NK-DOT1X group RG-NK</pre>
<p>Controller RADIUS apne management address 10.10.99.10 se bhejta hai. R1 use server network mein RAD1 10.10.60.20 tak route karta hai. RAD1 pehle se controller ko client ke roop mein aur secret NkRadius1 ke saath prepared hai.</p>

<h3>Part 2: WLAN aur policy</h3>
<pre class="code">WLC1(config)# wlan NK-CORP 2 NK-CORP
WLC1(config-wlan)# security dot1x authentication-list NK-DOT1X
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# exit
WLC1(config)# wireless profile policy PP-CORP
WLC1(config-wireless-policy)# vlan 40
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-CORP policy PP-CORP
WLC1(config-policy-tag)# end
WLC1# write memory</pre>
<p>Naya WLAN default mein 802.1X key management ke saath WPA2 hota hai, to AKM dobara type nahi karte. Bas use method list par point karna hota hai. WLAN aur policy profile dono shut down start hote hain, to dono ko <code>no shutdown</code> chahiye. Policy VLAN 40 controller VLAN database mein hona zaroori hai. Tag mapping hi AP1 aur AP2 ko NK-CORP broadcast karwata hai, kyunki dono ke paas pehle se PT-CAMPUS hai.</p>
<div class="note"><p>Real 9800 par scripts mein clarity ke liye <code>security wpa akm dot1x</code> explicitly choose karte hain, aur authorization aur accounting lists add karte hain. Configuration ki shape wahi hai.</p></div>

<h3>Part 3: objects verify karo</h3>
<pre class="out">WLC1# show wlan summary
ID   Profile Name    SSID          Status   Security
1    NK-STAFF        NK-STAFF      UP       [WPA2][PSK][AES]
<span class="hl">2    NK-CORP         NK-CORP       UP       [WPA2][802.1X][AES]</span>

WLC1# show wireless tag policy detailed PT-CAMPUS
Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 2
WLAN Profile Name    Policy Name
NK-STAFF             PP-STAFF
<span class="hl">NK-CORP              PP-CORP</span></pre>

<h3>Part 4: client se prove karo</h3>
<pre class="code">LAPTOP1&gt; wifi connect NK-CORP user alice password NkWifi@2024
LAPTOP1&gt; wifi status
LAPTOP1&gt; ping 10.10.60.20

LAPTOP2&gt; wifi connect NK-CORP user alice password WrongPass1</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID: NK-CORP   State: <span class="hl">Associated</span>   VLAN 40   Gateway: 10.10.40.1

LAPTOP2&gt; wifi connect NK-CORP user alice password WrongPass1
<span class="hl">Authentication failed: RADIUS Access-Reject for user alice.</span>

WLC1# show aaa servers
RADIUS: id RAD1, host 10.10.60.20, auth-port 1812, <span class="hl">requests 2</span>, timeouts 0</pre>
<p>Counters poori kahani batate hain. Do requests RAD1 tak pahunchi aur RAD1 ne dono ka jawab diya (ek Accept, ek Reject), to timeouts nahi hue. Reject ka matlab server keh raha hai "mujhe aapki request mili, maine verify kiya aur credentials galat hain". Yeh timeout se bahut alag hai, jiska matlab server ne jawab hi nahi diya.</p>

<h3>Kaam na kare to checks ka order</h3>
<table class="cmp"><tr><th>Check</th><th>Command</th><th>Typical finding</th></tr>
<tr><td>AAA enabled?</td><td>show running-config | include aaa</td><td>aaa new-model missing</td></tr>
<tr><td>Method list ka naam?</td><td>show running-config | section wlan NK-CORP</td><td>WLAN par galat list name</td></tr>
<tr><td>Group mein server hai?</td><td>show radius server-group all</td><td>RG-NK mein server name missing</td></tr>
<tr><td>Server reachable?</td><td>ping 10.10.60.20</td><td>Routing ya VLAN 99 issue</td></tr>
<tr><td>Policy VLAN exist karta hai?</td><td>show vlan brief</td><td>VLAN 40 missing</td></tr>
<tr><td>Policy mapped?</td><td>show wireless tag policy detailed PT-CAMPUS</td><td>NK-CORP mapped nahi</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> List exist karne se pehle WLAN ko authentication list ke saath banana. Tab WLAN ke paas poochne wala koi nahi hota, aur client "no RADIUS server" message ke saath fail hota hai. Pehle AAA chain build karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> WLAN <b>policy tag</b> ke through policy profile se map hota hai. Sirf PP-CORP banane se kuch nahi hota: agar tag mein NK-CORP ki entry nahi hai to koi AP use broadcast nahi karta.</p></div>

<div class="scn"><h4>NK-CORP exist karta hai lekin koi dekh nahi sakta</h4><p>Ek engineer ne AAA chain, WLAN aur PP-CORP banaye aur WLAN UP dikha. Lekin SSID appear nahi hua. Policy tag PT-CAMPUS mein NK-CORP ki entry nahi thi, to AP1 aur AP2 ke paas broadcast karne ka mapping nahi tha. Tag mein ek line se fix hua.</p><p><b>Lesson:</b> WLAN tabhi broadcast hota hai jab tag use enabled policy profile se map kare.</p></div>
<div class="iv"><p class="q">"9800 par 802.1X WLAN ke liye zaroori objects batao."</p><p>RADIUS server, AAA new-model, server group, authentication method list (dot1x), list ke saath WLAN profile, VLAN ke saath policy profile, WLAN ko policy se map karne wala policy tag, aur AP tags. Bonus: authorization aur accounting lists, CoA aur doosra server.</p></div>
<div class="tip"><p><b>Web UI mein kaise karein.</b> <b>Configuration &gt; Security &gt; AAA</b>, tabs <b>Servers</b> (RAD1), <b>Server Groups</b> (RG-NK) aur <b>AAA Method List</b> (NK-DOT1X); phir <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add</b> (802.1X ke saath NK-CORP), <b>Policy &gt; Add</b> (PP-CORP, VLAN 40) aur <b>Tags &gt; Policy</b> (PT-CAMPUS mein map karo). Prove karo <b>Monitoring &gt; Wireless &gt; Clients</b> mein.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle AAA chain build karo, phir WLAN, policy profile aur tag.</li>
<li>Naye WLANs aur policy profiles shut down start hote hain: dono enable karo.</li>
<li>PT-CAMPUS pehle se dono APs tak pahunchta hai, to sirf mapping add hoti hai.</li>
<li>Galat password Access-Reject deta hai; counters mein requests dikhte hain, timeouts nahi.</li>
<li>Dono prove karo: alice VLAN 40 mein aur galat password reject.</li>
</ul></div>
`}};export{e as default};