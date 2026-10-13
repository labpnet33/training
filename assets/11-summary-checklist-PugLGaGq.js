var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a vague complaint and ended with a method. This chapter gathers everything you should be able to do, say and recall under exam or interview pressure.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Explain the five layers of a Wi-Fi session and say which show command tests each.</li>
<li>Use scope (one client, one AP, one SSID, everyone) to pick the layer.</li>
<li>State the broadcast rule: WLAN enabled, tag map present, policy profile enabled, radio serving.</li>
<li>Read <code>show ap tag summary</code>, policy profile detail, tag policy detail, client summary and <code>show aaa servers</code>.</li>
<li>Distinguish SERVER_TIMEOUT from AUTH_REJECT and know what each implies.</li>
<li>Apply the six steps: symptom, scope, evidence, one change, proof, record.</li>
<li>Roll out an AP: access port in VLAN 10, join, tags, radios, client acceptance.</li>
<li>Solve all three labs and write an incident record for each.</li>
<li>Describe change management: backup, rollback criteria, verify, <code>write memory</code>, document.</li>
<li>Name the concept-only tools: Radioactive Trace, packet capture, Catalyst Center Assurance, HA SSO, upgrades and ISSU.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module recap">
<rect x="8" y="20" width="150" height="110" rx="8" fill="#bae6fd"/><text x="83" y="45" text-anchor="middle" class="svg-ink" font-size="13">wl-ops-triage</text><text x="83" y="68" text-anchor="middle" class="svg-muted" font-size="11">map + enable</text><text x="83" y="86" text-anchor="middle" class="svg-muted" font-size="11">PP-VOICE, VLAN 30</text>
<rect x="175" y="20" width="150" height="110" rx="8" fill="#bbf7d0"/><text x="250" y="45" text-anchor="middle" class="svg-ink" font-size="13">wl-floor-expansion</text><text x="250" y="68" text-anchor="middle" class="svg-muted" font-size="11">Gi0/4 access 10</text><text x="250" y="86" text-anchor="middle" class="svg-muted" font-size="11">AP3 tag PT-CAMPUS</text>
<rect x="342" y="20" width="150" height="110" rx="8" fill="#fde68a"/><text x="417" y="45" text-anchor="middle" class="svg-ink" font-size="13">wl-capstone</text><text x="417" y="68" text-anchor="middle" class="svg-muted" font-size="11">AP2 tag, PP-CORP</text><text x="417" y="86" text-anchor="middle" class="svg-muted" font-size="11">RADIUS key</text>
<rect x="509" y="20" width="123" height="110" rx="8" fill="#e2e8f0"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">Always</text><text x="570" y="68" text-anchor="middle" class="svg-muted" font-size="11">evidence, prove,</text><text x="570" y="86" text-anchor="middle" class="svg-muted" font-size="11">write memory</text>
</svg><p class="cap">The three labs and the habits that bind them.</p></div>
<h3>Most-tested facts</h3>
<ul>
<li>New WLANs, policy profiles, RF profiles and tags start shut down or empty.</li>
<li>An AP without a tag uses default-policy-tag, which has no WLANs: Registered but serving nothing.</li>
<li>A WLAN must be shut down before its security is edited; a policy profile before its VLAN is changed.</li>
<li>The policy VLAN must exist in the controller VLAN database.</li>
<li>Radios stay off if the AP country is not in the controller wireless country list.</li>
<li>Option 43 hex <code>f104.0a0a.630a</code> points APs to 10.10.99.10.</li>
<li>Timeouts: address, port or secret. Reject: the server said no.</li>
<li><code>write memory</code> saves running to startup; it is not an off-box backup.</li>
<li>Prove with the original client plus a regression test and, for security, a negative test.</li>
</ul>
<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Purpose</th><th>Command</th></tr>
<tr><td>APs and state</td><td><code>show ap summary</code>, <code>show ap tag summary</code>, <code>show ap name AP2 config general</code></td></tr>
<tr><td>Radios</td><td><code>show ap dot11 24ghz summary</code>, <code>show ap dot11 5ghz summary</code>, <code>show ap rf-profile summary</code></td></tr>
<tr><td>Objects</td><td><code>show wlan summary</code>, <code>show wireless profile policy detailed PP-VOICE</code>, <code>show wireless tag policy detailed PT-CAMPUS</code></td></tr>
<tr><td>Clients</td><td><code>show wireless client summary</code>, <code>show wireless client mac-address &lt;mac&gt; detail</code></td></tr>
<tr><td>AAA and logs</td><td><code>show aaa servers</code>, <code>show radius server-group all</code>, <code>show logging</code></td></tr>
<tr><td>Network</td><td><code>show vlan brief</code>, <code>show interfaces trunk</code>, <code>show ip interface brief</code>, <code>ping</code></td></tr>
<tr><td>Fix AP tag</td><td><code>ap name AP3 policy-tag PT-CAMPUS</code></td></tr>
<tr><td>Fix AP port (SW1)</td><td><code>interface GigabitEthernet0/4</code>, <code>switchport mode access</code>, <code>switchport access vlan 10</code></td></tr>
<tr><td>Enable profile / map</td><td><code>wireless profile policy PP-VOICE</code> then <code>no shutdown</code>; <code>wireless tag policy PT-CAMPUS</code> then <code>wlan NK-VOICE policy PP-VOICE</code></td></tr>
<tr><td>RADIUS secret</td><td><code>radius server RAD1</code> then <code>key 0 NkRadius1</code></td></tr>
<tr><td>Save</td><td><code>write memory</code></td></tr>
</table>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Triage</dt><dd>Quick sorting of a problem by scope and urgency before deep investigation.</dd>
<dt>Baseline</dt><dd>A dated record of healthy outputs used for comparison.</dd>
<dt>Policy tag</dt><dd>Maps WLAN profiles to policy profiles for every AP that carries it.</dd>
<dt>Tag source</dt><dd>Static means assigned; Default means the AP uses default tags.</dd>
<dt>Regression test</dt><dd>Re-testing what worked before to make sure the change broke nothing.</dd>
<dt>Negative test</dt><dd>A test that must fail, such as a wrong password or guest access to servers.</dd>
<dt>Rollback</dt><dd>The planned reverse of a change when verification fails.</dd>
<dt>Radioactive Trace</dt><dd>Real 9800 per-client trace tool; not simulated in the lab.</dd>
<dt>HA SSO</dt><dd>Stateful switchover between paired controllers; concept only here.</dd>
</dl>
<div class="warn"><p><b>Final reminders.</b> Never skip evidence, never stack changes, never close without proof and a saved configuration.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question asks for the best <i>first</i> action, choose scoping and evidence; if it asks for the best <i>fix</i>, choose the smallest change on the owning object.</p></div>
<div class="scn"><h4>Handover at shift change</h4><p>A night engineer handed an open incident to the morning team with the ticket holding the symptom, scope, five outputs, one change already made and the next test. The morning engineer finished in five minutes. Without that note the same work would have started over.</p><p><b>Lesson:</b> the record is part of the fix.</p></div>
<div class="iv"><p class="q">"Summarise your wireless troubleshooting approach in one minute."</p><p>Scope the symptom, test layers from client to AAA with read-only show commands, name one cause, make the smallest change on the owning object, prove with the original client plus regression and negative tests, save the configuration and record the incident. Add that new rollouts follow port, join, tags, radios and acceptance.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method beats speed: scope, evidence, one change, proof, record.</li>
<li>Know the objects and their default states.</li>
<li>Know the three lab fixes and why they work.</li>
<li>Protect changes with backups, rollback criteria and write memory.</li>
<li>Be honest about which tools are concept only.</li>
</ul></div>
`,hi:`
<p>Aapne is module ki shuruaat ek dhundhli complaint se ki aur ant ek method par kiya. Yeh chapter woh sab ikattha karta hai jo aapko exam ya interview ke dabav mein kar paana, bol paana aur yaad rakhna chahiye.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Wi-Fi session ki paanch layers samjhao aur batao har ek ko kaunsa show command test karta hai.</li>
<li>Scope (ek client, ek AP, ek SSID, sab) se layer chuno.</li>
<li>Broadcast rule bolo: WLAN enabled, tag map present, policy profile enabled, radio serving.</li>
<li><code>show ap tag summary</code>, policy profile detail, tag policy detail, client summary aur <code>show aaa servers</code> padho.</li>
<li>SERVER_TIMEOUT aur AUTH_REJECT mein fark karo aur jaano har ek ka matlab.</li>
<li>Chhe steps lagao: symptom, scope, evidence, ek change, proof, record.</li>
<li>AP roll out karo: VLAN 10 mein access port, join, tags, radios, client acceptance.</li>
<li>Teeno labs solve karo aur har ek ka incident record likho.</li>
<li>Change management samjhao: backup, rollback criteria, verify, <code>write memory</code>, document.</li>
<li>Concept-only tools ke naam batao: Radioactive Trace, packet capture, Catalyst Center Assurance, HA SSO, upgrades aur ISSU.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module recap">
<rect x="8" y="20" width="150" height="110" rx="8" fill="#bae6fd"/><text x="83" y="45" text-anchor="middle" class="svg-ink" font-size="13">wl-ops-triage</text><text x="83" y="68" text-anchor="middle" class="svg-muted" font-size="11">map + enable</text><text x="83" y="86" text-anchor="middle" class="svg-muted" font-size="11">PP-VOICE, VLAN 30</text>
<rect x="175" y="20" width="150" height="110" rx="8" fill="#bbf7d0"/><text x="250" y="45" text-anchor="middle" class="svg-ink" font-size="13">wl-floor-expansion</text><text x="250" y="68" text-anchor="middle" class="svg-muted" font-size="11">Gi0/4 access 10</text><text x="250" y="86" text-anchor="middle" class="svg-muted" font-size="11">AP3 tag PT-CAMPUS</text>
<rect x="342" y="20" width="150" height="110" rx="8" fill="#fde68a"/><text x="417" y="45" text-anchor="middle" class="svg-ink" font-size="13">wl-capstone</text><text x="417" y="68" text-anchor="middle" class="svg-muted" font-size="11">AP2 tag, PP-CORP</text><text x="417" y="86" text-anchor="middle" class="svg-muted" font-size="11">RADIUS key</text>
<rect x="509" y="20" width="123" height="110" rx="8" fill="#e2e8f0"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">Hamesha</text><text x="570" y="68" text-anchor="middle" class="svg-muted" font-size="11">evidence, prove,</text><text x="570" y="86" text-anchor="middle" class="svg-muted" font-size="11">write memory</text>
</svg><p class="cap">Teen labs aur woh aadatein jo unhe bandhti hain.</p></div>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Naye WLANs, policy profiles, RF profiles aur tags shut down ya khaali start hote hain.</li>
<li>Bina tag wala AP default-policy-tag use karta hai jisme koi WLAN nahi: Registered lekin kuch serve nahi karta.</li>
<li>WLAN ki security edit karne se pehle use shut down karna padta hai; policy profile ka VLAN badalne se pehle policy profile.</li>
<li>Policy VLAN controller VLAN database mein hona chahiye.</li>
<li>AP country controller wireless country list mein na ho to radios off rehte hain.</li>
<li>Option 43 hex <code>f104.0a0a.630a</code> APs ko 10.10.99.10 ki taraf point karta hai.</li>
<li>Timeouts: address, port ya secret. Reject: server ne mana kiya.</li>
<li><code>write memory</code> running ko startup mein save karta hai; yeh off-box backup nahi hai.</li>
<li>Original client ke saath regression test aur, security ke liye, negative test se prove karo.</li>
</ul>
<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Purpose</th><th>Command</th></tr>
<tr><td>APs aur state</td><td><code>show ap summary</code>, <code>show ap tag summary</code>, <code>show ap name AP2 config general</code></td></tr>
<tr><td>Radios</td><td><code>show ap dot11 24ghz summary</code>, <code>show ap dot11 5ghz summary</code>, <code>show ap rf-profile summary</code></td></tr>
<tr><td>Objects</td><td><code>show wlan summary</code>, <code>show wireless profile policy detailed PP-VOICE</code>, <code>show wireless tag policy detailed PT-CAMPUS</code></td></tr>
<tr><td>Clients</td><td><code>show wireless client summary</code>, <code>show wireless client mac-address &lt;mac&gt; detail</code></td></tr>
<tr><td>AAA aur logs</td><td><code>show aaa servers</code>, <code>show radius server-group all</code>, <code>show logging</code></td></tr>
<tr><td>Network</td><td><code>show vlan brief</code>, <code>show interfaces trunk</code>, <code>show ip interface brief</code>, <code>ping</code></td></tr>
<tr><td>AP tag fix</td><td><code>ap name AP3 policy-tag PT-CAMPUS</code></td></tr>
<tr><td>AP port fix (SW1)</td><td><code>interface GigabitEthernet0/4</code>, <code>switchport mode access</code>, <code>switchport access vlan 10</code></td></tr>
<tr><td>Profile / map enable</td><td><code>wireless profile policy PP-VOICE</code> phir <code>no shutdown</code>; <code>wireless tag policy PT-CAMPUS</code> phir <code>wlan NK-VOICE policy PP-VOICE</code></td></tr>
<tr><td>RADIUS secret</td><td><code>radius server RAD1</code> phir <code>key 0 NkRadius1</code></td></tr>
<tr><td>Save</td><td><code>write memory</code></td></tr>
</table>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>Triage</dt><dd>Deep investigation se pehle scope aur urgency se problem ki jaldi sorting.</dd>
<dt>Baseline</dt><dd>Comparison ke liye use hone wale healthy outputs ka dated record.</dd>
<dt>Policy tag</dt><dd>Use carry karne wale har AP ke liye WLAN profiles ko policy profiles se map karta hai.</dd>
<dt>Tag source</dt><dd>Static matlab assigned; Default matlab AP default tags use karta hai.</dd>
<dt>Regression test</dt><dd>Jo pehle chalta tha use dobara test karna taaki pata chale change ne kuch toda nahi.</dd>
<dt>Negative test</dt><dd>Aisa test jo fail hona chahiye, jaise galat password ya guest ka servers tak access.</dd>
<dt>Rollback</dt><dd>Verification fail hone par change ka planned ulta.</dd>
<dt>Radioactive Trace</dt><dd>Real 9800 ka per-client trace tool; lab mein simulated nahi.</dd>
<dt>HA SSO</dt><dd>Paired controllers ke beech stateful switchover; yahan sirf concept.</dd>
</dl>
<div class="warn"><p><b>Aakhri reminders.</b> Evidence kabhi skip mat karo, changes stack mat karo, proof aur saved configuration ke bina close mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar sawal best <i>pehli</i> action poochhe to scoping aur evidence chuno; agar best <i>fix</i> poochhe to owning object par sabse chhota change chuno.</p></div>
<div class="scn"><h4>Shift change par handover</h4><p>Night engineer ne open incident morning team ko aise handover kiya: ticket mein symptom, scope, paanch outputs, ek change jo ho chuka tha aur agla test. Morning engineer ne paanch minute mein khatam kar diya. Us note ke bina wahi kaam shuru se hota.</p><p><b>Seekh:</b> record fix ka hissa hai.</p></div>
<div class="iv"><p class="q">"Apna wireless troubleshooting approach ek minute mein batao."</p><p>Symptom scope karo, client se AAA tak read-only show commands se layers test karo, ek cause naam do, owning object par sabse chhota change karo, original client ke saath regression aur negative tests se prove karo, configuration save karo aur incident record karo. Jodo ki naye rollouts port, join, tags, radios aur acceptance follow karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method speed se behtar: scope, evidence, ek change, proof, record.</li>
<li>Objects aur unki default states jaano.</li>
<li>Teen lab fixes aur woh kyun kaam karte hain jaano.</li>
<li>Backups, rollback criteria aur write memory se changes ko protect karo.</li>
<li>Honest raho ki kaunse tools sirf concept hain.</li>
</ul></div>
`}};export{e as default};