var e={id:`push-workflow`,h:{en:`Attach and push: what the Manager does, config diff, NETCONF and rollback`,hi:`Attach aur push: Manager kya karta hai, config diff, NETCONF aur rollback`},body:{en:`
<p>Imagine sending an important parcel through a courier. The sender packs it, an inspector opens it and checks the contents against the order form, the courier delivers it, and the receiver signs. If the receiver refuses to sign, the parcel goes back. Attaching a template and pushing it to an edge follows the same steps: <b>prepare, inspect, deliver, sign, and return if refused</b>.</p>

<h3>The attach and push workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Template push pipeline">
<rect x="5" y="20" width="100" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="47" text-anchor="middle" class="svg-ink" font-size="12">1. Select</text><text x="55" y="65" text-anchor="middle" class="svg-muted" font-size="11">devices</text>
<rect x="115" y="20" width="100" height="60" rx="8" fill="#bae6fd"/><text x="165" y="47" text-anchor="middle" class="svg-ink" font-size="12">2. Variables</text><text x="165" y="65" text-anchor="middle" class="svg-muted" font-size="11">per device</text>
<rect x="225" y="20" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="275" y="47" text-anchor="middle" class="svg-ink" font-size="12">3. Preview</text><text x="275" y="65" text-anchor="middle" class="svg-muted" font-size="11">config + diff</text>
<rect x="335" y="20" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="385" y="47" text-anchor="middle" class="svg-ink" font-size="12">4. Push</text><text x="385" y="65" text-anchor="middle" class="svg-muted" font-size="11">NETCONF</text>
<rect x="445" y="20" width="90" height="60" rx="8" fill="#fde68a"/><text x="490" y="47" text-anchor="middle" class="svg-ink" font-size="12">5. Commit</text><text x="490" y="65" text-anchor="middle" class="svg-muted" font-size="11">on device</text>
<rect x="545" y="20" width="90" height="60" rx="8" fill="#fed7aa"/><text x="590" y="47" text-anchor="middle" class="svg-ink" font-size="12">6. Status</text><text x="590" y="65" text-anchor="middle" class="svg-muted" font-size="11">In Sync</text>
<rect x="5" y="105" width="630" height="55" rx="8" fill="#f1f5f9"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">If the device is unreachable or rejects a line, the task fails and the old config stays.</text><text x="320" y="148" text-anchor="middle" class="svg-muted" font-size="12">After a push that cuts the control connection, the device can roll back by itself.</text>
</svg><p class="cap">Six steps from selecting a device to a green status.</p></div>

<h4>Click path (device templates)</h4>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Templates</b> &gt; <b>Device Templates</b>.</li>
<li>Find your template, click the three dots at the end of the row and choose <b>Attach Devices</b>.</li>
<li>In the list of available devices (same model, valid, and with a hostname and system IP), select the edges and move them to the selected side. Click <b>Next</b>.</li>
<li>Fill the <b>variables</b> for each device, or click the import option to upload a CSV. Click <b>Next</b>.</li>
<li>Read the <b>Config Preview</b>. Switch to <b>Config Diff</b> to see only what will change. Click <b>Configure Devices</b> and confirm.</li>
<li>Watch the task view until every device shows <b>Success</b>.</li>
</ol>

<h3>What the Manager does at push time</h3>
<ol>
<li><b>Validates</b> the template and every variable. A missing variable stops the push before anything is sent.</li>
<li><b>Generates</b> the complete device configuration from the template and values.</li>
<li><b>Compares</b> it with the configuration the device currently runs. This comparison is the <b>config diff</b>. For IOS XE edges, the Manager sends only the difference.</li>
<li><b>Pushes</b> over <b>NETCONF</b> inside the control connection that is already up, so no management VPN or extra port is needed.</li>
<li>The device <b>commits</b> the change. A rejected line causes the whole transaction to fail, and the previous configuration stays in place.</li>
<li>The Manager records the pushed state and shows the device as <b>In Sync</b>. The device now runs in <b>Manager mode</b>: local configuration through <code>config-transaction</code> is blocked until you switch it back to CLI mode in the Manager.</li>
</ol>
<pre class="out">Task: Template attach      Device: E-BLR-1 (10.255.0.13)
[09:21:03] Validating template ........ Success
[09:21:04] Generating configuration from template ... Success
[09:21:06] Device is online
[09:21:07] Updating device configuration in Manager
[09:21:08] Pushing configuration to device
[09:21:11] <span class="hl">Template successfully attached to device</span></pre>

<h3>Reading a config diff</h3>
<p>The diff shows the new configuration next to the old, with removed lines and added lines marked. It is the best safety check you have. A typical diff after you change the LAN subnet in a template:</p>
<pre class="out">interface GigabitEthernet3
 vrf forwarding 10
<span class="hl">- ip address 10.3.10.1 255.255.255.0</span>
<span class="hl">+ ip address 10.3.20.1 255.255.255.0</span></pre>
<p>If you see lines you did not expect, such as a removed tunnel-interface, stop and read the template before pushing. A diff that shows a large block of removed lines usually means that the device had manual configuration that the template does not contain.</p>

<h3>Rollback and the safety net</h3>
<p>Two protections exist. First, a failed commit leaves the old configuration in place. Second, for IOS XE edges, if a push changes things so that the device can no longer reach the Manager, the device reverts to its previous configuration after a <b>rollback timer</b> expires (a few minutes by default; check the value for your release). That prevents a bad WAN change from stranding a remote branch.</p>
<p>To undo a successful change you have no magic undo button: you correct the template (or re-attach the previous version of your design) and push again, using the diff to confirm the old values return. Keep a record of what you changed (the audit log in the Manager shows who changed which template and when).</p>

<h3>Template status and "out of sync"</h3>
<p>In <b>Configuration</b> &gt; <b>Devices</b> the list shows each device with its template and a configuration status such as <b>In Sync</b>. A device becomes <b>Out of Sync</b> when its running configuration no longer matches what the Manager last pushed, for example because someone logged in and changed an interface in CLI mode. The fix is to decide which side is right. If the template is right, push it again, which removes the manual change. If the manual change is right, add it to the template first and then push.</p>

<div class="warn"><p><b>Common mistakes.</b> Pushing without reading the diff; changing a shared feature template and not checking how many devices will be updated; making emergency CLI changes and forgetting to put them in the template; and pushing a WAN change to a remote site during business hours without a console or out-of-band path.</p></div>
<div class="exam"><p><b>Exam trap.</b> The Manager pushes using NETCONF over the control connection. A device that was configured from a template is in Manager mode. "Out of sync" means the device differs from the last pushed configuration.</p></div>

<div class="scn"><h4>The subnet change that almost stranded Pune</h4><p>The engineer changed the WAN interface mask in a VPN 0 feature template and pushed it to 40 branches. The preview did not make the problem obvious, but the config diff for one branch showed the default route being removed. She cancelled the push, fixed the template, and pushed to a pilot branch first. A colleague who skipped the diff at another company had lost contact with 12 branches for an hour.</p><p><b>Lesson:</b> always read the config diff, and pilot on one device before a mass push.</p></div>

<div class="iv"><p class="q">"What happens when you push a template to a cEdge?"</p><p>Strong answer: the Manager validates the template and variables, generates the full configuration, compares it with the device's running configuration, and sends the difference over NETCONF through the control connection. The device commits; if a line is rejected the transaction fails and the old configuration remains. The device is then in Manager mode and shows In Sync. A rollback timer protects against changes that cut the Manager connection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: select devices, fill variables, preview and diff, push, commit, check status.</li>
<li>The Manager pushes the difference by NETCONF through the control connection.</li>
<li>Read the Config Diff before every push; pilot on one device first.</li>
<li>A failed commit keeps the old configuration; a rollback timer protects connectivity changes.</li>
<li>Out of Sync means the device differs from the last pushed configuration.</li>
</ul></div>
`,hi:`
<p>Kisi courier se important parcel bhejne ki kalpana karo. Sender use pack karta hai, inspector use kholkar order form se contents match karta hai, courier deliver karta hai, aur receiver sign karta hai. Agar receiver sign karne se mana kar de, to parcel wapas chala jaata hai. Edge par template attach karna aur push karna wahi steps follow karta hai: <b>taiyaar karo, inspect karo, deliver karo, sign karo, aur mana hone par wapas bhejo</b>.</p>

<h3>Attach aur push workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Template push pipeline">
<rect x="5" y="20" width="100" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="47" text-anchor="middle" class="svg-ink" font-size="12">1. Select</text><text x="55" y="65" text-anchor="middle" class="svg-muted" font-size="11">devices</text>
<rect x="115" y="20" width="100" height="60" rx="8" fill="#bae6fd"/><text x="165" y="47" text-anchor="middle" class="svg-ink" font-size="12">2. Variables</text><text x="165" y="65" text-anchor="middle" class="svg-muted" font-size="11">per device</text>
<rect x="225" y="20" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="275" y="47" text-anchor="middle" class="svg-ink" font-size="12">3. Preview</text><text x="275" y="65" text-anchor="middle" class="svg-muted" font-size="11">config + diff</text>
<rect x="335" y="20" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="385" y="47" text-anchor="middle" class="svg-ink" font-size="12">4. Push</text><text x="385" y="65" text-anchor="middle" class="svg-muted" font-size="11">NETCONF</text>
<rect x="445" y="20" width="90" height="60" rx="8" fill="#fde68a"/><text x="490" y="47" text-anchor="middle" class="svg-ink" font-size="12">5. Commit</text><text x="490" y="65" text-anchor="middle" class="svg-muted" font-size="11">device par</text>
<rect x="545" y="20" width="90" height="60" rx="8" fill="#fed7aa"/><text x="590" y="47" text-anchor="middle" class="svg-ink" font-size="12">6. Status</text><text x="590" y="65" text-anchor="middle" class="svg-muted" font-size="11">In Sync</text>
<rect x="5" y="105" width="630" height="55" rx="8" fill="#f1f5f9"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Device unreachable ho ya koi line reject ho to task fail hota hai aur purani config rehti hai.</text><text x="320" y="148" text-anchor="middle" class="svg-muted" font-size="12">Control connection kaatne wale push ke baad device khud rollback kar sakta hai.</text>
</svg><p class="cap">Device select karne se green status tak chhe steps.</p></div>

<h4>Click path (device templates)</h4>
<ol>
<li><b>Configuration</b> &gt; <b>Templates</b> &gt; <b>Device Templates</b> kholo.</li>
<li>Apna template dhoondho, row ke end ke teen dots click karo aur <b>Attach Devices</b> chuno.</li>
<li>Available devices ki list mein (same model, valid, aur hostname aur system IP ke saath) edges select karo aur selected side mein move karo. <b>Next</b> click karo.</li>
<li>Har device ke <b>variables</b> bharo, ya CSV upload karne ke liye import option click karo. <b>Next</b> click karo.</li>
<li><b>Config Preview</b> padho. Sirf jo badlega woh dekhne ke liye <b>Config Diff</b> par switch karo. <b>Configure Devices</b> click karke confirm karo.</li>
<li>Task view tab tak dekho jab tak har device <b>Success</b> na dikhaye.</li>
</ol>

<h3>Push time par Manager kya karta hai</h3>
<ol>
<li>Template aur har variable ko <b>validate</b> karta hai. Missing variable kuch bhejne se pehle push rok deta hai.</li>
<li>Template aur values se poori device configuration <b>generate</b> karta hai.</li>
<li>Use us configuration se <b>compare</b> karta hai jo device abhi chala raha hai. Yeh comparison <b>config diff</b> hai. IOS XE edges ke liye Manager sirf difference bhejta hai.</li>
<li>Jo control connection pehle se up hai usi ke andar <b>NETCONF</b> se <b>push</b> karta hai, isliye management VPN ya extra port ki zaroorat nahi.</li>
<li>Device change <b>commit</b> karta hai. Ek bhi line reject ho to poori transaction fail ho jaati hai, aur pichhli configuration jagah par rehti hai.</li>
<li>Manager pushed state record karta hai aur device ko <b>In Sync</b> dikhata hai. Device ab <b>Manager mode</b> mein chalta hai: <code>config-transaction</code> se local configuration tab tak blocked hai jab tak aap Manager mein use wapas CLI mode mein na kar do.</li>
</ol>
<pre class="out">Task: Template attach      Device: E-BLR-1 (10.255.0.13)
[09:21:03] Validating template ........ Success
[09:21:04] Generating configuration from template ... Success
[09:21:06] Device is online
[09:21:07] Updating device configuration in Manager
[09:21:08] Pushing configuration to device
[09:21:11] <span class="hl">Template successfully attached to device</span></pre>

<h3>Config diff padhna</h3>
<p>Diff nayi configuration ko purani ke bagal mein dikhata hai, removed aur added lines mark ke saath. Yeh aapka sabse achha safety check hai. Template mein LAN subnet badalne ke baad ek typical diff:</p>
<pre class="out">interface GigabitEthernet3
 vrf forwarding 10
<span class="hl">- ip address 10.3.10.1 255.255.255.0</span>
<span class="hl">+ ip address 10.3.20.1 255.255.255.0</span></pre>
<p>Agar aisi lines dikhein jinki aapne umeed nahi ki thi, jaise removed tunnel-interface, to ruk jao aur push se pehle template padho. Removed lines ka bada block aam taur par yeh batata hai ki device par manual configuration thi jo template mein nahi hai.</p>

<h3>Rollback aur safety net</h3>
<p>Do protections hain. Pehla, failed commit purani configuration ko jagah par chhod deta hai. Doosra, IOS XE edges ke liye, agar push kuch aisa badal de ki device Manager tak na pahunch sake, to <b>rollback timer</b> expire hone ke baad device apni pichhli configuration par wapas chala jaata hai (default mein kuch minute; apni release ke liye value check karo). Isse kharab WAN change remote branch ko stranded hone se bachata hai.</p>
<p>Successful change ko undo karne ka koi magic undo button nahi hai: aap template theek karte ho (ya apne design ka pichhla version dobara attach karte ho) aur dobara push karte ho, diff se confirm karte hue ki purani values wapas aa rahi hain. Record rakho ki aapne kya badla (Manager ka audit log dikhata hai kisne kaunsa template kab badla).</p>

<h3>Template status aur "out of sync"</h3>
<p><b>Configuration</b> &gt; <b>Devices</b> mein list har device ko uske template aur <b>In Sync</b> jaise configuration status ke saath dikhati hai. Device tab <b>Out of Sync</b> hota hai jab uski running configuration Manager ke aakhri push se match nahi karti, jaise koi login karke CLI mode mein interface badal de. Fix yeh hai ki tay karo kaunsa side sahi hai. Agar template sahi hai to use dobara push karo, jisse manual change hat jaata hai. Agar manual change sahi hai to pehle use template mein jodo aur phir push karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Diff padhe bina push karna; shared feature template badalna aur yeh na dekhna ki kitne devices update honge; emergency CLI changes karna aur unhe template mein daalna bhool jaana; aur business hours mein remote site par WAN change push karna bina console ya out-of-band path ke.</p></div>
<div class="exam"><p><b>Exam trap.</b> Manager NETCONF se control connection ke zariye push karta hai. Template se configure hua device Manager mode mein hota hai. "Out of sync" ka matlab device aakhri pushed configuration se alag hai.</p></div>

<div class="scn"><h4>Subnet change jisne Pune ko lagbhag stranded kar diya</h4><p>Engineer ne VPN 0 feature template mein WAN interface ka mask badla aur 40 branches par push kiya. Preview se problem saaf nahi dikhi, lekin ek branch ke config diff ne default route hatta hua dikhaya. Usne push cancel kiya, template theek kiya, aur pehle ek pilot branch par push kiya. Doosri company mein ek colleague ne diff skip kiya tha aur 12 branches se ek ghante tak contact kho diya tha.</p><p><b>Seekh:</b> config diff hamesha padho, aur mass push se pehle ek device par pilot karo.</p></div>

<div class="iv"><p class="q">"cEdge par template push karne par kya hota hai?"</p><p>Strong answer: Manager template aur variables validate karta hai, poori configuration generate karta hai, use device ki running configuration se compare karta hai, aur difference ko NETCONF se control connection ke zariye bhejta hai. Device commit karta hai; line reject ho to transaction fail hoti hai aur purani configuration rehti hai. Device phir Manager mode mein hota hai aur In Sync dikhta hai. Rollback timer un changes se bachata hai jo Manager connection kaat dein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: devices select, variables bharo, preview aur diff, push, commit, status check.</li>
<li>Manager difference ko NETCONF se control connection ke zariye push karta hai.</li>
<li>Har push se pehle Config Diff padho; pehle ek device par pilot karo.</li>
<li>Failed commit purani configuration rakhta hai; rollback timer connectivity changes ko bachata hai.</li>
<li>Out of Sync ka matlab device aakhri pushed configuration se alag hai.</li>
</ul></div>
`}};export{e as default};