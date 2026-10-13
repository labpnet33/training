var e={id:`profiles-and-tags`,h:{en:`The 9800 configuration model: profiles and tags`,hi:`9800 ka configuration model: profiles aur tags`},body:{en:`
<p>This is the most important chapter of the module. Almost every 9800 task, from your first SSID to roaming and RF tuning, is an application of one idea: <b>small objects called profiles, joined by objects called tags, attached to APs</b>. Learn this picture and the rest of the course is easy.</p>

<h3>Analogy: a restaurant menu kit</h3>
<p>A restaurant chain has dishes (recipes), serving rules (dine-in or takeaway, which counter), and branch settings (opening hours, licence). Head office does not write one giant document per branch. It keeps recipes, rules and settings as separate pieces. Each branch gets a <b>kit</b> that says: use this set of dishes, with these serving rules, and these branch settings. Change one recipe and every kit that uses it follows.</p>
<p>On the 9800, an AP is a branch. Its <b>tags</b> are the kit. The <b>profiles</b> are the recipes and rules.</p>

<h3>The profiles (what to do)</h3>
<dl class="terms">
<dt>WLAN profile</dt><dd>Defines the SSID itself: profile name, WLAN id (a number from 1 to 4096 on current software), SSID name, security (open, PSK, 802.1X, WPA2, WPA3). Example: <code>NK-STAFF</code>, id 1, WPA2-PSK. It says nothing about VLANs.</dd>
<dt>Policy profile</dt><dd>Defines what happens to clients on a WLAN: VLAN, central or local switching, central authentication, QoS, timeouts, ACLs. Example: <code>PP-STAFF</code> puts clients in VLAN 20.</dd>
<dt>AP join profile (AP profile)</dt><dd>Settings for AP behaviour such as country, NTP, SSH and syslog. Example in the course: <code>AP-PROF-US</code>.</dd>
<dt>Flex profile</dt><dd>Settings for FlexConnect local switching. Concept only here, not simulated in the lab.</dd>
<dt>RF profile</dt><dd>Radio settings per band: transmit power limits, data rates, channel rules. Example: <code>CAMPUS-5</code>. Chapter in the RF module.</dd>
</dl>

<h3>The tags (which objects an AP uses)</h3>
<dl class="terms">
<dt>Policy tag</dt><dd>A table that maps each <b>WLAN profile</b> to a <b>policy profile</b>. Example: <code>PT-CAMPUS</code> maps NK-STAFF to PP-STAFF.</dd>
<dt>Site tag</dt><dd>Points to an AP profile (and flex profile). Describes the physical site's AP-wide settings.</dd>
<dt>RF tag</dt><dd>Points to one RF profile for 2.4 GHz and one for 5 GHz.</dd>
</dl>
<p>Every AP carries exactly one policy tag, one site tag and one RF tag. That trio decides everything the AP does.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Profiles and tags">
<rect x="10" y="10" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="85" y="32" text-anchor="middle" class="svg-ink" font-size="12">WLAN profile NK-STAFF</text>
<rect x="10" y="60" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="85" y="82" text-anchor="middle" class="svg-ink" font-size="12">WLAN profile NK-CORP</text>
<rect x="240" y="10" width="150" height="34" rx="6" fill="#fed7aa"/><text x="315" y="32" text-anchor="middle" class="svg-ink" font-size="12">Policy PP-STAFF VLAN 20</text>
<rect x="240" y="60" width="150" height="34" rx="6" fill="#fed7aa"/><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="12">Policy PP-CORP VLAN 40</text>
<rect x="470" y="30" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="12">POLICY TAG</text><text x="545" y="66" text-anchor="middle" class="svg-ink" font-size="12">PT-CAMPUS</text>
<line x1="160" y1="27" x2="240" y2="27" stroke="#64748b"/><line x1="160" y1="77" x2="240" y2="77" stroke="#64748b"/>
<line x1="390" y1="27" x2="470" y2="45" stroke="#64748b"/><line x1="390" y1="77" x2="470" y2="62" stroke="#64748b"/>
<rect x="240" y="130" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="315" y="148" text-anchor="middle" class="svg-ink" font-size="12">SITE TAG ST-CAMPUS</text><text x="315" y="163" text-anchor="middle" class="svg-muted" font-size="11"> &rarr; AP profile</text>
<rect x="470" y="130" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="545" y="148" text-anchor="middle" class="svg-ink" font-size="12">RF TAG RF-CAMPUS</text><text x="545" y="163" text-anchor="middle" class="svg-muted" font-size="11"> &rarr; RF profiles</text>
<rect x="240" y="225" width="150" height="50" rx="10" fill="#fde68a"/><text x="315" y="248" text-anchor="middle" class="svg-ink" font-size="13">AP1 / AP2</text><text x="315" y="265" text-anchor="middle" class="svg-muted" font-size="11">one of each tag</text>
<line x1="545" y1="76" x2="360" y2="225" stroke="#64748b"/><line x1="315" y1="170" x2="315" y2="225" stroke="#64748b"/><line x1="545" y1="170" x2="390" y2="235" stroke="#64748b"/>
</svg><p class="cap">Profiles hold settings. Tags link profiles together. APs carry tags. In this module only the policy tag is built; site and RF tags appear in later modules.</p></div>

<h3>Why such a complicated model?</h3>
<p>Because it is reusable and scalable. Suppose you have 300 APs and two SSIDs. With the old model each change touched many places. With tags, the SSID is defined once, the VLAN decision is defined once, and the tag is applied to 300 APs. Two floors needing a different VLAN for the same SSID? Make a second policy tag with a different policy profile for the same WLAN. Keep it in mind: the same WLAN profile can be reused in many tags with different policies.</p>

<h3>Default tags</h3>
<p>An AP that has not been given a tag gets the default ones: <code>default-policy-tag</code>, <code>default-site-tag</code> and <code>default-rf-tag</code>. In the lab model <code>default-policy-tag</code> contains no WLANs, so an untagged AP serves no SSID at all. On real software, depending on release and wizard, the default policy tag can contain automatic mappings for some WLAN IDs to a default policy profile, so never rely on it: tag your APs explicitly. Chapter 8 returns to this.</p>

<h3>How tags get onto APs</h3>
<ul>
<li><b>Static assignment</b> by AP MAC address or name: in the CLI, <code>ap name AP1 policy-tag PT-CAMPUS</code>. This is what the labs use.</li>
<li><b>Filters</b> with a regular expression on the AP name, which assign tags automatically (concept; not simulated in the lab).</li>
<li><b>Tag persistence and location-based tagging</b> in larger deployments.</li>
</ul>
<p>Changing a tag makes the AP drop its CAPWAP session and rejoin the controller to pick up the new tag (the radios restart on real hardware), so plan changes in a window.</p>

<div class="eg"><p><b>Worked example.</b> You need NK-STAFF in VLAN 20 on every AP. Objects: one WLAN profile NK-STAFF (id 1), one policy profile PP-STAFF (VLAN 20), one policy tag PT-CAMPUS containing the pair <code>NK-STAFF &rarr; PP-STAFF</code>. Tag AP1 and AP2 with PT-CAMPUS. Later you add NK-GUEST: create WLAN NK-GUEST, policy PP-GUEST (VLAN 50), add one more pair into PT-CAMPUS. Both APs now broadcast both SSIDs with no AP touched.</p></div>

<table class="cmp"><tr><th>Question</th><th>Which object answers it?</th></tr>
<tr><td>What is the SSID name and security?</td><td>WLAN profile</td></tr>
<tr><td>Which VLAN do clients land in?</td><td>Policy profile</td></tr>
<tr><td>Which WLANs does this AP offer, with which policy?</td><td>Policy tag</td></tr>
<tr><td>Which country and AP-wide settings?</td><td>AP profile through the site tag</td></tr>
<tr><td>How strong is the radio?</td><td>RF profile through the RF tag</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Putting VLAN thinking into the WLAN profile; it belongs in the policy profile. (2) Creating the objects and forgetting to put them in a tag. (3) Forgetting to apply the tag to the AP. (4) Assuming a tag change on the policy tag needs re-tagging every AP: editing the contents of a tag already in use updates the APs that carry it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The policy tag maps WLAN profile to policy profile. The WLAN profile does not reference a VLAN. A common wrong answer says the WLAN profile contains the VLAN.</p></div>

<div class="scn"><h4>Same SSID, different VLAN on floor 2</h4><p>A hospital wanted nurses on floor 2 in VLAN 120 while everywhere else used VLAN 20, but with the same SSID name. The engineer created a second policy profile and a second policy tag pointing the same WLAN to it, and tagged floor-2 APs with it. No new SSID was needed and the configuration stayed three lines long. (The roaming module explains why such a split can also cause trouble if it is accidental.)</p><p><b>Lesson:</b> the same WLAN can behave differently by tag.</p></div>

<div class="iv"><p class="q">"Explain WLAN profile, policy profile and policy tag on a 9800."</p><p>Strong answer: the WLAN profile defines SSID and security; the policy profile defines client treatment such as VLAN and switching mode; the policy tag maps WLANs to policies; the AP carries one policy tag, one site tag and one RF tag. Say the model is reusable and that untagged APs get default tags.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Profiles hold settings; tags link profiles; every AP carries a policy tag, a site tag and an RF tag.</li>
<li>WLAN profile: SSID and security. Policy profile: VLAN and client behaviour.</li>
<li>Policy tag maps WLAN profile to policy profile.</li>
<li>Untagged APs use default tags that serve no WLANs in the lab model.</li>
<li>Edit once, apply to many APs.</li>
</ul></div>
`,hi:`
<p>Yeh is module ka sabse important chapter hai. 9800 ka lagbhag har task, aapke pehle SSID se leke roaming aur RF tuning tak, ek hi idea ka application hai: <b>profiles naam ke chhote objects, tags naam ke objects se jude hue, APs par attach</b>. Yeh picture seekh lo to course ka baaki hissa aasan hai.</p>

<h3>Analogy: restaurant ka menu kit</h3>
<p>Ek restaurant chain ke paas dishes (recipes), serving rules (dine-in ya takeaway, kaunsa counter) aur branch settings (opening hours, licence) hote hain. Head office har branch ke liye ek giant document nahi likhta. Woh recipes, rules aur settings alag alag tukdon mein rakhta hai. Har branch ko ek <b>kit</b> milti hai jo kehti hai: yeh dishes use karo, in serving rules ke saath, aur yeh branch settings. Ek recipe badlo to har kit jo use use karti hai follow karti hai.</p>
<p>9800 par AP ek branch hai. Uske <b>tags</b> kit hain. <b>Profiles</b> recipes aur rules hain.</p>

<h3>Profiles (kya karna hai)</h3>
<dl class="terms">
<dt>WLAN profile</dt><dd>SSID khud define karta hai: profile name, WLAN id (current software par 1 se 4096 ka number), SSID name, security (open, PSK, 802.1X, WPA2, WPA3). Example: <code>NK-STAFF</code>, id 1, WPA2-PSK. VLANs ke baare mein kuch nahi kehta.</dd>
<dt>Policy profile</dt><dd>Define karta hai ki WLAN par clients ke saath kya hoga: VLAN, central ya local switching, central authentication, QoS, timeouts, ACLs. Example: <code>PP-STAFF</code> clients ko VLAN 20 mein daalta hai.</dd>
<dt>AP join profile (AP profile)</dt><dd>AP behaviour ki settings jaise country, NTP, SSH aur syslog. Course ka example: <code>AP-PROF-US</code>.</dd>
<dt>Flex profile</dt><dd>FlexConnect local switching ki settings. Yahan sirf concept, lab mein simulated nahi.</dd>
<dt>RF profile</dt><dd>Har band ki radio settings: transmit power limits, data rates, channel rules. Example: <code>CAMPUS-5</code>. RF module mein aayega.</dd>
</dl>

<h3>Tags (AP kaunse objects use karta hai)</h3>
<dl class="terms">
<dt>Policy tag</dt><dd>Ek table jo har <b>WLAN profile</b> ko ek <b>policy profile</b> se map karta hai. Example: <code>PT-CAMPUS</code> NK-STAFF ko PP-STAFF se map karta hai.</dd>
<dt>Site tag</dt><dd>Ek AP profile (aur flex profile) ki taraf point karta hai. Physical site ki AP-wide settings describe karta hai.</dd>
<dt>RF tag</dt><dd>2.4 GHz ke liye ek aur 5 GHz ke liye ek RF profile ki taraf point karta hai.</dd>
</dl>
<p>Har AP ke paas theek ek policy tag, ek site tag aur ek RF tag hota hai. Yahi trio decide karta hai ki AP kya karega.</p>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Profiles aur tags">
<rect x="10" y="10" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="85" y="32" text-anchor="middle" class="svg-ink" font-size="12">WLAN profile NK-STAFF</text>
<rect x="10" y="60" width="150" height="34" rx="6" fill="#bbf7d0"/><text x="85" y="82" text-anchor="middle" class="svg-ink" font-size="12">WLAN profile NK-CORP</text>
<rect x="240" y="10" width="150" height="34" rx="6" fill="#fed7aa"/><text x="315" y="32" text-anchor="middle" class="svg-ink" font-size="12">Policy PP-STAFF VLAN 20</text>
<rect x="240" y="60" width="150" height="34" rx="6" fill="#fed7aa"/><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="12">Policy PP-CORP VLAN 40</text>
<rect x="470" y="30" width="150" height="46" rx="8" fill="#ddd6fe"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="12">POLICY TAG</text><text x="545" y="66" text-anchor="middle" class="svg-ink" font-size="12">PT-CAMPUS</text>
<line x1="160" y1="27" x2="240" y2="27" stroke="#64748b"/><line x1="160" y1="77" x2="240" y2="77" stroke="#64748b"/>
<line x1="390" y1="27" x2="470" y2="45" stroke="#64748b"/><line x1="390" y1="77" x2="470" y2="62" stroke="#64748b"/>
<rect x="240" y="130" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="315" y="148" text-anchor="middle" class="svg-ink" font-size="12">SITE TAG ST-CAMPUS</text><text x="315" y="163" text-anchor="middle" class="svg-muted" font-size="11"> &rarr; AP profile</text>
<rect x="470" y="130" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="545" y="148" text-anchor="middle" class="svg-ink" font-size="12">RF TAG RF-CAMPUS</text><text x="545" y="163" text-anchor="middle" class="svg-muted" font-size="11"> &rarr; RF profiles</text>
<rect x="240" y="225" width="150" height="50" rx="10" fill="#fde68a"/><text x="315" y="248" text-anchor="middle" class="svg-ink" font-size="13">AP1 / AP2</text><text x="315" y="265" text-anchor="middle" class="svg-muted" font-size="11">har tag ek ek</text>
<line x1="545" y1="76" x2="360" y2="225" stroke="#64748b"/><line x1="315" y1="170" x2="315" y2="225" stroke="#64748b"/><line x1="545" y1="170" x2="390" y2="235" stroke="#64748b"/>
</svg><p class="cap">Profiles settings rakhte hain. Tags profiles ko jodte hain. APs tags carry karte hain. Is module mein sirf policy tag banta hai; site aur RF tags aage ke modules mein.</p></div>

<h3>Itna complicated model kyun?</h3>
<p>Kyunki yeh reusable aur scalable hai. Maan lo 300 APs aur do SSIDs hain. Purane model mein har change kai jagah touch karta tha. Tags ke saath SSID ek baar define hota hai, VLAN ka decision ek baar define hota hai, aur tag 300 APs par lag jaata hai. Do floors ko same SSID ke liye alag VLAN chahiye? Same WLAN ke liye alag policy profile wala doosra policy tag banao. Yaad rakho: ek hi WLAN profile kai tags mein alag policies ke saath reuse ho sakta hai.</p>

<h3>Default tags</h3>
<p>Jis AP ko tag nahi diya gaya use default tags milte hain: <code>default-policy-tag</code>, <code>default-site-tag</code> aur <code>default-rf-tag</code>. Lab model mein <code>default-policy-tag</code> mein koi WLAN nahi hota, isliye untagged AP koi SSID serve nahi karta. Real software par, release aur wizard ke hisaab se, default policy tag mein kuch WLAN IDs ke default policy profile se automatic mappings ho sakte hain, isliye us par kabhi rely mat karo: APs ko explicitly tag karo. Chapter 8 isi par wapas aata hai.</p>

<h3>Tags APs par kaise lagte hain</h3>
<ul>
<li><b>Static assignment</b> AP MAC address ya name se: CLI mein <code>ap name AP1 policy-tag PT-CAMPUS</code>. Labs yahi use karte hain.</li>
<li><b>Filters</b> AP name par regular expression ke saath, jo tags automatically assign karte hain (concept; lab mein simulated nahi).</li>
<li><b>Tag persistence aur location-based tagging</b> bade deployments mein.</li>
</ul>
<p>Tag badalne par AP apna CAPWAP session girata hai aur naya tag lene ke liye controller se dobara join karta hai (real hardware par radios restart hote hain), isliye changes window mein plan karo.</p>

<div class="eg"><p><b>Worked example.</b> Aapko har AP par NK-STAFF VLAN 20 mein chahiye. Objects: ek WLAN profile NK-STAFF (id 1), ek policy profile PP-STAFF (VLAN 20), ek policy tag PT-CAMPUS jismein jodi <code>NK-STAFF &rarr; PP-STAFF</code>. AP1 aur AP2 ko PT-CAMPUS se tag karo. Baad mein NK-GUEST add karna ho: WLAN NK-GUEST banao, policy PP-GUEST (VLAN 50), PT-CAMPUS mein ek aur jodi daalo. Ab dono APs bina kisi AP ko chhue dono SSIDs broadcast karte hain.</p></div>

<table class="cmp"><tr><th>Sawaal</th><th>Kaunsa object jawab deta hai?</th></tr>
<tr><td>SSID name aur security kya hai?</td><td>WLAN profile</td></tr>
<tr><td>Clients kaunse VLAN mein jaate hain?</td><td>Policy profile</td></tr>
<tr><td>Yeh AP kaunse WLANs, kaunsi policy ke saath deta hai?</td><td>Policy tag</td></tr>
<tr><td>Kaunsi country aur AP-wide settings?</td><td>Site tag ke through AP profile</td></tr>
<tr><td>Radio kitna strong hai?</td><td>RF tag ke through RF profile</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) VLAN ki soch WLAN profile mein daalna; woh policy profile mein aata hai. (2) Objects bana ke tag mein daalna bhool jaana. (3) Tag AP par apply karna bhool jaana. (4) Yeh maan lena ki policy tag edit karne par har AP ko dobara tag karna padta hai: jo tag use mein hai uska content edit karne se use carry karne wale APs update ho jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy tag WLAN profile ko policy profile se map karta hai. WLAN profile VLAN reference nahi karta. Aam galat jawab kehta hai ki WLAN profile mein VLAN hota hai.</p></div>

<div class="scn"><h4>Floor 2 par same SSID, alag VLAN</h4><p>Ek hospital chahta tha ki floor 2 ke nurses VLAN 120 mein hon jabki baaki sab jagah VLAN 20 ho, lekin SSID name same. Engineer ne doosra policy profile aur doosra policy tag banaya jo same WLAN ko usse point karta tha, aur floor-2 APs ko usse tag kiya. Naye SSID ki zaroorat nahi padi aur configuration teen lines ki rahi. (Roaming module samjhata hai ki aisa split galti se ho jaye to problem bhi kar sakta hai.)</p><p><b>Seekh:</b> same WLAN tag ke hisaab se alag behave kar sakta hai.</p></div>

<div class="iv"><p class="q">"9800 par WLAN profile, policy profile aur policy tag explain karo."</p><p>Strong answer: WLAN profile SSID aur security define karta hai; policy profile client treatment jaise VLAN aur switching mode; policy tag WLANs ko policies se map karta hai; AP ek policy tag, ek site tag aur ek RF tag carry karta hai. Bolo ki model reusable hai aur untagged APs ko default tags milte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Profiles settings rakhte hain; tags profiles jodte hain; har AP policy tag, site tag aur RF tag carry karta hai.</li>
<li>WLAN profile: SSID aur security. Policy profile: VLAN aur client behaviour.</li>
<li>Policy tag WLAN profile ko policy profile se map karta hai.</li>
<li>Untagged APs default tags use karte hain jo lab model mein koi WLAN serve nahi karte.</li>
<li>Ek baar edit karo, kai APs par apply karo.</li>
</ul></div>
`}};export{e as default};