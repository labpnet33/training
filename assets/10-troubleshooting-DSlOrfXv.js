var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: roaming, tags and VLAN placement`,hi:`Troubleshooting workflow: roaming, tags aur VLAN placement`},body:{en:`
<h3>A method, not a guess</h3>
<p>Wireless tickets arrive as feelings: "Wi-Fi is bad", "my call drops when I walk", "guests can see our printers". A good engineer turns the feeling into a measured symptom, then walks a fixed chain of checks from the client side to the controller side. In this module the chain has five links, and each link has one command that proves or clears it.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Five link chain">
<rect x="10" y="40" width="112" height="70" rx="8" fill="#bae6fd"/><text x="66" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 AP tags</text><text x="66" y="88" text-anchor="middle" class="svg-muted" font-size="11">ap tag summary</text>
<rect x="132" y="40" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="188" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Policy tag</text><text x="188" y="88" text-anchor="middle" class="svg-muted" font-size="11">tag policy detailed</text>
<rect x="254" y="40" width="112" height="70" rx="8" fill="#bbf7d0"/><text x="310" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Policy profile</text><text x="310" y="88" text-anchor="middle" class="svg-muted" font-size="11">profile policy detailed</text>
<rect x="376" y="40" width="112" height="70" rx="8" fill="#fde68a"/><text x="432" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 VLAN db</text><text x="432" y="88" text-anchor="middle" class="svg-muted" font-size="11">show vlan brief</text>
<rect x="498" y="40" width="132" height="70" rx="8" fill="#fed7aa"/><text x="564" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 Wired path</text><text x="564" y="88" text-anchor="middle" class="svg-muted" font-size="11">trunk, R1, ACL</text>
<line x1="122" y1="75" x2="132" y2="75" stroke="#64748b"/><line x1="244" y1="75" x2="254" y2="75" stroke="#64748b"/><line x1="366" y1="75" x2="376" y2="75" stroke="#64748b"/><line x1="488" y1="75" x2="498" y2="75" stroke="#64748b"/>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Start with the client: which AP, which VLAN, which address?</text>
</svg><p class="cap">The client detail view tells you where to enter the chain.</p></div>

<h3>Step 0: collect the client facts</h3>
<p>Before touching the controller configuration, answer four questions from <code>show wireless client summary</code>, the detail view and <code>wifi status</code> on the client:</p>
<ol>
<li>Which SSID and WLAN profile is it on?</li>
<li>Which AP serves it (and did that change)?</li>
<li>Which VLAN and policy profile does the client report?</li>
<li>Which IP does it have, and does it match the VLAN?</li>
</ol>
<p>The answers split most tickets: <i>no SSID</i> (tag or WLAN fault, earlier module), <i>SSID but no address</i> (placement, VLAN database or wired path), <i>address in the wrong subnet</i> (tag or policy mismatch), <i>address fine but internal access wrong</i> (ACL or segmentation).</p>

<h3>The decision table</h3>
<table class="cmp"><tr><th>Symptom</th><th>First evidence</th><th>Likely object</th><th>Fix</th></tr>
<tr><td>Different subnet on another AP</td><td>Policy tag per AP, client VLAN per AP</td><td>AP policy tag</td><td>ap name AP2 policy-tag PT-CAMPUS</td></tr>
<tr><td>SSID found, no address, no DHCP request</td><td>Policy profile detail, log VLAN_MISSING</td><td>Controller VLAN database</td><td>vlan 20, name STAFF</td></tr>
<tr><td>SSID found, no address, VLAN present</td><td>Trunk allowed list, R1 helper</td><td>SW1 trunk or R1 DHCP</td><td>Fix on that device</td></tr>
<tr><td>Guest reaches servers</td><td>Client VLAN, R1 ACL</td><td>Policy mapping or ACL</td><td>Map NK-GUEST to PP-GUEST, fix ACL</td></tr>
<tr><td>Guest SSID missing</td><td>Tag policy detailed, PP-GUEST status</td><td>Map or disabled policy profile</td><td>Add map, no shutdown</td></tr></table>

<h3>Working through each lab ticket</h3>
<h4>wl-roam-tag-mismatch</h4>
<p>Symptom: new subnet after walking. Evidence: two policy tags, two VLANs. Fix: one AP command. Proof: client address in 10.10.20.0/24 on AP2. Do not touch DHCP or RF.</p>
<h4>wl-guest-vlan</h4>
<p>Not a fault but a build. Check the chain from right to left: AP tag already PT-CAMPUS, the map in the tag, the policy profile enabled with VLAN 50, WLAN enabled. Prove with a guest address, gateway ping success and server ping failure, then re-test staff.</p>
<h4>wl-vlan-missing</h4>
<p>Symptom: associated, no address. Evidence: NOT IN VLAN DATABASE and VLAN_MISSING. Fix: vlan 20 with the name STAFF on WLC1. Proof: client in VLAN 20, RAD1 reachable.</p>

<h3>Useful commands in order of cost</h3>
<pre class="code">show wireless client summary
show wireless client mac-address 0050.7966.6801 detail
show ap tag summary
show wireless tag policy detailed PT-CAMPUS
show wireless profile policy summary
show wireless profile policy detailed PP-STAFF
show vlan brief
show interfaces trunk
show logging</pre>
<pre class="out">WLC1# show wireless profile policy summary

Number of Policy Profiles: 3

Policy Profile Name                Description                    Status
default-policy-profile             default policy profile         ENABLED
PP-STAFF                                                          ENABLED
PP-GUEST                                                          <span class="hl">DISABLED</span></pre>
<p>That output tells you immediately that guests cannot be served: PP-GUEST was never enabled. Cheap commands first; configuration comes only when evidence names an object.</p>

<h3>The change discipline</h3>
<ul>
<li><b>One change at a time</b>, then re-test from the client.</li>
<li><b>Fix on the owner object.</b> The VLAN database belongs to the controller; the trunk belongs to the switch; the ACL belongs to the router.</li>
<li><b>Keep the objects.</b> Prefer re-tagging an AP to the right existing tag over deleting tags.</li>
<li><b>Write the note:</b> symptom, evidence, cause, change, proof.</li>
</ul>

<h3>Roaming-specific checks (when tags and VLANs are fine)</h3>
<p>If the client keeps the same VLAN and address but experience is still poor while moving, the issue is likely RF or client behaviour. Check RSSI of the serving AP from the client detail view, whether the client is sticky (concept), AP power and channel plan (RF module), and fast roaming support on the client and WLAN. 802.11r/k/v and sticky behaviour cannot be demonstrated in the lab; knowing them lets you give a precise recommendation in a real network.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Starting with RF analysis when the client changed VLAN. (2) Rebooting APs "to refresh tags". (3) Several simultaneous changes, so you cannot tell which one fixed it. (4) Fixing on the wrong device, for example creating a VLAN on the switch when the missing one is on the controller. (5) No after-proof.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order matters: client facts, tags, policy profile, VLAN database, wired path. A policy profile that looks fine can still fail because the VLAN is missing in the database.</p></div>

<div class="scn"><h4>Three tickets in one morning</h4><p>Monday brings three calls: (a) users on floor 2 get 10.10.41.x addresses; (b) a new contractor wing gets no addresses at all; (c) the guest SSID is not visible. The engineer opens each client view. (a) shows AP2 in another policy tag, re-tagged. (b) shows VLAN_MISSING, VLAN created. (c) shows PP-GUEST DISABLED, enabled. Three different objects, three one-line fixes, each proved from a client.</p><p><b>Lesson:</b> the same words "Wi-Fi is broken" hide different objects. Evidence picks the object.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a wireless client that cannot get an address."</p><p>I confirm the client sees the SSID and associates, then read which AP, policy tag, policy profile and VLAN apply. I check the policy profile is enabled, the VLAN exists in the controller database and is allowed on the trunk, and that R1 has the SVI and DHCP pool. I read the log for placement errors. I change one object, then verify with the client address and a ping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain: client facts, AP tags, policy tag, policy profile, VLAN database, wired path.</li>
<li>Use cheap show commands first; read the log.</li>
<li>Fix the owner object and change one thing at a time.</li>
<li>Always prove from the client with address, AP and ping.</li>
<li>Roaming quality beyond tags depends on RF and client behaviour.</li>
</ul></div>
`,hi:`
<h3>Method, guess nahi</h3>
<p>Wireless tickets feelings ki tarah aate hain: "Wi-Fi kharab hai", "chalte waqt meri call drop hoti hai", "guests hamare printers dekh sakte hain". Achha engineer feeling ko measured symptom mein badalta hai, phir client side se controller side tak checks ki ek fixed chain par chalta hai. Is module mein chain ke paanch links hain, aur har link ko prove ya clear karne ke liye ek command hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Five link chain">
<rect x="10" y="40" width="112" height="70" rx="8" fill="#bae6fd"/><text x="66" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 AP tags</text><text x="66" y="88" text-anchor="middle" class="svg-muted" font-size="11">ap tag summary</text>
<rect x="132" y="40" width="112" height="70" rx="8" fill="#ddd6fe"/><text x="188" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Policy tag</text><text x="188" y="88" text-anchor="middle" class="svg-muted" font-size="11">tag policy detailed</text>
<rect x="254" y="40" width="112" height="70" rx="8" fill="#bbf7d0"/><text x="310" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Policy profile</text><text x="310" y="88" text-anchor="middle" class="svg-muted" font-size="11">profile policy detailed</text>
<rect x="376" y="40" width="112" height="70" rx="8" fill="#fde68a"/><text x="432" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 VLAN db</text><text x="432" y="88" text-anchor="middle" class="svg-muted" font-size="11">show vlan brief</text>
<rect x="498" y="40" width="132" height="70" rx="8" fill="#fed7aa"/><text x="564" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 Wired path</text><text x="564" y="88" text-anchor="middle" class="svg-muted" font-size="11">trunk, R1, ACL</text>
<line x1="122" y1="75" x2="132" y2="75" stroke="#64748b"/><line x1="244" y1="75" x2="254" y2="75" stroke="#64748b"/><line x1="366" y1="75" x2="376" y2="75" stroke="#64748b"/><line x1="488" y1="75" x2="498" y2="75" stroke="#64748b"/>
<text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Client se shuru karo: kaunsa AP, kaunsa VLAN, kaunsa address?</text>
</svg><p class="cap">Client detail view batata hai ki chain mein kahan se enter karna hai.</p></div>

<h3>Step 0: client facts collect karo</h3>
<p>Controller configuration ko touch karne se pehle <code>show wireless client summary</code>, detail view aur client par <code>wifi status</code> se chaar sawaalon ke jawab do:</p>
<ol>
<li>Kaunsa SSID aur WLAN profile?</li>
<li>Kaunsa AP serve kar raha hai (aur kya woh badla)?</li>
<li>Client kaunsa VLAN aur policy profile report karta hai?</li>
<li>Uska IP kya hai, aur kya woh VLAN se match karta hai?</li>
</ol>
<p>Jawab zyadatar tickets ko baant dete hain: <i>SSID nahi</i> (tag ya WLAN fault, pichhla module), <i>SSID hai lekin address nahi</i> (placement, VLAN database ya wired path), <i>galat subnet mein address</i> (tag ya policy mismatch), <i>address theek lekin internal access galat</i> (ACL ya segmentation).</p>

<h3>Decision table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Pehla evidence</th><th>Likely object</th><th>Fix</th></tr>
<tr><td>Doosre AP par alag subnet</td><td>Har AP ka policy tag, har AP par client VLAN</td><td>AP policy tag</td><td>ap name AP2 policy-tag PT-CAMPUS</td></tr>
<tr><td>SSID mila, address nahi, DHCP request nahi</td><td>Policy profile detail, log VLAN_MISSING</td><td>Controller VLAN database</td><td>vlan 20, name STAFF</td></tr>
<tr><td>SSID mila, address nahi, VLAN present</td><td>Trunk allowed list, R1 helper</td><td>SW1 trunk ya R1 DHCP</td><td>Us device par fix</td></tr>
<tr><td>Guest servers tak pahunchta hai</td><td>Client VLAN, R1 ACL</td><td>Policy mapping ya ACL</td><td>NK-GUEST ko PP-GUEST se map karo, ACL fix</td></tr>
<tr><td>Guest SSID missing</td><td>Tag policy detailed, PP-GUEST status</td><td>Map ya disabled policy profile</td><td>Map add, no shutdown</td></tr></table>

<h3>Har lab ticket ko solve karna</h3>
<h4>wl-roam-tag-mismatch</h4>
<p>Symptom: chalne ke baad naya subnet. Evidence: do policy tags, do VLANs. Fix: ek AP command. Proof: AP2 par client address 10.10.20.0/24 mein. DHCP ya RF ko touch mat karo.</p>
<h4>wl-guest-vlan</h4>
<p>Fault nahi, build hai. Chain right se left check karo: AP tag pehle se PT-CAMPUS, tag mein map, VLAN 50 ke saath enabled policy profile, WLAN enabled. Guest address, gateway ping success aur server ping failure se prove karo, phir staff dobara test karo.</p>
<h4>wl-vlan-missing</h4>
<p>Symptom: associated, address nahi. Evidence: NOT IN VLAN DATABASE aur VLAN_MISSING. Fix: WLC1 par vlan 20 aur naam STAFF. Proof: client VLAN 20 mein, RAD1 reachable.</p>

<h3>Cost ke order mein useful commands</h3>
<pre class="code">show wireless client summary
show wireless client mac-address 0050.7966.6801 detail
show ap tag summary
show wireless tag policy detailed PT-CAMPUS
show wireless profile policy summary
show wireless profile policy detailed PP-STAFF
show vlan brief
show interfaces trunk
show logging</pre>
<pre class="out">WLC1# show wireless profile policy summary

Number of Policy Profiles: 3

Policy Profile Name                Description                    Status
default-policy-profile             default policy profile         ENABLED
PP-STAFF                                                          ENABLED
PP-GUEST                                                          <span class="hl">DISABLED</span></pre>
<p>Yeh output turant batata hai ki guests serve nahi ho sakte: PP-GUEST kabhi enable nahi hua. Pehle sasti commands; configuration tabhi jab evidence kisi object ka naam le.</p>

<h3>Change discipline</h3>
<ul>
<li><b>Ek time par ek change</b>, phir client se re-test.</li>
<li><b>Owner object par fix.</b> VLAN database controller ka hai; trunk switch ka; ACL router ki.</li>
<li><b>Objects rakho.</b> Tags delete karne ki jagah AP ko sahi existing tag par re-tag karna behtar hai.</li>
<li><b>Note likho:</b> symptom, evidence, cause, change, proof.</li>
</ul>

<h3>Roaming-specific checks (jab tags aur VLANs theek hon)</h3>
<p>Agar client ka VLAN aur address same rehta hai lekin move karte waqt experience abhi bhi kharab hai, to issue sambhavtah RF ya client behaviour ka hai. Client detail view se serving AP ka RSSI check karo, client sticky hai ya nahi (concept), AP power aur channel plan (RF module), aur client aur WLAN par fast roaming support. 802.11r/k/v aur sticky behaviour lab mein demonstrate nahi ho sakte; unhe jaanne se aap real network mein precise recommendation de sakte ho.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Jab client ne VLAN badla tab RF analysis se shuru karna. (2) "Tags refresh karne" ke liye APs reboot karna. (3) Ek saath kai changes, jisse pata nahi chalta kaunse ne fix kiya. (4) Galat device par fix, jaise switch par VLAN banana jabki missing wala controller par hai. (5) After-proof na lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order matter karta hai: client facts, tags, policy profile, VLAN database, wired path. Policy profile theek dikhne par bhi fail ho sakta hai kyunki VLAN database mein missing hai.</p></div>

<div class="scn"><h4>Ek subah mein teen tickets</h4><p>Monday teen calls laata hai: (a) floor 2 ke users ko 10.10.41.x addresses mil rahe hain; (b) naye contractor wing ko koi address nahi mil raha; (c) guest SSID visible nahi hai. Engineer har client view kholta hai. (a) AP2 ko doosre policy tag mein dikhata hai, re-tag kiya. (b) VLAN_MISSING dikhata hai, VLAN banaya. (c) PP-GUEST DISABLED dikhata hai, enable kiya. Teen alag objects, teen one-line fixes, har ek client se prove kiya gaya.</p><p><b>Lesson:</b> "Wi-Fi kharab hai" ek hi shabd alag objects chhupa sakte hain. Evidence object chunta hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki jo wireless client address nahi paa raha uska troubleshoot kaise karte ho."</p><p>Main confirm karta hoon ki client SSID dekhta hai aur associate hota hai, phir padhta hoon ki kaunsa AP, policy tag, policy profile aur VLAN lagu hain. Main check karta hoon ki policy profile enabled hai, VLAN controller database mein exist karta hai aur trunk par allowed hai, aur R1 par SVI aur DHCP pool hai. Placement errors ke liye log padhta hoon. Ek object badalta hoon, phir client address aur ping se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain: client facts, AP tags, policy tag, policy profile, VLAN database, wired path.</li>
<li>Pehle sasti show commands; log padho.</li>
<li>Owner object fix karo aur ek time par ek cheez badlo.</li>
<li>Hamesha client se address, AP aur ping se prove karo.</li>
<li>Tags ke baad roaming quality RF aur client behaviour par depend karti hai.</li>
</ul></div>
`}};export{e as default};