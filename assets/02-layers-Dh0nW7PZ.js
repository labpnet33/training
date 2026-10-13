var e={id:`layers`,h:{en:`The layered path: client, AP, WLC, network and AAA`,hi:`Layered path: client, AP, WLC, network aur AAA`},body:{en:`
<p>Think of a Wi-Fi session as a parcel travelling through a courier network. It is picked up (the client), carried by a local van (the AP), sorted at a hub (the WLC), driven along highways (the switched network) and checked at a security desk (AAA). A parcel can be stuck at any stage, and the customer only says "my parcel has not arrived". You find the stage by asking each one in order.</p>
<h3>The five layers</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Five layers">
<rect x="8" y="30" width="116" height="90" rx="8" fill="#bae6fd"/><text x="66" y="55" text-anchor="middle" class="svg-ink" font-size="13">1. Client</text><text x="66" y="75" text-anchor="middle" class="svg-muted" font-size="11">driver, SSID,</text><text x="66" y="91" text-anchor="middle" class="svg-muted" font-size="11">band, key</text>
<rect x="134" y="30" width="116" height="90" rx="8" fill="#ddd6fe"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. AP</text><text x="192" y="75" text-anchor="middle" class="svg-muted" font-size="11">joined, tags,</text><text x="192" y="91" text-anchor="middle" class="svg-muted" font-size="11">radios, country</text>
<rect x="260" y="30" width="116" height="90" rx="8" fill="#bbf7d0"/><text x="318" y="55" text-anchor="middle" class="svg-ink" font-size="13">3. WLC</text><text x="318" y="75" text-anchor="middle" class="svg-muted" font-size="11">WLAN, policy,</text><text x="318" y="91" text-anchor="middle" class="svg-muted" font-size="11">VLAN database</text>
<rect x="386" y="30" width="116" height="90" rx="8" fill="#fde68a"/><text x="444" y="55" text-anchor="middle" class="svg-ink" font-size="13">4. Network</text><text x="444" y="75" text-anchor="middle" class="svg-muted" font-size="11">trunk, VLANs,</text><text x="444" y="91" text-anchor="middle" class="svg-muted" font-size="11">DHCP, routing</text>
<rect x="512" y="30" width="120" height="90" rx="8" fill="#fed7aa"/><text x="572" y="55" text-anchor="middle" class="svg-ink" font-size="13">5. AAA</text><text x="572" y="75" text-anchor="middle" class="svg-muted" font-size="11">RADIUS, key,</text><text x="572" y="91" text-anchor="middle" class="svg-muted" font-size="11">user, list</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Each layer depends on the one before it. Test in this order.</text>
</svg><p class="cap">The five layers of a Wi-Fi session and what lives in each.</p></div>
<dl class="terms">
<dt>Client layer</dt><dd>The device: does it see the SSID, does it support the band, is the passphrase or username right, is its driver sane?</dd>
<dt>AP layer</dt><dd>Is the AP registered with the controller, does it have a policy tag that maps the SSID, are its radios enabled, is its country allowed?</dd>
<dt>WLC layer</dt><dd>Is the WLAN enabled, is the policy profile enabled with a VLAN that exists in the controller VLAN database, is the policy tag mapping present?</dd>
<dt>Network layer</dt><dd>Does the trunk to WLC1 allow the VLANs, does the AP port sit in VLAN 10, does R1 hand out DHCP and route to servers?</dd>
<dt>AAA layer</dt><dd>For 802.1X: is <code>aaa new-model</code> on, does the method list point to a group, does the group contain the server, does the shared secret match?</dd>
</dl>
<h3>Why order matters</h3>
<p>If AP3 never joined, no amount of checking RADIUS will help, because the SSID is never broadcast. If the client sees the SSID but gets no address, the AP and WLAN layers are largely fine and the next suspect is the policy VLAN or DHCP. A fault in a lower layer makes higher layers look broken too, so the first failing layer is your target.</p>
<div class="eg"><p><b>Worked example.</b> PHONE1 cannot see NK-VOICE. Layer 1: other SSIDs are visible on the phone, so the radio works. Layer 2: both APs are registered. Layer 3: the question is whether NK-VOICE is mapped in PT-CAMPUS to an <i>enabled</i> PP-VOICE. That is the exact chain checked in lab wl-ops-triage. Layers 4 and 5 are not reached because the SSID is not even broadcast.</p></div>
<h3>The broadcast rule</h3>
<p>On the 9800 an AP broadcasts a WLAN only when four things are true at once: the WLAN profile is enabled, the AP policy tag maps that WLAN to a policy profile, that policy profile is enabled, and the radio itself is serving (country allowed, band not shut down by the RF profile). An AP without a tag uses <code>default-policy-tag</code>, which has no WLANs, so it serves nothing. Memorise this rule; most "SSID invisible" tickets break one of those four conditions.</p>
<h3>Scope questions that save time</h3>
<table class="cmp"><tr><th>Scope</th><th>Likely layer</th></tr>
<tr><td>One client only</td><td>Client (driver, credentials, saved profile)</td></tr>
<tr><td>All clients on one AP</td><td>AP (tag, radio, channel) or the AP switchport</td></tr>
<tr><td>All clients on one SSID</td><td>WLC (WLAN, policy, tag) or AAA</td></tr>
<tr><td>All clients everywhere</td><td>Controller, trunk, DHCP or country</td></tr>
<tr><td>Associated but no IP</td><td>Policy VLAN, trunk, DHCP</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> (1) Testing from your own laptop only; your result may not represent the failing user. (2) Skipping the scope question and fixing the first object you notice. (3) Forgetting that the policy profile VLAN must exist in the controller VLAN database as well as on the switch.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Client connects but gets 169.254 address" is not an RF problem. Association worked; DHCP or VLAN placement failed.</p></div>
<div class="scn"><h4>Same symptom, different layers</h4><p>Two tickets arrived in one hour: "phones cannot see the voice SSID" and "laptops cannot get an address". The first was a missing policy tag map (WLC layer); the second was VLAN 20 missing from the controller VLAN database (also WLC, but a different object). A junior restarted both APs for each ticket and fixed neither. A senior asked scope first and fixed both in ten minutes.</p><p><b>Lesson:</b> same "Wi-Fi down" text, very different layers. Scope decides.</p></div>
<div class="iv"><p class="q">"How do you structure troubleshooting of a Wi-Fi session end to end?"</p><p>Client, AP, WLC, switched network, AAA. At each layer state what you check and which command proves it. Mention the broadcast rule and that you stop at the first failing layer.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five layers: client, AP, WLC, network, AAA.</li>
<li>Scope (one, one AP, one SSID, everyone) points to the layer.</li>
<li>An SSID is broadcast only if WLAN, tag map, policy profile and radio are all up.</li>
<li>Associated without IP means VLAN or DHCP, not RF.</li>
<li>The first failing layer is the target; do not skip layers.</li>
</ul></div>
`,hi:`
<p>Wi-Fi session ko ek courier network mein chalte parcel ki tarah socho. Use pick kiya jaata hai (client), local van le jaati hai (AP), hub mein sort hota hai (WLC), highway par chalta hai (switched network) aur security desk par check hota hai (AAA). Parcel kisi bhi stage par atak sakta hai, aur customer sirf kehta hai "mera parcel nahi aaya". Aap har stage se order mein poochkar stage dhundhte ho.</p>
<h3>Paanch layers</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Paanch layers">
<rect x="8" y="30" width="116" height="90" rx="8" fill="#bae6fd"/><text x="66" y="55" text-anchor="middle" class="svg-ink" font-size="13">1. Client</text><text x="66" y="75" text-anchor="middle" class="svg-muted" font-size="11">driver, SSID,</text><text x="66" y="91" text-anchor="middle" class="svg-muted" font-size="11">band, key</text>
<rect x="134" y="30" width="116" height="90" rx="8" fill="#ddd6fe"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="13">2. AP</text><text x="192" y="75" text-anchor="middle" class="svg-muted" font-size="11">joined, tags,</text><text x="192" y="91" text-anchor="middle" class="svg-muted" font-size="11">radios, country</text>
<rect x="260" y="30" width="116" height="90" rx="8" fill="#bbf7d0"/><text x="318" y="55" text-anchor="middle" class="svg-ink" font-size="13">3. WLC</text><text x="318" y="75" text-anchor="middle" class="svg-muted" font-size="11">WLAN, policy,</text><text x="318" y="91" text-anchor="middle" class="svg-muted" font-size="11">VLAN database</text>
<rect x="386" y="30" width="116" height="90" rx="8" fill="#fde68a"/><text x="444" y="55" text-anchor="middle" class="svg-ink" font-size="13">4. Network</text><text x="444" y="75" text-anchor="middle" class="svg-muted" font-size="11">trunk, VLANs,</text><text x="444" y="91" text-anchor="middle" class="svg-muted" font-size="11">DHCP, routing</text>
<rect x="512" y="30" width="120" height="90" rx="8" fill="#fed7aa"/><text x="572" y="55" text-anchor="middle" class="svg-ink" font-size="13">5. AAA</text><text x="572" y="75" text-anchor="middle" class="svg-muted" font-size="11">RADIUS, key,</text><text x="572" y="91" text-anchor="middle" class="svg-muted" font-size="11">user, list</text>
<text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Har layer pichhli layer par depend karti hai. Isi order mein test karo.</text>
</svg><p class="cap">Wi-Fi session ki paanch layers aur har ek mein kya rehta hai.</p></div>
<dl class="terms">
<dt>Client layer</dt><dd>Device: kya SSID dikhta hai, kya band support hai, passphrase ya username sahi hai, driver theek hai?</dd>
<dt>AP layer</dt><dd>AP controller ke saath registered hai, uske paas SSID map karne wala policy tag hai, radios enabled hain, country allowed hai?</dd>
<dt>WLC layer</dt><dd>WLAN enabled hai, policy profile enabled hai aur uska VLAN controller VLAN database mein hai, policy tag mapping maujood hai?</dd>
<dt>Network layer</dt><dd>WLC1 ke trunk par VLANs allowed hain, AP port VLAN 10 mein hai, R1 DHCP deta hai aur servers tak route karta hai?</dd>
<dt>AAA layer</dt><dd>802.1X ke liye: <code>aaa new-model</code> on hai, method list group ko point karti hai, group mein server hai, shared secret match karta hai?</dd>
</dl>
<h3>Order kyun matter karta hai</h3>
<p>Agar AP3 kabhi join hi nahi hua, to RADIUS check karne se kuch nahi hoga, kyunki SSID broadcast hi nahi hota. Agar client SSID dekhta hai lekin address nahi milta, to AP aur WLAN layers mostly theek hain aur agla suspect policy VLAN ya DHCP hai. Neeche ki layer ka fault upar ki layers ko bhi broken dikhata hai, isliye pehli failing layer hi aapka target hai.</p>
<div class="eg"><p><b>Worked example.</b> PHONE1 ko NK-VOICE nahi dikhta. Layer 1: phone par dusre SSIDs dikhte hain, matlab radio kaam karta hai. Layer 2: dono APs registered hain. Layer 3: sawal yeh hai ki NK-VOICE PT-CAMPUS mein <i>enabled</i> PP-VOICE se map hai ya nahi. Lab wl-ops-triage mein yahi chain check hoti hai. Layer 4 aur 5 tak jaane ki zaroorat nahi kyunki SSID broadcast hi nahi hota.</p></div>
<h3>Broadcast rule</h3>
<p>9800 par AP WLAN tabhi broadcast karta hai jab chaar cheezein ek saath sach hon: WLAN profile enabled ho, AP policy tag us WLAN ko policy profile se map kare, woh policy profile enabled ho, aur radio khud serve kar raha ho (country allowed, RF profile ne band shut na kiya ho). Bina tag wala AP <code>default-policy-tag</code> use karta hai jisme koi WLAN nahi, isliye woh kuch serve nahi karta. Yeh rule yaad rakho; zyadatar "SSID invisible" tickets inhi chaar conditions mein se kisi ko todte hain.</p>
<h3>Scope ke sawal jo time bachate hain</h3>
<table class="cmp"><tr><th>Scope</th><th>Sambhavit layer</th></tr>
<tr><td>Sirf ek client</td><td>Client (driver, credentials, saved profile)</td></tr>
<tr><td>Ek AP ke saare clients</td><td>AP (tag, radio, channel) ya AP switchport</td></tr>
<tr><td>Ek SSID ke saare clients</td><td>WLC (WLAN, policy, tag) ya AAA</td></tr>
<tr><td>Har jagah saare clients</td><td>Controller, trunk, DHCP ya country</td></tr>
<tr><td>Associated lekin IP nahi</td><td>Policy VLAN, trunk, DHCP</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> (1) Sirf apne laptop se test karna; aapka result failing user ka nahi ho sakta. (2) Scope sawal chhod kar jo pehla object dikhe use fix karna. (3) Bhoolna ki policy profile VLAN switch ke saath controller VLAN database mein bhi hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Client connect hota hai lekin 169.254 address milta hai" RF problem nahi hai. Association ho gaya; DHCP ya VLAN placement fail hua.</p></div>
<div class="scn"><h4>Same symptom, alag layers</h4><p>Ek ghante mein do tickets aaye: "phones ko voice SSID nahi dikhta" aur "laptops ko address nahi milta". Pehla missing policy tag map tha (WLC layer); doosra controller VLAN database mein VLAN 20 missing tha (woh bhi WLC, lekin alag object). Junior ne har ticket par dono APs restart kiye aur kuch fix nahi hua. Senior ne pehle scope poocha aur dono das minute mein fix kar diye.</p><p><b>Seekh:</b> same "Wi-Fi down" text, bahut alag layers. Scope decide karta hai.</p></div>
<div class="iv"><p class="q">"Wi-Fi session ko end to end kaise troubleshoot karte ho?"</p><p>Client, AP, WLC, switched network, AAA. Har layer par batao kya check karte ho aur kaunsa command prove karta hai. Broadcast rule mention karo aur batao ki pehli failing layer par ruk jaate ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch layers: client, AP, WLC, network, AAA.</li>
<li>Scope (ek, ek AP, ek SSID, sab) layer ki taraf ishara karta hai.</li>
<li>SSID tabhi broadcast hota hai jab WLAN, tag map, policy profile aur radio sab up hon.</li>
<li>Associated lekin IP nahi matlab VLAN ya DHCP, RF nahi.</li>
<li>Pehli failing layer target hai; layers skip mat karo.</li>
</ul></div>
`}};export{e as default};