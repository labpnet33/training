var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>What you can now do</h3>
<p>You started with a walking laptop and a hotel analogy. You now understand that roaming quality depends on RF overlap, on the client's decision, and on <b>identical policy on both APs</b>. You can read and fix the three object layers that decide a client's network: the policy tag, the policy profile and the VLAN database. You can build an isolated guest network and prove its isolation.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module recap">
<rect x="10" y="30" width="145" height="90" rx="8" fill="#bae6fd"/><text x="82" y="60" text-anchor="middle" class="svg-ink" font-size="13">Roaming</text><text x="82" y="82" text-anchor="middle" class="svg-muted" font-size="11">L2 / L3, 11r/k/v</text><text x="82" y="100" text-anchor="middle" class="svg-muted" font-size="11">client decides</text>
<rect x="170" y="30" width="145" height="90" rx="8" fill="#ddd6fe"/><text x="242" y="60" text-anchor="middle" class="svg-ink" font-size="13">Tags</text><text x="242" y="82" text-anchor="middle" class="svg-muted" font-size="11">policy / site / RF</text><text x="242" y="100" text-anchor="middle" class="svg-muted" font-size="11">match on neighbours</text>
<rect x="330" y="30" width="145" height="90" rx="8" fill="#bbf7d0"/><text x="402" y="60" text-anchor="middle" class="svg-ink" font-size="13">Policy + VLAN</text><text x="402" y="82" text-anchor="middle" class="svg-muted" font-size="11">profile, database,</text><text x="402" y="100" text-anchor="middle" class="svg-muted" font-size="11">central switching</text>
<rect x="490" y="30" width="140" height="90" rx="8" fill="#fed7aa"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">Guest</text><text x="560" y="82" text-anchor="middle" class="svg-muted" font-size="11">VLAN 50 + ACL</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">prove isolation</text>
</svg><p class="cap">Four ideas, three labs.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain Layer 2 versus Layer 3 roaming and intra versus inter-controller roaming.</li>
<li>Describe mobility groups, anchor and foreign controllers, and guest anchoring (concept).</li>
<li>State what 802.11r, 802.11k and 802.11v do and that the client decides to roam.</li>
<li>Explain sticky clients and list three mitigations.</li>
<li>Describe policy tag, site tag, RF tag and the default tags.</li>
<li>Explain why neighbouring APs need matching policy tags.</li>
<li>Read <code>show ap tag summary</code>, <code>show wireless tag policy detailed</code>, <code>show wireless profile policy detailed</code>, <code>show vlan brief</code>, <code>show wireless client</code> output.</li>
<li>Build a guest SSID: WLAN, policy profile in VLAN 50, map in the tag, and prove isolation.</li>
<li>Fix a missing VLAN in the controller database.</li>
<li>Explain central versus local (FlexConnect) switching.</li>
</ul>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! inspect</span>
show ap tag summary
show wireless tag policy detailed PT-CAMPUS
show wireless profile policy summary
show wireless profile policy detailed PP-STAFF
show wireless client summary
show wireless client mac-address 0050.7966.6801 detail
show vlan brief
show logging

<span class="c">! fix tag mismatch</span>
ap name AP2 policy-tag PT-CAMPUS

<span class="c">! guest build</span>
wlan NK-GUEST 3 NK-GUEST
 no security wpa
 no shutdown
 exit
wireless profile policy PP-GUEST
 vlan 50
 no shutdown
 exit
wireless tag policy PT-CAMPUS
 wlan NK-GUEST policy PP-GUEST
 exit

<span class="c">! missing VLAN</span>
vlan 20
 name STAFF
 exit</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Roaming</dt><dd>Client moves its association to another AP of the same SSID.</dd>
<dt>Mobility group</dt><dd>Set of controllers that share client state (concept).</dd>
<dt>Anchor / foreign</dt><dd>Controller that keeps the client's VLAN / controller where the AP is joined (concept).</dd>
<dt>802.11r / k / v</dt><dd>Fast key exchange / neighbour reports / transition requests.</dd>
<dt>Sticky client</dt><dd>Client that holds a poor AP instead of roaming.</dd>
<dt>Policy tag</dt><dd>Maps WLAN profiles to policy profiles.</dd>
<dt>Site tag</dt><dd>Holds the AP profile and site mode.</dd>
<dt>RF tag</dt><dd>Holds 2.4 and 5 GHz RF profiles.</dd>
<dt>Policy profile</dt><dd>VLAN, switching mode and client policy.</dd>
<dt>VLAN database</dt><dd>Controller's list of known VLANs.</dd>
<dt>Central switching</dt><dd>Client data goes through the WLC.</dd>
<dt>FlexConnect</dt><dd>Local switching at the AP (concept).</dd>
<dt>CWA / LWA</dt><dd>Central / local web authentication portals (concept).</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>The client decides when to roam; the infrastructure can only assist.</li>
<li>Layer 2 roam keeps the subnet; Layer 3 roam needs tunnelling/anchoring.</li>
<li>VLAN is in the policy profile, not the policy tag and not the WLAN profile.</li>
<li>A new policy profile starts disabled; its VLAN cannot be changed while it is enabled.</li>
<li>An AP with default tags serves no WLAN.</li>
<li>The VLAN must exist in the controller database; the log says VLAN_MISSING.</li>
<li>Guest segmentation = SSID + VLAN + Layer 3 ACL or firewall.</li>
<li>Different policy tags on neighbouring APs can change the client's subnet during a walk.</li>
</ol>
<div class="note"><p><b>Not simulated in the lab:</b> mobility groups and tunnels, anchoring, FlexConnect, web portals, real 802.11r/k/v exchanges and sticky behaviour. Coming up: wl-flex (FlexConnect), wl-mobility (Mobility and high availability), wl-secure (Advanced security).</p></div>

<div class="warn"><p><b>Last common mistakes.</b> (1) Treating the status ENABLED as proof the VLAN works. (2) Fixing the wrong device. (3) Skipping the negative test on guests. (4) Forgetting that mapping a WLAN in a shared tag publishes it on every AP using that tag.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the question for the object that owns the fault: AP tag, policy tag, policy profile, VLAN database, trunk, DHCP or ACL. The right answer changes only that object.</p></div>

<div class="scn"><h4>The handover note</h4><p>A new engineer inherits the campus wireless network. The handover note lists: one policy tag PT-CAMPUS for every AP, VLANs 20, 40, 50 in the controller database, PP-GUEST in VLAN 50 and the R1 ACL GUEST-IN, and a short test card (staff address, guest address, guest cannot ping RAD1). A year later a fault appears; the test card finds the cause in minutes.</p><p><b>Lesson:</b> consistent design plus a short test card makes tickets cheap.</p></div>

<div class="iv"><p class="q">"Summarise how a 9800 decides a client's VLAN and what can go wrong."</p><p>SSID selects the WLAN profile; the AP policy tag maps it to a policy profile; the policy profile gives the VLAN; the VLAN must exist in the controller database and be carried on the trunk and routed with DHCP. Faults: wrong or different tag on an AP, disabled policy profile, missing VLAN, trunk or DHCP faults, and missing segmentation for guests.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seamless roaming needs matching policy on both APs.</li>
<li>Tags decide what each AP serves; the policy profile decides the VLAN.</li>
<li>VLAN database, trunk and DHCP complete the path.</li>
<li>Guests get their own SSID, VLAN and ACL.</li>
<li>Prove every fix from the client.</li>
</ul></div>
`,hi:`
<h3>Ab aap kya kar sakte ho</h3>
<p>Aapne chalte laptop aur hotel analogy se shuru kiya tha. Ab aap samajhte ho ki roaming quality RF overlap, client ke decision, aur <b>dono APs par identical policy</b> par depend karti hai. Aap woh teen object layers padh aur fix kar sakte ho jo client ka network decide karti hain: policy tag, policy profile aur VLAN database. Aap isolated guest network bana sakte ho aur uski isolation prove kar sakte ho.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module recap">
<rect x="10" y="30" width="145" height="90" rx="8" fill="#bae6fd"/><text x="82" y="60" text-anchor="middle" class="svg-ink" font-size="13">Roaming</text><text x="82" y="82" text-anchor="middle" class="svg-muted" font-size="11">L2 / L3, 11r/k/v</text><text x="82" y="100" text-anchor="middle" class="svg-muted" font-size="11">client decide karta hai</text>
<rect x="170" y="30" width="145" height="90" rx="8" fill="#ddd6fe"/><text x="242" y="60" text-anchor="middle" class="svg-ink" font-size="13">Tags</text><text x="242" y="82" text-anchor="middle" class="svg-muted" font-size="11">policy / site / RF</text><text x="242" y="100" text-anchor="middle" class="svg-muted" font-size="11">padosiyon par match</text>
<rect x="330" y="30" width="145" height="90" rx="8" fill="#bbf7d0"/><text x="402" y="60" text-anchor="middle" class="svg-ink" font-size="13">Policy + VLAN</text><text x="402" y="82" text-anchor="middle" class="svg-muted" font-size="11">profile, database,</text><text x="402" y="100" text-anchor="middle" class="svg-muted" font-size="11">central switching</text>
<rect x="490" y="30" width="140" height="90" rx="8" fill="#fed7aa"/><text x="560" y="60" text-anchor="middle" class="svg-ink" font-size="13">Guest</text><text x="560" y="82" text-anchor="middle" class="svg-muted" font-size="11">VLAN 50 + ACL</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="11">isolation prove karo</text>
</svg><p class="cap">Chaar ideas, teen labs.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Layer 2 versus Layer 3 roaming aur intra versus inter-controller roaming explain karna.</li>
<li>Mobility groups, anchor aur foreign controllers, aur guest anchoring describe karna (concept).</li>
<li>Batana ki 802.11r, 802.11k aur 802.11v kya karte hain aur ki client roam karne ka decision leta hai.</li>
<li>Sticky clients explain karna aur teen mitigations batana.</li>
<li>Policy tag, site tag, RF tag aur default tags describe karna.</li>
<li>Explain karna ki padosi APs ko matching policy tags kyun chahiye.</li>
<li><code>show ap tag summary</code>, <code>show wireless tag policy detailed</code>, <code>show wireless profile policy detailed</code>, <code>show vlan brief</code>, <code>show wireless client</code> output padhna.</li>
<li>Guest SSID banana: WLAN, VLAN 50 mein policy profile, tag mein map, aur isolation prove karna.</li>
<li>Controller database mein missing VLAN fix karna.</li>
<li>Central versus local (FlexConnect) switching explain karna.</li>
</ul>

<h3>Command cheat sheet</h3>
<pre class="code"><span class="c">! inspect</span>
show ap tag summary
show wireless tag policy detailed PT-CAMPUS
show wireless profile policy summary
show wireless profile policy detailed PP-STAFF
show wireless client summary
show wireless client mac-address 0050.7966.6801 detail
show vlan brief
show logging

<span class="c">! fix tag mismatch</span>
ap name AP2 policy-tag PT-CAMPUS

<span class="c">! guest build</span>
wlan NK-GUEST 3 NK-GUEST
 no security wpa
 no shutdown
 exit
wireless profile policy PP-GUEST
 vlan 50
 no shutdown
 exit
wireless tag policy PT-CAMPUS
 wlan NK-GUEST policy PP-GUEST
 exit

<span class="c">! missing VLAN</span>
vlan 20
 name STAFF
 exit</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Roaming</dt><dd>Client apna association same SSID ke doosre AP par le jaata hai.</dd>
<dt>Mobility group</dt><dd>Controllers ka set jo client state share karte hain (concept).</dd>
<dt>Anchor / foreign</dt><dd>Woh controller jo client ka VLAN rakhta hai / woh controller jahan AP joined hai (concept).</dd>
<dt>802.11r / k / v</dt><dd>Fast key exchange / neighbour reports / transition requests.</dd>
<dt>Sticky client</dt><dd>Client jo roam karne ki jagah kharab AP ko pakde rehta hai.</dd>
<dt>Policy tag</dt><dd>WLAN profiles ko policy profiles se map karta hai.</dd>
<dt>Site tag</dt><dd>AP profile aur site mode rakhta hai.</dd>
<dt>RF tag</dt><dd>2.4 aur 5 GHz RF profiles rakhta hai.</dd>
<dt>Policy profile</dt><dd>VLAN, switching mode aur client policy.</dd>
<dt>VLAN database</dt><dd>Controller ki known VLANs ki list.</dd>
<dt>Central switching</dt><dd>Client data WLC ke through jaata hai.</dd>
<dt>FlexConnect</dt><dd>AP par local switching (concept).</dd>
<dt>CWA / LWA</dt><dd>Central / local web authentication portals (concept).</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>Client decide karta hai ki kab roam karna hai; infrastructure sirf assist kar sakta hai.</li>
<li>Layer 2 roam subnet rakhta hai; Layer 3 roam ko tunnelling/anchoring chahiye.</li>
<li>VLAN policy profile mein hota hai, policy tag mein nahi aur WLAN profile mein nahi.</li>
<li>Naya policy profile disabled shuru hota hai; enabled hone par uska VLAN badla nahi ja sakta.</li>
<li>Default tags wala AP koi WLAN serve nahi karta.</li>
<li>VLAN controller database mein exist karna chahiye; log VLAN_MISSING kehta hai.</li>
<li>Guest segmentation = SSID + VLAN + Layer 3 ACL ya firewall.</li>
<li>Padosi APs par alag policy tags chalne ke dauran client ka subnet badal sakte hain.</li>
</ol>
<div class="note"><p><b>Not simulated in the lab:</b> mobility groups aur tunnels, anchoring, FlexConnect, web portals, real 802.11r/k/v exchanges aur sticky behaviour. Aage aane wale: wl-flex (FlexConnect), wl-mobility (Mobility and high availability), wl-secure (Advanced security).</p></div>

<div class="warn"><p><b>Aakhri common mistakes.</b> (1) ENABLED status ko VLAN working ka proof maan lena. (2) Galat device par fix. (3) Guests par negative test skip karna. (4) Yeh bhoolna ki shared tag mein WLAN map karne se woh har us AP par publish hota hai jo us tag ko use karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question mein woh object dhoondho jo fault ka owner hai: AP tag, policy tag, policy profile, VLAN database, trunk, DHCP ya ACL. Sahi jawab sirf usi object ko badalta hai.</p></div>

<div class="scn"><h4>Handover note</h4><p>Ek naya engineer campus wireless network inherit karta hai. Handover note mein hai: har AP ke liye ek policy tag PT-CAMPUS, controller database mein VLANs 20, 40, 50, VLAN 50 mein PP-GUEST aur R1 ACL GUEST-IN, aur ek chhota test card (staff address, guest address, guest RAD1 ko ping nahi kar sakta). Ek saal baad fault aata hai; test card minutes mein cause dhoondh leta hai.</p><p><b>Lesson:</b> consistent design plus chhota test card tickets ko sasta bana deta hai.</p></div>

<div class="iv"><p class="q">"Batao ki 9800 client ka VLAN kaise decide karta hai aur kya galat ho sakta hai."</p><p>SSID WLAN profile chunta hai; AP ka policy tag use policy profile se map karta hai; policy profile VLAN deta hai; VLAN controller database mein hona chahiye aur trunk par carry hona chahiye aur DHCP ke saath routed hona chahiye. Faults: AP par galat ya alag tag, disabled policy profile, missing VLAN, trunk ya DHCP faults, aur guests ke liye missing segmentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seamless roaming ke liye dono APs par matching policy chahiye.</li>
<li>Tags decide karte hain ki har AP kya serve kare; policy profile VLAN decide karta hai.</li>
<li>VLAN database, trunk aur DHCP path complete karte hain.</li>
<li>Guests ko apna SSID, VLAN aur ACL milta hai.</li>
<li>Har fix client se prove karo.</li>
</ul></div>
`}};export{e as default};