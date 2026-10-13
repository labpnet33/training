var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an empty controller. You now know how it gets an identity, how APs find and join it, how profiles and tags combine into a working SSID, and how to find the broken link when an SSID is missing. This chapter collects everything in one place for revision and for the exam.</p>

<h3>The whole module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary">
<rect x="10" y="15" width="145" height="60" rx="8" fill="#bbf7d0"/><text x="82" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 Management</text><text x="82" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN 99, Vlan99, trunk, route</text>
<rect x="170" y="15" width="145" height="60" rx="8" fill="#bae6fd"/><text x="242" y="40" text-anchor="middle" class="svg-ink" font-size="12">2 AP join</text><text x="242" y="58" text-anchor="middle" class="svg-muted" font-size="11">option 43, CAPWAP 5246</text>
<rect x="330" y="15" width="145" height="60" rx="8" fill="#ddd6fe"/><text x="402" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 Profiles</text><text x="402" y="58" text-anchor="middle" class="svg-muted" font-size="11">WLAN + policy (VLAN)</text>
<rect x="490" y="15" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="12">4 Policy tag</text><text x="560" y="58" text-anchor="middle" class="svg-muted" font-size="11">map WLAN to policy</text>
<line x1="155" y1="45" x2="170" y2="45" stroke="#64748b"/><line x1="315" y1="45" x2="330" y2="45" stroke="#64748b"/><line x1="475" y1="45" x2="490" y2="45" stroke="#64748b"/>
<rect x="170" y="110" width="300" height="50" rx="8" fill="#fed7aa"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="12">5 Tag the APs: ap name AP1 policy-tag PT-CAMPUS</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="11">without it: default-policy-tag, no SSID</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="13">Proof: SSID seen, IP in VLAN 20, ping 10.10.60.20</text>
</svg><p class="cap">The path of this module from empty controller to a working staff SSID.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain split-MAC, the role of a controller and why the 9800 uses profiles and tags.</li>
<li>Name the CLI modes and use configure terminal, exit, end, no, write memory and output filters.</li>
<li>Build VLAN 99, Vlan99 10.10.99.10/24, a trunk on GigabitEthernet1, a default route and the wireless management interface.</li>
<li>Describe the CAPWAP join sequence and the ports (UDP 5246 control, 5247 data).</li>
<li>Decode option 43 f104.0a0a.630a as 10.10.99.10.</li>
<li>Create a WLAN profile, a policy profile and a policy tag; tag APs; verify with the show commands.</li>
<li>Explain why a joined AP can still serve no SSID and fix it with ap name ... policy-tag.</li>
<li>Run the five-stage troubleshooting workflow and state the root cause in one sentence.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>WLC</dt><dd>Wireless LAN controller; central brain of the wireless network.</dd>
<dt>AP</dt><dd>Access point; provides the radio and follows the controller.</dd>
<dt>CAPWAP</dt><dd>Tunnel between AP and controller: control on UDP 5246 with DTLS, data on UDP 5247.</dd>
<dt>Split-MAC</dt><dd>Real-time radio work on the AP, management work on the controller.</dd>
<dt>Option 43</dt><dd>DHCP vendor option carrying the controller address to APs.</dd>
<dt>Wireless management interface</dt><dd>The one SVI used for AP join and controller-sourced services.</dd>
<dt>WLAN profile</dt><dd>SSID, WLAN id and security.</dd>
<dt>Policy profile</dt><dd>Client treatment: VLAN, switching, authentication location.</dd>
<dt>Policy tag</dt><dd>Maps WLAN profiles to policy profiles; carried by APs.</dd>
<dt>Site tag, RF tag</dt><dd>Point to the AP profile and the RF profiles; later modules.</dd>
<dt>Default tags</dt><dd>What an untagged AP uses; the default policy tag serves no WLAN in the lab model.</dd>
<dt>Central switching</dt><dd>Client traffic tunnelled to the controller; local switching (FlexConnect) is not simulated in the lab.</dd>
</dl>

<h3>Most-tested facts</h3>
<ol>
<li>CAPWAP control is UDP 5246, data is UDP 5247.</li>
<li>One wireless management interface per controller.</li>
<li>A new WLAN or policy profile starts shut down.</li>
<li>WLAN security can be edited only while the WLAN is shut down; a policy VLAN needs the policy profile shut down first.</li>
<li>A WLAN is broadcast only if the AP's policy tag maps it to an enabled policy profile, the WLAN is enabled, the VLAN exists and the radio is on.</li>
<li>Every AP carries one policy tag, one site tag and one RF tag.</li>
<li>Joined (registered) is not the same as serving.</li>
<li>The WLAN profile holds security; the policy profile holds the VLAN.</li>
</ol>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! Management</span>
vlan 99
interface Vlan99
 ip address 10.10.99.10 255.255.255.0
 no shutdown
interface GigabitEthernet1
 switchport mode trunk
ip route 0.0.0.0 0.0.0.0 10.10.99.1
wireless management interface Vlan99
<span class="c">! WLAN, policy, tag</span>
wlan NK-STAFF 1 NK-STAFF
 no security wpa akm dot1x
 security wpa akm psk
 security wpa psk set-key ascii 0 NkStaff2024
 no shutdown
wireless profile policy PP-STAFF
 vlan 20
 no shutdown
wireless tag policy PT-CAMPUS
 wlan NK-STAFF policy PP-STAFF
<span class="c">! Apply (exec mode)</span>
ap name AP1 policy-tag PT-CAMPUS
ap name AP2 policy-tag PT-CAMPUS</pre>
<pre class="out">show wireless management interface
show ap summary
show ap tag summary
show wlan summary
show wireless profile policy detailed PP-STAFF
show wireless tag policy detailed PT-CAMPUS
show ap name AP1 config general
show wireless client summary
show running-config | section wlan</pre>

<div class="eg"><p><b>Self-test.</b> A new AP is registered. NK-STAFF is not visible. In order, which three commands do you run, and what would each healthy answer be? Answer: show ap tag summary (PT-CAMPUS, Static), show wireless tag policy detailed PT-CAMPUS (NK-STAFF paired with PP-STAFF), show wlan summary and show wireless profile policy detailed PP-STAFF (UP and ENABLED, VLAN 20).</p></div>

<div class="warn"><p><b>Common exam mistakes.</b> Confusing the WLAN profile and the policy profile; saying the AP holds the SSID; forgetting that new objects are shut; mixing AireOS commands into a 9800 answer.</p></div>
<div class="exam"><p><b>Exam trap.</b> Features such as FlexConnect, mobility anchoring, web authentication portals, HA SSO and Catalyst Center are real parts of the platform. Coming up: wl-flex (FlexConnect), wl-mobility (Mobility and high availability), wl-secure (Advanced security) and wl-auto (Catalyst Center, Spaces and automation). In the lab they are concepts only (not simulated in the lab), so expect theory questions on them, not hands-on ones.</p></div>

<div class="scn"><h4>Handover note that worked</h4><p>An engineer finishing a night shift wrote this for the day team: "Both APs Registered. PT-CAMPUS maps NK-STAFF to PP-STAFF, VLAN 20. AP2 had default-policy-tag after replacement, retagged, LAPTOP2 got 10.10.20.x and pinged RAD1. Config saved." The day team understood the whole change in ten seconds.</p><p><b>Lesson:</b> evidence, fix, proof and save, in four short sentences, is the standard handover.</p></div>

<div class="iv"><p class="q">"Summarise how you bring up a new SSID on a fresh 9800."</p><p>Strong answer: management interface and AP join first; then WLAN profile with security, policy profile with VLAN, policy tag mapping them, and tagging the APs; then verify with show outputs and a client test, and save. Mention default tags and that the VLAN must exist everywhere on the path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management interface first, AP join second, tags third.</li>
<li>Profiles hold settings; the policy tag links WLAN to policy; the AP must carry the tag.</li>
<li>Verify with summary views, then detail, then a client test.</li>
<li>Joined is not serving; always check tag assignment.</li>
<li>Next modules: RF, control plane, security, roaming and operations build on this model.</li>
</ul></div>
`,hi:`
<p>Aapne khaali controller se shuru kiya tha. Ab aap jaante ho ki use identity kaise milti hai, APs use kaise dhoondhte aur join karte hain, profiles aur tags milke working SSID kaise banate hain, aur SSID missing ho to broken link kaise dhoondhte hain. Yeh chapter sab kuch ek jagah revision aur exam ke liye jama karta hai.</p>

<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary">
<rect x="10" y="15" width="145" height="60" rx="8" fill="#bbf7d0"/><text x="82" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 Management</text><text x="82" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN 99, Vlan99, trunk, route</text>
<rect x="170" y="15" width="145" height="60" rx="8" fill="#bae6fd"/><text x="242" y="40" text-anchor="middle" class="svg-ink" font-size="12">2 AP join</text><text x="242" y="58" text-anchor="middle" class="svg-muted" font-size="11">option 43, CAPWAP 5246</text>
<rect x="330" y="15" width="145" height="60" rx="8" fill="#ddd6fe"/><text x="402" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 Profiles</text><text x="402" y="58" text-anchor="middle" class="svg-muted" font-size="11">WLAN + policy (VLAN)</text>
<rect x="490" y="15" width="140" height="60" rx="8" fill="#fde68a"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="12">4 Policy tag</text><text x="560" y="58" text-anchor="middle" class="svg-muted" font-size="11">WLAN ko policy se map</text>
<line x1="155" y1="45" x2="170" y2="45" stroke="#64748b"/><line x1="315" y1="45" x2="330" y2="45" stroke="#64748b"/><line x1="475" y1="45" x2="490" y2="45" stroke="#64748b"/>
<rect x="170" y="110" width="300" height="50" rx="8" fill="#fed7aa"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="12">5 APs ko tag karo: ap name AP1 policy-tag PT-CAMPUS</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="11">iske bina: default-policy-tag, SSID nahi</text>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="13">Proof: SSID dikha, VLAN 20 mein IP, ping 10.10.60.20</text>
</svg><p class="cap">Khaali controller se working staff SSID tak is module ka raasta.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Split-MAC, controller ka role aur 9800 profiles aur tags kyun use karta hai, yeh explain kar sako.</li>
<li>CLI modes ke naam batao aur configure terminal, exit, end, no, write memory aur output filters use karo.</li>
<li>VLAN 99, Vlan99 10.10.99.10/24, GigabitEthernet1 par trunk, default route aur wireless management interface banao.</li>
<li>CAPWAP join sequence aur ports (UDP 5246 control, 5247 data) describe karo.</li>
<li>Option 43 f104.0a0a.630a ko 10.10.99.10 ki tarah decode karo.</li>
<li>WLAN profile, policy profile aur policy tag banao; APs tag karo; show commands se verify karo.</li>
<li>Explain karo ki joined AP phir bhi koi SSID kyun serve nahi karta aur ap name ... policy-tag se fix karo.</li>
<li>Paanch-stage troubleshooting workflow chalao aur root cause ek sentence mein batao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>WLC</dt><dd>Wireless LAN controller; wireless network ka central dimaag.</dd>
<dt>AP</dt><dd>Access point; radio deta hai aur controller ko follow karta hai.</dd>
<dt>CAPWAP</dt><dd>AP aur controller ke beech tunnel: control UDP 5246 par DTLS ke saath, data UDP 5247 par.</dd>
<dt>Split-MAC</dt><dd>Real-time radio kaam AP par, management kaam controller par.</dd>
<dt>Option 43</dt><dd>DHCP vendor option jo APs ko controller address deta hai.</dd>
<dt>Wireless management interface</dt><dd>AP join aur controller-sourced services ke liye use hone wala ek SVI.</dd>
<dt>WLAN profile</dt><dd>SSID, WLAN id aur security.</dd>
<dt>Policy profile</dt><dd>Client treatment: VLAN, switching, authentication location.</dd>
<dt>Policy tag</dt><dd>WLAN profiles ko policy profiles se map karta hai; APs carry karte hain.</dd>
<dt>Site tag, RF tag</dt><dd>AP profile aur RF profiles ko point karte hain; aage ke modules.</dd>
<dt>Default tags</dt><dd>Untagged AP jo use karta hai; lab model mein default policy tag koi WLAN serve nahi karta.</dd>
<dt>Central switching</dt><dd>Client traffic controller tak tunnel hota hai; local switching (FlexConnect) lab mein simulated nahi.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ol>
<li>CAPWAP control UDP 5246 hai, data UDP 5247.</li>
<li>Har controller par ek wireless management interface.</li>
<li>Naya WLAN ya policy profile shut down shuru hota hai.</li>
<li>WLAN security sirf WLAN shut hone par edit hoti hai; policy VLAN ke liye pehle policy profile shut karna padta hai.</li>
<li>WLAN tabhi broadcast hota hai jab AP ka policy tag use enabled policy profile se map kare, WLAN enabled ho, VLAN exist kare aur radio on ho.</li>
<li>Har AP ke paas ek policy tag, ek site tag aur ek RF tag hota hai.</li>
<li>Joined (registered) aur serving alag hain.</li>
<li>WLAN profile security rakhta hai; policy profile VLAN rakhta hai.</li>
</ol>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! Management</span>
vlan 99
interface Vlan99
 ip address 10.10.99.10 255.255.255.0
 no shutdown
interface GigabitEthernet1
 switchport mode trunk
ip route 0.0.0.0 0.0.0.0 10.10.99.1
wireless management interface Vlan99
<span class="c">! WLAN, policy, tag</span>
wlan NK-STAFF 1 NK-STAFF
 no security wpa akm dot1x
 security wpa akm psk
 security wpa psk set-key ascii 0 NkStaff2024
 no shutdown
wireless profile policy PP-STAFF
 vlan 20
 no shutdown
wireless tag policy PT-CAMPUS
 wlan NK-STAFF policy PP-STAFF
<span class="c">! Apply (exec mode)</span>
ap name AP1 policy-tag PT-CAMPUS
ap name AP2 policy-tag PT-CAMPUS</pre>
<pre class="out">show wireless management interface
show ap summary
show ap tag summary
show wlan summary
show wireless profile policy detailed PP-STAFF
show wireless tag policy detailed PT-CAMPUS
show ap name AP1 config general
show wireless client summary
show running-config | section wlan</pre>

<div class="eg"><p><b>Self-test.</b> Ek naya AP registered hai. NK-STAFF visible nahi. Order mein kaunse teen commands chalaoge, aur har ka healthy jawab kya hoga? Jawab: show ap tag summary (PT-CAMPUS, Static), show wireless tag policy detailed PT-CAMPUS (NK-STAFF PP-STAFF ke saath jodi), show wlan summary aur show wireless profile policy detailed PP-STAFF (UP aur ENABLED, VLAN 20).</p></div>

<div class="warn"><p><b>Common exam mistakes.</b> WLAN profile aur policy profile ko confuse karna; kehna ki AP SSID rakhta hai; bhoolna ki naye objects shut hote hain; 9800 ke jawab mein AireOS commands milana.</p></div>
<div class="exam"><p><b>Exam trap.</b> FlexConnect, mobility anchoring, web authentication portals, HA SSO aur Catalyst Center jaise features platform ke real hisse hain. Aage aane wale modules: wl-flex (FlexConnect), wl-mobility (Mobility and high availability), wl-secure (Advanced security) aur wl-auto (Catalyst Center, Spaces and automation). Lab mein yeh sirf concepts hain (not simulated in the lab), isliye inpar theory questions expect karo, hands-on nahi.</p></div>

<div class="scn"><h4>Handover note jo kaam aaya</h4><p>Night shift khatam karte ek engineer ne day team ke liye likha: "Dono APs Registered. PT-CAMPUS NK-STAFF ko PP-STAFF se map karta hai, VLAN 20. Replacement ke baad AP2 default-policy-tag par tha, retag kiya, LAPTOP2 ko 10.10.20.x mila aur RAD1 ko ping hua. Config saved." Day team ne poora change das second mein samajh liya.</p><p><b>Seekh:</b> evidence, fix, proof aur save, chaar chhote sentences mein, standard handover hai.</p></div>

<div class="iv"><p class="q">"Fresh 9800 par naya SSID kaise up karte ho, summarise karo."</p><p>Strong answer: pehle management interface aur AP join; phir security ke saath WLAN profile, VLAN ke saath policy profile, unhe map karne wala policy tag, aur APs tag karna; phir show outputs aur client test se verify, aur save. Default tags mention karo aur yeh ki VLAN poore path par exist karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management interface pehle, AP join doosra, tags teesra.</li>
<li>Profiles settings rakhte hain; policy tag WLAN ko policy se jodta hai; AP ko tag carry karna hi hoga.</li>
<li>Pehle summary views, phir detail, phir client test se verify karo.</li>
<li>Joined serving nahi hota; tag assignment hamesha check karo.</li>
<li>Aage ke modules: RF, control plane, security, roaming aur operations isi model par bante hain.</li>
</ul></div>
`}};export{e as default};