var e={id:`first-wlan-lab`,h:{en:`Build the first WLAN end to end (lab wl-first-wlan)`,hi:`Pehla WLAN end to end banao (lab wl-first-wlan)`},body:{en:`
<p>Now you put chapters 5 and 6 into practice. The goal of lab wl-first-wlan is simple to say: LAPTOP1 must join NK-STAFF, land in VLAN 20 and reach the server RAD1 at 10.10.60.20. We will plan first, then build, then prove, the way a professional change is done.</p>

<h3>Plan on paper first</h3>
<table class="cmp"><tr><th>Object</th><th>Name</th><th>Key settings</th></tr>
<tr><td>WLAN profile</td><td>NK-STAFF</td><td>id 1, SSID NK-STAFF, WPA2-PSK, key NkStaff2024</td></tr>
<tr><td>Policy profile</td><td>PP-STAFF</td><td>VLAN 20, central switching</td></tr>
<tr><td>Policy tag</td><td>PT-CAMPUS</td><td>NK-STAFF mapped to PP-STAFF</td></tr>
<tr><td>AP tagging</td><td>AP1, AP2</td><td>policy tag PT-CAMPUS</td></tr></table>
<p>Also confirm the pre-conditions: both APs are registered (lab 1), VLAN 20 exists in the controller, SW1 trunks VLAN 20 towards the controller and APs, and R1 has the VLAN 20 gateway and DHCP pool (10.10.20.0/24). The first two are on the controller; the last ones belong to the lab environment.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Client path">
<rect x="10" y="80" width="100" height="44" rx="8" fill="#fed7aa"/><text x="60" y="106" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP1</text>
<rect x="150" y="80" width="90" height="44" rx="8" fill="#fde68a"/><text x="195" y="106" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="280" y="80" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="335" y="100" text-anchor="middle" class="svg-ink" font-size="12">WLC1 tunnel</text><text x="335" y="116" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20</text>
<rect x="430" y="80" width="80" height="44" rx="8" fill="#bae6fd"/><text x="470" y="106" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="550" y="80" width="80" height="44" rx="8" fill="#bbf7d0"/><text x="590" y="100" text-anchor="middle" class="svg-ink" font-size="12">R1</text><text x="590" y="116" text-anchor="middle" class="svg-muted" font-size="11">RAD1 beyond</text>
<line x1="110" y1="102" x2="150" y2="102" stroke="#64748b" stroke-dasharray="5 4"/><line x1="240" y1="102" x2="280" y2="102" stroke="#64748b"/><line x1="390" y1="102" x2="430" y2="102" stroke="#64748b"/><line x1="510" y1="102" x2="550" y2="102" stroke="#64748b"/>
<text x="195" y="150" text-anchor="middle" class="svg-muted" font-size="11">1 radio + auth</text><text x="335" y="150" text-anchor="middle" class="svg-muted" font-size="11">2 CAPWAP data</text><text x="470" y="150" text-anchor="middle" class="svg-muted" font-size="11">3 VLAN 20 trunk</text><text x="590" y="150" text-anchor="middle" class="svg-muted" font-size="11">4 DHCP, route</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Association, DHCP and the ping each prove a different link in this path</text>
</svg><p class="cap">The client path. The policy VLAN decides which DHCP pool and which gateway the client meets at the router.</p></div>

<h3>Build</h3>
<pre class="code"><span class="c">! 1. WLAN profile: SSID, WPA2-PSK, enabled</span>
WLC1(config)# wlan NK-STAFF 1 NK-STAFF
WLC1(config-wlan)# no security wpa akm dot1x
WLC1(config-wlan)# security wpa akm psk
WLC1(config-wlan)# security wpa psk set-key ascii 0 NkStaff2024
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# exit
<span class="c">! 2. Policy profile: VLAN 20, enabled</span>
WLC1(config)# wireless profile policy PP-STAFF
WLC1(config-wireless-policy)# vlan 20
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
<span class="c">! 3. Policy tag: map the WLAN to the policy</span>
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-STAFF policy PP-STAFF
WLC1(config-policy-tag)# exit
WLC1(config)# end
<span class="c">! 4. Tag the APs (exec mode)</span>
WLC1# ap name AP1 policy-tag PT-CAMPUS
WLC1# ap name AP2 policy-tag PT-CAMPUS
WLC1# write memory</pre>
<p>The order inside the tag is <code>wlan &lt;WLAN profile name&gt; policy &lt;policy profile name&gt;</code>. The tag only stores the pair, so the WLAN and policy profile should already exist when you map them.</p>

<h3>Prove, layer by layer</h3>
<pre class="out">WLC1# show wireless tag policy detailed PT-CAMPUS

Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 1

WLAN Profile Name                   Policy Name
------------------------------------------------------------
<span class="hl">NK-STAFF                            PP-STAFF</span>

WLC1# show ap tag summary

Number of APs: 2

AP Name              AP Mac           Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
------------------------------------------------------------
AP1                  aaaa.bb01.0001   default-site-tag      <span class="hl">PT-CAMPUS</span>            default-rf-tag      No             Static
AP2                  aaaa.bb01.0002   default-site-tag      <span class="hl">PT-CAMPUS</span>            default-rf-tag      No             Static</pre>
<p>Now the client side. On LAPTOP1 use the Wi-Fi commands from the lab:</p>
<pre class="out">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:42:a6:98:10
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -62 dBm
Security    : WPA2-Personal (PSK)
IP address  : <span class="hl">10.10.20.11/24 (DHCP)</span>

LAPTOP1&gt; ping 10.10.60.20
<span class="hl">84 bytes from 10.10.60.20 icmp_seq=1 ttl=63 time=0.500 ms</span></pre>
<p>Read each proof for what it tells you. An <b>SSID found</b> proves the AP is broadcasting (WLAN enabled, policy enabled, mapped, radios on). <b>Association with an IP in 10.10.20.0/24</b> proves the policy VLAN, trunk, DHCP and the AP-to-controller tunnel. <b>The ping to RAD1</b> proves routing at R1 beyond the client subnet. If LAPTOP1 is already connected from a previous attempt use <code>wifi status</code> to confirm which AP it chose; either AP is valid.</p>
<div class="note"><p>Controller views to confirm the client: <code>show wireless client summary</code> lists MAC, AP, WLAN and State Run, and <code>show wireless client mac-address &lt;mac&gt; detail</code> shows the VLAN, band, RSSI and authentication method. Values in this book are examples; yours may differ.</p></div>

<h3>Change safely on a live controller</h3>
<ul>
<li>Plan, change, verify, save. Write down what you changed and how to undo it.</li>
<li>Name objects by role (NK-STAFF, PP-STAFF, PT-CAMPUS) so show output reads like a sentence.</li>
<li>Use the <code>description</code> command in a policy profile so the next engineer understands the purpose.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> After the build, <code>show wlan summary</code> shows UP, <code>show wireless profile policy detailed PP-STAFF</code> shows ENABLED and VLAN 20, the tag shows one map and both APs show PT-CAMPUS. LAPTOP1 gets 10.10.20.50. All five proofs line up, so the lab is complete. If only the last one failed, the VLAN 20 route or DHCP is the suspect, not the SSID.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Reversing the arguments in the tag mapping. (2) Creating the tag but never tagging the APs. (3) Typing a WLAN profile name that differs by one character from the one you created. (4) Declaring victory when the SSID appears; the ping to RAD1 is the real end-to-end proof.</p></div>
<div class="exam"><p><b>Exam trap.</b> After building profiles and a tag, nothing is on the air until the tag is applied to an AP. The tag is useless until it is attached.</p></div>

<div class="scn"><h4>The invisible guest SSID</h4><p>A new office opened with all objects built, enabled and mapped. Staff saw nothing. <code>show ap tag summary</code> showed both APs on default-policy-tag. The engineer had built PT-CAMPUS, but the final step of tagging was skipped. Two <code>ap name</code> commands fixed it.</p><p><b>Lesson:</b> the last mile of the tag model is the AP assignment.</p></div>

<div class="iv"><p class="q">"Walk me through creating a new SSID on a 9800."</p><p>Strong answer: create the WLAN profile and enable it; create the policy profile with the VLAN and enable it; map the pair in a policy tag; apply the tag to the APs; verify the client gets an address in the right VLAN and can reach services; save. Mention checking the VLAN exists on the controller, switch trunk and router.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add</b> (profile NK-STAFF, id 1, WPA2 with the PSK), then <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; Add</b> (PP-STAFF, VLAN 20, enabled), then <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; Policy</b> tab <b>&gt; Add</b> (PT-CAMPUS with the NK-STAFF to PP-STAFF map). Tag the APs in <b>Configuration &gt; Wireless &gt; Access Points</b>, select the AP, tab <b>Tags</b>. Prove it in <b>Monitoring &gt; Wireless &gt; Clients</b> and <b>Troubleshooting &gt; Ping</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four steps: WLAN profile, policy profile, policy tag, tag the APs.</li>
<li>Tag mapping syntax is wlan WLAN policy POLICY.</li>
<li>Verify the tag with show wireless tag policy detailed and the APs with show ap tag summary.</li>
<li>Client proof: SSID visible, IP in VLAN 20, ping to RAD1.</li>
<li>Read each proof for the layer it exonerates.</li>
</ul></div>
`,hi:`
<p>Ab chapters 5 aur 6 ko practice mein lagate hain. Lab wl-first-wlan ka goal kehne mein simple hai: LAPTOP1 NK-STAFF join kare, VLAN 20 mein land kare aur server RAD1 (10.10.60.20) tak pahunche. Pehle plan karenge, phir build, phir prove, jaise professional change hota hai.</p>

<h3>Pehle kaagaz par plan</h3>
<table class="cmp"><tr><th>Object</th><th>Name</th><th>Key settings</th></tr>
<tr><td>WLAN profile</td><td>NK-STAFF</td><td>id 1, SSID NK-STAFF, WPA2-PSK, key NkStaff2024</td></tr>
<tr><td>Policy profile</td><td>PP-STAFF</td><td>VLAN 20, central switching</td></tr>
<tr><td>Policy tag</td><td>PT-CAMPUS</td><td>NK-STAFF PP-STAFF se mapped</td></tr>
<tr><td>AP tagging</td><td>AP1, AP2</td><td>policy tag PT-CAMPUS</td></tr></table>
<p>Pre-conditions bhi confirm karo: dono APs registered hain (lab 1), VLAN 20 controller mein exist karta hai, SW1 VLAN 20 ko controller aur APs ki taraf trunk karta hai, aur R1 ke paas VLAN 20 gateway aur DHCP pool (10.10.20.0/24) hai. Pehle do controller par hain; baaki lab environment ke hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Client path">
<rect x="10" y="80" width="100" height="44" rx="8" fill="#fed7aa"/><text x="60" y="106" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP1</text>
<rect x="150" y="80" width="90" height="44" rx="8" fill="#fde68a"/><text x="195" y="106" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="280" y="80" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="335" y="100" text-anchor="middle" class="svg-ink" font-size="12">WLC1 tunnel</text><text x="335" y="116" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20</text>
<rect x="430" y="80" width="80" height="44" rx="8" fill="#bae6fd"/><text x="470" y="106" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="550" y="80" width="80" height="44" rx="8" fill="#bbf7d0"/><text x="590" y="100" text-anchor="middle" class="svg-ink" font-size="12">R1</text><text x="590" y="116" text-anchor="middle" class="svg-muted" font-size="11">RAD1 aage</text>
<line x1="110" y1="102" x2="150" y2="102" stroke="#64748b" stroke-dasharray="5 4"/><line x1="240" y1="102" x2="280" y2="102" stroke="#64748b"/><line x1="390" y1="102" x2="430" y2="102" stroke="#64748b"/><line x1="510" y1="102" x2="550" y2="102" stroke="#64748b"/>
<text x="195" y="150" text-anchor="middle" class="svg-muted" font-size="11">1 radio + auth</text><text x="335" y="150" text-anchor="middle" class="svg-muted" font-size="11">2 CAPWAP data</text><text x="470" y="150" text-anchor="middle" class="svg-muted" font-size="11">3 VLAN 20 trunk</text><text x="590" y="150" text-anchor="middle" class="svg-muted" font-size="11">4 DHCP, route</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">Association, DHCP aur ping har ek is path ki alag link prove karta hai</text>
</svg><p class="cap">Client path. Policy VLAN decide karta hai ki client router par kaunsa DHCP pool aur kaunsa gateway milega.</p></div>

<h3>Build</h3>
<pre class="code"><span class="c">! 1. WLAN profile: SSID, WPA2-PSK, enabled</span>
WLC1(config)# wlan NK-STAFF 1 NK-STAFF
WLC1(config-wlan)# no security wpa akm dot1x
WLC1(config-wlan)# security wpa akm psk
WLC1(config-wlan)# security wpa psk set-key ascii 0 NkStaff2024
WLC1(config-wlan)# no shutdown
WLC1(config-wlan)# exit
<span class="c">! 2. Policy profile: VLAN 20, enabled</span>
WLC1(config)# wireless profile policy PP-STAFF
WLC1(config-wireless-policy)# vlan 20
WLC1(config-wireless-policy)# no shutdown
WLC1(config-wireless-policy)# exit
<span class="c">! 3. Policy tag: WLAN ko policy se map karo</span>
WLC1(config)# wireless tag policy PT-CAMPUS
WLC1(config-policy-tag)# wlan NK-STAFF policy PP-STAFF
WLC1(config-policy-tag)# exit
WLC1(config)# end
<span class="c">! 4. APs ko tag karo (exec mode)</span>
WLC1# ap name AP1 policy-tag PT-CAMPUS
WLC1# ap name AP2 policy-tag PT-CAMPUS
WLC1# write memory</pre>
<p>Tag ke andar order <code>wlan &lt;WLAN profile name&gt; policy &lt;policy profile name&gt;</code> hai. Tag sirf jodi store karta hai, isliye map karte waqt WLAN aur policy profile pehle se exist karne chahiye.</p>

<h3>Layer by layer prove karo</h3>
<pre class="out">WLC1# show wireless tag policy detailed PT-CAMPUS

Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 1

WLAN Profile Name                   Policy Name
------------------------------------------------------------
<span class="hl">NK-STAFF                            PP-STAFF</span>

WLC1# show ap tag summary

Number of APs: 2

AP Name              AP Mac           Site Tag Name         Policy Tag Name       RF Tag Name         Misconfigured  Tag Source
------------------------------------------------------------
AP1                  aaaa.bb01.0001   default-site-tag      <span class="hl">PT-CAMPUS</span>            default-rf-tag      No             Static
AP2                  aaaa.bb01.0002   default-site-tag      <span class="hl">PT-CAMPUS</span>            default-rf-tag      No             Static</pre>
<p>Ab client side. LAPTOP1 par lab ke Wi-Fi commands use karo:</p>
<pre class="out">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:42:a6:98:10
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -62 dBm
Security    : WPA2-Personal (PSK)
IP address  : <span class="hl">10.10.20.11/24 (DHCP)</span>

LAPTOP1&gt; ping 10.10.60.20
<span class="hl">84 bytes from 10.10.60.20 icmp_seq=1 ttl=63 time=0.500 ms</span></pre>
<p>Har proof ko padho ki woh kya batata hai. <b>SSID mil gaya</b> prove karta hai ki AP broadcast kar raha hai (WLAN enabled, policy enabled, mapped, radios on). <b>Association aur 10.10.20.0/24 ka IP</b> policy VLAN, trunk, DHCP aur AP-to-controller tunnel prove karta hai. <b>RAD1 ka ping</b> client subnet ke aage R1 par routing prove karta hai. Agar LAPTOP1 pehle attempt se connected hai to <code>wifi status</code> se confirm karo ki usne kaunsa AP chuna; dono AP valid hain.</p>
<div class="note"><p>Client confirm karne ke controller views: <code>show wireless client summary</code> MAC, AP, WLAN aur State Run list karta hai, aur <code>show wireless client mac-address &lt;mac&gt; detail</code> VLAN, band, RSSI aur authentication method dikhata hai. Is book ki values examples hain; aapki alag ho sakti hain.</p></div>

<h3>Live controller par safely change karo</h3>
<ul>
<li>Plan, change, verify, save. Likh lo ki kya badla aur undo kaise karna hai.</li>
<li>Objects ko role ke naam do (NK-STAFF, PP-STAFF, PT-CAMPUS) taaki show output sentence ki tarah padhe.</li>
<li>Policy profile mein <code>description</code> command use karo taaki agla engineer purpose samjhe.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Build ke baad <code>show wlan summary</code> UP dikhata hai, <code>show wireless profile policy detailed PP-STAFF</code> ENABLED aur VLAN 20 dikhata hai, tag ek map dikhata hai aur dono APs PT-CAMPUS dikhate hain. LAPTOP1 ko 10.10.20.50 milta hai. Paanchon proofs line up hote hain, to lab complete hai. Agar sirf aakhri fail hota, to VLAN 20 route ya DHCP suspect hai, SSID nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Tag mapping mein arguments ulta karna. (2) Tag banana lekin APs ko kabhi tag na karna. (3) WLAN profile name mein ek character ka farak type karna. (4) SSID dikhne par jeet declare karna; RAD1 ka ping asli end-to-end proof hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profiles aur tag banane ke baad bhi kuch on-air nahi hota jab tak tag AP par apply na ho. Tag attach hone tak bekaar hai.</p></div>

<div class="scn"><h4>Invisible guest SSID</h4><p>Ek naya office khula jismein saare objects built, enabled aur mapped the. Staff ko kuch nahi dikha. <code>show ap tag summary</code> ne dono APs default-policy-tag par dikhaye. Engineer ne PT-CAMPUS banaya tha, lekin tagging ka aakhri step chhoot gaya tha. Do <code>ap name</code> commands ne fix kar diya.</p><p><b>Seekh:</b> tag model ka last mile AP assignment hai.</p></div>

<div class="iv"><p class="q">"9800 par naya SSID banane ka process batao."</p><p>Strong answer: WLAN profile banao aur enable karo; VLAN ke saath policy profile banao aur enable karo; jodi ko policy tag mein map karo; tag APs par apply karo; verify karo ki client ko sahi VLAN mein address mile aur services tak pahunche; save karo. Bolo ki VLAN controller, switch trunk aur router par exist karta hai ye check karte ho.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add</b> (profile NK-STAFF, id 1, PSK ke saath WPA2), phir <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; Add</b> (PP-STAFF, VLAN 20, enabled), phir <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; Policy</b> tab <b>&gt; Add</b> (PT-CAMPUS, NK-STAFF se PP-STAFF map ke saath). APs ko tag karo <b>Configuration &gt; Wireless &gt; Access Points</b> mein, AP select karke tab <b>Tags</b>. Prove karo <b>Monitoring &gt; Wireless &gt; Clients</b> aur <b>Troubleshooting &gt; Ping</b> se.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar steps: WLAN profile, policy profile, policy tag, APs ko tag.</li>
<li>Tag mapping syntax wlan WLAN policy POLICY hai.</li>
<li>Tag ko show wireless tag policy detailed se aur APs ko show ap tag summary se verify karo.</li>
<li>Client proof: SSID visible, VLAN 20 mein IP, RAD1 ko ping.</li>
<li>Har proof ko is nazar se padho ki woh kaunsi layer ko clear karta hai.</li>
</ul></div>
`}};export{e as default};